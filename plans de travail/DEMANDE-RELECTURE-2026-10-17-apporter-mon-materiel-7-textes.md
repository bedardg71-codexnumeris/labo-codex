# Demande de relecture – « Apporter mon matériel », étape 7 du plan : les textes de Grégoire

> Claude Code, samedi 17 octobre 2026, vers 15 h 50 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-7-textes.md` (15 h 02). Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Trois commits locaux, non poussés**, au-dessus de `a26fb3dd` : `e87f5ad7` (les onze textes et D1, avec la consigne du jour, la consigne du lot, le plan et l'ancienne consigne archivée), `963cc15f` (8.16), `af1fbe99` (les Nouvelles). Un quatrième, de documents seulement, porte cette demande et l'inventaire marqué. Aucun push, aucune release, aucun verdict complet (étape 8).

## État mesuré

- Vitest complet, depuis `tests/`, **après le dernier commit de code** (`af1fbe99`) : **771 fichiers, 9 132 essais, verts** (9 129 + les 3 essais neufs de 8.16).
- Specs du matériel, seules, dans WebKit (`integration/materiel-*` et `lot4-gabarit-algo-cartes.spec.js`, que D1 touche) : **21/21 verts**, en 1,2 min, sur `af1fbe99`. Ce n'est pas le verdict.
- Break-test de l'essai neuf de 8.16 (`materiel-etape5b-reconnaissance.test.js`, bloc « 8.16 », P.a à P.c) : règle retirée (`prefixeDePartie` rend la partie telle quelle) → **6 rouges** (F4a, F6, F8, R.10, P.a, P.b) ; exception retirée (lettre seule et chiffre romain ramenés aussi) → **2 rouges** (F4a, P.c). Vert une fois restauré.
- Jetons avancés (date du build `1015`, lettre suivante) : `grilles.js` c, `materiel-lecture.js` k, `materiel-assistant.js` h, `materiel.js` j, `changelog-data.js` b, `accompagnement-contenu-hover.js` c. La sentinelle anti-cache est dans le Vitest vert ci-dessus.

## Ce que j'ai fait

1. **Les onze textes**, mot pour mot, apostrophes typographiques : 1.1, 1.4, 2.1, 8.1, 8.2, 8.6, 20.13, 20.14, 10.2, 12.6, 15.11. Le code de l'onglet n'a aucune espace insécable (mesuré : zéro dans `materiel.js`, `materiel-assistant.js`, `index.html`) ; les textes neufs n'en ont pas non plus, comme ceux de la consigne.
2. **D1** : « Descripteur » → « Description » sur le champ du texte d'un critère, dans les deux gabarits de `grilles.js` (création et édition). Mesuré d'un `grep` sur tout le dépôt : **aucune autre mention de CE champ** sous le nom « Descripteur » (ni texte d'exemple, ni aide, ni info-bulle). Les « Descripteur : … » et « Descripteur (facultatif) » de `materiel.js` sont les descripteurs **par niveau** : non touchés. L'item des Nouvelles 1.117 (`changelog-data.js`), qui racontait le passage à « Descripteur » le 4 sept., est de l'histoire : non touché.
3. **8.16** : `casseDePartie` (`materiel-lecture.js`), appelée par `prefixeDePartie`, vaut donc pour la partie en rangée (5b) et pour la colonne « Partie » (étape 5). Une partie sans aucune minuscule prend une majuscule initiale ; une partie qui en porte garde sa casse ; le nom du critère n'est jamais touché (essai P.a : « SUJET POSÉ » reste tel quel).
4. **N1** : entrée `1.203`, `vert`, titre et sept items mot pour mot, `&nbsp;` devant « : », « ; » et dans « » comme les entrées voisines. `version.json` reste à 1.202.0.
5. **Les essais qui épinglaient un ancien texte suivent le neuf**, et rien d'autre : U.d (5b), C.a (lot 3a, code invalide), la spec du bandeau, la spec du lot 3a (titre), H.g et sa spec (lot 4, D1), F4a, F6, F8, R.10 et la spec 5b (8.16). La spec du bandeau vérifie maintenant le texte neuf et que l'emoji est dans un `span aria-hidden`.
6. **L'inventaire** est marqué (voir plus bas, un écart de compte).

## Ce que j'ai supposé, ou fait trancher

- **8.16, une lettre seule et un chiffre romain : tranché par Grégoire pendant la session** (question fermée, 17 oct. vers 15 h 25). À la lettre, « PARTIE A » serait devenu « Partie a » (c'est l'échantillon F4a) ; il a choisi « garder en capitale ». D'où : « PARTIE A » → « Partie A », « PARTIE II » → « Partie II ». Supposition de Claude Code dans la foulée : une lettre **élidée** n'est pas une lettre seule (« ANALYSE DE L’ŒUVRE » → « Analyse de l’œuvre »), et « À » non plus (« À PROPOS » → « À propos »). Limite connue, sans essai : un mot d'une lettre qui n'est pas une étiquette (« IL Y A ») garderait sa capitale (« Il Y A ») ; un nom de partie de cette forme est improbable, et il se corrige à la Vérification.
- Les suppositions de Cowork, dites à Grégoire : en 1.1, l'espace double ramenée à une seule ; 1.2 inchangée ; en 2.1, l'emoji en `aria-hidden` et le `<strong>En construction.</strong>` retiré.
- 10.2 : le texte neuf s'arrête à « à ce niveau. » — « L’application n’en propose aucune : c’est ta pratique. » disparaît avec l'ancien, puisque la consigne donne le texte entier.

## L'inventaire, et un écart de compte

89 lignes portent « validé G. – 17 oct., 15 h 00 » : les **86 provisoires** (prov. CC, prov. Cowork) et les **3 « proto adapté »** (5.14, 10.2, 17.6) ; **77 tels quels, 12 au texte neuf** (les onze textes et la règle 8.16, dans la colonne « Texte exact »). D1 est noté au § 18, 8.16 aussi sous le § 20. ⚠ La consigne dit « 75 tels quels, 14 qui changent », D1 et N1 compris ; ces deux-là ne sont pas des lignes de l'inventaire, donc les 89 de la page ne sont pas exactement mes 89 lignes : **écart de deux**, que ta page départage. Je n'ai rien deviné de plus.

## À regarder en priorité

1. `casseDePartie` : le motif des chiffres romains (`/^(?=[IVX])X{0,3}(IX|IV|V?I{0,3})$/`, jusqu'à XXXIX) et l'exclusion de la lettre élidée.
2. Le bandeau 2.1 sur l'iPad : l'emoji avant le texte, dans `alerte-attention` (pas vu sur l'appareil).
3. L'écart de compte de l'inventaire.

## Trouvailles en chemin

Aucune hors lot.
