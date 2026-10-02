window.GameAPI={base:'https://game-api.brassivo.com',async call(path,body){
  let r;
  try{r=await fetch(this.base+path,{method:body===undefined?'GET':'POST',credentials:'include',signal:AbortSignal.timeout(['/register','/login'].includes(path)?15000:8000),headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}
  catch(e){throw Error(e.name==='TimeoutError'||e.name==='AbortError'?'请求超时，请稍后重试；若刚刚注册，可用同一账号和密码尝试登录。':'无法连接账号服务，请检查网络后重试。');}
  let data;try{data=await r.json();}catch(e){throw Error('账号服务返回异常，请稍后重试。');}
  if(!r.ok||!data.ok){const error=Error(data.error||'请求失败，请稍后重试。');error.status=r.status;throw error;}return data;
}};
