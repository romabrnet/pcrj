from flask import Flask, render_template, request

# Image
import io
from PIL import Image

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')

# Login
from flask import redirect, url_for, Response, abort, session, requests #, json

## Login methods ##
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        pload = {'ambiente': 'DESENVOLVIMENTO',
            'provedor': '3451',
            'consumidor': '3451',
            'chaveAcesso': 'e42b656e-20fc-4dfd-960a-626489c3ae13',
            'usuario': username,
            'senhaUsuario': password} # se for chave_do_recurso, nao passa a senha.
        response = requests.get('https://jeap.rio.rj.gov.br/cerberus/seam/resource/v1/permissoes', headers = pload)
        # https://jeap.rio.rj.gov.br/cerberus/seam/resource/v1/permissoes/CHAVE_DO_RECURSO 
        success = True #response.ok

        if(success):
            #rd = response.json()
            #login_user(User(uid, username))
            return redirect(url_for('home'))
        else:
            return abort(401)
    else:
        return render_template("login.html")

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


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
