"use client";

import React, { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import MessageList from './MessageList';
import { Message } from 'ai/react';
import { messages as _messages } from '@/lib/db/schema';
import { db } from '@/lib/db';

type Props = {
    chatId: string
};

// // Mockup function for Cohere API call
// const CohereStream = async (input: string, onStart: () => void, onCompletion: (response: string) => void) => {
//     onStart(); // Call onStart to save the user message

//     // Simulate a delay for the API call
//     const response = await new Promise<{ text: string }>((resolve) => {
//         setTimeout(() => {
//             // Mock response from Cohere API
//             resolve({ text: `Cohere response to: ${input}` });
//         }, 1000);
//     });

//     // Call onCompletion with the response from the Cohere API
//     onCompletion(response.text);
// };

const ChatComponent = ({ chatId }: Props) => {
    console.log("chat id is", chatId);
    const [messages, setMessages] = useState<Message[]>([]);
    const { input, handleInputChange, handleSubmit } = useChat({
        api: '/api/chat',
        body: { chatId  },

        onResponse: async (response) => {
            const data = await response.json();
            const content = data.content;
           

            // Filter out common closing statements
            const commonClosingStatements = [
                "I hope that clarifies things!",
                "Let me know if you would like further details or have additional questions."
            ];
            let filteredContent = content;
            commonClosingStatements.forEach(statement => {
                if (filteredContent.includes(statement)) {
                    filteredContent = filteredContent.replace(statement, "").trim();
                }
            });

            // Update the messages state with the assistant's filtered response
            setMessages((prevMessages) => [
                ...prevMessages,
                { id: new Date().toISOString(), role: "assistant", content: filteredContent },
            ]);

            // // Call CohereStream instead of OpenAIStream
            // await CohereStream(input, async () => {
            //     // Save user message into db
            //     await db.insert(_messages).values({
            //         chatId: parseInt(chatId),
            //         content: input,
            //         role: "user",
            //     });
            // }, async (completion) => {
            //     // Save AI message into db
            //     await db.insert(_messages).values({
            //         chatId: parseInt(chatId),
            //         content: completion,
            //         role: "system",
            //     });
            // });
        },
    });

    // Scroll to bottom of messages whenever messages change
    useEffect(() => {
        const messageContainer = document.getElementById("message-container");
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    console.log("Here are your messages:", messages);

    return (
        <div className='relative max-h-screen overflow-scroll' id='message-container'>
            <div className='sticky top-0 inset-x-0 p-2 bg-white h-fit'>
                <h3 className='text-xl font-bold'>Chat</h3>
            </div>
            <MessageList messages={messages} chatId={chatId} />
            <form onSubmit={(e) => {
                e.preventDefault();
                setMessages((prev) => [
                    ...prev,
                    { id: new Date().toISOString(), role: "user", content: input }
                ]);
                handleSubmit(e);
            }} className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white">
                <div className="flex">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder='Ask any question...'
                        className='w-full'
                    />
                    <Button type="submit" className="bg-blue-600 ml-2">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChatComponent;
