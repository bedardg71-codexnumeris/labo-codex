# PLAN #464 — L2 : clés nues (résurrections, replis, migrations écrasantes)

> **Ouvert** : 21 août 2026, sur ordre du triage (§5 de TRIAGE-audits-2026-08-21.md, rang 2).
> **Constats** : CT-07, CT-11 (tranche), CT-12, CT-26, CO-02, CO-09, CO-10, CO-11 (verdict D2), CO-19.
> **Cadre** : skill `integrite-globaux` (copie-avant-purge, push sans replace, identité+flag).
> **Critère de fin** : plus AUCUNE lecture/écriture vivante des clés nues du périmètre ;
> migrations conservatrices (copie-si-vide + purge, jamais d'écrasement) ; sentinelle par sous-lot,
> break-testée ; suites vertes ; release patch.

## Décisions de conception (défauts retenus, go/no-go au rapport)

1. **`dureePeriode` = NAMESPACÉE** (aligne le registre DATA-OWNERSHIP:87, le modèle « horaire
   propre au trimestre » du 29 mai, et rend ENFIN lues les écritures existantes de
   `purgerLegacy()` (`{id}_dureePeriode`) et du pack démo (`demo_dureePeriode`)). Migration :
   copie de la valeur nue vers TOUS les trimestres du registre qui n'en ont pas (comportement
   identique préservé partout), puis purge. UI : « S'applique à tous les horaires **du trimestre** ».
2. **`forcerMigration` : copie-si-cible-vide + purge systématique du résidu** (warn si refus).
   PAS de flag one-shot (écart à la proposition d'audit, motivé) : la purge systématique
   auto-éteint le déclencheur, ET préserve la capture bénéfique du travail pré-trimestre
   (reproductible), que le flag aurait tuée. « Vide » = null ou tableau vide (même sémantique
   que l'existant migrerHorairesEtGroupesCours).
3. **`migrerResidusClesNues()` one-shot** (flag `migration_residus_cles_nues_done`) : passe
   unique sur CLES_NAMESPACEES + dureePeriode — copie-si-vide vers le trimestre actif
   (dureePeriode : vers tous), warn si refus, purge du nu. Ferme CO-09/CT-11/CT-12 côté données.
4. **`migrerHorairesEtGroupesCours` RETIRÉE** : redondante après (3) — elle recopiait sans
   purger à chaque boot (CT-12). Edge assumé : le régime clés-nues post-suppression du dernier
   trimestre (CT-21a) ne sera plus recapturé — L1/#463 fermera CT-21a à la source.
5. **CT-26 : inventaire des clés passées à `cle()`** → inscription délibérée aux registres,
   puis `console.warn` (une fois par clé) sur le fallthrough. Sans l'inventaire d'abord,
   le warn serait un flot.
6. **D2 exécuté ici** (pas seulement documenté) : `assurerEchellesPersonnalisees` RETIRÉE ;
   les 8 échelles versées UNE FOIS dans `bibliothequeEchelles` (one-shot flaguée, push sans
   replace, tombstones `ressourcesSupprimees` respectés). Les copies déjà semées dans les
   trimestres existants restent (données utilisateur désormais). Garde de parse sur
   `migrerCategoriesVersSousCriteres` (grilles.js:4042, même famille).
7. **CO-09 : retrait des 55 fallbacks** `|| db.getSync('pratiquesConfigurables', ...)` dans
   21 fichiers — Edit exact par fichier (jamais sed par plage), APRÈS la migration (3).
8. **CO-02** : `verifierReferencesPasDemo` résout via `cle(ref.collection)` ; les items démo
   sont estampillés `isDemo: true` À L'ÉCRITURE du namespace démo (`peuplerNamespace`) —
   renforce le patron « identité + flag » du retrait démo existant.
9. **CO-19** : `obtenirTableConversionIDME` — priorité inversée : échelle du trimestre
   (`cle('echellesTemplates')`) d'abord, résidu `niveauxEchelle` en dernier recours.
10. **CT-11 tranche L2** : retrait des DEUX écritures nues `seancesHoraire`
    (trimestre-v2-orchestre.js:248, entites/groupe-cours.js:246) et du fallback n°5
    (horaire.js:168). Les ~7 lecteurs ternaires défensifs restants deviennent morts après
    purge — leur retrait complet part au lot L7 (noté).

## Sous-lots (un commit vert chacun, release patch à la fin)

- **S1** trimestres.js : (1)(2)(3)(4)(5) + sentinelles migrations/cle().
- **S2** horaire.js + orchestre + entites/groupe-cours : (1-UI)(10).
- **S3** les 55 fallbacks pratiques (7).
- **S4** garde démo (8).
- **S5** échelles D2 (6).
- **S6** conversion IDME (9) + docs ciblées (DATA-OWNERSHIP : ligne dureePeriode) + release.

## Ce que ce lot ne fait PAS

Retrait de l'accordéon séances legacy et des lecteurs ternaires morts (→ L7/#469) ;
HorairesEntite + chaîne Beta96 (→ L7) ; interdiction de supprimer le dernier trimestre (→ L1).
Porte terrain à produire à la livraison (Safari/iPad + données réelles : la migration one-shot
tournera UNE fois chez Grégoire — backup Codex recommandé avant le premier boot post-pull).
