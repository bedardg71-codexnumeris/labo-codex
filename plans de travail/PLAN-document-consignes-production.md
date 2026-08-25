# Plan — Le document de consignes d'une production

> **Ouvert** : 25 août 2026 (après la livraison 1.98.0)
> **Demande** : Grégoire, 25 août — « le bouton nous mène à une fenêtre qui ressemble déjà
> beaucoup aux gabarits de la production comme telle. Je voudrais qu'il nous mène plutôt à la
> visualisation du PDF. »
> **Public du document produit** : les étudiant·es. Ce n'est pas un écran de travail — c'est une
> feuille qu'on distribue, qu'on garde sous les yeux, et qu'on imprime à 34 exemplaires.

---

## 1. Ce que l'audit a trouvé (25 août, avant d'écrire une ligne)

**Le formulaire redemande ce que la fiche sait déjà.** `afficherFormulairePDFDepuisProduction`
(`export-pdf.js`) lit bien la production ouverte (`productionEnEdition`), mais n'en lit NI la
grille, NI l'échelle, NI la cartouche : `afficherFormulairePDFInline` retombe sur
`restaurerReglagesPDF()`, les derniers réglages mémorisés. L'étape est donc redondante **et moins
fiable que la fiche**, puisqu'elle peut proposer la grille d'une autre production.

**Le PDF est déjà au format lettre.** `creerDocumentPDF` génère `format: 'letter'`. Ce qui n'est pas
au format lettre, c'est l'**aperçu** : un flux HTML continu, sans pagination ni proportions de page.
Ce que Grégoire voit ne correspond pas à ce qu'il obtient — d'où son constat d'un document non
imprimable.

**Le document est construit DEUX FOIS.** `genererApercuCombine` (HTML) et `genererPDFCombine`
(jsPDF) bâtissent chacun leur mise en page à partir des mêmes données. Ils peuvent donc diverger,
et ils divergent. C'est la cause de fond, pas un détail d'implémentation.

**Les colonnes écrasent les consignes.** Objectif, description, détail et contexte sont posés
côte à côte en `flex: 1`. Sur une consigne dont le « Détail de la tâche » fait quinze lignes, une
colonne d'un pouce déborde vers le bas pendant que trois voisines restent vides.

---

## 2. Décisions prises avec Grégoire

**Pagination (25 août)** — *les consignes seules sur leur page.* La page 1 ne porte QUE les
consignes, même à moitié vide : c'est la page que l'étudiant garde sous les yeux en travaillant.
Grille, échelle et cartouche s'enchaînent à partir de la page 2, sans saut forcé entre elles.
⮕ Le cas courant donne deux pages ; une grille très longue en donne trois, sans rien casser.
Écarté : une page par cran (une cartouche de six lignes coûterait une feuille par étudiant) ;
le flux continu (la grille commencerait au bas de la page 1, l'étudiant perdrait le repère entre
ce qu'on lui demande et ce sur quoi on l'évalue).

**Colonnes (25 août)** — *un réglage de l'utilisateur, au même titre que l'orientation.*
Décision confirmée par Grégoire en cours de chantier : ce n'est pas « retirer les colonnes »,
c'est « laisser le choix ». Pas un
choix figé dans le code. Le défaut sert la lisibilité des consignes ; Grégoire peut en décider
autrement document par document.

**Les trois crans, cumulatifs** :

| Cran | Ce qui s'ajoute |
|---|---|
| Consignes | nom, objectif, description de la tâche, détail, échéance |
| + Évaluation | la grille de critères et l'échelle de performance |
| + Rétroaction | la cartouche |

---

## 3. Les quatre étapes

Chacune est vérifiable au navigateur avant la suivante.

### Étape 1 — Le raccourci ✅
Le bouton a AUSSI quitté l'en-tête de section pour venir au-dessus des trois choix dont il dépend
(demande de Grégoire, 25 août) : depuis qu'il lit la production ouverte, sa place est dans la fiche.
⚠ Conséquence : sans fiche ouverte, le bouton n'existe plus — le repli « pas de production » n'est
donc plus atteignable par ce chemin. Le formulaire reste joignable depuis Échelle et Cartouche.

Le bouton « Préparer le PDF » de la fiche de production mène droit à l'aperçu, en lisant
`grilleId` / `echelleId` / `cartoucheId` **dans la production ouverte** plutôt que dans les
réglages mémorisés.

⚠ Le formulaire de sélection NE disparaît PAS : il reste le chemin des boutons qui partent d'une
échelle ou d'une cartouche, où il n'y a pas de production d'où déduire quoi que ce soit.
⚠ Repli assumé tant que l'étape 3 n'est pas faite : une production sans grille ni échelle rouvre
le formulaire — l'aperçu actuel ne sait pas encore rendre des consignes seules.

### Étape 2 — Une seule source pour le document ✅
Patron déjà éprouvé dans le projet avec `construireModeleRapportPresences` (#485) : une fonction
PURE construit le **modèle** du document (les sections, leur contenu, leur ordre), et deux rendeurs
s'en servent — l'aperçu et le PDF. Ce qui change de place dans l'un change de place dans l'autre,
par construction. C'est cette étape qui ferme la divergence, les trois autres n'en sont que les
conséquences visibles.

### Étape 3 — Les vraies pages ✅
L'aperçu affiche des feuilles aux proportions lettre, avec la règle de pagination décidée
ci-dessus. Le sélecteur à trois crans entre dans la barre d'options.
Un cran sans matière (pas de grille sur la production) est **désactivé, avec sa raison DITE** —
jamais un formulaire qui se rouvre.
Les cases actuelles (Nom, Objectif, Tâche, Détail) restent : elles règlent QUELS CHAMPS dans le
bloc consignes, quand le cran règle QUELS BLOCS. Deux granularités, pas un doublon. Celles qui
concernent un bloc éteint disparaissent.

### Étape 4 — La disposition au choix ✅
Réglage « Colonnes » à côté d'« Orientation ». Défaut : pleine largeur pour les consignes.

---

## 4. Un risque, et ce qu'on en fait

L'aperçu le plus fidèle serait le PDF lui-même affiché dans un cadre : impossible qu'il diverge.
Mais l'affichage d'un PDF en cadre est capricieux sur iPad, et Grégoire travaille sur les deux
appareils. ⮕ **Retenu : un aperçu HTML qui partage le modèle et les mesures du PDF** — moins
absolu, mais qui ne l'expose pas à un cadre vide sur iPad. L'étape 2 est ce qui rend ce compromis
tenable.

---

## 5. État

- [x] Audit
- [x] Décisions de Grégoire (pagination, colonnes)
- [x] Étape 1 — le raccourci (livré, vérifié au navigateur)
- [x] Étape 2 — le modèle unique (livré ; golden master #497 posé AVANT, no-op prouvé)
- [x] Étape 3 — les vraies pages et les trois crans (livré)
- [x] Étape 4 — la disposition au choix (livré)

---

## 6. Ce que l'étape 2 a livré (25 août)

**Le filet d'abord.** Golden master `#497` posé AVANT de toucher au code : quatre documents de
référence (consignes seules, + évaluation, complet, grille seule), figés au caractère près.
Break-testé — un libellé changé d'une espace le fait rougir.

**Le modèle.** `construireModeleDocument(grille, cartouche, options)` décide le CONTENU :
`titreDocument`, `lignesEnteteDocument`, `blocsInformationDocument`. Les deux rendeurs le
consomment ; ce qui reste chez eux est de la PRÉSENTATION.

⚠ Le modèle porte du TEXTE BRUT. L'échappement est une affaire de rendu HTML — un modèle qui
contiendrait déjà `&amp;` enverrait cette esperluette telle quelle dans le PDF.

⚠ Les blocs ne s'appellent plus « colonnes ». Cette manière de les nommer avait suffi à figer une
mise en page dans les deux rendeurs à la fois.

**Le ratchet (W2).** Aucun rendeur ne peut reconstruire le titre, les blocs ou l'en-tête de son
côté : le test lit le source et rougit si la duplication repousse.

⚠ **Une correction de fixture en chemin** : `obtenirNomTrimestre` lit la clé `trimestres` NUE, pas
namespacée. Le harnais disait `a2026_trimestres`, donc le trimestre sortait vide et le golden
figeait un en-tête à deux lignes au lieu de trois. Corrigé et régénéré ; le diff des références ne
porte QUE l'ajout d'« Automne 2026 » — le refactoring reste prouvé no-op sur tout le reste.

---

## 7. Ce que l'étape 3 a livré (25 août)

**Les trois crans.** Sélecteur « Contenu : » en tête de la barre d'options. Un cran sans matière est
DÉSACTIVÉ et dit pourquoi (« Aucune grille de critères n'est associée à cette production »), plutôt
que de disparaître du menu — sans quoi Grégoire verrait deux entrées sans savoir que la troisième
existe. Sans demande explicite, c'est le cran le plus HAUT qui s'applique : rien ne disparaît de ce
qu'il voyait avant.

⚠ **La cartouche n'est pas une section**, elle remplit les cellules du tableau : ses commentaires
remplacent les descriptions de niveaux. Le cran se traduit donc par la cartouche qu'on laisse
passer au rendeur, pas par un bloc qu'on ajoute.

**Les feuilles.** L'aperçu pose une feuille par page — `height` fixe au lieu de `min-height`, qui
laissait la page s'étirer sans fin. Règle appliquée : consignes seules sur la page 1, le reste
enchaîné ensuite.

⚠ **CE QUE L'APERÇU NE FAIT PAS, ET LE DIT.** Il ne découpe PAS un tableau qui déborde : le refaire
ici en mesurant du DOM produirait une seconde pagination, différente de celle de jsPDF, et les deux
se contrediraient au premier cas limite. La feuille qui déborde porte donc une mention — « le PDF le
poursuivra sur une page de plus ». Un aperçu honnête sur sa limite vaut mieux qu'un aperçu fidèle en
apparence.

⚠ **UN ÉCART TROUVÉ ET REFERMÉ DANS LA FOULÉE** : `exporterPDFDepuisApercu` ne transmettait pas le
cran. L'aperçu aurait montré les consignes seules pendant que le fichier sortait avec la grille et
la cartouche — exactement l'écart que l'étape 2 venait de fermer, rouvert par la porte de sortie.
Garde W2.e.

▣ **Un helper de test est né de trois répétitions** : `tests/unit/_helpers/element-echappant.js`.
`escapeHtml` échappe en passant par `textContent` → `innerHTML` ; un faux élément où ces deux champs
sont indépendants rend TOUT le document vide, en silence. Le piège s'est présenté trois fois le même
jour, dans trois harnais différents.

---

## 8. Ce que l'étape 4 a livré (25 août)

**Réglage « Disposition »**, à côté d'Orientation : *Continu* ou *Deux colonnes*.

⚠ **« Deux colonnes » n'est pas qu'un nombre de colonnes.** Ce qui rend le format du Manuel de
Grégoire lisible, c'est que chaque bloc ANNONCE ce qu'il est avant de commencer. Deux colonnes de
texte nu auraient reproduit le défaut du 25 août — des bandes étroites où le détail de la tâche
déborde. Le bandeau vient donc AVEC la disposition, jamais en supplément facultatif.

⚠ **Le « Continu » n'est PAS l'ancien rendu.** L'ancien posait les blocs côte à côte en `flex: 1`
quoi qu'il arrive : ce n'était pas une disposition, c'était le défaut. Le continu empile désormais
les blocs sur toute la largeur.

⚠ **La page d'évaluation reste pleine largeur** dans les deux cas — décision de Grégoire du
25 août : ce document REMPLACE la mise en page du Manuel, il n'a donc pas à en reproduire la grille
miniature. Un tableau de six colonnes de descripteurs dans une demi-page ne se lit pas.

▣ **Gain non demandé mais réel** : `white-space: pre-line`. Les retours à la ligne du détail de la
tâche (« 1. Lis et annote », « 2. Identifie… ») étaient écrasés en un seul paragraphe par l'ancien
rendu.

**Une seule répartition pour les deux rendeurs** (`repartirEnDeuxColonnes`) : le CSS sait faire des
colonnes, jsPDF ne sait pas. Laisser chacun répartir aurait donné un écran et un fichier qui ne
coupent pas au même bloc. L'ordre de lecture est préservé dans chaque colonne — on ne réordonne
jamais des consignes.

### ⚠ Incident de chantier, et ce qu'il enseigne

En posant le rendu PDF, j'ai **dupliqué `genererPDFCombine`** : mon découpage utilisait
`s.index("// Légende supprimée…")` comme borne de fin, or ce commentaire apparaît DEUX FOIS dans le
fichier. Le premier trouvé était dans une autre fonction : le fichier s'est recollé de travers, avec
deux copies dont chacune portait la moitié des modifications.

⮕ Détecté par la sentinelle W2.f (le PDF ne contenait plus `doc.addPage()`), réparé en repartant
d'une sauvegarde d'avant l'étape et en réappliquant avec des ancres dont l'unicité est ASSERTÉE.
Un second piège du même genre a suivi — une ancre à 8 espaces qui est une SOUS-CHAÎNE de la même
ligne à 12 espaces —, attrapé cette fois par l'assertion.

⮕ **La règle : toute borne de découpage doit être comptée avant d'être utilisée.** Une ancre
« évidente » ne l'est pas.

### 📐 À trancher avec Grégoire

Le défaut est *Continu*. Son Manuel étant en deux colonnes, il voudra peut-être l'inverse — le
réglage est mémorisé, donc l'enjeu est seulement la toute première ouverture.
