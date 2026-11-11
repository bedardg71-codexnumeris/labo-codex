# Rapport — Suivi longitudinal, lot 1 : l'onglet « Tendances » (11 nov. 2026)

**Dernier relais.** Branche `claude/lot-suivi-longitudinal-tendances-wi505g` (la consigne nommait
`lot/suivi-longitudinal-tendances` ; la session nuage ne pousse que sur la sienne), partie de `main` à `9aa3ff284`.
PR #18 d'aperçu, à NE PAS fusionner (ordre de Grégoire, 11 nov., 12 h 17). Aucune release, aucune ligne de Nouvelles.
**Fait** : les deux onglets, le nuage, les filtres, la bulle, « Voir son dossier », puis la RÉVISION du soir (ci-dessous).
**Reste** : le titre de l'onglet (Grégoire choisit entre trois ; « D'un cours au suivant » est provisoire) ; la relecture
des mots ; le passage sous WebKit (Mac) ; le lot 2 (graphiques par critère, mentions « échec » et « abandon »).

## La révision du 11 nov. au soir (décisions de Grégoire, à l'aperçu)

1. **Rien de propre à une discipline n'est écrit en dur.** Plus de « 101 », « 102 », « ton 101 », ni de liste fixe de
   cours. La séquence est DÉCLARÉE par l'enseignant·e, dans l'onglet : un cours d'origine, un ou plusieurs cours suivants.
   Les mots de l'écran prennent les noms des cours déclarés.
2. **L'écran ne commente ni la qualité des données ni celle de l'échantillon.** Partis : « c'est peu : c'est une piste,
   pas une preuve », « trop tôt pour dire », « une tendance, pas une preuve », la phrase sur le correcteur, la remarque
   « hors séquence », et la phrase sur le lien entre les deux notes — avec le calcul de corrélation et ses seuils,
   retirés du code. « Ce que ça dit » donne deux comptes : la réussite, et les inscrit·es non placé·es.
3. **Aucune saison n'est choisie d'office.** Toutes les cohortes sont affichées à l'ouverture ; « Automne » et « Hiver »
   restent des raccourcis de sélection, offerts quand une cohorte est de cette saison.
4. **La porte reste ouverte.** Le nuage reçoit une comparaison (une mesure en abscisse, une en ordonnée, un groupe par
   bille : `comparaisonDeCours`) et ne sait rien des cours. Aucune autre comparaison n'est construite.

## Ce qui a été tranché — corrigeable

- Les cours offerts à la déclaration sont ceux que le registre connaît : le code de cours des dossiers pour l'origine,
  le cours des résultats ultérieurs pour les suivants. Deux écritures d'un même cours (« 601-102 », « 601-102-MQ ») sont
  deux cours : le texte saisi fait foi, à la casse, aux accents et aux espaces près. (Avant la révision : « contient 101 ».)
- La séquence est rangée sous une clé globale neuve, `tendancesSequence` (inscrite à `CLES_GLOBALES` et à
  `DATA-OWNERSHIP`). L'onglet n'est donc plus strictement en lecture seule : il écrit CETTE clé, au geste de déclaration,
  et jamais le registre ni un trimestre.
- Note d'origine : `indices.cp.actuel.P` du dossier, lue par la règle du dossier déplié (`noteConstructible` absent =
  constructible). Deux dossiers du cours d'origine : le plus récent ; la bulle le dit. Deux résultats du même cours : le
  plus récent par le trimestre en texte libre (illisible = le plus ancien ; égalité = le dernier saisi).
- Cohorte : le trimestre du dossier d'origine retenu. Sans dossier d'origine : ni placé·e ni compté·e.
- Note hors de l'échelle (origine sous 50, suite sous 40) : bille au bord, la bulle le dit.
- Limite connue, non corrigée : pour l'A2024, P n'est pas toujours la note transmise.

## Mots proposés (à relire par Grégoire) — tous dans `MOTS`

- Titre (provisoire) : « D'un cours au suivant ». Introduction : « Chaque bille est un·e étudiant·e inscrit·e au registre.
  Touche une bille pour savoir qui c'est. »
- Déclaration : « Ta séquence de cours » ; « Choisis le cours d'origine, puis le ou les cours qui le suivent : le nuage
  place la note du premier face à celle du suivant. » ; « Cours d'origine » ; « Choisir… » ; « Cours suivants » ;
  « Choisis un cours d'origine et au moins un cours suivant pour voir le nuage. »
- Comptes : « {k} des {m} étudiant·es qui ont réussi le {origine} ont aussi réussi le {suivant}. » et ses accords ;
  « {x} inscrit·es n'ont pas de note de {origine} calculable et ne sont pas placé·es. »
- Axes et zones : « Note finale en {origine} », « Note en {suivant} », « Réussite en {origine} et en {suivant} »,
  « Réussite en {origine}, échec en {suivant} », « Sous 60 en {origine} ».
- En anonymisation, le pseudonyme reste « Élève R… » : c'est celui du registre (28 sept.), non retouché ici.

## Technique

- `js/suivi-tendances.js` : calcul pur + rendu par le DOM (`textContent`, pas d'`innerHTML`). Le 60 vient de
  `window.NOTE_DE_PASSAGE`. `js/registre-longitudinal.js` : les onglets, `ouvrirDossierLongitudinal` ; l'écran
  « Registre » garde sa structure. `js/trimestres.js` : la clé à `CLES_GLOBALES`.
- La bille porte `.barre-etudiant` (seule source de la sphère) ; la teinte de cohorte est multipliée au dégradé.
- Jetons `?v=20261110u` (styles.css, registre-longitudinal.js, suivi-tendances.js, trimestres.js).

## Tests

- Vitest `sentinelle-suivi-tendances-lot1` : 39 essais, sur des cours d'une autre discipline. Suite complète : 917
  fichiers, 11 419 essais, verts.
- Chromium `suivi-tendances-lot1.spec.js` : T1 à T6 verts (T7 = les captures, sur demande). WebKit : non passé.
- Break-tests : 23 mutations (34 passages), toutes rouges puis restaurées — dont « un mot de discipline revient en dur »,
  « un jugement revient dans Ce que ça dit », « la séquence se sème toute seule », « la déclaration n'écrit pas »,
  « la déclaration écrit le registre », « la clé n'est plus globale », « une saison revient par défaut ».
- Captures : `plans de travail/captures-2026-11-11-suivi-tendances/` (1180 × 820 et 820 × 1180, clair et sombre).

## Trouvailles (les trois issues)

- `registre-longitudinal-915.spec.js` R5 est rouge sous Chromium SUR `main` aussi (une tuile bouge de 2 à 4 px) : code
  étranger, WebKit est le juge. **Inscrire et continuer** — à vérifier au verdict du Mac.
- `.onglet-developpement-tab:hover` et `.rl-resultat-bouton:hover` vivent hors de `@media (hover: hover)` (#540) : étranger.
  **Commenter et oublier** ici ; les onglets neufs ont leurs propres règles, sous la garde.
- L'import par cases (« Importer les données ») ne reconnaît pas `registreLongitudinal` : le registre ne voyage que dans
  un codex. Constaté en préparant un registre fictif pour l'aperçu. **Inscrire et continuer** si Grégoire le vit.
