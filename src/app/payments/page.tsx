// @ts-nocheck
"use client";

import Header from "@/components/header";

export default function Payments() {
  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      <Header />
      <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2 ">
          add stripe payment component here
        </div>
      </main>
    </div>
  );
}
