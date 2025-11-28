import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TopFeedbacksContent } from "@/components/feedback/top-feedbacks-content"

export default async function TopFeedbacksPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Top Avis</h1>
          <p className="text-muted-foreground">Découvrez vos meilleurs feedbacks et les avis les plus utiles</p>
        </div>
        <TopFeedbacksContent />
      </main>
    </div>
  )
}
