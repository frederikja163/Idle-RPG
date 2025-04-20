import { Database as Sqlite, type SQLQueryBindings } from "bun:sqlite";
import { addCommand } from "./commands";

class Database {
  private readonly _db: Sqlite;

  constructor() {
    if (process.env.NODE_ENV === "production") {
      this._db = new Sqlite("database.sqlite");
      // TODO: Create migration steps here between versions.
    } else {
      this._db = new Sqlite(":memory:");
    }
    this.initDb();
    addCommand("sql", "Run an sql query.", this.sqlCommand.bind(this));
  }

  private sqlCommand(args: string[]) {
    // This potentially allows for sql injections or unsafe patterns in the future.
    // But for now this is only used for the CLI, the users of which already have access to the machine.
    // So it should be safe to allow direct SQL queries.
    const sql = args.slice(1).join(" ");
    console.log(sql);
    const result = this._db.prepare(sql).all();
    console.log(result);
  }

  public insert<T1 extends keyof Table>(table: T1, row: Partial<Table[T1]>) {
    const keys: string[] = [];
    const values: SQLQueryBindings[] = [];
    for (const key in row) {
      keys.push(key);
      values.push(row[key] as SQLQueryBindings);
    }
    const placeholders = values.map((_) => "?").join(", ");
    const sql = `INSERT INTO ${table} (${keys.join(
      ", "
    )}) VALUES (${placeholders})`;
    console.log(sql);
    console.log(...keys, ...values);
    this._db.prepare(sql).run(...values);
  }

  private initDb() {
    // this._db.transaction(() => {
    this._db.exec(
      `
        CREATE TABLE IF NOT EXISTS users(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          google_id TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL COLLATE NOCASE,
          profile_picture TEXT,
          first_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_login  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
  
        CREATE UNIQUE INDEX IF NOT EXISTS idx_google_id ON users (google_id);
        CREATE INDEX IF NOT EXISTS idx_email ON users (email);
      `
    );
    // });
  }
}

export const database = new Database();

export type User = {
  id: number;
  googleId: string;
  email: string;
  profilePicture: string | null;
  firstLogin: string;
  lastLogin: string | null;
};

export type Table = {
  users: User;
};
