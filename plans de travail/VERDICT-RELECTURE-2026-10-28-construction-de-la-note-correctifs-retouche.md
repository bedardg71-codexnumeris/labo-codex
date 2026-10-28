# Verdict de relecture – La retouche des correctifs de la note (E15, E16, l'index ; plus E14) (#1152, trou 2 ; #1177)

> Cowork, mercredi 28 octobre 2026, vers 15 h 45 (Toronto). Relu : `DEMANDE-RELECTURE-2026-10-28-construction-de-la-note-correctifs-retouche.md` et le commit `96750af7` (`git --no-optional-locks show`, lecture seule).

## Verdict : accepté sans retouche. Le chantier des correctifs (#1177) est clos côté relecture.

- **E15** : `evaluationCompteCommeRemise(e, evaluations)` lit la règle d'E4 ; ses lecteurs lui passent la liste. Conforme ; aucune note (P) ne change, seul le C pendant la fenêtre.
- **E16** : `_badgeDeLOriginale` lit `originaleEstRemplacee` ; « Compte jusqu'à sa reprise » sans la classe du grisé ; le filtre « Remplacée » lit le badge. Mots de Grégoire, mot pour mot. Les deux suppositions (le statut interne et le menu inchangés ; le filtre) sont acceptées.
- **L'index** : la mesure a trouvé le chemin réel (`appliquerJetonReprise`, `push` dans le tableau de `memoryCache`) ; l'index ne vit plus que le temps d'un lot de calculs ou d'une simulation. Conforme ; c'était un vrai défaut d'E4, corrigé avant la mise en ligne.
- **E14** : `noteFinale` non numérique → `null` ; 0 saisi reste 0 ; DEN-4. Conforme.
- `index.html` : seuls les jetons anti-cache des scripts de la retouche (vérifié au diff).

## Les deux questions de la demande, disposition de Cowork

1. **Le profil pendant la fenêtre montre la reprise en brouillon** (sa note, au départ celle de l'originale recopiée), pas l'originale : gardé tel quel. Le chiffre affiché est celui que compte la note tant que la reprise n'est pas retouchée ; aucun symptôme vécu. Rien d'inscrit.
2. **Les deux phrases d'`evaluation-jetons.js`** (`:374`, `:715`), fausses pendant la fenêtre : **inscrites au lot 5 de l'Aide** (textes d'écran), § 1.4, avec des mots de Cowork vrais dans les deux états (lus par l'enseignant·e seulement).

## Pour les Nouvelles de ce soir

Des notes changent : en sommative (une production à pondération 0 sort de la moyenne ; toutes à 0, non constructible), pendant une reprise (l'originale compte, dans les trois familles qui calculent ; et comme remise dans le C) ; l'export dit « provisoire » tant que « Notes finalisées » n'est pas cochée ; en dénotation, un jugement sans note n'est plus 0.
