# Demande de relecture – lot 5 : la mémoire sur l'iPad (sans l'iPad)

> Claude Code, 11 octobre 2026, ≈ 7 h 55 (mesuré par `date`). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (Cowork, 6 h 58).
> Commits locaux sur `main`, **non poussés, pas de release** (elle attend le lot 6) : `3a49eb92` (#991), `53be4f3c` (#1025), `0805ba37` (#995), puis un commit de documentation (mesure, BACKLOG, cette demande). **#996 hors du lot, laissée telle quelle.**
> Mesures : `plans de travail/MESURE-2026-10-11-lot5-memoire.md`.

## 1 · Ce qui change pour l'usager

- « Exporter une sélection » ne prend plus en mémoire plusieurs fois la taille des copies : sur 1,25 Go de copies, la page passait à 6,4 Go ; elle reste au niveau du repos. Le geste dure 6 s au lieu de 43 (#991).
- « Ouvrir une archive… », sur Safari et l'iPad, ne charge plus l'archive entière : 1,3 Go de pic pour une archive de 1,15 Go, désormais rien de plus que le repos (#1025).
- Sous Chrome, une mise à jour du codex dont la préparation dépasse 5 s, sans fichier déjà tenu, ne finit plus sur « Codex non mis à jour » : « Ton codex est prêt » demande un toucher, et la fenêtre de choix s'ouvre dans ce clic (#995).

**Aucun mot d'écran neuf.** Un point à juger par Cowork : la fenêtre « Ton codex est prêt » (mots acceptés par Grégoire le 30 sept. pour l'iPad) apparaît désormais aussi sous Chrome sur ordinateur. Son message dit « Touche « Enregistrer » pour choisir où le ranger » : « Touche » se lit aussi comme un impératif de « toucher » à la souris. Je n'ai rien changé.

## 2 · La mesure d'abord

| Geste | Avant | Après |
|---|---|---|
| #991, sélection, 1,25 Go de copies | page 6 385 à 6 440 Mo, réseau 2,5 Go, 43 s | page 168 à 171 Mo (= repos), réseau 26 à 29 Mo, 6 s |
| #1025, ouvrir une archive de 1,15 Go | page 1 306 à 1 307 Mo | page 172 à 175 Mo (= repos) |
| #995, Chrome 154, préparation de 6,5 s | `SecurityError`, « Codex non mis à jour » | « Ton codex est prêt », puis fenêtre toucher actif |

**#995, la durée du toucher sous Chrome 154** : actif à 4,8 s, éteint à 5,0 s. La mesure confirmait le refus : le correctif est donc entré dans le lot, comme le prévoyait la consigne.

**#1025, l'écran de réimport** : il n'est pas ouvert par erreur, c'est la fonction du geste depuis #254. Rien n'est changé.

## 3 · Ce qui est fait, commit par commit

**`3a49eb92` – #991.** `actionExporterSelection` garde la référence des copies et les confie à `FichierSortant.assemblerZip`, avec les deux règles de `genererCodex` : un tampon d'octets est enveloppé en Blob, et un même nom déposé deux fois garde le dernier. Rien d'autre ne change dans le geste (pas d'aperçu, pas de Défense K ajoutée : il n'en avait pas).

**`53be4f3c` – #1025.** `chargerDepuisFichier` lit le répertoire central (`ReserveVerifier.lireRepertoireZip`), passe ce répertoire à `validerZipSecurite` sous la forme qu'elle lit (règle 3), puis lit `donnees.json`, `meta.json` et les deux manifestes un à un (`ReserveVerifier.lireTexteDeLEntree`, nouvelle exposition d'une fonction que `sourceFichier` emploie aussi). `_hydrateManifesteDepuisZip` reçoit des lecteurs au lieu d'entrées JSZip. Mots d'erreur : un fichier qui n'est pas un ZIP garde « Le fichier choisi n'est pas un ZIP valide. ».

**`0805ba37` – #995.** Dans `sauvegarderVersDestination`, stratégie « fenêtre de choix » : si l'appelant fournit `toucherFrais` et que le toucher a expiré, il est demandé avant `showSaveFilePicker` ; refusé, le résultat est `annule` avec `toucherRefuse` (l'appelant le dit déjà : « fenêtre « Ton codex est prêt » refusée par l'usager »). Seule « Mettre à jour le codex » fournit `toucherFrais`. Un fichier déjà tenu se réécrit sans fenêtre : non concerné (vérifié au banc).

## 4 · Les bancs, et ce qu'ils peuvent faire rougir

| Banc | Essais | Break-test |
|---|---|---|
| `codex-991-selection-aller-retour` | 1 | copies confiées de nouveau à JSZip → rouge (« rangées sans compression ») ; doublon non fusionné → rouge (« une entrée par copie ») ; une copie retirée → rouge ; une copie altérée, même nom → rouge sur l'aller-retour lui-même (« octet pour octet ») |
| `reserve-1025-ouvrir-archive-par-tranches` | 5 | code d'avant → les essais 1 à 3 rougissent sur `loadAsync` ; patch ignoré, manifeste racine ignoré, `validerZipSecurite` retirée, message « pas un ZIP » perdu, message de nom suspect perdu → chacun rougit sur son essai |
| `codex-995-fenetre-de-choix-toucher-frais` | 3 | code d'avant → rouge, « Codex non mis à jour » au lieu de « Ton codex est prêt » (le symptôme mesuré sous Chrome) ; refus du toucher ignoré → rouge ; `toucherRefuse` perdu → rouge |

Le banc #995 tourne sous WebKit (seul moteur de la suite), avec une fenêtre de choix **simulée** qui refuse, sans toucher, par le message de Chrome mot pour mot ; la mesure réelle sous Chrome est au § 4 du document de mesure.

Bancs voisins relancés, verts : réouverture (#637, #654), « Vérifier » (A2), emprunt (E2), et tous les bancs `codex-*`, `lot-j0*`, `lot-f*`, `lot-g*` (52 sur 52, WebKit). Vitest complet, depuis `tests/` : 707 fichiers, 8 492 essais verts, aucune erreur hors essais. Pas de suite Playwright complète : le verdict viendra une fois, sur le commit de release des lots 5 et 6.

## 5 · Ce que je signale sans l'avoir tranché

1. **#1025, deux écarts sur des fichiers forgés, pas sur des archives réelles.** (a) Un nom suspect est refusé par le même message de `validerZipSecurite`, mais le nom cité diffère : avant, JSZip réécrivait `../` en `/` (« (chemin absolu) : / ») ; maintenant « (path traversal) : ../ ». (b) Une archive dont le répertoire se dit plus lourde que 2 Go alors que ses en-têtes locaux disent autre chose passait avant (mesuré sur le code d'avant) ; elle est refusée maintenant. Pour une vraie archive, les deux tailles concordent : même refus qu'avant au-delà de 2 Go. Une archive en ZIP64 (que l'application n'écrit pas) passait par JSZip et serait maintenant « pas un ZIP valide ».
2. **#991, la partie partage de la fiche reste ouverte.** La sélection n'a toujours ni `sansRepli` ni `toucherFrais` ; à 1,25 Go elle se prépare en 6 s, au-delà du toucher. Sous Chrome, la fenêtre de choix serait refusée et le fichier glisserait vers le partage puis le téléchargement, sans le dire. Hors de la consigne (« le faire passer par `assemblerZip` ») : **inscrit à la fiche, issue 2**. Le remède de #995 s'y appliquerait, avec les mêmes mots.
3. **Le fichier d'une sélection grossira** d'environ 3 % sur de vrais PDF (copies rangées au lieu de compressées), comme le codex au lot J0. Inférence, non mesurée sur des PDF réels.

## 6 · Trouvailles

| Trouvaille | Issue |
|---|---|
| La partie partage de #991 (ci-dessus, point 2) | **Inscrire et continuer** : notée à la fiche #991 |
| Écarts sur fichiers forgés de #1025 (point 1) | **Commenter et oublier** : écrit dans le banc ; aucun usager ne produit ces fichiers |

**Stock** : aucun. Aucun des trois gestes n'écrit de donnée nouvelle chez l'usager ; seule la façon de lire et de fabriquer un fichier change.
