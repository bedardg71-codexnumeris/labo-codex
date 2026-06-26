# Audit des call-sites — Namespacing par trimestre (Brique A)

> Créé le 24 juin 2026 (session Claude Code local). **Étape 1** du
> `plans de travail/PLAN-namespacing-par-trimestre.md` (§7.1 « Audit exhaustif des
> call-sites, lecture seule »). Lecture seule — aucun code modifié.
>
> **But** : lister TOUS les accès à `grillesTemplates`, `echellesTemplates` et
> `cartouches_<grilleId>`, et trancher cas par cas (lecture affichage/calcul →
> `cle()` ; création / bibliothèque partagée → à décider). Conditionne la Brique A.

---

## 1. Le mécanisme `cle()` existe déjà — et l'invariant H26 est garanti par le code

`cle(nomCle)` (`js/trimestres.js:266-310`) route déjà les trois familles vers des
clés namespacées **quand le trimestre actif est archivé ET que la copie existe** :

- `grillesTemplates`, `echellesTemplates` ∈ `CLES_TEMPLATES_ARCHIVES`
  (`trimestres.js:112-116`) → `a2025_grillesTemplates`, etc.
- `cartouches_<grilleId>` → cas explicite `nomCle.startsWith('cartouches_')`
  (`trimestres.js:283-289`) → `a2025_cartouches_<grilleId>`.

**Invariant de sûreté — déjà vrai dans le code** : si le trimestre actif n'est PAS
archivé (cas de **H26 actif**), la fonction tombe sur
`CLES_GLOBALES.includes(nomCle) || nomCle.startsWith('cartouches_')`
(`trimestres.js:294`) et retourne la **clé globale inchangée**. Brancher une lecture
sur `cle()` ne change donc le comportement QUE pour un trimestre archivé ayant ses
propres copies. À **re-prouver par test** avant tout commit (sentinelle), mais la
logique est en place.

**L'archivage peuple bien les copies** : `creerSnapshotRessources`
(`trimestres.js:589-621`) lit le global, **filtre les modèles utilisés** par le
trimestre, et les copie vers `${trimestreId}_grillesTemplates` /
`_echellesTemplates` / `_cartouches_<grilleId>`. Conséquence : en mode archive, la
clé namespacée contient un **sous-ensemble** (les modèles réellement employés). Pour
A25, ces copies ont été posées par le script de restauration, pas par ce chemin.

**Donc la cause racine du symptôme n'est PAS l'absence de copies, mais le fait que
les écrans lisent le global EN DIRECT** (`db.getSync('grillesTemplates', …)`), ce qui
court-circuite le routage `cle()`.

---

## 2. Diagnostic du symptôme A25 (vérifié par lecture du code)

Symptôme (SESSION.md, validé terrain) : à l'ouverture d'une éval A25, encadré
« Grille d'origine introuvable — affichage depuis les données sauvegardées » +
échelle vide ; critères et cartouche affichés par fallback.

Trois lectures globales directes l'expliquent entièrement :

| Cause | Fichier:ligne | Fonction | Effet sur A25 |
|---|---|---|---|
| Grille introuvable (fallback) | `evaluation.js:2125` | `_appliquerFallbackGrilleManquanteModif` | La grille A25 est dans `a2025_grillesTemplates` ; absente du global → `grilleExiste=false` → encadré + note sauvegardée seule |
| Grille introuvable (2ᵉ chemin) | `evaluation-chargement.js:973` | `afficherCriteresDepuisGrille` | Idem → « Grille introuvable » si grille absente du global |
| Cartouche vide | `evaluation.js:2103` | `_chargerCartoucheDropdownModif` | `cartouches_<grille>` global vide (A25 = `a2025_cartouches_<grille>`) → dropdown vide → fallback critères |
| Échelle vide | `evaluation-chargement.js:306` | `chargerEchellePerformance` | `echellesTemplates` global lu (A25 = `a2025_echellesTemplates`) → « Aucune échelle configurée » |

Brancher ces lectures (et leurs jumelles, §3) sur `cle()` résout le symptôme dès que
les copies `a2025_*` sont en place (objet du pilote §4 du plan).

---

## 3. Classification des call-sites

Volume brut : **> 550 occurrences textuelles** des trois clés dans `js/`. La grande
majorité sont (a) des **écritures** dans les trois modules propriétaires
(`grilles.js`, `echelles.js`, `cartouches.js`) — Brique B ; (b) des opérations de
**bibliothèque/partage/codex/démo** — globales ; ou (c) des **commentaires**. Le
périmètre net de la **Brique A** (lectures de consultation/calcul/affichage lisant le
global en direct) compte **une trentaine de call-sites**, listés ci-dessous.

### Catégorie 1 — Brique A : à brancher sur `cle()` (cœur du fix)

**1a — Vérifié par lecture directe du code :**

| Fichier:ligne | Fonction | Clé |
|---|---|---|
| `evaluation-chargement.js:216` | `chargerGrillesDansSelect` | grilles |
| `evaluation-chargement.js:306` | `chargerEchellePerformance` | échelles ⚠ symptôme |
| `evaluation-chargement.js:688` | `chargerGrilleSelectionnee` | cartouches |
| `evaluation-chargement.js:706` | `chargerGrilleSelectionnee` | grilles |
| `evaluation-chargement.js:781` | `cartoucheSelectionnee` | cartouches |
| `evaluation-chargement.js:786` | `cartoucheSelectionnee` | grilles |
| `evaluation-chargement.js:812` | `cartoucheSelectionnee` | échelles |
| `evaluation-chargement.js:973` | `afficherCriteresDepuisGrille` | grilles ⚠ symptôme |
| `evaluation-chargement.js:994` | `afficherCriteresDepuisGrille` | échelles |
| `evaluation.js:2077` | `_afficherCriteresDepuisEvaluation` | grilles |
| `evaluation.js:2103` | `_chargerCartoucheDropdownModif` | cartouches ⚠ symptôme |
| `evaluation.js:2125` | `_appliquerFallbackGrilleManquanteModif` | grilles ⚠ symptôme |

**1b — Vérifié via collecte de contexte (agent Explore) — calcul/affichage sur le
chemin de consultation :**

| Fichier | Lignes | Rôle |
|---|---|---|
| `evaluation-calcul.js` | 122, 233, 258, 431, 515, 540, 694 | calcul de note + couleurs de niveau |
| `evaluation-retroaction.js` | 244 (cart.), 263, 506 | rétroaction / bilan |
| `evaluation-sauvegarde.js` | 386 | grille avant recalcul à la sauvegarde |
| `liste-evaluations.js` | 865 | nom de cartouche dans la liste |
| `profil-etudiant-helpers.js` | 147, 260 | échelle / grille de référence dépistage |
| `profil-etudiant-calculs.js` | 51 | conversion IDME |
| `profil-etudiant-diagnostics.js` | 396 | barres SRPNF |
| `profil-etudiant-sections-affichage.js` | 686, 3800 (+3191/3579 via helpers) | profil / accompagnement |
| `graphiques-progression.js` | 378, 3823 | zones colorées du graphe |
| `synthese-retroaction-data.js` | 242 (+930/936 via helpers) | données PDF de synthèse |
| `tableau-bord-apercu.js` | 692, 1730 | distribution de performance |
| `accompagnement.js` | 519 (gr.), 535 (éch.), 537 (cart.) | diagnostic d'accompagnement |

**1c — Inféré du module (à confirmer ligne-à-ligne à l'implémentation) :**
`evaluation-chargement.js:1123` (cart.), `1322` (gr.) ; `evaluation.js:337`, `1732`,
`2540`.

### Catégorie 2 — Déjà namespacés (modèle à répliquer)

- `planification-carte.js:3548` (gr.), `3552` (éch.) — `db.getSync(window.cle(...))`
- `productions.js:64` (`return cle('grillesTemplates')`), `730`, `2112`
- `productions-liste.js:70` — `cle('grillesTemplates')`
- `evaluation-sauvegarde.js:175` — via helper `cle()`
- Pratiques : `pratiquesConfigurables` déjà lu via `cle()` avec fallback global
  (`evaluation-chargement.js:274`, `800`, `988` ; `evaluation.js:800`).

### Catégorie 3 — Création / édition = Brique B (db.set, propriétaires SSOT)

- `grilles.js` (~25 écritures, API SSOT `3928-3967`) — propriétaire `grillesTemplates`
- `echelles.js` (~30 écritures, API SSOT `4031-4067`) — propriétaire `echellesTemplates`
- `cartouches.js` (~25 écritures `cartouches_*`) — propriétaire des cartouches
- `wizard-pratique-v2.js:1938`, `spe-specifications.js:894-896` (set grilles)
- (Les **lectures** de ces modules pour l'écran « Matériel » → décision UX, Cat. 6.)

### Catégorie 4 — Import / partage / copie = Brique C ou global

- `import-export.js` (fusion bibliothèque, set global)
- `partage-section.js` / `-export.js` / `-import.js` / `-format.js` / `-validation.js`
  (partage inter-utilisateurs — globales)
- `productions-import-export.js:392`

### Catégorie 5 — Global légitime / hors périmètre trimestre

- `codex.js`, `codex-data.js`, `labo-codex-data.js` (format codex/recherche)
- `reserve.js`, `reserve-ouvrir.js` (Réserve = dépôt ; balaye `cartouches_*`)
- `demo-activation.js`, `demo-namespace.js`, `pack-demo-20.js` (démo)
- `cc-license.js` (licences CC — parcourt toutes grilles/cartouches)
- `consolidation.js` (lit global OU codex selon mode)
- `init-inline.js` (boot/diagnostic localStorage), `db.js:1399-1400` (registre
  propriétaires), `rapport-bug.js` (compteurs), `preferences-v2.js:49` (à confirmer),
  `accompagnement-contenu-popup.js:1579` (texte d'aide)
- `trimestres.js:549/598-599/616/1210-1211` — **le mécanisme d'archivage lui-même**
  (lit le global pour copier vers namespacé) : à **préserver tel quel**.

### Catégorie 6 — À DÉCIDER (UX, §8 du plan) ⚠

Vues qui **listent / comptent la bibliothèque** de modèles : doivent-elles suivre le
trimestre actif, ou rester une bibliothèque globale (la bibliothèque = source qu'on
gère, partagée) ?

- Écran « Matériel » : `donnees-v2.js:363/525/698/745` (tableaux), `161/163/1198`
  (compteurs)
- `statistiques.js:142/146/153` (compteurs « X grilles / Y échelles / Z cartouches »)
- `pratiques-gestion.js:1412/1508` (tour guidé « première grille ? »)
- `pratiques.js:508` (select grilles dans le formulaire de pratique)

Le principe directeur (« chaque trimestre porte ses modèles ») pousse vers namespacé ;
mais l'écran Matériel sert aussi à **créer/gérer** la bibliothèque. À trancher **avant
la Brique B**, pas pour la Brique A.

---

## 4. Recommandations de mise en œuvre (Brique A)

1. **Périmètre minimal qui résout le symptôme A25** : les 4 call-sites ⚠ du §2.
   Périmètre complet cohérent : toute la Catégorie 1 (≈ 30 sites).
2. **Méthode** : remplacer `'grillesTemplates'` → `cle('grillesTemplates')`,
   `'echellesTemplates'` → `cle('echellesTemplates')`,
   `` `cartouches_${id}` `` → `cle(`cartouches_${id}`)`. (`cle()` gère déjà le
   fallback global → H26 inchangé.)
3. **Tests obligatoires (règle projet)** :
   - 1 Vitest : `cle()` rend `a2025_*` en mode archive avec copie, et la **clé
     globale** si trimestre actif non archivé (invariant H26).
   - 1 Playwright : ouverture d'une éval A25 → plus d'encadré « grille introuvable »,
     échelle résolue ; ouverture d'une éval H26 → **aucun changement**.
   - **Break-test** : faire ROUGIR la sentinelle avant de lui faire confiance.
   - Oracle L0 (`valider-golden-master-trimestre.mjs`) reste VERT : aucune note ne bouge.
4. **Ne pas toucher** : Catégorie 5 (mécanisme d'archivage, codex, réserve, démo,
   partage, licences).

## 5. Risque principal et angle mort

- **Risque** : casser H26 (actif) en touchant la résolution. **Mitigation** : invariant
  prouvé par test AVANT déploiement (§3.1).
- **Angle mort à lever à l'implémentation** : les sites 1c (inférés du module) et la
  distinction, dans `evaluation-calcul.js`, entre lecture **pour recalcul à la volée**
  (doit suivre le trimestre) et notes **déjà sauvegardées** (intactes). À vérifier
  ligne-à-ligne avant d'éditer chaque site.

---

## 6. Comptes

- Occurrences textuelles des 3 clés dans `js/` : **> 550** (commentaires inclus).
- Périmètre net **Brique A** (Cat. 1) : **≈ 30 call-sites** sur ~12 fichiers de
  consultation/calcul/affichage.
- Déjà namespacés (Cat. 2) : **8** (modèle à suivre).
- Création/édition (Cat. 3, Brique B) : **3 modules propriétaires** + 3 sites épars.
- À décider UX (Cat. 6) : **≈ 9 sites** sur 4 fichiers.
