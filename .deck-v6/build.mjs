import fs from 'node:fs/promises';
import { GlobalFonts } from '@napi-rs/canvas';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';
import { applyPresentationChartFont } from '/Users/Darsh/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations/container_tools/artifact_tool_utils.mjs';

const root = '/Users/Darsh/Desktop/xylem';
const tmp = `${root}/.deck-v6`;
const source = `${root}/DRAFTS/Lead_Service_Line_Data_Story_v5.pptx`;
for (const n of ['Regular', 'Bold', 'SemiBold']) {
  GlobalFonts.registerFromPath(`${root}/.deck-v4/fonts/Inter-${n}.ttf`);
}

const p = await PresentationFile.importPptx(await FileBlob.load(source));
const before = (await p.inspect({ kind: 'textbox', maxChars: 100000 })).ndjson
  .split('\n').filter(Boolean).map(JSON.parse).filter(x => x.kind === 'textbox');

const C = {
  navy: '#102A43', blue: '#3F73C7', orange: '#F07C2B', cream: '#F7F4EE',
  border: '#CBD2D6', muted: '#52636E', pale: '#EDF0F1', white: '#FFFFFF',
  warm: '#F3E9DE',
};

function get(slideNo, prefix) {
  const onSlide = before.filter(r => r.slide === slideNo);
  const exact = onSlide.filter(r => r.text === prefix);
  const matches = exact.length === 1 ? exact : onSlide.filter(r => r.text.startsWith(prefix));
  if (matches.length !== 1) throw new Error(`Expected one match on slide ${slideNo} for ${prefix}; got ${matches.length}`);
  return { r: matches[0], o: p.resolve(matches[0].id) };
}
function put(slideNo, prefix, x, y, w, h, size = 22, color = C.navy, bold = false, align = 'left') {
  const { o } = get(slideNo, prefix);
  o.position = { left: x, top: y, width: w, height: h };
  o.text.style = {
    typeface: 'Inter', fontSize: size, color, bold, alignment: align,
    verticalAlignment: 'top', autoFit: 'none', insets: { left: 0, right: 0, top: 0, bottom: 0 },
  };
  return o;
}
function box(s, x, y, w, h, fill = C.pale, border = C.border) {
  const o = s.shapes.add({
    geometry: 'rect', position: { left: x, top: y, width: w, height: h },
    fill, line: { fill: border ?? 'none', width: border ? 1 : 0 },
  });
  o.sendToBack();
  return o;
}
function rule(s, x, y, w, color = C.border, width = 1) {
  return s.shapes.add({
    geometry: 'line', position: { left: x, top: y, width: w, height: 0 },
    fill: 'none', line: { fill: color, width },
  });
}
function replaceText(slideNo, prefix, x, y, w, h, size, color = C.navy, bold = false) {
  const s = p.slides.items[slideNo - 1];
  const { o } = get(slideNo, prefix);
  const content = o.text.toString();
  s.shapes.deleteById(o.id);
  const fresh = s.shapes.add({
    geometry: 'textbox', position: { left: x, top: y, width: w, height: h },
    fill: 'none', line: { fill: 'none', width: 0 },
  });
  fresh.text = content;
  fresh.text.style = {
    typeface: 'Inter', fontSize: size, color, bold, alignment: 'left',
    verticalAlignment: 'top', autoFit: 'none', insets: { left: 0, right: 0, top: 0, bottom: 0 },
  };
  return fresh;
}

// Establish the v4 canvas treatment across all five v5 slides.
for (let i = 1; i <= 5; i++) {
  const s = p.slides.items[i - 1];
  s.background.fill = C.cream;
  const textIds = new Set(before.filter(r => r.slide === i).map(r => p.resolve(r.id).id));
  for (const sh of [...s.shapes.items]) {
    if (!textIds.has(sh.id)) s.shapes.deleteById(sh.id);
  }
  for (const chart of s.charts.items) applyPresentationChartFont(chart, { fontFamily: 'Inter' });
}

// Slide 1: restore v4's cover band and two framed workstreams.
{
  const s = p.slides.items[0];
  box(s, 0, 0, 1280, 220, C.navy, null);
  box(s, 74, 347, 538, 208, '#F8F1E9');
  box(s, 646, 347, 560, 208, '#EEF2F6');
  put(1, 'Where are infrastructure', 74, 38, 1132, 146, 48, C.white, true);
  put(1, 'Lead service line need', 74, 235, 1132, 44, 30, C.navy, true);
  put(1, 'States face different', 74, 282, 1132, 36, 24);
  put(1, '01', 94, 364, 486, 48, 31, C.orange, true);
  put(1, 'Resolve Lead', 94, 422, 486, 35, 22);
  put(1, 'Identification Need', 94, 476, 485, 66, 22, C.orange);
  put(1, '02', 666, 364, 510, 48, 31, C.blue, true);
  put(1, 'Act on known', 666, 422, 510, 35, 22);
  put(1, 'Known Replacement Inventory', 666, 476, 510, 66, 22, C.blue);
  put(1, 'Comparing states', 74, 585, 1132, 66, 25, C.navy, true);
  rule(s, 74, 675, 1132);
  put(1, 'Scope:', 74, 686, 1096, 26, 12, C.muted);
  put(1, '1', 1191, 689, 25, 20, 12, C.muted);
}

// Slide 2: retain the v5 evidence and use v4's asymmetrical emphasis panel.
{
  const s = p.slides.items[1];
  put(2, 'Most of the reported', 74, 38, 1132, 110, 38);
  put(2, 'National inventory', 74, 151, 1090, 30, 20, C.muted);
  s.charts.items[0].position = { left: 74, top: 263, width: 744, height: 278 };
  put(2, 'Lead Status Unknown', 82, 235, 510, 40, 24, C.orange, true);
  put(2, '21.59M', 634, 222, 205, 57, 39, C.orange, true);
  put(2, 'Known Replacement Inventory', 82, 387, 540, 38, 23, C.blue, true);
  put(2, '3.12M', 201, 440, 230, 58, 39, C.blue, true);
  put(2, '2.18M', 82, 524, 720, 34, 23, C.muted);
  rule(s, 862, 219, 0);
  put(2, '6.9×', 906, 227, 300, 100, 68, C.orange, true);
  put(2, 'as many Unknown', 908, 345, 300, 122, 24, C.navy, true);
  box(s, 898, 493, 308, 129, C.warm, null);
  put(2, 'Unknown lines require', 916, 509, 274, 100, 22);
  rule(s, 74, 675, 1132);
  put(2, 'Source:', 74, 686, 1096, 26, 12, C.muted);
  put(2, '2', 1191, 689, 25, 20, 12, C.muted);
}

// Slide 3: bring back v4's full-width category bands.
{
  const s = p.slides.items[2];
  put(3, 'The same national', 74, 36, 1132, 110, 38);
  put(3, 'Known Replacement Inventory', 378, 151, 454, 30, 19, C.blue, true);
  put(3, 'Lead Status Unknown', 839, 151, 367, 30, 19, C.orange, true);
  box(s, 74, 200, 1132, 114, '#F0F2F3', null);
  rule(s, 74, 330, 1132);
  box(s, 74, 502, 1132, 156, '#F0F2F3', null);
  put(3, 'Replacement-', 90, 220, 266, 58, 25, C.navy, true);
  put(3, 'Identification-', 90, 354, 280, 64, 24, C.navy, true);
  put(3, 'Substantial work', 90, 535, 266, 94, 25, C.navy, true);
  const rows = [
    ['Illinois', '672,210', '529,706', 209], ['Texas', '114,501', '2,178,881', 339],
    ['Pennsylvania', '113,717', '2,055,512', 403], ['Ohio', '321,502', '878,788', 516],
    ['New York', '289,055', '951,163', 585],
  ];
  rows.forEach(([name, known, unknown, y], j) => {
    put(3, name, 380, y + 7, 182, 36, 21, C.navy, true);
    const chart = s.charts.items[j];
    chart.position = { left: 558, top: y, width: 470, height: 60 };
    chart.chartFill = j === 0 || j >= 3 ? '#F0F2F3' : C.cream;
    chart.plotAreaFill = j === 0 || j >= 3 ? '#F0F2F3' : C.cream;
    const knownValue = Number(known.replaceAll(',', ''));
    const unknownValue = Number(unknown.replaceAll(',', ''));
    put(3, known, 568 + 450 * knownValue / 2400000 + 12, y, 146, 29, 19, C.blue, true);
    put(3, unknown, 568 + 450 * unknownValue / 2400000 + 12, y + 29, 146, 29, 19, C.orange, true);
  });
  put(3, 'Largest already-classified', 380, 274, 796, 29, 18, C.muted);
  put(3, 'Much larger unresolved', 380, 466, 796, 29, 18, C.muted);
  rule(s, 74, 675, 1132);
  replaceText(3, 'Source:', 74, 686, 1096, 26, 12, C.muted);
  put(3, '3', 1191, 689, 25, 20, 12, C.muted);
}

// Slide 4: use v4's shaded interpretation rail with v5's expanded logic.
{
  const s = p.slides.items[3];
  put(4, 'A single ranking', 74, 36, 1132, 110, 38);
  s.charts.items[0].position = { left: 92, top: 150, width: 782, height: 458 };
  for (const ser of s.charts.items[0].series.items) ser.line = { fill: 'none', width: 0 };
  put(4, 'Texas', 273, 179, 180, 27, 16, C.orange, true);
  put(4, 'Pennsylvania', 273, 217, 180, 27, 16, C.orange, true);
  put(4, 'New York', 406, 357, 160, 27, 16, C.navy, true);
  put(4, 'Ohio', 493, 394, 130, 27, 16, C.navy, true);
  put(4, 'Illinois', 744, 433, 138, 27, 16, C.blue, true);
  box(s, 908, 157, 298, 502, C.pale, null);
  put(4, 'WHAT THIS REVEALS', 923, 173, 266, 30, 20, C.navy, true);
  put(4, 'For Unknown lines', 923, 215, 266, 80, 21, C.navy, true);
  put(4, 'An Unknown line', 923, 302, 266, 70, 17);
  put(4, 'Known Lead + GRR', 923, 379, 266, 64, 17);
  put(4, 'Nationally, Unknown', 923, 451, 266, 66, 17);
  put(4, 'Identification Need', 923, 525, 266, 54, 18, C.orange, true);
  rule(s, 924, 588, 266);
  put(4, 'This describes reported', 923, 598, 266, 50, 13, C.muted);
  rule(s, 74, 675, 1132);
  replaceText(4, 'Source:', 74, 686, 1096, 26, 12, C.muted);
  put(4, '4', 1191, 689, 25, 20, 12, C.muted);
}

// Slide 5: retain all v5 conclusions and use v4's split body, metric panel, and dark close.
{
  const s = p.slides.items[4];
  put(5, 'Closing the identification', 74, 34, 1132, 108, 38, C.navy, true);
  put(5, 'Decision implication', 74, 157, 600, 31, 22, C.navy, true);
  put(5, 'The more Unknown', 74, 194, 1132, 82, 30, C.navy, true);
  put(5, 'Why population context', 74, 300, 530, 35, 25, C.navy, true);
  put(5, 'Raw totals show', 74, 346, 530, 55, 20);
  put(5, 'Per 10,000', 74, 411, 530, 58, 20);
  put(5, 'These rates do not', 74, 481, 530, 48, 16, C.muted);
  box(s, 632, 301, 574, 228, C.pale, null);
  put(5, 'Raw top 10 retained', 654, 321, 530, 30, 17, C.muted);
  put(5, '6 of 10', 654, 366, 150, 44, 31, C.blue, true);
  put(5, 'Known Replacement', 816, 372, 360, 31, 20, C.blue);
  put(5, '3 of 10', 654, 418, 150, 44, 31, C.orange, true);
  put(5, 'Identification Need', 816, 424, 360, 31, 20, C.orange);
  put(5, 'Illinois:', 654, 473, 520, 54, 16, C.muted);
  box(s, 74, 551, 1132, 96, C.navy, null);
  put(5, 'Next question', 90, 570, 176, 33, 18, C.white, true);
  put(5, 'Once service lines', 282, 567, 907, 68, 21, C.white, true);
  put(5, 'Unknown does not mean', 74, 660, 1110, 20, 12, C.muted);
  put(5, 'Sources:', 74, 686, 1100, 20, 12, C.muted);
  put(5, '5', 1191, 689, 20, 20, 12, C.muted);
}

// Content lock: every v5 textbox must remain byte-for-byte identical.
const after = (await p.inspect({ kind: 'textbox', maxChars: 100000 })).ndjson
  .split('\n').filter(Boolean).map(JSON.parse).filter(x => x.kind === 'textbox');
for (let i = 1; i <= 5; i++) {
  const a = before.filter(r => r.slide === i).map(r => r.text).sort();
  const b = after.filter(r => r.slide === i).map(r => r.text).sort();
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`Content differs on slide ${i}`);
}

await fs.mkdir(tmp, { recursive: true });
await (await PresentationFile.exportPptx(p)).save(`${tmp}/candidate.pptx`);
for (let i = 0; i < 5; i++) {
  const preview = await p.export({ slide: p.slides.items[i], format: 'png', scale: 1 });
  await fs.writeFile(`${tmp}/preview-${i + 1}.png`, new Uint8Array(await preview.arrayBuffer()));
}
console.log('Created v6 candidate with exact v5 textbox content and v4-derived styling.');
