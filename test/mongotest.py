from pymongo import MongoClient

# Connect to MongoDB without authentication
client = MongoClient("mongodb://localhost:27017/")

# Select the database
db = client.ai_aggregator_dev

# Check existing collections
print("Collections:", db.list_collection_names())