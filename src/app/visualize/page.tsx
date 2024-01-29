"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Visualize() {
  
  const [imageUrl, setImageUrl] = useState("");
  const [maskImage, setMaskImage] = useState("");
  const [clientContent, setClientContent] = useState("describe outfit");
  const [dalleResult, setDalleResult] = useState();
  const [whiteBgMaskImg, setWhiteBgMaskImg] = useState("");
  const [stabilityData, setStabilityData] = useState({ image: "" });
  const [seeOriginal, setSeeOriginal] = useState(true);
  const [currentImage, setCurrentImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleSeeOriginal = () => {
    setSeeOriginal(!seeOriginal);
  };

  useEffect(() => {
    getMostRecentImage();
    getMostRecentMaskImage();
    getMostRecentWhiteBgMaskImage();
  }, []);

  useEffect(() => {
    if (stabilityData.image) {
      setCurrentImage(stabilityData.image);
    }
  }, [stabilityData]);

  useEffect(() => {
    // @ts-ignore
    if (dalleResult?.image?.data[0].url) {
      // @ts-ignore
      setCurrentImage(dalleResult?.image?.data[0].url);
    }
  }, [dalleResult]);

  /* 
  Get most recent image that has been uploaded by current user
*/
  const getMostRecentImage = async () => {
    const response = await fetch("/api/images/mostRecentImage", {
      cache: "no-store",
    });
    const data = await response.json();
    setImageUrl(data.url);
  };

  /* 
  Get most recent MaskImg that has been uploaded by current user
*/
  const getMostRecentMaskImage = async () => {
    const response = await fetch("/api/images/mostRecentMaskImage", {
      cache: "no-store",
    });
    const data = await response.json();
    setMaskImage(data.url);
  };

  /* 
  Get most recent whiteBgMaskImg that has been uploaded by current user
*/
  const getMostRecentWhiteBgMaskImage = async () => {
    const response = await fetch("/api/images/mostRecentWhiteBgMaskImage", {
      cache: "no-store",
    });
    const data = await response.json();
    setWhiteBgMaskImg(data.url);
  };

  /* 
  Trigger dalle with current image.
*/
  const callDalle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/dalle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: clientContent,
          imgURL: maskImage,
        }),
      });
      const data = await response.json();
      setDalleResult(data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  /* 
  Trigger Stability with current image.
*/
  const callStability = async () => {
    setIsLoading(true);
    try {
      const stabilityResponse = await fetch("/api/stability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: whiteBgMaskImg,
        }),
      });
      const stabilityData = await stabilityResponse.json();
      setStabilityData(stabilityData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      <Header />
      <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2 ">
          <div className="flex flex-row space-x-2 text-sm items-center pl-1">
            <p>Original Image</p>
            <Switch
              checked={seeOriginal}
              onCheckedChange={toggleSeeOriginal}
              aria-label="Toggle Original Image"
            />
          </div>
          <div className="flex flex-row space-x-2">
            <Input
              value={clientContent}
              onChange={(e) => setClientContent(e.target.value)}
              type="email"
              placeholder="Tell the AI what to design"
            />
            <Button
              onClick={() => {
                callDalle();
                setSeeOriginal(false);
              }}
              disabled={isLoading}
              id="Activate Visualizer AI"
              type="submit"
            >
              Create
            </Button>
            <Button
              onClick={() => {
                callStability();
                setSeeOriginal(false);
              }}
              disabled={isLoading}
              id="Activate Visualizer AI"
              type="submit"
            >
              Random
            </Button>
          </div>
        </div>
        <div className="h-[512px] bg-white">
          {seeOriginal === true && imageUrl && (
            <Image
              priority
              width={512}
              height={512}
              alt="meow"
              src={imageUrl}
            />
          )}
          {seeOriginal === false && currentImage && (
            <Image
              priority
              width={512}
              height={512}
              alt="meow"
              src={currentImage}
            />
          )}
        </div>
      </main>
    </div>
  );
}
