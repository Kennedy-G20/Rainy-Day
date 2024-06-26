from flask import Flask, request, jsonify, make_response
from bson import ObjectId
from flask_cors import CORS
import azure.cosmos.exceptions as exceptions
import azure.cosmos.cosmos_client as cosmos_client
import os
import uuid
from waitress import serve
import jwt
from functools import wraps


# Wrapper function for ensuring authenticated user
# Accesses bearer token for current logged in user and returns username
def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        header = request.headers.get('Authorization')
        if header:
            token = header.split(' ')[1]
        if not header:
            return jsonify( { 'message' : 'Token is missing' }), 401
        try :
            decoded_token = jwt.decode(token, verify=False)
            user_id = (decoded_token['sub'])
        except:
            return jsonify( { 'message' : 'Token is unvalid' } ) , 401
        return func(*args, **kwargs, user_id=user_id)
    return jwt_required_wrapper


# Set up Flask app
app = Flask(__name__)
CORS(app)


# Defining Cosmos DB settings
settings = {
    'host': os.environ.get('ACCOUNT_HOST', 'https://rainy-day-b00806336-gk.documents.azure.com:443/'),
    'master_key': os.environ.get('ACCOUNT_KEY', 'AfyR1IGqlXiwFsPwoDW5STjKSn4DTPM34WLPPzPo11VBN2d1m7LerVbLTMt0xCybS8MWdLza8f7LACDbOGtpFA==')
}

# Defining Cosmos DB client
client = cosmos_client.CosmosClient(
    settings['host'],
    {'masterKey': settings['master_key']}, 
    user_agent="CosmosDBPythonQuickstart", 
    user_agent_overwrite=True)

# Getting database and container
db = client.get_database_client("RainyDay")
container = db.get_container_client("RainyDay")



# GET all transactions of a single user endpoint
@app.route("/api/transactions", methods = ["GET"])
@jwt_required
def show_all_user_transactions(user_id):
    # Get page number argument for pagination
    page_num, page_size = 1, 10
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))

    # Get filter argument for what transactions (in/out/all)
    # Sorted by most recent
    transaction_direction = request.args.get('td')
    if transaction_direction == "in":
        user_transactions = list(container.query_items(
            f"SELECT * FROM {container.id} t WHERE t.userID='{user_id}' AND t.transaction_direction='income' ORDER BY t.date DESC OFFSET {page_start} LIMIT {page_size}",
            enable_cross_partition_query=True,
        ))
    elif transaction_direction == "out":
        user_transactions = list(container.query_items(
            f"SELECT * FROM {container.id} t WHERE t.userID='{user_id}' AND t.transaction_direction='outcome' ORDER BY t.date DESC OFFSET {page_start} LIMIT {page_size}",
            enable_cross_partition_query=True,
        ))
    else:
        user_transactions = list(container.query_items(
            f"SELECT * FROM {container.id} t WHERE t.userID='{user_id}' ORDER BY t.date DESC OFFSET {page_start} LIMIT {page_size}",
            enable_cross_partition_query=True,
        ))

    if len(user_transactions) == 0:
        return make_response( jsonify( { "error" : "No transactions for user" } ), 404 )
    
    return make_response( jsonify( user_transactions ), 200 )


# GET all of a users transaction categories endpoint
@app.route("/api/categories", methods = ["GET"])
@jwt_required
def show_all_user_categories(user_id):
    user_categories = list(container.query_items(
        f"SELECT DISTINCT t.category FROM {container.id} t WHERE t.userID='{user_id}'",
        enable_cross_partition_query=True,
    ))

    category_names = [category['category'] for category in user_categories]

    if len(user_categories) == 0:
        return make_response( jsonify( { "error" : "No transactions for user" } ), 404 )
    
    return make_response( jsonify( category_names ), 200 )


# GET all transactions from a category endpoint
@app.route("/api/categories/<string:category_name>", methods = ["GET"])
@jwt_required
def show_all_user_transactions_in_category(user_id, category_name):
    page_num, page_size = 1, 10
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))

    # Sorted by most recent
    user_trasactions = list(container.query_items(
        f"SELECT * FROM {container.id} t WHERE t.userID='{user_id}' AND t.category='{category_name}' ORDER BY t.date DESC OFFSET {page_start} LIMIT {page_size}",
        enable_cross_partition_query=True,
    ))

    if len(user_trasactions) == 0:
        return make_response( jsonify( { "error" : "No transactions for category" } ), 404 )
    
    return make_response( jsonify( user_trasactions ), 200 )


# GET one transaction endpoint
@app.route("/api/transactions/<string:transaction_id>", methods = ["GET"])
@jwt_required
def show_one_transaction(user_id, transaction_id):
    transaction_list = list(container.query_items(
        f"SELECT * FROM {container.id} t WHERE t.userID='{user_id}' AND t.id='{transaction_id}'",
        enable_cross_partition_query=True,
    ))
    for transaction in transaction_list:
        if transaction is not None:
            transaction['id'] = str(transaction['id'])
            for note in transaction['notes']:
                note['_id'] = str(note['_id'])
            return make_response( jsonify( [transaction] ), 200 )
        else:
            return make_response( jsonify( { "error" : "Invalid transaction ID" } ), 404 )


# ADD a transaction endpoint
@app.route("/api/transactions", methods=["POST"])
@jwt_required
def add_transaction(user_id):
    # Verify form contains all data
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

        new_transaction_link = "http://127.0.0.1:5000/api/transactions/{}".format(id)
        return make_response( jsonify( { "url" : new_transaction_link} ), 201 )
    else:
        return make_response(jsonify( { "error" : "Missing form data" } ), 404 )
    

# EDIT transaction endpoint
@app.route("/api/transactions/<string:transaction_id>", methods=["PUT"])
@jwt_required
def edit_transaction(user_id, transaction_id):
    # Verify form contains all data
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
        edited_transaction_link = "http://127.0.0.1:5000/api/transactions/{}".format(transaction_id)
        return make_response( jsonify( { "url" : edited_transaction_link} ), 201 )
    else:
        return make_response(jsonify( { "error" : "Missing form data" } ), 404 )
    

# DELETE transaction endpoint
@app.route("/api/transactions/<string:transaction_id>", methods=["DELETE"])
@jwt_required
def delete_transaction(user_id, transaction_id):
    # Check transaction exists
    transaction_list = list(container.query_items(
        f"SELECT * FROM {container.id} t WHERE t.userID='{user_id}' AND t.id='{transaction_id}'",
        enable_cross_partition_query=True,
    ))
    # Delete
    if len(transaction_list) >= 1:
        response = container.delete_item(item=transaction_id, partition_key=user_id)
        return make_response( jsonify( {} ), 204 )
    else:
        return make_response( jsonify( { "error" : "Invalid transaction ID" } ), 404 )


# Search transactions endpoint
@app.route("/api/search", methods=["GET"])
@jwt_required
def search_transactions(user_id):
    # Get keyword argument and make lowercase
    query = request.args.get('q').lower()
    # Check for value within database
    if query:
        search_results = list(container.query_items(
            f"SELECT * FROM {container.id} t WHERE t.userID='{user_id}' AND CONTAINS(LOWER(t.description), '{query}')",
            enable_cross_partition_query=True,
        ))
        return make_response(jsonify(search_results), 200)
    else:
        return make_response(jsonify({"error": "Nothing matches this search"}), 400) 


# ADD a new note endpoint
@app.route("/api/transactions/<string:transaction_id>/notes", methods=["POST"])
@jwt_required
def add_new_note(user_id, transaction_id):
    # Get current transaction from DB
    transaction = container.read_item(item=transaction_id, partition_key=user_id)
    # If transaction exits, note attribute is created with unique ID
    if transaction:
        note_id = str(uuid.uuid1())
        new_note = { 
            "_id": note_id,
            "note" : request.form["note"],
        }
        print(new_note)
        transaction['notes'].append(new_note)
        container.upsert_item(body=transaction)
        new_note_link = "http://127.0.0.1:5000/api/transactions/{}/notes/{}".format(transaction_id, note_id)
        return make_response( jsonify( { "url" : new_note_link } ), 201 )
    else:
        return make_response(jsonify({"error": "Invalid transaction ID"}), 404)
    

# GET all notes for a single transaction endpoint
@app.route("/api/transactions/<string:transaction_id>/notes", methods=["GET"])
@jwt_required
def fetch_all_notes(user_id, transaction_id):
    # Get current transaction from DB
    transaction = container.read_item(item=transaction_id, partition_key=user_id)
    # If transaction exits, list all notes
    if transaction:
        notes = transaction.get('notes', [])
        data_to_return = []
        for note in notes:
            data_to_return.append(note)
        return make_response( jsonify( data_to_return ), 200 )
    else:
        return make_response(jsonify({"error": "Invalid transaction ID"}), 404)
    

# GET a specific single note from a transaction endpoint
@app.route("/api/transactions/<string:transaction_id>/notes/<string:note_id>", methods=["GET"])
@jwt_required
def fetch_one_note(user_id, transaction_id, note_id):
    notes_list = list(container.query_items(
        f"SELECT VALUE n FROM {container.id} t JOIN n IN t.notes WHERE t.id='{transaction_id}' AND t.userID='{user_id}' AND n._id='{note_id}'", 
        enable_cross_partition_query=True))
    if notes_list is None:
         return make_response(jsonify({"error": "Invalid Note ID"}), 404)
    return jsonify(notes_list[0]), 200


# EDIT a note endpoint
@app.route("/api/transactions/<string:transaction_id>/notes/<string:note_id>", methods=["PUT"])
@jwt_required
def edit_note(user_id, transaction_id, note_id):
    edited_note = request.form["note"]
    # Get current transaction from DB
    item = container.read_item(item=transaction_id, partition_key=user_id)
    for note in item["notes"]:
        # Get current note and update with new note data
        if note["_id"] == note_id:
            note["note"] = edited_note
            container.upsert_item(body=item)
    edited_note_link = "http://127.0.0.1:5000/api/transactions/{}/notes/{}".format(transaction_id, note_id)
    return make_response( jsonify( { "url" : edited_note_link } ), 200 )
    

# DELETE a note endpoint
@app.route("/api/transactions/<string:transaction_id>/notes/<string:note_id>", methods=["DELETE"])
@jwt_required
def delete_note(user_id, transaction_id, note_id):
    # Get current transaction from DB
    item = container.read_item(item=transaction_id, partition_key=user_id)
    # New list for notes
    new_notes_list = []
    deleted_count = 0
    # Append all notes except deleted note
    # Count deletions
    for note in item["notes"]:
        if note["_id"] == note_id:
            deleted_count += 1
        else:
            new_notes_list.append(note)
    if deleted_count > 0:
        item["notes"] = new_notes_list
        container.upsert_item(body=item)
        return make_response( jsonify( {} ), 204 )
    else:
        return make_response( jsonify( { "error" : "Invalid Note ID" } ), 404 )


# Execute Flask
if __name__ == "__main__":
    app.run(debug = True, host="0.0.0.0", port=5000)
    