---
name: design-interface
description: >
  Règles de design d'interface de Labo Codex. Charger AVANT de créer ou
  modifier tout élément visuel : bouton, carte, formulaire, alerte, badge,
  tableau, navigation, en-tête, graphique, modale, panneau. Déclencher aussi
  pour tout travail sur les couleurs, la palette, les variables CSS de
  `styles.css`, les modes sombre et clair, l'accessibilité (contraste, focus,
  cibles tactiles iPad), le responsive, le microcopy et les messages d'erreur,
  ou dès que `design-system.html` est en cause. Couvre : le processus
  obligatoire pour tout changement visuel, la hiérarchie visuelle, l'UX copy
  et le ton, les minimums d'accessibilité, les anti-patterns, et les deux
  références visuelles animées (bulles parallaxe, points 3D).
---

# SKILL : Design d'interface — Labo Codex

**Principe directeur** : l'interface sert un enseignant en action. Chaque écran
doit permettre de détecter, comprendre et agir rapidement — pas d'ornementation,
pas de complexité inutile.

---

## 1. Référence visuelle obligatoire

**AVANT de créer ou modifier tout élément visuel**, consulter
**`design-system.html`** (racine du projet). Ce document est la source de
vérité pour :

- la palette de couleurs (modes sombre et clair) ;
- les surfaces, ombres et border-radius ;
- les boutons, formulaires, cartes, en-têtes ;
- la navigation, les tableaux, alertes et badges.

L'ancien design system modulaire (01a-07) est archivé dans
`Design system - Modules/_archives/`. Ne pas y puiser.

---

## 2. Processus obligatoire pour tout changement visuel

1. **Consulter `design-system.html`** — source de vérité pour couleurs,
   composants, surfaces, modes sombre/clair.
2. **Utiliser les variables CSS de `styles.css`** — jamais de couleurs en dur,
   jamais de nouvelles variables sans raison documentée.
3. **Tester les deux modes** (sombre et clair) avant de considérer le travail
   terminé.
4. **Vérifier l'accessibilité de base** : contraste texte/fond ≥ 4.5:1, cibles
   tactiles ≥ 44 px (iPad), focus clavier visible.

---

## 3. Hiérarchie visuelle

L'interface est dense par nécessité (tableaux de bord, listes d'étudiants,
graphiques). Règles pour maintenir la lisibilité :

- **Un seul élément d'attention primaire par écran** — le regard doit savoir
  où aller.
- **Les indices utilisent un code couleur cohérent** partout dans l'app (voir
  `design-system.html`).
- **Les alertes RàI (niveaux 1-2-3) sont visuellement distinctes** — ne jamais
  les confondre avec des alertes système.
- **Les graphiques Chart.js respectent la palette** définie dans les variables
  CSS.

---

## 4. UX copy et ton

- **Langue** : français québécois, vouvoiement évité (l'enseignant tutoie
  l'app).
- **Ton** : professionnel mais accessible — outil d'enseignant, pas logiciel
  d'entreprise.
- **Vocabulaire pédagogique** : utiliser les termes exacts du projet (indices,
  artefact, pratique de notation, IDME, RàI). Consulter le skill
  `ecosysteme-classe` en cas de doute.
- **Messages d'erreur** : dire ce qui s'est passé, pourquoi, et quoi faire —
  en une phrase si possible.
- **États vides** : guider l'enseignant vers l'action suivante (pas juste
  « aucune donnée »).

---

## 5. Accessibilité (minimum requis)

Labo Codex est utilisé sur MacBook (M3) et iPad Air (M1). Cibles :

- **Contraste** : WCAG 2.1 AA minimum (4.5:1 texte, 3:1 éléments graphiques).
- **Navigation clavier** : tout élément interactif atteignable par Tab,
  activable par Entrée/Espace.
- **Focus visible** : outline ou indicateur clair sur l'élément focus — ne
  jamais le masquer.
- **SPA et focus** : lors des changements de vue, déplacer le focus vers le
  titre ou le contenu principal de la nouvelle vue.
- **Tactile (iPad)** : zones de toucher minimum 44×44 px, espacement suffisant
  entre cibles adjacentes.
- **Graphiques Chart.js** : fournir un équivalent textuel (tableau ou résumé)
  pour les données critiques.

---

## 6. Responsive

- **Desktop** (> 1024 px) : disposition par défaut.
- **Tablette** (768-1024 px, iPad Air) : adapter les tableaux et tableaux de
  bord. C'est le second cas d'usage principal.
- **Mobile** (< 768 px) : non prioritaire actuellement, mais ne pas casser
  l'affichage.

---

## 7. Anti-patterns à éviter

- Inventer des couleurs hors de la palette (`--variables` de `styles.css`).
- Ajouter des animations purement décoratives (sauf les bulles parallaxe de
  l'en-tête, déjà en place).
- Créer des modales ou dialogues quand un panneau latéral ou une section
  inline suffit.
- Masquer de l'information derrière des interactions non évidentes
  (hover-only, gestes exotiques).
- Dupliquer du microcopy existant au lieu de le réutiliser.

---

## 8. Références visuelles importantes

### Animation bulles en-tête (parallaxe)

Points colorés qui circulent de gauche à droite dans l'en-tête :

- **CSS** : `index.html` (`.bulles-container`, `.bulle`,
  `@keyframes floatUp`).
- **JS** : `js/main.js` (`creerUneBulle()`, `genererBullesApprentissage()`).
- **Effet parallaxe** : grandes = rapides (proches), petites = lentes
  (éloignées).

### Points étudiants tableau de bord (3D)

Points blancs dans les barres graduées de l'aperçu :

- **CSS** : `styles.css` (`.barre-etudiant`, `@keyframes float-vertical`).
- **Effet 3D** : gradient + box-shadow avec lumière gauche → droite.

> Les numéros de ligne d'origine ont été retirés : ils étaient périmés à chaque
> édition. Chercher par nom de sélecteur ou de fonction.

---

## 9. Livrer du changement visuel non éprouvable

Dès qu'un cycle produit du changement que la session ne peut pas éprouver
elle-même (Safari, iPad, corpus réel), charger le skill `portes-terrain` : le
modèle de liste de vérifications destinée à Grégoire est obligatoire.

---

## HISTORIQUE

| Date | Changement |
|---|---|
| 2026-08-17 | Création. Extrait de `CLAUDE.md` (sections « Référence visuelle obligatoire », « Références visuelles importantes », « Règles de design d'interface ») et de `section-design-claude-md.md`, désormais retirés au profit de ce skill. Numéros de ligne des références visuelles supprimés (périmés). |
| 2026-08-17 | **Ce fichier fait foi.** Une copie divergente existait dans les skills du compte claude.ai ; ses deux blocs propres (§9 portes terrain, HISTORIQUE) sont rapatriés ici. La copie du compte est à supprimer ou à réaligner sur ce fichier. |
