#!/bin/sh
# Create data directory if it doesn't exist
mkdir -p /app/data

# Run the initialization script to create tables and admin user
node scripts/initAdmin.mjs

# Start the Next.js standalone server
exec node server.js
