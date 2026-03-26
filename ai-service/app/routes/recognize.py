from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from app.models.schemas import FaceEncodeRequest, FaceEncodeResponse
from app.utils.preprocess import decode_base64_image
from app.services.embedding_service import EmbeddingService
from app.config.db import execute_query

router = APIRouter()

@router.post("/encode", response_model=FaceEncodeResponse)
async def encode_face(request: Request, body: FaceEncodeRequest):
    embedding_service = EmbeddingService(request.app.state.face_service)
    
    success = await embedding_service.process_employee_photo(
        body.image_base64, 
        body.employee_id, 
        body.company_id
    )
    
    if success:
        return FaceEncodeResponse(
            success=True,
            employee_id=body.employee_id,
            message="Face encoded and saved successfully"
        )
    else:
        return FaceEncodeResponse(
            success=False,
            employee_id=body.employee_id,
            message="No face detected or failed to save"
        )

@router.post("/identify")
async def identify_face(request: Request, data: dict):
    image_base64 = data.get("image_base64")
    company_id = data.get("company_id")
    
    if not image_base64 or not company_id:
        raise HTTPException(status_code=400, detail="Missing image or company ID")
        
    frame = decode_base64_image(image_base64)
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image")
        
    face_service = request.app.state.face_service
    embedding = face_service.encode_face(frame)
    
    if embedding is None:
        return {"success": False, "message": "No face found"}
        
    match = face_service.recognize_face(embedding, company_id)
    if match:
        return {"success": True, "match": match}
    else:
        return {"success": False, "message": "Unknown person"}

@router.get("/embeddings/{company_id}")
async def get_embeddings_count(company_id: str):
    query = """
    SELECT COUNT(*) as count 
    FROM face_embeddings fe
    JOIN employees e ON fe.employee_id = e.id::varchar
    WHERE e.company_id = %s
    """
    results = execute_query(query, (company_id,))
    count = results[0]['count'] if results else 0
    return {"company_id": company_id, "embeddings_count": count}