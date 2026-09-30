# Portes terrain – chantier des archives, lot A1 : archiver ton plus gros groupe, et retrouver le fichier

> Écrites le 30 septembre 2026, vers 13 h 35 (Toronto), par Claude Code (ce markdown : la trace). **Cowork publie l'artefact jumeau** (cases, champs de saisie, bouton « Copier mes résultats »).
> Sur le **Mac**, dans **Safari**, données réelles, `https://app.codexnumeris.org`.
> ✅ **Le lot est en ligne : 1.171.1** (30 sept., 16 h 05, mesuré chez Netlify : déploiement de production prêt sur `cdfef4ea`, publié à 20:04:53 Z ; relecture croisée de Cowork verte ; verdict au navigateur vert, aucune spec au second essai). **La porte peut se faire.** *(Écrit à 13 h 35 : le lot était sur la branche `lot-a1-archive-sans-copier`, ni relu ni poussé, et la version en ligne était 1.171.0.)*
> **Pourquoi si peu de rangées** : le fichier (contenu, empreintes, mémoire, disque) est jugé par les bancs. Seul ton Safari, avec tes vraies copies, peut dire que le fichier arrive dans tes Téléchargements. C'est sur cette archive que reposera, plus tard, le retrait des copies : un raté compte.
> **Tes données** : rien n'est écrit ni effacé dans tes trimestres. Seule la liste de tes archives reçoit une ligne, après ton « Il y est ».
> Ce qui échoue devient un item du BACKLOG, pas une note.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | Dans Safari, sur le Mac, ouvre l'application, recharge, lis le numéro en bas de page. | **1.171.1**. Si tu lis 1.171.0 : arrête-toi, le lot n'est pas en ligne. |
| 0.2 | Vérifie que tes données de l'hiver 2026 sont dans ce Safari (le trimestre « Hiver 2026 » s'ouvre, avec ses copies). | Elles y sont. Sinon : arrête-toi et dis-le, on ne fait pas la porte sur un autre appareil. |

## §1 · Archiver le plus gros groupe de l'hiver 2026 `Données réelles`

| | Geste | Attendu |
|---|---|---|
| 1.1 | Bouton « Codex » › « Archiver… ». Choisis le trimestre de l'hiver 2026 et le groupe **00008** (celui de 205 copies), puis « Archiver ce groupe ». | L'aperçu de ce que le fichier contiendra s'ouvre, avec tes copies dans la liste. |
| 1.2 | Dans l'aperçu, « Télécharger ». | La barre « Compression du ZIP… » avance, puis « Archive prête ! », puis la fenêtre « **Téléchargement lancé** » s'ouvre. **Avant le lot** : la barre durait une vingtaine de secondes et « Groupe archivé » s'affichait d'office. (champ : combien de temps entre « Télécharger » et la fenêtre, à peu près ; aucun chiffre n'est un échec) |
| 1.3 | **Sans répondre à la fenêtre**, ouvre ton dossier Téléchargements dans le Finder. | Un fichier dont le nom commence par `archive-h2026-` et finit par la date du jour, `.zip`. (champ : **sa taille, telle que le Finder la donne**) |
| 1.4 | Reviens à l'application et clique « Il y est ». | La notification « Groupe archivé : fichier téléchargé ». |
| 1.5 | Réglages › carte « Archives ». | Le groupe 00008 de l'hiver 2026 figure dans la liste, à la date du jour. |
| Si le fichier n'est pas là en 1.3 | Clique « Il n'y est pas », puis « Réessayer », et regarde de nouveau tes Téléchargements. | Le fichier arrive ; la fenêtre « Téléchargement lancé » revient. (champ : ce qui s'est passé, et si Safari a demandé une autorisation de téléchargement) |

⚠ **La taille, pour que tu ne coches pas un faux échec** : la fenêtre dira « environ 579 Mo » et le Finder environ **607 Mo** pour le même fichier. Ce n'est pas un défaut du lot : l'application compte en unités de 1 024, le Finder en unités de 1 000 (#993). Le chiffre du Finder est celui qui compte ; il vient de la mesure de tes copies du 30 sept. (607,3 Mo de copies pour ce groupe), et ton fichier peut peser un peu plus.

## §2 · Interface

Aucune rangée : l'apparence se signale à l'usage.

## §3 · Décisions

Ce ne sont pas des vérifications : les mots de la fenêtre « Groupe non archivé » sont posés dans la demande de relecture (§ 5.1), à trancher avant la release, pas ici.

## §4 · Ce qui n'a pas pu être vérifié

- **Ton Safari** : le banc est un WebKit sans interface. Que Safari accepte de lancer le téléchargement quelques secondes après ton dernier clic est une inférence (il le faisait avant le lot, après une vingtaine de secondes) ; « Réessayer » part d'un clic frais.
- **Tes vraies copies** : le banc emploie 205 fichiers d'octets aléatoires, aux tailles des tiennes.
- **La durée sur ton Mac** : au banc, environ 5 s du geste au téléchargement ; ce n'est pas une promesse pour ton appareil.
- **L'iPad** : hors de cette porte. Rien de ce lot n'y a été mesuré.
- **Le mode de Chrome et d'Edge** (écriture directe dans un dossier) : jugé sur un faux dossier, en test ; il ne gagne que l'empreinte par copie.
- **Une erreur de la session, rattrapée** : un contrôle « aucune réussite annoncée » de la spec du navigateur finissait toujours par passer (la notification ne reste que 3 s). Une mutation l'a montré ; il est corrigé.

---

## Ajout de Cowork, 30 septembre 2026, 16 h 12 : la porte est refaite pour Chrome

**Ce qui s'est passé.** À 15 h 08, Grégoire a fait la porte avant la mise en ligne, et dans **Chrome**, pas dans Safari : c'est le navigateur qu'il utilise sur le Mac (Cowork avait supposé Safari sans le demander). Le relevé disait 7 passées sur 7 ; la capture d'écran et l'archive disent autre chose.

**Mesuré par Cowork sur l'archive écrite à 15 h 04** (`Réserve_LaboCodex Backup/trimestres/h2026-601-101-gr00008`, iCloud, lecture seule, aucun nom lu) :

- `meta.json` : `application_version` **1.170.2**, `appareil` « Mac — Chrome », `mode_archive` **fsapi**. Le Chrome de Grégoire servait donc une version en retard de deux livraisons (1.171.0 était en ligne depuis 11 h 45).
- Aucun champ `travaux_sha256` : normal pour 1.170.2.
- `travaux/` : 205 fichiers, 607 334 696 octets, exactement `taille_travaux_totale`. L'empreinte de `donnees.json` concorde.
- L'écran « Archives » dit « Aucun dossier d'archives n'est actuellement lié » alors que l'archive vient d'être écrite dans un dossier choisi : **le dossier n'est pas retenu** (trouvaille, à inscrire).

**Ce que ça établit.** Le mode dossier de Chrome fonctionne sur les données réelles de Grégoire (non mesuré jusqu'ici). Cette porte ne prouvait rien du lot A1.

**La porte refaite** (artefact « Porte · Archiver un groupe », republié à la même adresse) :

| | Geste | Attendu |
|---|---|---|
| 0.1 | Dans Chrome, ouvrir l'application, recharger de force (⌘ + Maj + R), lire le numéro. | 1.171.1 (champ : le numéro lu) |
| 0.2 | Les données de l'hiver 2026 sont dans ce Chrome. | Oui |
| 1.1 | « Codex » › « Archiver… », hiver 2026, groupe 00008, « Archiver ce groupe » ; même dossier si Chrome le demande. | La barre va au bout, « Groupe archivé » (champ : ce que Chrome a demandé, durée) |
| 1.2 | Réglages › Données › Archives. | La ligne du groupe porte l'heure du jour (champ : ce que dit « Dossier sur disque ») |
| Machine | Cowork relit l'archive et recalcule les 205 empreintes. | 205 sur 205 |

**Ce que cette porte ne prouve pas** : le chemin de Safari (un fichier à télécharger, la confirmation « Il y est »), prouvé au banc seulement ; l'iPad.

**Trouvailles à inscrire par Claude Code au prochain passage** : (1) le dossier d'archives choisi dans Chrome n'est pas retenu ; (2) Chrome a servi 1.170.2 alors que 1.171.0 était en ligne : cache à comprendre ; (3) l'encadré de l'écran Archives dit « Archiver dans les archives… », le menu dit « Archiver… ».

## Résultat de la porte refaite, 30 septembre 2026, 16 h 22 (Cowork)

**Passée, pour le chemin de Chrome (mode dossier).** Relevé de Grégoire à 16 h 21 : 3 rangées cochées sur 4 ; la rangée 1.2 (écran Archives) n'est pas cochée et son constat ne dit pas si un dossier est lié.

**Mesuré par Cowork sur l'archive** (`Réserve_LaboCodex Backup/trimestres/h2026-601-101-gr00008`, lecture seule, aucun nom lu) :

- `meta.json` : `application_version` **1.171.1**, « Mac — Chrome », `mode_archive` fsapi, archivée à 16 h 19 min 58 s. La version est donc attestée par l'archive, le champ de la rangée 0.1 étant resté vide.
- **205 empreintes déclarées, 205 recalculées, 205 concordantes** ; aucune copie absente, aucun fichier hors liste.
- 205 fichiers, 607 334 696 octets, égal à `taille_travaux_totale` ; l'empreinte de `donnees.json` concorde.

**Trouvaille** : un `manifeste-archives.json` isolé se trouve dans `trimestres/`, écrit à 16 h 17 min 42 s, deux minutes avant l'archive. Inférence : un premier essai où le dossier choisi dans Chrome était `trimestres` au lieu de sa racine ; l'archive de cet essai n'est plus sur le disque. Chrome a donc redemandé le dossier à chaque archivage (il n'est pas retenu), et rien n'empêche de choisir le mauvais niveau. À inscrire avec la trouvaille du dossier non retenu. Cowork n'a rien supprimé.

**Reste non prouvé** : le chemin de Safari (fichier à télécharger, « Il y est »), et l'iPad.
