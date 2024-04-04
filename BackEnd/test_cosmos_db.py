import azure.cosmos.cosmos_client as cosmos_client
import os
import uuid

settings = {
    'host': os.environ.get('ACCOUNT_HOST', 'https://rainy-day-b00806336-gk.documents.azure.com:443/'),
    'master_key': os.environ.get('ACCOUNT_KEY', 'AfyR1IGqlXiwFsPwoDW5STjKSn4DTPM34WLPPzPo11VBN2d1m7LerVbLTMt0xCybS8MWdLza8f7LACDbOGtpFA==')
}

HOST = settings['host']
MASTER_KEY = settings['master_key']

client = cosmos_client.CosmosClient(
    HOST,
    {'masterKey': MASTER_KEY}, 
    user_agent="CosmosDBPythonQuickstart", 
    user_agent_overwrite=True)

db = client.get_database_client("RainyDay")
container = db.get_container_client("RainyDay")

transaction = {
        "id": str(uuid.uuid1()),
        "userID": "testUser123",
        "description": "Asda",
        "transaction_direction": "outcome",
        "amount": 19.37,
        "category": "groceries",
        "date": "2024-04-15",
        "notes": []
    }

container.create_item(body=transaction)