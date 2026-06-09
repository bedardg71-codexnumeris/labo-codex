# Axe 6 — Accessibilité

**Priorité 6.** **Temps total estimé : 4 h 30.** **Claude Code (automatique) + tests manuels Grégoire.**

---

## Question d'audit

Labo Codex est-il accessible aux utilisateurs en situation de handicap (visuel, moteur, cognitif) ? L'application fonctionne-t-elle correctement sur iPad ?

---

## Cadre

- **WCAG 2.1 niveau AA** (minimum recommandé, AAA en aspiration).
- **Apple Human Interface Guidelines** pour iPad (touch targets ≥ 44×44 pt).
- **Deque Automated Accessibility Coverage Report** : limite connue de l'audit automatisé (16/50 critères WCAG 2.1 AA, soit ~20-30 % de couverture par critère, ~57 % par volume d'issues).

---

## Sous-audits

### 6.1 — WCAG 2.1 AA automatisé (1 h)

**Commandes** :

```bash
# Serveur local
npx http-server -p 8080 -c-1 &
SERVER_PID=$!
sleep 2

# axe-core CLI
npx @axe-core/cli http://localhost:8080 \
  --tags wcag2a,wcag2aa,wcag21a,wcag21aa \
  --save audit/reports/06-1-axe.json

# Lighthouse Accessibility
npx lighthouse http://localhost:8080 \
  --only-categories=accessibility \
  --output=html \
  --output=json \
  --output-path=audit/reports/06-1-lighthouse-a11y

kill $SERVER_PID
```

**Limite à mentionner explicitement dans le livrable** : selon Deque, l'audit automatisé ne couvre que 16/50 critères WCAG 2.1 AA. **Un score Lighthouse de 100/100 ne signifie pas conformité WCAG.** Les violations détectables automatiquement sont surtout : contraste de couleur, attributs alt manquants, labels de formulaires absents, structure de titres incohérente.

**Seuils** :
- Vert : score Lighthouse ≥ 90, 0 violation axe niveau A et AA.
- Jaune : score 70-89, ≤ 3 violations mineures.
- Rouge : score < 70, ou ≥ 1 violation critique (contraste, labels manquants, focus piégé).

**Livrable** : `audit/reports/06-1-wcag-auto.md` avec :
- Score Lighthouse Accessibility.
- Liste des violations axe par sévérité (critical / serious / moderate / minor).
- Mention explicite de la limite de couverture automatisée.

---

### 6.2 — Tests manuels d'accessibilité (2 h)

Voir `manual-tests.md` dans ce dossier.

**Méthode** : passage clavier exclusif sur les 5 parcours principaux + test VoiceOver iPad.

**Parcours à tester** (à définir avec Grégoire) :

1. Créer un nouvel élève.
2. Ajouter une évaluation d'artefact.
3. Consulter le profil d'un élève (indices A-C-P).
4. Déclencher une intervention RàI.
5. Exporter les données.

**Pour chaque parcours** :
- Navigation au clavier uniquement (Tab, Maj+Tab, Entrée, Échap, flèches).
- Focus visible à chaque étape.
- Annonces VoiceOver correctes (sur iPad).
- Messages d'erreur lisibles.
- Possibilité de revenir en arrière.

**Seuils** :
- Vert : tous les parcours navigables au clavier sans souris.
- Jaune : 1 parcours problématique, contournable.
- Rouge : ≥ 1 parcours bloqué, focus perdu, ou contenu inaccessible.

**Livrable** : `audit/reports/06-2-manual.md`.

---

### 6.3 — Spécificités iPad (1 h 30)

Voir `ipad-tests.md` dans ce dossier.

**Tests** :
- Viewport meta correct.
- Touch targets ≥ 44×44 pt (Apple HIG).
- Pas de hover-only (toute interaction hover doit avoir équivalent tap).
- Gestes natifs respectés (swipe pour back, pinch pour zoom).
- Comportement clavier externe (raccourcis).
- Orientation portrait/paysage gérée.

**Outil** : Safari Web Inspector via câble USB-C, depuis Mac.

**Livrable** : `audit/reports/06-3-ipad.md`.

---

## Synthèse de l'axe 6

`audit/reports/06-summary.md` :

- Tableau statuts par sous-audit.
- Évaluation globale de l'accessibilité.
- Recommandations priorisées.
- Mention explicite des limites de l'audit automatisé.

---

## Note méthodologique

L'accessibilité est l'axe le plus difficile à auditer correctement sans expertise spécifique. Pour un audit complet (au-delà de cette grille), envisager :
- Test utilisateur avec une personne en situation de handicap.
- Audit par un expert WCAG certifié (coût indicatif : 1000-3000 $ CAD pour un projet de cette taille).

Ces options sont hors périmètre de l'audit conjoint enseignant/Claude Code.
