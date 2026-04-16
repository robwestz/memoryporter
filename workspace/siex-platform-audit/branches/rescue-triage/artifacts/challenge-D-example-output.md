# Challenge D — Production Telemetry: Example Output

## 1. Sample Prometheus `/metrics` output

```
# HELP sie_x_requests_total Total number of requests processed
# TYPE sie_x_requests_total counter
sie_x_requests_total{endpoint="/extract",method="POST",status="200"} 142.0
sie_x_requests_total{endpoint="/health",method="GET",status="200"} 87.0
sie_x_requests_total{endpoint="/extract/batch",method="POST",status="200"} 23.0

# HELP sie_x_request_duration_seconds Request latency in seconds
# TYPE sie_x_request_duration_seconds histogram
sie_x_request_duration_seconds_bucket{endpoint="/extract",le="0.005",method="POST"} 0.0
sie_x_request_duration_seconds_bucket{endpoint="/extract",le="0.01",method="POST"} 12.0
sie_x_request_duration_seconds_bucket{endpoint="/extract",le="0.025",method="POST"} 67.0
sie_x_request_duration_seconds_bucket{endpoint="/extract",le="0.05",method="POST"} 118.0
sie_x_request_duration_seconds_bucket{endpoint="/extract",le="+Inf",method="POST"} 142.0
sie_x_request_duration_seconds_sum{endpoint="/extract",method="POST"} 4.871
sie_x_request_duration_seconds_count{endpoint="/extract",method="POST"} 142.0

# HELP sie_x_active_requests Number of requests currently being processed
# TYPE sie_x_active_requests gauge
sie_x_active_requests 3.0

# HELP sie_x_errors_total Total number of errors
# TYPE sie_x_errors_total counter
sie_x_errors_total{type="ValueError"} 2.0
sie_x_errors_total{type="HTTPException"} 1.0

# HELP sie_x_keywords_extracted_total Total number of keywords extracted
# TYPE sie_x_keywords_extracted_total counter
sie_x_keywords_extracted_total 1893.0

# HELP sie_x_extractions_total Total number of extraction operations
# TYPE sie_x_extractions_total counter
sie_x_extractions_total{mode="balanced",status="success"} 142.0
sie_x_extractions_total{mode="balanced",status="error"} 1.0
sie_x_extractions_total{mode="simple",status="success"} 165.0

# HELP sie_x_extraction_duration_seconds Duration of extraction operations in seconds
# TYPE sie_x_extraction_duration_seconds histogram
sie_x_extraction_duration_seconds_bucket{document_size_category="small",le="0.005",mode="simple"} 41.0
sie_x_extraction_duration_seconds_bucket{document_size_category="small",le="0.025",mode="simple"} 98.0
sie_x_extraction_duration_seconds_bucket{document_size_category="medium",le="0.1",mode="balanced"} 52.0
sie_x_extraction_duration_seconds_bucket{document_size_category="large",le="1.0",mode="balanced"} 14.0
sie_x_extraction_duration_seconds_sum{document_size_category="small",mode="simple"} 1.23
sie_x_extraction_duration_seconds_count{document_size_category="small",mode="simple"} 98.0

# HELP sie_x_active_operations Number of active operations
# TYPE sie_x_active_operations gauge
sie_x_active_operations{operation_type="extraction"} 1.0

# HELP sie_x_cache_hits_total Cache hits
# TYPE sie_x_cache_hits_total counter
sie_x_cache_hits_total 87.0

# HELP sie_x_cache_misses_total Cache misses
# TYPE sie_x_cache_misses_total counter
sie_x_cache_misses_total 78.0

# HELP sie_x_cache_size_bytes Current cache size in bytes
# TYPE sie_x_cache_size_bytes gauge
sie_x_cache_size_bytes 2621440.0
```

---

## 2. Sample OpenTelemetry trace span (Jaeger/Tempo JSON format)

```json
{
  "traceId": "7d3a1e9b2f4c0a8d6e5b1c7f3a9d2e8b",
  "spanId":  "a1b2c3d4e5f60001",
  "operationName": "extraction",
  "startTime": 1744742400123456,
  "duration": 34821,
  "tags": [
    { "key": "mode",           "type": "string",  "value": "simple" },
    { "key": "document_size",  "type": "int64",   "value": 847 },
    { "key": "otel.status_code", "type": "string", "value": "OK" }
  ],
  "logs": [],
  "process": {
    "serviceName": "sie_x",
    "tags": [
      { "key": "python.version", "type": "string", "value": "3.14.0" }
    ]
  }
}
```

**Trace path for a single `/extract` request:**

```
POST /extract  (FastAPI middleware — HTTP span)
  └── extraction  (ObservabilityManager.track_operation — 34ms)
        └── engine.extract_async  (EXTRACTION_DURATION histogram fires here)
```

---

## 3. What the Grafana dashboard WOULD show

### Panel 1 — Request Rate (counter → rate)
```
sum(rate(sie_x_requests_total[1m])) by (endpoint)
```
Line chart: `/extract` hovers around 2.4 req/s at peak, `/health` at 1.5 req/s.

### Panel 2 — P95 Latency (histogram quantile)
```
histogram_quantile(0.95,
  sum(rate(sie_x_request_duration_seconds_bucket[5m])) by (le, endpoint)
)
```
Target: < 50ms for `/extract` with small documents. Alerts at > 200ms.

### Panel 3 — Extraction Throughput
```
rate(sie_x_keywords_extracted_total[1m])
```
Steady ~45 keywords/sec during business hours.

### Panel 4 — Error Rate
```
sum(rate(sie_x_errors_total[5m])) by (type)
  /
sum(rate(sie_x_requests_total[5m]))
```
Target < 0.5%. Alert threshold: 2%.

### Panel 5 — Extraction Duration by Document Size (heatmap)
```
sum(rate(sie_x_extraction_duration_seconds_bucket[5m])) by (le, document_size_category)
```
Shows clear separation: small (< 10ms), medium (10-80ms), large (80-500ms).

### Panel 6 — Cache Hit Ratio
```
rate(sie_x_cache_hits_total[5m])
  /
(rate(sie_x_cache_hits_total[5m]) + rate(sie_x_cache_misses_total[5m]))
```
Target > 60% for warm workloads.

### Panel 7 — Active Operations (real-time gauge)
```
sie_x_active_operations{operation_type="extraction"}
```
Instant panel showing concurrent extractions.

---

## 4. Instrumentation coverage summary

| Code path | Counter | Histogram | Trace span |
|-----------|---------|-----------|------------|
| Every HTTP request | `sie_x_requests_total` | `sie_x_request_duration_seconds` | via OTel middleware (if instrumented) |
| `/extract` endpoint | `sie_x_keywords_extracted_total` | — | `extraction` span via ObservabilityManager |
| `engine.extract_async` | `sie_x_extractions_total` | `sie_x_extraction_duration_seconds` | — |
| Cache events | `sie_x_cache_hits/misses_total` | — | — |
| Errors | `sie_x_errors_total` | — | span.record_exception |

---

## 5. Dependencies status

| Dep | Installed | Behavior if absent |
|-----|-----------|-------------------|
| `prometheus_client` | NO | All metrics → no-op; `/metrics` returns HTTP 503 |
| `opentelemetry-sdk` | YES | Full tracing active |
| `opentelemetry-exporter-otlp-proto-grpc` | YES | Spans exported to localhost:4317 (Jaeger/Tempo) |
| `structlog` | NO | Logging falls back to stdlib `logging` |
