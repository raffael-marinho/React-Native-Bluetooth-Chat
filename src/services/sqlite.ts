// src/services/sqlite.ts
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export type Message = {
  id: number; // obrigatório
  sender: "me" | "other";
  text: string;
  timestamp: number;
};


let db: any = null; // <- sem usar SQLiteDatabase

export async function initDB(): Promise<void> {
  if (db) return;
  db = await SQLite.openDatabase({ name: 'blink.db', location: 'default' });
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId TEXT NOT NULL,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );`
  );
}

export async function saveMessage(deviceId: string, sender: 'me' | 'other', text: string): Promise<void> {
  if (!db) await initDB();
  const timestamp = Date.now();
  await db.executeSql(
    `INSERT INTO messages (deviceId, sender, text, timestamp) VALUES (?, ?, ?, ?);`,
    [deviceId, sender, text, timestamp]
  );
}

export async function getMessages(deviceId: string): Promise<Message[]> {
  if (!db) await initDB();
  const results = await db.executeSql(
    `SELECT * FROM messages WHERE deviceId = ? ORDER BY timestamp ASC;`,
    [deviceId]
  );

  const messages: Message[] = [];
  results.forEach((result: any) => {
    const rows = result.rows;
    for (let i = 0; i < rows.length; i++) {
      messages.push(rows.item(i));
    }
  });

  return messages;
}

export async function clearMessages(): Promise<void> {
  if (!db) await initDB();
  await db.executeSql(`DELETE FROM messages;`);
}
