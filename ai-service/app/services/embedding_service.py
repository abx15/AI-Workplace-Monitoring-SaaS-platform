import base64
import cv2
import numpy as np
from app.services.face_service import FaceService
from app.config.db import execute_query

class EmbeddingService:
    def __init__(self, face_service: FaceService):
        self.face_service = face_service

    async def process_employee_photo(self, image_base64: str, employee_id: str, company_id: str) -> bool:
        """Decode base64, encode face, and save embedding"""
        try:
            # Remove data URI prefix if present
            if "," in image_base64:
                image_base64 = image_base64.split(",")[1]
            
            image_data = base64.b64decode(image_base64)
            np_arr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if image is None:
                print("Failed to decode image")
                return False

            embedding = self.face_service.encode_face(image)
            if embedding is not None:
                self.face_service.save_embedding(employee_id, embedding)
                return True
            
            return False
        except Exception as e:
            print(f"Error processing employee photo: {e}")
            return False

    def get_all_embeddings(self, company_id: str) -> list:
        """Fetch all face embeddings for a company"""
        query = """
        SELECT e.id, e.name, e.employee_id as emp_id
        FROM face_embeddings fe
        JOIN employees e ON fe.employee_id = e.id::varchar
        WHERE e.company_id = %s
        """
        results = execute_query(query, (company_id,))
        return results if results else []