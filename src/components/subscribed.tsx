"use client";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { checkSubscription } from "@/lib/subscription";

export default function Subscribed() {
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
  // const test = checkSubscription()

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
    <div className="">
      <Button onClick={onSubscribe}>Subscription Dashboard</Button>
      <div>Monthly Images: {useage ? useage : "0"} / 100</div>
    </div>
  );
}
