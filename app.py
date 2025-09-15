from flask import Flask, render_template, jsonify
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount

app = Flask(__name__)

# --- Facebook SDK Initialization ---
# PLEASE REPLACE WITH YOUR OWN CREDENTIALS
APP_ID = 'YOUR_APP_ID'
APP_SECRET = 'YOUR_APP_SECRET'
ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'

FacebookAdsApi.init(APP_ID, APP_SECRET, ACCESS_TOKEN)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/audience_network_adsets')
def get_audience_network_adsets():
    try:
        fields = [
            'name',
            'targeting',
        ]
        ad_account = AdAccount('me')
        adsets = ad_account.get_ad_sets(fields=fields)

        # Filter for ad sets that target the Audience Network
        audience_network_adsets = []
        for adset in adsets:
            targeting = adset.get('targeting', {})
            publisher_platforms = targeting.get('publisher_platforms', [])
            if 'audience_network' in publisher_platforms:
                audience_network_adsets.append({
                    'name': adset['name'],
                    'id': adset['id'],
                    'targeting': targeting,
                })

        return jsonify(audience_network_adsets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8080)
