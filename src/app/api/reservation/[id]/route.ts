import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const reservation = await prisma.reservation.findUnique({
            where: { id: id },
            select: {
                id: true,
                status: true,
                reservedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                movieSeat: {
                    select: {
                        id: true,
                        status: true,
                        showTime: {
                            select: {
                                id: true,
                                name: true,
                                movieShowTime: true,
                                movie: {
                                    select: {
                                        id: true,
                                        title: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!reservation) {
            return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
        }

        return NextResponse.json(reservation)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reservation" }, { status: 500 })
    }
}

export const PUT = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if reservation exists
        const existingReservation = await prisma.reservation.findUnique({
            where: { id: id }
        });

        if (!existingReservation) {
            return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
        }

        const body = await request.json();
        const { userId, movieSeatId, status } = body;

        // Build update data dynamically
        const updateData: any = {};

        if (userId && userId.trim() !== "") {
            updateData.userId = userId.trim();
        }

        if (movieSeatId && movieSeatId.trim() !== "") {
            updateData.movieSeatId = movieSeatId.trim();
        }

        if (status !== undefined && !isNaN(parseInt(status))) {
            updateData.status = parseInt(status);
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No data provided for update" }, { status: 400 })
        }

        const updatedReservation = await prisma.reservation.update({
            where: { id: id },
            data: updateData
        })

        return NextResponse.json(updatedReservation)
    } catch (error) {
        console.error("Error updating reservation:", error);
        return NextResponse.json({ error: "Internal server error while updating reservation" }, { status: 500 })
    }
}

export const DELETE = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await prisma.reservation.delete({
            where: { id: id }
        })

        return NextResponse.json({ message: "Reservation deleted successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while deleting reservation" }, { status: 500 })
    }
}