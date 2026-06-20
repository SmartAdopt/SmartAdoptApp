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
    sys.stdout,  # Standard output
    format="<level>{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}</level>",  # Log format
    level="INFO",  # Minimum log level
    colorize=True,  # Enable color output
)

# Add file handler for persistent logs
logger.add(
    "logs/app.log",  # Log file path
    rotation="500 MB",  # Rotate when file reaches 500 MB
    retention="10 days",  # Keep logs for 10 days
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",  # Log format
    level="INFO",  # Minimum log level
)

# Add file handler for error logs
logger.add(
    "logs/error.log",  # Error log file path
    rotation="500 MB",  # Rotate when file reaches 500 MB
    retention="30 days",  # Keep error logs for 30 days
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",  # Log format
    level="ERROR",  # Minimum log level
)

# Export logger instance
__all__ = ["logger"]
