const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "content", "linux-as-foundation-sample.md");

try {
  let content = fs.readFileSync(filePath, "utf8");
  
  // Replace all '### ' with '#### ' to push them inside the reading area layout 
  const updated = content.split("\n").map(line => {
    if (line.startsWith("### ")) {
      return "#### " + line.substring(4);
    }
    return line;
  }).join("\n");

  fs.writeFileSync(filePath, updated, "utf8");
  console.log("Successfully updated linux-as-foundation-sample.md!");
} catch (err) {
  console.error("Failed to update file:", err);
}
