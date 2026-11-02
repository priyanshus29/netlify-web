import assert from 'node:assert/strict';
import handler, {config} from '../netlify/functions/chat.mjs';
const oldFetch=globalThis.fetch;
const request=(method,body)=>new Request('https://portfolio.example/api/chat',{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
try {
  delete process.env.NETLIFY_AI_GATEWAY_URL;delete process.env.NETLIFY_AI_GATEWAY_KEY;
  // A user's own provider key must not be used as a paid fallback.
  process.env.OPENAI_API_KEY='personal-key';
  assert.equal(config.path,'/api/chat');
  assert.equal((await handler(request('GET'))).status,503);
  const missing=await handler(request('POST',{message:'Hi'}));assert.equal(missing.status,503);assert.match((await missing.json()).error,/Netlify AI Gateway is not available/i);
  process.env.NETLIFY_AI_GATEWAY_URL='https://gateway.example/';process.env.NETLIFY_AI_GATEWAY_KEY='mock-token';
  assert.equal((await handler(request('GET'))).status,200);
  let captured;
  globalThis.fetch=async(url,options)=>{captured={url,options};return Response.json({choices:[{message:{content:'Priyanshu works with SAP BTP and CAP.'}}]})};
  const result=await handler(request('POST',{message:'What does he do?'}));assert.equal(result.status,200);assert.equal((await result.json()).answer,'Priyanshu works with SAP BTP and CAP.');
  assert.equal(captured.url,'https://gateway.example/v1/chat/completions');assert.equal(captured.options.headers.Authorization,'Bearer mock-token');
  const forwarded=JSON.parse(captured.options.body);assert.equal(forwarded.model,'gpt-4o-mini');assert(forwarded.messages[0].content.includes('GO MOBI'));assert(!forwarded.messages[0].content.includes('+91-9742903254'));
  process.env.NETLIFY_AI_GATEWAY_KEY='rotated-token';await handler(request('POST',{message:'Hello'}));assert.equal(captured.options.headers.Authorization,'Bearer rotated-token');
  globalThis.fetch=async()=>new Response('quota or auth issue',{status:403});const failure=await handler(request('POST',{message:'Hi'}));assert.equal(failure.status,503);assert(!(await failure.text()).includes('rotated-token'));
  console.log('Netlify AI Gateway tests passed: setup state, mock response, grounded context, credential rotation and provider failure.');
} finally {globalThis.fetch=oldFetch;delete process.env.NETLIFY_AI_GATEWAY_URL;delete process.env.NETLIFY_AI_GATEWAY_KEY;delete process.env.OPENAI_API_KEY;}
