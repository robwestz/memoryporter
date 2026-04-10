FROM rust:1.78-bookworm AS builder

WORKDIR /app
COPY . .
RUN cargo build --release \
    -p ob1-runtime \
    -p claw-gateway

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/ob1 /usr/local/bin/ob1
COPY --from=builder /app/target/release/claw-gateway /usr/local/bin/claw-gateway

ENV RUST_LOG=info
EXPOSE 8080

CMD ["claw-gateway", "--bind", "0.0.0.0", "--port", "8080"]
