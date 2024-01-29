//https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking

import { NextResponse } from "next/server";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "node:fs";
import path from "path";

// const prisma = new PrismaClient();
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
    filename: "maskImg.png",
    type: "image/png",
  });
}

export async function POST(req: any) {

  const { input, url } = await req.json();
  const formData = new FormData();
  const imageUrl = url;
  await appendFileFromUrl(imageUrl, formData);



          // const maskImagePath = path.resolve(process.cwd(), "public/anotherXLtest.png");
        // formData.append("mask_image", fs.readFileSync(maskImagePath));

        //RANDOM OUTFIT WORKS BEST WITH WHITE BG
        // const initImagePath = path.resolve(process.cwd(), "public/anotherXLtest.png");
        // formData.append("init_image", fs.readFileSync(initImagePath));


  formData.append("mask_source", "INIT_IMAGE_ALPHA");

  //TO USE LOCAL MASK'd IMAGES
        // const initImagePath = path.resolve(process.cwd(), "public/mImg10.png");
        // const maskImagePath = path.resolve(process.cwd(), "public/mask10.png");
        // formData.append("init_image", fs.readFileSync(initImagePath));
        // formData.append("mask_image", fs.readFileSync(maskImagePath));
        // formData.append("mask_source", "MASK_IMAGE_WHITE");




  //BASIC PROMPT
                                                //Seems to work better for women & without any background
                                                //Even works decent on dudes if the BG is white
  formData.append("text_prompts[0][text]", "Casual Wear: T-shirts, Jeans, Hoodies, Sneakers, Formal Wear: Suits, Dress Shirts, Ties, Dress Shoes, Athleisure: Activewear, Yoga Pants, Sports Bras, Running Shoes, Bohemian Style: Flowy Dresses, Fringe Accessories, Maxi Skirts, Sandals, Streetwear: Graphic Tees, Hoodies, Baseball Caps, Sneakers, Vintage Fashion: Retro Dresses, High-Waisted Pants, Vintage Blouses, Classic Accessories, Chic and Elegant: Shift Dresses, Blouses with Bow Ties, Pencil Skirts, Heels, Preppy Style: Polo Shirts, Khaki Pants, Sweaters tied around the shoulders, Loafers, Edgy Fashion: Leather Jackets, Distressed Jeans, Combat Boots, Dark Accessories, Business Casual: Chinos, Button-down Shirts, Loafers or Oxfords, Blazers, Gothic Style: Black Clothing, Fishnet Stockings, Dark Makeup, Platform Boots, Romantic Style: Lace Dresses, Floral Prints, Soft Fabrics, Ballet Flats, Eclectic Fashion: Mix and match various styles, Bold Patterns, Statement Accessories, Minimalist Fashion: Neutral Colors, Simple Silhouettes, Clean Lines, Basic Wardrobe Staples, Cultural and Ethnic Wear: Traditional Dresses, Ethnic Prints, Cultural Accessories, Handcrafted Items.");  
  formData.append("text_prompts[0][weight]", "1");


// Prompt to complete the head
// formData.append("text_prompts[0][text]", `Complete the head in the original image without adding any new people by designing a ${input}.`);
// formData.append("text_prompts[0][weight]", "1");

// // Prompt to maintain skin color
// formData.append("text_prompts[1][text]", `The skin color around the ${input} should remain the same as the head in the original image.`);
// formData.append("text_prompts[1][weight]", "1");

// // Prompt to keep proportions
// formData.append("text_prompts[2][text]", `The proportions of the designed ${input} should match the head in the original image.`);
// formData.append("text_prompts[2][weight]", "1");
  
//NEW POSITIVE PROMPT
// formData.append("text_prompts[1][text]", "Only the person in the original image should appear within the mask");
// formData.append("text_prompts[1][weight]", "1");

//NEW NEGATIVE PROMPT
// formData.append("text_prompts[2][text]", "Do not add any new people within the mask");
// formData.append("text_prompts[2][weight]", "-2");

//BASIC PROMPT + BIT
  // formData.append("text_prompts[0][text]", `Design a ${input} that fills the entire transparent mask and complete the person in the original image.`);
  // formData.append("text_prompts[0][weight]", "1");

  //START CURRENT BEST FORM
        // formData.append("text_prompts[0][text]", `fill the entire image with ${input}. The proportions of the ${input} are based on the original image.`)
        //         formData.append("text_prompts[0][weight]", "1");

                // formData.append("text_prompts[1][text]", `The proportions of the ${input} are based on the head of the person in the original image.`)
                // formData.append("text_prompts[1][weight]", "1");





        // formData.append("text_prompts[1][text]", `The ${input} should perfectly fit the person in the original image. Any new background should blurr perfectly with the background. There should be no visible border.`);
        // formData.append("text_prompts[1][weight]", "0.9");

        // formData.append("text_prompts[2][text]", `The generated ${input} and person must match the original image and fill the entire transparent mask area`);
        // formData.append("text_prompts[2][weight]", "0.9");

        // formData.append("text_prompts[3][text]", `Any areas not filled by the ${input} or person must exactly exted the original image without any border or unblended parts`);
        // formData.append("text_prompts[3][weight]", "0.9");

        //   formData.append("text_prompts[4][text]", `Any arms, legs, or other body-parts generated should match the skin tone and pigment of the person in the original image.`);
        // formData.append("text_prompts[4][weight]", "0.9");
  //END CURRENT BEST FORM

  //   formData.append(
  //     "text_prompts[0][text]": "A lighthouse on a cliff",
  // "text_prompts[0][weight]": 0.5,
  // "text_prompts[1][text]": "land, ground, dirt, grass",
  // "text_prompts[1][weight]": -0.6,

  //     // "text_prompts[0][text]",
  //     // `${input}`
  //     //  Masterpiece, best quality, very high intricate detailing, sharp focus, natural lighting, (((photorealistic))), octane render, HDR, 8k, and high contrast.`
  //   );
  // formData.append("text_prompts[0][text]", "Complete the image by creating an outfit that best fills the alpha channel to the best of your ability.");
  // formData.append("text_prompts[0][weight]", "0.3");
  // formData.append("text_prompts[0][text]", "You are a clothing designer, whose only job is to create clothing that matches the request");
  // formData.append("text_prompts[0][weight]", "0.3");

  // formData.append("text_prompts[0][text]", `${input}`);
  // formData.append("text_prompts[0][weight]", "1");
  // formData.append("text_prompts[1][text]", "Clothes fit the provided image with accurate proportions. The clothing and body should be aligned properly with the provided image, the outfit should be facing the same way as the person in the picture");
  // formData.append("text_prompts[1][weight]", "0.8");
  // formData.append("text_prompts[3][text]", "Pixels should  match the provided image and the background blend perfectly.");
  // formData.append("text_prompts[3][weight]", "0.4");
  // formData.append("text_prompts[4][text]", "Skin color must match the provided image and the proportions retained");
  // formData.append("text_prompts[4][weight]", "0.6");
  // formData.append("text_prompts[5][text]", "generated background should fit with the provided image");
  // formData.append("text_prompts[5][weight]", "0.3");
  // formData.append("text_prompts[6][text]", "elongated neck, hair not matching original image, part of person cutout before reaching image edge, background not matching, skin not matching, clarity different from original, not photorealistic");
  // formData.append("text_prompts[6][weight]", "-0.7");
  // formData.append("text_prompts[4][text]", "rim lighting, studio lighting, dslr, ultra quality, sharp focus, tack sharp, dof, film grain, Fujifilm XT3, crystal clear, 8K UHD, high detailed skin, skin pores");
  // formData.append("text_prompts[4][weight]", "0.1");
  // formData.append("text_prompts[5][text]", "generate background that is not exactly the original image");
  // formData.append("text_prompts[5][weight]", "-0.1");

  // let inputLoop = input + " .";
  // for (let i = 0; i < 10; i++) {
  //   inputLoop += input
  // }

  //HIDE THESE TWO
  // formData.append("text_prompts[4][text]", `Only generate ${input} and complete the person in the original image. Never generate new people, hair that is not on the person from the original image, skin tone that is not on the person in the original image, skin, or faces that are not in the original image.`);
  // formData.append("text_prompts[4][weight]", "0.9");

  // formData.append("text_prompts[5][text]", `people not in original image, hair not in original image, skin tone not in original image, skin not in original image, faces not in original image. Anything not photorealistics such as cartoons or anime, nudity. No drawings.`);
  // formData.append("text_prompts[5][weight]", "-0.9");
  // formData.append(
  //   "text_prompts[1][text]",
  //   `The ${input} is based on the original picture and fits in seamlessly. The edges of the ${input} align with the edges of the mask.`
  // );
  // formData.append("text_prompts[1][weight]", "1");

  // formData.append(
  //   "text_prompts[1][text]",
  //   `The ${input} should be a single outfit that completely fill the transparency mask`
  // );
  // formData.append("text_prompts[1][weight]", "1");

  // formData.append(
  //   "text_prompts[2][text]",
  //   `The ${input} gets its proportions from the head and face in the original image`
  // );
  // formData.append("text_prompts[2][weight]", "1");

  // formData.append(
  //   "text_prompts[3][text]",
  //   `Any area in the mask not filled by the ${input} should perfectly blend and complete the original background`
  // );
  // formData.append("text_prompts[3][weight]", "1");

  // formData.append("text_prompts[4][text]", `The ${input} is detailed, in 8k, and matches the rest of the image`);
  // formData.append("text_prompts[4][weight]", "1");

  // formData.append(
  //   "text_prompts[5][text]",
  //   `The ${input} is an attire worn by a person with good style`
  // );
  // formData.append("text_prompts[5][weight]", "0.5");

  // formData.append(
  //   "text_prompts[6][text]",
  //   `Only a ${input} is generated, no faces or new people will ever be generated.`
  // );
  // formData.append("text_prompts[6][weight]", "1");

  // formData.append(
  //   "text_prompts[6][text]",
  //   "There will be no extra long necks"
  // );
  // formData.append("text_prompts[6][weight]", "0.5");

  //things we don't want --- multiple outfits, cartoon, long neck
  // formData.append("text_prompts[1][text]", `The ${input} should be be an attire worn by a person with good style`);
  // formData.append("text_prompts[1][weight]", "0.5");

  // formData.append("text_prompts[1][text]", `fill entire aplha with ${input} in a proportional way to the original image`);
  // formData.append("text_prompts[1][weight]", "1");
  // formData.append("text_prompts[2][text]", `make sure image is proportional to the provided human face`);
  // formData.append("text_prompts[2][weight]", "1");

  // formData.append("text_prompts[1][text]", "Only one outfit should be generated and it should fit the face in the provided image");
  // formData.append("text_prompts[1][weight]", "0.8");
  // formData.append("text_prompts[2][text]", "Clothes fit the provided image with accurate proportions. The clothing and body should be aligned properly with the provided image, the outfit should be facing the same way as the person in the picture");
  // formData.append("text_prompts[2][weight]", "0.4");
  // formData.append("text_prompts[3][text]", "Pixels should match the provided image and the background blend perfectly.");
  // formData.append("text_prompts[3][weight]", "0.2");
  // formData.append("text_prompts[4][text]", "Skin color must match the exact tone and shade in the provided image and the proportions retained");
  // formData.append("text_prompts[4][weight]", "0.3");
  // formData.append("text_prompts[5][text]", "The generated background should seamlessly fit with the provided image");
  // formData.append("text_prompts[5][weight]", "0.2");
  // formData.append("text_prompts[6][text]", "Ensure necks are proportionate, hair matches, all parts reach image edge, background matches, skin matches, and clarity is consistent with original");
  // formData.append("text_prompts[6][weight]", "0.7");

  // formData.append("text_prompts[0][text]", `Generate a ${input} and complete the person in the initial image.`);
  // formData.append("text_prompts[0][weight]", "1");

  // formData.append("text_prompts[0][text]", `long neck, uneven skin tone, transparent limbs,`);
  // formData.append("text_prompts[0][weight]", "-0.5");

  // formData.append(
  //   "text_prompts[6][text]",
  //   `elongated neck, mismatched hair, multiple outfits, cartoon, tiny body, ${input} that is not proportional to the head`
  // );
  // formData.append("text_prompts[6][weight]", "-1");

  // K_DPMPP_2M, K_DPMPP_2S_ANCESTRAL, K_DPM_2, K_DPM_2_ANCESTRAL are likely different configurations or variants of the same base model.

  // K_DPM_2 not badd

  //K_DPMPP_2S_ANCESTRAL not bad

  // formData.append("sampler", "K_DPMPP_2S_ANCESTRAL");
  formData.append("cfg_scale", "7");
  // formData.append("clip_guidance_preset", "NONE");
  formData.append("samples", 1);
  formData.append("steps", 50); // adjust as needed
  // formData.append("clip_guidance_preset", "SLOWEST"); // disable color correction
  // formData.append("sampler", "K_DPMPP_2M"); // try a different sampler
  // formData.append("latent_noise", "0.5"); // adjust as needed
  // formData.append("sampler", "K_DPM_2"); // try a different sampler

  // formData.append("sampler", "K_DPM_2"); // adjust as needed  
  // formData.append("style_preset", "3d-model"); // replace "photographic" with your desired style preset
  //can pass seed for a 'get similar' button
  const seed = Math.floor(Math.random() * Math.pow(2, 32)); // generates a random integer between 0 and 4294967295
formData.append("seed", `${seed}`);
  // formData.append("seed", 44)
  // formData.append("stylesPreset", "photographic")

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

  //   responseJSON.artifacts.forEach((image, index) => {
  //     const outputPath = path.resolve(process.cwd(), `public/v1_img2img_masking_${index}.png`);
  //     fs.writeFileSync(outputPath, Buffer.from(image.base64, "base64"));
  //   });

  // Assuming there's only one artifact
  const image = responseJSON.artifacts[0];
  const base64Image = `data:image/png;base64,${image.base64}`;

  return new Response(JSON.stringify({ image: base64Image }), { status: 200 });
}
