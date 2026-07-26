# Use lightweight official Python image
FROM python:3.10-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies needed for psycopg2, mysqlclient, and compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    pkg-config \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (leverages Docker cache)
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Expose Django port
EXPOSE 8000

# Run static collection, migrations, and start WSGI server with Gunicorn
CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]