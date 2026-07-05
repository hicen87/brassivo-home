// brassivo-subscribe worker v2 — 订阅 + CRM
// 部署：Cloudflare Dashboard → Workers → brassivo-subscribe → Edit Code → 全量替换粘贴
// 绑定：Settings → Bindings → 添加 D1 database，Variable name = DB，选择 brassivo-crm
// （原有 KV 绑定 SUBS 保留不动）
const ADMIN_EMAIL = 'cenhao87@gmail.com';
const ADMIN_HASH = '13911b09475584a29901a3fc16adbf496c97c762c6d13ad1f8ec32cc157752b1'; // sha256('brassivo:'+密码)

async function sha(s){
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('brassivo:'+s));
  return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
}
const J = (o, s, cors) => new Response(JSON.stringify(o), {status:s||200, headers:{...cors,'Content-Type':'application/json'}});

export default {
  async fetch(req, env) {
    const cors = (o) => ({
      'Access-Control-Allow-Origin': /^https?:\/\/((investment|stocks|china)\.)?brassivo\.com$/.test(o) ? o : 'https://brassivo.com',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    const origin = req.headers.get('Origin') || '';
    const C = cors(origin);
    if (req.method === 'OPTIONS') return new Response(null, {headers: C});
    const url = new URL(req.url);
    let body = {};
    if (req.method === 'POST') { try { body = await req.json(); } catch(e){} }
    const email = (body.email||'').trim().toLowerCase();

    // ---- 订阅（试用）----
    if (req.method === 'POST' && url.pathname === '/subscribe') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) return J({ok:false,err:'invalid email'},400,C);
      await env.SUBS.put('email:'+email, JSON.stringify({ts:new Date().toISOString(), ref:req.headers.get('Referer')||''}));
      if (env.DB) await env.DB.prepare("INSERT OR IGNORE INTO subscribers(email,created_at,source) VALUES(?,datetime('now'),?)").bind(email, req.headers.get('Referer')||'').run();
      return J({ok:true},200,C);
    }

    // ---- 激活 Key（服务端校验，激活即建会员账号，初始密码=Key）----
    if (req.method === 'POST' && url.pathname === '/activate') {
      const key = (body.key||'').trim().toUpperCase();
      if (!env.DB) return J({ok:false,err:'db not bound'},500,C);
      const k = await env.DB.prepare('SELECT * FROM keys WHERE activation_key=?').bind(key).first();
      if (!k) return J({ok:false,err:'invalid key'},400,C);
      if (k.used_by && k.used_by !== email) return J({ok:false,err:'key already used'},400,C);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return J({ok:false,err:'invalid email'},400,C);
      const ph = await sha(key);
      const exp = new Date(Date.now() + (k.months||12)*30.44*864e5).toISOString().slice(0,10);
      await env.DB.prepare("INSERT INTO members(email,activation_key,pass_hash,plan,expires_at,created_at) VALUES(?,?,?,?,?,datetime('now')) ON CONFLICT(email) DO UPDATE SET activation_key=?, expires_at=?, plan='pro'")
        .bind(email,key,ph,'pro',exp,key,exp).run();
      await env.DB.prepare('UPDATE keys SET used_by=? WHERE activation_key=?').bind(email,key).run();
      return J({ok:true, expires_at:exp, note:'初始密码=激活Key，请在会员中心修改'},200,C);
    }

    // ---- 会员：查询账户 ----
    if (req.method === 'POST' && url.pathname === '/member/info') {
      const m = await env.DB.prepare('SELECT email,plan,expires_at,created_at FROM members WHERE email=? AND pass_hash=?').bind(email, await sha(body.password||'')).first();
      if (!m) return J({ok:false,err:'邮箱或密码错误'},401,C);
      return J({ok:true, member:m},200,C);
    }

    // ---- 会员：改密码 ----
    if (req.method === 'POST' && url.pathname === '/member/passwd') {
      if ((body.new_password||'').length < 6) return J({ok:false,err:'新密码至少6位'},400,C);
      const r = await env.DB.prepare('UPDATE members SET pass_hash=? WHERE email=? AND pass_hash=?').bind(await sha(body.new_password), email, await sha(body.old_password||'')).run();
      if (!r.meta.changes) return J({ok:false,err:'邮箱或原密码错误'},401,C);
      return J({ok:true},200,C);
    }

    // ---- 管理员 ----
    if (req.method === 'POST' && url.pathname.startsWith('/admin/')) {
      if (email !== ADMIN_EMAIL || await sha(body.password||'') !== ADMIN_HASH) return J({ok:false,err:'管理员认证失败'},401,C);
      if (url.pathname === '/admin/overview') {
        const subs = (await env.DB.prepare('SELECT email,created_at,source FROM subscribers ORDER BY created_at DESC LIMIT 500').all()).results;
        const kv = await env.SUBS.list({prefix:'email:', limit:1000});
        for (const it of kv.keys) { const em = it.name.slice(6); if (!subs.find(s=>s.email===em)) subs.push({email:em, created_at:'(KV旧数据)', source:''}); }
        const members = (await env.DB.prepare('SELECT email,activation_key,plan,expires_at,created_at,note FROM members ORDER BY created_at DESC').all()).results;
        const keys = (await env.DB.prepare('SELECT activation_key,months,used_by,created_at FROM keys ORDER BY created_at DESC').all()).results;
        return J({ok:true, subscribers:subs, members, keys},200,C);
      }
      if (url.pathname === '/admin/genkey') {
        const n = Math.min(body.count||1, 20), months = body.months||12, out=[];
        for (let i=0;i<n;i++){
          const seg=()=>Array.from(crypto.getRandomValues(new Uint8Array(2))).map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
          const k='BRSV-'+seg()+'-'+seg()+'-'+seg();
          await env.DB.prepare("INSERT INTO keys(activation_key,months,created_at) VALUES(?,?,datetime('now'))").bind(k,months).run();
          out.push(k);
        }
        return J({ok:true, keys:out},200,C);
      }
      if (url.pathname === '/admin/setmember') { // 手动调整会员到期日/备注
        await env.DB.prepare('UPDATE members SET expires_at=COALESCE(?,expires_at), note=COALESCE(?,note) WHERE email=?').bind(body.expires_at||null, body.note||null, (body.target||'').toLowerCase()).run();
        return J({ok:true},200,C);
      }
      return J({ok:false,err:'unknown admin action'},404,C);
    }

    if (req.method === 'GET' && url.pathname === '/count') {
      const l = await env.SUBS.list({prefix:'email:', limit:1000});
      return J({count:l.keys.length},200,C);
    }
    return new Response('brassivo-subscribe v2', {headers: C});
  }
};
