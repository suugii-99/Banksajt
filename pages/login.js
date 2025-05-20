import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Anta att data.token innehåller engångslösenordet
        setMessage('Inloggning lyckades! Du skickas vidare...');
        
        // Skicka token med i query (eller spara i state/context om du har det)
        setTimeout(() => {
          router.push({
            pathname: '/account',
            query: { token: data.token, userId: data.userId } // anpassa efter backend
          });
        }, 1500);
      } else {
        setMessage(data.error || 'Felaktigt användarnamn eller lösenord');
      }
    } catch (error) {
      setMessage('Fel vid nätverksanrop');
    }
  }

  return (
    <div style={formStyles.container}>
      <h1>Logga in</h1>
      <form onSubmit={handleSubmit}>
        <input
          style={formStyles.input}
          placeholder="Användarnamn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          style={formStyles.input}
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={formStyles.button} type="submit">Logga in</button>
      </form>
      {message && (
        <p style={message.includes('fel') ? formStyles.messageError : formStyles.messageSuccess}>
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
