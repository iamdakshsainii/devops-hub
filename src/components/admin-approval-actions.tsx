"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ActionProps {
  itemId: string;
  itemType: "NOTE" | "RESOURCE";
  initialStatus: string;
}

export function AdminApprovalActions({ itemId, itemType, initialStatus }: ActionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  const handleAction = async (newStatus: "PUBLISHED" | "REJECTED") => {
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

  if (status === "PUBLISHED") {
    return <span className="text-sm font-medium text-green-500">Approved</span>;
  }
  
  if (status === "REJECTED") {
    return <span className="text-sm font-medium text-destructive">Rejected</span>;
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
    </div>
  );
}
