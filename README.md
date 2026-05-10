# 🚀 Full Stack DevOps Project

> React Frontend + Node.js Backend — Dockerized, CI/CD with Jenkins, Deployed on AWS EC2

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

---

## 📁 Project Structure

```
root/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   ├── package.json
│   └── vite.config.js
├── Backend/
│   ├── server.js
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Web Server | Nginx |
| Containerization | Docker + Docker Compose |
| CI/CD | Jenkins |
| Cloud | AWS EC2 (Ubuntu 22.04) |
| Registry | Docker Hub |

---

## 🐳 Docker Setup

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Nginx Config (frontend/nginx.conf)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:5000/;
        proxy_set_header Host $host;
    }
}
```

### docker-compose.yml

```yaml
services:
  backend:
    image: hardik900/backend:latest
    container_name: backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    networks:
      - app-network

  frontend:
    image: hardik900/frontend:latest
    container_name: frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

---

## 🔁 CI/CD Pipeline — Jenkins

### Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = 'hardik900/frontend'
        BACKEND_IMAGE  = 'hardik900/backend'
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo 'Cloning Repository'
                checkout scm
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo 'Building Frontend Docker image'
                dir('frontend') {
                    sh 'docker build -t $FRONTEND_IMAGE:latest .'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                echo 'Building Backend Docker image'
                dir('Backend') {
                    sh 'docker build -t $BACKEND_IMAGE:latest .'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing images to Docker Hub'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh 'echo $PASSWORD | docker login -u $USERNAME --password-stdin'
                    sh 'docker tag $FRONTEND_IMAGE:latest $FRONTEND_IMAGE:$BUILD_NUMBER'
                    sh 'docker push $FRONTEND_IMAGE:latest'
                    sh 'docker push $FRONTEND_IMAGE:$BUILD_NUMBER'
                    sh 'docker tag $BACKEND_IMAGE:latest $BACKEND_IMAGE:$BUILD_NUMBER'
                    sh 'docker push $BACKEND_IMAGE:latest'
                    sh 'docker push $BACKEND_IMAGE:$BUILD_NUMBER'
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                echo 'Deploying on AWS EC2'
                sh '''
                    cd $WORKSPACE
                    docker-compose down || true
                    docker-compose pull
                    docker-compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs above.'
        }
    }
}
```

### Pipeline Stages

```
git push → GitHub Webhook → Jenkins Triggered
                                    ↓
                          ┌─────────────────────┐
                          │  1. Checkout Code    │
                          │  2. Build Frontend   │
                          │  3. Build Backend    │
                          │  4. Push Docker Hub  │
                          │  5. Deploy on EC2    │
                          └─────────────────────┘
                                    ↓
                            🚀 App Live on AWS
```

---

## ☁️ AWS EC2 Deployment

### 1. Launch EC2 Instance

| Setting | Value |
|---------|-------|
| OS | Ubuntu 22.04 LTS |
| Instance Type | t2.micro (Free Tier) |
| Key Pair | .pem file (save safely) |

### 2. Security Group — Open These Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 22 | TCP | SSH access |
| 80 | TCP | Frontend app (HTTP) |
| 8080 | TCP | Jenkins dashboard |
| 5000 | TCP | Backend API |

### 3. SSH Into Server

```bash
chmod 400 ~/Downloads/my-key.pem
ssh -i ~/Downloads/my-key.pem ubuntu@YOUR_EC2_IP
```

### 4. Install Docker on EC2

```bash
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
newgrp docker
```

### 5. Install Docker Compose on EC2

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 6. Run Jenkins on EC2

```bash
docker run -d \
  --name jenkins \
  --restart always \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

```bash
# Install Docker inside Jenkins container
docker exec -it -u root jenkins bash
apt-get update && apt-get install -y docker.io
chmod 666 /var/run/docker.sock
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
exit
```

### 7. GitHub Webhook

```
GitHub Repo → Settings → Webhooks → Add Webhook

Payload URL:  http://YOUR_EC2_IP:8080/github-webhook/
Content type: application/json
Event:        Just the push event
```

---

## 🔐 Jenkins Credentials Setup

```
Manage Jenkins → Credentials → System → Global Credentials → Add Credentials

Kind:     Username with password
Username: hardik900
Password: <Docker Hub Access Token>
ID:       dockerhub-credentials
```

> ⚠️ Use a Docker Hub **Access Token** with **Read & Write** permission, not your password.
> Generate at: https://hub.docker.com/settings/personal-access-tokens

---

## 🖥️ Access Your App

Once deployed, your app is live at:

| Service | URL |
|---------|-----|
| Frontend | `http://YOUR_EC2_IP` |
| Backend API | `http://YOUR_EC2_IP:5000` |
| Jenkins | `http://YOUR_EC2_IP:8080` |

---

## 🛠️ Useful Commands

```bash
# View running containers
docker ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Restart containers
docker-compose restart

# Stop everything
docker-compose down

# Start manually
docker-compose up -d

# Check disk space
df -h

# Check memory
free -h

# View Jenkins logs
docker logs jenkins
```

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `CustomEvent is not defined` | Use `node:20-alpine` in frontend Dockerfile |
| `tag does not exist` | Build with full tag: `docker build -t username/name:latest .` |
| `insufficient scopes` | Create Docker Hub token with Read & Write permission |
| `axios not found` | Run `npm install axios` in frontend, then rebuild |
| `docker: not found` in Jenkins | Install docker.io inside Jenkins container as root |
| `docker-compose: not found` | Install docker-compose binary inside Jenkins container |
| `dir step must be called with a body` | Add `{ }` curly braces after `dir('folder')` |

---

## 🔄 Full Automated Flow

```
1.  Edit code on your laptop
2.  git add . && git commit -m "message" && git push origin main
3.  GitHub receives the push
4.  GitHub sends webhook to http://EC2_IP:8080/github-webhook/
5.  Jenkins pipeline starts automatically
6.  Stage 1 → Checkout latest code from GitHub
7.  Stage 2 → docker build frontend image
8.  Stage 3 → docker build backend image
9.  Stage 4 → docker push both images to Docker Hub
10. Stage 5 → docker-compose up -d on EC2 server
11. ✅ Updated app is live at http://EC2_IP
```

---

## 📦 Docker Hub Images

- Frontend: `hardik900/frontend`
- Backend: `hardik900/backend`

---

## 👤 Author

**Hardik** — Learning DevOps step by step 🚀

---

*Built with Docker + Jenkins + AWS EC2*
