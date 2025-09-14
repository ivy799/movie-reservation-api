import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { createClient } from "redis"

const prisma = new PrismaClient();
const redisClient = createClient()
redisClient.on('error', err => console.log('Redis Client Error', err));

await redisClient.connect();

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { movieShowHourId, status } = body;

        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const movieSeat = await prisma.movieSeat.create({
            data: {
                movieShowHourId: movieShowHourId,
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

        const cachedMovieSeatList = await redisClient.get('seat')
        
        if (cachedMovieSeatList != null) {
            return NextResponse.json(JSON.parse(cachedMovieSeatList))
        } else {
            const movieSeats = await prisma.movieSeat.findMany({
                select: {
                    id: true,
                    status: true,
                    movieShowHour: {
                        select: {
                            id: true,
                            movieShowDate: {
                                select: {
                                    movieShowDate: true,
                                    movie: {
                                        select: {
                                            title: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            await redisClient.set('seat', JSON.stringify(movieSeats))

            return NextResponse.json(movieSeats)
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch movie seats" }, { status: 500 })
    }
}