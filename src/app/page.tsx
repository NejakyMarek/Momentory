import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section style={{ textAlign: 'center', padding: '24px 0' }}>
        <h1 style={{
          fontSize: 40,
          lineHeight: 1.1,
          marginBottom: 12,
          letterSpacing: -0.5
        }}>Momentory – luxusné fotoalbumy</h1>
        <p style={{
          fontSize: 18,
          opacity: 0.85,
          margin: '0 auto'
        }}>Vyber štýl, počet strán, nahraj fotky, objednaj.</p>
        <div style={{ marginTop: 20 }}>
          <Button asChild>
            <Link href="/configure">Začni tvoriť →</Link>
          </Button>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat( auto-fit, minmax(240px, 1fr) )' }}>
        <Card>
          <CardHeader>
            <CardTitle>Prvotriedna kvalita</CardTitle>
            <CardDescription>Prémiový papier a tlač, ktorá vydrží roky.</CardDescription>
          </CardHeader>
          <CardContent>
            Vytvor spomienky, ktoré si budeš chcieť pozerať znova a znova.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Jednoduché vytváranie</CardTitle>
            <CardDescription>Vyber variant, počet strán a pridaj fotky.</CardDescription>
          </CardHeader>
          <CardContent>
            Editor a objednávka na pár klikov.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rýchle dodanie</CardTitle>
            <CardDescription>Spoľahlivá výroba a doručenie.</CardDescription>
          </CardHeader>
          <CardContent>
            Už čoskoro u teba doma.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}