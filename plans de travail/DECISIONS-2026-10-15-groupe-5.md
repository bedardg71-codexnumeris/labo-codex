# Décisions du 15 octobre 2026 – groupe 5 (calculer et lire la note)

> Écrit par Cowork au fil des réponses de Grégoire. Dernière écriture : 15 octobre 2026, 13 h 23 (Toronto). Source des questions : `DECISIONS-A-PRENDRE-2026-10-11.md`, groupe 5.
> Les lignes « à poser » vont au BACKLOG par Claude Code, avec le lot qui exécute la décision.

## Question 1 (#1016) – la case « Consignes transmises » – décidée par Grégoire à 13 h 00 : « ça convient », on corrige l'aide

- **Mesuré le 15 oct.** : la complétion de `PratiqueConfigurable` (`calculerDetailsCompletion`, `js/pratiques/pratique-configurable.js` ~579-640) ne met au dénominateur que les productions qui ont au moins une copie qui compte (`evaluationEntreDansLaNote`). Une production jamais annoncée n'a pas de copie : rien n'est réclamé à l'élève, quelle que soit la case. La question du calcul ne se pose plus ; seule l'aide se trompe.
- **Décision** : l'aide (`js/accompagnement-contenu-popup.js` ~991) remplace « Il n'apparaît alors ni au calendrier ni dans les indices C et P — rien n'est dû tant que rien n'est annoncé. » par, tels quels :
  « Il n'apparaît alors ni au calendrier ni dans les courbes de progression. Les indices C et P ne comptent une production qu'à partir de sa première copie évaluée. »
- À vérifier au lot : que « courbes de progression » est bien le nom que l'écran donne au P historique ; sinon, remonter à Cowork (pas de retouche en chemin).

**Ligne à poser sous #1016, et cocher quand l'aide est corrigée :** `**Décidé par Grégoire le 15 oct. 2026 à 13 h 00 : on corrige l'aide, pas le calcul.** La complétion ne compte une production qu'à partir de sa première copie évaluée (mesuré le 15 oct.) ; l'aide dit maintenant ce que fait la case (calendrier, courbes). Détail : plans de travail/DECISIONS-2026-10-15-groupe-5.md.`

## Question 2 (#935) – le seuil par défaut d'une note par spécifications – décidée par Grégoire à 13 h 01 : « oui », 100 % partout

- **Décision** : quand une pratique par spécifications ne porte aucun seuil, le défaut est **100 %** partout (une copie est satisfaisante quand toutes ses spécifications sont respectées) : adoption par les modalités (`pratiques-bibliotheque.js` ~503, ~564), formulaire de gestion (`pratiques-gestion.js` ~1262, ~1647), ancien éditeur s'il vit encore (`pratique-notation-v2.js` ~609), moteur (`pratique-pan-specifications.js`, `|| 60`). L'assistant le fait déjà.
- Les pratiques existantes gardent le seuil qu'elles portent ; aucune n'est réécrite. À mesurer au lot : si une pratique existante n'a AUCUN seuil, le moteur lui appliquait 60 ; avec le nouveau défaut elle passerait à 100 et ses notes pourraient changer. Si une telle pratique existe dans un stock connu (démo, packs), remonter à Cowork avant de changer le moteur.
- **Sans décision (Cowork, technique)** : un seuil écrit à 0 ne doit plus être lu comme 60 (`0 || 60`) ; `??` ou équivalent.
- Grégoire n'utilise pas les spécifications : il décide ici pour ses collègues.

**Ligne à poser sous #935, et cocher quand c'est fait :** `**Volet des défauts décidé par Grégoire le 15 oct. 2026 à 13 h 01 : 100 % partout.** Les pratiques existantes gardent leur seuil ; un seuil à 0 n'est plus lu comme 60. Détail : plans de travail/DECISIONS-2026-10-15-groupe-5.md.`

## Question 3 (#339) – le déménagement des réglages du portfolio, en version majeure – suspendue par Cowork à 13 h 03 : une mesure d'abord

- **Pas de question à Grégoire maintenant.** La version majeure ne se pose que si le grand chantier est justifié, et il ne l'est que si les deux calculs du même chiffre divergent encore.
- **Mesuré le 15 oct.** : les deux moteurs coexistent toujours : `calculerNoteAvecCategories` (`js/portfolio.js` ~772, appelé par `pratique-pan-standards.js` ~145, l'indice P) et `calculerDetailsNoteFinale` (`js/profil-etudiant-actions.js` ~379, le profil) ; ~79 lectures de `.categorie` dans `js/`. Leur divergence (5 points, juin) n'a pas été remesurée depuis, alors que plusieurs lots ont touché la note (#716, #816, #871, lot 18).
- **La mesure à faire, sans Grégoire, en lecture seule** : sur le trimestre en cours (automne 2026) et sur le pack démo, les deux moteurs rendent-ils le même chiffre pour chaque élève, sous chaque pratique hybride ? Harnais avant/après, aucune écriture. Rendu : le nombre d'élèves où ils diffèrent, et de combien.
- **Ce qui sort de la fiche, par la décision de Grégoire du 1er sept. 2026** (notes d'A2025 et d'H2026 non rouvertes) : la reconstitution d'A2025, le « golden master » des notes d'H2026, la reconstruction des grilles d'A2025. Le golden master, s'il en faut un, se prend sur l'automne 2026 ou sur la démo.
- Ensuite : s'ils ne divergent plus, le chantier se réduit (un seul moteur, sans changement de format) et la question de la version majeure tombe ; s'ils divergent, la question revient à Grégoire avec les chiffres.

### Décision de Grégoire à 13 h 04 : les réglages du portfolio restent sur la production ; pas de version majeure

- Dans ses mots : « les réglages du portfolio vont demeurer dans la production plutôt que se déplacer vers la pratique de notation, puisqu'il est possible de faire un portfolio avec la notation traditionnelle, et les autres notations également. Donc, ce n'est pas propre à la notation. »
- Conséquence : le redesign du § 7 du diagnostic de juin (la pratique propriétaire des liens, `categorie` et pondérations qui QUITTENT les productions) est **écarté**. Pas de changement de format, pas de migration, **pas de version majeure**.
- Reste de #339 : un seul moteur pour un même chiffre, si la mesure montre que les deux divergent encore ; Grégoire demande que Cowork fasse la mesure.

### La mesure, faite par Cowork (sous-agent, clone jetable, `main` à `53791155`) – 15 oct., ~13 h 15

- **Verdict** : les deux fonctions divergent encore sur les cinq points de juin (pool, plagiat/IA, obligatoire non remise, terminale, plafonnement), mais **la divergence n'atteint plus aucun chiffre visible**. EXÉCUTÉ sur le pack démo (10 élèves, 6 configurations hybrides) : l'indice P affiché ou stocké vaut la note du profil chez 10 élèves sur 10. Le P écrit passe par la note du profil (`calculerNoteDuCours`, `simulerIndices`) ; `PratiqueConfigurable.calculerPerformance` n'appelle pas `calculerNoteAvecCategories` (EXÉCUTÉ : rend `null`) ; pour la pratique Standards, le repli est coupé (#394 L3, `portfolio.js` ~339/343, ~570/576). INFÉRÉ : `calculerNoteAvecCategories` n'alimente plus rien de visible ; un seul appelant, `pratique-pan-standards.js` ~145.
- **Décision de Cowork (technique, zéro-dette)** : retirer `calculerNoteAvecCategories` et son appel, après avoir prouvé au banc qu'aucun chiffre visible ne change (harnais avant/après sur la démo, toutes pratiques). Il ne reste alors qu'un moteur, celui du profil (`_selectionnerArtefactsHybride`). Aucun changement de format, aucune migration, aucune version majeure.
- **Défaut trouvé par la mesure, dans le moteur qui reste (EXÉCUTÉ)** : l'écran permet de marquer la terminale « obligatoire » (`pratiques-gestion.js` ~2698). En notes FINALES, le profil la compte alors au dénominateur des obligatoires (`profil-etudiant-actions.js` ~244) alors que sa copie n'entre jamais dans le pool : un zéro fantôme. Démo, configuration S1 : le portfolio de DEMO007 passe de 78,68 (provisoire) à 47,21, sa note de 85,53 à 66,65. Les notes provisoires ne sont pas touchées. **Décision de Cowork : corriger** (une copie remise ne peut pas compter pour zéro ; la terminale garde sa propre pondération), dans le même lot, avant les notes finales de décembre. Non mesuré : si la pratique de Grégoire marque sa terminale obligatoire (ses données).

**Ligne à poser sous #339 :** `**15 oct. 2026, décision de Grégoire (13 h 04) : les réglages du portfolio restent sur la production**, parce qu'un portfolio peut servir sous toute pratique de notation ; pas de migration, pas de version majeure. **Mesure de Cowork (15 oct.)** : les deux moteurs divergent encore, mais l'indice P visible vaut la note du profil (10 élèves sur 10, 6 configurations) ; `calculerNoteAvecCategories` est retiré (un seul moteur), et le zéro fantôme d'une terminale marquée obligatoire en notes finales est corrigé. Détail : plans de travail/DECISIONS-2026-10-15-groupe-5.md.`

## Question 4 (#810) – la note par cibles d'apprentissage – décidée par Grégoire à 13 h 21 : « Oui, il faudra ouvrir ce chantier »

- **Décision** : le chantier s'ouvre. Il part du cadrage de Grégoire du 9 sept. (fiche #810) : la cible est le niveau atteint sur un CRITÈRE ; atteinte à M ou E (seuil relationnel, échelle IDME) ; agrégation par `critereId` à travers les productions (un critère est un seul objet d'apprentissage, quel que soit le genre) ; la trace garde la cartouche qui a servi ; un chemin de note EN PARALLÈLE du portfolio, pas à sa place.
- **Suite, par Cowork** : un plan qui mesure ce qui existe et isole les questions encore ouvertes (comment la note se déduit des cibles atteintes, ce que l'élève lit), soumises à Grégoire une à la fois. Place dans l'ordre : après les lots des décisions en cours ; laborieux (plusieurs séances).
- Le Comparateur garde « Alignement sur des cibles d'apprentissage ⮕ Non couvert » jusqu'à ce que le chemin existe (consigne de la fiche).

**Ligne à poser sous #810 :** `**15 oct. 2026, décision de Grégoire (13 h 21) : le chantier s'ouvre**, à partir de son cadrage du 9 sept. ; Cowork écrit le plan et lui soumet les questions ouvertes une à la fois. Détail : plans de travail/DECISIONS-2026-10-15-groupe-5.md.`

## Question 5 (#33) – un mode « tableur » sans grille – décidée par Grégoire à 13 h 23 : « on ferme »

- **Décision** : aucun collègue n'a demandé à entrer ses notes sans grille ; la fiche se ferme. Elle se rouvre le jour où un collègue en a besoin, cadrée à partir de ce qu'il fait.

**Ligne à poser sous #33, et cocher :** `**Close le 15 oct. 2026, décision de Grégoire (13 h 23) :** personne n'a demandé de mode sans grille ; à rouvrir à la demande d'un collègue. Détail : plans de travail/DECISIONS-2026-10-15-groupe-5.md.`

> Note de Cowork : les lignes de #810 et #33 n'étaient pas dans `CONSIGNE-LOT-2026-10-15-groupes-4-et-5.md` (écrite avant) ; elles partent avec le prochain lot.
