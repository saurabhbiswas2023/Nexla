// Simple OpenRouter API Test
const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function testOpenRouter() {
  console.log('🚀 Testing OpenRouter API...');
  console.log('🔑 API Key:', API_KEY.substring(0, 20) + '...');
  console.log('🌐 URL:', API_URL);
  console.log('🤖 Model: openai/gpt-4o-mini\n');

  const testPrompt = `You are testing intent detection. 

User says: "source"
Context: We're asking if "Snowflake" is source or destination.

Respond with JSON only:
{
  "intent": "role_clarification",
  "role": "source",
  "confidence": 0.95
}`;

  try {
    console.log('📤 Sending request...');
    const startTime = Date.now();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Nexla Test'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: testPrompt }],
        temperature: 0.1,
        max_tokens: 200
      })
    });

    const endTime = Date.now();
    console.log(`⏱️  Response time: ${endTime - startTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      
      if (response.status === 401) {
        console.error('🚨 AUTHENTICATION FAILED - Invalid API key');
      } else if (response.status === 429) {
        console.error('🚨 RATE LIMITED - Too many requests');
      } else if (response.status === 402) {
        console.error('🚨 PAYMENT REQUIRED - Check billing');
      }
      
      return false;
    }

    const data = await response.json();
    console.log('📦 Full Response:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log('💬 LLM Response:', content);
      
      try {
        const parsed = JSON.parse(content);
        console.log('✅ Parsed JSON:', parsed);
        console.log('🎉 OpenRouter API is working correctly!');
        return true;
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError.message);
        return false;
      }
    } else {
      console.error('❌ Invalid response structure');
      return false;
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('🚨 DNS RESOLUTION FAILED - Check internet connection');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚨 CONNECTION REFUSED - OpenRouter might be down');
    }
    
    return false;
  }
}

// Test if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('📦 Installing node-fetch...');
  const { default: fetch } = require('node-fetch');
  global.fetch = fetch;
}

testOpenRouter().then(success => {
  if (success) {
    console.log('\n✅ CONCLUSION: OpenRouter API is working fine');
    console.log('🔍 The issue might be in the application logic, not the API');
  } else {
    console.log('\n❌ CONCLUSION: OpenRouter API has issues');
    console.log('🔧 Fix the API connection before testing intent detection');
  }
}).catch(console.error);
