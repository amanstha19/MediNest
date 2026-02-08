# Forgot Password Duplicate User Fix - TODO

## Tasks
- [x] Create TODO file
- [x] Fix auth.py - Replace .get() with .filter().first() to handle duplicates gracefully
- [x] Update CustomUser model - Add email uniqueness constraint
- [x] Create management command to identify duplicate users
- [x] Create migration for email uniqueness (run after cleaning duplicates)
- [x] Test the forgot password functionality
- [x] Clean up duplicate user (testuser - ID: 4)
- [x] Apply migration to database

## Problem
The forgot password endpoint fails with "get() returned more than one CustomUser -- it returned 2!" because there are duplicate users with the same email in the database.

## Solution
1. **Immediate Fix**: Handle duplicates gracefully in the forgot_password view
2. **Long-term Fix**: Add email uniqueness constraint to prevent future duplicates
