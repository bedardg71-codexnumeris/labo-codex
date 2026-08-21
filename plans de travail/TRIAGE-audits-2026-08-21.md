# TRIAGE — constats des audits Cadre/Trimestre et Conception

> **Date** : 21 août 2026 · **Référence** : 1.88.6 (`35740cc5`)
> **Sources** : `AUDIT-cadre-trimestre-2026-08-20.md` (29 constats) et
> `AUDIT-conception-2026-08-20.md` + addendum (35 + 5 constats, verdicts #326/#343)
> **Artefact interactif** (l'OPÉRATION — ce fichier est la TRACE) : `triage-audits-2026-08-21.html`,
> publié : <https://claude.ai/code/artifact/98a5fd3f-26f2-406f-87dc-a4f72539d3a9>. Bouton « Copier mes décisions » obligatoire :
> les choix vivent dans le navigateur de Grégoire, seule la copie du relevé les ramène ici.
> **Règle du modèle portes-terrain** : chaque rangée est une DÉCISION (pas une vérification) —
> choix explicite + note, jamais une simple case cochée.

## État

- **Décisions attendues : 27** — 4 de fond (D1-D4), 9 lots (L1-L9), 14 items isolés (I1-I14).
- **Statut : RELEVÉ REÇU LE 21 AOÛT 2026 — 27/27 tranchées.** Tout est « Maintenant » ;
  versé au BACKLOG en #462-#484. Ordre d'exécution proposé et premier chantier : voir §5.
- Déjà réglé, hors triage : CT-01 (1.88.5, #460), CO-01 (1.88.6, #461), #326-T3/T4
  (corrigés 21 juin, vérifiés par reproduction), #343-T4b/T4c (résorbés).

## §1 — Décisions de fond

| # | Décision | Options proposées | Verdict |
|---|---|---|---|
| D1 | Régime des cartouches (CO-33, CO-04, CO-38) — seule famille encore globale, partagée réel↔démo, orpheline à la suppression de sa grille | namespacer / globale mais trous fermés / session dédiée | **NAMESPACER par trimestre** (chantier migration) |
| D2 | Huit échelles collègues codées en dur (CO-31, CO-11) — resemées par trimestre, semis qui viole #358 | retirer→bibliothèque / garder sans semer / garder tel quel | **RETIRER du code** → bibliothèque/packages de partage |
| D3 | Politique de suppression unifiée (CT-02, CO-03) — 7 familles sans garde vs le patron #449 | recensement #449 partout / gardes minimales d'abord / session dédiée | **RECENSEMENT #449 généralisé aux 7 familles** |
| D4 | PR #63 jamais fusionnée (CO-36) — l'archive dit « RÉSOLUS », 3 reliquats #343 encore vivants | rebaser+merger / fermer+rejouer / laisser (motif) — l'archive sera corrigée dans tous les cas | **REBASER sur 1.88.6 et FUSIONNER** |

## §2 — Lots de correctifs (priorité : Maintenant / Bientôt / Plus tard / Écarter)

| # | Lot | Constats couverts | Priorité |
|---|---|---|---|
| L1 | Suppressions gardées (dépend D3) | CT-02, CT-08, CT-21, CO-03, CO-04, CO-38 | **Maintenant** |
| L2 | Clés nues : résurrections, replis, migrations écrasantes | CT-07, CT-11, CT-12, CT-26, CO-02, CO-09, CO-10, CO-11, CO-19 | **Maintenant** |
| L3 | Moteur des pratiques : « configuré ≠ calculé » | CO-06, CO-07, CO-08, CO-13, CO-22, CO-23, résiduel #326 (.config legacy) | **Maintenant** |
| L4 | Bascule de trimestre et formulaires | CT-05, CT-06, CT-17, CO-16, CO-20, CO-21 | **Maintenant** |
| L5 | Sécurité : échappement + imports non assainis | CT-09, CT-29, CO-14, CO-39 | **Maintenant** |
| L6 | Boutons qui mentent, gestes qui plantent | CT-13, CO-05, CO-12, CO-17, CO-18, CO-25 | **Maintenant** |
| L7 | Grand retrait du code mort (zéro-dette) | CO-15, CT-12 (recoupe L2), CT-23, CT-24, CO-34 | **Maintenant** |
| L8 | Vitesse : rendu différé, modales ménagées | CT-18, CT-20, CO-26 | **Maintenant** |
| L9 | Documentation et registre des clés | CT-25, CT-27, CO-30, CO-32 (+ correction BACKLOG-ARCHIVE:2465) | **Maintenant** |

## §3 — Items isolés (même échelle de priorité)

| # | Item | Constat(s) | Priorité |
|---|---|---|---|
| I1 | Nom du groupe-cours figé qui se contredit à l'écran (cause du volet désync de #328-T1) | CT-03 | **Maintenant** |
| I2 | 2ᵉ séance d'un même jour absente du calendrier | CT-04 | **Maintenant** |
| I3 | profilEnseignant écrasé par n'importe quel profil (attribution CC) | CT-10 | **Maintenant** |
| I4 | Badge « 4/5 configurés » qui masque une référence brisée | CT-14 | **Maintenant** |
| I5 | Doublons créables en silence (joint au #291 ouvert) | CT-15, CO-24 | **Maintenant** |
| I6 | Petit lot Cadre : annulations, doublons de nom, diagnostic | CT-16, CT-19, CT-22 | **Maintenant** |
| I7 | Micro-UX du parcours de rentrée (avec design-interface) | CT-28 | **Maintenant** |
| I8 | Import échelles inter-trimestre aveugle aux archives | CO-27 | **Maintenant** |
| I9 | Banc : la terminale pèse 1 % du corpus généré | CO-28 | **Maintenant** |
| I10 | Robustesse diverse (ids manquants, modales doublées, window.event) | CO-29 | **Maintenant** |
| I11 | Snapshot d'archivage : pratiques du mauvais trimestre (à recouper) | CO-35 | **Maintenant** |
| I12 | Pondérations : confirmation ≠ 100 % + poids fantôme « 1 » | CO-37, CO-40 | **Maintenant** |
| I13 | Assistant : remonter les deux portes d'entrée (#343-T5, suggestion de Grégoire) | #343-T5 | **Maintenant** |
| I14 | Sort de l'outil console de diagnostic (règle n°5) : assumer / reformer | CT-24, CO-34 | **REFORMER** (sortie hors console) |

## §4 — Angles morts déclarés

- Constats [AGENT] non tous contre-vérifiés ; CO-16/CO-20 vérifiés au code, non rejoués à l'écran.
- Carte d'alignement hors périmètre (audit du 8 août) ; évaluation/annotation, .lcz, Codex : jonctions seulement.
- Rien d'éprouvé Safari/iPad — chaque lot livré recevra sa porte terrain.
- Les gestes navigateur dus des cycles précédents (réparation A25, réassignations H26, #450…) restent au BACKLOG, hors triage.

## §5 — Exécution (démarrée le 21 août 2026)

Tout est « Maintenant » : l'ordre ci-dessous séquence les chantiers un par un (blocs courts,
critères de fin clairs), du plus urgent au regard de la rentrée de septembre vers le reste.
Versement BACKLOG : **#462 (D4)**, **#463-#471 (L1-L9, verdicts D1-D3 intégrés)**, **#472-#484
(I1-I13)** ; I14 replié dans L7 (#469, la réforme de l'outil fait partie du lot code mort).

| Rang | Chantier | Motif de l'ordre |
|---|---|---|
| 1 | **#462 · D4 — PR #63** | court ; ferme 3 reliquats terrain de juin ; corrige l'archive |
| 2 | #464 · L2 — clés nues | le hasard de données le plus réel (migration écrasante à chaque boot) |
| 3 | #466 · L4 — bascule de trimestre | scénario type de la rentrée qui approche |
| 4 | #468 · L6 — boutons qui mentent | visibles au quotidien, correctifs bornés |
| 5 | #463 · L1 — suppressions gardées (D3) | gros chantier structurant, patron #449 |
| 6 | #465 · L3 — moteur des pratiques | lourd ; après L2 (les clés) et L1 (les gardes) |
| 7 | #469 · L7 — code mort (+ I14 reformer) | réduit la surface avant sécurité et perf |
| 8 | #467 · L5 — sécurité | sur une surface déjà réduite par L7 |
| 9 | #470 · L8 — vitesse · #471 · L9 — docs/registre (D1, D2 documentés) | clôture du cycle |
| 10 | #472-#484 · items I1-I13 | intercalés par affinité (I1/I2/I4/I6 avec L4 ; I3 avec L1 ; etc.) |

Chaque lot livré = sentinelles + break-tests + **porte terrain** (Safari/iPad) avant le suivant.
