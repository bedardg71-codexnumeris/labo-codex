# Consigne du jour – le critère algorithmique, étape 2a : les deux noms de l'enseignant (jeudi 22 octobre 2026)

> Écrite par Cowork le jeudi 22 octobre 2026 à 17 h 05 (Toronto, mesuré par `date`), sur `main` à `5bd643c3`, version **1.214.0** en ligne. Elle remplace l'état neutre de 16 h 50. Source : l'étape 2 de `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, et les deux décisions de Grégoire écrites dans son tableau (16 h 59 et 17 h).

## 0. Avant tout

- `git status` : `plans de travail/PLAN-2026-10-21-critere-algorithmique-toute-discipline.md` porte une modification de Cowork (les deux décisions). **Commit de docs seul, d'abord**, puis ce lot.
- **Découpage, tranché par Cowork** : l'étape 2 se fait en deux lots. **2a (celui-ci) : les deux noms**, partout où ils s'écrivent. **2b (consigne suivante) : la palette.** Motif : 2a porte les deux décisions du jour et ce que l'élève lit ; 2b est de l'interface, et elle nommera ses blocs avec les noms de 2a.

## 1. Les deux décisions de Grégoire (22 oct. 2026)

1. **16 h 59 — aucun nom par défaut.** Un critère algorithmique neuf naît avec ses deux noms à remplir, au singulier et au pluriel : ce qu'il compte (les occurrences) et ce à quoi il le rapporte (l'étendue). Un exemple grisé dans le champ, d'une discipline sans texte (par ex. « unité manquante / unités manquantes », « calcul / calculs »). « Partir de la liste du français écrit » les remplit : « erreur / erreurs », « mot / mots ». Un critère existant se **lit** « erreur » et « mot » : rien n'est réécrit. Tant que les noms manquent, Annoter le dit et invite à les écrire, comme il le fait pour les sous-critères (étape 0).
2. **17 h — la parenthèse ne s'accorde plus** : « 5 erreurs (3,5 après pondération) sur 400 mots ». Elle remplace « (3,5 une fois pondérées) » partout, pour tous les critères. Les PDF déjà remis gardent l'ancienne forme (rien à reprendre).

## 2. Le mandat

1. **Le modèle.** Les deux noms vivent sur le critère (SSOT), par ex. `critere.noms = { compte: {singulier, pluriel}, etendue: {singulier, pluriel} }` ; la forme exacte est à toi. Les identifiants enregistrés (`erreurs`, `mots`, `donneesAlgorithmiques`) **ne changent pas** : un identifiant n'est pas un libellé (principe du plan). Absent = lu « erreur / erreurs », « mot / mots », comme `modeleEnonces` absent se lit aujourd'hui.
2. **Aucune écriture sans geste.** Ni au chargement, ni par migration. Le stock reste absent tant que l'enseignant n'enregistre pas sa grille ; écrire les noms affichés au geste « Enregistrer » est permis.
3. **L'éditeur de grille** : les deux champs (singulier, pluriel) sous le critère algorithmique, l'exemple grisé, le bouton du français écrit qui les remplit. Un critère neuf (marque `codesSousCriteresSeulement`) sans noms : le dire, comme l'invitation des sous-critères. Mesure d'abord si l'éditeur refuse déjà d'enregistrer un critère neuf sans sous-critères ; fais pareil pour les noms, ou rien, selon ce que tu mesures, et dis ce que tu as retenu.
4. **Partout où « erreur » et « mot » sont écrits pour un critère algorithmique**, ce sont ses noms qui s'écrivent : les champs de l'évaluation (`evaluation-chargement.js` l. 1140-1176 et 1350-1359), les aides qui citent ces champs (`grilles.js` l. 3632, `accompagnement-contenu-hover.js` l. 360), le miroir (`miroir-algo.js` : « copie fictive, N erreurs pour M mots »), la ligne du PDF (`synthese-retroaction-rendu.js` l. 383-390, `nomErreurs` en dur), le décompte du modèle « Générique » (`evaluation-enonces.js`, `ENONCES_GENERIQUES.decompte` et `.aucune`). Le modèle « Français » (`ENONCES_FRANCAIS`) garde ses mots : c'est un modèle choisi. Les repères (`REPERES`) gardent leur forme : leurs libellés prennent les noms en 2b.
5. **Les phrases de l'élève.** Le décompte générique garde **la structure arrêtée par Grégoire le 2 sept.** (« Ta production contient N ‹nom› ‹parenthèse› pour M ‹nom› ») ; seuls les deux noms deviennent des jetons. Un texte écrit par l'enseignant dans `critere.enonces` reste tel quel (stock).
6. **La parenthèse** : `mentionPonderee` rend « (3,5 après pondération) », sans accord ; l'aide du repère `{points}` suit. Les tests qui figent « une fois pondérée(s) » changent avec la décision (mesuré : trois Vitest, trois specs). Ne touche pas aux Nouvelles 1.213 (`changelog-data.js`) : c'est l'histoire.
7. **Ce qui voyage.** Le champ des noms entre dans les schémas d'import (`import-export.js` l. 890) et de partage (`partage-schemas.js` l. 390) : chaînes bornées, échappées. Une grille partagée avec ses noms, ouverte par une version qui ne les connaît pas, se lit « erreur » et « mot » : dis-le, pour la relecture (règle 2 du PROTOCOLE : un format qui voyage).
8. **Sécurité** : les noms sont du texte de l'utilisateur. `echapperHtml()` partout où ils passent par `innerHTML`, et dans le PDF.

## 3. Pièges connus

- **L'élision.** « Nombre de erreurs », « nombre de unités » : faux. Pour les étiquettes de l'enseignant, préfère une forme sans « de » (par ex. le nom au pluriel seul, « Unités manquantes », « Calculs »). Dans la phrase de l'élève, la structure du 2 sept. ne met pas de « de » devant les noms : vérifie-le.
- **Le pluriel.** Le singulier sous 2, le pluriel à partir de 2 (« 0 erreur », « 1 erreur », « 1,5 erreur », « 2 erreurs »). Aujourd'hui deux règles coexistent (`> 1` dans le PDF, `>= 2` dans `mentionPonderee`) : une seule, partagée.
- **Jamais un nom vide ni un jeton nu** dans ce que lit l'élève. Si un critère neuf est évalué sans noms, ce qui s'imprime à la place est un texte provisoire, à soumettre (§ 5).
- `{s}` suivait « erreur ». Avec deux formes données par l'enseignant, il ne sert plus que les textes d'hier : il reste lu, il n'est plus offert.

## 4. Les tests

- **Le garde-fou du plan** : un banc en rédaction (« erreur / mot ») et un banc sans texte (« unité manquante / unités manquantes » sur « calcul / calculs »), sur chaque surface du § 2.4.
- **L'invariant du stock**, en sentinelle : pour un critère sans noms, chaque phrase et la ligne du PDF sont identiques au caractère près à celles de `5bd643c3`, **sauf la parenthèse**. Break-test : un nom par défaut changé doit la rougir.
- Un nom piégé (`<img src=x onerror=…>`) reste du texte à l'écran et dans le PDF.
- L'aller-retour d'une grille par l'export et par le partage garde les noms ; une grille sans noms ressort sans noms.
- Vitest depuis `tests/`, puis les specs Playwright du critère algorithmique et du PDF. **Pas de verdict complet ni de release** : ils tournent à la release, au signal de Grégoire.

## 5. Clôture

- Commit sur `main`, puis demande de relecture à Cowork.
- **Les textes de l'enseignant et les replis** (étiquettes des champs, exemple grisé, invitation d'Annoter, ce qui s'imprime sans noms) : textes provisoires de toi, réunis dans `plans de travail/TEXTES-2026-10-22-noms-critere-algorithmique.md`, que Cowork soumettra à Grégoire avant la release.
- L'item des Nouvelles est proposé dans ton rapport, **pas écrit**.
- Toute trouvaille hors du lot : les trois issues de `CLAUDE.md`, « inscrire et continuer » par défaut.
- Termine par **le geste à vérifier à l'écran**, en une phrase d'utilisateur.
