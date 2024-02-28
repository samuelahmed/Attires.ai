"use client";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/ui/pageHeader";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRef } from "react";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const videoRef3 = useRef(null);

  const handleVideoClick = (videoRef: React.RefObject<HTMLVideoElement>) => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="backgroundStyle h-screen">
      <div className="flex flex-col justify-center pt-20 md:pt-32 items-center">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2 ">
          <PageHeader>
            <PageHeaderHeading>Attires.ai</PageHeaderHeading>
            <PageHeaderDescription>
              Elevate your style with your personal virtual wardrobe. Try on
              endless outfits to discover the perfect look for you.
            </PageHeaderDescription>
            <div className="flex flex-col  items-center ">
              {!isSignedIn ? (
                <div>
                  <div className="flex flex-row items-start w-full space-x-2 ">
                    <SignInButton mode="modal" redirectUrl="/visualize">
                      <Button>Sign In</Button>
                    </SignInButton>

                    <SignUpButton redirectUrl="/visualize" mode="modal">
                      <Button variant={"outline"}>Register</Button>
                    </SignUpButton>
                  </div>
                </div>
              ) : null}
              {isSignedIn ? (
                <div className="items-center flex flex-col space-y-2">
                  <div>Hello, {user?.firstName} welcome to Attires.ai</div>
                  <Button onClick={() => router.push("/visualize")}>
                    Visualize
                  </Button>
                </div>
              ) : null}
            </div>
          </PageHeader>
        </div>
        <div className="flex flex-col md:flex-row w-full items-center justify-around md:space-x-4 space-y-4 md:space-y-0 my-16">
          <div>
            <p className="text-center font-semibold">1. Upload your Image</p>
            <video
              className="shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]"
              style={{ minHeight: "438px" }}
              loop
              playsInline
              poster="/vid1Preview.png"
              ref={videoRef1}
              width="320"
              height="240"
              onClick={() => handleVideoClick(videoRef1)}
            >
              <source src="/splashVidP1dl.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div>
            <p className="text-center font-semibold">
              2. Describe desired outfit
            </p>
            <video
              className="shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]"
              style={{ minHeight: "438px" }}
              loop
              playsInline
              poster="/vid2Preview.png"
              ref={videoRef2}
              width="320"
              height="240"
              onClick={() => handleVideoClick(videoRef2)}
            >
              <source src="/splashVidP2dl.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div>
            
            <p className="text-center font-semibold">3. Perfect the mask</p>
            <video
              className="shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]"
              style={{ minHeight: "438px" }}
              loop
              playsInline
              poster="/vid3Preview.png"
              ref={videoRef3}
              width="320"
              height="240"
              onClick={() => handleVideoClick(videoRef3)}
            >
              <source src="/splashVidP3dl.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
