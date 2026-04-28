# SESSION — État au 28 avril 2026 (Réserve étendue — finition UX + remapping IDs)

**Date** : 28 avril 2026
**Dernier build** : `0428-1245` · Beta **99.28**
**Branche** : `main` (poussée sur origin)
**Statut** : **7 chantiers Réserve livrés en une journée**, tous poussés sur origin.
- Matin/midi : #255 (doc), #253 (FSAPI), #254 v1+v1.1 (Ouvrir la réserve), #250 (Codex allégé sans TimeMachine), #257 v1 (productions/cartouches/pratiques + auto-cochage).
- Après-midi : **#256** (aide aux modales Réserve : 7 popups + 6 infobulles + correction `entete-codex` anti-cloud) et **#257 v2.A** (remapping IDs en mode « copie en double » : productions/cartouches/pratiques rebranchées sur les nouvelles copies de grilles/échelles).

---

## 🚀 Consigne de démarrage pour la prochaine session

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

Contexte : 5 chantiers de la voie de retour Réserve livrés le 28 avril
2026 (commits 8dbfda1, 24490f4, 82bf640, 5472403, 50d8860 sur main,
poussés). La Réserve est maintenant fonctionnelle dans les deux sens :
versement (codex → réserve) avec mode FSAPI Chrome/Edge, et réimport
sélectif (réserve → bibliothèques actives) pour 6 types de ressources.
Le TimeMachine est retiré du codex (priorité 1 ECOSYSTEME). Reste à
attaquer #257 v2 (remapping IDs + mode consultation), #256 (infobulles
modales), ou un autre item.

LECTURE OBLIGATOIRE AVANT DE CODER :
1. (auto-memory de Claude) project_reserve.md — résumé technique des
   modules reserve.js (versement v1+v1.5 FSAPI) et reserve-ouvrir.js
   (réimport v1). Pointer présent dans MEMORY.md, chargé automatiquement.
2. docs/architecture/ECOSYSTEME-DONNEES.md — document fondateur 4
   concepts (Codex, Réserve, Codex data, Voûte). Vocabulaire
   bibliothécaire. Section « Voie de retour : réimport et consultation »
   livrée le 26 avril (#255).
3. BACKLOG.md — items #247-249, #251-252, #256-257v2 — feuille de route
   restante.
4. CLAUDE.md — section « Architecture des données » et règles de
   sécurité (innerHTML/echapperHtml, data-action, console.warn/error).

ITEMS DISPONIBLES (par ordre logique recommandé) :

  #257 v2  Ouvrir la réserve v2 — remapping d'IDs en mode « copie en
           double » + mode consultation namespace temporaire (~5-6 h
           pour le mode consultation seul ; remapping ~3-4 h).
           Suite naturelle de #257 v1.

  #256     Étendre le système d'aide aux modales (infobulles, primo-aide,
           parcours guide). Léger (~1 j) mais important pour le novice.
           Tu as souligné toi-même le besoin pendant les tests #254.

  #247     Refonte Réglages > Données pour aligner avec l'architecture
           des 4 concepts. Maintenant débloqué (Réserve v1 validée).
           ~1 j.

  #248     Réserve v1.1 — mise à jour automatique du manifeste-reserve
           pour les utilisateurs Safari (manifeste-reserve-patch.json à
           fusionner via UI). FSAPI le fait déjà automatiquement. ~2-3 h.

  #249     Section dédiée Réserve dans Réglages — affiche état
           (versements détectés, dates, tailles). ~3-4 h.

  #251     Codex data — extraction depuis la Réserve (priorité 4
           ECOSYSTEME). Format JSON sans blobs pour le Labo. Distinct
           de #254 (matériel pédagogique) — celui-ci sert l'analyse
           longitudinale.

  #252     Labo autonome — sortir le Labo de la section Suivi
           (priorité 5 ECOSYSTEME).

CONTRAINTES (rappel) :
- Safari Mac + iPad cibles principales (file://)
- Cache-busters ?v= INOPÉRANTS sur Safari file:// — Cmd+Q pour rechargement
- console.log interdit — console.warn/error uniquement
- echapperHtml() obligatoire sur innerHTML avec données utilisateur
- Zéro handler inline — utiliser data-action / data-on-change (le
  dispatcher main.js supporte la dot notation, ex. Reserve.actionVerser)
- Variables CSS du DS, tester modes clair ET sombre
- Bumper version.json + js/init-inline.js (PAS index.html — les fallback
  ont migré) avant chaque commit. Demander le numéro de beta à Grégoire.
- Stage explicite par fichier (git add fichier1 fichier2) — beaucoup
  d'autres modifications dans le working tree non liées au chantier.
  Pour index.html splitté entre commits : sauvegarder, checkout HEAD,
  ré-appliquer les modifs ciblées, commit, restaurer working tree.

OBSERVATIONS OUVERTES (hors scope) :
- Working tree : encore beaucoup de modifs non commit (CLAUDE.md,
  Skills, docs/, plusieurs js hors-Réserve, styles.css, suppressions
  Audit UX) + beaucoup de fichiers untracked (logs, rapports, plans,
  ebauches). À trier par Grégoire selon priorité.
- Quota localStorage saturé sur Mac (warnings au boot, plan dans
  « plans de travail/Plan - Désaturation localStorage (analyse).md »).
- Grille orpheline grille_1772187755149_uq1oiiafa dans H2026 (référencée
  mais absente de grillesTemplates).
- Cours orphelin A2025 (COURS1766455789356 référencé par les étudiants
  et le groupe-cours, absent de la table globale `cours`). reserve.js a
  un fallback regex pour ce cas, mais d'autres parties de l'app pourraient
  être affectées.
```

---

## Récapitulatif des livrables 28 avril 2026

| Commit | Item | Description |
|---|---|---|
| `8dbfda1` | #255 | docs(reserve): clarifier la double fonction (Dépôt + Fonds consultable). Verbes « réimporter » et « ouvrir un versement ». |
| `24490f4` | #253 | feat(reserve): automatisation FSAPI Chrome/Edge. Pattern handle persisté en IDB direct (bypass db.js). Sentinelle de complétude meta.json. |
| `82bf640` | #254 v1+v1.1 | feat(reserve): ouvrir la réserve, réimport sélectif (grilles, échelles, tampons). Détection navigateur (3 vues étape 1). |
| `5472403` | #250 | refactor(codex): retirer le TimeMachine, codex allégé (−461 lignes). Purge silencieuse au boot. Sentinelle CLE_PURGE_TIMEMACHINE_FAITE. |
| `50d8860` | #257 v1 | feat(reserve): productions/cartouches/pratiques + auto-cochage références. 3 nouvelles façades d'import. |
| `95adf24` | #256 | feat(aide): étendre l'aide aux modales Réserve. 7 popups + 6 infobulles. Correction `entete-codex` (retrait métaphore « cloud personnel »). |
| `4949b2e` | #257 v2.A | fix(reserve): remapping IDs en mode « copie en double ». Productions/cartouches/pratiques pointent sur les nouvelles copies de grilles/échelles. Compteur `refsRemappees` au rapport. |

**Architecture** :
- `js/reserve.js` (1404 l.) — versement (verserGroupeCours), API publique étendue : obtenirHandle, statutHandle, supporteFSAPI.
- `js/reserve-ouvrir.js` (878 l.) — réimport (actionOuvrir, chargerDepuisFichier, appliquerReimport).
- `js/codex.js` (2556 l.) — espace de travail allégé (sans TimeMachine).

**Pattern clé FSAPI à retenir** :
`FileSystemDirectoryHandle` est structuredClone-compatible mais **pas JSON-sérialisable**. `db.set()` passe par localStorage qui ferait `JSON.stringify` et perdrait le handle silencieusement. Solution : objectStore IDB dédié (`reserve_fsapi.handles`). Permission re-vérifiée à chaque session via `queryPermission` / `requestPermission` (user gesture requis pour le second).

---

## Prochaine session — décision à prendre

**Réserve : fonctionnellement complète pour l'usage quotidien** (versement + réimport + remapping IDs). Reste de la finition + chantiers connexes.

**Items Réserve** :
- **#249** — Section dédiée Réserve dans Réglages (état : versements, dates, tailles). 3-4 h. Recommandé avant #247.
- **#247** — Refonte Réglages > Données (vocabulaire 4 concepts). ~1 j. Plus cohérent après #249.
- **#257 v2.B** — Mode consultation namespace `__archive_*` (lecture seule, démo/formation). 5-6 h. À froid dans une session dédiée — pas en enchaînement.
- **#248** — Manifeste-réserve auto-fusionné Safari (Chrome le fait déjà via FSAPI). 2-3 h. Basse priorité.

**Items hors Réserve** (priorités 4-5 ECOSYSTEME, gros) :
- **#251** — Codex data, extraction depuis la Réserve.
- **#252** — Labo autonome.

**Audit en attente** : `AUDIT-VOCABULAIRE-2026-04-28.md` à la racine — 11 occurrences de copy à corriger (`Mac`, `iPad`, `cloud`, `synchronisation`) suite aux nouveaux feedbacks établis en session. Effort estimé : 30-45 min en une passe.

**Feedbacks nouveaux (mémoire Claude)** :
- `feedback_metaphore_cloud_interdite.md` — pas de cloud/synchro dans le copy. Tout est manuel et local.
- `feedback_vocabulaire_appareils_generique.md` — préférer « ordinateur / tablette / appareil » à « Mac / iPad ».
