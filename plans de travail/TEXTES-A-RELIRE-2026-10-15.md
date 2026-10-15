# Textes à relire – 15 octobre 2026

> Écrit par Claude Code le 15 octobre 2026 à 13 h 49 (Toronto, mesuré par `date`), sur la consigne `CONSIGNE-LOT-2026-10-15-mots-equipes-textes.md`, partie B.
> À soumettre à Grégoire par Cowork, sur une page. Rien de ce fichier n'est posé dans l'application avant sa relecture.

## Comment lire

Six blocs, un par endroit de l'application. Pour chacun : où le texte s'affiche, ce qui s'y trouve aujourd'hui, le texte proposé, et pourquoi. Les textes 1 à 3 sont lus par les enseignants ; les textes 4 et 5 sont lus par les élèves. Chaque phrase qui décrit ce que fait l'écran a été vérifiée dans le code (fichier et ligne entre parenthèses). Ce qui reste incertain est marqué « À trancher ». Tu peux corriger un mot, rayer une phrase, ou répondre « tel quel ».

---

## 1. L'aide du Comparateur de pratiques (#364, T3)

**Où** : Labo › Comparateur de pratiques (`js/comparateur-pratiques.js`). Aujourd'hui, aucune aide : ni bulle, ni fenêtre, ni terme au glossaire. Le bouton d'aide s'ajoutera au titre « Comparateur de pratiques », dessiné par le code (`entete()`, l. 697), pas dans `index.html` : l'écran réécrit tout son contenu à chaque visite (l. 677).

**Le bouton d'aide** (ce que lit un lecteur d'écran, et la bulle au survol) : « Aide : le Comparateur de pratiques ».

**La fenêtre d'aide** – titre : « Comprendre le Comparateur de pratiques »

> Le Comparateur montre ce que deux ou trois pratiques de notation feraient des mêmes parcours d'élèves. Seules les règles de la pratique changent d'une colonne à l'autre.
>
> **Ce que tu vois.** En haut, « Construction de la note » : les réglages de chaque pratique, ligne par ligne. En bas, « Résultat – profils-types » : la note que chaque pratique donnerait à chaque profil. Clique sur un profil pour ouvrir sa fiche : la maîtrise atteinte en fin de parcours et ce que chaque pratique retient.
>
> **D'où viennent les données.** Par défaut, des profils fictifs fabriqués à partir de ton échelle de performance. Tu peux aussi choisir ton groupe actif : ce sont alors tes vrais résultats. Dans les deux cas, comparer n'écrit rien : tes notes ne changent pas.
>
> **Les maquettes.** Une maquette est une copie d'essai d'une de tes pratiques. Tu la dérives, tu changes un réglage, puis tu la compares à l'originale. Si elle te convient, adopte-la ; sinon, jette-la. Tant que tu ne l'as pas adoptée, elle n'apparaît nulle part ailleurs.
>
> *Encadré « attention »* : Un tiret avec « non constructible » n'est pas un zéro : la pratique ne peut pas bâtir de note avec ces réglages et ces résultats. En dénotation, la case dit « jugement » : la note est posée par toi, elle ne se calcule pas.
>
> *Encadré « conseil »* : Un écart entre deux notes n'est ni un bonus ni une erreur. Regarde d'abord « Ce que ces réglages changent », puis la maîtrise atteinte, et seulement ensuite les points.

Vérifié : deux ou trois colonnes (l. 303, `slice(0, 3)`) ; sections « Construction de la note » et « Résultat – profils-types » (l. 409, 429) ; fiche par profil (l. 887, 991) ; source fictive ou groupe actif, lecture seule (l. 27-29, 1068-1072) ; « non constructible » et « jugement » (l. 445-457) ; une maquette n'apparaît ailleurs qu'adoptée (l. 572) ; « Ce que ces réglages changent » s'affiche avant le tableau (l. 792).

**Les trois termes du glossaire** (catégorie « Pratiques de notation », voir : « Labo > Comparateur de pratiques ») :

| Terme | Définition proposée |
|---|---|
| Comparateur de pratiques | Un écran du Labo qui montre, côte à côte, la note que deux ou trois pratiques donneraient aux mêmes parcours d'élèves. Il sert à choisir ou à ajuster une pratique avant de l'adopter. Il ne modifie aucune note. |
| Maquette (de pratique) | Une copie d'essai d'une de tes pratiques, faite pour être comparée. Elle reste dans le Comparateur : tu ne peux pas l'appliquer à un groupe tant que tu ne l'as pas adoptée. Une maquette dont tu ne te sers pas depuis 30 jours porte la mention « dormant ». |
| Dériver une maquette | Créer une maquette à partir d'une de tes pratiques. La pratique d'origine n'est pas modifiée. On dérive d'une pratique, jamais d'une autre maquette. |

Vérifié : maquette hors de la sélection de la pratique active (l. 572) ; « dormant » après 30 jours (l. 536) ; pas de maquette de maquette (`js/pratiques.js:739`) ; nom de la copie « … · maquette N » (`js/pratiques.js:747`).

**Pourquoi** : la fiche demandait une aide qui n'existe pas. **À trancher** : le code dit tantôt « souche », tantôt « pratique aboutie » ; à l'écran, seul « pratiques abouties » apparaît (l. 572). Je propose « une de tes pratiques » dans l'aide, sans aucun des deux.

---

## 2. L'aide de l'import d'un trimestre à l'autre (#364, T4)

**Où** : dans la bibliothèque de chaque sorte de modèle (Conception › Grilles de critères, Pratiques de notation…), section « Importer depuis un autre trimestre », boutons « Voir les… » et « Tout importer » (`js/grilles.js:2276-2284`, `js/pratiques-gestion.js:435-443`).

**Le terme du glossaire.** Aujourd'hui (`js/accompagnement-contenu-terme.js:449`) : « Namespacing (préfixe trimestre) », catégorie « Technique » : « Les données de l'application sont préfixées par le trimestre actif (ex. : `h2026_`, `a2025_`). Ce mécanisme permet de conserver les données de plusieurs trimestres sans conflit et de basculer entre eux. »

Proposé – terme : « Trimestres séparés », catégorie « Réglages » :

> Chaque trimestre garde ses propres grilles, pratiques et évaluations. Ce que tu changes cet automne ne touche pas l'hiver dernier. Pour reprendre un modèle d'un autre trimestre, importe-le : l'application en crée une copie dans ton trimestre actif, et l'original reste intact là où il était.

**La fenêtre d'aide** – titre : « Importer depuis un autre trimestre »

> Importer crée une copie. Le modèle d'origine reste intact dans son trimestre ; c'est la copie, dans ton trimestre actif, que tu modifies ensuite.
>
> **Ce qui change sur la copie.** Une pratique copiée porte « (importée) » à la fin de son nom ; tu peux le retirer. La carte de chaque copie dit de quel modèle elle vient.
>
> **Ce qui voyage avec une grille.** Ses rétroactions (cartouches) sont copiées avec elle.
>
> *Encadré « attention »* : une pratique copiée garde le nom de son échelle et de sa grille. Si elles n'existent pas dans ton trimestre actif, un message te le dit : choisis-les de nouveau en modifiant la pratique.
>
> *Encadré « conseil »* : pas sûr de tout vouloir ? « Voir les… » affiche la liste ; chaque ligne a son propre bouton « Importer ».

Vérifié : copie profonde, id neuf, source jamais modifiée (`js/pratiques-gestion.js:637-650`) ; « (importée) » (l. 647) ; provenance posée sur la copie (l. 653-654, `js/grilles.js:2400-2406`) ; cartouches copiées avec la grille (`js/grilles.js:2408`, `2492`) ; échelle et grille non réassociées, avertissement (`js/pratiques-gestion.js:613-625`, `793`) ; import refusé si le trimestre actif est clos (`js/grilles.js:2468`).

**Les infobulles de « Tout importer »** :

- Grilles : « Copie toutes les grilles de ce trimestre dans ton trimestre actif, avec leurs rétroactions. Les originales restent intactes. »
- Pratiques : « Copie toutes les pratiques de ce trimestre dans ton trimestre actif. Les originales restent intactes. Vérifie ensuite leur échelle et leur grille. »

**Pourquoi** : le terme actuel décrit le mécanisme interne ; l'enseignant a besoin de savoir que l'import ne touche pas ses anciens trimestres. **À trancher** : le code compte cinq boutons « Tout importer », pas deux (grilles, échelles, cartouches, productions, pratiques : `js/echelles.js:1130`, `js/cartouches.js:4080`, `js/productions-bibliotheque-ui.js:214`). Je propose la même bulle pour les trois autres, avec leur nom (« Copie toutes les échelles… »).

---

## 3. Les bulles de « Construction de la note » (#18)

**Où** : l'assistant de création d'une pratique (Conception › Pratiques de notation, `js/wizard-pratique-v2.js`), qui ne porte aucune bulle aujourd'hui (mesure du 9 oct., `MESURE-2026-10-09-fiches-a-trier.md` l. 24). Une bulle par étape, sur son titre. **À trancher** : je lis « Construction de la note » comme cet assistant ; la mesure citait aussi l'encadré « Construction de la note » du formulaire de pratique (`index.html:5855`). Les étapes d'identification (« Comment veux-tu créer ta pratique ? », « Comment calcules-tu la note finale ? », « Identifions ta méthode ») ont déjà une phrase d'explication sous leur titre : je n'y propose rien.

| Étape (titre à l'écran) | Bulle proposée |
|---|---|
| Utilises-tu des règles spéciales ? | Les règles s'ajoutent à la moyenne pondérée. Sans règle, chaque évaluation compte selon sa pondération. |
| Configuration des règles spéciales | Le verrou plafonne la note finale quand l'évaluation choisie n'atteint pas le seuil, même si la moyenne est plus haute. |
| Approche d'évaluation | En PAN-Standards, c'est la progression d'un artefact à l'autre du portfolio qui construit la note, pas la moyenne de tous les essais. |
| Configuration du portfolio | Ici, tu dis quels artefacts comptent : les N meilleurs, tous, les N derniers, ou les N meilleurs plus les obligatoires. Les autres restent visibles, mais n'entrent pas dans la note. |
| Configuration de base (spécifications) | Un travail est « acceptable » quand son résultat atteint ce seuil. À 100 %, toutes ses spécifications doivent être respectées. |
| Configuration des jetons | Un jeton de délai donne quelques jours de plus pour remettre un travail ; un jeton de reprise permet de refaire un travail déjà évalué. Tu fixes combien chaque élève en reçoit. |
| Forfaits de spécifications | Un forfait dit ce qu'il faut réussir pour obtenir une note. La note finale est celle du plus haut forfait atteint. |
| Configuration de la dénotation | La note finale est celle que tu poses. Les cibles cochées la justifient ; la suggestion calculée n'est qu'un repère. |
| Échelle de performance | L'échelle traduit chaque niveau (par exemple I, D, M, E) en pourcentage. C'est elle qui transforme un niveau en points. |
| Grille de critères | La grille donne les critères avec lesquels tu évalues chaque copie. Tu peux la choisir plus tard, dans Conception › Grilles de critères. |
| Récapitulatif | Rien n'est créé avant que tu confirmes. Tu pourras tout modifier ensuite. |

Vérifié : verrou plafond (`js/wizard-pratique-v2.js:2625-2637`) ; quatre modes du portfolio (l. 721-735) et ce que l'assistant écrit (l. 2660-2672) ; seuil d'acceptabilité et sa règle des 100 % (l. 773-776, 2694) ; jetons délai et reprise (l. 2700-2714) ; dénotation et suggestion (l. 238-300, 2719-2735). **Non vérifié à fond** : la phrase « Forfaits » (moteur `pratique-pan-specifications.js`, palier atteint, l. 370) et « Récapitulatif » (le bouton de création).

**Pas de bulle proposée pour deux étapes, et pourquoi** (trouvaille, pour Cowork) : « Nombre d'évaluations » écrit `nbEvaluationsPrevues`, que je n'ai trouvé lu que par la copie, l'import et le registre ; et « Tes seuils personnels » dit servir « au dépistage automatique », mais `va_bien` et `difficulte` ne sont lus que par `interpreterNiveau` (`js/pratiques/pratique-configurable.js:795`), qui n'a aucun appelant. Une bulle sur ces deux étapes risquerait de promettre un effet absent.

---

## 4. L'encadré de l'épreuve uniforme dans le PDF de l'élève (#668, lot 6)

**Où** : le PDF de rétroaction remis à l'élève, sous le critère qui porte la projection (`js/synthese-retroaction-rendu.js`, à construire). Aujourd'hui, aucun encadré : seul le commentaire du critère porte la phrase « En prévision de l'EUF, … » (`js/evaluation-projection.js:249-293`), et il **garde ce verdict** (décision du groupe 2, question 3). Les nombres entre accolades viennent de la copie et du réglage de la grille ; les valeurs de l'EUF sont données entre parenthèses. Le nom des paliers est celui de la grille (modifiable par l'enseignant).

**Titre** : « Ta copie et l'épreuve uniforme de français »

**La mesure** :
> Sur tes {mots} mots, {erreurs} erreur{s} ont été comptée{s}. À ce rythme, un texte de {longueur} mots (900 à l'épreuve) en compterait environ {projection}. L'épreuve en tolère {seuil} (30).

**La rangée des paliers** (celui de l'élève mis en évidence, les autres en gris) – avec les valeurs de l'EUF :
> Sans erreur · Excellent (9 ou moins) · Très bien (12 ou moins) · Bien (15 ou moins) · Risqué (30 ou moins) · Échec (plus de 30)

Les nombres entre parenthèses sont des erreurs sur 900 mots, déduits des seuils de la grille (`ratioMax` 0,3, 0,4, 0,5, 1, l. 260-286) ; ils changent si l'enseignant règle une autre norme.

**La phrase de cadrage** :
> Ce repère te situe face à l'épreuve uniforme, une condition pour obtenir ton diplôme. Il ne change pas ta note dans ce cours : ta note se calcule autrement.

**Le service d'aide** (seulement si l'enseignant a inscrit un nom ; le lien, s'il y en a un) :
> Pour t'aider à réduire tes erreurs : {service}. {lien}

**Le palier « zéro erreur »** (remplace la mesure ; aucune projection affichée) :
> Aucune erreur n'a été comptée sur tes {mots} mots.

Vérifié : la projection ne lit jamais la norme de notation du cours (l. 15-25) ; le palier « Sans erreur » existe et n'a pas de nombre (l. 251-256, 644-650) ; sans mots, aucune projection (l. 641) ; nom du service vide = aucune recommandation (l. 368-372) ; le lien est facultatif (l. 391-394).

**Pourquoi** : la décision répartit les rôles ; le commentaire dit le verdict, l'encadré dit les nombres, la rangée et le service. **À trancher** : (a) la ligne du service sur toutes les copies, ou seulement sur « Risqué » et « Échec » comme la recommandation d'aujourd'hui ; (b) « 9 ou moins » se lit sur la valeur exacte : une copie à 9,4 erreurs projetées s'affichera « environ 9 » et sera « Très bien ». Arrondir la projection à une décimale lèverait l'apparente contradiction.

---

## 5. Les mots du bulletin d'une page (#333)

**Où** : le futur PDF individuel de l'élève (`js/export-resultats-finaux.js`, qui ne produit aujourd'hui que le CSV de synthèse, l. 73-76). Une page : la pratique en vigueur, la note finale, la phrase de construction (décision du groupe 2, question 5). Aucun indice A, C ou P (décision de juin).

**Titre** : « Bilan de fin de trimestre – {cours} »
**Sous-titre** : « {Prénom} {Nom} · DA {da} · Groupe {groupe} · {trimestre} »

**Bloc 1 – titre** : « Comment tu es évalué·e dans ce cours »
> {nom de la pratique}. {description de la pratique, écrite par l'enseignant}

**Bloc 2 – titre** : « Ta note finale » (« Ta note provisoire » si le trimestre n'est pas clos)
> {note} %

Si la note ne se construit pas : « Ta note ne peut pas encore être calculée : {cause}. Parles-en à ton enseignant·e. »

**Bloc 3 – titre** : « Comment ta note est construite », une phrase par famille :

| Famille | Phrase proposée |
|---|---|
| Sommative | Ta note est la moyenne pondérée de tes {N} évaluations. |
| PAN – Standards | Ta note combine ton portfolio ({x} %) et ta production terminale ({y} %). |
| PAN – Spécifications | Ta note est celle du palier « {palier} », le plus haut que tu as atteint. |
| PAN – Dénotation | Ta note a été posée par ton enseignant·e, selon les cibles d'apprentissage que tu as atteintes. |

Vérifié : chaque famille rend déjà ces nombres dans son récit (`synthese.formuleTexte` : SOM `pratique-sommative.js:252`, STD `profil-etudiant-actions.js:631`, SPE `pratique-pan-specifications.js:370`, DEN `pratique-configurable.js:487`) ; statut provisoire, final ou non constructible avec sa cause (`export-resultats-finaux.js:92-104`).

**Pourquoi** : le texte du récit est écrit pour l'enseignant (« portfolio × 70 % + terminale × 30 % ») ; ces phrases le disent à un élève. **À trancher** : la description de la pratique est écrite par l'enseignant pour ses collègues et peut être technique ; la fiche prévoyait un champ « principe » à part (BACKLOG #333), qui n'existe pas encore.

---

## 6. Les phrases factuelles de A1 et la ligne de A3

**Déjà posé, sur ta décision de 11 h 38** (commit `a43513d7`) : tes mots, tels quels. Au profil d'un élève, les deux cartes « Contexte d'apprentissage » et « Mobilisation » écrivent maintenant la même phrase, par exemple « Absences rares, quelques travaux manquants » ; seul « Décrochage » reste un mot à part. Les couleurs et les bornes n'ont pas bougé.

**6a. Aucune phrase de remplacement proposée** pour les anciennes descriptions qui jugeaient (« engagement soutenu », « situation d'urgence », « Contexte fragile. La tendance actuelle invite à un suivi rapproché. »…). Pourquoi : celles du réglage des seuils n'étaient lues par aucun écran ; celle de la carte « Contexte d'apprentissage » répétait le mot du badge, que ta phrase remplace déjà. La carte montre maintenant le badge, A, C, puis la recommandation. Si tu veux une phrase sous le badge, dis-le.

**6b. Quatre phrases d'aide, retouchées pour ne plus nommer les zones du tableau de bord** (le dégradé n'a plus de mot). À relire :

| Où | Avant | Maintenant |
|---|---|---|
| Bulle de la légende, Tableau de bord › Aperçu | « Fragile (30-47,5 %), Modéré (47,5-65 %), Favorable (65-82,5 %), Très favorable (≥ 82,5 %). » | « Quatre repères sous le dégradé : 30-47,5 %, 47,5-65 %, 65-82,5 %, ≥ 82,5 %. Ils situent un point, ils ne classent pas l'étudiant·e. » |
| Bulle « Observer » du même écran | « … une échelle qui décrit son contexte d'apprentissage observé, allant de Fragile à Très favorable. » | « … une échelle continue, de 30 % à 100 %. » |
| Fenêtre d'aide de l'Aperçu | « Les zones de couleur – Fragile, Modéré, Favorable, Très favorable – t'aident à repérer… » | « Les zones de couleur t'aident à repérer… » |
| Glossaire, terme des indices A-C-P | même phrase | même retrait |

**6c. La ligne des équipes** (#1041, commit `cae3178a`). Où : Animation › Équipes, sous l'option « Des équipes plus grandes », seulement quand le reste est trop grand pour donner une personne de plus à chaque équipe (exemple : 7 élèves en équipes de 4).

> Au plus une personne de plus par équipe : il en reste trop, une équipe sera de 3.

Pourquoi : elle dit ce qui arrive (une équipe plus petite) et pourquoi, en une ligne. Le chiffre est calculé. Variante plus courte, si tu préfères : « Une équipe de 3 : il manque de monde pour en agrandir chacune. »
