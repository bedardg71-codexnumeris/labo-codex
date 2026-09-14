# Lot #478 — le parcours de rentrée : les deux frictions qui mordent avant tout le reste

> Écrite le 13 septembre 2026, 19 h 45 (Toronto). **À exécuter APRÈS le lot du septième site de #575** (`CONSIGNE-DU-JOUR.md`).
> Fiche : **#478** (I7, constat CT-28 de `plans de travail/AUDIT-cadre-trimestre-2026-08-20.md`). Elle était rangée « après la cohorte » au tri du 12 sept. ; **Grégoire la rouvre le 13 au soir**, parce que la communauté de pratique ouvre l'application mardi 15 et fera exactement ce parcours.

## 1 · Ce que la mesure a trouvé, et l'écart avec l'audit

CT-28 relevait cinq frictions du parcours vierge (trimestre → cours → enseignant·e → horaire → groupe-cours). **Remesurées le 13 septembre sur `8acf6a42`, les cinq sont vivantes** :

| | Friction | Site mesuré |
|---|---|---|
| (a) | La création d'un trimestre passe par `prompt()` / `confirm()` natifs | `js/trimestre-v2-liste.js:562`, `:581`, `:604` |
| (b) | « Veuillez sélectionner un groupe associé » ne dit pas OÙ créer ce groupe | `js/trimestre-v2-horaires.js:840` |
| (c) | « Veuillez sélectionner un trimestre » s'affiche sur l'unique trimestre existant | `js/trimestre-v2-groupes-cours.js:622` |
| (d) | L'aide du groupe-cours est un `alert()` natif | `js/trimestre-v2-groupes-cours.js:126` |
| (e) | La carte de complétude dit « X/5 configurés » | `js/trimestre-v2-groupes-cours.js:416`, jumeau `js/trimestre-v2-cours.js:1193` |

⚠ **UN ÉCART AVEC L'AUDIT, mesuré** : CT-28 affirme que « le libellé attendu *Complet* n'existe plus ». **C'est faux au code** — la ligne `:416` est `estComplet ? 'Complet' : ${score}/5 configurés`. Le libellé existe ; il ne paraît que lorsque tout est configuré. L'audit du 20 août s'est trompé, ou le site a changé depuis. **Ne code pas contre cette phrase de l'audit : mesure d'abord.**

## 2 · Le périmètre : (b) et (c), et rien d'autre

**Décision de cadrage, prise par mesure du coût et non par arbitrage.** (a) n'est pas un quick-win : remplacer trois dialogues natifs par un formulaire, c'est un écran neuf, sa validation et son verdict à l'écran — pas avant mardi. (d) demande un vrai travail de design (charger le skill `design-interface`), donc pas ce soir non plus. (e) est traité au §4 comme une MESURE, pas comme un geste.

Restent (b) et (c) : **deux messages d'erreur qui laissent l'utilisateur devant un mur sans lui dire par où passer.** Un seul site chacun, aucun calcul touché, aucune donnée touchée. C'est le meilleur rapport entre ce que ça coûte à prouver et ce que ça épargne à quelqu'un qui découvre l'application mardi matin.

## 3 · Le geste

**(c) d'abord, parce qu'il peut disparaître au lieu d'être réécrit.** Le formulaire du groupe-cours ne présélectionne pas le trimestre ACTIF, et rend « Veuillez sélectionner un trimestre » alors qu'un seul existe. ⮕ **Mesure avant d'écrire** : le trimestre actif est-il connu à l'ouverture de ce formulaire ? S'il l'est, **présélectionne-le et le message ne se déclenche plus** — c'est une friction qui s'efface, pas un texte à améliorer. S'il ne l'est pas, dis pourquoi et on se rabat sur le texte.

**(b) ensuite.** Le refus est juste ; c'est la suite qui manque. Le message doit nommer l'endroit où l'on crée un groupe. ⮕ **Mesure d'abord où ça se crée réellement** (quel accordéon, quel libellé exact à l'écran) et cite ce libellé mot pour mot dans le message. Un message qui nomme un écran approximatif est pire que le message actuel.

⚠ **Les deux textes sont des mots que des collègues liront mardi : ils passent par Grégoire avant d'être posés.** Ne les invente pas, ne les « améliore » pas de toi-même.

## 4 · La mesure qui pourrait ouvrir une fiche, et qui ne se code pas ici

Le « /5 » de la complétude est **écrit en dur à deux endroits**. Or depuis #842 (12 sept.), **sur un service l'horaire est facultatif** : les éléments obligatoires y sont quatre, pas cinq. ⮕ **Vérifie ce que la carte affiche pour un service dont tout est configuré sauf l'horaire.** Si elle annonce « 4/5 configurés » et ne dit jamais « Complet », ce n'est plus de la micro-UX : c'est un écran qui dit à l'orthopédagogue que son service est incomplet alors qu'il ne l'est pas, **le jour où elle l'ouvre**. Dans ce cas, **inscris une fiche et remonte-le — ne le corrige pas dans ce lot**, dont le périmètre reste (b) et (c).

## 5 · La preuve

Sentinelle par geste, break-tests rouges vérifiés isolément, restauration vérifiée. Pour (c), **le cas qui prouve quelque chose** est un poste avec UN SEUL trimestre : c'est le montage où la présélection et l'absence de présélection divergent. Un montage à deux trimestres ne prouve rien.

⚠ Le rendu change dans le Cadre : porte terrain due (skill `portes-terrain`), et elle se joue sur un poste vierge — pas sur les données de Grégoire.

## 6 · Ce que ce lot ne rouvre pas

(a), (d) et (e) de CT-28 · #842, #846, #848 (le vocabulaire des services, livré) · #844 et #845. Aucun bump, aucune release avant le verdict de la porte.
