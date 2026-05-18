#!/usr/bin/env bash
# Audit cyclomatic complexity ESLint sur les modules du refactor en cours.
# Usage : ./audit/refactoring-prep/check-complexity.sh [prefix]
#   prefix par défaut = 'evaluation' → js/evaluation*.js
#
# Configuration ESLint flat config externe (script-source non-modulaire).
# Cible : cyc <= 30 (cible dure METHODE §3 étape 4).

set -e

PREFIX="${1:-evaluation}"
CONFIG_PATH="/tmp/eslint-cyc-check-${PREFIX}.config.mjs"

cat > "$CONFIG_PATH" << 'EOF'
export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly', document: 'readonly', console: 'readonly',
        db: 'readonly', cle: 'readonly', echapperHtml: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly',
        Promise: 'readonly', JSON: 'readonly', Object: 'readonly',
        Array: 'readonly', Math: 'readonly', String: 'readonly',
        Number: 'readonly', Boolean: 'readonly', Date: 'readonly',
        Map: 'readonly', Set: 'readonly', Symbol: 'readonly',
        Error: 'readonly', RegExp: 'readonly', alert: 'readonly',
        confirm: 'readonly', prompt: 'readonly', URL: 'readonly',
        File: 'readonly', FileReader: 'readonly', Blob: 'readonly',
      },
    },
    rules: { complexity: ['error', 30] },
  },
];
EOF

echo "Audit cyc>30 sur js/${PREFIX}*.js (config: $CONFIG_PATH)"
echo ""
npx -y eslint@9 --config "$CONFIG_PATH" "js/${PREFIX}"*.js
