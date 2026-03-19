path = r"c:\my-stuff\devops-hub\tmp\seed_modules.js"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Escape ${{ to \${{ to prevent template literal evaluation crashes
content_fixed = content.replace('${{', '\\${{')

if content_fixed != content:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content_fixed)
    print("Fixed Github Tokens")
else:
    print("No matches")
