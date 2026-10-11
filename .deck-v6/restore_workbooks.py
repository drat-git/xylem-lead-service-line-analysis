import copy
import zipfile
from decimal import Decimal, InvalidOperation
from lxml import etree as E

source_path = 'DRAFTS/Lead_Service_Line_Data_Story_v5.pptx'
draft_path = '.deck-v6/candidate.pptx'
output_path = '.deck-v6/candidate-with-data.pptx'

chart_ns = {'c': 'http://schemas.openxmlformats.org/drawingml/2006/chart'}
rels_ns = {'r': 'http://schemas.openxmlformats.org/package/2006/relationships'}
drawing_ns = 'http://schemas.openxmlformats.org/drawingml/2006/main'

with zipfile.ZipFile(source_path) as source_zip, zipfile.ZipFile(draft_path) as draft_zip:
    data = {name: draft_zip.read(name) for name in draft_zip.namelist()}

    for index in range(1, 8):
        source_chart_path = f'ppt/charts/chart{index}.xml'
        draft_chart_path = f'ppt/slides/charts/chart{index}.xml'
        source_chart = E.fromstring(source_zip.read(source_chart_path))
        draft_chart = E.fromstring(data[draft_chart_path])

        # The edit may change chart appearance and geometry, but never its data.
        for tag in ('f', 'v'):
            source_values = source_chart.xpath(f'.//c:{tag}/text()', namespaces=chart_ns)
            draft_values = draft_chart.xpath(f'.//c:{tag}/text()', namespaces=chart_ns)
            if tag == 'f':
                assert source_values == draft_values, (index, tag)
            else:
                assert len(source_values) == len(draft_values), (index, tag, 'length')
                for source_value, draft_value in zip(source_values, draft_values):
                    if source_value == draft_value:
                        continue
                    try:
                        assert Decimal(source_value) == Decimal(draft_value), (index, source_value, draft_value)
                    except InvalidOperation:
                        raise AssertionError((index, source_value, draft_value))

        external_data = source_chart.find('c:externalData', chart_ns)
        assert external_data is not None
        existing = draft_chart.find('c:externalData', chart_ns)
        if existing is not None:
            draft_chart.remove(existing)
        draft_chart.append(copy.deepcopy(external_data))
        if index in (2, 5, 6):
            for parent in (draft_chart, draft_chart.find('c:chart/c:plotArea', chart_ns)):
                if parent is None:
                    continue
                shape_props = parent.find('c:spPr', chart_ns)
                if shape_props is None:
                    shape_props = E.SubElement(parent, f'{{{chart_ns["c"]}}}spPr')
                for child in list(shape_props):
                    if E.QName(child).localname in ('solidFill', 'noFill', 'gradFill', 'pattFill'):
                        shape_props.remove(child)
                fill = E.Element(f'{{{drawing_ns}}}solidFill')
                E.SubElement(fill, f'{{{drawing_ns}}}srgbClr', val='F0F2F3')
                shape_props.insert(0, fill)
        data[draft_chart_path] = E.tostring(
            draft_chart, xml_declaration=True, encoding='UTF-8', standalone=True
        )

        source_rels_path = f'ppt/charts/_rels/chart{index}.xml.rels'
        draft_rels_path = f'ppt/slides/charts/_rels/chart{index}.xml.rels'
        relationships = E.fromstring(source_zip.read(source_rels_path))
        for rel in relationships.findall('r:Relationship', rels_ns):
            target = rel.get('Target')
            if target and target.startswith('../embeddings/'):
                rel.set('Target', f'../../embeddings/{target.split("/")[-1]}')
        data[draft_rels_path] = E.tostring(
            relationships, xml_declaration=True, encoding='UTF-8', standalone=True
        )

    for name in source_zip.namelist():
        if name.startswith('ppt/embeddings/'):
            data[name] = source_zip.read(name)

    content_types_ns = 'http://schemas.openxmlformats.org/package/2006/content-types'
    content_types = E.fromstring(data['[Content_Types].xml'])
    source_content_types = E.fromstring(source_zip.read('[Content_Types].xml'))
    for entry in source_content_types:
        if entry.get('Extension') == 'xlsx' or entry.get('PartName', '').startswith('/ppt/embeddings/'):
            if not any(E.tostring(existing) == E.tostring(entry) for existing in content_types):
                content_types.append(copy.deepcopy(entry))
    data['[Content_Types].xml'] = E.tostring(
        content_types, xml_declaration=True, encoding='UTF-8', standalone=True
    )

    # Artifact Tool can serialize newly added rectangles after text. Move only
    # non-text rectangle panels to the back so they cannot obscure v5 content.
    slide_ns = {
        'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
        'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    }
    for slide_number in range(1, 6):
        slide_path = f'ppt/slides/slide{slide_number}.xml'
        slide_root = E.fromstring(data[slide_path])
        shape_tree = slide_root.find('p:cSld/p:spTree', slide_ns)
        panels = []
        for node in list(shape_tree):
            if node.tag != f'{{{slide_ns["p"]}}}sp' or node.findall('.//a:t', slide_ns):
                continue
            geometry = node.find('.//a:prstGeom', slide_ns)
            if geometry is not None and geometry.get('prst') == 'rect':
                panels.append(node)
        for panel in panels:
            shape_tree.remove(panel)
        for offset, panel in enumerate(panels):
            shape_tree.insert(2 + offset, panel)

        # Reuse the stable slide-2 footer shape shell on slide 4. The original
        # slide-4 footer geometry is valid, but one renderer shifts that shape
        # after background-panel reordering.
        if slide_number == 4:
            slide2_root = E.fromstring(data['ppt/slides/slide2.xml'])
            slide2_tree = slide2_root.find('p:cSld/p:spTree', slide_ns)
            footer4 = next(
                node for node in shape_tree
                if ''.join(node.xpath('.//a:t/text()', namespaces=slide_ns)).startswith('Source:')
            )
            footer2 = next(
                node for node in slide2_tree
                if ''.join(node.xpath('.//a:t/text()', namespaces=slide_ns)).startswith('Source:')
            )
            footer_text = ''.join(footer4.xpath('.//a:t/text()', namespaces=slide_ns))
            footer_copy = copy.deepcopy(footer2)
            text_nodes = footer_copy.xpath('.//a:t', namespaces=slide_ns)
            text_nodes[0].text = footer_text
            for extra in text_nodes[1:]:
                extra.text = ''
            old_meta = footer4.find('p:nvSpPr/p:cNvPr', slide_ns)
            new_meta = footer_copy.find('p:nvSpPr/p:cNvPr', slide_ns)
            new_meta.set('id', old_meta.get('id'))
            new_meta.set('name', old_meta.get('name', 'Source'))
            footer_copy.find('p:spPr/a:xfrm/a:ext', slide_ns).set('cx', str(800 * 9525))
            shape_tree.replace(footer4, footer_copy)
        data[slide_path] = E.tostring(
            slide_root, xml_declaration=True, encoding='UTF-8', standalone=True
        )

with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as output_zip:
    for name, content in data.items():
        output_zip.writestr(name, content)

print('Restored all seven original v5 chart workbooks after verifying formulas and cached values.')
