import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { movieShowHour, movieShowDateId } = body;

        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const date = await prisma.movieShowDate.findUnique({
            where: {
                id: movieShowDateId
            },
            select: {
                movieShowDate: true
            }
        })

        if (!date) {
            return NextResponse.json({ error: "Movie show date not found" }, { status: 404 })
        }

        const movieDate = new Date(date.movieShowDate)

        const onlymovieShowHour = new Date(movieShowHour.getFullYear(), movieShowHour.getMonth(), movieShowHour.getDate());
        const onlymovieDate = new Date(movieDate.getFullYear(), movieDate.getMonth(), movieDate.getDate());

        if (onlymovieShowHour.getTime() !== onlymovieDate.getTime()) {
            return NextResponse.json(
                { error: "Tanggal harus sama" },
                { status: 500 }
            );
        }

        const movieShowHourRecord = await prisma.movieShowHour.create({
            data: {
                movieShowHour: new Date(movieShowHour),
                movieShowDateId: movieShowDateId,
            }
        })

        return NextResponse.json(movieShowHourRecord)
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

        const movieShowHours = await prisma.movieShowHour.findMany({
            select: {
                id: true,
                movieShowHour: true,
                movieShowDate: {
                    select: {
                        movieShowDate: true,
                        movie: {
                            select: {
                                title: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(movieShowHours)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch movie show times" }, { status: 500 })
    }
}