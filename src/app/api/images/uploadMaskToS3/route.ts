import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import Jimp from "jimp";
import { auth, currentUser } from "@clerk/nextjs";
// @ts-ignore
import PipelineSingleton from "./pipeline.js";
import fetch from "node-fetch";

export const maxDuration = 100;
// export const fetchCache = "force-no-store";
// export const runtime = 'edge';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/*
BUG 
  An error occurred while writing the file to cache: [Error: ENOENT: no such file or directory, mkdir '/vercel'] {
    errno: -2,
    code: 'ENOENT',
    syscall: 'mkdir',
    path: '/vercel'
  }
*/
// Temp fix by placing await s3Client.send(maskCommand) in a try block

async function maskImage(imgUrl: string) {
  const destructureUrl = new URL(imgUrl);
  const url = destructureUrl.href;
  // const pathName = decodeURIComponent(destructureUrl.pathname);
  // const fileName = pathName.split("/").pop() || "";
  console.log('Before getting segmenter instance');
    // @ts-ignore
  const segmenter = await PipelineSingleton.getInstance();
  console.log('After getting segmenter instance');  
  
  console.log('Before segmenter call');
  const output = await segmenter(url);
  console.log('After segmenter call');
  
  // const output = await segmenter(url);

  console.log("Before fetching image data");

  // const response = await fetch(url);
  console.log('Before fetch call');
const response = await fetch(url);
console.log('After fetch call');



  // const buffer = await response.buffer();
  console.log('Before response.buffer call');
const buffer = await response.buffer();
console.log('After response.buffer call');


  console.log("Before Jimp.read");
  let image = await Jimp.read(buffer);
  console.log("After Jimp.read");
  /*
    It is important to set the mask on a white image or else the borders (if there is size diff)
    will be transparent and the AI will attempt to fill those areas. 
  */
  let whiteImage = new Jimp(1024, 1024, Jimp.rgbaToInt(255, 255, 255, 255));
  const scaleFactor = 1024 / Math.max(image.bitmap.width, image.bitmap.height);
  let width = Math.floor(image.bitmap.width * scaleFactor);
  let height = Math.floor(image.bitmap.height * scaleFactor);
  image = image.resize(width, height);
  let x = (1024 - width) / 2;
  let y = (1024 - height) / 2;
  whiteImage = whiteImage.composite(image, x, y);

  interface Segment {
    label: string;
    mask: {
      height: number;
      width: number;
      data: number[];
    };
  }

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
    .filter((segment: Segment) => labels.includes(segment.label))
    .map((segment: Segment) => segment.mask);
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
  const maskKey = `-mask-${Date.now()}`;

  // const maskKey = `${fileName}-mask-${Date.now()}`;
  const maskParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: maskKey,
    Body: processedImageBuffer,
    ContentType: "image/png",
  };
  const maskCommand = new PutObjectCommand(maskParams);
  console.log("Before s3Client.send");
  try {
    await s3Client.send(maskCommand);
  } catch (error) {
    console.error("Failed to send command to S3:", error);
  }
  console.log("After s3Client.send");
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
  Get url from the request
  pass the URL to maskImage function 
  The function will remove the background and upload the image to s3
  The url for the mask-image is passed to the db below
  */
  const { imgUrl } = await request.json();
  try {
    const s3URL = await maskImage(imgUrl);

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
    console.error("Error in POST function:", error);

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
