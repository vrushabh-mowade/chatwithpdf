import { cn } from '@/lib/utils';
import { Message } from 'ai';
import React from 'react';

type Props = {
    messages: Message[],
    chatId :string
};

const MessageList = ({ messages }: Props) => {
    console.log("Into the message list component");
    if (!messages || messages.length === 0) return <></>;
    console.log("Here are your messages:", messages);

    return (
        <div className='flex flex-col gap-2 px-4'>
            {messages.map((message) => (
                <div 
                    key={message.id} 
                    className={cn(
                        'flex', 
                        message.role === 'user' ? 'justify-end' : 'justify-start pr-10'
                    )}
                >
                    <div
                        className={cn(
                            "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10",
                            { "bg-blue-600 text-white": message.role === "user" }
                        )}
                    >
                        <p>{typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessageList;
