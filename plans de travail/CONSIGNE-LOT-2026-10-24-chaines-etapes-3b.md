# Consigne – Les chaînes d'étapes, lot 3b : échelles, cartouches, productions, pratiques (#1149)

> Écrite par Cowork le samedi 24 octobre 2026 à 19 h 55 (Toronto, mesuré par `date`), sur `main` = `914a0d31`. Plan : `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md`, lot 3, seconde moitié. Le lot 3a est accepté (`VERDICT-RELECTURE-2026-10-24-chaines-etapes-3a.md`) : ce lot réemploie son composant (`js/chaine-etapes.js`) et son patron (`etapesChaineGrille`, `rendreChaineGrille`, `suivreEtapeDeLaGrille` dans `js/grilles.js`).
> **Les étapes des quatre chaînes sont validées par Grégoire**, une à une, de 19 h 44 à 19 h 52. Elles sont dans `CHAINES-ETAPES-3b-etapes-validees.md` (tableaux, règles, motifs) : **c'est la source, lis-la en entier.** Ce fichier-ci dit seulement comment les poser.

## 0. Avant tout — d'autres sessions travaillent en même temps

- Ce lot touche `index.html`, `styles.css` et quatre modules que d'autres lots peuvent toucher. **Un seul lot à la fois** : ne commence que lorsque le lot en cours est commité, sur un `main` à jour, et qu'aucune suite ne tourne. Si les fichiers du § 3 portent des changements non commités d'une autre session, arrête et dis-le. **Pas de `git stash`** quand une autre session écrit (incident du 3a).
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, `CHAINES-ETAPES-3b-etapes-validees.md`, `VERDICT-RELECTURE-2026-10-24-chaines-etapes-3a.md`, la ligne du plan.

## 1. Ce que le lot livre, en gestes

Dans **Conception**, quand une fiche est ouverte (ou en création), la chaîne de l'outil paraît **à la même place que celle des grilles** (entre la rangée des actions de la fiche et la fiche) et part avec la fiche :

- **Échelles** : Niveaux → Pourcentages → Repères → Production.
- **Cartouches** : Grille → Échelle → Commentaires → Production.
- **Productions** : Objectif → Tâche → Grille → Échelle → Cartouche → Échéance.
- **Pratiques de notation** : Méthode → Échelle (selon la méthode) → Pondération (sommative seulement) → Groupe-cours.

Chaque chaîne suit la saisie, comme celle des grilles. La case « Afficher les chaînes d'étapes » les masque toutes.

## 2. Décidé par Cowork (si la mesure le contredit, dis-le plutôt que de le suivre)

1. **Une fonction pure par chaîne** (`etapesChaineEchelle`, `etapesChaineCartouche`, `etapesChaineProduction`, `etapesChainePratique`, ou tes noms), sur le patron de `etapesChaineGrille` : elle reçoit l'objet (du formulaire en création, du stockage sinon) et ce qu'il faut compter, et rend la liste des étapes. Le dessin passe par `ChaineEtapes.dessiner`.
2. **Le compte des productions** (« 2 prod. ») : la même lecture que `productionsVisiblesPourLaChaine` du 3a. Elle sert maintenant à trois chaînes : **une seule copie**, déplacée là où les trois la lisent (zéro dette). Dis où.
3. **Les « Pourcentages » d'une échelle se jugent avec le rangement de l'app**, pas avec une règle nouvelle : `niveauDuPourcentage` (`js/evaluation-calcul.js` l. ~570) arrondit la note à l'entier puis cherche la plage qui la contient. **Un trou** : un entier de 0 à 100 qu'aucune plage ne contient (l'app le range aujourd'hui dans le niveau le plus proche, avec un simple avertissement en console). **Un chevauchement** : un entier que deux plages contiennent (l'app prend la première). L'info nomme le premier entier fautif : « trou à 65 % », « chevauchement à 75 % ». Les niveaux sans `min` ou `max` numériques sont ceux que `niveauDuPourcentage` écarte : même règle.
4. **Les tons** : « en attention » seulement pour le trou et le chevauchement d'une échelle ; « critique » (rouge) seulement pour une pondération sommative au-dessus de 100 %. Tout le reste qui manque est « à régler », sans couleur (le fichier des étapes le dit étape par étape).
5. **Les clics ne font que conduire, jamais agir.** Une étape mène à l'endroit où l'on règle (le champ, la table, le menu, l'écran voisin) ; elle n'écrit rien, n'active rien. En particulier : « Groupe-cours » (pratiques) **descend** au bouton « Appliquer au cours » (`index.html` l. ~6134), il ne l'appuie pas ; « Méthode » rouvre l'assistant en édition (`ouvrirWizardV2(true, id)`, comme `editerPratique`) ; « Production », « Grille », « Échelle » d'une autre fiche ouvrent l'écran voisin par `afficherSousSection` (`navigation.js` : on l'appelle, on ne le modifie pas). Pour chaque étape des quatre chaînes, dis où mène le clic.
6. **Lecteur d'écran** : `aria-label` « Étapes de l'échelle », « … de la cartouche », « … de la production », « … de la pratique ».
7. Les nombres et les dates par les formateurs communs (#1137) ; la date de l'échéance au format court que l'app emploie déjà ailleurs pour les échéances.

## 3. Où (mesuré par Cowork en lecture, à revérifier)

- `index.html` : les quatre fiches et leurs rangées (Productions l. ~4620, Échelles `#conteneurEditionEchelle` l. ~5211, Cartouches `#cartoucheZonePrincipale` l. ~5280, Pratiques `#conteneurEditionPratique` l. ~5509) ; le conteneur de la chaîne des grilles, à imiter (`#chaineGrille`, l. ~5058).
- `js/echelles.js` (niveaux, repères `seuilSuffisance` / `seuilMaitrise`, #555) ; `js/cartouches.js` (`grilleId`, `echelleId`, le compte de `calculerPourcentageComplete`) ; `js/productions.js` (`objectif`, `tache`, `grilleId`, `echelleId`, `cartoucheId`, l'échéance par `obtenirEcheanceEffective`) ; `js/pratiques-gestion.js` (la configuration, `obtenirIdPratiqueActive`), `js/pratiques/pratique-configurable.js` (`methodesAvecEchelle`) ; `js/grilles.js` (le compte des productions à déplacer).
- En lecture seule : `js/evaluation-calcul.js` (`niveauDuPourcentage`), `js/wizard-pratique-v2.js` (`ouvrirWizardV2`), `js/productions.js` (`mettreAJourPonderationTotale` : le calcul du total à reprendre, artefacts-portfolio exclus ; s'il faut l'extraire en fonction pure pour la partager, c'est dans ce lot).

## 4. Pièges connus

1. **Les sessions en parallèle** : § 0.
2. Une fiche **en création** : la chaîne lit le formulaire, pas le stockage (comme au 3a).
3. Une fiche d'exemple en lecture seule : la chaîne s'affiche ; ses clics conduisent quand même.
4. La pondération sommative : la famille se lit par la méthode (`moyenne_ponderee`), pas par un nom affiché ; dis comment tu l'as reconnue.
5. L'étape « Échelle » d'une pratique **disparaît** pour les méthodes qui ne la consomment pas : le composant reconstruit quand les identifiants changent (3a) ; un essai le vérifie.
6. iPad 820 px : six étapes (productions) tiennent ou défilent comme la barre du Trimestre ; 44 px au doigt.
7. Sécurité : `textContent` (règle 1), aucun gestionnaire en ligne (règle 2).
8. **Stock** : aucune donnée écrite ; rien à migrer. Dis-le.

## 5. Preuve exigée

- **Vitest** : les quatre fonctions pures, avec au moins ces cas. Échelle : un niveau, deux niveaux sans nom, IDME (0 à 100), un trou, un chevauchement, IDME avec niveau 0, sans repères, repères posés. Cartouche : sans échelle, matrice vide, partielle, complète. Production : chaque champ vide un à un, échéance assignée ou non. Pratique : sommative à 70, 100, 110 % ; standards (échelle choisie ou non) ; spécifications (ni échelle ni pondération) ; active ou non. Break-test.
- **Playwright (WebKit)** : pour chaque outil, la chaîne paraît avec la fiche et part avec elle, suit une saisie (un niveau ajouté, un commentaire écrit, un objectif tapé, une échelle choisie), et ses clics conduisent où le § 2.5 le dit, **sans rien écrire** (un essai compare le stockage avant et après un clic sur chaque étape) ; la case décochée efface les quatre ; 820 px pour les productions.
- **Captures** : une fiche réglée et une à régler par outil ; 1440 et 820 px ; clair et sombre.
- Portes terrain : skill `portes-terrain`.

## 6. Ce qui n'entre pas

Le critère algorithmique (lot 4) ; la Carte d'alignement ; toute réparation de données (une échelle à trou, une cartouche incomplète se signalent, elles ne se corrigent pas d'office) ; la règle des pondérations décimales (inscrite au verdict du 3a).

## 7. Clôture

- #1149 **cochée** dans le commit du code (3a et 3b faits).
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-chaines-etapes-3b.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
