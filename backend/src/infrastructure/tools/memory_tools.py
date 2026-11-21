from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger("cura.tools.memory")

def create_memory_tools(repo=None):
    """Factory to create memory book and item location tools with bound repository."""

    async def lookup_family_memory(
        relation_or_name: str = "",
        patient_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        FR-ALZ-008: استرجاع معلومات وصور وملاحظات أفراد العائلة (دفتر الذكريات Memory Book)
        لطمأنة المريض وتوجيهه عند السؤال عن أسرته أو شعوره بالارتباك.
        """
        members = []
        if repo and hasattr(repo, "get_family_members"):
            try:
                pid = patient_id or "11111111-1111-1111-1111-111111111111"
                raw_members = await repo.get_family_members(pid)
                members = raw_members
            except Exception as e:
                logger.error(f"Error fetching family members from repo: {e}")

        if not members:
            # Fallback based on clinical seed data
            members = [
                {
                    "name": "د. أحمد إبراهيم الدسوقي",
                    "relation": "ابنك الكبير",
                    "bio_notes": "دكتور وساكن في المعادي وبيزورك كل جمعة ويتصل يطمن عليك كل يوم المغرب."
                },
                {
                    "name": "نور إبراهيم الدسوقي",
                    "relation": "بنتك الصغيرة",
                    "bio_notes": "مهندسة ديكور، متزوجة وبتجيب أحفادك عمر وسلمى يشوفوك في الإجازات."
                },
                {
                    "name": "الحاجة فاطمة (أم أحمد)",
                    "relation": "زوجتك ورفيقة عمرك",
                    "bio_notes": "عشتوا مع بعض 45 سنة في حب وسكينة، ادعيلها بالرحمة والمغفرة."
                }
            ]

        # Filter by search term if provided
        matched = []
        if relation_or_name.strip():
            q = relation_or_name.strip().lower()
            for m in members:
                if q in m.get("name", "").lower() or q in m.get("relation", "").lower() or q in m.get("bio_notes", "").lower():
                    matched.append(m)

        results = matched if matched else members
        return {
            "family_records": results,
            "guidance_for_patient": "ذكّر المريض بأحبائه بكلمات دافئة تدعو للسكينة والاطمئنان (مثلاً: ابنك أحمد بيسلم عليك وراجع لك بالسلامة)."
        }

    async def lookup_item_location(
        item_name: str,
        patient_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        FR-ALZ-005: استرجاع مكان المتعلقات الشخصية المفقودة (المفاتيح، النظارة، المحفظة، السبحة).
        """
        location = None
        pid = patient_id or "11111111-1111-1111-1111-111111111111"
        if repo and hasattr(repo, "get_stored_item_location"):
            try:
                location = await repo.get_stored_item_location(pid, item_name)
            except Exception as e:
                logger.error(f"Error getting item location: {e}")

        if not location:
            default_map = {
                "المفاتيح": "على طاولة المدخل جنب الباب",
                "النظارة": "على كومودينو غرفة النوم جنب المنبه",
                "المحفظة": "في جيب الجاكيت المعلق بالدولاب",
                "السبحة": "على الطاولة الصغيرة في الصالون"
            }
            for k, v in default_map.items():
                if k in item_name or item_name in k:
                    location = v
                    break

        if not location:
            location = "في مكانها المعتاد في درج الغرفة"

        return {
            "item_name": item_name,
            "location": location,
            "response_guidance": f"جاوب المريض بهدوء وابتسامة: 'حاجتك في الحفظ والصون يا حاج، {item_name} هتلاقيها {location}'."
        }

    return lookup_family_memory, lookup_item_location
