# AUDIT #363 — Currency des skills et docs contre le code post-#358

> **Date** : 3 juillet 2026 (vague 3, Claude Code cloud, branche
> `claude/relais-vague-3-etat-n3owyf`).
> **Méthode** : chaque assertion vérifiée CONTRE le code au tip 1.27.1
> (`js/trimestres.js` registres `CLES_GLOBALES`/`CLES_NAMESPACEES`/
> `CLES_TEMPLATES_ARCHIVES` + routage `cle()`/`cleSource()` ;
> `js/demo-activation.js` fusion/retrait ; `js/pratiques/modalites-evaluation.js`),
> pas de mémoire. Corrections factuelles ciblées appliquées dans la même
> session — aucune réécriture de fond.
> **Prévu « reprise 1er août »** au BACKLOG, mais entièrement autonome et
> lecture seule → absorbé par la vague 3 (relais Tâche B).

---

## 1. Vérité terrain (code, 1.27.1)

- `CLES_GLOBALES` = **5 clés** : `trimestres`, `modeApplication`,
  `etatsAccordeonsV2`, `cours`, `listeCours` (legacy).
- `CLES_NAMESPACEES` contient notamment `modalitesEvaluation` et
  `pratiquesConfigurables` (24 mai) **et, depuis #358 Option A (28 juin),
  `grillesTemplates` + `echellesTemplates`** (grilles/échelles de TRAVAIL
  par trimestre ; global nu vidé au boot G4, garde anti-resemage 1.25.0).
- `cartouches_*` : globales par mécanisme dédié dans `cle()`
  (`startsWith('cartouches_')`), sauf copie d'archive.
- `CLES_TEMPLATES_ARCHIVES` (copie `<trim>_<cle>` à l'archivage) inchangée :
  `grillesTemplates`, `echellesTemplates`, `pratiquesConfigurables`.
- Catalogue de GABARITS `bibliothequeGrilles`/`bibliothequeEchelles` :
  collection **disjointe** des grilles de travail (0 id commun — finding #358).
- Démo (#358 G3) : `fusionnerDemoVersGlobaux` ne fusionne PLUS
  grilles/échelles vers le global (les modèles démo vivent dans
  `demo_grillesTemplates`, permanents) ; `retirerItemsDemoDesGlobaux` ne les
  retire donc plus.
- Désarchivage (#359, réconcilié #358) : `purgerCopiesModelesArchive` ne
  purge que les copies redevenues orphelines (condition dérivée de
  `CLES_GLOBALES`) — `<id>_grillesTemplates` est la donnée VIVANTE, jamais purgée.
- #328 : COMPLET (L2-b2 `e3179c41` 12 juin ; L2-c PR #67 27 juin ;
  release 1.22.0 = fin du chantier, PR #68).
- #326 : comparateur RÉACTIVÉ (1.26.0, PR #73) — STD non constructible
  rend `null`, dérivation sans wizard, copies en forme canonique.

## 2. Écarts trouvés et corrigés

| # | Document | Écart (avant) | Correction (3 juillet) |
|---|---|---|---|
| 1 | `SKILL_integrite_globaux.md` §1.1 | « CLES_GLOBALES = 7 clés » incluant `grillesTemplates`/`echellesTemplates` | 5 clés réelles + encadré #358 (namespacées, global vidé au boot, catalogue gabarits disjoint) |
| 2 | idem, frontmatter | grilles/échelles listées « clés globales partagées » | reclassées « collections multi-sources namespacées » (la checklist §2 reste applicable) |
| 3 | idem §1.2 | constante nommée `CLES_NAMESPACE` ; cartouches « globales de fait » | nom réel `CLES_NAMESPACEES` ; mécanisme `cartouches_*` explicité (routage `cle()`) |
| 4 | idem §3.2 | `fusionnerDemoVersGlobaux` « injecte dans grillesTemplates, echellesTemplates » | liste réelle (listeCours/cours/enseignants/cartouches) + encadré #358 G3 |
| 5 | idem §3.3 | exemple de code = filtre `grillesTemplates` (retiré du code réel) | exemple réel `listeCours` + avertissement « filtre naïf FAUX en contexte démo » |
| 6 | idem §4.2/§4.4 | écriture « dans `grillesTemplates` » ; désarchivage « à auditer » | `cle('grillesTemplates')` ; #359 documenté (purge dérivée du registre, donnée vivante préservée) |
| 7 | `SKILL_labo_codex.md` (principes) | « Bibliothèque + Assemblage = entités NON namespacées » | deux régimes : gabarits partagés vs modèles de travail namespacés (#358) |
| 8 | `SKILL_hygiene_donnees_partagees.md` §skills connus | instanciation Labo Codex citant grilles/échelles comme globales | reclassées multi-sources namespacées |
| 9 | `SKILL_pratiques_notation.md` | journal #326 arrêté au 17 juin (R4b/R5/R6, « release 1.19.0 préparée ») | entrée de clôture : réactivation 1.26.0, décisions STD→`null`/T3 forme canonique/T4 sans wizard, périmètre export vérifié |
| 10 | `SKILL_Alignement.md` §données lues | `grillesTemplates`/`echellesTemplates`/`modalitesEvaluation` citées SANS préfixe (vs autres clés préfixées) | préfixe `{trimestreId}_` + dates de namespacing |
| 11 | `docs/00-START-HERE.md` §pattern | « Bibliothèque : entités NON namespacées, partagées » | deux régimes (gabarits vs travail), renvoi `cle()` |
| 12 | `docs/DATA-OWNERSHIP.md` | `grillesTemplates`/`echellesTemplates`/`pratiquesConfigurables` = « G » ; `modalitesEvaluation` « Reste Lot 2 » | NS avec dates/mécanismes ; Lot 2 LIVRÉ (fin #328 en 1.22.0) ; note de currency en en-tête (contourneurs datés Beta 99.62 — re-générer `audit-ssot.py` avant usage) |
| 13 | `BACKLOG.md` #328 | item ouvert, s'arrêtait à L2-b1 | coché ✅ LIVRÉ COMPLET (1.22.0) — trace consignée (commit `a51bb72d`, vague 3) |

## 3. Vérifié SANS écart

- `SKILL_Ecosysteme_classe.md`, `SKILL_RaI.md`, `SKILL_Securite_donnees.md` :
  aucune assertion sur le régime des clés modèles (grep
  `grillesTemplates|echellesTemplates|pratiquesConfigurables|CLES_GLOBALES` vide).
- `SKILL_verification_adverse.md` : seule occurrence = exemple narratif daté
  (légitime, non normatif).
- `docs/architecture/ECOSYSTEME-DONNEES.md` : ne cite pas les clés modèles.
- `SKILL_Debut_de_session.md` / `SKILL_Fin_de_session.md` : procéduraux,
  pas de modèle de données.

## 4. Limites de l'audit

- Les **listes de contourneurs** de `DATA-OWNERSHIP.md` (audit Beta 99.62,
  22 mai) n'ont PAS été re-vérifiées site par site — hors périmètre « pas de
  réécriture de fond ». Une note de currency en tête du registre le signale
  et pointe `scripts/audit-ssot.py`.
- `docs/modules/*.md` et `docs/legacy/*.md` n'ont pas été balayés
  exhaustivement (volumétrie) ; le périmètre de l'item #363 visait les
  skills + docs d'entrée. Si un chantier touche un module précis, vérifier
  sa fiche `docs/modules/` contre le code au moment de l'ouvrir.
- Playwright non exécutable en cloud : sans objet ici (audit documentaire,
  Vitest suffit).
