# Audit de conformité — l'Aide contre le code

**Ouvert le 10 septembre 2026.** Mandat de Grégoire : « vérifier si l'Aide qui décrit
l'application est bien conforme au fonctionnement tel qu'il est dans le code », après un
été de retrait du code dur porté sur sa pratique.

⚠ **Cet audit n'est pas terminé quand il est déposé.** Chaque constat porte, ICI, l'une
de trois dispositions : **inscrit** (n°), **refusé** (motif), **périmé**. Sur 51 rapports
d'audit du dépôt, 22 sont restés sans suite : c'est ce que cette règle empêche.

---

## Périmètre arrêté avec Grégoire

**Trois natures d'écart** : aide périmée (factuel), encastrement résiduel (sa pratique
présentée comme la règle), trous de couverture (le code ouvre, l'Aide se tait).

**Trois surfaces** : la section Aide d'`index.html` (73 accordéons), l'aide contextuelle
(62 popups, ~281 infobulles, 48 termes), et la visite guidée. `docs/utilisateur/` est
**hors périmètre** (décision du 10 sept.).

**Livrable** : rapport, plus correction d'office de ce qui est faux et mesurable. Ce qui
touche au sens pédagogique remonte à Grégoire.

## Méthode

Le patron vient de **#421** (livré le 9 août, « conformité du manuel de l'Alignement avec
l'interface réelle ») : plusieurs surfaces, et une **sentinelle avec break-tests** plutôt
qu'un rapport seul. Sans sentinelle, l'Aide se re-périme au prochain assouplissement.

**Deux assertions calculées, jamais recopiées** : quand l'Aide cite une liste ou une
valeur, le banc la recalcule des deux côtés. C'est ainsi qu'a été trouvé #816.

---

## Lot 1 — #803, la définition des PAN (10 sept. 2026)

**État à l'ouverture** : la fiche visait deux entrées du glossaire, **déjà corrigées** par
`ad34f739` (1.126.1). L'affirmation avait survécu ailleurs.

| # | Constat | Preuve | Disposition |
|---|---|---|---|
| 1.1 | Le glossaire (entrées « PAN » et « Performance ») définissait PAN par « les N meilleurs artefacts » | `ad34f739` | **périmé** — corrigé en 1.126.1 |
| 1.2 | L'entrée « Artefact » du **même glossaire** portait encore la même réduction | `index.html:14072` | **corrigé** (ce lot) |
| 1.3 | L'astuce du guide de profil attribuait l'étoile ★ aux artefacts retenus | `index.html:13401` | **corrigé** (ce lot) |
| 1.4 | La liste des colonnes annonçait « Retenu PAN : ★ » | `index.html:13397` | **corrigé** (ce lot) |
| 1.5 | Les actions du tableau renvoyaient à « (★) » | `index.html:13408` | **corrigé** (ce lot) |
| 1.6 | Les modes de sélection de l'écran ne sont pas ceux du moteur | `portfolio.js:60,143` vs `pratiques-gestion.js:1584` | **inscrit — #816** |

**Ce que le lot enseigne, et qui vaut pour la suite** : #803 a été corrigé sur les deux
lignes que la fiche citait, et l'erreur est restée à **quatre** autres endroits, dont un
trois entrées plus haut dans le même glossaire. **Corriger par ligne citée ne suffit
pas** ; c'est pourquoi la sentinelle balaie toute la section par motif.

**Sentinelle** : `tests/unit/sentinelle-803-aide-pan-famille-pas-mecanique.test.js`
(4 essais). **Quatre ablations, quatre rouges**, arbre restauré par sha256.

⛔ **Ce que la sentinelle ne fige PAS, volontairement** : la correspondance écran ↔ moteur
des modalités. Elles divergent réellement (#816) ; la figer graverait le défaut.

### Constats reportés à l'audit large

| # | Constat | Preuve | Disposition |
|---|---|---|---|
| 1.7 | L'Aide décrit un **tableau à colonnes** (« Production / Statut / Score / Niveau IDME ») là où le profil rend des **badges** (`badge-artefact`) | `profil-etudiant-sections-affichage.js:728-745` | **à vérifier à l'écran** — lot 2 |
| 1.8 | Deux caractères d'étoile coexistent pour le même sens : ★ (U+2605) et ⭐ (U+2B50), selon l'écran | `profil-etudiant-sections-affichage.js:740-741` vs `:3773-3774` | **à trancher** — incohérence d'interface, pas de doc |
| 1.9 | La classe `ml-20-mb-10` est employée 39 fois dans `index.html` et définie **nulle part** | `grep styles.css` = 0 | **inscrit dans la famille connue** — même nature que `mt-10`/`mt-5`/`alerte-info` signalés par `252bd29e` ; distincte de #813 (qui porte sur les `var()`, pas les classes) |

---

## Lots à venir

- **Lot A — balayage mécanique** : noms de fonctionnalités, chemins de navigation, libellés
  de boutons, valeurs chiffrées, formats de fichiers annoncés, confrontés au code.
  ⮕ Déjà une prise au pilote du 10 sept. : l'Aide annonce « **Primo** : assistant
  conversationnel pour la configuration guidée », or `primo-tooltips.js` a été fusionné
  dans `accompagnement.js` et « Primo » ne survit que comme préfixe de classes CSS.
  **Non corrigé, non inscrit** — appartient au lot A.
- **Lot B — cohérence des trois surfaces** : section Aide ↔ popups ↔ infobulles.
- **Lot C — visite guidée** : ses étapes pointent-elles vers des éléments qui existent ?
- **Lot D — trous de couverture** : les 1 554 commits de l'été contre l'Aide.
- **Lot E — encastrement résiduel** : 601-101, Cégep Gérald-Godin, Bédard, SRPNF, IDME,
  ELLAC, français, littérature. Le pilote suggère que la plupart sont déjà cadrés comme
  exemples ; à confirmer entrée par entrée.

## Garde-fous à ne pas « corriger » par mégarde

- `index.html:10268` — l'en-tête du tableau SOLO de Biggs et Collis : **écart volontaire
  assumé** (#810, 1.127.3). « Palier SOLO du niveau » y serait faux.
- ⛔ Ne pas écrire que le code sera rouvert (consigne reconduite, 1.127.2).
- Les notes d'A2025 et d'H2026 ne sont pas rouvertes.
