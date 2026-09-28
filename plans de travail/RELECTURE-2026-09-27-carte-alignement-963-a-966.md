# Relecture croisée – carte d'alignement, lots 1 à 4 (#963 à #966)

> Écrite le 27 septembre 2026, à 21 h 07 (Toronto), par Cowork. Branches lues : `claude/carte-alignement-963-relire-par-ia` (`4b1d18ce`), `…-964-badges-objectifs` (`70dfb20b`), `…-965-evaluation-trop-tot` (`a1fcda4e`), `…-966-guide` (`e7e63856`), telles que récupérées sur le Mac (le `fetch` de Cowork n'a pas d'accès réseau : si une session a poussé après 17 h 28, ces commits ne sont pas relus). Demandes lues : les quatre `DEMANDE-RELECTURE-2026-09-27-lot-96x-*.md`. Cartographie faite sur `df359bfe` (état avant) : `evaluerBadge`, `evaluerObjectif`, `VERBES_AUTO`, `objectifsServisPar`, la duplication, l'Inspecteur, `GUIDE_PAGES`, les aides d'accompagnement.

## Verdict : **à compléter** – quatre retouches dans les lots (R1 à R4), une fusion à tokens neufs (R5), un texte d'aide faux à la sortie (R6, mots à Grégoire)

- **Vitest, par exécution**, sur des clones jetables :
  - `966` seul (contient 964 et 965) : **647 fichiers, 7 541 / 7 541** ; `963` seul : **645 fichiers, 7 511 / 7 511** (chiffres des demandes confirmés).
  - **Les quatre fusionnés** (966 + 963, conflit résolu, voir R5) : **648 fichiers, 7 556 / 7 556**, code 0. C'est l'arbre qui partira.
- Playwright / WebKit : **pas à ma portée**, lu seulement. Le verdict WebKit complet se prend sur le Mac, **sur l'arbre fusionné, après R1 à R6**, dernier geste avant le push (règle 2).
- **Textes validés** : identiques, mesurés octet pour octet – consignes du modèle IA (#963, sha256 égaux, la copie du banc aussi) ; pages 1, 4, 8 du guide ; lignes des pages 2 et 6 à leur place ; neuf pages ; pages 3, 5, 7, 9 intactes.
- **Aucune écriture** dans les chemins de lecture des lots 1 et 3 (lu : `slice` avant tri, tableaux locaux ; test d'empreinte vert).
- **Liens « se vérifie par » existants** : toujours stockés (seul `s_acquiert_par` est réécrit au chargement), affichés, comptés. Non négociable tenu.
- Jetons `?v=` montés pour chaque fichier touché, dans chaque lot. Noms fictifs partout. Rien de disciplinaire en dur.
- Sentinelles existantes modifiées (`graphe-enseignement`, `liens-routage`, `421-426`) : mises à jour légitimes, pas d'affaiblissement (chaque assertion retirée est remplacée, motif écrit).

## R1 – #963 : un lien d'un clone est écrit à la semaine du clone (code du lot, à corriger)

`liensEnPhrases` (`js/planification-export.js`) agrège les liens de toutes les instances, mais écrit chaque phrase avec `designation(nd)` au lieu de `designation(inst)`. Mesuré : clone de « Repérage » en semaine 6, l'original (semaine 2) relié à « Carnet n°1 » (semaine 4) → sous le clone : « « Repérage » (Activité, semaine 6) se vérifie par « Carnet n°1 » (…, semaine 4). » Ce lien n'existe qu'en semaine 2. L'IA signalera un faux « évalué avant d'être enseigné », exactement ce que la consigne lui fait vérifier ; le fichier se contredit aussi (sous l'évaluation, le même lien est en semaine 2). Original et clone reliés tous deux à la même évaluation : phrase en double (la clé contient `inst.id`).
⮕ `designation(inst)` ; dédoublonner sur la phrase. **Essai** : un clone dans la fixture ; **mutations** : `designation(nd)` remis → rouge ; `instances = [nd]` → rouge (survit aujourd'hui : la fixture n'a aucun clone).
⮕ Même lot, banc seulement : la fixture du Cadre n'a que des jours de cours ; `nombreSemainesTrimestre` qui compterait toutes les rangées survit. Ajouter un jour `semaine-planification` et un jour `semaine-examens` → la mutation doit rougir.

## R2 – #964 : la duplication dépend de l'ordre des leçons (code du lot, à corriger)

`copier` (duplication, `planification-carte.js` ~l. 3769 de la branche 964) remplit `correspondanceObjectifs` en profondeur, pendant la copie. Si la leçon B (qui porte l'évaluation cochant oA) précède la leçon A dans `enfants` de la séquence, `correspondanceObjectifs.get(oA)` est vide au moment de copier l'évaluation : elle garde l'oA de **l'original**, et la copie vérifie un objectif de l'autre séquence. Lu au code ; mesuré par le sous-relecteur.
⮕ Deux passes : bâtir toute la correspondance des objectifs du sous-arbre, puis copier. **Essai** : séquence dont B précède A dans `enfants` → l'évaluation de B′ coche oA′ ; **mutation** : une seule passe → rouge.

## R3 – #964 : trois protections écrites par le lot ne sont gardées par aucun essai

Mutations exécutées, toutes **survivantes** :
- **Les groupes « déjà cochés » de l'Inspecteur retirés** (l. ~3018). C'est une protection contre une **perte silencieuse** : `appliquerCasesServies` réécrit la liste avec les seules cases visibles ; sans ces groupes, un objectif coché qu'on ne voit plus serait effacé au premier clic sur n'importe quelle case. ⮕ Essai (Vitest ou navigateur) : évaluation qui coche l'objectif d'une leçon devenue postérieure ; cocher une autre case ; l'objectif reste. Mutation → rouge. **Prioritaire** (limite du 20 sept. : aucun effacement irréversible).
- **La garde « Déjà coché »** (l. ~4220) retirée : l'id s'écrit en double, l'infobulle dit « Vérifie 2 objectifs ». ⮕ Essai + mutation.
- **`leconEstAvant` avec `<=`** (même semaine, même séance comptée « avant ») : ⮕ un essai.

## R4 – #965 : quatre branches de la pastille sans essai

Mutations exécutées, **survivantes** : M1 `&& pire === 'avant'` retiré (le banc coche toujours ⚠ avant ✕ ; avec `['oJ','oT']` le mutant afficherait ⚠ au lieu de ✕) ; M3 séance non posée → « après » ; M4 leçon de l'évaluation sans semaine → « après » ; M5 évaluation hors leçon sans `inconclusif`. ⮕ Quatre assertions, chacune avec sa mutation rouge.

## R5 – la fusion : un conflit, des jetons neufs

963 part de `df359bfe`, indépendante de 964→965→966. Fusion d'essai (966 puis 963) : **un seul conflit, `index.html`, les jetons** de `planification-carte.js` et `planification-export.js`. Le contenu fusionné des deux fichiers n'est égal à aucune des versions déjà jetonnées : **jetons neufs** (dans mon essai : `20260927e` et `20260927c`), pas l'un des deux. Recommandation : **une seule version** pour les quatre lots (le lot 4 ne part jamais sans 2 et 3 ; une livraison par séance).

## R6 – un texte d'aide devient faux à la sortie (mots : à Grégoire)

`js/accompagnement-contenu-hover.js` l. 622 (`planif-design-apprentissages`) : « relie-la à ce qu'elle vérifie (idées maîtresses, connaissances ou activités) ». Faux dès #964. Signalé par la demande #966, non corrigé. Il doit partir **dans la même version**. Texte proposé par Cowork (reprend les mots du lot 2) : « Vérification : l'évaluation ferme la boucle — coche dans son Inspecteur les objectifs qu'elle vérifie, ceux de sa leçon ou d'une leçon placée avant elle. » (la suite de l'infobulle, sur la visée, inchangée).

## Tranché par Cowork (technique, dit en une ligne)

- **Un troisième effet non déclaré de #964, gardé tel quel.** Rien ne nettoie `objectifsServis` quand un bloc change de leçon ; sur `main`, ces ids étaient écartés à la lecture. Une évaluation **déplacée, copiée, hors leçon ou posée dans une séquence** compte désormais l'objectif qu'elle cochait : son « ! » peut devenir ✓, un ⚠ d'idée maîtresse peut se lever. C'est cohérent avec le nouveau modèle, et l'objectif est **visible et décochable** dans l'Inspecteur (groupe « déjà coché »). ⮕ Pas de code ; l'ajouter au § 6 de la demande #964, à côté du clone. Fréquence réelle sur ses cartes : non mesurée.
- `inconclusif` n'a aucun consommateur à l'écran : conforme à la consigne ; la question reste à Grégoire (ci-dessous).

## À inscrire (issue 2, pas dans ces lots)

- **Carte démo** : deux liens `se_verifie_par` vers une évaluation (`js/demo-namespace.js` l. 86, 90) : la démo montre l'ancien geste.
- **Coût de la pastille** : ~21 ms par passe (720 nœuds, 60 évaluations, Node), relancée à chaque `sauvegarder()` ; chaque évaluation reconstruit `indexObjectifsCarte`. Calculer l'index une fois par passe. Inférence : 2 à 4 fois plus sur iPad.
- **`aria-label` sur un `<span>` sans `role`** : pastille d'évaluation et pastille d'objectif (#445), ensemble.
- **#963, navigateur** : le spec choisit toujours la semaine 3 ; le défaut du panneau (`parDefaut || borne`) n'est gardé par aucun essai. Une leçon en semaine 17 sur un Cadre de 15 donnerait « semaine 17 sur 15 » (lu, aucun symptôme).

## À Grégoire, une question à la fois, dans cet ordre

1. **R6** : le texte proposé ci-dessus (posée dans la conversation le 27 sept. au soir).
2. Les mots de #964 (§ 5 de sa demande) et le titre « Pastille de l'évaluation » (#965, § 6) : acceptés en séance Claude Code ? Rien dans le dépôt ne le dit (pour #963, un commit le dit).
3. Guide, page 5 (hors textes validés) et définition du terme « Leçon » (`accompagnement-contenu-terme.js` l. 364) : retoucher ou non. Recommandation de Cowork : retoucher la seule phrase fausse pour une évaluation (« Le bloc doit être dans la même leçon que l'objectif »), dans la même version.
4. #965 : leçon sans semaine → ✓ par défaut, ou une pastille distincte.
5. #965 : les couleurs, à l'écran.

## L'ordre qui suit

Retouches R1 à R4 (et R6 une fois les mots acceptés) → fusion avec jetons neufs (R5) → Vitest complet → **verdict WebKit sur le Mac** → push. Pas de nouvelle relecture si chaque mutation demandée est rouge.
