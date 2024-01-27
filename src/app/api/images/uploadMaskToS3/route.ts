// @ts-nocheck

import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import Jimp from "jimp";
import { auth, currentUser } from "@clerk/nextjs";
import PipelineSingleton from "./pipeline.js";

export const maxDuration = 100;

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


const url = "https://outfit-visualizer.s3.us-west-1.amazonaws.com/Screenshot 2024-01-18 at 1.50.20 AM.png-1706331200459"

async function maskImage() {
  //need to get the URL from uploadToS3
  // const url = await uploadFileToS3(file, fileName);
  const url = "https://outfit-visualizer.s3.us-west-1.amazonaws.com/Screenshot 2024-01-18 at 1.50.20 AM.png-1706331200459"

  const segmenter = await PipelineSingleton.getInstance();
  const output = await segmenter(url);

  let image = await Jimp.read(url);
  // Convert image to PNG
  // if (image.getMIME() !== Jimp.MIME_PNG) {
    // fileName = fileName.replace(/\.[^/.]+$/, "") + ".png";
  //   image = await image.getBufferAsync(Jimp.MIME_PNG);
  //   image = await Jimp.read(image);
  // }

  // Create a new 1024x1024 white image
  let whiteImage = new Jimp(1024, 1024, Jimp.rgbaToInt(255, 255, 255, 255));

  // Resize image to fit within 1024x1024
  const scaleFactor = 1024 / Math.max(image.bitmap.width, image.bitmap.height);
  let width = Math.floor(image.bitmap.width * scaleFactor);
  let height = Math.floor(image.bitmap.height * scaleFactor);
  image = image.resize(width, height);
  
  // Calculate the position to center the image
  let x = (1024 - width) / 2;
  let y = (1024 - height) / 2;

  // Composite the original image onto the white image
  whiteImage = whiteImage.composite(image, x, y);

  const labels = [
    "Upper-clothes",
    "Pants",
    "Left-shoe",
    "Right-shoe",
    "Left-arm",
    "Right-arm",
    "Left-leg",
    "Right-leg",
  ];
  const masks = output
    .filter((segment) => labels.includes(segment.label))
    .map((segment) => segment.mask);

  // Apply the mask
  for (let mask of masks) {
    for (let y = 0; y < mask.height; y++) {
      for (let x = 0; x < mask.width; x++) {
        if (mask.data[y * mask.width + x]) {
          whiteImage.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 0), x, y);
        }

      }
    }
  }

  const processedImageBuffer = await whiteImage.getBufferAsync(Jimp.MIME_PNG);
  const maskKey = `mask-${Date.now()}`;
  const maskParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: maskKey,
    Body: processedImageBuffer,
    ContentType: "image/png",
  };
  const maskCommand = new PutObjectCommand(maskParams);
  await s3Client.send(maskCommand);
  const s3URLMaskImg = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${maskKey}`;
  return s3URLMaskImg;
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
  */
  try {
    // const formData = await request.formData();
    // const file = formData.get("file") as File;
    // if (!file) {
    //   return new NextResponse("No file");
    // }
    // const buffer = Buffer.from(await file.arrayBuffer());
    //need to the URL from uploadFileToS3
    const s3URL = await maskImage();

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
