"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Visualize() {
  const [imageUrl, setImageUrl] = useState("");
  const [whiteImageUrl, setWhiteImageUrl] = useState("");
  const [maskImage, setMaskImage] = useState("");

  const [clientContent, setClientContent] = useState("describe outfit");
  const [dalleResult, setDalleResult] = useState();
  const [whiteImgBg, setWhiteImgBg] = useState(false);
  const [whiteBgMaskImg, setWhiteBgMaskImg] = useState("");
  const [stabilityData, setStabilityData] = useState({ image: "" });

  const toggleImgBg = () => {
    setWhiteImgBg(!whiteImgBg);
  };
  useEffect(() => {
    getMostRecentImage();
    getMostRecentWhitebgImage();
    getMostRecentMaskImage();
    getMostRecentWhiteBgMaskImage();
  }, [setDalleResult, dalleResult]);

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
  Get most recent whiteBgImg that has been uploaded by current user
*/
  const getMostRecentWhitebgImage = async () => {
    const response = await fetch("/api/images/mostRecentWhiteBgImage", {
      cache: "no-store",
    });
    const data = await response.json();
    setWhiteImageUrl(data.url);
  };
  /* 
  Get most recent whiteBgImg that has been uploaded by current user
*/
  const getMostRecentMaskImage = async () => {
    const response = await fetch("/api/images/mostRecentMaskImage", {
      cache: "no-store",
    });
    const data = await response.json();
    setMaskImage(data.url);
  };

  /* 
  Get most recent whiteBgImg that has been uploaded by current user
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
    // setIsLoading(true);
    // console.log("calling dalle");
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
    }
  };
  /* 
  Trigger Stability with current image.
*/
  const callStability = async () => {
    console.log("calling stability");
    // setIsLoading(true);
    try {
      const stabilityResponse = await fetch("/api/stability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // input: clientContent, // need to set male or femala to focus the random
          url: whiteBgMaskImg,
        }), // Pass the URL from the previous response
      });
      console.log("Header");
      const stabilityData = await stabilityResponse.json();
      setStabilityData(stabilityData);
    } catch (error) {
    } finally {
    }
  };

  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      <Header />
      <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2 ">
          <div className="flex flex-row space-x-2 text-sm items-center pl-1">
            <p>Background</p>
            <Switch
              checked={whiteImgBg}
              onCheckedChange={toggleImgBg}
              aria-label="Toggle Background"
            />
            <p>Original Image</p>
            <Switch
              // checked={}
              // onCheckedChange={}
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
              }}
              //   disabled={}
              id="Activate Visualizer AI"
              type="submit"
            >
              Create
              {/* {isLoading ? "Loading..." : "Fetch Result"} */}
            </Button>
            <Button
              onClick={() => {
                callStability();
              }}
              //   disabled={}
              id="Activate Visualizer AI"
              type="submit"
            >
              Random
              {/* {isLoading ? "Loading..." : "Fetch Result"} */}
            </Button>
          </div>
        </div>

        {/* Make sure only ONE Image at a time */}
        <div className="h-[512px] bg-white">
          {!whiteImgBg && (
            <Image width={512} height={512} alt="" src={imageUrl} />
          )}
          {whiteImgBg && (
            <Image width={512} height={512} alt="" src={whiteImageUrl} />
          )}

          <Image
            width={512}
            height={512}
            alt=""
            // @ts-ignore
            src={dalleResult?.image?.data[0].url}
          />
          {/* <Image
            width={512}
            height={512}
            alt=""
            src={stabilityData?.image?.data[0].url}
          /> */}
          <img src={stabilityData.image} alt="Generated Image" />
        </div>
      </main>
    </div>
  );
}
