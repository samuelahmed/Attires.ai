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
import useFileHandler from "@/hooks/useFileHandler";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Visualize() {
  const [imageUrl, setImageUrl] = useState("");
  const [maskImage, setMaskImage] = useState("");
  const [clientContent, setClientContent] = useState("describe outfit");
  const [dalleResult, setDalleResult] = useState();
  const [seeOriginal, setSeeOriginal] = useState(true);
  const [currentImage, setCurrentImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalUse, setTotalUse] = useState<number | undefined>();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { uploading, errorMessage, handleFileChange, handleSubmit } =
    useFileHandler();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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
    setIsImageLoaded(true);
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
    if (totalUse === undefined) return;

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
        setTotalUse((prevCount) => (prevCount ? prevCount + 1 : 0));
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
          </div>
        </div>
        <div className="h-[512px] w-3/4 bg-white flex justify-center items-center ">
          {!imageUrl && isImageLoaded && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-full font-bold space-y-2">
                <p className="text-xl text-center">
                  Upload an image of yourself to get started
                </p>
                <p className="text-sm font-normal">
                  The AI works best with headshots but can also design complete
                  outfits.
                </p>
                <p className="text-sm font-normal">
                  Click Edit to see and adjust the area that the AI will
                  generate.
                </p>
              </div>
              <Popover>
                <PopoverTrigger className=" items-center w-1/4" asChild>
                  <Button variant="outline" className="px-2 font-normal">
                    <span className="text-left block w-full">Upload Image</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <form
                    className="flex flex-col space-y-1 items-center"
                    onSubmit={handleSubmit}
                  >
                    <Input
                      onChange={handleFileChange}
                      id="picture"
                      type="file"
                    />
                    <Button
                      className="w-36 border-2 border-gray-500"
                      type="submit"
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </form>
                  {errorMessage && (
                    <span className="text-red-600 text-xs">{errorMessage}</span>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          )}
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
        <div className="flex flex-row content-center items-center space-x-2">
          {isSubscribed === true && <div>{totalUse} / 100</div>}
          {isSubscribed === false && <div>{totalUse} / 10</div>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/edit")}
          >
            Edit
          </Button>
        </div>
      </main>
    </div>
  );
}
