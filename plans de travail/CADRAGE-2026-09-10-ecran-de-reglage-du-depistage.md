# Cadrage — l'écran de réglage du dépistage (`Labo › Outils d'observation`)

> **Écrit le 10 septembre 2026 par Cowork, à la demande de Grégoire.**
> ⛔ **Ce n'est PAS une consigne.** Rien ne se code à partir de ce fichier : Cowork en écrit une
> quand le chantier prend son tour (`00-CADRAGES-OUVERTS.md`, règle d'entrée).
> ⚠ **Un chantier est en cours sur le même terrain** : `plans de travail/CONSIGNE-DU-JOUR.md`
> (source unique pour qualifier un contexte, `js/contexte-qualification.js`). **Ce cadrage attend
> qu'il soit livré** — les deux touchent aux mêmes seuils.

---

## L'ORIGINE, DANS SES MOTS

> « Je trouve que ce sous-onglet est un peu cacophonique. Il faudrait peut-être le transformer pour
> que, visuellement, il soit plus cohérent et plus facile à lire. »

Et, en relisant la mesure faite sur ses captures :

> « Ce que je vois là, c'est, en fait, ma propre échelle IDME codée en dur et formulée légèrement
> différemment. Donc, il y a un travail de fond à faire ici. »

▣ **Intention plus large, dans ses mots** : préparer le travail d'automne avec l'orthopédagogue, en
faisant sur le **dépistage** ce qui a déjà été fait sur Cadre, Conception et Évaluation. Le dépistage
« n'est pas nommément explicité dans l'application ».

⮕ **Ordre décidé par Grégoire le 10 septembre** : l'écran de RÉGLAGE d'abord, « puisque c'est lui qui
entraîne le suivi ». L'onglet Suivi (ce que l'enseignant lit) vient après.

---

## CE QUI EST DÉJÀ MESURÉ

### 1. L'écran n'est pas où Grégoire le croyait

`Labo › Outils d'observation` (`config.js:76`, id `labo-accompagnement`). L'onglet **Suivi** porte six
sous-onglets — Suivi du groupe, Liste des étudiant·es, Saisie des présences, Profils individuels,
Interventions, Animation — et **aucun ne s'appelle « Observation »**.

⮕ Le dépistage se **règle** dans Labo et se **lit** dans Suivi.

### 2. L'échelle IDME est écrite de trois façons différentes

| Source | Le I | Le E |
|---|---|---|
| Infobulle de l'app (`accompagnement-contenu-hover.js:338`) | « Insuffisant **ou incomplet** » | **Étendu** |
| Guide pédagogique (`guides-pedagogiques.js:50`) | Insuffisant | **Étendu** |
| Écran de réglage (`index.html:8972`) | Insuffisant | **Excellent** |

⮕ **« Excellent » n'appartient à aucune définition interne de l'IDME.** Le E est *Étendu* —
l'abstrait étendu de SOLO, une structure de pensée. « Excellent » est un jugement de valeur.

⮕ Même glissement sur le I : SOLO décrit une réponse **incomplète** (unistructurelle) ; « Insuffisant »
ne décrit plus, il juge. L'infobulle porte encore les deux mots côte à côte, comme une hésitation figée.

⮕ **Sur quatre lettres, deux ont glissé du descriptif vers l'évaluatif — les deux EXTRÉMITÉS.**
Le milieu (D, M) a tenu. Hypothèse, à éprouver et non à supposer vraie : ce sont les bouts d'échelle
qui attirent le jugement, parce que c'est là qu'on est tenté de dire « très bien » ou « pas assez ».
Contredit directement l'`ADR-007` (vocabulaire descriptif, non-prédictif, non-pathologisant).

### 3. Deux nomenclatures dans le même encadré

Bloc « Seuils d'interprétation » : le texte annonce des étiquettes **Insuffisant / Développement /
Maîtrise / Excellent**, et les trois champs, trois centimètres plus bas, disent **Fragile ·
Acceptable · Bon**. Deux échelles pour un seul bloc.

⮕ **La « cacophonie » n'est donc pas d'abord une affaire de mise en page.** Réarranger sans régler ça
reviendrait à mieux aligner des mots qui se contredisent.

### 4. Les seuils de cet écran servent au diagnostic, pas au calcul de la note

Mesuré : `defiSpecifique` et `idme.*` sont lus par `pratique-pan-standards.js`, mais dans
`_diagnostiquerForcesChallenges()` (l. 1042) et `_identifierPatternActuel()` (l. 1190) — deux
fonctions de **dépistage** logées dans le fichier du moteur PAN.

⚠ **Mesure incomplète, à finir avant tout déplacement** : il reste à établir la liste des ÉCRANS où
ces réglages produisent un effet visible. Ils sont lus au moins par `profil-etudiant-*` (Suivi),
`interventions.js` (Suivi), `etudiants.js` (Suivi) et `pratique-pan-standards.js` (dont les sorties
s'affichent où ?). **Tant que cette liste n'existe pas, l'emplacement de l'écran ne peut pas se
décider sur des faits.**

### 5. Les mots sont dans les clés de données

`idme.insuffisant`, `idme.developpement`, `idme.maitrise`, `interpretation.acceptable`… Les
utilisateurs en ont dans leur stockage (`seuilsInterpretation`).

⮕ **Changer les mots à l'écran est gratuit ; changer les clés ne l'est pas** — et l'`ADR-007`
proscrit le vocabulaire évaluatif jusque dans « les labels d'API et de structures de données ».
⛔ « Tarir n'est pas réparer » : **écrire dans les données de quelqu'un remonte à Grégoire.**

---

## LA QUESTION OUVERTE — déplacer l'écran dans Suivi ?

▣ **Proposition de Grégoire, 10 septembre** : « le réglage des paramètres de recherche dans l'onglet
où les paramètres ont une influence » — donc `Labo › Outils d'observation` deviendrait un sous-onglet
de **Suivi**.

**Le principe est juste** : un réglage qu'on ne peut pas atteindre depuis l'écran où l'on constate son
effet est un réglage qu'on ne corrige jamais.

**Trois objections à éprouver avant de trancher, aucune décisive** :

1. **L'étendue d'influence n'est pas mesurée** (§4). Si une partie de ces seuils agit hors de Suivi,
   les ranger dans Suivi affirmerait quelque chose de faux.
2. **Suivi porte déjà six sous-onglets.** Un septième, consacré à un réglage qu'on touche une fois par
   trimestre, s'installe en permanence dans un onglet de travail quotidien.
3. **`js/navigation.js` et `js/config.js` sont des zones protégées** (`CLAUDE.md`). Un déplacement se
   fait une fois, proprement, pas en cours de ménage.

▣ **TRANCHÉ PAR GRÉGOIRE, 10 septembre** : « Ta recommandation est bonne, suivons-la. »
⮕ **Direction retenue : trier le contenu d'abord, déplacer ensuite.** Le déplacement vers `Suivi`
reste **sa proposition**, à confirmer par la carte des effets — pas un acquis.

⮕ **Recommandation de Cowork : trier le contenu d'abord, déplacer ensuite.** Déplacer tel quel
importerait la cacophonie dans Suivi. Et le tri produira justement la mesure du §4, qui dira si
« Suivi » est le bon toit — ou si l'écran doit être **scindé**, ce qu'aucune mesure n'exclut
aujourd'hui.

---

## CE QUE LE CHANTIER DEVRAIT PRODUIRE

1. **La carte des effets** : pour chaque réglage de l'écran, l'écran où son effet se voit. C'est le
   préalable du §4, et il tranche la question de l'emplacement.
2. **Une seule nomenclature par échelle**, alignée sur les définitions de Grégoire (IDME, SOLO) et sur
   l'`ADR-007`. ⛔ Les mots que ses élèves liront et le vocabulaire de son cadre sont de la pédagogie :
   **rien ne se renomme sans son arbitrage**.
3. **Une grammaire visuelle unique** : aujourd'hui, régler un seuil se fait de trois façons — curseur,
   champ numérique coloré, champ numérique nu — et le bleu gras sert à la fois d'étiquette de champ,
   de libellé de case à cocher et d'en-tête de groupe.
4. **Deux boutons « Restaurer les valeurs par défaut »** identiques, dans deux sections, sans dire ce
   qu'ils restaurent. À lever.
5. **Le vocabulaire du risque qui traîne** : « Direction du risque », « tendance du risque » —
   proscrits par l'`ADR-007`, encore à l'écran.

---

## CE QUI N'EST PAS DANS LE PÉRIMÈTRE

- **Les bornes elles-mêmes** (0,64 / 0,75 / 0,85 · 65 / 70 / 75 · 5 points · 70 %). Elles attendent le
  travail d'automne avec l'orthopédagogue, comme la nomenclature des zones (`#821`).
- **L'onglet Suivi lui-même** : c'est le chantier suivant, décidé par Grégoire.
- **Les seuils de détection** au sens de `#817`, déjà traités.
