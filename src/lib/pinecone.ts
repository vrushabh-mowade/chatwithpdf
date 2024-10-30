import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { downloadfromS3 } from './s3_server';
import { Document } from "langchain/document";
import { getEmbeddings1 } from './embedding';
import { convertToAscii } from './utils';
import md5 from 'md5';
import dotenv from 'dotenv';

dotenv.config();


console.log("PINECONE_API_KEY2:", process.env.PINECONE_API_KEY);


// const pc = new Pinecone({ apiKey:process.env.PINECONE_API_KEY! });
let pinecone: Pinecone | null = null;
export const getPineconeClient = async () => {
    if (!pinecone) {
        console.log("PINECONE_API_KEY 11:", process.env.PINECONE_API_KEY);
        try {
            console.log("PINECONE_API_KEY 1:", process.env.PINECONE_API_KEY);
            pinecone = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY!,
            });
        } catch (error) {
            console.error("Failed to initialize Pinecone client:", error);
            throw error;
        }
    }
    console.log("PINECONE_API_KEY 3:", process.env.PINECONE_API_KEY);

    return pinecone;
};


// let pinecone: Pinecone | null = null;
// export const getPineconeClient = async () => {
//     if (!pinecone) {
//         const pinecone = new Pinecone({
//             apiKey:process.env.PINECONE_API_KEY!,
//             controllerHostUrl: process.env.PINECONDE_HOST_ADDRESS,
//         });
//         return pinecone
//     }else{
//         console.log("error creating pinecone client", error)
//     }
//     return pinecone
// }


type PDFPage = {
    pageContent: string,
    metadata: {
        loc: { pageNumber: number }
    }
}
export async function loadS3IntotheAws(file_key: string) {
    console.log("downloading the pdf from s3 server")

    // step 1 get the pdf download and read the pdf
    const file_name = await downloadfromS3(file_key)
    if (!file_name) {
        throw new Error("could not download from s3");
    }

    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    // step 2 split and segment the pdf 
    const document = await Promise.all(pages.map(prepareDocument));

    // step 3 vectorize and embed the individual docs 
    const vector = await Promise.all(document.flat().map(embedDocument))

    // Filter out any null values from the vector array
    const validVectors = vector.filter((vec): vec is PineconeRecord => vec !== null);

    // Step 4: Store the vectors in Pinecone
    if (validVectors.length === 0) {
        throw new Error("No valid vectors to upsert.");
    }

    const client = await getPineconeClient();
    const pineconeIndex = client.index('chatpdf-yt-2');
    console.log("Inserting vectors into Pinecone");

    const namespace = pineconeIndex.namespace(convertToAscii(file_key));
    console.log("Inserting vectors into Pinecone 1");
    await namespace.upsert(validVectors);

}
async function embedDocument(docs: Document) {
    // console.log("into embedDocument ")
    try {
        // console.log("into embedDocument 505 ");
        const embeddings = await getEmbeddings1(docs.pageContent);
        // console.log("embeddings are ", embeddings)
        if (!embeddings) {
            console.log("no embeddings");
            return null
        }
        const hash = md5(docs.pageContent);
        console.log("hash are ", hash)
        if (!hash) {
            console.log("no hash");
        }
        // console.log("into embedDocument 1");
        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: docs.metadata.text,
                pageNumber: docs.metadata.pageNumber
            }
        } as PineconeRecord
    } catch (error) {
        console.log("error while embedding the document in step 3", error)
        throw error
    }
}

export const truncateStringbyByte = (str: string, bytes: number) => {
    const enc = new TextEncoder();
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes));

}

async function prepareDocument(page: PDFPage) {
    let { pageContent } = page
    const {metadata} = page
     pageContent = pageContent.replace(/\n/g, '');
    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringbyByte(pageContent, 36000),
            }

        })
    ])
    return docs
}




// // Step 3: Vectorize and embed the individual documents 
// const vector = await Promise.all(document.flat().map(embedDocument));

// //step-4 store the vector in pinecone
// const client = await getPineconeClient();
// const pineconeIndex = client.index('chatpdf-yt')
// console.log("inserting vectors into pinecone");

// const namespace = pineconeIndex.namespace(convertToAscii(file_key));
// await namespace.upsert(vector);

// return document[0];


