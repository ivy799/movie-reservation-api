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

        const role = await prisma.role.findUnique({
            where: { id: id },
            select: {
                id: true,
                role: true,
            }
        })

        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 })
        }

        return NextResponse.json(role)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 })
    }
}

export const PUT = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
        const body = await request.json();
        const { role } = body;

        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const updatedRole = await prisma.role.update({
            where: { id: id },
            data: {
                role: role,
            }
        })

        return NextResponse.json(updatedRole)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
    }
}

export const DELETE = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await prisma.role.delete({
            where: { id: id }
        })

        return NextResponse.json({ message: "Role deleted successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete role" }, { status: 500 })
    }
}

