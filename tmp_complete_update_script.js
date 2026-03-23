const fs = require('fs');

function replaceInFile(filepath, target, replacement) {
  let content = fs.readFileSync(filepath, 'utf8');
  const targetNoCrlf = target.replace(/\r\n/g, '\n');
  const contentNoCrlf = content.replace(/\r\n/g, '\n');

  if (contentNoCrlf.includes(targetNoCrlf)) {
    const isCrlf = content.includes('\r\n');
    const updated = contentNoCrlf.replace(targetNoCrlf, replacement.replace(/\r\n/g, '\n'));
    fs.writeFileSync(filepath, isCrlf ? updated.replace(/\n/g, '\r\n') : updated);
    console.log(`Updated ${filepath} successfully!`);
    return true;
  } else {
    console.log(`Target not found in ${filepath}`);
    return false;
  }
}

// 1. Update /api/modules/[id]/route.ts to take introContent
const modulesRouteFile = 'c:\\my-stuff\\devops-hub\\src\\app\\api\\modules\\[id]\\route.ts';
const modulesTarget1 = `const { title, description, icon, status, tags, topics, resources } = await req.json();`;
const modulesReplacement1 = `const { title, description, icon, status, tags, topics, resources, introContent } = await req.json();`;

const modulesTarget2 = `          data: {
            title: title || "Untitled",
            description: description || "",
            icon: icon || "📦",
            status: status || "PENDING",
            tags: tags || "",
          } as any,`;

const modulesReplacement2 = `          data: {
            title: title || "Untitled",
            description: description || "",
            icon: icon || "📦",
            status: status || "PENDING",
            tags: tags || "",
            introContent: introContent !== undefined ? introContent : undefined,
          } as any,`;

replaceInFile(modulesRouteFile, modulesTarget1, modulesReplacement1);
replaceInFile(modulesRouteFile, modulesTarget2, modulesReplacement2);


// 2. Update app/admin/roadmaps/[id]/page.tsx handleSave
const adminPageFile = 'c:\\my-stuff\\devops-hub\\src\\app\\admin\\roadmaps\\[id]\\page.tsx';
const adminTarget = `      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Save failed");
      }

      router.push("/admin/roadmaps");`;

const adminReplacement = `      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Save failed");
      }

      // Save introContent per step after roadmap metadata saved
      await Promise.all(
        form.steps
          .filter(s => s.id && s.introContent !== undefined)
          .map(s =>
            fetch(\`/api/modules/\${s.id}\`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                title: s.title, // Pass minimal required fields for API PUT validation if needed
                introContent: s.introContent 
              }),
            })
          )
      );

      router.push("/admin/roadmaps");`;

replaceInFile(adminPageFile, adminTarget, adminReplacement);
