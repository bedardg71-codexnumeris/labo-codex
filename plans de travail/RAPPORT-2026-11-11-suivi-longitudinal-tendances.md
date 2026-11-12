# Rapport — Suivi longitudinal, lot 1 : l'onglet « Tendances » (11 nov. 2026)

**Dernier relais (12 nov. 2026, fin de séance — Grégoire reprend plus tard).**
Branche `claude/lot-suivi-longitudinal-tendances-wi505g` (la consigne nommait `lot/suivi-longitudinal-tendances` ;
la session nuage ne pousse que sur la sienne), partie de `main` à `9aa3ff284`. PR #18 d'aperçu, en brouillon, à NE
PAS fusionner (ordre de Grégoire, 11 nov., 12 h 17). Aucune release, aucune ligne de Nouvelles. La surveillance de la
PR est ARRÊTÉE à sa demande. `RELAIS.md` (sur `main`) n'a PAS été touché : cette session ne pousse pas sur `main`.

**Où on en est.** Le lot 1 est codé et révisé (ci-dessous), visible à l'aperçu. Puis la séance est devenue une
EXPLORATION, sans code : le suivi longitudinal s'est révélé un cas particulier d'un outil plus large. Tout est dans
**`plans de travail/CADRAGE-2026-11-12-comparer-des-groupes.md` (v10)** — à lire en premier à la reprise.

**Reprise du 12 nov., 2e séance (exploration, aucun code).** Le premier fil ouvert ci-dessous est traité : le
cadrage passe en **v11**, § 6 quater. Le Labo se dessine en quatre sous-onglets (Observations · Journal ·
Exploration · Outils) ; l'étude s'écrit dans le Journal ; Rythme part vers Évaluation, Modélisation vers Animation.
Puis, § 1 quater : la démarche est une enquête de praticien, pas de la recherche ; cinq garde-fous retenus ; deux
mots changés (« étude » devient « question », « conclusion » devient « ce que j'en retiens »).
Cette séance a tourné sur `claude/awesome-bohr-q7rsa1` (posée sur la tête de la branche du lot, `5b76121`) : la
session nuage ne pousse que sur la sienne. À ramener sur la branche du lot par avance rapide.

**Ce que Grégoire a décidé pendant l'exploration (12 nov.)** :
1. L'objet du Labo est d'étudier les données en COMPARANT ; le longitudinal est une option parmi d'autres.
2. Ce qu'on compare, au fond : des VERSIONS de son enseignement. Les groupes en sont le moyen.
3. **Le microscope** (nom de travail) : l'instrument où l'on observe les micro-données.
   **Une étude** (mot confirmé) : une hypothèse, des observations, une conclusion.
4. **L'application propose, l'enseignant·e écrit ; la réflexion ne se délègue pas** (d'où : pas d'IA pour l'instant).
   L'écran ne commente ni les données ni l'échantillon, et ne conclut pas.
5. Le journal des changements : il repose sur l'alignement du cours et sur ses systèmes (pratique, jetons) ;
   l'application constate les différences entre deux trimestres, l'enseignant·e dit pourquoi et ce qu'il en attend.
6. L'étude n° 1 (le cours suivant) : pour l'instant, seul le SEUIL DE RÉUSSITE se compare ; l'enseignant·e compare ses
   propres cohortes. À l'écran, les deux cohabitent : le nuage d'abord, le tableau de comptes ensuite (le tableau est
   une lecture du nuage).

**Ce qui reste ouvert, dans l'ordre où Grégoire voulait le reprendre** :
- la place du microscope dans le Labo, et ce que deviennent Études et Bilan (fil proposé, pas entamé) ;
- les autres études possibles, au-delà du cours suivant ;
- une question laissée sans réponse : qu'est-ce qui confirmerait l'hypothèse de l'étude n° 1 ?
- le titre de l'onglet (« D'un cours au suivant » est provisoire ; deux autres proposés) — sans doute caduc si
  l'onglet déménage dans le microscope ;
- à mesurer avant de promettre : ce que les archives et les deux « états du cours » permettent vraiment de comparer ;
  si la marque d'un jeton est bien dans les copies du registre.

**Ce qui n'est PAS fait, et ne doit pas l'être sans son accord** : aucun code de l'exploration (tableau de comptes,
hypothèse et conclusion, journal). Proposé par Claude Code comme deuxième version de l'aperçu ; Grégoire a répondu
« on explore encore un peu ». Le passage sous WebKit (Mac) du lot 1 reste à faire.

**Pour essayer l'aperçu** : https://deploy-preview-18--codexnumeris-051225.netlify.app — un codex fictif (44 inscrit·es
inventé·es) a été remis à Grégoire dans la conversation ; il n'est pas au dépôt. Déclarer la séquence dans l'onglet.

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
