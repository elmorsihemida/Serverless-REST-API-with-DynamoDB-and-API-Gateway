#!/bin/bash

# Frontend Deployment Script
# This script updates the API URL in the frontend and uploads it to S3

set -e

STACK_NAME=${1:-serverless-todo-api}

if [ -z "$STACK_NAME" ]; then
    echo "Usage: $0 <stack-name>"
    exit 1
fi

echo "🌐 Deploying frontend to S3..."

# Get the API Gateway URL and S3 bucket name from CloudFormation outputs
API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`TodoApiUrl`].OutputValue' \
    --output text)

S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Resources[?ResourceType==`AWS::S3::Bucket`].PhysicalResourceId' \
    --output text)

if [ -z "$API_URL" ] || [ -z "$S3_BUCKET" ]; then
    echo "❌ Could not retrieve API URL or S3 bucket name. Make sure the stack is deployed."
    exit 1
fi

echo "📝 Updating API URL in frontend..."
# Update the API URL in the JavaScript file
sed -i.bak "s|https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod|$API_URL|g" frontend/app.js

echo "📤 Uploading frontend files to S3..."
aws s3 sync frontend/ s3://$S3_BUCKET/ --delete

echo "✅ Frontend deployment complete!"

FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
    --output text)

echo ""
echo "🔗 Your application is now live at: $FRONTEND_URL"
echo ""