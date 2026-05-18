import asyncio
import logging
from datetime import date, timedelta
from typing import Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.src.main import calcular_tendencia_mensal
from backend.src.dados_cache import obter_dados_cacheados, carregar_cache_dados
from backend.src.config import ESTACOES, DADOS_INTERVALO_HORAS, obter_metadata_estacao, METADADOS_ESTACOES, MUNICIPIOS_MONITORADOS_AMAZONAS, ESTACOES_APOIO_FORA_AM
# ← NOVO: importa busca horária do SACE
from backend.src.api import buscar_cota_sace_horaria
from backend.src.alertas_integrados import fontes_alerta_status, coletar_alertas_integrados

logger = logging.getLogger(__name__)

app = FastAPI(title="Rio Amazonas API")


async def _coleta_periodica_2h():
    """Atualiza dados e alertas em segundo plano a cada 2 horas."""
    intervalo = max(1, DADOS_INTERVALO_HORAS) * 60 * 60
    while True:
        await asyncio.sleep(intervalo)
        try:
            await asyncio.to_thread(obter_dados_cacheados, True)
            await asyncio.to_thread(coletar_alertas_integrados, True)
            logger.info("Coleta periódica de 2h concluída com sucesso.")
        except Exception as exc:
            logger.warning("Coleta periódica de 2h falhou; cache anterior será mantido: %s", exc)


@app.on_event("startup")
async def iniciar_coleta_periodica():
    asyncio.create_task(_coleta_periodica_2h())


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dados")
async def get_dados(
    estacao: Optional[str] = None,
    dias: Optional[int] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    force: bool = False
):
    resultado, meta_cache = obter_dados_cacheados(forcar=force)

    if estacao:
        if estacao not in resultado:
            raise HTTPException(status_code=404, detail=f"Estação '{estacao}' não encontrada")
        resultados = {estacao: resultado[estacao]}
    else:
        resultados = resultado

    def filtrar_entrada(registro):
        if not registro:
            return registro
        dados = registro.get('dados', [])
        if not dados:
            return registro

        end_date = None
        start_date = None

        if dias is not None and dias > 0:
            end_date = date.today()
            start_date = end_date - timedelta(days=dias - 1)

        if data_inicio is not None:
            start_date = data_inicio if start_date is None else min(start_date, data_inicio)

        if data_fim is not None:
            end_date = data_fim if end_date is None else max(end_date, data_fim)

        if start_date or end_date:
            filtrado = []
            for item in dados:
                try:
                    item_date = date.fromisoformat(item.get('data'))
                except Exception:
                    continue
                if start_date and item_date < start_date:
                    continue
                if end_date and item_date > end_date:
                    continue
                filtrado.append(item)
            dados = filtrado

        df = pd.DataFrame(dados) if dados else pd.DataFrame()
        saida = {k: v for k, v in registro.items() if k not in ('dados', 'tendencia_mensal')}
        saida.update({
            'dados': dados,
            'fonte': registro.get('fonte', 'desconhecido'),
            'tendencia_mensal': calcular_tendencia_mensal(df) if not df.empty else {}
        })
        return saida

    for nome, registro in list(resultados.items()):
        resultados[nome] = filtrar_entrada(registro)

    return resultados


@app.get("/api/dados/cache-info")
async def get_dados_cache_info():
    """Retorna metadados do cache hidrológico usado pela tela e pelo ticker."""
    cache = carregar_cache_dados()
    if not cache:
        return {"cache_disponivel": False}
    return {k: v for k, v in cache.items() if k != "dados"} | {"cache_disponivel": True}


# ── NOVO: cota atual em tempo real (últimas 48h, leitura a cada 15min) ────────
@app.get("/api/dados/tempo-real")
async def get_tempo_real(estacao: Optional[str] = None, horas: int = 48):
    """
    Retorna leituras horárias direto do SACE (não agrega por dia).
    Ideal para mostrar a cota atual e variação recente no dashboard.
    """
    estacoes_alvo = {}

    if estacao:
        if estacao not in ESTACOES:
            raise HTTPException(status_code=404, detail=f"Estação '{estacao}' não encontrada")
        estacoes_alvo = {estacao: ESTACOES[estacao]}
    else:
        estacoes_alvo = ESTACOES

    resposta = {}
    for nome, cfg in estacoes_alvo.items():
        if not cfg.get("sace_bacia") or cfg.get("sace_pm") is None:
            resposta[nome] = {**obter_metadata_estacao(nome, cfg), "dados": [], "fonte": "sem-sace"}
            continue

        df = buscar_cota_sace_horaria(cfg["sace_bacia"], cfg["sace_pm"], horas=horas)

        if df.empty:
            resposta[nome] = {**obter_metadata_estacao(nome, cfg), "dados": [], "fonte": "sace-vazio"}
            continue

        leituras = [
            {
                "data_hora": row["data_hora"].isoformat(),
                "cota_m":    round(row["cota_m"], 2),
            }
            for _, row in df.iterrows()
        ]

        # Cota mais recente = última leitura
        cota_atual = leituras[-1]["cota_m"] if leituras else None

        resposta[nome] = {
            **obter_metadata_estacao(nome, cfg),
            "cota_atual": cota_atual,
            "dados":      leituras,
            "fonte":      "sace",
        }

    return resposta




@app.get("/api/fontes-alerta")
async def get_fontes_alerta():
    """Retorna as bases integradas e se precisam de credenciais."""
    return fontes_alerta_status()


@app.get("/api/alertas-integrados")
async def get_alertas_integrados(force: bool = False):
    """Retorna alertas consolidados. Por padrão usa cache com janela de 2 horas."""
    return coletar_alertas_integrados(forcar=force)


@app.post("/api/alertas-integrados/coletar")
async def post_coletar_alertas_integrados():
    """Força uma nova coleta das fontes integradas."""
    return coletar_alertas_integrados(forcar=True)


@app.get("/api/estacoes")
async def get_estacoes():
    return {
        "estacoes": list(ESTACOES.keys()),
        "total": len(ESTACOES),
        "municipios_amazonas": MUNICIPIOS_MONITORADOS_AMAZONAS,
        "total_municipios_amazonas": len(MUNICIPIOS_MONITORADOS_AMAZONAS),
        "estacoes_apoio_fora_am": sorted(ESTACOES_APOIO_FORA_AM),
        "metadata": METADADOS_ESTACOES,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
