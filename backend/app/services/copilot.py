import time
import os
import httpx
from typing import Dict, Any, List
from app.config import settings
from app.services.kinetics import kinetics_engine

SYSTEM_PROMPT = """You are the AI Chief Bioreactor Specialist for an IoT-based Carbon Capture and Recovery System using Microalgae (Chlorella vulgaris).
You have real-time access to the photobioreactor's sensor telemetry (DHT11 temp/humidity, LDR light level, analog pH probe, float water level, and relay pump).
Your duties:
1. Explain biological and chemical dynamics (e.g., why pH rises during photosynthesis as dissolved inorganic carbon / CO2 is assimilated).
2. Recommend optimal pump operating cycles to aerate and replenish dissolved CO2 without shearing delicate cells.
3. Quantify carbon capture performance and suggest environmental adjustments (temperature, photoperiod, nutrient buffers).
Be concise, scientific, actionable, and encouraging.
"""

class AICopilotService:
    async def chat(self, user_message: str, current_telemetry: Dict[str, Any], history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        temp = current_telemetry.get("temperature", 25.0)
        hum = current_telemetry.get("humidity", 60.0)
        ph = current_telemetry.get("phCalibrated", 7.8)
        light = current_telemetry.get("lightLevel", "BRIGHT")
        ldr = current_telemetry.get("ldrValue", 2200)
        water = current_telemetry.get("waterLevel", "HIGH")
        pump = current_telemetry.get("relayStatus", "OFF")

        metrics = kinetics_engine.compute_metrics(temp, ph, ldr, water)

        context_summary = (
            f"[CURRENT SYSTEM STATE]\n"
            f"- Temperature: {temp}°C (Optimal: 22-28°C)\n"
            f"- Humidity: {hum}%\n"
            f"- Light: {light} (ADC: {ldr})\n"
            f"- pH: {ph} (Optimal: 7.0-8.2)\n"
            f"- Water Level: {water}\n"
            f"- Aeration Pump: {pump}\n"
            f"- Culture Health Score: {metrics['healthScore']}/100\n"
            f"- Current CO2 Capture Rate: {metrics['co2CaptureGPerDay']} g/day ({metrics['co2ProjectedKgPerYear']} kg/year projected)\n"
            f"- Equivalent Trees Offset: {metrics['treeEquivalents']}\n"
        )

        # 1. Check if Anthropic API key is available
        if settings.ANTHROPIC_API_KEY:
            try:
                headers = {
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                }
                messages = [
                    {"role": "user", "content": f"{context_summary}\nUser Question: {user_message}"}
                ]
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        "https://api.anthropic.com/v1/messages",
                        headers=headers,
                        json={
                            "model": "claude-3-5-sonnet-20241022",
                            "max_tokens": 600,
                            "system": SYSTEM_PROMPT,
                            "messages": messages
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        reply = data["content"][0]["text"]
                        return {"reply": reply, "provider": "claude", "metrics": metrics}
            except Exception as e:
                pass

        # 2. Check if OpenAI API key is available
        if settings.OPENAI_API_KEY:
            try:
                headers = {
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                }
                messages = [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"{context_summary}\nUser Question: {user_message}"}
                ]
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers=headers,
                        json={
                            "model": "gpt-4o-mini",
                            "messages": messages,
                            "max_tokens": 600
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        reply = data["choices"][0]["message"]["content"]
                        return {"reply": reply, "provider": "openai", "metrics": metrics}
            except Exception as e:
                pass

        # 3. High-fidelity grounded biological rules engine (Fallback when external API key is not configured)
        reply = self._generate_heuristic_response(user_message, temp, ph, light, water, pump, metrics)
        return {"reply": reply, "provider": "local_bioknowledge_engine", "metrics": metrics}

    def _generate_heuristic_response(self, query: str, temp: float, ph: float, light: str, water: str, pump: str, metrics: Dict[str, Any]) -> str:
        q = query.lower()
        if "health" in q or "status" in q or "condition" in q:
            return (
                f"🌿 **Culture Health Analysis (Score: {metrics['healthScore']}/100)**\n\n"
                f"• **Temperature**: {temp}°C — "
                f"{'Within ideal photosynthetic range (22-28°C)' if 22 <= temp <= 28 else 'Sub-optimal, metabolic rate may slow'}.\n"
                f"• **pH Level**: {ph} — "
                f"{'Optimal for carbonic acid uptake' if 7.0 <= ph <= 8.2 else ('Alkaline drift detected! Turn on aeration pump to dissolve CO2.' if ph > 8.2 else 'Acidic condition, inspect culture buffer.')}\n"
                f"• **Light Level**: {light} — Photobioreactor is actively capturing energy.\n"
                f"• **Water Level**: {water} — {'Adequate nutrient fluid.' if water == 'HIGH' else '⚠️ Depleted! Refill fresh medium.'}\n\n"
                f"**Recommendation**: {'Maintain current autonomous schedule.' if metrics['healthScore'] >= 80 else 'Activate the aeration pump for 15 minutes to regulate pH.'}"
            )
        elif "ph" in q or "drop" in q or "rise" in q:
            return (
                f"🧪 **pH Dynamics Breakdown**\n\n"
                f"Current pH is **{ph}**.\n\n"
                f"• **Why does pH rise during the day?** During active photosynthesis, *Chlorella* cells extract dissolved bicarbonate ions ($\text{HCO}_3^-$) and free $\text{CO}_2$. This shifts the carbonate equilibrium and releases hydroxide ions ($\text{OH}^-$), raising pH.\n"
                f"• **Why does pH drop?** At night or when the aeration pump is **ON**, respiration occurs and atmospheric $\text{CO}_2$ dissolves to form carbonic acid ($\text{H}_2\text{CO}_3$), reducing pH.\n\n"
                f"**Action**: If pH exceeds 8.4, toggle the circulation pump to **ON** to restore dissolved inorganic carbon."
            )
        elif "co2" in q or "carbon" in q or "capture" in q or "sequester" in q:
            return (
                f"🌍 **Carbon Fixation Metrics**\n\n"
                f"• **Current Sequestration Rate**: **{metrics['co2CaptureGPerDay']} g $\\text{CO}_2$/day**\n"
                f"• **Annual Projection**: **{metrics['co2ProjectedKgPerYear']} kg $\\text{CO}_2$/year**\n"
                f"• **Environmental Equivalents**: Equal to **{metrics['treeEquivalents']} mature urban trees** or offsetting **{metrics['carKmOffset']} km of car travel** daily.\n"
                f"• **Estimated Carbon Credit Value**: **${metrics['carbonCreditUsdYear']} USD/year**.\n\n"
                f"Carbon fixation follows the stoichiometric constant of $1.83\\text{ kg } \\text{CO}_2$ captured per $1\\text{ kg}$ dry microalgae biomass synthesized."
            )
        elif "pump" in q or "relay" in q or "control" in q:
            return (
                f"⚙️ **Pump & Aeration Advisory**\n\n"
                f"The pump is currently **{pump}**.\n\n"
                f"• In **AUTO mode**, the controller activates the pump when pH exceeds 8.4 (to inject $\\text{CO}_2$) or when water level drops to LOW.\n"
                f"• In **AI mode**, cycles are pulsed to avoid hydrodynamic shear stress on microalgae cell walls while maximizing mass transfer rate ($k_L a$)."
            )
        else:
            return (
                f"👋 **Microalgae Photobioreactor AI Assistant**\n\n"
                f"The reactor is operating with a **Health Score of {metrics['healthScore']}/100** and fixing **{metrics['co2CaptureGPerDay']} g $\\text{CO}_2$/day**.\n\n"
                f"Key readings: Temp = {temp}°C, pH = {ph}, Light = {light}, Pump = {pump}.\n"
                f"You can ask me about:\n"
                f"1. *'Is my culture healthy?'*\n"
                f"2. *'Why did the pH change?'*\n"
                f"3. *'How much CO2 did we capture?'*\n"
                f"4. *'Should I turn on the pump now?'*"
            )

ai_copilot = AICopilotService()
