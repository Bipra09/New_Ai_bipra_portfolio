const github = 'https://github.com/Bipra09/';

export const projects = [
  {name:'VisionX', type:'Computer vision', image:'VX.jpg', tags:'Python · Computer vision · Deep learning', slug:'Anomaly-Detection-in-smart-cities', keywords:/vision\s*x|anomaly|smart cit|patent|surveillance/i, text:'Smart-city video anomaly detection developed as a final-year project at VIT.'},
  {name:'K&K E-commerce', type:'Full-stack engineering', tags:'React · Node.js · Express · MongoDB', slug:'K-K_Amazon_like_ecommarce_website', keywords:/\bk\s*(?:&|and|-)\s*k\b|e.?commerce|oversell|checkout|concurren/i, text:'A storefront with transactional inventory and orders. GitHub Actions verifies last-unit contention, rollback, repeat cancellation, and checkout in Chromium.'},
  {name:'ParkRelay', type:'Backend engineering', tags:'Node.js · PostgreSQL · JavaScript', slug:'parkrelay', keywords:/park\s*relay|parking/i, text:'Parking space allocation, vehicle check-in, tickets, and checkout fees, with PostgreSQL support.'},
  {name:'VoltMosaic', type:'Backend engineering', tags:'PHP · PostgreSQL · JavaScript', slug:'voltmosaic', keywords:/volt\s*mosaic|recharge|bill payment/i, text:'A simulated mobile recharge and bill-payment platform with transaction history and retry-safe receipts.'},
  {name:'Virtual Whiteboard', type:'Computer vision', image:'WHB.jpg', tags:'Python · Real-time gesture recognition', slug:'RealTime-Virtual-Whiteboard', keywords:/whiteboard|hand gesture/i, text:'A virtual canvas that translates hand gestures into drawing controls.'},
  {name:'RailBerth', type:'Web application', tags:'JavaScript · HTML · CSS', slug:'railberth', demo:'https://bipra09.github.io/railberth/', keywords:/rail\s*berth|railway|train seat/i, text:'An interactive seat map for demo train reservations with browser-local persistence.'},
  {name:'SpendMinute', type:'Mobile application', tags:'Flutter · Dart', slug:'spendminute', keywords:/spend\s*minute|expense|calculator/i, text:'An expense journal with hourly totals, local storage, and a built-in calculator.'},
  {name:'SafeOut', type:'Student project', image:'safe.jpg', tags:'Health advisory', keywords:/safe\s*out/i, text:'A student prototype for personalized health and outdoor activity guidance.'},
  {name:'IoT Smart Lock', type:'Student project', image:'RFID.jpg', tags:'IoT · RFID', keywords:/smart lock|rfid/i, text:'A smart lock prototype integrating hardware and software authentication.'},
  {name:'ROS Obstacle Detection Bot', type:'Robotics', image:'OB.jpg', tags:'ROS · Obstacle avoidance', keywords:/obstacle|\bros\b/i, text:'A robotics project exploring obstacle detection and path finding.'},
  {name:'Facial Recognition & Emotion AI', type:'Computer vision', image:'facial.jpg', tags:'Python · Facial recognition', keywords:/facial|emotion/i, text:'A student project exploring face and emotion recognition.'},
].map(p => ({...p, url:p.slug ? github + p.slug : ''}));

const background = 'Bipra Biswas is an AI Engineer in the Advanced Business Department of Intfor Co., Ltd. (T&S Group) in Japan, where he has worked since April 2026. He works on computer vision and image processing, including image classification and CT artifact removal.';
const skills = 'Bipra uses Python, PyTorch, Linux, Windows, GitLab, and GitHub. His work includes dataset preparation, reproducible GPU experiments, cross-validation, Grad-CAM, Optuna, and model benchmarking. His software projects use React, Node.js, Express, MongoDB, and PostgreSQL.';
const education = 'Bipra earned a B.Tech in Computer Science and Engineering (AI & Robotics) at Vellore Institute of Technology in June 2025. He led the NexSeed Venture Capital Club and contributed to the Aerospace Club.';
const certificate = 'Bipra holds the Microsoft Certified: Azure Administrator Associate credential.';
export const facts = [background, skills, education, certificate, ...projects.map(p => p.name + ' — ' + p.text)].join('\n');

export function findAnswer(prompt, lastProject) {
  if (/salary|home address|phone number|birth date|date of birth|private detail/i.test(prompt) && /\b(?:bipra|his|he)\b/i.test(prompt)) return {answer:'That detail is outside Bipra’s public portfolio. The Contact section lists his public professional channels.'};
  if (/学歴|大学|卒業/.test(prompt)) return {answer:education};
  if (/スキル|技術|得意/.test(prompt)) return {answer:skills};
  if (/資格|認定/.test(prompt)) return {answer:certificate};
  if (/職務|仕事|勤務|経歴|経験/.test(prompt)) return {answer:background};
  if (/問い合わせ|連絡/.test(prompt)) return {answer:'お問い合わせ欄のLinkedIn、GitHub、メールからご連絡いただけます。'};
  if (/プロジェクト|作品/.test(prompt)) return {answer:'画像認識ならVisionX、注文処理と自動テストならK&K、バックエンド開発ならParkRelayをご覧ください。'};
  const matched = projects.filter(p => p.keywords.test(prompt));
  if (matched.length) return {answer:matched.map(describe).join('\n\n'), project:matched[0]};
  if (lastProject && /\b(it|that|this|its)\b/i.test(prompt) && /stack|verified|test|build|work|tell|link|repo/i.test(prompt)) return {answer:describe(lastProject), project:lastProject};
  if (/contact|email|linkedin|hire|reach/i.test(prompt)) return {answer:'Find Bipra on LinkedIn, GitHub, or via the email link in the portfolio’s Contact section.'};
  if (/certif|azure/i.test(prompt)) return {answer:certificate};
  if (/educat|college|university|\bvit\b|degree|robotics|nexseed|graduat/i.test(prompt)) return {answer:education};
  if (/skill|tech stack|tools/i.test(prompt) || (/\b(?:bipra|his)\b/i.test(prompt) && /pytorch|python|grad.cam|optuna/i.test(prompt))) return {answer:skills};
  if (/projects|portfolio|what.*built/i.test(prompt)) return {answer:'Start with VisionX for computer vision, K&K for transactional checkout and automated tests, and ParkRelay for backend development. See Selected projects for the full list.'};
  if (/bipra|experience|employ|background|job|intfor|what (do|does).*work/i.test(prompt)) return {answer:background};
  return null;
}

function describe(project) {
  return [project.name + ' — ' + project.text, project.tags, project.url].filter(Boolean).join('\n');
}
