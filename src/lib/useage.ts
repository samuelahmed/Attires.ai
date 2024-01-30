import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

//   const usage = await prismadb.imageCreated.findall(

//   )

// if usersubscriped && image created > 110 this month === no more images
// if not subscripbed && image create > 10 this month === no more images

}
