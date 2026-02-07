# Rapport d'audit : Systeme de demonstration — Monitorage v6

**Date** : 6 fevrier 2026
**Version** : Beta 97.1 (Build 0206-1820)
**Auteur** : Claude Opus 4.6 (session Claude Code)
**Destinataire** : Claude Cowork
**Objectif** : Etat des lieux complet du systeme de donnees de demonstration en vue d'une refonte

---

## 1. Resume executif

Le systeme de demonstration a ete implemente trois fois en parallele sans que les versions precedentes soient retirees. Il en resulte **deux systemes de chargement incompatibles**, **deux packs de donnees contradictoires**, et **au moins 10 bugs identifies** dont 2 critiques qui rendent la demo inutilisable via le chemin principal (selecteur de mode "Assiste").

**Verdict** : Une refonte complete avec un seul systeme unifie est necessaire.

---

## 2. Architecture actuelle

### 2.1 Fichiers impliques

| Fichier | Lignes | Role |
|---------|--------|------|
| `js/donnees-demo.js` | ~520 | Systeme 1 : chargement/dechargement via mode "Assiste" |
| `js/trimestre.js` | lignes 1208-1567 | Systeme 2 : chargement/dechargement via checkbox |
| `js/trimestre-v2.js` | ligne 5006 | Delegue vers trimestre.js (Systeme 2) |
| `js/pack-demarrage.js` | ~280 | Pack de donnees JS (5 etudiants, groupe "demo") |
| `pack-demarrage-complet.json` | ~400 | Pack de donnees JSON (10 etudiants, groupe "9999") |
| `js/modes.js` | ~900 | Gestion des modes (normal/simulation/anonymisation) |
| `js/primo-modal.js` | lignes 874-1020 | Import demo via assistant Primo (references cassees) |
| `js/primo-questions.js` | ligne 1832 | Action `importerDonneesDemo` dans l'arbre Primo |
| `js/groupe.js` | lignes 85-88 | Filtrage etudiants (exclut toujours 9999) |
| `js/etudiants.js` | ligne 1374 | Appel a `filtrerEtudiantsDemo()` (no-op) |
| `js/cours.js` | lignes 374, 423 | Appel a `filtrerCoursDemo()` (no-op) |
| `js/main.js` | lignes 417-419 | Initialisation auto au demarrage |

### 2.2 Cinq chemins d'activation

| Chemin | Declencheur | Systeme | Statut |
|--------|-------------|---------|--------|
| A | Selecteur de mode "Assiste" (en-tete) | Systeme 1 (donnees-demo.js) | **Casse** (bugs 1-3) |
| B | Checkbox V1 dans Reglages > Trimestre | Systeme 2 (trimestre.js) | Partiellement fonctionnel |
| C | Checkbox V2 dans Reglages > Trimestre V2 | Delegue vers B | Partiellement fonctionnel |
| D | Action Primo "Importer donnees demo" | Fetch fichiers manquants | **Casse** (bug 4) |
| E | Automatique au demarrage si mode=simulation | Systeme 1 | **Casse** (memes bugs que A) |

---

## 3. Les deux systemes de chargement

### 3.1 Systeme 1 : `donnees-demo.js`

**Declencheur** : Selecteur de mode → "Assiste" → `changerMode('simulation')` → `chargerDonneesDemo()`

**Flux** :
1. Verifie le flag `demo-chargees`
2. Priorite 1 : variable globale `window.PACK_DEMARRAGE` (pack-demarrage.js)
3. Priorite 2 : fetch `pack-demarrage-complet.json`
4. Cree un trimestre `"demo"` temporairement, restaure le trimestre original
5. Appelle `fusionnerDonneesDemo(pack, 'demo_')` qui ecrit les donnees avec prefixe `demo_`
6. Cree un horaire `HOR_DEMO` et un groupe-cours `GC_DEMO`
7. Flag `demo-chargees = 'true'`

**Dechargement** : `dechargerDonneesDemo()` → `supprimerGroupe9999()` qui filtre par `groupe === 'demo'` et `da.startsWith('DEMO')`

**Ce qui manque** :
- Ne definit PAS `infoCours` → les donnees sont invisibles
- Ne charge PAS `cadreCalendrier` ni `horaireHebdo` → calendrier vide
- Le parsing des presences est casse (traite un Array comme Object imbrique)

### 3.2 Systeme 2 : `trimestre.js` (`basculerDonneesDemo()`)

**Declencheur** : Checkbox dans Reglages > Trimestre

**Flux** :
1. Cree/active le trimestre `"demo"` et **bascule dessus**
2. Attend `window.PACK_DEMARRAGE` (polling 30 tentatives)
3. Purge les anciennes donnees demo
4. Ecrit les donnees avec prefixe `demo_`
5. Charge les donnees calendrier (`cadreCalendrier`, `horaireHebdo`)
6. Definit `infoCours` sur le cours demo
7. Force le mode a `'simulation'`
8. **Recharge la page** (`window.location.reload()`)

**Dechargement** : Supprime toutes les donnees demo, retire le trimestre "demo", remet en mode `'normal'`, recharge la page.

### 3.3 Differences cles entre les deux systemes

| Aspect | Systeme 1 (donnees-demo.js) | Systeme 2 (trimestre.js) |
|--------|----------------------------|-------------------------|
| Bascule de trimestre | Temporaire, restaure l'original | Permanent, reste sur "demo" |
| Rechargement page | Non | Oui |
| Changement de mode | Non | Force `simulation` |
| `infoCours` | Non defini | Defini sur cours demo |
| Calendrier | Non charge | Charge |
| Source de donnees | PACK_DEMARRAGE ou JSON (fallback) | PACK_DEMARRAGE uniquement |
| Presences | Bug de format (Array vs Object) | Gestion correcte |
| Nettoyage | Incomplet (grilles/echelles restent) | Plus complet |

---

## 4. Les deux packs de donnees

### 4.1 `pack-demarrage.js` (variable globale `PACK_DEMARRAGE`)

```
Etudiants : 5 (DEMO001 a DEMO005)
Groupe : "demo"
Cours : "demo-cours" (601-101-MQ)
Trimestre : "demo"
Productions : 5 (1 portfolio + 3 artefacts + 1 examen)
Evaluations : 20
Presences : 75 entrees (15 semaines x 5 etudiants)
Grille : GRILLE_DEMO
Echelle : ECHELLE_IDME
Cartouche : CART_DEMO
Calendrier : cadreCalendrier + horaireHebdo (presents mais non charges par Systeme 1)
Format presences : Array plat [{date, da, statut, heures, coursId}, ...]
```

### 4.2 `pack-demarrage-complet.json` (fichier JSON)

```
Etudiants : 10 (9999001 a 9999010)
Groupe : "9999"
Cours : "601-101-h2026-9999"
Trimestre : "h2026" (trimestre reel, pas "demo")
Productions : 6
Evaluations : 30
Presences : 150 entrees
Format presences : Array plat [{date, da, heures, notes}, ...] (manque statut et coursId)
```

**Incompatibilite critique** : Le dechargement dans `donnees-demo.js` filtre par `groupe === 'demo'` et `da.startsWith('DEMO')`. Si le JSON (format 9999) a ete charge en fallback, le nettoyage ne trouvera rien.

---

## 5. Bugs identifies

### Bug 1 — CRITIQUE : Presences corrompues

**Fichier** : `js/donnees-demo.js`, lignes 243-260
**Cause** : `fusionnerDonneesDemo()` fait `Object.entries(presencesDemo)` sur un Array
**Effet** : Les cles deviennent `"0"`, `"1"`, `"2"` au lieu des dates. Les valeurs sont des objets plats traites comme des dictionnaires imbriques. Resultat : donnees de presences totalement corrompues.

```javascript
// Code actuel (buggue)
const presencesDemo = packDemo.presences || {};  // C'est un Array !
for (const [date, presDate] of Object.entries(presencesDemo)) {
    // date = "0", "1", "2"... (indices du tableau)
    // presDate = {date: "2025-08-26", da: "DEMO001", statut: "present", ...}
    for (const [da, pres] of Object.entries(presDate)) {
        // da = "date", "da", "statut", "heures", "coursId" (noms des champs !)
        // pres = "2025-08-26", "DEMO001", "present", 4, "demo-cours"
    }
}
```

### Bug 2 — CRITIQUE : infoCours non defini

**Fichier** : `js/donnees-demo.js`
**Cause** : `chargerDonneesDemo()` ne definit jamais `infoCours`
**Effet** : `obtenirDonneesSelonMode()` dans `modes.js` filtre toutes les donnees par `coursId === infoCours.id`. Sans `infoCours`, aucune donnee demo n'est visible dans l'interface.

### Bug 3 — MAJEUR : Calendrier non charge

**Fichier** : `js/donnees-demo.js`, fonction `fusionnerDonneesDemo()`
**Cause** : La fonction n'importe pas `cadreCalendrier` ni `horaireHebdo` du pack
**Effet** : Le module Presences (vue calendrier) et le Trimestre V2 sont vides en mode demo.

### Bug 4 — MAJEUR : Fichiers manquants (Primo)

**Fichier** : `js/primo-modal.js`, lignes 933, 965, 987, 1009
**Cause** : References a des fichiers deplaces dans Archives :
- `donnees-demo.json` (racine) → n'existe plus
- `materiel-demo/echelle-idme.json` → dossier n'existe plus
- `materiel-demo/grille-srpnf.json` → n'existe plus
- `materiel-demo/cartouches-srpnf.json` → n'existe plus

**Effet** : L'import demo via l'assistant Primo echoue silencieusement.

### Bug 5 — MOYEN : Nettoyage incomplet

**Fichier** : `js/donnees-demo.js`, fonction `supprimerGroupe9999()`
**Cause** : Ne supprime pas les entites suivantes au dechargement :
- Grilles (`GRILLE_DEMO` dans `grillesTemplates`)
- Echelles (`ECHELLE_IDME` dans `echellesTemplates`)
- Cartouches (`CART_DEMO` dans `cartouches_GRILLE_DEMO`)
- Horaires (`HOR_DEMO`)
- Groupes-cours (`GC_DEMO`)

**Effet** : Accumulation de donnees orphelines a chaque cycle chargement/dechargement.

### Bug 6 — MOYEN : Trois fonctions de filtrage conflictuelles

| Fonction | Fichier | Comportement |
|----------|---------|-------------|
| `filtrerEtudiantsDemo()` | donnees-demo.js:464-467 | No-op (retourne tout) |
| `filtrerEtudiantsParMode()` | modes.js:852-878 | Mode Assiste = demo seulement, Normal = exclut demo |
| `filtrerEtudiantsParMode()` | groupe.js:85-88 | Exclut TOUJOURS le groupe 9999 |

La version de `groupe.js` peut ecraser celle de `modes.js` selon l'ordre de chargement des scripts.

### Bug 7 — MOYEN : Definitions de trimestre contradictoires

```javascript
// donnees-demo.js
{ id: 'demo', nom: 'Demonstration', session: 'D', annee: '2025' }

// trimestre.js
{ id: 'demo', nom: '🎓 Demonstration', session: 'Demo', annee: '----' }
```

### Bug 8 — MINEUR : Checkbox V1/V2 handler

**Fichier** : `trimestre.js`, ligne 1446
Le error handler reference `document.getElementById('checkboxDonneesDemo')` (V1). Si c'est la V2 qui a declenche l'action, le V1 n'existe peut-etre pas → null reference.

### Bug 9 — MINEUR : Documentation perimee

**Fichier** : `index.html`, section Aide > Formation et demonstration
- Indique 8 semaines de presences → le pack en a 15
- Indique 4 productions → le pack en a 5
- References aux "Indices A-C-P calcules" → pas dans le pack

### Bug 10 — BRUIT : Code mort

| Fonction | Fichier | Etat |
|----------|---------|------|
| `filtrerEtudiantsDemo()` | donnees-demo.js | No-op, appelee par etudiants.js |
| `filtrerCoursDemo()` | donnees-demo.js | No-op, appelee par cours.js |
| `genererPresencesDemo()` | trimestre.js:1134 | Reference cours "9999", jamais appelee |

---

## 6. Modele de donnees requis pour une demo complete

| Entite | Cle de stockage | Namespacee | Present dans pack-demarrage.js |
|--------|----------------|------------|-------------------------------|
| Cours | `listeCours` | Non | Oui (1 cours) |
| Etudiants | `{prefix}groupeEtudiants` | Oui | Oui (5 etudiants) |
| Productions | `{prefix}productions` | Oui | Oui (5 productions) |
| Evaluations | `{prefix}evaluationsSauvegardees` | Oui | Oui (20 evaluations) |
| Presences | `{prefix}presences` | Oui | Oui (75 entrees) — **format incompatible** |
| Grilles (templates) | `grillesTemplates` | Non | Oui (1 grille) |
| Echelles (templates) | `echellesTemplates` | Non | Oui (1 echelle) |
| Cartouches | `cartouches_GRILLE_DEMO` | Non | Oui (1 cartouche) |
| Modalites | `modalitesEvaluation` | Non | Oui |
| Cadre Calendrier | `{prefix}cadreCalendrier` | Oui | Oui — **non charge par Systeme 1** |
| Horaire Hebdo | `{prefix}horaireHebdo` | Oui | Oui — **non charge par Systeme 1** |
| infoCours | `infoCours` | Non | Doit etre defini — **non defini par Systeme 1** |
| Trimestre | `trimestres` | Non | Cree par programmation |
| Horaires | `{prefix}horaires` | Oui | Cree par programmation |
| Groupes-Cours | `{prefix}groupesCours` | Oui | Cree par programmation |
| Indices A-C-P | Calcules | — | Doivent etre recalcules apres chargement |

---

## 7. Systeme de modes (contexte)

### Trois modes

| Mode | Valeur interne | Nom UI | Comportement |
|------|---------------|--------|-------------|
| Normal | `'normal'` | Normal | Donnees reelles, pas de filtrage |
| Assiste | `'simulation'` | Assiste | Donnees demo, interface guidee |
| Anonymise | `'anonymisation'` | Anonymise | Lecture seule, noms brouilles |

### Fonction centrale : `obtenirDonneesSelonMode(cle)`

Utilisee par TOUS les modules pour lire les donnees. Filtre par `coursId` du cours actif (`infoCours.id`). C'est pourquoi le bug 2 (infoCours non defini) est critique : sans cours actif correspondant, aucune donnee n'est retournee.

### Stockage du mode

- `db.setSync('modeApplication', valeur)` / `db.getSync('modeApplication')`
- Variable globale `modeActuel` dans modes.js
- Classes CSS sur `<body>` : `mode-normal`, `mode-assiste`, `mode-anonymise`
- Attribut `data-mode` sur `<body>`
- Bandeau visuel colore en bas de page pour les modes non-Normal

### Confusion de nommage

Le code utilise `'simulation'` partout en interne, mais l'UI affiche "Assiste". Des commentaires dans le code disent "CORRIGE : 'simulation' et non 'assiste'" indiquant que cette confusion a deja cause des bugs.

---

## 8. Recommandation

### Strategie proposee : Unifier en un seul systeme

1. **Un seul pack** : `pack-demarrage.js` (format "demo", 5 etudiants) — supprimer `pack-demarrage-complet.json`
2. **Un seul systeme de chargement** : dans `donnees-demo.js`, corriger les bugs 1-3-5 et integrer la logique manquante du Systeme 2 (infoCours, calendrier, nettoyage complet)
3. **Un seul chemin d'activation** : le selecteur de mode dans l'en-tete. Retirer les checkboxes V1/V2 de Reglages > Trimestre
4. **Nettoyer le code mort** : fonctions no-op, references au groupe 9999, `genererPresencesDemo()`
5. **Corriger les references Primo** : pointer vers le pack existant ou desactiver le chemin
6. **Mettre a jour la documentation** : section Aide avec les vraies statistiques du pack

### Fichiers a modifier

| Fichier | Action |
|---------|--------|
| `js/donnees-demo.js` | Refonte du chargement/dechargement (bugs 1-2-3-5) |
| `js/trimestre.js` | Retirer `basculerDonneesDemo()` et code associe |
| `js/trimestre-v2.js` | Retirer `basculerDonneesDemoV2()` |
| `js/primo-modal.js` | Corriger ou desactiver `importerDonneesDemo()` (bug 4) |
| `js/groupe.js` | Retirer `filtrerEtudiantsParMode()` dupliquee (bug 6) |
| `js/etudiants.js` | Retirer appel a `filtrerEtudiantsDemo()` (bug 10) |
| `js/cours.js` | Retirer appels a `filtrerCoursDemo()` (bug 10) |
| `index.html` | Retirer checkboxes demo, mettre a jour doc Aide (bugs 8-9) |
| `pack-demarrage-complet.json` | Supprimer ou archiver |

---

## 9. References de code (pour navigation rapide)

### Systeme 1 — donnees-demo.js
- `initialiserModuleDonneesDemo()` : ligne 485
- `chargerDonneesDemo()` : ligne 20
- `fusionnerDonneesDemo()` : ligne 185
- `dechargerDonneesDemo()` : ligne 355
- `supprimerGroupe9999()` : ligne 389
- `filtrerEtudiantsDemo()` : ligne 464 (no-op)
- Bug presences : lignes 243-260

### Systeme 2 — trimestre.js
- `basculerDonneesDemo()` : ligne 1208
- `genererPresencesDemo()` : ligne 1134 (dead code)
- Checkbox handler error : ligne 1446

### Modes — modes.js
- `obtenirDonneesSelonMode()` : ligne 521
- `filtrerEtudiantsParMode()` : ligne 852
- `changerMode()` : ligne 132
- `creerSelecteurMode()` : ligne 74

### Pack de donnees — pack-demarrage.js
- `PACK_DEMARRAGE` : ligne 1
- Etudiants : lignes 10-70
- Productions : lignes 72-130
- Evaluations : lignes 132-187
- Presences : lignes 189-279
- Calendrier : lignes 280+

### UI — index.html
- Selecteur de mode : ligne 3120
- Checkbox V1 : ligne 6932
- Checkbox V2 : ligne 10819
- Section Aide > Formation : lignes 12499-12698

---

*Fin du rapport*
