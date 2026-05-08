# Plan — Ménage du root (8 mai 2026)

**Date** : 8 mai 2026
**Statut** : Plan à valider, aucune action exécutée
**Origine** : Demande de Grégoire — « grand ménage dans les fichiers et répertoires qui traînent dans root »
**Cible** : un root lisible où chaque fichier/dossier a une raison claire d'être là, sans plans livrés, scripts one-shot exécutés, prototypes orphelins ou copies de travail.

---

## Inventaire actuel du root

63 entrées au total. Catégorisation grossière (détaillée plus bas) :

| Catégorie | Compte | Statut typique |
|---|---|---|
| Fichiers actifs (runtime, configuration) | ~15 | À garder en root |
| Dossiers actifs (code, docs, ressources) | ~12 | À garder en root |
| Plans/audits livrés ou abandonnés | ~5 fichiers + 2 dossiers | Candidats à archive ou suppression |
| Prototypes HTML/JSX orphelins | 5 | Candidats à archive |
| Scripts one-shot exécutés | 1 | Candidat à archive |
| Documents personnels (bilans, questionnaires) | 4 | Hors-périmètre projet, à déplacer |
| Doublons / artefacts | 1-2 | À nettoyer |
| Confidentiel / privé (sauvegardes terrain) | 1 dossier (4,3 Mo) | À déplacer hors repo |
| Lourds non runtime (PDF) | 3 fichiers + 1 dossier (51 Mo) | À déplacer hors repo si non gitignored |

---

## Méthodologie proposée

**Trois phases**, validation Grégoire entre chaque :

1. **Phase 1 — Cartographie détaillée + décisions** (cette session, ~1 h)
   Pour chaque entrée : statut runtime, dernier commit, raison d'être présumée → décision (Garder en root / Déplacer vers `docs/` ou `archives/` ou `obsolètes/` / Supprimer / Gitignorer / Investiguer).

2. **Phase 2 — Exécution par lots** (~30-45 min)
   Application des décisions de la Phase 1, lot par lot, avec commit séparé et message explicite. Aucune suppression ne se fait sans un git mv ou un commit dédié qui rend l'opération réversible via `git revert`.

3. **Phase 3 — Mise à jour du `.gitignore` + doc** (~15 min)
   Pour empêcher les futures dérives : règles `.gitignore` ajoutées pour les patterns fréquents (`Bilan*.docx`, `prototype-*.html` hors `index.html`, `Sauvegarde *`, etc.). Note dans `CLAUDE.md` ou `SESSION.md` sur la convention de root.

---

## Phase 1 — Cartographie détaillée

Format : `nom · taille · dernier commit / mtime · décision proposée · justification`.

Décisions possibles :
- **GARDER** — actif, doit rester en root
- **DÉPLACER** — actif mais sa place n'est pas en root
- **ARCHIVER** — historique utile, déplacer vers `obsolètes/` ou `docs/archives/` (déjà gitignored via `*obsolètes*/`)
- **SUPPRIMER** — orphelin sans valeur historique (rétention git suffit)
- **GITIGNORER** — fichier local, jamais censé être dans git
- **INVESTIGUER** — ambigu, demander à Grégoire

### A. Fichiers de configuration et runtime (à GARDER)

| Fichier | Statut |
|---|---|
| `_headers` | Cloudflare/Netlify, runtime |
| `.gitignore`, `.gitattributes` | Git config |
| `index.html`, `styles.css` | Runtime |
| `version.json`, `resolutions.json` | Runtime (source de vérité version + résolutions tickets) |
| `noms_stables.json` | Runtime (référencé dans le code, registre de noms protégés) |
| `design-system.html` | Référence visuelle obligatoire (CLAUDE.md) |
| `BACKLOG.md`, `CLAUDE.md`, `SESSION.md`, `README.md`, `LICENSE.md`, `NOTES-DE-VERSION.md` | Doc obligatoire / projet |

### B. Doublons / artefacts à nettoyer

| Fichier | Décision | Justification |
|---|---|---|
| `NOMS_STABLES.json` (226 lignes, identique à `noms_stables.json`) | **SUPPRIMER** | Doublon exact (vérifié via `diff`). Le code référence la version lowercase. Conserver une seule source de vérité. |
| `architecture-navigation-actuelle (2 avril 2026) - copie.txt` | **SUPPRIMER** ou **ARCHIVER** | Le « - copie » dans le nom + date dans le nom = brouillon de session. Si l'info est restée pertinente, elle devrait être dans `docs/`. Sinon retrait. |

### C. Plans livrés ou abandonnés (en root)

| Fichier | Décision | Justification |
|---|---|---|
| `AUDIT-VOCABULAIRE-2026-04-28.md` (5 Ko) | **ARCHIVER** vers `obsolètes/` | Audit livré (Réserve → Archives, #259), le travail est dans le code. Conserver pour historique. |
| `PLAN-NETTOYAGE-WIZARD-V1-2026-04-28.md` (9 Ko) | **INVESTIGUER** | Wizard V1 dead code identifié pendant Plan 1 Phase 3 (22 avril). Plan probablement encore valide à exécuter — vérifier statut avec Grégoire. |
| `SPEC-CONSOLIDATION-APPRENTISSAGES.md` (11 Ko) | **INVESTIGUER** | Spec datée 1 mai. Statut implémentation inconnu — chantier actif ou abandonné ? |
| `Spec - Prompt et parser questionnaires Labo Codex.md` (15 Ko) | **INVESTIGUER** | Spec datée 3 mai. Lien avec questionnaires de bilan trimestre — fonctionnalité non livrée à ce jour ? |

### D. Plans de travail (dossier `plans de travail/`)

16 plans, 288 Ko. Plusieurs concernent des chantiers livrés. À trier :

| Plan | Statut probable | Décision |
|---|---|---|
| `PLAN-DEFENSE-A-SANDBOX-IFRAME.md` | **LIVRÉ** (PR #14, 8 mai matin) | ARCHIVER vers `obsolètes/` |
| `PLAN-DEFENSE-I-TESTS-AUTOMATISES.md` | **LIVRÉ** (PR #15, 8 mai après-midi) | ARCHIVER vers `obsolètes/` |
| `PLAN-AUTONOMISATION-UTILISATEUR.md` | Phases 3, 4.A, 4.B, 4.C livrées (22 avril) ; Phase 5 reportée après revert | INVESTIGUER (encore actif ?) |
| `PLAN-AUDIT-PHASE5-DEMO.md` | Lié à la tentative Phase 5 du 22 avril (revert) | INVESTIGUER |
| `Plan - Désaturation localStorage (analyse).md` | Cité dans MEMORY.md comme « prochain chantier » thumbnails | GARDER (actif) |
| `PLAN-CARROUSEL-SEQUENCES.md` | Cité dans MEMORY.md comme « prochain chantier » planification | GARDER (actif) |
| `PLAN-Apres-Phase7-Doublons.md` | Roadmap post-Phase 7, option C confirmée 2 mai | INVESTIGUER (encore référence ?) |
| `PLAN-INFOBULLES-UNIFIEES.md` | Statut inconnu | INVESTIGUER |
| `PLAN-NUMEROTATION-SEMAINES-PEDAGOGIQUES.md` | Statut inconnu | INVESTIGUER |
| `PLAN-PARTAGE-RESSOURCES.md` | Statut inconnu | INVESTIGUER |
| `PLAN-REFONTE-NAV.md` | Cité dans MEMORY.md, refonte nav SP1-SP5 livrée mais pas tout | INVESTIGUER |
| `PLAN-UNIFORMISATION-ENTETES-GRAPHIQUES.md` | Statut inconnu | INVESTIGUER |
| `PLAN-BILAN-REFLEXIF-V2.md` | Lié aux bilans (voir bloc F) | INVESTIGUER |
| `Plan - Archivage et stockage inter-trimestres.md` | Lié à #251 codex data ? | INVESTIGUER |
| `Plan - Rythme (tableau de bord évaluation).md` | Statut inconnu | INVESTIGUER |
| `AUDIT-COHERENCE-LABO.md` | Statut inconnu | INVESTIGUER |

**Convention proposée** : un plan livré garde un en-tête `**Statut** : LIVRÉ (date)` puis est déplacé vers `obsolètes/`. Un plan actif reste dans `plans de travail/`.

### E. Prototypes HTML / éclatages JSX (à ARCHIVER)

| Fichier | Date mtime | Décision |
|---|---|---|
| `ebauches-accompagnement.html` | 19 avril | **ARCHIVER** ou **SUPPRIMER** — refonte V3 livrée |
| `ebauches-accompagnement.jsx` | 19 avril | **ARCHIVER** ou **SUPPRIMER** — JSX d'une AI-tool, pas runtime |
| `ebauches-accueil.html` | 19 avril | **ARCHIVER** — refonte V3 livrée (cité en commentaire historique dans `js/accueil.js:3` et `index.html:720`) |
| `entete-animee-aqpc.html` | 22 avril | **ARCHIVER** ou **SUPPRIMER** — prototype présentation AQPC |
| `prototype-bulles-spirale.html` | 19 avril | **ARCHIVER** — bulles d'en-tête, livrées dans `index.html` (cf. CLAUDE.md « Animation bulles en-tête ») |
| `prototype-apercu-sandbox.html` | 8 mai | **INVESTIGUER** — daté du jour, possible support actif Défense A |

**Note** : les commentaires historiques dans `js/accueil.js:3` et `index.html:720` mentionnent `ebauches-accueil.html` comme source de la refonte V3. Si on supprime le fichier, les commentaires deviennent des références mortes — à mettre à jour ou laisser tels quels (références historiques OK).

### F. Documents personnels Grégoire (DÉPLACER ou GITIGNORER)

Ces fichiers sont des artefacts pédagogiques personnels, pas des documents projet. Ils n'ont pas leur place sous git :

| Fichier | Décision |
|---|---|
| `Bilan reflexif H2026 - version revisee v07.md` | **DÉPLACER** hors repo + gitignorer pattern `Bilan*` |
| `BILAN RÉFLEXIF word.docx` | **DÉPLACER** hors repo |
| `Bilan-fin-de-trimestre-questionnaire.md` | **DÉPLACER** hors repo (sauf si c'est une spec d'app — vérifier) |
| `Bilan-fin-de-trimestre-questionnaire-format-app.txt` | **DÉPLACER** hors repo |
| `presentation-blog-labo-codex.md` | **DÉPLACER** vers `Rapports/` (déjà des contenus promo dedans) |

### G. Scripts one-shot

| Fichier | Décision |
|---|---|
| `migrer-reserve-vers-archives.sh` | **ARCHIVER** vers `scripts/` (sous `scripts/migrations/` à créer) ou **SUPPRIMER** — script #259 déjà exécuté (commit `2f16485`), git history conserve la trace. |

### H. Documents lourds non runtime

| Fichier/Dir | Taille | Décision |
|---|---|---|
| `Guide de monitorage vA2025-1-06-08-25.pdf` | 6,6 Mo | **DÉPLACER** vers `docs/` (déjà des PDFs dedans, gitignored) ou **GITIGNORER** |
| `DE_Calendrier scolaire_25-26-MAJ_2026-03-25.pdf` | 200 Ko | Déjà gitignored (pattern `>DE_*.pdf`) — vérifier qu'il ne traîne pas en cache git |
| `Claude Design/` | **51 Mo**, 14 PDFs Inconnu_*.pdf | **DÉPLACER hors repo** — données réelles d'élèves anonymisés, pas censé être dans git. Gitignorer le pattern. |
| `Sauvegarde réserve 26 avril/` | 4,3 Mo, données.json + meta.json par groupe | **DÉPLACER hors repo** — sauvegarde terrain confidentielle, déjà couverte par `sauvegarde-CONFIDENTIEL-*` ? Vérifier. |

### I. Dossiers actifs (GARDER)

| Dossier | Rôle |
|---|---|
| `js/`, `css/`, `icons/`, `img/`, `libs/`, `autocollants/` | Runtime |
| `docs/` | Documentation projet |
| `tests/` | Suite Vitest + Playwright (Défense I) |
| `scripts/` | Scripts utilitaires + hooks (Défense J) |
| `Skills pour Claude Code/` | Référence métier (CLAUDE.md cite ces 7 skills comme obligatoires) |
| `Retours des testeurs/` | Tracker bugs (gitignored sauf `SUIVI-BUGS.md`) |
| `Design system - Modules/` | Archive du DS modulaire (mentionné dans CLAUDE.md) |
| `Refactorisations/` | Architecture de référence — utile, à garder |
| `licence CC/` | Ressources image/SVG pour licence CC, runtime probable |
| `références tableur/` (6,6 Mo) | INVESTIGUER — taille suspecte pour des tableurs |
| `memory/` | Mémoire projet (peut-être ancien système Claude) | INVESTIGUER |
| `Rapports/` | Rapports projet, audits ultrareview | GARDER |

### J. Dossiers déjà classés

| Dossier | Décision |
|---|---|
| `obsolètes/` | Déjà gitignored via pattern `*obsolètes*/`. **Cible naturelle** pour les ARCHIVER de ce plan. |
| `ignorés/` | Déjà gitignored via pattern `*ignorés*/`. Vide actuellement. À garder comme staging si besoin. |

---

## Phase 2 — Exécution proposée (par lots)

Chaque lot = un commit. Ordre par risque croissant : on commence par les plus sûrs.

### Lot 1 — Doublons et orphelins évidents (zéro risque)

```bash
# Suppressions :
rm NOMS_STABLES.json                              # doublon exact de noms_stables.json
rm "architecture-navigation-actuelle (2 avril 2026) - copie.txt"  # brouillon
```

### Lot 2 — Plans livrés vers `obsolètes/`

```bash
git mv "plans de travail/PLAN-DEFENSE-A-SANDBOX-IFRAME.md" obsolètes/
git mv "plans de travail/PLAN-DEFENSE-I-TESTS-AUTOMATISES.md" obsolètes/
git mv AUDIT-VOCABULAIRE-2026-04-28.md obsolètes/
```

### Lot 3 — Prototypes orphelins vers `obsolètes/`

```bash
git mv ebauches-accompagnement.html obsolètes/
git mv ebauches-accompagnement.jsx obsolètes/
git mv ebauches-accueil.html obsolètes/
git mv entete-animee-aqpc.html obsolètes/
git mv prototype-bulles-spirale.html obsolètes/
# prototype-apercu-sandbox.html : à investiguer (Phase 1 → I)
```

### Lot 4 — Script de migration livré

```bash
mkdir -p scripts/migrations-livrees
git mv migrer-reserve-vers-archives.sh scripts/migrations-livrees/
```

### Lot 5 — Documents personnels (DÉPLACEMENT HORS REPO)

⚠️ **À faire manuellement par Grégoire** : déplacer les bilans + questionnaires bilan vers un dossier perso hors repo. Puis :

```bash
git rm "Bilan reflexif H2026 - version revisee v07.md"
git rm "BILAN RÉFLEXIF word.docx"
git rm Bilan-fin-de-trimestre-questionnaire.md
git rm Bilan-fin-de-trimestre-questionnaire-format-app.txt
```

### Lot 6 — Sauvegardes confidentielles hors repo

⚠️ **À faire manuellement par Grégoire** : déplacer `Claude Design/` (51 Mo de PDFs élèves) et `Sauvegarde réserve 26 avril/` (4,3 Mo) hors du dépôt vers un emplacement de sauvegarde personnel. Puis update `.gitignore` (ces dossiers étaient untracked, donc rien à `git rm`).

### Lot 7 — Plans à statuer (INVESTIGUER avec Grégoire)

Liste à parcourir avec Grégoire un par un :
- `PLAN-NETTOYAGE-WIZARD-V1-2026-04-28.md`
- `SPEC-CONSOLIDATION-APPRENTISSAGES.md`
- `Spec - Prompt et parser questionnaires Labo Codex.md`
- Tous les plans de la section D marqués INVESTIGUER

Pour chacun : encore actif → garder ; livré → ARCHIVER avec statut LIVRÉ ajouté en en-tête ; abandonné → SUPPRIMER ou ARCHIVER selon valeur historique.

---

## Phase 3 — `.gitignore` à étendre

Patterns à ajouter pour empêcher la dérive future :

```
# Bilans et documents personnels Grégoire
Bilan*
BILAN*
Bilan-fin-de-trimestre*

# Sauvegardes terrain
Sauvegarde *réserve*/
Sauvegarde *Archives*/

# Données pédagogiques anonymisées (élèves)
Claude Design/
*Inconnu_*_Artefact-*

# Prototypes et brouillons en root
prototype-*.html
ebauches-*.html
ebauches-*.jsx
*- copie.txt
* - copie.*

# PDFs lourds en root (sauf design-system.html)
/Guide de monitorage*.pdf
```

---

## Inventaire récapitulatif des décisions à valider

| Décision | Cible | Compte | Effet |
|---|---|---|---|
| GARDER | root | ~15 fichiers + 12 dossiers | Aucun |
| SUPPRIMER | doublons / orphelins triviaux | 2 fichiers | -1 fichier git, -1 fichier untracked |
| ARCHIVER vers `obsolètes/` | plans livrés + prototypes | ~8 fichiers | Root allégé, historique conservé |
| DÉPLACER vers `scripts/migrations-livrees/` | scripts one-shot | 1 fichier | Cohérence |
| DÉPLACER hors repo | bilans + sauvegardes confidentielles | 4 fichiers + 2 dossiers (~55 Mo) | -55 Mo + gitignore preventive |
| INVESTIGUER avec Grégoire | plans/specs ambigus | ~14 fichiers | Décision case-par-case |
| Étendre `.gitignore` | patterns de prévention | 1 commit | Anti-dérive |

---

## Risques et mitigation

1. **Référence morte vers fichier supprimé**
   - Risque : code commente `// inspiré de prototype-bulles-spirale.html`, fichier supprimé → commentaire devient un mensonge
   - Mitigation : grep avant suppression pour repérer les commentaires citant le fichier ; les laisser (référence historique) ou les mettre à jour

2. **Suppression accidentelle d'un plan encore actif**
   - Risque : un plan marqué LIVRÉ alors qu'il restait des sous-tâches
   - Mitigation : pour chaque plan, vérifier le BACKLOG et les sessions récentes avant d'archiver ; en cas de doute → INVESTIGUER

3. **Données confidentielles encore dans l'historique git**
   - Risque : `git rm` retire du HEAD mais l'historique conserve les fichiers (potentiellement des PDFs élèves dans `Claude Design/` si jamais commités — à vérifier)
   - Mitigation : vérifier `git log --all --full-history -- "Claude Design/*"` avant ; si confidentiel ET dans l'historique, considérer `git filter-repo` (gros chantier séparé). Sinon, ils étaient untracked → safe.

4. **Conflits de merge sur `obsolètes/`**
   - Risque : si une autre branche a touché les mêmes plans
   - Mitigation : faire le ménage sur `main`, après s'être assuré qu'aucune branche active ne dépend de ces fichiers

---

## Effort estimé

- Phase 1 (cartographie + décisions case-par-case) : ~1 h cumulée (une partie déjà faite ici)
- Phase 2 (exécution lots 1-6) : ~30-45 min
- Phase 2bis (lot 7 INVESTIGUER avec Grégoire) : ~30 min de discussion
- Phase 3 (.gitignore + doc) : ~15 min
- **Total** : ~2-3 h, fractionnable en sessions distinctes

## Prochaines actions

1. Grégoire valide ce plan ou demande des ajustements (notamment sur les fichiers en INVESTIGUER de la section D + la séparation lot 5 / lot 6 confidentiels).
2. Une fois validé, les lots 1-4 peuvent s'enchaîner rapidement (zéro investigation, juste de l'exécution + commits propres).
3. Le lot 7 (INVESTIGUER) demande une session ciblée Grégoire/Claude pour décider plan-par-plan.
