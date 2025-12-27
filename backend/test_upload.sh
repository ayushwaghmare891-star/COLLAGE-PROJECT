#!/bin/bash

# Get a test token (you'll need to adjust this)
# For now, let's just test the endpoint structure

# Create a test file
echo "This is a test student ID document" > test_file.txt

# Test the file upload endpoint
# Note: This will fail with auth error, but we can see if multer is working
curl -X POST http://localhost:5000/api/verification/upload-student-id \
  -F "studentId=@test_file.txt" \
  -H "Authorization: Bearer test-token" \
  -v

# Cleanup
rm test_file.txt
