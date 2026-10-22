from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import os
ROOT=Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        path=unquote(urlsplit(self.path).path)
        if '..' in Path(path).parts or any(p.startswith('.') for p in Path(path).parts):
            self.send_error(404);return
        if path.endswith('/') and path!='/':
            self.send_error(404);return
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        super().end_headers()
if __name__=='__main__':
    port=int(os.environ.get('PORT','8094'))
    print(f'Cowboy Balance: http://localhost:{port}/',flush=True)
    ThreadingHTTPServer(('0.0.0.0',port),Handler).serve_forever()
