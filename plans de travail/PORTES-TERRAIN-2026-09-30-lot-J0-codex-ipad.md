# Portes terrain – lot J0 : sur l'iPad, la mise à jour du codex aboutit (#988 rouverte)

> Écrites le 30 septembre 2026, vers 6 h 20, par Claude Code (le markdown ; **Cowork publie l'artefact**, bouton « Copier mes résultats »). Sur tes **données réelles**, à l'adresse `https://app.codexnumeris.org`, sur l'iPad. Ce qui échoue devient une fiche du BACKLOG.
>
> ✅ **Le lot est en ligne : la porte peut se faire.** 1.170.1 (`e9fb94a2`), relu par Cowork (« le lot part, sans correction »), verdict WebKit complet vert, en ligne depuis le 30 sept. à 7 h 19 (Netlify « ready », `commit_ref` `e9fb94a2`). Le numéro attendu en 0.1 est **1.170.1**.
>
> **Pourquoi si peu de rangées, par les deux règles de tête.** Les machines ont déjà répondu sur le contenu du fichier (banc Vitest, épreuve croisée avec 1.170.0 dans WebKit, `unzip -t` à 1,3 Go) et sur la mémoire et le disque sous WebKit du Mac. Elles ne peuvent pas répondre sur ton iPad avec ton codex réel : sa mémoire, son espace libre, et la feuille de partage vers Fichiers. C'est une copie de secours : un raté compte.
>
> **Les rangées 0.2, 1.2 et 1.4 demandent une valeur, pas une coche** : l'artefact leur donne un champ de saisie.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | Sur l'iPad, ouvre `https://app.codexnumeris.org`, recharge, lis le numéro en bas de page. | **1.170.1** (la release du lot J0). Encore 1.170.0 : arrête-toi, le lot n'est pas en ligne. |
| 0.2 | Réglages › Général › Stockage iPad : **note l'espace libre** (champ de saisie). | Mesure d'entrée, aucun chiffre n'est un échec ici. Le 30 sept. à 5 h 31 : environ 3 Go libres sur 64. Le fichier du codex pèse environ 1,3 Go. |
| 0.3 | Une fenêtre « Mets ton codex à jour » s'est-elle ouverte au chargement ? | Possible. **Ne la ferme ni par la croix ni par « Plus tard »** (14 jours de silence : le §2 ne prouverait plus rien) ; touche « Mettre à jour le codex » et fais 1.1 depuis l'aperçu. Pas de fenêtre : fais 1.1 par le menu. |

## §1 · La mise à jour du codex aboutit `iPad`

*Pourquoi : le 30 sept. à 5 h 12 et à 5 h 20, la barre « Compression du ZIP… » s'est arrêtée vers 2 %, la page s'est rechargée toute seule, et aucun fichier n'a été écrit.*

| | Geste | Attendu |
|---|---|---|
| 1.1 | Bouton « Codex » › « Mettre à jour le codex » (ou le bouton de la fenêtre de 0.3), puis « Télécharger » dans l'aperçu. | La barre « Compression du ZIP… » monte jusqu'à 100 %, **sans que la page se recharge**. Avant : elle s'arrêtait vers 2 %. |
| 1.2 | **Note combien de temps la barre a mis** (champ de saisie, à peu près). | Mesure d'entrée, aucune durée n'est un échec. Sur le Mac : 7 secondes ; avant le lot : 47. |
| 1.3 | La feuille de partage s'ouvre : « Enregistrer dans Fichiers », choisis ton dossier habituel. | « Codex mis à jour » ; le menu « Codex » dit « Ton codex est à jour ». |
| 1.4 | Dans Fichiers, trouve le fichier `codex-…-` daté d'aujourd'hui. **Note sa taille** (champ de saisie). | Un fichier du jour. Taille : mesure d'entrée ; celui du 29 sept. pesait 1,27 Go, celui-ci devrait peser environ 3 % de plus. |
| 1.5 | **Seulement si ça échoue** (fenêtre « Codex non mis à jour », ou la page se recharge) : ne réessaie pas tout de suite. Bouton « Signaler un bug », et envoie le rapport à Cowork. | Le rapport contient la section « DERNIÈRE MISE À JOUR DU CODEX » : l'étape atteinte dit où ça s'est arrêté. |

## §2 · Après une mise à jour réussie, aucun rappel `iPad`

*Pourquoi : ce sont les rangées 1.2 et 1.3 de la porte du lot I. Le 30 sept. au matin, elles n'ont rien prouvé : la mise à jour n'avait pas abouti.* **À faire seulement si 1.3 est passée.**

| | Geste | Attendu |
|---|---|---|
| 2.1 | Ferme l'onglet de l'application, rouvre `https://app.codexnumeris.org`, attends deux secondes. | Aucune fenêtre de rappel (ni « Fais une copie de secours », ni « Mets ton codex à jour »). |
| 2.2 | Refais 2.1 une seconde fois. | Toujours aucun rappel. |

## §3 · Décisions

Aucune dans cette porte. Deux questions qui touchent tes données sont posées à part, dans `DEMANDE-RELECTURE-2026-09-30-lot-J0-codex-ipad.md` (§ « Ce qui remonte à Grégoire ») ; elles ne bloquent pas la porte.

## §4 · Ce que je n'ai pas pu vérifier

- **Ton iPad.** Toute la mesure vient de WebKit 26.4 sur le Mac (16 Go de mémoire, aucun plafond par onglet) ; ton iPad a Safari 27 et un plafond que je ne connais pas. Après le lot, la préparation du fichier prend environ 0,3 Go de mémoire au lieu de 6,5 Go : c'est un ordre de grandeur mesuré, pas une garantie pour l'iPad.
- **La feuille de partage vers Fichiers.** Elle n'existe pas au banc. Ce qu'elle prend en mémoire et en disque n'est pas mesuré ; j'infère, sans le prouver, qu'elle a besoin d'au moins une fois le fichier en espace libre (1,3 Go), peut-être deux. Avec 3 Go libres, c'est serré : d'où la rangée 0.2.
- **Laquelle des deux causes a tué la page le 30 sept.**, la mémoire ou le disque : non départagé. Le lot retire les deux à l'étape « Compression » ; il ne change rien à l'étape du partage.
- **La réussite du 29 sept. à 15 h 03**, à taille presque égale, reste inexpliquée.
- **Des copies réelles.** Le banc utilise 500 copies fictives aux tailles de tes copies (octets aléatoires). Tes vrais PDF n'ont pas été lus.
- **Le fichier réel que ton iPad écrira.** Une machine peut le juger sans toi : s'il arrive dans ton dossier iCloud, la prochaine session lance `unzip -tq` dessus (lecture seule) et compare le compte d'entrées à celui du 29 sept. (503).
- **L'export sélectif** (« Exporter une sélection ») garde l'ancienne fabrication : non touché par ce lot, même risque à grande taille.
