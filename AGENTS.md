## Cursor Cloud specific instructions

This repository contains a Python web scraping script for extracting doctor data from Sikarin Hospital Hat Yai's website.

- **Tech stack:** Python 3 with `requests`, `beautifulsoup4`, `openpyxl`, `lxml`.
- **Run scraper:** `python3 scrape_doctors.py` — fetches all doctors via the WordPress REST API and writes `doctors_sikarin_hatyai.xlsx`.
- **Preview server:** `python3 preview_server.py` — starts a Flask server on port 8080 to view scraped data in a browser.
- **Install deps:** `pip install requests beautifulsoup4 openpyxl lxml flask`
- The website uses a WordPress REST API at `https://hatyai.sikarin.com/wp-json/wp/v2/doctor?per_page=100` which returns all doctor data including ACF custom fields (no pagination needed for current count of ~52 doctors).
