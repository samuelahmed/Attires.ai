"use client";

import { Slider } from "@/components/ui/slider";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Eraser, Paintbrush } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export default function Edit() {
  return (
    <>
      <div className="backgroundStyle h-screen w-screen flex flex-col">
        <Header />
        <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
          <div className="w-4/5 md:w-1/2 flex flex-col space-y-2 ">
            <div className="flex flex-row space-x-2 text-sm items-center pl-1">
              <div className="flex flex-row space-x-1">
                <Toggle
                //   pressed={activeToggle === "eraser"}
                //   onPressedChange={() => {}}
                >
                  <Eraser />
                </Toggle>
                <Toggle
                //   pressed={activeToggle === "paintbrush"}
                //   onPressedChange={() => {}}
                >
                  <Paintbrush />
                </Toggle>
              </div>
              <Slider
                // defaultValue={sliderValue}
                min={2}
                max={100}
                step={1}
                // onValueChange={() => {}}
              />
              <Button
                // onClick={}
                id="Activate Visualizer AI"
                type="submit"
              >
                Save
              </Button>
            </div>
          </div>
          <div id="outer-canvas" className="h-[512px]  bg-white"></div>
        </main>
      </div>
    </>
  );
}
