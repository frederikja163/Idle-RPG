export class Table<TCol, TRow, TValue> {
  private readonly map = new Map<TCol, Map<TRow, TValue>>();

  public add(col: TCol, row: TRow, value: TValue) {
    let column = this.map.get(col);
    if (!column) {
      column = new Map<TRow, TValue>();
      this.map.set(col, column);
    }
    column.set(row, value);
  }

  public deleteCell(col: TCol, row: TRow) {
    const column = this.map.get(col);
    if (!column) return;

    column.delete(row);
    if (column.size === 0) this.map.delete(col);
  }

  public hasColumn(col: TCol) {
    return this.map.has(col);
  }

  public hasCell(col: TCol, row: TRow) {
    const column = this.map.get(col);
    return column && column.has(row);
  }

  public getCells(): IteratorObject<[TCol, TRow, TValue]> {
    return this.map.entries().flatMap(([col, row]) => row.entries().map(([row, cell]) => [col, row, cell]));
  }

  public getCell(col: TCol, row: TRow) {
    return this.map.get(col)?.get(row);
  }

  public getColumns() {
    return this.map.keys();
  }

  public getColumn(col: TCol) {
    return this.map.get(col)?.entries();
  }
}
