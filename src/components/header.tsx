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
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  /*
    Take the image the user upload and pass it to backend API to be resized and upload to s3
    The s3 URL is then returned and a mask-image and white-background-mask-image are created
  */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/images/uploadToS3", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        createMaskImg(data.s3URL);
        createWhiteBgImg(data.s3URL);
      } else {
        setUploading(false);
      }
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  /*
    Take the URL from standard image and pass it to API that creates a mask
  */
  const createMaskImg = async (imgUrl: string) => {
    try {
      const response = await fetch("/api/images/uploadMaskToS3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imgUrl }),
      });
      if (!response.ok) {
        console.error("Response:", response);
        const responseBody = await response.text();
        console.error("Response body:", responseBody);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*
    Take the URL from standard image and pass it to API that creates a white-bg-img
  */
  const createWhiteBgImg = async (imgUrl: string) => {
    try {
      const response = await fetch("/api/images/uploadWhiteBgToS3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imgUrl }),
      });
      if (!response.ok) {
        console.error("Response:", response);
        const responseBody = await response.text();
        console.error("Response body:", responseBody);
      }
    } catch (error) {
      console.error(error);
    }
  };

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
                        Upload New Image
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
                  </PopoverContent>
                </Popover>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu></MenubarMenu>
          </Menubar>
          <div className="w-8">
            <UserButton afterSignOutUrl="/">
              <UserButton.UserProfileLink
                label="Payments"
                labelIcon={<CreditCard />}
                url="/payments"
              />
            </UserButton>
          </div>
        </div>
      </header>
    </>
  );
}
