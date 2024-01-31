import Header from "@/components/header";
import { checkSubscription } from "@/lib/subscription";
import Subscribed from "@/components/subscribed";
import NotSubscribed from "@/components/notSubscribed";

export default async function Payments() {
  const isSubscribed = await checkSubscription();

  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      <Header />
      <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2">
          {isSubscribed ? <Subscribed /> : <NotSubscribed />}
        </div>
      </main>
    </div>
  );
}
