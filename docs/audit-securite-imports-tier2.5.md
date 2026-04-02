# Audit securite des imports — Tier 2.5

**Date** : 2 avril 2026
**Contexte** : Plan de consolidation avril 2026

---

## 2.5.1 Test XSS via donnees importees

### Protections en place

- **JSON.parse()** pour tous les imports (pas d'eval, pas de new Function)
- **CSP `script-src 'self'`** bloque les scripts inline meme si du HTML est injecte
- **echapperHtml()** applique sur les donnees affichees via innerHTML
- **validerZipSecurite()** verifie taille et path traversal
- **validerMagicBytes()** verifie les signatures binaires des fichiers

### Vulnerabilites corrigees (2 avril 2026)

12 occurrences initiales + 8 supplementaires trouvees par grep elargi = **20 corrections** :

| Fichier | Lignes | Donnee non echappee | Correction |
|---------|--------|---------------------|------------|
| grilles.js | 813 | `grille.baseSur` | echapperHtml() |
| grilles.js | 838-839 | `c.nom`, `c.description` (criteres templates) | echapperHtml() |
| grilles.js | 2706 | `critere.nom` (attribut value) | echapperHtml() |
| evaluation.js | 376-378 | `echellePratique.nom` (.replace() manuel) | echapperHtml() |
| evaluation.js | 385-387 | `echelle.nom` (.replace() manuel) | echapperHtml() |
| profil-etudiant.js | 1789 | `c.nom` (section Accompagnement) | echapperHtml() |
| profil-etudiant.js | 3845 | `titre` production (note finale) | echapperHtml() |
| profil-etudiant.js | 6450 | `c.nom` (Forces E) | echapperHtml() |
| profil-etudiant.js | 6466 | `c.nom` (Forces M) | echapperHtml() |
| profil-etudiant.js | 6482 | `c.nom` (Defis D) | echapperHtml() |
| profil-etudiant.js | 6498 | `c.nom` (Defis I) | echapperHtml() |
| profil-etudiant.js | 7113 | `c.nom`, `grilleActive.nom` (calcul note) | echapperHtml() |
| boite-outils.js | 782, 999 | `c.nom` (categories tags) | echapperHtml() |
| boite-outils.js | 805, 989 | `c.nom` (categories select) | echapperHtml() |
| travaux-outils.js | 848, 850 | `c.nom` (codes annotation) | echapperHtml() |
| travaux-outils.js | 1386 | `c.nom` (couleurs title) | echapperHtml() |
| productions.js | 618 | `c.nom` (cartouches select) | echapperHtml() |

### Fichier valide sans correction necessaire

- **travaux-export-pdf.js** : toutes les injections innerHTML utilisent deja echapperHtml()

---

## 2.5.2 Validation de schema des imports JSON

### Risque accepte (Beta 99)

Les imports JSON ne valident pas la structure des donnees (schema). Un fichier de backup avec des champs inattendus ou des types incorrects sera accepte. Cela ne cause pas de XSS (echapperHtml le bloque) mais pourrait corrompre les donnees silencieusement.

**Decision** : Risque accepte pour Beta 99. La validation de schema est un chantier post-AQPC.

**Justification** :
- Le vecteur d'attaque est faible (echanges entre collegues de confiance)
- Les protections anti-XSS sont en place (CSP + echapperHtml)
- L'impact est limite a la corruption de donnees locales (pas d'exfiltration)
- Le cout d'implementation d'un schema complet pour ~15 types de donnees est disproportionne avant le colloque
