# Lead Service Line Needs and a Proposed Xylem Market Approach

**Darsh Rathi | Xylem / IBM SkillsBuild project | Portfolio remaster | October 2026**

This project asks where lead service line infrastructure needs are greatest across U.S. states, then develops a proposed application for Xylem: use inventory patterns to identify candidate markets for tailored identification and replacement-planning services, and assess individual utilities before selecting pilots.

The analysis contains 21.59 million Lead Status Unknown lines and 3.12 million known replacement lines across 43,993 complete-report Community Water Systems. It keeps Unknown material separate from Lead plus Galvanized Requiring Replacement (GRR). Unknown does not mean lead.

## Start here

| Artifact | Purpose |
|---|---|
| [Five-slide presentation](deliverables/Xylem_Market_Recommendation.pptx) / [PDF](deliverables/Xylem_Market_Recommendation.pdf) | Recommendation, supporting charts and proposed next action |
| [One-page executive summary](deliverables/Executive_Summary.docx) / [PDF](deliverables/Executive_Summary.pdf) | Recommendation, three facts, limitations and next question |
| [Analysis notebook](Lead_Service_Line_Analysis.ipynb) | Reproducible data preparation, calculations, reporting coverage and interpretation |
| [Two-page AI collaboration brief](deliverables/AI_Collaboration_Brief.docx) / [PDF](deliverables/AI_Collaboration_Brief.pdf) | AI assistance, original manual review, remaster verification and analyst judgment |
| [Source register](SOURCES.md) | Source links, definitions and distinction between findings and proposals |

The presentation and documents are editable. Their PDFs provide a consistent reading copy. The project demonstrates Python/pandas analysis, data-quality assessment, visualization and business communication. The recommendation has not been implemented or evaluated as a pilot.

## What changed in this remaster

- Connected the existing state-level findings to an explicit Xylem recommendation and utility-screening process.
- Added reporting coverage for all 51 jurisdictions and a transparent comparison of five illustrative markets.
- Preserved the original sample, metric definitions and population benchmark, with added assertions and a shared facts export.
- Refined the existing presentation palette and met the original five-slide, one-page and two-page limits.

The examples suggest identification emphasis in Texas and Pennsylvania, replacement-planning emphasis in Illinois, and parallel work in Ohio and New York. Each has both kinds of inventory. They are neither statistical clusters nor an exhaustive market shortlist.

## Reproduce the analysis

Use Python 3.12. The pinned packages in `requirements.txt` record the environment used for the remaster. From this folder:

```sh
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python production/execute_notebook.py
```

On Windows, activate with `.venv\Scripts\activate`. The execution script creates a fresh local kernel using the active Python environment, runs every code cell, and saves the outputs in the notebook. A separate Jupyter interface is optional for interactive editing.

The notebook uses the two unchanged files in `data/raw/`. It writes six chart images, `state_service_line_summary.csv`, `reporting_coverage.csv`, `illustrative_markets.csv` and `facts.json` to `results/`. No network access is needed to rerun the analysis after dependencies are installed. `facts.json` includes source-file hashes and tested package versions.

Then run `python production/verify_package.py` to compare the generated tables against the headline findings and all four native presentation charts, verify the published artifact hashes, and check PDF page counts. The repository's GitHub Actions workflow performs these steps in a fresh environment on relevant pushes and pull requests.

## How the package is organized

- `data/raw/`: unchanged EPA 2026 Q2 and Census 2025 source CSVs.
- `results/`: generated tables, charts and shared facts used by the communication artifacts.
- `deliverables/`: editable presentation and briefs with PDF reading copies.
- `production/`: portable notebook execution and package verification scripts.
- `.build/`: local dependencies, draft renders and verification records, excluded from version control and distribution.

To reproduce or maintain the analysis, execute or edit the delivered notebook directly. The final Word and PowerPoint files can be edited normally. Local artifact-authoring helpers are retained on the author's computer and excluded from the published source because they depend on the original drafts and the Codex production environment.

## Interpretation limits

Complete-report coverage counts listed systems, not service lines. New Hampshire includes just 3 of 706 listed Community Water Systems, demonstrating why low sample totals cannot establish low need. The five example markets include 91.4%–98.3% of listed systems, which still does not establish representativeness or inventory accuracy.

The state field is Primacy Agency. Non-state agencies and directly administered EPA-region records are excluded. Population-adjusted values provide context and do not measure affected residents. The analysis does not measure water quality, household exposure, project readiness, customer demand or market revenue.

The 2022 Xylem brochure documents capability fit; current service scope must be confirmed before a pilot. Pilot measures are proposals with no implied targets or observed results. See the notebook and source register for the complete reasoning.

## Version history and next extension

The original work was backed up to GitHub before this remaster began: [commit bbd4018](https://github.com/drat-git/xylem-lead-service-line-analysis/commit/bbd4018c8b314eb4d4764529c1a56e24de63c680). Original files and historical drafts remain in that snapshot and on the author's computer. The current repository presents the remastered package.

Streamlit is deferred. A future companion app can consume the shared result tables for state comparisons and coverage context. Utility-level research and funding assessment would be a separate extension.
