from src.core.entities.cognitive_mode import CognitiveMode, MODE_PROFILES
from src.infrastructure.llm.prompt_templates import get_system_prompt

def test_cognitive_modes_configured():
    assert CognitiveMode.NORMAL in MODE_PROFILES
    assert CognitiveMode.ALZHEIMER in MODE_PROFILES
    assert CognitiveMode.ADHD in MODE_PROFILES

    alz_cfg = MODE_PROFILES[CognitiveMode.ALZHEIMER]
    assert alz_cfg.high_contrast_ui is True
    assert alz_cfg.repetition_patience is True

    adhd_cfg = MODE_PROFILES[CognitiveMode.ADHD]
    assert adhd_cfg.enable_pause_confirm is True

def test_system_prompts_arabic():
    normal_p = get_system_prompt(CognitiveMode.NORMAL)
    alz_p = get_system_prompt(CognitiveMode.ALZHEIMER)
    adhd_p = get_system_prompt(CognitiveMode.ADHD)

    assert "CURA" in normal_p
    assert "الزهايمر" in alz_p
    assert "ADHD" in adhd_p
