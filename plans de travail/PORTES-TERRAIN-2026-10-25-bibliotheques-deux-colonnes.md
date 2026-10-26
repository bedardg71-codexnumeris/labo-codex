# Portes terrain – Les bibliothèques en deux colonnes, et les trois listes simples (#1154 à #1159)

> Claude Code, 25 octobre 2026, fin d'après-midi, sur la branche `bibliotheques-deux-colonnes` (lot 4) ; **complétée le soir même pour les dix fenêtres** (lot 6 : les tampons, les cours, les trimestres, les groupes-cours). Skill `portes-terrain`, ses deux règles de tête. **Markdown seul : Cowork publie l'artefact jumeau**, avec le bouton « Copier mes résultats ».
> **Cette porte attend la mise en ligne groupée** : la fusion dans `main`, la release et le push (plan, « La livraison »). Avant cela, l'application en ligne montre l'ancienne fenêtre, et une porte jugerait la version d'avant.
> Ce qui échoue devient un item du BACKLOG, avec le numéro de sa porte.

## Pourquoi il y a des portes, et pourquoi si peu

- **Règle 1** : tout ce qu'une machine pouvait mesurer l'est, dans le WebKit de Playwright, sur le vrai `index.html`, à 1 440 et à 820 px, pour les dix fenêtres (bancs `bibliotheque-deux-colonnes-1154` à `-1158`, et `bibliotheque-liste-1159` pour les trois listes simples) : les titres, les passages, ⋮ et leurs actions, l'aperçu, l'empilement, les flèches, les 44 px, le défilement après un passage ; « Mettre de côté » et « Remettre… » qui font passer une rangée dans le groupe replié et l'en ramènent, et son compte.
- **Règle 2** : le chantier ne change que la présentation, sauf deux décisions déjà relues (« Supprimer définitivement » garde l'exemplaire de la bibliothèque). Un raté serait de l'apparence ou du confort.
- **Ce qui reste, et que seul Grégoire peut faire** : le doigt sur l'iPad réel, Safari réel, et reconnaître **ses** éléments de l'automne 2026 dans les nouvelles colonnes. C'est ce que la consigne du lot 4 demande (§ 4.2).

## § 0 · Préalable

| N° | Geste | Attendu |
|---|---|---|
| 0.1 | Ouvre `https://app.codexnumeris.org`, recharge, lis le numéro en bas de page. | Le numéro de la release qui porte ce chantier (Claude Code l'écrira ici à la release). Un autre numéro : arrête, la porte jugerait l'ancienne version. |
| 0.2 | Sur tes vraies données, **ne choisis rien** dans les menus ⋮ et n'appuie sur aucun passage. | Les gestes qui écrivent se font tous en mode démonstration (§ 2). |

## § 1 · Tes vraies données : regarder seulement

**Pourquoi** : la machine travaille sur la démonstration. Elle ne sait pas si tes grilles, échelles, cartouches, productions, pratiques, cartes, tampons, cours, trimestres et groupes-cours de l'automne 2026 sont tous là, au bon endroit.

Dans chaque fenêtre de la Conception : la page › « Consulter la bibliothèque ». Ouvre un aperçu (touche le nom d'une rangée), ouvre un ⋮ puis referme-le sans rien choisir, fais défiler. Pour les trois dernières : Réglages › Cadre › l'accordéon › « Consulter la bibliothèque » ; ouvre le groupe replié du bas en touchant son titre.

| N° | Fenêtre | Attendu |
|---|---|---|
| 1.1 | Grilles de critères | Tes grilles de l'automne sont dans « Dans ce trimestre » ; celles que tu gardes, dans « Dans ta bibliothèque ». L'aperçu montre les critères et le total. |
| 1.2 | Échelles de performance | Même chose pour tes échelles. |
| 1.3 | Cartouches de rétroaction | Tes cartouches, rangées sous le nom de leur grille, dans chaque colonne. |
| 1.4 | Productions étudiantes | Tes productions, avec leur type et leur pondération sur la ligne sous le nom. |
| 1.5 | Pratiques de notation | Ta pratique, avec sa famille en mots (par exemple « Sommative », « PAN-Standards »). |
| 1.6 | Carte d'alignement (bouton « Consulter la bibliothèque » de la barre de la carte) | Tes cartes de ce trimestre à gauche, avec « N nœuds · N liens » ; celles de ta bibliothèque à droite. |
| 1.7 | Tampons (Évaluation › Annoter › une copie › le bouton de la bibliothèque, au bas de la palette) | Tes tampons de la palette à gauche, « Dans ta palette », rangés par catégorie ; ceux de ta bibliothèque à droite. |
| 1.8 | Cours (Cadre › Cours) | Tes cours de l'automne dans la liste, celui en cours marqué « Actif » ; les fiches que tu avais retirées, en bas sous « Mis de côté ». |
| 1.9 | Trimestres (Cadre › Trimestre) | Ton trimestre en cours marqué « Actif », sans bouton ni ⋮ ; tes trimestres clos, en bas sous « Clos ». |
| 1.10 | Groupes-cours (Cadre › Groupe-cours) | Tes groupes de l'automne dans la liste, celui de l'en-tête marqué « Actif » ; ceux que tu avais masqués, en bas sous « Mis de côté ». Nulle part le mot « dropdown ». |

## § 2 · L'iPad au doigt, en mode démonstration

**Pourquoi** : le doigt n'est pas une souris ; la machine clique, elle ne touche pas. Le composant est le même pour les six fenêtres : deux suffisent, celle des grilles et celle de la Carte.

Active la démonstration (page d'accueil, case « Données de démonstration » ; le bandeau vert « Mode démonstration » apparaît en bas), puis, sur l'iPad **en paysage**, ouvre la bibliothèque des grilles.

| N° | Geste | Attendu |
|---|---|---|
| 2.1 | Touche « ← Utiliser dans ce trimestre » sur une grille de « Dans ta bibliothèque ». | La grille apparaît dans « Dans ce trimestre » ; la fenêtre reste ouverte, **au même endroit** (pas de retour en haut). |
| 2.2 | Touche le ⋮ d'une rangée de « Dans ce trimestre ». | Le menu s'ouvre au premier toucher ; chaque entrée se touche sans viser. Touche ailleurs : il se ferme. |
| 2.3 | Touche le nom d'une grille. | L'aperçu (les critères, le total) se déplie sous la rangée ; touche encore : il se replie. |
| 2.4 | Fais défiler la fenêtre jusqu'en bas, au doigt. | Le défilement suit le doigt, sans saut, et la page derrière ne bouge pas. |
| 2.5 | Tourne l'iPad **en portrait**. | Les deux colonnes s'empilent, « Dans ce trimestre » en haut ; les flèches deviennent ↓ et ↑. |
| 2.6 | Carte d'alignement (toujours en démonstration) : touche « Garder dans ma bibliothèque → » sur la carte de ce trimestre. | La fenêtre des métadonnées s'ouvre par-dessus ; une fois la fenêtre validée, la carte apparaît dans « Dans ta bibliothèque ». |
| 2.7 | Cadre › Cours › « Consulter la bibliothèque » (toujours en démonstration) : ⋮ d'un cours › « Mettre de côté ». | La rangée quitte la liste ; le titre du bas passe à « Mis de côté (n+1) », replié. |
| 2.8 | Touche « Mis de côté (n) ». | Le groupe se déplie au premier toucher ; le cours y est, avec « Remettre dans mes cours ». |
| 2.9 | Touche « Remettre dans mes cours ». | Le cours revient dans la liste ; le compte redescend ; le groupe reste ouvert. |

## § 3 · Safari au Mac

| N° | Geste | Attendu |
|---|---|---|
| 3.1 | En démonstration, ouvre une à une les sept fenêtres en deux colonnes (les six de la Conception, et les tampons), en mode clair puis sombre. | Deux colonnes côte à côte, lisibles dans les deux modes ; aucune rangée qui déborde. |
| 3.2 | Même chose pour les trois listes simples (cours, trimestres, groupes-cours), groupe du bas ouvert. | Une seule liste, lisible dans les deux modes ; « Actif » se lit sans chercher. |

## § 4 · Ce que je n'ai pas pu vérifier

| Angle mort | Pourquoi la machine ne tranche pas | Ce que Grégoire remarquerait |
|---|---|---|
| Le toucher réel (passage, ⋮, aperçu, défilement) | Playwright émule le clic, pas le doigt | Un bouton qui demande deux touchers, un menu qui se ferme tout seul |
| Safari réel | Le WebKit de Playwright est proche, pas identique | Une colonne mal placée, un menu ⋮ coupé |
| Ses vraies données | Les bancs partent de la démonstration | Un élément absent, ou dans la mauvaise colonne |
| Les trois listes simples n'ont plus de bouton ⓘ | L'aide « Comment fonctionne la bibliothèque » décrit deux colonnes ; ces trois fenêtres n'en ont pas (lot 6, écart écrit dans la demande de relecture) | Un bouton d'aide qui manque, là où il y en avait un |
| La phrase « Aucun cours pour l'instant. » (liste des cours vide) | Mot neuf, non validé : la liste n'est vide que si tous les cours sont mis de côté | Une phrase qui sonne faux |
