"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // DE-CLUTTER: Hide the floating contact hub on the homepage to focus 100% 
  // on the hero mission and the curated achievement pills.
  if (pathname === "/") return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] group flex flex-col items-end">
      {/* Premium Animated Tooltip - Desktop Only */}
      <div className="hidden md:flex absolute right-0 -top-14 bg-background/90 backdrop-blur-md text-foreground text-xs font-black px-4 py-2 rounded-2xl border border-border/40 shadow-[0_10px_30px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap items-center gap-2">
         Contact & Suggestions <span className="text-sm">💬</span>
      </div>

      <Link href="/contact" className="relative group/btn mt-2">
        {/* Ambient Glow behind button */}
        <div className="absolute inset-0 bg-primary/40 rounded-full blur-[15px] md:blur-[20px] md:group-hover/btn:blur-[25px] md:group-hover/btn:scale-110 transition-all duration-500 -z-10" />
        
        {/* Main Floating Button */}
        <button 
          className="relative h-11 w-11 md:h-14 md:w-14 rounded-full bg-gradient-to-tr from-primary to-primary/80 border border-primary-foreground/10 text-primary-foreground flex items-center justify-center
                     shadow-[0_8px_25px_rgba(59,130,246,0.3)] md:shadow-[0_8px_25px_rgba(59,130,246,0.4)] 
                     md:hover:shadow-[0_15px_35px_rgba(59,130,246,0.5)] 
                     md:hover:-translate-y-1 active:scale-95 transition-all duration-300 ease-out"
        >
           {/* Notification dot */}
           <span className="absolute top-0 right-0 h-3 w-3 md:h-3.5 md:w-3.5 bg-rose-500 border-2 border-background rounded-full pointer-events-none" />
           <MessageCircle className="h-5 w-5 md:h-6 md:w-6 md:group-hover/btn:scale-110 transition-transform duration-300 drop-shadow-sm" />
        </button>
      </Link>
    </div>
  );
}
