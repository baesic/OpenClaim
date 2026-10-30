#!/usr/bin/env python3
"""Verify actual authenticated loopback HTTP transport with synthetic input."""
import http.client
import json
import os
from pathlib import Path
import secrets
import subprocess
import time

root = Path(__file__).resolve().parent.parent
binary = os.environ.get("OPENCLAIM_TEST_BINARY", str(root / "target/debug/openclaim-mcp"))
token = secrets.token_urlsafe(32)
p = subprocess.Popen([binary,"--http"],env={**os.environ,"OPENCLAIM_MCP_TOKEN":token},stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True)

def call(payload, auth=True, origin=None, session=None):
    headers={"Content-Type":"application/json","Accept":"application/json, text/event-stream","MCP-Protocol-Version":"2025-11-25"}
    if auth: headers["Authorization"]="Bearer "+token
    if origin: headers["Origin"]=origin
    if session: headers["Mcp-Session-Id"]=session
    c=http.client.HTTPConnection("127.0.0.1",31415,timeout=5)
    c.request("POST","/mcp",json.dumps(payload),headers)
    res=c.getresponse()
    code=res.status
    sid=res.getheader("Mcp-Session-Id")
    if code == 200 and "text/event-stream" in (res.getheader("Content-Type") or ""):
        while True:
            raw=res.readline()
            if not raw: raise AssertionError("SSE ended before response")
            line=raw.decode().strip()
            if line.startswith("data:") and line[5:].strip():
                data=json.loads(line[5:].strip())
                if data.get("id") == payload.get("id"): break
    elif code == 200:
        data=json.loads(res.read())
    else: data=None
    c.close()
    return code,sid,data

try:
    # Process readiness without sending user information.
    deadline=time.monotonic()+10
    while True:
        try:
            c=http.client.HTTPConnection("127.0.0.1",31415,timeout=1)
            c.request("GET","/mcp"); res=c.getresponse(); res.read(); c.close(); break
        except OSError:
            if p.poll() is not None or time.monotonic()>deadline: raise
            time.sleep(.05)
    init={"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"openclaim-http-smoke","version":"1"}}}
    assert call(init,auth=False)[0]==401
    assert call(init,origin="https://example.invalid")[0]==403
    status,sid,data=call(init)
    assert status==200 and "result" in data,(status,data)
    assert call({"jsonrpc":"2.0","method":"notifications/initialized"},session=sid)[0]==202
    status,_,tools=call({"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}},session=sid)
    assert status==200 and len(tools["result"]["tools"])==4,(status,tools)
    status,_,reply=call({"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"openclaim_response_plan","arguments":{"scenario":"notice_only","incident":"skplanet_gifticon_2026_10"}}},session=sid)
    assert status==200 and not reply["result"].get("isError"),(status,reply)
    plan=json.loads(reply["result"]["content"][0]["text"])
    assert plan["incident_context"]["id"]=="skplanet_gifticon_2026_10"
    print("HTTP authentication, origin rejection, discovery and source-backed response plan PASS")
finally:
    p.terminate(); p.wait(timeout=5)
