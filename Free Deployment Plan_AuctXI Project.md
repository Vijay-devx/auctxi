# Free Deployment Plan: AuctXI Project

Deploying a massive microservices architecture (9 containers including Java, Python AI, .NET, MySQL, Redis, and RabbitMQ) entirely for free is challenging. Standard free tiers (like Heroku or Render) offer very low RAM (512MB), which will crash immediately when trying to run Spring Boot and Python AI models.

To achieve a **100% free deployment** without crashing, we must split the deployment into two specialized free services.

## 1. The Frontend (React UI) -> Vercel
Vercel is the industry standard for hosting React/Vite frontends. It is lightning fast, highly reliable, and **completely free**.

**How we will do it:**
1. We will push your frontend code to a free GitHub repository.
2. We will connect Vercel to that GitHub repository.
3. Vercel will automatically build and host your website on a fast, global network and give you a free SSL URL (e.g., `https://auctxi-project.vercel.app`).

## 2. The Backend & Databases -> Oracle Cloud (Always Free VPS)
Because your backend runs heavily on Docker Compose and requires a lot of RAM, we cannot use standard serverless free tiers. Instead, we will use **Oracle Cloud's Always Free Tier**. 
Oracle provides an ARM-based Virtual Private Server (VPS) with **4 Cores and 24GB of RAM** entirely for free, forever. This is powerful enough to run all your Docker containers simultaneously without breaking a sweat!

**How we will do it:**
1. You will create a free Oracle Cloud account and launch the "Always Free A1 Compute Instance".
2. We will SSH into this server and install Docker.
3. We will copy your `docker-compose.yml` to the server.
4. We will run `docker compose up -d`. The server will automatically pull your images from Docker Hub (`vjd07/auctxi:core`, etc.) and start the backend exactly like it runs on your laptop!

## Open Questions for You

> [!IMPORTANT]
> **Account Setup:** Setting up Vercel and Oracle Cloud requires creating accounts. Do you have a GitHub account ready for the frontend? And are you willing to register for a free Oracle Cloud account for the backend?

> [!WARNING]  
> **ARM Architecture:** Oracle's 24GB RAM free tier uses **ARM** processors (similar to Apple M1/M2 chips), not standard x86 processors. Your Docker images were built on your Windows PC (x86). While most Docker images run on ARM, we might need to quickly re-build your images using Docker's `buildx` command to make them ARM-compatible if Oracle rejects them. Are you okay with running a few extra build commands if necessary?

## Next Steps
If you approve this architecture, we will execute it in two phases:
- **Phase 1:** Prepare the frontend codebase for GitHub and deploy to Vercel.
- **Phase 2:** Prepare the backend `.env` and `docker-compose` files for a production VPS.
