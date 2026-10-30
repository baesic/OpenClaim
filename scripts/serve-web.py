#!/usr/bin/env python3
"""Loopback-only static preview, with no request logging or data endpoints."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--port", type=int, default=4173)
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent / "dist"
if not (root / "index.html").is_file():
    raise SystemExit("Run bash scripts/build-web.sh first")

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(root), **kw)

    def log_message(self, *_):
        pass

    def list_directory(self, path):
        self.send_error(403)

    def end_headers(self):
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

print(f"OpenClaim: http://127.0.0.1:{args.port} (Ctrl+C to stop)", flush=True)
ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()
