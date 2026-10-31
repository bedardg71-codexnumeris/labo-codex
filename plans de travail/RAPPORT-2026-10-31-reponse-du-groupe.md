# Rapport – La réponse du groupe

> Claude Code, samedi 31 octobre 2026 (Toronto). Exécute `CONSIGNE-LOT-2026-10-30-reponse-du-groupe.md`. Pas de release, pas de push : relecture de Cowork d'abord, vérification complète du soir ensuite.

## Ce qui est livré

| Point de la consigne | Fait | Où |
|---|---|---|
| § 0 La phrase de groupe retirée | Oui, avec `signauxDeGroupeDepistage` et ses tests ; une garde les remplace | `js/tableau-bord-apercu.js`, `js/profil-etudiant-calculs.js` |
| § 1 Ordre : seuils, ce qu'ils donnent, choix d'activer | Oui, sous « Seuils d'interprétation » | `index.html`, `js/preferences-v2.js` |
| § 1 Nombre, part, sources, sensibilité à ± 5 points | Oui, sur la vraie règle du niveau | `ceQueTesSeuilsDonnent` |
| § 1 Réglage éteint, texte du 30 oct. mot pour mot | Oui ; rien d'écrit sans geste | `afficherReponseDuGroupe` |
| § 2 Carte de l'Aperçu : deux barres, phrases, note | Oui, sous la barre RàI | `genererCarteReponseDuGroupe` |
| § 2 70 % : une constante, lue par la carte et l'Aide | Oui | `SEUIL_NIVEAU_1_REPONSE_DU_GROUPE`, `js/contexte-qualification.js` |
| § 3 L'Aide | Proposée, ci-dessous ; à valider avant la release | carte RàI, guide RàI |

Rien n'écrit dans les données : la préférence est neuve et absente par défaut. Pas de stock à réparer.

## Une question pour Grégoire : les étudiant·es sans note dans la part au niveau 1

La consigne met « En attente » hors des pourcentages (supposition de Cowork, nommée). Or, sans note affichée, un·e étudiant·e ne peut pas être au niveau 1 : seuls ceux et celles qui portent un signal ont un niveau. Le code le disait déjà : « Avant la note provisoire, les seuls élèves à niveau feraient 100 % » (`genererBarreRaI`).

- **Avant toute note** : la carte aurait écrit « 0 % au niveau 1, enseignement universel renforcé » pour n'importe quel groupe. **J'ai ajouté une garde** : tant qu'aucune note ne s'affiche, ni barres ni phrase, seulement « la comparaison attend ». C'est un ajout à la consigne.
- **Pendant la montée des notes, le biais reste.** Exemple par la règle : 10 étudiant·es avec une note, tous au niveau 1 ; 5 sans note, « Difficulté persistante », donc au niveau 2 ; 10 en attente. La carte écrit 67 % et « renforcé », alors que personne n'est sous le seuil par sa note. En pratique alternative avec un minimum de copies, ce moment dure tant que le groupe n'a pas franchi le minimum.

Décision : (A) garder tel quel ; (B) calculer la part sur les étudiant·es dont la note s'affiche, plus « Non-participation » ; (C) n'afficher la phrase qu'une fois la note affichée pour tout le groupe. Recommandation : B, qui ne compare que des personnes pouvant être au niveau 1, sans faire attendre tout un groupe pour un retardataire. C'est un jugement sur ce que veut dire la part au niveau 1 : il revient à Grégoire.

## Les mots à valider par Grégoire

Validés, repris tels quels : le texte du réglage, les deux phrases de la carte (hors l'ajout ci-dessous), la note sur le repère.

**À valider avant la release :**

- **Aide, carte RàI** (remplace la phrase de groupe) : « La réponse du groupe est facultative et éteinte au départ : la case « Afficher la réponse du groupe » (Labo → Outils d'observation). Activée, une carte de l'Aperçu compare la répartition de ton groupe au repère de la RàI (80 % au niveau 1, 15 % au niveau 2, 5 % au niveau 3). Sous 70 % au niveau 1, elle dit que le groupe demande un enseignement universel renforcé, quelle qu'en soit la cause. Les étudiant·es « En attente » restent hors des pourcentages, et la carte attend qu'au moins une note du cours s'affiche. Elle n'enlève aucun signal individuel. »
- **Guide RàI** (la phrase de groupe y était aussi) : « Si tu l'actives, la réponse du groupe compare ta répartition au repère de la RàI, sans enlever aucun signal individuel. »
- **Ajoutés par moi** : « {N} étudiant·es en attente de la note du cours, hors des pourcentages. » (la consigne s'arrête à « du cours ») ; « La note du cours ne s'affiche encore pour aucun·e étudiant·e : la comparaison attend. » ; « lu dans l'échelle de tes copies » ; l'étiquette « Aperçu › La réponse du groupe » ; « Ton groupe » et « Repère de la RàI » viennent de l'ébauche.
- **Repris de l'ébauche, corrigés selon la consigne** : « Ce que tes seuils donnent sur ce groupe » ; « S'affiche une fois tes seuils posés. » ; « Voir ce que mes seuils donnent » ; « D'où viennent les niveaux 2 et 3 » et ses sources (« note du cours à ce jour sous ton seuil » ; « note du cours à ce jour sous ton seuil et critère de fondation en difficulté » ; « « Difficulté persistante », note au-dessus du seuil » ; « « Difficulté persistante », avant la note du cours », qui est neuve ; « signalement diagnostique » ; « « Non-participation » ») ; « Sensibilité de ton seuil. À {X} %, {N} étudiant·e(s) de plus aux niveaux 2 ou 3. À {Y} %, {M} de moins. » ; « Tu peux changer tes seuils. Change-les pour ce qu'ils disent d'un travail suffisant, pas pour obtenir une autre répartition. » ; « Facultative. Rien ne s'affiche tant que tu ne l'actives pas. » Les niveaux disent « Universel · Préventif · Intensif ».

## Ce que j'ai supposé

- **Le geste « Voir »**, repris du script de l'ébauche : la répartition ne se calcule qu'au clic, et la case attend ce clic. Déjà activée, elle reste accessible pour pouvoir s'éteindre.
- **Le seuil se lit sur le chiffre écrit** : 69,6 % s'écrit 70 % et donne « proche du repère ». La phrase ne dit jamais « 70 % » et « renforcé » ensemble.
- **La sensibilité simule tout le seuil** : « Difficulté persistante » suit le seuil déplacé, comme si l'échelle changeait. Rien n'est écrit.
- **Deux pourcentages différents à l'écran** tant que des étudiant·es sont en attente : la barre RàI compte tout le groupe (lot 3 des seuils), la carte seulement ceux et celles qui ont un niveau.
- **« Tous les groupes »** : une seule carte, sur tout ce que montre la barre RàI. L'ancienne phrase nommait le groupe en cause ; la carte ne le fait pas.
- **RàI décochée** : pas de carte, comme la barre. Le réglage reste visible.
- **Couleurs** : celles de la RàI dans l'application (bleu, indigo, violet), pas le vert, l'ambre et le rouge de l'ébauche. Les parts s'écrivent à côté des barres : un segment de 5 % ne peut pas les porter. En clair, les jetons des niveaux 2 et 3 étaient sous 3:1 sur le blanc (2,98 et 2,72) : la carte y prend les teintes de la légende de la barre RàI.

## Vérifié comment

- Vitest entier vert (10 553 tests), lancé depuis `tests/`.
- Specs WebKit touchées vertes (6/6) : `reponse-du-groupe`, `barres-apercu-axe`, `tableau-bord-906-bilan-premier-rendu`.
- 25 changements volontaires du code font tous rougir au moins une garde, le code restauré après chacun (journal en fin de `sentinelle-reponse-du-groupe-2026-10-31.test.js`).
- Captures dans WebKit (Playwright), pack de démo, données fictives : `plans de travail/captures/reponse-groupe-*`. Le pack est à 80 % au niveau 1 ; pour voir la phrase « renforcé », la capture de la carte monte la constante à 90 dans la page, le temps de la prise.

**Pas encore** : la vérification complète du navigateur, Safari sur l'iPad, ton vrai codex.

## Hors du lot

La popup de l'Aide (`js/accompagnement-contenu-popup.js`) dit « Niveau 1 (vert), Niveau 2 (jaune), Niveau 3 (rouge) », alors que barre et badges sont bleu, indigo et violet. Issue : relevé ici, sans correctif ; le BACKLOG attend un symptôme vécu.
