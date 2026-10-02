"""Strict conversion of imported quiz formula notation to readable plain text.
Unknown formulas/control characters fail validation rather than being silently removed.
"""
import re, unicodedata
VERSION='20261002-readable-v7'
SYMBOLS={'times':'×','div':'÷','circ':'°','Box':'□','square':'□','bigcirc':'○','triangle':'△','blacksquare':'□','angle':'∠','pi':'π','dots':'…','approx':'≈','ge':'≥','geq':'≥','neq':'≠','rightarrow':'→'}
SUP=str.maketrans('0123456789n+-','⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁺⁻')
def readable(text):
    # Source JSON occasionally decoded LaTeX backslashes as JSON escapes.
    for bad,good in {'\x08ig竞':'□','\x08igcirc':'\\bigcirc','\x08lacksquare':'\\blacksquare','\x08div':'\\div','\x08dot':'\\dot','\x0crac':'\\frac','\times':'\\times','\text':'\\text','\triangle':'\\triangle','\rightarrow':'\\rightarrow','\rule':'\\rule','\neq':'\\neq'}.items():
        text=text.replace(bad,good)
    text=text.replace('┱','□')
    # NUL appears only as the division sign in the source remainder calculations.
    text=re.sub(r'(?<=\d)\s*\x00\s*(?=\d)',' ÷ ',text)
    def formula(m):
        s=m.group(1)
        s=re.sub(r'\\text\{([^{}]*)\}',r'\1',s)
        s=re.sub(r'\\rule\{[^{}]*\}\{[^{}]*\}','____',s)
        s=re.sub(r'\\dot\{([^{}])\}\\dot\{([^{}])\}',r'\1\2（循环节\1\2）',s)
        s=re.sub(r'\\dot\{([^{}])\}',r'\1（循环）',s)
        while re.search(r'\\frac\{([^{}]*)\}\{([^{}]*)\}',s):
            s=re.sub(r'\\frac\{([^{}]*)\}\{([^{}]*)\}',lambda f:'('+f[1]+')/('+f[2]+')' if any(op in f[1]+f[2] for op in '+-') else '('+f[1]+'/'+f[2]+')',s)
        s=re.sub(r'\\([A-Za-z]+)',lambda c:SYMBOLS.get(c[1],c[0]),s)
        s=s.replace('\\%','%').replace('\\_','_')
        s=s.replace('^{°}','°').replace('^°','°')
        s=re.sub(r'\^\{([0-9n+-]+)\}|\^([0-9n]+)',lambda a:(a[1] or a[2]).translate(SUP),s)
        s=re.sub(r'_\{([^{}]+)\}',r'（\1）',s)
        # The source redundantly inserted multiplication before these relations.
        s=re.sub(r'×\s*([÷≈])',r'\1',s)
        return s.strip()
    text=re.sub(r'\$([^$]+)\$',formula,text)
    # Commands outside math delimiters still need conversion (e.g. standalone options).
    text=re.sub(r'\\([A-Za-z]+)',lambda c:SYMBOLS.get(c[1],c[0]),text).replace('\\%','%').replace('\\_','_')
    text=re.sub(r'\s+',' ',text).strip()
    return text

def validate(text):
    assert not re.search(r'[\x00-\x1f\x7f-\x9f]|\\[A-Za-z%_]|[{}^]|\$[^$]+\$',text),repr(text)
    assert '\ufffd' not in text,repr(text)
    assert not any(unicodedata.category(c) in ('Cs','Co') for c in text),repr(text)

def normalize(q):
    q=dict(q)
    # Repairs reviewed against the full stem/options, not guessed symbol removal.
    key=q['id'].removeprefix('enrichment-')
    corrections={
      'licensed-g3up-u4-kp1-5':{'options':['198 + 398','205 + 396','498 + 101','350 + 240'],'answer':'205 + 396','explanation':'分别计算：198 + 398 = 596，205 + 396 = 601，498 + 101 = 599，350 + 240 = 590。只有601大于600。'},
      'licensed-g5down-u2-kp1-2':{'explanation':'24 ÷ 6 = 4，且都是自然数，所以24是6的倍数。16是32的因数，0.8是小数。'},
      'licensed-g6down-u4-kp2-1':{'explanation':'三角形面积 = 底 × 高 ÷ 2。面积一定，底 × 高 = 面积 × 2也一定，因此底和高成反比例。'},
      'licensed-g6down-u4-kp2-3':{'explanation':'比例尺 = 图上距离 ÷ 实际距离。比例尺一定，两种距离的比值一定，因此成正比例。'}
    }
    if key in corrections:q.update(corrections[key])
    for k in ('text','answer','explanation'):
        q[k]=readable(q[k]);validate(q[k])
    q['options']=[readable(x) for x in q['options']]
    for x in q['options']:validate(x)
    assert len(set(q['options']))==4 and q['options'].count(q['answer'])==1,q['id']
    return q
