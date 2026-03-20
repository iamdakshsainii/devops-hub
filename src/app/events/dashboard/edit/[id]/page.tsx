import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, LinkIcon, FileText } from "lucide-react";
import Link from "next/link";
import ClientEditForm from "./client-edit-form";

export default async function EditEventPage(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event || event.authorId !== session.user.id) {
     return <div className="p-12 text-center text-muted-foreground">Unauthorized or event not found.</div>;
  }

  let history: any[] = [];
  try {
     const evt: any = event;
     history = JSON.parse(evt.feedback || "[]");
  } catch {}

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 space-y-6">
       <div className="flex items-center justify-between">
          <Link href="/events/dashboard">
             <Button variant="ghost" size="sm" className="h-8">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-xl font-bold">Edit Event Submissions</h1>
       </div>

       {history.length > 0 && (
         <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="p-4 pb-2">
               <div className="flex items-center gap-1.5 text-amber-500">
                  <MessageSquare className="h-4 w-4" />
                  <CardTitle className="text-sm font-bold">Suggested Changes History ({history.length})</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                <div className="divide-y divide-amber-500/10 text-xs">
                   {history.reverse().map((h: any, i: number) => (
                     <div key={i} className="py-2 first:pt-0 last:pb-0">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                           <span>Admin</span>
                           <span>{h.timestamp}</span>
                        </div>
                        <p className="text-foreground tracking-wide">"{h.note}"</p>
                     </div>
                   ))}
                </div>
            </CardContent>
         </Card>
       )}

       <Card>
          <CardHeader>
             <CardTitle className="text-md">Event Details</CardTitle>
          </CardHeader>
          <CardContent>
             <ClientEditForm event={event} />
          </CardContent>
       </Card>
    </div>
  )
}
