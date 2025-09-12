import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"


const prisma = new PrismaClient();

// get spesific user
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        })
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
}