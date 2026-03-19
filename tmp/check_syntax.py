import os
import subprocess

path = r"c:\my-stuff\devops-hub\tmp\seed_modules.js"
result = subprocess.run(["node", "-c", path], capture_output=True, text=True)

print("--- STDOUT ---")
print(result.stdout)
print("--- STDERR ---")
print(result.stderr)
print("Exit code:", result.returncode)
