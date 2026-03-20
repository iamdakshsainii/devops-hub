# Terraform - The Complete Guide

A structured, in-depth reference from first principles to production-grade infrastructure-as-code practices.
Suitable for DevOps engineers, platform teams, and SREs managing cloud infrastructure at scale.

---

## 1. What is Terraform & Infrastructure as Code?

Terraform is an open-source **Infrastructure as Code (IaC)** tool created by HashiCorp in 2014.
It allows you to define, provision, and manage infrastructure across any cloud provider — AWS, GCP,
Azure, and hundreds of others — using a declarative configuration language called **HCL
(HashiCorp Configuration Language)**.

Instead of clicking through cloud consoles or writing imperative shell scripts, you describe
the **desired end state** of your infrastructure. Terraform figures out how to get there,
what to create, what to modify, and what to destroy.

![Terraform Infrastructure as Code Overview](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80)

### Why Terraform Over Other IaC Tools

| Tool | Scope | Language | Multi-Cloud | State Management |
| :--- | :--- | :--- | :--- | :--- |
| **Terraform** | Any provider | HCL / JSON | Yes — 3000+ providers | Yes — local or remote |
| **AWS CloudFormation** | AWS only | YAML / JSON | No | Managed by AWS |
| **Pulumi** | Any provider | Python, Go, TS, C# | Yes | Yes — Pulumi Cloud |
| **Ansible** | Config mgmt | YAML | Yes | No (stateless) |
| **ARM Templates** | Azure only | JSON | No | Managed by Azure |

Terraform's core advantages:

- **Declarative** — describe what you want, not how to build it
- **Idempotent** — running `terraform apply` twice produces the same result
- **Multi-provider** — manage AWS + GCP + Cloudflare + Datadog in a single codebase
- **State-driven** — tracks real infrastructure in a state file to plan incremental changes
- **Open ecosystem** — 3000+ providers and the Terraform Registry for reusable modules

### Terraform vs Pulumi vs CloudFormation

Terraform dominates for multi-cloud and open-source flexibility. CloudFormation is tightly
integrated with AWS services (StackSets, Service Catalog) and preferred when you're
AWS-only. Pulumi appeals to teams who want real programming languages instead of HCL.

---

## 2. Core Concepts & Architecture

### How Terraform Works

Terraform operates through a three-phase workflow that transforms your configuration
files into real infrastructure.

![Terraform Core Workflow](https://developer.hashicorp.com/terraform/img/docs/intro-terraform-workflow.png)

The three phases are:

- **Write** — Author `.tf` files describing resources using HCL
- **Plan** — Terraform reads state + config, diffs them, and shows an execution plan
- **Apply** — Terraform executes the plan against the provider APIs to reach desired state

### Providers

A **Provider** is a plugin that translates Terraform resource definitions into API calls
for a specific platform. Each provider is maintained separately and versioned independently.

```hcl
# Configure the AWS provider — always pin to a specific version in production
terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"          # Allow 5.x but not 6.x
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# AWS provider configuration
provider "aws" {
  region = "us-east-1"

  # Tag every resource created by this provider automatically
  default_tags {
    tags = {
      ManagedBy   = "Terraform"
      Environment = var.environment
      Project     = var.project_name
    }
  }
}

# Multi-region provider alias
provider "aws" {
  alias  = "eu"
  region = "eu-west-1"
}
```

### State File

The **state file** (`terraform.tfstate`) is Terraform's source of truth — it maps your
configuration to real-world resources. Terraform diffs the desired state (`.tf` files)
against the current state (`.tfstate`) to produce a minimal, correct execution plan.

```bash
# View current state
terraform state list

# Show details of a specific resource in state
terraform state show aws_instance.web

# Move a resource in state (rename without destroying)
terraform state mv aws_instance.old aws_instance.new

# Remove a resource from state without destroying it
terraform state rm aws_s3_bucket.legacy

# Pull remote state to local file for inspection
terraform state pull > state-backup.json
```

**Critical state rules:**
- Never edit `.tfstate` manually — use `terraform state` commands
- Always use remote state in teams — never commit `.tfstate` to git
- Enable state locking to prevent concurrent modifications

### Resources, Data Sources & Locals

```hcl
# RESOURCE — creates and manages real infrastructure
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "main-vpc"
  }
}

# DATA SOURCE — reads existing infrastructure (read-only, does not create)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]   # Canonical's AWS account ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# LOCAL — computed values used within the module
locals {
  name_prefix  = "${var.project_name}-${var.environment}"
  common_tags  = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
  # Derive subnet count from the CIDR
  subnet_count = length(var.availability_zones)
}
```

---

## 3. HCL Syntax & Configuration Language

### Variables, Outputs & Types

![Terraform HCL Configuration](https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80)

Variables make configurations reusable and environment-agnostic.

```hcl
# ── Input Variables ──────────────────────────────────────────────────────────

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "instance_count" {
  description = "Number of EC2 instances to create"
  type        = number
  default     = 2
}

variable "enable_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = false
}

variable "allowed_cidr_blocks" {
  description = "List of CIDR blocks allowed to reach the load balancer"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "instance_config" {
  description = "EC2 instance configuration object"
  type = object({
    instance_type = string
    disk_size_gb  = number
    spot          = bool
  })
  default = {
    instance_type = "t3.micro"
    disk_size_gb  = 20
    spot          = false
  }
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
```

```hcl
# ── Output Values ────────────────────────────────────────────────────────────

output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.main.id
}

output "load_balancer_dns" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "db_connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://${aws_db_instance.main.username}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
  sensitive   = true    # Prevents value from appearing in plan/apply output
}

output "instance_ips" {
  description = "Private IPs of all EC2 instances"
  value       = aws_instance.web[*].private_ip
}
```

### Variable Files & Precedence

```hcl
# terraform.tfvars — auto-loaded, never commit secrets here
environment    = "prod"
instance_count = 4

# prod.tfvars — environment-specific, pass with -var-file flag
instance_config = {
  instance_type = "t3.large"
  disk_size_gb  = 100
  spot          = false
}
```

```bash
# Variable precedence (highest to lowest):
# 1. CLI flags:          -var="environment=prod"
# 2. .tfvars files:      -var-file="prod.tfvars"
# 3. *.auto.tfvars:      auto-loaded alphabetically
# 4. terraform.tfvars:   auto-loaded
# 5. Environment vars:   TF_VAR_environment=prod
# 6. Default values:     defined in variable block

# Apply with specific var file
terraform apply -var-file="environments/prod.tfvars"

# Pass sensitive values via environment variables (best practice for CI)
export TF_VAR_db_password="super_secret"
terraform apply
```

### Expressions, Functions & Loops

```hcl
# ── For Expressions ──────────────────────────────────────────────────────────

# Transform a list
locals {
  upper_envs    = [for env in var.environments : upper(env)]
  filtered_azs  = [for az in data.aws_availability_zones.available.names : az if az != "us-east-1e"]
  instance_map  = { for idx, id in aws_instance.web[*].id : "instance-${idx}" => id }
}

# ── Count & For_each ─────────────────────────────────────────────────────────

# count — simple numeric iteration
resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_config.instance_type

  tags = {
    Name = "${local.name_prefix}-web-${count.index + 1}"
  }
}

# for_each — iterate over a map or set (preferred over count for most cases)
resource "aws_subnet" "private" {
  for_each = { for idx, az in var.availability_zones : az => {
    az   = az
    cidr = cidrsubnet(var.vpc_cidr, 8, idx + 10)
  }}

  vpc_id            = aws_vpc.main.id
  availability_zone = each.key
  cidr_block        = each.value.cidr

  tags = {
    Name = "${local.name_prefix}-private-${each.key}"
    Tier = "private"
  }
}

# ── Built-in Functions ────────────────────────────────────────────────────────

locals {
  # String functions
  name_lower    = lower(var.project_name)
  trimmed       = trimspace("  hello  ")
  formatted     = format("%-10s %5d", "item", 42)

  # Collection functions
  merged_tags   = merge(local.common_tags, var.tags)
  unique_azs    = toset(var.availability_zones)
  flattened     = flatten([["a","b"],["c","d"]])

  # Numeric functions
  clamped       = clamp(var.instance_count, 1, 10)

  # CIDR functions
  subnet_cidrs  = [for i in range(4) : cidrsubnet("10.0.0.0/16", 8, i)]

  # Encoding
  user_data_b64 = base64encode(templatefile("${path.module}/user-data.sh", {
    environment = var.environment
    app_port    = 3000
  }))
}
```

---

## 4. Remote State & Backends

Managing state remotely is non-negotiable for team environments. Local state causes
conflicts, data loss, and has no locking mechanism.

![Terraform Remote State Architecture](https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80)

### S3 Backend with DynamoDB Locking

The most common production setup for AWS: state stored in S3, locking via DynamoDB.

```hcl
# backend.tf — configure before running terraform init
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "prod/us-east-1/app/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true                    # Encrypt state at rest
    dynamodb_table = "terraform-state-lock"  # DynamoDB table for locking

    # Optional: use IAM role for cross-account state
    # role_arn = "arn:aws:iam::123456789:role/TerraformStateRole"
  }
}
```

```hcl
# Create the S3 bucket and DynamoDB table for state (bootstrap — run once)
resource "aws_s3_bucket" "terraform_state" {
  bucket = "mycompany-terraform-state"

  lifecycle {
    prevent_destroy = true   # Prevent accidental deletion of state bucket
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"       # Versioning enables state history and rollback
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
```

### Terraform Cloud / HCP Terraform Backend

```hcl
terraform {
  cloud {
    organization = "mycompany"

    workspaces {
      name = "prod-us-east-1"
    }
  }
}
```

### Workspaces for Environment Separation

```bash
# Create workspaces per environment
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch workspace
terraform workspace select prod

# List workspaces
terraform workspace list

# Reference current workspace in config
resource "aws_instance" "web" {
  instance_type = terraform.workspace == "prod" ? "t3.large" : "t3.micro"
}
```

### Remote State Data Source

Read outputs from another Terraform state — essential for linking modules across teams.

```hcl
# Read outputs from the networking team's state
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "mycompany-terraform-state"
    key    = "prod/us-east-1/network/terraform.tfstate"
    region = "us-east-1"
  }
}

# Use the VPC ID from the networking state
resource "aws_subnet" "app" {
  vpc_id     = data.terraform_remote_state.network.outputs.vpc_id
  cidr_block = "10.0.10.0/24"
}
```

---

## 5. Modules — Reusable Infrastructure Components

Modules are the primary mechanism for code reuse in Terraform. A module is any
directory containing `.tf` files. Every Terraform configuration is technically a module
(the root module).

![Terraform Modules Architecture](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80)

### Module Structure

```bash
# Recommended module directory structure
modules/
  vpc/
    main.tf          # Core resources
    variables.tf     # Input variables
    outputs.tf       # Output values
    versions.tf      # Provider + Terraform version constraints
    README.md        # Module documentation
  ec2-cluster/
    main.tf
    variables.tf
    outputs.tf
    versions.tf
    templates/
      user-data.sh   # Template files
  rds/
    main.tf
    variables.tf
    outputs.tf
```

### Writing a Reusable VPC Module

```hcl
# modules/vpc/variables.tf
variable "name" {
  description = "Name prefix for all VPC resources"
  type        = string
}

variable "cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of AZs to create subnets in"
  type        = list(string)
}

variable "enable_nat_gateway" {
  description = "Create NAT gateways for private subnet internet access"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use a single NAT gateway instead of one per AZ (cost saving for non-prod)"
  type        = bool
  default     = false
}
```

```hcl
# modules/vpc/main.tf
resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = var.name }
}

resource "aws_subnet" "public" {
  for_each = { for idx, az in var.availability_zones : az => cidrsubnet(var.cidr_block, 8, idx) }

  vpc_id                  = aws_vpc.this.id
  cidr_block              = each.value
  availability_zone       = each.key
  map_public_ip_on_launch = true
  tags = { Name = "${var.name}-public-${each.key}", Tier = "public" }
}

resource "aws_subnet" "private" {
  for_each = { for idx, az in var.availability_zones : az => cidrsubnet(var.cidr_block, 8, idx + 10) }

  vpc_id            = aws_vpc.this.id
  cidr_block        = each.value
  availability_zone = each.key
  tags = { Name = "${var.name}-private-${each.key}", Tier = "private" }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.name}-igw" }
}

resource "aws_eip" "nat" {
  for_each = var.enable_nat_gateway ? (
    var.single_nat_gateway ? { "single" = var.availability_zones[0] } :
    { for az in var.availability_zones : az => az }
  ) : {}

  domain = "vpc"
  tags   = { Name = "${var.name}-nat-eip-${each.key}" }
}

resource "aws_nat_gateway" "this" {
  for_each = aws_eip.nat

  allocation_id = each.value.id
  subnet_id     = aws_subnet.public[each.key].id
  tags          = { Name = "${var.name}-nat-${each.key}" }
}
```

```hcl
# modules/vpc/outputs.tf
output "vpc_id"             { value = aws_vpc.this.id }
output "public_subnet_ids"  { value = [for s in aws_subnet.public : s.id] }
output "private_subnet_ids" { value = [for s in aws_subnet.private : s.id] }
output "nat_gateway_ids"    { value = [for n in aws_nat_gateway.this : n.id] }
```

### Consuming Modules

```hcl
# root main.tf — call the vpc module
module "vpc" {
  source = "./modules/vpc"         # Local module path

  name               = "${local.name_prefix}-vpc"
  cidr_block         = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  enable_nat_gateway = true
  single_nat_gateway = var.environment != "prod"   # Save cost in non-prod
}

# Call a public registry module
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${local.name_prefix}-eks"
  cluster_version = "1.30"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
}

# Reference module outputs
resource "aws_security_group" "app" {
  vpc_id = module.vpc.vpc_id    # Use output from the vpc module
}
```

```bash
# Install / update module sources
terraform init

# Upgrade module versions
terraform init -upgrade

# Get modules without full init
terraform get
```

---

## 6. Terraform CLI Workflow & Commands

### Core Workflow Commands

```bash
# ── terraform init ────────────────────────────────────────────────────────────
# Downloads providers, initializes backend, installs modules
# Run this first, and after any provider/backend/module changes
terraform init

# Init with backend config passed inline (useful in CI)
terraform init \
  -backend-config="bucket=mycompany-terraform-state" \
  -backend-config="key=prod/app/terraform.tfstate" \
  -backend-config="region=us-east-1"

# Migrate state to a new backend
terraform init -migrate-state

# Reconfigure backend without migrating
terraform init -reconfigure


# ── terraform plan ────────────────────────────────────────────────────────────
# Preview what Terraform will create, modify, or destroy
terraform plan

# Save the plan to a file (pass to apply for exact execution)
terraform plan -out=tfplan

# Plan for a specific target resource only
terraform plan -target=aws_instance.web

# Plan with variable overrides
terraform plan -var="environment=prod" -var-file="prod.tfvars"

# Destroy plan — preview what will be destroyed
terraform plan -destroy


# ── terraform apply ───────────────────────────────────────────────────────────
# Execute the plan — creates, updates, or destroys resources
terraform apply

# Apply a saved plan file (no confirmation prompt — use in CI/CD)
terraform apply tfplan

# Auto-approve without interactive prompt
terraform apply -auto-approve

# Apply only specific resources
terraform apply -target=module.vpc -target=aws_security_group.app


# ── terraform destroy ─────────────────────────────────────────────────────────
# Destroy all resources managed by this configuration
terraform destroy

# Destroy specific resources only
terraform destroy -target=aws_instance.web

# Auto-approve destroy (use with extreme caution in production)
terraform destroy -auto-approve
```

### Inspection & Debugging Commands

```bash
# Show current state in human-readable format
terraform show

# Show a specific plan file
terraform show tfplan

# Validate configuration syntax and internal consistency
terraform validate

# Format all .tf files to canonical style
terraform fmt

# Format and check (exit non-zero if changes needed — use in CI)
terraform fmt -check -recursive

# List all resources in state
terraform state list

# Show detailed state for a resource
terraform state show module.vpc.aws_vpc.this

# Get output values
terraform output
terraform output vpc_id
terraform output -json   # All outputs as JSON

# Refresh state against real infrastructure (reconcile drift)
terraform apply -refresh-only

# Taint a resource — force replacement on next apply
terraform taint aws_instance.web[0]

# Untaint — cancel a taint
terraform untaint aws_instance.web[0]

# Force-unlock a stuck state lock
terraform force-unlock LOCK_ID

# Enable detailed debug logging
TF_LOG=DEBUG terraform apply
TF_LOG_PATH=./terraform-debug.log terraform apply
```

### Import Existing Infrastructure

```bash
# Import an existing resource into state (old syntax)
terraform import aws_s3_bucket.my_bucket my-existing-bucket-name

# Import with resource address for modules
terraform import module.vpc.aws_vpc.this vpc-0abc123def456

# Generate config for imported resource (Terraform 1.5+)
terraform plan -generate-config-out=generated.tf
```

---

## 7. Production Patterns & Enterprise Best Practices

### Repository & File Structure

```bash
# Recommended monorepo structure for a production Terraform codebase
infrastructure/
  modules/                          # Reusable modules (internal)
    vpc/
    eks/
    rds/
    alb/
  environments/
    dev/
      us-east-1/
        network/
          main.tf
          terraform.tfvars
          backend.tf
        app/
          main.tf
          terraform.tfvars
    staging/
      us-east-1/
        network/
        app/
    prod/
      us-east-1/
        network/
        app/
      eu-west-1/
        network/
        app/
  .terraform-version               # Pin Terraform version (used by tfenv)
  .tflint.hcl                      # TFLint configuration
  .pre-commit-config.yaml          # Pre-commit hooks
```

![Terraform Production Infrastructure](https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80)

### Lifecycle Rules & Resource Protection

```hcl
resource "aws_db_instance" "main" {
  identifier        = "${local.name_prefix}-postgres"
  engine            = "postgres"
  engine_version    = "16.1"
  instance_class    = "db.t3.medium"
  allocated_storage = 100

  lifecycle {
    # Prevent Terraform from destroying this resource under any circumstance
    prevent_destroy = true

    # Ignore changes to these attributes (managed externally or auto-updated)
    ignore_changes = [
      engine_version,       # Allow minor version upgrades without Terraform diff
      snapshot_identifier,  # Set during restore, not tracked after
    ]

    # Create the replacement before destroying the old one (zero-downtime updates)
    create_before_destroy = true

    # Custom precondition — fail early if configuration is invalid
    precondition {
      condition     = var.environment == "prod" ? var.instance_class != "db.t3.micro" : true
      error_message = "Production databases must not use db.t3.micro."
    }
  }
}
```

### Dependency Management

```hcl
# Explicit dependency — use when Terraform can't automatically detect the dependency
resource "aws_iam_role_policy_attachment" "app" {
  role       = aws_iam_role.app.name
  policy_arn = aws_iam_policy.app.arn

  depends_on = [
    aws_iam_role.app,
    aws_iam_policy.app,
  ]
}

# Null resource for dependencies on non-Terraform operations
resource "null_resource" "db_migration" {
  triggers = {
    # Re-run when the app image changes
    image_tag = var.app_image_tag
  }

  provisioner "local-exec" {
    command = "kubectl exec -it deploy/api -- npm run migrate"
  }

  depends_on = [module.eks, module.rds]
}
```

### Dynamic Blocks

```hcl
# Generate repeated nested blocks dynamically
resource "aws_security_group" "app" {
  name   = "${local.name_prefix}-app-sg"
  vpc_id = module.vpc.vpc_id

  # Dynamic ingress rules from a variable
  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.from_port
      to_port     = ingress.value.to_port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
      description = ingress.value.description
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ingress_rules variable definition
variable "ingress_rules" {
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
    description = string
  }))
  default = [
    { from_port = 80,  to_port = 80,  protocol = "tcp", cidr_blocks = ["0.0.0.0/0"], description = "HTTP" },
    { from_port = 443, to_port = 443, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"], description = "HTTPS" },
    { from_port = 22,  to_port = 22,  protocol = "tcp", cidr_blocks = ["10.0.0.0/8"], description = "SSH from VPN" },
  ]
}
```

---

## 8. CI/CD Integration & Automation

Terraform in CI/CD pipelines requires careful handling of secrets, state locking,
and plan approval gates for production changes.

![Terraform CI/CD Pipeline](https://images.unsplash.com/photo-1537884944318-390069bb8665?auto=format&fit=crop&w=1200&q=80)

### GitHub Actions Pipeline

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  push:
    branches: [main]
    paths: ['infrastructure/**']
  pull_request:
    branches: [main]
    paths: ['infrastructure/**']

env:
  TF_VERSION: "1.7.5"
  AWS_REGION: "us-east-1"
  WORKING_DIR: "infrastructure/environments/prod/us-east-1/app"

permissions:
  id-token: write      # Required for OIDC AWS authentication
  contents: read
  pull-requests: write # Required to post plan comments

jobs:
  terraform:
    name: Terraform Plan & Apply
    runs-on: ubuntu-latest
    environment: production

    defaults:
      run:
        working-directory: ${{ env.WORKING_DIR }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
          aws-region: ${{ env.AWS_REGION }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Format Check
        run: terraform fmt -check -recursive
        continue-on-error: true

      - name: Terraform Init
        run: terraform init

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        id: plan
        run: terraform plan -out=tfplan -no-color
        continue-on-error: true

      - name: Post Plan to PR
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          script: |
            const output = `#### Terraform Plan 📋
            \`\`\`
            ${{ steps.plan.outputs.stdout }}
            \`\`\``;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            });

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve tfplan
```

### Atlantis — Pull Request Automation

Atlantis is the gold standard for Terraform PR automation — it runs `plan` on every PR
and `apply` on merge, with full audit trail.

```yaml
# atlantis.yaml — repository config for Atlantis
version: 3
automerge: false
delete_source_branch_on_merge: true

projects:
  - name: prod-network
    dir: infrastructure/environments/prod/us-east-1/network
    workspace: default
    autoplan:
      when_modified: ["**/*.tf", "**/*.tfvars", "../../modules/vpc/**"]
      enabled: true
    apply_requirements:
      - approved        # Requires at least 1 PR approval
      - mergeable       # PR must be mergeable (no conflicts)

  - name: prod-app
    dir: infrastructure/environments/prod/us-east-1/app
    workspace: default
    autoplan:
      when_modified: ["**/*.tf", "**/*.tfvars"]
      enabled: true
    apply_requirements:
      - approved
      - mergeable
```

### Pre-commit Hooks for Quality Gates

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.88.0
    hooks:
      - id: terraform_fmt          # Auto-format all .tf files
      - id: terraform_validate     # Validate configuration
      - id: terraform_docs         # Auto-generate README from module variables
        args:
          - --hook-config=--path-to-file=README.md
          - --hook-config=--add-to-existing-file=true
      - id: terraform_tflint       # Lint for common mistakes
      - id: terraform_trivy        # Security scanning
        args:
          - --args=--severity=HIGH,CRITICAL
```

---

## 9. Security, Secrets & Policy as Code

### Managing Secrets Safely

Never put secrets in `.tf` files or `.tfvars`. Use dedicated secret management.

```hcl
# Pull secrets from AWS Secrets Manager at plan/apply time
data "aws_secretsmanager_secret_version" "db_creds" {
  secret_id = "prod/app/db-credentials"
}

locals {
  db_creds = jsondecode(data.aws_secretsmanager_secret_version.db_creds.secret_string)
}

resource "aws_db_instance" "main" {
  username = local.db_creds.username
  password = local.db_creds.password
  # Password is sensitive — will be redacted in plan output
}

# Pull from HashiCorp Vault
data "vault_generic_secret" "app_secrets" {
  path = "secret/prod/app"
}

resource "aws_ssm_parameter" "api_key" {
  name  = "/prod/app/api-key"
  type  = "SecureString"
  value = data.vault_generic_secret.app_secrets.data["api_key"]
}
```

### OPA / Sentinel Policy as Code

```hcl
# sentinel.hcl — Terraform Cloud policy enforcement
policy "restrict-instance-types" {
  source            = "./policies/restrict-instance-types.sentinel"
  enforcement_level = "hard-mandatory"    # Block apply if policy fails
}

policy "require-tags" {
  source            = "./policies/require-tags.sentinel"
  enforcement_level = "soft-mandatory"    # Warn but allow override with justification
}
```

```python
# policies/restrict-instance-types.sentinel
import "tfplan/v2" as tfplan

# Allowed EC2 instance types in production
allowed_types = ["t3.medium", "t3.large", "m5.large", "m5.xlarge", "c5.large"]

# Find all EC2 instance resources
ec2_instances = filter tfplan.resource_changes as _, rc {
  rc.type is "aws_instance" and rc.mode is "managed"
}

# Enforce — fail if any instance uses a non-allowed type
main = rule {
  all ec2_instances as _, instance {
    instance.change.after.instance_type in allowed_types
  }
}
```

### TFSec & Trivy Security Scanning

```bash
# Scan Terraform code for security misconfigurations with Trivy
trivy config .

# Scan with specific severity filter
trivy config --severity HIGH,CRITICAL .

# Output as SARIF for GitHub Security tab
trivy config --format sarif --output trivy-results.sarif .

# tfsec — dedicated Terraform security scanner
tfsec .

# tfsec with custom checks
tfsec --custom-check-dir ./security-checks .
```

---

## 10. Advanced Patterns & Performance

### Terragrunt for DRY Infrastructure

Terragrunt wraps Terraform and eliminates the need to repeat backend config,
provider config, and common variables across dozens of directories.

```hcl
# terragrunt.hcl — root configuration (inherited by all child modules)
locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  region_vars  = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  env_vars     = read_terragrunt_config(find_in_parent_folders("env.hcl"))

  account_id  = local.account_vars.locals.account_id
  aws_region  = local.region_vars.locals.aws_region
  environment = local.env_vars.locals.environment
}

# Auto-generate backend config for every module
remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket         = "mycompany-${local.account_id}-terraform-state"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = local.aws_region
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

# Auto-generate provider config
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
  region = "${local.aws_region}"
  default_tags {
    tags = {
      Environment = "${local.environment}"
      ManagedBy   = "Terragrunt"
    }
  }
}
EOF
}
```

```bash
# Run across all modules in parallel
terragrunt run-all plan
terragrunt run-all apply

# Apply only modules that changed (based on git diff)
terragrunt run-all apply --terragrunt-ignore-dependency-errors

# Destroy all modules in reverse dependency order
terragrunt run-all destroy
```

### Performance Optimization

```bash
# Parallelize resource creation (default is 10)
terraform apply -parallelism=20

# Refresh only specific resources during apply
terraform apply -refresh=false    # Skip refresh — faster for large states

# Use partial configuration to split large state files
# Separate state per layer: network / compute / data / app

# Target specific modules for faster iteration
terraform apply -target=module.app -target=module.alb
```

### Drift Detection & Reconciliation

```bash
# Detect drift — check if real infrastructure matches state
terraform plan -refresh-only

# Apply drift corrections without making config changes
terraform apply -refresh-only -auto-approve

# Use AWS Config or Terraform Cloud for continuous drift detection
# in production environments
```

### Key Production Checklist

| Practice | Why |
| :--- | :--- |
| Pin provider versions with `~>` | Prevents surprise breaking changes |
| Remote state with locking | Prevents concurrent modification corruption |
| `prevent_destroy = true` on databases | Prevents catastrophic accidental deletes |
| `sensitive = true` on secret outputs | Prevents secrets leaking in CI logs |
| Separate state per environment | Blast radius isolation — prod changes can't affect dev |
| Use OIDC for CI authentication | No long-lived AWS access keys in CI secrets |
| Run `terraform validate` + `fmt` in CI | Catch syntax errors before plan |
| Require plan approval for prod | Human review of all production changes |
| Tag every resource | Cost attribution, compliance, resource discovery |
| Module versioning with git tags | Reproducible, auditable infrastructure changes |

---

*End of Terraform - The Complete Guide*