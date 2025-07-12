import json
import boto3
import os
from botocore.exceptions import ClientError

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    """
    Delete a todo item
    """
    try:
        # Get ID from path parameters
        todo_id = event['pathParameters']['id']
        
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
        
        # Delete item from DynamoDB
        table.delete_item(Key={'id': todo_id})
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Todo deleted successfully'
            })
        }
        
    except Exception as e:
        print(f"Error deleting todo: {str(e)}")
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