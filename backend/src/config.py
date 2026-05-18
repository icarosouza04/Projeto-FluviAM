"""
FluviAM — config.py  (v4.2)
============================

SACE/SGB IDs mapeados:
  amazonas_8   → Manaus
  amazonas_12  → Manacapuru
  amazonas_26  → Itacoatiara
  amazonas_15  → Tabatinga
  amazonas_34  → Óbidos
  amazonas_19  → Beruri

Estações sem SACE → ANA (se credenciais configuradas) → TelWS1 → Open-Meteo

Credenciais ANA via variáveis de ambiente:
  ANA_CPF_CNPJ=seu_cpf_ou_cnpj
  ANA_SENHA=sua_senha
"""

from pathlib import Path
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── GERAL ─────────────────────────────────────────────────────────────────────
TIMEOUT      = int(os.getenv("TIMEOUT", "20"))
DIAS_ANALISE = int(os.getenv("DIAS_ANALISE", "60"))
VAZAO_MINIMA = float(os.getenv("VAZAO_MINIMA", "0"))

# ── SACE/SGB ──────────────────────────────────────────────────────────────────
SACE_BASE_URL = "https://www.sgb.gov.br/sace/sace_nivel/api/dados"

# ── ANA HidroWebService ───────────────────────────────────────────────────────
ANA_BASE_URL = os.getenv("ANA_BASE_URL", "https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas")
ANA_CPF_CNPJ = os.getenv("ANA_CPF_CNPJ", "")
ANA_SENHA    = os.getenv("ANA_SENHA",    "")
ANA_LOGIN    = ANA_CPF_CNPJ
ANA_PASSWORD = ANA_SENHA

# ── HidroWeb REST ─────────────────────────────────────────────────────────────
HIDROWEB_TOKEN = os.getenv("HIDROWEB_TOKEN", "")

# ── Open-Meteo ────────────────────────────────────────────────────────────────
FLOOD_URL = os.getenv("FLOOD_URL", "https://flood-api.open-meteo.com/v1/flood")

# ── ESTAÇÕES ──────────────────────────────────────────────────────────────────
ESTACOES = {

    # ── COM SACE ─────────────────────────────────────────────────────────────

    "Manaus": {
        "codigo": "14990000", "codigo_ana": "14990000",
        "lat": -3.10, "lon": -60.02, "rio": "Rio Negro",
        "cota_atual_ref": 26.56, "cota_max_hist": 29.97, "cota_min_hist": 12.11,
        "cota_media": 22.50, "cota_alerta": 29.00, "cota_atencao": 20.30,
        "cota_emergencia": 34.80, "cota_maxima": 29.97,
        "sace_bacia": "amazonas", "sace_pm": 8,
    },

    "Manacapuru": {
        "codigo": "13850000", "codigo_ana": "13850000",
        "lat": -3.31, "lon": -60.61, "rio": "Rio Solimões",
        "cota_atual_ref": 18.00, "cota_max_hist": 23.50, "cota_min_hist": 3.20,
        "cota_media": 15.00, "cota_alerta": 21.00, "cota_atencao": 14.70,
        "cota_emergencia": 25.20, "cota_maxima": 23.50,
        "sace_bacia": "amazonas", "sace_pm": 12,
    },

    "Itacoatiara": {
        "codigo": "14280000", "codigo_ana": "14280000",
        "lat": -3.14, "lon": -58.44, "rio": "Rio Amazonas",
        "cota_atual_ref": 13.00, "cota_max_hist": 16.83, "cota_min_hist": 1.20,
        "cota_media": 9.50, "cota_alerta": 14.00, "cota_atencao": 9.80,
        "cota_emergencia": 16.80, "cota_maxima": 16.83,
        "sace_bacia": "amazonas", "sace_pm": 26,
    },

    "Tabatinga": {
        "codigo": "13020000", "codigo_ana": "13020000",
        "lat": -4.25, "lon": -69.94, "rio": "Rio Solimões",
        "cota_atual_ref": 11.10, "cota_max_hist": 13.50, "cota_min_hist": -2.34,
        "cota_media": 7.50, "cota_alerta": 11.00, "cota_atencao": 7.70,
        "cota_emergencia": 13.20, "cota_maxima": 13.50,
        "sace_bacia": "amazonas", "sace_pm": 15,
    },

    "Óbidos": {
        "codigo": "17050001", "codigo_ana": "17050001",
        "lat": -1.92, "lon": -55.52, "rio": "Rio Amazonas",
        "cota_atual_ref": 8.50, "cota_max_hist": 11.20, "cota_min_hist": -2.53,
        "cota_media": 5.80, "cota_alerta": 9.00, "cota_atencao": 6.30,
        "cota_emergencia": 10.80, "cota_maxima": 11.20,
        "sace_bacia": "amazonas", "sace_pm": 34,
    },

    "Beruri": {
        "codigo": "13762000", "codigo_ana": "13762000",
        "lat": -3.90, "lon": -61.28, "rio": "Rio Purus",
        "cota_atual_ref": 10.00, "cota_max_hist": 15.80, "cota_min_hist": 1.50,
        "cota_media": 8.50, "cota_alerta": 13.50, "cota_atencao": 9.20,
        "cota_emergencia": 15.50, "cota_maxima": 15.80,
        "sace_bacia": "amazonas", "sace_pm": 19,
    },

    # ── SEM SACE — ANA → TelWS1 → Open-Meteo ─────────────────────────────────

    "Parintins": {
        "codigo": "14540000", "codigo_ana": "14540000",
        "lat": -2.63, "lon": -56.74, "rio": "Rio Amazonas",
        "cota_atual_ref": 10.50, "cota_max_hist": 13.80, "cota_min_hist": -1.76,
        "cota_media": 7.20, "cota_alerta": 11.50, "cota_atencao": 8.05,
        "cota_emergencia": 13.80, "cota_maxima": 13.80,
        "sace_bacia": None, "sace_pm": None,
    },

    "Tefé": {
        "codigo": "13760000", "codigo_ana": "13760000",
        "lat": -3.37, "lon": -64.72, "rio": "Rio Solimões",
        "cota_atual_ref": 12.00, "cota_max_hist": 17.50, "cota_min_hist": 1.46,
        "cota_media": 10.20, "cota_alerta": 14.50, "cota_atencao": 10.15,
        "cota_emergencia": 17.40, "cota_maxima": 17.50,
        "sace_bacia": None, "sace_pm": None,
    },

    "Santarém": {
        "codigo": "16015000", "codigo_ana": "16015000",
        "lat": -2.44, "lon": -54.70, "rio": "Rio Amazonas",
        "cota_atual_ref": 7.80, "cota_max_hist": 10.50, "cota_min_hist": -1.80,
        "cota_media": 5.50, "cota_alerta": 8.50, "cota_atencao": 5.95,
        "cota_emergencia": 10.20, "cota_maxima": 10.50,
        "sace_bacia": None, "sace_pm": None,
    },

    "Coari": {
        "codigo": "13650001", "codigo_ana": "13650001",
        "lat": -4.09, "lon": -63.14, "rio": "Rio Solimões",
        "cota_atual_ref": 11.00, "cota_max_hist": 16.20, "cota_min_hist": 1.20,
        "cota_media": 9.50, "cota_alerta": 14.00, "cota_atencao": 9.80,
        "cota_emergencia": 16.00, "cota_maxima": 16.20,
        "sace_bacia": None, "sace_pm": None,
    },

    "Barcelos": {
        "codigo": "14870000", "codigo_ana": "14870000",
        "lat": -0.98, "lon": -62.93, "rio": "Rio Negro",
        "cota_atual_ref": 10.50, "cota_max_hist": 15.50, "cota_min_hist": 1.80,
        "cota_media": 9.00, "cota_alerta": 13.50, "cota_atencao": 9.50,
        "cota_emergencia": 15.20, "cota_maxima": 15.50,
        "sace_bacia": None, "sace_pm": None,
    },

    "São Gabriel da Cachoeira": {
        "codigo": "14960000", "codigo_ana": "14960000",
        "lat": 0.13, "lon": -67.09, "rio": "Rio Negro",
        "cota_atual_ref": 8.00, "cota_max_hist": 12.50, "cota_min_hist": 1.00,
        "cota_media": 6.50, "cota_alerta": 11.00, "cota_atencao": 7.00,
        "cota_emergencia": 12.20, "cota_maxima": 12.50,
        "sace_bacia": None, "sace_pm": None,
    },

    "Careiro da Várzea": {
        "codigo": "14100000", "codigo_ana": "14100000",
        "lat": -3.74, "lon": -60.38, "rio": "Rio Amazonas",
        "cota_atual_ref": 24.00, "cota_max_hist": 29.50, "cota_min_hist": 13.00,
        "cota_media": 22.00, "cota_alerta": 28.50, "cota_atencao": 20.00,
        "cota_emergencia": 29.00, "cota_maxima": 29.50,
        "sace_bacia": None, "sace_pm": None,
    },

    "Iranduba": {
        "codigo": "13900000", "codigo_ana": "13900000",
        "lat": -3.28, "lon": -60.19, "rio": "Rio Solimões",
        "cota_atual_ref": 17.50, "cota_max_hist": 22.80, "cota_min_hist": 3.50,
        "cota_media": 14.50, "cota_alerta": 20.50, "cota_atencao": 14.00,
        "cota_emergencia": 22.50, "cota_maxima": 22.80,
        "sace_bacia": None, "sace_pm": None,
    },

    "Lábrea": {
        "codigo": "13340000", "codigo_ana": "13340000",
        "lat": -7.26, "lon": -64.80, "rio": "Rio Purus",
        "cota_atual_ref": 9.00, "cota_max_hist": 14.50, "cota_min_hist": 0.80,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.50,
        "cota_emergencia": 14.20, "cota_maxima": 14.50,
        "sace_bacia": None, "sace_pm": None,
    },

    "Humaitá": {
        "codigo": "13770000", "codigo_ana": "13770000",
        "lat": -7.51, "lon": -63.02, "rio": "Rio Madeira",
        "cota_atual_ref": 8.50, "cota_max_hist": 13.50, "cota_min_hist": 0.50,
        "cota_media": 7.00, "cota_alerta": 11.50, "cota_atencao": 7.80,
        "cota_emergencia": 13.20, "cota_maxima": 13.50,
        "sace_bacia": None, "sace_pm": None,
    },

    "Manicoré": {
        "codigo": "14180000", "codigo_ana": "14180000",
        "lat": -5.81, "lon": -61.30, "rio": "Rio Madeira",
        "cota_atual_ref": 9.50, "cota_max_hist": 15.00, "cota_min_hist": 0.60,
        "cota_media": 8.00, "cota_alerta": 13.00, "cota_atencao": 8.80,
        "cota_emergencia": 14.70, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },

    "Borba": {
        "codigo": "14390000", "codigo_ana": "14390000",
        "lat": -4.39, "lon": -59.60, "rio": "Rio Madeira",
        "cota_atual_ref": 10.00, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 14.00, "cota_atencao": 9.50,
        "cota_emergencia": 15.70, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },

    "Novo Airão": {
        "codigo": "14940000", "codigo_ana": "14940000",
        "lat": -2.63, "lon": -60.94, "rio": "Rio Negro",
        "cota_atual_ref": 17.00, "cota_max_hist": 22.00, "cota_min_hist": 3.50,
        "cota_media": 13.50, "cota_alerta": 20.00, "cota_atencao": 13.00,
        "cota_emergencia": 21.80, "cota_maxima": 22.00,
        "sace_bacia": None, "sace_pm": None,
    },

    "Maués": {
        "codigo": "14440000", "codigo_ana": "14440000",
        "lat": -3.38, "lon": -57.72, "rio": "Rio Maués-Açu",
        "cota_atual_ref": 5.50, "cota_max_hist": 10.80, "cota_min_hist": -0.50,
        "cota_media": 5.00, "cota_alerta": 9.00, "cota_atencao": 5.50,
        "cota_emergencia": 10.50, "cota_maxima": 10.80,
        "sace_bacia": None, "sace_pm": None,
    },
}


# ── Municípios oficiais do Amazonas ───────────────────────────────────────────
# A cobertura do pacote foi ampliada para os 62 municípios do AM.
# Municípios ainda sem código ANA específico usam Open-Meteo como estimativa
# até que o código telemétrico oficial seja vinculado.
MUNICIPIOS_AMAZONAS = {
    'Alvarães': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.22083, "lon": -64.80417, "rio": 'Rede hidrográfica local',
        "cota_atual_ref": 7.00, "cota_max_hist": 13.00, "cota_min_hist": 0.50,
        "cota_media": 6.50, "cota_alerta": 10.50, "cota_atencao": 7.35,
        "cota_emergencia": 12.50, "cota_maxima": 13.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Amaturá': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.37455, "lon": -68.20053, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Anamã': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.56697, "lon": -61.39630, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Anori': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.74603, "lon": -61.65750, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Apuí': {
        "codigo": '', "codigo_ana": '',
        "lat": -7.19409, "lon": -59.89600, "rio": 'Rio Madeira',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Atalaia do Norte': {
        "codigo": '', "codigo_ana": '',
        "lat": -4.37277, "lon": -70.19190, "rio": 'Rio Javari',
        "cota_atual_ref": 7.00, "cota_max_hist": 13.00, "cota_min_hist": 0.50,
        "cota_media": 6.50, "cota_alerta": 10.50, "cota_atencao": 7.35,
        "cota_emergencia": 12.50, "cota_maxima": 13.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Autazes': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.57972, "lon": -59.13056, "rio": 'Rio Madeira',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Barcelos': {
        "codigo": '14870000', "codigo_ana": '14870000',
        "lat": -0.97400, "lon": -62.92400, "rio": 'Rio Negro',
        "cota_atual_ref": 10.50, "cota_max_hist": 15.50, "cota_min_hist": 1.80,
        "cota_media": 9.00, "cota_alerta": 13.50, "cota_atencao": 9.50,
        "cota_emergencia": 15.20, "cota_maxima": 15.50,
        "sace_bacia": None, "sace_pm": None,
    },
    'Barreirinha': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.79830, "lon": -57.06790, "rio": 'Rio Amazonas',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Benjamin Constant': {
        "codigo": '', "codigo_ana": '',
        "lat": -4.38306, "lon": -70.03111, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Beruri': {
        "codigo": '13762000', "codigo_ana": '13762000',
        "lat": -3.89874, "lon": -61.37130, "rio": 'Rio Purus',
        "cota_atual_ref": 10.00, "cota_max_hist": 15.80, "cota_min_hist": 1.50,
        "cota_media": 8.50, "cota_alerta": 13.50, "cota_atencao": 9.20,
        "cota_emergencia": 15.50, "cota_maxima": 15.80,
        "sace_bacia": 'amazonas', "sace_pm": 19,
    },
    'Boa Vista do Ramos': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.97136, "lon": -57.58760, "rio": 'Rio Amazonas',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Boca do Acre': {
        "codigo": '', "codigo_ana": '',
        "lat": -8.75222, "lon": -67.39780, "rio": 'Rio Purus',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Borba': {
        "codigo": '14390000', "codigo_ana": '14390000',
        "lat": -4.38778, "lon": -59.59390, "rio": 'Rio Madeira',
        "cota_atual_ref": 10.00, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 14.00, "cota_atencao": 9.50,
        "cota_emergencia": 15.70, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Caapiranga': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.31537, "lon": -61.20900, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Canutama': {
        "codigo": '', "codigo_ana": '',
        "lat": -6.53389, "lon": -64.38390, "rio": 'Rio Purus',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Carauari': {
        "codigo": '', "codigo_ana": '',
        "lat": -4.88278, "lon": -66.89580, "rio": 'Rio Juruá',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Careiro': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.81000, "lon": -60.37000, "rio": 'Rio Amazonas',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Careiro da Várzea': {
        "codigo": '14100000', "codigo_ana": '14100000',
        "lat": -3.74000, "lon": -60.38000, "rio": 'Rio Amazonas',
        "cota_atual_ref": 24.00, "cota_max_hist": 29.50, "cota_min_hist": 13.00,
        "cota_media": 22.00, "cota_alerta": 28.50, "cota_atencao": 20.00,
        "cota_emergencia": 29.00, "cota_maxima": 29.50,
        "sace_bacia": None, "sace_pm": None,
    },
    'Coari': {
        "codigo": '13650001', "codigo_ana": '13650001',
        "lat": -4.09472, "lon": -63.14410, "rio": 'Rio Solimões',
        "cota_atual_ref": 11.00, "cota_max_hist": 16.20, "cota_min_hist": 1.20,
        "cota_media": 9.50, "cota_alerta": 14.00, "cota_atencao": 9.80,
        "cota_emergencia": 16.00, "cota_maxima": 16.20,
        "sace_bacia": None, "sace_pm": None,
    },
    'Codajás': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.83750, "lon": -62.05690, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Eirunepé': {
        "codigo": '', "codigo_ana": '',
        "lat": -6.66028, "lon": -69.87360, "rio": 'Rio Juruá',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Envira': {
        "codigo": '', "codigo_ana": '',
        "lat": -7.43789, "lon": -70.02810, "rio": 'Rio Tarauacá',
        "cota_atual_ref": 7.00, "cota_max_hist": 13.00, "cota_min_hist": 0.50,
        "cota_media": 6.50, "cota_alerta": 10.50, "cota_atencao": 7.35,
        "cota_emergencia": 12.50, "cota_maxima": 13.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Fonte Boa': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.51389, "lon": -66.09170, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Guajará': {
        "codigo": '', "codigo_ana": '',
        "lat": -7.53797, "lon": -72.59050, "rio": 'Rio Juruá',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Humaitá': {
        "codigo": '13770000', "codigo_ana": '13770000',
        "lat": -7.51651, "lon": -63.03110, "rio": 'Rio Madeira',
        "cota_atual_ref": 8.50, "cota_max_hist": 13.50, "cota_min_hist": 0.50,
        "cota_media": 7.00, "cota_alerta": 11.50, "cota_atencao": 7.80,
        "cota_emergencia": 13.20, "cota_maxima": 13.50,
        "sace_bacia": None, "sace_pm": None,
    },
    'Ipixuna': {
        "codigo": '', "codigo_ana": '',
        "lat": -7.04791, "lon": -71.69340, "rio": 'Rio Juruá',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Iranduba': {
        "codigo": '13900000', "codigo_ana": '13900000',
        "lat": -3.28472, "lon": -60.18610, "rio": 'Rio Solimões',
        "cota_atual_ref": 17.50, "cota_max_hist": 22.80, "cota_min_hist": 3.50,
        "cota_media": 14.50, "cota_alerta": 20.50, "cota_atencao": 14.00,
        "cota_emergencia": 22.50, "cota_maxima": 22.80,
        "sace_bacia": None, "sace_pm": None,
    },
    'Itacoatiara': {
        "codigo": '14280000', "codigo_ana": '14280000',
        "lat": -3.13861, "lon": -58.44420, "rio": 'Rio Amazonas',
        "cota_atual_ref": 13.00, "cota_max_hist": 16.83, "cota_min_hist": 1.20,
        "cota_media": 9.50, "cota_alerta": 14.00, "cota_atencao": 9.80,
        "cota_emergencia": 16.80, "cota_maxima": 16.83,
        "sace_bacia": 'amazonas', "sace_pm": 26,
    },
    'Itamarati': {
        "codigo": '', "codigo_ana": '',
        "lat": -6.43889, "lon": -68.24390, "rio": 'Rio Juruá',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Itapiranga': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.74589, "lon": -58.02980, "rio": 'Rio Uatumã',
        "cota_atual_ref": 7.00, "cota_max_hist": 13.00, "cota_min_hist": 0.50,
        "cota_media": 6.50, "cota_alerta": 10.50, "cota_atencao": 7.35,
        "cota_emergencia": 12.50, "cota_maxima": 13.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Japurá': {
        "codigo": '', "codigo_ana": '',
        "lat": -1.88083, "lon": -66.99690, "rio": 'Rio Japurá',
        "cota_atual_ref": 7.00, "cota_max_hist": 13.00, "cota_min_hist": 0.50,
        "cota_media": 6.50, "cota_alerta": 10.50, "cota_atencao": 7.35,
        "cota_emergencia": 12.50, "cota_maxima": 13.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Juruá': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.48438, "lon": -66.07180, "rio": 'Rio Juruá',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Jutaí': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.75814, "lon": -66.75950, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Lábrea': {
        "codigo": '13340000', "codigo_ana": '13340000',
        "lat": -7.25861, "lon": -64.79810, "rio": 'Rio Purus',
        "cota_atual_ref": 9.00, "cota_max_hist": 14.50, "cota_min_hist": 0.80,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.50,
        "cota_emergencia": 14.20, "cota_maxima": 14.50,
        "sace_bacia": None, "sace_pm": None,
    },
    'Manacapuru': {
        "codigo": '13850000', "codigo_ana": '13850000',
        "lat": -3.29972, "lon": -60.62060, "rio": 'Rio Solimões',
        "cota_atual_ref": 18.00, "cota_max_hist": 23.50, "cota_min_hist": 3.20,
        "cota_media": 15.00, "cota_alerta": 21.00, "cota_atencao": 14.70,
        "cota_emergencia": 25.20, "cota_maxima": 23.50,
        "sace_bacia": 'amazonas', "sace_pm": 12,
    },
    'Manaquiri': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.44078, "lon": -60.46120, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Manaus': {
        "codigo": '14990000', "codigo_ana": '14990000',
        "lat": -3.10000, "lon": -60.02000, "rio": 'Rio Negro',
        "cota_atual_ref": 26.56, "cota_max_hist": 29.97, "cota_min_hist": 12.11,
        "cota_media": 22.50, "cota_alerta": 29.00, "cota_atencao": 20.30,
        "cota_emergencia": 34.80, "cota_maxima": 29.97,
        "sace_bacia": 'amazonas', "sace_pm": 8,
    },
    'Manicoré': {
        "codigo": '14180000', "codigo_ana": '14180000',
        "lat": -5.80917, "lon": -61.30030, "rio": 'Rio Madeira',
        "cota_atual_ref": 9.50, "cota_max_hist": 15.00, "cota_min_hist": 0.60,
        "cota_media": 8.00, "cota_alerta": 13.00, "cota_atencao": 8.80,
        "cota_emergencia": 14.70, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Maraã': {
        "codigo": '', "codigo_ana": '',
        "lat": -1.85313, "lon": -65.57300, "rio": 'Rio Japurá',
        "cota_atual_ref": 7.00, "cota_max_hist": 13.00, "cota_min_hist": 0.50,
        "cota_media": 6.50, "cota_alerta": 10.50, "cota_atencao": 7.35,
        "cota_emergencia": 12.50, "cota_maxima": 13.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Maués': {
        "codigo": '14440000', "codigo_ana": '14440000',
        "lat": -3.38361, "lon": -57.71860, "rio": 'Rio Maués-Açu',
        "cota_atual_ref": 5.50, "cota_max_hist": 10.80, "cota_min_hist": -0.50,
        "cota_media": 5.00, "cota_alerta": 9.00, "cota_atencao": 5.50,
        "cota_emergencia": 10.50, "cota_maxima": 10.80,
        "sace_bacia": None, "sace_pm": None,
    },
    'Nhamundá': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.18583, "lon": -56.71110, "rio": 'Rio Amazonas',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Nova Olinda do Norte': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.90037, "lon": -59.09560, "rio": 'Rio Madeira',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Novo Airão': {
        "codigo": '14940000', "codigo_ana": '14940000',
        "lat": -2.62139, "lon": -60.94360, "rio": 'Rio Negro',
        "cota_atual_ref": 17.00, "cota_max_hist": 22.00, "cota_min_hist": 3.50,
        "cota_media": 13.50, "cota_alerta": 20.00, "cota_atencao": 13.00,
        "cota_emergencia": 21.80, "cota_maxima": 22.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Novo Aripuanã': {
        "codigo": '', "codigo_ana": '',
        "lat": -5.12056, "lon": -60.37970, "rio": 'Rio Madeira',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Parintins': {
        "codigo": '14540000', "codigo_ana": '14540000',
        "lat": -2.62833, "lon": -56.73580, "rio": 'Rio Amazonas',
        "cota_atual_ref": 10.50, "cota_max_hist": 13.80, "cota_min_hist": -1.76,
        "cota_media": 7.20, "cota_alerta": 11.50, "cota_atencao": 8.05,
        "cota_emergencia": 13.80, "cota_maxima": 13.80,
        "sace_bacia": None, "sace_pm": None,
    },
    'Pauini': {
        "codigo": '', "codigo_ana": '',
        "lat": -7.71361, "lon": -66.97640, "rio": 'Rio Purus',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Presidente Figueiredo': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.03445, "lon": -60.02560, "rio": 'Rede hidrográfica local',
        "cota_atual_ref": 7.00, "cota_max_hist": 13.00, "cota_min_hist": 0.50,
        "cota_media": 6.50, "cota_alerta": 10.50, "cota_atencao": 7.35,
        "cota_emergencia": 12.50, "cota_maxima": 13.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Rio Preto da Eva': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.69944, "lon": -59.70060, "rio": 'Rede hidrográfica local',
        "cota_atual_ref": 7.00, "cota_max_hist": 13.00, "cota_min_hist": 0.50,
        "cota_media": 6.50, "cota_alerta": 10.50, "cota_atencao": 7.35,
        "cota_emergencia": 12.50, "cota_maxima": 13.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Santa Isabel do Rio Negro': {
        "codigo": '', "codigo_ana": '',
        "lat": -0.41389, "lon": -65.01920, "rio": 'Rio Negro',
        "cota_atual_ref": 8.00, "cota_max_hist": 14.00, "cota_min_hist": 1.00,
        "cota_media": 7.00, "cota_alerta": 11.50, "cota_atencao": 8.00,
        "cota_emergencia": 13.50, "cota_maxima": 14.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Santo Antônio do Içá': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.10222, "lon": -67.93970, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'São Gabriel da Cachoeira': {
        "codigo": '14960000', "codigo_ana": '14960000',
        "lat": 0.13028, "lon": -67.08920, "rio": 'Rio Negro',
        "cota_atual_ref": 8.00, "cota_max_hist": 12.50, "cota_min_hist": 1.00,
        "cota_media": 6.50, "cota_alerta": 11.00, "cota_atencao": 7.00,
        "cota_emergencia": 12.20, "cota_maxima": 12.50,
        "sace_bacia": None, "sace_pm": None,
    },
    'São Paulo de Olivença': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.46556, "lon": -68.94690, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'São Sebastião do Uatumã': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.57088, "lon": -57.87080, "rio": 'Rio Uatumã',
        "cota_atual_ref": 7.00, "cota_max_hist": 13.00, "cota_min_hist": 0.50,
        "cota_media": 6.50, "cota_alerta": 10.50, "cota_atencao": 7.35,
        "cota_emergencia": 12.50, "cota_maxima": 13.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Silves': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.83333, "lon": -58.21390, "rio": 'Rio Amazonas',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Tabatinga': {
        "codigo": '13020000', "codigo_ana": '13020000',
        "lat": -4.25222, "lon": -69.93810, "rio": 'Rio Solimões',
        "cota_atual_ref": 11.10, "cota_max_hist": 13.50, "cota_min_hist": -2.34,
        "cota_media": 7.50, "cota_alerta": 11.00, "cota_atencao": 7.70,
        "cota_emergencia": 13.20, "cota_maxima": 13.50,
        "sace_bacia": 'amazonas', "sace_pm": 15,
    },
    'Tapauá': {
        "codigo": '', "codigo_ana": '',
        "lat": -5.62085, "lon": -63.18120, "rio": 'Rio Purus',
        "cota_atual_ref": 8.50, "cota_max_hist": 15.00, "cota_min_hist": 0.70,
        "cota_media": 7.50, "cota_alerta": 12.50, "cota_atencao": 8.75,
        "cota_emergencia": 14.50, "cota_maxima": 15.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Tefé': {
        "codigo": '13760000', "codigo_ana": '13760000',
        "lat": -3.36822, "lon": -64.71930, "rio": 'Rio Solimões',
        "cota_atual_ref": 12.00, "cota_max_hist": 17.50, "cota_min_hist": 1.46,
        "cota_media": 10.20, "cota_alerta": 14.50, "cota_atencao": 10.15,
        "cota_emergencia": 17.40, "cota_maxima": 17.50,
        "sace_bacia": None, "sace_pm": None,
    },
    'Tonantins': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.87306, "lon": -67.80220, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Uarini': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.99600, "lon": -65.11330, "rio": 'Rio Solimões',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Urucará': {
        "codigo": '', "codigo_ana": '',
        "lat": -2.53639, "lon": -57.76000, "rio": 'Rio Amazonas',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
    'Urucurituba': {
        "codigo": '', "codigo_ana": '',
        "lat": -3.12845, "lon": -58.14960, "rio": 'Rio Amazonas',
        "cota_atual_ref": 9.50, "cota_max_hist": 16.00, "cota_min_hist": 0.80,
        "cota_media": 8.50, "cota_alerta": 13.00, "cota_atencao": 9.10,
        "cota_emergencia": 15.50, "cota_maxima": 16.00,
        "sace_bacia": None, "sace_pm": None,
    },
}

# Garante que todos os municípios do Amazonas estejam disponíveis sem remover
# estações hidrológicas de apoio que já existiam no projeto.
ESTACOES.update(MUNICIPIOS_AMAZONAS)

# ── Metadados para retorno nas APIs e telas analíticas ─────────────────────────
MUNICIPIOS_AMAZONAS_NOMES = set(MUNICIPIOS_AMAZONAS.keys())
ESTACOES_APOIO_FORA_AM = {"Óbidos", "Santarém"}

def obter_metadata_estacao(nome, cfg=None):
    """
    Padroniza as informações de município/estação usadas em Estações,
    Rede de Estações, Mapa ao Vivo, Dashboard e logs.
    """
    cfg = cfg or ESTACOES.get(nome, {})
    uf = "AM" if nome in MUNICIPIOS_AMAZONAS_NOMES else "PA" if nome in ESTACOES_APOIO_FORA_AM else "AM"
    tipo = "municipio_amazonas" if nome in MUNICIPIOS_AMAZONAS_NOMES else "apoio_hidrologico"
    return {
        "municipio": nome,
        "estacao": nome,
        "nome": nome,
        "uf": uf,
        "tipo": tipo,
        "codigo": cfg.get("codigo", ""),
        "codigo_ana": cfg.get("codigo_ana", cfg.get("codigo", "")),
        "rio": cfg.get("rio", "Rede hidrográfica local"),
        "lat": cfg.get("lat"),
        "lon": cfg.get("lon"),
        "cota_atual_ref": cfg.get("cota_atual_ref"),
        "cota_media": cfg.get("cota_media"),
        "cota_alerta": cfg.get("cota_alerta"),
        "cota_atencao": cfg.get("cota_atencao"),
        "cota_emergencia": cfg.get("cota_emergencia"),
        "cota_max_hist": cfg.get("cota_max_hist", cfg.get("cota_maxima")),
        "cota_maxima": cfg.get("cota_maxima", cfg.get("cota_max_hist")),
        "sace_bacia": cfg.get("sace_bacia"),
        "sace_pm": cfg.get("sace_pm"),
    }

METADADOS_ESTACOES = {nome: obter_metadata_estacao(nome, cfg) for nome, cfg in ESTACOES.items()}
MUNICIPIOS_MONITORADOS_AMAZONAS = [nome for nome in ESTACOES.keys() if nome in MUNICIPIOS_AMAZONAS_NOMES]

# ── Mapeamento nome → código ANA ──────────────────────────────────────────────
ANA_CODIGOS = {nome: cfg["codigo"] for nome, cfg in ESTACOES.items() if cfg.get("codigo")}
# Aliases sem acento
ANA_CODIGOS["Obidos"]                    = "17050001"
ANA_CODIGOS["Tefe"]                      = "13760000"
ANA_CODIGOS["Santarem"]                  = "16015000"
ANA_CODIGOS["Sao Gabriel da Cachoeira"]  = "14960000"
ANA_CODIGOS["Labrea"]                    = "13340000"
ANA_CODIGOS["Humaita"]                   = "13770000"
ANA_CODIGOS["Manicore"]                  = "14180000"
ANA_CODIGOS["Novo Airao"]                = "14940000"
ANA_CODIGOS["Maues"]                     = "14440000"

# Aliases adicionais dos municípios do Amazonas
ANA_CODIGOS['Careiro da Varzea'] = '14100000'
ANA_CODIGOS['Humaita'] = '13770000'
ANA_CODIGOS['Labrea'] = '13340000'
ANA_CODIGOS['Manicore'] = '14180000'
ANA_CODIGOS['Maues'] = '14440000'
ANA_CODIGOS['Novo Airao'] = '14940000'
ANA_CODIGOS['Sao Gabriel da Cachoeira'] = '14960000'
ANA_CODIGOS['Tefe'] = '13760000'

# ── NÍVEIS DE ALERTA ──────────────────────────────────────────────────────────
NIVEIS_ALERTA = {
    "normal":     (0,    0.70),
    "atencao":    (0.70, 1.00),
    "alerta":     (1.00, 1.20),
    "emergencia": (1.20, 999),
}

# ── CAMINHOS ──────────────────────────────────────────────────────────────────
BASE_DIR         = Path(__file__).resolve().parent.parent
CAMINHO_FALLBACK = BASE_DIR / "data" / "fallback.json"
ALERTAS_CACHE_PATH = BASE_DIR / "data" / "alertas_integrados.json"
DADOS_CACHE_PATH = BASE_DIR / "data" / "dados_hidrologicos_cache.json"
CAMINHO_FALLBACK.parent.mkdir(parents=True, exist_ok=True)

# ── ALERTAS / DADOS INTEGRADOS ────────────────────────────────────────────────
# Por padrão, as leituras e alertas são atualizados a cada 2 horas.
# Se quiser uma janela fixa manual, defina ALERTAS_HORARIOS no .env, ex.: 0,6,12,18.
DADOS_INTERVALO_HORAS = int(os.getenv("DADOS_INTERVALO_HORAS", "2"))
ALERTAS_INTERVALO_HORAS = int(os.getenv("ALERTAS_INTERVALO_HORAS", str(DADOS_INTERVALO_HORAS)))
_alertas_horarios_env = os.getenv("ALERTAS_HORARIOS", "").strip()
if _alertas_horarios_env:
    ALERTAS_HORARIOS = [int(h.strip()) for h in _alertas_horarios_env.split(",") if h.strip().isdigit()]
else:
    ALERTAS_HORARIOS = list(range(0, 24, max(1, ALERTAS_INTERVALO_HORAS)))
INMET_AVISOS_RSS_URL = os.getenv("INMET_AVISOS_RSS_URL", "https://apiprevmet3.inmet.gov.br/avisos/rss/45736")
CEMADEN_ALERTAS_URL = os.getenv("CEMADEN_ALERTAS_URL", "https://painelalertas.cemaden.gov.br/")

DEBUG = os.getenv("DEBUG", "true").lower() == "true"
