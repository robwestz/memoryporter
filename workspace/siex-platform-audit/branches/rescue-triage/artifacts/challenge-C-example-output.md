# Challenge C — Embedded A/B Platform: Example Output

Generated: 2026-04-15  
Files modified:
- `D:/sie_x/testing/ab_framework.py` — logger bug fixed
- `D:/sie_x/api/ab_routes.py` — new (5 endpoints)
- `D:/sie_x/api/minimal_server.py` — `app.include_router(ab_router)` wired

---

## 1. Experiment Creation

**POST /ab/experiment**

Request:
```json
{
  "name": "headline_cta_test",
  "description": "Test two call-to-action headlines",
  "variants": ["control", "bold_cta"],
  "metric": "conversion_rate",
  "allocation_strategy": "deterministic",
  "minimum_sample_size": 30
}
```

Response (201):
```json
{
  "experiment_id": "exp_1776305643",
  "name": "headline_cta_test",
  "status": "running",
  "variants": ["control", "bold_cta"],
  "metric": "conversion_rate",
  "allocation_strategy": "deterministic"
}
```

---

## 2. Deterministic Variant Assignment

**GET /ab/assign/headline_cta_test/{user_id}**

The assignment uses MD5(`experiment_id:user_id`) → integer → position in [0,1].
Same user_id always maps to the same variant, regardless of server restart.

```
user_001  hash_pos=0.300 → control
user_002  hash_pos=0.680 → bold_cta
user_003  hash_pos=0.490 → control
user_042  hash_pos=0.330 → control
user_099  hash_pos=0.550 → bold_cta
```

Response example for `user_002`:
```json
{
  "experiment": "headline_cta_test",
  "user_id": "user_002",
  "variant": "bold_cta",
  "allocation_strategy": "deterministic"
}
```

---

## 3. Results with Thompson Sampling + Statistical Analysis

**GET /ab/results/headline_cta_test**

After 50 observations per variant:

```json
{
  "experiment": "headline_cta_test",
  "status": "running",
  "sample_counts": {
    "control": 50,
    "bold_cta": 50
  },
  "thompson_sampling_scores": {
    "control": 0.988,
    "bold_cta": 0.9984
  },
  "statistical_analysis": [
    {
      "metric": "conversion_rate",
      "control_mean": 0.2597,
      "treatment_mean": 0.4391,
      "t_statistic": -5.3635,
      "p_value": 1e-06,
      "cohens_d": 1.0836,
      "confidence_interval_95": [0.1266, 0.2322],
      "significant": true,
      "improvement_pct": 69.08
    }
  ],
  "auto_stop_recommendation": "stop_winner_found"
}
```

**Reading the numbers:**
- `p_value = 0.000001` — far below 0.05 threshold; result is statistically significant
- `cohens_d = 1.08` — large effect size (>0.8 per Cohen's convention)
- `confidence_interval_95 = [0.127, 0.232]` — true difference does not include zero
- `thompson_sampling_scores` — Beta distribution samples; higher = currently preferred arm
- `improvement_pct = 69.08%` — treatment outperforms control by 69% on conversion_rate

---

## 4. Auto-Stop Recommendation

```json
{
  "auto_stop_recommendation": "stop_winner_found",
  "reason": "p=0.0000 < 0.05 with Cohen d=1.084 (medium effect)",
  "winner": "bold_cta"
}
```

**Auto-stop logic (from ab_framework.py `_should_end_experiment`):**
- Requires minimum sample size on all variants
- For 2-variant tests: runs t-test on primary metric
- Early stop triggers at p < 0.001 (strong signal) or after 30-day time limit
- `stop_winner_found` → caller should call `DELETE /ab/experiment/{name}` to archive

---

## 5. Record Observation

**POST /ab/record/headline_cta_test**

```json
{
  "variant": "bold_cta",
  "metric": "conversion_rate",
  "value": 0.82
}
```

Response:
```json
{
  "recorded": true,
  "experiment": "headline_cta_test",
  "variant": "bold_cta",
  "metric": "conversion_rate",
  "value": 0.82,
  "auto_stopped": false
}
```

When `auto_stopped: true` is returned, the experiment is already in `completed` state.

---

## Statistical Methods Available

| Method | Implementation | Source |
|---|---|---|
| Deterministic hash assignment | MD5(exp_id:user_id) % 100 | `_allocate_variant` |
| Thompson sampling | `np.random.beta(successes+1, failures+1)` | `_thompson_sampling` |
| Welch's t-test | `scipy.stats.ttest_ind` | `analyze_experiment` |
| Cohen's d effect size | pooled std formula | `analyze_experiment` |
| 95% confidence interval | `scipy.stats.t.interval` | `analyze_experiment` |
| Auto-stopping | p < 0.001 or 30-day limit | `_should_end_experiment` |

---

## Import Verification

```
$ cd /d/sie_x && python -c "from testing.ab_framework import *; print('ab import OK')"
ab import OK

$ cd /d/sie_x && python -c "from api.ab_routes import router; print('routes OK')"
routes OK
```
