from flask import Flask, request, jsonify, make_response
from bson import ObjectId
from flask_cors import CORS
import azure.cosmos.exceptions as exceptions
import azure.cosmos.cosmos_client as cosmos_client
import os
import uuid
from waitress import serve

app = Flask(__name__)
CORS(app)

# defining db
settings = {
    'host': os.environ.get('ACCOUNT_HOST', 'https://rainy-day-b00806336-gk.documents.azure.com:443/'),
    'master_key': os.environ.get('ACCOUNT_KEY', 'AfyR1IGqlXiwFsPwoDW5STjKSn4DTPM34WLPPzPo11VBN2d1m7LerVbLTMt0xCybS8MWdLza8f7LACDbOGtpFA==')
}

client = cosmos_client.CosmosClient(
    settings['host'],
    {'masterKey': settings['master_key']}, 
    user_agent="CosmosDBPythonQuickstart", 
    user_agent_overwrite=True)

db = client.get_database_client("RainyDay")
container = db.get_container_client("RainyDay")



# GET transactions of all users
@app.route("/api/transactions", methods = ["GET"])
def show_all_transactions():
    page_num, page_size = 1, 10
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))

    data_to_return = []
    item_list = list(container.read_all_items(max_item_count=10))
# for transaction in transactions.find().skip(page_start).limit(page_size):
    for transaction in item_list:
        transaction['id'] = str(transaction['id'])
        for note in transaction['notes']:
            note['id'] = str(note['id'])
        data_to_return.append(transaction)

    return make_response( jsonify( data_to_return ), 200 )


# GET all transactions of a single user
@app.route("/api/transactions/<string:user_id>", methods = ["GET"])
def show_all_user_transactions(user_id):
    user_trasactions = list(container.query_items(
        f"SELECT * FROM {container.id} r WHERE r.userID='{user_id}'",
        enable_cross_partition_query=True,
    ))

    if len(user_trasactions) == 0:
        raise exceptions.CosmosResourceExistsError(user_id) #add own exception for this
    
    return make_response( jsonify( user_trasactions ), 200 )


# GET one transaction
@app.route("/api/transactions/<string:user_id>/<string:id>", methods = ["GET"])
def show_one_transaction(user_id, id):
    transaction_list = list(container.query_items(
        f"SELECT * FROM {container.id} r WHERE r.userID='{user_id}' AND r.id='{id}'",
        enable_cross_partition_query=True,
    ))
    for transaction in transaction_list:
        if transaction is not None:
            transaction['id'] = str(transaction['id'])
            for note in transaction['notes']:
                note['id'] = str(note['id'])
            return make_response( jsonify( [transaction] ), 200 )
        else:
            return make_response( jsonify( { "error" : "Invalid transaction ID" } ), 404 )


# ADD a transaction
@app.route("/api/transactions/<string:user_id>", methods=["POST"])
def add_transaction(user_id):
    if "description" in request.form and "transaction_direction" in request.form and "amount" in request.form and "category" in request.form and "date" in request.form:
        id = str(uuid.uuid1())
        new_transaction = {
            "id": id,
            "userID": user_id,
            "description" : request.form["description"],
            "transaction_direction" : request.form["transaction_direction"],
            "amount" : request.form["amount"],
            "category" : request.form["category"],
            "date" : request.form["date"],
            "notes" : []
        }
        container.create_item(body=new_transaction)

        new_transaction_link = "https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions/{}/{}".format(user_id, id)
        return make_response( jsonify( { "url" : new_transaction_link} ), 201 )
    else:
        return make_response(jsonify( { "error" : "Missing form data" } ), 404 )
    

# EDIT transaction
@app.route("/api/transactions/<string:user_id>/<string:transaction_id>", methods=["PUT"])
def edit_transaction(user_id, transaction_id):
    if "description" in request.form and "transaction_direction" in request.form and "amount" in request.form and "category" in request.form and "date" in request.form:
        description = request.form["description"]
        transaction_direction = request.form["transaction_direction"]
        amount = request.form["amount"]
        category = request.form["category"]
        date = request.form["date"]
        item = container.read_item(item=transaction_id, partition_key=user_id)
        item['description'] = description
        item['transaction_direction'] = transaction_direction
        item['amount'] = amount
        item['category'] = category
        item['date'] = date
        container.upsert_item(body=item)
        edited_transaction_link = "https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions/{}/{}".format(user_id, transaction_id)
        return make_response( jsonify( { "url" : edited_transaction_link} ), 201 )
    else:
        return make_response(jsonify( { "error" : "Missing form data" } ), 404 )
    

# DELETE transaction
@app.route("/api/transactions/<string:user_id>/<string:transaction_id>", methods=["DELETE"])
def delete_transaction(user_id, transaction_id):
    transaction_list = list(container.query_items(
        f"SELECT * FROM {container.id} r WHERE r.userID='{user_id}' AND r.id='{transaction_id}'",
        enable_cross_partition_query=True,
    ))
    if len(transaction_list) >= 1:
        response = container.delete_item(item=transaction_id, partition_key=user_id)
        return make_response( jsonify( {} ), 204 )
    else:
        return make_response( jsonify( { "error" : "Invalid transaction ID" } ), 404 )



if __name__ == "__main__":
    app.run(debug = True, host="0.0.0.0", port=5000)
    # serve(app, host="0.0.0.0", port=5000)