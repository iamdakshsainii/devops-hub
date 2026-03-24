with open("src/components/step-viewer.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

output = []
count = 0
for line in lines:
    count += 1
    output.append(line)
    # Stop exactly at the proper brace closing tag of subtopic stepviewer component
    if count == 1000:
        break

# Reconstruct bottom
output.append("        </main>\n")
output.append("      </div>\n")
output.append("    </div>\n")
output.append("  );\n")
output.append("}\n")

with open("src/components/step-viewer.tsx", "w", encoding="utf-8") as f:
    f.writelines(output)

print("Trimmed file successfully to 1005 lines setup boundswards downwards.")
