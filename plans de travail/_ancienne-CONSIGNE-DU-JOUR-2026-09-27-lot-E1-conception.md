# Consigne – lot E1 de l'enregistrement : créer ou modifier, zone Conception (D3)

> Écrite le 27 septembre 2026, à 11 h 53 (Toronto), par Cowork (la session qui a mené les lots A à D ; une autre session Cowork prend le relais). Source qui fait foi : `plans de travail/DECISIONS-2026-09-26-enregistrement.md`, **D3** (et D0). Constat : `plans de travail/INVENTAIRE-ENREGISTREMENT-2026-09-26.md`, § 3 « Conception », annexe A3 « Conception ». Les lots E sont trois, par zone (ordre des lots, point 5) : **E1 Conception (celle-ci)**, E2 Cadre et élèves, E3 productions, interventions et volet confidentiel.
>
> **Ce fichier porte un nom à lui, exprès** : le chantier de la carte d'alignement (autre session Cowork) a aussi des lots prêts. **Un seul lot à la fois dans `js/`.** Au début du lot : archive l'actuelle `CONSIGNE-DU-JOUR.md` (lot D, livré) sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-27-lot-D-presences.md`, puis renomme celle-ci en `CONSIGNE-DU-JOUR.md`.
>
> **Condition de départ** : `git log origin/main` montre `295b9e99` (1.163.0) ou plus récent, aucun autre lot en cours sur une branche, et l'arbre ne porte aucun changement dans `js/`. Branche `lot-e1-conception` ; fusion après la relecture croisée seulement.
>
> **À remesurer avant le code** : ce qui suit vient de l'inventaire du 26 et de ma lecture du 27 vers 11 h 50. ⚠ Le critère perdu à « Enregistrer » (inventaire § 2) est **déjà corrigé** (#957, 1.159.13) : ne le recorrige pas, vérifie seulement qu'il le reste.

## 1 · Ce que Grégoire a décidé (D3, 26 sept. vers 13 h 41, « excellent, je garde »)

- **Créer** quelque chose de neuf (ici : grille, échelle, cartouche, pratique) : un bouton qui nomme le geste (« Créer la grille »). Tant qu'on n'a pas cliqué, rien n'existe ; quitter avant avertit : « Cette grille n'est pas encore créée. »
- **Modifier** ce qui existe : tout s'enregistre tout seul, champ par champ – nom d'une cartouche et son contexte spécifique, jetons d'une pratique compris.
- Dans une fiche existante, **« Annuler » devient « Fermer »** (il n'annulait rien).
- **L'assistant de pratique** garde un bouton final : « Créer la pratique » ou « Appliquer à la pratique » selon le cas (il dit aujourd'hui « créée » même en modification).
- Les champs que l'application vérifie disent **« Non enregistré : ‹raison› »** au lieu de deux messages contradictoires.

## 2 · Ce que j'ai lu, et les décisions techniques de Cowork

- **Le témoin commun parle pour toutes les écritures de ces écrans.** Aujourd'hui, les écritures automatiques de la Conception passent par `db.modifier` / `db.setSync` directs (grilles vers les l. 5013-5210, échelles, cartouches vers les l. 711-892, pratiques vers les l. 1457-1581) : elles n'ont pas le témoin (lot B). Fais-les passer par `sauvegarderDonneesSelonMode` avec un geste, ou fais parler le témoin depuis leur écrivain ; dis ce que tu as choisi. Un échec d'écriture se dit par le témoin, jamais par un succès.
- **Modifier, sans bouton** : sur une grille, une échelle, une cartouche ou une pratique **existante**, le bouton « Enregistrer » disparaît. Ce qui était manuel devient automatique : le **nom** et le **contexte spécifique** d'une cartouche (`index.html` vers la l. 5414, `cartouches.js` vers les l. 881-884, 1007), le **système de jetons** d'une pratique (`pratiques-gestion.js`, jetons sans gestionnaire vers les l. 2545 et 1691-1710 ; « Enregistrer la pratique » vers les l. 1727-1747). Le message « pas encore enregistrée » d'une cartouche (vers les l. 912-924) se relit contre la nouvelle règle.
- **Créer, avec un bouton** : une nouvelle grille, échelle, cartouche ou pratique n'est écrite qu'au clic sur « Créer la … ». **Rien n'est écrit avant** : l'assistant crée aujourd'hui une grille de base même si on annule (`wizard-pratique-v2.js`, vers les l. 1811-1827) – ça s'arrête. Après le clic, la fiche passe en modification (automatique).
- **L'avertissement « … n'est pas encore créée »** : aucune garde de sortie n'existe hors du Codex, et la navigation vit dans `js/navigation.js`, **zone protégée** (CLAUDE.md). Pose l'avertissement là où la fiche le permet sans toucher `navigation.js` (changer de fiche, « Fermer », rechargement). **Si l'avertissement exige `navigation.js`, arrête-toi et dis-le** : c'est à Grégoire d'autoriser.
- **L'assistant** : le bouton final dit « Créer la pratique » en création et « Appliquer à la pratique » en modification ; le message suit (plus de « créée » en modification, vers les l. 2199-2215).
- **Échelle** : « Niveau ajouté ! … puis enregistre. » (`echelles.js`, vers les l. 2990-2993) ne demande plus d'enregistrer ce qui l'est déjà.
- **Champs vérifiés** : par exemple le nom d'un critère vidé (« La modification n'a pas été enregistrée. ») : un seul message, par le témoin, « Non enregistré : ‹raison› ». Relève les autres.
- **En passant, dans ces fichiers** : `notifications.avertissement` n'existe pas (`grilles.js` vers la l. 4285, déjà gardé par un `if`) : branche sur la vraie méthode ou retire la garde morte ; les `alert` au vouvoiement (« Veuillez… », 16 lignes relevées dans `grilles.js`, `echelles.js`, `cartouches.js`, `pratiques-gestion.js`, `wizard-pratique-v2.js`) passent au tutoiement – ce sont des mots que les collègues lisent : relève-les pour Grégoire.
- **Ne touche pas** : les productions (lot E3), le Cadre et les élèves (E2), l'Alignement (chantier de l'autre session Cowork), les mots du Codex et de la Réserve (lot F).
- **Fiches** : cherche dans `BACKLOG.md` et `SUIVI-BUGS.md` celles que le lot règle (cartouche, nom perdu, jetons perdus, assistant, #938 « jetons perdus à la réédition » à relire, #618 et #786 closes) ; liste-les avec « réglée / en partie / non ».

## 3 · Les mots – à faire accepter par Grégoire AVANT le push

Déjà décidés (D3) : « Créer la grille » (et « Créer l'échelle », « Créer la cartouche », « Créer la pratique ») ; « Appliquer à la pratique » ; « Fermer » ; « Cette grille n'est pas encore créée. » (et ses jumeaux) ; « Non enregistré : ‹raison› ».

Proposés par Cowork :
- Boutons de l'avertissement : **« Rester »** (sélectionné, Entrée le suit, patron #945) / **« Quitter sans créer »**.
- Après la création : **« Grille « … » créée. »** (et ses jumeaux) ; après « Appliquer à la pratique » : **« Pratique « … » mise à jour. »**
- Échelle, niveau ajouté : **« Niveau ajouté. Ajuste son code, son nom et ses bornes : chaque champ s'enregistre tout seul. »** (à vérifier contre les champs que l'écran affiche).
- Les `alert` au tutoiement : le relevé, présenté en tableau avant / après.
- **Nouvelles** : « Conception : une grille, une échelle, une cartouche ou une pratique existante s'enregistre toute seule, champ par champ, nom et jetons compris ; le témoin le dit. Pour en créer une nouvelle, un bouton nomme le geste (« Créer la grille »), et l'application te prévient si tu quittes avant. « Annuler » devient « Fermer ». » (À ajuster à ce que le lot couvre réellement, notamment si l'avertissement de sortie reste partiel.)

## 4 · Preuves

- Par comportement : (a) modifier le nom et le contexte spécifique d'une cartouche existante, puis changer de cartouche sans autre geste → en base, le témoin a dit « Enregistré » ; idem les jetons d'une pratique. (b) Nouvelle grille, remplie, puis « Fermer » → l'avertissement, « Rester » ne perd rien, « Quitter sans créer » n'écrit rien ; **rien en base avant « Créer la grille »**. (c) L'assistant ouvert puis abandonné n'écrit **aucune** grille ; en modification, il dit « Appliquer à la pratique ». (d) Le critère ajouté à une grille existante reste (#957 vert). (e) Un échec d'écriture sur un champ de la Conception : le témoin dit « Non enregistré – ‹geste› : … », aucun succès.
- Mutations, chacune rouge : un écrivain de la Conception sans témoin ; le nom de cartouche redevenu manuel ; les jetons redevenus manuels ; l'assistant qui crée sa grille de base à l'ouverture ; « Créer la grille » qui écrit avant le clic ; l'avertissement retiré.
- Vitest complet ; bancs WebKit voisins (#957, #898, #938, lot B, cartouches, assistant, grilles, échelles) verts ; placement des boutons renommés à 360, 768, 1024 et 1180 px, hors du témoin.

## 5 · Livraison

- **Relecture croisée exigée** (les gabarits de la Conception alimentent toutes les évaluations) : commit → `plans de travail/DEMANDE-RELECTURE-2026-09-27-lot-E1-conception.md` → relecture de Cowork → corrections → verdict → fusion.
- **Cases à cocher** : celles que ta recherche trouve réglées, et elles seules.
- **Stock** : rien n'est réécrit ni effacé. Une grille, une échelle, une cartouche ou une pratique existante le reste.
- Release `minor`. Mots, relevé des `alert` et Nouvelles acceptés par Grégoire avant le push.
- **Porte terrain** (Mac ou iPad, données réelles) : renommer une cartouche puis changer de cartouche, revenir ; commencer une nouvelle grille puis « Fermer » ; ouvrir l'assistant et l'abandonner.
