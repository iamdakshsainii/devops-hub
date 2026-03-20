"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ALL_PERMISSIONS = [
  { id: "MANAGE_MODULES", label: "Manage Standalone Modules" },
  { id: "MANAGE_RESOURCES", label: "Manage Continuous Resources" },
  { id: "MANAGE_EVENTS", label: "Manage Upcoming Events" }
];

export default function UserRow({ user, isSuperAdmin }: { user: any, isSuperAdmin: boolean }) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(user.role);
  const [permissions, setPermissions] = useState<string[]>(user.permissions ? user.permissions.split(",") : []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${user.id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ role, permissions: permissions.join(",") })
      });
    } catch {}
    setLoading(false);
  };

  const togglePermission = (id: string) => {
     setPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  return (
    <tr className="hover:bg-muted/20">
      <td className="px-6 py-4">
        <div className="font-semibold text-sm">{user.fullName || "—"}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
      </td>
      <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap" suppressHydrationWarning>
         {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
         <Badge className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${role === "SUPER_ADMIN" ? "bg-primary/20 text-primary border-primary/30" : role === "ADMIN" ? "bg-amber-500/20 text-amber-600 border-amber-500/30" : "bg-muted text-muted-foreground"}`}>
              {role.replace("_", " ")}
         </Badge>
      </td>
      <td className="px-6 py-4 text-muted-foreground text-xs">
         <div className="flex gap-2">
            <span>{user._count.notes} Notes</span>
            <span>{user._count.resources} Links</span>
         </div>
      </td>
      <td className="px-6 py-4 text-right">
         {user.role === "SUPER_ADMIN" ? (
             <span className="text-[10px] text-primary font-medium">Protected</span>
         ) : (
            <div className="flex gap-2 justify-end">
               <Dialog>
                  <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-xs" disabled={!isSuperAdmin}><Shield className="h-3 w-3 mr-1" /> Permissions</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xs">
                      <DialogHeader><DialogTitle className="text-md">Edit Permissions</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-2">
                          <div className="space-y-1.5 border-b pb-3">
                             <label className="text-xs font-bold text-muted-foreground">Select Role</label>
                             <select value={role} onChange={e => setRole(e.target.value)} className="h-8 w-full border rounded-md text-sm bg-background">
                                <option value="MEMBER">Member</option>
                                <option value="ADMIN">Admin (Scoped)</option>
                             </select>
                          </div>

                          <div className="space-y-2">
                             <label className="text-xs font-bold text-muted-foreground">Granular Rights</label>
                             <div className="space-y-2">
                                 {ALL_PERMISSIONS.map(p => (
                                    <div key={p.id} className="flex items-center space-x-2">
                                        <input type="checkbox" id={p.id} checked={permissions.includes(p.id)} onChange={() => togglePermission(p.id)} className="h-4 w-4 rounded-md border text-amber-500 font-bold cursor-pointer" />
                                        <label htmlFor={p.id} className="text-xs leading-none cursor-pointer">{p.label}</label>
                                    </div>
                                 ))}
                             </div>
                          </div>

                          <Button onClick={handleUpdate} disabled={loading} size="sm" className="w-full h-8 text-xs bg-amber-500 hover:bg-amber-600">
                             {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Check className="h-3 w-3 mr-1"/>} Save Changes
                          </Button>
                      </div>
                  </DialogContent>
               </Dialog>
            </div>
         )}
      </td>
    </tr>
  )
}
