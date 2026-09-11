# Consigne du jour — Liste des étudiant·es : les abandons visibles (grisés), les tris qui trient, la recherche sans accents, un DA en double refusé (lot 2 du cadrage 11)

> **Écrite le 11 septembre 2026 à 14 h 51 (Toronto, `TZ=America/Toronto date`) par Cowork**, sur la décision de Grégoire de 14 h 17,
> dans ses mots : **« les abandons visibles (grisés) »**. Application au moment de l'écriture : **`1.131.0`**, build `0911-1259`,
> `main` = `origin/main` = `2a89aaaf`. Elle remplace la consigne du lot 1 (livrée en `1.131.0`, porte relevée 10/10 sur ses deux
> groupes réels), archivée à côté sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-11-lot-1-suivi-du-groupe.md`.
>
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`, `TZ=America/Toronto date`.
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** L'audit date du 6 sur `1.123.5` ; les numéros de ligne ci-dessous sont
> remesurés aujourd'hui sur `1.131.0` (`etudiants.js` n'a reçu que deux commits depuis, aucun sur ces constats). Un constat périmé se
> dit périmé, pas corrigé.
>
> **Préalables** : le cadrage 11 (§ 7, les sept lots) ; `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md` **§ 2 seulement**
> (l. 106-164 : L-1 à L-11, le tableau des gestes) ; `BACKLOG.md`, `#750` (grep ciblé — cité, pas rejugé). Skills : `labo-codex`,
> `design-interface` (microcopy, états grisés), `verification-adverse` § 4, `portes-terrain`.

---

## AVANT TOUT — un commit documentaire séparé

Modifiés, non commis, de Cowork : la porte du lot 1 (relevée 10/10, note de 14 h 15), l'entrée 10 de `00-CADRAGES-OUVERTS.md`,
l'archivage de la consigne du lot 1, la présente. **Commets-les d'abord, seuls, `git add` ciblé.** Le `D` sur la capture du 9 et les
quatre `Formation/*.html` restent hors de tes commits.

---

## 0 · CE QUE CE LOT CHANGE POUR GRÉGOIRE ET SES COLLÈGUES

**La Liste dit vrai sur les abandons.** Aujourd'hui, la note sous le tableau (`index.html:7835`) affirme que les élèves « abandon »,
« inactif » et « décrochage » sont *« toujours affichés dans le tableau pour consultation, mais exclus des statistiques »* — et le
filtre les retire (`etudiants.js:647` : `statut === 'actif' || !statut`). Un enseignant cherche un décrocheur, ne le trouve pas, et le
texte lui dit qu'il devrait y être. **Décision de Grégoire (14 h 17) : les abandons sont visibles, grisés.** La note devient vraie ;
les statistiques restent sur les actifs (déjà le cas : `:910` et la population de `#moy-*`).

Le reste du lot : deux tris qui ne triaient pas, une recherche qui ne trouvait pas « Aimé » avec « aime », une option de filtre morte,
une case « ≥ Min. » qui perdait son effet, un DA en double accepté à l'ajout et à l'import, un bouton d'aide détruit au premier rendu,
et trois calculs par lettre tapée. Rien n'écrit dans les données de personne.

---

## 1 · LE LOT — `js/etudiants.js`, `js/trimestre-v2-etudiants.js`, `index.html` (la sous-section `#suivi-liste`)

### A. Les abandons visibles, grisés (L-2) — la décision
- `filtrerEtudiants` (`:647`) ne retire plus les statuts non actifs. La ligne d'un élève « abandon », « inactif » ou « décrochage »
  se rend **grisée** (classe d'état existante du design-system — mesure : `grep -n "ligne-inactive\|u-grise\|estEtudiantExclu" styles.css
  js/etudiants.js` ; s'il n'y a pas de patron, un seul, dans `styles.css`, deux modes) et porte **son statut en clair**, le mot que
  Cadre › Trimestre affiche déjà (« Abandon » / « Inactif » / « Décrochage » — **pas de mot neuf** : réutilise ceux du sélecteur de
  statut, `index.html:13869`, et sa fonction de libellé si elle existe).
- **Les statistiques ne bougent pas** : `#moy-*`, `r↔P`, `≥ Min.` restent calculés sur les actifs (`:910`, `:955-961` — mesure qu'ils
  passent bien par `estEtudiantExclu` ou l'équivalent, et non par la liste filtrée que tu viens d'élargir — **c'est le piège de ce
  lot** : élargir l'affichage sans élargir la population statistique).
- Le filtre RàI / pattern / groupe s'applique aux grisés comme aux autres ; la recherche aussi. Le clic sur la ligne ouvre le profil,
  comme avant. La note de `:7835` reste telle quelle — elle devient vraie.
- **Sentinelle** : un groupe de banc avec un « abandon » → il est dans les lignes rendues, grisé, avec son statut ; **et** `#moy-a`
  n'a pas changé par rapport au même groupe sans lui. Retire le grisé → rouge ; compte-le dans la moyenne → rouge.

### B. Les tris qui trient (L-1)
`num` est comparé (`:1038-1040`) avant d'être posé (`:1110`, `num: index + 1` après le tri) : le tri « # » ne fait rien. Poser le
numéro **avant** de trier, ou trier « # » sur l'ordre d'origine — décide, dis-le. `da` : `localeCompare` sans `{ numeric: true }`
(`:1097`) met `1000123` avant `999999` — ajoute l'option pour les colonnes numériques-en-chaîne (DA, groupe). Le garde `#446` (`:1091`,
valeurs `undefined`) **reste** : c'est lui qui empêche un champ vide de casser l'écran entier.

### C. La recherche sans accents (L-3)
`:699-702` : `toLowerCase()` seul. Normaliser des deux côtés comme le filtre pattern le fait déjà (`:688-689`, `normalize('NFD')` +
retrait des diacritiques) : « aime » trouve Aimé, « cesaire » trouve Césaire, « comaneci » trouve Comăneci (le cas démo de la sonde 1).
Une fonction, utilisée par les deux — pas deux copies.

### D. Une lettre tapée ne recalcule pas le groupe trois fois (L-4)
Deux choses : (1) `:757-758` appelle `calculerEtStockerIndicesCP` alors que `calculerEtSauvegarderIndicesAssiduite` (`:754-755`) le
chaîne déjà (`indices.js:281` — **prouve la chaîne** comme au lot 1, F) : retire l'appel ; (2) la recherche est câblée
`data-on-input` sans debounce (`index.html:7801`) : un rendu par frappe. Un debounce de 200 ms **sur la source « input » seulement**
(les `change` des sélecteurs restent immédiats) — dans `afficherListeEtudiantsConsultation` ou dans le dispatcher, tranche selon le
patron existant (`grep -n "debounce" js/main.js js/etudiants.js`). Mesure avant/après : écritures de `<trim>_indicesCP` pour trois
frappes — 6 avant, 1 après.

### E. Le filtre « pattern » offre ce que le code produit (L-5)
`index.html:7795` offre « En progression », que `profil-etudiant-calculs.js` ne produit jamais (0 occurrence) ; « Non-participation » et
« Données insuffisantes » sont affichables et **non filtrables**. Aligne les options sur les six patterns du code (`Stable`, `Défi
spécifique`, `Difficulté émergente`, `Difficulté persistante`, `Non-participation`, `Données insuffisantes`) — les libellés existent
déjà, ce sont ceux des badges. Sentinelle : chaque `value` du sélecteur est un pattern que le calcul produit, et réciproquement.

### F. « ≥ Min. » tient au re-rendu (L-6)
`toggleFiltreMinimum` (`:601`) grise et remplace `#moy-c` / `#moy-p` ; le rendu suivant (tri, lettre) reconstruit le `tbody` sans la
rappeler : la case reste cochée, l'effet est parti. Rappeler l'effet en fin de rendu si la case est cochée. **Et une décision de Cowork,
nommée** : un élève à **0 évaluation** est aujourd'hui « pas insuffisant » (`:910`, `nbEvals > 0 && nbEvals < min`) ; le sens de la
case est « au moins N évaluations pour qu'un P soit fiable » (la note de `:7835` le dit) — **0 est sous N** : il est grisé comme les
autres. Ce n'est pas de la didactique, c'est la définition écrite à l'écran ; si Grégoire la lit autrement, dix secondes.

### G. Un DA en double refusé, à l'ajout et à l'import (L-8) ; le groupe padé (L-9) — `trimestre-v2-etudiants.js`
- **Ajout** (`soumettreEtudiantV2`, `:324-344`) : si un élève du groupe-cours porte déjà ce DA et qu'on n'est pas en édition de ce
  même élève (`:372`), refuser avec **le texte validé par Grégoire** (§ 3). **Import** (`confirmerImportV2`, autour de `:712`,
  `:778-783` au 6) : un DA déjà présent dans le groupe n'est pas dupliqué — il est **ignoré et compté** (« N ajoutés, M déjà présents »),
  jamais écrasé (le stock de l'élève existant ne bouge pas). Sentinelle : deux ajouts du même DA → une fiche ; réimporter le même
  fichier → aucune fiche en plus.
- **Groupe** : `groupe: '1'` est écrit tel quel (`:344`, `:712` : `colonnes[1] || '00001'`) alors que `obtenirEtudiantsCoursActif`
  compare padé (`modes.js:1184`). **Source** : padder à l'écriture (`'00001'`), une seule fonction de normalisation, partagée. **Stock**
  : les fiches déjà écrites avec `'1'` restent — la Liste **normalise à la lecture** pour ses options de filtre et ses comparaisons
  (`etudiants.js:150`, `:685`), donc « 1 » et « 00001 » ne font plus deux entrées. Rien n'est réécrit chez personne ; dis-le dans le code.

### H. Le bouton d'aide survit au premier rendu (L-11)
`mettreAJourTitreListeEtudiants` (`:477-524`) réécrit l'`innerHTML` de `#titre-liste-etudiants` et détruit le bouton `data-aide="suivi-liste"`
(`index.html:7740`). Sortir le bouton du nœud réécrit, ou le re-générer — tranche selon le patron des autres titres.

### I. Commenter et oublier
L'état vide qui sort avant de mettre à jour `#moy-*` (`:854`) : un commentaire daté, rien d'autre (audit : commenter). Les préférences
de colonnes en `sessionStorage` (`:1276`) : position, pas défaut.

---

## 2 · CE QUI NE SE FAIT PAS ICI
- Les **20 cibles tactiles** sous 44 px de cette sous-section : lot 7. Le tableau qui déborde à 1024 px **et le dit** : fonctionne.
- Les deux « moyenne A » (`#750`) : cité, pas rejugé. `#735` (élève arrivé en semaine 6) : règle, après le 14.
- Rien n'écrit dans les données de personne ; le stock des groupes non padés reste, normalisé à la lecture.

---

## 3 · CE QUI REMONTE À GRÉGOIRE — un texte que ses collègues liront (proposé dans la conversation)

| Où | Proposition | Sa réponse |
|---|---|---|
| G — le refus d'un DA en double, à l'ajout | « Ce DA est déjà dans le groupe : [nom de l'élève existant]. » | _______ |
| G — le compte à l'import | « N étudiant·es ajouté·es, M déjà présent·es (ignoré·es). » | _______ |

Les statuts grisés reprennent les mots de Cadre › Trimestre ; les options du filtre reprennent les noms des patterns : **pas de mot
neuf ailleurs.** ⛔ Pas de release avant sa réponse (ou son silence sur les propositions, qui vaut « tel quel » — sa règle du 11).

---

## 4 · LIVRER — `minor` (`1.132.0`) : les abandons visibles sont un comportement que les collègues verront
Changelog, une phrase à valider : « Dans Suivi › Liste des étudiant·es, les élèves en abandon ou inactifs restent visibles, grisés,
avec leur statut ; les tris par numéro et par DA trient ; la recherche ignore les accents. » Rituel habituel : `release.mjs`, Vitest
depuis `tests/`, relecture croisée sur le diff, verdict, `pousser.sh`.

---

## 5 · LA PORTE TERRAIN — ses données réelles, en lecture ; l'abandon attend un cas réel s'il n'en a pas
Tu écris le markdown (`plans de travail/PORTES-TERRAIN-2026-09-11-liste-des-etudiants.md`) ; Cowork publie l'artefact. Rangées sur
`app.codexnumeris.org`, `1.132.0` en bas de page :

| # | Geste | Attendu |
|---|---|---|
| 1 | `Suivi › Liste des étudiant·es`, clique l'en-tête « # » deux fois, puis « DA » deux fois | l'ordre change à chaque clic ; les DA en ordre numérique |
| 2 | Recherche : tape un prénom accentué **sans l'accent** (un élève réel de son groupe) | la ligne est trouvée |
| 3 | Filtre « pattern » : ouvre la liste | « En progression » n'y est plus ; « Non-participation » et « Données insuffisantes » y sont |
| 4 | Coche « ≥ Min. », puis clique un en-tête de tri | les lignes sous le minimum restent grisées après le tri |
| 5 | `Cadre › Trimestre`, ajoute un élève avec **le DA d'un élève existant** (puis annule) | refusé, le message du § 3 ; aucune fiche en plus |
| 6 | Titre de la Liste : le bouton d'aide « i » est là après un changement de filtre | présent, cliquable |
| 7 | **S'il a un élève en abandon dans un de ses groupes** (sinon : attend un cas réel — ne pas en créer) | la ligne est là, grisée, avec le statut ; `moy=` inchangée |

⚠ **Pas de données fictives** (sa règle du 6) : la rangée 7 ne se fait que sur un cas réel, ou en démo si le pack en porte un
(mesure : `grep -c "abandon" js/pack-demo-20.js`) — dis-le dans la porte.

---

## 6 · TROUVAILLES ET RAPPORT
Trois issues de `CLAUDE.md`, nommées. Rapport : tête d'`OU-EN-EST-ON.md` (ce qu'il verra, « vérifié comment », « pas vérifié »), le
rapport du 6 (§ 2 : lot 2 livré), `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` (état mesuré), l'entrée 10 des cadrages ouverts (lot 2
livré, lot 3 suivant : la Saisie des présences), la présente consigne commise avec le lot.
