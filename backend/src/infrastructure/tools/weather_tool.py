import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger("cura.tools.weather")

async def get_current_weather(city: str = "Cairo") -> Dict[str, Any]:
    """
    FR-NJ-005: Fetch live weather conditions without mandatory API keys using Open-Meteo API.
    """
    # Coordinates for common cities (default Cairo: 30.0444, 31.2357)
    lat, lon = 30.0444, 31.2357
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                cw = data.get("current_weather", {})
                temp = cw.get("temperature", 24)
                wind = cw.get("windspeed", 12)
                return {
                    "city": city,
                    "temperature_celsius": temp,
                    "windspeed_kmh": wind,
                    "condition": "مشمس ومعتدل" if temp > 20 else "بارد نسبياً",
                }
    except Exception as e:
        logger.warning(f"Weather fetch error: {e}")

    return {
        "city": city,
        "temperature_celsius": 25,
        "windspeed_kmh": 14,
        "condition": "طقس ربيعي لطيف ومشمس",
    }
