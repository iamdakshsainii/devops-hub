path = r"c:\my-stuff\devops-hub\src\app\admin\roadmaps\[id]\page.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

broken_block = '''            <Button onClick={handleJsonParse}>Apply JSON to Form</Button>
          </CardContent>
        </Card>
      {/* Markdown / AI Paste Mode */}'''

fixed_block = '''            <Button onClick={handleJsonParse}>Apply JSON to Form</Button>
          </CardContent>
        </Card>
      )}

      {/* Markdown / AI Paste Mode */}'''

if broken_block in content:
    content = content.replace(broken_block, fixed_block)
    
    # Add FileText to imports if not there
    if 'FileText' not in content:
        content = content.replace('Code2, Type,', 'Code2, Type, FileText,')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed bracket and icon issues")
else:
    print("Broken block not found exactly in string")
