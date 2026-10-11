from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
N={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with ZipFile('.deck-v5/source.pptx') as z: source={n:z.read(n) for n in z.namelist()}
with ZipFile('.deck-v5/edited.pptx') as z: edit={n:z.read(n) for n in z.namelist()}
for i in (4,5):
 path=f'ppt/slides/slide{i}.xml'; root=E.fromstring(source[path]); tree=root.find('p:cSld/p:spTree',N); eroot=E.fromstring(edit[path]); et=eroot.find('p:cSld/p:spTree',N)
 if i==4:
  removed=0
  for sp in list(tree):
   if sp.tag!=f'{{{N["p"]}}}sp':continue
   x=sp.find('p:spPr/a:xfrm/a:off',N)
   if x is not None and int(x.get('x'))/9525>920 and int(x.get('y'))/9525<670 and sp.find('p:txBody',N) is not None:
    tree.remove(sp);removed+=1
  assert removed==5,removed
  for sp in et:
   name=sp.find('p:nvSpPr/p:cNvPr',N)
   if name is not None and name.get('name','').startswith('v5-4-'):tree.append(deepcopy(sp))
 else:
  for sp in list(tree):
   if sp.tag not in (f'{{{N["p"]}}}nvGrpSpPr',f'{{{N["p"]}}}grpSpPr'):tree.remove(sp)
  for sp in et:
   if sp.tag not in (f'{{{N["p"]}}}nvGrpSpPr',f'{{{N["p"]}}}grpSpPr'):tree.append(deepcopy(sp))
 # Ensure unique shape IDs, without changing relationships or visuals.
 for idx,node in enumerate(tree.findall('.//p:cNvPr',N),1):node.set('id',str(idx))
 source[path]=E.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile('.deck-v5/candidate.pptx','w',ZIP_DEFLATED) as z:
 for n,b in source.items():z.writestr(n,b)
with ZipFile('.deck-v5/source.pptx') as a,ZipFile('.deck-v5/candidate.pptx') as b:
 changes=[n for n in a.namelist() if a.read(n)!=b.read(n)]
 assert changes==['ppt/slides/slide4.xml','ppt/slides/slide5.xml'],changes
 print('Only changed package parts:',changes)
