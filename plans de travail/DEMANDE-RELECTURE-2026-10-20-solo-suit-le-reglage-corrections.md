# Demande de relecture – SOLO suit le réglage, les corrections (#1117, suite)

> Claude Code, mardi 20 octobre 2026, matin (Toronto). Consigne : `CONSIGNE-LOT-2026-10-20-solo-suit-le-reglage-corrections.md`, qui répond au verdict `VERDICT-RELECTURE-2026-10-19-solo-suit-le-reglage.md` (C1, C2, C3). Pour Cowork (`PROTOCOLE.md`, règle 2). Un commit sur `main`, **non poussé**, après le commit de documentation `54322624`. Pas de verdict complet (ce soir), pas de numéro de version.

## Ce qui change, réglage désactivé seulement

Les trois corrections passent par une même lecture de la préférence, `etiquettesSOLOLuesParDepistage()` (`profil-etudiant-helpers.js`), qui reprend le `!== false` des autres lecteurs.

- **C1, les défis.** `estCritereSurveilleParDepistage` rend vrai pour tout critère quand SOLO est désactivé. La règle reste unique : aucune garde par site. `criteresSurveillesParDepistage` et `trouverCritereDepistage` en héritent.
- **C2, le suivi des fondations.** Nouvelle règle `criteresSuiviFondations(grille)` (helpers) :
  - SOLO activé : les multistructurels parmi les critères surveillés, le filtre d'hier, déplacé ;
  - SOLO désactivé : tous les critères.
  - `calculerIPB` et le sous-titre de la barre (`libelleCriteresMultiSurveilles`) lisent tous deux cette règle. Le sous-titre n'a plus de copie du filtre.
  - La phrase du bilan perd « multistructurels ».
- **C3, les survols.** `survolNiveauAtteint(niveau)` (helpers) compose désormais les deux survols du profil, celui de la note globale (`lireNiveauNoteGlobale`) et celui de chaque critère (`profil-etudiant-sections-affichage.js`). Case décochée, il rend le nom du niveau seul, sans palier ni invitation à poser une étiquette SOLO. La composition, qui était écrite deux fois, n'existe plus qu'à un seul endroit.

SOLO activé, rien ne change. La sentinelle le vérifie à la lettre : l'IPB est le même objet avant et après un aller-retour de la case.

## Les textes provisoires (Grégoire les verra avec la version)

1. Le sous-titre de la barre : « Observation SOLO désactivée : tous les critères sont surveillés (Analyse, Rédaction, Langue). » Les noms des critères sont échappés.
2. La phrase du bilan : « … maîtrise les fondamentaux » (au lieu de « … les fondamentaux multistructurels »).
3. Le survol du niveau atteint : le nom du niveau (« Maîtrisé »).

## Les bancs

- **Sentinelle #1117 : 19 cas, dont 7 neufs (section E).**
  - Les défis dans les deux états.
  - `calculerIPB` dans les deux états : SOLO activé, Structure et Rigueur à 0,75 et IPB 0, comme avant ; SOLO désactivé, les quatre critères à 0,66, IPB 3.
  - Une grille toute « Aucun » : SOLO désactivé, elle donne des défis, un défi spécifique et un IPB ; SOLO activé, rien, comme avant.
  - Le sous-titre, la phrase du bilan (le vrai `genererInterpretationSuiviFondamentaux`) et les survols.
- **Le cas D.c d'hier est renversé** (« `calculerIPB` ne lit pas le réglage ») : il garde maintenant que l'IPB lit `criteresSuiviFondations` sans garde locale. C'est la décision de 6 h 48 qui le renverse.
- **Trois bancs existants adaptés à la nouvelle forme, sans changer ce qu'ils gardent :**
  - `sentinelle-lot-B-739-740` et `sentinelle-lot4-B-solo-aucun` : leur harnais passe le vrai `criteresSuiviFondations` ; la forme lue est déplacée vers helpers ;
  - `sentinelle-audit-aide-15-oct` : la forme de `estCritereSurveilleParDepistage`.
- **WebKit, un troisième cas.** Mode démo, RàI activé, grille de démonstration mise toute à « Aucun » et choisie pour le dépistage :
  - témoin SOLO activé : « Aucun critère multistructurel… » ;
  - SOLO désactivé à la vraie case : la phrase et les cinq noms.
- **Break-tests**, code restauré après chacun (comparaison à l'octet près avec la copie) :
  - la préférence retirée de la règle des défis : 4 cas rouges ;
  - retirée de l'IPB : 3 cas rouges ;
  - retirée du survol : 1 cas rouge ;
  - retirée du bilan : 1 cas rouge ;
  - retirée du sous-titre : le cas WebKit rouge.
- **Résultats** : Vitest complet, 785 fichiers, 9 226 tests sur 9 226 verts. Spec WebKit `solo-suit-le-reglage-1117.spec.js` : 3 sur 3 verts. Les autres specs n'ont pas été rejouées : le verdict complet tourne ce soir.
- **`index.html`** : les jetons des quatre modules sont relevés (`20261019a`, et `b` pour `profil-etudiant-calculs.js`). `version.json` n'est pas touché.

## Le stock

`indicesPatternsRaI` est réécrit par `calculerEtStockerPatternsGroupe` à chaque `chargerTableauBordApercu` quand le RàI est activé (`tableau-bord-apercu.js`, l. 1287), pour le groupe et le trimestre actifs. La lecture neuve s'y installe donc à la prochaine ouverture du tableau de bord. Ce qui garde l'ancienne lecture :

- les autres groupes et trimestres, jusqu'à l'ouverture de leur propre tableau de bord ;
- les instantanés `avant`/`apres` des interventions, qui sont des photographies et doivent le rester.

Je n'ai rien écrit dans aucune donnée.

## Ce que je demande de regarder

1. **Une trouvaille, à laquelle je propose l'issue 2 (inscrire), mais sans fiche** : aucun symptôme vécu, donc rien au BACKLOG sans Grégoire. Case décochée, la barre garde son titre « Structure des apprentissages fondamentaux (SOLO) » (`tableau-bord-apercu.js`, l. 2356 et 2546). Son aide de survol (`tdb-patterns`, `accompagnement-contenu-hover.js`) et l'aide détaillée (`accompagnement-contenu-popup.js`, l. 727-738 et 1152) parlent toujours de critères multistructurels. Ce sont des textes de l'Aide, statiques : les faire suivre le réglage est une décision sur les mots, pas une correction.
2. Le choix du nom : `etiquettesSOLOLuesParDepistage`, et non `observationSOLOActive`, parce que `grilles.js` déclare déjà une fonction globale de ce nom (même règle, autre module ; remarque R1 de ton verdict).
