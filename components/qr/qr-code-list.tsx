"use client"

import { useState } from "react"
import useSWR from "swr"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  QrCode,
  MapPin,
  Star,
  Eye,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react"

interface QRCodeData {
  id: number
  name: string
  location: string | null
  qr_url: string
  scans_count: number
  created_at: string
  feedback_count: number
  avg_rating: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function QRCodeList() {
  const { data: qrCodes, error, isLoading, mutate } = useSWR<QRCodeData[]>("/api/qr-codes", fetcher)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({ name: "", location: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredQRCodes = qrCodes?.filter(
    (qr) =>
      qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreate = async () => {
    if (!formData.name.trim()) return
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await mutate()
        setIsCreateOpen(false)
        setFormData({ name: "", location: "" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedQR || !formData.name.trim()) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/qr-codes/${selectedQR.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await mutate()
        setIsEditOpen(false)
        setSelectedQR(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedQR) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/qr-codes/${selectedQR.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await mutate()
        setIsDeleteOpen(false)
        setSelectedQR(null)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadQR = (qr: QRCodeData) => {
    const svg = document.getElementById(`qr-${qr.id}`)
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = 512
      canvas.height = 512
      ctx?.drawImage(img, 0, 0, 512, 512)
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-${qr.name.toLowerCase().replace(/\s+/g, "-")}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.crossOrigin = "anonymous"
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin
    }
    return ""
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-danger">Erreur lors du chargement des QR codes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un QR code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau QR Code
        </Button>
      </div>

      {/* Grid */}
      {filteredQRCodes && filteredQRCodes.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQRCodes.map((qr) => (
            <Card key={qr.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{qr.name}</CardTitle>
                    {qr.location && (
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {qr.location}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadQR(qr)}>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger PNG
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedQR(qr)
                          setFormData({ name: qr.name, location: qr.location || "" })
                          setIsEditOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/feedback/${qr.qr_url}`, "_blank")}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Voir le formulaire
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-danger"
                        onClick={() => {
                          setSelectedQR(qr)
                          setIsDeleteOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4 bg-muted rounded-lg mb-4">
                  <QRCodeSVG
                    id={`qr-${qr.id}`}
                    value={`${getBaseUrl()}/feedback/${qr.qr_url}`}
                    size={150}
                    level="M"
                    includeMargin
                    bgColor="transparent"
                    fgColor="#1e293b"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      {qr.scans_count}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-4 w-4" />
                      {qr.feedback_count}
                    </span>
                  </div>
                  {qr.avg_rating > 0 && (
                    <Badge
                      variant="secondary"
                      className={
                        qr.avg_rating >= 4
                          ? "bg-success/10 text-success"
                          : qr.avg_rating >= 3
                            ? "bg-warning/10 text-warning"
                            : "bg-danger/10 text-danger"
                      }
                    >
                      {qr.avg_rating.toFixed(1)} / 5
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun QR code</h3>
            <p className="text-muted-foreground text-center mb-4">
              Créez votre premier QR code pour commencer à collecter des feedbacks
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Créer un QR Code
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau QR Code</DialogTitle>
            <DialogDescription>
              Créez un QR code pour un point de contact client (table, caisse, chambre...)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du QR Code *</Label>
              <Input
                id="name"
                placeholder="Ex: Table 5, Caisse principale..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Emplacement (optionnel)</Label>
              <Input
                id="location"
                placeholder="Ex: Restaurant Paris 11e"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name.trim() || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le QR Code</DialogTitle>
            <DialogDescription>Modifiez les informations du QR code</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du QR Code *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Emplacement</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.name.trim() || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le QR Code</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{selectedQR?.name}" ? Cette action supprimera également tous les
              feedbacks associés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
