# Portes terrain – chantier du codex, #1012 : ton codex te prévient quand des copies lui manquent

> Écrites le 1er octobre 2026, à 19 h 02 (Toronto, mesurée par `date`), par Claude Code (ce markdown : la trace). **Cowork publie l'artefact jumeau** (cases, champs de saisie, bouton « Copier mes résultats »).
> **Le numéro à lire : 1.174.0** (build `1001-1900`). **En ligne depuis 20 h 05, le 1er octobre 2026** (mesuré chez Netlify : déploiement de production prêt sur `740a984c`, publié à 20 h 05 min 15 s ; le fichier servi lui-même n'a pas été lu). La porte peut se faire.
> Un seul appareil : **Mac, dans Chrome**. Adresse : `https://app.codexnumeris.org`.
> **Pourquoi cinq rangées seulement** : les mots de la fenêtre, le compte des copies, « Annuler » qui n'écrit rien, le fichier qui reçoit le codex et l'export de sélection sont jugés par les bancs (WebKit). Seul ton Chrome peut dire que **sa** fenêtre d'enregistrement s'ouvre bien après l'avertissement : le banc l'imite.
> **Tes données** : ⛔ **aucune rangée n'écrit dans ton fichier de codex.** Les rangées 1.1 à 1.4 se font dans une fenêtre de navigation privée : elle a son propre espace, vide, et l'oublie à sa fermeture. Tu n'y cliques jamais « Enregistrer » dans la fenêtre de Chrome. Ta fenêtre normale et tes données de travail ne sont pas touchées.
> Ce qui échoue devient un item du BACKLOG, pas une note.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 `Mac · Chrome` | Ouvre l'application et recharge de force (⌘ + Maj + R). Lis le numéro en bas de page. | **1.174.0** (champ : le numéro lu). Si tu lis 1.173.3 ou moins : arrête-toi, le lot n'est pas en ligne. |

## §1 · Ton vrai codex, en fenêtre privée `Données réelles, en lecture`

Avant ce lot, depuis un espace où des copies manquaient, « Mettre à jour le codex » écrivait un fichier sans elles et disait « Codex mis à jour », rien de plus. Maintenant, une fenêtre le dit avant d'écrire, et l'application demande où ranger le fichier.

| | Geste | Attendu |
|---|---|---|
| 1.1 `Mac · Chrome` `fenêtre privée` | Ouvre une fenêtre de navigation privée (⌘ + Maj + N), et l'application dedans. Menu Codex, en haut de l'écran → « Ouvrir un codex… », puis choisis le fichier de ton codex. Quand la fenêtre « **Codex ouvert, mais incomplet** » paraît, clique « **Annuler** » (pas « Recharger »). | La fenêtre du bilan, comme à tes portes de 12 h 37 et de 16 h 55 : « … copies sur … n'ont pas pu revenir, faute d'espace. » (champs : les deux nombres lus) |
| 1.2 `Mac · Chrome` `fenêtre privée` | Menu Codex → « **Mettre à jour le codex** ». | Une fenêtre, titre « **Ce codex n'aura pas toutes tes copies** ». Son texte : « … copies sur … ne sont pas dans l'application. Le codex que tu vas écrire ne les contiendra pas. » ; puis « Si un autre fichier de codex les contient encore, ne le remplace pas : donne un autre nom à celui-ci. » Deux boutons : « Annuler » et « Écrire sans ces copies » (rouge). Elle passe **avant** la liste « Confirmer l'export ». (champs : les deux nombres lus ; ce qui diffère, s'il y a lieu) |
| 1.3 `Mac · Chrome` `fenêtre privée` | Clique « **Annuler** ». Attends dix secondes. | Rien ne s'ouvre : ni liste « Confirmer l'export », ni fenêtre d'enregistrement de Chrome. Aucun message « Codex mis à jour », aucun « Codex non mis à jour ». (champ : ce qui est apparu, s'il y a lieu) |
| 1.4 `Mac · Chrome` `fenêtre privée` | De nouveau : menu Codex → « Mettre à jour le codex », puis « **Écrire sans ces copies** ». À la liste « Confirmer l'export codex », clique « Télécharger ». Laisse la préparation se terminer. ⛔ Quand la fenêtre d'enregistrement de Chrome s'ouvre, clique « **Annuler** » dans cette fenêtre : tu n'enregistres rien. | **La fenêtre d'enregistrement de Chrome s'ouvre**, avec un nom de fichier proposé. Après ton « Annuler » : aucun message « Codex mis à jour ». (champ : la fenêtre de Chrome s'est-elle ouverte, oui ou non ; sinon, ce qui est apparu à sa place) |
| Si 1.1 finit autrement | Note la fin que tu vois, puis ferme la fenêtre privée. | (champ) « Espace insuffisant pour ouvrir ce codex » : le refus est venu avant l'ouverture. « Recharger la page », sans le mot « incomplet » : toutes tes copies sont entrées. Dans les deux cas la porte n'a pas échoué, mais elle n'a pas vu la fenêtre d'avertissement : les rangées 1.2 à 1.4 ne se font pas. |
| Si 1.4 finit autrement | À la place de la fenêtre de Chrome, une fenêtre « **Codex non mis à jour** » : note-le, puis clique « **Réessayer** ». | (champ) La fenêtre d'enregistrement de Chrome devrait alors s'ouvrir : clique « Annuler » dedans. Ce n'est pas un échec de la porte, c'est une mesure : voir §4, premier point. |

Quand c'est fini, ferme la fenêtre privée : rien n'a changé dans ta fenêtre normale.

**Les nombres ne sont pas un attendu.** Ceux de 1.2 peuvent différer de ceux de 1.1 : le bilan de l'ouverture compte toute copie refusée ; l'avertissement ne compte que les copies attendues, donc pas celles qui sont marquées « exportée ». Le premier nombre de 1.2 peut donc être plus petit que celui de 1.1. C'est lu au code, pas mesuré : tes nombres le diront.

## §2 · Dans ta fenêtre normale, sans échéance

| | Geste | Attendu |
|---|---|---|
| 2.1 `Mac · Chrome` `fenêtre normale` `sans échéance` | Rien à faire pour la porte. À ta prochaine mise à jour habituelle de ton codex, regarde seulement ce qui passe à l'écran. | **Aucune** fenêtre « Ce codex n'aura pas toutes tes copies » : chez toi, le compte mesuré à 17 h 03 est zéro. Le codex s'écrit comme d'habitude. (champ : une fenêtre d'avertissement est-elle passée, oui ou non ; si oui, ses deux nombres) |

## §3 · Décisions

Aucune dans cette porte. Trois décisions t'attendent ailleurs, chacune avec son lot : la copie vraiment perdue, qui ferait revenir la fenêtre à chaque mise à jour ; l'ancien `.zip` ouvert par la case, qui remplace la liste des copies ; la sélection exportée sans ses copies.

## §4 · Ce qui n'a pas pu être vérifié

- **La fenêtre d'enregistrement de Chrome après une préparation longue.** Chrome n'ouvre cette fenêtre que dans les secondes qui suivent un clic. Entre ton clic sur « Télécharger » et l'ouverture, l'application prépare le fichier. Si la préparation dure trop, Chrome peut refuser ; l'application dirait alors « Codex non mis à jour » et proposerait « Réessayer », qui est un clic neuf. **Inféré**, jamais exécuté : WebKit n'a pas cette fenêtre, le banc l'imite. Ce chemin existait avant ce lot (une mise à jour sans fichier tenu) ; le lot y fait passer aussi la mise à jour d'un codex auquel des copies manquent. La rangée 1.4 le mesure.
- **Le partage de l'iPad** : la fenêtre d'avertissement passe avant la feuille de partage au banc, avec un faux partage. Sur un vrai iPad, l'enchaînement de la fenêtre, de la préparation et de « Ton codex est prêt » n'est pas vécu. Aucune rangée : tu n'as pas d'espace où des copies manquent sur ton iPad, et en fabriquer un demanderait d'y ouvrir ton codex en navigation privée.
- **Le compte sur un vrai espace** : la mesure de 17 h 03 a compté chez toi avec une sonde, pas avec ce code. La rangée 2.1 dira si les deux s'accordent.
- **« Exporter une sélection »** : jugée au banc seulement (elle demande toujours où écrire, et n'écrit plus dans le fichier du codex). Aucune rangée : un raté s'y verrait sans rien abîmer, la fenêtre de Chrome s'ouvrirait ou non.
- **Les mots des trois autres causes** d'une ouverture incomplète (copie absente du fichier, format non reconnu, erreur) et du mélange : jugés au banc. Ton codex en fenêtre privée ne montre que le manque d'espace.
- **La suite complète au navigateur** : prise après l'écriture de cette porte, sur `740a984c` : verte, 0 échec, aucune spec instable (rendue à 19 h 52). Elle tourne dans WebKit, pas dans Chrome.

## §5 · Résultat – 2 octobre 2026, 6 h 50

> Rapporté par la consigne de Cowork du 2 octobre, 6 h 54, sur la capture de Grégoire. Inscrit par Claude Code à 6 h 57 ; la capture elle-même n'a pas été relue par Claude Code.

**La porte n'a pas pu voir la fenêtre d'avertissement. Elle n'a pas échoué.**

| Rangée | Résultat |
|---|---|
| 0.1 | Non rapporté par la consigne (le numéro lu n'y est pas). |
| 1.1 | **A fini autrement** (la rangée « Si 1.1 finit autrement ») : en fenêtre privée de Chrome, le codex de Grégoire (1,22 Go, écrit le 1er octobre à 18 h 50) s'est ouvert **en entier** : « Recharger la page », sans le mot « incomplet ». Toutes ses copies sont entrées. |
| 1.2 à 1.4 | **Non faites** : aucune copie ne manquait, donc aucune fenêtre d'avertissement à voir. Elles attendent un cas réel ; Grégoire ne fabrique pas de données pour elles. |
| 2.1 | Reste à voir, sans échéance. |

**Ce qui reste inféré, faute de porte** : que la fenêtre d'enregistrement de Chrome s'ouvre après l'avertissement (§4, premier point). Le banc l'imite ; rien ne l'a vécue.

**Un écart, non expliqué** : aux portes du 1er octobre (12 h 37 et 16 h 55), la même ouverture en fenêtre privée s'arrêtait faute d'espace ; ce matin elle est passée entière. Rien n'a été mesuré là-dessus.

**Relevé par Cowork sur la capture** (inscrit sous #1012, issue 2) : la fenêtre d'une ouverture complète dit encore « Le fichier ZIP d'origine reste dans Fichiers — tu peux le supprimer pour récupérer de l'espace » (`js/codex.js`, l. 3131). Ce fichier est le codex de l'usager, et le mot arrêté est « codex ». Ce sont des mots : décision de Grégoire, plus tard.
