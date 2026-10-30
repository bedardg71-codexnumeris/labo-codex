# Verdict de relecture – Le niveau RàI au critère et ses textes (a8bf7778, 086f60f8, 0f237eac, 8e14b131, 234e1da3, beee4b01)

> Cowork, vendredi 30 octobre 2026, 17 h 30 (Toronto), sur `main` = `234e1da3`. Deux sessions de relecture indépendantes, en lecture seule (le code ; les textes et le correctif) ; Cowork a revérifié au commit les constats 1, 2, 4 et 5 du code et 2 des textes. Rien exécuté.

## Verdict

**Accepté avec retouches.** Le modèle est fidèle au § 1, au § 3 bis et à la décision sur le niveau 1 (`ligneDeReussite`, P et non la moyenne des copies, aucun niveau 3 par la note avant la note affichée, « En attente » sans note ni signal, `caf` jamais lu, phrase de groupe sans effet sur les niveaux, aucune trace de la comparaison au groupe). Palier : coché sans niveau, rien ; décocher retire ; rien d'écrit à la lecture ; la fusion copie le palier. Aucune écriture, aucun handler inline, aucun `console.log`, jetons bumpés. Textes : Nouvelles 1.227, Aide et remplacements conformes mot pour mot ; `8e14b131` correct (même ordre de lecture qu'ailleurs, aucun autre lecteur de `totalErreurs` seul).

## À finir dans le lot (consigne : `CONSIGNE-LOT-2026-10-30-niveau-rai-critere-retouche.md`)

- **C1** `js/tableau-bord-apercu.js:2941` : la barre des patterns écarte tout niveau 0 ; le 0 veut dire maintenant « des copies, pas encore de note affichée » : en standards sous le minimum, les « Stable », « Défi spécifique », « Difficulté émergente » disparaissent (toute la barre en « En attente de données » si tout le groupe y est). Inversement, `_cibleSansCopie` (`profil-etudiant-calculs.js:2215`) fait entrer un élève au seul diagnostic avec « Données insuffisantes », point par défaut à 50 % et compté au dénominateur. Écarter par pattern (« Données insuffisantes »), pas par niveau.
- **C2** `js/partage-schemas.js:290-297` : `paramsProjection` ne déclare pas `libelleSignalement` ; la projection ne garde que le déclaré (`partage-format.js:124`). Chez qui reçoit la grille : palier coché, « Niveau 3 – Intensif », et jamais de signalement (#790, sans phrase rien ne se lève). Déclarer `libelleSignalement` (chaîne, 200 max). Nommer au rapport que la case cochée voyage maintenant (elle tombait avant).
- **C3** La « note affichée » n'a pas de source unique : le niveau (`profil-etudiant-calculs.js:1856`, `:1870`), la carte RàI du profil (`profil-etudiant-sections-affichage.js:1087` écrit « Performance globale (P) : xx % » pendant que le motif, `:1234`, dit « La note du cours ne s'affiche pas encore »). Exporter un seul prédicat et le faire lire par la carte RàI. Le reste (fiche Performance `:473`, `:699` ; liste `etudiants.js:943-957` ; standards sans objet `portfolio`) : inscrire.
- **C4** `js/guides-pedagogiques.js:216` : « le reste, palier 1 » contredit la décision ; appliquer la formulation tranchée (« En attente » avant la note), et dire non-participation et diagnostic.
- **C5** `js/interventions.js:941` : badge « Niveau 0 » ; `:329` compte 0 comme un niveau. Afficher « En attente », ne pas le compter.
- **C6** Sentinelle : `caf: 'oui'` en minuscules (`:194`) alors que l'application écrit `'Oui'` ; le champ `sa` n'est gardé nulle part ; les tests du § 2 remplacent `projectionAlgo.calculer` par un faux (`:269`), d'où une voie diagnostique verte qui ne pouvait rien lever à `a8bf7778` : un cas par le vrai calcul ; `:342` ne voit pas C1.
- **T3** `sentinelle-note-provisoire-reservee` ne voit pas `profil-etudiant-sections-affichage.js:3692` (`Note ${estFinale ? 'finale' : 'provisoire'}`) : la nommer au rapport et l'ajouter à la garde.

## À Grégoire

- **T1** Les Nouvelles 1.227 décrivent l'ancien niveau (comparé au groupe). La version de ce soir a besoin de sa propre entrée : proposée au § 2 de la consigne, à valider avant la release.
- **T2** « Note provisoire » s'affiche encore en pratique sommative : profil (`profil-etudiant-sections-affichage.js:3678`, `:3692`, `_genererNoteSessionSommative`) et PDF de l'élève (`synthese-retroaction-rendu.js:749`, `:874-875`, via `construireNoteSommative`). Antérieur au lot, mots que ses élèves lisent : à lui soumettre dans un prochain lot (les phrases devront varier selon la pratique).

## Inscrire et continuer

- `js/evaluation-retroaction.js:1007` ne lit que `da.erreurs` : une copie du mode des codes (`totalErreurs` seul) à 0 % n'est pas repérée comme critère effondré par la première source (défaut inverse, antérieur).
- La liste écrit « — » dans la colonne RàI pour un élève qui n'a que le diagnostic (elle exige des notes en C ou P) ; le profil dit « Niveau 3 ». Déjà le cas de la non-participation.
- C3, les autres lecteurs (voir plus haut).

## Commenter et oublier

- Sans grille de référence, `_fondationEnDifficulte` (`:1878`) rappelle `diagnostiquerForcesChallenges` : trois `console.warn` de plus par élève sous la ligne, à chaque rendu.
- Ordre `erreurs` puis `totalErreurs` : un `erreurs` resté d'une saisie antérieure en mode nombre peut l'emporter sur un `totalErreurs` frais (même critère, changement de mode, même copie).

## Non vérifié

Aucun test exécuté ni écran rendu ; l'import du codex face à un champ inconnu ; les performances de `pourEleve`. `TEXTES-2026-10-30-aide-rai-niveau-critere.md` n'est dans aucun commit : à commiter.
