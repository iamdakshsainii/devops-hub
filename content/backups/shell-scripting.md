# Shell Scripting

## Introduction

### Shell vs Terminal vs Bash

**Problem** — These three words are used interchangeably but they mean different things and beginners get confused.

**Solution** — Here is what each one actually is:

| Term | What it is |
| :--- | :--- |
| **Terminal** | The window/app you open — like Terminal.app, iTerm2, GNOME Terminal. Just the interface. |
| **Shell** | The program running *inside* the terminal that reads and executes your commands. |
| **Bash** | One specific type of shell — the most popular one. Full name: Bourne Again Shell. |

So when you open Terminal and type commands — Terminal is the window, Bash (or Zsh) is the shell doing the work.

### Different Types of Shell

There are several shells available. Each has different features and syntax:

| Shell | Full Name | Notes |
| :--- | :--- | :--- |
| `bash` | Bourne Again Shell | Default on most Linux systems. Most widely used. |
| `zsh` | Z Shell | Default on macOS since 2019. More features than bash. |
| `sh` | Bourne Shell | Original UNIX shell. Very minimal. |
| `ksh` | Korn Shell | Common in older enterprise environments. |
| `fish` | Friendly Interactive Shell | Beginner friendly, great autocomplete. Not POSIX. |
| `dash` | Debian Almquist Shell | Faster than bash, used for system scripts on Ubuntu. |

For DevOps and this guide — we use **Bash**. It is available everywhere: Linux servers, CI/CD runners, Docker containers, AWS instances.

### How to Check Your Current Shell

```bash
echo $SHELL


bash --version

cat /etc/shells
```

### Installing Bash

**Linux** — Bash is already installed. Nothing to do.

**macOS** — macOS comes with Zsh as default but Bash is available. To install the latest Bash:

```bash
brew install bash
```

**Windows** — Install WSL (Windows Subsystem for Linux):

```powershell
wsl --install
```

This gives you a full Ubuntu environment with Bash on Windows.

### Essential Configuration Files

When Bash starts, it reads certain files to set up your environment — aliases, variables, functions. These are called **dotfiles** (they start with a dot so they are hidden).

| File | When it runs | Use it for |
| :--- | :--- | :--- |
| `~/.bashrc` | Every time you open a new terminal | Aliases, functions, prompt customization |
| `~/.bash_profile` | Only on login shells (SSH sessions) | Environment variables like `$PATH` |
| `~/.zshrc` | Every new terminal (if using Zsh) | Same as `.bashrc` but for Zsh |

```bash
nano ~/.bashrc

source ~/.bashrc

. ~/.bashrc
```

### Environment Variables

Environment variables are global variables the shell and all programs can read. They store things like your home directory, username, and where to find executables.

```bash
env

echo $HOME      # /home/yourname
echo $USER      # yourname
echo $PATH      # /usr/local/bin:/usr/bin:/bin:...
echo $SHELL     # /bin/bash
```

**$PATH** is the most important one. It is a colon-separated list of directories where the shell looks for commands. When you type `docker`, the shell searches each directory in `$PATH` until it finds the `docker` binary.

```bash
export PATH=$PATH:/home/yourname/scripts

```

### PS1 — Customizing Your Prompt

`PS1` is the variable that controls what your shell prompt looks like.

```bash
yourname@hostname:~$

export PS1="\u@\h:\w\$ "

```

### Useful Aliases

Aliases are shortcuts for long commands. Put these in `~/.bashrc`:

```bash
alias ..='cd ..'
alias ...='cd ../..'
alias ll='ls -la'
alias la='ls -A'

alias rm='rm -i'          # Ask before deleting
alias cp='cp -i'          # Ask before overwriting
alias mv='mv -i'          # Ask before overwriting

alias k='kubectl'
alias d='docker'
alias dc='docker compose'
alias tf='terraform'

alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'

source ~/.bashrc
```

---

### Basic Shell Scripting

A shell script is just a plain text file containing a list of shell commands. Instead of typing commands one by one, you write them in a file and run the file. This is the foundation of automation.

### What is Shell Scripting?

**Problem** — You need to run 10 commands every time you deploy your app. Typing them manually every time is slow and error-prone.

**Solution** — Write them once in a `.sh` file. Run the file. All 10 commands execute automatically in order.

Shell scripting is how DevOps engineers automate deployments, backups, health checks, log analysis, and much more.

### The Shebang Line

The first line of every shell script should be the **shebang** (`#!`). It tells the OS which interpreter to use to run the script.

```bash
#!/bin/bash
```

Without it, the OS might use a different shell and your script may fail.

```bash
#!/bin/bash          # Use bash — most common
#!/bin/sh            # Use sh — portable, minimal features
#!/usr/bin/env bash  # Find bash wherever it is installed — more portable
```

### Creating Your First Shell Script

```bash
nano hello.sh

#!/bin/bash
echo "Hello, World!"
echo "Today is: $(date)"
echo "You are logged in as: $USER"


chmod +x hello.sh

./hello.sh
```

Output:
```
Hello, World!
Today is: Mon Mar 24 10:00:00 UTC 2026
You are logged in as: daksh
```

### How to Run a Shell Script

There are three ways to run a script:

```bash
chmod +x script.sh
./script.sh

bash script.sh

source script.sh
. script.sh
```

**Method 1 and 2** run the script in a new subshell — variables set inside don't affect your current terminal.

**Method 3 (source)** runs it in your current shell — useful for scripts that set environment variables.

### Comments

Comments are lines the shell ignores. Use them to explain what your script does.

```bash
#!/bin/bash

echo "Hello"  # This comment is at the end of a line

: '
This is a
multi-line comment block.
Nothing here runs.
'

echo "Done"
```

Good scripts have comments explaining *why* — not just *what*.

### Variables

Variables store values you can reuse throughout your script.

```bash
#!/bin/bash

NAME="Daksh"
AGE=25
IS_DEVOPS=true

echo "Name: $NAME"
echo "Age: $AGE"

echo "Hello ${NAME}!"

```

**Variable naming rules:**
- Only letters, numbers, underscores
- Cannot start with a number
- Case-sensitive — `name` and `NAME` are different variables

### Special Variables

Bash has built-in variables that are always available:

```bash
$0    # Name of the script itself
$1    # First argument passed to the script
$2    # Second argument
$@    # All arguments as separate words
$#    # Number of arguments passed
$?    # Exit code of the last command (0 = success, non-zero = error)
$$    # PID of the current script
$USER # Current logged-in user
$HOME # Home directory path
$PWD  # Current working directory
```

```bash
#!/bin/bash
echo "Script name: $0"
echo "First argument: $1"
echo "All arguments: $@"
echo "Number of arguments: $#"
```

Run it:
```bash
./script.sh hello world
```

### Arrays

Arrays store multiple values in one variable.

```bash
#!/bin/bash

SERVERS=("web1" "web2" "db1" "db2")

echo ${SERVERS[0]}    # web1
echo ${SERVERS[2]}    # db1

echo ${SERVERS[@]}    # web1 web2 db1 db2

echo ${#SERVERS[@]}   # 4

SERVERS+=("cache1")

for SERVER in "${SERVERS[@]}"; do
    echo "Checking: $SERVER"
done
```

### String Operations

```bash
#!/bin/bash

NAME="hello world"

echo ${#NAME}             # 11

echo ${NAME^^}            # HELLO WORLD

echo ${NAME,,}            # hello world

echo ${NAME/hello/hi}     # hi world

echo ${NAME//l/L}         # heLLo worLd

echo ${NAME:0:5}          # hello
echo ${NAME:6}            # world
```

### Reading User Input

```bash
#!/bin/bash

echo "Enter your name:"
read NAME
echo "Hello, $NAME!"

read -p "Enter server IP: " SERVER_IP
echo "Connecting to $SERVER_IP..."

read -sp "Enter password: " PASSWORD
echo ""   # newline after hidden input
echo "Password received."

read -t 5 -p "Quick! Enter something: " RESPONSE
```

### Arithmetic Operations

```bash
#!/bin/bash

A=10
B=3

echo $((A + B))    # 13
echo $((A - B))    # 7
echo $((A * B))    # 30
echo $((A / B))    # 3 (integer division)
echo $((A % B))    # 1 (remainder/modulo)
echo $((A ** B))   # 1000 (power)

expr $A + $B

COUNT=0
((COUNT++))        # COUNT becomes 1
((COUNT+=5))       # COUNT becomes 6
echo $COUNT        # 6
```

### If-Else

```bash
#!/bin/bash

AGE=20

if [ $AGE -ge 18 ]; then
    echo "You are an adult"
else
    echo "You are a minor"
fi
```

**Comparison operators for numbers:**

| Operator | Meaning |
| :--- | :--- |
| `-eq` | Equal to |
| `-ne` | Not equal to |
| `-gt` | Greater than |
| `-lt` | Less than |
| `-ge` | Greater than or equal |
| `-le` | Less than or equal |

**Comparison operators for strings:**

| Operator | Meaning |
| :--- | :--- |
| `=` or `==` | Equal |
| `!=` | Not equal |
| `-z` | String is empty |
| `-n` | String is not empty |

**File test operators:**

| Operator | Meaning |
| :--- | :--- |
| `-f file` | File exists and is a regular file |
| `-d dir` | Directory exists |
| `-e path` | File or directory exists |
| `-r file` | File is readable |
| `-w file` | File is writable |
| `-x file` | File is executable |

```bash
#!/bin/bash

FILE="/etc/hosts"

if [ -f "$FILE" ]; then
    echo "$FILE exists"
else
    echo "$FILE not found"
fi
```

### Elif

```bash
#!/bin/bash

read -p "Enter a number: " NUM

if [ $NUM -gt 0 ]; then
    echo "Positive"
elif [ $NUM -lt 0 ]; then
    echo "Negative"
else
    echo "Zero"
fi
```

### Case Statement

**Problem** — Using multiple `elif` for the same variable gets messy and hard to read.

**Solution** — Use `case` when you are checking one variable against many possible values.

```bash
#!/bin/bash

read -p "Choose an option (start/stop/restart): " ACTION

case $ACTION in
    start)
        echo "Starting the service..."
        ;;
    stop)
        echo "Stopping the service..."
        ;;
    restart)
        echo "Restarting the service..."
        ;;
    *)
        echo "Invalid option. Use start, stop, or restart."
        ;;
esac
```

`*)` is the default case — it runs if nothing else matches.

### Logical Operators

```bash
#!/bin/bash

AGE=25
SCORE=85

if [ $AGE -ge 18 ] && [ $SCORE -ge 80 ]; then
    echo "Eligible"
fi

if [ $AGE -lt 18 ] || [ $SCORE -lt 50 ]; then
    echo "Not eligible"
fi

if ! [ -f "/tmp/lockfile" ]; then
    echo "No lock file found, safe to proceed"
fi
```

### For Loop

```bash
#!/bin/bash

for FRUIT in apple banana mango; do
    echo "Fruit: $FRUIT"
done

for i in {1..5}; do
    echo "Count: $i"
done

for i in {1..10..2}; do
    echo $i
done

for ((i=0; i<5; i++)); do
    echo "Index: $i"
done

SERVERS=("web1" "web2" "db1")
for SERVER in "${SERVERS[@]}"; do
    echo "Pinging $SERVER..."
done
```

### For Loop to Get Values from a File

**Problem** — You have a file with a list of server IPs and you want to run a command on each one.

**Solution** — Loop over the file line by line.

```bash
#!/bin/bash

for SERVER in $(cat servers.txt); do
    echo "Connecting to $SERVER"
    ssh user@$SERVER "uptime"
done
```

### While Loop

Runs as long as a condition is true.

```bash
#!/bin/bash

COUNT=1

while [ $COUNT -le 5 ]; do
    echo "Count: $COUNT"
    ((COUNT++))
done
```

Real use case — wait for a service to be ready:

```bash
#!/bin/bash

echo "Waiting for database to be ready..."

while ! nc -z localhost 5432; do
    echo "DB not ready yet, retrying in 3 seconds..."
    sleep 3
done

echo "Database is ready!"
```

### Until Loop

Opposite of while — runs **until** a condition becomes true (i.e. runs while the condition is false).

```bash
#!/bin/bash

COUNT=1

until [ $COUNT -gt 5 ]; do
    echo "Count: $COUNT"
    ((COUNT++))
done
```

### Infinite Loop

```bash
#!/bin/bash

while true; do
    echo "Checking server health..."
    sleep 60
done
```

Useful for monitoring scripts that need to keep running.

### While Loop with File

```bash
#!/bin/bash

while IFS= read -r LINE; do
    echo "Processing: $LINE"
done < servers.txt
```

`IFS=` prevents trimming of leading/trailing spaces. `-r` prevents backslash interpretation.

### Functions

Functions let you group commands under a name and reuse them.

```bash
#!/bin/bash

greet() {
    echo "Hello, $1!"   # $1 is the first argument passed to the function
}

greet "Daksh"       # Hello, Daksh!
greet "DevOps"      # Hello, DevOps!
```

Functions with return value:

```bash
#!/bin/bash

add() {
    local RESULT=$(( $1 + $2 ))   # 'local' keeps variable inside function only
    echo $RESULT                   # Functions return values via echo, not return
}

SUM=$(add 10 20)
echo "Sum is: $SUM"    # Sum is: 30
```

### Argument Passing to Scripts

```bash
#!/bin/bash

APP_NAME=$1
ENVIRONMENT=$2

if [ -z "$APP_NAME" ] || [ -z "$ENVIRONMENT" ]; then
    echo "Usage: ./deploy.sh <app-name> <environment>"
    exit 1
fi

echo "Deploying $APP_NAME to $ENVIRONMENT..."
```

Run it:
```bash
./deploy.sh my-app production
```

### Exit Codes

Every command returns an exit code when it finishes:
- `0` = success
- Non-zero = failure (1, 2, 127, etc.)

```bash
#!/bin/bash

ls /etc/hosts
echo "Exit code: $?"    # 0 (file exists, command succeeded)

ls /nonexistent
echo "Exit code: $?"    # 2 (file not found, command failed)

exit 0    # Success
exit 1    # General error
```

Using exit codes in logic:

```bash
#!/bin/bash

ping -c 1 google.com > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "Internet is available"
else
    echo "No internet connection"
fi

mkdir /tmp/mydir && echo "Directory created"

mkdir /tmp/mydir || echo "Failed to create directory"
```

