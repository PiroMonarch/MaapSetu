# MaapSetu — Synthetic NAWI Dataset

> **⚠️ IMPORTANT DISCLAIMER**
> All records in this directory are **synthetic test data created for software development and demonstration purposes only**.
> They are NOT actual laboratory measurements, and the PASS/FAIL labels are computed by the software engine, not by a certified metrologist.
> For production use, all rule thresholds must be verified against the authoritative OIML R 76-1 text and applicable Indian Legal Metrology requirements.

---

## File Structure

```
data/
├── README.md                           ← This file
├── laboratories/
│   └── laboratories.json               ← Lab master records
├── instruments/
│   └── instruments.json                ← 5 instrument master records (INS-001 to INS-005)
├── users/
│   └── users.json                      ← Demo user accounts
├── test_cases/
│   └── test_cases.json                 ← 10 synthetic test cases (TC-2026-0001 to TC-2026-0010)
├── observations/
│   └── observations.json               ← 50 synthetic observations (OBS-001 to OBS-050)
├── reports/
│   └── reports.json                    ← 10 report records
└── rules/
    ├── oiml-r76-2006.json              ← Versioned OIML R 76-1:2006 rule set
    └── legal-metrology-india.json      ← Indian Legal Metrology supplementary rules
```

---

## Key Design Decisions

1. **Rules are NOT hard-coded in frontend** — they live in `rules/` and are loaded by the server engine
2. **Results are engine-computed** — the `result` field in observations is the engine output, not a pre-filled value
3. **Rule sets are versioned** — when OIML R 76 is updated, a new rule set JSON is added; old reports retain a reference to the rule set version they were evaluated against
4. **Synthetic environmental variation** — temperature, humidity, and pressure vary realistically across test cases

---

## Instrument Coverage

| ID | Manufacturer | Model | Class | Max | e |
|---|---|---|---|---|---|
| INS-001 | Precision Weigh Systems | PWS-300 | III | 300 kg | 0.1 kg |
| INS-002 | Bharat Scale Technologies | BST-500 | III | 500 kg | 0.2 kg |
| INS-003 | Metro Weigh Instruments | MWI-1000 | III | 1000 kg | 0.5 kg |
| INS-004 | AgriMeasure Systems | AMS-30 | IIII | 30 kg | 0.01 kg |
| INS-005 | National Weighing Solutions | NWS-2000 | III | 2000 kg | 1 kg |

---

## Test Type Coverage

| Code | Name | R 76-1 Clause |
|---|---|---|
| ZERO | Zero-setting test | T.3.1 |
| WEIGHING | Weighing performance | T.3.2 |
| REPEATABILITY | Repeatability | T.3.3 |
| ECCENTRICITY | Eccentric loading | T.3.4 |
| DISCRIMINATION | Discrimination | T.3.5 |
| TARE | Tare test | T.4.1 |
| INCREASING_LOAD | Increasing-load test | T.3.2 |
| DECREASING_LOAD | Decreasing-load test | T.3.2 |

---

## Dataset Statistics

- **5** instrument profiles
- **3** laboratories
- **5** users (across all roles)
- **10** test cases
- **50** observations (PASS and FAIL scenarios included)
- **10** report records
- **1** rule set (OIML R 76-1:2006) with 8 rules
