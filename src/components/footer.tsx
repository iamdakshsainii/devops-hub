import Link from "next/link"
import { Terminal, Github, Instagram, Linkedin } from "lucide-react"

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
              <li><Link href="/modules" className="hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">Learning Modules</Link></li>
              <li><Link href="/resources" className="hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">Resource Library</Link></li>
              <li><Link href="/events" className="hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">Community Events</Link></li>
              <li><Link href="/roadmap" className="hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">DevOps Roadmap</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors font-semibold text-primary">Contact / Request</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Connect</h3>
            <div className="flex items-center gap-3 text-muted-foreground">
              <a href="https://github.com/iamdakshsainii" target="_blank" rel="noopener noreferrer" className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted/30 border border-border/10 hover:border-primary/20 hover:text-primary hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/daksh-saini" target="_blank" rel="noopener noreferrer" className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted/30 border border-border/10 hover:border-primary/20 hover:text-primary hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="https://instagram.com/iamdakshsainii" target="_blank" rel="noopener noreferrer" className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted/30 border border-border/10 hover:border-primary/20 hover:text-primary hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
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
