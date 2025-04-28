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
  addItem(`${id}_ore`, `${name} ore`);
  addItem(`${id}_pickaxe_head`, `${name} pickaxe head`);
  addItem(`${id}_axe_head`, `${name} axe head`);
}

function wood(name: string) {
  const id = name.toLowerCase();
  addItem(`${id}_log`, `${name} log`);
  addItem(`${id}_toolhandle`, `${name} toolhandle`);
}

function addItem(id: string, display: string) {
  items.set(id, {id, display});
}

export type Item = {
  id: string;
  display: string;
};

export type ItemType = keyof typeof items;
