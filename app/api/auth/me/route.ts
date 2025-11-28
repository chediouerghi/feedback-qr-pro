import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    companyName: user.company_name,
    plan: user.plan,
    qrLimit: user.qr_limit,
  })
}
