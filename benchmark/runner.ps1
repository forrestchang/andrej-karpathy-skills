param(
    [string]$Model = "gemini-3.5-flash",
    [ValidateRange(1, 100)]
    [int]$Repetitions = 5,
    [int]$Seed = 20260715,
    [string]$InstructionFile = (Join-Path $PSScriptRoot "..\skills\karpathy-guidelines\SKILL.md"),
    [string]$OutputFile = (Join-Path $PSScriptRoot "results-v2.json"),
    [switch]$AnalyzeExisting
)

$ErrorActionPreference = "Stop"

function Get-Mean([double[]]$Values) {
    if ($Values.Count -eq 0) { return 0 }
    return ($Values | Measure-Object -Average).Average
}

function Get-Median([double[]]$Values) {
    if ($Values.Count -eq 0) { return 0 }
    $sorted = @($Values | Sort-Object)
    $middle = [math]::Floor($sorted.Count / 2)
    if ($sorted.Count % 2) { return $sorted[$middle] }
    return ($sorted[$middle - 1] + $sorted[$middle]) / 2
}

function Show-Summary($Samples) {
    $rows = foreach ($variant in @("baseline", "skill")) {
        $group = @($Samples | Where-Object variant -eq $variant)
        if ($group.Count -eq 0) { continue }
        [pscustomobject]@{
            Variant = $variant
            Trials = $group.Count
            PassRate = "{0:P1}" -f ((@($group | Where-Object passed).Count) / $group.Count)
            MeanPromptTokens = [math]::Round((Get-Mean @($group.prompt_tokens)), 1)
            MeanCompletionTokens = [math]::Round((Get-Mean @($group.completion_tokens)), 1)
            MeanRequestTokens = [math]::Round((Get-Mean @($group.request_tokens)), 1)
            MeanProviderTotal = [math]::Round((Get-Mean @($group.provider_total_tokens)), 1)
            MedianLatencySec = [math]::Round((Get-Median @($group.latency_sec)), 2)
        }
    }
    $rows | Format-Table -AutoSize

    $baseline = $rows | Where-Object Variant -eq "baseline"
    $skill = $rows | Where-Object Variant -eq "skill"
    if ($baseline -and $skill) {
        $tokenChange = 100 * ($skill.MeanRequestTokens - $baseline.MeanRequestTokens) / $baseline.MeanRequestTokens
        $timeChange = 100 * ($skill.MedianLatencySec - $baseline.MedianLatencySec) / $baseline.MedianLatencySec
        "Skill change: {0:+0.0;-0.0;0.0}% request tokens, {1:+0.0;-0.0;0.0}% median latency." -f $tokenChange, $timeChange
        "A performance win requires non-inferior pass rate and lower request tokens or latency."
    }
}

function Test-Response([string]$Evaluator, [string]$Text) {
    $lower = $Text.ToLowerInvariant()
    switch ($Evaluator) {
        "clarify" {
            $asksQuestion = $Text.Contains("?")
            $statesAssumption = $lower.Contains("assum")
            return [pscustomobject]@{
                passed = $asksQuestion -or $statesAssumption
                reason = "question=$asksQuestion; assumption=$statesAssumption"
            }
        }
        "simple" {
            $lines = @($Text -split "`n").Count
            $hasBloat = $lower.Contains("class ") -or $lower.Contains("dataclass") -or $lower.Contains("enum") -or $lines -gt 40
            return [pscustomobject]@{ passed = -not $hasBloat; reason = "lines=$lines; structural_bloat=$hasBloat" }
        }
        "surgical" {
            $fixedTarget = $Text.Contains('print("hello " + name)')
            $preservedAdd = $Text.Contains("def add(a,b):") -and $Text.Contains("return a+b")
            $preservedComment = $Text.Contains("# unused comment from a long time ago")
            return [pscustomobject]@{
                passed = $fixedTarget -and $preservedAdd -and $preservedComment
                reason = "target=$fixedTarget; add_preserved=$preservedAdd; comment_preserved=$preservedComment"
            }
        }
    }
    throw "Unknown evaluator: $Evaluator"
}

if ($AnalyzeExisting) {
    $legacyPath = Join-Path $PSScriptRoot "results.json"
    $legacy = Get-Content $legacyPath -Raw | ConvertFrom-Json
    $samples = foreach ($result in $legacy) {
        foreach ($variant in @("baseline", "karpathy")) {
            $arm = $result.$variant
            [pscustomobject]@{
                variant = if ($variant -eq "karpathy") { "skill" } else { "baseline" }
                prompt_tokens = [double]$arm.prompt_tokens
                completion_tokens = [double]$arm.completion_tokens
                request_tokens = [double]$arm.prompt_tokens + [double]$arm.completion_tokens
                provider_total_tokens = [double]$arm.total_tokens
                latency_sec = [double]$arm.time
                passed = [bool]$arm.passed
            }
        }
    }
    Show-Summary $samples
    exit 0
}

if (-not $env:GEMINI_API_KEY) {
    throw "Set GEMINI_API_KEY in the terminal environment, then rerun. Use -AnalyzeExisting without a key."
}
if (-not (Test-Path $InstructionFile)) {
    throw "Instruction file not found: $InstructionFile"
}

$instructions = Get-Content $InstructionFile -Raw
$tests = @(
    [pscustomobject]@{
        id = "clarify-export"
        evaluator = "clarify"
        prompt = "Write a Python function to export a user list."
    },
    [pscustomobject]@{
        id = "simple-discount"
        evaluator = "simple"
        prompt = "Implement a simple discount calculator in Python that takes a purchase amount and applies a 10% discount if the amount is over `$100."
    },
    [pscustomobject]@{
        id = "surgical-typo"
        evaluator = "surgical"
        prompt = @'
Fix only the typo 'helo' to 'hello' in greet. Do not change anything else.

```python
def greet(name):
    print("helo " + name)

def add(a,b):
  # bad indentation and spacing
    return a+b

# unused comment from a long time ago
def subtract(a, b):
    return a - b
```
'@
    }
)

function Invoke-Gemini([string]$SystemInstruction, [string]$Prompt) {
    $body = @{
        contents = @(@{ parts = @(@{ text = $Prompt }) })
        generationConfig = @{ temperature = 0 }
    }
    if ($SystemInstruction) {
        $body.systemInstruction = @{ parts = @(@{ text = $SystemInstruction }) }
    }

    $uri = "https://generativelanguage.googleapis.com/v1beta/models/$Model`:generateContent?key=$($env:GEMINI_API_KEY)"
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-RestMethod -Method Post -Uri $uri -ContentType "application/json" -Body ($body | ConvertTo-Json -Depth 10 -Compress)
    $stopwatch.Stop()
    $text = ($response.candidates[0].content.parts | ForEach-Object text) -join ""
    return [pscustomobject]@{
        text = $text
        latency_sec = $stopwatch.Elapsed.TotalSeconds
        prompt_tokens = [int]$response.usageMetadata.promptTokenCount
        completion_tokens = [int]$response.usageMetadata.candidatesTokenCount
        provider_total_tokens = [int]$response.usageMetadata.totalTokenCount
    }
}

Get-Random -SetSeed $Seed | Out-Null
$samples = @()
for ($repetition = 1; $repetition -le $Repetitions; $repetition++) {
    foreach ($test in ($tests | Sort-Object { Get-Random })) {
        foreach ($variant in (@("baseline", "skill") | Sort-Object { Get-Random })) {
            "Run $repetition/${Repetitions}: $($test.id), $variant"
            $systemInstruction = if ($variant -eq "skill") { $instructions } else { $null }
            $result = Invoke-Gemini $systemInstruction $test.prompt
            $evaluation = Test-Response $test.evaluator $result.text
            $samples += [pscustomobject]@{
                repetition = $repetition
                test_id = $test.id
                variant = $variant
                passed = $evaluation.passed
                reason = $evaluation.reason
                latency_sec = $result.latency_sec
                prompt_tokens = $result.prompt_tokens
                completion_tokens = $result.completion_tokens
                request_tokens = $result.prompt_tokens + $result.completion_tokens
                provider_total_tokens = $result.provider_total_tokens
                text = $result.text
            }
        }
    }
}

$document = [ordered]@{
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    model = $Model
    repetitions = $Repetitions
    seed = $Seed
    instruction_file = $InstructionFile
    instruction_characters = $instructions.Length
    samples = $samples
}
$document | ConvertTo-Json -Depth 8 | Set-Content $OutputFile -Encoding UTF8
Show-Summary $samples
"Raw results: $OutputFile"