from abc import ABC, abstractmethod
from typing import Dict, Any, Callable, List

class IToolRouter(ABC):
    """
    Port: Tool Calling Registry & Executor (FR-NJ-005, FR-ALZ-009, etc.).
    """
    @abstractmethod
    def register_tool(self, name: str, description: str, parameters: Dict[str, Any], handler: Callable) -> None:
        """Register a callable tool with JSON schema."""
        pass

    @abstractmethod
    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        """Return all registered tool schemas in OpenAI / Qwen 2.5 format."""
        pass

    @abstractmethod
    async def execute_tool(self, name: str, arguments: Dict[str, Any]) -> str:
        """Execute tool and return JSON result string."""
        pass
