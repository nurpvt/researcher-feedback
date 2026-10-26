# Зерттеуші Оқушы Платформасы

Толық функционалды MVP: тіркелу, кіру, жобалар, күнделік, тапсырмалар, файл жүктеу, ЖИ орны.

## Іске қосу

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Сайт: http://localhost:3000

## ЖИ қосу
`backend` қалтасында `.env` файлын жасаңыз:
```
OPENAI_API_KEY=сіздің_кілтіңіз
```
немесе
```
GROQ_API_KEY=сіздің_кілтіңіз
```

## Мүмкіндіктер
- Оқушы / Мұғалім тіркелу және кіру (JWT)
- Жоба құру және бақылау
- Зерттеу күнделігі
- Тапсырмалар
- Файл жүктеу
- ЖИ чат (кілт болғанда)
- SQLite дерекқор (автоматты құрылады)

## Хостингке шығару
Толық нұсқаулық `DEPLOY.md` файлында бар.  
Қысқаша: Backend → Render, Frontend → Vercel.
