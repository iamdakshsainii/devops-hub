"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Bookmark } from "lucide-react";

interface NoteActionsProps {
  itemId: string;
  itemType: "NOTE" | "RESOURCE";
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
    <div className="flex items-center gap-2">
      <Button 
        variant={upvoted ? "default" : "outline"} 
        size="sm" 
        onClick={() => handleAction("upvote")}
        disabled={loading.upvote}
      >
        <ThumbsUp className={`mr-2 h-4 w-4 ${upvoted ? "fill-current" : ""}`} />
        {upvoteCount} Upvotes
      </Button>

      <Button 
        variant={bookmarked ? "default" : "outline"} 
        size="sm" 
        onClick={() => handleAction("bookmark")}
        disabled={loading.bookmark}
      >
        <Bookmark className={`mr-2 h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
        {bookmarked ? "Saved" : "Save"}
      </Button>
    </div>
  );
}
