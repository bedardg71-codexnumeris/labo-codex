# PROTOCOLE — Migration live #358 (séance dédiée, risque max)

> **À dérouler à froid, à tête reposée, sur backup frais.** Document autoportant :
> il suffit de le suivre étape par étape. Préparé le 28 juin 2026 (soir) ; la branche
> est prête, la durabilité est en place. Plan de fond : `PLAN-358-migration-modeles.md`.
> Mémoire : [[db-durabilite-revert-localstorage-sature]], [[namespacing-par-trimestre]],
> [[catalogue-gabarits-vs-grilles-travail]], [[verifier-avant-ecrire-donnees-reelles]].

---

## 0. Ce qui est déjà fait (état de préparation)

- **Code de migration LIVRÉ** sur la branche `claude/358-bloc1-fondations-modeles`
  (HEAD `5bac6d67`) : helpers + bascule registre `cle()` + re-points (~120 sites) +
  C1 peuplement + G4 vidage + flag idempotent, **câblés au boot** (`main.js:404-419`).
- **Durabilité COMPLÈTE en place** (merge de main, Option A/B/C, 1.24.2) : toute
  écriture ET suppression IDB résout sur `transaction.oncomplete` (commit disque) et
  toute opération fire-and-forget est drainée au déchargement. `db.js` identique à main.
  **C'est ce qui rend la migration durable** — l'incident du 28 juin PM (migration qui
  revertait au hard refresh) est fermé à la racine.
- **Vitest 1130/1130 vert** sur la branche mergée. Les 3 oracles existent dans `scripts/`.

> ⚠ La migration elle-même est **automatique au premier boot** du build : il n'y a rien
> à taper pour migrer. Le rôle de la séance = **encadrer** ce boot d'un filet avant/après
> et prouver que ça tient au hard refresh.

---

## 1. Pré-requis (cocher avant de commencer)

- [ ] **Backup Codex frais** déposé (export complet horodaté) — filet de rollback ultime.
- [ ] Le build chargé au navigateur = ce worktree, branche `claude/358-...`, HEAD `5bac6d67`
      (vérifier : la bannière de version doit afficher **1.24.2 / build 0628-1824**).
- [ ] Fichiers oracle a2025 localisés (hors repo privé, sur la machine) : bulletin(s)
      Omnivox `groupe-*.xls`. (h2026 = self-compare, aucun oracle externe requis.)
- [ ] Node disponible pour lancer les scripts `.mjs`.
- [ ] Trimestre actif = **h2026** (il est vivant → son vidage du global est sûr ; a2024
      déjà supprimé le 28 juin, cf. plan §6).

---

## 2. Phase AVANT — figer la baseline (lecture seule)

1. **Exporter le codex** dans son état actuel → `donnees-AVANT.json`.
2. **L2 (oracle PRIMAIRE) — isolation**, doit être **VERT** :
   ```
   node scripts/sentinelle-isolation-grilles-trimestre.mjs --codex "donnees-AVANT.json"
   ```
   Attendu : aucun modèle partagé à l'usage entre a2025 et h2026.
   ⚠ Si ROUGE *avant* migration → s'arrêter : il y a un partage préexistant à comprendre
   (cf. plan §1 : 2 grilles `GRILLE1759243306842` / `GRILLE1759264206489` à surveiller).
3. **L0 (défense secondaire) — golden master**, capturer les notes recalculées :
   - a2025 (fidélité Omnivox, MAE attendue **< 0,5** ; 0,148 mesuré le 28 juin) :
     ```
     node scripts/valider-golden-master-trimestre.mjs --codex "donnees-AVANT.json" \
       --omnivox "groupe-00001.xls" [--omnivox "groupe-00002.xls" ...]
     ```
   - h2026 (self-compare) : lancer le même script sur h2026 et **conserver la sortie**
     (les 46 notes recalculées) pour diff avec l'APRÈS.
4. **Noter** : nombre de clés `<trim>_grillesTemplates` / `<trim>_echellesTemplates`
   existantes et l'état de la clé globale `grillesTemplates` (console :
   `db.getSync('grillesTemplates')` — taille).

> Oracle de vérité : **L2 + les notes ne bougent pas**. L0 est aveugle au déplacement
> de modèles (il agrège les notes stockées) — il sert à détecter un dommage collatéral.

---

## 3. Phase MIGRATION — le boot migre

5. **Charger le build** (recharge normale). Au boot, `main.js:404-419` exécute, si le flag
   `migration_modeles_namespacees_done` est absent :
   `migrerModelesVersNamespace()` (C1 peuplement `<trim>_*`) → `viderModelesGlobalHerite()`
   (G4) → pose le flag.
6. **Surveiller la console** pendant le boot :
   - ✅ attendu : le flag passe à `true` ; les `<trim>_grillesTemplates` peuplés.
   - ⚠ **`console.warn [Migration modèles #358] … orphelin(s) … CONSERVÉ(s)`** : NORMAL et
     SANS PERTE — liste les ids du global sans trimestre propriétaire ; ils sont **gardés**
     dans le global (jamais supprimés). **Noter les ids** pour examen, mais ce n'est pas un échec.
   - ❌ toute erreur (exception, `Pas de grille`, modèle introuvable) → noter, ne pas paniquer,
     passer au test durabilité puis décider.

---

## 4. Phase TEST DURABILITÉ — le gain de la journée

7. **HARD REFRESH** (vider le cache, recharger). C'est le test qui ÉCHOUAIT le 28 juin PM
   avant le fix db.js.
8. **Vérifier que la migration TIENT** (console) :
   - `db.getSync('migration_modeles_namespacees_done')` = `true` (toujours).
   - `db.getSync('grillesTemplates')` = vide (cas nominal) ou seulement les orphelins notés.
   - Les `<trim>_grillesTemplates` toujours peuplés.
   ⚠ Si quoi que ce soit a **reverté** au hard refresh → la durabilité n'a pas joué : STOP,
   exporter l'état, ne pas réessayer, m'appeler avec la console.

---

## 5. Phase APRÈS — valider

9. **Exporter le codex** → `donnees-APRES.json`.
10. **L2** sur `donnees-APRES.json` → doit rester **VERT**.
11. **L0** :
    - a2025 Omnivox : MAE toujours **< 0,5** (ne doit pas bouger vs AVANT).
    - h2026 self-compare : **diff des 46 notes recalculées AVANT vs APRÈS = 0**.
12. **Vérification visuelle** (navigateur, h2026) :
    - Dépistage SOLO : la grille de référence (FR-HOLIS `grille_1772187755149_uq1oiiafa`)
      résout (pas de warning « Pas de grille de référence » nouveau).
    - Ouvrir une éval notée → la note affichée est inchangée.
    - Dropdowns de notation : les grilles/échelles du trimestre apparaissent.
    - Tester les **deux modes** (sombre/clair) si un écran a été touché.

---

## 6. Critères de succès (tous requis)

| # | Critère | Source |
|---|---|---|
| 1 | L2 VERT avant ET après | sentinelle isolation |
| 2 | a2025 MAE Omnivox < 0,5, inchangée | L0 |
| 3 | h2026 : 46 notes recalculées identiques avant/après | L0 self-compare |
| 4 | Migration TIENT au hard refresh | console |
| 5 | Clé globale vidée (hors orphelins notés), `<trim>_*` peuplés | console |
| 6 | Dépistage SOLO + une éval ouverte = OK visuellement | navigateur |

---

## 7. Rollback (si un critère échoue)

1. **Ne pas réessayer** la migration (le flag bloque une 2ᵉ passe ; un état partiel est pire).
2. **Restaurer le backup Codex frais** déposé en §1.
3. Exporter l'état fautif (`donnees-ECHEC.json`) + copier la console pour diagnostic.
4. Reprendre à froid après analyse.

---

## 8. Points de vigilance

- **Orphelins conservés** ≠ perte. Le vidage G4 ne retire du global QUE les modèles
  redondants (capturés dans une copie `<trim>_*`) ; tout orphelin est gardé + journalisé.
- **Catalogue de gabarits intouché** : `bibliothequeGrilles`/`bibliothequeEchelles` sont
  des GABARITS, disjoints des grilles de travail — #358 n'y touche pas (cf.
  [[catalogue-gabarits-vs-grilles-travail]]).
- **Idempotence** : si le boot échoue après peuplement mais avant le flag, le boot suivant
  re-tente (peuplement additif). Pas de double-migration destructrice.
- **CI** : le seul rouge Playwright (`maquettes-decouvrabilite-326`) est préexistant (#326
  comparateur masqué) — pas une régression.
- **Après succès** : pousser la branche + ouvrir/mettre à jour la PR #69 ; release `minor`
  (changement de format de données = à confirmer si on monte en `major`).
