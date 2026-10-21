# Consigne – Le critère algorithmique, mots (suite) : trois textes restés faux, et l'Astuce qui part

> Écrite par Cowork le mercredi 21 octobre 2026 à 10 h 25 (Toronto, mesuré par `date`), sur `main` à `904f1a02` (lot de mots, non poussé, relu et accepté : `VERDICT-RELECTURE-2026-10-21-critere-algorithmique-mots.md`). Textes lus par l'enseignant, tranchés par Cowork (`CLAUDE.md` : seuls les mots lus par les élèves remontent à Grégoire). Petit lot : il passe avant le verdict complet et la version.

## Ce qu'il faut, mot pour mot (apostrophes : la convention de chaque site)

1. **Le lexique** (`index.html`, l. 13888-13889) :
   - terme : « Sous-critères (critère algorithmique) » ;
   - définition : « Les catégories de ce que compte un critère algorithmique. Chaque sous-critère porte un code, un nom, une pondération (ce que pèse un code posé : 1 par défaut, 0,5 pour le compter à moitié) et une observation, que l'étudiant·e lit. Le calcul reçoit la somme pondérée des codes posés. « Partir de la liste du français écrit » en crée dix d'un coup. Configuration : Conception → Grilles de critères → type « Algorithmique ». »
   - Si une autre entrée ou un lien pointe vers l'ancien terme (recherche de l'onglet Aide, ancre), suis-le.
2. **Le gabarit, sous les sous-critères** (`grilles.js`, l. 4484) : « 💡 La pondération dit ce que pèse un code posé : 1 par défaut, 0,5 pour le compter à moitié. »
3. **Le gabarit, sous la formule** : « Lors de l'évaluation, « Nombre d'erreurs » se remplit avec les codes que tu poses dans Annoter, ou se tape ; « Nombre de mots » se tape. »
4. **L'« Astuce professionnelle »** de la section 5c (`index.html`, l. 11218) part en entier, encadré compris.

## Les bancs

- **Vitest** : les trois textes à leur site, par leur chaîne exacte ; plus de « Pondération différenciée », de « ponctuation = 0.5 », de « de la rédaction » dans le gabarit, ni d'« Astuce professionnelle » dans la 5c ; ajoute ces chaînes au banc X du lot de mots plutôt qu'à un banc neuf.
- **Break-test** : un des textes remis à l'ancien → rouge ; code restauré, `cmp`.
- Vitest complet vert ; les specs WebKit de l'aide et de Grilles touchées vertes.

## Ce qu'il ne faut pas

- Nommer les données : étape 2.
- Le verdict complet, un numéro de version, le push : ils suivent, au signal de Grégoire.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne, le verdict du lot de mots (non suivi), le correctif, les bancs, et la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-21-critere-algorithmique-mots-2.md` (pas de capture : du texte seulement, le banc le prouve). Par leur chemin. `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**
