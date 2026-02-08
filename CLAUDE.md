# Monitorage Pedagogique - Guide Claude Code

> **IMPORTANT** : Ce fichier est un point d'entree leger.
> La documentation complete est dans `/docs/`.

---

## Lecture obligatoire

**Commence TOUJOURS par** : `docs/00-START-HERE.md`

Ce document te guidera vers :
- Les decisions critiques a ne jamais oublier
- L'architecture du systeme
- Le module specifique sur lequel tu travailles

---

## Etat actuel

- **Version** : Beta 97.4
- **Objectif** : Alignement pedagogique (clonage, verbes, evaluations)
- **Session en cours** : Voir `SESSION.md`
- **Backlog** : Voir `BACKLOG.md` (taches a faire)

---

## Contraintes techniques

- **Stack** : HTML5 / CSS3 / JavaScript ES6+ pur (aucune dependance externe sauf Chart.js)
- **Stockage** : IndexedDB (principal) + localStorage (cache synchrone)
- **Fonctionnement** : 100% hors-ligne

---

## Zones protegees

**NE JAMAIS MODIFIER sans autorisation** :
- `js/config.js` - Configuration navigation
- `js/navigation.js` - Logique navigation
- `noms_stables.json` - Registre des noms proteges

---

## Principe architectural

**Single Source of Truth** : Chaque donnee a UNE source unique.
Les modules ne se parlent JAMAIS directement - communication via localStorage/IndexedDB uniquement.

---

## Namespacing des donnees

Les donnees sont prefixees par trimestre : `h2026_groupeEtudiants`, `a2025_presences`, etc.
Utiliser `window.cle('nomCle')` pour obtenir la cle namespacee.

---

## Avant de coder

1. Lire `docs/00-START-HERE.md`
2. Consulter `BACKLOG.md` pour les taches en attente
3. Consulter `SESSION.md` pour le contexte actuel
4. Identifier le module concerne dans `docs/modules/`
5. Verifier `docs/legacy/` pour les problemes connus

---

## Priorite absolue : Retours testeurs

**Quand un testeur signale un bug ou un besoin, on interrompt le plan en cours.**
Les retours utilisateurs passent AVANT le backlog prevu.

**Tracker** : `Retours des testeurs/SUIVI-BUGS.md`
- Consulter AVANT de corriger un bug (evite le travail en double)
- Bugs ouverts vs corriges avec date/build

---

## En cas de doute

**Pose la question plutot que de supposer.**
Gregoire a la memoire contextuelle reelle du projet.

---

## Avant chaque commit

**Mettre a jour le BUILD_ID** dans `index.html` (ligne ~15470) :
```javascript
const BUILD_ID = 'MMJJ-HHMM';  // Format: mois-jour-heure-minute (Toronto)
```
Exemple : `'0201-0840'` = 1er fevrier, 08h40

Ce numero s'affiche dans l'en-tete de l'application et sert a identifier les versions.

---

## References visuelles importantes

### Animation bulles en-tete (parallaxe)
Points colores qui circulent de gauche a droite dans l'en-tete :
- **CSS** : `index.html` lignes 1465-1560 (`.bulles-container`, `.bulle`, `@keyframes floatUp`)
- **JS** : `js/main.js` lignes 128-240 (`creerUneBulle()`, `genererBullesApprentissage()`)
- **Effet parallaxe** : grandes=rapides (proches), petites=lentes (eloignees)

### Points etudiants tableau de bord (3D)
Points blancs dans les barres graduees de l'apercu :
- **CSS** : `styles.css` lignes 9058-9120 (`.barre-etudiant`, `@keyframes float-vertical`)
- **Effet 3D** : gradient + box-shadow avec lumiere gauche→droite

---

**Derniere mise a jour** : 8 février 2026
