import { clientServerEvent } from '@/shared/socket/socket.events';
import { type CredentialResponse, GoogleLogin } from '@react-oauth/google';
import {
  type TEnum,
  type TLiteral,
  type TNumber,
  type TObject,
  type TProperties,
  type TSchema,
  type TString,
  type TUnion,
  TypeGuard,
} from '@sinclair/typebox';
import { type ChangeEvent, type ReactNode, useEffect, useState } from 'react';
import { Row } from '../layout/row';
import { useSocket } from '@/front-end/state/socket-provider.tsx';

export function Test() {
  const socket = useSocket();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    socket?.on('Auth/LoginSuccess', () => setLoggedIn(true));
  }, [socket]);

  const handleSuccess = (r: CredentialResponse) => {
    socket?.send('Auth/GoogleLogin', { token: r.credential! });
  };

  const send = (form: FormData) => {
    const data = formDiscriminatedUnion('event', form, clientServerEvent);
    socket?.send(data.type as any, data.data);
  };

  return (
    <>
      <h1>Testing</h1>
      {loggedIn ? null : <GoogleLogin onSuccess={handleSuccess} />}
      <form action={send}>
        <button type="submit">Send</button>
        <DiscriminatedUnionInput path="event" object={clientServerEvent}></DiscriminatedUnionInput>
      </form>
    </>
  );
}

interface InputProps<T extends TSchema> {
  path: string;
  object: T;
}

type DiscriminatedUnionType = TUnion<TObject<{ type: TLiteral; data: TObject }>[]>;

function DiscriminatedUnionInput({ path, object: union }: InputProps<DiscriminatedUnionType>) {
  const [options, setOptions] = useState<ReactNode>([]);
  const [data, setData] = useState<ReactNode | null>(null);

  useEffect(() => {
    const options = [];
    for (const obj of union.anyOf) {
      const prop = obj.properties;
      const type = String(prop.type.const);
      options.push(<option key={type}>{type}</option>);
    }
    setOptions(options);
  }, []);

  const onChange = (ev: ChangeEvent<HTMLSelectElement>) => {
    const type = ev.target.value;
    const data = union.anyOf.find((o) => type === o.properties.type.const)?.properties.data;
    setData(<SchemaInput path={`${path}.data`} object={data!} />);
  };

  return (
    <>
      <select name={`${path}.type`} onChange={(ev) => onChange(ev)}>
        {options}
      </select>
      <br />
      {data}
    </>
  );
}

function formDiscriminatedUnion(path: string, form: FormData, union: DiscriminatedUnionType) {
  const type = String(form.get(`${path}.type`));
  const dataSchema = union.anyOf.find((o) => type == String(o.properties.type.const))?.properties.data;
  const data = formSchema(`${path}.data`, form, dataSchema!);
  return { type, data };
}

function SchemaInput<T extends TSchema>({ path, object: schema }: InputProps<T>) {
  if (TypeGuard.IsObject(schema)) {
    return <ObjectInput path={path} object={schema} />;
  } else if (TypeGuard.IsNumber(schema)) {
    return <NumberInput path={path} object={schema} />;
  } else if (TypeGuard.IsString(schema)) {
    return <StringInput path={path} object={schema} />;
  }
  return (
    <>
      <p>Object type not found</p>
    </>
  );
}

function formSchema<T extends TSchema>(path: string, form: FormData, schema: T) {
  if (TypeGuard.IsObject(schema)) {
    return formObject(path, form, schema);
  } else if (TypeGuard.IsNumber(schema)) {
    return formNumber(path, form, schema);
  } else if (TypeGuard.IsString(schema)) {
    return formString(path, form, schema);
  } else {
    console.log('Object type not found.');
  }
}

function ObjectInput<T extends TProperties>({ path, object }: InputProps<TObject<T>>) {
  const [props, setProps] = useState<ReactNode[]>([]);
  useEffect(() => {
    const propsComp = [];
    const props = object.properties;
    for (const propName in props) {
      const prop = props[propName];
      propsComp.push(
        <Row key={propName}>
          <label>{propName}</label>
          <SchemaInput path={`${path}.${propName}`} object={prop}></SchemaInput>
        </Row>,
      );
    }
    setProps(propsComp);
  }, [object]);
  return props;
}

function formObject<T extends TProperties>(path: string, form: FormData, object: TObject<TProperties>) {
  const props = object.properties;
  const obj: any = {};
  for (const propName in props) {
    const prop = props[propName];
    obj[propName] = formSchema(`${path}.${propName}`, form, prop);
  }
  return obj;
}

function EnumInput({ path, object: enm }: InputProps<TEnum>) {
  const [options, setOptions] = useState<ReactNode>([]);
  useEffect(() => {
    const options = [];
    for (const obj of enm.anyOf) {
      const prop = obj.properties;
      const type = String(prop.type.const);
      options.push(<option key={type}>{type}</option>);
    }
    setOptions(options);
  }, []);

  return <select name={path}>{options}</select>;
}

function formEnum(path: string, form: FormData, enm: TEnum) {
  return form.get(path);
}

function NumberInput({ path, object: num }: InputProps<TNumber>) {
  return <input name={path} type="number" />;
}

function formNumber(path: string, form: FormData, num: TNumber) {
  return parseInt(String(form.get(path)));
}

function StringInput({ path, object: str }: InputProps<TString>) {
  return <input name={path} type="text" />;
}

function formString(path: string, form: FormData, str: TString) {
  return form.get(path);
}
