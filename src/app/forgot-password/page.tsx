"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal, Copy } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        throw new Error("Failed to process request. Please try again.")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-background/60 backdrop-blur-xl border-border/50 shadow-2xl relative z-10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 mb-2">
            <Terminal className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">Recovery</CardTitle>
          <CardDescription className="text-base text-muted-foreground/80">
            Enter your email address to reset your password
          </CardDescription>
        </CardHeader>
        {!success ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium flex items-center gap-2">
                  <span className="h-4 w-4 flex items-center justify-center rounded-full bg-red-500/20 text-xs">!</span>
                  {error}
                </div>
              )}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-foreground/90" htmlFor="email">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-background/50 border-border/50 focus-visible:ring-primary/50"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-5 pt-2">
              <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? "Processing..." : "Send Reset Instructions"}
              </Button>
              
              <div className="text-center text-sm font-medium text-muted-foreground pt-2">
                Remember your password?{" "}
                <Link href="/login" className="text-primary hover:underline font-bold transition-all hover:text-primary/80">
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-5 pb-6">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-sm font-medium flex-col gap-2 text-center">
              <p className="font-bold mb-1 text-emerald-500">Magic Link Sent! ✨</p>
              <p className="text-emerald-500/80">If an account exists, a reset link has been dispatched to {email}.</p>
            </div>
            <Link href="/login" className="block w-full">
              <Button type="button" variant="outline" className="w-full h-11 text-base font-semibold">
                Back to Sign in
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
