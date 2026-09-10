# Mesure du stock — #816, sélections de portfolio déjà écrites

**10 septembre 2026.** Lecture seule. Ce document ne répare rien et ne propose
aucune réécriture : conformément à « tarir n'est pas réparer », écrire dans les
données de Grégoire remonte à Grégoire.

---

## Pourquoi il y a un stock

`chargerPortfolioEleveDetail` (`js/portfolio.js:189`) **écrit** une sélection
automatique dans `portfoliosEleves` dès qu'on ouvre le panneau Portfolio d'un
élève qui n'en a pas encore. Cette écriture passe par
`selectionnerArtefactsSelonModalite`, dont le `switch` ne connaît pas les
modalités `derniers` ni `hybride` de l'écran : elles tombent dans le `default`,
qui **trie par note décroissante** — c'est-à-dire « les N meilleures ».

Le geste n'est pas anodin : ouvrir un profil suffit à le déclencher.

## Ce que ça ne touche PAS — mesuré, pas supposé

`js/pratiques/pratique-pan-standards.js` ne lit **jamais** `portfoliosEleves`
(0 occurrence). La note finale ET l'indice P passent par ce moteur, qui appelle
`calculerNoteAvecCategories` en hybride : N meilleures de la catégorie
`selection`, plus toutes les `obligatoire`, pondérées par bloc.

⮕ **Aucune note n'est fausse.** Le stock fautif alimente l'AFFICHAGE (les cases
cochées du panneau Portfolio) et, en repli seulement, `calculerPerformancePAN`
(`js/indices.js:433`, précédé d'un `console.warn`).

## La règle qui départage — les écritures se signent

| Forme de l'entrée | Écrit par | Verdict |
|---|---|---|
| `auto` absent | `portfolio.js:368` (cases cochées à la main) | **MANUELLE — ne pas toucher** |
| `auto: true` + `modalite: 'derniers'` ou `'hybride'` | `portfolio.js:213` | **FAUTIVE (#816)** — « N meilleures » sous un autre nom |
| `auto: true` + `modalite: 'meilleurs'` ou `'tous'` | `portfolio.js:213` | conforme |
| `auto: true`, `modalite` absente | `profil-etudiant-sections-affichage.js:4084` | **indépartageable** — écrit « les meilleurs » sans tracer la modalité active |

La quatrième ligne est la limite de la mesure : ce chemin-là ne dit pas sous
quelle modalité il a écrit. Pour ces entrées, on ne peut pas savoir après coup
si la sélection correspondait au réglage de la pratique.

## Le relevé — à lancer par Grégoire, il écrit zéro octet

L'application est hors-ligne : ces données ne vivent que dans son navigateur.
Aucune session ne peut les lire à sa place.

Sur Mac, Safari › Développement › Console JavaScript, coller :

```js
(async () => {
    const cles = (await db.keys()).filter(k => /portfoliosEleves$/.test(k));
    const lignes = [];
    for (const k of cles) {
        const donnees = (await db.get(k)) || {};
        for (const [da, parPortfolio] of Object.entries(donnees)) {
            for (const [portfolioId, sel] of Object.entries(parPortfolio || {})) {
                if (!sel || !Array.isArray(sel.artefactsRetenus)) continue;
                const mod = sel.modalite || null;
                const verdict =
                    sel.auto !== true                            ? 'MANUELLE — ne pas toucher'
                  : (mod === 'derniers' || mod === 'hybride')    ? `FAUTIVE (#816) — écrite sous « ${mod} »`
                  : (mod === 'meilleurs' || mod === 'tous')      ? `auto conforme (${mod})`
                  :                                                'auto sans modalité — indépartageable';
                lignes.push({
                    trimestre: k.replace(/_?portfoliosEleves$/, '') || '(global)',
                    da, portfolioId,
                    retenus: sel.artefactsRetenus.length,
                    date: sel.dateSelection || '?',
                    verdict
                });
            }
        }
    }
    console.table(lignes);
    const bilan = {};
    for (const l of lignes) bilan[l.verdict] = (bilan[l.verdict] || 0) + 1;
    console.table(bilan);
    console.info(`${lignes.length} sélections lues sur ${cles.length} trimestre(s). AUCUNE ÉCRITURE.`);
})();
```

⚠ Ce bloc n'est **pas** du code de l'application : il ne part pas dans `js/`, il
n'est pas soumis à la règle « zéro `console.log` », et la CSP `script-src 'self'`
ne s'applique pas à ce qu'on tape soi-même dans la console.

## Ce qui reste à décider APRÈS le relevé, et c'est à Grégoire

1. Les entrées **FAUTIVES** : les laisser (la note ne bouge pas, seul l'affichage
   ment) ou les effacer pour que la sélection se refasse au prochain passage,
   une fois #816 corrigé ?
2. Les entrées **indépartageables** : même question, sans le moyen de savoir
   lesquelles étaient justes.
3. Les entrées **MANUELLES** ne sont pas en cause et ne doivent bouger dans
   aucun des deux cas.
