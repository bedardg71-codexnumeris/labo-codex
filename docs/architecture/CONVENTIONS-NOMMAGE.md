# Conventions de nommage — Labo Codex

> **Source** : Audit du codebase au 13 mai 2026 (Beta 99.42).
> **Statut** : documentation descriptive + recommandations pour le NOUVEAU code.
> **Pas de refactor forcé** : les noms legacy restent en place tant qu'ils ne posent pas de problème. La cohérence prime pour les ajouts.

## Pourquoi ce document

Le codebase a évolué sur ~18 mois avec plusieurs préfixes coexistant pour des concepts identiques (compter une collection, désigner une variable d'index, marquer un champ privé, etc.). Ce document recense les conventions observées et fixe la **canonique** pour tout nouveau code.

---

## 1. Préfixes de comptage

Pour exprimer « combien d'éléments ? ».

| Préfixe | Statut | Exemples |
|---|---|---|
| **`nb`** | ✅ **CANONIQUE** | `nbArtefactsRemis`, `nbEtudiantsTotal`, `nbEvaluationsPrevues`, `nbFichiersTravaux` |
| `n` | ⚠️ Legacy — éviter en nouveau code | `nArtefactsPAN`, `nArtefactsRetenus` (anciens) |
| `nombre` | ⚠️ Legacy — éviter en nouveau code | `nombreFichiersTravaux` (présent dans le manifeste codex) |
| `total` | ✅ **Cas particulier** — utiliser quand la valeur représente un **objectif/cible** ou un **agrégat de référence** | `totalArtefactsAttendus` (valeur attendue), `totalArtefactsRemis` (somme), `totalActions` |
| `count` | ❌ Anglicisme — éviter (sauf dans contexte d'API DOM type `MutationObserver`) | n/a |

### Pourquoi `nb` comme canonique

- Plus court que `nombre`, moins ambigu que `n` (qui peut désigner un index de boucle)
- Présent dans la majorité des champs récents (~50 occurrences vs ~10 pour `n[A-Z]` non-index)
- Aligne avec le français pédagogique (« nb d'étudiants »)

### Cas observés à NE PAS refactorer

- Le champ **`nombreFichiersTravaux`** du manifeste Codex (`js/codex.js`) — utilisé en sérialisation. Renommer casserait la rétrocompat des codex existants. À conserver.
- Le champ **`nArtefactsPAN`** dans le contexte du PAN (Plan d'Aide à l'Apprentissage Numérique) — utilisé localement, pas en bord de système.

---

## 2. Variables d'index de boucle

Lettre courte uniquement, distincte de `nb`.

| Convention | Usage |
|---|---|
| `i`, `j`, `k` | ✅ Index de boucle classique |
| `idx` | ✅ Quand `i` est ambigu (boucle imbriquée, contexte de callback) |
| `n` suivi d'un radical (`nFichierChoisi`) | ⚠️ Legacy — éviter (confusion avec `nb`) |

---

## 3. Préfixes de visibilité

| Préfixe | Sens | Exemples |
|---|---|---|
| **`_`** | Privé module (IIFE) — ne pas appeler de l'extérieur | `_actualiserMenu`, `_afficherProgression`, `_analyserFusion` (dans `js/codex.js`) |
| Aucun | Public — exporté via `window.X` ou directement accessible | `genererCodex`, `actionComparer` |
| **`CONSTANTES_MAJUSCULES`** | Constantes globales | `CLE_BIBLIOTHEQUE_CARTOUCHES`, `AUTO_DELAI_STABILISATION`, `CC_LICENSE_DEFAULTS` |

---

## 4. Champs de domaine — recommandations par concept

### Étudiants & groupes

| Préférer | Éviter | Note |
|---|---|---|
| `nbEtudiantsTotal` | `nEleves`, `nbEleves` | Le projet parle d'**étudiant·es** (collégial), pas d'élèves |
| `groupeCoursActif` | `nGroupeCoursActif` | Pas de préfixe sur la référence de l'objet courant |
| `etudiantDA` | `eleveID`, `studentDA` | DA = numéro d'admission étudiant·e |

### Productions & artefacts

| Préférer | Éviter | Note |
|---|---|---|
| `nbArtefactsRemis` | `nArtefactsRemis` | Préfixe canonique |
| `totalArtefactsAttendus` | `nbArtefactsAttendus` | `total` exprime un objectif/cible |
| `productionId`, `productionNom` | `prodId`, `prodNom` | Pas d'abréviation |

### Évaluations & critères

| Préférer | Éviter | Note |
|---|---|---|
| `nbEvaluationsPrevues` | `nEvaluations` | Préfixe canonique |
| `evaluationId`, `evaluationNom` | `evalId`, `evalNom` | Pas d'abréviation |
| `critereId`, `critereNom`, `niveauSelectionne` | `id`, `nom`, `niveau` (génériques) | Préfixe explicite |

### Fichiers / travaux

| Préférer | Éviter | Note |
|---|---|---|
| `nbFichiersTravaux` | `nFichiersTravaux`, `nombreFichiersTravaux` (sauf manifeste codex) | Préfixe canonique |
| `fichier.nomFichier`, `fichier.tailleOctets` | `file.name`, `file.size` | Camel-case français |

---

## 5. Indices A-C-P et termes pédagogiques

Domaine pédagogique : utiliser les **termes exacts** du projet (voir `.claude/skills/ecosysteme-classe/SKILL.md`).

| Terme canonique | Sens |
|---|---|
| `indices.A`, `indices.C`, `indices.P` | Assiduité / Complétion / Performance |
| `niveau` (I, D, M, E, R) | IDME + R pour Réussite |
| `pratique` (SOM, STD, SPE, DEN) | Pratiques de notation (sommative, standard, spécifique, dénombrement) |
| `cartouche` | Bloc de rétroaction prédéfini |
| `gabarit` | Modèle de cartouche |
| `pan` | Plan d'Aide à l'Apprentissage Numérique |
| `idme` | Insuffisant / Développement / Maîtrise / Étendu |
| `rai` (niveau 1/2/3) | Réponse à l'Intervention |

---

## 6. Préfixes namespacés (stockage)

Voir `docs/DATA-OWNERSHIP.md` pour le registre complet.

| Forme | Sens |
|---|---|
| `h2026_*`, `a2025_*` | Données namespacées par trimestre via `window.cle(nomCle)` |
| `_codex_*` | Métadonnées Codex (préfixe `_` → exclues des versements) |
| `cle('nomCle')` | Helper d'appel — **toujours utiliser**, jamais concaténer manuellement |

---

## 7. Constantes de stockage

| Convention | Exemples |
|---|---|
| `CLE_*` | Clés localStorage/IDB (`CLE_BIBLIOTHEQUE_CARTOUCHES`, `CLE_BANDEAU_VU`) |
| `DOSSIER_*` | Préfixes de chemins ZIP (`DOSSIER_TRAVAUX`) |

---

## 8. À retenir pour Claude

Quand on ajoute un nouveau champ ou une nouvelle variable :

1. **Compteur** → `nb` (sauf si c'est un objectif/cible → `total`)
2. **Index de boucle** → `i`/`j`/`k`/`idx`, jamais `n` suivi d'un radical
3. **Privé module** → préfixe `_`
4. **Constante globale** → `MAJUSCULES_SNAKE_CASE`
5. **Pas d'abréviation** dans les identifiants métier (`production` pas `prod`, `evaluation` pas `eval`, `etudiant` pas `etu`)
6. **Pas de termes anglais** sauf API externe (`count` interdit en interne ; `Blob`, `Promise` OK car API natives)

---

## 9. Cas à NE PAS refactorer (rétrocompatibilité)

Ces noms violent la convention mais leur changement casserait la sérialisation ou des codex existants :

| Champ | Lieu | Raison |
|---|---|---|
| `nombreFichiersTravaux` | manifeste codex (`js/codex.js`) | Champ persisté dans les .zip de codex |
| `appareil` | manifeste codex | Conservé pour rétrocompat des codex existants (#244 a ajouté `navigateur` mais conservé `appareil`) |
| `nArtefactsPAN` | contexte PAN local | Pas en bord de système, mais à renommer en `nbArtefactsPAN` lors d'un refactor opportuniste |

**Règle générale** : tout champ qui apparaît dans un export, un manifeste, ou un format d'échange est figé. Le refactor de nommage ne va que vers le code purement interne.

---

## Références

- `noms_stables.json` — identifiants protégés (44 entrées)
- `docs/architecture/ECOSYSTEME-DONNEES.md` — Codex / Réserve / Voûte
- `.claude/skills/ecosysteme-classe/SKILL.md` — vocabulaire pédagogique exact (ELLAC, SOLO, PAN, SRPNF×IDME, cartouches)
- `CLAUDE.md` §règles de design d'interface — usage des termes pédagogiques
