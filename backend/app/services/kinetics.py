import math
from typing import Dict, Any

class AlgaeKineticsEngine:
    def __init__(self, reactor_volume_liters: float = 20.0):
        self.volume_liters = reactor_volume_liters
        self.mu_max = 1.25  # Maximum specific growth rate (day^-1)
        self.i_opt = 2200.0 # Optimal LDR ADC equivalent
        self.t_opt = 25.0   # Optimal temperature in Celsius
        self.ph_opt = 7.8   # Optimal pH for Chlorella vulgaris
        self.co2_stoichiometry = 1.83  # 1.83 kg CO2 sequestered per 1 kg dry biomass produced

    def calculate_growth_factors(self, temp: float, ph: float, ldr_val: float, water_level: str) -> Dict[str, float]:
        # 1. Light factor (Steele's photoinhibition/saturation equation)
        i_ratio = max(0.01, ldr_val / self.i_opt)
        f_light = i_ratio * math.exp(1.0 - i_ratio)
        f_light = max(0.0, min(1.0, f_light))

        # 2. Temperature factor (Gaussian bell centered around 25°C, tolerance ~5°C)
        f_temp = math.exp(-0.5 * ((temp - self.t_opt) / 4.5) ** 2)
        f_temp = max(0.0, min(1.0, f_temp))

        # 3. pH factor (bell-shaped centered around 7.8, tolerance ~0.7)
        f_ph = math.exp(-0.5 * ((ph - self.ph_opt) / 0.7) ** 2)
        f_ph = max(0.0, min(1.0, f_ph))

        # 4. Water level penalty (if LOW, culture volume and nutrients are starved)
        f_water = 1.0 if water_level == "HIGH" else 0.35

        return {
            "f_light": round(f_light, 3),
            "f_temp": round(f_temp, 3),
            "f_ph": round(f_ph, 3),
            "f_water": round(f_water, 3)
        }

    def compute_metrics(self, temp: float, ph: float, ldr_val: float, water_level: str, biomass_density_g_l: float = 1.2) -> Dict[str, Any]:
        factors = self.calculate_growth_factors(temp, ph, ldr_val, water_level)
        
        # Combined specific growth rate mu (day^-1)
        mu = self.mu_max * factors["f_light"] * factors["f_temp"] * factors["f_ph"] * factors["f_water"]
        mu = max(0.0, round(mu, 4))

        # Health score (0 - 100)
        health_score = int(round((factors["f_light"] * 0.3 + factors["f_temp"] * 0.3 + factors["f_ph"] * 0.3 + factors["f_water"] * 0.1) * 100))
        health_score = max(5, min(100, health_score))

        # Total culture dry biomass (grams) = density (g/L) * volume (L)
        total_biomass_g = biomass_density_g_l * self.volume_liters

        # Biomass accumulation rate (grams per day)
        biomass_growth_g_day = round(mu * total_biomass_g, 2)

        # CO2 sequestration rate (grams CO2 per day) = 1.83 * biomass growth
        co2_capture_g_day = round(biomass_growth_g_day * self.co2_stoichiometry, 2)
        co2_capture_kg_day = round(co2_capture_g_day / 1000.0, 5)

        # Annual projected capture (kg/year)
        co2_projected_kg_year = round(co2_capture_kg_day * 365.0, 2)

        # Carbon sustainability equivalents
        # 1 mature urban tree sequesters ~21.77 kg CO2 / year (~0.0596 kg / day)
        tree_equivalents = round(co2_projected_kg_year / 21.77, 2)

        # 1 average passenger vehicle emits ~120g CO2 / km
        car_km_offset = round(co2_capture_g_day / 120.0, 1)

        # Carbon credit value ($35/tonne CO2)
        carbon_credit_usd_year = round((co2_projected_kg_year / 1000.0) * 35.0, 3)

        return {
            "healthScore": health_score,
            "specificGrowthRateMu": mu,
            "growthFactors": factors,
            "biomassDensityGPerL": biomass_density_g_l,
            "biomassGrowthGPerDay": biomass_growth_g_day,
            "co2CaptureGPerDay": co2_capture_g_day,
            "co2CaptureKgPerDay": co2_capture_kg_day,
            "co2ProjectedKgPerYear": co2_projected_kg_year,
            "treeEquivalents": tree_equivalents,
            "carKmOffset": car_km_offset,
            "carbonCreditUsdYear": carbon_credit_usd_year
        }

kinetics_engine = AlgaeKineticsEngine()
