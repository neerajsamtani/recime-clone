#!/bin/bash

# Activate virtual environment if you have one
# source venv/bin/activate

# Export any needed environment variables
export FLASK_ENV=production
export LOG_LEVEL=info
export GUNICORN_BIND="127.0.0.1:8000"

# Start Gunicorn
gunicorn --config gunicorn.conf.py "web_scraper:create_app()" 