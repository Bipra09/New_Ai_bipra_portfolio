import { facts } from './portfolio-data.mjs';

let generate;
self.onmessage = async ({data}) => {
  try {
    if (data.kind === 'load') {
      const { pipeline, env } = await import('./friday-runtime.mjs');
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      env.backends.onnx.wasm.numThreads = 1;
      env.backends.onnx.wasm.proxy = false;
      env.backends.onnx.wasm.wasmPaths = new URL('./', import.meta.url).href;
      generate = await pipeline('text-generation', 'onnx-community/SmolLM2-360M-Instruct-ONNX', {
        device:'wasm',
        dtype:'q4',
        progress_callback: progress => {
          if (progress.status === 'progress' && progress.file?.endsWith('.onnx')) {
            self.postMessage({kind:'progress',text:'Downloading model · ' + Math.round(progress.progress) + '%'});
          }
        },
      });
      self.postMessage({kind:'ready'});
    } else if (data.kind === 'answer') {
      const [response] = await generate([
        {role:'system',content:'You are AI Friday, a concise portfolio assistant. Use only these public facts when answering about Bipra. Say when a detail is unknown. For general questions, answer in plain English and acknowledge uncertainty.\n' + facts},
        ...data.history,
        {role:'user',content:data.question},
      ], {max_new_tokens:110, do_sample:false, return_full_text:false});
      self.postMessage({kind:'answer',text:response?.generated_text?.trim()});
    }
  } catch (error) {
    console.error('AI Friday model error:', error);
    self.postMessage({kind:'error',text:error.message});
  }
};
