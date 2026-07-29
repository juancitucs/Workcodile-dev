import { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReport: (reason: string) => Promise<void>
}

export function ReportDialog({ open, onOpenChange, onReport }: ReportDialogProps) {
  const [reportReason, setReportReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const finalReason = reportReason === 'other' ? customReason : reportReason
    if (!finalReason.trim()) {
      toast.error('Por favor selecciona o escribe una razon para el reporte')
      return
    }
    setIsSubmitting(true)
    try {
      await onReport(finalReason)
      toast.success('Reporte enviado! Gracias por ayudarnos a mantener la comunidad segura.')
      onOpenChange(false)
      setReportReason('')
      setCustomReason('')
    } catch {
      toast.error('Error al enviar el reporte. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setReportReason('')
    setCustomReason('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-report-dialog className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Reportar publicacion
          </DialogTitle>
          <DialogDescription>
            Selecciona la razon por la que deseas reportar esta publicacion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={reportReason} onValueChange={setReportReason}>
            {[
              { value: 'spam', label: 'Spam o publicidad no deseada' },
              { value: 'inappropriate', label: 'Contenido inapropiado u ofensivo' },
              { value: 'harassment', label: 'Acoso o bullying' },
              { value: 'false_info', label: 'Informacion falsa o enganosa' },
              { value: 'plagiarism', label: 'Plagio o contenido copiado' },
              { value: 'other', label: 'Otra razon' },
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={value} />
                <Label htmlFor={value} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </RadioGroup>
          {reportReason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Describe la razon:</Label>
              <Textarea id="custom-reason" placeholder="Escribe aqui el motivo de tu reporte..." value={customReason} onChange={(e) => setCustomReason(e.target.value)} className="min-h-[80px]" maxLength={300} />
              <p className="text-xs text-muted-foreground text-right">{customReason.length}/300</p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting || !reportReason}>
            {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
