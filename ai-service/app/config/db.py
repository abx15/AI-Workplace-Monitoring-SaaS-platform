import os
import psycopg2
from psycopg2.extras import RealDictCursor
from pgvector.psycopg2 import register_vector
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader
import numpy as np
import cv2
from dotenv import load_dotenv

load_dotenv()

# Neon DB (PostgreSQL)
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")

def get_neon_connection():
    try:
        conn = psycopg2.connect(NEON_DATABASE_URL)
        register_vector(conn)
        return conn
    except Exception as e:
        print(f"Error connecting to Neon DB: {e}")
        return None

def execute_query(query, params=None):
    conn = get_neon_connection()
    if not conn:
        return None
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            if query.strip().upper().startswith("SELECT"):
                result = cur.fetchall()
            else:
                conn.commit()
                result = True
            return result
    except Exception as e:
        print(f"Query execution error: {e}")
        return None
    finally:
        conn.close()

# MongoDB
MONGODB_URI = os.getenv("MONGODB_URI")
mongo_client = None
db = None

def get_mongo_db():
    global mongo_client, db
    if db is None:
        try:
            mongo_client = MongoClient(MONGODB_URI)
            db = mongo_client.get_database()
            print("Connected to MongoDB ✅")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
    return db

# Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_screenshot(image_array: np.ndarray):
    try:
        _, buffer = cv2.imencode('.jpg', image_array)
        res = cloudinary.uploader.upload(buffer.tobytes())
        return res.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None

def test_connections():
    print("Testing connections...")
    neon_conn = get_neon_connection()
    if neon_conn:
        print("Neon DB connected ✅")
        neon_conn.close()
    
    mongo_db = get_mongo_db()
    if mongo_db is not None:
        print("MongoDB connected ✅")
    
    print("Cloudinary configured ✅")

if __name__ == "__main__":
    test_connections()