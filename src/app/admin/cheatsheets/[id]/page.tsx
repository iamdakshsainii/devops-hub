import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheatsheetForm } from "../cheatsheet-form";

export const dynamic = "force-dynamic";

export default async function EditCheatsheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const cheatsheet = await prisma.cheatsheet.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          subsections: { orderBy: { order: "asc" } }
        }
      }
    }
  });

  if (!cheatsheet) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Cheatsheet</h1>
          <p className="text-muted-foreground text-sm">
             Update information describing your guides summary setups natively.
          </p>
        </div>
      </div>

      <CheatsheetForm initialData={cheatsheet} />
    </div>
  );
}
