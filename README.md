# StudyGabi — Deploy no Railway

Um único repositório com **Python (FastAPI) + React (Vite)**.
O Python builda o React e serve tudo em uma URL só. 🚀

---

## Como publicar no Railway

### 1. Prepare o repositório no GitHub

```bash
git init
git add .
git commit -m "StudyGabi inicial"
# Crie um repositório no GitHub e siga as instruções dele
git remote add origin https://github.com/SEU_USUARIO/studygabi.git
git push -u origin main
```

### 2. Crie o projeto no Railway

1. Acesse railway.app e faça login com o GitHub
2. Clique em New Project → Deploy from GitHub repo
3. Selecione o repositório studygabi
4. O Railway detecta o nixpacks.toml e faz tudo automaticamente

### 3. Configure as variáveis de ambiente

No painel do Railway → Variables:

| Variável           | Valor                          |
|--------------------|-------------------------------|
| ANTHROPIC_API_KEY  | sk-ant-... (sua chave)        |
| SECRET_KEY         | qualquer string longa aleatória |

O Railway injeta PORT automaticamente.

### 4. Banco de dados persistente

Para o SQLite não perder dados entre deploys:
1. Railway → Add Service → Volume
2. Monte em /app/data
3. Adicione a variável: DATABASE_URL = sqlite:////app/data/studygabi.db

### 5. Pronto!

URL no formato: https://studygabi-production-xxxx.up.railway.app

---

## Desenvolvimento local

Backend:
  pip install -r requirements.txt
  python main.py    → http://localhost:8000

Frontend (outro terminal):
  cd frontend
  npm install
  npm run dev       → http://localhost:5173
