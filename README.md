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

4. Create a `.env` file with
```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_key

# AWS Credentials
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
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

        server_name your_domain.com;

        location / {
		include proxy_params;
                proxy_pass http://127.0.0.1:8001;
        }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = your_domain.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


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

### UFW Firewall Configuration
1. Install UFW if not already installed:
```bash
sudo apt update
sudo apt install ufw
```

2. Configure UFW rules:
```bash
# Allow SSH (to prevent being locked out)
sudo ufw allow ssh

# Allow HTTP and HTTPS traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable UFW
sudo ufw enable

# Verify the rules
sudo ufw status
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

## Setting up Systemd Service

1. Create a systemd service file:
```bash
sudo nano /etc/systemd/system/recime.service
```

2. Add the following configuration (adjust paths according to your setup):
```ini
[Unit]
Description=Gunicorn instance to serve recime
After=network.target

[Service]
User=username
Group=www-data
WorkingDirectory=/home/username/recime
Environment="PATH=/home/username/recime/venv/bin"
ExecStart=/bin/bash /home/username/recime/run.sh

[Install]
WantedBy=multi-user.target
```

3. Start and enable the service:
```bash
sudo systemctl start recime
sudo systemctl enable recime
```

4. Check the service status:
```bash
sudo systemctl status recime
```

5. If you make changes to the service file:
```bash
sudo systemctl daemon-reload
sudo systemctl restart recime
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

If you encounter any errors, trying checking the following:
```bash
# check the Nginx error logs
sudo less /var/log/nginx/error.log
# check the Nginx access logs
sudo less /var/log/nginx/access.log
# check the Nginx process logs
sudo journalctl -u nginx
# check your Flask app's Gunicorn logs
sudo journalctl -u recime
```

## Stopping the Application

### If you've set up systemd service

Run
```bash
sudo systemctl stop recime
# If you dont want it to restart later
sudo systemctl disable recime
```

### If you've not set up systemd service

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