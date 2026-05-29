from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import Base, engine, get_db
from models import User, Post
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials = True,
    allow_origins = ["http://localhost:5173"],
    allow_headers = ["*"],
    allow_methods = ["*"]
)

#create tables on startup
Base.metadata.create_all(bind = engine)

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES'))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated = "auto")

class UserSignup(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PostCreate(BaseModel):
    title: str
    content: str

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp" : expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

security = HTTPBearer()
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
@app.post("/signup")
def signup(data: UserSignup, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=401, detail="Email already registered")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=401, detail="Username already taken")
    
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message" : "Account Created Successfully"}

@app.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(plain=data.password, hashed=user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token({"sub" : user.email})
    return {
        "access_token" : token,
        "token_type" : "bearer",
        "username" : user.username
    }

@app.post("/posts", response_model=PostResponse)
def create_post(data: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = Post(title = data.title, content = data.content, owner_id = current_user.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@app.get("/posts", response_model=list[PostResponse])
def get_posts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Post).filter(Post.owner_id == current_user.id).order_by(Post.created_at.desc()).all()

@app.get("/me")
def get_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_posts = db.query(Post).filter(Post.owner_id == current_user.id).count()
    return {
        "username": current_user.username,
        "email": current_user.email,
        "created_at": current_user.created_at,
        "total_posts": total_posts
    }

@app.put("/posts/{post_id}", response_model=PostResponse)
def edit_post(post_id: int, data: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.owner_id == current_user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.title = data.title
    post.content = data.content
    db.commit()
    db.refresh(post)
    return post

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id, Post.owner_id == current_user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted"}