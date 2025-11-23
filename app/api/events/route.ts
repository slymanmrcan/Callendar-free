import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

// GET /api/events - Fetch all events
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { startDate: 'asc' },
        })
        return NextResponse.json(events)
    } catch (error) {
        console.error('Error fetching events:', error)
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        )
    }
}

// POST /api/events - Create new event (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            title,
            description,
            startDate,
            endDate,
            imageUrl,
            speaker,
            location,
            platform,
            isOnline,
        } = body

        if (!title || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const parsedStart = new Date(startDate)
        const parsedEnd = new Date(endDate)

        if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            )
        }

        const event = await prisma.event.create({
            data: {
                title: title.trim(),
                description: description?.trim(),
                imageUrl,
                speaker: speaker?.trim(),
                location: location?.trim(),
                platform: platform?.trim(),
                isOnline: Boolean(isOnline),
                startDate: parsedStart,
                endDate: parsedEnd,
            },
        })

        return NextResponse.json(event, { status: 201 })
    } catch (error) {
        console.error('Error creating event:', error)
        return NextResponse.json(
            { error: 'Failed to create event' },
            { status: 500 }
        )
    }
}
