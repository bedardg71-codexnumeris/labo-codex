# Inventaire — ce qu'un badge peut porter (le texte troué, étape 4 : les badges qu'on invente)

> **Écrit le 5 septembre 2026 à 11 h 27 (Toronto, heure lue), par Cowork, en lecture seule, sur `78aacd49` (1.119.0 en ligne).**
> À la demande de Grégoire : « d'abord un inventaire des possibilités en fonction de ce qui a été établi ». **Tout ce qui
> suit est mesuré dans le code** (ligne citée) ; rien n'est une idée. Les options viennent APRÈS le tableau, pas avant.
> Source du chantier : `CADRAGE-2026-09-02-badges-texte-troue.md` (arrêté 2 : « palette fixe d'abord, badges personnalisés
> dans une version ultérieure » — c'est cet arrêté que l'étape 4 rouvre, par décision de Grégoire).

## ▣ Disposition — 11 h 35

**Refusé (abandon)**, décision de Grégoire après lecture : pas de badge inventé pour les critères algorithmiques ; le
prochain accent ira à la **synthèse des rétroactions dans le PDF**, plus tard, et aux remarques des utilisateurs à l'usage.
L'inventaire reste : il dit ce qu'un badge POURRAIT porter si un utilisateur le demande.

## 1 · Le principe qui borne tout

Un badge est un **trou** dans une phrase que l'enseignant·e écrit ; il se remplit **au moment de la correction** (badge vert)
ou **est écrit dans la grille** (badge bleu). Un badge ne peut donc porter que **ce que l'application sait d'une copie quand
elle la corrige**, ou **ce que la grille fixe d'avance**. « Inventer un badge », c'est l'une de ces trois choses :
(a) donner un badge à une donnée qui existe déjà mais n'en a pas ; (b) laisser l'enseignant·e nommer une **constante de grille**
(comme `service`) ; (c) créer une **donnée neuve** saisie à chaque copie. Seule (c) touche aux données des évaluations.

## 2 · Ce que l'application sait d'une copie au moment de la correction — mesuré

| Donnée | Où elle naît | Badge aujourd'hui ? | Où il vaudrait |
|---|---|---|---|
| nom du critère | la grille (`critere.nom`) | **`critere`** (bleu, énoncés) | énoncés ; absent des paliers |
| nombre d'erreurs (total) | Annoter → codes posés, ou saisie « erreurs » en mode simple (`_parserCodesAlgoCategories`, `evaluation-calcul.js:542` ; `eval_erreurs_`) | **`erreurs`** (vert) | partout |
| nombre de mots | saisie « mots » (`eval_mots_`) | **`mots`** (vert) | partout |
| points pondérés | `sommePonderee` (`:512`) | **`points`** (vert, décompte seulement) | décompte |
| mots par erreur (moyenne) | `motsParErreur` (projection) | **`moyenne`** (vert, paliers) | paliers |
| projection à la longueur de référence | `_valeursJetons` (`evaluation-projection.js:208`) | **`projection`** (vert, paliers) | paliers |
| palier atteint (libellé) | `x.palier` (`:223`) | **`palier`** (vert, paliers) | paliers |
| service, seuil, longueur | la grille (`paramsProjection`) | **`service` `seuil` `longueur`** (bleus, paliers) | paliers |
| **erreurs par sous-critère** (ex. 12 en orthographe, 3 en ponctuation) | `codesSousCriteres` (`:542`), compte par code | **aucun** | énoncés et paliers |
| **sous-critère dominant** (nom) | `_trouverCodeDominant` → `scDominant.nom` (`:574-592`) | **aucun** — sa rétroaction est rendue à part, pas dans la phrase | énoncés et paliers |
| note du critère, pourcentage | `noteCalculee`, `pctFinal` (`:560`) | **aucun** | énoncés et paliers |
| niveau atteint sur l'échelle (IDME) | `_determinerNiveauIDMEAlgo(pctFinal)` (`:458`) | **aucun** | énoncés et paliers |
| nom de la production, date, statut de remise, intégrité | l'évaluation (`evaluation-sauvegarde.js:226-232`) | **aucun** | partout — mais hors du critère |
| note finale, niveau final | `noteFinale`, `niveauFinal` (`:229`, `:231`) | **aucun** | le bilan, pas la phrase du critère |
| tampons posés (texte rouge) | Annoter (`travaux-annotation.js:1034`) | **aucun**, et **restitués, jamais interprétés** (décision du 3 sept.) | — |
| rétroaction libre du critère, rétroaction finale | saisies par l'enseignant·e (`criteres[].retroaction`, `retroactionFinale`) | ce n'est pas un badge : **c'est déjà le texte libre** | — |

Deux constats sortent du tableau. **(1)** Ce que l'application sait et ne donne pas encore à trouer est court, et une ligne
domine : **les erreurs par sous-critère** — c'est la donnée que les codes par grille (livrés le 3) fabriquent copie par copie,
et rien ne permet encore de l'écrire à l'élève dans une phrase (« Tu as fait 12 erreurs d'orthographe »). **(2)** Il n'existe
aucune donnée « libre par copie » hormis les deux zones de rétroaction : une donnée neuve saisie à chaque copie (option c)
serait une troisième zone libre sous un autre nom.

## 3 · Les trois familles, avec leur coût — à trancher par Grégoire

**(a) Donner un badge à ce qui existe** — aucune donnée neuve, aucun format qui change ; la palette s'allonge.
- `sous-critère` : un badge **par sous-critère de la grille**, engendré depuis `critere.sousCriteres[]` (`{n:Orthographe}` →
  « 12 ») ; c'est le seul badge « inventé » qui vient de la grille de l'enseignant·e sans qu'il l'invente. Vaut dans les
  énoncés et les paliers. **Le plus proche de la didactique des codes par grille.**
- `dominant` (le nom du sous-critère le plus fréquent), `niveau` (IDME du critère), `note` : à peser un à un — `note` dans une
  phrase de rétroaction est une décision pédagogique (une note nommée dans la phrase, ou pas), pas technique.
- ⛔ Pas : tampons (restitués, pas interprétés), note finale (c'est le bilan), nom de l'élève (jamais dans une phrase engendrée).

**(b) Des constantes de grille nommées par l'enseignant·e** — comme `service` : un nom et une valeur écrits dans la grille
(`{manuel}`, `{ressource}`, `{date-de-l-EUF}`), remplis pareil sur toute copie. Donnée neuve **dans la grille** (une liste
`{nom, valeur}` sur le critère ou la grille) → **format qui voyage** (partage, import) : relecture croisée obligatoire ;
un badge inconnu à l'import reste du texte (déjà le comportement). Utile si Grégoire a des mots qui reviennent dans plusieurs
paliers et changent d'un trimestre à l'autre ; sinon, c'est du texte.

**(c) Une valeur saisie à chaque copie** — un champ neuf dans Évaluer par badge inventé. Donnée neuve **dans chaque
évaluation** ; c'est le seul cas cher, et il double ce que les deux zones de rétroaction libre font déjà. **Déconseillé**
sauf besoin nommé que (a) et (b) ne couvrent pas.

## 4 · La question qui commande, pour Grégoire

**Qu'est-ce que tu veux dire à l'élève, dans la phrase d'un palier ou d'un énoncé, que tu ne peux pas écrire aujourd'hui ?**
Une phrase d'exemple suffit. Si c'est « tes erreurs par catégorie », c'est (a) et le badge par sous-critère ; si c'est un mot
qui change par grille ou par trimestre, c'est (b) ; si c'est quelque chose que tu sais en corrigeant et que l'application ne
sait pas, c'est (c), et il faut le nommer avant de le coder.

## 5 · Ce que cet inventaire ne dit pas

Comment la palette se présente quand elle grossit (huit badges par palier aujourd'hui ; avec (a) elle en aurait douze ou plus
sur une grille à quatre sous-critères) — c'est une question de design, à cadrer après la réponse au §4, pas avant.
