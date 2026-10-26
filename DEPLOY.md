# Зерттеуші Оқушы Платформасы — Дайын өнім

## 1-қадам: Backend-ті Render-ге шығару (5 минут)

1. [render.com](https://render.com) сайтына кіріп, Google немесе GitHub арқылы тіркеліңіз.
2. **New → Web Service** басыңыз.
3. **Public Git repository** орнына бұл жобаны жүктеңіз немесе GitHub-қа жүктеп, содан қосыңыз.
4. Параметрлер:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables** қосыңыз (қаласаңыз):
   - `OPENAI_API_KEY` = сіздің кілтіңіз
6. **Create Web Service** басыңыз.

Render сізге `https://сіздің-атауыңыз.onrender.com` сілтемесін береді. Оны есте сақтаңыз.

## 2-қадам: Frontend-ті Vercel-ге шығару

1. [vercel.com](https://vercel.com) сайтына кіріп, тіркеліңіз.
2. **Add New → Project** → жобаны жүктеңіз.
3. **Root Directory**: `frontend` деп көрсетіңіз.
4. Environment Variable қосыңыз:
   - `REACT_APP_API_URL` = Render-ден алған сілтемеңіз (мысалы: `https://researcher.onrender.com`)
5. Deploy басыңыз.

## 3-қадам: Frontend-те API мекенжайын өзгерту

`frontend/src/App.js` файлындағы мына жолды өзгертіңіз:

```js
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

Содан кейін қайта deploy етіңіз.

## ЖИ қосу (міндетті емес)
Render-дегі Environment Variables-қа қосыңыз:
- `OPENAI_API_KEY` немесе `GROQ_API_KEY`

## Тесттік аккаунттар
Тіркелгеннен кейін өзіңіз оқушы және мұғалім аккаунтын жасай аласыз.

---

**Ескерту**: Render тегін жоспарында сервер 15 минут әрекетсіз болса, ұйықтап қалады. Бірінші кіргенде 30-50 секунд күтуіңіз мүмкін.
