# FlipCart Dev — Full-Stack Shopping & Orders App (React + Node.js + MongoDB + Docker/VM)

A development-first Flipkart-style e-commerce & order tracking application built with:
- **Frontend**: React 19 + Vite (`frontend/`, hot-reload enabled with polling for Docker/VM)
- **Backend**: Node.js + Express + Mongoose (`backend/`, `nodemon -L` hot-reload enabled)
- **Database**: MongoDB (runs either in a Docker container or directly inside a Virtual Machine)

## Seeded Demo Accounts
When `AUTO_SEED=true` (default in dev), the backend automatically seeds 10 products and 2 users on first boot:
- **Customer**: `customer@flipkart.dev` / `demo1234` (also available via the **"Fill Seeded Demo Customer"** button in Login)
- **Admin**: `admin@flipkart.dev` / `admin1234`

---

## Option 1: Run Everything in Docker (inside your VM or local machine)

From the project root:

```bash
docker compose up --build
```

- Frontend (React dev server): `http://localhost:5173` (or `http://<VM_IP>:5173`)
- Backend (Node.js API): `http://localhost:5000/api/health` (or `http://<VM_IP>:5000/api/health`)
- MongoDB: `mongodb://localhost:27017/flipkart_dev`

Both `./backend` and `./frontend` are bind-mounted into the containers so code edits reload automatically.

---

## Option 2: MongoDB Running Natively in a Virtual Machine + App in Docker

If MongoDB (`mongod`) is installed directly on your VM OS (or on a separate MongoDB VM):

1. Inside the MongoDB VM, allow Docker/remote connections in `/etc/mongod.conf`:
   ```yaml
   net:
     port: 27017
     bindIp: 0.0.0.0
   ```
   Restart MongoDB:
   ```bash
   sudo systemctl restart mongod
   ```
2. Start the backend + frontend containers using `docker-compose.vm-mongo.yml`:
   - If Docker and MongoDB run on the **same VM**:
     ```bash
     docker compose -f docker-compose.vm-mongo.yml up --build
     ```
   - If MongoDB runs on **another VM** (e.g., `192.168.56.101`):
     ```bash
     VM_MONGO_URI="mongodb://192.168.56.101:27017/flipkart_dev" docker compose -f docker-compose.vm-mongo.yml up --build
     ```

---

## Option 3: Setting Up Docker inside a Fresh Linux VM (Ubuntu/Debian)

1. Install Docker Engine & Compose plugin inside the VM:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-v2
   sudo usermod -aG docker $USER
   newgrp docker
   ```
2. If using VirtualBox NAT networking, forward ports `5173`, `5000`, and `27017` from Host to Guest (or use Bridged / Host-Only Adapter).
3. Clone/copy this `flipkart-shop` folder into the VM and run `docker compose up --build`.
