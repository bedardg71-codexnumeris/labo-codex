# Consigne du jour – le matériel de départ : sa suppression vaut pour son trimestre, ses anciens noms se rattrapent (#683, #684)

> Écrite par Cowork le 15 octobre 2026 à 11 h 36 (Toronto, mesurée par `date`). L'ancienne consigne (décisions des groupes 1 et 2, avec le verdict de Cowork de 11 h 27) est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-15-groupes-1-et-2.md`. Commite ce fichier et ce déplacement avec ton lot, ainsi que `DECISIONS-2026-10-15-groupe-3.md` (non suivi à l'écriture).

## Où on en est

`main` local à `90a8cbdd` (le lot #489 et sa correction, relus, non poussés). `origin/main` porte `d5c03cd0` (observation) : fusionne-le avant d'écrire au BACKLOG, comme ce matin (fusion, pas rebase). **Remesure avant de toucher.** Une autre session écrit l'observation sous `plans de travail/observation/` : n'y touche pas.

Ce lot exécute deux décisions du groupe 3 (`DECISIONS-2026-10-15-groupe-3.md`, questions 1 et 6), toutes deux sur le matériel de départ, et pose au BACKLOG les lignes des questions déjà closes. Skills : `integrite-globaux`, `hygiene-donnees-partagees`.

## Le mandat : un lot, trois parties

### 1. #683 – une suppression du matériel de départ ne vaut que pour son trimestre

Décision de Grégoire à 11 h 04 (question 1).

- **Mesuré par Cowork à 11 h 36.** `estRessourceSupprimee` et `marquerRessourceSupprimee` (`js/main.js` ~134-146) lisent et écrivent `ressourcesSupprimees`, clé GLOBALE. Quatre semeurs la lisent : `assurerGrilleDeDepart` (`js/grilles.js` ~1595), `assurerEchelleIdmeDeDepart` (`js/echelles.js` ~360) et `assurerCartoucheDeDepart` (`js/cartouches.js` ~144), qui sèment dans des collections namespacées (`cle(...)`) ; et `ajouterGabaritsDefautSiManquants` (`js/gabarits-utils.js` ~254), qui sème les `GABARIT_*` dans `bibliothequeGrilles` et `bibliothequeProductions`, clés GLOBALES.
- **À faire.** Une suppression pose désormais sa marque dans une clé du trimestre (`cle('ressourcesSupprimees')`). `estRessourceSupprimee` lit la marque du trimestre ET l'ancienne marque globale : les suppressions déjà faites gardent leur portée, sans réécriture (l'ancienne clé n'est ni migrée ni vidée).
- ⚠ **Supposition de Cowork, à tenir : la portée de la marque suit celle de la collection.** Les `GABARIT_*` vivent dans des bibliothèques globales : les supprimer les retire de tous les trimestres, et une marque par trimestre les ferait ressemer à la bascule suivante, partout, y compris là où ils ont été supprimés (#468/CO-25 rouvert). Leur marque reste globale. Remesure chacun des neuf identifiants d'`IDS_GABARITS_HARDCODES` (collection, namespacée ou non, semeur vivant ou non) et range-le d'un côté ou de l'autre ; la liste va dans la demande de relecture.
- **Garde de boot (#358).** Avant que le trimestre actif soit connu, `cle()` retombe sur la clé nue, c'est-à-dire l'ancienne marque globale. Mesure si une suppression peut se faire dans cet état ; si oui, la marque ne doit pas tomber en silence dans la globale.
- **Sans décision (mécanisme (i) de la fiche) : la bascule sème.** `changerTrimestreActifV2` (`js/trimestre-v2-liste.js` ~386) appelle les semeurs de départ une fois le trimestre actif établi : grille, puis échelle, puis cartouche (la cartouche exige la grille du même trimestre). La bascule sème exactement comme le chargement, pas plus : si le chargement s'abstient dans un trimestre clos ou revenu des archives, la bascule aussi ; s'il ne s'abstient pas, inscris-le (issue 2), sans l'élargir ici.
- **Ce qui voyage.** Mesure si `ressourcesSupprimees` part dans le codex ou un export et revient à l'ouverture (aucune occurrence nommée dans `codex.js` ni `import-export.js` au 15 oct. ; vérifie un balayage générique des clés). Rapporte ; ne change rien d'autre.
- **Registre** : la nouvelle clé entre dans `docs/DATA-OWNERSHIP.md` (ligne `ressourcesSupprimees`, ~402).
- **Source ou stock** : source seulement. Les marques globales déjà posées restent et gardent leur portée : assumé par la décision.

### 2. #684 – les anciens noms du matériel de départ, rattrapés une fois

Décision de Grégoire à 11 h 20 (question 6), issue (A).

- Une migration au chargement, une seule fois (drapeau daté, idempotente), remplace les cinq anciens libellés du matériel de départ par les nouveaux (#682), **seulement si le nom est égal au caractère près à l'ancien libellé écrit par le code**, revérifié dans le mutateur (`db.modifier`). Tout autre nom appartient à l'usager et n'est jamais touché.
- **La table des cinq paires et la condition stricte sont dans `scripts/renommage-682-materiel-seme.js`** (le script collé par Grégoire le 1er sept.) : reprends-les de là, ne les réécris pas de mémoire.
- Tous les trimestres où ces copies vivent, pas seulement l'actif : mesure lesquels.
- **Un ancien codex ouvert après la migration** ramènerait les anciens noms. Mesure si le drapeau voyage avec le codex et ce que ça produit ; tranche, et dis-le dans la relecture.
- C'est une écriture dans les données de collègues qui ne l'ont pas demandée : autorisée par Grégoire pour ce cas seulement. Le nom d'une grille s'imprime sur le PDF des élèves : assumé par lui.
- Chez Grégoire, en principe rien ne change : son script du 1er sept. a déjà renommé ses copies.
- **Ligne des Nouvelles** : un collègue verra ses noms changer. Propose-la dans la demande de relecture ; elle sera soumise à Grégoire avec la version du soir.

### 3. Le BACKLOG

Chaque ligne est écrite, telle quelle, dans `DECISIONS-2026-10-15-groupe-3.md` (« Ligne à poser sous #… ») : recopie-la sous sa fiche.

- Avec ce lot : #683 et #684. Coche-les si les parties 1 et 2 sont faites entières.
- Déjà décidées, sans code : #622 (reste ouverte), #546 (coche-la), #450 (coche-la), #279 (coche-la), #274 (reste ouverte). Et la ligne de la question 4 dans `plans de travail/PLAN-SOLO-echelle-et-depistage.md`, sous D4 (~57) et sous C4 (~149).
- Pas maintenant : #378 et #291. Leurs lignes iront avec leurs lots.

## Les bancs

- Vitest : la marque par trimestre et la lecture de l'ancienne marque ; un `GABARIT_*` supprimé ne revient pas après une bascule ; la migration (égalité stricte, un nom retouché d'un seul caractère reste, idempotence, drapeau).
- Playwright, écrit et non lancé : supprimer la grille de départ dans un trimestre, basculer vers un trimestre vierge, elle y est sans rechargement ; revenir, elle reste absente du premier ; une ancienne marque globale la garde absente des deux.
- Break-test pour chaque essai neuf. ⚠ Leçon de 11 h 27 : avant de toucher, cherche aussi les clés et les champs concernés dans `tests/integration` ; Vitest ne lance pas ces bancs.

## Pas de porte terrain

Une machine répond : la bascule se prouve au banc. Chez Grégoire, en principe, rien ne change à l'écran.

## La méthode

Commit, Vitest complet (depuis `tests/`), demande `plans de travail/DEMANDE-RELECTURE-2026-10-15-materiel-de-depart.md`. **Aucun push, aucune release, aucun verdict Playwright avant son signal du soir.** Rapport court à Grégoire, en gestes d'utilisateur.

## Verdict de Cowork, 15 oct. 2026 à 13 h 10 (Toronto, mesuré par `date`)

**Relu sur `128d338e` et `5d726dc3` : accepté, sans correction.** Lu au diff et dans `DEMANDE-RELECTURE-2026-10-15-materiel-de-depart.md` ; Vitest non relancé par Cowork (ta suite verte, 8 810 sur 8 810, et les 17 break-tests décrits font foi).

- **Suppositions 1 à 5 acceptées.** Le nom distinct de la clé est le bon choix : sous le nom nu, les boucles de rapatriement auraient déplacé puis effacé l'ancienne marque globale.
- **Trois paires, pas cinq : confirmé.** Le « cinq » de la consigne venait de la décision, qui le tenait de la fiche #684 : cinq COPIES chez Grégoire (la grille dans h2026, l'échelle dans a2026, la cartouche dans trois trimestres, mesure de #683), pour trois libellés. Erreur de Cowork, recopiée sans remesure.
- **La migration n'écrit que là où une copie porte l'ancien nom** (`continue` avant tout `db.modifier` si la clé est absente ou sans ancien nom) : elle ne crée aucune clé dans un trimestre archivé. Les trimestres archivés migrés : accepté.
- **Le drapeau qui suit le codex** : `donnees` est bien l'objet des clés du codex, `db.remove` existe, l'appel suit la boucle d'écriture. Accepté.
- **Issue 3, sans fiche** : le semis de la bascule n'est pas attendu par `changerTrimestreActifV2` (`.catch` seul). Un écran déjà rendu peut ne montrer la grille de départ qu'à la navigation suivante ; la donnée, elle, est là, ce qui ferme le cas de la fiche (aller droit à l'évaluation après une bascule). Deux bascules très rapprochées pourraient semer dans le second trimestre plutôt que le premier : sans conséquence observable, puisqu'il l'aurait reçu à sa propre bascule.
- **Lignes des Nouvelles** : soumises à Grégoire avec la version du soir, pas avant.
- **Les fichiers des groupes 4 et 5** (`CONSIGNE-LOT-2026-10-15-groupe-4.md`, `DECISIONS-2026-10-15-groupe-4.md`, `DECISIONS-2026-10-15-groupe-5.md`) appartiennent au lot qui les exécutera : ne les commite pas ici.

Rien à faire de ton côté pour ce lot.
