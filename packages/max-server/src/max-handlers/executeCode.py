import json
import sys

def execute_code(data):
    response = None
    
    print(f"executeCode data: {data}")
    print(f"Python path: {sys.path}")
    print(f"Available modules: {list(sys.modules.keys())}")
    
    if data is not None and "code" in data:
        print("About to execute code:")
        print("/n")
        print(data["code"])
        print("/n")         
        global_vars = globals()            
        exec(data["code"], global_vars)            
        # Look for a result variable in the global context
        result = global_vars.get("result", None)
        print(f"executeCode result: {result}")
        print(f"executeCode result type: {type(result)}")         
        response = result
    
    return response 