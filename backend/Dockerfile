FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
EXPOSE 6660
CMD ["bun", "src/index.ts"]
