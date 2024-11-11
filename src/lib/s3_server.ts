import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();


export async function downloadfromS3(file_key: string): Promise<string | null> {
    try {
        console.log("Attempting to download file from S3 with key:", file_key);
        console.log("Using bucket:", process.env.NEXT_PUBLIC_S3_BUCKET_NAME);
        console.log("Using key:", file_key);


        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
            region: "eu-north-1",
        })
        console.log("here in code 1");

        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!
            },
            region: "eu-north-1",
            // "eu-north-1"
        })

        console.log("here in code 2");

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
        }
        console.log("here in code 3");

        const obj = await s3.getObject(params).promise();
        console.log("here in code 4");
        const file_name = `/tmp/pdf-${Date.now()}.pdf`
        console.log("here in code 5");
        fs.writeFileSync(file_name, obj.Body as Buffer);
        console.log("here in code 6");
        console.log("Attempting to download file from S3 with name :", file_name);
        return file_name
    } catch (error) {
        console.log("error is in download from S3", error);
        return null
    }

}