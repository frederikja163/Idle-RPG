import { Database as Sqlite } from "bun:sqlite";

class Database {
  private readonly _db: Sqlite;

  constructor() {
    if (process.env.NODE_ENV === "production") {
      this._db = new Sqlite("database.sqlite");
      // TODO: Create migration steps here between versions.
    } else {
      this._db = new Sqlite(":memory:");
    }
  }
}

export const database = new Database();

function setupDb(db: Sqlite) {}
