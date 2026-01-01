# MEMORY PINS - Decisions critiques immuables

**Derniere mise a jour** : 1er janvier 2026
**Taille maximale** : 5K (1,250 tokens)

Ces regles sont ABSOLUES. Elles ne changent JAMAIS sans discussion explicite avec Gregoire.

---

## 1. Single Source of Truth

Chaque donnee a UNE source qui genere.
Tous les autres modules LISENT, ne calculent JAMAIS.

**Exemple** :
- `trimestre.js` GENERE -> `calendrierComplet`
- `calendrier-vue.js` LIT -> `calendrierComplet`
- JAMAIS recalculer le calendrier ailleurs

**Pourquoi** : Coherence pedagogique. Un etudiant ne peut pas avoir deux moyennes differentes.

---

## 2. Donnees A2025 sont LEGACY

**FAIT HISTORIQUE** :
- Construites sur 15 semaines AVANT introduction du namespacing
- Migration incomplete : certaines cles namespacees, d'autres non
- Etat hybride persistant (identifie decembre 2025)

**REGLE** :
Avant de toucher une cle calendrier/trimestre, VERIFIER existence sous les deux formes :

```javascript
const namespacee = localStorage.getItem('a2025_calendrierComplet');
const legacy = localStorage.getItem('calendrierComplet');

if (namespacee && legacy) {
    console.error('DOUBLON detecte');
    // -> Alerter Gregoire immediatement
}
```

**Documentation detaillee** : `docs/legacy/A2025-migration-incomplete.md`

---

## 3. Namespacing obligatoire (post-Beta 95)

**Format** : `{trimestreId}_{cleOriginal}`

**TOUJOURS utiliser le helper** :

```javascript
// BON
const calendrier = db.getSync(cle('calendrierComplet'), {});

// MAUVAIS
const calendrier = db.getSync('calendrierComplet', {});
```

**Exception** : Cles globales (voir `docs/modules/trimestres.md`)

**Pourquoi** : Separation des contextes. A2025 et H2026 ne doivent JAMAIS se melanger.

---

## 4. portfolio.js = indices-cp.js

**FAIT** : Module universel pour calcul C et P (TOUTES pratiques)
**Ancien nom** : portfolio.js (source de confusion)
**Nouveau nom** : indices-cp.js (clarification architecturale)

**Si tu vois "portfolio" dans le code** -> Signaler, probablement legacy a mettre a jour

**Pourquoi** : "Portfolio" suggere une pratique specifique, mais le module est universel.

---

## 5. Pratiques de notation - Interface obligatoire

Toute nouvelle pratique DOIT implementer `IPratique`.
JAMAIS coder en dur des calculs specifiques dans indices-cp.js.

**Delegation obligatoire** :

```javascript
const pratique = obtenirPratiqueParId(pratiqueActive);
const performance = pratique.calculerPerformance(da);
```

**Pourquoi** : Respect des pratiques pedagogiques. Chaque enseignant a sa methode.

---

## 6. coursId obligatoire (post-Beta 93.5)

Toutes les entites liees a un cours DOIVENT avoir `coursId` :
- Etudiants
- Productions
- Evaluations
- Presences

**Filtrage automatique** : `modes.js` filtre automatiquement par coursId

**Pourquoi** : Isolation des donnees entre cours. Un etudiant de 601-101 ne doit pas apparaitre dans 601-102.

---

## 7. Modules proteges

NE JAMAIS MODIFIER sans Gregoire :
- `config.js` (navigation globale)
- `navigation.js` (logique de navigation)
- `noms_stables.json` (IDs/classes proteges)

**Pourquoi** : Colonne vertebrale de l'application. Une erreur casse tout.

---

## 8. Testing obligatoire post-modification

Apres TOUTE modification de calcul :

1. Comparer indices A-C-P avec valeurs de reference
2. Valider 3 etudiants minimum
3. Tester les 3 pratiques (PAN-Maitrise, Sommative, Standards)

**Pourquoi** : Les calculs pedagogiques sont critiques. Une erreur = notes incorrectes.

---

## 9. Backup avant migration

TOUTE migration de donnees DOIT commencer par :

```bash
1. Export complet (Reglages -> Import/Export)
2. git commit + tag
3. Validation des valeurs de reference
```

**Pourquoi** : Donnees etudiantes reelles non-reproductibles. Perte = irremediable.

---

## 10. Communication transparente

Si incertain :
- Poser la question a Gregoire
- Documenter l'incertitude
- NE PAS supposer et continuer

**Pourquoi** : Les LLMs confabulent. Gregoire a la memoire contextuelle.
