import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { userId, movieSeatId, status } = body;

        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const reservation = await prisma.reservation.create({
            data: {
                userId: userId,
                movieSeatId: movieSeatId,
                status: status,
            }
        })

        return NextResponse.json(reservation)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while creating reservation" }, { status: 500 })
    }
}

export const GET = async () => {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const reservations = await prisma.reservation.findMany({
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

        return NextResponse.json(reservations)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
    }
}