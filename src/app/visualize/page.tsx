"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/useToast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export default function Visualize() {
  const [imageUrl, setImageUrl] = useState("");
  const [maskImage, setMaskImage] = useState("");
  const [clientContent, setClientContent] = useState("describe outfit");
  const [dalleResult, setDalleResult] = useState();
  const [stabilityData, setStabilityData] = useState({ image: "" });
  const [seeOriginal, setSeeOriginal] = useState(true);
  const [currentImage, setCurrentImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalUse, setTotalUse] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const toggleSeeOriginal = () => {
    setSeeOriginal(!seeOriginal);
  };

  useEffect(() => {
    getMostRecentImage();
    getMostRecentMaskImage();
    getTotalUseage();
    getSubscription();
  }, []);

  useEffect(() => {
    if (stabilityData.image) {
      setCurrentImage(stabilityData.image);
    }
  }, [stabilityData]);

  useEffect(() => {
    // @ts-ignore
    if (dalleResult?.image) {
      // @ts-ignore
      setCurrentImage(dalleResult.image);
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

  // Call API asking how many images have been used.
  const getTotalUseage = async () => {
    const response = await fetch("/api/useage", {
      cache: "no-store",
    });
    const data = await response.json();
    setTotalUse(data.currentPeriodUse);
  };

  // Call API asking if use is subscribed
  const getSubscription = async () => {
    const response = await fetch("/api/subscribed", {
      cache: "no-store",
    });
    const data = await response.json();
    setIsSubscribed(data.isSubscriptionActive);
  };

  /* 
  Trigger dalle with current image.
*/
  const callDalle = async () => {
    if (
      (isSubscribed === true && totalUse < 100) ||
      (isSubscribed !== true && totalUse < 10)
    ) {
      setIsLoading(true);
      setSeeOriginal(false);
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
        setTotalUse((prevCount) => prevCount + 1);

        // Call the /api/dallePrisma route with the s3URL
        const prismaResponse = await fetch("/api/dallePrisma", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: data,
          }),
        });
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    } else if (isSubscribed === true && totalUse >= 100) {
      toast({
        title: "You've used your 100 monthly images",
        description: "Contact us if you would like to increase your limit.",
        variant: "destructive",
        action: (
          <ToastAction
            onClick={() => {
              router.push("/subscription");
            }}
            altText="Try again"
          >
            Subscribe
          </ToastAction>
        ),
      });
      // alert("out of use - max 100");
    } else if (isSubscribed !== true && totalUse >= 10) {
      toast({
        title: "You've ran out of free images",
        description: "Subscribe for 100 monthly images.",
        variant: "destructive",
        action: (
          <ToastAction
            onClick={() => {
              router.push("/subscription");
            }}
            altText="Try again"
          >
            Subscribe
          </ToastAction>
        ),
      });
    }
  };

  /* 
  Trigger Stability with current image.
*/
  const callStability = async () => {
    if (
      (isSubscribed === true && totalUse < 100) ||
      (isSubscribed !== true && totalUse < 10)
    ) {
      setIsLoading(true);
      setSeeOriginal(false);
      try {
        const stabilityResponse = await fetch("/api/stability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imgURL: maskImage,
          }),
        });
        const stabilityData = await stabilityResponse.json();
        setStabilityData(stabilityData);

        setTotalUse((prevCount) => prevCount + 1);

        //  Call the /api/stablityPrisma route with the s3URL
        const prismaResponse = await fetch("/api/stabilityPrisma", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: stabilityData,
          }),
        });
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    } else if (isSubscribed === true && totalUse >= 100) {
      toast({
        title: "You've used your 100 monthly images",
        description: "Contact us if you would like to increase your limit.",
        variant: "destructive",
        action: (
          <ToastAction
            onClick={() => {
              router.push("/subscription");
            }}
            altText="Try again"
          >
            Subscribe
          </ToastAction>
        ),
      });
      // alert("out of use - max 100");
    } else if (isSubscribed !== true && totalUse >= 10) {
      toast({
        title: "You've ran out of free images",
        description: "Subscribe for 100 monthly images.",
        variant: "destructive",
        action: (
          <ToastAction
            onClick={() => {
              router.push("/subscription");
            }}
            altText="Try again"
          >
            Subscribe
          </ToastAction>
        ),
      });
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
              }}
              disabled={isLoading}
              id="Activate Visualizer AI"
              type="submit"
            >
              Random
            </Button>
          </div>
        </div>
        <div className="h-[512px] bg-white flex justify-center items-center">
          {isLoading === true && (
            <Loader
              className="h-2/3 w-2/3 animate-spin-slow"
              strokeWidth={0.5}
            />
          )}
          {!isLoading && seeOriginal === true && imageUrl && (
            <Image
              priority
              width={512}
              height={512}
              alt="meow"
              src={imageUrl}
            />
          )}
          {!isLoading && seeOriginal === false && currentImage && (
            <Image
              priority
              width={512}
              height={512}
              alt="meow"
              src={currentImage}
            />
          )}
        </div>
        {isSubscribed === true && <div>{totalUse} / 100</div>}
        {isSubscribed === false && <div>{totalUse} / 10</div>}
      </main>
    </div>
  );
}
