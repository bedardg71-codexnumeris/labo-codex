# Plan — Clonage d'éléments (remplace la duplication simple)

> Document autonome destiné à Claude Code.
> Prérequis : lire PLAN-BADGES-PALETTE-LIENS.md et PLAN-EVALUATIONS.md.
> Ce plan transforme la fonction de duplication simple en un système de clonage avec partage d'identité et propagation des modifications.

---

## 1. Problème résolu

La duplication simple crée une copie indépendante d'un nœud. Les deux copies n'ont aucun lien entre elles : si on modifie le titre de l'une, l'autre ne change pas. Le système ne sait pas qu'il s'agit du même élément pédagogique.

Le clonage résout ceci : toutes les instances d'un même élément partagent la même identité. Le système peut alors répondre à des questions comme « cet objectif est-il évalué quelque part ? » en parcourant tous les clones d'une même Évaluation, peu importe dans quelle leçon ils se trouvent.

---

## 2. Modèle de données

### Nouveau champ : `cloneSourceId`

Chaque nœud reçoit un nouveau champ optionnel :

```javascript
const donnees = {
  id,                    // STRING: identifiant unique de cette instance ("noeud_42")
  type,                  // STRING: 'competence', 'information', 'evaluation', etc.
  titre,                 // STRING: titre affiché
  description,           // STRING: description ou notes
  x,                     // NUMBER: position horizontale (locale à l'instance)
  y,                     // NUMBER: position verticale (locale à l'instance)
  parent,                // STRING|NULL: id du conteneur parent (local à l'instance)
  enfants,               // ARRAY: ids des enfants (local à l'instance)
  metadata,              // OBJECT: métadonnées

  // NOUVEAU
  cloneSourceId: null    // STRING|NULL: id de l'élément source partagé
};
```

### Logique d'identité

- **Nœud original** : `cloneSourceId` est `null`. C'est un élément unique, non cloné.
- **Nœud cloné** : `cloneSourceId` pointe vers l'`id` du premier nœud créé (l'original).
- Tous les clones d'un même élément partagent le même `cloneSourceId`.
- L'original a `cloneSourceId: null` — c'est lui qui sert de référence.

### Fonction utilitaire : trouver tous les clones

```javascript
function trouverClones(noeudId) {
  const noeud = etat.noeuds.get(noeudId);
  if (!noeud) return [];

  // Déterminer l'identité source
  const sourceId = noeud.cloneSourceId || noeud.id;

  // Trouver tous les noeuds partageant cette identité
  const clones = [];
  for (const [id, n] of etat.noeuds) {
    if (id === sourceId || n.cloneSourceId === sourceId) {
      clones.push(n);
    }
  }
  return clones;
}

function estClone(noeudId) {
  const noeud = etat.noeuds.get(noeudId);
  return noeud?.cloneSourceId != null;
}

function aDesClones(noeudId) {
  const noeud = etat.noeuds.get(noeudId);
  if (!noeud) return false;
  // Vérifier si d'autres nœuds pointent vers celui-ci comme source
  for (const [id, n] of etat.noeuds) {
    if (n.cloneSourceId === noeudId) return true;
  }
  return false;
}
```

---

## 3. Comportement du clonage

### Ce qui est partagé (synchronisé entre tous les clones)

| Propriété | Propagation |
|---|---|
| `titre` | Oui — modifier dans un clone met à jour tous les clones |
| `description` | Oui — idem |
| `type` | Immuable — ne change jamais après création |

### Ce qui est local (propre à chaque instance)

| Propriété | Raison |
|---|---|
| `id` | Chaque instance a son identifiant unique |
| `x`, `y` | Position sur le canevas |
| `parent` | Le clone peut être dans une leçon différente |
| `enfants` | Seulement pour les conteneurs (cas rare de clonage) |
| `metadata` | Peut varier selon le contexte |
| liens | Les liens sont contextuels — chaque instance a ses propres liens (y compris le verbe) |

### Propagation des modifications

```javascript
function propagerModification(noeudId, champ, valeur) {
  // Champs synchronisés
  const champsSynchro = ['titre', 'description'];
  if (!champsSynchro.includes(champ)) return;

  const clones = trouverClones(noeudId);
  for (const clone of clones) {
    clone[champ] = valeur;
    // Mettre à jour le DOM de chaque clone
    const el = document.getElementById(clone.id);
    if (el) mettreAJourAffichageNoeud(el, clone);
  }
  sauvegarder();
}
```

Cette fonction est appelée dans le gestionnaire d'événements `input` du champ titre et du champ description dans le panneau d'édition :

```javascript
// Dans le gestionnaire du panneau (existant, à modifier)
document.getElementById('panneau-titre').addEventListener('input', (e) => {
  const noeud = etat.noeuds.get(etat.selection);
  if (!noeud) return;
  noeud.titre = e.target.value;
  // NOUVEAU : propager aux clones
  propagerModification(noeud.id, 'titre', e.target.value);
});
```

---

## 4. Fonction de clonage

### Remplacer dupliquerNoeud() par clonerNoeud()

```javascript
function clonerNoeud(sourceId) {
  const source = etat.noeuds.get(sourceId);
  if (!source) return null;

  // L'identité source est soit le cloneSourceId existant, soit l'id du noeud
  const identiteSource = source.cloneSourceId || source.id;

  // Créer une nouvelle instance
  const nouvelId = `noeud_${++etat.compteur}`;

  const clone = {
    id: nouvelId,
    type: source.type,
    titre: source.titre,                   // Partagé (même valeur initiale)
    description: source.description,       // Partagé
    x: source.x + 60,                     // Décalé pour visibilité
    y: source.y + 60,
    parent: null,                          // Pas de parent par défaut
    enfants: [],                           // Pas d'enfants par défaut
    metadata: {},
    cloneSourceId: identiteSource          // Pointe vers l'original
  };

  etat.noeuds.set(nouvelId, clone);

  // Créer l'élément DOM
  const el = creerElementNoeud(clone);
  document.getElementById('carte').appendChild(el);
  attacherEvenements(el, clone);

  // NE PAS copier les liens — les liens sont locaux à chaque instance.
  // L'enseignant relie manuellement le clone dans son nouveau contexte.

  sauvegarder();
  return nouvelId;
}
```

### Pourquoi ne pas copier les liens

Les liens sont contextuels. Si un nœud « Information préalable : Méthode d'annotation » est dans la Leçon 1 et qu'on le clone dans la Leçon 3, les liens de la Leçon 1 (par exemple, « mobilisé par Activité X ») ne s'appliquent pas dans la Leçon 3. L'enseignant doit créer les liens pertinents dans le nouveau contexte.

### Clonage de conteneurs

Le clonage d'une Séquence ou d'une Leçon (conteneurs) est **interdit**. Un conteneur est un contexte unique — le cloner créerait une ambiguïté structurelle. Si l'enseignant veut réutiliser le contenu d'une leçon, il clone les éléments individuellement à l'intérieur d'une nouvelle leçon.

> **Clarification** : seuls les types avec `conteneur: true` sont interdits (Séquence, Leçon). Tous les autres types sont clonables, y compris les Évaluations, même si elles se trouvent à l'intérieur d'un conteneur. Un clone d'Évaluation peut être placé dans une Leçon, une Séquence, ou hors de tout conteneur (voir PLAN-EVALUATIONS.md, section 1).

```javascript
function clonerNoeud(sourceId) {
  const source = etat.noeuds.get(sourceId);
  if (!source) return null;

  // Interdire le clonage des conteneurs
  const config = TYPES[source.type];
  if (config.conteneur) {
    afficherMessage("Les conteneurs ne peuvent pas être clonés. Clonez les éléments à l'intérieur.");
    return null;
  }

  // ... reste de la fonction
}
```

---

## 5. Indicateur visuel 🧬

### Sur la carte

Chaque nœud cloné affiche l'émoji 🧬 dans le coin supérieur gauche de la carte (le badge d'alignement occupe déjà le coin supérieur droit).

```javascript
function ajouterIndicateurClone(el, noeud) {
  if (!noeud.cloneSourceId) return;

  const indicateur = document.createElement('span');
  indicateur.className = 'indicateur-clone';
  indicateur.textContent = '🧬';
  indicateur.title = `Clone — ${trouverClones(noeud.id).length} instance(s)`;
  el.appendChild(indicateur);
}
```

### Style CSS

```css
.indicateur-clone {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 10px;
  cursor: help;
  opacity: 0.8;
  z-index: 2;
}
```

### Survol de l'indicateur

Au survol de 🧬, le tooltip affiche « Clone — 3 instance(s) ». Optionnellement, tous les autres clones du même élément reçoivent une surbrillance temporaire (bordure pulsante) pour que l'enseignant voie d'un coup d'œil où se trouvent les autres instances.

```javascript
indicateur.addEventListener('mouseenter', () => {
  const clones = trouverClones(noeud.id);
  for (const c of clones) {
    if (c.id === noeud.id) continue; // Pas soi-même
    const el = document.getElementById(c.id);
    if (el) el.classList.add('clone-surbrillance');
  }
});

indicateur.addEventListener('mouseleave', () => {
  document.querySelectorAll('.clone-surbrillance')
    .forEach(el => el.classList.remove('clone-surbrillance'));
});
```

```css
.clone-surbrillance {
  animation: pulse-clone 0.8s ease-in-out 3;
}

@keyframes pulse-clone {
  0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
  50% { box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.4); }
}
```

### L'original aussi porte l'indicateur

Si un nœud a des clones (mais est lui-même l'original, avec `cloneSourceId: null`), il reçoit aussi l'indicateur 🧬. Cela permet à l'enseignant de savoir que cet élément a été cloné ailleurs.

```javascript
function doitAfficherIndicateurClone(noeud) {
  // C'est un clone
  if (noeud.cloneSourceId) return true;
  // C'est un original qui a des clones
  if (aDesClones(noeud.id)) return true;
  return false;
}
```

---

## 6. Impact sur les badges de validation

### Principe : les liens de tous les clones comptent

Quand `evaluerBadge()` vérifie les liens d'un nœud, elle doit considérer les liens de **toutes les instances** du même élément, pas seulement ceux de l'instance locale.

### Modification de evaluerBadge()

> **Note sur les noms de propriétés** : dans le code existant, `etat.liens` est un `Map<id, lien>` et chaque lien utilise les champs `source` et `cible` (pas `noeudSource`/`noeudCible`). Le champ du verbe est `type` dans le code existant. Les plans PLAN-BADGES et PLAN-EVALUATIONS utilisent `verbe` dans leur pseudocode. Claude Code doit s'adapter aux noms réels du code en place.

```javascript
function evaluerBadge(noeud) {
  const type = noeud.type;
  const conteneur = trouverConteneurParent(noeud.id);

  // NOUVEAU : collecter les liens de TOUTES les instances (clones compris)
  const toutesLesInstances = trouverClones(noeud.id);
  const tousLesIds = toutesLesInstances.map(n => n.id);

  // etat.liens est un Map — convertir en Array pour filtrer
  const tousLesLiens = Array.from(etat.liens.values());
  const liensEntrants = tousLesLiens.filter(l => tousLesIds.includes(l.cible));
  const liensSortants = tousLesLiens.filter(l => tousLesIds.includes(l.source));

  // ... reste du switch identique (voir PLAN-BADGES-PALETTE-LIENS.md)
  // Les conditions vérifient désormais les liens agrégés de toutes les instances
}
```

### Conséquence concrète

Exemple : une Évaluation est clonée dans les Leçons 2 et 4.
- Dans la Leçon 2, le clone est relié à l'Idée maîtresse A (lien « évalue »).
- Dans la Leçon 4, le clone est relié à l'Idée maîtresse B.
- Le badge de chaque instance est **coloré** (vert), car en agrégeant les liens de toutes les instances, l'Évaluation évalue au moins un objectif.
- L'Idée maîtresse A reçoit un lien entrant « évalue » → pas de triangle d'avertissement.
- L'Idée maîtresse B aussi → pas de triangle.

Sans clonage, chaque copie serait indépendante, et le système ne pourrait pas faire cette déduction.

---

## 7. Impact sur l'Organisateur

### Détection des productions via clones

Quand l'Organisateur affiche le Cœur de la leçon et liste les activités, il peut maintenant vérifier si un clone d'une Évaluation existe dans la même leçon. Si oui, il peut pré-remplir le sélecteur « Production » avec la production correspondante.

### Affichage du nombre d'instances

Dans le panneau de l'Organisateur, quand une connaissance ou une activité a des clones dans d'autres leçons, un indicateur discret apparaît :

```
● Méthode d'annotation efficace          [INFORMATION]  🧬 aussi dans Séance 1
```

Cela permet à l'enseignant de voir que cette connaissance est enseignée à plusieurs endroits, ce qui est une information précieuse pour la cohérence pédagogique.

---

## 8. Suppression d'un clone

### Trois cas

1. **Supprimer une instance (clone)** : supprime uniquement cette instance visuelle. Les autres instances restent intactes. Les liens locaux à cette instance sont supprimés.

2. **Supprimer l'original** : si l'original est supprimé, le premier clone existant devient le nouvel original. Son `cloneSourceId` passe à `null`, et les autres clones sont mis à jour pour pointer vers ce nouveau sourceId.

3. **Supprimer toutes les instances** : si l'enseignant supprime la dernière instance, l'élément disparaît complètement.

```javascript
function supprimerNoeud(id) {
  const noeud = etat.noeuds.get(id);
  if (!noeud) return;

  // Supprimer les liens locaux à cette instance
  for (const [lienId, lien] of etat.liens) {
    if (lien.source === id || lien.cible === id) {
      supprimerLien(lienId);
    }
  }

  // Si c'est l'original et qu'il a des clones, transférer le rôle d'original
  if (!noeud.cloneSourceId && aDesClones(id)) {
    let nouveauOriginal = null;
    for (const [nId, n] of etat.noeuds) {
      if (n.cloneSourceId === id) {
        if (!nouveauOriginal) {
          // Le premier clone devient l'original
          n.cloneSourceId = null;
          nouveauOriginal = nId;
        } else {
          // Les autres clones pointent vers le nouvel original
          n.cloneSourceId = nouveauOriginal;
        }
      }
    }
  }

  // Retirer du parent si nécessaire
  if (noeud.parent) {
    const parent = etat.noeuds.get(noeud.parent);
    if (parent) {
      parent.enfants = parent.enfants.filter(e => e !== id);
    }
  }

  // Supprimer le DOM et la donnée
  const el = document.getElementById(id);
  if (el) el.remove();
  etat.noeuds.delete(id);

  sauvegarder();
}
```

---

## 9. Interface utilisateur

### Bouton dans le panneau d'édition

Ajouter un bouton « 🧬 Cloner » dans le panneau, à côté du bouton « Supprimer ce nœud ».

```html
<div class="panneau-actions">
  <button class="btn-cloner" id="btn-cloner">🧬 Cloner</button>
  <button class="btn-supprimer" id="btn-supprimer">Supprimer ce nœud</button>
</div>
```

Le bouton est grisé (disabled) si le nœud sélectionné est un conteneur (Séquence, Leçon).

### Raccourci clavier

`Ctrl+D` (ou `Cmd+D` sur Mac) clone le nœud sélectionné. Le raccourci est inactif si la sélection est un conteneur.

### Menu contextuel (clic droit)

Si un menu contextuel existe, ajouter l'option « 🧬 Cloner ».

### Indicateur dans le panneau

Quand un nœud cloné est sélectionné, le panneau affiche sous le titre :

```
🧬 3 instances de cet élément
[Voir les autres instances]
```

Le lien « Voir les autres instances » fait pulser les autres clones sur la carte (même animation que le survol de l'indicateur).

### Note d'aide sous la palette

Sous le dernier élément de la palette, afficher un texte d'aide en gris, taille réduite (0.8em) :

```
Glisser un élément sur le canevas pour l'ajouter.
Relier deux éléments en tirant d'un port à l'autre.
Déposer un élément dans une Séquence ou une Leçon pour l'y intégrer.

🧬 Cloner un élément : sélectionne-le, puis Cmd+D.
Les informations se propagent à toutes les copies.
```

Style : `color: #888; font-size: 0.8em; line-height: 1.4; padding: 8px 12px; border-top: 1px solid #eee;`

---

## 10. Sauvegarde et chargement

### Sérialisation

Le champ `cloneSourceId` est sérialisé normalement avec le reste des données du nœud. Aucune modification au format de sauvegarde n'est nécessaire — c'est un champ supplémentaire dans l'objet nœud.

### Migration des données existantes

Les cartes existantes n'ont pas de champ `cloneSourceId`. Au chargement, si le champ est absent, il est initialisé à `null` :

```javascript
function chargerCarte(donnees) {
  for (const noeud of donnees.noeuds) {
    // Migration : ajouter cloneSourceId si absent
    if (!('cloneSourceId' in noeud)) {
      noeud.cloneSourceId = null;
    }
    etat.noeuds.set(noeud.id, noeud);
    // ... créer le DOM
  }
}
```

---

## 11. Résumé des modifications

| Composant | Modification |
|---|---|
| Modèle de données | Ajout du champ `cloneSourceId` à chaque nœud |
| Fonctions utilitaires | `trouverClones()`, `estClone()`, `aDesClones()`, `doitAfficherIndicateurClone()` |
| Clonage | `clonerNoeud()` remplace `dupliquerNoeud()` — interdit pour les conteneurs |
| Propagation | `propagerModification()` synchronise titre et description entre clones |
| Suppression | `supprimerNoeud()` modifié pour transférer le rôle d'original |
| Badges | `evaluerBadge()` agrège les liens de toutes les instances |
| Visuel carte | Indicateur 🧬 (coin supérieur gauche), surbrillance au survol |
| Panneau | Bouton « 🧬 Cloner », indicateur du nombre d'instances |
| Organisateur | Mention « 🧬 aussi dans Séance X » pour les éléments clonés |
| Raccourci | `Cmd+D` / `Ctrl+D` pour cloner |
| CSS | Classes `.indicateur-clone`, `.clone-surbrillance`, `@keyframes pulse-clone` |
| Migration | Ajout de `cloneSourceId: null` aux nœuds existants au chargement |
