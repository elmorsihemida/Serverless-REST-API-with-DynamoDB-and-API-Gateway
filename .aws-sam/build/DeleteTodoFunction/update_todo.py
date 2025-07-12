import json
import boto3
import os
from datetime import datetime
from decimal import Decimal
from botocore.exceptions import ClientError

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    Update a todo item
    """
    try:
        # Get ID from path parameters
        todo_id = event['pathParameters']['id']
        
        # Parse request body
        body = json.loads(event['body'])
        
        # Check if todo exists
        response = table.get_item(Key={'id': todo_id})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Todo not found'
                })
            }
        
        # Prepare update expression
        update_expression = "SET updated_at = :updated_at"
        expression_attribute_values = {
            ':updated_at': datetime.utcnow().isoformat()
        }
        
        # Add fields to update
        if 'title' in body:
            update_expression += ", title = :title"
            expression_attribute_values[':title'] = body['title']
        
        if 'description' in body:
            update_expression += ", description = :description"
            expression_attribute_values[':description'] = body['description']
        
        if 'completed' in body:
            update_expression += ", completed = :completed"
            expression_attribute_values[':completed'] = body['completed']
        
        # Update item in DynamoDB
        response = table.update_item(
            Key={'id': todo_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues='ALL_NEW'
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response['Attributes'], cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error updating todo: {str(e)}")
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