with open("src/components/step-viewer.tsx", "r", encoding="utf-8") as f:
    text = f.read()

count = text.count("wireCopyButtons")
print(f"Found 'wireCopyButtons' {count} times")

idx = text.find("wireCopyButtons", text.find("wireCopyButtons") + 1)
if idx != -1:
    print(f"Second index is around: {idx}")
else:
    print("Only found declaration node at top.")
