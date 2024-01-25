"use client";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/ui/pageHeader";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  return (
    <div className="backgroundStyle h-screen">
      <div className="flex flex-col justify-center pt-40 md:pt-52 items-center">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2 ">
          <PageHeader>
            <PageHeaderHeading>Attires.ai</PageHeaderHeading>
            <PageHeaderDescription>
              Elevate your style with your personal virtual wardrobe. Try on
              endless outfits to discover the perfect look for you.
            </PageHeaderDescription>
            <div className="flex flex-col  items-center ">
              {!isSignedIn ? (
                <div>
                  <div className="flex flex-row items-start w-full space-x-2 ">
                    <SignInButton mode="modal" redirectUrl="/visualize">
                      <Button>Sign In</Button>
                    </SignInButton>

                    <SignUpButton redirectUrl="/visualize" mode="modal">
                      <Button variant={"outline"}>Register</Button>
                    </SignUpButton>
                  </div>
                </div>
              ) : null}
              {isSignedIn ? (
                <div className="items-center flex flex-col space-y-2">
                  <div>Hello, {user?.firstName} welcome to Attires.ai</div>
                  <Button onClick={() => router.push("/visualize")}>
                    Visualize
                  </Button>
                </div>
              ) : null}
              <div className="flex w-full items-center space-x-2"></div>
            </div>
          </PageHeader>
        </div>
      </div>
    </div>
  );
}
