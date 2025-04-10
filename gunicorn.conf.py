import os

# Server socket
bind = os.environ.get("GUNICORN_BIND", "127.0.0.1:8001")

# Worker processes - for low traffic, we can use a minimal setup
workers = 2  # 2 workers should be sufficient for low traffic
worker_class = "sync"
timeout = 30

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("LOG_LEVEL", "info")

# Process naming
proc_name = "recime"
