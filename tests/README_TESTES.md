# 🧪 Testes do Projeto Rio Amazonas

Guia de execução de testes para validar a API e os endpoints.

## Testes PowerShell (rápidos)

### `test-endpoints.ps1`
Valida se os servidores (backend e frontend) estão respondendo corretamente.

```powershell
.\test-endpoints.ps1
```

**Valida:**
- Status 200 em `/api/estacoes`
- Status 200 em `/api/dados`
- Status 200 em `/frontend/public/dashboard.html`

---

## Testes Python (completos)

### `tests/test_api.py`
Suite de testes unitários e de integração usando `pytest`.

#### Instalação de dependências:
```powershell
pip install pytest requests
```

#### Executar todos os testes:
```powershell
pytest tests/test_api.py -v
```

#### Executar apenas uma classe de testes:
```powershell
pytest tests/test_api.py::TestEstacionesEndpoint -v
```

#### Executar um teste específico:
```powershell
pytest tests/test_api.py::TestEstacionesEndpoint::test_get_estacoes_status_200 -v
```

---

## Cobertura de Testes

### `TestEstacionesEndpoint`
- ✅ Retorna status 200
- ✅ Estrutura de resposta está correta
- ✅ Todos os municípios do Amazonas presentes, além de Óbidos e Santarém como apoio

### `TestDadosEndpoint`
- ✅ Retorna status 200
- ✅ Resposta é JSON válido
- ✅ Contém dados de todas as estações
- ✅ Estrutura dos dados está correta (dados, fonte, tendencia_mensal)
- ✅ Cada entrada tem data, vazao, cota_m
- ✅ Tipos de dados são válidos
- ✅ Há conteúdo (fallback ou API)

### `TestCORSHeaders`
- ✅ Header `Access-Control-Allow-Origin` presente
- ✅ Header `Access-Control-Allow-Methods` presente

### `test_integration_flow`
- ✅ Fluxo completo: obtém estações → obtém dados → valida consistência

---

## Sequência de execução recomendada

1. **Terminal 1 - Backend:**
   ```powershell
   .\start-backend.ps1
   ```

2. **Terminal 2 - Frontend (estático):**
   ```powershell
   .\start-frontend.ps1
   ```

3. **Terminal 3 - Teste rápido:**
   ```powershell
   .\test-endpoints.ps1
   ```

4. **Terminal 3 - Teste completo (após confirmar endpoints respondendo):**
   ```powershell
   pytest tests/test_api.py -v
   ```

---

## Saída esperada

### PowerShell test-endpoints.ps1:
```
Testando endpoints...
http://localhost:5000/api/estacoes -> 200
http://localhost:5000/api/dados -> 200
http://localhost:8000/frontend/public/dashboard.html -> 200
```

### pytest tests/test_api.py:
```
tests/test_api.py::TestEstacionesEndpoint::test_get_estacoes_status_200 PASSED
tests/test_api.py::TestEstacionesEndpoint::test_get_estacoes_response_format PASSED
tests/test_api.py::TestEstacionesEndpoint::test_get_estacoes_has_required_stations PASSED
tests/test_api.py::TestDadosEndpoint::test_get_dados_status_200 PASSED
...
======================== 12 passed in 0.42s ========================
```

---

## Troubleshooting

| Erro | Solução |
|------|---------|
| `Connection refused` | Verifique se backend está rodando em 5000 e frontend em 8000 |
| `ModuleNotFoundError: pytest` | Execute `pip install pytest requests` |
| `CORS error no navegador` | Confirme que backend está respondendo com `.\test-endpoints.ps1` |
| `Test failed: estação não encontrada` | Verifique se arquivo `fallback.json` existe em `backend/data/` |
