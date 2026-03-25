# GitHub Actions

GitHub Actions - CI/CD Tool

## Introduction

### Core Concepts

GitHub Actions works around 5 key concepts:

- **Workflow** — A YAML file in `.github/workflows/` that defines automation
- **Event** — A trigger that starts a workflow (push, PR, schedule, manual)
- **Job** — A set of steps that run on the same runner
- **Step** — A single task — either a shell command or an Action
- **Action** — A reusable unit of code from the marketplace or your own repo

### How It Compares

| Feature | GitHub Actions | Jenkins | CircleCI |
|---|---|---|---|
| Setup | Zero — built into GitHub | Self-hosted server | Cloud SaaS |
| Config | YAML in repo | Groovy DSL | YAML |
| Free tier | 2000 min/month | Free (self-host) | 6000 min/month |
| Marketplace | 20,000+ actions | Plugins | Orbs |
| Matrix builds | Native | Plugin needed | Native |

![GitHub Actions Overview](https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80)

### First Workflow

Your first workflow runs on every push to main and prints Hello World.

### Basic Workflow Structure

```yaml
# .github/workflows/hello.yml

name: Hello World                    # Workflow name shown in GitHub UI

on:                                  # Events that trigger this workflow
  push:
    branches: [main]                 # Only trigger on push to main
  pull_request:
    branches: [main]                 # Also trigger on PRs targeting main

jobs:
  hello:                             # Job ID — can be anything
    runs-on: ubuntu-latest           # Runner OS

    steps:
      - name: Checkout code          # Step 1 — clone the repo
        uses: actions/checkout@v4

      - name: Say Hello              # Step 2 — run a shell command
        run: echo "Hello World!"

      - name: Multi-line command     # Step 3 — multiple commands
        run: |
          echo "Line 1"
          echo "Line 2"
          pwd
          ls -la
```

### Running Your First Workflow

```bash
# Create the workflows directory
mkdir -p .github/workflows

# Create your first workflow file
touch .github/workflows/hello.yml

# Commit and push — this triggers the workflow
git add .github/workflows/hello.yml
git commit -m "Add Hello World workflow"
git push origin main
```

### Triggers (Events)



### Push and Pull Request

```yaml
on:
  push:
    branches: [main, develop]        # Trigger on specific branches
    paths:                           # Only trigger if these files changed
      - 'src/**'
      - '*.json'
    tags:
      - 'v*'                         # Trigger on version tags

  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]  # PR event subtypes
```

### Schedule (Cron)

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'             # Every Monday at 9am UTC
    - cron: '0 0 * * *'             # Every day at midnight
```

### Manual Trigger (workflow_dispatch)

```yaml
on:
  workflow_dispatch:                 # Manual trigger from GitHub UI
    inputs:
      environment:
        description: 'Deploy to environment'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]
      debug:
        description: 'Enable debug mode'
        type: boolean
        default: false
```

### Other Useful Triggers

```yaml
on:
  release:
    types: [published]               # When a GitHub release is published

  issues:
    types: [opened, labeled]         # When issues are opened or labeled

  workflow_call:                     # Called by another workflow (reusable)

  repository_dispatch:               # Triggered by external HTTP call
    types: [deploy-command]
```

![CI/CD Pipeline](https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80)

### Jobs and Runners



### Runner Types

```yaml
jobs:
  linux-job:
    runs-on: ubuntu-latest           # Ubuntu (most common, free)

  windows-job:
    runs-on: windows-latest          # Windows Server

  mac-job:
    runs-on: macos-latest            # macOS (10x more expensive)

  self-hosted-job:
    runs-on: [self-hosted, linux]    # Your own machine
```

### Job Dependencies

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building..."

  test:
    runs-on: ubuntu-latest
    needs: build                     # Waits for build to complete
    steps:
      - run: echo "Testing..."

  deploy:
    runs-on: ubuntu-latest
    needs: [build, test]             # Waits for both build AND test
    steps:
      - run: echo "Deploying..."
```

### Parallel Jobs

```yaml
jobs:
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  test-e2e:                          # Runs in parallel with test-unit
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e

  lint:                              # Also runs in parallel
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint
```

### Matrix Builds

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]   # Run tests on 3 Node versions
        os: [ubuntu-latest, windows-latest]  # On 2 OSes = 6 total jobs

    steps:
      - uses: actions/checkout@v4
      - name: Setup Node ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci && npm test
```

### Environment Variables and Secrets



### Setting Variables

```yaml
env:
  APP_ENV: production                # Workflow-level variable

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: postgres://...   # Job-level variable

    steps:
      - name: Deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}   # Step-level secret
        run: |
          echo "Environment: $APP_ENV"
          ./deploy.sh
```

### GitHub Secrets

```bash
# Add secrets via GitHub UI:
# Repository → Settings → Secrets and variables → Actions → New secret

# Or via GitHub CLI:
gh secret set API_KEY --body "your-secret-value"
gh secret set DATABASE_URL --body "postgres://user:pass@host/db"

# List secrets (names only, values hidden)
gh secret list
```

### Using Secrets Safely

```yaml
steps:
  - name: Login to Docker Hub
    uses: docker/login-action@v3
    with:
      username: ${{ secrets.DOCKERHUB_USERNAME }}
      password: ${{ secrets.DOCKERHUB_TOKEN }}    # Never use password directly

  - name: Configure AWS
    uses: aws-actions/configure-aws-credentials@v4
    with:
      aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
      aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      aws-region: us-east-1
```

### Environment Protection Rules

```yaml
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production          # Requires approval from reviewers
    steps:
      - run: ./deploy-prod.sh
```

![Security and Secrets](https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80)

### Real CI Pipeline



### Node.js Full CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'               # Cache node_modules automatically

      - name: Install dependencies
        run: npm ci                  # Clean install (faster than npm install)

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: quality

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
          retention-days: 7
```

### Docker Build and Push Pipeline

```yaml
# .github/workflows/docker.yml
name: Docker Build & Push

on:
  push:
    tags: ['v*.*.*']                 # Only on version tags

jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: myorg/myapp
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha        # Use GitHub Actions cache
          cache-to: type=gha,mode=max
```

### Deployment Workflows



### Deploy to AWS EC2

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /app
            git pull origin main
            npm ci --production
            pm2 restart app
```

### Deploy to Vercel

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Deploy to Kubernetes

```yaml
name: Deploy to K8s

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG }}

      - name: Deploy
        run: |
          kubectl set image deployment/myapp \
            app=myorg/myapp:${{ github.sha }}
          kubectl rollout status deployment/myapp
```

![Deployment Pipeline](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80)

### Reusable Workflows and Actions



### Creating a Reusable Workflow

```yaml
# .github/workflows/reusable-deploy.yml
name: Reusable Deploy

on:
  workflow_call:                     # Makes this workflow reusable
    inputs:
      environment:
        required: true
        type: string
    secrets:
      deploy-key:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to ${{ inputs.environment }}"
```

### Calling a Reusable Workflow

```yaml
# .github/workflows/production.yml
name: Production Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: production
    secrets:
      deploy-key: ${{ secrets.PROD_DEPLOY_KEY }}
```

### Creating a Custom Action

```yaml
# .github/actions/notify-slack/action.yml
name: Notify Slack
description: Send deployment notification to Slack

inputs:
  webhook-url:
    required: true
  message:
    required: true
    default: 'Deployment complete'

runs:
  using: composite
  steps:
    - name: Send notification
      shell: bash
      run: |
        curl -X POST ${{ inputs.webhook-url }} \
          -H 'Content-type: application/json' \
          -d '{"text":"${{ inputs.message }}"}'
```

### Caching and Artifacts



### Dependency Caching

```yaml
steps:
  - uses: actions/cache@v4
    with:
      path: ~/.npm
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-

  # For Python
  - uses: actions/cache@v4
    with:
      path: ~/.cache/pip
      key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}

  # For Docker layers
  - uses: actions/cache@v4
    with:
      path: /tmp/.buildx-cache
      key: ${{ runner.os }}-buildx-${{ github.sha }}
```

### Passing Data Between Jobs

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.value }}   # Job output

    steps:
      - id: version
        run: echo "value=1.2.3" >> $GITHUB_OUTPUT   # Set output

      - uses: actions/upload-artifact@v4             # Upload files
        with:
          name: build-dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Get version
        run: echo "Version is ${{ needs.build.outputs.version }}"

      - uses: actions/download-artifact@v4           # Download files
        with:
          name: build-dist
          path: dist/
```

### Production Best Practices



### Security Hardening

```yaml
jobs:
  secure-job:
    runs-on: ubuntu-latest
    permissions:
      contents: read                 # Minimal permissions
      packages: write

    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false  # Don't persist GitHub token

      # Pin actions to full commit SHA (not tags)
      - uses: actions/setup-node@1a4442cacd436585916779262731d1f19167d11b
```

### Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true          # Cancel old runs when new push arrives
```

### Conditional Execution

```yaml
steps:
  - name: Deploy to prod
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    run: ./deploy.sh

  - name: Notify on failure
    if: failure()                   # Only runs if previous step failed
    run: ./notify-failure.sh

  - name: Always cleanup
    if: always()                    # Runs even if workflow fails
    run: ./cleanup.sh
```

### Self-Hosted Runners

```bash
# Setup self-hosted runner on Ubuntu
# GitHub → Settings → Actions → Runners → New self-hosted runner

mkdir actions-runner && cd actions-runner

# Download runner
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

tar xzf ./actions-runner-linux-x64.tar.gz

# Configure
./config.sh --url https://github.com/YOUR_ORG/YOUR_REPO \
  --token YOUR_TOKEN

# Install as service
sudo ./svc.sh install
sudo ./svc.sh start
```

### Monitoring and Debugging

```yaml
steps:
  - name: Debug context
    env:
      GITHUB_CONTEXT: ${{ toJson(github) }}
    run: echo "$GITHUB_CONTEXT"

  - name: Enable debug logging
    run: echo "ACTIONS_STEP_DEBUG=true" >> $GITHUB_ENV

  - name: Tmate debug session
    if: failure()
    uses: mxschmitt/action-tmate@v3  # SSH into runner on failure
```

