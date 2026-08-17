---
name: memory-management
description: >
  Décodage du vocabulaire pédagogique et technique de Labo Codex pour que Claude
  comprenne les demandes comme un collègue. La mémoire n'est pas un cache propre
  au plugin : elle indexe les sources canoniques (CLAUDE.md, le dossier
  « .claude/skills/ », ETAT-PROJET.md, SESSION.md). Déclencher dès que Grégoire
  utilise du jargon projet (ELLAC, SOLO, IDME, RàI, PAN, Voûte, Codex…), demande
  « c'est quoi X », ou dit « retiens ça ».
---

# Gestion de la mémoire — Labo Codex

La mémoire permet à Claude d'être un collaborateur qui comprend le langage du projet. **Elle ne duplique pas** : il n'y a plus de `glossary.md` propre au plugin. Les définitions canoniques vivent déjà dans les fichiers du projet ; ce skill apprend **où chercher** et **dans quel ordre**.

## L'objectif

Transformer le jargon en compréhension, avant d'agir :

```
Grégoire : « le calcul IDME bugge pour la pratique STD quand un artefact a un poids nul dans la grille »
              ↓ décoder
« le calcul des niveaux de performance (Insuffisant/Développement/Maîtrisé/Étendu) dysfonctionne
 pour la pratique PAN-Standards quand une production étudiante a un critère pondéré à 0 % »
```

## Sources de vérité (ordre de consultation)

| Ordre | Source | Pour quoi |
|-------|--------|-----------|
| 1 | `CLAUDE.md` (dépôt) | Point d'entrée : principes (zéro-dette), zones protégées, versionnage, écosystème de données, liste des skills |
| 2 | `.claude/skills/` | Définitions canoniques (voir table ci-dessous) |
| 3 | `ETAT-PROJET.md` / `SESSION.md` | État courant, avancement, contexte de session |
| 4 | `Retours des testeurs/` | Bugs et usages signalés par la première vague d'utilisateurs |
| 5 | Demander à Grégoire | Terme inconnu de toutes les sources |

Quel skill pour quel domaine :

| Domaine | Skill |
|---------|-------|
| Cadre pédagogique (ELLAC, SOLO, PAN, SRPNF, IDME, cartouches) | le skill `ecosysteme-classe` |
| Architecture, indices A-C-P-E, modules, workflow | le skill `labo-codex` |
| Moteur de notation (familles SOM/STD/SPE/DEN, simulation, comparateur) | le skill `pratiques-notation` |
| Dépistage, IPB, patterns, interventions | le skill `depistage-rai` |
| Module Alignement (carte mentale, leçons) | le skill `alignement` |
| Sécurité, anonymisation, intégrité, Loi 25 | le skill `securite-donnees` |
| Clés globales partagées | le skill `integrite-globaux`, le skill `hygiene-donnees-partagees` |
| Vérifier un travail (auto / audit tiers) | le skill `verification-adverse` |

## Aide-mémoire (pointeur, pas source)

Décodage rapide ; en cas de doute, consulter le skill canonique correspondant.

**Acronymes pédagogiques** : ELLAC (Enseigner la Lecture Littéraire Au Collégial) · SOLO (taxonomie Structure of Observed Learning Outcomes) · IDME (Insuffisant, Développement, Maîtrisé, Étendu) · PAN (Pratique Alternative de Notation) · RàI (Réponse à l'Intervention) · SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français) · HOC (Hypothèse Organisatrice Centrale).

**Indices** : A-C-P-E = Assiduité, Complétion, Performance, Engagement.

**Familles de pratiques** : SOM (Sommative) · STD (PAN-Standards) · SPE (PAN-Spécifications) · DEN (PAN-Dénotation). *Statut d'implémentation : volatil – le lire dans `BACKLOG.md` / le skill `pratiques-notation`, ne pas le figer ici.*

**Écosystème de données** (4 concepts, `docs/architecture/ECOSYSTEME-DONNEES.md`) :
- **Codex** – espace de travail actif
- **Archives** – dépôt local
- **Codex data** – format de recherche
- **Voûte** – bibliothèque **partagée** (ex-« bibliothèque communautaire » ; partage de ressources par fichiers signés)

**Termes techniques** : namespacing (préfixe trimestre, `window.cle('nomCle')`) · SSOT (single source of truth, une donnée = une source) · Primo (assistant d'accueil) · zones protégées (`js/config.js`, `js/navigation.js`, `noms_stables.json` – ne pas modifier sans autorisation).

## Contexte projet (à jour)

- **Application** : Labo Codex – suivi des apprentissages et construction de la note.
- **Développeur** : Grégoire Bédard, enseignant de littérature au collégial (601-101-MQ), développeur solo.
- **Phase** : **bêta publique** (lancée à l'AQPC le 3 juin 2026). Version courante dans `version.json` (SemVer, clé `beta` ; libellé d'affichage « Bêta publique X.Y.Z »).
- **Étape structurante** : ouverture à une première vague d'utilisateurs externes (expérimentateurs post-AQPC), puis **communauté de pratique hébergée par l'AQPC à la rentrée**. Enjeu : généraliser ce qui était codé en dur pour la pratique personnelle de Grégoire vers plusieurs disciplines, pratiques et méthodes, **tout en gardant cohésion et logique universelle**.
- **Principes directeurs** : stabilité **zéro-dette** (un nouveau système retire l'ancien), **pérennité** (maintenable et adoptable par des tiers), **qualité du code** (SSOT, CSP stricte, sécurité non négociable). Positionnement : « un outil de pensée complexe pour développer la pensée complexe » (cycle SOLO → RàI → Alignement ; trois clientèles : novice, expérimenté, conseiller pédagogique).
- **Technologie** : HTML/CSS/JS vanilla, IndexedDB + localStorage, seule dépendance Chart.js, 100 % hors-ligne, CSP `script-src 'self'`.
- **Déploiement** : GitHub → Netlify + Cloudflare Access (`app.codexnumeris.org`). Licence AGPL v3.

> **Sensibilité (à ne jamais propager en communication publique ou institutionnelle)** : le développement a eu lieu pendant un congé de maladie (automne 2025 / hiver 2026). Les documents publics ont été nettoyés de toute référence temporelle de ce type. Voir `memory/context/positionnement-colloque.md`.

## Comment interagir

### Décoder (toujours, avant d'agir)
Suivre l'ordre de consultation ci-dessus. Couvrir CLAUDE.md + l'aide-mémoire pour ~90 % des cas ; plonger dans le skill canonique pour le détail ou en cas de doute.

### « retiens ça » / nouveau terme
Ne **pas** créer de cache parallèle. Router vers le domicile canonique, **avec confirmation** :
- Terme pédagogique → le skill `ecosysteme-classe` (ou le skill du domaine).
- Terme/règle technique → le skill concerné, ou `CLAUDE.md` si c'est un principe transverse.
- Fait de contexte projet → `memory/context/` (dépôt) ou `ETAT-PROJET.md`.
- Préférence de travail de Grégoire → `SKILL_profil_gregoire.md` (dossier Cowork) si présent.

### « c'est quoi X »
Chercher dans l'ordre, citer la source, et si introuvable : « Je ne trouve pas X dans tes sources. Tu me le définis ? Je note où il va. »

## Conventions

- La mémoire **indexe**, elle ne recopie pas : préférer un pointeur vers le fichier source à une copie qui se périme.
- En cas de divergence entre l'aide-mémoire ci-dessus et un skill canonique, **le skill gagne** (signaler l'écart à Grégoire).
- Capturer les synonymes (artefact = production ; Voûte = ex-bibliothèque communautaire).
- Router selon les deux dossiers : technique → dépôt de code ; pédagogie/communauté → dossier Cowork.
