# Demande de relecture – lot A3 : faire revenir des copies (#1000)

> Écrite le 4 octobre 2026 à 12 h 45 (Toronto, mesurée par `date`) par Claude Code. Porte sur la branche `claude/1000-faire-revenir` (commit cité dans le rapport de session). Consigne : `CONSIGNE-DU-JOUR.md` de 12 h 19. **Ce lot écrit des copies dans les données de l'utilisateur** : relecture croisée (règle 2 de `PROTOCOLE.md`). Rien n'est poussé, aucune release.

## 1 · Ce qui change

- **Neuf** : `js/reserve-revenir.js` (le geste, ses mots provisoires, le bilan).
- **Touchés** : `js/reserve-reglages.js` (le bouton « Faire revenir » sur la ligne d'une archive vérifiée, à côté de « Vérifier ») ; `js/reserve-verifier.js` (expose cinq de ses pièces : empreinte, empreinte d'un texte, id d'une copie, fichier du système, sélecteur de fichier ; rien d'autre ne change) ; `index.html` (le script, les anti-cache).
- **Bancs** : `tests/unit/sentinelle-lot-A3-faire-revenir.test.js` (13 essais, dont 6 témoins) ; `tests/integration/lot-a3-faire-revenir.spec.js` (2 essais WebKit, dont un à 768 px).

## 2 · Ce que mesure la mesure d'avant le code (point 2 de la consigne)

| Mesuré | Ce que j'ai lu | Dément une décision ? |
|---|---|---|
| « Ouvrir une archive… » | `reserve-ouvrir.js` lit l'archive par JSZip en entier et ne réimporte que grilles, échelles et tampons ; les copies sont comptées (« Fichiers travaux »), jamais rendues. | Non. |
| Rapprochement copie ↔ fiche | Le nom sous `travaux/` est `<id de la fiche>.<ext>` (`_collecterBlobs`, reserve.js) ; `ReserveVerifier` le défait par `_idDeLaCopie`. Le magasin des copies est indexé par ce même id (`travauxStockage.stockerBlob/recupererBlob`), sans trimestre. | Non. |
| L'état « vérifiée » | `_manifesteReserve` (clé locale, non namespacée), champ `verification` de l'entrée, lu par `ReserveVerifier.etatVerification` ; il n'est écrit que par « Vérifier » dans ce navigateur. | Non. |
| Les élèves supprimés | `dasElevesSupprimes()` lit le trimestre **affiché** (`cle()`). Une archive de l'hiver 2026 se fait revenir pendant l'automne : le geste lit donc la trace et la liste **du trimestre de l'archive**, par la même règle (`dasElevesEcartes`). | Non : un ajustement de lecture, pas de décision. |
| La liste des fiches | Même raison : `<trimestre de l'archive>_fichiersTravaux`, pas `cle('fichiersTravaux')`. | Non. |

## 3 · Ce que fait le geste, cas par cas, avec le témoin du banc

Le geste : clic sur « Faire revenir » → le sélecteur (mode fichier) ou le dossier lié (mode dossier) → la fenêtre → le retour, une copie à la fois → le bilan. Il n'est offert, **et accepté par l'action elle-même**, que pour une archive dont `etatVerification` dit « vérifiée ». Avant toute copie, il refuse le fichier d'une autre archive (uuid) et **une archive dont le `meta.json` a changé depuis la vérification** (empreinte retenue au lot A2).

| Cas (consigne, point 2) | Ce que fait le geste | Témoin du banc (Vitest et WebKit) |
|---|---|---|
| Fiche là, fichier absent du navigateur | La copie de l'archive est lue, son empreinte **recalculée** ; égale → écrite par le magasin ordinaire, puis relue au magasin pour être comptée « revenue ». | FT_r1 : écrite, octets identiques (SHA-256 égal). |
| Fiche « manquant » | Même chose ; la fiche redevient « present ». | FT_r2 : écrite, octets identiques, fiche « present ». |
| Fiche « manquant », fichier déjà là et identique (#997) | Rien n'est écrit ; la fiche redevient « present ». Compté « déjà là ». | FT_r3 : aucune écriture, fiche « present ». |
| Fichier déjà là, même empreinte | Rien. | FT_ok8. |
| Fichier d'empreinte différente | **Rien**, compté « changée ». Jamais remplacé, même si la fiche dit « manquant ». | FT_c4 : octets du navigateur inchangés. |
| Aucune fiche | Rien, compté. | FT_s6. |
| Élève supprimé | Rien, compté (sans lire la copie). | FT_d5 : rien écrit. |
| Copie abîmée dans l'archive | Rien, compté ; le bilan le dit **en tête**. | FT_a7 (un octet altéré dans le ZIP après la vérification). |

**Rien d'autre n'a bougé** : toutes les clés de l'espace, avant et après, comparées en texte (WebKit : `db.keys()` entier ; Vitest : la carte entière) ; dans la liste des copies, seules r2 et r3 changent, et seulement leur `blobStatut`. Le magasin : seules r1 et r2 sont écrites.

**Le codex (#1012, point 5)** : `genererCodex` compte au fichier lu, pas au statut. Mesuré au banc WebKit : avant le retour, 4 manquantes sur 7 attendues ; après, **2 sur 7** (l'élève supprimé et la copie abîmée, qui manquent réellement). À 768 px : 1 sur 8 avant, **0 sur 8** après ; la fenêtre « Ce codex n'aura pas toutes tes copies » ne s'ouvre donc pas à tort.

**Mutations démontrées rouges** (sur le fichier réel, restauré par copie, empreinte vérifiée ; et en témoins permanents dans le banc Vitest) :

| Mutation | Rouge, lu au « Error » |
|---|---|
| M1 · la recomparaison de l'empreinte de l'archive retirée | Vitest (a)(b) : `['FT_a7','FT_r1','FT_r2']` au lieu de `['FT_r1','FT_r2']` ; WebKit : le titre du bilan. |
| M2 · le cas « empreinte différente » qui remplace | Vitest (b) : `FT_c4` écrite ; WebKit : l'état du magasin. |
| M3 · la recomparaison de la copie du navigateur retirée | Témoin Vitest : c4 se dit « déjà là ». |
| M4 · la garde des élèves supprimés retirée | Témoin Vitest : FT_d5 écrite. |
| M5 · la garde « changée depuis la vérification » retirée | Témoin Vitest : le geste écrit. |
| M6 · la garde « vérifiée » du bouton retirée | Témoin Vitest : le sélecteur s'ouvre. |

**iPad (768 px)**, par de vrais clics (Réglages › Données, l'accordéon, le bouton) : la fenêtre et le bilan tiennent dans la largeur, la page ne déborde pas, la copie revient.

**Vitest complet** : 676 fichiers, 8 057 essais, verts. Playwright : les deux essais du lot seulement (pas de verdict complet, consigne).

## 4 · La mémoire, mesurée (point 5)

WebKit 26.4 de Playwright, sans interface, profil persistant (le vrai magasin IndexedDB, pas la mémoire), le vrai `index.html`, pack démo, un navigateur neuf pour le geste. Archive fabriquée en Node par le vrai assembleur (`FichierSortant.assemblerZip`) : **205 copies d'octets aléatoires, 607 696 488 octets** (le total du groupe 00008, tailles approchées, la plus grosse 22,5 Mo), 205 fiches « manquant » sans fichier. Mémoire par `footprint`.

| | Avant le geste | Après | Pendant (échantillon 250 ms) |
|---|---|---|---|
| Page (WebContent), pic | 205 Mo | **244 Mo** | courant au plus 222 Mo |
| Processus réseau, pic | 27 Mo | 72 Mo | courant au plus 50 Mo |

Durée : **2,0 s**. Bilan : « 205 copies revenues ». Contrôle : 205 fichiers lus au magasin, 205 fiches « present », empreintes égales pour les 3 premières et la plus grosse. Disque libre : − 600 Mo (les copies écrites). **Inféré** : le pic de + 39 Mo est la plus grosse copie (ses octets puis son Blob) et le tampon du magasin ; je ne les ai pas séparés. **Non mesuré** : l'iPad réel ; le cas « tout est déjà là », qui lit les 205 fichiers du navigateur pour leur empreinte, une à la fois aussi.

## 5 · Ce que j'ai tranché seul

1. **Le fichier est choisi avant la fenêtre**, pas après : Chrome exige un geste actif pour le sélecteur (#995) ; la fenêtre vient donc entre le choix et le retour.
2. **Une archive changée depuis sa vérification est refusée en entier** (empreinte de `meta.json`), en plus de la recomparaison copie par copie. La consigne ne le demandait pas ; c'est la remarque 1 du verdict du lot A2, appliquée dès A3, parce que les empreintes de référence vivent dans ce `meta.json`.
3. **« Déjà là » ne relit pas la copie de l'archive** : l'empreinte du fichier du navigateur est comparée à celle que déclare l'archive. Conséquence : « abîmée » ne compte que les copies qui auraient été écrites ; une copie abîmée dont le navigateur a déjà le bon fichier passe inaperçue ici (« Vérifier » la verrait).
4. **Fiche « exporte » sans fichier** : la copie revient, le statut « exporte » reste. Cas non nommé par la consigne.
5. Le geste prévient le codex (`signalerEcritureUsager`) quand il écrit.

## 6 · Ce qui reste

- **#997 dans les données de Grégoire** (inféré, non mesuré) : le geste remet « present » une fiche « manquant » **seulement si l'archive contient sa copie**. L'archive est faite depuis le navigateur ; si le fichier de cette copie n'y était pas à l'archivage, il n'est pas dans l'archive, et rien ne la répare. À mesurer en lecture seule avant d'annoncer #997 réparée.
- Les mots (§ 7) sont à Grégoire. À zéro, le bilan dit « 0 copie revenue » (singulier jusqu'à 1).
- Le mode dossier : jugé par Vitest (faux FSAPI), pas dans le vrai Chrome.
- Porte terrain : aucune ici (plan § 4, lot A3 : « pas de porte sur tes données à ce stade »).

## 7 · Les mots exacts, tels qu'ils s'affichent (provisoires)

Sur la ligne d'une archive vérifiée, le bouton : **« Faire revenir »** (infobulle : « Remettre dans l'application les copies de cette archive »).

La fenêtre (titre, texte, boutons) :

> **Faire revenir les copies**
> Les copies de cette archive (205) reviennent sous leurs fiches, quand le fichier n'est plus dans l'application.
>
> Rien n'est remplacé ni effacé : une copie déjà là, ou qui a changé depuis l'archive, reste telle quelle.
>
> [Annuler] [Faire revenir]

Le bilan, tel que le banc l'affiche (une ligne n'apparaît que si son nombre n'est pas nul, sauf « revenues ») :

> **Copies revenues, archive abîmée** (sinon : **Copies revenues**)
> 1 copie de l'archive est abîmée : elle n'est pas revenue. Vérifie de nouveau cette archive.
>
> 2 copies revenues
> 2 copies déjà là
> 1 copie changée depuis l'archive, laissée telle quelle
> 1 copie sans fiche dans l'application
> 1 copie d'un élève supprimé
> 1 copie n'a pas pu être écrite (espace du navigateur ?)

Les refus (titre « Impossible de faire revenir les copies ») :
- « Cette archive n'est pas vérifiée dans ce navigateur. Vérifie-la d'abord. »
- « Cette archive a changé depuis sa vérification. Vérifie-la de nouveau. »
- « Cette archive date d'avant les empreintes : ses copies ne peuvent pas revenir. Archive de nouveau ce groupe. »
- Le fichier d'une autre archive : les mots du lot A2, « Ce n'est pas cette archive » (acceptés par Grégoire).
