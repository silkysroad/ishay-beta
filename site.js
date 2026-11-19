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
    btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o);btn.textContent=o?'Close':'Menu';});
    document.addEventListener('click',function(e){if(det&&det.open&&!det.contains(e.target))det.open=false;});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&det)det.open=false;});
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
    '<div class="dr-body" data-lines></div>'+
    '<div class="dr-foot"><div class="sub"><span>Subtotal</span><span data-sub></span></div>'+
    '<a class="btn btn-gold" data-checkout href="#">Check out</a><small>You finish checkout on ishay.store</small></div>';
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
    $$('[data-count]').forEach(function(el){el.textContent=has?'('+count+')':''});
    save();
  }
  function open(){if(!dlg.open)dlg.showModal()}
  function add(id,n){if(!CAT[id])return;cart[id]=Math.min(99,(cart[id]||0)+(n||1));render();open()}

  dlg.addEventListener('click',function(e){
    var t=e.target;
    if(t===dlg||t.hasAttribute('data-close')){dlg.close();return}
    var inc=t.getAttribute('data-inc'),dec=t.getAttribute('data-dec');
    if(inc){cart[inc]=Math.min(99,cart[inc]+1);render()}
    if(dec){cart[dec]-=1;if(cart[dec]<=0)delete cart[dec];render()}
  });
  $$('[data-open-cart]').forEach(function(b){b.addEventListener('click',function(){render();open()})});
  $$('[data-add]').forEach(function(b){b.addEventListener('click',function(){add(b.getAttribute('data-add'),1)})});

  /* jar picker */
  var radios=$$('input[name=jars]'),words=['','one jar','two jars'];
  function picked(){var r=$('input[name=jars]:checked');return r?+r.value:1}
  function syncPick(){
    var n=picked(),ap=$('[data-add-price]'),bn=$('[data-bar-n]'),bs=$('[data-bar-s]');
    if(ap)ap.textContent=fmt(CAT[CRE].p*n);
    if(bn)bn.textContent=words[n];
    if(bs)bs.textContent=fmt(CAT[CRE].p*n)+(n>1?', ships free':'');
  }
  radios.forEach(function(i){i.addEventListener('change',syncPick)});
  ['#add','#add2'].forEach(function(s){var b=$(s);if(b)b.addEventListener('click',function(){add(CRE,picked())})});

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
    {src:'tiktok',id:'7707333202158849298',poster:'img/v-creatine-women.jpg',t:'Creatine is great for women in perimenopause and menopause',link:'creatine.html',cta:'Shop creatine'},
    {src:'tiktok',id:'7705918195294620936',poster:'img/v-tea-lungs.jpg',t:'Tea for your lungs',link:'https://ishay.store/products/breath-tea',cta:'Shop Breath Tea'},
    {src:'youtube',id:'GOckmMiFrR8',poster:'img/v-preworkout.jpg',t:'Pre-workout: creatine, sea salt and matcha',link:'creatine.html',cta:'Shop creatine'},
    {src:'youtube',id:'hegOyvq1xXM',poster:'img/v-sugar.jpg',t:'2 reasons why you crave sugar',link:'https://www.skool.com/abundanceacademy/about',cta:'Join the Academy'}
  ];
  var reels=$('[data-reels]');
  if(reels){
    var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
    reels.innerHTML=REELS.map(function(r,i){
      return '<article class="reel" data-i="'+i+'"><button class="reel-play" type="button" aria-label="Play: '+esc(r.t)+'">'+
        '<img decoding="async" width="540" height="960" src="'+esc(r.poster)+'" alt="">'+
        '<svg viewBox="0 0 62 62" aria-hidden="true"><circle cx="31" cy="31" r="30" fill="rgba(251,247,234,.92)"/><path d="M25 19v24l19-12z" fill="#0E2A1F"/></svg></button>'+
        '<div class="reel-cap"><div class="t">'+esc(r.t)+'</div><a href="'+esc(r.link)+'">'+esc(r.cta)+'</a></div></article>';
    }).join('');
    var stop=function(el){var f=$('iframe',el);if(f)f.remove();el.classList.remove('playing')};
    reels.addEventListener('click',function(e){
      var b=e.target.closest('.reel-play');if(!b)return;
      var el=b.parentNode,r=REELS[+el.getAttribute('data-i')];
      $$('.reel.playing',reels).forEach(stop);
      var f=document.createElement('iframe');
      f.src=r.src==='youtube'?'https://www.youtube.com/embed/'+r.id+'?autoplay=1&playsinline=1&rel=0':'https://www.tiktok.com/player/v1/'+r.id+'?autoplay=1&music_info=0&description=0&rel=0';
      f.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';f.allowFullscreen=true;f.title=r.t;
      el.appendChild(f);el.classList.add('playing');
    });
  }

  syncPick();render();
})();
