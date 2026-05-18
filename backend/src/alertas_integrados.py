"""
Coletor de alertas integrados do FluviAM.

Fontes trabalhadas:
- ANA HidroWebService: usa credenciais via .env e gera alertas de cota/chuva/vazao por estação.
- INMET Avisos: RSS/CAP público, sem credenciais.
- CEMADEN Painel de Alertas: painel público, sem credenciais.
- Open-Meteo Flood: API pública para previsão de descarga/vazão, sem credenciais para uso não comercial.

A coleta é cacheada por janela operacional para reduzir chamadas externas.
Por padrão, as janelas ocorrem a cada 2 horas.
"""

from __future__ import annotations

import json
import logging
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from html import unescape
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import requests

from backend.src.config import (
    ALERTAS_CACHE_PATH,
    ALERTAS_HORARIOS,
    ANA_CPF_CNPJ,
    ANA_SENHA,
    CEMADEN_ALERTAS_URL,
    ESTACOES,
    MUNICIPIOS_MONITORADOS_AMAZONAS,
    ESTACOES_APOIO_FORA_AM,
    obter_metadata_estacao,
    INMET_AVISOS_RSS_URL,
    TIMEOUT,
)
from backend.src.dados_cache import obter_dados_cacheados
from backend.src.api import buscar_open_meteo

logger = logging.getLogger(__name__)


MUNICIPIOS_INTERESSE = {nome.upper() for nome in ESTACOES.keys()}
MUNICIPIOS_INTERESSE.update({"AM", "AMAZONAS", "BACIA AMAZÔNICA", "BACIA AMAZONICA"})


def _agora() -> datetime:
    return datetime.now()


def _janela_operacional(now: Optional[datetime] = None) -> Dict[str, str]:
    """Retorna a janela atual de coleta conforme horários configurados."""
    now = now or _agora()
    horas = sorted(set(int(h) for h in ALERTAS_HORARIOS if 0 <= int(h) <= 23))
    if not horas:
        horas = list(range(0, 24, 2))
    hora_base = horas[0]
    data_base = now.date()

    for h in horas:
        if now.hour >= h:
            hora_base = h
        else:
            break
    else:
        # Se passou do último horário, usa o último horário do dia atual.
        pass

    if now.hour < horas[0]:
        data_base = (now - timedelta(days=1)).date()
        hora_base = horas[-1]

    janela_dt = datetime.combine(data_base, datetime.min.time()).replace(hour=hora_base)
    prox_candidates = [h for h in horas if h > now.hour]
    if prox_candidates:
        prox_dt = datetime.combine(now.date(), datetime.min.time()).replace(hour=prox_candidates[0])
    else:
        prox_dt = datetime.combine(now.date() + timedelta(days=1), datetime.min.time()).replace(hour=horas[0])

    return {
        "id": janela_dt.strftime("%Y-%m-%dT%H:00"),
        "coleta_prevista": janela_dt.isoformat(timespec="minutes"),
        "proxima_coleta": prox_dt.isoformat(timespec="minutes"),
    }


def _nivel_rank(nivel: str) -> int:
    n = (nivel or "").lower()
    if any(k in n for k in ["emerg", "muito alto", "vermelho", "grande perigo", "severo"]):
        return 4
    if any(k in n for k in ["alto", "alerta", "laranja", "perigo"]):
        return 3
    if any(k in n for k in ["aten", "moderado", "amarelo", "observa"]):
        return 2
    return 1


def _limpar_html(txt: str) -> str:
    if not txt:
        return ""
    txt = re.sub(r"<[^>]+>", " ", txt)
    txt = unescape(txt)
    return re.sub(r"\s+", " ", txt).strip()


def _alerta(
    fonte: str,
    tipo: str,
    nivel: str,
    titulo: str,
    descricao: str,
    municipio: str = "Regional",
    uf: str = "AM",
    inicio: Optional[str] = None,
    fim: Optional[str] = None,
    payload: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    return {
        "id": f"{fonte.lower()}-{municipio.lower()}-{tipo.lower()}-{inicio or datetime.now().isoformat(timespec='seconds')}",
        "fonte": fonte,
        "tipo": tipo,
        "nivel": nivel,
        "nivel_rank": _nivel_rank(nivel),
        "titulo": titulo,
        "descricao": descricao,
        "municipio": municipio,
        "uf": uf,
        "inicio": inicio,
        "fim": fim,
        "payload": payload or {},
    }


def fontes_alerta_status() -> Dict[str, Any]:
    """Metadados para o frontend mostrar o estado das bases integradas."""
    return {
        "fontes": [
            {
                "slug": "ana",
                "nome": "ANA HidroWebService",
                "credencial": "necessaria",
                "configurada": bool(ANA_CPF_CNPJ and ANA_SENHA),
                "uso": "Base hidrológica principal: cota, chuva e vazão por estação telemétrica.",
                "coleta": "A cada 2 horas",
            },
            {
                "slug": "inmet",
                "nome": "INMET Avisos Meteorológicos",
                "credencial": "nao_necessaria",
                "configurada": True,
                "uso": "Avisos de chuva intensa, tempestade e eventos meteorológicos severos.",
                "coleta": "A cada 2 horas",
            },
            {
                "slug": "cemaden",
                "nome": "CEMADEN Painel de Alertas",
                "credencial": "nao_necessaria",
                "configurada": True,
                "uso": "Alertas vigentes de risco hidrológico e geológico por município.",
                "coleta": "A cada 2 horas",
            },
            {
                "slug": "open-meteo",
                "nome": "Open-Meteo Flood API",
                "credencial": "nao_necessaria",
                "configurada": True,
                "uso": "Previsão complementar de descarga/vazão fluvial por coordenada.",
                "coleta": "A cada 2 horas",
            },
        ],
        "janela": _janela_operacional(),
    }


def coletar_alertas_ana() -> List[Dict[str, Any]]:
    """Gera alertas hidrológicos locais com base nas leituras do sistema."""
    alertas: List[Dict[str, Any]] = []
    try:
        dados, _meta = obter_dados_cacheados(forcar=False)
    except Exception as exc:
        logger.warning("Falha ao obter dados hidrológicos para alertas ANA/SACE: %s", exc)
        return alertas

    for nome, info in dados.items():
        cfg = ESTACOES.get(nome, {})
        leituras = info.get("dados", []) if isinstance(info, dict) else []
        if not leituras:
            continue
        atual = leituras[-1]
        cota = atual.get("cota_m")
        if cota is None:
            continue
        cota_alerta = cfg.get("cota_alerta")
        cota_atencao = cfg.get("cota_atencao") or (cota_alerta * 0.7 if cota_alerta else None)
        cota_emergencia = cfg.get("cota_emergencia") or (cota_alerta * 1.2 if cota_alerta else None)
        nivel = None
        if cota_emergencia and cota >= cota_emergencia:
            nivel = "Emergência"
        elif cota_alerta and cota >= cota_alerta:
            nivel = "Alerta"
        elif cota_atencao and cota >= cota_atencao:
            nivel = "Atenção"
        if not nivel:
            continue
        fonte_original = info.get("fonte", "ana")
        alertas.append(_alerta(
            fonte="ANA/SACE",
            tipo="Monitoramento Hidrológico",
            nivel=nivel,
            municipio=nome,
            uf=obter_metadata_estacao(nome, cfg).get("uf", "AM"),
            inicio=atual.get("data"),
            titulo=f"{nome} em nível de {nivel.lower()}",
            descricao=(
                f"Cota atual de {float(cota):.2f} m no {cfg.get('rio', 'rio monitorado')}. "
                f"Fonte operacional: {fonte_original}."
            ),
            payload={"cota_m": cota, "cota_alerta": cota_alerta, "rio": cfg.get("rio"), "fonte_original": fonte_original},
        ))
    return alertas


def coletar_alertas_inmet() -> List[Dict[str, Any]]:
    alertas: List[Dict[str, Any]] = []
    try:
        resp = requests.get(INMET_AVISOS_RSS_URL, timeout=TIMEOUT, headers={"User-Agent": "FluviAM/1.0"})
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
    except Exception as exc:
        logger.warning("Falha ao consultar INMET: %s", exc)
        return alertas

    # RSS tradicional: channel/item. CAP Atom também cai nesse parser pelo uso de final da tag.
    for item in root.iter():
        if not item.tag.lower().endswith("item") and not item.tag.lower().endswith("entry"):
            continue
        campos: Dict[str, str] = {}
        for child in item:
            tag = child.tag.split("}")[-1].lower()
            campos[tag] = _limpar_html(child.text or "")
        texto = " ".join([campos.get("title", ""), campos.get("description", ""), campos.get("summary", "")]).upper()
        if not any(m in texto for m in MUNICIPIOS_INTERESSE):
            continue
        titulo = campos.get("title") or "Aviso meteorológico INMET"
        desc = campos.get("description") or campos.get("summary") or "Aviso meteorológico publicado pelo INMET."
        nivel = "Atenção"
        if any(p in texto for p in ["GRANDE PERIGO", "VERMELHO"]):
            nivel = "Emergência"
        elif any(p in texto for p in ["PERIGO", "LARANJA"]):
            nivel = "Alerta"
        alertas.append(_alerta(
            fonte="INMET",
            tipo="Aviso Meteorológico",
            nivel=nivel,
            titulo=titulo,
            descricao=desc[:520],
            municipio="Regional",
            uf="AM",
            inicio=campos.get("pubdate") or campos.get("updated"),
            payload={"link": campos.get("link", "")},
        ))
    return alertas[:20]


def coletar_alertas_cemaden() -> List[Dict[str, Any]]:
    alertas: List[Dict[str, Any]] = []
    try:
        resp = requests.get(CEMADEN_ALERTAS_URL, timeout=TIMEOUT, headers={"User-Agent": "FluviAM/1.0"})
        resp.raise_for_status()
        html = resp.text
    except Exception as exc:
        logger.warning("Falha ao consultar CEMADEN: %s", exc)
        return alertas

    # Tenta capturar linhas de tabela: UF | Município | Tipo Alerta | Nível | Abertura.
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html, flags=re.I | re.S)
    for row in rows:
        cols = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", row, flags=re.I | re.S)
        cols = [_limpar_html(c) for c in cols]
        if len(cols) < 5 or cols[0].upper() == "UF":
            continue
        uf, municipio, tipo, nivel, abertura = cols[:5]
        if uf.upper() != "AM" and municipio.upper() not in MUNICIPIOS_INTERESSE:
            continue
        alertas.append(_alerta(
            fonte="CEMADEN",
            tipo=tipo or "Risco Hidrológico",
            nivel=nivel or "Moderado",
            titulo=f"{municipio} · {tipo}",
            descricao=f"Alerta vigente no Painel CEMADEN com nível {nivel}. Abertura: {abertura}.",
            municipio=municipio.title(),
            uf=uf.upper(),
            inicio=abertura,
            payload={"linha": cols},
        ))

    # Fallback: quando o HTML chega sem tags úteis, tenta achar blocos textuais conhecidos.
    if not alertas:
        texto = _limpar_html(html)
        pad = re.compile(r"\b(AM)\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ\s]+?)\s+(Risco\s+Hidrológico[^,]*|Risco\s+Geo[^,]*|Mov\.\s*Massa[^,]*)\s+(Moderado|Alto|Muito Alto)\s+(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2})", re.I)
        for uf, municipio, tipo, nivel, abertura in pad.findall(texto):
            alertas.append(_alerta(
                fonte="CEMADEN",
                tipo=tipo,
                nivel=nivel,
                titulo=f"{municipio.title()} · {tipo}",
                descricao=f"Alerta vigente no Painel CEMADEN com nível {nivel}. Abertura: {abertura}.",
                municipio=municipio.title(),
                uf=uf.upper(),
                inicio=abertura,
            ))
    return alertas[:30]


def coletar_alertas_open_meteo() -> List[Dict[str, Any]]:
    """Cria alertas preditivos simples quando a vazão prevista acelera muito."""
    alertas: List[Dict[str, Any]] = []
    for nome, cfg in ESTACOES.items():
        try:
            df = buscar_open_meteo(cfg["lat"], cfg["lon"], dias=14, q_min=0)
            if df.empty or "vazao" not in df.columns or len(df) < 4:
                continue
            atual = float(df["vazao"].iloc[-1])
            media = float(df["vazao"].tail(7).mean())
            maxima = float(df["vazao"].tail(7).max())
            if media <= 0:
                continue
            alta_pct = ((maxima - media) / media) * 100
            if alta_pct < 25:
                continue
            nivel = "Atenção" if alta_pct < 45 else "Alerta"
            alertas.append(_alerta(
                fonte="Open-Meteo",
                tipo="Previsão de Vazão",
                nivel=nivel,
                titulo=f"Tendência de alta de vazão em {nome}",
                descricao=f"Modelo indica pico até {alta_pct:.0f}% acima da média recente para a região de {nome}.",
                municipio=nome,
                uf=obter_metadata_estacao(nome, cfg).get("uf", "AM"),
                payload={"vazao_atual": atual, "vazao_media_7d": media, "vazao_max_7d": maxima, "rio": cfg.get("rio")},
            ))
        except Exception as exc:
            logger.debug("Open-Meteo alerta falhou para %s: %s", nome, exc)
    return alertas[:20]


def _dedupe_alertas(alertas: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    vistos = set()
    saida: List[Dict[str, Any]] = []
    for a in sorted(alertas, key=lambda x: x.get("nivel_rank", 0), reverse=True):
        chave = (
            a.get("fonte"),
            a.get("municipio"),
            a.get("tipo"),
            a.get("nivel"),
            a.get("inicio"),
        )
        if chave in vistos:
            continue
        vistos.add(chave)
        saida.append(a)
    return saida


def salvar_cache(payload: Dict[str, Any]) -> None:
    try:
        Path(ALERTAS_CACHE_PATH).parent.mkdir(parents=True, exist_ok=True)
        with open(ALERTAS_CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2, default=str)
    except Exception as exc:
        logger.warning("Não foi possível salvar cache de alertas: %s", exc)


def carregar_cache() -> Optional[Dict[str, Any]]:
    try:
        if not Path(ALERTAS_CACHE_PATH).exists():
            return None
        with open(ALERTAS_CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def coletar_alertas_integrados(forcar: bool = False) -> Dict[str, Any]:
    janela = _janela_operacional()
    cache = carregar_cache()
    if not forcar and cache and cache.get("janela", {}).get("id") == janela["id"]:
        cache["cache"] = True
        return cache

    fontes = fontes_alerta_status()["fontes"]
    erros: List[Dict[str, str]] = []
    alertas: List[Dict[str, Any]] = []

    coletores = [
        ("ANA/SACE", coletar_alertas_ana),
        ("INMET", coletar_alertas_inmet),
        ("CEMADEN", coletar_alertas_cemaden),
        ("Open-Meteo", coletar_alertas_open_meteo),
    ]
    for nome, fn in coletores:
        try:
            alertas.extend(fn())
        except Exception as exc:
            logger.warning("Coletor %s falhou: %s", nome, exc)
            erros.append({"fonte": nome, "erro": str(exc)})

    alertas = _dedupe_alertas(alertas)
    resumo = {
        "total": len(alertas),
        "emergencia": sum(1 for a in alertas if a.get("nivel_rank", 0) >= 4),
        "alerta": sum(1 for a in alertas if a.get("nivel_rank", 0) == 3),
        "atencao": sum(1 for a in alertas if a.get("nivel_rank", 0) == 2),
        "fontes_ativas": sum(1 for f in fontes if f.get("configurada")),
        "municipios_amazonas_monitorados": len(MUNICIPIOS_MONITORADOS_AMAZONAS),
        "estacoes_total": len(ESTACOES),
    }
    payload = {
        "cache": False,
        "coletado_em": _agora().isoformat(timespec="seconds"),
        "janela": janela,
        "fontes": fontes,
        "resumo": resumo,
        "alertas": alertas,
        "erros": erros,
        "municipios_monitorados": MUNICIPIOS_MONITORADOS_AMAZONAS,
        "estacoes_apoio_fora_am": sorted(ESTACOES_APOIO_FORA_AM),
    }
    salvar_cache(payload)
    return payload
