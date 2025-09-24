import Link from "next/link";
export default function Home() {
  return (
    <main style={{padding: 24, maxWidth: 900, margin: "0 auto"}}>
      <h1>Momentory – luxusné fotoalbumy</h1>
      <p>Vyber štýl, počet strán, nahraj fotky, objednaj.</p>
      <p><Link href="/builder">Začni tvoriť →</Link></p>
    </main>
  );
}