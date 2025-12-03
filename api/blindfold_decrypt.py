from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers for all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        """Handle preflight OPTIONS request"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
        
    def do_POST(self):
        try:
            from blindfold import ClusterKey, decrypt, SecretKey
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            shares = data.get('shares', [])
            threshold = data.get('threshold')
            key_type = data.get('key_type', '')
            key_hex = data.get('key_hex', '')
            key_seed = data.get('key_seed', '')
            cluster_size = data.get('cluster_size')
            
            if not shares or threshold is None or cluster_size is None:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "Missing required parameters: shares, threshold, cluster_size"
                }).encode())
                return
            
            # Create cluster
            cluster_obj = {'nodes': [{} for _ in range(cluster_size)]}

            print("Cluster object key_type:", key_type)
            
            # Generate key and decrypt
            if key_type == 'cluster':
                key = ClusterKey.generate(cluster_obj, {"store": True}, threshold)
            elif key_type == 'secret' and key_seed:
                key = SecretKey.generate(cluster_obj, {"store": True}, threshold, seed=key_seed)
            else:
                raise ValueError("Invalid key_type or missing required key parameters")

            decrypted = decrypt(key, shares)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "decrypted": decrypted,
                "runtime": "python"
            }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": str(e),
                "type": type(e).__name__
            }).encode())