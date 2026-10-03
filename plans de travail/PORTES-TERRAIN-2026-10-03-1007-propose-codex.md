# Portes terrain – 3 octobre 2026 : le codex proposé avant de supprimer (#1007, second lot, 2a-1)

> Écrit par Claude Code le 3 octobre 2026 (Toronto), sur la consigne de Cowork de 7 h 56.
> Version visée : **1.176.0**, build **1003-0806**. Cowork publie l'artefact jumeau (bouton « Copier mes résultats »).
> Ce qui échoue devient une ligne au `BACKLOG.md`, sous #1007, avec le numéro de la porte.

**Pourquoi une porte.** Le banc du lot rejoue chaque chemin dans un navigateur imité ; il ne voit ni la vraie fenêtre « Enregistrer sous » de Chrome, ni l'enchaînement réel de la fenêtre et de la question habituelle à l'écran. Ici, un raté effacerait un élément sans que le codex proposé l'ait sauvé.

**Rien ne touche tes vraies données** : tout se fait dans une fenêtre de navigation privée de Chrome, sur le Mac. Pas d'iPad dans cette porte.

**Le geste choisi : supprimer une production** (Conception › Productions étudiantes, bouton « Supprimer » de la fiche). C'est la même fenêtre pour les 36 gestes du lot ; seule la première phrase change.

---

## §0 · Préalable

| # | Geste | Attendu |
|---|---|---|
| 0.1 | Dans Chrome sur le Mac, ouvre une **fenêtre de navigation privée** (Cmd+Maj+N), et seulement elle. | Une fenêtre sombre « Navigation privée ». |
| 0.2 | Va à `https://app.codexnumeris.org` et lis le numéro en bas de page. | **1.176.0**. Sinon, recharge ; s'il reste plus bas, arrête-toi : la porte jugerait l'ancienne version. |
| 0.3 | Laisse l'application ouvrir son espace neuf. Ouvre le menu **Codex**, en haut de l'écran. | Aucun codex actif : le menu ne nomme aucun fichier. |
| 0.4 | Conception › Productions étudiantes › « + Nouvelle production » : crée quatre productions, **Essai 1** à **Essai 4**. Pour chacune : le nom, un type (n'importe lequel), une pondération de **5 %**, puis « Créer la production ». | Les quatre sont dans la liste de gauche. |

## §1 · Sans codex : la fenêtre, ses trois boutons

**Pourquoi.** Sans codex actif, l'application propose d'en écrire un avant d'effacer pour de bon. « Annuler » ne doit rien effacer.

| # | Geste | Attendu |
|---|---|---|
| 1.1 | Ouvre **Essai 1** dans la liste, puis clique « Supprimer ». | Une fenêtre titrée **« Écrire un codex avant de supprimer ? »**, **avant** toute autre question. |
| 1.2 | Lis le texte. | « Supprimer cette production l'efface pour de bon. Ton codex à jour pourra te la rendre, jusqu'à ta mise à jour suivante. » |
| 1.3 | Lis les trois boutons, de gauche à droite. | « Annuler », « **Supprimer sans codex** », « Écrire un codex, puis supprimer ». « Annuler » a le focus (encadré). |
| 1.4 | Clique **« Annuler »**. | La fenêtre se ferme ; **aucune autre question**. **Essai 1** est toujours dans la liste. |
| 1.5 | Sur **Essai 1**, refais « Supprimer », puis clique **« Supprimer sans codex »**. | La question habituelle : « Es-tu sûr de vouloir supprimer cette production ? ». Clique OK : **Essai 1** disparaît. Aucun fichier n'a été demandé. |

## §2 · « Écrire un codex, puis supprimer »

| # | Geste | Attendu |
|---|---|---|
| 2.1 | Ouvre **Essai 2**, clique « Supprimer », puis **« Écrire un codex, puis supprimer »**. | L'application prépare le fichier (un aperçu peut s'afficher : confirme-le), puis **te demande où l'enregistrer**. |
| 2.2 | Enregistre-le sur le Bureau, et note son nom. ✍ | Une notification « Codex mis à jour ». Le fichier est sur le Bureau. |
| 2.3 | Lis ce qui suit. | La question habituelle : « Es-tu sûr de vouloir supprimer cette production ? ». Clique OK : **Essai 2** disparaît. |
| 2.4 | Menu Codex. | Le fichier de 2.2 y est nommé. |

## §3 · Codex à jour : aucune fenêtre

**Pourquoi.** Codex à jour, rien ne change : la question habituelle, telle qu'avant.

| # | Geste | Attendu |
|---|---|---|
| 3.1 | Menu Codex › « Mettre à jour le codex ». (La suppression de 2.3 compte comme une modification : le codex n'est plus à jour.) | Chrome réécrit le même fichier, sans fenêtre ; notification « Codex mis à jour ». |
| 3.2 | Ouvre **Essai 3**, clique « Supprimer ». | **Aucune fenêtre de codex** : la question habituelle tout de suite, « Es-tu sûr de vouloir supprimer cette production ? ». |
| 3.3 | Réponds **Annuler** à cette question. | **Essai 3** reste. Le codex reste à jour (rien n'a changé). |

## §4 · Une modification, puis un quatrième geste

| # | Geste | Attendu |
|---|---|---|
| 4.1 | Ouvre **Essai 4**, change le champ « Nom de la production » en **Essai 4 modifié**, puis clique ailleurs. | Le nom change dans la liste. |
| 4.2 | Ouvre **Essai 3**, clique « Supprimer ». | Une fenêtre titrée **« Mettre ton codex à jour avant de supprimer ? »**, même texte qu'en 1.2. Trois boutons : « Annuler », « Supprimer sans mettre à jour », « Mettre à jour, puis supprimer ». |
| 4.3 | Clique **« Mettre à jour, puis supprimer »**. | Chrome réécrit le fichier de 2.2 (sans fenêtre, ou en redemandant où si Chrome a perdu l'accès) ; notification « Codex mis à jour » ; puis la question habituelle. Clique OK : **Essai 3** disparaît. |

## §5 · Décisions

Aucune : les mots ont été acceptés le 3 octobre à 7 h 56.

## §6 · Ce que je n'ai pas pu vérifier

- **La vraie fenêtre « Enregistrer sous » de Chrome** : le banc l'imite. C'est l'objet de 2.1-2.2 et 4.3.
- **Les 35 autres gestes** (élève, évaluation, grille, pratique, corbeille, etc.) passent par la même fonction ; ils sont couverts par la sentinelle et le banc (`tests/integration/1007-propose-codex-avant-suppression.spec.js`), pas par cette porte.
- **L'iPad** : sans « Enregistrer sous », l'écriture passe par la feuille de partage ; imitée au premier lot, jamais vue ici. Hors de cette porte.
- **Supposé** : un espace neuf en navigation privée laisse créer une production sans autre réglage que le nom, le type et la pondération (0.4 ; ce sont les trois champs que le code exige), et une production existante s'enregistre champ par champ, en quittant le champ (4.1). Si l'écran demande autre chose, fais-le et note-le.
- **Supposé** : la suppression de 2.3 rend le codex « pas à jour » (d'où 3.1). Si le menu Codex le dit déjà à jour après 2.3, note-le : ce n'est pas un échec.
- **Chemins d'écran vérifiés dans le code** : l'onglet « Conception », la sous-section « Productions étudiantes » (`js/config.js`), les boutons « + Nouvelle production », « Créer la production » et « Supprimer » de la fiche (`index.html`), le menu « Codex » et « Mettre à jour le codex ». À noter pour l'artefact : l'onglet s'appelle « Évaluation », au singulier ; cette porte n'y passe pas.
