from typing import Dict, Any, Callable, List
import json
import logging
from src.core.interfaces.tool_router import IToolRouter

logger = logging.getLogger("cura.tools")

class ToolRouterImpl(IToolRouter):
    def __init__(self):
        self._handlers: Dict[str, Callable] = {}
        self._schemas: List[Dict[str, Any]] = []

    def register_tool(self, name: str, description: str, parameters: Dict[str, Any], handler: Callable) -> None:
        self._handlers[name] = handler
        self._schemas.append({
            "type": "function",
            "function": {
                "name": name,
                "description": description,
                "parameters": parameters,
            }
        })
        logger.info(f"Registered tool: {name}")

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        return self._schemas

    async def execute_tool(self, name: str, arguments: Dict[str, Any]) -> str:
        if name not in self._handlers:
            return json.dumps({"error": f"Tool '{name}' not found."})
        try:
            handler = self._handlers[name]
            result = await handler(**arguments)
            return json.dumps({"status": "success", "data": result}, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error executing tool '{name}': {e}", exc_info=True)
            return json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False)
