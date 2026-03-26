### Collection 1: ai_logs
{
  _id: ObjectId,
  company_id: string,
  camera_id: string,
  timestamp: Date,
  frame_number: number,
  detections: [
    {
      person_id: string,
      employee_id: string | null,
      name: string,
      status: "active" | "idle" | "sleeping",
      confidence: number,
      bbox: { x: number, y: number, w: number, h: number }
    }
  ],
  total_persons: number,
  processing_time_ms: number
}

### Collection 2: detection_events
{
  _id: ObjectId,
  company_id: string,
  camera_id: string,
  employee_id: string | null,
  event_type: string,
  duration_seconds: number,
  start_time: Date,
  end_time: Date,
  metadata: object
}
