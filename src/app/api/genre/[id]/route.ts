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

        const genre = await prisma.genre.findUnique({
            where: { id: id },
            select: {
                id: true,
                name: true,
            }
        })

        if (!genre) {
            return NextResponse.json({ error: "Genre not found" }, { status: 404 })
        }

        return NextResponse.json(genre)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch genre" }, { status: 500 })
    }
}

export const PUT = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name } = body;

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

        const updatedGenre = await prisma.genre.update({
            where: { id: id },
            data: {
                name: name,
            }
        })

        return NextResponse.json(updatedGenre)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while updating genre" }, { status: 500 })
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

        await prisma.genre.delete({
            where: { id: id }
        })

        return NextResponse.json({ message: "Genre deleted successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while deleting genre" }, { status: 500 })
    }
}