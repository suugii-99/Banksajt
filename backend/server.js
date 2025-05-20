import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Skapa eller öppna SQLite-databasen
const db = new Database('bank.db');

// Skapa tabeller om de inte finns
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
);
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  amount INTEGER,
  FOREIGN KEY (userId) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS sessions (
  userId INTEGER,
  token TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
);
`);

// Generera OTP
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// POST /users - skapa användare
app.post('/users', (req, res) => {
  const { username, password } = req.body;
  try {
    const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const result = insertUser.run(username, password);
    const userId = result.lastInsertRowid;
    const insertAccount = db.prepare('INSERT INTO accounts (userId, amount) VALUES (?, ?)');
    insertAccount.run(userId, 0);
    res.json({ message: 'User created', userId });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// POST /sessions - logga in och skapa session token
app.post('/sessions', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = generateOTP();
  // Ta bort gammal session för användaren
  db.prepare('DELETE FROM sessions WHERE userId = ?').run(user.id);
  // Spara ny token
  db.prepare('INSERT INTO sessions (userId, token) VALUES (?, ?)').run(user.id, token);
  res.json({ token });
});

// POST /me/accounts - visa saldo (kräver token)
app.post('/me/accounts', (req, res) => {
  const { token } = req.body;
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const account = db.prepare('SELECT * FROM accounts WHERE userId = ?').get(session.userId);
  res.json({ amount: account.amount });
});

// POST /me/accounts/transactions - sätt in pengar (kräver token och amount)
app.post('/me/accounts/transactions', (req, res) => {
  const { token, amount } = req.body;
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  const updateAccount = db.prepare('UPDATE accounts SET amount = amount + ? WHERE userId = ?');
  updateAccount.run(amount, session.userId);
  const account = db.prepare('SELECT * FROM accounts WHERE userId = ?').get(session.userId);
  res.json({ message: 'Deposit successful', amount: account.amount });
});

app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
