"use client"

import { Calendar as BigCalendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/tr'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/app/calendar.css'
import { useState, useCallback } from 'react'

moment.locale('tr')

const localizer = momentLocalizer(moment)

interface Event {
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

interface CalendarProps {
    events: Event[]
    onSelectEvent: (event: Event) => void
    onSelectSlot: (slotInfo: { start: Date; end: Date }) => void
    isAdmin: boolean
}

export default function Calendar({ events, onSelectEvent, onSelectSlot, isAdmin }: CalendarProps) {
    const [view, setView] = useState<View>('month')
    const [date, setDate] = useState(new Date())

    const formatTime = (date: Date) =>
        new Intl.DateTimeFormat('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)

    const CalendarEvent = ({ event }: { event: Event }) => {
        const startTime = formatTime(event.start)
        const endTime = formatTime(event.end)
        const desc = event.description ? ` · ${event.description}` : ''
        const venue = event.isOnline
            ? event.platform
            : event.location

        return (
            <div
                className="flex w-full max-w-full flex-col gap-0.5 box-border overflow-hidden text-ellipsis whitespace-nowrap"
                title={`${event.title} (${startTime} - ${endTime})${venue ? ` • ${venue}` : ''}`}
            >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide opacity-90">
                    <span className="rounded-sm bg-white/20 px-1 py-0.5 leading-none">
                        {startTime} - {endTime}
                    </span>
                </div>
                <div className="text-[12px] font-semibold leading-tight line-clamp-2">
                    {event.title}
                </div>
                {venue && (
                    <div className="text-[11px] font-medium text-slate-100/90 line-clamp-1">
                        {event.isOnline ? `Online · ${venue}` : `Konum · ${venue}`}
                    </div>
                )}
            </div>
        )
    }

    const handleSelectSlot = useCallback(
        (slotInfo: { start: Date; end: Date }) => {
            if (isAdmin) {
                onSelectSlot(slotInfo)
            }
        },
        [isAdmin, onSelectSlot]
    )

    const eventStyleGetter = useCallback((event: Event) => {
        // Soft, harmonious color palette
        const colors = [
            '#0ea5e9', // Sky
            '#22c55e', // Green
            '#f59e0b', // Amber
            '#38bdf8', // Light blue
            '#f97316', // Orange
            '#14b8a6', // Teal
        ]

        // Use event id to consistently assign colors
        const colorIndex = event.id ? parseInt(event.id.slice(-1), 36) % colors.length : 0

        return {
            style: {
                background: colors[colorIndex],
                borderRadius: '6px',
                color: 'white',
                border: 'none',
                display: 'block',
                padding: '2px 6px',
                fontSize: '13px',
            },
        }
    }, [])

    const messages = {
        allDay: 'Tüm gün',
        previous: 'Önceki',
        next: 'Sonraki',
        today: 'Bugün',
        month: 'Ay',
        week: 'Hafta',
        day: 'Gün',
        agenda: 'Ajanda',
        date: 'Tarih',
        time: 'Saat',
        event: 'Etkinlik',
        noEventsInRange: 'Bu aralıkta etkinlik yok.',
        showMore: (total: number) => `+ ${total} daha fazla`
    }

    return (
        <div className="w-full max-w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 shadow-2xl backdrop-blur sm:p-5 min-h-[60vh] sm:min-h-[70vh] overflow-auto">
            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={onSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable={isAdmin}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                eventPropGetter={eventStyleGetter}
                messages={messages}
                popup
                components={{ event: CalendarEvent }}
                style={{ height: "calc(100vh - 180px)", minHeight: "60vh", maxHeight: "90vh" }}
                step={30}
                timeslots={2}
            />
        </div>
    )
}
