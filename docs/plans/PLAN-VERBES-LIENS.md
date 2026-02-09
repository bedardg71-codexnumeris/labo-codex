# Plan — Verbes de liens et direction amont → aval

> Document autonome destiné à Claude Code.
> Ce plan **remplace** la section 4 (Verbes de liens simplifiés) de PLAN-BADGES-PALETTE-LIENS.md et la section 2 (Verbes de liens pour l'Évaluation) de PLAN-EVALUATIONS.md.
> Il modifie également les tests de verbes dans le pseudocode de `evaluerBadge()` et `deriverObjectifs()` de ces deux plans.

---

## 1. Principe directeur

Tous les liens partent de l'**amont** (intention, abstraction) vers l'**aval** (réalisation, concret). La carte se lit de haut en bas comme un récit : l'intention curriculaire se décompose, se concrétise, s'acquiert par des activités et se vérifie par des évaluations.

Les verbes sont **réflexifs** : le sujet est toujours l'élément amont. « La compétence *se décline en* idées maîtresses. »

Les liens horizontaux (entre éléments de même niveau) utilisent un verbe non directionnel.

---

## 2. Anciens verbes → Nouveaux verbes

| Ancien verbe | Direction ancienne | Nouveau verbe | Direction nouvelle |
|---|---|---|---|
| développe | Idée maîtresse → Compétence | **se décline en** | Compétence → Idée maîtresse |
| vise | Leçon → Idée maîtresse | **se concrétise dans** | Idée maîtresse → Leçon |
| mobilise | Activité → Connaissance | **s'acquiert par** | Connaissance → Activité |
| évalue | Évaluation → Idée maîtresse | **se vérifie par** | Idée maîtresse → Évaluation |
| vérifie | Évaluation → Connaissance | **se vérifie par** | Connaissance → Évaluation |
| requiert | Connaissance → Connaissance | **s'appuie sur** | *(inchangé, horizontal)* |
| s'appuie sur | Idée maîtresse → Idée maîtresse | **s'appuie sur** | *(inchangé, horizontal)* |

### Changements majeurs

1. **La direction est inversée** pour les liens verticaux. Avant : l'aval pointait vers l'amont (Leçon → Idée maîtresse). Maintenant : l'amont pointe vers l'aval (Idée maîtresse → Leçon).

2. **Les deux verbes « évalue » et « vérifie » fusionnent** en un seul verbe « se vérifie par ». La distinction entre Évaluation → Idée maîtresse et Évaluation → Connaissance n'est plus nécessaire puisque la direction s'inverse : c'est l'objectif ou la connaissance qui « se vérifie par » l'évaluation.

3. **« requiert » devient « s'appuie sur »** pour unifier le vocabulaire des liens horizontaux.

---

## 3. Table des verbes complète

| Amont (source) | Aval (cible) | Verbe | Identifiant code | Lecture naturelle |
|---|---|---|---|---|
| Compétence | Idée maîtresse | **se décline en** | `se_decline_en` | « Analyser un texte littéraire *se décline en* Adopter une posture analytique » |
| Idée maîtresse | Leçon | **se concrétise dans** | `se_concretise_dans` | « Adopter une posture analytique *se concrétise dans* Séance 1 » |
| Connaissance | Activité | **s'acquiert par** | `s_acquiert_par` | « Méthode d'annotation *s'acquiert par* Annoter le texte Marine » |
| Idée maîtresse | Évaluation | **se vérifie par** | `se_verifie_par` | « Adopter une posture analytique *se vérifie par* Analyse littéraire 1 » |
| Connaissance | Évaluation | **se vérifie par** | `se_verifie_par` | « Procédés littéraires *se vérifie par* Examen mi-session » |
| Connaissance | Connaissance | **s'appuie sur** | `s_appuie_sur` | « Procédés littéraires *s'appuie sur* Postures de lecture » |
| Idée maîtresse | Idée maîtresse | **s'appuie sur** | `s_appuie_sur` | « Appliquer des stratégies *s'appuie sur* Adopter une posture analytique » |

### Règle d'inversion automatique

Quand l'enseignant tire un lien dans le sens aval → amont (par exemple, de Leçon vers Idée maîtresse), le système inverse automatiquement la direction pour obtenir amont → aval et applique le bon verbe (« se concrétise dans »).

```javascript
const TABLE_VERBES = {
  'competence->idee-maitresse':        'se_decline_en',
  'idee-maitresse->lecon':             'se_concretise_dans',
  'connaissance->activite':            's_acquiert_par',   // connaissance = information|strategie|condition
  'idee-maitresse->evaluation':        'se_verifie_par',
  'connaissance->evaluation':          'se_verifie_par',
  'connaissance->connaissance':        's_appuie_sur',
  'idee-maitresse->idee-maitresse':    's_appuie_sur'
};

// Types qui comptent comme « connaissance » pour la table
const TYPES_CONNAISSANCE = ['information', 'strategie', 'condition'];
// Types qui comptent comme « activité »
const TYPES_ACTIVITE = ['apprentissage', 'soutien', 'revision'];

function determinerVerbe(sourceType, cibleType) {
  // Normaliser les types pour la recherche
  const src = TYPES_CONNAISSANCE.includes(sourceType) ? 'connaissance' :
              TYPES_ACTIVITE.includes(sourceType) ? 'activite' : sourceType;
  const cbl = TYPES_CONNAISSANCE.includes(cibleType) ? 'connaissance' :
              TYPES_ACTIVITE.includes(cibleType) ? 'activite' : cibleType;

  // Chercher dans l'ordre normal (amont → aval)
  const cleNormale = `${src}->${cbl}`;
  if (TABLE_VERBES[cleNormale]) {
    return { verbe: TABLE_VERBES[cleNormale], source: sourceType, cible: cibleType, inverse: false };
  }

  // Chercher dans l'ordre inverse (l'enseignant a tiré aval → amont)
  const cleInverse = `${cbl}->${src}`;
  if (TABLE_VERBES[cleInverse]) {
    return { verbe: TABLE_VERBES[cleInverse], source: cibleType, cible: sourceType, inverse: true };
  }

  // Aucun lien valide
  return null;
}
```

### Liens invalides

Comme dans PLAN-BADGES-PALETTE-LIENS.md, les combinaisons non listées dans la table sont refusées. Message affiché : « Ce lien n'est pas possible entre [type source] et [type cible]. »

---

## 4. Affichage sur la carte

Le verbe s'affiche au milieu de la flèche :

- Police : italique, 0.75em, couleur `#888`.
- La flèche pointe de l'amont vers l'aval (de la source vers la cible).
- Pour les verbes longs (« se concrétise dans »), le texte est centré et tronqué si la flèche est trop courte (tooltip au survol pour le texte complet).

### Labels d'affichage (forme courte)

Pour gagner de l'espace sur la carte, les verbes affichés sont les formes courtes :

| Identifiant code | Affiché sur la flèche |
|---|---|
| `se_decline_en` | *se décline en* |
| `se_concretise_dans` | *se concrétise dans* |
| `s_acquiert_par` | *s'acquiert par* |
| `se_verifie_par` | *se vérifie par* |
| `s_appuie_sur` | *s'appuie sur* |

```javascript
const LABELS_VERBES = {
  'se_decline_en':        'se décline en',
  'se_concretise_dans':   'se concrétise dans',
  's_acquiert_par':       "s'acquiert par",
  'se_verifie_par':       'se vérifie par',
  's_appuie_sur':         "s'appuie sur"
};
```

---

## 5. Impact sur evaluerBadge() — correspondance des tests

Chaque test `l.verbe === '...'` dans le pseudocode des plans existants doit être mis à jour. Voici la correspondance exacte :

### Case 'competence'

```javascript
// AVANT (PLAN-BADGES L.92) :
const devParIM = liensEntrants.some(l => l.verbe === 'developpe');

// APRÈS :
// Direction inversée — maintenant la Compétence est la SOURCE, pas la cible.
// Le lien part de Compétence → Idée maîtresse (se décline en).
// Donc pour la Compétence, on cherche un lien SORTANT, pas entrant.
const seDecline = liensSortants.some(l => l.verbe === 'se_decline_en');
return seDecline
  ? { valide: true }
  : { valide: false, message: 'Aucune idée maîtresse ne décline cette compétence' };
```

### Case 'idee-maitresse'

```javascript
// AVANT (PLAN-BADGES L.99-103 + PLAN-EVALUATIONS L.114-121) :
const devComp = liensSortants.some(l => l.verbe === 'developpe');
const viseeParLecon = liensEntrants.some(l => l.verbe === 'vise');
const evalueParEval = liensEntrants.some(l => l.verbe === 'evalue');

// APRÈS :
// L'Idée maîtresse est maintenant CIBLE du lien « se décline en » (depuis Compétence)
// et SOURCE du lien « se concrétise dans » (vers Leçon).
const declineeDeComp = liensEntrants.some(l => l.verbe === 'se_decline_en');
const seConcrDansLecon = liensSortants.some(l => l.verbe === 'se_concretise_dans');
const seVerifieParEval = liensSortants.some(l => l.verbe === 'se_verifie_par');

if (!declineeDeComp) return { valide: false, message: "Cette idée n'est déclinée d'aucune compétence" };
if (!seConcrDansLecon) return { valide: false, message: "Cette idée ne se concrétise dans aucune leçon" };
return {
  valide: true,
  avertissement: seVerifieParEval ? null : "Cette idée n'est vérifiée par aucune évaluation"
};
```

### Case 'lecon'

```javascript
// AVANT (PLAN-BADGES L.138) :
const viseIM = liensSortants.some(l => l.verbe === 'vise');

// APRÈS :
// La leçon est maintenant CIBLE du lien « se concrétise dans » (depuis Idée maîtresse)
const concrDeIM = liensEntrants.some(l => l.verbe === 'se_concretise_dans');
if (!concrDeIM) messages.push("Aucune idée maîtresse ne se concrétise dans cette leçon");
```

### Case 'evaluation'

```javascript
// AVANT (PLAN-EVALUATIONS L.105-106) :
const evalueIM = liensSortants.some(l => l.verbe === 'evalue');
const verifieConn = liensSortants.some(l => l.verbe === 'verifie');

// APRÈS :
// L'Évaluation est maintenant CIBLE du lien « se vérifie par » (depuis Idée maîtresse ou Connaissance)
const verifieePar = liensEntrants.some(l => l.verbe === 'se_verifie_par');
return verifieePar
  ? { valide: true }
  : { valide: false, message: "Aucun objectif ni connaissance ne se vérifie par cette évaluation" };
```

### Fonction deriverObjectifs()

```javascript
// AVANT (PLAN-BADGES L.231-232) :
const ideesVisees = etat.liens
  .filter(l => l.noeudSource === leconId && l.verbe === 'vise')
  .map(l => etat.noeuds.get(l.noeudCible))
  .filter(n => n?.type === 'idee-maitresse');

// APRÈS :
// La Leçon est maintenant CIBLE du lien « se concrétise dans » depuis les Idées maîtresses.
// On cherche les liens ENTRANTS vers cette leçon avec le verbe 'se_concretise_dans'.
const tousLesLiens = Array.from(etat.liens.values());
const ideesVisees = tousLesLiens
  .filter(l => l.cible === leconId && l.verbe === 'se_concretise_dans')
  .map(l => etat.noeuds.get(l.source))
  .filter(n => n?.type === 'idee-maitresse');
```

---

## 6. Migration des liens existants

Les cartes existantes utilisent les anciens verbes et les anciennes directions. Au chargement, une migration automatique transforme les liens :

```javascript
const MIGRATION_VERBES = {
  'developpe':  { nouveauVerbe: 'se_decline_en',        inverserDirection: true },
  'vise':       { nouveauVerbe: 'se_concretise_dans',   inverserDirection: true },
  'mobilise':   { nouveauVerbe: 's_acquiert_par',       inverserDirection: true },
  'evalue':     { nouveauVerbe: 'se_verifie_par',       inverserDirection: true },
  'verifie':    { nouveauVerbe: 'se_verifie_par',       inverserDirection: true },
  'requiert':   { nouveauVerbe: 's_appuie_sur',         inverserDirection: false },
  's_appuie_sur': null  // Déjà à jour
};

function migrerLiens() {
  let modifie = false;
  for (const [id, lien] of etat.liens) {
    const migration = MIGRATION_VERBES[lien.verbe || lien.type];
    if (migration) {
      if (migration.inverserDirection) {
        const ancienneSource = lien.source;
        lien.source = lien.cible;
        lien.cible = ancienneSource;
      }
      lien.verbe = migration.nouveauVerbe;
      // Supprimer l'ancien champ 'type' s'il existait
      if (lien.type && lien.type !== lien.verbe) delete lien.type;
      modifie = true;
    }
  }
  if (modifie) sauvegarder();
}
```

Cette migration est appelée une seule fois au chargement de la carte. Les liens déjà migrés (qui ont les nouveaux verbes) ne sont pas affectés.

---

## 7. Résumé visuel du flux

```
Compétence
    │ se décline en
    ▼
Idée maîtresse ──s'appuie sur──▶ Idée maîtresse
    │ se concrétise dans          │ se vérifie par
    ▼                             ▼
Leçon                         Évaluation
    │ (contient)                  ▲
    ▼                             │ se vérifie par
Connaissance ──s'appuie sur──▶ Connaissance
    │ s'acquiert par
    ▼
Activité
```

Lecture : « La compétence *se décline en* idées maîtresses, qui *se concrétisent dans* des leçons. Les connaissances *s'acquièrent par* des activités et *se vérifient par* des évaluations. »

---

## 8. Résumé des fichiers à modifier

| Fichier | Modification |
|---|---|
| PLAN-BADGES-PALETTE-LIENS.md, section 4 | Remplacée par ce plan |
| PLAN-EVALUATIONS.md, section 2 | Remplacée par ce plan |
| Carte — gestion des liens | `TABLE_VERBES`, `determinerVerbe()`, `LABELS_VERBES` |
| Carte — création de lien | Inversion automatique si l'enseignant tire aval → amont |
| Carte — affichage des liens | Étiquettes des verbes sur les flèches |
| Carte — validation (`evaluerBadge()`) | Tous les tests `l.verbe ===` mis à jour (section 5 ci-dessus) |
| Organisateur — `deriverObjectifs()` | Inverser la direction de recherche (section 5) |
| Migration | `migrerLiens()` au chargement pour transformer les anciens verbes et directions |
