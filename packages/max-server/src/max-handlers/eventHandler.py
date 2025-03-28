import json
import sys
import traceback
from urllib.request import Request, urlopen
from urllib.error import URLError

def event_handler(script_path, request_id, url):
    """
    Python event handler for executing functions with input and output in 3ds Max.
    
    Args:
        script_path (str): Path to the Python script to execute
        request_id (str): Unique identifier for this request
        url (str): Base URL for the HTTP server
    """
    try:
        # Import the execute_code function from the script
        sys.path.append(script_path.rsplit('/', 1)[0])
        module_name = script_path.rsplit('/', 1)[1].replace('.py', '')
        exec(f"import {module_name}")
        execute_code = eval(f"{module_name}.execute_code")
        
        # Get the payload from the server
        input_url = f"{url}/api/request/getRequestInput/{request_id}"
        output_url = f"{url}/api/request/setRequestOutput/{request_id}"
        
        # Make HTTP request to get input
        req = Request(input_url)
        req.add_header('Content-Type', 'application/json')
        
        with urlopen(req) as response:
            payload_response = response.read().decode('utf-8')
            payload = json.loads(payload_response)
        
        # Extract input data
        input_data = None
        if 'data' in payload and 'input' in payload['data']:
            input_data = payload['data']['input']
        
        print(f"input: {input_data}")
        
        # Execute the function with the input data
        data = execute_code(input_data)
        print(f"data: {data}")
        
        # Send the result back to the server
        response_data = {
            "success": True,
            "data": data
        }
        
        # Convert to JSON and send
        response_json = json.dumps(response_data)
        req = Request(output_url, data=response_json.encode('utf-8'))
        req.add_header('Content-Type', 'application/json')
        
        with urlopen(req) as response:
            response.read()
        
        return True
    
    except Exception as e:
        print(f"Error in Python event handler: {str(e)}")
        traceback.print_exc()
        
        # Send error back to server
        try:
            response_data = {
                "success": False,
                "error": str(e)
            }
            
            response_json = json.dumps(response_data)
            req = Request(output_url, data=response_json.encode('utf-8'))
            req.add_header('Content-Type', 'application/json')
            
            with urlopen(req) as response:
                response.read()
        except:
            print("Failed to send error response")
        
        return False 