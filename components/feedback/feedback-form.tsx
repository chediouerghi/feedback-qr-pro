"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { StarRating } from "./star-rating"
import { CheckCircle, Loader2, AlertCircle, MessageSquare, User, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackFormProps {
  qrUrl: string
  qrName: string
  qrLocation?: string | null
}

type FormState = "idle" | "submitting" | "success" | "error"

export function FeedbackForm({ qrUrl, qrName, qrLocation }: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reviewerName, setReviewerName] = useState("")
  const [reviewerEmail, setReviewerEmail] = useState("")
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setFormState("submitting")
    setErrorMessage("")

    try {
      const res = await fetch(`/api/feedbacks/submit/${qrUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
          reviewer_name: reviewerName.trim() || null,
          reviewer_email: reviewerEmail.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de l'envoi")
      }

      setFormState("success")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Une erreur est survenue")
      setFormState("error")
    }
  }

  if (formState === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-0 shadow-lg">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Merci pour votre avis !</h2>
            <p className="text-muted-foreground mb-6">Votre retour nous aide à améliorer notre service.</p>
            {reviewerName && (
              <p className="text-sm text-muted-foreground mb-4">Merci {reviewerName}, votre avis a été enregistré.</p>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setRating(0)
                setComment("")
                setReviewerName("")
                setReviewerEmail("")
                setFormState("idle")
              }}
            >
              Donner un autre avis
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-foreground">Votre avis compte !</CardTitle>
          <CardDescription className="text-base">
            {qrName}
            {qrLocation && <span className="block text-sm text-muted-foreground mt-1">{qrLocation}</span>}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Error message */}
            {formState === "error" && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* Star Rating */}
            <div className="py-4">
              <p className="text-sm font-medium text-muted-foreground text-center mb-4">
                Comment évaluez-vous votre expérience ?
              </p>
              <StarRating rating={rating} onChange={setRating} />
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="reviewer-name"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <User className="h-4 w-4" />
                  Votre nom (optionnel)
                </Label>
                <Input
                  id="reviewer-name"
                  placeholder="Jean Dupont"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="reviewer-email"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <Mail className="h-4 w-4" />
                  Email (optionnel)
                </Label>
                <Input
                  id="reviewer-email"
                  type="email"
                  placeholder="jean@example.com"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground">Pour recevoir une réponse à votre avis</p>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                Commentaire (optionnel)
              </Label>
              <Textarea
                id="comment"
                placeholder="Partagez votre expérience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={cn(
                "w-full h-12 text-base font-medium transition-all",
                rating > 0 ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground",
              )}
              disabled={rating === 0 || formState === "submitting"}
            >
              {formState === "submitting" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer mon avis"
              )}
            </Button>

            {rating === 0 && (
              <p className="text-sm text-center text-muted-foreground animate-pulse">
                Sélectionnez une note pour continuer
              </p>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
