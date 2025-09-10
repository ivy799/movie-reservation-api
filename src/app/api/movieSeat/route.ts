import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { movieShowTimeId, status } = body;

        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const movieSeat = await prisma.movieSeat.create({
            data: {
                movieShowTimeId: movieShowTimeId,
                status: status,
            }
        })

        return NextResponse.json(movieSeat)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while creating movie seat" }, { status: 500 })
    }
}

export const GET = async () => {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const movieSeats = await prisma.movieSeat.findMany({
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
        })

        return NextResponse.json(movieSeats)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch movie seats" }, { status: 500 })
    }
}