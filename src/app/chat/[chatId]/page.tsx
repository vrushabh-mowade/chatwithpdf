

import { auth } from "@clerk/nextjs/server";
import React from "react";
import { db } from '@/lib/db/index'
import { chats } from '@/lib/db/schema'
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { error } from "console";
import ChatComponent from "@/components/ChatComponent";



type Props = {
    params: {
        chatId: string;
    };
};



const ChatPage = async ({ params: { chatId } }: Props) => {
    const { userId } = auth();

    if (!userId) {
        console.log("did not get user id");
        return error
    }
    const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
    if (!_chats) {
        console.log("did not get user _chats");
    }

    const currentchat = _chats.find((chat) => { return chat.id === parseInt(chatId) })
    console.log("pdf_url is a", currentchat?.pdfUrl)

    return (<>
        <div className="flex max-h-screen ">
            <div className="flex w-full max-h-screen overflow-scroll">
                {/* chat sidebar */}
                <div className="flex-[1] max-w-xs">
                    <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
                </div>
                {/* pdf viewer */}
                <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
                    <PDFViewer pdf_url={currentchat?.pdfUrl || ''} />
                </div>
                {/* chat component */}
                <div className="flex-[3] border-l-4 border-l-slate-200">
                    <ChatComponent chatId={chatId} />
                </div>
            </div>
        </div>
    </>)
}

export default ChatPage;