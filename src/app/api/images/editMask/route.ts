// @ts-nocheck

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

async function uploadFileToS3(file, fileName) {
  let image = await Jimp.read(file);
  const maxSize = 4 * 1024 * 1024;
  if (image.bitmap.data.length > maxSize) {
    const scaleFactor = Math.sqrt(maxSize / image.bitmap.data.length);
    const width = Math.floor(image.bitmap.width * scaleFactor);
    const height = Math.floor(image.bitmap.height * scaleFactor);
    image = image.resize(width, height);
  }
  const scaleFactor = 1024 / Math.max(image.bitmap.width, image.bitmap.height);
  let width = Math.floor(image.bitmap.width * scaleFactor);
  let height = Math.floor(image.bitmap.height * scaleFactor);
  image = image.resize(width, height);

  let transparentImage = new Jimp(1024, 1024, Jimp.rgbaToInt(0, 0, 0, 0));
  let x = (1024 - width) / 2;
  let y = (1024 - height) / 2;

  transparentImage = transparentImage.composite(image, x, y);
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
  await s3Client.send(command);
  const s3URL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return s3URL;
}

export async function POST(request) {
  /*
  Check current user and get ID
  */
  const { userId } = auth();
  const user = await currentUser();
  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.error(new Error("No file uploaded"));
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const s3URL = await uploadFileToS3(buffer, file.name);

    const newEntry = await prismadb.image.create({
      data: {
        userId: userId,
        type: "Upload-Mask",
        url: s3URL,
      },
    });

    return NextResponse.json({
      s3URL,
      success: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message });
    } else {
      return NextResponse.json({ error: "An unknown error occurred" });
    }
  }
}
