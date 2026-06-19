# Logger configuration using loguru

from loguru import logger
import sys

# Remove default handler
logger.remove()

# Configure custom colors for levels
logger.level("INFO", color="<green>")
logger.level("WARNING", color="<yellow>")
logger.level("ERROR", color="<red>")

# Add single console handler with custom colors
logger.add(
    sys.stdout,
    format="<level>{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}</level>",
    level="INFO",
    colorize=True,
)

# Add file handler for persistent logs
logger.add(
    "logs/app.log",
    rotation="500 MB",
    retention="10 days",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    level="INFO",
)

# Add file handler for error logs
logger.add(
    "logs/error.log",
    rotation="500 MB",
    retention="30 days",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    level="ERROR",
)

# Export logger instance
__all__ = ["logger"]
