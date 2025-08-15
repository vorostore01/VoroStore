/* ========= CONFIG ========= */
const PHONE_LOCAL = '0555377154';      // يظهر للمستخدم
const PHONE_INT = '213555377154';      // لِ wa.me (بدون صفر البداية)
const PRICE_UNIT = 4500;
const PRICE_OLD = 5500;

/* ========= DOM HELPERS ========= */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* ========= INIT ========= */
document.getElementById('year').textContent = new Date().getFullYear();

/* ========= SLIDER ========= */
let slides = Array.from(document.querySelectorAll('.hero .slide'));
if(slides.length === 0){
  // create slide element from .hero-slider > .slide (already present as .slide in markup)
  slides = Array.from(document.querySelectorAll('.hero-slider .slide'));
}
let current = 0;
const showSlide = (i) => {
  slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
};
const nextSlide = () => { current = (current + 1) % slides.length; showSlide(current); };
const prevSlide = () => { current = (current - 1 + slides.length) % slides.length; showSlide(current); };
$('#nextSlide')?.addEventListener('click', nextSlide);
$('#prevSlide')?.addEventListener('click', prevSlide);
let slideTimer = setInterval(nextSlide, 6000);

/* Pause slider on hover */
$('.hero')?.addEventListener('mouseenter', ()=> clearInterval(slideTimer));
$('.hero')?.addEventListener('mouseleave', ()=> slideTimer = setInterval(nextSlide, 6000));

/* ========= LANGUAGE SWITCH ========= */
const TRANSLATIONS = {
  ar: {
    nav_product:'المنتج', nav_about:'عن VORO', nav_reviews:'آراء العملاء', nav_contact:'تواصل',
    shop_now:'تسوق الآن', hero_cta:'اطلب الآن', hero_more:'المزيد عن العلامة',
    order_cod:'اطلب الآن — الدفع عند الاستلام', order_whatsapp:'مشاركة عبر واتساب',
    size_placeholder:'اختر المقاس'
  },
  en: {
    nav_product:'Product', nav_about:'About VORO', nav_reviews:'Reviews', nav_contact:'Contact',
    shop_now:'Shop Now', hero_cta:'Order Now', hero_more:'About the Brand',
    order_cod:'Order — Cash on delivery', order_whatsapp:'Share via WhatsApp',
    size_placeholder:'Choose size'
  }
};
let lang = 'ar';
$$('.lang-btn').forEach(btn => btn.addEventListener('click', ()=>{
  const l = btn.dataset.lang;
  lang = l;
  $$('.lang-btn').forEach(b=> b.classList.toggle('active', b.dataset.lang===l));
  // update some labels
  $$('.main-nav a').forEach(a=>{
    const key = a.getAttribute('data-i18n');
    if(key && TRANSLATIONS[l][key]) a.textContent = TRANSLATIONS[l][key];
  });
  $('#orderCOD').textContent = TRANSLATIONS[l].order_cod;
  $('#orderWhats').textContent = TRANSLATIONS[l].order_whatsapp;
  // update placeholder
  const size = $('#size');
  if(size){
    const opt = size.querySelector('option[disabled]');
    if(opt) opt.textContent = TRANSLATIONS[l].size_placeholder;
  }
  // direction
  document.documentElement.lang = (l === 'ar') ? 'ar' : 'en';
  document.documentElement.dir = (l === 'ar') ? 'rtl' : 'ltr';
}));

/* ========= QUANTITY ========= */
function changeQty(delta){
  const el = $('#qty');
  if(!el) return;
  let v = parseInt(el.value || '1', 10) + delta;
  if(isNaN(v) || v < 1) v = 1;
  el.value = v;
}
window.changeQty = changeQty;

/* ========= COUNTDOWN (7 أيام من الآن) ========= */
(function startCountdown(){
  const end = new Date(Date.now() + 7*24*60*60*1000); // 7 days from now
  const el = $('#countdown');
  if(!el) return;
  function tick(){
    const now = new Date();
    let diff = Math.max(0, end - now);
    const days = Math.floor(diff / (1000*60*60*24));
    diff -= days * (1000*60*60*24);
    const hours = Math.floor(diff / (1000*60*60));
    diff -= hours * (1000*60*60);
    const mins = Math.floor(diff / (1000*60));
    diff -= mins * (1000*60);
    const secs = Math.floor(diff / 1000);
    el.textContent = `${days} يوم ${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    if(days===0 && hours===0 && mins===0 && secs===0) clearInterval(ti);
  }
  tick();
  const ti = setInterval(tick, 1000);
})();

/* ========= FORM HANDLING & WHATSAPP ========= */
function buildOrder(){
  return {
    size: $('#size')?.value,
    qty: parseInt($('#qty')?.value || '1',10),
    name: $('#fullName')?.value.trim(),
    phone: $('#phone')?.value.trim(),
    wilaya: $('#wilaya')?.value.trim(),
    baladia: $('#baladia')?.value.trim(),
    note: $('#note')?.value.trim()
  };
}
function validateOrder(d){
  if(!d.size){ alert(lang==='ar' ? 'اختر المقاس' : 'Choose a size'); return false; }
  if(!d.name){ alert(lang==='ar' ? 'ادخل الاسم الكامل' : 'Enter full name'); return false; }
  if(!d.phone){ alert(lang==='ar' ? 'ادخل رقم الهاتف' : 'Enter phone number'); return false; }
  if(!d.wilaya){ alert(lang==='ar' ? 'ادخل الولاية' : 'Enter province'); return false; }
  if(!d.baladia){ alert(lang==='ar' ? 'ادخل البلدية' : 'Enter municipality'); return false; }
  return true;
}
function openWhatsApp(data, isCOD=false){
  const prod = (lang==='ar') ? 'هودي VORO' : 'VORO Hoodie';
  const total = PRICE_UNIT * data.qty;
  const lines = [];
  if(lang==='ar'){
    lines.push(`مرحبا VORO، أريد طلب المنتج: ${prod}`);
    lines.push(`المقاس: ${data.size}`);
    lines.push(`الكمية: ${data.qty}`);
    lines.push(`السعر للوحدة: ${PRICE_UNIT.toLocaleString()} دج`);
    lines.push(`الإجمالي: ${total.toLocaleString()} دج`);
    lines.push(`الاسم: ${data.name}`);
    lines.push(`الهاتف: ${data.phone}`);
    lines.push(`الولاية: ${data.wilaya}`);
    lines.push(`البلدية: ${data.baladia}`);
    if(data.note) lines.push(`ملاحظة: ${data.note}`);
    if(isCOD) lines.push(`طريقة الدفع: الدفع عند الاستلام`);
  } else {
    lines.push(`Hello VORO, I want to order: ${prod}`);
    lines.push(`Size: ${data.size}`);
    lines.push(`Quantity: ${data.qty}`);
    lines.push(`Unit price: ${PRICE_UNIT.toLocaleString()} DZD`);
    lines.push(`Total: ${total.toLocaleString()} DZD`);
    lines.push(`Name: ${data.name}`);
    lines.push(`Phone: ${data.phone}`);
    lines.push(`Province: ${data.wilaya}`);
    lines.push(`Municipality: ${data.baladia}`);
    if(data.note) lines.push(`Note: ${data.note}`);
    if(isCOD) lines.push(`Payment: Cash on delivery`);
  }
  const msg = encodeURIComponent(lines.join('\n'));
  window.open(`https://wa.me/${PHONE_INT}?text=${msg}`, '_blank');
}
$('#orderCOD').addEventListener('click', ()=>{
  const d = buildOrder();
  if(!validateOrder(d)) return;
  const confirmText = lang==='ar' ? 'تأكيد الطلب والدفع عند الاستلام؟' : 'Confirm order (cash on delivery)?';
  if(!confirm(confirmText)) return;
  openWhatsApp(d, true);
});
$('#orderWhats').addEventListener('click', ()=>{
  const d = buildOrder();
  if(!validateOrder(d)) return;
  openWhatsApp(d, false);
});

/* Floating WhatsApp buttons */
$('#whatsappFloating').addEventListener('click', ()=> {
  const greet = (lang==='ar') ? 'مرحباً VORO' : 'Hello VORO';
  window.open(`https://wa.me/${PHONE_INT}?text=${encodeURIComponent(greet)}`, '_blank');
});
$('#directWhats')?.addEventListener('click', ()=> {
  const greet = (lang==='ar') ? 'مرحباً VORO' : 'Hello VORO';
  window.open(`https://wa.me/${PHONE_INT}?text=${encodeURIComponent(greet)}`, '_blank');
});

/* ========= MODAL (Privacy / Terms) ========= */
const modal = $('#modal');
const modalContent = $('#modalContent');
$('#showPrivacy').addEventListener('click', (e)=>{
  e.preventDefault();
  modalContent.innerHTML = `<h2>سياسة الخصوصية</h2><p>نحترم خصوصيتك. البيانات تستخدم للتواصل بخصوص الطلب فقط ولا تُشارك مع طرف ثالث بدون إذنك.</p>`;
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
});
$('#showTerms').addEventListener('click', (e)=>{
  e.preventDefault();
  modalContent.innerHTML = `<h2>الشروط والأحكام</h2><p>عند تقديم الطلب يطبق الدفع عند التسليم. سياسة الإرجاع خلال 7 أيام بعد الاستلام مع الحفاظ على حالة المنتج.</p>`;
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
});
$('#closeModal').addEventListener('click', ()=>{ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); });
modal.addEventListener('click', (e)=>{ if(e.target === modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); } });

/* ========= SMALL HELPERS ========= */
/* mobile menu toggle */
$('#menuToggle').addEventListener('click', ()=>{
  const nav = document.querySelector('.main-nav');
  if(!nav) return;
  nav.style.display = nav.style.display === 'flex' ? '' : 'flex';
});

/* sanitize phone input */
$('#phone').addEventListener('input', ()=> {
  $('#phone').value = $('#phone').value.replace(/[^0-9+]/g,'').slice(0,15);
});

/* search quick demo (no backend) */
$('#searchInput')?.addEventListener('keydown', (e)=> {
  if(e.key === 'Enter') {
    e.preventDefault();
    alert((lang==='ar') ? `بحث عن: ${e.target.value}` : `Search for: ${e.target.value}`);
  }
});
