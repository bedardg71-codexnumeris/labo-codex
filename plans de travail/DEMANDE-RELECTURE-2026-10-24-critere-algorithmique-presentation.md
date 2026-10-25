# Demande de relecture – La présentation du critère algorithmique, d'après la maquette du 24 octobre (lot 4, #1150)

> Claude Code, samedi 24 octobre 2026, 22 h 52. Consigne : `CONSIGNE-LOT-2026-10-24-critere-algorithmique-presentation.md` ; maquette `MAQUETTE-2026-10-24-critere-algorithmique.html`.
> § 0 : parti de `25b31158` (le lot #1153 commité, `main` à jour, aucune suite en cours, fichiers du § 4 non touchés par une autre session). Retouche du verdict de #1153 d'abord, à part : `b751353a`. Commit de docs : `96dccb51`. Puis le commit du lot.
> **Ni release, ni push** : au signal de Grégoire. Verdict Playwright complet : § 5.

## 1. Ce que l'enseignant·e voit

Sous les champs d'en-tête d'un critère « Algorithmique » : la chaîne des cinq étapes (Ce que tu comptes → Codes → Note → Paliers → Ce que l'élève lit), puis l'atelier en trois colonnes : la palette (son en-tête dit à quoi elle sert, mots de la maquette), les cinq étapes repliables (une seule ouverte ; « Ce que l'élève lit » au départ), « Ce que l'élève lira » à droite (copie fictive réglable, note, palier, phrases rangées par destination, « Montrer d'où vient chaque phrase »). Zones où se posent les blocs : violettes, en pointillé ; blocs à bordure égale. Captures : `plans de travail/captures-2026-10-24-critere-algorithmique-presentation/` (1 440, 1 180, 820 px, clair et sombre, « Ce que l'élève lit » puis « Paliers » ouvertes).

## 2. Ce que le lot change

| Fichier | Ce qui change |
|---|---|
| `js/atelier-algo.js` (neuf) | Les états des étapes (fonctions pures), la lecture découpée par source, la copie fictive, le rendu de l'atelier, le montage (chaîne, aperçu), les gestes (étape ouverte, survol d'un bloc, phrase touchée, tiroir sous 760 px). État en mémoire seulement. |
| `js/grilles.js` | `rendreCartesGabaritAlgo` passe par l'atelier ; le décompte quitte la carte de projection pour l'étape « Ce que l'élève lit » ; « Aucune annotation » à plat dans « Codes », sous la liste ; l'en-tête de la palette ; `deciblerPaletteAlgo` (une étape fermée ne garde pas la cible) ; l'aperçu suit la pondération et un bloc posé sans redessin. **Retirés** : `carteGabaritAlgo`, `rendreMiroirAlgo`, `suivreMiroirAlgo`, `rendrePliAucuneAnnotation`, la ligne « Texte de départ ». |
| `js/chaine-etapes.js` | Deux états : `ouverte` (`.bc-ouvert`) et le crayon (`crayons`, `marquer`). Sans ces options, le dessin des lots 3a-3b est inchangé (banc F.a). |
| `js/palette-algo.js` | Les mots de la palette (titre, but, gestes, « Aucune zone choisie. », astuce, « Tu écris dans : »). |
| `js/miroir-algo.js` | Quatre libellés du bloc rendu retirés (titre, intro, « L'élève lira : », « aucune phrase »). Aucun calcul touché. |
| `styles.css` | Jetons `--zone-blocs*` (deux modes), l'atelier, les étapes, l'aperçu, le tiroir ; blocs sans liseré gauche ; CSS du miroir, des cartes et du décompte d'hier retiré. |

**Stock : rien à migrer.** Aucune donnée écrite, aucun texte par défaut, aucun calcul changé.

## 3. Ce que la mesure a contredit, et les décisions prises seul (à valider)

1. **« Paramètre de la formule > 0 » et « longueur et tolérance > 0 » ne refusent jamais rien.** Mesuré : les registres bornent ces valeurs (0 devient 1, un vide le défaut). L'étape suit ce que le calcul applique : « Note » n'est « à régler » que sans pondération ; « Paliers » ne l'est jamais avec les registres d'aujourd'hui. La règle est gardée telle quelle (elle tiendrait pour un registre qui laisserait passer 0).
2. **« Ce que tu comptes » réglée = aucune paire de noms ne manque** (`nomsManquants`, la règle de l'invitation), pas « les quatre formes écrites » : un critère d'avant lit « erreur / mot » et fonctionne ; le marquer « à régler » sur les grilles réelles de Grégoire aurait dit faux.
3. **Le résumé de « Ce que tu comptes »** : « « erreurs » par rapport aux « mots » » au lieu de « rapportées aux » de la maquette — l'accord dépendait du genre du nom choisi par l'enseignant·e.
4. **« Codes » d'un second critère algorithmique** : info « nombre tapé », réglée (les codes vont au premier, #1132). Mots de Claude Code.
5. **Les noms courts de formule** (info de « Note ») : « pénalité normalisée », « ratio visé », « pénalité fixe », comme la maquette ; une table dans `atelier-algo.js`, pas dans le registre.
6. **Les copies de référence** : « Aucune », « Quelques », « Beaucoup », et « Pondérée » quand le miroir la rend. − / + rend la copie ordinaire (le compte est ce que la formule reçoit, sans codes).
7. **La palette compacte sans cible cache ses blocs et montre l'astuce** (maquette) ; 2b les montrait inactifs.
8. **Le tiroir sous 760 px** : celui du premier atelier à l'écran ; réduit au départ ; le bouton « Réduire / Tout voir ».
9. **« Aucune annotation » à plat** dans « Codes », sous la liste (maquette) ; son pli est parti.
10. **Gardé de l'existant, que la maquette n'avait pas** : la ligne « L'élève lira : » sous chaque palier, les collections, le signalement, l'ajout et le retrait des paliers. **Pas fait** : le bouton « Voir ce que l'élève lirait à ce palier » de la maquette (la consigne ne le demande pas).
11. **`plisGabaritAlgo` reste**, pour les plis « Observation » des sous-critères seulement (ils doivent survivre au redessin) ; les plis des cartes sont partis.
12. **`miroirAlgo.essais` reste** : les blocs A et B du banc du miroir éprouvent le calcul unique par lui.

## 4. Les pièges du § 5

1. Sessions en parallèle : § 0 respecté ; `PLAN-2026-10-24-refonte-de-l-aide.md` et deux autres documents modifiés par une autre session, non touchés, non commités.
2. Le redessin : l'étape ouverte et la copie réglée vivent en mémoire par critère, relues au rendu (Vitest lot 4 C.C, atelier E.b et E.d ; WebKit lot 4 et « 1 440 px · − / + »). La pondération ne redessine pas : l'aperçu suit en place (WebKit « en création », témoin posé sur l'élément).
3. La palette cible au `focusin` : la pose marche dans une étape ouverte depuis la chaîne (WebKit) ; fermer l'étape de la zone visée décible la palette (Vitest E.g, WebKit).
4. Phrases cliquables : `textContent`, aucun gestionnaire en ligne (Vitest E.c, E.j).
5. **Évaluation et PDF inchangés** : `tests/fixtures/critere-algorithmique-avant-1150.json` relève, sur `96dccb51` (avant le lot), la note et la phrase de l'évaluation (`formulesAlgo.calculer`, `phraseDecompteAlgo`) pour 27 copies du critère de démonstration ; la même mesure sur le lot est identique à l'octet, et l'aperçu dit la même note et la même phrase (WebKit « le piège 5 »). Aucun fichier de l'évaluation ni du PDF n'est touché.
6. Les bancs recalés, pas affaiblis — § 5.

## 5. Preuve

- **Vitest** : 819 fichiers, 9 693 tests verts. Neuf : `tests/unit/atelier-algo.test.js` (32 tests : chaque étape réglée et non réglée, les zones, le calcul unique, la copie fictive, la page en jsdom, la chaîne commune, le chargement). Break-tests : quatre mutations, chacune rouge (A.d ; C.c ; E.b, E.e, E.g ; E.a, E.b, F.a), restaurées, `shasum` identique.
- **Recalés** (Vitest) : `sentinelle-lot4-C-gabarit-algo-range` (A, B.c et C réécrits : ordre des étapes, une seule ouverte, mémoire par critère), `sentinelle-carte-bilan` (A à C : l'étape « Ce que l'élève lit », « Aucune annotation » à plat), `sentinelle-texte-troue-etape-2-une-seule-carte` (le décompte a toujours UN endroit, l'étape « Ce que l'élève lit »), `sentinelle-miroir-critere-algo` (E : le bloc parti, l'aperçu le remplace), `critere-algorithmique-noms` (D.d sur l'aperçu), `sentinelle-texte-troue-etape-2-gabarit` (B.d), `sentinelle-composeur-branchement` (« Tu écris dans : »), `sentinelle-467` (cliquet 68 → 66) ; et l'atelier chargé dans huit autres bancs. Break-tests des trois bancs réécrits : sept mutations, toutes rouges, consignées dans leurs en-têtes.
- **Playwright (WebKit)** : neuf, `critere-algorithmique-presentation.spec.js` (10 essais + captures) ; recalés : `lot4-gabarit-algo-cartes`, `critere-algorithmique-palette` (⚠ à 1 180 px la palette est désormais COMPACTE : l'aperçu prend 340 px, le centre mesure 619 px), `texte-troue-reperes-enonces`, `texte-troue-paliers-projection`, `texte-troue-badges-dans-la-phrase`, `collections-projection`, `critere-algorithmique-mots`. **Retirée** : `critere-algorithmique-miroir.spec.js`, ses vérifications reportées dans la spec neuve. Break-tests de la spec neuve : trois mutations, chacune rouge.
- **Suite Playwright complète** : voir le rapport de la session (lancée avant ce commit).

## 6. Ce que je n'ai pas pu vérifier

- **Le toucher réel sur iPad** : Playwright émule le doigt mal sur la palette (note du 22 oct.) ; la pose est éprouvée au clic, à la largeur de l'iPad.
- **De 760 à 1 024 px, « Ce que l'élève lira » ne colle pas** au défilement : rien ne colle dans l'app à ces largeurs (`body` et `.conteneur` rognent ; la règle de 2b le dit). Il reste en haut de sa colonne.
- **Le tiroir pendant l'entrée de la section** : l'animation d'entrée déplace un instant le tiroir (mesuré en WebKit), il se pose ensuite.
- **`design-system.html`** ne décrit pas l'atelier : rien n'y a été ajouté (les jetons violets sont dans `styles.css`).

## 7. Ce que je demande à Cowork de relire

Les décisions 1 à 11 du § 3, en particulier 1 (les règles qui ne peuvent rien refuser), 2 (« Ce que tu comptes » d'un critère d'avant) et 7 (la palette compacte sans cible) ; les mots ajoutés hors maquette (§ 3, 3 et 4) ; la palette compacte à 1 180 px.
