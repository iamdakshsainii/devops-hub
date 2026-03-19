import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate inputs
    const { fullName, bio, avatarUrl, resumeUrl, githubUrl, twitterUrl, linkedinUrl, certifications } = data;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: fullName !== undefined ? fullName : undefined,
        bio: bio !== undefined ? bio : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        resumeUrl: resumeUrl !== undefined ? resumeUrl : undefined,
        githubUrl: githubUrl !== undefined ? githubUrl : undefined,
        twitterUrl: twitterUrl !== undefined ? twitterUrl : undefined,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : undefined,
        certifications: certifications !== undefined ? certifications : undefined,
      },
    });

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Server error while updating profile" }, { status: 500 });
  }
}
