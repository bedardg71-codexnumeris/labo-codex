# Consigne du jour – créer ou adopter une pratique : ce que l'écran promet est ce qui s'applique (#909, #903)

> Écrite le 21 septembre 2026, 8 h 05 (Toronto), par Cowork. **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (#892) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-20-892-nettoyage-sans-perte.md` (déplacée par Cowork, à commiter avec ce lot).

## 0 · Conditions de départ – mesure-les, ne les crois pas

- `git fetch && git log --oneline -1 origin/main` : doit porter **1.151.6** (`5d269d47` ou un commit de journal après, `fe3e884e` au 21 à 7 h 56). Sinon, arrête-toi et dis ce que tu vois.
- Aucune autre session Claude Code n'écrit (`pgrep -fl claude`, worktrees) ; aucun `pousser.sh` en cours.
- Arbre de travail : seuls le **lot orphelin du 19 sept.** (§1) et les fichiers de Cowork (§5) doivent être modifiés ou non suivis. Autre chose : arrête-toi.

## 1 · Le lot orphelin du 19 sept. – COMMITE-LE, en premier et seul

**Décision de Grégoire, 21 sept., peu avant 8 h 05 (« oui » à la recommandation de Cowork) : commiter.** Quatre fichiers, rien d'autre :
`js/interpretation-config.js` (un commentaire), `.claude/skills/ecosysteme-classe/SKILL.md`, `plans de travail/CADRAGE-2026-09-17-soir-registre-longitudinal.md`, `plans de travail/RELECTURE-2026-09-17-analyse-101-102-de-2025.md`.
Contenu : sa décision du 19 – les bornes 60 / 75 / 85 restent, la prétention « validé empiriquement » s'en va. Aucun comportement ne change.
⚠ `js/` modifié → jeton anti-cache de `index.html` pour `interpretation-config.js` à aligner selon la règle habituelle ; pas de release pour ce seul commit (build-only si ta chaîne l'exige). Vitest vert avant commit. Dis dans `RELAIS.md` que le piège de `release.mjs` (1.151.4, 1.151.5) est levé.

## 2 · #909 – adopter un modèle Standards dans un trimestre sans aucune échelle

**Tranché le 17 sept. à 15 h 06** (ligne ✅ sous la fiche) : la fenêtre s'ouvre quand même, dit pourquoi, nomme où aller, **l'adoption n'a pas lieu**.
**Texte à poser** – celui de Grégoire, avec le nom d'écran corrigé par Cowork le 21 sur la mesure (la navigation écrit « Conception → Échelles de performance », `index.html` l. 5753, 10399, 10900) ; Grégoire en est informé et peut le reprendre :
> « Ce modèle a besoin d'une échelle de performance pour calculer la note, et ce trimestre n'en a aucune. Crée une échelle dans Conception → Échelles de performance, puis reviens adopter ce modèle. »

- **« Aucune échelle utilisable »** = la liste que le lot 34 offre déjà (`echellesTemplates` du trimestre, `dansBibliotheque !== false`) vide. Ne réinvente pas le prédicat : réutilise celui de #898 / #910.
- **Les deux gestes d'adoption disent la même chose** (fiche : « les deux gestes d'adoption ») – remesure lesquels, et nomme-les.
- Rien n'est écrit dans les données quand l'adoption n'a pas lieu : un contrôle octet pour octet de `pratiquesConfigurables` (et de ce que l'adoption écrit d'ordinaire) avant / après.
- **C.5 de `sentinelle-898-echelle-a-l-adoption` doit rougir** sur le code neuf (il fige l'ancien geste) : réécris-le pour juger le nouveau, ne le supprime pas.

## 3 · #903 – retirer de l'assistant les trois règles que rien n'applique

**Tranché le 17 sept. à 13 h 37** : retirer de l'assistant les cases **plafonnement, remplacement, reprises**. Restent : le verrou « doit être réussie » (lot 29), le seuil, les jetons.

⛔ **Limite de Grégoire du 20 sept. : « Je ne veux pas qu'on efface des données de façon irréversible. »** On retire des CASES, pas des données :
- **Une pratique déjà enregistrée garde ce qu'elle porte.** Rouvrie et réenregistrée par l'assistant, son diff de réédition est **vide, ces trois champs compris** (décision de Cowork : on les laisse passer tels quels plutôt que de les effacer ; ils ne sont lus par aucun calcul, mesuré au lot 29). Si l'assistant reconstruit l'objet au lieu de le fusionner et qu'il faut du code pour conserver ces champs, écris-le et dis-le.
- Une pratique **neuve** ne les écrit plus.

**À remesurer avant de coder** (la fiche l'exige) : ce que l'assistant ÉCRIT pour ces trois règles (`reglesSommatives`, paires de remplacement, déclaratif des reprises, `portfolio.reprisesPermises` en STD) et **qui d'autre le lit**. Si un lecteur vivant autre que l'affichage existe, **arrête-toi** : la prémisse « rien ne les applique » tombe, et ça remonte à Grégoire.

**Ce que l'écran dit encore, à retirer avec les cases** (aucun mot neuf) :
- l'assistant (`js/wizard-pratique-v2.js`) : « Remplacement automatique : l'évaluation finale remplace la mi-session si elle est meilleure », « Plafonnement : la note est plafonnée si certaines conditions ne sont pas remplies », et tout récapitulatif qui les annonce ;
- le Comparateur (`js/pratiques/construction-attributs.js` l. 253 et voisines) : « Actif (la finale remplace la mi-session si meilleure) », « Actif » – **décision de Cowork** : ces lignes disparaissent aussi, même pour une pratique ancienne qui porte les champs, parce qu'elles annoncent comme active une règle que rien n'applique. Si les retirer oblige à écrire une phrase neuve, arrête-toi et propose-la (mots lus par des collègues).
- `js/changelog-data.js` : les anciennes « Nouvelles » gardent leurs mots (on ne réécrit pas l'histoire).

**Hors lot, à ne pas toucher** : le code dormant de `pratique-configurable.js` (`calculerNoteFinale` et voisins) – niveau 3, déjà nommé ; le verrou par nom en texte libre (ajout du 17 sous #903) – sans symptôme vécu.

## 4 · Deux cases de suivi à recaler (sans release, avec le lot)

- **#830** (la barre « Assiduité (A) » du Suivi se tait sans périodes) : la page du tri la dit livrée en 1.147.0. **Date le correctif contre le symptôme** (`git log -S` sur le symbole introduit) et vérifie que le « — » attendu est bien rendu. Coche seulement si c'est prouvé ; sinon, écris ce qui reste sous la fiche.
- **#872** (Mathieu, deuxième groupe) : toujours au tableau « Ouverts » de `SUIVI-BUGS.md`, alors que 1.142.1 et 1.149.0 y ont répondu. Même méthode ; déplace la ligne vers « Corrigés » seulement si c'est prouvé, avec ce qui reste chez Mathieu (stock) dit en une ligne.
- Lis le run planifié GitHub du 21 sept. ≈ 4 h et note son verdict au relais.

## 5 · Fichiers de Cowork à commiter avec ce lot

`CONSIGNE-DEMARRAGE-COWORK.md` (réécrit le 21 à 8 h 05), `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-17-09h45.md`, `plans de travail/CONSIGNE-DU-JOUR.md` (celle-ci), `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-20-892-nettoyage-sans-perte.md`.

## 6 · Preuves attendues

- Sentinelle Vitest neuve pour #909 et #903 + C.5 réécrit ; au moins un banc WebKit par le **vrai geste** (adopter dans un trimestre sans échelle ; rouvrir par l'assistant une pratique SOM qui porte les trois champs, enregistrer, diff vide).
- Mutations, une clause à la fois, toutes rouges : l'adoption qui a lieu quand même ; le texte changé ; un seul des deux gestes corrigé ; un des trois champs effacé à la réédition ; une case remise dans l'assistant ; la ligne du Comparateur remise.
- Vitest complet vert. **Release : minor** (un geste change à l'écran) ; **phrase de « Nouvelles » à PROPOSER à Grégoire** avant de l'écrire.
- **Relecture croisée par Cowork avant le verdict et le push** (commit → relecture → corrections → verdict → push). Ne pousse pas sans le mot de Grégoire.

## 7 · Ce que Grégoire verra (à écrire en tête d'`OU-EN-EST-ON.md`)

Conception › Pratiques de notation : dans un trimestre sans échelle, adopter un modèle Standards affiche sa phrase et n'adopte rien. L'assistant de pratique ne propose plus plafonnement, remplacement ni reprises ; le Comparateur ne les annonce plus « Actif ». Ses pratiques déjà créées ne perdent rien.
