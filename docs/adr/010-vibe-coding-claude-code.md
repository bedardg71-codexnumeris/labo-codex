# ADR-010 : Développement en vibe coding avec Claude Code

**Statut** : Acté rétroactivement
**Date de décision originale** : octobre 2025 (formalisation : 14 mai 2026)
**Auteur** : Grégoire Bédard

---

## Contexte

L'auteur du projet est un enseignant de littérature, pas un développeur professionnel. Il a appris la programmation par la pratique (Python pour de la recherche, JavaScript pour des prototypes pédagogiques) mais ne possède pas la fluidité ni le réflexe d'un développeur sénior. L'enjeu : développer une application web non triviale (~50k lignes de code à terme) en solo, sans renoncer à la qualité ni à la pédagogie.

Plusieurs modes de développement étaient envisageables :
- **Coder seul sans assistant** : tenable pour de petits prototypes mais inadapté à la durée et la complexité.
- **Embaucher un développeur professionnel** : incompatible avec le budget et le caractère personnel du projet.
- **Pair programming avec un collègue** : pas de collègue disponible avec ce profil.
- **Vibe coding avec un assistant LLM** : option émergente en 2024-2025, mature avec Claude Code en 2025.

L'auteur a fait le choix conscient d'adopter Claude Code comme **partenaire de développement**, avec un workflow itératif : discussion → planification → implémentation par fichier → validation → itération. Au 14 mai 2026, le projet compte ~2 793 commits sur ~7 mois — un rythme qui n'aurait pas été tenable sans assistance LLM.

---

## Décision

**Tout le développement de Labo Codex se fait en vibe coding avec Claude Code.** Concrètement :

- **Claude Code génère le code**, l'auteur valide à chaque étape.
- **Discussions en français**, avec un cadre méthodologique formalisé dans `CLAUDE.md` (procédure de développement, principes directeurs, zéro-dette, vigilance sur les régressions).
- **Skills dédiés** dans `.claude/skills/<nom>/SKILL.md` pour préserver le contexte métier entre sessions (`labo-codex`, `ecosysteme-classe`, `alignement`, `depistage-rai`, `securite-donnees`, `integrite-globaux`, `hygiene-donnees-partagees`).
- **Mémoire de session** dans `MEMORY.md` (préférences, leçons, conventions) qui persiste à travers les conversations.
- **CLAUDE.md à la racine** comme point d'entrée léger qui oriente vers `docs/00-START-HERE.md` puis vers les modules.
- **Mode itératif strict** : un fichier à la fois, validation fonctionnelle après chaque changement, debug avant de passer à l'étape suivante.

---

## Conséquences

### Positives

- **Vitesse de développement** : ~13 commits/jour ouvré moyen, ce qui dépasse largement ce qu'un développeur unique sans assistant produirait.
- **Apprentissage par la pratique** : l'auteur progresse en lisant, validant et corrigeant le code produit. Claude Code explique son raisonnement, ce qui équivaut à un mentorat continu.
- **Cohérence architecturale préservée** : grâce aux skills et à `CLAUDE.md`, Claude Code applique les conventions du projet (SSOT, zéro-dette, vocabulaire descriptif, etc.) sans qu'il faille les rappeler à chaque session.
- **Documentation latente** : les conversations elles-mêmes sont une forme de documentation. La discipline de tenir `SESSION.md` matérialise les décisions importantes.
- **Faibles coûts de tooling** : pas de licence d'IDE coûteuse, pas de plugin propriétaire — l'outil principal est un assistant CLI.

### Négatives

- **Dépendance à Anthropic** : si Anthropic ferme le service ou augmente drastiquement les prix, le rythme actuel devient intenable. Mitigation : le code est déjà écrit, on continuerait à un rythme réduit avec un assistant équivalent.
- **Qualité variable selon le contexte** : Claude Code peut produire du code subtil ou élégant comme du code redondant ou maladroit. La vigilance du mainteneur est essentielle.
- **Risque de patchage par-dessus** : sans discipline, Claude Code tend à ajouter plutôt que refactorer. La politique zéro-dette (cf. `CLAUDE.md` §"Stabilité zéro-dette") contre ce biais.
- **Trace écrite limitée du raisonnement** : les conversations ne sont pas systématiquement archivées. La documentation des décisions doit être faite explicitement (ADRs, SESSION.md, mémoire).
- **Confidentialité des prompts** : tout ce qui est envoyé à Claude Code transite par les serveurs Anthropic. Conséquence : ne jamais coller de données nominatives d'étudiants dans une conversation (politique respectée, cf. `.claude/skills/securite-donnees/SKILL.md`).

### Neutres

- **Effort de cadrage** : maintenir les skills, `CLAUDE.md` et `MEMORY.md` est un travail récurrent. C'est aussi un investissement qui paie sur la durée.
- **Reproductibilité** : un autre développeur sans accès à Claude Code peut quand même lire et maintenir le code (cf. sous-audit 4.3 Onboarding) — l'assistant n'est pas un prérequis pour utiliser le projet.

---

## Alternatives considérées

### Option A : Coder seul sans assistant

**Écartée** comme intenable sur la durée pour un mainteneur unique non-pro.

### Option B : Pair programming avec un collègue

**Écartée** faute de collègue disponible avec le profil (mix littérature + dev).

### Option C : Sous-traiter à un développeur freelance

**Écartée** parce qu'elle aurait dilué l'alignement pédagogique (le développeur n'aurait pas eu la même intuition métier) et qu'elle pose un problème de coût et de continuité.

### Option D : Vibe coding avec un autre LLM (Copilot, Cursor, GPT)

**Écartée** au profit de Claude Code pour des raisons d'écosystème (Claude Code intègre nativement les skills, l'auto-memory, les hooks, les agents). À réévaluer si un autre outil devient nettement supérieur.

---

## Références

- `CLAUDE.md` à la racine — cadre de collaboration avec Claude Code.
- `.claude/skills/` — skills métier du projet.
- `MEMORY.md` dans `~/.claude/projects/.../memory/` — mémoire persistante.
- `SESSION.md` à la racine — contexte de session active.

---

## Notes de révision

À réviser si :
- Anthropic ferme le service Claude Code ou impose des conditions incompatibles.
- Un autre LLM offre un workflow nettement supérieur (cas peu probable à court terme).
- Un co-mainteneur professionnel rejoint le projet et le workflow évolue vers un mix humain-humain + LLM.

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
