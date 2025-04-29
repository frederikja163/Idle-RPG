const t = {t: 'test'};

export const items = new Map<string, Item>();

ore('Talc');
ore('Gypsum');
ore('Calcite');
ore('Flourite');
ore('Apatite');
wood('Balsa');
wood('Pine');
wood('Cedar');
wood('Cherry');
wood('Oak');

function ore(name: string) {
  const id = name.toLowerCase();
  addItem(`${id}_ore`, `${name} ore`, ItemTag.Resource);
  addItem(`${id}_pickaxe_head`, `${name} pickaxe head`, ItemTag.Tool);
  addItem(`${id}_axe_head`, `${name} axe head`, ItemTag.Tool);
}

function wood(name: string) {
  const id = name.toLowerCase();
  addItem(`${id}_log`, `${name} log`, ItemTag.Resource);
  addItem(`${id}_toolhandle`, `${name} toolhandle`, ItemTag.Tool);
}

function addItem(id: string, display: string, ...tags: ItemTag[]) {
  items.set(id, {id, display, tags});
}

export enum ItemTag {
  Resource,
  Tool
}

export type Item = {
  id: string;
  display: string;
  tags: ItemTag[];
};

export type ItemType = keyof typeof items;
