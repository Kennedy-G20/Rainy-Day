from flask import Flask, request, jsonify, make_response
from bson import ObjectId
import pymongo
from flask_cors import CORS
import azure.cosmos.cosmos_client as cosmos_client
from azure.cosmos.partition_key import PartitionKey
import azure.cosmos.documents as documents
import os
import uuid

app = Flask(__name__)
CORS(app)

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
transactions = db.get_container_client("RainyDay")


# will need to change later this only works for the one user

@app.route("/api/transactions", methods = ["GET"])
def show_all_transactions():
    page_num, page_size = 1, 10
    if request.args.get('pn'):
        page_num = int(request.args.get('pn'))
    if request.args.get('ps'):
        page_size = int(request.args.get('ps'))
    page_start = (page_size * (page_num - 1))

    data_to_return = []
    item_list = list(transactions.read_all_items(max_item_count=10))
# for transaction in transactions.find().skip(page_start).limit(page_size):
    for transaction in item_list:
        transaction['id'] = str(transaction['id'])
        for note in transaction['notes']:
            note['id'] = str(note['id'])
        data_to_return.append(transaction)

    return make_response( jsonify( data_to_return ), 200 )


@app.route("/api/transactions/<string:id>", methods = ["GET"])
def show_one_transaction(id):
    user_id = "testUser123"
    transaction = list(transactions.query_items(
        query="SELECT * FROM r WHERE r.id=@id AND r.partitionKey=@user_id",
        parameters=[
            { "name":"@id", "value": id },
            { "name":"@user_id", "value": user_id }
        ]
    ))
    if transaction is not None:
        transaction['id'] = str(transaction['id'])
        for note in transaction['notes']:
            note['id'] = str(note['id'])
        return make_response( jsonify( [transaction] ), 200 )
    else:
        return make_response( jsonify( { "error" : "Invalid transaction ID" } ), 404 )


    # transaction = transactions.find_one( {'id':ObjectId(id) } )
    # if transaction is not None:
    #     transaction['id'] = str(transaction['id'])
    #     for note in transaction['notes']:
    #         note['id'] = str(note['id'])
    #     return make_response( jsonify( [transaction] ), 200 )
    # else:
    #     return make_response( jsonify( { "error" : "Invalid transaction ID" } ), 404 )


@app.route("/api/transactions", methods=["POST"])
def add_transaction():
    if "userID" in request.form and "description" in request.form and "transaction_direction" in request.form and "amount" in request.form and "category" in request.form and "date" in request.form:
        id = str(uuid.uuid1())
        userID = request.form["userID"]
        description = request.form["description"]
        transaction_direction = request.form["transaction_direction"]
        amount = request.form["amount"]
        category = request.form["category"]
        date = request.form["date"]
        new_transaction = {
            "id": id,
            "userID": userID,
            "description" : description,
            "transaction_direction" : transaction_direction,
            "amount" : amount,
            "category" : category,
            "date" : date,
            "notes" : []
        }
        transactions.create_item(body=new_transaction)

        new_transaction_link = "http://localhost:5000/api/transactions/" + id
        return make_response( jsonify( { "url" : new_transaction_link} ), 201 )
    else:
        return make_response(jsonify( { "error" : "Missing form data" } ), 404 )


@app.route("/api/transactions/<string:id>", methods=["PUT"])
def edit_transaction(id):
    if "description" in request.form and "transaction_direction" in request.form and "amount" in request.form and "category" in request.form and "date" in request.form:
        result = transactions.update_one( { "id" : ObjectId(id) }, {
            "$set" : { "description" : request.form["description"],
                       "transaction_direction" : request.form["transaction_direction"],
                       "amount" : request.form["amount"],
                       "category" : request.form["category"],
                       "date" : request.form["date"]
                     }
            } )
        if result.matched_count == 1:
            edited_transaction_link = "http://localhost:5000/api/transactions" + id
            return make_response( jsonify( { "url" : edited_transaction_link } ), 200 )
        else:
            return make_response( jsonify( { "error" : "Invalid transaction ID" } ), 404 )
    else:
        return make_response( jsonify( { "error" : "Missing form data" } ), 404 )


@app.route("/api/transactions/<string:id>", methods=["DELETE"])
def delete_transaction(id):
    result = transactions.delete_one( { "id" : ObjectId(id) } )
    if result.deleted_count == 1:
        return make_response( jsonify( {} ), 204 )
    else:
        return make_response( jsonify( { "error" : "Invalid transaction ID" } ), 404 )


@app.route("/api/transactions/<string:transaction_id>/notes", methods=["POST"])
def add_new_note(transaction_id):
    new_note = { 
        "id" : ObjectId(),
        "note" : request.form["note"]
    }
    transactions.update_one( { "id" : ObjectId(transaction_id) }, { "$push" : { "note" : new_note } } )
    new_note_link = "http://localhost:5000/api/transactions" + transaction_id + "/notes/" + str(new_note["id"])
    return make_response( jsonify( { "url" : new_note_link } ), 201 )


@app.route("/api/transactions/<string:transaction_id>/notes", methods=["GET"])
def fetch_all_notes(transaction_id):
    data_to_return = []
    transaction = transactions.find_one( { "id" : ObjectId(transaction_id) }, { "notes" : 1, "id" : 0 } )
    for note in transaction["notes"]:
        note["id"] = str(note["id"])
        data_to_return.append(note)
    return make_response( jsonify( data_to_return ), 200 )


@app.route("/api/transactions/<string:transaction_id>/notes/<string:note_id>", methods=["GET"])
def fetch_one_note(transaction_id, note_id):
    transaction = transactions.find_one( { "notes.id" : ObjectId(note_id) }, { "id" : 0, "notes.$" : 1} )
    if transaction is None:
        return make_response( jsonify( { "error" : "Invalid Note ID" } ), 404 )
    transaction['notes'][0]['id'] = str(transaction['notes'][0]['id'])
    return make_response( jsonify( transaction["notes"][0] ), 200 )


@app.route("/api/transactions/<string:transaction_id>/notes/<string:note_id>", methods=["PUT"])
def edit_note(transaction_id, note_id):
    edited_note = {
        "notes.$.note" : request.form["note"]
    }
    transactions.update_one( { "notes.id" : ObjectId(note_id) }, { "$set" : edited_note } )
    edited_note_url = "http://localhost:5000/api/transactions" + transaction_id + "/notes/" + note_id
    return make_response( jsonify( { "url" : edited_note_url } ), 200 )


@app.route("/api/transactions/<string:transaction_id>/notes/<string:note_id>", methods=["DELETE"])
def delete_note(transaction_id, note_id):
    transactions.update_one( { "id" : ObjectId(transaction_id) }, { "$pull" : { "notes" : { "id" : ObjectId(note_id) } } } )
    return make_response( jsonify( {} ), 204)


if __name__ == "__main__":
    app.run(debug = True)