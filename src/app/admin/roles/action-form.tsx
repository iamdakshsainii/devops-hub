"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminRequestAction({ requestId, userId }: { requestId: string, userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  const togglePermission = (perm: string) => {
    setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          userId,
          action,
          permissions: permissions.join(",")
        })
      });

      if (!res.ok) throw new Error("Failed action");
      
      router.refresh();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full sm:w-64">
      <div className="space-y-2 bg-background p-3 rounded border">
        <p className="text-xs font-semibold">Assign Permissions:</p>
        <div className="flex flex-col gap-1">
          {["MANAGE_NOTES", "MANAGE_RESOURCES", "MANAGE_EVENTS"].map(perm => (
            <label key={perm} className="flex items-center gap-2 text-xs">
              <input 
                type="checkbox" 
                checked={permissions.includes(perm)}
                onChange={() => togglePermission(perm)}
                className="rounded border-input text-primary"
              />
              {perm.replace("MANAGE_", "")}
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex gap-2 w-full">
        <Button 
          variant="outline" 
          className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" 
          disabled={loading}
          onClick={() => handleAction("REJECT")}
        >
          Reject
        </Button>
        <Button 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
          disabled={loading}
          onClick={() => handleAction("APPROVE")}
        >
          Approve
        </Button>
      </div>
    </div>
  );
}

export function DemoteAdminAction({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDemote = async () => {
    const ok = confirm("Are you sure you want to demote this Admin?");
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles/demote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) router.refresh();
    } catch {}
    setLoading(false);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleDemote}
      className="w-full mt-4 h-7 text-xs border-destructive text-destructive hover:bg-destructive hover:text-white"
      disabled={loading}
    >
       Demote to Member
    </Button>
  );
}
