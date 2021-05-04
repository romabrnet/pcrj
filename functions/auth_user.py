#
# functions to auth login
#

import json

def auth(username, password):

    db = json.load(open('users.json', 'r'))['users']
    valid = False
    id = None

    for u in db:
        if u['name']==username and u['pass']==password:
            valid = True
            id = u['id']

    return valid, id

def getUser(id):
    db = json.load(open('users.json', 'r'))['users']
    for u in db:
        if u['id']==id:
            return u['name']
    return None
