import { Button } from "@/src/components/ui/button";
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
import Image from "next/image";
import { Switch } from "@/src/components/ui/switch"

export default function DemoComponent() {
  return (
    <>
      <h1 className="text-xl py-2 px-2">UI component demo</h1>



      <div className="space-x-1 py-2 px-2">
        <h4>Buttons</h4>
        <Button variant="default">default</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="destructive">destructive</Button>
        <Button variant="outline">outline</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="link">link</Button>
      </div>
      <div className="space-x-1 py-2 px-2">



        <h4>Menubar</h4>
        <div className="w-14">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>New Window</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Share</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Print</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>



      <div className="space-x-1 py-2 px-2 space-y-2">
        <h4>Input</h4>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="email" placeholder="Email" />
          <Button type="submit">Subscribe</Button>
        </div>
        <div className="grid w-60 items-center gap-1.5">
          <Input id="picture" type="file" />
        </div>
      </div>



      <div className="space-x-1 py-2 px-2 space-y-2">
        <h4>Switch</h4>
        <Switch />

      </div>





      <div className="space-x-1 py-2 px-2">
        <h4>Image</h4>
        <div className="overflow-hidden rounded-md">
          <Image
            src="https://outfit-visualizer.s3.us-west-1.amazonaws.com/demoImg-1-1.png-1704751089449"
            alt={"broken"}
            width={512}
            height={512}
            className="h-auto w-auto"
          />
        </div>
      </div>
    </>
  );
}
