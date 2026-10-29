# Demande de relecture – Le guidage de la démo et la fenêtre « Données démo » (29 octobre 2026)

> Claude Code, jeudi 29 octobre 2026, matin (Toronto). Consigne : `plans de travail/CONSIGNE-LOT-2026-10-29-guidage-demo.md`.
> Base : `main` = `94e3b0b2` (le verdict des jetons). Code : `433cd2da`. BACKLOG : **#1152** (fiche mise à jour, ouverte).
> Rien n'est poussé ; ni release ni verdict Playwright complet. Une autre instance travaillait en même temps dans le même
> arbre (les noms de la démo, #1180, `68ce070a`) : chacun de mes commits nomme ses fichiers, aucun des siens n'y est entré.

## Vue d'ensemble

Les 17 bulles (`js/guidage-demo.js:18`) et la fenêtre « Données démo » (`js/accompagnement-contenu-popup.js:1250`) portent les textes validés par Grégoire, mot pour mot. Un script lit chaque « APRÈS » du fichier TEXTES et le pose ; la sentinelle les relit avec son propre parseur.

- Le **bloc 2** (G4, 7 oct.) et le `voirAussi` n'ont pas bougé.
- La bulle 1 passe sous la clé `suivi-groupe`. L'écran où la démo s'ouvre a désormais sa bulle, sans que `navigation.js` soit touché.
- La bulle 5 part.

## 1. La mesure demandée (§ 1.1) : la bulle de `suivi-groupe` s'affiche-t-elle ?

**Oui, sans toucher à `navigation.js`.**
- **Le chemin, lu au code** : l'activation de la démo appelle `naviguerVers('suivi', 'groupe')` (`js/demo-activation.js:375`), puis `afficherSousSection('suivi-groupe')`. Celle-ci appelle `afficherGuidageDemo(idSousSection)` (`js/navigation.js:674-675`). `#suivi-groupe` est une sous-section d'`index.html` (`:7377`).
- **À l'écran** (WebKit, `tests/integration/guidage-demo-29-oct.spec.js`) : la démo activée, `#suivi-groupe > #guidage-demo-encart` est visible et son titre est « Suivi du groupe ».
- **Break-test** : avec la clé rendue à `apercu-contenu`, l'essai échoue, faute de bulle.

## 2. Avant → après

| Élément | Avant | Après |
|---|---|---|
| Suivi › Suivi du groupe | **aucune bulle** (la sienne vivait sous `apercu-contenu`, l'identifiant d'aucune sous-section) | « Suivi du groupe », le texte du groupe 1 |
| `suivi-apercu-legacy` | une bulle qui ne s'affichait jamais | retirée |
| Les 16 autres bulles | les textes d'avant (« ACPE », « 26 nœuds et 45 liens », « filtrables par groupe »…) | les textes validés, groupes 1 à 5 |
| La fenêtre, titre | « Mode démonstration & duplication CC » | « Données démo » |
| La fenêtre, blocs 1, 3 à 7 | les textes d'avant | les textes validés (bloc 4 dans sa version ↻) |
| La fenêtre, bloc 2 | phrase G4 du 7 oct. | **inchangé** |

**Typographie (§ 1.3)** :
- insécable avant « ; », « : », « ? », « ! » et à l'intérieur des « », dans les bulles comme dans la fenêtre (la fenêtre n'en avait aucune) ;
- demi-cadratins après les trois noms du bloc 4 ;
- aucun « 40 % » dans ces textes, donc rien à faire pour #1137 ;
- aucun autre caractère changé : les apostrophes restent celles du fichier TEXTES.

**Supposé** : le bloc 2, inchangé par consigne, garde ses espaces ordinaires (« provisoire : »). Le rendre insécable aurait touché une phrase validée le 7 oct. et figée par la consigne.

## 3. Les tests

**Sentinelle** `tests/unit/sentinelle-guidage-demo-2026-10-29.test.js` (7 essais) :
- **A.** Chaque « APRÈS » est lu dans le fichier TEXTES, avec la typographie appliquée, et paraît sous sa clé. Il y a exactement 17 bulles, numérotées 1 à 4 et 6 à 18. Le bloc 2 et le `voirAussi` sont inchangés. Aucun espace ordinaire n'est resté devant la ponctuation.
- **B.** `apercu-contenu` et `suivi-apercu-legacy` n'existent plus, et chaque clé est l'identifiant d'une `div.sous-section` d'`index.html`.
- **C.** Les nombres cités se recomptent :

  | Source | Compte |
  |---|---|
  | Pack | 10 étudiant·es ; 11 productions (1 portfolio, 9 artefacts, 1 terminale) ; 101 évaluations ; 32 dates, du 2025-08-25 au 2025-12-10 |
  | Pack | 3 grilles, dont un critère algorithmique, « Français écrit » ; 2 échelles ; 9 cartouches |
  | Pack | le titre du cours ; « Grille-5 FR-HOLIS-20 H26 », auteur « Labo Codex » |
  | `CARTE_DEMO_ALIGNEMENT` | 17 nœuds et 12 liens ; le nom de la carte |

**Break-tests** (journal en fin de fichier, arbre restauré par sha256) : chaque mutation fait rougir ses cas.

| Mutation | Rouges |
|---|---|
| G1 : un mot changé dans une bulle | 1 |
| G2 : la bulle 1 rendue à `apercu-contenu` | 3 |
| G3 : la bulle 5 remise | 3 |
| G4 : un espace ordinaire avant « : » | 2 |
| G5 : le bloc 2 retouché | 1 |
| G6 : l'ancien titre de la fenêtre | 1 |
| G7 : le bloc 4 au tiret cadratin | 2 |

**Les autres vérifications** :
- **Anciens textes épinglés** : aucune sentinelle ne le faisait (recherche sur `tests/` des anciennes clés et des anciens titres) ; aucune n'a suivi.
- **Cliquet #858** : la première version de la sentinelle découpait le fichier TEXTES avec `indexOf`, et le cliquet l'a refusée. Elle découpe maintenant par titres (`split`).
- **Vitest complet** : 850 fichiers, 10 295 verts, **1 rouge étranger au lot**. C'est #825 : « `pack-demo-10.js` … ceux de la dernière release ». Le pack a été modifié par le commit `68ce070a` de l'autre instance (#1180) ; ce fichier ne peut pas changer sans release. Il passera au vert à la prochaine release, ou par décision de cette autre session.

## 4. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| Le glossaire : « Cartouche de rétroaction » (« automatiquement ») et « Niveau RàI » (« tableau de bord », « recommandée ») gardent des mots que les bulles abandonnent (consigne, § 1.4) | **Inscrit** dans la fiche #1152 |
| `tableau-bord-apercu.js:1090` cherche encore `#apercu-contenu`, et `securite-apercu-sandbox.js:194` en fabrique un dans son bac à sable | Hors du guidage, sans lien avec les bulles : aucun geste. Rencontré, à dire |

## 5. Ce qui n'a pas été mesuré

- Les 16 autres bulles à l'écran : seule celle du Suivi du groupe est rendue ; les autres sont jugées sur le code.
- La fenêtre « Données démo » rendue (bouton « i » de l'accueil) : jugée sur ses données, pas à l'écran.
- Safari sur iPad ; la suite Playwright complète.
