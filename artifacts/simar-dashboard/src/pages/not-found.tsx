import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <h1 className="text-8xl font-serif font-bold text-white drop-shadow-md">404</h1>
      <p className="text-xl text-white/70 font-medium tracking-wide">
        This path doesn't exist in your reality.
      </p>
      <Link href="/">
        <Button variant="glass" className="mt-4 h-12 px-8 rounded-full">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
