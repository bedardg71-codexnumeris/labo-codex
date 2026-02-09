# Plan — Intégration des évaluations dans l'alignement pédagogique

> Document autonome destiné à Claude Code.
> Prérequis : lire PLAN-BADGES-PALETTE-LIENS.md pour le contexte badges, palette et verbes.
> Ce plan décrit l'ajout du type Évaluation dans la carte mentale et le lien entre les activités et les évaluations dans l'Organisateur.
>
> **Dépendances externes** : ce plan lit des données du module Construction de la note via `db.getSync(window.cle('...'), valeurParDefaut)`. La fonction `window.cle()` est définie dans `js/trimestres.js` et retourne une clé préfixée par le trimestre actif (ex. `h2026_productions`). L'API `db.getSync()` / `db.setSync()` est définie dans `js/db.js` (IndexedDB avec fallback localStorage).

---

## 1. Nouveau type « Évaluation » dans la carte mentale

### Ajout à la palette

La palette reçoit une cinquième catégorie pédagogique :

```
POURQUOI enseigner          (intention curriculaire)
  ● Compétence
  ● Idée maîtresse

QUOI enseigner              (contenu)
  ● Information
  ● Stratégie
  ● Condition

COMMENT enseigner           (mise en action)
  ● Apprentissage
  ● Soutien
  ● Révision

VÉRIFIER l'apprentissage    (preuve de réussite)
  ◆ Évaluation

STRUCTURE                   (organisation)
  ⬡ Séquence
  ⬡ Leçon
```

### Propriétés visuelles

- Couleur : violet (#8B5CF6) — distincte des autres familles.
- Pastille : ◆ (losange) plutôt que ● (rond) pour signaler visuellement que c'est un type différent, lié à un module externe.
- Le label de type sur la carte (« ÉVALUATION ») est en violet, conformément à la règle du plan badges (couleur du label = couleur du contour).

### Placement dans la carte

Une Évaluation peut être placée :

1. **À l'intérieur d'une Leçon** — évaluation formative ou sommative liée à une séance spécifique.
2. **À l'intérieur d'une Séquence (mais hors d'une Leçon)** — examen de fin de séquence couvrant plusieurs leçons.
3. **En dehors de tout conteneur** — évaluation transversale (examen de mi-session, examen final).

Les trois placements sont valides. Le badge de validation tient compte du contexte (voir section 3).

---

## 2. Verbes de liens pour l'Évaluation

Ajouts à la table des verbes définie dans PLAN-BADGES-PALETTE-LIENS.md :

| Source | Cible | Verbe affiché | Direction de lecture |
|---|---|---|---|
| Évaluation | Idée maîtresse | **évalue** | « L'évaluation *évalue* l'idée maîtresse » |
| Évaluation | Connaissance (tout type) | **vérifie** | « L'évaluation *vérifie* la connaissance » |

### Règles

- Un lien Évaluation → Idée maîtresse signifie que l'évaluation sert de preuve que l'objectif est atteint.
- Un lien Évaluation → Connaissance (Information, Stratégie ou Condition) signifie que l'évaluation porte sur cette connaissance spécifique.
- Les liens inverses sont auto-inversés comme pour les autres types (voir plan badges, section 4, règle 5).
- Aucun autre couple impliquant Évaluation n'est valide : pas de lien Évaluation → Activité (ce lien se fait dans l'Organisateur, pas dans la carte), pas de lien Évaluation → Compétence (la compétence est évaluée indirectement via les idées maîtresses).

---

## 3. Badge de validation pour l'Évaluation

### Règle du badge

| Type | Condition pour badge coloré | Message au survol si gris |
|---|---|---|
| Évaluation | Au moins un lien sortant « évalue » vers une Idée maîtresse OU au moins un lien sortant « vérifie » vers une Connaissance | « Cette évaluation n'est reliée à aucun objectif ni connaissance » |

### Impact sur les badges existants

Deux règles existantes sont enrichies :

**Idée maîtresse** — La condition pour un badge coloré complet devient :
1. Au moins une Leçon la vise (lien entrant « vise ») — déjà en place.
2. Elle est reliée à au moins une Compétence (lien sortant « développe ») — déjà en place.
3. **Nouveau** : au moins une Évaluation la cible (lien entrant « évalue »).

Si les conditions 1 et 2 sont remplies mais pas la condition 3, le badge reste **coloré** mais un indicateur secondaire apparaît : un petit triangle d'avertissement (⚠) à côté du badge, avec le message au survol : « Cette idée n'est formellement évaluée dans aucune évaluation. »

> Justification : une idée maîtresse sans évaluation formelle n'est pas invalide (elle peut être évaluée de façon formative), mais l'enseignant devrait en être conscient. Le triangle est un avertissement, pas une erreur.

**Leçon** — Pas de changement. La présence d'une Évaluation dans la leçon n'est pas requise pour le badge vert (toutes les leçons ne comportent pas d'évaluation).

### Pseudocode

```javascript
// Ajout au switch de evaluerBadge() :

case 'evaluation':
  const evalueIM = liensSortants.some(l => l.verbe === 'evalue');
  const verifieConn = liensSortants.some(l => l.verbe === 'verifie');
  if (!evalueIM && !verifieConn)
    return { valide: false, message: "Cette évaluation n'est reliée à aucun objectif ni connaissance" };
  return { valide: true };

// Modification du case 'idee-maitresse' :

case 'idee-maitresse':
  const devComp = liensSortants.some(l => l.verbe === 'developpe');
  const viseeParLecon = liensEntrants.some(l => l.verbe === 'vise');
  if (!devComp) return { valide: false, message: "Cette idée ne développe aucune compétence" };
  if (!viseeParLecon) return { valide: false, message: "Cette idée n'est visée par aucune leçon" };
  // Avertissement (non bloquant) si aucune évaluation ne cible cette idée
  const evalueParEval = liensEntrants.some(l => l.verbe === 'evalue');
  return {
    valide: true,
    avertissement: evalueParEval ? null : "Cette idée n'est formellement évaluée dans aucune évaluation"
  };
```

### Rendu du triangle d'avertissement

> **Note** : cette version de `rendreBadge()` **remplace** celle définie dans PLAN-BADGES-PALETTE-LIENS.md. Elle ajoute la gestion du champ `avertissement` (triangle ⚠) en plus du badge gris/coloré existant.

```javascript
function rendreBadge(noeud, resultat) {
  const badge = noeud.elementDOM.querySelector('.badge-validation')
    || creerElementBadge(noeud);
  const triangleAvert = noeud.elementDOM.querySelector('.badge-avertissement');

  if (resultat.valide) {
    badge.style.backgroundColor = COULEURS[noeud.type];
    badge.title = 'Alignement complet';
    // Gestion de l'avertissement non bloquant
    if (resultat.avertissement) {
      if (!triangleAvert) creerTriangleAvertissement(noeud);
      triangleAvert.title = resultat.avertissement;
      triangleAvert.style.display = 'inline';
    } else if (triangleAvert) {
      triangleAvert.style.display = 'none';
    }
  } else {
    badge.style.backgroundColor = '#ccc';
    badge.title = resultat.message;
    if (triangleAvert) triangleAvert.style.display = 'none';
  }
}

// Triangle : caractère ⚠, font-size 8px, position absolute, top: 4px, right: 16px (à gauche du badge)
// Couleur : #F59E0B (amber)
```

---

## 4. Lien activité–évaluation dans l'Organisateur

### Contexte

Dans le panneau Organisateur (séances), le Cœur de la leçon affiche la liste des activités (Apprentissage, Soutien, Révision) et des connaissances contenues dans la leçon. Chaque activité peut être :

- **Formative** — pas d'évaluation certificative, seulement une rétroaction.
- **Liée à une évaluation** — l'activité sert de support à une production évaluée formellement.

### Affichage par activité dans le Cœur de la leçon

Chaque activité dans le Cœur de la leçon affiche deux sous-éléments :

```
● Analyse de «Pour que nous puissions vivre»          [APPRENTISSAGE]
  ├─ Rétroaction : [sélecteur : aucune | orale | écrite | par les pairs]
  └─ Production  : [sélecteur : aucune | liste des productions]

● Rédaction analytique du texte «Marine»               [APPRENTISSAGE]
  ├─ Rétroaction : écrite
  └─ Production  : Analyse littéraire 1 (15 %)         ← tiré de Construction de la note
       └─ Grille : SRPNF · Échelle : IDME              ← affiché en lecture seule
```

### Sélecteur « Rétroaction »

Menu déroulant avec quatre options :
- Aucune
- Orale
- Écrite
- Par les pairs

Valeur par défaut : Aucune. Ce champ est indépendant de la production : une activité peut avoir une rétroaction ET une production, ou seulement l'un des deux, ou aucun.

### Sélecteur « Production »

Menu déroulant qui liste les productions définies dans le module Construction de la note.

#### Source des données

```javascript
function chargerProductions() {
  // Lecture depuis le module Construction de la note
  const productions = db.getSync(window.cle('productions'), []);
  // Filtrer : seulement les productions actives
  return productions
    .filter(p => p.estActive)
    .map(p => ({
      id: p.id,
      nom: p.nom,
      type: p.type,                    // "examen", "travail", "projet", "quiz"
      ponderation: p.ponderation,      // 0-100
      grilleId: p.grilleId,
      dateEcheance: p.dateEcheance
    }));
}
```

#### Affichage dans le sélecteur

Chaque option affiche : `{nom} ({pondération} %)`.
Exemple : `Analyse littéraire 1 (15 %)`, `Examen mi-session (30 %)`.

Les options sont regroupées par type :

```
── Travaux ──
  Analyse littéraire 1 (15 %)
  Analyse littéraire 2 (15 %)
── Examens ──
  Examen mi-session (30 %)
  Examen final (40 %)
```

#### Détails affichés après sélection

Quand une production est sélectionnée, le système charge la grille et l'échelle associées et les affiche en lecture seule sous le sélecteur :

```javascript
function afficherDetailsProduction(productionId) {
  const productions = db.getSync(window.cle('productions'), []);
  const prod = productions.find(p => p.id === productionId);
  if (!prod) return null;

  const grilles = db.getSync(window.cle('grillesTemplates'), []);
  const grille = grilles.find(g => g.id === prod.grilleId);

  const echelles = db.getSync(window.cle('echellesTemplates'), []);
  const echelle = grille ? echelles.find(e => e.id === grille.echelleId) : null;

  return {
    nomProduction: prod.nom,
    ponderation: prod.ponderation,
    type: prod.type,
    dateEcheance: prod.dateEcheance,
    nomGrille: grille?.nom || 'Aucune grille',
    nomEchelle: echelle?.nom || 'Aucune échelle',
    criteres: grille?.criteresIds || []
  };
}
```

Affichage sous le sélecteur (lecture seule, texte gris, taille réduite) :

```
Grille : SRPNF (Structure, Rigueur, Plausibilité, Nuance, Français) · Échelle : IDME
Échéance : 15 février 2026
```

Un clic sur le nom de la grille ou de la production ouvre le module Construction de la note à la page correspondante (navigation interne SPA).

---

## 5. Persistance des données

### Structure de stockage

Les choix de rétroaction et de production pour chaque activité sont stockés dans la clé existante `{trimestre}_planification_seances` (définie dans le dossier d'intégration).

Ajout au schéma de la séance :

```javascript
// Structure existante d'une séance (simplifié) :
{
  leconId: string,
  objectifPersonnalise: string | null,
  enseignementExplicite: boolean,
  etapes: { ... },

  // NOUVEAU : détails par activité
  activites: {
    [activiteId]: {
      retroaction: 'aucune' | 'orale' | 'ecrite' | 'pairs',
      productionId: string | null         // null = formative, sinon ID de la production
    }
  }
}
```

### Lecture et écriture

```javascript
function sauvegarderChoixActivite(leconId, activiteId, retroaction, productionId) {
  const seances = db.getSync(window.cle('planification_seances'), {});
  if (!seances[leconId]) seances[leconId] = {};
  if (!seances[leconId].activites) seances[leconId].activites = {};

  seances[leconId].activites[activiteId] = {
    retroaction: retroaction,
    productionId: productionId || null
  };

  db.setSync(window.cle('planification_seances'), seances);
}

function chargerChoixActivite(leconId, activiteId) {
  const seances = db.getSync(window.cle('planification_seances'), {});
  return seances[leconId]?.activites?.[activiteId] || {
    retroaction: 'aucune',
    productionId: null
  };
}
```

---

## 6. Synchronisation carte mentale ↔ Organisateur

### Principe de cohérence

L'élément Évaluation dans la carte mentale et la production liée dans l'Organisateur sont deux représentations du même concept à des niveaux différents :

- **Carte mentale** : l'Évaluation montre l'intention d'alignement (quelle idée maîtresse ou connaissance est évaluée).
- **Organisateur** : la production liée à une activité montre la réalisation concrète (quelle production, quelle grille, quelle pondération).

Ces deux niveaux ne sont pas synchronisés automatiquement. L'enseignant peut :
- Poser une Évaluation dans la carte sans l'avoir encore liée à une activité dans l'Organisateur.
- Lier une production à une activité dans l'Organisateur sans avoir posé l'Évaluation correspondante dans la carte.

### Signal visuel de cohérence

Quand une Évaluation est dans la carte mentale à l'intérieur d'une leçon, l'Organisateur affiche un rappel discret dans l'entête de la section Cœur de la leçon :

```
CŒUR DE LA LEÇON
⚠ 1 évaluation dans la carte n'est reliée à aucune activité ci-dessous.
```

Ce message apparaît si :
1. Une carte de type « evaluation » est contenue dans cette leçon (dans la carte mentale).
2. Aucune des activités de cette leçon n'a de `productionId` non null dans l'Organisateur.

C'est un avertissement informatif, pas un blocage.

---

## 7. Résumé des modifications

| Composant | Modification |
|---|---|
| Palette (HTML/JS) | Ajouter catégorie VÉRIFIER avec type Évaluation |
| Carte — rendu | Couleur violet, pastille losange, badge et triangle d'avertissement |
| Carte — liens | Deux nouveaux verbes : « évalue » et « vérifie » |
| Carte — validation | Nouveau case 'evaluation' dans `evaluerBadge()` ; modification du case 'idee-maitresse' pour l'avertissement |
| Organisateur — Cœur | Sous chaque activité : sélecteur Rétroaction + sélecteur Production |
| Organisateur — lecture | `chargerProductions()` lit `{trim}_productions` depuis Construction de la note |
| Organisateur — détails | `afficherDetailsProduction()` affiche grille, échelle, échéance en lecture seule |
| Stockage | Ajout de `activites: { [id]: { retroaction, productionId } }` dans `{trim}_planification_seances` |
| CSS | Styles pour la couleur violet, le triangle d'avertissement amber, les détails production en lecture seule |
