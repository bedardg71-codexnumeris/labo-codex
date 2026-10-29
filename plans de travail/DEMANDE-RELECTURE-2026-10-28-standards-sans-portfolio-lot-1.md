# Demande de relecture – Des standards sans portfolio, lot 1 : le pool sans artefacts (28 octobre 2026)

> Claude Code, mercredi 28 octobre 2026, soir (Toronto). Consigne : `plans de travail/CONSIGNE-LOT-2026-10-28-standards-sans-portfolio-lot-1.md`.
> Base : `main` = `e597d789` (le commit de docs du § 0, sur `ace09fa2`). BACKLOG : **#1178** (lot 1 coché).
> Rien n'est poussé ; ni release ni verdict Playwright complet (consigne, § 5). Données fictives partout.

## Vue d'ensemble

Le lot fait les quatre gestes du mandat, et la note de la pratique de Grégoire ne bouge pas (GREG-0 à 2 : 84,8).
Sans aucun « Artefact », une pratique Standards de laboratoires et d'examens a maintenant une note (CHIM-1 : 77 ; avant :
non constructible, sans cause). Quand la note manque faute de production notée, l'application dit pourquoi, par une
seule phrase lue à trois endroits. La formule du récit n'écrit plus « terminale × 0 % ». Un doublon réconcilié n'est
plus dit « remplacée par une reprise ».

**Deux points pour Grégoire** (en fin de document) : ce que l'encadré du profil montre devant une cause propre à
l'élève, et une note qui change pour une catégorie égarée. Le premier touche ses propres élèves (GREG-3).

## 1. Avant → après, cas par cas

Mesuré sur le banc du plan (§ 1), repris tel quel ; l'état « avant » sur `e597d789`, l'état « après » sur l'arbre du
lot. Colonnes : note du profil ; export (note / statut).

| Cas | Avant | Après |
|---|---|---|
| GREG-0, GREG-1, GREG-2 | 84,8 ; 85 / provisoire | **inchangé** |
| GREG-3 (aucun artefact évalué) | non constructible, sans cause | non constructible – « Aucun artefact du portfolio n'est encore évalué. » |
| GREG-4 (seule la terminale) | non constructible, sans cause | non constructible – « Seule l'évaluation terminale a une note. En standards, la note du cours s'appuie aussi sur les artefacts du portfolio : elle ne se calcule pas sur la terminale seule. » |
| CHIM-1 (pondérées, « Tous ») | non constructible | **77** ; 77 / provisoire |
| CHIM-1 (« N meilleurs », N = 3) | non constructible | 85 |
| CHIM-2, CHIM-5 | 77 | **inchangé** |
| CHIM-3 (hybride, pondérées) | non constructible | **80,63** ; 81 |
| CHIM-3 bis (non pondérées) | 80,63 | inchangé |
| CHIM-4 (terminale 30 %, le reste pondéré) | non constructible | **78** (l'erratum de Q3) |
| CHIM-4 bis | 78 | inchangé |
| CHIM-6 (seule X2, la terminale) | non constructible, sans cause | non constructible – la seconde phrase, « productions retenues » |
| CHIM-7 (rien d'évalué) | non constructible, sans cause | non constructible – « Aucune production retenue pour la note n'est encore évaluée. » |
| Catégorie égarée hors hybride, non pondérées (L1 « sélection ») | **77** | **70** (L1 seule) |
| Catégorie égarée hors hybride, pondérées | non constructible | 70 |

La formule du récit, avant → après : « portfolio × 100 % + terminale × 0 % » → « moyenne des productions retenues »
(tous les CHIM sans terminale) ; « portfolio × 70 % + terminale × 30 % » → « productions retenues × 70 % + terminale ×
30 % » (CHIM-4) ; Grégoire sans terminale : « … × 0 % » → « moyenne du portfolio » ; GREG-0 inchangé.

## 2. Les gestes, et leurs preuves

1. **Le pool** – `js/pratiques/pratique-registre.js:812` (`obtenirArtefactsIdsPoolStd`). La première branche est
   inchangée ; la condition « au moins un Artefact » devient `poolStdFaitDArtefacts` (`:799`), la seule règle du calcul
   et des mots (Q1). Sans artefact : toutes les productions hors conteneur et terminale ; celles qui portent une
   catégorie s'il y en a (`:822`). La marque « obligatoire » d'une terminale ne compte pas (#339 : la terminale est
   retirée avant). Les diagnostiques sont retirées en amont par les deux appelants (vérifié :
   `calculerDetailsNoteFinale` filtre les productions, l'instance filtre les évaluations ; CHIM-5 reste 77).
2. **La cause** – une source : `causeNoteStdSansProductionNotee` (`pratique-registre.js:834`), au caractère près, en
   apostrophes droites comme la consigne et les messages voisins. `calculerDetailsNoteFinale` la met dans `erreur`
   (`js/profil-etudiant-actions.js:696`) par `_causeNoteAbsenteStd` (`:382`) : seulement sans erreur de configuration,
   sans note, et sans aucune copie du pool qui compte ; la seconde phrase passe avant (Q3). La même chaîne sort seule
   en `causeNoteAbsente`, que la pratique déclare : `PratiqueConfigurable.expliquerNoteNonConstructible`, branche
   Standards (`js/pratiques/pratique-configurable.js:569`) — la route du rapport, du Suivi et de l'export
   (`causeNoteNonConstructible`, `portfolio.js:362`).
3. **La formule** – `_formuleRecitStd` (`profil-etudiant-actions.js:396`). Une terminale sans poids ne s'écrit pas non
   plus. Lecteurs vérifiés : le Comparateur (`comparateur-pratiques.js:990`, l'affiche telle quelle) ; le profil, le
   panneau « Développement des habiletés » (`profil-etudiant-sections-affichage.js:3983`, seulement avec une
   terminale) ; **le PDF ne lit pas `formuleTexte`** (grep sur `js/` : aucun lecteur hors ces deux-là).
4. **Le doublon** – au récit Standards, `_copiesRemplaceesDuPoolStd` (`profil-etudiant-actions.js:408`) sépare la
   reprise (« remplacée par une reprise ») du doublon (« doublon note-égale », `:658`), comme le récit sommatif depuis
   #360 ; aucun mot neuf. À la tuile du registre longitudinal, `estRemplaceeParUneReprise`
   (`js/registre-longitudinal.js:800`) lit la règle du registre (`originaleEstRemplacee`) sur les copies du même
   dossier : ni le doublon ni l'originale qui compte encore (E4) ne portent le mot, et rien ne s'écrit à leur place.
   **Ce que la tuile ne peut pas savoir**, laissé comme avant (« remplacée par une reprise ») : une copie dont la
   reprise n'est pas dans le dossier, et un doublon rangé sans son drapeau `reconcilieParDoublon`.

**Retouche dans le lot** (c'est le lot qui n'était pas fini) : le panneau « Développement des habiletés » rendait
`null` dès qu'`erreur` était posé ; avec la cause dans `erreur`, un·e élève sans artefact évalué y aurait perdu sa
« Règle de sélection » et son « Aucun artefact évalué ». Il ne recule plus que devant une erreur de configuration
(`profil-etudiant-sections-affichage.js:3930`).

**Complexité** : `calculerDetailsNoteFinale` 48 → 49 (le `||` d'`erreur`), inscrit dans `HAUSSES_ASSUMEES` ; la cause,
la formule et les copies remplacées sont sorties en fonctions sous 15.

## 3. Les tests

- **`tests/unit/sentinelle-standards-sans-portfolio.test.js`** (21 essais) : le banc du plan (GREG-0 à 2, CHIM-1 à 5),
  les quatre cas neufs (CHIM-6, CHIM-7, GREG-3, GREG-4 : profil, rapport par `causeNoteNonConstructible`, export) ; une
  erreur de configuration ne porte pas la phrase ; **la source unique** : l'encadré (`genererSectionProductions`), le
  rapport (`genererRapportAPI`) et l'export rendent la même chaîne (CHIM-6) ; la phrase n'est écrite que dans le
  registre (grep) ; les quatre formules ; le doublon au récit et à la tuile (la reprise garde son mot) ; la catégorie
  égarée ; le panneau des habiletés.
- **Break-test**, huit mutations (journal en fin de fichier ; copie de référence, restauration vérifiée par sha256) :
  sans le correctif du pool, **CHIM-1, 3 et 4 rougissent** (6 rouges en tout) ; sans la phrase, **CHIM-6 et 7**
  (5 rouges) ; la seconde phrase après la première, 3 ; la formule d'avant, 2 ; le doublon au récit, 1 ; la tuile
  d'avant, 1 ; la catégorie qui ne désigne plus, 1 ; le panneau d'avant, 1.
- **Playwright** `tests/integration/standards-sans-portfolio-lot-1.spec.js` (WebKit, vert) : le profil de CHIM-6
  montre l'encadré et la seconde phrase ; il attend l'élément (`toContainText`), aucun `waitForTimeout`. Rougit sans
  la phrase (mesuré, fichier restauré). Les dix specs qui montent une pratique Standards : 55 verts, 1 sauté.
- **Trois essais existants mis à jour**, chacun avec « ↻ » et l'avant : B6 de l'audit du 5 sept. et STD-C7 du banc du
  28 oct. (l'export dit la cause) ; la sentinelle de complexité.
- **Vitest complet** depuis `tests/` : 845 fichiers, 10 204 essais verts.
- **Stock** : aucune écriture. Tout se lit au calcul ; les captures déjà prises gardent leur P jusqu'à « Recalculer
  les captures ».

## 4. Ce que montre l'encadré devant une cause propre à l'élève (mesuré, WebKit)

| | Avant | Après |
|---|---|---|
| CHIM-6 | « Note provisoire de session » · Portfolio (0 tous artefacts sur 0 évalué) · Aucun artefact retenu — × 70 % · Examen 2, M 85 % × 30 % · Note finale pondérée (70 % + 30 % = 100 %) — | « Note finale de session » · **Note finale non calculable.** + la seconde phrase |
| GREG-3 | « Note provisoire de session » · Portfolio (0 … sur 0 évalué) · Analyse finale, Non évaluée — × 40 % · — · « Basée uniquement sur le portfolio (évaluation terminale non complétée) » | « Note finale de session » · **Note finale non calculable.** Aucun artefact du portfolio n'est encore évalué. |

Dans les deux cas, après : le bouton « Réglages de la pratique » reste, et l'infobulle du nom de la pratique passe de
« Pratique de notation appliquée pour ce calcul » à « Pratique de notation active (note non calculable — vérifier ses
paramètres) ». **Ces mots supposent une erreur de configuration** ; ils n'ont pas été changés (consigne, § 2.2).

## 5. Les trouvailles

- **Inscrit** (fiche #1178, sous le lot 1) : deux chemins où une note Standards manque encore sans cause au rapport et à
  l'export — une erreur de configuration (sa phrase n'existe qu'au profil) ; en hybride, un pool évalué dont aucune
  copie n'est cochée. Mesuré : le « minimum avant le calcul formatif » ne retient aucune note (il ne sert qu'au
  plafonnement), pas de chemin sans cause là.
- **Inscrit** (rattaché à #1114, la réserve du 28) : les `waitForTimeout` des specs du soir. Mesuré : 10 lignes dans
  `copie-non-recevable-note-28-oct` (le verdict en compte 6), 1 dans chacune des quatre autres.
- **Commenté et oublié** : les anciens types « …-formatif », que les cases des catégories écartent, n'ont plus aucun
  écrivain ; le pool ne les filtre pas (commentaire, `pratique-registre.js`).
- Rien des lots 2 à 5 n'est touché.

## Pour Grégoire

1. **L'encadré, chez tes propres élèves.** Un·e élève sans artefact évalué (GREG-3 : un retardataire, un début de
   trimestre) voyait la carte « Note provisoire de session » avec sa construction vide ; il voit maintenant
   « Note finale non calculable. Aucun artefact du portfolio n'est encore évalué. », avec le bouton « Réglages de la
   pratique » et une infobulle « vérifier ses paramètres », qui parlent d'une configuration à corriger. Faut-il des
   mots propres à une cause d'élève (sans bouton, sans « vérifier ses paramètres ») ? C'est à toi ; rien n'a changé ici.
2. **Une note qui change, hors de ce que le plan annonçait.** Une pratique sans « Artefact » dont **une seule**
   production porte une catégorie hors hybride (le mode hybride retiré après coup : la catégorie reste écrite sur la
   production) : avant, le repli prenait toutes les productions non pondérées (77) ; maintenant, celles qui portent la
   catégorie (70). C'est la règle de la consigne (« si au moins une porte une `categorie`, le pool est fait de
   celles-là ») ; la donnée existe-t-elle chez quelqu'un ? Non mesuré sur des données réelles.
3. **Le libellé du doublon**, « doublon note-égale », est lu par l'élève au PDF (consigne, § 2.4). Ce n'est pas un mot
   neuf : c'est celui du récit sommatif depuis #360, sans sa seconde moitié.
