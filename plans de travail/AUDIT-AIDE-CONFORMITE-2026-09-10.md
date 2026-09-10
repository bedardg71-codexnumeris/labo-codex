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

## Lot A — le balayage mécanique (10 sept. 2026)

**Méthode** : extraire de l'Aide toute affirmation qu'une machine peut trancher
(chemins de navigation, libellés de boutons, noms de fonctionnalités), puis la
confronter au code. 83 chemins et 72 libellés cités ont été relevés.

| # | L'Aide disait | Le code dit | Occ. | Disposition |
|---|---|---|---|---|
| A.1 | « Réglages → Captures de progression » | c'est un `<h4>` DANS Réglages › Données (`index.html:9708`, dans `#reglages-donnees` ouvert l. 9530) | 2 | **corrigé** |
| A.2 | « Évaluations → … » | l'onglet s'appelle **« Évaluation »** au singulier (`nav-label`, l. 4105), comme ses cinq voisins | 8 | **corrigé** |
| A.3 | « Primo : assistant conversationnel » | **retiré le 21 avril 2026** (`cfee0157`, « retrait primo-* ~5700 l. ») | 19 | **corrigé** (texte approuvé par Grégoire) |
| A.4 | bouton « Reconstruire les snapshots historiques » | le bouton EXISTE, il s'appelle **« Recalculer les captures »** (`data-action="lancerReconstructionRetroactive"`, l. 9742) | 1 | **corrigé** |
| A.5 | bouton « Générer le calendrier complet » | **« Régénérer »** | 1 | **corrigé** |
| A.6 | bouton « Exporter mes données » | **« Exporter le Codex »** (`data-action="ouvrirModalExport"`) | 1 | **corrigé** |
| A.7 | case « Activer RàI et détection des patterns » | **« Appliquer une adaptation du modèle de la Réponse à l'intervention »** (`#v2-pref-rai`, l. 9063, dans `#labo-accompagnement`) | 2 | **corrigé** |

**Sentinelle** : `tests/unit/sentinelle-817-aide-chemins-et-libelles.test.js` (9 essais).
**Huit ablations, huit rouges**, arbre restauré par sha256. Vitest 523 / 5741.

⚠ **Une erreur de méthode, et sa leçon.** A.4 a d'abord été rapporté à Grégoire
comme « ce bouton n'existe pas », sur la foi d'un `grep data-action="reconstruire`
qui cherchait le mauvais nom d'action. Le bouton existait (`lancerReconstruction‑
Retroactive`). La décision qu'il a prise sur cette base (retirer la procédure)
aurait supprimé une procédure juste. ⮕ **Une absence de `grep` n'est pas une
preuve d'absence** : chercher par le nom de la FONCTION appelée, pas par le mot
qu'on suppose dans l'attribut.

### A.3 — Primo, cinq mois de fantôme

`primo-tooltips.js` (~5 700 lignes) retiré le **21 avril 2026**. Depuis, l'Aide
décrit un assistant conversationnel qui n'existe plus : **19 mentions**, dont une
carte de **78 lignes** (`accordeon-aide-primo`, l. 10703-10780) détaillant « les
4 modules de Primo » et leurs durées, une entrée de glossaire (l. 14185), et des
recommandations de parcours (« Débute avec Primo pour créer ton premier cours »).

Rien ne subsiste : `guidage-demo.js` ne fait que des encarts statiques en mode
démo, `wizard-pratique-v2.js` est l'assistant de *pratique de notation*. Les seules
traces vivantes de « primo » sont des noms de classes CSS de l'aide contextuelle.

**Remplacement écrit** (approuvé par Grégoire le 10 sept.) : la carte
`accordeon-aide-primo` (78 lignes) devient `accordeon-aide-prise-en-main`, qui
décrit les trois outils réels aux libellés exacts de l'interface : « Données démo »
et « Assistance » (`js/accueil.js:231,242`), et la visite guidée
(`data-param="tour-guide"`). Six mentions périphériques réécrites, l'entrée de
glossaire « Primo » retirée, et l'entrée « Assistance » ne renvoie plus à un
« bouton Primo ». La sentinelle vérifie que les deux libellés d'accueil sont
LUS dans `accueil.js` plutôt que recopiés.

⮕ **Motif à chasser au lot D** : le module 3 de cette carte portait « En
développement » — l'Aide annonçait un chantier inabouti, puis a continué de
l'annoncer cinq mois après la disparition du module entier. Chercher les autres
« en développement », « à venir », « prochainement ».

### Lot A (suite) — les valeurs chiffrées et les formats

| # | L'Aide disait | Le code dit | Disposition |
|---|---|---|---|
| A.8 | pack démo : « 11 productions (1 portfolio + **10 artefacts**) » | 11 productions : 1 portfolio, **9 artefacts**, 1 évaluation terminale | **corrigé** |
| A.9 | pack démo : « **42 dates**, août à décembre » | **32 dates**, du 25 août au 10 décembre | **corrigé** |
| A.10 | « Seuil de défi : **75 %** par défaut » | `defiSpecifique: 0.70` (`interpretation-config.js:48`) | **corrigé** |
| A.11 | « forces ≥70 % / défis <70 % » | **trois** seuils : 0,70 · 0,7125 · 0,75 | **inscrit — #817** |
| A.12 | « Formats acceptés : PDF, JPEG, PNG, WebP » + « HEIC : à convertir » | conforme : `validerMagicBytes` accepte les quatre, et `decodagePossible()` rend `false` sur le protocole `file:`, ce que l'Aide dit exactement | **refusé** (faux positif ; passage soigné en #597) |
| A.13 | AVIF accepté par `validerMagicBytes`, annoncé nulle part | marginal pour le corpus visé | **refusé** (motif : aucun symptôme, aucun usage attendu) |

**Ce qui est vérifié, et pas seulement corrigé** : le décompte du pack de démo est
**calculé** par la sentinelle en parsant `pack-demo-20.js` (productions, grilles,
échelles, dates de présences, DA uniques), et le seuil de défi est **lu** dans
`interpretation-config.js`. Ajouter un artefact au pack ou changer la constante
rougit le banc.

⚠ **Un test tautologique attrapé par son break-test.** La première version vérifiait
`toContain('9 artefacts')` : elle passait même avec un décompte faux, parce que
« 9 artefacts » apparaît aussi dans l'exemple de l'indice C (« Étudiant avec 9
artefacts »). L'assertion est désormais ancrée sur la phrase entière du décompte.
⮕ **Un nombre seul n'est pas une ancre** dans un fichier de 15 000 lignes.

---

## Lots à venir

- ~~**Lot A — balayage mécanique**~~ : **fait le 10 sept.**, valeurs chiffrées et formats compris.
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
