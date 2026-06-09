# Axe 5 — Sécurité et protection des données

**Priorité 5.** **Temps total estimé : 7 h 30.** **Claude Code + décisions Grégoire.**

---

## Question d'audit

Le code est-il exempt de vulnérabilités OWASP Top 10 connues ? Les données d'élèves sont-elles protégées ? Le projet est-il conforme à la Loi 25 (Québec) ?

---

## Cadre

- **OWASP Top 10 (2021)** — référentiel international des vulnérabilités web.
- **Veracode 2025 GenAI Code Security Report** (30 juillet 2025) — 45 % des complétions LLM introduisent une vulnérabilité OWASP Top 10. Pour JavaScript : 38-45 % d'échec. Pires CWE : XSS (CWE-80, 86 % d'échec) et log injection (CWE-117, 88 % d'échec).
- **Loi 25 (Québec)** — Loi modernisant des dispositions législatives en matière de protection des renseignements personnels.
- **OWASP Web Security Testing Guide v4.2** — pour la section IndexedDB / localStorage.

---

## Sous-audits

### 5.5 — Lighthouse Best Practices (en premier, 30 min)

**Pourquoi en premier** : rapide à exécuter, donne une vue d'ensemble qui oriente les audits suivants.

**Commandes** :

```bash
# Servir le projet localement (nécessaire pour Lighthouse)
npx http-server -p 8080 -c-1 &
SERVER_PID=$!
sleep 2

# Lighthouse Best Practices + SEO
npx lighthouse http://localhost:8080 \
  --only-categories=best-practices,seo \
  --output=html \
  --output=json \
  --output-path=audit/reports/05-5-lighthouse-bp

# Arrêter le serveur
kill $SERVER_PID
```

**Seuils** :
- Vert : score Best Practices ≥ 90.
- Jaune : 70-89.
- Rouge : < 70.

**Livrable** : `audit/reports/05-5-lighthouse-bp.md` avec score + détail des warnings (CSP, HTTPS, console errors).

---

### 5.1 — Audit OWASP Top 10 ciblé (3 h)

Voir `owasp-checklist.md` dans ce dossier.

**Commandes principales** :

```bash
# A03 Injection — recherche XSS via DOM
grep -rn "innerHTML\|insertAdjacentHTML\|outerHTML\|document\.write" js/ > audit/reports/05-1-xss-vectors.txt

# A03 Injection — eval
grep -rn "eval(\|new Function(\|setTimeout(\"\|setInterval(\"" js/ > audit/reports/05-1-eval.txt

# A09 Logging — recherche de logs potentiellement sensibles
grep -rn "console\.\(log\|info\|debug\|warn\|error\)" js/ > audit/reports/05-1-logs.txt

# ESLint security plugin (config dédiée fournie dans audit/.eslintrc.audit.json)
npx eslint --no-eslintrc -c audit/.eslintrc.audit.json --ext .js js/ -f stylish > audit/reports/05-1-eslint-security.txt 2>&1 || true

# npm audit si package.json présent
[ -f package.json ] && npm audit --json > audit/reports/05-1-npm-audit.json
```

**Pour chaque occurrence de vecteur XSS** : Claude Code lit le contexte (10 lignes avant/après) et juge :
- **Sûr** : contenu purement statique ou contrôlé (pas d'entrée utilisateur).
- **À assainir** : contenu utilisateur ; doit passer par `textContent` ou une fonction d'échappement.
- **Critique** : contenu utilisateur directement injecté sans assainissement.

**Livrable** : `audit/reports/05-1-owasp.md` avec tableau 10 catégories OWASP × statut + liste des occurrences critiques.

---

### 5.2 — Contexte Veracode pour le rapport public (30 min)

**Objectif** : rédiger une section pédagogique pour les rapports public/AQPC qui explique pourquoi l'audit de sécurité d'un code vibe-codé est important, sans paniquer ni minimiser.

**Texte de référence à reformuler dans le livrable** :

> Selon le rapport Veracode 2025 GenAI Code Security Report (30 juillet 2025), les complétions de code générées par des grands modèles de langage introduisent une vulnérabilité classée dans l'OWASP Top 10 dans 45 % des cas. Pour JavaScript spécifiquement, le taux d'échec se situe entre 38 % et 45 %. Les deux types de vulnérabilités les plus fréquents sont le cross-site scripting (CWE-80, 86 % d'échec) et la log injection (CWE-117, 88 % d'échec).
>
> Labo Codex étant développé en vibe coding avec Claude Code, l'audit de sécurité est non négociable, en particulier pour les vecteurs XSS via contenu utilisateur (artefacts saisis par l'enseignant, imports JSON/ZIP) et l'assainissement des sorties console.
>
> Le chiffre de 45 % concerne des complétions « out of the box » sans prompt sécurité. Un workflow où Claude Code est explicitement invité à respecter OWASP réduit ce taux — sans qu'aucune étude publique n'ait quantifié l'ampleur de cette réduction.

**Livrable** : `audit/reports/05-2-veracode-context.md`.

---

### 5.3 — Inventaire des données stockées (2 h)

**Question** : quelles données nominatives ou pseudonymisables sont stockées en clair dans IndexedDB ou localStorage ?

Voir `data-inventory-template.md` dans ce dossier.

**Méthode** :

1. Ouvrir Labo Codex en local avec des données de test.
2. Dans la console du navigateur :
   ```javascript
   // Lister toutes les clés localStorage
   Object.keys(localStorage)

   // Pour chaque clé, voir le contenu
   localStorage.getItem('<clé>')

   // Pour IndexedDB, ouvrir DevTools > Application > IndexedDB
   ```

3. Pour chaque clé / objet :
   - Type de donnée (texte, nombre, identifiant).
   - Sensibilité (publique / identifiant pseudo / nominative / sensible).
   - Justification de stockage.
   - Politique de rétention.

**Référence OWASP** : *Web Security Testing Guide v4.2*, §4.11.12 : « objects stored in IndexedDB are freely accessible by any JS included on the host page without any restrictions making them vulnerable to confidentiality and integrity violations » — l'argument « hors-ligne » ne protège pas si une XSS existe.

**Livrable** : `audit/reports/05-3-data-inventory.md` complété.

---

### 5.4 — Conformité Loi 25 (Québec) (2 h)

Voir `loi25-checklist.md` dans ce dossier.

**Note importante** : ce sous-audit n'est PAS un avis juridique. Pour validation formelle, consulter le responsable institutionnel de l'accès à l'information du Cégep de Drummondville ou la Commission d'accès à l'information du Québec.

**Méthode** : checklist tirée des obligations de la Loi 25 applicables à un système d'information traitant des renseignements personnels.

**Livrable** : `audit/reports/05-4-loi25.md` + ébauche de `PRIVACY.md` à la racine du repo.

---

## Synthèse de l'axe 5

`audit/reports/05-summary.md` :

- Tableau statuts par sous-audit.
- Évaluation globale : Labo Codex est-il déployable en classe sans risque inacceptable pour les données d'élèves ?
- Recommandations consolidées priorisées.

**Critère d'alerte** : si une vulnérabilité critique est détectée (XSS exploitable, données nominatives en clair sans chiffrement, eval avec contenu utilisateur), **suspendre l'audit et corriger immédiatement** avant de continuer les axes suivants.
