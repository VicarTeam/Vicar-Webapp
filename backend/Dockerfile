FROM oven/bun
COPY . .
RUN bun install --frozen-lockfile
EXPOSE 6660
CMD ["bun", "src/index.ts"]