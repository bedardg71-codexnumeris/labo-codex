# Consigne – Les bibliothèques en deux colonnes, lot 6 : les trois listes simples, puis le retrait (#1159)

> Écrite par Cowork le dimanche 25 octobre 2026 à 19 h 15 (Toronto). Branche `bibliotheques-deux-colonnes` = `e154b19d` (lot 5 clos). Plan : `PLAN-2026-10-24-bibliotheques-deux-colonnes.md`, lot 6 et « Les étapes de la mise en ligne groupée ». Les règles des lots 1 à 5 valent ici (consigne du lot 1, § 2 et § 5 ; verdicts des lots 1 à 5).
> **Les mots de ce lot sont tous validés par Grégoire** : les cours le 25 oct. à 16 h 56, les trimestres et les groupes-cours à 19 h 06. Pose-les mot pour mot ; si l'un se révèle faux à la mesure, garde l'ancien et dis-le.

## 0. Avant tout

- Sur la branche `bibliotheques-deux-colonnes`. Rituel de début de session. Un commit de docs seul : ce fichier.
- **Le composant** : trois fenêtres à **une seule liste**, avec un groupe replié en bas. Étends le composant du lot 1 (une option, ou une fonction sœur qui partage le rendu des rangées), sans changer ce qu'il rend pour les sept fenêtres déjà migrées : leurs bancs restent verts sans retouche.

## 1. Les cours (`js/cours.js`, `ouvrirModalBibliothequeCours`, l. ~289)

| Aujourd'hui | Maintenant |
|---|---|
| « Cours dans ta sélection » (`dansBibliotheque !== false`) | la liste, sans intertitre |
| « Cours disponibles à ajouter » (`=== false`) | en bas, **« Mis de côté (n) »**, replié |
| « Reprendre dans ce trimestre » | inchangé, le bouton de chaque rangée de la liste |
| ⋮ « Déposer dans les cours disponibles » et « Retirer de ma sélection » | ⋮ **« Mettre de côté »**, un seul geste (il remplace les deux) |
| « Ajouter à ma sélection » (sur un cours disponible) | **« Remettre dans mes cours »**, le bouton de la rangée mise de côté |
| ⋮ « Exporter », « Supprimer la fiche » | inchangés |
| Badge « Actif » | « Actif » en clair, dans la ligne de la rangée |

- **« Mettre de côté »** : mesure les actions de « Déposer… » et de « Retirer… ». Si les deux ne font que poser `dansBibliotheque = false`, garde l'une. Si « Déposer… » écrit davantage (ses métadonnées Creative Commons, d'après sa bulle), « Mettre de côté » prend l'action de « Retirer… », et la demande dit ce que « Déposer… » écrivait et que plus rien n'écrit. Aucune donnée déjà écrite n'est touchée.
- Le titre et le sous-titre de la fenêtre ne changent pas.
- #458 tient : un cours sans drapeau est dans la liste, jamais invisible.

## 2. Les trimestres (`js/trimestre-v2-liste.js`, l. ~275)

- Titre **« Bibliothèque des trimestres »** (sans l'emoji) ; sous-titre gardé : « Active, clos ou rouvre tes trimestres. »
- Une seule liste. Sous chaque nom, en clair : **« Actif »** ou **« Ouvert »** (au lieu de « Trimestre actuellement actif » et « Disponible »).
- Le bouton de la rangée : **« Activer »** ; dans ⋮ : **« Clore »**, **« Supprimer… »**. Le trimestre actif n'a ni bouton ni ⋮ (#361, comme aujourd'hui).
- Les trimestres clos en bas, sous **« Clos (n) »**, replié. Leur bouton : **« Rouvrir »** ; dans ⋮ : les gestes d'archives d'aujourd'hui (leurs mots viennent de `ReserveTrimestre.MOTS`, `ReserveCopies.MOTS`, `ReserveRenvoyer.MOTS` : inchangés), puis **« Supprimer… »**.
- La liste vide : la phrase d'aujourd'hui (« Aucun trimestre actif ») devient **« Aucun trimestre ouvert. »** (même règle que le mot de la rangée).
- Les confirmations (clore, rouvrir, la double confirmation de suppression, le codex exigé du 4 oct.) ne changent pas.

## 3. Les groupes-cours (`js/trimestre-v2-groupes-cours.js`, l. ~1081)

- Titre **« Bibliothèque des groupes-cours »** ; sous-titre **« Les groupes-cours que le menu de l'en-tête te propose. »**
- Une seule liste. **« Actif »** en clair sous le groupe actif ; bouton **« Activer »** sur les autres.
- Dans ⋮ : **« Mettre de côté »** (au lieu de « Masquer », même action) et **« Supprimer »**.
- Les groupes mis de côté (`dansSidebar === false`) en bas, sous **« Mis de côté (n) »**, replié. Leur bouton : **« Remettre dans le menu »** (au lieu de « Afficher », même action).
- **Plus de « dropdown »**, ni dans les mots ni dans les bulles (`title`). La liste vide : **« Aucun groupe-cours pour l'instant. Crée-en un avec « + Nouveau groupe-cours ». »**

## 4. Le retrait (zéro dette)

Quand les trois fenêtres sont migrées, `BibliothequeUI.creerModal` n'a plus d'appelant (mesuré par Cowork : les trois derniers sont `cours.js`, `trimestre-v2-liste.js`, `trimestre-v2-groupes-cours.js`). Retire `creerModal`, `renderCarteSelection`, `renderCarteDisponible`, le CSS `biblio-carte-*` et tout ce qui n'avait qu'eux pour lecteur (prouve-le par `grep`, dans `js/`, `styles.css`, `index.html`, `design-system.html` et `tests/`). Le cliquet des classes sans règle (#679) et la sentinelle #467 descendent : dis de combien.

## 5. La preuve

- Un banc neuf par fenêtre (ou un banc pour les trois), dans le vrai `index.html`, depuis la démonstration, à 1440 et 820 px : les mots mot pour mot ; chaque geste de la rangée et de ⋮ appelle l'action d'aujourd'hui ; « Mettre de côté » envoie la rangée dans le groupe replié et « Remettre… » la ramène ; le compte « (n) » suit ; le trimestre actif sans bouton ni ⋮ ; aucune trace de « dropdown ». Break-test par famille.
- Les bancs des trois fenêtres réancrés, motif écrit ; ceux des sept autres verts sans retouche.
- Le retrait : `grep` nul, et un break-test qui prouve qu'un appel restant serait vu.
- Vitest ; les specs de bibliothèque, de cours, de trimestres et de groupes-cours. **Pas de suite Playwright complète** : elle se prend sur `main` fusionné (plan, étape 4).
- Captures : `plans de travail/captures-<date>-bibliotheques-deux-colonnes-6/`, les trois fenêtres, Mac 1440 clair et sombre (un groupe « Mis de côté » ouvert), iPad 820 clair.

## 6. Ce qui n'entre pas

Les données, les clés, les règles d'identité ; les confirmations ; tout geste neuf ; #1160 à #1167.

## 7. Clôture

- Un commit `feat(bibliotheques)` qui nomme #1159 ; la ligne du lot 6 au plan.
- **Le brouillon des Nouvelles, pour les dix fenêtres** : réécris celui du § 5.2 de la demande du lot 4, dans la demande de ce lot, court, en gestes d'utilisateur. Il n'est pas codé : Cowork le soumettra à Grégoire (plan, étape 2).
- **La porte terrain** : complète `PORTES-TERRAIN-2026-10-25-bibliotheques-deux-colonnes.md` pour les dix fenêtres (le skill `portes-terrain`) ; Cowork publiera l'artefact après la mise en ligne.
- **Pas de fusion, ni release, ni verdict complet, ni push** : les étapes 3 à 5 du plan suivent le verdict de Cowork et les Nouvelles validées, au signal de Grégoire.
- **Demande de relecture** : `plans de travail/DEMANDE-RELECTURE-<date>-bibliotheques-deux-colonnes-6.md` : mesuré et supposé ; « Mettre de côté » des cours (§ 1) ; le retrait, chiffré ; chaque banc réancré ; tes écarts ; les trouvailles et leur issue ; le brouillon des Nouvelles.
