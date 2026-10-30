#!/usr/bin/env python3
"""Exercise the real stdio protocol, including private-field rejection."""
import json
import os
from pathlib import Path
import queue
import subprocess
import threading

root = Path(__file__).resolve().parent.parent
binary = os.environ.get("OPENCLAIM_TEST_BINARY", str(root / "target/debug/openclaim-mcp"))
p = subprocess.Popen([binary], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
lines = queue.Queue()
threading.Thread(target=lambda: [lines.put(line) for line in p.stdout], daemon=True).start()

def request(i, method, params):
    p.stdin.write(json.dumps({"jsonrpc":"2.0", "id":i, "method":method, "params":params})+"\n")
    p.stdin.flush()
    while True:
        response = json.loads(lines.get(timeout=10))
        if response.get("id") == i:
            return response

try:
    init = request(1,"initialize",{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"openclaim-smoke","version":"1"}})
    assert "result" in init, init
    p.stdin.write(json.dumps({"jsonrpc":"2.0","method":"notifications/initialized"})+"\n")
    p.stdin.flush()
    tools = request(2,"tools/list",{})["result"]["tools"]
    assert {t["name"] for t in tools} == {"openclaim_choices","openclaim_template","openclaim_guidance_index","openclaim_response_plan"}
    for tool in tools:
        assert tool["annotations"]["readOnlyHint"] is True
        assert tool["inputSchema"].get("additionalProperties") is False
    result = request(3,"tools/call",{"name":"openclaim_template","arguments":{"kind":"compensation"}})
    assert "[성명]" in json.dumps(result,ensure_ascii=False)
    # Entirely synthetic sentinel. It must not be reflected in an error/result.
    sentinel = "SYNTHETIC_PRIVATE_SENTINEL"
    rejected = request(4,"tools/call",{"name":"openclaim_template","arguments":{"kind":"compensation","name":sentinel}})
    assert "error" in rejected or rejected.get("result",{}).get("isError"), rejected
    assert sentinel not in json.dumps(rejected)
    rejected_empty = request(5,"tools/call",{"name":"openclaim_choices","arguments":{"name":sentinel}})
    assert "error" in rejected_empty or rejected_empty.get("result",{}).get("isError"), rejected_empty
    assert sentinel not in json.dumps(rejected_empty)
    index_reply=request(6,"tools/call",{"name":"openclaim_guidance_index","arguments":{}})
    index=json.loads(index_reply["result"]["content"][0]["text"])
    sequence=10
    for scenario in index["scenarios"]:
        for incident in ["generic"]+[i["id"] for i in index["incidents"]]:
            reply=request(sequence,"tools/call",{"name":"openclaim_response_plan","arguments":{"scenario":scenario["id"],"incident":incident}})
            assert "result" in reply and not reply["result"].get("isError"),reply
            plan=json.loads(reply["result"]["content"][0]["text"])
            assert plan["scenario"]["id"]==scenario["id"]
            assert plan["sources"] and plan["routes"]
            if incident!="generic": assert plan["incident_context"]["id"]==incident
            sequence+=1
    rejected_plan=request(sequence,"tools/call",{"name":"openclaim_response_plan","arguments":{"scenario":"notice_only","name":sentinel}})
    assert "error" in rejected_plan or rejected_plan.get("result",{}).get("isError"),rejected_plan
    assert sentinel not in json.dumps(rejected_plan)
    print("MCP: four public tools, all response/incident options and private-field rejection PASS")
finally:
    p.terminate()
    p.wait(timeout=5)
