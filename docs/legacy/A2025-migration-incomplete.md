# ALERTE : Migration A2025 incomplete

**Date de creation** : 31 decembre 2025
**Statut** : Probleme connu, non resolu
**Priorite** : Moyenne (ne bloque pas le fonctionnement)

---

## Contexte historique

Les donnees A2025 ont ete construites sur 15 semaines (aout-decembre 2025)
AVANT l'introduction du systeme de namespacing (Beta 95).

Resultat : Etat hybride ou certaines cles sont namespacees et d'autres non.

---

## Etat actuel

### Cles namespacees (migrees)
- `a2025_calendrierComplet`
- `a2025_cadreCalendrier`
- `a2025_evenementsPrevus`
- `a2025_evenementsImprevus`
- `a2025_seancesCompletes`
- `a2025_horaireHebdo`

### Cles potentiellement non namespacees (legacy)
- `calendrierComplet` (sans prefixe)
- `cadreCalendrier` (sans prefixe)
- etc.

### Risque de doublons
Si les DEUX versions existent, comportement imprevisible.

---

## Protocole de travail obligatoire

AVANT de toucher une cle calendrier/trimestre :

```javascript
// Verifier les deux formes
const namespacee = localStorage.getItem('a2025_calendrierComplet');
const legacy = localStorage.getItem('calendrierComplet');

if (namespacee && legacy) {
    console.error('DOUBLON DETECTE');
    // -> ARRETER et alerter Gregoire
}
```

---

## Comment detecter

Executer le script `docs/operations/validation-architecture.js` dans la console.

Le rapport indique :
- Cles namespacees
- Cles non-namespacees
- Doublons detectes

---

## Plan de resolution (janvier 2026)

1. **Audit complet** : Identifier toutes les cles A2025
2. **Backup** : Export complet + tag Git
3. **Migration** : Renommer toutes les cles legacy vers format namespace
4. **Suppression** : Supprimer les anciennes cles non prefixees
5. **Validation** : Verifier que l'application fonctionne

---

## Pour Claude Code

**Si tu rencontres un comportement bizarre avec les donnees A2025** :
1. Verifier les doublons de cles
2. Noter dans SESSION.md section DEVIATIONS
3. Alerter Gregoire avant de modifier quoi que ce soit
4. Ne JAMAIS supprimer de donnees sans backup prealable

---

**Ce probleme ne bloque pas le fonctionnement quotidien.**
**Il sera resolu proprement en janvier 2026.**
