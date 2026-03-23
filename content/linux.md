# 🐧 Linux for DevOps — Complete Notes (Beginner to Advanced)

Master Linux from absolute zero. These notes are written in plain simple language — like a friend explaining it to you. Follow all 8 modules in order and you will be fully comfortable on any Linux server.

---

## 🧠 01. What is Linux & Why Every DevOps Engineer Needs It

Linux is the operating system that powers the entire DevOps world. Before you touch Docker, Kubernetes, Terraform, or any CI/CD tool — you need to understand what Linux is, where it came from, and why it's everywhere in modern infrastructure. This section gives you that foundation.

#### What is an Operating System?

Before Linux, let's understand what an OS even is. Think of your computer like a restaurant. The **hardware** (CPU, RAM, disk) is the kitchen — it does the actual cooking. The **Operating System** is the restaurant manager — it takes your order (your commands), tells the kitchen what to do, and gives you back the result. Without an OS, you literally cannot use a computer. Windows, macOS, and Linux are all operating systems — just different managers running the same kitchen.

#### So What is Linux?

Linux is a **free, open-source operating system** created by a Finnish student named **Linus Torvalds in 1991**. He was frustrated that good OS software was expensive, so he built his own and gave it away for free. Today, Linux runs:

- 96% of the world's web servers
- All Android phones (Android is built on Linux)
- Every Docker container
- Every Kubernetes node
- AWS, Google Cloud, Azure servers
- The International Space Station
- Tesla cars

When you become a DevOps engineer, you will spend most of your working day inside a Linux terminal. There is no way around it.

#### Unix vs Linux — What's the Difference?

**Unix** was created at Bell Labs (AT&T) in the 1970s. It was a revolutionary OS for its time — powerful, stable, multi-user. But it was **expensive and proprietary** — companies had to pay a lot to use it.

**Linux** came along in 1991 and said: "Here's the same philosophy, same ideas, completely rewritten from scratch, and completely free." Linux is **Unix-like** — it follows the same rules and ideas as Unix, but it's not Unix code.

**macOS** is also Unix-based (it's called Darwin underneath). This is why terminal commands on Mac and Linux are almost identical — they share the same Unix DNA.

The Unix/Linux philosophy that you'll feel everywhere:
- **Everything is a file** — your disk, your keyboard, your network connection — Linux treats them all as files
- **Small tools that do one thing well** — `ls` just lists files. `grep` just searches text. You combine them with pipes to do powerful things
- **The terminal is king** — everything can be done without a GUI

#### Where Linux Fits in a DevOps Career

```
Your laptop terminal  (you type commands here)
        ↓
SSH connection        (secure tunnel to a remote server)
        ↓
Linux Server on AWS / GCP / Azure   (this is where your app lives)
        ↓
Docker containers     (mini Linux environments inside your server)
        ↓
Kubernetes nodes      (Linux VMs managing your containers)
        ↓
CI/CD runners         (Linux machines running your automated pipelines)
```

Every single layer above is Linux. Learning Linux is not one skill among many — it **is** the skill that unlocks all others.

#### Key Features of Linux (Why Everyone Uses It)

| Feature | What It Means | Why It Matters |
|---|---|---|
| **Open Source** | Source code is free and public | Anyone can modify, inspect, improve it |
| **Multi-User** | Multiple users can work simultaneously | Each user has separate permissions & security |
| **Multi-Tasking** | Runs many programs at once | Efficient CPU and memory usage |
| **Security** | Strong file permissions, user access control | Less prone to viruses, easy to audit |
| **Stability** | Runs for years without rebooting | Perfect for servers and production systems |
| **Portability** | Runs on different hardware | Phones, servers, cloud, IoT, supercomputers |
| **CLI Power** | Terminal-based control | Easy automation using shell scripts |
| **Networking** | Built-in TCP/IP, SSH, HTTP support | Used as base OS for all network servers |
| **Free** | No license cost | Reduces infrastructure expenses massively |

#### Virtualization — Running Linux Inside Linux

In DevOps you will constantly work with **Virtual Machines (VMs)**. Understanding virtualization is essential because Docker, cloud servers, and local dev environments all use it.

**What is virtualization?** It lets one physical machine pretend to be many separate computers. Each "pretend computer" is called a Virtual Machine (VM). They share the physical hardware but are completely isolated from each other.

```
Physical Hardware (CPU, RAM, Disk)
         ↓
    Hypervisor (virtualization software)
         ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   VM 1      │  │   VM 2      │  │   VM 3      │
│ Ubuntu      │  │ CentOS      │  │ Windows     │
│ Web Server  │  │ Database    │  │ Test Env    │
└─────────────┘  └─────────────┘  └─────────────┘
```

Each VM has its own virtual CPU, virtual RAM, virtual disk, and its own OS. They don't know about each other. If VM 2 crashes, VM 1 keeps running fine.

**Type 1 Hypervisor (Bare Metal)** — runs directly on physical hardware. No host OS needed. Used in data centers.
Examples: VMware ESXi, Microsoft Hyper-V, KVM (Linux built-in)

```
Applications
     ↓
Guest OS (inside VM)
     ↓
Type-1 Hypervisor    ← runs directly on hardware, most efficient
     ↓
Physical Hardware
```

**Type 2 Hypervisor (Hosted)** — runs on top of an existing OS. Easier to set up. Used for local development.
Examples: VirtualBox, VMware Workstation, Parallels Desktop

```
Applications
     ↓
Guest OS (inside VM)
     ↓
Type-2 Hypervisor    ← runs as a program on your existing OS
     ↓
Host OS (Windows/Mac/Linux)
     ↓
Physical Hardware
```

For learning Linux: **VirtualBox** is a Type-2 hypervisor you install on Windows or Mac to run Linux VMs.

#### The Linux Kernel — The Heart of the OS

The **kernel** is the core of Linux. It is the first thing that loads when Linux boots, and it stays running the entire time the system is on. It is the bridge between your software and the hardware.

```
User (you)
    ↓
Applications (nginx, python, node)
    ↓
Kernel  ← manages everything below this line
    ↓
Hardware (CPU, RAM, Disk, Network)
```

**What the kernel does:**
- **Process Management** — decides which program gets CPU time, creates and stops processes
- **Memory Management** — gives each program the RAM it needs, prevents programs from stealing each other's memory
- **Device Management** — controls disk, keyboard, network card using device drivers
- **File System** — reads and writes data to storage
- **System Calls** — when a program needs OS services (like writing a file), it asks the kernel

**Types of kernels (you'll see these terms in interviews):**

| Type | How It Works | Used In | Speed |
|---|---|---|---|
| **Monolithic** | All services inside one kernel | Linux, Unix | Fast |
| **Microkernel** | Only basics in kernel, rest in user space | Minix, QNX | Slower but more secure |
| **Hybrid** | Mix of both | Windows, macOS | Balanced |

Linux uses a **Monolithic kernel** — fast performance because everything runs in one space. This is why Linux is so efficient for servers.



## 💻 02. Setting Up Your Linux Environment

Before you can practice Linux, you need a Linux machine to work on. This section covers everything you need to get started — what Linux distributions are, three ways to run Linux on your machine, and how to access a remote server via SSH, which is the exact workflow you will use every day in a real DevOps job.

#### Why Your Setup Choice Matters

The environment you practice in shapes your learning. If you set up Linux correctly from the start, every command you practice will feel realistic and transfer directly to work. Most beginners make the mistake of using a GUI-based Linux with a desktop — but in DevOps, servers have no desktop. They are controlled entirely through a terminal over SSH. The sooner you get comfortable in that environment, the better.

Here is what your daily DevOps workflow will actually look like:

```
Your laptop (Mac or Windows)
        ↓
Open terminal
        ↓
SSH into a remote Linux server (AWS EC2, GCP VM, Azure VM)
        ↓
Run commands, edit config files, deploy apps, check logs
        ↓
Log out — server keeps running
```

There is no "Open Finder" or "Double-click the folder". Everything happens in the terminal. This is not hard once you get used to it — it is actually faster and more powerful than any GUI.

#### What is a Linux Distribution?

Linux itself is just a **kernel** — the core piece of software that manages hardware. A kernel alone is not usable as an operating system. You need tools, a package manager, default libraries, and sometimes a desktop. A **Linux distribution (distro)** bundles all of this together into a complete, usable OS.

Think of it like this: the Linux kernel is an engine. A distribution is the full car built around that engine — different manufacturers (Canonical for Ubuntu, Red Hat for RHEL, the community for Debian) make different cars, but they all use the same fundamental engine underneath.

| Distro | Based On | Package Manager | Typical Use |
|---|---|---|---|
| **Ubuntu 22.04** | Debian | `apt` | Most beginner-friendly, huge community |
| **CentOS / RHEL** | Red Hat | `yum` / `dnf` | Enterprise servers, many job environments |
| **Debian** | — | `apt` | Rock-solid stability, Docker base images |
| **Alpine Linux** | — | `apk` | Tiny (5MB!), used inside Docker containers |
| **Amazon Linux 2** | RHEL | `yum` | Default on AWS EC2, AWS-optimised |
| **Fedora** | Red Hat | `dnf` | Cutting edge, bleeding edge packages |

**Which should you use to learn?** Ubuntu 22.04 LTS is the best choice for beginners — it has the most documentation, the largest community, and is widely used in cloud environments. CentOS/RHEL is worth knowing too because many enterprise job environments use it.

#### Important: Linux Has No Undo

Before you spin up your Linux environment, tattoo this onto your brain:

- **`rm` deletes files permanently** — no recycle bin, no recovery, no undo
- **Root user (`#` prompt) has zero restrictions** — one wrong command can wipe the OS
- **Always work as a regular user** — only use `sudo` when you specifically need it
- **Case sensitive** — `File.txt` and `file.txt` are completely different files

These rules will save you from disasters. Every Linux engineer has a story about accidentally deleting something important. Learn from others' pain, not your own.

### 🐧 Linux Distributions (Distro)

Imagine Linux as a car engine. The engine (Linux kernel) is the same, but different car manufacturers (distro makers) build different cars around it — different body, different features, different dashboard. That car is called a **Linux distribution**.

Each distro bundles the Linux kernel with:
- A package manager (tool to install software)
- Default tools and utilities
- A desktop environment (optional, for GUI)

| Distro | Think of it as | Package Manager | Where you'll see it |
|---|---|---|---|
| **Ubuntu** | The friendly beginner car | `apt` | Most popular, great docs |
| **CentOS / RHEL** | The enterprise workhorse | `yum` / `dnf` | Company servers, AWS AMIs |
| **Debian** | The stable foundation | `apt` | Production servers, Docker base |
| **Alpine** | The tiny racing car | `apk` | Docker containers (only 5MB!) |
| **Amazon Linux 2** | AWS's custom build | `yum` | Default EC2 instances |

For learning: Ubuntu or CentOS both work perfectly. Commands are 95% identical across all distros.

### 🖥️ Three Ways to Get a Linux Environment

**Option 1 — VirtualBox (Best for complete beginners)**

VirtualBox is free software from Oracle that lets you run a full Linux computer **inside your existing Windows or Mac computer**. It's like having a computer inside your computer. You can break things, experiment freely, and just reset if something goes wrong — without affecting your real machine.

```
Step 1: Download VirtualBox → https://www.virtualbox.org/
Step 2: Download Ubuntu ISO → https://ubuntu.com/download/server
Step 3: Open VirtualBox → New → Name it "Ubuntu" → 
        Set RAM to 2048MB → Create 20GB virtual hard disk
Step 4: Start VM → Select your ISO file → Follow installer
Step 5: You now have a full Linux computer inside your computer!
```

**Option 2 — WSL2 (Windows users — quickest setup)**

WSL2 (Windows Subsystem for Linux) lets Windows 11 users run Ubuntu directly inside Windows — no virtual machine needed. It's like Linux living inside Windows peacefully.

```powershell
# Open PowerShell as Administrator and run:
wsl --install
# Restart your PC
# Open "Ubuntu" from the Start Menu
# Create a username and password
# Done — you have Linux!
```

**Option 3 — Cloud VM (Most realistic for DevOps work)**

This is how real DevOps engineers work. You spin up a server on AWS, connect to it from your terminal, and work on it remotely. AWS gives you a free t2.micro server for 12 months on their Free Tier.

```
1. Create free AWS account → aws.amazon.com
2. Go to EC2 → Launch Instance
3. Choose "Amazon Linux 2" or "Ubuntu 22.04"
4. Select t2.micro (free tier eligible)
5. Create a key pair → download the .pem file
6. Launch instance → get the IP address
7. Connect from your terminal (see SSH section below)
```

### 🔐 Accessing Linux — Terminal & SSH

**What is a terminal?** The terminal (also called command line or shell) is a text-based interface to your OS. Instead of clicking icons, you type commands. It sounds intimidating at first but within a week it feels completely natural — and much faster than clicking.

When you open a terminal on Linux you see something like:
```
daksh@myserver:~$
  │      │     │ └── $ means you're a regular user (# means root/admin)
  │      │     └──── ~ means you're in your home directory
  │      └────────── hostname (name of the server)
  └───────────────── your username
```

**What is SSH?** SSH stands for Secure Shell. It's a protocol that creates an **encrypted tunnel** between your laptop and a remote server. Think of it like a secure phone call — everything you type travels through this tunnel to the server, and the server's responses come back the same way. No one in between can see what you're doing.

```bash
# Basic SSH — connect to a server
ssh username@server-ip-address
# Example:
ssh daksh@192.168.1.100

# SSH with a key file (how AWS EC2 works)
# AWS gives you a .pem file instead of a password
ssh -i my-key.pem ec2-user@54.123.456.789

# SSH to a different port (default is 22, some servers change it for security)
ssh -p 2222 username@server-ip

# Exit an SSH session and go back to your local machine
exit
# or press Ctrl+D
```

**PuTTY** is a free Windows application with a GUI for SSH — if you're not comfortable with the terminal yet, download it from putty.org. You enter the server IP, port 22, and click Open. But learn terminal SSH quickly — PuTTY won't be available in CI/CD pipelines.

#### Critical Things to Remember in Linux (Read This Twice)

These are the things that trip up every beginner. Learn them now and save hours of frustration:

**1. Linux is completely case-sensitive**
`File.txt`, `file.txt`, and `FILE.TXT` are three completely different files. `ls` and `LS` are different commands. Get used to this — it catches everyone out.

**2. There is NO recycle bin**
When you delete a file with `rm`, it is gone forever. There is no "Undo". No recycle bin. No recovery (usually). This is why you always double-check `rm` commands before pressing Enter.

**3. The root user is all-powerful and dangerous**
The `root` user (like Administrator on Windows) has zero restrictions. Root can delete the entire operating system with one command. Always work as a regular user. Only use `sudo` (run as root) when specifically needed.

**4. Spaces in filenames cause problems**
`my project folder` with spaces confuses Linux — it thinks you're referring to three separate things. Always use underscores or hyphens: `my_project_folder` or `my-project-folder`. If you must use spaces, wrap in quotes: `"my project folder"`.

**5. Hidden files start with a dot**
Files starting with `.` are hidden. `.bashrc`, `.ssh`, `.gitignore` — these won't show up with regular `ls`. Use `ls -la` to see them.

---

## 📁 03. System Access and the File System

This section covers two of the most essential Linux skills — understanding the filesystem structure and navigating it with confidence. Every single thing you do on a Linux server involves the filesystem in some way. Config files live in specific places. Logs live in specific places. Apps get installed in specific places. Once you know the layout, you always know where to look.

#### Why the Filesystem Structure Matters So Much

On Windows, files are organised under drive letters: `C:\`, `D:\`. Each drive is a separate tree. Linux works completely differently — there is **one single unified tree** starting at `/` (called the root directory). Everything — your files, mounted drives, running process info, hardware devices — all appear somewhere inside this one tree.

This might sound confusing at first but it is actually cleaner. Once you know the layout, you always know where to find things:

```
Question: Where are config files?          Answer: /etc/
Question: Where are log files?             Answer: /var/log/
Question: Where are my personal files?     Answer: /home/yourusername/
Question: Where are installed programs?    Answer: /usr/bin/ or /opt/
Question: Where is the nginx config?       Answer: /etc/nginx/nginx.conf
Question: Where is the SSH config?         Answer: /etc/ssh/sshd_config
```

This is universal across every Linux server, every cloud provider, every Docker container. Learn it once, use it everywhere.

#### Absolute vs Relative Paths — You Will Use These Constantly

A **path** is the address of a file or folder. There are two types:

**Absolute path** — starts with `/`, works from anywhere on the system:
```
/home/daksh/projects/myapp/config.txt
/etc/nginx/nginx.conf
/var/log/syslog
```

**Relative path** — relative to where you currently are:
```
projects/myapp/config.txt     (if you're already in /home/daksh/)
../john/file.txt              (go up one level, then into john's folder)
./script.sh                   (in the current directory)
```

Think of it like giving directions. Absolute is "Go to 42 Baker Street, London" — works from anywhere. Relative is "Turn left at the corner" — only makes sense if the other person knows where they are.

**The `~` shortcut** — tilde always means your home directory. So `~/projects` is the same as `/home/daksh/projects`. You will use `~` constantly.

#### How the Terminal Prompt Tells You Where You Are

When you open a terminal, the prompt tells you important information:

```
daksh@webserver-prod:~/projects$
  │        │            │       └── $ = regular user (# = root)
  │        │            └────────── current directory (~ = home)
  │        └─────────────────────── hostname (which server)
  └──────────────────────────────── your username
```

Reading the prompt tells you instantly: who you are, which server you are on, and where in the filesystem you currently are. This matters especially when you have SSH sessions open to multiple servers at once — you always want to know which machine you are actually typing commands on.

### 🌳 The Linux File System Tree

On Windows, you have `C:\`, `D:\`, `E:\` — separate drives. Linux is completely different. There is **one single tree** starting at `/` (called "root" — not the root user, just the name for the top of the tree). Everything — your files, your USB drive, your running processes — is somewhere inside this one tree.

```
/                        ← The very top. Called "root". Everything lives here.
│
├── bin/                 ← Essential basic commands (ls, cp, mv, cat)
│                           "bin" = binaries = programs
│
├── etc/                 ← ALL configuration files live here
│                           nginx config, SSH config, user accounts — all in /etc
│                           "etc" = etcetera (historical Unix name)
│
├── home/                ← Personal folders for each user
│   ├── daksh/           ← Your home folder. Like C:\Users\Daksh on Windows
│   └── john/            ← Another user's home folder
│
├── root/                ← Home folder for the root (admin) user
│                           Root's home is separate from /home for security
│
├── var/                 ← Variable data — things that change constantly
│   ├── log/             ← ALL log files live here (/var/log/nginx/error.log etc.)
│   └── www/             ← Web server files often go here
│
├── tmp/                 ← Temporary files. Cleared automatically on reboot.
│                           Safe to put temporary stuff here
│
├── usr/                 ← User programs and libraries
│   └── bin/             ← Most commands you'll use (python3, git, node, etc.)
│
├── opt/                 ← Optional / third-party software
│                           When you manually install something, it often goes here
│
├── proc/                ← NOT real files! Virtual filesystem showing running processes
│                           /proc/cpuinfo shows your CPU, /proc/meminfo shows RAM
│
├── dev/                 ← Device files — your disks, terminals, random number generator
│                           /dev/sda is your first hard disk
│
└── mnt/                 ← Mount point for external drives, network shares
```

**The key rule to remember:** Configuration files → `/etc/`. Log files → `/var/log/`. Your files → `/home/yourname/`. Installed apps → `/opt/` or `/usr/`. This pattern is the same on every Linux system everywhere.

#### Understanding Paths — How to Point to Files

A **path** is just the address of a file or folder — like a GPS coordinate for your filesystem.

**Absolute path** — starts with `/`, always works no matter where you currently are:
```
/home/daksh/projects/myapp/config.txt
/etc/nginx/nginx.conf
/var/log/syslog
```

**Relative path** — relative to where you currently are. If you're in `/home/daksh/`:
```
projects/myapp/config.txt      (same as /home/daksh/projects/myapp/config.txt)
../john/file.txt               (.. means "go up one level" → /home/john/file.txt)
./script.sh                    (. means "current directory" → /home/daksh/script.sh)
```

Think of it like giving directions. Absolute path = "Go to 42 Baker Street, London" (works from anywhere). Relative path = "Turn left at the corner" (only works if you know where you currently are).

#### Navigating the File System

```bash
# pwd — Print Working Directory
# "Where am I right now?"
pwd
# Output: /home/daksh
# This tells you your current location in the filesystem tree

# ls — List files and directories
# Like opening a folder in Windows Explorer but in text form
ls                    # Basic list
ls -l                 # Long format — shows permissions, owner, size, date
ls -la                # Long format + hidden files (files starting with .)
ls -lh                # Human readable sizes (shows KB, MB, GB instead of raw bytes)
ls /etc               # List a specific folder without going there first

# cd — Change Directory
# Like double-clicking a folder to open it
cd /etc               # Go to /etc (absolute path)
cd projects           # Go into projects folder (relative — must exist in current dir)
cd ..                 # Go UP one level (like clicking the back button)
cd ~                  # Go to YOUR home directory (shortcut — works from anywhere)
cd -                  # Go back to the PREVIOUS directory you were in (super useful!)
cd /home/daksh/projects/myapp    # Go directly to a deeply nested folder
```

#### Creating and Managing Files and Directories

```bash
# touch — Create an empty file
# "touch" is named this because it also updates the timestamp of existing files
touch notes.txt                    # Create one empty file
touch file1.txt file2.txt file3.txt  # Create multiple files at once
touch /home/daksh/newfile.txt      # Create file in specific location

# mkdir — Make Directory (create a folder)
mkdir projects                     # Create one folder
mkdir -p projects/devops/docker/notes
# The -p flag means "create parent directories too"
# Without -p, this would fail if projects/devops/docker doesn't exist yet
# With -p, it creates ALL the folders in the chain — very useful!

# cp — Copy files and folders
cp file.txt backup.txt             # Copy file.txt to a new file called backup.txt
cp file.txt /tmp/                  # Copy file.txt into the /tmp/ folder
cp -r projects/ projects-backup/   # Copy entire folder (-r means recursive = include everything inside)

# mv — Move OR Rename files
# mv does double duty — same command for both moving and renaming
mv file.txt /tmp/file.txt          # MOVE: send file.txt to /tmp/
mv oldname.txt newname.txt         # RENAME: same folder, new name
mv projects/ /opt/projects/        # MOVE entire folder to /opt/

# rm — Remove (delete) files — WARNING: PERMANENT, NO UNDO
rm file.txt                        # Delete a single file
rm file1.txt file2.txt             # Delete multiple files
rm -r projects/                    # Delete entire folder and everything inside (-r = recursive)
rm -rf projects/                   # Force delete without asking for confirmation (-f = force)
                                   # The -rf combination is powerful and dangerous — double check!
```

#### Reading File Contents

```bash
# cat — Show entire file content at once
# Good for short files. Bad for huge files (floods your terminal)
cat /etc/hostname                  # Shows your server's hostname
cat config.txt                     # Shows entire file
cat -n file.txt                    # Show with line numbers

# less — Read file page by page (the RIGHT way for big files)
# Think of it like reading a book — you scroll through pages
# Press Space → next page | b → back | /word → search | n → next match | q → quit
less /var/log/syslog               # Read a big log file comfortably

# more — Older, simpler version of less (only goes forward)
more file.txt                      # Space to scroll, q to quit
# Use less instead — it's strictly better (backward scrolling + search)

# head — Show only the FIRST lines of a file
head file.txt                      # Shows first 10 lines (default)
head -20 file.txt                  # Shows first 20 lines
head -1 employees.csv              # Great for seeing column headers of a CSV

# tail — Show only the LAST lines of a file
tail file.txt                      # Shows last 10 lines (default)
tail -20 file.txt                  # Shows last 20 lines
tail -f /var/log/nginx/access.log  # FOLLOW mode — keeps showing NEW lines as added
                                   # DevOps engineers use tail -f constantly when debugging!
                                   # Press Ctrl+C to stop following

# zcat — View COMPRESSED files without extracting them
# gz files are compressed logs — this lets you read them without unpacking
zcat /var/log/syslog.1.gz          # Read a compressed log directly
zcat logfile.gz | grep "error"     # Search inside a compressed log
```

#### File Information & Comparison

```bash
# file — Tells you what TYPE of file something is
# Linux doesn't rely on extensions — this command checks the actual content
file document.pdf          # Output: PDF document, version 1.4
file script.sh             # Output: Bash script, ASCII text executable
file image.jpg             # Output: JPEG image data
file *                     # Check ALL files in current directory

# wc — Word Count (also counts lines and characters)
wc file.txt                # Shows: lines  words  bytes  filename
wc -l file.txt             # Count LINES only — very common
wc -w file.txt             # Count WORDS only
wc -c file.txt             # Count BYTES only

# Real use: how many errors in this log?
grep "ERROR" app.log | wc -l       # Count error lines instantly

# diff — Show DIFFERENCES between two files line by line
diff file1.txt file2.txt           # Shows what changed
diff -u file1.txt file2.txt        # Unified format — easier to read (like git diff)
diff -r dir1/ dir2/                # Compare entire directories
# Output: < means from file1, > means from file2

# cmp — Compare two files byte by byte (just yes/no + where)
cmp file1.txt file2.txt            # Shows first byte that differs
cmp -s file1.txt file2.txt         # Silent mode — returns 0 if same, 1 if different
                                   # Great for scripts: if cmp -s f1 f2; then echo "Same"; fi

# script — Record EVERYTHING you type in the terminal to a file
# Incredibly useful for documentation, homework, and debugging sessions
script session.log                 # Start recording — everything you type gets saved
# ... do your work ...
exit                               # Stop recording (or press Ctrl+D)
# session.log now has a complete transcript of everything you did
```



#### Finding Files — Because Files Get Lost

```bash
# find — The powerful searcher. Searches in real-time through actual filesystem.
find /etc -name "nginx.conf"          # Find a file by exact name in /etc
find /etc -name "*.conf"              # Find ALL files ending in .conf (the * is a wildcard)
find /home -type f -name "*.log"      # type f means only files (not folders)
find /home -type d                    # type d means only directories
find / -size +100M                    # Find files larger than 100 megabytes
find /tmp -mtime +7                   # Find files NOT modified in more than 7 days
find / -perm 777                      # Find files with 777 permissions (security check)

# locate — Fast searcher using a database (pre-indexed, so it's instant)
# BUT: the database might be outdated. Update it first with updatedb.
sudo updatedb                         # Update the search database
locate nginx.conf                     # Now search instantly

# which — Find WHERE a command/program is installed
which python3                         # Output: /usr/bin/python3
which node                            # Output: /usr/local/bin/node
# Useful when you installed something and aren't sure if it worked

# whereis — Find the binary, source code, and manual page of a command
whereis nginx                         # Shows all locations related to nginx
```

#### Wildcards — Pattern Matching

Wildcards let you match multiple files at once using special characters. Think of them like "fill in the blank" for filenames.

```bash
# * (asterisk) — matches ANY number of ANY characters
ls *.txt                 # List all files ending in .txt
rm log_*.txt             # Delete all files starting with "log_" and ending in ".txt"
cp *.conf /backup/       # Copy all .conf files to /backup/

# ? (question mark) — matches EXACTLY ONE character
ls file?.txt             # Matches file1.txt, fileA.txt, fileZ.txt
                         # But NOT file10.txt (that's two characters where ? is)

# [] (square brackets) — matches any ONE character listed inside
ls file[123].txt         # Matches ONLY file1.txt, file2.txt, file3.txt
ls [A-Z]*.txt            # Matches files starting with any uppercase letter
ls [a-z][0-9].txt        # Matches files like a1.txt, b3.txt, z9.txt
```

#### Soft Links and Hard Links — Like Shortcuts but Better

**A link** is a pointer to another file or folder. Instead of copying a file to multiple places (wasting space), you create a link that points to the original.

**Soft link (symbolic link)** — like a Windows shortcut. It's just a pointer. If the original file is deleted, the link breaks (points to nothing).

**Hard link** — a second name for the same actual file data. Even if you delete the "original", the data still exists through the hard link.

```bash
# Create a soft link (most commonly used)
ln -s /etc/nginx/nginx.conf ~/nginx-shortcut.conf
# Now ~/nginx-shortcut.conf points to /etc/nginx/nginx.conf
# Editing either one edits the same file

ls -la ~/nginx-shortcut.conf
# Output: lrwxrwxrwx  nginx-shortcut.conf -> /etc/nginx/nginx.conf
# The -> shows it's a link pointing somewhere

# Create a hard link
ln /etc/hosts /tmp/hosts-copy
# Both /etc/hosts and /tmp/hosts-copy now refer to the same data

# Real DevOps use case — version management for tools
ln -s /opt/node-18.0.0/bin/node /usr/local/bin/node
# Now the command "node" works from anywhere
# When you upgrade to node-20, just update the link:
ln -sf /opt/node-20.0.0/bin/node /usr/local/bin/node
# Instant version switch — no reinstall needed
```

#### Practical Workflow Examples — Putting It All Together

These are real scenarios you will encounter regularly. Practice these end-to-end.

**Example 1 — Create a full project structure:**
```bash
# Create an organised project folder in one command
mkdir -p MyApp/{src,tests,docs,config,logs}
cd MyApp

# Create placeholder files
touch src/main.py src/utils.py
touch docs/README.md
touch config/settings.json

# See the whole structure
ls -R

# Write content into README
echo "# My DevOps App" > docs/README.md
echo "Deployed with Linux shell scripts" >> docs/README.md

# Verify the content
cat docs/README.md
```

**Example 2 — Work with log files like a real engineer:**
```bash
# Create a sample log
echo "[2026-03-22 10:00] Server started" > server.log
echo "[2026-03-22 10:01] User logged in" >> server.log
echo "[2026-03-22 10:02] ERROR: DB connection failed" >> server.log
echo "[2026-03-22 10:03] Request processed" >> server.log
echo "[2026-03-22 10:04] ERROR: Timeout" >> server.log

cat server.log              # View entire log
head -2 server.log          # See first 2 entries
tail -1 server.log          # See last entry
grep "ERROR" server.log     # Find all errors
grep "ERROR" server.log | wc -l   # Count errors: output = 2
```

**Example 3 — Clean up and organise files:**
```bash
# Create test files
touch report_jan.txt report_feb.txt report_mar.txt
touch old_data.log temp_cache.tmp

# Move reports to a folder
mkdir reports
mv report_*.txt reports/

# Delete temp files
rm *.tmp *.log

# Verify result
ls -la
ls reports/
```

**Example 4 — Quick command reference table:**

| Task | Command |
|---|---|
| Where am I? | `pwd` |
| List all files with details | `ls -lah` |
| Create nested folders | `mkdir -p a/b/c` |
| Create multiple files | `touch file{1..5}.txt` |
| Copy directory | `cp -r src/ dest/` |
| Delete without asking | `rm -rf folder/` |
| Watch log live | `tail -f logfile` |
| Count lines in file | `wc -l file.txt` |
| Find file by name | `find / -name "nginx.conf"` |
| Check file type | `file document.pdf` |
| Compare two files | `diff file1 file2` |

---

## ⚙️ 04. Linux Fundamentals — Permissions, Text Processing & Power Commands

This is the section where Linux stops feeling like just a file browser and starts feeling like a superpower. You will learn the permission system that controls security on every file, the text processing tools that let you search and transform any data in seconds, and how pipes chain simple commands together into complex workflows. These are the skills that make experienced Linux engineers so fast and effective.

#### Why Permissions Break Everything (Until You Understand Them)

"Permission denied" is the error every Linux beginner hits constantly. It is frustrating until you understand the permission system — then it becomes obvious and you rarely hit it again.

Every single file and directory on Linux has:
- An **owner** — one user who owns it
- A **group** — one group that has shared access
- **Permission bits** — three sets of read/write/execute for owner, group, and everyone else

When your Node.js app can't read a config file, when nginx gets a 403 forbidden, when your deploy script fails — it is almost always a permissions issue. Understanding this section will save you hours of debugging.

#### Why Text Processing is a DevOps Superpower

Think about what DevOps engineers do every day:
- Search through thousands of lines of logs to find one error
- Extract specific columns from monitoring output
- Replace values in config files during deployments
- Count how many times something happened
- Find which IP addresses hit a server the most

All of these tasks involve processing text. Linux has a collection of small, focused tools — `grep`, `awk`, `sed`, `cut`, `sort`, `uniq` — that each do one thing perfectly. Combine them with pipes and you can answer complex questions about any data in seconds, without writing a single line of Python or any other language.

```bash
# Example: Find the top 5 IP addresses hitting your server right now
# This single pipeline answers the question instantly:
cat /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -5
# Output:
#   1423 192.168.1.100
#    891 10.0.0.25
#    445 172.16.0.4
#    201 203.0.113.50
#     98 198.51.100.22
```

That one line reads a log file, extracts IP addresses, counts occurrences, sorts by frequency, and shows the top 5. No code. No script file. Just chained Linux tools. This is what makes Linux engineers fast.

#### The Golden Rule of Linux Commands

Before diving into individual commands, understand this pattern — it applies to literally every command you will ever use:

```
command   [options]   [arguments]

Examples:
  ls        -la         /home/daksh        (list files, long format, in /home/daksh)
  chmod     755         deploy.sh          (change permissions of deploy.sh to 755)
  grep      -r          "error"  /var/log  (search recursively for "error" in /var/log)
  cp        -r          source/  dest/     (copy entire directory)
```

Options modify **how** the command works. Arguments tell it **what** to work on. Master this pattern and you can reason about any new command you encounter.

### 🧩 Command Syntax & Getting Help

Every single Linux command follows the same pattern. Once you understand this pattern, you can figure out most commands even when you've never used them before.

```
command   [options/flags]   [arguments]

  ls          -la             /home/daksh
  chmod       755             myfile.sh
  grep        -r              "error"     /var/log/
  cp          -r              source/     destination/
```

- **Command** — the program you want to run
- **Options/flags** — modify HOW the command works. Start with `-` (single letter) or `--` (word)
- **Arguments** — what you're working ON (which file, which directory, which text)

**Getting help on any command — you never need to Google basic stuff:**
```bash
man ls               # Full manual page for ls (press q to quit, Space to scroll)
ls --help            # Quick summary of all options
whatis ls            # One sentence: what does ls do?
info ls              # Even more detailed than man (less common)
apropos "copy file"  # Search man pages by keyword — when you forget a command name
```

### 🔒 File Permissions — The Security System

Every single file and folder on Linux has a permission system controlling who can do what. Understanding this is critical — wrong permissions cause app failures, security vulnerabilities, and "permission denied" errors that confuse everyone at first.

**Every file has THREE sets of permissions:**

```
-  r w x   r - x   r - -
│   │ │ │   │ │ │   │ │ │
│   └─┴─┘   └─┴─┘   └─┴─┘
│   Owner   Group   Others
│
└── File type: - = regular file, d = directory, l = link
```

When you run `ls -la`, you see something like:
```
-rwxr-xr--  1  daksh  devops  4096  Mar 22  deploy.sh
```

Breaking this down:
```
- rwx r-x r--   1   daksh   devops   4096   Mar 22   deploy.sh
│ │││ │││ │││   │     │       │        │
│ │││ │││ │││   │     │       │        └── File size in bytes
│ │││ │││ │││   │     │       └─────────── Group that owns it
│ │││ │││ │││   │     └─────────────────── User (owner) of the file
│ │││ │││ │││   └───────────────────────── Number of hard links
│ │││ │││ └──────────────────────────────── Others: r-- = only read
│ │││ └──────────────────────────────────── Group: r-x = read + execute
│ └──────────────────────────────────────── Owner: rwx = full access
└────────────────────────────────────────── - means regular file
```

**The permission letters:**
- `r` = **read** — can look at the file's contents / can list directory contents
- `w` = **write** — can modify the file / can create/delete files in directory
- `x` = **execute** — can run the file as a program / can enter (cd into) a directory
- `-` = permission is NOT granted

**Converting to numbers (you'll see this everywhere):**
```
r = 4
w = 2
x = 1

rwx = 4+2+1 = 7   (full access — read, write, execute)
rw- = 4+2+0 = 6   (read and write, but NOT execute)
r-x = 4+0+1 = 5   (read and execute, but NOT write)
r-- = 4+0+0 = 4   (read only)
--- = 0+0+0 = 0   (no access at all)

So: chmod 755 means:
  7 → owner gets rwx (full access)
  5 → group gets r-x (read + execute)
  5 → others get r-x (read + execute)

And: chmod 644 means:
  6 → owner gets rw- (read + write)
  4 → group gets r-- (read only)
  4 → others get r-- (read only)
```

```bash
# chmod — CHange MODe (change permissions)
chmod 755 script.sh          # Make script executable by everyone
chmod 644 config.txt         # Owner can edit, everyone else can only read
chmod 600 private.key        # ONLY owner can read/write (SSH keys MUST be this)
chmod 777 file.txt           # Everyone can do everything (dangerous! avoid in production)
chmod +x deploy.sh           # Add execute permission without specifying numbers
chmod -w file.txt            # Remove write permission from everyone
chmod -R 755 /var/www/html/  # -R means recursive — apply to ALL files inside the folder

# Real situations you'll encounter:
chmod 600 ~/.ssh/id_rsa      # SSH private key — if this isn't 600, SSH refuses to work
chmod 755 /opt/app/start.sh  # Make deployment script runnable
chmod -R 644 /var/www/html/  # Web files — nginx can read but not execute
```

```bash
# chown — CHange OWNer (change who owns a file)
chown daksh file.txt              # Make 'daksh' the owner of file.txt
chown daksh:devops file.txt       # Change BOTH owner (daksh) AND group (devops)
chown -R nginx:nginx /var/www/    # Recursively make nginx own all web files
                                  # (important after copying web files manually)
chgrp devops file.txt             # Change ONLY the group, keep the same owner
```

#### Access Control Lists (ACL) — Fine-Grained Permissions

Normal permissions only let you set access for owner, group, and others. But what if you need to give one specific user access to a file without changing anything else? That's what ACL is for.

Imagine you have a file owned by root, but you want your deploy user to read it — without adding deploy to root's group. ACL solves this perfectly.

```bash
# Give user 'deploy' read+write access to a file
setfacl -m u:deploy:rw /etc/myapp/config.conf
# m = modify, u = user, deploy = username, rw = read+write

# Give an entire group read access to a directory
setfacl -m g:devops:r /opt/configs/

# View the ACL permissions on a file
getfacl /etc/myapp/config.conf
# Output will show both standard permissions AND the ACL entries

# Remove a specific ACL entry
setfacl -x u:deploy /etc/myapp/config.conf

# Remove ALL ACL entries from a file
setfacl -b /etc/myapp/config.conf
```

### ⚡ Text Processing — The DevOps Superpower

These commands are what separate Linux beginners from people who are actually productive. DevOps engineers use these dozens of times every day — to search logs, process config files, extract data from command outputs, and automate tasks.

```bash
# ── grep — search for patterns inside files ──────────────────────────────────
# grep scans files line by line and shows only lines that match a pattern
# Think of it like Ctrl+F in a text editor, but way more powerful

grep "error" /var/log/syslog              # Find all lines containing "error"
grep -i "error" /var/log/syslog           # -i = case insensitive (matches Error, ERROR, error)
grep -r "DB_PASSWORD" /etc/               # -r = recursive — search in ALL files in /etc/
grep -n "failed" auth.log                 # -n = show line numbers next to matches
grep -v "DEBUG" app.log                   # -v = invert — show lines that DON'T match
grep -c "error" app.log                   # -c = count — just tell me HOW MANY lines matched
grep -A 3 "ERROR" app.log                 # -A 3 = show 3 lines After each match (context!)
grep -B 3 "ERROR" app.log                 # -B 3 = show 3 lines Before each match

# Real use: find which file has a config value
grep -r "localhost" /etc/nginx/           # Which nginx config files mention localhost?

# ── awk — column processor, great for structured text ───────────────────────
# awk sees text as a table. $1 is first column, $2 is second, etc.
# Default separator is whitespace (spaces/tabs)

awk '{print $1}' access.log               # Print only first column of every line
awk '{print $1, $4}' access.log           # Print columns 1 and 4
awk -F: '{print $1}' /etc/passwd          # -F: means "use : as separator" — prints usernames
awk '{sum += $1} END {print sum}' nums.txt # Sum all numbers in first column
awk '/error/ {print $0}' app.log          # Print entire lines that contain "error"
awk 'NR > 5 {print}' file.txt             # NR = line number — print lines after line 5

# Real use: get just the IP addresses from nginx access log
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10
# → Shows top 10 IP addresses hitting your server

# ── sed — stream editor, finds and replaces text in files ────────────────────
# sed is like "Find and Replace" in Word, but works in scripts and on servers
# The pattern: sed 's/find_this/replace_with_this/flags'

sed 's/old_text/new_text/' file.txt        # Replace FIRST occurrence per line
sed 's/old_text/new_text/g' file.txt       # g = global → replace ALL occurrences
sed -i 's/localhost/prod-server/g' app.conf  # -i = edit file in place (actually changes the file)
sed '/^#/d' config.txt                     # Delete all lines starting with # (comments)
sed -n '5,10p' file.txt                    # Print ONLY lines 5 through 10 (-n = quiet mode)
sed 's/password=.*/password=HIDDEN/g'      # Hide sensitive values from output

# Real use: change a port number in a config file automatically in a script
sed -i 's/port=8080/port=3000/g' /etc/myapp/config.conf

# ── cut — extract specific columns from structured text ─────────────────────
cut -d: -f1 /etc/passwd                   # -d: = delimiter is colon, -f1 = first field → usernames
cut -d, -f2,4 report.csv                  # Get columns 2 and 4 from a CSV file
echo "hello world foo" | cut -d' ' -f2    # Get second word → "world"

# ── sort — sort lines alphabetically or numerically ──────────────────────────
sort file.txt                             # Alphabetical sort
sort -n numbers.txt                       # Numeric sort (10 comes after 9, not before 2)
sort -r file.txt                          # Reverse sort (Z to A)
sort -k2 file.txt                         # Sort by second column
sort -u file.txt                          # Sort + remove duplicates

# ── uniq — remove or count duplicate lines (must be sorted first!) ───────────
sort file.txt | uniq                      # Remove duplicate lines
sort file.txt | uniq -c                   # Count how many times each line appears
sort file.txt | uniq -d                   # Show ONLY the lines that appear more than once

# ── wc — word count (also counts lines and characters) ───────────────────────
wc -l file.txt                            # Count number of LINES
wc -w file.txt                            # Count number of WORDS
wc -c file.txt                            # Count number of BYTES (characters)

# Super common: how many errors are in this log?
grep "ERROR" app.log | wc -l
```

#### Pipes — The Magic That Connects Everything

The pipe `|` is arguably the most important concept in Linux. It takes the **output of one command** and feeds it directly as the **input of the next command**. This lets you chain simple commands together to do complex things.

Think of it like an assembly line. Raw material goes in one end, gets processed at each station, and a finished product comes out the other end.

```bash
# Simple example: find all error lines and count them
cat /var/log/app.log | grep "error" | wc -l
# 1. cat reads the file
# 2. grep filters only lines with "error"
# 3. wc -l counts how many lines are left
# Result: a single number telling you how many errors exist

# More complex: find the top 5 biggest files in /var
du -sh /var/* | sort -rh | head -5
# 1. du -sh gets the size of each item
# 2. sort -rh sorts by size, biggest first
# 3. head -5 shows only top 5

# Real DevOps: find top visiting IPs from nginx log
cat /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
# 1. cat reads the log
# 2. awk gets just the IP address (column 1)
# 3. sort puts same IPs together
# 4. uniq -c counts how many times each IP appears
# 5. sort -rn sorts by count, highest first
# 6. head -10 shows top 10
# Result: a clean list of your top 10 visitors!
```

#### Output Redirection — Saving and Routing Output

By default, command output goes to your screen. Redirection lets you send it somewhere else. This is fundamental to scripting and automation.

```bash
# > send output to a file (OVERWRITES the file if it exists)
ls -la > file-list.txt          # Save directory listing to a file
echo "APP_ENV=production" > .env  # Create a config file

# >> append to a file (ADDS to the end, doesn't overwrite)
echo "DB_HOST=localhost" >> .env  # Add another line
date >> deploy.log               # Add timestamp to log

# 2> redirect error messages (stderr = stream 2)
terraform apply 2> errors.log    # Save errors only, show normal output on screen

# 2>&1 redirect BOTH normal output AND errors to same place
# "2>&1" means "send stderr (2) to wherever stdout (1) is going"
./deploy.sh > output.log 2>&1    # Capture everything

# &> shortcut for same thing
./deploy.sh &> output.log        # Both stdout and stderr to file

# > /dev/null — throw output away completely (silence a command)
cron_script.sh > /dev/null 2>&1  # Run silently — no output anywhere

# tee — write to file AND show on screen at the same time
terraform plan | tee plan.txt    # See output AND save it

# < redirect input FROM a file
mysql -u root -p mydb < backup.sql   # Feed a SQL file into mysql
```

**Standard streams — three numbered channels:**
```
0 = stdin  — input (keyboard by default)
1 = stdout — normal output (screen by default)
2 = stderr — error output (screen by default)

You redirect them by number:
  > file        means  1> file   (redirect stdout)
  2> file                        (redirect stderr)
  2>&1                           (send stderr to wherever stdout goes)
```

#### Bash Keyboard Shortcuts — Work 10x Faster

These shortcuts work in any Linux terminal. Learning them is like learning to touch-type — small investment, massive daily payoff.

```
NAVIGATION — move cursor fast:
  Ctrl + A     → Jump to BEGINNING of line
  Ctrl + E     → Jump to END of line
  Alt + B      → Jump back one WORD
  Alt + F      → Jump forward one WORD

EDITING — fix typos fast:
  Ctrl + U     → Delete everything from cursor to BEGINNING of line
  Ctrl + K     → Delete everything from cursor to END of line
  Ctrl + W     → Delete the WORD before cursor
  Ctrl + Y     → Paste what you just deleted (it's in a clipboard)
  Ctrl + L     → Clear the screen (same as typing 'clear')

HISTORY — reuse previous commands:
  Ctrl + R     → Search through command history (type to filter)
  ↑ / ↓        → Scroll through previous commands
  Ctrl + P     → Previous command (same as ↑)
  Ctrl + G     → Cancel current history search
  !!           → Run the LAST command again
  sudo !!      → Run last command again WITH sudo (super useful!)

CONTROL:
  Ctrl + C     → Kill/cancel the current running command
  Ctrl + Z     → Suspend current command (send to background)
  Ctrl + D     → Exit current shell / logout
  Tab          → Autocomplete file/command name (press twice to see options)
```

#### cut — Extract Specific Columns from Text

`cut` is perfect for extracting specific columns from structured data like CSVs, logs, or command outputs. Think of it as "I only want column 2 and 4 from this table."

```bash
# cut uses -d for delimiter (what separates columns) and -f for field (column number)

cut -d',' -f2 employees.csv          # Get column 2 (names) from a CSV file
cut -d',' -f1,3 data.csv             # Get columns 1 AND 3
cut -d',' -f2-4 data.csv             # Get columns 2 THROUGH 4 (range)
cut -d':' -f1 /etc/passwd            # Get usernames (first field, colon-separated)
cut -d' ' -f1 access.log             # Get first word from each line

# Cut by character position instead of delimiter
cut -c1-5 file.txt                   # Get first 5 characters of each line
cut -c10-20 file.txt                 # Characters 10 through 20

# Real use: extract IPs from nginx log (first column)
cut -d' ' -f1 /var/log/nginx/access.log | sort | uniq -c | sort -rn | head
```

#### split — Break Large Files Into Smaller Parts

When you have a huge file that's too big to email, upload, or process at once, `split` breaks it into smaller chunks.

```bash
split -l 100 bigfile.txt part_        # Split into 100-line chunks → part_aa, part_ab...
split -b 10M largefile.tar.gz chunk_  # Split by size (10MB chunks)
split -n 5 file.txt piece_            # Split into exactly 5 equal parts

# Reassemble split files back into one
cat part_* > original_reassembled.txt

# Real use: split a huge log file for easier analysis
split -l 1000 /var/log/huge.log log_chunk_
wc -l log_chunk_*   # Verify each chunk has 1000 lines
```

#### shuf — Randomise Lines (Useful for Testing)

`shuf` randomly shuffles the lines of a file. Great for picking random samples from datasets.

```bash
shuf file.txt                    # Print lines in random order
shuf -n 5 file.txt               # Pick 5 random lines from the file
shuf -n 1 options.txt            # Pick 1 random line (random choice!)
shuf file.txt -o shuffled.txt    # Save shuffled output to a new file

# Real use: test with random sample of data
shuf -n 100 big_dataset.csv > sample.csv    # Random 100-row sample for testing
```

#### locate & updatedb — Fast File Search

`find` searches in real-time (slow on big filesystems). `locate` uses a pre-built database (much faster). Trade-off: the database may be slightly out of date.

```bash
locate nginx.conf                # Find nginx.conf anywhere on system instantly
locate -i filename               # Case-insensitive search
locate "*.log"                   # Find all .log files
locate /etc/*.conf               # Find .conf files specifically in /etc

# The database needs to be updated to know about new files
sudo updatedb                    # Update the locate database (run as root)
# Most systems run updatedb automatically once per day via cron

# When to use each:
# locate  → fast search, good when you know the filename, okay with slight delay
# find    → real-time, supports complex criteria (by size, date, permissions)
```



```bash
# tar — combine many files into one archive file
# Think of tar like putting many items into one box
# -c = create, -v = verbose (show what's happening), -f = filename, -z = gzip compress

tar -czvf mybackup.tar.gz /home/daksh/projects/
# Creates mybackup.tar.gz containing everything in projects/

tar -xzvf mybackup.tar.gz
# Extracts everything back out (-x = extract)

tar -xzvf mybackup.tar.gz -C /opt/
# Extract to a specific directory instead of current folder

tar -tvf mybackup.tar.gz
# Just LIST what's inside without extracting

# gzip — compress a single file (makes it smaller)
gzip largefile.txt           # Creates largefile.txt.gz and removes original
gunzip largefile.txt.gz      # Decompress back to original
gzip -k largefile.txt        # -k = keep original file (don't delete it)

# Real DevOps use case: compress logs before archiving
tar -czvf logs-$(date +%Y%m%d).tar.gz /var/log/myapp/
# The $(date +%Y%m%d) puts today's date in the filename automatically!

# truncate — make a file smaller or empty (without deleting it)
truncate -s 0 /var/log/app.log    # Empty the log file (keeps file, just removes content)
# Useful when a log file gets huge and you want to clear it without removing it
```

---

## 👤 05. System Administration

System administration is the day-to-day management of a Linux server. This is where you go beyond just navigating files — you start actually controlling the server. Editing config files with vi, managing who can log in, controlling which services run, monitoring what the server is doing, scheduling automated tasks, and setting environment variables for your applications. These are the hands-on skills of a working DevOps engineer.

#### What a DevOps Engineer Does on a Server Every Day

Here is a realistic picture of what server management actually looks like:

```
Morning check:
  → ssh into production server
  → check disk space: df -h
  → check running services: systemctl status nginx
  → tail the app log: journalctl -u myapp -f

During deployment:
  → edit config: vi /etc/myapp/config.conf
  → restart service: systemctl restart myapp
  → watch logs: journalctl -u myapp -f

User management:
  → new team member: useradd -m -G devops john
  → give sudo access: usermod -aG sudo john
  → set password: passwd john

Scheduling:
  → add backup job: crontab -e
  → verify it runs: tail -f /var/log/backup.log
```

Every single one of those tasks is covered in this section.

#### Understanding Users and Processes

Linux is fundamentally a **multi-user, multi-process** system. Multiple users can be logged in simultaneously. Hundreds of processes can be running at the same time. The OS carefully tracks who owns what and what is running.

As a DevOps engineer you need to understand:
- **Users** — each app, service, and person should have their own user account. nginx runs as the `nginx` user. Your app might run as a `deploy` user. This is a security practice — if nginx gets compromised, the attacker only has nginx's limited permissions, not root.
- **Processes** — every running program is a process with a PID (Process ID). Services are long-running processes managed by systemd. Understanding how to check, control, and kill processes is essential for debugging.
- **Services** — a service is a background process that starts automatically and keeps running. nginx, PostgreSQL, your app, SSH daemon — these are all services managed by `systemctl`.

#### The vi Editor is Non-Negotiable

Every other skill in this section you could theoretically do with alternative tools. But `vi` — you must know it. It is installed on every Linux system in existence, including the most minimal Docker containers and broken servers in recovery mode. When nothing else works, vi will be there. Learn the basics now and they will serve you for your entire career.

### ✏️ The vi/vim Editor — You Must Know This

`vi` is the text editor that exists on **every single Linux system** — even the most minimal Docker container, even broken systems in recovery mode. Other editors might not be installed. vi will always be there. So you must know at least the basics.

`vim` is "vi improved" — same commands, but with syntax highlighting, line numbers, and better features. Most systems have vim if you install it: `sudo apt install vim`.

**The most confusing thing about vi:** It has TWO modes. Most text editors just let you type. vi doesn't work like that. When you open vi, you're in **NORMAL mode** where keys are commands, not letters. You have to explicitly switch to **INSERT mode** to type text.

```
vi modes:

NORMAL MODE (default)    →    keys do commands (navigate, delete, copy, paste)
      │                              │
      │ press i, a, or o             │ press Escape
      ▼                              │
INSERT MODE              ←───────────┘
(actually type text here)
```

```bash
# Open a file in vi
vi filename.txt
vim filename.txt     # Opens with vim if installed (recommended)
```

```
Essential vi commands — practice these until they're muscle memory:

SWITCHING MODES:
  i          → Enter INSERT mode (cursor stays, type before current character)
  a          → Enter INSERT mode (type AFTER current character)
  o          → Enter INSERT mode on a NEW LINE below current line
  Esc        → Go back to NORMAL mode (press this whenever confused!)

SAVING AND QUITTING (must be in NORMAL mode):
  :w         → Save (write) the file
  :q         → Quit (only works if no unsaved changes)
  :wq        → Save AND quit (most common way to exit)
  :q!        → Quit WITHOUT saving — discard all changes (the "oh no" escape hatch)
  :wq!       → Force save and quit

NAVIGATION (NORMAL mode):
  h          → move left
  j          → move down
  k          → move up
  l          → move right
  gg         → jump to first line of file
  G          → jump to last line of file
  :42        → jump to line 42
  /searchterm → search forward for "searchterm" (press n for next match)

EDITING (NORMAL mode — these are commands, not typed text):
  dd         → delete entire current line (also cuts it)
  yy         → yank (copy) current line
  p          → paste below current line
  u          → undo last action
  Ctrl+r     → redo (undo the undo)
  x          → delete single character under cursor
  dw         → delete word

ADVANCED (very useful):
  :%s/old/new/g    → Find "old" and replace with "new" throughout entire file
                     Like Ctrl+H in Word but from keyboard
  :set number      → Show line numbers (useful when debugging)
  :set nonumber    → Hide line numbers
```

**Practice tip:** Open any text file with `vi practice.txt`, type `i` to enter insert mode, write some text, press `Esc`, then type `:wq` to save. Do this 5 times and you'll have the muscle memory.

#### nano — The Beginner-Friendly Editor

`nano` is a simple text editor that shows all its shortcuts at the bottom of the screen. It has no modes — you just open it and start typing immediately. Great for quick edits when you don't want to deal with vi.

```bash
nano filename.txt          # Open file in nano
nano /etc/nginx/nginx.conf # Edit a config file
```

Once inside nano, the bottom bar shows all controls:
```
^G = Help      ^O = Save     ^X = Exit
^K = Cut line  ^U = Paste    ^W = Search
^C = Show line number        ^\ = Find & Replace

(^ means Ctrl — so ^X means press Ctrl+X)
```

**Common nano workflow:**
```
1. Open:     nano myfile.txt
2. Edit:     just type — no mode switching needed
3. Save:     Ctrl+O → press Enter to confirm filename
4. Exit:     Ctrl+X
5. Save+Exit: Ctrl+X → it asks "save?" → press Y → Enter
```

**When to use nano vs vi:**
- Use `nano` when you're a beginner or making a quick one-line change
- Use `vi/vim` when you're on a server where nano isn't installed (it's always there)
- Use `vi/vim` for serious editing — it's faster once you know it

#### sed — Editing Files Without Opening Them

When you're writing scripts that need to modify config files automatically, you can't open vi interactively. `sed` lets you make edits from the command line — perfect for automation.

```bash
# Change a specific value in a config file (most common use)
sed -i 's/port=8080/port=3000/g' /etc/myapp/config.conf
# -i means "edit the actual file" (in-place)
# Without -i, sed just shows you what it would change without actually changing it

# Change a server address in all config files at once
sed -i 's/localhost/db.production.internal/g' /etc/myapp/*.conf

# Uncomment a line (remove the # at the beginning)
sed -i 's/^#ServerName/ServerName/' /etc/apache2/apache2.conf
# ^ means "start of line" — only removes # if it's the very first character

# Delete all blank lines from a file
sed -i '/^$/d' config.txt
# ^$ matches lines with nothing between start and end (empty lines)

# Add a new line AFTER a specific line (useful for config automation)
sed -i '/\[database\]/a max_connections = 100' /etc/myapp/settings.conf
# After the line containing [database], add the max_connections setting
```

### 👥 User & Group Management

Linux is a **multi-user system** — multiple people can have accounts on the same server, and each has their own home directory, permissions, and settings. As a DevOps engineer you'll regularly create users for apps, services, and teammates.

```bash
# ── Understanding the user database ─────────────────────────────────────────
cat /etc/passwd
# This file lists every user. One user per line. Format:
# username:x:UID:GID:description:home_dir:shell
# Example: daksh:x:1001:1001:Daksh Sainii:/home/daksh:/bin/bash
# The 'x' in position 2 means password is stored in /etc/shadow (encrypted)

cat /etc/group
# Lists all groups. Format: groupname:x:GID:member1,member2
# Example: devops:x:1002:daksh,john,deploy

# ── Adding users ─────────────────────────────────────────────────────────────
useradd john                              # Create user 'john' (minimal — no home dir on some systems)
useradd -m john                           # -m = create home directory at /home/john
useradd -m -s /bin/bash john              # Also set bash as their shell
useradd -m -s /bin/bash -G devops john    # Also add them to 'devops' group immediately
passwd john                               # Set a password for john (you'll be prompted)

# ── Modifying existing users ─────────────────────────────────────────────────
usermod -aG sudo john                     # Add john to sudo group (can now use sudo)
                                          # IMPORTANT: the -a means APPEND — without it
                                          # you'd REPLACE all their groups with just sudo!
usermod -aG docker john                   # Add to docker group (lets them run docker commands)
usermod -aG devops john                   # Add to devops group
usermod -s /bin/zsh john                  # Change their shell to zsh
usermod -l newjohn john                   # Rename user from john to newjohn

# ── Deleting users ───────────────────────────────────────────────────────────
userdel john                              # Delete user account (KEEPS their home directory)
userdel -r john                           # Delete user AND their home directory and mail

# ── Managing groups ──────────────────────────────────────────────────────────
groupadd devops                           # Create a new group called devops
groupdel devops                           # Delete a group

# ── Checking user info ───────────────────────────────────────────────────────
id john                                   # Shows john's UID, GID, and all groups
groups john                               # Shows just the groups john belongs to
who                                       # Who is currently logged into this server?
w                                         # Who is logged in AND what are they doing?
last                                      # History of all logins (good for security auditing)
lastb                                     # Failed login attempts (shows brute force attacks!)
```

#### sudo — Running Commands as Root Safely

**Root** is the superuser (administrator) of Linux. Root can do ANYTHING — install software, delete system files, change any setting. Working as root all the time is like performing surgery with a chainsaw — technically possible, but one wrong move is catastrophic.

`sudo` (Super User DO) lets you run a single command as root while staying logged in as a regular user. It logs everything you do. This is the safe, auditable way to do administrative tasks.

```bash
# Run a single command as root
sudo apt update
sudo systemctl restart nginx
sudo cat /etc/shadow              # Read a file only root can access

# What happens when you type sudo:
# 1. Linux checks if YOUR username is in the sudoers file
# 2. If yes, it asks for YOUR password (not root's password)
# 3. It logs what you did (in /var/log/auth.log)
# 4. It runs the command as root
# 5. You're back to your normal user immediately after

# Switch to the root user completely (use sparingly!)
sudo su -                         # Become root (- gives you root's environment too)
sudo -i                           # Same thing
exit                              # Exit back to your normal user

# Edit the sudoers configuration (who can use sudo and how)
sudo visudo                       # ALWAYS use visudo — it checks syntax before saving
                                  # Regular vi on /etc/sudoers can break sudo if you make a typo!

# Inside visudo, you can add:
# john ALL=(ALL:ALL) ALL                    # john can sudo any command
# deploy ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
# Above: deploy user can restart nginx without entering a password
# (useful for automated deployment scripts)
```

### ⚙️ Process Management

A **process** is any running program. When you start nginx, a process starts. When you run a Python script, that's a process. Understanding how to view, manage, and kill processes is essential for debugging and server management.

```bash
# ps — Process Status — snapshot of currently running processes
ps                                # Shows only processes in YOUR current terminal session
ps aux                            # Shows ALL processes from ALL users
                                  # a = all users, u = show user/owner, x = include processes without terminal
ps aux | grep nginx               # Find the nginx process specifically

# Output columns for ps aux:
# USER  PID  %CPU  %MEM  VSZ  RSS  TTY  STAT  START  TIME  COMMAND
# USER = who started it, PID = process ID number (you need this to kill it)
# %CPU and %MEM = how much resources it's using

# top — Live real-time process monitor (like Task Manager)
top                               # Press q to quit, M to sort by memory, P to sort by CPU
htop                              # Better version of top with colors and mouse support (install separately)

# Stopping processes
kill 1234                         # Send SIGTERM (polite "please stop") to process ID 1234
                                  # Most well-written programs will clean up and exit gracefully
kill -9 1234                      # Send SIGKILL (force kill — process cannot refuse this)
                                  # Use only if normal kill doesn't work — the process has no chance to clean up
killall nginx                     # Kill all processes named nginx (by name instead of PID)
pkill -f "python myapp.py"        # Kill by matching against the full command

# Managing services with systemctl (the modern way)
# A service is a background process that starts automatically and runs continuously
systemctl start nginx             # Start the nginx web server
systemctl stop nginx              # Stop nginx
systemctl restart nginx           # Stop then start (use when you change config)
systemctl reload nginx            # Reload config WITHOUT stopping (zero downtime!)
systemctl status nginx            # Is it running? Show recent log messages
systemctl enable nginx            # Make nginx start automatically when server boots
systemctl disable nginx           # Don't auto-start on boot
systemctl list-units --type=service --state=running  # Show all currently running services

# Viewing service logs
journalctl -u nginx               # All logs for nginx service
journalctl -u nginx -f            # Follow nginx logs in real-time (like tail -f)
journalctl -u nginx --since "1 hour ago"  # Only last hour's logs
journalctl -b                     # All logs from current boot (great for debugging startup issues)

# Background jobs — running things without blocking your terminal
./long-running-script.sh &        # The & at the end runs it in the background
                                  # Your terminal prompt comes back immediately
jobs                              # Show what's running in the background
fg 1                              # Bring background job #1 back to foreground
Ctrl+Z                            # Suspend (pause) the current foreground job
bg                                # Resume the paused job in the background

nohup ./script.sh &               # Run in background AND keep running after you log out
                                  # Without nohup, background jobs die when you close SSH
```

### ⏰ Scheduling with Crontab

**Cron** is a scheduler that runs commands automatically at specified times. It's how servers run backups at 2am, send reports every Monday, and clean up logs every week — without anyone manually doing it.

```bash
crontab -e                        # Edit your scheduled jobs (opens in vi)
crontab -l                        # List your current scheduled jobs
sudo crontab -e                   # Edit root's scheduled jobs

# Crontab format — 5 time fields then the command:
# ┌────────── minute (0-59)
# │ ┌──────── hour (0-23)
# │ │ ┌────── day of month (1-31)
# │ │ │ ┌──── month (1-12)
# │ │ │ │ ┌── day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
# │ │ │ │ │
# * * * * *  command to run

# * means "every" — so * in the minute field means "every minute"

# Real examples:
0 2 * * *    /opt/backup.sh                    # 2:00am every day
*/5 * * * *  /opt/healthcheck.sh               # Every 5 minutes
0 0 * * 0    /opt/weekly-cleanup.sh            # Midnight every Sunday
0 9 * * 1-5  /opt/send-report.sh               # 9am Monday through Friday
0 */6 * * *  /opt/sync-data.sh                 # Every 6 hours
30 3 1 * *   /opt/monthly-report.sh            # 3:30am on the 1st of every month

# Always redirect output in crontab — otherwise errors get silently swallowed
0 2 * * * /opt/backup.sh >> /var/log/backup.log 2>&1
# >> appends to log, 2>&1 captures both normal output AND errors
```

#### System Monitoring — Keeping an Eye on Your Server

```bash
# CPU and memory
top                               # Live view — see everything changing in real time
free -h                           # Memory usage — how much RAM is used vs free
                                  # -h = human readable (shows GB/MB instead of bytes)

# Disk space — VERY important. Servers crash when disk fills up!
df -h                             # Show disk usage for all mounted filesystems
df -h /var                        # Disk usage for specific path
du -sh /var/log/                  # How big is this specific folder?
du -sh /var/log/* | sort -rh      # Sort everything in /var/log/ by size (biggest first)
                                  # Great for finding what's eating your disk space

# System information
uname -a                          # Everything: kernel version, OS, architecture
uname -r                          # Just the kernel version number
cat /etc/os-release               # What Linux distro and version is this?
hostname                          # What is this server's name?
uptime                            # How long has server been running? What's the load?
arch                              # CPU architecture (x86_64 or arm64)

# Load average (shown in uptime output)
# Three numbers like "0.50, 0.75, 1.00"
# 1-minute average, 5-minute average, 15-minute average
# On a single-CPU server: load of 1.0 = 100% busy, 0.5 = 50% busy
# On a 4-CPU server: load of 4.0 = 100% busy

# Network ports — what's listening on this server?
netstat -tulpn                    # t=TCP, u=UDP, l=listening, p=process name, n=numeric ports
ss -tulpn                         # Same thing but faster (modern replacement for netstat)
lsof -i :80                       # What specific process is using port 80?
lsof -i :3000                     # Is my app actually listening on port 3000?
```

#### Environment Variables — Configuration Without Hardcoding

**Environment variables** are named values that exist in your shell session and can be read by any program you run. They're the standard way to configure applications without putting sensitive values (passwords, API keys) directly in your code.

Think of them like sticky notes on your desk. Any program you run can read any sticky note. When you close the terminal, the sticky notes disappear.

```bash
# View all current environment variables
env                               # Shows ALL of them (there are many!)
printenv PATH                     # Show just one specific variable

# The most important built-in variables:
echo $HOME                        # Your home directory (/home/daksh)
echo $USER                        # Your username
echo $PATH                        # List of directories where Linux looks for commands
echo $SHELL                       # Which shell you're using (/bin/bash)
echo $PWD                         # Current directory (same as running pwd)

# Setting variables — two ways:
MY_VAR="hello"                    # Set variable for this shell ONLY
export MY_VAR="hello"             # Set variable AND make it available to programs you run
                                  # Without export, programs you start can't see the variable!

# Real DevOps usage:
export NODE_ENV=production
export DATABASE_URL="postgresql://user:pass@db:5432/myapp"
export AWS_REGION=us-east-1
node server.js                    # node will read these variables on startup

# Making variables permanent (they disappear when terminal closes otherwise):
# Add to ~/.bashrc (runs every time you open a terminal)
echo 'export JAVA_HOME=/opt/java/17' >> ~/.bashrc
echo 'export PATH=$PATH:/opt/myapp/bin' >> ~/.bashrc
source ~/.bashrc                  # Apply changes immediately without logging out
# source "re-reads" the file as if you just opened a fresh terminal
```

---

## 🐚 06. Shell Scripting — Automating Everything

Shell scripting is where Linux goes from powerful to unstoppable. Instead of typing commands one by one, you write scripts that do it all automatically — deploy apps to multiple servers, check server health every 5 minutes, back up databases at 2am, process logs and send alerts. Every DevOps automation task starts with a shell script.

#### Why Shell Scripting is the First Automation Skill to Learn

Before Ansible, before Terraform, before any fancy automation tool — there was the shell script. And shell scripts are still everywhere in DevOps because:

- **They need nothing extra installed** — bash is on every Linux system
- **They run anywhere** — any server, any cloud, any CI/CD runner
- **They compose perfectly** — every Linux command you already know works inside a script
- **CI/CD pipelines are shell scripts** — GitHub Actions, Jenkins, GitLab CI all run shell commands

When a senior DevOps engineer needs to automate something quickly, they reach for a shell script first. It is the fastest path from "I need to automate this" to "it's automated".

#### What Shell Scripting Actually Looks Like in Practice

Here is a realistic deployment script — this is the kind of thing you will write at a real job:

```bash
#!/bin/bash
# deploy.sh — Deploy new version of the app to all web servers

VERSION=$1                                    # Get version from command line
SERVERS=("web01.prod" "web02.prod" "web03.prod")
LOG="/var/log/deployments.log"

if [ -z "$VERSION" ]; then
    echo "ERROR: Please provide a version. Usage: ./deploy.sh v1.4.2"
    exit 1
fi

echo "Starting deployment of version $VERSION at $(date)" | tee -a $LOG

for SERVER in "${SERVERS[@]}"; do
    echo "Deploying to $SERVER..."
    scp -i ~/.ssh/deploy.pem app-$VERSION.tar.gz deploy@$SERVER:/opt/
    ssh -i ~/.ssh/deploy.pem deploy@$SERVER "
        cd /opt/
        tar -xzf app-$VERSION.tar.gz
        sudo systemctl restart myapp
        sleep 3
        systemctl is-active --quiet myapp && echo 'OK' || echo 'FAILED'
    "
done

echo "Deployment complete at $(date)" | tee -a $LOG
```

Run it like: `./deploy.sh v1.4.2` — it deploys to all 3 servers automatically with logging.

#### The Shell vs Shell Script

**Interactive shell** — what you use when you type commands directly in the terminal. It runs one command, shows the result, waits for the next.

**Shell script** — a file containing multiple commands that runs from top to bottom automatically. You can add logic (if/else), loops (for/while), variables, and functions.

The key difference: scripts run non-interactively. They can't ask you "are you sure?" in the middle of a CI/CD pipeline. They must handle errors themselves, check their own preconditions, and exit with the right status code (0 = success, non-zero = failure) so the pipeline knows what happened.

#### What is a Shell?

The **shell** is the program that reads your commands and translates them for the Linux kernel. The kernel manages hardware — you never talk to it directly. The shell is your interpreter sitting between you and the kernel.

```
You type a command
      ↓
Shell (bash) reads and interprets it
      ↓
Shell tells the Kernel what to do
      ↓
Kernel talks to hardware (CPU, disk, network)
      ↓
Result comes back through the shell to you
```

**Types of shells:**
- `bash` — Bourne Again Shell — default on most Linux, what you should learn first
- `zsh` — Z Shell — default on macOS, more features, popular with developers
- `sh` — original Bourne Shell — minimal, used in scripts for maximum portability
- `fish` — friendly shell, great autocomplete but non-standard syntax

Check your current shell: `echo $SHELL`

### 🐚 Shell Types & How the Shell Works

The **shell** is the program that reads your commands and translates them for the Linux kernel. The kernel is the core of the OS — it talks directly to hardware. You never interact with the kernel directly. The shell is your interpreter.

```
You type a command
      ↓
Shell (bash) reads it and interprets it
      ↓
Shell tells the Kernel what to do
      ↓
Kernel talks to hardware (CPU, disk, network)
      ↓
Kernel sends result back to shell
      ↓
Shell shows you the output
```

**Types of shells** — they all do the same basic job but have different features:

- **bash** (Bourne Again Shell) — the default on most Linux distros. What you've been using.
- **zsh** (Z Shell) — default on macOS. Better autocomplete, more plugins. Popular with developers.
- **sh** (Bourne Shell) — the original, very minimal. Used in scripts that need to run everywhere.
- **fish** (Friendly Interactive Shell) — beautiful autocomplete, but non-standard syntax.

Check your current shell:
```bash
echo $SHELL              # Shows path to your shell e.g. /bin/bash
cat /etc/shells          # Lists all shells installed on the system
chsh -s /bin/zsh         # Change your default shell to zsh
```

### 📜 What is Shell Scripting?

A **shell script** is a text file containing a sequence of shell commands. Instead of typing 20 commands one by one every time you deploy your app, you put them all in a script and run the script once. It's automation at its simplest and most powerful level.

Every script starts with a **shebang line** — this tells the OS which interpreter to use:

```bash
#!/bin/bash
# The shebang is always the very first line
# #!/bin/bash means "use bash to run this file"
# #!/bin/sh would use sh (more portable but fewer features)
# #!/usr/bin/env python3 would use Python (same idea, different language)

# Lines starting with # are comments — ignored when running, but important for humans reading the code!
echo "Hello DevOps World!"        # This will print to the terminal
```

```bash
# To run a script:
chmod +x myscript.sh              # Step 1: make it executable (only needed once)
./myscript.sh                     # Step 2: run it (the ./ means "in current directory")
bash myscript.sh                  # Alternative: explicitly use bash to run it
```

### 📦 Variables in Scripts

```bash
#!/bin/bash

# Variables — store values you want to reuse
# RULES: no spaces around =, variable names usually UPPERCASE by convention
NAME="Daksh"
PORT=3000
SERVER_IP="192.168.1.10"

# Use a variable by putting $ before the name
echo "Hello $NAME"                           # Output: Hello Daksh
echo "Server running on port $PORT"          # Output: Server running on port 3000
echo "Connecting to $SERVER_IP:$PORT"        # Both in same string

# Command substitution — store the OUTPUT of a command in a variable
# $( command ) runs the command and uses its output
TODAY=$(date +%Y-%m-%d)                      # Today's date like 2024-03-22
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')  # Current disk usage percentage
FREE_MEMORY=$(free -m | awk 'NR==2 {print $4}') # Free memory in MB

echo "Today is $TODAY"
echo "Disk is $DISK_USAGE full"
echo "Free memory: ${FREE_MEMORY}MB"          # {} to separate variable from text

# Reading user input — ask the person running the script for information
read -p "Enter your name: " USERNAME          # -p shows a prompt message
echo "Hello, $USERNAME!"

read -sp "Enter password: " PASSWORD          # -s = silent (doesn't echo what you type)
echo ""                                        # Print blank line after password input
echo "Password received (length: ${#PASSWORD})"  # ${#VAR} = length of variable

# Special automatic variables — always available in scripts
echo "Script name: $0"                        # Name of this script file
echo "First argument: $1"                     # First thing after script name when you ran it
echo "Second argument: $2"                    # Second argument
echo "All arguments: $@"                      # All arguments as separate items
echo "Number of arguments: $#"               # How many arguments were given
echo "Last command's exit code: $?"           # 0 = last command succeeded, non-zero = failed
echo "Current process ID: $$"                 # PID of this running script
```

### 🔀 If-Then — Making Decisions

Scripts need to make decisions based on conditions. If-then statements let your script behave differently depending on what's happening.

```bash
#!/bin/bash

# Basic if-else structure
AGE=20

if [ $AGE -ge 18 ]; then           # -ge means "greater than or equal to"
    echo "You are an adult"
else
    echo "You are a minor"
fi                                  # All if blocks must end with 'fi' (if backwards!)

# Number comparison operators — always use these for numbers:
# -eq   equal to           (= would work differently in some cases)
# -ne   NOT equal to
# -gt   greater than
# -lt   less than
# -ge   greater than or equal to
# -le   less than or equal to

# if-elif-else — multiple conditions
SCORE=75

if [ $SCORE -ge 90 ]; then
    echo "Grade: A — Excellent!"
elif [ $SCORE -ge 75 ]; then
    echo "Grade: B — Good work"
elif [ $SCORE -ge 60 ]; then
    echo "Grade: C — Passing"
else
    echo "Grade: F — Please retry"
fi

# String comparison — comparing text values
ENVIRONMENT="production"

if [ "$ENVIRONMENT" = "production" ]; then     # Always quote string variables!
    echo "PRODUCTION MODE — extra care required"
elif [ "$ENVIRONMENT" = "staging" ]; then
    echo "Staging environment"
else
    echo "Development environment"
fi

# Checking if a file or directory exists — very common in DevOps scripts
if [ -f "/etc/nginx/nginx.conf" ]; then        # -f checks if FILE exists
    echo "Nginx config found — nginx is installed"
else
    echo "Nginx not installed — installing now..."
    sudo apt install nginx -y
fi

if [ -d "/opt/myapp" ]; then                   # -d checks if DIRECTORY exists
    echo "App directory already exists"
else
    echo "Creating app directory..."
    mkdir -p /opt/myapp
fi

# Common file test operators:
# [ -f file ]    file exists and is a regular file
# [ -d path ]    path exists and is a directory
# [ -e path ]    path exists (file OR directory)
# [ -r file ]    file exists and is readable
# [ -w file ]    file exists and is writable
# [ -x file ]    file exists and is executable
# [ -z "$VAR" ]  variable is empty (zero length)
# [ -n "$VAR" ]  variable is NOT empty (non-zero length)

# Real DevOps example: check if service is running before doing something
if systemctl is-active --quiet nginx; then
    echo "Nginx is running — proceeding with deployment"
    # ... deployment commands ...
else
    echo "ERROR: Nginx is not running — starting it first"
    sudo systemctl start nginx
fi
```

### 🔁 For Loops

Loops let you perform the same action on multiple items — multiple servers, multiple files, multiple values — without copy-pasting commands.

```bash
#!/bin/bash

# Loop over a simple list of words
for FRUIT in apple banana mango grape; do
    echo "I like $FRUIT"
done
# do ... done wraps the commands to repeat

# Loop over a list of servers — hugely useful for DevOps
for SERVER in web01 web02 web03 db01; do
    echo "Checking connectivity to $SERVER..."
    ping -c 1 $SERVER > /dev/null && echo "$SERVER is UP" || echo "$SERVER is DOWN"
done

# Loop over files matching a pattern
for LOGFILE in /var/log/*.log; do
    echo "Compressing: $LOGFILE"
    gzip $LOGFILE
done

# Loop over a range of numbers
for NUMBER in {1..10}; do
    echo "Processing item $NUMBER"
done

# Loop over an array (collection of values)
SERVERS=("10.0.1.10" "10.0.1.11" "10.0.1.12")
for IP in "${SERVERS[@]}"; do
    echo "Deploying to server: $IP"
    ssh deploy@$IP "sudo systemctl restart myapp"
    echo "Done with $IP"
done

# C-style for loop (like in programming languages)
for ((i=1; i<=5; i++)); do
    echo "Count: $i"
done

# Real-world deployment script — deploy to multiple servers
SERVERS=("web01.prod" "web02.prod" "web03.prod")
VERSION=$1                            # Get version from command line argument

for SERVER in "${SERVERS[@]}"; do
    echo "━━━ Deploying v$VERSION to $SERVER ━━━"
    scp -i ~/.ssh/deploy.pem myapp-v${VERSION}.tar.gz deploy@$SERVER:/opt/
    ssh -i ~/.ssh/deploy.pem deploy@$SERVER "
        cd /opt/
        tar -xzf myapp-v${VERSION}.tar.gz
        sudo systemctl restart myapp
        sleep 2
        systemctl is-active myapp && echo 'Service started OK' || echo 'SERVICE FAILED!'
    "
done
echo "Deployment complete for all servers!"
```

### 🔄 While Loops

```bash
#!/bin/bash

# While loop — keeps running WHILE the condition is true
# Great for "keep trying until it works" or "keep running until told to stop"

COUNTER=1
while [ $COUNTER -le 5 ]; do
    echo "Loop iteration: $COUNTER"
    COUNTER=$((COUNTER + 1))          # $((math)) is bash arithmetic
done

# Real DevOps use case: Wait for a service to become ready
echo "Waiting for database to be ready..."
ATTEMPTS=0
MAX_ATTEMPTS=30

while ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS + 1))
    echo "Attempt $ATTEMPTS/$MAX_ATTEMPTS — database not ready yet..."
    sleep 2

    if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
        echo "ERROR: Database never became ready after $MAX_ATTEMPTS attempts"
        exit 1                        # Exit script with error code
    fi
done
echo "Database is ready! Continuing..."

# Infinite loop — runs forever until you break out
while true; do
    echo "Checking server health at $(date)"
    curl -s http://localhost:3000/health > /dev/null || echo "ALERT: Health check failed!"
    sleep 60                          # Wait 1 minute before checking again
done
```

### 🎯 Case Statement

```bash
#!/bin/bash

# case is like a cleaner version of many if-elif statements
# Great when you have one variable that can be several different values

ENV=$1                                # Get environment from command line argument

case $ENV in
    dev|development)                  # matches "dev" OR "development"
        DB_HOST="localhost"
        DEBUG="true"
        LOG_LEVEL="debug"
        echo "Starting in DEVELOPMENT mode"
        ;;                            # ;; marks end of each case (like 'break' in other languages)

    staging)
        DB_HOST="staging-db.internal"
        DEBUG="false"
        LOG_LEVEL="info"
        echo "Starting in STAGING mode"
        ;;

    prod|production)
        DB_HOST="prod-db.internal"
        DEBUG="false"
        LOG_LEVEL="warn"
        echo "Starting in PRODUCTION mode — be careful!"
        ;;

    *)                                # * is the default case — matches anything not matched above
        echo "ERROR: Unknown environment '$ENV'"
        echo "Usage: $0 [dev|staging|prod]"
        exit 1
        ;;
esac

export DB_HOST DEBUG LOG_LEVEL
node server.js                        # Start the app with the right config
```

#### Aliases — Your Personal Shortcuts

An **alias** is a shortcut name for a longer command. Instead of typing `kubectl get pods -n production` every time, you can make it just `kgpp`.

```bash
# Add these to your ~/.bashrc file to make them permanent:

# General shortcuts everyone uses
alias ll='ls -la'                           # ll shows full details including hidden files
alias la='ls -A'                            # la shows all files including hidden
alias ..='cd ..'                            # .. to go up one level
alias ...='cd ../..'                        # ... to go up two levels

# Make dangerous commands safer
alias rm='rm -i'                            # -i asks "are you sure?" before every deletion
alias cp='cp -i'                            # Warn before overwriting

# Color output
alias grep='grep --color=auto'              # Highlight matches in color
alias ls='ls --color=auto'                  # Color-coded file types

# DevOps shortcuts you'll use every day
alias k='kubectl'                           # k instead of kubectl
alias kgp='kubectl get pods'               # Get all pods
alias kgpa='kubectl get pods -A'           # Get pods in ALL namespaces
alias kgs='kubectl get services'           # Get services
alias kgn='kubectl get nodes'              # Get nodes
alias tf='terraform'                        # tf instead of terraform
alias tfp='terraform plan'                  # Quick plan
alias tfa='terraform apply'                 # Quick apply
alias dc='docker compose'                   # dc instead of docker compose
alias dps='docker ps'                       # List containers

# Apply aliases without logging out
source ~/.bashrc
# OR close and reopen your terminal

# Check what a command alias actually does
type kgp                                    # Output: kgp is aliased to 'kubectl get pods'
alias                                       # List ALL currently active aliases
```

---

## 🌐 07. Networking, Servers and System Updates

A Linux server that can't communicate with the network is completely useless. Networking knowledge is what allows you to connect servers together, expose apps to the internet, secure access, transfer files, and keep software up to date. This section covers the networking skills every DevOps engineer uses constantly — from basic connectivity checks to SSH keys, nginx reverse proxying, and firewall management.

#### Why Networking is Core to DevOps

Almost every task in DevOps involves networking at some level:

```
Task                                    Networking skill needed
──────────────────────────────────────────────────────────────
SSH into a server                     → SSH, key authentication
Deploy code to a server               → SCP or rsync over SSH
App can't connect to database         → netstat, firewall rules, DNS
Set up a web server                   → nginx, ports 80/443, firewall
Pull a Docker image                   → outbound internet, DNS, HTTPS
CI/CD runner deploying to EC2         → SSH keys, security groups
Debug "connection refused" error      → netstat, lsof, ping, telnet
Server clocks out of sync             → NTP / chrony
```

You will encounter every one of these situations. This section gives you the tools to handle all of them.

#### How Linux Identifies Itself on a Network

Every Linux server has:

- **Hostname** — the server's name (`webserver-prod-01`). Used for identification in logs and monitoring.
- **IP address** — the numerical network address (`192.168.1.100`). Used for actual communication.
- **Network interface** — the virtual or physical network card (`eth0`, `ens5`). Each interface has its own IP.
- **DNS resolver** — the service that converts names like `google.com` to IP addresses. Configured in `/etc/resolv.conf`.

```bash
# Quick network overview — run these when you first SSH into any new server
hostname                   # What is this server called?
ip addr show               # What IP addresses does it have?
cat /etc/resolv.conf       # What DNS server is it using?
netstat -tulpn             # What ports is it listening on?
curl -s ifconfig.me        # What is its public IP? (if internet connected)
```

These 5 commands give you an instant picture of a server's network configuration. Make them a habit.

#### The SSH Key Workflow — How Professional Access Works

In production environments, nobody uses passwords to SSH into servers. Passwords can be brute-forced, leaked, or forgotten. SSH keys are cryptographically secure and the industry standard.

The concept is simple:
- You generate a **key pair** — a private key (stays on your laptop, never shared) and a public key (safe to share, goes on servers)
- When you connect, your machine proves it has the private key without ever sending it over the network
- The server checks against the stored public key — if they match, access granted, no password needed

This is how AWS EC2, GCP, Azure, and every serious production environment works. You will set this up once and use it for your entire career.

### 🌐 Network Interfaces & Connectivity

Every server on a network has a **network interface** — the virtual (or physical) network card that connects it to the network. Each interface has an IP address. Understanding how to check and configure these is essential for any server work.

```bash
# View network interfaces and their IP addresses
ip addr show                       # Modern command — shows all interfaces and IPs
ip addr show eth0                  # Show specific interface called eth0
ifconfig                           # Classic command (may need net-tools: sudo apt install net-tools)

# Common interface names you'll see:
# eth0, eth1    → traditional names for wired network cards
# ens3, ens5    → newer naming convention (on AWS it's often ens5)
# lo            → loopback interface — always 127.0.0.1 — your computer talking to itself
# docker0       → Docker's virtual network interface (appears after installing Docker)

# Test if you can reach another server
ping google.com                    # Keep pinging until you press Ctrl+C
ping -c 4 google.com               # Send exactly 4 packets then stop
ping -c 1 -W 2 192.168.1.1         # -W 2 = timeout after 2 seconds (for scripts)

# If ping works: you have network connectivity
# If ping fails: could be firewall, DNS, or actual network issue
```

#### DNS — How Names Become IP Addresses

**DNS** (Domain Name System) is the internet's phone book. Computers communicate using IP addresses (like 142.250.185.46), but humans use names (like google.com). DNS translates between the two.

When you type google.com in your browser, your computer asks a DNS server "what's the IP address for google.com?" and then connects to that IP.

```bash
# nslookup — basic DNS lookup
nslookup google.com                # What IP does google.com resolve to?
nslookup -type=MX gmail.com        # What are Gmail's mail servers?

# dig — more detailed DNS information
dig google.com                     # Full DNS query output
dig +short google.com              # Just the IP address, no extra info
dig google.com A                   # Get the IPv4 address record
dig google.com MX                  # Get mail server records
dig @8.8.8.8 google.com           # Query Google's public DNS server specifically

# Check what DNS servers your system is using
cat /etc/resolv.conf               # Your DNS configuration
# nameserver 8.8.8.8 means you're using Google's DNS

# hosts file — your local DNS overrides (takes priority over DNS servers!)
cat /etc/hosts                     # View local hostname mappings
sudo vi /etc/hosts                 # Add: 192.168.1.50  myserver.local
# Now "myserver.local" resolves to 192.168.1.50 on THIS machine only
# Used for local development to pretend a domain points to your dev server

# Hostname management
hostname                           # Show current hostname
sudo hostnamectl set-hostname myserver-prod   # Change hostname permanently
hostnamectl status                 # Full hostname details including OS info
```

### 🔑 SSH Keys — Passwordless Access

Passwords for SSH are insecure and annoying. SSH keys are cryptographically secure, passwordless (after setup), and the standard for all professional server access.

**How SSH keys work:**
You generate a **key pair** — two mathematically linked keys:
- **Private key** → stays on YOUR laptop, NEVER share it with anyone
- **Public key** → you put this on every server you want to access

When you SSH to a server, your computer proves it has the private key (without ever sending it over the network). The server checks against the public key. If they match, you're in — no password needed.

```bash
# Generate a new SSH key pair
ssh-keygen -t ed25519 -C "daksh@devops-network.com"
# -t ed25519 = use the Ed25519 algorithm (modern, secure, small)
# -C = comment (usually your email — helps you identify the key later)
# You'll be asked where to save it (press Enter for default: ~/.ssh/id_ed25519)
# You'll be asked for a passphrase (optional but recommended — adds another layer)

# This creates two files:
# ~/.ssh/id_ed25519      → YOUR PRIVATE KEY — guard this like a password
# ~/.ssh/id_ed25519.pub  → Public key — safe to share, goes on servers

# Copy your public key to a server (sets up passwordless access)
ssh-copy-id -i ~/.ssh/id_ed25519.pub daksh@192.168.1.100
# It asks for your current SSH password once, then adds your key to ~/.ssh/authorized_keys on the server
# After this: ssh daksh@192.168.1.100 → no password needed!

# For AWS EC2 — they give you a .pem key file instead
chmod 400 my-aws-key.pem           # MUST set this permission — SSH refuses to use keys that are too open
ssh -i my-aws-key.pem ec2-user@54.123.456.789

# SSH config file — create shortcuts for servers you access often
vi ~/.ssh/config

# Add entries like this:
# Host webserver
#     HostName 54.123.456.789
#     User ec2-user
#     IdentityFile ~/.ssh/my-aws-key.pem
#
# Host db-server
#     HostName 10.0.1.50
#     User ubuntu
#     IdentityFile ~/.ssh/id_ed25519
#     Port 2222

# Now instead of:
# ssh -i ~/.ssh/my-aws-key.pem ec2-user@54.123.456.789
# You just type:
ssh webserver
# Much cleaner!
```

#### File Transfer Between Servers

```bash
# SCP (Secure Copy) — copy files over SSH
# Syntax: scp source destination
# Use user@host:/path for remote locations

scp config.txt daksh@192.168.1.100:/home/daksh/    # Upload to server
scp daksh@192.168.1.100:/var/log/app.log ./         # Download from server
scp -r ./my-app/ daksh@192.168.1.100:/opt/          # Upload entire directory (-r)
scp -i key.pem config.txt ec2-user@ip:/opt/         # Upload using key file

# rsync — smarter file sync (only transfers what changed)
# Much better than scp for large directories because it's incremental
rsync -avz ./website/ daksh@server:/var/www/html/
# -a = archive mode (preserves permissions, timestamps, etc.)
# -v = verbose (show what's happening)
# -z = compress during transfer (faster on slow connections)

rsync -avz --delete ./website/ daksh@server:/var/www/html/
# --delete removes files on the server that no longer exist locally
# Perfect for keeping websites in sync

# wget — download files from the internet
# Simple and reliable, resumes downloads if interrupted
wget https://releases.hashicorp.com/terraform/1.7.5/terraform_1.7.5_linux_amd64.zip
wget -O terraform.zip https://...                   # Save with custom name
wget -c https://example.com/large_file.iso          # -c = continue/resume interrupted download
wget -r https://example.com/docs/                   # Download entire website directory

# curl — transfer data to/from servers (more versatile than wget)
# Used constantly for API calls, downloading, testing endpoints
curl -O https://example.com/file.tar.gz             # Download file (keep original name)
curl -o myfile.zip https://example.com/file.zip     # Download with custom name
curl https://api.github.com/user                    # Make GET API request
curl -s https://ifconfig.me                         # Get your public IP (the -s silences progress)

# curl for API calls (very common in DevOps scripts)
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mytoken" \
  -d '{"name":"John","role":"admin"}'               # POST with JSON body

curl -I https://example.com                         # View response headers only
curl -L https://bit.ly/shorturl                     # Follow redirects (-L)
```



### 📦 Package Management

This is how you install, update, and remove software on Linux. It's like an app store but from the command line.

**Ubuntu/Debian (apt):**
```bash
sudo apt update                    # Refresh the list of available packages
                                   # Think of it as "check for new versions"
                                   # ALWAYS run this before installing anything!

sudo apt upgrade                   # Actually upgrade all installed packages to latest
sudo apt install nginx             # Install nginx web server
sudo apt install -y git vim curl wget     # Install multiple packages, -y says "yes" to all prompts
sudo apt remove nginx              # Remove package (keeps config files)
sudo apt purge nginx               # Remove package AND its config files
sudo apt autoremove                # Remove packages that were installed as dependencies but no longer needed

apt search nginx                   # Search for packages matching "nginx"
apt show nginx                     # Show detailed info about a package
dpkg -l | grep nginx               # List installed packages matching nginx
```

**CentOS/RHEL (yum/dnf):**
```bash
sudo yum update                    # Update all packages
sudo yum install nginx             # Install nginx
sudo yum remove nginx              # Remove nginx
sudo yum search nginx              # Search available packages
sudo dnf install nginx             # dnf = modern replacement for yum (RHEL 8+)
```

#### Setting Up nginx as a Web/Proxy Server

```bash
# Install and start
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx        # Start on boot

# Test the config before applying changes — ALWAYS do this
sudo nginx -t                      # Outputs "syntax is ok" if good

# Key file locations
# /etc/nginx/nginx.conf            → main config
# /etc/nginx/sites-available/      → store your site configs here
# /etc/nginx/sites-enabled/        → symlinks to active configs
# /var/www/html/                   → default web root
# /var/log/nginx/access.log        → who visited, when, what
# /var/log/nginx/error.log         → errors (check this when things break)

# Create a site config — reverse proxy to your Node.js app
sudo vi /etc/nginx/sites-available/myapp
```

```nginx
server {
    listen 80;
    server_name myapp.example.com;    # Your domain name

    # Forward all requests to your Node.js app running on port 3000
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;    # Pass real client IP
    }
}
```

```bash
# Enable the site (create a symlink from sites-enabled to sites-available)
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx   # Test then apply (no downtime)
```

#### Firewall Management

A firewall controls which network connections are allowed in and out of your server. Always set up a firewall on production servers — by default everything might be open.

```bash
# ufw (Uncomplicated Firewall) — Ubuntu's simple firewall
sudo ufw status                    # Is firewall on? What rules exist?
sudo ufw enable                    # Turn on the firewall
sudo ufw allow 22                  # Allow SSH connections (do this BEFORE enabling or you'll lock yourself out!)
sudo ufw allow 80                  # Allow HTTP
sudo ufw allow 443                 # Allow HTTPS
sudo ufw allow from 10.0.0.0/8    # Allow connections from a specific network only
sudo ufw deny 3306                 # Block MySQL from the internet (should only be internal)
sudo ufw status verbose            # Detailed view of all rules
sudo ufw delete allow 80           # Remove a rule

# firewalld — CentOS/RHEL firewall
sudo systemctl start firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload         # Apply the permanent rules
sudo firewall-cmd --list-all       # Show all active rules
```

---

## 💾 08. Disk Management, LVM and Boot Process

Disks, storage, and the boot process are the final pieces of the Linux foundation. You will deal with these topics when provisioning new servers, expanding storage on live running systems without downtime, troubleshooting servers that won't boot, and setting up shared network storage between multiple app servers. This is the level of knowledge that separates someone who can use Linux from someone who can actually manage it.

#### Why Disk Management Matters in DevOps

Disk issues are one of the most common causes of production outages. A full disk brings down everything — the app can't write logs, the database can't write data, the OS itself can start behaving erratically. Every DevOps engineer has a story about a production incident caused by a full disk.

Understanding storage means you can:
- **Expand volumes without downtime** using LVM — add storage to a running server in minutes
- **Monitor disk usage** before it becomes a problem
- **Set up proper disk layouts** when provisioning new servers (separate volumes for OS, data, logs)
- **Recover from disk failures** using RAID
- **Debug boot failures** when a server won't start

#### How Linux Sees Storage

When you attach a disk to a Linux server (physical or virtual), it appears as a **block device** in the `/dev/` directory. Block devices are files (remember: everything in Linux is a file) that represent storage devices.

```
Physical disk attached to server
          ↓
Appears as /dev/sdb (block device file)
          ↓
Partition it: /dev/sdb1, /dev/sdb2
          ↓
Format with filesystem (ext4 / XFS)
          ↓
Mount at a directory: mount /dev/sdb1 /data
          ↓
Now /data/ lets you read and write to that disk
```

**Common device names:**
```
/dev/sda          → first disk (SATA/SCSI or virtual)
/dev/sda1         → first partition on first disk
/dev/sdb          → second disk (a new disk you just attached)
/dev/nvme0n1      → NVMe SSD (faster, newer type)
/dev/xvda         → AWS EC2 virtual disk (Xen-based)
/dev/xvdf         → Second EBS volume on AWS EC2
```

#### LVM — The Game Changer for Production Storage

Without LVM, expanding a disk on a live server requires backing up data, repartitioning, and restoring. That means hours of downtime.

With LVM (Logical Volume Manager), you add a new disk, extend the volume group, extend the logical volume, and resize the filesystem — all in about 5 minutes, with the server fully running and serving traffic. This is why LVM is used on virtually every serious production Linux server.

The concept: instead of directly partitioning physical disks, LVM creates an abstraction layer:
```
Physical Disks (PVs) → pooled into → Volume Group (VG) → carved into → Logical Volumes (LVs)
```

Logical Volumes are what you actually mount and use. They can be resized, snapshotted, and moved between physical disks without the filesystem caring at all.

### 💾 Understanding Storage & Partitions

When you add a disk to a Linux server (or launch an EC2 instance), the disk appears as a **block device** in `/dev/`. Before you can use it, you need to:
1. **Partition** the disk (divide it into sections)
2. **Format** each partition with a filesystem (so Linux can store files on it)
3. **Mount** the partition (attach it to a location in the filesystem tree)

```bash
# See all disks and how they're partitioned
lsblk                              # Clean tree view
# Output example:
# NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
# sda       8:0    0   50G  0 disk
# ├─sda1    8:1    0   49G  0 part /
# └─sda2    8:2    0    1G  0 part [SWAP]
# sdb       8:16   0  100G  0 disk         ← new empty disk, not partitioned yet

fdisk -l                           # Detailed view of all disks
df -h                              # Show mounted filesystems and their usage

# Device naming conventions:
# /dev/sda          → first SATA/SCSI disk (or virtual disk on most VMs)
# /dev/sda1         → first partition on first disk
# /dev/sda2         → second partition on first disk
# /dev/sdb          → second disk (new disk you just attached)
# /dev/nvme0n1      → NVMe SSD (faster storage type)
# /dev/xvda         → AWS EC2 virtual disk
```

#### Creating and Using Partitions

```bash
# Step 1: Partition the disk with fdisk (interactive tool)
sudo fdisk /dev/sdb                # Open fdisk for the second disk
# Inside fdisk, you type single-letter commands:
# m → show help menu
# n → create a New partition
# p → make it a Primary partition
# 1 → partition number 1
# (press Enter to accept default start sector)
# +50G → make it 50 gigabytes
# w → Write the changes and exit (nothing is saved until you press w)

# Step 2: Format the partition with a filesystem
# A filesystem is like setting up shelving in a storage room — organises how data is stored
sudo mkfs.ext4 /dev/sdb1           # ext4 is standard for most Linux — reliable, widely supported
sudo mkfs.xfs /dev/sdb1            # XFS is preferred on RHEL/CentOS — better for large files

# Step 3: Mount it — connect it to the filesystem tree
sudo mkdir /data                   # Create a mount point (a folder that will be the "door" to this disk)
sudo mount /dev/sdb1 /data         # Mount the partition at /data
df -h /data                        # Verify it's mounted and shows the right size

# Step 4: Make it permanent (survives reboots)
# Add to /etc/fstab — the filesystem table, read at boot
echo '/dev/sdb1  /data  ext4  defaults  0  2' | sudo tee -a /etc/fstab
sudo mount -a                      # Test that fstab is valid (mounts everything in fstab)
                                   # If this fails, fix it before rebooting or you won't boot!
```

### 💡 LVM — Logical Volume Manager

**The problem LVM solves:** You have a 50GB disk for your app. The app grows. You need more space. Without LVM, you'd need to back up everything, repartition, restore. That's hours of downtime.

With LVM, you add a new disk and extend the volume in minutes. No downtime. No data movement.

**The LVM concept in simple terms:**
```
Physical Disks     →    Volume Group (VG)    →    Logical Volumes (LV)
                         (pool of storage)         (what you actually use)

Like:
Water tanks        →    One big reservoir    →    Water pipes to each room
(/dev/sdb, /dev/sdc)    (vg_data)               (lv_app, lv_db, lv_logs)
```

```bash
# Step 1: Initialize physical disks as Physical Volumes (PV)
sudo pvcreate /dev/sdb             # Prepare disk sdb for use with LVM
sudo pvcreate /dev/sdc             # Prepare disk sdc too
sudo pvs                           # List physical volumes

# Step 2: Create a Volume Group (the pool)
sudo vgcreate data-vg /dev/sdb /dev/sdc    # Pool sdb + sdc together into data-vg
sudo vgs                                    # List volume groups (shows total size)

# Step 3: Create Logical Volumes from the pool
sudo lvcreate -L 50G -n app-lv data-vg     # 50GB for the app
sudo lvcreate -L 20G -n db-lv data-vg      # 20GB for the database
sudo lvcreate -L 10G -n logs-lv data-vg    # 10GB for logs
sudo lvs                                    # List logical volumes

# Step 4: Format and mount (same as regular partitions)
sudo mkfs.ext4 /dev/data-vg/app-lv
sudo mkdir /opt/app
sudo mount /dev/data-vg/app-lv /opt/app

# THE REAL POWER — Extend a volume WHILE it's in use (no downtime!)
sudo lvextend -L +20G /dev/data-vg/app-lv    # Add 20GB to the volume
sudo resize2fs /dev/data-vg/app-lv           # Expand the filesystem to use the new space (ext4)
# For XFS filesystem:
sudo xfs_growfs /opt/app                      # XFS resize (can be done while mounted!)
df -h /opt/app                                # Verify the new size
```

#### Swap Space — Virtual RAM

**Swap** is disk space that Linux uses as overflow when it runs out of physical RAM. It's much slower than RAM, but it prevents your server from crashing when memory is full.

Think of RAM as your desk (fast, limited space) and swap as a filing cabinet (slower, more space). When your desk is full, you put some things in the cabinet temporarily.

```bash
# Check current swap
free -h                            # Shows RAM and swap usage
swapon --show                      # Shows details of active swap

# Add a swap FILE (more flexible than a partition — can be any size)
sudo fallocate -l 2G /swapfile     # Create a 2GB file for swap
sudo chmod 600 /swapfile           # Secure it — only root should access swap
sudo mkswap /swapfile              # Set it up as swap space
sudo swapon /swapfile              # Activate it right now
free -h                            # Verify it shows 2GB of swap

# Make it permanent
echo '/swapfile  none  swap  sw  0  0' | sudo tee -a /etc/fstab
```

### 🚀 The Linux Boot Process

Understanding the boot process helps you fix servers that won't start and understand how services get initialized.

```
1. POWER ON
   ↓
2. BIOS / UEFI
   Hardware firmware checks that CPU, RAM, and storage are working
   Finds the bootloader on disk
   ↓
3. GRUB (Grand Unified Bootloader)
   The small program that loads the Linux kernel
   The menu you sometimes see when booting lets you choose kernel version
   ↓
4. Linux Kernel
   The core of the OS loads into memory
   Detects hardware — CPU, RAM, disks, network cards
   Mounts the root filesystem (/)
   Starts the first process: init or systemd
   ↓
5. systemd (PID 1 — the mother of all processes)
   The first and most important process (every other process is started by it)
   Reads its configuration from /etc/systemd/
   Starts all services: networking, SSH, nginx, your apps, etc.
   ↓
6. Login prompt appears
   Server is ready!
```

```bash
# Check boot messages and diagnose startup issues
dmesg | less                       # Kernel messages during boot (hardware detection, driver loading)
dmesg | grep -i error              # Any hardware errors during boot?
journalctl -b                      # All log messages from current boot
journalctl -b -1                   # Logs from PREVIOUS boot (useful if server crashed!)

# Run levels / targets — the "state" the server boots into
systemctl get-default              # What target does this server boot to?
# Output: multi-user.target (for servers) or graphical.target (for desktop)

sudo systemctl set-default multi-user.target   # Boot to text-only mode (servers should use this)
sudo systemctl set-default graphical.target    # Boot with full GUI

# Reboot and shutdown
sudo systemctl reboot              # Graceful reboot
sudo systemctl poweroff            # Graceful shutdown
sudo shutdown -r now               # Reboot now
sudo shutdown -r +10               # Reboot in 10 minutes (warns logged-in users)
sudo shutdown -h now               # Halt (shutdown) now
sudo shutdown -c                   # Cancel a scheduled shutdown
```

#### Filesystem Health Checks

```bash
# fsck — Filesystem Check — scan and repair a filesystem
# IMPORTANT: The filesystem must NOT be mounted (or mounted read-only) when you run fsck
# If it's your root filesystem (/), boot from a rescue disk or into recovery mode

sudo umount /dev/sdb1              # Unmount first
sudo fsck /dev/sdb1                # Check and repair ext2/ext3/ext4
sudo fsck -f /dev/sdb1             # Force check even if marked as clean

# For XFS filesystems:
sudo xfs_repair /dev/sdb1          # Repair XFS (more powerful but must be unmounted)
sudo xfs_check /dev/sdb1           # Check only (read-only)
```

#### NFS — Network File System (Sharing Directories Between Servers)

NFS lets you mount a directory from one server onto another server, as if the files were local. Very common in production for shared storage between multiple app servers.

```bash
# ── On the NFS SERVER (the machine sharing files) ────────────────────────────
sudo apt install nfs-kernel-server -y
sudo mkdir -p /opt/shared-data                  # Create directory to share

# Edit exports file to define what to share and who can access it
sudo vi /etc/exports
# Add: /opt/shared-data  10.0.1.0/24(rw,sync,no_subtree_check)
# This shares /opt/shared-data to any IP in the 10.0.1.0/24 network with read+write

sudo exportfs -ra                               # Apply the exports configuration
sudo systemctl restart nfs-server

# ── On the NFS CLIENT (the machine that wants to use the shared files) ───────
sudo apt install nfs-common -y
sudo mkdir /mnt/shared                          # Create mount point
sudo mount 10.0.1.10:/opt/shared-data /mnt/shared    # Mount the remote share
df -h /mnt/shared                               # Verify it's mounted

# Permanent (add to /etc/fstab):
echo '10.0.1.10:/opt/shared-data  /mnt/shared  nfs  defaults  0  0' | sudo tee -a /etc/fstab
```

#### System Backup — Protecting Your Data

```bash
# Simple backup with tar
BACKUP_DATE=$(date +%Y%m%d-%H%M)
tar -czvf /backup/app-${BACKUP_DATE}.tar.gz /opt/myapp/
echo "Backup created: app-${BACKUP_DATE}.tar.gz"

# rsync backup — incremental (only copies files that changed since last backup)
rsync -avz /opt/myapp/ /backup/myapp/                   # Local backup
rsync -avz /opt/myapp/ user@backup-server:/backup/      # Remote backup

# Automated backup script — save as /opt/backup.sh
cat > /opt/backup.sh << 'SCRIPT'
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M)
BACKUP_DIR=/backup
APP_DIR=/opt/myapp

echo "Starting backup at $DATE"
tar -czvf $BACKUP_DIR/app-$DATE.tar.gz $APP_DIR

# Keep only last 7 days of backups (delete older ones)
find $BACKUP_DIR -name "app-*.tar.gz" -mtime +7 -delete

echo "Backup complete. Kept last 7 days."
SCRIPT
chmod +x /opt/backup.sh

# Schedule it to run at 2am every day
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh >> /var/log/backup.log 2>&1") | crontab -
```

---

## 🎯 Quick Reference Card — Commands You'll Use Every Single Day

#### Navigation & File System

| Command | What It Does | Example |
|---|---|---|
| `pwd` | Where am I right now? | `pwd` |
| `ls -lah` | List all files with sizes | `ls -lah /etc` |
| `cd /path` | Go to directory | `cd /var/log` |
| `cd ~` | Go to home | `cd ~` |
| `cd ..` | Go up one level | `cd ..` |
| `cd -` | Go back to previous dir | `cd -` |

#### File Operations

| Command | What It Does | Example |
|---|---|---|
| `cat file` | Show file content | `cat /etc/hosts` |
| `less file` | Page through large file | `less /var/log/syslog` |
| `head -10 file` | First 10 lines | `head -5 config.txt` |
| `tail -f file` | Follow live log | `tail -f /var/log/nginx/access.log` |
| `grep "text" file` | Search for pattern | `grep -r "error" /var/log/` |
| `wc -l file` | Count lines | `grep ERROR app.log \| wc -l` |
| `diff f1 f2` | Compare two files | `diff old.conf new.conf` |
| `file doc.pdf` | Check file type | `file *` |

#### Create, Copy, Move, Delete

| Command | What It Does | Example |
|---|---|---|
| `touch file` | Create empty file | `touch app.log` |
| `mkdir -p a/b/c` | Create nested dirs | `mkdir -p project/src/utils` |
| `cp -r src/ dst/` | Copy directory | `cp -r app/ app-backup/` |
| `mv old new` | Move or rename | `mv old.conf new.conf` |
| `rm -rf dir/` | Delete directory | `rm -rf /tmp/old-build/` |
| `ln -s src dst` | Create soft link | `ln -s /opt/node-18/bin/node /usr/bin/node` |

#### Permissions

| Command | What It Does | Example |
|---|---|---|
| `chmod 755 file` | rwx for owner, rx for others | `chmod 755 deploy.sh` |
| `chmod 644 file` | rw for owner, r for others | `chmod 644 config.txt` |
| `chmod 600 file` | Owner only | `chmod 600 ~/.ssh/id_rsa` |
| `chmod +x file` | Add execute bit | `chmod +x script.sh` |
| `chown u:g file` | Change owner:group | `chown nginx:nginx /var/www/html` |

#### Text Processing Power

| Command | What It Does | Example |
|---|---|---|
| `grep -i "err" f` | Case-insensitive search | `grep -i "error" app.log` |
| `grep -r "text" /` | Search all files | `grep -r "DB_PASS" /etc/` |
| `grep -v "DEBUG"` | Exclude matches | `grep -v "DEBUG" app.log` |
| `awk '{print $1}'` | Print first column | `awk '{print $1}' access.log` |
| `sed -i 's/a/b/g'` | Find & replace in file | `sed -i 's/localhost/prod-db/g' conf` |
| `cut -d',' -f2` | Extract CSV column | `cut -d',' -f2 employees.csv` |
| `sort \| uniq -c` | Count occurrences | `sort ips.txt \| uniq -c \| sort -rn` |
| `wc -l` | Count lines | `cat file \| wc -l` |

#### Processes & Services

| Command | What It Does | Example |
|---|---|---|
| `ps aux \| grep x` | Find process | `ps aux \| grep nginx` |
| `kill -9 PID` | Force kill process | `kill -9 1234` |
| `systemctl status x` | Check service | `systemctl status nginx` |
| `systemctl restart x` | Restart service | `systemctl restart nginx` |
| `systemctl enable x` | Auto-start on boot | `systemctl enable nginx` |
| `journalctl -u x -f` | Follow service logs | `journalctl -u myapp -f` |
| `top` | Live process monitor | `top` |
| `df -h` | Disk space | `df -h` |
| `free -h` | Memory usage | `free -h` |

#### Networking

| Command | What It Does | Example |
|---|---|---|
| `ping host` | Test connectivity | `ping google.com` |
| `ssh user@host` | Connect to server | `ssh -i key.pem ec2-user@ip` |
| `scp file u@h:/p` | Upload file | `scp app.tar.gz ec2-user@ip:/opt/` |
| `curl url` | HTTP request | `curl -s https://ifconfig.me` |
| `wget url` | Download file | `wget https://example.com/file.zip` |
| `netstat -tulpn` | Open ports | `netstat -tulpn \| grep :80` |
| `dig domain` | DNS lookup | `dig google.com` |

#### Packages & System

| Command | What It Does | Example |
|---|---|---|
| `apt install pkg` | Install (Ubuntu) | `sudo apt install nginx -y` |
| `apt update` | Refresh pkg list | `sudo apt update` |
| `yum install pkg` | Install (CentOS) | `sudo yum install nginx` |
| `uptime` | System uptime + load | `uptime` |
| `uname -a` | Kernel + OS info | `uname -a` |
| `lsblk` | Show all disks | `lsblk` |

#### Keyboard Shortcuts (Terminal)

| Shortcut | What It Does |
|---|---|
| `Ctrl + C` | Kill running command |
| `Ctrl + Z` | Suspend command |
| `Ctrl + R` | Search command history |
| `Ctrl + A` | Jump to start of line |
| `Ctrl + E` | Jump to end of line |
| `Ctrl + L` | Clear screen |
| `Ctrl + D` | Exit shell |
| `Tab` | Autocomplete |
| `sudo !!` | Re-run last command with sudo |
| `↑ / ↓` | Scroll through history |



---

## 🗺️ What Comes After Linux in the DevOps Roadmap

You now have the foundation. Here's the exact order of what to learn next:

```
✅ Linux (you're here!)
   ↓
📦 Git & Version Control
   Track code changes, collaborate with teams, understand branches and merges
   ↓
🐳 Docker
   Containerize your apps. BUILD images (runs on Linux commands you now know!)
   ↓
🔄 CI/CD Pipelines (GitHub Actions / Jenkins / GitLab CI)
   Automate builds and deployments using shell scripts you just learned
   ↓
☸️  Kubernetes
   Orchestrate Docker containers across Linux nodes — your Linux knowledge applies directly
   ↓
🌍 Terraform / Infrastructure as Code
   Provision Linux servers on cloud using code
   ↓
📊 Monitoring (Prometheus + Grafana)
   Monitor your Linux servers and applications
```

Every single tool above runs on Linux and uses the commands you learned here. Nothing was wasted.

---

> 📚 **Resources to Keep Learning:**
> - [ExplainShell](https://explainshell.com) — Paste any command and see each part explained
> - [Linux Man Pages](https://man7.org/linux/man-pages/) — Official documentation for every command
> - [OverTheWire: Bandit](https://overthewire.org/wargames/bandit/) — Linux command challenges (game format!)
> - [Linux Journey](https://linuxjourney.com) — Free interactive learning path
> - [TLDRPages](https://tldr.sh![alt text](image-2.png)) — Simplified man pages with practical examples