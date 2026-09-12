# Portes terrain — 12 septembre 2026 (l'accueil parle aux deux métiers, le champ 2 ne se contredit plus, les rencontres sans critères ciblés — à livrer en 1.138.0)

> **État** : écrite le 12 septembre 2026 par Claude Code, sur la consigne du jour de Cowork (10 h 25, révisée à 10 h 35).
> Le code est commité sur `main` local, **ni releasé, ni poussé** : la release `1.138.0` attend la relecture croisée de Cowork
> (consigne § 5). **Cette porte ne s'ouvre qu'une fois `1.138.0` en ligne** (§ 0).
> Six rangées (consigne § 6, révisée à 10 h 50 : la sixième est « Tes prochains rendez-vous »), deux décisions (§ 3). Code : `e011ed64` + `62f24316`. Ce qui échoue devient un item du BACKLOG, avec son numéro de rangée.
> **Markdown par Claude Code ; l'artefact jumeau (bouton « Copier mes résultats », champs de saisie au § 3) par Cowork.**

---

## §0 · Préalable — un geste

| | Geste | Attendu |
|---|---|---|
| **0** | Ouvre `https://app.codexnumeris.org`, recharge avec vidage de cache (Cmd+Maj+R), lis le numéro en bas de page | **`1.138.0`**. Sinon, la version n'est pas encore en ligne : arrête-toi là, tout le reste jugerait la version d'avant. |

## §1 · Tes données — ce que cette liste écrit chez toi

**Rien.** La rangée 5 ouvre une rencontre ; tu n'as pas à l'enregistrer. (Si tu l'enregistres, ses critères ciblés et son objectif
restent tels qu'ils sont en base : c'est verrouillé par un test.)

## §2 · Interface — ce que tu vérifies à l'écran

| | Geste | Attendu |
|---|---|---|
| **1** | L'accueil, hors démo. Regarde sous le bandeau « Bienvenue », puis compte les cartes sous « Tâches ». Fais-le en mode sombre, puis en mode clair | Une carte **« Tu es orthopédagogue ? »**, pleine largeur, **au-dessus** du mot « Tâches » : « Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre. » et le lien **« Commencer → »** à droite. Elle a le fond, le trait fin et les coins des autres cartes (blanche en mode clair) — ni couleur propre, ni bord gauche épais. **Les huit tâches sont toutes là.** |
| **2** | Clique « Commencer → » | Tu arrives dans **Suivi › Rencontres**. ⚠ Ce que tu y vois dépend de ton contexte, et ce n'est pas tout à fait ce que la consigne annonçait : **sur ton 601-101-MQ** (un groupe-cours d'enseignement actif), tu vois la carte « Les rencontres d'orthopédagogie se tiennent dans un service… » et son lien **« Créer un service d’orthopédagogie »**, qui ouvre les trois questions ; **sur un service actif**, la liste des rencontres ; **sans aucun trimestre** (l'orthopédagogue lundi), les trois questions directement. Le chemin est celui du sous-onglet : le lien ne fait rien de plus que cliquer « Rencontres ». |
| **3** | Reviens à l'accueil et déplie le bandeau « Bienvenue » | Dans cet ordre : le paragraphe de présentation (inchangé) ; **« Par où commencer ? »** suivi de ses deux branches, **« Je suis enseignant·e — Configure ton trimestre… tu peux les élaborer et les partager avec tes collègues. »** et **« Je suis orthopédagogue — Décris ton service dans Suivi › Rencontres : tes rencontres se tiennent là. »** ; **« Certains concepts sont nouveaux ? »** Trois guides… par les boutons « Guide ». ; **« Ton courriel, une fois par mois. »** Tu donnes ton courriel… sur ton appareil. ; puis l'invitation à la communauté de pratique (inchangée). |
| **4** | Active un service (ou crée-en un en démo), va dans `Cadre › Groupe-cours`, clique « + Nouveau groupe-cours » et lis le champ 2 | **« 2. Cours ou service »** — et non plus « Service d’orthopédagogie ». Son menu commence par **« — Choisir un cours ou un service — »** (mot proposé, § 3.2) et liste tes cours **et** tes services, comme avant. Sur ton 601-101-MQ, le même champ dit la même chose. Tout le reste du Cadre et de l'accueil est identique à `1.137.0`. |
| **5** | Sur un service : `Suivi › Rencontres`, ouvre une rencontre. Puis active ton 601-101-MQ : `Suivi › Interventions`, ouvre une intervention | **Sur le service** : pas de bloc « Critères ciblés », ni « Objectif visé », ni de bouton « Suggérer » ; si la rencontre est complétée, son bilan dit **« Ce que tu retiens de la rencontre. »** **Sur ton 601-101-MQ** : le bloc est là, tes cinq critères aussi (Structure, Rigueur, Plausibilité, Nuance, Français écrit), et « Suggérer » propose un objectif quand un critère et un élève sont cochés. |

| **6** | Sur un service : `Suivi › Rencontres`, avec au moins une rencontre datée d'aujourd'hui ou plus tard (crée-en une en démo si besoin) | En tête de la liste, sous le bouton « + Nouvelle rencontre », le bloc **« Tes prochains rendez-vous »** : au plus quatre lignes, **la plus proche en premier** — la date en toutes lettres, l'heure si tu l'as notée, le titre, « individuelle » ou « en sous-groupe ». **La liste du dessous n'a pas changé d'ordre** (la plus récente en premier). Sans rencontre à venir : « Aucun rendez-vous à venir. Tes rencontres passées restent dans la liste ci-dessous. » Sans aucune rencontre : pas de bloc, seulement « Aucune rencontre. » (choix de Claude Code, la phrase serait fausse sous une liste vide). Ouvre une rencontre, puis reviens : le bloc est toujours là. |

## §3 · Décisions — ce qui attend ton verdict (ce ne sont pas des vérifications : écris ta réponse)

| | Question | Ta réponse |
|---|---|---|
| **3.1** | **(#848)** Deux autres endroits du Cadre ont le défaut de la rangée 1 de la porte d'hier : ils suivent le contexte actif alors qu'ils nomment un **choix**. (a) Dans `Cadre › Cours`, sur un service, le menu dit « Sélectionner un service... », « Service : », « Aucun service sélectionné » — et liste pourtant tes cours. (b) La phrase des éléments obligatoires du groupe-cours dit « 4 éléments… l’horaire est facultatif » selon le service **actif**, alors que l'application exige l'horaire selon le cours **choisi** au champ 2 : sur un service, si tu choisis 601-101-MQ au champ 2, la phrase dit l'horaire facultatif et l'enregistrement le réclame. **A** — les deux cessent de suivre le contexte ; **B** — seulement (a) ; **C** — tel quel. | |
| **3.2** | L'option vide du champ 2 dit **« — Choisir un cours ou un service — »** : ce mot n'était pas dans la consigne, je l'ai tiré de ton « Cours ou service » pour que le menu ne dise pas autre chose que son libellé. Tel quel, ou ton mot ? | |

## §4 · Ce que je n'ai pas pu vérifier

- **Ton écran, Safari, l'iPad** : l'apparence de la carte en mode sombre et en mode clair a été rendue dans WebKit (capture de la
  session), pas dans ton Safari.
- **Tes données réelles** : le pack démo a été capturé AVANT (le code de `1.137.0`) et rejoué APRÈS — seules des chaînes affichées
  diffèrent, et les deux formulaires hors service sont identiques à l'octet ; tes deux groupes ne l'ont pas été.
- **Laissé exprès, hors service rien ne change** : sans grille de référence, le formulaire d'une intervention dit « Configure une grille
  de référence dans **Conception › Grilles de critères** » — le réglage vit dans `Labo › Outils d'observation`. C'est le texte que
  l'orthopédagogue aurait vu ; sur un service, il ne s'affiche plus. Pour un enseignant sans grille (mardi, la communauté de pratique),
  il reste faux. Non inscrit : à toi de dire s'il faut le reprendre.
- **Laissé exprès** : sur un service, l'onglet `Suivi › Interventions` ouvre le même formulaire (sans la carte, même règle) ; si
  l'intervention est complétée, son bilan dit encore « Comparaison automatique des critères ciblés avant et après l'intervention. »
  — le tableau ne s'y affichera jamais. Le texte arrêté ne visait que les rencontres.
