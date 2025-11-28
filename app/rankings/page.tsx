import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RankingsContent } from "@/components/rankings/rankings-content"

export default async function RankingsPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Classements</h1>
          <p className="text-muted-foreground">
            Découvrez vos QR codes les plus performants et vos meilleurs reviewers
          </p>
        </div>
        <RankingsContent />
      </main>
    </div>
  )
}
