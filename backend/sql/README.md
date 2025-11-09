# Database SQL Files

This folder contains the SQL schema (DDL) and seed data (DML) for the HireWave.AI database.

## Files

- **schema.sql** - Database schema (tables, indexes, constraints)
- **seed.sql** - Sample data for development and testing

## Using with SQL Editor (DataGrip, pgAdmin, etc.)

### 1. Connect to your PostgreSQL database

Use the connection string from `backend/.env`:
```
Host: ep-autumn-glade-ad91atgw-pooler.c-2.us-east-1.aws.neon.tech
Database: neondb
User: neondb_owner
Password: npg_IUgy8fBW9EzT
SSL: require
```

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
# Connect to database
psql "postgresql://neondb_owner:npg_IUgy8fBW9EzT@ep-autumn-glade-ad91atgw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Run schema
\i backend/sql/schema.sql

# Run seed data
\i backend/sql/seed.sql
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

**HR Users:**
- Email: `22f1000535@ds.study.iitm.ac.in` / Password: `password123`
- Email: `23f3003216@ds.study.iitm.ac.in` / Password: `password123`
- Email: `hr@company.com` / Password: `password123`

**Candidate Users:**
- Email: `candidate1@email.com` / Password: `password123`
- Email: `candidate2@email.com` / Password: `password123`

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
