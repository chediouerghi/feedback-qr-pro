import { notFound } from "next/navigation"
import db from "@/lib/db"
import { PublicQRDisplay } from "@/components/public/public-qr-display"

interface PageProps {
  params: Promise<{ qrUrl: string }>
}

export default async function PublicQRPage({ params }: PageProps) {
  const { qrUrl } = await params

  const qrCode = db
    .prepare(`
    SELECT qc.id, qc.qr_url FROM qr_codes qc WHERE qc.qr_url = ?
  `)
    .get(qrUrl)

  if (!qrCode) {
    notFound()
  }

  return <PublicQRDisplay qrUrl={qrUrl} />
}
