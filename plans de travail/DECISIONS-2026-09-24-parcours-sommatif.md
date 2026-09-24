# Décisions de Grégoire – audit du parcours sommatif (24 sept. 2026)

> Tenu par Cowork. Source : `Rapports/AUDIT-parcours-sommatif-2026-09-24.md`, § 5 ; fiche #941. Chaque décision fait foi pour le lot qui la codera.

## D1 – Une grille entièrement en points se note sans échelle de performance (§ 5.1, #941 b)

**Oui.** « La pratique sommative doit être fonctionnelle. » L'élève ne lit que ce qui a été mesuré : les points de chaque critère, la note de la copie en %, **aucun nom de niveau** (plus d'échelle glissée d'office, plus de « Niveau général · Incomplet » sur une copie à 62 %). Rappel de la définition de Grégoire le même jour : en sommative traditionnelle, « des points accordés pour chacun des critères (ce qui remplace ni plus ni moins l'échelle de performance) ».

## D2 – La règle des 60 % (§ 5.2, #941, constat P) – et D3 réglée par elle (§ 5.3)

**Oui, dans ce périmètre exact :**
- Elle s'applique aux **grilles en points sans échelle, et seulement à elles**. Critère **sous 60 %** (points / pondération) = **prioritaire** dans « Présentement, il faut se concentrer sur », avec sa définition. À 60 % et plus : absent de « Présentement ». « Ta force » reste vide (60 % dit où commence l'échec, pas où commence l'acquis).
- « Points récurrents » : une copie où le critère est **à 60 % ou plus ARRÊTE le compte** (réussite mesurée). Une copie qui n'évalue pas le critère reste **sautée** (décision du lot #940).
- **Une échelle qui a ses repères garde ses repères** ; les 60 % ne s'appliquent jamais aux niveaux (ni par `valeurCalcul`, ni par la plage). ⮕ **D3 (repères ou 60 % ?) est réglée** : les deux ne se rencontrent jamais.
- Le principe du 28 août dans `zoneDuNiveau` (« aucune valeur n'est devinée… ni par un pourcentage ») **reste vrai pour les échelles** ; il est révisé pour les grilles en points sans échelle, où le pourcentage n'est pas deviné : il est la mesure. À écrire dans le commentaire du code qui portera la règle.

## D4 – La note sur la page de synthèse en sommative (§ 5.4, #941 e)

**Les deux.**
- **La note de la copie**, en tête du bloc « Niveau général » (qui, en sommative sans échelle, ne porte plus de nom de niveau : D1). Forme proposée par Cowork, retenue : « Note de la copie : 74 % ».
- **La note cumulée**, dans le bloc « Note provisoire » du bilan, comme en Standards, calculée par la pratique sommative et marquée « provisoire ».
Motif retenu : en sommative traditionnelle, la note est la première chose que l'élève cherche ; une synthèse qui ne la donne pas l'envoie la chercher ailleurs.

## D5 – Les jetons (§ 5.5, #941 d)

**Non.** Le bloc « Jetons utilisés » de la synthèse ne paraît **que si la pratique déclare des jetons actifs** ; sinon il disparaît. Les valeurs par défaut du code (2 / 2 / 2) n'atteignent jamais l'élève. Motif retenu : l'élève lirait des délais et des reprises que son enseignant·e n'offre pas. Aucun changement pour les élèves de Grégoire (sa pratique déclare les siens).

## Décidé par Cowork (technique, sans Grégoire)

- **C2** : quand aucun critère ne se classe, « Présentement, il faut se concentrer sur : » ne s'écrit pas (ni à l'écran, ni dans « Copier tout », ni dans le PDF) plutôt que d'être suivi de rien.
- **C5** : sans cartouche, l'étiquette « CONTEXTE » vide du ruban ne s'affiche pas.
- **Découpage** : trois lots, dans cet ordre, chacun avec sa relecture croisée – voir `CONSIGNE-SOMMATIVE-FONCTIONNELLE.md`.
