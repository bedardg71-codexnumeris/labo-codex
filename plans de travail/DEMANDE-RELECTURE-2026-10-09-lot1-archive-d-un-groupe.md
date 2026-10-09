# Demande de relecture – file sans Grégoire, lot 1 : l'archive d'un groupe n'emporte que ce groupe (#1021, #956, #1005, #829)

> Claude Code, 9 octobre 2026, après-midi (Toronto). Sur `main`, en local, commits séparés, **ni poussés ni publiés** (consigne de Cowork de 14 h 43). Étape 0 faite à part : onze fiches mortes cochées (`c198e578`) ; #417 était déjà cochée, #417-bis reste ouverte.

Commits, dans l'ordre : `06d3a65f` (#956), `947724ce` (#1021), `2e9531d0` (#1005), `2283deb6` (#829), puis celui-ci (BACKLOG et la présente demande). Chacun porte son jeton anti-cache dans `index.html`, posé à la demande du hook.

## 1 · Ce qui change pour l'usager

- **« Archiver… » un groupe** n'emporte plus rien des élèves des autres groupes : notes du rapport, confidentiel, résultats ultérieurs, chronomètre, élèves suivis, indices, sauvegardes de migration. Il emporte maintenant les **rencontres** du groupe et son **assiduité**, qui manquaient à toutes les archives de groupe.
- **« Vérifier »** une archive (Chrome, mode dossier) ne demande plus « Autoriser ce site à modifier les fichiers ? ». Il demande la lecture. « Archiver… » redemande l'écriture quand il en a besoin.
- **En démo**, Labo › Outils d'observation montre la grille de dépistage avec laquelle le profil calcule, au lieu de « Grille enregistrée, introuvable dans ce trimestre ». Choisir une grille du pack n'écrase plus le choix réel de l'enseignant.

Aucun mot d'écran n'est ajouté ni changé.

## 2 · La mesure (#1021), faite avant le correctif

Le banc pose un espace fictif : trimestre `a2031`, deux groupes, un élève dans chacun, chaque famille de clés par élève remplie pour les deux. Il archive le groupe 1 en mode dossier, avec le vrai `verserGroupeCours`. **Aucune archive réelle n'a été ouverte.**

Sur le code de 1.193.0 :

| Résultat | Clés |
|---|---|
| **Partaient avec l'autre groupe** (13) | `chronoEvaluations`, `confidentielEtudiants`, `corbeilleFichiers_backup_v1`, `elevesDesinscrits`, `etudiantsSuivis`, `etudiantsSuivis_gc_<autre groupe>`, `evaluationsSauvegardees_backup_v1`, `fichiersTravaux_backup_v1`, `indicesEvaluation`, `indicesPatternsRaI`, `notesRapport`, `recherchePresences`, `resultatsUlterieurs` |
| **Se perdaient entières** (2) | `interventions` (le filtre cherchait un `da` ; une rencontre porte `etudiants: [...]`) et `indicesAssiduite` (forme `{ sommatif: { [da]: … } }`) |

La seconde ligne n'était pas dans la fiche. Je l'ai corrigée dans le lot parce que c'est la même règle (le filtre par élève), écrite dans ce lot.

## 3 · Le correctif

- **`js/reserve.js`** : chaque clé du trimestre reçoit une règle par `_classerCleTrimestre` (exposée en `Reserve.classerCleTrimestre`) : par élève, par groupe, famille suffixée par groupe, partagée, ou exclue. **Une clé sans règle ne part plus** ; un avertissement la nomme. Le banc exige une règle pour chaque nom de `CLES_NAMESPACEES` (lu dans `js/trimestres.js`) et pour les familles composées. Une clé ajoutée au registre sans règle fait donc échouer Vitest.
- **#956** : `pratiquesConfigurables` quitte `CLES_GLOBALES_INCLUSES`. La branche qui la filtrait est retirée.
- **#1005** : `_verifierPermissionHandle(handle, mode)` et `obtenirHandle({ lecture: true })`. « Vérifier » (`reserve-verifier.js`) passe `lecture`. Les autres appelants gardent l'écriture.
- **#829** : `js/preferences-v2.js`. En démo, l'écriture de la préférence est sautée et le sélecteur montre la grille résolue (`diagnostiquerGrilleReferenceDepistage`). `<trim>_etudiantsSuivis_gc_<id>` est classée : seule la liste du groupe part.

## 4 · Ce que j'ai supposé (une ligne chacune)

1. Une clé non classée **reste hors de l'archive** (avertissement) plutôt que de bloquer l'archivage. Le refus dur est dans le banc.
2. Les **états d'écran** (`recherchePresences`, `presences_date/groupe/tri`, `groupeSelectionne`, `pipeline_queue`) ne voyagent plus. Une recherche tapée peut porter un nom.
3. `archivesBundles` ne voyage plus : aucun écrivain, forme inconnue.
4. `elevesDesinscrits` est filtrée par élève. Un élève retiré n'étant plus dans aucun groupe, sa trace ne part avec aucune archive de groupe.
5. Une rencontre part si un élève du groupe y était. Ses `etudiants`, `notesIndividuelles` et `snapshotAvant` sont réduits au groupe, mais **`observations` (texte libre) et `analyse` (des comptes) partent tels quels**. À trancher si une rencontre mêle deux groupes.
6. Le bilan réflexif est partagé : ses résultats sont agrégés, sans DA (`bilan-reflexif-csv.js:568`).
7. En démo, changer la grille dans le sélecteur n'a pas d'effet durable : le profil garde la grille résolue. Le sélecteur n'est pas désactivé, pour ne pas toucher aux mots ni à l'apparence.
8. #1005 : la mesure sous Chromium **n'est pas faisable par machine**. Le sélecteur et la question de permission sont natifs, Playwright ne les pilote pas. Ce que j'en dis vient de la spécification : la lecture ne couvre pas l'écriture, et le dossier mémorisé est le même objet.

## 5 · Stock (« tarir n'est pas réparer »)

Les archives de groupe déjà faites gardent ce qu'elles emportent : les données des autres groupes, et l'absence des rencontres et de l'assiduité. Rien n'est réécrit. Ces archives vivent sur le disque de Grégoire, hors de l'application. Les refaire relève de lui. C'est aussi écrit au BACKLOG.

## 6 · Preuves

- Banc `tests/unit/sentinelle-1021-archive-groupe-n-emporte-que-son-groupe.test.js` (12 essais) :
  - (a) aucune fuite, clé par clé ;
  - (b) aucune perte, famille par famille ;
  - (c) le registre est entièrement classé, et une clé inconnue ne part pas ;
  - (d) #956 ;
  - (e) #829 ;
  - (f) **rétro-compatibilité** : une archive au format d'avant (forme nue des pratiques, clés entières) se vérifie (« vérifiée », données concordantes) et se relit par `_lireDeuxFormes` ;
  - (g) #1005 : Vérifier → sélecteur `read`, aucune demande `readwrite` ; puis Archiver… sur la même page → `query:readwrite`, `request:readwrite`.
- Banc `tests/unit/sentinelle-806-grille-depistage-ne-sefface-pas.test.js` : trois essais #829, en démo et hors démo.
- **Break-test** : 13 mutations, 13 rouges. Sept sur la collecte (inclure l'inconnue, déclasser `notesRapport`, rencontres, assiduité, suffixe de groupe, forme nue remise, notes de rencontre non réduites), trois sur #1005, trois sur #829. Chaque fichier a été restauré par copie, empreinte vérifiée.
- `cd tests && npm test` : verdict au § 7.
- Spec `reserve-reouverture-cartouches-637.spec.js` mise à jour pour #956 (voir § 7).

## 7 · Verdict de la suite

`cd tests && npm test`, seconde passe (après la mise à jour de la sentinelle #913) :

- **Vitest** : 701 fichiers, 8 404 essais verts.
- **Playwright** : 768 verts, 3 instables, 1 rouge.
  - **Le rouge relevait du lot.** `reserve-reouverture-cartouches-637.spec.js`, essai « #953 · pratiques » : son témoin exigeait que le versement copie la forme nue des pratiques, ce que #956 retire. Corrigé sur le modèle de l'essai voisin des grilles. La forme nue est injectée comme dans une archive d'avant, et la réouverture l'ignore toujours. Nouvelle assertion : le versement neuf ne l'emporte plus. Spec relancée seule sous WebKit : 7 sur 7. Break-test (la clé remise dans `CLES_GLOBALES_INCLUSES`) : rouge à la ligne 248, sur cette assertion.
  - **Instables, hors du lot**, verts au second essai : `bascule-trimestre-466` (CT-17), `cartouches-dropdown-selection` (PREUVE), `cours-actif-hors-bibliotheque-916`. Aucun ne passe par `reserve.js` ni par `preferences-v2.js`.
- La suite complète n'a **pas** été relancée après ce correctif de spec (≈ 1 h 10). Seule la spec touchée l'a été.
- Version intermédiaire du commit #1021 (sans #1005) : son banc et la sentinelle #913 rejoués en place, 22 sur 22.

## 8 · Portes terrain dues

- #1005 : Chrome sur le Mac. « Vérifier » ne demande pas « modifier ». Ensuite, « Archiver… » demande l'écriture et l'archive part.
- #660, #915, #1012 (étape 0) : leurs portes restent dues.
