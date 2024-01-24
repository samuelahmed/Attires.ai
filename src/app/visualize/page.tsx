"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Header from "@/components/header";

export default function Visualize() {
  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      <Header />
      <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2 ">
          <div className="flex flex-row space-x-2 text-sm items-center pl-1">
            <p>Background</p>
            <Switch
              //   checked={}
              //   onCheckedChange={}
              aria-label="Toggle Background"
            />
            <p>Original Image</p>
            <Switch
              //   checked={}
              //   onCheckedChange={}
              aria-label="Toggle Original Image"
            />
          </div>
          <div className="flex flex-row space-x-2">
            <Input
              //   value={}
              //   onChange={}
              type="email"
              placeholder="Tell the AI what to design"
            />
            <Button
              //   onClick={() => {}}
              //   disabled={}
              id="Activate Visualizer AI"
              type="submit"
            >
              Create
              {/* {isLoading ? "Loading..." : "Fetch Result"} */}
            </Button>
          </div>
        </div>
        <div className="h-[512px] bg-white">{/* add image in here */}</div>
      </main>
    </div>
  );
}
