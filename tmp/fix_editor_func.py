path = r"c:\my-stuff\devops-hub\src\app\admin\roadmaps\[id]\page.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

broken_block = '''  // JSON mode parsing
  const handleJsonParse = () => { ... } // Replaced with existing JSON logic below 
  const handleMarkdownParse = () => {'''

fixed_block = '''  // JSON mode parsing
  const handleJsonParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setForm({
        title: parsed.title || form.title,
        description: parsed.description || form.description,
        icon: parsed.icon || form.icon,
        color: parsed.color || form.color,
        status: parsed.status || form.status,
        steps: (parsed.steps || []).map((s: any) => ({
          title: s.title || "",
          description: s.description || "",
          icon: s.icon || "📦",
          topics: (s.topics || []).map((t: any) => ({
            title: t.title || "",
            content: t.content || "",
          })),
          resources: (s.resources || []).map((r: any) => ({
            title: r.title || "",
            url: r.url || "",
            type: r.type || "ARTICLE",
            description: r.description || "",
          })),
          expanded: false,
        })),
      });
      setMode("FORM");
      setError("");
    } catch {
      setError("Invalid JSON format");
    }
  };

  const handleMarkdownParse = () => {'''

if broken_block in content:
    content = content.replace(broken_block, fixed_block)
    # Write back
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed JSON parse logic")
else:
    print("Broken block not found in exactly string")
