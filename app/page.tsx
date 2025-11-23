"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import Calendar from "@/components/Calendar"
import EventModal from "@/components/EventModal"
import Header from "@/components/Header"

interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  imageUrl?: string | null
  speaker?: string | null
  location?: string | null
  platform?: string | null
  isOnline?: boolean
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  imageUrl?: string | null
  speaker?: string | null
  location?: string | null
  platform?: string | null
  isOnline?: boolean
  start: Date
  end: Date
}

export default function HomePage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view')
  const [newEventSlot, setNewEventSlot] = useState<{ start: Date; end: Date } | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/events')
      const data: Event[] = await response.json()
      const calendarEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        imageUrl: event.imageUrl,
        speaker: event.speaker,
        location: event.location,
        platform: event.platform,
        isOnline: event.isOnline,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
      }))
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (session) {
      // Aynı gün seçimi: bitişi başlangıç + 1 saat olarak ayarlayalım
      const start = slotInfo.start
      const end = new Date(start.getTime() + 60 * 60 * 1000)
      const normalizedSlot = { start, end }

      setNewEventSlot(normalizedSlot)
      setSelectedEvent({
        id: '',
        title: '',
        description: '',
        imageUrl: '',
        speaker: '',
        location: '',
        platform: '',
        isOnline: false,
        start,
        end,
      })
      setModalMode('create')
      setModalOpen(true)
    }
  }

  const handleSaveEvent = async (event: {
    id?: string
    title: string
    description?: string
    startDate: Date
    endDate: Date
    imageUrl?: string | null
    speaker?: string | null
    location?: string | null
    platform?: string | null
    isOnline?: boolean
  }) => {
    try {
      const cleanedImageUrl = event.imageUrl?.toString().trim()
      const imageUrl = cleanedImageUrl ? cleanedImageUrl : null
      const speaker = event.speaker?.toString().trim() || null
      const location = event.location?.toString().trim() || null
      const platform = event.platform?.toString().trim() || null
      const isOnline = Boolean(event.isOnline)

      if (event.id) {
        // Update existing event
        const response = await fetch(`/api/events/${event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: event.title,
            description: event.description,
            imageUrl,
            speaker,
            location,
            platform,
            isOnline,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
          }),
        })
        if (!response.ok) throw new Error('Failed to update event')
      } else {
        // Create new event
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: event.title,
            description: event.description,
            imageUrl,
            speaker,
            location,
            platform,
            isOnline,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
          }),
        })
        if (!response.ok) throw new Error('Failed to create event')
      }
      await fetchEvents()
      setModalOpen(false)
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete event')
      await fetchEvents()
      setModalOpen(false)
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  return (
    <>
      <Header />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 pb-10 pt-6 sm:px-6">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/80">
                Topluluk Takvimi
              </p>
              <h2 className="text-xl font-semibold text-white">Etkinlikler tek bakışta</h2>
              <p className="text-sm text-slate-200/80">
                Atölye, seminer ve kulüp buluşmalarını güncel tutmak için takvimi kullanın.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200/90 shadow-inner">
              <p className="font-semibold text-white">Yönetici ipucu</p>
              <p>Kutucuklara tıklayarak yeni etkinlik oluşturabilir, etkinliklere tıklayarak düzenleyebilirsiniz.</p>
            </div>
          </div>
        </section>

        <Calendar
          events={events}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          isAdmin={!!session}
        />
      </main>

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent ? {
          id: selectedEvent.id,
          title: selectedEvent.title,
          description: selectedEvent.description,
          imageUrl: selectedEvent.imageUrl,
          speaker: selectedEvent.speaker,
          location: selectedEvent.location,
          platform: selectedEvent.platform,
          isOnline: selectedEvent.isOnline,
          startDate: selectedEvent.start,
          endDate: selectedEvent.end,
        } : null}
        isAdmin={!!session}
        mode={modalMode}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </>
  )
}
