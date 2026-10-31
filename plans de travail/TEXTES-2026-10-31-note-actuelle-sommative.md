# Textes validés – « La note actuelle du cours » en pratique sommative (#1207)

> Cowork, samedi 31 octobre 2026. Les textes de `CONSIGNE-LOT-2026-10-30-note-actuelle-sommative.md` (§ 1), validés un par un par Grégoire AVANT le lot (le PDF est lu par ses élèves). En pratique sommative seulement ; en pratique alternative, « note provisoire » reste.

| # | Où | Avant | Retenu | Décision |
|---|---|---|---|---|
| 1 | Profil, titre de la note (`js/profil-etudiant-sections-affichage.js`, trois endroits) | « Note provisoire de session » | « Note actuelle du cours » (« Note finale de session » inchangé) | Accepté (8 h 54) |
| 2 | PDF de l'élève, titre du bloc de la note (`js/synthese-retroaction-rendu.js`, `titreBloc`) | « Note provisoire » | « Note actuelle du cours » (« Note finale » inchangé) | Accepté (8 h 54) |
| 3 | PDF de l'élève, mention sous la note (`texteProvisoire`) | « Note provisoire — peut changer selon tes prochains travaux. » ; « … et l'application de jetons. » | « Cette note peut changer selon tes prochains travaux. » ; « Cette note peut changer selon tes prochains travaux et l'application de jetons. » | Retouché par Cowork, accepté (8 h 54) : le titre du bloc dit déjà « Note actuelle du cours » juste au-dessus. Proposé par la consigne : « Note actuelle du cours — peut changer… » |

## Pour Claude Code

1. Exécuter `CONSIGNE-LOT-2026-10-30-note-actuelle-sommative.md` avec ces trois textes, au caractère près, EN PRATIQUE SOMMATIVE SEULEMENT. En pratique alternative, les trois textes actuels ne bougent pas (« Note provisoire de session », « Note provisoire », « Note provisoire — peut changer… »).
2. Tout autre écran propre à la sommative qui dit encore « provisoire » : le relever au rapport avec une proposition, sans l'appliquer ; Cowork le soumet à Grégoire.
3. Commit avec la consigne et ce fichier. Sans release ni push. Relecture de Cowork.

## Relecture de Cowork (`c019e1f5`), 31 oct., 9 h 07

**Accepté.** `MOTS_DU_BLOC_NOTE` porte les trois textes au caractère près, la pratique alternative inchangée ; un seul titre du profil change, les deux autres cartes étant propres aux standards (mesure de Claude Code, tenue). « Note actuelle = … » dans la formule du profil suit la décision du 30 oct. (substitution mécanique, nommée ici). Rien exécuté.

## Les quatre relevés du rapport, soumis à Grégoire

| R4 | PDF de l'élève, ligne de calcul (`phraseFinale`, `js/synthese-retroaction-rendu.js`), TOUTES les pratiques | « Note finale = … » même pendant le trimestre | La ligne reprend le mot du titre : sommative non finalisée « Note actuelle = … » ; pratique alternative non finalisée « Note provisoire = … » ; notes finalisées « Note finale = … » (inchangé). Les deux formes (avec contribution et sans) | Accepté (9 h 07). Étendu par Cowork aux pratiques alternatives : la contradiction est déjà sur des PDF remis |
| R1 | Réglage « Notes finalisées » (`index.html`) | « Active le titre « Note finale » sur les PDFs de rétroaction (au lieu de « Note provisoire ») et retire… » | « Active le titre « Note finale » sur les PDF de rétroaction, à la place de « Note actuelle du cours » (pratique sommative) ou de « Note provisoire » (pratique alternative), et retire la liste « Artefacts à venir ». À activer en fin de session, quand les notes sont arrêtées. » | Accepté (9 h 08) |
| R2 | Glossaire, « Notes finalisées » (`js/accompagnement-contenu-terme.js`) | « … titrent alors « Note finale » au lieu de « Note provisoire » et ne listent plus… » | « … Les PDF de rétroaction titrent alors « Note finale », à la place de « Note actuelle du cours » (pratique sommative) ou de « Note provisoire » (pratique alternative), et ne listent plus les « Artefacts à venir ». … » (le reste inchangé) | Accepté (9 h 08) |
| R3 | Export des résultats finaux, colonne « Statut » (`js/export-resultats-finaux.js`) | « provisoire » / « final » | **Inchangé** : « provisoire » reste, dans toutes les pratiques | Décidé par Grégoire (9 h 09), sur la recommandation de Cowork : un état du fichier (ce qui peut partir vers Léa), pas un mot sur la note ; une valeur par état, quelle que soit la pratique (règle E7 du 28 oct.) |

### Pour Claude Code : les relevés

1. **R4, toutes les pratiques** : la ligne de calcul du PDF (`phraseFinale`, ses deux formes) reprend le mot du titre ; `MOTS_DU_BLOC_NOTE` peut porter ce mot (« Note actuelle » / « Note provisoire »), « Note finale » une fois les notes finalisées. C'est un correctif sur des PDF déjà remis à des élèves (issue 1).
2. **R1 et R2** : au caractère près. Les deux exceptions nommées de `sentinelle-note-provisoire-reservee` se ferment.
3. **R3** : rien ne change ; la garde qui fige « provisoire » à l'export reste.
4. Gardes et break-tests pour R4 (sommative, alternative, finalisée) et R1-R2.
5. Commit avec ce fichier et `TEXTES-2026-10-31-reponse-du-groupe.md` (la relecture de 8 h 54 y attend). Sans release ni push. Relecture de Cowork.

