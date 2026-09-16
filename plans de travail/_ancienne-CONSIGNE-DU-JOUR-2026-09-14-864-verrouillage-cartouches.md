# Consigne du jour — #864 : le verrouillage des cartouches sort de l'application

> Écrite le 14 septembre 2026, 17 h 55 (Toronto), sur `f48170d7` (`1.140.11` releasée, **NON POUSSÉE** ; `origin/main` = `21987bc4` = 1.140.10).
> Elle REMPLACE la précédente, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-14-787-doubles-class.md`.
> ⚠⚠ **NE POUSSE PAS `1.140.11` TELLE QUELLE.** Elle ne porte que le correctif de #863, qui vient de perdre son objet. Ce lot le remplace.

---

## 1 · CE QUI S'EST PASSÉ, EN TROIS PAS

1. La porte terrain de #787 demandait de regarder le bouton « Déverrouiller » d'une cartouche verrouillée. **Grégoire ne l'a pas trouvé.**
2. Mesure : le bandeau était caché par une classe que le code ne retirait jamais ⮕ **#863**, corrigé et releasé en `1.140.11`.
3. **Grégoire ne l'a toujours pas trouvé** — et la mesure suivante a dit pourquoi : **le seul bouton qui verrouille une cartouche vit dans deux fonctions que rien n'appelle.** L'état `verrouille` ne peut donc pas devenir vrai par un geste de l'application.

⮕ **Tranché par Grégoire le 14 sept. au soir** : *« Maintenant que tout est namespacé, je crois que c'est réglé. Je n'ai jamais senti que j'avais besoin de verrouiller une cartouche. »* ⮕ **Ablation, règle zéro-dette.**

## 2 · CE QUI PART

Tout est dans `js/cartouches.js` sauf indication. Les numéros de ligne sont ceux de `f48170d7` ; **travaille par symbole, pas par ligne.**

**a) Deux fonctions mortes, entières** — aucun appelant vivant dans tout le dépôt (leurs seules occurrences hors définition sont **des lignes commentées** aux lignes 352, 1076, 1606-1607, 1870, et des blocs de doc) :
- `afficherListeCartouches` (1399-1442)
- `afficherToutesLesGrillesEtCartouches` (1466-1559) — et son export `window.` (3294)

**b) La bascule** : `basculerVerrouillageCartouche` (1587-1614) et son export `window.` (3296).

**c) Trois morceaux morts logés dans des fonctions VIVANTES** — c'est la partie délicate, ne touche que ces morceaux :
- `chargerCartouchePourModif` : le bloc `if (cartouche.verrouille) { … } else { … }` qui cherche `#alerteVerrouillage` et `#btnDeverrouillerCartouche` (1772-1788) ;
- `supprimerCartoucheConfirm` : la garde `if (cartouche && cartouche.verrouille) { alert('Déverrouille ce cartouche…') }` (1824-1827) — une phrase que personne n'a jamais pu lire, et qui porte une faute d'accord ;
- `afficherBanqueCartouches` : `verrouIcone` (3502) et sa consommation dans le gabarit (3508).

**d) `index.html`** : le bloc `#alerteVerrouillage` avec son bouton `#btnDeverrouillerCartouche`, et la règle `.hidden-my15-warning` du bloc `<style>` — **si et seulement si** elle ne sert plus à aucune autre balise (mesuré le 14 : un seul site, mais remesure).

**e) `tests/integration/cartouche-verrouillee-bandeau-863.spec.js`** — il part avec son sujet. ⚠ Le geste le plus risqué d'un lot : vérifie par le CONTENU que les symboles qu'il éprouve n'existent plus nulle part, pas par le nom du fichier.

## 3 · CE QUI NE PART PAS — et c'est délibéré

**Le champ `verrouille` reste dans les sept schémas d'échange** : `js/partage-schemas.js` (338, 431, 451) et `js/import-export.js` (623, 813, 917, 958). ⮕ **C'est ce qui VOYAGE**, et la révision du 1er septembre de la règle zéro-dette protège exactement ça : un fichier déjà exporté ou partagé doit rester lisible. Le champ devient toléré et ignoré.

**`verrouille: false` reste écrit à la création et à la duplication** (212, 483, 1656, 3815). Motif : le retirer toucherait la forme de ce qui s'exporte, pour zéro gain. Un booléen à faux que plus rien ne lit ne coûte rien.

**Le STOCK n'est pas réécrit.** Les cartouches déjà en base chez Grégoire portent `verrouille: false` ; il devient inerte, comme les clés de #659. ⛔ **Écrire dans ses données remonte à lui** — on mesure, on sépare, on n'y touche pas.

## 4 · LA PREUVE EXIGÉE

1. **Aucun symbole survivant** : `grep -rn` sur `basculerVerrouillageCartouche`, `afficherListeCartouches`, `afficherToutesLesGrillesEtCartouches`, `alerteVerrouillage`, `btnDeverrouillerCartouche`, `verrouIcone` ⮕ zéro occurrence hors de l'archive du backlog.
2. **Une sentinelle de non-retour** : plus aucun lecteur de `cartouche.verrouille` dans `js/` **hors des schémas d'échange** nommés au § 3. Elle doit rougir si on réintroduit un lecteur.
3. **Break-test à montrer** : remets un lecteur, la sentinelle rougit **en le nommant**.
4. **Rien ne change à l'écran** : la banque de cartouches et l'ouverture d'une cartouche rendent la même chose qu'avant. C'est une ablation de code mort.
5. Vitest depuis `tests/`, jamais depuis la racine.

## 5 · APRÈS

- **La version** : `1.140.11` est déjà écrite par `release.mjs` sur `f48170d7`, non poussée. **Tranche seul** comment y loger ce lot — l'ajouter sous la même `1.140.11`, ou re-releaser — et dis en une ligne ce que tu as choisi.
- **Pas d'entrée « Nouvelles »** : rien ne change pour un utilisateur. (Décision déjà prise pour #863, même motif.)
- **Pas de porte terrain.** Aucune vérification à l'écran : la règle du skill `portes-terrain` dit qu'aucune porte n'est due si une machine peut répondre.
- **Au BACKLOG** : inscrire **#864** (le texte vient dans le message de Grégoire), le cocher dans le même commit s'il est livré, et **ajouter une ligne à #863** disant qu'elle est retirée par #864 — le correctif était juste, c'est la question qu'il réparait qui n'existe plus. Mettre à jour « Dernier ID utilisé » de #863 à #864.
- ⚠ **Deux commits attendent le push** après celui-ci : la 1.140.11 de #863 et ce lot.
