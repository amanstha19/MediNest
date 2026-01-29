# Phone Number and City Fix for User Signup

## Issue

Phone number and city fields are collected on the frontend signup form but not being saved to the database during user registration.

## Root Cause

- Frontend collects city and phone fields but AuthProvider.signup() only sends username, email, password, first_name, last_name to backend
- Backend RegisterSerializer only includes ['username', 'email', 'password', 'first_name', 'last_name'] in fields, missing city and phone

## Tasks

- [x] Update RegisterSerializer in serializers.py to include city and phone fields
- [x] Update AuthProvider signup function to send city and phone to backend
- [x] Test the signup flow to verify fields are saved correctly (API test successful - city and phone fields saved properly in PostgreSQL)

## Files to Edit

- backend_easyhealth/epharm/myapp/serializers.py
- frontend_easyhealth/src/context/AuthProvider.jsx
