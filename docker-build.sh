#!/bin/bash

# ============================================
# Docker Build and Deployment Script
# Report Robot Complete Setup
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Report Robot Docker Build & Deployment Script   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"

# ============================================
# Pre-flight checks
# ============================================
echo -e "\n${YELLOW}[1/6]${NC} Running pre-flight checks..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo -e "${YELLOW}Creating .env from .env.docker template...${NC}"
    cp .env.docker .env
    echo -e "${RED}✗ Please configure .env file with your actual values and run again${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo -e "${GREEN}✓ .env configuration file found${NC}"

# ============================================
# Build images
# ============================================
echo -e "\n${YELLOW}[2/6]${NC} Building Docker images..."

docker-compose build --no-cache

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker images built successfully${NC}"
else
    echo -e "${RED}✗ Failed to build Docker images${NC}"
    exit 1
fi

# ============================================
# Start services
# ============================================
echo -e "\n${YELLOW}[3/6]${NC} Starting Docker services..."

docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker services started${NC}"
else
    echo -e "${RED}✗ Failed to start Docker services${NC}"
    exit 1
fi

# ============================================
# Wait for services to be healthy
# ============================================
echo -e "\n${YELLOW}[4/6]${NC} Waiting for services to be ready..."

# Wait for Keycloak
echo "Waiting for Keycloak..."
until docker-compose exec -T keycloak curl -f http://localhost:8080/health/ready > /dev/null 2>&1; do
    echo "  Keycloak: starting... (waiting up to 120s)"
    sleep 5
done
echo -e "${GREEN}✓ Keycloak is ready${NC}"

# Wait for Backend
echo "Waiting for Backend API..."
until docker-compose exec -T backend curl -f http://localhost:3001/api/mroi/iv-cameras/health > /dev/null 2>&1; do
    echo "  Backend: starting... (waiting up to 60s)"
    sleep 3
done
echo -e "${GREEN}✓ Backend API is ready${NC}"

# Wait for Frontend
echo "Waiting for Frontend..."
until docker-compose exec -T frontend curl -f http://localhost/health > /dev/null 2>&1; do
    echo "  Frontend: starting... (waiting up to 30s)"
    sleep 2
done
echo -e "${GREEN}✓ Frontend is ready${NC}"

# ============================================
# Run database migrations
# ============================================
echo -e "\n${YELLOW}[5/6]${NC} Running database migrations..."

# Check if migration script exists
if [ -f "scripts/mroi_migration.sql" ]; then
    echo "Executing MROI database migration..."
    docker-compose exec -T backend \
        psql -h $MROI_DB_HOST -U $MROI_DB_USERNAME -d $MROI_DB_NAME -f scripts/mroi_migration.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database migrations completed${NC}"
    else
        echo -e "${YELLOW}⚠ Database migration might need manual execution${NC}"
        echo -e "${YELLOW}   Run manually: docker-compose exec backend psql -h \$MROI_DB_HOST -U \$MROI_DB_USERNAME -d \$MROI_DB_NAME < scripts/mroi_migration.sql${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Migration script not found at scripts/mroi_migration.sql${NC}"
fi

# ============================================
# Display service information
# ============================================
echo -e "\n${YELLOW}[6/6]${NC} Displaying service information..."

echo -e "\n${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Report Robot Docker Setup Complete!           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}Available Services:${NC}"
echo -e "  ${GREEN}Frontend${NC}     → http://localhost"
echo -e "  ${GREEN}Backend API${NC}  → http://localhost:3001/api"
echo -e "  ${GREEN}Keycloak${NC}     → http://localhost:8080"

echo -e "\n${GREEN}Useful Commands:${NC}"
echo -e "  ${YELLOW}View logs:${NC}       docker-compose logs -f"
echo -e "  ${YELLOW}Stop services:${NC}   docker-compose down"
echo -e "  ${YELLOW}View status:${NC}     docker-compose ps"
echo -e "  ${YELLOW}Execute command:${NC} docker-compose exec backend <command>"

echo -e "\n${GREEN}Next Steps:${NC}"
echo -e "  1. Access frontend at: http://localhost"
echo -e "  2. Login with Keycloak credentials"
echo -e "  3. Test API endpoint: curl http://localhost:3001/api/mroi/iv-cameras/health"

echo -e "\n"
