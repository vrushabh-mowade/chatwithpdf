import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { convertToAscii } from './utils';
import { getEmbeddings1 } from './embedding';






export async function GetMatchingsFromEmbeddings(embeddings: number[], fileKey: string) {

    try {
        console.log("into the contxt 1");
        let pinecone: Pinecone | null = null;
        console.log("into the contxt 2")
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
        console.log("into the contxt 3")

        const pineconeIndex = pinecone.index("chatpdf-yt-2");
        console.log("pineconeindex", pineconeIndex)
        const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
        console.log("namespace is ",namespace)
        const result = await namespace.query({ topK: 5, vector: embeddings, includeMetadata: true });
        console.log("result is ",result.matches || [])
        return result.matches || []
        


    } catch (error) {
        console.log("error querying embeddings", error);
        throw error;

    }




}


export async function getContext(query: string, fileKey: string) {
    const queryEmbeddings = await getEmbeddings1(query);
    const matches = await GetMatchingsFromEmbeddings(queryEmbeddings, fileKey);

    const qualifyingDocs = matches.filter(
        (match) => match.score && match.score > 0.7
    );

    type Metadata = {
        text: string;
        pageNumber: number;
    };

    let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
    // 5 vectors
    return docs.join("\n").substring(0, 3000);
}