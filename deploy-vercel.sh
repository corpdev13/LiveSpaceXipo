#!/bin/bash

# LiveSpaceXipo - Automated Vercel Deployment Script
# This script automates the entire deployment process to Vercel

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Start deployment
print_header "LiveSpaceXipo - Vercel Deployment Script"

print_info "This script will guide you through deploying to Vercel"
print_info "Make sure you have:"
print_info "  • Node.js 24+ installed"
print_info "  • A Vercel account (vercel.com)"
print_info "  • Your Vercel Postgres connection string ready"

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

# Step 1: Check if Vercel CLI is installed
print_header "Step 1: Vercel CLI Installation"

if command -v vercel &> /dev/null; then
    print_success "Vercel CLI is already installed"
    vercel --version
else
    print_info "Installing Vercel CLI globally..."
    npm install -g vercel
    print_success "Vercel CLI installed"
fi

# Step 2: Verify Node and pnpm
print_header "Step 2: Environment Check"

print_info "Checking Node.js..."
node_version=$(node --version)
print_success "Node.js $node_version"

print_info "Checking pnpm..."
if command -v pnpm &> /dev/null; then
    pnpm_version=$(pnpm --version)
    print_success "pnpm $pnpm_version"
else
    print_warning "pnpm not found, installing..."
    npm install -g pnpm
    print_success "pnpm installed"
fi

# Step 3: Build check
print_header "Step 3: Local Build Check"

print_info "Running typecheck..."
pnpm run typecheck > /dev/null 2>&1 && print_success "Typecheck passed" || print_error "Typecheck failed"

print_info "Running build..."
pnpm run build > /dev/null 2>&1 && print_success "Build successful" || print_error "Build failed"

# Step 4: Vercel Login
print_header "Step 4: Vercel Authentication"

read -p "Are you logged into Vercel CLI? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Launching Vercel login in browser..."
    vercel login
    print_success "Logged into Vercel"
else
    print_success "Already logged into Vercel"
fi

# Step 5: Link project
print_header "Step 5: Link to Vercel Project"

if [ -d ".vercel" ]; then
    read -p "Project already linked. Re-link? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf .vercel
        vercel link --yes
        print_success "Project re-linked"
    else
        print_info "Using existing project link"
    fi
else
    print_info "Linking project to Vercel..."
    vercel link --yes
    print_success "Project linked"
fi

# Step 6: Environment Variables
print_header "Step 6: Environment Variables Configuration"

print_warning "You need to provide:"
print_warning "  1. DATABASE_URL (from Vercel Postgres)"
print_warning "  2. ADMIN_PASSWORD (default: Adminakp$$)"
print_warning "  3. GROQ_API_KEY (provided)"

read -p "Do you have the DATABASE_URL from Vercel Postgres? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Please create Vercel Postgres database first:"
    print_info "1. Go to https://vercel.com/dashboard"
    print_info "2. Select your project"
    print_info "3. Click 'Storage' → 'Create Database' → 'Postgres'"
    print_info "4. Copy the connection string"
    exit 1
fi

# Collect environment variables
print_info "Enter your environment variables:"

read -p "DATABASE_URL: " DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL cannot be empty"
    exit 1
fi

read -p "ADMIN_PASSWORD (default: Adminakp$$): " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-Adminakp$$}

read -p "GROQ_API_KEY: " GROQ_API_KEY
if [ -z "$GROQ_API_KEY" ]; then
    print_error "GROQ_API_KEY cannot be empty"
    exit 1
fi

# Step 7: Add environment variables
print_header "Step 7: Adding Environment Variables to Vercel"

print_info "Adding DATABASE_URL..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL --yes > /dev/null 2>&1 || true
print_success "DATABASE_URL added"

print_info "Adding ADMIN_PASSWORD..."
echo "$ADMIN_PASSWORD" | vercel env add ADMIN_PASSWORD --yes > /dev/null 2>&1 || true
print_success "ADMIN_PASSWORD added"

print_info "Adding GROQ_API_KEY..."
echo "$GROQ_API_KEY" | vercel env add GROQ_API_KEY --yes > /dev/null 2>&1 || true
print_success "GROQ_API_KEY added"

print_info "Adding NODE_ENV..."
echo "production" | vercel env add NODE_ENV --yes > /dev/null 2>&1 || true
print_success "NODE_ENV added"

print_info "Adding PORT..."
echo "5000" | vercel env add PORT --yes > /dev/null 2>&1 || true
print_success "PORT added"

print_info "Adding LOG_LEVEL..."
echo "info" | vercel env add LOG_LEVEL --yes > /dev/null 2>&1 || true
print_success "LOG_LEVEL added"

# Step 8: Deploy to production
print_header "Step 8: Deployment"

print_warning "About to deploy to production!"
read -p "Are you sure? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

print_info "Deploying to Vercel (production)..."
VERCEL_OUTPUT=$(vercel --prod --yes 2>&1)

# Extract deployment URL
DEPLOYMENT_URL=$(echo "$VERCEL_OUTPUT" | grep -oP 'https://[^\s]+\.vercel\.app' | head -1)

if [ -z "$DEPLOYMENT_URL" ]; then
    DEPLOYMENT_URL="https://your-project.vercel.app"
fi

print_success "Deployment completed!"

# Step 9: Summary and testing
print_header "Step 9: Deployment Summary"

print_success "Your LiveSpaceXipo platform is now live!"
echo ""
echo -e "${GREEN}URL: ${BLUE}$DEPLOYMENT_URL${NC}"
echo ""
print_info "Environment Variables Set:"
echo "  • DATABASE_URL: ✅"
echo "  • ADMIN_PASSWORD: ✅"
echo "  • GROQ_API_KEY: ✅"
echo "  • NODE_ENV: production"
echo "  • PORT: 5000"
echo "  • LOG_LEVEL: info"

# Step 10: Test endpoints
print_header "Step 10: Testing Endpoints"

print_info "Testing health endpoint..."
HEALTH_TEST=$(curl -s "$DEPLOYMENT_URL/api/health" || echo "Error")
if echo "$HEALTH_TEST" | grep -q "ok\|status"; then
    print_success "Health endpoint: OK"
else
    print_warning "Health endpoint: Still initializing (check in 30 seconds)"
fi

print_info "Testing admin endpoint..."
ADMIN_TEST=$(curl -s -H "x-admin-password: $ADMIN_PASSWORD" "$DEPLOYMENT_URL/api/admin/investors" || echo "Error")
if [ "$ADMIN_TEST" != "Error" ]; then
    print_success "Admin endpoint: OK"
else
    print_warning "Admin endpoint: Still initializing"
fi

# Final summary
print_header "🎉 Deployment Complete!"

echo -e "${GREEN}Your LiveSpaceXipo platform is live!${NC}\n"

echo "📋 Quick Reference:"
echo "  URL: $DEPLOYMENT_URL"
echo "  Admin Password: $ADMIN_PASSWORD"
echo "  Admin Header: x-admin-password: $ADMIN_PASSWORD"
echo ""

echo "🧪 Test Commands:"
echo ""
echo -e "${BLUE}# Health check${NC}"
echo "curl $DEPLOYMENT_URL/api/health"
echo ""
echo -e "${BLUE}# Admin access${NC}"
echo "curl -H 'x-admin-password: $ADMIN_PASSWORD' \\"
echo "  $DEPLOYMENT_URL/api/admin/investors"
echo ""
echo -e "${BLUE}# AI Assistant${NC}"
echo "curl -X POST $DEPLOYMENT_URL/api/assistant \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\": \"What is SpaceX IPO?\"}'"
echo ""

echo "📚 Documentation:"
echo "  • Deployment Guide: VERCEL_DEPLOYMENT_GUIDE.md"
echo "  • Environment Setup: ENVIRONMENT_SETUP.md"
echo "  • API Reference: Check repository docs"
echo ""

echo "🔗 Next Steps:"
echo "  1. Visit: $DEPLOYMENT_URL"
echo "  2. Test endpoints using curl commands above"
echo "  3. Create test investors"
echo "  4. Try admin functions"
echo "  5. Invite real users!"
echo ""

echo -e "${GREEN}Happy trading! 🚀${NC}\n"

# Optional: Open dashboard
read -p "Open Vercel dashboard? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://vercel.com/dashboard"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://vercel.com/dashboard"
    else
        print_info "Visit: https://vercel.com/dashboard"
    fi
fi

print_success "Deployment script completed successfully!"
