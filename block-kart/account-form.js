(function(root){
  function validate(username,password){
    username=String(username||'').trim().toLowerCase();
    if(!/^[a-z0-9_]{3,20}$/.test(username))throw Error('账号请输入3–20位英文字母、数字或下划线，例如 kart_player。');
    if(typeof password!=='string'||password.length<8||password.length>128)throw Error('密码需要8–128位；请使用注册时设置的密码。');
    return {username,password};
  }
  async function authenticate(api,path,body){
    const response=await api.call(path,body);
    try{
      const session=await api.call('/me');
      if(!session.user||session.user.username!==response.user?.username)throw Error('浏览器没有保存登录状态，请检查此站点的Cookie设置后重新登录。');
      return session.user;
    }catch(e){throw Error((path==='/register'?'账号已注册成功，但自动登录未完成。':'登录状态未确认。')+e.message);}
  }
  function mount({api=root.GameAPI,document=root.document,onUser=()=>{}}={}){
    const $=id=>document.getElementById(id),form=$('authForm');let revision=0,busy=false;
    const status=text=>$('accountStatus').textContent=text;
    function display(u,message){form.hidden=!!u;$('logout').hidden=!u;status(message||(u?'已登录：'+u.username:'新玩家请注册账号，已有账号直接登录。'));onUser(u);}
    async function refresh(){if(busy)return;const ticket=++revision;status('正在检查登录状态…');try{const r=await api.call('/me');if(ticket===revision)display(r.user);}catch(e){if(ticket===revision)status(e.message);}}
    form.noValidate=true;
    form.onsubmit=async e=>{
      e.preventDefault();if(busy)return;
      let body;try{body=validate($('username').value,$('password').value);}catch(e){status(e.message);return;}
      const path=e.submitter?.value==='register'?'/register':'/login',ticket=++revision;
      busy=true;const buttons=[...form.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
      status(path==='/register'?'正在注册账号并登录…':'正在登录…');
      try{const u=await authenticate(api,path,body);if(ticket!==revision)return;$('password').value='';display(u,(path==='/register'?'注册成功，已登录：':'登录成功：')+u.username);}
      catch(e){if(ticket===revision)status(e.message);}
      finally{busy=false;buttons.forEach(b=>b.disabled=false);}
    };
    $('logout').onclick=async()=>{if(busy)return;busy=true;const ticket=++revision;$('logout').disabled=true;try{await api.call('/logout',{});if(ticket===revision)display(null,'已退出登录，可以注册新账号或重新登录。');}catch(e){if(ticket===revision)status(e.message);}finally{busy=false;$('logout').disabled=false;}};
    return {refresh};
  }
  root.GameAccount={validate,authenticate,mount};
})(globalThis);
