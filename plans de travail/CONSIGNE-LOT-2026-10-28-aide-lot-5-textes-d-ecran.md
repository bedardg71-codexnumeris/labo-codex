# Consigne – L'Aide, lot 5 : les textes d'écran qui contredisent le code (#1152)

> Écrite par Cowork le mercredi 28 octobre 2026 à 14 h 41 (Toronto, mesuré par `date`). À lancer **après** le lot 4. Ce fichier ne remplace aucune autre consigne : n'y touche pas.
> Les textes et les décisions : `plans de travail/TEXTES-2026-10-28-textes-d-ecran.md`, **validés par Grégoire le 28 oct. (14 h 30 à 14 h 40), un à un, à intégrer mot pour mot**, et les décisions de Cowork qui y sont écrites.

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Rituel de début de session.
- **Zones protégées** : `js/navigation.js` : autorisé par Grégoire pour les **deux lignes** du texte n° 9, rien d'autre ; `noms_stables.json` : seulement si l'autorisation est notée dans le fichier TEXTES (§ « Décisions de Cowork ») ; `js/config.js` : non.

## 1. Le mandat, en trois commits de code

1. **Les textes validés** (n° 1 à 5, 7 à 16) : chacun à sa place, mot pour mot ; les « À mesurer à l'intégration » se mesurent ; un texte faux à la mesure ne se change pas : arrête-toi et dis-le. L'Aide qui cite ces libellés (`preparer-importer`, `planifier-rai`, `apporter-grille`) les recopie.
2. **Les décisions** : « élève » → « étudiant·e » dans les écrans d'enseignant, sauf ceux du service d'orthopédagogie (liste dans la demande, cas ambigus nommés) ; les noms des niveaux RàI (n° 14) ; le guide ACP, « Exploration des pratiques », la Modélisation, le glossaire, le soulignement aux mots entiers ; le code mort (le retrait de `basculerVerrouillageCritere` attend l'autorisation sur `noms_stables.json`).
3. **À mesurer, puis proposer, sans changer les mots** : « Système de jetons » sous une pratique Standards ; l'option « Reprise ciblée » ; le champ « Séance concernée » ; le résumé « n/5 configurés ». Chacun : ce que fait le code, ce que dit l'écran, une proposition (technique : faite ; mots : à Grégoire, dans la demande).

## 2. Le guidage de la démo et la fenêtre « Données démo » (n° 6)

Réécris les 19 bulles de `js/guidage-demo.js` et la fenêtre « Données démo » d'après la mesure (comptes lus dans `js/pack-demo-10.js` ; écrans d'aujourd'hui ; mots validés de l'Aide), **sans les poser** : elles vont dans un fichier `plans de travail/TEXTES-2026-10-28-guidage-demo.md`, en-tête « proposés, à valider par Grégoire », par groupes de trois ou quatre, avant et après. Cowork les lui soumettra ; un lot suivant les posera.

## 3. Les tests

- Les sentinelles touchées (`critere-algorithmique-mots` si l'introduction de l'atelier y est épinglée ; celles des popups, du glossaire, de l'Aide) suivent par décision, en citant ce fichier.
- **Une sentinelle neuve**, `tests/unit/sentinelle-aide-2026-10-28-lot-5.test.js` : chaque texte validé paraît mot pour mot à sa place, **lu dans le fichier TEXTES** ; les mots retirés n'y sont plus (« Triple confirmation », « verrouillées une fois finalisées », « ZIP léger », « …8a », « Indicateurs de risque », « Points carrés », « CC-BY-SA » seul, « nom court s’imprime », « Revenir à ma dissection », « celle-ci a eu un effet », « Suggestion automatique ») ; le nom de licence des fichiers lu dans `partage-schemas.js`. Break-test, arbre restauré par sha256.
- Playwright ciblé sur les écrans touchés ; Vitest depuis `tests/` ; bloc de jetons d'`index.html` à jour.

## 4. Clôture

`BACKLOG.md` (#1152, lot 5) ; demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-28-aide-lot-5.md` (constat par constat : avant, après, preuve, test ; « Pour Grégoire » : les propositions du § 1.3 et le fichier du guidage de la démo). Pas de release, de verdict ni de push sans le signal de Grégoire.
