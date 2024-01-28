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
  const [whiteImgBg, setWhiteImgBg] = useState(false);
  const toggleImgBg = () => {
    setWhiteImgBg(!whiteImgBg);
  };
  useEffect(() => {
    getMostRecentImage();
    getMostRecentWhitebgImage();
  }, []);

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
              //   value={}
              //   onChange={}
              type="email"
              placeholder="Tell the AI what to design"
            />
            <Button
              //   onClick={() => {}}
              //   disabled={}
              id="Activate Visualizer AI"
              type="submit"
            >
              Create
              {/* {isLoading ? "Loading..." : "Fetch Result"} */}
            </Button>
          </div>
        </div>
        <div className="h-[512px] bg-white">
          {!whiteImgBg && (
            <Image width={512} height={512} alt="" src={imageUrl} />
          )}
          {whiteImgBg && (
            <Image width={512} height={512} alt="" src={whiteImageUrl} />
          )}
        </div>
      </main>
    </div>
  );
}
