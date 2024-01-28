import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import Jimp from "jimp";
import { auth, currentUser } from "@clerk/nextjs";
// @ts-ignore
import PipelineSingleton from "./pipeline.js";

export const maxDuration = 100;

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function maskImage(imgUrl: string) {
  const destructureUrl = new URL(imgUrl);
  const url = destructureUrl.href;
  const pathName = decodeURIComponent(destructureUrl.pathname);
  const fileName = pathName.split("/").pop() || "";

  // @ts-ignore
  const segmenter = await PipelineSingleton.getInstance();
  const output = await segmenter(url);
  let image = await Jimp.read(url);

  interface Segment {
    label: string;
    mask: {
      height: number;
      width: number;
      data: number[];
    };
  }

  const backgroundMask = output.find(
    (segment: Segment) => segment.label === "Background"
  ).mask;
  for (let y = 0; y < backgroundMask.height; y++) {
    for (let x = 0; x < backgroundMask.width; x++) {
      if (backgroundMask.data[y * backgroundMask.width + x]) {
        image.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 0), x, y);
      }
    }
  }

  const processedImageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
  const maskKey = `${fileName}-whiteBg-${Date.now()}`;
  const maskParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: maskKey,
    Body: processedImageBuffer,
    ContentType: "image/png",
  };
  const maskCommand = new PutObjectCommand(maskParams);
  await s3Client.send(maskCommand);
  const s3URLWhiteBgImg = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${maskKey}`;
  return s3URLWhiteBgImg;
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
        type: "Upload-WhiteBg",
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
