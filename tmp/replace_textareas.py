import re

def fix_id_page():
    path = r"c:\my-stuff\devops-hub\src\app\admin\roadmaps\[id]\page.tsx"
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = r'''<textarea\s+value=\{topic\.content\}\s+onChange=\{\(e\)\s*=>\s*updateTopic\(si,\s*ti,\s*\{\s*content:\s*e\.target\.value\s*\}\)\}\s+placeholder="[^"]+"\s+className="[^"]+"\s*/>'''
    # Since it covers newlines:
    pattern_lines = r'''<textarea\s*\n\s*value=\{topic\.content\}\s*\n\s*onChange=\{\(e\)\s*=>\s*updateTopic\(si,\s*ti,\s*\{\s*content:\s*e\.target\.value\s*\}\)\}\s*\n\s*placeholder="[^"]+"\s*\n\s*className="[^"]+"\s*\n\s*/>'''
    
    # Let's do a direct replace by finding landmarks
    landmark = '''                          <textarea
                            value={topic.content}
                            onChange={(e) => updateTopic(si, ti, { content: e.target.value })}
                            placeholder="HTML content for this topic (supports <h2>, <p>, <ul>, <code>, etc.)"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono min-h-[100px]"
                          />'''
    
    replacement = '''                          <Editor 
                            content={topic.content} 
                            onChange={(html) => updateTopic(si, ti, { content: html })} 
                          />'''
    
    if landmark in content:
        content = content.replace(landmark, replacement)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success for [id]/page.tsx")
    else:
        print("Landmark not found in [id]/page.tsx")

def fix_new_page():
    path = r"c:\my-stuff\devops-hub\src\app\admin\roadmaps\new\page.tsx"
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add import
    import_line = 'import { Editor } from "@/components/editor";\n'
    if import_line not in content:
        content = content.replace('import { useState } from "react";', 'import { useState } from "react";\n' + import_line)
    
    landmark = '''                          <textarea value={topic.content} onChange={e=>updateTopic(si,ti,{content:e.target.value})}
                            placeholder="HTML content (supports <h2>, <p>, <ul>, <code>, etc.)"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono min-h-[100px]"/>'''
    
    replacement = '''                          <Editor 
                            content={topic.content} 
                            onChange={(html) => updateTopic(si, ti, { content: html })} 
                          />'''
    
    if landmark in content:
        content = content.replace(landmark, replacement)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success for new/page.tsx")
    else:
        # Try finding flexible content
        print("Landmark not found in new/page.tsx")

fix_id_page()
fix_new_page()
