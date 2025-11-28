import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QrCode, BarChart3, Bell, Zap, Shield, Globe } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">FeedbackQR Pro</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90">Essai gratuit</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Collectez les avis clients en <span className="text-primary">temps réel</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            QR codes personnalisés, dashboards analytics puissants et alertes instantanées. La solution complète pour
            améliorer l'expérience client de votre entreprise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                Démarrer gratuitement
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                Découvrir les fonctionnalités
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Gratuit jusqu'à 100 feedbacks/mois. Sans carte bancaire.</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Tout ce dont vous avez besoin</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={QrCode}
              title="QR Codes personnalisés"
              description="Créez des QR codes uniques pour chaque point de contact : tables, caisses, chambres d'hôtel..."
            />
            <FeatureCard
              icon={BarChart3}
              title="Analytics en temps réel"
              description="Suivez votre NPS, la satisfaction client et les tendances avec des dashboards interactifs."
            />
            <FeatureCard
              icon={Bell}
              title="Alertes instantanées"
              description="Recevez des notifications pour les avis négatifs et réagissez rapidement."
            />
            <FeatureCard
              icon={Zap}
              title="Mise à jour live"
              description="Visualisez les nouveaux feedbacks en temps réel grâce aux WebSockets."
            />
            <FeatureCard
              icon={Shield}
              title="Données sécurisées"
              description="Vos données sont protégées avec un chiffrement de bout en bout."
            />
            <FeatureCard
              icon={Globe}
              title="Multi-langues"
              description="Interface disponible en français et anglais pour une audience internationale."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Tarifs simples et transparents</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              title="Gratuit"
              price="0€"
              description="Pour démarrer"
              features={["100 feedbacks/mois", "QR codes illimités", "Dashboard basique", "Export CSV"]}
            />
            <PricingCard
              title="Pro"
              price="29€"
              description="Pour les PME"
              features={[
                "1000 feedbacks/mois",
                "QR codes illimités",
                "Analytics avancés",
                "Alertes email",
                "API access",
              ]}
              highlighted
            />
            <PricingCard
              title="Enterprise"
              price="Sur mesure"
              description="Pour les grands comptes"
              features={["Feedbacks illimités", "Support dédié", "SSO / SAML", "SLA garanti", "Déploiement on-premise"]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">FeedbackQR Pro</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 FeedbackQR Pro. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl bg-background border border-border hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function PricingCard({
  title,
  price,
  description,
  features,
  highlighted = false,
}: {
  title: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div
      className={`p-6 rounded-xl border ${
        highlighted ? "border-primary bg-primary/5 shadow-lg scale-105" : "border-border bg-card"
      }`}
    >
      {highlighted && (
        <span className="inline-block px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full mb-4">
          Populaire
        </span>
      )}
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <p className="text-3xl font-bold text-foreground mb-6">
        {price}
        {price !== "Sur mesure" && <span className="text-sm font-normal text-muted-foreground">/mois</span>}
      </p>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/register">
        <Button
          className={`w-full ${highlighted ? "bg-primary hover:bg-primary/90" : ""}`}
          variant={highlighted ? "default" : "outline"}
        >
          {title === "Enterprise" ? "Nous contacter" : "Commencer"}
        </Button>
      </Link>
    </div>
  )
}
