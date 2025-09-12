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

        const movieSeat = await prisma.movieSeat.findUnique({
            where: { id: id },
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

        if (!movieSeat) {
            return NextResponse.json({ error: "Movie seat not found" }, { status: 404 })
        }

        return NextResponse.json(movieSeat)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch movie seat" }, { status: 500 })
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

        const existingMovieSeat = await prisma.movieSeat.findUnique({
            where: { id: id }
        });

        if (!existingMovieSeat) {
            return NextResponse.json({ error: "Movie seat not found" }, { status: 404 })
        }

        const body = await request.json();
        const { movieShowTimeId, status } = body;

        const updateData: any = {};

        if (movieShowTimeId && movieShowTimeId.trim() !== "") {
            updateData.movieShowTimeId = movieShowTimeId.trim();
        }

        if (status !== undefined && !isNaN(parseInt(status))) {
            updateData.status = parseInt(status);
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No data provided for update" }, { status: 400 })
        }

        const updatedMovieSeat = await prisma.movieSeat.update({
            where: { id: id },
            data: updateData
        })

        return NextResponse.json(updatedMovieSeat)
    } catch (error) {
        console.error("Error updating movie seat:", error);
        return NextResponse.json({ error: "Internal server error while updating movie seat" }, { status: 500 })
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

        await prisma.movieSeat.delete({
            where: { id: id }
        })

        return NextResponse.json({ message: "Movie seat deleted successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while deleting movie seat" }, { status: 500 })
    }
}