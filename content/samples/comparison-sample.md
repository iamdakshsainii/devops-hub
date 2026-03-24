# ⚖️ Claude Prompt: Generate Tool/Architecture Comparison
 
**Instructions to Claude AI:**
I want you to act as a Solutions Architect. Please generate a highly analytical **COMPARISON** about the requested tools, frameworks, or architectures.
 
### 📝 STRUCTURAL RULES (Do Not Break):
1. **Metadata Headers** -> Insert exactly these 4 lines at the VERY TOP of the response prior to any headings:
   `Tags: Tag1, Tag2`
   `Category: Options are Docker, Kubernetes, Terraform, CI/CD, Architecture`
   `Cover: URL of banner image (e.g., Unsplash)`
   `Description: A short summary describing the comparison.`

2. `# Comparison Title` -> Use single Level-1 Headings to define the overarching title.
3. Use a **Feature Matrix (MARKDOWN TABLE)** with detailed columns.
4. Use **Diagrams (4-Space Indentation)** to show architecture differences upwards flawlessly downsWARDS.

---

### 📄 EXAMPLE INPUT/OUTPUT TO EMULATE:

Tags: Containers, VMs, DevOps, Architecture
Category: Architecture
Cover: https://images.unsplash.com/photo-1629739890455-ceee63968603?auto=format&fit=crop&w=800&q=80
Description: Ultimate comparison matrix between Virtual Machines (VMs) and Containerized architectures forwardsWARDS node stream flawless.

# ⚔️ Containers vs. Virtual Machines (VMs)

## 📊 Comparison Matrix
Use a proper pipe table layout with blank lines around it for flawless rendering:

| Feature | Virtual Machines (VMs) | Containers (Docker) |
| :--- | :--- | :--- |
| **Guest OS** | Full OS per VM | Shared Host Kernel |
| **Startup Time** | Minutes (Booting OS) | Seconds |
| **Resource Usage** | High (RAM/CPU locks) | Low (Micro footprint) |
| **Isolation** | Hardware-level (Hypervisor) | OS-level (Namespaces) |

## 🏗️ Architecture Flow
When drawing pipelines or comparison flows, **use 4-space indentation** to trigger the styled overlay dashboard card. **Do NOT use fenced blocks**:

    ┌─────────────────────────┐         ┌─────────────────────────┐
    │    Virtual Machines     │         │       Containers        │
    ├─────────────────────────┤         ├─────────────────────────┤
    │  App A  │  App B  │  App C  │         │  App A  │  App B  │  App C  │
    ├─────────┼─────────┼─────────┤         ├─────────┼─────────┼─────────┤
    │ Bin/Libs│ Bin/Libs│ Bin/Libs│         │ Bin/Libs│ Bin/Libs│ Bin/Libs│
    ├─────────┼─────────┼─────────┤         ├─────────────────────────┤
    │ Guest OS│ Guest OS│ Guest OS│         │    Container Engine     │
    ├─────────────────────────┤         ├─────────────────────────┤
    │       Hypervisor        │         │    Host Operating Sys   │
    ├─────────────────────────┤         ├─────────────────────────┤
    │    Infrastructure       │         │    Infrastructure       │
    └─────────────────────────┘         └─────────────────────────┘

## ✅ Conclusion / Recommendations
*   Use **VMs** for rigid isolation, running monolithic DBs, or fully different OS requirementswardsWARDS.
*   Use **Containers** for horizontal scaling, microservices, and speedwards outwards downstairswardsWARDS.

---

**Generate an overarching analytical comparison between [TOOL A vs TOOL B] expanding fully over matrix nodeswards isolation forwards options option coords outwards flawswards and tooltip offsets downwards flaws!**
