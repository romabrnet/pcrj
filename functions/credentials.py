import os, json

def getService(name):
    
    if 'VCAP_SERVICES' in os.environ:
        vcap = json.loads(os.getenv('VCAP_SERVICES'))
        print('Found VCAP_SERVICES')

    elif os.path.isfile('credentials.json'):
        vcap = json.load(open('credentials.json'))
        print('Found local VCAP_SERVICES')
    
    
    if name in vcap:
        creds = vcap[name][0]['credentials']
        api = creds['api_key']
        url = creds['url']
        return (api, url)
    else:
        print("Service not initialized")
        return (None, None)
