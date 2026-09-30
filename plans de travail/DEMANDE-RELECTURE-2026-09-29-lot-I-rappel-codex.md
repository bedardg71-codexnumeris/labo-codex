# Demande de relecture – lot I : le rappel mène au codex (#985)

> Écrite le 29 septembre 2026, vers 21 h (Toronto), par Claude Code, pour Cowork. Branche `lot-i-rappel-codex` (partie de `main`, `26abb80d`). Exécute la consigne `plans de travail/CONSIGNE-LOT-I-rappel-codex.md` et sa mise à jour de 20 h 35. **Ni release ni push** : la ligne des Nouvelles attend Grégoire.

## 1 · Ce qui a changé

- **Le rappel** (`js/modal-backup-reminder.js`) dit les mots arrêtés de D8, mot pour mot : titre « Mets ton codex à jour », le texte, « Rappel : » (7, 14 par défaut, 30 jours, « Ne plus rappeler »), boutons « Plus tard » et « Mettre à jour le codex ». L'ancien encadré (« stockées localement », la liste des quatre risques, « Solution : ») et le lien vers la copie de secours sont retirés.
- **« Mettre à jour le codex »** lance `Codex.actionEnregistrer()`, le parcours du menu tel quel (lot G) ; sans codex ouvert, ce parcours le crée. Le clic ne pose aucune date.
- **Une mise à jour réussie repousse le rappel**, au point où le codex est dit « à jour » (`_marquerCodexAJour`, `js/codex.js`), donc aussi pour « Enregistrer sous » et pour « Il y est ». Un échec, un aperçu refusé ou « Il n'y est pas » n'y arrivent pas.
- **La croix vaut « plus tard »** : 14 jours.
- **Retiré** : `allerVersCopieDeSecours` et le test (1) de `lot-f-rappel-et-reserve.spec.js` qui l'éprouvait ; la sentinelle des mots du lot F attend maintenant « Mettre à jour le codex » et refuse l'ancien titre.

## 2 · Tranché seul (technique)

- **Délai : 14 jours**, pour la croix comme pour une mise à jour réussie (choix par défaut du sélecteur).
- **Si l'usager a changé le sélecteur avant « Mettre à jour le codex »** : son délai s'applique à la réussite (30 jours → 30 jours) ; « Ne plus rappeler » éteint le rappel tout de suite, car c'est un choix explicite qui ne dépend pas de la réussite. *Supposition nommée* : la consigne ne dit rien de ce cas.
- **Clés inchangées** (`backupProchainRappel`, `backupNePlusRappeler`) ; rien n'est écrit au premier lancement.
- **Le stock** : le report du codex ne passe pas par `definirProchainRappel` (qui efface « Ne plus rappeler ») : un usager qui a éteint le rappel ne le voit pas revenir. Et une date plus lointaine déjà choisie (« Dans 30 jours ») n'est pas rapprochée par une mise à jour.
- **Le crochet** : `codex.js` appelle `window.backupReminder.reporterApresMiseAJourDuCodex()` s'il existe, comme il appelle déjà `window.temoinEnregistrement`.

## 3 · La preuve

- **Banc WebKit** `tests/integration/lot-i-rappel-mene-au-codex.spec.js`, 4 essais, vert au premier passage (avec l'essai restant du lot F : 5/5, 43 s) : (1) les mots de D8, aperçu refusé sans report, réussite sans codex ouvert → 14 jours ; (2) depuis le menu : partage refusé et « Il n'y est pas » → rien, « Il y est » → 14 jours ; (3) la croix → 14 jours ; (4) « Ne plus rappeler » survit à une mise à jour, une date à 30 jours est gardée.
- **Break-test** : six mutations, six rouges (§ 5).
- **Vitest** : suite complète verte, 663 fichiers, 7 767 essais.

## 4 · Ce qui revient à Grégoire

### 4.1 · La ligne des Nouvelles (proposée, à accepter ou réécrire)

Version prévue 1.170.0 (mineure : un comportement change), couleur orange (correction d'un retour vécu).

> **Titre** : « Le rappel te propose de mettre ton codex à jour »
>
> **Ligne** : « Le rappel qui s'affiche à l'ouverture te propose maintenant de mettre ton codex à jour, plus de faire une copie de secours. Quand ton codex vient d'être mis à jour, il ne revient pas avant 14 jours ; le fermer par la croix le repousse aussi de 14 jours. »

### 4.2 · Trouvé en chemin : la carte « Copie de secours » de l'Accueil ouvre ce rappel

Mesuré pendant le lot : la carte « Copie de secours » de l'Accueil (« Export, restauration, stockage 100 % local. », `js/accueil.js` l. 235-240) n'ouvre pas la copie de secours : elle ouvre **ce même rappel** (`ouvrirModalBackup` → `backupReminder.afficherModal`). Ma mesure du § 3 l'avait listée comme « carte Copie de secours » sans voir où elle mène.

Conséquence, dès ce lot : cette carte, titrée « Copie de secours », ouvre « Mets ton codex à jour ». Rien n'est cassé (le geste mène au codex, ce que veut D8), mais le titre de la carte ne dit plus ce qu'elle fait. **Issue 2** : je n'ai pas touché ses mots (ils reviennent à Grégoire, et la carte fait partie du lot I bis). Deux options pour lui, au lot I bis :

- (a) la carte devient celle du codex (titre et sous-texte à écrire) et garde son geste ;
- (b) la carte disparaît de l'Accueil avec la copie de secours.

### 4.3 · La copie de secours hors du rappel

Tranchée par D9 (on l'élimine, lot I bis). L'inventaire est au § 3 de `MESURE-2026-09-29-lot-I-rappel-codex.md`, auquel s'ajoute le § 4.2 ci-dessus.

## 5 · Break-test

Chaque mutation posée seule, le banc relancé (WebKit, sans second essai), puis le fichier restauré par copie (empreintes identiques à la référence après les six).

| | Mutation | Essai rougi |
|---|---|---|
| M1 | `codex.js` n'appelle plus le report | (1) et (2) |
| M2 | le report ignore « Ne plus rappeler » | (4) |
| M3 | le report rapproche une date plus lointaine | (4) |
| M4 | la croix revient à `fermerModal` (aucune date) | (3) |
| M5 | le bouton du rappel pose la date au clic | (1) |
| M6 | `codex.js` repousse avant l'écriture (au clic du menu) | (2) |

⚠ Ce qui n'est pas au banc : le verdict WebKit **complet** (≈ 43 min) n'est pas lancé ; il suivra l'accord sur les Nouvelles, avant le push.

## 6 · Pour Grégoire, en deux phrases

Le rappel qui s'affiche à l'ouverture te propose maintenant de mettre ton codex à jour, et son bouton lance la même mise à jour que le menu du codex. Il ne revient pas avant 14 jours après une mise à jour réussie, ou après l'avoir fermé par la croix ; si tu avais choisi « Ne plus rappeler », il reste éteint.
