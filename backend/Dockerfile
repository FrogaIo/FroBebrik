FROM python:3.11-slim
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential libpq-dev docker.io && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

EXPOSE 8000

CMD ["/bin/sh", "-c", "python manage.py migrate --noinput && gunicorn FrogLMS.wsgi:application --bind 0.0.0.0:8000"]
