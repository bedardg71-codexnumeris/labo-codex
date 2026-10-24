# Demande de relecture – Les chaînes d'étapes, lot 3a (#1149)

> Claude Code, samedi 24 octobre 2026, soir. Consigne : `CONSIGNE-LOT-2026-10-24-chaines-etapes-3a.md`.
> Parti de `cac1465d` (le lot des noms réels commité) ; commit de docs `dbdfc619`, puis le commit du lot.
> **Ni release, ni verdict Playwright complet, ni push** : au signal de Grégoire.

## 1. Ce que le lot livre

| Geste | Où | Fait |
|---|---|---|
| La case « Afficher les chaînes d'étapes », cochée par défaut, sous « Informations contextuelles (graphiques) » | Réglages › Préférences › Expérience visuelle | oui ; ligne d'aide de Cowork posée telle quelle, **à valider par Grégoire** |
| Décochée : aucune chaîne, celle du Trimestre comprise ; recochée : elles reviennent, sans recharger ; le choix survit au rechargement | partout | oui (banc Playwright) |
| La barre du Trimestre dessinée par le composant commun, même apparence, même clic | Cadre › Trimestre | oui |
| La chaîne de la grille (Critères, Pondération, Production), entre la rangée et la fiche | Conception › Grilles | oui ; en tête de `#conteneurEditionGrille`, elle paraît et part avec la fiche |

Fichiers : `js/chaine-etapes.js` (neuf), `js/trimestre-v2.js`, `js/grilles.js`, `js/preferences.js`, `js/preferences-v2.js`, `index.html`, `styles.css` : ceux du § 3. **Hors § 3, deux bancs existants, ajustés parce que le lot l'oblige** (§ 4).

## 2. Les décisions de Cowork, et ce que la mesure en a fait

1. **Un seul composant** (`ChaineEtapes.dessiner(conteneur, etapes, options)`). Il ne reconstruit les nœuds que si les identifiants des étapes changent : une mise à jour à chaque saisie ne rejoue pas l'animation d'entrée de `.barre-convergence`. Le gestionnaire de clic posé sur tout le document (`trimestre-v2.js`) est parti : chaque conteneur a son écouteur et son action (`ouvrirAccordeonDeLEtape` pour le Trimestre, avec une table étape → accordéon qui remplace les `data-accordeon` du HTML statique).
   - Les mots de nature (cours ou service) : l'étape « Cours » et l'étape « Enseignant·e » reçoivent leur libellé de `motsNatureContexteActif()` et gardent `data-mot-nature`, que `appliquerMotsNatureCadre` relit à chaque activation.
   - Les `id` `bc-info-<étape>` sont conservés (le banc #918 les lit).
2. **« En attention »** (sous 100 %) et, au-dessus, **« critique »** : deux états du composant, l'info colorée, le nœud non réglé.
3. **L'option** : `afficherChainesEtapes`, `true` par défaut ; la case est synchronisée avec la préférence avant toute écriture (#806), par `chargerChainesEtapes` ; une classe sur `<body>` (`chaines-etapes-masquees`) masque toutes les `.barre-convergence`. Appliquée au démarrage par `initialiserPreferencesV2` (déjà appelée à `db-ready`, comme l'animation des points).
4. **Les liaisons** : celles du Trimestre, inchangées.
5. **Lecteur d'écran** : `aria-label` « Étapes de la grille » ; chaque étape fait entendre son libellé, son info, puis « , réglée » ou « , à régler » (un `.u-lecteur-ecran` dans le bouton). Le nœud et sa coche sont `aria-hidden`.
6. **Une seule règle pour la pondération** : `etatPonderation(criteres)` (total, réglée, en dessous, au-dessus, en points), somme de l'avertissement à l'enregistrement (`parseInt`). Les quatre sommes de `grilles.js` la lisent (avertissement, liste des grilles, `calculerTotalPonderationCriteres`, vue de toutes les grilles) ; les trois écritures du total `#totalPonderationAffichage` (création, `mettreAJourTotalTemp`, `calculerEtAfficherTotalPonderation`) passent par une seule, `afficherTotalPonderation`, qui dessine aussi la chaîne. Un banc compte qu'il ne reste qu'une somme dans le fichier.
   - **Décimales, mesuré** : les deux champs de pondération sont `type="number"` sans `step` et passent par `parseInt` à l'écriture. Une saisie « 12,5 » est marquée invalide par le navigateur sans être bloquée, et s'enregistre 12. Une pondération décimale déjà stockée (une grille importée) compte pour sa partie entière : 12,5 + 87,5 donne **99 %**, chaîne et total d'accord. Règle non changée, comme demandé.
   - La vue de toutes les grilles (modale) garde ses propres couleurs ; seul son total vient de la règle commune.
7. **Les couleurs**, calculées sur `--surface-carte` (fond de la chaîne) et `--bleu-tres-pale` (fond du total) :

| État | Jeton | Clair | Sombre |
|---|---|---|---|
| sous 100 % | `--alerte-texte-attention` | 6,3:1 / 5,9:1 | 7,1:1 / 8,3:1 |
| au-dessus | `--etat-erreur-texte` | 6,6:1 / 6,2:1 | 4,5:1 / 5,3:1 |
| 100 % (total seul) | `--etat-valide-texte` | 5,1:1 / 4,8:1 | 8,1:1 / 9,5:1 |

   - Aucun jeton orange ne passe 4,5:1 dans les deux modes : `--orange-accent` fait 2,8:1 en clair, `--calendrier-reprise-texte` 3,8:1, `--carte-info-note-titre` 4,3:1 en sombre. J'ai pris `--alerte-texte-attention`, le jeton des textes d'avertissement de l'app. **Supposition à dire** : en clair, il est brun doré (`#7a5a20`) plus qu'orange (capture `grilles-85-1440-clair.png`).
   - **Le vert du total était un fantôme** : `--vert-moyen` (grille ouverte) et `--vert-accent` (création) ne sont définis nulle part ; un total à 100 % gardait sa couleur héritée. Il est maintenant vert. Les deux entrées sortent de la liste de la sentinelle #567.

## 3. Ce que j'ai supposé

- **« Critères » compte les critères nommés** : « 1 critère » quand un seul a un nom, « aucun » pour une grille neuve au critère vide. Une grille ouverte nomme d'office un critère ajouté (« Nouveau critère ») : le compte suit l'ajout.
- **Les productions comptées** sont celles que montre Conception › Productions étudiantes : trimestre actif, `dansBibliotheque !== false`, puis `BibliothequeUI.filtrerParModeDemo` (les exemples masqués hors démo).
- **« Production »** ouvre les productions par `afficherSousSection('conception-productions')`, comme `donnees-v2.js` ; `js/navigation.js` n'est pas modifié.
- Une grille ouverte **sans critère** ne recalculait rien : le total gardait celui de la grille d'avant. `afficherCriteresGrille` appelle maintenant le total aussi dans ce cas (sinon la chaîne aurait menti avec lui). C'est le chemin du lot, pas une trouvaille.
- Le nom d'un critère qu'on vide sur une grille ouverte est refusé (#516) : la chaîne lit le stockage, elle garde donc le compte d'avant. En création, elle lit le formulaire.
- **Stock** : préférence neuve, absente elle vaut `true`. Rien à migrer.

## 4. La preuve

- **Vitest** : `tests/unit/chaines-etapes-1149.test.js`, 15 essais (C.a-h le composant : dessin, liaisons, réglée, attention, critique, arrivée, lecteur d'écran, info piégée rendue en texte, clic limité à son conteneur, mise à jour sans reconstruction, l'option ; G.a-g la fonction pure : aucun critère, critère sans nom, 85 %, 110 %, 100 %, en points, zéro / une / deux productions, création, la règle unique). **Suite complète : 9 627 sur 9 627.**
  - Break-tests : compter tous les critères → G.b rouge ; plus de rouge au-dessus → G.c rouge ; l'info en `innerHTML` → C.e rouge ; la liaison sans la précédente → **d'abord vert** (le banc ne la voyait pas), cas ajouté à C.b, puis rouge ; le clic attrapé par une autre chaîne → C.f rouge ; `grilles.js` d'avant → 7 rouges. Code restauré.
- **Bancs existants ajustés** : `sentinelle-567-variables-css-fantomes` (deux fantômes disparus, la liste descend) ; `sentinelle-section-cours-suit-la-nature-842` (le libellé « Cours » n'est plus dans le HTML statique : le banc vérifie que `mettreAJourBarreContexte` lui pose `data-mot-nature="Objet"`, break-test fait). `barre-convergence-suit-les-enregistrements-918` passe **sans être réécrit**.
  - Deux sentinelles de complexité ont mordu en route (`chargerPreferencesDepuisStorage` 30 → 32, `mettreAJourBarreContexte` → 16) : extraites (`chargerChainesEtapes`, un petit fabricant d'étape), revenues sous leurs seuils.
- **Playwright (WebKit, Mac)** : `tests/integration/chaines-etapes-1149.spec.js`, 6 essais (Trimestre : six étapes, états, accordéon ouvert par le clic ; Grilles : trois étapes, 85 % orange puis 110 % rouge puis 100 %, chaque fois dans la couleur du total, ajouter un critère, « Pondération » descend, « Production » ouvre les productions, fermer emporte la chaîne ; la création lit le formulaire ; la case décochée efface les deux chaînes, le choix survit au rechargement ; un exemple en lecture seule garde ses clics ; iPad 820 px, 44 px). Avec les bancs voisins (#918, trimestre-v2-chargement, #1147, cadre #1148, #1117, barème #1120, dissection 2a, 5 et 9) : **50 sur 50**.
  - Break-tests : la chaîne non redessinée par le total, puis la règle qui masque renommée → 4 rouges ; restaurés.
- **Captures** : `plans de travail/captures-2026-10-24-chaines-etapes-3a/` — Grilles réglée et à 85 %, Trimestre, Préférences ; 1440 et 820 px ; clair et sombre (16). Prises par l'essai `captures (CAPTURES_CHAINES)`, sauté sans la variable.
- **Portes terrain : aucune** (règles 1 et 2 du skill) : apparence et comportement, aucune écriture dans les données, gestes couverts par les bancs.

## 5. Ce que je n'ai pas pu vérifier

- Safari et l'iPad réels : le défilement horizontal de la barre au doigt, le rendu des couleurs à l'écran de Grégoire. WebKit de Playwright seulement.
- La suite Playwright complète (le verdict) : pas lancée, au signal.
- Les captures du Trimestre sont prises sur un espace neuf (aucune étape réglée) ; les états réglés y sont prouvés par le banc, pas montrés.
- **Une erreur de la session** : pour une mesure de complexité, j'ai fait un `git stash` / `git stash pop` pendant que Cowork écrivait ; deux de ses documents (`CONSIGNE-…-noms-reels-tests.md`, `VERDICT-…-aide-lot-1.md`) ont été emportés puis rendus, intacts selon `git status`. Plus de `stash` ensuite. Ces deux fichiers ne sont pas dans mon commit.

## 6. Ce qui revient à Grégoire

1. La ligne d'aide : « Montre, en haut de chaque outil, les étapes qui le rendent prêt à servir. »
2. Le brun doré de « 85 % » en mode clair (le seul jeton du design system qui passe 4,5:1 dans les deux modes), ou une teinte orange neuve à ajouter au design system.

## 7. Clôture

#1149 reste ouverte : la fiche note « 3a fait (commit) » ; 3b attend la validation des étapes des autres outils.
