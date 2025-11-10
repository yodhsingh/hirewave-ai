# Database SQL Files

This folder contains the SQL schema (DDL) and seed data (DML) for the HireWave.AI database.

## Files

- **schema.sql** - Database schema (tables, indexes, constraints)
- **seed.sql** - Sample data for development and testing

## Using with SQL Editor (DataGrip, pgAdmin, etc.)

### 1. Connect to your PostgreSQL database

Get the connection details from your `backend/.env` file:
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

Configure your SQL editor with these details from your .env file.

### 2. Execute schema.sql

Open `schema.sql` in your SQL editor and execute it. This will:
- Drop existing tables (if any)
- Create all enum types
- Create all tables with proper relationships
- Create indexes for performance

### 3. Execute seed.sql

Open `seed.sql` in your SQL editor and execute it. This will insert:
- 6 users (4 HR, 2 candidates)
- 6 jobs across different departments
- 18 interview questions (3 per job)
- 12 candidates
- Interview responses for submitted candidates
- AI scores for scored candidates

## Using with Command Line

```bash
# Set DATABASE_URL from your .env file
# Then connect and run:
psql $DATABASE_URL -f scripts/sql/schema.sql
psql $DATABASE_URL -f scripts/sql/seed.sql
```

## Using with Python Script

The `setup_database.py` script has been updated to use Integer IDs. Run:

```bash
cd backend
source .venv/bin/activate
python setup_database.py --yes
```

## Test Credentials

After running seed.sql, you can login with:

**Test Users:**
- See `seed.sql` for complete list of test users
- Default password for all seed users: `password123`
- Includes HR users and candidate users

## Database Changes

**Migration from UUID to Integer IDs:**
- All ID fields now use `SERIAL` (auto-increment integers)
- Simpler for development and debugging
- Foreign keys use `INTEGER` type
- Better performance for joins and indexes

## Resetting the Database

To completely reset and reseed the database:

```sql
-- Execute schema.sql (drops and recreates all tables)
-- Then execute seed.sql (inserts fresh data)
```

Or use the Python script:
```bash
python setup_database.py --yes
```
