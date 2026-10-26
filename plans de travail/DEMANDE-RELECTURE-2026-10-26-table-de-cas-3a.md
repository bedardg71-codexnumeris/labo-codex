# Demande de relecture – La table de cas, lot 3a (26 oct. 2026)

> Claude Code, lundi 26 oct. 2026, après-midi, sur `main` (parti de `c07270a6`, 1.219.1 en ligne). Consigne : `CONSIGNE-LOT-2026-10-26-critere-algorithmique-table-de-cas-3a.md` ; ébauche validée : `EBAUCHE-2026-10-26-table-de-cas.html`. Commits : `56bc6be5` (docs : consigne, ébauche, textes, plan) et le commit du lot qui suit ce fichier. **Ni release, ni verdict, ni push** (consigne § 9).

## Vue d'ensemble

L'étape « Paliers » devient « Cas d'interprétation » : la table des paliers de l'ébauche (Quand · Nom court · L'étudiant·e lit), « Fixer / Retirer la limite » à la place du menu des modèles, les collections reprises par l'en-tête, le seuil en pourcentage, « Voir ce que l'étudiant·e lirait à ce palier », et l'encadré « Ce que l'application choisit sans toi ». La simulation lit aussi le bilan et le signalement, au conditionnel, et gagne la copie « Égalité ». Un critère neuf qui fixe sa limite part de champs vides puis des paliers du 25 oct. ; son « Quand tout est maîtrisé » et sa règle d'égalité sont ceux du 25 oct. ; deux phrases prennent les noms de l'enseignant·e. **Un critère existant lit ce qu'il lisait, à l'octet** (mesuré).

## Ce qui est mesuré

| Preuve | Résultat |
|---|---|
| Vitest entier, depuis `tests/` | **9 724 verts / 821 fichiers** (avant : 9 712 ; − 16 du banc retiré, + 28 du banc neuf) |
| Banc neuf `unit/critere-algorithmique-table-de-cas.test.js` | 28 cas (A à H) ; **12 break-tests** faits un à un, restaurés (`shasum`), chacun rougit ce qu'il doit (en fin de fichier) |
| Le stock (piège 1) | `tests/fixtures/table-de-cas-3a-avant.json`, relevé produit sur les registres de `c07270a6` : six critères existants × 66 copies (phrase de projection, quatre énoncés, ligne de la limite, « principalement » avec égalités) ; **identique à l'octet** après le lot (cas G.a). Le relevé du lot 4 (spec `critere-algorithmique-presentation`, « PIÈGE 5 ») reste vert. |
| Spec neuve `integration/critere-algorithmique-table-de-cas.spec.js` (WebKit) | 8 essais : deux disciplines fictives, la chaîne, fixer (champs vides puis paliers du 25 oct.), retirer puis fixer, seuil « 7,5 », ajouter / retirer un palier, signalement, « Voir… à ce palier », collection enregistrée puis reprise, « Égalité » neuf / existant, 1 440 · 1 180 · 820 · 700 px sans défilement de côté |
| Les 20 specs touchées, WebKit, sur l'état final | **61 verts**, 4 captures sautées (sur demande) |
| Captures | 12 : 1 440, 1 180, 820 px × clair, sombre × deux disciplines, l'étape ouverte (`CAPTURES_TABLE_DE_CAS=<dossier>`) |

## Les points à relire en priorité

1. **La marque d'un critère neuf : `nomsAttendus`, pas `codesSousCriteresSeulement`** (écart à la consigne § 1.2, dit dans `projectionAlgo.estNeuf`). Motif : votre relecture du 22 oct. (17 h 40) a écarté la marque des codes pour tout ce que lit l'élève — en ligne depuis la 1.213.0, la lire changerait sans geste les critères créés en 1.213 et 1.214. Cas G.b.
2. **« Retirer la limite »** pose `modeleProjection: 'aucune'` et ne touche à rien d'autre ; « Fixer une limite » retrouve paramètres et paliers s'il y en a, sinon le chemin neuf (champs vides, paliers du 25 oct.), sinon celui d'hier (900 / 30 / « Centre d'aide du collège », paliers de migration lus). Mesuré : sous « aucune », `normaliser` ignore les paramètres, `calculer` ne projette rien ; l'import (`assainirObjet`) et le partage (`projeterEntite`, `validerPackage`) acceptent un critère à la limite retirée et un critère aux champs vides (cas E.d). Un champ vide n'est pas écrit (pas de `null` qui voyage).
3. **La garde `limite-incomplete`** dans `calculer`, avant le palier « zéro » : sans longueur ni tolérance, aucune copie n'atteint de palier. Un critère existant a toujours ses deux nombres (défauts bornés à 1) : la garde ne le touche pas (relevé du stock).
4. **Le préfixe** (`prefixeMoyenne`) : un critère qui lit « erreur / erreurs / mot / mots » garde la phrase d'hier à l'octet, « 1 mots » compris ; les noms ne font pas tomber le préfixe (`JETONS_PROJECTION`, décision du 4 sept.).
5. **« principalement »** (`construireFrancaisResume`) : `nombreEtNom` ; sans noms, « erreur(s) » d'hier (un compte est entier : `> 1` et `>= 2` disent la même chose). Règle d'égalité : `codePrincipal` (neuf : premier de `listeCodes`) ; le mode Catégories passe la liste des sous-critères d'un critère neuf à `_trouverCodeDominant` (`lePlusFrequent`), sinon la boucle d'hier, à l'identique.
6. **La palette compacte** (iPad) : `ciblerPaletteAlgo` mesure la zone AVANT de changer la palette. Avant ce correctif, la palette grandissait en tête de l'atelier (ses blocs paraissent) avant la mesure ; la compensation n'en voyait qu'une part et la zone touchée sautait de 420 px (WebKit, portrait). Le défaut existait déjà en 2b à plus petite échelle ; la valeur des blocs le rendait visible.

## Ce qui a changé, fichier par fichier

| Fichier | Quoi |
|---|---|
| `js/evaluation-projection.js` | `estNeuf`, `_valeurParametre` sans défaut pour un neuf, garde `limite-incomplete`, `prefixeMoyenne`, `{nomErreurs}` / `{nomMots}` dans les paliers, `libelleSeuil(critere, noms)`, `fixerLimite`, `retirerLimite`, `limiteFixee`, `limiteComplete`, `pourcentDuRatio`, `ratioDuPourcent` ; `PALIERS_GABARIT_NEUF` = les paliers du 25 oct. ; **`copiesExemple` retirée** (plus de lecteur) |
| `js/evaluation-enonces.js` | `CONCENTRE_NEUF`, `_enoncesParDefautDe` (deux défauts du générique selon la marque), `defautEnonce` |
| `js/codes-annotation.js` | `lePlusFrequent` |
| `js/evaluation-calcul.js` | `_listeDesCodesSiNeuf`, `_trouverCodeDominant(codes, liste)` |
| `js/synthese-retroaction-data.js` | `codePrincipal`, `nomDuPrincipal`, la ligne dans les noms ; `construireFrancaisResume` exposée (pour le banc) |
| `js/miroir-algo.js` | la copie « Égalité » ; l'ordre de pose (`poses`) des copies à codes |
| `js/palette-algo.js` | les mots de l'ébauche (« Blocs de textes », « Zone choisie : … », groupes, légende) ; moyenne, tolérance, longueur, service, palier, compte projeté nommés sans « erreur » ni « mot » ; la zone d'un palier par son nom court |
| `js/atelier-algo.js` | `TEXTES` de l'ébauche (chaîne, buts, `cas`, `choix`, simulation) ; `_etapePaliers` ; `lecture` (bilan, signalement, états) ; `dominantDeLaCopie`, `valeursDesBlocs`, `copiePourPalier`, `voirPalier`, `ouvrirRecommandation` ; la valeur des blocs, la rangée atteinte, la ligne réglée |
| `js/grilles.js` | `rendreBlocProjectionAlgo` réécrite (la table), `rendreChoixAppAlgo`, `fixerLimiteAlgo`, `retirerLimiteAlgo`, `reprendreCollectionProjectionHandler`, `revenirAuModeleEnonce`, le seuil en `seuilPourcent`, `_redessinerEnGardantLeFocus` ; le menu des modèles et `_idCollectionChoisie` **retirés** ; les deux exemples, les mots des noms, la note de la case décochée, les aides et « Revenir au modèle » des zones ; la mesure de la palette compacte |
| `styles.css` | `.table-cas*`, `.choix-app*`, `.noms-algo-exemples*`, la valeur des blocs, la simulation ; les règles de l'aperçu par palier **retirées** |
| `index.html` | jetons `?v=20261026a` des dix fichiers |

**Bancs recalés sur les nouveaux mots (pas affaiblis)** : Vitest — `atelier-algo`, `critere-algorithmique-noms`, `critere-algorithmique-palette`, `sentinelle-668-projection-euf-livree-par-le-gabarit`, `sentinelle-texte-troue-etape-2-paliers`, `-gabarit`, `-une-seule-carte`, `sentinelle-collections-gabarit`, `sentinelle-carte-bilan`, `sentinelle-lot4-C-gabarit-algo-range`, `sentinelle-composeur-branchement` ; cliquets `#467` (66 → 80, justifié), `#679` (− 5), complexité et `#642` tenus (les fonctions neuves sous 15). Playwright — `collections-projection`, `critere-algorithmique-palette`, `-presentation`, `lot4-gabarit-algo-cartes`, `texte-troue-badges-dans-la-phrase`, `-reperes-enonces`, `-paliers-projection`, `codes-par-grille-gabarit`. **Retiré** : `sentinelle-texte-troue-etape-2-apercu.test.js`, qui éprouvait la ligne « L'élève lira : » sous chaque palier, partie avec ce lot (son successeur : « Voir… à ce palier », cas H.c et la spec neuve).

## Écarts à l'ébauche ou à la consigne, nommés

Les six décisions de `PORTES-TERRAIN-2026-10-26-table-de-cas-3a.md` (§ 3), dont l'écart de la marque (point 1 ci-dessus). Aussi : « Enregistrer ces paliers sous un nom… » ne paraît qu'avec une limite fixée (sans elle, il n'y a rien à enregistrer) ; le résumé de l'étape à régler dit « Paliers selon la limite fixée : écris sa longueur et sa tolérance » (l'ébauche n'avait pas ce cas).

## Trouvailles

- **#1168** (inscrite, consigne § 8) : « --- Langue --- » dans le texte copié par « Copier tout ».
- **Une erreur de la session**, rattrapée : un `git checkout styles.css` a défait tout le CSS du lot ; réécrit, revérifié (cliquets, specs, captures).

## Ce qui reste

Le verdict complet (Playwright entier, en dix morceaux), la release et le push, au signal de Grégoire ; les trois portes iPad ; les six décisions ; puis la consigne du lot 3b.
