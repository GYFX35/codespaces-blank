# Global Activities Web Platform - Facebook API Integration

This project is a simple Flask web application that demonstrates how to integrate with the Facebook Marketing API, including the Audience Network.

## Getting Started

### 1. Prerequisites

- Python 3.6+
- A Facebook Developer account
- An App ID, App Secret, and Access Token from your Facebook App.

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository_url>
cd <repository_name>
pip install -r requirements.txt
```

### 3. Configuration

Open the `app.py` file and replace the placeholder values for `APP_ID`, `APP_SECRET`, and `ACCESS_TOKEN` with your actual credentials from the Facebook Developer portal.

```python
# --- Facebook SDK Initialization ---
# PLEASE REPLACE WITH YOUR OWN CREDENTIALS
APP_ID = 'YOUR_APP_ID'
APP_SECRET = 'YOUR_APP_SECRET'
ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'
```

### 4. Running the Application

To start the Flask development server, run the following command:

```bash
python app.py
```

The application will be available at `http://localhost:8080`.

### 5. API Endpoints

- **`GET /`**: The main landing page.
- **`GET /audience_network_adsets`**: Retrieves a list of ad sets from your ad account that are specifically targeted to run on the Facebook Audience Network. This demonstrates how to use the Marketing API to query for Audience Network-related assets.
