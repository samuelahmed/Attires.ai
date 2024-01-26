"use client";

import Header from "@/components/header";
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
  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      <Header />
      <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2">
          {/* add loading state to this button */}
          <Button onClick={onSubscribe}>Payments Dashboard</Button>
          <div>Free Images: 7 / 10</div>
          <div>Monthly Images: 90 / 100</div>
        </div>
      </main>
    </div>
  );
}
