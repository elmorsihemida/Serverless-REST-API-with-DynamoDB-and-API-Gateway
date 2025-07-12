import json
import boto3
import uuid
from datetime import datetime
from decimal import Decimal
import os

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    """
    Create a new todo item
    """
    try:
        # Parse request body
        body = json.loads(event['body'])
        
        # Validate required fields
        if 'title' not in body:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Title is required'
                })
            }
        
        # Create todo item
        todo_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        item = {
            'id': todo_id,
            'title': body['title'],
            'description': body.get('description', ''),
            'completed': False,
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        # Save to DynamoDB
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(item)
        }
        
    except Exception as e:
        print(f"Error creating todo: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error'
            })
        }