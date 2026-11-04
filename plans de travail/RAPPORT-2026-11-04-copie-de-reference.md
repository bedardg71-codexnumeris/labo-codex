# Rapport — la copie de référence (#1229), 4 novembre 2026, soir

> Claude Code à Cowork. Consigne : `CONSIGNE-LOT-2026-11-04-copie-de-reference.md` (écrite sur `b6a620c1`, remesurée sur `93677657`). Ordre de Grégoire (17 h 02) : ce lot passe avant le verdict du Mac ; rien n'est poussé.

## En bref

Livré et commité, non poussé : `e4d3f087` (fiche #1229 et consigne), `d3cfd7ce` (le lot). Vitest entier vert (879 fichiers). Spec `copie-de-reference-1229` : 8 sur 8 en WebKit. Specs voisines vertes : #1218, deux doigts, taille de la copie, lot F, #936 (23 essais). Huit contre-épreuves, toutes rouges. Pas de release ni de verdict : le lot part avec la prochaine mise en ligne.

## Ce que fait le lot

- **Menu Actions › « Copie de référence »**, en Annoter comme en Évaluer. Un second panneau montre une copie et ses annotations telles qu'enregistrées (dessinées par le dessinateur de l'export, `dessinerAnnotationsSurCtx`).
- **Quelle copie** : pour une reprise, l'original (même élève, même production, sans `estReprise`) est proposé d'office. Sinon, le panneau invite à choisir parmi les copies de la même production, l'original en tête puis par nom. Les noms sont anonymisés comme au carrousel et échappés.
- **Deux axes** : l'une sous l'autre par défaut, côte à côte sur demande. Le dernier axe est retenu (préférence `axeCopieReference`, inscrite dans `docs/DATA-OWNERSHIP.md`). C'est la seule écriture du module, et elle n'a lieu qu'au geste de la bascule.
- **Zoom propre** : molette avec Ctrl (trackpad), pincement Safari, deux doigts pour défiler, boutons − / % / +, pages précédente et suivante. Le module n'appelle jamais `configurerGestesZoom` ni `setConteneur` ; son cadre est un frère de celui d'Annoter.
- **Sans fichier** (#1028) : la référence le dit, avec les mots de la visionneuse.
- **Second document PDF.js** : détruit à chaque changement de copie et à la fermeture.

## Suppositions nommées (à corriger en dix secondes si fausses)

1. **La référence suit la copie annotée.** Ouvrir une autre reprise montre son original. Ouvrir une copie qui n'est pas une reprise garde la référence, si elle est de la même production : c'est le cas du plagiat, une copie suspecte comparée aux suivantes.
2. **Côte à côte, la copie annotée est réajustée à sa moitié**, puis retrouve son zoom d'avant quand la référence se ferme ou repasse sous elle. Sans ce réajustement, elle débordait de moitié. L'une sous l'autre, on n'y touche pas (règle du 2 nov. : la largeur visible).
3. **La barre de la référence passe au-dessus des palettes flottantes.** Mesuré au banc à 1280 px : les palettes Codes et Tampons couvraient le choix et la fermeture. Seules les commandes reçoivent le doigt. Côte à côte, elles passent sur deux lignes pour ne pas couvrir l'en-tête de la palette Codes.
4. **La copie figée d'une évaluation verrouillée** : je ne l'ai pas trouvée non plus (`grep` de « figée » et « verrouill » dans l'annotation et le stockage). La référence montre les annotations enregistrées.

## Les mots d'écran — à valider par Grégoire avant la mise en ligne

| Où | Proposé |
|---|---|
| Menu Actions | « Copie de référence » |
| Étiquette du panneau | « Référence » |
| Choix, avant sélection | « Choisir une copie… » |
| Précision dans le choix | « Nom, Prénom — original » / « — reprise » |
| Bascule d'axe | « Côte à côte » / « L'une sous l'autre » |
| Fermer (bulle) | « Fermer la copie de référence » |
| Copie non reprise, à l'ouverture | « Choisis la copie à mettre en regard. » |
| Aucune autre copie | « Aucune autre copie de cette production. » |
| Copie illisible | « Cette copie ne s'ouvre pas ici. » |

Tous vivent dans `travauxReference.MOTS` (`js/travaux-reference.js`), sauf le libellé du menu, dans `js/travaux-ui.js`.

## La version : 1.232.2 n'est pas coupée, tout part en 1.233.0

Ce lot ajoute une fonction : la prochaine version est une **mineure, 1.233.0**. La 1.232.2 n'a jamais été tranchée (ni bump ni Nouvelles), et la couper maintenant ferait deux versions pour une seule mise en ligne. Les correctifs qui l'auraient portée (#1224 essai, #1227, #1104) partent donc dans la 1.233.0. La 1.232.1, commitée sans être poussée, reste dans l'historique ; l'utilisateur passera de 1.232.0 à 1.233.0. Les items de Nouvelles dus pour ces correctifs entrent dans l'entrée 1.233.

**Ligne des Nouvelles proposée pour 1.233** (vert) :
- Titre : « Deux copies côte à côte »
- Item : « Annoter et évaluer › Actions › «&nbsp;Copie de référence&nbsp;»&nbsp;: une seconde copie s'ouvre à côté de celle que tu annotes, en lecture seule, avec ses annotations. Pour une reprise, l'original s'ouvre d'office&nbsp;; sinon, choisis une copie de la même production. Chaque copie zoome pour elle-même. »

## Les trouvailles et leur issue

- `genererBadgeFichierImporte` (`js/travaux-ui.js`) pose `anonymiserNom(da)` dans le HTML sans `echapperHtml`. Mon module échappe le sien. **Inscrire et continuer** : ce n'est pas inscrit au BACKLOG (aucun symptôme vécu ; le DA anonymisé est produit par l'app). Je le laisse à l'arbitrage de Cowork.
- Au banc en `file://`, PDF.js ne répond pas : un essai PDF demanderait un serveur, comme `visionneuse-pdf-worker-echec-non-memorise`. **Commenter et oublier** : c'est noté au §4 de la porte.

## La porte terrain

`plans de travail/PORTES-TERRAIN-2026-11-04-copie-de-reference.md` : trois gestes sur l'iPad, le pincement réel. **L'artefact est à publier par Cowork**, après la mise en ligne. Tension à signaler : la règle 2 du skill (pas de porte si le raté n'est pas irréversible) n'en rendrait aucune due, le lot étant en lecture seule. Je l'ai gardée minimale parce que la consigne la demande et qu'un retour de #1218 gênerait le travail de Grégoire.

## Ce qui reste avant la mise en ligne

1. Grégoire valide les mots d'écran et la ligne des Nouvelles.
2. La release 1.233.0 (`scripts/release.mjs`), Nouvelles comprises.
3. Le verdict unique du Mac sur ce HEAD, qui juge tout ce qui n'est pas en ligne.
4. Le push.
