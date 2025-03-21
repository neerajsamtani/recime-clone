# Recipe Web Scraper

A Flask-based web service that scrapes and parses recipe information from websites.

## Prerequisites

- Python 3.x
- Nginx
- Domain name (for SSL setup)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Create and activate a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

### SSL Certificates
1. Obtain SSL certificates (e.g., from Let's Encrypt)
2. Update `nginx.conf` with your certificate paths:
```nginx
ssl_certificate /path/to/your/certificate.crt;
ssl_certificate_key /path/to/your/private.key;
```
3. Replace `your_domain.com` with your actual domain name in `nginx.conf`

### Nginx Setup
1. Copy the nginx configuration:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/recime
sudo ln -s /etc/nginx/sites-available/recime /etc/nginx/sites-enabled/
```

2. Test and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Running the Application

1. Make the run script executable:
```bash
chmod +x run.sh
```

2. Start the application:
```bash
./run.sh
```

The application architecture:
```
Client Request → Nginx (443/80) → Gunicorn (127.0.0.1:8000) → Flask App
```

## Verification

1. Check if Gunicorn is running:
```bash
ps aux | grep gunicorn
```

2. Test the health endpoint:
```bash
curl https://your_domain.com/health
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /scrape/<url>` - Scrape and parse recipe from the given URL
- `GET /` - Service status

## Monitoring

- Nginx logs: 
  - `/var/log/nginx/error.log`
  - `/var/log/nginx/access.log`
- Gunicorn logs will be in stdout where you ran `run.sh`

## Stopping the Application

1. Find the Gunicorn process:
```bash
ps aux | grep gunicorn
```

2. Stop it:
```bash
kill -TERM <master_process_id>
```

## Important Notes

- Ensure your firewall allows traffic on ports 80 and 443
- The Nginx user needs permission to access SSL certificates
- Your domain DNS should be pointing to your server's IP
- Some commands might require sudo privileges

## Environment Variables

The application uses the following environment variables (set in `run.sh`):
- `FLASK_ENV`: Application environment (development/production)
- `LOG_LEVEL`: Logging level
- `GUNICORN_BIND`: Gunicorn bind address and port 