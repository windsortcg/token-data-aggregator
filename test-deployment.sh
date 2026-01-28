#!/bin/bash
# Quick test script for deployed API

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if URL is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./test-deployment.sh https://your-app.vercel.app${NC}"
    echo "Example: ./test-deployment.sh https://token-data-aggregator.vercel.app"
    exit 1
fi

API_URL=$1

echo "================================================"
echo "Testing Token Data Aggregator API"
echo "URL: $API_URL"
echo "================================================"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo "GET $API_URL/health"
response=$(curl -s "$API_URL/health")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Success${NC}"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ Failed${NC}"
fi
echo ""

# Test 2: Service Info
echo -e "${YELLOW}Test 2: Service Info${NC}"
echo "GET $API_URL/"
response=$(curl -s "$API_URL/")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Success${NC}"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ Failed${NC}"
fi
echo ""

# Test 3: Token Data (ARB)
echo -e "${YELLOW}Test 3: Token Data Query (ARB)${NC}"
echo "GET $API_URL/api/token-data?token=ARB"
response=$(curl -s "$API_URL/api/token-data?token=ARB")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Success${NC}"
    echo "$response" | python3 -m json.tool 2>/dev/null | head -50
    echo "... (truncated, full response is much longer)"
else
    echo -e "${RED}❌ Failed${NC}"
fi
echo ""

# Test 4: Payment Stats
echo -e "${YELLOW}Test 4: Payment Statistics${NC}"
echo "GET $API_URL/api/payment-stats"
response=$(curl -s "$API_URL/api/payment-stats")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Success${NC}"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ Failed${NC}"
fi
echo ""

# Test 5: llms.txt Discovery
echo -e "${YELLOW}Test 5: Agent Discovery (llms.txt)${NC}"
echo "GET $API_URL/llms.txt"
response=$(curl -s "$API_URL/llms.txt")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Success${NC}"
    echo "$response" | head -20
    echo "... (truncated)"
else
    echo -e "${RED}❌ Failed${NC}"
fi
echo ""

echo "================================================"
echo -e "${GREEN}✅ All tests complete!${NC}"
echo "================================================"
echo ""
echo "Your API is live at: $API_URL"
echo ""
echo "Try these commands:"
echo "  curl '$API_URL/api/token-data?token=ETH'"
echo "  curl '$API_URL/api/token-data?token=LINK'"
echo "  curl '$API_URL/api/token-data?token=UNI'"
