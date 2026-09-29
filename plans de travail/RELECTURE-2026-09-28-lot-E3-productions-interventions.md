# Relecture croisée – lot E3 (productions, interventions, volet confidentiel, réglages)

> Écrite le 28 septembre 2026, à 19 h 39 (Toronto), par Cowork. Répond à `DEMANDE-RELECTURE-2026-09-28-lot-E3-productions-interventions.md` et au compte rendu d'étape (branche `lot-e3-productions-interventions`, tête `0a2a8d7f`). Fichier non suivi sur `main`.

## Verdict : **vert**, sans retouche de code ; restent les réponses de Grégoire (ci-dessous), puis release et verdict WebKit complet

## Vérifié par exécution

Clone jetable de `0a2a8d7f`. Les quatre bancs du lot : **43 / 43**. Mutations rejouées par Cowork, toutes **rouges** :
- le report des présences relancé à chaque écriture d'une intervention complétée (2 essais) ;
- la question de complétion contournée ;
- l'écrivain du volet confidentiel sans sa garde d'anonymisation.

Lu : `sauvegarderPresencesIntervention` copie la collection, n'écrit rien sur un id introuvable (par le témoin), ne reporte qu'au passage à « Complétée » ; `surChangementFicheIntervention` pose la question avant, et « Annuler » remet « En préparation » sans rien écrire ; `sauvegarderConfidentiel` refuse d'écrire depuis un volet masqué ; `sauvegarderPreferencesV2` fait parler le témoin après l'écriture ; « restaurés » ne s'affiche qu'après une écriture réussie.

## Tranché par Cowork (technique)

- **Le report au seul passage à « Complétée »** : juste, et c'est ce que la consigne demandait (« n'automatise pas ce report »). Il retire aussi le compte double qu'une date corrigée créait avant le lot.
- **Une limite à écrire** (pas de code) : repasser une intervention « En préparation », changer sa date, puis la remarquer « Complétée » refait le report à la nouvelle date et laisse l'ancienne. Geste délibéré, rare, et la question le signale ; même famille que le point 2 ci-dessous.
- **Le retour d'onglet au lieu de la question** (navigation.js protégé) : accepté ; la perte silencieuse disparaît.
- **`seuilsInterpretation` à `CLES_GLOBALES`**, **`definirPreference` qui rend un résultat** : acceptés (même motif que `enseignants` au lot E2 ; aucun appelant ne lisait le retour).
- **La pastille verte du volet gardée** : acceptée ; elle dit qu'il y a des informations, le témoin dit « Enregistré ».
- **Fiche à inscrire (issue 2)** : « GitHub : les passages Playwright planifiés échouent ou sont annulés depuis le 21 sept. ; seul le verdict local juge ».

## À Grégoire (Cowork, une question à la fois) – réponses ajoutées ici

1. **Le report des présences – tranché par Grégoire à 19 h 43** : le report au seul passage à « Complétée » est accepté, **mais la compensation d'une absence par la présence à une intervention est laissée à la discrétion de l'usager** (ses mots). Forme retenue, confirmée par lui (pas élève par élève) :
   - la question de complétion porte une **case, décochée par défaut** : « ☐ Reporter les présences dans la saisie des présences : la présence à cette intervention compensera une absence au cours. » ; boutons « Annuler » / « Marquer complétée » ;
   - case **décochée** : l'intervention est complétée, **aucune présence n'est écrite** (ni présence RàI, ni absence motivée de rattrapage) ;
   - case **cochée** : le report se fait comme aujourd'hui, une seule fois ;
   - le texte « Les présences des participant·es seront reportées… Ce report ne se refait pas si tu modifies l'intervention ensuite. » devient conditionnel à la case (à reformuler par toi, soumis à Grégoire avec les mots) ;
   - un MIO, qui n'écrit pas de présences, ne montre pas la case ;
   - essais : case décochée → empreinte des présences inchangée ; case cochée → report une fois ; mutations : case ignorée (report toujours) → rouge ; case cochée par défaut → rouge.
2. **Le stock – tranché par Grégoire à 19 h 45 : on laisse le passé tel quel.** Aucune mesure. Motif : à l'automne 2026, il n'a encore fait aucune intervention en classe. **La règle après complétion** (participant·e ajouté·e ensuite, date corrigée) : avec la case de report laissée à l'usager, rien ne s'écrit sans son geste ; tranché par Cowork : pas de règle neuve maintenant. Inscris une fiche (issue 2) qui **attend un cas réel** : « intervention modifiée après complétion : reporter une présence pour un·e participant·e ajouté·e, ou une date corrigée, sans toucher aux présences déjà écrites ».
3. **Les mots – acceptés par Grégoire à 19 h 46** : ceux du § 4 du compte rendu d'étape et du § 4 de la demande finale, tels quels, sauf la question de complétion, qui devient, mot pour mot :
   - titre : « Marquer cette intervention complétée ? » (« … cette rencontre … ») ;
   - case, décochée : « Reporter les présences dans la saisie des présences : la présence à cette intervention compensera une absence au cours. » ; pour une rencontre de rattrapage (\`marquerNonParticipantsMotives\`), la case ajoute : « les non-participant·es auront une absence motivée. » ;
   - sous la case : « Le report se fait une seule fois : il ne se refait pas si tu modifies l'intervention ensuite. » ;
   - boutons : « Annuler » / « Marquer complétée ».
4. **Les Nouvelles – acceptées par Grégoire à 19 h 46**, mot pour mot :
   - titre : « Productions et interventions : créer ou modifier »
   - texte : « Productions, interventions, rencontres et le volet confidentiel du profil s'enregistrent tout seuls, champ par champ ; le témoin le dit. Pour en créer une nouvelle, un bouton nomme le geste (« Créer la production », « Créer l'intervention »), et l'application te prévient si tu fermes la fiche ou recharges la page avant. « Annuler » devient « Fermer ». Quand tu marques une intervention complétée, tu choisis si la présence de tes étudiant·es compense une absence au cours : rien ne s'écrit dans l'assiduité sans ce choix. Dans Réglages et dans ton auto-réflexion, le bouton « Enregistrer » disparaît : chaque réglage s'écrit dès que tu le changes, et des seuils dans le désordre sont refusés sans rien enregistrer. »

## La suite

La case de report (point 1) et ses essais → Vitest → **relecture légère de Cowork sur ce seul ajout** (il touche l'assiduité) → release `minor` avec ces Nouvelles → verdict WebKit complet (Grégoire ferme Cowork et ses navigateurs) → fusion → push → porte terrain (Cowork publie l'artefact). Le relais seul sur `main` (2f93bbcc) : tu peux le pousser maintenant, c'est documentaire.

## Relecture légère de la case de report (`d2cc7bde`) – 19 h 58

**Verdict : vert, sans retouche.** Clone jetable : le banc des interventions, 14 / 14. Deux mutations rejouées par Cowork, **rouges** (3 essais chacune) : la case ignorée (report toujours) ; la réponse lue comme cochée. Lu : sans `uiDialogues`, sans réponse ou sur « Annuler », aucun report ; le report n'a lieu qu'avec `reporter === true`.
- **La même question à la création d'une intervention déjà complétée** : juste, c'est la règle de Grégoire (rien ne s'écrit dans l'assiduité sans son choix).
- **Les deux raccords de mots** : fidèles à ce que Grégoire a accepté. Le point-virgule du rattrapage (« … compensera une absence au cours ; les non-participant·es auront une absence motivée. ») et « rencontre » à la place d'« intervention » dans la case et sa phrase d'aide pour une rencontre : acceptés.
- **L'incident du push du relais** (`pousser.sh` juge l'arbre de travail, pas le commit poussé) : inscris une fiche (issue 2) ; le contournement par un worktree propre de `main` est juste.

Ensuite : release `minor` avec les Nouvelles acceptées, Vitest, verdict WebKit complet (Grégoire ferme Cowork et ses navigateurs), fusion, push, porte terrain.
