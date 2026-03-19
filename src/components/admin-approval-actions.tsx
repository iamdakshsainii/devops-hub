"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { Trash2 } from "lucide-react";

interface ActionProps {
  itemId: string;
  itemType: "NOTE" | "RESOURCE" | "EVENT";
  initialStatus: string;
}

export function AdminApprovalActions({ itemId, itemType, initialStatus }: ActionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  const handleAction = async (newStatus: "PUBLISHED" | "REJECTED" | "DELETED") => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType, status: newStatus })
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch(e) {} finally {
      setLoading(false);
    }
  };

  if (status === "DELETED") {
    return <span className="text-sm font-medium text-muted-foreground italic">Deleted</span>;
  }

  if (status === "PUBLISHED" || status === "REJECTED") {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${status === "PUBLISHED" ? "text-green-500" : "text-destructive"}`}>
          {status === "PUBLISHED" ? "Approved" : "Rejected"}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs ml-2"
          onClick={() => handleAction("PENDING" as any)} // Forcing state back to reconsider
          disabled={loading}
        >
          Reconsider
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-2"
          onClick={() => {
            if (window.confirm("Are you sure you want to permanently delete this item?")) {
              handleAction("DELETED");
            }
          }}
          disabled={loading}
          title="Delete permanently"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        onClick={() => handleAction("PUBLISHED")}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Approve
      </Button>
      <Button 
        size="sm" 
        variant="destructive"
        onClick={() => handleAction("REJECTED")}
        disabled={loading}
      >
        Reject
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 ml-1 text-destructive hover:bg-destructive hover:text-white"
        onClick={() => {
          if (window.confirm("Delete permanently?")) {
            handleAction("DELETED");
          }
        }}
        disabled={loading}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
