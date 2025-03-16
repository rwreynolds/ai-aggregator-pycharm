#!/bin/bash

# Script to deploy the AI Services Aggregator to a Digital Ocean droplet

# Exit on any error
set -e

echo "==============================================="
echo "Deploying AI Services Aggregator to Digital Ocean"
echo "==============================================="

# Update packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker and Docker Compose if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt-get update
    sudo apt-get install -y docker-ce
    sudo usermod -aG docker ${USER}
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Clone or pull the latest code
REPO_DIR="/var/www/ai-services-aggregator"

if [ -d "$REPO_DIR" ]; then
    echo "Repository exists. Pulling latest changes..."
    cd $REPO_DIR
    git pull
else
    echo "Cloning repository..."
    sudo mkdir -p /var/www
    sudo chown $USER:$USER /var/www
    git clone https://github.com/your-username/ai-services-aggregator.git $REPO_DIR
    cd $REPO_DIR
fi

# Configure environment variables
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please edit the .env file with your API keys and settings"
    echo "Then run this script again"
    exit 1
fi

# Build and start the Docker containers
echo "Building and starting Docker containers..."
docker-compose build
docker-compose up -d

# Setup Nginx (if not using the Docker Nginx container)
if [ "$1" == "--setup-nginx" ]; then
    echo "Setting up Nginx..."
    sudo apt-get install -y nginx

    # Create Nginx configuration
    sudo bash -c 'cat > /etc/nginx/sites-available/ai-services-aggregator << "EOF"
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF'

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/ai-services-aggregator /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
fi

# Setup SSL with Let's Encrypt
if [ "$1" == "--setup-ssl" ]; then
    echo "Setting up SSL with Let's Encrypt..."
    sudo apt-get install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
fi

echo "==============================================="
echo "Deployment completed successfully!"
echo "==============================================="
echo "Your AI Services Aggregator is now running."
echo "Access it at: http://your-domain.com"
echo "Or via IP: http://$(curl -s ifconfig.me)"