# Relecture croisée de Cowork – carte d'alignement, lots #963 à #966

> Relayée par Grégoire le 28 septembre 2026 ; versée au dépôt par Claude Code. Texte de Cowork reproduit tel quel sous la ligne ; les **dispositions** (en fin de fichier) sont de Claude Code.

---

Relecture croisée de Cowork sur les quatre branches claude/carte-alignement-963 à 966 (commits 4b1d18ce, 70dfb20b, a1fcda4e, e7e63856). Verdict : à compléter. Vitest mesuré par Cowork : 963 seul 645/7511 verts ; 966 seul 647/7541 verts ; 966+963 fusionnés 648/7556 verts. Textes validés identiques (modèle IA octet pour octet, pages du guide). Liens « se vérifie par » existants toujours stockés, affichés, comptés. Retouches à faire, chacune avec son essai et sa mutation rouge :

R1 (#963) : dans liensEnPhrases (js/planification-export.js), chaque phrase d'un lien agrégé sur les clones est écrite avec designation(nd) au lieu de designation(inst). Un clone en semaine 6 d'une activité reliée en semaine 2 écrit donc « (Activité, semaine 6) se vérifie par … (semaine 4) », un lien qui n'existe pas, et l'IA signalera un faux « évalué avant d'être enseigné ». Correctif : designation(inst), puis dédoublonner sur la phrase (aujourd'hui un original et son clone reliés à la même évaluation donnent deux fois la même phrase). Ajouter un clone à la fixture ; mutations designation(nd) et instances=[nd] → rouges (la seconde survit aujourd'hui). Dans le même banc : ajouter à la fixture du Cadre un jour semaine-planification et un jour semaine-examens (la mutation « nombreSemainesTrimestre compte toutes les rangées » survit aujourd'hui).

R2 (#964) : la duplication (copier, planification-carte.js ~l. 3769) remplit correspondanceObjectifs pendant la copie en profondeur. Si la leçon B, dont l'évaluation coche oA, précède la leçon A dans enfants de la séquence, l'évaluation copiée garde l'oA de l'original. Correctif : deux passes (bâtir toute la correspondance des objectifs du sous-arbre, puis copier). Essai : B avant A dans enfants → l'évaluation de B′ coche oA′.

R3 (#964) : trois protections du lot ne sont gardées par aucun essai (mutations survivantes). (a) PRIORITAIRE : les groupes « déjà cochés » de l'Inspecteur (~l. 3018). Sans eux, appliquerCasesServies réécrit la liste avec les seules cases visibles, et un objectif coché mais non proposé serait effacé en silence au premier clic sur une autre case. Essai : une évaluation coche l'objectif d'une leçon devenue postérieure ; on coche une autre case ; l'objectif reste. (b) La garde « Déjà coché » (~l. 4220) : sans elle, l'id est écrit en double et l'infobulle dit « Vérifie 2 objectifs ». (c) leconEstAvant avec <= (même semaine et même séance comptées « avant »).

R4 (#965) : quatre branches de evaluerPastilleEvaluation sans essai (mutations survivantes) : le ✕ doit l'emporter sur un ⚠ déjà trouvé (retrait de « && pire === 'avant' » ; le banc coche toujours ⚠ avant ✕, essayer ['oJ','oT']) ; séance non posée → avant + inconclusif ; leçon de l'évaluation sans semaine → avant + inconclusif ; évaluation hors leçon → inconclusif levé.

R5 (fusion) : 963 part de df359bfe, indépendante de 964→965→966. Une seule version pour les quatre. Le seul conflit est dans index.html, sur les jetons de planification-carte.js et planification-export.js. Le contenu fusionné n'égale aucune version déjà jetonnée : prendre des jetons neufs, pas l'un des deux.

Tranché par Cowork, sans code : rien ne nettoie objectifsServis quand un bloc change de leçon. Une évaluation déplacée, copiée, hors leçon ou posée dans une séquence compte désormais l'objectif qu'elle cochait (sur main, il était écarté à la lecture). C'est cohérent avec le modèle, et l'objectif est visible et décochable dans le groupe « déjà coché ». L'ajouter au § 6 de la demande #964, à côté du clone.

À inscrire au BACKLOG (issue 2) : la carte démo porte deux liens se_verifie_par vers une évaluation (demo-namespace.js l. 86, 90) ; la pastille coûte ~21 ms par sauvegarder() sur 720 nœuds, parce que indexObjectifsCarte est reconstruit pour chaque évaluation (le calculer une fois par passe) ; aria-label posé sur un span sans role, pour les deux pastilles ; le défaut de semaine du panneau modèle IA n'est gardé par aucun essai navigateur.

En attente des mots de Grégoire, ne pas toucher : l'infobulle planif-design-apprentissages (accompagnement-contenu-hover.js l. 622), fausse depuis #964, qui doit partir dans la même version.

Ordre : R1 à R4 → fusion avec jetons neufs → Vitest complet → verdict WebKit sur le Mac → push. Pas de nouvelle relecture si chaque mutation demandée est rouge.

---

## Dispositions (Claude Code, 28 sept. 2026)

| Point | Disposition | Où |
|---|---|---|
| R1 | **Fait.** `designation(inst)`, dédoublonnage sur la phrase ; clones en semaines 6 et 4, Cadre avec planification et examens. Mutations rouges : `designation(nd)`, `instances = [nd]`, dédoublonnage retiré, toutes les rangées comptées. `reconstruireIndexClones` exposé (fonction existante, idempotente) pour que le banc exerce les vrais clones. | `a3e0d5b4` |
| R2 | **Fait.** Passe préparatoire sur tout le sous-arbre, puis copie. Essai B avant A. Mutations rouges : une seule passe ; passe préparatoire neutralisée. | `4b3d3f81` |
| R3 | **Fait.** (a) rubriques sorties dans `leconsInspecteurEvaluation` : essai de la fonction ET essai navigateur du scénario décrit (mutation du branchement de l'Inspecteur rouge au navigateur) ; (b) et (c) : essais, mutations rouges. | `4b3d3f81` |
| R4 | **Fait.** Quatre essais ; cinq mutations rouges (dont « séance non posée = après »). | `844a55e3` |
| R5 | **Fait.** Branche `claude/carte-alignement-fusion-963-966` depuis `main` (`df359bfe`, inchangé). Jetons neufs `20260927e` pour la carte et l'export : **au jour du build en cours** (0927), exigé par `sentinelle-anticache-fichiers-modifies` ; un premier choix au jour du calendrier (`20260928e`) l'a fait rougir. Lettre `e` jamais servie pour ces deux fichiers (vérifié sur l'historique). | branche de fusion |
| Tranché | **Ajouté** au § 6 de la demande #964, point (4). | `4b3d3f81` |
| BACKLOG | **Inscrits** : #970 (démo), #971 (index recalculé), #972 (`aria-label`), #973 (défaut de semaine). | branche de fusion |
| Infobulle | **Non touchée**, en attente des mots de Grégoire ; doit partir dans la même version. | – |
| Ordre | Vitest complet sur la fusion : voir `RELAIS.md`. **Verdict WebKit et push : sur le Mac.** | – |
