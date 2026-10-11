import zipfile,copy
from lxml import etree as E
src='DRAFTS/deck_v3/Lead_Service_Line_Data_Story_v3.pptx'; draft='.deck-v4/candidate.pptx';out='.deck-v4/candidate-with-data.pptx'
n={'c':'http://schemas.openxmlformats.org/drawingml/2006/chart'}
with zipfile.ZipFile(src) as a,zipfile.ZipFile(draft) as b:
 data={x:b.read(x) for x in b.namelist()}
 for i in range(1,8):
  path=f'ppt/slides/charts/chart{i}.xml';o=E.fromstring(a.read(path));r=E.fromstring(data[path])
  # Ensure original formulas, categories and numerical caches are unchanged before linking original workbook.
  for tag in ['f','v']:
   assert o.xpath(f'.//c:{tag}/text()',namespaces=n)==r.xpath(f'.//c:{tag}/text()',namespaces=n),(path,tag)
  r.append(copy.deepcopy(o.find('c:externalData',n)))
  if i in [2,5,6]:
   an={'a':'http://schemas.openxmlformats.org/drawingml/2006/main',**n}
   for parent in [r,r.find('c:chart/c:plotArea',n)]:
    if parent is not None:
     sp=parent.find('c:spPr',n)
     if sp is None:sp=E.SubElement(parent,'{'+n['c']+'}spPr')
     for el in list(sp):
      if E.QName(el).localname in ['solidFill','noFill','gradFill','pattFill']:sp.remove(el)
     fill=E.Element('{'+an['a']+'}solidFill');E.SubElement(fill,'{'+an['a']+'}srgbClr',val='F0F2F3');sp.insert(0,fill)
  data[path]=E.tostring(r,xml_declaration=True,encoding='UTF-8',standalone=True)
  rel=f'ppt/slides/charts/_rels/chart{i}.xml.rels';data[rel]=a.read(rel)
 for name in a.namelist():
  if name.startswith('ppt/embeddings/'):
   data[name]=a.read(name)
 # Serialize background panels behind all text and chart content.
 for i in range(1,6):
  name=f'ppt/slides/slide{i}.xml';r=E.fromstring(data[name]);pn={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
  tree=r.find('p:cSld/p:spTree',pn)
  panels=[x for x in tree if x.tag.endswith('}sp') and not x.findall('.//a:t',pn) and x.find('.//a:prstGeom',pn) is not None and x.find('.//a:prstGeom',pn).get('prst')=='rect']
  for x in panels:tree.remove(x)
  for j,x in enumerate(panels):tree.insert(2+j,x)
  data[name]=E.tostring(r,xml_declaration=True,encoding='UTF-8',standalone=True)
 ct='{http://schemas.openxmlformats.org/package/2006/content-types}'
 r=E.fromstring(data['[Content_Types].xml']);original=E.fromstring(a.read('[Content_Types].xml'))
 for entry in original:
  if entry.get('Extension')=='xlsx' or entry.get('PartName','').startswith('/ppt/embeddings/'):
   if not any(E.tostring(x)==E.tostring(entry) for x in r):r.append(copy.deepcopy(entry))
 data['[Content_Types].xml']=E.tostring(r,xml_declaration=True,encoding='UTF-8',standalone=True)
 with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
  for name,content in data.items():z.writestr(name,content)
print('Restored seven original workbooks, byte-for-byte. All chart formulas and cached values match v3.')
