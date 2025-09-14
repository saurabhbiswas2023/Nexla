# PowerShell script to test OpenRouter API
$apiKey = "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"
$url = "https://openrouter.ai/api/v1/chat/completions"

Write-Host "🚀 Testing OpenRouter API with PowerShell..." -ForegroundColor Green
Write-Host "🔑 API Key: $($apiKey.Substring(0,20))..." -ForegroundColor Yellow
Write-Host "🌐 URL: $url" -ForegroundColor Yellow
Write-Host "🤖 Model: openai/gpt-4o-mini" -ForegroundColor Yellow
Write-Host ""

$headers = @{
    'Authorization' = "Bearer $apiKey"
    'Content-Type' = 'application/json'
    'HTTP-Referer' = 'http://localhost:5173'
    'X-Title' = 'Nexla Test'
}

$body = @{
    model = 'openai/gpt-4o-mini'
    messages = @(
        @{
            role = 'user'
            content = 'Hello, this is a test message. Please respond with "API is working".'
        }
    )
    temperature = 0.1
    max_tokens = 50
} | ConvertTo-Json -Depth 3

Write-Host "📤 Sending request..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "📦 Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    if ($response.choices -and $response.choices[0].message) {
        Write-Host "💬 LLM Response: $($response.choices[0].message.content)" -ForegroundColor Green
        Write-Host "🎉 OpenRouter API is working correctly!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "📊 Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "📦 Error Response: $errorBody" -ForegroundColor Red
        
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "🚨 AUTHENTICATION FAILED" -ForegroundColor Red
            Write-Host "   - Check if API key is correct" -ForegroundColor Yellow
            Write-Host "   - Check if API key has been revoked" -ForegroundColor Yellow
            Write-Host "   - Check if billing is up to date" -ForegroundColor Yellow
        } elseif ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host "🚨 RATE LIMITED" -ForegroundColor Red
        } elseif ($_.Exception.Response.StatusCode -eq 402) {
            Write-Host "🚨 PAYMENT REQUIRED" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🔍 Next steps if failing:" -ForegroundColor Yellow
Write-Host "1. Check OpenRouter dashboard for API key status" -ForegroundColor Yellow
Write-Host "2. Verify billing/credits are available" -ForegroundColor Yellow
Write-Host "3. Check if key has proper permissions" -ForegroundColor Yellow
