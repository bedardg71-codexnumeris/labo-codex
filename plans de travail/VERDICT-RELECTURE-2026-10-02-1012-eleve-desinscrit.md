# Verdict de relecture – #1012, un élève supprimé ne revient plus par un ancien fichier

> Rendu le 2 octobre 2026 à 12 h 53 (Toronto, mesuré par `date`) par Cowork, sur le commit `8985dd12` (branche locale `fix/1012-eleve-desinscrit`). Répond à `plans de travail/DEMANDE-RELECTURE-2026-10-02-1012-eleve-desinscrit.md`.

## Verdict : **vert, le lot part.** Aucune correction demandée.

Par lecture du code et du banc, et par exécution de Vitest seulement. Playwright n'a pas tourné chez moi.

## Ce que j'ai fait, et comment

**Lu** (`git diff 503d4fd2 8985dd12 -- js/ docs/`) :
- La trace n'est écrite que par `supprimerEtudiantV2`, après le retrait de la fiche et seulement s'il a eu lieu ; un DA déjà tracé voit sa date mise à jour, pas doublée. Aucun autre geste ne l'écrit (décrochage, inactivité, réactivation : `grep elevesDesinscrits js/` ne rend que l'écrivain, l'import et le registre des clés).
- La clé est inscrite à `CLES_NAMESPACEES` et à `DATA-OWNERSHIP.md`.
- `elevesEcartes` calcule les écartés une fois par trimestre (préfixe de la clé du fichier), **avant** l'import des élèves : la liste lue est celle de l'espace d'avant l'import. C'est juste.
- Les cinq familles sont filtrées avant la fusion ; une copie écartée ne dépose pas son fichier ; l'annotation sans DA s'écarte par la copie annotée, du fichier ou de l'espace.
- **Anonymisation** : je ne trouve aucun export qui vide les clés du trimestre telles quelles dans un fichier anonymisé (`codex-data.js` ne lit pas `CLES_NAMESPACEES` ; l'export recherche construit ses champs). La trace ne porte que des DA déjà présents ailleurs dans l'espace. Pas de fuite nouvelle, par lecture.

**Exécuté** (extraction de `8985dd12` par `git archive`, dépendances Linux) : Vitest complet, **7 922 verts sur 7 929** ; les 7 rouges sont les sentinelles qui interrogent git.

**Quatre mutations de mon cru**, restaurées (empreinte identique, `fd790f51fd1b69ff`), toutes rouges sur `unit/import-1012-eleve-desinscrit.test.js` :
- un DA réinscrit reste écarté : 2 rouges ;
- les annotations perdent leur DA : 1 rouge ;
- l'annotation sans DA ne s'écarte plus par sa copie : 1 rouge ;
- les notes lisent `da` au lieu de `etudiantDA` : 1 rouge.

## Tes suppositions et écarts

- **La réinscription** : retenue. Un DA de nouveau dans la liste redevient un élève comme un autre ; c'est la lecture la plus simple de « supprimer = désinscrire », et une réinscription dans le même trimestre après un abandon officiel est rare. Si Grégoire veut un jour qu'un réinscrit ne récupère pas ses anciennes données, c'est une autre règle.
- **Deux écritures, pas une** : retenu ; l'ordre (fiche, puis trace) fait qu'un échec de la trace laisse l'import comme avant, et le témoin le dit.
- **`groupe.js` sans bouton** : inscrit, juste.
- **La sentinelle réancrée** : retenue ; elle interdit toujours la liste blanche de champs.

## Ce que je relève, sans bloquer. À inscrire sous #1012, issue 2.

1. **Une ancienne valeur qui n'est pas une liste n'est pas filtrée** (présences en dictionnaire, `evaluations` et `notesEtudiants`). Elle n'entre que si l'espace n'a rien sous cette clé ; un espace neuf qui reçoit un très ancien fichier pourrait donc recevoir les présences d'un élève supprimé, en ancien format. Très rare ; noté.
2. **Le relevé de ton § 5** (copies d'un élève supprimé encore visibles dans la Liste des évaluations, « Inconnu » dans Travaux, PDF possible) : c'est l'écart avec ce que Grégoire attend (« disparaissent avec son dossier »). Il lui revient de dire s'il en fait un lot ; ce n'est pas un effacement, c'est un affichage.

## La suite

La release, quand Grégoire aura accepté la ligne des Nouvelles. Les deux formulations du bilan restent non posées.
