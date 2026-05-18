"""
Cache operacional das leituras hidrológicas do FluviAM.

Objetivo:
- Evitar que a tela e o ticker fiquem vazios quando uma API oscila.
- Atualizar os dados somente dentro da janela configurada, por padrão a cada 2 horas.
- Servir a última coleta válida enquanto uma nova coleta não for concluída com sucesso.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from backend.src.config import DADOS_CACHE_PATH, DADOS_INTERVALO_HORAS, ESTACOES
from backend.src.main import obter_dados

logger = logging.getLogger(__name__)


def _agora() -> datetime:
    return datetime.now()


def _proxima_coleta(base: Optional[datetime] = None) -> datetime:
    base = base or _agora()
    return base + timedelta(hours=DADOS_INTERVALO_HORAS)


def _tem_dados_validos(dados: Optional[Dict[str, Any]]) -> bool:
    if not isinstance(dados, dict) or not dados:
        return False

    # Quando a lista de estações/municípios muda, o cache antigo não pode
    # esconder os novos itens no frontend. Assim, forçamos nova coleta.
    faltando = set(ESTACOES.keys()) - set(dados.keys())
    if faltando:
        logger.info("Cache hidrológico sem %s estação(ões)/município(s); nova coleta será feita.", len(faltando))
        return False

    for info in dados.values():
        if isinstance(info, dict) and info.get("dados"):
            return True
    return False


def _parse_data(valor: Any) -> Optional[datetime]:
    if not valor:
        return None
    try:
        return datetime.fromisoformat(str(valor))
    except Exception:
        return None


def carregar_cache_dados() -> Optional[Dict[str, Any]]:
    try:
        path = Path(DADOS_CACHE_PATH)
        if not path.exists():
            return None
        with open(path, "r", encoding="utf-8") as f:
            payload = json.load(f)
        if not _tem_dados_validos(payload.get("dados")):
            return None
        return payload
    except Exception as exc:
        logger.warning("Não foi possível carregar cache hidrológico: %s", exc)
        return None


def salvar_cache_dados(dados: Dict[str, Any]) -> Dict[str, Any]:
    agora = _agora()
    payload = {
        "cache": False,
        "coletado_em": agora.isoformat(timespec="seconds"),
        "proxima_coleta": _proxima_coleta(agora).isoformat(timespec="seconds"),
        "intervalo_horas": DADOS_INTERVALO_HORAS,
        "dados": dados,
    }
    try:
        Path(DADOS_CACHE_PATH).parent.mkdir(parents=True, exist_ok=True)
        with open(DADOS_CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2, default=str)
    except Exception as exc:
        logger.warning("Não foi possível salvar cache hidrológico: %s", exc)
    return payload


def cache_ainda_valido(cache: Dict[str, Any]) -> bool:
    coletado_em = _parse_data(cache.get("coletado_em"))
    if not coletado_em:
        return False
    return _agora() - coletado_em < timedelta(hours=DADOS_INTERVALO_HORAS)


def obter_dados_cacheados(forcar: bool = False) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Retorna dados hidrológicos com cache persistente.

    Regras:
    - Sem force e cache dentro da janela: retorna cache.
    - Janela vencida ou force: tenta API.
    - Se a API falhar ou retornar vazio: mantém a última coleta válida.
    """
    cache = carregar_cache_dados()

    if not forcar and cache:
        # A interface deve abrir rápido e completa. Se o cache estiver vencido,
        # ele ainda é servido como base inicial enquanto a coleta periódica/force
        # atualiza as fontes externas em segundo plano.
        meta = {k: v for k, v in cache.items() if k != "dados"}
        meta["cache"] = True
        meta["stale"] = not cache_ainda_valido(cache)
        return cache["dados"], meta

    try:
        dados = obter_dados()
        if not _tem_dados_validos(dados):
            raise ValueError("Coleta sem leituras válidas")
        novo_cache = salvar_cache_dados(dados)
        meta = {k: v for k, v in novo_cache.items() if k != "dados"}
        meta["cache"] = False
        meta["stale"] = False
        return dados, meta
    except Exception as exc:
        logger.warning("Coleta hidrológica falhou; mantendo último cache válido: %s", exc)
        if cache:
            meta = {k: v for k, v in cache.items() if k != "dados"}
            meta["cache"] = True
            meta["stale"] = True
            meta["erro_ultima_coleta"] = str(exc)
            return cache["dados"], meta
        raise
