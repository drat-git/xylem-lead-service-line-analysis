"""Check delivered facts, native chart values, page counts and source preservation."""
from pathlib import Path
import hashlib
import json
import zipfile
import xml.etree.ElementTree as ET
import numpy as np
import pandas as pd
from pypdf import PdfReader

R = Path(__file__).resolve().parents[1]
F = json.loads((R / 'results/facts.json').read_text())
S = pd.read_csv(R / 'results/state_service_line_summary.csv').set_index('State')
checks = []

def check(name, condition):
    assert condition, name
    checks.append(name)

for filename, digest in F['sources'].items():
    check('Packaged input hash: '+filename, hashlib.sha256((R/'data/raw'/filename).read_bytes()).hexdigest()==digest)
original = R.parent/'outputs/state_service_line_summary.csv'
if original.exists():
    old = pd.read_csv(original).set_index('State').sort_index()
    pd.testing.assert_frame_equal(old, S.sort_index()[old.columns], check_dtype=False, rtol=1e-10, atol=1e-8)
    checks.append('All original state summary values retained')
check('Coverage numerator equals sample', int(S.Complete_CWS.sum())==F['sample_systems'])
check('Coverage counts match system counts', (S.Complete_CWS==S.Systems).all())
check('Coverage denominators sum correctly', int(S.All_CWS_in_file.sum())==F['all_cws_in_state_scope'])
check('Coverage rates recompute', np.allclose(S.Complete_report_pct, 100*S.Complete_CWS/S.All_CWS_in_file))
check('All coverage rates are valid', S.Complete_report_pct.between(0,100).all())
check('New Hampshire coverage example', S.loc['New Hampshire','Complete_CWS']==3 and S.loc['New Hampshire','All_CWS_in_file']==706)
check('Unknown total', int(S.Unknown.sum())==F['unknown']==21589524)
check('Replacement total', int(S.Known_Replacement.sum())==F['known_replacement']==3115308)
check('Two inventories remain distinct', (S.Known_Replacement==S.Lead+S.GRR).all())
check('Jurisdiction comparison', int((S.Unknown>S.Known_Replacement).sum())==49)
check('Population rates recompute', np.allclose(S.Unknown_per_10k,S.Unknown/S.Population_2025*10000) and np.allclose(S.Known_Replacement_per_10k,S.Known_Replacement/S.Population_2025*10000))

n=json.loads((R/'Lead_Service_Line_Analysis.ipynb').read_text())
cells=[c for c in n['cells'] if c['cell_type']=='code']
check('Fresh sequential notebook execution', [c['execution_count'] for c in cells]==list(range(1,len(cells)+1)))
check('No notebook execution errors', not [o for c in cells for o in c['outputs'] if o['output_type']=='error'])

ns={'c':'http://schemas.openxmlformats.org/drawingml/2006/chart','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
def vals(series,tag):
    el=series.find('c:'+tag,ns)
    return [float(x.text) for x in el.findall('.//c:pt/c:v',ns)]
with zipfile.ZipFile(R/'deliverables/Xylem_Market_Recommendation.pptx') as z:
    slides=[p for p in z.namelist() if p.startswith('ppt/slides/slide') and p.endswith('.xml') and '/_rels/' not in p]
    charts=sorted(p for p in z.namelist() if '/charts/chart' in p and p.endswith('.xml') and '/_rels/' not in p)
    check('Five slides and two native charts', len(slides)==5 and len(charts)==2)
    check('Two embedded chart workbooks', len([p for p in z.namelist() if p.startswith('ppt/embeddings/') and p.endswith('.xlsx')])==2)
    series=[ET.fromstring(z.read(p)).findall('.//c:ser',ns) for p in charts]
    check('National chart values', np.allclose(vals(series[0][0],'val'),[F['known_replacement']/1e6,F['unknown']/1e6]))
    order=['New York','Ohio','Illinois','Pennsylvania','Texas']
    check('Five-state chart values', np.allclose(vals(series[1][0],'val'),S.loc[order,'Known_Replacement']/1e6) and np.allclose(vals(series[1][1],'val'),S.loc[order,'Unknown']/1e6))
    for i, expected in [(0,['Lead + GRR','Unknown']),(1,order)]:
        for j, ser in enumerate(series[i]):
            labels=[x.text for x in ser.findall('c:cat//c:pt/c:v',ns)]
            check(f'Chart {i+1}, series {j+1}: category order',labels==expected)
    table=ET.fromstring(z.read('ppt/slides/slide4.xml')).find('.//a:tbl',ns)
    check('Recommendation remains an editable table',table is not None)
    rows=[[' '.join(t.text or '' for t in c.findall('.//a:t',ns)).strip() for c in row.findall('a:tc',ns)] for row in table.findall('a:tr',ns)]
    check('Service recommendations match state examples',len(rows)==4 and
          [row[:2] for row in rows[1:]]==[
              ['Texas and Pennsylvania','Identification'],
              ['Illinois','Replacement planning'],
              ['Ohio and New York','Both in parallel']])
    text=' '.join(t.text or '' for p in slides for t in ET.fromstring(z.read(p)).findall('.//a:t',ns))
    for phrase in ['Unknown does not mean lead','Galvanized Requiring Replacement','System coverage is not line coverage','91.4%']:
        check('Visible presentation qualification: '+phrase,phrase in text)

for name,count in [('Executive_Summary',1),('AI_Collaboration_Brief',2),('Xylem_Market_Recommendation',5)]:
    reader=PdfReader(R/'deliverables'/f'{name}.pdf')
    check('PDF page count: '+name,len(reader.pages)==count)
    check('PDF contains text: '+name,all(len(p.extract_text().strip())>100 for p in reader.pages))

artifacts=json.loads((R/'results/artifact_manifest.json').read_text())
for name,digest in artifacts['files'].items():
    check('Published artifact hash: '+name,hashlib.sha256((R/name).read_bytes()).hexdigest()==digest)
receipt_path=R/'.build/presentation-validation.json'
if receipt_path.exists():
    receipt=json.loads(receipt_path.read_text())
    check('Finalized deck hash matches verified file',hashlib.sha256((R/'deliverables/Xylem_Market_Recommendation.pptx').read_bytes()).hexdigest()==receipt['finalSha256'])
    check('Native chart validation passed',receipt['nativeChartValidation']['passed'])
manifest=R/'.build/original_hashes.json'
if manifest.exists():
    old=json.loads(manifest.read_text())
    changed=[]
    for name,digest in old.items():
        candidates=[R.parent/name]
        if name in ['README.md','.gitignore']:
            candidates.append(R/'.build/pre-portfolio'/name)
        if not any(p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==digest for p in candidates):
            changed.append(name)
    check('Original files retained or preserved in portfolio documentation backup',not changed)

report={'status':'passed','check_count':len(checks),'checks':checks,'scope':'Numerical, structural and preservation checks; visual review is separate.'}
(R/'.build').mkdir(exist_ok=True)
(R/'.build/package-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
