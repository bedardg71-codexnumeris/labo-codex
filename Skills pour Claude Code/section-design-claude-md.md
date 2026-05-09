## Regles de design d'interface

**Principe directeur** : L'interface sert un enseignant en action. Chaque ecran doit permettre de detecter, comprendre et agir rapidement — pas d'ornementation, pas de complexite inutile.

### Processus obligatoire pour tout changement visuel

1. **Consulter `design-system.html`** — source de verite pour couleurs, composants, surfaces, modes sombre/clair
2. **Utiliser les variables CSS de `styles.css`** — jamais de couleurs en dur, jamais de nouvelles variables sans raison documentee
3. **Tester les deux modes** (sombre et clair) avant de considerer le travail termine
4. **Verifier l'accessibilite de base** : contraste texte/fond >= 4.5:1, cibles tactiles >= 44px (iPad), focus clavier visible

### Hierarchie visuelle

L'interface est dense par necessite (tableaux de bord, listes d'etudiants, graphiques). Regles pour maintenir la lisibilite :

- **Un seul element d'attention primaire par ecran** — le regard doit savoir ou aller
- **Les indices A-C-P-E utilisent un code couleur coherent** partout dans l'app (voir `design-system.html`)
- **Les alertes RaI (niveaux 1-2-3) sont visuellement distinctes** — ne jamais les confondre avec des alertes systeme
- **Les graphiques Chart.js respectent la palette** definie dans les variables CSS

### UX copy et ton

- **Langue** : francais quebecois, vouvoiement evite (l'enseignant tutoie l'app)
- **Ton** : professionnel mais accessible — outil d'enseignant, pas logiciel d'entreprise
- **Vocabulaire pedagogique** : utiliser les termes exacts du projet (indices A-C-P-E, artefact, pratique de notation, IDME, RaI). Consulter `SKILL_Ecosysteme_classe.md` en cas de doute
- **Messages d'erreur** : dire ce qui s'est passe, pourquoi, et quoi faire — en une phrase si possible
- **Etats vides** : guider l'enseignant vers l'action suivante (pas juste « aucune donnee »)

### Accessibilite (minimum requis)

Labo Codex est utilise sur MacBook (M3) et iPad Air (M1). Cibles :

- **Contraste** : WCAG 2.1 AA minimum (4.5:1 texte, 3:1 elements graphiques)
- **Navigation clavier** : tout element interactif atteignable par Tab, activable par Entree/Espace
- **Focus visible** : outline ou indicateur clair sur l'element focus — ne jamais le masquer
- **SPA et focus** : lors des changements de vue, deplacer le focus vers le titre ou le contenu principal de la nouvelle vue
- **Tactile (iPad)** : zones de toucher minimum 44x44px, espacement suffisant entre cibles adjacentes
- **Graphiques Chart.js** : fournir un equivalent textuel (tableau ou resume) pour les donnees critiques

### Responsive

- **Desktop** (>1024px) : disposition par defaut
- **Tablette** (768-1024px, iPad Air) : adapter les tableaux et tableaux de bord. C'est le second cas d'usage principal
- **Mobile** (<768px) : non prioritaire actuellement, mais ne pas casser l'affichage

### Anti-patterns a eviter

- Inventer des couleurs hors de la palette (`--variables` de `styles.css`)
- Ajouter des animations purement decoratives (sauf les bulles parallaxe de l'en-tete, deja en place)
- Creer des modales ou dialogues quand un panneau lateral ou une section inline suffit
- Masquer de l'information derriere des interactions non evidentes (hover-only, gestes exotiques)
- Dupliquer du microcopy existant au lieu de le reutiliser
