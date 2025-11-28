import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { QRCodeList } from "@/components/qr/qr-code-list"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function QRCodesPage() {
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
          <h1 className="text-2xl font-bold text-foreground">QR Codes</h1>
          <p className="text-muted-foreground">Gérez vos QR codes et suivez leurs performances</p>
        </div>
        <QRCodeList />
      </main>
    </div>
  )
}
