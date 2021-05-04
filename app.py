from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import traceback 
import os
import time

# Assistant
from watson_developer_cloud import AssistantV2
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from functions.credentials import getService
from functions.auth_user import auth, getUser
from flask import session

# Login
from flask import redirect, url_for, Response, abort, session
from flask_login import LoginManager, login_required, login_user, logout_user, UserMixin

# Image
import io
from PIL import Image

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

#############
### LOGIN ###
#############

# # Required for login

# Secret Key to use for login
app.config.update(SECRET_KEY='aoun@ibm')

# flask-login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# user model for login
class User(UserMixin):

    def __init__(self, id, name):
        self.id = id
        self.name = name

    def __repr__(self):
        return "%d/%s" % (self.id, self.name)

    def get_id(self):
        return self.id

    def is_anonymous(self):
        return False

    def is_active(self):
        return True

## Login methods ##
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        success, uid = auth(username, password)

        if(success):
            login_user(User(uid, username))
            return redirect(url_for('home'))
        else:
            return abort(401)
    else:
        return render_template("login.html")

# logout API
@app.route("/logout", methods=["GET"])
@login_required
def logout():
    logout_user()
    session.clear()
    return redirect('login')

# handle login failed
@app.errorhandler(401)
def page_not_found(e):
    return Response('<p>Login failed, Invalid username or password</p>')

# callback to reload the user object
@login_manager.user_loader
def load_user(uid):
    return User(uid, getUser(uid))

############
### CHAT ###
############

# Secret Key to use for session
app.config.update(SECRET_KEY='aoun@ibm')

## Watson Assistant ##
api, url = getService('assistant')

authenticator = IAMAuthenticator(api)
assistant = AssistantV2(
    version='2020-09-24',
    authenticator=authenticator
)
assistant.set_service_url(url)
ASSISTANT_ID = "12345"

## Chat page ##
@app.route('/chat')
def chat():

    ## Watson session context
    response = assistant.create_session(
        assistant_id=ASSISTANT_ID
        ).get_result()
    session['session_id'] = response['session_id']
    ## End Watson session context

    return render_template('chat.html')

## Chat GET Request handler ##
@app.route('/local-api/message', methods=['POST'])
def message():

    msg = request.form.get('msg')

    if 'session_id' not in session:
        response = assistant.create_session(
            assistant_id=ASSISTANT_ID
            ).get_result()
        session['session_id'] = response['session_id']

    if 'input' in msg:
        inp = {
            'message_type': 'text',
            'text': msg
            }
    else:
        inp = {
            'message_type': 'text',
            'text': 'Hello'
        }

    reply = 'Have a reply'

    ## Watson Assistant ##
    try:
        r = assistant.message(
            assistant_id=ASSISTANT_ID,
            session_id=session['session_id'],
            input=inp
        ).get_result()

        reply = r['output']['generic'][0]['text']

    except Exception as e:
        traceback.print_exc(chain=False)
        return repr(e)
    ## Watson Assistant END ##

    return reply

############
### MAIN ###
############

## Main methods ##
@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


@app.route('/')
def home():
    return render_template('index.html')

## GET Request handler ##
@app.route('/local-api/post', methods=['POST'])
def getApi():

    try:
        print(request.form)
        req = request.form.to_dict()['request']
        print(req)

        time.sleep(2)

        return jsonify({'response': "POST Response"})

    except Exception as e:
        traceback.print_exc(chain=False)
        return jsonify({"error": repr(e)})

## GET Request handler ##
@app.route('/local-api/get', methods=['GET'])
def postApi():

    try:
        req = request.args.get('request')
        print(req)

        time.sleep(2)

        return jsonify({'response': "GET Response"})

    except Exception as e:
        traceback.print_exc(chain=False)
        return jsonify({"error": repr(e)})


######################
### Image Handling ###
######################

@app.route('/local-api/image', methods=['POST'])
def postAPI():

    try:
        data = request.files.get('image').read()

        image = Image.open(io.BytesIO(data))
        image.save('images/temp.png')

        time.sleep(2)

        return jsonify({'response': "Done Saving Image"})

    except Exception as e:
        traceback.print_exc(chain=False)
        return jsonify({"error": repr(e)})

################################
### Public Json post request ###
################################

@app.route('/api/v1/process', methods=['POST'])
def publicAPI():

    try:
        data = request.get_json()

        time.sleep(2)

        return jsonify({'response': data})

    except Exception as e:
        traceback.print_exc(chain=False)
        return jsonify({"error": repr(e)})


## Main ##
if __name__ == '__main__':

    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
