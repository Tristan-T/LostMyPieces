FROM neo4j:2026.05.0

WORKDIR /usr/src/app

# Install CURL
RUN apt-get update && apt-get install -y curl

# Get APOC plugin
RUN curl -L https://github.com/neo4j/apoc/releases/download/2026.05.0/apoc-2026.05.0-core.jar  \
    -o /var/lib/neo4j/plugins/apoc-2026.05.0-core.jar

# Copy kanji files
COPY . .

# Web interface (not needed)
EXPOSE 7474
# Bolt protocol
EXPOSE 7687

ENV NEO4J_apoc_import_file_enabled=true

ENTRYPOINT ["/import/wrapper.sh"]