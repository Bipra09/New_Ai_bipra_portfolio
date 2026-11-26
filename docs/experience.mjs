import { projectJa, ja } from './japanese.mjs';

const root = document.documentElement;
const theme = document.getElementById('theme-toggle');
const language = document.getElementById('language-toggle');
const interact = document.getElementById('interact-toggle');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const remember = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
const retrieve = key => { try { return localStorage.getItem(key); } catch { return null; } };
const original = new WeakMap();
const dictionary = {...ja, ...projectJa};

function translateTree(container) {
  const tree = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  for (let node = tree.nextNode(); node; node = tree.nextNode()) {
    if (!original.has(node) && dictionary[node.data.trim()]) original.set(node, node.data);
    const english = original.get(node);
    if (english) node.data = root.lang === 'ja' ? dictionary[english.trim()] : english;
  }
}

function refreshControls() {
  const japanese = root.lang === 'ja';
  const light = root.dataset.theme === 'light';
  const active = root.dataset.interact === 'true';
  theme.textContent = light ? (japanese ? 'ダークモード' : 'Dark mode') : (japanese ? 'ライトモード' : 'Light mode');
  theme.setAttribute('aria-pressed', String(light));
  language.textContent = japanese ? 'English' : '日本語';
  language.lang = japanese ? 'en' : 'ja';
  interact.textContent = japanese ? 'インタラクション' : 'Interact mode';
  interact.setAttribute('aria-pressed', String(active));
  document.getElementById('question').placeholder = japanese ? '質問を入力…' : 'Ask a question…';
}
function applyLanguage(value) {
  root.lang = value;
  translateTree(document.body);
  refreshControls();
  remember('bipra-language',value);
}
root.dataset.theme = retrieve('bipra-theme') === 'light' ? 'light' : 'dark';
root.dataset.interact = retrieve('bipra-interact') === 'true' ? 'true' : 'false';
applyLanguage(retrieve('bipra-language') === 'ja' ? 'ja' : 'en');
new MutationObserver(() => {
  if (root.lang === 'ja') translateTree(document.getElementById('messages'));
}).observe(document.getElementById('messages'), {childList:true,subtree:true});
language.onclick = () => applyLanguage(root.lang === 'ja' ? 'en' : 'ja');
theme.onclick = () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  remember('bipra-theme',root.dataset.theme);
  refreshControls();
};
interact.onclick = () => {
  root.dataset.interact = root.dataset.interact === 'true' ? 'false' : 'true';
  remember('bipra-interact',root.dataset.interact);
  if (root.dataset.interact === 'false') resetMotion();
  refreshControls();
};

const scene = document.querySelector('.scene');
let frame = 0;
let pointer;
function resetMotion() {
  scene.style.removeProperty('--pointer-x');
  scene.style.removeProperty('--pointer-y');
  for (const face of document.querySelectorAll('.friday-face')) {
    for (const key of ['--face-x','--face-y','--face-angle']) face.style.removeProperty(key);
  }
}
function animatePointer() {
  frame = 0;
  if (root.dataset.interact !== 'true' || reduce.matches) return;
  const {clientX:x,clientY:y} = pointer;
  const clamp = (value, limit) => Math.max(-limit,Math.min(limit,value));
  scene.style.setProperty('--pointer-x', clamp((x - innerWidth / 2) / 40, 12) + 'px');
  scene.style.setProperty('--pointer-y', clamp((y - innerHeight / 2) / 45, 10) + 'px');
  for (const face of document.querySelectorAll('.friday-face')) {
    if (!face.getClientRects().length) continue;
    const rect = face.getBoundingClientRect();
    const dx = x - rect.left - rect.width / 2;
    const dy = y - rect.top - rect.height / 2;
    face.style.setProperty('--face-x',clamp(dx / 65,3) + 'px');
    face.style.setProperty('--face-y',clamp(dy / 70,2) + 'px');
    face.style.setProperty('--face-angle',clamp(dx / 45,12) + 'deg');
  }
}
addEventListener('pointermove',event => {
  if (root.dataset.interact !== 'true' || reduce.matches || event.pointerType === 'touch') return;
  pointer = event;
  if (!frame) frame = requestAnimationFrame(animatePointer);
},{passive:true});
document.documentElement.addEventListener('pointerleave',resetMotion);
reduce.addEventListener('change',resetMotion);
document.querySelector('.scene').addEventListener('pointerdown', event => {
  if (root.dataset.interact !== 'true' || reduce.matches) return;
  const sparks = document.getElementById('interaction-sparks');
  sparks.replaceChildren();
  for (let index = 0; index < 8; index++) {
    const spark = document.createElement('span');
    const angle = index * Math.PI / 4;
    spark.className = 'interaction-spark';
    spark.style.setProperty('--x',event.clientX + 'px');
    spark.style.setProperty('--y',event.clientY + 'px');
    spark.style.setProperty('--dx',Math.cos(angle) * 45 + 'px');
    spark.style.setProperty('--dy',Math.sin(angle) * 45 + 'px');
    spark.addEventListener('animationend',() => spark.remove(),{once:true});
    sparks.append(spark);
  }
});
