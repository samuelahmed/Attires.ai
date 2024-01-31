"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function NotSubscribed() {
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
    setUseage(data.count);
  };

  useEffect(() => {
    getTotalUseage();
  }, []);

  return (
    <div className="">
      <Button onClick={onSubscribe}>Sign Up</Button>
      <div>Monthly Images: {useage ? useage : "0"} / 10</div>
    </div>
  );
}
