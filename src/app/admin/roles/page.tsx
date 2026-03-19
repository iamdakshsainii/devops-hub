import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { AdminRequestAction, DemoteAdminAction } from "./action-form";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/"); // Only SUPER_ADMIN allowed
  }

  const pendingRequests = await prisma.adminRequest.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: { fullName: true, email: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  const currentAdmins = await prisma.user.findMany({
    where: { 
      role: { in: ["ADMIN", "SUPER_ADMIN"] } 
    },
    select: { id: true, fullName: true, email: true, role: true, permissions: true }
  });

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground mt-1">Super Admin Dashboard to control platform privileges.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
             <ShieldAlert className="h-5 w-5 text-amber-500" /> Pending Admin Requests ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length > 0 ? (
            <div className="grid gap-4">
              {pendingRequests.map(req => (
                <Card key={req.id} className="border-amber-500/20 bg-amber-500/5">
                  <CardContent className="p-5 flex flex-col sm:flex-row justify-between gap-6">
                    <div>
                      <h3 className="font-semibold text-lg">{req.user.fullName}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{req.user.email}</p>
                      <div className="bg-background/80 p-3 rounded border text-sm italic">
                        "{req.reason || "No reason provided."}"
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center">
                       <AdminRequestAction requestId={req.id} userId={req.userId} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="border border-dashed rounded-xl p-12 text-center bg-muted/10">
               <p className="text-muted-foreground">No pending admin requests.</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6 pt-8 border-t">
         <h2 className="text-xl font-bold flex items-center gap-2">
             <ShieldCheck className="h-5 w-5 text-primary" /> Active Administrators
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentAdmins.map(admin => (
              <Card key={admin.id} className={admin.role === "SUPER_ADMIN" ? "border-primary bg-primary/5" : ""}>
                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start mb-2">
                     <Shield className={`h-5 w-5 ${admin.role === "SUPER_ADMIN" ? "text-primary" : "text-muted-foreground"}`} />
                     <span className="text-[10px] uppercase font-bold tracking-wider bg-background border px-2 py-0.5 rounded shadow-sm">
                      {admin.role.replace("_", " ")}
                    </span>
                  </div>
                  <CardTitle className="text-base">{admin.fullName || admin.email}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-xs text-muted-foreground mb-3">{admin.email}</p>
                  
                  {admin.role !== "SUPER_ADMIN" && (
                    <div className="space-y-2 pt-3 border-t">
                      <p className="text-xs font-semibold text-foreground">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions ? admin.permissions.split(",").map(p => (
                          <span key={p} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase">{p.replace("MANAGE_", "")}</span>
                        )) : (
                          <span className="text-[9px] text-muted-foreground italic">None defined</span>
                        )}
                      </div>
                      <DemoteAdminAction userId={admin.id} />
                    </div>
                  )}
                  {admin.role === "SUPER_ADMIN" && (
                    <div className="pt-3 border-t">
                       <p className="text-xs text-primary font-medium">Bypasses all permission checks.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
      </section>
    </div>
  );
}
