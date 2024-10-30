"use client"

import { Inbox, Loader2 } from "lucide-react";
import React from "react"
import { useDropzone } from 'react-dropzone';
import { UplaodtoS3 } from "@/lib/db/s3";
import { useMutation } from "@tanstack/react-query";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from "next/navigation";


const FileUpload = () => {
    const router = useRouter();
    const [uploading, setuploading] = React.useState(false);
    
    const { mutate, isPending } = useMutation({
        mutationFn: async ({ file_key, file_name }: { file_key: string, file_name: string }) => {
            if (!file_key || !file_name) {
                console.log("missing filename or filekey in mutatefun")
            }
            const response = await axios.post("/api/create-chat", {
                file_key,
                file_name
            })
            return response.data

        }
    })


    const { getInputProps, getRootProps } = useDropzone({
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        onDrop: async (acceptedFile) => {
            "eu-north-1"
            console.log(acceptedFile);
            const file = acceptedFile[0];
            if (file.size > 10 * 1024 * 1024) {
                // bigger than 10mb!
                toast.error("File too large")
                return;
            }

            try {
                setuploading(true)
                const data = await UplaodtoS3(file);
                console.log("meow", data);
                if (!data?.file_key || !data.file_name) {
                    toast.error("something went wrong")
                    return;
                }
                mutate(data,
                    {
                        onSuccess: (data) => {
                            console.log("Response data:", data); // Check the structure of the response
                            const { chat_id } = data; // Ensure this matches the response structure
                            if (!chat_id) {
                                toast.error("Chat ID is undefined in the response");
                                return;
                            }
                            toast.success("Chat created!");
                            router.push(`/chat/${chat_id}`);
                        },
                        onError() {
                            toast.error("error creating chat")
                        }
                    }
                );
            }
            catch (error) {
                console.log(error)
            } finally {
                setuploading(false)
            }
        }
    })
    return (<>
        <div className="px-2 bg-white rounded-xl">
            <div {...getRootProps({
                className: "border-dashed border-2 rounded-xl cursor-pointer bg-grey-50 py-8 flex justify-center items-center flex-cols"
            })}>
                <input {...getInputProps()} />
                {uploading || isPending ? (
                    <>
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="mt-2 text-sm text-slate-200">Spilling Tea to GPT ....</p>
                    </>
                ) : (
                    <>
                        <Inbox className="w-10 h-10 text-blue-500 mx-2" />
                        <p className="mt-2 text-sm text-slate-500">Drop PDF Here</p>
                    </>
                )}
            </div>
        </div>
    </>)

}

export default FileUpload;