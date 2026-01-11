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

- **Version** : Beta 95.4
- **Objectif** : Architecture modulaire groupe-cours + Categories productions
- **Session en cours** : Voir `SESSION.md`

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
2. Identifier le module concerne dans `docs/modules/`
3. Verifier `docs/legacy/` pour les problemes connus
4. Consulter `SESSION.md` pour le contexte actuel

---

## Priorite absolue : Retours testeurs

**Quand un testeur signale un bug ou un besoin, on interrompt le plan en cours.**
Les retours utilisateurs passent AVANT le backlog prevu.

---

## En cas de doute

**Pose la question plutot que de supposer.**
Gregoire a la memoire contextuelle reelle du projet.

---

**Derniere mise a jour** : 10 janvier 2026
