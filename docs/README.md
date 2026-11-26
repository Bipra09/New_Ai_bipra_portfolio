# Bipra Biswas portfolio

GitHub Pages publishes the main branch from /docs. To preview, run `python3 -m http.server 8000 -d docs` and visit localhost:8000. The source outside this directory was imported from the original portfolio.

AI Friday resolves portfolio questions against curated facts and ranked project entries in portfolio-data.mjs. General generation runs in a browser worker through Transformers.js 3.8.1 and ONNX Runtime Web and the SmolLM2 360M Instruct quantized model. The first model enablement downloads model artifacts. The service worker caches the site and runtime, and Transformers.js caches model artifacts. On later offline visits, enable the model again to reload it from cache. Clearing site data removes offline resources. Portfolio answers are available without the model download.

The vendored Transformers.js browser bundle is distributed under TRANSFORMERS-LICENSE.txt. Model artifacts download from Hugging Face at runtime.
