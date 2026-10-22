# Verdict de relecture – Tout à la française, avec la virgule (#1137)

> Cowork, jeudi 22 octobre 2026, 9 h 55 (Toronto). Relu : `b2f78fa7`, `6e7f448e`, `fbbd4904`, `7a314a7f`, `5caf1b18` (non poussés ; 116 fichiers, +1 057 / −555), la demande `DEMANDE-RELECTURE-2026-10-22-tout-a-la-virgule.md`, les deux captures. Aucun banc rejoué par Cowork : les verts sont ceux que Claude Code rapporte.

## Verdict : accepté, avec un commit de clôture avant la version

Vérifié :

- **Aucune relecture d'un nombre affiché.** Le risque propre à ce lot était un code qui relirait un texte affiché (`parseFloat(textContent)`) et qui, avec la virgule, lirait 89 au lieu de 89,2. Mesuré sur tout `js/` : aucun. Les seuls `replace(',', '.')` sont des saisies, qui acceptaient déjà la virgule.
- **Les captures.** Le profil lit « (70 % + 67 %) ÷ 2 = 68,5 % × 65 % = 44,5 pts » et « Note finale = 44,5 pts + 28,4 pts = 72,9 % » : une seule norme sur la ligne, ce qui motivait la décision. Le graphique lit « 85 % » sur l'axe et « 90 % » dans l'infobulle.
- **Un seul formateur.** Les virgules locales sont rangées dans le module ; la sentinelle interdit d'en remettre une ailleurs.
- **Rien n'est écrit en base** : affichage seul, saisies et exports de données intacts.

## Les suppositions : tranchées

1. **Les « 60% » en dur, dans la prose et dans `index.html`.** La décision de Grégoire est « tout ». Un « 60% » d'une aide se lit comme un nombre, à côté d'écrans qui disent maintenant « 60 % ». **Les convertir aussi**, dans le commit de clôture : textes de `js/` (aides, descriptions des pratiques prédéfinies) et texte visible d'`index.html`. Restent tels quels : le CSS, les commentaires, et **l'historique des Nouvelles déjà publiées** (`changelog-data.js`), qu'on ne réécrit pas.
2. **Le plan exporté.** C'est un document que l'enseignant lit, colle dans le gabarit de son département ou partage, et que rien ne réimporte : ce n'est pas un export de données. **Le convertir**, retirer ses deux entrées de la liste blanche et mettre le golden à jour, en le disant dans le message de commit (changement voulu, pas une régression).
3. **Le zéro final qui tombe** (« 92 % ») : accepté, c'est la règle des notes.
4. **Le stock** (« 0.5 erreur » dans des rétroactions déjà enregistrées) : accepté, on tarit la source. Le poids des codes n'existe que depuis la 1.213 (en ligne cette nuit) : le stock est au plus de quelques copies.
5. **`security-ok`** sur les `innerHTML` qui reçoivent `formaterPourcentage` : accepté, sa sortie n'est que chiffres, virgule, U+00A0 et « % ».
6. **`formaterNombre` arrondi à deux décimales au plus** : accepté. Aucun réglage connu ne porte plus de deux décimales (poids, points, bornes).

## Une retouche de plus, dans le même commit

Les infobulles des graphiques touchés par ce lot lisent « Assiduité (A): 90 % ». En français, une espace insécable précède le deux-points : « Assiduité (A) : 90 % ». Seulement dans les rappels d'infobulle que ce lot a déjà modifiés.

## Hors du lot, sans suite

L'axe du graphique de progression monte à « 103 % ». C'était déjà le cas avant (« 103% ») : la marge de Chart.js, pas ce lot. *Commenter et oublier*, sauf si Grégoire le relève.

## Ensuite

Le commit de clôture, sur `main`, non poussé. Puis la version (le miroir et la virgule ensemble) et son verdict complet, au signal de Grégoire.
