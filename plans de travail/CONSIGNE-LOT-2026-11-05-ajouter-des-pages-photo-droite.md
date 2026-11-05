# Consigne – « Ajouter des pages » garde une photo de téléphone droite et sans déformation (5 novembre 2026)

> Écrite par Cowork le jeudi 5 novembre 2026 à 6 h 16 (Toronto), sur `main` = `2310fb4f` (1.233.0 en ligne). Une seule session à la fois.
> **Vécu par Grégoire ce matin** (Mac, Chrome 156, 1.233.0), sur une reprise réelle qu'il ne peut pas évaluer tant que ce n'est pas corrigé. Contexte complet, constats 7 et 10 : `plans de travail/AUDIT-2026-11-05-importation-association.md`. Le reste de l'audit (le parcours d'import) n'est PAS dans ce lot.

## 0. Avant tout

- Commit de docs seul : cette consigne, l'audit, et la fiche au BACKLOG (vécu : elle entre).

## 1. Le symptôme

Dans « Modifier » d'une copie, « + Ajouter des pages » avec des photos JPEG de téléphone : une fois **enregistrée**, la page est couchée à 90° dans un cadre portrait, l'écriture étirée (largeur et hauteur échangées). Grégoire n'a rien pivoté. Avec un réglage appliqué dans « Réglages spécifiques » (« Balance des blancs »), **l'aperçu de l'éditeur paraît droit, mais la page enregistrée est quand même couchée et étirée** (vu dans Annoter, « 1/3 », 5 nov. à 6 h 12). Les mêmes photos passées par « Préparer et importer » sortent droites.

## 2. Ce que Cowork a lu (pistes, PAS un diagnostic : il a déjà été réfuté une fois)

- Sans réglage, `_insererFichiersTraitesDansEditeur` (`js/travaux-ui.js`) garde le blob brut ; ses dimensions viennent d'un `new Image()` (orientation EXIF appliquée), et `reassemblerPages` (`js/travaux-import.js:1915`) colle les octets JPEG par `doc.addImage(imgData, 'JPEG', …)` (orientation ignorée).
- Avec réglage, `renduFinal` (`js/travaux-preparation.js`) redessine par `new Image()` + canvas, ce qui DEVRAIT produire des pixels droits. Le résultat enregistré dit le contraire : trouve pourquoi (le réglage est-il vraiment empilé ? quel blob part à l'enregistrement ?).
- L'import (étape Optimisation) traite correctement ces photos : réutilise son décodage plutôt que d'en écrire un autre.

## 3. Ce que le lot livre

Une photo ajoutée par « Ajouter des pages », avec ou sans réglage, s'enregistre droite et à ses proportions. Si d'autres gestes passent une image brute par `reassemblerPages` ou un chemin voisin (fusion, édition), mesure-les et règle la source commune, pas chaque appelant.

## 4. La preuve

- Un banc avec un JPEG fictif portant l'EXIF « orientation 6 » (rotation 90°), contenu manifestement fictif. **L'assertion porte sur le PDF ENREGISTRÉ** (relu après « Enregistrer » : proportions de la page égales à celles de la photo vue droite, et un repère de l'image à la place attendue), **jamais sur l'aperçu de l'éditeur** : c'est l'aperçu qui a trompé Cowork ce matin.
- Les deux cas : sans réglage, et avec « Balance des blancs ».
- Contre-épreuves (skill `verification-adverse`) : l'essai rougit sans le correctif.

## 5. Le stock

Tarir n'est pas réparer : les pages déjà enregistrées couchées (la reprise de Grégoire) ne sont PAS réparées par le code, et rien n'est écrit dans ses données. Il refera les deux pages à la main une fois le correctif en ligne. Écris-le au rapport.

## 6. Ce qui n'entre PAS

Le parcours d'import (réunir les fichiers avant l'import), les trois étiquettes ★, la date affichée par « Examiner », l'enregistrement non pris de 5 h 58 (constat 10) — sauf si ta reproduction montre que c'est la même cause : alors dis-le.

## 7. Fin

Commit, Vitest entier (depuis `tests/`), specs touchées. Correctif à mettre en ligne vite (une reprise attend) : patch, ligne des Nouvelles proposée à Grégoire, verdict du Mac, push à sa demande. Rapport `RAPPORT-2026-11-05-ajouter-des-pages-photo-droite.md` à Cowork.
