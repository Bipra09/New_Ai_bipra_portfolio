import { facts } from './portfolio-data.mjs';

let engine;
self.onmessage = async ({data}) => {
  try {
    if (data.kind === 'load') {
      const { CreateMLCEngine } = await import('./friday-runtime.mjs');
      engine = await CreateMLCEngine('SmolLM2-360M-Instruct-q4f32_1-MLC', {
        initProgressCallback: progress => {
          self.postMessage({kind:'progress',text:'Preparing model · ' + Math.round(progress.progress * 100) + '%'});
        },
      });
      self.postMessage({kind:'ready'});
    } else if (data.kind === 'answer') {
      const response = await engine.chat.completions.create({
        messages:[
          {role:'system',content:'You are AI Friday, a concise portfolio assistant. About Bipra, use only these public facts and acknowledge missing details. For general questions, answer briefly and admit uncertainty.\n' + facts},
          ...data.history,
          {role:'user',content:data.question},
        ],
        max_tokens:160,
        temperature:0.25,
      });
      self.postMessage({kind:'answer',text:response.choices[0]?.message?.content?.trim()});
    }
  } catch (error) {
    self.postMessage({kind:'error',text:error.message});
  }
};
