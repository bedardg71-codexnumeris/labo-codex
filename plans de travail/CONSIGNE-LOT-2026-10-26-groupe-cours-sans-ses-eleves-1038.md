# Consigne – Le groupe-cours qui naît sans ses élèves (#1038, la source)

> Écrite par Cowork le lundi 26 octobre 2026 à 14 h 59 (Toronto, mesuré par `date`), sur `main` = `c4666c7e`. **Passe APRÈS le lot 3b de la table de cas** (`CONSIGNE-LOT-2026-10-26-critere-algorithmique-table-de-cas-3b.md`) : une seule session écrit dans `js/`. Aucun testeur n'est bloqué aujourd'hui : Mathieu a été réparé le 26 oct. (14 h 47, vérifié à l'écran par lui).
> Fiche : `Retours des testeurs/SUIVI-BUGS.md`, ligne #1038 (lecture ciblée : `grep -n "^| 1038 "`).

## 0. Avant tout

- Ne commence qu'une fois le lot 3b commité, sur un `main` à jour, sans suite qui tourne. Pas de `git stash`.
- Rituel de début de session.
- Les mots de l'écran (§ 3) sont **validés par Grégoire, mot pour mot** (26 oct., 15 h 01).

## 1. Ce qui est mesuré (Cowork, 26 oct.)

La séquence de Mathieu (14 sept. 2026), rejouée dans la 1.219.1 par les fonctions de l'écran, noms fictifs : `Retours des testeurs/mathieu/REPRO-1038-sequence-14-sept.mjs` (dossier ignoré par git ; `node` depuis le dossier d'un clone où `app/` est la racine du dépôt, ou adapte le chemin `INDEX`).

1. Deux cours créés : le premier s'active seul (`_activerSiPremierCours`, `trimestre-v2-cours.js`).
2. La zone d'import nomme le cours depuis #887, mais propose par défaut « 203-GM6-DM … (cours actif) » : les élèves y vont. Une production créée reçoit aussi le cours actif (`construireProductionData`, `productions.js`).
3. Le groupe-cours « 203-SN4-DM + 00001 » : l'étape 3 offre « 00001 (0 étud.) » (#925 a fait suivre le COMPTE au cours, la liste des numéros reste entière) ; `sauvegarderGroupeCoursV2` l'enregistre sans rien dire (« Groupe-cours … créé. »).
4. Activé : 0 élève dans le cours, 0 production au sélecteur de l'import (`genererEtape2Colonnes`, `travaux-ui.js`, lit `obtenirDonneesSelonMode('productions')`), 1 production dans Conception (lit le stock brut). Seul choix offert : « Jeton de reprise ». Mathieu a mis quatre semaines à le signaler.

**Nuance qui borne le correctif** : l'import refuse un DA déjà inscrit au trimestre, tous cours confondus. Un·e enseignant·e qui a les MÊMES élèves dans deux cours ne peut donc pas les rattacher aux deux, et son second groupe-cours est vide sans que rien n'ait été mal rangé. Déplacer les élèves d'office serait faux pour ce cas ; **le dire** est juste dans les deux.

## 2. Ce que le lot change (deux endroits, rien d'autre)

**A. À l'enregistrement d'un groupe-cours** (`sauvegarderGroupeCoursV2`, `js/trimestre-v2-groupes-cours.js`), en création, et en modification quand le cours ou le groupe change : si le numéro choisi n'a **aucun** élève rattaché au cours choisi **et** en a dans un ou plusieurs autres cours, une question native (`confirm`, comme la garde jumelle CT-15 juste en dessous) avec les mots du § 3 A. Annuler : rien n'est écrit, la fiche reste ouverte (même chemin que le refus de CT-15). Pas de question si le groupe est vide partout (groupe neuf de « + Nouveau groupe ») ni si ses fiches n'ont pas de `coursId` (stock d'avant #887 : elles comptent partout, comme `duCours` dans `populerDropdownGroupesAssemblageV2`). Le compte se fait par la règle que la liste du Cadre applique déjà (#924 : un groupe, c'est un numéro DANS un cours) ; ne la duplique pas, appelle-la ou extrais-la.

**B. Au sélecteur « Production » de l'import** (`genererEtape2Colonnes`) : quand aucune production n'appartient au cours actif mais que le trimestre en a sous un autre cours, une ligne sous le sélecteur, mots du § 3 B. Rien quand le cours actif a au moins une production (pas de bruit pour qui a deux cours bien rangés). Codes de cours échappés (`echapperHtml`, règle n° 1).

**Hors du lot** (issue 2, inscrire et continuer, nommer dans le rapport) :
- aucun geste ne change le cours d'un élève ou d'un groupe d'élèves (la réparation de Mathieu a dû passer par la console) — c'est ce qui empêche le § 3 A de proposer un remède ;
- Conception › Productions montre les productions de tous les cours sans nommer le leur.

⛔ Aucune écriture dans les données existantes, aucune migration, aucune suppression.

## 3. Les mots (proposés par Cowork, VALIDÉS par Grégoire le 26 oct. 2026 à 15 h 01, mot pour mot)

**A. La question à l'enregistrement** (le cours nommé comme la zone d'import le nomme, `_libelleCoursRattachementV2` ; accords au singulier si un·e seul·e) :

> Le groupe 00001 n'a aucun·e étudiant·e dans 203-SN4-DM. Ses 26 étudiant·es sont rattaché·es à 203-GM6-DM.
>
> Ce groupe-cours restera vide tant qu'aucun·e étudiant·e n'est rattaché·e à 203-SN4-DM.
>
> Créer quand même le groupe-cours ?

(En modification : « Modifier quand même le groupe-cours ? ». Plusieurs autres cours : « … sont rattaché·es à d'autres cours (203-GM6-DM, 203-XXX). »)

**B. La ligne sous le sélecteur « Production » de l'import** :

> Aucune production dans 203-SN4-DM. 1 production de ce trimestre est rangée sous 203-GM6-DM : elle n'apparaît ici que lorsque ce cours est actif.

(Pluriel : « 2 productions de ce trimestre sont rangées sous 203-GM6-DM : elles n'apparaissent ici… » ; plusieurs cours : « … sous d'autres cours (…) : elles n'apparaissent ici que lorsque leur cours est actif. »)

## 4. La preuve

- Une spec Playwright qui rejoue la séquence du § 1 (pars du script de Cowork) jusqu'à la question : elle lit le texte de la question (A), puis, groupe-cours créé quand même et activé, la ligne sous le sélecteur (B). Cas sans question : groupe vide partout ; fiches sans `coursId` ; deux cours bien rangés (ni question ni ligne). Break-test : retirer chaque condition rend la spec rouge.
- Le compte (A) et la condition (B) en fonctions pures, Vitest.
- Chromium suffit pour ce lot (Cadre et import, Mac) ; pas de porte terrain si la spec lit les mots.

## 5. Clôture

- **Pas de release, ni verdict, ni push** : le lot part avec les autres, au signal de Grégoire.
- La ligne #1038 de `SUIVI-BUGS.md` : la source, ce qui est tari (A, B), ce qui reste (les deux items hors lot, avec leur numéro).
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-26-groupe-cours-sans-ses-eleves-1038.md`.
