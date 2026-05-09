# Rapport d'audit — Système d'accompagnement

**Date** : 19 avril 2026  
**Méthode** : Lecture systématique des fichiers implémentés + comparaison avec les fichiers de référence dans `docs/refonte-textes/`  
**Référence** : `AUDIT-POST-IMPLEMENTATION.md` (6 axes)

---

## Synthèse

| Axe | Objet | Verdict | Problèmes |
|-----|-------|---------|-----------|
| 1.1 | Tooltips | ✅ CONFORME | 4 clés COMPLEMENT hors référence (valides) |
| 1.2 | Popups contextuelles | ✅ CONFORME (12/12) | 26 entrées hors périmètre — décision requise |
| 1.3 | Tour guidé | ✅ CONFORME | 0 |
| 1.4 | États vides | ✅ CONFORME | 0 |
| 1.5 | Bannière + transitions | ✅ CONFORME | 0 |
| 1.6 | Glossaire | ✅ CONFORME | 0 |
| 2 | Faux positifs états vides | ⚠️ NON VÉRIFIÉ | Requiert test en contexte (données démo) |
| 3 | Palette visuelle | ❌ NON FAIT | Les 26 variables `--acc-*` sont absentes de `styles.css` |
| 4 | Textes non approuvés | ⚠️ INVENTAIRE FAIT | 26 entrées hors périmètre listées ci-dessous |
| 5 | Cohérence termes | ⚠️ PARTIEL | IPB→ACO incomplet, «Profil RLO» persiste |
| 6 | Intégrité technique | ⚠️ PARTIEL | Styles inline dans 2 fichiers |

---

## Axe 1 — Conformité des textes

### 1.1 Tooltips (`tooltips-contenu.js`) — ✅ CONFORME

Les 239 clés des fichiers T1 à T11 sont toutes présentes avec un texte **exactement conforme** (échappement Unicode vérifié). Le fichier utilise correctement le pattern IIFE + `window.TOOLTIPS`. Aucun innerHTML, aucun style inline, aucun handler inline.

**4 clés COMPLEMENT** (lignes 770-787) n'apparaissent dans aucun fichier de référence : `nav-structure`, `nav-contexte`, `nav-suivi`, `pref-theme`. Elles sont contextuellement nécessaires (onglets de navigation principaux et préférence thème). **Action** : les documenter dans un fichier `infobulles-T12-complement.md` ou les intégrer dans T11.

### 1.2 Popups (`aide-contextuelle-contenu.js`) — ✅ CONFORME pour les 12 validées

Les 12 popups de la refonte (8 réécrites + 4 nouvelles) sont présentes avec un contenu conforme au fichier `popups-aide-contextuelle.md`.

**Nommage** : Les clés JS utilisent un schéma différent des noms `conseil-*` du fichier de référence (ex. : `conseil-productions` → `structure-productions` dans le JS). Ce n'est pas un bug — le mapping par contenu est correct.

**26 entrées hors périmètre** : voir Axe 4.

**3 styles inline** dans l'entrée `bibliotheque-fonctionnement` (lignes 391-393) :
```javascript
"<strong style='color: var(--vert-succes);'>Locale</strong>"
"<strong style='color: var(--bleu-clair);'>Bibliothèque</strong>"
"<strong style='color: var(--orange-accent);'>Retirée</strong>"
```
Les variables CSS sont correctes mais le `style=` inline viole le principe. **Action** : remplacer par des classes.

### 1.3 Tour guidé (`guidage.js`) — ✅ CONFORME

Les 6 étapes (0 à 5) correspondent exactement à `tour-guide-bloc5.md`. Textes des boutons conformes. Préférences globales (pas de préfixe trimestre).

### 1.4 États vides (`etats-vides.js`) — ✅ CONFORME

Les 13 textes d'états vides correspondent à `textes-manquants-bloc4.md`.

### 1.5 Bannière et transitions — ✅ CONFORME

Bannière d'accueil dans `accueil.js` conforme. 3 transitions dans `transitions.js` conformes. `transitions.js` utilise correctement `window.cle()` pour les données par trimestre.

### 1.6 Glossaire — ✅ CONFORME

48 termes dans `glossaire-data.js` conformes à `glossaire-bloc6.md`. Moteur de rendu (`glossaire.js`) fonctionnel : micro-popup + page dédiée.

---

## Axe 2 — Faux positifs d'états vides — ⚠️ NON VÉRIFIÉ

Cet axe requiert un test fonctionnel en contexte : activer les données démo et vérifier qu'aucun message «crée ta première X» n'apparaît. Le problème a été constaté avant l'audit (échelles, grilles). Claude Code a appliqué un fix local pour les grilles.

**Action** : tester les 11 sections listées dans `AUDIT-POST-IMPLEMENTATION.md` (Axe 2) avec données démo actives.

---

## Axe 3 — Palette visuelle — ❌ NON IMPLÉMENTÉE

### Constat critique

**Les 26 variables `--acc-*` ne sont pas définies dans `styles.css`.** Aucune variable de la palette accompagnement n'existe dans `:root`.

### Couleurs en dur dans le CSS des composants d'accompagnement

| Composant | Lignes | Couleurs en dur |
|-----------|--------|----------------|
| `.primo-popup-header` | 10611-10612 | `#244858`, `white` |
| `.primo-popup-close` | 10631 | `white` |
| `.primo-overlay` | 10676 | `rgba(0,0,0,0.5)` |
| `.tour-header` | 22930-22931 | `var(--accent-primaire, #2da9d7)`, `#fff` |
| `.tour-dot` (3 états) | 22949-22959 | `rgba(255,255,255,0.35)`, `#fff`, `rgba(255,255,255,0.85)` |
| `.tour-fermer` | 22968-22977 | `#fff`, `rgba(255,255,255,0.15)` |
| `.etat-vide-banniere` | 22792-22795 | `var(--carte-info-note-fond)`, `var(--carte-info-note-bordure)` |
| `.glossaire-fiche-etape-*` | 23217-23221 | `#b78300`, `#138055`, `#7a2dbf` + rgba en dur |
| `.mode-clair .primo-popup-header` | 20016 | gradient `#032e5c → #0f1e3a` en dur |

### Styles inline dans le JS

| Fichier | Lignes | Nature |
|---------|--------|--------|
| `aide-contextuelle-contenu.js` | 391-393 | `style='color: var(...)'` × 3 |
| `accueil.js` | 102-275 | ~15 attributs `style=` (layout : margin, display, font-size, gap) |
| `glossaire.js` | 132-133 | `.style.left`, `.style.top` (positionnement — acceptable) |

**Action requise** : ajouter les 26 variables `--acc-*` dans `:root`, puis remplacer toutes les couleurs en dur des composants d'accompagnement par les variables correspondantes. Convertir les styles inline en classes CSS. Aucune redéfinition dans `.mode-clair`.

---

## Axe 4 — Textes non approuvés — ⚠️ INVENTAIRE COMPLET

26 entrées dans `aide-contextuelle-contenu.js` ne sont PAS couvertes par la refonte. Certaines contiennent du texte potentiellement problématique.

### Entrées à inspecter en priorité

| Entrée | Ligne | Problème identifié |
|--------|-------|-------------------|
| `interventions-planification` | 572 | Contient le cycle «teach-test-revise-test» (l. 606), mention «API, conseiller pédagogique» (l. 612). **Texte non validé par Grégoire.** |
| `suivi-apprentissage-fondamentaux` | 622 | Mentionne «IPB» (l. 627, 635) — terminologie obsolète. |
| `bibliotheque-fonctionnement` | 380 | 3 styles inline (l. 391-393). |
| `apercu-contenu` | 223 | Doublon potentiel avec `tableau-bord-apercu` (validé comme `conseil-apercu`). |

### Liste complète des 26 entrées hors périmètre

1. `construction-objectifs-reflexion` (l. 24)
2. `structure-apercu-legacy` (l. 57)
3. `construction-echelles` (l. 141)
4. `apercu-contenu` (l. 223) — **doublon possible** avec `conseil-apercu`
5. `tableau-bord-rai` (l. 252)
6. `suivi-saisie` (l. 276)
7. `contexte-trimestre` (l. 306)
8. `suivi-liste` (l. 340) — **attention** : validé dans la refonte sous `conseil-liste-etudiants`
9. `contexte-calendrier` (l. 351)
10. `bibliotheque-fonctionnement` (l. 380) — **3 styles inline**
11. `evaluations-annoter` (l. 423)
12. `evaluations-liste` (l. 455)
13. `profil-etudiant-indicateurs` (l. 489)
14. `profil-etudiant-accompagnement` (l. 537)
15. `interventions-planification` (l. 572) — **texte suspect**
16. `suivi-apprentissage-fondamentaux` (l. 622) — **IPB obsolète**
17. `apc-activite` (l. 796)
18. `apc-grille-individuel` (l. 806)
19. `objectif-verbes-actifs` (l. 820)
20. `echeance-indices` (l. 839)
21. `echeances-multigroupes` (l. 849)
22. `retroaction-grille-descriptive` (l. 859)
23. `categories-selection-obligatoires` (l. 888)
24. `echelle-plage-notes` (l. 906)
25. `echelle-valeur-ponctuelle` (l. 916)
26. `grille-type-critere-detail` (l. 926)
27. `grille-niveau-solo` (l. 941)

**Décision requise de Grégoire** : pour chaque entrée, garder telle quelle, réécrire, ou supprimer.

---

## Axe 5 — Cohérence terminologique — ⚠️ PARTIEL

### 5.1 Jetons — ✅ CONFORME
Toutes les descriptions utilisent «démontrer sa compétence ou son habileté».

### 5.2 Productions — ✅ CONFORME
Aucune occurrence de «travaux évaluatifs» en contexte de planification.

### 5.3 Indices A-C-P — ✅ CONFORME
Glossaire (`glossaire-data.js`) et tour guidé (`guidage.js`) utilisent les formulations correctes. Mention de «lecture subjective» présente.

### 5.4 IPB → ACO — ❌ INCOMPLET

**«Profil RLO» persiste dans 5 fichiers :**

| Fichier | Ligne | Contexte |
|---------|-------|----------|
| `tooltips-contenu.js` | 119 | «Les résultats alimentent le profil RLO et l'export...» |
| `evaluation.js` | 2286, 5955 | Commentaires «Profil RLO (Actions cognitives)» |
| `profil-etudiant.js` | 6177, 6190, 6441 | Titre UI «Profil RLO (actions cognitives observées)» |
| `actions-rlo.js` | 2, 13, 25, 146, 207 | En-tête de module + commentaires |
| `aide-contextuelle-contenu.js` | 627, 635 | Mentions d'«IPB» dans texte utilisateur |

**Note** : `calculerIPB()` dans `profil-etudiant.js` est un nom de fonction interne — le renommer est optionnel. Mais les textes **visibles par l'utilisateur** (titre «Profil RLO» à la ligne 6190, tooltip ligne 119, texte popup lignes 627/635) doivent passer à «Profil ACO» / remplacer «IPB» par la formulation validée.

### 5.5 Cartouche — ✅ CONFORME
Le glossaire utilise «commentaires généraux automatiques».

---

## Axe 6 — Intégrité technique — ✅ CONFORME (sauf styles inline)

| Critère | Résultat |
|---------|----------|
| Handlers inline (`onclick=`, `onchange=`) | ✅ Aucun |
| `innerHTML` + données utilisateur sans `echapperHtml()` | ✅ Aucun cas dangereux détecté |
| `console.log` | ✅ Uniquement `console.warn` / `console.error` |
| Préférences tour guidé sans préfixe trimestre | ✅ Correct (`obtenirPreference()` globale) |
| Styles inline | ⚠️ Voir Axe 3 |

---

## Actions requises — Résumé ordonné

### Priorité 1 — Palette visuelle (Axe 3)
1. Ajouter les 26 variables `--acc-*` dans `:root` de `styles.css`
2. Remplacer les couleurs en dur de tous les composants d'accompagnement par `var(--acc-*)`
3. Supprimer la redéfinition `.mode-clair .primo-popup-header` (ligne ~20016) — la palette ne change pas
4. Convertir les 3 styles inline de `bibliotheque-fonctionnement` en classes CSS
5. Convertir les styles inline de `accueil.js` en classes CSS

### Priorité 2 — Terminologie IPB→ACO (Axe 5.4)
6. `tooltips-contenu.js` l.119 : «profil RLO» → «profil ACO»
7. `profil-etudiant.js` l.6190 : titre UI «Profil RLO» → «Profil ACO»
8. `aide-contextuelle-contenu.js` l.627, 635 : remplacer «IPB» par formulation validée
9. Commentaires dans `evaluation.js`, `profil-etudiant.js`, `actions-rlo.js` : «RLO» → «ACO» (optionnel mais recommandé)

### Priorité 3 — Textes non approuvés (Axe 4)
10. `interventions-planification` : réécrire ou valider (cycle teach-test-revise-test, mention API/conseiller)
11. `suivi-apprentissage-fondamentaux` : réécrire (mentions IPB)
12. Décision pour les 24 autres entrées hors périmètre

### Priorité 4 — Tests fonctionnels (Axe 2)
13. Tester les états vides avec données démo actives
14. Vérifier que le fix local «grilles» est systémique

### Optionnel
15. Documenter les 4 clés COMPLEMENT des tooltips
