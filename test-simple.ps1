# Simple OpenRouter API test
$apiKey = "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"
$url = "https://openrouter.ai/api/v1/chat/completions"

Write-Host "Testing OpenRouter API..."
Write-Host "API Key: $($apiKey.Substring(0,20))..."

$headers = @{
    'Authorization' = "Bearer $apiKey"
    'Content-Type' = 'application/json'
}

$body = @{
    model = 'openai/gpt-4o-mini'
    messages = @(@{ role = 'user'; content = 'Hello test' })
    max_tokens = 50
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
    Write-Host "SUCCESS: API is working!"
    Write-Host "Response: $($response.choices[0].message.content)"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "401 Unauthorized - API key issue"
    }
}
