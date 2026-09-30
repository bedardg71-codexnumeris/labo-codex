# Mesure – lot I : le rappel propose de mettre à jour le codex (#985)

> Écrite le 29 sept. 2026, vers 19 h (Toronto), par Claude Code, avant tout code. Branche `lot-i-rappel-codex`, partie de `main` (`26abb80d`). Rien n'est codé : les mots attendent Grégoire.

## 1 · Le rappel, remesuré (`js/modal-backup-reminder.js`)

- (a) **Confirmée.** `doitAfficherModal` (l. 57) ne lit que `backupProchainRappel` et `backupNePlusRappeler` ; rien dans `js/codex.js` n'écrit ces clés.
- (b) **Confirmée.** La croix appelle `fermerModal` (l. 132), qui retire la fenêtre sans poser de date : tant que la date n'est pas posée, le rappel revient à chaque ouverture (1,5 s après le chargement).
- Le point « à jour » du codex est `_marquerCodexAJour` (`js/codex.js` l. 1181), appelé seulement après l'écriture confirmée (l. 3060). C'est là que le report du rappel s'accrochera.
- « Mettre à jour le codex » fonctionne déjà sans codex ouvert : le même parcours crée le fichier. Il n'y a pas de chemin de création à part.

## 2 · Ce que produit la copie de secours aujourd'hui (point 4 de la consigne)

C'est la fenêtre « Copie de secours » de Réglages › Données (`ouvrirModalExport`, `js/import-export.js` l. 1022). **Elle liste chaque clé de stockage, et aucune n'est cochée au départ** ; une case « Toutes les clés » les coche toutes.

- Si aucune clé `fichiersTravaux` n'est cochée : un fichier `sauvegarde-{auteur}-{date}.json`.
- Si une clé `fichiersTravaux` est cochée (dont par « Toutes les clés ») : un **ZIP qui contient les copies des étudiant·es** (l. 1270 et suivantes).

⮕ **Le libellé « Copie datée, sans les copies des étudiant·es » ne la décrit pas** : elle peut contenir les copies, et ce qu'elle contient dépend de ce qu'on coche. Selon la consigne, je ne code pas ce libellé ; la question va à Grégoire.

## 3 · Où la copie de secours existe (point 5 : inventaire, rien retiré)

| Endroit | Où | Ce qui s'y dit |
|---|---|---|
| Accueil | `js/accueil.js` l. 238 | carte « Copie de secours » |
| Réglages › Données | `index.html` l. 9383-9423 | carte « Copie de secours, ouverture et partage », bouton « Faire une copie de secours » |
| La fenêtre elle-même | `index.html` l. 14633 | titre « Copie de secours » |
| Aide, Réglages › Données | `index.html` l. 14031-14057 | « coche Toutes les clés », « avant un changement majeur » |
| Aide, dépannage | `index.html` l. 13675-13737 | « Faire une copie de secours régulièrement » |
| FAQ « Codex ou copie de secours : quelle différence ? » | `index.html` l. 14124-14162 | tableau des deux rôles, « le codex est ton outil de travail quotidien ; la copie de secours, ton filet de sécurité » |
| Aide contextuelle | `js/accompagnement-contenu-popup.js` l. 1617-1668, `-hover.js` l. 189, 193, 670 | la fenêtre des clés, les formats .json et .zip |
| Registre longitudinal | `js/registre-longitudinal.js` l. 94 | « voyage dans ta copie de secours si tu coches toutes les clés » |
| Restauration | `js/import-export.js` l. 1820-1990 | « Copie de secours personnelle », « C'est ma propre copie de secours » |
| Suppression d'un trimestre | `js/trimestre-v2-liste.js` l. 435 | « Supprimer quand même, SANS copie de secours ? » |
| Nouvelles 1.168 | `js/changelog-data.js` l. 39-46 | historique, on n'y touche pas |

**Recommandation** : garder la copie de secours à ses places actuelles (Réglages › Données, restauration, suppression d'un trimestre), et retirer seulement le rappel qui y mène. L'Aide et la FAQ restent vraies. La seule phrase qui devient fausse est celle des Nouvelles 1.168 (« dans le rappel, qui t'y mène directement »), mais c'est un historique daté. **Tant que la question du § 2 n'est pas tranchée, le menu du codex n'est pas touché.**

## 4 · Hors lot, mesuré (issue 2)

Le codex data « peut être anonymisé » selon `docs/architecture/ECOSYSTEME-DONNEES.md` (l. 190). Or `js/codex-data.js` écrit toujours `anonymise: false` (l. 336) et ne contient aucune fonction d'anonymisation. Aucun écran ne fait cette promesse (mesuré par grep) : l'écart est entre la documentation et le code. **À inscrire** au prochain numéro libre, dans le commit du lot.

## 5 · Tranché seul (technique)

- Une mise à jour réussie repousse le rappel de **14 jours**, le choix par défaut du sélecteur.
- La croix vaut « Dans 14 jours » (même délai).
- Clés inchangées (`backupProchainRappel`, `backupNePlusRappeler`) : le stock est respecté tel quel. « Ne plus rappeler » reste respecté, une date déjà posée aussi. Rien n'est écrit au premier lancement.
- ⚠ Piège mesuré : `definirProchainRappel` (l. 97) **efface** `backupNePlusRappeler`. Le report posé par le codex ne doit donc pas passer par elle, sinon une mise à jour du codex rallumerait le rappel chez un usager qui l'a éteint. Le banc le vérifiera.
