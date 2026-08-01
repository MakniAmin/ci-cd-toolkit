# ---- build stage: install dependencies ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- runtime stage ----
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# The base image ships its own npm CLI, which vendors dependencies
# (tar, sigstore, picomatch, brace-expansion) carrying disclosed CVEs
# as of Aug 2026. This app never calls npm/npx at runtime, so remove
# the toolchain entirely instead of accepting the risk or suppressing
# the Trivy finding. Also shrinks the final image.
RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm \
           /usr/local/bin/npx \
           /usr/local/bin/corepack

EXPOSE 3000
CMD ["node", "index.js"]