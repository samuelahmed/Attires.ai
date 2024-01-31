"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Payments() {
  const onSubscribe = async () => {
    try {
      const response = await fetch("/api/stripe");
      const data = await response.json();

      window.location.href = data.url;
    } catch (error) {
      console.log("something went wrong", error);
    }
  };

  const [useage, setUseage] = useState();

  const getTotalUseage = async () => {
    const response = await fetch("/api/useage", {
      cache: "no-store",
    });
    const data = await response.json();
    console.log(data);
    setUseage(data.count);
    // setImageUrl(data.url);
  };

  useEffect(() => {
    getTotalUseage();
  }, []);

  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      <Header />
      <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2">
          {/* add loading state to this button */}
          <Button onClick={onSubscribe}>Subscription Dashboard</Button>
          {/* <div>Free Images: {useage ? useage : ''} / 10</div>         */}
            <div>Monthly Images: {useage ? useage : '0'} / 100</div>
        </div>
      </main>
    </div>
  );
}
