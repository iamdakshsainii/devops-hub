import React from "react";
import { 
  Github, Youtube, FileText, Globe, Box, Database, Cloud, 
  Terminal, Shield, GitBranch, Server, Cpu, Layers, 
  MessageSquare, BookOpen
} from "lucide-react";

interface BrandIconProps {
  name: string;
  className?: string;
  color?: string;
}

export const BrandIcon = ({ name, className = "h-8 w-8", color }: BrandIconProps) => {
  const n = name.toLowerCase();

  // OFFICIAL DEVOPS BRAND COLOR MAPPING
  const getBrandColor = (n: string) => {
    if (n.includes("docker")) return "#2496ED";
    if (n.includes("kubernetes") || n.includes("k8s")) return "#326CE5";
    if (n.includes("terraform")) return "#844FBA";
    if (n.includes("aws") || n.includes("amazon")) return "#FF9900";
    if (n.includes("google") || n.includes("gcp")) return "#4285F4";
    if (n.includes("azure")) return "#0078D4";
    if (n.includes("git")) return "#F05032";
    if (n.includes("jenkins")) return "#D24939";
    if (n.includes("ansible")) return "#EE0000";
    if (n.includes("prometheus")) return "#E6522C";
    if (n.includes("grafana")) return "#F46800";
    if (n.includes("python")) return "#3776AB";
    if (n.includes("linux")) return "#FCC624";
    if (n.includes("postgres") || n.includes("db")) return "#336791";
    if (n.includes("kafka")) return "#231F20";
    if (n.includes("linux")) return "#FCC624";
    return color || "currentColor";
  };

  const c = getBrandColor(n);

  // SVG WRAPPER
  const Svg = ({ children, viewBox = "0 0 24 24" }: { children: React.ReactNode; viewBox?: string }) => (
    <svg 
      viewBox={viewBox} 
      className={className} 
      fill="currentColor" 
      style={{ color: c }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );

  // DOCKER
  if (n.includes("docker")) {
    return (
      <Svg viewBox="0 0 24 24">
         <path d="M13.983 11.078h2.119c.102 0 .186-.084.186-.186V9.251c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm-2.891-2.147h2.119c.102 0 .186-.084.186-.186V7.104c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm2.891-2.131h2.119c.102 0 .186-.084.186-.186V5.124c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.446c0 .102.084.186.186.186zm-2.908 0h2.119c.102 0 .186-.084.186-.186V5.124c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.446c0 .102.084.186.186.186zm-2.891 0h2.119c.102 0 .186-.084.186-.186V5.124c0-.102-.084-.186-.186-.186H8.292c-.102 0-.186.084-.186.186v1.446c0 .102.084.186.186.186zm2.891-2.147h2.119c.102 0 .186-.084.186-.186V3.141c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.446c0 .102.084.186.186.186zm-2.891 0h2.119c.102 0 .186-.084.186-.186V3.141c0-.102-.084-.186-.186-.186H8.292c-.102 0-.186.084-.186.186v1.446c0 .102.084.186.186.186zm-2.891 0h2.119c.102 0 .186-.084.186-.186V3.141c0-.102-.084-.186-.186-.186H5.401c-.102 0-.186.084-.186.186v1.446c0 .102.084.186.186.186zM22.347 8.071c-.229-.737-.817-1.415-1.908-1.528-.611-.063-1.105.15-1.478.377-.219.135-.353.232-.475.232-.123 0-.256-.097-.475-.232-.373-.227-.867-.44-1.478-.377-1.091.113-1.679.791-1.908 1.528-.458 1.474.293 3.428 2.228 3.428.89 0 1.573-.321 2.115-.828l.143-.131.143.131c.542.507 1.225.828 2.115.828 1.935 0 2.686-1.954 2.228-3.428zM4.455 11.078h2.119c.102 0 .186-.084.186-.186V9.251c0-.102-.084-.186-.186-.186H4.455c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm2.891 0h2.119c.102 0 .186-.084.186-.186V9.251c0-.102-.084-.186-.186-.186H7.346c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zm2.891 0h2.119c.102 0 .186-.084.186-.186V9.251c0-.102-.084-.186-.186-.186h-2.119c-.102 0-.186.084-.186.186v1.641c0 .102.084.186.186.186zM24 12.147c-1.391 0-2.454.437-3.328 1.054-.15.105-.296.216-.438.332C20.106 13.635 19.82 13.8 19.5 13.8c-.32 0-.606-.165-.734-.267-.142-.116-.288-.227-.438-.332-.874-.617-1.937-1.054-3.328-1.054-1.391 0-2.454.437-3.328 1.054-.15.105-.296.216-.438.332C11.106 13.635 10.82 13.8 10.5 13.8c-.32 0-.606-.165-.734-.267-.142-.116-.288-.227-.438-.332-.874-.617-1.937-1.054-3.328-1.054-1.391 0-2.454.437-3.328 1.054C1.724 13.844.75 14.1 0 14.1V19c0 1.104.896 2 2 2h20c1.104 0 2-.896 2-2v-4.853c-.75 0-1.724-.256-2.672-.946-.874-.617-1.937-1.054-3.328-1.054z" />
      </Svg>
    );
  }

  // KUBERNETES
  if (n.includes("kubernetes") || n.includes("k8s")) {
    return (
      <Svg viewBox="0 0 24 24">
         <path d="M12 0l-10 6 2 12 8 6 8-6 2-12-10-6zm0 2l8 4.8v4.2l-3.2 2-4.8-2.6v-8.4zm-6.4 8.7l4.8 2.6V20.1l-6.4-4.8 1.6-6.6zm11.2 0l1.6 6.6-6.4 4.8V13.3l4.8-2.6z" />
      </Svg>
    );
  }

  // TERRAFORM
  if (n.includes("terraform")) {
    return (
      <Svg viewBox="0 0 24 24">
         <path d="M1.35 0v5.4h5.4V0H1.35zm5.4 0v10.8h5.4V0h-5.4zM12.15 0v10.8l5.4-5.4V0h-5.4zm-10.8 5.4v10.8l5.4-5.4V5.4H1.35zm10.8 5.4v10.8l5.4-5.4V10.8h-5.4zM6.75 10.8v10.8l5.4-5.4V10.8H6.75z" />
      </Svg>
    );
  }

  // AWS
  if (n.includes("aws") || n.includes("amazon")) {
    return (
      <Svg viewBox="0 0 24 24">
         <path d="M12.422 17.58c-1.31-.082-2.316-.279-3.085-.68s-2.096-.924-2.222-2.152c-.066-.642.179-1.254.732-1.751s1.5-.783 2.723-.787c1.332 0 2.222.148 2.87.5s1.25.753 1.25 1.765c0 .324.28.799-.029.799-.082 0-.25-.012-.46-.04a25.337 25.337 0 014.282-.57c-.12-.04-.26-.145-.51-.158-.291-.013-.48-.05-.48-.28V9.165c0-1.874-.84-2.822-4.524-2.822-3.13 0-5.59 1.15-5.59 3.498 0 .425-.01.99.31 1.05.08.01.21.03.38.04.14 0 .48 0 .5-.32.09-1.39 1.13-2.08 4.34-2.08 3.19 0 3.33.68 3.33 1.83v2.09c0 .77-.42.92-1.04 1.1-1.01.29-2.29.39-3.32.39-1.89 0-3.41.48-4.23 1.34s-1.12 2.01-.89 3.23c.31 1.63 2.37 2.64 4.88 2.64 1.33 0 2.4-.33 3.1-.64 1.05-.47 1.48-1.11 1.48-2.61.01.12.01.3-.01.44zM22.844 11.233c.08-.01.21-.03.38-.04a.434.434 0 01.39.04c.14 0 .44 0 .51.15.53 1.09 1.46 2.85 2.12 3.84.44.66.75-.41 1.03-1.02.73-1.57 2.03-4.14 2.45-5.02.13-.26.23-.39.42-.4.49-.03.78.1.91.5a.656.656 0 01-.01.45c-.34.69-3.05 6.09-3.44 6.87-.97 1.95-.27 1.17-.61.49l-1.63-3.23a260.602 260.602 0 01-2.52-5.11zm-18.784.81c.08-.01.21-.03.38-.04.14 0 .44 0 .5.15.53 1.09 1.76 3.52 2.22 4.41.44.89-.04 1-.22.64-.17-.34-.41-.83-.69-1.38s-.86-1.74-1.29-2.62c-.44-.88-.86-1.71-1.25-2.49-.05-.1-.13-.19-.13-.26s.01-.13.37-.21c.07-.02.13-.04.11-.2z" />
      </Svg>
    );
  }

  // FALLBACK TO LUCIDE
  const LucideIcon = () => {
    if (n.includes("git") && !n.includes("hub")) return <GitBranch className={className} style={{ color: c }} />;
    if (n.includes("linux") || n.includes("os")) return <Terminal className={className} style={{ color: c }} />;
    if (n.includes("database") || n.includes("sql")) return <Database className={className} style={{ color: c }} />;
    if (n.includes("api") || n.includes("server")) return <Server className={className} style={{ color: c }} />;
    if (n.includes("cloud") || n.includes("deploy")) return <Cloud className={className} style={{ color: c }} />;
    if (n.includes("monitoring") || n.includes("grafana")) return <Layers className={className} style={{ color: c }} />;
    if (n.includes("security") || n.includes("vault")) return <Shield className={className} style={{ color: c }} />;
    if (n.includes("python") || n.includes("scripts")) return <Cpu className={className} style={{ color: c }} />;
    if (n.includes("blog") || n.includes("article")) return <FileText className={className} style={{ color: c }} />;
    if (n.includes("video") || n.includes("youtube")) return <Youtube className={className} style={{ color: c }} />;
    return <Box className={className} style={{ color: c }} />;
  };

  return <LucideIcon />;
};
