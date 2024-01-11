// import DemoComponent from "../components/demoComponent"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/src/components/ui/menubar";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import Image from "next/image";
import { Switch } from "@/src/components/ui/switch";

export default function Home() {
  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      {/* header */}
      <header className="w-screen h-14 md:pr-10 space-x-2 flex justify-end items-center">
        <Menubar
        // className="border-none"
        >
          <MenubarMenu>
            <MenubarTrigger>Image</MenubarTrigger>
            <MenubarContent className="mr-20 md:mr-32">
              <MenubarItem>Upload New Image</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Account</MenubarTrigger>
            <MenubarContent className="mr-2 md:mr-10">
              <MenubarItem>Settings</MenubarItem>
              {/* turn off dotted bg */}
              {/* manage payments */}
              {/* change acc name / pass / email  */}
              <MenubarSeparator />
              <MenubarItem>Logout</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </header>

      <main className="flex flex-col flex-grow items-center justify-center space-y-10">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2 ">
          <div className="flex flex-row space-x-2 text-sm items-center pl-1">
            <p>Background</p>
            <Switch aria-label="Toggle Background" 
             />
            <p>Original Image</p>

            <Switch aria-label="Toggle Original Image" 
            />
          </div>

          <div className="flex flex-row space-x-2">
            <Input type="email" placeholder="Tell the AI what to design" />
            <Button id="Activate Visualizer AI" type="submit">
              Visualize
            </Button>
          </div>
        </div>
        <div className="">
          <Image
            // src="https://outfit-visualizer.s3.us-west-1.amazonaws.com/demoImg-1-1.png-1704751089449"
            // src="https://outfit-visualizer.s3.us-west-1.amazonaws.com/6116-07086708en_Masterfile.jpg-whiteBackground-1704761098754"
            // src="https://outfit-visualizer.s3.us-west-1.amazonaws.com/Screenshot+2024-01-07+at+8.20.54+PM.png-whiteBackground-1704760225488"
            // src="https://outfit-visualizer.s3.us-west-1.amazonaws.com/Screenshot+2024-01-07+at+8.20.54+PM.png-1704760215446"
            // src="https://outfit-visualizer.s3.us-west-1.amazonaws.com/European-Fashion-Influences-on-Kelseyybarnes.jpg-whiteBackground-1704965026825"
            src="https://outfit-visualizer.s3.us-west-1.amazonaws.com//tmp/European-Fashion-Influences-on-Kelseyybarnes.png-1704965038321"
            alt={"broken"}
            width={512}
            height={512}
            className="h-auto w-auto"
          />
        </div>
      </main>
    </div>
  );
}
