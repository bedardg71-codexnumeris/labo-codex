# La file des correctifs

Tenue par Claude Code pendant l'essai de la boucle sans relais, du 3 au 10 nov. 2026. Mode d'emploi : `BOUCLE-SANS-RELAIS.md`.

**Repère des rapports de Grégoire** (`Retours des testeurs/gregoire/`) : lus jusqu'au 3 nov. 2026, 11 h 00 min 29 s, inclus (les deux du 3 nov. versés par Cowork, ci-dessous).

## À faire

Versées par Cowork le 3 nov. à 10 h 15, sur l'accord de Grégoire (10 h 09) : les rapides encore vraies qui passent par la boucle, d'après `VERIFICATION-LISTE-2026-11-03.md` (preuves, fichiers et lignes y sont ; relis-les dans le code avant de corriger, la vérification date de `af6e1c73`). L'ordre est celui de Cowork : la sécurité d'abord, puis ce que Grégoire voit en évaluant, puis l'hygiène.

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

- **Les messages rouges restent jusqu'à « OK »** (versée par Cowork le 3 nov. à 16 h 38 ; proposition, pas encore acceptée). Vécu le 3 nov. vers 16 h 20 : après l'import des reprises, le toast vert « 13 fichier(s) importé(s) » s'est posé sur le rouge « Jetons non appliqués », que Grégoire n'a pas eu le temps de lire. Il a suggéré une confirmation « OK ». Mesuré : `js/utils-notifications.js` affiche tout au même endroit (`.notification-succes`, `top: 20px; right: 20px`, `styles.css` ~6930), sans empilement, et retire chaque toast seul (vert et info 3 s, orange 4 s, rouge 5 s) ; environ 170 appels à `notifications.erreur`. Recommandation de Cowork : rouge et orange restent jusqu'à « OK » ; vert et info partent seuls ; les toasts s'empilent au lieu de se recouvrir. Question à lui poser : « Les messages rouges et orange restent-ils affichés jusqu'à ce que tu touches OK, le vert partant seul ? »

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

- **Fin du passage** : release 1.231.1 (build 1103-1338, `b789ee32`), Nouvelles validées par Grégoire. Verdict du Mac vert sur `b789ee32` : 1 358 essais, 1 353 verts, 1 vert au second essai, 4 rouges connus, 23 sautés. Poussée sur `origin/main` le 3 nov. vers 15 h 35. Porte terrain : `PORTES-TERRAIN-2026-11-03-boucle.md` (reprises de l'Artefact 6, corbeille au doigt, défilement d'Annoter), à publier par Cowork.

Passage du 3 nov. 2026, soir (Claude Code, à partir de 16 h 40) :

- **6 bis. Reprise sans évaluation** (hors boucle, décision de Grégoire du 3 nov., 16 h 35) : importée avec « Jeton de reprise » pour une élève qui n'a aucune évaluation de cette production, la copie devient son original ; plus de message rouge « Jetons non appliqués », le message vert de l'import dit « aucune évaluation à reprendre, la copie devient l'original pour : … » ; évaluée, puis un autre import, elle reste l'original et aucun jeton n'est consommé. **Stock** : la copie de l'élève du 3 nov. (écrite comme reprise) bascule au prochain import, qu'elle soit évaluée ou non : une évaluation née après l'import de la copie (`dateEvaluation`, posée à la création seulement) est la sienne. Relecture neuve : VERT AVEC RÉSERVE (la copie évaluée avant le prochain import recevait encore un jeton), corrigée dans `22cd095d`. **Suppositions à valider par Cowork, puis Grégoire** : (a) si l'élève avait déjà une copie ordinaire non évaluée pour cette production, la reprise devient un second original (deux copies ordinaires) ; (b) même chemin pour une copie marquée « reprise » à la main sans évaluation (`liste-evaluations.js`, `appliquerJetonRepriseSurCopie`) : elle redevient ordinaire au prochain import du groupe. **Relecture croisée de Cowork due avant le verdict** (règle 2 de `PROTOCOLE.md`). Mots d'écran : à soumettre. (`9e0e7593`, `22cd095d`, #1223)
- **7. PDF de la grille** : le nom du critère en gras, ses éléments observables (et sa description, « Desc. critères » coché) en maigre, comme l'aperçu ; même place, la graisse seule (rendu comparé avant/après). Une rangée coupée entre deux pages garde l'ancien dessin, tout en gras. Relecture neuve : VERT AVEC RÉSERVE (colonne étroite d'une cartouche : un mot coupé laissait la case toute en gras), corrigée dans `82477d10`. (`6f50c33f`, `82477d10`, #1129)

- **8. Deux « Total »** : dans « Apporter mon matériel », une grille à deux sous-totaux (« / 70 » puis « / 30 ») affiche « ton total : 100 ✓ » au lieu de « 30 : écart » ; un total général, répété ou courant tombe aussi juste. Relecture neuve : VERT AVEC RÉSERVE (trois « / 100 » ou « / 70 » puis « / 100 » donnaient un faux écart), corrigée dans `60cc1c80`. (`27142de1`, `60cc1c80`, #1106)
- **9. Plage de niveau** : une plage tapée hors de 0 à 100 (80 à 120, ou −10) empêche « Créer ma grille », avec la raison « la plage de notes d'un niveau » ; les échelles déjà créées ne changent pas. Relecture neuve : VERT AVEC RÉSERVE (la raison ne dit pas « de 0 à 100 » : mot d'écran, proposé ci-dessous). Trouvaille de la relecture : la note retenue d'un niveau n'est pas bornée à 0–100 (un avertissement seulement) ; notée ici, pas inscrite (aucun symptôme vécu). (`d88c9f9f`, #1105)
- **10. Raisons nommées** : « des points en nombre entier de 0 à 100 pour un critère (« Rigueur fictive ») », de même pour la pondération, le nom absent et « au plus 30 éléments observables par critère (« … ») ». Relecture neuve : en cours à l'arrêt du passage. (`4c0074eb`, #1107)

**Mots d'écran à soumettre à Grégoire** (passage du 3 nov., soir) :
1. 6 bis, dans le message vert de l'import : « aucune évaluation à reprendre, la copie devient l'original pour : Prénom Nom ». Remplace le rouge « Jetons non appliqués … le jeton doit être appliqué manuellement ».
2. 10, dans la dissection : les quatre raisons suivies du critère entre parenthèses ; « sous-critères » y devient « éléments observables » (le mot de la dissection).
3. Proposé, pas codé (réserve de 9) : « la plage de notes d'un niveau » → « une plage de notes entre 0 et 100 pour un niveau ».

**Arrêt du passage, 3 nov. au soir** : cinq entrées faites (6 bis à 10), contexte de session chargé ; le passage suivant reprend à l'entrée 11. Avant la vérification : **relecture croisée de Cowork sur 6 bis** (`9e0e7593`, `22cd095d`), règle 2 de `PROTOCOLE.md` ; puis les mots d'écran ci-dessus et les Nouvelles.

- L'onglet Évaluation ne chargeait que la liste des évaluations (rapport du 2 nov., 17 h 04) : **résolu par un simple rechargement**, dit Grégoire le 3 nov. à 7 h 03 ; rien à corriger. À rouvrir si le défaut revient. (`BUG__grégoire__2026-11-02_17-04-55.txt`)

## Déjà sur `main`, à porter aux prochaines Nouvelles

> 3 nov., 15 h 35 : les trois ci-dessous sont portés aux Nouvelles de la 1.231.1 et en ligne. Leur porte iPad est au §2 bis de `PORTES-TERRAIN-2026-11-03-boucle.md`.

- Deux doigts font défiler la copie après un détour (#1218, `af6e1c73`) : poussé sur `origin/main` le 2 nov. au soir, sans release ; sa porte terrain sur l'iPad reste due.
- En Annoter et en Évaluer, la page défile de nouveau (#1219) ; dans la compacte d'Annotation, Annuler, Supprimer et Rétablir descendent en bas (#1220) : `d5111b09` et `835b99fb`, poussés sur `origin/main` le 3 nov. au matin, sans release ; faits hors de la file, à la demande directe de Grégoire. Porte terrain sur l'iPad due.
