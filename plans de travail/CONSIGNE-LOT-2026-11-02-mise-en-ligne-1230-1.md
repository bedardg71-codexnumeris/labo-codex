# Consigne – Mettre en ligne la 1.230.1 : en Évaluer, le doigt parcourt la copie (2 novembre 2026)

> Écrite par Cowork le lundi 2 novembre 2026 à 8 h 36 (Toronto, mesuré par `date`), sur `main` = `4310816c`. **Le coller est le signal de Grégoire** : il évalue sur l'iPad, le Mac est libre. Le texte du § 1 est **validé par Grégoire à 8 h 37**, mot pour mot.
> Relecture acceptée : `VERDICT-RELECTURE-2026-11-02-evaluer-un-doigt.md` (#1217).

## 0. Avant tout

- Aucune autre session ne tourne. Commit de docs seul : ce fichier et le verdict.
- Le rituel `/fin-de-session`, dont `OU-EN-EST-ON.md`.

## 1. Les Nouvelles : un point de plus à l'entrée 1.230

Un correctif se range dans l'entrée de sa version mineure (skill `release-et-changelog`). Ajoute à l'entrée 1.230, en septième point, mot pour mot :

« Sur l'iPad, en Évaluer, toucher la copie du doigt ne te ramène plus en Annoter : le doigt la fait défiler, le stylet annote. »

## 2. La version

`node scripts/release.mjs patch` (1.230.1).

## 3. La vérification complète, sur le commit de release

`node scripts/verdict-en-morceaux.mjs`. **Avant de lancer**, dis à Grégoire : « ferme Cowork, Chrome et Safari sur le Mac, je lance la vérification » ; Mac sur secteur, sans veille. Vert : `git push`. Rouge : ne pousse pas, rapport à Cowork.

## 4. Après le push

Dis à Grégoire : « La 1.230.1 est en ligne : recharge l'iPad. » Puis lis `plans de travail/CONSIGNE-LOT-2026-11-02-retroaction-plus-large.md` et exécute-la (c'est la suivante). Les lots du plan des tampons attendent la relecture de Cowork.
