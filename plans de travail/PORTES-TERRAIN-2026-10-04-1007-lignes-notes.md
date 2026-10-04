# Portes terrain – 4 octobre 2026 : le codex proposé avant de retirer une ligne qui porte des notes (#1007, lot 2b)

> Écrit par Claude Code le 4 octobre 2026 (Toronto), sur la consigne de Cowork de 0 h 07.
> Version visée : **1.178.0**, build **1004-0010** (en ligne depuis 1 h 20, mesuré chez Netlify sur `a74bd2b7`). Cowork publie l'artefact jumeau (bouton « Copier mes résultats »).
> Ce qui échoue devient une ligne au `BACKLOG.md`, avec le numéro de la porte.

**Pourquoi une porte.** Le banc rejoue ces gestes dans un navigateur imité. Il ne voit pas, dans le vrai Chrome, l'enchaînement de la fenêtre du codex et de la question du critère. Ici, un raté retirerait un critère noté dans des dizaines d'évaluations sans que le codex proposé ait pu le sauver.

**Rien ne touche tes vraies données** : tout se fait dans une fenêtre de navigation privée de Chrome, sur le Mac, avec les données démo. Pas d'iPad. Durée : environ trois minutes.

**Deux gestes à éprouver** : retirer un critère employé par des évaluations (la fenêtre paraît, « Annuler » ne retire rien) ; retirer un critère qu'aucune évaluation n'emploie (aucune fenêtre).

---

## §0 · Préalable

| # | Geste | Attendu |
|---|---|---|
| 0.1 | Dans Chrome sur le Mac, ouvre une **fenêtre de navigation privée** (Cmd+Maj+N), et seulement elle. | Une fenêtre sombre « Navigation privée ». |
| 0.2 | Va à `https://app.codexnumeris.org` et lis le numéro en bas de page. | **1.178.0**. Sinon, recharge ; s'il reste plus bas, arrête-toi : la porte jugerait l'ancienne version. |
| 0.3 | À l'accueil, coche la case **« Données démo »** (« Cours fictif déjà configuré »). Si une question paraît, accepte-la. | Le bandeau « Mode démonstration ». |
| 0.4 | Va à **Conception › Grilles de critères**, puis clique **« Grille-4 »** dans la liste de gauche. | La zone d'édition montre ses quatre critères : Structure, Rigueur, Plausibilité, Nuance. |

## §1 · Un critère noté : la fenêtre, puis « Annuler »

**Pourquoi.** « Nuance » est noté dans 38 évaluations de la démo. Le retirer change leur note ; le codex est proposé avant la question.

| # | Geste | Attendu |
|---|---|---|
| 1.1 | Sur le critère **« Nuance »**, clique la corbeille, dans le coin du bloc (« Supprimer ce critère »). | Une fenêtre titrée **« Écrire un codex avant de supprimer ? »**, **avant** toute autre question. |
| 1.2 | Lis le texte et les boutons. | « Supprimer ce critère l'efface pour de bon. Ton codex à jour pourra te le rendre, jusqu'à ta mise à jour suivante. » ; « Annuler », « Supprimer sans codex », « Écrire un codex, puis supprimer ». |
| 1.3 | Clique **« Annuler »**. | La fenêtre se ferme ; **aucune autre question**. « Nuance » est toujours là, avec ses trois voisins. |

## §2 · Un critère neuf : aucune fenêtre

**Pourquoi.** Un critère qu'aucune évaluation n'emploie se retire comme avant 1.178.0.

| # | Geste | Attendu |
|---|---|---|
| 2.1 | Sous les critères, clique **« + Ajouter un critère »**. | Un cinquième bloc, « Nouveau critère ». |
| 2.2 | Clique sa corbeille. | **Aucune fenêtre du codex** : seulement la question habituelle, « Es-tu sûr de vouloir supprimer ce critère ? ». |
| 2.3 | Réponds **OK**. | Le bloc disparaît ; il reste les quatre critères de départ. |

## §3 · Décisions

Aucune : les mots ont été acceptés le 4 octobre à 0 h 07.

## §4 · Ce que je n'ai pas pu vérifier

- **Le sous-critère, le niveau d'échelle et la cible de dénotation** passent par la même fenêtre ; ils sont jugés au banc (sentinelle, banc unitaire par famille, banc WebKit pour la cible, dont deux cibles retirées d'un coup dans l'assistant), pas par cette porte.
- **« Écrire un codex, puis supprimer »** n'est pas éprouvé ici : le chemin d'écriture est commun à toutes les portes et a été jugé avec 1.176.0.
- **Chemins d'écran vérifiés par les vrais clics**, dans un espace neuf, au navigateur (WebKit, 1180 px) le 4 octobre vers 1 h 21 : la case « Données démo » ; Conception › Grilles de critères ; « Grille-4 » dans la liste (« Grille-4 HOLIS 4 critères ») ; la corbeille de « Nuance » (la fenêtre, mots et boutons ci-dessus, aucune question avant) ; « Annuler » (quatre critères en base, aucune question) ; « + Ajouter un critère » puis sa corbeille (aucune fenêtre, la question « Es-tu sûr de vouloir supprimer ce critère ? », le critère retiré).
- **Préalable mesuré** : dans la démo, les quatre critères de « Grille-4 » sont employés chacun par 38 évaluations ; aucun codex n'est actif dans un espace neuf (d'où le titre « Écrire un codex… » et non « Mettre ton codex à jour… »).
