import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { AdminRequestCard } from "@/components/admin-request-card";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  const existingRequest = await prisma.adminRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your public presence, resume, and social links to stand out in the community.
          </p>
        </div>
        
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 md:p-8">
            <ProfileForm 
              initialData={{
                fullName: user.fullName,
                email: user.email,
                bio: user.bio || "",
                avatarUrl: user.avatarUrl || "",
                resumeUrl: user.resumeUrl || "",
                githubUrl: user.githubUrl || "",
                twitterUrl: user.twitterUrl || "",
                linkedinUrl: user.linkedinUrl || "",
                certifications: user.certifications || "",
              }} 
            />
          </div>
        </div>

        <AdminRequestCard 
          hasPendingRequest={!!existingRequest} 
          isAdmin={user.role === "ADMIN" || user.role === "SUPER_ADMIN"} 
        />
      </div>
    </div>
  );
}
