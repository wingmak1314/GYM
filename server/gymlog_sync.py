#!/usr/bin/env python3
# GymLog 雲端備份伺服器 — 部署喺 Synology NAS
# 用法: python3 gymlog_sync.py (預設 port 8001,可用 PORT env 改)
# 端點:
#   GET  /data/<user>    攞返用戶嘅資料 (404 = 未有)
#   POST /data/<user>    儲存用戶嘅資料 (JSON body)
import json, os, re, sys, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DIR = os.environ.get('DATA_DIR', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gymlog_data'))
os.makedirs(DIR, exist_ok=True)
USER_RE = re.compile(r'^[A-Za-z0-9_\-\u4e00-\u9fff]{1,32}$')
MAX_BODY = 3 * 1024 * 1024  # 3MB


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype='application/json'):
        if isinstance(body, (dict, list)):
            body = json.dumps(body, ensure_ascii=False)
        data = body.encode('utf-8') if isinstance(body, str) else body
        self.send_response(code)
        self.send_header('Content-Type', ctype + '; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self._send(204, '')

    def _user(self):
        m = re.match(r'^/data/([^/]+?)/?$', self.path)
        if not m:
            return None
        user = m.group(1)
        if not USER_RE.match(user):
            return None
        return user

    def do_GET(self):
        if self.path == '/health':
            return self._send(200, {'ok': True, 'ts': time.time()})
        user = self._user()
        if not user:
            return self._send(404, {'error': 'not found'})
        fp = os.path.join(DIR, user + '.json')
        if not os.path.exists(fp):
            return self._send(404, {'error': 'no data for ' + user})
        with open(fp, 'r', encoding='utf-8') as f:
            return self._send(200, f.read())

    def do_POST(self):
        user = self._user()
        if not user:
            return self._send(404, {'error': 'not found'})
        try:
            ln = int(self.headers.get('Content-Length', 0))
        except Exception:
            ln = 0
        if ln <= 0 or ln > MAX_BODY:
            return self._send(413, {'error': 'body too large or empty'})
        body = self.rfile.read(ln).decode('utf-8', errors='replace')
        try:
            json.loads(body)
        except Exception:
            return self._send(400, {'error': 'invalid json'})
        # 原子寫入:先寫 tmp 再 rename
        fp = os.path.join(DIR, user + '.json')
        tmp = fp + '.tmp'
        with open(tmp, 'w', encoding='utf-8') as f:
            f.write(body)
        os.replace(tmp, fp)
        return self._send(200, {'ok': True, 'user': user, 'bytes': len(body), 'ts': time.time()})

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8001'))
    print('GymLog sync server listening on :%d (data dir: %s)' % (port, DIR), flush=True)
    ThreadingHTTPServer(('0.0.0.0', port), Handler).serve_forever()
