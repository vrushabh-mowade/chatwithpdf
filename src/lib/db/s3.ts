import AWS from 'aws-sdk';


export async function UplaodtoS3(file : File){
    try {
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
        })

        const s3 = new AWS.S3({
            params : {
                Bucket:process.env.NEXT_PUBLIC_S3_BUCKET_NAME
        },
        region : "eu-north-1"
        })

        const file_key = 'uploads/'+ Date.now().toString() + file.name.replace(' ','-');
        const params = {
            Bucket : process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key : file_key,
            Body : file
        }

        s3.putObject(params).on('httpDownloadProgress',(evt)=>{
            console.log("uploading file to s3",parseInt(((evt.loaded*100)/evt.total).toString())+"%"
        )}).promise();

        return Promise.resolve({
            file_key,
            file_name : file.name
        })
    } catch (error) {
        console.log("error while uploading to S3" ,error);
}

}

export function getS3Url(file_key : File){
    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${file_key}`
    return(url);
    }