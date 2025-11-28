"use client"

import { useState } from "react"
import useSWR from "swr"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRLevelBadge } from "@/components/ui/badge-level"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Plus,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  QrCode,
  MapPin,
  Star,
  Loader2,
  Search,
  ExternalLink,
  Share2,
  Copy,
  Grid3X3,
  List,
  Filter,
  TrendingUp,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QRCodeData {
  id: number
  name: string
  location: string | null
  qr_url: string
  scans_count: number
  created_at: string
  feedback_count: number
  avg_rating: number
  performance_level: "bronze" | "silver" | "gold" | "platinum"
  response_rate: number
  satisfaction_rate: number
  share_count: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function QRGallery() {
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "recent",
    level: "all",
    minRating: "",
  })
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null)
  const [formData, setFormData] = useState({ name: "", location: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const queryParams = new URLSearchParams()
  if (filters.search) queryParams.set("search", filters.search)
  if (filters.sortBy) queryParams.set("sortBy", filters.sortBy)
  if (filters.level && filters.level !== "all") queryParams.set("level", filters.level)
  if (filters.minRating) queryParams.set("minRating", filters.minRating)

  const {
    data: qrCodes,
    error,
    isLoading,
    mutate,
  } = useSWR<QRCodeData[]>(`/api/qr-codes?${queryParams.toString()}`, fetcher)

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
      const res = await fetch(`/api/qr-codes/${selectedQR.id}`, { method: "DELETE" })
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
    const svg = document.getElementById(`qr-gallery-${qr.id}`)
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

  const getBaseUrl = () => (typeof window !== "undefined" ? window.location.origin : "")

  const copyLink = async (qr: QRCodeData) => {
    const url = `${getBaseUrl()}/feedback/${qr.qr_url}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        <p className="text-destructive">Erreur lors du chargement des QR codes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un QR code..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
              <TabsList className="h-9">
                <TabsTrigger value="grid" className="px-2.5">
                  <Grid3X3 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-2.5">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau QR
            </Button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtres:</span>
          </div>
          <Select value={filters.sortBy} onValueChange={(v) => setFilters({ ...filters, sortBy: v })}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="oldest">Plus anciens</SelectItem>
              <SelectItem value="rating_high">Meilleure note</SelectItem>
              <SelectItem value="rating_low">Note basse</SelectItem>
              <SelectItem value="popular">Plus de feedbacks</SelectItem>
              <SelectItem value="scans">Plus de scans</SelectItem>
              <SelectItem value="name">Nom A-Z</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.level} onValueChange={(v) => setFilters({ ...filters, level: v })}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous niveaux</SelectItem>
              <SelectItem value="platinum">Platine</SelectItem>
              <SelectItem value="gold">Or</SelectItem>
              <SelectItem value="silver">Argent</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.minRating} onValueChange={(v) => setFilters({ ...filters, minRating: v })}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Note min." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Toutes notes</SelectItem>
              <SelectItem value="4">4+ etoiles</SelectItem>
              <SelectItem value="3">3+ etoiles</SelectItem>
              <SelectItem value="2">2+ etoiles</SelectItem>
            </SelectContent>
          </Select>
          {(filters.search || filters.level !== "all" || filters.minRating !== "0") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ search: "", sortBy: "recent", level: "all", minRating: "0" })}
              className="text-muted-foreground hover:text-foreground"
            >
              Effacer filtres
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {qrCodes && (
        <p className="text-sm text-muted-foreground">
          {qrCodes.length} QR code{qrCodes.length !== 1 ? "s" : ""} trouve{qrCodes.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Grid/List View */}
      {qrCodes && qrCodes.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {qrCodes.map((qr) => (
              <Card key={qr.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg truncate">{qr.name}</CardTitle>
                        <QRLevelBadge level={qr.performance_level} size="sm" showLabel={false} />
                      </div>
                      {qr.location && (
                        <CardDescription className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {qr.location}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedQR(qr)
                            setIsShareOpen(true)
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Partager
                        </DropdownMenuItem>
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
                          Voir formulaire
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/qr/${qr.id}/feedbacks`, "_blank")}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Voir les avis
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
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
                  <div className="flex items-center justify-center py-4 bg-muted rounded-lg mb-4 relative">
                    <QRCodeSVG
                      id={`qr-gallery-${qr.id}`}
                      value={`${getBaseUrl()}/feedback/${qr.qr_url}`}
                      size={140}
                      level="M"
                      includeMargin
                      bgColor="transparent"
                      fgColor="#1e293b"
                    />
                    <button
                      onClick={() => {
                        setSelectedQR(qr)
                        setIsShareOpen(true)
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    >
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="p-2 rounded-md bg-muted/50">
                      <p className="text-xs text-muted-foreground">Scans</p>
                      <p className="font-semibold">{qr.scans_count}</p>
                    </div>
                    <div className="p-2 rounded-md bg-muted/50">
                      <p className="text-xs text-muted-foreground">Avis</p>
                      <p className="font-semibold">{qr.feedback_count}</p>
                    </div>
                    <div className="p-2 rounded-md bg-muted/50">
                      <p className="text-xs text-muted-foreground">Note</p>
                      <p className="font-semibold flex items-center justify-center gap-1">
                        {qr.avg_rating > 0 ? qr.avg_rating.toFixed(1) : "-"}
                        {qr.avg_rating > 0 && <Star className="h-3 w-3 fill-warning text-warning" />}
                      </p>
                    </div>
                  </div>

                  {/* Performance bar */}
                  {qr.feedback_count > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Satisfaction</span>
                        <span
                          className={cn(
                            "font-medium",
                            qr.satisfaction_rate >= 80
                              ? "text-primary"
                              : qr.satisfaction_rate >= 50
                                ? "text-warning"
                                : "text-destructive",
                          )}
                        >
                          {qr.satisfaction_rate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            qr.satisfaction_rate >= 80
                              ? "bg-primary"
                              : qr.satisfaction_rate >= 50
                                ? "bg-warning"
                                : "bg-destructive",
                          )}
                          style={{ width: `${qr.satisfaction_rate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {qrCodes.map((qr) => (
              <Card key={qr.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-muted rounded-lg p-2">
                      <QRCodeSVG
                        id={`qr-list-${qr.id}`}
                        value={`${getBaseUrl()}/feedback/${qr.qr_url}`}
                        size={60}
                        level="M"
                        bgColor="transparent"
                        fgColor="#1e293b"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{qr.name}</h3>
                        <QRLevelBadge level={qr.performance_level} size="sm" />
                      </div>
                      {qr.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {qr.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Scans</p>
                        <p className="font-semibold">{qr.scans_count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Avis</p>
                        <p className="font-semibold">{qr.feedback_count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Note</p>
                        <p className="font-semibold flex items-center gap-1">
                          {qr.avg_rating > 0 ? qr.avg_rating.toFixed(1) : "-"}
                          <Star className="h-3 w-3 fill-warning text-warning" />
                        </p>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <p className="text-muted-foreground text-xs">Satisfaction</p>
                        <p
                          className={cn(
                            "font-semibold",
                            qr.satisfaction_rate >= 80
                              ? "text-primary"
                              : qr.satisfaction_rate >= 50
                                ? "text-warning"
                                : "text-destructive",
                          )}
                        >
                          {qr.satisfaction_rate.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedQR(qr)
                          setIsShareOpen(true)
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
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
                          <DropdownMenuItem onClick={() => window.open(`/qr/${qr.id}/feedbacks`, "_blank")}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Voir les avis
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
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
            <DialogDescription>Créez un QR code pour un point de contact client</DialogDescription>
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
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom *</Label>
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
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
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
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partager le QR Code</DialogTitle>
            <DialogDescription>Partagez ce lien ou téléchargez le QR code pour le distribuer</DialogDescription>
          </DialogHeader>
          {selectedQR && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-4 bg-muted rounded-lg">
                <QRCodeSVG
                  id={`qr-share-${selectedQR.id}`}
                  value={`${getBaseUrl()}/feedback/${selectedQR.qr_url}`}
                  size={200}
                  level="M"
                  includeMargin
                  bgColor="transparent"
                  fgColor="#1e293b"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input readOnly value={`${getBaseUrl()}/feedback/${selectedQR.qr_url}`} className="flex-1" />
                <Button variant="outline" size="icon" onClick={() => copyLink(selectedQR)}>
                  {copied ? <TrendingUp className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {copied && <p className="text-sm text-primary text-center">Lien copié !</p>}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => downloadQR(selectedQR)}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PNG
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => window.open(`/feedback/${selectedQR.qr_url}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
