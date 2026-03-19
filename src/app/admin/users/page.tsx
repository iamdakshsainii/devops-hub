import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { notes: true, resources: true } }
    }
  });

  const roleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "bg-primary/20 text-primary border-primary/30";
      case "ADMIN": return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      default: return "bg-muted text-muted-foreground border-transparent";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Members Directory</h1>
        <p className="text-muted-foreground mt-1">{users.length} registered users on the platform.</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Name & Email</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Contributions</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{user.fullName || "—"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${roleColor(user.role)}`}>
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex gap-3">
                      <span>{user._count.notes} Notes</span>
                      <span>{user._count.resources} Resources</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* SUPER_ADMIN cannot be banned by anyone */}
                    {user.role === "SUPER_ADMIN" ? (
                      <span className="text-[10px] text-primary font-medium">Protected</span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 shadow-none"
                        disabled={!isSuperAdmin}
                      >
                        Ban User
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
