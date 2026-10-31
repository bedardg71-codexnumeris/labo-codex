# Rapport – Une copie faite pendant la démo rejoint ta bibliothèque

> Claude Code, samedi 31 octobre 2026. Consigne : `CONSIGNE-LOT-2026-10-31-copie-demo-bibliotheque.md`. Sans release ni push. Relecture de Cowork due. Avis de machine, pas de pair.

## En une phrase

**Le chemin n'est prouvé que pour la grille : le bouton est livré pour elle seule ; les quatre autres familles sont arrêtées et attendent une décision.** Cela s'écarte de ce que supposait la consigne, qui parlait de cinq familles (§ 0.3 appliqué).

## Étape 0, famille par famille

Mesuré dans WebKit, données fictives, sur le pack 21.3, avec un vrai rechargement avant le vrai trimestre (lecture du code seule pour ce qui est marqué « lu »).

| Famille | « Dupliquer » en démo | « Garder » existe | Dans un vrai trimestre | Ligne « Inspiré de » | Décision |
|---|---|---|---|---|---|
| **Grille** | oui | oui | arrive entière, 5 critères, aucune référence au pack | « … par Labo Codex » (les 3 grilles) | **Bouton livré** |
| **Échelle** | oui | oui | utilisable, mais garde `estDemo: true` : exclue de ses exports | « … par Inconnu » (les 2 échelles) | **Arrêtée** |
| **Production** | oui | oui | formulaire : une option « ⚠ grille introuvable (GRILLE_DEMO_…) », sélectionnée | « Inspiré de Inconnu par Inconnu » (les 11) | **Arrêtée** |
| **Cartouche** | **non : le bouton ne paraît pas** | non | « Utiliser » refuse : « Importe d'abord la grille associée » | « … par Inconnu » | **Arrêtée** |
| **Pratique** | oui | **non** | aucune référence morte (sonde, sans geste réel) | « … par Demo Labo Codex » | **Arrêtée** |

### Ce qu'une copie emporte

- **Grille** : ses critères. Ni ses cartouches (0 sur la copie), ni production, ni échelle : elle n'en référence aucune.
- **Échelle** : ses niveaux, aucune référence. Mais `forkerItem` retire `isDemo` sans retirer `estDemo`, que le pack pose sur ses échelles : `filtrerRessourcesNonDemo` l'écarte d'« exporter mes échelles » et de l'export de configuration complète (lu : `js/echelles.js:739`, `js/import-export.js:3959`).
- **Production** : `grilleId` vers la grille du pack, jamais réécrit. 10 productions sur 11 en portent une. Le formulaire la sélectionne dans une option « introuvable » (valeur mesurée, libellé lu dans `poserReferenceSelect`), et l'enregistrement la conserve (mesuré ; c'est la règle #453). L'évaluation ne présélectionne aucune grille, sans erreur. `coursId` est retiré à l'entrée en bibliothèque.
- **Cartouche** : `grilleId` vers la grille du pack. Le refus est net, mais aucune issue : même une copie gardée de cette grille ne s'y relie pas (lu : `ajouterCartoucheIndividuelle` cherche par `id` ou `idOriginal`).
- **Pratique** : autonome sur la copie mesurée (`demo-std-litt`). `demo-spe-litt` n'a pas été dupliquée.

### Pourquoi j'arrête l'échelle et la production, qui ne plantent pas

Ma décision, à contester. La parenthèse du § 0.3 parle d'une référence morte « qui casse un écran ou un calcul » : aucun écran ne casse et aucune erreur de page n'a été relevée. Je les arrête pour trois raisons mesurées : le § 0.1 demande « Inspiré de … par Labo Codex », et elles ne l'ont pas ; l'échelle se dit démo dans les vraies données ; la production affiche un avertissement dès l'ouverture. Surtout, le bouton **écrirait ce défaut dans les vraies données des gens**, et `inspireDe` ne s'efface jamais : c'est du stock qu'il faudrait ensuite réparer chez eux (« tarir n'est pas réparer »). Le geste de la fenêtre existe déjà et produit ces mêmes défauts aujourd'hui ; je n'y ai pas touché.

## Ce qui est livré (grille)

- **La ligne et le bouton**, dans le formulaire d'une copie, en démo seulement : `BibliothequeUI.proposerGarderCopieDemo` (`js/bibliotheque-ui.js`). Elle n'écrit rien : le bouton porte l'action de la rangée de la fenêtre, `garderGrilleDansBibliotheque`. Une fois gardée : « Aussi dans ta bibliothèque ». Elle réapparaît quand on rouvre la copie.
- **Le guidage** dit vrai (§ 2), avec une phrase différente de la proposition, voir ci-dessous.
- **Une écriture seulement, sous le geste** : aucune copie automatique, à la duplication ni à la sortie (mesuré : bibliothèque et vrai trimestre identiques après une sortie sans geste). Aucune suppression.

### Trois écarts que j'ai décidés dans `garderGrilleDansBibliotheque`

C'est la fonction existante, donc aussi celle de la fenêtre.

1. **La fenêtre ne s'ouvre plus par-dessus l'édition.** La fonction ouvrait toujours la bibliothèque (mesuré). Elle ne la redessine plus que si elle est déjà ouverte. Depuis la fenêtre, rien ne change.
2. **La copie se garde sous le nom affiché.** Sans cela, une copie renommée juste avant le clic partait sous son ancien nom (trouvé par le banc, corrigé). La fonction attend l'écriture du `change` déjà partie ; s'il n'y en a pas (l'iPad peut ne pas quitter le champ) et que le formulaire diffère, elle l'enregistre.
3. **Un nom déjà pris : une seule question.** Si le clic arrive au bouton, annuler garde la copie sous son nom enregistré. Si la fenêtre de doublon prend le clic (elle peut s'ouvrir entre l'appui et le relâchement), annuler ne garde rien et le bouton reste. Les deux issues sont sûres ; laquelle arrive dépend du moment.

Autres ajouts du lot : `desactiverModeDemo` retire la ligne, sinon elle restait dans un formulaire ouvert après la sortie ; bouton à 44 px (37 px par défaut).

## Les mots, à valider par Grégoire avant la release

| Où | Texte | Origine |
|---|---|---|
| La ligne | « Cette copie reste dans la démo. Garde-la dans ta bibliothèque pour la retrouver dans tes vrais trimestres. » | Cowork, tel quel |
| Le bouton | « Garder dans ma bibliothèque » | existant |
| Guidage, « Autonomie » | « … et renomme la copie. Elle reste dans la démo : une nouvelle version du pack l'efface. Une copie de grille fait exception si tu la gardes dans ta bibliothèque : tu la retrouves alors dans tes vrais trimestres. » | **Claude Code**, à la place de la proposition |

La proposition de Cowork (« sauf si tu la gardes… ») aurait été fausse pour les quatre familles arrêtées : la phrase les nomme toutes. Si Grégoire rouvre des familles, elle est à réécrire.

## Limites à connaître

- **L'exemplaire est un instantané.** Une fois gardée, ce qu'on change ensuite dans la copie ne le suit pas, et « Garder » a disparu (mesuré). Quelqu'un qui garde tout de suite puis modifie retrouvera la version d'avant dans ses vrais trimestres. Les mots ne le disent pas : à Grégoire de juger s'ils le doivent.
- **Pas éprouvé** : l'iPad et le toucher réel (le banc pose la valeur sans quitter le champ, il ne touche pas), la vérification complète du navigateur, un vrai codex.

## Trouvailles hors lot : à inscrire, rien de corrigé

Aucune n'a été vécue par Grégoire : je ne les ai pas mises au BACKLOG (règle du 24 août). Cowork les lui soumet avec la décision.

1. **Les cartouches du pack ne sont jamais en lecture seule en démo** : elles portent `estDemo`, pas `isDemo`, et `estItemDemo` ne lit que le second. Donc ni bandeau ni « Dupliquer pour créer ma cartouche », alors que le guidage l'annonce, et, d'après le code, leurs champs restent modifiables (bandeau absent : mesuré ; champs : lu). C'est un écart de plus entre le guidage et l'écran.
2. **Une copie de cartouche survit à une nouvelle version du pack** (mesuré) : `peuplerNamespace` ne réécrit pas `demo_cartouches_*`. « Une nouvelle version du pack l'efface » est faux pour elles.
3. **« Inspiré de Inconnu »** : `forgerInspireDe` lit `nom`, or une production se nomme par `titre`. Échelles et cartouches du pack n'ont aucun auteur. Le guidage dit pourtant que cette ligne est « la reconnaissance d'origine qu'exige la licence ».
4. **Le panneau de métadonnées affiche la veille** pour une date `inspireDe` (31 oct. stocké, « 30 octobre 2026 » affiché, sur ce Mac). Vu sur une production ; cause non instruite.
5. **« Dupliquer pour créer ma … »** a probablement la même cible de 37 px : même classe que mon bouton, qui mesurait 37 px avant correction. Non mesuré sur ce bouton.

## Ce qu'il reste à décider

**Une décision pour Grégoire, par l'entremise de Cowork : que faire des quatre familles arrêtées ?**

- **A.** En rester à la grille : le lot est complet, et le guidage le dit.
- **B.** Rouvrir l'échelle et la production : retirer `estDemo` à la copie, corriger « Inspiré de », décider du sort de la grille morte. Le bouton s'ajoute ensuite en une ligne par famille. Le stock déjà gardé par la fenêtre reste, à assumer ou à mesurer.
- **C.** B, plus un chemin « Garder » pour cartouches et pratiques, qui n'existe pas (consigne du lot 3, § 2.1). C'est un chantier neuf : il faudrait aussi dire ce qu'une cartouche devient sans sa grille.

Ma lecture : A ou B. C dépasse « rendre visible le chemin qui existe ».

## Vérifications

Faits, sur le code final :

- **Vitest entier** : 10 615 verts, 0 rouge, 0 sauté.
- **Spec du lot** (`tests/integration/copie-demo-bibliotheque-31-oct.spec.js`) : 60 essais verts sur 10 répétitions, sans reprise.
- **Specs WebKit touchées** (12, choisies par recherche des noms modifiés) : 116 verts, 6 sautés, 0 rouge, 0 repris.
- **17 changements volontaires du code** font tous rougir une garde, code restauré à l'identique (`git diff` comparé) : condition de démo, de copie, d'exemple ; action du bouton ; état calme ; retrait de la ligne au changement et à la sortie ; relecture du formulaire ; attente de l'écriture ; fenêtre non ouverte ; mise à jour de la ligne ; affichage au chargement ; écriture du geste ; cible de 44 px ; guidage ; mots ; autre famille.
- **Audit** : un seul `innerHTML`, à valeurs échappées ; aucun `console.log`, handler inline ni `eval`. Aucune zone protégée touchée. Deux écrivains de `bibliothequeGrilles`, inchangés (`js/grilles-bibliotheque.js:68` et `:109`) : le bouton neuf n'en ajoute pas.
- **Captures** dans WebKit, sur le pack de démo : `plans de travail/captures/copie-demo-*.png` (clair, sombre, gardée).

Ce que le banc a corrigé en route, pour la relecture :

- Une première version de la garde du doublon, à la vraie souris, rougissait 5 fois sur 10. J'ai d'abord cru à un geste suspendu, et c'était faux : la fenêtre prend le clic. La garde passe maintenant par les événements DOM, un test par issue. Conséquence : **aucune spec ne fait ce clic à la souris sur un nom en doublon**, et l'ordre réel des deux événements sur l'iPad n'est pas connu.
- Un autre essai a montré `bibliotheque-deux-colonnes-1158` rattrapé au second essai (`page.goto` au-delà de 90 s), sans lien visible avec ce lot ; il n'est pas revenu à la dernière passe.
- La garde mot pour mot du guidage du 29 oct. retire désormais la phrase ajoutée avant de comparer : ses textes validés ne la contiennent pas.

Pas fait : la vérification complète du navigateur (due avant un push), l'iPad, un vrai codex. Pas de porte terrain écrite : la consigne n'en demande pas, et le périmètre dépend de la décision ci-dessus.
