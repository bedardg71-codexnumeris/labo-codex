# Demande de relecture – la version 1.214.0

> Claude Code, jeudi 22 octobre 2026, vers 13 h 15 (Toronto). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Commit de release `fbfa393e` sur `main`, **non poussé**. Le verdict complet et le push attendent le signal de Grégoire.

## Ce que porte le commit

| Quoi | Comment le vérifier |
|---|---|
| La validation | En tête de `plans de travail/TEXTES-2026-10-22-a-valider.md` : 13 h 05, tout accepté, « Poids » gardé, les cinq textes changés par Cowork. |
| L'écran des codes | `js/materiel-dissection-lecture.js` (bulle de « Poids »), `js/materiel-dissection.js` (`TEXTES_CODES.raisons` : « Avant d’ajouter, il faut : »), `js/materiel-creation.js` (`MESSAGES_CODES.echec`). Les commentaires « PROVISOIRES » des trois blocs disent maintenant « validés ». Aucun test n'épinglait ces trois textes (`grep` dans `tests/`). |
| Les Nouvelles 1.214 | `js/changelog-data.js`, en tête : `vert`, le titre sans virgule, six items ; insécables en `&nbsp;` comme la 1.213. Les lignes 1 à 5 sont celles de ma proposition, la sixième celle de Cowork. |
| La version | `node scripts/release.mjs minor` (précédé de `--dry-run`) : **1.214.0**, build `1022-1307`, dans les quatre points. `git grep` de l'ancien build `1021-1224` et de « 1.213.0 » dans `*.js`, `*.json`, `*.html` : zéro ; témoin, `1022-1307` dans les quatre fichiers. |
| Le relais | `RELAIS.md`, un bloc de tête, avec la ligne « complexité ». `OU-EN-EST-ON.md` attend le push. |

## Complexité (1.213.0 `9bb49dcb` → 1.214.0)

Fichiers de plus de 1 000 lignes 35 → 37 (`js/materiel-dissection.js` 1 033, `js/modes.js` 1 008) ; au-dessus de 15 : 454 → 454 ; au-dessus de 30 : 86 → 86 ; somme au-dessus de 15 : 11 429 → 11 431 (Δ +2).

## Preuves

- **Vitest complet sur `fbfa393e`** : 9 469 sur 9 469, 808 fichiers, 45 s.
- **Audit statique** du diff : aucun motif (`innerHTML`, `on…=`, `eval`, `console.log`). Pas de break-test : le diff ne touche que des textes et la version, aucun correctif de données ni de sécurité.
- **Non fait** : le verdict Playwright complet (au signal de Grégoire).

## Une réserve – TRANCHÉE à 13 h 17

**Tranchée** : Grégoire a validé à 13 h 17 la deuxième phrase resserrée par Cowork (« Un trimestre clos refuse maintenant d’enregistrer une évaluation ou des présences, sauf si tu coches « Permission d’écriture ». Les imports, entre autres, y écrivent encore. »). Appliquée dans un commit de texte seul, après le commit de release ; c'est ce commit que juge le verdict. Relecture de Cowork de `fbfa393e` : conforme.

La réserve telle que posée :

La sixième ligne dit « Un trimestre clos refuse les modifications ». La fiche #1140 (`FICHE-2026-10-22-ecritures-directes-trimestre-clos.md`) mesure 56 écritures directes dans le trimestre actif qui ne passent pas par le refus, dont des écritures « Auto » faites au chargement. La phrase dit donc plus que ce que le code garantit. Je l'ai appliquée au mot près, comme validée. Il faut décider si on la garde, ou si on la resserre (par ex. « refuse les modifications faites par l’enregistrement et l’annotation »). Si on la change, c'est un nouveau texte que Grégoire doit valider, puis un commit qui remplace le commit de release comme dernier commit.
