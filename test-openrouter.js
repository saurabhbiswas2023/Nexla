// E2E Test for OpenRouter API and Intent Detection
const fetch = require('node-fetch');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY || 'sk-or-v1-your-key-here';

// Test Cases
const testCases = [
  {
    name: "Simple Role Detection",
    userMessage: "source",
    context: { pendingRoleClarity: "Snowflake" },
    expectedIntent: "role_clarification",
    expectedRole: "source"
  },
  {
    name: "Connector Correction",
    userMessage: "no its snowflake",
    context: { pendingRoleClarity: "Google BigQuery" },
    expectedIntent: "connector_correction",
    expectedConnector: "Snowflake"
  },
  {
    name: "Complex Message",
    userMessage: "source and I need to send data to postgres",
    context: { pendingRoleClarity: "Snowflake" },
    expectedIntent: "role_clarification",
    expectedRole: "source"
  },
  {
    name: "Simple Rejection",
    userMessage: "no its not",
    context: { pendingRoleClarity: "Google BigQuery" },
    expectedIntent: "connector_correction"
  }
];

// Mock connector catalog
const mockConnectors = [
  'Google BigQuery', 'Snowflake', 'PostgreSQL', 'Salesforce', 'Shopify',
  'Amazon S3', 'MySQL', 'MongoDB', 'Webhook', 'Google Sheets'
];

async function testOpenRouterAPI(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📝 User Message: "${testCase.userMessage}"`);
  console.log(`🎯 Context: ${JSON.stringify(testCase.context)}`);

  const intentPrompt = `You are Claude, an expert at understanding user intent in data integration conversations.

CURRENT SITUATION:
We are asking the user to clarify if "${testCase.context.pendingRoleClarity}" is a source or destination.

USER'S MESSAGE: "${testCase.userMessage}"

AVAILABLE CONNECTORS: ${mockConnectors.join(', ')}

ANALYZE THE USER'S INTENT:

The user is responding to a question about whether a connector is their "source" or "destination". Look at their message and determine:

1. ROLE_CLARIFICATION: User is answering the role question
   - "source", "destination", "it's a source", etc.
   
2. CONNECTOR_CORRECTION: User wants to change the connector
   - "no its [connector]", "I meant [connector]", "actually [connector]"
   - "no its not" (rejection without specifying new connector)
   
3. NEW_FLOW_REQUEST: User wants to start over
   - "connect X to Y", "new flow", etc.

CRITICAL RULES:
- If user says "no" without specifying a new connector → ask what they meant
- If user says "no its [name]" → extract the exact connector name from the available list
- If user says "source" or "destination" → that's their role choice
- Be very precise about connector name matching

Respond with JSON only:
{
  "intent": "role_clarification|connector_correction|new_flow_request",
  "connectorName": "exact connector name from list or null",
  "role": "source|destination or null",
  "confidence": 0.0-1.0,
  "reasoning": "why you chose this intent"
}`;

  try {
    console.log('🚀 Making API call to OpenRouter...');
    
    const startTime = Date.now();
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Nexla Data Flow Architect'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: intentPrompt }],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`⏱️  Response Time: ${responseTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    console.log('📦 Raw Response:', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure');
      return { success: false, error: 'Invalid response structure' };
    }

    const content = data.choices[0].message.content.trim();
    console.log('💬 LLM Response:', content);

    // Try to parse JSON
    let parsedIntent;
    try {
      parsedIntent = JSON.parse(content);
      console.log('✅ Parsed Intent:', JSON.stringify(parsedIntent, null, 2));
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      return { success: false, error: 'Failed to parse JSON response' };
    }

    // Validate against expected results
    let validationResults = [];
    
    if (testCase.expectedIntent && parsedIntent.intent !== testCase.expectedIntent) {
      validationResults.push(`❌ Intent mismatch: expected ${testCase.expectedIntent}, got ${parsedIntent.intent}`);
    } else if (testCase.expectedIntent) {
      validationResults.push(`✅ Intent correct: ${parsedIntent.intent}`);
    }

    if (testCase.expectedRole && parsedIntent.role !== testCase.expectedRole) {
      validationResults.push(`❌ Role mismatch: expected ${testCase.expectedRole}, got ${parsedIntent.role}`);
    } else if (testCase.expectedRole) {
      validationResults.push(`✅ Role correct: ${parsedIntent.role}`);
    }

    if (testCase.expectedConnector && parsedIntent.connectorName !== testCase.expectedConnector) {
      validationResults.push(`❌ Connector mismatch: expected ${testCase.expectedConnector}, got ${parsedIntent.connectorName}`);
    } else if (testCase.expectedConnector) {
      validationResults.push(`✅ Connector correct: ${parsedIntent.connectorName}`);
    }

    console.log('\n📋 Validation Results:');
    validationResults.forEach(result => console.log(result));

    return { 
      success: true, 
      intent: parsedIntent, 
      responseTime,
      validationResults 
    };

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting OpenRouter E2E Tests...\n');
  console.log('🔑 API Key:', API_KEY.substring(0, 20) + '...');
  console.log('🌐 API URL:', OPENROUTER_API_URL);
  console.log('🤖 Model: anthropic/claude-3.5-sonnet\n');

  const results = [];
  
  for (const testCase of testCases) {
    const result = await testCase;
    results.push({ testCase: testCase.name, ...result });
    
    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 SUMMARY:');
  console.log('='.repeat(50));
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const result of results) {
    if (result.success) {
      console.log(`✅ ${result.testCase}: PASSED (${result.responseTime}ms)`);
      successCount++;
    } else {
      console.log(`❌ ${result.testCase}: FAILED - ${result.error}`);
      failureCount++;
    }
  }
  
  console.log(`\n🎯 Results: ${successCount} passed, ${failureCount} failed`);
  
  if (failureCount > 0) {
    console.log('\n🚨 ISSUES DETECTED:');
    console.log('1. Check your OPENROUTER_API_KEY environment variable');
    console.log('2. Verify OpenRouter service is available');
    console.log('3. Check network connectivity');
    console.log('4. Review API quota/billing');
  } else {
    console.log('\n🎉 All tests passed! OpenRouter API is working correctly.');
  }
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testOpenRouterAPI, runAllTests };
