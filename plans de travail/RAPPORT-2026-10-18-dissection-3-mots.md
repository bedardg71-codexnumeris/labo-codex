# Rapport – la dissection, étape 3 : les mots (dimanche 18 octobre)

> Claude Code, 18 oct. 2026, vers 10 h 10. Répond à `CONSIGNE-LOT-2026-10-18-dissection-3-les-mots.md`. Rien n'est poussé ; pas de version, pas de verdict (étape 4).

## Fait

- **Le verdict du lot 2b** : ses deux trouvailles sont au BACKLOG, **#1104** (une grille en niveaux qui ne totalise pas 100 s'affiche en « % ») et **#1105** (`plageValide` accepte une plage hors de 0 à 100).
- **Les textes qui changent**, mot pour mot comme dans la consigne :
  - A1, A2, A4 à A7 et D3 sont dans `index.html` ;
  - L3 est dans `materiel-dissection.js` (`phraseLogique`) ;
  - C6 est dans `materiel.js` (`confirmationPointsHtml`) ;
  - E1 est dans `materiel-dissection-lecture.js` (`exempleDoc`) : ses quatre critères disent « L’étudiant·e ».
- **Les textes validés tels quels** : leurs commentaires « PROVISOIRE » portent maintenant « validé G. 18 oct. ». C'est le cas dans `index.html`, `materiel-dissection.js` (3), `materiel-dissection-lecture.js` (3), `materiel.js` (le message « rien de lisible », la carte de confirmation) et `grilles.js` (G2 ; G1, le titre gardé par décision). Aucun texte n'a changé dans ces passages.
- **N1** : l'entrée `1.204` (`vert`) des Nouvelles, avec son titre et ses sept lignes. L'entrée 1.203 n'a pas été touchée.
- **Les bancs** :
  - l'attente A2 (`materiel-lot3b1-visible.test.js`) ;
  - C6 à deux endroits (`materiel-etape5-points.test.js`, `materiel-dissection-2a.spec.js`), avec « sur 64 points. » et « sur 30 points. » ;
  - « L’élève » → « L’étudiant·e » partout dans les bancs de la dissection : 12 mentions dans les specs 2a et 2b, et 8 dans les grilles fictives du helper et des tests unitaires 2a et 2b. Cela fait 20, pas 16 comme Cowork l'avait compté.
  - Aucune attente n'est affaiblie : chacune passe à la nouvelle chaîne exacte.
- **Le cache** : le `?v=` de `materiel.js`, `materiel-dissection.js`, `materiel-dissection-lecture.js`, `changelog-data.js` et `grilles.js` est incrémenté, toujours au jour du build en cours (1017), comme l'exige la sentinelle anti-cache. La release de l'étape 4 les redatera.

## Vérifié comment

- **Vitest complet** : 9 188 sur 9 188, dans 774 fichiers.
  - Une première passe a rougi. J'avais daté `changelog-data.js?v=20261018a`, et la sentinelle anti-cache exige le jour du build. J'ai corrigé en `20261017b`, puis tout est passé au vert.
- **Specs `materiel-*` dans WebKit** : 11 passées et 0 rouge, relancées après la correction du cache. Les 17 sautées sont les specs de l'assistant en sept étapes, débranché au lot 1, et ce saut était déjà là.
- **`git grep` des anciens textes** dans `js/`, `tests/` et `index.html` :

| Ancien texte | Occurrences |
|---|---|
| « Copié depuis un PDF » | 0 |
| « Reconnaître le texte ci-dessus » | 0 |
| « L’élève » | 0 |
| « reconnaître toutes les grilles » | 1, dans l'entrée 1.203 des Nouvelles |

L'occurrence restante est dans l'historique, laissé tel quel par la consigne. Les « L'élève » à apostrophe droite qui restent appartiennent à d'autres modules (texte troué, historique des Nouvelles) : ce n'est pas E1.

## Ce que j'ai supposé

1. **Les espaces autour des guillemets.**
   - Dans l'écran, j'ai mis des espaces simples, comme dans la consigne (aucune insécable dans ses octets) et comme dans tout le code de l'onglet.
   - Dans les Nouvelles, j'ai mis `&nbsp;` dans les guillemets et devant « : » et « ; », comme le fait l'entrée 1.203. C'est ce que j'ai lu dans « règles du skill » ; le skill lui-même ne fixe pas cette règle.
2. **C6 au singulier** : « sur 1 point. » sous 2, comme `texteDePonderation` dans Grilles de critères. Le cas est rare.
3. **E1 jusque dans les grilles fictives des tests unitaires** (« L’étudiant·e accomplit la tâche fictive N »). Ce n'est pas l'exemple montré à l'écran, mais sans cela le `git grep` demandé ne rendait pas zéro.
4. **Le cache de `grilles.js` est incrémenté lui aussi**, bien que seuls ses commentaires aient changé : le crochet anti-cache (#547) refuse sinon le commit.

## Trouvaille

- **L3 n'a aucun banc.** Aucun test ne cite la phrase de la logique en points, ni avant ni après. Issue 3, signalé ici, non inscrit : c'est un texte validé, sans conséquence observable.
