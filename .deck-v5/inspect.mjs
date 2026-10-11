import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
import {GlobalFonts} from '@napi-rs/canvas';
for(const n of ['Regular','Bold','SemiBold'])GlobalFonts.registerFromPath(`/Users/Darsh/Desktop/xylem/.deck-v4/fonts/Inter-${n}.ttf`);
const p=await PresentationFile.importPptx(await FileBlob.load('.deck-v5/source.pptx'));
await fs.writeFile('.deck-v5/source-proto.json',JSON.stringify(p.toProto()));
await fs.writeFile('.deck-v5/inspect.txt',(await p.inspect({kind:'textbox,shape,chart',maxChars:60000})).ndjson);
for(let i=0;i<5;i++){let b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(`.deck-v5/source-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}
