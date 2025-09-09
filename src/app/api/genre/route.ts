import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { name } = body;

        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const genre = await prisma.genre.create({
            data: {
                name: name,
            }
        })

        return NextResponse.json(genre)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while creating genre" }, { status: 500 })
    }
}

export const GET = async () => {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const genres = await prisma.genre.findMany({
            select: {
                id: true,
                name: true,
            }
        })

        return NextResponse.json(genres)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 })
    }
}