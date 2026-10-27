# Verdict de relecture – L'Aide, lot 2a : Commencer et Cadre (#1152)

> Cowork, mardi 27 octobre 2026, 15 h 40 (Toronto), sur `main` = `51081606`. Lu : la demande de relecture, le diff, la sentinelle neuve et les deux sentinelles recalées, trois captures. Les 13 entrées contre-vérifiées au code du HEAD par une lecture indépendante (qui n'a vu ni la consigne ni la demande) ; ses constats de fond revérifiés par Cowork au code (`grep` des gestes dans les six fenêtres de bibliothèque, `js/mots-nature.js`, `js/calendrier-vue.js:513`, `js/trimestre-v2-groupes-cours.js:479-492`).

## Verdict : accepté, avec une retouche

Aucune affirmation n'est fausse (le code ne fait jamais l'inverse du texte). Huit sont imprécises ou trompeuses : la retouche les corrige. Elle passe **après les réponses de Grégoire** sur les quatre points du § 2, pour ne faire qu'un tour.

Ce qui tient sans retouche : la forme (13 entrées dans l'ordre de la consigne, les quatre absorbées absentes) ; la sentinelle neuve (elle lit bien la popup en exécutant le module, break-test 8/8) ; le recalage de `sentinelle-aide-2026-10-24-forme` ; `demo`, `modes`, `horaire`, `archivage` (hors première phrase) exacts ; les captures (le masque est la 3ᵉ icône de la première ligne à 1 440 px).

**`sentinelle-audit-aide-lot-E`** : garde retiré, accepté tel quel (décision de Cowork). La boucle peut encore rougir si une mention de « 601-101 » revient sans son marqueur ; ce n'est pas une assertion vide. L'interdire tout à fait serait une règle neuve, sans besoin vécu.

## 1. La retouche (Claude Code)

1. **`presentation`** : « l'application refuse d'importer un fichier non signé ou modifié en chemin » vaut pour « Importer le partage d'une ou d'un collègue » (`js/partage-import.js:701-709`) ; les imports .json des fenêtres de bibliothèque ne vérifient aucune signature (`js/cartouches.js:1839-1880`, mesuré pour les cartouches). Borne la phrase à ce geste.
2. **`prise-en-main`** : « Assistance » règle les info-bulles, l'aide à l'écran et les flèches (`js/accompagnement.js:634, 715`) ; la visite guidée a son propre bouton, qui s'ouvre sans regarder l'Assistance (`:820`) et la rallume au démarrage (`:1325`). Retire la visite guidée de la ligne « Assistance » (« Visite guidée » reste dans la carte, `sentinelle-audit-aide-lot-A`). Et « Étapes de configuration » est le titre d'une entrée de l'Aide, pas un libellé du Cadre : dis-le (« l'entrée « Étapes de configuration », dans la partie Cadre de cette Aide »).
3. **`bibliotheque`** : la réponse de Grégoire au § 2, point 2.
4. **`chaines-etapes`** : la réponse de Grégoire au § 2, point 3 (dont : c'est la case **décochée** qui masque ; elle est cochée par défaut, `index.html:9263`, `js/preferences-v2.js:510`).
5. **`preferences`** : la carte Sécurité dit « Mémoriser le dossier Travaux et les Archives entre les sessions » (`index.html:9359`) ; reprends ce libellé.
6. **`etapes-config`** : retire la phrase des trois résumés. Elle redit l'écran, et le résumé du groupe-cours compte la pratique et pas le trimestre (`js/trimestre-v2-groupes-cours.js:479-492`), alors que l'entrée dit juste avant « la pratique de notation est facultative » : un groupe-cours qui a ses éléments obligatoires sans pratique affiche « 4/5 configurés ». Et #1038 : la question revient quand on modifie le cours ou le groupe (`:790-795`) ; dis « avant d'enregistrer le groupe-cours ».
7. **`cours`** : le menu « Nature » offre « Enseignement » et « Orthopédagogie » (`js/mots-nature.js`, clés `nature`), pas « cours ou service » ; reprends les libellés de l'écran. La liste des champs facultatifs omet les trois champs de compétence (`index.html:6476, 6480, 6647`) : écris « les autres champs sont facultatifs » plutôt qu'une liste incomplète.
8. **`presences-calendrier`** : seuls les jours de cours réguliers s'ouvrent au clic, pas les jours de reprise (`js/calendrier-vue.js:323-335`) ; la légende dit « Jour de cours régulier » (`:513`). Reprends ce mot.

Laissés tels quels, mineurs : « Nom de l'horaire » aussi obligatoire ; « Exporter CSV » visible seulement quand la liste n'est pas vide ; le bouton « Retirer les copies (n) » qui porte un nombre.

Tests : les sentinelles suivent les mots corrigés ; `sentinelle-1002-mots-clos.test.js:119` se recale seulement si Grégoire change la première phrase d'`archivage` (§ 2, point 4), en citant sa réponse.

## 2. Pour Grégoire (Cowork les lui soumet, un à la fois)

Décision de Cowork : seules montent les phrases neuves qui disent quelque chose de l'application au-delà d'un libellé d'écran. Les autres (`prise-en-main`, `demo`, `modes`, `preferences`, `etapes-config`, `cours`, `horaire`, `etudiants`, `archivage` hors première phrase) nomment ce que l'écran affiche, mesuré : elles restent, sauf objection de sa part.

1. **`presentation`**, la phrase venue de `monitorage` : « Tes grilles, tes échelles et ta pratique de notation sont les tiennes. La « Grille de départ », l'« Échelle de départ (IDME) » et la « Cartouche de départ » que l'application installe, comme le matériel de la démonstration, sont des exemples. » Recommandation : la garder telle quelle.
2. **`bibliotheque`** : le texte validé du 25 oct. est présenté comme commun aux six fenêtres, mais trois gestes n'y sont pas partout. « Garder dans ma bibliothèque → » manque pour les cartouches et les pratiques. « Retirer de ce trimestre » manque sur la Carte d'alignement. Les dossiers n'existent que pour les grilles, échelles, productions et pratiques. Ces gestes manquants sont déjà inscrits (#1160 à #1167). Recommandation : une phrase après les listes, à retirer quand ils existeront. Proposition : « Pour l'instant, les cartouches et les pratiques ne se gardent pas encore dans ta bibliothèque, une carte d'alignement ne se retire pas de ce trimestre, et seuls les grilles, les échelles, les productions et les pratiques ont des dossiers. »
3. **`chaines-etapes`**, l'entrée entière, corrigée par Cowork (accord de « le » ; la case décochée) : « En haut de plusieurs outils, une chaîne montre les étapes qui rendent cet outil prêt à servir ; une étape réglée est cochée. On en trouve dans Cadre › Trimestre, sur les fiches de production, de grille, d'échelle, de cartouche et de pratique, sur la Carte d'alignement et dans un critère algorithmique. Un clic sur une étape mène où elle se règle, sans rien modifier ; « Méthode » rouvre l'assistant d'une pratique, et sur la Carte d'alignement, le clic ouvre le guide à la page de l'étape. Décocher « Afficher les chaînes d'étapes » (Réglages › Préférences, Expérience visuelle) les masque toutes ; les étapes d'un critère algorithmique s'ouvrent alors par leur titre. »
4. **`archivage`**, la première phrase (acceptée le 4 oct.) : « Clore un trimestre le fige en lecture seule, une fois terminé ; tu peux ensuite en commencer un nouveau. Clore ne libère aucun espace. » Elle inverse l'ordre du code : le trimestre actif ne se clôt pas, il faut d'abord en activer un autre (ce que l'entrée dit déjà dans « Comment clore »). Recommandation de Cowork, la plus petite retouche de ses mots : retirer « ; tu peux ensuite en commencer un nouveau » (« Clore un trimestre le fige en lecture seule, une fois terminé. Clore ne libère aucun espace. »), et la puce « Tu souhaites commencer un nouveau trimestre » de « Quand clore ? », qui porte la même inversion. La proposition de Claude Code (« Le trimestre actif ne se clôt pas : commence ou active d'abord le suivant. ») redirait la phrase de « Comment clore ».

Réponses de Grégoire, point par point :

- Point 1 (`presentation`) : **gardée telle quelle** (27 oct., 15 h 37, « oui »).
- Point 2 (`bibliotheque`) : **la phrase proposée est ajoutée**, mot pour mot, après les listes (27 oct., 15 h 38, « oui »).
- Point 3 (`chaines-etapes`) : **l'entrée corrigée par Cowork est gardée**, mot pour mot (27 oct., 15 h 38, « oui »).
- Point 4 (`archivage`) : **les deux retraits sont acceptés** (27 oct., 15 h 39, « oui ») : la première phrase devient « Clore un trimestre le fige en lecture seule, une fois terminé. Clore ne libère aucun espace. », et la puce « Tu souhaites commencer un nouveau trimestre » part de « Quand clore ? ». `sentinelle-1002-mots-clos.test.js:119` se recale sur la nouvelle phrase, en citant cette réponse.

## 3. Trouvé en relecture

- **Lot 5, à inscrire au tableau « Trouvé hors de la section Aide »** (issue 2) :
  - le résumé du groupe-cours compte la pratique et pas le trimestre (`js/trimestre-v2-groupes-cours.js:479-492`), alors que l'écran dit « 5 éléments obligatoires : trimestre, cours, numéro de groupe, horaire et enseignant·e. La pratique de notation est facultative. » (`index.html:7196`). Ce que veut dire « Complet » revient à Grégoire ;
  - la popup « Comment fonctionne la bibliothèque » (texte validé) s'ouvre dans six fenêtres où trois de ses gestes ne sont pas tous offerts (§ 2, point 2) ; elle redeviendra vraie quand #1160 à #1167 seront faites. Rien à changer d'ici là sans Grégoire.
- **Vu, non inscrit** (règle du 24 août : aucun symptôme vécu) : dans l'Aide comme dans la popup, les guillemets français sont séparés de leur mot par une espace ordinaire, pas insécable ; à 820 px, un guillemet ouvrant finit seul une ligne (capture `aide-bibliotheque-820.png`).

## 4. Clôture de la retouche

- Un seul commit pour la retouche (§ 1, avec les quatre réponses du § 2), plus les deux inscriptions du § 3 au tableau de l'audit.
- Les sentinelles suivent les mots corrigés ; la sentinelle neuve garde son break-test.
- Une courte demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-aide-lot-2a-retouche.md` (ce qui a changé, point par point ; les tests recalés).
- Pas de release, de verdict ni de push sans le signal de Grégoire.
