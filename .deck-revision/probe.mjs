import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('DRAFTS/Lead_Service_Line_Data_Story_v2.pptx'));
console.log(p.help('shapes',{search:'delete remove',include:['notes','examples'],maxChars:3000}).text);
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(p.slides.items[0].shapes)));
await fs.writeFile('.deck-revision/proto.json',JSON.stringify(p.toProto(),null,2));
console.log(p.slides.items[3].charts.items.map(c=>({id:c.id,series:c.series.items.map(s=>({name:s.name,fill:s.fill})),position:c.position})));
