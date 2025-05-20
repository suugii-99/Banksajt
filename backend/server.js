import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Arrayer
const users = [];
const accounts = [];
const sessions = [];

// Generera engångslösenord
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// Skapa användare
app.post('/users', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Användarnamn och lösenord krävs' });
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Användarnamn finns redan' });
  }

  const id = users.length ? users[users.length - 1].id + 1 : 101;
  users.push({ id, username, password });
  accounts.push({ id: accounts.length + 1, userId: id, amount: 0 });

  res.json({ message: 'Användare skapad', userId: id });
});

// Logga in och skapa session (engångslösenord)
app.post('/sessions', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Fel användarnamn eller lösenord' });
  }

  // Skapa engångslösenord
  const token = generateOTP();

  // Lägg till session (uppdatera om redan finns)
  const existingSessionIndex = sessions.findIndex(s => s.userId === user.id);
  if (existingSessionIndex >= 0) {
    sessions[existingSessionIndex].token = token;
  } else {
    sessions.push({ userId: user.id, token });
  }

  res.json({ token, userId: user.id });
});

// Visa saldo
app.post('/me/accounts', (req, res) => {
  const { token, userId } = req.body;

  const session = sessions.find(s => s.userId === userId && s.token === token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const account = accounts.find(a => a.userId === userId);
  if (!account) {
    return res.status(404).json({ error: 'Konto hittades inte' });
  }

  res.json({ amount: account.amount });
});

// Sätt in pengar
app.post('/me/accounts/transactions', (req, res) => {
  const { token, userId, amount } = req.body;

  const session = sessions.find(s => s.userId === userId && s.token === token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const account = accounts.find(a => a.userId === userId);
  if (!account) {
    return res.status(404).json({ error: 'Konto hittades inte' });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Felaktigt belopp' });
  }

  account.amount += amount;
  res.json({ newBalance: account.amount });
});

// Starta server
app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
