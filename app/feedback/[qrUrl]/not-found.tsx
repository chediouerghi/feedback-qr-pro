import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center border-0 shadow-lg">
        <CardContent className="pt-12 pb-8">
          <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-danger" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">QR Code invalide</h2>
          <p className="text-muted-foreground mb-6">Ce QR code n'existe pas ou a été supprimé.</p>
          <Link href="/">
            <Button variant="outline" className="gap-2 bg-transparent">
              <QrCode className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
