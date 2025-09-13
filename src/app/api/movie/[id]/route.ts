import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { minioClient, bucket } from "@/config/minio"

const prisma = new PrismaClient();

export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const movie = await prisma.movie.findUnique({
            where: { id: id },
            select: {
                id: true,
                title: true,
                description: true,
                image: true,
                movieShowDate: {
                    select: {
                        movieShowDate: true,
                        movieShowHour: {
                            select: {
                                movieShowHour: true,
                                movieSeat: {
                                    select: {
                                        id: true,
                                        status: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!movie) {
            return NextResponse.json({ error: "movie not found" }, { status: 404 })
        }

        return NextResponse.json(movie)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch movie" }, { status: 500 })
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

        const existingMovie = await prisma.movie.findUnique({
            where: {id: id}
        })

        if (!existingMovie) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 })
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const maxShowtimeStr = formData.get("maxShowtime") as string;

        const updateData: any = {};

        if (title && title.trim() !== "") {
            updateData.title = title.trim();
        }

        if (description && description.trim() !== "") {
            updateData.description = description.trim();
        }

        if (maxShowtimeStr && !isNaN(parseInt(maxShowtimeStr))) {
            updateData.maxShowtime = parseInt(maxShowtimeStr);
        }

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

            await minioClient.putObject(bucket, fileName, buffer, buffer.length, {
                "Content-Type": file.type,
            });

            updateData.image = `http://127.0.0.1:9000/${bucket}/${fileName}`;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No data provided for update" }, { status: 400 })
        }

        const updatedMovie = await prisma.movie.update({
            where: { id: id },
            data: updateData
        });

        return NextResponse.json(updatedMovie)
    } catch (error) {
        console.error("Error updating movie:", error);
        return NextResponse.json({ error: "Internal server error while updating movie" }, { status: 500 })
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

        await prisma.movie.delete({
            where: {
                id: id
            }
        })

        return NextResponse.json({ message: "Movie deleted successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while deleting movie" }, { status: 500 })
    }
}