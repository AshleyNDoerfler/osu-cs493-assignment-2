#!/bin/bash

API_URL="http://localhost:8000"

echo "Seeding businesses..."

BUSINESS1_ID=$(curl -s -X POST "$API_URL/businesses" -H "Content-Type: application/json" -d '{
  "ownerid": "1",
  "name": "Sunrise Cafe",
  "address": "123 Morning St",
  "city": "Portland",
  "state": "OR",
  "zip": "97201",
  "phone": "503-111-2222",
  "category": "restaurant",
  "subcategory": "breakfast",
  "website": "http://sunrisecafe.com",
  "email": "hello@sunrisecafe.com"
}' | jq -r '.id')

BUSINESS2_ID=$(curl -s -X POST "$API_URL/businesses" -H "Content-Type: application/json" -d '{
  "ownerid": "17",
  "name": "Tech Haven",
  "address": "456 Code Blvd",
  "city": "Seattle",
  "state": "WA",
  "zip": "98101",
  "phone": "206-333-4444",
  "category": "retail",
  "subcategory": "electronics",
  "website": "http://techhaven.com",
  "email": "support@techhaven.com"
}' | jq -r '.id')

BUSINESS3_ID=$(curl -s -X POST "$API_URL/businesses" -H "Content-Type: application/json" -d '{
  "ownerid": "7",
  "name": "Zen Spa",
  "address": "789 Relax Rd",
  "city": "San Francisco",
  "state": "CA",
  "zip": "94103",
  "phone": "415-555-6666",
  "category": "services",
  "subcategory": "spa",
  "website": "http://zenspa.com",
  "email": "info@zenspa.com"
}' | jq -r '.id')

echo "Seeding reviews..."

curl -s -X POST "$API_URL/reviews" -H "Content-Type: application/json" -d "{
  \"userid\": \"1\",
  \"businessid\": \"$BUSINESS1_ID\",
  \"dollars\": 2,
  \"stars\": 4,
  \"review\": \"Delicious breakfast, friendly staff!\"
}" > /dev/null

curl -s -X POST "$API_URL/reviews" -H "Content-Type: application/json" -d "{
  \"userid\": \"7\",
  \"businessid\": \"$BUSINESS2_ID\",
  \"dollars\": 3,
  \"stars\": 5,
  \"review\": \"Great selection of gadgets and fast service.\"
}" > /dev/null

curl -s -X POST "$API_URL/reviews" -H "Content-Type: application/json" -d "{
  \"userid\": \"0\",
  \"businessid\": \"$BUSINESS3_ID\",
  \"dollars\": 4,
  \"stars\": 3,
  \"review\": \"Relaxing experience but a bit pricey.\"
}" > /dev/null

echo "Seeding photos..."

curl -s -X POST "$API_URL/photos" -H "Content-Type: application/json" -d "{
  \"userid\": \"21\",
  \"businessid\": \"$BUSINESS1_ID\",
  \"caption\": \"Yummy pancakes!\"
}" > /dev/null

curl -s -X POST "$API_URL/photos" -H "Content-Type: application/json" -d "{
  \"userid\": \"1\",
  \"businessid\": \"$BUSINESS2_ID\",
  \"caption\": \"The latest tech lineup.\"
}" > /dev/null

curl -s -X POST "$API_URL/photos" -H "Content-Type: application/json" -d "{
  \"userid\": \"2\",
  \"businessid\": \"$BUSINESS3_ID\",
  \"caption\": \"Serene spa ambiance.\"
}" > /dev/null

echo "Seeding complete!"

#!/bin/bash

API_URL="http://localhost:8000"

# --- Test GET all businesses
echo "Testing: GET /businesses"
curl -s "$API_URL/businesses?page=1" | jq .

# --- Test GET business by ID
echo "Testing: GET /businesses/1"
curl -s "$API_URL/businesses/1" | jq .

# --- Test PUT update business
echo "Testing: PUT /businesses/1"
curl -s -X PUT "$API_URL/businesses/1" -H "Content-Type: application/json" -d '{
  "name": "Updated Business Name"
}' | jq .

# --- Test DELETE business
echo "Testing: DELETE /businesses/1"
curl -s -X DELETE "$API_URL/businesses/1" | jq .

# --- Test GET reviews by ID
echo "Testing: GET /reviews/1"
curl -s "$API_URL/reviews/1" | jq .

# --- Test PUT review
echo "Testing: PUT /reviews/1"
curl -s -X PUT "$API_URL/reviews/1" -H "Content-Type: application/json" -d '{
  "stars": 5
}' | jq .

# --- Test DELETE review
echo "Testing: DELETE /reviews/1"
curl -s -X DELETE "$API_URL/reviews/1" | jq .

# --- Test GET photo by ID
echo "Testing: GET /photos/1"
curl -s "$API_URL/photos/1" | jq .

# --- Test PUT photo
echo "Testing: PUT /photos/1"
curl -s -X PUT "$API_URL/photos/1" -H "Content-Type: application/json" -d '{
  "caption": "Updated caption!"
}' | jq .

# --- Test DELETE photo
echo "Testing: DELETE /photos/1"
curl -s -X DELETE "$API_URL/photos/1" | jq .

# --- Test user endpoints
echo "Testing: GET /users/0/businesses"
curl -s "$API_URL/users/0/businesses" | jq .

echo "Testing: GET /users/21/reviews"
curl -s "$API_URL/users/21/reviews" | jq .

echo "Testing: GET /users/21/photos"
curl -s "$API_URL/users/21/photos" | jq .

echo "All API endpoint tests finished."

