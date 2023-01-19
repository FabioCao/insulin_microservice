from datetime import datetime
from flask import jsonify, make_response, abort

from pymongo import MongoClient

#client = MongoClient("mongodb://localhost:27017/") # Local
client = MongoClient("mongodb://mongo2:27017")
db = client.insulinas

def get_dict_from_mongodb():
    itens_db = db.insulinas.find()
    INSULIN = {}
    for i in itens_db:
            i.pop('_id') # retira id: criado automaticamente docker 
            item = dict(i)
            INSULIN[item["insulina"]] = (i)
    return INSULIN

def get_timestamp():
    return datetime.now().strftime(("%Y-%m-%d %H:%M:%S"))

def read_all():
    INSULIN = get_dict_from_mongodb()
    dict_insulinas = [INSULIN[key] for key in sorted(INSULIN.keys())]
    insulinas = jsonify(dict_insulinas)
    qtd = len(dict_insulinas)
    content_range = "insulinas 0-"+str(qtd)+"/"+str(qtd)
    # Configura headers
    insulinas.headers['Access-Control-Allow-Origin'] = '*'
    insulinas.headers['Access-Control-Expose-Headers'] = 'Content-Range'
    insulinas.headers['Content-Range'] = content_range
    return insulinas

def read_one(insulina):
    INSULIN = get_dict_from_mongodb()
    if insulina in INSULIN:
        insulin = INSULIN.get(insulina)
    else:
        abort(
            404, "Insulina {insulina} nao encontrada".format(insulina=insulina)
        )
    return insulin

def create(insulin):
    insulina = insulin.get("insulina", None)
    tipo = insulin.get("tipo", None)
    acao = insulin.get("acao", None)
    pico = insulin.get("pico", None)
    duracao = insulin.get("duracao", None)	
    INSULIN = get_dict_from_mongodb()
    if insulina not in INSULIN and insulina is not None:
        item = {
            "insulina": insulina,
            "tipo": tipo,
			"acao": acao,
			"pico": pico,
			"duracao": duracao,
            "timestamp": get_timestamp(),
        }
        db.insulinas.insert_one(item)
        return make_response(
            "Insulina {insulina} criada com sucesso".format(insulina=insulina), 201
        )
    else:
        abort(
            406,
            "Insulina ja existe".format(insulina=insulina),
        )

def update(insulina, insulin):
    query = { "insulina": insulina }
    update = { "$set": {
            "insulina": insulina,
            "tipo": insulin.get("tipo"),
			"acao": insulin.get("acao"),
			"pico": insulin.get("pico"),
			"duracao": insulin.get("duracao"),
            "timestamp": get_timestamp(), } 
        }
    INSULIN = get_dict_from_mongodb()

    if insulina in INSULIN:
        db.insulinas.update_one(query, update)
        INSULIN = get_dict_from_mongodb()
        return INSULIN[insulina]
    else:
        abort(
            404, "Insulina {insulina} nao encontrada".format(insulina=insulina)
        )

def delete(insulina):
    query = { "insulina": insulina }
    INSULIN = get_dict_from_mongodb()
    if insulina in INSULIN:
        db.insulinas.delete_one(query)
        return make_response(
            "Insulina {insulina} deletada com sucesso".format(insulina=insulina), 200
        )
    else:
        abort(
            404, "Insilina {insulina} nao encontrada".format(insulina=insulina)
        )

