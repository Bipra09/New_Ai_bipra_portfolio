import { findAnswer, projects } from './portfolio-data.mjs';

const byId = id => document.getElementById(id);
const make = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
};

function projectCard(project) {
  const card = make('article', '', 'project');
  if (project.image) {
    const image = make('img', '', 'project-image');
    image.alt = '';
    image.loading = 'lazy';
    image.src = './' + project.image;
    card.append(image);
  }
  card.append(make('p', project.type, 'eyebrow'), make('h3', project.name),
    make('p', project.text), make('p', project.tags, 'tags'));
  const links = make('div', '', 'actions');
  for (const [label, href] of [['Source code', project.url], ['Live demo', project.demo]]) {
    if (!href) continue;
    const link = make('a', label);
    link.href = href;
    link.setAttribute('aria-label', label + ' for ' + project.name);
    links.append(link);
  }
  if (links.childElementCount) card.append(links);
  return card;
}
byId('project-grid').append(...projects.slice(0, 6).map(projectCard));
const details = make('details');
const archive = make('div', '', 'grid');
archive.append(...projects.slice(6).map(projectCard));
details.append(make('summary', 'More projects'), archive);
byId('project-grid').after(details);

const scene = document.querySelector('.scene');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let scheduled = false;
function updateDepth() {
  scheduled = false;
  const y = reducedMotion.matches ? 0 : Math.min(scrollY, scene.offsetHeight);
  scene.style.setProperty('--portrait-shift', (y * -.09) + 'px');
  scene.style.setProperty('--orbit-shift', (y * .24) + 'px');
  scene.style.setProperty('--tilt', (62 - y * .07) + 'deg');
  scene.style.setProperty('--turn', (-8 + y * .05) + 'deg');
}
addEventListener('scroll', () => {
  if (scheduled || reducedMotion.matches) return;
  scheduled = true;
  requestAnimationFrame(updateDepth);
}, { passive:true });
reducedMotion.addEventListener('change', updateDepth);
updateDepth();

const dialog = byId('friday');
const messages = byId('messages');
const input = byId('question');
const status = byId('model-status');
const modelButton = byId('enable-model');
const send = byId('send');
let worker;
let modelReady = false;
let lastProject;
let busy = false;
let history = [];
document.querySelectorAll('[data-open-chat]').forEach(button => {
  button.addEventListener('click', () => {
    dialog.showModal();
    input.focus();
  });
});
byId('close-chat').onclick = () => dialog.close();

function addMessage(text, mine = false) {
  const bubble = make('p', '', 'bubble ' + (mine ? 'mine' : 'reply'));
  for (const [index, line] of text.split('\n').entries()) {
    if (index) bubble.append('\n');
    if (!mine && /^https:\/\/github\.com\/Bipra09\/[A-Za-z0-9_-]+$/.test(line)) {
      const link = make('a', 'View source on GitHub');
      link.href = line;
      bubble.append(link);
    } else bubble.append(line);
  }
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function workerCall(message, progress) {
  return new Promise((resolve, reject) => {
    const onMessage = ({data}) => {
      if (data.kind === 'progress') return progress?.(data.text);
      cleanup();
      if (data.kind === 'error') reject(new Error(data.text));
      else resolve(data.text);
    };
    const onError = () => {
      cleanup();
      reject(new Error('The model worker stopped.'));
    };
    const cleanup = () => {
      clearTimeout(timer);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
    };
    const timer = setTimeout(onError, message.kind === 'load' ? 600000 : 90000);
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage(message);
  });
}

function disableModel(message) {
  modelReady = false;
  worker?.terminate();
  worker = undefined;
  status.textContent = message;
  modelButton.disabled = false;
  modelButton.textContent = 'Retry on-device model';
}

modelButton.onclick = async () => {
  modelButton.disabled = true;
  status.textContent = 'Preparing on-device model…';
  try {
    const files = ['friday-runtime.mjs', 'ort-wasm-simd-threaded.jsep.mjs', 'ort-wasm-simd-threaded.jsep.wasm'];
    const cache = await caches.open('bipra-new-portfolio-runtime-v2');
    for (const file of files) {
      if (!await cache.match('./' + file)) await cache.add('./' + file);
    }
    worker = new Worker('./friday-worker.mjs', { type:'module' });
    await workerCall({kind:'load'}, text => { status.textContent = text; });
    modelReady = true;
    status.textContent = 'On-device model ready';
    modelButton.textContent = 'On-device model enabled';
  } catch {
    disableModel('Model unavailable. Portfolio answers still work.');
  }
};

async function ask(question) {
  if (!question || busy) return;
  input.value = '';
  addMessage(question, true);
  const local = findAnswer(question, lastProject);
  if (local) {
    if (local.project) lastProject = local.project;
    addMessage(local.answer);
    return;
  }
  if (!modelReady) {
    addMessage('I don’t have a verified portfolio answer for that. Try a project name, experience, skills, or education. Enable the on-device model for general questions.');
    return;
  }
  busy = true;
  send.disabled = true;
  const reply = addMessage('Thinking…');
  try {
    const answer = await workerCall({kind:'answer', question, history});
    reply.textContent = answer || 'I couldn’t generate an answer. Try rephrasing.';
    if (answer) history = [...history, {role:'user',content:question}, {role:'assistant',content:answer}].slice(-4);
  } catch {
    disableModel('Model interrupted. Portfolio answers still work.');
    reply.textContent = 'The model could not finish. You can retry or ask a portfolio question.';
  } finally {
    messages.scrollTop = messages.scrollHeight;
    send.disabled = false;
    busy = false;
  }
}
byId('chat-form').onsubmit = event => {
  event.preventDefault();
  ask(input.value.trim());
};
document.querySelectorAll('[data-question]').forEach(button => {
  button.addEventListener('click', () => ask(button.dataset.question));
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./portfolio-sw.js').catch(() => {});
