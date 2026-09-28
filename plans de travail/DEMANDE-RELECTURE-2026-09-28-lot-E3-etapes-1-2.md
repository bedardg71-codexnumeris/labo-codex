# Demande de relecture – lot E3 de l'enregistrement, compte rendu d'étape (étapes 1 et 2)

> Écrite le 28 septembre 2026 par Claude Code, pour Cowork. **Compte rendu d'étape**, pas la demande finale : les étapes 3 (volet confidentiel) et 4 (réglages, bilan) suivent pendant ta lecture. Branche locale `lot-e3-productions-interventions`, dans l'arbre principal, partie de `main` = `15effd08` (1.166.1). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md`.

## 1 · Ce que les deux étapes changent

| Étape | Commit | S'enregistre tout seul (fiche existante) | Le geste qui crée | Aussi |
|---|---|---|---|---|
| 1 · Production | `fd68cecf` | tous les champs, blocs de consignes et échéances compris | « Créer la production » | « Fermer » ; « Production modifiée avec succès ! » retiré |
| 2 · Intervention, rencontre | `77cdaf31` | tous les champs, participants et notes compris | « Créer l'intervention » / « Créer la rencontre » | « Fermer » ; la suppression par le témoin |

**Mécanismes repris de E1 et E2**, rien d'inventé : `modifierEtAnnoncer` (productions, qui passaient déjà par la file), `sauvegarderDonneesSelonMode` (interventions, synchrones) ; la question « … n'est pas encore créée. » et le `beforeunload` de `ui-dialogues.js` ; un seul écrivain par fiche, pour créer comme pour modifier, qui relit tout le formulaire comme le bouton d'avant (les gardes #468, #790, #453, #772, lot A, lot C, lot D ne sont écrites qu'une fois).

## 2 · Les deux points que la consigne m'a demandé de mesurer

**Productions (ta demande : une écriture de champ réécrit-elle une évaluation ?)** : **non, mesuré.** Une évaluation porte sa propre grille, son échelle, sa cartouche et ses critères pondérés (`evaluation-sauvegarde.js` l. 131-263) ; écrire une production n'appelle aucun écrivain d'évaluation (le seul abonné aux écritures de `db` vide le cache de lecture). La note se relit avec la pondération de la production, comme avant « Enregistrer ». Seul le **moment** change : au champ, plus au clic. Essai Vitest et WebKit par empreinte des évaluations (grille et pondération d'une production évaluée changées : empreinte identique). **Je ne me suis pas arrêté.**

**Interventions (ta prémisse : « probablement sans effet sur les présences », `[lu]`)** : **la prémisse était fausse, mesuré.**
- `ajouterPresencesIntervention` (`saisie-presences.js` l. 2440) **ajoute** une présence pour chaque couple (DA, date, cours) absent ; il ne modifie ni ne retire rien.
- Avant le lot, **chaque « Enregistrer » d'une intervention déjà complétée relançait ce report** (`interventions.js`, ancienne l. 1597-1603, « au cas où il y aurait des changements »). Un participant ajouté après coup recevait sa présence ; une **date corrigée écrivait des présences à la nouvelle date et laissait celles de l'ancienne** (compte double à l'assiduité).

Ce que j'ai fait, dans ta consigne (« n'automatise pas ce report ») : **aucune écriture de champ ne touche les présences.** Le report n'a lieu qu'au **passage à « Complétée »**, derrière une question (sauf un MIO, qui n'en écrit pas), et à la création d'une intervention déjà complétée, comme avant. **Aucune présence déjà écrite n'est touchée.** La « règle juste » (déplacer les présences d'une intervention dont la date change) toucherait des présences saisies : je ne l'ai pas écrite ; elle remonte (§ 5, trouvaille 1).

Conséquence, à connaître : un participant ajouté **après** la complétion ne reçoit plus sa présence automatiquement. La question le dit (« Ce report ne se refait pas si tu modifies l'intervention ensuite »).

## 3 · Décisions techniques prises seul

- **Productions, la grille changée repeuple ses cartouches AVANT l'écriture** : sinon la cartouche de l'ancienne grille s'écrivait avec la nouvelle (l'ancien `onchange` le faisait en parallèle ; le bouton lisait l'état final).
- **Productions, refus** : nom, type, pondération vides disent « Non enregistré – Modifier la production : … », rien d'écrit. Le doublon de nom garde sa question ; « Annuler » remet le nom enregistré. **Un bloc de consignes rempli sans nom** : le reste s'écrit, en silence, et le témoin dit que ce bloc n'est pas conservé (pas de succès affiché avec).
- **Productions, échéance hors du trimestre** : en modification, elle s'écrit sans question (l'avertissement sous le champ, `verifierDateHorsTrimestre`, le disait déjà) ; la question reste à la création.
- **Productions, après la création** : la fiche se rouvre existante (Dupliquer, Supprimer, « Fermer »), comme une grille au lot E1.
- **Productions de démonstration** : en lecture seule (champs désactivés) ; elles n'émettent aucun changement, donc n'écrivent rien.
- **Interventions, le changement de sous-onglet** : la question ne peut pas y être posée (`navigation.js`, zone protégée). À la place, **au retour, la création en cours n'est plus remplacée par la liste** : la perte silencieuse de l'inventaire disparaît sans question. Même garde à l'entrée de Rencontres (`rencontres.js`). Le rechargement et « Fermer » posent la question.
- **Interventions, après la création** : la fiche se rouvre existante ; le passage de statut la redessine (le bilan paraît).
- **Interventions, un id introuvable** : par le témoin (« Non enregistré – Modifier l'intervention : intervention non trouvée. »), plus par un panneau d'erreur.
- `sauvegarderInterventions` (écriture directe) retirée ; `annulerNouvelleIntervention` remplacée par `fermerFicheIntervention`.

## 4 · Les mots proposés (pour Grégoire, avant le push)

| Où | Texte |
|---|---|
| Boutons | « Créer la production », « Créer l'intervention », « Créer la rencontre » ; « Fermer » |
| Question de sortie | « Cette production n'est pas encore créée. », « Cette intervention n'est pas encore créée. », « Cette rencontre n'est pas encore créée. » : « Rester » / « Quitter sans créer » |
| Après la création | « Production « … » créée. », « Intervention créée. », « Rencontre créée. » |
| Témoin, production | « le nom de la production est requis. », « choisis le type de la production. », « la pondération est requise : plus de 0 %. » ; bloc : « un bloc de consignes est rempli mais n'a pas de nom ; il n'est pas conservé. Donne-lui un nom. » (et le pluriel) ; « cette production n'est plus dans le trimestre actif. Ferme la fiche et rouvre-la depuis la liste. » |
| Création, questions reprises | « … il ne sera pas conservé. Créer quand même ? » et « … en dehors du trimestre (…). Créer quand même ? » (avant : « Enregistrer / Sauvegarder quand même ? ») |
| Question neuve, complétion | « Marquer cette intervention complétée ? » (« … cette rencontre … ») ; « Les présences des participant·es seront reportées dans la saisie des présences. Ce report ne se refait pas si tu modifies l'intervention ensuite. » ; « Annuler » / « Marquer complétée » |

Les gestes nommés par le témoin : « Modifier la production », « Créer la production », « Modifier l'intervention », « Modifier la rencontre », « Supprimer l'intervention », « Supprimer la rencontre ».

## 5 · Trouvailles (issues)

1. **Stock : des présences en double après une date corrigée** sur une intervention complétée (avant le lot) : **inscrire** (issue 2). Le lot tarit la source ; le stock éventuel reste (mesurable sur les données réelles, en lecture seule, si Grégoire le veut).
2. **GitHub : les passages Playwright planifiés échouent ou sont annulés depuis le 21 sept.** (audit de début de session) : **inscrire** (issue 2).
3. `peuplerEcheancesParGroupe` repose ses écouteurs de date à chaque ouverture de fiche (ils s'empilent ; affichage seulement) : **issue 3**.

## 6 · Preuves à ce point

- **Vitest** : 657 fichiers, **7 678 / 7 678**. Bancs neufs : `sentinelle-lot-e3-productions` (19), `sentinelle-lot-e3-interventions` (10). Réalignés, motif écrit dans chacun : #486 (le refus passe au témoin), #493 (« Utiliser cette date » émet un `change`), #499 (harnais), #503, confirmations de la Conception, lot 5 du cadrage 11 (« Fermer », le témoin), audit du 5 sept. E4 (la porte d'écriture), audit du 6 sept. (harnais).
- **Mutations** (fichier restauré par copie, empreinte vérifiée) : productions : écrivain sans témoin, création avant le clic, question de sortie retirée, cartouches repeuplées après l'écriture, succès après un refus de la garde (survivait : essai ajouté), bloc sans nom tu. Interventions : **report de présences déclenché par une modification**, question de complétion retirée, écrivain sans témoin, création avant le clic, succès après un refus, question de sortie retirée. **Toutes rouges.** WebKit : la garde du retour d'onglet retirée : rouge.
- **WebKit** : banc du lot `lot-e3-creer-ou-modifier.spec.js`, **9 / 9** à ce point (P-a à P-d, I-a à I-d) ; bancs voisins verts (productions 43, anonymisation et profil 12).

## 7 · Ce que je te demande

1. Le § 2 : ma lecture du report de présences, et la conséquence nommée (plus de report après la complétion).
2. La question neuve de complétion (§ 4) : sa présence, ses mots.
3. Le retour d'onglet des interventions à la place de la question (§ 3).
