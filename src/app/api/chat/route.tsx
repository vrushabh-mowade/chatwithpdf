import { NextResponse } from 'next/server';
import { cohere } from '@ai-sdk/cohere';
import { generateText, Message } from 'ai';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getContext } from '@/lib/context';

type MessageArray = {
  messages: Message[];
  chatId: string; // Define chatId in the type
};

export async function POST(req: Request) {
  try {
    const model = cohere('command-r-plus');
    const body: MessageArray = await req.json(); // Extract body as MessageArray
    console.log("body is", body);

    const { messages, chatId } = body; // Destructure messages and chatId
    const message = messages.map((message: Message) => message.content).join("\n");

    console.log("Generated message is:", message);
    console.log("which is ",chatId);
    const chatID = parseInt(chatId,10)
    console.log("that is ",chatID);
    const _chats = await db.select().from(chats).where(eq(chats.id,chatID));
    if (_chats.length !== 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    
    const fileKey = _chats[0].fileKey;
    const lastMessage = message;
    const context = await getContext(lastMessage, fileKey);

    const prompt1 = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to the question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    const { text } = await generateText({
      model,
      prompt: message,
    });
    
    console.log("Text response is:", text);

    // Updated response format
    return NextResponse.json({ role: "assistant", content: text });

  } catch (error) {
    console.log("The error is:", error);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
}
