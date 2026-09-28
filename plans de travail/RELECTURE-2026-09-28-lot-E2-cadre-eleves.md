# Relecture croisée – lot E2 (Cadre et étudiant·es), relecture finale

> Écrite le 28 septembre 2026, à 13 h 58 (Toronto), par Cowork. Répond à `DEMANDE-RELECTURE-2026-09-28-lot-E2-cadre-eleves.md` (branche `lot-e2-cadre-eleves`, tête `9154df66`). Fichier non suivi sur `main`, nom distinct de ceux de la branche.

## Verdict : **vert après R1** ; puis les mots et la question du DA à Grégoire (Cowork les pose), les Nouvelles, et le verdict WebKit complet

## Ce qui a été vérifié, par exécution

Clone jetable de `9154df66` (Linux, dépendances installées à part). Les six bancs du lot : **65 / 65**. Mutations rejouées par Cowork, indépendantes des tiennes :

| Mutation | Résultat |
|---|---|
| Un champ d'étudiant·e écrit pendant un ajout (garde de `sauvegarderChampEtudiantV2` retirée) | rouge |
| Un échec d'écriture d'une fiche d'étudiant·e suivi du message de réussite (le `catch` n'arrête plus) | rouge |
| Le registre des trimestres modifié sans copie (identification) | rouge (essai d'échec d'écriture) |
| **Les horaires modifiés sans copie** (`trimestre-v2-horaires.js` l. 964) | **survit** |
| **Les groupes-cours modifiés sans copie** (`trimestre-v2-groupes-cours.js` l. 726) | **survit** |

Lu : les deux gardes #379 inchangées ; le cadre écrit sous l'id en vigueur ; la question cours → service ; le DA jugé à la création et seulement s'il change en édition (#914) ; le doublon L-8 dans la file ; l'identité masquée en anonymisation réécrite depuis la base (lot A).

## R1 – deux décisions du § 4 sans garde

« La collection lue est copiée avant d'être modifiée » est une décision juste, mais seul le registre des trimestres est gardé par un essai. ⮕ Un essai d'échec d'écriture pour un horaire et pour un groupe-cours : après l'échec, `db.getSync` rend la collection d'avant. Mutations ci-dessus → rouges.

## Une limite à écrire au § 5 (pas de code)

« Session et année ensemble » ne couvre que l'année vide ou invalide. Changer la session **garde l'année en place**, donc la paire intermédiaire est valide et s'écrit : passer de a2026 à h2027 sur un trimestre vide écrit h2026 puis h2027 ; si **h2026 existe déjà**, la collision refuse au premier geste, et il faut changer l'année d'abord. Sans perte (les gardes tiennent, le trimestre est vide ou le changement est bloqué) ; cas étroit (trimestre vide, paire intermédiaire prise). Tranché par Cowork : gardé, écrit au § 5, pas de porte.

## À Grégoire (Cowork, une question à la fois)

1. **Changer le DA d'une fiche existante – tranché par Grégoire à 14 h 01 : refusé en modification.** Motif : les évaluations et présences resteraient sous l'ancien DA. En édition, le champ DA n'est plus modifiable (lecture seule, y compris au clavier et par le formulaire), et une phrase sous le champ dit pourquoi (mots soumis à Grégoire avec le § 6). Essai : une fiche existante, le DA ne change pas en base quoi qu'on fasse du champ ; mutation (champ rendu modifiable) → rouge. Inscris une fiche (issue 2) : « corriger une coquille de DA sans détacher les évaluations ni les présences » – le souhait de Grégoire : une coquille corrigée garde ses données. Le cas du DA « DEMO015 » non conforme du pack démo reste modifiable sur ses autres champs (règle #914 inchangée).
2. **Les mots du § 6 – acceptés par Grégoire à 14 h 02**, tels quels, avec deux ajouts :
   - sous le DA d'une fiche existante, mot pour mot : « Le DA ne se modifie pas ici : il relie les évaluations et les présences de l'étudiant·e. »
   - « Étudiant introuvable : … Resélectionne l'étudiant. » devient « Étudiant·e introuvable : la liste a changé depuis l'ouverture du formulaire. Resélectionne l'étudiant·e. »
   Le relevé des `alert` : accepté (les non touchés restent, #975 pour la bibliothèque).
3. **Les Nouvelles – acceptées par Grégoire à 14 h 03**, mot pour mot :
   - titre de l'entrée : « Cadre : créer ou modifier »
   - texte : « Cadre : le trimestre, ton profil, un cours, un horaire, un groupe-cours ou la fiche d'un·e étudiant·e s'enregistrent tout seuls, champ par champ ; le témoin le dit. Pour en créer un nouveau, un bouton nomme le geste (« Créer le cours », « Ajouter l'étudiant·e »), et l'application te prévient si tu fermes la fiche ou recharges la page avant. « Annuler » devient « Fermer ». Le DA d'une fiche existante ne se modifie plus : il relie ses évaluations et ses présences. »

## La suite

R1 et le DA en lecture seule (essai + mutation) → Vitest → release `minor` avec ces Nouvelles → verdict WebKit complet (Grégoire ferme Cowork et ses navigateurs) → fusion en avance rapide → push → porte terrain (Cowork publie l'artefact). Pas de nouvelle relecture si R1 et le DA sont posés comme dit ; montre les deux mutations rouges dans ton rapport.
