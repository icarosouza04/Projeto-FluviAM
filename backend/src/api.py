import logging
from datetime import datetime, timedelta, date

import pandas as pd
import requests
from backend.src.config import TIMEOUT, VAZAO_MINIMA, SACE_BASE_URL, ANA_BASE_URL, ANA_CPF_CNPJ, ANA_SENHA

logger = logging.getLogger(__name__)

FLOOD_URL = "https://flood-api.open-meteo.com/v1/flood"


# ─────────────────────────────────────────────────────────────────────────────
# FONTE PRIMÁRIA: SACE/SGB — cotas reais a cada 15 minutos
# URL: {SACE_BASE_URL}/{bacia}_{pm}_cota.csv
# Coluna "indice" vem em centímetros → dividir por 100 = metros
# ─────────────────────────────────────────────────────────────────────────────

def buscar_cota_sace(bacia, pm, dias=None):
    """
    Baixa o CSV de cotas reais do SACE/SGB.
    Retorna DataFrame com colunas: data, cota_m
    Agrega por dia (média diária das leituras de 15 em 15 min).
    """
    if dias is None:
        from backend.src.config import DIAS_ANALISE
        dias = DIAS_ANALISE

    url = f"{SACE_BASE_URL}/{bacia}_{pm}_cota.csv"
    logger.info(f"Buscando SACE: {url}")

    try:
        resp = requests.get(
            url,
            timeout=TIMEOUT,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        resp.raise_for_status()

        # CSV usa ; como separador
        from io import StringIO
        df = pd.read_csv(StringIO(resp.text), sep=";")

        # Renomeia colunas para padrão interno
        df.columns = ["data_hora", "indice"]

        # Converte tipos
        df["data_hora"] = pd.to_datetime(df["data_hora"], errors="coerce")
        df["indice"]    = pd.to_numeric(df["indice"], errors="coerce")
        df = df.dropna()

        # Filtra últimos N dias
        limite = datetime.today() - timedelta(days=dias)
        df = df[df["data_hora"] >= limite]

        if df.empty:
            logger.warning(f"SACE sem dados nos últimos {dias} dias: {url}")
            return pd.DataFrame()

        # Converte centímetros → metros
        df["cota_m"] = df["indice"] / 100.0

        # Agrega por dia (média diária)
        df["data"] = df["data_hora"].dt.date
        df_dia = (
            df.groupby("data")["cota_m"]
            .mean()
            .reset_index()
        )
        df_dia["cota_m"] = df_dia["cota_m"].round(2)

        logger.info(f"SACE OK: {len(df_dia)} dias | último={df_dia['data'].max()} | cota={df_dia['cota_m'].iloc[-1]}m")
        return df_dia.reset_index(drop=True)

    except requests.exceptions.Timeout:
        logger.error(f"Timeout SACE: {url}")
        return pd.DataFrame()
    except Exception as e:
        logger.error(f"Erro SACE {url}: {e}")
        return pd.DataFrame()


def buscar_cota_sace_horaria(bacia, pm, horas=48):
    """
    Retorna leituras horárias (sem agregar por dia).
    Útil para gráficos de curto prazo / tempo real.
    """
    url = f"{SACE_BASE_URL}/{bacia}_{pm}_cota.csv"
    try:
        resp = requests.get(url, timeout=TIMEOUT, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()

        from io import StringIO
        df = pd.read_csv(StringIO(resp.text), sep=";")
        df.columns = ["data_hora", "indice"]
        df["data_hora"] = pd.to_datetime(df["data_hora"], errors="coerce")
        df["indice"]    = pd.to_numeric(df["indice"], errors="coerce")
        df = df.dropna()

        limite = datetime.now() - timedelta(hours=horas)
        df = df[df["data_hora"] >= limite]
        df["cota_m"] = df["indice"] / 100.0

        return df[["data_hora", "cota_m"]].reset_index(drop=True)
    except Exception as e:
        logger.error(f"Erro SACE horário: {e}")
        return pd.DataFrame()



# ─────────────────────────────────────────────────────────────────────────────
# FONTE PRIMÁRIA CONFIGURÁVEL: ANA HidroWebService
# Autenticação: headers Identificador e Senha em /OAUth/v1.
# Consulta: /HidroinfoanaSerieTelemetricaAdotada/v1 com Bearer token.
# ─────────────────────────────────────────────────────────────────────────────

_token_ana_cache = {"token": None, "gerado_em": None}


def autenticar_ana():
    """Autentica na ANA e retorna tokenautenticacao, se disponível."""
    if not ANA_CPF_CNPJ or not ANA_SENHA:
        logger.info("Credenciais ANA não configuradas no .env")
        return None

    token = _token_ana_cache.get("token")
    gerado_em = _token_ana_cache.get("gerado_em")
    if token and gerado_em and datetime.now() - gerado_em < timedelta(minutes=50):
        return token

    url = f"{ANA_BASE_URL.rstrip('/')}/OAUth/v1"
    try:
        resp = requests.get(
            url,
            timeout=TIMEOUT,
            headers={"Identificador": ANA_CPF_CNPJ, "Senha": ANA_SENHA, "User-Agent": "FluviAM/1.0"},
        )
        resp.raise_for_status()
        payload = resp.json()
        items = payload.get("items") or {}
        if isinstance(items, list) and items:
            items = items[0]
        token = items.get("tokenautenticacao") or items.get("tokenAutenticacao") or items.get("token")
        if token:
            _token_ana_cache["token"] = token
            _token_ana_cache["gerado_em"] = datetime.now()
            return token
        logger.warning("ANA autenticou, mas não retornou token esperado: %s", payload)
    except Exception as e:
        logger.warning("Falha na autenticação ANA: %s", e)
    return None


def buscar_ana_hidroweb(codigo_estacao, dias=30):
    """
    Busca série telemétrica adotada na ANA HidroWebService.
    Retorna DataFrame com: data, cota_m, chuva, vazao.
    """
    token = autenticar_ana()
    if not token:
        return pd.DataFrame()

    url = f"{ANA_BASE_URL.rstrip('/')}/HidroinfoanaSerieTelemetricaAdotada/v1"
    params = {
        "CodigoDaEstacao": str(codigo_estacao),
        "TipoFiltroData": "DATA_LEITURA",
        "RangeIntervaloDeBusca": "DIAS_30" if dias <= 30 else "DIAS_60",
    }
    try:
        resp = requests.get(
            url,
            params=params,
            timeout=TIMEOUT,
            headers={"Authorization": f"Bearer {token}", "User-Agent": "FluviAM/1.0"},
        )
        resp.raise_for_status()
        payload = resp.json()
        items = payload.get("items") or []
        if not items:
            logger.warning("ANA sem itens para estação %s", codigo_estacao)
            return pd.DataFrame()

        registros = []
        for item in items:
            dt = item.get("Data_Hora_Medicao") or item.get("Data_Hora_Medição") or item.get("dataHoraMedicao")
            cota = item.get("Cota_Adotada") or item.get("cotaAdotada")
            chuva = item.get("Chuva_Adotada") or item.get("chuvaAdotada")
            vazao = item.get("Vazao_Adotada") or item.get("vazaoAdotada")
            try:
                cota_m = float(str(cota).replace(",", ".")) / 100.0 if cota not in (None, "") else None
                chuva_v = float(str(chuva).replace(",", ".")) if chuva not in (None, "") else None
                vazao_v = float(str(vazao).replace(",", ".")) if vazao not in (None, "") else None
            except ValueError:
                continue
            data_hora = pd.to_datetime(dt, errors="coerce")
            if pd.isna(data_hora) or cota_m is None:
                continue
            registros.append({"data_hora": data_hora, "cota_m": cota_m, "chuva": chuva_v, "vazao": vazao_v})

        if not registros:
            return pd.DataFrame()

        df = pd.DataFrame(registros).sort_values("data_hora")
        limite = datetime.now() - timedelta(days=dias)
        df = df[df["data_hora"] >= limite]
        if df.empty:
            return pd.DataFrame()

        # Consolida por dia usando última leitura do dia, preservando chuva/vazão média.
        df["data"] = df["data_hora"].dt.date
        df_dia = df.groupby("data", as_index=False).agg({
            "cota_m": "last",
            "chuva": "mean",
            "vazao": "mean",
        })
        df_dia["cota_m"] = df_dia["cota_m"].round(2)
        return df_dia.reset_index(drop=True)
    except Exception as e:
        logger.warning("Erro ANA HidroWebService estação %s: %s", codigo_estacao, e)
        return pd.DataFrame()

# ─────────────────────────────────────────────────────────────────────────────
# FONTE SECUNDÁRIA (fallback): Open-Meteo — vazão modelada
# ─────────────────────────────────────────────────────────────────────────────

def buscar_open_meteo(lat, lon, dias=None, q_min=None):
    """Busca descarga fluvial modelada no Open-Meteo (fallback)."""
    if q_min is None:
        q_min = VAZAO_MINIMA
    if dias is None:
        from backend.src.config import DIAS_ANALISE
        dias = DIAS_ANALISE

    hoje   = datetime.today().date()
    inicio = (hoje - timedelta(days=dias - 1)).isoformat()
    fim    = hoje.isoformat()

    params = {
        "latitude":   lat,
        "longitude":  lon,
        "daily":      "river_discharge",
        "start_date": inicio,
        "end_date":   fim,
    }

    logger.info(f"Buscando Open-Meteo (fallback): lat={lat}, lon={lon}")

    try:
        response = requests.get(FLOOD_URL, params=params, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()

        daily     = data.get("daily", {})
        time      = daily.get("time", [])
        discharge = daily.get("river_discharge", [])

        if not time or not discharge:
            logger.warning(f"Open-Meteo sem dados: lat={lat}, lon={lon}")
            return pd.DataFrame()

        df = pd.DataFrame({
            "data":  pd.to_datetime(time).to_series().dt.date,
            "vazao": [float(v) if v is not None else None for v in discharge],
        })

        df = df.dropna(subset=["vazao"])

        if q_min and q_min > 0:
            df = df[df["vazao"] >= q_min]

        logger.info(f"Open-Meteo OK: {len(df)} registros")
        return df.reset_index(drop=True)

    except requests.exceptions.Timeout:
        logger.error(f"Timeout Open-Meteo lat={lat}, lon={lon}")
        return pd.DataFrame()
    except Exception as e:
        logger.error(f"Erro Open-Meteo: {e}")
        return pd.DataFrame()
