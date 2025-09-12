import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const GET = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const movieByGenre = await prisma.movieGenre.findMany({
            where: {
                genreId: id
            },
            select: {
                movie: {
                    select: {
                        title: true
                    }
                },
                genre: true
            }
        })

        return NextResponse.json(movieByGenre

        )
    } catch (error) {

    }
}