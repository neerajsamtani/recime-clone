import os

import boto3
from dotenv import load_dotenv

load_dotenv()


def create_dynamodb_client():
    return boto3.client(
        "dynamodb",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"),
    )


def create_users_table(dynamodb):
    try:
        table = dynamodb.create_table(
            TableName="Users",
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[
                {"AttributeName": "id", "AttributeType": "S"},
                {"AttributeName": "email", "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "EmailIndex",
                    "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"},
                    "ProvisionedThroughput": {
                        "ReadCapacityUnits": 5,
                        "WriteCapacityUnits": 5,
                    },
                }
            ],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
        )
        print("Users table created successfully")
        return table
    except dynamodb.exceptions.ResourceInUseException:
        print("Users table already exists")
        return None


def update_recipes_table(dynamodb):
    try:
        # First, check if the table exists
        existing_table = dynamodb.describe_table(TableName="Recipes")

        # Add GSI for user_id if it doesn't exist
        gsi_updates = []
        existing_gsis = existing_table["Table"].get("GlobalSecondaryIndexes", [])
        existing_gsi_names = [gsi["IndexName"] for gsi in existing_gsis]

        if "UserIdIndex" not in existing_gsi_names:
            gsi_updates.append(
                {
                    "Create": {
                        "IndexName": "UserIdIndex",
                        "KeySchema": [{"AttributeName": "user_id", "KeyType": "HASH"}],
                        "Projection": {"ProjectionType": "ALL"},
                        "ProvisionedThroughput": {
                            "ReadCapacityUnits": 5,
                            "WriteCapacityUnits": 5,
                        },
                    }
                }
            )

            # Add the new attribute definition
            dynamodb.update_table(
                TableName="Recipes",
                AttributeDefinitions=[
                    {"AttributeName": "user_id", "AttributeType": "S"}
                ],
                GlobalSecondaryIndexUpdates=gsi_updates,
            )
            print("Recipes table updated successfully with UserIdIndex")
        else:
            print("UserIdIndex already exists in Recipes table")

    except dynamodb.exceptions.ResourceNotFoundException:
        # Create the table if it doesn't exist
        table = dynamodb.create_table(
            TableName="Recipes",
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[
                {"AttributeName": "id", "AttributeType": "S"},
                {"AttributeName": "user_id", "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "UserIdIndex",
                    "KeySchema": [{"AttributeName": "user_id", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"},
                    "ProvisionedThroughput": {
                        "ReadCapacityUnits": 5,
                        "WriteCapacityUnits": 5,
                    },
                }
            ],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
        )
        print("Recipes table created successfully")
        return table


def main():
    dynamodb = create_dynamodb_client()
    create_users_table(dynamodb)
    update_recipes_table(dynamodb)


if __name__ == "__main__":
    main()
