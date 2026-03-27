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
import dns.resolver
import time

# GLOBAL DNS FIX - Apply Google DNS servers
try:
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4']
except AttributeError:
    # Fallback if default_resolver is None
    resolver = dns.resolver.Resolver()
    resolver.nameservers = ['8.8.8.8', '8.8.4.4']
    dns.resolver.default_resolver = resolver

load_dotenv()

# Neon DB (PostgreSQL)
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")

def get_neon_connection():
    try:
        if not NEON_DATABASE_URL:
            raise ValueError("NEON_DATABASE_URL not found in environment variables")
        
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

def connect_mongodb_with_retry(uri: str, max_retries: int = 3):
    """Connect to MongoDB with retry logic and fallback"""
    global mongo_client, db
    
    for attempt in range(1, max_retries + 1):
        try:
            print(f"🔗 MongoDB connection attempt {attempt}/{max_retries}...")
            
            mongo_client = MongoClient(uri, serverSelectionTimeoutMS=30000)
            db = mongo_client.get_database()
            
            # Test connection with ping
            db.command('ping')
            print("✅ MongoDB Connected")
            return True
            
        except Exception as e:
            print(f"❌ MongoDB connection attempt {attempt} failed: {str(e)}")
            
            if attempt == max_retries:
                # Try fallback to non-SRV if SRV failed
                if "querySrv" in str(e) or "ENOTFOUND" in str(e):
                    print("🔄 SRV resolution failed, attempting non-SRV fallback...")
                    try:
                        fallback_uri = uri.replace('mongodb+srv://', 'mongodb://')
                        mongo_client = MongoClient(fallback_uri, serverSelectionTimeoutMS=30000)
                        db = mongo_client.get_database()
                        
                        # Test fallback connection
                        db.command('ping')
                        print("✅ MongoDB Connected via fallback (non-SRV)")
                        return True
                    except Exception as fallback_error:
                        print(f"❌ MongoDB fallback also failed: {fallback_error}")
                        return False
                else:
                    return False
            
            # Wait before retry
            time.sleep(2 * attempt)
    
    return False

def get_mongo_db():
    global mongo_client, db
    if db is None:
        if not MONGODB_URI:
            print("❌ MONGODB_URI not found in environment variables")
            return None
            
        if connect_mongodb_with_retry(MONGODB_URI):
            return db
        else:
            print("❌ Failed to connect to MongoDB after all attempts")
            return None
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