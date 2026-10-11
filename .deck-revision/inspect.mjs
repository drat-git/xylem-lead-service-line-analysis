import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('/Users/Darsh/Desktop/xylem/DRAFTS/Lead_Service_Line_Data_Story_v2.pptx'));
await fs.writeFile('.deck-revision/inspect.ndjson',(await p.inspect({kind:'slide,textbox,shape,chart,layout',maxChars:100000})).ndjson);
for(let i=0;i<p.slides.items.length;i++) {
 const s=p.slides.items[i];
 await fs.writeFile(`.deck-revision/original-${i+1}.png`,new Uint8Array(await (await s.export({format:'png',scale:1})).arrayBuffer()));
 await fs.writeFile(`.deck-revision/original-${i+1}.json`,await (await s.export({format:'layout'})).text());
}
console.log('Rendered',p.slides.items.length);
