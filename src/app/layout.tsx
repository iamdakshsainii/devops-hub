import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FloatingContact } from "@/components/floating-contact";
import { Toaster } from "sonner";
import { WelcomeToast } from "@/components/welcome-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevOps Network",
  description: "A one-stop platform for DevOps engineers and students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className={`${inter.className} min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary`}>
        <Providers>
          <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Ambient Background Mesh Gradient - Optimized for Light/Dark Emotional Contrast */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-background transition-colors duration-500">
              <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[120px] mix-blend-multiply dark:mix-blend-normal opacity-70" />
              <div className="absolute top-[20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-400/15 dark:bg-purple-600/20 blur-[120px] mix-blend-multiply dark:mix-blend-normal opacity-70" />
              <div className="absolute bottom-[-10%] left-[20%] h-[600px] w-[600px] rounded-full bg-emerald-400/15 dark:bg-teal-500/15 blur-[150px] mix-blend-multiply dark:mix-blend-normal opacity-70" />
            </div>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <FloatingContact />
            <Footer />
            <Toaster position="top-right" richColors closeButton />
            <WelcomeToast />
          </div>
        </Providers>
      </body>
    </html>
  );
}