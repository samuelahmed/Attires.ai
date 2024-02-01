import Header from "@/components/header";

import { checkUseage } from "@/lib/useage";
import VisualizeAvailable from "@/components/visualizeAvailable";
import VisualizeUnavailable from "@/components/visualizeUnavailable";
// import Subscribed from "@/components/subscribed";
// import NotSubscribed from "@/components/notSubscribed";

export default async function Payments() {
const result = await checkUseage();
console.log(result, 'RESULT')
const use: number = typeof result === 'number' ? result : 0; // Assign a default value if result is not a number

  console.log(use)



  return (
    <div className="backgroundStyle h-screen w-screen flex flex-col">
      <Header />
      <main className="flex flex-col flex-grow items-center space-y-10 mt-10">
        <div className="w-4/5 md:w-1/2 flex flex-col space-y-2">
          {use <= 5 ? <VisualizeAvailable /> : <VisualizeUnavailable />}
        </div>
      </main>
    </div>
  );
}
