"use client";

import Header from "@/components/header";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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

  const [useage, setUseage] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const getTotalUseage = async () => {
    const response = await fetch("/api/useage", {
      cache: "no-store",
    });
    const data = await response.json();
    console.log(data.currentPeriodUse);
    setUseage(data.currentPeriodUse);
  };

  const getSubscription = async () => {
    const response = await fetch("/api/subscribed", {
      cache: "no-store",
    });
    const data = await response.json();
    setIsSubscribed(data.isSubscriptionActive);
  };

  useEffect(() => {
    getTotalUseage();
    getSubscription();
  }, []);

  console.log(isSubscribed, "IS subscribed");

  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      <Header />
      <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2">
          <div className="space-y-2">
            {isSubscribed === true && (
              <div>
                <Button onClick={onSubscribe}>Manage Subscription</Button>
              </div>
            )}
            {isSubscribed === false && (
              <div>
                <Button onClick={onSubscribe}>Sign Up</Button>
              </div>
            )}
            <div className="flex flex-row">
              <p className="pr-1">Monthly Use:</p>
              {isSubscribed === true && <div>{useage} / 100</div>}
              {isSubscribed === false && <div>{useage} / 10</div>}{" "}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
