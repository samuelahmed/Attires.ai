import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import Jimp from "jimp";
import { auth, currentUser } from "@clerk/nextjs";

export const maxDuration = 100;

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadFileToS3(file: Buffer, fileName: string) {
  // Convert image to PNG
  let image = await Jimp.read(file);
  if (image.getMIME() !== Jimp.MIME_PNG) {
    fileName = "/tmp/" + fileName.replace(/\.[^/.]+$/, "") + ".png";
    image = await image.writeAsync(fileName);
  }

  // Resize image if it's larger than 4 MB
  const maxSize = 4 * 1024 * 1024;
  if (image.bitmap.data.length > maxSize) {
    const scaleFactor = Math.sqrt(maxSize / image.bitmap.data.length);
    const width = Math.floor(image.bitmap.width * scaleFactor);
    const height = Math.floor(image.bitmap.height * scaleFactor);
    image = image.resize(width, height);
  }
  // Resize image to fit within 1024x1024
  const scaleFactor = 1024 / Math.max(image.bitmap.width, image.bitmap.height);
  let width = Math.floor(image.bitmap.width * scaleFactor);
  let height = Math.floor(image.bitmap.height * scaleFactor);
  image = image.resize(width, height);
  // Create a new 1024x1024 white image
  let transparentImage = new Jimp(
    1024,
    1024,
    Jimp.rgbaToInt(255, 255, 255, 255)
  );
  // Calculate the position to center the image
  let x = (1024 - width) / 2;
  let y = (1024 - height) / 2;
  // Composite the original image onto the white image
  transparentImage = transparentImage.composite(image, x, y);
  // Now use transparentImage instead of image
  image = transparentImage;
  const processedImageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
  const key = `${fileName}-${Date.now()}`;
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
  /*
  Check current user and get ID
  */
  const { userId } = auth();
  const user = await currentUser();
  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  /*
  Take file from form data and put into buffer
  Call uploadFileToS3() with the buffer and get the s3 URL
  Create db entry with s3 URL, userId, and type Upload
  */
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return new NextResponse("No file");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const s3URL = await uploadFileToS3(buffer, file.name);
    const newEntry = await prismadb.image.create({
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
