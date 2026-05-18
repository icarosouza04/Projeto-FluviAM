"""
tests/test_api.py
Testes da API FastAPI para validação de endpoints e funcionalidades.
"""

import json
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from backend.server import app

client = TestClient(app)


class TestEstacionesEndpoint:
    """Testes do endpoint /api/estacoes"""

    def test_get_estacoes_status_200(self):
        """Verifica se endpoint retorna status 200"""
        resp = client.get('/api/estacoes')
        assert resp.status_code == 200

    def test_get_estacoes_response_format(self):
        """Verifica se resposta contém estrutura esperada"""
        resp = client.get('/api/estacoes')
        data = resp.json()
        assert 'estacoes' in data
        assert isinstance(data['estacoes'], list)

    def test_get_estacoes_has_required_stations(self):
        """Verifica se todas as estações obrigatórias estão presentes"""
        resp = client.get('/api/estacoes')
        estacoes = resp.json()['estacoes']
        required = ['Alvarães', 'Manaus', 'Itacoatiara', 'Parintins', 'Tefé', 'Urucurituba', 'Óbidos', 'Santarém']
        for est in required:
            assert est in estacoes, f'Estação {est} não encontrada'


class TestDadosEndpoint:
    """Testes do endpoint /api/dados"""

    def test_get_dados_status_200(self):
        """Verifica se endpoint retorna status 200"""
        resp = client.get('/api/dados')
        assert resp.status_code == 200

    def test_get_dados_response_is_json(self):
        """Verifica se resposta é JSON válido"""
        resp = client.get('/api/dados')
        data = resp.json()
        assert isinstance(data, dict)

    def test_get_dados_contains_all_stations(self):
        """Verifica se resposta contém dados de todas as estações"""
        resp = client.get('/api/estacoes')
        estacoes = resp.json()['estacoes']
        
        resp_dados = client.get('/api/dados')
        dados = resp_dados.json()
        
        for est in estacoes:
            assert est in dados, f'Estação {est} não tem dados'

    def test_get_dados_structure(self):
        """Verifica estrutura dos dados retornados"""
        resp = client.get('/api/dados')
        dados = resp.json()
        
        for estacao, info in dados.items():
            assert 'dados' in info, f'{estacao}: falta key "dados"'
            assert 'fonte' in info, f'{estacao}: falta key "fonte"'
            assert 'tendencia_mensal' in info, f'{estacao}: falta key "tendencia_mensal"'
            assert 'municipio' in info, f'{estacao}: falta key "municipio"'
            assert 'rio' in info, f'{estacao}: falta key "rio"'
            assert 'lat' in info and 'lon' in info, f'{estacao}: falta coordenada'
            
            # Validar fonte
            assert info['fonte'] in ['api', 'fallback', 'ana', 'sace', 'open-meteo', 'sem-sace', 'sace-vazio'], f'{estacao}: fonte inválida'
            
            # Validar estrutura dos dados
            assert isinstance(info['dados'], list), f'{estacao}: dados não é lista'
            assert isinstance(info['tendencia_mensal'], dict), f'{estacao}: tendencia_mensal não é dict'

    def test_get_dados_entries_format(self):
        """Verifica formato de cada entrada de dados"""
        resp = client.get('/api/dados')
        dados = resp.json()
        
        for estacao, info in dados.items():
            for entry in info['dados']:
                assert 'data' in entry, f'{estacao}: entry falta data'
                assert 'vazao' in entry, f'{estacao}: entry falta vazao'
                assert 'cota_m' in entry, f'{estacao}: entry falta cota_m'
                
                # Validar tipos
                assert isinstance(entry['data'], str), f'{estacao}: data não é string'
                if entry['vazao'] is not None:
                    assert isinstance(entry['vazao'], (int, float)), f'{estacao}: vazao tipo inválido'
                if entry['cota_m'] is not None:
                    assert isinstance(entry['cota_m'], (int, float)), f'{estacao}: cota_m tipo inválido'

    def test_get_dados_has_content(self):
        """Verifica se há pelo menos dados de fallback presentes"""
        resp = client.get('/api/dados')
        dados = resp.json()
        
        total_entries = sum(len(info['dados']) for info in dados.values())
        assert total_entries > 0, 'Nenhum dado retornado'


class TestCORSHeaders:
    """Testes de headers CORS"""

    def test_cors_allow_origin_header(self):
        """Verifica se o header Access-Control-Allow-Origin está presente"""
        resp = client.options('/api/estacoes', headers={
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'GET',
        })
        assert 'access-control-allow-origin' in resp.headers

    def test_cors_allow_methods_header(self):
        """Verifica se o header Access-Control-Allow-Methods está presente"""
        resp = client.options('/api/estacoes', headers={
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'GET',
        })
        assert 'access-control-allow-methods' in resp.headers


def test_integration_flow():
    """Teste de fluxo completo: estações -> dados"""
    # 1. Obter lista de estações
    resp_est = client.get('/api/estacoes')
    assert resp_est.status_code == 200
    estacoes = resp_est.json()['estacoes']
    assert len(estacoes) > 0
    
    # 2. Obter dados
    resp_dados = client.get('/api/dados')
    assert resp_dados.status_code == 200
    dados = resp_dados.json()
    
    # 3. Validar consistência
    for est in estacoes:
        assert est in dados, f'Estação {est} em estacoes mas não em dados'
        assert 'dados' in dados[est]
        assert 'fonte' in dados[est]


if __name__ == '__main__':
    # Rodando testes com pytest
    pytest.main([__file__, '-v', '--tb=short'])
