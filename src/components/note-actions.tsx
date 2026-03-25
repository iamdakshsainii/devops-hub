"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Bookmark, CheckCircle2 } from "lucide-react";

interface NoteActionsProps {
  itemId: string;
  itemType: "NOTE" | "RESOURCE" | "MODULE" | "TOPIC" | "SUBTOPIC" | "EVENT";
  initialUpvoteCount: number;
  hasUpvoted: boolean;
  hasBookmarked: boolean;
}

export function NoteActions({ itemId, itemType, initialUpvoteCount, hasUpvoted, hasBookmarked }: NoteActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [upvoted, setUpvoted] = useState(hasUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [bookmarked, setBookmarked] = useState(hasBookmarked);
  const [loading, setLoading] = useState<{ upvote: boolean, bookmark: boolean }>({ upvote: false, bookmark: false });

  const handleAction = async (action: "upvote" | "bookmark") => {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(prev => ({ ...prev, [action]: true }));

    try {
      const res = await fetch(`/api/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType })
      });
      const data = await res.json();

      if (action === "upvote") {
        if (data.status === "added") {
          setUpvoted(true);
          setUpvoteCount(c => c + 1);
        } else {
          setUpvoted(false);
          setUpvoteCount(c => c - 1);
        }
      } else {
        if (data.status === "added") {
          setBookmarked(true);
        } else {
          setBookmarked(false);
        }
      }
      
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      <Button 
        variant={upvoted ? "default" : "outline"} 
        size="sm" 
        onClick={() => handleAction("upvote")}
        disabled={loading.upvote}
        className={`h-9 px-4 rounded-full font-black transition-all duration-300 ${upvoted ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "hover:border-primary/40 hover:bg-primary/5"}`}
      >
        <ThumbsUp className={`mr-2 h-4 w-4 ${upvoted ? "fill-current animate-bounce" : ""}`} />
        {upvoteCount}
      </Button>

      <Button 
        variant={bookmarked ? "default" : "outline"} 
        size="sm" 
        onClick={() => handleAction("bookmark")}
        disabled={loading.bookmark}
        className={`h-9 px-4 rounded-full font-black transition-all duration-300 ${bookmarked ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-105 border-emerald-500" : "hover:border-emerald-500/40 hover:bg-emerald-500/5"}`}
      >
        {bookmarked ? (
            <>
                <CheckCircle2 className="mr-2 h-4 w-4 fill-current" />
                Saved
            </>
        ) : (
            <>
                <Bookmark className="mr-2 h-4 w-4" />
                Save
            </>
        )}
      </Button>
    </div>
  );
}
