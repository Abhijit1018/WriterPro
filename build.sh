#!/bin/bash
set -e

echo "Installing dependencies..."
pip install -r backend/requirements.txt

echo "Running migrations..."
cd backend
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build complete!"
