import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import Jimp from "jimp";
import { auth, currentUser } from "@clerk/nextjs";


const sharp = require('sharp');


export const maxDuration = 100;

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadFileToS3(file: Buffer, fileName: string) {


  // Read the file info
  // console.log(file.byteLength)
  let image = await Jimp.read(file);

  console.log('STARTED PROCESSS')

  // Rename file with png file extension
  fileName = Date.now() + ".png";

  // Resize image if size is over 4mb
  const maxSize = 4 * 1024 * 1024;
  if (image.bitmap.data.length > maxSize) {
    console.log('HERE')
    const width = 1024;
    const height = 1024;
    image = image.scaleToFit(width, height);
  }

  // Resize image to fit within 1024x1024 canvas with white bg
  let width = Math.floor(image.bitmap.width);
  let height = Math.floor(image.bitmap.height);

  // Create a new 1024x1024 white image
  let transparentImage = new Jimp(
    1024,
    1024,
    Jimp.rgbaToInt(255, 255, 255, 255)
  );

  // Find Center
  let x = (1024 - width) / 2;
  let y = (1024 - height) / 2;

  // Set original image on the white bg 1024x1024
  transparentImage.composite(image, x, y);

  // Place final png image in a buffer
  const processedImageBuffer = await transparentImage.getBufferAsync(
    Jimp.MIME_PNG
  );

  // Upload image buffer to S3
  const key = fileName;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: processedImageBuffer,
    ContentType: "image/png",
  };
  const command = new PutObjectCommand(params);
  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("Failed to send command to S3:", error);
  }
  const s3URL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return s3URL;
}

export async function POST(request: Request) {
  // Check user authentication status
  const { userId } = auth();
  const user = await currentUser();
  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Pass s3 URL to database
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return new NextResponse("No file");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const s3URL = await uploadFileToS3(buffer, file.name);
    await prismadb.image.create({
      data: {
        userId: userId,
        type: "Upload",
        url: s3URL,
      },
    });
    return NextResponse.json({
      s3URL,
      success: true,
    });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({
        error: error.message,
      });
    } else {
      return NextResponse.json({
        error: "An unknown error occurred",
      });
    }
  }
}
