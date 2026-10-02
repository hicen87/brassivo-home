"""Import licensed standalone choices and original distinct scenes. No name/number variants.
Usage: python3 tools/expand-question-bank.py /tmp/kart-bank-source.zip
Source is ChinaTextbookStudyFree release v1.2.0-assets, MIT licensed original quizzes.
"""
import json,re,sys,zipfile,hashlib,difflib
from pathlib import Path
from collections import defaultdict,Counter
ROOT=Path(__file__).resolve().parents[1];p=ROOT/'block-kart/question-bank.json'
b=json.loads(p.read_text());legacy=json.loads((ROOT/'tools/question-content/legacy.json').read_text())['questions']
groups=defaultdict(list)
def norm(t):
 t=re.sub(r'\d+(?:\.\d+)?|\s|[，。！？：、,.!?;:＿_（）()]','',t)
 return re.sub(r'小[明红华丽刚军]|Tom|Amy|Mike|Sarah|John|Chen Jie|Lucy|Lily|Sam|Ben','',t,flags=re.I).lower()
def accept(q):
 if not q.get('explanation') or len(q['options'])!=4 or len(set(q['options']))!=4 or q['options'].count(q['answer'])!=1:return False
 n=norm(q['text']);pool=groups[q['grade'],q['subject']]
 if any(difflib.SequenceMatcher(None,n,x['_norm']).ratio()>.8 for x in pool):return False
 q['_norm']=n;pool.append(q);return True
z=zipfile.ZipFile(sys.argv[1])
# These require unseen context, an image, multi-select, or have known ambiguous alternatives.
missing=re.compile(r'图片|如图|下图|图中|课文|文中|短文|划线|画线|加点|下划线|听录音|根据图|阅读.*回答|上文|根据.*文章|多选|哪些|\\(?:frac|begin|sqrt|times)')
ambiguous={'The farm is so _______. I like it.',"Look at the green beans. They are _______ long.","Let's drink some milk. It's time for ____.",'Where do you play football? In the ________.','下列词语搭配完全正确的一项是：'}
for path in sorted(z.namelist()):
 if '/lessons/' not in path:continue
 d=json.loads(z.read(path));m=re.search(r'(chinese|english|science)?-?g([1-6])',d['bookId'])
 if not m:continue
 s=m[1] or 'math';g=int(m[2])
 for i,q in enumerate(d.get('questions',[])):
  if q.get('type')!='choice' or missing.search(q['question']) or q['question'] in ambiguous:continue
  opts=q.get('options',[])
  if not all(isinstance(x,str) for x in opts):continue
  new=dict(id=f'licensed-{d["id"]}-{i}',grade=g,subject=s,text=q['question'],answer=q.get('answer'),options=opts,explanation=q.get('explanation',''),difficulty='thinking',level=q.get('difficulty',1),topic=q.get('knowledge_point',d['title']),source='ChinaTextbookStudyFree v1.2.0-assets',sourcePath=path)
  accept(new)
# Original hand-written scene cards can be reused at higher grades where the concepts remain applicable.
for file in sorted((ROOT/'tools/question-content').glob('*.txt')):
 s=file.stem
 for i,line in enumerate(file.read_text().splitlines()):
  if line.startswith('#') or not line.strip():continue
  parts=line.split('|');text,a,w=parts[:3];options=[a,*w.split('/')];assert len(options)==4,(file,i)
  if len(parts)==4:e=parts[3]
  else:
   principles={'ethics':'诚实、尊重、公平和负责，要结合对他人的实际影响判断','pe':'先考虑安全，再根据运动目标改善动作或合作','labor':'按任务要求和步骤操作，同时保护物品、自己与他人','it':'区分实际输入、证据和权限，核对结果并保护信息','practice':'把猜想与证据分开，考虑条件、范围和真实需要'}
   e=principles.get(s,'根据观察与任务条件判断')+'。这件事应选择“'+a+'”；“'+options[1]+'”没有满足题干中的要求。'
  for g in range(1,7):
   if s=='it' and g<3:continue
   accept(dict(id=f'curated-{s}-{g}-{i}',grade=g,subject=s,text=text,answer=a,options=options,explanation=e,difficulty='thinking',level=2,topic=f'{s}-scene-{i}',source='Brassivo original'))
# Retain only structurally and lexically distinct originals, not the legacy arithmetic/name variants.
for q in legacy:
 if q['subject']=='local':continue
 q=dict(q);q.setdefault('explanation','知识依据：'+q['answer']);q['difficulty']='thinking';q.setdefault('level',2 if q.get('topic') else 1)
 accept(q)
# Olympiad selection includes grade-appropriate mathematical reasoning/enrichment,
# not numeric clones of nine puzzle templates. Standalone source reasoning is reused
# with source links intact; exclude bare calculations and direct word recognition.
for g in range(1,7):
 pool=list(groups[g,'math']);pool.sort(key=lambda q:(-q.get('level',1),q['id']))
 for q in pool:
  if len(groups[g,'olympiad'])>=110:break
  if q.get('source')!='ChinaTextbookStudyFree v1.2.0-assets' or len(q['text'])<18:continue
  if re.match(r'^(?:计算|口算|直接写|下列数字)',q['text']):continue
  new=dict(q);new['subject']='olympiad';new['id']='enrichment-'+q['id'];new['topic']='数学拓展：'+q['topic'];new.pop('_norm',None);accept(new)
# Persist deterministic content clusters; used to separate closely related questions during play.
questions=[]
for key,pool in sorted(groups.items()):
 for q in pool:
  q.pop('_norm',None);q['family']=q.get('topic') or norm(q['text'])
  questions.append(q)
b['questions']=questions;b['version']='20261002-diverse-v6'
b['notice']='分年级复习选择题，含MIT授权开源原创题与Brassivo原创场景题；并非浙江官方题库，教材进度因学校而异。英语、信息科技从三年级起提供。'
b['sources']=[{'name':'ChinaTextbookStudyFree','url':'https://github.com/wuwangzhang1216/ChinaTextbookStudyFree','release':'v1.2.0-assets','license':'MIT','archiveSha256':hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest(),'notice':'来源项目声明为AI原创，非教材原题；筛除缺图、缺上下文、多选及近似题。'},{'name':'Brassivo','license':'project license','notice':'独立编写的原创场景、知识点与判断题，不用名字/数值替换扩充。'}]
for g in range(1,7):
 for s in b['subjects']:
  if g<3 and s in ('english','it'):continue
  assert len(groups[g,s])>=100,(g,s,len(groups[g,s]))
p.write_text(json.dumps(b,ensure_ascii=False,indent=2)+'\n')
counts={f'{g}:{s}':len(pool) for (g,s),pool in sorted(groups.items())}
(ROOT/'block-kart/question-bank-counts.json').write_text(json.dumps({'version':b['version'],'total':len(questions),'pools':counts},ensure_ascii=False,indent=2)+'\n')
print('total',len(questions));print(counts)
