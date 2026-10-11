import fs from 'node:fs/promises';
import {FileBlob,PresentationFile,Presentation} from '@oai/artifact-tool';
import {finalizePresentation,applyPresentationChartFont} from '/Users/Darsh/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='/Users/Darsh/Desktop/xylem', tmp=root+'/.deck-revision';
let p=await PresentationFile.importPptx(await FileBlob.load(root+'/DRAFTS/Lead_Service_Line_Data_Story_v2.pptx'));
const C={navy:'#102A43',blue:'#3F73C7',orange:'#F07C2B',cream:'#F7F4EE',gray:'#BEC7CC',muted:'#65727B'};
function text(s,t,x,y,w,h,size=22,color=C.navy,bold=false){let o=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});o.text=t;o.text.style={typeface:'Arial',fontSize:size,color,bold,autoFit:'none'};return o;}
function line(s,x,y,w,color=C.gray){s.shapes.add({geometry:'line',position:{left:x,top:y,width:w,height:0},fill:'none',line:{fill:color,width:1}})}
function clear(s,charts=true){s.shapes.deleteAll();if(charts) for(const c of [...s.charts.items])s.charts.deleteById(c.id);s.background.fill=C.cream;}
function base(s,n,title){text(s,title,74,42,1135,100,39,C.navy,true);line(s,74,676,1132);text(s,String(n),1187,685,30,20,11,C.muted);}
function foot(s,t){text(s,t,74,685,1090,24,11,C.muted)}
const src='Source: U.S. EPA 2026 Q2 Service Line Inventory';
let s=p.slides.items[0];clear(s);base(s,1,'Lead service line need is not one problem');
text(s,'States face different mixes of identification and replacement work',76,145,1110,40,27);
text(s,'Where are infrastructure needs greatest across U.S. states?',76,212,1100,35,23,C.muted);
text(s,'01  IDENTIFY',78,304,500,48,34,C.orange,true);
text(s,'Resolve Lead Status Unknown lines',78,371,505,36,24);
text(s,'Identification Need\n= Lead Status Unknown',78,428,500,75,23,C.orange);
text(s,'02  REPLACE',704,304,500,48,34,C.blue,true);
text(s,'Act on known Lead and GRR lines',704,371,505,36,24);
text(s,'Known Replacement Inventory\n= Lead + GRR',704,428,505,75,23,C.blue);
text(s,'Comparing states on only one measure would hide where their actual workload sits.',78,565,1110,66,27,C.navy,true);
foot(s,'Scope: 43,993 complete-report Community Water Systems across 50 states and DC');
s=p.slides.items[1];clear(s);base(s,2,'Most of the reported national workload\nis still unresolved identification');
text(s,'National inventory within the analytical sample',77,150,1000,28,19,C.muted);
text(s,'Lead Status Unknown',83,214,760,34,24,C.orange,true);
text(s,'21.59M',83,253,600,70,58,C.orange,true);
const ch=s.charts.add('bar',{position:{left:83,top:323,width:740,height:199},categories:['Known replacement','Unknown'],series:[{name:'Service lines',values:[3115308,21589524],fill:C.orange,points:[{idx:0,fill:C.blue},{idx:1,fill:C.orange}]}],barOptions:{direction:'bar',grouping:'clustered',gapWidth:70},hasLegend:false,xAxis:{visible:false,tickLabelPosition:'none',line:{fill:'none'},majorGridlines:null},yAxis:{visible:false,tickLabelPosition:'none',line:{fill:'none'},majorGridlines:null},chartFill:C.cream,plotAreaFill:C.cream,chartLine:{fill:'none'},plotAreaLine:{fill:'none'}});applyPresentationChartFont(ch,{fontFamily:'Arial'});
text(s,'Known Replacement Inventory',83,527,710,32,22,C.blue,true);
text(s,'3.12M',83,565,230,52,39,C.blue,true);
text(s,'2.18M Lead + 0.94M GRR',294,573,500,36,22,C.muted);
text(s,'6.9×',933,247,290,87,67,C.orange,true);
text(s,'as many Unknown lines as lines already classified for replacement',937,344,280,135,24,C.navy,true);
text(s,'Unknown lines require identification.\nThey are not confirmed lead lines.',937,515,278,95,21,C.muted);
foot(s,src+'. Counts reflect the analytical sample.');
s=p.slides.items[2];clear(s);base(s,3,'The same national challenge looks very different\nfrom state to state');
text(s,'Known Replacement Inventory',318,150,420,30,19,C.blue,true);text(s,'Lead Status Unknown',771,150,410,30,19,C.orange,true);
// Native charts share the same scale. The examples describe workloads, not modeled categories.
function pairChart(state,k,u,y){text(s,state,305,y+3,160,29,21,C.navy,true);let c=s.charts.add('bar',{position:{left:466,top:y-2,width:540,height:63},categories:['Unknown','Known Replacement'],series:[{name:state,values:[u,k],fill:C.blue,points:[{idx:0,fill:C.orange},{idx:1,fill:C.blue}]}],barOptions:{direction:'bar',grouping:'clustered',gapWidth:50},hasLegend:false,xAxis:{visible:false,tickLabelPosition:'none',line:{fill:'none'},majorGridlines:null},yAxis:{visible:false,tickLabelPosition:'none',min:0,max:2400000,line:{fill:'none'},majorGridlines:null},chartFill:C.cream,plotAreaFill:C.cream,chartLine:{fill:'none'},plotAreaLine:{fill:'none'}});applyPresentationChartFont(c,{fontFamily:'Arial'});text(s,k.toLocaleString('en-US'),1028,y-1,170,27,19,C.blue,true);text(s,u.toLocaleString('en-US'),1028,y+29,170,27,19,C.orange,true);}
text(s,'Replacement-\nheavy',78,215,215,70,24,C.navy,true);pairChart('Illinois',672210,529706,217);
text(s,'Largest already-classified replacement inventory',305,288,840,28,18,C.muted);
line(s,78,333,1125);
text(s,'Identification-\nheavy',78,364,215,70,24,C.navy,true);pairChart('Texas',114501,2178881,354);pairChart('Pennsylvania',113717,2055512,423);
text(s,'Much larger unresolved identification inventories',305,491,840,28,18,C.muted);
line(s,78,528,1125);
text(s,'Substantial work\non both dimensions',78,551,220,74,23,C.navy,true);pairChart('Ohio',321502,878788,546);pairChart('New York',289055,951163,607);
foot(s,src+'. Narrative examples, not statistical clusters. All bars use the same scale.');
s=p.slides.items[3];
// Retain the original scatterplot and all 51 observations.
const scatter=s.charts.items[0];
for(const ser of scatter.series.items){if(ser.name==='Ohio and New York'){ser.fill=C.navy;ser.line={fill:C.navy,width:0};}}
// Inspect-based names are preserved in imported series; neutralize the former purple series.
for(const ser of scatter.series.items){if(ser.name.includes('Ohio')||ser.name.toLowerCase().includes('both')){ser.fill=C.navy;ser.line={fill:C.navy,width:0};}}
scatter.scatterOptions.style='marker';for(const ser of scatter.series.items)ser.line={fill:'none',width:0};
clear(s,false);base(s,4,'A single ranking would hide\nwhere each state’s workload sits');
text(s,'Texas',273,181,180,24,15,C.orange,true);text(s,'Pennsylvania',273,219,180,24,15,C.orange,true);text(s,'New York',406,359,160,24,15,C.navy,true);text(s,'Ohio',493,394,130,24,15,C.navy,true);text(s,'Illinois',749,435,130,24,15,C.blue,true);
text(s,'What this reveals',925,160,290,40,25,C.navy,true);
text(s,'Replacement and identification needs do not consistently move together.',925,221,282,100,21);
text(s,'One overall “need” ranking would hide these differences.',925,339,282,86,21);
text(s,'Planning should distinguish known replacement work from inventory still requiring identification.',925,443,282,118,21);
text(s,'This pattern describes inventory. It does not measure progress, maturity, or cause.',925,589,285,73,17,C.muted);
scatter.yAxis.title={text:'Lead Status Unknown Service Lines',textStyle:{typeface:'Arial',fontSize:15,fill:C.navy}};
foot(s,src+'. Each point represents one state or DC.');
s=p.slides.items[4];clear(s);base(s,5,'State size changes who stands out,\nand local evidence is needed before acting');
text(s,'Absolute workload',77,161,329,34,24,C.navy,true);
text(s,'Raw totals show where the largest overall inventories are concentrated.',77,208,315,103,23);
text(s,'Relative scale',435,161,420,34,24,C.navy,true);
text(s,'Per 10,000 state residents',435,205,430,29,22);
text(s,'Raw top 10 retained after normalization',435,245,440,30,18,C.muted);
text(s,'6 of 10',435,286,180,50,36,C.blue,true);text(s,'Known Replacement',616,293,263,34,20,C.blue);
text(s,'3 of 10',435,339,180,50,36,C.orange,true);text(s,'Identification Need',616,346,263,34,20,C.orange);
text(s,'Illinois: #1 Known Replacement\nPennsylvania: #1 Unknown',435,408,442,62,20);
text(s,'Both per 10,000 state residents',435,473,440,26,17,C.muted);
text(s,'Rhode Island, Louisiana and New Mexico become more visible.',435,511,431,65,20);
text(s,'Decision implication',918,161,302,34,24,C.navy,true);
text(s,'State inventories can guide deeper local investigation.',918,208,288,76,23);
text(s,'Intervention decisions require utility-level records, GIS information, inspections, funding information, local capacity, project plans and other local evidence.',918,304,286,240,22);
line(s,77,583,1128,C.navy);
text(s,'Next question',77,599,260,28,18,C.navy,true);
text(s,'How do state and utility identification and replacement needs align with available funding\nand local capacity to complete service-line replacement?',278,596,938,63,20,C.navy,true);
// A readable two-line limitation/source footer replaces the original tiny footer.
for(const sh of [...s.shapes.items]){if(sh.position.top>=676)s.shapes.deleteById(sh.id)}
text(s,'Unknown does not mean lead. Inventory does not measure exposure or water quality. Incomplete-report systems are excluded.',77,661,1125,20,12,C.muted);
text(s,'Sources: U.S. EPA 2026 Q2 Service Line Inventory; U.S. Census Bureau 2025 resident population estimates (population context).',77,686,1125,19,11,C.muted);text(s,'5',1190,686,25,19,11,C.muted);
for(const sl of p.slides.items)sl.speakerNotes.textFrame.setText(src+'. Analytical source: completed Lead_Service_Line_Analysis.ipynb and outputs/state_service_line_summary.csv. Known Replacement Inventory = Lead + GRR. Identification Need = Lead Status Unknown, not confirmed lead. Complete-report Community Water Systems only. No composite ranking. Population comparisons use 2025 Census state resident population for the 2026 Q2 inventory.');
p=Presentation.load(JSON.parse(JSON.stringify(p.toProto()).replaceAll('7356A6','102A43')));
await fs.writeFile(tmp+'/revised-proto.json',JSON.stringify(p.toProto(),null,2));
await (await PresentationFile.exportPptx(p)).save(tmp+'/candidate.pptx');
for(let i=0;i<5;i++) await fs.writeFile(tmp+`/revised-${i+1}.png`,new Uint8Array(await (await p.slides.items[i].export({format:'png',scale:1})).arrayBuffer()));
console.log('Draft and previews ready');
