import json
import boto3
import os
from decimal import Decimal

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
    Get all todo items
    """
    try:
        # Scan all items from DynamoDB
        response = table.scan()
        items = response['Items']
        
        # Sort by created_at (newest first)
        items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'todos': items,
                'count': len(items)
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error getting todos: {str(e)}")
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