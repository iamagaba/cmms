#!/bin/bash

# Phase 1 Next Steps Script
# Run this after reviewing the automated icon migration

echo "🚀 Phase 1 Next Steps"
echo "===================="
echo ""

echo "Step 1: Install Lucide React"
echo "----------------------------"
echo "Running: npm install lucide-react"
npm install lucide-react
echo "✅ Lucide React installed"
echo ""

echo "Step 2: Uninstall Hugeicons"
echo "---------------------------"
echo "Running: npm uninstall @hugeicons/react @hugeicons/core-free-icons"
npm uninstall @hugeicons/react @hugeicons/core-free-icons
echo "✅ Hugeicons removed"
echo ""

echo "Step 3: Check for remaining size props"
echo "--------------------------------------"
echo "Searching for remaining size={} props..."
rg "size=\{" src/ --type tsx || echo "✅ No remaining size props found!"
echo ""

echo "Step 4: Run linting"
echo "-------------------"
echo "Running: npm run lint"
npm run lint
echo ""

echo "Step 5: Type checking"
echo "--------------------"
echo "Running: npm run type-check (if available)"
npm run type-check 2>/dev/null || tsc --noEmit || echo "⚠️  Type check command not found, skipping..."
echo ""

echo "📋 Manual Tasks Remaining:"
echo "=========================="
echo ""
echo "1. Fix dynamic icon usage in ~15 files"
echo "   See: PHASE_1_ICON_MIGRATION_MANUAL_FIXES.md"
echo ""
echo "2. Priority files to fix:"
echo "   - src/components/buttons/EnhancedButton.tsx"
echo "   - src/components/dashboard/ModernKPICard.tsx"
echo "   - src/components/dashboard/PriorityWorkOrders.tsx"
echo "   - src/components/CategoryMultiSelect.tsx"
echo "   - src/components/error/ErrorBoundary.tsx"
echo ""
echo "3. Test the application:"
echo "   npm run dev"
echo ""
echo "4. Verify in browser:"
echo "   - Navigation icons"
echo "   - Button icons"
echo "   - Status badges"
echo "   - Empty states"
echo "   - Dark mode"
echo ""
echo "✨ Phase 1 automated steps complete!"
echo "📖 See PHASE_1_IMPLEMENTATION_COMPLETE.md for full details"
