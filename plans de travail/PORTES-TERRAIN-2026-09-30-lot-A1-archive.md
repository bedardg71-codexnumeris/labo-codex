# Portes terrain – chantier des archives, lot A1 : archiver ton plus gros groupe, et retrouver le fichier

> Écrites le 30 septembre 2026, vers 13 h 35 (Toronto), par Claude Code (ce markdown : la trace). **Cowork publie l'artefact jumeau** (cases, champs de saisie, bouton « Copier mes résultats »).
> Sur le **Mac**, dans **Safari**, données réelles, `https://app.codexnumeris.org`.
> ⚠ **La porte attend que le lot soit en ligne.** Le 30 sept. à 13 h 35, il est sur la branche `lot-a1-archive-sans-copier`, ni relu ni poussé : la version en ligne (1.171.0) est celle d'avant. **Le numéro à lire en 0.1 est à inscrire ici à la release.**
> **Pourquoi si peu de rangées** : le fichier (contenu, empreintes, mémoire, disque) est jugé par les bancs. Seul ton Safari, avec tes vraies copies, peut dire que le fichier arrive dans tes Téléchargements. C'est sur cette archive que reposera, plus tard, le retrait des copies : un raté compte.
> **Tes données** : rien n'est écrit ni effacé dans tes trimestres. Seule la liste de tes archives reçoit une ligne, après ton « Il y est ».
> Ce qui échoue devient un item du BACKLOG, pas une note.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | Dans Safari, sur le Mac, ouvre l'application, recharge, lis le numéro en bas de page. | **Le numéro de la release du lot A1** (à inscrire ici ; plus grand que 1.171.0). Si tu lis 1.171.0 : arrête-toi, le lot n'est pas en ligne. |
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
