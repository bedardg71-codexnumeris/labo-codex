# Note de conception — Comparateur de pratiques, lot C1 (matrice)

> **Statut** : conception validée avec Grégoire le 6 juin 2026. **Aucun code écrit.**
> Préalable : lot C0 livré (seed démo v20.8, 4 profils-types, moteur #307).
> Cadre : `SPEC_comparateur_pratiques.md` §3.1 ; finalité §1 bis ; skill `pratiques_notation` §12.
> Les emplacements `fichier:ligne` datent du 6 juin — **revérifier au moment de coder**.

---

## 1. Objet et périmètre

**C1 = la vue matrice** (vue d'ensemble par défaut du Comparateur).

**Dans C1** : structure de la vue ; sélection inline des pratiques candidates ; cellules note + delta discret ; colonne « Niveau atteint » ; en-têtes E1 (« ce que cette note mesure ») ; ligne de garde ; garde démo.

**Hors C1** (lots suivants) : fiche de profil + récit de calcul E2/E2 bis (**C2**) ; export CSV (**C3**) ; entrée de navigation pérenne (**C4**) ; famille DEN (#318).

En C1, le clic sur une ligne *prépare* l'ouverture de la fiche, mais la fiche est C2.

---

## 2. Décisions actées (6 juin 2026)

1. **Finalité** : sortir du paradigme du cumul ; montrer la **maîtrise en regard** de chaque note ; l'écart en points est un appui discret, jamais l'info vedette. Cf. mémoire `project-comparateur-finalite-sortie-paradigme-som`.
2. **Signal de maîtrise = colonne « Niveau atteint »** (propriété du profil, donc une colonne de ligne — pas une pastille répétée dans chaque cellule).
3. **Vocabulaire neutre** : en-tête « Niveau atteint », valeurs = **libellés de l'échelle de la grille** (« Maîtrisé », « Étendu »…). **Jamais `I/D/M/E` en dur** (IDME = nomenclature personnelle de Grégoire ; l'outil est pluraliste). Cf. mémoire `project-comparateur-niveau-atteint-neutre`.
4. **SOLO non nommé dans la vue** ; concédé via la **description du niveau** de l'échelle, visible **au survol** (« Maîtrisé · relationnel acquis »).
5. **Référence (colonne « Ta pratique ») = pratique active** = `demo-std-litt` (STD) en démo. Deltas calculés vs cette référence.

---

## 3. Layout de la matrice

```
 Profil          Niveau     │ Standards      Sommative      Spécifications
                 atteint    │ (Ta pratique)  (simulation)   (simulation)
                            │ maîtrise…      moyenne…       exigences…
 ───────────────────────────┼───────────────────────────────────────────────
 Fort             Étendu  ↗ │ 90             86  (−4)       100 (+10)
 Moyen            Maîtrisé → │ 77             75  (−2)        80  (+3)
 En difficulté    (dérivé) ↗ │ 65             58  (−7)        50  (−15)
 Irrégulier       Maîtrisé ↗↗│ 81             76  (−5)        60  (−21)
 ───────────────────────────┴───────────────────────────────────────────────
 Des pratiques différentes mesurent des choses différentes —
 un écart n'est ni un bonus ni une erreur.
```

- **Lignes** = 4 profils-types (§8), étiquetés en dur (stables, racontables).
- **Colonnes** = `Niveau atteint` (1ʳᵉ) · référence « Ta pratique » · 1-2 simulations (accent + bordure pointillée, **variables du design system**, pas de couleur nouvelle).
- **Cellule** = note finale + delta discret vs référence (E3 : petit, gris, jamais en vedette ; pas de delta sur la colonne de référence).
- **En-tête de colonne pratique** = nom + **badge famille** (`genererBadgePratiqueHTML`, `pratique-registre.js:132`) + ligne E1 fixe (§5).
- **Ligne de garde** = texte fixe sous la matrice (§2.1).
- `echapperHtml()` sur tout nom de pratique injecté.

> Les notes du mockup sont celles de la campagne C0 (réf STD : 90/77/65/81). Valeurs définitives **recalculées** par le moteur à l'affichage (§6), jamais figées.

---

## 4. La colonne « Niveau atteint » — mécanisme (brique neuve)

C'est le seul élément que la SPEC ne couvre pas encore. Principe :

1. **Niveau de fin de parcours** = `niveauFinal` de la **production terminale** du profil (la démonstration finale ; SPEC E2 bis). Pour DEMO011 : `M`.
2. **Traduction en libellé** : résoudre l'**échelle de la grille** de cette évaluation, trouver `niveaux[].code === niveauFinal` → afficher `.nom` (« Maîtrisé ») ; `.description` (« Relationnel acquis ») fournit le **texte de survol** (`title`/`aria-description`).
   - Échelle démo = `ECH_DEMO_1759264511178` « IDME et niv 0 » (niveaux codes `0/I/D/M/E`, chacun avec `nom` + `description` SOLO).
   - **Aucun littéral `I/D/M/E`** dans le code de la vue : on itère les `niveaux` de l'échelle.
3. **Tendance** ↗/→/↘ = comparaison du niveau des **premières** évaluations vs des **dernières** (trajectoire). Seuils à fixer en C1 (proposition : ≥ 2 crans de hausse → ↗↗ ; 1 cran → ↗ ; stable → → ; baisse → ↘). La position d'un niveau = son index dans l'échelle triée, **pas** une valeur IDME en dur.
4. **Ne pas réutiliser** `obtenirInfosPerformance`/`idmeMoyen` (`profil-etudiant-calculs.js:723`) tel quel : il filtre `['I','D','M','E']` en dur → écrire un helper neutre piloté par l'échelle.

> Si une échelle n'a pas de descriptions SOLO : le survol affiche seulement le `nom`. Aucune dépendance dure à SOLO.

---

## 5. Microcopy E1 (« ce que cette note mesure »)

Une ligne fixe par colonne, sous le nom + badge (texte descriptif, pas de tutoiement). Départ (SPEC §3.1, à valider en terrain) :

- **SOM** : « La moyenne pondérée des performances, chacune comptée une fois, au moment où elle a eu lieu. »
- **STD** : « Le niveau de maîtrise démontré — les reprises remplacent les premiers essais. »
- **SPE** : « Les exigences satisfaites parmi celles annoncées. »
- *(DEN : à ajouter quand la famille sera créable — #318.)*

Source recommandée : table `{ famille → phrase }` dans le module, indexée par le **code famille** rendu par le registre (`obtenirCode()` → `SOM/STD/SPE`), pas par l'id de pratique.

---

## 6. Moteur (consommation seule)

- **Note de référence** et **notes simulées** : `simulerIndices(da, pratiqueId)` (`portfolio.js:714`) → champ `noteFinale` (STD) sinon `P` (SOM/SPE), 0-100. **Lecture seule absolue.**
- **Parité** : pour la pratique de référence, la note affichée DOIT = celle du panneau profil (mêmes appels — test 7.2).
- **Référence (active)** : pratique du groupe-cours actif ; en démo = `demo-std-litt`. Les **candidates** simulables : gabarits (`window.PRATIQUES_PREDEFINES`) + `pratiquesConfigurables` de la bibliothèque + familles codées (`sommative`/`standards`/`specifications`). Résolution via `obtenirPratiqueParId`.
- **Invariant** : aucune écriture (ni clés réelles, ni `demo_*`) ; pratique active inchangée ; snapshot avant/après égal (test 7.1).

---

## 7. Sélection inline des candidates

- Zone **inline** (jamais de modale — anti-pattern projet) : 1-2 sélecteurs.
- Items peuplés des gabarits + pratiques bibliothèque, **badge famille** par item, `echapperHtml()` sur les noms.
- Changer une candidate **recalcule** les colonnes (lecture seule).
- Diagnostic **par colonne** si non calculable (`_diagnostiquerNoteNonCalculable`, #128) ; les autres colonnes calculent (jamais d'échec global).

---

## 8. Profils-types (étiquetés en dur dans le module)

| Rôle | DA | Réf STD | SOM | SPE | Niveau atteint |
|---|---|---|---|---|---|
| Fort | DEMO010 | 90 | 86 | 100 | dérivé (terminale) |
| Moyen | DEMO013 | 77 | 75 | 80 | dérivé |
| En difficulté | DEMO004 | 65 | 58 | 50 | dérivé |
| Irrégulier | DEMO011 | 81 | 76 | 60 | Maîtrisé (terminale M) ↗↗ |

DA + libellé + (en C2) phrase de contexte = **en dur**, stables. Pas de détection dynamique. Terme « groupe 9999 » proscrit (vestige).

---

## 9. Accessibilité et responsive (SPEC §3.5)

`<th scope="col">` ; navigation clavier ; cibles ≥ 44 px ; **3 colonnes sur iPad** (sinon défilement horizontal du seul tableau) ; deux modes sombre/clair ; focus déplacé à l'ouverture de la vue (règle SPA). Survol SOLO également accessible au focus clavier (pas hover-only).

---

## 10. Structure du module et point d'accès

- **Nouveau fichier** `js/comparateur-pratiques.js` (module autonome, pattern de `guides-pedagogiques.js` / `planification-carte.js` : structure + API `window`). Aucune logique de calcul propre — consomme le moteur.
- **Conteneur** dans `index.html` (ex. `#comparateur-pratiques-panel` après `</main>`, comme le panneau guides), include après les modules de pratiques.
- **CSS** : famille `comparateur-*` dans `styles.css`, variables existantes seulement (badges simulation = accent + bordure pointillée du design system).
- **Point d'accès** : l'entrée de navigation pérenne est **C4** (bouton « Conception → Pratiques de notation » ; `config.js`/`navigation.js` protégés). Pour rendre **C1 testable** sans toucher aux fichiers protégés : exposer `window.ouvrirComparateurPratiques()` + un **bouton provisoire** depuis l'écran Pratiques de notation (raccordement définitif en C4).

---

## 11. Sous-lots C1 proposés (à valider avant exécution)

| Sous-lot | Contenu | Test ajouté |
|---|---|---|
| C1-a | Squelette module + conteneur + ouverture/fermeture (focus SPA) + **garde démo** (§3.4 SPEC : invitation + `activerModeDemo`) | garde démo (mode inactif → invitation ; activation → vue) |
| C1-b | Matrice : 4 profils en dur, colonne réf STD, cellules note + delta via `simulerIndices` ; **colonne « Niveau atteint »** dérivée de l'échelle + tendance | parité moteur (réf = panneau profil) ; divergence sur les 4 profils |
| C1-c | En-têtes E1 (badge famille + microcopy par famille) + ligne de garde | rendu DOM (en-têtes, garde présents) |
| C1-d | Sélection inline des candidates (gabarits + biblio) + recalcul + diagnostic par colonne | invariant non-destructif (snapshot avant/après) |

Chaque sous-lot : `node --check`, `cd tests && npm test`, validation terrain Mac + iPad / sombre + clair avant de poursuivre. Pas de bump version (le `minor` reste réservé à C5).

---

## 12. Points à revérifier au code / questions ouvertes

1. **Résolution de l'échelle d'un profil** : confirmer le helper qui donne l'échelle d'une grille/éval et l'accès à `niveaux[]` (code/nom/description). Sinon, petit accès direct depuis l'éval terminale.
2. **Production terminale d'un profil** : `_identifierProductionTerminale` cherche `type === 'terminale'` — confirmer que les 4 profils en ont une (DEMO011 oui depuis C0/D1). Repli si absent : dernière éval datée.
3. **Tendance** : valider les seuils (↗↗ / ↗ / → / ↘) en terrain sur les 4 profils.
4. **Microcopy E1** : formulations à valider par Grégoire (terrain).
5. **Point d'accès provisoire** : confirmer l'emplacement du bouton temporaire (écran Pratiques de notation) en attendant C4.
