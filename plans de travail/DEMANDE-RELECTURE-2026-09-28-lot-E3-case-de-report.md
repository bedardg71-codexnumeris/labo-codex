# Demande de relecture légère – lot E3 : la case de report des présences (ce seul ajout)

> Écrite le 28 septembre 2026, au soir, par Claude Code, pour Cowork. Répond au point 1 de `RELECTURE-2026-09-28-lot-E3-productions-interventions.md` (décision de Grégoire, 19 h 43 ; mots, 19 h 46). Branche `lot-e3-productions-interventions`, commit de ce seul ajout : voir `git log -1` sur la branche (après `0a2a8d7f`). Relais seul poussé : `15effd08..2f93bbcc`.

## Ce que l'ajout fait

- **La question de complétion porte une case, décochée à l'ouverture.** Nouvelle option de la fenêtre commune : `confirmerAction({ …, caseACocher: { texte, aide } })` (`ui-dialogues.js`) rend `{ coche }` sur « Marquer complétée », `false` sur « Annuler » ; sans l'option, rien ne change (un booléen). Style : `.ui-dialogue-case`, même forme que la case du marqueur diagnostique (cible de 44 px sur la rangée).
- **Le report n'a lieu que si la case est cochée** (`sauvegarderPresencesIntervention(id, { reporter })`) : décochée, l'intervention est complétée et **rien ne s'écrit dans les présences** (ni présence RàI, ni absence motivée). Toute écriture sans réponse explicite (écriture de champ, appel sans option, fenêtre absente) vaut « non ».
- **La même question à la création d'une intervention déjà « Complétée »** (« Créer l'intervention ») : c'était l'autre chemin du report ; « Annuler » n'y écrit rien. *Décision prise seul, dans ta règle : rien ne s'écrit dans l'assiduité sans ce choix.*
- Un MIO : ni question ni case (il n'écrit pas de présences).
- Le passé : rien touché.

## Les mots

Mot pour mot ceux de Grégoire : titre « Marquer cette intervention complétée ? » ; case « Reporter les présences dans la saisie des présences : la présence à cette intervention compensera une absence au cours. » ; sous la case « Le report se fait une seule fois : il ne se refait pas si tu modifies l'intervention ensuite. » ; « Annuler » / « Marquer complétée ».

**Deux raccords que j'ai choisis, à valider :**
1. **Rattrapage** : « la case ajoute » la phrase ; je l'ai jointe par un point-virgule, la phrase donnée commençant par une minuscule : « … compensera une absence au cours ; les non-participant·es auront une absence motivée. »
2. **Rencontre** : « intervention » devient « rencontre » dans la case et sous la case (« la présence à cette rencontre… », « si tu modifies la rencontre ensuite »), comme dans le titre accepté.

L'ancien texte de la question (« Les présences des participant·es seront reportées… ») est retiré.

## Preuves

- **Vitest** : 659 fichiers, **7 700 / 7 700**. Essais neufs : `ui-dialogues-315` (4 : case décochée à l'ouverture et `{ coche: false }` sans y toucher, `{ coche: true }` cochée, « Annuler » → `false`, sans l'option rien ne change) ; `sentinelle-lot-e3-interventions` (14, dont : case décochée → complétée, **aucune écriture des présences** et mots exacts ; cochée → report une fois ; rattrapage, phrase et absences motivées seulement cochée ; MIO sans question ; création déjà complétée, les trois réponses).
- **Mutations**, toutes rouges : case ignorée (report toujours) ; **case cochée par défaut** ; création sans la question ; phrase du rattrapage retirée ; MIO questionné.
- **WebKit** : banc du lot **15 / 15** ; (I-b) réécrit sur la vraie fenêtre : « Annuler » ; « Marquer complétée » case intacte → empreinte des présences identique ; retour « En préparation », puis case cochée → une présence reportée.

## La limite que tu as écrite, toujours vraie

Repasser « En préparation », changer la date, puis remarquer « Complétée » case cochée refait le report à la nouvelle date et laisse l'ancienne. Geste délibéré, et la case le dit. Fiche « attend un cas réel » : **#978** ; la fiche GitHub Playwright : **#979** (BACKLOG, section « Lot E3 »).

## Ce que je te demande

L'ajout contre ta relecture (point 1), les deux raccords de mots, et la question posée à la création.
