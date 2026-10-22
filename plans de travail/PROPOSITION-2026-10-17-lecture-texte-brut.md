# Proposition – lire une grille écrite en texte brut, sans tableau

> Cowork, samedi 17 octobre 2026, 12 h 35 (Toronto), à la demande de Grégoire (12 h 11 et 12 h 14). **Une proposition, pas une consigne.** Elle suit `PROPOSITION-2026-10-17-reconnaissance-des-grilles.md` (les tableaux) et s'appuie sur la même base.
> ⛔ Public : corpus inventé, aucune grille réelle, aucun nom.

## Pourquoi

Grégoire (12 h 11) : « beaucoup d'enseignants n'utilisent pas les tableaux dans Word. C'est déjà un obstacle pour eux. Ils utilisent plutôt le simple traitement de texte avec une description du critère et le total de points à côté. » Et : « aussitôt qu'il y a des chiffres, il s'agit d'une note chiffrée » : une grille en texte qui porte des points est une grille **analytique**.

⚠ Ceci revient sur une supposition du cadrage du 15 octobre (« un texte en prose, sans tableau, ne se reconstruit pas : le dire à l'écran »). Le message affiché aujourd'hui (« L'application n'a pas trouvé de tableau… », validé le 17 à 8 h 53) devra changer : ses mots reviennent à Grégoire.

## Ce que fait la version actuelle (mesuré sur `51a7be2b`)

Quinze formes de texte collées comme le ferait le presse-papiers (`text/plain`, et `text/html` en paragraphes) :

- **14 sur 15 sont refusées.** Sans tabulation : « pas de tableau ». Avec des tabulations, chaque ligne qui en porte devient une rangée de tableau : une puce de Word (« •⇥texte ») fait une rangée de deux cases, et la grille est refusée comme « incomplète » ; « Nom⇥15 » (points de conduite de Word) aussi, parce qu'un nombre nu n'est jamais lu comme des points (règle de l'étape 5, juste dans un tableau).
- **1 sur 15 passe à moitié** (parties, critères « ⇥/ 30 ») : trois critères sur quatre, onze lignes à « À classer » (tous les sous-éléments, la partie), le premier critère perdu.

## Le principe proposé : un tableau reconstruit, puis la même suite

Le texte n'a pas besoin d'un chemin à part. **L'application range le texte en tableau, puis tout continue comme pour un tableau collé** : l'étape « Ce que contient ton tableau » montre le tableau reconstruit avec ses menus de rôle, l'enseignant·e corrige s'il le faut, l'assistant et la création ne changent pas.

- Le tableau reconstruit a ses colonnes nommées par leur rôle : [Partie] | Critère | Points | Sous-critères | Description | [un niveau par étiquette]. **Aucune case inventée** : chaque case est un morceau d'une ligne du texte ; les en-têtes des colonnes de niveau sont les étiquettes du texte (« Excellent »), les autres restent vides.
- Le prototype produit exactement la forme que lit `modeleDepuisRoles` (`{ rangees, avant, apres }` et des rôles). Mesuré : sur les quinze formes, le modèle construit par **le code actuel** à partir du tableau reconstruit a les critères, les points, les parties (préfixe « Partie – Critère », celui de l'étape 5), les sous-critères et les descriptions attendus ; l'assistant n'y signale aucun manque, sauf ceux qui sont attendus (voir « Ce qui reste ouvert »).

### Où ça se branche

1. `lirePressePapiers` : un `<table>` dans le HTML → `lireHtml` (inchangé) ; sinon, un texte à **au moins trois colonnes** de tabulations régulières (copie d'un tableur) → `lireTexte` (inchangé) ; sinon → **`lireTexteBrut`** (neuf). S'il ne trouve aucun critère, le message d'aujourd'hui, réécrit.
2. La lecture porte ses rôles (`lu.roles`) : `interpreter` les prend au lieu de `proposerRoles`.
3. Source neuve « texte » : l'étape « Sens du tableau » est sautée (inverser un tableau reconstruit n'a pas de sens).

## Les règles de lecture (prototype : `plans de travail/PROTOTYPE-2026-10-17-lecture-texte-brut.js`)

Chaque ligne reçoit une sorte, puis les lignes se regroupent en critères.

1. **Les points d'une ligne.** En fin de ligne : « / 10 », « (10 pts) », « : 10 points », « – 30 % », « sur 10 », « ……… 10 » (points de conduite tapés), « ⇥10 » (tabulation de Word), « (5) » ; des blancs à remplir devant sont permis (« ____ / 15 »). En tête : « 10 pts – … », « [10] … ». **Jamais un nombre nu dans la prose**, jamais un nombre négatif (une déduction n'est pas un maximum). Une ligne à points est un **critère**.
2. **Les marques de liste** (•, o⇥ de Word, ☐, ↳, ·, -, –, 1., a), i.) sont retirées et donnent un **rang** : une ligne sans marque est au rang 0 ; chaque forme de marque reçoit un rang dans l'ordre où elle apparaît ; un retrait en tête de ligne s'y ajoute.
3. **Parties.** Une ligne à points suivie de lignes à points plus profondes est une **partie** ; ses lignes sont les critères. Si leur somme diffère des points de la partie, avertissement au conditionnel. Une ligne sans points, courte, sans ponctuation finale (ou finissant par « : », ou en capitales), suivie d'un critère plus profond, est aussi une partie. **Une « partie » sur la toute première ligne couvrirait toute la grille : c'est le titre.**
4. **Sous une ligne à points** : une ligne à marque sans points → **sous-critère** ; une ligne sans marque → **description** ; « Nom : explication » sur la ligne du critère → nom et description (si le nom tient en 60 caractères).
5. **Niveaux décrits en texte** (« Excellent (18-20) : … ») : retenus comme niveaux si les mêmes étiquettes reviennent sous **au moins deux critères** et qu'au moins la moitié portent des points ; sinon ces lignes vont à la description (« Définition : … » répété sous chaque critère n'est pas une échelle). La plage reste en tête du descripteur : « (18-20) la thèse est claire… ».
6. **Lignes coupées** (copie d'un PDF) : une ligne sans points et sans ponctuation finale, suivie d'une ligne à points qui commence par une minuscule, ne fait qu'une ligne.
7. **Pied et autour.** « Total », « Sous-total », « Note : », « Note finale », « Résultat : » → « À classer » (« Ligne de total ») ; « Commentaires : » et les lignes de traits qui le suivent → « À classer » (« Espace de commentaires ») ; une pénalité ou une déduction (« -0,5 par faute », « retard ») → « À classer » (« Déduction ou pénalité »). Avant le premier critère : la 1re ligne est le **nom de la grille** ; les autres (consigne, date, poids dans la session) → « À classer » (« Texte avant la grille »).
8. **Sans aucune ligne à points** (liste de vérification) : chaque ligne à marque est un critère sans points ; l'étape « Points » de l'étape 5 les demande.

## Mesures

Un critère est « lu juste » quand son nom, ses points et sa partie sont ceux qu'un·e enseignant·e attendrait ; une grille, quand tous ses critères et son nom le sont.

| Corpus | Grilles lues juste | Critères lus juste |
|---|---|---|
| A. 15 formes écrites par Cowork en même temps que les règles | 15 sur 15 | ⚠ complaisant : règles et corpus de la même main |
| B. 14 grilles écrites **à l'aveugle** par un autre agent (disciplines variées, coquilles, copies de PDF), avant toute correction | **7 sur 14** | **58 sur 86** |
| B, après les cinq corrections ci-dessous (n'est plus une mesure à l'aveugle) | 14 sur 14 | 86 sur 86 |
| C. 14 grilles écrites **à l'aveugle** par un troisième agent (soins, comptabilité, électricité, mécanique, danse, travail social…), **après** les corrections | **5 sur 14** (9 sur 14 si l'on met les parties de côté) | **43 sur 95** (77 sur 95 pour le nom et les points, partie mise de côté) |

Les sept échecs du corpus B, et la règle qu'ils ont fait ajouter (toutes générales, aucune propre à une grille) :
- une copie de PDF coupe un critère sur **trois** lignes, ou coupe la ligne d'un critère numéroté (« 1. Page titre : respect des normes de / présentation… /5 ») → les suites en minuscule remontent jusqu'à leur tête ;
- des points **entre parenthèses en tête** de ligne (« (10)  Échauffement… ») → reconnus ;
- une étiquette de numérotation (« Critère 1 : », « Critère 2 – ») → retirée du nom ;
- une dernière ligne « Note de l'examen : ____ sur 100 », dont les points couvrent ceux des autres → total, pas critère ;
- des puces mélangées par mégarde (« • » puis « - ») faisaient d'un critère le parent du suivant → **une partie demande au moins deux critères à points sous elle**.

Le passage par le code de l'application (tableau reconstruit → `modeleDepuisRoles` de `51a7be2b`) rend, pour les 14 grilles du corpus B, les mêmes noms (préfixés de leur partie) et les mêmes points.

### Ce que dit le corpus C (non corrigé : c'est la mesure qui compte)

- **Les règles ne généralisent qu'à moitié.** Chaque nouvelle main apporte des formes que personne n'avait prévues. Corriger après chaque corpus ferait monter le score du corpus, pas celui du prochain.
- **Les échecs sont souvent totaux.** Deux grilles sur quatorze ne donnent **aucun** critère, parce que leur forme de points n'était pas prévue (« (sur 15) » ; « ____ /10⇥Nom », les points en tête après des blancs) : l'enseignant·e verrait « aucune grille trouvée ». Une troisième (énumération « A. », « B. » en capitales, noms coupés dont la suite commence par une parenthèse) donne des noms faux.
- **Les parties sont la principale source d'erreur restante** : un intertitre au-dessus de tous les critères (« Critères d'évaluation », « Pondération : 20 % de la note finale ») est pris pour une partie ; « Volet A – » reste dans le nom de la partie ; une hiérarchie à trois niveaux se décale.
- **Artefacts de PDF** : un en-tête de page répété et « Page 1 / 2 » deviennent des critères de 2 points.
- Ce qui tient : quand la forme des points est reconnue, le nom et les points de chaque critère sont justes presque partout.

### Ce que cela change à la proposition

1. **Ne jamais rendre « rien ».** Si aucune forme de points n'est reconnue mais que le texte a plusieurs lignes, proposer **une ligne = un critère sans points** et laisser corriger, plutôt que le message d'échec.
2. **Corriger ligne par ligne** (forme **validée par Grégoire le 17 oct. à 12 h 43**). Pour un texte, l'étape de correction montre **le texte collé, une ligne par rangée**, avec un menu de rôle sur chaque ligne (Titre, Partie, Critère, Sous-critère, Description, Niveau, À ignorer) et le champ des points prérempli quand il a été lu. C'est le même geste que le menu de rangée du lot 3a, appliqué aux lignes de l'enseignant·e plutôt qu'à un tableau qu'il ou elle n'a jamais écrit ; une erreur de lecture se répare en un geste. Le tableau reconstruit reste interne (il nourrit `modeleDepuisRoles`).
3. **Parties prudentes** : une partie qui coiffe **tous** les critères n'en est pas une (intertitre) ; l'étiquette de numérotation (« Volet A – ») est retirée aussi des parties.
4. Les formes de C qui ont échoué entrent au banc **comme essais à faire passer par le lot**, pas comme règles déjà écrites : « (sur N) », « ____ /N⇥Nom », « A. » en capitales, suite d'un nom coupé qui commence par une parenthèse, en-têtes et numéros de page d'un PDF.

Formes du premier corpus (toutes inventées) : barre en fin de ligne et description dessous ; puces de Word et points entre parenthèses, sous-éléments « o⇥ » ; points de conduite tapés ; tabulation de Word ; numérotation et parties qui totalisent leurs critères ; pourcentages après un tiret ; points en tête de ligne ; niveaux décrits sous chaque critère ; copie de PDF aux lignes coupées ; liste de vérification sans points ; déductions et pénalités ; parties sans points et espace de commentaires (avec tabulations, puis alignée par des espaces) ; « sur N » et « : N points » ; consigne avant la grille et blancs à remplir.

Cas négatifs : une prose sans grille ne donne rien (le message s'affiche). **Faux positif connu** : une consigne « Police de 12 points » devient un critère « Police de » (12). L'étape des rôles le montre ; un geste « À ignorer » le retire.

## Ce qui reste ouvert

- **Les points décimaux** (« 2,5 pts ») bloquent la création (« des points en nombre entier de 1 à 100 ») : règle des tableaux (mesure de l'étape 4 : l'éditeur de grilles lit la pondération en entier). Le texte la rencontre plus souvent. Supposition technique : la garder pour lundi ; accepter les décimaux demanderait de toucher l'éditeur de grilles, à inscrire.

- **Les niveaux d'une grille à points** (forme « Excellent (18-20) : … ») : avec la décision de 12 h 11, ces critères sont analytiques ; aujourd'hui, l'assistant traite toute grille qui a des niveaux comme une grille à échelle (il demande plages et notes retenues). C'est le même point que la famille B des tableaux (points dans chaque case) : à régler une fois pour les deux.
- **Les mots** (étape 7) : le message « pas de grille trouvée », l'encadré de l'étape « Ce que contient ton tableau » quand le tableau vient d'un texte (« Ton texte, rangé en tableau par l'application : à vérifier »), les raisons à classer neuves.
- **Ordre des lots** : cette lecture s'appuie sur les règles de la proposition « tableaux » (puces, lignes de pied, « / 0 »). Recommandation : le lot « tableaux » d'abord ; celui-ci ensuite, il en réutilise les règles.
- **Les trois corpus** (A, B, C : 43 grilles inventées, avec leurs lectures attendues) sont dans `plans de travail/CORPUS-2026-10-17-grilles-texte-brut.mjs`, à verser aux bancs du lot ; B et C tels qu'écrits à l'aveugle.
- Rien n'est mesuré dans Safari ni sur l'iPad : ce qu'y contient `text/plain` après une copie dans Pages et dans Word pour iPad est une porte terrain à prévoir.
