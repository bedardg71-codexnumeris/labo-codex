# Consigne – L'Aide, lot 4 : les trous comblés (#1152)

> Écrite par Cowork le mercredi 28 octobre 2026 à 14 h 41 (Toronto, mesuré par `date`). À lancer **après** la mesure de la construction de la note (`CONSIGNE-LOT-2026-10-28-mesure-construction-de-la-note.md`). Ce fichier ne remplace aucune autre consigne : n'y touche pas.
> ↻ **Retouchée par Cowork le 29 oct. 2026 à 05 h 13** : le trou 2 entre dans ce lot (§ 1). À lancer après la retouche du juge de GitHub (`VERDICT-RELECTURE-2026-10-29-juge-github-intermittentes.md`).
> Les textes : `plans de travail/TEXTES-2026-10-28-aide-sept-trous.md`, **validés par Grégoire le 28 oct., un à un, à intégrer mot pour mot**. Chaque texte porte ses preuves et ce qui reste à mesurer à l'intégration.

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Rituel de début de session.
- Commit de docs seul : ce fichier, `TEXTES-2026-10-28-aide-sept-trous.md`, `TEXTES-2026-10-28-textes-d-ecran.md`, `CONSIGNE-LOT-2026-10-28-aide-lot-5-textes-d-ecran.md`, `VERDICT-RELECTURE-2026-10-28-aide-lot-3.md`, `DECISIONS-2026-10-28-construction-de-la-note.md`, `../CONSIGNE-DEMARRAGE-COWORK.md`, et, s'ils ne sont pas encore suivis, `CONSIGNE-LOT-2026-10-28-standards-sans-portfolio-plan.md` et `PLAN-2026-10-28-standards-sans-portfolio.md` (écrits par une session parallèle qui ne committait pas).

## 1. Le mandat

- **Trou 3, les présences** : le paragraphe remplace les deux phrases de `saisie-presences` que le fichier nomme.
- **Trou 1, supprimer** : le paragraphe remplace « Avant une suppression » dans `codex`.
- **Trou 5, les rencontres** : une entrée neuve, `accordeon-aide-rencontres`, dans le Suivi entre `planifier-rai` et `tirage-sort` (l'ordre des sous-onglets, `js/config.js:68-77`).
- **Trou 6, ce qui sort de l'application** : une entrée neuve, `accordeon-aide-ce-qui-sort`, dans Codex et archives, après `export-import`.
- **Trous 4 et 7** : déjà comblés (`tableau-bord` ; `codex` et le glossaire) : rien à faire.
- **Trou 2, la construction de la note** (ajouté par Cowork le 29 oct. à 05 h 13) : une entrée neuve, `accordeon-aide-construction-note`, titre « Comment ta pratique construit la note », dans la Conception après `pratique`. Dans l'ordre : l'introduction et Sommative, Spécifications, **la réécriture Standards validée le 29 oct. à 5 h 12** (pas le texte du 28, devenu faux), Dénotation. Les correctifs E1-E4, E7, E14-E16 et le lot 1 des standards (avec ses retouches) sont faits : remesure chaque phrase contre les bancs (`sentinelle-construction-de-la-note-2026-10-28`, `sentinelle-standards-sans-portfolio`) ; « Une production retenue non recevable sort du calcul » n'est que lu.

Chaque « À mesurer à l'intégration » du fichier se mesure ; un texte qui se révèle faux à la mesure **ne se change pas** : arrête-toi sur lui et dis-le.

## 2. Les tests

- Les sentinelles de l'Aide avant de toucher ; celles de la forme (`sentinelle-aide-2026-10-24-forme`) et des lots 2c bis et 2d suivent les deux entrées neuves, par décision, en citant ce fichier.
- **Une sentinelle neuve**, `tests/unit/sentinelle-aide-2026-10-28-lot-4.test.js` : chaque texte validé paraît mot pour mot, **lu dans le fichier TEXTES** (pas recopié dans le test) ; chaque libellé cité entre « » existe dans `index.html` hors de l'Aide ou dans `js/`. Break-test, arbre restauré par sha256.
- **Un essai Playwright ciblé** : la recherche de l'Aide trouve « orthopédagogie » et « table de correspondance ».
- Vitest depuis `tests/`.

## 3. Clôture

`BACKLOG.md` (#1152, lot 4, trou 2 compris) ; demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-28-aide-lot-4.md`. Pas de release, de verdict ni de push sans le signal de Grégoire.
