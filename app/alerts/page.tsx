import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AlertsList } from "@/components/dashboard/alerts-list"

export default async function AlertsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        user={{
          companyName: user.company_name,
          plan: user.plan,
        }}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Alertes</h1>
          <p className="text-muted-foreground">Feedbacks négatifs nécessitant votre attention</p>
        </div>
        <AlertsList />
      </main>
    </div>
  )
}
