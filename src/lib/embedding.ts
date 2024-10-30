// import { Configuration, OpenAIApi } from 'openai-edge'
import { CohereClient, Cohere } from 'cohere-ai';

// const config = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY!,

// })

// const openai = new OpenAIApi(config);
// export async function getEmbeddings(text: string) {
//     try {
//         const response = await openai.createEmbedding({
//             model: "text-embedding-3-small",
//             input: text.replace(/\n/g, ' '),
//         });
//         console.log("response are ", response);

//         // Directly access the data without assuming structure
//         const result = await response.json();
//         if (result.error) {
//             throw new Error(result.error.message); // Handle API errors
//         }
//         return result.data[0].embeddings as number[];
//     } catch (error) {
//         console.log("error calling openai embedding", error);
//         throw error;
//     }
// }


const client = new CohereClient({ token: process.env.COHERE_API_KEY, clientName: "" });

export async function getEmbeddings1(text: string) {
    try {
        const response = await client.v2.embed({
            texts: [text.replace(/\n/g, ' ')], // Clean the text
            model: "embed-english-v3.0",
            inputType: Cohere.EmbedInputType.SearchDocument,
            embeddingTypes: [
                Cohere.EmbeddingType.Float // Use Float embeddings
            ]
        });
        // Ensure response contains embeddings
        if (!response || !response.embeddings || !response.embeddings.float || !response.embeddings.float[0]) {
            throw new Error("No embeddings found in response");
        }

        return response.embeddings.float[0]; // Return the float embeddings

    } catch (error) {
        console.error("Error calling Cohere embedding:", error);
        throw error;
    }
}



// const client = new CohereClient({ token: process.env.COHERE_API_KEY, clientName: "" });
// export async function getEmbeddings1(text: string) {
//     try {
//         const response = await client.v2.embed(
//             {
//                 texts: [text],
//                 model: "embed-english-v3.0",

//                 inputType: Cohere.EmbedInputType.SearchDocument,
//                 embeddingTypes: [
//                     Cohere.EmbeddingType.Float
//                 ]
//             }
//         )
//         console.log("response are ", response);
//         // Directly access the data without assuming structure
//         const result = await response.embeddings
     
//         return result.data[0].embeddings as number[];

//     } catch (error) {
//         console.log("error calling cohere embedding", error);
//         throw error;
//     }

// }

