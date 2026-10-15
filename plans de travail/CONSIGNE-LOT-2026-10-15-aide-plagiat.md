# Consigne de lot – l'Aide dit ce que vaut une copie non recevable, famille par famille ; et le verdict du lot de l'Aide

> Écrite par Cowork le 15 octobre 2026 à 14 h 37 (Toronto, mesurée par `date`). Ne touche ni à `CONSIGNE-DU-JOUR.md` ni aux autres `CONSIGNE-LOT-*`. Commite ce fichier avec ce lot.
> **Ordre** : ce petit lot passe AVANT `CONSIGNE-LOT-2026-10-15-diagnostique.md`. Si le lot du diagnostic est déjà commencé, fais celui-ci après lui, dans un commit à part.

## 1. Verdict de Cowork sur le lot de l'Aide (`72f87e6a`, `77621c98`) : accepté

Relu par sondage, pas ligne à ligne. Vérifié : le diff ne touche que des textes (section Aide d'`index.html`, les trois `accompagnement-contenu-*.js`, `guides-pedagogiques.js`), les jetons de version des cinq scripts, et un commentaire de `rapport-bug.js` (« 10 » → « 20 ») ; aucun `onclick=`, aucun script inline, aucun `console.log` ajouté. Le « 7/9 » de la complétion est conforme au code (`pratique-registre.js` ~868-911, lot 30 du 17 sept. : une copie non recevable n'est pas une remise). Le « < 65 % » d'IDME est conforme. Vitest non relancé par Cowork : ta suite verte (8 859 sur 8 859) et les 54 ablations font foi.

## 2. La décision de Grégoire (15 oct., 14 h 36) : l'exception standards est voulue (option b du § 2)

Elle précise, pour les standards, sa décision de 13 h 47. Rien ne change dans le moteur : c'est l'Aide qui dit ce que fait chaque famille.

Le texte, à poser là où le § 2 de ta demande a laissé l'ancien (« Performance (P) : Exclu du calcul de la moyenne », le tableau « Compte dans P ? », « n'est pas une note de 0 % » sur la carte « Travail NON RECEVABLE », l'infobulle `eval-integrite`). Adapte la longueur à chaque surface (une infobulle prend la phrase de la famille seulement), sans changer le sens :

> Une copie non recevable compte comme non remise dans la complétion. Dans la note, son sort dépend de ta pratique :
> – en sommative, elle vaut 0, sauf si une reprise la remplace ou si ta pratique ne retient que les meilleures productions et qu'elle n'en fait pas partie ;
> – en spécifications, elle compte comme un travail non satisfaisant ;
> – en standards, elle sort du portfolio : la compétence n'est jugée qu'à la reprise ; une terminale non recevable vaut 0 ;
> – en dénotation, ta note est ton jugement : la copie n'y entre pas par calcul.

- Chaque affirmation se remesure au code avant d'être posée (tableau du § 2 de ta demande). Si une ne tient pas, remonte à Cowork sans réécrire.
- La sentinelle du lot lit ces règles là où elles vivent (`profil-etudiant-actions.js` ~203-216 pour le portfolio, `_obtenirNoteTerminaleEtudiant`, `_compterTravauxAcceptables`, `_calculerPerformanceDenotation`) ; break-test par branche.
- Le Comparateur (`_evalsProfil` écarte la copie) : rien à faire, il suit le chemin du profil.

## 3. Le nom d'élève dans le rapport de bogue : un dixième point de #1075

Décision de Cowork (technique, pas une question de pédagogie) : c'est un défaut de protection des données, de la famille de #1075, que Grégoire a mis en priorité. Ajoute-le comme point (10) de #1075, avec ton constat (le texte des éléments cliqués entre dans l'historique, donc un nom cliqué dans une liste, hors mode anonymisé ; l'Aide promettait « aucun nom ni DA »). Pas de code dans ce lot ; l'infobulle « relis le rapport avant de l'envoyer » reste d'ici là.

Les six autres trouvailles « inscrire et continuer » restent dans ta demande, hors BACKLOG (aucun symptôme vécu).

## La méthode

Un commit, Vitest complet depuis `tests/`, une ligne de verdict à demander à Cowork dans `DEMANDE-RELECTURE-2026-10-15-aide-face-a-l-audit.md` (§ 8, à ajouter). Aucun push, aucune release, aucun verdict Playwright avant le signal du soir. Puis enchaîne avec `CONSIGNE-LOT-2026-10-15-diagnostique.md`.

## Verdict de Cowork, 15 oct. 2026 à 15 h 30 (Toronto, mesuré par `date`) : le § 8, option a, décidé par Grégoire à 15 h 30

**Relu sur `3ee94c62` : accepté.** Grégoire garde le 0 de l'obligatoire non recevable en hybride (« oui », 15 h 30) : c'est sa règle « une copie non recevable compte comme non remise », appliquée jusqu'au bout, comme pour la terminale. Le moteur ne change pas.

Pose le texte avec ces deux retouches :
- **Sommative** : retire la clause « ou si ta pratique ne retient que les meilleures productions… », qui ne joue jamais dans cette famille (ta mesure). Elle devient : « en sommative, elle vaut 0, sauf si une reprise la remplace ».
- **Standards** : ta phrase de l'option a, telle quelle : « en standards, elle sort du portfolio : la compétence n'est jugée qu'à la reprise. Exceptions : une terminale non recevable vaut 0, et, en mode hybride une fois les notes finales cochées, une obligatoire non recevable aussi, comme une obligatoire non remise. »

La sentinelle lit aussi la branche hybride (`nombreObligatoiresTotal`, `_selectionnerArtefactsHybride`) ; break-test par branche. Un commit, Vitest complet. À faire **après** `CONSIGNE-LOT-2026-10-15-textes-relus.md` si ce lot est déjà commencé, sinon avant ; même règle : aucun push avant le signal du soir.

Avec ce commit : recopie sous #668 et sous #333 les deux lignes de `DECISIONS-2026-10-15-textes-relus.md` (blocs 4 et 5), et commite ce fichier.
