from pymongo import MongoClient
import json
from pathlib import Path

def create_database():
    client = MongoClient("mongodb://127.0.0.1:27017")
    db = client.RainyDay
    transactions = db.test    

    with open('trasaction_dataset.json') as f:
        json_data = json.load(f)
        transactions.insert_many(json_data)
    print("Transactions loaded")

create_database()