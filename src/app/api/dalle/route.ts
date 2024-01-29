import OpenAI from "openai";
import fetch from "node-fetch";
import FormData from "form-data";

//increase timeout to 25s instead of 10s
export const runtime = "edge";
export const maxDuration = 100;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {

  console.log('DALLE CALLED')

  const { input, imgURL } = await request.json();
  const imageUrl = imgURL;
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const formData = new FormData();
  
  formData.append("image", blob, "image.png");

  const result = await openai.images.edit({
    image: (formData as any).get("image"),
    prompt: input,
  });

  console.log(result)

  return new Response(JSON.stringify({ image: result }), { status: 200 });
}
