"use client";

import Header from "@/components/header";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Gallery() {
  const [imageUrls, setImageUrls] = useState([]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  useEffect(() => {
    getMostRecentImages();
  }, []);

  const getMostRecentImages = async () => {
    const response = await fetch("/api/images/createdImgArray", {
      cache: "no-store",
    });
    const data = await response.json();
    const urls = data.urls || [];
    setImageUrls(urls);
    setCount(urls.length);
  };

  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      <Header />
      <main className="flex flex-col flex-grow items-center justify-center ">
        <Carousel
          setApi={setApi}
          className="w-full max-w-lg"
          opts={{
            // align: "center",
            loop: true,
          }}
        >
          <CarouselContent>
            {imageUrls.map((imageUrl, index) => (
              <CarouselItem key={index}>
                <Image
                  priority
                  width={512}
                  height={512}
                  alt="meow"
                  src={imageUrl}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
        <div className="py-2 text-center text-sm text-muted-foreground">
          Image {current} of {count}
        </div>
      </main>
    </div>
  );
}
