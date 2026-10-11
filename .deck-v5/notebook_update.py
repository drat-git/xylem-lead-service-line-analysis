import nbformat,json,hashlib
from pathlib import Path
from nbclient import NotebookClient
p=Path('Lead_Service_Line_Analysis.ipynb'); n=nbformat.read(p,as_version=4)
before={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in Path('outputs').iterdir() if p.is_file()}
code='''identification_larger = (
    state_summary["Unknown"] > state_summary["Known_Replacement"]
)

identification_larger_count = identification_larger.sum()
state_count = len(state_summary)

print(
    f"States/DC where Identification Need exceeds Known Replacement: "
    f"{identification_larger_count} of {state_count}"
)'''
n.cells.insert(40,nbformat.v4.new_code_cell(code))
n.cells[42].source+='\n\nIn 49 of the 51 jurisdictions (50 states and DC), Lead Status Unknown inventory exceeds Known Replacement Inventory, showing that identification is the larger reported need across most states.'
client=NotebookClient(n,timeout=180,kernel_name='python3',resources={'metadata':{'path':str(Path.cwd())}})
client.execute()
assert all(o.output_type!='error' for c in n.cells if c.cell_type=='code' for o in c.outputs)
assert '49 of 51' in n.cells[40].outputs[0].text
nbformat.write(n,p)
print(n.cells[40].outputs[0].text)
print(n.cells[57].outputs[-1].text)
old=nbformat.read('.deck-v5/notebook-before.ipynb',as_version=4)
new_original=n.cells[:40]+n.cells[41:]
assert len(old.cells)==len(new_original)
changed=[i for i,(a,b) in enumerate(zip(old.cells,new_original)) if a.source!=b.source]
assert changed==[41],changed
print('Only new calculation cell and one interpretation sentence changed; all cells executed.')
print('Output byte comparisons:',{k:hashlib.sha256(Path(k).read_bytes()).hexdigest()==v for k,v in before.items()})
