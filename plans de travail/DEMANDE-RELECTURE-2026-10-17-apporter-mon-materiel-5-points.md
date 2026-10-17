# Demande de relecture – « Apporter mon matériel », étape 5 du plan : les grilles en points

> Claude Code, samedi 17 octobre 2026, début d'après-midi (Toronto). Consigne : `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5-points.md` (9 h 48), via `CONSIGNE-DU-JOUR.md` (11 h 27). Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Un commit local, non poussé : `51a7be2b`**, au-dessus de `74527da6` (lot 3b1 et sa demande, non poussés) et de `4a972d13` (en ligne). Aucun push, aucune release, aucun verdict complet (étape 8).

## A. Le verdict du lot 3b1

Fait dans le même commit : **#1095** (iPad) et **#1096** (import d'une sélection, `echelleId`) inscrits ; le verdict, la consigne du jour, son archive et le plan mis à jour commités. `CONSIGNE-DEMARRAGE-COWORK.md` (modifié, à toi) **n'est pas** commité : la consigne du jour ne le nommait pas.

## État mesuré

- Vitest complet, depuis `tests/` : **768 fichiers, 9 077 essais, verts**.
- Banc neuf `tests/unit/materiel-etape5-points.test.js` : 30 essais ; **35 mutations, 35 rouges**, restaurées, vert après. Une mutation restée verte a fait retirer une garde que j'avais posée et qui ne servait à rien (les manques de niveaux d'une grille sans niveau).
- Spec neuve `tests/integration/materiel-etape5-points.spec.js` : 4 essais (le parcours collé → « sur 64 » → « Créer ma grille » → badge « ANALY » ; #1095 à 820, 1180 et 1440 px) ; **5 mutations, 5 rouges**. Les specs du matériel (lots 1, 2, 3a, 3b1, bandeau, étape 5), lancées seules dans WebKit : 16/16. Ce n'est pas le verdict.
- Trois essais anciens ajustés à la règle neuve, et à elle seule : R.b et M.h (lot 3a), C.a (lot 3b1). Détail plus bas.

## Ce que j'ai fait, et ce que j'ai supposé

1. **Le nom et la description d'une case de critère.** Première ligne = nom, les suivantes = description, puces retirées. Toutes les grilles. ⚠ C'est ce qui change **R.b** (lot 3a) : « Thèse / claire » donnait le nom « Thèse claire », il donne maintenant « Thèse » et la description « claire ».
2. **« Partie ».** Proposée quand la 1re colonne porte, **sous l'en-tête**, une case fusionnée sur plusieurs rangées, que chacune de ces rangées a un texte dans la 2e colonne, et que celle-ci peut porter les noms : son en-tête prolonge celui de la 1re (« CRITÈRES » sur deux colonnes), parle de critères, **ou** il n'y a aucune autre colonne de niveau.
   - **Supposé** : cette dernière condition protège le cas **I.j** du lot 1 (un critère dont le nom couvre deux rangées, dans une grille à niveaux) : la rangée du dessous reste sa suite. Une grille à niveaux avec des parties mais sans en-tête commun ne se voit pas proposer « Partie » ; la personne la choisit à la main.
   - La partie court sur les rangées que sa case couvre ; une case vide **non fusionnée** l'arrête (rien n'est prolongé à l'aveugle). Une seule colonne « Partie » par tableau.
3. **« Points ou pondération ».** En-têtes reconnus : ceux d'avant, plus Note(s) et Sur N ; ou des cases surtout (plus de la moitié des non vides) en « /4 », « 4 pts », « sur 18 », traits à remplir permis devant. **Jamais un nombre nu** : une colonne « 4 / 6 » sans marque reste un niveau.
4. **Sans colonne de niveau, la grille est en points.** Les rangées d'en-tête sont proposées « À ignorer » (plus « Noms des niveaux »). Aucune part égale complétée. `charger` n'exige plus deux niveaux d'une grille en points (une grille à **un** niveau reste refusée, comme avant).
5. **Hors consigne, une ligne « Total »** (nom commençant par « Total ») va à « À classer », avec sa raison. Motif : comptée comme critère, elle doublerait le total. Rien ne disparaît : la personne l'écarte ou la garde.
6. **Le manque « ni niveau ni points »** se dit seulement quand **aucun** critère n'a de points ; s'il en manque à certains, c'est « les points d'un critère » / « de N critères », et l'étape « Points » paraît pour les saisir. **M.h** (lot 3a) perd donc son manque « au moins une colonne Un niveau ».
7. **La création** : `construireGrille` de l'éditeur (lot 3a), puis `type: 'analytique'` sur la grille et sur chaque critère. `ponderation` = les points (entiers 1-100). `resume.ids.echelle` vaut `null` : c'est ce qui change **C.a** (lot 3b1), qui lisait la ligne du source.
8. **#1095.** Mesuré avant toute règle : le champ « Nom du critère » faisait **42 px à 820 et 56 px à 1180** — l'iPad couché était touché aussi. Règle bornée à **1180 px** (iPad Air couché), donc pas à 1024 : le nom sur sa ligne, puis type, pondération et SOLO, puis le descripteur ; `!important` pour passer devant le style en ligne de `grilles.js`, non touché. À 1440 px, la grille à cinq colonnes est intacte (essai). Captures avant/après, 820 et 1180, clair et sombre, sans défilement de côté : dans mon bloc-notes de session, pas dans le dépôt.
   - ⚠ Effet de bord assumé : une fenêtre de Mac plus étroite que 1180 px reçoit la même disposition, qui y était tout aussi écrasée.

## Disposition des trouvailles

- **Inscrire et continuer** : rien de neuf.
- **Commenter et oublier** : le message de l'éditeur de grilles « ses critères totalisent N %, pas 100 % » parle en pourcentage à une grille en points ; déjà relevé par ta mesure (étape 7, mots de Grégoire). Non touché.

## Textes provisoires neufs (pour l'étape 7)

- Rôles : « Partie » ; « Points ou pondération ».
- Raison à classer : « Ligne de total : l'application le calcule elle-même ».
- Manques : « les points de chaque critère, ou des colonnes de niveaux, à l'étape « Ce que contient ton tableau » » ; « les points d'un critère » / « les points de N critères » ; « des points en nombre entier de 1 à 100 pour un critère » / « pour N critères ».
- Étape « Points » : nom « Points » ; titre « Sur combien de points chaque critère est-il noté ? » ; « Ton tableau ne donnait pas les points de chaque critère. Indique-les : un nombre entier de 1 à 100 par critère. Le total est libre. » ; étiquette « sur ».
- Encadré « Dans l'application » : « Les points de chaque critère font partie de ta grille de critères : chaque copie se notera sur ce nombre, et la note se calcule par les points seuls. »
- Total : « Total : sur N ». En-têtes de la Vérification : « Critère », « Description », « Points » ; champ « Description (facultatif) ».
- Ce qui sera créé : « Une grille en points « X » (N critères), sur T. » ; « Aucune échelle n'est créée : la note se calcule par les points seuls. Tu retrouveras ta grille dans Grilles de critères, où tout reste modifiable. »
- Confirmation : « Elle est rangée dans tes grilles, avec N critères notés en points. Rien d'autre n'a changé dans l'application. » ; carte « N critères, sur T. »

## Pour toi

Relecture de l'étape 5 ; puis, au signal de Grégoire, la suite du plan (5b, 6, 7, 8).
