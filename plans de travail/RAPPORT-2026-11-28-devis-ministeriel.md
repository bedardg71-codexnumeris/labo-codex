# Rapport – le devis ministériel dans « Apporter mon matériel »

> Dernier relais : 28 novembre 2026, 8 h 45 (Toronto), session du nuage.
> Branche : `claude/devis-ministeriel-8vylul` (le mandat disait `lot/devis-ministeriel` ; la session du nuage impose son propre nom de branche). Base : `main` à `574bb60`, la 1.260.0.
> PR #67, en brouillon. Sans bump ni changelog. Rien n'est fusionné.
> Fait : les six gestes, la lecture par repères, les bancs, les mots de travail (`TEXTES-2026-11-28-devis-ministeriel.md`).
> Reste : la relecture des mots par Grégoire ; le verdict WebKit (aucun WebKit dans le conteneur) ; l'essai avec un vrai geste de copie (Aperçu, Safari, iPad) ; trois questions plus bas (« Ce qui remonte à Grégoire »).

## Ce qui est livré

Une seconde entrée sur l'accueil d'« Apporter mon matériel ». Le parcours suit les six gestes du mandat : choisir le cours, coller, voir la lecture, corriger, accepter. La fiche du cours reçoit le numéro, l'énoncé, les éléments, et un champ neuf, `devisCompetence`, qui porte le contexte de réalisation et les critères de performance sous chaque élément.

| Fichier | Rôle |
|---|---|
| `js/devis-lecture.js` (neuf) | lire par repères ; les gestes de correction ; vers la fiche et depuis elle. Fonctions pures |
| `js/materiel-devis.js` (neuf) | l'écran. Une seule écriture, `CoursEntite.mettreAJour`, derrière le bouton d'acceptation |
| `js/entites/cours-entite.js` | `devisCompetence` ajouté aux champs modifiables |
| `js/materiel.js` | une garde : la dissection en brouillon ne se rouvre pas par-dessus le devis |
| `index.html`, `styles.css` | l'entrée de l'accueil, la feuille |
| `docs/DATA-OWNERSHIP.md` | la ligne de `cours` dit le nouvel écrivain et le champ neuf |

## Mesures : les cinq devis

Faits mesurés par le banc `tests/unit/devis-lecture.test.js`, sur les textes extraits par `pdftotext` (`tests/fixtures/devis/`).

| Devis | Lu | Mis de côté |
|---|---|---|
| 4EF0 | 6 éléments, **17** critères (1, 2, 1, 3, 8, 2), pas de contexte | l'en-tête, le bloc « Activités d'apprentissage », le numéro de page |
| 01FB | 2 éléments, 8 critères, contexte de 2 phrases | le pied de page (4 lignes) |
| 0013 | 3 éléments, 3 critères, contexte de 3 puces | l'en-tête, les activités, le pied |
| 01FL | 6 éléments, 17 critères, contexte de 4 phrases | les pieds des deux pages ; le code répété est reconnu et ignoré |
| 000Z | 4 éléments, 23 critères mal répartis (0, 3, 14, 6), pas de contexte | les pieds, les activités |

**Écart avec le mandat** : il annonçait 16 critères pour 4EF0. Le texte en porte 17 (l'élément 5 en a huit). Je n'ai rien retiré.

**000Z se corrige en DEUX gestes.** La lecture range sous l'élément 3 ses sept critères, puis les quatre lignes du contexte, puis les trois critères de l'élément 1. Geste 1 : sur la première ligne du contexte, menu « Déplacer », « Cette ligne et les suivantes » vers le contexte de réalisation (sept lignes partent). Geste 2 : dans le contexte, sur la cinquième ligne, « Cette ligne et les suivantes » sous l'élément 1. Vérifié au navigateur (`materiel-devis.spec.js`). Une réserve : les trois critères de l'élément 1 et ceux de l'élément 2 sont mot pour mot les mêmes dans ce devis, donc je ne peux pas dire lequel des deux groupes appartient à quel élément ; le résultat est identique dans les deux cas.

Un mot de `01FL` arrive abîmé de l'extraction (« personnesressources », le trait d'union perdu par `pdftotext`) : la lecture ne l'invente pas, c'est une retouche du geste 5.

## Ce que j'ai tranché

1. **La branche** : celle de la session du nuage, pas `lot/devis-ministeriel`.
2. **Où vit le devis** : dans la fiche du cours, champ `devisCompetence` = `{ contexte: [texte], elements: [{ texte, criteres: [texte] }] }`. Pas de nouvelle clé de stockage.
3. **`elementsCompetence` reste la source des éléments** pour ses lecteurs (`planification-export.js` le découpe par lignes, inchangé). À l'acceptation il est écrit en même temps que `devisCompetence`, un élément par ligne. S'il est retouché à la main ensuite dans la fiche, il fait foi : chaque ligne garde les critères de l'élément du même texte, et ce que le devis portait d'autre reparaît dans les lignes mises de côté quand on rouvre le devis. Rien n'est caché, rien n'est réconcilié d'office.
4. **Les éléments sont numérotés** dans `elementsCompetence` (« 1. Reconnaître… »), dans l'ordre de l'écran.
5. **« Retirer », c'est mettre de côté.** Une ligne retirée va dans le tiroir « Lignes mises de côté », d'où elle se replace. Tout ce que la lecture ne sait pas ranger y va aussi. Le banc H vérifie que chaque mot du collage est dans le modèle ou dans ce tiroir. Ce tiroir ne va pas dans la fiche.
6. **Le pied de page d'un devis d'une page** : je n'ai pas cherché à le deviner. Une seule règle de structure s'applique : une ligne sans repère qui vient après un vide, sous une phrase finie par un point, n'est pas tenue pour la suite de cette phrase ; elle va de côté. Sur les cinq devis, cela suffit à écarter les pieds. Si le geste de copie réel ne laisse aucune ligne vide, le pied se collera au dernier critère, comme le mandat le prévoyait.
7. **Le menu « Déplacer » a deux portées** : « Cette ligne seulement » et « Cette ligne et les suivantes ». C'est ce qui ramène 000Z à deux gestes. Une ligne déplacée se pose au bout de sa destination ; il n'y a pas de geste pour réordonner les critères à l'intérieur d'un élément.
8. **Ajouts hors des six gestes, petits** : « Annuler le dernier geste » ; monter ou descendre un élément ; « Composer le devis à la main » (la même feuille, vide) ; « Voir et corriger ce que la fiche porte », qui rouvre un devis rangé. Ce dernier est le seul endroit où les critères se revoient après l'acceptation.
9. **Aucun brouillon.** Une lecture non acceptée se perd au rechargement ; une question du navigateur protège la sortie.
10. **Les `?v=`** portent le jour du build (27 nov.), comme l'exigent la garde anti-cache et son hook quand il n'y a pas de bump.
11. **La complexité** : la garde du projet a refusé ma première lecture (une fonction à 54 branches). Elle est découpée en dix petites fonctions.

## Ce que j'ai supposé

- **Une compétence par cours** : confirmé par le code. La fiche n'a qu'un `numeroCompetence`, un `competence`, un `elementsCompetence`. Un cours de formation spécifique à plusieurs compétences n'a pas de place aujourd'hui. Un second devis accepté pour le même cours REMPLACE le premier, après la comparaison.
- **« Ses cours »** : les fiches de la collection `cours` qui ne sont pas des services et qui sont dans la sélection (`dansBibliotheque` non faux).
- **Le code du devis** (4EF0) n'est jamais rapproché d'un cours : le choix du cours est toujours fait à la main.
- **Le geste de copie réel** peut donner un autre ordre, d'autres puces ou aucune ligne vide. La lecture accepte déjà : une puce ou un numéro seuls sur leur ligne, les repères sans accents, les fins de ligne Windows, plusieurs caractères de puce. Non éprouvé sur un vrai collage.

## Source ou stock

- **Source** : rien n'est tari, c'est un ajout.
- **Stock** : aucune migration, aucune écriture au démarrage. Les fiches existantes restent telles quelles ; `devisCompetence` n'existe que sur une fiche où un devis a été accepté. Une fiche remplie à la main garde ses lignes (avec leurs puces) jusqu'à ce que son enseignant·e accepte un devis par-dessus, après comparaison.
- **Ce qui voyage** : `devisCompetence` est un champ de la fiche du cours, il part donc avec elle dans les exports. Une version antérieure qui reçoit cette fiche ignore le champ. Une fiche reçue d'ailleurs avec un `devisCompetence` mal formé est lue sans casser (banc F), et ses textes sont échappés à l'affichage.

## Trouvailles, et leur issue

1. **L'accueil est caché quand une dissection est en brouillon** (comportement d'avant le lot : l'onglet rouvre la dissection). L'entrée du devis n'est alors pas atteignable sans « Coller une autre grille », qui efface le brouillon. Issue : **inscrire et continuer**, et c'est la première question ci-dessous, parce que la solution touche l'en-tête de la dissection et ses mots.
2. **`carte-aide-materiel-2026-11-13.spec.js`, essai I1, rouge sous Chromium** : rouge aussi sur `main` sans le lot (mesuré : le texte de la carte défile de 132 px sur `main`, de 93 px avec le lot). Ce banc est réglé pour WebKit. Issue : **commenter et oublier** ; il n'est pas jugé ici.
3. Ce même banc (I4) liste les boutons de la rangée d'actions de l'accueil : mon bouton n'est pas dans cette rangée, le banc reste vrai sans être touché.

## Ce que je n'ai pas pu vérifier

- **WebKit, Safari, l'iPad** : les quatre essais Playwright du lot sont verts sous Chromium seulement.
- **Les deux modes de couleur** : capturés sous Chromium, pas jugés sous Safari.

## Les six gestes joués à l'écran, sur l'aperçu Netlify

Aperçu : https://deploy-preview-67--codexnumeris-051225.netlify.app (commit `b05e237`). Joués par moi sous Chromium (pas Safari), avec deux cours fictifs créés pour l'essai, puis 4EF0 et 000Z collés depuis les jeux d'essai. L'hôte de l'aperçu a dû être ajouté aux hôtes permis de l'environnement « labo-codex » (approuvé à 8 h 50).

Captures dans `plans de travail/captures-2026-11-28-devis-ministeriel/` :

| Geste | 4EF0 | 000Z |
|---|---|---|
| 1. L'accueil, deux entrées | `1-accueil-deux-entrees.jpg` | |
| 2. Le cours choisi | `2-4EF0-cours-choisi.jpg` | |
| 3. Le devis collé | `3-4EF0-colle.jpg` | |
| 4. La lecture | `4-4EF0-lecture.jpg` | `4-000Z-lecture-sort-melange.jpg` |
| 5. La correction | `5-4EF0-corrige.jpg` | `5-000Z-geste-1-vers-le-contexte.jpg`, `5-000Z-geste-2-vers-l-element-1.jpg` |
| 6. L'acceptation | `6-4EF0-range.jpg`, `6-4EF0-fiche-deja-remplie-comparaison.jpg` | `6-000Z-range.jpg` |

Plus `ipad-debout-000Z.jpg` (820 × 1180, aucun débord horizontal mesuré).

Mesuré pendant ce jeu, en lisant la fiche en base : avant « Ranger », les deux fiches n'ont ni numéro ni devis ; après, seule la fiche choisie a changé.

Vu sur les captures, non corrigé : en mode sombre, les menus « Déplacer » et le champ du numéro sortent sur un fond gris, moins assorti que les zones de texte. J'ai basculé le mode par la classe du `body`, pas par le bouton de l'application : je ne sais pas si c'est ce que l'application montre vraiment. À regarder sur ton écran.

## Ce qui remonte à Grégoire

1. **Les mots** : `TEXTES-2026-11-28-devis-ministeriel.md`, 40 textes numérotés.
2. **L'entrée du devis quand une dissection est en cours** : veux-tu un bouton vers le devis dans l'en-tête de l'étiquetage, ou acceptes-tu que le devis ne s'atteigne que depuis l'accueil ?
3. **Les éléments dans la fiche** : numérotés (« 1. … »), avec des puces, ou nus ?

## Gestes d'essai pour Grégoire

Aucun de ces gestes n'écrit avant ton accord ; tu peux abandonner à tout moment par « Revenir à l'accueil ».

1. **Copie ton propre devis depuis ton PDF et colle-le.** Dans Aperçu sur le Mac : ouvre le PDF du devis de ton cours, sélectionne tout le devis de la compétence, copie. Dans Labo Codex : Conception › Mon matériel › « Apporter le devis de mon cours », choisis ton cours, colle, « Lire mon devis ». Dis ce que tu vois : le bon nombre d'éléments ? les critères sous le bon élément ? un pied de page collé à un critère ?
2. **Refais-le depuis Safari**, puis **depuis l'iPad**, avec le même PDF. L'ordre du texte copié peut changer d'un outil à l'autre : c'est ce que je n'ai pas pu mesurer.
3. **Corrige une ligne mal rangée** par son menu « Déplacer », puis « Annuler le dernier geste ».
4. **Range le devis dans la fiche**, puis ouvre la fiche du cours dans Réglages : le numéro, l'énoncé et les éléments y sont-ils comme tu les attends ?
5. **Recolle un devis sur ce même cours** : l'écran doit te montrer l'ancien et le nouveau côte à côte avant de remplacer.

Si un collage sort mal, garde le texte collé tel quel et envoie-le : il devient un jeu d'essai.
