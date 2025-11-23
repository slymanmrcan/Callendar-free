"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { format } from "date-fns"

interface Event {
    id?: string
    title: string
    description?: string
    imageUrl?: string | null
    speaker?: string | null
    location?: string | null
    platform?: string | null
    isOnline?: boolean
    startDate: Date
    endDate: Date
}

interface EventModalProps {
    isOpen: boolean
    onClose: () => void
    event?: Event | null
    isAdmin: boolean
    mode: 'view' | 'create' | 'edit'
    onSave: (event: Event) => Promise<void>
    onDelete?: (id: string) => Promise<void>
}

export default function EventModal({
    isOpen,
    onClose,
    event,
    isAdmin,
    mode,
    onSave,
    onDelete,
}: EventModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [speaker, setSpeaker] = useState("")
    const [location, setLocation] = useState("")
    const [platform, setPlatform] = useState("")
    const [isOnline, setIsOnline] = useState(false)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(mode === 'edit')

    useEffect(() => {
        if (event) {
            setTitle(event.title)
            setDescription(event.description || "")
            setImageUrl(event.imageUrl || "")
            setSpeaker(event.speaker || "")
            setLocation(event.location || "")
            setPlatform(event.platform || "")
            setIsOnline(Boolean(event.isOnline))
            setStartDate(format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"))
            setEndDate(format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"))
        } else {
            setTitle("")
            setDescription("")
            setImageUrl("")
            setSpeaker("")
            setLocation("")
            setPlatform("")
            setIsOnline(false)
            setStartDate("")
            setEndDate("")
        }
        setEditMode(mode === 'edit' || mode === 'create')
    }, [event, mode])

    const readableRange = event
        ? `${format(new Date(event.startDate), "d MMM yyyy HH:mm")} - ${format(new Date(event.endDate), "d MMM yyyy HH:mm")}`
        : ""

    const handleSave = async () => {
        setLoading(true)
        try {
            await onSave({
                id: event?.id,
                title,
                description,
                imageUrl,
                speaker,
                location,
                platform,
                isOnline,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            })
            onClose()
        } catch (error) {
            console.error('Error saving event:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (event?.id && onDelete) {
            setLoading(true)
            try {
                await onDelete(event.id)
                onClose()
            } catch (error) {
                console.error('Error deleting event:', error)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl border border-white/10 bg-background/95 p-0 shadow-2xl">
                <div className="space-y-6 p-5 sm:p-6">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-xl font-semibold">
                            {mode === 'create' ? 'Yeni Etkinlik' : editMode ? 'Etkinliği Düzenle' : 'Etkinlik Detayları'}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === 'create'
                                ? 'Yeni bir etkinlik oluşturun'
                                : editMode
                                    ? 'Etkinlik bilgilerini güncelleyin'
                                    : 'Etkinlik bilgilerini görüntüleyin'}
                        </DialogDescription>
                    </DialogHeader>

                    {!editMode && event && (
                        <div className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5 md:grid-cols-[1.2fr_0.8fr]">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-md bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-foreground/90">
                                        {readableRange}
                                    </span>
                                    <span className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-semibold text-secondary-foreground">
                                        {event.title}
                                    </span>
                                </div>
                                {(event.speaker || event.location || event.platform) && (
                                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-foreground/90">
                                        {event.speaker && (
                                            <span className="rounded-full bg-white/10 px-3 py-1">
                                                Konuşmacı: {event.speaker}
                                            </span>
                                        )}
                                        {event.isOnline ? (
                                            <>
                                                <span className="rounded-full bg-emerald-600/30 px-3 py-1 text-emerald-100">
                                                    Online
                                                </span>
                                                {event.platform && (
                                                    <span className="rounded-full bg-white/10 px-3 py-1">
                                                        Platform: {event.platform}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            event.location && (
                                                <span className="rounded-full bg-white/10 px-3 py-1">
                                                    Konum: {event.location}
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}
                                {event.description && (
                                    <p className="text-sm leading-relaxed text-foreground/90">{event.description}</p>
                                )}
                            </div>
                            {event.imageUrl && (
                                <div className="overflow-hidden rounded-lg border border-white/10">
                                    <img
                                        src={event.imageUrl}
                                        alt="Etkinlik görseli"
                                        className="h-56 w-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {editMode && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Başlık</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={!editMode}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Açıklama</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={!editMode}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="speaker">Konuşmacı</Label>
                                    <Input
                                        id="speaker"
                                        value={speaker}
                                        onChange={(e) => setSpeaker(e.target.value)}
                                        disabled={!editMode}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isOnline}
                                            onChange={(e) => setIsOnline(e.target.checked)}
                                            disabled={!editMode}
                                            className="h-4 w-4 rounded border-muted-foreground/50 bg-transparent"
                                        />
                                        Online Etkinlik
                                    </Label>
                                </div>
                            </div>

                            {isOnline ? (
                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform (örn. Google Meet, Zoom)</Label>
                                    <Input
                                        id="platform"
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        disabled={!editMode}
                                        placeholder="Google Meet"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="location">Konum (adres/salon)</Label>
                                    <Input
                                        id="location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        disabled={!editMode}
                                        placeholder="Mühendislik Fak. D101"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="image">Görsel</Label>
                                <div className="grid gap-2">
                                    <Input
                                        id="image"
                                        type="url"
                                        placeholder="https://ornek.com/etkinlik.jpg"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        disabled={!editMode}
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        URL ekleyebilir veya aşağıdan görsel seçebilirsiniz.
                                    </div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        disabled={!editMode}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return
                                            const reader = new FileReader()
                                            reader.onload = () => setImageUrl(reader.result as string)
                                            reader.readAsDataURL(file)
                                        }}
                                    />
                                    {imageUrl && (
                                        <div className="overflow-hidden rounded-md border bg-muted/30 p-2">
                                            <img
                                                src={imageUrl}
                                                alt="Etkinlik görseli"
                                                className="h-40 w-full rounded object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                                    <Input
                                        id="startDate"
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        disabled={!editMode}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">Bitiş Tarihi</Label>
                                    <Input
                                        id="endDate"
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        disabled={!editMode}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-2">
                        {!editMode && isAdmin && event?.id && (
                            <Button
                                variant="outline"
                                onClick={() => setEditMode(true)}
                            >
                                Düzenle
                            </Button>
                        )}

                        {editMode && (
                            <>
                                {event?.id && onDelete && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        Sil
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSave}
                                    disabled={loading || !title || !startDate || !endDate}
                                >
                                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                                </Button>
                            </>
                        )}

                        {!editMode && (
                            <Button variant="outline" onClick={onClose}>
                                Kapat
                            </Button>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
