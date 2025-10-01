export type Func = (x: number) => number;
export type FuncReplace<T> = {
  [K in keyof T]: T[K] extends number ? Func : T[K];
};

export function resolveFuncs<T>(funcs: FuncReplace<T>, x: number): T {
  const result = {} as T;
  for (const key in funcs) {
    result[key] = typeof funcs[key] == 'function' ? funcs[key](x) : funcs[key];
  }
  return result;
}

export function constant(constant: number): Func {
  return (_: number) => constant;
}
export const zero = constant(0);

export function linear(base: number, step: number): Func {
  return (x: number) => base + step * x;
}

export function exponential(base: number, factor: number): Func {
  return (x: number) => base * Math.pow(factor, x);
}

export function polynomial(base: number, degree: number, multiplier: number = 1): Func {
  return (x: number) => base + multiplier * Math.pow(x, degree);
}

export function logarithm(base: number, multiplier: number = 1): Func {
  return (x: number) => base + multiplier * Math.log2(x + 1);
}

export function clamp(func: Func, min: number, max: number): Func {
  return (x: number) => Math.min(Math.max(func(x), min), max);
}
