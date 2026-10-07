# Consigne du jour – chantier de l'enregistrement, lot 4 : plus d'écriture sans geste à l'ouverture (#981, #983)

> Écrite par Cowork le 7 octobre 2026 à 11 h 37 (Toronto, mesurée par `date`). Remplace la consigne des lots 3 et 5, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-07-enregistrement-lots-3-5.md`.

## Où on en est

1.188.1 est en ligne (`66c21dab`, relais `e35db7e2`) : lots 3 et 5 du plan clos, porte « Annuler » passée par Grégoire. Plan : `plans de travail/PLAN-2026-10-07-chantier-enregistrement-suite.md`, lot 4. Grégoire a dit « oui » à ce lot à 11 h 35.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md` et `SUIVI-BUGS.md`, et à faire la release sur `main` local. **Pas de push avant la relecture de Cowork.**

## Le principe

Une ouverture de l'application, sans geste, ne change rien dans les données de l'usager. Le moyen préféré n'est pas de retirer une écriture, mais de **ne pas écrire quand le contenu ne change pas** (comparaison de contenu, en ignorant un horodatage qui seul changerait). Retirer une écriture n'est permis que si la mesure prouve que rien ne la lit.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive.
2. **Mesure d'abord, sans rien corriger** (sonde jetable, pack démo, deux ouvertures de suite, `_signalerEcriture` sur les clés) :
   - **#981** : qui écrit `cours` à l'ouverture (écrivains lus par Cowork : `contexte.js:164`, `cours.js:75/107`, `demo-activation.js:178`, `migrations.js:626`, `trimestre-v2-cours.js:143/586/1470`), et **ce qui change** d'une ouverture à l'autre (ordre, champ, horodatage…).
   - **#983** : quand `portfolio.js:277` écrit `portfoliosEleves` (`auto: true`) et relance `calculerEtStockerIndicesCP`, et si le contenu change d'une ouverture à l'autre (au-delà de `dateSelection`).
   - Pour les deux : y a-t-il **d'autres clés** écrites à l'ouverture sans geste ? Liste-les ; celles hors de #981 et #983 s'inscrivent, ne se corrigent pas.
3. **Garde-fou pédagogique (#983)** : la sélection automatique alimente l'indice P, donc des notes. Si ta correction change **un seul nombre affiché** (note, indice C ou P, sélection retenue) sur le pack démo, arrête ce volet et dis-le en une ligne : c'est une question de didactique pour Grégoire, par Cowork. Le but est que les mêmes données donnent les mêmes nombres, sans écrire quand rien ne change.
4. **Corrige** selon le principe : `cours` et `portfoliosEleves` ne s'écrivent à l'ouverture que si leur contenu change ; et le recalcul des indices C et P ne se relance que dans ce cas. Si `cours` change vraiment à chaque ouverture (un écrivain qui réordonne ou réhorodate), corrige la **source** du changement.
5. **Stock** (« tarir n'est pas réparer ») : ce qui a déjà été écrit chez les usagers reste tel quel. Dis-le dans ton rapport en une ligne ; ne répare rien d'office.
6. **Tests** : bancs avec break-test — deux ouvertures de suite sur le pack démo n'écrivent ni `cours` ni `portfoliosEleves` ; une vraie modification (un cours ajouté, une note qui change la sélection) écrit toujours ; les nombres affichés (note, C, P) sont identiques avant et après la correction. Specs voisins, Vitest complet. Noms manifestement fictifs.
7. **Release** patch par `scripts/release.mjs`, commits séparés par fiche, relais écrit. Ligne des Nouvelles : aucune si rien ne change à l'écran ; dis-le. Puis arrête-toi : relecture de Cowork, verdict, push.

## Rappel

Avant le verdict complet : Chrome et Safari fermés.

## Ton rapport à Grégoire

En gestes d'utilisateur, numéros entre parenthèses en fin de ligne. Pas de geste à l'écran (les bancs suffisent), sauf si la mesure en fait apparaître un. Ce que tu as supposé, en une ligne par supposition.

## Suite – relecture de 1.188.2 (7 oct. 2026, 12 h 58, Toronto)

**Relecture faite, rien ne bloque.** Lus : `033cfe72` (les deux migrations de `cours.js` passent par `auDbPret`, qui rattrape un `db-ready` déjà émis), `236d6f1d` (release), et la clôture de #983 par la mesure. Tests non relancés par Cowork. Ta supposition sur l'ordre (lot 4 avant #1038) : l'ordre n'était pas voulu, Cowork n'avait pas vu #1038 en écrivant la consigne ; sans conséquence, #1038 vient ensuite.

Puis : Chrome et Safari fermés, verdict complet, push, vérification de la mise en ligne chez Netlify. Rapport en gestes d'utilisateur. Arrête-toi après : la session de `claude/1039-equipes` attend ce push pour se rebaser.
