# Plan de réorganisation : Documentation et architecture projet

**Version** : Beta 95.5 (post-pack démo)  
**Date de création** : 31 décembre 2025  
**Auteur** : Grégoire Bédard + Claude (Anthropic)  
**Statut** : 📋 Prêt à exécuter (APRÈS stabilisation pack démo)

---

## Contexte et motivation

### Problème actuel

**CLAUDE.md à 100K** :
- Trop dense pour être utile (25,000 tokens)
- Tout au même niveau d'importance
- Impossible à maintenir
- Réduit capacité de travail de ~40%

**Répertoire surchargé** :
- Fichiers obsolètes (Beta 70-94)
- Scripts orphelins
- Backups multiples
- Bruit cognitif important

**Architecture dans la tête de Grégoire** :
- Non externalisée
- Non transférable
- Rend collaboration impossible
- Crée dépendance critique sur une seule personne

### Cycle épuisant actuel

```
Session démarre avec plan clair
    ↓
Bug survient (ex: namespacing incomplet)
    ↓
Debug consomme tout le contexte (Claude Code + Grégoire)
    ↓
Plan de travail oublié par Claude Code
    ↓
Grégoire surveille constamment pour compenser
    ↓
Session s'étire (3-4h+), impossible d'arrêter
    ↓
Si arrêt → Grégoire oublie aussi où on était
    ↓
Épuisement cognitif
```

### Objectifs de la réorganisation

1. **Réduire charge cognitive** : Documentation ciblée par contexte
2. **Permettre interruption** : Traces de session pour reprendre facilement
3. **Externaliser l'architecture** : Rendre le projet compréhensible sans Grégoire
4. **Faciliter collaboration** : Points d'entrée clairs pour futurs contributeurs
5. **Nettoyer le bruit** : Archiver l'obsolète, garder l'essentiel visible

---

## Phase 0 : Backup et préparation

### ⚠️ OBLIGATOIRE - Ne jamais sauter

**Checklist de sécurité** :

```bash
[ ] 1. Export complet via application
       Réglages → Import/Export → Exporter tout
       Sauvegarder : backup-pre-reorganisation-YYYY-MM-DD.json

[ ] 2. Commit Git avec tag
       git add .
       git commit -m "Beta 95 - État stable avant réorganisation docs"
       git tag v0.95.0-pre-reorganisation
       git push origin main --tags

[ ] 3. Vérifier que pack démo fonctionne
       - Import/export OK
       - Groupe 9999 affiche correctement
       - Aucun bug de namespacing

[ ] 4. Copier CLAUDE.md dans archive
       mkdir -p archive/documentation
       cp CLAUDE.md archive/documentation/CLAUDE-md-original-2025-12-31.md
```

---

## Phase 1 : Nouvelle structure documentaire

### Étape 1.1 : Créer l'arborescence

**CONTEXTE** : Remplacer CLAUDE.md monolithique par structure modulaire  
**OBJECTIF** : Documentation ciblée par domaine et contexte  
**ZONES AUTORISÉES** : Création nouveaux répertoires et fichiers  

**Commandes** :

```bash
# Créer structure de base
mkdir -p docs/modules
mkdir -p docs/decisions
mkdir -p docs/legacy
mkdir -p docs/operations
mkdir -p docs/archive

# Créer structure d'archivage
mkdir -p archive/beta-70-79
mkdir -p archive/beta-80-89
mkdir -p archive/beta-90-94
mkdir -p archive/scripts-obsoletes
mkdir -p archive/documentation
```

**Résultat attendu** :

```
projet/
├── docs/                         # 🆕 NOUVELLE documentation
│   ├── 00-START-HERE.md
│   ├── 01-MEMORY-PINS.md
│   ├── 02-ARCHITECTURE-OVERVIEW.md
│   ├── modules/
│   ├── decisions/
│   ├── legacy/
│   └── operations/
│
├── archive/                      # 🆕 Fichiers historiques
│   ├── beta-70-79/
│   ├── beta-80-89/
│   ├── beta-90-94/
│   ├── scripts-obsoletes/
│   └── documentation/
│
├── SESSION.md                    # 🆕 Session active
├── index.html                    # Actif Beta 95
├── js/
├── css/
└── [fichiers essentiels seulement]
```

**ATTENDU** : Structure claire avec séparation actif/archive

### Étape 1.2 : Créer SESSION.md (fichier de session active)

**CONTEXTE** : Capturer l'état de chaque session de travail  
**OBJECTIF** : Permettre interruption et reprise sans perte de contexte  
**ZONES AUTORISÉES** : Racine du projet  

**Contenu de SESSION.md** :

```markdown
# SESSION ACTIVE

**Date** : [À REMPLIR]
**Début** : [HH:MM]
**Objectif initial** : [Décrire l'objectif principal de la session]

---

## ÉTAT MENTAL

**Où j'en suis** : 
[Décrire brièvement l'avancement actuel]

**Prochain pas prévu** :
1. [Action 1]
2. [Action 2]
3. [Action 3]

---

## DÉVIATIONS (bugs rencontrés)

### Bug #1 : [Titre court] (HH:MM)
- **Symptôme** : [Ce qui est observé]
- **Cause** : [Cause identifiée après investigation]
- **Fix** : [Solution appliquée]
- **Fichiers touchés** : [Liste des fichiers]
- **Statut** : ✅ Résolu / ⏳ En cours / ❌ Bloqué
- **Retour au plan** : [HH:MM]

### Bug #2 : [si autre bug survient]
[Répéter le format ci-dessus]

---

## OÙ REPRENDRE (si session s'arrête maintenant)

**État actuel** :
- ✅ [Tâche complétée 1]
- ✅ [Tâche complétée 2]
- ⏳ [Tâche en cours]
- ❌ [Tâche non démarrée]

**Action immédiate au retour** :
[Décrire la PREMIÈRE action à faire en reprenant]

**Fichiers modifiés cette session** :
- [fichier1] (description changement)
- [fichier2] (description changement)

---

## NOTES POUR CLAUDE CODE

**Contexte actuel** :
[Expliquer à Claude Code sur quoi on travaille]

**Rappels critiques** :
- [Point important 1]
- [Point important 2]

**Si bug survient** :
1. Noter symptôme dans "DÉVIATIONS"
2. Investiguer
3. Noter cause + fix
4. Retourner au plan initial

---

**Dernière mise à jour** : [HH:MM]
```

**ATTENDU** : Template prêt à utiliser pour chaque session

### Étape 1.3 : Créer 01-MEMORY-PINS.md (Décisions immuables)

**CONTEXTE** : Extraire les décisions critiques de CLAUDE.md  
**OBJECTIF** : Document court (5K max) avec règles absolues  
**ZONES AUTORISÉES** : docs/01-MEMORY-PINS.md  

**Contenu** :

```markdown
# MEMORY PINS - Décisions critiques immuables

**Dernière mise à jour** : 31 décembre 2025  
**Taille maximale** : 5K (1,250 tokens)

⚠️ Ces règles sont ABSOLUES. Elles ne changent JAMAIS sans discussion explicite avec Grégoire.

---

## 1. Single Source of Truth

Chaque donnée a UNE source qui génère.  
Tous les autres modules LISENT, ne calculent JAMAIS.

**Exemple** :
- `trimestre.js` GÉNÈRE → `calendrierComplet`
- `calendrier-vue.js` LIT → `calendrierComplet`
- ❌ JAMAIS recalculer le calendrier ailleurs

**Pourquoi** : Cohérence pédagogique. Un étudiant ne peut pas avoir deux moyennes différentes.

---

## 2. Données A2025 sont LEGACY

**FAIT HISTORIQUE** :
- Construites sur 15 semaines AVANT introduction du namespacing
- Migration incomplète : certaines clés namespacées, d'autres non
- État hybride persistant (identifié décembre 2025)

**RÈGLE** :
Avant de toucher une clé calendrier/trimestre, VÉRIFIER existence sous les deux formes :

```javascript
const namespacee = localStorage.getItem('a2025_calendrierComplet');
const legacy = localStorage.getItem('calendrierComplet');

if (namespacee && legacy) {
    console.error('🔴 DOUBLON détecté');
    // → Alerter Grégoire immédiatement
}
```

**Documentation détaillée** : `docs/legacy/A2025-migration-incomplete.md`

---

## 3. Namespacing obligatoire (post-Beta 95)

**Format** : `{trimestreId}_{cleOriginal}`

**TOUJOURS utiliser le helper** :

```javascript
// ✅ BON
const calendrier = db.getSync(cle('calendrierComplet'), {});

// ❌ MAUVAIS
const calendrier = db.getSync('calendrierComplet', {});
```

**Exception** : Clés globales (voir `docs/modules/trimestres.md`)

**Pourquoi** : Séparation des contextes. A2025 et H2026 ne doivent JAMAIS se mélanger.

---

## 4. portfolio.js → indices-cp.js (Beta 95.1)

**FAIT** : Module universel pour calcul C et P (TOUTES pratiques)  
**Ancien nom** : portfolio.js (source de confusion)  
**Nouveau nom** : indices-cp.js (clarification architecturale)

**Si tu vois "portfolio" dans le code** → Signaler, probablement legacy à mettre à jour

**Pourquoi** : "Portfolio" suggère une pratique spécifique, mais le module est universel.

---

## 5. Pratiques de notation - Interface obligatoire

Toute nouvelle pratique DOIT implémenter `IPratique`.  
JAMAIS coder en dur des calculs spécifiques dans indices-cp.js.

**Délégation obligatoire** :

```javascript
const pratique = obtenirPratiqueParId(pratiqueActive);
const performance = pratique.calculerPerformance(da);
```

**Pourquoi** : Respect des pratiques pédagogiques. Chaque enseignant a sa méthode.

---

## 6. coursId obligatoire (post-Beta 93.5)

Toutes les entités liées à un cours DOIVENT avoir `coursId` :
- Étudiants
- Productions  
- Évaluations
- Présences

**Filtrage automatique** : `modes.js` filtre automatiquement par coursId

**Pourquoi** : Isolation des données entre cours. Un étudiant de 601-101 ne doit pas apparaître dans 601-102.

---

## 7. Modules protégés

❌ NE JAMAIS MODIFIER sans Grégoire :
- `config.js` (navigation globale)
- `navigation.js` (logique de navigation)
- `noms_stables.json` (IDs/classes protégés)

**Pourquoi** : Colonne vertébrale de l'application. Une erreur casse tout.

---

## 8. Testing obligatoire post-modification

Après TOUTE modification de calcul :

1. Comparer indices A-C-P avec valeurs de référence
2. Valider 3 étudiants minimum
3. Tester les 3 pratiques (PAN-Maîtrise, Sommative, Standards)

**Pourquoi** : Les calculs pédagogiques sont critiques. Une erreur = notes incorrectes.

---

## 9. Backup avant migration

TOUTE migration de données DOIT commencer par :

```bash
1. Export complet (Réglages → Import/Export)
2. git commit + tag
3. Validation des valeurs de référence
```

**Pourquoi** : Données étudiantes réelles non-reproductibles. Perte = irrémédiable.

---

## 10. Communication transparente

Si incertain :
- ✅ Poser la question à Grégoire
- ✅ Documenter l'incertitude
- ❌ Supposer et continuer

**Pourquoi** : Les LLMs confabulent. Grégoire a la mémoire contextuelle.
```

**ATTENDU** : Document de 5K capturant l'essentiel des décisions

### Étape 1.4 : Créer 00-START-HERE.md (Point d'entrée)

**CONTEXTE** : Remplacer CLAUDE.md comme point d'entrée  
**OBJECTIF** : Orienter rapidement vers la bonne documentation  
**ZONES AUTORISÉES** : docs/00-START-HERE.md  

**Contenu** :

```markdown
# 🚀 START HERE - Codex Numeris

**Tu es Claude Code ou un nouveau contributeur ? Lis ceci EN PREMIER.**

---

## Lecture obligatoire (5 min)

1. **01-MEMORY-PINS.md** (2 min) - Décisions critiques à ne JAMAIS oublier
2. **02-ARCHITECTURE-OVERVIEW.md** (3 min) - Structure globale du système

---

## Identifier ton contexte de travail

Avant de commencer, identifie ce sur quoi tu travailles :

### 📅 Je travaille sur le CALENDRIER/TRIMESTRE
→ Lis : `modules/trimestres.md`  
→ ⚠️ ALERTE : `legacy/A2025-migration-incomplete.md`

### 📊 Je travaille sur les INDICES (A-C-P)
→ Lis : `modules/indices-cp.md`  
→ Note : Ancien nom = portfolio.js (source de confusion)

### 🎯 Je travaille sur les PRATIQUES DE NOTATION
→ Lis : `modules/pratiques.md`  
→ Référence : `decisions/2025-11-systeme-pratiques.md`

### 🔧 Je fais une MIGRATION ou REFACTORING
→ Lis : `operations/migration-checklist.md`  
→ Exécute : `operations/validation-architecture.js`

### 👥 Je travaille sur ÉTUDIANTS/GROUPES
→ Lis : `modules/etudiants-groupes.md`

### 📝 Je travaille sur ÉVALUATIONS/PRODUCTIONS
→ Lis : `modules/evaluations-productions.md`

---

## État actuel du projet

**Version** : Beta 95 (stabilisation H2026)  
**Objectif** : Tests réseau janvier-mai 2026  
**Priorité** : **Stabilité > Nouvelles fonctionnalités**

**Dernière session** : Voir `../SESSION.md` (racine du projet)

---

## Checkpoints obligatoires

🛑 ARRÊTE et demande validation à Grégoire AVANT de :

- Supprimer ou renommer une clé localStorage
- Modifier une structure de données existante
- Exécuter une migration de données
- Modifier plus de 3 fichiers simultanément
- Toucher aux modules protégés (config.js, navigation.js)

---

## Protocole en cas de bug

```
Bug survient
    ↓
1. Noter dans SESSION.md (section DÉVIATIONS)
2. Investiguer la cause
3. Appliquer le fix
4. Compléter l'entrée dans SESSION.md
5. Retourner au plan initial
```

**Ne JAMAIS laisser un bug consommer tout le contexte** et faire oublier le plan de travail.

---

## Hiérarchie de vérité

En cas de conflit d'information entre documents :

1. **SESSION.md** (état actuel de la session en cours)
2. **MEMORY-PINS.md** (décisions immuables)
3. **legacy/*.md** (problèmes connus spécifiques)
4. **modules/*.md** (documentation technique)
5. **ARCHITECTURE-OVERVIEW.md** (vision globale)

**Grégoire a toujours raison sur** :
- L'architecture pédagogique
- Les décisions historiques
- L'état réel des données (A2025, H2026, etc.)

---

## En cas de doute

**Pose la question plutôt que de supposer.**

Les LLMs ont tendance à confabuler (inventer des souvenirs plausibles).  
Grégoire a la mémoire contextuelle réelle du projet.

---

**Dernière mise à jour** : 31 décembre 2025
```

**ATTENDU** : Point d'entrée clair qui oriente rapidement

### Étape 1.5 : Créer 02-ARCHITECTURE-OVERVIEW.md

**CONTEXTE** : Externaliser l'architecture mentale de Grégoire  
**OBJECTIF** : Rendre le projet compréhensible sans Grégoire  
**ZONES AUTORISÉES** : docs/02-ARCHITECTURE-OVERVIEW.md  

**Contenu** :

```markdown
# Architecture mentale de Codex Numeris

**Version** : 2.0 (post-réorganisation)  
**Date** : 31 décembre 2025  
**Auteur** : Grégoire Bédard

---

## Vision philosophique

Codex Numeris est un **système de monitorage pédagogique** qui permet de :
1. Détecter précocement les étudiants à risque
2. Intervenir de façon ciblée selon le modèle RàI
3. Suivre l'efficacité des interventions
4. S'adapter à différentes pratiques pédagogiques

**Ce n'est PAS un système de notation traditionnel.**  
C'est un système de **détection et d'intervention préventive**.

---

## Hiérarchie conceptuelle (pas technique)

```
TRIMESTRE (conteneur temporel)
    ↓
COURS (conteneur pédagogique)
    ↓
GROUPE (cohorte d'étudiants)
    ↓
ÉTUDIANTS + PRODUCTIONS + ÉVALUATIONS
```

Cette hiérarchie est **SACRÉE**. Tout le reste découle de ça.

**Exemples concrets** :
- Trimestre : A2025, H2026
- Cours : 601-101, 601-102, 601-103
- Groupe : 01, 02, 9999 (démo)
- Étudiants : 30 étudiants dans le groupe 01

---

## Flux de données (vision 10,000 pieds)

```
1. ENTRÉE
   Prof configure : trimestre + cours + groupe
   Prof crée : productions (artefacts, évaluations)
   
2. SUIVI QUOTIDIEN
   Prof saisit : présences (indices A)
   Prof évalue : productions (notes IDME)
   
3. CALCUL AUTOMATIQUE
   Système génère : indices C (complétion) et P (performance)
   Système combine : A-C-P → Engagement
   
4. DIAGNOSTIC
   Système détecte : patterns de risque
   Système recommande : interventions RàI (niveaux 1-2-3)
   
5. INTERVENTION
   Prof consulte : diagnostics + recommandations
   Prof agit : selon niveau RàI identifié
   Prof note : résultats des interventions
```

---

## Principes architecturaux fondamentaux

### 1. Single Source of Truth

**Règle** : Chaque donnée a UNE source qui la génère et la stocke.  
**Conséquence** : Tous les autres modules LISENT, ne recalculent JAMAIS.

**Pourquoi** : Cohérence pédagogique absolue. Un étudiant ne peut pas avoir deux moyennes différentes selon où on regarde.

**Exemple** :
- `trimestre.js` GÉNÈRE → `calendrierComplet`
- `calendrier-vue.js` LIT → `calendrierComplet`
- Si `calendrier-vue.js` recalculait → risque d'incohérence

### 2. Séparation par contexte (namespacing)

**Règle** : Les données de chaque trimestre sont isolées.  
**Format** : `{trimestreId}_{cleOriginal}`

**Pourquoi** : Un prof peut enseigner plusieurs trimestres. Les données ne doivent JAMAIS se mélanger.

**Exemple** :
- A2025 : `a2025_calendrierComplet`
- H2026 : `h2026_calendrierComplet`
- Jamais de confusion entre les deux

### 3. Délégation aux pratiques

**Règle** : Le calcul des indices P dépend de la pratique de notation configurée.  
**Mécanisme** : Interface `IPratique` que chaque pratique implémente.

**Pourquoi** : Respect des pratiques pédagogiques. Chaque enseignant a sa méthode.

**Pratiques supportées** :
- PAN-Maîtrise (IDME + SRPNF) - Grégoire
- Sommative traditionnelle
- PAN-Standards (par objectifs ou artefacts)

### 4. Modules protégés

**Règle** : Certains modules sont la colonne vertébrale et ne peuvent être modifiés sans risque majeur.

**Liste** :
- `config.js` : Configuration globale navigation
- `navigation.js` : Logique de navigation
- `noms_stables.json` : IDs/classes CSS protégés

**Pourquoi** : Une erreur ici casse l'application entière.

---

## Décisions philosophiques fondamentales

### Pourquoi "Single Source of Truth" ?

**Question** : Pourquoi ne pas permettre à chaque module de calculer ce dont il a besoin ?

**Réponse** : Parce qu'un étudiant ne peut pas avoir deux moyennes différentes selon où tu regardes. C'est une question de **cohérence pédagogique**, pas technique.

Si `profil-etudiant.js` calcule une moyenne de 75% et `tableau-bord.js` calcule 76%, lequel est le vrai ? C'est inacceptable pédagogiquement.

### Pourquoi le namespacing ?

**Question** : Pourquoi ne pas simplement écraser les anciennes données ?

**Réponse** : Parce qu'un prof peut enseigner A2025 puis H2026. Les données ne doivent JAMAIS se mélanger. C'est une question de **séparation des contextes**.

Un étudiant de A2025 ne doit jamais apparaître dans les listes de H2026 par accident.

### Pourquoi les pratiques modulaires ?

**Question** : Pourquoi ne pas coder en dur PAN-Maîtrise puisque c'est ta pratique ?

**Réponse** : Parce que chaque prof a sa pédagogie. L'application doit s'adapter, pas l'inverse. C'est une question de **respect des pratiques**.

Si l'application impose PAN-Maîtrise, elle ne sert qu'à Grégoire. Si elle s'adapte, elle sert à tout le réseau collégial.

---

## Ce qui peut changer vs ce qui est immuable

### IMMUABLE (architecture fondamentale)

Ces éléments ne peuvent PAS changer sans réécrire l'application :

- Hiérarchie Trimestre → Cours → Groupe → Étudiants
- Single Source of Truth
- Séparation par coursId
- Interface IPratique pour les pratiques
- Indices A-C-P comme base du diagnostic

### FLEXIBLE (implémentation)

Ces éléments peuvent évoluer sans casser l'architecture :

- Comment on calcule les indices (délégué aux pratiques)
- Comment on affiche l'information (UI)
- Où on stocke les données (localStorage → IndexedDB → ?)
- Quelles pratiques de notation on supporte
- Format d'import/export

---

## Pour futurs contributeurs

### Ce que tu peux faire

- Ajouter une nouvelle pratique de notation (implémenter IPratique)
- Améliorer l'interface utilisateur
- Optimiser les calculs
- Ajouter des graphiques/visualisations
- Améliorer l'export de données
- Traduire l'interface

### Ce que tu ne peux PAS faire

- Casser le Single Source of Truth
- Mélanger les données de différents trimestres
- Coder en dur des calculs de pratiques dans indices-cp.js
- Modifier les modules protégés sans discussion
- Changer la hiérarchie Trimestre → Cours → Groupe

---

## Architecture technique (pour développeurs)

### Stockage des données

**Système hybride** (Beta 91.1+) :
- `IndexedDB` : Stockage persistant asynchrone (plusieurs GB)
- `localStorage` : Cache synchrone pour performance (accès 0ms)
- `db.js` : API unifiée qui orchestre les deux

### Communication entre modules

**Règle** : Les modules ne se parlent JAMAIS directement.  
**Mécanisme** : Communication via localStorage uniquement.

```
trimestre.js (SOURCE)
    ↓ stocke dans
localStorage.calendrierComplet
    ↓ lu par
calendrier-vue.js (LECTEUR)
```

### Système de pratiques

**Architecture** :
```
indices-cp.js (orchestrateur)
    ↓ appelle
pratique-registre.js
    ↓ retourne instance
pratique-pan-maitrise.js | pratique-sommative.js | ...
    ↓ calcule
indices C et P spécifiques à la pratique
```

---

## Histoire du projet (contexte pour comprendre l'état actuel)

### Août-novembre 2025 : Développement initial
- Tableur Numbers → Application web
- Développement avec Claude Sonnet 4.5 (plan Max 5x)
- Architecture initiale sans namespacing

### Novembre 2025 : Pivot architectural
- Passage à Claude Code (Max 20x)
- Introduction du système de pratiques modulaires
- Introduction du namespacing (Beta 95)

### Décembre 2025 : Stabilisation
- Données A2025 = legacy pré-namespacing (15 semaines)
- Migration partielle vers namespacing
- État hybride persistant (identifié 31 déc 2025)

### Janvier 2026 (prévu) : Tests réseau
- Stabilisation complète
- Migration A2025 finalisée
- Tests avec collègues du réseau

### Juin 2026 (objectif) : Présentation AQPC
- Version 1.0 stable
- Open-source (licence AGPL v3)

---

**Cette architecture est le fruit de 5 mois d'expérimentation et de 95 versions beta.**  
**Elle reflète des choix pédagogiques autant que techniques.**  
**Respecte-la, et le projet restera cohérent.**
```

**ATTENDU** : Vision complète externalisée de l'architecture

---

## Phase 2 : Nettoyage du répertoire

### Étape 2.1 : Identifier les fichiers obsolètes

**CONTEXTE** : Répertoire surchargé avec fichiers Beta 70-94  
**OBJECTIF** : Identifier ce qui doit être archivé  
**ZONES AUTORISÉES** : Analyse seulement, pas de suppression  

**Script de détection** :

```bash
# Créer script d'analyse
cat > analyse-fichiers-obsoletes.sh << 'EOF'
#!/bin/bash

echo "=== ANALYSE DES FICHIERS OBSOLÈTES ==="
echo ""

echo "📁 Fichiers HTML (versions Beta):"
ls -lh index*.html | grep -v "index.html$"

echo ""
echo "📁 Fichiers JavaScript potentiellement obsolètes:"
find js/ -name "*old*" -o -name "*backup*" -o -name "*test*" -o -name "*-v[0-9]*"

echo ""
echo "📁 Fichiers JSON de backup:"
find . -maxdepth 1 -name "*backup*.json" -o -name "*old*.json"

echo ""
echo "📁 Documentation legacy:"
find . -maxdepth 1 -name "*.md" | grep -v "README" | grep -v "CLAUDE"

echo ""
echo "=== FIN DE L'ANALYSE ==="
EOF

chmod +x analyse-fichiers-obsoletes.sh
./analyse-fichiers-obsoletes.sh
```

**ATTENDU** : Liste complète des fichiers à archiver

### Étape 2.2 : Archiver les versions Beta anciennes

**CONTEXTE** : Garder historique mais libérer le répertoire principal  
**OBJECTIF** : Déplacer Beta 70-94 vers archive/  
**ZONES AUTORISÉES** : Déplacement fichiers (pas de suppression)  

**Commandes** :

```bash
# Archiver versions Beta 70-79
mv index\ 7*.html archive/beta-70-79/ 2>/dev/null

# Archiver versions Beta 80-89
mv index\ 8*.html archive/beta-80-89/ 2>/dev/null

# Archiver versions Beta 90-94
mv index\ 9[0-4]*.html archive/beta-90-94/ 2>/dev/null

# Vérifier ce qui reste
ls -lh index*.html
```

**ATTENDU** : Seulement `index.html` (Beta 95) à la racine

### Étape 2.3 : Archiver scripts obsolètes

**CONTEXTE** : Scripts de test et backup orphelins  
**OBJECTIF** : Nettoyer sans perdre l'historique  
**ZONES AUTORISÉES** : Déplacement scripts  

**Identification manuelle requise** :

```bash
# Lister tous les scripts à la racine
ls -lh *.js *.sh 2>/dev/null

# Pour chaque script, décider :
# - Actif (garder à la racine)
# - Obsolète (archiver)
# - À supprimer (très rare)

# Exemple d'archivage :
# mv ancien-script.js archive/scripts-obsoletes/
```

**ATTENDU** : Racine épurée, scripts actifs seulement

### Étape 2.4 : Archiver CLAUDE.md original

**CONTEXTE** : CLAUDE.md devient obsolète avec nouvelle structure  
**OBJECTIF** : Conserver pour référence historique  
**ZONES AUTORISÉES** : Copie vers archive/  

**Commandes** :

```bash
# Copier (pas déplacer) vers archive
cp CLAUDE.md archive/documentation/CLAUDE-md-original-2025-12-31.md

# Ajouter note en tête du CLAUDE.md original
cat > CLAUDE-DEPRECATION-NOTE.txt << 'EOF'
⚠️ CE FICHIER EST OBSOLÈTE (31 décembre 2025)

CLAUDE.md a été remplacé par une structure documentaire modulaire.

Nouveau point d'entrée : docs/00-START-HERE.md

Cette copie est conservée pour référence historique uniquement.
EOF

# Garder CLAUDE.md à la racine temporairement avec note
```

**ATTENDU** : CLAUDE.md archivé, note de dépréciation ajoutée

---

## Phase 3 : Outils opérationnels

### Étape 3.1 : Créer script de validation architecture

**CONTEXTE** : Détecter incohérences de namespacing  
**OBJECTIF** : Outil de diagnostic avant chaque session  
**ZONES AUTORISÉES** : docs/operations/validation-architecture.js  

**Contenu** :

```javascript
/**
 * SCRIPT : Validation de l'architecture
 * VERSION : 1.0
 * DATE : 31 décembre 2025
 * 
 * OBJECTIF : Détecter incohérences dans le namespacing et la structure des données
 * 
 * USAGE :
 * - Ouvrir l'application dans le navigateur
 * - Ouvrir la console développeur
 * - Copier-coller ce script
 * - Exécuter : validerArchitecture()
 */

function validerArchitecture() {
    console.log('🔍 VALIDATION DE L\'ARCHITECTURE');
    console.log('================================\n');
    
    const rapport = {
        trimestres: validerTrimestres(),
        namespacing: validerNamespacing(),
        coursId: validerCoursId(),
        pratiques: validerPratiques()
    };
    
    afficherRapport(rapport);
    return rapport;
}

function validerTrimestres() {
    console.log('📅 Validation des trimestres...');
    const trimestres = JSON.parse(localStorage.getItem('trimestres') || '[]');
    const actif = trimestres.find(t => t.actif);
    
    return {
        nbTrimestres: trimestres.length,
        actif: actif ? actif.id : 'AUCUN',
        liste: trimestres.map(t => `${t.id} (${t.actif ? 'ACTIF' : 'inactif'})`),
        ok: trimestres.length > 0 && actif !== undefined
    };
}

function validerNamespacing() {
    console.log('🏷️  Validation du namespacing...');
    
    const trimestres = JSON.parse(localStorage.getItem('trimestres') || '[]');
    const actif = trimestres.find(t => t.actif);
    
    if (!actif) {
        return { ok: false, erreur: 'Aucun trimestre actif' };
    }
    
    const clesCritiques = [
        'calendrierComplet',
        'cadreCalendrier',
        'evenementsPrevus',
        'evenementsImprevus',
        'seancesCompletes',
        'horaireHebdo'
    ];
    
    const resultats = {
        namespacees: [],
        nonNamespacees: [],
        doublons: []
    };
    
    clesCritiques.forEach(cle => {
        const cleNamespacee = `${actif.id}_${cle}`;
        const existeNamespacee = localStorage.getItem(cleNamespacee) !== null;
        const existeLegacy = localStorage.getItem(cle) !== null;
        
        if (existeNamespacee && existeLegacy) {
            resultats.doublons.push(cle);
        } else if (existeNamespacee) {
            resultats.namespacees.push(cle);
        } else if (existeLegacy) {
            resultats.nonNamespacees.push(cle);
        }
    });
    
    return {
        ...resultats,
        ok: resultats.doublons.length === 0,
        pourcentageNamespace: Math.round((resultats.namespacees.length / clesCritiques.length) * 100)
    };
}

function validerCoursId() {
    console.log('📚 Validation des coursId...');
    
    const etudiants = JSON.parse(localStorage.getItem('groupeEtudiants') || '[]');
    const productions = JSON.parse(localStorage.getItem('productions') || '[]');
    const presences = JSON.parse(localStorage.getItem('presences') || '[]');
    
    const etudiantsSansCoursId = etudiants.filter(e => !e.coursId).length;
    const productionsSansCoursId = productions.filter(p => !p.coursId).length;
    const presencesSansCoursId = presences.filter(p => !p.coursId).length;
    
    return {
        etudiants: {
            total: etudiants.length,
            sansCoursId: etudiantsSansCoursId,
            pourcentage: etudiants.length > 0 ? Math.round((1 - etudiantsSansCoursId / etudiants.length) * 100) : 0
        },
        productions: {
            total: productions.length,
            sansCoursId: productionsSansCoursId,
            pourcentage: productions.length > 0 ? Math.round((1 - productionsSansCoursId / productions.length) * 100) : 0
        },
        presences: {
            total: presences.length,
            sansCoursId: presencesSansCoursId,
            pourcentage: presences.length > 0 ? Math.round((1 - presencesSansCoursId / presences.length) * 100) : 0
        },
        ok: etudiantsSansCoursId === 0 && productionsSansCoursId === 0 && presencesSansCoursId === 0
    };
}

function validerPratiques() {
    console.log('🎯 Validation des pratiques...');
    
    const modalites = JSON.parse(localStorage.getItem('modalitesEvaluation') || '{}');
    const pratiqueActive = modalites.pratique;
    
    return {
        configuree: pratiqueActive !== undefined,
        pratique: pratiqueActive || 'AUCUNE',
        ok: pratiqueActive !== undefined
    };
}

function afficherRapport(rapport) {
    console.log('\n📊 RAPPORT DE VALIDATION');
    console.log('========================\n');
    
    // Trimestres
    console.log('📅 TRIMESTRES:');
    console.log(`   Nombre: ${rapport.trimestres.nbTrimestres}`);
    console.log(`   Actif: ${rapport.trimestres.actif}`);
    console.log(`   Statut: ${rapport.trimestres.ok ? '✅ OK' : '❌ PROBLÈME'}\n`);
    
    // Namespacing
    console.log('🏷️  NAMESPACING:');
    console.log(`   Namespacées: ${rapport.namespacing.namespacees.length}/6 (${rapport.namespacing.pourcentageNamespace}%)`);
    console.log(`   Non-namespacées: ${rapport.namespacing.nonNamespacees.length}`);
    console.log(`   Doublons: ${rapport.namespacing.doublons.length}`);
    
    if (rapport.namespacing.doublons.length > 0) {
        console.warn(`   ⚠️  DOUBLONS DÉTECTÉS: ${rapport.namespacing.doublons.join(', ')}`);
    }
    if (rapport.namespacing.nonNamespacees.length > 0) {
        console.warn(`   ⚠️  NON-NAMESPACÉES: ${rapport.namespacing.nonNamespacees.join(', ')}`);
    }
    console.log(`   Statut: ${rapport.namespacing.ok ? '✅ OK' : '❌ PROBLÈME'}\n`);
    
    // CoursId
    console.log('📚 COURSID:');
    console.log(`   Étudiants: ${rapport.coursId.etudiants.pourcentage}% (${rapport.coursId.etudiants.total - rapport.coursId.etudiants.sansCoursId}/${rapport.coursId.etudiants.total})`);
    console.log(`   Productions: ${rapport.coursId.productions.pourcentage}% (${rapport.coursId.productions.total - rapport.coursId.productions.sansCoursId}/${rapport.coursId.productions.total})`);
    console.log(`   Présences: ${rapport.coursId.presences.pourcentage}% (${rapport.coursId.presences.total - rapport.coursId.presences.sansCoursId}/${rapport.coursId.presences.total})`);
    console.log(`   Statut: ${rapport.coursId.ok ? '✅ OK' : '❌ PROBLÈME'}\n`);
    
    // Pratiques
    console.log('🎯 PRATIQUES:');
    console.log(`   Configurée: ${rapport.pratiques.configuree ? 'Oui' : 'Non'}`);
    console.log(`   Pratique active: ${rapport.pratiques.pratique}`);
    console.log(`   Statut: ${rapport.pratiques.ok ? '✅ OK' : '❌ PROBLÈME'}\n`);
    
    // Résumé global
    const toutOk = rapport.trimestres.ok && rapport.namespacing.ok && rapport.coursId.ok && rapport.pratiques.ok;
    console.log('========================');
    console.log(`STATUT GLOBAL: ${toutOk ? '✅ AUCUN PROBLÈME DÉTECTÉ' : '❌ PROBLÈMES DÉTECTÉS'}`);
    console.log('========================\n');
    
    if (!toutOk) {
        console.warn('⚠️  DES PROBLÈMES ONT ÉTÉ DÉTECTÉS. Consulter le rapport ci-dessus.');
        console.warn('📖 Documentation: docs/legacy/A2025-migration-incomplete.md');
    }
}

// Exécution automatique
console.log('💡 Script de validation chargé.');
console.log('📝 Exécuter : validerArchitecture()');
```

**ATTENDU** : Script de diagnostic opérationnel

### Étape 3.2 : Créer checklist de migration

**CONTEXTE** : Protocole pour migrations futures  
**OBJECTIF** : Ne jamais oublier une étape critique  
**ZONES AUTORISÉES** : docs/operations/migration-checklist.md  

**Contenu** :

```markdown
# Checklist de migration de données

**Version** : 1.0  
**Date** : 31 décembre 2025

Cette checklist DOIT être suivie pour toute migration de données.

---

## PHASE 0 : PRÉPARATION (⚠️ OBLIGATOIRE)

- [ ] **Backup complet**
  - Export via Réglages → Import/Export
  - Sauvegarder : `backup-pre-[NOM_MIGRATION]-YYYY-MM-DD.json`
  - Vérifier taille fichier (> 0 Ko)

- [ ] **Commit Git avec tag**
  ```bash
  git add .
  git commit -m "État stable avant migration [NOM]"
  git tag v[VERSION]-pre-[NOM_MIGRATION]
  git push origin main --tags
  ```

- [ ] **Documenter état actuel**
  - Noter valeurs de référence (3 étudiants minimum)
  - Capturer screenshots (tableau de bord, profil étudiant)
  - Lister fichiers qui seront modifiés

- [ ] **Exécuter validation-architecture.js**
  - Identifier incohérences existantes
  - Noter dans SESSION.md

---

## PHASE 1 : MIGRATION

- [ ] **Lire la documentation de la migration**
  - Comprendre POURQUOI cette migration
  - Identifier les risques
  - Prévoir temps nécessaire

- [ ] **Exécuter script de migration**
  - Copier-coller dans console (pas exécution aveugle)
  - Observer chaque étape
  - Noter anomalies dans SESSION.md

- [ ] **Vérifier logs console**
  - Aucune erreur rouge
  - Warnings attendus seulement
  - Succès confirmé

---

## PHASE 2 : VALIDATION

- [ ] **Validation technique**
  - Application se charge sans erreur
  - Aucun message 404 ou référence manquante
  - localStorage cohérent

- [ ] **Validation données**
  - Comparer valeurs de référence (Phase 0)
  - Tolérance : ±0.1% pour arrondis
  - 100% identiques requis

- [ ] **Validation fonctionnelle**
  - Parcours utilisateur complet
  - Tous les workflows testés
  - Aucune régression détectée

- [ ] **Exécuter validation-architecture.js POST-migration**
  - Comparer avec rapport PRÉ-migration
  - Amélioration confirmée
  - Aucune nouvelle incohérence

---

## PHASE 3 : FINALISATION

- [ ] **Documentation**
  - Mettre à jour SESSION.md
  - Ajouter entrée dans docs/decisions/
  - Mettre à jour MEMORY-PINS si nécessaire

- [ ] **Commit Git**
  - Message détaillé avec résultats validation
  - Tag de version
  - Push vers remote

- [ ] **Export post-migration**
  - Backup complet après migration réussie
  - Comparer taille avec backup pré-migration
  - Archiver les deux versions

---

## PHASE 4 : COMMUNICATION

- [ ] **Testeurs (si applicable)**
  - Notifier du changement
  - Expliquer impact (ou absence d'impact)
  - Demander vigilance sur bugs

- [ ] **Documentation projet**
  - Mettre à jour CHANGELOG
  - Ajouter note dans ARCHITECTURE si changement majeur

---

## EN CAS DE PROBLÈME

### Rollback immédiat

```bash
# Restaurer le tag pré-migration
git checkout v[VERSION]-pre-[NOM_MIGRATION]

# Vérifier que l'application fonctionne
open index.html

# Si OK, créer branche de secours
git checkout -b rollback-[NOM_MIGRATION]
git checkout main
git merge rollback-[NOM_MIGRATION]
```

### Restaurer backup

```bash
# Dans l'application
Réglages → Import/Export → Importer
Sélectionner : backup-pre-[NOM_MIGRATION]-YYYY-MM-DD.json
```

### Diagnostic

1. Exécuter `validation-architecture.js`
2. Comparer rapport PRÉ vs POST migration
3. Identifier exactement ce qui a changé
4. Documenter dans SESSION.md section DÉVIATIONS
5. Alerter Grégoire immédiatement

---

**Ne JAMAIS sauter la Phase 0.**  
**Ne JAMAIS ignorer une erreur de validation.**  
**En cas de doute, rollback d'abord, investiguer ensuite.**
```

**ATTENDU** : Protocole clair et sécuritaire

---

## Phase 4 : Migration de CLAUDE.md

### Étape 4.1 : Extraire sections vers modules

**CONTEXTE** : Répartir contenu de CLAUDE.md dans nouvelle structure  
**OBJECTIF** : Documentation modulaire par domaine  
**ZONES AUTORISÉES** : Création fichiers dans docs/modules/  

**Sections à extraire** :

1. **docs/modules/trimestres.md**
   - Architecture multi-trimestres
   - Namespacing
   - Migration des données
   
2. **docs/modules/indices-cp.md**
   - Calcul des indices C et P
   - Délégation aux pratiques
   - API publique
   
3. **docs/modules/pratiques.md**
   - Système de pratiques modulaires
   - Interface IPratique
   - Pratiques implémentées
   
4. **docs/modules/etudiants-groupes.md**
   - Gestion des étudiants
   - Import depuis .txt
   - Structure des groupes
   
5. **docs/modules/evaluations-productions.md**
   - Productions et évaluations
   - Grilles SRPNF
   - Échelle IDME

**Méthode** :
- Copier sections pertinentes de CLAUDE.md
- Adapter pour lecture isolée (ajouter contexte)
- Garder seulement l'essentiel technique
- Maximum 10K par fichier

**ATTENDU** : 5 fichiers modules créés

### Étape 4.2 : Créer decision logs

**CONTEXTE** : Historique des décisions importantes  
**OBJECTIF** : Comprendre POURQUOI les choses sont comme elles sont  
**ZONES AUTORISÉES** : docs/decisions/  

**Format des decision logs** :

```markdown
# [DATE] - [TITRE DÉCISION]

## Contexte

[Quelle était la situation qui a nécessité cette décision ?]

## Problème

[Quel problème fallait-il résoudre ?]

## Alternatives considérées

1. **[Option 1]**
   - Avantages : [...]
   - Inconvénients : [...]
   
2. **[Option 2]**
   - Avantages : [...]
   - Inconvénients : [...]

## Décision

[Quelle option a été choisie et pourquoi ?]

## Conséquences

**Positives** :
- [...]

**Négatives** :
- [...]

**Mitigations** :
- [...]

## Statut

[Implémenté / En cours / Annulé]

## Références

- [Commits Git]
- [Documents liés]
```

**Décisions à documenter** :

1. **2025-11-systeme-pratiques.md** - Pourquoi et comment les pratiques modulaires
2. **2025-11-namespacing.md** - Introduction du namespacing
3. **2025-12-refactoring-portfolio.md** - Renommage portfolio → indices-cp

**ATTENDU** : 3 decision logs initiaux créés

### Étape 4.3 : Documenter l'état legacy

**CONTEXTE** : Problèmes connus hérités du développement  
**OBJECTIF** : Alerter sur les zones à risque  
**ZONES AUTORISÉES** : docs/legacy/  

**Fichiers à créer** :

1. **docs/legacy/A2025-migration-incomplete.md**
   - État exact du namespacing A2025
   - Clés namespacées vs non-namespacées
   - Protocole de travail obligatoire
   - Plan de nettoyage (janvier 2026)

2. **docs/legacy/pre-namespacing-data.md**
   - Historique données pré-Beta 95
   - Comment identifier données legacy
   - Risques et précautions

**ATTENDU** : Documentation claire des problèmes legacy

---

## Phase 5 : Validation et finalisation

### Étape 5.1 : Validation de la nouvelle structure

**CONTEXTE** : Vérifier que nouvelle documentation est complète  
**OBJECTIF** : Rien de critique n'est perdu  

**Checklist** :

```bash
[ ] 00-START-HERE.md existe et oriente correctement
[ ] 01-MEMORY-PINS.md contient les 10 décisions critiques
[ ] 02-ARCHITECTURE-OVERVIEW.md externalise vision de Grégoire
[ ] SESSION.md template est prêt à utiliser
[ ] validation-architecture.js fonctionne dans console
[ ] migration-checklist.md est complet
[ ] 5 modules créés dans docs/modules/
[ ] 3 decision logs créés dans docs/decisions/
[ ] 2 fichiers legacy créés dans docs/legacy/
[ ] Répertoire principal épuré (seulement Beta 95+)
[ ] Archive contient Beta 70-94 + scripts obsolètes
[ ] CLAUDE.md original archivé avec note de dépréciation
```

### Étape 5.2 : Test avec Claude Code

**CONTEXTE** : Valider que Claude Code peut utiliser nouvelle structure  
**OBJECTIF** : Documentation effective pour un LLM  

**Test** :

1. Donner `00-START-HERE.md` à Claude Code
2. Lui demander d'identifier contexte de travail
3. Vérifier qu'il trouve bonne documentation
4. Simuler un bug et voir s'il utilise SESSION.md
5. Demander validation architecture avec script

**Critère de succès** : Claude Code navigue facilement et trouve l'info

### Étape 5.3 : Commit final

**CONTEXTE** : Sauvegarder nouvelle architecture documentaire  
**OBJECTIF** : Version Beta 95.5 stable  

**Message de commit** :

```
Beta 95.5 - Réorganisation complète de la documentation

MOTIVATION :
CLAUDE.md à 100K devenait ingérable et réduisait capacité de travail.
Architecture mentale de Grégoire non-externalisée = collaboration impossible.
Cycle épuisant : bugs consomment contexte, plan oublié, surveillance constante.

NOUVELLE STRUCTURE :
- Documentation modulaire par domaine (docs/modules/)
- Decision logs historiques (docs/decisions/)
- Problèmes legacy documentés (docs/legacy/)
- Outils opérationnels (docs/operations/)
- Point d'entrée clair (00-START-HERE.md)
- Session tracking (SESSION.md)

NETTOYAGE :
- Beta 70-94 archivées
- Scripts obsolètes archivés
- Répertoire principal épuré
- CLAUDE.md original conservé pour référence

BÉNÉFICES :
- Réduction charge cognitive (~50%)
- Interruption/reprise de session facilitée
- Architecture externalisée
- Collaboration future possible
- Maintenance simplifiée

VALIDATION :
- Toutes les informations critiques préservées
- Points d'entrée clairs testés
- Script validation-architecture.js opérationnel

Fichiers créés : 15+ nouveaux fichiers documentation
Fichiers archivés : 30+ fichiers Beta 70-94
Impact fonctionnel : AUCUN (réorganisation doc seulement)
```

**Commandes** :

```bash
git add .
git commit -m "[message ci-dessus]"
git tag v0.95.5-reorganisation-docs
git push origin main --tags
```

---

## Résumé des livrables

### Documentation

- ✅ `00-START-HERE.md` - Point d'entrée (2K)
- ✅ `01-MEMORY-PINS.md` - Décisions immuables (5K)
- ✅ `02-ARCHITECTURE-OVERVIEW.md` - Vision globale (10K)
- ✅ `SESSION.md` - Template session active
- ✅ 5 fichiers modules (docs/modules/)
- ✅ 3 decision logs (docs/decisions/)
- ✅ 2 fichiers legacy (docs/legacy/)

### Outils

- ✅ `validation-architecture.js` - Diagnostic
- ✅ `migration-checklist.md` - Protocole sécurisé

### Nettoyage

- ✅ Beta 70-94 archivées
- ✅ Scripts obsolètes archivés
- ✅ Répertoire principal épuré
- ✅ CLAUDE.md archivé

---

## Estimation temporelle

**Phase 0** : 15 min (backup et préparation)  
**Phase 1** : 2h (création nouvelle structure)  
**Phase 2** : 1h (nettoyage répertoire)  
**Phase 3** : 1h (outils opérationnels)  
**Phase 4** : 2h (migration CLAUDE.md)  
**Phase 5** : 30 min (validation et finalisation)

**TOTAL** : ~7 heures de travail  
**Possibilité** : Étaler sur 2-3 sessions

---

## Notes pour Claude Code

### Principes

1. **Ne rien supprimer** - Archiver seulement
2. **Préserver l'information critique** - Rien ne doit être perdu
3. **Tester chaque étape** - Validation continue
4. **Documenter en temps réel** - SESSION.md à jour

### Séquence recommandée

```
Phase 0 (Backup) 
    → Phase 1 (Nouvelle structure)
    → Validation partielle
    → Phase 2 (Nettoyage)
    → Validation partielle
    → Phase 3 (Outils)
    → Phase 4 (Migration CLAUDE.md)
    → Phase 5 (Validation finale)
```

### En cas de doute

- **Arrêter et demander à Grégoire**
- Mieux vaut être conservateur qu'agressif
- L'objectif est la clarté, pas la perfection

---

## Signature

**Plan créé par** : Grégoire Bédard + Claude (Anthropic)  
**Date de création** : 31 décembre 2025  
**Validation** : Prêt à exécuter (après pack démo stable)  
**Durée estimée** : 7 heures (2-3 sessions)

---

**🎯 Ce plan transformera Codex Numeris en projet maintenable et collaboratif.**
