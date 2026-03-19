"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip */}
      <div className="absolute bottom-16 right-0 bg-popover text-popover-foreground text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none duration-200">
         Contact & Suggestions 💬
      </div>

      <Link href="/contact">
        <button className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:scale-108 active:scale-95 transition-all duration-300 hover:shadow-primary/30">
           <MessageCircle className="h-6 w-6 animate-pulse" />
        </button>
      </Link>
    </div>
  );
}
