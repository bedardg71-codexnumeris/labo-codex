# Inventaire — la nomenclature des zones de couleur (#821, temps 1 et 2)

> **Écrit le 10 septembre 2026 par Cowork**, sur le mandat de
> `plans de travail/CONSIGNE-SUIVANTE-nomenclature-des-zones.md`, repris à froid.
> Couvre les temps 1 (inventaire) et 2 (archéologie). Les temps 3 et 4 restent ouverts.
> Mesuré sur `5c29d3fd`, version 1.128.3.

---

## 1. ARCHÉOLOGIE — d'où viennent les quatre mots

**Résultat : aucune justification pédagogique. Ce sont les inverses arithmétiques
d'une échelle de risque abandonnée.**

| Date | Commit | Fait mesuré |
|---|---|---|
| automne 2025 | `eb07fe40`, `4ddb851c` | l'échelle est un **risque d'échec** (critique / élevé / modéré / faible), « selon les seuils du Guide » |
| 14 nov. 2025 | `8d46101c` | bascule vers « engagement ». Le message de commit : « Seuils inversés […] échelle positive, **inversée par rapport au risque** ». Cinq paliers : très favorable / favorable / modéré / fragile / **insuffisant**, adossés à `determinerNiveauEngagement()` et à E = ∛(A×C×P) |
| 16 avr. 2026 | `adc8f4b9` | « Chantier RLO 3.1 — Retrait des producteurs de l'indice E ». `determinerNiveauEngagement()` **supprimée**. La chose que les mots nommaient n'existe plus |
| aujourd'hui | — | les quatre libellés survivent **codés en dur** dans la légende (`tableau-bord-apercu.js:1789-1792`). « Insuffisant » a disparu en route. `grep -rn "niveauEngagement" js/` ne rend **aucun consommateur** |

⮕ **Conséquence pour l'arbitrage** : renommer ne renverse aucune décision documentée.
Il n'y a qu'un résidu, orphelin depuis cinq mois.

⮕ **« Modéré » est le seul mot jamais inversé** — un risque modéré et un engagement
modéré se disent pareil. C'est pourquoi il détonne : les trois autres qualifient une
situation, lui qualifie une intensité sur un axe supprimé.

### La décision qui existe, elle, et qui n'était pas citée

`docs/adr/007-vocabulaire-descriptif.md` — Grégoire Bédard, décision du printemps 2026,
formalisée le 14 mai. **« Le vocabulaire de Labo Codex est descriptif, non-prédictif et
non-pathologisant. »** Proscrit nommément « à risque », « risque d'échec », « critique »,
« élève faible », et **« tout vocable qui qualifie la personne plutôt qu'un état observé »**.

⚠ Statut « acté rétroactivement » : formalisé par une session à partir de la posture
publiée de Grégoire (*Pédagogie collégiale*, 2024). Il n'a pas nécessairement lu ce texte.

⚠ Confirmé par Grégoire le 10 septembre, sans que l'ADR lui soit soumis d'abord :
« dans mon esprit, ces bandes sont *un état du contexte d'apprentissage observé* ».
**Le temps 4 de la consigne est donc tranché sur l'intention** ; reste à choisir les mots.

---

## 2. LE DÉFAUT PRINCIPAL — un mot, trois définitions

C'est le constat le plus lourd de l'inventaire, et il n'était dans aucune fiche.

**« Favorable » porte trois seuils différents selon l'écran :**

| Où | Définition mesurée | Source |
|---|---|---|
| Tableau de bord › Aperçu | bande **65 – 82,5 %** de l'indice composite | `tableau-bord-apercu.js:1791` |
| Profil › contexte d'apprentissage | **A ≥ 75 % ET C ≥ 75 %** | `profil-etudiant-calculs.js:2026` |
| Profil › interprétation A-C | **A ≥ 90 % ET C ≥ 90 %** | `profil-etudiant-helpers.js:1049` |

**« Fragile » en porte trois également :**

| Où | Définition mesurée | Source |
|---|---|---|
| Tableau de bord › Aperçu | bande **30 – 47,5 %** | `tableau-bord-apercu.js:1789` |
| Profil › contexte | **A < 65 % OU C < 65 %** | `profil-etudiant-calculs.js:2050` |
| Seuils d'interprétation (réglable) | **< 70 %**, défaut | `interpretation-config.js:55` |

⮕ **Cas concret** : un étudiant à A = 80 %, C = 80 % est **« Favorable »** dans son
profil (≥ 75) et **« Acceptable »** dans l'interprétation A-C du même profil (pas ≥ 90).
Même élève, même écran, deux mots.

⮕ Et `profil-etudiant-sections-affichage.js:1553` traduit `niveau === 'Favorable'` par
la prose « **Excellent** engagement comportemental » — un quatrième mot pour la même chose.

---

## 3. LES MÉCANISMES — quatre, pas trois

La consigne en dénombrait trois. L'inventaire en trouve un quatrième.

| # | Mécanisme | Vocabulaire | Bornes | Classe-t-il ? | Réglable ? |
|---|---|---|---|---|---|
| 1 | Dégradé de l'Aperçu (`tableau-bord-apercu.js`) | Fragile · Modéré · Favorable · Très favorable | 30 / 47,5 / 65 / 82,5 | **NON — continu** | non |
| 2 | Seuils d'interprétation (`interpretation-config.js`) | Fragile · Acceptable · Bon · Excellent (+ « **Critique** » en commentaire l. 55) | 70 / 80 / 85 | oui, 4 paliers | **oui** |
| 3 | Contexte d'élève (`profil-etudiant-calculs.js:2010+`) | Très favorable · Favorable · Modéré · Fragile | A et C : 85 / 75 / 65 | oui, 4 paliers | non |
| 4 | **Interprétation A-C** (`profil-etudiant-helpers.js:1040+`) | Favorable · Acceptable · Complétion fragile · … | A et C : 90 / 80 | oui, ≥ 9 branches | non |
⚠ *Corrigé le 10 sept. au soir (lot A)* : l'entrée du mécanisme 1 n'est **pas** un « indice composite » (§ 2, § 3 ci-dessus) — chaque barre de l'Aperçu positionne **un** indice, A, C ou P (`positionSurEchelleDistribution(e.valeur)`, une barre par indice). Les bandes s'appliquent donc à chaque indice pris seul.

⚠ Le mécanisme 4 **n'était pas inventorié**. Il emploie les mêmes mots que le 3, sur le
même écran, avec des bornes différentes.

---

## 4. LE PÉRIMÈTRE RÉEL — 27 fichiers bruts, 13 dans le périmètre

`grep -rn "Fragile\|Modéré\|Très favorable\|Favorable\|Acceptable\|Excellent" js/ --include=*.js`
rend **27 fichiers**, pas dix. Le tri :

**Dans le périmètre (13)** — les quatre mécanismes et leur prose :
`tableau-bord-apercu.js` · `interpretation-config.js` · `preferences-v2.js` (le panneau de
réglage) · `profil-etudiant-calculs.js` · `profil-etudiant-helpers.js` ·
`profil-etudiant-sections-affichage.js` · `etudiants.js` (l. 260, lit les seuils) ·
`accompagnement-contenu-hover.js` · `accompagnement-contenu-popup.js` ·
`accompagnement-contenu-terme.js` · `pratiques/pratique-configurable.js` ·
`indices.js` · `changelog-data.js`

**Hors périmètre (14)** — homonymes, à ne pas toucher :
`pratiques/pratique-pan-specifications.js` (42 occ. de `seuilAcceptable`, une clé de config
PAN) · `pack-demo-20.js` (31 occ. dans des rétroactions de démo) · `echelles.js`
(« Excellent » comme niveau d'une échelle A/B/C/D/F) · `interventions.js` (prose libre
d'un placeholder) · `bilan-reflexif-rapport.js` (voir ci-dessous) · les autres, isolés.

### ⚠ Une affirmation de la consigne est fausse

La consigne garantissait « zéro occurrence dans […] `bilan*.js` ». **Faux** :
`bilan-reflexif-rapport.js` en porte **dix**, dont une dans un PDF (l. 711,
« Taux de réponses favorables : … % »).

**La conclusion tient malgré tout, mais pour une autre raison** : il s'agit du taux de
réponses favorables à un questionnaire Likert (`v >= 3`), et le PDF est le rapport
d'analyse **de l'enseignant**, pas une rétroaction d'élève. Sens différent, destinataire
enseignant. ⮕ **Hors périmètre — mais le mot est pris**, et une nomenclature candidate
qui réemploierait « favorable » ailleurs devra en tenir compte.

⮕ **La garantie « ces mots ne sortent pas vers les élèves » reste vraie** après
re-mesure, sur les 27 fichiers et non sur dix.

---

## 5. L'ANALYSE LEXICALE — trois axes pour une échelle

Contre l'intention retenue (« un état du contexte d'apprentissage observé ») :

| Mot | Ce qu'il qualifie réellement | Verdict |
|---|---|---|
| **Fragile** | la solidité d'une **personne** (« un élève fragile ») | contredit l'ADR-007 |
| **Modéré** | l'intensité de quelque chose qui n'est plus nommé | vide (résidu du risque) |
| **Favorable** | la favorabilité d'un **contexte** | sur l'axe |
| **Très favorable** | idem, gradué | sur l'axe |

⮕ **Les quatre mots ne sont pas sur le même axe.** C'est l'explication mesurée du
« je ne sais pas sur quoi ils s'appuient » : les deux mots du haut décrivent la
situation, celui du bas décrit l'élève, celui du milieu ne décrit rien.

⮕ **L'app énonce déjà le bon axe et se contredit à deux centimètres** :
`accompagnement-contenu-hover.js:446` dit « une échelle qui **décrit son contexte
d'apprentissage observé**, allant de Fragile à Très favorable ».

---

## 6. DISPOSITIONS

| Constat | Disposition |
|---|---|
| Les quatre mots sont un résidu sans justification (§1) | **inscrit** — `#821` |
| « Favorable » et « Fragile » ont trois définitions chacun (§2) | **à inscrire séparément** — c'est un défaut de cohérence, pas de nomenclature ; il survivrait à un renommage |
| Un quatrième mécanisme non inventorié (§3) | **inscrit** — à rattacher à `#821` |
| « Critique » en commentaire de `interpretation-config.js:55` | **inscrit** — mot proscrit par l'ADR-007 |
| « zéro occurrence dans `bilan*.js` » (consigne) | **périmé** — corrigé au §4, conclusion maintenue |
| « dix fichiers » (consigne) | **périmé** — 27 bruts, 13 dans le périmètre |
| `pratique-pan-specifications.js`, `pack-demo-20.js`, `echelles.js` | **refusé** — homonymes, hors périmètre |
| « indice composite » comme entrée du mécanisme 1 (§ 2, § 3) | **périmé** — corrigé au § 3 : un indice par barre |
| « Favorable » et « Fragile » ont trois définitions (§ 2) — *disposition révisée* | **traité, lot A** (10 sept., 1.128.4) : les quatre règles sont écrites en un seul endroit (`js/contexte-qualification.js`) ; les définitions, elles, n'ont PAS bougé — tableau au § 8 |
| Une 4e borne du mécanisme 2, fixe à 60 %, non inventoriée (§ 8) | **rattaché à #821** — nommée à la source (`BORNE_FIXE_INSUFFISANT`), pas déplacée |
| La branche « Insuffisant » du mécanisme 3 est inatteignable (§ 8) | **inscrit** — `#822` |
| « Assiduité critique » / « Complétion critique » : le MÊME libellé sous deux bornes (60 et 70) sur le même écran (§ 8) | **rattaché à #821** — c'est un cas du tableau, pas un item de plus |
| `obtenirCouleurIndice` (`profil-etudiant-sections-affichage.js`) colore la note finale et P avec 85 / 70 en dur, ni nommés ni réglables | **inscrit et continué** — hors des quatre mécanismes (il qualifie une note, pas un contexte) ; rattaché à #821 pour mémoire, non déplacé |

---

## 6 bis. ARBITRAGE DE GRÉGOIRE — 10 SEPTEMBRE 2026

▣ **Décision prise, dans ses mots** : « Peu importe le chiffre, cette incohérence est à
corriger. Il faut unifier les définitions. »
⮕ Le coût n'a **pas** été chiffré, à sa demande explicite. L'unification est acquise.

▣ **Ce qu'il vise, dans ses mots** : « L'application nomme un contexte et on ne sait pas
comment elle fait pour le qualifier ainsi. »
⮕ Reformulation qui déplace la cible : le défaut n'est pas seulement que les définitions
divergent, c'est qu'**aucune n'est justifiée ni visible à l'écran**.

▣ **Dépendance nommée** : le travail d'automne avec l'orthopédagogue « devrait nous
éclairer là-dessus ». ⮕ **Les BORNES et les MOTS attendent ce travail. La SOURCE unique,
non** : elle ne demande aucun arbitrage pédagogique, et elle rend le choix ultérieur
bon marché.

---

## 7. CE QUI RESTE

- **Temps 3** — confrontation au cadre (ELLAC, SOLO, RàI) : non fait.
- **Temps 4** — les nomenclatures candidates chiffrées : non fait. L'intention est
  tranchée (§1), les mots ne le sont pas.
- ⛔ **Rien n'est renommé.** Aucun fichier de `js/` n'a été touché par cet inventaire.

---

## 8. LOT B — CE QUI DIVERGE VRAIMENT, mécanisme par mécanisme

> **Écrit le 10 septembre 2026 au soir par Claude Code**, une fois les quatre règles
> côte à côte dans `js/contexte-qualification.js` (lot A, 1.128.4). **Constater, pas
> proposer** : aucune borne n'est recommandée ici — c'est de la pédagogie, et c'est ce
> tableau qui part chez l'orthopédagogue cet automne.
>
> Lecture : les pourcentages sont ceux de l'indice concerné. Le mécanisme 1 s'applique à
> **un** indice par barre (A, C ou P) et **ne classe pas** ; les mécanismes 3 et 4 lisent
> A **et** C ; le mécanisme 2 lit un pourcentage, et ses trois bornes sont **réglables**
> (valeurs par défaut ci-dessous : 70 / 80 / 85). « Étendue » = la plage de valeurs où
> deux mécanismes emploient le même mot pour des situations différentes, en points de
> pourcentage.

### 8.1 Les mots employés par plus d'un mécanisme

| Mot | Mécanisme 1 · Aperçu | Mécanisme 2 · seuils (réglables) | Mécanisme 3 · contexte (profil) | Mécanisme 4 · interprétation A-C (profil) | Étendue du désaccord |
|---|---|---|---|---|---|
| **Favorable** | bande 65 – 82,5 | — | A ≥ 75 **et** C ≥ 75 (jusqu'à ce que les deux atteignent 85) | A ≥ 90 **et** C ≥ 90 | 3 ↔ 4 : **15 points** (75 → 90). 1 ↔ 3 : 10 points (65 → 75, « Favorable » pour 1, « Modéré » pour 3) + 2,5 points (82,5 → 85, « Très favorable » pour 1, « Favorable » pour 3). 1 ↔ 4 : 25 points |
| **Très favorable** | bande ≥ 82,5 | — | A ≥ 85 **et** C ≥ 85 | — | 1 ↔ 3 : **2,5 points** |
| **Fragile** | bande 30 – 47,5 | curseur « Fragile » : < 70 (nom du palier dans le panneau et l'infobulle ; le code, lui, dit « insuffisante » ou « critique ») | A < 65 **ou** C < 65 | « Mobilisation / Assiduité / Complétion fragile » : 70 ≤ x < 80, l'autre indice ≥ 70 | 3 ↔ 4 : **aucun chevauchement** — le « fragile » du 4 commence 5 points **au-dessus** de la fin du « Fragile » du 3. 1 ↔ 3 : 17,5 points. 2 ↔ 3 : 5 points. 1 ↔ 2 : 22,5 points |
| **Modéré** | bande 47,5 – 65 | — | A ≥ 65 **et** C ≥ 65, sous 75 sur l'un | — | 1 ↔ 3 : **aucun chevauchement**, bandes adjacentes (17,5 points de large pour 1, 10 pour 3) |
| **Acceptable** | — | 70 ≤ x < 80 | — | A ≥ 80 **et** C ≥ 80, sans que les deux atteignent 90 | 2 ↔ 4 : **aucun chevauchement** — l'« Acceptable » du 4 commence là où celui du 2 finit (10 points) |
| **Critique** | — | « Assiduité critique » / « Complétion critique » : **< 60**, borne **fixe**, non réglable | — | « Assiduité critique » / « Complétion critique » : **< 70** | 2 ↔ 4 : **10 points, pour la MÊME chaîne de caractères**, affichée sur le même écran (carte de l'indice et carte Mobilisation du profil) |
| **Insuffisant** | — | 60 ≤ x < 70 (borne fixe) | branche « Insuffisant » **inatteignable** (le palier précédent est un OU qui attrape tout) | — | sans objet : un seul mécanisme l'affiche |
| **Excellent / exemplaire** | — | ≥ 85 (« Taux de complétion excellent », « Assiduité exemplaire ») | — | la prose de « Favorable » dit « **Excellent** engagement comportemental » : ≥ 90 sur les deux | 2 ↔ 4 : 5 points |
| **Bon** | — | 80 ≤ x < 85 | — | — | un seul mécanisme |

### 8.2 Ce que le tableau montre, sans le trancher

- **Deux paires ne se recoupent jamais** : « Fragile » (3 ↔ 4) et « Acceptable » (2 ↔ 4).
  Ce ne sont pas des bornes qui divergent de quelques points, ce sont des mots posés sur
  des plages disjointes.
- **Un même libellé, deux bornes** : « Assiduité critique » à < 60 (carte de l'indice A)
  et à < 70 (carte Mobilisation), dans le même profil.
- **Une borne que personne ne règle** : le 60 % du mécanisme 2 est en dur depuis le
  23 octobre 2025 ; les trois curseurs du panneau ne l'atteignent pas.
- **Un palier qui n'existe que dans le code** : « Insuffisant » du mécanisme 3.
- **Le mécanisme 1 n'est comparable qu'en apparence** : ses bandes situent des teintes
  sur un dégradé, elles ne classent personne. Le mettre dans le tableau montre que ses
  mots coïncident avec ceux du mécanisme 3 sans jamais coïncider avec ses chiffres.

### 8.3 Ce que le lot A a livré, et ce qu'il n'a pas touché

- **Livré** : `js/contexte-qualification.js` — les quatre règles, leurs bornes nommées
  avec provenance et date, déplacées telles quelles depuis `tableau-bord-apercu.js`
  (lecture de la géométrie, pas copie), `profil-etudiant-helpers.js`,
  `profil-etudiant-calculs.js`, `etudiants.js` ; la carte Mobilisation du profil lit
  `BORNES_MOBILISATION` au lieu de comparer A et C à des littéraux, et écrit les mêmes
  chiffres qu'avant, calculés. Sentinelle `sentinelle-821a-quatre-regles-un-seul-endroit`
  (24 essais, 8 break-tests rouges). Harnais AVANT/APRÈS sur `5c29d3fd` : **1630 cas,
  0 différence**, rendu HTML de la carte Mobilisation compris.
- **Pas touché** : aucun mot, aucune borne, aucune donnée. La divergence A = 80 %,
  C = 80 % (« Favorable » / « Acceptable ») est **verrouillée telle quelle** par la
  sentinelle : la faire disparaître la fait rougir.
- **Supposé, et à corriger si faux** : la géométrie du dégradé (mécanisme 1) reste dans
  `tableau-bord-apercu.js`, parce que la sentinelle du lot B de l'audit de l'Aide la
  verrouille là par le texte et que la consigne interdisait de la réécrire ; le module
  la LIT. Les quatre mots de la légende sont donc écrits deux fois (module et rendu), et
  une sentinelle vérifie qu'ils restent identiques dans le même ordre.
