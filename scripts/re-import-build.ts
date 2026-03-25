import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const CONTENT = `# Build & Package Management

A beginner-friendly guide to understanding how raw code becomes a deployable application — covering build tools, dependency management, artifact creation, and a complete reference project.

## Introduction

Understanding Build & Package Management is one of the most important foundations in DevOps. Before your app can run anywhere — a server, a container, or the cloud — it goes through a structured process: source code gets compiled or bundled, dependencies get pulled in, and a final deployable package gets created.

Think of it like cooking:
- Your source code = raw ingredients
- Build tool = the oven/stove
- Dependencies = spices and add-ons you buy from a store
- Artifact = the final dish, ready to serve

### Why it Matters in DevOps

- Ensures the app runs the same way in dev, staging, and production
- Automates repetitive manual steps
- Makes deployments fast and reliable
- Catches errors early (during build/test phase)

### The General Flow

\`\`\`
Source Code
    |
    v
Install Dependencies  <-- package manager (npm, pip, maven)
    |
    v
Compile / Bundle      <-- build tool (webpack, go build, mvn)
    |
    v
Run Tests             <-- unit/integration tests
    |
    v
Create Artifact       <-- .jar, .whl, Docker image, binary
    |
    v
Store in Repository   <-- Nexus, Artifactory, Docker Hub
    |
    v
Deploy
\`\`\`

## Build Tools

Build tools automate the steps needed to turn source code into a runnable artifact. Every language ecosystem has its own tooling, but the concept is the same — take raw source files, process them, and produce something deployable.

### Common Build Tools by Language

| Language   | Build Tool(s)           | Output Artifact         |
|:-----------|:------------------------|:------------------------|
| Java       | Maven, Gradle           | \`.jar\`, \`.war\`          |
| JavaScript | npm, yarn, webpack      | bundled JS files        |
| Python     | pip, poetry, setuptools | \`.whl\`, \`.tar.gz\`       |
| Go         | \`go build\` (built-in)   | binary executable       |
| C/C++      | Make, CMake             | binary executable       |

### Build Lifecycle

Most build tools follow a fixed sequence of steps called a **lifecycle**. Each step depends on the previous one completing successfully.

Maven's lifecycle is a great example to understand this:

\`\`\`
clean  →  validate  →  compile  →  test  →  package  →  install  →  deploy
\`\`\`

- \`clean\` — removes old build output so you start fresh
- \`compile\` — turns \`.java\` source files into \`.class\` bytecode
- \`test\` — runs your unit tests automatically
- \`package\` — wraps everything into a \`.jar\` or \`.war\` file
- \`install\` — puts the artifact in your local Maven repository
- \`deploy\` — uploads the artifact to a remote repository

Other build tools have similar stages, even if the names differ.

### Common Build Commands

\`\`\`bash
# Java (Maven)
mvn clean package          # clean old build + compile + test + create .jar

# Java (Gradle)
gradle build               # compile + test + package

# JavaScript (npm)
npm run build              # runs the build script defined in package.json

# Python
python -m build            # creates .whl and .tar.gz in /dist folder

# Go
go build -o myapp ./...    # compiles everything into a binary named myapp
\`\`\`

## Dependency & Package Management

Almost no application runs in isolation. Your code relies on external libraries — pieces of code written by others that you import into your project. Managing these libraries (installing, versioning, and locking them) is what package management is all about.

### What Are Dependencies and Package Managers

A **dependency** is any external library your app needs to work. A **package manager** is the tool that fetches, installs, and manages those libraries for you.

Example: A Node.js app that sends emails might depend on the \`nodemailer\` library. Instead of writing email-sending logic yourself, you install nodemailer and use it.

| Language   | Package Manager | Config File       | Lock File           |
|:-----------|:----------------|:------------------|:--------------------|
| JavaScript | npm, yarn, pnpm | \`package.json\`    | \`package-lock.json\` |
| Python     | pip, poetry     | \`pyproject.toml\`  | \`poetry.lock\`       |
| Java       | Maven           | \`pom.xml\`         | (resolved at build) |
| Go         | Go Modules      | \`go.mod\`          | \`go.sum\`            |

### Version Pinning and Lock Files

When you add a dependency, you also specify which version you want. This is called **version pinning**.

\`\`\`json
// package.json (Node.js)
{
  "dependencies": {
    "express": "^4.18.0",    // ^ = compatible updates allowed (4.x.x)
    "lodash": "~4.17.0",     // ~ = patch updates only (4.17.x)
    "axios": "1.4.0"         // exact version, never changes
  }
}
\`\`\`

- \`^\` (caret) — allows minor and patch updates
- \`~\` (tilde) — allows patch updates only
- exact version — completely locked, no automatic updates

**Lock files** take this one step further — they record the exact version of every dependency (including dependencies of dependencies) that was installed.

\`\`\`
Without lock file:  Dev installs axios 1.4.0, CI installs axios 1.5.1 → different behavior
With lock file:     Both always install axios 1.4.0 → reproducible builds
\`\`\`

Always commit your lock file to version control. It is the guarantee of reproducibility.

### Installing Dependencies

\`\`\`bash
# Node.js
npm install                       # installs from package.json, creates lock file
npm install express               # adds a new dependency

# Python (pip)
pip install -r requirements.txt   # installs all listed packages

# Python (poetry)
poetry install                    # installs from pyproject.toml + poetry.lock

# Java (Maven)
mvn dependency:resolve            # downloads all dependencies from pom.xml

# Go
go mod tidy                       # installs/removes based on go.mod
\`\`\`

## Artifact Creation & Storage

After a successful build, the output is called an **artifact** — the thing you actually deploy. Managing artifacts properly (naming, versioning, storing) is critical for reliable deployments.

### Artifact Types and Repositories

An artifact is the packaged output of a build. Different ecosystems produce different artifact types.

| Language   | Artifact Type       | Description                            |
|:-----------|:--------------------|:---------------------------------------|
| Java       | \`.jar\` / \`.war\`     | Packaged bytecode + dependencies       |
| Python     | \`.whl\` (wheel)      | Installable Python package             |
| Go         | binary              | Single compiled executable             |
| JavaScript | bundled \`.js\` files | Minified, optimized frontend code      |
| Docker     | image               | Complete app + OS layer, runs anywhere |

After building, artifacts are stored in a **repository** so they can be versioned, shared, and pulled by deployment pipelines.

| Repository       | Use Case                                        |
|:-----------------|:------------------------------------------------|
| Nexus            | Store \`.jar\`, \`.whl\`, npm packages (self-hosted)|
| Artifactory      | Enterprise artifact storage (JFrog)             |
| Docker Hub       | Public/private Docker images                    |
| AWS ECR          | Docker images on AWS                            |
| GitHub Packages  | Packages tied to your GitHub repository         |

### Versioning Artifacts

Always version your artifacts using **Semantic Versioning**:

\`\`\`
v1.0.0   →  v1.0.1   patch: bug fix, no new features
         →  v1.1.0   minor: new feature, backward compatible
         →  v2.0.0   major: breaking change
\`\`\`

Never overwrite an existing version. Always produce a new version tag for every release.

### Packaging with Docker

In modern DevOps, almost every app gets packaged as a **Docker image**. An image bundles your app, its runtime, and its dependencies into a single portable unit that runs identically everywhere.

\`\`\`dockerfile
# Example Dockerfile for a Python app
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]
\`\`\`

\`\`\`bash
# Build the image
docker build -t myapp:v1.0.0 .

# Push to Docker Hub
docker push myusername/myapp:v1.0.0
\`\`\`

## Reference Project: Python Flask App

A complete, working example using Python. This walks through every stage — from writing code to packaging it as a Docker image — following the full Build & Package Management lifecycle.

### Project Structure

\`\`\`
flask-demo/
|-- app.py
|-- requirements.txt
|-- tests/
|   \`-- test_app.py
|-- Dockerfile
\`-- Makefile
\`\`\`

### The Application

\`\`\`python
# app.py
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({"message": "Build & Package Demo", "status": "ok"})

@app.route("/health")
def health():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
\`\`\`

### Dependencies, Tests & Build

**Step 1 — Declare dependencies** in \`requirements.txt\` with exact versions for reproducibility:

\`\`\`
flask==3.0.0
pytest==7.4.3
\`\`\`

**Step 2 — Set up the environment and install:**

\`\`\`bash
python -m venv venv
source venv/bin/activate       # Linux/Mac

pip install -r requirements.txt
\`\`\`

**Step 3 — Write a test** so the build pipeline can verify correctness before packaging:

\`\`\`python
# tests/test_app.py
import pytest
from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_home(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"

def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "healthy"
\`\`\`

**Step 4 — Run tests:**

\`\`\`bash
pytest tests/

# Expected output:
# collected 2 items
# tests/test_app.py ..     [100%]
# ====== 2 passed in 0.45s ======
\`\`\`

### Docker Image & Makefile Automation

**Step 5 — Package into a Docker image:**

\`\`\`dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
\`\`\`

\`\`\`bash
docker build -t flask-demo:v1.0.0 .
docker run -p 5000:5000 flask-demo:v1.0.0

# Verify
curl http://localhost:5000/
# {"message": "Build & Package Demo", "status": "ok"}
\`\`\`

**Step 6 — Tie everything together with a Makefile:**

\`\`\`makefile
.PHONY: install test build run all

install:
	pip install -r requirements.txt

test:
	pytest tests/

build:
	docker build -t flask-demo:v1.0.0 .

run:
	docker run -p 5000:5000 flask-demo:v1.0.0

all: install test build
\`\`\`

Now the entire pipeline runs with one command:

\`\`\`bash
make all     # install → test → build Docker image
make run     # start the container
\`\`\`

### Complete Flow Summary

\`\`\`
1. Write code              app.py
          |
2. Declare dependencies    requirements.txt  (pinned versions)
          |
3. Install                 pip install -r requirements.txt
          |
4. Test                    pytest tests/  (must pass before packaging)
          |
5. Package                 docker build -t flask-demo:v1.0.0 .
          |
6. Store                   docker push → Docker Hub / ECR
          |
7. Deploy                  container runs identically in any environment
\`\`\`

This is the complete Build & Package Management cycle — from raw source code to a deployable, versioned Docker image ready for any environment.`;

async function main() {
  const step = await prisma.roadmapStep.findFirst({
    where: { title: "Build and Package management" },
  });

  if (!step) {
    console.log("Module not found.");
    return;
  }

  const lines = CONTENT.split("\n");
  let currentTopic: any = null;
  let currentSubtopic: any = null;
  const topics: any[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      currentTopic = { title: trimmed.replace(/^##\s*/, ""), content: "", subtopics: [] };
      topics.push(currentTopic);
      currentSubtopic = null;
    } else if (trimmed.startsWith("### ")) {
      if (!currentTopic) {
        currentTopic = { title: "Introduction", content: "", subtopics: [] };
        topics.push(currentTopic);
      }
      currentSubtopic = { title: trimmed.replace(/^###\s*/, ""), content: "" };
      currentTopic.subtopics.push(currentSubtopic);
    } else if (currentSubtopic) {
      currentSubtopic.content += line + "\n";
    } else if (currentTopic) {
      currentTopic.content += line + "\n";
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.roadmapTopic.deleteMany({ where: { stepId: step.id } });
    for (let i = 0; i < topics.length; i++) {
      const t = topics[i];
      await tx.roadmapTopic.create({
        data: {
          stepId: step.id,
          title: t.title.trim(),
          content: t.content.trim(),
          order: i,
          subtopics: {
            create: t.subtopics.map((s: any, si: number) => ({
              title: s.title.trim(),
              content: s.content.trim(),
              order: si,
            })),
          },
        },
      });
    }
  });

  console.log("Re-imported Build module perfectly!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
