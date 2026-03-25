# Version Control & GitHub
Master version control from first principles — understand why it exists, how Git works under the hood, and how GitHub powers modern DevOps workflows.

## Version Control — The Foundation

Imagine you are writing a script to automate server deployments. You make a change, something breaks, and now you cannot remember what the file looked like before. So you start naming files like `deploy_final.sh`, `deploy_final_v2.sh`, `deploy_final_v2_ACTUAL.sh`. Sound familiar?

This is the problem **version control** solves. It is a system that tracks every change made to your files over time. Every modification is recorded — who made it, when, and why. You can go back to any point in history, compare versions, and collaborate with a team without overwriting each other's work.

For a DevOps engineer, version control is not optional. Every script, every pipeline config, every Dockerfile, every Terraform file lives in version control. It is the foundation everything else is built on.

### Why Version Control Exists

Without version control, teams hit these problems every day:

* **No history** — you change something, it breaks, and there is no way to see what the file looked like before
* **Overwriting work** — two people edit the same file, one saves last, the other's changes are gone forever
* **No accountability** — something breaks in production and nobody knows who changed what or when
* **Fear of change** — engineers are scared to touch working code because there is no safety net
* **Manual backups** — people copy folders and name them with dates, which is messy and still unreliable

Version control solves all of these by keeping a complete, timestamped history of every change — forever.

### How Version Control Works

At its core, version control works by taking **snapshots** of your files at different points in time. Each snapshot captures exactly what every tracked file looked like at that moment.

    Your project over time:

    Snapshot 1 → Snapshot 2 → Snapshot 3 → Snapshot 4
    (first write)  (new feature)  (bug fix)   (you are here)

         ↑
         You can jump back to any of these at any time

When something breaks in production, you look at the history, find the last good snapshot, and either roll back to it or understand exactly what changed.

### Centralized vs Distributed Version Control

There are two types of version control systems. This distinction matters because Git is distributed:

| | Centralized (SVN) | Distributed (Git) |
|---|---|---|
| Where history lives | Only on a central server | Every developer has full history locally |
| Works offline | No — needs server | Yes — full history on your machine |
| Speed | Slower — hits server every time | Fast — most ops are local |
| Risk | Server down = nobody works | Every clone is a full backup |
| Industry today | Legacy systems | Standard everywhere |

Because Git is distributed, every developer on your team has the complete project history on their laptop. If the server disappears, nobody loses anything.

### Key Version Control Concepts

These terms are universal — they apply to Git, SVN, or any other system. Learn them once and they follow you everywhere:

| Concept | What it means |
|---|---|
| **Repository** | The tracked project folder — contains all files and complete history |
| **Commit** | A saved snapshot with a message describing what changed |
| **Branch** | An independent copy of the code to work on without touching main |
| **Merge** | Combining changes from one branch into another |
| **Conflict** | Two people edited the same part of a file — needs manual resolution |
| **Clone** | Download a full copy of a repository including all history |
| **Push** | Upload your local commits to a remote server |
| **Pull** | Download and apply the latest remote changes locally |

---

## What is Git

**Git** is a free, open-source, distributed version control system. It is the tool installed on your machine that does the actual tracking — recording changes, managing branches, and storing history. Created by **Linus Torvalds in 2005**, it is now the industry standard used by every company from startups to Google and Netflix.

When people say "version control" in a DevOps context, they mean Git.

### Git vs GitHub — Not the Same Thing

| | Git | GitHub |
|---|---|---|
| What it is | Version control tool on your machine | Cloud platform that hosts Git repos |
| Where it runs | Locally on your computer | On GitHub's servers |
| Who made it | Linus Torvalds (2005) | GitHub Inc. (now Microsoft) |
| Needs the other? | No — works fully offline | Yes — needs Git underneath |
| Alternatives | — | GitLab, Bitbucket, Azure Repos |

Think of **Git** as the engine and **GitHub** as the car around it.

### Installing and Configuring Git

```bash
git --version                              # check if git is installed
sudo apt install git                       # install on Ubuntu / Debian
brew install git                           # install on macOS
```

After installing, set your identity — this attaches to every commit you make:

```bash
git config --global user.name "Your Name"         # your name on commits
git config --global user.email "you@email.com"    # your email on commits
git config --global core.editor "nano"            # default text editor
git config --list                                 # verify settings
```

### The Three States of Git

Every file in a Git repo lives in one of three states — understanding this removes most beginner confusion:

| State | What it means |
|---|---|
| **Modified** | You changed the file but Git doesn't know yet |
| **Staged** | You ran `git add` — Git knows, change is queued for commit |
| **Committed** | Snapshot is permanently saved in local Git history |

    Modified  →  (git add)  →  Staged  →  (git commit)  →  Committed

### Core Git Workflow

```bash
git init                                     # initialize a new repo in current folder
git status                                   # see what files changed
git add .                                    # stage all changes
git add filename.sh                          # stage one specific file
git commit -m "feat: add healthcheck route"  # save snapshot with a message
git log --oneline                            # see commit history compact view
git diff                                     # see exact line changes before staging
```

### Branches in Git

A **branch** is an independent line of development. The default is `main`. When working on a new feature or fix, you create a branch — your changes are isolated and don't touch `main` until you merge.

    main:    A --- B --- C ----------- F  (merge commit)
                          \           /
    feature:               D --- E ---

Ten developers on ten branches simultaneously — no one steps on each other. This is what makes team collaboration scale.

```bash
git checkout -b feature/login-page     # create and switch to a new branch
git branch                             # list all local branches
git checkout main                      # switch back to main
git merge feature/login-page           # merge feature into main
git branch -d feature/login-page       # delete branch after merging
```

### Undoing Things in Git

```bash
git revert abc123              # safely undo a commit by creating a new one
git reset --hard HEAD          # discard ALL local changes — go to last commit
git stash                      # save changes temporarily without committing
git stash pop                  # bring stashed changes back
git cherry-pick abc123         # copy one specific commit onto current branch
```

`git revert` is safe in teams — it doesn't rewrite history. `git reset --hard` rewrites history and should never be used on shared branches.

---

## What is GitHub

**GitHub** is a cloud-based platform that hosts Git repositories. It gives your local Git history a home on the internet, adds collaboration features on top, and in modern DevOps acts as the trigger point for your entire CI/CD pipeline.

When a developer pushes code to GitHub — your GitHub Actions CI runs, your ArgoCD syncs, your Kubernetes cluster updates. Everything in the delivery pipeline starts with a GitHub event.

![GitHub for DevOps](https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=800&q=80)

### Creating and Connecting Repositories

```bash
git clone https://github.com/username/repo-name.git    # copy a remote repo locally
cd repo-name                                           # enter the folder
```

If you already have a local project and want to push it to GitHub:

```bash
git init                                                             # initialize Git locally
git remote add origin https://github.com/username/repo-name.git     # connect to GitHub
git push -u origin main                                              # first push
```

`origin` is just the shortcut name for your GitHub URL. `git push origin main` means: push my main branch to the remote named origin.

### Fetch, Pull, Push

| Command | What it does |
|---|---|
| `git fetch` | Downloads changes from GitHub but does NOT apply them yet |
| `git pull` | Downloads AND merges changes into your current branch |
| `git push` | Uploads your local commits to GitHub |

Always `git pull` before starting work to get the latest from your team.

---

## Pull Requests — Collaboration on GitHub

A **Pull Request (PR)** is GitHub's way of proposing and reviewing changes before they go into `main`. This is how every professional team collaborates — nothing reaches production without a review and a passing CI check.

    Create a feature branch
            ↓
    Make changes and commit locally
            ↓
    Push branch to GitHub
            ↓
    Open a Pull Request on GitHub
            ↓
    Team reviews code, leaves comments
            ↓
    CI pipeline runs automatically on the PR
            ↓
    PR approved → merged to main
            ↓
    Feature branch deleted

### Merge Strategies

| Strategy | What it does | When to use |
|---|---|---|
| **Merge commit** | Creates a merge commit — full branch history preserved | When you want every commit visible |
| **Squash and merge** | Combines all PR commits into one single commit | When PR has messy WIP commits |
| **Rebase and merge** | Replays commits on top of main — linear history | When you want a clean timeline |

Most teams pick one and stick to it. Squash merge keeps `main` clean — one commit per feature.

---

## Branching Strategies for Teams

### GitFlow

**GitFlow** is a structured model with dedicated branches for features, releases, and hotfixes. Suits teams with scheduled release cycles:

    main         → production code, always stable
    develop      → integration branch, features merge here first
    feature/*    → one branch per feature
    release/*    → final testing prep before production
    hotfix/*     → emergency fix branched directly from main

### Trunk-Based Development

**Trunk-based development** is the modern approach — everyone commits to `main` frequently using branches that live hours or days, not weeks. This is what CI/CD-heavy teams use:

    main ← short-lived branches merged within 1-2 days
    CI runs on every merge
    Production deployments happen multiple times per day

| | GitFlow | Trunk-Based |
|---|---|---|
| Branch lifespan | Weeks | Hours to 2 days |
| Release cadence | Scheduled | Continuous |
| CI/CD fit | Moderate | Excellent |
| Best for | Large teams, versioned releases | Agile teams, SaaS products |

---

## GitHub Actions — CI/CD Built In

**GitHub Actions** is GitHub's built-in automation platform. It runs workflows triggered by GitHub events — a push, a pull request, a release, a schedule. For DevOps engineers it often replaces a separate Jenkins server entirely.

Workflow files live in `.github/workflows/` as YAML files. GitHub runs them on its own VMs.

    Code pushed to GitHub
            ↓
    GitHub detects the event
            ↓
    Actions workflow triggers
            ↓
    Runner VM spins up automatically
            ↓
    Steps run: install → test → build → push image → deploy
            ↓
    Results reported back to the PR or commit

| Term | What it means |
|---|---|
| **Workflow** | YAML file defining automation — lives in `.github/workflows/` |
| **Event** | What triggers it — `push`, `pull_request`, `schedule`, `release` |
| **Job** | A group of steps running on the same VM |
| **Step** | One task — run a command or use a pre-built Action |
| **Action** | Reusable automation unit from the GitHub Marketplace |
| **Runner** | The VM GitHub spins up to execute your job |

---

## GitHub Security Features

### Branch Protection Rules

Branch protection on `main` enforces quality gates so nothing broken can reach production:

* Require at least one pull request review before merging
* Require CI checks to pass before merging
* Prevent direct force pushes to `main`
* Require signed commits for verified authorship

No one — including admins — can bypass these rules once set.

### Secrets Management

Workflows need sensitive values — cloud credentials, registry passwords, API keys. Never hardcode these. Store them as **GitHub Secrets** in repository settings:

    Repository Settings → Secrets and Variables → Actions
            ↓
    Add secret: AWS_ACCESS_KEY = ****
            ↓
    Reference in workflow: ${{ secrets.AWS_ACCESS_KEY }}

Secrets are encrypted, never printed in logs, and only accessible during workflow runs.

### Dependabot

**Dependabot** automatically scans your `package.json`, `requirements.txt`, or `Dockerfile` and opens pull requests when dependencies are outdated or have known vulnerabilities. Passive security that runs without any manual work.

---

## .gitignore — What Not to Track

A `.gitignore` file tells Git which files to never track. Without it, secrets and build junk end up permanently in your repository history.

```bash
node_modules/        # installed dependencies — never commit these
.env                 # environment file with secrets and credentials
dist/                # compiled build output
*.log                # log files
.DS_Store            # macOS metadata junk
terraform.tfstate    # Terraform state — contains infrastructure secrets
```

If you accidentally commit a secret to a public repo, rotate it immediately. Deleting it in the next commit does not remove it from Git history.

---

## Daily Git Command Reference

```bash
git status                      # see what changed locally
git log --oneline               # compact commit history
git diff                        # see exact line-level changes
git stash                       # save changes without committing
git stash pop                   # restore stashed changes
git reset --hard HEAD           # discard all local changes
git revert abc123               # safely undo a specific commit
git cherry-pick abc123          # copy a commit onto current branch
git tag v1.0.0                  # create a version tag
git push origin --tags          # push all tags to GitHub
git remote -v                   # see configured remote URLs
```

---

## How GitHub Fits Into the Full DevOps Pipeline

GitHub is not just where code is stored. It is the event source that drives the entire delivery system:

    Developer pushes code or merges a PR on GitHub
            ↓
    GitHub Actions CI triggers automatically
    tests run, Docker image built and scanned
            ↓
    Image pushed to GitHub Container Registry (GHCR)
            ↓
    ArgoCD or Flux detects the new image tag
            ↓
    Kubernetes deployment updated automatically
            ↓
    Prometheus and Grafana confirm healthy rollout

Every tool downstream reacts to a GitHub event — a push, a merged PR, a new tag. Master GitHub and you have mastered the starting point of every modern DevOps pipeline.