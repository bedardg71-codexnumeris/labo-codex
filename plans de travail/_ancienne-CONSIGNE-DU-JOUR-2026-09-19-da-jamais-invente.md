# Consigne suivante — l'application n'invente plus de DA (#914)

> Écrite le 19 septembre 2026 à 13 h 40 (Toronto), par Cowork, sur accord de Grégoire (« Oui »).
> **Condition de départ** : `origin/main` = `88371a4a` (1.147.1 poussée) ou plus récent. Archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-19-phrases-assiduite-inconnue.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> ⚠ **Arbre partagé** : les quatre fichiers de l'autre travail (`js/interpretation-config.js`, `.claude/skills/ecosysteme-classe/SKILL.md`, le CADRAGE du 17 au soir, la RELECTURE du 17) restent hors de l'index ; jeton d'`interpretation-config.js` à `20260910c` (release.mjs voudra le bumper : remets-le, comme aux trois derniers lots).
> **Identifiant** : aucune fiche neuve attendue ; sinon « Dernier ID utilisé » (#922 à l'écriture) et `grep` des deux registres.
> **Ce lot ne demande rien à Grégoire** sauf le « pousse » : la règle est la sienne (fiche #914, 17 sept. au soir), le message d'erreur est lu par des enseignants, pas par des élèves – tu le choisis et tu le nommes.

---

## 1 · La règle de Grégoire, telle quelle

« Aucune DA ne devrait être inventé de toute pièce dans l'application. Il n'existe qu'un seul format, et c'est celui créé par le collège » : **sept chiffres, rien d'autre.**

## 2 · Ce que Grégoire verra

Cadre › Groupe d'étudiant·es, formulaire d'ajout : un DA vide ou qui n'a pas sept chiffres est **refusé** avec un message clair, et rien n'est enregistré. Aujourd'hui, un DA vide devient `DA` + horodatage, en silence.

## 3 · Ce que Cowork a mesuré (19 sept., lecture de `main` à `88371a4a`) – à remesurer

- `js/trimestre-v2-etudiants.js`, `soumettreEtudiantV2` (l. 378) : l. 404, `da: da || \`DA${Date.now()}\`` – **seul site** de fabrication dans `js/` au grep.
- Le même formulaire sert à l'**édition** (`etudiantEnEditionIndex`, `etudiantEnEditionDA`, fusion l. 446-456). ⚠ En édition, un DA effacé à l'écran recevrait AUJOURD'HUI un DA inventé, et la fusion l'écrirait sur la fiche : l'élève changerait d'identifiant et perdrait ses évaluations et présences. Même correctif.
- ⚠ **Le pack démo porte des DA « DEMO004 », « DEMO015 »** (capture de Grégoire, 12 h 01) : une validation à chaque enregistrement empêcherait de modifier un élève de démonstration. Décision de Cowork, à tenir : **le DA n'est validé qu'à la création, et en édition seulement s'il a changé** (`da !== etudiantEnEditionDA`). Un DA existant non conforme se garde tel quel.
- La garde « DA déjà dans le groupe » (l. 430-434) reste, et passe après la nouvelle.
- Le champ `#v2-etudiantDA` (`index.html` ≈ l. 7029) porte `placeholder="1234567"` : un attribut `inputmode="numeric"` aiderait l'iPad (clavier chiffré) – à ton jugement, dit en une ligne.

## 4 · Hors du lot, à MESURER et à DIRE (pas à changer)

- **L'import collé / fichier** (`analyserListeEtudiantsCollee` l. 827, `traiterDonneesImportV2` l. 852, `confirmerImportV2` l. 893) : accepte-t-il une ligne dont le DA n'a pas sept chiffres, ou n'en a pas du tout ? Il n'invente rien, mais il laisse passer un autre format que celui du collège. Donne le comportement exact, avec un exemple : **c'est une question pour Grégoire**, Cowork la lui portera.
- **Le stock** : combien de fiches du pack démo et de la base de test portent un DA en `DA` + 13 chiffres ? Tarir, pas réparer : aucun DA existant n'est réécrit.

## 5 · Arrêts

- Si un autre chemin que le formulaire fabrique ou modifie un DA (Rencontres, import, Codex, registre) : arrête-toi et dis lequel.
- Si le refus d'un DA non conforme bloque un geste existant au-delà du cas démo (fixture, banc, autre écran) : dis-le avant de contourner.

## 6 · Preuve

- Sentinelle Vitest : DA vide → refus, rien d'écrit ; « 123456 », « 12345678 », « DA1234567 », « 123 4567 » → refus ; « 1234567 » → accepté ; espaces en tête et en fin retirés avant de juger (à ton jugement, dit) ; édition d'un élève « DEMO015 » sans toucher au DA → enregistrée ; édition qui efface le DA → refusée, fiche intacte.
- Banc WebKit qui fait le geste au formulaire : le message lu à l'écran, la liste inchangée.
- Mutations : la garde retirée ; la garde appliquée aussi en édition sans changement (le cas démo doit rougir) ; l'ancien repli `DA${Date.now()}` remis. Chacune rouge, restauration à l'empreinte.
- Vitest complet depuis `tests/`. Le verdict Playwright par `pousser.sh`, Cowork fermé.
- Version : patch `1.147.2` ; une ligne de « Nouvelles » proposée, elle remonte à Grégoire par Cowork avant le push.

## 7 · Rapport

En gestes d'utilisateur : le message choisi et ce que tu as supposé, le comportement de l'import (§4) avec son exemple, le compte du stock, ce qui n'est pas mesuré, et la liste des chemins à commiter. Mets à jour `OU-EN-EST-ON.md` et `RELAIS.md`, coche #914 avec sa phrase « vérifié comment ».
