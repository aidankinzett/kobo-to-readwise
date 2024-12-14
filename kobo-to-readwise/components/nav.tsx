import { Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function Nav() {
  return (
    <nav className="border-b">
      <div className="container mx-auto p-4">
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-semibold">
              Kobo to Readwise
            </Link>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
