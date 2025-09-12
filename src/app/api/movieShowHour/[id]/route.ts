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

        const movieShowHour = await prisma.movieShowHour.findUnique({
            where: { id: id },
            select: {
                id: true,
                movieShowHour: true,
                movieShowDate: {
                    select: {
                        movie: {
                            select: {
                                title: true
                            }
                        }
                    }
                }
            }
        })

        if (!movieShowHour) {
            return NextResponse.json({ error: "Movie show time not found" }, { status: 404 })
        }

        return NextResponse.json(movieShowHour)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch movie show time" }, { status: 500 })
    }
}

export const PUT = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
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

        const existingmovieShowHour = await prisma.movieShowHour.findUnique({
            where: { id: id }
        });

        if (!existingmovieShowHour) {
            return NextResponse.json({ error: "Movie show time not found" }, { status: 404 })
        }

        const body = await request.json();
        const { name, movieShowHour, movieId, maxSeat } = body;

        const updateData: any = {};

        if (name && name.trim() !== "") {
            updateData.name = name.trim();
        }

        if (movieShowHour) {
            updateData.movieShowHour = new Date(movieShowHour);
        }

        if (movieId && movieId.trim() !== "") {
            updateData.movieId = movieId.trim();
        }

        if (maxSeat && !isNaN(parseInt(maxSeat))) {
            updateData.maxSeat = parseInt(maxSeat);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No data provided for update" }, { status: 400 })
        }

        const updatedmovieShowHour = await prisma.movieShowHour.update({
            where: { id: id },
            data: updateData
        })

        return NextResponse.json(updatedmovieShowHour)
    } catch (error) {
        console.error("Error updating movie show time:", error);
        return NextResponse.json({ error: "Internal server error while updating movie show time" }, { status: 500 })
    }
}

export const DELETE = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
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

        await prisma.movieShowHour.delete({
            where: { id: id }
        })

        return NextResponse.json({ message: "Movie show time deleted successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while deleting movie show time" }, { status: 500 })
    }
}