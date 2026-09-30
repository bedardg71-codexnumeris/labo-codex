# Consigne – lot F de l'enregistrement : les mots (D4), et un témoin du codex qui dit vrai

> Écrite le 28 septembre 2026, à 17 h 15 (Toronto), par Cowork. Source qui fait foi : `plans de travail/DECISIONS-2026-09-26-enregistrement.md`, **D4** (et D0). Constat : `INVENTAIRE-ENREGISTREMENT-2026-09-26.md`, § 3 (Codex ; Réserve ; Autres écrans) et § 4 « Les sens du mot enregistrer », annexe A3 (Codex, Réserve, Autres). **À ouvrir après le lot E3 livré** : un seul lot à la fois dans `js/`.
>
> **Au début du lot** : archive `CONSIGNE-DU-JOUR.md` (lot E3) sous `_ancienne-CONSIGNE-DU-JOUR-‹date›-lot-E3-….md`, puis renomme celle-ci en `CONSIGNE-DU-JOUR.md`. Branche `lot-f-les-mots`, partie de `main` après E3.
>
> **À remesurer** : mesuré par Cowork le 28 vers 17 h 30 sur `main` (1.166.0) : le témoin du codex dit encore « Tout est enregistré » (`codex.js`) ; `marquerModification()` n'a toujours que deux appelants (`codex.js` l. 3059 renommer, 3213 fusionner) ; « Enregistrer le codex » (`codex.js`, `index.html`) ; « Archive enregistrée » et la coquille « Erreur de archive » (`reserve.js`) ; la carte « Sauvegarder » de l'Accueil (`accueil.js` l. 238) ; le rappel « Protège tes données » (`modal-backup-reminder.js` l. 189-229) ; la FAQ « Oui, toutes les modifications sont sauvegardées automatiquement » (`index.html`) ; la bulle « … n'est pas sauvegardé automatiquement » du Rapport (`profil-etudiant-rapport.js`) ; la fenêtre d'aide des présences qui liste « Justifié » et « Retard » (`accompagnement-contenu-popup.js` l. 293-294), états que l'écran n'offre pas.

## 1 · Ce que Grégoire a décidé (D4, 26 sept. vers 13 h 42, « je garde ! »)

- **« Enregistré »** ne veut dire qu'une chose : écrit dans l'application (le témoin commun). « Sauvegardé » disparaît de ce sens.
- **Le codex** (le fichier sur la clé USB) a son verbe : « Mettre à jour le codex » au lieu de « Enregistrer le codex ». Son témoin dit « Ton codex est à jour » ou « Ton codex n'a pas tes derniers changements », plus jamais « Tout est enregistré ».
- **La Réserve** parle d'archives : « Groupe archivé », « Archives » (au lieu d'« Archive enregistrée »).
- **La copie de secours** (Réglages › Données) s'appelle « Copie de secours » partout, carte de l'Accueil et rappel compris.
- Prix accepté : l'Aide et les consignes données aux collègues changent de mot ; **Claude Code relève tous les textes touchés, Grégoire les relit** (par Cowork).

## 2 · Ce que le lot fait, et les décisions techniques de Cowork

**Étape 1 · Le témoin du codex dit vrai** (`codex.js`). C'est la seule partie qui n'est pas que des mots, et elle est nécessaire : un témoin « Ton codex est à jour » serait aussi faux que « Tout est enregistré » s'il ne sait pas quand une donnée change.
- Toute écriture de données dans l'application (le témoin commun, `sauvegarderDonneesSelonMode` / `modifierEtAnnoncer` / `ecrireEtAnnoncer`, et ce qui écrit hors de lui) marque le codex « pas à jour ». Un seul point d'accroche, pas une liste d'appelants.
- `genererCodex` ne remet l'état à « à jour » **qu'après** l'écriture réussie du fichier (aujourd'hui avant, l. 446-454) ; un aperçu annulé (l. 425-427, 2786-2805) ne dit ni succès ni « à jour », et plus de message technique (« Cannot read properties of null »).
- ⚠ **L'enregistrement automatique « Toutes les 5 min »** (l. 2564-2635) ne part jamais aujourd'hui, parce que rien ne marque de modification. Dès l'étape 1, il partirait : il **écrirait le fichier de Grégoire** sur sa clé toutes les cinq minutes. **Ne l'active pas de toi-même** : mesure ce qu'il ferait (quel fichier, quand, sous Safari et Chrome, sur iPad), puis arrête-toi sur ce point et dis-le. Cowork pose la question à Grégoire. D'ici sa réponse, l'automatique reste inerte comme aujourd'hui.

**Étape 2 · Les mots du codex, de la Réserve et de la copie de secours**, selon D4, partout où ils s'affichent (boutons, menus, témoins, messages, infobulles). Réserve : la coquille « Erreur de archive » corrigée. **Mesure aussi** le mensonge Safari de la Réserve (une archive inscrite à la liste alors qu'aucun fichier n'existe, `reserve.js` l. 1252-1299) : si la correction reste dans `reserve.js` et n'écrit ni n'efface rien de neuf, fais-la (un échec ne se déguise pas en réussite, D0) ; sinon, inscris-la. ⚠ **L'archivage d'un trimestre est sous moratoire (#622)** : ses fichiers (`trimestre-v2-liste.js`, `trimestres.js` pour l'archivage) ne changent pas, #975 compris.

**Étape 3 · Le rappel « Protège tes données »** : il devient le rappel de la **copie de secours** ; son bouton ne dit plus « Exporter maintenant » s'il n'exporte pas (aujourd'hui, il repousse le rappel de 7 jours sans rien faire, et son sélecteur de repli `[data-sous-section="import-export"]` n'existe pas) : il mène vraiment à la copie de secours, ou il dit ce qu'il fait.

**Étape 4 · L'Aide et les textes d'écran** : 
- FAQ « Mes données sont-elles sauvegardées automatiquement ? » : réponse réécrite selon D0 à D4 (ce qui s'enregistre seul, ce qui attend un bouton de création, ce qu'est le codex, ce qu'est la copie de secours).
- Aides de sections (Préférences, Outils d'observation, et toutes celles qui disent « sauvegardé ») relevées.
- La bulle du Rapport (« … n'est pas sauvegardé automatiquement ») : dire la vérité, ce texte n'est enregistré nulle part.
- La fenêtre d'aide « Saisir les présences efficacement » : retirer « Justifié » et « Retard », que l'écran n'offre pas (ajouté par Cowork le 27 à la relecture du lot D).
- **Relevé complet** : `git grep` sur « sauvegard », « Enregistrer le codex », « Tout est enregistré », « Archive enregistrée », « Exporter maintenant » dans `js/` et `index.html`, et dans le guide et les tutoriels du dépôt s'il y en a. Chaque texte touché dans un tableau avant / après. **Ne réécris pas un texte d'aide sans le mettre dans ce tableau** : Grégoire les relit tous.

**Hors du lot** : le blogue Codex Numeris et ses tutoriels (hors dépôt : liste pour Grégoire les pages qui disent « Codex → Enregistrer », s'il y a des liens dans le dépôt) ; `navigation.js` (zone protégée) ; le moratoire #622.

## 3 · Les mots – Cowork les soumet à Grégoire, une question à la fois, avant le push

Déjà décidés (D4) : « Mettre à jour le codex » ; « Ton codex est à jour » / « Ton codex n'a pas tes derniers changements » ; « Groupe archivé », « Archives » ; « Copie de secours ». Tout le reste (FAQ, aides, bulle, rappel, relevé) est **proposé** par toi dans la demande de relecture, au tutoiement, sans tiret cadratin. **Nouvelles** : à proposer à la fin.

## 4 · Preuves

- Codex : après une écriture de données quelconque (une évaluation, une présence, une fiche du Cadre), le témoin dit « Ton codex n'a pas tes derniers changements » ; après « Mettre à jour le codex » réussi, « Ton codex est à jour » ; aperçu annulé → toujours « pas à jour », aucun succès. Mutations rouges : le point d'accroche retiré ; l'état remis à jour avant l'écriture ; l'aperçu annulé lu comme un succès.
- L'automatique « 5 min » : un essai prouve qu'il reste inerte tant que Grégoire n'a pas répondu.
- Les mots : une sentinelle qui refuse « Tout est enregistré », « Enregistrer le codex », « Archive enregistrée », « Erreur de archive » dans `js/` et `index.html` ; mutation (un des textes remis) → rouge.
- Vitest complet ; bancs WebKit voisins (codex, Réserve, Accueil, présences, Aide) verts ; placement des boutons renommés aux quatre largeurs.

## 5 · Livraison

- **Relecture croisée par Cowork exigée** (le codex est le fichier de sauvegarde de Grégoire) : `DEMANDE-RELECTURE-‹date›-lot-F-les-mots.md`, avec le tableau complet des textes.
- Stock : rien n'est réécrit, déplacé ni effacé ; aucun fichier codex n'est écrit par le lot sans le geste de Grégoire.
- Release `minor` ; mots, relevé et Nouvelles acceptés par Grégoire avant le push ; verdict WebKit complet avec Cowork et les navigateurs fermés, puis `caffeinate -i scripts/pousser.sh origin main`.
- **Porte terrain** : le témoin du codex sur ses vraies données (une écriture, puis « Mettre à jour le codex » sur sa clé), sous Safari et Chrome s'il les emploie ; rien de fictif.
