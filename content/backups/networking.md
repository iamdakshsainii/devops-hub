# Networking

The first step to understanding networking fundamentals and communication between systems.

## Introduction

### nslookup — simple and quick

nslookup google.com               # Get the IP for google.com
nslookup -type=MX gmail.com       # Get Gmail's mail servers
nslookup -type=NS google.com      # Get Google's nameservers

### dig — more detailed, better for troubleshooting

dig google.com                    # Full DNS query with all details
dig +short google.com             # Just the IP address — nothing else
dig google.com MX                 # Get mail server records
dig google.com NS                 # Get nameserver records
dig @8.8.8.8 google.com           # Query Google's DNS directly

### bypasses your local DNS — good for testing



### Your system's DNS config

cat /etc/resolv.conf              # Which DNS server is your system using?

### /etc/hosts — local overrides, checked BEFORE DNS

cat /etc/hosts

### Add: 192.168.1.100  myserver.local



### Now "myserver.local" resolves locally without going to DNS

```

---

These are the hardware pieces (or cloud software equivalents) that control how data flows. Understanding them helps you understand AWS architecture — because VPCs, security groups, NAT gateways are all software versions of these physical devices.

#### Hub — Layer 1 (Obsolete)

A hub takes anything arriving on one port and sends it out of **all** other ports. No intelligence — just shouts everything everywhere.

```
Device A sends to Device C via Hub:

Device A → HUB → Device B (gets it — shouldn't)
               → Device C (intended — gets it)
               → Device D (gets it — shouldn't)
```

Everyone sees everyone's traffic. Security nightmare. Completely replaced by switches. You will never buy one — but knowing why it was replaced explains what switches improved.

#### Switch — Layer 2 (Smart Delivery)

A switch learns the MAC address of every device plugged into each port. When data arrives, it sends it **only** to the correct port. Like a hotel receptionist who knows exactly which room each guest is in.

```
Device A sends to Device C via Switch:

Device A → SWITCH (checks MAC table)
               → Device C only
           Device B and D receive nothing
```

Switches are everywhere — offices, data centres, cloud. Fast, efficient, and secure.

#### Router — Layer 3 (Network Connector)

A router connects **different networks** together. It reads IP addresses to find the best path for data — even across the internet. It maintains a routing table: "to reach network X, send via Y."

```
Your home network (192.168.1.x)
         ↓
      ROUTER  (reads IP, decides where to send)
         ↓
      Your ISP
         ↓
    The Internet
         ↓
   Google's servers
```

Your home Wi-Fi box is a router + switch + Wi-Fi access point all in one.

#### Firewall — Layer 3-7 (Security Guard)

A firewall decides what traffic is allowed in and out. Like a bouncer at a club — checks every packet and allows or blocks based on rules. Covered in detail in section 08.

#### Load Balancer — Layer 4-7 (Traffic Distributor)

Sits in front of multiple servers and distributes incoming requests across them. If one server goes down, it routes to the others. Used in every production deployment.

#### Device Summary

| Device | Layer | Identifies By | Does What |
| :--- | :--- | :--- | :--- |
| Hub | 1 | Nothing | Broadcasts to all ports — obsolete |
| Switch | 2 | MAC address | Sends to correct device only |
| Router | 3 | IP address | Connects different networks |
| Firewall | 3-7 | IP, Port, Content | Allows or blocks traffic |
| Load Balancer | 4-7 | IP, Port, URL | Distributes traffic across servers |

---

A protocol is a set of rules two devices agree on to communicate. Think of it like a language — you can only have a conversation if both sides speak the same one.

Every tool in your DevOps work runs on a protocol. HTTP powers APIs. SSH secures server access. DNS resolves names. Understanding which protocol does what and why makes debugging much faster.

#### When You Run curl, Every Layer Has a Protocol

```bash
curl https://api.example.com/users
```

What is actually happening under the hood:

```
Layer 7 (Application):   HTTP  — formats your GET request
Layer 6 (Presentation):  TLS   — encrypts the request (HTTPS)
Layer 4 (Transport):     TCP   — reliable delivery on port 443
Layer 3 (Network):       IP    — routes packets to server's IP
Layer 2 (Data Link):     Ethernet — sends to your router's MAC
Layer 1 (Physical):      Electrical signal through cable
```

Each layer wraps the data with its own header on the way down, and unwraps it on the way up at the other end.

#### Protocol Reference Table

| Protocol | Port | Transport | Encrypted | Used For |
| :--- | :--- | :--- | :--- | :--- |
| HTTP | 80 | TCP | No | Web pages, APIs |
| HTTPS | 443 | TCP | Yes (TLS) | Secure web, secure APIs |
| SSH | 22 | TCP | Yes | Remote server access, file transfer |
| FTP | 21 | TCP | No | File transfer — use SFTP instead |
| SFTP | 22 | TCP | Yes | Secure file transfer |
| DNS | 53 | UDP/TCP | No | Name resolution |
| DHCP | 67/68 | UDP | No | Auto IP assignment |
| SMTP | 25/587 | TCP | Optional | Sending email |
| MySQL | 3306 | TCP | Optional | Database |
| PostgreSQL | 5432 | TCP | Optional | Database |
| Redis | 6379 | TCP | Optional | Cache / message queue |
| ICMP | None | — | No | ping, traceroute |

#### HTTP Methods

```
GET     → Retrieve data         "Give me the list of users"
POST    → Create data           "Create a new user"
PUT     → Replace data          "Replace user 5 completely"
PATCH   → Partially update      "Just update the email of user 5"
DELETE  → Remove data           "Delete user 5"
```

#### HTTP Status Codes — Read These Like a Language

When something breaks, the status code is the first clue. Read it correctly and you immediately know which layer to investigate.

```
2xx — Success
  200 OK             → request succeeded, here is your data
  201 Created        → new resource was created
  204 No Content     → success but nothing to return (common for DELETE)

3xx — Redirect
  301 Moved Permanently  → resource has a new permanent URL
  302 Found              → temporary redirect
  304 Not Modified       → your cached version is still valid

4xx — Client Error (you did something wrong)
  400 Bad Request    → your request is malformed — check your JSON
  401 Unauthorized   → you need to authenticate first
  403 Forbidden      → authenticated but not allowed to do this
  404 Not Found      → that resource does not exist
  429 Too Many       → you are being rate limited — slow down

5xx — Server Error (server broke)
  500 Internal Error    → something crashed on the server — check server logs
  502 Bad Gateway       → nginx is fine, the app behind it is broken
  503 Service Unavail   → server is overloaded or down
  504 Gateway Timeout   → upstream app is too slow to respond
```

502 = nginx is fine, check your app logs.
504 = app is running but responding too slowly.

---

These are the commands you use every day on any server. Each one answers a specific question — pick the right tool for the right problem.

```
"Is this host reachable?"               → ping
"What IP does this domain resolve to?"  → dig / nslookup
"Is this port open and listening?"      → ss
"What does the HTTP response look like?"→ curl
"Where does the network path fail?"     → traceroute / mtr
"What are my IPs and routes?"           → ip addr / ip route
```

#### Systematic Debugging Flow

**Problem** — Something cannot connect and you start randomly checking things for an hour without finding it.

**Solution** — Work through these five steps in order. You will find 95% of problems this way.

```
Step 1 — Can I ping it?
         ping server-ip
         Yes → network path works, problem is at service level
         No  → routing or firewall issue

Step 2 — Does DNS resolve?
         dig hostname
         Yes → DNS fine, continue
         No  → DNS broken, check /etc/resolv.conf

Step 3 — Is the port open?
         ss -tulpn | grep :PORT
         Shows → service is listening
         Empty → service is not running, start it

Step 4 — What does the raw HTTP response say?
         curl -v http://server:port
         Shows the exact error or connection failure

Step 5 — Is a firewall blocking?
         sudo ufw status
         telnet server port  → "Connected" means open, hangs means blocked
```

#### ping — Test if a Host is Reachable

```bash
ping google.com                  # Continuous ping until Ctrl+C
ping -c 4 google.com             # Send exactly 4 packets then stop
ping -c 1 192.168.1.100          # Quick one-shot: is this host alive?
ping -W 2 192.168.1.100          # Timeout after 2 seconds — good for scripts
```

Reading the output:
```
64 bytes from 142.250.185.46: icmp_seq=1 ttl=118 time=12.4 ms
                                                         ^── round trip time in ms

4 packets transmitted, 4 received, 0% packet loss
                                   ^── 0% is good. Any % loss = network problem.

rtt min/avg/max = 12.1/12.4/12.8 ms
```

Ping tells you: is the host reachable and how fast is the connection.
Ping does NOT tell you: whether a specific port or service is open.

#### ss — See What Ports Are Open

**Problem** — Your app is running but you cannot reach it from outside. You don't know if it is even listening on the right port or the right interface.

**Solution** — Use `ss` to see exactly what is listening on which port and which process owns it.

```bash
ss -tulpn                          # All listening ports with process names
ss -tulpn | grep :80               # Is anything listening on port 80?
ss -tulpn | grep :3000             # Is my Node.js app running?
ss -tulpn | grep :5432             # Is PostgreSQL listening?
sudo lsof -i :80                   # Which process owns port 80?
netstat -tulpn                     # Older equivalent — works on all systems
```

Critical thing to know when reading output:

```
127.0.0.1:3000  → listening on localhost only — NOT reachable from outside
0.0.0.0:3000    → listening on all interfaces — reachable from outside
```

If your app shows `127.0.0.1:3000` — nginx cannot proxy to it and external traffic cannot reach it. Fix: configure your app to bind to `0.0.0.0` instead of `127.0.0.1`.

#### curl — Make HTTP Requests from Terminal

```bash

### Basic requests

curl https://example.com                         # GET — show response body
curl -s https://example.com                      # Silent — no progress bar
curl -I https://example.com                      # Headers only — no body
curl -v https://example.com                      # Verbose — show everything

### Best for debugging SSL, redirects



### Get just the HTTP status code — great for health check scripts

curl -o /dev/null -s -w "%{http_code}" https://example.com

### API calls

curl -X GET https://api.example.com/users \
  -H "Authorization: Bearer your-token" \
  -H "Accept: application/json"

curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"name": "Daksh", "email": "daksh@example.com"}'

### Download files

curl -O https://example.com/file.tar.gz          # Save with original filename
curl -o myfile.zip https://example.com/file      # Save with custom filename
curl -L https://short.url/abc                    # Follow redirects

### Get your public IP

curl -s https://ifconfig.me

if curl -sf https://myapp.com/health > /dev/null; then
    echo "App is healthy"
else
    echo "Health check failed — rolling back"
    exit 1
fi
```

#### traceroute — Follow the Path to a Server

**Problem** — ping fails but you don't know where in the network path it is breaking — your server? Your ISP? The destination?

**Solution** — Use traceroute. It shows every router hop your data passes through, so you can see exactly where it stops.

```bash
traceroute google.com              # Full path to destination
traceroute -n google.com           # Numeric — no hostname lookups, faster
mtr google.com                     # Live updating traceroute — best for diagnosis
mtr --report google.com            # Run once and show summary
```

Reading the output:
```
1  192.168.1.1      1.2ms   → your home router (first hop)
2  10.50.0.1        5.3ms   → ISP's first router
3  172.16.0.45      8.1ms   → ISP backbone
4  * * *                    → firewall blocking ICMP — normal, not broken
5  142.250.185.46   12ms    → destination reached
```

If it stops at hop 2 — problem is in your ISP's network, not your server.
If it stops at hop 1 — problem is in your local network or router.

#### ip — Check and Understand Your Network Config

```bash
ip addr show                       # All interfaces and IP addresses
ip addr show eth0                  # Just the eth0 interface
ip link show                       # Interface status — UP or DOWN
ip route show                      # Full routing table
ip route | grep default            # What is my default gateway?
```

Reading the routing table:
```
default via 10.0.1.1 dev eth0
^── "for everything else, send it to gateway 10.0.1.1"

10.0.1.0/24 dev eth0 proto kernel
^── "for 10.0.1.x addresses, send directly out of eth0 (same subnet)"
```

```bash

### Add a temporary static route

sudo ip route add 10.0.2.0/24 via 10.0.1.1    # Send 10.0.2.x traffic via this gateway

sudo ip route del 10.0.2.0/24
```

#### wget — Simple File Downloads

```bash
wget https://example.com/file.tar.gz             # Download to current directory
wget -O custom-name.zip https://example.com/f    # Save with custom filename
wget -c https://example.com/huge-file.iso        # Resume a broken download
wget -q https://example.com/file                 # Quiet — no output
wget --limit-rate=1M https://example.com/file    # Limit speed to 1 MB/s

### Install Docker — very common real-world pattern

wget -qO- https://get.docker.com | bash
```

---

## 08. Firewall — ufw

**Problem** — By default, a fresh Linux server has all ports accessible. Your database, your app, your admin panels — all open to the internet. Any bot scanning the internet can reach them.

**Solution** — Use `ufw` to lock everything down. Only open what actually needs to be open.

```
Expose to internet:       80 (HTTP), 443 (HTTPS), 22 (SSH — ideally your IP only)
Keep internal only:       3306 (MySQL), 5432 (Postgres), 6379 (Redis), 8080 (app)
Never expose:             Admin dashboards, debug ports, metrics endpoints
```

```bash
sudo ufw status verbose                               # See all current rules
sudo ufw enable                                       # Turn firewall on

### Always allow SSH first or you lock yourself out



### Allow common ports

sudo ufw allow 22                                     # SSH
sudo ufw allow 80                                     # HTTP
sudo ufw allow 443                                    # HTTPS
sudo ufw allow 3000                                   # Custom app port

### More specific rules

sudo ufw allow from 192.168.1.0/24 to any port 22    # SSH from local network only
sudo ufw deny 3306                                    # Block MySQL from internet
sudo ufw deny 5432                                    # Block Postgres from internet

### Manage rules

sudo ufw status numbered                              # Show rules with numbers
sudo ufw delete 3                                     # Delete rule number 3
```

On CentOS / RHEL systems:

```bash
sudo systemctl start firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload                            # Apply changes
sudo firewall-cmd --list-all                          # See all active rules
```

---

## 09. SSH Security

SSH is how you access every server. If misconfigured, it is your biggest attack surface. Bots continuously scan the entire internet looking for weak SSH setups — thousands of login attempts per day against every public server.

**Problem** — Default SSH config allows password logins and root access. Both can be brute-forced.

**Solution** — Disable passwords entirely, disallow root login, and restrict access to known users only.

```bash
sudo nano /etc/ssh/sshd_config
```

```bash
PermitRootLogin no             # Never allow root to SSH in directly
PasswordAuthentication no      # Disable passwords — keys only
Port 2222                      # Change default port to reduce bot noise
AllowUsers daksh deploy        # Whitelist only specific usernames
LoginGraceTime 30              # Disconnect if not authenticated in 30 seconds
MaxAuthTries 3                 # Lock out after 3 failed attempts
```

```bash
sudo systemctl restart sshd    # Apply config changes

### See who has been trying to break in

grep "Failed password" /var/log/auth.log | tail -20
grep "Invalid user" /var/log/auth.log | tail -20

### Thousands of attempts from random IPs is completely normal



### That is exactly why we disable password auth — SSH keys cannot be brute-forced

```

---

## 10. TLS/SSL — Why HTTPS Exists

TLS (Transport Layer Security) is the encryption that turns HTTP into HTTPS. It ensures data between a browser and server cannot be read by anyone in the middle — not your ISP, not anyone on your Wi-Fi.

```
Without TLS (HTTP):
  Browser → username=daksh&password=secret → Server
  Anyone on the network path can read this. Dangerous.

With TLS (HTTPS):
  Browser → x7k$#mNp9@q2!vB3... → Server
  Looks like garbage to anyone intercepting. Safe.
```

How TLS works in simple steps:

```
1. Client connects and says "I want HTTPS"

2. Server sends its SSL certificate
   (Contains server identity + public key, signed by a trusted Certificate Authority)

3. Client verifies the certificate is legitimate
   (This is what the browser padlock icon means)

4. Both sides agree on an encryption key using the public key
   (The actual encryption key never crosses the network in readable form)

5. All data from here is encrypted with that shared key
```

```bash

### Check the SSL certificate of any site

openssl s_client -connect google.com:443 -showcerts

### Check certificate expiry — expired certs break everything instantly

echo | openssl s_client -connect yoursite.com:443 2>/dev/null | \
  openssl x509 -noout -dates

### Not After = expiry date — alert if within 30 days



### Get a free SSL certificate with Let's Encrypt

sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

### Certbot automatically:



### → gets a free cert from Let's Encrypt



### → configures nginx to use HTTPS



### → sets up auto-renewal (certs expire every 90 days)

```

---

## 11. Common Errors and Exact Fixes

| Error | What It Means | How to Fix |
| :--- | :--- | :--- |
| `Connection refused` on port X | Nothing is listening on that port | Start the service / check port in app config |
| `Connection timed out` | Packet dropped — firewall or routing issue | Open port in ufw / check AWS security groups |
| `Name or service not known` | DNS resolution failed | Check `/etc/resolv.conf`, test with `dig` |
| `502 Bad Gateway` | nginx running, upstream app broken | Check app logs — `journalctl -u myapp` |
| `504 Gateway Timeout` | App responding but too slowly | Check app performance, increase proxy timeout |
| `Permission denied (publickey)` | SSH key mismatch | Check `~/.ssh/authorized_keys` on server |
| `ssh: connect to host X port 22` | SSH port blocked or server down | Check firewall / verify server is running |

---

#### Connectivity
```bash
ping -c 4 host                                        # Is this host reachable?
ping -c 1 -W 2 host                                   # Quick check with 2s timeout
traceroute host                                        # Where does the path fail?
mtr host                                               # Live traceroute with loss per hop
curl -I https://host                                   # Is the web server responding?
telnet host port                                       # Is this TCP port open?
```

#### DNS
```bash
dig domain                                             # Full DNS query
dig +short domain                                      # Just the IP
dig domain MX                                          # Mail server records
dig @8.8.8.8 domain                                    # Query Google DNS directly
nslookup domain                                        # Quick simple lookup
cat /etc/resolv.conf                                   # What DNS server am I using?
cat /etc/hosts                                         # Any local overrides?
```

#### Ports and Services
```bash
ss -tulpn                                              # All listening ports + process
ss -tulpn | grep :80                                   # Is something on port 80?
sudo lsof -i :3000                                     # Which process owns port 3000?
netstat -tulpn                                         # Same as ss (older systems)
```

#### Network Config
```bash
ip addr show                                           # My IP addresses
ip route show                                          # My routing table
ip route | grep default                                # My gateway
curl -s https://ifconfig.me                            # My public IP
```

#### HTTP and Downloads
```bash
curl -v https://url                                    # Verbose — all headers and response
curl -o /dev/null -s -w "%{http_code}" url             # Just the status code
curl -X POST url -H "Content-Type: application/json" -d '{}'   # POST request
wget url                                               # Download a file
wget -c url                                            # Resume interrupted download
```

#### Firewall
```bash
sudo ufw status verbose                                # See all rules
sudo ufw allow 443                                     # Open port 443
sudo ufw deny 3306                                     # Block port 3306
sudo ufw status numbered                               # Rules with numbers
sudo ufw delete 3                                      # Delete rule 3
```

