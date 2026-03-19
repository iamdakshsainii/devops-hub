import { marked } from "marked";
import fs from "fs";

const content = `\`\`\`bash
# Remove older versions if present
sudo apt remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
\`\`\``;

const html = marked.parse(content);
fs.writeFileSync("c:/my-stuff/devops-hub/tmp/marked_output.html", html);
console.log("Written marked_output.html");
