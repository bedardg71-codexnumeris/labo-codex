# Portes terrain – chantier du codex, #1012 : un ancien fichier ouvert dans Réglages ne fait plus perdre de copies

> Écrites le 2 octobre 2026, à 8 h 46 (Toronto, mesurée par `date`), par Claude Code (ce markdown : la trace). **Cowork publie l'artefact jumeau** (cases, champs de saisie, bouton « Copier mes résultats »).
> **Le numéro à lire : 1.174.1** (build `1002-0752`). **En ligne depuis 8 h 46, le 2 octobre 2026** (mesuré chez Netlify : déploiement de production prêt sur `44843fc0`, publié à 8 h 46 min 28 s ; le fichier servi lui-même n'a pas été lu). La porte peut se faire.
> Un seul appareil : **Mac, dans Chrome, en fenêtre de navigation privée**. Adresse : `https://app.codexnumeris.org`.
> **Pourquoi cette porte** : le banc (WebKit) prouve que les copies d'un ancien `.zip` s'ajoutent à celles de l'espace, mais avec un magasin de copies en mémoire. Seul ton Chrome a le vrai magasin (IndexedDB), et seul ton vrai ancien fichier dit ce que fait un cas réel.
> **Tes données** : ⛔ **rien n'écrit dans ton fichier de codex.** Tout se fait dans une fenêtre privée : elle a son propre espace, vide, et l'oublie à sa fermeture. ⛔ **Aucune rangée ne clique « Mettre à jour le codex »** : après l'ouverture de ton codex, l'application tient ton fichier, et cette commande l'écrirait. Ta fenêtre normale et tes données de travail ne sont pas touchées.
> Ce qui échoue devient un item du BACKLOG, pas une note.

> **État au 2 octobre 2026, 8 h 50 : la porte attend un cas réel.** Réponse de Grégoire à la rangée 0.1 : il n'a pas d'ancien `.zip` avec copies. La porte n'a pas échoué, elle n'a rien vu ; aucun fichier n'est fabriqué pour elle. Elle se rouvre le jour où un ancien `.zip` avec copies se présente.

## §0 · Préalables

| | Geste | Attendu |
|---|---|---|
| 0.1 `Mac` | **As-tu déjà un ancien fichier `.zip` qui porte des copies** (une ancienne copie de secours, ou un ancien export, fait avant le codex) ? Idéalement du trimestre que ton codex ouvre comme trimestre actif. | (champ : oui ou non ; si oui, son nom et sa date). ⛔ **Si non : la porte attend un cas réel. N'en fabrique pas un pour elle.** Arrête-toi ici. |
| 0.2 `Mac · Chrome` `fenêtre privée` | Ouvre une fenêtre de navigation privée (⌘ + Maj + N), et l'application dedans. Lis le numéro en bas de page. | **1.174.1** (champ : le numéro lu). Si tu lis 1.174.0 ou moins : arrête-toi, le lot n'est pas en ligne. |

## §1 · Ton codex, puis l'ancien `.zip`, en fenêtre privée `Données réelles, en lecture`

Avant ce lot, ouvrir un ancien `.zip` par « Ouvrir un Codex… » avec « Fichiers travaux » cochée **remplaçait** la liste de tes copies par celle du fichier : tes copies disparaissaient de la liste, et la mise à jour suivante du codex les perdait sans rien dire. Maintenant, les copies du fichier s'ajoutent aux tiennes.

| | Geste | Attendu |
|---|---|---|
| 1.1 `Mac · Chrome` `fenêtre privée` | Menu Codex, en haut de l'écran → « Ouvrir un codex… », puis choisis le fichier de ton codex. Laisse l'ouverture finir, puis clique « Recharger la page ». | Ton codex ouvert, comme ce matin à 6 h 50. (champ : la fin vue) |
| 1.2 `Mac · Chrome` `fenêtre privée` | Note le **trimestre** et le **groupe** affichés en haut. Va dans **Évaluations › Exporter et archiver**. Lis la ligne sous le titre « Exporter et archiver ». | « **N fichiers en stock** (taille) ». (champ : **N avant**, et le groupe). ⚠ Ce nombre compte les copies du **groupe actif** seulement : ne change pas de groupe d'ici à 1.5. |
| 1.3 `Mac · Chrome` `fenêtre privée` | Va dans **Réglages › Données** → « **Ouvrir un Codex…** », et choisis l'**ancien `.zip`** de 0.1. Une fenêtre à cases s'ouvre. **Ne coche pas « C'est ma propre sauvegarde »** (elle coche toutes tes données personnelles). Décoche tout, puis coche **une seule case : « Fichiers travaux »**. | La ligne « Fichiers travaux » dit « … fichier(s) PDF … ». (champ : ce nombre, celui du **fichier**) |
| 1.4 `Mac · Chrome` `fenêtre privée` | Clique « **Importer la sélection** ». Lis le message qui s'affiche, puis, s'il est proposé, accepte « Recharger la page pour voir les changements ? ». | L'un de ces trois textes (champ : le texte lu, mot pour mot) : **« Import réussi ! … M fichier(s) travaux + P PDF restauré(s) … »** (M copies du fichier sont entrées, absentes de ton espace) ; ou **« Import réussi ! … 0 fichier(s) travaux + P PDF restauré(s) »** (aucune copie neuve ; P fichiers manquants sont revenus) ; ou **« Aucune nouvelle donnée à importer. »** (toutes ses copies sont déjà là). Les trois sont justes ; aucun ne dit « non restauré » si ton espace a de la place. |
| 1.5 `Mac · Chrome` `fenêtre privée` | Même trimestre, même groupe qu'en 1.2 : **Évaluations › Exporter et archiver**. Relis la ligne. | « **N fichiers en stock** ». (champ : **N après**). **N après ≥ N avant : aucune copie n'a disparu.** Si le fichier portait des copies de ce groupe absentes de ton espace, N après = N avant + ces copies-là ; le M du bilan peut être plus grand, il compte aussi les copies des autres groupes. ⛔ **N après plus petit que N avant : c'est l'échec que cette porte cherche.** |
| Si 1.1 finit autrement | Une ouverture refusée faute d'espace (« Espace insuffisant… », ou « Codex ouvert, mais incomplet »). Note la fin vue, puis ferme la fenêtre privée. | (champ) **Ce n'est pas un échec de la porte** : la fenêtre privée de Chrome a peu de place. La porte n'a rien vu ; elle attend un autre essai. |
| Si 1.3 finit autrement | La fenêtre à cases n'a pas de ligne « Fichiers travaux ». | (champ) L'ancien fichier ne porte pas de copies : la porte attend un autre fichier (retour à 0.1). |

Quand c'est fini, **ferme la fenêtre privée sans rien d'autre** : son espace s'efface, ton fichier de codex n'a pas été écrit.

**Les quatre autres cases ne sont pas jugées ici.** « Annotations », « Notes », « Étudiants » et « Présences » **remplacent encore** ce que ton espace a (mesuré au banc, inscrit sous #1012 ; c'est un lot à venir du chantier du codex). Ne les coche pas : un remplacement par elles n'est pas un échec de cette porte.

## §2 · Décisions

Aucune dans cette porte. Les mots en attente (la copie vraiment perdue, « fichier ZIP » dans la fenêtre d'une ouverture complète, les deux relevés du bilan de l'import) ont chacun leur lot.

## §3 · Ce qui n'a pas pu être vérifié

- **Le vrai magasin de Chrome** : au banc, la question « ce fichier est-il déjà au magasin ? » répond par un magasin en mémoire. Dans Chrome, elle lit IndexedDB (ou le dossier sur disque s'il est actif). Les rangées 1.4 et 1.5 le mesurent.
- **« Mettre à jour le codex » après l'import, dans Chrome** : le banc montre que la mise à jour écrit alors toutes les copies, dans WebKit avec une fausse poignée de fichier. **Aucune rangée** : en fenêtre privée, après l'ouverture de ton codex, cette commande écrirait dans ton vrai fichier.
- **Le compte de 1.2 et 1.5 est celui d'un groupe** : une copie d'un autre groupe ne s'y voit pas. Ce que l'écran ne montre pas en nombre, le bilan de 1.4 le dit.
- **Un ancien `.zip` volumineux** : pour chaque copie déjà là, l'application regarde au magasin si son fichier y est (relevé du verdict de Cowork, inféré, non mesuré). Si 1.4 te paraît long, note-le (champ libre) : c'est une mesure.
- **La suite complète au navigateur** : prise avant le push, sur `44843fc0` : verte, 0 échec, aucune spec instable (rendue à 8 h 44). Elle tourne dans WebKit, pas dans Chrome.
