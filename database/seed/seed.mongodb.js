// Document 1
db.ai_logs.insertOne({
  "company_id": "c1111111-1111-1111-1111-111111111111",
  "camera_id": "cam1111-1111-1111-1111-111111111111",
  "timestamp": new Date(),
  "frame_number": 1250,
  "detections": [
    {
      "person_id": "p001",
      "employee_id": "emp1111-1111-1111-1111-111111111111",
      "name": "Suresh Kumar",
      "status": "active",
      "confidence": 0.94,
      "bbox": { "x": 120, "y": 80, "w": 80, "h": 160 }
    },
    {
      "person_id": "p002",
      "employee_id": "emp2222-2222-2222-2222-222222222222",
      "name": "Anjali Verma",
      "status": "idle",
      "confidence": 0.87,
      "bbox": { "x": 320, "y": 90, "w": 75, "h": 155 }
    }
  ],
  "total_persons": 2,
  "processing_time_ms": 145
});

// Document 2
db.ai_logs.insertOne({
  "company_id": "c1111111-1111-1111-1111-111111111111",
  "camera_id": "cam2222-2222-2222-2222-222222222222",
  "timestamp": new Date(Date.now() - 3600000),
  "frame_number": 890,
  "detections": [
    {
      "person_id": "p003",
      "employee_id": "emp3333-3333-3333-3333-333333333333",
      "name": "Mohammed Ali",
      "status": "sleeping",
      "confidence": 0.91,
      "bbox": { "x": 200, "y": 150, "w": 90, "h": 170 }
    }
  ],
  "total_persons": 1,
  "processing_time_ms": 132
});

// detection_events collection
db.detection_events.insertOne({
  "company_id": "c1111111-1111-1111-1111-111111111111",
  "camera_id": "cam1111-1111-1111-1111-111111111111",
  "employee_id": "emp1111-1111-1111-1111-111111111111",
  "event_type": "idle",
  "duration_seconds": 1800,
  "start_time": new Date(Date.now() - 7200000),
  "end_time": new Date(Date.now() - 5400000),
  "metadata": { "location": "Production Floor A" }
});
