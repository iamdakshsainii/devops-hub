# 🌐 Networking for DevOps — From Zero to Confident
Networking is the invisible foundation under every cloud server, every Docker container, and every deployment pipeline. This module teaches you how computers talk to each other — in plain simple language, from scratch.

---

## 🧠 01. Why Networking Matters in DevOps

Most beginners try to skip networking. It feels abstract and full of confusing words. But here is the truth — **almost every real production problem has networking involved somewhere**.

Think about it. When your app can't reach its database — that is a networking problem. When SSH won't connect to your server — networking. When the deployment pipeline can't pull a Docker image — networking. When users see a "502 Bad Gateway" error — networking. If you don't understand networking, you will spend hours debugging problems that should take 5 minutes to fix.

The good news is you do not need to become a network engineer. You just need to understand the fundamentals well enough to know what is happening and which tool to use. That is exactly what this module gives you.

![Add image here: DevOps engineer troubleshooting a server connection on a laptop](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80)

#### What You Actually Do With Networking as a DevOps Engineer

Here is what real networking work looks like on the job:

```
Setting up a new server:
  → Assign an IP address and hostname
  → Set up SSH key access so you can connect securely
  → Open firewall ports: 80 for HTTP, 443 for HTTPS, 22 for SSH
  → Test everything is reachable with ping and curl

Deploying an application:
  → Configure nginx to forward web traffic to your app
  → Point your domain name to the server IP using DNS
  → Debug why the app cannot talk to the database
  → Check which ports are open: netstat -tulpn

Debugging a live issue at 2am:
  → "Connection refused" → Is the app even running? Wrong port?
  → "Network unreachable" → Routing problem? Wrong subnet?
  → "DNS resolution failed" → DNS config broken?
  → Trace it step by step: ping → traceroute → curl -v
```

Every single line above is networking. Once you learn this module, all of those problems become solvable quickly and confidently.

#### The Big Picture — What Happens When You Visit a Website

Before we get into details, let's understand the full journey of a simple web request. This is the story of what happens every time you type a URL and press Enter.

```
You type: google.com and press Enter
              ↓
Your browser asks DNS:
"What is the IP address for google.com?"
              ↓
DNS replies: "The IP is 142.250.185.46"
              ↓
Browser connects to 142.250.185.46 on port 443 (HTTPS)
              ↓
Request travels: Your laptop -> Router -> ISP -> Internet -> Google's server
              ↓
Google's server sends back HTML, CSS, JavaScript
              ↓
Your browser renders the page you see
```

This entire journey happens in less than 100 milliseconds. Every single step of it maps to a concept in this module. By the end, you will understand each step completely.

#### What This Module Covers

| Topic | What You Learn | Why It Matters |
|---|---|---|
| OSI & TCP/IP Models | How the layers of networking work | Debug at the right layer |
| IP Addresses & Subnets | How every device gets an address | Configure servers and cloud correctly |
| DNS | How names become IP addresses | Fix connection and domain failures |
| Network Devices | Switches, routers, firewalls | Understand cloud infrastructure |
| Protocols | HTTP, TCP, UDP, SSH and more | Know which protocol does what |
| Linux Commands | ping, curl, netstat, dig, traceroute | Diagnose any problem on any server |
| Security | Firewalls, TLS, SSH hardening | Keep your infrastructure safe |

### 💡 The Real Cost of Not Knowing Networking

Here is a real scenario that plays out every week for engineers who skipped networking fundamentals.

A junior engineer deploys a Node.js app to an EC2 instance. The app runs fine locally. On the server, `systemctl status myapp` shows it is running. But users get "This site can't be reached." The engineer spends 4 hours checking the app code, reinstalling packages, rebooting the server.

The actual problem? The app was listening on `127.0.0.1:3000` instead of `0.0.0.0:3000`. One line of networking knowledge. Four hours lost.

A second scenario: the database connection keeps timing out in production but works locally. The engineer digs into the database config, the ORM settings, the connection pool. Two hours later someone notices the database security group only allows connections from the same VPC — and the new server is in a different subnet.

These are not rare edge cases. They happen constantly. And every single one is obvious once you understand networking. That is what this module gives you.

---

## 🏗️ 02. The OSI Model — 7 Layers of Networking

The OSI model is the most important framework to understand in networking. It does not describe a specific technology — it describes a way of **thinking about how communication is organised**. Once you understand it, debugging network problems becomes much more systematic.

OSI stands for **Open Systems Interconnection**. Think of it like sending a physical package through a courier service. There are different departments involved — packing, labelling, transportation, delivery. Each department has a specific job and does not need to know how the others work internally. That separation is exactly how the OSI model works.

The model has 7 layers. When you send data, it travels **down** through all 7 layers on your side, crosses the network, then travels **back up** through all 7 layers on the other side.

![Add image here: OSI model 7 layers diagram showing sender and receiver sides](https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80)

```
SENDER SIDE                         RECEIVER SIDE
----------------------------------------------- 
7. Application                      7. Application
   (your app -- HTTP, SSH, DNS)        (their app)

6. Presentation                     6. Presentation
   (encryption, formatting)            (decryption)

5. Session                          5. Session
   (managing the connection)           (managing connection)

4. Transport                        4. Transport
   (TCP or UDP, ports)                 (reassemble segments)

3. Network                          3. Network
   (IP addresses, routing)             (read IP, find destination)

2. Data Link                        2. Data Link
   (MAC addresses, local delivery)     (local delivery)

1. Physical  ========================  1. Physical
             (actual cable / Wi-Fi signal)
```

#### Layer 1 — Physical (The Wire)

This is the bottom layer — actual hardware. Electrical signals travelling through copper cables, light pulses through fibre optic cables, or radio waves through the air for Wi-Fi. At this layer everything is just raw bits — zeros and ones.

- Devices here: cables, network cards (NIC), Wi-Fi antennas, hubs
- Problems here: unplugged cable, broken NIC, Wi-Fi interference, signal too weak
- You cannot "fix" Layer 1 with software — it is a physical problem

#### Layer 2 — Data Link (MAC Addresses)

This layer handles communication between devices on the **same local network**. It uses **MAC addresses** — unique hardware addresses burned into every network card at the factory. They look like: `00:1A:2B:3C:4D:5E`.

- Devices here: switches, bridges
- A switch keeps a table of "which MAC address is on which port" and sends data only to the right device
- Problems here: duplicate MAC addresses, switch misconfiguration

#### Layer 3 — Network (IP Addresses)

This is where **IP addresses** live and where **routing** happens. This layer is responsible for getting data from one network to another — across the internet if needed. Routers operate at this layer.

- Devices here: routers
- Your home router connects your private network (192.168.x.x) to the internet
- Problems here: wrong IP, wrong subnet mask, routing table issues

#### Layer 4 — Transport (TCP & UDP, Ports)

This layer handles end-to-end delivery between two applications. It introduces **port numbers** (so data reaches the right app on a server) and the choice between TCP (reliable) and UDP (fast).

- Port 22 = SSH, Port 80 = HTTP, Port 443 = HTTPS, Port 5432 = PostgreSQL
- Problems here: port not open, firewall blocking port, wrong protocol

#### Layers 5, 6, 7 — Session, Presentation, Application

These upper layers deal with the application itself:

- **Session (5):** Manages the connection lifespan — opening, keeping alive, closing
- **Presentation (6):** Handles encryption (TLS/SSL), compression, data format conversion
- **Application (7):** The actual protocol your app uses — HTTP, FTP, DNS, SMTP, SSH

#### OSI Model Quick Reference Table

| Layer | Name | Address Used | Key Devices | Data Unit |
|---|---|---|---|---|
| 7 | Application | — | HTTP, FTP, DNS, SSH | Data |
| 6 | Presentation | — | SSL/TLS | Data |
| 5 | Session | — | NetBIOS | Data |
| 4 | Transport | Port numbers | TCP, UDP | Segments |
| 3 | Network | IP address | Routers | Packets |
| 2 | Data Link | MAC address | Switches | Frames |
| 1 | Physical | — | Cables, NICs | Bits |

#### How to Use OSI for Debugging

This is the real value of the OSI model. When something breaks, work through the layers from bottom to top:

```
Problem: "I cannot connect to the database"

Layer 1: Is the server powered on and physically connected?
         → ping the server IP. If ping fails, check physical/network.

Layer 3: Can I reach the server's IP at all?
         → ping db-server-ip
         → If ping works, the network path is fine.

Layer 4: Is the database port open and listening?
         → netstat -tulpn | grep 5432
         → Is there a firewall blocking port 5432?

Layer 7: Is the database service actually running?
         → systemctl status postgresql
         → Are the credentials correct?
```

You just saved yourself 2 hours of random Googling. Work layer by layer — you will find it every time.

### 🔄 TCP/IP Model — What the Internet Actually Uses

The TCP/IP model is a simplified, 4-layer version of OSI. It is what the actual internet is built on. You will see it referenced constantly in documentation, error messages, and cloud networking.

The key thing to understand: TCP/IP was built from real working protocols and then documented. OSI was designed as a theoretical framework first. That is why TCP/IP won — it was already running the internet.

```
OSI (7 layers)                TCP/IP (4 layers)
------------------            ----------------------------------
7. Application
6. Presentation               Application Layer
5. Session                    (HTTP, FTP, SSH, DNS, SMTP)
------------------            ----------------------------------
4. Transport                  Transport Layer (TCP, UDP)
------------------            ----------------------------------
3. Network                    Internet Layer (IP, ICMP)
------------------            ----------------------------------
2. Data Link                  Network Access Layer
1. Physical                   (Ethernet, Wi-Fi, cables)
```

#### TCP vs UDP — The Most Important Protocol Difference

These two protocols are your choice when deciding how data gets delivered. Pick the wrong one and your app will either be too slow or lose data.

![Add image here: TCP vs UDP comparison showing reliability vs speed trade-off](https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80)

**TCP — Transmission Control Protocol (the careful one)**

TCP makes sure every single piece of data arrives correctly and in order. Before sending anything, it does a 3-way handshake to establish a connection:

```
Client            Server
  |                 |
  |--- SYN -------> |   "Hey, can we talk?"
  | <-- SYN-ACK --- |   "Yes, ready!"
  |--- ACK -------> |   "Great, let's go."
  |                 |
  [ data transfer begins ]
```

- Every packet is acknowledged — if no ACK, it resends
- Data arrives in order, no duplicates, no missing pieces
- Slower because of all this back-and-forth
- Use for: loading web pages, downloading files, sending emails, database queries

**UDP — User Datagram Protocol (the fast one)**

UDP just sends data without any handshake or acknowledgment. It fires packets and moves on.

```
Client            Server
  |                 |
  |--- data ------> |
  |--- data ------> |   (some might not arrive -- UDP does not care)
  |--- data ------> |
  [ no confirmation, no resending ]
```

- No connection setup, no acknowledgment, no ordering
- Packets may arrive out of order or not at all
- Much faster and uses less bandwidth
- Use for: video streaming, online gaming, DNS lookups, VoIP calls

```
Simple analogy:

TCP  = Registered mail. You get a signature confirmation.
       If not delivered, they send it again. Slower but guaranteed.

UDP  = Dropping leaflets from a plane.
       Some land correctly, some blow away. Fast but no guarantee.
```

---

## 🌍 03. IP Addresses, Subnets & DNS

Every device on a network needs an address. Without addresses, there is no way to know where to send data. This section covers the addressing system the entire internet runs on, and the DNS system that makes addresses human-friendly.

For DevOps this is critical daily knowledge. Every time you launch a cloud server, configure a VPC, set up a load balancer, or debug "connection refused" — you are working with IP addresses. Understanding this section properly means you will never be confused by cloud networking.

#### What is an IP Address?

An **IP address** is a unique identifier for a device on a network — like a postal address for your computer. When data needs to go somewhere, it is addressed to an IP just like a letter is addressed to a house.

The most common type is **IPv4** — a 32-bit number written as four groups of numbers separated by dots:

```
      192    .    168    .     1    .    100
       |           |           |          |
   Network      Network     Network     Device
   (identifies the network you are on)  (identifies the specific device)

Each number = 0 to 255
Total possible addresses = about 4 billion
```

![Add image here: IPv4 address structure breakdown diagram](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80)

#### Public vs Private IP Addresses

Not all IP addresses are the same. There are **private** addresses (used inside networks, not visible on the internet) and **public** addresses (globally unique, visible on the internet).

| Type | Range | Where You See It |
|---|---|---|
| **Private** | `10.0.0.0 – 10.255.255.255` | AWS VPCs, large company networks |
| **Private** | `172.16.0.0 – 172.31.255.255` | Medium private networks |
| **Private** | `192.168.0.0 – 192.168.255.255` | Your home Wi-Fi network |
| **Loopback** | `127.0.0.1` | Always means "this machine itself" (localhost) |
| **Public** | Everything else | Addresses on the real internet |

When you SSH into an AWS EC2 instance from your laptop, you use its **public IP**. But when your app talks to its database inside AWS, they use **private IPs**. Your home router has one public IP (facing the internet) and gives private IPs to all your devices (192.168.1.x).

#### Subnets and CIDR — How Networks Are Divided

A **subnet** is a smaller chunk of a larger network. You divide networks into subnets to organise devices, isolate different systems, and control which devices can talk to each other.

**CIDR notation** is how you write a subnet — it is the IP address followed by a `/number`:

```
10.0.1.0/24

Breaking it down:
  10.0.1.0   = the network address (start of this subnet)
  /24        = the first 24 bits identify the NETWORK
               the remaining 8 bits identify individual DEVICES

So /24 gives you:
  2^8 = 256 addresses
  Minus 2 (network address + broadcast address)
  = 254 usable devices in this subnet

Common CIDR sizes to memorise:
  /32  =       1 address   (a single specific host)
  /30  =       4 addresses, 2 usable (connecting two routers)
  /28  =      16 addresses, 14 usable
  /24  =     256 addresses, 254 usable  (most common subnet)
  /16  =  65,536 addresses              (VPC level in AWS)
  /8   =  16 million addresses          (very large networks)
```

**Real AWS example — how a typical VPC is structured:**

```
VPC: 10.0.0.0/16  (65,536 IPs -- the whole space)
          |
     +----+-----------------------------+
     |                                  |
10.0.1.0/24                  10.0.2.0/24
(Public subnet)              (Private subnet)
Web servers                  App servers + Databases
Can reach internet           Cannot reach internet directly
```

This separation keeps your databases safe from direct internet access — a fundamental security practice.

#### IPv6 — The Newer Addressing System

IPv4 only has 4 billion addresses. We ran out. **IPv6** fixes this with 128-bit addresses:

```
IPv4:  192.168.1.100          (32 bits, ~4 billion addresses)
IPv6:  2001:0db8:85a3::8a2e:0370:7334  (128 bits, 340 undecillion addresses)
```

You will see IPv6 in modern cloud environments. For most DevOps work IPv4 is still primary, but knowing what IPv6 looks like helps you not be confused when you see it.

```bash
# Check your IP addresses on Linux
ip addr show                        # Shows all network interfaces and their IPs
ip addr show eth0                   # Just the eth0 interface
hostname -I                         # Quick list of all your IPs
curl -s https://ifconfig.me         # Your public IP as seen from the internet
```

### 🔍 DNS — How Names Become Addresses

**DNS** stands for Domain Name System. It is basically the internet's phone book. You give it a name like `google.com` and it gives you back the IP address `142.250.185.46` that you actually need to connect.

Without DNS you would need to memorise the IP address of every website you want to visit. DNS makes the internet human-friendly.

![Add image here: DNS lookup flow showing browser → resolver → root → TLD → authoritative server](https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80)

#### The DNS Resolution Journey

When you type `devops-network.com` in your browser, here is exactly what happens:

```
Step 1 — Browser cache check
   "Have I looked this up in the last few minutes?"
   If yes → use the cached IP immediately (fastest)
   If no → continue to step 2

Step 2 — OS / /etc/hosts check
   Linux checks /etc/hosts for local overrides
   If found → use that IP (useful for local development)
   If not → continue to step 3

Step 3 — Ask your DNS Resolver
   Usually your ISP's server or 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare)
   Resolver checks its own cache
   If not cached → it starts the real lookup

Step 4 — Root DNS Servers
   Resolver asks: "Who handles .com domains?"
   Root server (there are 13 sets worldwide) says:
   "Ask the .com TLD server at 192.5.6.30"

Step 5 — TLD Server (.com, .org, .io etc.)
   Resolver asks: "Who handles devops-network.com?"
   TLD server says: "The authoritative nameserver is ns1.example-dns.com"

Step 6 — Authoritative DNS Server
   This is the actual authoritative source — usually your domain registrar
   or a service like AWS Route 53, Cloudflare DNS
   Returns the real IP: "54.123.45.67"

Step 7 — Resolver caches and returns the IP
   Your browser now connects to 54.123.45.67
   Page loads!
```

This whole process usually takes under 50 milliseconds. Most requests are served from cache and complete in under 1 millisecond.

#### DNS Record Types — What Goes in a DNS Zone

| Record | What It Does | Real Example |
|---|---|---|
| **A** | Domain → IPv4 address | `devops-network.com → 54.1.2.3` |
| **AAAA** | Domain → IPv6 address | `devops-network.com → 2001:db8::1` |
| **CNAME** | Alias → points to another domain name | `www.devops-network.com → devops-network.com` |
| **MX** | Which server handles email for this domain | `mail.devops-network.com` (priority 10) |
| **TXT** | Text data — used for domain verification, SPF records | `"v=spf1 include:sendgrid.net ~all"` |
| **NS** | Which servers are authoritative for this domain | `ns1.route53.amazonaws.com` |
| **PTR** | Reverse lookup — IP back to domain name | Used for email spam checks |

#### TTL — How Long DNS Is Cached

Every DNS record has a **TTL (Time To Live)** in seconds. It tells caches how long to remember the answer before asking again.

```
TTL = 300    → Cache for 5 minutes   (records that change frequently)
TTL = 3600   → Cache for 1 hour      (typical for most records)
TTL = 86400  → Cache for 24 hours    (very stable, rarely changed)
```

**Pro tip:** Before you migrate a server to a new IP, lower your TTL to 300 at least 24 hours before. Then when you change the IP, it will update everywhere within 5 minutes instead of 24 hours.

#### DNS Commands on Linux

```bash
# nslookup — simple and quick
nslookup google.com                 # Get the IP for google.com
nslookup -type=MX gmail.com         # Get Gmail's mail servers
nslookup -type=NS google.com        # Get Google's nameservers

# dig — more detailed, great for troubleshooting
dig google.com                      # Full DNS query output
dig +short google.com               # Just the IP address — no extras
dig google.com MX                   # Get mail server records
dig google.com NS                   # Get nameserver records
dig @8.8.8.8 google.com             # Query Google's DNS directly
                                    # (bypasses your local DNS — good for testing)

# Your system's DNS configuration
cat /etc/resolv.conf                # Which DNS server is your system using?
# "nameserver 8.8.8.8" means you are using Google's public DNS

# /etc/hosts — local overrides (checked BEFORE DNS)
cat /etc/hosts
sudo nano /etc/hosts
# Add: 192.168.1.100  myserver.local
# Now "myserver.local" resolves locally, no DNS needed

# Real trick: before launching, test a new server by editing /etc/hosts
# Point your domain to the new server IP, test everything, then update real DNS
```

---

## 🖥️ 04. Network Devices — The Building Blocks

Network devices are the hardware (or software in the cloud) that control how data flows through a network. Understanding them helps you understand cloud architecture — because AWS VPCs, security groups, NAT gateways, and internet gateways are all just software versions of these physical concepts.

Each device operates at a specific OSI layer. The layer it operates at determines what it can "see" in the data and what decisions it can make.

![Add image here: Network diagram showing hub, switch, router, and firewall in a typical network](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80)

#### Hub, Switch, and Router — The Three You Must Understand

These three cause the most confusion for beginners. Here is the clearest way to think about them:

**Hub (Layer 1) — the dumb broadcaster:**

A hub takes anything arriving on one port and sends it out of ALL other ports. It has no intelligence — it just shouts everything everywhere.

```
Device A sends data to Device C via Hub:

Device A -->  HUB  --> Device B (gets it, but shouldn't)
                   --> Device C (intended recipient -- gets it)
                   --> Device D (gets it, but shouldn't)

Everyone sees everyone's traffic. Security nightmare.
```

Status: Completely obsolete. You will never buy one. But knowing why it was replaced helps you appreciate what switches do.

**Switch (Layer 2) — the smart director:**

A switch learns the MAC address of every device plugged into each of its ports. When data arrives, it sends it ONLY to the correct port. Like a hotel receptionist who knows exactly which room each guest is in.

```
Device A sends data to Device C via Switch:

Device A -->  SWITCH  (checks MAC address table)
                  +--> Device C only (exact delivery)
              Device B and D do NOT receive the data
```

Switches are everywhere — every office, every data centre, every cloud. They are fast, efficient, and secure.

**Router (Layer 3) — the network connector:**

A router connects different networks together. It reads IP addresses to determine the best path for data to travel, even across the entire internet. Routers maintain a **routing table** — a list of "to reach network X, send packets via Y."

```
Your home network (192.168.1.x)
         ↓
      ROUTER    (reads IP addresses, decides where to send)
         ↓
      Your ISP
         ↓
    The Internet
         ↓
   Google's servers (142.250.x.x)
```

Your home Wi-Fi box is actually a router + switch + Wi-Fi access point all in one device.

#### Device Comparison Table

| Device | OSI Layer | Identifies Devices By | Smart? | Used For |
|---|---|---|---|---|
| Hub | Layer 1 | Nothing | No — broadcasts everything | Obsolete |
| Repeater | Layer 1 | Nothing | No — just boosts signal | Extending cable range |
| Switch | Layer 2 | MAC address | Yes — sends to correct port | Connecting devices locally |
| Access Point | Layer 2 | MAC address | Yes — wireless version of switch | Wi-Fi networks |
| Router | Layer 3 | IP address | Yes — finds best path | Connecting networks |
| Firewall | Layer 3-7 | IP, Port, Content | Yes — allows or blocks | Security control |
| Load Balancer | Layer 4-7 | IP, Port, URL | Yes — distributes traffic | Scaling applications |

#### Modem — The ISP Connection

A **modem** (Modulator-Demodulator) converts between the digital signals your computer uses and the analog signals that travel over telephone or cable lines to your ISP. It is what connects your home router to the internet.

```
Your devices --> Router --> Modem --> ISP cable/phone line --> Internet
```

In cloud environments, there are no modems — your virtual machines connect directly to the cloud provider's high-speed network.

### 🔥 Firewalls — Your Network's Security Guard

A **firewall** is a security system that decides what network traffic is allowed in and out. Think of it like a bouncer at a club — it checks every person (packet) trying to enter or leave and decides based on rules who gets through.

In DevOps you configure firewalls constantly — on Linux servers (`ufw`), in cloud environments (AWS Security Groups), and at network boundaries.

#### Types of Firewalls

**Packet Filtering** — the basic type:
- Checks each packet's header: source IP, destination IP, port, protocol
- Simple yes/no decision based on rules
- Fast but does not look inside the packet
- Like a border guard checking passports but not luggage

**Stateful Inspection** — the smarter type:
- Keeps track of active connections
- Knows if a packet belongs to an established conversation or is suspicious new traffic
- Can block packets that are not part of a known connection
- Used in most modern firewalls including AWS Security Groups

**Next-Generation Firewall (NGFW)** — the advanced type:
- Everything above plus: malware scanning, application awareness, encrypted traffic inspection
- Used in enterprise environments
- AWS WAF (Web Application Firewall) is an example

#### Configuring Firewalls on Linux

```bash
# UFW — Ubuntu's easy firewall interface
sudo ufw status                     # Is the firewall on? What rules exist?
sudo ufw enable                     # Turn it on
                                    # IMPORTANT: allow SSH before enabling or you lock yourself out!

# Allow common ports
sudo ufw allow 22                   # SSH — allow remote access
sudo ufw allow 80                   # HTTP — allow web traffic
sudo ufw allow 443                  # HTTPS — allow secure web traffic
sudo ufw allow 3000                 # Custom app port

# More specific rules
sudo ufw allow from 192.168.1.0/24 to any port 22   # SSH from local network only
sudo ufw deny 3306                  # Block MySQL from internet (should only be internal)
sudo ufw deny 5432                  # Block PostgreSQL from internet

# View and manage rules
sudo ufw status verbose             # See all rules with details
sudo ufw status numbered            # Show rules with numbers
sudo ufw delete 3                   # Delete rule number 3

# firewalld — CentOS/RHEL systems
sudo systemctl start firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload          # Apply the changes
sudo firewall-cmd --list-all        # See all active rules
```

---

## 🔌 05. Network Protocols — The Languages of the Internet

A **protocol** is a set of rules that two devices agree to follow so they can communicate. Think of it like a language — you can only have a conversation if both people speak the same language. Computers can only exchange data if they use the same protocol.

Every tool in your DevOps work runs on protocols. HTTP powers APIs. SSH secures server access. DNS resolves domain names. HTTPS encrypts everything. Understanding which protocol does what — and why — makes you a much more effective engineer.

![Add image here: Protocol stack diagram showing HTTP over TCP over IP over Ethernet](https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80)

#### When You Run curl, Every Layer Has a Protocol

```bash
curl https://api.example.com/users
```

What is actually happening under the hood:

```
Layer 7 (Application):   HTTP — formats your GET request
Layer 6 (Presentation):  TLS  — encrypts the request (HTTPS)
Layer 4 (Transport):     TCP  — ensures reliable delivery on port 443
Layer 3 (Network):       IP   — routes packets to the server's IP address
Layer 2 (Data Link):     Ethernet — sends frames to your router's MAC address
Layer 1 (Physical):      Electrical signal through cable / radio wave through air
```

Every layer adds a header of its own. At the receiving end, each layer removes its header and passes the data up. This is called **encapsulation** on the way down and **decapsulation** on the way up.

#### The Most Important Protocols to Know

**HTTP — HyperText Transfer Protocol:**
- The foundation of the web — every API, every website uses it
- Works as request-response: client asks, server answers
- Stateless — each request is completely independent
- Runs on TCP port 80
- Not encrypted — data is visible to anyone on the network path

**HTTPS — HTTP Secure:**
- HTTP + TLS encryption
- Port 443
- The padlock icon in your browser = HTTPS
- Use HTTPS for everything that handles user data — no exceptions

**SSH — Secure Shell:**
- Lets you remotely control a Linux server through an encrypted connection
- Port 22
- Replaced Telnet (which sent everything as plain readable text — dangerous)
- Also used for secure file transfer (SCP and SFTP)

**FTP — File Transfer Protocol:**
- Transfers files between client and server
- Port 21
- Not encrypted — use SFTP instead in production
- Still seen in legacy systems

**DNS — Domain Name System:**
- Translates domain names to IP addresses
- Port 53, uses UDP for queries (fast), TCP for large responses
- Covered in detail in section 03

**DHCP — Dynamic Host Configuration Protocol:**
- Automatically assigns IP addresses to devices when they join a network
- When your laptop connects to Wi-Fi, DHCP gives it an IP address automatically
- Port 67/68, uses UDP

**ICMP — Internet Control Message Protocol:**
- Used for diagnostic messages between network devices
- The `ping` command uses ICMP
- Has no port — operates directly at the IP layer

#### Protocol Quick Reference

| Protocol | Port | Transport | Encrypted? | Used For |
|---|---|---|---|---|
| HTTP | 80 | TCP | No | Web pages, APIs |
| HTTPS | 443 | TCP | Yes (TLS) | Secure web, secure APIs |
| SSH | 22 | TCP | Yes | Remote server access, file transfer |
| FTP | 21 | TCP | No | File transfer (legacy) |
| SFTP | 22 | TCP | Yes | Secure file transfer |
| DNS | 53 | UDP/TCP | No (by default) | Name resolution |
| DHCP | 67/68 | UDP | No | Auto IP assignment |
| SMTP | 25/587 | TCP | Optional | Sending email |
| IMAP | 143/993 | TCP | Yes (993) | Reading email |
| MySQL | 3306 | TCP | Optional | Database |
| PostgreSQL | 5432 | TCP | Optional | Database |
| Redis | 6379 | TCP | Optional | Cache / message queue |
| ICMP | None | — | No | ping, traceroute |

### 📖 HTTP Deep Dive — What DevOps Engineers Must Know

HTTP is the protocol you interact with most. Every API test, every health check, every nginx config, every load balancer log uses HTTP. Let's go deeper.

#### HTTP Methods

```
GET     → Retrieve data       "Give me the list of users"
POST    → Create data          "Create a new user"
PUT     → Replace data         "Replace user 5 with this"
PATCH   → Partially update     "Just update the email of user 5"
DELETE  → Remove data          "Delete user 5"
```

#### HTTP Status Codes — Read These Like a Language

When something breaks, the status code is the first clue. Read it correctly and you immediately know where to look.

```
2xx — Success (everything worked)
  200 OK              → Request succeeded, here is your data
  201 Created         → New resource was created successfully
  204 No Content      → Success but nothing to return (common for DELETE)

3xx — Redirect (go somewhere else)
  301 Moved Permanently  → Resource has a new permanent URL
  302 Found              → Temporary redirect
  304 Not Modified       → Your cached version is still good (browser caching)

4xx — Client Error (you did something wrong)
  400 Bad Request     → Your request is malformed — check your JSON
  401 Unauthorized    → You need to authenticate first
  403 Forbidden       → You are authenticated but not allowed to do this
  404 Not Found       → That resource does not exist
  429 Too Many Requests → You are being rate limited — slow down

5xx — Server Error (the server broke)
  500 Internal Server Error → Something crashed on the server — check server logs
  502 Bad Gateway           → nginx/proxy got bad response from upstream app
  503 Service Unavailable   → Server is overloaded or down for maintenance
  504 Gateway Timeout       → Upstream app took too long to respond
```

When you see a **502** in nginx, you immediately know: nginx is fine, but the app behind it is broken. When you see **504**, the app is too slow. These codes tell you exactly which layer to investigate.

---

## 🛠️ 06. Linux Networking Commands — Your Daily Toolkit

These are the commands you will use every single day when working with servers. Learn them properly now and you will solve problems in 5 minutes that would otherwise take hours.

The best way to think about these tools: each one answers a specific question. Pick the right question, pick the right tool.

```
"Is this host reachable?"              → ping
"What is the IP for this domain?"      → dig / nslookup
"Is this port open and listening?"     → netstat / ss
"What is the HTTP response?"           → curl
"Where does the network path fail?"    → traceroute
"What is my IP / routing?"             → ip addr / ip route
"Download this file"                   → wget / curl
```

#### The Systematic Debugging Approach

Before using individual tools, here is the mental flow experienced engineers use. It works for almost any connection problem:

```
Something cannot connect?

1. Can I ping it?
   ping server-ip
   YES → network path works, problem is at service level
   NO  → routing or firewall issue

2. Does DNS resolve?
   dig hostname
   YES → DNS fine, use the IP directly
   NO  → DNS problem, check /etc/resolv.conf

3. Is the port open?
   ss -tulpn | grep :PORT
   YES → service listening, firewall might be blocking
   NO  → service not running, start it

4. What does the raw response say?
   curl -v http://server:port
   Gives you the exact HTTP error or connection error

5. Is a firewall blocking?
   sudo ufw status
   telnet server port
```

Work through these five steps and you will find 95% of problems. Stop guessing and start being systematic.

### 🏓 ping — Test if a Host is Reachable

`ping` sends small test packets (ICMP echo requests) to a host and tells you if they come back, and how long it took. It is always the first diagnostic tool you reach for.

```bash
ping google.com                     # Continuous ping until you press Ctrl+C
ping -c 4 google.com                # Send exactly 4 packets then stop
ping -c 1 192.168.1.100             # Quick one-shot check: is this host alive?
ping -i 2 google.com                # Ping every 2 seconds (default = 1)
ping -W 2 192.168.1.100             # Timeout after 2 seconds per packet (good for scripts)

# Reading the output:
# 64 bytes from 142.250.185.46: icmp_seq=1 ttl=118 time=12.4 ms
#                                                           ^-- round trip time
#
# --- google.com ping statistics ---
# 4 packets transmitted, 4 received, 0% packet loss
#                                    ^-- 0% is good. High % = network problem.
#
# rtt min/avg/max = 12.1/12.4/12.8 ms
#                   ^-- how consistent the latency is
```

**What ping tells you:**
- Host is reachable (Layer 3 networking is working)
- How fast the connection is (latency)
- How reliable it is (packet loss)

**What ping does NOT tell you:** Whether a specific service or port is open. A server can respond to ping but have its web server firewalled off.

### 🔍 netstat & ss — See What Ports Are Open

`ss` (and the older `netstat`) shows all network connections and which ports are listening on your server. Use this when you need to know "is my app actually running and listening?" or "what process is on port 80?"

```bash
# ss — modern, fast replacement for netstat
ss -tulpn                           # All listening ports with process names
# -t = TCP only
# -u = UDP only
# -l = listening (not established connections)
# -p = show which process owns each socket
# -n = show numbers not names (faster)

ss -tulpn | grep :80                # Is anything listening on port 80?
ss -tulpn | grep :3000              # Is my Node.js app running?
ss -tulpn | grep :5432              # Is PostgreSQL listening?

# netstat — older command, works on all systems
netstat -tulpn                      # Same as ss -tulpn
netstat -an | grep ESTABLISHED      # All active connections right now

# lsof — find which process owns a specific port
sudo lsof -i :80                    # What process is using port 80?
sudo lsof -i :3000                  # Which process is on 3000?

# Reading the output:
# tcp  0  0  0.0.0.0:80    0.0.0.0:*  LISTEN  1234/nginx
#                 ^-- port          ^-- status    ^-- process name
#
# 0.0.0.0:80    = listening on ALL interfaces -- reachable from outside (good)
# 127.0.0.1:80  = listening on localhost only -- NOT reachable from outside (bad)
```

**Common trap:** Your app is running but you cannot reach it from outside. Check `ss -tulpn` — if it shows `127.0.0.1:3000` instead of `0.0.0.0:3000`, your app is only listening on localhost. nginx cannot proxy to it and external traffic cannot reach it. Fix it by telling your app to bind to `0.0.0.0` instead.

### 🌐 curl — Make HTTP Requests from Terminal

`curl` is your Swiss Army knife for HTTP. Test APIs, check server responses, download files, debug SSL certificates, script health checks — curl does all of it.

```bash
# Basic requests
curl https://example.com                    # GET request — show the response body
curl -s https://example.com                 # Silent — no progress bar
curl -I https://example.com                 # Headers only (no body)
curl -v https://example.com                 # Verbose — show everything happening
                                            # Best for debugging SSL, redirects, auth

# Check if a URL is up and what status code it returns
curl -o /dev/null -s -w "%{http_code}" https://example.com
# Output: 200  (or 404, 500, 502 etc.)
# Great for health check scripts in CI/CD

# API calls — what you do every day
curl -X GET https://api.example.com/users \
  -H "Authorization: Bearer your-token-here" \
  -H "Accept: application/json"

curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{"name": "Daksh", "email": "daksh@example.com"}'

# Download files
curl -O https://example.com/file.tar.gz     # Save with original name
curl -o myfile.zip https://example.com/f    # Save with custom name
curl -L https://short.url/abc               # -L follows redirects

# Get your public IP
curl -s https://ifconfig.me                 # Returns just your public IP

# Health check in a deploy script
if curl -sf https://myapp.com/health > /dev/null; then
    echo "Deployment successful — app is healthy"
else
    echo "HEALTH CHECK FAILED — rolling back"
    exit 1
fi
```

### 🗺️ traceroute — Follow the Path to a Server

`traceroute` shows every router hop that your data passes through on the way to a destination. When `ping` fails, `traceroute` shows you exactly **where** in the network it stops working.

```bash
traceroute google.com               # Trace the full path to google.com
traceroute -n google.com            # Numeric output (no hostname lookups -- faster)

# Reading the output:
#  1  192.168.1.1      1.2 ms   = your home router
#  2  10.50.0.1        5.3 ms   = your ISP's first router
#  3  172.16.0.45      8.1 ms   = ISP backbone
#  4  * * *                     = firewall blocking ICMP (this is normal, not broken)
#  5  108.170.252.1    11 ms    = Google's network
#  6  142.250.185.46   12 ms    = destination reached

# mtr -- combines ping and traceroute, updates live
mtr google.com                      # Live updating view of each hop
mtr --report google.com             # Run once and show a summary report

# How to use traceroute for debugging:
# If traceroute stops at hop 4 between your ISP and destination:
# The problem is in your ISP's network, not on your server
# If it stops right at hop 1: problem is in your local network/router
```

### 🔧 ip & route — Check and Configure Networking

The `ip` command is the modern way to inspect and configure your server's network configuration.

```bash
# View your network setup
ip addr show                        # All interfaces and IP addresses
ip addr show eth0                   # Just eth0 interface
ip link show                        # Interface status (UP or DOWN)

# View routing table — how your server decides where to send traffic
ip route show
ip route
route -n                            # Classic command — numeric output

# Reading the routing table:
# default via 10.0.1.1 dev eth0
#   ^-- "for everything else, send it to 10.0.1.1 (the gateway)"
# 10.0.1.0/24 dev eth0 proto kernel
#   ^-- "for 10.0.1.x, send directly out of eth0 (same subnet)"

# Add a temporary static route
sudo ip route add 10.0.2.0/24 via 10.0.1.1   # Send 10.0.2.x traffic via this gateway
sudo ip route del 10.0.2.0/24                  # Remove a route

# Useful one-liners
ip route | grep default                         # What is my default gateway?
ip addr | grep "inet " | grep -v 127            # My non-loopback IPs
```

### 📡 wget — Simple File Downloads

`wget` is simpler than curl for just downloading files. It is great in scripts because it handles interruptions and retries automatically.

```bash
wget https://example.com/file.tar.gz            # Download to current directory
wget -O custom-name.zip https://example.com/f   # Download with custom filename
wget -c https://example.com/huge-file.iso       # Resume a broken download
wget -q https://example.com/file                # Quiet — no output
wget --limit-rate=1M https://example.com/f      # Limit speed to 1 MB/s

# Download and run an install script (very common pattern)
wget -qO- https://get.docker.com | bash         # Install Docker
```

---

## 🔒 07. Network Security — Protecting Your Infrastructure

Security is not something you add later — it is built into how you set things up from day one. The most common production security incidents are embarrassingly simple to prevent: exposed database ports, default passwords, plain HTTP instead of HTTPS. Do not let this happen to you.

The core security principle in networking is simple: **only expose what actually needs to be exposed**. Every open port that does not need to be open is a door for attackers.

![Add image here: Server security diagram showing public vs private network zones](https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80)

#### What Should and Should Not Be Public

```
Expose to the internet (0.0.0.0):
  Port 80   → HTTP  (redirect users to HTTPS)
  Port 443  → HTTPS (your application)
  Port 22   → SSH   (ideally restricted to your IP only)

Internal only (accessible from within your network):
  Port 3306 → MySQL        (only app servers should reach this)
  Port 5432 → PostgreSQL   (only app servers should reach this)
  Port 6379 → Redis        (only app servers should reach this)
  Port 8080 → App server   (only nginx/load balancer should reach this)

Never expose these:
  Admin dashboards (Jenkins, Grafana, K8s dashboard) — VPN or SSH tunnel only
  Debug ports (Node.js inspector port 9229)
  Metrics endpoints (Prometheus :9090) — internal only
```

#### SSH Security — Harden Your Entry Point

SSH is how you access every server. If it is misconfigured, it is the biggest attack surface you have. Bots scan the entire internet continuously looking for weak SSH configurations.

```bash
# Edit SSH server config
sudo nano /etc/ssh/sshd_config

# Critical settings to change:
PermitRootLogin no          # Never let root login directly via SSH
PasswordAuthentication no   # Keys only — disable password login
Port 2222                   # Change default port (reduces automated bot noise)
AllowUsers daksh deploy     # Whitelist only specific usernames
LoginGraceTime 30           # Disconnect if not authenticated within 30 seconds
MaxAuthTries 3              # Lock out after 3 failed attempts

# After editing, restart SSH daemon
sudo systemctl restart sshd

# See who has been trying to break in
grep "Failed password" /var/log/auth.log | tail -20
grep "Invalid user" /var/log/auth.log | tail -20
# If you see thousands of attempts from random IPs, that is normal.
# It is why we disable password auth — keys cannot be brute-forced.
```

### 🔐 TLS/SSL — Encrypting Everything in Transit

**TLS (Transport Layer Security)** is the encryption that turns HTTP into HTTPS. It ensures that data travelling between a browser and a server cannot be read by anyone in the middle — not your ISP, not anyone on your Wi-Fi, not anyone intercepting traffic.

```
Without TLS (HTTP):
  Browser  -->  username=daksh&password=secret  -->  Server
  Anyone on the network path can read this. Bad.

With TLS (HTTPS):
  Browser  -->  x7k$#mNp9@q2!vB3...  -->  Server
  Looks like garbage to anyone intercepting. Safe.
```-

**How TLS works (simplified):**

```text
1. Client connects and says "I want HTTPS"

2. Server sends its SSL certificate
   (Contains: server's identity, public key, signed by a trusted CA)

3. Client verifies the certificate is legitimate
   (Your browser shows a padlock when this succeeds)

4. They agree on an encryption key using the public key
   (The key never crosses the network in readable form)

5. All data is now encrypted with that shared key
```

```bash
# Check the SSL certificate of any website
openssl s_client -connect google.com:443 -showcerts

# Check certificate expiry (expired certs break EVERYTHING)
echo | openssl s_client -connect yoursite.com:443 2>/dev/null | \
  openssl x509 -noout -dates
# Not After = expiry date — alert if within 30 days!

# Get a free SSL certificate with Let's Encrypt (certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
# Certbot automatically:
# - Gets a free certificate from Let's Encrypt
# - Configures nginx to use HTTPS
# - Sets up auto-renewal (certificates expire every 90 days)
```

---

## 📊 08. Diagnosing & Fixing Network Problems

The difference between a junior and a senior engineer is not knowing more commands — it is being **systematic** rather than random when something breaks. This section gives you the exact playbook.

Most networking problems fall into one of these three buckets:

```
Bucket 1 — Connectivity:  "I cannot reach the server at all"
Bucket 2 — DNS:           "I cannot resolve the hostname"
Bucket 3 — Service:       "I can reach the server but the app does not respond"
```

Identify the bucket first, then you know exactly which tools to use.

#### The Complete Diagnostic Toolkit

```bash
# Step 1 — Raw connectivity check
ping 8.8.8.8                        # Can I reach the internet? (bypasses DNS)
ping 192.168.1.1                    # Can I reach my gateway?
ip addr show                        # Do I actually have an IP address?
ip route show                       # Is my routing table correct?

# Step 2 — DNS check
dig google.com                      # Does DNS resolve at all?
dig @8.8.8.8 google.com             # Try Google's DNS directly (bypass local)
cat /etc/resolv.conf                # What DNS server is configured?
cat /etc/hosts                      # Any conflicting local overrides?

# Step 3 — Service / port check
ss -tulpn | grep :80                # Is nginx listening on 80?
ss -tulpn | grep :3000              # Is my app listening on 3000?
sudo lsof -i :80                    # Which process owns port 80?
systemctl status nginx              # Is nginx actually running?

# Step 4 — Application response check
curl -v http://localhost:80         # Test from inside the server
curl -v http://server-ip:80        # Test from outside
curl -o /dev/null -s -w "%{http_code}" http://server-ip

# Step 5 — Firewall check
sudo ufw status verbose             # What rules exist?
telnet server-ip 80                 # Can I connect to port 80 raw?
                                    # "Connected" = port is open
                                    # Hangs or "refused" = port is blocked
```

#### Common Problems and Exact Fixes

| Error Message | What It Means | How to Fix |
|---|---|---|
| `Connection refused` on port X | Nothing is listening on port X | Start the service / check port in app config |
| `Connection timed out` | Packet dropped — firewall or routing | Open the port in ufw / check security groups |
| `Name or service not known` | DNS resolution failed | Check /etc/resolv.conf / test with `dig` |
| `502 Bad Gateway` (nginx) | nginx running, upstream app broken | Check app logs with `journalctl -u myapp` |
| `504 Gateway Timeout` (nginx) | Upstream app too slow to respond | Check app performance, increase proxy timeout |
| `Permission denied (publickey)` | SSH key mismatch | Check `~/.ssh/authorized_keys` on server |
| `ssh: connect to host X port 22` | SSH port blocked or server down | Check firewall / verify server is running |

---

## 🎯 Quick Reference — All Networking Commands

Every networking command you will ever need, organised by what question it answers. Bookmark this page — you will come back to it constantly when working on any server.

### 📋 Command Tables by Category

#### Connectivity Testing

| Command | What It Answers |
|---|---|
| `ping -c 4 host` | Is this host reachable? |
| `ping -c 1 -W 2 host` | Quick check with 2s timeout |
| `traceroute host` | Where does the path to this host fail? |
| `mtr host` | Live traceroute with packet loss per hop |
| `curl -I https://host` | Is the web server responding? |
| `telnet host port` | Is this specific TCP port open? |

#### DNS Lookup

| Command | What It Answers |
|---|---|
| `dig domain` | Full DNS query with all details |
| `dig +short domain` | Just the IP address |
| `dig domain MX` | Mail server records |
| `nslookup domain` | Quick DNS lookup |
| `dig @8.8.8.8 domain` | Query Google DNS directly |
| `cat /etc/resolv.conf` | What DNS server am I using? |
| `cat /etc/hosts` | Any local DNS overrides? |

#### Port & Service

| Command | What It Answers |
|---|---|
| `ss -tulpn` | All listening ports + which process |
| `ss -tulpn \| grep :80` | Is something on port 80? |
| `sudo lsof -i :3000` | Which process owns port 3000? |
| `netstat -tulpn` | Same as ss (older systems) |

#### Interface & Routing

| Command | What It Answers |
|---|---|
| `ip addr show` | What are my IP addresses? |
| `ip route show` | What is my routing table? |
| `hostname -I` | Quick list of my IPs |
| `curl -s ifconfig.me` | What is my public IP? |
| `ip route \| grep default` | What is my gateway? |

#### Downloads & HTTP

| Command | What It Does |
|---|---|
| `curl -v https://url` | Verbose request — shows all headers |
| `curl -X POST url -d '{}'` | POST with JSON body |
| `curl -o /dev/null -s -w "%{http_code}" url` | Just get status code |
| `wget url` | Download a file |
| `wget -c url` | Resume interrupted download |

#### Firewall

| Command | What It Does |
|---|---|
| `sudo ufw status verbose` | See all rules |
| `sudo ufw allow 443` | Open a port |
| `sudo ufw deny 3306` | Block a port |
| `sudo ufw enable` | Turn firewall on |
| `sudo firewall-cmd --list-all` | Rules on CentOS/RHEL |

---

## 🗺️ What Comes After Networking

You have now completed the two most critical foundations. Every tool you learn from here — Docker, Kubernetes, cloud networking — is just networking concepts with different names. You already understand how they work underneath.

### 🚀 Your DevOps Roadmap From Here

```
[DONE] Linux (Module 1 -- complete)
[DONE] Networking (Module 2 -- you are here)
         ↓
[NEXT] Docker
   Containers run on virtual networks -- bridge, host, overlay
   Port mapping (-p 3000:3000) is a networking concept you now understand
   Container DNS is just DNS running inside Docker
         ↓
[NEXT] Kubernetes
   Services, Ingress, Network Policies -- all networking
   ClusterIP, NodePort, LoadBalancer are network address types
   CoreDNS handles service discovery between pods
         ↓
[NEXT] Cloud Networking (AWS / GCP / Azure)
   VPC = your private network in the cloud
   Subnets = the same subnets you learned here
   Security Groups = stateful firewalls (just like ufw)
   Route Tables = routing tables (just like ip route)
         ↓
[NEXT] Security & Compliance
   Zero-trust networking, mutual TLS, network policies
   Everything builds on what you learned in this module
```

Every tool you learn next builds on what you just learned here. Docker networking, Kubernetes services, AWS VPCs — they are all just networking with different names. You already understand the foundations.

---

> 📚 **Resources to Go Deeper:**
> - [Cloudflare Learning Center](https://www.cloudflare.com/learning/) — The best free explanations of networking on the internet
> - [Julia Evans Networking Zines](https://wizardzines.com) — Visual beginner-friendly networking guides
> - [Subnet Calculator](https://www.subnet-calculator.com/) — Calculate subnets visually with a tool
> - [ExplainShell](https://explainshell.com) — Paste any command and see exactly what each part does