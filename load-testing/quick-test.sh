#!/bin/bash

# Script de test rapide pour Bodega Academy
# Usage: ./quick-test.sh [artillery|k6] [users]

TOOL=${1:-k6}
USERS=${2:-50}
URL="https://bodegaacademy.vercel.app"

echo "🚀 Bodega Academy - Test de Charge Rapide"
echo "=========================================="
echo "Tool: $TOOL"
echo "Users: $USERS"
echo "Target: $URL"
echo ""

if [ "$TOOL" = "artillery" ]; then
    echo "📊 Lancement du test Artillery..."
    artillery quick --count $USERS --num 100 $URL
elif [ "$TOOL" = "k6" ]; then
    echo "📊 Lancement du test k6..."
    k6 run --vus $USERS --duration 2m k6-load-test.js
else
    echo "❌ Outil inconnu. Utilisez 'artillery' ou 'k6'"
    exit 1
fi

echo ""
echo "✅ Test terminé!"
