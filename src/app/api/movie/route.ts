import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { minioClient, bucket } from "@/config/minio"

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {

        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const maxShowtime = parseInt(formData.get("maxShowtime") as string);

        if (!file) {
            return NextResponse.json({ error: "error while getting image from request" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;


        await minioClient.putObject(bucket, fileName, buffer, buffer.length, {
            "Content-Type": file.type,
        });

        const fileUrl = `http://127.0.0.1:9000/${bucket}/${fileName}`;

        const createMovie = await prisma.movie.create({
            data: {
                title: title,
                description: description,
                image: fileUrl,
                maxShowtime: maxShowtime,
            }
        })

        return NextResponse.json(createMovie)

    } catch (error) {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}



