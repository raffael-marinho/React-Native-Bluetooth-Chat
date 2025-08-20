import * as SQLite from "react-native-sqlite-storage";

SQLite.enablePromise(true);

const db = SQLite.openDatabase({ name: "blink.db", location: "default" });

export type Message = {
  id: number;
  deviceId: string;
  sender: "me" | "other";
  text: string;
  timestamp: number;
};

// Tipagem local para a transação
type Tx = {
  executeSql: (
    sql: string,
    params?: any[],
    success?: (tx: Tx, result: { rows: { _array: any[] } }) => void,
    error?: (tx: Tx, err: any) => void
  ) => void;
};

// Inicializa o banco
export function initDB() {
  db.transaction((tx: Tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceId TEXT,
        sender TEXT,
        text TEXT,
        timestamp INTEGER
      );`
    );
  });
}

// Salva uma mensagem
export function saveMessage(deviceId: string, sender: "me" | "other", text: string) {
  const timestamp = Date.now();
  db.transaction((tx: Tx) => {
    tx.executeSql(
      "INSERT INTO messages (deviceId, sender, text, timestamp) VALUES (?, ?, ?, ?);",
      [deviceId, sender, text, timestamp]
    );
  });
}

// Busca mensagens por dispositivo
export function getMessages(
  deviceId: string,
  callback: (msgs: Message[]) => void
) {
  db.transaction((tx: Tx) => {
    tx.executeSql(
      "SELECT * FROM messages WHERE deviceId = ? ORDER BY timestamp ASC;",
      [deviceId],
      (_, result) => {
        const msgs = result.rows._array as Message[];
        callback(msgs);
      }
    );
  });
}
