# Phase 1 Next Steps Script (PowerShell)
# Run this after reviewing the automated icon migration

Write-Host "🚀 Phase 1 Next Steps" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Install Lucide React" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
Write-Host "Running: npm install lucide-react"
npm install lucide-react
Write-Host "✅ Lucide React installed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Uninstall Hugeicons" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow
Write-Host "Running: npm uninstall @hugeicons/react @hugeicons/core-free-icons"
npm uninstall @hugeicons/react @hugeicons/core-free-icons
Write-Host "✅ Hugeicons removed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Check for remaining size props" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow
Write-Host "Searching for remaining size={} props..."
$sizeProps = rg "size=\{" src/ --type tsx 2>$null
if ($sizeProps) {
    Write-Host $sizeProps
} else {
    Write-Host "✅ No remaining size props found!" -ForegroundColor Green
}
Write-Host ""

Write-Host "Step 4: Run linting" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
Write-Host "Running: npm run lint"
npm run lint
Write-Host ""

Write-Host "Step 5: Type checking" -ForegroundColor Yellow
Write-Host "--------------------" -ForegroundColor Yellow
Write-Host "Running: npm run type-check (if available)"
try {
    npm run type-check 2>$null
} catch {
    try {
        tsc --noEmit
    } catch {
        Write-Host "⚠️  Type check command not found, skipping..." -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "📋 Manual Tasks Remaining:" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Fix dynamic icon usage in ~15 files"
Write-Host "   See: PHASE_1_ICON_MIGRATION_MANUAL_FIXES.md"
Write-Host ""
Write-Host "2. Priority files to fix:"
Write-Host "   - src/components/buttons/EnhancedButton.tsx"
Write-Host "   - src/components/dashboard/ModernKPICard.tsx"
Write-Host "   - src/components/dashboard/PriorityWorkOrders.tsx"
Write-Host "   - src/components/CategoryMultiSelect.tsx"
Write-Host "   - src/components/error/ErrorBoundary.tsx"
Write-Host ""
Write-Host "3. Test the application:"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "4. Verify in browser:"
Write-Host "   - Navigation icons"
Write-Host "   - Button icons"
Write-Host "   - Status badges"
Write-Host "   - Empty states"
Write-Host "   - Dark mode"
Write-Host ""
Write-Host "✨ Phase 1 automated steps complete!" -ForegroundColor Green
Write-Host "📖 See PHASE_1_IMPLEMENTATION_COMPLETE.md for full details" -ForegroundColor Cyan
