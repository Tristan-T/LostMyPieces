#!/bin/bash

#Bash job control
set -m

echo "[wrapper.sh] Starting the Neo4j database container..."

# Start Neo4j in the background
/startup/docker-entrypoint.sh neo4j &

echo "[wrapper.sh] Starting the data import process into Neo4j database..."

#Retrieve password and user from NEO4J_AUTH_FILE
if [ -f "$NEO4J_AUTH_FILE" ]; then
    echo "[wrapper.sh] Reading Neo4j credentials from $NEO4J_AUTH_FILE"
    NEO4J_AUTH=$(cat "$NEO4J_AUTH_FILE")
    IFS='/' read -r NEO4J_USER NEO4J_PASSWORD <<< "$NEO4J_AUTH"
    export NEO4J_USER
    export NEO4J_PASSWORD
else
    echo "[wrapper.sh] NEO4J_AUTH_FILE not found. Please ensure the file exists and contains the correct credentials."
    exit 1
fi

# Wait for Neo4j to start without downloading or printing verbose output
wget -nv --spider --quiet --retry-connrefused --waitretry=2 --timeout=30 --tries=30 http://localhost:7474

# Check if flag already exists
if [ -f /data/neo4j_initialized.flag ]; then
    echo "[wrapper.sh] Initial data has already been imported. Skipping import..."
else
    echo "[wrapper.sh] Importing data into Neo4j database..."
    echo "[wrapper.sh] Using kanji file : ${JSON_URL}"

    # Create a copy to the JSON file in the /import directory and overwrite if it already exists
    cp -f "$JSON_URL" /var/lib/neo4j/import/kanji.json || { echo "Failed to copy kanji.json, aborting import."; exit 1; }

    # Run the Cypher script to import data using NEO4J_AUTH_FILE
    cypher-shell -p "$NEO4J_PASSWORD" -u "$NEO4J_USER"  -f ./import/LOAD_DATABASE.cypher || { echo "cypher-shell failed, aborting import."; exit 1; }

    # Create a flag file to indicate that the import has been done
    touch /data/neo4j_initialized.flag
    echo "[wrapper.sh] Complete the data import process"
fi

fg %1