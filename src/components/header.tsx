"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import logo from "/public/logo.png";
import { CreditCard } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import useFileHandler from "@/hooks/useFileHandler";

export default function Header() {
  const router = useRouter();
  const { uploading, errorMessage, handleFileChange, handleSubmit } = useFileHandler();

  return (
    <>
      <header className="w-screen h-14 px-2 py-2 md:px-10 space-x-2 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-2">
          <div className="border-2 border-black">
            <Image alt={"no img"} height={30} width={30} src={logo} />
          </div>
          <span
            className="text-xl hover:cursor-pointer"
            onClick={() => router.push("/visualize")}
          >
            Attires.ai
          </span>
        </div>
        <div className="flex flex-row items-center space-x-2">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>Image</MenubarTrigger>
              <MenubarContent className="mr-5 md:mr-8 space-y-1">
                <MenubarItem onClick={() => router.push("/visualize")}>
                  Visualize
                </MenubarItem>
                <MenubarItem onClick={() => router.push("/edit")}>
                  Edit
                </MenubarItem>
                <Popover>
                  <PopoverTrigger
                    className="border-none items-center w-full"
                    asChild
                  >
                    <Button className="px-2 font-normal h-8" variant="outline">
                      {/* Upload New Image */}
                      <span className="text-left block w-full">
                        Upload Image
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <form
                      className="flex flex-col space-y-1 items-center"
                      onSubmit={handleSubmit}
                    >
                      <Input
                        onChange={handleFileChange}
                        id="picture"
                        type="file"
                      />
                      <Button
                        className="w-36 border-2 border-gray-500"
                        type="submit"
                      >
                        {uploading ? "Uploading..." : "Upload"}
                      </Button>
                    </form>
                    {errorMessage && (
                      <span className="text-red-600 text-xs">
                        {errorMessage}
                      </span>
                    )}
                  </PopoverContent>
                </Popover>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu></MenubarMenu>
          </Menubar>
          <div className="w-8">
            <UserButton afterSignOutUrl="/">
              <UserButton.UserProfileLink
                label="Subscription"
                labelIcon={<CreditCard />}
                url="/subscription"
              />
            </UserButton>
          </div>
        </div>
      </header>
    </>
  );
}
