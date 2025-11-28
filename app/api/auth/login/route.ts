import { type NextRequest, NextResponse } from "next/server"
import db, { type User } from "@/lib/db"
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined
    if (!user) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 })
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      companyName: user.company_name,
      plan: user.plan,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        companyName: user.company_name,
        plan: user.plan,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 })
  }
}
