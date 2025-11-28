import { notFound } from "next/navigation"
import db from "@/lib/db"
import { FeedbackForm } from "@/components/feedback/feedback-form"

interface PageProps {
  params: Promise<{ qrUrl: string }>
}

export default async function FeedbackPage({ params }: PageProps) {
  const { qrUrl } = await params

  // Fetch QR code info
  const qrCode = db.prepare("SELECT id, name, location FROM qr_codes WHERE qr_url = ?").get(qrUrl) as
    | { id: number; name: string; location: string | null }
    | undefined

  if (!qrCode) {
    notFound()
  }

  return <FeedbackForm qrUrl={qrUrl} qrName={qrCode.name} qrLocation={qrCode.location} />
}

export async function generateMetadata({ params }: PageProps) {
  const { qrUrl } = await params

  const qrCode = db.prepare("SELECT name FROM qr_codes WHERE qr_url = ?").get(qrUrl) as { name: string } | undefined

  return {
    title: qrCode ? `Donnez votre avis - ${qrCode.name}` : "Donnez votre avis",
    description: "Partagez votre expérience et aidez-nous à améliorer notre service.",
  }
}
