# ADR-004 : Pattern Single Source of Truth (SSOT)

**Statut** : Acté rétroactivement
**Date de décision originale** : novembre-décembre 2025 (formalisation : 14 mai 2026)
**Auteur** : Grégoire Bédard

---

## Contexte

Sans framework SPA (cf. ADR-001) et avec ~129 modules JS qui partagent des données (étudiants, évaluations, grilles, présences), l'application aurait pu rapidement dériver vers :
- Des duplications d'état entre modules (un module recalcule ce qu'un autre a déjà calculé).
- Des appels directs `moduleA.fonction()` qui créent des couplages durs et des cycles d'import.
- Des bugs subtils où deux modules affichent des valeurs différentes pour la même donnée.

L'audit annuel 2026, sous-audit 3.1 SSOT, a confirmé que la discipline a globalement été respectée mais avec des dérives identifiables — preuve que le pattern est appliqué mais reste à formaliser.

---

## Décision

**Chaque donnée a une source unique** :

- Soit une clé `localStorage`/`IndexedDB` (gérée via `db.js`, cf. ADR-002), avec un module **propriétaire** documenté dans `docs/DATA-OWNERSHIP.md`.
- Soit une fonction de calcul (`window.calculerXXX`) qui est l'unique génératrice de la valeur.

**Règle stricte** : les modules ne se parlent JAMAIS directement. La communication passe **toujours** par `localStorage`/`IndexedDB` :

```
Module A écrit → db.setSync('cle', valeur)
                 ↓
            localStorage/IDB
                 ↓
Module B lit  ← db.getSync('cle')
```

**Conséquence** : pour qu'un module B réagisse à un changement fait par A, soit B relit la clé au moment où il en a besoin (pull), soit A déclenche un événement (`window.dispatchEvent`) que B écoute (push).

---

## Conséquences

### Positives

- **Découplage maximal** : un module peut être réécrit ou supprimé sans casser les autres tant que le contrat de clé est respecté.
- **Testabilité** : on peut mocker une clé `localStorage` pour tester un module en isolation.
- **Persistence gratuite** : tout l'état applicatif est persistant par défaut. Reload = recharger le même état.
- **Audit traçable** : `docs/DATA-OWNERSHIP.md` donne la carte complète des clés et de leurs propriétaires.

### Négatives

- **Performance** : chaque lecture est une désérialisation JSON. Le cache mémoire de `db.js` (cf. ADR-002) atténue mais pas totalement.
- **Pas de réactivité automatique** : sans framework, la propagation d'un changement doit être codée manuellement (re-render, event, polling). Source de bugs si oubliée.
- **Sérialisation forcée** : tout objet doit être JSON-serializable. Pas de fonctions, pas de `Date` autres que ISO strings, pas de références circulaires.
- **Dérives possibles** : un module en hâte peut écrire directement `localStorage.setItem` sans passer par `db.js`, contournant le cache et provoquant des divergences. À surveiller via lint / revues.

### Neutres

- **Couplage faible mais réel** : les modules partagent un schéma de clés. Renommer une clé reste une opération transverse (cf. `noms_stables.json` qui documente les 44 identifiants protégés).

---

## Alternatives considérées

### Option A : Bus d'événements explicite (EventEmitter pattern)

Un singleton `window.AppBus` avec `on(event, handler)` et `emit(event, payload)`. **Écartée** parce que (a) la persistence n'est pas couverte par les événements seuls, (b) le bus serait redondant avec les `CustomEvent` natifs déjà utilisés ponctuellement.

### Option B : Module global d'état (Redux-like sans Redux)

Un store central avec actions / reducers. **Écartée** comme over-engineering pour un projet vanilla : le store finit par être une réimplémentation maison qui peine à rester cohérente sans tests dédiés.

### Option C : Imports directs et appels de fonctions

Le default des projets JS simples. **Écartée** parce qu'elle crée des cycles d'import dans une codebase de cette taille et qu'elle ne couvre pas la persistence.

---

## Références

- `CLAUDE.md` §"Principe architectural" — déclaration officielle.
- `docs/DATA-OWNERSHIP.md` — registre des clés et propriétaires.
- `noms_stables.json` — registre des 44 identifiants protégés.
- Audit annuel 2026, sous-audit 3.1 SSOT — analyse de conformité.

---

## Notes de révision

À réviser si :
- Le coût de désérialisation JSON devient bloquant sur iPad pour des clés très volumineuses (cf. plan désaturation thumbnails).
- Un co-mainteneur propose un store explicite avec une discipline outillée (validation de schémas, observation des mutations).

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
