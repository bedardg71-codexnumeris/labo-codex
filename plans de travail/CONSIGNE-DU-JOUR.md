# Consigne du jour — clore l'écran de réglage : deux liens depuis Suivi, et les cinq chemins morts

> **Écrite le 11 septembre 2026 à 10 h 50 (Toronto, `TZ=America/Toronto date`) par Cowork, sur la
> décision de Grégoire de 10 h 48** (l'écran reste dans Labo, relié depuis Suivi). Application au moment
> de l'écriture : **`1.130.0`**, build `0911-1022`, `main` = `origin/main` = `dd7a2b26`.
> Elle remplace la consigne de la forme (livrée en `1.130.0`, porte relevée 13/13), archivée à côté sous
> `_ancienne-CONSIGNE-DU-JOUR-2026-09-11-forme-outils-observation.md`.
>
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`,
> `TZ=America/Toronto date`. ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.**
>
> **Préalables** : `plans de travail/CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md`, § « LA QUESTION
> OUVERTE » (la décision du temps 5, ses motifs) et § 4.3 (dispositions) ; `BACKLOG.md`, item `#824`.

---

## AVANT TOUT — un commit documentaire séparé

Modifiés, non commis, de Cowork : la porte terrain de la forme (relevée 13/13, deux verdicts), le
cadrage 10 (temps 4 livré et vu ; temps 5 tranché), et l'archivage de l'ancienne consigne. **Commets-les
d'abord, seuls, `git add` ciblé**, avec la présente consigne. ⚠ Le `D` sur la capture du 9 septembre
(`Retours des testeurs/grégoire/BUG_…journal-de-bord-sans-fond.png`) **reste hors de tes commits** : il est
à Grégoire.

---

## POURQUOI

C'est le dernier temps du tri de `Labo › Outils d'observation`. Grégoire voulait « le réglage dans
l'onglet où les paramètres ont une influence » ; il a tranché : **l'écran reste dans Labo, et Suivi y
mène par des liens** aux endroits où l'on constate un effet. En même temps, le nettoyage technique
inscrit en chemin (`#824`) ferme l'écran pour de bon — invisible, sans lui.

---

## LOT A — deux liens vers l'écran de réglage, depuis Suivi

**Le mécanisme existe** : `ouvrirReferenceSoloAccompagnement()` (`tableau-bord-apercu.js:3414`) ouvre
Labo › Outils d'observation et fait défiler jusqu'au sélecteur de grille ; il est appelé depuis les
boutons sous la barre des patterns. ⚠ Il « déplie l'accordéon SOLO si fermé » : **depuis `1.130.0` rien
ne se replie** — mesure ce qu'il fait encore et retire ce qui vise un repli qui n'existe plus.

**À poser, en réutilisant ce mécanisme (ou un frère qui cible un autre bloc)** :
1. **En tête de Suivi › Suivi du groupe**, près du titre : un lien discret « Régler les outils
   d'observation » — même patron visuel que les autres liens d'en-tête de l'application (mesure lequel ;
   `design-system.html` fait foi).
2. **Dans Suivi › Profils individuels › Accompagnement**, sous le titre de la carte RàI : le même lien.

Deux liens, pas plus : ce sont les deux endroits que la carte des effets (§ 4) désigne le plus souvent.
Pas de lien dans la liste des élèves ni ailleurs — « inscrire et continuer » si tu en vois l'envie.
⛔ `js/navigation.js` et `js/config.js` : **zones protégées, intactes.** Le lien navigue par
`naviguerVers('labo', 'accompagnement')` comme le fait déjà le wrapper.

## LOT B — les cinq chemins morts (`#824`)

Tel qu'inscrit au backlog, mesuré le 10 sept. : `identifierDefiSpecifique` (résultat jamais lu,
`profil-etudiant-sections-affichage.js:844`), `genererTableauObjectifs` (l. 3173, appelée nulle part),
`genererDiagnosticCriteres` (`profil-etudiant-diagnostics.js:26`, exportée, appelée nulle part — seul
chemin vers `pratique.detecterDefis` / `_diagnostiquerForcesChallenges`), `creerGraphiqueGroupeMoyennes`
(`graphiques-progression.js:1234`, jamais appelée), et `case 'cible'` du profil (l. ~1953) qui appelle
`genererContenuCibleIntervention`, **définie nulle part**.

⛔ **La leçon du 10 septembre s'applique à chacun : un « mort » sur quatre était vivant.** Avant de
retirer, remesure **chaque** appelant (`grep` sur `js/` ET `tests/` ET `index.html`, avec témoin) ; un
seul appelant vivant, et ce chemin-là reste, écrit au rapport. Retire d'un bloc ce qui est confirmé mort,
avec ce que la chaîne laisse derrière (helpers sans autre appelant), **avec le regard de `#551`** (les
cinq `identifierPattern` gardés « délibérément » — ne les emporte pas). Zéro écriture dans les données.

---

## CE QUI CHANGE À L'ÉCRAN — et qui doit être dit

Deux liens nouveaux dans Suivi ; rien d'autre de visible. Aucune valeur, aucune donnée ne change.

⮕ **Release `patch`** (sauf si `release-et-changelog` te fait juger autrement — dis-le), une entrée de
changelog d'une ligne : depuis le Suivi du groupe et l'Accompagnement d'un profil, un lien mène aux
réglages qui les gouvernent.

⮕ **Porte terrain : une seule, deux rangées** (markdown à toi, artefact à Cowork) : sur Mac, chaque lien
mène à Labo › Outils d'observation et la page s'ouvre sur l'écran trié, sans erreur. Pas de porte pour
le lot B (invisible) : le rapport dit ce qui a été retiré et ce qui a été gardé, et pourquoi.

---

## CE QUI REMONTE À GRÉGOIRE

1. **Les mots du lien** : « Régler les outils d'observation » est une proposition de Cowork ; si le
   patron des liens d'en-tête impose une autre forme, propose la tienne dans le rapport, ne l'invente pas
   en silence.
2. **Un chemin mort qui se révèle vivant** : garde-le, dis-le.
3. Rien d'autre.

⛔ **Hors périmètre** : le chargement lent (`#825`, plus tard aujourd'hui, consigne à part), l'onglet
Suivi lui-même (chantier suivant), les noms de zones et les bornes (`#821`, `#822`). **Un lot, une
livraison.**
