import json
import socket
import time
# import requests
import os
import threading
import sys
from pymxs import runtime as rt

# Import Qt modules - These are available in 3ds Max Python environment
from qtpy.QtCore import QObject, Signal, QThread, QMutex, QWaitCondition, QTimer
from qtpy.QtWidgets import QApplication

# Create a mechanism to execute code on the main thread
class MainThreadExecutor(QObject):
    """Helper class to execute code on the main thread using Qt signals and slots"""
    execute_signal = Signal(object)
    
    def __init__(self):
        super().__init__()
        # Move this object to the main thread
        self.moveToThread(QApplication.instance().thread())
        # Connect the signal to itself (slot is automatically created for the function)
        self.execute_signal.connect(self._execute)
    
    def _execute(self, func):
        """Execute the function on the main thread"""
        func()
        
    def execute(self, func):
        """Queue a function for execution on the main thread"""
        self.execute_signal.emit(func)

# Create a singleton instance
executor = MainThreadExecutor()

class MaxMCPServer:
    def __init__(self, host='localhost', port=7603):
        self.host = host
        self.port = port
        self.running = False
        self.socket = None
        self.client = None
        self.command_queue = []
        self.buffer = b''
        self.timer = None
    
    def start(self):
        if self.running:
            print("Server is already running, stopping first...")
            self.stop()
            
        self.running = True
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            self.socket.bind((self.host, self.port))
            self.socket.listen(1)
            self.socket.setblocking(False)
            
            # Start the timer using Qt
            self.timer = QTimer()
            self.timer.timeout.connect(self._process_server)
            self.timer.setInterval(100)  # 100ms interval
            self.timer.start()
            
            print(f"MaxMCP server started on {self.host}:{self.port}")
        except Exception as e:
            print(f"Failed to start server: {str(e)}")
            self.stop()
            
    def stop(self):
        self.running = False
        # Stop the timer
        if self.timer is not None:
            self.timer.stop()
            self.timer = None
            
        if self.socket:
            self.socket.close()
        if self.client:
            self.client.close()
        self.socket = None
        self.client = None
        print("MaxMCP server stopped")

    def _process_server(self):
        """Server processing function that runs on the main thread"""
        if not self.running:
            return
            
        try:
            # Accept new connections
            if not self.client and self.socket:
                try:
                    self.client, address = self.socket.accept()
                    self.client.setblocking(False)
                    print(f"Connected to client: {address}")
                except BlockingIOError:
                    pass  # No connection waiting
                except Exception as e:
                    print(f"Error accepting connection: {str(e)}")
                
            # Process existing connection
            if self.client:
                try:
                    # Try to receive data
                    try:
                        data = self.client.recv(8192)
                        if data:
                            self.buffer += data
                            # Try to process complete messages
                            try:
                                # Attempt to parse the buffer as JSON
                                command = json.loads(self.buffer.decode('utf-8'))
                                print(f"Received command: {command}")
                                # If successful, clear the buffer and process command
                                self.buffer = b''
                                response = self.execute_command(command)
                                response_json = json.dumps(response)
                                self.client.sendall(response_json.encode('utf-8'))
                            except json.JSONDecodeError:
                                # Incomplete data, keep in buffer
                                pass
                        else:
                            # Connection closed by client
                            print("Client disconnected")
                            self.client.close()
                            self.client = None
                            self.buffer = b''
                    except BlockingIOError:
                        pass  # No data available
                    except Exception as e:
                        print(f"Error receiving data: {str(e)}")
                        if self.client:
                            self.client.close()
                            self.client = None
                        self.buffer = b''
                        
                except Exception as e:
                    print(f"Error with client: {str(e)}")
                    if self.client:
                        self.client.close()
                        self.client = None
                    self.buffer = b''
                    
        except Exception as e:
            print(f"Server error: {str(e)}")

    def execute_command(self, command):
        """Execute a command received from the client"""
        try:
            if isinstance(command, dict):
                if command['lang'] == 'mxs':
                    return self.execute_mxs_code(command['code'])
                if command['lang'] == 'py':
                    return self.execute_py_code(command['code'])
                else:
                    return {"error": "Invalid command format"}
            else:
                return {"error": "Command must be a JSON object"}
        except Exception as e:
            return {"error": str(e)}

    def execute_mxs_code(self, code):
        """Execute arbitrary 3ds Max MaxScript code"""
        try:
            result = rt.execute(code)
            return {"executed": True, "result": result}
        except Exception as e:
            raise Exception(f"MaxScript code execution error: {str(e)}")

    def execute_py_code(self, code):
        """Execute arbitrary 3ds Max Python code"""
        try:
            print('--------------------------------')
            print(code)
            print('--------------------------------')
            # Create a local namespace for execution with access to MaxScript runtime
            namespace = {"rt": rt}
            exec(code, namespace)
            return {"executed": True}
        except Exception as e:
            raise Exception(f"Python code execution error: {str(e)}")

# Create an instance of the server when run directly
if __name__ == "__main__":
    # Check if we have an existing server instance in the global scope
    if 'server' in globals():
        print("Stopping existing server...")
        globals()['server'].stop()
        
    server = MaxMCPServer()
    server.start()    