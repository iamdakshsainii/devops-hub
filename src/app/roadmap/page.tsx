import { CheckCircle2, Circle, ArrowDown } from "lucide-react";

export const dynamic = "force-dynamic";

const ROADMAP_STEPS = [
  {
    title: "1. The Fundamentals",
    description: "Understand the Internet, OS concepts (Linux), networking, and basic terminal commands.",
    status: "done"
  },
  {
    title: "2. Programming Languages",
    description: "Learn a systems programming language (Go, Rust) or a scripting language (Python, Bash).",
    status: "done"
  },
  {
    title: "3. Version Control",
    description: "Master Git and GitHub/GitLab. Understand branching, merging, and PR workflows.",
    status: "done"
  },
  {
    title: "4. Containers & Orchestration",
    description: "Docker, containerization concepts, and Kubernetes (K8s) basics for clustering.",
    status: "current"
  },
  {
    title: "5. CI/CD Pipelines",
    description: "Automate testing and deployment using GitHub Actions, Jenkins, or GitLab CI.",
    status: "upcoming"
  },
  {
    title: "6. Infrastructure as Code (IaC)",
    description: "Provisioning systems using Terraform, Pulumi, or Ansible.",
    status: "upcoming"
  },
  {
    title: "7. Cloud Providers",
    description: "Mastering core services in AWS, GCP, or Azure (Compute, Storage, Networking, IAM).",
    status: "upcoming"
  },
  {
    title: "8. Monitoring & Observability",
    description: "Prometheus, Grafana, ELK stack, Datadog. Setting up metrics, logs, and traces.",
    status: "upcoming"
  }
];

export default function RoadmapPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-16">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">The DevOps Roadmap</h1>
        <p className="text-lg text-muted-foreground">
          Your step-by-step guide to mastering DevOps, Cloud Native systems, and Infrastructure Engineering in 2026.
        </p>
      </div>

      <div className="relative border-l-2 border-border ml-4 md:ml-8 space-y-12 pb-8">
         {ROADMAP_STEPS.map((step, index) => (
           <div key={index} className="relative pl-8 md:pl-12">
             {/* Timeline Node */}
             <div className="absolute -left-[17px] top-1">
               {step.status === "done" ? (
                 <div className="bg-background rounded-full">
                   <CheckCircle2 className="h-8 w-8 text-primary" />
                 </div>
               ) : step.status === "current" ? (
                 <div className="bg-background rounded-full border-4 border-background shadow-sm">
                   <div className="h-6 w-6 rounded-full bg-primary animate-pulse" />
                 </div>
               ) : (
                 <div className="bg-background rounded-full">
                   <Circle className="h-8 w-8 text-muted-foreground/30" />
                 </div>
               )}
             </div>

             {/* Content */}
             <div className={`p-6 border rounded-2xl transition-all duration-300 ${
               step.status === "current" ? "bg-primary/5 border-primary/30 shadow-md ring-1 ring-primary/20 scale-[1.02]" :
               step.status === "done" ? "bg-muted/10 opacity-80 backdrop-blur-sm" :
               "bg-card opacity-60"
             }`}>
               <h3 className={`text-xl font-bold mb-2 ${
                 step.status === "current" ? "text-primary" : 
                 step.status === "done" ? "text-foreground" : 
                 "text-muted-foreground"
               }`}>
                 {step.title}
               </h3>
               <p className={step.status === "upcoming" ? "text-muted-foreground/70" : "text-muted-foreground"}>
                 {step.description}
               </p>
             </div>
             
             {/* Decorative arrow between items (except last) */}
             {index < ROADMAP_STEPS.length - 1 && (
               <div className="hidden md:block absolute -left-10 top-1/2 -translate-y-1/2 text-border">
                 <ArrowDown className="h-4 w-4" />
               </div>
             )}
           </div>
         ))}
      </div>
      
      <div className="text-center pt-8 border-t border-dashed">
         <p className="text-muted-foreground">
           Check out the <a href="/resources" className="text-primary hover:underline font-medium">Resources</a> section for recommended courses on each topic!
         </p>
      </div>
    </div>
  );
}
