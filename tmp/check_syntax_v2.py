import subprocess

path = r"c:\my-stuff\devops-hub\tmp\seed_modules.js"
result = subprocess.run(["node", "-c", path], capture_output=True, text=True)

with open(r"c:\my-stuff\devops-hub\tmp\syntax_full.txt", 'w', encoding='utf-8') as f:
    f.write("--- STDOUT ---\n")
    f.write(result.stdout)
    f.write("\n--- STDERR ---\n")
    f.write(result.stderr)
    f.write("\nExit code: {}\n".format(result.returncode))

print("Saved to syntax_full.txt")
