import socketio
from jose import jwt, JWTError
from app.config import settings
from app.utils.logger.logger_config import logger

# Create a Socket.IO server
# async_mode='asgi' is used to integrate with FastAPI
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")


async def get_user_from_token(token: str) -> int:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return int(payload["sub"])
    except JWTError as e:
        logger.warning(f"Socket.IO authentication failed: {str(e)}")
        raise ValueError("Invalid token")


@sio.on("connect")
async def connect(sid, environ, auth):
    # Authenticate via auth payload (e.g. { "token": "..." })
    if not auth or "token" not in auth:
        logger.warning(f"Socket.IO connection attempt {sid} without token.")
        raise socketio.exceptions.ConnectionRefusedError("Authentication required")

    try:
        user_id = await get_user_from_token(auth["token"])
    except ValueError:
        logger.warning(f"Socket.IO connection {sid} provided an invalid token.")
        raise socketio.exceptions.ConnectionRefusedError("Invalid token")

    # Put the user in a personal room
    room_name = f"user_{user_id}"
    await sio.enter_room(sid, room_name)
    logger.info(
        f"Socket.IO user {user_id} connected (sid: {sid}). Added to room {room_name}."
    )


@sio.on("disconnect")
async def disconnect(sid):
    logger.info(f"Socket.IO client disconnected: {sid}")
