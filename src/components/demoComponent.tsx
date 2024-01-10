import { Button } from "./ui/button";

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
      </div>
      <div className="space-x-1 py-2 px-2">
        <h4>Input</h4>
      </div>
      <div className="space-x-1 py-2 px-2">
        <h4>Image</h4>
      </div>

    </>
  );
}
