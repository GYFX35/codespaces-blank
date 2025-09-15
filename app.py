import io
import pandas as pd
import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, render_template, request
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


@app.route('/seo_analysis')
def seo_analysis():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'URL parameter is required'}), 400

    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        title = soup.find('title').string if soup.find('title') else 'No title found'
        meta_description = soup.find('meta', attrs={'name': 'description'})
        meta_description = meta_description.get('content') if meta_description else 'No meta description found'
        h1_tags = [h1.string for h1 in soup.find_all('h1')]

        return jsonify({
            'title': title,
            'meta_description': meta_description,
            'h1_tags': h1_tags,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/data_analysis', methods=['POST'])
def data_analysis():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and file.filename.endswith('.csv'):
        try:
            csv_data = io.StringIO(file.stream.read().decode('UTF8'))
            df = pd.read_csv(csv_data)
            return jsonify({
                'summary_stats': df.describe().to_dict(),
                'shape': df.shape,
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file type, please upload a CSV'}), 400


@app.route('/business_leads')
def business_leads():
    leads = [
        {'company': 'Innovate Corp', 'contact': 'John Doe', 'email': 'john.doe@innovate.com'},
        {'company': 'Data Solutions', 'contact': 'Jane Smith', 'email': 'jane.smith@datasolutions.com'},
        {'company': 'Global Connect', 'contact': 'Peter Jones', 'email': 'peter.jones@globalconnect.com'},
    ]
    return jsonify(leads)


@app.route('/enhanced_analytics')
def enhanced_analytics():
    try:
        fields = [
            'name',
            'insights.fields(spend,impressions,clicks,ctr,cpc)',
        ]
        ad_account = AdAccount('me')
        adsets = ad_account.get_ad_sets(fields=fields)

        analytics_data = []
        for adset in adsets:
            insights = adset.get('insights', {}).get('data', [])
            if insights:
                analytics_data.append({
                    'name': adset['name'],
                    'id': adset['id'],
                    'insights': insights[0],
                })

        return jsonify(analytics_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8080)
