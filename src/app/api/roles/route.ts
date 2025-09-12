import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json()
        const name = body.role

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

        const role = await prisma.role.create({
            data: {
                role: name,
            }
        })

        return NextResponse.json(role)
    } catch (error) {
        return NextResponse.json({ error: "Internal server error while creating role" }, { status: 500 })
    }
}


export const GET = async () => {
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

        const roles = await prisma.role.findMany({
            select: {
                id: true,
                role: true,
            }
        })

        return NextResponse.json(roles)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })

    }
}