import os
import cv2
import numpy as np
from insightface.app import FaceAnalysis
from app.config.db import execute_query, get_neon_connection
from pgvector.psycopg2 import register_vector
import psycopg2

class FaceService:
    def __init__(self):
        # Load InsightFace model (buffalo_l)
        # ctx_id=0 for CPU, use gpu_id=0 if GPU is available
        self.app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        self.threshold = 0.5
        self._init_db()

    def _init_db(self):
        """Initialize face_embeddings table if not exists"""
        create_table_query = """
        CREATE EXTENSION IF NOT EXISTS vector;
        CREATE TABLE IF NOT EXISTS face_embeddings (
            id SERIAL PRIMARY KEY,
            employee_id VARCHAR(255) NOT NULL,
            embedding vector(512),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(employee_id)
        );
        """
        execute_query(create_table_query)

    def encode_face(self, image: np.ndarray) -> np.ndarray:
        """Detect faces in image and return 512-dim embedding"""
        faces = self.app.get(image)
        if not faces:
            return None
        
        # Return embedding of the largest face
        face = max(faces, key=lambda x: (x.bbox[2]-x.bbox[0]) * (x.bbox[3]-x.bbox[1]))
        embedding = face.normed_embedding
        return embedding

    def save_embedding(self, employee_id: str, embedding: np.ndarray):
        """Save to Neon DB face_embeddings table"""
        # Convert numpy array to pgvector format
        embedding_list = embedding.tolist()
        
        # Delete old embedding if exists (upsert logic)
        query = """
        INSERT INTO face_embeddings (employee_id, embedding)
        VALUES (%s, %s::vector)
        ON CONFLICT (employee_id) 
        DO UPDATE SET embedding = EXCLUDED.embedding, created_at = CURRENT_TIMESTAMP;
        """
        execute_query(query, (employee_id, embedding_list))

    def recognize_face(self, embedding: np.ndarray, company_id: str, threshold: float = 0.6) -> dict:
        """Query Neon DB for the closest match"""
        embedding_list = embedding.tolist()
        
        # Updated query to match the requirements
        # Note: We need the employee's name and emp_id from the 'employees' table
        query = """
        SELECT e.id, e.name, e.employee_id as emp_id,
               1 - (fe.embedding <=> %s::vector) as similarity
        FROM face_embeddings fe
        JOIN employees e ON fe.employee_id = e.id::varchar
        WHERE e.company_id = %s
        ORDER BY similarity DESC
        LIMIT 1
        """
        results = execute_query(query, (embedding_list, company_id))
        
        if results and results[0]['similarity'] >= threshold:
            return results[0]
        
        return None

    def process_frame_faces(self, frame: np.ndarray, company_id: str) -> list:
        """Detect and recognize all faces in a frame"""
        faces = self.app.get(frame)
        results = []
        
        for face in faces:
            bbox = face.bbox.astype(int).tolist() # [x1, y1, x2, y2]
            embedding = face.normed_embedding
            
            # Convert [x1, y1, x2, y2] to {x, y, w, h}
            bbox_dict = {
                "x": bbox[0],
                "y": bbox[1],
                "w": bbox[2] - bbox[0],
                "h": bbox[3] - bbox[1]
            }
            
            match = self.recognize_face(embedding, company_id)
            
            results.append({
                "bbox": bbox_dict,
                "match": match, # Contains id, name, emp_id, similarity
                "confidence": float(face.det_score)
            })
            
        return results