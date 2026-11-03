# La file des correctifs

Tenue par Claude Code pendant l'essai de la boucle sans relais, du 3 au 10 nov. 2026. Mode d'emploi : `BOUCLE-SANS-RELAIS.md`.

**Repère des rapports de Grégoire** (`Retours des testeurs/gregoire/`) : lus jusqu'au 3 nov. 2026, 11 h 00 min 29 s, inclus (les deux du 3 nov. versés par Cowork, ci-dessous).

## À faire

Versées par Cowork le 3 nov. à 10 h 15, sur l'accord de Grégoire (10 h 09) : les rapides encore vraies qui passent par la boucle, d'après `VERIFICATION-LISTE-2026-11-03.md` (preuves, fichiers et lignes y sont ; relis-les dans le code avant de corriger, la vérification date de `af6e1c73`). L'ordre est celui de Cowork : la sécurité d'abord, puis ce que Grégoire voit en évaluant, puis l'hygiène.

### 7. Dans le PDF de la grille (reprise au prochain passage : la première case est à dessiner à la main dans jsPDF, `didDrawCell`), les éléments observables ne sont plus en gras (#1129)
`js/export-pdf.js` ~2713 et ~2818 : toute la colonne 0 en gras. La graisse seule ; aucun mot ne change.

### 8. « Apporter mon matériel » : deux lignes « Total » ne créent plus de faux écart (#1106)
`js/materiel-dissection-lecture.js` ~537 ; l'écart s'affiche en `js/materiel-dissection.js` ~1200.

### 9. « Apporter mon matériel » : une plage de niveau reste entre 0 et 100 (#1105)
`js/materiel-assistant.js` ~77 : `plageValide` ne vérifie que min ≤ max. Borner à la saisie ; les échelles déjà créées restent telles quelles.

### 10. « Apporter mon matériel » : les raisons nomment les critères en cause (#1107)
Quatre raisons de `js/materiel-assistant.js` (~123, 131, 139, 155), relayées par `raisonDissection`. Mots d'écran : à soumettre en fin de file.

### 11. Une grille à niveaux dont les pondérations ne font pas 100 ne s'affiche plus en « % » trompeur (#1104)
`js/grilles.js` ~832 et ~1356. ⚠ L'avertissement « pas 100 % » a été voulu par #483 : si le correctif le retire, mets l'entrée de côté avec la question.

### 12. Les pastilles « À réévaluer », « Non verrouillée », « Incomplet » se lisent (#1162)
`styles.css` ~27304 et ~27585 : texte blanc sur l'orange d'attention, 4,0 pour 1 en clair, 2,4 pour 1 en sombre. Viser 4,5 pour 1 dans les deux modes.

### 13. Conception › Productions nomme le cours de chaque production (#1171)
`js/productions-liste.js` ~57 ; le tableau lit tout le stock (`js/productions.js` ~248).

### 14. En démo, sur l'iPad couché, « Non enregistré » ne couvre plus la barre de séance des présences (#1181)
Les quatre cas sont à la baseline (`scripts/playwright-baseline.json`). Déplacer le témoin ; la bulle validée ne change pas. Les retirer de la baseline une fois verts.

### 15. Après un partage annulé, le bandeau rouge se ferme quand « Télécharger à la place » prend la suite (#1185)
`js/codex.js` ~3702, ~3626, ~3716.

### 16. « Mettre tout le monde présent » saute les élèves inactifs (#1196)
`js/saisie-presences.js` ~1831. **La source seulement.** Les présences déjà écrites pour des inactifs touchent ses données : mesure combien il y en a, puis mets cette partie de côté avec la question.

### 17. La liste écrit le niveau RàI d'un élève qui n'a que son diagnostic (#1205)
`js/etudiants.js` ~1240 exige A et C ou P ; le profil, lui, montre le niveau. Aligner sur le profil.

### 18. « 1 étudiant·e en Développement montre » : le verbe s'accorde (#1208)
`js/tableau-bord-apercu.js` ~978 et ~991.

### 19. Le message du profil ne nomme plus le portfolio en standards sans artefact (#1188)
`js/profil-etudiant-actions.js` ~166. Mots d'écran : à soumettre en fin de file.

### 20. L'aide dit le vrai défaut de la progression (#1192)
`js/accompagnement-contenu-popup.js` ~904 dit « 5 points » ; le défaut vaut 0,10 (`js/interpretation-config.js` ~28). Mesurer aussi « Sensibilité des flèches ».

### 21. L'aide sur C et P est attachée à la case, pas à la date (#1086, la partie « aide » seulement)
`index.html` ~4920 ; `js/productions.js` ~932. La partie export de #1086 reste hors boucle.

### 22. L'Exploration des pratiques dit la règle des reprises en standards (#588)
`js/pratiques/construction-attributs.js` ~127-142 : la sommative la dit (~118), pas Standards.

### 23. Un document reçu par partage dit qu'il est une copie indépendante (#696)
`js/partage-export.js` ~238-283, `js/partage-import.js` ~561-640. La phrase de Grégoire est dans la fiche du BACKLOG. Ne touche pas au format.

### 24. Le repère « build vu » s'écrit une seule fois (#859)
`js/init-inline.js` ~189, ~197 et ~431.

### 25. Une page d'erreur en français (#799)
Aucun `404.html` ; la liste blanche de `construire-publication.mjs` ~21 n'en prévoit pas. Mesurer d'abord si le cas vécu (hôte non résolu) passerait par cette page ; sinon, dis-le et passe. Mots d'écran : à soumettre en fin de file.

### 26. La couleur `--vert-principal` existe (#1050)
4 usages sans repli : `js/pratiques-gestion.js` ~2763, `js/evaluation-retroaction.js` ~499 et ~513, `js/profil-etudiant-sections-affichage.js` ~1286. Ces quatre-là seulement ; le reste des couleurs indéfinies est #813 et #595.

### 27. Quatre classes CSS posées sans règle (#870)
`.profil-texte-petit-gris`, `.u-text-center-gris`, `.travaux-badge-annote`, `.note-presence-editable` : mesurer l'effet visible d'abord.

### 28. Les fonctions du profil sans appelant (#869)
Neuf restent (voir la vérification). Code mort : le retirer, après la preuve qu'aucun écran n'y mène.

### 29. « ← Utiliser » sur un tampon intégré n'écrit pas de doublon (#1167)
`js/tampons-bibliotheque.js` ~155-160. La garde ; aucune donnée existante à reprendre.

### 30. L'essai de la carte d'alignement ne suppose plus un Mac (#1115)
`tests/integration/planif-menu-vue.spec.js` ~447 et ~574 attendent ⌘. Lire la plateforme ; retirer les deux essais de `playwright-baseline-linux.json` une fois verts. Aide la bascule de la vérification vers GitHub.

### 31. Le skill `alignement` porte les réponses du 28 août (#589)
`.claude/skills/alignement/SKILL.md` ~98, ~133-141, ~293. Documentation seulement.

## Mises de côté (attendent Grégoire)

Aucune.

## Fait

Passage du 3 nov. 2026 (Claude Code, à partir de 11 h 23) :

- **0. Ménage** : au `BACKLOG.md`, les 21 fiches cochées, chacune avec « vérifié le 3 nov. 2026 (VERIFICATION-LISTE-2026-11-03.md) » et sa raison ; #1221 et #1222 inscrites. (`29215d7f`)
- **0 bis. Anonymisation à l'import** : déposées en mode normal puis anonymisées, les copies de l'étape Optimisation (« Aperçu », « Informations du fichier », « Doublons détectés ») et la fenêtre « Retirer … de la liste ? » montrent « Élève N », plus aucun vrai nom ; revenu au mode normal, le vrai nom revient. Relecture neuve : VERT AVEC RÉSERVE (la fenêtre de retrait), corrigée dans `d4df60fd`. Trouvaille : `genererHTMLFileDAttente` (`js/travaux-import.js`) lit encore l'instantané, mais son conteneur n'existe nulle part (code mort, niveau 3). (`bfcd9324`, `d4df60fd`, #1221)
- **0 ter. Lot de reprises** : un lot « Jeton de reprise » de l'Artefact 6 ne demande plus de renommer ni d'intégrer chaque copie à la confirmation ; deux reprises du même élève hors d'un même document restent signalées ; l'original et son évaluation restent intacts (essai). Relecture neuve : VERT AVEC RÉSERVE (la règle « reprise et remise ordinaire dans la file » sans essai), essai ajouté. Trouvaille de la relecture, déjà connue de l'entrée : l'évaluation d'origine n'est gardée que si la pratique est réglée sur « archiver » (le défaut) ; rien à inscrire. (`ec83d1bb`, `1a4e125b`, #1222)
- **1. Bilan** : un titre de production ou un code de niveau piégé ressort en texte dans le bilan (« Progrès » et jetons) ; en-tête du fichier remis à jour. Relecture neuve : VERT AVEC RÉSERVE (le code du niveau sans essai), essai ajouté. (`ae876a9a`, `7f9afbc2`, #1113)
- **2. Carte RàI** : le défi principal (un nom de critère) ressort en texte dans la carte du profil. Relecture neuve : VERT. Trouvaille : des `data-param="${da}"` non échappés dans la même carte (identifiants, pas des noms) : notée ici, pas inscrite au BACKLOG (aucun symptôme vécu). (`9114c985`, #1197)
- **3. Corbeille de la carte** : un bloc glissé jusqu'à la corbeille, qui vire au rouge, puis relâché, est supprimé (« Annuler » le ramène) ; un simple toucher sur un bloc posé sous la corbeille invisible ne supprime rien ; un drag de groupe ne l'arme plus. Première relecture : VERT AVEC RÉSERVE (le toucher supprimait), corrigée dans `831f6771` ; seconde relecture : VERT AVEC RÉSERVE (garde du groupe sans essai ; un `pointercancel` au-dessus de la corbeille supprimait), corrigée dans `f13234cc` (break-tests faits). Porte iPad due : le doigt réel. (`4427bc36`, `831f6771`, `f13234cc`, #1070)
- **4. Archive des rapports** : un rapport copié, téléchargé ou ouvert dans le courriel est archivé avec sa voie, plus « envoyé » d'office ; rien ne l'affiche à l'écran. Stock : les entrées déjà archivées gardent `envoye: true`, que rien ne lit (assumé). Relecture neuve : VERT AVEC RÉSERVE mineure (courriel trop long, aussi copié), commentée (niveau 3, `8e14223c`). (`5ebed793`, #1068)
- **5. Date des rapports** : un rapport de bug écrit le soir porte la date du jour, dans son identifiant comme dans le nom du fichier TXT (le 26 oct. à 21 h 05 donne `2026-10-26_21-05-27`). Stock : les fichiers déjà écrits gardent leur nom. Relecture neuve : VERT ; constat de niveau 3 commenté (`8e14223c`). (`85bbdc9e`, #812)
- **6. « Nom du critère »** : au Mac, à 1 440 px, un nom comme « Partie A : compréhension – lecture fictive » tient dans son champ (400 px, contre 266) ; le Nom est plus large que la Description ; l'iPad garde sa disposition de #1095. Vérifié : essai à 1 440 px, 47 specs de l'éditeur (198 verts ; deux instables rejoués 3 fois, verts, étrangers au lot) ; une première vérification arrêtée par le système faute de mémoire (journal, 12 h 44). Relecture neuve : VERT AVEC RÉSERVE, entre 1 181 et 1 280 px un nom aussi long reste un peu coupé (le Mac de Grégoire est à 1 470) ; aucun essai ne garde la règle #1095 : noté, pas inscrit (aucun symptôme vécu). (`43e4adff`, #1126)

- L'onglet Évaluation ne chargeait que la liste des évaluations (rapport du 2 nov., 17 h 04) : **résolu par un simple rechargement**, dit Grégoire le 3 nov. à 7 h 03 ; rien à corriger. À rouvrir si le défaut revient. (`BUG__grégoire__2026-11-02_17-04-55.txt`)

## Déjà sur `main`, à porter aux prochaines Nouvelles

- Deux doigts font défiler la copie après un détour (#1218, `af6e1c73`) : poussé sur `origin/main` le 2 nov. au soir, sans release ; sa porte terrain sur l'iPad reste due.
- En Annoter et en Évaluer, la page défile de nouveau (#1219) ; dans la compacte d'Annotation, Annuler, Supprimer et Rétablir descendent en bas (#1220) : `d5111b09` et `835b99fb`, poussés sur `origin/main` le 3 nov. au matin, sans release ; faits hors de la file, à la demande directe de Grégoire. Porte terrain sur l'iPad due.
