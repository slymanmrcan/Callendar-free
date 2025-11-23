import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

// GET /api/events/:id - Fetch single event
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const event = await prisma.event.findUnique({
            where: { id },
        })

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error fetching event:', error)
        return NextResponse.json(
            { error: 'Failed to fetch event' },
            { status: 500 }
        )
    }
}

// PUT /api/events/:id - Update event (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = params
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

        const event = await prisma.event.update({
            where: { id },
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

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error updating event:', error)
        return NextResponse.json(
            { error: 'Failed to update event' },
            { status: 500 }
        )
    }
}

// DELETE /api/events/:id - Delete event (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { id } = params
        await prisma.event.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting event:', error)
        return NextResponse.json(
            { error: 'Failed to delete event' },
            { status: 500 }
        )
    }
}
