# Terraform

Terraform is an open-source Infrastructure as Code (IaC) tool by HashiCorp. Instead of manually clicking through the AWS console to create resources, you write code that describes what you want - Terraform creates it for you.

## Introduction

## 05. Provider Block

A **provider** is a plugin that lets Terraform talk to a specific platform. Every `.tf` config needs at least one provider.

```hcl
provider "aws" {
  region = "us-east-1"
}
```

In production, always pin provider versions to avoid surprise breaking changes:

```hcl
terraform {
  required_version = ">= 1.7.0"   # Minimum Terraform version

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"          # Allow 5.x but not 6.x
    }
  }
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      ManagedBy   = "Terraform"
      Environment = var.environment
    }
  }
}
```

Run `terraform init` after adding or changing providers — it downloads the required plugins.

---

A **resource** is the thing you want to create — an EC2 instance, S3 bucket, VPC, security group, etc.

```hcl
resource "aws_instance" "myserver" {   # resource "TYPE" "NAME"
  ami           = "ami-0c83cb1c664994bbd"
  instance_type = "t3.micro"

  tags = {
    Name = "SampleServer"
  }
}
```

#### How Terraform Decides What to Do

Terraform compares your `.tf` files against the state file and decides what action to take:

**Scenario 1 — Change AMI:**
```hcl
ami = "ami-OLD123"
ami = "ami-NEW456"
```
Result: `-/+ replace` — destroys old instance, creates new one. AMI is immutable, can't update in-place.

**Scenario 2 — Change instance type:**
```hcl
instance_type = "t3.large"   # was t3.micro
```
Result: `-/+ replace` — requires stop/start, Terraform rebuilds for safety.

**Scenario 3 — Change tags only:**
```hcl
tags = { Name = "UpdatedName" }
```
Result: `~ update` — tags can be modified without recreating the instance.

---

Variables make your configuration reusable and environment-agnostic. Instead of hardcoding values, you define variables and fill them in separately for each environment.

#### Variable Types

```hcl
variable "ami_id" {
  type    = string
  default = "ami-12345"
}

variable "port" {
  type    = number
  default = 80
}

variable "enable_monitoring" {
  type    = bool
  default = false
}

variable "zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b"]
}

variable "tags" {
  type = map(string)
  default = {
    Environment = "dev"
  }
}
```

#### Three Ways to Use Variables

**Option 1 — All in one file (quick and dirty):**
```hcl
variable "region" {
  type    = string
  default = "us-east-1"
}

provider "aws" {
  region = var.region    # Access with var.variable_name
}
```

**Option 2 — Two files (variables.tf + main.tf):**

`variables.tf`
```hcl
variable "region" {
  type    = string
  default = "us-east-1"
}
```

`main.tf`
```hcl
provider "aws" {
  region = var.region
}
```

**Option 3 — Three files (best practice for real projects):**

`variables.tf` — structure only, no default values
```hcl
variable "region" {
  type = string
}

variable "instance_type" {
  type = string
}
```

`terraform.tfvars` — actual values
```hcl
region        = "eu-north-1"
instance_type = "t3.small"
```

`main.tf` — uses variables
```hcl
provider "aws" {
  region = var.region
}

resource "aws_instance" "web" {
  instance_type = var.instance_type
  ami           = "ami-12345"
}
```

Option 3 is best because values are completely separated from code. You can create `dev.tfvars` and `prod.tfvars` and switch with one flag.

#### Multi-Environment Setup

```hcl
region        = "us-east-1"
instance_type = "t3.micro"
server_count  = 1

region        = "eu-west-1"
instance_type = "t3.large"
server_count  = 10
```

```bash
terraform apply -var-file="dev.tfvars"    # Deploy dev
terraform apply -var-file="prod.tfvars"   # Deploy prod
```

#### Object Variable — Group Related Values

Instead of separate variables for every related value, group them into one object:

```hcl
variable "ec2_config" {
  type = object({
    v_size = number
    v_type = string
  })
  default = {
    v_size = 20
    v_type = "gp2"
  }
}

volume_size = var.ec2_config.v_size
volume_type = var.ec2_config.v_type
```

#### Variable Priority (High to Low)

```
1. -var flag              → terraform apply -var="region=eu-north-1"   (highest)
2. -var-file flag         → terraform apply -var-file="prod.tfvars"
3. *.auto.tfvars          → automatically loaded
4. terraform.tfvars       → automatically loaded
5. Environment variable   → export TF_VAR_region=us-east-1
6. Default in variable block                                            (lowest)
```

More specific = higher priority. Command line always wins.

#### auto.tfvars — No Flag Needed

Any file ending in `.auto.tfvars` is loaded automatically without passing a flag:

```bash
terraform apply -var-file="prod.tfvars"   # Normal — must pass flag
terraform apply                           # auto.tfvars — loaded automatically
```

Useful in CI/CD where you just want `terraform apply` to pick up the right values without extra flags.

---

Outputs let you see important values after `terraform apply` runs — like the public IP of your new server or the endpoint of a database.

```hcl
output "output_name" {
  value       = resource.name.attribute
  description = "What this output shows"
  sensitive   = false   # Set true to hide in console output
}
```

#### Common Output Examples

```hcl
output "server_public_ip" {
  value       = aws_instance.myserver.public_ip
  description = "Public IP address of the server"
}

output "instance_id" {
  value = aws_instance.web.id
}

output "private_ip" {
  value = aws_instance.web.private_ip
}

output "db_password" {
  value     = aws_db_instance.database.password
  sensitive = true   # Shows as <sensitive> in terminal, hides from logs
}

output "db_endpoint" {
  value = aws_db_instance.database.endpoint
}
```

After `terraform apply`:
```
Outputs:

server_public_ip = "54.123.45.67"
instance_id      = "i-0123456789abcdef"
db_endpoint      = "mydb.abcd1234.us-east-1.rds.amazonaws.com:3306"
db_password      = <sensitive>
```

```bash
terraform output                   # Show all outputs
terraform output server_public_ip  # Show specific output
terraform output db_password        # Show sensitive output value
terraform output -json             # All outputs as JSON
```

Common attributes to output: `public_ip`, `private_ip`, `id`, `arn`, `dns_name`, `endpoint`

---

## 09. Locals

**Problem** — You use the same value like a server name or environment tag in 10 different places in your config. To change it you have to find and update every single one.

**Solution** — Define it once in `locals`, reference it everywhere. Change in one place, updates everywhere.

```hcl
locals {
  owner = "ABC"
  name  = "MySERVER"
  env   = "production"
}

resource "aws_instance" "web" {
  tags = { Name = local.name, Owner = local.owner }
}

resource "aws_s3_bucket" "data" {
  tags = { Name = local.name }   # same local, stays in sync
}
```

**locals vs variable:**

| | variable | local |
| :--- | :--- | :--- |
| Changed from outside? | Yes (tfvars, -var flag) | No — fixed in code |
| Syntax to use | `var.name` | `local.name` |
| Purpose | Input from user/environment | Internal reuse within module |

---

## 10. Data Sources

A **data source** reads existing infrastructure — it does not create anything. Use it to fetch information about resources that already exist outside your current Terraform config.

```hcl
data "aws_vpc" "existing" {
  id = "vpc-0abc123def456"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]   # Canonical's AWS account ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

data "aws_subnet" "private" {
  filter {
    name   = "tag:Name"
    values = ["my-private-subnet"]
  }
}

resource "aws_instance" "app" {
  ami           = data.aws_ami.ubuntu.id       # Uses fetched AMI
  instance_type = "t3.micro"
  subnet_id     = data.aws_subnet.private.id   # Uses existing subnet
  vpc_id        = data.aws_vpc.existing.id
}
```

**When to use data sources:**
- Create an EC2 in an existing VPC (not created by this Terraform)
- Use an existing security group from another team's config
- Always get the latest AMI without hardcoding it

---

## 11. String Interpolation

String interpolation lets you embed variables or expressions inside strings using `${}`.

```hcl
variable "environment" {
  default = "prod"
}

locals {
  name = "myapp"
}

resource "aws_instance" "web" {
  tags = {
    Name = "${local.name}-${var.environment}"   # "myapp-prod"
  }
}

resource "aws_s3_bucket" "logs" {
  bucket = "${var.project_name}-${var.environment}-logs"
}

resource "aws_instance" "web" {
  user_data = <<-EOF
    #!/bin/bash
    echo "Environment: ${var.environment}"
    echo "App: ${local.name}"
  EOF
}
```

---

#### Conditional Expression

```hcl
instance_type = var.environment == "prod" ? "t3.large" : "t3.micro"

single_nat_gateway = var.environment != "prod" ? true : false
```

#### For Expressions

```hcl
locals {
  upper_envs = [for env in var.environments : upper(env)]

  prod_azs = [for az in var.azs : az if az != "us-east-1e"]

  instance_map = { for idx, id in aws_instance.web[*].id : "instance-${idx}" => id }
}
```

#### Built-in Functions

```hcl
lower("HELLO")              # "hello"
upper("hello")              # "HELLO"
trimspace("  hello  ")      # "hello"
join("-", ["a", "b", "c"])  # "a-b-c"
split("-", "a-b-c")         # ["a", "b", "c"]
startswith("hello", "he")   # true

length(var.list)             # Count items in a list
merge(map1, map2)            # Combine two maps into one
contains(var.list, "val")    # Check if list contains a value
flatten([["a","b"],["c"]])   # ["a","b","c"] — flatten list of lists
toset(var.list)              # Remove duplicates, convert to set
tolist(var.set)              # Convert set to list

max(5, 12, 9)               # 12
min(5, 12, 9)               # 5
abs(-5)                     # 5

cidrsubnet("10.0.0.0/16", 8, 1)   # "10.0.1.0/24"
```

#### merge() — Combine Tags from Multiple Sources

**Problem** — Base tags are the same everywhere but each environment needs its own custom tags. Hardcoding them means duplicating the whole tag block per environment.

**Solution** — Use `merge()` to combine base tags with environment-specific tags.

```hcl
variable "additional_tags" {
  type    = map(string)
  default = {}
}

locals {
  name  = "MySERVER"
  owner = "ABC"
}

resource "aws_instance" "web" {
  tags = merge(
    var.additional_tags,   # Custom tags from .tfvars — different per environment
    {
      Name  = local.name   # Base tags — always the same
      Owner = local.owner
    }
  )
}
```

`terraform.tfvars` for QA:
```hcl
additional_tags = {
  DEPT    = "QA"
  PROJECT = "MYPROJECT_QA"
}
```

`terraform.tfvars` for DEV:
```hcl
additional_tags = {
  DEPT    = "DEV"
  PROJECT = "MYPROJECT_DEV"
}
```

Result — same code, each environment gets correct tags automatically.

---

#### count — Simple Numeric Repetition

```hcl
resource "aws_instance" "web" {
  count         = 3
  ami           = "ami-12345"
  instance_type = "t3.micro"

  tags = {
    Name = "web-${count.index + 1}"   # web-1, web-2, web-3
  }
}

aws_instance.web[0].id   # First instance
aws_instance.web[*].id   # All instance IDs as a list
```

#### for_each — Iterate Over a Map or Set

`for_each` is preferred over `count` for most cases because resources have meaningful keys instead of indexes.

```hcl
resource "aws_subnet" "private" {
  for_each = {
    "us-east-1a" = "10.0.1.0/24"
    "us-east-1b" = "10.0.2.0/24"
    "us-east-1c" = "10.0.3.0/24"
  }

  vpc_id            = aws_vpc.main.id
  availability_zone = each.key    # "us-east-1a", "us-east-1b", etc.
  cidr_block        = each.value  # "10.0.1.0/24", etc.

  tags = {
    Name = "private-${each.key}"
  }
}

aws_subnet.private["us-east-1a"].id
```

**count vs for_each:**

| | count | for_each |
| :--- | :--- | :--- |
| Iterate over | Numbers | Maps or sets |
| Reference | `count.index` | `each.key` / `each.value` |
| When to use | Simple identical copies | Resources with different configs |
| Removing middle item | Shifts indexes — dangerous | Removes only that item — safe |

---

**Problem** — Someone passes `t3.xlarge` or a disk size of 5GB that would cause issues. You only find out after Terraform tries to create it and fails.

**Solution** — Add validation blocks to catch invalid values before anything is created.

```hcl
variable "aws_instance_type" {
  type = string

  validation {
    condition     = var.aws_instance_type == "t2.micro" || var.aws_instance_type == "t3.micro"
    error_message = "Only t2.micro and t3.micro are allowed."
  }
}

variable "volume_size" {
  type = number

  validation {
    condition     = var.volume_size >= 8 && var.volume_size <= 100
    error_message = "Volume size must be between 8 and 100 GB."
  }
}
```

If an invalid value is passed:
```bash
terraform plan -var="aws_instance_type=t3.large"
```

#### Preconditions and Postconditions

More advanced checks that run during plan and apply:

```hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type

  lifecycle {
    precondition {
      condition     = var.ami_id != ""
      error_message = "AMI ID must not be empty."
    }

    postcondition {
      condition     = self.public_ip != ""
      error_message = "Instance must have a public IP after creation."
    }
  }
}
```

#### Check Block — Standalone Assertions

```hcl
check "ec2_instance_validation" {
  assert {
    condition     = var.ami_id != ""
    error_message = "AMI ID must not be empty."
  }

  assert {
    condition     = contains(["t2.micro", "t3.micro"], var.instance_type)
    error_message = "Instance type must be t2.micro or t3.micro."
  }
}
```

---

## 15. Lifecycle Block

Controls how Terraform handles updates and deletions for a specific resource.

```hcl
resource "aws_db_instance" "main" {
  identifier        = "prod-postgres"
  instance_class    = "db.t3.medium"
  allocated_storage = 100

  lifecycle {
    prevent_destroy = true

    ignore_changes = [
      engine_version,       # Let AWS handle minor version upgrades
      snapshot_identifier,  # Set during restore, no need to track
    ]

    create_before_destroy = true

    precondition {
      condition     = var.environment == "prod" ? var.instance_class != "db.t3.micro" : true
      error_message = "Production databases must not use db.t3.micro."
    }
  }
}
```

**Lifecycle rules summary:**

| Rule | What it does |
| :--- | :--- |
| `prevent_destroy` | Blocks accidental `terraform destroy` on critical resources |
| `ignore_changes` | Ignores specified attribute changes — useful when AWS auto-updates something |
| `create_before_destroy` | Creates replacement first, then destroys old — zero downtime |

---

Terraform automatically detects dependencies when one resource references another. If a subnet references `aws_vpc.main.id`, Terraform knows to create the VPC first.

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id   # Terraform sees this reference — creates VPC first
  cidr_block = "10.0.1.0/24"
}
```

#### depends_on — Explicit Dependency

Use when Terraform cannot detect the dependency automatically:

```hcl
resource "aws_iam_role_policy_attachment" "app" {
  role       = aws_iam_role.app.name
  policy_arn = aws_iam_policy.app.arn

  depends_on = [
    aws_iam_role.app,     # Create role before attaching policy
    aws_iam_policy.app,
  ]
}
```

On destroy, Terraform reverses the order — subnet is deleted before VPC.

---

By default, Terraform saves state to a local `terraform.tfstate` file. This is fine for solo work but breaks for teams — two people running `terraform apply` simultaneously can corrupt state.

**Problem** — Local state means no collaboration, no locking, and accidental deletion of the state file loses track of all infrastructure.

**Solution** — Store state remotely in S3 with DynamoDB for locking. Everyone on the team works against the same state.

#### S3 Backend Setup

First, create the S3 bucket and DynamoDB table (run once):

```hcl
resource "aws_s3_bucket" "terraform_state" {
  bucket = "mycompany-terraform-state"

  lifecycle {
    prevent_destroy = true   # Never accidentally delete the state bucket
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"   # Versioning = history of every state change
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

Then configure backend in your project:

```hcl
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "prod/us-east-1/app/terraform.tfstate"   # Path in bucket
    region         = "us-east-1"
    encrypt        = true                    # Encrypt state at rest
    dynamodb_table = "terraform-state-lock"  # Locking table
  }
}
```

Run `terraform init` after adding backend config — it migrates local state to S3.

#### Read Outputs from Another State

```hcl
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "mycompany-terraform-state"
    key    = "prod/us-east-1/network/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_subnet" "app" {
  vpc_id     = data.terraform_remote_state.network.outputs.vpc_id
  cidr_block = "10.0.10.0/24"
}
```

---

**Problem** — You define a VPC, subnets, internet gateway, and route tables in dev. Now you need the exact same thing in staging and prod. Copy-pasting the same code 3 times means 3 places to update when something changes.

**Solution** — Package the VPC setup into a module. Call it once per environment with different inputs.

A module is just a directory with `.tf` files. Every Terraform configuration is already a module — the root module.

#### Module Structure

```
modules/
  vpc/
    main.tf        # Resources
    variables.tf   # Input variables
    outputs.tf     # Output values
    versions.tf    # Version constraints
    README.md
  ec2-cluster/
    main.tf
    variables.tf
    outputs.tf
```

#### Creating a Module

`modules/vpc/variables.tf`
```hcl
variable "name" {
  type = string
}

variable "cidr_block" {
  type    = string
  default = "10.0.0.0/16"
}

variable "availability_zones" {
  type = list(string)
}

variable "enable_nat_gateway" {
  type    = bool
  default = true
}
```

`modules/vpc/main.tf`
```hcl
resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  tags = { Name = var.name }
}

resource "aws_subnet" "public" {
  for_each = { for idx, az in var.availability_zones : az => cidrsubnet(var.cidr_block, 8, idx) }

  vpc_id                  = aws_vpc.this.id
  cidr_block              = each.value
  availability_zone       = each.key
  map_public_ip_on_launch = true
  tags = { Name = "${var.name}-public-${each.key}" }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.name}-igw" }
}
```

`modules/vpc/outputs.tf`
```hcl
output "vpc_id"            { value = aws_vpc.this.id }
output "public_subnet_ids" { value = [for s in aws_subnet.public : s.id] }
```

#### Calling a Module

```hcl
module "vpc" {
  source = "./modules/vpc"   # Local module path

  name               = "prod-vpc"
  cidr_block         = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  enable_nat_gateway = true
}

resource "aws_security_group" "app" {
  vpc_id = module.vpc.vpc_id   # Output from the vpc module
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name = "my-eks"
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.public_subnet_ids
}
```

```bash
terraform init              # Downloads and installs modules
terraform init -upgrade     # Upgrade module versions
```

---

## 19. State Manipulation

State commands let you inspect and manage the state file without editing it manually — never edit `.tfstate` by hand.

```bash
terraform state list                                   # List all resources in state
terraform state show aws_instance.web                  # Show details of a resource
terraform state show module.vpc.aws_vpc.this           # Show resource inside a module

terraform state mv aws_instance.old aws_instance.new   # Rename a resource without destroying it
terraform state rm aws_s3_bucket.legacy                # Remove from state without destroying real resource

terraform state pull                                   # Download remote state to local (for inspection)
terraform state push state-backup.json                 # Upload local state to remote backend

terraform force-unlock LOCK_ID                         # Force-unlock a stuck state lock
```

**When to use state commands:**
- `state mv` — when you rename a resource in code, use this so Terraform doesn't destroy and recreate it
- `state rm` — when you want Terraform to stop managing a resource but keep it running in AWS
- `state pull` — when you want to inspect the raw state for debugging

---

## 20. Import Command

**Problem** — You already have an EC2 instance or S3 bucket that was created manually. You want Terraform to manage it going forward without destroying and recreating it.

**Solution** — Use `terraform import` to bring the existing resource into Terraform state.

```bash
terraform import aws_instance.main i-0abc123def456789

terraform import aws_s3_bucket.my_bucket my-existing-bucket-name

terraform import module.vpc.aws_vpc.this vpc-0abc123def456
```

**Steps to import:**

1. Write an empty resource block in your `.tf` file:
```hcl
resource "aws_instance" "main" {
}
```

2. Run the import command:
```bash
terraform import aws_instance.main i-0abc123def456789
```

3. Run `terraform show` to see the current state of the imported resource:
```bash
terraform show
```

4. Copy the relevant attributes from the output back into your resource block

5. Run `terraform plan` — should show no changes if done correctly

From Terraform 1.5+, you can also generate config automatically:
```bash
terraform plan -generate-config-out=generated.tf
```

---

## 21. Workspaces

Workspaces let you manage multiple independent sets of infrastructure from the same config directory. Each workspace has its own state file.

```
Same tf config
     │
     ├── workspace: dev    → tfstate (dev resources)
     ├── workspace: test   → tfstate (test resources)
     └── workspace: prod   → tfstate (prod resources)
```

```bash
terraform workspace list                   # List all workspaces
terraform workspace new dev                # Create a new workspace
terraform workspace select prod            # Switch to prod workspace
terraform workspace show                   # Show current workspace name

terraform workspace select default
terraform workspace delete dev             # Delete a workspace (must switch away first)
```

Reference current workspace in config:

```hcl
resource "aws_instance" "web" {
  instance_type = terraform.workspace == "prod" ? "t3.large" : "t3.micro"

  tags = {
    Environment = terraform.workspace
  }
}
```

**Workspaces vs separate tfvars files:**
- Workspaces are simpler but share the same backend config
- Separate directories with separate backends give better isolation for production
- For serious production setups, separate directories per environment is safer

---

Running Terraform in a pipeline automates infrastructure changes with proper review gates.

#### GitHub Actions Pipeline

```yaml
name: Terraform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  TF_VERSION: "1.7.5"
  AWS_REGION: "us-east-1"

permissions:
  id-token: write       # Needed for OIDC AWS auth — no hardcoded keys
  contents: read
  pull-requests: write  # Needed to post plan output as PR comment

jobs:
  terraform:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
          aws-region: ${{ env.AWS_REGION }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        run: terraform init

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Format Check
        run: terraform fmt -check -recursive

      - name: Terraform Plan
        id: plan
        run: terraform plan -out=tfplan -no-color

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve tfplan
```

**Best practices for CI/CD:**
- Use OIDC to authenticate with AWS — no long-lived access keys in secrets
- Always run `validate` and `fmt -check` before plan
- Save plan to a file with `-out=tfplan` and apply that exact file
- Only auto-apply on merge to main, not on every PR

---

## 23. Terraform Cloud

Terraform Cloud is HashiCorp's managed service for running Terraform remotely with team collaboration features.

**What it provides:**
- Remote state management — no need to set up S3/DynamoDB manually
- Remote plan and apply — runs happen on HashiCorp's servers, not your laptop
- VCS integration — auto-triggers plan on every PR
- Secure variable management — store secrets encrypted, not in `.tfvars` files
- Team access control — who can approve and apply changes

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

```bash
terraform login    # Authenticate with Terraform Cloud
terraform init     # Initialize with Cloud backend
```

---

## 24. Dynamic Blocks

**Problem** — Security groups need many ingress rules. Writing each as a separate block means lots of repetition that is hard to maintain.

**Solution** — Use dynamic blocks to generate repeated nested blocks from a variable.

```hcl
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

resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = module.vpc.vpc_id

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
```

---

## 25. Production Checklist

| Practice | Why |
| :--- | :--- |
| Pin provider versions with `~>` | Prevents surprise breaking changes |
| Remote state with S3 + DynamoDB locking | Prevents concurrent modification |
| `prevent_destroy = true` on databases | Prevents catastrophic accidental deletes |
| `sensitive = true` on secret outputs | Prevents secrets leaking in CI logs |
| Separate state per environment | Blast radius isolation |
| Use OIDC for CI authentication | No long-lived AWS keys in CI secrets |
| Run `validate` + `fmt -check` in CI | Catch syntax errors before plan |
| Require plan approval for prod | Human review of all production changes |
| Tag every resource | Cost attribution and resource discovery |
| Module versioning with git tags | Reproducible, auditable infra changes |

---

### Quick Reference — All Commands

```bash
terraform init                             # Init project, download providers
terraform init -upgrade                    # Upgrade provider versions
terraform init -migrate-state             # Migrate state to new backend

terraform plan                             # Preview changes
terraform plan -out=tfplan                 # Save plan to file
terraform plan -target=aws_instance.web   # Plan specific resource only
terraform plan -destroy                    # Preview what destroy will do
terraform apply                            # Apply changes (asks for confirmation)
terraform apply -auto-approve              # Apply without confirmation prompt
terraform apply tfplan                     # Apply a saved plan file
terraform apply -target=module.vpc        # Apply specific module only
terraform destroy                          # Destroy all resources
terraform destroy -auto-approve            # Destroy without confirmation

terraform show                             # Show current state
terraform output                           # Show all outputs
terraform output -json                     # All outputs as JSON
terraform state list                       # List all resources in state
terraform state show aws_instance.web     # Details of specific resource
terraform validate                         # Check config syntax
terraform fmt                              # Format .tf files
terraform fmt -check -recursive           # Check formatting in CI

terraform state mv old new                 # Rename resource in state
terraform state rm aws_s3_bucket.old      # Remove from state only
terraform state pull                       # Download remote state
terraform force-unlock LOCK_ID            # Unlock stuck state

terraform import aws_instance.main INSTANCE_ID   # Import existing resource

terraform workspace list                   # List workspaces
terraform workspace new dev               # Create workspace
terraform workspace select prod           # Switch workspace
terraform workspace show                  # Current workspace

TF_LOG=DEBUG terraform apply              # Enable debug logging
TF_LOG_PATH=./debug.log terraform apply  # Save debug log to file
```

