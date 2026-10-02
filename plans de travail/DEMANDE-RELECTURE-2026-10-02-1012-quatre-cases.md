# Demande de relecture – #1012, les quatre cases de l'import ne remplacent plus ce que l'espace a

> Écrite par Claude Code le 2 octobre 2026 à 11 h 16 (Toronto, mesurée par `date`), sur la consigne de Cowork de 10 h 33.
> Branche locale `fix-1012-quatre-cases`, commit `d0927efb`, partie de `main` à `5e8a46f8` (la consigne de Cowork commitée telle quelle). **Ni release, ni push du code.** Version : 1.174.2, inchangée.
> Ce chemin écrit les données de l'usager, notes comprises : relecture croisée avant toute release (règle 2).

## Pour Grégoire, en trois lignes

- **Ce qui est codé** : quand tu ouvres un ancien fichier par « Ouvrir un Codex… » de Réglages › Données et que tu coches « Étudiants », « Présences », « Notes » ou « Annotations », ce que le fichier apporte de neuf s'ajoute à ce que tu as. Avant, chaque case remplaçait tout : des élèves, des présences, des notes et des annotations de ton espace disparaissaient ou étaient réécrits.
- **Ce que j'ai trouvé autour** : « Configuration du cours », « Cadre du trimestre », « Groupe-cours », « Horaires » et « Enseignants » remplacent encore (les deux premières le disent à l'écran) ; aucune n'est cochée par défaut. Un élève que tu as supprimé revient si l'ancien fichier le porte. Inscrit, rien de corrigé.
- **Ce qui t'attend** : rien avant la relecture de Cowork. Ensuite, la ligne des « Nouvelles » (§ 11).
- **Ce que j'ai supposé** : pour les notes, j'ai pris une règle plus stricte que celle de la consigne (§ 3 et § 8) : une évaluation du fichier n'entre que si ton espace n'a aucune évaluation de ce même élève pour cette même production.

## 1 · D'abord

La consigne de Cowork de 10 h 33 et l'ancienne consigne archivée sont commitées telles quelles sur `main` (`5e8a46f8`). Rien n'est poussé de ce lot. `guide-alignement-actuel.md` et `Claude outputs/` (septembre) restent non suivis, hors de tout commit.

## 2 · Le défaut, remesuré avant de corriger

Sur `main` (1.174.2), `executerImportSelectif` (`js/import-export.js`) faisait `db.set` avec la valeur du fichier pour les quatre familles. **Reproduit par le geste** (banc `codex-1012-ancien-zip-par-la-case.spec.js`, essai (3), avant correctif) : un codex tenu dont l'espace porte deux élèves, deux fiches de présences, deux évaluations et une annotation ; un ancien `.zip` qui a les mêmes choses (autrement remplies) et d'autres ; « C'est ma propre sauvegarde », tout coché. Ce que l'espace a perdu :

| Case | Avant le correctif |
|---|---|
| Étudiants | Camille (absente du fichier) disparaît ; la fiche d'Alix est réécrite par celle du fichier |
| Présences | les deux fiches de l'espace disparaissent ; la fiche d'Alix du 2 sept. devient celle du fichier (0 période) |
| Notes | l'évaluation d'Alix passe de 85 à 10 ; celle de Camille disparaît ; deux évaluations d'Alix pour la même production s'ajoutent |
| Annotations | l'annotation de la copie de l'espace est réécrite (autre texte, autre copie) |

**Une correction à la consigne** : « C'est ma propre sauvegarde » coche **trois** cases, pas quatre : Étudiants, Présences, Notes (`toggleDonneesPersoImport` coche le bloc `#checkboxesDonneesPerso`). « Annotations » est dans la section des copies ; le banc la coche avec le reste.

## 3 · La règle appliquée

Ce que le fichier apporte s'ajoute ; rien de ce que l'espace a ne perd son entrée ni n'est réécrit ; une même chose des deux côtés, l'espace l'emporte. Une seule fonction pure, `fusionnerDonneesPersoImportees(valeurEspace, valeurFichier, famille)`, avec une table de « marques » par famille (`MARQUES_DONNEES_PERSO`) : une entrée du fichier qui partage une marque avec une entrée de l'espace est déjà là.

- **Étudiants** : le DA.
- **Présences** : la date, le DA et le cours ; un `coursId` absent d'un côté = même cours (comme `saisie-presences.js`).
- **Notes** : l'`id`, **et le couple élève × production**. Mesuré : une évaluation se reconnaît à `etudiantDA` × `productionId` ; une reprise est une seconde évaluation du même couple, signée `repriseDeId` + `jetonRepriseApplique` (ou `repriseDeIdCiblee`), et l'originale porte alors `remplaceeParId` (le seul prédicat d'exclusion du moteur de note). **Pourquoi pas « même reprise »** : une reprise du fichier dont l'originale est dans l'espace entrerait, mais l'originale de l'espace, elle, n'est pas archivée (l'espace l'emporte, on ne la réécrit pas) : il y aurait deux évaluations actives pour le couple, et la note de l'élève changerait. Avec la règle du couple, une lignée du fichier entre entière (originale archivée et reprise) quand l'espace n'a rien de ce couple, et pas du tout sinon.
- **Annotations** : l'`id`, et la copie annotée (`fichierId`) : une copie n'a qu'une annotation.
- Une entrée sans aucune marque se reconnaît à son contenu entier ; les entrées du fichier ne se comparent qu'à l'espace, donc le même fichier rouvert ne double rien.
- **Une valeur qui n'est pas une liste** (l'ancien format des présences, un dictionnaire par date ; `evaluations` ou `notesEtudiants` en objet) n'est écrite que si l'espace n'a rien sous cette clé ; sinon l'espace l'emporte.

`fusionnerParIdentite` n'est pas employée (elle renomme au lieu de garder).

## 4 · Ce qui change dans le code

- `js/import-export.js` : `MARQUES_DONNEES_PERSO`, `fusionnerDonneesPersoImportees` (exposée sur `window` pour ses essais) ; les quatre blocs de `executerImportSelectif` passent par elle, et n'écrivent que s'il est entré quelque chose. Les comptes du bilan disent ce qui est entré.
- `index.html` : jeton anti-cache de `import-export.js` (`20261002d`).
- Aucun mot neuf à l'écran.

## 5 · Autour : ce que les autres cases de cet import remplacent (point 3 ; rien n'est corrigé)

Lu dans `executerImportSelectif`, non mesuré par le geste. Aucune de ces cases n'est cochée par défaut, ni par « C'est ma propre sauvegarde ».

| Case | Ce qu'elle fait | L'écran le dit ? | Ce qu'une copie ou une évaluation y perd (inféré) |
|---|---|---|---|
| Configuration du cours | `db.set` de `modalitesEvaluation`, `infoCours`, `listeCours`, `trimestres` | oui : « remplacera ta configuration actuelle » | aucune entrée ; mais la pratique de notation du trimestre peut changer (la note calculée aussi), et un cours absent du fichier sort de la liste, ses productions et évaluations gardant un `coursId` qui ne pointe plus nulle part |
| Cadre du trimestre | `db.set` des clés calendrier | oui : « remplace bornes, journées sans cours et séances » | aucune entrée ; les séances qui fondent l'assiduité changent |
| Groupe-cours | `db.set` de `*_groupesCours` | non | aucune entrée ; un groupe de l'espace absent du fichier disparaît |
| Horaires | `db.set` de `*_horaires` | non | aucune entrée ; l'horaire de l'espace est remplacé |
| Enseignants | `db.set('enseignants')`, clé globale | non | aucune entrée ; un profil de l'espace absent du fichier disparaît |

**Un élève supprimé revient** (supposition de Cowork, mesurée par lecture) : « Supprimer » retire la fiche du groupe (`supprimerEtudiant`, `js/groupe.js`, un `filter`) ; l'abandon est un statut, la fiche reste. Un élève supprimé que l'ancien fichier porte entre donc de nouveau. Rien n'est changé.

**Deux clés sans lecteur** : `evaluations` et `notesEtudiants` ne sont lues que par l'import (`grep` dans `js/`). Traitées comme le reste (ajouter sans réécrire), rien n'est retiré ; leur retrait est inscrit (issue 2).

**Mots qui mentent (relevés, non touchés)** : « N date(s) de présences » au bilan, et « N date(s) » à l'aperçu, comptent des fiches.

**Relevé du matin, toujours ouvert** (« Copies et notes de deux sources ») : une copie neuve du fichier dont le couple est déjà évalué dans l'espace entre avec un `evaluationId` qui désigne l'évaluation du fichier, laquelle n'entre pas. Lu, non exécuté.

Inscrit sous #1012 dans `BACKLOG.md` (cinq lignes, sur `main`).

## 6 · Source et stock (point 4)

Ce lot tarit la source. Chez qui a déjà fait cet import avec ces cases, ce qui a été remplacé est perdu dans l'espace. **On ne peut pas le reconnaître depuis l'espace seul** : l'import n'écrit aucune trace (aucune clé de journal, aucune date d'import sur ces familles). Seul un codex écrit **avant** l'import, s'il existe encore, permettrait une comparaison. Rien n'est réparé.

## 7 · La preuve

- **Banc par le geste** (`tests/integration/codex-1012-ancien-zip-par-la-case.spec.js`) :
  - **(3)** : rouge avant correctif (§ 2), vert après. Après l'import, chaque famille est exactement l'espace suivi du neuf du fichier ; les deux notes de l'espace sont inchangées (85 et 60, sans `remplaceeParId`) ; le bilan dit « 1 étudiant(s) », « 1 date(s) de présences », « 1 annotation(s) » ; le même fichier rouvert ne change rien ; « Mettre à jour le codex » écrit dans le fichier tenu, sans fenêtre, les quatre familles fusionnées.
  - **(4) témoin** : les quatre cases décochées, rien ne bouge.
- **Vitest** (`tests/unit/import-1012-quatre-cases.test.js`, 16 essais) : chaque famille, le cours absent des deux côtés, l'ancien format, la lignée d'un couple, les clés sans lecteur, le même fichier rouvert ; un verrou de structure (les quatre cases appellent la fusion de leur famille, aucune n'écrit la valeur brute du fichier).
- **Mutations** : neuf, toutes rouges, fichier restauré à l'empreinte. Les quatre écritures brutes rétablies (une par famille), la marque du couple retirée, la marque de la copie annotée retirée, le joker du cours absent retiré, l'ancien format qui écrase l'espace (rouge en Vitest seulement : le banc n'emploie pas ce format), l'élève reconnu par son `id` au lieu du DA.
- **Vitest complet** : 671 fichiers, 7 919 essais, verts.
- **Bancs voisins, sans reprise** : la case, l'avertissement, le fichier d'origine, `import-cartouche-renommee-654`, `lot-i-bis-anciens-fichiers-s-ouvrent` : 24 essais verts.
- **Pas pris** : la suite complète au navigateur (au verdict, avant un push).

## 8 · Écarts avec la consigne

1. **Notes** : règle du couple (élève × production) plutôt que « même élève, même production, même reprise » (§ 3). À trancher par Cowork ; si la règle de la consigne est retenue, il faut dire ce que devient l'originale de l'espace, et c'est le sens d'une note : Grégoire.
2. **Deux sentinelles réancrées par ce lot** : `sentinelle-lot-D-735-743-750-assiduite-qui-manque` (g) lisait la ligne `db.set(cleEtu, etudiants)` ; elle lit maintenant l'appel de la fusion, et vérifie que la fusion concatène les fiches entières. Mon essai neuf découpait par `indexOf` (rouge à `sentinelle-858`) : il passe par `tranche()`.
3. **Le banc du lot I bis** (`lot-i-bis-anciens-fichiers-s-ouvrent.spec.js`) compare ce que l'ouverture des anciens fichiers de 1.172.0 écrit à des empreintes relevées alors, que le fichier dit de ne pas réajuster. **Je ne les ai pas réajustées** ; le banc nomme deux écarts, dus à ce lot : (a) `demo_groupeEtudiants` n'est plus dans l'écart : le fichier porte une liste vide, et en 1.172.0 l'ouverture **vidait le groupe démo** de l'espace (l'empreinte de référence est celle de `[]`) ; le banc vérifie maintenant que ce groupe reste tel quel, et ce contrôle rougit sous la mutation des élèves bruts ; (b) le bilan dit « 2 date(s) de présences » au lieu de « 315 » : les 313 fiches démo du fichier sont déjà dans l'espace, seules les 2 dates de l'ancien format entrent. Toutes les autres empreintes et le reste du bilan se comparent au caractère près.

## 9 · Ce qui reste inféré, ce qui n'est pas fait

- **Chrome et son vrai magasin** : le banc tourne dans WebKit.
- **La note calculée** : le banc vérifie que les évaluations de l'espace ne changent pas, pas la note finale calculée par le moteur ; une évaluation neuve du fichier, pour un couple absent de l'espace, change bien la note de cet élève : c'est ce que l'usager a demandé en cochant « Notes ».
- **Le coût** : la fusion est linéaire (un ensemble de marques) ; non mesurée sur un gros fichier.
- **Hors du lot** (la consigne) : les copies d'un collègue, `executerImportLocalStorageBrut`, les mots en attente de Grégoire.

## 10 · Inscriptions dues à `BACKLOG.md`

Faites, sur `main`, sous #1012 : le lot codé ; les deux clés sans lecteur ; l'élève supprimé qui revient ; les autres cases qui remplacent ; « N date(s) » qui compte des fiches.

## 11 · Proposition pour les Nouvelles (à accepter par Grégoire)

Release `patch` (1.174.3) ; la ligne entre dans l'entrée 1.174, son titre en tête :

> **Ouvrir un ancien fichier ne remplace plus tes élèves, tes présences, tes notes ni tes annotations.** Quand tu coches ces cases dans « Ouvrir un Codex… », ce que le fichier apporte de neuf s'ajoute à ce que tu as ; ce que tu as déjà ne change pas.
