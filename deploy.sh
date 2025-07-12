#!/bin/bash

# Serverless Todo API Deployment Script
# This script deploys the serverless REST API to AWS

set -e

echo "🚀 Starting deployment of Serverless Todo API..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI is not installed. Please install it first."
    echo "   Install: pip install aws-sam-cli"
    exit 1
fi

# Set default stack name if not provided
STACK_NAME=${1:-serverless-todo-api}

echo "📦 Building SAM application..."
sam build

echo "🚀 Deploying to AWS..."
sam deploy \
    --stack-name $STACK_NAME \
    --capabilities CAPABILITY_IAM \
    --resolve-s3 \
    --no-fail-on-empty-changeset \
    --parameter-overrides \
        Environment=prod

echo "✅ Deployment complete!"

# Get the API Gateway URL from CloudFormation outputs
API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`TodoApiUrl`].OutputValue' \
    --output text)

FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
    --output text)

echo ""
echo "🔗 Your API endpoints:"
echo "   API Gateway URL: $API_URL"
echo "   Frontend URL: $FRONTEND_URL"
echo ""
echo "📝 Next steps:"
echo "   1. Update the API_BASE_URL in frontend/app.js with: $API_URL"
echo "   2. Upload frontend files to S3 using: ./deploy-frontend.sh $STACK_NAME"
echo "   3. Test your API endpoints"
echo ""