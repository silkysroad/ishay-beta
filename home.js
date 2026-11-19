/* Very Very beta: menu, product rail, jar picker and a cart shared by every page */
(function(){
  var CRE='43224259985526';
  var CAT={
    '43224259985526':{n:'Creatine monohydrate',v:'250g glass jar',p:3499,img:'img/creatine.jpg'},
    '49304402100342':{n:'Flow Tea',v:'8 oz jar, loose leaf',p:2199,img:'img/tea-flow.jpg'},
    '49303786094710':{n:'Breath Tea',v:'8 oz jar, loose leaf',p:2199,img:'img/tea-breath.jpg'},
    '49304309071990':{n:'Relax Tea',v:'8 oz jar, loose leaf',p:2199,img:'img/tea-relax.jpg'}
  };
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var fmt=function(c){return '$'+(c/100).toFixed(2)};

  /* menu */
  var btn=$('.menu-btn'),nav=$('#nav'),det=nav&&$('details',nav);
  if(btn&&nav){
    btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
    nav.addEventListener('click',function(e){if(e.target.closest('a'))nav.classList.remove('open')});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(det)det.open=false;nav.classList.remove('open');btn.setAttribute('aria-expanded',false)}});
    if(det&&matchMedia('(min-width:1000px)').matches)document.addEventListener('click',function(e){if(det.open&&!det.contains(e.target))det.open=false});
  }

  /* hero: one montage, tall cut on phones, three-panel wide cut on desktop */
  var hv=$$('.hero-media video')[0];
  if(hv){
    var wide=matchMedia('(min-width:1000px)').matches;
    if(wide)hv.poster=hv.getAttribute('data-poster-desktop');
    if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
      hv.src=hv.getAttribute(wide?'data-src-desktop':'data-src-phone');
      hv.muted=true;hv.play().catch(function(){});
    }
  }

  /* cart state, kept between pages */
  var cart={};
  try{var saved=JSON.parse(localStorage.getItem('vv-cart'))||{};Object.keys(saved).forEach(function(k){if(CAT[k]&&saved[k]>0)cart[k]=Math.min(99,Math.floor(saved[k]))});}catch(e){}
  function save(){try{localStorage.setItem('vv-cart',JSON.stringify(cart))}catch(e){}}

  /* drawer */
  var dlg=document.createElement('dialog');
  dlg.className='drawer';dlg.id='cart';dlg.setAttribute('aria-labelledby','cart-title');
  dlg.innerHTML='<div class="dr-head"><h2 id="cart-title">Your cart</h2><button class="dr-close" type="button" data-close>Keep shopping</button></div>'+
    '<div class="ship"><p data-ship></p><div class="bar"><i></i></div></div>'+
    '<div class="dr-body"><div data-lines></div><div class="up" data-up></div></div>'+
    '<div class="dr-foot"><div class="sub"><span>Subtotal</span><span data-sub></span></div>'+
    '<a class="btn" data-checkout href="#">Check out</a><small>You finish checkout on ishay.store</small></div>';
  document.body.appendChild(dlg);

  function render(){
    var ids=Object.keys(cart),total=0,count=0,html='';
    ids.forEach(function(id){
      var it=CAT[id],q=cart[id];total+=it.p*q;count+=q;
      html+='<div class="line"><img src="'+it.img+'" alt="" width="92" height="92"><div>'+
        '<div class="n">'+it.n+'</div><div class="v">'+it.v+', '+fmt(it.p)+' each</div>'+
        '<div class="qty"><button type="button" data-dec="'+id+'" aria-label="Remove one '+it.n+'">&minus;</button>'+
        '<output aria-live="polite">'+q+'</output>'+
        '<button type="button" data-inc="'+id+'" aria-label="Add one '+it.n+'">+</button></div></div></div>';
    });
    $('[data-lines]',dlg).innerHTML=html||'<p>Your cart is empty. Add something from the shelf to get started.</p>';
    $('[data-sub]',dlg).textContent=fmt(total);
    var c=cart[CRE]||0;
    $('[data-ship]',dlg).textContent=c>=2?'Your creatine ships free.':c===1?'Add one more jar of creatine and it ships free.':'Two jars of creatine ship free.';
    $('.ship .bar i',dlg).style.width=Math.min(c,2)*50+'%';
    var co=$('[data-checkout]',dlg),has=count>0;
    co.href=has?'https://ishay.store/cart/'+ids.map(function(id){return id+':'+cart[id]}).join(','):'#';
    co.style.opacity=has?1:.4;co.style.pointerEvents=has?'auto':'none';co.setAttribute('aria-disabled',!has);
    $$('[data-count]').forEach(function(el){el.textContent=has?count:''});
    /* one-tap suggestion: the second jar first (it unlocks free shipping), then creatine, then a tea not in the cart yet */
    var up=$('[data-up]',dlg),sid=null,why='';
    if(has){
      if(c===1){sid=CRE;why='Add a second jar and your creatine ships free'}
      else if(c===0){sid=CRE;why='Goes with it'}
      else{sid=['49304402100342','49303786094710','49304309071990'].filter(function(id){return !cart[id]})[0];why='Goes with it'}
    }
    up.innerHTML=sid?'<div class="up-k">'+why+'</div><div class="up-row"><img src="'+CAT[sid].img+'" alt="" width="64" height="64"><div><div class="n">'+CAT[sid].n+'</div><div class="v">'+fmt(CAT[sid].p)+'</div></div><button type="button" data-inc="'+sid+'" aria-label="Add '+CAT[sid].n+' to cart">+ Add</button></div>':'';
    save();
  }
  function open(){if(!dlg.open)dlg.showModal()}
  var calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function bump(){$$('[data-open-cart]').forEach(function(b){if(b.animate&&!calm)b.animate([{transform:'scale(1)'},{transform:'scale(1.28)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.2,.7,.2,1)'})})}
  /* the product image flies from where it was tapped into the bag */
  function fly(from,src,done){
    var ov=document.querySelector('dialog.viewer[open]'),bag=$$('[data-open-cart]',ov||document).filter(function(b){return b.offsetParent})[0];
    if(calm||!from||!bag||!document.body.animate){done();return}
    var a=from.getBoundingClientRect(),b=bag.getBoundingClientRect();
    if(!a.width||a.bottom<0||a.top>innerHeight){done();return}
    var s=Math.min(a.width,a.height,180),g=document.createElement('img');
    g.src=src;g.alt='';g.className='fly';g.style.cssText='left:'+(a.left+a.width/2-s/2)+'px;top:'+(a.top+a.height/2-s/2)+'px;width:'+s+'px;height:'+s+'px';
    (document.querySelector('dialog.viewer[open]')||document.body).appendChild(g);
    var dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2);
    var an=g.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+dx*.55+'px,'+(dy*.55-60)+'px) scale(.55)',opacity:1,offset:.55},{transform:'translate('+dx+'px,'+dy+'px) scale(.12)',opacity:.35}],{duration:560,easing:'cubic-bezier(.3,.1,.3,1)'});
    var fin=function(){g.remove();bump();done()};an.onfinish=fin;an.oncancel=fin;
  }
  function put(id,n){if(!CAT[id])return false;cart[id]=Math.min(99,(cart[id]||0)+(n||1));render();return true}
  function add(id,n,from){if(!CAT[id])return;fly(from,CAT[id].img,function(){put(id,n);open()})}

  dlg.addEventListener('click',function(e){
    var t=e.target;
    if(t===dlg||t.hasAttribute('data-close')){dlg.close();return}
    var inc=t.getAttribute('data-inc'),dec=t.getAttribute('data-dec');
    if(inc){cart[inc]=Math.min(99,(cart[inc]||0)+1);render()}
    if(dec){cart[dec]-=1;if(cart[dec]<=0)delete cart[dec];render()}
  });
  $$('[data-open-cart]').forEach(function(b){b.addEventListener('click',function(){render();open()})});
  $$('[data-add]').forEach(function(b){var t=b.textContent;b.addEventListener('click',function(){var card=b.closest('.card');add(b.getAttribute('data-add'),1,card&&$('.card-shot img',card));b.classList.add('is-added');b.textContent='Added';setTimeout(function(){b.classList.remove('is-added');b.textContent=t},1600)})});

  /* jar picker */
  var radios=$$('input[name=jars]'),words=['','one jar','two jars'];
  function picked(){var r=$('input[name=jars]:checked');return r?+r.value:1}
  function syncPick(){
    var n=picked(),ap=$('[data-add-price]'),bn=$('[data-bar-n]'),bs=$('[data-bar-s]');
    if(ap)ap.textContent=fmt(CAT[CRE].p*n);var pl=$('[data-pick-label]');if(pl)pl.textContent=n>1?'Two':'One';
    if(bn)bn.textContent=words[n];
    if(bs)bs.textContent=fmt(CAT[CRE].p*n)+(n>1?', ships free':'');
  }
  radios.forEach(function(i){i.addEventListener('change',syncPick)});
  ['#add','#add2'].forEach(function(s){var b=$(s);if(b)b.addEventListener('click',function(){add(CRE,picked(),s==='#add'?$('.feature-shot img'):null)})});

  /* sticky buy bar: shows once the main button is off screen */
  var bar=$('#buybar'),main=$('#add');
  if(bar&&main&&'IntersectionObserver' in window){
    new IntersectionObserver(function(en){bar.classList.toggle('show',!en[0].isIntersecting&&en[0].boundingClientRect.top<0)}).observe(main);
  }

  /* product rail arrows */
  var rail=$('.rail');
  if(rail){
    var step=function(d){var card=$('.card',rail);rail.scrollBy({left:d*(card.offsetWidth+24),behavior:'smooth'})};
    var p=$('[data-rail-prev]'),n=$('[data-rail-next]');
    if(p)p.addEventListener('click',function(){step(-1)});
    if(n)n.addEventListener('click',function(){step(1)});
    var edge=function(){if(p)p.disabled=rail.scrollLeft<8;if(n)n.disabled=rail.scrollLeft+rail.clientWidth>rail.scrollWidth-8};
    rail.addEventListener('scroll',edge,{passive:true});window.addEventListener('resize',edge);edge();
  }

  /* vertical videos: add, remove or reorder entries here and the row rebuilds */
  var REELS=[
    {src:'tiktok',id:'7707333202158849298',poster:'img/v-creatine-women.jpg',k:'Creatine',t:'Why it matters for women in perimenopause and menopause.',link:'creatine.html',cta:'Shop Creatine',pid:'43224259985526'},
    {src:'tiktok',id:'7705918195294620936',poster:'img/v-tea-lungs.jpg',k:'Breath Tea',t:'Tea for your lungs.',link:'https://ishay.store/products/breath-tea',cta:'Shop Breath Tea',pid:'49303786094710'},
    {src:'youtube',id:'GOckmMiFrR8',poster:'img/v-preworkout.jpg',k:'Pre-Workout',t:'Creatine, sea salt and matcha.',link:'creatine.html',cta:'Shop Creatine',pid:'43224259985526'},
    {src:'youtube',id:'hegOyvq1xXM',poster:'img/v-sugar.jpg',k:'Sugar Cravings',t:'Two reasons why you crave sugar.',link:'https://www.skool.com/abundanceacademy/about',cta:'Join the Academy',ext:{n:'Abundance Academy',v:'$47 a month on Skool',img:'https://ishay.store/cdn/shop/files/VV47.jpg?width=160'}}
  ];
  var reels=$('[data-reels]');
  if(reels){
    var only=reels.getAttribute('data-reels');
    if(only)REELS=REELS.filter(function(r){return r.link===only});
    var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
    reels.innerHTML=REELS.map(function(r,i){
      return '<article class="reel" data-i="'+i+'"><button class="reel-play" type="button" aria-label="Play: '+esc(r.k+'. '+r.t)+'">'+
        '<img loading="lazy" decoding="async" width="540" height="960" src="'+esc(r.poster)+'" alt=""><span class="pl"></span></button>'+
        '<div class="reel-cap"><div class="k">'+esc(r.k)+'</div><div class="t">'+esc(r.t)+'</div><a href="'+esc(r.link)+'">'+esc(r.cta)+'</a></div></article>';
    }).join('');
    /* full-screen viewer: the video on top, its product and an add button pinned underneath */
    var vw=document.createElement('dialog');vw.className='viewer';vw.setAttribute('aria-label','Video');
    vw.innerHTML='<div class="vw-top"><span class="vw-n" data-vw-n></span><button type="button" class="vw-bag" data-open-cart aria-label="Open cart"><svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M5 10h18l-1.6 13H6.6z"/><path d="M10 10V8a4 4 0 0 1 8 0v2"/></svg><span data-count></span></button><button type="button" class="vw-x" data-vw-close aria-label="Close video"><svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M7 7l14 14M21 7 7 21"/></svg></button></div>'+
      '<div class="vw-stage"><button type="button" class="vw-nav vw-prev" data-vw-step="-1" aria-label="Previous video"></button><div class="vw-frame" data-vw-frame></div><button type="button" class="vw-nav vw-next" data-vw-step="1" aria-label="Next video"></button></div>'+
      '<div class="vw-shop" data-vw-shop></div>';
    document.body.appendChild(vw);
    $('[data-open-cart]',vw).addEventListener('click',function(){render();open()});
    var cur=0,frame=$('[data-vw-frame]',vw),shop=$('[data-vw-shop]',vw);
    var show=function(i){
      cur=(i+REELS.length)%REELS.length;var r=REELS[cur],it=r.pid?CAT[r.pid]:r.ext;
      frame.innerHTML='';
      var f=document.createElement('iframe');
      f.src=r.src==='youtube'?'https://www.youtube.com/embed/'+r.id+'?autoplay=1&playsinline=1&rel=0':'https://www.tiktok.com/player/v1/'+r.id+'?autoplay=1&music_info=0&description=0&rel=0';
      f.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';f.allowFullscreen=true;f.title=r.k+'. '+r.t;
      frame.style.backgroundImage='url("'+r.poster+'")';frame.appendChild(f);
      $('[data-vw-n]',vw).textContent=(cur+1)+' / '+REELS.length;
      $$('.vw-nav',vw).forEach(function(b){b.hidden=REELS.length<2});
      shop.innerHTML='<img src="'+esc(it.img)+'" alt="" width="64" height="64"><div class="vw-info"><div class="n">'+esc(it.n)+'</div><div class="v">'+esc(r.pid?fmt(it.p)+' · '+it.v:it.v)+'</div></div>'+
        (r.pid?'<button type="button" class="btn" data-vw-add="'+r.pid+'">Add to cart</button>':'<a class="btn" href="'+esc(r.link)+'">'+esc(r.cta)+'</a>');
    };
    reels.addEventListener('click',function(e){
      var b=e.target.closest('.reel-play');if(!b)return;
      show(+b.parentNode.getAttribute('data-i'));if(!vw.open)vw.showModal();
    });
    vw.addEventListener('close',function(){frame.innerHTML=''});
    vw.addEventListener('keydown',function(e){if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
    vw.addEventListener('click',function(e){
      var t=e.target.closest('button');if(!t)return;
      if(t.hasAttribute('data-vw-close')){vw.close();return}
      var st=t.getAttribute('data-vw-step');if(st){show(cur+ +st);return}
      var id=t.getAttribute('data-vw-add');
      if(id){
        /* the video keeps playing: the jar flies to the bag and the button confirms, no drawer */
        fly($('img',shop),CAT[id].img,function(){put(id,1)});
        t.textContent='Added';t.classList.add('is-added');
        setTimeout(function(){if(t.isConnected){t.textContent='Add another';t.classList.remove('is-added')}},1500);
      }
    });
    var rbar=$('[data-reel-bar]');
    if(rbar){
      var sync=function(){var max=reels.scrollWidth-reels.clientWidth,w=max>0?reels.clientWidth/reels.scrollWidth:1;rbar.style.width=(w*100)+'%';rbar.style.transform='translateX('+(max>0?(reels.scrollLeft/max)*(1/w-1)*100:0)+'%)';rbar.parentNode.style.visibility=max>4?'visible':'hidden'};
      reels.addEventListener('scroll',sync,{passive:true});window.addEventListener('resize',sync);sync();
    }
  }

  /* email signup: beta only shows the state, nothing is stored until it is wired to his list */
  $$('[data-signup]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var i=$('input',f),m=$('[data-signup-msg]',f.parentNode);
      if(!i.checkValidity()){i.reportValidity();return}
      if(m)m.textContent='Beta preview: signups switch on when this goes live on ishay.store.';
      i.value='';
    });
  });

  syncPick();render();
})();
