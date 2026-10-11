# Sources and interpretation

Prepared October 11, 2026. Original project data are retained as a fixed snapshot; the remaster does not refresh the EPA or Census files.

| Source | Use in this project | Boundary |
|---|---|---|
| [EPA SDWIS Service Line Inventory](https://sdwis.epa.gov/ords/sfdw_pub/r/sfdw/sdwis_fed_reports_public/service-line-inventory) | Preserved 2026 Q2 CSV, system types, reporting status and service-line counts | The analysis covers complete-report Community Water Systems under state/DC primacy agencies in this file, not a census of all U.S. lines |
| [Census resident population estimates](https://www.census.gov/data/datasets/time-series/demo/popest/2020s-national-detail.html) | Preserved 2025 population CSV provides state-size context | Residents are not the number of customers or people affected by the sample inventories |
| [Xylem Asset Performance Optimization brochure](https://www.xylem.com/siteassets/brand/decision-intelligence/resources/brochures/dis_brochure_apo_full_09082022_en_us.pdf), 2022, PDF pages 4–5 | Documents detection, inventory development, funding assistance and replacement planning | Historical capability evidence; confirm current service scope. No old deadlines, cost estimates or claimed performance are adopted |
| [Xylem smart asset management](https://www.xylem.com/en-us/applications/smart-asset-management/) | Describes joining asset, maintenance and inspection data to inform investment planning | General capability context; does not demonstrate results for the proposed markets |

The two Xylem sources were reviewed online on October 11, 2026. The raw data acquisition dates are not reconstructed. SHA-256 fingerprints of the packaged CSVs are recorded in `results/facts.json` and match the originals.

## Evidence and proposed action

| Statement | Type | Traceable support |
|---|---|---|
| 43,993 systems, 3,115,308 known replacement lines and 21,589,524 Unknown lines | Calculated finding | Notebook filtering, aggregation and validation; `results/facts.json` |
| Identification inventory is larger in 49 of 51 jurisdictions | Calculated finding | Notebook comparison of Unknown against Lead + GRR |
| Raw and normalized top-10 overlap is 6 for replacement and 3 for Unknown | Calculated finding | Notebook population context section |
| Coverage varies by jurisdiction | Calculated finding | `results/reporting_coverage.csv`; unique listed Community Water Systems as the denominator |
| Five markets illustrate different inventory mixes | Interpretation | Both inventory measures in `results/illustrative_markets.csv` |
| Tailor proposed services to those mixes | Recommendation | Analytical interpretation combined with documented Xylem capabilities |
| Assess utilities before selecting pilots | Proposed next action | State totals do not establish local demand, funding or delivery capacity |
| Classification progress, cost per verified line and planning progress | Proposed pilot measures | Analyst-designed evaluation framework; no numerical target or outcome is claimed |

The five states are illustrative, not exhaustive. Florida has the third-largest Unknown inventory. Smaller states may also emerge under population adjustment. There is no composite score, automatic segmentation rule or definitive investment ranking.

## Reporting coverage definition

For each state/DC primacy agency, the denominator is the number of distinct PWS IDs classified as Community Water Systems in the source file. The numerator is the number meeting the original complete-report filter. The notebook checks uniqueness before counting. Excluded records remain excluded from inventory totals, and those totals are not grossed up.

This percentage measures systems, with equal weight per system. It does not measure coverage of service lines or prove that reporting systems represent omitted systems. Directly administered EPA-region records and other non-state primacy agencies remain outside the comparison, as in the original analysis.
