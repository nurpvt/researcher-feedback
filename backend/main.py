from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import sqlite3
import uuid
import os
import shutil
from pathlib import Path

app = FastAPI(title="Зерттеуші Оқушы Платформасы")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Конфигурация ---
SECRET_KEY = "researcher-student-secret-key-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Дерекқор ---
def get_db():
    conn = sqlite3.connect("researcher.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        password_hash TEXT,
        role TEXT,
        grade TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        student_id TEXT,
        title TEXT,
        description TEXT,
        status TEXT,
        created_at TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS diary_entries (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        content TEXT,
        created_at TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        title TEXT,
        status TEXT,
        assigned_by TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        filename TEXT,
        filepath TEXT,
        uploaded_at TEXT
    )''')
    conn.commit()
    conn.close()

init_db()

# --- Модельдер ---
class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role: str = "student"
    grade: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    grade: Optional[str] = None

class ProjectCreate(BaseModel):
    title: str
    description: str

class ProjectOut(BaseModel):
    id: str
    student_id: str
    title: str
    description: str
    status: str
    created_at: str

class DiaryCreate(BaseModel):
    project_id: str
    content: str

class TaskCreate(BaseModel):
    project_id: str
    title: str
    assigned_by: str = "мұғалім"

# --- Auth ---
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=401, detail="Жарамсыз токен")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if user is None:
        raise credentials_exception
    return dict(user)

# --- API ---
@app.post("/register", response_model=UserOut)
def register(user: UserCreate):
    conn = get_db()
    user_id = str(uuid.uuid4())
    hashed = get_password_hash(user.password)
    try:
        conn.execute(
            "INSERT INTO users (id, email, name, password_hash, role, grade) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, user.email, user.name, hashed, user.role, user.grade)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Бұл email бұрын тіркелген")
    finally:
        conn.close()
    return UserOut(id=user_id, email=user.email, name=user.name, role=user.role, grade=user.grade)

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (form_data.username,)).fetchone()
    conn.close()
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email немесе құпия сөз қате")
    token = create_access_token({"sub": user["id"]})
    return {"access_token": token, "token_type": "bearer", "role": user["role"], "name": user["name"]}

@app.get("/me", response_model=UserOut)
def read_me(current_user: dict = Depends(get_current_user)):
    return UserOut(**current_user)

@app.post("/projects", response_model=ProjectOut)
def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Тек оқушы жоба жасай алады")
    conn = get_db()
    pid = str(uuid.uuid4())
    created = datetime.now().isoformat()
    conn.execute(
        "INSERT INTO projects (id, student_id, title, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (pid, current_user["id"], project.title, project.description, "басталуда", created)
    )
    conn.commit()
    conn.close()
    return ProjectOut(id=pid, student_id=current_user["id"], title=project.title, 
                      description=project.description, status="басталуда", created_at=created)

@app.get("/projects", response_model=List[ProjectOut])
def list_my_projects(current_user: dict = Depends(get_current_user)):
    conn = get_db()
    if current_user["role"] == "student":
        rows = conn.execute("SELECT * FROM projects WHERE student_id = ?", (current_user["id"],)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM projects").fetchall()
    conn.close()
    return [ProjectOut(**dict(r)) for r in rows]

@app.post("/diary")
def add_diary(entry: DiaryCreate, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    eid = str(uuid.uuid4())
    created = datetime.now().isoformat()
    conn.execute(
        "INSERT INTO diary_entries (id, project_id, content, created_at) VALUES (?, ?, ?, ?)",
        (eid, entry.project_id, entry.content, created)
    )
    conn.commit()
    conn.close()
    return {"id": eid, "content": entry.content, "created_at": created}

@app.get("/diary/{project_id}")
def get_diary(project_id: str, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute("SELECT * FROM diary_entries WHERE project_id = ? ORDER BY created_at DESC", (project_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/tasks")
def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    tid = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO tasks (id, project_id, title, status, assigned_by) VALUES (?, ?, ?, ?, ?)",
        (tid, task.project_id, task.title, "күтуде", task.assigned_by)
    )
    conn.commit()
    conn.close()
    return {"id": tid, "title": task.title, "status": "күтуде"}

@app.get("/tasks/{project_id}")
def get_tasks(project_id: str):
    conn = get_db()
    rows = conn.execute("SELECT * FROM tasks WHERE project_id = ?", (project_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/upload/{project_id}")
async def upload_file(project_id: str, file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    file_id = str(uuid.uuid4())
    ext = Path(file.filename).suffix
    save_name = f"{file_id}{ext}"
    save_path = UPLOAD_DIR / save_name
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    conn = get_db()
    conn.execute(
        "INSERT INTO files (id, project_id, filename, filepath, uploaded_at) VALUES (?, ?, ?, ?, ?)",
        (file_id, project_id, file.filename, str(save_path), datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    return {"filename": file.filename, "id": file_id}

@app.get("/files/{project_id}")
def list_files(project_id: str):
    conn = get_db()
    rows = conn.execute("SELECT id, filename, uploaded_at FROM files WHERE project_id = ?", (project_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/ai/chat")
def ai_chat(data: dict, current_user: dict = Depends(get_current_user)):
    # API кілті болса, мұнда OpenAI/Groq шақырылады
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY")
    if not api_key:
        return {
            "reply": "ЖИ қосылмаған. .env файлына OPENAI_API_KEY немесе GROQ_API_KEY қойыңыз.",
            "status": "no_key"
        }
    # Нақты интеграция орны (мысал)
    return {
        "reply": f"Сіздің сұрағыңыз: «{data.get('message', '')}». ЖИ кеңесі: зерттеу сұрағын нақтылаңыз және кем дегенде 3 дереккөз табыңыз.",
        "status": "ok"
    }

@app.get("/")
def root():
    return {"message": "Зерттеуші Оқушы Платформасы жұмыс істеп тұр"}
