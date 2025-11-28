import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, companyName } = body

    if (!email || !password || !companyName) {
      return NextResponse.json({ error: "Email, mot de passe et nom d'entreprise requis" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email)
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const result = db
      .prepare("INSERT INTO users (email, password_hash, company_name) VALUES (?, ?, ?)")
      .run(email, passwordHash, companyName)

    // Create JWT token
    const token = await createToken({
      userId: result.lastInsertRowid as number,
      email,
      companyName,
      plan: "free",
    })

    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: result.lastInsertRowid,
        email,
        companyName,
        plan: "free",
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 })
  }
}
