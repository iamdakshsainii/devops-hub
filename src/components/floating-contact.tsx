"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100] group flex flex-col items-end">
      {/* Premium Animated Tooltip */}
      <div className="absolute right-0 -top-14 bg-background/90 backdrop-blur-md text-foreground text-xs font-black px-4 py-2 rounded-2xl border border-border/40 shadow-[0_10px_30px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap flex items-center gap-2">
         Contact & Suggestions <span className="text-sm">💬</span>
      </div>

      <Link href="/contact" className="relative group/btn mt-2">
        {/* Ambient Glow behind button */}
        <div className="absolute inset-0 bg-primary/40 rounded-full blur-[20px] group-hover/btn:blur-[25px] group-hover/btn:scale-110 transition-all duration-500 -z-10" />
        
        {/* Main Floating Button */}
        <button 
          className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-primary/80 border border-primary-foreground/10 text-primary-foreground flex items-center justify-center
                     shadow-[0_8px_25px_rgba(59,130,246,0.4)] hover:shadow-[0_15px_35px_rgba(59,130,246,0.5)] 
                     hover:-translate-y-1 active:scale-95 transition-all duration-300 ease-out"
        >
           {/* Notification dot (optional visual flair to draw attention) */}
           <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-rose-500 border-2 border-background rounded-full pointer-events-none" />
           <MessageCircle className="h-6 w-6 group-hover/btn:scale-110 transition-transform duration-300 drop-shadow-sm" />
        </button>
      </Link>
    </div>
  );
}
