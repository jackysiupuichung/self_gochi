# full_mcp_server.py

from typing import Any, Dict, List
import uvicorn
from mcp.server.fastmcp import FastMCP
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import HTMLResponse
from starlette.routing import Route, Mount
from mcp.server.sse import SseServerTransport

mcp = FastMCP("holistic-wellness")

MCP_CATALOG: Dict[str, Dict[str, Any]] = {
    '00145': {'intervention': 'Maintain current routine; consider peer-led challenges.', 'frequency': 'daily'},
    '00124': {'intervention': 'Schedule a 10-min peer check-in; log 3 positive affirmations.', 'frequency': 'every 4 hours'},
    '00093': {'intervention': 'Guided breathing; 30-min light activity or rest.', 'frequency': 'every 2 hours'},
    '00069': {'intervention': 'Initiate coping skills log; 5-min mindfulness session.', 'frequency': 'every 3 hours'}
}

def compute_wellness(data: Dict[str, float]) -> int:
    raw = (
        data.get('sleepQuality', 0) * 0.3 +
        data.get('dietScore',    0) * 0.2 +
        data.get('activityScore',0) * 0.3 +
        data.get('calendarBalance', 0) * 0.2
    )
    return round(raw * 100)

def map_to_nanda(score: int) -> str:
    if score > 75:
        return '00145'
    if score >= 40:
        return '00124'
    return '00093' if score < 25 else '00069'

@mcp.tool()
async def process_datastream(params: Dict[str, Any]) -> Dict[str, Any]:
    sleep_q     = float(params.get('sleepQuality', 0))
    diet_s      = float(params.get('dietScore', 0))
    activity_s  = float(params.get('activityScore', 0))
    calendar_b  = float(params.get('calendarBalance', 0))
    personality = str(params.get('personality', "I’m a friendly helper"))

    score     = compute_wellness({
        'sleepQuality': sleep_q,
        'dietScore':    diet_s,
        'activityScore':activity_s,
        'calendarBalance': calendar_b
    })
    nanda     = map_to_nanda(score)
    mcp_entry = MCP_CATALOG[nanda]

    if score > 75:
        state = 'energetic'
    elif score >= 40:
        state = 'neutral'
    else:
        state = 'fatigued'

    suggestion = f"{personality}: Your Twin suggests — {mcp_entry['intervention']}"

    return {
        'wellnessScore': score,
        'nandaCode':     nanda,
        'intervention':  mcp_entry['intervention'],
        'frequency':     mcp_entry['frequency'],
        'avatarState':   state,
        'suggestion':    suggestion
    }

@mcp.tool()
async def suggest_meal_plan(params: Dict[str, Any]) -> Dict[str, Any]:
    diet_score = float(params.get('dietScore', 0.5))
    if diet_score < 0.4:
        plan = "Day 1: Smoothie bowl\nDay 2: Veggie stir-fry\nDay 3: Lentil soup"
    elif diet_score < 0.7:
        plan = "Day 1: Grilled chicken salad\nDay 2: Quinoa bowl\nDay 3: Salmon & greens"
    else:
        plan = "Day 1: Balanced bento box\nDay 2: Turkey wrap\nDay 3: Buddha bowl"
    return {'mealPlan': plan}

@mcp.tool()
async def start_breathing_session(params: Dict[str, Any]) -> Dict[str, Any]:
    stress = int(params.get('stressLevel', 3))
    if stress >= 4:
        session = "Guided 5-min deep breathing with a soothing bell."
    else:
        session = "Quick 2-min box breathing (4s inhale, 4s hold, 4s exhale)."
    return {'breathingSession': session}

@mcp.tool()
async def list_tools(params: Any = None) -> List[Dict[str, Any]]:
    return mcp._mcp_server.list_tools()

@mcp.tool()
async def chat_agents(params: Dict[str, Any]) -> Dict[str, Any]:
    message      = str(params.get('message', ''))
    include_self = bool(params.get('includeSelfCare', False))
    result: Dict[str, Any] = {}
    peer_responses: List[Dict[str, Any]] = []

    if include_self:
        self_care = await mcp._mcp_server.invoke_tool(
            'holistic-wellness.process_datastream',
            {
                "sleepQuality":    0.7,
                "dietScore":       0.6,
                "activityScore":   0.8,
                "calendarBalance": 0.5,
                "personality":     "Thoughtful coach"
            }
        )
        result['selfCare'] = self_care

    tools = await mcp._mcp_server.list_tools()
    for t in tools:
        agent = t['agentName']
        tool  = t['toolName']
        if agent == 'holistic-wellness' or t.get('inputs') != {'message': 'string'}:
            continue
        try:
            resp = await mcp._mcp_server.invoke_tool(f"{agent}.{tool}", {"message": message})
            peer_responses.append({'agent': agent, 'tool': tool, 'response': resp})
        except Exception:
            peer_responses.append({'agent': agent, 'tool': tool, 'response': None})

    result['peerResponses'] = peer_responses
    return result

async def homepage(request: Request) -> HTMLResponse:
    return HTMLResponse("<h1>Holistic-Wellness MCP Server</h1>")

def create_app() -> Starlette:
    sse = SseServerTransport("/messages/")
    async def sse_endpoint(request: Request):
        async with sse.connect_sse(request.scope, request.receive, request._send) as (r, w):
            await mcp._mcp_server.run(r, w, mcp._mcp_server.create_initialization_options())
        return HTMLResponse(status_code=204)

    return Starlette(debug=True, routes=[
        Route("/", endpoint=homepage),
        Route("/sse", endpoint=sse_endpoint),
        Mount("/messages/", app=sse.handle_post_message),
    ])

if __name__ == "__main__":
    uvicorn.run(create_app(), host="0.0.0.0", port=8080)
