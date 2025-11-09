#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== ToyStore VPS Setup Script ===${NC}"

# Update system
echo -e "${YELLOW}Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Docker
echo -e "${YELLOW}Installing Docker...${NC}"
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
echo -e "${YELLOW}Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Nginx for reverse proxy
echo -e "${YELLOW}Installing Nginx...${NC}"
sudo apt install -y nginx

# Install Git
echo -e "${YELLOW}Installing Git...${NC}"
sudo apt install -y git

# Install Certbot for SSL
echo -e "${YELLOW}Installing Certbot...${NC}"
sudo apt install -y certbot python3-certbot-nginx

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create application directory
echo -e "${YELLOW}Creating application directory...${NC}"
sudo mkdir -p /var/www/toystore
sudo chown -R $USER:$USER /var/www/toystore

echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo -e "${YELLOW}Please log out and log back in for docker group changes to take effect.${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Clone your repository to /var/www/toystore"
echo -e "2. Configure environment variables"
echo -e "3. Run docker-compose up -d"
