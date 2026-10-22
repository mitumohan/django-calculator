# Django Calculator

A web calculator built with Django. It evaluates expressions on the server and keeps a history of your recent calculations.

## Built with

- Python
- Django
- HTML, CSS and JavaScript

## Run it on your computer

1. Clone the repo and go into it:
   ```bash
   git clone https://github.com/mitumohan/django-calculator.git
   cd django-calculator
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate        # Windows: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. (Optional) Turn on detailed error pages while developing:
   ```bash
   cp .env.example .env
   ```
   The app works without this. A secret key is created automatically the
   first time it starts (saved in `secret_key.txt`, which is not committed).
5. Set up the database and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```
6. Open http://127.0.0.1:8000 in your browser.

## Project structure

```
calc/          # the calculator app: views, models, templates, JS and CSS
calculator/    # Django project settings and URLs
manage.py      # Django's command-line helper
.env.example   # optional settings you can override in a .env file
```
