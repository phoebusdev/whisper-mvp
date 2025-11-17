#!/bin/bash

# Whisper MVP - Deployment Verification Script
# Usage: ./test-deployment.sh <your-deployment-url>
# Example: ./test-deployment.sh https://whisper-mvp.up.railway.app

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your deployment URL"
    echo "Usage: ./test-deployment.sh <url>"
    echo "Example: ./test-deployment.sh https://whisper-mvp.up.railway.app"
    exit 1
fi

BASE_URL=$1
echo "🧪 Testing Whisper MVP at: $BASE_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
HEALTH=$(curl -s "$BASE_URL/api/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo "   ✅ Health check passed"
else
    echo "   ❌ Health check failed"
    echo "   Response: $HEALTH"
    exit 1
fi

# Test 2: Get Categories
echo "2️⃣  Testing categories endpoint..."
CATEGORIES=$(curl -s "$BASE_URL/api/categories")
if echo "$CATEGORIES" | grep -q "Communication"; then
    echo "   ✅ Categories endpoint working"
else
    echo "   ❌ Categories endpoint failed"
    echo "   Response: $CATEGORIES"
    exit 1
fi

# Test 3: Create Profile
echo "3️⃣  Testing profile creation..."
PROFILE=$(curl -s -X POST "$BASE_URL/api/profiles" -H "Content-Type: application/json")
PROFILE_ID=$(echo "$PROFILE" | grep -o '"profileId":"[^"]*' | cut -d'"' -f4)

if [ -n "$PROFILE_ID" ]; then
    echo "   ✅ Profile created: $PROFILE_ID"
else
    echo "   ❌ Profile creation failed"
    echo "   Response: $PROFILE"
    exit 1
fi

# Test 4: Submit Review
echo "4️⃣  Testing review submission..."
REVIEW_DATA=$(cat <<EOF
{
  "profileId": "$PROFILE_ID",
  "ratings": {
    "Communication": 5,
    "Reliability": 4,
    "Professionalism": 5,
    "Quality of Work": 4,
    "Collaboration": 5
  },
  "feedbackText": "Test review from deployment verification",
  "consentGiven": true
}
EOF
)

REVIEW_RESPONSE=$(curl -s -X POST "$BASE_URL/api/reviews" \
    -H "Content-Type: application/json" \
    -d "$REVIEW_DATA")

if echo "$REVIEW_RESPONSE" | grep -q "success"; then
    echo "   ✅ Review submitted successfully"
else
    echo "   ❌ Review submission failed"
    echo "   Response: $REVIEW_RESPONSE"
    exit 1
fi

# Test 5: Get Profile with Reviews
echo "5️⃣  Testing profile retrieval..."
PROFILE_DATA=$(curl -s "$BASE_URL/api/profiles/$PROFILE_ID")
REVIEW_COUNT=$(echo "$PROFILE_DATA" | grep -o '"reviewCount":[0-9]*' | cut -d':' -f2)

if [ "$REVIEW_COUNT" -eq "1" ]; then
    echo "   ✅ Profile retrieved with 1 review"
    OVERALL=$(echo "$PROFILE_DATA" | grep -o '"overallAverage":[0-9.]*' | cut -d':' -f2)
    echo "   📊 Overall average: $OVERALL/5.0"
else
    echo "   ❌ Profile retrieval failed or incorrect review count"
    echo "   Response: $PROFILE_DATA"
    exit 1
fi

# Test 6: Frontend Loading
echo "6️⃣  Testing frontend loading..."
FRONTEND=$(curl -s "$BASE_URL/")
if echo "$FRONTEND" | grep -q "Whisper"; then
    echo "   ✅ Frontend loaded successfully"
else
    echo "   ❌ Frontend failed to load"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════"
echo "✅ All tests passed! Deployment verified."
echo "═══════════════════════════════════════"
echo ""
echo "🎉 Your Whisper MVP is live and working!"
echo ""
echo "📊 Test Results:"
echo "   • API Health: ✅"
echo "   • Categories: ✅"
echo "   • Profile Creation: ✅"
echo "   • Review Submission: ✅"
echo "   • Data Aggregation: ✅"
echo "   • Frontend: ✅"
echo ""
echo "🔗 Test Profile Created: $BASE_URL/profile/$PROFILE_ID"
echo "📝 Review Link: $BASE_URL/review/$PROFILE_ID"
echo ""
echo "Next steps:"
echo "1. Visit $BASE_URL to see your live site"
echo "2. Create a real profile and share the link"
echo "3. Monitor your deployment dashboard for activity"
echo ""
