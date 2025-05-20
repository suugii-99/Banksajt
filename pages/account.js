import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Account() {
  const router = useRouter();
  const { token, userId } = router.query;

  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !userId) return;

    async function fetchBalance() {
      setMessage('');
      try {
        const response = await fetch('http://localhost:3001/me/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, userId: Number(userId) }),
        });
        const data = await response.json();

        if (response.ok) {
          setBalance(data.amount);
        } else {
          setMessage(data.error || 'Kunde inte hämta saldo');
        }
      } catch {
        setMessage('Fel vid nätverksanrop');
      }
    }

    fetchBalance();
  }, [token, userId]);

  async function handleDeposit(e) {
    e.preventDefault();
    setMessage('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setMessage('Ange ett giltigt belopp');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/accounts/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, amount: amountInt }),
      });
      const data = await response.json();

      if (response.ok) {
        setBalance(data.newBalance);
        setMessage('Insättning lyckades!');
        setAmount('');
      } else {
        setMessage(data.error || 'Insättning misslyckades');
      }
    } catch {
      setMessage('Fel vid nätverksanrop');
    }
  }

  return (
    <div style={formStyles.container}>
      <h1>Ditt konto</h1>
      {balance !== null ? (
        <p style={formStyles.balance}>Saldo: {balance} kr</p>
      ) : (
        <p>Laddar saldo...</p>
      )}

      <form onSubmit={handleDeposit}>
        <input
          style={formStyles.input}
          type="number"
          placeholder="Belopp att sätta in"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
          required
        />
        <button style={formStyles.button} type="submit">Sätt in pengar</button>
      </form>

      {message && (
        <p style={message.includes('lyckades') ? formStyles.messageSuccess : formStyles.messageError}>
          {message}
        </p>
      )}
    </div>
  );
}

const formStyles = {
  container: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  balance: {
    fontSize: '20px',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0070f3',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  messageSuccess: {
    color: 'green',
    marginTop: '15px',
  },
  messageError: {
    color: 'red',
    marginTop: '15px',
  },
};
