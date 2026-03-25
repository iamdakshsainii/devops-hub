# 🚀 DevOps Network

![DevOps Network Hero](./devops_network_hero_banner_1774431175012.png)

> **Learn DevOps the right way.** A structured platform for engineers to master the DevOps ecosystem through curated roadmaps, nested modules, and production-ready resources.

---

## 🌟 Key Features

- **🎯 Structured Roadmaps:** Phase-by-phase learning paths that mirror real-world production environments.
- **🧠 Nested Modules:** Deeply structured technical guides with **Step-by-Step** and **Continuous** reading modes.
*   **📚 Resource Library:** Curated documentation, videos, and cheatsheets vetted by production engineers.
- **🏆 Progressive Scoring:** Earn points as you complete topics, modules, and roadmaps to track your growth.
- **🔔 Notifications & Reminders:** Stay on track with automated reminders and system updates.
- **✍️ Pinned Blogs:** Quick access to high-value articles and announcements directly from the dashboard.
- **🔒 Admin Dashboard:** Complete control over content management, including easy resource creation and module editing.

---

## 📸 Screenshots

*(Screenshots coming soon!)*

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router, Server Components)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & ORM:** [Prisma](https://www.prisma.io/) with PostgreSQL
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** [Docker](https://www.docker.com/) (Multi-stage build)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL instance
- Docker (optional, but recommended for production)

### 2. Installation
```bash
git clone https://github.com/your-username/devops-network.git
cd devops-network
npm install
```

### 3. Environment Setup
Create a `.env` file in the root and add your configuration (see `.env.example`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/devops_db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the magic.

---

## 🐋 Docker Support
This project includes a professional **multi-stage Dockerfile** for production.

```bash
docker build -t devops-network .
docker run -p 3000:3000 --env-file .env devops-network
```

---

## 👨‍💻 Contributing
Contributions are welcome! If you have suggestions for new roadmap topics or features, please feel free to open a PR or Issue.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ for the DevOps Community.*
