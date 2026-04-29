# Plan — Uniformisation des en-têtes et fusion des graphiques de l'Aperçu

**Date** : 27 avril 2026
**Statut** : décidé, à coder
**Précédent** : `PLAN-GRAPHIQUE-HABILETES-GROUPE.md` (livré, beta 99.27)

---

## 1. Décisions

| Décision | Choix retenu | Raison |
|---|---|---|
| **A** — `obtenirTermeProduction` global | Ajouter `window.obtenirTermeProduction` dans `profil-etudiant.js` | Bug latent : la fonction est dans un IIFE, donc inaccessible des autres modules ; 2 call-sites retombent silencieusement sur « artefact » |
| **B** — Mode de la carte fusionnée | `Mesure : [Note finale ▼ / Habiletés]` ; pills critères + toggle Médiane visibles seulement en mode Habiletés | Un seul graphique conceptuellement, deux mesures |
| **C** — Sort de `creerGraphiqueGroupeSpaghetti` | **Suppression**. Mode `'noteFinale'` ajouté à `creerGraphiqueGroupeHabiletes` | Pour le détail (statuts d'évaluation, regroupement d'activités), l'enseignant consulte le profil de l'élève. Zéro dette. |
| **D** — Carte 1 (A·C·P par semaine) | Refonte complète : titre, sous-titre, contexte droite, bouton 👤 | Uniformisation totale ; les graphiques servent à des captures d'écran qui doivent montrer la source |

---

## 2. Architecture cible

### Avant (3 cartes)

1. **Développement du groupe** — A·C·P par semaine, snapshots hebdo
2. **Développement individuel** — Note finale par artefact, spaghetti per élève (titre trompeur)
3. **Développement du groupe par habiletés** — Moyenne critères par artefact

### Après (2 cartes)

1. **Développement du groupe — par semaine**
   - Sous-titre : « Indices A·C·P sur les snapshots hebdomadaires »
   - Mesure : `[Assiduité (A) / Complétion (C) / Construction de P]`
   - Élève en relief + 👤 voir profil
   - Contexte droite : Trimestre · Cours · N élèves

2. **Trajectoires par {terme}**
   - Titre dynamique : `obtenirTermeProduction('singulier')` → « par artefact » dans la pratique de Grégoire
   - Sous-titre dynamique selon Mesure
   - Mesure : `[Note finale / Habiletés]`
   - Élève en relief + 👤 voir profil
   - Toggle Médiane (les deux modes)
   - Barre Critères : visible seulement en mode Habiletés
   - Contexte droite : Trimestre · Cours · N élèves

---

## 3. Pattern d'en-tête uniforme

```
┌───────────────────────────────────────────────────────────────────┐
│ TITRE  ✴️                              Trimestre · Cours · N élèves│
│ Sous-titre — ce qu'on mesure exactement                            │
│                                                                     │
│ Mesure : [contrôle]   Élève en relief : [select] [👤]   [Options]  │
│                                                                     │
│ [Barre critères — uniquement carte 2, mode Habiletés]              │
└───────────────────────────────────────────────────────────────────┘
```

- **Mesure** : `select` mono-exclusif (A/C/P, Note finale/Habiletés)
- **Élève en relief** : `select`, optionnel
- **👤** : visible quand un élève est choisi → `tbNavigerVersProfil(da)`
- **Options** : `toggle` médiane le cas échéant
- **Barre critères** : `pills checkbox` multi-sélection (mode Habiletés uniquement)

---

## 4. Étapes d'implémentation

### Étape A — Export global de `obtenirTermeProduction`
- `js/profil-etudiant.js` : ajouter `window.obtenirTermeProduction = obtenirTermeProduction;` dans le bloc d'exports
- Vérifier que les 2 call-sites existants (`graphiques-progression.js:4550, 4552`) bénéficient maintenant du vrai terme

### Étape B — Carte 1 (A·C·P par semaine)
- `index.html` : restructurer l'en-tête de `#carte-evolution-temporelle` selon le pattern uniforme
  - Titre + sous-titre « Indices A·C·P sur les snapshots hebdomadaires »
  - Sélecteur Mesure (Indice A/C/P)
  - Sélecteur Élève + bouton 👤
- Pas de toggle Médiane sur cette carte (snapshots hebdo, médiane moins parlante)

### Étape C — Carte 2 fusionnée (Trajectoires par production)
- `index.html` :
  - Renommer `#carte-trajectoire-apprentissage` → `#carte-trajectoires-production` (ID descriptif, pas trompeur)
  - Restructurer en-tête selon pattern
  - Ajouter le sélecteur `Mesure : [Note finale | Habiletés]`
  - Bloc « critères pills » conditionnellement masqué
  - Conserver le canvas existant `#graphique-groupe-spaghetti` ou renommer en `#graphique-trajectoires-production`
- Supprimer `#carte-developpement-habiletes` (la nouvelle carte est absorbée dans la carte fusionnée)
- Supprimer le bloc dupliqué `#note-habiletes` (texte intégré dans la note de la carte fusionnée)
- `js/graphiques-progression.js` :
  - Renommer `creerGraphiqueGroupeHabiletes` → `creerGraphiqueTrajectoiresProduction`
  - Ajouter `options.mesure = 'noteFinale' | 'habiletes'` (défaut `'noteFinale'`)
  - En mode `'noteFinale'`, calcule la donnée à partir de `evaluation.noteFinale / 100` (pas de `criteres[]`)
  - Ajustement du titre Y dynamique : « Note finale » | « <Critère> » | « N habiletés (moyenne) » | « Toutes les habiletés (moyenne) »
  - Ajustement du label X dynamique via `obtenirTermeProduction('pluriel', true)`
  - Suppression de `creerGraphiqueGroupeSpaghetti`, `rafraichirGraphiqueSpaghetti`, `selectionnerEtudiantSpaghetti`, `donneesSpaghettiGlobales`, `pluginNomEtudiantSurvol`, `pluginTooltipsMultiples` et leurs exports
- `js/tableau-bord-apercu.js` :
  - `initialiserCarteHabiletes` → `initialiserCarteTrajectoiresProduction`
  - `togglerCritereHabiletes` → `togglerCritereTrajectoires`
  - Nouveau handler `changerMesureTrajectoires(el)` qui swap mode et masque/affiche la barre critères
  - Retirer l'appel à `creerGraphiqueGroupeSpaghetti` (le graphe individuel n'existe plus)

### Étape D — Bouton 👤 voir profil
- Composant simple dans le HTML, hidden par défaut
- Listener data-action sur `tbNavigerVersProfil` avec param = DA
- Apparaît dynamiquement quand `selecteur-etudiant.value !== ''`, masqué sinon
- Cibles tactiles ≥ 44 px (pointer:coarse)

### Étape E — Validation et bump
- Tests Mac + iPad, modes clair + sombre
- Vérifier qu'aucune section ne référence l'ancienne carte « Développement individuel » (recherches dans index.html, JS, docs)
- Bump beta + build (à demander)

---

## 5. Fichiers touchés

| Fichier | Type de changement |
|---|---|
| `js/profil-etudiant.js` | +1 ligne (export window) |
| `index.html` | restructuration des 2 cartes ; suppression de la carte habiletés isolée et de la carte individuelle |
| `js/graphiques-progression.js` | renommage fonction + ajout mode 'noteFinale' + suppression `creerGraphiqueGroupeSpaghetti` et plugins associés |
| `js/tableau-bord-apercu.js` | renommage fonctions + handler swap mode + retrait appel à l'ancien graphe |
| `styles.css` | éventuels ajustements (pas de nouvelles classes a priori) |
| `plans de travail/PLAN-UNIFORMISATION-ENTETES-GRAPHIQUES.md` | ce document |

---

## 6. Risques et précautions

- **Mémoire localStorage des préférences** : aucune préférence dépendante de l'ancienne carte « Développement individuel » n'a été identifiée → safe à supprimer.
- **Tooltips perdus** : on accepte la perte des badges « Jeton / Plagiat / Retard / IA » dans le tooltip ; ils restent dans le profil de l'élève.
- **Navigation depuis 👤** : `tbNavigerVersProfil(da)` existe et est exporté ; doit fonctionner sans modif.
- **Critères de plusieurs grilles** : la fonction `listerCriteresHabiletes()` consolide déjà les critères de toutes les grilles utilisées par les évaluations actives → robuste au cas multi-grilles.
- **Mode initial** : par défaut `'noteFinale'` (cas d'usage le plus courant). L'utilisateur switche vers `'habiletes'` au besoin.

---

**Fin du plan.**
