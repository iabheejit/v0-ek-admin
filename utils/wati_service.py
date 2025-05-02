import requests
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class WatiService:
    """Service for interacting with the WATI API"""
    
    def __init__(self):
        self.base_url = settings.WATI_API_URL
        self.headers = {
            'Authorization': settings.WATI_API_TOKEN,
            'Content-Type': 'application/json'
        }
    
    def _make_request(self, endpoint, method='GET', data=None):
        """Make a request to the WATI API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=self.headers)
            elif method == 'POST':
                response = requests.post(url, headers=self.headers, json=data)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"WATI API request failed: {e}")
            raise
    
    def send_text(self, number, message):
        """Send a text message to a user"""
        endpoint = f"/api/v1/sendSessionMessage/{number}"
        data = {
            "messageText": message
        }
        return self._make_request(endpoint, method='POST', data=data)
    
    def send_interactive_buttons_message(self, number, header_text, body_text, button_text):
        """Send an interactive button message"""
        endpoint = f"/api/v1/sendInteractiveButtonsMessage?whatsappNumber={number}"
        data = {
            "header": {
                "type": "Text",
                "text": header_text
            },
            "body": body_text,
            "buttons": [
                {
                    "text": button_text
                }
            ]
        }
        return self._make_request(endpoint, method='POST', data=data)
    
    def send_list_interactive(self, number, options, body, btn_text):
        """Send a list interactive message"""
        endpoint = f"/api/v1/sendInteractiveListMessage?whatsappNumber={number}"
        data = {
            "header": "",
            "body": body,
            "footer": "",
            "buttonText": btn_text,
            "sections": [
                {
                    "title": "Options",
                    "rows": options
                }
            ]
        }
        return self._make_request(endpoint, method='POST', data=data)
    
    def send_dynamic_interactive_msg(self, number, buttons, body):
        """Send dynamic interactive message with multiple buttons"""
        endpoint = f"/api/v1/sendInteractiveButtonsMessage?whatsappNumber={number}"
        data = {
            "body": body,
            "buttons": buttons
        }
        return self._make_request(endpoint, method='POST', data=data)
    
    def get_messages(self, number, page_size=10, page_number=1):
        """Get message history for a user"""
        endpoint = f"/api/v1/getMessages/{number}?pageSize={page_size}&pageNumber={page_number}"
        return self._make_request(endpoint)
    
    def send_template_message(self, number, template_name, parameters):
        """Send a template message"""
        endpoint = f"/api/v1/sendTemplateMessage/{number}"
        data = {
            "template_name": template_name,
            "broadcast_name": template_name,
            "parameters": json.dumps(parameters)
        }
        return self._make_request(endpoint, method='POST', data=data)

# Create a singleton instance
wati_service = WatiService()
