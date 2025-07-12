# Serverless Todo API with DynamoDB and API Gateway

A complete serverless REST API built with AWS Lambda, API Gateway, and DynamoDB for managing todo items, with a frontend hosted on S3.

## 🏗️ Architecture

This project demonstrates a modern serverless architecture using:

- **Amazon API Gateway**: Exposes REST endpoints for the todo API
- **AWS Lambda**: Serverless functions handling CRUD operations
- **Amazon DynamoDB**: NoSQL database for storing todo items
- **Amazon S3**: Static website hosting for the frontend
- **AWS IAM**: Security policies and roles
- **Amazon CloudWatch**: Monitoring and logging

## 📁 Project Structure

```
serverless-todo-api/
├── template.yaml                 # AWS SAM template (Infrastructure as Code)
├── deploy.sh                    # Backend deployment script
├── deploy-frontend.sh           # Frontend deployment script
├── backend/
│   └── src/
│       ├── create_todo.py       # Create todo Lambda function
│       ├── get_todos.py         # Get all todos Lambda function
│       ├── get_todo.py          # Get single todo Lambda function
│       ├── update_todo.py       # Update todo Lambda function
│       └── delete_todo.py       # Delete todo Lambda function
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── style.css                # CSS styles
│   └── app.js                   # JavaScript frontend logic
└── README.md                    # This file
```

## 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/todos` | Get all todos |
| POST   | `/todos` | Create a new todo |
| GET    | `/todos/{id}` | Get a specific todo |
| PUT    | `/todos/{id}` | Update a todo |
| DELETE | `/todos/{id}` | Delete a todo |

## 📋 Prerequisites

Before deploying this application, ensure you have:

1. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```

2. **AWS SAM CLI** installed
   ```bash
   pip install aws-sam-cli
   ```

3. **AWS Account** with appropriate permissions for:
   - Lambda functions
   - API Gateway
   - DynamoDB
   - S3 buckets
   - IAM roles
   - CloudFormation

## 🔧 Deployment Instructions

### Step 1: Deploy the Backend Infrastructure

```bash
# Make scripts executable (if not already)
chmod +x deploy.sh deploy-frontend.sh

# Deploy the serverless infrastructure
./deploy.sh [stack-name]
```

This will:
- Create the DynamoDB table
- Deploy Lambda functions
- Set up API Gateway
- Create S3 bucket for frontend
- Configure IAM roles and policies

### Step 2: Deploy the Frontend

```bash
# Deploy frontend to S3
./deploy-frontend.sh [stack-name]
```

This will:
- Update the API URL in the frontend JavaScript
- Upload frontend files to S3
- Configure S3 for static website hosting

### Step 3: Access Your Application

After deployment, you'll receive URLs for:
- **API Gateway**: Your REST API endpoint
- **Frontend**: Your web application

## 🛠️ Development

### Local Testing

You can test the Lambda functions locally using SAM:

```bash
# Start API Gateway locally
sam local start-api

# Test individual functions
sam local invoke CreateTodoFunction -e events/create-todo.json
```

### Frontend Development

For frontend development, you can serve the files locally:

```bash
# Serve frontend locally (requires Python)
cd frontend
python -m http.server 8080
```

## 📊 Monitoring and Logging

### CloudWatch Logs

All Lambda functions automatically log to CloudWatch. You can view logs in the AWS Console or using CLI:

```bash
# View logs for a specific function
aws logs tail /aws/lambda/serverless-todo-api-CreateTodoFunction --follow
```

### API Gateway Metrics

Monitor API performance in the CloudWatch console:
- Request count
- Error rates
- Response times

## 🔒 Security Features

- **CORS**: Configured to allow cross-origin requests
- **IAM Roles**: Least privilege access for Lambda functions
- **Input Validation**: Server-side validation in Lambda functions
- **XSS Protection**: HTML escaping in frontend

## 📚 Learning Outcomes

This project teaches:

1. **Serverless Architecture**: Building scalable, event-driven applications
2. **API Gateway Integration**: Creating REST APIs with Lambda backends
3. **DynamoDB Operations**: NoSQL database operations and best practices
4. **Infrastructure as Code**: Using AWS SAM for reproducible deployments
5. **Frontend-Backend Integration**: Connecting web applications to APIs
6. **AWS Security**: IAM roles, policies, and secure API design

## 🧪 Testing the API

### Using cURL

```bash
# Create a todo
curl -X POST https://your-api-url/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn AWS", "description": "Study serverless architecture"}'

# Get all todos
curl https://your-api-url/todos

# Get a specific todo
curl https://your-api-url/todos/{todo-id}

# Update a todo
curl -X PUT https://your-api-url/todos/{todo-id} \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title", "completed": true}'

# Delete a todo
curl -X DELETE https://your-api-url/todos/{todo-id}
```

### Using the Frontend

1. Open the frontend URL in your browser
2. Add new todos using the form
3. Edit, complete, or delete todos using the interface
4. All changes are automatically saved to DynamoDB

## 📈 Scaling Considerations

- **DynamoDB**: Automatically scales based on demand
- **Lambda**: Concurrent executions scale automatically
- **API Gateway**: Handles high request volumes
- **S3**: Scales for static content delivery

## 💰 Cost Optimization

- **Pay-per-use**: Only pay for actual usage
- **DynamoDB on-demand**: No minimum capacity charges
- **Lambda free tier**: 1M requests/month free
- **S3 static hosting**: Very low cost for static content

## 🔄 CI/CD Integration

This project can be integrated with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Deploy Serverless Todo API
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        run: ./deploy.sh
```

## 🧹 Cleanup

To remove all resources:

```bash
# Delete the CloudFormation stack
aws cloudformation delete-stack --stack-name serverless-todo-api

# Empty and delete S3 bucket (if needed)
aws s3 rb s3://bucket-name --force
```

## 📝 Todo Schema

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "completed": "boolean",
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure your AWS credentials have the necessary permissions
2. **Region Mismatch**: Verify all resources are in the same AWS region
3. **CORS Issues**: Check that CORS is properly configured in API Gateway
4. **Lambda Timeouts**: Increase timeout values if needed

### Getting Help

- Check CloudWatch logs for detailed error messages
- Review AWS SAM documentation
- Consult AWS Lambda and API Gateway documentation

---

## 🎯 Next Steps

- Add authentication with AWS Cognito
- Implement real-time updates with WebSockets
- Add search and filtering capabilities
- Create mobile app using the same API
- Add automated testing
- Implement blue-green deployments