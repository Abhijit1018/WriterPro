release: cd backend && python manage.py migrate && python manage.py collectstatic --noinput
web: cd backend && gunicorn writeearn_backend.wsgi --log-file -
