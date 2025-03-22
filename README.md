# Recipe Web Scraper

A Flask-based web service that scrapes and parses recipe information from websites.

## Prerequisites

- Python 3.x
- Nginx
- Domain name with DNS configured
- Certbot for SSL certificate management

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

### Nginx Setup
1. Create a new Nginx server block:
```bash
sudo nano /etc/nginx/sites-available/your_domain.com
```

2. Add the following configuration (adjust domain name as needed):
```nginx
server {

        root /var/www/recime/html;
        index index.html index.htm index.nginx-debian.html;

        server_name your_domain.com;

        location / {
                try_files $uri $uri/ =404;
        }

}
server {
        listen 80;
        listen [::]:80;

        server_name your_domain.com;
    return 404; # managed by Certbot


}
```

3. Enable the site and test Nginx configuration:
```bash
sudo ln -s /etc/nginx/sites-available/your_domain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificates with Certbot
1. Install Certbot and the Nginx plugin:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

2. Obtain SSL certificates using Certbot:
```bash
sudo certbot --nginx -d your.domain.com
```
Certbot will automatically configure Nginx for SSL.

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
curl https://your.domain.com/health
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
- Certbot will automatically manage SSL certificate renewal
- Your domain DNS should be pointing to your server's IP
- Some commands might require sudo privileges

## Environment Variables

The application uses the following environment variables (set in `run.sh`):
- `FLASK_ENV`: Application environment (development/production)
- `LOG_LEVEL`: Logging level
- `GUNICORN_BIND`: Gunicorn bind address and port 