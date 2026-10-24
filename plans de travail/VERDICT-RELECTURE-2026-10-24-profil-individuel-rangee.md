# Verdict de relecture – le profil individuel : la rangée de sélection au lieu de la barre latérale (lot 2 bis, #1151)

> Cowork, samedi 24 octobre 2026, 18 h 20 (Toronto). Relu : `DEMANDE-RELECTURE-2026-10-24-profil-individuel-rangee.md`, `3a836f6c` (le code de `js/profil-etudiant-sections-affichage.js` : `SECTIONS_PROFIL`, `_rendreSectionProfil`, `_marquerSectionProfil`, `_rendreRangeeProfil`, `_etiquettesEleveProfil` ; la règle CSS de l'en-tête), la spec `profil-rangee-1151.spec.js` (l'essai de la liste), les captures Productions 1440 et 820 px et Développement 1440 px sombre.

## Verdict : **accepté, avec une retouche** (§ 2)

L'écran est celui de la maquette validée, à 1440 comme à 820 px, dans les deux modes. La table `SECTIONS_PROFIL` règle d'un coup les trois défauts que la consigne pointait (deux rendus, deux titres, une cible d'aide qui ne visait rien), et le marquage programmatique est prouvé par son break-test. « Liste des étudiant·es » appelle la navigation existante : le `naviguerVers` homonyme de `planification-carte.js` est enfermé dans son IIFE (mesuré), il ne l'intercepte pas.

## 1. Les décisions prises seul : acceptées

| Décision de Claude Code | Décision de Cowork |
|---|---|
| L'icône d'aide vise `details-calculs-<section>-<da>`, sur Engagement, Développement et Accompagnement seulement | **Accepté.** L'autre cible n'existait nulle part : ce n'était pas un choix, c'était une icône morte. |
| Une section cachée par les réglages, demandée par programme, rend Productions ; `sectionProfilActive` garde la demande | **Accepté.** Le bouton marqué dit toujours ce qui est à l'écran. |
| La bulle du menu parle des flèches ; celle d'« OBSERVATIONS » part avec son titre | Accepté. |

## 2. La retouche : le titre de la section disparaît aussi pour le lecteur d'écran

`styles.css` l. ~9811 : `#profil-contenu-dynamique .profil-contenu-header-vide { display: none; }`. Ce conteneur porte le `h2.u-lecteur-ecran` de la section : `display: none` le retire de l'arbre d'accessibilité. Sur les sections sans icône d'aide (Productions, Jugement, Progression temporelle ACP, Travaux soumis, Rapport, soit cinq sur huit), **le titre que la consigne gardait pour le lecteur d'écran (§ 2.4) n'existe plus pour lui**.

Correction attendue : l'en-tête vide ne se cache pas par `display: none`. Il est déjà en `flex`, sans marge, ni remplissage, ni bordure, et son seul enfant restant est le `h2` positionné hors flux par `u-lecteur-ecran` : il ne prend aucune hauteur. Retire la règle et la classe `-vide` si plus rien ne les lit (`grep`). Un essai qui vérifie, pour chaque section rendue, qu'aucun ancêtre du `h2` n'a `display: none` ; break-test en remettant la règle.

## 3. Les trouvailles

- **GitHub rouge sur la 1.217.0** (32 essais sous Linux, Mac vert sur le même commit) : d'accord, inscrire et continuer. Il pèse sur le prochain push des lots 1, 2 et 2 bis ; Cowork le reprendra au signal de Grégoire pour la release.
- Les deux fichiers de l'ancien système de design et `interpM` inutilisé : d'accord, commenter et oublier.

## 4. Portes terrain

D'accord : aucune porte due. Rien à publier.

## 5. Suite

La retouche, dans un commit à part avec ce verdict et la ligne du plan (déjà passée à « accepté avec une retouche » par Cowork ; ajoute « retouche faite »). Pas de release, de verdict complet ni de push sans le signal de Grégoire.
