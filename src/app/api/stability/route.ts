//https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking

import { NextResponse } from "next/server";
import fetch from "node-fetch";
import FormData from "form-data";

const engineId = "stable-diffusion-xl-1024-v1-0";
const apiHost = process.env.API_HOST ?? "https://api.stability.ai";
const apiKey = process.env.STABILITY_API_KEY;

if (!apiKey) throw new Error("Missing Stability API key.");

export const maxDuration = 100;
export const fetchCache = "force-no-store";
export const revalidate = 0;

async function appendFileFromUrl(url: any, formData: any) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  formData.append("init_image", buffer, {
    type: "image/png",
  });
}

export async function POST(req: any) {
  const { url } = await req.json();
  const formData = new FormData();
  const imageUrl = url;
  await appendFileFromUrl(imageUrl, formData);

  formData.append("mask_source", "INIT_IMAGE_ALPHA");

  //FEMALE
  // formData.append(
  //   "text_prompts[0][text]",
  //   "Casual Wear: T-shirts, Jeans, Hoodies, Sneakers, Formal Wear: Suits, Dress Shirts, Ties, Dress Shoes, Athleisure: Activewear, Yoga Pants, Sports Bras, Running Shoes, Bohemian Style: Flowy Dresses, Fringe Accessories, Maxi Skirts, Sandals, Streetwear: Graphic Tees, Hoodies, Baseball Caps, Sneakers, Vintage Fashion: Retro Dresses, High-Waisted Pants, Vintage Blouses, Classic Accessories, Chic and Elegant: Shift Dresses, Blouses with Bow Ties, Pencil Skirts, Heels, Preppy Style: Polo Shirts, Khaki Pants, Sweaters tied around the shoulders, Loafers, Edgy Fashion: Leather Jackets, Distressed Jeans, Combat Boots, Dark Accessories, Business Casual: Chinos, Button-down Shirts, Loafers or Oxfords, Blazers, Gothic Style: Black Clothing, Fishnet Stockings, Dark Makeup, Platform Boots, Romantic Style: Lace Dresses, Floral Prints, Soft Fabrics, Ballet Flats, Eclectic Fashion: Mix and match various styles, Bold Patterns, Statement Accessories, Minimalist Fashion: Neutral Colors, Simple Silhouettes, Clean Lines, Basic Wardrobe Staples, Cultural and Ethnic Wear: Traditional Dresses, Ethnic Prints, Cultural Accessories, Handcrafted Items."
  // );
  // formData.append("text_prompts[0][weight]", "1");

  //MALE
  formData.append(
    "text_prompts[0][text]",
    "T-shirt or casual shirt, Jeans or chinos, Sneakers or casual shoes, Optional: Hoodie or denim jacket. Button-down shirt (long or short sleeve), Khakis or dress pants, Leather belt, Loafers or dress shoes, Optional: Blazer or sweater. Dress shirt, Dress pants, Tie or bowtie, Dress shoes, Suit jacket or blazer. Polo shirt or dress shirt, Chinos or tailored trousers, Loafers or desert boots, Optional: V-neck sweater or blazer. Dress shirt, Dress suit (matching jacket and pants), Silk tie, Dress shoes, Optional: Pocket square. Tuxedo or black suit, Dress shirt, Bowtie or silk tie, Dress shoes, Optional: Cummerbund or vest. Short-sleeve shirt or polo, Shorts or lightweight chinos, Boat shoes or canvas sneakers, Sunglasses and a hat. Athletic T-shirt or tank top, Joggers or athletic shorts, Sneakers or running shoes, Baseball cap or sports hat. Button-down shirt, Dark jeans or chinos, Dress shoes or stylish sneakers, Leather jacket or blazer. Moisture-wicking shirt, Cargo pants or outdoor shorts, Hiking boots or trail shoes, Hat and sunglasses."
  );
  formData.append("text_prompts[0][weight]", "1");

  formData.append("cfg_scale", "7");
  formData.append("samples", 1);
  formData.append("steps", 50);
  const seed = Math.floor(Math.random() * Math.pow(2, 32));
  formData.append("seed", `${seed}`);

  const response = await fetch(
    `${apiHost}/v1/generation/${engineId}/image-to-image/masking`,
    {
      method: "POST",
      headers: {
        ...formData.getHeaders(),
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`);
  }
  interface GenerationResponse {
    artifacts: Array<{
      base64: string;
      seed: number;
      finishReason: string;
    }>;
  }
  const responseJSON = (await response.json()) as GenerationResponse;
  const image = responseJSON.artifacts[0];
  const base64Image = `data:image/png;base64,${image.base64}`;

  return new Response(JSON.stringify({ image: base64Image }), { status: 200 });
}
