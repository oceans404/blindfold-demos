from http.server import HTTPServer, BaseHTTPRequestHandler
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from blindfold_encrypt import handler as EncryptHandler
from blindfold_decrypt import handler as DecryptHandler

class RouterHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Select the appropriate handler based on path
        if self.path == '/api/blindfold_encrypt' or self.path == '/':
            handler_class = EncryptHandler
        elif self.path == '/api/blindfold_decrypt':
            handler_class = DecryptHandler
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"error": "Not found"}')
            return
        
        # Delegate to the selected handler
        handler_class.do_POST(self)
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"message": "Blindfold API", "endpoints": ["/api/blindfold_encrypt", "/api/blindfold_decrypt"]}')

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, RouterHandler)
    print(f'Starting development server on http://localhost:{port}')
    print(f'\nAvailable endpoints:')
    print(f'  POST http://localhost:{port}/api/blindfold_encrypt')
    print(f'  POST http://localhost:{port}/api/blindfold_decrypt')
    print(f'  GET  http://localhost:{port}/')
    print(f'\nPress Ctrl+C to stop')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down server...')
        httpd.shutdown()
        sys.exit(0)

if __name__ == '__main__':
    run_server()