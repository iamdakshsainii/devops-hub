path = r"c:\my-stuff\devops-hub\tmp\seed_modules.js"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Escape double or triple backticks inside template strings
content_fixed = content.replace('```', '\\`\\`\\`').replace('---', '---') # --- is fine

if content_fixed != content:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content_fixed)
    print("Fixed Backticks")
else:
    print("No matches")
