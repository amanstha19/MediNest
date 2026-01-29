# Database Migration Plan - SQLite to PostgreSQL

## Progress Tracker

### Step 1: Create .env file

- [x] Create .env file with PostgreSQL credentials

### Step 2: Start Docker containers

- [x] Start PostgreSQL and Redis containers (PostgreSQL running on port 5434)

### Step 3: Run Django migrations on PostgreSQL

- [ ] Run `python manage.py migrate` to create tables

### Step 4: Transfer data from SQLite to PostgreSQL

- [ ] Dump data from SQLite: `python manage.py dumpdata > sqlite_data.json`
- [ ] Load data into PostgreSQL: `python manage.py loaddata sqlite_data.json`

### Step 5: Verify migration

- [ ] Check record counts match between databases
- [ ] Test the application works correctly

### Step 6: Clean up

- [ ] Remove temporary JSON file
- [ ] Keep SQLite file as backup

## Notes

- Original SQLite database: `backend_easyhealth/epharm/db.sqlite3`
- PostgreSQL database: `drf_pharmacy` on `localhost:5432`
- User: `drf_user`, Password: `drf123`
