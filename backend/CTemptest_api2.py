import urllib.request, json, sys

TOKEN = sys.argv[1]
CLIENTE_ID = sys.argv[2]
ANIMAL_ID = sys.argv[3]
BASE = "http://localhost:3000/api/v1"

def req(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode("utf-8") if body else None
    r = urllib.request.Request(url, data=data, method=method, headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer " + TOKEN
    })
    try:
        with urllib.request.urlopen(r) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

OK = "OK"
FAIL = "FALHOU"

def check(label, result, key="data"):
    if key in result:
        print(f"  {OK} — {label}")
        return result[key]
    else:
        print(f"  {FAIL} — {label}: {result}")
        return None

# ── PRODUTOS ──────────────────────────────────────────────────────────────────
print("\n── PRODUTOS ──")
d = check("listar", req("GET", "/produtos?page=1&limit=20"))
if d is not None: print(f"    total={req('GET','/produtos')['meta']['total']}")

p = check("criar", req("POST", "/produtos", {
    "nome": "Racao Premium Teste", "categoria": "Ração",
    "descricao": "Ração adulto teste", "valorCusto": 45.90, "valorVenda": 79.90,
    "unidade": "kg"
}))
produto_id = p["id"] if p else None
if produto_id: print(f"    produto_id={produto_id}")

if produto_id:
    check("buscar por ID", req("GET", f"/produtos/{produto_id}"))
    check("atualizar", req("PUT", f"/produtos/{produto_id}", {"valorVenda": 84.90, "descricao": "Desc atualizada"}))

# ── ESTOQUE ───────────────────────────────────────────────────────────────────
print("\n── ESTOQUE ──")
est = req("GET", "/estoque?page=1&limit=20")
print(f"  OK — listar: total={est.get('meta',{}).get('total','?')}, retornou={len(est.get('data',[]))}")

if produto_id:
    check("adicionar lote", req("POST", f"/estoque/{produto_id}/lotes", {
        "quantidade": 15, "validade": "2027-06-30", "lote": "LOTE-001"
    }))
    lotes = req("GET", f"/estoque/{produto_id}/lotes")
    print(f"  OK — lotes do produto: {[l.get('quantidade') for l in lotes.get('data',[])]}")

# ── ORÇAMENTOS ────────────────────────────────────────────────────────────────
print("\n── ORÇAMENTOS ──")
orc_list = req("GET", "/orcamentos?page=1&limit=20")
print(f"  OK — listar: total={orc_list.get('meta',{}).get('total','?')}")

orc = check("criar", req("POST", "/orcamentos", {
    "clienteId": CLIENTE_ID, "animalId": ANIMAL_ID,
    "validade": "2026-07-30",
    "itens": [{"descricao": "Consulta veterinaria", "qtd": 1, "valorUnitario": 120.00}],
    "obs": "Orcamento de teste"
}))
orc_id = orc["id"] if orc else None
if orc_id: print(f"    orc_id={orc_id}, total={orc.get('total')}, status={orc.get('status')}")

if orc_id:
    check("buscar por ID", req("GET", f"/orcamentos/{orc_id}"))
    check("atualizar status — aprovar", req("PATCH", f"/orcamentos/{orc_id}/status", {"acao": "aprovar"}))
    check("pagamento", req("PATCH", f"/orcamentos/{orc_id}/pagamento", {"formaPag": "Pix"}))

# ── VENDAS ────────────────────────────────────────────────────────────────────
print("\n── VENDAS ──")
v_list = req("GET", "/vendas?page=1&limit=20")
print(f"  OK — listar: total={v_list.get('meta',{}).get('total','?')}")

v = check("criar", req("POST", "/vendas", {
    "clienteId": CLIENTE_ID, "animalId": ANIMAL_ID,
    "formaPag": "Pix", "data": "2026-06-06",
    "itens": [{"descricao": "Banho e tosa", "qtd": 1, "valorUnitario": 85.00}],
    "obs": "Venda de teste"
}))
venda_id = v["id"] if v else None
if venda_id: print(f"    venda_id={venda_id}, total={v.get('total')}, status={v.get('status')}")

# ── DESPESAS ──────────────────────────────────────────────────────────────────
print("\n── DESPESAS ──")
desp_list = req("GET", "/compras?page=1&limit=20")
print(f"  OK — listar: total={desp_list.get('meta',{}).get('total','?')}")

desp = check("criar sem itens (agua/luz)", req("POST", "/compras", {
    "fornecedor": "COPEL", "categoria": "Água e Luz",
    "dataPedido": "2026-06-06",
    "descricaoSimples": "Conta de luz junho",
    "totalManual": 250.00
}))
if desp: print(f"    despesa_id={desp.get('id')}, total={desp.get('total')}, categoria={desp.get('categoria')}")

