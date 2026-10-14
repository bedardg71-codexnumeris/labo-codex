# Écarts entre l'intention scellée et l'observation aveugle

Mise en regard de `1-intentions-scellees.md` (ci-après « l'intention ») et de `2-observation-aveugle.md` (ci-après « l'observation »), partie par partie de l'intention. Seuls ces deux textes ont été lus. Ce texte n'interprète pas, ne propose aucun correctif et ne dit pas lequel des deux a raison ; les jugements de l'observation (« échoue », « erreur », « écart ») y sont traités comme des observations.

## Comment lire ce texte

**Unité comparée.** Chaque ligne de l'intention qui porte un énoncé, de la partie 1 à l'annexe : puce, élément de liste numérotée ou paragraphe. Les titres, les lignes qui annoncent une liste (elles finissent par « : ») et les séparateurs n'en sont pas : ce qu'un titre affirme seul (par exemple « Labo › Démo » dans le titre de l'écran 3) n'est comparé que si une unité le reprend.

**Entrées.** Une unité qui porte plusieurs affirmations donne une entrée par affirmation qui diverge ; elle ne va dans « Concordant » que si aucune de ses affirmations ne diverge. Chaque entrée donne, dans cet ordre, la citation de l'intention, la ou les citations de l'observation, puis la catégorie. Pour l'intention, la section est le titre d'écran (niveau 3) sous lequel l'entrée est rangée et le geste qui suit son numéro ; pour l'observation, la section suit le numéro de ligne (ses titres, abrégés des références au code : identifiants entre backticks, fichiers et numéros de ligne du code). Les entrées sont numérotées par partie : « 3.12 » est l'entrée 12 de la partie 3, « A.4 » l'entrée 4 de l'annexe.

**Citations.** Copies exactes ; « […] » marque une coupure. Un script a vérifié que chaque fragment cité figure mot pour mot, et dans l'ordre, à la ligne indiquée. « Aucune mention » signifie qu'une recherche dans l'autre texte n'a rien trouvé ; les termes cherchés sont donnés.

**Catégories.**

1. Fait sans être prévu : l'observation décrit un comportement qu'aucune ligne de l'intention ne prévoit.
2. Prévu mais pas fait : l'intention prévoit un élément, un geste, un effet ou une sortie, et rien ne lui correspond dans l'observation.
3. Fait autrement : l'observation décrit l'élément correspondant, mais son comportement, son libellé, sa place, sa valeur, sa règle, son ordre ou son résultat diffère.
4. Non comparable : l'intention porte sur ce que l'observation n'a pas pu voir, ou elle est marquée « Non tranché ». Le motif suit la catégorie : « hors de la copie observée » ; « Ce qui n'a pas pu être observé » (rangé dans cette section de l'observation) ; « non observé (déclaré dans le corps de l'observation) » ; « conditions de l'observation (ni iPad ni Safari) » ; « Non tranché ».

**Hypothèses de travail.** Ces choix de méthode changent le classement ; ils sont dits ici pour pouvoir être contestés.

- Silence de l'observation. Quand l'observation ne dit rien d'un élément prévu, l'entrée est classée 2 avec la mention « aucune mention ». C'est une absence dans le texte observé, pas une absence constatée dans le programme ; le bilan chiffré compte ces entrées à part.
- « Données : non documenté » et « Sans geste : non documenté ». L'intention précise que ces mentions ne signifient pas l'absence d'effet (l. 136-137). Quand l'observation décrit un effet, l'entrée est classée 1 et rattachée à cette ligne ; sinon, la ligne va dans « Concordant ».
- Catégorie 1 sans ligne d'intention. Une entrée par élément observé (bouton, champ, fenêtre, message, minuterie, écriture de données). N'y figurent ni les détails d'implémentation (fonctions, fichiers, clés internes), ni les précisions d'un comportement que l'intention prévoit déjà (libellé exact d'un message, nom exact d'un fichier, quand l'intention n'en fixe pas).
- Catégorie 4. Elle couvre la section « Ce qui n'a pas pu être observé » et aussi ce que l'observation déclare ailleurs n'avoir pas pu observer, exécuter ou déclencher. « Lu dans le code » compte comme observé.
- Appareil. L'observation a tourné dans Chromium sans tête, fenêtre de 1400 × 900 (l. 8). Les affirmations propres à l'iPad ou à Safari sont classées 4, motif « conditions de l'observation (ni iPad ni Safari) », quand elles forment une affirmation à part ; mêlées à une affirmation observable, elles restent dans l'entrée de celle-ci.
- Codex « pas à jour ». Aucun codex n'a été ouvert pendant l'observation : les actions du menu Codex sont rangées parmi les points non observés (l. 2836), et les fenêtres vues avant une suppression sont celles de l'état « sans codex » (« Écrire un codex avant de supprimer ? »). Les affirmations qui portent sur la fenêtre de l'état « pas à jour » (« Mettre ton codex à jour avant de supprimer ? », « Supprimer sans mettre à jour ») sont classées 4, motif « Ce qui n'a pas pu être observé ». Les lignes qui disent seulement « codex proposé avant, s'il n'est pas à jour » ont été comparées à la fenêtre de l'état « sans codex » ; plusieurs sont concordantes.
- Un échec ou une erreur observés là où l'intention prévoit un résultat sont classés 3.
- Marques de l'intention : une ligne « Contradiction » est comparée à la décision qu'elle dit retenir ; une ligne « Incertain » est comparée normalement.
- L'annexe se présente comme des renvois et non comme des intentions nouvelles (l. 3602) ; elle est comparée comme le reste, ce qui recoupe en partie les entrées des écrans auxquels elle renvoie.

**Limites.** Le classement a été fait par quatorze sous-agents, chacun sur une plage de l'intention, avec les deux seuls textes. Un script a vérifié l'exactitude des citations et le traitement de chaque unité, pas la justesse de chaque catégorie. Trois contrôles ont suivi :

- les 367 entrées de catégorie 1 sans ligne d'intention ont été revues une à une par cinq autres sous-agents, chargés de chercher une ligne de l'intention qui en parle : 322 sont maintenues (319 entrées après la fusion de quatre entrées qui citaient le même passage, l. 854), 21 ont été rattachées à une ligne de l'intention (catégorie 3, ou catégorie 1 sur une mention « non documenté »), 24 ont été retirées parce qu'une ligne de l'intention prévoit le comportement et que l'observation concorde, ou parce qu'elles ne portaient que sur un détail ;
- 25 entrées de catégorie 2 « aucune mention », tirées au hasard, ont été recherchées à nouveau dans l'observation avec d'autres termes ; aucune mention n'a été trouvée ;
- deux affirmations récurrentes, classées différemment d'une partie à l'autre, ont été harmonisées selon les règles dites plus haut (iPad et Safari : 15 entrées ; fenêtre du codex « pas à jour » : 6 entrées).

Les frontières les plus fragiles restent celle entre 2 et 3, et celle entre « Concordant » et 3 quand l'observation est plus détaillée que l'intention ; la section « Classements incertains », à la fin, liste les unités où une autre catégorie était défendable. L'observation est organisée par module, l'intention par écran : un même comportement peut être cité sous plusieurs unités.

## Bilan chiffré

| Partie | Unités | Concordantes | Unités en écart | Entrées d'écart | 1 · fait sans être prévu (dont sans ligne d'intention) | 2 · prévu mais pas fait (dont aucune mention) | 3 · fait autrement | 4 · non comparable |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 196 | 51 | 145 | 194 | 38 (28) | 67 (64) | 18 | 71 |
| 2 | 256 | 121 | 135 | 179 | 33 (32) | 80 (77) | 30 | 36 |
| 3 | 200 | 85 | 115 | 141 | 20 (20) | 69 (69) | 16 | 36 |
| 4 | 328 | 129 | 199 | 267 | 52 (49) | 135 (135) | 34 | 46 |
| 5 | 283 | 86 | 197 | 271 | 55 (49) | 117 (113) | 30 | 69 |
| 6 | 214 | 101 | 113 | 173 | 49 (45) | 91 (86) | 15 | 18 |
| 7 | 166 | 64 | 102 | 126 | 20 (19) | 40 (40) | 17 | 49 |
| 8 | 118 | 57 | 61 | 125 | 62 (60) | 33 (29) | 14 | 16 |
| 9 | 133 | 36 | 97 | 117 | 22 (17) | 30 (30) | 11 | 54 |
| Annexe | 106 | 45 | 61 | 80 | 0 (0) | 48 (47) | 14 | 18 |
| Total | 2000 | 775 | 1225 | 1673 | 351 (319) | 710 (690) | 199 | 413 |

---

## Partie 1 · L'entrée, l'en-tête, le codex et l'aide

### Écran 1 · Ouverture de l'application

**1.1** · Geste : ouvrir l'application à son adresse
- Intention, l. 157 :
  > l'application n'est servie qu'à l'adresse app.codexnumeris.org ; un signet vers une ancienne adresse en .netlify.app y redirige
- Observation, l. 8 (Conditions d'observation) :
  > le dépôt est servi tel quel par `python3 -m http.server` sur `http://127.0.0.1:8765/`
- Catégorie : 4 · non comparable (hors de la copie observée)

**1.2** · Geste : ouvrir l'application à son adresse
- Intention, l. 158 :
  > à l'entrée, l'application demande une adresse courriel et y envoie un code de connexion ; le code ouvre une session d'un mois, renouvelée en redonnant son courriel ; ni compte, ni mot de passe, porte ouverte à toute adresse
- Observation, l. 8 (Conditions d'observation) :
  > le dépôt est servi tel quel par `python3 -m http.server` sur `http://127.0.0.1:8765/`
- Observation, l. 164 (Écran Accueil › Bannière « Bienvenue dans Labo Codex ! ») :
  > texte seulement, sans champ ni bouton ni requête associés (lu dans le code, js/accueil.js:21-46 ; aucune autre occurrence de ce dispositif dans js/ et index.html)
- Catégorie : 4 · non comparable (hors de la copie observée)

**1.3** · Geste : ouvrir l'application à son adresse
- Intention, l. 159 :
  > l'identification sert à savoir qui entre, pas à trier
- Observation, l. 8 (Conditions d'observation) :
  > le dépôt est servi tel quel par `python3 -m http.server` sur `http://127.0.0.1:8765/`
- Observation, l. 164 (Écran Accueil › Bannière « Bienvenue dans Labo Codex ! ») :
  > texte seulement, sans champ ni bouton ni requête associés
- Catégorie : 4 · non comparable (hors de la copie observée)

**1.4** · Geste : ouvrir l'application à son adresse
- Intention, l. 161 :
  > une fois la page ouverte, l'application n'a plus besoin du réseau
- Observation, l. 52 (En-tête et navigation globale › Barre de navigation principale) :
  > 1er clic sur Évaluation → `GET http://127.0.0.1:8765/libs/pdf.worker.min.js` (fichier du dépôt)
- Observation, l. 12 (Conditions d'observation) :
  > la seule requête émise sans geste après le chargement est `GET version.json` (≈ 30 s après le chargement, puis toutes les 5 min)
- Catégorie : 3 · fait autrement

**1.5** · Geste : ouvrir l'application pour la première fois (espace neuf)
- Intention, l. 166 :
  > Données : non documenté
- Observation, l. 2641 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Premier chargement (stockage vide) — observé à l'exécution) :
  > **Écrit** (51 clés localStorage, 47 enregistrements IDB `keyvalue`, 0 `fichiers`, base `reserve_fsapi` vide)
- Observation, l. 2647 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Premier chargement (stockage vide) — observé à l'exécution) :
  > 17 clés `demo_*`
- Catégorie : 1 · fait sans être prévu

**1.6** · Geste : ouvrir l'application pour la première fois (espace neuf)
- Intention, l. 168 :
  > au premier lancement, l'application propose la démonstration
- Observation, l. 2648 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Premier chargement (stockage vide) — observé à l'exécution) :
  > Aucune erreur, aucun dialogue.
- Observation, l. 2649 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Premier chargement (stockage vide) — observé à l'exécution) :
  > **Sorties** : section Accueil ; sélecteur « -- Sélectionne un trimestre -- » ; carte « Bienvenue dans Labo Codex ! »
- Catégorie : 2 · prévu mais pas fait

**1.7** · Sans geste
- Intention, l. 171 :
  > Non documenté dans les sources lues.
- Observation, l. 2738 (Ce qui se produit sans geste de l'utilisateur › En-tête, Accueil et Aide) :
  > Minuteries : `verifierMiseAJourDistante` à 30 s puis toutes les 300 s (js/init-inline.js:343-346) ; `setInterval` 500 ms qui écrit `sectionActive`/`sousSectionActive` dans `#debug-section`/`#debug-sous-section` s'ils existent
- Observation, l. 2739 (Ce qui se produit sans geste de l'utilisateur › En-tête, Accueil et Aide) :
  > js/rapport-bug.js remplace `console.error`, `console.warn` et `window.afficherSection` par des enveloppes, et pose des écouteurs `error`, `unhandledrejection` et un `click` en capture qui consignent les 20 derniers clics/erreurs en mémoire
- Catégorie : 1 · fait sans être prévu

### Écran 2 · Accueil

**1.8** · Geste : déplier et lire le bandeau « Bienvenue dans Labo Codex ! »
- Intention, l. 177 :
  > puis « Par où commencer ? » en liste numérotée de trois étapes
- Observation : aucune mention (termes cherchés : « Par où commencer », « Pose ton cadre », « Conçois tes productions », « Apprends geste par geste », « liste numérotée »)
- Catégorie : 2 · prévu mais pas fait

**1.9** · Geste : déplier et lire le bandeau « Bienvenue dans Labo Codex ! »
- Intention, l. 181 :
  > aucun tiret cadratin dans l'encadré
- Observation : aucune mention (termes cherchés : « tiret cadratin », « cadratin », « tiret »)
- Catégorie : 2 · prévu mais pas fait

**1.10** · Geste : cliquer « Voir les tutoriels ↗ »
- Intention, l. 186 :
  > annoncé aux lecteurs d'écran
- Observation : aucune mention (termes cherchés : « lecteurs d'écran », « lecteur d'écran », « aria-label »)
- Catégorie : 2 · prévu mais pas fait

**1.11** · Geste : cliquer « Voir les tutoriels ↗ »
- Intention, l. 186 :
  > même hauteur et même style que « Voir les guides pédagogiques »
- Observation : aucune mention (termes cherchés : « même hauteur », « même style », « hauteur »)
- Catégorie : 2 · prévu mais pas fait

**1.12** · Geste : cliquer « Voir les tutoriels ↗ »
- Intention, l. 186 :
  > les trois boutons passent à la ligne proprement sur un écran étroit
- Observation : aucune mention (termes cherchés : « passent à la ligne », « écran étroit », « retour à la ligne »)
- Catégorie : 2 · prévu mais pas fait

**1.13** · Geste : cliquer « Voir les guides pédagogiques »
- Intention, l. 191 :
  > non documenté au-delà des trois guides (SOLO, micro-données, RàI)
- Observation, l. 1089 (Conception — Pratiques de notation › Sous-écran › Boutons guides) :
  > `som` : affiche le guide « COMPRENDRE SA PRATIQUE SOMMATIVE | Ce que mesure une moyenne pondérée | … » ; `pan` : « MODALITÉS D'ÉVALUATION (PAN ET SOMMATIVE) | Pourquoi sortir du cumul de points ? | … »
- Catégorie : 1 · fait sans être prévu

**1.14** · Geste : suivre « Commencer → » de la carte « Tu es orthopédagogue ? »
- Intention, l. 195 :
  > la carte est pleine largeur, sous le bandeau, au-dessus du libellé « Tâches », de même apparence que les autres cartes (ni couleur propre, ni bord épais)
- Observation : aucune mention (termes cherchés : « pleine largeur », « même apparence », « bord épais », « au-dessus du libellé »)
- Catégorie : 2 · prévu mais pas fait

**1.15** · Geste : suivre « Commencer → » de la carte « Tu es orthopédagogue ? »
- Intention, l. 195 :
  > texte « Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre. »
- Observation : aucune mention (termes cherchés : « Décris ton service », « les dates de ton trimestre »)
- Catégorie : 2 · prévu mais pas fait

**1.16** · Geste : toucher la carte « Ton codex » (sous « Utilitaires »)
- Intention, l. 200 :
  > sous-titre « Mets-le à jour : une copie complète de tes données. »
- Observation : aucune mention (termes cherchés : « Mets-le à jour », « une copie complète de tes données », « sous-titre »)
- Catégorie : 2 · prévu mais pas fait

**1.17** · Geste : cocher « Assistance »
- Intention, l. 208 :
  > Données : non documenté
- Observation, l. 198 (Écran Accueil › Tuiles AIDE) :
  > **Écrit** : `preferencesUtilisateur.accompagnementActif → false`, puis `→ true`
- Catégorie : 1 · fait sans être prévu

**1.18** · Geste : cocher « Assistance »
- Intention, l. 209 :
  > Sortie : non documenté ici
- Observation, l. 199 (Écran Accueil › Tuiles AIDE) :
  > **Sorties** : bouton d'en-tête synchronisé (title « Assistance désactivée »/« activée »), classes `tour-guide-actif aide-contextuelle-active` retirées/remises
- Catégorie : 1 · fait sans être prévu

**1.19** · Geste : cocher « Assistance »
- Intention, l. 209 :
  > Aide › Prise en main la décrit comme l'un des trois outils de prise en main
- Observation : aucune mention (termes cherchés : « Prise en main », « trois outils », « outils de prise en main »)
- Catégorie : 2 · prévu mais pas fait

**1.20** · Sans geste
- Intention, l. 212 :
  > Non documenté dans les sources lues.
- Observation, l. 192 (Écran Accueil › Tuiles UTILITAIRES) :
  > **Affichage automatique** : 1,5 s après chargement, si pas en démo, s'il existe au moins une évaluation (`<trim>_evaluationsSauvegardees`) ou un fichier (`<trim>_fichiersTravaux`), si `backupNePlusRappeler ≠ "true"` et si `backupProchainRappel` est absent ou dépassé
- Observation, l. 2737 (Ce qui se produit sans geste de l'utilisateur › En-tête, Accueil et Aide) :
  > tuile Nouveautés avec pastille « 🔴 » et texte « Bêta publique 1.199.0 (Build 1011-1808) »
- Catégorie : 1 · fait sans être prévu

### Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)

**1.21** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 218 :
  > un bandeau vert « Mode démonstration » en bas de l'écran
- Observation : aucune mention (termes cherchés : « vert », « en bas de l'écran », « bas de l'écran »)
- Catégorie : 2 · prévu mais pas fait

**1.22** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 218 :
  > une question peut paraître, à accepter
- Observation : aucune mention (termes cherchés : « question », « à accepter », « accepter »)
- Catégorie : 2 · prévu mais pas fait

**1.23** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 219 :
  > 32 dates de présence du 25 août au 10 décembre
- Observation : aucune mention (termes cherchés : « 32 dates », « 25 août », « 10 décembre », « dates de présence »)
- Catégorie : 2 · prévu mais pas fait

**1.24** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 221 :
  > un exemple de la démo ne peut pas servir dans un vrai groupe-cours (grilles, échelles)
- Observation, l. 2890 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Sélection d'une échelle démo dans `#mat-echelle-id` (« Référence démo non autorisée ») : les échelles démo ne figurent pas dans la liste du trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.25** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 223 :
  > pendant un import de copies, entrer dans la démo est refusé
- Observation, l. 2843 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Avertissement « Import en cours »** des bascules démo (js/demo-activation.js:320-328) : nécessite un import de copies en cours ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.26** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 224 :
  > la bascule est réversible, sans risque pour les vraies données
- Observation, l. 222 (Écran Accueil › Données démo — désactivation (« Quitter la démo » du bandeau, ou case décochée)) :
  > Différence avec l'état initial après un cycle activation/désactivation (observé à l'exécution) : restent ajoutées `listeCours`, `modeApplication`
- Catégorie : 3 · fait autrement

**1.27** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 225 :
  > les mêmes 32 dates de présence
- Observation : aucune mention (termes cherchés : « 32 dates », « dates de présence », « 25 août »)
- Catégorie : 2 · prévu mais pas fait

**1.28** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 226 :
  > les documents de la démo sont en lecture seule
- Observation : aucune mention (termes cherchés : « lecture seule », « non modifiable », « documents de la démo »)
- Catégorie : 2 · prévu mais pas fait

**1.29** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 227 :
  > la saisie des présences s'ouvre sur la dernière séance passée, sans bandeau « configuration incomplète »
- Observation : aucune mention (termes cherchés : « configuration incomplète », « saisie des présences en démo », « demo_presences »)
- Catégorie : 2 · prévu mais pas fait

**1.30** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 228 :
  > le dépistage n'est pas muet : la famille « Défi spécifique » se calcule sur la grille du pack
- Observation : aucune mention (termes cherchés : « grille du pack », « Défi spécifique », « dépistage en démo »)
- Catégorie : 2 · prévu mais pas fait

**1.31** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 229 :
  > la démo a aussi son propre bilan réflexif
- Observation : aucune mention (termes cherchés : « bilan réflexif », « demo_questionnaireBilan », « bilan de la démo »)
- Catégorie : 2 · prévu mais pas fait

**1.32** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 229 :
  > ses notes confidentielles
- Observation : aucune mention (termes cherchés : « confidentiel », « demo_confidentielEtudiants », « notes confidentielles »)
- Catégorie : 2 · prévu mais pas fait

**1.33** · Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo)
- Intention, l. 231 :
  > en démo, le rangement des copies se dit « Rangement : dans le navigateur » ; « Stockage sur disque actif » ne s'affiche pas
- Observation : aucune mention (termes cherchés : « Stockage sur disque actif », « Rangement : dans le navigateur », « en démo »)
- Catégorie : 2 · prévu mais pas fait

**1.34** · Geste : « Quitter la démo » (bandeau vert) ou décocher la case de l'Accueil
- Intention, l. 235 :
  > Données : non documenté
- Observation, l. 221 (Écran Accueil › Données démo — désactivation (« Quitter la démo » du bandeau, ou case décochée)) :
  > **Écrit** (observé à l'exécution) : `- demo-actif`, `- demo-etat-precedent`, `- demo_cartouches_GRILLE_DEMO_1759529438501`
- Catégorie : 1 · fait sans être prévu

**1.35** · Geste : « Quitter la démo » (bandeau vert) ou décocher la case de l'Accueil
- Intention, l. 236 :
  > bloqué tant qu'un import de copies est en cours, avec un avis
- Observation, l. 2843 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Avertissement « Import en cours »** des bascules démo (js/demo-activation.js:320-328) : nécessite un import de copies en cours ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.36** · Geste : « Quitter la démo » (bandeau vert) ou décocher la case de l'Accueil
- Intention, l. 238 :
  > le bandeau vert « Mode démonstration »
- Observation : aucune mention (termes cherchés : « vert », « bandeau vert », « couleur du bandeau »)
- Catégorie : 2 · prévu mais pas fait

**1.37** · Geste : « Retirer les copies (N) » (bandeau vert)
- Intention, l. 242 :
  > visible seulement en démo, seulement s'il y a des copies importées à retirer
- Observation, l. 2838 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **« Retirer les copies (n) » du bandeau démo** (js/demo-activation.js:462-493) : bouton masqué tant qu'aucune copie n'est importée en démo ; l'import de copies relève de l'écran Évaluation ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.38** · Geste : « Retirer les copies (N) » (bandeau vert)
- Intention, l. 243 :
  > supprime pour de bon les seules copies importées dans la démo
- Observation, l. 2838 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **« Retirer les copies (n) » du bandeau démo** (js/demo-activation.js:462-493) : bouton masqué tant qu'aucune copie n'est importée en démo ; l'import de copies relève de l'écran Évaluation ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.39** · Geste : « Retirer les copies (N) » (bandeau vert)
- Intention, l. 244 :
  > leurs vignettes partent avec elles
- Observation, l. 2838 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **« Retirer les copies (n) » du bandeau démo** (js/demo-activation.js:462-493) : bouton masqué tant qu'aucune copie n'est importée en démo ; l'import de copies relève de l'écran Évaluation ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.40** · Geste : importer des copies pendant la démo
- Intention, l. 248 :
  > les copies de la démo restent dans le navigateur
- Observation, l. 2838 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > l'import de copies relève de l'écran Évaluation ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.41** · Sans geste
- Intention, l. 253 :
  > « Ce que tu fais dans la démo est provisoire
- Observation : aucune mention (termes cherchés : « provisoire », « Ce que tu fais dans la démo »)
- Catégorie : 2 · prévu mais pas fait

**1.42** · Sans geste
- Intention, l. 254 :
  > la démo ne se copie pas vers un vrai trimestre ; seul « Dupliquer » en tire des modèles à soi, un document à la fois
- Observation, l. 874 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > « Tout importer » → dialogue « Veux-tu importer les 11 production(s) de D emo dans la Bibliothèque ? » puis 10 ajouts, notification « Import terminé. 10 productions ajoutées. 1 déjà présente. »
- Catégorie : 3 · fait autrement

**1.43** · Sans geste
- Intention, l. 255 :
  > Le codex n'emporte pas la démo (ni ses données ni ses copies), et ouvrir un codex ne la modifie pas
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 4 · En-tête › menu Codex

**1.44** · Geste : ouvrir le menu Codex (bouton « Codex », en haut à gauche) et lire son état
- Intention, l. 262 :
  > la ligne sous le nom du codex dit « Ton codex est à jour » (pastille verte) ou « Ton codex n'a pas tes derniers changements » (pastille orange)
- Observation : aucune mention (termes cherchés : « Ton codex est à jour », « derniers changements », « pastille verte », « Tout est enregistré »)
- Catégorie : 2 · prévu mais pas fait

**1.45** · Geste : ouvrir le menu Codex (bouton « Codex », en haut à gauche) et lire son état
- Intention, l. 263 :
  > sans codex, « Aucun codex actif »
- Observation : aucune mention (termes cherchés : « Aucun codex actif », « Aucun codex »)
- Catégorie : 2 · prévu mais pas fait

**1.46** · Geste : ouvrir le menu Codex (bouton « Codex », en haut à gauche) et lire son état
- Intention, l. 263 :
  > le détail propose « Ouvrir un codex », « Nouveau codex », et « Mettre à jour le codex »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.47** · Geste : ouvrir le menu Codex (bouton « Codex », en haut à gauche) et lire son état
- Intention, l. 264 :
  > le détail dit le mode
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.48** · Geste : ouvrir le menu Codex (bouton « Codex », en haut à gauche) et lire son état
- Intention, l. 265 :
  > rend le codex « pas à jour »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.49** · Geste : ouvrir le menu Codex (bouton « Codex », en haut à gauche) et lire son état
- Intention, l. 266 :
  > ne rendent pas le codex « pas à jour »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.50** · Geste : « Mettre à jour le codex »
- Intention, l. 270 :
  > écrit dans un fichier ZIP toutes les données de l'application et les copies des élèves, de tous les trimestres
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.51** · Geste : « Mettre à jour le codex »
- Intention, l. 271 :
  > le codex n'emporte rien de la démo (ni ses données, ni ses copies)
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.52** · Geste : « Mettre à jour le codex »
- Intention, l. 272 :
  > l'état « à jour » n'est posé qu'après l'écriture confirmée du fichier
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Observation, l. 2837 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Suite de « Mettre à jour le codex »** (rappel de sauvegarde) : la boîte « Confirmer l'export codex » relève de js/codex.js ; non poursuivie (sélecteur de fichier natif).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.53** · Geste : « Mettre à jour le codex »
- Intention, l. 273 :
  > puis la barre « Compression du ZIP… » monte jusqu'à 100 %, sans que la page se recharge
- Observation, l. 2837 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Suite de « Mettre à jour le codex »** (rappel de sauvegarde) : la boîte « Confirmer l'export codex » relève de js/codex.js ; non poursuivie (sélecteur de fichier natif).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.54** · Geste : « Mettre à jour le codex »
- Intention, l. 274 :
  > le même fichier est réécrit sans fenêtre
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.55** · Geste : « Mettre à jour le codex »
- Intention, l. 275 :
  > sous-texte « Télécharge un nouveau fichier »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.56** · Geste : « Mettre à jour le codex »
- Intention, l. 276 :
  > la fenêtre « Ton codex est prêt » dit
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.57** · Geste : « Mettre à jour le codex »
- Intention, l. 277 :
  > la fenêtre « Ouverture de la feuille de partage… »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.58** · Geste : « Mettre à jour le codex »
- Intention, l. 278 :
  > réussite : « Codex mis à jour »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.59** · Geste : « Mettre à jour le codex »
- Intention, l. 279 :
  > « Codex non mis à jour » en bas à gauche
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.60** · Geste : « Mettre à jour le codex »
- Intention, l. 280 :
  > c'est l'enseignant qui confirme « Il y est » ou « Il n'y est pas »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.61** · Geste : « Mettre à jour le codex »
- Intention, l. 281 :
  > la fenêtre « Ce codex n'aura pas toutes tes copies »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.62** · Geste : « Mettre à jour le codex »
- Intention, l. 282 :
  > une copie marquée « exportée » ne compte pas parmi les copies manquantes
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.63** · Geste : « Mettre à jour le codex »
- Intention, l. 283 :
  > une mise à jour réussie, par le menu, par le rappel ou par « Il y est », repousse le rappel de 14 jours
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.64** · Geste : « Mettre à jour le codex »
- Intention, l. 284 :
  > en cas d'échec, le message dit la cause quand elle est connue
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.65** · Geste : « Mettre à jour le codex »
- Intention, l. 285 :
  > l'avertissement permet de marquer une copie perdue comme connue
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.66** · Geste : « Mettre à jour dans un autre fichier… »
- Intention, l. 289 :
  > écrit les données actuelles dans un nouveau fichier, à l'endroit choisi
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.67** · Geste : « Mettre à jour dans un autre fichier… »
- Intention, l. 290 :
  > « Codex mis à jour » (taille, nouveau fichier, Fichiers ou Téléchargements)
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.68** · Geste : créer un codex quand aucun n'est ouvert (« Nouveau codex », ou « Mettre à jour le codex » sans codex)
- Intention, l. 294 :
  > le parcours de la mise à jour crée le fichier
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.69** · Geste : créer un codex quand aucun n'est ouvert (« Nouveau codex », ou « Mettre à jour le codex » sans codex)
- Intention, l. 295 :
  > « Nouveau codex » demande où ranger le fichier
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.70** · Geste : « Ouvrir un codex… »
- Intention, l. 300 :
  > la démo d'un ancien codex n'est pas écrite
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.71** · Geste : « Ouvrir un codex… »
- Intention, l. 301 :
  > un codex écrit avant que le codex emporte corbeille et Modélisation s'ouvre comme avant
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.72** · Geste : « Ouvrir un codex… »
- Intention, l. 302 :
  > avant d'ouvrir, l'application vérifie l'espace
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.73** · Geste : « Ouvrir un codex… »
- Intention, l. 304 :
  > ouverture incomplète (l'espace manque en cours de route)
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.74** · Geste : « Ouvrir un codex… »
- Intention, l. 305 :
  > le bilan d'un codex ouvert incomplet dit, pour chaque cause
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.75** · Geste : « Ouvrir un codex… »
- Intention, l. 306 :
  > le détail technique en dessous
- Observation : aucune mention (termes cherchés : « détail technique », « en dessous »)
- Catégorie : 2 · prévu mais pas fait

**1.76** · Geste : « Ouvrir un codex… »
- Intention, l. 307 :
  > après une ouverture incomplète, annulée ou refusée, l'application ne tient plus le fichier choisi
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.77** · Geste : « Ouvrir un codex… »
- Intention, l. 308 :
  > l'application reste ouverte et dit que les données sont enregistrées
- Observation : aucune mention (termes cherchés : « données sont enregistrées », « sont enregistrées »)
- Catégorie : 2 · prévu mais pas fait

**1.78** · Geste : « Ouvrir un codex… »
- Intention, l. 309 :
  > tout codex que l'application écrit doit pouvoir se rouvrir, quelle que soit sa taille
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.79** · Geste : « Ouvrir un codex… »
- Intention, l. 310 :
  > un codex ou une sauvegarde d'avant le 8 août 2026 s'ouvre encore
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.80** · Geste : fermer un codex qui n'est pas à jour
- Intention, l. 314 :
  > Données : non documenté (les données restent dans l'application, selon le texte)
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.81** · Geste : fermer un codex qui n'est pas à jour
- Intention, l. 315 :
  > « Tes données restent dans l'application ; seul le fichier du codex n'est pas à jour. Fermer le codex quand même ? »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.82** · Geste : « Exporter une sélection »
- Intention, l. 319 :
  > demande toujours où écrire et n'écrit jamais dans le fichier du codex
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.83** · Geste : « Exporter une sélection »
- Intention, l. 320 :
  > emporte aussi la corbeille et la Modélisation, rien de la démo
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.84** · Geste : « Exporter une sélection »
- Intention, l. 321 :
  > si des copies manquent, la fenêtre « Cette sélection n'aura pas toutes ses copies »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.85** · Geste : « Exporter une sélection »
- Intention, l. 322 :
  > à la fin, « Export sélectif terminé »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.86** · Geste : fusionner un codex, comparer deux codex
- Intention, l. 326 :
  > la fusion vérifie le contenu réel de chaque document
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.87** · Geste : fusionner un codex, comparer deux codex
- Intention, l. 327 :
  > réimporter un codex déjà importé ne recopie pas ce qui est déjà là
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.88** · Geste : fusionner un codex, comparer deux codex
- Intention, l. 328 :
  > la fusion n'écrit pas la démo d'un ancien codex
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.89** · Geste : fusionner un codex, comparer deux codex
- Intention, l. 329 :
  > en fin de fusion, « Pense à mettre à jour le codex pour y mettre la fusion. »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.90** · Sans geste
- Intention, l. 334 :
  > Au premier lancement de 1.168, si un codex était ouvert, il a été marqué « pas à jour » une seule fois
- Observation : aucune mention (termes cherchés : « 1.168 », « pas à jour », « une seule fois »)
- Catégorie : 2 · prévu mais pas fait

**1.91** · Sans geste
- Intention, l. 335 :
  > le menu attend que le stockage soit prêt avant de dire « Aucun codex actif »
- Observation : aucune mention (termes cherchés : « Aucun codex actif », « stockage soit prêt »)
- Catégorie : 2 · prévu mais pas fait

### Écran 5 · En-tête › menu Codex › « Archiver… »

**1.92** · Geste : archiver un groupe-cours
- Intention, l. 342 :
  > l'archive n'emporte que ce groupe (rien des élèves des autres groupes), et garde ses rencontres et son assiduité
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.93** · Geste : archiver un groupe-cours
- Intention, l. 343 :
  > chaque copie y est rangée avec son empreinte
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.94** · Geste : archiver un groupe-cours
- Intention, l. 344 :
  > choisir le trimestre et le groupe, « Archiver ce groupe »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.95** · Geste : archiver un groupe-cours
- Intention, l. 345 :
  > puis la fenêtre « Téléchargement lancé »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.96** · Geste : archiver un groupe-cours
- Intention, l. 346 :
  > écriture directe dans un dossier
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.97** · Geste : archiver un groupe-cours
- Intention, l. 347 :
  > une archive dont on annule l'aperçu n'apparaît pas dans la liste des archives
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.98** · Geste : archiver un groupe-cours
- Intention, l. 349 :
  > refusé tant que des copies du trimestre sont aux archives
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.99** · Geste : archiver un groupe-cours
- Intention, l. 350 :
  > une archive de groupe déjà faite garde ce qu'elle a emporté
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.100** · Sans geste
- Intention, l. 353 :
  > Non documenté dans les sources lues.
- Observation, l. 2823 (Ce qui se produit sans geste de l'utilisateur › Réglages) :
  > js/reserve.js : 100 ms après `load`, si une poignée de dossier est mémorisée et autorisée en lecture, relit `manifeste-archives.json` du dossier
- Catégorie : 1 · fait sans être prévu

### Écran 6 · Fenêtres du codex avant une suppression (tous les écrans)

**1.101** · Geste : supprimer un trimestre, un groupe-cours, un groupe d'élèves, vider toute la liste, réinitialiser toutes les données
- Intention, l. 360 :
  > « Écrire le codex à part » (rouge)
- Observation : aucune mention (termes cherchés : « rouge », « couleur du bouton »)
- Catégorie : 2 · prévu mais pas fait

**1.102** · Geste : supprimer un trimestre, un groupe-cours, un groupe d'élèves, vider toute la liste, réinitialiser toutes les données
- Intention, l. 362 :
  > rouvert ailleurs, ce codex à part ramène le trimestre supprimé
- Observation : aucune mention (termes cherchés : « ramène », « rouvert », « codex à part rouvert »)
- Catégorie : 2 · prévu mais pas fait

**1.103** · Geste : supprimer un élément qui porte des notes ou du matériel (évaluation, production, grille, pratique, échelle, cartouche, élève, copie de la corbeille, fusion de copies, pages retirées d'une copie, jetons de reprise, remplacement d'un élément du même nom, réinitialisation d'une séance saisie, « Effacer tout » d'une page annotée, registre longitudinal, résultats du bilan réflexif)
- Intention, l. 366 :
  > si le codex n'est pas à jour, avant la confirmation habituelle : « Mettre ton codex à jour avant de supprimer ? »
- Observation, l. 2851 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > seule la branche « sans codex » a été exécutée.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.104** · Geste : supprimer un élément qui porte des notes ou du matériel (évaluation, production, grille, pratique, échelle, cartouche, élève, copie de la corbeille, fusion de copies, pages retirées d'une copie, jetons de reprise, remplacement d'un élément du même nom, réinitialisation d'une séance saisie, « Effacer tout » d'une page annotée, registre longitudinal, résultats du bilan réflexif)
- Intention, l. 368 :
  > codex à jour : aucune fenêtre, la question habituelle seule
- Observation, l. 2851 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > seule la branche « sans codex » a été exécutée.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.105** · Geste : supprimer un élément qui porte des notes ou du matériel (évaluation, production, grille, pratique, échelle, cartouche, élève, copie de la corbeille, fusion de copies, pages retirées d'une copie, jetons de reprise, remplacement d'un élément du même nom, réinitialisation d'une séance saisie, « Effacer tout » d'une page annotée, registre longitudinal, résultats du bilan réflexif)
- Intention, l. 369 :
  > une séance jamais saisie se réinitialise sans fenêtre ni question
- Observation : aucune mention (termes cherchés : « jamais saisie », « séance non saisie », « sans fenêtre »)
- Catégorie : 2 · prévu mais pas fait

### Écran 7 · Rappel « Mets ton codex à jour »

**1.106** · Geste : « Mettre à jour le codex » dans le rappel
- Intention, l. 384 :
  > lance la même mise à jour que le menu, ou crée un codex si aucun n'est ouvert ; mêmes messages d'échec
- Observation, l. 2837 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Suite de « Mettre à jour le codex »** (rappel de sauvegarde) : la boîte « Confirmer l'export codex » relève de js/codex.js ; non poursuivie (sélecteur de fichier natif).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.107** · Geste : « Mettre à jour le codex » dans le rappel
- Intention, l. 385 :
  > une réussite repousse le rappel du délai choisi dans le sélecteur (14 jours par défaut)
- Observation, l. 2837 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Suite de « Mettre à jour le codex »** (rappel de sauvegarde) : la boîte « Confirmer l'export codex » relève de js/codex.js ; non poursuivie (sélecteur de fichier natif).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.108** · Geste : « Plus tard », ou fermer par la croix
- Intention, l. 389 :
  > repousse le rappel de 14 jours
- Observation, l. 188 (Écran Accueil › Tuiles UTILITAIRES) :
  > **« Plus tard »** (`backupReminder.gererChoixRappel`, js/modal-backup-reminder.js:114-126) — avec « Dans 7 jours » : `+ backupProchainRappel = "2026-10-20T20:50:40.400Z"` (date + 7 j)
- Catégorie : 3 · fait autrement

**1.109** · Geste : choisir « Ne plus rappeler »
- Intention, l. 393 :
  > une mise à jour du codex ne le rallume jamais
- Observation, l. 2837 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Suite de « Mettre à jour le codex »** (rappel de sauvegarde) : la boîte « Confirmer l'export codex » relève de js/codex.js ; non poursuivie (sélecteur de fichier natif).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.110** · Sans geste
- Intention, l. 397 :
  > À l'ouverture de l'application, le rappel s'affiche si sa date est passée
- Observation, l. 192 (Écran Accueil › Tuiles UTILITAIRES) :
  > 1,5 s après chargement, si pas en démo, s'il existe au moins une évaluation (`<trim>_evaluationsSauvegardees`) ou un fichier (`<trim>_fichiersTravaux`)
- Catégorie : 3 · fait autrement

**1.111** · Sans geste
- Intention, l. 397 :
  > après une mise à jour réussie du codex (menu, rappel ou « Il y est »), il ne revient pas avant 14 jours
- Observation, l. 2837 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Suite de « Mettre à jour le codex »** (rappel de sauvegarde) : la boîte « Confirmer l'export codex » relève de js/codex.js ; non poursuivie (sélecteur de fichier natif).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.112** · Sans geste
- Intention, l. 398 :
  > Une date de rappel déjà posée plus loin n'est pas rapprochée par une mise à jour
- Observation, l. 2837 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Suite de « Mettre à jour le codex »** (rappel de sauvegarde) : la boîte « Confirmer l'export codex » relève de js/codex.js ; non poursuivie (sélecteur de fichier natif).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 8 · Témoin « Enregistré » (tous les écrans)

**1.113** · Sans geste (après chaque écriture)
- Intention, l. 404 :
  > un seul témoin, le même partout, dit « Enregistré » après chaque écriture
- Observation, l. 276 (En-tête, Accueil et Aide — éléments communs › Bibliothèques appelées par les modules) :
  > Aucun des gestes de ce module ne l'a affiché (observé à l'exécution).
- Observation, l. 113 (En-tête et navigation globale › Boutons d'action de l'en-tête) :
  > **Écrit** : `preferencesUtilisateur : {} → {"modeClair":false}`
- Catégorie : 3 · fait autrement

**1.114** · Sans geste (après chaque écriture)
- Intention, l. 406 :
  > les gestes qui enregistraient sans rien dire affichent aussi « Enregistré »
- Observation, l. 276 (En-tête, Accueil et Aide — éléments communs › Bibliothèques appelées par les modules) :
  > Aucun des gestes de ce module ne l'a affiché (observé à l'exécution).
- Observation, l. 158 (Écran Accueil › Bannière « Bienvenue dans Labo Codex ! ») :
  > `preferencesUtilisateur.banniereAccueilRepliee : (absent) → true`
- Catégorie : 3 · fait autrement

**1.115** · Sans geste (après chaque écriture)
- Intention, l. 407 :
  > un échec dit « Non enregistré : ‹raison› »
- Observation, l. 276 (En-tête, Accueil et Aide — éléments communs › Bibliothèques appelées par les modules) :
  > « Non enregistré – <geste> : <raison> » avec bouton ×
- Catégorie : 3 · fait autrement

**1.116** · Sans geste (après chaque écriture)
- Intention, l. 407 :
  > « la mémoire du navigateur est pleine. »
- Observation, l. 2725 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › localStorage proche du quota ou plein — observé à l'exécution) :
  > **erreur de page non capturée** : « Failed to execute 'setItem' on 'Storage': Setting the value of 'fsapi_persistance_handles' exceeded the quota. »
- Observation, l. 2725 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › localStorage proche du quota ou plein — observé à l'exécution) :
  > Aucun dialogue, aucune alerte à l'écran.
- Catégorie : 3 · fait autrement

**1.117** · Sans geste (après chaque écriture)
- Intention, l. 407 :
  > reste affiché jusqu'à la prochaine écriture réussie ou jusqu'à ce qu'on le ferme
- Observation : aucune mention (termes cherchés : « jusqu'à la prochaine écriture », « reste affiché »)
- Catégorie : 2 · prévu mais pas fait

**1.118** · Sans geste (après chaque écriture)
- Intention, l. 407 :
  > « le navigateur a refusé l'écriture. »
- Observation : aucune mention (termes cherchés : « a refusé l'écriture », « refusé l'écriture »)
- Catégorie : 2 · prévu mais pas fait

**1.119** · Sans geste (après chaque écriture)
- Intention, l. 407 :
  > « ces données ne correspondent pas au trimestre ouvert. »
- Observation, l. 2981 (Ce qui n'a pas pu être observé › Mécanismes transversaux (stockage, écouteurs globaux)) :
  > Garde `[DB][GARDE #340]` : non déclenchée (aucune écriture de productions d'un autre trimestre au chargement).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.120** · Sans geste (après chaque écriture)
- Intention, l. 409 :
  > pour les grosses données (évaluations, copies), « Enregistré » attend que la donnée soit vraiment écrite
- Observation : aucune mention (termes cherchés : « grosses données », « vraiment écrite », « attend que la donnée »)
- Catégorie : 2 · prévu mais pas fait

**1.121** · Sans geste (après chaque écriture)
- Intention, l. 410 :
  > le témoin s'affiche au-dessus du clavier
- Observation : aucune mention (termes cherchés : « iPad », « clavier », « au-dessus du clavier »)
- Catégorie : 2 · prévu mais pas fait

### Écran 9 · Fenêtres de confirmation de l'application (tous les écrans)

**1.122** · Geste : répondre à une confirmation
- Intention, l. 419 :
  > pas dans les fenêtres grises du navigateur
- Observation, l. 31 (Délégation des événements (mécanisme commun à tous les écrans)) :
  > Si l'élément porte `data-confirm`, le programme affiche d'abord `confirm(...)`
- Observation, l. 2534 (Réglages › reglages-donnees › Bouton « Réinitialiser toutes les données ») :
  > `prompt` « Pour confirmer, tape "EFFACER" en majuscules : »
- Observation, l. 314 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > `confirm` « Clore le trimestre "Trimestre Fictif Hiver Zorglub" ? Un trimestre clos passe en lecture seule et ne peut plus être modifié. Cette action est réversible par le bouton « Rouvrir ». »
- Catégorie : 3 · fait autrement

**1.123** · Geste : répondre à une confirmation
- Intention, l. 419 :
  > confirmations, saisies et messages s'affichent dans des fenêtres de l'application, en mode clair comme sombre, pas dans les fenêtres grises du navigateur
- Observation, l. 2229 (Labo › Modélisation) :
  > Erreur d'import : `alert('Erreur lors de l’importation du fichier.')` (lu dans le code, l. 259-262 ; non exécuté)
- Catégorie : 3 · fait autrement

**1.124** · Geste : répondre à une confirmation
- Intention, l. 419 :
  > confirmations, saisies et messages s'affichent dans des fenêtres de l'application, en mode clair comme sombre, pas dans les fenêtres grises du navigateur
- Observation, l. 2446 (Réglages › reglages-donnees › Bouton « Exporter ma config ») :
  > `alert` « Aucune ressource personnelle à exporter. 2 ressource(s) exclue(s) car elles proviennent du matériel démo ou d'imports de collègues. »
- Catégorie : 3 · fait autrement

**1.125** · Geste : répondre à une confirmation
- Intention, l. 419 :
  > confirmations, saisies et messages s'affichent dans des fenêtres de l'application, en mode clair comme sombre, pas dans les fenêtres grises du navigateur
- Observation, l. 2461 (Réglages › reglages-donnees › Bouton « Ouvrir un Codex… ») :
  > modale `#modalPreviewConfigComplete` « Fichier analysé / Configuration pédagogique partagée
- Observation, l. 2462 (Réglages › reglages-donnees › Bouton « Ouvrir un Codex… ») :
  > Clic « Ajouter à mes bibliothèques » : **Écrit** `a2026_grillesTemplates` (859 → 1 182 car., grille « Grille Fictive Zorglub » ajoutée) et nouvelle clé `a2026_modalitesEvaluation = {"systemeJetons":false,"reprisesAutorisees":false,"nombreArtefacts":0,"pratiqueActive":"sommative"}` (localStorage + IndexedDB) ; `confirm` « Import terminé! Recharger la page pour appliquer les changements? » ; accepté → rechargement complet de la page.
- Catégorie : 3 · fait autrement

**1.126** · Geste : répondre à une confirmation
- Intention, l. 419 :
  > confirmations, saisies et messages s'affichent dans des fenêtres de l'application, en mode clair comme sombre, pas dans les fenêtres grises du navigateur
- Observation, l. 2482 (Réglages › reglages-donnees › Bouton « Recalculer les captures ») :
  > `alert` « Reconstruction terminée! 15 captures reconstruites 15 captures par séance reconstruites »
- Catégorie : 3 · fait autrement

**1.127** · Geste : répondre à une confirmation
- Intention, l. 420 :
  > Entrée fait ce que ferait le bouton qui a le focus
- Observation, l. 274 (En-tête, Accueil et Aide — éléments communs › Bibliothèques appelées par les modules) :
  > boutons « Annuler » (focus initial) et bouton de confirmation ; Échap → `false`, Entrée → `true`
- Catégorie : 3 · fait autrement

### Écran 10 · Numéro de version, bandeau de nouvelle version, fenêtre des Nouveautés

**1.128** · Sans geste (le bandeau)
- Intention, l. 433 :
  > un bandeau orange
- Observation : aucune mention (termes cherchés : « orange », « bandeau orange », « couleur du bandeau »)
- Catégorie : 2 · prévu mais pas fait

**1.129** · Geste : ouvrir les Nouveautés (carte de l'Accueil ou bouton du bandeau)
- Intention, l. 440 :
  > la fenêtre liste les versions, une entrée par version mineure
- Observation, l. 86 (En-tête et navigation globale › Modale Nouveautés) :
  > `#changelog-contenu` vide (le tableau `CHANGELOG` est vide, js/changelog-data.js:3-23)
- Catégorie : 2 · prévu mais pas fait

**1.130** · Geste : ouvrir les Nouveautés (carte de l'Accueil ou bouton du bandeau)
- Intention, l. 441 :
  > les Nouvelles passées sont un historique daté auquel on ne touche pas
- Observation, l. 86 (En-tête et navigation globale › Modale Nouveautés) :
  > `#changelog-contenu` vide (le tableau `CHANGELOG` est vide, js/changelog-data.js:3-23)
- Catégorie : 2 · prévu mais pas fait

### Écran 11 · En-tête › « Soutenir Labo Codex » (le cœur)

**1.131** · Geste : ouvrir la fenêtre « Soutenir Labo Codex »
- Intention, l. 448 :
  > trois blocs cadrés : « Avec ton temps », « Suivre le projet » au-dessus de « Avec tes moyens », le contact (labo@codexnumeris.org) en pied
- Observation : aucune mention (termes cherchés : « Avec ton temps », « Suivre le projet », « Avec tes moyens », « blocs »)
- Catégorie : 2 · prévu mais pas fait

**1.132** · Geste : ouvrir la fenêtre « Soutenir Labo Codex »
- Intention, l. 448 :
  > le bleu ne sert qu'aux liens
- Observation : aucune mention (termes cherchés : « bleu », « couleur des liens »)
- Catégorie : 2 · prévu mais pas fait

**1.133** · Geste : ouvrir la fenêtre « Soutenir Labo Codex »
- Intention, l. 449 :
  > l'abonnement gratuit et l'abonnement de soutien sont deux niveaux du même abonnement, et c'est lui qui finance Labo Codex
- Observation : aucune mention (termes cherchés : « deux niveaux », « même abonnement », « finance »)
- Catégorie : 2 · prévu mais pas fait

**1.134** · Geste : ouvrir la fenêtre « Soutenir Labo Codex »
- Intention, l. 449 :
  > le blogue porte sur « procédures, trucs et astuces de Labo Codex, et des analyses critiques sur la technologie, la pédagogie et l'éducation »
- Observation : aucune mention (termes cherchés : « procédures, trucs et astuces », « analyses critiques »)
- Catégorie : 2 · prévu mais pas fait

### Écran 12 · En-tête › « Signaler un bug ou donner ton avis » (la coccinelle)

**1.135** · Geste : ouvrir la fenêtre
- Intention, l. 459 :
  > le rapport contient une section « DERNIÈRE MISE À JOUR DU CODEX » (heure, étape atteinte, taille, méthode, erreur)
- Observation : aucune mention (termes cherchés : « DERNIÈRE MISE À JOUR DU CODEX », « étape atteinte », « méthode »)
- Catégorie : 2 · prévu mais pas fait

**1.136** · Geste : ouvrir la fenêtre
- Intention, l. 459 :
  > une ligne « Toucher frais »
- Observation : aucune mention (termes cherchés : « Toucher frais »)
- Catégorie : 2 · prévu mais pas fait

**1.137** · Geste : ouvrir la fenêtre
- Intention, l. 460 :
  > la fenêtre des rapports archivés affiche leurs champs comme du texte
- Observation : aucune mention (termes cherchés : « comme du texte », « échappé », « échappement »)
- Catégorie : 2 · prévu mais pas fait

**1.138** · Sans geste
- Intention, l. 463 :
  > Non documenté dans les sources lues.
- Observation, l. 2739 (Ce qui se produit sans geste de l'utilisateur › En-tête, Accueil et Aide) :
  > js/rapport-bug.js remplace `console.error`, `console.warn` et `window.afficherSection` par des enveloppes, et pose des écouteurs `error`, `unhandledrejection` et un `click` en capture qui consignent les 20 derniers clics/erreurs en mémoire
- Observation, l. 2701 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Écouteurs globaux sur) :
  > rapport-bug.js:228, 240 — ajout à la liste interne des 20 dernières erreurs (`[UNCAUGHT] …`, `[PROMISE REJECTED] …`), reprise dans le texte du rapport de bogue (rapport-bug.js:610-625). Aucun affichage immédiat.
- Catégorie : 1 · fait sans être prévu

### Écran 13 · En-tête › menu du cours ou du groupe-cours actif

**1.139** · Geste : choisir un cours ou un groupe-cours dans le menu de l'en-tête
- Intention, l. 469 :
  > ce choix n'est pas un changement de données pour le codex
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.140** · Geste : choisir un cours ou un groupe-cours dans le menu de l'en-tête
- Intention, l. 470 :
  > un cours « (tous groupes) » affiche les élèves de tous ses groupes dans une même liste
- Observation, l. 2943 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > Sélecteur « Filtrer par groupe » avec plusieurs groupes : `obtenirEtudiantsCoursActif` ne retient que le numéro de groupe du groupe-cours actif sauf en « mode cours » multigroupe (lu dans le code, js/modes.js:1141-1158) ; l'état de départ n'a qu'un groupe, le sélecteur reste masqué ; un mode cours se configure dans Cadre, hors périmètre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**1.141** · Geste : choisir un cours ou un groupe-cours dans le menu de l'en-tête
- Intention, l. 471 :
  > l'écran suit la bascule sans quitter l'onglet où l'on est
- Observation : aucune mention (termes cherchés : « sans quitter l'onglet », « onglet où l'on est »)
- Catégorie : 2 · prévu mais pas fait

**1.142** · Sans geste
- Intention, l. 474 :
  > Non documenté dans les sources lues.
- Observation, l. 136 (En-tête et navigation globale › Sélecteur de groupe-cours) :
  > au rechargement suivant, le programme réactive le premier groupe-cours
- Observation, l. 2737 (Ce qui se produit sans geste de l'utilisateur › En-tête, Accueil et Aide) :
  > `#selectGroupeCoursHeader` rempli : « -- Sélectionner -- », optgroup « Groupe-cours » : « 999-FIC-ZZ gr.00001 - Prof F. (Horaire Fictif Lun-Mer) » (sélectionnée), optgroup « Cours (tous groupes) » : « 999-FIC-ZZ » (js/trimestre-v2-orchestre.js:8-95)
- Catégorie : 1 · fait sans être prévu

### Écran 14 · Aide

**1.143** · Geste : lire « Présentation de l'application »
- Intention, l. 480 :
  > il n'y a aucune intelligence artificielle dans l'application
- Observation : aucune mention (termes cherchés : « intelligence artificielle », « gabarit vide », « Présentation de l'application »)
- Catégorie : 2 · prévu mais pas fait

**1.144** · Geste : lire « Présentation de l'application »
- Intention, l. 481 :
  > « Où vont tes données ? Nulle part. »
- Observation : aucune mention (termes cherchés : « Où vont tes données », « Nulle part »)
- Catégorie : 2 · prévu mais pas fait

**1.145** · Geste : lire « Présentation de l'application »
- Intention, l. 482 :
  > « Labo Codex est un commun à construire.
- Observation : aucune mention (termes cherchés : « commun à construire », « son code est ouvert »)
- Catégorie : 2 · prévu mais pas fait

**1.146** · Geste : lire Aide › Codex
- Intention, l. 486 :
  > « Avant de partir, mets à jour le codex sur ta clé USB (Codex → Mettre à jour le codex) »
- Observation : aucune mention (termes cherchés : « Avant de partir », « flux de travail », « Aide › Codex »)
- Catégorie : 2 · prévu mais pas fait

**1.147** · Geste : lire Aide › Codex
- Intention, l. 487 :
  > section « Ton codex est-il à jour ? »
- Observation : aucune mention (termes cherchés : « Ton codex est-il à jour », « un fichier .zip », « fonctions du menu »)
- Catégorie : 2 · prévu mais pas fait

**1.148** · Geste : lire Aide › Codex
- Intention, l. 488 :
  > la question « Codex ou copie de secours : quelle différence ? » est retirée
- Observation : aucune mention (termes cherchés : « copie de secours », « quelle différence »)
- Catégorie : 2 · prévu mais pas fait

**1.149** · Geste : lire Aide › Codex
- Intention, l. 489 :
  > Aide › Codex ne contient que le flux de travail, les fonctions du menu et la section « Ton codex est-il à jour ? »
- Observation : aucune mention (termes cherchés : « Aide › Codex », « Ton codex est-il à jour »)
- Catégorie : 2 · prévu mais pas fait

**1.150** · Geste : lire Aide › Données (« Ouverture et partage de tes données »)
- Intention, l. 493 :
  > deux options, « Exporter ma config » et « Ouvrir un Codex »
- Observation : aucune mention (termes cherchés : « Ouverture et partage de tes données », « Aide › Données », « Pour mettre ton travail en sûreté »)
- Catégorie : 2 · prévu mais pas fait

**1.151** · Geste : lire Aide › Données (« Ouverture et partage de tes données »)
- Intention, l. 494 :
  > « Ton codex est ta seule protection. »
- Observation : aucune mention (termes cherchés : « seule protection », « bonnes pratiques »)
- Catégorie : 2 · prévu mais pas fait

**1.152** · Geste : lire Aide › Données (« Ouverture et partage de tes données »)
- Intention, l. 495 :
  > encadré de la Loi 25
- Observation : aucune mention (termes cherchés : « Loi 25 », « Personne ne met ton codex à jour à ta place »)
- Catégorie : 2 · prévu mais pas fait

**1.153** · Geste : lire Aide › Données (« Ouverture et partage de tes données »)
- Intention, l. 496 :
  > aucun texte de l'application ne dit plus « copie de secours »
- Observation, l. 356 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > Cette action est irréversible (filet : ton backup Codex).
- Catégorie : 3 · fait autrement

**1.154** · Geste : lire Aide › Données (« Ouverture et partage de tes données »)
- Intention, l. 496 :
  > l'Aide ne présente que le codex comme copie de tes données
- Observation : aucune mention (termes cherchés : « copie de tes données », « copie de secours »)
- Catégorie : 2 · prévu mais pas fait

**1.155** · Geste : lire la FAQ « Mes données s'enregistrent-elles toutes seules ? »
- Intention, l. 500 :
  > « Oui, dans l'application. »
- Observation : aucune mention (termes cherchés : « s'enregistrent-elles toutes seules », « Oui, dans l'application »)
- Catégorie : 2 · prévu mais pas fait

**1.156** · Geste : lire le dépannage « Données perdues »
- Intention, l. 504 :
  > solution « Rouvrir ton codex (menu Codex, en haut de l'écran → Ouvrir un codex…) »
- Observation : aucune mention (termes cherchés : « Données perdues », « Rouvrir ton codex »)
- Catégorie : 2 · prévu mais pas fait

**1.157** · Geste : lire le glossaire
- Intention, l. 508 :
  > « Codex » : fichier portable (ZIP) avec toutes tes données
- Observation : aucune mention (termes cherchés : « fichier portable », « Local (stockage) »)
- Catégorie : 2 · prévu mais pas fait

**1.158** · Geste : lire Aide › Prise en main
- Intention, l. 512 :
  > décrit les trois outils réels aux libellés de l'interface
- Observation : aucune mention (termes cherchés : « Prise en main », « trois outils »)
- Catégorie : 2 · prévu mais pas fait

**1.159** · Geste : lancer la visite guidée (bouton de l'en-tête ou menu)
- Intention, l. 516 :
  > l'étape « Conception » reconnaît l'écran des pratiques de notation
- Observation : aucune mention (termes cherchés : « reconnaît l'écran des pratiques de notation », « étape « Conception » »)
- Catégorie : 2 · prévu mais pas fait

**1.160** · Geste : lire les autres pages de l'Aide
- Intention, l. 520 :
  > les exemples tirés de la pratique de Grégoire (601-101, SRPNF, échelle IDME) restent présentés comme des exemples
- Observation : aucune mention (termes cherchés : « exemples tirés de la pratique », « structure du logiciel »)
- Catégorie : 2 · prévu mais pas fait

**1.161** · Geste : lire les autres pages de l'Aide
- Intention, l. 521 :
  > Aide › Exporter et archiver les travaux décrit les trois exports que l'écran offre vraiment
- Observation : aucune mention (termes cherchés : « Aide › Exporter et archiver », « -p1, -p2 », « nommer les pages »)
- Catégorie : 2 · prévu mais pas fait

**1.162** · Geste : lire les autres pages de l'Aide
- Intention, l. 522 :
  > l'Aide décrit les trois types de grille (holistique, analytique, algorithmique) et la note différée
- Observation : aucune mention (termes cherchés : « types de grille », « note différée », « Aide »)
- Catégorie : 2 · prévu mais pas fait

**1.163** · Geste : survoler ou ouvrir l'aide contextuelle
- Intention, l. 527 :
  > l'aide de l'import conseille « Mets toujours ton codex à jour avant un import »
- Observation : aucune mention (termes cherchés : « Mets toujours ton codex à jour », « voyage avec ton codex »)
- Catégorie : 2 · prévu mais pas fait

### Écran 15 · Au chargement de l'application

**1.164** · Sans geste
- Intention, l. 540 :
  > L'application n'écrit rien à l'ouverture sans geste quand rien n'a changé
- Observation, l. 2655 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Chargement avec l'état de base) :
  > **Écrit** : `seancesCompletes_gc_GC_1791898677425_1_64f8c2b31c42` (absent → 6 431 car. : séances datées du 2026-08-24 au 2026-12-09, lundi 08:00-10:00 « A », mercredi 13:00-15:00 « B », `nombrePeriodes 2`) en localStorage et IDB (clé construite par js/horaire.js:22-29). Rien d'autre.
- Observation, l. 2650 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Premier chargement (stockage vide) — observé à l'exécution) :
  > **2e chargement** : seule différence de stockage `preferencesUtilisateur` localStorage `{"accompagnementActif":false}` → `{}` (réécrit depuis IDB par `syncToLocalStorageCache`)
- Catégorie : 3 · fait autrement

**1.165** · Sans geste
- Intention, l. 540 :
  > L'application n'écrit rien à l'ouverture sans geste quand rien n'a changé
- Observation, l. 2799 (Ce qui se produit sans geste de l'utilisateur › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > crée `a2026_interventions = []` si absente
- Catégorie : 3 · fait autrement

**1.166** · Sans geste
- Intention, l. 541 :
  > un cours auquel un champ manque est complété une fois, puis plus jamais
- Observation : aucune mention (termes cherchés : « champ manque », « complété une fois »)
- Catégorie : 2 · prévu mais pas fait

### Fait sans être prévu, sans ligne correspondante dans l'intention

**1.167** · En-tête et navigation globale › Barre de navigation principale
- Intention : aucune mention (termes cherchés : « transition », « Ton espace de travail est prêt », « bandeau de transition »)
- Observation, l. 51 (En-tête et navigation globale › Barre de navigation principale) :
  > Au clic sur Évaluation, le programme affiche le bandeau `#transition-bandeau` « Ton espace de travail est prêt : trimestre, cours, groupe, horaire et pratique sont configurés. Tu peux maintenant saisir les présences et évaluer les productions de tes étudiant·es. »
- Observation, l. 145 (En-tête et navigation globale › Bandeaux de transition) :
  > Bouton « ✕ » (js/transitions.js:120-123) : `preferencesUtilisateur + "transition_num_crois_vue": true` ; le bandeau ne revient pas à la visite suivante
- Catégorie : 1 · fait sans être prévu

**1.168** · En-tête et navigation globale › Barre de navigation principale
- Intention : aucune mention (termes cherchés : « CoP », « aqpc », « barre de navigation »)
- Observation, l. 56 (En-tête et navigation globale › Barre de navigation principale) :
  > **Lien « CoP » `a.nav-bouton-lien`** (index.html:3792) — `href="https://www.aqpc.qc.ca/fr/cop-labocodex"`
- Observation, l. 57 (En-tête et navigation globale › Barre de navigation principale) :
  > un nouvel onglet s'ouvre ; la section active ne change pas
- Catégorie : 1 · fait sans être prévu

**1.169** · En-tête et navigation globale › Navigation mobile (largeur 390 px)
- Intention : aucune mention (termes cherchés : « mobile », « 390 », « navigation mobile », « menu déroulant »)
- Observation, l. 62 (En-tête et navigation globale › Navigation mobile (largeur 390 px)) :
  > À 390 px : `#select-nav-mobile` et `#btn-utilitaires-mobile` visibles
- Observation, l. 63 (En-tête et navigation globale › Navigation mobile (largeur 390 px)) :
  > le gestionnaire s'exécute deux fois par changement
- Observation, l. 64 (En-tête et navigation globale › Navigation mobile (largeur 390 px)) :
  > deux onglets ouverts
- Catégorie : 1 · fait sans être prévu

**1.170** · En-tête et navigation globale › Navigation mobile (largeur 390 px)
- Intention : aucune mention (termes cherchés : « mobile », « sous-navigation mobile »)
- Observation, l. 66 (En-tête et navigation globale › Navigation mobile (largeur 390 px)) :
  > **`#select-sous-nav-mobile`** — `data-on-change` + écouteur direct (js/chrome-unifie.js:87-90, 146-151) → `afficherSousSection(valeur)`
- Catégorie : 1 · fait sans être prévu

**1.171** · En-tête et navigation globale › Navigation mobile (largeur 390 px)
- Intention : aucune mention (termes cherchés : « ⋯ », « popover », « mobile »)
- Observation, l. 68 (En-tête et navigation globale › Navigation mobile (largeur 390 px)) :
  > **Sorties** : `#popover-utilitaires-mobile` perd `u-hide`, `aria-hidden="false"`, bouton `aria-expanded="true"`, focus sur le 1er item « Codex »
- Observation, l. 69 (En-tête et navigation globale › Navigation mobile (largeur 390 px)) :
  > Items (même comportement que les boutons d'en-tête de bureau)
- Catégorie : 1 · fait sans être prévu

**1.172** · En-tête et navigation globale › Boutons d'action de l'en-tête
- Intention : aucune mention (termes cherchés : « Ton prénom », « testeur »)
- Observation, l. 98 (En-tête et navigation globale › Boutons d'action de l'en-tête) :
  > **Champ « Ton prénom » `#prenomTesteur`**
- Observation, l. 98 (En-tête et navigation globale › Boutons d'action de l'en-tête) :
  > À la réouverture, le champ est prérempli
- Catégorie : 1 · fait sans être prévu

**1.173** · En-tête et navigation globale › Boutons d'action de l'en-tête
- Intention : aucune mention (termes cherchés : « gravité », « Gênant », « bloquant »)
- Observation, l. 100 (En-tête et navigation globale › Boutons d'action de l'en-tête) :
  > **Gravité `[data-action=changerGravite]`** (bloquant/normal/mineur, js/rapport-bug.js:719-739) — bouton choisi mis en couleur ; rapport « Gravité: BLOQUANT »
- Observation, l. 96 (En-tête et navigation globale › Boutons d'action de l'en-tête) :
  > gravité « Gênant » présélectionnée
- Catégorie : 1 · fait sans être prévu

**1.174** · En-tête et navigation globale › Boutons d'action de l'en-tête
- Intention : aucune mention (termes cherchés : « Copier le rapport », « Copié »)
- Observation, l. 102 (En-tête et navigation globale › Boutons d'action de l'en-tête) :
  > **« Copier le rapport » `#btnCopierRapport`** (js/rapport-bug.js:922-945) — le texte du rapport est placé dans le presse-papiers ; `+ rapportsBugArchives = [{id:"BUG_…", date, prenom:"Fictif-Zorglub", description, rapport, envoye:true, type:"commentaire"}]` (LS + IDB) ; bouton « Copié ! » 2 s
- Catégorie : 1 · fait sans être prévu

**1.175** · En-tête et navigation globale › Boutons d'action de l'en-tête
- Intention : aucune mention (termes cherchés : « Envoyer par courriel », « mailto », « courriel du rapport »)
- Observation, l. 104 (En-tête et navigation globale › Boutons d'action de l'en-tête) :
  > **« Envoyer par courriel » `#btnEnvoyerCourriel`** (js/rapport-bug.js:1009-1074) — archive un rapport de plus dans `rapportsBugArchives` (2 entrées)
- Catégorie : 1 · fait sans être prévu

**1.176** · En-tête et navigation globale › Menu Codex
- Intention : aucune mention (termes cherchés : « codex data », « Charger un codex »)
- Observation, l. 141 (En-tête et navigation globale › Menu Codex) :
  > « Charger un codex data… »
- Catégorie : 1 · fait sans être prévu

**1.177** · Écran Accueil › Bannière « Bienvenue dans Labo Codex ! »
- Intention : aucune mention (termes cherchés : « replié », « repliée », « état du bandeau »)
- Observation, l. 158 (Écran Accueil › Bannière « Bienvenue dans Labo Codex ! ») :
  > `preferencesUtilisateur.banniereAccueilRepliee : (absent) → true`
- Observation, l. 159 (Écran Accueil › Bannière « Bienvenue dans Labo Codex ! ») :
  > l'état replié est conservé après rechargement
- Catégorie : 1 · fait sans être prévu

**1.178** · Écran Accueil › Tuiles TÂCHES
- Intention : aucune mention (termes cherchés : « Planifier ton cours », « Saisir les présences », « Observer le groupe », « Consulter un profil », « Différencier les interventions »)
- Observation, l. 173 (Écran Accueil › Tuiles TÂCHES) :
  > « Planifier ton cours » → conception/conception-carte
- Observation, l. 174 (Écran Accueil › Tuiles TÂCHES) :
  > « Saisir les présences » → suivi/suivi-saisie
- Observation, l. 175 (Écran Accueil › Tuiles TÂCHES) :
  > « Importer des productions » → evaluations/evaluations-importer
- Observation, l. 176 (Écran Accueil › Tuiles TÂCHES) :
  > « Annoter et évaluer » → evaluations/evaluations-annoter
- Observation, l. 177 (Écran Accueil › Tuiles TÂCHES) :
  > « Observer le groupe » → suivi/suivi-groupe
- Observation, l. 178 (Écran Accueil › Tuiles TÂCHES) :
  > « Consulter un profil » → suivi/suivi-profil
- Observation, l. 179 (Écran Accueil › Tuiles TÂCHES) :
  > « Différencier les interventions » → suivi/suivi-interventions
- Catégorie : 1 · fait sans être prévu

**1.179** · Écran Accueil › Données démo — activation (case cochée)
- Intention : aucune mention (termes cherchés : « guidage », « encart », « Liste des individus »)
- Observation, l. 215 (Écran Accueil › Données démo — activation (case cochée)) :
  > encart de guidage en tête des sous-écrans listés dans js/guidage-demo.js:6-79, ex. suivi-liste : « Liste des individus — Chaque ligne résume un étudiant… »
- Catégorie : 1 · fait sans être prévu

**1.180** · Écran Accueil › Pied de page
- Intention : aucune mention (termes cherchés : « pied de page », « logo »)
- Observation, l. 229 (Écran Accueil › Pied de page) :
  > Logo et lien « codexnumeris.org » : `href="https://codexnumeris.org"`, `target="_blank"`, `rel="noopener noreferrer"` (js/accueil.js:193-196) ; chaque clic ouvre un onglet et émet une requête vers `https://codexnumeris.org/` (bloquée)
- Catégorie : 1 · fait sans être prévu

**1.181** · Écran Aide › Recherche
- Intention : aucune mention (termes cherchés : « recherche dans l'Aide », « occurrence », « rechercher »)
- Observation, l. 240 (Écran Aide › Recherche) :
  > le programme affiche « 29 occurrence(s) dans 10 carte(s) : » puis un bouton par carte
- Catégorie : 1 · fait sans être prévu

**1.182** · Écran Aide › Recherche
- Intention : aucune mention (termes cherchés : « Recherches similaires », « synonyme »)
- Observation, l. 243 (Écran Aide › Recherche) :
  > **Lien de synonyme `[data-action=lancerRechercheSynonyme]`** (`data-prevent`, js/init-inline.js:628-634) — « unistructurel » : le champ prend ce texte, nouvelle recherche « 4 occurrence(s) dans 4 carte(s) »
- Catégorie : 1 · fait sans être prévu

**1.183** · Écran Aide › Recherche
- Intention : aucune mention (termes cherchés : « Ctrl+F », « Cmd+F »)
- Observation, l. 245 (Écran Aide › Recherche) :
  > Ctrl/Cmd+F : focus et sélection du champ (le raccourci du navigateur est empêché)
- Catégorie : 1 · fait sans être prévu

**1.184** · Écran Aide › Accordéons et repliables
- Intention : aucune mention (termes cherchés : « accordéons de l'Aide », « état ouvert », « accordéon »)
- Observation, l. 250 (Écran Aide › Accordéons et repliables) :
  > `etatsAccordeonsV2` (LS + IDB) réécrit avec l'état ouvert/fermé de toutes les cartes
- Observation, l. 251 (Écran Aide › Accordéons et repliables) :
  > l'état ouvert est conservé après rechargement
- Catégorie : 1 · fait sans être prévu

**1.185** · Écran Aide › Sous-écrans (Introduction, Configuration, Formation et démonstration, Utilisation hebdomadaire, Consultation, Référence rapide)
- Intention : aucune mention (termes cherchés : « ellac »)
- Observation, l. 257 (Écran Aide › Sous-écrans (Introduction, Configuration, Formation et démonstration, Utilisation hebdomadaire, Consultation, Référence rapide)) :
  > Lien `https://ellac.ca` (`target="_blank" rel="noopener"`) dans aide-configuration
- Catégorie : 1 · fait sans être prévu

**1.186** · Écran Aide › Sous-écrans (Introduction, Configuration, Formation et démonstration, Utilisation hebdomadaire, Consultation, Référence rapide)
- Intention : aucune mention (termes cherchés : « filtres du glossaire », « Numérisation », « Croisement »)
- Observation, l. 258 (Écran Aide › Sous-écrans (Introduction, Configuration, Formation et démonstration, Utilisation hebdomadaire, Consultation, Référence rapide)) :
  > 7 filtres « Tous, Numérisation, Croisement, Observation, Compétence, Pratiques de notation, Interface »
- Catégorie : 1 · fait sans être prévu

**1.187** · Écran Aide › Sous-écrans (Introduction, Configuration, Formation et démonstration, Utilisation hebdomadaire, Consultation, Référence rapide)
- Intention : aucune mention (termes cherchés : « Référence rapide », « eduq », « V. »)
- Observation, l. 260 (Écran Aide › Sous-écrans (Introduction, Configuration, Formation et démonstration, Utilisation hebdomadaire, Consultation, Référence rapide)) :
  > **Liens externes de Référence rapide** (tous `target="_blank"`)
- Observation, l. 260 (Écran Aide › Sous-écrans (Introduction, Configuration, Formation et démonstration, Utilisation hebdomadaire, Consultation, Référence rapide)) :
  > Clic sur le premier lien eduq.info : nouvel onglet
- Catégorie : 1 · fait sans être prévu

**1.188** · En-tête, Accueil et Aide — éléments communs › Utilitaires globaux déclenchés à l'affichage des sous-écrans
- Intention : aucune mention (termes cherchés : « flèche didactique », « Clique ici pour créer »)
- Observation, l. 267 (En-tête, Accueil et Aide — éléments communs › Utilitaires globaux déclenchés à l'affichage des sous-écrans) :
  > conception-productions « Clique ici pour créer ta première production étudiante. »
- Observation, l. 268 (En-tête, Accueil et Aide — éléments communs › Utilitaires globaux déclenchés à l'affichage des sous-écrans) :
  > la flèche ne revient pas à la visite suivante
- Catégorie : 1 · fait sans être prévu

**1.189** · En-tête, Accueil et Aide — éléments communs › Utilitaires globaux déclenchés à l'affichage des sous-écrans
- Intention : aucune mention (termes cherchés : « Aucune production définie », « Aucune intervention planifiée », « bannière »)
- Observation, l. 269 (En-tête, Accueil et Aide — éléments communs › Utilitaires globaux déclenchés à l'affichage des sous-écrans) :
  > conception-productions « Aucune production définie. Une production, c'est une occasion pour tes étudiant·es de mettre en pratique… »
- Observation, l. 269 (En-tête, Accueil et Aide — éléments communs › Utilitaires globaux déclenchés à l'affichage des sous-écrans) :
  > suivi-interventions « Aucune intervention planifiée.
- Catégorie : 1 · fait sans être prévu

**1.190** · Chargement global, couche de stockage, minuteries et écouteurs transversaux › Code exécuté au chargement par module (hors écrans)
- Intention : aucune mention (termes cherchés : « file: », « Scripts périmés », « fichier local »)
- Observation, l. 2636 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Code exécuté au chargement par module (hors écrans)) :
  > en `file:` seulement, contrôle des builds `init-inline.js`/`main.js` et rechargement unique via `sessionStorage['_monitorage_reload_<build>']` ou bandeau rouge « Scripts périmés … »
- Catégorie : 1 · fait sans être prévu

**1.191** · Chargement global, couche de stockage, minuteries et écouteurs transversaux › Écouteurs globaux sur
- Intention : aucune mention (termes cherchés : « quitter la page », « fermer l'onglet », « beforeunload »)
- Observation, l. 2697 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Écouteurs globaux sur) :
  > codex.js:171 (bloque si Codex actif avec `modificationsDepuis`)
- Catégorie : 1 · fait sans être prévu

**1.192** · Chargement global, couche de stockage, minuteries et écouteurs transversaux › IndexedDB indisponible — observé à l'exécution
- Intention : aucune mention (termes cherchés : « IndexedDB », « localStorage », « stockage indisponible »)
- Observation, l. 2715 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › IndexedDB indisponible — observé à l'exécution) :
  > **Stockage vide** : 52 clés localStorage écrites
- Observation, l. 2715 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › IndexedDB indisponible — observé à l'exécution) :
  > Aucune erreur, aucun dialogue.
- Observation, l. 2717 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › IndexedDB indisponible — observé à l'exécution) :
  > `db.storeBlob(...)` rejette « [DB] IndexedDB requis pour storeBlob »
- Catégorie : 1 · fait sans être prévu

**1.193** · Ce qui se produit sans geste de l'utilisateur › En-tête, Accueil et Aide
- Intention : aucune mention (termes cherchés : « date de l'en-tête », « date du jour »)
- Observation, l. 2737 (Ce qui se produit sans geste de l'utilisateur › En-tête, Accueil et Aide) :
  > `#entete-date` = « mardi 13 octobre 2026 »
- Catégorie : 1 · fait sans être prévu

**1.194** · Ce qui n'a pas pu être observé › En-tête, Accueil et Aide
- Intention : aucune mention (termes cherchés : « Enregistrer en TXT », « TXT », « .txt »)
- Observation, l. 2835 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **« Enregistrer en TXT »** du rapport de bug
- Catégorie : 1 · fait sans être prévu

---

## Partie 2 · Le Cadre

### Introduction de la partie

**2.1**
- Intention, l. 553 :
  > le bouton « + Nouveau… » y occupe la même place dans les six
- Observation : aucune mention (termes cherchés : « même place », « + Nouveau », « position »)
- Catégorie : 2 · prévu mais pas fait

### Écran 16 · Cadre (règles communes à toute la section)

**2.2** · Geste : modifier une fiche existante (trimestre, profil, cours, horaire, groupe-cours, élève)
- Intention, l. 562 :
  > dans une fiche existante, « Annuler » devient « Fermer »
- Observation, l. 400 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > `#v2-btnAnnulerEdition` « Annuler » — js/trimestre-v2-etudiants.js:469 : formulaire remis en ajout
- Catégorie : 3 · fait autrement

**2.3** · Geste : créer une fiche neuve (trimestre, profil, cours ou service, horaire, groupe-cours, élève)
- Intention, l. 568 :
  > pour l'élève « Cet·te étudiant·e n'est pas encore ajouté·e. »), avec « Rester » […] ou « Quitter sans ajouter »
- Observation : aucune mention (termes cherchés : « pas encore ajouté », « Quitter sans ajouter », « Cet·te étudiant·e n'est pas encore »)
- Catégorie : 2 · prévu mais pas fait

**2.4** · Geste : créer une fiche neuve (trimestre, profil, cours ou service, horaire, groupe-cours, élève)
- Intention, l. 568 :
  > ou recharger la page avant le clic demande « Ce cours n'est pas encore créé. »
- Observation, l. 2978 (Ce qui n'a pas pu être observé › Mécanismes transversaux (stockage, écouteurs globaux)) :
  > Dialogue natif `beforeunload` : non déclenché dans Chromium sans tête lors d'un rechargement programmatique (aucune activation utilisateur).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.5** · Geste : créer une fiche neuve (trimestre, profil, cours ou service, horaire, groupe-cours, élève)
- Intention, l. 569 :
  > Safari sur iPad peut ignorer l'avertissement au rechargement
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**2.6** · Sans geste
- Intention, l. 574 :
  > Ouvrir l'application n'écrit rien dans la liste des cours ni dans la liste des trimestres
- Observation, l. 2745 (Ce qui se produit sans geste de l'utilisateur › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > `chargerDropdownCoursV2` vide `listeCours` après fusion dans `cours` et écrit `infoCours` = premier cours si absent (lu js/trimestre-v2-cours.js:50-115)
- Catégorie : 3 · fait autrement

**2.7** · Sans geste
- Intention, l. 575 :
  > Les noms venus d'un import (horaires, profils, locaux de séance) s'affichent tels qu'écrits, même avec des caractères spéciaux
- Observation : aucune mention (termes cherchés : « caractères spéciaux », « échapp », « locaux », « import d'horaires », « import de profils »)
- Catégorie : 2 · prévu mais pas fait

**2.8** · Sans geste
- Intention, l. 576 :
  > Sur iPad en portrait, les formulaires à deux colonnes (le groupe-cours) s'empilent, l'étiquette au-dessus du champ
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

### Écran 17 · Cadre › Trimestre (la fiche du trimestre)

**2.9** · Geste : créer un trimestre
- Intention, l. 582 :
  > « + Nouveau trimestre » (bibliothèque des trimestres) ouvre la fiche du trimestre en création
- Observation, l. 297 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > #### Accordéon « Trimestre »
- Observation, l. 312 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > Aucun trimestre : toast « Aucun trimestre dans la bibliothèque. Clique sur « + Nouveau trimestre » pour en créer un. » (observé). Sinon fenêtre `#modalBibliothequeTrimestres`
- Catégorie : 3 · fait autrement

**2.10** · Geste : créer un trimestre
- Intention, l. 584 :
  > rien ne naît sous un trimestre vide
- Observation, l. 2537 (Réglages › reglages-donnees › Bouton « Réinitialiser toutes les données ») :
  > Recréées par le rechargement : […] nouvelles clés nues `indicesCP`, `calendrierComplet`, `interventions`, `indicesPatternsRaI`, `indicesAssiduite`, `seancesCompletes`
- Catégorie : 3 · fait autrement

**2.11** · Geste : créer un trimestre
- Intention, l. 586 :
  > éditeurs ouverts refermés
- Observation : aucune mention (termes cherchés : « éditeur », « refermé », « fermé », « formulaire ouvert »)
- Catégorie : 2 · prévu mais pas fait

**2.12** · Geste : modifier le nom, la session ou l'année du trimestre
- Intention, l. 595 :
  > sur un trimestre vide, changer la session garde l'année
- Observation, l. 307 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > Un trimestre venant d'être créé porte déjà des clés (`h2027_cadreCalendrier`, `h2027_indices…`) : même refus observé pour h2027 → « Été » (observé)
- Catégorie : 3 · fait autrement

**2.13** · Geste : modifier le nom, la session ou l'année du trimestre
- Intention, l. 597 :
  > corriger la session après avoir saisi les dates donne « Changement bloqué », et le témoin dit quoi faire
- Observation, l. 307 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > témoin « Non enregistré – Identification du trimestre : ce trimestre (« a2026 ») contient des données : changer sa session ou son année les rendrait invisibles. Crée plutôt un nouveau trimestre pour la nouvelle session. »
- Catégorie : 3 · fait autrement

**2.14** · Geste : saisir ou modifier les dates du trimestre (bornes et semaines spéciales)
- Intention, l. 606 :
  > les champs des deux semaines spéciales ne se chevauchent pas
- Observation : aucune mention (termes cherchés : « chevauch », « empil », « Semaines spéciales »)
- Catégorie : 2 · prévu mais pas fait

**2.15** · Geste : réinitialiser les bornes ou les semaines spéciales
- Intention, l. 610 :
  > sont remises à zéro, par le témoin
- Observation : aucune mention (termes cherchés : « témoin », « Enregistré », « réinitialiser »)
- Catégorie : 2 · prévu mais pas fait

**2.16** · Geste : ajouter une journée sans cours (congé, férié, journée personnelle, reprise)
- Intention, l. 615 :
  > reprise facultative partout
- Observation, l. 328 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > change → `majAffichageRepriseV2` masque le bloc reprise pour « Personnel »
- Catégorie : 3 · fait autrement

**2.17** · Geste : ajouter une journée sans cours (congé, férié, journée personnelle, reprise)
- Intention, l. 618 :
  > un férié porte un badge vert « Férié »
- Observation : aucune mention (termes cherchés : « badge », « vert », « Férié »)
- Catégorie : 2 · prévu mais pas fait

**2.18** · Geste : modifier ou supprimer une journée sans cours
- Intention, l. 624 :
  > Données (modifier) : non documenté au-delà de la règle commune.
- Observation, l. 334 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > « Modifier » remplit le formulaire, bouton « Sauvegarder » ; sauvegarde → entrée remplacée (même id), toast « Journée modifiée », avertissements recalculés
- Catégorie : 1 · fait sans être prévu

**2.19** · Geste : modifier ou supprimer une journée sans cours
- Intention, l. 624 :
  > non documenté au-delà de la règle commune
- Observation, l. 334 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > bouton « Sauvegarder » ; sauvegarde → entrée remplacée (même id)
- Catégorie : 3 · fait autrement

**2.20** · Geste : modifier ou supprimer une journée sans cours
- Intention, l. 626 :
  > une journée ouverte en modification se referme si l'on change de trimestre, sans faux « Journée modifiée »
- Observation : aucune mention (termes cherchés : « se referme », « Journée modifiée », « change de trimestre », « formulaire »)
- Catégorie : 2 · prévu mais pas fait

**2.21** · Geste : changer de trimestre actif (menu « Trimestre actif »)
- Intention, l. 630 :
  > éditeurs ouverts (journée sans cours, grille, échelle, cartouche, pratique) refermés
- Observation : aucune mention (termes cherchés : « éditeur », « refermé », « fermé »)
- Catégorie : 2 · prévu mais pas fait

**2.22** · Geste : changer de trimestre actif (menu « Trimestre actif »)
- Intention, l. 633 :
  > le menu se remplit même quand le cours du groupe actif n'est plus dans la bibliothèque de cours
- Observation : aucune mention (termes cherchés : « bibliothèque de cours », « dansBibliotheque », « Retirer de ma sélection »)
- Catégorie : 2 · prévu mais pas fait

**2.23** · Geste : changer de trimestre actif (menu « Trimestre actif »)
- Intention, l. 634 :
  > un trimestre clos rendu actif est en lecture seule, avec le bandeau « LECTURE SEULE » et « Trimestre clos »
- Observation, l. 2839 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Bandeau « LECTURE SEULE — Trimestre clos » `#bandeau-archive`** […] relèvent des trimestres et des exports (autres modules) ; non observés.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.24** · Sans geste
- Intention, l. 638 :
  > importer des élèves, créer un horaire […] coche l'étape ; vider la liste la décoche
- Observation : aucune mention (termes cherchés : « barre », « étape », « bc-complet »)
- Catégorie : 2 · prévu mais pas fait

**2.25** · Sans geste
- Intention, l. 640 :
  > Un trimestre en double dans la liste n'apparaît qu'une fois ; deux trimestres de même nom et d'identifiants différents restent deux trimestres ; la liste n'est pas réécrite à la lecture
- Observation : aucune mention (termes cherchés : « en double », « doublon », « même nom », « réécrite »)
- Catégorie : 2 · prévu mais pas fait

**2.26** · Sans geste
- Intention, l. 641 :
  > Les compteurs de semaines et de jours de cours de Cadre › Trimestre et ceux du Calendrier scolaire disent le même calcul
- Observation, l. 421 (Cadre › calendrier-trimestre › Accordéon « Horaire ») :
  > `a2026_calendrierComplet` régénéré : statuts `cours` 32
- Observation, l. 422 (Cadre › calendrier-trimestre › Accordéon « Horaire ») :
  > l'encart du trimestre affiche encore « 80 jours de cours » jusqu'au rechargement de l'écran (observé)
- Catégorie : 3 · fait autrement

**2.27** · Sans geste
- Intention, l. 645 :
  > quand un nouveau calendrier change la semaine d'une production, l'application le signale, sans déplacer l'échéance
- Observation : aucune mention (termes cherchés : « semaine d'une production », « échéance », « signale », « semaine »)
- Catégorie : 2 · prévu mais pas fait

### Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres)

**2.28** · Geste : ouvrir un trimestre depuis la bibliothèque
- Intention, l. 658 :
  > un trimestre clos s'ouvre en lecture seule
- Observation, l. 312 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > section « Trimestres clos » : [Rouvrir] + ⋮ [Archiver le trimestre…] [Archiver les copies…] [Renvoyer aux archives…] [Supprimer…]
- Catégorie : 2 · prévu mais pas fait

**2.29** · Geste : ouvrir un trimestre depuis la bibliothèque
- Intention, l. 659 :
  > « ouvre-le depuis la bibliothèque des trimestres »
- Observation : aucune mention (termes cherchés : « ouvre-le », « ouvre-le depuis la bibliothèque »)
- Catégorie : 2 · prévu mais pas fait

**2.30** · Geste : clore un trimestre
- Intention, l. 666 :
  > l'aide « Qu'est-ce que clore un trimestre ? » dit « Clore ne libère aucun espace »
- Observation : aucune mention (termes cherchés : « Qu'est-ce que clore », « libère », « aide »)
- Catégorie : 2 · prévu mais pas fait

**2.31** · Geste : clore un trimestre
- Intention, l. 667 :
  > « Clore » et « Rouvrir » parlent encore par les fenêtres du navigateur
- Observation, l. 315 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > « Rouvrir » (`desarchiverTrimestre`, js/trimestres.js:706, appelé directement) : `archive:false`, `dateFin` retiré (snapshot conservé) ; aucun message
- Catégorie : 3 · fait autrement

**2.32** · Geste : rouvrir un trimestre clos
- Intention, l. 673 :
  > « Rouvrir le trimestre « … » ? »
- Observation, l. 315 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > « Rouvrir » (`desarchiverTrimestre`, js/trimestres.js:706, appelé directement) : `archive:false`, `dateFin` retiré (snapshot conservé) ; aucun message
- Catégorie : 3 · fait autrement

**2.33** · Geste : rouvrir un trimestre clos
- Intention, l. 673 :
  > infobulle « Rouvrir pour permettre les modifications »
- Observation : aucune mention (termes cherchés : « Rouvrir pour permettre », « infobulle », « title »)
- Catégorie : 2 · prévu mais pas fait

**2.34** · Geste : supprimer un trimestre (« Supprimer… »)
- Intention, l. 684 :
  > quand la mémoire du navigateur est pleine, le message renvoie à Cadre › Trimestre › Bibliothèque, « Supprimer… »
- Observation, l. 2725 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › localStorage proche du quota ou plein — observé à l'exécution) :
  > Aucun dialogue, aucune alerte à l'écran.
- Catégorie : 2 · prévu mais pas fait

**2.35** · Geste : supprimer un trimestre (« Supprimer… »)
- Intention, l. 685 :
  > les fichiers des copies du trimestre partent avec lui
- Observation : aucune mention (termes cherchés : « fichiers », « copies », « fichiersTravaux », « magasin `fichiers` »)
- Catégorie : 2 · prévu mais pas fait

**2.36** · Geste : archiver un trimestre clos (« Archiver le trimestre… »)
- Intention, l. 691 :
  > refusé pour un trimestre non clos, sans rien télécharger
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.37** · Geste : archiver un trimestre clos (« Archiver le trimestre… »)
- Intention, l. 692 :
  > une archive du trimestre entier, hors du navigateur et hors du codex
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.38** · Geste : archiver un trimestre clos (« Archiver le trimestre… »)
- Intention, l. 693 :
  > fenêtre « Archiver ‹trimestre› ? »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.39** · Geste : archiver un trimestre clos (« Archiver le trimestre… »)
- Intention, l. 694 :
  > un fichier « archive-‹trimestre›-trimestre-‹date›.zip »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.40** · Geste : archiver un trimestre clos (« Archiver le trimestre… »)
- Intention, l. 695 :
  > refus « Seul un trimestre clos peut être archivé. Clos-le d'abord. »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.41** · Geste : archiver un trimestre clos (« Archiver le trimestre… »)
- Intention, l. 696 :
  > l'archive paraît dans Réglages › Données › Archives, colonne Cours « Trimestre entier », « Non vérifiée »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.42** · Geste : archiver un trimestre clos (« Archiver le trimestre… »)
- Intention, l. 697 :
  > si les copies du trimestre sont aux archives, refus « Trimestre non archivé »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.43** · Geste : archiver un trimestre clos (« Archiver le trimestre… »)
- Intention, l. 698 :
  > « Archiver », puis « Confirmer l'export… » qui liste le contenu
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.44** · Geste : archiver un trimestre clos (« Archiver le trimestre… »)
- Intention, l. 699 :
  > dans Chrome, une nouvelle archive du même trimestre met de côté, sans les effacer, les copies de l'archive précédente
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.45** · Geste : renvoyer un trimestre aux archives (« Renvoyer aux archives… »)
- Intention, l. 703 :
  > retire de l'application un trimestre clos
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.46** · Geste : renvoyer un trimestre aux archives (« Renvoyer aux archives… »)
- Intention, l. 704 :
  > au moment du geste, l'archive est relue en entier, contenu de chaque copie compris
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.47** · Geste : renvoyer un trimestre aux archives (« Renvoyer aux archives… »)
- Intention, l. 705 :
  > juste avant le premier retrait, chaque donnée est recomparée
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.48** · Geste : renvoyer un trimestre aux archives (« Renvoyer aux archives… »)
- Intention, l. 706 :
  > aucun codex n'est exigé : l'archive vérifiée et identique est le filet
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.49** · Geste : renvoyer un trimestre aux archives (« Renvoyer aux archives… »)
- Intention, l. 707 :
  > infobulle « Retirer ce trimestre de l'application : son archive vérifiée le garde »
- Observation : aucune mention (termes cherchés : « Retirer ce trimestre de l'application », « infobulle », « title »)
- Catégorie : 2 · prévu mais pas fait

**2.50** · Geste : renvoyer un trimestre aux archives (« Renvoyer aux archives… »)
- Intention, l. 708 :
  > fenêtre « Renvoyer [trimestre] aux archives ? »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.51** · Geste : renvoyer un trimestre aux archives (« Renvoyer aux archives… »)
- Intention, l. 709 :
  > trimestre changé : « [trimestre] a changé depuis son archive »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.52** · Geste : renvoyer un trimestre aux archives (« Renvoyer aux archives… »)
- Intention, l. 710 :
  > bilan « [trimestre] est renvoyé aux archives »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.53** · Geste : renvoyer un trimestre aux archives (« Renvoyer aux archives… »)
- Intention, l. 711 :
  > interrompu : « Renvoi inachevé »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.54** · Geste : renvoyer un trimestre aux archives (« Renvoyer aux archives… »)
- Intention, l. 712 :
  > refus, titre « Trimestre non renvoyé »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.55** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 716 :
  > retire de l'application les fichiers des copies (travail et corbeille) et leurs vignettes
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.56** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 717 :
  > refuse ce que « Renvoyer aux archives » refuse
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.57** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 718 :
  > la copie d'un·e étudiant·e supprimé·e reste dans l'application
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.58** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 719 :
  > fenêtre « Archiver les copies de [trimestre] ? »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.59** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 720 :
  > bilan « Les copies de [trimestre] sont aux archives »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.60** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 721 :
  > copies changées : « Des copies de [trimestre] ont changé depuis son archive »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.61** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 722 :
  > interrompu : « Archivage des copies inachevé »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.62** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 723 :
  > une copie aux archives : la visionneuse et l'export du PDF annoté disent « Cette copie est aux archives.
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.63** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 724 :
  > la copie précédente ne reste pas affichée quand on ouvre une copie aux archives
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.64** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 725 :
  > l'éditeur de pages, « Fusionner » et l'ajout à une fusion sont refusés pour une copie sans fichier
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.65** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 726 :
  > le codex n'attend pas ces copies
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.66** · Geste : archiver les copies d'un trimestre clos (« Archiver les copies… »)
- Intention, l. 727 :
  > les annotations ne sont jamais promises visibles sans leur copie
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève

**2.67** · Geste : ajouter un·e étudiant·e (formulaire)
- Intention, l. 741 :
  > le champ DA porte l'astérisque ; l'iPad ouvre le clavier des chiffres
- Observation : aucune mention (termes cherchés : « astérisque », « DA * », « inputmode », « clavier »)
- Catégorie : 2 · prévu mais pas fait

**2.68** · Geste : ajouter un·e étudiant·e (formulaire)
- Intention, l. 742 :
  > un groupe qui reçoit son premier élève paraît aussitôt dans « Groupe associé » d'un horaire ouvert et à l'étape 3 du groupe-cours
- Observation : aucune mention (termes cherchés : « Groupe associé », « aussitôt », « étape 3 »)
- Catégorie : 2 · prévu mais pas fait

**2.69** · Geste : ouvrir et modifier la fiche d'un·e élève (menu « Action », « Modifier »)
- Intention, l. 746 :
  > ouvrir directement une autre fiche ne perd pas ce qu'on vient de taper
- Observation : aucune mention (termes cherchés : « autre fiche », « perd », « Modifier »)
- Catégorie : 2 · prévu mais pas fait

**2.70** · Geste : ouvrir et modifier la fiche d'un·e élève (menu « Action », « Modifier »)
- Intention, l. 750 :
  > « Mesure d'aide » (ancien « CAF ») dit un fait administratif
- Observation : aucune mention (termes cherchés : « Mesure d'aide », « mesure »)
- Catégorie : 2 · prévu mais pas fait

**2.71** · Geste : ouvrir et modifier la fiche d'un·e élève (menu « Action », « Modifier »)
- Intention, l. 752 :
  > l'assiduité se compte à partir de cette date, les séances d'avant ne sont pas des absences
- Observation : aucune mention (termes cherchés : « dateArrivee », « arrivée », « absences »)
- Catégorie : 2 · prévu mais pas fait

**2.72** · Geste : ouvrir et modifier la fiche d'un·e élève (menu « Action », « Modifier »)
- Intention, l. 752 :
  > effacer la date la retire
- Observation : aucune mention (termes cherchés : « dateArrivee », « arrivée », « effacer »)
- Catégorie : 2 · prévu mais pas fait

**2.73** · Geste : ouvrir et modifier la fiche d'un·e élève (menu « Action », « Modifier »)
- Intention, l. 754 :
  > « Rattaché·e à aucun cours. »
- Observation : aucune mention (termes cherchés : « Rattaché·e à aucun », « aucun cours »)
- Catégorie : 2 · prévu mais pas fait

**2.74** · Geste : ouvrir et modifier la fiche d'un·e élève (menu « Action », « Modifier »)
- Intention, l. 755 :
  > « Fermer » ramène au formulaire d'ajout
- Observation, l. 400 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > `#v2-btnAnnulerEdition` « Annuler » — js/trimestre-v2-etudiants.js:469 : formulaire remis en ajout
- Catégorie : 3 · fait autrement

**2.75** · Geste : corriger un DA mal tapé (« Corriger le DA… »)
- Intention, l. 759 :
  > les jugements de dénotation
- Observation, l. 404 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > Console : avertissement « cle('jugementsDenotation') : clé ABSENTE des registres … » (observé).
- Catégorie : 3 · fait autrement

**2.76** · Geste : corriger un DA mal tapé (« Corriger le DA… »)
- Intention, l. 759 :
  > ainsi que les jetons
- Observation : aucune mention (termes cherchés : « jetonsEtudiants », « jetons », « Corriger le DA »)
- Catégorie : 2 · prévu mais pas fait

**2.77** · Geste : corriger un DA mal tapé (« Corriger le DA… »)
- Intention, l. 759 :
  > l'entrée au suivi longitudinal
- Observation : aucune mention (termes cherchés : « registreLongitudinal », « longitudinal », « Corriger le DA »)
- Catégorie : 2 · prévu mais pas fait

**2.78** · Geste : corriger un DA mal tapé (« Corriger le DA… »)
- Intention, l. 760 :
  > un échec en route ne laisse ni doublon ni perte
- Observation : aucune mention (termes cherchés : « échec », « en route », « doublon », « interrompu »)
- Catégorie : 2 · prévu mais pas fait

**2.79** · Geste : corriger un DA mal tapé (« Corriger le DA… »)
- Intention, l. 762 :
  > refus d'un DA qui n'a pas sept chiffres
- Observation : aucune mention (termes cherchés : « sept chiffres », « Corriger le DA », « invalide »)
- Catégorie : 2 · prévu mais pas fait

**2.80** · Geste : poser une remarque sur un·e élève (menu « Remarque »)
- Intention, l. 768 :
  > celle d'« Action » dit « Choisir… »
- Observation : aucune mention (termes cherchés : « Choisir… », « Choisir », « Action »)
- Catégorie : 2 · prévu mais pas fait

**2.81** · Geste : supprimer un·e élève (menu « Action », « Supprimer »)
- Intention, l. 774 :
  > un ancien fichier ouvert par « Ouvrir un Codex… » ne ramène plus rien de lui
- Observation : aucune mention (termes cherchés : « elevesDesinscrits », « Ouvrir un Codex », « désinscrit »)
- Catégorie : 2 · prévu mais pas fait

**2.82** · Geste : supprimer un·e élève (menu « Action », « Supprimer »)
- Intention, l. 775 :
  > réinscrit avec le même DA par le formulaire du Cadre, l'élève redevient un élève comme un autre et revient avec tout
- Observation : aucune mention (termes cherchés : « réinscrit », « elevesDesinscrits », « même DA »)
- Catégorie : 2 · prévu mais pas fait

**2.83** · Geste : supprimer un·e élève (menu « Action », « Supprimer »)
- Intention, l. 776 :
  > un élève supprimé avant le 2 oct. 2026 n'a pas laissé de trace et reste visible ; rien n'est réparé
- Observation : aucune mention (termes cherchés : « elevesDesinscrits », « trace », « 2 oct »)
- Catégorie : 2 · prévu mais pas fait

**2.84** · Geste : supprimer un·e élève (menu « Action », « Supprimer »)
- Intention, l. 777 :
  > si le codex n'est pas à jour, avant elle : « Mettre ton codex à jour avant de supprimer ? » avec « Annuler », « Supprimer sans mettre à jour », « Mettre à jour, puis supprimer »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, […]) : […] ; non exécutées.
- Observation, l. 399 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > « Supprimer » → boîte « Écrire un codex avant de supprimer ? Supprimer la fiche de cet·te étudiant·e l'efface pour de bon. … » → « Supprimer sans codex »
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.85** · Geste : supprimer un·e élève (menu « Action », « Supprimer »)
- Intention, l. 778 :
  > ses copies quittent la Liste des évaluations (le compte baisse d'autant), « Annoter et évaluer » et « Exporter et archiver » ; l'export pour Léa, l'export pour la recherche et les seuils « en attente » du tableau de bord l'écartent
- Observation : aucune mention (termes cherchés : « elevesDesinscrits », « désinscrit », « supprimé », « écart »)
- Catégorie : 2 · prévu mais pas fait

**2.86** · Geste : créer un groupe (« + Nouveau groupe »)
- Intention, l. 783 :
  > taper un numéro déjà pris choisit ce groupe
- Observation : aucune mention (termes cherchés : « numéro déjà pris », « déjà », « Nouveau groupe »)
- Catégorie : 2 · prévu mais pas fait

**2.87** · Geste : choisir un groupe (menu « Groupe »)
- Intention, l. 788 :
  > tri par numéro, puis par cours
- Observation : aucune mention (termes cherchés : « tri », « trié », « ordre »)
- Catégorie : 2 · prévu mais pas fait

**2.88** · Geste : choisir un groupe (menu « Groupe »)
- Intention, l. 788 :
  > une fiche sans cours forme « ‹numéro› · sans cours »
- Observation : aucune mention (termes cherchés : « · sans cours », « sans cours »)
- Catégorie : 2 · prévu mais pas fait

**2.89** · Geste : supprimer un groupe (« Supprimer un groupe… »)
- Intention, l. 794 :
  > le bouton devient « Supprimer le groupe ‹numéro› » quand un groupe est choisi
- Observation, l. 410 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > bouton « Supprimer le groupe 00001 · 999-FIC-ZZ »
- Catégorie : 3 · fait autrement

**2.90** · Geste : vider la liste (« Vider la liste »)
- Intention, l. 801 :
  > la barre d'étapes décoche l'étape
- Observation : aucune mention (termes cherchés : « barre », « étape », « bc-complet »)
- Catégorie : 2 · prévu mais pas fait

**2.91** · Geste : importer des étudiant·es (coller ou déposer un fichier)
- Intention, l. 806 :
  > espaces retirés avant de juger
- Observation : aucune mention (termes cherchés : « espaces », « trim », « DA »)
- Catégorie : 2 · prévu mais pas fait

**2.92** · Geste : importer des étudiant·es (coller ou déposer un fichier)
- Intention, l. 808 :
  > l'ancienne colonne « CAF » est lue comme « Mesure d'aide »
- Observation, l. 385 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > colonnes DA, Groupe, Nom, Prénom, Programme, (vide), SA
- Catégorie : 2 · prévu mais pas fait

**2.93** · Geste : importer des étudiant·es (coller ou déposer un fichier)
- Intention, l. 809 :
  > les lignes refusées sont grisées, avec « DA manquant », « DA invalide » ou « Déjà inscrit·e ce trimestre » dans une colonne « À l'import » ; « ‹N› lignes ne seront pas importées. Le DA est celui du collège : sept chiffres, rien d'autre. »
- Observation, l. 385 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > lignes de moins de 4 colonnes ignorées
- Observation, l. 387 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > ligne à 2 colonnes absente
- Catégorie : 3 · fait autrement

**2.94** · Geste : importer des étudiant·es (coller ou déposer un fichier)
- Intention, l. 810 :
  > ou « Aucune ligne à importer » et reste inactif
- Observation : aucune mention (termes cherchés : « Aucune ligne à importer », « inactif », « disabled »)
- Catégorie : 2 · prévu mais pas fait

**2.95** · Geste : importer des étudiant·es (coller ou déposer un fichier)
- Intention, l. 811 :
  > huit au plus, puis « et N autres »
- Observation : aucune mention (termes cherchés : « et N autres », « autres », « huit »)
- Catégorie : 2 · prévu mais pas fait

**2.96** · Geste : exporter la liste
- Intention, l. 816 :
  > un fichier de la liste du groupe affiché
- Observation, l. 412 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > `a2026_groupeEtudiants` (toutes les fiches, sans tenir compte du filtre)
- Catégorie : 3 · fait autrement

**2.97** · Geste : exporter la liste
- Intention, l. 816 :
  > avec les colonnes du tableau (DA, groupe, nom, prénom, SA, remarque)
- Observation, l. 412 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > en-tête `DA,Groupe,Nom,Prénom,Programme,SA`
- Catégorie : 3 · fait autrement

**2.98** · Sans geste
- Intention, l. 820 :
  > En mode anonymisation, la liste affiche les pseudonymes ; l'identité (DA, nom, prénom) n'est pas modifiable
- Observation : aucune mention (termes cherchés : « anonymis », « pseudonyme », « Élève 1 »)
- Catégorie : 2 · prévu mais pas fait

**2.99** · Sans geste
- Intention, l. 821 :
  > son en-tête se lit en mode clair, blanc sur bleu foncé
- Observation : aucune mention (termes cherchés : « bleu », « blanc », « couleur », « en-tête du tableau »)
- Catégorie : 2 · prévu mais pas fait

### Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours)

**2.100** · Geste : créer un cours ou un service (« + Nouveau cours »)
- Intention, l. 830 :
  > deux services de même nom ne sont pas des doublons
- Observation : aucune mention (termes cherchés : « même nom », « deux services », « doublon », « Service Fictif Zorglub »)
- Catégorie : 2 · prévu mais pas fait

**2.101** · Geste : créer un cours ou un service (« + Nouveau cours »)
- Intention, l. 832 :
  > le choix par défaut du menu « Nature » ne suit pas le contexte actif
- Observation : aucune mention (termes cherchés : « Nature », « par défaut », « contexte actif », « v2-natureCours »)
- Catégorie : 2 · prévu mais pas fait

**2.102** · Geste : modifier un cours ou un service
- Intention, l. 838 :
  > donner à une fiche le code d'une autre pose « Donner quand même ce code à cette fiche ? »
- Observation : aucune mention (termes cherchés : « Donner quand même », « code d'une autre », « codeCours », « doublon de code »)
- Catégorie : 2 · prévu mais pas fait

**2.103** · Geste : modifier un cours ou un service
- Intention, l. 841 :
  > le formulaire dit « Modifier le service », […], « Aucun service sélectionné », « Service : » et « Sélectionner un service... »
- Observation : aucune mention (termes cherchés : « Modifier le service », « Aucun service sélectionné », « Sélectionner un service », « Service : »)
- Catégorie : 2 · prévu mais pas fait

**2.104** · Geste : modifier un cours ou un service
- Intention, l. 842 :
  > enregistrer un cours refait le menu, la carte et l'en-tête des groupes-cours
- Observation : aucune mention (termes cherchés : « refait », « en-tête », « selectGroupeCoursHeader », « carte du groupe-cours », « sauvegarderChampCoursV2 »)
- Catégorie : 2 · prévu mais pas fait

**2.105** · Geste : dupliquer un cours ou un service
- Intention, l. 847 :
  > crée une nouvelle fiche, cours ou service, avec les mêmes champs, sous un nom qui la distingue
- Observation : aucune mention (termes cherchés : « Dupliquer », « dupliquer », « copie », « Cours et services »)
- Catégorie : 2 · prévu mais pas fait

**2.106** · Geste : dupliquer un cours ou un service
- Intention, l. 848 :
  > sur un service, le formulaire dit « Dupliquer le service »
- Observation : aucune mention (termes cherchés : « Dupliquer le service », « Dupliquer », « dupliquerCours »)
- Catégorie : 2 · prévu mais pas fait

**2.107** · Geste : supprimer une fiche de cours (bouton « Supprimer » du formulaire, ou Bibliothèque › ⋮ › « Supprimer la fiche »)
- Intention, l. 852 :
  > avec ses groupes-cours vides
- Observation : aucune mention (termes cherchés : « groupes-cours vides », « groupesCours », « supprimerCoursV2 », « supprimerFicheCours »)
- Catégorie : 2 · prévu mais pas fait

**2.108** · Geste : supprimer une fiche de cours (bouton « Supprimer » du formulaire, ou Bibliothèque › ⋮ › « Supprimer la fiche »)
- Intention, l. 854 :
  > puis « Fiche supprimée (tous trimestres) »
- Observation, l. 356 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > toast « Cours supprimé 999-FIC-ZZ - Cours Fictif de Zorglubologie avancée »
- Catégorie : 3 · fait autrement

**2.109** · Geste : gérer une fiche dans la Bibliothèque de cours (menu ⋮)
- Intention, l. 862 :
  > le cours actif ne change pas
- Observation, l. 359 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > `cours[i].dansBibliotheque` true → false, `actif` → false
- Catégorie : 3 · fait autrement

**2.110** · Geste : reprendre un cours dans ce trimestre (« Reprendre dans ce trimestre »)
- Intention, l. 867 :
  > ouvre un groupe-cours neuf, ce cours présélectionné
- Observation, l. 361 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > cours ayant déjà un groupe-cours dans a2026 → toast « 999-FIC-ZZ a déjà un groupe-cours dans Trimestre Fictif Zorglub. » ; seule écriture : `etatsAccordeonsV2`
- Catégorie : 3 · fait autrement

### Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil »)

**2.111** · Geste : créer un profil (« + Nouveau profil »)
- Intention, l. 881 :
  > question de sortie « Ce profil n'est pas encore créé. »
- Observation : aucune mention (termes cherchés : « Ce profil n'est pas encore créé », « pas encore créé », « Quitter sans créer », « fermerFicheEnseignantV2 »)
- Catégorie : 2 · prévu mais pas fait

**2.112** · Geste : modifier un profil
- Intention, l. 887 :
  > modifier le profil d'un collègue ne fait plus de lui « mon profil »
- Observation : aucune mention (termes cherchés : « collègue », « profilEnseignant », « second profil », « mon profil »)
- Catégorie : 2 · prévu mais pas fait

**2.113** · Geste : modifier un profil
- Intention, l. 889 :
  > tant que rien n'est sélectionné, un message guide vers « + Nouveau profil » au lieu d'un formulaire vide
- Observation : aucune mention (termes cherchés : « Nouveau profil », « état vide », « rien n'est sélectionné », « Aucun profil »)
- Catégorie : 2 · prévu mais pas fait

**2.114** · Geste : modifier un profil
- Intention, l. 890 :
  > l'identité d'auteur·e d'un document partagé (nom, discipline, institution, courriel) vient de ce profil
- Observation, l. 373 (Cadre › calendrier-trimestre › Accordéon « Enseignant·e ») :
  > discipline:"105 Culture scientifique et technologique"
- Observation, l. 1262 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Exporter toutes mes pratiques (JSON) ») :
  > `profilEnseignant`/`enseignants`, `infoCours` (préremplissage)
- Observation, l. 1263 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Exporter toutes mes pratiques (JSON) ») :
  > Discipline(s) « 101 Biologie »
- Catégorie : 3 · fait autrement

**2.115** · Geste : modifier un profil
- Intention, l. 890 :
  > sans profil, l'auteur par défaut est « Utilisateur de Labo Codex »
- Observation : aucune mention (termes cherchés : « Utilisateur de Labo Codex », « auteur par défaut », « sans profil »)
- Catégorie : 2 · prévu mais pas fait

**2.116** · Geste : supprimer un profil
- Intention, l. 896 :
  > supprimer le profil marqué « mon profil » efface aussi cette marque ; il ne revient pas au chargement suivant
- Observation : aucune mention (termes cherchés : « profilEnseignant », « mon profil », « supprimerProfilEnseignantV2 », « chargement suivant »)
- Catégorie : 2 · prévu mais pas fait

**2.117** · Geste : supprimer un profil
- Intention, l. 897 :
  > avant de supprimer un profil ou un horaire, la question nomme les groupes-cours qui l'emploient
- Observation, l. 426 (Cadre › calendrier-trimestre › Accordéon « Horaire ») :
  > `confirm` « Supprimer l'horaire "Horaire Fictif Lun-Mer" ? Cette action est irréversible. »
- Observation, l. 426 (Cadre › calendrier-trimestre › Accordéon « Horaire ») :
  > le groupe-cours `a2026_groupesCours[0].horaireId` garde l'id de l'horaire supprimé
- Catégorie : 3 · fait autrement

**2.118** · Sans geste
- Intention, l. 901 :
  > Quand le contexte actif est un service d'orthopédagogie, le Cadre dit « Orthopédagogue » là où il dit « Enseignant·e »
- Observation, l. 352 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > Activation → toast « Service d’orthopédagogie activé Service Fictif Zorglub » ; les libellés `[data-mot-nature]` de l'écran restent « Cours / Enseignant·e »
- Catégorie : 3 · fait autrement

**2.119** · Sans geste
- Intention, l. 902 :
  > Le premier choix du menu des profils dit « Sélectionner un·e orthopédagogue » sur un service, « Sélectionner un enseignant·e » sur un cours
- Observation : aucune mention (termes cherchés : « Sélectionner un·e orthopédagogue », « Sélectionner un enseignant·e », « v2-selectEnseignant », « premier choix »)
- Catégorie : 2 · prévu mais pas fait

### Écran 22 · Cadre › Trimestre › Horaire

**2.120** · Geste : créer un horaire (« + Nouvel horaire »)
- Intention, l. 909 :
  > l'application ne convertit jamais une durée en périodes
- Observation, l. 527 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Champ durée) :
  > planificateur : pastille « 1,8 pér. » pour la leçon A (90 min / 50 min par période)
- Observation, l. 763 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Planificateur — dates du trimestre, invitation et jauge) :
  > Avec un total non nul, texte « Total planifié : N pér. (≈ H h) », suffixe « / H h au cadre »
- Catégorie : 3 · fait autrement

**2.121** · Geste : créer un horaire (« + Nouvel horaire »)
- Intention, l. 911 :
  > deux groupes qui ont cours le même jour à des heures différentes gardent leurs deux séances, au calendrier comme à la saisie des présences
- Observation : aucune mention (termes cherchés : « même jour », « deux séances », « deux horaires », « horaireHebdo »)
- Catégorie : 2 · prévu mais pas fait

**2.122** · Geste : créer un horaire (« + Nouvel horaire »)
- Intention, l. 912 :
  > le bouton « Supprimer » paraît aussitôt
- Observation : aucune mention (termes cherchés : « Supprimer », « v2-btnSupprimerHoraire », « aussitôt », « Modifier l'horaire »)
- Catégorie : 2 · prévu mais pas fait

**2.123** · Geste : créer un horaire (« + Nouvel horaire »)
- Intention, l. 913 :
  > « séance 1 : heure de début manquante. Sans elle, la durée de la séance ne peut pas être calculée ; c'est cette durée qui sert à l'assiduité. » (et l'heure de fin, les périodes)
- Observation, l. 420 (Cadre › calendrier-trimestre › Accordéon « Horaire ») :
  > périodes vides → « séance 1 : nombre de périodes manquant. C'est lui qui compte au dénominateur de l'assiduité ; il ne se déduit pas des heures, puisqu'une période comprend sa pause. »
- Observation, l. 420 (Cadre › calendrier-trimestre › Accordéon « Horaire ») :
  > fin vide → « séance 2 : heure de fin manquante. Elle situe la séance dans la journée. »
- Catégorie : 3 · fait autrement

**2.124** · Geste : créer un horaire (« + Nouvel horaire »)
- Intention, l. 915 :
  > une séance remplie se lit « 08:00 à 10:00 · 2 pér. · Local », le mot « pér. » hors de la case ; jour, heures, périodes et local sur une ligne, deux colonnes sur écran étroit
- Observation : aucune mention (termes cherchés : « 08:00 à 10:00 », « pér. », « Local », « deux colonnes », « écran étroit »)
- Catégorie : 2 · prévu mais pas fait

**2.125** · Geste : modifier un horaire
- Intention, l. 922 :
  > enregistrer un horaire refait le menu, la carte et l'en-tête des groupes-cours
- Observation : aucune mention (termes cherchés : « refait », « en-tête », « selectGroupeCoursHeader », « carte du groupe-cours », « sauvegarderChampHoraireV2 »)
- Catégorie : 2 · prévu mais pas fait

**2.126** · Geste : supprimer un horaire
- Intention, l. 927 :
  > les séances des autres horaires restent, la seconde d'un même jour comprise
- Observation : aucune mention (termes cherchés : « autres horaires », « même jour », « seconde séance », « horaireHebdo »)
- Catégorie : 2 · prévu mais pas fait

**2.127** · Geste : supprimer un horaire
- Intention, l. 927 :
  > les présences déjà saisies restent
- Observation : aucune mention (termes cherchés : « présences », « a2026_presences », « supprimerHoraireV2 »)
- Catégorie : 2 · prévu mais pas fait

**2.128** · Sans geste
- Intention, l. 933 :
  > Une séance sans nombre de périodes reprend le format déclaré de son horaire (« N séances de P périodes »)
- Observation, l. 422 (Cadre › calendrier-trimestre › Accordéon « Horaire ») :
  > (pendant la saisie : « 2 séances · 1 sans nombre de périodes »)
- Observation, l. 424 (Cadre › calendrier-trimestre › Accordéon « Horaire ») :
  > nouvelle ligne « Mercredi 08:00–10:00 » sans périodes → témoin « Non enregistré – Modifier l'horaire : séance 3 : nombre de périodes manquant. … »
- Catégorie : 3 · fait autrement

**2.129** · Sans geste
- Intention, l. 934 :
  > sans rouvrir le formulaire
- Observation : aucune mention (termes cherchés : « Groupe associé », « sans rouvrir », « v2-hor-groupeAssocie », « étud.) »)
- Catégorie : 2 · prévu mais pas fait

### Écran 23 · Cadre › Trimestre › Groupe-cours

**2.130** · Geste : créer un groupe-cours (« + Nouveau groupe-cours »)
- Intention, l. 944 :
  > le champ 2 dit « Cours ou service », sur un service comme sur un cours
- Observation : aucune mention (termes cherchés : « Cours ou service », « v2-gc-cours », « champ 2 »)
- Catégorie : 2 · prévu mais pas fait

**2.131** · Geste : créer un groupe-cours (« + Nouveau groupe-cours »)
- Intention, l. 946 :
  > la phrase des éléments obligatoires en compte quatre sur un service, cinq sur un cours
- Observation : aucune mention (termes cherchés : « éléments obligatoires », « obligatoire », « quatre », « cinq »)
- Catégorie : 2 · prévu mais pas fait

**2.132** · Geste : créer un groupe-cours (« + Nouveau groupe-cours »)
- Intention, l. 947 :
  > (« l'orthopédagogue » sur un service)
- Observation : aucune mention (termes cherchés : « l'orthopédagogue », « choisis l'orthopédagogue », « service »)
- Catégorie : 2 · prévu mais pas fait

**2.133** · Geste : modifier un groupe-cours
- Intention, l. 953 :
  > changer l'horaire d'un groupe-cours existant ne pose aucune question de doublon
- Observation, l. 2856 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Champs `#v2-gc-*` en édition d'un groupe-cours existant (réenregistrement, js/trimestre-v2-groupes-cours.js:458) : lu, non exécuté.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**2.134** · Geste : modifier un groupe-cours
- Intention, l. 954 :
  > le nom du groupe-cours suit le code de son cours et les séances de son horaire, dans le menu, la carte et l'en-tête
- Observation, l. 432 (Cadre › calendrier-trimestre › Accordéon « Groupe-cours ») :
  > nom généré « A2026-999-FIC-ZZ-00001 (Lun-AM / Mer-PM) »
- Observation, l. 436 (Cadre › calendrier-trimestre › Accordéon « Groupe-cours ») :
  > carte « Groupe-cours actif … Cours 999-FIC-ZZ - Exemple doublon · Groupe 00001 · Horaire Horaire Fictif Lun-Mer · Enseig. Prof Fictif-Zorglub · 4/5 configurés » ; menu d'en-tête `#selectGroupeCoursHeader` « 999-FIC-ZZ gr.00001 - Prof F. (Horaire Fictif Lun-Mer) »
- Catégorie : 3 · fait autrement

**2.135** · Geste : supprimer un groupe-cours (bouton « Supprimer » du formulaire, ou Bibliothèque › ⋮ › « Supprimer »)
- Intention, l. 960 :
  > le bouton « Supprimer » est visible dès l'arrivée sur la section
- Observation : aucune mention (termes cherchés : « v2-btnSupprimerGroupeCours », « visible », « dès l'arrivée », « Supprimer »)
- Catégorie : 2 · prévu mais pas fait

**2.136** · Geste : supprimer un groupe-cours (bouton « Supprimer » du formulaire, ou Bibliothèque › ⋮ › « Supprimer »)
- Intention, l. 961 :
  > supprimer un groupe-cours emporte ses élèves, ses évaluations et ses présences ; la fenêtre le dit
- Observation, l. 439 (Cadre › calendrier-trimestre › Accordéon « Groupe-cours ») :
  > boîte « Avant de supprimer, un codex à part — Supprimer le groupe-cours « A2026-999-FIC-ZZ-00001 (Lun-AM / Mer-PM) » l'efface pour de bon. … »
- Observation, l. 439 (Cadre › calendrier-trimestre › Accordéon « Groupe-cours ») :
  > accepté → entrée retirée de `a2026_groupesCours` ; s'il était actif, `groupeCoursActif` → null et `infoCours` → null
- Catégorie : 3 · fait autrement

**2.137** · Geste : voir la pratique de notation appliquée
- Intention, l. 965 :
  > une pratique appliquée dans Conception paraît au champ 6 sans recharger
- Observation : aucune mention (termes cherchés : « champ 6 », « v2-gc-pratique », « sans recharger », « relit »)
- Catégorie : 2 · prévu mais pas fait

**2.138** · Sans geste
- Intention, l. 969 :
  > ne compte un enseignant ou une pratique que s'ils existent encore
- Observation : aucune mention (termes cherchés : « configurés », « existent encore », « introuvable », « badge »)
- Catégorie : 2 · prévu mais pas fait

**2.139** · Sans geste
- Intention, l. 969 :
  > il dit « Complet » quand tout est configuré
- Observation : aucune mention (termes cherchés : « Complet », « 5/5 », « configurés »)
- Catégorie : 2 · prévu mais pas fait

**2.140** · Sans geste
- Intention, l. 970 :
  > SOM, active par défaut, la remplit dès le départ
- Observation, l. 435 (Cadre › calendrier-trimestre › Accordéon « Groupe-cours ») :
  > pratiqueId:null, dateCreation, actif:true
- Observation, l. 436 (Cadre › calendrier-trimestre › Accordéon « Groupe-cours ») :
  > Enseig. Prof Fictif-Zorglub · 4/5 configurés
- Observation, l. 1744 (Suivi — observation : groupe, liste, profils › Préalables (données fictives produites par l'interface)) :
  > `groupesCours[0].pratiqueId` = null
- Catégorie : 3 · fait autrement

**2.141** · Sans geste
- Intention, l. 970 :
  > un service n'a pas besoin d'horaire pour être « Complet »
- Observation : aucune mention (termes cherchés : « Complet », « configurés », « horaireId:null », « service »)
- Catégorie : 2 · prévu mais pas fait

**2.142** · Sans geste
- Intention, l. 971 :
  > Le nom du groupe-cours est recalculé à l'affichage
- Observation : aucune mention (termes cherchés : « recalculé », « nom du groupe-cours », « à l'affichage »)
- Catégorie : 2 · prévu mais pas fait

### Écran 24 · Cadre › Calendrier scolaire

**2.143** · Geste : ouvrir le Calendrier scolaire
- Intention, l. 979 :
  > sur écran étroit, les mois s'empilent au lieu de déborder
- Observation : aucune mention (termes cherchés : « étroit », « empil », « 390 px », « mobile »)
- Catégorie : 2 · prévu mais pas fait

**2.144** · Geste : ouvrir le Calendrier scolaire
- Intention, l. 980 :
  > en deux colonnes : […] ; elle s'empile sous 768 px
- Observation : aucune mention (termes cherchés : « deux colonnes », « 768 », « empile », « Légende »)
- Catégorie : 2 · prévu mais pas fait

**2.145** · Geste : ouvrir le Calendrier scolaire
- Intention, l. 981 :
  > sans calendrier, un état vide explicite plutôt qu'un chiffre inventé
- Observation, l. 450 (Cadre › calendrier-vue) :
  > date absente → « 2025-08-21 »
- Catégorie : 3 · fait autrement

**2.146** · Geste : ouvrir le Calendrier scolaire
- Intention, l. 982 :
  > la semaine s'y lit du dimanche au samedi, ordre du calendrier officiel ; les menus de jour vont du lundi au vendredi
- Observation : aucune mention (termes cherchés : « dimanche », « samedi », « vendredi », « ordre des jours »)
- Catégorie : 2 · prévu mais pas fait

**2.147** · Sans geste
- Intention, l. 987 :
  > la semaine d'examens n'y comptent pas
- Observation : aucune mention (termes cherchés : « semaine-examens », « examens », « numérotation », « numeroSemaine »)
- Catégorie : 2 · prévu mais pas fait

### Fait sans être prévu, sans ligne correspondante dans l'intention

**2.148** · Cadre › calendrier-trimestre › Sous-navigation et accordéons
- Intention : aucune mention (termes cherchés : « accordéon », « replié », « mémorisé », « état d'ouverture »)
- Observation, l. 290 (Cadre › calendrier-trimestre › Sous-navigation et accordéons) :
  > **Écrit** : LS `etatsAccordeonsV2` : objet {id de chaque `.carte.accordeon[id]` du document : booléen ouvert}
- Catégorie : 1 · fait sans être prévu

**2.149** · Cadre › calendrier-trimestre › Sous-navigation et accordéons
- Intention : aucune mention (termes cherchés : « barre d'étapes », « clic sur une étape », « étape »)
- Observation, l. 293 (Cadre › calendrier-trimestre › Sous-navigation et accordéons) :
  > Barre `#barreConvergence .bc-etape` (clic)
- Observation, l. 294 (Cadre › calendrier-trimestre › Sous-navigation et accordéons) :
  > **Sorties** : ouverture de l'accordéon puis `scrollIntoView` après 100 ms (lu dans le code).
- Catégorie : 1 · fait sans être prévu

**2.150** · Cadre › calendrier-trimestre › Accordéon « Trimestre »
- Intention : aucune mention (termes cherchés : « nom vide », « Automne 2026 », « nom par défaut », « vidé »)
- Observation, l. 300 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > le nom vide est remplacé par « Automne 2026 »
- Observation, l. 305 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > nom vidé → le programme réécrit « Automne 2026 » dans le champ et dans `trimestres` (observé à l'exécution)
- Catégorie : 1 · fait sans être prévu

**2.151** · Cadre › calendrier-trimestre › Accordéon « Trimestre »
- Intention : aucune mention (termes cherchés : « indices », « naît vide », « créer un trimestre »)
- Observation, l. 310 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > `h2027_indicesCP`, `h2027_indicesAssiduite` `{sommatif:{}, dateCalcul}`, `h2027_indicesPatternsRaI` `{}` créées
- Catégorie : 1 · fait sans être prévu

**2.152** · Cadre › calendrier-trimestre › Accordéon « Trimestre »
- Intention : aucune mention (termes cherchés : « snapshot », « instantané », « statistiques », « clore »)
- Observation, l. 314 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > `statistiquesFinales:{nbEtudiants:0, nbCours:0, message:"Aucun cours trouvé"}`, `snapshotRessources:"snapshot_h2027_<horodatage>"` ; nouvelle clé `snapshot_h2027_<horodatage>`
- Catégorie : 1 · fait sans être prévu

**2.153** · Cadre › calendrier-trimestre › Accordéon « Trimestre »
- Intention : aucune mention (termes cherchés : « même date », « double saisie », « Deux journées »)
- Observation, l. 333 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > « Deux journées sans cours portent la même date (2026-09-07) — vérifie s'il s'agit d'une double saisie. »
- Catégorie : 1 · fait sans être prévu

**2.154** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « premier cours », « infoCours », « cours actif », « devient actif »)
- Observation, l. 342 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > `infoCours` : null → copie de la fiche (premier cours seulement
- Observation, l. 343 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > menu `#v2-selectCours` « 999-FIC-ZZ Cours Fictif de Zorglubologie (actif) »
- Catégorie : 1 · fait sans être prévu

**2.155** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « encart », « Cours actif », « Compétence »)
- Observation, l. 343 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > encart « Cours actif … Discipline : 101 Biologie Compétence : ZZ00 »
- Catégorie : 1 · fait sans être prévu

**2.156** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « Mode modification », « bandeau »)
- Observation, l. 343 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > bandeau « Mode modification — Cours 999-FIC-ZZ. … »
- Catégorie : 1 · fait sans être prévu

**2.157** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « 2/2/3 », « normalis », « réécrit », « pondération »)
- Observation, l. 346 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > saisie « 2/2/3 » puis sortie du champ → champ réécrit « 2-2-3 »
- Catégorie : 1 · fait sans être prévu

**2.158** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « unités », « repère »)
- Observation, l. 346 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > `#v2-repereUnites` « ≈ 2 ⅓ unités »
- Catégorie : 1 · fait sans être prévu

**2.159** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « 64 h », « heures », « × 16 semaines »)
- Observation, l. 346 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > `#v2-repereHeures` « (2 + 2) × 16 semaines = 64 h »
- Catégorie : 1 · fait sans être prévu

**2.160** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « heures d'enseignement », « heures de contact », « heuresContact », « rempli »)
- Observation, l. 346 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > saisie « 1-1-1 » dans un champ heures vide → `#v2-heuresEnseignement` rempli à 32 (= (1+1)×16), enregistré `heuresContact:32`
- Catégorie : 1 · fait sans être prévu

**2.161** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « cours actif », « l'autre fiche », « devient actif »)
- Observation, l. 356 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > `infoCours` → l'autre fiche (« Exemple doublon »), menu « 999-FIC-ZZ Exemple doublon (actif) »
- Catégorie : 1 · fait sans être prévu

**2.162** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « Exporter tous », « tous mes cours »)
- Observation, l. 357 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > [Exporter tous mes cours]
- Observation, l. 362 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > `cours-2026-10-14.json` (tous)
- Catégorie : 1 · fait sans être prévu

**2.163** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « dernière description », « description », « mémoris »)
- Observation, l. 362 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > LS `cc-derniere-description` : absent → "Exemple de description fictive."
- Catégorie : 1 · fait sans être prévu

**2.164** · Cadre › calendrier-trimestre › Accordéon « Cours et services »
- Intention : aucune mention (termes cherchés : « Importer des cours », « import de cours », « doublon(s) ignoré(s) »)
- Observation, l. 364 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > ouvert par « Importer des cours »
- Observation, l. 364 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > `alert` « Import terminé : ✓ 1 cours ajoutés • 1 doublon(s) ignoré(s) »
- Catégorie : 1 · fait sans être prévu

**2.165** · Cadre › calendrier-trimestre › Accordéon « Enseignant·e »
- Intention : aucune mention (termes cherchés : « Aucun profil sélectionné », « sans profil »)
- Observation, l. 378 (Cadre › calendrier-trimestre › Accordéon « Enseignant·e ») :
  > Sans profil choisi : toast d'erreur « Aucun profil sélectionné »
- Catégorie : 1 · fait sans être prévu

**2.166** · Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es »
- Intention : aucune mention (termes cherchés : « coller des données », « Veuillez », « champ vide »)
- Observation, l. 384 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > Champ vide : `alert` « Veuillez coller des données à importer. » (observé).
- Catégorie : 1 · fait sans être prévu

**2.167** · Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es »
- Intention : aucune mention (termes cherchés : « résumé », « Programmes », « pastille »)
- Observation, l. 392 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > résumé « 4 étudiant·es · Groupe 00001 · SA 1 étudiant·e · Programmes : 999.ZZ 4 »
- Catégorie : 1 · fait sans être prévu

**2.168** · Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es »
- Intention : aucune mention (termes cherchés : « Marquer », « dernière présence », « inactif ? »)
- Observation, l. 406 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > `confirm` « Marquer Proto Fictif-Delta comme inactif ? Ses résultats seront affichés jusqu'à sa dernière présence, mais ne seront plus comptés dans les calculs du groupe. »
- Catégorie : 1 · fait sans être prévu

**2.169** · Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es »
- Intention : aucune mention (termes cherchés : « Numéro de groupe invalide », « en chiffres », « Omnivox »)
- Observation, l. 409 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > « abc » → toast d'erreur « Numéro de groupe invalide — Écris-le en chiffres, comme dans Omnivox (ex. 00002). »
- Catégorie : 1 · fait sans être prévu

**2.170** · Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es »
- Intention : aucune mention (termes cherchés : « groupe choisi », « mémorisé », « retrouve le groupe »)
- Observation, l. 410 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > **Écrit** : `a2026_groupeSelectionne` → `"<coursId>|00001"` (ou "" pour « Tous les groupes »)
- Catégorie : 1 · fait sans être prévu

**2.171** · Cadre › calendrier-trimestre › Accordéon « Horaire »
- Intention : aucune mention (termes cherchés : « nom de l'horaire », « requis »)
- Observation, l. 420 (Cadre › calendrier-trimestre › Accordéon « Horaire ») :
  > nom vide → « le nom de l'horaire est requis. »
- Catégorie : 1 · fait sans être prévu

**2.172** · Cadre › calendrier-trimestre › Accordéon « Horaire »
- Intention : aucune mention (termes cherchés : « carte », « résumé », « Format : »)
- Observation, l. 428 (Cadre › calendrier-trimestre › Accordéon « Horaire ») :
  > carte `#v2-carteResumeHoraire` « Horaire Fictif Lun-Mer · Format : 2 séances · 4 périodes/semaine · Lundi 08:00 - 10:00 · Mercredi 13:00 - 15:00 »
- Catégorie : 1 · fait sans être prévu

**2.173** · Cadre › calendrier-trimestre › Accordéon « Groupe-cours »
- Intention : aucune mention (termes cherchés : « présélectionn », « Groupe associé », « groupeAssocie »)
- Observation, l. 432 (Cadre › calendrier-trimestre › Accordéon « Groupe-cours ») :
  > le choix du groupe présélectionne l'horaire dont `groupeAssocie` correspond
- Catégorie : 1 · fait sans être prévu

**2.174** · Cadre › calendrier-trimestre › Accordéon « Groupe-cours »
- Intention : aucune mention (termes cherchés : « premier groupe-cours », « groupe-cours actif », « devient actif »)
- Observation, l. 435 (Cadre › calendrier-trimestre › Accordéon « Groupe-cours ») :
  > premier groupe-cours seulement : `groupeCoursActif` → même objet
- Catégorie : 1 · fait sans être prévu

**2.175** · Cadre › calendrier-trimestre › Accordéon « Groupe-cours »
- Intention : aucune mention (termes cherchés : « groupe-cours actif », « supprimer un groupe-cours », « plus de groupe-cours actif »)
- Observation, l. 439 (Cadre › calendrier-trimestre › Accordéon « Groupe-cours ») :
  > s'il était actif, `groupeCoursActif` → null et `infoCours` → null
- Catégorie : 1 · fait sans être prévu

**2.176** · Cadre › calendrier-trimestre › Accordéon « Groupe-cours »
- Intention : aucune mention (termes cherchés : « groupe-cours actif », « un autre est activé », « Bibliothèque › ⋮ › « Supprimer » »)
- Observation, l. 446 (Cadre › calendrier-trimestre › Accordéon « Groupe-cours ») :
  > groupe-cours actif supprimé → un autre est activé
- Catégorie : 1 · fait sans être prévu

**2.177** · Cadre › calendrier-vue
- Intention : aucune mention (termes cherchés : « Astuce », « survole »)
- Observation, l. 452 (Cadre › calendrier-vue) :
  > « Astuce : Sur ordinateur, survole un jour pour mettre sa semaine en évidence. »
- Catégorie : 1 · fait sans être prévu

**2.178** · Cadre › calendrier-vue
- Intention : aucune mention (termes cherchés : « survol », « mettre en évidence », « contour »)
- Observation, l. 454 (Cadre › calendrier-vue) :
  > survol de 2026-09-09 → contour (`style.outline`) sur les cellules de même `data-semaine`
- Catégorie : 1 · fait sans être prévu

**2.179** · Cadre › calendrier-vue
- Intention : aucune mention (termes cherchés : « clic sur un jour », « jour de cours », « saisie des présences », « Calendrier scolaire »)
- Observation, l. 455 (Cadre › calendrier-vue) :
  > Clic sur un jour de cours […] `a2026_presences_date` "2026-10-12" → "2026-09-09" (LS et IDB) ; l'écran passe à `#section-suivi`, sous-section `suivi-saisie`
- Catégorie : 1 · fait sans être prévu

---

## Partie 3 · Conception : Productions, Grilles, Échelles

### Introduction de la partie

**3.1**
- Intention, l. 999 :
  > Pratiques de notation, en dernier
- Observation : aucune mention (termes cherchés : « en dernier », « dernier sous-onglet », « ordre des sous-onglets de Conception »)
- Catégorie : 2 · prévu mais pas fait

### Écran 25 · Conception (commun aux trois écrans)

**3.2** · Geste : ouvrir « + Nouvelle grille », « + Nouvelle échelle », « + Nouvelle production »
- Intention, l. 1010 :
  > un formulaire vide qu'on peut remplir
- Observation, l. 781 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « + Nouvelle production ») :
  > La case `#productionDiagnostique` n'est pas remise à zéro par ce geste
- Observation, l. 953 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › « + Nouvelle échelle ») :
  > 4 niveaux préremplis sans code ni nom : 90–100 (valeur 95, #27ae60), 75–89 (82, #3498db), 60–74 (67, #f39c12), 0–59 (30, #e74c3c)
- Catégorie : 3 · fait autrement

**3.3** · Geste : créer avec le nom d'une fiche existante (« Remplacer l'existante », écraser l'homonyme)
- Intention, l. 1020 :
  > si des évaluations ou des productions emploient l'homonyme, refus et rien n'est modifié
- Observation : aucune mention (termes cherchés : « homonyme », « l'emploient », « écraser », « Remplacer l'existante »)
- Catégorie : 2 · prévu mais pas fait

**3.4** · Geste : créer avec le nom d'une fiche existante (« Remplacer l'existante », écraser l'homonyme)
- Intention, l. 1021 :
  > l'homonyme n'est retiré qu'au moment de l'écriture de la création, après ses vérifications : un échec ne supprime rien
- Observation : aucune mention (termes cherchés : « homonyme », « Remplacer l'existante », « remplacement », « retiré au moment de l'écriture »)
- Catégorie : 2 · prévu mais pas fait

**3.5** · Geste : créer avec le nom d'une fiche existante (« Remplacer l'existante », écraser l'homonyme)
- Intention, l. 1022 :
  > « Une échelle porte déjà ce nom, et 12 évaluations et 2 productions l'emploient : l'écraser changerait des notes. Donne un autre nom à la nouvelle. »
- Observation : aucune mention (termes cherchés : « porte déjà ce nom, et », « l'écraser changerait », « Donne un autre nom »)
- Catégorie : 2 · prévu mais pas fait

**3.6** · Geste : créer avec le nom d'une fiche existante (« Remplacer l'existante », écraser l'homonyme)
- Intention, l. 1023 :
  > avant le remplacement, la fenêtre du codex est proposée si le codex n'est pas à jour
- Observation : aucune mention (termes cherchés : « avant le remplacement », « Remplacer l'existante », « codex avant de remplacer »)
- Catégorie : 2 · prévu mais pas fait

**3.7** · Geste : modifier un champ d'une fiche existante
- Intention, l. 1030 :
  > sur l'iPad, le témoin s'affiche au-dessus du clavier
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**3.8** · Geste : fermer une fiche
- Intention, l. 1035 :
  > « Rester » (choisi par défaut, Entrée le suit)
- Observation : aucune mention (termes cherchés : « Rester », « choisi par défaut », « focus sur « Rester » »)
- Catégorie : 2 · prévu mais pas fait

**3.9** · Geste : fermer une fiche
- Intention, l. 1036 :
  > et au rechargement de la page
- Observation, l. 2978 (Ce qui n'a pas pu être observé › Mécanismes transversaux (stockage, écouteurs globaux)) :
  > Dialogue natif `beforeunload` : non déclenché dans Chromium sans tête lors d'un rechargement programmatique (aucune activation utilisateur).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.10** · Geste : fermer une fiche
- Intention, l. 1036 :
  > aucune question si rien n'a été tapé
- Observation : aucune mention (termes cherchés : « rien n'a été tapé », « sans saisie », « fiche vide »)
- Catégorie : 2 · prévu mais pas fait

**3.11** · Geste : fermer une fiche
- Intention, l. 1038 :
  > changer de section pendant une création ne pose pas la question
- Observation : aucune mention (termes cherchés : « changer de section », « pendant une création », « afficherSection »)
- Catégorie : 2 · prévu mais pas fait

**3.12** · Geste : fermer une fiche
- Intention, l. 1038 :
  > sur l'iPad un rechargement peut perdre une création sans question
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**3.13** · Geste : dupliquer une fiche (grille, échelle, production)
- Intention, l. 1042 :
  > puis « X (copie 2) », « X (copie 3) »
- Observation : aucune mention (termes cherchés : « copie 2 », « copie 3 »)
- Catégorie : 2 · prévu mais pas fait

**3.14** · Geste : dupliquer une fiche (grille, échelle, production)
- Intention, l. 1043 :
  > deux enregistrements coup sur coup ne s'écrasent pas
- Observation : aucune mention (termes cherchés : « coup sur coup », « s'écrasent », « deux enregistrements »)
- Catégorie : 2 · prévu mais pas fait

**3.15** · Geste : dupliquer une fiche (grille, échelle, production)
- Intention, l. 1044 :
  > dont l'auteur est toi
- Observation, l. 976 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › « Dupliquer ») :
  > `auteur:"Inconnu"`, `isDemo:false`
- Observation, l. 940 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Fenêtre « Bibliothèque de grilles de critères ») :
  > `auteur:"Inconnu"`, `isDemo:false`
- Catégorie : 3 · fait autrement

**3.16** · Geste : dupliquer une fiche (grille, échelle, production)
- Intention, l. 1045 :
  > « Inspiré de … par … » avec le titre et l'auteur réels
- Observation, l. 870 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > `inspireDe:{nom:"Inconnu", auteur:"Prof Fictif-Zorglub", date, sourceId}`
- Catégorie : 3 · fait autrement

**3.17** · Geste : dupliquer une fiche (grille, échelle, production)
- Intention, l. 1046 :
  > sur un échec, le témoin nomme le geste réel (« Dupliquer la grille », « Dupliquer l'échelle »)
- Observation : aucune mention (termes cherchés : « Dupliquer la grille », « Dupliquer l'échelle », « Non enregistré – Dupliquer »)
- Catégorie : 2 · prévu mais pas fait

**3.18** · Geste : supprimer une fiche quand le codex n'est pas à jour
- Intention, l. 1050 :
  > « Mettre ton codex à jour avant de supprimer ? » […] boutons « Annuler », « Supprimer sans mettre à jour », « Mettre à jour, puis supprimer »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, […]) : […] ; non exécutées.
- Observation, l. 845 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Supprimer ») :
  > fenêtre « Écrire un codex avant de supprimer ? Supprimer cette production l'efface pour de bon. Ton codex à jour pourra te la rendre, jusqu'à ta mise à jour suivante. » (boutons « Annuler », « Supprimer sans codex », « Écrire un codex, puis supprimer »)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.19** · Geste : changer de trimestre pendant qu'un éditeur est ouvert
- Intention, l. 1055 :
  > les éditeurs ouverts se referment ; les critères ou niveaux d'une fiche en création ne suivent pas dans le nouveau trimestre
- Observation : aucune mention (termes cherchés : « changer de trimestre », « éditeurs ouverts », « se referment », « nouveau trimestre »)
- Catégorie : 2 · prévu mais pas fait

**3.20** · Geste : changer de trimestre pendant qu'un éditeur est ouvert
- Intention, l. 1056 :
  > modifier une fiche restée à cheval sur la bascule est refusé à voix haute, rien n'est écrit au mauvais endroit
- Observation : aucune mention (termes cherchés : « à cheval », « bascule », « mauvais endroit »)
- Catégorie : 2 · prévu mais pas fait

**3.21** · Sans geste
- Intention, l. 1060 :
  > Un nom de grille, d'échelle ou de production reçu d'un collègue s'affiche toujours comme du texte
- Observation, l. 2878 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > « Importer un partage (.lcz) » (`partageImport`, fichiers partage-*.js) dans les bibliothèques : non déclenché.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 26 · Conception › Productions étudiantes

**3.22** · Geste : retrouver une production
- Intention, l. 1066 :
  > avec « Fermer » seul en haut
- Observation : aucune mention (termes cherchés : « seul en haut », « en haut de la fiche »)
- Catégorie : 2 · prévu mais pas fait

**3.23** · Geste : retrouver une production
- Intention, l. 1067 :
  > le tri « par échéance » de la liste de gauche fonctionne
- Observation, l. 837 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Tri) :
  > aucun réordonnancement ; console « [data-on-change] Fonction non trouvée : "trierListeProductions". »
- Catégorie : 3 · fait autrement

**3.24** · Geste : créer une production (« + Nouvelle production », puis « Créer la production »)
- Intention, l. 1071 :
  > et rien de la production précédente
- Observation, l. 781 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « + Nouvelle production ») :
  > La case `#productionDiagnostique` n'est pas remise à zéro par ce geste (lu dans le code js/productions-liste.js:229-290 ; observé : après une production cochée « diagnostique », les 4 productions créées ensuite ont `diagnostique: true`)
- Catégorie : 3 · fait autrement

**3.25** · Geste : créer une production (« + Nouvelle production », puis « Créer la production »)
- Intention, l. 1073 :
  > refus sans nom, sans type ou sans pondération
- Observation : aucune mention (termes cherchés : « choisis le type », « sans type », « type de la production »)
- Catégorie : 2 · prévu mais pas fait

**3.26** · Geste : créer une production (« + Nouvelle production », puis « Créer la production »)
- Intention, l. 1074 :
  > une échéance hors du trimestre pose une question à la création
- Observation, l. 806 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Créer la production ») :
  > échéance hors trimestre (2026-12-30) avec la case décochée : aucune demande de confirmation, création faite
- Catégorie : 3 · fait autrement

**3.27** · Geste : modifier un champ d'une production existante
- Intention, l. 1080 :
  > et garde ses échéances par groupe
- Observation, l. 819 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Enregistrement automatique de la fiche ouverte — écouteur) :
  > la date d'échéance non affichée est réécrite : `echeancesParGroupe.<gc>.date: "2026-12-09" → null` (Terminale) ; même perte observée pour la Production A (2026-10-28 → null).
- Catégorie : 3 · fait autrement

**3.28** · Geste : modifier un champ d'une production existante
- Intention, l. 1082 :
  > « Enregistré » apparaît un instant en bas à gauche
- Observation : aucune mention (termes cherchés : « en bas à gauche », « position du témoin »)
- Catégorie : 2 · prévu mais pas fait

**3.29** · Geste : modifier un champ d'une production existante
- Intention, l. 1083 :
  > « choisis le type de la production. »
- Observation : aucune mention (termes cherchés : « choisis le type de la production », « type de la production »)
- Catégorie : 2 · prévu mais pas fait

**3.30** · Geste : modifier un champ d'une production existante
- Intention, l. 1083 :
  > « la pondération est requise : plus de 0 %. » ; rien n'est écrit
- Observation, l. 787 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Sélecteur Type) :
  > note « Pour une évaluation formative, utilisez une pondération de 0%. »
- Catégorie : 3 · fait autrement

**3.31** · Geste : modifier un champ d'une production existante
- Intention, l. 1084 :
  > « Annuler » y remet le nom enregistré
- Observation : aucune mention (termes cherchés : « remet le nom », « nom enregistré », « Annuler »)
- Catégorie : 2 · prévu mais pas fait

**3.32** · Geste : modifier un champ d'une production existante
- Intention, l. 1085 :
  > une échéance hors du trimestre, en modification, s'écrit sans question ; l'avertissement sous le champ le dit
- Observation, l. 797 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Date d'échéance) :
  > pour 2026-12-30 (hors trimestre) « Mercredi » seulement, sans avertissement « Hors trimestre »
- Catégorie : 3 · fait autrement

**3.33** · Geste : ajouter, nommer, ordonner, renommer un bloc de consignes
- Intention, l. 1091 :
  > un bloc rempli mais sans nom n'est pas conservé ; le reste s'écrit, et le témoin dit « un bloc de consignes est rempli mais n'a pas de nom ; il n'est pas conservé. Donne-lui un nom. »
- Observation, l. 834 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Blocs de consignes : « + Nouveau champ ») :
  > En création, un bloc rempli sans nom déclenche `confirm` « Un bloc de consignes est rempli mais n'a pas de nom : il ne sera pas conservé. Créer quand même ? »
- Catégorie : 3 · fait autrement

**3.34** · Geste : poser la date d'échéance, cocher « Consignes transmises »
- Intention, l. 1095 :
  > c'est la case seule qui décide que la production est due (calendrier, complétion, performance)
- Observation, l. 2855 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Vue calendrier : pastilles « Échéance de production » (`cal-echeance-badge`, infobulle `title`) et classe `calendrier-aujourd-hui` : aucune production à échéance dans les états utilisés ; non observées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.35** · Geste : poser la date d'échéance, cocher « Consignes transmises »
- Intention, l. 1097 :
  > une production rattachée à un bloc Évaluation de la carte d'alignement reçoit sa date toute seule, au jour où le groupe se rencontre réellement
- Observation, l. 569 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — champs) :
  > Production `#planif-panneau-production` (2422-2429) : non exercée (aucune production dans l'état de base ; seule option « Aucune », observé).
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**3.36** · Geste : poser la date d'échéance, cocher « Consignes transmises »
- Intention, l. 1098 :
  > et n'entre ni au calendrier ni dans les indices C et P
- Observation, l. 2855 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Vue calendrier : pastilles « Échéance de production » (`cal-echeance-badge`, infobulle `title`) et classe `calendrier-aujourd-hui` : aucune production à échéance dans les états utilisés ; non observées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.37** · Geste : cocher la case « Travail diagnostique » (« ne compte dans aucun calcul »)
- Intention, l. 1102 :
  > mais ne pèse ni sur la note, ni sur la performance, ni sur la complétion, ni sur le palier RàI ; la case se coche aussi sur un travail déjà corrigé
- Observation : aucune mention (termes cherchés : « ne pèse », « aucun calcul », « travail déjà corrigé », « palier RàI »)
- Catégorie : 2 · prévu mais pas fait

**3.38** · Geste : cocher la case « Travail diagnostique » (« ne compte dans aucun calcul »)
- Intention, l. 1103 :
  > ce travail ne déclenche plus le verdict « non-participation »
- Observation, l. 2931 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Alerte de non-participation (`afficherAlerteNonParticipation`, js/tableau-bord-apercu.js:2150) : aucun·e étudiant·e sans production évaluée avec A > 0.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.39** · Geste : cocher la case « Travail diagnostique » (« ne compte dans aucun calcul »)
- Intention, l. 1104 :
  > la case est sous la pondération
- Observation : aucune mention (termes cherchés : « sous la pondération », « position de la case »)
- Catégorie : 2 · prévu mais pas fait

**3.40** · Geste : cocher la case « Travail diagnostique » (« ne compte dans aucun calcul »)
- Intention, l. 1104 :
  > sur l'iPad, toute la rangée répond au doigt
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**3.41** · Geste : choisir la grille, l'échelle et la cartouche de la production
- Intention, l. 1108 :
  > les trois choix sont à droite, libellés alignés
- Observation : aucune mention (termes cherchés : « à droite », « libellés alignés »)
- Catégorie : 2 · prévu mais pas fait

**3.42** · Geste : choisir la grille, l'échelle et la cartouche de la production
- Intention, l. 1109 :
  > s'affiche « ⚠ introuvable », et l'enregistrement ne l'efface pas
- Observation : aucune mention (termes cherchés : « ⚠ introuvable », « introuvable »)
- Catégorie : 2 · prévu mais pas fait

**3.43** · Geste : « Préparer le PDF » (le document de consignes)
- Intention, l. 1114 :
  > un cran sans matière est désactivé et dit pourquoi
- Observation : aucune mention (termes cherchés : « cran », « sans matière », « option désactivée »)
- Catégorie : 2 · prévu mais pas fait

**3.44** · Geste : « Préparer le PDF » (le document de consignes)
- Intention, l. 1115 :
  > au fil du texte, ou en deux colonnes avec un bandeau par bloc ; les retours à la ligne sont préservés
- Observation : aucune mention (termes cherchés : « au fil du texte », « deux colonnes », « bandeau par bloc », « retours à la ligne »)
- Catégorie : 2 · prévu mais pas fait

**3.45** · Geste : « Préparer le PDF » (le document de consignes)
- Intention, l. 1116 :
  > avec plusieurs groupes, chaque date est nommée
- Observation : aucune mention (termes cherchés : « plusieurs groupes », « chaque date est nommée »)
- Catégorie : 2 · prévu mais pas fait

**3.46** · Geste : « Préparer le PDF » (le document de consignes)
- Intention, l. 1117 :
  > une production sans grille produit son document de consignes
- Observation, l. 854 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Préparer le PDF ») :
  > Production sans grille : formulaire `#formulairePDFInline` « 📄 Préparer le PDF » avec sélecteurs Production (6 productions), Grille, Échelle, bouton « Voir l'aperçu → » désactivé
- Catégorie : 3 · fait autrement

**3.47** · Geste : « Préparer le PDF » (le document de consignes)
- Intention, l. 1118 :
  > le formulaire de préparation (hors fiche) exige toujours une grille et une échelle
- Observation, l. 2872 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > `afficherFormulairePreparationPDF` n'a aucun appelant (seulement `window.afficherFormulairePreparationPDF = …`, js/export-pdf.js:2915) ; formulaire jamais affiché.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.48** · Geste : supprimer une production
- Intention, l. 1126 :
  > une production qui a des évaluations ou des copies ne peut pas être supprimée ; le refus dit combien, comme pour une grille
- Observation : aucune mention (termes cherchés : « Impossible de supprimer la production », « production employée », « a des évaluations »)
- Catégorie : 2 · prévu mais pas fait

**3.49** · Geste : supprimer une production
- Intention, l. 1128 :
  > supprimer la production affichée ne laisse aucun surlignage dans la barre latérale
- Observation : aucune mention (termes cherchés : « surlignage », « surligné »)
- Catégorie : 2 · prévu mais pas fait

**3.50** · Geste : fermer le formulaire d'une production
- Intention, l. 1132 :
  > « Fermer » fait la même chose quel que soit le bouton employé, et remet à zéro la production en édition
- Observation : aucune mention (termes cherchés : « quel que soit le bouton », « remet à zéro », « production en édition »)
- Catégorie : 2 · prévu mais pas fait

**3.51** · Geste : fermer le formulaire d'une production
- Intention, l. 1134 :
  > changer de sous-onglet pendant une création ne pose pas la question ; au retour, la saisie est retrouvée telle quelle
- Observation : aucune mention (termes cherchés : « sous-onglet », « saisie retrouvée », « au retour »)
- Catégorie : 2 · prévu mais pas fait

**3.52** · Sans geste
- Intention, l. 1138 :
  > Une production de démonstration s'ouvre en lecture seule ; elle n'écrit rien
- Observation : aucune mention (termes cherchés : « lecture seule », « production de démonstration », « exemple »)
- Catégorie : 2 · prévu mais pas fait

**3.53** · Sans geste
- Intention, l. 1139 :
  > la description du type occupe toute la largeur sous les champs qui la déterminent
- Observation : aucune mention (termes cherchés : « toute la largeur », « sous les champs »)
- Catégorie : 2 · prévu mais pas fait

### Écran 27 · Conception › Grilles de critères

**3.54** · Geste : créer une grille
- Intention, l. 1151 :
  > (astérisque rouge et refus)
- Observation : aucune mention (termes cherchés : « astérisque », « * »)
- Catégorie : 2 · prévu mais pas fait

**3.55** · Geste : créer une grille
- Intention, l. 1154 :
  > par un avis qui reste visible dans l'éditeur tant que le total n'est pas 100 %
- Observation, l. 905 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Modification d'une grille existante) :
  > total affiché « 110% » en `var(--rouge)`
- Catégorie : 3 · fait autrement

**3.56** · Geste : choisir le « Type de la grille » (à côté du nom)
- Intention, l. 1158 :
  > le type voyage avec la grille au partage et à l'import
- Observation, l. 2868 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Menu « Exporter pour partager » (`partageExport.exporterPourPartager`, fichiers partage-*.js hors liste) : non déclenché.
- Observation, l. 2878 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > « Importer un partage (.lcz) » (`partageImport`, fichiers partage-*.js) dans les bibliothèques : non déclenché.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.57** · Geste : choisir le « Type de la grille » (à côté du nom)
- Intention, l. 1160 :
  > une grille d'avant affiche « Non précisé » et, dessous, ce que ses critères sont (« Tes critères sont tous holistiques. ») ; choisir un type tait la ligne, revenir la ramène
- Observation : aucune mention (termes cherchés : « Non précisé », « Tes critères sont », « grille d'avant »)
- Catégorie : 2 · prévu mais pas fait

**3.58** · Geste : choisir le « Type de la grille » (à côté du nom)
- Intention, l. 1161 :
  > l'éditeur le dit et offre un bouton pour le leur appliquer ; rien ne change sans ce geste
- Observation : aucune mention (termes cherchés : « critères sans type », « leur appliquer », « appliquer le type »)
- Catégorie : 2 · prévu mais pas fait

**3.59** · Geste : choisir le « Type de la grille » (à côté du nom)
- Intention, l. 1164 :
  > un critère analytique lui passe le niveau que son pourcentage trouve dans l'échelle
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.60** · Geste : ajouter un critère (« + Ajouter un critère »)
- Intention, l. 1169 :
  > sur une grille déjà employée, les évaluations faites avant gardent leur note, et leur PDF conclut normalement
- Observation : aucune mention (termes cherchés : « gardent leur note », « conclut », « grille déjà employée »)
- Catégorie : 2 · prévu mais pas fait

**3.61** · Geste : ajouter un critère (« + Ajouter un critère »)
- Intention, l. 1171 :
  > en ouvrant une copie évaluée avant l'ajout, un avis nomme le critère ajouté depuis
- Observation : aucune mention (termes cherchés : « a été ajouté », « critère ajouté depuis », « avis »)
- Catégorie : 2 · prévu mais pas fait

**3.62** · Geste : renseigner un critère (nom, descripteur, pondération, type, complexité SOLO)
- Intention, l. 1175 :
  > tous les astérisques d'obligation sont rouges
- Observation : aucune mention (termes cherchés : « astérisque », « * »)
- Catégorie : 2 · prévu mais pas fait

**3.63** · Geste : renseigner un critère (nom, descripteur, pondération, type, complexité SOLO)
- Intention, l. 1179 :
  > une grille analytique naît en exigeant 100
- Observation, l. 897 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › « Créer la grille ») :
  > « Grille enregistrée : ses critères totalisent 90 %, pas 100 %. » ; liste latérale « Fictif-Grille Zorglub / ANALY / 2 critères »
- Catégorie : 3 · fait autrement

**3.64** · Geste : renseigner un critère (nom, descripteur, pondération, type, complexité SOLO)
- Intention, l. 1179 :
  > le maximum de points d'un critère analytique EST sa pondération
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.65** · Geste : renseigner un critère (nom, descripteur, pondération, type, complexité SOLO)
- Intention, l. 1181 :
  > le critère compte dans la note, le dépistage des fondations ne le surveille pas
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage (`afficherSignalementsDepistage`, js/tableau-bord-apercu.js:2205 ; js/entites/signalement-depistage.js), bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO (js/profil-etudiant-diagnostics.js, js/actions-rlo.js) : non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.66** · Geste : renseigner un critère (nom, descripteur, pondération, type, complexité SOLO)
- Intention, l. 1182 :
  > aide sous le menu : « “Aucun” retire le critère de la lecture SOLO
- Observation : aucune mention (termes cherchés : « lecture SOLO », « retire le critère », « aide sous le menu »)
- Catégorie : 2 · prévu mais pas fait

**3.67** · Geste : déplacer ou supprimer un critère, un sous-critère
- Intention, l. 1191 :
  > « Supprimer ce critère l'efface pour de bon. Ton codex à jour pourra te le rendre, jusqu'à ta mise à jour suivante. » ; « Annuler » ferme sans autre question et le critère reste
- Observation : aucune mention (termes cherchés : « Supprimer ce critère l'efface », « critère employé », « critère porte des notes »)
- Catégorie : 2 · prévu mais pas fait

**3.68** · Geste : déplacer ou supprimer un critère, un sous-critère
- Intention, l. 1192 :
  > côté évaluation, une copie dont un critère a été retiré s'ouvre, avec un avis qui nomme le critère et le niveau enregistré
- Observation : aucune mention (termes cherchés : « a été retiré », « critère retiré », « niveau enregistré »)
- Catégorie : 2 · prévu mais pas fait

**3.69** · Geste : ouvrir un critère algorithmique (le gabarit)
- Intention, l. 1197 :
  > « Bilan » et « Ce que l'élève lit »
- Observation, l. 908 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Modification d'une grille existante) :
  > affichage des cartes « Sous-critères », « Formule », « Bilan », « Projection »
- Catégorie : 3 · fait autrement

**3.70** · Geste : ouvrir un critère algorithmique (le gabarit)
- Intention, l. 1197 :
  > suivent des cartes repliables : la formule, ouverte (elle porte la note) ; « Bilan » et « Ce que l'élève lit », fermées
- Observation : aucune mention (termes cherchés : « repliable », « ouverte », « fermée », « replié »)
- Catégorie : 2 · prévu mais pas fait

**3.71** · Geste : ouvrir un critère algorithmique (le gabarit)
- Intention, l. 1198 :
  > une carte reste comme on l'a laissée pendant qu'on tape et quand on revient sur un critère, tant qu'on n'a pas quitté l'écran ; le pli n'entre pas dans les données de la grille
- Observation : aucune mention (termes cherchés : « pli », « replié », « reste comme on l'a laissée »)
- Catégorie : 2 · prévu mais pas fait

**3.72** · Geste : gérer les sous-critères comme codes d'annotation
- Intention, l. 1209 :
  > la case « Utiliser ces sous-critères comme codes d'annotation » est en tête ; cochée, chaque rangée montre sa couleur et un pli « Observation » qui porte le texte du code
- Observation : aucune mention (termes cherchés : « en tête », « pli « Observation » », « couleur du sous-critère »)
- Catégorie : 2 · prévu mais pas fait

**3.73** · Geste : gérer les sous-critères comme codes d'annotation
- Intention, l. 1210 :
  > la couleur se choisit parmi les douze de la palette ou hors palette ; le geste et les couleurs voyagent avec la grille au partage et à l'import
- Observation : aucune mention (termes cherchés : « douze », « hors palette », « couleur du code »)
- Catégorie : 2 · prévu mais pas fait

**3.74** · Geste : gérer les sous-critères comme codes d'annotation
- Intention, l. 1212 :
  > dans Annoter, la palette Codes montre numéro, nom, couleur et texte des sous-critères pour toute copie évaluée avec cette grille
- Observation : aucune mention (termes cherchés : « codesDepuisSousCriteres », « sous-critères dans la palette », « palette Codes »)
- Catégorie : 2 · prévu mais pas fait

**3.75** · Geste : gérer les sous-critères comme codes d'annotation
- Intention, l. 1213 :
  > une ligne de la liste dit où vit la palette générale
- Observation : aucune mention (termes cherchés : « palette générale », « où vit la palette »)
- Catégorie : 2 · prévu mais pas fait

**3.76** · Geste : gérer les sous-critères comme codes d'annotation
- Intention, l. 1214 :
  > la phrase « Aucune annotation » (que seul l'enseignant lit) vit sous la case, dans un pli fermé « Quand la copie ne porte aucun code »
- Observation : aucune mention (termes cherchés : « Aucune annotation », « Quand la copie ne porte aucun code »)
- Catégorie : 2 · prévu mais pas fait

**3.77** · Geste : gérer les sous-critères comme codes d'annotation
- Intention, l. 1215 :
  > dans le gabarit algorithmique, on parle d'« observation », jamais de « rétroaction »
- Observation : aucune mention (termes cherchés : « observation », « libellé des sous-critères »)
- Catégorie : 2 · prévu mais pas fait

**3.78** · Geste : gérer les sous-critères comme codes d'annotation
- Intention, l. 1216 :
  > un code identifie un élément du travail, compté et rattaché aux critères ; un tampon commente le travail et ne touche ni la grille ni la note
- Observation : aucune mention (termes cherchés : « rattaché aux critères », « ne touche ni la grille ni la note », « tampon »)
- Catégorie : 2 · prévu mais pas fait

**3.79** · Geste : régler la carte « Bilan »
- Intention, l. 1220 :
  > elle ne porte que les deux phrases du bilan de l'élève, « Défi prioritaire » et « Quand tout est maîtrisé », et le menu « Modèle des phrases (bilan et décompte) »
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Saisie des textes d'énoncés (`modifierTexteEnonceGrilleHandler`) […] zones présentes à l'écran mais le remplissage du champ a échoué
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.80** · Geste : régler la carte « Bilan »
- Intention, l. 1221 :
  > le modèle « Français écrit » porte la description « Les phrases parlent du français écrit
- Observation : aucune mention (termes cherchés : « Les phrases parlent du français écrit », « Français écrit », « Générique »)
- Catégorie : 2 · prévu mais pas fait

**3.81** · Geste : régler la carte « Bilan »
- Intention, l. 1222 :
  > « Fournit le texte de départ des deux phrases du bilan et du décompte de la carte « Ce que l'élève lit ». »
- Observation : aucune mention (termes cherchés : « Fournit le texte de départ », « aide sous le menu »)
- Catégorie : 2 · prévu mais pas fait

**3.82** · Geste : régler la carte « Bilan »
- Intention, l. 1223 :
  > ces phrases se réécrivent dans tes mots ; vider une zone fait taire la phrase ; elles voyagent avec la grille
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Saisie des textes d'énoncés (`modifierTexteEnonceGrilleHandler`) […] zones présentes à l'écran mais le remplissage du champ a échoué
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.83** · Geste : régler la carte « Ce que l'élève lit » (projection et paliers)
- Intention, l. 1227 :
  > la carte se lit de haut en bas comme la phrase de l'élève : le décompte des erreurs, puis les paliers, chacun avec son verdict et sa recommandation
- Observation : aucune mention (termes cherchés : « décompte », « paliers », « verdict », « recommandation »)
- Catégorie : 2 · prévu mais pas fait

**3.84** · Geste : régler la carte « Ce que l'élève lit » (projection et paliers)
- Intention, l. 1230 :
  > la phrase de l'élève dit « au service d'aide de ton collège : … »
- Observation : aucune mention (termes cherchés : « au service d'aide de ton collège », « service d'aide »)
- Catégorie : 2 · prévu mais pas fait

**3.85** · Geste : régler la carte « Ce que l'élève lit » (projection et paliers)
- Intention, l. 1231 :
  > les paliers tiennent sur deux rangées, numérotés, le nom lisible en entier ; sur l'iPad en portrait, les deux colonnes s'empilent
- Observation : aucune mention (termes cherchés : « paliers », « deux rangées », « iPad »)
- Catégorie : 2 · prévu mais pas fait

**3.86** · Geste : régler la carte « Ce que l'élève lit » (projection et paliers)
- Intention, l. 1232 :
  > un palier n'a pas de chevrons : son ordre est son seuil
- Observation : aucune mention (termes cherchés : « palier », « chevrons », « ordre des paliers »)
- Catégorie : 2 · prévu mais pas fait

**3.87** · Geste : régler la carte « Ce que l'élève lit » (projection et paliers)
- Intention, l. 1233 :
  > sous chaque palier, « L'élève lira »
- Observation : aucune mention (termes cherchés : « L'élève lira », « copie fictive du palier »)
- Catégorie : 2 · prévu mais pas fait

**3.88** · Geste : régler la carte « Ce que l'élève lit » (projection et paliers)
- Intention, l. 1234 :
  > chaque palier porte une case « ce palier lève un signalement »
- Observation : aucune mention (termes cherchés : « lève un signalement », « case du palier »)
- Catégorie : 2 · prévu mais pas fait

**3.89** · Geste : régler la carte « Ce que l'élève lit » (projection et paliers)
- Intention, l. 1235 :
  > le signalement se recalcule, décocher le fait disparaître
- Observation : aucune mention (termes cherchés : « signalement », « se recalcule », « décocher »)
- Catégorie : 2 · prévu mais pas fait

**3.90** · Geste : poser un badge dans une phrase (le texte troué)
- Intention, l. 1239 :
  > le badge se pose d'un clic, au curseur ; pas de glissé
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > boutons repères `insererRepereEnonce` (js/grilles.js:2467) […] éditeur de badges (js/composeur-badges.js:354-380) : zones présentes à l'écran mais le remplissage du champ a échoué (élément non éditable par `fill` : éditeur de badges) ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.91** · Geste : poser un badge dans une phrase (le texte troué)
- Intention, l. 1240 :
  > deux familles visuellement distinctes : ce que l'enseignant pose (le formulaire) et ce qui se remplit en corrigeant ; palette fixe ; l'enseignant écrit la phrase entière
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > boutons repères `insererRepereEnonce` (js/grilles.js:2467) […] éditeur de badges (js/composeur-badges.js:354-380) : zones présentes à l'écran mais le remplissage du champ a échoué (élément non éditable par `fill` : éditeur de badges) ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.92** · Geste : poser un badge dans une phrase (le texte troué)
- Intention, l. 1241 :
  > les badges inventés par l'usager sont abandonnés pour les critères algorithmiques
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > boutons repères `insererRepereEnonce` (js/grilles.js:2467) […] éditeur de badges (js/composeur-badges.js:354-380) : zones présentes à l'écran mais le remplissage du champ a échoué (élément non éditable par `fill` : éditeur de badges) ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.93** · Geste : poser un badge dans une phrase (le texte troué)
- Intention, l. 1242 :
  > huit badges dans chaque palier (service, seuil, longueur, erreurs, mots, moyenne, projection, palier), dans le verdict, la recommandation et le décompte
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > boutons repères `insererRepereEnonce` (js/grilles.js:2467) […] éditeur de badges (js/composeur-badges.js:354-380) : zones présentes à l'écran mais le remplissage du champ a échoué (élément non éditable par `fill` : éditeur de badges) ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.94** · Geste : poser un badge dans une phrase (le texte troué)
- Intention, l. 1243 :
  > dans les phrases du critère, les repères critère, erreurs, mots, points ; chaque zone n'offre que ce qui y vaut quelque chose ; un repère ne se pose jamais au milieu d'un mot
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > boutons repères `insererRepereEnonce` (js/grilles.js:2467) […] éditeur de badges (js/composeur-badges.js:354-380) : zones présentes à l'écran mais le remplissage du champ a échoué (élément non éditable par `fill` : éditeur de badges) ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.95** · Geste : poser un badge dans une phrase (le texte troué)
- Intention, l. 1244 :
  > ce qui est enregistré reste le même texte ; les grilles existantes, partagées ou importées gardent leur texte
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > boutons repères `insererRepereEnonce` (js/grilles.js:2467) […] éditeur de badges (js/composeur-badges.js:354-380) : zones présentes à l'écran mais le remplissage du champ a échoué (élément non éditable par `fill` : éditeur de badges) ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.96** · Geste : poser un badge dans une phrase (le texte troué)
- Intention, l. 1245 :
  > le badge se montre comme une pastille dans le fil du texte ; il s'efface d'un coup, par la touche d'effacement ou par sa croix
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > boutons repères `insererRepereEnonce` (js/grilles.js:2467) […] éditeur de badges (js/composeur-badges.js:354-380) : zones présentes à l'écran mais le remplissage du champ a échoué (élément non éditable par `fill` : éditeur de badges) ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.97** · Geste : poser un badge dans une phrase (le texte troué)
- Intention, l. 1246 :
  > le badge « moyenne » remplace la phrase « Tu fais en moyenne 1 erreur à chaque N mots » ; un palier sans badge garde la phrase
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > boutons repères `insererRepereEnonce` (js/grilles.js:2467) […] éditeur de badges (js/composeur-badges.js:354-380) : zones présentes à l'écran mais le remplissage du champ a échoué (élément non éditable par `fill` : éditeur de badges) ; non observé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.98** · Geste : enregistrer des paliers sous un nom (une collection)
- Intention, l. 1250 :
  > « Enregistrer ces paliers sous un nom… » garde le modèle, ses réglages et ses paliers, rangés dans le trimestre ; possible en création comme en édition ; un trimestre neuf part sans collection
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > collections de projection (`ouvrirSaisieCollectionProjection`, `enregistrerCollectionProjection`, `annulerSaisieCollectionProjection`, js/grilles.js:2846-2895) […] zones présentes à l'écran mais le remplissage du champ a échoué
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.99** · Geste : enregistrer des paliers sous un nom (une collection)
- Intention, l. 1251 :
  > nom vide : « Non enregistré : donne un nom à la collection. »
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > collections de projection (`ouvrirSaisieCollectionProjection`, `enregistrerCollectionProjection`, `annulerSaisieCollectionProjection`, js/grilles.js:2846-2895) […] zones présentes à l'écran mais le remplissage du champ a échoué
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.100** · Geste : choisir une collection (« Mes collections », menu de projection de toutes les grilles)
- Intention, l. 1255 :
  > la collection COPIE ses valeurs dans le critère ; le critère reste la source unique
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > collections de projection (`ouvrirSaisieCollectionProjection`, `enregistrerCollectionProjection`, `annulerSaisieCollectionProjection`, js/grilles.js:2846-2895) […] zones présentes à l'écran mais le remplissage du champ a échoué
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.101** · Geste : choisir une collection (« Mes collections », menu de projection de toutes les grilles)
- Intention, l. 1256 :
  > corriger ou supprimer la collection ensuite ne change aucune grille, ni ce qu'un élève a déjà lu
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > collections de projection (`ouvrirSaisieCollectionProjection`, `enregistrerCollectionProjection`, `annulerSaisieCollectionProjection`, js/grilles.js:2846-2895) […] zones présentes à l'écran mais le remplissage du champ a échoué
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.102** · Geste : choisir une collection (« Mes collections », menu de projection de toutes les grilles)
- Intention, l. 1257 :
  > « Choisir une collection copie ses paliers et ses réglages dans ce critère. Corriger ou supprimer la collection ensuite ne change pas cette grille, ni ce qu'un élève a déjà lu. »
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > collections de projection (`ouvrirSaisieCollectionProjection`, `enregistrerCollectionProjection`, `annulerSaisieCollectionProjection`, js/grilles.js:2846-2895) […] zones présentes à l'écran mais le remplissage du champ a échoué
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.103** · Geste : choisir une collection (« Mes collections », menu de projection de toutes les grilles)
- Intention, l. 1258 :
  > collection disparue : « Cette collection n'existe plus. » / « Rien n'a été changé sur le critère. »
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > collections de projection (`ouvrirSaisieCollectionProjection`, `enregistrerCollectionProjection`, `annulerSaisieCollectionProjection`, js/grilles.js:2846-2895) […] zones présentes à l'écran mais le remplissage du champ a échoué
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.104** · Geste : supprimer une collection
- Intention, l. 1262 :
  > par la corbeille, avec « Supprimer la collection « ‹nom› » ? Les grilles qui l'ont copiée ne changent pas. »
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > collections de projection (`ouvrirSaisieCollectionProjection`, `enregistrerCollectionProjection`, `annulerSaisieCollectionProjection`, js/grilles.js:2846-2895) […] zones présentes à l'écran mais le remplissage du champ a échoué
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.105** · Geste : supprimer une collection
- Intention, l. 1263 :
  > aucune grille ni évaluation ne change
- Observation, l. 2873 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > collections de projection (`ouvrirSaisieCollectionProjection`, `enregistrerCollectionProjection`, `annulerSaisieCollectionProjection`, js/grilles.js:2846-2895) […] zones présentes à l'écran mais le remplissage du champ a échoué
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**3.106** · Geste : supprimer une grille
- Intention, l. 1269 :
  > la suppression bloque, nomme les cartouches et offre de les déplacer vers une autre grille, critères rapprochés par identifiant puis par nom
- Observation, l. 930 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › « Supprimer ») :
  > Grille portant des cartouches mais sans production ni évaluation : `confirm` de déplacement, `prompt` « Sélectionne la grille d'accueil … Entre le numéro de la grille : » puis déplacement des cartouches (`deplacerCartouchesVersAutreGrille`, js/grilles.js:1806) (lu dans le code, non exécuté).
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**3.107** · Geste : supprimer une grille
- Intention, l. 1270 :
  > sur un échec, le témoin dit « Supprimer la grille »
- Observation : aucune mention (termes cherchés : « Non enregistré – Supprimer la grille », « échec de suppression »)
- Catégorie : 2 · prévu mais pas fait

**3.108** · Geste : supprimer une grille
- Intention, l. 1271 :
  > supprimer la grille de départ dans un trimestre ne la retire que de ce trimestre ; les autres trimestres, et ceux à venir, la reçoivent encore
- Observation : aucune mention (termes cherchés : « autres trimestres », « trimestres à venir », « grille de départ supprimée »)
- Catégorie : 2 · prévu mais pas fait

**3.109** · Sans geste
- Intention, l. 1276 :
  > Une grille d'avant affiche « Non précisé » et la ligne qui décrit ses critères
- Observation : aucune mention (termes cherchés : « Non précisé », « grille d'avant »)
- Catégorie : 2 · prévu mais pas fait

### Écran 28 · Conception › Échelles de performance

**3.110** · Geste : créer une échelle (« + Nouvelle échelle », puis « Créer l'échelle »)
- Intention, l. 1295 :
  > une échelle neuve propose quatre lignes de niveau vides ; l'utilisateur remplit lui-même codes, noms, bornes et valeurs, rien n'est posé à sa place
- Observation, l. 953 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › « + Nouvelle échelle ») :
  > 4 niveaux préremplis sans code ni nom : 90–100 (valeur 95, #27ae60), 75–89 (82, #3498db), 60–74 (67, #f39c12), 0–59 (30, #e74c3c)
- Catégorie : 3 · fait autrement

**3.111** · Geste : ajouter un niveau (« + Ajouter un niveau »)
- Intention, l. 1300 :
  > quitter l'échelle oublie le niveau en attente, sans question
- Observation : aucune mention (termes cherchés : « quitter l'échelle », « oublie le niveau », « niveau en attente »)
- Catégorie : 2 · prévu mais pas fait

**3.112** · Geste : modifier un niveau (code, nom, bornes, valeur, palier SOLO, ordre)
- Intention, l. 1308 :
  > le palier SOLO s'interprète au survol du niveau ; sans étiquette, c'est le nom du niveau qui s'affiche
- Observation : aucune mention (termes cherchés : « survol », « palier SOLO », « infobulle du niveau »)
- Catégorie : 2 · prévu mais pas fait

**3.113** · Geste : modifier un niveau (code, nom, bornes, valeur, palier SOLO, ordre)
- Intention, l. 1311 :
  > employé : le codex est proposé d'abord
- Observation : aucune mention (termes cherchés : « niveau employé », « codex avant de retirer un niveau »)
- Catégorie : 2 · prévu mais pas fait

**3.114** · Geste : corriger une échelle déjà employée (sans la supprimer)
- Intention, l. 1315 :
  > le recalcul des évaluations touchées doit être possible ; il est PROPOSÉ, jamais automatique, et la proposition nomme le compte avant le geste ; refusé dans un trimestre clos ou archivé
- Observation : aucune mention (termes cherchés : « recalcul des évaluations », « corriger une échelle employée », « trimestre clos »)
- Catégorie : 2 · prévu mais pas fait

**3.115** · Geste : renommer une échelle
- Intention, l. 1326 :
  > une échelle hors du trimestre actif ne s'écrit pas, et le refus le dit
- Observation : aucune mention (termes cherchés : « hors du trimestre actif », « échelle d'un autre trimestre »)
- Catégorie : 2 · prévu mais pas fait

**3.116** · Geste : dupliquer une échelle
- Intention, l. 1330 :
  > sur un échec, le témoin dit « Dupliquer l'échelle »
- Observation : aucune mention (termes cherchés : « Dupliquer l'échelle », « Non enregistré – Dupliquer »)
- Catégorie : 2 · prévu mais pas fait

**3.117** · Geste : supprimer une échelle
- Intention, l. 1336 :
  > tout ce qui la nomme suit (évaluations, productions, pratiques de notation, grilles et cartouches du trimestre), puis l'ancienne est retirée
- Observation, l. 980 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › « Supprimer ») :
  > Avec une échelle compatible : `prompt` de choix puis `remplacerEchellePartout` (js/echelles.js:2292) réécrit `echelleId` dans les magasins porteurs (lu dans le code, non exécuté).
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**3.118** · Geste : supprimer une échelle
- Intention, l. 1337 :
  > « Supprimer l'échelle «X», c'est la remplacer : N évaluations, N productions… suivront. Par quelle échelle la remplacer ? »
- Observation, l. 980 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › « Supprimer ») :
  > Avec une échelle compatible : `prompt` de choix puis `remplacerEchellePartout` (js/echelles.js:2292) réécrit `echelleId` dans les magasins porteurs (lu dans le code, non exécuté).
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**3.119** · Geste : supprimer une échelle
- Intention, l. 1339 :
  > dans un trimestre terminé ou archivé, refus, en disant que le remplacement toucherait des notes déjà remises
- Observation : aucune mention (termes cherchés : « trimestre terminé », « archivé », « notes déjà remises »)
- Catégorie : 2 · prévu mais pas fait

**3.120** · Geste : supprimer une échelle
- Intention, l. 1340 :
  > sur un échec, le témoin dit « Supprimer l'échelle » ou « Remplacer l'échelle »
- Observation : aucune mention (termes cherchés : « Supprimer l'échelle », « Remplacer l'échelle »)
- Catégorie : 2 · prévu mais pas fait

**3.121** · Sans geste
- Intention, l. 1347 :
  > aucune échelle, aucun code, aucune borne en dur
- Observation, l. 953 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › « + Nouvelle échelle ») :
  > 4 niveaux préremplis sans code ni nom : 90–100 (valeur 95, #27ae60), 75–89 (82, #3498db), 60–74 (67, #f39c12), 0–59 (30, #e74c3c)
- Observation, l. 2203 (Labo › Outils d'observation) :
  > ajout `"idme":{"insuffisant":0.64,"developpement":0.75,"maitrise":0.85}`
- Catégorie : 3 · fait autrement

### Fait sans être prévu, sans ligne correspondante dans l'intention

**3.122** · Conception — ressources (productions, grilles, échelles, cartouches) › Accès à l'onglet et aux sous-écrans
- Intention : aucune mention (termes cherchés : « puise dans la bibliothèque », « Crée une nouvelle production », « liste vide »)
- Observation, l. 773 (Conception — ressources (productions, grilles, échelles, cartouches) › Accès à l'onglet et aux sous-écrans) :
  > productions « Crée une nouvelle production ou puise dans la bibliothèque »
- Catégorie : 1 · fait sans être prévu

**3.123** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « + Nouvelle production »
- Intention : aucune mention (termes cherchés : « accompagnement-vu », « flèche », « Clique ici pour créer »)
- Observation, l. 780 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « + Nouvelle production ») :
  > `accompagnement-vu__conception-productions-nouvelle` : absent → `1` (localStorage seulement)
- Catégorie : 1 · fait sans être prévu

**3.124** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Sélecteur Type
- Intention : aucune mention (termes cherchés : « portfolio se configurent », « grille désactivée », « Ce n'est pas le portfolio »)
- Observation, l. 788 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Sélecteur Type) :
  > `portfolio` : note « Les règles de calcul du portfolio se configurent dans Construction de la note → Pratique de notation. », grille désactivée et vidée, date désactivée et vidée, note « Ce n'est pas le portfolio comme tel qui est évalué, mais les artefacts qui le composent. »
- Catégorie : 1 · fait sans être prévu

**3.125** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Sélecteur Type
- Intention : aucune mention (termes cherchés : « Chaque artefact peut avoir sa propre grille », « propre grille »)
- Observation, l. 789 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Sélecteur Type) :
  > note « Chaque artefact peut avoir sa propre grille de critères. »
- Catégorie : 1 · fait sans être prévu

**3.126** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Date d'échéance
- Intention : aucune mention (termes cherchés : « séance de la semaine », « 2e séance », « jour de la semaine sous la date »)
- Observation, l. 797 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Date d'échéance) :
  > pour 2026-10-28, le programme affiche « mercredi 28 oct., 2e séance de la semaine 10 »
- Catégorie : 1 · fait sans être prévu

**3.127** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Créer la production »
- Intention : aucune mention (termes cherchés : « CRÉÉ LE », « MODIFIÉ LE », « panneau métadonnées »)
- Observation, l. 807 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Créer la production ») :
  > panneau métadonnées « AUTEUR Prof Fictif-Zorglub / CRÉÉ LE 13 octobre 2026 / MODIFIÉ LE — »
- Observation, l. 897 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › « Créer la grille ») :
  > panneau métadonnées (AUTEUR, CRÉÉ LE 14 octobre 2026, DESCRIPTION « Exemple de grille »)
- Catégorie : 1 · fait sans être prévu

**3.128** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Créer la production »
- Intention : aucune mention (termes cherchés : « pondération totale », « manquant », « en trop »)
- Observation, l. 808 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Créer la production ») :
  > somme les pondérations hors `artefact-portfolio` dans `#ponderationTotale` (élément masqué). Avec 30 % : « 30% », « 70% manquant ».
- Catégorie : 1 · fait sans être prévu

**3.129** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Élément de la liste latérale
- Intention : aucune mention (termes cherchés : « dateModification », « sortie du champ », « fiche précédente »)
- Observation, l. 813 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Élément de la liste latérale) :
  > Si un champ de la fiche précédente a encore le focus, l'événement `change` émis à la sortie du champ réécrit la production précédente (`dateModification` seule modifiée)
- Observation, l. 914 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Modification d'une grille existante) :
  > Un `change` émis à la sortie d'un champ déjà enregistré réécrit la grille (`dateModification` seule)
- Catégorie : 1 · fait sans être prévu

**3.130** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Exporter la liste en PDF »
- Intention : aucune mention (termes cherchés : « Exporter la liste en PDF », « liste des productions en PDF », « productions.pdf »)
- Observation, l. 848 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Exporter la liste en PDF ») :
  > « Exporter la liste en PDF »
- Observation, l. 849 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Exporter la liste en PDF ») :
  > le bouton reste masqué (`display:none` par `.btn-export-pdf`, styles.css:13367)
- Observation, l. 849 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Exporter la liste en PDF ») :
  > Déclenché par un clic DOM : téléchargement `productions.pdf` (1 page lettre portrait)
- Catégorie : 1 · fait sans être prévu

**3.131** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Préparer le PDF »
- Intention : aucune mention (termes cherchés : « Orientation », « paysage », « portrait », « Entête », « en-tête du document de consignes », « Pied de page », « pied », « choisir la production », « sélecteur de production dans l'aperçu »)
- Observation, l. 854 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Préparer le PDF ») :
  > options Contenu Consignes/Évaluation/Rétroaction, Disposition, Orientation, Entête, Pied de page, Production
- Catégorie : 1 · fait sans être prévu

**3.132** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Préparer le PDF »
- Intention : aucune mention (termes cherchés : « derniers réglages », « réglages du PDF », « exportPDF »)
- Observation, l. 855 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Préparer le PDF ») :
  > écrit `exportPDF_derniersReglages` : absent → `{"orientation":"paysage","piedEnseignant":true,"piedLicence":true,"afficherTrimestre":true}` (localStorage + IDB)
- Catégorie : 1 · fait sans être prévu

**3.133** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Critère algorithmique
- Intention : aucune mention (termes cherchés : « sous-critères par défaut », « 0-10 », « Aucune erreur »)
- Observation, l. 917 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Critère algorithmique) :
  > « 📋 Utiliser sous-critères par défaut (0-10) » `initialiserSousCriteresParDefaut` (js/grilles.js:3467) : `sousCriteres` absent → 11 entrées `sc_0`…`sc_10`
- Catégorie : 1 · fait sans être prévu

**3.134** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Critère algorithmique
- Intention : aucune mention (termes cherchés : « code posable », « sous-critère de pondération 0 »)
- Observation, l. 917 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Critère algorithmique) :
  > « Un sous-critère de pondération 0 n'est pas un code posable (un ici). »
- Catégorie : 1 · fait sans être prévu

**3.135** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Critère algorithmique
- Intention : aucune mention (termes cherchés : « Formule appliquée », « Note = Pondération »)
- Observation, l. 920 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Critère algorithmique) :
  > Par défaut l'écran affiche « Formule appliquée : Note = Pondération − (Erreurs ÷ Mots × 500) »
- Catégorie : 1 · fait sans être prévu

**3.136** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Critère algorithmique
- Intention : aucune mention (termes cherchés : « Seuil de l'épreuve », « erreurs pour », « 900 mots »)
- Observation, l. 922 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Critère algorithmique) :
  > l'écran affiche « Seuil de l'épreuve : 1 erreur à chaque 30 mots (30 erreurs pour 900 mots) »
- Catégorie : 1 · fait sans être prévu

**3.137** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › « + Nouvelle échelle »
- Intention : aucune mention (termes cherchés : « aperçu de l'échelle », « à travailler », « apercuEchelleNiveaux »)
- Observation, l. 953 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › « + Nouvelle échelle ») :
  > aperçu « ? 90%-100% | ? 75%-89% | ? 60%-74% | ? 0%-59% »
- Observation, l. 961 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › « Créer l'échelle ») :
  > aperçu `#apercuEchelleNiveaux` « A 90%-100% maîtrisé | B 75%-89% maîtrisé | C 60%-74% suffisant | D 0%-59% à travailler »
- Catégorie : 1 · fait sans être prévu

**3.138** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Modification d'une échelle existante
- Intention : aucune mention (termes cherchés : « dernier niveau », « au moins un niveau »)
- Observation, l. 971 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Modification d'une échelle existante) :
  > refus du dernier niveau (lu dans le code js/echelles.js:2051)
- Catégorie : 1 · fait sans être prévu

**3.139** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Zone d'aperçu
- Intention : aucune mention (termes cherchés : « PDF de l'échelle », « Exporter en PDF », « Veuillez d'abord »)
- Observation, l. 983 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Zone d'aperçu) :
  > zone jamais affichée (`afficherApercuEchelleSelectionnee`, js/export-pdf.js:1209, sans appelant)
- Observation, l. 983 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Zone d'aperçu) :
  > déclenché par clic DOM avec une échelle ouverte : `alert` « Veuillez d'abord selectionner une echelle. »
- Catégorie : 1 · fait sans être prévu

**3.140** · Ce qui se produit sans geste de l'utilisateur › Conception › Productions, grilles, échelles, rétroactions
- Intention : aucune mention (termes cherchés : « migration », « dansBibliotheque », « migrer »)
- Observation, l. 2760 (Ce qui se produit sans geste de l'utilisateur › Conception › Productions, grilles, échelles, rétroactions) :
  > `migrerProductionsVersBibliotheque` pose `dansBibliotheque:true` sur les productions qui n'ont pas ce champ
- Catégorie : 1 · fait sans être prévu

**3.141** · Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions
- Intention : aucune mention (termes cherchés : « terminale », « STD », « typer »)
- Observation, l. 2876 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > `typerProductionCommeTerminale` (js/productions.js:265) : bouton généré dans `#zone-avertissements-productions` seulement si la pratique active est STD
- Catégorie : 1 · fait sans être prévu

---

## Partie 4 · Conception : Rétroactions, Pratiques de notation, Carte d'alignement, bibliothèques et partage

### Écran 29 · Conception › Rétroactions (cartouches)

**4.1** · Geste : Créer une cartouche
- Intention, l. 1360 :
  > quitter avant de créer avertit « Cette cartouche n'est pas encore créée. », avec « Rester » (sélectionné) et « Quitter sans créer »
- Observation, l. 1009 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « + Nouvelle cartouche ») :
  > Commentaire saisi avant création (`change` sur une case) : aucune écriture ; notification « Cette cartouche n'est pas encore créée Ce que tu tapes n'est gardé qu'à l'écran. Clique sur « Créer la cartouche » ; ensuite, chaque champ s'enregistrera tout seul. »
- Catégorie : 3 · fait autrement

**4.2** · Geste : Créer une cartouche
- Intention, l. 1361 :
  > sans échelle choisie, la matrice le dit au lieu d'inventer des colonnes
- Observation, l. 1008 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « + Nouvelle cartouche ») :
  > Grille seule : matrice non affichée.
- Catégorie : 3 · fait autrement

**4.3** · Geste : Créer une cartouche
- Intention, l. 1363 :
  > après l'ouverture d'un exemple en lecture seule, « + Nouvelle cartouche » ouvre un formulaire qu'on peut remplir, sans bandeau d'exemple
- Observation : aucune mention (termes cherchés : « Exemple fourni », « lecture seule », « bandeau d'exemple », « exemple (cartouche) »)
- Catégorie : 2 · prévu mais pas fait

**4.4** · Geste : Choisir la grille et l'échelle d'une cartouche
- Intention, l. 1368 :
  > une cartouche déjà liée à une grille retirée depuis continue de l'afficher dans son menu ; l'ouvrir pour la relire ne la rebranche pas sur une autre grille
- Observation : aucune mention (termes cherchés : « grille retirée », « dansBibliotheque: false (grille) dans le menu Grille », « rebranche »)
- Catégorie : 2 · prévu mais pas fait

**4.5** · Geste : Choisir la grille et l'échelle d'une cartouche
- Intention, l. 1369 :
  > une grille, une échelle ou une cartouche introuvable s'affiche « ⚠ introuvable » au lieu de « Aucune », et enregistrer ne l'efface pas
- Observation : aucune mention (termes cherchés : « ⚠ introuvable », « introuvable », « Aucune »)
- Catégorie : 2 · prévu mais pas fait

**4.6** · Geste : Écrire les commentaires de la matrice (par critère et par niveau)
- Intention, l. 1374 :
  > sur une grille analytique, la cartouche s'attache à des paliers en pourcentage : le champ dit « Paliers (bornes en %) », l'échelle de départ est déjà choisie, les colonnes portent les bornes de ton échelle (« 65–74,99 % ») au lieu des noms de niveaux
- Observation : aucune mention (termes cherchés : « Paliers », « bornes en % », « 65–74,99 % », « cartouche sur grille analytique »)
- Catégorie : 2 · prévu mais pas fait

**4.7** · Geste : Écrire les commentaires de la matrice (par critère et par niveau)
- Intention, l. 1375 :
  > « Non enregistré : ‹raison› »
- Observation, l. 1020 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Modification d'une cartouche existante) :
  > témoin « Non enregistré – Modifier la cartouche : le nom ne peut pas être vide. »
- Catégorie : 3 · fait autrement

**4.8** · Geste : Renommer une cartouche ou modifier son contexte spécifique
- Intention, l. 1380 :
  > sur l'iPad, toucher directement une autre cartouche dans la liste garde le nom tapé
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**4.9** · Geste : Renommer une cartouche ou modifier son contexte spécifique
- Intention, l. 1382 :
  > si le nouveau nom est déjà pris, la question du doublon se pose quand on quitte le champ
- Observation : aucune mention (termes cherchés : « Conflit de nom (cartouche) », « porte déjà le nom », « doublon de nom de cartouche », « modalConflitDoublon (cartouches) »)
- Catégorie : 2 · prévu mais pas fait

**4.10** · Geste : Donner à une cartouche le nom d'une cartouche existante (« Conflit de nom »)
- Intention, l. 1386 :
  > la fenêtre s'ouvre sur « Une cartouche de rétroaction porte déjà le nom « X ». » et, sous « Remplacer l'existante » : « L'existante sera remplacée par la nouvelle, si rien ne l'emploie. Cette action est irréversible. »
- Observation : aucune mention (termes cherchés : « Une cartouche de rétroaction porte déjà le nom », « Remplacer l'existante (cartouche) », « Conflit de nom »)
- Catégorie : 2 · prévu mais pas fait

**4.11** · Geste : Donner à une cartouche le nom d'une cartouche existante (« Conflit de nom »)
- Intention, l. 1387 :
  > « Remplacer l'existante » refuse de remplacer une cartouche que des évaluations ou des productions emploient ; rien n'est modifié
- Observation : aucune mention (termes cherchés : « Remplacer l'existante », « l'emploient », « productions emploient »)
- Catégorie : 2 · prévu mais pas fait

**4.12** · Geste : Donner à une cartouche le nom d'une cartouche existante (« Conflit de nom »)
- Intention, l. 1388 :
  > le refus dit « Une cartouche porte déjà ce nom, et N … l'emploient : l'écraser changerait des notes. Donne un autre nom à la nouvelle. »
- Observation : aucune mention (termes cherchés : « l'écraser changerait des notes », « Donne un autre nom », « l'emploient »)
- Catégorie : 2 · prévu mais pas fait

**4.13** · Geste : Donner à une cartouche le nom d'une cartouche existante (« Conflit de nom »)
- Intention, l. 1389 :
  > un homonyme que rien n'emploie s'écrase comme avant
- Observation : aucune mention (termes cherchés : « homonyme », « s'écrase », « Remplacer l'existante (cartouche) »)
- Catégorie : 2 · prévu mais pas fait

**4.14** · Geste : Donner à une cartouche le nom d'une cartouche existante (« Conflit de nom »)
- Intention, l. 1390 :
  > si la cartouche ouverte pendant la question est celle qui porte déjà ce nom, rien n'est écrit et le témoin dit « tu as ouvert la cartouche qui porte déjà ce nom. »
- Observation : aucune mention (termes cherchés : « tu as ouvert la cartouche qui porte déjà ce nom », « porte déjà ce nom »)
- Catégorie : 2 · prévu mais pas fait

**4.15** · Geste : Télécharger un modèle de cartouche (à faire remplir)
- Intention, l. 1397 :
  > un conseil concret sous le seuil de maîtrise, aucun au-dessus, et interdisent d'inventer le moindre détail d'une copie pas encore remise
- Observation : aucune mention (termes cherchés : « conseil », « invent », « seuil de maîtrise », « au-dessus », « pas encore remise »)
- Catégorie : 2 · prévu mais pas fait

**4.16** · Geste : Télécharger un modèle de cartouche (à faire remplir)
- Intention, l. 1398 :
  > et dit quand l'échelle n'en a pas
- Observation : aucune mention (termes cherchés : « n'en a pas », « sans repère », « aucun repère », « Maîtrisé à partir de (modèle sans repère) »)
- Catégorie : 2 · prévu mais pas fait

**4.17** · Geste : Réimporter un modèle rempli
- Intention, l. 1403 :
  > le fichier rempli, réimporté, donne la cartouche
- Observation, l. 1034 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « Importer depuis un fichier texte ») :
  > **Écrit** : rien ; les commentaires sont placés dans `cartoucheActuel.commentaires` en mémoire (js/cartouches.js:1404-1412) ; le stockage garde ses commentaires précédents, y compris après un enregistrement ultérieur du nom
- Observation, l. 1035 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « Importer depuis un fichier texte ») :
  > notification « 3 commentaire(s) importé(s) depuis le fichier ! » (2 lignes remplies dans le fichier). Valeurs obtenues (relevées dans l'export texte suivant) : `Un (B)` = « Exemple importé B1 » ; `Un (A)` = « Fictif-Critère Un (C)** : **Fictif-Critère Un (D)** : --- » ; `Deux bis (B)` = « Fictif-Critère Deux bis (A)** : **Fictif-Critère Deux bis (C)** : **Fictif-Critère Deux bis (D)** : Exemple importé D2 » : les lignes vides suivantes sont absorbées dans le commentaire
- Catégorie : 3 · fait autrement

**4.18** · Geste : Dupliquer une cartouche
- Intention, l. 1410 :
  > puis « X (copie 2) », « X (copie 3) »
- Observation : aucune mention (termes cherchés : « copie 2 », « (copie 2) », « copie 3 »)
- Catégorie : 2 · prévu mais pas fait

**4.19** · Geste : Supprimer une cartouche depuis la liste
- Intention, l. 1414 :
  > « Supprimer la cartouche «X» de sa grille « G » ? »
- Observation, l. 1021 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Modification d'une cartouche existante) :
  > « Supprimer » affiche `confirm` « Supprimer la cartouche «undefined» de sa grille « Grille de départ » ? … » sans écriture
- Catégorie : 3 · fait autrement

**4.20** · Geste : Supprimer une cartouche depuis la liste
- Intention, l. 1415 :
  > les rétroactions déjà rédigées dans les évaluations restent
- Observation : aucune mention (termes cherchés : « rétroaction déjà rédigée », « évaluation(s) l'emploient », « cartouche supprimée évaluation »)
- Catégorie : 2 · prévu mais pas fait

**4.21** · Énoncé 4 (une rétroaction ne parle que de la discipline de celui qui l'écrit), côté cartouches
- Intention, l. 1426 :
  > Aucun enseignant ne lit dans son interface le SRPNF, l'EUF, le CAF ou la littérature s'il n'en fait pas
- Observation, l. 922 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Critère algorithmique) :
  > « Projection » (`modifierModeleProjectionGrilleHandler`) : options « Projection à l'EUF » (`norme_externe`), « Aucune projection »
- Catégorie : 3 · fait autrement

**4.22** · Sans geste
- Intention, l. 1434 :
  > Changer de trimestre referme l'éditeur de cartouche resté ouvert
- Observation : aucune mention (termes cherchés : « Changer de trimestre », « referme », « éditeur de cartouche », « fermerFicheCartouche (changement de trimestre) »)
- Catégorie : 2 · prévu mais pas fait

**4.23** · Sans geste
- Intention, l. 1436 :
  > les autres trimestres, et ceux à venir, la reçoivent encore
- Observation : aucune mention (termes cherchés : « autre trimestre (Cartouche de départ) », « h2027_cartouches », « assurerCartoucheDeDepart (autre trimestre) »)
- Catégorie : 2 · prévu mais pas fait

### Écran 30 · Conception › Rétroactions › « Consulter la bibliothèque » (cartouches)

**4.24** · Geste : Supprimer une cartouche depuis la bibliothèque (première section)
- Intention, l. 1442 :
  > « Supprimer définitivement la cartouche «X» ? », puis, seulement si c'est vrai, « Elle part de sa grille « G » et de la bibliothèque partagée. »
- Observation, l. 1062 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Fenêtre « Bibliothèque de cartouches de rétroaction ») :
  > `confirm` « Supprimer définitivement la cartouche «Fictif-Cartouche Renommée (copie)» de sa grille « Fictif-Grille Zorglub Renommée » ? Cette action est irréversible. »
- Catégorie : 3 · fait autrement

**4.25** · Geste : Retirer une cartouche de la bibliothèque partagée (seconde section)
- Intention, l. 1447 :
  > « Retirer «X» de la bibliothèque partagée ? » et « Le retrait est irréversible ; la cartouche reste dans sa grille « G ». »
- Observation, l. 1064 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Fenêtre « Bibliothèque de cartouches de rétroaction ») :
  > `confirm` « Retirer «Fictif-Cartouche Renommée» de la Bibliothèque ? Le retrait est irréversible ; la cartouche reste dans sa grille « Fictif-Grille Zorglub Renommée ». »
- Catégorie : 3 · fait autrement

**4.26** · Geste : Retirer une cartouche de la bibliothèque partagée (seconde section)
- Intention, l. 1447 :
  > sinon « Supprimer définitivement «X» de la bibliothèque partagée ? »
- Observation : aucune mention (termes cherchés : « Supprimer définitivement « », « de la bibliothèque partagée ? », « supprimerCartoucheDeBibliothequePartagee (sans grille) »)
- Catégorie : 2 · prévu mais pas fait

**4.27** · Geste : Ajouter une cartouche de la bibliothèque à sa sélection
- Intention, l. 1452 :
  > un second ajout de la même cartouche est refusé ; le blocage porte sur l'identité, jamais sur le nom
- Observation : aucune mention (termes cherchés : « second ajout », « déjà dans ta sélection », « déjà présent », « ajouterCartoucheIndividuelle (deux fois) »)
- Catégorie : 2 · prévu mais pas fait

**4.28** · Geste : Ajouter une cartouche de la bibliothèque à sa sélection
- Intention, l. 1453 :
  > le refus nomme l'exemplaire déjà présent et propose « Dupliquer »
- Observation : aucune mention (termes cherchés : « déjà dans ta sélection », « exemplaire déjà présent », « propose « Dupliquer » »)
- Catégorie : 2 · prévu mais pas fait

### Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur)

**4.29** · Geste : Modifier une pratique existante dans l'éditeur
- Intention, l. 1464 :
  > « Annuler » devient « Fermer »
- Observation : aucune mention (termes cherchés : « Fermer (éditeur de pratique) », « Annuler (éditeur de pratique) », « fermerFichePratique », « accueilPratiques »)
- Catégorie : 2 · prévu mais pas fait

**4.30** · Geste : Modifier une pratique existante dans l'éditeur
- Intention, l. 1466 :
  > un réglage n'a qu'un nom
- Observation, l. 1120 (Conception — Pratiques de notation › Assistant de configuration › Parcours SPE (décrire → acceptable) — entrées : 8 évaluations, seuil d'acceptabilité 90, jetons activés, 4 jetons délai, 5 jours, délai sur reprise coché, 1 jeton reprise, forfaits « sciences », nom « Fictif-SPE Zorglub », discipline « 201 Mathématique ») :
  > jetons:{activer:true, delai:{nombre:4, dureeJours:5, surReprise:true}
- Observation, l. 1170 (Conception — Pratiques de notation › Éditeur de pratique › Champs enregistrés par) :
  > sauf si la pratique porte `configuration.jetons` ou `config.jetons`
- Observation, l. 1174 (Conception — Pratiques de notation › Éditeur de pratique › Champs enregistrés par) :
  > jetons:{actif:true, nombre:3, delaiDuree:4, delaiSurReprise:true
- Catégorie : 3 · fait autrement

**4.31** · Geste : Modifier une pratique existante dans l'éditeur
- Intention, l. 1467 :
  > le témoin dit « Enregistré » ou « Non enregistré : ‹raison› »
- Observation : aucune mention (termes cherchés : « Enregistré (Pratiques de notation) », « témoin (éditeur de pratique) », « Non enregistré – Modifier la pratique »)
- Catégorie : 2 · prévu mais pas fait

**4.32** · Geste : Régler les jetons d'une pratique
- Intention, l. 1472 :
  > le formulaire le dit et ne laisse plus rien modifier en vain
- Observation, l. 1202 (Conception — Pratiques de notation › Éditeur de pratique › Pratique SPE ouverte (« Fictif-SPE Zorglub », créée par l'assistant)) :
  > `#mat-jetons-actif.disabled` observé à `false`
- Catégorie : 3 · fait autrement

**4.33** · Geste : Régler les jetons d'une pratique
- Intention, l. 1473 :
  > la carte de la pratique affiche « N jetons » quand des jetons sont réglés
- Observation : aucune mention (termes cherchés : « N jetons », « jetons (badge de la barre latérale) », « badge »)
- Catégorie : 2 · prévu mais pas fait

**4.34** · Geste : Cocher « notes finales » (notes finalisées)
- Intention, l. 1478 :
  > la carte de la pratique affiche « notes finalisées » quand la case est cochée
- Observation : aucune mention (termes cherchés : « notes finalisées (badge) », « badge », « notesFinales (carte) »)
- Catégorie : 2 · prévu mais pas fait

**4.35** · Geste : Cocher « notes finales » (notes finalisées)
- Intention, l. 1479 :
  > le titre de la note passe de « Note provisoire » à « Note finale »
- Observation : aucune mention (termes cherchés : « Note finale (titre) », « Note provisoire → Note finale », « notesFinales »)
- Catégorie : 2 · prévu mais pas fait

**4.36** · Geste : Choisir l'affichage de la note (« note en lettre »)
- Intention, l. 1483 :
  > le PDF remis à l'élève le respecte
- Observation : aucune mention (termes cherchés : « affichageNote (PDF) », « lettre (PDF) », « Niveau de performance (PDF) »)
- Catégorie : 2 · prévu mais pas fait

**4.37** · Geste : Éditer les cibles d'une pratique par dénotation
- Intention, l. 1488 :
  > la déplacer ou la renommer ne déplace plus les coches déjà faites ; une cible retirée emporte ses coches
- Observation : aucune mention (termes cherchés : « coches », « jugementsDenotation (déplacement de cible) », « renommer une cible »)
- Catégorie : 2 · prévu mais pas fait

**4.38** · Geste : Éditer les cibles d'une pratique par dénotation
- Intention, l. 1489 :
  > retirer une cible déjà cochée dit laquelle et pour combien d'étudiant·es avant d'enregistrer
- Observation, l. 2889 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Codex avant suppression d'un type de travail / forfait / cible portant des notes (aucune note dans l'état d'observation).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.39** · Geste : Régler les forfaits d'une pratique par spécifications
- Intention, l. 1494 :
  > quand aucun forfait n'est atteint et que la pratique n'a pas fixé de note pour ce cas, il n'y a pas de note (ni 0, ni 50)
- Observation : aucune mention (termes cherchés : « aucun forfait atteint », « ni 0 », « forfait sans travaux requis », « note SPE »)
- Catégorie : 2 · prévu mais pas fait

**4.40** · Geste : Régler les forfaits d'une pratique par spécifications
- Intention, l. 1495 :
  > les modèles de forfaits s'appellent « Forfaits progressifs », « Forfait unique », « Forfaits flexibles »
- Observation, l. 1118 (Conception — Pratiques de notation › Assistant de configuration › Parcours SPE (décrire → acceptable) — entrées : 8 évaluations, seuil d'acceptabilité 90, jetons activés, 4 jetons délai, 5 jours, délai sur reprise coché, 1 jeton reprise, forfaits « sciences », nom « Fictif-SPE Zorglub », discipline « 201 Mathématique ») :
  > choix-modele-bundles [7/9] (options sciences, simple, litterature, personnalise)
- Catégorie : 3 · fait autrement

**4.41** · Geste : Appliquer une pratique au groupe-cours actif
- Intention, l. 1505 :
  > un tiret à la place de la note, partout, et le diagnostic « Aucune pratique de notation n'est assignée à ce groupe-cours. Ouvre Conception → Pratiques de notation, choisis… »
- Observation : aucune mention (termes cherchés : « Aucune pratique de notation n'est assignée », « tiret », « pratique assignée »)
- Catégorie : 2 · prévu mais pas fait

**4.42** · Geste : Dupliquer une pratique, ou en dériver une variante
- Intention, l. 1510 :
  > la copie d'une pratique-gabarit cesse d'être un gabarit, quel que soit le bouton
- Observation, l. 1241 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Ajouter ») :
  > l'id du gabarit est conservé, `estGabarit` reste `true`
- Catégorie : 3 · fait autrement

**4.43** · Geste : Dupliquer une pratique, ou en dériver une variante
- Intention, l. 1511 :
  > l'invite propose le nom de la pratique source, pas « Copie de pratique »
- Observation, l. 1225 (Conception — Pratiques de notation › Éditeur de pratique › Bouton « Dupliquer ») :
  > `nom:"Fictif-SOM Zorglub (copie)"`
- Observation, l. 1226 (Conception — Pratiques de notation › Éditeur de pratique › Bouton « Dupliquer ») :
  > notification « Pratique dupliquée » ; l'éditeur ouvre la copie
- Catégorie : 3 · fait autrement

**4.44** · Geste : Dupliquer une pratique, ou en dériver une variante
- Intention, l. 1512 :
  > plus de « X (copie) (copie) »
- Observation : aucune mention (termes cherchés : « (copie) (copie) », « copie de copie », « copie 2 »)
- Catégorie : 2 · prévu mais pas fait

**4.45** · Geste : Dupliquer une pratique, ou en dériver une variante
- Intention, l. 1513 :
  > une retouche de l'échelle ne recalcule pas ses notes d'office : le recalcul est proposé, comme pour une échelle déjà employée
- Observation : aucune mention (termes cherchés : « recalcul proposé », « échelle de référence », « retouche de l'échelle », « pratique ancienne »)
- Catégorie : 2 · prévu mais pas fait

**4.46** · Geste : Ranger ses pratiques dans « Mes dossiers »
- Intention, l. 1517 :
  > une pratique est rangée à un seul endroit
- Observation, l. 2886 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Classement dans un dossier (`BibliothequeUI.repertoires.classer/retirer/renommer/supprimer`, `basculer`)
- Observation, l. 1293 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › Dossiers « Mes dossiers ») :
  > Les actions de classement (`BibliothequeUI.repertoires.classer/retirer`, menu ⋮ des cartes de la section 2) ne sont pas observées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.47** · Geste : Ranger ses pratiques dans « Mes dossiers »
- Intention, l. 1518 :
  > le classement n'organise que l'affichage, il ne modifie jamais les pratiques ; supprimer un dossier ne supprime pas ses pratiques, qui repassent en « Non classées »
- Observation, l. 2886 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Classement dans un dossier (`BibliothequeUI.repertoires.classer/retirer/renommer/supprimer`, `basculer`)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.48** · Geste : Ranger ses pratiques dans « Mes dossiers »
- Intention, l. 1519 :
  > chaque dossier regroupe ses pratiques dans un menu compact ; on en choisit une pour l'ajouter à sa barre latérale ; ce qui n'est pas rangé reste sous « Non classées » ; la zone « Mes dossiers » se replie
- Observation, l. 2886 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Classement dans un dossier (`BibliothequeUI.repertoires.classer/retirer/renommer/supprimer`, `basculer`)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.49** · Énoncé 4, côté pratiques
- Intention, l. 1524 :
  > l'idée « l'algorithme propose, le jugement tranche » est présentée comme inspirée de Bruno Voisard, « La machine à produire des notes », Substack, 4 mai 2026 (section « En guise de conclusion : quelques pistes de solution »), sans guillemets de citation
- Observation : aucune mention (termes cherchés : « algorithme propose », « jugement tranche », « La machine à produire des notes », « Substack »)
- Catégorie : 2 · prévu mais pas fait

**4.50** · Sans geste
- Intention, l. 1530 :
  > Changer de trimestre referme l'éditeur de pratique resté ouvert
- Observation : aucune mention (termes cherchés : « Changer de trimestre », « referme », « conteneurEditionPratique (changement de trimestre) »)
- Catégorie : 2 · prévu mais pas fait

### Écran 32 · Assistant de pratique

**4.51** · Geste : Ouvrir l'assistant et choisir une porte
- Intention, l. 1539 :
  > « Je ne suis pas certain·e » pose deux questions sur ce que l'enseignant fait (comment il corrige, ce qu'il advient d'une reprise) pour déduire la famille
- Observation, l. 1101 (Conception — Pratiques de notation › Assistant de configuration) :
  > **« Je ne suis pas certain·e »** → « Identifions ta méthode » (uniteCorrection, sortReprise) ; inférence `_infererFamilleComportementale` (l. 49-56) : pourcentage+remplacee (divergent) → « Une dernière précision » (departagePratique)
- Catégorie : 3 · fait autrement

**4.52** · Geste : Ouvrir l'assistant et choisir une porte
- Intention, l. 1540 :
  > au-delà d'environ 15 objectifs, une alerte non bloquante
- Observation : aucune mention (termes cherchés : « 15 objectifs », « alerte non bloquante », « objectifs (alerte) »)
- Catégorie : 2 · prévu mais pas fait

**4.53** · Geste : Configurer une sommative
- Intention, l. 1547 :
  > le seuil, les jetons
- Observation : aucune mention (termes cherchés : « jetons (parcours SOM) », « regles-sommative (options) », « config-sommative-regles jetons »)
- Catégorie : 2 · prévu mais pas fait

**4.54** · Geste : Configurer une sommative
- Intention, l. 1548 :
  > une pratique déjà enregistrée garde les champs qu'elle porte
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.55** · Geste : Choisir l'échelle de la pratique dans l'assistant
- Intention, l. 1553 :
  > une échelle retirée de la barre latérale n'y paraît pas
- Observation : aucune mention (termes cherchés : « échelle retirée », « dansBibliotheque:false (échelle) assistant », « liste des échelles de l'assistant »)
- Catégorie : 2 · prévu mais pas fait

**4.56** · Geste : Choisir l'échelle de la pratique dans l'assistant
- Intention, l. 1553 :
  > sauf si la pratique rouverte l'utilise déjà : elle reste alors choisie, sans mot neuf
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.57** · Geste : Choisir l'échelle de la pratique dans l'assistant
- Intention, l. 1555 :
  > un nom d'échelle reçu d'ailleurs s'affiche comme du texte
- Observation : aucune mention (termes cherchés : « comme du texte », « échapp », « innerHTML », « nom d'échelle reçu »)
- Catégorie : 2 · prévu mais pas fait

**4.58** · Geste : Terminer l'assistant
- Intention, l. 1559 :
  > « Appliquer à la pratique » en modification ; plus de « créée » en modification ; message proposé « Pratique « … » mise à jour. »
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.59** · Geste : Terminer l'assistant
- Intention, l. 1560 :
  > le récapitulatif donne un exemple chiffré d'ordre de grandeur
- Observation, l. 2891 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Section « Ce que ça donnerait » avec valeurs simulées (`calculerExempleConsequence`, mode démo requis) : seul le texte de repli a été observé.
- Observation, l. 1105 (Conception — Pratiques de notation › Assistant de configuration › Parcours SOM (décrire → moyenne) — entrées : règle double_verrou, 5 évaluations, seuils 80/70/60, évaluation verrouillée « Examen Fictif-Zorglub », seuil 58, plafond 50, nom « Fictif-SOM Zorglub », description « Pratique sommative fictive », discipline « 101 Biologie ») :
  > « La note finale serait une moyenne pondérée : chaque évaluation compte une fois, selon son poids. » (texte de repli, hors mode démo, l. 1488-1517)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.60** · Geste : Abandonner l'assistant
- Intention, l. 1565 :
  > l'assistant ouvert puis abandonné n'écrit aucune grille ni rien d'autre
- Observation, l. 1084 (Conception — Pratiques de notation › Sous-écran › Bouton « + Nouvelle pratique ») :
  > `accompagnement-vu__contexte-pratiques-nouvelle` : absent → `1`
- Observation, l. 1139 (Conception — Pratiques de notation › Assistant de configuration › Repères d'échelle dans l'assistant (étape « Échelle de performance »)) :
  > **Écrit** (avant toute création de pratique) : `a2026_echellesTemplates[ECHELLE_IDME_DEPART].seuilSuffisance` absent → "D" ; `.seuilMaitrise` absent → "M" (observé à l'exécution). L'étape est réaffichée (`wizardV2RafraichirEtapeCourante`) et l'avertissement « Sans ces deux repères… » disparaît (observé). Ces écritures persistent même si l'assistant est annulé ensuite
- Catégorie : 3 · fait autrement

**4.61** · Geste : Abandonner l'assistant
- Intention, l. 1565 :
  > l'assistant ouvert puis abandonné n'écrit aucune grille ni rien d'autre
- Observation, l. 1112 (Conception — Pratiques de notation › Assistant de configuration › Parcours STD (décrire → niveaux) — entrées : 9 évaluations, seuils par défaut, 10 artefacts soumis, mode « hybride », 6 retenus, minimum 2, échelle) :
  > deux sélecteurs « Suffisant à partir de » / « Maîtrisé à partir de » (I/D/M/E)
- Observation, l. 1139 (Conception — Pratiques de notation › Assistant de configuration › Repères d'échelle dans l'assistant (étape « Échelle de performance »)) :
  > `a2026_echellesTemplates[ECHELLE_IDME_DEPART].seuilSuffisance` absent → "D" ; `.seuilMaitrise` absent → "M"
- Catégorie : 3 · fait autrement

**4.62** · Geste : Rouvrir une pratique existante dans l'assistant, puis l'enregistrer
- Intention, l. 1569 :
  > rien de ce qui a été réglé au formulaire ne se perd : jetons, réglage « notes finales », affichage de la note, catégories inactives
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.63** · Geste : Rouvrir une pratique existante dans l'assistant, puis l'enregistrer
- Intention, l. 1570 :
  > la mention « Inspiré de … », le statut de maquette, la licence et l'auteur d'origine survivent
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.64** · Geste : Rouvrir une pratique existante dans l'assistant, puis l'enregistrer
- Intention, l. 1571 :
  > le seuil, les forfaits et les jetons d'une pratique par spécifications ne changent pas
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.65** · Geste : Rouvrir une pratique existante dans l'assistant, puis l'enregistrer
- Intention, l. 1572 :
  > un modèle « N plus récentes » garde sa méthode « N derniers artefacts »
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.66** · Geste : Rouvrir une pratique existante dans l'assistant, puis l'enregistrer
- Intention, l. 1573 :
  > les règles d'une sommative ne reviennent pas aux valeurs par défaut
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.67** · Geste : Rouvrir une pratique existante dans l'assistant, puis l'enregistrer
- Intention, l. 1574 :
  > une pratique enregistrée autrefois « par objectifs » s'ouvre sur le portfolio, sans rien perdre
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.68** · Geste : Rouvrir une pratique existante dans l'assistant, puis l'enregistrer
- Intention, l. 1575 :
  > geste de Grégoire, une fois : vérifier « N jetons » et « notes finalisées » sur la carte de sa pratique active
- Observation, l. 9 (Conditions d'observation) :
  > Données : toutes fictives.
- Catégorie : 4 · non comparable (hors de la copie observée)

### Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » et bibliothèque des pratiques

**4.69** · Geste : Parcourir les modèles offerts
- Intention, l. 1584 :
  > cinq modèles fournis, aucun nommé par discipline ; au moins un par famille (jugement, spécifications, standards, sommative)
- Observation, l. 1237 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › Bouton « Consulter la bibliothèque ») :
  > « Pratiques disponibles… » : deux gabarits seulement, « SOM | Modèle sommatif | Gabarit | par Gabarit Labo Codex • Général » et « DEN | Modèle de base | Gabarit | … » (les gabarits STD-n-meilleurs, STD-n-recents, SPE-simple, d'auteur « Demo Labo Codex », ne sont pas affichés)
- Catégorie : 3 · fait autrement

**4.70** · Geste : Parcourir les modèles offerts
- Intention, l. 1586 :
  > « Aucun modèle « Sommative » fourni »
- Observation : aucune mention (termes cherchés : « Aucun modèle », « aucun modèle disponible », « fourni »)
- Catégorie : 2 · prévu mais pas fait

**4.71** · Geste : Parcourir les modèles offerts
- Intention, l. 1587 :
  > les copies déjà adoptées des modèles retirés restent telles quelles
- Observation : aucune mention (termes cherchés : « modèles retirés », « copies déjà adoptées », « gabarit retiré »)
- Catégorie : 2 · prévu mais pas fait

**4.72** · Geste : Adopter un modèle Standards (« N meilleures » ou « N plus récentes »)
- Intention, l. 1594 :
  > la note de l'élève est la même au profil, à l'export et au Comparateur
- Observation : aucune mention (termes cherchés : « même note profil export Comparateur », « N plus récentes (Comparateur) », « ECHELLE_IDME_DEPART (note comparée) »)
- Catégorie : 2 · prévu mais pas fait

**4.73** · Geste : Adopter un modèle Standards (« N meilleures » ou « N plus récentes »)
- Intention, l. 1595 :
  > une pratique déjà adoptée sans échelle n'est pas corrigée : la rouvrir par l'assistant, qui demande l'échelle
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.74** · Geste : Adopter un modèle Standards dans un trimestre sans aucune échelle
- Intention, l. 1599 :
  > « Ce modèle a besoin d'une échelle de performance pour calculer la note, et ce trimestre n'en a aucune. Crée une échelle dans Conception → Échelles de performance, puis reviens adopter ce modèle. » ; la fenêtre se ferme par « Fermer » et porte en titre le nom du modèle
- Observation : aucune mention (termes cherchés : « n'en a aucune », « Crée une échelle dans Conception », « trimestre sans échelle (adoption) »)
- Catégorie : 2 · prévu mais pas fait

**4.75** · Geste : Adopter un modèle Standards dans un trimestre sans aucune échelle
- Intention, l. 1600 :
  > l'adoption n'a pas lieu, rien n'est écrit
- Observation : aucune mention (termes cherchés : « n'en a aucune », « trimestre sans échelle (adoption) », « adoption refusée »)
- Catégorie : 2 · prévu mais pas fait

### Écran 34 · Conception › Carte d'alignement › canevas

**4.76** · Geste : Poser une leçon dans le temps
- Intention, l. 1616 :
  > sur une séquence, choisir une semaine déplace tout le bloc, ses leçons gardent leurs écarts
- Observation : aucune mention (termes cherchés : « déplace tout le bloc », « gardent leurs écarts », « semaine de la séquence »)
- Catégorie : 2 · prévu mais pas fait

**4.77** · Geste : Écrire les objectifs d'une leçon
- Intention, l. 1623 :
  > reformuler un objectif ne le remplace pas : ses liens survivent
- Observation : aucune mention (termes cherchés : « reformul », « texte de l'objectif modifié »)
- Catégorie : 2 · prévu mais pas fait

**4.78** · Geste : Écrire les objectifs d'une leçon
- Intention, l. 1625 :
  > le badge 🎯 d'une leçon est gris tant qu'aucun objectif n'est posé, en couleur dès qu'il y en a un
- Observation : aucune mention (termes cherchés : « badge gris », « en couleur dès »)
- Catégorie : 2 · prévu mais pas fait

**4.79** · Geste : Écrire les objectifs d'une leçon
- Intention, l. 1625 :
  > zone sensible de 44 px sur iPad
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**4.80** · Geste : Cocher les objectifs servis d'une activité ou d'un exposé
- Intention, l. 1635 :
  > si le dépôt ne peut pas aboutir, l'application le dit
- Observation : aucune mention (termes cherchés : « si le dépôt ne peut pas aboutir », « dépôt refusé »)
- Catégorie : 2 · prévu mais pas fait

**4.81** · Geste : Cocher les objectifs vérifiés d'une évaluation
- Intention, l. 1639 :
  > ou d'une leçon placée avant elle (« Leçon « X » (semaine N, séance B) »)
- Observation : aucune mention (termes cherchés : « placée avant », « Leçon « X » »)
- Catégorie : 2 · prévu mais pas fait

**4.82** · Geste : Cocher les objectifs vérifiés d'une évaluation
- Intention, l. 1640 :
  > un objectif coché d'une leçon devenue postérieure reste visible pour être décoché, et survit quand on coche une autre case
- Observation : aucune mention (termes cherchés : « devenue postérieure », « reste visible pour être décoché »)
- Catégorie : 2 · prévu mais pas fait

**4.83** · Geste : Cocher les objectifs vérifiés d'une évaluation
- Intention, l. 1641 :
  > cocher puis décocher un objectif ramène la carte à son état d'origine
- Observation : aucune mention (termes cherchés : « décocher un objectif », « état d'origine »)
- Catégorie : 2 · prévu mais pas fait

**4.84** · Geste : Cocher les objectifs vérifiés d'une évaluation
- Intention, l. 1643 :
  > infobulle de l'activité d'évaluation : « Vérification : l'évaluation ferme la boucle
- Observation : aucune mention (termes cherchés : « ferme la boucle », « Vérification : »)
- Catégorie : 2 · prévu mais pas fait

**4.85** · Geste : Glisser une évaluation sur un objectif
- Intention, l. 1647 :
  > « Objectif coché : cette évaluation le vérifie désormais. » ; « Déjà coché : cette évaluation vérifie cet objectif. » ; refus : « Une évaluation coche les objectifs de sa leçon ou d'une leçon placée avant elle. »
- Observation : aucune mention (termes cherchés : « Objectif coché », « Déjà coché », « Une évaluation coche »)
- Catégorie : 2 · prévu mais pas fait

**4.86** · Geste : Tracer un lien vers une évaluation
- Intention, l. 1651 :
  > les liens « se vérifie par » déjà tracés restent stockés, affichés et comptés comme avant
- Observation : aucune mention (termes cherchés : « se_verifie_par », « liens « se vérifie par » hérités », « déjà tracés »)
- Catégorie : 2 · prévu mais pas fait

**4.87** · Geste : Régler une évaluation (niveau cognitif, visée, production)
- Intention, l. 1657 :
  > tant que rien n'est choisi, les exports écrivent « Évaluation »
- Observation : aucune mention (termes cherchés : « visée non choisie », « les exports écrivent »)
- Catégorie : 2 · prévu mais pas fait

**4.88** · Geste : Régler une évaluation (niveau cognitif, visée, production)
- Intention, l. 1658 :
  > le sélecteur « Production » offre les douze types du formulaire, classés comme dans la Conception
- Observation, l. 548 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — ouverture par double-clic sur un bloc) :
  > `productions` du trimestre
- Observation, l. 553 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — ouverture par double-clic sur un bloc) :
  > « Production » (« Aucune » seule option avec l'état de base)
- Catégorie : 3 · fait autrement

**4.89** · Geste : Copier, cloner ou décloner un bloc
- Intention, l. 1663 :
  > un clone reste lié : titre, durée et type se propagent entre ses instances
- Observation, l. 680 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Clones liés — propagation et déclonage) :
  > Saisie dans le titre contenteditable de l'original : seul l'original est écrit ; le titre du clone n'est ni modifié à l'écran ni écrit
- Catégorie : 3 · fait autrement

**4.90** · Geste : Copier, cloner ou décloner un bloc
- Intention, l. 1665 :
  > une activité sélectionnée avec sa leçon n'est pas copiée deux fois
- Observation : aucune mention (termes cherchés : « copiée deux fois », « activité sélectionnée avec sa leçon »)
- Catégorie : 2 · prévu mais pas fait

**4.91** · Geste : Copier, cloner ou décloner un bloc
- Intention, l. 1667 :
  > l'Inspecteur offre « Copier » et « Cloner (lié) »
- Observation, l. 551 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — ouverture par double-clic sur un bloc) :
  > leçon : « Semaine »[…]boutons « Dupliquer », « Supprimer ce nœud » (pas de « Cloner (lié) »)
- Catégorie : 3 · fait autrement

**4.92** · Geste : Supprimer un bloc
- Intention, l. 1671 :
  > une corbeille apparaît au bas de la carte dès qu'on déplace un bloc, devient rouge quand le doigt la survole, disparaît ensuite
- Observation, l. 706 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Corbeille) :
  > Un bloc relâché sur la corbeille n'est pas supprimé : il est simplement déplacé[…]et la classe `planif-corbeille-survol` n'apparaît pas (observé)
- Catégorie : 3 · fait autrement

**4.93** · Geste : Supprimer un bloc
- Intention, l. 1672 :
  > « Annuler » ramène un bloc supprimé ; le message le rappelle
- Observation, l. 706 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Corbeille) :
  > Toast prévu « « … » supprimé — le bouton Annuler le ramène. » (5872) non obtenu.
- Catégorie : 3 · fait autrement

**4.94** · Geste : Saisir la durée d'un bloc, ou le marquer « Travail hors classe »
- Intention, l. 1683 :
  > et n'a plus de champ Durée
- Observation : aucune mention (termes cherchés : « n'a plus de champ », « champ durée masqué »)
- Catégorie : 2 · prévu mais pas fait

**4.95** · Geste : Aligner des blocs
- Intention, l. 1693 :
  > une ligne pointillée le montre
- Observation : aucune mention (termes cherchés : « ligne pointillée », « guide d'aimantation »)
- Catégorie : 2 · prévu mais pas fait

**4.96** · Geste : Aligner des blocs
- Intention, l. 1693 :
  > une leçon alignée emmène ses activités
- Observation : aucune mention (termes cherchés : « leçon alignée », « emmène ses activités »)
- Catégorie : 2 · prévu mais pas fait

**4.97** · Sans geste
- Intention, l. 1697 :
  > ✓ quand le lien est posé (le badge prend la couleur du bloc)
- Observation : aucune mention (termes cherchés : « badge prend la couleur », « badge coloré »)
- Catégorie : 2 · prévu mais pas fait

**4.98** · Sans geste
- Intention, l. 1698 :
  > Badge amont d'une évaluation : ✓ dès qu'elle vérifie au moins un objectif ; infobulle « Vérifie 1 objectif » / « Vérifie N objectifs » ou « Aucun objectif coché : coche dans l'Inspecteur les objectifs qu'elle vérifie »
- Observation : aucune mention (termes cherchés : « Vérifie 1 objectif », « Aucun objectif coché »)
- Catégorie : 2 · prévu mais pas fait

**4.99** · Sans geste
- Intention, l. 1699 :
  > il disparaît dès qu'une leçon reliée (« se concrétise dans ») a au moins un objectif vérifié par une évaluation, où qu'elle soit
- Observation : aucune mention (termes cherchés : « où qu'elle soit », « ⚠ disparaît »)
- Catégorie : 2 · prévu mais pas fait

**4.100** · Sans geste
- Intention, l. 1700 :
  > un Exposé non relié à une connaissance passe de ✓ à « ! »
- Observation : aucune mention (termes cherchés : « Exposé non relié », « exposé non relié »)
- Catégorie : 2 · prévu mais pas fait

**4.101** · Sans geste
- Intention, l. 1701 :
  > la légende (!, ⚠, ✓) est dans l'Inspecteur de la leçon et à la page 5 du guide
- Observation : aucune mention (termes cherchés : « Page 5 », « page 5 »)
- Catégorie : 2 · prévu mais pas fait

**4.102** · Sans geste
- Intention, l. 1703 :
  > « avant » se juge sur la leçon de chaque bloc, par semaine puis rang de séance ; un bloc de la même séance compte comme avant
- Observation, l. 565 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — champs) :
  > pastille de l'évaluation « ⚠ » (« Un objectif vérifié n'est servi qu'après cette évaluation. ») (observé ; l'activité était placée après l'évaluation dans la leçon)
- Catégorie : 3 · fait autrement

**4.103** · Sans geste
- Intention, l. 1703 :
  > un objectif servi avant et après compte comme avant
- Observation : aucune mention (termes cherchés : « servi avant et après »)
- Catégorie : 2 · prévu mais pas fait

**4.104** · Sans geste
- Intention, l. 1703 :
  > plusieurs objectifs : le pire l'emporte, dans l'ordre ✕, ⚠, ?, ✓
- Observation : aucune mention (termes cherchés : « pire l'emporte », « plusieurs objectifs vérifiés »)
- Catégorie : 2 · prévu mais pas fait

**4.105** · Sans geste
- Intention, l. 1703 :
  > un objectif servi sûrement avant et par un bloc impossible à situer donne ✓
- Observation : aucune mention (termes cherchés : « impossible à situer »)
- Catégorie : 2 · prévu mais pas fait

**4.106** · Sans geste
- Intention, l. 1703 :
  > les liens « se vérifie par » hérités ne créent pas d'objectif vérifié
- Observation : aucune mention (termes cherchés : « liens « se vérifie par » hérités », « se_verifie_par »)
- Catégorie : 2 · prévu mais pas fait

**4.107** · Sans geste
- Intention, l. 1705 :
  > « ! » contour pointillé pâle, couleur de l'évaluation ; « ✕ » rouge d'erreur ; « ⚠ » orange ; « ? » gris, trait plein ; « ✓ » contour de la couleur de l'évaluation
- Observation : aucune mention (termes cherchés : « contour pointillé », « rouge d'erreur », « trait plein »)
- Catégorie : 2 · prévu mais pas fait

**4.108** · Sans geste
- Intention, l. 1706 :
  > et à la page 8 du guide
- Observation : aucune mention (termes cherchés : « Vérifie que c'est acquis », « légende des pastilles dans le guide »)
- Catégorie : 2 · prévu mais pas fait

**4.109** · Sans geste
- Intention, l. 1707 :
  > Les pastilles sont lues comme des images nommées par un lecteur d'écran
- Observation : aucune mention (termes cherchés : « lecteur d'écran », « aria-label », « role="img" »)
- Catégorie : 2 · prévu mais pas fait

**4.110** · Sans geste
- Intention, l. 1707 :
  > celles d'une grande carte se recalculent environ dix fois plus vite
- Observation : aucune mention (termes cherchés : « dix fois plus vite », « grande carte »)
- Catégorie : 2 · prévu mais pas fait

**4.111** · Sans geste
- Intention, l. 1708 :
  > Liens déjà tracés d'une connaissance vers une Ouverture ou une Révision passent de « s'acquiert par » à « se réactive dans » à l'ouverture de la carte ; un message dit combien, et lesquels
- Observation : aucune mention (termes cherchés : « se_reactive_dans », « migration des liens », « passent de « s'acquiert par » »)
- Catégorie : 2 · prévu mais pas fait

**4.112** · Sans geste
- Intention, l. 1710 :
  > La carte démo fait cocher à chaque évaluation l'objectif de sa leçon, sans lien « se vérifie par »
- Observation : aucune mention (termes cherchés : « fait cocher », « objectif de sa leçon »)
- Catégorie : 2 · prévu mais pas fait

**4.113** · Sans geste
- Intention, l. 1713 :
  > Sur iPad, le pincement suit les doigts et zoome sur l'endroit pincé
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

### Écran 35 · Conception › Carte d'alignement › barre et menus

**4.114** · Geste : Lire la barre
- Intention, l. 1719 :
  > de gauche à droite : « Consulter la bibliothèque », la liste des cartes, « Actions ▾ », « Annuler », « Rétablir » ; la recherche ; « Nœuds », « Planificateur », « Vue ▾ », « Inspecteur », « Guide » ; plus aucune icône seule
- Observation : aucune mention (termes cherchés : « de gauche à droite », « ordre de la barre », « icône seule »)
- Catégorie : 2 · prévu mais pas fait

**4.115** · Geste : Lire la barre
- Intention, l. 1720 :
  > les boutons de la barre sont à 44 px au doigt
- Observation : aucune mention (termes cherchés : « 44 px », « 44px »)
- Catégorie : 2 · prévu mais pas fait

**4.116** · Geste : Ouvrir le menu « Vue »
- Intention, l. 1725 :
  > les douze pastilles de couleur visibles en entier, aucun défilement horizontal, sous Chrome et Safari, sur grand écran comme sur iPad en paysage
- Observation : aucune mention (termes cherchés : « douze pastilles », « défilement horizontal », « Safari »)
- Catégorie : 2 · prévu mais pas fait

**4.117** · Geste : Changer le zoom par la rubrique « Zoom »
- Intention, l. 1739 :
  > aucun si le zoom est entre deux
- Observation : aucune mention (termes cherchés : « entre deux », « aucun préréglage coché »)
- Catégorie : 2 · prévu mais pas fait

**4.118** · Geste : Changer le zoom par la rubrique « Zoom »
- Intention, l. 1739 :
  > le changement garde au centre ce qu'on regardait
- Observation : aucune mention (termes cherchés : « garde au centre », « centre de la vue »)
- Catégorie : 2 · prévu mais pas fait

**4.119** · Geste : Utiliser la longue-vue
- Intention, l. 1744 :
  > le cadre qui grossit le texte est un cercle
- Observation : aucune mention (termes cherchés : « cadre circulaire », « cercle de la longue-vue »)
- Catégorie : 2 · prévu mais pas fait

**4.120** · Geste : Utiliser la longue-vue
- Intention, l. 1745 :
  > au doigt sur iPad, glisser en longue-vue ne déplace aucun bloc
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**4.121** · Geste : Ouvrir la palette des raccourcis
- Intention, l. 1749 :
  > la ligne « Raccourcis clavier » au bas de « Vue » referme le menu
- Observation : aucune mention (termes cherchés : « referme le menu Vue », « menu Vue refermé »)
- Catégorie : 2 · prévu mais pas fait

**4.122** · Geste : Ouvrir la palette des raccourcis
- Intention, l. 1749 :
  > au premier plan quand on la touche
- Observation : aucune mention (termes cherchés : « premier plan », « z-index »)
- Catégorie : 2 · prévu mais pas fait

**4.123** · Geste : Ouvrir la palette des raccourcis
- Intention, l. 1749 :
  > une seconde fois, elle la referme
- Observation : aucune mention (termes cherchés : « second clic sur « Raccourcis clavier » », « referme la palette »)
- Catégorie : 2 · prévu mais pas fait

**4.124** · Geste : Ouvrir la palette des raccourcis
- Intention, l. 1750 :
  > « Déplacer un bloc ; par le cadre d'une leçon ou d'une séquence, tout le groupe suit » et « Recherche : refermer la liste ; une seconde fois, tout effacer »
- Observation : aucune mention (termes cherchés : « tout le groupe suit », « refermer la liste »)
- Catégorie : 2 · prévu mais pas fait

**4.125** · Geste : Utiliser un raccourci clavier
- Intention, l. 1754 :
  > chaque raccourci affiché marche dans Chrome et Safari
- Observation : aucune mention (termes cherchés : « Safari »)
- Catégorie : 2 · prévu mais pas fait

**4.126** · Geste : Utiliser un raccourci clavier
- Intention, l. 1754 :
  > les huit raccourcis qui marchaient sans être décrits entrent dans la liste
- Observation : aucune mention (termes cherchés : « huit raccourcis », « sans être décrits »)
- Catégorie : 2 · prévu mais pas fait

**4.127** · Geste : Annuler, Rétablir
- Intention, l. 1758 :
  > même forme (le mot, la flèche en miroir)
- Observation : aucune mention (termes cherchés : « flèche en miroir », « flèche inversée »)
- Catégorie : 2 · prévu mais pas fait

**4.128** · Geste : Rattacher la carte à son cours
- Intention, l. 1772 :
  > le cours s'affiche à côté du nom de la carte
- Observation, l. 583 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu « Actions ▾ ») :
  > avec l'état de base le cours n'a que `codeCours`/`nomCours`, aucun suffixe n'est affiché (observé : « Sans titre »)
- Observation, l. 584 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu « Actions ▾ ») :
  > (le libellé affiché est l'identifiant du cours, observé)
- Catégorie : 3 · fait autrement

**4.129** · Geste : Nettoyer les repères de semaine
- Intention, l. 1777 :
  > il propose de retirer le « séance 2 » écrit à la main seulement si le titre annonce un rang, que la leçon en porte un et que les deux concordent ; il ne devine jamais un rang
- Observation : aucune mention (termes cherchés : « rang de séance dans le titre », « séance écrite à la main »)
- Catégorie : 2 · prévu mais pas fait

**4.130** · Geste : Exporter le plan
- Intention, l. 1785 :
  > niveaux « Plan de cours », « En classe », « Preuve d'alignement », et « Personnalisé » (on coche les contenus et on choisit l'ordre des sections)
- Observation, l. 591 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu Actions — « Exporter le plan… ») :
  > panneau « GABARIT | Plan de cours | En classe | Preuve d’alignement | Calendrier | Gabarits d’export… | FORMAT
- Catégorie : 3 · fait autrement

**4.131** · Geste : Exporter le plan
- Intention, l. 1787 :
  > chaque production porte sa vraie échelle ; une production sans échelle garde « Aucune échelle » ; un bloc qui ne sert que les objectifs d'une autre leçon porte « Aucun objectif de cette leçon »
- Observation : aucune mention (termes cherchés : « Aucun objectif de cette leçon », « vraie échelle »)
- Catégorie : 2 · prévu mais pas fait

**4.132** · Geste : Exporter le plan
- Intention, l. 1788 :
  > Données : non documenté
- Observation, l. 618 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Modale « Gabarits d'export ») :
  > « Dupliquer » `#export-perso-dupliquer` : ajoute `exportGabarits:
- Observation, l. 622 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Modale « Gabarits d'export ») :
  > « Supprimer » `#export-perso-supprimer` : `exportGabarits` → `[]`
- Catégorie : 1 · fait sans être prévu

**4.133** · Sans geste
- Intention, l. 1792 :
  > Le principe « Évaluer ce qu'on enseigne, et enseigner ce qu'on évalue, au même niveau d'exigence. » s'affiche sous le titre du module
- Observation : aucune mention (termes cherchés : « Évaluer ce qu'on enseigne », « sous le titre du module »)
- Catégorie : 2 · prévu mais pas fait

### Écran 36 · Conception › Carte d'alignement › Planificateur

**4.134** · Geste : Afficher le planificateur
- Intention, l. 1800 :
  > « Les dates du trimestre ne sont pas entrées. Ajoute-les dans Cadre › Trimestre. »
- Observation : aucune mention (termes cherchés : « ne sont pas entrées », « Ajoute-les »)
- Catégorie : 2 · prévu mais pas fait

**4.135** · Geste : Afficher le planificateur
- Intention, l. 1801 :
  > depuis le plein écran, le lien quitte d'abord le plein écran : la navigation principale est visible
- Observation : aucune mention (termes cherchés : « quitte d'abord le plein écran », « sortie du plein écran »)
- Catégorie : 2 · prévu mais pas fait

**4.136** · Geste : Glisser une leçon d'une semaine à une autre, ou dans « Non planifié »
- Intention, l. 1805 :
  > glisser une leçon dans « Non planifié » la retire du calendrier
- Observation : aucune mention (termes cherchés : « retire du calendrier », « vers « NON PLANIFIÉ » »)
- Catégorie : 2 · prévu mais pas fait

**4.137** · Geste : Glisser une leçon d'une semaine à une autre, ou dans « Non planifié »
- Intention, l. 1806 :
  > cliquer une leçon dans le planificateur déplace la carte jusqu'à elle
- Observation : aucune mention (termes cherchés : « déplace la carte jusqu'à », « défile jusqu'à la leçon »)
- Catégorie : 2 · prévu mais pas fait

**4.138** · Sans geste
- Intention, l. 1810 :
  > les leçons d'une même semaine côte à côte
- Observation : aucune mention (termes cherchés : « côte à côte », « même rangée »)
- Catégorie : 2 · prévu mais pas fait

**4.139** · Sans geste
- Intention, l. 1811 :
  > et reste visible même quand tout est planifié
- Observation : aucune mention (termes cherchés : « reste visible même quand tout est planifié », « tout est planifié »)
- Catégorie : 2 · prévu mais pas fait

**4.140** · Sans geste
- Intention, l. 1813 :
  > Une leçon ancrée hors du cadre du trimestre retombe dans « Non planifié » au lieu de disparaître
- Observation : aucune mention (termes cherchés : « hors du cadre du trimestre », « semaine 17 »)
- Catégorie : 2 · prévu mais pas fait

**4.141** · Sans geste
- Intention, l. 1814 :
  > Le planificateur ne répète le nom d'une séquence que pour les leçons affichées loin d'elle
- Observation : aucune mention (termes cherchés : « loin d'elle », « nom de la séquence répété »)
- Catégorie : 2 · prévu mais pas fait

**4.142** · Sans geste
- Intention, l. 1815 :
  > À la rentrée, un planificateur vide propose de reprendre la carte du même cours de la session précédente, en un clic
- Observation : aucune mention (termes cherchés : « session précédente », « reprendre la carte »)
- Catégorie : 2 · prévu mais pas fait

### Écran 37 · Conception › Carte d'alignement › « Télécharger un modèle… » (faire relire sa carte par une IA)

**4.143** · Geste : Télécharger le modèle
- Intention, l. 1825 :
  > « Blocs rattachés à aucune leçon » ; « aucun·e », « non précisée »
- Observation : aucune mention (termes cherchés : « Blocs rattachés à aucune leçon », « non précisée », « Aucun cours n'est rattaché »)
- Catégorie : 2 · prévu mais pas fait

**4.144** · Geste : Télécharger le modèle
- Intention, l. 1826 :
  > échec : « Le modèle n'a pas pu être produit : aucune carte active. »
- Observation : aucune mention (termes cherchés : « aucune carte active », « n'a pas pu être produit »)
- Catégorie : 2 · prévu mais pas fait

**4.145** · Geste : Télécharger le modèle
- Intention, l. 1829 :
  > sans Cadre du trimestre, la phrase s'arrête à « … jusqu'à la semaine N. », sans total
- Observation : aucune mention (termes cherchés : « sans total », « sans Cadre du trimestre »)
- Catégorie : 2 · prévu mais pas fait

**4.146** · Geste : Télécharger le modèle
- Intention, l. 1829 :
  > sans leçon planifiée, le modèle part de la dernière semaine du trimestre
- Observation : aucune mention (termes cherchés : « dernière semaine du trimestre », « sans leçon planifiée »)
- Catégorie : 2 · prévu mais pas fait

### Écran 38 · Conception › Carte d'alignement › Guide

**4.147** · Geste : Lire le guide de la carte
- Intention, l. 1839 :
  > les trois étages (compétence, idées maîtresses, leçons), les deux chemins, les trois signaux
- Observation : aucune mention (termes cherchés : « trois étages », « deux chemins », « trois signaux »)
- Catégorie : 2 · prévu mais pas fait

**4.148** · Geste : Lire le guide de la carte
- Intention, l. 1839 :
  > les références Anderson (2026), Biggs (2014), Gauthier, Bissonnette et Richard (2013, ERPI)
- Observation : aucune mention (termes cherchés : « Anderson », « Bissonnette », « ERPI »)
- Catégorie : 2 · prévu mais pas fait

**4.149** · Geste : Lire le guide de la carte
- Intention, l. 1840 :
  > page 2 ajoute la taxonomie révisée d'Anderson et Krathwohl
- Observation : aucune mention (termes cherchés : « Krathwohl », « taxonomie révisée »)
- Catégorie : 2 · prévu mais pas fait

**4.150** · Geste : Lire le guide de la carte
- Intention, l. 1840 :
  > page 6 relie les quatre types de connaissances aux déclaratives, procédurales et conditionnelles
- Observation : aucune mention (termes cherchés : « Page 6 », « déclaratives », « conditionnelles »)
- Catégorie : 2 · prévu mais pas fait

**4.151** · Geste : Lire le guide de la carte
- Intention, l. 1841 :
  > page 4 « Organise dans le temps »
- Observation : aucune mention (termes cherchés : « Organise dans le temps », « Page 4 »)
- Catégorie : 2 · prévu mais pas fait

**4.152** · Geste : Lire le guide de la carte
- Intention, l. 1841 :
  > page 8 « Vérifie que c'est acquis », avec la légende des pastilles de l'évaluation
- Observation : aucune mention (termes cherchés : « Vérifie que c'est acquis »)
- Catégorie : 2 · prévu mais pas fait

**4.153** · Geste : Lire le guide de la carte
- Intention, l. 1842 :
  > page 5 : « Dans l'Inspecteur d'une activité ou d'un exposé de cette leçon, coche les objectifs servis
- Observation : aucune mention (termes cherchés : « Page 5 », « aucun objectif ne reste sans moyen »)
- Catégorie : 2 · prévu mais pas fait

**4.154** · Geste : Lire le guide de la carte
- Intention, l. 1843 :
  > tous les guides partagent la même présentation
- Observation : aucune mention (termes cherchés : « même présentation »)
- Catégorie : 2 · prévu mais pas fait

**4.155** · Geste : Lire le guide de la carte
- Intention, l. 1843 :
  > les pictogrammes de badge (✓, !, ⚠) s'affichent
- Observation : aucune mention (termes cherchés : « pictogramme »)
- Catégorie : 2 · prévu mais pas fait

**4.156** · Geste : Lire le guide de la carte
- Intention, l. 1844 :
  > la page 1 du guide dit « Tu peux le consulter à tout moment par le bouton « Guide » de la barre. »
- Observation : aucune mention (termes cherchés : « consulter à tout moment »)
- Catégorie : 2 · prévu mais pas fait

### Écran 39 · Conception › Carte d'alignement › « Consulter la bibliothèque » (cartes)

**4.157** · Geste : Ouvrir la bibliothèque des cartes
- Intention, l. 1854 :
  > bleu foncé, même style que dans la Conception, à gauche de la barre juste avant la liste des cartes
- Observation : aucune mention (termes cherchés : « bleu foncé », « même style »)
- Catégorie : 2 · prévu mais pas fait

**4.158** · Geste : Importer une carte d'un autre trimestre
- Intention, l. 1859 :
  > la carte est copiée vers le trimestre actif ; la carte d'origine reste intacte ; les notes de séance des leçons suivent la copie
- Observation, l. 631 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bouton « Consulter la bibliothèque » et modale) :
  > La section « Importer depuis un autre trimestre » est absente avec l'état de base (aucun autre trimestre avec carte) (observé)
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**4.159** · Geste : Importer une carte d'un autre trimestre
- Intention, l. 1860 :
  > la reprise ne transporte pas de références mortes vers des productions absentes du trimestre d'arrivée
- Observation, l. 631 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bouton « Consulter la bibliothèque » et modale) :
  > La section « Importer depuis un autre trimestre » est absente avec l'état de base (aucun autre trimestre avec carte) (observé)
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**4.160** · Geste : Importer une carte d'un autre trimestre
- Intention, l. 1861 :
  > les cartes qui portent le même cours remontent en tête, sous « Même cours »
- Observation, l. 631 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bouton « Consulter la bibliothèque » et modale) :
  > La section « Importer depuis un autre trimestre » est absente avec l'état de base (aucun autre trimestre avec carte) (observé)
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**4.161** · Sans geste
- Intention, l. 1864 :
  > Non documenté dans les sources lues.
- Observation, l. 2750 (Ce qui se produit sans geste de l'utilisateur › Conception › Carte de planification) :
  > `seederDemoSiNecessaire()` ajoute l'élément `ALI_DEMO_ecriture_litterature` à `bibliothequeAlignements` s'il est absent
- Catégorie : 1 · fait sans être prévu

### Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)

**4.162** · Geste : Ajouter un élément de la bibliothèque à sa sélection (barre latérale)
- Intention, l. 1870 :
  > un second ajout du même élément est refusé ; le blocage porte sur l'identité, jamais sur le nom
- Observation : aucune mention (termes cherchés : « second ajout », « est déjà dans ta sélection »)
- Catégorie : 2 · prévu mais pas fait

**4.163** · Geste : Ajouter un élément de la bibliothèque à sa sélection (barre latérale)
- Intention, l. 1871 :
  > le refus nomme l'exemplaire présent : « « X » est déjà dans ta sélection. » et propose « Dupliquer »
- Observation : aucune mention (termes cherchés : « est déjà dans ta sélection », « exemplaire présent »)
- Catégorie : 2 · prévu mais pas fait

**4.164** · Geste : Ajouter un élément de la bibliothèque à sa sélection (barre latérale)
- Intention, l. 1872 :
  > l'élément ajouté quitte la liste des disponibles
- Observation, l. 938 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Fenêtre « Bibliothèque de grilles de critères ») :
  > la carte bibliothèque de « Grille de départ » porte « Déjà dans la barre latérale »
- Catégorie : 3 · fait autrement

**4.165** · Geste : Ajouter un élément de la bibliothèque à sa sélection (barre latérale)
- Intention, l. 1873 :
  > la bibliothèque vérifie que l'ajout a été écrit avant d'annoncer un succès ; un refus le dit
- Observation : aucune mention (termes cherchés : « vérifie que l'ajout », « écriture vérifiée »)
- Catégorie : 2 · prévu mais pas fait

**4.166** · Geste : Retirer un élément de sa barre latérale
- Intention, l. 1877 :
  > l'élément se retrouve dans « disponibles à ajouter »
- Observation, l. 868 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > la production quitte la liste latérale et apparaît deux fois dans « disponibles » (copie de bibliothèque et copie locale avec la mention « Retirée »)
- Observation, l. 1246 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Retirer » (menu ⋮)) :
  > la pratique disparaît de la barre latérale et n'apparaît pas non plus dans « Pratiques disponibles »
- Catégorie : 3 · fait autrement

**4.167** · Geste : Supprimer un élément
- Intention, l. 1881 :
  > la confirmation s'affiche par-dessus la fenêtre de bibliothèque
- Observation : aucune mention (termes cherchés : « par-dessus la fenêtre », « au-dessus de la fenêtre de bibliothèque »)
- Catégorie : 2 · prévu mais pas fait

**4.168** · Geste : Supprimer un élément
- Intention, l. 1882 :
  > un gabarit fourni supprimé de la bibliothèque partagée ne revient pas au rechargement
- Observation, l. 1255 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Supprimer » (section 2)) :
  > Ce gabarit est fourni par défaut avec l'application et ne peut pas être supprimé. Il se réinjecte automatiquement au rafraîchissement.
- Catégorie : 3 · fait autrement

**4.169** · Geste : Supprimer un élément
- Intention, l. 1883 :
  > la corbeille remplace le « ✕ » rouge, les chevrons à côté du nom remplacent la colonne « Ordre »
- Observation : aucune mention (termes cherchés : « chevrons », « colonne « Ordre » »)
- Catégorie : 2 · prévu mais pas fait

**4.170** · Geste : Dupliquer un élément
- Intention, l. 1888 :
  > puis « X (copie 2) », « X (copie 3) »
- Observation : aucune mention (termes cherchés : « (copie 2) », « (copie 3) »)
- Catégorie : 2 · prévu mais pas fait

**4.171** · Geste : Dupliquer un élément
- Intention, l. 1892 :
  > mais elle garde la mention de son original ; la filiation reste lisible
- Observation, l. 870 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > `inspireDe:{nom:"Inconnu", auteur:"Prof Fictif-Zorglub", date, sourceId}`
- Catégorie : 3 · fait autrement

**4.172** · Geste : Dupliquer un élément
- Intention, l. 1893 :
  > une grille copiée reçoit des critères neufs, indépendants de ceux de l'originale
- Observation, l. 925 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › « Dupliquer ») :
  > (mêmes id de critères que la source)
- Catégorie : 3 · fait autrement

**4.173** · Geste : Ouvrir un exemplaire « exemple » (matériel fourni ou démo)
- Intention, l. 1897 :
  > il s'ouvre en lecture seule, avec le bandeau « Exemple fourni par Labo Codex… »
- Observation : aucune mention (termes cherchés : « Exemple fourni », « bandeau « exemple » »)
- Catégorie : 2 · prévu mais pas fait

**4.174** · Geste : Ouvrir un exemplaire « exemple » (matériel fourni ou démo)
- Intention, l. 1898 :
  > dont l'auteur est l'utilisateur
- Observation, l. 940 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Fenêtre « Bibliothèque de grilles de critères ») :
  > « Grille de départ (copie) » (`auteur:"Inconnu"`
- Observation, l. 1225 (Conception — Pratiques de notation › Éditeur de pratique › Bouton « Dupliquer ») :
  > `auteur:"Inconnu"`
- Catégorie : 3 · fait autrement

**4.175** · Geste : Ouvrir un exemplaire « exemple » (matériel fourni ou démo)
- Intention, l. 1899 :
  > « Dupliquer vers mes documents » crée la copie modifiable : une grille vient avec ses cartouches, une production avec sa grille
- Observation : aucune mention (termes cherchés : « Dupliquer vers mes documents », « vient avec ses cartouches »)
- Catégorie : 2 · prévu mais pas fait

**4.176** · Geste : Ouvrir un exemplaire « exemple » (matériel fourni ou démo)
- Intention, l. 1901 :
  > après l'ouverture d'un exemple, « + Nouvelle … » ouvre un formulaire modifiable
- Observation : aucune mention (termes cherchés : « ouverture d'un exemple », « Exemple fourni »)
- Catégorie : 2 · prévu mais pas fait

**4.177** · Geste : Lire le bandeau des doublons
- Intention, l. 1905 :
  > 🔴 « Collision d'identifiant » (anomalie de données, à signaler), 🟠 « Copies » (« Tu peux n'en garder qu'un »)
- Observation : aucune mention (termes cherchés : « Collision d'identifiant », « Tu peux n'en garder qu'un »)
- Catégorie : 2 · prévu mais pas fait

**4.178** · Geste : Lire le bandeau des doublons
- Intention, l. 1907 :
  > chaque ligne porte le nom, l'identifiant court, la date de modification, et « Dans ta barre latérale » ou « Bibliothèque partagée » ; un groupe mixte est classé « Copies » avec un numéro de lignée ; tous les groupes sont dépliés
- Observation : aucune mention (termes cherchés : « Dans ta barre latérale », « Bibliothèque partagée », « numéro de lignée »)
- Catégorie : 2 · prévu mais pas fait

**4.179** · Geste : Lire le bandeau des doublons
- Intention, l. 1908 :
  > « Voir » fait défiler jusqu'à la carte et l'entoure d'un cadre orange environ deux secondes
- Observation, l. 2886 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > « Voir » des homonymes (`BibliothequeUI.voirItemDoublon`) : composants communs des bibliothèques, non exercés.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.180** · Geste : Lire le bandeau des doublons
- Intention, l. 1909 :
  > sur une ligne « Dans ta barre latérale » : « Retirer » et « Supprimer » ; sur une ligne « Bibliothèque partagée » : « Supprimer » seulement
- Observation : aucune mention (termes cherchés : « Dans ta barre latérale », « Bibliothèque partagée »)
- Catégorie : 2 · prévu mais pas fait

**4.181** · Geste : Lire le bandeau des doublons
- Intention, l. 1910 :
  > les doublons se comparent côte à côte, et « Tout fusionner » les réunit en un seul
- Observation : aucune mention (termes cherchés : « Tout fusionner », « côte à côte »)
- Catégorie : 2 · prévu mais pas fait

**4.182** · Geste : Ranger dans « Mes dossiers » (grilles, échelles, productions, pratiques)
- Intention, l. 1916 :
  > et l'import depuis un trimestre restent
- Observation, l. 986 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Fenêtre « Bibliothèque d'échelles de performance ») :
  > La section « autre trimestre » n'apparaît pas
- Catégorie : 3 · fait autrement

**4.183** · Sans geste
- Intention, l. 1920 :
  > (une puce grise), complet au survol, lisible sur iPad sans zoomer et en mode clair
- Observation : aucune mention (termes cherchés : « puce grise », « complet au survol », « iPad »)
- Catégorie : 2 · prévu mais pas fait

**4.184** · Sans geste
- Intention, l. 1921 :
  > la carte importée est amenée à l'écran et mise en évidence, dans les cinq familles ; si un filtre la masque, la notification le dit
- Observation : aucune mention (termes cherchés : « mise en évidence », « amenée à l'écran »)
- Catégorie : 2 · prévu mais pas fait

**4.185** · Sans geste
- Intention, l. 1922 :
  > la phrase qui renvoie à la case « Masquer… » ne paraît que là où cette case existe (grilles, échelles, cartouches) ; ailleurs, elle se tait
- Observation : aucune mention (termes cherchés : « renvoie à la case », « elle se tait »)
- Catégorie : 2 · prévu mais pas fait

### Écran 41 · Partage entre collègues

**4.186** · Geste : Exporter pour partager
- Intention, l. 1929 :
  > licence CC BY-NC-SA 4.0, attribution, et exactement ce que le fichier contiendra
- Observation : aucune mention (termes cherchés : « ce que le fichier contiendra », « récapitule »)
- Catégorie : 2 · prévu mais pas fait

**4.187** · Geste : Exporter pour partager
- Intention, l. 1930 :
  > une grille part avec toutes ses cartouches, une production avec sa grille
- Observation, l. 2868 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Menu « Exporter pour partager » (`partageExport.exporterPourPartager`, fichiers partage-*.js hors liste) : non déclenché.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.188** · Geste : Exporter pour partager
- Intention, l. 1932 :
  > une grille partagée emporte ses sous-critères, leurs rétroactions, ses catégories d'erreurs, ses réglages de projection, ses phrases réécrites, son type et la couleur de ses sous-critères
- Observation, l. 2868 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Menu « Exporter pour partager » (`partageExport.exporterPourPartager`, fichiers partage-*.js hors liste) : non déclenché.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.189** · Geste : Exporter pour partager
- Intention, l. 1933 :
  > une grille qui vit dans plusieurs trimestres envoie les cartouches du trimestre actif, et le fichier porte le nom lisible de ce trimestre
- Observation, l. 2868 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Menu « Exporter pour partager » (`partageExport.exporterPourPartager`, fichiers partage-*.js hors liste) : non déclenché.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.190** · Geste : Exporter pour partager
- Intention, l. 1934 :
  > une échelle partagée emporte ses deux repères, les descriptions de ses niveaux, leur étiquette SOLO, sa description et sa discipline
- Observation, l. 2868 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Menu « Exporter pour partager » (`partageExport.exporterPourPartager`, fichiers partage-*.js hors liste) : non déclenché.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.191** · Geste : Importer un partage (.lcz)
- Intention, l. 1942 :
  > la prévisualisation d'une grille à cartouches dit « Cartouches tirées du trimestre : Automne 2026 »
- Observation : aucune mention (termes cherchés : « Cartouches tirées du trimestre »)
- Catégorie : 2 · prévu mais pas fait

**4.192** · Geste : Importer un partage (.lcz)
- Intention, l. 1944 :
  > les éléments importés restent à part, en lecture seule, dans la section « Partagés par des collègues »
- Observation, l. 2887 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Section « Partagés » de la modale (`partageSection.genererSectionHTML('pratique')`) après import .lcz : non examinée.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.193** · Geste : Importer un partage (.lcz)
- Intention, l. 1945 :
  > la grille calcule comme chez son auteur : son évaluation ne bascule pas de mode à son insu
- Observation : aucune mention (termes cherchés : « calcule comme chez son auteur », « bascule de mode »)
- Catégorie : 2 · prévu mais pas fait

**4.194** · Geste : Importer un partage (.lcz)
- Intention, l. 1946 :
  > une grille reçue qui porte le même nom qu'une grille locale, mais pas les mêmes critères, ne s'y rattache pas
- Observation : aucune mention (termes cherchés : « même nom qu'une grille locale », « ne s'y rattache pas »)
- Catégorie : 2 · prévu mais pas fait

**4.195** · Geste : Importer un partage (.lcz)
- Intention, l. 1947 :
  > un paquet de pratique emporte son échelle ; à l'import, la pratique suit cette échelle, même si celle-ci change d'identifiant
- Observation : aucune mention (termes cherchés : « emporte son échelle », « partage_echelles »)
- Catégorie : 2 · prévu mais pas fait

**4.196** · Geste : Importer un partage (.lcz)
- Intention, l. 1948 :
  > un nom reçu d'un collègue (grille, échelle, cartouche, pratique, tampon) s'affiche toujours comme du texte, même importé avant
- Observation : aucune mention (termes cherchés : « comme du texte », « échappé »)
- Catégorie : 2 · prévu mais pas fait

**4.197** · Geste : Utiliser un élément « Partagé par un collègue »
- Intention, l. 1952 :
  > « Dupliquer » crée une copie dans les documents de l'utilisateur avec « Inspiré de [nom] par [auteur] »
- Observation, l. 2887 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Section « Partagés » de la modale (`partageSection.genererSectionHTML('pratique')`) après import .lcz : non examinée.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.198** · Geste : Utiliser un élément « Partagé par un collègue »
- Intention, l. 1953 :
  > une copie nomme son origine avec le titre et l'auteur réels
- Observation, l. 870 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > `inspireDe:{nom:"Inconnu", auteur:"Prof Fictif-Zorglub", date, sourceId}`
- Catégorie : 3 · fait autrement

**4.199** · Geste : Utiliser un élément « Partagé par un collègue »
- Intention, l. 1954 :
  > sans enseignant·e identifié·e, le matériel porte la mention « Inconnu »
- Observation, l. 866 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > `bibliothequeProductions` : absent → 5 objets (copies assainies : […]`auteur:"Inconnu"`)
- Catégorie : 3 · fait autrement

**4.200** · Geste : Ré-exporter un élément partagé
- Intention, l. 1958 :
  > le menu ⋮ des cartes « Partagés par des collègues » offre « Exporter pour partager »
- Observation, l. 2878 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > « Importer un partage (.lcz) » (`partageImport`, fichiers partage-*.js) dans les bibliothèques : non déclenché.
- Observation, l. 2887 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Section « Partagés » de la modale (`partageSection.genererSectionHTML('pratique')`) après import .lcz : non examinée.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.201** · Geste : Ré-exporter un élément partagé
- Intention, l. 1959 :
  > le paquet retransmis nomme la personne dont vient le travail et conserve la chaîne complète
- Observation, l. 2887 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Section « Partagés » de la modale (`partageSection.genererSectionHTML('pratique')`) après import .lcz : non examinée.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.202** · Geste : Supprimer un élément partagé
- Intention, l. 1963 :
  > le menu ⋮ des cartes « Partagés par des collègues » offre « Supprimer », dans les cinq bibliothèques
- Observation, l. 2878 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > « Importer un partage (.lcz) » (`partageImport`, fichiers partage-*.js) dans les bibliothèques : non déclenché.
- Observation, l. 2887 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Section « Partagés » de la modale (`partageSection.genererSectionHTML('pratique')`) après import .lcz : non examinée.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.203** · Geste : Supprimer un élément partagé
- Intention, l. 1965 :
  > supprimer une grille partagée emporte ses cartouches partagées ; la confirmation les nomme avant
- Observation, l. 2878 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > « Importer un partage (.lcz) » (`partageImport`, fichiers partage-*.js) dans les bibliothèques : non déclenché.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.204** · Sans geste
- Intention, l. 1969 :
  > Non documenté dans les sources lues.
- Observation, l. 2821 (Ce qui se produit sans geste de l'utilisateur › Réglages) :
  > Affichage de « Données » : `chargerVueDonnees` 100 ms après (compteurs du sélecteur de ressources, statistiques de captures, liste des packages importés)
- Catégorie : 1 · fait sans être prévu

### Écran 42 · Importer depuis un autre trimestre (dans chaque bibliothèque)

**4.205** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1975 :
  > la bibliothèque des cartouches a sa section « Importer depuis un autre trimestre », comme les quatre autres
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.206** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1976 :
  > une phrase explique avant le clic
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.207** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1977 :
  > une cartouche arrive toujours avec sa grille : rangée sous la grille si elle est déjà dans le trimestre, sinon copiée avec elle
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.208** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1978 :
  > le trimestre source garde ses cartouches
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.209** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1979 :
  > l'échelle d'une cartouche copiée se rattache comme à l'import
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.210** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1980 :
  > importer une cartouche dont la grille est copiée : bandeau vert « … importée dans ce trimestre »
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.211** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1981 :
  > importer une autre cartouche de la même grille : bandeau « Rangée dans « … », déjà présente »
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.212** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1982 :
  > réimporter une cartouche déjà présente : bandeau bleu
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.213** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1983 :
  > « Tout importer », après confirmation, prend tout le trimestre, toutes grilles confondues
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.214** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1984 :
  > une cartouche importée arrive directement dans la barre latérale
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.215** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1985 :
  > la liste propose tous les autres trimestres présents dans l'application, en cours ou clos
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.216** · Geste : Importer une cartouche d'un autre trimestre
- Intention, l. 1986 :
  > deux imports faits coup sur coup ne s'effacent pas l'un l'autre
- Observation, l. 2877 (Ce qui n'a pas pu être observé › Conception › Productions, grilles, échelles, rétroactions) :
  > Import de cartouches depuis un autre trimestre[…]: section non générée (un seul trimestre dans l'état).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**4.217** · Geste : Importer depuis un autre trimestre, dans n'importe quelle bibliothèque
- Intention, l. 1990 :
  > la section reste ouverte après chaque import : le trimestre choisi, la liste dépliée et la position dans la fenêtre sont conservés
- Observation : aucune mention (termes cherchés : « section reste ouverte », « position dans la fenêtre »)
- Catégorie : 2 · prévu mais pas fait

**4.218** · Geste : Importer depuis un autre trimestre, dans n'importe quelle bibliothèque
- Intention, l. 1991 :
  > le bandeau vert « Import terminé » et le compte, par-dessus la fenêtre de bibliothèque
- Observation : aucune mention (termes cherchés : « bandeau vert », « par-dessus la fenêtre »)
- Catégorie : 2 · prévu mais pas fait

### Fait sans être prévu, sans ligne correspondante dans l'intention

**4.219** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Affichage de l'onglet
- Intention : aucune mention (termes cherchés : « Sans titre », « carte créée à l'ouverture », « carte créée au premier affichage »)
- Observation, l. 467 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Affichage de l'onglet) :
  > **Écrit** (premier affichage, état de base sans carte) : `a2026_planification_mindmap` : absent → `{"index":{"active":"carte_1","compteurCartes":1,"cartes":[{"id":"carte_1","nom":"Sans titre"
- Catégorie : 1 · fait sans être prévu

**4.220** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Ports de liaison — glisser à la souris d'un port vers un autre bloc
- Intention : aucune mention (termes cherchés : « n'est pas possible entre », « Compétence et Leçon », « lien impossible »)
- Observation, l. 505 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Ports de liaison — glisser à la souris d'un port vers un autre bloc) :
  > Compétence → Leçon : aucune écriture ; le programme affiche le toast « Ce lien n'est pas possible entre Compétence et Leçon. »
- Catégorie : 1 · fait sans être prévu

**4.221** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Ports de liaison — glisser à la souris d'un port vers un autre bloc
- Intention : aucune mention (termes cherchés : « Type de relation », « choix du verbe »)
- Observation, l. 507 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Ports de liaison — glisser à la souris d'un port vers un autre bloc) :
  > Paires connaissance↔connaissance, activité↔activité, idée↔idée : menu « Type de relation » à choix
- Catégorie : 1 · fait sans être prévu

**4.222** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Sélecteur de type d'un bloc et de visée
- Intention : aucune mention (termes cherchés : « verbe qui ne correspond plus », « clique le lien pour le changer »)
- Observation, l. 543 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Sélecteur de type d'un bloc et de visée) :
  > toast « Un lien de ce bloc garde un verbe qui ne correspond plus à son nouveau type — clique le lien pour le changer. »
- Catégorie : 1 · fait sans être prévu

**4.223** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — champs
- Intention : aucune mention (termes cherchés : « préfixe », « bouton verbe »)
- Observation, l. 562 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — champs) :
  > Bouton verbe `.planif-verbe-tag` (2257-2270) : préfixe le titre (« Résoudre Activité Fictive Zorglub renommée » dans le champ et le bloc)
- Catégorie : 1 · fait sans être prévu

**4.224** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — champs
- Intention : aucune mention (termes cherchés : « Dans la leçon », « bloc libre »)
- Observation, l. 566 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — champs) :
  > « Dans la leçon » `#planif-panneau-deplacer` (2381-2393) : → Leçon B : `noeuds[4].parent` `planif-noeud_3` → `planif-noeud_7`
- Catégorie : 1 · fait sans être prévu

**4.225** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — champs
- Intention : aucune mention (termes cherchés : « Préalable », « préalable »)
- Observation, l. 567 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — champs) :
  > Préalable `#planif-panneau-prealable` (2394-2403) : `metadata.prealable` : absent → `true` ; type affiché « Factuelle préalable » (observé).
- Catégorie : 1 · fait sans être prévu

**4.226** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu « Actions ▾ »
- Intention : aucune mention (termes cherchés : « Détacher », « détach »)
- Observation, l. 584 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu « Actions ▾ ») :
  > « Détacher » → `index.cartes[carte_1].coursId` supprimé, toast « Carte détachée de son cours. »
- Catégorie : 1 · fait sans être prévu

**4.227** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu « Actions ▾ »
- Intention : aucune mention (termes cherchés : « Ancrer », « ancrer à la semaine »)
- Observation, l. 586 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu « Actions ▾ ») :
  > « Ancrer S4 » (leçon `planif-noeud_7` sans semaine[…]`metadata.semaine` : absent → `4`
- Catégorie : 1 · fait sans être prévu

**4.228** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu Actions — « Exporter le plan… »
- Intention : aucune mention (termes cherchés : « gabarit « Calendrier » », « Travail personnel »)
- Observation, l. 601 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu Actions — « Exporter le plan… ») :
  > `Sans titre-calendrier.tsv` (153 o) : « Semaine, Séance, Date, Contenu, Évaluations, Travail personnel »
- Catégorie : 1 · fait sans être prévu

**4.229** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu Actions — « Exporter le plan… »
- Intention : aucune mention (termes cherchés : « Plan copié », « colle-le où tu veux »)
- Observation, l. 604 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Menu Actions — « Exporter le plan… ») :
  > **Copier** `#planif-export-plan-copier` (7846-7859) : `navigator.clipboard.writeText`[…]le programme affiche « Plan copié — colle-le où tu veux. »
- Catégorie : 1 · fait sans être prévu

**4.230** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bibliothèque — « Exporter »
- Intention : aucune mention (termes cherchés : « dernière description », « description mémorisée »)
- Observation, l. 637 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bibliothèque — « Exporter ») :
  > **Écrit** `cc-derniere-description` : absent → `"Description Fictive Zorglub"` (LS + IDB)
- Catégorie : 1 · fait sans être prévu

**4.231** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bibliothèque — « Partager »
- Intention : aucune mention (termes cherchés : « Partager », « partager une carte »)
- Observation, l. 641 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bibliothèque — « Partager ») :
  > Modale de métadonnées puis « Valider » : **Écrit** `bibliothequeAlignements` (LS + IDB) : 1 → 2 éléments
- Catégorie : 1 · fait sans être prévu

**4.232** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bibliothèque — « Ajouter »
- Intention : aucune mention (termes cherchés : « Ajouter une carte », « carte de la bibliothèque »)
- Observation, l. 644 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bibliothèque — « Ajouter ») :
  > **Écrit** (élément démo) : `index.active` `carte_1` → `carte_2`[…]Le canevas affiche 17 blocs (observé).
- Catégorie : 1 · fait sans être prévu

**4.233** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bibliothèque — « Supprimer » une carte du trimestre
- Intention : aucune mention (termes cherchés : « dernière carte », « Impossible de supprimer la dernière »)
- Observation, l. 651 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Bibliothèque — « Supprimer » une carte du trimestre) :
  > Dernière carte du trimestre : refus avec « Impossible de supprimer la dernière carte du trimestre actif. »
- Catégorie : 1 · fait sans être prévu

**4.234** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Sélection : clic, Ctrl+clic, rectangle sur le fond, Échap
- Intention : aucune mention (termes cherchés : « rectangle », « glisser sur le fond »)
- Observation, l. 691 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Sélection : clic, Ctrl+clic, rectangle sur le fond, Échap) :
  > glisser sur le fond (js/planification-carte.js:6660-6748) : rectangle `#planif-rect-selection`, multi-sélection des blocs intersectés (5 blocs)
- Catégorie : 1 · fait sans être prévu

**4.235** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Poignées de redimensionnement
- Intention : aucune mention (termes cherchés : « redimensionner un bloc », « taille du bloc »)
- Observation, l. 702 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Poignées de redimensionnement) :
  > Bloc simple (+80, +40) : `metadata.largeur` → 290, `metadata.hauteur` → 114 ; double-clic : clés supprimées (observé).
- Catégorie : 1 · fait sans être prévu

**4.236** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Lien existant — clic sur le tracé et poignées
- Intention : aucune mention (termes cherchés : « changer le verbe », « Supprimer ce lien », « AUTRES VERBES »)
- Observation, l. 709 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Lien existant — clic sur le tracé et poignées) :
  > Clic : menu `#planif-menu-lien` « VERBE SUGGÉRÉ | se décline en | AUTRES VERBES
- Observation, l. 710 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Lien existant — clic sur le tracé et poignées) :
  > « Supprimer ce lien » : lien retiré (observé).
- Catégorie : 1 · fait sans être prévu

**4.237** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Lien existant — clic sur le tracé et poignées
- Intention : aucune mention (termes cherchés : « extrémité du lien », « déplacer un lien »)
- Observation, l. 711 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Lien existant — clic sur le tracé et poignées) :
  > Poignée d'extrémité cible glissée sur un autre bloc : `liens[planif-lien_2].cible` `planif-noeud_3` → `planif-noeud_7` (observé).
- Catégorie : 1 · fait sans être prévu

**4.238** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Recherche
- Intention : aucune mention (termes cherchés : « 2 caractères », « deux caractères », « Encore une lettre »)
- Observation, l. 726 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Recherche) :
  > saisie « Z » : le programme affiche « Encore une lettre — la recherche démarre à 2 caractères. »
- Catégorie : 1 · fait sans être prévu

**4.239** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Recherche
- Intention : aucune mention (termes cherchés : « résultat suivant », « Maj+Entrée »)
- Observation, l. 728 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Recherche) :
  > Entrée : compteur « 1/8 », `planif-noeud_1` reçoit `planif-noeud--trouve-actif` et devient la sélection ; ↓ : « 2/8 » ; Maj+Entrée : « 1/8 »
- Catégorie : 1 · fait sans être prévu

**4.240** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Palettes flottantes — déplacement par la barre
- Intention : aucune mention (termes cherchés : « déplacer la palette », « palette « Nœuds » déplaçable »)
- Observation, l. 744 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Palettes flottantes — déplacement par la barre) :
  > Palettes flottantes — déplacement par la barre
- Observation, l. 746 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Palettes flottantes — déplacement par la barre) :
  > style de `#planif-palette` → `right: auto; left: 112px; top: 32px;`
- Catégorie : 1 · fait sans être prévu

**4.241** · Conception — Carte d'alignement › Sous-écran Carte d'alignement › Planificateur
- Intention : aucune mention (termes cherchés : « détail de la leçon », « ▸ »)
- Observation, l. 751 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Planificateur) :
  > Chevron « ▸ » (`data-action=planificationCarte.basculerDetailLecon`) : devient « ▾ », la leçon liste ses enfants
- Catégorie : 1 · fait sans être prévu

**4.242** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions »
- Intention : aucune mention (termes cherchés : « Ajouter mes productions », « Ajouter mes »)
- Observation, l. 866 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > « Ajouter mes productions à la bibliothèque »[…]notification « 5 productions ajoutées à la bibliothèque. »
- Catégorie : 1 · fait sans être prévu

**4.243** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions »
- Intention : aucune mention (termes cherchés : « Exporter toutes mes productions », « Exporter toutes », « (JSON) »)
- Observation, l. 867 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > « Exporter toutes mes productions (JSON) »[…]notification « 5 production(s) exportée(s) avec succès »
- Catégorie : 1 · fait sans être prévu

**4.244** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions »
- Intention : aucune mention (termes cherchés : « Importer des productions (JSON) », « (JSON) »)
- Observation, l. 875 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > « Importer des productions (JSON) »
- Observation, l. 876 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > notification « Import réussi 5 production(s) mise(s) à jour.
- Catégorie : 1 · fait sans être prévu

**4.245** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Fenêtre « Bibliothèque de grilles de critères »
- Intention : aucune mention (termes cherchés : « Ajouter mes grilles », « Ajouter mes »)
- Observation, l. 936 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Fenêtre « Bibliothèque de grilles de critères ») :
  > « Ajouter mes grilles à la bibliothèque »[…]notification « 2 grille(s) ajoutée(s) à la bibliothèque ! »
- Catégorie : 1 · fait sans être prévu

**4.246** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Fenêtre « Bibliothèque de grilles de critères »
- Intention : aucune mention (termes cherchés : « Exporter toutes mes grilles », « (JSON) »)
- Observation, l. 937 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Fenêtre « Bibliothèque de grilles de critères ») :
  > « Exporter toutes mes grilles (JSON) »[…]notification « 1 grille(s) exportée(s) avec succès »
- Catégorie : 1 · fait sans être prévu

**4.247** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Fenêtre « Bibliothèque de grilles de critères »
- Intention : aucune mention (termes cherchés : « Importer des grilles », « (JSON) »)
- Observation, l. 943 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Fenêtre « Bibliothèque de grilles de critères ») :
  > « Importer des grilles (JSON) »[…]notification « Import réussi 1 grille(s) mise(s) à jour.
- Catégorie : 1 · fait sans être prévu

**4.248** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Fenêtre « Bibliothèque d'échelles de performance »
- Intention : aucune mention (termes cherchés : « Ajouter mes échelles », « Ajouter mes »)
- Observation, l. 987 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Fenêtre « Bibliothèque d'échelles de performance ») :
  > « Ajouter mes échelles à la bibliothèque »[…]notification « 2 échelle(s) ajoutée(s) à la bibliothèque ! »
- Catégorie : 1 · fait sans être prévu

**4.249** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Fenêtre « Bibliothèque d'échelles de performance »
- Intention : aucune mention (termes cherchés : « Exporter toutes mes échelles », « (JSON) »)
- Observation, l. 988 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Fenêtre « Bibliothèque d'échelles de performance ») :
  > « Exporter toutes mes échelles (JSON) »[…]notification « 1 échelle(s) exportée(s) avec succès »
- Catégorie : 1 · fait sans être prévu

**4.250** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Fenêtre « Bibliothèque d'échelles de performance »
- Intention : aucune mention (termes cherchés : « Importer des échelles », « (JSON) »)
- Observation, l. 993 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-echelle-performance › Fenêtre « Bibliothèque d'échelles de performance ») :
  > « Importer des échelles (JSON) »[…]notification « Import réussi 1 nouvelle(s) échelle(s) ajoutée(s).
- Catégorie : 1 · fait sans être prévu

**4.251** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « Télécharger un modèle »
- Intention : aucune mention (termes cherchés : « Choisis d'abord une grille et une échelle », « modèle est construit à partir des deux », « sans grille ni échelle »)
- Observation, l. 1003 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « Télécharger un modèle ») :
  > sans grille ni échelle : `alert` « Choisis d'abord une grille et une échelle : le modèle est construit à partir des deux. »
- Catégorie : 1 · fait sans être prévu

**4.252** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Modification d'une cartouche existante
- Intention : aucune mention (termes cherchés : « Changer de grille », « reconfigurer la matrice », « changer la grille d'une cartouche existante »)
- Observation, l. 1021 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Modification d'une cartouche existante) :
  > Changement de grille sur une cartouche ouverte (`#selectGrilleCartouche` → « Grille de départ ») : `confirm` « Changer de grille va reconfigurer la matrice. Les commentaires des critères communs seront conservés. Continuer ? » ; accepté : matrice reconstruite avec les critères « Compréhension, Application, Analyse, Synthèse » ; aucune écriture de stockage
- Catégorie : 1 · fait sans être prévu

**4.253** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Élément de liste
- Intention : aucune mention (termes cherchés : « métadonnées (cartouche, pratique) », « AUTEUR », « CRÉÉ LE », « MODIFIÉ LE », « panneau »)
- Observation, l. 1026 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Élément de liste) :
  > panneau `#panneauMetadonneesCartouche` « AUTEUR Prof Fictif-Zorglub | CRÉÉ LE 14 octobre 2026 | MODIFIÉ LE — | DESCRIPTION — | LICENCE »
- Observation, l. 1157 (Conception — Pratiques de notation › Éditeur de pratique › Ligne de la barre latérale) :
  > panneau métadonnées « AUTEUR Prof Fictif-Zorglub CRÉÉ LE 13 octobre 2026 MODIFIÉ LE — … »
- Catégorie : 1 · fait sans être prévu

**4.254** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « Exporter en texte »
- Intention : aucune mention (termes cherchés : « Exporter en texte », « en texte », « export texte d'une cartouche », « .md »)
- Observation, l. 1038 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « Exporter en texte ») :
  > #### « Exporter en texte » `#btnExporterTexteCartouche` → `exporterCartoucheEnTexte` (js/cartouches.js:1693)
- Observation, l. 1040 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « Exporter en texte ») :
  > téléchargement `fictif-cartouche-simple.md` (text/markdown) : « # Fictif-Cartouche Simple », « Grille : Fictif-Grille Zorglub Renommée », « Auteur : Prof Fictif-Zorglub », « Contexte : Exemple contexte général », puis par critère « ## <critère> » et une ligne « **<critère> (<code>)** : <commentaire> » par niveau (commentaires en mémoire, voir import ci-dessus) ; notification « Cartouche exportée en format texte »
- Catégorie : 1 · fait sans être prévu

**4.255** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « Exporter en PDF »
- Intention : aucune mention (termes cherchés : « Exporter en PDF (cartouche) », « PDF de la cartouche », « cartouche-<nom>.pdf »)
- Observation, l. 1043 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « Exporter en PDF ») :
  > #### « Exporter en PDF » `#btnExporterPDFCartouche` → `exporterCartoucheSelectionneeEnPDF` (js/export-pdf.js:1125)
- Observation, l. 1045 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › « Exporter en PDF ») :
  > téléchargement `cartouche-Fictif-Cartouche Simple.pdf` (PDF 1.3, 1 page paysage 792 × 612 pt
- Catégorie : 1 · fait sans être prévu

**4.256** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Fenêtre « Bibliothèque de cartouches de rétroaction »
- Intention : aucune mention (termes cherchés : « Exporter toutes mes », « JSON (bibliothèque des cartouches) », « Métadonnées d'export (cartouches) »)
- Observation, l. 1058 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Fenêtre « Bibliothèque de cartouches de rétroaction ») :
  > « Exporter toutes mes cartouches (JSON) » (`exporterCartouches`, js/cartouches.js:1063) : fenêtre « Métadonnées d'export » (« 1 cartouche(s) pour 1 grille(s) », champs préremplis nom, courriel, discipline « 101 Biologie », institution « Collège Imaginaire de Nulle-Part ») ; téléchargement `cartouches-999-fic-zz-101-biologie-CC-BY-SA-2026-10-14-11h19.json` = `{metadata:{licence:"CC BY-NC-SA 4.0", type:"cartouches", nom:"Cartouches de rétroaction", auteur_original, email_auteur, discipline:["101 Biologie"], niveau:"Collégial", institution, description_courte:"Exemple de description Zorglub", …}, contenu:{cartouches:{"GRILLE_…":[« Fictif-Cartouche Renommée »]}}}` (« Cartouche de départ » supprimée auparavant) ; notification « 1 cartouche(s) exportée(s) avec succès » (observé à l'exécution). Le nom de fichier porte « CC-BY-SA » alors que `metadata.licence` vaut « CC BY-NC-SA 4.0 » (observé à l'exécution).
- Catégorie : 1 · fait sans être prévu

**4.257** · Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Fenêtre « Bibliothèque de cartouches de rétroaction »
- Intention : aucune mention (termes cherchés : « Importer des », « importer des cartouches », « JSON (import de cartouches) »)
- Observation, l. 1063 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-retroactions (cartouches) › Fenêtre « Bibliothèque de cartouches de rétroaction ») :
  > « Importer des cartouches (JSON) » (`#fichier-import-cartouches-modal`, `data-on-change=importerCartouches`, js/cartouches.js:1137) avec le fichier exporté : fenêtre « Veux-tu importer ces cartouches ? » (« Annuler », « Importer ») ; « Importer » (`confirmerEtFermerImportCartouches`, js/cartouches.js:1928) : `bibliothequeCartouches` absent → `[{… « Fictif-Cartouche Renommée », dateAjoutBiblio}]` ; notification « ✅ Import réussi ! 1 nouvelle(s) cartouche(s) ajoutée(s). Consulte « Cartouches disponibles » pour les ajouter à ta sélection. »
- Catégorie : 1 · fait sans être prévu

**4.258** · Conception — Pratiques de notation › Assistant de configuration
- Intention : aucune mention (termes cherchés : « Remplis », « validation de l'assistant », « discipline obligatoire »)
- Observation, l. 1098 (Conception — Pratiques de notation › Assistant de configuration) :
  > **Validation** : « Suivant » sans choix → notification « Remplis : porteEntree » ; sans échelle (STD) → « Remplis : Échelle de performance » ; DEN sans cible ni méthode → « Remplis : Cibles d'apprentissage, methodeSuggestionDen » ; aucune écriture
- Observation, l. 1140 (Conception — Pratiques de notation › Assistant de configuration › Repères d'échelle dans l'assistant (étape « Échelle de performance »)) :
  > « Informations de base » refuse « Suivant » tant que la discipline (obligatoire) est vide
- Catégorie : 1 · fait sans être prévu

**4.259** · Conception — Pratiques de notation › Assistant de configuration
- Intention : aucune mention (termes cherchés : « Aucune règle spéciale », « règles spéciales », « cases exclusives »)
- Observation, l. 1099 (Conception — Pratiques de notation › Assistant de configuration) :
  > **Cases à cocher exclusives** `[data-action=wizardV2GererExclusionCheckbox]` (l. 1958-1972) : cocher « Aucune règle spéciale » décoche les autres règles ; cocher une règle décoche « aucune »
- Catégorie : 1 · fait sans être prévu

**4.260** · Conception — Pratiques de notation › Assistant de configuration › Parcours SOM (décrire → moyenne) — entrées : règle double_verrou, 5 évaluations, seuils 80/70/60, évaluation verrouillée « Examen Fictif-Zorglub », seuil 58, plafond 50, nom « Fictif-SOM Zorglub », description « Pratique sommative fictive », discipline « 101 Biologie »
- Intention : aucune mention (termes cherchés : « seuils (pratique) », « Bien ≥ », « Grande difficulté », « seuils personnels »)
- Observation, l. 1104 (Conception — Pratiques de notation › Assistant de configuration › Parcours SOM (décrire → moyenne) — entrées : règle double_verrou, 5 évaluations, seuils 80/70/60, évaluation verrouillée « Examen Fictif-Zorglub », seuil 58, plafond 50, nom « Fictif-SOM Zorglub », description « Pratique sommative fictive », discipline « 101 Biologie ») :
  > seuils-personnels [5/8] (défauts 75/65/55)
- Observation, l. 1105 (Conception — Pratiques de notation › Assistant de configuration › Parcours SOM (décrire → moyenne) — entrées : règle double_verrou, 5 évaluations, seuils 80/70/60, évaluation verrouillée « Examen Fictif-Zorglub », seuil 58, plafond 50, nom « Fictif-SOM Zorglub », description « Pratique sommative fictive », discipline « 101 Biologie ») :
  > « Seuils : Bien ≥80% | Difficulté ≤70% | Grande difficulté <60% »
- Catégorie : 1 · fait sans être prévu

**4.261** · Conception — Pratiques de notation › Assistant de configuration › Parcours SOM (décrire → moyenne) — entrées : règle double_verrou, 5 évaluations, seuils 80/70/60, évaluation verrouillée « Examen Fictif-Zorglub », seuil 58, plafond 50, nom « Fictif-SOM Zorglub », description « Pratique sommative fictive », discipline « 101 Biologie »
- Intention : aucune mention (termes cherchés : « évaluations prévues », « nombre d'évaluations (assistant) », « nbEvaluationsPrevues »)
- Observation, l. 1104 (Conception — Pratiques de notation › Assistant de configuration › Parcours SOM (décrire → moyenne) — entrées : règle double_verrou, 5 évaluations, seuils 80/70/60, évaluation verrouillée « Examen Fictif-Zorglub », seuil 58, plafond 50, nom « Fictif-SOM Zorglub », description « Pratique sommative fictive », discipline « 101 Biologie ») :
  > nb-evaluations [4/8] (défaut 6)
- Observation, l. 1105 (Conception — Pratiques de notation › Assistant de configuration › Parcours SOM (décrire → moyenne) — entrées : règle double_verrou, 5 évaluations, seuils 80/70/60, évaluation verrouillée « Examen Fictif-Zorglub », seuil 58, plafond 50, nom « Fictif-SOM Zorglub », description « Pratique sommative fictive », discipline « 101 Biologie ») :
  > « Évaluations prévues : 5 »
- Catégorie : 1 · fait sans être prévu

**4.262** · Conception — Pratiques de notation › Assistant de configuration › « Ouvrir le comparateur du Labo »
- Intention : aucune mention (termes cherchés : « Ouvrir le comparateur », « comparateur (depuis l'assistant) », « Exploration des pratiques (depuis l'assistant) »)
- Observation, l. 1147 (Conception — Pratiques de notation › Assistant de configuration › « Ouvrir le comparateur du Labo ») :
  > #### « Ouvrir le comparateur du Labo » `[data-action=ouvrirComparateurDepuisWizard]` (l. 1703-1708)
- Observation, l. 1148 (Conception — Pratiques de notation › Assistant de configuration › « Ouvrir le comparateur du Labo ») :
  > Ferme l'assistant sans écriture et affiche `section-labo`, sous-onglet « Exploration des pratiques »
- Catégorie : 1 · fait sans être prévu

**4.263** · Conception — Pratiques de notation › Éditeur de pratique › `#mat-selection-nombre`,
- Intention : aucune mention (termes cherchés : « Pondération unitaire », « Total : 100% », « pondération (Sélection / Obligatoires) », « dépasse de »)
- Observation, l. 1192 (Conception — Pratiques de notation › Éditeur de pratique › `#mat-selection-nombre`,) :
  > **Valeurs calculées** (1 production en sélection, 1 obligatoire) : nombre 3, 70 / 35 → « Total : 105% (dépasse de 5%) », « 23.33% par production retenue (1 dans le pool) » (70/3), « 35.00% par production (1 cochée) », « 3 meilleures + 1 obligatoire = 4 productions (70% + 35% = 105%) ⚠️ ≠ 100% »
- Catégorie : 1 · fait sans être prévu

**4.264** · Conception — Pratiques de notation › Éditeur de pratique › Pratique SPE ouverte (« Fictif-SPE Zorglub », créée par l'assistant)
- Intention : aucune mention (termes cherchés : « types de travail », « Type 1 », « Types de productions », « type de production (pratique SPE) »)
- Observation, l. 1204 (Conception — Pratiques de notation › Éditeur de pratique › Pratique SPE ouverte (« Fictif-SPE Zorglub », créée par l'assistant)) :
  > `[data-action=ajouterTypeTravailMat]` (l. 1398-1421) ×2 → `configuration.typesTravaux`
- Observation, l. 1208 (Conception — Pratiques de notation › Éditeur de pratique › Pratique SPE ouverte (« Fictif-SPE Zorglub », créée par l'assistant)) :
  > `[data-action=supprimerTypeTravailMat]` (l. 1450-1468) index 1 → « Type 2 » retiré de `typesTravaux` ; l'en-tête du tableau des forfaits affiche encore la colonne « Type 2 » (non réaffiché) ; `forfaits[*].travaux` non nettoyés (observé)
- Catégorie : 1 · fait sans être prévu

**4.265** · Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Exporter (JSON) »
- Intention : aucune mention (termes cherchés : « Exporter (JSON) », « exporter une pratique en JSON », « configuration-pratique »)
- Observation, l. 1257 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Exporter (JSON) ») :
  > #### « Exporter (JSON) » `[data-action=partagerPratiqueMateriel]` (l. 1744-1775)
- Observation, l. 1259 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Exporter (JSON) ») :
  > fichier `pratique-fictif-som-zorglub-999-fic-zz-101-biologie-CC-BY-SA-2026-10-14-03h14.json` (application/json, 1199 o) : `{version:"1.0", type:"configuration-pratique", dateExport, configuration:<objet pratique complet>}` ; le nom contient le code et la discipline de `infoCours` (`genererNomFichierExport`, js/cc-license.js:1243) ; notification « Fichier de partage téléchargé »
- Catégorie : 1 · fait sans être prévu

**4.266** · Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Exporter toutes mes pratiques (JSON) »
- Intention : aucune mention (termes cherchés : « Exporter toutes mes », « toutes mes pratiques », « Métadonnées d'export (pratiques) »)
- Observation, l. 1263 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Exporter toutes mes pratiques (JSON) ») :
  > modale « Métadonnées d'export | … Tu exportes : Pratiques de notation | 8 pratique(s) | … » avec Nom « Prof Fictif-Zorglub », Courriel « prof.fictif@exemple.invalid », Discipline(s) « 101 Biologie », Institution « Collège Imaginaire de Nulle-Part », Niveau « Collégial », Description vide (observé). « Annuler » : rien. « Valider et exporter » sans description : `alert` « La description est obligatoire. »
- Observation, l. 1265 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Exporter toutes mes pratiques (JSON) ») :
  > **Fichier** : `pratiques-999-fic-zz-101-biologie-CC-BY-SA-2026-10-14-03h16.json` (11 391 o) : `{metadata:{licence:"CC BY-NC-SA 4.0", licence_url, auteur_original:"Prof Fictif-Zorglub", email_auteur:"prof.fictif@exemple.invalid", type:"pratiques", nom:"Pratiques de notation", discipline:["101 Biologie"], niveau:"Collégial", institution, description_courte:"Export fictif Zorglub", …}, contenu:{pratiques:[8 objets complets]}}` — inclut la pratique retirée (`dansBibliotheque:false`) et le gabarit ajouté `SOM-litterature` ; notification « 8 pratique(s) exportée(s) avec succès »
- Catégorie : 1 · fait sans être prévu

**4.267** · Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Importer des pratiques (JSON) »
- Intention : aucune mention (termes cherchés : « Importer des », « importer des pratiques », « JSON (import de pratiques) »)
- Observation, l. 1272 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Importer des pratiques (JSON) ») :
  > #### « Importer des pratiques (JSON) » `[data-action=ouvrirFilePickerImportPratiques]`
- Observation, l. 1275 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Importer des pratiques (JSON) ») :
  > `alert` « ❌ Erreur lors de l'import. Format invalide: pratiques ou configurations non trouvées »
- Observation, l. 1276 (Conception — Pratiques de notation › Modale « Bibliothèque de pratiques de notation » › « Importer des pratiques (JSON) ») :
  > « Importer » sur le fichier « toutes mes pratiques » : clé globale `bibliothequePratiques` absente → 8 entrées (objets assainis + `dateAjoutBiblio`) ; notification « Import réussi — 8 nouvelle(s) pratique(s) ajoutée(s). Consulte « Pratiques disponibles »… » ; `a2026_pratiquesConfigurables` inchangé ; la pratique retirée réapparaît en section 2 avec le badge « Retirée » (observé). Réimport du même fichier : « 8 pratique(s) mise(s) à jour. » sans changement de stockage (observé).
- Catégorie : 1 · fait sans être prévu

---

## Partie 5 · Évaluation

### Écran 43 · Évaluation (toute la section)

**5.1** · Sans geste
- Intention, l. 2007 :
  > un seul témoin, le même partout, dit « Enregistré » après chaque écriture
- Observation : aucune mention (termes cherchés : « témoin « Enregistré » », « Enregistré », « témoin », « temoinEnregistrement »)
- Catégorie : 2 · prévu mais pas fait

**5.2** · Sans geste
- Intention, l. 2009 :
  > Sur l'iPad, « Enregistré » paraît au-dessus du clavier, […] et redescend quand le clavier se ferme
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**5.3** · Sans geste
- Intention, l. 2010 :
  > Pour une évaluation ou une copie, « Enregistré » attend que la donnée soit vraiment écrite, sans délai perceptible
- Observation : aucune mention (termes cherchés : « Enregistré », « témoin », « temoinEnregistrement », « donnees-enregistrees »)
- Catégorie : 2 · prévu mais pas fait

**5.4** · Sans geste
- Intention, l. 2012 :
  > En mode anonymisation, on travaille normalement et tout s'enregistre ; seul l'affichage protège l'identité ; aucune valeur de substitution (« Élève 32 », DA masqué) n'est écrite dans les données réelles ; rien d'identifiant ne s'affiche
- Observation : aucune mention (termes cherchés : « anonymisation », « anonymisé », « mode-anonymise », « Élève »)
- Catégorie : 2 · prévu mais pas fait

**5.5** · Sans geste
- Intention, l. 2013 :
  > Aucun enseignant ne lit dans cette section le SRPNF, l'EUF, le CAF, la littérature ou le français s'il n'en fait pas, sauf ce qu'il a écrit lui-même
- Observation, l. 342 (Cadre › calendrier-trimestre › Accordéon « Cours et services ») :
  > discipline « 101 Biologie »
- Observation, l. 1684 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > **Palette « CODES » (erreurs de français, `#travaux-palette-erreurs-fr`)** : le programme affiche « 1 Construction syntaxique / accord du verbe | 2 Subordonnée employée seule
- Observation, l. 1690 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > Palettes ouvertes par défaut à l'ouverture d'une copie : `travaux-palette-flottante`, `travaux-palette-erreurs-fr`, `travaux-palette-tampons`
- Catégorie : 3 · fait autrement

**5.6** · Sans geste
- Intention, l. 2014 :
  > rien n'est effacé
- Observation, l. 399 (Cadre › calendrier-trimestre › Accordéon « Groupe d'étudiant·es ») :
  > « Supprimer » → boîte « Écrire un codex avant de supprimer ? Supprimer la fiche de cet·te étudiant·e l'efface pour de bon. … » → « Supprimer sans codex » → `confirm` « Supprimer Exemple Fictif-Foxtrot ? » → fiche retirée de `a2026_groupeEtudiants`
- Catégorie : 3 · fait autrement

**5.7** · Sans geste
- Intention, l. 2014 :
  > ce qui MONTRE ou ENVOIE ses données à quelqu'un l'écarte (écrans, Léa, chercheurs) ; ce qui GARDE emporte tout (codex, archives, export complet)
- Observation : aucune mention (termes cherchés : « elevesDesinscrits », « désinscrit », « élève supprimé », « Étudiant supprimé »)
- Catégorie : 2 · prévu mais pas fait

**5.8** · Sans geste
- Intention, l. 2015 :
  > Rien n'est recalculé ni réécrit à l'ouverture de l'application
- Observation, l. 2634 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Code exécuté au chargement par module (hors écrans)) :
  > Le calcul a lieu sur `db-ready` : […] `calculerEtStockerIndicesCP()` (portfolio.js:139, écrit `cle('indicesCP')` via `setSyncSiChange` en ignorant `dateCalcul`/`date`)
- Catégorie : 3 · fait autrement

**5.9** · Sans geste
- Intention, l. 2016 :
  > Les correctifs tarissent la source sans réécrire ce qui est déjà enregistré chez l'utilisateur
- Observation, l. 2779 (Ce qui se produit sans geste de l'utilisateur › Évaluation › Importer, annoter, exporter) :
  > `initialiserModuleTravaux` au premier affichage d'un sous-écran : […] correction des `groupeCoursId`
- Catégorie : 3 · fait autrement

**5.10** · Sans geste
- Intention, l. 2017 :
  > si le codex n'est pas à jour, la fenêtre « Mettre ton codex à jour avant de supprimer ? » vient d'abord : « Annuler », « Supprimer sans mettre à jour », « Mettre à jour, puis supprimer »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, […]) : […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.11** · Sans geste
- Intention, l. 2017 :
  > codex à jour : rien ne change
- Observation : aucune mention (termes cherchés : « codex à jour », « à jour », « proposerAvantSuppression »)
- Catégorie : 2 · prévu mais pas fait

### Écran 44 · Évaluation › Liste des évaluations

**5.12** · Geste : Lire et trier la liste
- Intention, l. 2023 :
  > Données : non documenté.
- Observation, l. 1310 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Affichage du tableau) :
  > à l'affichage de la liste, `_migration_thumbnails_done` absent → `true` (localStorage + IDB)
- Observation, l. 1320 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Filtre Production) :
  > **Écrit** (observé à l'exécution) : `filtresListeEvaluations` absent → `{"production":"PROD_…f54c81fddfba","statut":""}` (localStorage + IDB) ; à chaque changement, la valeur courante des deux filtres est réécrite
- Observation, l. 1342 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Cases « Colonnes ») :
  > décocher « Prénom » → `sessionStorage['eval-colonnes-visibles']`
- Catégorie : 1 · fait sans être prévu

**5.13** · Geste : Lire et trier la liste
- Intention, l. 2025 :
  > avec le réglage « Masquer les notes par travail », la note chiffrée est remplacée par le repère « note différée »
- Observation : aucune mention (termes cherchés : « Masquer les notes par travail », « note différée », « noteDifferee »)
- Catégorie : 2 · prévu mais pas fait

**5.14** · Geste : Lire et trier la liste
- Intention, l. 2026 :
  > une évaluation enregistrée mais non verrouillée porte le badge « Non verrouillée »
- Observation, l. 1317 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › État de la liste utilisé pour les gestes suivants (observé à l'exécution)) :
  > 4444444/A non verrouillée, intégrité « plagiat »
- Observation, l. 1317 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › État de la liste utilisé pour les gestes suivants (observé à l'exécution)) :
  > 4444444/A Jeton « Non recevable (Plagiat) », Statut « 0 »
- Catégorie : 3 · fait autrement

**5.15** · Geste : Lire et trier la liste
- Intention, l. 2026 :
  > avec l'infobulle « Non verrouillée : ne compte pas encore dans la note. »
- Observation : aucune mention (termes cherchés : « infobulle », « ne compte pas encore dans la note », « Non verrouillée »)
- Catégorie : 2 · prévu mais pas fait

**5.16** · Geste : Lire et trier la liste
- Intention, l. 2026 :
  > une évaluation enregistrée mais non verrouillée porte le badge « Non verrouillée »
- Observation, l. 1313 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Affichage du tableau) :
  > « -- » si `statutRemise` vaut `non-remis`/`retard` ou si non recevable
- Observation, l. 1317 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › État de la liste utilisé pour les gestes suivants (observé à l'exécution)) :
  > 4444444/A Jeton « Non recevable (Plagiat) », Statut « 0 », Note « -- », actions sans « Dossier PDF »
- Catégorie : 3 · fait autrement

**5.17** · Geste : Lire et trier la liste
- Intention, l. 2026 :
  > une évaluation enregistrée mais non verrouillée porte le badge « Non verrouillée »
- Observation, l. 1538 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Jetons) :
  > reprise « Reprise (était E · 86%) | À RÉÉVALUER | E | 86% »
- Catégorie : 3 · fait autrement

**5.18** · Geste : Lire et trier la liste
- Intention, l. 2027 :
  > son infobulle propose de filtrer par statut (« …annotée, évaluée, non verrouillée (ne compte pas encore dans la note) ») ou par type de jeton
- Observation : aucune mention (termes cherchés : « infobulle », « filtrer par statut », « type de jeton », « filtre-statut-eval »)
- Catégorie : 2 · prévu mais pas fait

**5.19** · Geste : Lire et trier la liste
- Intention, l. 2028 :
  > les statuts s'accordent au féminin, comme production, évaluation et copie
- Observation, l. 1311 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Affichage du tableau) :
  > Sans évaluation : statut « NON REÇU »
- Observation, l. 1312 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Affichage du tableau) :
  > ligne « ÉVALUÉ | M | 80.3% »
- Observation, l. 1367 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Lignes avec copie importée (observé à l'exécution)) :
  > Filtre Statut « Importé » → ces 2 lignes
- Catégorie : 3 · fait autrement

**5.20** · Geste : Lire et trier la liste
- Intention, l. 2028 :
  > le filtre Statut offre, dans cet ordre : « Toutes », « Non reçue », « Reçue », « Importée », « Annotée », « Évaluée », « Non verrouillée », « Non évaluée », « Non associée », « Jeton de délai », « Jeton de reprise », « Jeton de reprise ciblée », « Tous les jetons », « Remplacée »
- Observation : aucune mention (termes cherchés : « ordre des options », « filtre-statut-eval », « « Reçue » », « « Annotée » », « « Non évaluée » »)
- Catégorie : 2 · prévu mais pas fait

**5.21** · Geste : Lire et trier la liste
- Intention, l. 2029 :
  > une reprise ciblée se classe avec les reprises
- Observation, l. 2899 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > jeton de reprise ciblée et jetons personnalisés, […] : non exécutés (copie requise, blobs non conservés entre sessions)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.22** · Geste : Lire et trier la liste
- Intention, l. 2029 :
  > lisible en mode clair
- Observation : aucune mention (termes cherchés : « mode clair », « lisible », « ↑ », « ↕ »)
- Catégorie : 2 · prévu mais pas fait

**5.23** · Geste : Lire et trier la liste
- Intention, l. 2030 :
  > la mention « Fichier sous… » ne paraît que lorsqu'elle est la seule trace du fichier, jamais sur les travaux à venir
- Observation : aucune mention (termes cherchés : « Fichier sous », « seule trace », « travaux à venir »)
- Catégorie : 2 · prévu mais pas fait

**5.24** · Geste : Lire et trier la liste
- Intention, l. 2031 :
  > le menu « Actions » a la même largeur d'une ligne à l'autre ; sur iPad, le menu d'actions fait 44 px au doigt
- Observation : aucune mention (termes cherchés : « largeur », « 44 px », « iPad », « eval-actions-select »)
- Catégorie : 2 · prévu mais pas fait

**5.25** · Geste : Choisir « Évaluer » dans le menu « Actions… »
- Intention, l. 2035 :
  > Données : non documenté (l'ouverture elle-même n'écrit rien).
- Observation, l. 1441 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Action « Évaluer ») :
  > `sessionStorage['travaux-dernier-fichier']` retiré (lu dans le code, :140)
- Catégorie : 1 · fait sans être prévu

**5.26** · Geste : Choisir « Évaluer » dans le menu « Actions… »
- Intention, l. 2036 :
  > si la copie est importée, elle s'ouvre directement en mode Évaluer, annotée ou non, et « Annoter » reste à un clic
- Observation : aucune mention (termes cherchés : « Évaluer », « evaluerProduction », « _evaluerSansCopie », « mode Évaluer »)
- Catégorie : 2 · prévu mais pas fait

**5.27** · Geste : Choisir « Consulter »
- Intention, l. 2041 :
  > rien n'est écrit, y compris dans un trimestre clos
- Observation, l. 1466 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Action « Consulter ») :
  > **Écrit** : `jetonsEtudiants` absent → `{"1111111":{}}` (localStorage + IDB) (observé à l'exécution).
- Observation, l. 1483 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Action « Consulter » sur une évaluation non verrouillée (3333333/A)) :
  > **Écrit** : `jetonsEtudiants` reçoit une entrée vide pour le DA consulté
- Catégorie : 3 · fait autrement

**5.28** · Geste : Choisir « Consulter »
- Intention, l. 2042 :
  > sur un trimestre en lecture seule, en lecture seule
- Observation : aucune mention (termes cherchés : « trimestre clos », « lecture seule », « Trimestre clos », « bandeau-archive »)
- Catégorie : 2 · prévu mais pas fait

**5.29** · Geste : Choisir « Consulter »
- Intention, l. 2043 :
  > relire une évaluation d'un ancien trimestre ne donne pas « Erreur de chargement », même après avoir évalué une copie dans le trimestre courant
- Observation : aucune mention (termes cherchés : « Erreur de chargement », « ancien trimestre », « autre trimestre »)
- Catégorie : 2 · prévu mais pas fait

**5.30** · Geste : Choisir « Consulter »
- Intention, l. 2044 :
  > dans un trimestre clos, on peut passer d'un élève à l'autre dans une évaluation verrouillée, en lecture seule
- Observation : aucune mention (termes cherchés : « trimestre clos », « lecture seule », « naviguerEtudiantSuivant »)
- Catégorie : 2 · prévu mais pas fait

**5.31** · Geste : Choisir « Annoter »
- Intention, l. 2048 :
  > Données : aucune (enchaînement d'écran)
- Observation, l. 2898 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Actions de liste « Annoter », « Modifier » (éditeur de pages), « Voir les fichiers multiples », bandeau doublons « Examiner » : ouvrent les écrans Annoter/Importer (périmètre d'un autre agent).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.32** · Geste : Choisir « Annoter »
- Intention, l. 2049 :
  > la copie s'ouvre en mode Annoter avec sa palette d'outils, palettes d'évaluation fermées, et le bouton dit « Annoter », même après un passage en mode Évaluer ou un détour par une autre section
- Observation, l. 2898 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Actions de liste « Annoter », « Modifier » (éditeur de pages), « Voir les fichiers multiples », bandeau doublons « Examiner » : ouvrent les écrans Annoter/Importer (périmètre d'un autre agent).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.33** · Geste : Choisir « Dossier PDF »
- Intention, l. 2056 :
  > le fichier sans copie s'appelle « synthese_Prénom_Nom_production.pdf »
- Observation, l. 1357 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Dossier PDF ») :
  > téléchargement `synthese_Testeur_Fictif-Alpha_PROD_1791898995770_1_eefde2bcb73e.pdf`
- Catégorie : 3 · fait autrement

**5.34** · Geste : Choisir « Dossier PDF »
- Intention, l. 2056 :
  > avec copie « dossier_… »
- Observation : aucune mention (termes cherchés : « dossier_ », « Dossier PDF », « exporterDossierComplet »)
- Catégorie : 2 · prévu mais pas fait

**5.35** · Geste : Réassigner (ou Assigner) une copie depuis sa ligne
- Intention, l. 2060 :
  > la production et, au besoin, l'élève de la copie changent ; un fichier remplacé va à la corbeille, récupérable 30 jours
- Observation, l. 2905 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Option `prompt` annulée de « Renommer » et Propriétés avec changement d'étudiant·e/production/évaluation liée/case reprise : non exécutés.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.36** · Geste : Réassigner (ou Assigner) une copie depuis sa ligne
- Intention, l. 2062 :
  > en haut, la vignette de la première page et le nom du fichier
- Observation : aucune mention (termes cherchés : « vignette », « miniature », « thumbnail », « Propriétés du fichier »)
- Catégorie : 2 · prévu mais pas fait

**5.37** · Geste : Réassigner (ou Assigner) une copie depuis sa ligne
- Intention, l. 2063 :
  > la question « Un fichier existe déjà pour cette production (…) : [fichier existant] / Le remplacer par : [ce fichier] » nomme les deux fichiers, et l'élève s'il change ; « Annuler » : la fenêtre reste ouverte, rien n'est écrit, notification « Réassignation annulée »
- Observation, l. 1656 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > Avec une évaluation liée ou un conflit, le programme ouvre `confirm` « L'évaluation déjà faite sur « … » n'aura plus de copie liée (l'évaluation elle-même est conservée). Continuer ? » ; refus → valeur précédente rétablie
- Catégorie : 3 · fait autrement

**5.38** · Geste : Réassigner (ou Assigner) une copie depuis sa ligne
- Intention, l. 2066 :
  > en mode anonymisation, ni le vrai nom d'élève ni le vrai nom de fichier n'apparaissent dans la fenêtre ni dans la question
- Observation : aucune mention (termes cherchés : « anonymisation », « Propriétés du fichier », « Élève »)
- Catégorie : 2 · prévu mais pas fait

**5.39** · Geste : Réassigner (ou Assigner) une copie depuis sa ligne
- Intention, l. 2067 :
  > correction d'identité du panneau
- Observation : aucune mention (termes cherchés : « correction d'identité », « panneau d'évaluation », « identité », « reassignerCopie »)
- Catégorie : 2 · prévu mais pas fait

**5.40** · Geste : Réassigner une sélection de copies en lot
- Intention, l. 2071 :
  > un fichier en conflit va à la corbeille
- Observation : aucune mention (termes cherchés : « conflit », « corbeille », « ecrireReassignation »)
- Catégorie : 2 · prévu mais pas fait

**5.41** · Geste : Réassigner une sélection de copies en lot
- Intention, l. 2072 :
  > « tout sélectionner » suit le filtre
- Observation : aucune mention (termes cherchés : « tout sélectionner », « eval-tout-selectionner », « filtre »)
- Catégorie : 2 · prévu mais pas fait

**5.42** · Geste : Réassigner une sélection de copies en lot
- Intention, l. 2073 :
  > un bloc « 1 conflit » nomme le fichier qui part à la corbeille et celui qui le remplace
- Observation : aucune mention (termes cherchés : « 1 conflit », « conflit », « reassigner-selection-overlay »)
- Catégorie : 2 · prévu mais pas fait

**5.43** · Geste : Réassigner une sélection de copies en lot
- Intention, l. 2075 :
  > sur l'iPad, chaque tape coche la bonne ligne du premier coup
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**5.44** · Geste : Supprimer une évaluation (« Supprimer l'évaluation »)
- Intention, l. 2080 :
  > annonce le sort du fichier de la reprise ; la ligne de l'originale rouvre ensuite le travail ORIGINAL
- Observation, l. 2899 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > suppression d'une reprise avec restauration de l'originale (js/liste-evaluations.js:1612-1690), […] : non exécutés (copie requise, blobs non conservés entre sessions)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.45** · Geste : Supprimer une évaluation (« Supprimer l'évaluation »)
- Intention, l. 2081 :
  > le même geste se comporte de la même façon depuis la Liste, le profil ou le panneau d'évaluation
- Observation, l. 2902 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Fonctions sans déclencheur dans index.html pour ce périmètre (lu dans le code) : […] `confirmerSuppressionEvaluationSidebar` (:2379)
- Catégorie : 2 · prévu mais pas fait

**5.46** · Geste : Ouvrir le journal de bord d'une copie
- Intention, l. 2087 :
  > un panneau opaque, comme les autres fenêtres, en mode clair comme sombre ; ses détails (durée, note, niveau) se lisent
- Observation : aucune mention (termes cherchés : « opaque », « mode sombre », « durée », « journal-modal-overlay »)
- Catégorie : 2 · prévu mais pas fait

**5.47** · Geste : Ouvrir la corbeille et supprimer définitivement une copie
- Intention, l. 2091 :
  > les annotations partent avec le fichier
- Observation : aucune mention (termes cherchés : « annotationsTravaux », « annotations », « supprimerFichierDefinitivement »)
- Catégorie : 2 · prévu mais pas fait

**5.48** · Geste : Ouvrir la corbeille et supprimer définitivement une copie
- Intention, l. 2094 :
  > en mode anonymisation, si les évaluations liées n'ont pas pu être retirées, l'écran le dit
- Observation : aucune mention (termes cherchés : « anonymisation », « évaluations liées », « pas pu être retirées »)
- Catégorie : 2 · prévu mais pas fait

**5.49** · Geste : Ouvrir la corbeille et supprimer définitivement une copie
- Intention, l. 2095 :
  > quand d'autres fichiers du même couple restent (une reprise encore active), la question le dit : ils restent, mais sans évaluation
- Observation : aucune mention (termes cherchés : « même couple », « reprise », « sans évaluation »)
- Catégorie : 2 · prévu mais pas fait

**5.50** · Geste : Vider la corbeille
- Intention, l. 2099 :
  > la destruction porte exactement sur l'ensemble affiché à l'ouverture de la fenêtre, pas sur les autres groupes-cours ; les évaluations des couples concernés partent avec leurs fichiers
- Observation, l. 2896 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > « Vider la corbeille » `[data-action=viderTouteCorbeille]` (js/liste-evaluations.js:2202) : non exécuté (dialogue codex puis modale « Tout supprimer », lu dans le code).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.51** · Geste : Vider la corbeille
- Intention, l. 2100 :
  > la fenêtre dit combien de fichiers et combien d'évaluations partent (« N évaluation(s) liée(s) à ces fichiers partira/partiront avec eux. »), puis le message compte ce qui est réellement parti (zéro sur refus d'écriture)
- Observation, l. 2896 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > « Vider la corbeille » `[data-action=viderTouteCorbeille]` (js/liste-evaluations.js:2202) : non exécuté (dialogue codex puis modale « Tout supprimer », lu dans le code).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.52** · Geste : Vider la corbeille
- Intention, l. 2101 :
  > le codex emporte et rend aussi la corbeille
- Observation : aucune mention (termes cherchés : « corbeille », « corbeilleFichiers », « codex-manifeste », « donnees.json »)
- Catégorie : 2 · prévu mais pas fait

**5.53** · Sans geste
- Intention, l. 2105 :
  > Les copies d'un élève supprimé ne paraissent pas, et le compte « N résultat(s) » baisse d'autant ; rien n'est effacé
- Observation : aucune mention (termes cherchés : « élève supprimé », « désinscrit », « elevesDesinscrits », « résultat(s) »)
- Catégorie : 2 · prévu mais pas fait

**5.54** · Sans geste
- Intention, l. 2106 :
  > Un fichier dont le DA n'existe pas dans le groupe a sa ligne « Non associée » au lieu de disparaître
- Observation, l. 1384 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Réassigner »/« Assigner » et bouton « Non associé › ») :
  > bouton « Non associé › »
- Catégorie : 3 · fait autrement

**5.55** · Sans geste
- Intention, l. 2107 :
  > Si deux copies existent pour un même élève et une même production, le bandeau « fichiers multiples » les montre
- Observation, l. 2898 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > « Voir les fichiers multiples », bandeau doublons « Examiner » : ouvrent les écrans Annoter/Importer (périmètre d'un autre agent).
- Observation, l. 2920 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > Modale « Plusieurs fichiers par étudiant » (`travauxDoublonsUI.ouvrirModale`, js/travaux-doublons-ui.js ; `onDecision`, `validerCas`) : ouverte depuis la liste des évaluations (js/liste-evaluations.js:1226-1227), hors des sous-écrans de ce module ; non exécutée.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.56** · Sans geste
- Intention, l. 2108 :
  > à la purge des 30 jours, ses annotations partent avec lui
- Observation : aucune mention (termes cherchés : « purge », « annotations », « supprimés automatiquement »)
- Catégorie : 2 · prévu mais pas fait

**5.57** · Sans geste
- Intention, l. 2109 :
  > Un nom, un DA ou un titre piégé s'affiche dans la liste comme du texte, sans jamais agir sur la page
- Observation : aucune mention (termes cherchés : « piégé », « échappement », « echapperHtml », « comme du texte »)
- Catégorie : 2 · prévu mais pas fait

### Écran 45 · Évaluation › Préparer et importer

**5.58** · Geste : Déposer des copies et lancer l'import
- Intention, l. 2115 :
  > la file d'attente est retenue fichier par fichier, avec la production de chaque fichier, le mode d'import, la date et les réglages
- Observation, l. 1618 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > `modeImport` en mémoire ; aucun changement de stockage
- Observation, l. 1619 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > `dateFichier` en mémoire = date locale (saisie 2026-10-05 → `Mon Oct 05 2026 00:00:00`) ; aucun changement de stockage
- Observation, l. 1620 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > **Sélecteur « Modifier » (`travauxUI.changerProductionPipeline`, js/travaux-ui.js:4935)** : aucun changement de stockage immédiat observé
- Catégorie : 3 · fait autrement

**5.59** · Geste : Déposer des copies et lancer l'import
- Intention, l. 2117 :
  > le fichier reste visible dans la liste après (« Non associée »)
- Observation, l. 1384 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Réassigner »/« Assigner » et bouton « Non associé › ») :
  > bouton « Non associé › »
- Catégorie : 3 · fait autrement

**5.60** · Geste : Déposer des copies et lancer l'import
- Intention, l. 2119 :
  > un import qui ne peut pas aboutir le dit et dit quoi faire
- Observation, l. 1564 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > Le ZIP et le .txt sont refusés : console « [Travaux-Import] Type refuse: archive-fictive-zorglub.zip (application/zip) » et « … notes-fictives.txt (text/plain) » ; aucun message à l'écran
- Catégorie : 3 · fait autrement

**5.61** · Geste : Déposer des copies et lancer l'import
- Intention, l. 2120 :
  > le bouton « Renommer pour distinguer » n'est plus offert à la confirmation
- Observation, l. 1587 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > « Doublon(s) détecté(s) » avec champ « Renommer pour distinguer » + « Appliquer »
- Observation, l. 1633 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > Bandeau de la modale de confirmation (observé à l'exécution) : « Doublon détecté : […] / Renommer pour distinguer : [champ] [Appliquer] »
- Catégorie : 3 · fait autrement

**5.62** · Geste : Déposer des copies et lancer l'import
- Intention, l. 2121 :
  > sans accent ; un nom ambigu ne donne aucune association, jamais un élève au hasard
- Observation : aucune mention (termes cherchés : « accent », « ambigu », « homonyme », « appariement »)
- Catégorie : 2 · prévu mais pas fait

**5.63** · Geste : Déposer des copies et lancer l'import
- Intention, l. 2122 :
  > sur l'iPad, une copie importée juste après un retour dans l'application ne se perd pas
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**5.64** · Geste : Laisser l'import assembler les pages d'une remise
- Intention, l. 2126 :
  > rangé par date
- Observation : aucune mention (termes cherchés : « rangé par date », « date », « tri »)
- Catégorie : 2 · prévu mais pas fait

**5.65** · Geste : Laisser l'import assembler les pages d'une remise
- Intention, l. 2127 :
  > plusieurs PDF remis par un même élève pour une même production s'assemblent aussi en un seul PDF ; leurs pages y deviennent des images
- Observation : aucune mention (termes cherchés : « plusieurs PDF », « regroupement », « groupeDocumentId », « 2 pages → 1 PDF »)
- Catégorie : 2 · prévu mais pas fait

**5.66** · Geste : Laisser l'import assembler les pages d'une remise
- Intention, l. 2128 :
  > une lettre finale (« Artefact_1a », « 1b ») crée une autre production
- Observation : aucune mention (termes cherchés : « lettre finale », « 1a », « autre production »)
- Catégorie : 2 · prévu mais pas fait

**5.67** · Geste : Laisser l'import assembler les pages d'une remise
- Intention, l. 2129 :
  > deux photos homonymes venues de deux appareils (deux élèves) ne sont jamais soudées : chaque élève reçoit SA copie
- Observation : aucune mention (termes cherchés : « homonyme », « même nom », « deux appareils »)
- Catégorie : 2 · prévu mais pas fait

**5.68** · Geste : Résoudre un doublon à l'import (remplacer, ou appliquer un jeton de reprise)
- Intention, l. 2134 :
  > sinon l'original est conservé et l'échec est dit
- Observation : aucune mention (termes cherchés : « échec », « Remplacer l'existant », « original est conservé »)
- Catégorie : 2 · prévu mais pas fait

**5.69** · Geste : Résoudre un doublon à l'import (remplacer, ou appliquer un jeton de reprise)
- Intention, l. 2136 :
  > et jamais pour un fichier sans élève
- Observation : aucune mention (termes cherchés : « Appliquer comme jeton de reprise », « sans élève », « sans DA »)
- Catégorie : 2 · prévu mais pas fait

**5.70** · Geste : Résoudre un doublon à l'import (remplacer, ou appliquer un jeton de reprise)
- Intention, l. 2137 :
  > si le jeton ne peut pas être appliqué, une erreur explicite dit que le fichier est importé comme reprise et qu'aucun jeton n'est consommé
- Observation : aucune mention (termes cherchés : « jeton », « aucun jeton », « importé comme reprise »)
- Catégorie : 2 · prévu mais pas fait

**5.71** · Geste : Résoudre un doublon à l'import (remplacer, ou appliquer un jeton de reprise)
- Intention, l. 2138 :
  > « Remplacer l'existante »
- Observation, l. 1635 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > « Remplacer l'existant »
- Catégorie : 3 · fait autrement

**5.72** · Geste : Résoudre un doublon à l'import (remplacer, ou appliquer un jeton de reprise)
- Intention, l. 2138 :
  > codex proposé après le choix « Remplacer l'existante », avant le remplacement, s'il n'est pas à jour
- Observation : aucune mention (termes cherchés : « codex », « Écrire un codex avant de supprimer », « Remplacer l'existant »)
- Catégorie : 2 · prévu mais pas fait

**5.73** · Geste : Reprendre un import interrompu (« Re-déposer les fichiers »)
- Intention, l. 2142 :
  > la file ne propose à re-déposer que ce qui n'est pas entré ; un fichier re-déposé revient à SA propre entrée (nom et taille d'origine comparés) ; aucun doublon silencieux
- Observation, l. 2921 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Re-déposer les fichiers » (`redeposerFichiers`, js/travaux-ui.js:1868), […] : non exécutés (budget).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.74** · Geste : Reprendre un import interrompu (« Re-déposer les fichiers »)
- Intention, l. 2143 :
  > les corrections faites dans la préparation (perspective, rognage) sont réappliquées avant l'import ; « Importer » attend la fin du rejeu
- Observation, l. 2921 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Re-déposer les fichiers » (`redeposerFichiers`, js/travaux-ui.js:1868), […] : non exécutés (budget).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.75** · Geste : Reprendre un import interrompu (« Re-déposer les fichiers »)
- Intention, l. 2144 :
  > les fichiers non reconnus au re-dépôt sont nommés à l'écran, pas écartés en silence ; un échec du rejeu est nommé à l'écran
- Observation, l. 2921 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Re-déposer les fichiers » (`redeposerFichiers`, js/travaux-ui.js:1868), […] : non exécutés (budget).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.76** · Geste : Régler une copie dans le poste de préparation (résolution, balance, « + Ajouter des pages »)
- Intention, l. 2149 :
  > « + Ajouter des pages » suivi de « Confirmer » ajoute les pages, même sans réglage appliqué
- Observation, l. 2911 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > Éditeur de pages : « + Ajouter des pages » (`ajouterPagesEditeur`), […] : non exécutés (budget).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.77** · Geste : Régler une copie dans le poste de préparation (résolution, balance, « + Ajouter des pages »)
- Intention, l. 2151 :
  > le sélecteur global « Production » n'écrase pas une correction faite sur un fichier précis par « Modifier », et l'écran explique la différence
- Observation : aucune mention (termes cherchés : « n'écrase pas », « Modifier », « pipeline-select-production », « changerProductionPipeline »)
- Catégorie : 2 · prévu mais pas fait

**5.78** · Geste : Modifier les pages d'une copie (éditeur de pages)
- Intention, l. 2155 :
  > rien ne change avant « Enregistrer »
- Observation, l. 1693 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > `a2026_annotationsTravaux` reçoit une entrée vide pour le fichier
- Catégorie : 3 · fait autrement

**5.79** · Geste : Modifier les pages d'une copie (éditeur de pages)
- Intention, l. 2155 :
  > une page retirée emporte ses annotations
- Observation : aucune mention (termes cherchés : « annotations », « supprimerPageEditeur », « page retirée »)
- Catégorie : 2 · prévu mais pas fait

**5.80** · Geste : Modifier les pages d'une copie (éditeur de pages)
- Intention, l. 2157 :
  > une copie aux archives refuse l'édition : « Cette copie est aux archives : fais-la revenir avant de modifier ses pages. » ; une copie « manquante » garde son message d'erreur d'avant
- Observation : aucune mention (termes cherchés : « aux archives », « fais-la revenir », « manquante »)
- Catégorie : 2 · prévu mais pas fait

**5.81** · Geste : Fusionner des copies (« Fusionner (N) » ou depuis l'éditeur)
- Intention, l. 2161 :
  > une copie dont le fichier n'est pas chargé n'est jamais retirée par une fusion
- Observation : aucune mention (termes cherchés : « fichier n'est pas chargé », « fusion », « introuvable »)
- Catégorie : 2 · prévu mais pas fait

**5.82** · Geste : Fusionner des copies (« Fusionner (N) » ou depuis l'éditeur)
- Intention, l. 2163 :
  > refus dès qu'une copie n'a pas son fichier : « Le fichier de cette copie est introuvable : elle ne peut pas être fusionnée. »
- Observation : aucune mention (termes cherchés : « introuvable », « ne peut pas être fusionnée », « fusionnerFichiers »)
- Catégorie : 2 · prévu mais pas fait

**5.83** · Geste : Fusionner des copies (« Fusionner (N) » ou depuis l'éditeur)
- Intention, l. 2163 :
  > aux archives : « fais-la revenir avant de modifier ses pages »
- Observation : aucune mention (termes cherchés : « aux archives », « fais-la revenir »)
- Catégorie : 2 · prévu mais pas fait

**5.84** · Geste : Choisir le rangement des copies sur disque
- Intention, l. 2167 :
  > Données : non documenté.
- Observation, l. 2917 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > le choix d'un dossier par le sélecteur natif `showDirectoryPicker` n'est pas observable dans ce cadre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.85** · Geste : Choisir le rangement des copies sur disque
- Intention, l. 2168 :
  > et quels navigateurs le permettent
- Observation, l. 1558 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > « L'accès au dossier sera redemandé à chaque démarrage. Pour le mémoriser : Réglages > Préférences > Sécurité. »
- Catégorie : 2 · prévu mais pas fait

**5.86** · Geste : Lire l'aide « Préparer et importer les travaux »
- Intention, l. 2173 :
  > sous « 1. Déposer les fichiers », le paragraphe validé : « Une remise en plusieurs fichiers : pour que les pages s'assemblent en un seul document, numérote-les à la fin du nom (…). Une lettre (…) crée une AUTRE production (…) »
- Observation : aucune mention (termes cherchés : « Déposer les fichiers », « numérote », « Une remise en plusieurs fichiers », « AUTRE production »)
- Catégorie : 2 · prévu mais pas fait

**5.87** · Sans geste
- Intention, l. 2178 :
  > Une vignette sans image dit pourquoi : un triangle quand la photo n'a pas pu être lue
- Observation, l. 1571 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > Le faux PDF : console « InvalidPDFException », icône 📄 au lieu d'une miniature
- Catégorie : 3 · fait autrement

**5.88** · Sans geste
- Intention, l. 2178 :
  > un cercle barré quand il n'y a rien à lire, des points pendant le calcul
- Observation : aucune mention (termes cherchés : « triangle », « cercle barré », « points », « vignette »)
- Catégorie : 2 · prévu mais pas fait

### Écran 46 · Évaluation › Annoter et évaluer

**5.89** · Geste : Ouvrir une copie dans la visionneuse
- Intention, l. 2186 :
  > Données : ouvrir une copie, ou une évaluation, n'écrit rien
- Observation, l. 1466 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Action « Consulter ») :
  > **Écrit** : `jetonsEtudiants` absent → `{"1111111":{}}` (localStorage + IDB) (observé à l'exécution).
- Observation, l. 1543 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Action « Modifier l'évaluation » sur une originale remplacée) :
  > à l'ouverture, `verrouillee` true → false sur l'originale
- Observation, l. 1659 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > **Écrit** (observé à l'exécution) : `raccourcisAnnotation` (localStorage + IDB, non préfixée) : absent →
- Catégorie : 3 · fait autrement

**5.90** · Geste : Ouvrir une copie dans la visionneuse
- Intention, l. 2186 :
  > Données : ouvrir une copie, ou une évaluation, n'écrit rien
- Observation, l. 1542 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Action « Modifier l'évaluation » sur une originale remplacée) :
  > Action « Modifier l'évaluation » sur une originale remplacée
- Observation, l. 1543 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Action « Modifier l'évaluation » sur une originale remplacée) :
  > à l'ouverture, `verrouillee` true → false sur l'originale ; après Synthèse E → D et « Verrouiller l'évaluation » : originale `verrouillee:true`, `noteFinale:80.25`, `niveauFinal:"M"` (reste `remplaceeParId`)
- Catégorie : 3 · fait autrement

**5.91** · Geste : Ouvrir une copie dans la visionneuse
- Intention, l. 2187 :
  > une copie déjà évaluée garde la grille, l'échelle et la cartouche enregistrées avec elle, même quand la production en prévoit une autre
- Observation : aucune mention (termes cherchés : « fait foi », « production en prévoit une autre », « grille de la production », « derniers choix »)
- Catégorie : 2 · prévu mais pas fait

**5.92** · Geste : Ouvrir une copie dans la visionneuse
- Intention, l. 2188 :
  > une copie sans fichier (aux archives, « manquante » ou introuvable) s'ouvre à sa place et le dit
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.93** · Geste : Ouvrir une copie dans la visionneuse
- Intention, l. 2188 :
  > la copie précédente ne reste jamais à l'écran et « Évaluer » ne s'enchaîne jamais sur une autre copie
- Observation : aucune mention (termes cherchés : « copie précédente », « manquante », « copie sans fichier », « s'enchaîne »)
- Catégorie : 2 · prévu mais pas fait

**5.94** · Geste : Ouvrir une copie dans la visionneuse
- Intention, l. 2189 :
  > une copie aux archives dit « Cette copie est aux archives.
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.95** · Geste : Ouvrir une copie dans la visionneuse
- Intention, l. 2190 :
  > une copie introuvable dit « Le fichier de cette copie est introuvable. »
- Observation : aucune mention (termes cherchés : « Le fichier de cette copie est introuvable », « copie introuvable », « fichier introuvable »)
- Catégorie : 2 · prévu mais pas fait

**5.96** · Geste : Ouvrir une copie dans la visionneuse
- Intention, l. 2191 :
  > après plusieurs heures dans le même onglet, les copies PDF s'ouvrent encore
- Observation : aucune mention (termes cherchés : « plusieurs heures », « même onglet », « longue session »)
- Catégorie : 2 · prévu mais pas fait

**5.97** · Geste : Passer d'un élève à l'autre (carrousel)
- Intention, l. 2199 :
  > une copie jetée depuis « Exporter et archiver » quitte le carrousel
- Observation : aucune mention (termes cherchés : « carrousel », « quitte le carrousel », « copie jetée »)
- Catégorie : 2 · prévu mais pas fait

**5.98** · Geste : Passer d'un élève à l'autre (carrousel)
- Intention, l. 2201 :
  > « Aucune copie à afficher : celles de ce groupe appartiennent à des étudiant·es supprimé·es. »
- Observation : aucune mention (termes cherchés : « Aucune copie à afficher », « étudiant·es supprimé·es », « élèves supprimés », « désinscrit »)
- Catégorie : 2 · prévu mais pas fait

**5.99** · Geste : Annoter la copie (trait, texte, flèche, ligne)
- Intention, l. 2205 :
  > Données : non documenté.
- Observation, l. 1668 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > 2 s après le dernier geste (`SAUVEGARDE_DELAI = 2000`, js/travaux-annotation.js:9, 2761), le programme écrit `a2026_annotationsTravaux` (localStorage + IDB) : absent →
- Catégorie : 1 · fait sans être prévu

**5.100** · Geste : Annoter la copie (trait, texte, flèche, ligne)
- Intention, l. 2206 :
  > avec l'outil Texte, cliquer sur un texte existant le modifie
- Observation : aucune mention (termes cherchés : « texte existant », « modifier un texte », « éditer le texte »)
- Catégorie : 2 · prévu mais pas fait

**5.101** · Geste : Annoter la copie (trait, texte, flèche, ligne)
- Intention, l. 2206 :
  > un clic dans le vide crée un nouveau bloc
- Observation, l. 1671 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > Après validation par Entrée, le prochain `pointerdown` ailleurs (ici, clic dans la palette des tampons) ajoute une seconde fois le même texte : la page contient alors 2 × « Remarque fictive Zorglub »
- Catégorie : 3 · fait autrement

**5.102** · Geste : Annoter la copie (trait, texte, flèche, ligne)
- Intention, l. 2207 :
  > une ligne ou une flèche qu'on vient de tracer montre aussitôt ses poignées : tirer son milieu la courbe, une extrémité la déplace
- Observation : aucune mention (termes cherchés : « poignées de la ligne », « courber », « tirer son milieu », « déplacer une extrémité »)
- Catégorie : 2 · prévu mais pas fait

**5.103** · Geste : Annoter la copie (trait, texte, flèche, ligne)
- Intention, l. 2208 :
  > une fois zoomé, on défile jusqu'au bord gauche du travail
- Observation : aucune mention (termes cherchés : « bord gauche », « défiler une fois zoomé »)
- Catégorie : 2 · prévu mais pas fait

**5.104** · Geste : Annoter la copie (trait, texte, flèche, ligne)
- Intention, l. 2208 :
  > la roue de la palette ne devient pas « − » quand on la replie
- Observation, l. 2913 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > repli des palettes (`togglePaletteReplie`, `togglePaletteErrFrReplie`), […] : non exécutés (budget).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.105** · Geste : Annoter la copie (trait, texte, flèche, ligne)
- Intention, l. 2209 :
  > les palettes (Codes, Annotation, Tampons, Évaluer) se redimensionnent au doigt, au Pencil ou à la souris, et leur taille est retrouvée à l'ouverture suivante
- Observation : aucune mention (termes cherchés : « redimensionn », « Pencil », « iPad », « taille de la palette »)
- Catégorie : 2 · prévu mais pas fait

**5.106** · Geste : Poser un tampon
- Intention, l. 2214 :
  > Données : les tampons posés entrent dans la rétroaction de l'évaluation
- Observation : aucune mention (termes cherchés : « tampons posés », « stickers dans l'évaluation », « tampon dans la rétroaction »)
- Catégorie : 2 · prévu mais pas fait

**5.107** · Geste : Poser un tampon
- Intention, l. 2215 :
  > la rétroaction générale porte un bloc « Observations » qui liste les tampons posés
- Observation : aucune mention (termes cherchés : « bloc « Observations » », « liste les tampons », « tampons posés »)
- Catégorie : 2 · prévu mais pas fait

**5.108** · Geste : Poser un tampon
- Intention, l. 2216 :
  > la catégorie « Compréhension » (tampons SOLO) suit la préférence « Taxonomie SOLO » des Outils d'observation, comme la catégorie « Action » suit l'observation des actions
- Observation : aucune mention (termes cherchés : « catégorie « Action » », « suit la préférence », « palette des tampons selon SOLO »)
- Catégorie : 2 · prévu mais pas fait

**5.109** · Geste : Poser un tampon
- Intention, l. 2218 :
  > un nom de tampon reçu d'un collègue s'affiche toujours comme du texte
- Observation : aucune mention (termes cherchés : « nom de tampon », « comme du texte », « tampon reçu »)
- Catégorie : 2 · prévu mais pas fait

**5.110** · Geste : Poser un tampon
- Intention, l. 2219 :
  > les reprises ciblées déjà faites restent lisibles
- Observation, l. 2899 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > jeton de reprise ciblée et jetons personnalisés, plafond de note ciblée (js/evaluation-calcul.js:886-891) : non exécutés
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.111** · Geste : Poser un code d'annotation
- Intention, l. 2223 :
  > retirer tous les codes posés remet le nombre d'erreurs à 0
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.112** · Geste : Poser un code d'annotation
- Intention, l. 2224 :
  > la palette Codes montre ses sous-critères (numéro, nom, couleur, rétroaction) pour toute copie évaluée avec cette grille
- Observation : aucune mention (termes cherchés : « palette Codes avec sous-critères », « codes de la grille », « sous-critères dans la palette »)
- Catégorie : 2 · prévu mais pas fait

**5.113** · Geste : Poser un code d'annotation
- Intention, l. 2225 :
  > l'engrenage de la palette dit d'où viennent les codes et où les modifier
- Observation : aucune mention (termes cherchés : « d'où viennent les codes », « copie gouvernée par sa grille », « où les modifier »)
- Catégorie : 2 · prévu mais pas fait

**5.114** · Geste : Poser un code d'annotation
- Intention, l. 2226 :
  > dans la palette des codes, un libellé long revient à la ligne
- Observation : aucune mention (termes cherchés : « revient à la ligne », « retour à la ligne », « libellé long »)
- Catégorie : 2 · prévu mais pas fait

**5.115** · Geste : Chronométrer l'évaluation
- Intention, l. 2237 :
  > son infobulle dit qu'il « s'arrête au verrouillage »
- Observation : aucune mention (termes cherchés : « s'arrête au verrouillage », « infobulle du chronomètre »)
- Catégorie : 2 · prévu mais pas fait

**5.116** · Geste : Chronométrer l'évaluation
- Intention, l. 2238 :
  > sur une copie à annoter, le chronomètre démarre à la première annotation
- Observation, l. 1689 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > Chronomètre `#travaux-chrono-toolbar` : démarre au premier geste d'annotation
- Observation, l. 2668 (Chargement global, couche de stockage, minuteries et écouteurs transversaux › Minuteries récurrentes) :
  > `demarrerChrono`/`reprendreChrono` si préférence `chronoEvaluation`
- Observation, l. 2194 (Labo › Outils d'observation) :
  > "chronoEvaluation":false
- Catégorie : 3 · fait autrement

**5.117** · Geste : Chronométrer l'évaluation
- Intention, l. 2238 :
  > sans copie, donc sans annotation, l'enseignant le lance lui-même
- Observation : aucune mention (termes cherchés : « lancer le chronomètre », « démarrer le chronomètre », « chronomètre sans copie »)
- Catégorie : 2 · prévu mais pas fait

**5.118** · Geste : Passer en mode côte à côte
- Intention, l. 2242 :
  > Données : non documenté.
- Observation, l. 2921 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > `fermerVueCoteACote`, […] : non exécutés (budget).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.119** · Geste : Passer en mode côte à côte
- Intention, l. 2243 :
  > deux copies s'affichent côte à côte, par exemple l'originale et sa reprise
- Observation, l. 2921 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > `fermerVueCoteACote`, […] : non exécutés (budget).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.120** · Geste : Transférer une copie vers un autre groupe-cours (« Transférer »)
- Intention, l. 2247 :
  > la copie et son évaluation passent au groupe-cours choisi
- Observation, l. 1404 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Transférer ») :
  > `alert` « Aucun autre groupe-cours disponible pour le transfert. » (un seul groupe-cours non démo)
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**5.121** · Geste : Transférer une copie vers un autre groupe-cours (« Transférer »)
- Intention, l. 2248 :
  > un message nomme le groupe-cours d'arrivée
- Observation, l. 1404 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Transférer ») :
  > `alert` « Aucun autre groupe-cours disponible pour le transfert. » (un seul groupe-cours non démo)
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**5.122** · Geste : Attribuer les niveaux (holistique, analytique, algorithmique)
- Intention, l. 2253 :
  > critère analytique : un champ « sur 30 » à la place du menu de niveaux
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.123** · Geste : Attribuer les niveaux (holistique, analytique, algorithmique)
- Intention, l. 2255 :
  > aucun critère ne reçoit « -- » comme niveau : sur une échelle aux bornes espacées, il prend le niveau le plus proche
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.124** · Geste : Attribuer les niveaux (holistique, analytique, algorithmique)
- Intention, l. 2256 :
  > critère qui compte des erreurs : zéro erreur sur un texte dont le nombre de mots est saisi donne la note complète
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.125** · Geste : Attribuer les niveaux (holistique, analytique, algorithmique)
- Intention, l. 2257 :
  > effacer les codes ou le nombre de mots d'un critère algorithmique efface son résultat
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.126** · Geste : Attribuer les niveaux (holistique, analytique, algorithmique)
- Intention, l. 2259 :
  > quand la grille d'une ancienne évaluation est introuvable, un critère nommé « Français écrit » garde les mots du français à l'écran et sur le PDF
- Observation : aucune mention (termes cherchés : « Français écrit », « grille introuvable », « ancienne évaluation »)
- Catégorie : 2 · prévu mais pas fait

**5.127** · Geste : Laisser un critère sans niveau (pondération incomplète)
- Intention, l. 2267 :
  > une échelle dont les niveaux n'ont pas de valeur est dite, avec les niveaux muets et où leur donner une valeur
- Observation : aucune mention (termes cherchés : « niveaux muets », « niveaux sans valeur », « donner une valeur »)
- Catégorie : 2 · prévu mais pas fait

**5.128** · Geste : Ouvrir une évaluation dont la grille a changé depuis
- Intention, l. 2274 :
  > chaque évaluation se juge contre SA grille (les critères qu'elle portait) ; rien n'est réécrit
- Observation : aucune mention (termes cherchés : « grille a changé », « grille modifiée après l'évaluation », « critères qu'elle portait »)
- Catégorie : 2 · prévu mais pas fait

**5.129** · Geste : Ouvrir une évaluation dont la grille a changé depuis
- Intention, l. 2275 :
  > « Un critère a été ajouté à la grille après cette évaluation »
- Observation : aucune mention (termes cherchés : « Un critère a été ajouté », « ajouté à la grille », « critère ajouté depuis »)
- Catégorie : 2 · prévu mais pas fait

**5.130** · Geste : Ouvrir une évaluation dont la grille a changé depuis
- Intention, l. 2276 :
  > un encadré orange nomme le critère retiré et le niveau enregistré
- Observation : aucune mention (termes cherchés : « encadré orange », « critère retiré », « a quitté sa grille »)
- Catégorie : 2 · prévu mais pas fait

**5.131** · Geste : Ouvrir une évaluation dont la grille a changé depuis
- Intention, l. 2277 :
  > sur une copie déjà évaluée, choisir une autre cartouche ouvre « Changer de cartouche », qui la nomme
- Observation, l. 1518 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Sélecteurs) :
  > Cartouche « (aucune) » → note inchangée, rétroaction conservée.
- Observation, l. 1519 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Sélecteurs) :
  > reposer la cartouche `CART_GENERIQUE` déclenche une mise à jour de l'objet 3333333/B dans `a2026_evaluationsSauvegardees`.
- Catégorie : 3 · fait autrement

**5.132** · Geste : Saisir le nombre d'erreurs, le nombre de mots, l'intégrité
- Intention, l. 2281 :
  > le nombre d'erreurs, le nombre de mots, le statut d'intégrité et ses notes s'enregistrent tout seuls
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.133** · Geste : Saisir le nombre d'erreurs, le nombre de mots, l'intégrité
- Intention, l. 2282 :
  > à l'élève suivant sans évaluation, le statut repart à « recevable »
- Observation : aucune mention (termes cherchés : « repart à « recevable » », « intégrité à l'élève suivant », « IA ouverte depuis sa copie »)
- Catégorie : 2 · prévu mais pas fait

**5.134** · Geste : Saisir le nombre d'erreurs, le nombre de mots, l'intégrité
- Intention, l. 2284 :
  > les anciens statuts de remise s'affichent « Évaluée » / « Non reçue »
- Observation, l. 2901 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Statut de remise `#remiseProduction1` : champ caché (`u-hide`), non manipulé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.135** · Geste : Saisir le nombre d'erreurs, le nombre de mots, l'intégrité
- Intention, l. 2285 :
  > l'enseignant peut repasser une remise à « Non reçue »
- Observation, l. 2901 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Statut de remise `#remiseProduction1` : champ caché (`u-hide`), non manipulé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.136** · Geste : Rédiger et régénérer la rétroaction
- Intention, l. 2290 :
  > un commentaire de critère enregistré vide reste vide, à l'ouverture comme au verrouillage, et s'imprime vide
- Observation : aucune mention (termes cherchés : « commentaire vide », « reste vide », « s'imprime vide »)
- Catégorie : 2 · prévu mais pas fait

**5.137** · Geste : Rédiger et régénérer la rétroaction
- Intention, l. 2293 :
  > une question une fois par copie au premier geste qui la régénérerait : « Garder la mienne » ou « Remplacer »
- Observation : aucune mention (termes cherchés : « Garder la mienne », « avant D7 », « une fois par copie »)
- Catégorie : 2 · prévu mais pas fait

**5.138** · Geste : Rédiger et régénérer la rétroaction
- Intention, l. 2297 :
  > le bilan copié lit l'historique comme la page de synthèse du PDF
- Observation : aucune mention (termes cherchés : « bilan copié », « historique », « comme la page de synthèse »)
- Catégorie : 2 · prévu mais pas fait

**5.139** · Geste : Rédiger et régénérer la rétroaction
- Intention, l. 2298 :
  > le choix « Niveau de performance » est enregistré dès qu'on le coche
- Observation, l. 1487 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Cases de rétroaction) :
  > aucune écriture dans les 2,2 s suivant ces deux gestes ; à l'écriture suivante (saisie dans la rétroaction), `optionsAffichage` passe de
- Catégorie : 3 · fait autrement

**5.140** · Geste : Rédiger et régénérer la rétroaction
- Intention, l. 2298 :
  > le choix « Niveau de performance » est enregistré dès qu'on le coche, et le PDF le respecte
- Observation, l. 1486 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Cases de rétroaction) :
  > décocher « Activité » retire la ligne « Production : Exemple activité A » (92 → 87 mots)
- Observation, l. 1487 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Cases de rétroaction) :
  > `optionsAffichage` passe de `{description:true,…,affichageNote:"complet"}` à `{description:false,…,affichageNote:"lettre"}`
- Catégorie : 3 · fait autrement

**5.141** · Geste : Appliquer ou retirer un jeton (délai, reprise)
- Intention, l. 2303 :
  > retirer un jeton de reprise supprime la reprise, restaure l'originale et met le fichier de la reprise à la corbeille, restaurable
- Observation, l. 2899 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Retrait du jeton de reprise (décocher « Reprise », `retirerJetonReprise` js/evaluation-jetons.js:437), suppression d'une reprise avec restauration de l'originale […] : non exécutés (copie requise, blobs non conservés entre sessions).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.142** · Geste : Appliquer ou retirer un jeton (délai, reprise)
- Intention, l. 2304 :
  > une reprise accordée ne recompte pas le délai déjà accordé sur l'originale, et une copie déjà remplacée n'en reçoit plus
- Observation : aucune mention (termes cherchés : « recompte », « déjà remplacée », « délai sur la reprise »)
- Catégorie : 2 · prévu mais pas fait

**5.143** · Geste : Appliquer ou retirer un jeton (délai, reprise)
- Intention, l. 2305 :
  > la confirmation du retrait annonce que le fichier de la reprise part à la corbeille ; la ligne de l'originale rouvre le fichier ORIGINAL
- Observation, l. 2899 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Retrait du jeton de reprise (décocher « Reprise », `retirerJetonReprise` js/evaluation-jetons.js:437), suppression d'une reprise avec restauration de l'originale […] : non exécutés (copie requise, blobs non conservés entre sessions).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.144** · Geste : Appliquer ou retirer un jeton (délai, reprise)
- Intention, l. 2306 :
  > un retrait dont l'enregistrement échoue affiche l'échec et rien ne bouge
- Observation, l. 2899 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Retrait du jeton de reprise (décocher « Reprise », `retirerJetonReprise` js/evaluation-jetons.js:437), suppression d'une reprise avec restauration de l'originale […] : non exécutés (copie requise, blobs non conservés entre sessions).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.145** · Geste : Appliquer ou retirer un jeton (délai, reprise)
- Intention, l. 2306 :
  > un jeton qui n'a pas pu être enregistré le dit
- Observation : aucune mention (termes cherchés : « jeton non enregistré », « n'a pas pu être enregistré », « échec du jeton »)
- Catégorie : 2 · prévu mais pas fait

**5.146** · Geste : Appliquer ou retirer un jeton (délai, reprise)
- Intention, l. 2307 :
  > « Choisis d'abord un niveau : l'évaluation n'existe pas encore. »
- Observation : aucune mention (termes cherchés : « Choisis d'abord un niveau », « n'existe pas encore »)
- Catégorie : 2 · prévu mais pas fait

**5.147** · Geste : Appliquer ou retirer un jeton (délai, reprise)
- Intention, l. 2308 :
  > il est proposé avant d'appliquer un jeton de reprise quand la pratique supprime l'originale
- Observation : aucune mention (termes cherchés : « codex avant d'appliquer », « pratique supprime l'originale », « Écrire un codex avant de supprimer ? (jeton) »)
- Catégorie : 2 · prévu mais pas fait

**5.148** · Geste : Appliquer ou retirer un jeton (délai, reprise)
- Intention, l. 2308 :
  > et avant les questions du retrait d'un jeton
- Observation, l. 2899 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Retrait du jeton de reprise (décocher « Reprise », `retirerJetonReprise` js/evaluation-jetons.js:437), suppression d'une reprise avec restauration de l'originale […] : non exécutés (copie requise, blobs non conservés entre sessions).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.149** · Geste : Appliquer ou retirer un jeton (délai, reprise)
- Intention, l. 2309 :
  > la case « Reprise ciblée » est retirée
- Observation, l. 1174 (Conception — Pratiques de notation › Éditeur de pratique › Champs enregistrés par) :
  > « Reprise ciblée » décochée, plafond « M » → `jetons:{actif:true, nombre:3, delaiDuree:4, delaiSurReprise:true, repriseOriginale:"supprimer", cibleeActif:false, cibleePlafond:"M"}`
- Catégorie : 3 · fait autrement

**5.150** · Geste : Appliquer ou retirer un jeton (délai, reprise)
- Intention, l. 2309 :
  > aucun chemin n'applique plus ce jeton
- Observation, l. 2899 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > jeton de reprise ciblée et jetons personnalisés, plafond de note ciblée (js/evaluation-calcul.js:886-891) : non exécutés
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.151** · Geste : Verrouiller l'évaluation (bouton ou cadenas), ou la déverrouiller
- Intention, l. 2316 :
  > le cadenas fait les mêmes vérifications
- Observation : aucune mention (termes cherchés : « cadenas », « 🔒 », « icône de verrou »)
- Catégorie : 2 · prévu mais pas fait

**5.152** · Geste : Verrouiller l'évaluation (bouton ou cadenas), ou la déverrouiller
- Intention, l. 2317 :
  > « Ton travail est enregistré, mais l'évaluation n'est pas verrouillée : complète-la, puis verrouille. »
- Observation, l. 1460 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Bouton « Verrouiller l'évaluation ») :
  > portée incomplète → notification « Évaluation incomplète » et enregistrement non verrouillé
- Catégorie : 3 · fait autrement

**5.153** · Geste : Verrouiller l'évaluation (bouton ou cadenas), ou la déverrouiller
- Intention, l. 2318 :
  > refus d'échelle : « …Choisis une échelle de performance, puis verrouille. »
- Observation, l. 1460 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Bouton « Verrouiller l'évaluation ») :
  > échelle introuvable → « Échelle introuvable » (non exécuté).
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**5.154** · Geste : Verrouiller l'évaluation (bouton ou cadenas), ou la déverrouiller
- Intention, l. 2319 :
  > messages « Évaluation verrouillée : ‹élève› – ‹production› » et « Évaluation déverrouillée : ‹élève› – ‹production› », un seul par geste
- Observation, l. 1461 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Bouton « Verrouiller l'évaluation ») :
  > **Déverrouillage juste après le verrouillage, dans la même session « Évaluer »** (observé à l'exécution) : aucun changement de stockage ; notifications « Évaluation verrouillée » / « Impossible de modifier une évaluation verrouillée » ; le bouton reste « Déverrouiller l'évaluation ».
- Catégorie : 3 · fait autrement

**5.155** · Geste : Verrouiller l'évaluation (bouton ou cadenas), ou la déverrouiller
- Intention, l. 2320 :
  > infobulles du cadenas « Verrouillée – clique pour déverrouiller » / « Non verrouillée – clique pour verrouiller »
- Observation : aucune mention (termes cherchés : « clique pour déverrouiller », « clique pour verrouiller », « cadenas »)
- Catégorie : 2 · prévu mais pas fait

**5.156** · Geste : Verrouiller l'évaluation (bouton ou cadenas), ou la déverrouiller
- Intention, l. 2320 :
  > profil et bilan : « évaluation non verrouillée, non comptée »
- Observation : aucune mention (termes cherchés : « non comptée », « évaluation non verrouillée, non comptée »)
- Catégorie : 2 · prévu mais pas fait

**5.157** · Geste : Verrouiller l'évaluation (bouton ou cadenas), ou la déverrouiller
- Intention, l. 2323 :
  > « Ton évaluation s'enregistre toute seule pendant que tu évalues ; le témoin « Enregistré » le dit.
- Observation : aucune mention (termes cherchés : « Ton évaluation s'enregistre toute seule », « aide « Annoter et évaluer » », « s'enregistre toute seule »)
- Catégorie : 2 · prévu mais pas fait

**5.158** · Geste : Évaluer avec une grille entièrement en points (parcours sommatif)
- Intention, l. 2327 :
  > l'évaluation se calcule et s'enregistre sans échelle de performance
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.159** · Geste : Évaluer avec une grille entièrement en points (parcours sommatif)
- Intention, l. 2328 :
  > rien n'est réécrit dans les copies déjà enregistrées ; c'est une règle d'affichage
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.160** · Geste : Évaluer avec une grille entièrement en points (parcours sommatif)
- Intention, l. 2329 :
  > l'élève ne lit que ce qui a été mesuré
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.161** · Geste : Évaluer avec une grille entièrement en points (parcours sommatif)
- Intention, l. 2330 :
  > la page de synthèse écrit « Note de la copie : 74 % » en tête du bloc « Niveau général »
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.162** · Geste : Évaluer avec une grille entièrement en points (parcours sommatif)
- Intention, l. 2331 :
  > bilan d'une copie entièrement en points
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.163** · Geste : Évaluer avec une grille entièrement en points (parcours sommatif)
- Intention, l. 2332 :
  > une échelle qui a ses repères garde ses repères (grilles mixtes, échelles) ; les 60 % ne s'appliquent jamais aux niveaux
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.164** · Geste : Évaluer sans copie (formulaire sans copie)
- Intention, l. 2336 :
  > pour une non-remise, on le repasse à « Non reçue »
- Observation, l. 2901 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Statut de remise `#remiseProduction1` : champ caché (`u-hide`), non manipulé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.165** · Geste : Évaluer sans copie (formulaire sans copie)
- Intention, l. 2338 :
  > grille, échelle, cartouche, intégrité, jetons, critères
- Observation, l. 1442 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Action « Évaluer ») :
  > Bloc jetons `#optionsJetons` reste caché (classe `u-hide`, contenu vide) dans ce mode sans copie.
- Observation, l. 1532 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Jetons) :
  > bloc caché en évaluation sans copie
- Catégorie : 2 · prévu mais pas fait

**5.166** · Geste : Évaluer sans copie (formulaire sans copie)
- Intention, l. 2338 :
  > « Copier tout », « Copier », le cadenas
- Observation : aucune mention (termes cherchés : « cadenas », « 🔒 », « icône de verrou »)
- Catégorie : 2 · prévu mais pas fait

**5.167** · Geste : Corriger l'élève ou la production d'une copie depuis le panneau d'évaluation
- Intention, l. 2344 :
  > passe par la même porte que la réassignation ; sur « Annuler », rien n'est écrit
- Observation : aucune mention (termes cherchés : « panneau d'évaluation », « corriger l'élève », « correction d'identité »)
- Catégorie : 2 · prévu mais pas fait

**5.168** · Geste : Corriger l'élève ou la production d'une copie depuis le panneau d'évaluation
- Intention, l. 2345 :
  > la question nomme les deux fichiers et, si l'élève change, l'élève
- Observation : aucune mention (termes cherchés : « Le remplacer par », « nomme les deux fichiers », « correction d'identité »)
- Catégorie : 2 · prévu mais pas fait

**5.169** · Geste : Supprimer une copie importée
- Intention, l. 2349 :
  > Données : non documenté.
- Observation, l. 1391 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Supprimer » (copie)) :
  > `a2026_corbeilleFichiers` absente → `[{id:"FT_…e4d0a7e41037"
- Observation, l. 1417 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Corbeille : « Supprimer ») :
  > entrée retirée de `a2026_corbeilleFichiers` ; `thumbnail_FT_…e4d0a7e41037` supprimée (localStorage + IDB) ; enregistrement `FT_…e4d0a7e41037` supprimé du magasin IDB `fichiers`.
- Catégorie : 1 · fait sans être prévu

**5.170** · Sans geste
- Intention, l. 2354 :
  > le témoin le dit
- Observation : aucune mention (termes cherchés : « témoin », « Enregistré », « temoinEnregistrement »)
- Catégorie : 2 · prévu mais pas fait

**5.171** · Sans geste
- Intention, l. 2354 :
  > fermer la copie ou recharger la page vide l'écriture en attente avant de partir
- Observation : aucune mention (termes cherchés : « fermer la copie », « recharger la page », « écriture en attente au rechargement »)
- Catégorie : 2 · prévu mais pas fait

**5.172** · Sans geste
- Intention, l. 2357 :
  > Une évaluation dont un critère a quitté sa grille s'ouvre quand même, sans « Erreur de chargement »
- Observation : aucune mention (termes cherchés : « Erreur de chargement », « critère a quitté sa grille »)
- Catégorie : 2 · prévu mais pas fait

### Écran 47 · Évaluation › Exporter et archiver

**5.173** · Geste : Exporter des travaux (« Télécharger »)
- Intention, l. 2365 :
  > un ZIP des productions en PDF
- Observation, l. 1709 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter) :
  > `Fictif-Charlie_Essai_3333333/Fictif-Essai Zorglub/Fictif-Charlie_3333333.png` et `…_annote.png` (octets JPEG 1077×1400 sous extension `.png`
- Catégorie : 3 · fait autrement

**5.174** · Geste : Exporter des travaux (« Télécharger »)
- Intention, l. 2365 :
  > et des évaluations en JSON
- Observation, l. 1708 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter) :
  > **Lu** : `a2026_fichiersTravaux`, blobs IDB `fichiers`, `a2026_annotationsTravaux`, `a2026_productions`, `a2026_groupeEtudiants`
- Observation, l. 1709 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter) :
  > et `_resume.json` = `{"export":"Trimestre_Fictif_Zorglub"
- Catégorie : 2 · prévu mais pas fait

**5.175** · Geste : Exporter des travaux (« Télécharger »)
- Intention, l. 2366 :
  > une copie illisible ne fait pas perdre l'archive : les autres partent, et un bilan nomme celle qui manque
- Observation : aucune mention (termes cherchés : « copie illisible », « celle qui manque », « nbEchecs non nul »)
- Catégorie : 2 · prévu mais pas fait

**5.176** · Geste : Exporter des travaux (« Télécharger »)
- Intention, l. 2367 :
  > le nom du ZIP et des dossiers garde les accents (« Écrit 1 ») et ne se casse pas sur un nom contenant « / »
- Observation : aucune mention (termes cherchés : « accents », « Écrit 1 », « nom contenant « / » »)
- Catégorie : 2 · prévu mais pas fait

**5.177** · Geste : Exporter des travaux (« Télécharger »)
- Intention, l. 2368 :
  > en mode anonymisation, dossiers « Élève 32 » sans DA
- Observation : aucune mention (termes cherchés : « Élève 32 », « anonymisation (export des travaux) », « sans DA »)
- Catégorie : 2 · prévu mais pas fait

**5.178** · Geste : Exporter des travaux (« Télécharger »)
- Intention, l. 2369 :
  > les copies des élèves supprimés partent dans l'export complet « Toutes / Tous »
- Observation : aucune mention (termes cherchés : « élèves supprimés », « désinscrit », « elevesDesinscrits (export) »)
- Catégorie : 2 · prévu mais pas fait

**5.179** · Geste : Arrêter un export en cours
- Intention, l. 2373 :
  > à l'arrêt, aucune copie n'est marquée « exportée »
- Observation, l. 2918 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Arrêter » l'archivage (`arreterArchivage`) : l'archive de 2 fichiers se termine avant qu'un clic soit possible (non observé).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.180** · Geste : Arrêter un export en cours
- Intention, l. 2374 :
  > pendant un export, « Arrêter l'export » remplace « Télécharger » ; à l'arrêt, rien n'est téléchargé
- Observation, l. 2918 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Arrêter » l'archivage (`arreterArchivage`) : l'archive de 2 fichiers se termine avant qu'un clic soit possible (non observé).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.181** · Geste : Lancer l'export pour Léa
- Intention, l. 2378 :
  > une évaluation par élève parmi les évaluations actives, la reprise d'abord ; les élèves supprimés sont écartés
- Observation : aucune mention (termes cherchés : « la reprise d'abord », « évaluations actives », « élèves supprimés »)
- Catégorie : 2 · prévu mais pas fait

**5.182** · Geste : Lancer l'export pour Léa
- Intention, l. 2381 :
  > un élève en échec n'avorte pas le lot ; un bilan final dit « N réussis, M échoués : … »
- Observation : aucune mention (termes cherchés : « réussis », « échoués », « bilan final », « sans page de synthèse »)
- Catégorie : 2 · prévu mais pas fait

**5.183** · Geste : Lancer l'export pour Léa
- Intention, l. 2382 :
  > en anonymisation, le PDF se nomme « Élève 32_Artefact-2-rév_Evalue.pdf »
- Observation : aucune mention (termes cherchés : « Élève 32 », « anonymisation (export Léa) », « Gr. A »)
- Catégorie : 2 · prévu mais pas fait

**5.184** · Geste : Lancer l'export pour Léa
- Intention, l. 2383 :
  > une note en ,5 s'arrondit vers le haut
- Observation : aucune mention (termes cherchés : « arrondi », « ,5 », « vers le haut »)
- Catégorie : 2 · prévu mais pas fait

**5.185** · Geste : « Proposer un nettoyage » (quand l'espace manque)
- Intention, l. 2387 :
  > ne retire que des copies déjà exportées hors de l'application (depuis le 16 sept.) et non annotées depuis leur export
- Observation, l. 2916 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Proposer un nettoyage » (`proposerNettoyage`, js/travaux-ui.js:3029) : affiché seulement quand `quota.alerteQuota` est vrai (lu dans le code
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.186** · Geste : « Proposer un nettoyage » (quand l'espace manque)
- Intention, l. 2388 :
  > la fenêtre « Libérer de l'espace » liste les copies
- Observation, l. 2916 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Proposer un nettoyage » (`proposerNettoyage`, js/travaux-ui.js:3029) : affiché seulement quand `quota.alerteQuota` est vrai (lu dans le code
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.187** · Geste : « Proposer un nettoyage » (quand l'espace manque)
- Intention, l. 2389 :
  > si aucune copie n'est exportée : « Rien à retirer sans risque »
- Observation, l. 2916 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Proposer un nettoyage » (`proposerNettoyage`, js/travaux-ui.js:3029) : affiché seulement quand `quota.alerteQuota` est vrai (lu dans le code
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.188** · Geste : « Proposer un nettoyage » (quand l'espace manque)
- Intention, l. 2391 :
  > Sortie : codex proposé avant, s'il n'est pas à jour
- Observation, l. 2916 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Proposer un nettoyage » (`proposerNettoyage`, js/travaux-ui.js:3029) : affiché seulement quand `quota.alerteQuota` est vrai (lu dans le code
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.189** · Geste : Jeter une copie depuis la grille des copies
- Intention, l. 2395 :
  > Données : non documenté.
- Observation, l. 1737 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter) :
  > Charlie retiré de `a2026_fichiersTravaux` et ajouté à `a2026_corbeilleFichiers` (localStorage + IDB, absent → tableau d'un objet)
- Catégorie : 1 · fait sans être prévu

**5.190** · Geste : Jeter une copie depuis la grille des copies
- Intention, l. 2396 :
  > la copie quitte aussi le carrousel d'« Annoter et évaluer »
- Observation : aucune mention (termes cherchés : « carrousel », « quitte le carrousel », « copie jetée »)
- Catégorie : 2 · prévu mais pas fait

**5.191** · Geste : Exporter le PDF annoté d'une copie (ou son aperçu)
- Intention, l. 2400 :
  > Données : non documenté.
- Observation, l. 1730 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter) :
  > `a2026_fichiersTravaux` (localStorage + IDB) : Alpha `blobStatut` → `"exporte"`, ajout de `dateExport` (`travauxStockage.marquerExporte`)
- Catégorie : 1 · fait sans être prévu

**5.192** · Geste : Exporter le PDF annoté d'une copie (ou son aperçu)
- Intention, l. 2401 :
  > pour une copie aux archives, le message « Cette copie est aux archives. … »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.193** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2405 :
  > retire de l'application les fichiers des copies (travail et corbeille) et leurs vignettes
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.194** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2406 :
  > l'unité est le trimestre clos entier, pas le groupe
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.195** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2407 :
  > la copie d'un·e étudiant·e supprimé·e reste dans l'application
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.196** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2408 :
  > interrompu, le geste se reprend depuis le même menu ; il s'arrête au premier refus
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.197** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2409 :
  > fenêtre « Archiver les copies de ‹trimestre› ? »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.198** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2410 :
  > bilan « Les copies de ‹trimestre› sont aux archives »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.199** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2411 :
  > « Des copies de ‹trimestre› ont changé depuis son archive »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.200** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2412 :
  > refusé comme « Renvoyer aux archives »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.201** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2413 :
  > titre « Trimestre non archivé »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.202** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2414 :
  > interrompu : « Archivage des copies inachevé »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.203** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2415 :
  > une copie aux archives se dit « aux archives », jamais « manquante »
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.204** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2416 :
  > « Dossier PDF » d'une copie aux archives
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.205** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2417 :
  > les mots ne promettent rien de visible des annotations d'une copie aux archives
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.206** · Geste : Archiver les copies d'un trimestre clos (menu ⋮ du trimestre, « Archiver les copies… »)
- Intention, l. 2418 :
  > au « Faire revenir », les copies reviennent avec leurs vignettes, refaites au besoin
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.207** · Geste : Lire l'aide « Exporter et archiver les travaux »
- Intention, l. 2423 :
  > sous l'intertitre « Deux façons d'exporter »
- Observation : aucune mention (termes cherchés : « Deux façons d'exporter », « Exporter des travaux : les productions en PDF », « aide « Exporter et archiver » »)
- Catégorie : 2 · prévu mais pas fait

**5.208** · Geste : Lire l'aide « Exporter et archiver les travaux »
- Intention, l. 2424 :
  > la fiche « i » s'intitule « Deux modes d'archivage »
- Observation : aucune mention (termes cherchés : « Deux modes d'archivage », « fiche « i » »)
- Catégorie : 2 · prévu mais pas fait

**5.209** · Sans geste
- Intention, l. 2428 :
  > dit quand l'espace est presque plein, en invitant à exporter les anciens travaux avant d'en importer d'autres
- Observation : aucune mention (termes cherchés : « presque plein », « exporter les anciens travaux », « alerte d'espace »)
- Catégorie : 2 · prévu mais pas fait

**5.210** · Sans geste
- Intention, l. 2430 :
  > La grille des copies et son aperçu PDF écartent les copies des élèves supprimés
- Observation : aucune mention (termes cherchés : « élèves supprimés », « désinscrit », « N fichiers en stock (élèves supprimés) »)
- Catégorie : 2 · prévu mais pas fait

**5.211** · Sans geste
- Intention, l. 2431 :
  > il montre un état vide propre quand il n'y a aucun fichier
- Observation : aucune mention (termes cherchés : « état vide », « 0 fichier en stock », « aucun fichier (Exporter et archiver) »)
- Catégorie : 2 · prévu mais pas fait

### Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse)

**5.212** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2440 :
  > un critère analytique dit « 24 / 30 »
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.213** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2441 :
  > le bilan (« Présentement, il faut se concentrer sur » avec, pour chaque critère, « Nom (niveau) : définition »
- Observation : aucune mention (termes cherchés : « Présentement », « Points récurrents », « prioritaire depuis », « à consolider »)
- Catégorie : 2 · prévu mais pas fait

**5.214** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2442 :
  > la colonne « Observations » liste les tampons, une colonne par catégorie utilisée
- Observation : aucune mention (termes cherchés : « colonne « Observations » », « OBSERVATIONS (PDF) », « tampons dans le PDF »)
- Catégorie : 2 · prévu mais pas fait

**5.215** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2444 :
  > « Tous les critères sont maîtrisés depuis plus d'une production.
- Observation : aucune mention (termes cherchés : « Tous les critères sont maîtrisés », « aider tes collègues »)
- Catégorie : 2 · prévu mais pas fait

**5.216** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2445 :
  > avec « Niveau de performance », le bloc « Note provisoire » garde les productions avec leur niveau, sans pourcentage
- Observation : aucune mention (termes cherchés : « Note provisoire (niveau de performance) », « sans pourcentage », « Niveau de performance (PDF) »)
- Catégorie : 2 · prévu mais pas fait

**5.217** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2446 :
  > la ligne « Sélection » dit « 1 retenue sur 4 possibles »
- Observation : aucune mention (termes cherchés : « retenue sur », « possibles », « travail diagnostique (PDF) »)
- Catégorie : 2 · prévu mais pas fait

**5.218** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2452 :
  > en mode anonymisation, ni nom ni DA : « Élève 32 » et le groupe
- Observation : aucune mention (termes cherchés : « Élève 32 », « anonymisation (PDF) », « Gr. A (PDF) »)
- Catégorie : 2 · prévu mais pas fait

**5.219** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2453 :
  > une phrase nomme les critères en attente, « reste à évaluer » disant à qui revient le geste
- Observation : aucune mention (termes cherchés : « reste à évaluer », « critères en attente », « Niveau général absent »)
- Catégorie : 2 · prévu mais pas fait

**5.220** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2454 :
  > « Cette copie n'a pas de note ni de niveau général : ‹critère› (‹pondération›) reste à évaluer. »
- Observation : aucune mention (termes cherchés : « n'a pas de note ni de niveau général », « reste à évaluer »)
- Catégorie : 2 · prévu mais pas fait

**5.221** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2455 :
  > « Note de la copie : 74 % » en tête du bloc « Niveau général », aucun nom de niveau
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**5.222** · Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)
- Intention, l. 2456 :
  > le texte reste lisible sur les couleurs claires de l'échelle (le contraste choisit l'encre ou le papier)
- Observation : aucune mention (termes cherchés : « couleurs claires », « encre ou le papier », « lisible (PDF) »)
- Catégorie : 2 · prévu mais pas fait

### Fait sans être prévu, sans ligne correspondante dans l'intention

**5.223** · Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Affichage du tableau
- Intention : aucune mention (termes cherchés : « Moyenne », « moyenne », « en-tête de la liste »)
- Observation, l. 1312 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Affichage du tableau) :
  > en-tête « 8 résultat(s) (1 évalué(s)) Moyenne : 80.3% 2 productions » (observé à l'exécution). Moyenne = moyenne de `noteFinale` des lignes au statut évalué, hors plagiat/IA, sur les lignes filtrées
- Catégorie : 1 · fait sans être prévu

**5.224** · Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Filtre Production
- Intention : aucune mention (termes cherchés : « filtre Production », « filtre », « par production »)
- Observation, l. 1319 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Filtre Production) :
  > Filtre Production `#filtre-production-eval`
- Observation, l. 1321 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Filtre Production) :
  > Production = B → 4 lignes B, « 4 résultat(s) 1 production »
- Catégorie : 1 · fait sans être prévu

**5.225** · Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Bouton « Réinitialiser »
- Intention : aucune mention (termes cherchés : « Réinitialiser », « réinitialiser les filtres »)
- Observation, l. 1325 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Bouton « Réinitialiser ») :
  > Bouton « Réinitialiser » `[data-action=reinitialiserFiltresEval]`
- Observation, l. 1326 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Bouton « Réinitialiser ») :
  > `filtresListeEvaluations` supprimée (localStorage + IDB)
- Observation, l. 1327 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Bouton « Réinitialiser ») :
  > filtres et recherche vidés, 8 lignes
- Catégorie : 1 · fait sans être prévu

**5.226** · Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Recherche
- Intention : aucune mention (termes cherchés : « recherche », « rechercher », « Rechercher »)
- Observation, l. 1330 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Recherche) :
  > Recherche `#recherche-evaluations`
- Observation, l. 1333 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Recherche) :
  > « bravo » → 2 lignes 2222222
- Catégorie : 1 · fait sans être prévu

**5.227** · Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Cases « Colonnes »
- Intention : aucune mention (termes cherchés : « dépasse », « décoche des colonnes », « débordement »)
- Observation, l. 1343 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Cases « Colonnes ») :
  > le message `#eval-msg-debordement` « Le tableau dépasse l’écran — décoche des colonnes ci-dessus pour ajuster la vue. » est présent à 1400 px de large
- Observation, l. 2773 (Ce qui se produit sans geste de l'utilisateur › Évaluation › Liste et saisie des évaluations) :
  > `verifierDebordementTableau` 50 ms après rendu et sur `resize`
- Catégorie : 1 · fait sans être prévu

**5.228** · Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Supprimer l'évaluation »
- Intention : aucune mention (termes cherchés : « Suppression impossible », « Déverrouillez », « verrouillée »)
- Observation, l. 1362 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Supprimer l'évaluation ») :
  > Avec une copie présente, une évaluation verrouillée est refusée par « Suppression impossible — Cette évaluation est verrouillée. Déverrouillez-la d'abord. »
- Catégorie : 1 · fait sans être prévu

**5.229** · Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Renommer »
- Intention : aucune mention (termes cherchés : « Renommer », « renommer », « Nouveau nom du fichier »)
- Observation, l. 1380 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Renommer ») :
  > `prompt` « Nouveau nom du fichier : » (valeur initiale = nom actuel) ; réponse « Fictif-renomme-Zorglub » → notification « Fichier renommé : Fictif-renomme-Zorglub.png »
- Observation, l. 1381 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Renommer ») :
  > `a2026_fichiersTravaux[FT_…ff543c9092f5].nomFichier` « 1111111_Fictif-copie.png » → « Fictif-renomme-Zorglub.png »
- Catégorie : 1 · fait sans être prévu

**5.230** · Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Réassignation confirmée (« Réassigner 1 copie », copie 1111111 de B vers A)
- Intention : aucune mention (termes cherchés : « Supprimer l'évaluation », « copie liée », « disparaît »)
- Observation, l. 1413 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Réassignation confirmée (« Réassigner 1 copie », copie 1111111 de B vers A)) :
  > l'option « Supprimer l'évaluation » disparaît dès qu'une copie est liée, lu dans le code :1159
- Catégorie : 1 · fait sans être prévu

**5.231** · Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Action « Évaluer »
- Intention : aucune mention (termes cherchés : « compteur de mots », « nombre de mots de la rétroaction », « mots (rétroaction) »)
- Observation, l. 1442 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Action « Évaluer ») :
  > rétroaction pré-remplie (« Production : Exemple activité A / Bonjour Testeur ! / Commentaires de rétroaction pour les quatre critères… / Voici quelques observations : / --- / Note finale : 0.0 % », compteur « 30 mots »)
- Observation, l. 1496 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Bouton « Régénérer ») :
  > compteur affiche « Rétroaction régénérée (-3 mots) »
- Catégorie : 1 · fait sans être prévu

**5.232** · Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Bouton « ↺ »
- Intention : aucune mention (termes cherchés : « ↺ », « Formulaire réinitialisé », « réinitialiser le formulaire »)
- Observation, l. 1513 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Bouton « ↺ ») :
  > notification « Formulaire réinitialisé - Les sélections sont conservées » ; les listes de critères sont remplacées par le message d'attente
- Catégorie : 1 · fait sans être prévu

**5.233** · Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Bouton profil rapide
- Intention : aucune mention (termes cherchés : « profil rapide », « ouvrir le profil depuis l'évaluation », « bouton profil (Annoter et évaluer) »)
- Observation, l. 1527 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Bouton profil rapide) :
  > Bouton profil rapide `#travaux-eval-btn-profil`
- Observation, l. 1528 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Bouton profil rapide) :
  > en évaluation sans copie, aucun changement d'écran ; console « [travaux-ui] Aucun DA associé au fichier courant »
- Catégorie : 1 · fait sans être prévu

**5.234** · Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Jetons
- Intention : aucune mention (termes cherchés : « Total utilisés », « compteur de jetons », « jetons utilisés (formulaire) »)
- Observation, l. 1533 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Jetons) :
  > Le compteur « Total utilisés » reste « 0 / 2 » à l'écran.
- Catégorie : 1 · fait sans être prévu

**5.235** · Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Jetons
- Intention : aucune mention (termes cherchés : « créera une nouvelle évaluation », « Veux-tu continuer », « confirmation du jeton de reprise »)
- Observation, l. 1535 (Évaluation › Liste des évaluations et saisie d'une évaluation › Saisie d'une évaluation › Jetons) :
  > `confirm` « Appliquer un jeton de reprise créera une nouvelle évaluation qui remplacera celle-ci.\n\nVeux-tu continuer ? »
- Catégorie : 1 · fait sans être prévu

**5.236** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer
- Intention : aucune mention (termes cherchés : « aucune production », « sans production », « Productions étudiantes »)
- Observation, l. 1571 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > encart « 6 fichiers ne sont associés à aucune production. Vérifie que les productions ont été créées dans « Productions étudiantes » (onglet Conception). »
- Catégorie : 1 · fait sans être prévu

**5.237** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer
- Intention : aucune mention (termes cherchés : « Jeton de reprise », « sélecteur global « Production » », « jeton »)
- Observation, l. 1580 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > options : productions + « Jeton de reprise » (`__jeton_reprise__`) quand les jetons sont actifs.
- Catégorie : 1 · fait sans être prévu

**5.238** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer
- Intention : aucune mention (termes cherchés : « autre groupe-cours », « bandeau », « groupe-cours »)
- Observation, l. 1587 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > bandeaux éventuels (autre groupe-cours,
- Catégorie : 1 · fait sans être prévu

**5.239** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer
- Intention : aucune mention (termes cherchés : « Retirer », « de la liste », « file d'attente »)
- Observation, l. 1611 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > Le programme ouvre `confirm` « Retirer « copie fictif-delta proto.jpg » de la liste ? » ; si accepté, l'élément est retiré de `a2026_pipeline_queue`
- Catégorie : 1 · fait sans être prévu

**5.240** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer
- Intention : aucune mention (termes cherchés : « Étudiant », « élève reconnu », « choisir l'élève »)
- Observation, l. 1613 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > **Champ « Étudiant » `#pipeline-etudiant-N`**
- Observation, l. 1615 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > après saisie « Charlie », « Essai Fictif-Charlie 3333333 » (filtre sur prénom + nom + DA, 20 max)
- Catégorie : 1 · fait sans être prévu

**5.241** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer
- Intention : aucune mention (termes cherchés : « Désélectionner », « inspecteur »)
- Observation, l. 1622 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > **Lien « Désélectionner » (`travauxUI.deselectionnerFichierPipeline`)** : l'inspecteur revient à « Clique sur un fichier à gauche pour le prévisualiser »
- Catégorie : 1 · fait sans être prévu

**5.242** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer
- Intention : aucune mention (termes cherchés : « Annuler tout », « vider la file », « Annuler »)
- Observation, l. 1623 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > **« Annuler tout » (`travauxUI.annulerImport`, js/travaux-ui.js:6069)** : sessionStorage `a2026_pipeline_queue` → `[]` ; l'écran revient à la seule zone de dépôt ; aucune confirmation
- Catégorie : 1 · fait sans être prévu

**5.243** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer
- Intention : aucune mention (termes cherchés : « Livrable additionnel », « les deux conservés », « fichiers multiples »)
- Observation, l. 1635 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > « Livrable additionnel (les deux conservés) »
- Observation, l. 1637 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > **« Livrable additionnel »** : nouveau fichier `FT_…19b01296be41` (1111111, PDF 1522 o) dans `a2026_fichiersTravaux` et IDB `fichiers` ; clé `cas_fichiers_multiples_valides`
- Catégorie : 1 · fait sans être prévu

**5.244** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer
- Intention : aucune mention (termes cherchés : « Garder l'existant », « garder »)
- Observation, l. 1639 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > **« Garder l'existant »** : aucun écrit dans les fichiers ; le fichier reste dans la file avec `statut: "doublon"`
- Catégorie : 1 · fait sans être prévu

**5.245** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer
- Intention : aucune mention (termes cherchés : « Importer sans association », « sans association », « orphelin »)
- Observation, l. 1640 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > **« Importer sans association »** : nouveau fichier {etudiantDA 1111111, productionId "", statut "orphelin"} + blob IDB
- Catégorie : 1 · fait sans être prévu

**5.246** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « Rechercher », « Aucun fichier ne correspond », « filtre du tableau d'Annoter »)
- Observation, l. 1652 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > sessionStorage `travaux-filtre-production` : absent → `""` puis → `PROD_1791899118158_1_3a7fa7b36d86`
- Observation, l. 1653 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > statut « Évalué » → 0 ligne et « Aucun fichier ne correspond aux filtres. » ; production → 5 lignes sur 7 ; recherche « bravo » → 1 ligne (Fictif-Bravo)
- Catégorie : 1 · fait sans être prévu

**5.247** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « case du tableau d'Annoter », « cases du tableau des copies », « tout sélectionner (Annoter et évaluer) »)
- Observation, l. 1654 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > coche les 7 cases visibles `.travaux-tableau-checkbox` ; aucun stockage (observé à l'exécution). Aucun bouton du tableau n'utilise ces cases
- Catégorie : 1 · fait sans être prévu

**5.248** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « rectangle », « cercle », « pointillé », « ondulé »)
- Observation, l. 1660 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > formes O R L P W
- Observation, l. 1669 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > ajoute `shapes:[{type:"rectangle",…}]` à la page 0 dans `a2026_annotationsTravaux`
- Catégorie : 1 · fait sans être prévu

**5.249** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « page suivante (visionneuse) », « page précédente », « navigation de pages »)
- Observation, l. 1663 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > PDF Alpha 3 pages, « 1 / 3 » → « 2 / 3 » → « 1 / 3 » ; aucun stockage ; boutons désactivés pour un document d'une page
- Catégorie : 1 · fait sans être prévu

**5.250** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « plein écran (visionneuse) », « Échap », « travaux-plein-ecran »)
- Observation, l. 1665 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > ajoute/retire la classe `travaux-plein-ecran-actif` sur `body` (vrai après clic, faux après Échap)
- Catégorie : 1 · fait sans être prévu

**5.251** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « raccourci (annotation) », « touche « r » », « raccourcis clavier de la palette d'annotation »)
- Observation, l. 1667 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > outils `[data-action="travauxOutils.setOutilActif"]` et raccourcis clavier
- Observation, l. 1669 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > **Touche « r » puis glisser** : outil Rectangle
- Catégorie : 1 · fait sans être prévu

**5.252** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « Ctrl+Z », « Annuler, Rétablir (annotation) », « rétablir une annotation »)
- Observation, l. 1670 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > **Ctrl+Z** (`travauxAnnotation.annuler`) : retire le rectangle (`shapes: []`) et réécrit la clé après 2 s ; **bouton `#travaux-btn-redo`** (`travauxAnnotation.retablir`) : le rectangle revient
- Catégorie : 1 · fait sans être prévu

**5.253** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « crochet (annotation) », « symbole »)
- Observation, l. 1674 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > **Symbole Crochet `setOutilActif('crochet')` + clic** (`ajouterSymbole`, js/travaux-annotation.js:1284) : ajoute `shapes:[{type:"crochet",…}]`
- Catégorie : 1 · fait sans être prévu

**5.254** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « outil Sélection », « Suppr (annotation) », « supprimer un trait »)
- Observation, l. 1675 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > **Sélection (touche « s ») + clic sur le trait** : active `#travaux-btn-supprimer` ; **Suppr** retire le trait (`strokes: []`)
- Catégorie : 1 · fait sans être prévu

**5.255** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « gomme », « effacer au contact »)
- Observation, l. 1676 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > **Gomme (touche « e ») + glisser** (`effacerTraitAuContact`, js/travaux-annotation.js:1045) : avec le tracé vertical essayé, aucun changement de stockage
- Catégorie : 1 · fait sans être prévu

**5.256** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « épaisseur », « Épaisseur », « 2px »)
- Observation, l. 1681 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > l'affichage `#travaux-epaisseur-px` reste « 2px » après les clics
- Catégorie : 1 · fait sans être prévu

**5.257** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « dupliquer un trait », « Dupliquer (annotation) »)
- Observation, l. 1683 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > **« Dupliquer » `#travaux-btn-dupliquer` (`travauxAnnotation.dupliquerSelection`, js/travaux-annotation.js:1948)** : actif après sélection d'un trait ; ajoute une copie du trait
- Catégorie : 1 · fait sans être prévu

**5.258** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « Erreur principale », « Toutes les erreurs », « synthèse PDF des codes »)
- Observation, l. 1685 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > Synthèse PDF : Erreur principale | Toutes les erreurs
- Catégorie : 1 · fait sans être prévu

**5.259** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « Réinitialiser (codes, tampons) », « réinitialiser les tampons », « réinitialiser les codes »)
- Observation, l. 1686 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > Exporter mes tampons | Importer des tampons | Réinitialiser | Annuler | Enregistrer
- Observation, l. 2913 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Réinitialiser » des deux modales
- Catégorie : 1 · fait sans être prévu

**5.260** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « Exporter mes tampons », « exporter les tampons », « Métadonnées d'export »)
- Observation, l. 1687 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > **« Exporter mes tampons » (modale des tampons, `travauxOutils.exporterTampons`, js/travaux-outils.js:2670)**
- Observation, l. 1687 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > le nom de fichier porte « CC-BY-SA » et les métadonnées « CC BY-NC-SA 4.0 » ; notification « 23 tampon(s) exporté(s) »
- Catégorie : 1 · fait sans être prévu

**5.261** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter
- Intention : aucune mention (termes cherchés : « Importer des tampons », « importer une bibliothèque de tampons », « Les tampons actuels seront remplacés »)
- Observation, l. 1688 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-annoter) :
  > modale « Importer cette bibliothèque de tampons ? | 23 tampon(s), 3 catégorie(s) | Les tampons actuels seront remplacés. | Annuler | Importer »
- Catégorie : 1 · fait sans être prévu

**5.262** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter
- Intention : aucune mention (termes cherchés : « Reprises seulement », « reprises seulement (Léa) »)
- Observation, l. 1704 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter) :
  > case « Reprises seulement », « Exporter pour Léa »
- Catégorie : 1 · fait sans être prévu

**5.263** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter
- Intention : aucune mention (termes cherchés : « Veuillez sélectionner », « sélectionner une production (Léa) », « refus sans production »)
- Observation, l. 1716 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter) :
  > Sans production choisie : `alert` « Veuillez sélectionner une production. » ; rien d'écrit
- Catégorie : 1 · fait sans être prévu

**5.264** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter
- Intention : aucune mention (termes cherchés : « Aucune évaluation trouvée », « export Léa a échoué », « Léa sans évaluation »)
- Observation, l. 1717 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter) :
  > `alert` « L'export Léa a échoué : Aucune évaluation trouvée pour ces critères. » ; aucun fichier, rien d'écrit
- Catégorie : 1 · fait sans être prévu

**5.265** · Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter
- Intention : aucune mention (termes cherchés : « Rétroaction — », « fenêtre de rétroaction (Exporter et archiver) », « bouton rétroaction d'un badge »)
- Observation, l. 1734 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter) :
  > modale `#travaux-modal-retroaction` « Rétroaction — Testeur Fictif-Alpha | Production : Fictif-Essai Zorglub | Grille : Grille de départ | Note : 79.5% | Niveau : M | Critères |
- Catégorie : 1 · fait sans être prévu

**5.266** · Ce qui se produit sans geste de l'utilisateur › Évaluation › Liste et saisie des évaluations
- Intention : aucune mention (termes cherchés : « compteur de mots », « mots », « compteur »)
- Observation, l. 2774 (Ce qui se produit sans geste de l'utilisateur › Évaluation › Liste et saisie des évaluations) :
  > `DOMContentLoaded` : compteur de mots sur `#retroactionFinale1`
- Catégorie : 1 · fait sans être prévu

**5.267** · Ce qui se produit sans geste de l'utilisateur › Évaluation › Importer, annoter, exporter
- Intention : aucune mention (termes cherchés : « dernier fichier », « rouvre la dernière copie », « réouverture de la copie »)
- Observation, l. 2779 (Ce qui se produit sans geste de l'utilisateur › Évaluation › Importer, annoter, exporter) :
  > restauration de la session (`travaux-dernier-fichier`) et ouverture différée de 200 ms du dernier fichier si le sous-écran est « annoter »
- Catégorie : 1 · fait sans être prévu

**5.268** · Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter
- Intention : aucune mention (termes cherchés : « même étudiant », « appartenir au même », « Fusionner »)
- Observation, l. 2910 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > refus « Les fichiers doivent appartenir au même étudiant pour être fusionnés. » si DA différents
- Catégorie : 1 · fait sans être prévu

**5.269** · Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter
- Intention : aucune mention (termes cherchés : « bibliothèque de tampons », « Bibliothèque de tampons »)
- Observation, l. 2912 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > Bibliothèque de tampons (`tamponsBibliotheque.afficherBibliothequeTampons`) : non exécutée (budget).
- Catégorie : 1 · fait sans être prévu

**5.270** · Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter
- Intention : aucune mention (termes cherchés : « pause », « Pause », « mettre le chronomètre en pause »)
- Observation, l. 2914 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > Pause du chronomètre `#chrono-btn-pause` : bouton non visible (`display:none`) pendant l'essai, clic impossible
- Catégorie : 1 · fait sans être prévu

**5.271** · Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter
- Intention : aucune mention (termes cherchés : « filtre des badges », « badges par production », « filtrer la grille des copies »)
- Observation, l. 2922 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > Filtre des badges par production (`filtrerBadgesParProduction`) : le sélecteur ne contient que « Fictif-Essai Zorglub (2) » avec une seule production
- Catégorie : 1 · fait sans être prévu

---

## Partie 6 · Suivi : le groupe, la liste, les profils, les présences

### Écran 49 · Suivi (commun aux quatre écrans de cette partie)

**6.1** · Sans geste
- Intention, l. 2485 :
  > Un groupe-cours sans pratique de notation assignée n'a aucune note : complétion et performance se lisent par un tiret
- Observation, l. 1769 (Suivi — observation : groupe, liste, profils › Préalables (données fictives produites par l'interface)) :
  > sans pratique, C = P = 0 et `noteConstructible` false
- Catégorie : 3 · fait autrement

**6.2** · Sans geste
- Intention, l. 2487 :
  > ses données restent en base et reviennent s'il est réinscrit
- Observation : aucune mention (termes cherchés : « réinscri », « réinscription », « réintégr »)
- Catégorie : 2 · prévu mais pas fait

**6.3** · Sans geste
- Intention, l. 2488 :
  > En mode anonymisation, on travaille normalement et tout s'enregistre
- Observation, l. 1949 (Suivi — observation : groupe, liste, profils › Profils individuels › Bouton « Confidentiel ») :
  > En mode anonymisation, champs masqués et vidés, aucune écriture
- Observation, l. 1993 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Champ de notes) :
  > En mode anonymisation, le champ est vide, désactivé
- Catégorie : 3 · fait autrement

**6.4** · Sans geste
- Intention, l. 2489 :
  > y compris le volet confidentiel, les notes libres et les notes de présences
- Observation, l. 2935 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Mode anonymisation (masquage des noms, notes confidentielles et notes de rapport) : non activé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.5** · Sans geste
- Intention, l. 2491 :
  > Tout ce qui s'enregistre le dit par un même témoin en bas de l'écran
- Observation, l. 276 (En-tête, Accueil et Aide — éléments communs › Bibliothèques appelées par les modules) :
  > Aucun des gestes de ce module ne l'a affiché (observé à l'exécution)
- Catégorie : 2 · prévu mais pas fait

**6.6** · Sans geste
- Intention, l. 2491 :
  > « Non enregistré » et la raison en cas d'échec, qui reste affiché jusqu'à la prochaine écriture réussie
- Observation : aucune mention (termes cherchés : « prochaine écriture », « jusqu'à la prochaine »)
- Catégorie : 2 · prévu mais pas fait

### Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écrans)

**6.7** · Sans geste
- Intention, l. 2500 :
  > A (assiduité) se compte en périodes, à partir des présences saisies, demi-période comprise
- Observation, l. 1825 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Icônes) :
  > Formule : A = (heures présentes / heures données) × 100
- Catégorie : 3 · fait autrement

**6.8** · Sans geste
- Intention, l. 2502 :
  > Le dénominateur de A est le nombre de périodes réelles d'une séance (une heure d'horloge n'est pas une période ; 50 minutes par défaut)
- Observation, l. 1825 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Icônes) :
  > Formule : A = (heures présentes / heures données) × 100
- Catégorie : 3 · fait autrement

**6.9** · Sans geste
- Intention, l. 2503 :
  > Une séance qui ne porte pas son nombre de périodes reprend le format déclaré de son horaire ; rien n'est réécrit dans les horaires ni les présences
- Observation : aucune mention (termes cherchés : « format déclaré », « reprend le format », « format de son horaire »)
- Catégorie : 2 · prévu mais pas fait

**6.10** · Sans geste
- Intention, l. 2505 :
  > un tiret partout (profil, Liste, Suivi du groupe, rapport), jamais 100 %
- Observation : aucune mention (termes cherchés : « Assiduité inconnue », « tiret », « jamais 100 »)
- Catégorie : 2 · prévu mais pas fait

**6.11** · Sans geste
- Intention, l. 2506 :
  > Un élève qui porte une date d'arrivée n'hérite pas, comme absences, des séances d'avant cette date
- Observation : aucune mention (termes cherchés : « avant son arrivée », « avant la date d'arrivée », « séances d'avant »)
- Catégorie : 2 · prévu mais pas fait

**6.12** · Sans geste
- Intention, l. 2507 :
  > Une présence de rattrapage (intervention) ne compense une absence au cours que si l'enseignant le choisit en marquant l'intervention complétée
- Observation, l. 2081 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Statut « Complétée ») :
  > Même geste sur l'intervention du 2026-10-12 (séance déjà saisie pour les 4) → aucun ajout : une entrée n'est ajoutée que si aucune fiche de même DA/date/cours n'existe
- Catégorie : 3 · fait autrement

**6.13** · Sans geste
- Intention, l. 2508 :
  > Une présence d'intervention seule ne rend pas une séance « saisie » pour le reste du sous-groupe
- Observation, l. 2081 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Statut « Complétée ») :
  > intervention de rattrapage du 2026-10-07 (séance non saisie)
- Observation, l. 2082 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Statut « Complétée ») :
  > Effet dans la saisie au 2026-10-07 (observé à l'exécution) : « Séance saisie », « Présents : 1 Absents : 3 Total : 4 Assiduité aujourd'hui : 25% »
- Catégorie : 3 · fait autrement

**6.14** · Sans geste
- Intention, l. 2509 :
  > un travail formatif compte, un travail facultatif sort du compte
- Observation : aucune mention (termes cherchés : « travail formatif », « travail facultatif », « formatif compte »)
- Catégorie : 2 · prévu mais pas fait

**6.15** · Sans geste
- Intention, l. 2515 :
  > La « fenêtre d'analyse des patterns » réglée dans Labo s'applique au profil et au « sur N » de fiabilité du Suivi du groupe
- Observation : aucune mention (termes cherchés : « fiabilité », « configurées », « fenêtre d'analyse »)
- Catégorie : 2 · prévu mais pas fait

**6.16** · Sans geste
- Intention, l. 2516 :
  > colorent les colonnes A, C, P et Mobilisation de la Liste
- Observation, l. 1863 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Affichage de l'écran) :
  > lignes (#, DA, Groupe, Nom, Prénom, SA, A, C, P, Profils, RàI, Interv.)
- Catégorie : 2 · prévu mais pas fait

**6.17** · Sans geste
- Intention, l. 2517 :
  > Un réglage des seuils déjà déplacé prend effet tel quel ; aucune valeur n'est posée à la place de l'enseignant
- Observation, l. 2203 (Labo › Outils d'observation) :
  > Pendant ce refus, la lecture des seuils réécrit `seuilsInterpretation` complétée des valeurs par défaut
- Catégorie : 3 · fait autrement

### Écran 51 · Suivi : les captures hebdomadaires

**6.18** · Sans geste
- Intention, l. 2525 :
  > Le relevé hebdomadaire porte le taux de remise du dernier travail dû : il ne compte que les élèves actifs du groupe, chacun une fois, et ne dépasse jamais 100 %
- Observation : aucune mention (termes cherchés : « taux de remise », « relevé hebdomadaire », « dernier travail dû »)
- Catégorie : 2 · prévu mais pas fait

**6.19** · Sans geste
- Intention, l. 2526 :
  > Le P d'une capture est la note du cours telle qu'elle se calculait ce jour-là, sur les seules évaluations échues
- Observation, l. 1770 (Suivi — observation : groupe, liste, profils › Préalables (données fictives produites par l'interface)) :
  > dans ces captures A/A_cumulatif sont renseignés à partir du 2026-09-14 (ex. 3333333 : 0, 25, 17, 38, 30, 33), C et P sont null
- Catégorie : 3 · fait autrement

**6.20** · Sans geste
- Intention, l. 2527 :
  > En dénotation, la courbe de performance n'a pas de point
- Observation : aucune mention (termes cherchés : « En dénotation », « courbe de performance »)
- Catégorie : 2 · prévu mais pas fait

**6.21** · Sans geste
- Intention, l. 2529 :
  > Les courbes de performance des archives sont celles de l'élève, plus la moyenne du groupe
- Observation : aucune mention (termes cherchés : « courbes de performance », « moyenne du groupe », « courbe de l'élève »)
- Catégorie : 2 · prévu mais pas fait

**6.22** · Sans geste
- Intention, l. 2532 :
  > « Recalculer les captures » ne fait pas perdre les mesures avant et après des interventions
- Observation : aucune mention (termes cherchés : « mesures avant et après », « ne fait pas perdre », « avant et après des interventions »)
- Catégorie : 2 · prévu mais pas fait

### Écran 52 · Suivi › Suivi du groupe

**6.23** · Geste : ouvrir le Suivi du groupe
- Intention, l. 2539 :
  > Sortie : présences et remises semaine après semaine
- Observation, l. 2929 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Graphique hebdomadaire mesures C et P avec valeurs : les captures reconstruites contiennent C = P = null ; seul le message vide est atteignable.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.24** · Geste : lire les barres A, C, P (aperçu en dégradé)
- Intention, l. 2545 :
  > Sortie : chaque barre est un dégradé continu : la couleur d'un point est interpolée, ce ne sont pas des paliers ; le glossaire le dit
- Observation : aucune mention (termes cherchés : « dégradé », « interpolée », « couleur d'un point »)
- Catégorie : 2 · prévu mais pas fait

**6.25** · Geste : lire les barres A, C, P (aperçu en dégradé)
- Intention, l. 2548 :
  > la barre A dit « Assiduité non calculée : aucune séance de l'horaire ne porte son nombre de périodes. Tu peux le saisir dans Cadre › Trimestre › Horaire. » au lieu de rester vide
- Observation : aucune mention (termes cherchés : « Assiduité non calculée », « aucune séance de l'horaire ne porte », « Tu peux le saisir »)
- Catégorie : 2 · prévu mais pas fait

**6.26** · Geste : lire les barres A, C, P (aperçu en dégradé)
- Intention, l. 2549 :
  > Sortie : l'assiduité (A) des trimestres passés s'affiche
- Observation : aucune mention (termes cherchés : « trimestres passés », « trimestre passé », « assiduité des trimestres »)
- Catégorie : 2 · prévu mais pas fait

**6.27** · Geste : lire les barres A, C, P (aperçu en dégradé)
- Intention, l. 2550 :
  > la barre Performance ne répartit que les élèves dont la note existe et dit combien restent en attente
- Observation, l. 1788 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > Textes « N séance(s) en attente » / « N évaluation(s) en attente » = seuil (A : 1 séance, C : 1 production évaluée, P : `seuilEvaluationsPourP`) − nombre au groupe
- Observation, l. 1788 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > sur l'état de base : « 1 séance en attente », « 1 évaluation en attente », « 3 évaluations en attente »
- Catégorie : 3 · fait autrement

**6.28** · Geste : lire les barres A, C, P (aperçu en dégradé)
- Intention, l. 2552 :
  > Sortie : un élève supprimé n'entre pas dans les comptes « en attente » du tableau de bord
- Observation : aucune mention (termes cherchés : « élève supprimé », « étudiant·e supprimé·e », « comptes « en attente » »)
- Catégorie : 2 · prévu mais pas fait

**6.29** · Geste : lire les étiquettes de zones
- Intention, l. 2562 :
  > le mode « Habiletés » des trajectoires les garde, avec les niveaux de l'échelle des évaluations
- Observation : aucune mention (termes cherchés : « lettres de niveaux », « niveaux de l'échelle des évaluations », « lignes de niveaux »)
- Catégorie : 2 · prévu mais pas fait

**6.30** · Geste : lire les étiquettes de zones
- Intention, l. 2563 :
  > Sortie : l'aide « Indicateurs visuels des seuils » (Labo) dit que les lignes viennent des niveaux de l'échelle de l'enseignant
- Observation : aucune mention (termes cherchés : « Indicateurs visuels des seuils », « niveaux de l'échelle de l'enseignant », « les lignes viennent »)
- Catégorie : 2 · prévu mais pas fait

**6.31** · Geste : lire les étiquettes de zones
- Intention, l. 2564 :
  > Sortie : l'aide des trajectoires dit qu'en mode « Note finale », les courbes ne portent pas les niveaux d'une échelle, et qu'en mode « Habiletés », elles les portent
- Observation : aucune mention (termes cherchés : « ne portent pas les niveaux », « mode « Note finale » », « aide des trajectoires »)
- Catégorie : 2 · prévu mais pas fait

**6.32** · Geste : suivre un élève (clic sur son nom, en mode Détails)
- Intention, l. 2569 :
  > Données : à la première ouverture d'un groupe-cours, une liste suivie d'avant (partagée entre groupes) est reprise pour les élèves de ce groupe ; l'ancienne liste reste en place, intacte
- Observation : aucune mention (termes cherchés : « partagée entre groupes », « ancienne liste », « liste suivie »)
- Catégorie : 2 · prévu mais pas fait

**6.33** · Geste : suivre un élève (clic sur son nom, en mode Détails)
- Intention, l. 2570 :
  > Données : un élève hors du groupe actif est refusé à l'ajout ; un élève passé en abandon libère son siège
- Observation : aucune mention (termes cherchés : « hors du groupe actif », « libère », « refusé à l'ajout »)
- Catégorie : 2 · prévu mais pas fait

**6.34** · Geste : ouvrir le panneau « Détails »
- Intention, l. 2579 :
  > Sortie : le badge A d'un élève à l'assiduité inconnue montre un tiret et porte la bulle « Assiduité inconnue : aucune séance saisie ne compte encore pour cet·te étudiant·e. »
- Observation : aucune mention (termes cherchés : « Assiduité inconnue », « aucune séance saisie ne compte encore »)
- Catégorie : 2 · prévu mais pas fait

**6.35** · Geste : cliquer sur A, C ou P d'un élève
- Intention, l. 2588 :
  > Sortie : le profil de l'élève s'ouvre, section Engagement
- Observation, l. 2926 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Pastilles A/C/P du panneau « Détails » (`.etudiant-prioritaire-indices` → profil, section « mobilisation ») : non cliquées
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.36** · Geste : lire « Observation globale des besoins d'intervention »
- Intention, l. 2593 :
  > Sortie : une ligne en italique nomme la fenêtre d'analyse (« … sur N configurées » ou « Certains étudiants ont moins de N productions évaluées »)
- Observation : aucune mention (termes cherchés : « configurées », « Certains étudiants ont moins de », « italique »)
- Catégorie : 2 · prévu mais pas fait

**6.37** · Geste : lire « Observation globale des besoins d'intervention »
- Intention, l. 2594 :
  > Sortie : la barre RàI du groupe et la carte Contexte disent « En attente » tant qu'aucun travail n'est dû et qu'aucune copie du groupe n'est évaluée
- Observation : aucune mention (termes cherchés : « « En attente » », « carte Contexte », « barre RàI du groupe »)
- Catégorie : 2 · prévu mais pas fait

**6.38** · Geste : lire « Observation globale des besoins d'intervention »
- Intention, l. 2595 :
  > Sortie : en démonstration, la famille « Défi spécifique » se calcule sur la grille du pack, sans toucher à la grille de référence de l'enseignant, et la console reste sans avertissement
- Observation : aucune mention (termes cherchés : « grille du pack », « famille « Défi spécifique » »)
- Catégorie : 2 · prévu mais pas fait

**6.39** · Geste : lire la barre « Structure des apprentissages fondamentaux »
- Intention, l. 2599 :
  > Sortie : la phrase sous la barre décrit le groupe affiché dès le premier affichage, après tout ajout, retrait ou décrochage
- Observation : aucune mention (termes cherchés : « Structure des apprentissages fondamentaux », « apprentissages fondamentaux », « phrase sous la barre »)
- Catégorie : 2 · prévu mais pas fait

**6.40** · Geste : lire la barre « Structure des apprentissages fondamentaux »
- Intention, l. 2600 :
  > Sortie : la phrase écrit « difficulté récente » (une seule production récente sous le seuil) et non « émergente »
- Observation : aucune mention (termes cherchés : « difficulté récente », « production récente sous le seuil »)
- Catégorie : 2 · prévu mais pas fait

**6.41** · Geste : lire les courbes d'intervention
- Intention, l. 2604 :
  > même chose pour le groupe contrôle (« P sans reprises · contrôle ») ; sans telle reprise, rien ne s'ajoute
- Observation, l. 2288 (Labo › Études) :
  > « P contrôle » (moyenne P des élèves sans intervention, axe %) 63,4 → 77,6 ; « P sans reprises · contrôle » identique
- Catégorie : 3 · fait autrement

**6.42** · Geste : lire les courbes d'intervention
- Intention, l. 2605 :
  > Sortie : une intervention datée après la dernière séance n'a pas de point tant qu'aucune séance ne la suit ; sa courbe ne part pas du début du trimestre
- Observation : aucune mention (termes cherchés : « datée après la dernière séance », « courbe ne part pas », « après la dernière séance »)
- Catégorie : 2 · prévu mais pas fait

**6.43** · Sans geste
- Intention, l. 2617 :
  > La liste suivie se filtre à la lecture (élèves du groupe actif, hors abandons) sans jamais être réécrite
- Observation : aucune mention (termes cherchés : « hors abandons », « se filtre à la lecture », « liste suivie »)
- Catégorie : 2 · prévu mais pas fait

### Écran 53 · Suivi › Liste des étudiant·es

**6.44** · Geste : ouvrir la Liste
- Intention, l. 2624 :
  > Sortie : les élèves en abandon, inactifs ou en décrochage restent visibles, grisés, avec leur statut entre parenthèses après le nom
- Observation : aucune mention (termes cherchés : « grisés », « entre parenthèses », « statut après le nom »)
- Catégorie : 2 · prévu mais pas fait

**6.45** · Geste : ouvrir la Liste
- Intention, l. 2625 :
  > Sortie : la ligne grisée d'un exclu montre son assiduité réelle, pas 0 %
- Observation : aucune mention (termes cherchés : « ligne grisée », « assiduité réelle »)
- Catégorie : 2 · prévu mais pas fait

**6.46** · Geste : ouvrir la Liste
- Intention, l. 2627 :
  > Sortie : les colonnes A, C, P et Mobilisation sont colorées selon les seuils d'interprétation
- Observation, l. 1863 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Affichage de l'écran) :
  > lignes (#, DA, Groupe, Nom, Prénom, SA, A, C, P, Profils, RàI, Interv.)
- Catégorie : 2 · prévu mais pas fait

**6.47** · Geste : ouvrir la Liste
- Intention, l. 2628 :
  > Sortie : une assiduité inconnue s'affiche par un tiret
- Observation : aucune mention (termes cherchés : « assiduité inconnue », « tiret »)
- Catégorie : 2 · prévu mais pas fait

**6.48** · Geste : ouvrir la Liste
- Intention, l. 2629 :
  > Sortie : le compteur d'interventions ne compte que celles du groupe où l'on est (celles d'avant le 12 sept. 2026 restent visibles partout)
- Observation : aucune mention (termes cherchés : « compteur d'interventions », « celles du groupe où l'on est », « restent visibles partout »)
- Catégorie : 2 · prévu mais pas fait

**6.49** · Geste : ouvrir la Liste
- Intention, l. 2630 :
  > Sortie : dans un service, la liste montre tous les élèves du service, même une ligne collée d'Omnivox qui porte un numéro de groupe
- Observation, l. 2948 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > import Omnivox à ≥ 4 colonnes commençant par un DA
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.50** · Geste : ouvrir la Liste
- Intention, l. 2632 :
  > Sortie : le bouton d'aide « i » du titre reste présent et cliquable après un changement de filtre
- Observation : aucune mention (termes cherchés : « après un changement de filtre », « reste présent et cliquable »)
- Catégorie : 2 · prévu mais pas fait

**6.51** · Geste : filtrer par profil d'apprentissage, par RàI ou par groupe
- Intention, l. 2646 :
  > Sortie : les filtres et la recherche s'appliquent aux élèves grisés comme aux autres
- Observation : aucune mention (termes cherchés : « élèves grisés », « grisés comme aux autres »)
- Catégorie : 2 · prévu mais pas fait

### Écran 54 · Suivi › Profils individuels (le profil d'un élève)

**6.52** · Geste : ouvrir le profil d'un élève (sélecteur, Liste ou Suivi du groupe)
- Intention, l. 2667 :
  > un élève exclu par son statut porte sous son nom « <statut> · hors des moyennes du groupe » (ex. « Décrochage · hors des moyennes du groupe »)
- Observation : aucune mention (termes cherchés : « hors des moyennes », « Décrochage · », « statut », « exclu »)
- Catégorie : 2 · prévu mais pas fait

**6.53** · Geste : ouvrir le profil d'un élève (sélecteur, Liste ou Suivi du groupe)
- Intention, l. 2667 :
  > un élève qui n'est plus dans le groupe : « N'est plus dans le groupe », sans calcul
- Observation : aucune mention (termes cherchés : « N'est plus dans le groupe », « plus dans le groupe »)
- Catégorie : 2 · prévu mais pas fait

**6.54** · Geste : ouvrir le profil d'un élève (sélecteur, Liste ou Suivi du groupe)
- Intention, l. 2668 :
  > sans pratique assignée, le profil dit « Aucune pratique de notation n'est assignée à ce groupe-cours. Ouvre Conception → Pratiques de notation, choisis ta pratique et clique « Appliquer au cours actif ». »
- Observation : aucune mention (termes cherchés : « Aucune pratique de notation », « n'est assignée », « sans pratique »)
- Catégorie : 2 · prévu mais pas fait

**6.55** · Geste : ouvrir le profil d'un élève (sélecteur, Liste ou Suivi du groupe)
- Intention, l. 2668 :
  > une pratique assignée mais introuvable se dit « introuvable »
- Observation : aucune mention (termes cherchés : « introuvable », « pratique introuvable »)
- Catégorie : 2 · prévu mais pas fait

**6.56** · Geste : ouvrir le profil d'un élève (sélecteur, Liste ou Suivi du groupe)
- Intention, l. 2669 :
  > le profil s'affiche même si une pratique configurable a été supprimée ou est devenue invalide
- Observation : aucune mention (termes cherchés : « pratique supprimée », « invalide », « pratiquesConfigurables »)
- Catégorie : 2 · prévu mais pas fait

**6.57** · Geste : ouvrir le profil d'un élève (sélecteur, Liste ou Suivi du groupe)
- Intention, l. 2670 :
  > en pratique par spécifications, un élève qui n'atteint aucun forfait n'a pas de note tant que la pratique n'en prévoit pas ; le profil écrit un tiret et en dit la raison
- Observation : aucune mention (termes cherchés : « spécifications », « forfait », « tiret », « SPE »)
- Catégorie : 2 · prévu mais pas fait

**6.58** · Geste : lire la section Engagement
- Intention, l. 2674 :
  > la carte Assiduité montre les présences telles que saisies, demi-période comprise (« 90% (22,5 / 25 périodes) »)
- Observation, l. 1929 (Suivi — observation : groupe, liste, profils › Profils individuels › Entrées de la barre latérale) :
  > « Assiduité 100% • Périodes présentes : 12 / 12 0 absence ou retard Assiduité parfaite ! »
- Catégorie : 3 · fait autrement

**6.59** · Geste : lire la section Engagement
- Intention, l. 2675 :
  > chaque pastille porte le titre de la leçon que la carte d'alignement place à cette date pour le groupe de l'élève
- Observation : aucune mention (termes cherchés : « titre de la leçon », « leçon », « carte d'alignement », « absences ou retards »)
- Catégorie : 2 · prévu mais pas fait

**6.60** · Geste : lire la section Engagement
- Intention, l. 2675 :
  > sur iPad portrait, le titre passe à la ligne dans la carte
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**6.61** · Geste : lire la section Engagement
- Intention, l. 2678 :
  > sous une pratique sommative, la carte Complétion liste les productions que sa fraction compte
- Observation : aucune mention (termes cherchés : « Complétion », « Productions remises », « liste des productions »)
- Catégorie : 2 · prévu mais pas fait

**6.62** · Geste : lire la section Engagement
- Intention, l. 2679 :
  > avec des copies mais aucune assiduité connue, elle montre un tiret et la phrase « L'assiduité n'est pas encore connue : le contexte s'affichera dès qu'une séance sera saisie pour cet·te étudiant·e. »
- Observation : aucune mention (termes cherchés : « pas encore connue », « dès qu'une séance sera saisie », « Contexte d'apprentissage »)
- Catégorie : 2 · prévu mais pas fait

**6.63** · Geste : lire la section Engagement
- Intention, l. 2681 :
  > la section « Engagement ACP » est retirée du profil quand la case de collecte est décochée dans Labo
- Observation : aucune mention (termes cherchés : « collecte », « depistageAcp », « Engagement ACP », « retirée »)
- Catégorie : 2 · prévu mais pas fait

**6.64** · Geste : lire la section Productions (productions et évaluations)
- Intention, l. 2686 :
  > le profil dit combien d'évaluations ont été écartées (ex. « 2 évaluations en brouillon, non comptées »)
- Observation : aucune mention (termes cherchés : « en brouillon », « non comptées », « écartées »)
- Catégorie : 2 · prévu mais pas fait

**6.65** · Geste : lire la section Productions (productions et évaluations)
- Intention, l. 2687 :
  > un travail diagnostique ne compte pas parmi les travaux évalués du profil
- Observation : aucune mention (termes cherchés : « diagnostique », « travail diagnostique »)
- Catégorie : 2 · prévu mais pas fait

**6.66** · Geste : lire la section Productions (productions et évaluations)
- Intention, l. 2688 :
  > la note finale en ,5 s'arrondit vers le haut, comme à l'export
- Observation : aucune mention (termes cherchés : « arrondi », « ,5 », « vers le haut »)
- Catégorie : 2 · prévu mais pas fait

**6.67** · Geste : lire la section Productions (productions et évaluations)
- Intention, l. 2689 :
  > au profil aussi, une évaluation non verrouillée se dit « non verrouillée », jamais « non enregistrée »
- Observation : aucune mention (termes cherchés : « non verrouillée », « non enregistrée », « profil »)
- Catégorie : 2 · prévu mais pas fait

**6.68** · Geste : cliquer la vignette d'un travail (« Travaux soumis »)
- Intention, l. 2697 :
  > la section Évaluation s'affiche, puis la copie s'ouvre ; jamais une page vide
- Observation, l. 2933 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > vignettes `[data-action=travauxUI.ouvrirFichier]` et bouton `[data-action=lancerExportEtudiantAnnotes]` (export des copies annotées) : aucun travail importé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.69** · Geste : télécharger le ZIP des travaux de l'élève
- Intention, l. 2701 :
  > une copie illisible ne fait pas perdre l'archive : les autres copies partent, un bilan nomme celle qui manque ; les noms gardent leurs accents
- Observation, l. 2933 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > bouton `[data-action=lancerExportEtudiantAnnotes]` (export des copies annotées) : aucun travail importé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.70** · Geste : lire la section Développement des habiletés (onglets Critères, Forces et défis, Gestes cognitifs)
- Intention, l. 2705 :
  > « Gestes cognitifs » n'apparaît qu'avec l'observation des actions activée
- Observation : aucune mention (termes cherchés : « Gestes cognitifs », « observation des actions », « troisième onglet »)
- Catégorie : 2 · prévu mais pas fait

**6.71** · Geste : lire la section Développement des habiletés (onglets Critères, Forces et défis, Gestes cognitifs)
- Intention, l. 2707 :
  > le détail du calcul donne le nombre d'évaluations retenues par la pratique et les mêmes évaluations que la carte de la note ; « Calcul impossible » n'apparaît pas sous une note calculée ; hors Standards, aucune phrase sur des évaluations « retenues »
- Observation : aucune mention (termes cherchés : « détail du calcul », « Calcul impossible », « retenues »)
- Catégorie : 2 · prévu mais pas fait

**6.72** · Geste : lire la section Développement des habiletés (onglets Critères, Forces et défis, Gestes cognitifs)
- Intention, l. 2708 :
  > un critère noté en points se lit à sa note (22/30 = 73 %) dans les barres, la persistance des fondations et le défi
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.73** · Geste : lire la section Développement des habiletés (onglets Critères, Forces et défis, Gestes cognitifs)
- Intention, l. 2708 :
  > un critère réglé « Aucun » au niveau SOLO ne compte que dans la note : ni barre, ni défi, ni cible d'intervention
- Observation : aucune mention (termes cherchés : « Aucun », « niveau SOLO », « Complexité SOLO », « cible d'intervention »)
- Catégorie : 2 · prévu mais pas fait

**6.74** · Geste : lire la section Développement des habiletés (onglets Critères, Forces et défis, Gestes cognitifs)
- Intention, l. 2709 :
  > dans Forces et défis, un critère dont le nom commence par « Français » figure ; s'il est le plus faible, il devient le défi principal et la cible d'intervention
- Observation, l. 1940 (Suivi — observation : groupe, liste, profils › Profils individuels › Onglets « Critères » / « Forces et défis ») :
  > « FORCES ET DÉFIS PARMI LES CRITÈRES Configuration requise Aucune grille de critères n'est désignée pour le dépistage … »
- Catégorie : 2 · prévu mais pas fait

**6.75** · Geste : lire la section Développement des habiletés (onglets Critères, Forces et défis, Gestes cognitifs)
- Intention, l. 2710 :
  > le seuil de défi réglé dans Labo agit sur la couleur des badges « Forces et défis » et sur le défi principal de la carte RàI
- Observation : aucune mention (termes cherchés : « seuil de défi », « defiSpecifique », « badges », « défi principal »)
- Catégorie : 2 · prévu mais pas fait

**6.76** · Geste : lire la section Développement des habiletés (onglets Critères, Forces et défis, Gestes cognitifs)
- Intention, l. 2712 :
  > la section est retirée du profil quand « Développement des habiletés » est décoché dans Labo
- Observation : aucune mention (termes cherchés : « afficherDeveloppementHabiletes », « Développement des habiletés », « décoché »)
- Catégorie : 2 · prévu mais pas fait

**6.77** · Geste : lire les graphiques de progression
- Intention, l. 2717 :
  > la courbe de performance suit la note du cours, semaine par semaine (Standards, sommative, spécifications) ; en dénotation, pas de point
- Observation, l. 2929 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Graphique hebdomadaire mesures C et P avec valeurs : les captures reconstruites contiennent C = P = null ; seul le message vide est atteignable.
- Observation, l. 1931 (Suivi — observation : groupe, liste, profils › Profils individuels › Entrées de la barre latérale) :
  > 1111111 : A = 1 de la 7e à la 15e capture, C et P null (captures P5)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.78** · Geste : lire les graphiques de progression
- Intention, l. 2718 :
  > le graphique par critère garde les niveaux de l'échelle ; il lit l'échelle de chaque évaluation (y compris à trois paliers ou en points)
- Observation : aucune mention (termes cherchés : « niveaux de l'échelle », « graphique-criteres », « trois paliers »)
- Catégorie : 2 · prévu mais pas fait

**6.79** · Geste : lire les graphiques de progression
- Intention, l. 2718 :
  > une valeur non convertible n'est jamais devinée : le point est absent et le graphique dit « n évaluations sans valeur convertible dans cette échelle »
- Observation : aucune mention (termes cherchés : « valeur convertible », « non convertible », « sans valeur »)
- Catégorie : 2 · prévu mais pas fait

**6.80** · Geste : lire les graphiques de progression
- Intention, l. 2719 :
  > quand plusieurs échelles coexistent, le graphique dit laquelle donne les niveaux : « Zones : échelle « … » (n évaluations sur m) »
- Observation : aucune mention (termes cherchés : « Zones : échelle », « plusieurs échelles », « évaluations sur »)
- Catégorie : 2 · prévu mais pas fait

**6.81** · Geste : lire les graphiques de progression
- Intention, l. 2720 :
  > la section « Progression temporelle ACP » est retirée quand « Graphiques d'évolution ACP » est décoché dans Labo
- Observation : aucune mention (termes cherchés : « afficherGraphiques », « Graphiques d'évolution », « Progression temporelle ACP »)
- Catégorie : 2 · prévu mais pas fait

**6.82** · Geste : lire les graphiques de progression
- Intention, l. 2721 :
  > sur le graphique par critère du profil, les niveaux de l'échelle se marquent par des lignes pointillées et des lettres de niveau, sans fond coloré
- Observation : aucune mention (termes cherchés : « pointillé », « lettres de niveau », « fond coloré »)
- Catégorie : 2 · prévu mais pas fait

**6.83** · Geste : lire la section Accompagnement
- Intention, l. 2725 :
  > la carte RàI (palier, défi principal, flèche après chaque critère selon la « Sensibilité des flèches par critère »)
- Observation, l. 1933 (Suivi — observation : groupe, liste, profils › Profils individuels › Entrées de la barre latérale) :
  > pour tou·tes : « Aucune grille de critères n'est désignée pour le dépistage : … Choisis-en une dans Labo → Outils d'observation → « Grille de critères pour le dépistage ». »
- Catégorie : 2 · prévu mais pas fait

**6.84** · Geste : lire la section Accompagnement
- Intention, l. 2726 :
  > l'historique d'accompagnement ne montre que les interventions du groupe où l'on est (celles d'avant le 12 sept. 2026 restent visibles) ; les bilans déjà enregistrés gardent leur valeur
- Observation, l. 2932 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Lien « badge intervention » `[data-action=naviguerVersIntervention]` et historique d'interventions : aucune intervention existante.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.85** · Geste : lire la section Accompagnement
- Intention, l. 2728 :
  > une troisième carte « Observation de la structure » paraît avec l'observation SOLO activée
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > blocs SOLO/RLO (js/profil-etudiant-diagnostics.js, js/actions-rlo.js) : non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.86** · Geste : lire la section Accompagnement
- Intention, l. 2728 :
  > toute la section disparaît si le modèle RàI est désactivé
- Observation : aucune mention (termes cherchés : « activerRai », « modèle RàI », « désactivé »)
- Catégorie : 2 · prévu mais pas fait

**6.87** · Geste : lire la section Accompagnement
- Intention, l. 2729 :
  > la carte RàI dit « En attente » tant que rien n'est à remettre
- Observation : aucune mention (termes cherchés : « En attente », « rien n'est à remettre »)
- Catégorie : 2 · prévu mais pas fait

**6.88** · Geste : ouvrir le volet « Confidentiel » (informations confidentielles)
- Intention, l. 2733 :
  > s'enregistre seul à son changement ; le témoin le dit
- Observation : aucune mention (termes cherchés : « témoin », « Enregistré », « confidentielEtudiants »)
- Catégorie : 2 · prévu mais pas fait

**6.89** · Geste : ouvrir le volet « Confidentiel » (informations confidentielles)
- Intention, l. 2736 :
  > les anciens champs « Portrait de lecteur » peuvent disparaître sans script de purge
- Observation : aucune mention (termes cherchés : « Portrait de lecteur », « portrait », « purge »)
- Catégorie : 2 · prévu mais pas fait

**6.90** · Geste : ouvrir le volet « Confidentiel » (informations confidentielles)
- Intention, l. 2738 :
  > Parcours, Défis particuliers, Diagnostic, Notes personnelles et Notes de présences restent
- Observation : aucune mention (termes cherchés : « Diagnostic », « diagnostic »)
- Catégorie : 2 · prévu mais pas fait

**6.91** · Geste : ouvrir le volet « Confidentiel » (informations confidentielles)
- Intention, l. 2740 :
  > les champs libres du volet sont échappés avant d'entrer dans la page
- Observation : aucune mention (termes cherchés : « échapp », « escape », « HTML »)
- Catégorie : 2 · prévu mais pas fait

**6.92** · Geste : ouvrir le volet « Confidentiel » (informations confidentielles)
- Intention, l. 2741 :
  > le bouton ne porte pas de pastille « a des informations »
- Observation, l. 2935 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Mode anonymisation (masquage des noms, notes confidentielles et notes de rapport) : non activé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.93** · Geste : cliquer « Rapport »
- Intention, l. 2749 :
  > la complétion et l'assiduité du rapport s'écrivent comme au profil (« 8 / 10 », demi-périodes)
- Observation, l. 1953 (Suivi — observation : groupe, liste, profils › Profils individuels › Section Rapport : cases) :
  > Assiduité : 75% (9 / 12 périodes) / Complétion : 100% (2 remises / 2 productions)
- Observation, l. 1929 (Suivi — observation : groupe, liste, profils › Profils individuels › Entrées de la barre latérale) :
  > « Complétion 100% • Productions remises : 2/2 »
- Catégorie : 3 · fait autrement

**6.94** · Geste : cocher des artefacts dans le panneau Portfolio
- Intention, l. 2754 :
  > les cases cochées automatiquement suivent le mode choisi (« N derniers », meilleurs, hybride avec le bloc Obligatoires) ; en hybride, on peut cocher à la main autant d'artefacts que la note en compte ; la note du cours n'en dépend pas
- Observation : aucune mention (termes cherchés : « panneau Portfolio », « artefacts », « Portfolio », « cocher »)
- Catégorie : 2 · prévu mais pas fait

**6.95** · Geste : poser un jugement (section « Jugement », dénotation)
- Intention, l. 2758 :
  > les cibles atteintes cochées, la note et sa justification
- Observation, l. 1914 (Suivi — observation : groupe, liste, profils › Profils individuels › Affichage de l'écran) :
  > Une section « jugement » existe dans le code mais n'est pas affichée avec la pratique SOM
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, […] : non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.96** · Geste : poser un jugement (section « Jugement », dénotation)
- Intention, l. 2759 :
  > la suggestion se lit comme un repère ; une garde dit quand la note ne peut pas encore certifier la réussite
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, […] : non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.97** · Geste : poser un jugement (section « Jugement », dénotation)
- Intention, l. 2760 :
  > les jetons et les jugements de dénotation appartiennent au trimestre, comme les évaluations ; ils ne passent pas d'un trimestre à l'autre
- Observation, l. 1930 (Suivi — observation : groupe, liste, profils › Profils individuels › Entrées de la barre latérale) :
  > `jetonsEtudiants` (clé globale, sans préfixe de trimestre)
- Catégorie : 3 · fait autrement

**6.98** · Geste : poser un jugement (section « Jugement », dénotation)
- Intention, l. 2760 :
  > les jetons et les jugements de dénotation appartiennent au trimestre
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, […] : non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.99** · Geste : poser un jugement (section « Jugement », dénotation)
- Intention, l. 2760 :
  > les jetons et les jugements de dénotation appartiennent au trimestre, comme les évaluations ; ils ne passent pas d'un trimestre à l'autre
- Observation, l. 1930 (Suivi — observation : groupe, liste, profils › Profils individuels › Entrées de la barre latérale) :
  > à la première ouverture pour 1111111, `jetonsEtudiants` (clé globale, sans préfixe de trimestre) : absente → `{"1111111":{}}`
- Observation, l. 1964 (Suivi — observation : groupe, liste, profils › Profils individuels › Liens de navigation du profil) :
  > **Écrit** `jetonsEtudiants` absente → `{"1111111":{}}` (même initialisation que ci-dessus)
- Catégorie : 3 · fait autrement

**6.100** · Geste : lire une note par travail avec la note différée active
- Intention, l. 2764 :
  > un repère « note différée » remplace la note chiffrée de chaque travail (Engagement, Productions, Complétion, Portfolio)
- Observation : aucune mention (termes cherchés : « note différée », « noteDifferee », « repère »)
- Catégorie : 2 · prévu mais pas fait

**6.101** · Sans geste
- Intention, l. 2769 :
  > Les conversions de niveaux du profil lisent l'échelle du trimestre en cours
- Observation : aucune mention (termes cherchés : « échelle du trimestre », « echellesTemplates », « conversion »)
- Catégorie : 2 · prévu mais pas fait

### Écran 55 · Suivi › Saisie des présences

**6.102** · Geste : ouvrir la saisie des présences (chronique 1, dernier geste)
- Intention, l. 2778 :
  > en démonstration, aucun bandeau, une date de séance est proposée et la grille montre les élèves
- Observation : aucune mention (termes cherchés : « démonstration », « demo_presences », « Configuration incomplète »)
- Catégorie : 2 · prévu mais pas fait

**6.103** · Geste : ouvrir la saisie des présences (chronique 1, dernier geste)
- Intention, l. 2779 :
  > deux groupes qui ont cours le même jour à des heures différentes gardent leurs deux séances
- Observation : aucune mention (termes cherchés : « même jour », « deux groupes », « deux séances »)
- Catégorie : 2 · prévu mais pas fait

**6.104** · Geste : ouvrir la saisie des présences (chronique 1, dernier geste)
- Intention, l. 2780 :
  > un élève supprimé n'y paraît plus
- Observation : aucune mention (termes cherchés : « supprimé », « elevesDesinscrits », « désinscrit »)
- Catégorie : 2 · prévu mais pas fait

**6.105** · Geste : ouvrir la saisie des présences (chronique 1, dernier geste)
- Intention, l. 2782 :
  > dans une séance saisie, un élève sans présence enregistrée affiche 0 et « Non saisi·e : compté·e absent·e »
- Observation : aucune mention (termes cherchés : « Non saisi·e », « compté·e absent », « sans présence enregistrée »)
- Catégorie : 2 · prévu mais pas fait

**6.106** · Geste : marquer une absence ou un nombre de périodes (demi-période possible), ou taper une note
- Intention, l. 2787 :
  > avec une recherche qui cache des élèves, marquer l'élève cherché saisit la séance et les élèves non marqués, cachés ou non, comptent présents
- Observation : aucune mention (termes cherchés : « cachés », « recherche », « non marqués »)
- Catégorie : 2 · prévu mais pas fait

**6.107** · Geste : marquer une absence ou un nombre de périodes (demi-période possible), ou taper une note
- Intention, l. 2788 :
  > ce qui est en attente d'écriture part avant tout changement de séance, de sous-groupe, de tri, d'onglet
- Observation : aucune mention (termes cherchés : « changement de séance », « en attente », « Précédent », « Trier par »)
- Catégorie : 2 · prévu mais pas fait

**6.108** · Geste : marquer une absence ou un nombre de périodes (demi-période possible), ou taper une note
- Intention, l. 2790 :
  > la colonne DA montre le DA d'affichage
- Observation, l. 2945 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > Mode anonymisation (champs de notes masqués, `data-masque-anonymisation`) : non activé (relève d'un autre écran).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.109** · Geste : mettre tout le monde présent
- Intention, l. 2794 :
  > la séance est saisie, tout le monde présent
- Observation, l. 1997 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Bouton « ✓ 2 pér. ») :
  > met chaque champ actif à 2 sauf les absences motivées (`facultatif:true` et 0 période)
- Catégorie : 3 · fait autrement

**6.110** · Geste : mettre tout le monde présent
- Intention, l. 2795 :
  > il tient sur une ligne à 1024, 768 et 390 px
- Observation : aucune mention (termes cherchés : « 1024 », « 768 », « 390 », « une ligne »)
- Catégorie : 2 · prévu mais pas fait

**6.111** · Geste : mettre tout le monde présent
- Intention, l. 2796 :
  > l'en-tête de la colonne « Présence » garde son infobulle après le premier affichage d'une séance
- Observation : aucune mention (termes cherchés : « en-tête », « colonne « Présence » », « infobulle »)
- Catégorie : 2 · prévu mais pas fait

**6.112** · Geste : réinitialiser la séance (↻)
- Intention, l. 2806 :
  > (« Annuler » a le focus)
- Observation : aucune mention (termes cherchés : « focus », « Annuler »)
- Catégorie : 2 · prévu mais pas fait

**6.113** · Geste : réinitialiser la séance (↻)
- Intention, l. 2806 :
  > l'infobulle du bouton dit « Réinitialiser (tout le monde absent) »
- Observation : aucune mention (termes cherchés : « Réinitialiser ( », « tout le monde absent », « title »)
- Catégorie : 2 · prévu mais pas fait

**6.114** · Geste : verrouiller ou déverrouiller une date
- Intention, l. 2811 :
  > les dates verrouillées avant 1.133 restent verrouillées dans chacun des groupes (stock repris tel quel, l'ancienne liste intacte)
- Observation : aucune mention (termes cherchés : « 1.133 », « ancienne liste », « datesVerrouillees », « migration »)
- Catégorie : 2 · prévu mais pas fait

**6.115** · Geste : verrouiller ou déverrouiller une date
- Intention, l. 2812 :
  > verrouiller une séance non affichée n'efface aucune présence
- Observation : aucune mention (termes cherchés : « non affichée », « séance non affichée »)
- Catégorie : 2 · prévu mais pas fait

**6.116** · Geste : verrouiller ou déverrouiller une date
- Intention, l. 2812 :
  > un échec d'écriture ne verrouille pas
- Observation : aucune mention (termes cherchés : « échec d'écriture », « échec », « ne verrouille pas »)
- Catégorie : 2 · prévu mais pas fait

**6.117** · Geste : cliquer « Rapport » (grille imprimable des présences)
- Intention, l. 2819 :
  > congés sans colonne ; reprises à leur vraie date
- Observation, l. 2946 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > Congé (`statut:"conge"`) et jour de reprise dans la saisie : aucun dans le calendrier de l'état de départ.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**6.118** · Geste : cliquer « Rapport » (grille imprimable des présences)
- Intention, l. 2821 :
  > la légende imprimée suit le choix
- Observation : aucune mention (termes cherchés : « légende », « legende »)
- Catégorie : 2 · prévu mais pas fait

**6.119** · Geste : cliquer « Rapport » (grille imprimable des présences)
- Intention, l. 2825 :
  > le bouton « Rapport » est dans la barre d'actions de la saisie des présences, juste à gauche de « Confirmer la séance »
- Observation : aucune mention (termes cherchés : « à gauche », « barre d'actions », « ouvrirModaleRapportPresences »)
- Catégorie : 2 · prévu mais pas fait

**6.120** · Geste : prendre les présences sur iPad
- Intention, l. 2833 :
  > au démarrage, quand le stockage du navigateur est presque plein, la saisie attend que le trimestre soit connu et retrouve ses élèves
- Observation : aucune mention (termes cherchés : « presque plein », « stockage plein », « quota »)
- Catégorie : 2 · prévu mais pas fait

**6.121** · Geste : prendre les présences sur iPad
- Intention, l. 2834 :
  > après une mise en arrière-plan, l'application rétablit seule sa liaison
- Observation : aucune mention (termes cherchés : « arrière-plan », « liaison », « visibilitychange »)
- Catégorie : 2 · prévu mais pas fait

**6.122** · Geste : prendre les présences sur iPad
- Intention, l. 2834 :
  > le témoin s'affiche au-dessus du clavier et ne recouvre pas les boutons des présences
- Observation : aucune mention (termes cherchés : « au-dessus du clavier », « clavier », « recouvre »)
- Catégorie : 2 · prévu mais pas fait

**6.123** · Geste : prendre les présences sur iPad
- Intention, l. 2835 :
  > la barre de boutons passe à la ligne sur un écran étroit et reste dans sa carte (360, 768, 1024, 1180 px)
- Observation : aucune mention (termes cherchés : « passe à la ligne », « écran étroit », « 360 », « 1180 »)
- Catégorie : 2 · prévu mais pas fait

**6.124** · Geste : prendre les présences sur iPad
- Intention, l. 2836 :
  > sur l'iPad, les contrôles du Suivi offrent des cibles d'au moins 44 px au doigt, comme ailleurs dans l'application
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

**6.125** · Sans geste
- Intention, l. 2839 :
  > Non documenté dans les sources lues.
- Observation, l. 2787 (Ce qui se produit sans geste de l'utilisateur › Suivi › Groupe, liste, profil) :
  > Après une saisie de présences avec `#suivi-groupe` actif : `setTimeout(chargerTableauBordApercu, 300)`
- Catégorie : 1 · fait sans être prévu

**6.126** · Sans geste
- Intention, l. 2839 :
  > Non documenté dans les sources lues.
- Observation, l. 2795 (Ce qui se produit sans geste de l'utilisateur › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > écouteurs `pagehide`, `beforeunload`, `visibilitychange` (état `hidden`) qui écrivent immédiatement les présences en attente
- Catégorie : 1 · fait sans être prévu

**6.127** · Sans geste
- Intention, l. 2839 :
  > Non documenté dans les sources lues.
- Observation, l. 2796 (Ce qui se produit sans geste de l'utilisateur › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > régénère les séances (`genererSeancesCompletes`), réécrit `a2026_presences_date|groupe|tri` seulement si la valeur change, et recalcule `a2026_indicesAssiduite`
- Catégorie : 1 · fait sans être prévu

**6.128** · Sans geste
- Intention, l. 2839 :
  > Non documenté dans les sources lues.
- Observation, l. 2800 (Ce qui se produit sans geste de l'utilisateur › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > le programme insère un texte dans `#suivi-saisie` ou `#suivi-interventions` si la sous-section « paraît vide » et hors données de démonstration
- Catégorie : 1 · fait sans être prévu

### Fait sans être prévu, sans ligne correspondante dans l'intention

**6.129** · Évaluation › Liste des évaluations et saisie d'une évaluation › Export des résultats › « Exporter la synthèse (CSV) »
- Intention : aucune mention (termes cherchés : « aucun étudiant à exporter », « Aucun résultat »)
- Observation, l. 1434 (Évaluation › Liste des évaluations et saisie d'une évaluation › Export des résultats › « Exporter la synthèse (CSV) ») :
  > Sans étudiant·e : notification « Aucun résultat — Le groupe-cours actif ne contient aucun étudiant à exporter. »
- Catégorie : 1 · fait sans être prévu

**6.130** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran
- Intention : aucune mention (termes cherchés : « Contexte des cartes », « 4 personnes », « personnes »)
- Observation, l. 1786 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > Contexte des cartes : « Automne 2026 | 999-FIC-ZZ | 4 personnes »
- Catégorie : 1 · fait sans être prévu

**6.131** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran
- Intention : aucune mention (termes cherchés : « ±1σ », « écart-type », « r(A↔P) », « μ= »)
- Observation, l. 1787 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > « Assiduité (A) 75% μ=75% | ±1σ: 3/4 (75%) » et « … (r(A↔P) = 0.986) »
- Catégorie : 1 · fait sans être prévu

**6.132** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran
- Intention : aucune mention (termes cherchés : « Pas de données pour cet indice », « « Aucune donnée » »)
- Observation, l. 1790 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > sans captures exploitables le programme affiche « Aucune donnée » / « Pas de données pour cet indice. »
- Catégorie : 1 · fait sans être prévu

**6.133** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran
- Intention : aucune mention (termes cherchés : « aléatoire », « décalage », « Math.random »)
- Observation, l. 1790 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > valeurs = `A_cumulatif` ÷ 100 plus un décalage aléatoire `(Math.random() − 0.5) × 0.03` par étudiant·e
- Observation, l. 2789 (Ce qui se produit sans geste de l'utilisateur › Suivi › Groupe, liste, profil) :
  > Rendu du graphique hebdomadaire : décalage vertical aléatoire par étudiant·e à chaque rendu
- Catégorie : 1 · fait sans être prévu

**6.134** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran
- Intention : aucune mention (termes cherchés : « Aucun production défini », « Crée des productions »)
- Observation, l. 1791 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > Sur l'état de base : « Aucun production défini » / « Crée des productions dans Conception › Productions. »
- Catégorie : 1 · fait sans être prévu

**6.135** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran
- Intention : aucune mention (termes cherchés : « Indices calculés à », « heure du calcul », « heure locale du calcul »)
- Observation, l. 1792 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > `#tdb-horodatage` : « Indices calculés à HH:MM:SS » (heure locale du calcul).
- Catégorie : 1 · fait sans être prévu

**6.136** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Boutons de filtre
- Intention : aucune mention (termes cherchés : « A→Z », « alphabétique », « ordre alphabétique »)
- Observation, l. 1803 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Boutons de filtre) :
  > « A→Z » → ordre alphabétique, aucun compteur.
- Catégorie : 1 · fait sans être prévu

**6.137** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Boutons de filtre
- Intention : aucune mention (termes cherchés : « urgence », « score d'urgence », « score »)
- Observation, l. 1804 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Boutons de filtre) :
  > Tri des retenu·es par score d'urgence : P → 65 − P ; M → borne − min(A, C) ; Suivi → ipb × 30 + 20/10 selon direction ; RàI → niveau × 20
- Catégorie : 1 · fait sans être prévu

**6.138** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Icônes
- Intention : aucune mention (termes cherchés : « fenêtre « Conseil » », « Méthodes de calcul des indices », « primo-aide »)
- Observation, l. 1825 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Icônes) :
  > ouvre `#primo-popup` « Conseil » avec le contenu de la note ciblée (ex. « Méthodes de calcul des indices (pratique active : Sommative)
- Catégorie : 1 · fait sans être prévu

**6.139** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Bouton d'aide
- Intention : aucune mention (termes cherchés : « Aperçu du groupe (indices A-C-P) », « guide ACP », « Les trois indices A-C-P résument »)
- Observation, l. 1829 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Bouton d'aide) :
  > fenêtre « Aperçu du groupe (indices A-C-P) » (« Les trois indices A-C-P résument… », lien « Ouvrir le guide ACP »
- Catégorie : 1 · fait sans être prévu

**6.140** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Sélecteur « Mesure »
- Intention : aucune mention (termes cherchés : « « Mesure » », « sélecteur de mesure », « selecteur-indice-acp »)
- Observation, l. 1832 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Sélecteur « Mesure ») :
  > Sélecteur « Mesure » `#selecteur-indice-acp`
- Observation, l. 1833 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Sélecteur « Mesure ») :
  > A → courbes ci-dessus
- Catégorie : 1 · fait sans être prévu

**6.141** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Sélecteur « Étudiant·e en relief »
- Intention : aucune mention (termes cherchés : « en relief », « Étudiant·e en relief », « épaisseur »)
- Observation, l. 1836 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Sélecteur « Étudiant·e en relief ») :
  > Sélecteur « Étudiant·e en relief » `#selecteur-etudiant-acp`
- Observation, l. 1837 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Sélecteur « Étudiant·e en relief ») :
  > valeur « 2 » → courbe de 3333333 épaisseur 3, autres 1,5
- Catégorie : 1 · fait sans être prévu

**6.142** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Sélecteur « Étudiant·e en relief »
- Intention : aucune mention (termes cherchés : « 👤 », « btn-profil-acp », « ouvrir le profil depuis le graphique »)
- Observation, l. 1837 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Sélecteur « Étudiant·e en relief ») :
  > clic 👤 → sous-section `suivi-profil` active, profil « Essai Fictif-Charlie DA: 3333333 »
- Catégorie : 1 · fait sans être prévu

**6.143** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Trajectoires :
- Intention : aucune mention (termes cherchés : « selecteur-etudiant-trajectoires », « élève en relief », « épaisseur »)
- Observation, l. 1840 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Trajectoires :) :
  > `#selecteur-etudiant-trajectoires`
- Observation, l. 1842 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Trajectoires :) :
  > Étudiant·e 3333333 : courbe épaisseur 3, autres 1,5 ; bouton 👤 affiché
- Catégorie : 1 · fait sans être prévu

**6.144** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Trajectoires :
- Intention : aucune mention (termes cherchés : « Quartile », « Médiane du groupe », « médiane des trajectoires »)
- Observation, l. 1841 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Trajectoires :) :
  > Médiane cochée : séries ajoutées « Quartile 25 % » 0,686 / 0,815, « Quartile 75 % » 0,844 / 0,876, « Médiane du groupe » 0,786 / 0,86
- Catégorie : 1 · fait sans être prévu

**6.145** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Trajectoires :
- Intention : aucune mention (termes cherchés : « Critères : Compréhension », « cases de critères », « traj-cb-crit »)
- Observation, l. 1843 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Trajectoires :) :
  > décocher 3 critères → seule la série « Compréhension » reste
- Catégorie : 1 · fait sans être prévu

**6.146** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Trajectoires :
- Intention : aucune mention (termes cherchés : « 👤 », « btn-profil-trajectoires »)
- Observation, l. 1844 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Trajectoires :) :
  > 👤 : sous-section `suivi-profil`, profil de 3333333
- Catégorie : 1 · fait sans être prévu

**6.147** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Boutons de navigation : « Critères » , « Paramètres d'accompagnement » , « Régler les outils d'observation »
- Intention : aucune mention (termes cherchés : « « Critères » », « bouton Critères », « grille-criteres »)
- Observation, l. 1853 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Boutons de navigation : « Critères » , « Paramètres d'accompagnement » , « Régler les outils d'observation ») :
  > « Critères » (`naviguerVers('conception','grille-criteres')`)
- Observation, l. 1854 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Boutons de navigation : « Critères » , « Paramètres d'accompagnement » , « Régler les outils d'observation ») :
  > sous-sections actives respectivement `conception-grille-criteres`
- Catégorie : 1 · fait sans être prévu

**6.148** · Suivi — observation : groupe, liste, profils › Suivi du groupe › Boutons de navigation : « Critères » , « Paramètres d'accompagnement » , « Régler les outils d'observation »
- Intention : aucune mention (termes cherchés : « Paramètres d'accompagnement », « ouvrirReferenceSoloAccompagnement »)
- Observation, l. 1853 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Boutons de navigation : « Critères » , « Paramètres d'accompagnement » , « Régler les outils d'observation ») :
  > « Paramètres d'accompagnement » (`ouvrirReferenceSoloAccompagnement`)
- Observation, l. 1854 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Boutons de navigation : « Critères » , « Paramètres d'accompagnement » , « Régler les outils d'observation ») :
  > `labo-accompagnement` (défilement vers `#v2-pref-grille-reference` après 80 ms)
- Catégorie : 1 · fait sans être prévu

**6.149** · Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Affichage de l'écran
- Intention : aucune mention (termes cherchés : « personnes », « 4 personnes »)
- Observation, l. 1863 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Affichage de l'écran) :
  > compteur « 4 personnes »
- Catégorie : 1 · fait sans être prévu

**6.150** · Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Filtres
- Intention : aucune mention (termes cherchés : « filtre Programme », « par programme », « filtre-programme »)
- Observation, l. 1879 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Filtres) :
  > `#filtre-programme-liste`
- Observation, l. 1880 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Filtres) :
  > Programme 999.ZZ → 4
- Catégorie : 1 · fait sans être prévu

**6.151** · Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Filtres
- Intention : aucune mention (termes cherchés : « Aucun·e étudiant·e trouvé·e », « Aucun résultat avec les filtres »)
- Observation, l. 1880 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Filtres) :
  > le bloc `#message-aucun-etudiant` affiche « Aucun·e étudiant·e trouvé·e Aucun résultat avec les filtres actuels. » + bouton « Réinitialiser les filtres »
- Catégorie : 1 · fait sans être prévu

**6.152** · Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Boutons « Réinitialiser »
- Intention : aucune mention (termes cherchés : « Réinitialiser les filtres », « reinitialiserFiltresListeEtudiants »)
- Observation, l. 1884 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Boutons « Réinitialiser ») :
  > Boutons « Réinitialiser » `[data-action=reinitialiserFiltresListeEtudiants]` et « Réinitialiser les filtres » `#btn-reset-filtres`
- Observation, l. 1885 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Boutons « Réinitialiser ») :
  > les 4 filtres et la recherche remis à vide, liste de 4 lignes
- Catégorie : 1 · fait sans être prévu

**6.153** · Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Cases « Colonnes »
- Intention : aucune mention (termes cherchés : « colonnes visibles », « cases « Colonnes » », « liste-colonnes »)
- Observation, l. 1888 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Cases « Colonnes ») :
  > Cases « Colonnes » `#liste-colonnes-selecteur input[data-colonne]`
- Observation, l. 1889 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Cases « Colonnes ») :
  > `sessionStorage['liste-colonnes-visibles']` : absent → `{"da":true,…,"performance":false,…,"interv":true}`
- Catégorie : 1 · fait sans être prévu

**6.154** · Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Cases « Colonnes »
- Intention : aucune mention (termes cherchés : « tableau dépasse », « décoche des colonnes »)
- Observation, l. 1890 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Cases « Colonnes ») :
  > message « Le tableau dépasse l'écran — décoche des colonnes ci-dessus pour ajuster la vue. » si débordement
- Catégorie : 1 · fait sans être prévu

**6.155** · Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Cases « En-tête »
- Intention : aucune mention (termes cherchés : « ligne des moyennes », « ligne des corrélations », « chk-entete »)
- Observation, l. 1893 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Cases « En-tête ») :
  > Cases « En-tête » `#chk-entete-moy`, `#chk-entete-corr`
- Observation, l. 1894 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Cases « En-tête ») :
  > `#tr-entete-moy` / `#tr-entete-corr` reçoivent `u-hide`
- Catégorie : 1 · fait sans être prévu

**6.156** · Suivi — observation : groupe, liste, profils › Liste des étudiant·es › `<details>` « Comment lire l'en-tête (moyennes et corrélations) »
- Intention : aucune mention (termes cherchés : « Comment lire l'en-tête », « Comment lire »)
- Observation, l. 1901 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › `<details>` « Comment lire l'en-tête (moyennes et corrélations) ») :
  > `<details>` « Comment lire l'en-tête (moyennes et corrélations) »
- Observation, l. 1902 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › `<details>` « Comment lire l'en-tête (moyennes et corrélations) ») :
  > ouverture/fermeture native du texte d'explication
- Catégorie : 1 · fait sans être prévu

**6.157** · Suivi — observation : groupe, liste, profils › Profils individuels › Affichage de l'écran
- Intention : aucune mention (termes cherchés : « premier », « premier étudiant », « par nom », « sans profil choisi »)
- Observation, l. 1914 (Suivi — observation : groupe, liste, profils › Profils individuels › Affichage de l'écran) :
  > sans profil choisi, ouvre le premier étudiant·e actif·ve par nom
- Observation, l. 2786 (Ce qui se produit sans geste de l'utilisateur › Suivi › Groupe, liste, profil) :
  > Affichage de `#suivi-profil` : après 100 ms, profil de `window.profilActuelDA` ou du premier étudiant·e actif·ve
- Catégorie : 1 · fait sans être prévu

**6.158** · Suivi — observation : groupe, liste, profils › Profils individuels › Sélecteur
- Intention : aucune mention (termes cherchés : « Préc », « Suiv », « précédent », « suivant »)
- Observation, l. 1918 (Suivi — observation : groupe, liste, profils › Profils individuels › Sélecteur) :
  > boutons « ← Préc. » / « Suiv. → »
- Observation, l. 1919 (Suivi — observation : groupe, liste, profils › Profils individuels › Sélecteur) :
  > sur le premier étudiant·e, « ← Préc. » porte `data-param="undefined"`
- Catégorie : 1 · fait sans être prévu

**6.159** · Suivi — observation : groupe, liste, profils › Profils individuels › Entrées de la barre latérale
- Intention : aucune mention (termes cherchés : « Aucun travail soumis », « Importe des travaux », « Travaux soumis »)
- Observation, l. 1934 (Suivi — observation : groupe, liste, profils › Profils individuels › Entrées de la barre latérale) :
  > « Aucun travail soumis Importe des travaux depuis l'onglet Travaux > Import »
- Catégorie : 1 · fait sans être prévu

**6.160** · Suivi — observation : groupe, liste, profils › Profils individuels › Onglets « Critères » / « Forces et défis »
- Intention : aucune mention (termes cherchés : « onglet », « conserv », « mémoris », « Forces et défis »)
- Observation, l. 1939 (Suivi — observation : groupe, liste, profils › Profils individuels › Onglets « Critères » / « Forces et défis ») :
  > `profilOngletDeveloppementActif` (localStorage + IDB, clé globale) : absente → `"forces-defis"` (observé à l'exécution) ; l'onglet est conservé pour les profils suivants
- Catégorie : 1 · fait sans être prévu

**6.161** · Suivi — observation : groupe, liste, profils › Profils individuels › Cases du graphique de progression
- Intention : aucune mention (termes cherchés : « case », « décoch », « masque », « série », « courbe »)
- Observation, l. 1960 (Suivi — observation : groupe, liste, profils › Profils individuels › Cases du graphique de progression) :
  > décocher « Assiduité (A) » puis « Performance (P) » masque ces séries de `graphique-progression-1111111` ; décocher « Analyse » masque cette série de `graphique-criteres-1111111`
- Catégorie : 1 · fait sans être prévu

**6.162** · Suivi — observation : groupe, liste, profils › Profils individuels › Liens de navigation du profil
- Intention : aucune mention (termes cherchés : « Consulter », « consulterEvaluation », « Évaluation non trouvée »)
- Observation, l. 1964 (Suivi — observation : groupe, liste, profils › Profils individuels › Liens de navigation du profil) :
  > « Consulter » `[data-action=consulterEvaluation][data-param=<DA>][data-param2=<prodId>]` (js/profil-etudiant-actions.js:7-70) : section Évaluation, sous-section `evaluations-annoter`, évaluation chargée « Testeur Fictif-Alpha (1111111) Travail Fictif-Zorglub 1 »
- Catégorie : 1 · fait sans être prévu

**6.163** · Suivi — observation : groupe, liste, profils › Profils individuels › Liens de navigation du profil
- Intention : aucune mention (termes cherchés : « Réglages de la pratique », « ouvrirReglagesPratique »)
- Observation, l. 1966 (Suivi — observation : groupe, liste, profils › Profils individuels › Liens de navigation du profil) :
  > « Réglages de la pratique » `[data-action=ouvrirReglagesPratique][data-param=SOM-litterature]` (js/pratiques-gestion.js:2221) : sous-section `conception-pratiques-notation`
- Catégorie : 1 · fait sans être prévu

**6.164** · Suivi — observation : groupe, liste, profils › Profils individuels › Liens de navigation du profil
- Intention : aucune mention (termes cherchés : « date d'absence », « naviguer », « pastille », « vers la saisie »)
- Observation, l. 1967 (Suivi — observation : groupe, liste, profils › Profils individuels › Liens de navigation du profil) :
  > Dates d'absence `[data-action=naviguerVersPresenceAvecDate][data-param=<date>]` (js/profil-etudiant-sections-affichage.js:3287-3300) : sous-section `suivi-saisie`, `#date-cours` = 2026-09-16, `#periodes_3333333` = 1 ; **Écrit** `a2026_presences_date` : "2026-09-30" → "2026-09-16"
- Catégorie : 1 · fait sans être prévu

**6.165** · Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences
- Intention : aucune mention (termes cherchés : « séance de la semaine », « 1re séance », « (2h) »)
- Observation, l. 1983 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences) :
  > « 12 octobre 2026 — 1re séance de la semaine 8 (2h) »
- Catégorie : 1 · fait sans être prévu

**6.166** · Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences
- Intention : aucune mention (termes cherchés : « Présents », « Absents », « Assiduité aujourd », « compteur », « Total »)
- Observation, l. 1983 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences) :
  > « Présents : 4 Absents : 0 Total : 4 Assiduité aujourd'hui : 100% »
- Catégorie : 1 · fait sans être prévu

**6.167** · Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Champ de périodes par étudiant·e
- Intention : aucune mention (termes cherchés : « borne », « max », « ramen », « maximum »)
- Observation, l. 1988 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Champ de périodes par étudiant·e) :
  > Valeur 5 saisie → ramenée à 2 (borne max = périodes de la séance)
- Catégorie : 1 · fait sans être prévu

**6.168** · Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Boutons « ← Précédent »
- Intention : aucune mention (termes cherchés : « Précédent », « Suivant », « séance précédente », « séance suivante »)
- Observation, l. 2018 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Boutons « ← Précédent ») :
  > Boutons « ← Précédent » `#btn-cours-precedent` / « Suivant → » `#btn-cours-suivant`
- Observation, l. 2021 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Boutons « ← Précédent ») :
  > Le bouton « Suivant » n'est pas désactivé au 2026-10-12 (la séance suivante existe, future)
- Catégorie : 1 · fait sans être prévu

**6.169** · Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Boutons « ← Précédent »
- Intention : aucune mention (termes cherchés : « futur », « Date future », « dans le futur »)
- Observation, l. 2021 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Boutons « ← Précédent ») :
  > 2026-10-14 → compteur « Date future », tableau « Cette date est dans le futur ».
- Catégorie : 1 · fait sans être prévu

**6.170** · Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Boutons « ← Précédent »
- Intention : aucune mention (termes cherchés : « Pas de cours », « pas de cours pour ce groupe »)
- Observation, l. 2021 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Boutons « ← Précédent ») :
  > → « Pas de cours pour ce groupe à cette date », tableau vide.
- Catégorie : 1 · fait sans être prévu

**6.171** · Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Boutons « ← Précédent »
- Intention : aucune mention (termes cherchés : « Hors calendrier », « hors du calendrier », « calendrier scolaire »)
- Observation, l. 2021 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Boutons « ← Précédent ») :
  > 2027-01-15 → « Hors calendrier », tableau « Cette date est hors du calendrier scolaire ».
- Catégorie : 1 · fait sans être prévu

**6.172** · Ce qui se produit sans geste de l'utilisateur › Suivi › Groupe, liste, profil
- Intention : aucune mention (termes cherchés : « après une saisie de présences », « chargerTableauBordApercu »)
- Observation, l. 2787 (Ce qui se produit sans geste de l'utilisateur › Suivi › Groupe, liste, profil) :
  > Après une saisie de présences avec `#suivi-groupe` actif : `setTimeout(chargerTableauBordApercu, 300)`
- Catégorie : 1 · fait sans être prévu

**6.173** · Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil
- Intention : aucune mention (termes cherchés : « verrouillage de courbe », « clic sur une courbe », « courbe verrouillée »)
- Observation, l. 2928 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Clic sur une courbe des graphiques Chart.js (verrouillage de courbe)
- Catégorie : 1 · fait sans être prévu

---

## Partie 7 · Suivi : dépistage, interventions, rencontres, animation

### Écran 56 · Le dépistage : ce qu'il calcule (transversal, lu dans le Suivi)

**7.1** · Sans geste
- Intention, l. 2851 :
  > Rien n'est codé en dur du contexte de Grégoire (critères, seuils, vocabulaire d'intervention, établissement)
- Observation, l. 1789 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > niveau 3 si ce pattern ou P < `idme.insuffisant` ; niveau 2 si P < `idme.developpement`
- Observation, l. 2203 (Labo › Outils d'observation) :
  > la lecture des seuils réécrit `seuilsInterpretation` complétée des valeurs par défaut (ajout `"idme":{"insuffisant":0.64,"developpement":0.75,"maitrise":0.85}`
- Catégorie : 3 · fait autrement

**7.2** · Sans geste
- Intention, l. 2852 :
  > Le dépistage situe une moyenne dans les plages de l'échelle de l'utilisateur, plus dans des bornes écrites dans le logiciel
- Observation, l. 1789 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > niveau 3 si ce pattern ou P < `idme.insuffisant` ; niveau 2 si P < `idme.developpement`
- Observation, l. 2203 (Labo › Outils d'observation) :
  > la lecture des seuils réécrit `seuilsInterpretation` complétée des valeurs par défaut (ajout `"idme":{"insuffisant":0.64,"developpement":0.75,"maitrise":0.85}`
- Catégorie : 3 · fait autrement

**7.3** · Sans geste
- Intention, l. 2853 :
  > sans elle, l'application affiche le nom du niveau et dit que l'interprétation SOLO n'est pas configurée
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.4** · Sans geste
- Intention, l. 2856 :
  > Le suivi des fondations ne surveille que les critères multistructurels (les fondations)
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.5** · Sans geste
- Intention, l. 2857 :
  > Un critère réglé « Aucun » compte dans la note seulement : pas de barre, pas de défi, pas de cible d'intervention, pas de surveillance des fondations
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.6** · Sans geste
- Intention, l. 2858 :
  > Un critère noté en points est lu à sa note (22/30 = 73 %), comme les courbes ; barres, persistance des fondations et défi disent le même chiffre
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148) et algorithmiques […] : non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.7** · Sans geste
- Intention, l. 2860 :
  > Une reprise remplace l'originale dans le dépistage aussi (fondations, performance du RàI, moyennes par critère, défi principal)
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.8** · Sans geste
- Intention, l. 2862 :
  > Un critère dont le nom commence par « Français » figure dans forces et défis ; s'il est le plus faible, il devient le défi principal et la cible
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.9** · Sans geste
- Intention, l. 2864 :
  > le dépistage l'annonce et nomme la cause (changelog 1.102) ; une évaluation dont l'échelle a disparu est écartée, l'encadré « Dépistage incomplet » le dit
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.10** · Sans geste
- Intention, l. 2865 :
  > En démonstration, la famille « Défi spécifique » du Suivi du groupe se calcule sur la grille du pack, sans toucher la grille de référence de l'enseignant
- Observation : aucune mention (termes cherchés : « Défi spécifique », « grille du pack », « démonstration », « démo »)
- Catégorie : 2 · prévu mais pas fait

**7.11** · Sans geste
- Intention, l. 2866 :
  > Le suivi des fondations décrit la persistance des difficultés et sa direction, et ne rend plus de palier ; une seule production récente sous le seuil s'écrit « Difficulté récente »
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.12** · Sans geste
- Intention, l. 2867 :
  > Le bilan des fondamentaux du Suivi du groupe écrit « récente » là où il écrivait « émergente »
- Observation : aucune mention (termes cherchés : « bilan des fondamentaux », « fondamentaux », « récente »)
- Catégorie : 2 · prévu mais pas fait

**7.13** · Sans geste
- Intention, l. 2867 :
  > le tableau de l'Aide « Comment interpréter les diagnostics ? » n'a plus de colonne « Niveau RàI » et porte la ligne « En consolidation »
- Observation : aucune mention (termes cherchés : « Comment interpréter les diagnostics », « diagnostics », « En consolidation »)
- Catégorie : 2 · prévu mais pas fait

**7.14** · Sans geste
- Intention, l. 2868 :
  > se dit « En consolidation » (et non plus « Progression lente »)
- Observation : aucune mention (termes cherchés : « En consolidation », « consolidation », « Progression lente », « 1 en consolidation »)
- Catégorie : 2 · prévu mais pas fait

### Écran 57 · Suivi › Profils individuels › Accompagnement : la carte RàI et les niveaux RàI

**7.15** · Sans geste
- Intention, l. 2877 :
  > « Non-participation » (niveau 3) seulement quand un travail est dû ET qu'une copie du groupe est évaluée ; sinon la carte, la cible, la barre RàI du groupe et l'alerte disent « En attente »
- Observation, l. 1789 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > aucune production évaluée → « Données insuffisantes » (niveau 0) ou « Non-participation » (niveau 3) si A > 0 et un travail est échu
- Observation, l. 2063 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › « Planifier une intervention ») :
  > liste des 4 étudiant·es avec badge « Niveau 0 »
- Catégorie : 3 · fait autrement

**7.16** · Sans geste
- Intention, l. 2878 :
  > Un élève jamais présent et sans copie, « En attente », ne compte pas dans la barre des profils d'apprentissage du groupe
- Observation : aucune mention (termes cherchés : « En attente », « jamais présent », « barre des profils »)
- Catégorie : 2 · prévu mais pas fait

**7.17** · Sans geste
- Intention, l. 2879 :
  > La carte nomme le défi principal et place après chaque critère une flèche (→ ou ←, ou un trait sans variation) réglée par la sensibilité des flèches
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.18** · Sans geste
- Intention, l. 2880 :
  > La cible d'intervention nomme la cause : « Difficulté persistante », le nom du critère tiré de la grille de l'utilisateur, et son niveau SOLO configuré
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.19** · Sans geste
- Intention, l. 2882 :
  > quand la fiche porte la remarque « Décrochage », la cible d'intervention de l'élève le nomme comme cause
- Observation : aucune mention (termes cherchés : « Décrochage », « cible d'intervention », « remarque »)
- Catégorie : 2 · prévu mais pas fait

**7.20** · Sans geste
- Intention, l. 2883 :
  > Le signalement du travail diagnostique s'affiche à côté du palier, jamais dedans
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.21** · Sans geste
- Intention, l. 2884 :
  > L'historique d'accompagnement, les graphiques et le compteur de la Liste ne montrent que les interventions du groupe-cours où l'on est
- Observation, l. 2932 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Lien « badge intervention » `[data-action=naviguerVersIntervention]` et historique d'interventions : aucune intervention existante.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 58 · Suivi › Profils individuels › Accompagnement : la carte « Observation de la structure »

**7.22** · Sans geste
- Intention, l. 2900 :
  > Un bloc par niveau de l'échelle de l'utilisateur, avec le nom qu'il a donné au niveau, sa couleur et les critères qui y tombent
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.23** · Sans geste
- Intention, l. 2901 :
  > Les blocs se rangent par borne minimale décroissante, pas dans l'ordre de saisie ; les niveaux non atteints n'apparaissent pas
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.24** · Sans geste
- Intention, l. 2902 :
  > Un niveau étiqueté SOLO porte son interprétation ; sans étiquette, le nom du niveau s'affiche et l'absence est dite une seule fois
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.25** · Sans geste
- Intention, l. 2903 :
  > Sans échelle commune aux évaluations, la carte affiche la cause (aucune évaluation, échelle non résolue, échelles divergentes)
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.26** · Sans geste
- Intention, l. 2904 :
  > Les critères à valeur 0 restent exclus : le 0 est un jugement suspendu, pas une performance
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.27** · Sans geste
- Intention, l. 2905 :
  > Le préstructurel se décrit « Aucun aspect pertinent n'est traité »
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.28** · Sans geste
- Intention, l. 2906 :
  > Le critère de langue y apparaît comme les autres, s'il existe
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 59 · Le dépistage du français en semaine 1 : le travail diagnostique et son signalement

**7.29** · Geste : Cocher la case « Travail diagnostique » (libellé : « … ne compte dans aucun calcul ») sur la fiche du travail
- Intention, l. 2915 :
  > aucune migration ne coche la case pour l'enseignant ; c'est lui qui la coche
- Observation, l. 781 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « + Nouvelle production ») :
  > La case `#productionDiagnostique` n'est pas remise à zéro par ce geste (lu dans le code js/productions-liste.js:229-290 ; observé : après une production cochée « diagnostique », les 4 productions créées ensuite ont `diagnostique: true`).
- Catégorie : 3 · fait autrement

**7.30** · Geste : Cocher la case « Travail diagnostique » (libellé : « … ne compte dans aucun calcul ») sur la fiche du travail
- Intention, l. 2916 :
  > le travail ne pèse ni sur la note finale, ni sur la performance (P), ni sur la complétion (C), ni sur la fenêtre des patterns et le palier RàI
- Observation, l. 2938 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > `js/entites/production-diagnostique.js` : aucun élément interactif propre ; utilisés par les calculs (lu dans le code)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.31** · Geste : Cocher la case « Travail diagnostique » (libellé : « … ne compte dans aucun calcul ») sur la fiche du travail
- Intention, l. 2917 :
  > il ne déclenche plus le verdict « Non-participation » (niveau 3) en première semaine
- Observation, l. 2938 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > `js/entites/production-diagnostique.js` : aucun élément interactif propre ; utilisés par les calculs (lu dans le code)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.32** · Geste : Cocher la case « Travail diagnostique » (libellé : « … ne compte dans aucun calcul ») sur la fiche du travail
- Intention, l. 2918 :
  > il reste entier dans le dossier de l'élève : copie, annotation, rétroaction, résultat
- Observation, l. 2938 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > `js/entites/production-diagnostique.js` : aucun élément interactif propre ; utilisés par les calculs (lu dans le code)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.33** · Geste : Cocher la case « Travail diagnostique » (libellé : « … ne compte dans aucun calcul ») sur la fiche du travail
- Intention, l. 2919 :
  > il ne figure plus parmi les travaux évalués du profil et du PDF ; la ligne « Sélection » dit « 1 retenue sur 4 possibles »
- Observation, l. 2938 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > `js/entites/production-diagnostique.js` : aucun élément interactif propre ; utilisés par les calculs (lu dans le code)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.34** · Geste : Cocher la case « Travail diagnostique » (libellé : « … ne compte dans aucun calcul ») sur la fiche du travail
- Intention, l. 2920 :
  > sur la fiche, la case reste à gauche avec la pondération
- Observation : aucune mention (termes cherchés : « productionDiagnostique », « Travail diagnostique », « à gauche », « pondération »)
- Catégorie : 2 · prévu mais pas fait

**7.35** · Geste : Cocher « ce palier lève un signalement » sur un palier de projection, et écrire la phrase du signalement
- Intention, l. 2924 :
  > le déclencheur est une case sur le palier, jamais un seuil écrit dans le logiciel
- Observation : aucune mention (termes cherchés : « ce palier lève un signalement », « lève un signalement », « palier de projection », « Risqué »)
- Catégorie : 2 · prévu mais pas fait

**7.36** · Geste : Cocher « ce palier lève un signalement » sur un palier de projection, et écrire la phrase du signalement
- Intention, l. 2925 :
  > tant qu'il est vide, aucun signalement ne se lève, même sur un palier coché
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.37** · Geste : Cocher « ce palier lève un signalement » sur un palier de projection, et écrire la phrase du signalement
- Intention, l. 2926 :
  > le gabarit d'exemple « critères EUF » coche « Risqué » et « Échec » et porte la phrase « Aide en français recommandée »
- Observation : aucune mention (termes cherchés : « critères EUF », « Aide en français recommandée », « Risqué », « Échec »)
- Catégorie : 2 · prévu mais pas fait

**7.38** · Geste : Cocher « ce palier lève un signalement » sur un palier de projection, et écrire la phrase du signalement
- Intention, l. 2927 :
  > le signalement apparaît à côté du palier RàI de l'élève et dans la vue du groupe, avec le nombre d'élèves concernés
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.39** · Geste : Cocher « ce palier lève un signalement » sur un palier de projection, et écrire la phrase du signalement
- Intention, l. 2928 :
  > il se lève automatiquement dès le palier « Risqué » coché
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.40** · Geste : Cocher « ce palier lève un signalement » sur un palier de projection, et écrire la phrase du signalement
- Intention, l. 2929 :
  > rien n'est écrit sur la copie de l'élève
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.41** · Geste : Cocher « ce palier lève un signalement » sur un palier de projection, et écrire la phrase du signalement
- Intention, l. 2930 :
  > depuis le signalement, un geste ouvre une intervention pour l'élève
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.42** · Sans geste
- Intention, l. 2934 :
  > Le signalement ne se stocke pas : il se recalcule à chaque lecture, donc décocher un palier le fait disparaître partout
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.43** · Sans geste
- Intention, l. 2935 :
  > Une copie encore en brouillon ne lève pas de signalement ; il paraît quand la copie est enregistrée
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.44** · Sans geste
- Intention, l. 2936 :
  > Le signalement reste distinct de la mesure d'aide inscrite sur la fiche de l'élève
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage […] bouton « Ouvrir une intervention » de signalement, blocs SOLO/RLO […] : non affichés sans grille de critères de dépistage désignée
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 60 · Suivi › Interventions

**7.45** · Sans geste
- Intention, l. 2942 :
  > La liste ne montre que les interventions du groupe-cours actif ; en mode cours (tous les groupes), toutes
- Observation : aucune mention (termes cherchés : « interventions du groupe-cours actif », « mode cours », « avant le 12 sept », « filtr »)
- Catégorie : 2 · prévu mais pas fait

**7.46** · Sans geste
- Intention, l. 2943 :
  > Une intervention sait dans quel groupe-cours elle est née
- Observation, l. 2070 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › « Créer l'intervention ») :
  > `groupeCoursId` reçoit `infoCours._groupeCoursId || infoCours.id` (js/modes.js:372-376), ici l'id du cours.
- Catégorie : 3 · fait autrement

**7.47** · Sans geste
- Intention, l. 2943 :
  > une ancienne prend son contexte au prochain enregistrement, sous le groupe-cours actif, jamais par réécriture en masse
- Observation : aucune mention (termes cherchés : « ancienne intervention », « prend son contexte », « réécriture en masse », « sans groupe-cours »)
- Catégorie : 2 · prévu mais pas fait

**7.48** · Sans geste
- Intention, l. 2944 :
  > Un vieux brouillon resté en base d'avant 1.139 n'est ni affiché, ni compté, ni effacé
- Observation : aucune mention (termes cherchés : « vieux brouillon », « 1.139 », « brouillon »)
- Catégorie : 2 · prévu mais pas fait

**7.49** · Sans geste
- Intention, l. 2945 :
  > une rencontre de service y paraît « Hors classe · Niveau 3 »
- Observation : aucune mention (termes cherchés : « Hors classe », « Hors classe · Niveau 3 »)
- Catégorie : 2 · prévu mais pas fait

**7.50** · Sans geste
- Intention, l. 2946 :
  > Le titre, la description et les observations d'une intervention sont échappés avant d'entrer dans la page
- Observation : aucune mention (termes cherchés : « échappé », « échappement », « escape », « innerHTML »)
- Catégorie : 2 · prévu mais pas fait

**7.51** · Sans geste
- Intention, l. 2947 :
  > En mode anonymisation, les textes et notes des interventions sont masqués (« Masqué en anonymisation ») et le titre devient « Intervention du » suivi de la date
- Observation, l. 2945 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > Mode anonymisation (champs de notes masqués, `data-masque-anonymisation`) : non activé (relève d'un autre écran).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.52** · Sans geste
- Intention, l. 2949 :
  > Exemples gris du formulaire : titre « Ex. Intervention sur deux critères ciblés » ; objectif « Ex. Amener un critère au seuil visé »
- Observation : aucune mention (termes cherchés : « Ex. Intervention sur deux critères ciblés », « Ex. Amener un critère au seuil visé », « placeholder », « exemple gris »)
- Catégorie : 2 · prévu mais pas fait

**7.53** · Geste : Cliquer « Planifier une intervention » (créer)
- Intention, l. 2956 :
  > au retour, la création en cours est toujours à l'écran
- Observation, l. 2799 (Ce qui se produit sans geste de l'utilisateur › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > pose un `MutationObserver` sur toutes les `.sous-section` qui réaffiche la liste quand `#suivi-interventions` devient active
- Catégorie : 3 · fait autrement

**7.54** · Geste : Modifier une intervention existante
- Intention, l. 2962 :
  > ce que le formulaire ne montre pas est conservé : la note d'un élève décoché reste, les participants d'un autre groupe-cours restent
- Observation : aucune mention (termes cherchés : « élève décoché », « décoché », « participants d'un autre groupe-cours »)
- Catégorie : 2 · prévu mais pas fait

**7.55** · Geste : Modifier une intervention existante
- Intention, l. 2964 :
  > sur un échec, « Non enregistré » suivi du geste et de la raison ; une intervention introuvable le dit au lieu d'annoncer une réussite
- Observation : aucune mention (termes cherchés : « Non enregistré », « introuvable », « intervention introuvable »)
- Catégorie : 2 · prévu mais pas fait

**7.56** · Geste : Cocher les critères ciblés
- Intention, l. 2968 :
  > les critères en défi sont proposés
- Observation, l. 2947 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > critères ciblés et objectif suggéré (aucune grille de référence ni évaluation dans l'état de départ : « Suggérer » vide le champ)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.57** · Geste : Cocher les critères ciblés
- Intention, l. 2969 :
  > un critère « Aucun » n'est jamais proposé comme cible
- Observation, l. 2947 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > critères ciblés et objectif suggéré (aucune grille de référence ni évaluation dans l'état de départ : « Suggérer » vide le champ)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.58** · Geste : Cliquer « Suggérer » (objectif visé)
- Intention, l. 2973 :
  > la phrase dit le pourcentage visé sans nommer de niveau de l'échelle
- Observation, l. 2947 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > critères ciblés et objectif suggéré (aucune grille de référence ni évaluation dans l'état de départ : « Suggérer » vide le champ)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.59** · Geste : Cliquer « Suggérer » (objectif visé)
- Intention, l. 2974 :
  > les objectifs déjà enregistrés gardent leur ancienne phrase
- Observation, l. 2947 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > critères ciblés et objectif suggéré (aucune grille de référence ni évaluation dans l'état de départ : « Suggérer » vide le champ)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.60** · Geste : Lire le bilan avant / après d'une intervention complétée
- Intention, l. 2978 :
  > la note écrite pour un élève qui n'est plus dans le groupe reste visible, grisée, avec son nom (ou son DA s'il n'est plus au trimestre) suivi de « (n'est plus dans le groupe) »
- Observation : aucune mention (termes cherchés : « n'est plus dans le groupe », « grisée », « Notes individuelles »)
- Catégorie : 2 · prévu mais pas fait

**7.61** · Geste : Lire le bilan avant / après d'une intervention complétée
- Intention, l. 2979 :
  > les interventions déjà enregistrées gardent leur bilan
- Observation, l. 2947 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > tableau « Avant / Après » du bilan (`snapshotAvant` sans critères)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.62** · Geste : Lire le bilan avant / après d'une intervention complétée
- Intention, l. 2980 :
  > le bilan avant / après dit le pourcentage seulement, sans lettre
- Observation, l. 2947 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > tableau « Avant / Après » du bilan (`snapshotAvant` sans critères)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.63** · Geste : Lire le bilan avant / après d'une intervention complétée
- Intention, l. 2981 :
  > les seuils d'alerte restent gelés jusqu'aux usages d'octobre
- Observation : aucune mention (termes cherchés : « seuils d'alerte », « gelés », « alerte »)
- Catégorie : 2 · prévu mais pas fait

**7.64** · Geste : Marquer une intervention « Complétée »
- Intention, l. 2988 :
  > une intervention de type MIO n'a ni question ni case et n'écrit pas de présences
- Observation, l. 2947 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > contexte « mio » (option absente du sélecteur, lue dans le code js/interventions.js:1166-1169)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.65** · Geste : Marquer une intervention « Complétée »
- Intention, l. 2991 :
  > quand on ajoute un participant à une intervention complétée, ou qu'on corrige sa date, l'application explique le report des présences et demande s'il faut le faire
- Observation : aucune mention (termes cherchés : « ajoute un participant », « corrige sa date », « report des présences », « Reporter les présences »)
- Catégorie : 2 · prévu mais pas fait

**7.66** · Geste : Supprimer une intervention
- Intention, l. 2995 :
  > si le codex n'est pas à jour, une fenêtre « Mettre ton codex à jour avant de supprimer ? »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, […]) : […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.67** · Sans geste, ailleurs que dans ce sous-onglet
- Intention, l. 3004 :
  > rien ne s'ajoute sans reprise qui change P
- Observation, l. 2288 (Labo › Études) :
  > « P contrôle » (moyenne P des élèves sans intervention, axe %) 63,4 → 77,6 ; « P sans reprises · contrôle » identique
- Catégorie : 3 · fait autrement

**7.68** · Sans geste, ailleurs que dans ce sous-onglet
- Intention, l. 3005 :
  > Une intervention datée après la dernière séance n'a pas de point tant qu'aucune séance ne la suit
- Observation : aucune mention (termes cherchés : « dernière séance », « courbe d'intervention », « pas de point », « début du trimestre »)
- Catégorie : 2 · prévu mais pas fait

### Écran 61 · Suivi › Rencontres

**7.69** · Sans geste
- Intention, l. 3014 :
  > puis la porte « Créer un service »
- Observation, l. 2099 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › Affichage avec un cours d'enseignement actif (état de départ)) :
  > « Tu es orthopédagogue et tu reçois des élèves hors d'un groupe-cours ? Créer un service d'orthopédagogie »
- Catégorie : 3 · fait autrement

**7.70** · Sans geste
- Intention, l. 3015 :
  > Si un service existe déjà dans le trimestre : « Un service existe déjà dans ce trimestre. Active-le pour tenir tes rencontres : » et le nom du service en lien
- Observation, l. 2948 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > bouton `activerServiceRencontres` (aucun service préexistant)
- Observation, l. 2099 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › Affichage avec un cours d'enseignement actif (état de départ)) :
  > (lu dans le code, js/rencontres.js:58-88 ; non présent dans l'état de départ)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.71** · Sans geste
- Intention, l. 3018 :
  > Sans rendez-vous à venir : « Aucun rendez-vous à venir. Tes rencontres passées restent dans la liste ci-dessous. »
- Observation : aucune mention (termes cherchés : « Aucun rendez-vous à venir », « rencontres passées »)
- Catégorie : 2 · prévu mais pas fait

**7.72** · Sans geste
- Intention, l. 3020 :
  > Une rencontre née dans un autre service n'apparaît pas
- Observation : aucune mention (termes cherchés : « autre service », « née dans un autre service »)
- Catégorie : 2 · prévu mais pas fait

**7.73** · Sans geste
- Intention, l. 3021 :
  > si l'on était sur « Interventions » en passant au service, on arrive sur « Rencontres »
- Observation : aucune mention (termes cherchés : « en passant au service », « on arrive sur « Rencontres » », « redirig »)
- Catégorie : 2 · prévu mais pas fait

**7.74** · Sans geste
- Intention, l. 3022 :
  > Non tranché : la fusion des sous-onglets Interventions et Rencontres se rejuge après le mois d'usage de l'orthopédagogue
- Observation : rien de cité
- Catégorie : 4 · non comparable (Non tranché)

**7.75** · Geste : Entrer par l'accueil (« Tu es orthopédagogue ? » › « Commencer → »)
- Intention, l. 3026 :
  > dit « Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre. »
- Observation : aucune mention (termes cherchés : « Décris ton service », « la liste de tes étudiant·es », « les dates de ton trimestre »)
- Catégorie : 2 · prévu mais pas fait

**7.76** · Geste : Entrer par l'accueil (« Tu es orthopédagogue ? » › « Commencer → »)
- Intention, l. 3027 :
  > sans trimestre, on arrive sur les trois questions
- Observation, l. 2948 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > Rencontres : écran sans trimestre actif (création de trimestre)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.77** · Geste : Décrire son service (les trois questions) et cliquer « Créer mon service d'orthopédagogie »
- Intention, l. 3033 :
  > ou la ligne Omnivox collée
- Observation, l. 2948 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > import Omnivox à ≥ 4 colonnes commençant par un DA
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.78** · Geste : Décrire son service (les trois questions) et cliquer « Créer mon service d'orthopédagogie »
- Intention, l. 3037 :
  > en démonstration, le service créé est retiré quand on quitte la démonstration
- Observation : aucune mention (termes cherchés : « service », « démonstration », « Quitter la démo », « desactiverModeDemo »)
- Catégorie : 2 · prévu mais pas fait

**7.79** · Geste : Décrire son service (les trois questions) et cliquer « Créer mon service d'orthopédagogie »
- Intention, l. 3038 :
  > une notification « Service créé », avec le nombre d'élèves ajoutés
- Observation, l. 2115 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer mon service d'orthopédagogie ») :
  > « Service d'orthopédagogie créé — 2 élèves ajoutés, 1 déjà présent (1 sans DA : numéro provisoire).
- Catégorie : 3 · fait autrement

**7.80** · Geste : Décrire son service (les trois questions) et cliquer « Créer mon service d'orthopédagogie »
- Intention, l. 3040 :
  > déjà inscrit à un cours du trimestre, il peut aussi entrer dans un service
- Observation, l. 2110 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer mon service d'orthopédagogie ») :
  > la ligne 3333333 n'est pas ajoutée (DA déjà présent dans le trimestre)
- Observation, l. 2115 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer mon service d'orthopédagogie ») :
  > 1 déjà présent
- Observation, l. 2120 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « + Nouvelle rencontre », « Créer la rencontre », « Fermer », « Supprimer » (contexte service)) :
  > liste « Participants et notes » des 2 élèves du service
- Catégorie : 3 · fait autrement

**7.81** · Geste : Décrire son service (les trois questions) et cliquer « Créer mon service d'orthopédagogie »
- Intention, l. 3041 :
  > à l'inscription dans un service, le numéro de groupe d'origine n'est pas gardé
- Observation : aucune mention (termes cherchés : « numéro de groupe d'origine », « groupe d'origine »)
- Catégorie : 2 · prévu mais pas fait

**7.82** · Geste : Créer une rencontre (« + Nouvelle rencontre »)
- Intention, l. 3046 :
  > le sous-titre du bilan dit « Ce que tu retiens de la rencontre. »
- Observation : aucune mention (termes cherchés : « Ce que tu retiens de la rencontre », « sous-titre du bilan »)
- Catégorie : 2 · prévu mais pas fait

**7.83** · Geste : Créer une rencontre (« + Nouvelle rencontre »)
- Intention, l. 3047 :
  > une rencontre qui porte déjà des critères ciblés ou un objectif les garde à l'enregistrement
- Observation : aucune mention (termes cherchés : « critères ciblés », « masquée », « objectif »)
- Catégorie : 2 · prévu mais pas fait

**7.84** · Geste : Créer une rencontre (« + Nouvelle rencontre »)
- Intention, l. 3049 :
  > la question de sortie dit « Cette rencontre n'est pas encore créée. »
- Observation : aucune mention (termes cherchés : « Cette rencontre n'est pas encore créée », « pas encore créée »)
- Catégorie : 2 · prévu mais pas fait

**7.85** · Geste : Consulter les rencontres d'un élève
- Intention, l. 3060 :
  > le profil, le volet confidentiel et le rapport de chaque élève du service s'ouvrent comme pour un cours
- Observation : aucune mention (termes cherchés : « profil », « élève du service », « volet confidentiel »)
- Catégorie : 2 · prévu mais pas fait

**7.86** · Geste : Consulter les rencontres d'un élève
- Intention, l. 3061 :
  > sur un service, les boutons du profil qui mènent aux interventions ouvrent encore la vue « Interventions », sans onglet
- Observation : aucune mention (termes cherchés : « sans onglet », « naviguerVersNouvelleIntervention », « service »)
- Catégorie : 2 · prévu mais pas fait

**7.87** · Ce qui reste manuel, et ce qui n'est pas tranché
- Intention, l. 3067 :
  > Un service sans pratique de notation ne produit pas de note
- Observation : aucune mention (termes cherchés : « pratique de notation », « service », « note »)
- Catégorie : 2 · prévu mais pas fait

**7.88** · Ce qui reste manuel, et ce qui n'est pas tranché
- Intention, l. 3068 :
  > sur un service, l'assiduité et la complétion restent muettes et la carte RàI ne s'affiche pas
- Observation : aucune mention (termes cherchés : « carte RàI », « service », « muettes »)
- Catégorie : 2 · prévu mais pas fait

**7.89** · Ce qui reste manuel, et ce qui n'est pas tranché
- Intention, l. 3069 :
  > sur un service, un rendez-vous manqué vaut une absence
- Observation : aucune mention (termes cherchés : « rendez-vous manqué », « manqué », « absence »)
- Catégorie : 2 · prévu mais pas fait

**7.90** · Ce qui reste manuel, et ce qui n'est pas tranché
- Intention, l. 3070 :
  > Non tranché : le sens de l'assiduité et de la complétion sur un service
- Observation, l. 2127 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › Saisie des présences dans un contexte service (pour mémoire)) :
  > Ce service n'a pas d'horaire : la présence se note dans la rencontre (Suivi › Rencontres).
- Catégorie : 4 · non comparable (Non tranché)

**7.91** · Ce qui reste manuel, et ce qui n'est pas tranché
- Intention, l. 3071 :
  > Non tranché : afficher ou non la carte RàI d'un élève de service
- Observation : rien de cité
- Catégorie : 4 · non comparable (Non tranché)

**7.92** · Ce qui reste manuel, et ce qui n'est pas tranché
- Intention, l. 3073 :
  > le calendrier du trimestre montre, par date, les rencontres d'un service, en vue mensuelle
- Observation : aucune mention (termes cherchés : « calendrier », « rencontres », « vue mensuelle »)
- Catégorie : 2 · prévu mais pas fait

**7.93** · Ce qui reste manuel, et ce qui n'est pas tranché
- Intention, l. 3074 :
  > le formulaire de rencontre dit « Durée (périodes) », et l'aperçu garde le bouton « Guide RàI » et les cartes « Patterns d'apprentissage / Niveaux RàI »
- Observation : aucune mention (termes cherchés : « Durée (périodes) », « périodes », « Patterns d'apprentissage »)
- Catégorie : 2 · prévu mais pas fait

**7.94** · Ce qui reste manuel, et ce qui n'est pas tranché
- Intention, l. 3075 :
  > les rencontres et le volet confidentiel d'un élève suivent sa fiche d'un trimestre à l'autre
- Observation, l. 40 (Stockage (vue d'ensemble)) :
  > Les clés propres à un trimestre portent un préfixe `<session><année>_`
- Observation, l. 2054 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions) :
  > Clé : `a2026_interventions`
- Observation, l. 1945 (Suivi — observation : groupe, liste, profils › Profils individuels › Bouton « Confidentiel ») :
  > **Écrit** `a2026_confidentielEtudiants`
- Catégorie : 3 · fait autrement

**7.95** · Ce qui reste manuel, et ce qui n'est pas tranché
- Intention, l. 3076 :
  > Le transfert (dissertations, PFR, EUF) se fait hors application, à la main
- Observation, l. 7 (Conditions d'observation) :
  > Programme : application web d'une seule page
- Catégorie : 4 · non comparable (hors de la copie observée)

### Écran 62 · Suivi › Animation

**7.96** · Sans geste
- Intention, l. 3082 :
  > L'Animation est projetée en classe : c'est le seul écran que les élèves regardent
- Observation, l. 7 (Conditions d'observation) :
  > Programme : application web d'une seule page
- Catégorie : 4 · non comparable (hors de la copie observée)

**7.97** · Sans geste
- Intention, l. 3083 :
  > Sous le titre : « Outils pour animer la classe : questions flash, tirage au sort et équipes. »
- Observation : aucune mention (termes cherchés : « Outils pour animer la classe », « animer la classe »)
- Catégorie : 2 · prévu mais pas fait

**7.98** · Sans geste
- Intention, l. 3085 :
  > Partout, « étudiant·es », pas « élèves », accordé selon le nombre
- Observation, l. 2147 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Modale « Paramètres du tirage ») :
  > « Avec remise (un même étudiant peut être tiré plusieurs fois) », « Étudiants du groupe (0/4 disponibles) »
- Catégorie : 3 · fait autrement

**7.99** · Sans geste
- Intention, l. 3087 :
  > Les noms de la fenêtre du tirage et le texte des questions sont échappés avant d'entrer dans la page
- Observation : aucune mention (termes cherchés : « échappé », « échappement », « escape », « innerHTML »)
- Catégorie : 2 · prévu mais pas fait

**7.100** · Geste : Tirer au sort un·e étudiant·e
- Intention, l. 3092 :
  > en mode anonymisation, les noms projetés sont anonymes
- Observation, l. 2945 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > Mode anonymisation (champs de notes masqués, `data-masque-anonymisation`) : non activé (relève d'un autre écran).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**7.101** · Geste : Tirer au sort un·e étudiant·e
- Intention, l. 3093 :
  > pas de remise à zéro automatique
- Observation, l. 2132 (Suivi : saisie des présences, interventions, rencontres, animation › Animation) :
  > Si `coursId` enregistré ≠ `infoCours.id`, `dejaTires` et `exclus` sont vidés (js/boite-outils.js:71-77).
- Observation, l. 2802 (Ce qui se produit sans geste de l'utilisateur › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > aussi appelées au changement de groupe-cours (js/trimestre-v2-orchestre.js:224-229)
- Catégorie : 3 · fait autrement

**7.102** · Geste : Tirer au sort un·e étudiant·e
- Intention, l. 3094 :
  > quand le groupe est épuisé, un bouton « Réinitialiser » paraît à côté du tirage, avec une infobulle qui le dit
- Observation, l. 2143 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Tirage au sort : « Tirer ! ») :
  > à 0, bouton désactivé
- Observation, l. 2147 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Modale « Paramètres du tirage ») :
  > modale insérée dans `body` : « Nombre d'étudiant·es à tirer » (1 à 5), […] boutons « Réinitialiser », « Annuler », « Appliquer »
- Catégorie : 3 · fait autrement

**7.103** · Geste : Tirer au sort un·e étudiant·e
- Intention, l. 3094 :
  > l'état du tirage est gardé par groupe-cours et par trimestre
- Observation, l. 2132 (Suivi : saisie des présences, interventions, rencontres, animation › Animation) :
  > `etatTirage` (clé non préfixée par trimestre)
- Observation, l. 2132 (Suivi : saisie des présences, interventions, rencontres, animation › Animation) :
  > Si `coursId` enregistré ≠ `infoCours.id`, `dejaTires` et `exclus` sont vidés
- Catégorie : 3 · fait autrement

**7.104** · Geste : Tirer au sort un·e étudiant·e
- Intention, l. 3094 :
  > l'état du tirage est gardé par groupe-cours et par trimestre
- Observation, l. 2113 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer mon service d'orthopédagogie ») :
  > nouvelles clés `seancesCompletes_gc_GC_1791924394262_2_84233da2e440` = `{}` et `etatTirage` = `{exclus:[], dejaTires:[], avecRemise:false, nombreATirer:1, coursId:<service>}`
- Catégorie : 3 · fait autrement

**7.105** · Geste : Tirer au sort un·e étudiant·e
- Intention, l. 3094 :
  > l'état du tirage est gardé par groupe-cours et par trimestre
- Observation, l. 2132 (Suivi : saisie des présences, interventions, rencontres, animation › Animation) :
  > **Écrit** : `etatTirage` (clé non préfixée par trimestre) : absente →
- Catégorie : 3 · fait autrement

**7.106** · Geste : Former les équipes
- Intention, l. 3105 :
  > groupe vide : « Aucun·e étudiant·e dans le groupe actif. »
- Observation : aucune mention (termes cherchés : « Aucun·e étudiant·e dans le groupe actif », « groupe vide »)
- Catégorie : 2 · prévu mais pas fait

**7.107** · Geste : Retenir ces équipes ; oublier les équipes retenues
- Intention, l. 3115 :
  > Données : « Oublier les équipes retenues » : non documenté au-delà du libellé.
- Observation, l. 2181 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Équipes) :
  > **Écrit** : suppression de la clé `equipesAnimation_…` (localStorage et IndexedDB) ; la mention disparaît, les équipes affichées restent
- Catégorie : 1 · fait sans être prévu

### Fait sans être prévu, sans ligne correspondante dans l'intention

**7.108** · Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Affichage de la sous-section
- Intention : aucune mention (termes cherchés : « Aucune intervention planifiée », « état vide », « bannière », « signaux du tableau de bord »)
- Observation, l. 2057 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Affichage de la sous-section) :
  > bannière « Aucune intervention planifiée. Les interventions RàI de niveaux 2 (préventif) et 3 (intensif) se créent à partir des signaux du tableau de bord. … » (js/etats-vides.js:83-85, insérée 350 ms après `sectionAffichee`)
- Observation, l. 2800 (Ce qui se produit sans geste de l'utilisateur › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > 350 ms après `sectionAffichee`, le programme insère un texte dans `#suivi-saisie` ou `#suivi-interventions` si la sous-section « paraît vide » et hors données de démonstration
- Catégorie : 1 · fait sans être prévu

**7.109** · Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Affichage de la sous-section
- Intention : aucune mention (termes cherchés : « Aucune intervention planifiée ou complétée », « aucune intervention », « liste vide »)
- Observation, l. 2057 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Affichage de la sous-section) :
  > texte « Aucune intervention planifiée ou complétée. »
- Catégorie : 1 · fait sans être prévu

**7.110** · Suivi : saisie des présences, interventions, rencontres, animation › Interventions › « Planifier une intervention »
- Intention : aucune mention (termes cherchés : « Gestion des absences », « préremplie », « Séance concernée »)
- Observation, l. 2066 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › « Planifier une intervention ») :
  > Contexte « rattrapage » : bloc « Gestion des absences » affiché, « Séance concernée » préremplie avec la date (2026-10-12)
- Catégorie : 1 · fait sans être prévu

**7.111** · Suivi : saisie des présences, interventions, rencontres, animation › Interventions › « Planifier une intervention »
- Intention : aucune mention (termes cherchés : « sans critère ciblé », « objectif vidé », « vide le champ »)
- Observation, l. 2067 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › « Planifier une intervention ») :
  > « Suggérer » (`suggererObjectifIntervention`, js/interventions.js:1030-1081) : sans critère ciblé, le champ objectif est vidé
- Catégorie : 1 · fait sans être prévu

**7.112** · Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Modification d'un champ de fiche existante
- Intention : aucune mention (termes cherchés : « hors-classe », « change le contexte », « niveau RàI change »)
- Observation, l. 2075 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Modification d'un champ de fiche existante) :
  > niveau 3 → `type:"individuel"`, `niveauRai:3`, `contexte:"hors-classe"`, `seanceConcernee:null`, `marquerNonParticipantsMotives:false`
- Catégorie : 1 · fait sans être prévu

**7.113** · Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Statut « Complétée »
- Intention : aucune mention (termes cherchés : « Durée de l'intervention manquante », « durée manquante »)
- Observation, l. 2081 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Statut « Complétée ») :
  > durée ≤ 0 → notification d'erreur « Durée de l'intervention manquante »
- Catégorie : 1 · fait sans être prévu

**7.114** · Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Liste : « Ouvrir » / « Fermer » / « Supprimer »
- Intention : aucune mention (termes cherchés : « présences reportées », « supprimer une intervention », « retirées des présences »)
- Observation, l. 2091 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Liste : « Ouvrir » / « Fermer » / « Supprimer ») :
  > Les entrées déjà reportées dans `a2026_presences` ne sont pas retirées
- Catégorie : 1 · fait sans être prévu

**7.115** · Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer un service d'orthopédagogie »
- Intention : aucune mention (termes cherchés : « Annuler », « trois questions », « retour à l'écran précédent »)
- Observation, l. 2103 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer un service d'orthopédagogie ») :
  > « Annuler » (`afficherRencontres`) : retour à l'écran précédent, aucune écriture
- Catégorie : 1 · fait sans être prévu

**7.116** · Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer mon service d'orthopédagogie »
- Intention : aucune mention (termes cherchés : « Nom du service requis », « Aucun élève lu », « refus »)
- Observation, l. 2106 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer mon service d'orthopédagogie ») :
  > Sans nom → notification « Nom du service requis — Un nom suffit : il s'affiche partout où un cours montre son code. » ; nom sans élèves → « Aucun élève lu — Une ligne par élève : Prénom Nom, ou DA ; Nom ; Prénom. »
- Catégorie : 1 · fait sans être prévu

**7.117** · Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer mon service d'orthopédagogie »
- Intention : aucune mention (termes cherchés : « indices », « indicesPatternsRaI », « remplacées », « indices de l'ancien groupe »)
- Observation, l. 2114 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer mon service d'orthopédagogie ») :
  > `a2026_indicesAssiduite.sommatif` et `a2026_indicesPatternsRaI` : les entrées 1111111…4444444 sont remplacées par les seules entrées 9394249 et 9999001
- Catégorie : 1 · fait sans être prévu

**7.118** · Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer mon service d'orthopédagogie »
- Intention : aucune mention (termes cherchés : « Aucune rencontre », « liste vide »)
- Observation, l. 2115 (Suivi : saisie des présences, interventions, rencontres, animation › Rencontres › « Créer mon service d'orthopédagogie ») :
  > « Aucune rencontre. »
- Catégorie : 1 · fait sans être prévu

**7.119** · Suivi : saisie des présences, interventions, rencontres, animation › Animation › Modale « Paramètres du tirage »
- Intention : aucune mention (termes cherchés : « Paramètres du tirage », « paramètres », « Nombre d'étudiant·es à tirer »)
- Observation, l. 2147 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Modale « Paramètres du tirage ») :
  > modale insérée dans `body` : « Nombre d'étudiant·es à tirer » (1 à 5), « Avec remise (un même étudiant peut être tiré plusieurs fois) », « Étudiants du groupe (0/4 disponibles) »
- Catégorie : 1 · fait sans être prévu

**7.120** · Suivi : saisie des présences, interventions, rencontres, animation › Animation › Modale « Paramètres du tirage »
- Intention : aucune mention (termes cherchés : « exclu », « exclusion », « Étudiants du groupe », « disponibles »)
- Observation, l. 2148 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Modale « Paramètres du tirage ») :
  > Case d'un·e étudiant·e (data-on-change `toggleExclusionEtudiant`, js/boite-outils.js:345-353) — **Écrit** immédiatement `etatTirage.exclus` : `[]` → `["2222222"]`
- Catégorie : 1 · fait sans être prévu

**7.121** · Suivi : saisie des présences, interventions, rencontres, animation › Animation › Modale « Paramètres du tirage »
- Intention : aucune mention (termes cherchés : « Nombre d'étudiant·es à tirer », « nombre à tirer », « plusieurs noms »)
- Observation, l. 2150 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Modale « Paramètres du tirage ») :
  > « Appliquer » (`appliquerParamsTirage`, js/boite-outils.js:356-370) — **Écrit** `nombreATirer:1→2`
- Observation, l. 2143 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Tirage au sort : « Tirer ! ») :
  > Tirage de 2 avec remise et 2222222 exclu : « 1 Testeur Fictif-Alpha 2 Essai Fictif-Charlie »
- Catégorie : 1 · fait sans être prévu

**7.122** · Suivi : saisie des présences, interventions, rencontres, animation › Animation › Modale « Paramètres du tirage »
- Intention : aucune mention (termes cherchés : « Avec remise », « avec remise », « tiré plusieurs fois »)
- Observation, l. 2150 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Modale « Paramètres du tirage ») :
  > `avecRemise:false→true`
- Observation, l. 2142 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Tirage au sort : « Tirer ! ») :
  > Avec remise : aucune écriture
- Catégorie : 1 · fait sans être prévu

**7.123** · Suivi : saisie des présences, interventions, rencontres, animation › Animation › Questions flash : modale « Gestion des Questions Flash »
- Intention : aucune mention (termes cherchés : « catégorie », « Catégories », « Sans catégorie »)
- Observation, l. 2157 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Questions flash : modale « Gestion des Questions Flash ») :
  > « Ajouter » catégorie (`ajouterCategorie`, js/boite-outils.js:875-904)
- Observation, l. 2164 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Questions flash : modale « Gestion des Questions Flash ») :
  > Corbeille de catégorie (`supprimerCategorie`) : `confirm("Supprimer cette catégorie ? Les questions seront déplacées vers «Sans catégorie».")`
- Catégorie : 1 · fait sans être prévu

**7.124** · Suivi : saisie des présences, interventions, rencontres, animation › Animation › Questions flash : modale « Gestion des Questions Flash »
- Intention : aucune mention (termes cherchés : « Avec remise », « une même question peut être tirée plusieurs fois », « remise »)
- Observation, l. 2161 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Questions flash : modale « Gestion des Questions Flash ») :
  > Case « Avec remise » (data-on-change `toggleRemiseQuestionsHandler`) : `avecRemise:false` → `true`
- Catégorie : 1 · fait sans être prévu

**7.125** · Suivi : saisie des présences, interventions, rencontres, animation › Animation › Questions flash : modale « Gestion des Questions Flash »
- Intention : aucune mention (termes cherchés : « Réinitialiser les tirages », « questions posées », « réinitialiser »)
- Observation, l. 2162 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Questions flash : modale « Gestion des Questions Flash ») :
  > « Réinitialiser les tirages » : `dejaPositions` → `[]`
- Catégorie : 1 · fait sans être prévu

**7.126** · Suivi : saisie des présences, interventions, rencontres, animation › Animation › Questions flash : filtre
- Intention : aucune mention (termes cherchés : « Toutes les catégories », « filtre », « catégorie »)
- Observation, l. 2169 (Suivi : saisie des présences, interventions, rencontres, animation › Animation › Questions flash : filtre) :
  > Filtre : options « Toutes les catégories », « Catégorie Zorglub (2) »
- Catégorie : 1 · fait sans être prévu

---

## Partie 8 · Labo

### Introduction de la partie

**8.1**
- Intention, l. 3121 :
  > L'écran « Labo › Démo » est décrit avec le mode démonstration, dans la partie 1.
- Observation, l. 2186 (Labo) :
  > le programme pose 7 boutons de sous-navigation `[data-sous-onglet=labo-…]` (« Outils d'observation », « Modélisation », « Exploration des pratiques », « Rythme de travail », « Études », « Bilan réflexif », « Suivi longitudinal »)
- Catégorie : 2 · prévu mais pas fait

### Écran 63 · Labo › Outils d'observation

**8.2** · Sans geste
- Intention, l. 3127 :
  > aucun bloc repliable, les trois cartes ne se referment pas, un sommaire « Sur cette page » en tête, deux réglages par rangée
- Observation : aucune mention (termes cherchés : « Sur cette page », « repliable », « se referment », « rangée », « accordeon-acc »)
- Catégorie : 2 · prévu mais pas fait

**8.3** · Sans geste
- Intention, l. 3128 :
  > Sous chaque réglage, de petites étiquettes nomment l'écran où son effet se voit ; en ambre, celles qui agissent hors de Suivi : palette d'annotation, liste des évaluations, badge de grille, export recherche
- Observation : aucune mention (termes cherchés : « étiquette », « ambre », « où ça agit », « badge de grille », « export recherche »)
- Catégorie : 2 · prévu mais pas fait

**8.4** · Sans geste
- Intention, l. 3130 :
  > Le texte du bloc « Seuils d'interprétation » dit, mot pour mot : « Ces trois seuils colorent les colonnes Assiduité, Complétion, Performance et Mobilisation de la liste des élèves, et qualifient l'engagement dans le profil. Ils ne touchent ni la note ni l'échelle IDME. »
- Observation : aucune mention (termes cherchés : « colorent les colonnes », « qualifient l'engagement », « ne touchent ni la note », « Seuils d'interprétation »)
- Catégorie : 2 · prévu mais pas fait

**8.5** · Sans geste
- Intention, l. 3131 :
  > « collecte » remplace « cueillette », dans l'introduction et dans la case du bloc Micro-données ACP
- Observation : aucune mention (termes cherchés : « collecte », « cueillette », « Micro-données ACP », « introduction »)
- Catégorie : 2 · prévu mais pas fait

**8.6** · Sans geste
- Intention, l. 3134 :
  > En démonstration, le choix de grille montre la grille avec laquelle le profil calcule, au lieu de « Grille enregistrée, introuvable dans ce trimestre »
- Observation : aucune mention (termes cherchés : « démo », « mode démo », « grille avec laquelle le profil calcule », « grilleReferenceDepistage »)
- Catégorie : 2 · prévu mais pas fait

**8.7** · Sans geste
- Intention, l. 3136 :
  > « Paramètres d'analyse » et « Seuils d'interprétation » sont des blocs visibles
- Observation : aucune mention (termes cherchés : « Paramètres d'analyse », « bloc », « Seuils de détection »)
- Catégorie : 2 · prévu mais pas fait

**8.8** · Sans geste
- Intention, l. 3137 :
  > Sous chaque champ chiffré, la plage permise en mots (« De 5 (sensible) à 20 (moins sensible) »)
- Observation : aucune mention (termes cherchés : « De 5 », « sensible », « plage », « moins sensible »)
- Catégorie : 2 · prévu mais pas fait

**8.9** · Sans geste
- Intention, l. 3137 :
  > Sous chaque champ chiffré, la plage permise en mots
- Observation, l. 2204 (Labo › Outils d'observation) :
  > Bornes `min`/`max` HTML non appliquées par le code : fenêtre=99 → `nombreProductionsAnalyse:99`
- Catégorie : 3 · fait autrement

**8.10** · Geste : Choisir la grille de critères pour le dépistage
- Intention, l. 3145 :
  > Sortie : les critères ciblés proposés dans une intervention viennent de cette grille, jamais d'une liste écrite dans le logiciel
- Observation, l. 2947 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > critères ciblés et objectif suggéré (aucune grille de référence ni évaluation dans l'état de départ : « Suggérer » vide le champ)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.11** · Geste : Choisir la grille de critères pour le dépistage
- Intention, l. 3146 :
  > le message qui réclame une grille indique Labo › Outils d'observation
- Observation, l. 2063 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › « Planifier une intervention ») :
  > critères ciblés : « Configure une grille de référence dans Conception › Grilles de critères pour activer le ciblage par critère. »
- Catégorie : 3 · fait autrement

**8.12** · Geste : Choisir la grille de critères pour le dépistage
- Intention, l. 3146 :
  > Sortie : le message qui réclame une grille indique Labo › Outils d'observation
- Observation, l. 2063 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › « Planifier une intervention ») :
  > critères ciblés : « Configure une grille de référence dans Conception › Grilles de critères pour activer le ciblage par critère. »
- Catégorie : 3 · fait autrement

**8.13** · Geste : Choisir la grille de critères pour le dépistage
- Intention, l. 3147 :
  > et à Labo › Outils d'observation quand une grille existe mais n'est pas choisie
- Observation, l. 2063 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › « Planifier une intervention ») :
  > critères ciblés : « Configure une grille de référence dans Conception › Grilles de critères pour activer le ciblage par critère. »
- Observation, l. 2190 (Labo › Outils d'observation) :
  > une option « Grille de départ » = `GRILLE_GENERIQUE` avec l'état de base
- Catégorie : 3 · fait autrement

**8.14** · Geste : Régler la fenêtre d'analyse des patterns
- Intention, l. 3151 :
  > une valeur posée avant 1.129 repart à trois, non reprise
- Observation : aucune mention (termes cherchés : « 1.129 », « repart », « migration », « nombreProductionsAnalyse »)
- Catégorie : 2 · prévu mais pas fait

**8.15** · Geste : Régler la fenêtre d'analyse des patterns
- Intention, l. 3152 :
  > les flèches par critère du profil
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage[…]: non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.16** · Geste : Régler la fenêtre d'analyse des patterns
- Intention, l. 3152 :
  > Sortie : l'indice de progression[…]et le « sur N » de fiabilité du Suivi du groupe analysent ce nombre de dernières productions
- Observation : aucune mention (termes cherchés : « sur N », « fiabilité », « indice de progression », « progressionArtefacts »)
- Catégorie : 2 · prévu mais pas fait

**8.17** · Geste : Régler la sensibilité des flèches par critère (ancien « Direction du risque »)
- Intention, l. 3157 :
  > pour qu'une flèche (→ ou ←) suive ce critère : carte RàI, barres par critère, phrase « Apprentissage : présentement en amélioration »
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage[…]: non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.18** · Geste : Régler le seuil de défi spécifique
- Intention, l. 3161 :
  > un seul seuil, celui que l'utilisateur règle, départage une force d'un défi dans le diagnostic par critère
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage[…]: non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.19** · Geste : Régler le seuil de défi spécifique
- Intention, l. 3162 :
  > il règle le dépistage seulement ; la « Consolidation des apprentissages » ne le lit pas
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage[…]: non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.20** · Geste : Régler le seuil de défi spécifique
- Intention, l. 3163 :
  > le seuil agit par la couleur des badges « Forces et défis » et par le défi principal de la carte RàI, sans titre chiffré
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « jugement » du profil, signalements de dépistage[…]: non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.21** · Geste : Taper un seuil (progression des artefacts, sensibilité des flèches, défi, Fragile, Acceptable, Bon)
- Intention, l. 3168 :
  > des seuils dans le désordre sont refusés sans rien enregistrer
- Observation, l. 2203 (Labo › Outils d'observation) :
  > Pendant ce refus, la lecture des seuils réécrit `seuilsInterpretation` complétée des valeurs par défaut (ajout `"idme":{"insuffisant":0.64,"developpement":0.75,"maitrise":0.85}`, ordre des champs changé)
- Catégorie : 3 · fait autrement

**8.22** · Geste : Taper un seuil (progression des artefacts, sensibilité des flèches, défi, Fragile, Acceptable, Bon)
- Intention, l. 3170 :
  > Fragile / Acceptable / Bon colorent les indices de la liste et qualifient l'assiduité et la complétion ; un réglage déjà déplacé prend effet
- Observation : aucune mention (termes cherchés : « colorent », « couleur », « Fragile », « Acceptable », « seuilsInterpretation »)
- Catégorie : 2 · prévu mais pas fait

**8.23** · Geste : Taper un seuil (progression des artefacts, sensibilité des flèches, défi, Fragile, Acceptable, Bon)
- Intention, l. 3172 :
  > aucune valeur n'est posée à la place de l'utilisateur
- Observation, l. 2203 (Labo › Outils d'observation) :
  > Pendant ce refus, la lecture des seuils réécrit `seuilsInterpretation` complétée des valeurs par défaut (ajout `"idme":{"insuffisant":0.64,"developpement":0.75,"maitrise":0.85}`, ordre des champs changé)
- Catégorie : 3 · fait autrement

**8.24** · Geste : Lire les aides de l'écran
- Intention, l. 3182 :
  > l'aide « Indicateurs visuels des seuils » dit « Lignes pointillées et étiquettes des niveaux de ton échelle sur les graphiques de progression du profil individuel. »
- Observation : aucune mention (termes cherchés : « Indicateurs visuels », « Lignes pointillées et étiquettes », « seuils-visuels », « afficherSeuilsVisuels »)
- Catégorie : 2 · prévu mais pas fait

**8.25** · Geste : Lire les aides de l'écran
- Intention, l. 3183 :
  > le repère « note différée » dit « Note différée : la rétroaction passe d'abord. Réglage dans Labo › Outils d'observation. »
- Observation : aucune mention (termes cherchés : « note différée », « Note différée », « rétroaction passe d'abord », « noteDifferee »)
- Catégorie : 2 · prévu mais pas fait

**8.26** · Geste : Lire les aides de l'écran
- Intention, l. 3186 :
  > le dépistage du risque n'a pas de seuils propres : il lit les plages de l'échelle de l'utilisateur
- Observation, l. 1789 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Affichage de l'écran) :
  > pattern « Difficulté persistante » si performance des N dernières productions < seuil `idme.insuffisant` ; niveau 3 si ce pattern ou P < `idme.insuffisant`
- Observation, l. 2203 (Labo › Outils d'observation) :
  > complétée des valeurs par défaut (ajout `"idme":{"insuffisant":0.64,"developpement":0.75,"maitrise":0.85}`
- Catégorie : 3 · fait autrement

**8.27** · Geste : Activer l'observation de la structure (Taxonomie SOLO)
- Intention, l. 3194 :
  > la catégorie « Compréhension » de la palette d'annotation suit ce réglage
- Observation : aucune mention (termes cherchés : « Compréhension », « COMPRÉHENSION », « afficherDescriptionsSOLO », « v2-pref-solo »)
- Catégorie : 2 · prévu mais pas fait

**8.28** · Geste : Activer l'observation des actions
- Intention, l. 3198 :
  > la catégorie « Action » de la palette suit ce réglage ; les tampons Repérage, Liaison, Ouverture sont agrégés dans chaque évaluation, suivis en courbe et exportés pour la recherche
- Observation, l. 2951 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > js/journal.js et js/actions-rlo.js : aucune de leurs fonctions n'est appelée par les gestes du Suivi observés (lu dans le code : journal des évaluations, agrégats d'actions RLO) ; non exécutés dans ce module.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.29** · Geste : Masquer les notes par travail (note différée)
- Intention, l. 3202 :
  > la note chiffrée de chaque travail est remplacée par un repère « note différée » dans la liste, le profil et le portfolio
- Observation : aucune mention (termes cherchés : « note différée », « noteDifferee », « différée », « repère »)
- Catégorie : 2 · prévu mais pas fait

**8.30** · Geste : Masquer les notes par travail (note différée)
- Intention, l. 3203 :
  > le repère renvoie à Labo › Outils d'observation
- Observation : aucune mention (termes cherchés : « note différée », « différée », « repère »)
- Catégorie : 2 · prévu mais pas fait

**8.31** · Geste : Activer les indicateurs visuels des seuils
- Intention, l. 3207 :
  > les niveaux de l'échelle de l'utilisateur se tracent sur les graphiques
- Observation : aucune mention (termes cherchés : « afficherSeuilsVisuels », « seuils visuels », « pointillé », « niveaux de l'échelle »)
- Catégorie : 2 · prévu mais pas fait

### Écran 64 · Labo › Suivi longitudinal

**8.32** · Sans geste
- Intention, l. 3214 :
  > tout fonctionne aussi quand le trimestre affiché est clos, sans cocher « Permission d'écriture »
- Observation : aucune mention (termes cherchés : « clos », « Permission d'écriture », « lecture seule », « registreLongitudinal »)
- Catégorie : 2 · prévu mais pas fait

**8.33** · Sans geste
- Intention, l. 3215 :
  > pas par l'archive d'un trimestre ; l'écran le rappelle
- Observation, l. 2373 (Labo › Suivi longitudinal) :
  > « Le registre voyage dans ton codex ; pas dans l'archive d'un groupe-cours. »
- Catégorie : 3 · fait autrement

**8.34** · Sans geste
- Intention, l. 3215 :
  > Le registre est conservé par l'export complet (Réglages › Données)
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.35** · Sans geste
- Intention, l. 3221 :
  > rétroactions comprises
- Observation, l. 2961 (Ce qui n'a pas pu être observé › Labo) :
  > Suivi longitudinal : élève avec évaluations, présences et grilles (dossier non vide, `modeles` rempli)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.36** · Sans geste
- Intention, l. 3222 :
  > l'aide de l'écran dit que le R des pseudonymes vient de « registre »
- Observation : aucune mention (termes cherchés : « pseudonyme », « vient de », « Élève R », « « registre » »)
- Catégorie : 2 · prévu mais pas fait

**8.37** · Geste : Chercher un élève
- Intention, l. 3226 :
  > dans tous les trimestres sauf la démo[…]un même élève (même DA du collège) vu dans deux trimestres n'apparaît qu'une fois
- Observation : aucune mention (termes cherchés : « démo », « doublon », « une fois », « même DA »)
- Catégorie : 2 · prévu mais pas fait

**8.38** · Geste : Saisir un résultat ultérieur
- Intention, l. 3243 :
  > la ligne passe à l'élève suivant
- Observation : aucune mention (termes cherchés : « élève suivant », « suivant », « sélecteur `eleve` »)
- Catégorie : 2 · prévu mais pas fait

**8.39** · Geste : Retirer du registre
- Intention, l. 3251 :
  > Motif : un geste de réparation, « pour corriger une erreur »
- Observation, l. 3 () :
  > Il ne dit rien de l'intention de ses auteur·es.
- Catégorie : 4 · non comparable (hors de la copie observée)

**8.40** · Geste : Voir le dossier
- Intention, l. 3255 :
  > pour chaque trimestre, les évaluations en tuiles côte à côte dans l'ordre des dates (production, date, note, niveau) ; critères et rétroaction se déplient dans la tuile
- Observation, l. 2961 (Ce qui n'a pas pu être observé › Labo) :
  > Suivi longitudinal : élève avec évaluations, présences et grilles (dossier non vide, `modeles` rempli)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.41** · Geste : Voir le dossier
- Intention, l. 3257 :
  > « remplacée par une reprise »
- Observation, l. 2961 (Ce qui n'a pas pu être observé › Labo) :
  > Suivi longitudinal : élève avec évaluations, présences et grilles (dossier non vide, `modeles` rempli)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques)

**8.42** · Sans geste
- Intention, l. 3267 :
  > Outil de préparation : comparer pour bien choisir avant d'appliquer, en début de trimestre
- Observation, l. 3 () :
  > Il ne dit rien de l'intention de ses auteur·es.
- Catégorie : 4 · non comparable (hors de la copie observée)

**8.43** · Sans geste
- Intention, l. 3268 :
  > Lecture seule : rien n'est écrit dans les pratiques
- Observation, l. 2255 (Labo › Exploration des pratiques) :
  > **« Dériver une maquette »** (`deriverMaquette`, js/pratiques.js:556-581) → **Écrit** `a2026_pratiquesConfigurables`
- Catégorie : 3 · fait autrement

**8.44** · Geste : Choisir 2 ou 3 pratiques à comparer
- Intention, l. 3273 :
  > Sortie : 2 ou 3 pratiques (abouties ou maquettes) côte à côte
- Observation, l. 2247 (Labo › Exploration des pratiques) :
  > **Sélecteurs de colonne** `.comparateur-select[data-slot=0|1]`
- Catégorie : 3 · fait autrement

**8.45** · Geste : Choisir 2 ou 3 pratiques à comparer
- Intention, l. 3276 :
  > les lignes sont rangées sous les six paramètres de la recherche (objet, révisabilité, agentivité, communication, granularité, détermination)
- Observation : aucune mention (termes cherchés : « révisabilité », « agentivité », « granularité », « six paramètres », « détermination »)
- Catégorie : 2 · prévu mais pas fait

**8.46** · Geste : Choisir 2 ou 3 pratiques à comparer
- Intention, l. 3277 :
  > ce que l'application ne couvre pas est écrit (l'agentivité, les niveaux de la note du cours, l'alignement sur des cibles) ; deux lignes « Ce à quoi la note se rapporte » et « Temporalité de la note »
- Observation : aucune mention (termes cherchés : « ne couvre pas », « se rapporte », « Temporalité », « alignement sur des cibles »)
- Catégorie : 2 · prévu mais pas fait

**8.47** · Geste : Choisir 2 ou 3 pratiques à comparer
- Intention, l. 3279 :
  > une note exactement en ,5 s'arrondit vers le haut (57,5 donne 58)
- Observation : aucune mention (termes cherchés : « 57,5 », « ,5 », « arrondi », « vers le haut »)
- Catégorie : 2 · prévu mais pas fait

**8.48** · Geste : Choisir 2 ou 3 pratiques à comparer
- Intention, l. 3280 :
  > le plafonnement et le remplacement d'une sommative ne sont plus annoncés « Actif »
- Observation : aucune mention (termes cherchés : « plafonnement », « remplacement », « « Actif » », « Construction de la note »)
- Catégorie : 2 · prévu mais pas fait

**8.49** · Geste : Choisir 2 ou 3 pratiques à comparer
- Intention, l. 3281 :
  > une pratique « N derniers » affiche « Récence (dernier essai retenu) » à la ligne des reprises
- Observation : aucune mention (termes cherchés : « Récence », « N derniers », « dernier essai », « reprises »)
- Catégorie : 2 · prévu mais pas fait

**8.50** · Geste : Choisir 2 ou 3 pratiques à comparer
- Intention, l. 3282 :
  > une colonne de dénotation montre grille et échelle dans ses lignes de construction et dit que la note est un jugement porté à la fin ; elle n'a pas de note simulée
- Observation : aucune mention (termes cherchés : « dénotation », « DEN », « jugement porté », « note simulée »)
- Catégorie : 2 · prévu mais pas fait

**8.51** · Geste : Choisir la source des données
- Intention, l. 3286 :
  > un des groupes réels de l'utilisateur
- Observation, l. 2249 (Labo › Exploration des pratiques) :
  > « Mon groupe actif (données réelles) » → profils = `groupeEtudiants` du groupe actif (12 max)
- Catégorie : 3 · fait autrement

**8.52** · Geste : Ouvrir le formulaire d'une pratique (lien de colonne)
- Intention, l. 3292 :
  > le formulaire s'ouvre rempli des valeurs de la pratique
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique », fusions `conserver*`, wizard-pratique-v2.js:2200-2306, 2412-2516) : appelé depuis le comparateur du Labo (js/comparateur-pratiques.js:636), aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.53** · Geste : Créer, dériver, adopter ou jeter une maquette
- Intention, l. 3296 :
  > elle reste hors du sélecteur de pratique active tant qu'elle n'est pas adoptée
- Observation : aucune mention (termes cherchés : « sélecteur de pratique active », « pratique active », « estMaquette », « MAQUETTE »)
- Catégorie : 2 · prévu mais pas fait

**8.54** · Geste : Exporter la comparaison (CSV)
- Intention, l. 3305 :
  > un fichier CSV : horodatage, groupe-cours, étudiant·e, puis par pratique : nom, famille, note finale, nombre d'artefacts retenus, détail par artefact (production, note, retenu, obligatoire ou exclu)
- Observation, l. 2251 (Labo › Exploration des pratiques) :
  > `Profil,DA,Niveau atteint,Tendance,Sommative (SOM),PAN (STD)`
- Catégorie : 3 · fait autrement

**8.55** · Geste : Exporter la comparaison (CSV)
- Intention, l. 3306 :
  > en anonymisation, le nom et le DA exportés sont anonymisés
- Observation : aucune mention (termes cherchés : « anonymis », « Élève », « comparateur-pratiques », « Exporter en CSV »)
- Catégorie : 2 · prévu mais pas fait

### Écran 66 · Labo › Données

**8.56** · Sans geste
- Intention, l. 3313 :
  > Affiche les comptes des données de l'application, dont le nombre d'interventions
- Observation, l. 2186 (Labo) :
  > le programme pose 7 boutons de sous-navigation `[data-sous-onglet=labo-…]` (« Outils d'observation », « Modélisation », « Exploration des pratiques », « Rythme de travail », « Études », « Bilan réflexif », « Suivi longitudinal »)
- Catégorie : 2 · prévu mais pas fait

**8.57** · Sans geste
- Intention, l. 3314 :
  > Lit les données telles qu'elles sont rangées : un ancien brouillon peut y être compté
- Observation, l. 2186 (Labo) :
  > le programme pose 7 boutons de sous-navigation `[data-sous-onglet=labo-…]` (« Outils d'observation », « Modélisation », « Exploration des pratiques », « Rythme de travail », « Études », « Bilan réflexif », « Suivi longitudinal »)
- Catégorie : 2 · prévu mais pas fait

**8.58** · Sans geste
- Intention, l. 3315 :
  > l'écran est en lecture seule : on n'y fait aucun geste, il ne fait qu'afficher les comptes
- Observation, l. 2186 (Labo) :
  > le programme pose 7 boutons de sous-navigation `[data-sous-onglet=labo-…]` (« Outils d'observation », « Modélisation », « Exploration des pratiques », « Rythme de travail », « Études », « Bilan réflexif », « Suivi longitudinal »)
- Catégorie : 2 · prévu mais pas fait

### Écran 67 · Labo › Bilan réflexif

**8.59** · Geste : Supprimer les résultats importés
- Intention, l. 3325 :
  > Données : non documenté.
- Observation, l. 2368 (Labo › Bilan réflexif › Vue « Rapport d’analyse ») :
  > « Supprimer sans codex » → `confirm("Supprimer les résultats importés ?")` → **Écrit** : `a2026_resultatsBilan` supprimée (localStorage + IDB)
- Catégorie : 1 · fait sans être prévu

**8.60** · Geste : Réinitialiser ou importer le questionnaire
- Intention, l. 3330 :
  > Données : remplace le questionnaire personnalisé
- Observation, l. 2324 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > 1er clic : le programme ajoute `#modalBilanImportQuestionnaire` au document puis lève l'erreur de page « rendreAideHTML is not defined » (l. 701-702 : `rendreAideHTML` n'est pas importé dans ce module, l. 1-10) ; la fenêtre reste invisible
- Catégorie : 3 · fait autrement

### Écran 68 · Labo › Modélisation

**8.61** · Sans geste
- Intention, l. 3337 :
  > Les fichiers ouverts en Modélisation partent dans le codex et reviennent quand on l'ouvre sur un autre appareil
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, nouveau, exporter, archiver, charger un codex data, fusionner, comparer, détails, fermer) : code hors des fichiers de ce périmètre (js/codex.js, js/reserve*.js, js/labo-codex-data.js) ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**8.62** · Geste : Supprimer un fichier (corbeille du badge)
- Intention, l. 3341 :
  > Données : non documenté.
- Observation, l. 2237 (Labo › Modélisation) :
  > accepté → **Écrit** : entrée retirée de `fichiersModelisation`, enregistrement IDB `fichiers:FM_…` supprimé, entrée retirée de `a2026_annotationsTravaux`, `model-dernier-fichier` retiré si c'était le fichier ouvert ; la miniature `thumbnail_FM_…` reste
- Catégorie : 1 · fait sans être prévu

### Écran 69 · Labo › Études

**8.63** · Sans geste
- Intention, l. 3349 :
  > on n'y fait aucun geste, il ne fait qu'afficher ses deux graphiques
- Observation, l. 2290 (Labo › Études) :
  > **Cases « A ↔ P », « C ↔ P »** `data-on-change="toggleCorrelation" data-param=AP|CP` (l. 833-840) et cases générées par intervention (écouteur `change`, l. 735-737, `toggleCorrelationByLabel`) : masquent/affichent la série et réajustent l'axe
- Observation, l. 2291 (Labo › Études) :
  > **Cases « Moy. A/C/P »** `data-on-change="toggleOverlayMoyenne"` (l. 855-866) : affichent la série et l'axe %
- Observation, l. 2293 (Labo › Études) :
  > **Bouton (i) `button[data-aide=labo-etudes]`** (js/accompagnement.js:875-885) : fenêtre « Études »
- Catégorie : 3 · fait autrement

**8.64** · Sans geste
- Intention, l. 3350 :
  > son contenu peut changer avec le temps, selon les besoins des utilisateurs
- Observation, l. 1 () :
  > (version bêta 1.199.0, build 1011-1808)
- Catégorie : 4 · non comparable (hors de la copie observée)

### Écran 70 · Labo › Rythme de travail

**8.65** · Sans geste
- Intention, l. 3356 :
  > que sa case « Consignes transmises » soit cochée ou non
- Observation : aucune mention (termes cherchés : « Consignes transmises », « assignee », « echeancesParGroupe », « estimerCharge »)
- Catégorie : 2 · prévu mais pas fait

### Fait sans être prévu, sans ligne correspondante dans l'intention

**8.66** · Labo › Modélisation
- Intention : aucune mention (termes cherchés : « annoter en Modélisation », « annotations de Modélisation », « annotationsTravaux »)
- Observation, l. 2226 (Labo › Modélisation) :
  > À l'ouverture du 2e fichier, le programme écrit `a2026_annotationsTravaux` = `[{"id":"ANN_…","fichierId":"FM_…","etudiantDA":"","productionId":"","pages":{"0":{"strokes":[],"textAnnotations":[],"shapes":[],"stickers":[]},"1":{…}},"version":1,…}]` pour le fichier quitté
- Observation, l. 2227 (Labo › Modélisation) :
  > palette d'annotation affichée dans `#model-conteneur-document`
- Catégorie : 1 · fait sans être prévu

**8.67** · Labo › Modélisation
- Intention : aucune mention (termes cherchés : « Page précédente / suivante », « pages du fichier »)
- Observation, l. 2230 (Labo › Modélisation) :
  > **Page précédente / suivante** `#model-btn-page-prec|suiv` (`travauxVisionneuse.pagePrecedente|pageSuivante`) : indicateur « 1 / 2 » ↔ « 2 / 2 », boutons désactivés aux bornes (l. 411-416) ; aucun changement de stockage, aucune requête (observé à l'exécution)
- Catégorie : 1 · fait sans être prévu

**8.68** · Labo › Modélisation
- Intention : aucune mention (termes cherchés : « zoom de la Modélisation », « pleine page », « zoom100 »)
- Observation, l. 2231 (Labo › Modélisation) :
  > **Zoom** `travauxVisionneuse.zoom100 | zoomPleineLargeur | zoomPleineHauteur` : canvas 595×841 (100 %), 1239×1752 (largeur), 523×740 (hauteur)
- Catégorie : 1 · fait sans être prévu

**8.69** · Labo › Modélisation
- Intention : aucune mention (termes cherchés : « Fichier précédent / suivant », « fichier suivant », « pastille du fichier »)
- Observation, l. 2232 (Labo › Modélisation) :
  > **Fichier précédent / suivant** `#model-btn-fichier-prec|suiv` (l. 175-187) et **clic sur une pastille** `[data-action="modelisation.ouvrirFichier"]` (l. 272-330) : change `sessionStorage:model-dernier-fichier`, met à jour compteur « 1 / 2 » / « 2 / 2 » et la classe `actif` (observé à l'exécution)[…]après « Fichier précédent » (PNG → PDF), `model-dernier-fichier` valait l'id du PDF mais, 2 s après, la pastille active restait le PNG, le canvas mesurait 0×0 et la palette était absente
- Catégorie : 1 · fait sans être prévu

**8.70** · Labo › Modélisation
- Intention : aucune mention (termes cherchés : « Fermer la visionneuse », « fermerVisionneuse »)
- Observation, l. 2233 (Labo › Modélisation) :
  > **« Fermer »** `[data-action="modelisation.fermerVisionneuse"]` (l. 334-357) : retire `sessionStorage:model-dernier-fichier`, met à jour `a2026_annotationsTravaux` (date), réaffiche le placeholder, retire la palette
- Catégorie : 1 · fait sans être prévu

**8.71** · Labo › Modélisation
- Intention : aucune mention (termes cherchés : « dernier fichier ouvert », « model-dernier-fichier »)
- Observation, l. 2234 (Labo › Modélisation) :
  > **Changement de sous-section** : quitter Modélisation appelle `modelisation.nettoyer` (js/navigation.js:367-371 ; js/modelisation.js:419-445) ; au retour, le fichier noté dans `model-dernier-fichier` est rouvert
- Catégorie : 1 · fait sans être prévu

**8.72** · Labo › Exploration des pratiques
- Intention : aucune mention (termes cherchés : « tendance », « ↗↗ », « forte progression », « rang final »)
- Observation, l. 2246 (Labo › Exploration des pratiques) :
  > Tendance : rang final − rang initial ≥2 « ↗↗ », 1 « ↗ », ≤−1 « ↘ », sinon « → »
- Catégorie : 1 · fait sans être prévu

**8.73** · Labo › Exploration des pratiques
- Intention : aucune mention (termes cherchés : « Lignes de profil », « Ce que chaque pratique retient », « Retour à la comparaison », « Démonstration finale »)
- Observation, l. 2248 (Labo › Exploration des pratiques) :
  > **Lignes de profil** `tr[data-profil-da]` (clic ou Entrée/Espace, l. 640-652) → fiche : « Surtout « I » · SIM0000 », contexte, « Maîtrise en fin de parcours » « Incomplet → Développement → Incomplet → Développement → Incomplet → Incomplet → Développement → Développement », « Démonstration finale : Développement ↗ », « Ce que chaque pratique retient » (« Récit indisponible pour cette pratique. » pour STD/SPE). « ‹ Retour à la comparaison » revient à la matrice
- Catégorie : 1 · fait sans être prévu

**8.74** · Labo › Exploration des pratiques
- Intention : aucune mention (termes cherchés : « Ce que ces réglages changent », « réglages changent »)
- Observation, l. 2256 (Labo › Exploration des pratiques) :
  > bloc « Ce que ces réglages changent » vide (la colonne 1 n'est pas une pratique configurable)
- Catégorie : 1 · fait sans être prévu

**8.75** · Labo › Rythme de travail
- Intention : aucune mention (termes cherchés : « Aucune donnée de durée », « Active le chronomètre », « chronomètre dans les préférences »)
- Observation, l. 2267 (Labo › Rythme de travail) :
  > **État de base (aucune évaluation)** : le programme affiche « Aucune donnée de durée disponible. Active le chronomètre dans les préférences (Réglages) pour commencer à mesurer. »
- Catégorie : 1 · fait sans être prévu

**8.76** · Labo › Rythme de travail
- Intention : aucune mention (termes cherchés : « hygiène », « heures par jour », « preferencesRythme », « date objectif »)
- Observation, l. 2268 (Labo › Rythme de travail) :
  > **Champs de planification et d'hygiène** (`#rythme-pref-date-objectif`, `-heure-objectif`, `-marge`, cases `-weekends`, `-feries`, `-rappel-pause`, `-alerte-weekend`, `-alerte-soir`, `-tampon-cours` : `data-on-change` ; champs numériques `-heures-jour`, `-heures-demi`, `-heures-soir`, `-pause-minutes`, `-heure-soir`, `-tampon-minutes` : `data-on-input`, donc à chaque frappe) → `Rythme.sauvegarderPreferences`
- Observation, l. 2269 (Labo › Rythme de travail) :
  > **Écrit** : `preferencesRythme` (clé non préfixée ; localStorage + IDB), objet complet réécrit
- Observation, l. 2271 (Labo › Rythme de travail) :
  > Sans aucune évaluation, après rechargement, le formulaire montre les valeurs HTML par défaut (6, 3, 2, +25 %, 45, 21, 30, cases d'origine) alors que `preferencesRythme` contient les valeurs saisies
- Catégorie : 1 · fait sans être prévu

**8.77** · Labo › Rythme de travail
- Intention : aucune mention (termes cherchés : « tableau des durées », « Accélère », « Ralentit », « durée mesurée »)
- Observation, l. 2275 (Labo › Rythme de travail) :
  > Avec durées : ligne « Formuler 10 HOC | Artefact 4 | 1 déc. | 8:00 | 9 | → Stable » et « 98 évaluations au total (7 avec durée mesurée) »
- Catégorie : 1 · fait sans être prévu

**8.78** · Labo › Rythme de travail
- Intention : aucune mention (termes cherchés : « rythmeColonnes », « colonnes du tableau des durées », « Colonnes : » »)
- Observation, l. 2276 (Labo › Rythme de travail) :
  > **Cases « Colonnes : »** `input[data-tableau=t1|t2][data-col]` (écouteur `change` sur `document`, l. 1087-1104) → **Écrit** `rythmeColonnesT1` : absent → `{"med":true}` → `{"med":true,"prod":false}`
- Catégorie : 1 · fait sans être prévu

**8.79** · Labo › Rythme de travail
- Intention : aucune mention (termes cherchés : « planning », « Journée libre », « Demi-journée », « planification détaillée »)
- Observation, l. 2277 (Labo › Rythme de travail) :
  > Le planning (`afficherPlanning`, l. 772-906 ; répartition jour par jour selon l'horaire : jour sans cours = « Journée libre », ≤ 3 h de cours = « Demi-journée », sinon « Soirée » ; 14 jours après la dernière remise si aucune date objectif) n'apparaît qu'avec des copies restantes : non affiché
- Observation, l. 2958 (Ce qui n'a pas pu être observé › Labo) :
  > Rythme : planning détaillé (exige des copies importées non évaluées)
- Catégorie : 1 · fait sans être prévu

**8.80** · Labo › Rythme de travail
- Intention : aucune mention (termes cherchés : « Portrait temporel », « en fin de semaine », « soirée tardive »)
- Observation, l. 2278 (Labo › Rythme de travail) :
  > **« Portrait temporel »** (`construirePortrait`, l. 924-1001) en mode démo : grille jour × tranche (Matin 6–12 h, Après-midi 12–17 h, Soirée 17–21 h, Nuit 21–6 h) et « 43% de tes évaluations sont en fin de semaine », « 43% sont en soirée tardive ou la nuit »
- Catégorie : 1 · fait sans être prévu

**8.81** · Labo › Rythme de travail
- Intention : aucune mention (termes cherchés : « rappel de pause », « une pause de 5 min », « bien-être », « hygiène », « le repos aussi »)
- Observation, l. 2279 (Labo › Rythme de travail) :
  > Le code programme un rappel « Tu évalues depuis N min — une pause de 5 min ? » toutes les N min (`setTimeout` récurrent, l. 1035-1042), affiche « Évaluation un samedi/dimanche — les copies seront encore là lundi. », « Il est HHh — le repos aussi fait partie du travail. », « Cours gr. X dans N min — bon moment pour s'arrêter. », au plus un toast par 5 min, retiré après 8 s
- Observation, l. 2811 (Ce qui se produit sans geste de l'utilisateur › Labo) :
  > Rappel de pause `setTimeout` récurrent (js/rythme.js:1035-1042) armé par l'annotation (hors Labo) ; toast retiré après 8 s
- Catégorie : 1 · fait sans être prévu

**8.82** · Labo › Études
- Intention : aucune mention (termes cherchés : « Sélectionne un groupe-cours », « tous fusionnés », « codex data »)
- Observation, l. 2296 (Labo › Études) :
  > Codex data chargé, groupe « tous fusionnés » : le canevas affiche « Sélectionne un groupe-cours — Les corrélations longitudinales se calculent par groupe-cours (calendriers et cohortes différents). »
- Catégorie : 1 · fait sans être prévu

**8.83** · Labo › Bilan réflexif
- Intention : aucune mention (termes cherchés : « questionnaire modèle », « Bilan de fin de trimestre », « parcoursBilan », « autoreflexion »)
- Observation, l. 2300 (Labo › Bilan réflexif) :
  > lit `a2026_questionnaireBilan`, `a2026_parcoursBilan`, `a2026_autoreflexionBilan`, `a2026_resultatsBilan` et crée les trois premières si absentes
- Observation, l. 2301 (Labo › Bilan réflexif) :
  > **Affichage (1re fois)** — **Écrit** (localStorage + IDB) : `a2026_questionnaireBilan` = modèle « Bilan de fin de trimestre (modèle) »
- Catégorie : 1 · fait sans être prévu

**8.84** · Labo › Bilan réflexif
- Intention : aucune mention (termes cherchés : « vue Parcours », « Auto-réflexion », « Importer les résultats », « Rapport d’analyse »)
- Observation, l. 2301 (Labo › Bilan réflexif) :
  > **Sorties** : barre « Questionnaire | Parcours | Auto-réflexion | Importer les résultats | Rapport d’analyse » (ce dernier désactivé sans résultats), vue « Questionnaire »
- Observation, l. 2302 (Labo › Bilan réflexif) :
  > Chaque bouton de la barre `[data-action="BilanReflexif.afficherVue"]` (js/bilan-reflexif.js:84-115) change la vue affichée sans écrire
- Catégorie : 1 · fait sans être prévu

**8.85** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « titre du questionnaire », « bilan-titre »)
- Observation, l. 2307 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > `#bilan-titre` (change, `modifierTitre`, l. 310-317) : `titre` « Bilan de fin de trimestre (modèle) » → « Bilan Fictif-Zorglub » ; champ vidé → « Bilan réflexif »
- Catégorie : 1 · fait sans être prévu

**8.86** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « préambule »)
- Observation, l. 2308 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > `#bilan-preambule` (change, l. 289-297) : `preambule` absent → « Préambule Exemple Zorglub. » ; vide → `null`
- Catégorie : 1 · fait sans être prévu

**8.87** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « en-tête de bloc », « déplier le bloc », « toggleOuverture »)
- Observation, l. 2309 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > En-tête de bloc `[data-action="BilanReflexif.toggleOuverture"]` (l. 328-331) : déplie/replie le bloc (état en mémoire seulement)
- Catégorie : 1 · fait sans être prévu

**8.88** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « description du bloc », « description de bloc »)
- Observation, l. 2310 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > `#bilan-desc-<bloc>` (change, l. 299-308) : `blocs[0].description` absent → « Description Fictif-Zorglub »
- Catégorie : 1 · fait sans être prévu

**8.89** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « bloc inactif », « désactiver un bloc », « toggleBloc »)
- Observation, l. 2311 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > Interrupteur `[data-action="BilanReflexif.toggleBloc"]` (l. 319-326) : `blocs[0].actif` true → false → true ; un bloc inactif est exclu du texte copié et de l'import CSV
- Catégorie : 1 · fait sans être prévu

**8.90** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « modifier une question », « éditer une question », « Question modifiée »)
- Observation, l. 2312 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > « ✎ » `editerQuestion` (l. 333-340) → champ `#bilan-edit-<id>` ; « ✓ » `confirmerEdition` (l. 342-360) : `questions[0].texte` → « Question modifiée Zorglub ? » ; touche Entrée sans effet (`validerEditionKeyup` vide, l. 367-370 ; observé : le champ reste)
- Catégorie : 1 · fait sans être prévu

**8.91** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « déplacer une question », « ordre des questions »)
- Observation, l. 2313 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > « ↑/↓ » `deplacerQuestion` (l. 396-414) : échange `q_eval_01` et `q_eval_02`
- Catégorie : 1 · fait sans être prévu

**8.92** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « Non applicable », « 5e option »)
- Observation, l. 2314 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > Case « Inclure une 5e option « Non applicable » » `toggleNA` (l. 705-713) : `inclureNA` absent → true
- Catégorie : 1 · fait sans être prévu

**8.93** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « Consigne conditionnelle », « consigne conditionnelle »)
- Observation, l. 2315 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > Champ « Consigne conditionnelle » `modifierConsigneConditionnelle` (l. 715-724) : `consigneConditionnelle` → « Si tu as répondu Exemple : »
- Catégorie : 1 · fait sans être prévu

**8.94** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « Supprimer cette question », « supprimer une question »)
- Observation, l. 2316 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > Corbeille `supprimerQuestion` (`data-confirm="Supprimer cette question ?"`, l. 372-394) : confirm accepté → `q_eval_04` retirée
- Catégorie : 1 · fait sans être prévu

**8.95** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « ajouter une question », « Choix multiple », « likert4 »)
- Observation, l. 2317 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > « Ajouter » de bloc `ajouterQuestionBloc` (l. 416-455) : type « Choix multiple » → ajout `{"id":"q_…","texte":"Nouvelle question Zorglub","type":"choix_multiple","obligatoire":false,"personnalisee":true,"options":[{"id":"opt_…","lettre":"a","texte":"","autreAvecChamp":false},{…"lettre":"b"…}],"minSelection":null,"maxSelection":null}` (likert4 : `inclureNA:false` ; matrix : 2 énoncés vides). Champ vide → rien.
- Catégorie : 1 · fait sans être prévu

**8.96** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « Limite : 8 options », « Minimum : 2 options », « options d'une question »)
- Observation, l. 2318 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > Options : `modifierOption` → `options[0].texte` « Option Alpha » ; « + Ajouter une option » → 3e option `lettre:"c"` (max 8, sinon toast « Limite : 8 options max ») ; case « Autre » → `autreAvecChamp:true` ; « Max » = 2 → `maxSelection:2` ; « ↓ » échange deux options (la `lettre` reste attachée à l'option) ; « × » (`confirm("Supprimer cette option ?")`) retire l'option ; à 2 options, « × » demande la confirmation puis affiche le toast « Minimum : 2 options » sans rien retirer.
- Catégorie : 1 · fait sans être prévu

**8.97** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « question personnalisée », « Questions supplémentaires », « Likert matriciel »)
- Observation, l. 2319 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > « Ajouter » perso `ajouterPerso` (l. 457-499) : type « Likert matriciel » →
- Catégorie : 1 · fait sans être prévu

**8.98** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « Au moins 1 énoncé », « énoncés d'une question », « modifierEnonce »)
- Observation, l. 2320 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > Énoncés : `modifierEnonce` → « Énoncé Zorglub » ; « + Ajouter un énoncé » → 3 énoncés ; « ↓ » échange ; « × » (`confirm("Supprimer cet énoncé ?")`) retire ; minimum 1 (toast « Au moins 1 énoncé requis »
- Catégorie : 1 · fait sans être prévu

**8.99** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « Comment distribuer ce questionnaire », « distribuer le questionnaire »)
- Observation, l. 2321 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > Bandeau « Comment distribuer ce questionnaire ? » `toggleAide` (js/bilan-reflexif-core.js:122-129) : **Écrit** `localStorage:bilan_aide_editeur` = `1` (replié) / `0` ; aucune écriture IDB
- Catégorie : 1 · fait sans être prévu

**8.100** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « Copier les questions », « Questions copiées », « copier le questionnaire »)
- Observation, l. 2322 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > **« Copier les questions »** `exporterTexte` (js/bilan-reflexif-import-export-texte.js:11-148) : **Sorties** : presse-papier = texte de 5084 caractères commençant par « === BILAN RÉFLEXIF — Bilan réflexif === », « PRÉAMBULE : », « SECTION : Système d’évaluation », « DESCRIPTION : … », questions numérotées en continu ; Likert suivies de « a. Tout à fait d’accord / b. Plutôt d’accord / c. Plutôt en désaccord / d. Pas du tout d’accord » (+ « e. Non applicable ») ; balises `[OUVERT]`, `[CHECKBOX max=2]`, `[RADIO]`, `[MATRIX]` ; consigne en `*…*` ; option « Autre » vide rendue « b.  : ___ » ; questions personnalisées sous « SECTION : Questions supplémentaires » ; toast « Questions copiées dans le presse-papier »
- Catégorie : 1 · fait sans être prévu

**8.101** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « modèle de questionnaire », « modele-bilan-reflexif »)
- Observation, l. 2326 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > **« Télécharger le modèle »** (l. 538-555) : fichier `modele-bilan-reflexif.txt` (`text/plain;charset=utf-8`, 2542 o) : en-tête de règles en lignes `#` (« # MODÈLE — Questionnaire de Bilan réflexif », format `=== BILAN RÉFLEXIF — <titre> ===`, `SECTION :`, balises `[RADIO]`, `[CHECKBOX max=3]`, `[MATRIX]`, `[OUVERT]`) puis un exemple « === BILAN RÉFLEXIF — Modèle === » de 6 questions ; toast « Modèle téléchargé »
- Catégorie : 1 · fait sans être prévu

**8.102** · Labo › Bilan réflexif › Vue « Questionnaire »
- Intention : aucune mention (termes cherchés : « prompt », « Copier le prompt », « Prompt copié »)
- Observation, l. 2327 (Labo › Bilan réflexif › Vue « Questionnaire ») :
  > **« Copier le prompt pour IA »** (l. 649-664) : presse-papier = texte de 3020 caractères commençant par « Tu m’aides à créer un questionnaire de bilan réflexif de fin de trimestre, à importer dans Labo Codex … », finissant par « … via le bouton « Importer un questionnaire ». » ; toast « Prompt copié dans le presse-papier »
- Catégorie : 1 · fait sans être prévu

**8.103** · Labo › Bilan réflexif › Vue « Parcours »
- Intention : aucune mention (termes cherchés : « Importer depuis les productions », « Aucune production trouvée »)
- Observation, l. 2337 (Labo › Bilan réflexif › Vue « Parcours ») :
  > « Importer depuis les productions » `importerProductions` (l. 368-414) : sans `a2026_productions` → toast « Aucune production trouvée dans l’application », rien n'est écrit (observé). Avec productions : une activité par production « titre — activité », doublons ignorés
- Catégorie : 1 · fait sans être prévu

**8.104** · Labo › Bilan réflexif › Vue « Parcours »
- Intention : aucune mention (termes cherchés : « Copier le formulaire », « Formulaire du parcours »)
- Observation, l. 2338 (Labo › Bilan réflexif › Vue « Parcours ») :
  > « Copier le formulaire » `exporterTexteParcours` (l. 448-538) : sans activité → toast « Ajoute des activités avant d’exporter » ; avec 1 activité → presse-papier (834 car.) « === PARCOURS D’APPRENTISSAGE === / --- Activité Fictive Zorglub B2 --- / 1. Question par activité Zorglub ? / a. Très facile … e. Très exigeant / 2. Quelle émotion … a. Fierté … j. Ennui / 3. … / === QUESTIONS DE SYNTHÈSE === / 4. … / 5. As-tu manqué des cours ? … a. Maladie … f. Autre / 6. … » (questions inactives omises) ; toast « Formulaire du parcours copié dans le presse-papier »
- Catégorie : 1 · fait sans être prévu

**8.105** · Labo › Bilan réflexif › Vue « Parcours »
- Intention : aucune mention (termes cherchés : « ajouter une activité », « activités du parcours »)
- Observation, l. 2339 (Labo › Bilan réflexif › Vue « Parcours ») :
  > « Ajouter » activité `ajouterActivite` (l. 290-304 ; type `production|cours|evenement`) : `activites` += `{"id":"act_…","titre":"Activité Fictive Zorglub A","type":"production","ordre":1}` ; champ vide → rien
- Catégorie : 1 · fait sans être prévu

**8.106** · Labo › Bilan réflexif › Vue « Parcours »
- Intention : aucune mention (termes cherchés : « déplacer une activité », « Supprimer cette activité »)
- Observation, l. 2340 (Labo › Bilan réflexif › Vue « Parcours ») :
  > « ↑/↓ » `deplacerActivite` : échange et renumérote `ordre` ; « ✎ » puis « ✓ » `modifierActivite`/`confirmerModifActivite` : `titre` → « Activité Fictive Zorglub B2 » ; corbeille `supprimerActivite` (`confirm("Supprimer cette activité ?")`) : entrée retirée, `ordre` recalculé
- Catégorie : 1 · fait sans être prévu

**8.107** · Labo › Bilan réflexif › Vue « Parcours »
- Intention : aucune mention (termes cherchés : « question par activité », « questionsParActivite »)
- Observation, l. 2341 (Labo › Bilan réflexif › Vue « Parcours ») :
  > Interrupteur de question par activité `toggleQuestionParActivite` : `questionsParActivite[0].actif` true → false ; « ✎ »/« ✓ » `editerQuestionQPA`/`confirmerEditionQPA` : texte → « Question par activité Zorglub ? » ; le bouton d'annulation de cette édition appelle `BilanReflexif.annulerEdition`, qui réaffiche la vue Questionnaire (cachée) : le champ d'édition reste affiché dans Parcours, rien n'est écrit
- Catégorie : 1 · fait sans être prévu

**8.108** · Labo › Bilan réflexif › Vue « Parcours »
- Intention : aucune mention (termes cherchés : « ajouter une question par activité », « texte_libre », « echelle5 »)
- Observation, l. 2342 (Labo › Bilan réflexif › Vue « Parcours ») :
  > « Ajouter » question par activité `ajouterQuestionParActivite` (type `texte_libre|choix_unique|echelle5`) : ajout `{"id":"qpa_…","texte":"Question fictive par activité","type":"texte_libre","actif":true,"obligatoire":false,"personnalisee":true}` ; corbeille (`confirm("Supprimer cette question ?")`) : retrait
- Catégorie : 1 · fait sans être prévu

**8.109** · Labo › Bilan réflexif › Vue « Parcours »
- Intention : aucune mention (termes cherchés : « émotion », « Cette émotion existe déjà »)
- Observation, l. 2343 (Labo › Bilan réflexif › Vue « Parcours ») :
  > Émotions : « Ajouter » `ajouterEmotion` → `emotionsDisponibles` += « Zorglubitude » ; doublon (casse ignorée) → toast « Cette émotion existe déjà » ; « × » `supprimerEmotion` (index) → retrait
- Catégorie : 1 · fait sans être prévu

**8.110** · Labo › Bilan réflexif › Vue « Parcours »
- Intention : aucune mention (termes cherchés : « questions de synthèse », « momentPivot », « questions transversales »)
- Observation, l. 2344 (Labo › Bilan réflexif › Vue « Parcours ») :
  > Interrupteurs des questions de synthèse `toggleTransversale` : `questionsTransversales.momentPivot` true → false
- Catégorie : 1 · fait sans être prévu

**8.111** · Labo › Bilan réflexif › Vue « Auto-réflexion »
- Intention : aucune mention (termes cherchés : « Likert », « auto-réflexion », « Avant les résultats », « questions miroirs »)
- Observation, l. 2349 (Labo › Bilan réflexif › Vue « Auto-réflexion ») :
  > Boutons Likert `repondreReflexionLikert(question, valeur)` (l. 246-259) : 3e bouton de `qma_evaluation` → `blocA.questions[0].reponses.avant` null → 2 ; en état « après », 4e bouton de `qma_retroaction` → `reponses.apres` null → 1
- Catégorie : 1 · fait sans être prévu

**8.112** · Labo › Bilan réflexif › Vue « Auto-réflexion »
- Intention : aucune mention (termes cherchés : « data-reflexion-field », « commentaire de réflexion », « questions miroirs »)
- Observation, l. 2350 (Labo › Bilan réflexif › Vue « Auto-réflexion ») :
  > Champs `[data-reflexion-field]` (écouteur `blur`, l. 368-376) : commentaire → `blocA.questions[0].commentaire` « Commentaire fictif Zorglub » ; synthèse → `blocC.questions[0].reponses.avant` « Synthèse fictive »
- Catégorie : 1 · fait sans être prévu

**8.113** · Labo › Bilan réflexif › Vue « Auto-réflexion »
- Intention : aucune mention (termes cherchés : « changerEtatReflexion », « Après les résultats », « questions miroirs »)
- Observation, l. 2351 (Labo › Bilan réflexif › Vue « Auto-réflexion ») :
  > `toggleQuestionReflexion` → `actif` true → false ; `toggleBlocReflexion(blocB)` → `blocB.actif` false ; « Ajouter » (`ajouterQuestionReflexion` blocA/blocC) → question `qm_…` (likert4 ou texte_long) ajoutée ; corbeille (`confirm("Supprimer ?")`) → retirée ; `changerEtatReflexion` → `etat` « avant_resultats » ↔ « apres_resultats »
- Catégorie : 1 · fait sans être prévu

**8.114** · Labo › Bilan réflexif › Vue « Importer les résultats »
- Intention : aucune mention (termes cherchés : « Importer les résultats », « Correspondance des colonnes », « Jaccard », « réponses détectées »)
- Observation, l. 2355 (Labo › Bilan réflexif › Vue « Importer les résultats ») :
  > Vue : zone « Cliquer pour sélectionner un fichier CSV » (`declencherImport` → clic sur `#bilan-file-input`, accept `.csv,.tsv,.txt`) et « Charger les données de démonstration »
- Observation, l. 2356 (Labo › Bilan réflexif › Vue « Importer les résultats ») :
  > **Choix d'un fichier** (écouteur `change`, l. 50-57 ; lecture UTF-8, relecture ISO-8859-1 si caractère de remplacement, l. 74-92 ; séparateur `,`/`;`/tabulation selon la 1re ligne, l. 119-128) : fichier fictif `resultats-bilan-zorglub.csv` (5 colonnes, 4 réponses) → tableau « Correspondance des colonnes (4 réponses détectées) »
- Catégorie : 1 · fait sans être prévu

**8.115** · Labo › Bilan réflexif › Vue « Importer les résultats »
- Intention : aucune mention (termes cherchés : « Ignorer cette colonne », « correspondance des colonnes », « bilan-map »)
- Observation, l. 2357 (Labo › Bilan réflexif › Vue « Importer les résultats ») :
  > Sélecteurs `#bilan-map-N` (`modifierMapping`, l. 466-486) : modifient la correspondance en mémoire (observé, aucune écriture)
- Catégorie : 1 · fait sans être prévu

**8.116** · Labo › Bilan réflexif › Vue « Importer les résultats »
- Intention : aucune mention (termes cherchés : « Importer les résultats », « genId », « confirmerImport »)
- Observation, l. 2358 (Labo › Bilan réflexif › Vue « Importer les résultats ») :
  > **« Importer les résultats »** `confirmerImport` (l. 494-541) : erreur de page « genId is not defined » (`genId` non importé dans ce module, l. 1-6) ; rien n'est écrit, aucun rapport
- Catégorie : 1 · fait sans être prévu

**8.117** · Labo › Bilan réflexif › Vue « Importer les résultats »
- Intention : aucune mention (termes cherchés : « Charger les données de démonstration », « CLE_RESULTATS », « résultats de démonstration »)
- Observation, l. 2359 (Labo › Bilan réflexif › Vue « Importer les résultats ») :
  > **« Charger les données de démonstration »** `chargerResultatsDemo` (l. 65-71) : erreur de page « CLE_RESULTATS is not defined » ; rien n'est écrit
- Catégorie : 1 · fait sans être prévu

**8.118** · Labo › Bilan réflexif › Vue « Importer les résultats »
- Intention : aucune mention (termes cherchés : « annulerImport », « Annuler l'import des résultats »)
- Observation, l. 2360 (Labo › Bilan réflexif › Vue « Importer les résultats ») :
  > « Annuler » `annulerImport` : vide la correspondance et réaffiche la vue
- Catégorie : 1 · fait sans être prévu

**8.119** · Labo › Bilan réflexif › Vue « Rapport d’analyse »
- Intention : aucune mention (termes cherchés : « Rapport d’analyse », « Signal fort », « Score moyen », « répondants »)
- Observation, l. 2366 (Labo › Bilan réflexif › Vue « Rapport d’analyse ») :
  > **Rapport** : « Vue d’ensemble » « 30 Répondants | 3.06 Score moyen / 4 | 78% Favorables | 28 Questions analysées » ; par bloc « Système d’évaluation — 3.15 / 4 », « ✓ Signal fort — 83% favorables », par question « 3.13 / 4 · 30 réponses »
- Catégorie : 1 · fait sans être prévu

**8.120** · Labo › Bilan réflexif › Vue « Rapport d’analyse »
- Intention : aucune mention (termes cherchés : « Exporter en PDF », « bilan-reflexif- », « PDF exporté »)
- Observation, l. 2367 (Labo › Bilan réflexif › Vue « Rapport d’analyse ») :
  > Exporter en PDF »** `exporterPDF` (l. 858-893, jsPDF) : fichier `bilan-reflexif-2026-10-14.pdf` (65 021 o, 3 pages, format lettre)
- Catégorie : 1 · fait sans être prévu

**8.121** · Labo › Bandeau « Codex data chargé »
- Intention : aucune mention (termes cherchés : « codex data », « Codex data chargé », « charger un codex data », « groupe(s)-cours »)
- Observation, l. 2393 (Labo › Bandeau « Codex data chargé ») :
  > Le fichier est choisi par `#labo-codex-data-input` (`accept=".json"`, `data-on-change="LaboCodexData.onFichierSelectionne"`, index.html:3561), que le bouton `#codex-menu-charger-codex-data` du menu Codex (`LaboCodexData.actionOuvrirChargement`, js/labo-codex-data.js:35-41) vide puis clique
- Observation, l. 2395 (Labo › Bandeau « Codex data chargé ») :
  > **Sorties** : bandeau affiché « Codex data chargé · 2 groupe(s)-cours · extrait le 1 juin 2026 · Prof Fictif-Zorglub » ; sélecteur `#select-codex-data-groupe` « tous fusionnés », « H2025 999-FIC-ZZ gr00009 », « A2025 999-FIC-YY gr00008 » (tri par `date_archive` décroissante, l. 132-173) ; notification « Codex data charg&eacute; » « 2 groupe(s)-cours disponible(s) dans le Labo. » — l'entité `&eacute;` est affichée telle quelle dans le titre
- Catégorie : 1 · fait sans être prévu

**8.122** · Labo › Bandeau « Codex data chargé »
- Intention : aucune mention (termes cherchés : « select-codex-data-groupe », « tous fusionnés », « codex data »)
- Observation, l. 2398 (Labo › Bandeau « Codex data chargé ») :
  > **Sélecteur « Voir : »** `#select-codex-data-groupe` (`data-on-change="LaboCodexData.onChangerGroupe"`, l. 95-99) : change le groupe en mémoire et réaffiche la sous-section active
- Catégorie : 1 · fait sans être prévu

**8.123** · Labo › Bandeau « Codex data chargé »
- Intention : aucune mention (termes cherchés : « décharger », « Codex data déchargé », « actionDecharger »)
- Observation, l. 2399 (Labo › Bandeau « Codex data chargé ») :
  > **Bouton × `[data-action="LaboCodexData.actionDecharger"]`** (l. 86-92) : bandeau masqué, groupe remis à « tous », sous-section réaffichée ; notification « Codex data d&eacute;charg&eacute; » « Le Labo affiche &agrave; nouveau les donn&eacute;es du trimestre actif. » (entités affichées telles quelles)
- Catégorie : 1 · fait sans être prévu

**8.124** · Labo › Bandeau « Codex data chargé »
- Intention : aucune mention (termes cherchés : « Intégrité non vérifiée », « hash du fichier », « contenu_sha256 »)
- Observation, l. 2400 (Labo › Bandeau « Codex data chargé ») :
  > **Hash d'intégrité faux** (`integrite.contenu_sha256` = 64 zéros ; `verifierIntegrite`, js/codex-data.js:546-566 : SHA-256 de `JSON.stringify(document sans integrite, null, 2)`) : notification info « Int&eacute;grit&eacute; non v&eacute;rifi&eacute;e » « Le hash du fichier ne correspond pas. Le fichier peut avoir &eacute;t&eacute; modifi&eacute; depuis son extraction. Le chargement continue. »
- Catégorie : 1 · fait sans être prévu

**8.125** · Labo › Bandeau « Codex data chargé »
- Intention : aucune mention (termes cherchés : « Chargement impossible », « Format non reconnu », « JSON invalide »)
- Observation, l. 2401 (Labo › Bandeau « Codex data chargé ») :
  > **Fichier refusé** : `format` « autre-chose » → notification erreur « Chargement impossible » « Format non reconnu (attendu : codex-data, reçu : autre-chose) » ; JSON invalide → « Fichier illisible (JSON invalide) : Expected property name or '}' in JSON at position 1 (line 1 column 2) » ; message `[LaboCodexData] Chargement &eacute;chou&eacute; : …` en console ; bandeau non affiché
- Catégorie : 1 · fait sans être prévu

---

## Partie 9 · Réglages

### Introduction de la partie

**9.1**
- Intention, l. 3367 :
  > d'où l'ordre : archiver, faire revenir, puis seulement renvoyer
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.2**
- Intention, l. 3369 :
  > la métaphore de l'emprunt est écartée
- Observation, l. 2565 (Réglages › reglages-donnees › « Rafraîchir la liste ») :
  > « Faire revenir » (`ReserveRevenir.actionFaireRevenir`), « Emprunter » (`ReserveEmprunter.actionEmprunter`)
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi »
- Catégorie : 3 · fait autrement

**9.3**
- Intention, l. 3370 :
  > L'archive d'un trimestre n'emporte et ne réécrit aucune donnée commune à tous les trimestres
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.4**
- Intention, l. 3371 :
  > Les tailles s'écrivent avec la virgule décimale dans tout l'écran des archives (« 1,08 Go », « 80,0 Ko »)
- Observation : aucune mention (termes cherchés : « Go », « Ko », « virgule », « 1,08 », « 80,0 », « Taille »)
- Catégorie : 2 · prévu mais pas fait

**9.5**
- Intention, l. 3372 :
  > Un nom ou un texte reçu d'une archive, d'un import ou d'un partage s'affiche toujours comme du texte, même s'il est entré avant
- Observation : aucune mention (termes cherchés : « comme du texte », « échapp », « innerHTML », « HTML », « balise », « <script »)
- Catégorie : 2 · prévu mais pas fait

**9.6**
- Intention, l. 3373 :
  > Deux gestes d'archives faits coup sur coup ne s'effacent pas l'un l'autre
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 71 · Réglages › Données › carte « Archives »

**9.7** · Geste : Vérifier une archive
- Intention, l. 3382 :
  > rien n'est écrit dans les trimestres ni dans l'archive ; seule la liste des archives note « Vérifiée le … »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.8** · Geste : Vérifier une archive
- Intention, l. 3383 :
  > une barre « Vérification de l'archive… » avec « N copies sur M »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.9** · Geste : Vérifier une archive
- Intention, l. 3384 :
  > « Archive vérifiée » : « Les N copies sont présentes et intactes, et les données concordent. »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.10** · Geste : Vérifier une archive
- Intention, l. 3385 :
  > « Les N copies et les données du trimestre sont présentes et intactes. »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.11** · Geste : Vérifier une archive
- Intention, l. 3386 :
  > « Archive incomplète », avec un détail accordé qui nomme chaque défaut
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.12** · Geste : Vérifier une archive
- Intention, l. 3387 :
  > « Archive à refaire » pour une archive faite avant 1.171.1, sans empreintes
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.13** · Geste : Vérifier une archive
- Intention, l. 3388 :
  > aucun défaut ne passe pour « vérifiée »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.14** · Geste : Vérifier une archive
- Intention, l. 3389 :
  > la ligne dit ensuite « Vérifiée le [date] » et le reste après un rechargement
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.15** · Geste : Vérifier une archive
- Intention, l. 3390 :
  > dans Chrome, « Vérifier » ne demande que la lecture du dossier ; « Archiver… » demande toujours l'écriture
- Observation, l. 2967 (Ce qui n'a pas pu être observé › Réglages) :
  > le chemin qui suit le choix réel d'un dossier ou d'un fichier n'a pas pu être exécuté
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.16** · Geste : Vérifier une archive
- Intention, l. 3392 :
  > ne comptent ni comme copie ni comme fichier en trop
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.17** · Geste : Vérifier une archive
- Intention, l. 3393 :
  > une fiche que l'archive déclare sans fichier dès l'archivage n'empêche pas « vérifiée »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.18** · Geste : Vérifier une archive
- Intention, l. 3394 :
  > le fichier d'une autre archive est refusé : « Ce n'est pas cette archive »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.19** · Geste : Faire revenir les copies d'un groupe
- Intention, l. 3398 :
  > n'écrit que les copies qui manquent et le statut « présent » de leurs fiches ; rien n'est remplacé ni effacé
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.20** · Geste : Faire revenir les copies d'un groupe
- Intention, l. 3399 :
  > une copie dite « manquante » dont le fichier est dans l'archive redevient présente
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.21** · Geste : Faire revenir les copies d'un groupe
- Intention, l. 3400 :
  > une copie changée depuis l'archive n'est pas remplacée
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.22** · Geste : Faire revenir les copies d'un groupe
- Intention, l. 3401 :
  > ramène aussi les copies de la corbeille et lève leur marque « aux archives »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.23** · Geste : Faire revenir les copies d'un groupe
- Intention, l. 3402 :
  > une fenêtre dit ce qui va se passer ; puis un bilan en nombres
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.24** · Geste : Faire revenir les copies d'un groupe
- Intention, l. 3403 :
  > le codex ne réclame ensuite que les copies qui manquent vraiment
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.25** · Geste : Faire revenir un trimestre entier
- Intention, l. 3407 :
  > le trimestre revient tel qu'il a été archivé, clos : élèves, évaluations, copies, séances de ses groupes
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.26** · Geste : Faire revenir un trimestre entier
- Intention, l. 3408 :
  > hors du trimestre, seule la liste des trimestres change
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.27** · Geste : Faire revenir un trimestre entier
- Intention, l. 3409 :
  > chaque donnée et chaque copie est recomparée à son empreinte au moment de l'écrire ; la liste des trimestres s'écrit en dernier
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.28** · Geste : Faire revenir un trimestre entier
- Intention, l. 3410 :
  > s'il s'arrête en route, il retire ce qu'il avait écrit, et rien d'autre
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.29** · Geste : Faire revenir un trimestre entier
- Intention, l. 3411 :
  > une séance ou une copie déjà là et identique à l'archive est laissée telle quelle ; différente : refus entier, rien écrit
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.30** · Geste : Faire revenir un trimestre entier
- Intention, l. 3412 :
  > les copies d'un·e étudiant·e supprimé·e ne reviennent pas ; leurs fiches, si
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.31** · Geste : Faire revenir un trimestre entier
- Intention, l. 3413 :
  > il sait ramener un trimestre depuis ce qui reste d'un renvoi inachevé
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.32** · Geste : Faire revenir un trimestre entier
- Intention, l. 3414 :
  > les vignettes des copies revenues ne sont pas refaites
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.33** · Geste : Faire revenir un trimestre entier
- Intention, l. 3415 :
  > refus s'il est déjà là : « … est déjà dans l'application : ouvre-le depuis la bibliothèque des trimestres. Rien n'a été écrit. »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.34** · Geste : Faire revenir un trimestre entier
- Intention, l. 3416 :
  > refus, rien écrit, si l'archive n'est pas vérifiée dans ce navigateur ou ne concorde plus avec sa vérification
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.35** · Geste : Faire revenir un trimestre entier
- Intention, l. 3417 :
  > le trimestre revenu se trouve, clos, dans la bibliothèque des trimestres
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.36** · Geste : Faire revenir un trimestre entier
- Intention, l. 3418 :
  > le bouton dit « Faire revenir », avec l'infobulle « Ramener ce trimestre dans l'application, clos, pour le consulter »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.37** · Geste : Faire revenir un trimestre entier
- Intention, l. 3419 :
  > la fenêtre « Faire revenir ‹trimestre› ? »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.38** · Geste : Faire revenir un trimestre entier
- Intention, l. 3420 :
  > le bilan « Trimestre revenu » dit « ‹trimestre› est revenu, clos. Tu le trouves dans la bibliothèque des trimestres. »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.39** · Geste : Faire revenir un trimestre entier
- Intention, l. 3421 :
  > un échec en route dit « Le retour s'est arrêté en cours de route (‹raison›). Ce qu'il avait écrit a été retiré : l'application est comme avant. »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.40** · Geste : Terminer le renvoi
- Intention, l. 3425 :
  > retire ce qui reste dans l'application d'un trimestre dont le renvoi s'est arrêté, après la même comparaison à l'archive
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.41** · Geste : Terminer le renvoi
- Intention, l. 3426 :
  > infobulle « Le renvoi s'est arrêté en cours de route : retirer ce qui reste »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.42** · Geste : Terminer le renvoi
- Intention, l. 3427 :
  > fenêtre « Terminer le renvoi de [trimestre] ? »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.43** · Geste : Retirer une ligne de la liste des archives
- Intention, l. 3432 :
  > Données : non documenté
- Observation, l. 2571 (Réglages › reglages-donnees › « Rafraîchir la liste ») :
  > `_manifesteReserve.archives` : 1 entrée → `{}`, `derniere_mise_a_jour` mis à jour (localStorage + IndexedDB)
- Catégorie : 1 · fait sans être prévu

**9.44** · Sans geste
- Intention, l. 3442 :
  > « Trimestre entier » pour une archive de trimestre
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.45** · Sans geste
- Intention, l. 3443 :
  > La ligne d'une archive de trimestre n'offre pas « Faire revenir » tant qu'elle n'est pas vérifiée
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s) ; les trois autres boutons n'apparaissent que pour une archive vérifiée ou de type trimestre.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.46** · Sans geste
- Intention, l. 3444 :
  > Un nouvel archivage du même groupe remet « Non vérifiée »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.47** · Sans geste
- Intention, l. 3445 :
  > l'aide de la carte nomme « Vérifier » et « Faire revenir »
- Observation, l. 2972 (Ce qui n'a pas pu être observé › Réglages) :
  > Boutons d'aide `.btn-aide-contextuelle[data-aide="reglages-reserve"]` et infobulles `data-tooltip` : gérés par le module d'aide (hors périmètre), non observés.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.48** · Sans geste
- Intention, l. 3446 :
  > Sous Safari, une archive annulée n'apparaît pas dans la liste
- Observation, l. 8 (Conditions d'observation) :
  > ouvert dans Chromium sans tête piloté par Playwright (fenêtre de 1400 × 900
- Catégorie : 4 · non comparable (conditions de l'observation (ni iPad ni Safari))

### Écran 72 · Réglages › Données › « Ouvrir une archive… »

**9.49** · Geste : Ouvrir une archive
- Intention, l. 3452 :
  > propose les grilles, les échelles et les pratiques de l'archive, et ses cartouches entières
- Observation, l. 2575 (Réglages › reglages-donnees › « Ouvrir une archive… ») :
  > Consulte tes archives archivés pour réimporter des grilles, échelles ou tampons dans tes bibliothèques actives.
- Catégorie : 3 · fait autrement

**9.50** · Geste : Ouvrir une archive
- Intention, l. 3452 :
  > propose les grilles, les échelles et les pratiques de l'archive, et ses cartouches entières
- Observation, l. 2969 (Ce qui n'a pas pu être observé › Réglages) :
  > « Ouvrir une archive… » avec une vraie archive ZIP (étape « Sélectionne ce que tu veux réimporter », case `#reserve-ouvrir-toggle-copie`, bouton « Réimporter n élément(s) » `ReserveOuvrir.appliquerReimport`) : interaction interrompue (accordéon replié par le geste de test) ; seul le gabarit vide de l'étape de sélection a été vu.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.51** · Geste : Ouvrir une archive
- Intention, l. 3454 :
  > ne charge plus tout le fichier en mémoire ; l'iPad est ménagé
- Observation, l. 2969 (Ce qui n'a pas pu être observé › Réglages) :
  > « Ouvrir une archive… » avec une vraie archive ZIP (étape « Sélectionne ce que tu veux réimporter », case `#reserve-ouvrir-toggle-copie`, bouton « Réimporter n élément(s) » `ReserveOuvrir.appliquerReimport`) : interaction interrompue (accordéon replié par le geste de test) ; seul le gabarit vide de l'étape de sélection a été vu.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.52** · Geste : Ouvrir une archive
- Intention, l. 3455 :
  > un fichier qui n'est pas un ZIP : « Le fichier choisi n'est pas un ZIP valide. » ; un ZIP à nom suspect est refusé
- Observation : aucune mention (termes cherchés : « n'est pas un ZIP valide », « ZIP valide », « suspect », « nom suspect »)
- Catégorie : 2 · prévu mais pas fait

### Écran 73 · Réglages › Données › carte « Ouverture et partage »

**9.53** · Geste : Ouvrir un ancien fichier par « Ouvrir un Codex… » (copie de secours, ancien .zip ou .json, cases à cocher)
- Intention, l. 3465 :
  > « Fichiers travaux » coché : les copies du fichier s'ajoutent aux tiennes au lieu de prendre leur place
- Observation : aucune mention (termes cherchés : « Fichiers travaux », « s'ajoutent », « copies du fichier », « prendre leur place »)
- Catégorie : 2 · prévu mais pas fait

**9.54** · Geste : Ouvrir un ancien fichier par « Ouvrir un Codex… » (copie de secours, ancien .zip ou .json, cases à cocher)
- Intention, l. 3466 :
  > « Étudiants », « Présences », « Notes », « Annotations » : ce que le fichier apporte de neuf s'ajoute ; ce que tu as déjà ne change pas ; le même fichier rouvert ne double rien
- Observation : aucune mention (termes cherchés : « « Étudiants » », « « Présences » », « « Annotations » », « ne double rien », « rouvert »)
- Catégorie : 2 · prévu mais pas fait

**9.55** · Geste : Ouvrir un ancien fichier par « Ouvrir un Codex… » (copie de secours, ancien .zip ou .json, cases à cocher)
- Intention, l. 3467 :
  > rien d'un élève supprimé (à partir de 1.174.4) n'entre : ni fiche, ni copies, ni notes, ni présences, ni annotations ; un élève en décrochage n'est pas touché
- Observation : aucune mention (termes cherchés : « élève supprimé », « n'a pas été ramené », « ramené », « décrochage »)
- Catégorie : 2 · prévu mais pas fait

**9.56** · Geste : Ouvrir un ancien fichier par « Ouvrir un Codex… » (copie de secours, ancien .zip ou .json, cases à cocher)
- Intention, l. 3468 :
  > les données de la démo que porte un ancien fichier ne sont ni proposées ni écrites
- Observation : aucune mention (termes cherchés : « démo », « demo_ », « ancien fichier »)
- Catégorie : 2 · prévu mais pas fait

**9.57** · Geste : Ouvrir un ancien fichier par « Ouvrir un Codex… » (copie de secours, ancien .zip ou .json, cases à cocher)
- Intention, l. 3469 :
  > réimporter un fichier déjà importé ne recopie pas ce qui est déjà là
- Observation : aucune mention (termes cherchés : « déjà importé », « réimport », « en double », « doublon », « recopie »)
- Catégorie : 2 · prévu mais pas fait

**9.58** · Geste : Ouvrir un ancien fichier par « Ouvrir un Codex… » (copie de secours, ancien .zip ou .json, cases à cocher)
- Intention, l. 3470 :
  > l'aperçu et le bilan comptent les présences en dates de cours ; au bilan, seules les dates où quelque chose est entré ; une ligne « 1 élève que tu avais supprimé n'a pas été ramené. »
- Observation : aucune mention (termes cherchés : « dates de cours », « présences », « n'a pas été ramené », « élève que tu avais supprimé »)
- Catégorie : 2 · prévu mais pas fait

**9.59** · Geste : Ouvrir un ancien fichier par « Ouvrir un Codex… » (copie de secours, ancien .zip ou .json, cases à cocher)
- Intention, l. 3472 :
  > une restauration qui n'a pas pu rendre des documents les compte, les marque manquants et le dit une seule fois
- Observation : aucune mention (termes cherchés : « manquant », « restauration », « n'a pas pu rendre », « documents »)
- Catégorie : 2 · prévu mais pas fait

**9.60** · Geste : Ouvrir un ancien fichier par « Ouvrir un Codex… » (copie de secours, ancien .zip ou .json, cases à cocher)
- Intention, l. 3473 :
  > les cases « Configuration du cours », « Cadre du trimestre », « Groupe-cours », « Horaires » et « Enseignants » ajoutent ce qui manque sans rien remplacer de ce qu'on a
- Observation, l. 2466 (Réglages › reglages-donnees › Bouton « Ouvrir un Codex… ») :
  > « Attention : cette option remplacera ta configuration actuelle »
- Observation, l. 2467 (Réglages › reglages-donnees › Bouton « Ouvrir un Codex… ») :
  > `trimestres` : nom « Trimestre Fictif Zorglub » → « Trimestre Fictif Bidule » (champ `dateCreation` disparu) ; `infoCours` : objet complet (id, discipline « 101 Biologie », compétence…) → `{"codeCours":"999-FIC-ZZ","nomCours":"Cours Fictif Bidule"}`
- Catégorie : 3 · fait autrement

**9.61** · Geste : Ouvrir un ancien fichier par « Ouvrir un Codex… » (copie de secours, ancien .zip ou .json, cases à cocher)
- Intention, l. 3473 :
  > les cases « Configuration du cours », « Cadre du trimestre », « Groupe-cours », « Horaires » et « Enseignants » ajoutent ce qui manque sans rien remplacer de ce qu'on a
- Observation, l. 2456 (Réglages › reglages-donnees › Bouton « Ouvrir un Codex… ») :
  > « Attention : L'importation écrasera les données existantes pour les clés importées. »
- Catégorie : 3 · fait autrement

**9.62** · Geste : Importer une sélection depuis une sauvegarde
- Intention, l. 3478 :
  > une sauvegarde récente propose ses grilles, échelles, pratiques et cartouches, chacune une fois, rangées dans le trimestre ouvert ; à identité égale et contenu différent, la version d'un trimestre l'emporte, la plus récente d'abord
- Observation : aucune mention (termes cherchés : « échelles », « pratiques », « cartouches », « identité », « plus récente », « sauvegarde »)
- Catégorie : 2 · prévu mais pas fait

**9.63** · Geste : Importer une sélection depuis une sauvegarde
- Intention, l. 3479 :
  > une ancienne sauvegarde : les cartouches restent liées à leur grille et apparaissent dans le trimestre ouvert ; une grille ou une échelle renommée pour conflit garde ses cartouches
- Observation : aucune mention (termes cherchés : « cartouche », « renommée », « conflit », « ancienne sauvegarde »)
- Catégorie : 2 · prévu mais pas fait

**9.64** · Geste : Importer une sélection depuis une sauvegarde
- Intention, l. 3480 :
  > une cartouche déjà là à l'identique n'est pas ajoutée en double, au premier comme au second passage
- Observation : aucune mention (termes cherchés : « à l'identique », « en double », « second passage », « cartouche »)
- Catégorie : 2 · prévu mais pas fait

**9.65** · Geste : Importer une sélection depuis une sauvegarde
- Intention, l. 3481 :
  > la méthode de calcul d'une pratique, les règles d'une production et la description d'une cartouche arrivent entières ; une valeur d'échelle écrite « 40 » reste 40
- Observation : aucune mention (termes cherchés : « méthode de calcul », « règles d'une production », « « 40 » », « valeur d'échelle »)
- Catégorie : 2 · prévu mais pas fait

**9.66** · Geste : Importer une sélection depuis une sauvegarde
- Intention, l. 3482 :
  > la démo n'est jamais proposée
- Observation : aucune mention (termes cherchés : « démo », « demo », « Importer la sélection »)
- Catégorie : 2 · prévu mais pas fait

**9.67** · Geste : Importer une sélection depuis une sauvegarde
- Intention, l. 3483 :
  > les cartouches déjà importées en double ou rangées hors du trimestre par une version d'avant restent où elles sont (assumé)
- Observation : aucune mention (termes cherchés : « en double », « hors du trimestre », « version d'avant », « cartouches »)
- Catégorie : 2 · prévu mais pas fait

**9.68** · Geste : Importer une sélection depuis une sauvegarde
- Intention, l. 3484 :
  > bilan : « N cartouche(s) déjà présente(s) à l'identique, non ajoutée(s) »
- Observation : aucune mention (termes cherchés : « déjà présente », « à l'identique », « non ajoutée », « cartouche(s) »)
- Catégorie : 2 · prévu mais pas fait

**9.69** · Sans geste
- Intention, l. 3488 :
  > La première carte s'appelle « Ouverture et partage »
- Observation : aucune mention (termes cherchés : « Ouverture et partage », « Ouverture », « Copie de secours »)
- Catégorie : 2 · prévu mais pas fait

### Écran 74 · Réglages › Données › « Partage entre collègues » et « Packages importés »

**9.70** · Geste : Importer un partage (.lcz)
- Intention, l. 3498 :
  > les items importés restent à part, en lecture seule, dans « Partagés par des collègues » de chaque bibliothèque
- Observation, l. 2887 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Section « Partagés » de la modale (`partageSection.genererSectionHTML('pratique')`) après import .lcz : non examinée.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.71** · Geste : Importer un partage (.lcz)
- Intention, l. 3499 :
  > une ressource modifiée en transit est refusée (empreinte scellée à l'export, vérifiée à l'import)
- Observation, l. 2449 (Réglages › reglages-donnees › Bouton « Exporter ma config ») :
  > chaque ressource porte un sceau `_hash_v1` = SHA-256 hexadécimal du JSON canonique
- Observation, l. 2463 (Réglages › reglages-donnees › Bouton « Ouvrir un Codex… ») :
  > Même fichier avec le nom de la grille modifié sans recalcul du sceau (`config-alteree.json`) : avertissement console « [Sécurité H] 1 ressource(s) avec sceau invalide » ; l'import s'effectue quand même
- Catégorie : 3 · fait autrement

**9.72** · Geste : Importer un partage (.lcz)
- Intention, l. 3500 :
  > une grille d'un collègue de même nom qu'une des tiennes, mais pas aux mêmes critères, ne s'y rattache pas
- Observation : aucune mention (termes cherchés : « même nom », « rattach », « homonyme », « mêmes critères »)
- Catégorie : 2 · prévu mais pas fait

**9.73** · Geste : Importer un partage (.lcz)
- Intention, l. 3501 :
  > un fichier de partage qui se dit de « Demo Labo Codex » est refusé à l'import
- Observation : aucune mention (termes cherchés : « Demo Labo Codex », « démo », « demo », « refusé »)
- Catégorie : 2 · prévu mais pas fait

**9.74** · Geste : Retirer un package importé
- Intention, l. 3506 :
  > un package vidé élément par élément disparaît de la liste
- Observation : aucune mention (termes cherchés : « vidé », « élément par élément », « disparaît »)
- Catégorie : 2 · prévu mais pas fait

**9.75** · Sans geste
- Intention, l. 3509 :
  > Non documenté dans les sources lues.
- Observation, l. 2821 (Ce qui se produit sans geste de l'utilisateur › Réglages) :
  > Affichage de « Données » : `chargerVueDonnees` 100 ms après (compteurs du sélecteur de ressources, statistiques de captures, liste des packages importés)
- Catégorie : 1 · fait sans être prévu

### Écran 75 · Réglages › Captures et recherche

**9.76** · Geste : Recalculer les captures
- Intention, l. 3516 :
  > les semaines déjà enregistrées de la courbe de performance se mettent à jour pour suivre la note du cours
- Observation, l. 2929 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Graphique hebdomadaire mesures C et P avec valeurs : les captures reconstruites contiennent C = P = null ; seul le message vide est atteignable.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.77** · Geste : Recalculer les captures
- Intention, l. 3517 :
  > ce que l'ancien bouton a déjà effacé ne revient pas (assumé)
- Observation : aucune mention (termes cherchés : « ancien bouton », « déjà effacé », « ne revient pas »)
- Catégorie : 2 · prévu mais pas fait

**9.78** · Geste : Recalculer les captures
- Intention, l. 3519 :
  > après le recalcul, le dernier point de la courbe d'un élève égale la note de son profil
- Observation, l. 2929 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Graphique hebdomadaire mesures C et P avec valeurs : les captures reconstruites contiennent C = P = null ; seul le message vide est atteignable.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.79** · Geste : Générer l'export anonymisé (pour la recherche)
- Intention, l. 3523 :
  > un fichier sans identité : ni nom, ni DA
- Observation, l. 2495 (Réglages › reglages-donnees › Bouton « Générer l'export anonymisé ») :
  > `table_correspondance_a2026_PRIVE_2026-10-13.json` (263 o) : même contenu que la clé `tableCorrespondance_a2026`, clé secrète en clair.
- Catégorie : 3 · fait autrement

**9.80** · Geste : Générer l'export anonymisé (pour la recherche)
- Intention, l. 3524 :
  > les vrais indices A, C et P de chaque élève, de 0 à 100 ; un P non constructible est laissé vide, jamais 0
- Observation, l. 2494 (Réglages › reglages-donnees › Bouton « Générer l'export anonymisé ») :
  > `observations` (`etudiants` 4 entrées `{id_anonyme, statut, profil{programme:"999.ZZ", services_adaptes}, resultats_ulterieurs}`
- Observation, l. 2491 (Réglages › reglages-donnees › Bouton « Générer l'export anonymisé ») :
  > avec 15 captures présentes, le fichier contient `calculs.snapshots_hebdomadaires: []`
- Catégorie : 3 · fait autrement

**9.81** · Geste : Générer l'export anonymisé (pour la recherche)
- Intention, l. 3525 :
  > « Indices calculés par Labo Codex » ; assiduité « périodes présentes ÷ périodes offertes, cumulées depuis le début du trimestre (%) »
- Observation : aucune mention (termes cherchés : « Indices calculés par Labo Codex », « périodes présentes », « artefacts remis », « la méthode varie », « formules »)
- Catégorie : 2 · prévu mais pas fait

**9.82** · Geste : Générer l'export anonymisé (pour la recherche)
- Intention, l. 3526 :
  > le niveau SOLO dans le vocabulaire français configuré
- Observation : aucune mention (termes cherchés : « SOLO », « niveau SOLO », « vocabulaire »)
- Catégorie : 2 · prévu mais pas fait

**9.83** · Geste : Générer l'export anonymisé (pour la recherche)
- Intention, l. 3528 :
  > les gestes cognitifs (Repérage, Liaison, Ouverture), quand l'observation des actions est activée
- Observation : aucune mention (termes cherchés : « Repérage », « Liaison », « gestes cognitifs », « RLO », « actions »)
- Catégorie : 2 · prévu mais pas fait

**9.84** · Geste : Générer l'export anonymisé (pour la recherche)
- Intention, l. 3529 :
  > un·e étudiant·e supprimé·e dans le Cadre en est écarté·e
- Observation : aucune mention (termes cherchés : « supprimé », « écarté », « désinscrit »)
- Catégorie : 2 · prévu mais pas fait

**9.85** · Geste : Générer l'export anonymisé (pour la recherche)
- Intention, l. 3530 :
  > un export déjà produit n'est pas corrigé ; il faut le générer de nouveau
- Observation : aucune mention (termes cherchés : « déjà produit », « corrigé », « de nouveau »)
- Catégorie : 2 · prévu mais pas fait

**9.86** · Sans geste
- Intention, l. 3534 :
  > Les captures automatiques ne se font pas les jours où seul un autre groupe a cours
- Observation : aucune mention (termes cherchés : « autre groupe », « captures automatiques », « capture automatique »)
- Catégorie : 2 · prévu mais pas fait

**9.87** · Sans geste
- Intention, l. 3535 :
  > Les courbes de performance gardées dans les captures sont celles de l'élève ; les captures déjà faites gardent leur valeur
- Observation, l. 2929 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Graphique hebdomadaire mesures C et P avec valeurs : les captures reconstruites contiennent C = P = null ; seul le message vide est atteignable.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 76 · Réglages › Gestion avancée

**9.88** · Geste : Supprimer une ressource (pratique, grille, cartouche, échelle, production, alignement)
- Intention, l. 3542 :
  > Données : non documenté
- Observation, l. 2520 (Réglages › reglages-donnees › Boutons « Supprimer ») :
  > pour une grille, suppression aussi de `<trim>_cartouches_<id>` et retrait de la bibliothèque ; pour les gabarits intégrés, `marquerRessourceSupprimee`
- Observation, l. 2520 (Réglages › reglages-donnees › Boutons « Supprimer ») :
  > (grille `GRILLE_FICTIVE_ZORGLUB` retirée)
- Catégorie : 1 · fait sans être prévu

**9.89** · Geste : Supprimer une ressource (pratique, grille, cartouche, échelle, production, alignement)
- Intention, l. 3543 :
  > si le codex n'est pas à jour, la fenêtre « Mettre ton codex à jour avant de supprimer ? » vient d'abord
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, […]) : […] ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.90** · Geste : Supprimer un paramètre de configuration
- Intention, l. 3547 :
  > Données : non documenté
- Observation, l. 2527 (Réglages › reglages-donnees › Bouton « Supprimer » d'un paramètre) :
  > `preferencesUtilisateur : {} → null` (la clé n'est pas retirée, sa valeur devient `null`, localStorage + IndexedDB)
- Catégorie : 1 · fait sans être prévu

**9.91** · Sans geste
- Intention, l. 3551 :
  > Non documenté dans les sources lues.
- Observation, l. 2821 (Ce qui se produit sans geste de l'utilisateur › Réglages) :
  > Affichage de « Données » : `chargerVueDonnees` 100 ms après (compteurs du sélecteur de ressources, statistiques de captures, liste des packages importés)
- Catégorie : 1 · fait sans être prévu

### Écran 77 · Réglages › Données › Maintenance

**9.92** · Geste : Réinitialiser toutes les données
- Intention, l. 3560 :
  > la question « As-tu exporté tes données ? » disparaît
- Observation, l. 2534 (Réglages › reglages-donnees › Bouton « Réinitialiser toutes les données ») :
  > `confirm` « Cette action est IRRÉVERSIBLE. As-tu exporté tes données avant de continuer ? »
- Catégorie : 3 · fait autrement

### Écran 78 · Réglages › Préférences

**9.93** · Geste : Mémoriser le dossier Travaux et les Archives entre les sessions (Sécurité)
- Intention, l. 3575 :
  > l'infobulle nomme les navigateurs qui le permettent et le dossier à choisir
- Observation, l. 2972 (Ce qui n'a pas pu être observé › Réglages) :
  > Boutons d'aide `.btn-aide-contextuelle[data-aide="reglages-reserve"]` et infobulles `data-tooltip` : gérés par le module d'aide (hors périmètre), non observés.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Écran 79 · Réglages › À propos

**9.94** · Sans geste
- Intention, l. 3585 :
  > Cite le rapport de recherche « Laissons-les se tromper » (PAREA, Cégep André-Laurendeau, 2026), avec le lien dans « Sources et remerciements »
- Observation : aucune mention (termes cherchés : « Laissons-les se tromper », « PAREA », « André-Laurendeau », « Sources et remerciements », « remerciements », « rapport de recherche »)
- Catégorie : 2 · prévu mais pas fait

**9.95** · Sans geste
- Intention, l. 3586 :
  > elles sont dans la carte « Nouveautés » de l'accueil
- Observation, l. 193 (Écran Accueil › Tuiles UTILITAIRES) :
  > **« Nouveautés »** (`afficherModalNouveautes`) — voir Modale Nouveautés (en-tête).
- Observation, l. 86 (En-tête et navigation globale › Modale Nouveautés) :
  > `#changelog-contenu` vide (le tableau `CHANGELOG` est vide, js/changelog-data.js:3-23)
- Catégorie : 3 · fait autrement

### Écran 80 · Mode anonymisation (transversal)

**9.96** · Sans geste
- Intention, l. 3592 :
  > seuls les noms, et tout ce qui pourrait identifier un·e élève, sont cachés à l'écran
- Observation, l. 123 (En-tête et navigation globale › Boutons d'action de l'en-tête) :
  > **Case « Afficher DA réels » `#checkbox-da-anonyme`** (`definirOptionAffichageDADepuisCheckbox`, js/modes.js:860-866, 1101) — `+ anonymisation_afficher_da_reel = true`, puis `false` au décochage ; contenu rafraîchi
- Catégorie : 3 · fait autrement

**9.97** · Sans geste
- Intention, l. 3592 :
  > seuls les noms, et tout ce qui pourrait identifier un·e élève, sont cachés à l'écran
- Observation, l. 123 (En-tête et navigation globale › Boutons d'action de l'en-tête) :
  > **Case « Afficher DA réels » `#checkbox-da-anonyme`** (`definirOptionAffichageDADepuisCheckbox`, js/modes.js:860-866, 1101) — `+ anonymisation_afficher_da_reel = true`
- Catégorie : 3 · fait autrement

**9.98** · Sans geste
- Intention, l. 3594 :
  > avec la mention « Masqué en anonymisation »
- Observation, l. 2935 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Mode anonymisation (masquage des noms, notes confidentielles et notes de rapport) : non activé.
- Observation, l. 2945 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > Mode anonymisation (champs de notes masqués, `data-masque-anonymisation`) : non activé (relève d'un autre écran).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.99** · Sans geste
- Intention, l. 3595 :
  > Le titre d'une intervention s'affiche « Intervention du [date] » (« Rencontre du [date] » dans les rencontres) ; la pastille du volet confidentiel ne paraît pas
- Observation, l. 2945 (Ce qui n'a pas pu être observé › Suivi › Saisie des présences, interventions, rencontres, animation) :
  > Mode anonymisation (champs de notes masqués, `data-masque-anonymisation`) : non activé (relève d'un autre écran).
- Observation, l. 2935 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Mode anonymisation (masquage des noms, notes confidentielles et notes de rapport) : non activé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**9.100** · Sans geste
- Intention, l. 3596 :
  > Le mode fonctionne aussi sur un trimestre neuf et en démonstration
- Observation : aucune mention (termes cherchés : « démonstration », « démo », « demo_ », « anonymisation »)
- Catégorie : 2 · prévu mais pas fait

### Fait sans être prévu, sans ligne correspondante dans l'intention

**9.101** · Réglages › reglages-preferences › Cases
- Intention : aucune mention (termes cherchés : « animation », « points animés », « animation des barres », « Préférences »)
- Observation, l. 2419 (Réglages › reglages-preferences › Cases) :
  > animation décochée : `animationPoints: true → false` ; recochée : `false → true`.
- Observation, l. 2423 (Réglages › reglages-preferences › Cases) :
  > animation décochée → classe `animation-points-desactivee` ajoutée à `<body>`
- Catégorie : 1 · fait sans être prévu

**9.102** · Réglages › reglages-preferences › Cases
- Intention : aucune mention (termes cherchés : « contexte des graphiques », « contexte graph », « graphiques », « Préférences »)
- Observation, l. 2420 (Réglages › reglages-preferences › Cases) :
  > contexte décoché : `afficherContexteGraphiques: true → false`.
- Catégorie : 1 · fait sans être prévu

**9.103** · Réglages › reglages-preferences › Cases
- Intention : aucune mention (termes cherchés : « chronomètre », « chrono », « préférence »)
- Observation, l. 2421 (Réglages › reglages-preferences › Cases) :
  > chrono coché : `chronoEvaluation: false → true`.
- Catégorie : 1 · fait sans être prévu

**9.104** · Réglages › reglages-preferences › Cases
- Intention : aucune mention (termes cherchés : « SIS », « Léa », « Colnet », « Coba », « système »)
- Observation, l. 2422 (Réglages › reglages-preferences › Cases) :
  > SIS « autre » : `sisDefaut: "lea" → "autre"`. Options du sélecteur : `lea`, `coba` (désactivée), `colnet` (désactivée), `autre`.
- Catégorie : 1 · fait sans être prévu

**9.105** · Réglages › reglages-donnees › Bouton « Exporter ma config »
- Intention : aucune mention (termes cherchés : « ZIP léger », « léger », « Exporter ma config »)
- Observation, l. 2448 (Réglages › reglages-donnees › Bouton « Exporter ma config ») :
  > La carte de l'écran affiche « ZIP léger… » alors que les fichiers produits sont un JSON et un TXT
- Catégorie : 1 · fait sans être prévu

**9.106** · Réglages › reglages-donnees › Accordéons
- Intention : aucune mention (termes cherchés : « accordéon », « état des accordéons », « pli », « replié »)
- Observation, l. 2476 (Réglages › reglages-donnees › Accordéons) :
  > au premier clic, nouvelle clé `etatsAccordeonsV2` (localStorage + IndexedDB) = objet de tous les accordéons de l'application
- Catégorie : 1 · fait sans être prévu

**9.107** · Réglages › reglages-donnees › Bouton « Supprimer les captures »
- Intention : aucune mention (termes cherchés : « Supprimer les captures », « supprimer les captures », « effacer les captures », « TOUTES les captures »)
- Observation, l. 2485 (Réglages › reglages-donnees › Bouton « Supprimer les captures ») :
  > Bouton « Supprimer les captures »
- Observation, l. 2486 (Réglages › reglages-donnees › Bouton « Supprimer les captures ») :
  > `a2026_snapshots_COURS_…` : 15 captures → `{"hebdomadaires":[],"interventions":[]}`
- Catégorie : 1 · fait sans être prévu

**9.108** · Réglages › reglages-donnees › Bouton « Générer l'export anonymisé »
- Intention : aucune mention (termes cherchés : « correspondance », « clé secrète », « table de correspondance », « tableCorrespondance »)
- Observation, l. 2492 (Réglages › reglages-donnees › Bouton « Générer l'export anonymisé ») :
  > nouvelle clé `tableCorrespondance_a2026` (localStorage + IndexedDB)
- Catégorie : 1 · fait sans être prévu

**9.109** · Réglages › reglages-donnees › Boutons « Voir »
- Intention : aucune mention (termes cherchés : « « Voir » », « Voir », « naviguer », « Gestion avancée »)
- Observation, l. 2513 (Réglages › reglages-donnees › Boutons « Voir ») :
  > Boutons « Voir » `[data-action="naviguerVersRessource"]`
- Observation, l. 2514 (Réglages › reglages-donnees › Boutons « Voir ») :
  > « Voir » sur une échelle → section `section-conception`, sous-section `conception-echelle-performance`
- Catégorie : 1 · fait sans être prévu

**9.110** · Réglages › reglages-donnees › Partage entre collègues : zone
- Intention : aucune mention (termes cherchés : « déjà importé ce package », « Remplacer par cette version », « réimport », « .lcz »)
- Observation, l. 2549 (Réglages › reglages-donnees › Partage entre collègues : zone) :
  > Tu as déjà importé ce package (le 14 octobre 2026). Confirmer remplacera la copie existante par cette version. » [Annuler] [Remplacer par cette version]
- Catégorie : 1 · fait sans être prévu

**9.111** · Réglages › reglages-donnees › Carte « Archives (dépôt local) »
- Intention : aucune mention (termes cherchés : « Vérifier le dossier », « vérifier le dossier »)
- Observation, l. 2560 (Réglages › reglages-donnees › Carte « Archives (dépôt local) ») :
  > « Vérifier le dossier » (`ReserveReglages.actionVerifierDossier`)
- Catégorie : 1 · fait sans être prévu

**9.112** · Réglages › reglages-donnees › Carte « Archives (dépôt local) »
- Intention : aucune mention (termes cherchés : « Changer le dossier », « changer de dossier »)
- Observation, l. 2560 (Réglages › reglages-donnees › Carte « Archives (dépôt local) ») :
  > « Changer le dossier… » (`Reserve.actionChangerDossier`)
- Catégorie : 1 · fait sans être prévu

**9.113** · Réglages › reglages-donnees › Carte « Archives (dépôt local) »
- Intention : aucune mention (termes cherchés : « Effacer la liaison », « liaison », « délier »)
- Observation, l. 2560 (Réglages › reglages-donnees › Carte « Archives (dépôt local) ») :
  > « Effacer la liaison » (`ReserveReglages.actionEffacerLiaison`, `data-confirm`)
- Catégorie : 1 · fait sans être prévu

**9.114** · Réglages › reglages-donnees › « Rafraîchir la liste »
- Intention : aucune mention (termes cherchés : « Rafraîchir », « rafraîchir la liste », « actualiser »)
- Observation, l. 2563 (Réglages › reglages-donnees › « Rafraîchir la liste ») :
  > « Rafraîchir la liste » `[data-action="ReserveReglages.rafraichir"]`
- Observation, l. 2564 (Réglages › reglages-donnees › « Rafraîchir la liste ») :
  > Relit `_manifesteReserve` et redessine bandeau + tableau
- Catégorie : 1 · fait sans être prévu

**9.115** · Réglages › reglages-donnees › « Extraire un codex data… »
- Intention : aucune mention (termes cherchés : « codex data », « Codex data », « Extraire », « extraction », « combiner »)
- Observation, l. 2581 (Réglages › reglages-donnees › « Extraire un codex data… ») :
  > « Extraire un codex data… » `[data-action="CodexDataUI.actionOuvrirExtraction"]`
- Observation, l. 2583 (Réglages › reglages-donnees › « Extraire un codex data… ») :
  > modale « Extraire un codex data / … Mode fichiers — choisis manuellement les fichiers d'archive à combiner.
- Catégorie : 1 · fait sans être prévu

**9.116** · Réglages › reglages-a-propos
- Intention : aucune mention (termes cherchés : « codexnumeris », « AGPL », « icons8 », « gradingforgrowth », « aqpc », « liens »)
- Observation, l. 2588 (Réglages › reglages-a-propos) :
  > Liens (tous `target=_blank`, `rel="noopener noreferrer"`) : https://codexnumeris.org/, https://codexnumeris.org/#/portal/support, https://www.gnu.org/licenses/agpl-3.0.html
- Catégorie : 1 · fait sans être prévu

**9.117** · Ce qui se produit sans geste de l'utilisateur › Réglages
- Intention : aucune mention (termes cherchés : « manifeste », « manifeste-archives », « au démarrage », « relit »)
- Observation, l. 2823 (Ce qui se produit sans geste de l'utilisateur › Réglages) :
  > 100 ms après `load`, si une poignée de dossier est mémorisée et autorisée en lecture, relit `manifeste-archives.json` du dossier
- Catégorie : 1 · fait sans être prévu

---

## Annexe · Renvois entre zones

### Introduction de la partie

**A.1**
- Intention, l. 3602 :
  > Ces lignes sont des renvois, pas des intentions nouvelles
- Observation, l. 3 () :
  > Ce document décrit ce que fait le programme contenu dans ce dépôt, d'après son code et son exécution. Il ne dit rien de l'intention de ses auteur·es.
- Catégorie : 4 · non comparable (hors de la copie observée)

### Notés par l'analyste « entrée et codex »

**A.2**
- Intention, l. 3606 :
  > carte « Ouverture et partage »
- Observation : aucune mention (termes cherchés : « Ouverture et partage », « Ouverture », « carte »)
- Catégorie : 2 · prévu mais pas fait

**A.3**
- Intention, l. 3606 :
  > cases qui ajoutent sans remplacer
- Observation, l. 2456 (Réglages › reglages-donnees › Bouton « Ouvrir un Codex… ») :
  > « Attention : L'importation écrasera les données existantes pour les clés importées. »
- Observation, l. 2466 (Réglages › reglages-donnees › Bouton « Ouvrir un Codex… ») :
  > « Attention : cette option remplacera ta configuration actuelle »
- Observation, l. 2467 (Réglages › reglages-donnees › Bouton « Ouvrir un Codex… ») :
  > `trimestres` : nom « Trimestre Fictif Zorglub » → « Trimestre Fictif Bidule »
- Catégorie : 3 · fait autrement

**A.4**
- Intention, l. 3606 :
  > élève supprimé jamais ramené
- Observation : aucune mention (termes cherchés : « ramené », « élève supprimé », « supprimé n'a pas été », « Ouvrir un Codex »)
- Catégorie : 2 · prévu mais pas fait

**A.5**
- Intention, l. 3607 :
  > « Vérifier », « Faire revenir »
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.6**
- Intention, l. 3607 :
  > « Renvoyer aux archives », « Archiver les copies… »
- Observation, l. 312 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > section « Trimestres clos » : [Rouvrir] + ⋮ [Archiver le trimestre…] [Archiver les copies…] [Renvoyer aux archives…] [Supprimer…]
- Observation, l. 2565 (Réglages › reglages-donnees › « Rafraîchir la liste ») :
  > avec les boutons « Vérifier » (`ReserveVerifier.actionVerifier`), « Faire revenir »[…]« Terminer le renvoi » (`ReserveRenvoyer.actionReprendre`) et « Retirer »
- Catégorie : 3 · fait autrement

**A.7**
- Intention, l. 3608 :
  > archiver un trimestre entier
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.8**
- Intention, l. 3608 :
  > Cadre › Trimestre › Bibliothèque[…]créer et supprimer un trimestre
- Observation, l. 308 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > `[data-action=ouvrirCreationTrimestreV2]` « + Nouveau trimestre »
- Observation, l. 312 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > Aucun trimestre : toast « Aucun trimestre dans la bibliothèque. Clique sur « + Nouveau trimestre » pour en créer un. »
- Observation, l. 312 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > carte du trimestre actif (« Actif », « Trimestre actuellement actif », sans bouton) ; autre trimestre « Disponible » [Activer] + menu ⋮ [Clore] [Supprimer…]
- Catégorie : 3 · fait autrement

**A.9**
- Intention, l. 3613 :
  > tout s'enregistre
- Observation, l. 1949 (Suivi — observation : groupe, liste, profils › Profils individuels › Bouton « Confidentiel ») :
  > En mode anonymisation, champs masqués et vidés, aucune écriture
- Observation, l. 1993 (Suivi : saisie des présences, interventions, rencontres, animation › Saisie des présences › Champ de notes) :
  > En mode anonymisation, le champ est vide, désactivé, et la note existante est conservée telle quelle à l'écriture
- Catégorie : 3 · fait autrement

**A.10**
- Intention, l. 3615 :
  > l'écran d'import dit « Rangement : dans le navigateur »
- Observation, l. 1704 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-exporter) :
  > encart « Espace de stockage » : « 317.2 Ko utilisés sur 937.3 Mo (0 %) | 2 fichiers de travaux (69.1 Ko) | Rangement : dans le navigateur »
- Observation, l. 1558 (Évaluation — travaux (importer, annoter, exporter) › #evaluations-importer) :
  > un bouton « Configurer le stockage sur disque » avec « L'accès au dossier sera redemandé à chaque démarrage. Pour le mémoriser : Réglages > Préférences > Sécurité. »
- Catégorie : 3 · fait autrement

**A.11**
- Intention, l. 3615 :
  > le DA de démo lu à l'import
- Observation : aucune mention (termes cherchés : « DA de démo », « démo », « demo_ », « import »)
- Catégorie : 2 · prévu mais pas fait

**A.12**
- Intention, l. 3615 :
  > le dépistage et les évaluations de la démo
- Observation : aucune mention (termes cherchés : « dépistage », « démo », « Défi spécifique », « grille du pack »)
- Catégorie : 2 · prévu mais pas fait

### Notés par l'analyste « Cadre »

**A.13**
- Intention, l. 3620 :
  > « Faire revenir » un trimestre ou ses copies, « Vérifier » une archive
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.14**
- Intention, l. 3620 :
  > « Finir de renvoyer »
- Observation, l. 2565 (Réglages › reglages-donnees › « Rafraîchir la liste ») :
  > « Terminer le renvoi » (`ReserveRenvoyer.actionReprendre`)
- Catégorie : 3 · fait autrement

**A.15**
- Intention, l. 3621 :
  > le démarrage qui attend que le trimestre soit connu
- Observation : aucune mention (termes cherchés : « trimestre connu », « attend », « démarrage », « auDbPret », « initialiserSaisiePresences »)
- Catégorie : 2 · prévu mais pas fait

**A.16**
- Intention, l. 3626 :
  > l'import par cases qui écarte un élève supprimé (« 1 élève que tu avais supprimé n'a pas été ramené. »)
- Observation : aucune mention (termes cherchés : « n'a pas été ramené », « élève que tu avais supprimé », « ramené », « élève supprimé »)
- Catégorie : 2 · prévu mais pas fait

**A.17**
- Intention, l. 3628 :
  > Une copie « Aux archives » ouverte dans l'évaluation
- Observation, l. 2850 (Ce qui n'a pas pu être observé › Cadre (trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours, calendrier)) :
  > Bibliothèque des trimestres, entrées « Archiver le trimestre… », « Archiver les copies… », « Renvoyer aux archives… » (`ReserveTrimestre`, `ReserveCopies`, `ReserveRenvoyer`) : elles ouvrent des modules d'archivage hors de l'onglet Cadre ; non exécutées.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.18**
- Intention, l. 3631 :
  > La barre A du Suivi du groupe qui renvoie à Cadre › Trimestre › Horaire quand aucune séance ne porte ses périodes
- Observation : aucune mention (termes cherchés : « Horaire », « Cadre › Trimestre », « barre A », « séance en attente », « périodes »)
- Catégorie : 2 · prévu mais pas fait

### Notés par l'analyste « Conception I »

**A.19**
- Intention, l. 3637 :
  > « Paliers (bornes en %) », échelle de départ préremplie, colonnes titrées par les bornes
- Observation : aucune mention (termes cherchés : « Paliers », « bornes en % », « préremplie », « grille analytique », « cartouche »)
- Catégorie : 2 · prévu mais pas fait

**A.20**
- Intention, l. 3639 :
  > « Dupliquer vers mes documents »
- Observation, l. 940 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Fenêtre « Bibliothèque de grilles de critères ») :
  > « Dupliquer » (`dupliquerGrilleBibliotheque`, js/grilles.js:2077) : ajout dans `a2026_grillesTemplates` de « Grille de départ (copie) »
- Observation, l. 864 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > « Dupliquer », menu « ⋮ » : « Exporter pour partager », « Retirer », « Supprimer »
- Catégorie : 3 · fait autrement

**A.21**
- Intention, l. 3639 :
  > mise en évidence après import
- Observation : aucune mention (termes cherchés : « mise en évidence », « en évidence », « surbrillance », « après import »)
- Catégorie : 2 · prévu mais pas fait

**A.22**
- Intention, l. 3640 :
  > Une production partagée ou restaurée arrive sans cours, gardé tel quel
- Observation, l. 876 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › Fenêtre « Bibliothèque de productions ») :
  > les 5 entrées de `bibliothequeProductions` sont remplacées (`dateEcheance: "" → null`, `categorie: "" → null`, `auteur` retiré, `coursId` ajouté)
- Catégorie : 3 · fait autrement

**A.23**
- Intention, l. 3641 :
  > « Appliquer à la pratique »
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Mode édition de l'assistant (`ouvrirWizardV2(true, id)`, titre « Appliquer à la pratique »
- Observation, l. 2884 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > aucun déclencheur dans ce sous-écran.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.24**
- Intention, l. 3643 :
  > Saisie d'un critère analytique en points, l'élève ne lit que le chiffre
- Observation, l. 2900 (Ce qui n'a pas pu être observé › Évaluation › Liste et saisie des évaluations) :
  > Critères analytiques (points `pointsSaisis`, js/evaluation-chargement.js:1148)[…]: non exécutés (la grille utilisée est holistique).
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.25**
- Intention, l. 3644 :
  > tampons restitués dans la synthèse PDF, sans interprétation
- Observation : aucune mention (termes cherchés : « tampons », « synthèse PDF », « page de synthèse », « stickers », « autocollant »)
- Catégorie : 2 · prévu mais pas fait

**A.26**
- Intention, l. 3646 :
  > Signalement affiché à côté du palier RàI et dans la vue du groupe
- Observation, l. 2930 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > signalements de dépistage (`afficherSignalementsDepistage`[…]: non affichés sans grille de critères de dépistage désignée (Labo, hors périmètre) ni pratique PAN.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

### Notés par l'analyste « Conception II »

**A.27**
- Intention, l. 3651 :
  > la cartouche de l'évaluation fait foi
- Observation : aucune mention (termes cherchés : « fait foi », « cartouche de l'évaluation », « cartoucheId », « Consulter »)
- Catégorie : 2 · prévu mais pas fait

**A.28**
- Intention, l. 3651 :
  > choisir une autre cartouche propose de remplacer les commentaires
- Observation : aucune mention (termes cherchés : « remplacer les commentaires », « autre cartouche », « selectCartoucheEval », « choisirCartoucheEval »)
- Catégorie : 2 · prévu mais pas fait

**A.29**
- Intention, l. 3652 :
  > La visionneuse ne pose plus la cartouche ou l'échelle d'une autre copie
- Observation : aucune mention (termes cherchés : « visionneuse », « autre copie », « cartouche », « échelle »)
- Catégorie : 2 · prévu mais pas fait

**A.30**
- Intention, l. 3653 :
  > Le texte copié vers Léa donne le commentaire enregistré, une cartouche retouchée après coup ne le change plus
- Observation : aucune mention (termes cherchés : « Léa », « retouchée », « commentaire enregistré », « Copier »)
- Catégorie : 2 · prévu mais pas fait

**A.31**
- Intention, l. 3654 :
  > La rétroaction de l'élève n'affiche plus l'étiquette « Contexte » vide sans cartouche
- Observation : aucune mention (termes cherchés : « Contexte », « CONTEXTE », « sans cartouche », « (aucune) »)
- Catégorie : 2 · prévu mais pas fait

**A.32**
- Intention, l. 3656 :
  > Supprimer une grille qui porte des cartouches est refusé et nomme les cartouches
- Observation, l. 930 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › « Supprimer ») :
  > Grille portant des cartouches mais sans production ni évaluation : `confirm` de déplacement, `prompt` « Sélectionne la grille d'accueil … Entre le numéro de la grille : » puis déplacement des cartouches
- Observation, l. 2518 (Réglages › reglages-donnees › Boutons « Supprimer ») :
  > Pour « Grille de départ », bloc « Attention / 1 cartouche(s) associée(s) seront aussi supprimées ».
- Catégorie : 3 · fait autrement

**A.33**
- Intention, l. 3657 :
  > « Remplacer l'existante » pour une échelle ou une grille
- Observation : aucune mention (termes cherchés : « Remplacer l'existante », « Conflit de nom », « doublon », « verifierEtGererDoublon »)
- Catégorie : 2 · prévu mais pas fait

**A.34**
- Intention, l. 3658 :
  > Une production rattachée à un bloc Évaluation de la carte reçoit sa date de remise
- Observation, l. 569 (Conception — Carte d'alignement › Sous-écran Carte d'alignement › Inspecteur — champs) :
  > Production `#planif-panneau-production` (2422-2429) : non exercée (aucune production dans l'état de base ; seule option « Aucune », observé).
- Catégorie : 4 · non comparable (non observé (déclaré dans le corps de l'observation))

**A.35**
- Intention, l. 3659 :
  > chaque absence nomme la leçon prévue dans la carte
- Observation : aucune mention (termes cherchés : « leçon », « absence », « carte », « Engagement »)
- Catégorie : 2 · prévu mais pas fait

**A.36**
- Intention, l. 3660 :
  > Sans pratique assignée, profil, Suivi et export écrivent un tiret au lieu d'une note
- Observation : aucune mention (termes cherchés : « tiret », « sans pratique », « Aucune pratique », « pratiqueId », « — »)
- Catégorie : 2 · prévu mais pas fait

**A.37**
- Intention, l. 3663 :
  > cartouches liées à leur grille, rangées dans le trimestre ouvert, sans doublon
- Observation : aucune mention (termes cherchés : « cartouche », « Importer la sélection », « import sélectif », « déjà présente »)
- Catégorie : 2 · prévu mais pas fait

**A.38**
- Intention, l. 3663 :
  > bilan « N cartouche(s) déjà présente(s) à l'identique, non ajoutée(s) »
- Observation : aucune mention (termes cherchés : « déjà présente(s) à l'identique », « à l'identique », « non ajoutée »)
- Catégorie : 2 · prévu mais pas fait

**A.39**
- Intention, l. 3664 :
  > Une archive rouverte propose toutes ses cartouches, ses grilles, ses échelles et ses pratiques
- Observation, l. 2969 (Ce qui n'a pas pu être observé › Réglages) :
  > « Ouvrir une archive… » avec une vraie archive ZIP (étape « Sélectionne ce que tu veux réimporter »[…]: interaction interrompue (accordéon replié par le geste de test) ; seul le gabarit vide de l'étape de sélection a été vu.
- Observation, l. 2575 (Réglages › reglages-donnees › « Ouvrir une archive… ») :
  > « Ouvrir une archive / Consulte tes archives archivés pour réimporter des grilles, échelles ou tampons dans tes bibliothèques actives. »
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.40**
- Intention, l. 3664 :
  > une production importée retrouve sa cartouche
- Observation : aucune mention (termes cherchés : « retrouve sa cartouche », « cartoucheId », « production importée », « cartouche »)
- Catégorie : 2 · prévu mais pas fait

### Notés par l'analyste « Évaluation »

**A.41**
- Intention, l. 3671 :
  > jeton « {service} » du service d’aide
- Observation : aucune mention (termes cherchés : « {service} », « jeton », « service d'aide », « nomServiceAide »)
- Catégorie : 2 · prévu mais pas fait

**A.42**
- Intention, l. 3672 :
  > ou un niveau employé propose le codex
- Observation : aucune mention (termes cherchés : « niveau employé », « supprimerNiveauEchelle », « Supprimer ce niveau », « codex »)
- Catégorie : 2 · prévu mais pas fait

**A.43**
- Intention, l. 3673 :
  > Passer une grille en « Analytique » quand des critères n'ont pas de type : avis et bouton dans l'éditeur
- Observation : aucune mention (termes cherchés : « sans type », « pas de type », « Analytique », « avis »)
- Catégorie : 2 · prévu mais pas fait

**A.44**
- Intention, l. 3674 :
  > le profil dit « N évaluations … non comptées »
- Observation : aucune mention (termes cherchés : « non comptées », « non comptée », « évaluations … non comptées »)
- Catégorie : 2 · prévu mais pas fait

**A.45**
- Intention, l. 3675 :
  > Non tranché, hors zone : ce que vaut un travail non remis dans la note du cours, famille par famille
- Observation, l. 1926 (Suivi — observation : groupe, liste, profils › Profils individuels › Entrées de la barre latérale) :
  > production 2 « Non remis — Évaluer » ; « Travail Fictif-Zorglub 1 · poids 100 % (I 50.8%) (50.8 × 50) ÷ 50 = 50.7% »
- Catégorie : 4 · non comparable (Non tranché)

**A.46**
- Intention, l. 3677 :
  > vignette de « Travaux soumis »[…]« Télécharger ZIP des travaux »
- Observation, l. 2933 (Ce qui n'a pas pu être observé › Suivi › Groupe, liste, profil) :
  > Section « Travaux soumis » : vignettes `[data-action=travauxUI.ouvrirFichier]` et bouton `[data-action=lancerExportEtudiantAnnotes]` (export des copies annotées) : aucun travail importé.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.47**
- Intention, l. 3678 :
  > « Faire revenir » les copies[…]« Vérifier » une archive
- Observation, l. 2968 (Ce qui n'a pas pu être observé › Réglages) :
  > « Vérifier » d'une archive ZIP avec un fichier choisi, « Faire revenir », « Emprunter », « Terminer le renvoi » : le sélecteur de fichier créé par le code n'a pas été intercepté dans le délai (5 s)
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.48**
- Intention, l. 3678 :
  > « Renvoyer aux archives », archiver un trimestre ou un groupe
- Observation, l. 312 (Cadre › calendrier-trimestre › Accordéon « Trimestre ») :
  > section « Trimestres clos » : [Rouvrir] + ⋮ [Archiver le trimestre…] [Archiver les copies…] [Renvoyer aux archives…] [Supprimer…]
- Observation, l. 141 (En-tête et navigation globale › Menu Codex) :
  > « Exporter une sélection… », « Archiver… », « Ouvrir une archive… »
- Observation, l. 2564 (Réglages › reglages-donnees › « Rafraîchir la liste ») :
  > « Aucune archive pour l'instant. Utilise Codex › Archiver… »
- Catégorie : 3 · fait autrement

**A.49**
- Intention, l. 3679 :
  > il emporte la corbeille
- Observation : aucune mention (termes cherchés : « corbeille », « corbeilleFichiers », « donnees.json », « codex »)
- Catégorie : 2 · prévu mais pas fait

**A.50**
- Intention, l. 3679 :
  > copies manquantes à l'écriture
- Observation : aucune mention (termes cherchés : « copies manquantes », « manquante », « n'aura pas toutes »)
- Catégorie : 2 · prévu mais pas fait

**A.51**
- Intention, l. 3679 :
  > ouverture d'un ancien fichier qui n'ajoute rien d'un élève supprimé
- Observation : aucune mention (termes cherchés : « élève supprimé », « ramené », « elevesDesinscrits », « ancien fichier »)
- Catégorie : 2 · prévu mais pas fait

**A.52**
- Intention, l. 3682 :
  > son aide sur les indices C et P
- Observation : aucune mention (termes cherchés : « indices C et P », « Consignes transmises », « aide », « Complétion »)
- Catégorie : 2 · prévu mais pas fait

**A.53**
- Intention, l. 3683 :
  > Plan « Rythme » du chronomètre (avril 2026, en attente de validation, archivé) : non retenu comme intention
- Observation, l. 3 () :
  > Ce document décrit ce que fait le programme contenu dans ce dépôt, d'après son code et son exécution. Il ne dit rien de l'intention de ses auteur·es.
- Catégorie : 4 · non comparable (hors de la copie observée)

### Notés par l'analyste « Suivi I »

**A.54**
- Intention, l. 3689 :
  > le lot 10 du 11 oct. 2026 la branche
- Observation : aucune mention (termes cherchés : « Décrochage », « cible d'intervention », « cause », « Interventions recommandées »)
- Catégorie : 2 · prévu mais pas fait

**A.55**
- Intention, l. 3691 :
  > cases qui retirent des sections du profil
- Observation : aucune mention (termes cherchés : « sections du profil », « afficherDeveloppementHabiletes », « afficherGraphiques », « retire », « masque »)
- Catégorie : 2 · prévu mais pas fait

**A.56**
- Intention, l. 3693 :
  > export anonymisé avec les indices A, C, P de 0 à 100, P vide si non constructible
- Observation, l. 2494 (Réglages › reglages-donnees › Bouton « Générer l'export anonymisé ») :
  > `observations` (`etudiants` 4 entrées `{id_anonyme, statut, profil{programme:"999.ZZ", services_adaptes}, resultats_ulterieurs}`, `presences` 0, `evaluations` 0)
- Observation, l. 2491 (Réglages › reglages-donnees › Bouton « Générer l'export anonymisé ») :
  > avec 15 captures présentes, le fichier contient `calculs.snapshots_hebdomadaires: []`
- Catégorie : 3 · fait autrement

**A.57**
- Intention, l. 3694 :
  > La couleur cyan de la section Suivi dans la navigation
- Observation : aucune mention (termes cherchés : « cyan », « couleur », « daltonisme », « navigation »)
- Catégorie : 2 · prévu mais pas fait

**A.58**
- Intention, l. 3695 :
  > Les barres à bulles visibles aussi depuis l'Accueil
- Observation : aucune mention (termes cherchés : « barres à bulles », « bulles », « barre-etudiant », « Accueil »)
- Catégorie : 2 · prévu mais pas fait

### Notés par l'analyste « Suivi II »

**A.59**
- Intention, l. 3701 :
  > paliers, verdicts, […]phrase « Il est recommandé de t'inscrire… »
- Observation : aucune mention (termes cherchés : « Il est recommandé », « paliers », « verdicts », « projection »)
- Catégorie : 2 · prévu mais pas fait

**A.60**
- Intention, l. 3701 :
  > la case de palier
- Observation : aucune mention (termes cherchés : « case de palier », « palier », « projection », « Projection à l'EUF »)
- Catégorie : 2 · prévu mais pas fait

**A.61**
- Intention, l. 3704 :
  > bilan des fondamentaux
- Observation : aucune mention (termes cherchés : « fondamentaux », « fondations », « bilan »)
- Catégorie : 2 · prévu mais pas fait

**A.62**
- Intention, l. 3705 :
  > filtres « RàI 2-3 » et « Suivi »
- Observation, l. 1879 (Suivi — observation : groupe, liste, profils › Liste des étudiant·es › Filtres) :
  > Filtres `#filtre-groupe-liste`, `#filtre-programme-liste`, `#filtre-rai-liste`, `#filtre-pattern-liste`
- Observation, l. 1798 (Suivi — observation : groupe, liste, profils › Suivi du groupe › Bouton « Détails ») :
  > le panneau affiche « Filtrer : A→Z P < 65% A ou C < 70% Suivi RàI 2-3 »
- Catégorie : 3 · fait autrement

**A.63**
- Intention, l. 3706 :
  > élève exclu « Décrochage · hors des moyennes du groupe »
- Observation : aucune mention (termes cherchés : « hors des moyennes », « Décrochage · », « exclu »)
- Catégorie : 2 · prévu mais pas fait

**A.64**
- Intention, l. 3707 :
  > une présence d'intervention RàI ne rend pas, à elle seule, une séance « saisie »
- Observation, l. 2081 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Statut « Complétée ») :
  > intervention de rattrapage du 2026-10-07 (séance non saisie)
- Observation, l. 2082 (Suivi : saisie des présences, interventions, rencontres, animation › Interventions › Statut « Complétée ») :
  > Effet dans la saisie au 2026-10-07 (observé à l'exécution) : « Séance saisie », « Présents : 1 Absents : 3 Total : 4 Assiduité aujourd'hui : 25% »
- Catégorie : 3 · fait autrement

**A.65**
- Intention, l. 3708 :
  > champ « 2. Cours ou service »
- Observation : aucune mention (termes cherchés : « Cours ou service », « 2. Cours », « v2-gc-cours »)
- Catégorie : 2 · prévu mais pas fait

**A.66**
- Intention, l. 3709 :
  > « Par où commencer ? » à deux branches
- Observation : aucune mention (termes cherchés : « Par où commencer », « deux branches », « Commencer »)
- Catégorie : 2 · prévu mais pas fait

**A.67**
- Intention, l. 3710 :
  > archiver un groupe emporte ses rencontres et son assiduité
- Observation : aucune mention (termes cherchés : « rencontres », « assiduité », « archive », « donnees.json »)
- Catégorie : 2 · prévu mais pas fait

**A.68**
- Intention, l. 3710 :
  > une rencontre de deux groupes part dans l'archive de chacun avec son texte libre entier
- Observation : aucune mention (termes cherchés : « deux groupes », « texte libre », « archive de chacun »)
- Catégorie : 2 · prévu mais pas fait

**A.69**
- Intention, l. 3711 :
  > niveau SOLO en français
- Observation : aucune mention (termes cherchés : « SOLO », « niveau SOLO », « export anonymisé »)
- Catégorie : 2 · prévu mais pas fait

**A.70**
- Intention, l. 3711 :
  > indices A, C, P
- Observation, l. 2494 (Réglages › reglages-donnees › Bouton « Générer l'export anonymisé ») :
  > `observations` (`etudiants` 4 entrées `{id_anonyme, statut, profil{programme:"999.ZZ", services_adaptes}, resultats_ulterieurs}`, `presences` 0, `evaluations` 0)
- Observation, l. 2491 (Réglages › reglages-donnees › Bouton « Générer l'export anonymisé ») :
  > avec 15 captures présentes, le fichier contient `calculs.snapshots_hebdomadaires: []`
- Catégorie : 3 · fait autrement

**A.71**
- Intention, l. 3712 :
  > gouvernées par Labo › Outils d'observation
- Observation : aucune mention (termes cherchés : « Outils d'observation », « catégories », « activerActionsRLO », « compréhension », « action »)
- Catégorie : 2 · prévu mais pas fait

**A.72**
- Intention, l. 3714 :
  > formule « taux de repérage » pour la grille de l'orthopédagogue
- Observation, l. 920 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-grille-criteres › Critère algorithmique) :
  > « Modèle de formule » (`modifierModeleFormuleGrilleHandler`) : options `penalite_normalisee` (« Pénalité normalisée »), `ratio_cible`, `penalite_par_erreur`.
- Catégorie : 2 · prévu mais pas fait

### Notés par l'analyste « Labo et Réglages »

**A.73**
- Intention, l. 3718 :
  > bandeau « LECTURE SEULE, Trimestre clos »
- Observation, l. 2839 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Bandeau « LECTURE SEULE — Trimestre clos » `#bandeau-archive`**[…]: relèvent des trimestres et des exports (autres modules) ; non observés.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.74**
- Intention, l. 3720 :
  > fenêtre « Ce codex n'aura pas toutes tes copies »
- Observation : aucune mention (termes cherchés : « n'aura pas toutes tes copies », « toutes tes copies », « copies manquantes »)
- Catégorie : 2 · prévu mais pas fait

**A.75**
- Intention, l. 3720 :
  > bilan d'ouverture incomplète
- Observation : aucune mention (termes cherchés : « ouverture incomplète », « incomplète », « bilan d'ouverture »)
- Catégorie : 2 · prévu mais pas fait

**A.76**
- Intention, l. 3721 :
  > La fenêtre « Mettre ton codex à jour avant de supprimer ? »
- Observation, l. 2836 (Ce qui n'a pas pu être observé › En-tête, Accueil et Aide) :
  > **Actions du menu Codex** (ouvrir, mettre à jour, […]) : […] ; non exécutées.
- Observation, l. 845 (Conception — ressources (productions, grilles, échelles, cartouches) › conception-productions › « Supprimer ») :
  > fenêtre « Écrire un codex avant de supprimer ? Supprimer cette production l'efface pour de bon.
- Observation, l. 1361 (Évaluation › Liste des évaluations et saisie d'une évaluation › Liste des évaluations › Action « Supprimer l'évaluation ») :
  > dialogue `#overlay-ui-dialogue` « Écrire un codex avant de supprimer ? »
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.77**
- Intention, l. 3723 :
  > « Proposer un nettoyage »
- Observation, l. 2916 (Ce qui n'a pas pu être observé › Évaluation › Importer, annoter, exporter) :
  > « Proposer un nettoyage » (`proposerNettoyage`, js/travaux-ui.js:3029) : affiché seulement quand `quota.alerteQuota` est vrai
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.78**
- Intention, l. 3723 :
  > l'aide « Exporter et archiver »
- Observation : aucune mention (termes cherchés : « aide », « Exporter et archiver », « data-aide », « btn-aide-contextuelle »)
- Catégorie : 2 · prévu mais pas fait

**A.79**
- Intention, l. 3726 :
  > « Exporter pour partager » et « Supprimer » dans « Partagés par des collègues » des bibliothèques
- Observation, l. 2887 (Ce qui n'a pas pu être observé › Conception › Pratiques de notation) :
  > Section « Partagés » de la modale (`partageSection.genererSectionHTML('pratique')`) après import .lcz : non examinée.
- Catégorie : 4 · non comparable (Ce qui n'a pas pu être observé)

**A.80**
- Intention, l. 3727 :
  > La bannière « Gérer mes maquettes »
- Observation : aucune mention (termes cherchés : « Gérer mes maquettes », « maquettes », « bannière »)
- Catégorie : 2 · prévu mais pas fait

---

## Concordant

Unités de l'intention dont aucune affirmation ne diverge de l'observation. Référence : écran, geste et numéro de ligne dans `1-intentions-scellees.md`.

### Partie 1 · L'entrée, l'en-tête, le codex et l'aide

- Écran 1 · Ouverture de l'application › Geste : ouvrir l'application à son adresse : l. 160
- Écran 1 · Ouverture de l'application › Geste : ouvrir l'application pour la première fois (espace neuf) : l. 165, 167
- Écran 2 · Accueil › Geste : déplier et lire le bandeau « Bienvenue dans Labo Codex ! » : l. 178, 179, 180
- Écran 2 · Accueil › Geste : cliquer « Voir les tutoriels ↗ » : l. 185
- Écran 2 · Accueil › Geste : cliquer « Voir les guides pédagogiques » : l. 190
- Écran 2 · Accueil › Geste : suivre « Commencer → » de la carte « Tu es orthopédagogue ? » : l. 196
- Écran 2 · Accueil › Geste : toucher la carte « Nouveautés » : l. 204
- Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo) › Geste : entrer dans la démonstration (case « Données démo » de l'Accueil, « Cours fictif déjà configuré », ou Labo › Démo) : l. 220, 222, 230
- Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo) › Geste : « Quitter la démo » (bandeau vert) ou décocher la case de l'Accueil : l. 237
- Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo) › Sans geste : l. 252, 256
- Écran 4 · En-tête › menu Codex › Geste : « Ouvrir un codex… » : l. 299, 303
- Écran 4 · En-tête › menu Codex › Sans geste : l. 333
- Écran 5 · En-tête › menu Codex › « Archiver… » › Geste : archiver un groupe-cours : l. 341, 348
- Écran 6 · Fenêtres du codex avant une suppression (tous les écrans) › Geste : supprimer un trimestre, un groupe-cours, un groupe d'élèves, vider toute la liste, réinitialiser toutes les données : l. 359, 361
- Écran 6 · Fenêtres du codex avant une suppression (tous les écrans) › Geste : supprimer un élément qui porte des notes ou du matériel (évaluation, production, grille, pratique, échelle, cartouche, élève, copie de la corbeille, fusion de copies, pages retirées d'une copie, jetons de reprise, remplacement d'un élément du même nom, réinitialisation d'une séance saisie, « Effacer tout » d'une page annotée, registre longitudinal, résultats du bilan réflexif) : l. 367, 370
- Écran 6 · Fenêtres du codex avant une suppression (tous les écrans) › Sans geste : l. 373
- Écran 7 · Rappel « Mets ton codex à jour » › Geste : lire le rappel (il s'ouvre au chargement quand il est dû) : l. 379, 380
- Écran 8 · Témoin « Enregistré » (tous les écrans) › Sans geste (après chaque écriture) : l. 405, 408, 411, 412, 413
- Écran 9 · Fenêtres de confirmation de l'application (tous les écrans) › Sans geste : l. 423
- Écran 10 · Numéro de version, bandeau de nouvelle version, fenêtre des Nouveautés › Geste : lire le numéro de version (bas de page) : l. 429
- Écran 10 · Numéro de version, bandeau de nouvelle version, fenêtre des Nouveautés › Sans geste (le bandeau) : l. 434, 435, 436
- Écran 11 · En-tête › « Soutenir Labo Codex » (le cœur) › Geste : ouvrir la fenêtre « Soutenir Labo Codex » : l. 447
- Écran 11 · En-tête › « Soutenir Labo Codex » (le cœur) › Sans geste : l. 452
- Écran 12 · En-tête › « Signaler un bug ou donner ton avis » (la coccinelle) › Geste : ouvrir la fenêtre : l. 458
- Écran 14 · Aide › Geste : survoler ou ouvrir l'aide contextuelle : l. 526
- Écran 14 · Aide › Sans geste : l. 530
- Écran 15 · Au chargement de l'application › Sans geste : l. 536, 537, 538, 539, 542, 543, 544, 545

### Partie 2 · Le Cadre

- Introduction de la partie : l. 552
- Écran 16 · Cadre (règles communes à toute la section) › Geste : modifier une fiche existante (trimestre, profil, cours, horaire, groupe-cours, élève) : l. 559, 560, 561
- Écran 16 · Cadre (règles communes à toute la section) › Geste : créer une fiche neuve (trimestre, profil, cours ou service, horaire, groupe-cours, élève) : l. 566, 567
- Écran 16 · Cadre (règles communes à toute la section) › Sans geste : l. 573
- Écran 17 · Cadre › Trimestre (la fiche du trimestre) › Geste : créer un trimestre : l. 583, 585, 587, 588, 589
- Écran 17 · Cadre › Trimestre (la fiche du trimestre) › Geste : modifier le nom, la session ou l'année du trimestre : l. 593, 594, 596
- Écran 17 · Cadre › Trimestre (la fiche du trimestre) › Geste : saisir ou modifier les dates du trimestre (bornes et semaines spéciales) : l. 601, 602, 603, 604, 605
- Écran 17 · Cadre › Trimestre (la fiche du trimestre) › Geste : réinitialiser les bornes ou les semaines spéciales : l. 611
- Écran 17 · Cadre › Trimestre (la fiche du trimestre) › Geste : ajouter une journée sans cours (congé, férié, journée personnelle, reprise) : l. 616, 617, 619
- Écran 17 · Cadre › Trimestre (la fiche du trimestre) › Geste : modifier ou supprimer une journée sans cours : l. 623, 625
- Écran 17 · Cadre › Trimestre (la fiche du trimestre) › Geste : changer de trimestre actif (menu « Trimestre actif ») : l. 631, 632
- Écran 17 · Cadre › Trimestre (la fiche du trimestre) › Sans geste : l. 639, 642, 643, 644
- Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres) › Geste : ouvrir la bibliothèque des trimestres : l. 651, 652, 653, 654
- Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres) › Geste : clore un trimestre : l. 663, 664, 665, 668
- Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres) › Geste : rouvrir un trimestre clos : l. 672
- Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres) › Geste : supprimer un trimestre (« Supprimer… ») : l. 677, 678, 679, 680, 681, 682, 683, 686, 687
- Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres) › Sans geste : l. 730
- Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève › Geste : ajouter un·e étudiant·e (formulaire) : l. 736, 737, 738, 739, 740
- Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève › Geste : ouvrir et modifier la fiche d'un·e élève (menu « Action », « Modifier ») : l. 747, 748, 749, 751, 753
- Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève › Geste : corriger un DA mal tapé (« Corriger le DA… ») : l. 761, 763
- Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève › Geste : poser une remarque sur un·e élève (menu « Remarque ») : l. 767, 769
- Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève › Geste : supprimer un·e élève (menu « Action », « Supprimer ») : l. 773, 779
- Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève › Geste : créer un groupe (« + Nouveau groupe ») : l. 784
- Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève › Geste : supprimer un groupe (« Supprimer un groupe… ») : l. 792, 793, 795
- Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève › Geste : vider la liste (« Vider la liste ») : l. 799, 800
- Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève › Geste : importer des étudiant·es (coller ou déposer un fichier) : l. 805, 807, 812
- Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours) › Geste : créer un cours ou un service (« + Nouveau cours ») : l. 827, 828, 829, 831, 833
- Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours) › Geste : modifier un cours ou un service : l. 837, 839, 840, 843
- Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours) › Geste : supprimer une fiche de cours (bouton « Supprimer » du formulaire, ou Bibliothèque › ⋮ › « Supprimer la fiche ») : l. 853, 855
- Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours) › Geste : gérer une fiche dans la Bibliothèque de cours (menu ⋮) : l. 859, 860, 861, 863
- Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours) › Sans geste : l. 871
- Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil ») › Geste : créer un profil (« + Nouveau profil ») : l. 878, 879, 880, 882
- Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil ») › Geste : modifier un profil : l. 886, 888
- Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil ») › Geste : supprimer un profil : l. 894, 895
- Écran 22 · Cadre › Trimestre › Horaire › Geste : créer un horaire (« + Nouvel horaire ») : l. 908, 910, 914, 916
- Écran 22 · Cadre › Trimestre › Horaire › Geste : modifier un horaire : l. 920, 921, 923
- Écran 22 · Cadre › Trimestre › Horaire › Geste : supprimer un horaire : l. 928
- Écran 22 · Cadre › Trimestre › Horaire › Sans geste : l. 932
- Écran 23 · Cadre › Trimestre › Groupe-cours › Geste : créer un groupe-cours (« + Nouveau groupe-cours ») : l. 940, 941, 942, 943, 945, 948
- Écran 23 · Cadre › Trimestre › Groupe-cours › Geste : modifier un groupe-cours : l. 952
- Écran 23 · Cadre › Trimestre › Groupe-cours › Geste : supprimer un groupe-cours (bouton « Supprimer » du formulaire, ou Bibliothèque › ⋮ › « Supprimer ») : l. 958, 959
- Écran 23 · Cadre › Trimestre › Groupe-cours › Sans geste : l. 972
- Écran 24 · Cadre › Calendrier scolaire › Geste : ouvrir le Calendrier scolaire : l. 978, 983

### Partie 3 · Conception : Productions, Grilles, Échelles

- Introduction de la partie : l. 994, 995, 996, 997, 998
- Écran 25 · Conception (commun aux trois écrans) › Geste : retrouver une fiche : l. 1005
- Écran 25 · Conception (commun aux trois écrans) › Geste : ouvrir « + Nouvelle grille », « + Nouvelle échelle », « + Nouvelle production » : l. 1009
- Écran 25 · Conception (commun aux trois écrans) › Geste : créer (« Créer la grille », « Créer l'échelle », « Créer la production ») : l. 1014, 1015, 1016
- Écran 25 · Conception (commun aux trois écrans) › Geste : modifier un champ d'une fiche existante : l. 1027, 1028, 1029
- Écran 25 · Conception (commun aux trois écrans) › Geste : fermer une fiche : l. 1034, 1037
- Écran 25 · Conception (commun aux trois écrans) › Geste : supprimer une fiche quand le codex n'est pas à jour : l. 1051
- Écran 26 · Conception › Productions étudiantes › Geste : créer une production (« + Nouvelle production », puis « Créer la production ») : l. 1072
- Écran 26 · Conception › Productions étudiantes › Geste : modifier un champ d'une production existante : l. 1078, 1079, 1081, 1086
- Écran 26 · Conception › Productions étudiantes › Geste : ajouter, nommer, ordonner, renommer un bloc de consignes : l. 1090
- Écran 26 · Conception › Productions étudiantes › Geste : poser la date d'échéance, cocher « Consignes transmises » : l. 1096
- Écran 26 · Conception › Productions étudiantes › Geste : « Préparer le PDF » (le document de consignes) : l. 1113
- Écran 26 · Conception › Productions étudiantes › Geste : dupliquer une production : l. 1122
- Écran 26 · Conception › Productions étudiantes › Geste : supprimer une production : l. 1127
- Écran 26 · Conception › Productions étudiantes › Geste : fermer le formulaire d'une production : l. 1133
- Écran 26 · Conception › Productions étudiantes › Sans geste : l. 1140
- Écran 27 · Conception › Grilles de critères › Geste : retrouver une grille : l. 1146, 1147
- Écran 27 · Conception › Grilles de critères › Geste : créer une grille : l. 1152, 1153
- Écran 27 · Conception › Grilles de critères › Geste : choisir le « Type de la grille » (à côté du nom) : l. 1159, 1162, 1163
- Écran 27 · Conception › Grilles de critères › Geste : ajouter un critère (« + Ajouter un critère ») : l. 1168, 1170
- Écran 27 · Conception › Grilles de critères › Geste : renseigner un critère (nom, descripteur, pondération, type, complexité SOLO) : l. 1176, 1177, 1178, 1180, 1183, 1184
- Écran 27 · Conception › Grilles de critères › Geste : déplacer ou supprimer un critère, un sous-critère : l. 1188, 1189, 1190
- Écran 27 · Conception › Grilles de critères › Geste : ouvrir un critère algorithmique (le gabarit) : l. 1196, 1199
- Écran 27 · Conception › Grilles de critères › Geste : choisir le modèle de formule : l. 1203, 1204
- Écran 27 · Conception › Grilles de critères › Geste : gérer les sous-critères comme codes d'annotation : l. 1208, 1211
- Écran 27 · Conception › Grilles de critères › Geste : régler la carte « Ce que l'élève lit » (projection et paliers) : l. 1228, 1229
- Écran 27 · Conception › Grilles de critères › Geste : supprimer une grille : l. 1267, 1268
- Écran 27 · Conception › Grilles de critères › Sans geste : l. 1275, 1277, 1278, 1279
- Écran 28 · Conception › Échelles de performance › Geste : retrouver une échelle : l. 1285
- Écran 28 · Conception › Échelles de performance › Geste : créer une échelle (« + Nouvelle échelle », puis « Créer l'échelle ») : l. 1289, 1290, 1291, 1292, 1293, 1294
- Écran 28 · Conception › Échelles de performance › Geste : ajouter un niveau (« + Ajouter un niveau ») : l. 1299, 1301
- Écran 28 · Conception › Échelles de performance › Geste : modifier un niveau (code, nom, bornes, valeur, palier SOLO, ordre) : l. 1305, 1306, 1307, 1309, 1310
- Écran 28 · Conception › Échelles de performance › Geste : régler les repères de maîtrise : l. 1319, 1320, 1321
- Écran 28 · Conception › Échelles de performance › Geste : renommer une échelle : l. 1325
- Écran 28 · Conception › Échelles de performance › Geste : supprimer une échelle : l. 1334, 1335, 1338
- Écran 28 · Conception › Échelles de performance › Sans geste : l. 1344, 1345, 1346, 1348

### Partie 4 · Conception : Rétroactions, Pratiques de notation, Carte d'alignement, bibliothèques et partage

- Écran 29 · Conception › Rétroactions (cartouches) › Geste : Créer une cartouche : l. 1358, 1359, 1362
- Écran 29 · Conception › Rétroactions (cartouches) › Geste : Choisir la grille et l'échelle d'une cartouche : l. 1367
- Écran 29 · Conception › Rétroactions (cartouches) › Geste : Écrire les commentaires de la matrice (par critère et par niveau) : l. 1373
- Écran 29 · Conception › Rétroactions (cartouches) › Geste : Renommer une cartouche ou modifier son contexte spécifique : l. 1379, 1381
- Écran 29 · Conception › Rétroactions (cartouches) › Geste : Télécharger un modèle de cartouche (à faire remplir) : l. 1394, 1395, 1396, 1399
- Écran 29 · Conception › Rétroactions (cartouches) › Geste : Réimporter un modèle rempli : l. 1404
- Écran 29 · Conception › Rétroactions (cartouches) › Geste : Dupliquer une cartouche : l. 1408, 1409
- Écran 29 · Conception › Rétroactions (cartouches) › Geste : Supprimer une cartouche depuis la liste : l. 1416, 1417
- Écran 29 · Conception › Rétroactions (cartouches) › Geste : Verrouiller une cartouche : l. 1421
- Écran 29 · Conception › Rétroactions (cartouches) › Énoncé 4 (une rétroaction ne parle que de la discipline de celui qui l'écrit), côté cartouches : l. 1425, 1427
- Écran 29 · Conception › Rétroactions (cartouches) › Sans geste : l. 1431, 1432, 1433, 1435
- Écran 30 · Conception › Rétroactions › « Consulter la bibliothèque » (cartouches) › Geste : Supprimer une cartouche depuis la bibliothèque (première section) : l. 1443
- Écran 30 · Conception › Rétroactions › « Consulter la bibliothèque » (cartouches) › Geste : Retirer une cartouche de la bibliothèque partagée (seconde section) : l. 1448
- Écran 30 · Conception › Rétroactions › « Consulter la bibliothèque » (cartouches) › Sans geste : l. 1457, 1458
- Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) › Geste : Modifier une pratique existante dans l'éditeur : l. 1465
- Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) › Geste : Régler les jetons d'une pratique : l. 1471
- Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) › Geste : Cocher « notes finales » (notes finalisées) : l. 1477
- Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) › Geste : Choisir l'affichage de la note (« note en lettre ») : l. 1484
- Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) › Geste : Éditer les cibles d'une pratique par dénotation : l. 1490
- Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) › Geste : Ranger les productions en mode hybride (Sélection / Obligatoires) : l. 1499
- Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) › Geste : Appliquer une pratique au groupe-cours actif : l. 1503, 1504
- Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) › Geste : Dupliquer une pratique, ou en dériver une variante : l. 1509
- Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) › Énoncé 4, côté pratiques : l. 1523, 1525
- Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) › Sans geste : l. 1529
- Écran 32 · Assistant de pratique › Geste : Ouvrir l'assistant et choisir une porte : l. 1536, 1537, 1538, 1541, 1542, 1543
- Écran 32 · Assistant de pratique › Geste : Configurer une sommative : l. 1549
- Écran 32 · Assistant de pratique › Geste : Choisir l'échelle de la pratique dans l'assistant : l. 1554
- Écran 32 · Assistant de pratique › Geste : Terminer l'assistant : l. 1561
- Écran 32 · Assistant de pratique › Sans geste : l. 1578
- Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » et bibliothèque des pratiques › Geste : Parcourir les modèles offerts : l. 1585
- Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » et bibliothèque des pratiques › Geste : Adopter un modèle Standards (« N meilleures » ou « N plus récentes ») : l. 1591, 1592, 1593
- Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » et bibliothèque des pratiques › Geste : Importer une pratique d'un autre trimestre : l. 1604, 1605, 1606
- Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » et bibliothèque des pratiques › Sans geste : l. 1609
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Poser une leçon dans le temps : l. 1615, 1617, 1618, 1619
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Écrire les objectifs d'une leçon : l. 1624
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Relier une leçon à une idée maîtresse : l. 1629, 1630
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Cocher les objectifs servis d'une activité ou d'un exposé : l. 1634
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Cocher les objectifs vérifiés d'une évaluation : l. 1642
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Tracer un lien vers une évaluation : l. 1652
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Régler une évaluation (niveau cognitif, visée, production) : l. 1656, 1659
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Copier, cloner ou décloner un bloc : l. 1664, 1666
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Supprimer un bloc : l. 1673
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Changer le type d'un bloc : l. 1677, 1678
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Saisir la durée d'un bloc, ou le marquer « Travail hors classe » : l. 1682, 1684
- Écran 34 · Conception › Carte d'alignement › canevas › Geste : Chercher un mot dans la carte : l. 1688, 1689
- Écran 34 · Conception › Carte d'alignement › canevas › Sans geste : l. 1702, 1704, 1709, 1711, 1712
- Écran 35 · Conception › Carte d'alignement › barre et menus › Geste : Ouvrir le menu « Vue » : l. 1724, 1726
- Écran 35 · Conception › Carte d'alignement › barre et menus › Geste : Recentrer la carte, tout voir, passer en plein écran : l. 1730, 1731
- Écran 35 · Conception › Carte d'alignement › barre et menus › Geste : Choisir la couleur du fond du canevas : l. 1735
- Écran 35 · Conception › Carte d'alignement › barre et menus › Geste : Changer le zoom par la rubrique « Zoom » : l. 1740
- Écran 35 · Conception › Carte d'alignement › barre et menus › Geste : Ouvrir l'Inspecteur ou le Guide depuis la barre : l. 1762, 1763
- Écran 35 · Conception › Carte d'alignement › barre et menus › Geste : Ouvrir « Actions ▾ » : l. 1767
- Écran 35 · Conception › Carte d'alignement › barre et menus › Geste : Rattacher la carte à son cours : l. 1771
- Écran 35 · Conception › Carte d'alignement › barre et menus › Geste : Nettoyer les repères de semaine : l. 1776
- Écran 35 · Conception › Carte d'alignement › barre et menus › Geste : Régler « Liens : contourner les blocs » : l. 1781
- Écran 35 · Conception › Carte d'alignement › barre et menus › Geste : Exporter le plan : l. 1786
- Écran 35 · Conception › Carte d'alignement › barre et menus › Sans geste : l. 1793
- Écran 36 · Conception › Carte d'alignement › Planificateur › Geste : Afficher le planificateur : l. 1799
- Écran 36 · Conception › Carte d'alignement › Planificateur › Sans geste : l. 1812
- Écran 37 · Conception › Carte d'alignement › « Télécharger un modèle… » (faire relire sa carte par une IA) › Geste : Télécharger le modèle : l. 1821, 1822, 1823, 1824, 1827, 1828
- Écran 37 · Conception › Carte d'alignement › « Télécharger un modèle… » (faire relire sa carte par une IA) › Sans geste : l. 1832
- Écran 38 · Conception › Carte d'alignement › Guide › Geste : Lire le guide de la carte : l. 1838, 1845
- Écran 38 · Conception › Carte d'alignement › Guide › Sans geste : l. 1848
- Écran 39 · Conception › Carte d'alignement › « Consulter la bibliothèque » (cartes) › Geste : Ouvrir la bibliothèque des cartes : l. 1855
- Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles) › Geste : Dupliquer un élément : l. 1887, 1889, 1890, 1891
- Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles) › Geste : Ouvrir un exemplaire « exemple » (matériel fourni ou démo) : l. 1900
- Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles) › Geste : Lire le bandeau des doublons : l. 1906
- Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles) › Geste : Ranger dans « Mes dossiers » (grilles, échelles, productions, pratiques) : l. 1914, 1915
- Écran 41 · Partage entre collègues › Geste : Exporter pour partager : l. 1928, 1931, 1935, 1936
- Écran 41 · Partage entre collègues › Geste : Importer un partage (.lcz) : l. 1940, 1941, 1943
- Écran 41 · Partage entre collègues › Geste : Supprimer un élément partagé : l. 1964, 1966
- Écran 42 · Importer depuis un autre trimestre (dans chaque bibliothèque) › Geste : Importer depuis un autre trimestre, dans n'importe quelle bibliothèque : l. 1992
- Écran 42 · Importer depuis un autre trimestre (dans chaque bibliothèque) › Sans geste : l. 1995

### Partie 5 · Évaluation

- Introduction de la partie : l. 2001
- Écran 43 · Évaluation (toute la section) › Sans geste : l. 2008, 2011
- Écran 44 · Évaluation › Liste des évaluations › Geste : Lire et trier la liste : l. 2024
- Écran 44 · Évaluation › Liste des évaluations › Geste : Choisir « Évaluer » dans le menu « Actions… » : l. 2037
- Écran 44 · Évaluation › Liste des évaluations › Geste : Choisir « Dossier PDF » : l. 2053, 2054, 2055
- Écran 44 · Évaluation › Liste des évaluations › Geste : Réassigner (ou Assigner) une copie depuis sa ligne : l. 2061, 2064, 2065
- Écran 44 · Évaluation › Liste des évaluations › Geste : Réassigner une sélection de copies en lot : l. 2074
- Écran 44 · Évaluation › Liste des évaluations › Geste : Supprimer une évaluation (« Supprimer l'évaluation ») : l. 2079, 2082
- Écran 44 · Évaluation › Liste des évaluations › Geste : Ouvrir le journal de bord d'une copie : l. 2086
- Écran 44 · Évaluation › Liste des évaluations › Geste : Ouvrir la corbeille et supprimer définitivement une copie : l. 2092, 2093
- Écran 45 · Évaluation › Préparer et importer › Geste : Déposer des copies et lancer l'import : l. 2116, 2118
- Écran 45 · Évaluation › Préparer et importer › Geste : Laisser l'import assembler les pages d'une remise : l. 2130
- Écran 45 · Évaluation › Préparer et importer › Geste : Résoudre un doublon à l'import (remplacer, ou appliquer un jeton de reprise) : l. 2135
- Écran 45 · Évaluation › Préparer et importer › Geste : Régler une copie dans le poste de préparation (résolution, balance, « + Ajouter des pages ») : l. 2148, 2150
- Écran 45 · Évaluation › Préparer et importer › Geste : Modifier les pages d'une copie (éditeur de pages) : l. 2156
- Écran 45 · Évaluation › Préparer et importer › Geste : Fusionner des copies (« Fusionner (N) » ou depuis l'éditeur) : l. 2162
- Écran 45 · Évaluation › Préparer et importer › Geste : Lire l'aide « Préparer et importer les travaux » : l. 2172
- Écran 45 · Évaluation › Préparer et importer › Sans geste : l. 2177, 2179, 2180
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Ouvrir une copie dans la visionneuse : l. 2192, 2193
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Passer d'un élève à l'autre (carrousel) : l. 2197, 2198, 2200
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Annoter la copie (trait, texte, flèche, ligne) : l. 2210
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Poser un tampon : l. 2217
- Écran 46 · Évaluation › Annoter et évaluer › Geste : « Effacer tout » sur une page : l. 2230, 2231
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Chronométrer l'évaluation : l. 2235, 2236
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Attribuer les niveaux (holistique, analytique, algorithmique) : l. 2252, 2254, 2258
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Laisser un critère sans niveau (pondération incomplète) : l. 2263, 2264, 2265, 2266, 2268, 2269, 2270
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Saisir le nombre d'erreurs, le nombre de mots, l'intégrité : l. 2283
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Rédiger et régénérer la rétroaction : l. 2289, 2291, 2292, 2294, 2295, 2296, 2299
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Verrouiller l'évaluation (bouton ou cadenas), ou la déverrouiller : l. 2313, 2314, 2315, 2321, 2322
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Évaluer sans copie (formulaire sans copie) : l. 2337, 2339, 2340
- Écran 46 · Évaluation › Annoter et évaluer › Geste : Supprimer une copie importée : l. 2350
- Écran 46 · Évaluation › Annoter et évaluer › Sans geste : l. 2355, 2356
- Écran 47 · Évaluation › Exporter et archiver › Geste : Exporter des travaux (« Télécharger ») : l. 2363, 2364
- Écran 47 · Évaluation › Exporter et archiver › Geste : Lancer l'export pour Léa : l. 2379, 2380
- Écran 47 · Évaluation › Exporter et archiver › Geste : « Proposer un nettoyage » (quand l'espace manque) : l. 2390
- Écran 47 · Évaluation › Exporter et archiver › Geste : Lire l'aide « Exporter et archiver les travaux » : l. 2422
- Écran 47 · Évaluation › Exporter et archiver › Sans geste : l. 2429
- Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse) › Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule) : l. 2437, 2438, 2439, 2443, 2447, 2448, 2449, 2450, 2451
- Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse) › Sans geste : l. 2459

### Partie 6 · Suivi : le groupe, la liste, les profils, les présences

- Introduction de la partie : l. 2466, 2467, 2468, 2469, 2470, 2471, 2472, 2473, 2474, 2475
- Écran 49 · Suivi (commun aux quatre écrans de cette partie) › Sans geste : l. 2481, 2482, 2483, 2484, 2486, 2490, 2492
- Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écrans) › Sans geste : l. 2498, 2499, 2501, 2504, 2510, 2511, 2512, 2513, 2514, 2518
- Écran 51 · Suivi : les captures hebdomadaires › Sans geste : l. 2524, 2528, 2530, 2531
- Écran 52 · Suivi › Suivi du groupe › Geste : ouvrir le Suivi du groupe : l. 2538, 2540
- Écran 52 · Suivi › Suivi du groupe › Geste : lire les barres A, C, P (aperçu en dégradé) : l. 2544, 2546, 2547, 2551
- Écran 52 · Suivi › Suivi du groupe › Geste : toucher ou survoler une bulle d'élève dans une barre : l. 2556, 2557
- Écran 52 · Suivi › Suivi du groupe › Geste : lire les étiquettes de zones : l. 2561
- Écran 52 · Suivi › Suivi du groupe › Geste : suivre un élève (clic sur son nom, en mode Détails) : l. 2568, 2571, 2572
- Écran 52 · Suivi › Suivi du groupe › Geste : ouvrir le panneau « Détails » : l. 2576, 2577, 2578
- Écran 52 · Suivi › Suivi du groupe › Geste : filtrer les élèves du panneau Détails : l. 2583, 2584
- Écran 52 · Suivi › Suivi du groupe › Geste : lire « Observation globale des besoins d'intervention » : l. 2592
- Écran 52 · Suivi › Suivi du groupe › Geste : cliquer « Régler les outils d'observation » : l. 2609
- Écran 52 · Suivi › Suivi du groupe › Geste : exporter les résultats finaux du groupe (CSV) : l. 2613
- Écran 52 · Suivi › Suivi du groupe › Sans geste : l. 2618
- Écran 53 · Suivi › Liste des étudiant·es › Geste : ouvrir la Liste : l. 2626, 2631
- Écran 53 · Suivi › Liste des étudiant·es › Geste : trier par un en-tête de colonne : l. 2636
- Écran 53 · Suivi › Liste des étudiant·es › Geste : rechercher un élève : l. 2640
- Écran 53 · Suivi › Liste des étudiant·es › Geste : filtrer par profil d'apprentissage, par RàI ou par groupe : l. 2644, 2645
- Écran 53 · Suivi › Liste des étudiant·es › Geste : cocher « ≥ Min. » : l. 2650
- Écran 53 · Suivi › Liste des étudiant·es › Geste : cliquer la ligne d'un élève : l. 2654
- Écran 53 · Suivi › Liste des étudiant·es › Sans geste : l. 2658, 2659
- Écran 54 · Suivi › Profils individuels (le profil d'un élève) › Geste : ouvrir le profil d'un élève (sélecteur, Liste ou Suivi du groupe) : l. 2665, 2666
- Écran 54 · Suivi › Profils individuels (le profil d'un élève) › Geste : lire la section Engagement : l. 2676, 2677, 2680
- Écran 54 · Suivi › Profils individuels (le profil d'un élève) › Geste : lire la section Productions (productions et évaluations) : l. 2685
- Écran 54 · Suivi › Profils individuels (le profil d'un élève) › Geste : cliquer « Évaluer » dans le profil : l. 2693
- Écran 54 · Suivi › Profils individuels (le profil d'un élève) › Geste : lire la section Développement des habiletés (onglets Critères, Forces et défis, Gestes cognitifs) : l. 2706, 2711
- Écran 54 · Suivi › Profils individuels (le profil d'un élève) › Geste : lire les graphiques de progression : l. 2716
- Écran 54 · Suivi › Profils individuels (le profil d'un élève) › Geste : lire la section Accompagnement : l. 2727
- Écran 54 · Suivi › Profils individuels (le profil d'un élève) › Geste : ouvrir le volet « Confidentiel » (informations confidentielles) : l. 2734, 2735, 2737, 2739
- Écran 54 · Suivi › Profils individuels (le profil d'un élève) › Geste : cliquer « Rapport » : l. 2745, 2746, 2747, 2748, 2750
- Écran 54 · Suivi › Profils individuels (le profil d'un élève) › Sans geste : l. 2768
- Écran 55 · Suivi › Saisie des présences › Geste : ouvrir la saisie des présences (chronique 1, dernier geste) : l. 2775, 2776, 2777, 2781
- Écran 55 · Suivi › Saisie des présences › Geste : marquer une absence ou un nombre de périodes (demi-période possible), ou taper une note : l. 2786, 2789
- Écran 55 · Suivi › Saisie des présences › Geste : confirmer la séance : l. 2800, 2801
- Écran 55 · Suivi › Saisie des présences › Geste : réinitialiser la séance (↻) : l. 2805, 2807
- Écran 55 · Suivi › Saisie des présences › Geste : verrouiller ou déverrouiller une date : l. 2813, 2814
- Écran 55 · Suivi › Saisie des présences › Geste : cliquer « Rapport » (grille imprimable des présences) : l. 2818, 2820, 2822, 2823, 2824
- Écran 55 · Suivi › Saisie des présences › Geste : cliquer « Fermer » : l. 2829

### Partie 7 · Suivi : dépistage, interventions, rencontres, animation

- Introduction de la partie : l. 2845
- Écran 56 · Le dépistage : ce qu'il calcule (transversal, lu dans le Suivi) › Sans geste : l. 2854, 2855, 2859, 2861, 2863
- Écran 57 · Suivi › Profils individuels › Accompagnement : la carte RàI et les niveaux RàI › Sans geste : l. 2874, 2875, 2876, 2881
- Écran 57 · Suivi › Profils individuels › Accompagnement : la carte RàI et les niveaux RàI › Geste : Cliquer « Régler les outils d'observation » (sous le titre « Modèle de la Réponse à l'intervention (RàI) ») : l. 2888, 2889
- Écran 57 · Suivi › Profils individuels › Accompagnement : la carte RàI et les niveaux RàI › Geste : Cliquer « + Nouvelle intervention » : l. 2893, 2894
- Écran 59 · Le dépistage du français en semaine 1 : le travail diagnostique et son signalement : l. 2910
- Écran 59 · Le dépistage du français en semaine 1 : le travail diagnostique et son signalement › Geste : Cocher la case « Travail diagnostique » (libellé : « … ne compte dans aucun calcul ») sur la fiche du travail : l. 2914
- Écran 60 · Suivi › Interventions › Sans geste : l. 2948
- Écran 60 · Suivi › Interventions › Geste : Cliquer « Planifier une intervention » (créer) : l. 2953, 2954, 2955, 2957
- Écran 60 · Suivi › Interventions › Geste : Modifier une intervention existante : l. 2961, 2963
- Écran 60 · Suivi › Interventions › Geste : Marquer une intervention « Complétée » : l. 2985, 2986, 2987, 2989, 2990
- Écran 60 · Suivi › Interventions › Geste : Supprimer une intervention : l. 2996
- Écran 60 · Suivi › Interventions › Geste : Ouvrir le Guide RàI : l. 3000
- Écran 61 · Suivi › Rencontres › Sans geste : l. 3011, 3012, 3013, 3016, 3017, 3019
- Écran 61 · Suivi › Rencontres › Geste : Entrer par l'accueil (« Tu es orthopédagogue ? » › « Commencer → ») : l. 3028
- Écran 61 · Suivi › Rencontres › Geste : Décrire son service (les trois questions) et cliquer « Créer mon service d'orthopédagogie » : l. 3032, 3034, 3035, 3036, 3039
- Écran 61 · Suivi › Rencontres › Geste : Créer une rencontre (« + Nouvelle rencontre ») : l. 3045, 3048, 3050, 3051
- Écran 61 · Suivi › Rencontres › Geste : Modifier, compléter ou supprimer une rencontre : l. 3055, 3056
- Écran 61 · Suivi › Rencontres › Geste : Consulter les rencontres d'un élève : l. 3062
- Écran 61 · Suivi › Rencontres › Ce qui reste manuel, et ce qui n'est pas tranché : l. 3066, 3072
- Écran 62 · Suivi › Animation › Sans geste : l. 3084, 3086
- Écran 62 · Suivi › Animation › Geste : Tirer au sort un·e étudiant·e : l. 3091
- Écran 62 · Suivi › Animation › Geste : Poser une question flash ; gérer la banque de questions : l. 3098, 3099
- Écran 62 · Suivi › Animation › Geste : Former les équipes : l. 3103, 3104, 3106, 3107, 3108, 3109
- Écran 62 · Suivi › Animation › Geste : Retenir ces équipes ; oublier les équipes retenues : l. 3113, 3114

### Partie 8 · Labo

- Écran 63 · Labo › Outils d'observation › Sans geste : l. 3129, 3132, 3133, 3135, 3138, 3139
- Écran 63 · Labo › Outils d'observation › Geste : Choisir la grille de critères pour le dépistage : l. 3143, 3144
- Écran 63 · Labo › Outils d'observation › Geste : Régler la sensibilité des flèches par critère (ancien « Direction du risque ») : l. 3156
- Écran 63 · Labo › Outils d'observation › Geste : Taper un seuil (progression des artefacts, sensibilité des flèches, défi, Fragile, Acceptable, Bon) : l. 3167, 3169, 3171
- Écran 63 · Labo › Outils d'observation › Geste : Remettre les valeurs par défaut (deux boutons) : l. 3176, 3177, 3178
- Écran 63 · Labo › Outils d'observation › Geste : Lire les aides de l'écran : l. 3184, 3185
- Écran 63 · Labo › Outils d'observation › Geste : Arriver par le lien « Régler les outils d'observation » : l. 3190
- Écran 64 · Labo › Suivi longitudinal › Sans geste : l. 3213, 3216, 3217, 3218, 3219, 3220
- Écran 64 · Labo › Suivi longitudinal › Geste : Inscrire au registre : l. 3230, 3231, 3232, 3233
- Écran 64 · Labo › Suivi longitudinal › Geste : Refaire la copie : l. 3237, 3238
- Écran 64 · Labo › Suivi longitudinal › Geste : Saisir un résultat ultérieur : l. 3242, 3244
- Écran 64 · Labo › Suivi longitudinal › Geste : Retirer du registre : l. 3248, 3249, 3250
- Écran 64 · Labo › Suivi longitudinal › Geste : Voir le dossier : l. 3256, 3258
- Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques) › Sans geste : l. 3264, 3265, 3266, 3269
- Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques) › Geste : Choisir 2 ou 3 pratiques à comparer : l. 3274, 3275, 3278
- Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques) › Geste : Choisir la source des données : l. 3287
- Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques) › Geste : Ouvrir le formulaire d'une pratique (lien de colonne) : l. 3291
- Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques) › Geste : Créer, dériver, adopter ou jeter une maquette : l. 3297, 3298, 3299, 3300, 3301
- Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques) › Geste : Exporter la comparaison (CSV) : l. 3307
- Écran 67 · Labo › Bilan réflexif › Sans geste : l. 3321
- Écran 67 · Labo › Bilan réflexif › Geste : Supprimer les résultats importés : l. 3326
- Écran 67 · Labo › Bilan réflexif › Geste : Réinitialiser ou importer le questionnaire : l. 3331
- Écran 68 · Labo › Modélisation › Geste : Supprimer un fichier (corbeille du badge) : l. 3342
- Écran 69 · Labo › Études › Sans geste : l. 3348

### Partie 9 · Réglages

- Introduction de la partie : l. 3363, 3364, 3365, 3366, 3368, 3375, 3376
- Écran 71 · Réglages › Données › carte « Archives » › Geste : Vérifier une archive : l. 3391
- Écran 71 · Réglages › Données › carte « Archives » › Geste : Terminer le renvoi : l. 3428
- Écran 71 · Réglages › Données › carte « Archives » › Geste : Retirer une ligne de la liste des archives : l. 3433
- Écran 71 · Réglages › Données › carte « Archives » › Geste : Lier le dossier des archives (Chrome) : l. 3437, 3438
- Écran 72 · Réglages › Données › « Ouvrir une archive… » › Geste : Ouvrir une archive : l. 3453
- Écran 72 · Réglages › Données › « Ouvrir une archive… » › Sans geste : l. 3458
- Écran 73 · Réglages › Données › carte « Ouverture et partage » › Geste : Ouvrir un ancien fichier par « Ouvrir un Codex… » (copie de secours, ancien .zip ou .json, cases à cocher) : l. 3464, 3471
- Écran 73 · Réglages › Données › carte « Ouverture et partage » › Geste : Importer une sélection depuis une sauvegarde : l. 3477
- Écran 73 · Réglages › Données › carte « Ouverture et partage » › Sans geste : l. 3489
- Écran 74 · Réglages › Données › « Partage entre collègues » et « Packages importés » › Geste : Importer un partage (.lcz) : l. 3495, 3496, 3497
- Écran 74 · Réglages › Données › « Partage entre collègues » et « Packages importés » › Geste : Retirer un package importé : l. 3505
- Écran 75 · Réglages › Captures et recherche › Geste : Recalculer les captures : l. 3515, 3518
- Écran 75 · Réglages › Captures et recherche › Geste : Générer l'export anonymisé (pour la recherche) : l. 3527
- Écran 75 · Réglages › Captures et recherche › Sans geste : l. 3536
- Écran 76 · Réglages › Gestion avancée › Geste : Supprimer un paramètre de configuration : l. 3548
- Écran 77 · Réglages › Données › Maintenance › Geste : Réinitialiser toutes les données : l. 3557, 3558, 3559
- Écran 77 · Réglages › Données › Maintenance › Sans geste : l. 3563
- Écran 78 · Réglages › Préférences › Geste : Changer une préférence : l. 3569, 3570
- Écran 78 · Réglages › Préférences › Geste : Mémoriser le dossier Travaux et les Archives entre les sessions (Sécurité) : l. 3574
- Écran 78 · Réglages › Préférences › Sans geste : l. 3579
- Écran 80 · Mode anonymisation (transversal) › Sans geste : l. 3593

### Annexe · Renvois entre zones

- Notés par l'analyste « entrée et codex » : l. 3609, 3610, 3611, 3612, 3614, 3616
- Notés par l'analyste « Cadre » : l. 3622, 3623, 3624, 3625, 3627, 3629, 3630, 3632
- Notés par l'analyste « Conception I » : l. 3636, 3638, 3642, 3645, 3647
- Notés par l'analyste « Conception II » : l. 3655, 3661, 3662, 3665, 3666
- Notés par l'analyste « Évaluation » : l. 3670, 3676, 3680, 3681
- Notés par l'analyste « Suivi I » : l. 3687, 3688, 3690, 3692
- Notés par l'analyste « Suivi II » : l. 3699, 3700, 3702, 3703, 3713
- Notés par l'analyste « Labo et Réglages » : l. 3719, 3722, 3724, 3725, 3728, 3729, 3730, 3731

---

## Classements incertains

Unités dont les sous-agents ont signalé qu'une autre catégorie était défendable. Elles sont classées comme indiqué dans le corps du texte ; la liste donne la catégorie retenue, puis l'autre lecture possible. Les références sont les lignes de `1-intentions-scellees.md` (et, entre parenthèses, de `2-observation-aveugle.md` quand le doute en dépend).

**Partie 1**
- l. 181, 488 (énoncés négatifs dont l'observation ne dit rien), 306, 308 (l'observation ne donne que le titre), 200, 218, 238, 360, 433, 448 (sous-titre ou couleur non mentionnés) : 2 ; concordant possible.
- l. 407, 496, 161 : 3 ; concordant possible.
- l. 223, 236 (lus dans le code en l. 200, rangés en l. 2843) et 221 (l. 1196 et l. 2890) : 4 ; concordant possible, selon que la lecture du code ou le classement « non observé » prime.
- l. 262, 263, 335 (état du menu Codex) : 2 ; 4 possible. l. 265, 266, 469 (l. 2836) : 4 ; 2 possible.

**Partie 2**
- l. 582, 584, 641, 667, 673, 759, 794 : 3, l'écart se déduisant de plusieurs passages de l'observation plutôt que d'un seul.
- l. 610 : 2 (témoin non mentionné). l. 645 : 2 ; 4 possible (l. 2855). l. 684 : 2 ; le cas « stockage local plein » de l'observation n'est peut-être pas celui de l'intention. l. 749 : concordant ; l. 750 : 2 (le libellé « Mesure d'aide » n'apparaît pas, seulement l'identifiant du champ).
- l. 553 : 2 pour la seule « même place » du bouton ; l'ordre des six accordéons, qui diffère dans l'observation, n'a pas été retenu comme écart. l. 616 (« Férié (collège fermé) » contre « Férié »), 642 (semaines comptées en jours ouvrables ou en jours de cours) : concordant ; 3 possible.
- l. 859, 914, 932 : concordant ; 2 possible.
- l. 867, 901, 909, 933, 954, 981 : 3 ; 2 possible.
- l. 952 : concordant (lu dans le code, l. 432) ; 4 possible (l. 2856).

**Partie 3**
- l. 995 à 999 : l'observation ne décrit pas l'ordre des sous-onglets comme tel ; l. 995 à 998 concordant d'après l'énumération de la l. 772, l. 999 (« en dernier ») en 2.
- l. 1044 : 3 ; 2 possible (le geste « dupliquer un exemple de démo » n'est pas observé).
- l. 1050 (4 après l'harmonisation des fenêtres du codex) et 1051 (concordant) : lecture ambiguë de « même fenêtre ».
- l. 1154, 1179 : 3 ; 2 possible (la l. 1179 a aussi une entrée 4).
- l. 1271 : 2 ; 3 possible (l. 2758, 928).
- l. 1095, 1098 : 4 (l. 2855) ; 2 possible.

**Partie 4**
- l. 1360, 1511 : 3 ; 2 possible. l. 1375 : 3 ; concordant possible.
- l. 1426 : 3, en citant la « Projection à l'EUF » de l'éditeur de grille pour une ligne « côté cartouches ».
- l. 1466 : 3 (jetons stockés sous deux noms).
- l. 1432, 1471, 1484 : concordant, bien que l'effet en aval ne soit pas observé.
- l. 1575 : 4 « hors de la copie observée » ; 2 possible.
- l. 1658 : 3 (sens de « douze types »).
- l. 1672 (3) et 1673 (concordant) : l'observation les décrit dans son corps (l. 706, 688) et les range aussi parmi les points non observés (l. 2861, 2864) ; 4 possible.
- l. 1928, 1992 : concordant ; écart possible (export non déclenché depuis les grilles, échelles et cartouches, l. 2868 ; import des productions dans la bibliothèque globale).
- l. 1969 : 1, rattachée à « non documenté » (l. 2821) ; concordant possible.

**Partie 5**
- l. 2007, 2010 : 2 ; 3 possible. l. 2017 : une entrée 4 (harmonisation des fenêtres du codex) et une entrée 2.
- l. 2013, 2015, 2016, 2056, 2115, 2178 : 3 ; concordant possible.
- l. 2048, 2049 : 4 ; 3 possible. l. 2063 : 3 ; 4 possible (observée par un autre point d'entrée ou lue dans le code).
- l. 2042 à 2044 (trimestre clos), 2157, 2163 (copies aux archives) : 2 ; 4 possible (points jamais déclenchés, non déclarés comme tels).
- l. 2188 : une entrée 4 et une entrée 2. l. 2247, 2248 : 4 (l. 1404 n'obtient qu'un refus, faute d'un second groupe-cours) ; 2 possible.
- l. 2284, 2285, 2336 : 4 (champ caché, l. 2901) ; 3 possible.
- l. 2277, 2317 : 3 ; 2 possible. l. 2309 : une entrée 3 et une entrée 4. l. 2318 : 4 ; 3 possible.
- l. 2192, 2379 : concordant ; écart possible (le PDF Léa de la l. 1733 ne montre pas de note chiffrée).

**Partie 6**
- l. 2482, 2572 : concordant ; 4 possible (rangés parmi les points non observés, mais lus dans le code). l. 2588 : 4 ; concordant possible.
- l. 2485, 2488, 2517, 2550, 2604 : 3 ; concordant possible.
- l. 2489 : 4 (l. 2935) ; 2 possible. l. 2491 : 2 (la seule mention d'un témoin « Enregistré » absent vise l'en-tête, l. 276).
- l. 2674, 2749 : 3 ; concordant possible.
- l. 2717 : 4 (l. 2929, qui vise le graphique du groupe) ; 2 ou 3 possible.
- l. 2666, 2676 : concordant ; 2 possible (sous-cas non exercés). l. 2705, 2738, 2769 : 2 ; concordant possible.
- l. 2709, 2725 : 2 ; 3 possible.

**Partie 7**
- l. 2853 à 2906 (dépistage par critères) : les entrées qui citent la l. 2930 sont en 4 ; 2 possible.
- l. 2851, 2852, 2915, 3014, 3038 : 3 ; concordant possible.
- l. 2956, 3004, 3075 : 3 ; 2 ou 4 possible.
- l. 2995 : 4 (harmonisation des fenêtres du codex) ; 2 possible. l. 3037 : 2 ; concordant possible.

**Partie 8**
- l. 3157, 3162 : 4 (l. 2930) ; 2 possible. l. 3292 : 4 (l. 2884) ; 2 possible.
- l. 3251, 3267, 3350 : 4 « hors de la copie observée » ; 2 ou concordant possible.
- l. 3313 à 3315 (Labo › Données) : 2 ; 3 possible (des comptes s'affichent dans Réglages › Données).
- l. 3330 : 3 ; concordant possible. l. 3215 : 3 (et une entrée 4). l. 3356 : 2 ; concordant possible.

**Partie 9**
- l. 3418, 3443 : 4 ; 3 possible. l. 3499, 3586, 3592 : 3 ; 4 ou concordant possible.
- l. 3371, 3483, 3488, 3517, 3525, 3526, 3585 : 2 ; concordant ou 4 possible. l. 3543 : 4 (harmonisation des fenêtres du codex) ; 2 possible.
- l. 3391, 3438 : concordant ; écart possible.

**Annexe**
- l. 3602, 3683 : 4 « hors de la copie observée » (énoncés sur la rédaction de l'intention ou sur un document archivé) ; concordant possible.
- l. 3612, 3642, 3713 : concordant ; ces renvois disent la décision « en attente » ou « à Grégoire » sans porter la marque « Non tranché » ; 4 possible si on assimile.
- l. 3714 : 2 (décidée mais « non livrée ») ; concordant possible.
- l. 3607, 3678 : une entrée 3 et une entrée 4. l. 3608 : une entrée 3 et une entrée 4. l. 3615, 3640 : 3 ; concordant ou 2 possible. l. 3628 : 4 ; 2 possible.
