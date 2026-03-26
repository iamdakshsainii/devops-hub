import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// DE-CLUTTER: The 'config' export is for Pages Router. 
// For App Router, Next.js handles bodyParser automatically through req.formData().

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary instead of FS
    const uploadResult = (await uploadToCloudinary(buffer, "uploads")) as any;

    return NextResponse.json({ 
      message: "Uploaded successfully",
      url: uploadResult.secure_url // Cloudinary CDN link
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Server error during upload" }, { status: 500 });
  }
}

