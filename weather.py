from typing import Any
import json
import httpx
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("weather")

# Constants
NWS_API_BASE = "https://api.weather.gov"
USER_AGENT = "weather-app/1.0"

async def make_nws_request(url: str) -> dict[str, Any] | None:
    """Make a request to the NWS API with proper error handling."""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/geo+json"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception:
            return None

@mcp.tool()
async def get_alerts(state: str) -> str:
    """Get weather alerts for a US state (returns raw JSON string).

    Args:
        state: Two-letter US state code (e.g. CA, NY)
    """
    url = f"{NWS_API_BASE}/alerts/active/area/{state}"
    data = await make_nws_request(url)

    if not data:
        return json.dumps({"error": "Unable to fetch alerts or no alerts found."}, indent=2)

    return json.dumps(data, indent=2)

@mcp.tool()
async def get_forecast(latitude: float, longitude: float) -> str:
    """Get weather forecast for a location (returns raw JSON string).

    Args:
        latitude: Latitude of the location
        longitude: Longitude of the location
    """
    # First get the forecast grid endpoint
    points_url = f"{NWS_API_BASE}/points/{latitude},{longitude}"
    points_data = await make_nws_request(points_url)

    if not points_data or "properties" not in points_data:
        return json.dumps({"error": "Unable to fetch forecast grid info."}, indent=2)

    # Get the forecast URL from the points response
    forecast_url = points_data["properties"].get("forecast")
    if not forecast_url:
        return json.dumps({"error": "Forecast URL not found in grid response."}, indent=2)

    forecast_data = await make_nws_request(forecast_url)

    if not forecast_data:
        return json.dumps({"error": "Unable to fetch detailed forecast."}, indent=2)

    return json.dumps(forecast_data, indent=2)

if __name__ == "__main__":
    # Initialize and run the MCP server via stdio
    mcp.run(transport='stdio')

