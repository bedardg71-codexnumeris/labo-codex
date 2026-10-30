# Demande de relecture – Le codex n'emporte plus les copies déjà aux archives (29 octobre 2026, #1184)

> Écrite par Claude Code le jeudi 29 octobre 2026 (soir), en exécution de `CONSIGNE-LOT-2026-10-29-codex-copies-aux-archives.md`, sur `main` parti de `c176cb84` (1.225.1 en ligne). La consigne visait `d2f43d38` ; ses repères de ligne ont été remesurés (la fusion #1182 a touché `js/codex.js` entre-temps). Rien n'est poussé : release, verdict et mise en ligne attendent le signal de Grégoire.

## 1. Les deux endroits du code

**L'ouverture installe la marque** (`chargerCodex`, `js/codex.js`). Le filtre des clés écrites devient la fonction nommée `_entreeEcriteALOuverture` : les clés `_…` restent à l'appareil, sauf `_copiesAuxArchives` (nommée par `ReserveCopies.CLE`, son propriétaire), écrite seulement si c'est un objet. `_manifesteReserve` n'est pas écrit : il décrit le dossier d'archives de cet appareil.

**L'écriture n'emporte plus une copie marquée** (`genererCodex`). La marque se lit dans les données qu'on écrit (`_idsAuxArchives(donnees)` → `ReserveCopies.idsDansDonnees`, la même lecture qu'à l'ouverture, qui l'emploie aussi désormais). Pour chaque id marqué :
- son fichier n'est ni lu ni mis dans le ZIP, même présent sur l'appareil ;
- sa vignette `thumbnail_<id>` sort de `donnees.json` et de `manifeste.contenu.cles` (`_estVignetteAuxArchives`) ;
- elle n'est pas comptée du tout, ni attendue ni manquante : elle n'entre pas dans la boucle, `_creerCompteDesCopies` ne la voit pas.

Le manifeste compte donc ce que le ZIP contient : `nombreFichiersTravaux` et `tailleTotaleOctets` (taille de `donnees.json` plus celle des fichiers emportés), d'où la taille annoncée dans l'aperçu.

`_creerCompteDesCopies` n'est pas modifiée. Elle sert encore à « Exporter une sélection », que ce lot ne touche pas (voir le § 5).

## 2. Remplacer ou ne pas toucher (mesure (a))

**Ce que fait l'ouverture des autres clés absentes du codex** (lu au code) : elle ne les retire pas. Les clés de trimestre (`^[a-z]\d{4}_`) absentes du codex entrent au plan de purge (#336). Ce plan est seulement affiché ; rien n'est supprimé sans un geste humain. Les clés globales, les vignettes et les clés `_…` ne sont pas touchées.

**Le choix est cohérent avec ce comportement.** Si le codex porte la marque, elle est écrite comme toute autre clé portée, et la valeur du codex remplace celle d'ici. S'il ne la porte pas, elle n'est pas touchée, comme toute clé absente.

## 3. Ce que `lever` laisse (mesure (b)) : changé

**Avant ce lot**, `_ecrireMarque` (`js/reserve-copies.js`) **retirait la clé** quand plus rien n'était marqué. C'était le cas après « Faire revenir » de toutes les copies, ou après E3. Le codex suivant ne portait alors aucune marque : on ne pouvait pas le distinguer d'un codex d'avant #1028. Ouvert sur l'iPad, il aurait laissé la marque de l'iPad en place.

**Maintenant**, une marque levée en entier s'écrit `{}` et la clé reste. Le `{}` voyage dans le codex et lève la marque de l'appareil qui l'ouvre. Les lecteurs (`_lireMarque`, `idsMarques`, `idsDansDonnees`, le bouton « Faire revenir » des Réglages) lisent déjà `{}` comme « rien de marqué ». Aucun lecteur ne prend la présence de la clé pour un signal (vérifié par `grep` dans `js/`).

**Stock assumé.** Sur un appareil où la marque a été levée en entier *avant* ce lot, la clé est absente : son codex ne lèvera pas la marque d'un autre appareil. Ce n'est pas le cas de Grégoire, dont le Mac porte encore la marque d'H2026 (mesure de Cowork).

Quatre affirmations de test supposaient la clé retirée : trois dans `sentinelle-1028-archiver-copies` et trois `toBeUndefined` dans `1028-archiver-copies.spec.js`. Elles disent maintenant `{}`.

## 4. Le stock assumé (« tarir n'est pas réparer »)

L'iPad garde dans Safari les 394 fichiers d'H2026 (1,1 Go) et leurs vignettes. Ce lot n'en retire rien. Après la mise en ligne, quand l'iPad aura ouvert un codex du Mac (la marque s'installe alors), ces fichiers ne voyageront plus. Le retrait est un geste sur les données de Grégoire : Cowork le soumettra à part.

## 5. À trancher par la relecture

1. **`lever` et les fichiers présents.** `lever` (appelé par E1, l'archive d'un groupe et « Faire revenir ») lève la marque de toute copie dont le fichier est **présent**. Sur l'iPad, après ouverture, les 394 copies d'H2026 sont marquées et leurs fichiers présents. Une archive E1 d'H2026 faite **sur l'iPad** lèverait donc leur marque, et le codex suivant les emporterait de nouveau. C'est la sémantique de #1028 (« fichier présent, pas aux archives »), et le symptôme n'a pas été vécu. Je ne l'ai ni corrigé ni inscrit, selon la règle d'entrée au backlog. La relecture dit si ça mérite une fiche.
2. **« Exporter une sélection »** n'a pas été touchée, comme le voulait la consigne. Elle emporte encore le fichier d'une copie marquée s'il est présent. C'est un choix explicite de l'usager, et la sélection n'a jamais emporté la marque. Classement : issue 3, sans conséquence observée.
3. **La fusion** n'a pas été touchée (consigne, § 3.4). Elle garde la marque comme réglage de l'appareil (#1182).

## 6. Les preuves

| Banc | Code du lot | Défense retirée (break-test) |
|---|---|---|
| `codex-1184-copies-aux-archives.spec.js` (WebKit, neuf, 4 cas, sans `waitForTimeout`) | 4 verts | — |
| sans l'exception d'ouverture (`if (false)` dans `_entreeEcriteALOuverture`) | — | 2 rouges : « la marque du codex remplace la locale », « marque levée `{}` » |
| sans le saut à l'écriture (`if (f && auxArchives[f.id]) return;` retiré) | — | 1 rouge : « le fichier de la copie marquée ne part pas » |
| sans le saut de la vignette | — | 1 rouge : « sa vignette non plus » |
| `sentinelle-1028` avant la mise à jour de ses trois affirmations | — | 3 rouges : « marque non levée » (preuve que `{}` change bien ce que `lever` laisse) |
| Vitest complet, depuis `tests/` | 851 fichiers, 10 317 tests verts | — |
| WebKit voisins : 1028, 1014, 1012 (×2), 1011, 1182, 991, clôture, « Faire revenir », 1184 | 40 verts (10 fichiers, code final) | — |

Pour chaque break-test, l'arbre a été restauré par sha256 (empreinte identique, vérifiée).

Le banc d'écriture commence par un témoin : sans marque, les deux copies et leurs deux vignettes partent. Cela prouve que le banc voit partir la copie qu'il juge ensuite. Il vérifie aussi que le fichier et la vignette **restent sur l'appareil**, puisque le lot ne retire rien.

Deux ajustements des sentinelles existantes, sans relever aucun cliquet :
- **La complexité.** La logique neuve sort en trois fonctions nommées. `genererCodex` reste sous son plafond, et `chargerCodex` passe de 77 à 75 (plafond abaissé dans `complexite-fonctions-30.json`). C'est de la complexité déplacée vers les fonctions nommées, pas réduite.
- **La sentinelle #635.** Son témoin mutait le texte exact de l'ancien filtre. Il mute maintenant le même test dans `_entreeEcriteALOuverture`.

## 7. Ce que la session n'a pas pu voir

- Les codex de Grégoire. Les comptes (177 / 571 copies) sont ceux de Cowork et n'ont pas été remesurés ici.
- Safari sur l'iPad réel et Chrome sur le Mac : seul WebKit a été lancé.

**Geste à vérifier à l'écran après la mise en ligne** (consigne, § 5) : sur l'iPad, ouvrir un codex écrit par le Mac, puis menu Codex › « Mettre à jour le codex ». La fenêtre d'aperçu doit annoncer environ 355 Mo, et non 1,5 Go.

Rien de pédagogique, et aucun mot affiché n'est touché. Mise en ligne proposée en patch (1.225.2), au signal de Grégoire.
