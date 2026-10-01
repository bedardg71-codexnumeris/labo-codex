# Portes terrain – chantier du codex, lot I bis : un seul terme

> Écrites le 30 septembre 2026, vers 22 h (Toronto), par Claude Code (ce markdown : la trace). **Cowork publie l'artefact jumeau** (cases, champs de saisie, bouton « Copier mes résultats »).
> **Cette porte attend la mise en ligne.** À l'écriture, le lot est sur la branche `lot-i-bis-un-seul-terme`, ni relu ni poussé. **Le numéro à lire** sera celui de la release (une version mineure après 1.172.0 ; à inscrire ici à la release).
> Deux appareils : **Mac, dans Chrome** ; **iPad, dans Safari**. Adresse : `https://app.codexnumeris.org`.
> **Pourquoi si peu de rangées** : les mots, la carte à quatre largeurs, les anciens fichiers qui s'ouvrent et la suppression dans les trois cas sont jugés par les bancs (WebKit). Seuls ton Chrome et ton iPad, avec tes vrais trimestres, peuvent dire que le refus s'affiche chez toi.
> **Tes données** : ⛔ **tu ne supprimes aucun trimestre.** La porte s'arrête au refus, qui n'écrit rien. Si l'écran te pose la question « Supprimer définitivement… », réponds **Annuler**.
> Ce qui échoue devient un item du BACKLOG, pas une note.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 `Mac · Chrome` | Ouvre l'application et recharge de force (⌘ + Maj + R). Lis le numéro en bas de page. | Le numéro de la release du lot (champ : le numéro lu). Si tu lis 1.172.0 ou moins : arrête-toi, le lot n'est pas en ligne. |
| 0.2 `iPad · Safari` | Ouvre l'application, recharge. Lis le numéro en bas de page. | Le même numéro (champ : le numéro lu). |

## §1 · Données : le refus de supprimer `Données réelles`

Avant ce lot, supprimer un trimestre téléchargeait un fichier puis effaçait. Ce fichier ne contenait pas tes copies, et rien ne savait le rouvrir. Maintenant, la suppression est refusée tant que ton codex n'a pas tes derniers changements.

| | Geste | Attendu |
|---|---|---|
| 1.1 `Mac · Chrome` | Ouvre le menu Codex, en haut de l'écran. Lis la ligne d'état. | (champ : ce qu'elle dit, « Ton codex est à jour » ou « Ton codex n'a pas tes derniers changements »). Si elle dit « à jour » : fais un petit changement sans conséquence (ouvre une fiche, modifie une note de présence et remets-la), puis relis. Il faut « n'a pas tes derniers changements » pour la suite. |
| 1.2 `Mac · Chrome` | Cadre → Trimestre, bouton « Bibliothèque ». Sur la carte d'un trimestre **qui n'est pas l'actif**, clique ⋮ puis « Supprimer… ». | Une fenêtre de l'application, titre « **Mets d'abord ton codex à jour** », texte « Supprimer un trimestre efface ses données pour de bon. Ton codex n'a pas tes derniers changements : mets-le à jour, puis recommence. », boutons « Fermer » et « Mettre à jour le codex ». **Aucune** question « Supprimer définitivement… ». |
| 1.3 `Mac · Chrome` | Clique « **Fermer** ». Regarde la bibliothèque des trimestres. | Le trimestre est toujours là. ⛔ Arrête-toi ici : ne clique pas « Mettre à jour le codex » puis « Supprimer… » de nouveau. |
| 1.4 `iPad · Safari` | Refais 1.1 à 1.3 sur l'iPad. | La même fenêtre, lisible en entier, les deux boutons atteignables. (champ : ce qui diffère du Mac, s'il y a lieu) |
| Si 1.2 pose la question « Supprimer définitivement le trimestre… » | Réponds **Annuler**. Note ce que disait la ligne d'état du menu Codex juste avant. | (champ) C'est le cas « codex à jour » : la porte n'a pas échoué, mais elle n'a pas vu le refus. |

## §2 · Interface : la carte à deux cases

| | Geste | Attendu |
|---|---|---|
| 2.1 `Mac · Chrome` | Réglages → Données. Regarde la première carte. | Titre « **Ouverture et partage** ». Deux cases côte à côte : « Exporter ma config » et « Ouvrir un Codex ». Plus de case ni de bouton « Copie de secours ». |
| 2.2 `iPad · Safari` | Même écran sur l'iPad, tenu à la verticale puis à l'horizontale. | Les deux cases tiennent dans la carte, aucun bouton coupé. |

## §2 bis · La case « Ouvrir un Codex » ouvre un codex (ajout du 1er oct., correction 1 de la relecture)

Avant, un fichier de codex choisi dans cette case recevait une alerte qui renvoyait au menu Codex. Maintenant, il s'ouvre par le même chemin que le menu. Les bancs le jugent dans WebKit ; ton Chrome et ton vrai fichier, eux seuls peuvent le dire chez toi.

⛔ **Ce geste se fait dans une fenêtre de navigation privée, pas dans ta fenêtre normale.** Ouvrir un codex remplace les données de l'espace où on l'ouvre. Une fenêtre privée a son propre espace, vide, et l'oublie à sa fermeture : tes données de travail n'y sont pas, et rien ne les touche.

| | Geste | Attendu |
|---|---|---|
| 2.3 `Mac · Chrome` `fenêtre privée` | Ouvre une fenêtre de navigation privée (⌘ + Maj + N), et l'application dedans. Réglages → Données → « Ouvrir un Codex… », puis choisis le fichier de ton codex. | La fenêtre « Importer les données » se ferme et « Ouverture du codex » s'affiche. **Aucune** alerte « Ce fichier est un codex… utilise le bouton Codex ». (champ : ce que tu vois ; le poids du fichier) |
| 2.4 `Mac · Chrome` `fenêtre privée` | Laisse l'ouverture se terminer. | L'une de ces deux fins : « Recharger la page » (clique « Recharger » : tes trimestres sont là) ; ou « Espace insuffisant pour ouvrir ce codex » (une fenêtre privée a peu de place). Les deux sont la réponse du codex, donc la porte est passée. (champ : laquelle) |
| 2.5 `Mac · Chrome` | Ferme la fenêtre privée. Reviens à ta fenêtre normale. | Rien n'y a changé. |

## §3 · Décisions (rendues par Grégoire le 1er oct. 2026, entre 2 h 07 et 2 h 12 ; rapportées par la consigne de Cowork)

| | Question | Verdict |
|---|---|---|
| 3.1 | Le texte du refus **quand il n'y a pas de codex du tout** : « Supprimer un trimestre efface ses données pour de bon. Tu n'as pas encore de codex : crée-le avec le bouton ci-dessous, puis recommence. » | **Tel quel.** |
| 3.2 | « Garde ce fichier » : dans Chrome, la prochaine mise à jour du codex réécrit le même fichier, et le trimestre supprimé n'y est plus. Faut-il le dire à l'écran, ou faire autre chose ? | **Dit à l'écran.** La question devient : « … Ton codex à jour les contient encore, jusqu'à ta prochaine mise à jour : pour pouvoir revenir en arrière, fais d'abord une copie de ce fichier. » Un filet plus fort (un codex écrit à part avant la suppression) est inscrit : **#1007**, ta décision à venir. |

## §4 · Ce qui n'a pas pu être vérifié

- **Chrome sur le Mac** : les bancs tournent dans WebKit. Que le bouton « Mettre à jour le codex » de la fenêtre de refus ouvre bien le sélecteur de fichier de Chrome est une inférence (au banc, c'est le chemin de l'iPad qui est joué, avec un faux partage).
- **L'iPad réel** : la fenêtre de refus avec le clavier ou en mode clair, la carte en orientation verticale.
- **Tes vrais anciens fichiers** : tu n'en as jamais fait (ton mot du 29 sept.). Les bancs rouvrent deux fichiers fictifs fabriqués au code de 1.172.0. Un fichier d'un·e collègue, fait par une version plus ancienne, n'a pas été essayé.
- **Un gros codex par la case, sur l'iPad** : non essayé. Au banc, la case ne lit que la fin du fichier (environ 64 Ko et le répertoire du ZIP) avant de le confier au codex, même pour un fichier de 1,1 Go ; ensuite, c'est le chemin du menu. Sur l'iPad, le menu Codex reste le chemin éprouvé. La porte 2.3 ne se fait pas sur l'iPad : en navigation privée, Safari accorde trop peu de place, et dans la fenêtre normale le geste remplacerait tes données.
- **Le sélecteur de fichier de Chrome dans la case** : au banc, le fichier est donné au champ par l'outil de test (porte 2.3).
- **Le cas « codex à jour » sur tes données** : non rejoué, exprès (il mène à une vraie suppression).
