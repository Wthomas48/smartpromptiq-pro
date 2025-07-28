# Smart PromptIQ App Feature Testing Script
# This script helps you systematically test all features and functions

Write-Host "=== Smart PromptIQ App Feature Testing ===" -ForegroundColor Cyan
Write-Host "Starting comprehensive feature verification..." -ForegroundColor Green

# Step 1: Project Structure Verification
Write-Host "`n1. CHECKING PROJECT STRUCTURE" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

function Test-ProjectStructure {
    $requiredDirs = @(
        "components",
        "components/ui", 
        "pages",
        "api",
        "public",
        "styles"
    )
    
    $requiredFiles = @(
        "package.json",
        "next.config.js",
        "tsconfig.json",
        "tailwind.config.js"
    )
    
    Write-Host "Checking directory structure..." -ForegroundColor White
    foreach ($dir in $requiredDirs) {
        if (Test-Path $dir) {
            Write-Host "✓ $dir exists" -ForegroundColor Green
        } else {
            Write-Host "✗ $dir missing" -ForegroundColor Red
        }
    }
    
    Write-Host "`nChecking required files..." -ForegroundColor White
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Host "✓ $file exists" -ForegroundColor Green
        } else {
            Write-Host "✗ $file missing" -ForegroundColor Red
        }
    }
}

# Step 2: Component Dependencies Check
Write-Host "`n2. CHECKING COMPONENT DEPENDENCIES" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

function Test-ComponentDependencies {
    $components = @(
        "components/Navigation.tsx",
        "components/HeroSection.tsx", 
        "components/QuickStart.tsx",
        "components/ui/card.tsx",
        "components/Logo.tsx"
    )
    
    Write-Host "Checking component files..." -ForegroundColor White
    foreach ($component in $components) {
        if (Test-Path $component) {
            Write-Host "✓ $component exists" -ForegroundColor Green
            
            # Check for TypeScript syntax errors
            $content = Get-Content $component -Raw -ErrorAction SilentlyContinue
            if ($content -and ($content -match "export.*default|export.*function|export.*const")) {
                Write-Host "  → Has valid exports" -ForegroundColor DarkGreen
            } else {
                Write-Host "  → Missing exports or empty file" -ForegroundColor Red
            }
        } else {
            Write-Host "✗ $component missing" -ForegroundColor Red
        }
    }
}

# Step 3: Package Dependencies Check
Write-Host "`n3. CHECKING PACKAGE DEPENDENCIES" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

function Test-PackageDependencies {
    if (Test-Path "package.json") {
        try {
            $packageJson = Get-Content "package.json" | ConvertFrom-Json
            
            $requiredDeps = @(
                "react",
                "next", 
                "typescript",
                "tailwindcss",
                "lucide-react",
                "@types/react",
                "@types/node"
            )
            
            Write-Host "Checking package.json dependencies..." -ForegroundColor White
            $allDeps = @{}
            if ($packageJson.dependencies) { 
                $packageJson.dependencies.PSObject.Properties | ForEach-Object { $allDeps[$_.Name] = $_.Value }
            }
            if ($packageJson.devDependencies) { 
                $packageJson.devDependencies.PSObject.Properties | ForEach-Object { $allDeps[$_.Name] = $_.Value }
            }
            
            foreach ($dep in $requiredDeps) {
                if ($allDeps.ContainsKey($dep)) {
                    Write-Host "✓ $dep installed (v$($allDeps[$dep]))" -ForegroundColor Green
                } else {
                    Write-Host "✗ $dep missing" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "✗ Error reading package.json: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ package.json not found" -ForegroundColor Red
    }
}

# Step 4: Feature Implementation Check
Write-Host "`n4. CHECKING FEATURE IMPLEMENTATIONS" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow

function Test-FeatureImplementations {
    Write-Host "Checking Home.tsx for feature implementations..." -ForegroundColor White
    
    if (Test-Path "Home.tsx") {
        $homeContent = Get-Content "Home.tsx" -Raw
        
        $features = @(
            "Intelligent Questionnaires",
            "AI-Powered Generation", 
            "Full Customization",
            "Prompt Library",
            "Usage Analytics",
            "Team Collaboration"
        )
        
        foreach ($feature in $features) {
            if ($homeContent -like "*$feature*") {
                Write-Host "✓ $feature - Found in Home.tsx" -ForegroundColor Green
            } else {
                Write-Host "✗ $feature - Not found in Home.tsx" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "✗ Home.tsx not found" -ForegroundColor Red
    }
    
    # Check for API endpoints
    Write-Host "`nChecking API structure..." -ForegroundColor White
    if (Test-Path "pages/api") {
        Write-Host "✓ API directory exists" -ForegroundColor Green
    } else {
        Write-Host "✗ API directory missing" -ForegroundColor Red
    }
    
    if (Test-Path "pages/api/login.ts") {
        Write-Host "✓ Login API endpoint exists" -ForegroundColor Green
    } else {
        Write-Host "✗ Login API endpoint missing" -ForegroundColor Red
    }
}

# Step 5: Build and Development Server Check
Write-Host "`n5. CHECKING BUILD CONFIGURATION" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

function Test-BuildConfiguration {
    Write-Host "Testing build configuration..." -ForegroundColor White
    
    # Check if npm is available
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-Host "✓ npm available (v$npmVersion)" -ForegroundColor Green
        } else {
            Write-Host "✗ npm not found" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ npm not available" -ForegroundColor Red
    }
    
    # Check if node_modules exists
    if (Test-Path "node_modules") {
        Write-Host "✓ node_modules directory exists" -ForegroundColor Green
    } else {
        Write-Host "✗ node_modules missing - run 'npm install'" -ForegroundColor Red
    }
    
    # Check package.json scripts
    if (Test-Path "package.json") {
        try {
            $packageJson = Get-Content "package.json" | ConvertFrom-Json
            if ($packageJson.scripts) {
                $scripts = @("dev", "build", "start")
                foreach ($script in $scripts) {
                    if ($packageJson.scripts.PSObject.Properties.Name -contains $script) {
                        Write-Host "✓ npm script '$script' available" -ForegroundColor Green
                    } else {
                        Write-Host "✗ npm script '$script' missing" -ForegroundColor Red
                    }
                }
            }
        } catch {
            Write-Host "✗ Error reading package.json scripts" -ForegroundColor Red
        }
    }
}

# Step 6: Functionality Testing
Write-Host "`n6. FUNCTIONAL TESTING CHECKLIST" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

function Show-FunctionalTestingChecklist {
    $testCases = @(
        "Navigation component loads correctly",
        "Hero section displays with call-to-action button",
        "Get Started button redirects to /api/login",
        "QuickStart demo section is interactive",
        "All 6 feature cards display with correct icons",
        "Feature cards have proper gradient backgrounds",
        "Icons animate with float effect",
        "Footer links are properly structured", 
        "Responsive design works on mobile/tablet",
        "All Lucide React icons render correctly"
    )
    
    Write-Host "Manual testing checklist:" -ForegroundColor White
    Write-Host "(Test these in your browser after running 'npm run dev')" -ForegroundColor Cyan
    
    foreach ($i in 0..($testCases.Length-1)) {
        Write-Host "$($i+1). $($testCases[$i])" -ForegroundColor White
        Write-Host "   [ ] Tested" -ForegroundColor Gray
    }
}

# Execute all tests
Test-ProjectStructure
Test-ComponentDependencies  
Test-PackageDependencies
Test-FeatureImplementations
Test-BuildConfiguration
Show-FunctionalTestingChecklist

Write-Host "`n=== TESTING COMPLETE ===" -ForegroundColor Cyan
Write-Host "Review the results above and address any issues marked with ✗" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Fix any missing files or components" -ForegroundColor White
Write-Host "2. Run 'npm install' to ensure all dependencies are installed" -ForegroundColor White  
Write-Host "3. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "4. Test the application in your browser at http://localhost:3000" -ForegroundColor White
Write-Host "5. Complete the manual testing checklist" -ForegroundColor White
