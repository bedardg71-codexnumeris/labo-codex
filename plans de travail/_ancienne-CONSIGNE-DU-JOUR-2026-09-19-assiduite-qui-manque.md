# Consigne suivante — l'assiduité qui manque (lot D du dépistage : #735, #743, #750)

> Écrite le 19 septembre 2026 à 10 h 35 (Toronto), par Cowork, sur accord de Grégoire (« oui », 10 h 35).
> **Condition de départ** : `main` local porte `a260acfc` (1.146.10, #906) ou plus récent. 1.146.10 n'est pas encore poussée : son push attend la phrase de « Nouvelles » lue par Grégoire et la relecture de Cowork ; ce lot n'attend pas ce push, mais ne pousse rien sans un « pousse » de Grégoire. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-19-bilan-premier-rendu.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> ⚠ **Arbre partagé** : quatre fichiers modifiés appartiennent à un autre travail (`js/interpretation-config.js`, `.claude/skills/ecosysteme-classe/SKILL.md`, le CADRAGE du 17 au soir, la RELECTURE du 17), plus des fichiers non suivis (`docs/projet de développement/`, `ignorés/`, le « Modèle de consigne… .txt », `Retours des testeurs/jean-françois/`). N'y touche pas, ne les commite pas, garde le jeton anti-cache d'`interpretation-config.js` tel quel (`20260910c`, comme en 1.146.9 et 1.146.10) ; indexe par chemins nommés.
> **Identifiant** : relis « Dernier ID utilisé » (#922 à l'écriture) et `grep` les deux registres avant d'inscrire.
> **Plan de référence** : `plans de travail/CADRAGE-2026-09-16-regles-du-depistage.md`, ligne du lot D et « Les critères retenus ». Les trois fiches portent les décisions de Grégoire (16 sept., 17 h 18-17 h 21) et ses mots (17 sept., matin).

---

## 1 · Ce que Grégoire verra

1. Dans la fiche d'un élève (ajout et édition, Cadre › liste du groupe), un champ facultatif **« Date d'arrivée »**, avec la bulle **« Facultatif : pour un·e étudiant·e arrivé·e en cours de trimestre. L'assiduité se compte à partir de cette date. »** Ces mots sont les siens : ne pas les retoucher.
2. Un élève qui porte une date d'arrivée n'hérite plus, comme absences, des séances d'avant cette date. Sans date saisie, rien ne change.
3. Tant qu'aucune séance n'est saisie pour un élève, son assiduité est **inconnue** : un tiret partout où elle s'affiche, comme la performance non calculable, au lieu de 100 % (et au lieu de « Très favorable » dans le contexte).
4. Les deux moyennes d'assiduité du groupe (Suivi du groupe et Liste) disent le même chiffre, selon la même règle : un élève à l'assiduité inconnue n'y entre pas ; un élève présent à des séances saisies y entre, à 0 % compris s'il a tout manqué.

## 2 · Ce que Cowork a mesuré (19 sept., 10 h 35, lecture de `main` à `a260acfc`) – à remesurer avant de coder

- `js/indices.js` : `calculerAssiduite(da, dateLimite)` (l. 147) rend `{ indice: 1, … nombreSeances: 0 }` à deux endroits (l. 172, l. 238) ; `calculerAssiduitePourAffichage` (l. 303) à côté. Deux appelants de `calculerAssiduite(` hors d'`indices.js` au grep – les lecteurs de l'indice A (enrichissement, snapshots, contexte, moyennes) sont bien plus nombreux : **c'est leur recensement qui fait le lot**.
- Aucun champ de date sur un élève : `grep -rn "dateAjout\|dateInscription\|dateArrivee\|dateEntree" js/*.js` → rien (fiche #735, constat A-2 exécuté : arrivé en semaine 6, A = 50 %).
- Formulaire : `index.html` l. 7029, `#v2-etudiantDA` ; le champ neuf va à côté (DA, Nom, Prénom, Groupe, Programme, SA). Écriture de la fiche : `js/trimestre-v2-etudiants.js` (`soumettreEtudiantV2`).
- « Très favorable » se lit dans `js/contexte-qualification.js`, `js/tableau-bord-apercu.js` et les trois `js/accompagnement-contenu-*.js`.
- Lot F (1.142.21) a laissé une garde en attente, notée sous #830 : un A absent (`null`) n'est pas « sous 70 » dans le filtre « A ou C < 70% ». Elle doit devenir vivante ici, et être jugée.

## 3 · Ce qui est attendu

- **Les choix techniques sont à toi**, dits en une ligne chacun : nom et format de la clé de la date sur la fiche, forme de l'inconnu (`null` ou autre), ordre des fichiers. Critère : une seule source pour « A inconnu », lue partout ; aucun lecteur ne transforme l'inconnu en 0 ni en 100 en silence.
- **Recense tous les lecteurs de l'indice A avant d'écrire** (écrans, moyennes, filtres, contexte, carte RàI, export, snapshots), et donne le compte dans ton rapport.
- La date d'arrivée voyage avec la fiche (export, import, Codex) : elle doit survivre à un aller-retour ; une fiche importée sans ce champ se lit comme avant.
- Version : un champ neuf est une fonction → `minor`, par `scripts/release.mjs`. Une entrée de « Nouvelles » en mots d'utilisateur, **proposée** : elle remonte à Grégoire par Cowork avant le push.

## 4 · Arrêts

- Si une **note finale** bouge pour un élève sans date d'arrivée : arrête-toi et dis lequel, avant et après.
- Si un trimestre d'A2025 ou d'H2026 affiche autre chose qu'un tiret là où il affichait 100 % faute de séance : dis-le avec l'écran et le chiffre (ces notes ne sont pas rouvertes, mais l'affichage peut changer).
- Si un écran n'a pas de place pour un tiret (graphique, barre) et qu'il faut un mot : propose-le, ne le pose pas.

## 5 · Stock

**Tarir, pas réparer.** Aucune fiche existante ne reçoit de date ; les relevés hebdomadaires et snapshots déjà écrits à 100 % le restent – écris-le dans le rapport, avec le compte sur le pack démo.

## 6 · Preuve

- Un banc WebKit qui fait le geste : un élève ajouté avec une date d'arrivée en semaine 6 → A compté depuis cette date ; le même sans date → A d'avant, mot pour mot.
- Un élève sans séance saisie → tiret au profil, dans la Liste, au contexte ; il sort des deux moyennes, qui disent le même chiffre.
- Le filtre « A ou C < 70% » ne retient pas un A inconnu.
- Aller-retour export/import de la date.
- Mutations : au moins une par règle (la date ignorée ; l'inconnu remis à 1 ; une moyenne qui compte l'inconnu ; le filtre qui le retient), chacune rouge, restauration à l'empreinte.
- Vitest complet depuis `tests/`. Le verdict Playwright se prend par `pousser.sh`, Cowork fermé.

## 7 · Porte terrain

Une seule rangée probable : le champ « Date d'arrivée » dans la fiche d'élève, sur iPad (768 px, clavier ouvert). Écris-la au markdown du skill `portes-terrain` ; Cowork publie l'artefact. Grégoire peut la reporter : elle ne bloque pas le push.

## 8 · Rapport

En gestes d'utilisateur, avec : les choix faits et ce que tu as supposé ; le compte des lecteurs de A ; source ou stock ; ce qui n'est pas mesuré ; la liste des chemins à commiter. Mets à jour `OU-EN-EST-ON.md` et `RELAIS.md`, et coche #735, #743 et #750 avec leur phrase « vérifié comment ».
