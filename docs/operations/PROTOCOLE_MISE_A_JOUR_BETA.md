# Protocole de mise a jour des Beta

**Version** : 1.1
**Date** : 10 janvier 2026
**Auteur** : Gregoire Bedard / Claude Code

---

## REGLE IMPORTANTE : Numerotation manuelle

**La numerotation des versions n'est JAMAIS automatique.**

Au debut de chaque session de travail, Claude doit demander :

> "Souhaites-tu incrementer le numero de version pour cette session ?"
> - Oui → Passer a 95.X+1 (ou build suivant)
> - Non → Rester sur la version actuelle

**Raisons** :
- Plusieurs sessions peuvent concerner la meme version
- Un petit correctif ne merite pas toujours un nouveau numero
- L'utilisateur garde le controle sur le versioning

---

## Vue d'ensemble

Ce protocole decrit les etapes pour publier une nouvelle version beta de l'application Monitorage Pedagogique.

### Types de mises a jour

| Type | Exemple | Quand | Archivage |
|------|---------|-------|-----------|
| **Build** | 95.3 build 0109-1200 | Chaque commit significatif | Non |
| **Version mineure** | 95.3 → 95.4 | Nouvelles fonctionnalites | Non |
| **Version majeure** | 95 → 96 | Changements structurels | Oui |

---

## Fichiers a modifier

### Toujours (chaque build)

| Fichier | Element | Exemple |
|---------|---------|---------|
| `index.html:14122` | `BUILD_ID` | `'0109-1200'` |
| `SESSION.md:4` | Version build | `Beta 95.3 (build 0109-1200)` |
| `SESSION.md:182` | Timestamp | `9 janvier 2026, 12:00 (Toronto)` |

### Version mineure (95.3 → 95.4)

| Fichier | Lignes | Element |
|---------|--------|---------|
| `index.html:6` | `<title>` | `Beta 95.4 - Hiver 2026` |
| `index.html:3101` | Header | `Beta 95.4` |
| `index.html:3182` | Modal titre | `Bienvenue dans la Beta 95.4` |
| `index.html:3208+` | Nouveautes | Ajouter section Beta 95.4 |
| `SESSION.md` | Partout | Mettre a jour version |
| `Documentation/Changelogs/BETA_95_CHANGELOG.md` | | Ajouter entree |

### Version majeure (95 → 96)

Tout ce qui precede, plus :

| Action | Details |
|--------|---------|
| Archiver version precedente | `Archives/Beta-95-x/` |
| Creer nouveau changelog | `BETA_96_CHANGELOG.md` |
| Mettre a jour ROADMAP | `docs/ROADMAP_H2026.md` |
| Communication testeurs | Message complet (voir section) |

---

## Checklist pre-publication

```
[ ] Code teste localement
[ ] Pas d'erreurs console (F12)
[ ] Syntaxe JS valide (node --check js/*.js)
[ ] Fonctionnalites cles verifiees :
    [ ] Chargement page
    [ ] Accordeons Trimestre
    [ ] Dropdown groupe-cours
    [ ] Import/Export
```

---

## Procedure standard (build)

### 1. Mettre a jour BUILD_ID

```javascript
// index.html ligne ~14122
const BUILD_ID = 'MMJJ-HHMM';  // Format: mois-jour-heure-minute
```

### 2. Mettre a jour SESSION.md

```markdown
**Version** : Beta 95.3 (build MMJJ-HHMM)
...
**Derniere mise a jour** : [date], HH:MM (Toronto)
```

### 3. Commit et push

```bash
git add .
git commit -m "Description des changements"
git push
```

---

## Procedure version mineure

### 1. Incrementer version

Modifier dans `index.html` :
- Ligne 6 : `<title>`
- Ligne 3101 : Header version
- Ligne 3182 : Modal bienvenue

### 2. Ajouter section nouveautes

Dans `index.html`, apres ligne 3208, ajouter :

```html
<!-- Nouveautes Beta 95.X -->
<div style="...">
    <strong>Nouveautes Beta 95.X :</strong>
    <ul>
        <li>Fonctionnalite 1</li>
        <li>Fonctionnalite 2</li>
    </ul>
</div>
```

### 3. Mettre a jour changelog

Dans `Documentation/Changelogs/BETA_95_CHANGELOG.md` :

```markdown
## Beta 95.X (date)

### Nouveautes
- Feature 1
- Feature 2

### Corrections
- Fix 1
```

### 4. Mettre a jour SESSION.md

- Version
- Derniere tache completee
- Historique recent

---

## Procedure version majeure

### 1. Archiver version precedente

```bash
mkdir -p Archives/Beta-95-x
cp index.html Archives/Beta-95-x/
cp styles.css Archives/Beta-95-x/
cp -r js/ Archives/Beta-95-x/
cp SESSION.md Archives/Beta-95-x/
```

### 2. Creer nouveau changelog

```bash
touch Documentation/Changelogs/BETA_96_CHANGELOG.md
```

### 3. Reinitialiser SESSION.md

Nouveau fichier avec :
- Nouvelle version
- Backlog vide ou mis a jour
- Historique archive

---

## Communication testeurs

### Format message (version mineure)

```
Bienvenue dans la Beta 95.X

Pour les testeurs (dernieres 48h) :
- [Fonctionnalite 1] : Description (merci [Testeur])
- [Fonctionnalite 2] : Description
- [Correction] : Description (merci [Testeur])
```

### Format message (version majeure)

```
Bienvenue dans la Beta 96

IMPORTANT - Nouvelle version majeure

Changements structurels :
- [Changement 1]
- [Changement 2]

Migration :
- [Instructions si necessaire]

Nouvelles fonctionnalites :
- [Feature 1]
- [Feature 2]
```

### Contacts testeurs actuels

| Testeur | Discipline | Contact |
|---------|------------|---------|
| Bruno V. | Chimie organique | [a definir] |
| Olivier L. | Geographie | [a definir] |

---

## Script d'automatisation

### Usage

```bash
# Mise a jour build uniquement
./scripts/update-version.sh build

# Version mineure
./scripts/update-version.sh minor

# Version majeure (avec archivage)
./scripts/update-version.sh major
```

### Script : `scripts/update-version.sh`

Voir fichier separe : `scripts/update-version.sh`

---

## Verification post-publication

```
[ ] Page charge sans erreur
[ ] Version affichee correcte (header + modal)
[ ] BUILD_ID visible (b.XXXX-XXXX)
[ ] Nouvelles fonctionnalites testees
[ ] Git push reussi
[ ] Testeurs informes (si version mineure/majeure)
```

---

## Historique du protocole

| Version | Date | Changement |
|---------|------|------------|
| 1.1 | 10 jan 2026 | Ajout regle numerotation manuelle (demander a l'utilisateur) |
| 1.0 | 9 jan 2026 | Creation initiale |

