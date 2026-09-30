# Consigne – lot I : le rappel propose de mettre à jour le codex (#985)

> Écrite le 29 septembre 2026, à 15 h 16 (Toronto), par Cowork, sur accord de Grégoire (« oui », vers 15 h 15). Plan d'ensemble : `plans de travail/PLAN-2026-09-29-fin-carte-et-enregistrement.md` (lot I, premier du chantier « finir la carte et l'enregistrement »).
> **Priorité : retour testeur vécu** (règle de `CLAUDE.md` : il interrompt le plan en cours). Si le lot H (#987, `CONSIGNE-DU-JOUR.md`) est en cours : finis le passage qui tourne, commite l'état de `lot-h-duree-suite` avec ce qui est mesuré, note-le dans `RELAIS.md`, puis ouvre ce lot. Le lot H reprend ensuite.
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` montre `69c7d523` ou plus récent. Branche `lot-i-rappel-codex`, partie de `main`.

> ### ⚠ Mise à jour du 29 sept., 20 h 35 (Cowork) — à lire AVANT le reste
> Depuis cette consigne, Grégoire a tranché D8 (mots du rappel acceptés, « Oui, tels quels ») et D9 (on élimine la copie de secours), inscrits sur la branche `lot-i-rappel-codex` (`901eb7d9`), et ta mesure est faite (`plans de travail/MESURE-2026-09-29-lot-I-rappel-codex.md`, `5d861a72`). Ce qui change ici :
> - **§ 3, point 4 est remplacé par D9** : aucune entrée « Copie datée… » au menu du codex. Le lot I retire seulement le lien du rappel vers la copie de secours.
> - **§ 3, point 5 est fait** (inventaire au § 3 de ta mesure). L'élimination de la copie de secours est un lot à part (lot I bis du plan), pas celui-ci.
> - **§ 3, « Remonte à Grégoire » : les mots du rappel sont arrêtés** (D8) ; seule la ligne des Nouvelles lui revient encore.
> - Relu par Cowork et retenu : tes décisions techniques du § 5 de la mesure (14 jours, clés inchangées, stock respecté) et le piège de `definirProchainRappel` qui efface `backupNePlusRappeler` : le banc doit le garder (un usager qui a éteint le rappel ne le voit pas revenir après une mise à jour du codex).
> - Ajout de Cowork : le report posé par une mise à jour réussie vaut aussi pour « Il y est » (téléchargement direct confirmé), et pas pour « Il n'y est pas ». Au banc.

## 1 · Le symptôme et la mesure

- **Vécu par Grégoire, 29 sept., vers 15 h 10** : sur l'iPad, l'invitation à faire une copie de secours revient quand il ouvre l'application, alors que son codex a été mis à jour à 15 h 03 (porte des lots F et G, 9/9).
- **Mesuré par Cowork en lecture, sur `main`** (`js/modal-backup-reminder.js`, à remesurer avant de coder) :
  - (a) `doitAfficherModal` ne lit que `backupProchainRappel` et `backupNePlusRappeler` : une mise à jour du codex ne repousse pas le rappel ;
  - (b) la croix appelle `fermerModal`, qui ne pose aucune date : le rappel revient à chaque ouverture tant qu'on n'a pas choisi un délai ou « Copie de secours ».
- Non su : quel bouton Grégoire utilise pour fermer. (b) est la cause probable de « à chaque ouverture », pas une cause prouvée.

## 2 · La décision de Grégoire (29 sept., vers 15 h 15, mot pour mot de la proposition de Cowork)

> Le rappel propose de **mettre à jour le codex** (ou d'en créer un, si aucun n'est ouvert). Mettre à jour le codex repousse le rappel. La croix vaut « plus tard ». La copie de secours n'est plus proposée par le rappel : elle devient une option du menu du codex, « Copie datée, sans les copies des étudiant·es ».

Inscris-la dans la fiche #985 du BACKLOG (elle passe de « à trancher plus tard » à « tranchée ») et dans `plans de travail/DECISIONS-2026-09-26-enregistrement.md`, à la suite de D7.

## 3 · Le mandat

1. **Le rappel mène au codex.** Son geste principal ouvre le parcours de `_mettreAJourLeCodex` (codex actif) ou la création d'un codex suivie de sa mise à jour (aucun codex actif) : même parcours, mêmes messages d'échec que le lot G, aucun chemin parallèle.
2. **Une mise à jour réussie repousse le rappel**, qu'elle vienne du rappel ou du menu du codex (le point où le codex est dit « à jour », `_marquerCodexAJour` ou son voisin, pas le clic). Un échec, un aperçu refusé ou « Il n'y est pas » ne repoussent rien.
3. **La croix vaut « plus tard »** : même délai que le choix par défaut du sélecteur du rappel.
4. **La copie de secours quitte le rappel** et devient une entrée du menu du codex, « Copie datée, sans les copies des étudiant·es ». Mesure d'abord ce que produit aujourd'hui la copie de secours (Réglages › Données) et dis si ce libellé la décrit vraiment ; sinon, propose un libellé à Grégoire au lieu de coder le sien.
5. **Les autres endroits où la copie de secours existe** (Accueil, Réglages › Données, Aide, foire aux questions, Nouvelles) : **inventorie-les, ne retire rien.** Ce que devient la copie de secours hors du rappel n'est pas tranché ; ton inventaire, avec une recommandation, va dans la demande de relecture pour Grégoire.

Tranche seul le technique, en le disant en une ligne : le délai exact, le nom des clés, l'endroit du crochet, la forme des tests.

**Tarir n'est pas réparer.** Le stock : un usager qui a choisi « Ne plus rappeler » garde son choix ; une date de rappel déjà posée est respectée. Supposition à nommer dans ton rapport si tu fais autrement. Rien n'est écrit dans les données de quiconque au premier lancement.

**Remonte à Grégoire, et attends** : tous les mots neufs du rappel et du menu du codex (titre, texte, boutons, entrée du menu), la ligne des Nouvelles, et ce que devient la copie de secours hors du rappel (point 5).

**Hors lot** (issue 2 par défaut) : la fiche #985 note aussi que le codex data se dit anonymisable mais écrit toujours `anonymise: false` ; mesure-le et inscris-le si c'est vrai, ne le corrige pas ici.

## 4 · Ce qui est dû

- Un banc WebKit : le rappel propose le codex ; une mise à jour réussie le repousse (menu et rappel) ; un échec ne le repousse pas ; la croix le repousse ; « Ne plus rappeler » déjà posé reste respecté. Break-tests : chaque garde retirée fait rougir le banc.
- Commit sur la branche, puis `plans de travail/DEMANDE-RELECTURE-2026-09-29-lot-I-rappel-codex.md` pour Cowork : les mots à faire accepter (un paragraphe par texte), l'inventaire du point 5. Ni release ni push avant la relecture et l'accord de Grégoire sur les mots.
- Une porte terrain sur l'iPad (skill `portes-terrain`, markdown seulement ; Cowork publie l'artefact) : ouvrir l'application après une mise à jour du codex, aucun rappel.
- Pour Grégoire, en une ou deux phrases de français d'utilisateur : ce que le rappel dit maintenant, et quand il revient.
