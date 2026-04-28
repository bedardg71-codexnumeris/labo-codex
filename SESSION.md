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

Contexte : 7 chantiers Réserve livrés le 28 avril 2026 (commits sur main,
tous poussés). La Réserve est fonctionnellement complète pour l'usage
quotidien : versement (FSAPI Chrome/Edge ou ZIP Safari), réimport sélectif
(6 types de ressources avec auto-cochage des références croisées),
remapping d'IDs en mode copie en double, aide contextuelle dans les
2 modales Réserve.

Période sensible : Grégoire est en fin de trimestre avec ses élèves +
colloque dans 1 mois. Priorité aux tâches qui réduisent la dette
technique sans engager de chantiers larges. Privilégier les livrables
courts, sécurisés, vérifiables, atomiques (1 commit par sous-chantier).

ÉTAT À CONNAÎTRE :
1. Audit en attente : AUDIT-VOCABULAIRE-2026-04-28.md à la racine
   (untracked). 11 occurrences de copy à corriger (Mac/iPad/cloud/
   synchronisation) suite aux 2 nouveaux feedbacks. ~30-45 min en une
   passe. Voir le rapport pour la liste exacte et les reformulations
   suggérées.
2. Nouveaux feedbacks (mémoire Claude, déjà chargés via MEMORY.md) :
   - feedback_metaphore_cloud_interdite.md — pas de cloud/synchro dans
     le copy utilisateur, tout est manuel et local.
   - feedback_vocabulaire_appareils_generique.md — copy : « ordinateur
     / tablette / appareil » plutôt que « Mac / iPad ». Quand on doit
     distinguer FSAPI vs ZIP, parler du navigateur (Chrome/Edge vs
     Safari), pas de la marque d'appareil.
3. project_reserve.md (mémoire Claude) — sections complètes pour les
   chantiers Réserve, dont #256 (aide) et #257 v2.A (remapping).

LECTURE OBLIGATOIRE AVANT DE CODER :
1. (auto-memory de Claude) project_reserve.md — état technique de
   reserve.js, reserve-ouvrir.js, et de l'aide aux modales.
2. docs/architecture/ECOSYSTEME-DONNEES.md — document fondateur 4
   concepts (Codex, Réserve, Codex data, Voûte). Vocabulaire
   bibliothécaire. Section « Voie de retour ».
3. BACKLOG.md — feuille de route restante.
4. CLAUDE.md — section « Architecture des données » et règles de
   sécurité (innerHTML/echapperHtml, data-action, console.warn/error,
   pas de eval/CSP, etc.).

ITEMS DISPONIBLES (par ordre logique recommandé) :

  Audit copy   Appliquer AUDIT-VOCABULAIRE-2026-04-28.md (11 occurrences,
               ~30-45 min, faible risque, atomique).

  #249         Section dédiée Réserve dans Réglages — affiche état
               (versements détectés, dates, tailles). ~3-4 h. Apporte un
               bloc concret affichable AVANT de refondre Réglages globaux.

  #247         Refonte Réglages > Données pour aligner avec l'architecture
               des 4 concepts. ~1 j. Plus cohérent APRÈS #249.

  #257 v2.B    Mode consultation namespace `__archive_*` (lecture seule,
               démo/formation). ~5-6 h. À FROID dans une session dédiée
               — pas en enchaînement. Plan détaillé à écrire avant de
               coder. Touche le namespacing trimestre (sensible).

  #256-bis     Aide aux 8 autres modales de l'app (Nouveautés, Réparation,
               Wizard pratique, ApercuPDF, Confidentiel, Export, Import,
               Suppression ressource). Reproduire le pattern de #256.

  #248         Réserve v1.1 — manifeste auto-fusionné Safari (Chrome le
               fait déjà via FSAPI). ~2-3 h. Basse priorité tant que la
               friction Safari n'est pas concrète.

  #251 / #252  Codex data + Labo autonome (priorités 4-5 ECOSYSTEME, gros).
               À garder pour quand l'usage de recherche existera.

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
- Code mort identifié (à nettoyer dans une session zéro-dette) :
  - Wizard pratique V1 (`modalWizardPratique` dans pratiques.js:2261+,
    remplacé par V2 — mentionné dans SESSION 22 avril).
  - Instrumentation `[DEMO-TRACE]` (présente depuis 18 avril, à retirer
    quand la démo est verrouillée stable).
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
