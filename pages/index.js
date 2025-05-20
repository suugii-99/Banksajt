import Link from 'next/link';

export default function Home() {
  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <Link href="/" style={styles.navLink}>Hem</Link>
        <Link href="/login" style={styles.navLink}>Logga in</Link>
        <Link href="/create-user" style={styles.navLink}>Skapa användare</Link>
      </nav>

      <main style={styles.main}>
        <h1 style={styles.title}>Välkommen till banken</h1>
        <p style={styles.subtitle}>Din trygga bank på nätet</p>
        <Link href="/create-user">
          <button style={styles.button}>Skapa användare</button>
        </Link>
      </main>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  },
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '25px',
    marginBottom: '40px',
  },
  navLink: {
    textDecoration: 'none',
    color: '#0070f3',
    fontWeight: 'bold',
    fontSize: '18px',
    cursor: 'pointer',
  },
  main: {
    textAlign: 'center',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '30px',
    color: '#666',
  },
  button: {
    fontSize: '1.25rem',
    padding: '12px 24px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  }
};
