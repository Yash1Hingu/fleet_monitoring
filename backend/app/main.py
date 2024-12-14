from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .utils import generate_robot_data
from .websocket_manager import update_robot_data
import asyncio

app = FastAPI()

# Enable CORS
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create mock robot data
robots = generate_robot_data()

# REST API to get all robots
@app.get("/robots")
async def get_robots():
    return robots

# WebSocket for real-time updates
@app.websocket("/ws/updates")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            print("Client Connected")
            update_robot_data(robots)  # Simulate real-time updates
            await websocket.send_json([robot.dict() for robot in robots])
            await asyncio.sleep(5)  # Send updates every 5 seconds
    except WebSocketDisconnect:
        print("Client Disconnected")
