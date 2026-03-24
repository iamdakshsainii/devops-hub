import { prisma } from "@/lib/prisma";
import { CheatsheetsClient } from "./cheatsheets-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CheatsheetsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = !!(session?.user && ["ADMIN", "SUPER_ADMIN"].includes(session.user.role));

  const cheatsheets = await prisma.cheatsheet.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          fullName: true,
          avatarUrl: true,
        },
      },
      _count: {
         select: { sections: true },
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">DevOps Cheatsheets</h1>
        <p className="text-lg text-muted-foreground">
          Quick reference guides for Docker, Kubernetes, Terraform, Linux and more.
        </p>

        {isAdmin && (
           <div className="flex justify-center pt-2">
               <Link href="/admin/cheatsheets/new" target="_blank">
                     <Button className="font-bold gap-1.5 h-9 text-xs bg-amber-500 hover:bg-amber-600 text-black">
                         <PlusCircle className="h-4 w-4" /> Create Cheatsheet
                     </Button>
               </Link>
           </div>
        )}
      </div>

      <CheatsheetsClient initialData={cheatsheets} />
    </div>
  );
}
