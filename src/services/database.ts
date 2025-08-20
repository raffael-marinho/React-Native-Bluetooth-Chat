import SQLite from 'react-native-sqlite-storage';

// Habilita debug (opcional)
SQLite.enablePromise(true);

// Abre/cria banco
const db = SQLite.openDatabase({ name: 'blink.db', location: 'default' });

/** Inicializa DB e cria tabela se não existir */
export async function initDB() {
  try {
    const database = await db;
    await database.executeSql(
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceId TEXT,
        sender TEXT,
        text TEXT,
        timestamp INTEGER
      );`
    );
    console.log('Banco inicializado');
  } catch (err) {
    console.error('Erro ao inicializar DB', err);
  }
}

/** Salva uma mensagem */
export async function saveMessage(
  deviceId: string,
  sender: 'me' | 'other',
  text: string
) {
  const timestamp = Date.now();
  try {
    const database = await db;
    await database.executeSql(
      `INSERT INTO messages (deviceId, sender, text, timestamp) VALUES (?, ?, ?, ?);`,
      [deviceId, sender, text, timestamp]
    );
  } catch (err) {
    console.error('Erro ao salvar mensagem', err);
  }
}

/** Busca histórico por dispositivo */
export async function getMessages(
  deviceId: string,
  callback: (msgs: { id: number; sender: 'me' | 'other'; text: string; timestamp: number }[]) => void
) {
  try {
    const database = await db;
    const [results] = await database.executeSql(
      `SELECT * FROM messages WHERE deviceId = ? ORDER BY timestamp ASC;`,
      [deviceId]
    );

    const msgs: { id: number; sender: 'me' | 'other'; text: string; timestamp: number }[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      msgs.push(results.rows.item(i));
    }
    callback(msgs);
  } catch (err) {
    console.error('Erro ao buscar mensagens', err);
    callback([]);
  }
}
