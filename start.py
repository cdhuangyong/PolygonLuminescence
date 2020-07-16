import http.server
import socketserver

PORT = 8002
Handler = http.server.SimpleHTTPRequestHandler

class CORSRequestHandler (Handler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        Handler.end_headers(self)

httpd = socketserver.TCPServer(("", PORT), CORSRequestHandler)

print("serving at port", PORT)
httpd.serve_forever()
