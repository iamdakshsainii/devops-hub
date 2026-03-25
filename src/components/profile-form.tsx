"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Github, Twitter, Linkedin, Award, User, FileText } from "lucide-react";

export function ProfileForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const { update } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || "",
    bio: initialData.bio || "",
    avatarUrl: initialData.avatarUrl || "",
    resumeUrl: initialData.resumeUrl || "",
    githubUrl: initialData.githubUrl || "",
    twitterUrl: initialData.twitterUrl || "",
    linkedinUrl: initialData.linkedinUrl || "",
    certifications: initialData.certifications || "",
  });

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'resumeUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'avatarUrl') setAvatarUploading(true);
    if (field === 'resumeUrl') setResumeUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      setFormData(prev => ({ ...prev, [field]: data.url }));
    } catch (error) {
      console.error(error);
      alert("File upload failed. Please try again.");
    } finally {
      if (field === 'avatarUrl') setAvatarUploading(false);
      if (field === 'resumeUrl') setResumeUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Save failed");
      
      // Force NextAuth to re-run the session callback (which now fetches fresh from DB)
      await update();
      
      alert("Profile updated successfully!");
      router.refresh(); 
    } catch (error) {
      console.error(error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input 
              value={formData.fullName} 
              onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
              placeholder="John Doe" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address (Read-only)</label>
            <Input value={initialData.email} disabled className="bg-muted" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea 
              value={formData.bio} 
              onChange={e => setFormData({ ...formData, bio: e.target.value })} 
              placeholder="Tell the community about yourself..." 
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">{formData.bio.length}/300 characters</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 pt-2">
          {/* Avatar Upload */}
          <div className="space-y-3 p-4 border rounded-xl bg-card/50">
             <label className="text-sm font-medium block">Profile Photo (Avatar)</label>
             <div className="flex items-center gap-4">
               {formData.avatarUrl ? (
                 <img src={formData.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 shadow-sm" />
               ) : (
                 <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
                   <User className="h-6 w-6 text-muted-foreground" />
                 </div>
               )}
               <div className="flex-1">
                 <Input type="file" accept="image/*" className="h-9 text-xs" onChange={e => handleUpload(e, 'avatarUrl')} disabled={avatarUploading} />
                 {avatarUploading && <p className="text-xs text-primary mt-1 flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1"/> Uploading...</p>}
               </div>
             </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-3 p-4 border rounded-xl bg-card/50">
             <label className="text-sm font-medium block">Resume (PDF)</label>
             <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded flex items-center justify-center border-2 ${formData.resumeUrl ? 'bg-primary/10 border-primary shadow-sm' : 'bg-muted border-dashed border-muted-foreground/30'}`}>
                 <FileText className={`h-6 w-6 ${formData.resumeUrl ? 'text-primary' : 'text-muted-foreground'}`} />
               </div>
               <div className="flex-1">
                 <Input type="file" accept=".pdf" className="h-9 text-xs" onChange={e => handleUpload(e, 'resumeUrl')} disabled={resumeUploading} />
                 {resumeUploading && <p className="text-xs text-primary mt-1 flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1"/> Uploading...</p>}
                 {formData.resumeUrl && <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">View current resume</a>}
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-border" />

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2"><Github className="h-5 w-5 text-primary" /> Professional Presence</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5"><Github className="h-4 w-4" /> GitHub Profile</label>
            <Input 
              value={formData.githubUrl} 
              onChange={e => setFormData({ ...formData, githubUrl: e.target.value })} 
              placeholder="https://github.com/username" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5"><Linkedin className="h-4 w-4" /> LinkedIn Profile</label>
            <Input 
              value={formData.linkedinUrl} 
              onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })} 
              placeholder="https://linkedin.com/in/username" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5"><Twitter className="h-4 w-4" /> Twitter / X</label>
            <Input 
              value={formData.twitterUrl} 
              onChange={e => setFormData({ ...formData, twitterUrl: e.target.value })} 
              placeholder="https://twitter.com/username" 
            />
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-border" />

      {/* Certifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Certifications</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">List your certifications (comma separated)</label>
          <Input 
            value={formData.certifications} 
            onChange={e => setFormData({ ...formData, certifications: e.target.value })} 
            placeholder="AWS Certified Solutions Architect, CKA, RHCE..." 
          />
        </div>
      </div>

      {/* Save Action */}
      <div className="pt-4 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || avatarUploading || resumeUploading} className="min-w-[120px]">
          {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Profile</>}
        </Button>
      </div>

    </div>
  );
}
