import { redirect, notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FeedbacksList } from "@/components/feedback/feedbacks-list"
import db, { type QRCode } from "@/lib/db"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QRFeedbacksPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const qrCode = db
    .prepare(`
    SELECT qc.*, 
           COUNT(f.id) as feedback_count,
           COALESCE(AVG(f.rating), 0) as avg_rating
    FROM qr_codes qc
    LEFT JOIN feedbacks f ON f.qr_id = qc.id
    WHERE qc.id = ? AND qc.user_id = ?
    GROUP BY qc.id
  `)
    .get(id, user.id) as (QRCode & { feedback_count: number; avg_rating: number }) | undefined

  if (!qrCode) {
    notFound()
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
          <h1 className="text-2xl font-bold text-foreground">Avis - {qrCode.name}</h1>
          <p className="text-muted-foreground">
            {qrCode.feedback_count} avis collectés - Note moyenne:{" "}
            {qrCode.avg_rating > 0 ? qrCode.avg_rating.toFixed(1) : "-"}/5
          </p>
        </div>
        <FeedbacksList qrId={qrCode.id} qrName={qrCode.name} />
      </main>
    </div>
  )
}
