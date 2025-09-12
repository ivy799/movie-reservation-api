import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { name, movieShowTime, movieId, maxSeat } = body;

        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const date = new Date(movieShowTime)
        date.setHours(0,0,0,0)

        const movieShowTimeRecord = await prisma.movieShowDate.create({
            data: {
                movieShowDate: date,
                movieId: movieId,
            }
        })

        return NextResponse.json(movieShowTimeRecord)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while creating movie show time" }, { status: 500 })
    }
}

export const GET = async () => {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const movieShowTimes = await prisma.movieShowDate.findMany({
            select: {
                id: true,
                movieShowDate: true,
                movie: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            }
        })

        return NextResponse.json(movieShowTimes)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch movie show times" }, { status: 500 })
    }
}