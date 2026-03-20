import Link from "next/link"
import { Terminal, Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Terminal className="h-6 w-6 text-foreground" />
              <span className="font-bold inline-block leading-none tracking-tight">
                DevOps Network
              </span>
            </Link>
            <p className="text-sm text-muted-foreground w-full max-w-xs leading-relaxed">
              Your one-stop platform to master DevOps architecture, share resources, and connect with other engineers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Platform</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/modules" className="hover:text-foreground transition-colors">Learning Modules</Link></li>
              <li><Link href="/resources" className="hover:text-foreground transition-colors">Resource Library</Link></li>
              <li><Link href="/events" className="hover:text-foreground transition-colors">Community Events</Link></li>
              <li><Link href="/roadmap" className="hover:text-foreground transition-colors">DevOps Roadmap</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors font-semibold text-primary">Contact / Request</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Connect</h3>
            <div className="flex space-x-4 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DevOps Network. All rights reserved.</p>
          <p className="mt-4 md:mt-0">
            Engineered with passion for the community.
          </p>
        </div>
      </div>
    </footer>
  )
}
