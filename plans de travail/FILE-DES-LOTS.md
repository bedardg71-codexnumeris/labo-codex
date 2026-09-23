# File des lots – tenue par Cowork

> Mise à jour le 23 septembre 2026, 13 h 50 (Toronto) — par Claude Code : le lot N6 est sorti (1.155.7) ; la file des pratiques de notation est vide. Reste tenu par Cowork. Un lot entre ici quand Grégoire a dit « oui » ; il en sort quand il est poussé.

1. Tranchée le 17 sept., code seulement : le suffixe « pér. » d'une séance d'horaire (#888).
2. À Grégoire : la phrase de la barre « Assiduité » du groupe quand aucune séance ne porte de périodes (#830) ; la disposition de F4-2 (« En prévision de l'EUF » pour les critères d'avant le 4 sept.) ; F3-6 (l'export pour la recherche compte les niveaux par I / D / M / E).

## Cap fixé par Grégoire le 21 sept. à 13 h 08

1. Les demies de Léa : ✅ poussé en 1.152.5 (`518a79c4`).
2. Puis **les dix fiches de notation encore ouvertes** : ce qui se passe quand la pratique n'est pas la sienne (#710, #711, #712, #713, #714, #716, #717, #719, #854, #900). À remesurer et à grouper en lots par Cowork.
3. Puis **la synthèse des rétroactions** : son prochain « Labo » portera là-dessus.

## Les dix fiches de notation, remesurées et groupées par Cowork (21 sept., 14 h 29)

Remesure rapide au code (grep, pas exécuté) : les constats tiennent encore — `obtenirPratiqueActiveGroupeCours` rend `'sommative'` par défaut (modes.js ≈ 1352) pendant que `PRATIQUE_DEFAUT = 'standards'` (pratique-registre.js:29) ; `obtenirConfigPratiqueActive` ne lit que `.configuration` (portfolio.js ≈ 1176) ; le gestionnaire tient `'specifications'` pour une pratique codée en dur (pratique-manager.js:52) ; `calculerPerformanceHistorique` n'existe que chez la sommative et la STD ; la sommative lit encore `e.da` / `e.note` (pratique-sommative.js:317-319).

- ~~**Lot N1**~~ — **SORTI DE LA FILE : livré en 1.153.0 (N1a + N1b), poussé le 21 sept. 2026 à 19 h 30 (`a37d50bf`).** Le constat de didactique (deux échelles pour le niveau de la note globale d'une Standards) part avec N2.
- ~~**Lot N2**~~ — **SORTI DE LA FILE : livré en 1.155.2, fusionné dans `main` le 23 sept. 2026 (`63308965`), push lancé par `pousser.sh`.** ~~Le P historique suit la note du cours~~ (#716). Dépend de N1 (sous DEN, l'historique passe par la même résolution que #719). Sommative : lire `etudiantDA` / `noteFinale` ; SPE et DEN : plus de conversion IDME en dur.
- ~~**Lot N3**~~ — **SORTI DE LA FILE : livré en 1.155.1, fusionné dans `main` le 22 sept. 2026 (`32f09aaa`) après la relecture croisée de Cowork (verte, sentinelle 11/11) ; verdict et push par `pousser.sh`.**
- ~~**Lot N4**~~ — **SORTI DE LA FILE : livré en 1.155.4, fusionné dans `main` le 23 sept. 2026 après la relecture croisée de Cowork (verte, bancs du lot 196/196, complément `33285f1c`) ; verdict et push par `pousser.sh`.** ~~Spécifications : le plancher de 50 et la réédition~~ (#713 volet plancher, #854 volet SPE ; décision de Grégoire : aucune note, la cause nommée). #935 inscrite (seuils par défaut).
- ~~**Lot N5**~~ — **SORTI DE LA FILE : livré en 1.155.5 avec #936, fusionné dans `main` le 23 sept. 2026 ; verdict et push par `pousser.sh`.** ~~Dénotation : une cible renommée ne plafonne plus en silence~~ (#717 ; décision de Grégoire : A, un id permanent donné à chaque cible à sa création). Relecture croisée de Cowork : sept mutations rouges sur dix, les trois survivantes gardées par le complément `aa7007e9`.
- ~~**Lot N6**~~ — **SORTI DE LA FILE : livré en 1.155.7, fusionné dans `main` le 23 sept. 2026 (`41758817`) après la relecture croisée de Cowork (verte du premier coup, copie `git archive`, 20 bancs, 288/288, huit mutations rouges) ; mots validés par Grégoire (option B) ; verdict et push par `pousser.sh`.** ~~Zéro-dette : les réglages que rien ne lit~~ (#900). Retirer du CODE ce qui écrit des champs sans lecteur ; rien n'est effacé des données déjà écrites. À joindre à un lot qui passe par l'assistant. Y ajouter : aligner sur la flèche « → » le « › » du récapitulatif de l'assistant (#899) — décidé par Cowork le 23 sept.

- ~~**Lot N7**~~ — **SORTI DE LA FILE : livré en 1.155.3, fusionné dans `main` le 23 sept. 2026 (`4b256bda`) après la relecture croisée de Cowork (verte, bancs du lot 209/209, sept mutations rouges) ; verdict et push par `pousser.sh`.** ~~Le niveau de la note globale se lit dans une seule règle, celle des évaluations~~ (sans fiche : constat de didactique de N1a, sorti de N2 par Cowork le 22 sept.). **Tranché par Grégoire le 22 sept. au soir : A**, l'échelle des évaluations de l'élève (#575), pas celle rangée dans la pratique. Son principe, posé en répondant : « L'échelle IDME est ma pratique personnelle. On ne peut l'imposer à aucun utilisateur. Il faut toujours prendre les grilles, échelles, cartouches, etc. créés par l'utilisateur. » Rien ne change à l'écran ; retire la règle B et, si plus rien ne la demande, la seconde instance. **Après la fusion de N2** (même fonction). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` depuis le 23 sept., 7 h 45 (la version préparée d'avance est archivée sous `_ancienne-CONSIGNE-N7-echelle-note-globale-preparee.md`).

**La file des pratiques de notation est vide** (N1 à N7 livrés). Le dernier lot de l'export — une seule carte « Exporter des travaux » (#895) — est livré en 1.156.0 le 23 sept., fusionné dans `main` (`d7fb3cee`) : sorti de la file.
