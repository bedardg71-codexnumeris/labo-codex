# Consigne – le bouton du verrou aussi dans la palette Annotation (samedi 24 octobre 2026)

> Écrite par Cowork le samedi 24 octobre 2026 à 8 h 55 (Toronto, mesuré par `date`), sur `main` = `d736b390`.
> **À exécuter APRÈS le lot en cours** (`CONSIGNE-DU-JOUR.md`, les mots de l'aperçu du codex) : une seule session écrit dans `js/` à la fois. Cette consigne ne remplace pas `CONSIGNE-DU-JOUR.md` et n'archive rien.
>
> Demande de Grégoire (24 oct., 8 h 51, captures vues par Cowork) : « j'aurais besoin que le bouton de verrouillage ou de déverrouillage de l'évaluation ne figure pas uniquement dans la palette d'évaluation, mais qu'il y soit présent également dans la palette d'annotation. […] Parfois, après enregistrement, j'ai besoin d'ajouter un commentaire, un tampon ou un code et je dois toujours faire le détour par la palette d'évaluation pour déverrouiller la copie. »

## 0. Avant tout

- Aucune suite ne tourne en arrière-plan (règle 5).
- Commit de docs seul, fichiers nommés : cette consigne et `VERDICT-RELECTURE-2026-10-24-apercu-codex-mots.md` (relecture du lot précédent, acceptée).

## 1. Ce que Grégoire verra

En mode **Annoter**, la palette « Annotation » porte, en première ligne de sa colonne de boutons (au-dessus de corbeille / annuler / rétablir), le même bouton que la palette « Paramètres » : **« Déverrouiller l'évaluation »** quand l'évaluation de la copie affichée est verrouillée, **« Verrouiller l'évaluation »** quand elle ne l'est pas. Même apparence que `#btnVerrouillerEvaluation` (`btn btn-principal`, pleine largeur). Aucun mot nouveau.

Décisions de Cowork (techniques, dites à Grégoire en une ligne) :
- **Bouton à libellé, pas un cadenas d'en-tête** : il parle du « bouton », et la capture qu'il montre est celui-là.
- **Caché quand la copie n'a pas encore d'évaluation** : créer une évaluation se fait dans « Évaluer » ; la palette Annotation ne crée rien.

## 2. Mesuré dans le code (24 oct., Cowork, lecture seule)

- La palette Annotation est écrite par `genererHTMLPalette` (`travaux-outils.js`, l. ~1925-1950) et **régénérée** par `rafraichirPalettesApresPersonnalisation` (l. ~3856) : le bouton doit survivre à cette régénération avec le bon état.
- L'identité de la palette Annotation est synchronisée dans `remplirLabelsIdentite` (`travaux-ui.js`, l. ~5477) : c'est le point de passage commun à tous les chemins qui changent de copie.
- **Une seule porte pour le verrou** : `basculerVerrouillageEvaluationCourante` (`evaluation.js`, l. ~2108, lot C, D1 du 26 sept.). Verrouiller passe par `sauvegarderEvaluation` (vérifications : références, échelle résolue #697, portée #674) ; déverrouiller écrit `verrouillee: false` sans vérification. **Le nouveau bouton appelle cette porte, ou un noyau partagé qu'elle appelle aussi : pas de deuxième chemin d'écriture.**
- L'état affiché est tenu par `mettreAJourBoutonVerrouillage` / `afficherOuMasquerBoutonVerrouillage` / `_libellerBoutonVerrouiller`, qui trouvent les contrôles par **`getElementById`** et supposent « UN seul cadenas dans la page » (`poserBoutonVerrou`, `travaux-ui.js`, l. ~5334). Il y en aura deux (la palette Annotation reste dans le DOM, cachée, en mode Évaluer) : ces fonctions doivent tenir **tous** les contrôles du verrou, et les commentaires qui affirment l'unicité sont corrigés.
- En mode Annoter, les palettes d'évaluation sont retirées (`fermerModeEvaluation`, `travaux-ui.js`, l. ~5573) et **`evaluationEnCours` peut être celle d'une AUTRE copie** (#1142, `copieEstCelleDeLEvaluationEnCours`, `evaluation-calcul.js`, l. ~272).
- Pourquoi le déverrouillage compte pour un code : le nombre de codes va dans le champ « Nombre d'erreurs » (`mettreAJourCompteursErreurs`, `travaux-outils.js`) et l'auto-save **ne réécrit jamais une évaluation verrouillée** (`evaluation-chargement.js`, l. ~2152). Pour le commentaire et le tampon, Cowork n'a trouvé aucune garde du verrou dans le moteur d'annotation (inférence, non vérifiée à l'écran).

## 3. Ce qui doit tenir

1. **Le bouton dit l'état de la copie AFFICHÉE**, pas celui d'`evaluationEnCours` (qui peut retarder, #1142). Il suit la copie à chaque passage d'un élève à l'autre en mode Annoter.
2. **Déverrouiller depuis Annoter** a exactement l'effet de « Déverrouiller l'évaluation » dans Paramètres, sur l'évaluation de la copie affichée : stockage, message, badges, libellé des deux boutons.
3. **Verrouiller depuis Annoter** passe par la même porte, avec ses vérifications. **Mesure d'abord** si, en mode Annoter, le formulaire et `evaluationEnCours` sont ceux de la copie affichée. S'ils ne le sont pas, la porte ne doit pas verrouiller les données d'une autre copie : choisis la voie la plus sûre (par exemple charger l'évaluation de la copie avant de passer la porte) et **écris ton choix et sa mesure** dans la demande de relecture. Jamais un verrouillage écrit avec le compte de codes d'une autre copie.
4. **Mode Évaluer → Annoter → Évaluer** : les deux boutons disent toujours la même chose.
5. Règles de sécurité de `CLAUDE.md` : `data-action` (pas de `addEventListener` ad hoc si le dispatcher suffit), aucun `innerHTML` avec une donnée, aucun `console.log`.
6. iPad : cible tactile conforme au skill `design-interface` ; le bouton est dans le contenu de la palette, pas dans sa barre (pas de capture de pointeur, #644).
7. Rien ne change dans les données : seul le drapeau `verrouillee` existant est écrit, par la porte existante. Source et stock : sans objet.

## 4. Aide

Le paragraphe d'aide sur le verrou (`index.html`, l. ~11766 : « clique sur **Verrouiller l'évaluation** (ou sur le cadenas) ») mentionne en une proposition que le bouton est aussi dans la palette Annotation. Mets la phrase exacte dans la demande de relecture.

## 5. Tests

Une spec Playwright, break-test démontré (le test rougit sans le correctif) :
- évaluation verrouillée, mode Annoter → le bouton dit « Déverrouiller l'évaluation » ; clic → `verrouillee === false` en stockage, le bouton dit « Verrouiller l'évaluation » ; passage en Évaluer → `#btnVerrouillerEvaluation` dit la même chose ;
- passage à une copie sans évaluation → bouton caché ; à une copie verrouillée → « Déverrouiller l'évaluation » ;
- verrouiller depuis Annoter verrouille **l'évaluation de la copie affichée** et aucune autre (deux copies, deux évaluations, on vérifie les deux).

## 6. À rapporter, sans le changer

Vérifie si un commentaire ou un tampon ajouté sur une copie **verrouillée** est enregistré et apparaît dans le PDF de l'élève. Une phrase dans la demande de relecture : Cowork en informera Grégoire.

## 7. Clôture

- **Pas de release, ni verdict, ni push** : le lot rejoint ceux du jour (une release et un verdict par jour, au signal de Grégoire).
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-verrou-palette-annotation.md`.
- Trouvailles en chemin : les trois issues de `CLAUDE.md`, nommées.
- Termine par le geste à vérifier à l'écran après la prochaine mise en ligne : ouvrir une copie déjà évaluée et verrouillée en mode Annoter ; la palette Annotation dit « Déverrouiller l'évaluation » ; un clic la déverrouille, et la palette Paramètres dit la même chose en passant à Évaluer.
