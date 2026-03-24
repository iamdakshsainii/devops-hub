with open("src/components/step-viewer.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "wireCopyButtons" in line:
        print(f"Line {i+1}: {line.strip()}")
        
print("Finished search forwards and accurate.")
