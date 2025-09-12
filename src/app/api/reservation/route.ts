import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { userId, movieSeatId } = body;

        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Validasi seat availability
        const movieSeat = await prisma.movieSeat.findUnique({
            where: { id: movieSeatId }
        });

        if (!movieSeat) {
            return NextResponse.json({ error: "Movie seat not found" }, { status: 404 })
        }

        if (movieSeat.status !== 0) {
            return NextResponse.json({ error: "Seat is not available" }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.create({
                data: {
                    userId: userId,
                    movieSeatId: movieSeatId,
                }
            });

            await tx.movieSeat.update({
                where: {
                    id: movieSeatId
                },
                data: {
                    status: 1
                }
            });

            return reservation;
        });

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error creating reservation:", error);
        return NextResponse.json({ error: "Internal server error while creating reservation" }, { status: 500 })
    }
}

export const GET = async () => {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        
        const loggedUser = await prisma.user.findUnique({
            where: {
                id: session.user.id
            },
            select: {
                role: {
                    select: {
                        role: true
                    }
                }
            }
        })

        if (loggedUser?.role.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const reservations = await prisma.reservation.findMany({
            select: {
                id: true,
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
                        movieShowHour: {
                            select: {
                                id: true,
                                movieShowHour: true,
                                movieShowDate: {
                                    select: {
                                        movieShowDate: true
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