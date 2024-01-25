import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="backgroundStyle h-screen flex items-center justify-center">
      <SignIn />
    </div>
  );
}
