import { prisma } from "@/lib/prisma";
import { ToolsClient } from "./tools-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = !!(session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role));

  const tools = await prisma.tool.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">DevOps Tools</h1>
        <p className="text-lg text-muted-foreground">
          Explore every tool in the DevOps ecosystem, documentation setups overlays layout.
        </p>

        {isAdmin && (
           <div className="flex justify-center pt-2">
               <Link href="/admin/tools/new" target="_blank">
                     <Button className="font-bold gap-1.5 h-9 text-xs bg-amber-500 hover:bg-amber-600 text-black">
                         <PlusCircle className="h-4 w-4" /> Create Tool
                     </Button>
               </Link>
           </div>
        )}
      </div>

      <ToolsClient initialData={tools} />
    </div>
  );
}
