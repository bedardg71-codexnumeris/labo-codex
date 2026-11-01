# Consigne – Évaluer relit la grille quand elle change, sans perdre la saisie en cours (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 6 h 07 (Toronto), sur `main` = `a8e24902`. Suite de #1213 : trouvaille de Claude Code, tranchée par Cowork (`VERDICT-RELECTURE-2026-11-01-palette-relit-la-grille.md`, trouvaille 1, **corriger maintenant** : c'est le parcours que #1213 livre, et une note est ce que l'élève reçoit).
> **Ordre du groupe du 1er nov.** (décision de Cowork) : après le lot du défilement, avant la barre d'outils compacte. Une seule session écrit à la fois.

## 0. Avant tout

- Commit de docs seul : cette consigne et le verdict de relecture de #1213.
- Inscris la trouvaille au `SUIVI-BUGS.md` (prochain numéro libre), rattachée à #1213.

## 1. Ce qui est mesuré, et ce qui ne l'est pas (rapport de #1213)

- Mesuré : en mode **Évaluer**, après un détour par la grille (critère passé de 20 à 30, grille renommée), le formulaire garde l'ancien nom de grille et `data-ponderation` = 20. Parti d'Annoter puis passé à Évaluer, tout est juste.
- Lu, pas mesuré : `calculerNoteAlgoSimpleHandler` lit `el.dataset.ponderation`. Les autres calculs du formulaire lisent-ils aussi une pondération posée dans le HTML au chargement ?
- Pas établi : le nom du critère affiché.

**Mesure d'abord, et écris-le en tête du rapport** :
1. La note **enregistrée** (au bouton et par l'enregistrement automatique) part-elle de l'ancienne pondération ? Pour le critère algorithmique, pour un critère à niveau, pour un critère analytique (en points).
2. Ce que l'élève lirait : le PDF d'une copie enregistrée dans ce cas.

## 2. Le correctif (décision technique de Cowork)

- **Le calcul lit la grille d'aujourd'hui, pas un attribut posé au chargement.** Si la mesure 1 montre qu'une note enregistrée part d'une pondération périmée, c'est la source à tarir d'abord.
- **L'affichage suit** : à `donnees-enregistrees` sur `cle('grillesTemplates')` (le même signal que #1213), si le formulaire Évaluer est ouvert sur une copie, le nom de la grille, les noms et pondérations des critères se mettent à jour.
- ⛔ **La saisie en cours ne se perd jamais** : niveaux choisis, nombres d'erreurs et de mots, points, rétroaction. Si le plus sûr est de rebâtir le formulaire, rends-lui sa saisie après ; sinon, mets à jour en place. Décide, écris-le.
- Un critère ajouté ou retiré dans la grille pendant que le formulaire est ouvert : bâtis sur les signalements existants (`_signalerCriteresHorsGrille` #652, `_signalerCriteresAjoutesDepuis` #705, `evaluation-chargement.js`).
- **Une copie verrouillée** garde sa note remise (décision de Grégoire du 27 oct.) : la relecture n'y change rien d'autre que ce que le verrou permet déjà.
- **Rien n'est écrit au moment de la relecture** (même règle que #1213) : la nouvelle pondération sert au prochain geste ou au prochain enregistrement.

## 3. Source ou stock

Une évaluation enregistrée depuis un formulaire périmé porterait une note calculée sur l'ancienne pondération. **Ne répare rien d'office** (écrire dans les données de Grégoire remonte à lui). Écris au rapport si un tel cas est repérable (par exemple, une note enregistrée qui diffère du calcul de la grille actuelle sur une copie non verrouillée), et combien de copies de démo le montreraient. Cowork le lui soumettra.

## 4. Les tests

- Playwright `webkit` : en Évaluer, un niveau choisi et un nombre d'erreurs tapé, détour par la grille (pondération changée), retour : la saisie est intacte, la pondération affichée est la nouvelle, la note enregistrée part de la nouvelle.
- Une copie verrouillée : sa note remise ne bouge pas.
- Contre-épreuves (skill `verification-adverse`). Noms fictifs.

## 5. Fin

Commit, rapport `plans de travail/RAPPORT-2026-11-01-evaluer-relit-la-grille.md` à Cowork pour relecture. **Pas de push.**

Geste à vérifier sur l'iPad après la mise en ligne : dans Évaluer, choisir un niveau, aller changer une pondération dans la grille, revenir : le niveau choisi est toujours là, et la pondération affichée est la nouvelle.
