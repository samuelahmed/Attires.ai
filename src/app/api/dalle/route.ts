import OpenAI from "openai";
import fetch from "node-fetch";
import FormData from "form-data";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 100;

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function uploadResultToS3(imgURL: string, input: string) {
  const response = await fetch(imgURL);
  const blob = await response.blob();
  const formData = new FormData();

  formData.append("image", blob, "image.png");
  const result = await openai.images.edit({
    image: (formData as any).get("image"),
    prompt: input,
  });

  let imageResponse;
  if (result.data[0] && result.data[0].url) {
    imageResponse = await fetch(result.data[0].url);
  } else {
    console.error("URL is not defined");
    return;
  }
  const imageArrayBuffer = await imageResponse.arrayBuffer();
  const imageBuffer = Buffer.from(imageArrayBuffer);
  const key = `${Date.now()}`;
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: imageBuffer,
    ContentType: "image/png",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  const s3URL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return s3URL;
}

export async function POST(request: Request) {
  const { userId } = auth();
  const user = await currentUser();
  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { input, imgURL } = await request.json();
    console.log('IMG URL', imgURL)
    const s3URL = await uploadResultToS3(imgURL, input);

    return new Response(JSON.stringify({ image: s3URL }), { status: 200 });
  } catch (error) {
    console.log("Error in openai.images.edit:", error);
  }
}
