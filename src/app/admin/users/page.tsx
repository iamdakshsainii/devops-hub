import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserRow from "@/components/admin/user-row";

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
                <UserRow key={user.id} user={user} isSuperAdmin={isSuperAdmin} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
