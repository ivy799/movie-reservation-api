import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const GET = async (req: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
    try {

        const { userId } = await params;

        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userReservation = await prisma.reservation.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                userId: true,
                movieSeat: {
                    select: {
                        id: true,
                        movieShowHour: {
                            select: {
                                movieShowHour: true,
                                movieShowDate: {
                                    select: {
                                        movieShowDate: true,
                                        movie: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        return NextResponse.json(userReservation)
        return
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch your reservation" }, { status: 500 })
    }
}