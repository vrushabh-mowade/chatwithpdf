import { db } from "@/lib/db";
import { getS3Url } from "@/lib/db/s3";
import { chats } from "@/lib/db/schema";
import { loadS3IntotheAws } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const {userId} = auth();
    if(!userId){
        return NextResponse.json({error:"unauthorized"},{status:401})
    }
    try {
        const body = await req.json();
        const { file_key, file_name } = body;
        console.log(file_key, file_name);
        // const pages = await loadS3IntotheAws(file_key);
        console.log("File Key:", file_key);

        // const pages = 
        await loadS3IntotheAws(file_key).catch(err => {
            console.error("Error loading from S3:", err);
            // throw new Error("S3 loading failed");
        });
        
        const chat_Id = await db.insert(chats).values({
            fileKey:file_key,
            pdfName:file_name,
            pdfUrl:getS3Url(file_key),
            userId
        }).returning({
            insertedId:chats.id
        })

        return NextResponse.json({
            chat_id : chat_Id[0].insertedId,
        },{status :200});
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        );
    }
}
