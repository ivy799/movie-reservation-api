import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();


export const GET = async (req: NextRequest) => {
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
                movieSeat: {
                    select: {
                        movieShowHour: {
                            select: {
                                movieShowDate: {
                                    select: {
                                        movie: {
                                            select: {
                                                price: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        const revenue = reservations.reduce((acc, res) => {
            const price = res.movieSeat.movieShowHour.movieShowDate.movie.price || 0;
            return acc + price;
        }, 0)

        return NextResponse.json({ revenue });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 })
    }
}