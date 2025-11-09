#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== ToyStore Deployment Script ===${NC}"

# Configuration
APP_DIR="/var/www/toystore"
GIT_REPO="https://github.com/intekaih/toystore-app.git"

# Navigate to app directory
cd $APP_DIR || exit

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes from Git...${NC}"
git pull origin main || git pull origin master

# Stop running containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down

# Remove old images (optional - uncomment if needed)
# echo -e "${YELLOW}Removing old images...${NC}"
# docker-compose down --rmi all

# Build and start containers
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose up -d --build

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Check status
echo -e "${YELLOW}Checking container status...${NC}"
docker-compose ps

# Show logs
echo -e "${YELLOW}Recent logs:${NC}"
docker-compose logs --tail=50

echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo -e "${YELLOW}Access your application at: http://toystore.intekaih.id.vn${NC}"
