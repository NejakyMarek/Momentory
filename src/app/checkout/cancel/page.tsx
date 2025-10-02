import Link from 'next/link';

export default function Page(){
  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>❌ Platba zrušená</h1>
      <p style={{ marginBottom: 16 }}>Platbu môžeš kedykoľvek skúsiť znova.</p>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/builder">🔁 Skúsiť znova</Link>
        <Link href="/">🏠 Späť na úvod</Link>
      </div>
    </div>
  );
}
