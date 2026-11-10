# Rapport — lot « Vue simple »

Consigne de Cowork du 9 nov. 2026, 17 h 40. Branche `lot/vue-simple`, partie de `origin/lot/tableau-de-notation-1-bis` (`b6d5926`). Session cloud, Chromium seulement.

> **État : lot livré sur la branche `lot/vue-simple`, à juger le 11 novembre.** Rien n'est fusionné, `main` n'est pas touché, aucune release, rien au changelog. Le rapport final est ci-dessous ; la mesure faite avant le code suit, inchangée.

---

## LISTE DE TRAVAIL — ce qui entre dans la note, et où ça se règle (10 nov. 2026)

Demandée par le relais de 19 h 44, poussée AVANT la fin des réglages A et B. Règle validée par Grégoire : tout ce qui entre dans la note a une valeur de départ et se règle ; rien ne se règle avant d'avoir une note ; chaque réglage est à un geste de la valeur qu'il règle.

**Méthode.** Chaque ligne est lue dans le code du calcul (`js/profil-etudiant-actions.js`, `js/pratiques/pratique-pan-specifications.js`, `js/pratiques/pratique-registre.js`, `js/portfolio.js`), pas dans ses commentaires. Rien n'a été exécuté pour cette liste, sauf la dernière ligne du tableau « Constats ».

**La vue simple peut-elle ouvrir le réglage de la vue étendue plutôt que d'en bâtir un second ?** Mesuré : non, pas tel quel. Les réglages de la vue étendue sont des panneaux dans de grandes pages (la fiche de la pratique dans Conception › Pratiques, l'éditeur dans Conception › Échelles), pas des fenêtres ouvrables seules ; les montrer, c'est montrer la page entière, avec ses mots (grille, cartouche, jetons). Seul l'assistant de pratique est une fenêtre autonome, mais il traverse des étapes que le novice ne doit pas lire. **Ce que je fais donc : un réglage étroit en vue simple qui écrit LE MÊME champ des mêmes données.** Il n'y a pas de seconde source : ce qui est réglé d'un côté se lit de l'autre.

### Temps 1 — ce qui change la note (candidats pour le 11)

| # | Valeur | Départ proposé | Réglable en vue étendue ? | En vue simple | Coût | État / recommandation |
|---|---|---|---|---|---|---|
| 1 | **Les niveaux** (standards) : lettre, nom, valeur, nombre, ordre | Cinq niveaux, valeurs 0, 40, 65, 75, 100 | Oui : Conception › Échelles | « Régler », à côté des niveaux (écran Pratique et tableau) | Fait | **En cours de livraison (A)** |
| 2 | **La règle de sélection** (standards) : toutes, N meilleures, N dernières ; le nombre N | Toutes les productions | Oui : fiche de la pratique | « Régler », à côté de la phrase de la règle | Fait | **En cours de livraison** |
| 3 | **Les types** (spécifications) : nom, ajout, retrait | Projet, Examen | Oui : fiche de la pratique | « Régler », à côté des types | Fait | **En cours de livraison (B)** |
| 4 | **Les paliers** (spécifications) : nom, note, exigences par type, ajout, retrait | Excellence 90, Réussite 70 | Oui : fiche de la pratique | « Régler », à côté des paliers | Fait | **En cours de livraison (B)** |
| 5 | **La note quand aucun palier n'est atteint** (spécifications) | Aucune : « pas de note », avec la cause | Oui : un palier sans exigence | C'est le réglage des paliers : un palier sans exigence est le plancher | Fait avec la ligne 4 | À dire dans l'écran (une phrase y est) |
| 6 | **Les productions qui comptent dans la note** (standards) | Toutes comptent | Oui : fiche de la pratique, « Productions qui comptent dans la note » | Rien aujourd'hui | Petit : une marque par colonne du tableau, même champ | **Candidat pour le 11.** Je ne le construis pas sans accord |
| 7 | **Retirer ou renommer une production ; changer son type ou sa date** | — | Oui : Conception › Productions | Rien aujourd'hui : une colonne créée par erreur reste | Petit à moyen : retirer demande de dire ce que deviennent ses résultats (sens d'une suppression, donc à Grégoire) | **Candidat pour le 11** pour renommer, la date et le type ; retirer attend sa décision |
| 8 | **Une case vide** : ignorée, ou zéro | Ignorée (elle n'entre pas dans la moyenne) | En partie : « Notes finalisées » compte zéro, seulement pour une production obligatoire d'une pratique à catégories | Rien, et « Notes finalisées » est exclue de cette version | Touche le calcul partagé | **À trancher par Grégoire** : c'est le sens de la note. Hors du 11 |
| 9 | **La formule qui passe des valeurs retenues à la note** (standards) | Moyenne simple | **Non : codée en dur**, dans les deux vues | Rien | Touche le calcul partagé (une moyenne pondérée, une médiane, un mode sont des décisions de pédagogie) | **À trancher par Grégoire.** Hors du 11 |
| 10 | **Une production terminale et son poids** (« le reste × X % + terminale × Y % ») | Aucune terminale : les productions valent 100 % | Oui : type et pondération de la production | Rien : « + Production » ne crée pas de terminale | Moyen : deux champs de plus à « + Production », et les mots de cette variante | Candidat pour le 27 |
| 11 | **Les catégories** (une part choisie, une part obligatoire, 65 % et 35 %) | Éteintes | Oui : fiche de la pratique | Rien : la règle se lit, « se change en vue étendue » | Grand | Candidat pour le 27, ou réservé à la vue étendue |

### Temps 2 — le reste (candidats pour le 27, ou rien à ouvrir)

| # | Valeur | Départ | Réglable en vue étendue ? | Coût en vue simple | Recommandation |
|---|---|---|---|---|---|
| 12 | **L'arrondi** de la note | À l'entier, demi vers le haut | **Non : codé en dur** (`js/portfolio.js:309`, refait au tableau) | Touche le calcul partagé et l'export | 27 : à décider avec la ligne 9 |
| 13 | **La base** de la note | Sur 100 | **Non : codée en dur** | Touche le calcul, l'export, les valeurs des niveaux | Après le 27 |
| 14 | **« Acceptable / non acceptable »** : les deux mots | Ces deux mots | Non : libellés fixes | Moyen : libellés partagés par la Liste et le tableau | 27. Ne change pas la note, change ce qu'on lit |
| 15 | **L'ordre que lit « N dernières »** | L'ordre de création des colonnes | Non : aucun écran n'écrit ce rang | Touche le calcul partagé | **Limite connue, acceptée par Grégoire** ; à reprendre après le 27 |
| 16 | **Un·e étudiant·e exclu·e** (abandon, etc.) | Compte comme les autres | Oui : son statut, dans Cadre › Trimestre | Petit | 27. À savoir : masqué·e au tableau et à l'écran Note finale, mais **présent·e dans le CSV** (comportement d'avant le lot) |
| 17 | **Le DA à 7 chiffres** | 7 chiffres | **Non : imposé aussi en vue étendue** ; le calcul des spécifications ne rend aucune note pour un DA d'une autre longueur | Touche l'import, la fiche et le calcul | Après le 27 |
| 18 | **L'échelle propre à une production** | Celle de la pratique | Oui : fiche de la production | Moyen | 27 |
| 19 | **La couleur d'un niveau** | Celle du niveau de départ ; neutre pour un niveau ajouté | Oui : Conception › Échelles | Petit | 27. Ne change pas la note |
| 20 | Le seuil « acceptable » (75 %) des spécifications | 75 | Oui | — | **Rien à ouvrir** : sans effet sur un résultat saisi au tableau (il ne sert qu'à une copie évaluée avec une grille) |
| 21 | Le minimum d'évaluations (7) | 7 | Oui | — | **Rien à ouvrir** : sans effet sur la note (il ne sert qu'aux indices du Suivi) |
| 22 | Les reprises, les jetons, la copie non recevable | — | — | — | **Rien à ouvrir** : ces cas n'existent pas pour un résultat saisi au tableau |

### Quatre surprises de la mesure

- **La moyenne simple et l'arrondi à l'entier ne se règlent nulle part**, pas même en vue étendue (lignes 9 et 12). Ce sont les deux valeurs qui touchent le plus directement le principe de Grégoire.
- **La valeur d'un niveau est copiée dans le résultat au moment de la saisie.** Changer la valeur ensuite ne change pas les notes déjà construites : la case montre le signe « ≠ » jusqu'à ce qu'on ressaisisse. C'est la règle du tableau, confirmée ; elle surprendra quiconque vient d'un tableur, où changer une valeur recalcule tout.
- **Les valeurs de repli ne sont pas les mêmes partout** pour le nombre de productions retenues : 4 au calcul, 5 à la fiche, 3 ailleurs, 7 dans le modèle. Sans effet tant que la pratique porte son nombre, ce qui est le cas en vue simple.
- **Deux réglages de la vue étendue n'agissent pas sur la note** bien qu'ils se lisent comme tels : le « minimum d'évaluations », et le seuil des spécifications pour un résultat sans grille.

---

## RAPPORT FINAL (10 nov. 2026)

### Ce qui est fait, en gestes

1. **Un nouvel arrivant ouvre l'application** : il arrive en vue simple, sur un accueil titré « Ta notation alternative », avec quatre cartes numérotées. La barre porte cinq entrées : Accueil, Classe, Pratique, Résultats, Note finale.
2. **Il colle sa liste d'élèves** (DA, nom, prénom ; virgule, point-virgule, tabulation ou espaces). Une ligne sans DA de 7 chiffres est refusée et nommée ; rien n'est inventé. Le trimestre, le cours et le groupe naissent en coulisse : sans dates, sans horaire, sans congé.
3. **Il choisit un modèle**, par standards ou par spécifications, puis règle ce qui construit la note : en standards, « N meilleures », « N dernières » ou « Toutes », et le nombre ; en spécifications, la note de chaque palier et le nombre de productions acceptables qu'il demande.
4. **Il nomme ses productions depuis le tableau**, par « + Production » : un nom et une date. Chacune devient une colonne. Un tableau sans colonne dit quoi faire et montre « + Production ».
5. **Il inscrit ses résultats au tableau**, au toucher ou au clavier (le tableau de notation existant, monté dans la vue simple).
6. **Il voit la note de chaque élève** et exporte le CSV (l'export existant).
7. **Il sauvegarde** : le bouton de l'en-tête s'appelle « Sauvegarder », à la même place, avec le même point d'état. Son menu s'ouvre sur la phrase arrêtée, puis deux gestes : enregistrer dans un fichier, ouvrir un fichier.
8. **Il passe à la vue étendue** par le menu en haut à droite : il y retrouve sa classe, sa pratique, ses productions et ses résultats, aux mêmes endroits que tout utilisateur.
9. **Il revient à la vue simple** : idem.

Autour du parcours :

- **La bascule** vit dans le menu. En vue simple, une seule ligne, « Vue étendue ». En vue étendue, le menu habituel, puis sous un filet, « Vue simple ».
- **Basculer n'écrit rien dans les données.** Le choix reste sur l'appareil et ne voyage pas avec le codex.
- **Aucun parcours d'assistance** ne se lance ni ne se propose en vue simple ; les infobulles et flèches automatiques y sont coupées.
- **Quelqu'un qui a déjà des données** arrive en vue étendue. En vue simple, il voit ses groupes ; un groupe d'une autre pratique est marqué, et un mot dit pourquoi. Un sélecteur de groupe paraît dès qu'il y a plus d'un groupe.
- **Le passage vers la vue étendue tient** : les 38 écrans s'ouvrent sans erreur. Trois écrans disaient faux ou ne disaient rien devant un trimestre né en coulisse ; ils disent maintenant ce qui manque et où le donner (le calendrier sans dates, l'assiduité sans horaire, le bandeau « ton espace est prêt » qui affirmait un horaire).
- **`js/config.js` et `js/navigation.js` ne sont pas touchés.** Je n'ai pas eu besoin de l'autorisation : cinq sections neuves et une seconde barre suffisent.

### Ce que j'ai supposé (une ligne chacune)

- « Vide » se lit « aucun élève inscrit, dans aucun trimestre hors démonstration » (les élèves sont une liste plate par trimestre).
- La démonstration ouverte, sans choix fait, donne la vue étendue : elle ne s'ouvre que de là. **Ajout à la décision de Cowork.**
- Avoir bâti sa classe en vue simple vaut un choix : au rechargement, on y reste (sans quoi le novice basculerait en vue étendue dès qu'il a des élèves).
- La grille de départ que l'application sème d'elle-même ne compte pas comme « une grille de l'utilisateur ».
- En vue simple, une case évaluée avec une grille se lit et ne s'ouvre pas (l'éditeur est un écran de la vue étendue).
- Le sélecteur de groupe liste les groupes du trimestre actif ; changer de trimestre reste un geste de la vue étendue.
- La pratique installée s'appelle « Par standards » ou « Par spécifications », pas du nom du modèle (« N meilleures évaluations »), puisque la règle se change.
- Une production neuve prend le rang suivant du cours : les colonnes suivent l'ordre où on les crée.
- La règle sur les textes fixes du tableau (légende du point, phrase sur les critères) s'applique en vue simple seulement ; en vue étendue, les mots validés le 9 nov. ne bougent pas.
- Sous un banc d'essai piloté, la vue par défaut reste l'étendue (voir « La preuve », dernier point).

### Ce qui attend Grégoire

Une question par ligne, avec ma recommandation.

| # | Question | Recommandation |
|---|---|---|
| 1 | La carte 4 dit « Arrête les notes du trimestre », mais aucun geste n'arrête les notes. Le seul réglage proche, « Notes finalisées », compte zéro pour une production obligatoire non remise en standards : il change le sens de la note. | Pour le 11 : remplacer le texte par « Vois la note de chaque élève et exporte-les en CSV, prêtes pour ton relevé. » Décider ensuite si « Notes finalisées » s'offre en vue simple. |
| 2 | Les valeurs de départ sont celles des modèles existants : 7 meilleures productions ; paliers à 90 (2 projets, 1 examen) et à 70 (1 projet, 1 examen). Un novice qui a trois productions lit donc « 7 ». | Garder pour le 11, puisque rien n'est inventé. Dire si un autre départ (« Toutes ») sert mieux la présentation du 27. |
| 3 | « N dernières productions » suit l'ordre de création des colonnes, pas leur date. Une production ajoutée après coup avec une date ancienne compte comme la plus récente. | Accepter pour cette version ; c'est la lecture du calcul existant. |
| 4 | En spécifications, « + Production » demande un troisième champ, le type, parce que le modèle a deux types (Projet, Examen) et qu'une production sans type n'entre pas dans la note. | Garder le champ. L'autre voie est un modèle à un seul type pour la vue simple, donc un modèle neuf. |
| 5 | Le cours né en coulisse s'appelle « Mon cours » si le champ facultatif reste vide. Ce nom sort dans la colonne « Cours » du CSV. | Garder. |
| 6 | Le geste d'enregistrement dit « codex » dans ses propres fenêtres (« Mettre à jour le codex », « Codex mis à jour »), et le rappel de sauvegarde dit « Mets ton codex à jour ». Le mot est donc lu hors de la phrase qui l'introduit. | Laisser pour cette version : la phrase l'introduit juste avant, et couper le rappel retirerait une protection contre la perte. |
| 7 | Un novice qui rouvre son fichier sur un AUTRE appareil arrive en vue étendue (le choix ne voyage pas, décision de Cowork). | À trancher : c'est le cas du collègue qui passe du bureau à la maison. |
| 8 | Quelqu'un qui a créé trimestre, cours et groupes en vue étendue, mais pas encore d'élèves, arrive en vue simple (c'est la définition de « vide » de Cowork). | Recommandation : compter aussi un trimestre hors démonstration comme « des données ». Je n'ai pas changé la règle sans accord. |
| 9 | Les textes neufs ci-dessous. | À valider un à un. |

### Les textes neufs (tous marqués PROPOSÉ dans `js/vue-simple.js`)

Proposés par Cowork, repris tels quels :

- Accueil, sous le titre : « Quatre étapes, de ta liste d'élèves à ta note finale. »
- Carte 1 : « Ta classe » · « Colle ta liste d'élèves : DA, nom, prénom. » · « Coller ma liste »
- Carte 2 : « Ta pratique » · « Choisis un modèle, par standards ou par spécifications, et la règle qui construit la note. » · « Choisir un modèle »
- Carte 3 : « Tes résultats » · « Inscris un niveau, ou acceptable / non acceptable, dans un tableau : tes élèves en lignes, tes productions en colonnes. » · « Ouvrir le tableau »
- Carte 4 : « Ta note finale » · « Arrête les notes du trimestre et exporte-les en CSV, prêtes pour ton relevé. » · « Voir les notes »
- Menu : « Toutes les fonctions » sous « Vue étendue » ; « Ta notation seulement » sous « Vue simple ».

Proposés par moi :

- Barre : « Accueil », « Classe », « Pratique », « Résultats », « Note finale ».
- Classe : « Colle ta liste d'élèves, une ligne par élève : DA, nom, prénom. » · « Nom du cours (facultatif) » · « Ta liste » · « Créer ma classe » · « Ajouter des élèves » · « Ajouter à ma classe » · « Choisir ma pratique » · en-têtes « DA », « Nom », « Prénom ».
- Classe, retours : « Classe créée : N élèves. » · « N élèves ajoutés, N déjà inscrits ce trimestre. » · « Aucun élève lu. Une ligne par élève : DA, nom, prénom. » · « N lignes non lues : » · « le DA doit compter 7 chiffres » · « il manque le nom ou le prénom » · « ce DA est déjà dans la liste collée » · « La démonstration est ouverte. Quitte-la pour créer ta classe. » · « La classe n'a pas pu être créée. »
- Nom du cours par défaut : « Mon cours ».
- Groupe : « Groupe » · « Choisis un groupe » · « (autre pratique) » · « Un groupe dont la pratique n'est ni par standards ni par spécifications se suit en vue étendue. » · « Commence par ta classe : colle ta liste d'élèves. »
- Pratique : « Choisis un modèle. Tu régleras ensuite la règle qui construit la note. » · « Par standards » · « Chaque production reçoit un niveau. La note se construit à partir des niveaux que la règle retient. » · « Choisir les standards » · « Par spécifications » · « Chaque production est acceptable ou non acceptable. La note dépend du nombre de productions acceptables. » · « Choisir les spécifications ».
- Pratique, la règle : « Modèle » · « La règle qui construit la note » · « Nombre de productions retenues » · « Niveaux : » · « Note » · « Pour chaque note, le nombre de productions acceptables qu'il faut, par type. » · « Enregistrer la règle » · « Règle enregistrée. » · « Changer de modèle » · « Cette règle vaut pour les N groupes qui ont cette pratique. » · « La règle de cette pratique se change en vue étendue. » · « La pratique de ce groupe n'est ni par standards ni par spécifications : elle se règle en vue étendue. » · « La pratique n'a pas pu être enregistrée. »
- Résultats, à la place des messages du tableau qui nomment la vue étendue : « Ce groupe n'a pas encore de pratique. Choisis un modèle : le tableau suivra sa règle. » · « Le tableau sert aux pratiques par standards et par spécifications. La pratique de ce groupe se suit en vue étendue. » · « Ce groupe n'a pas encore d'élèves. Colle ta liste pour remplir le tableau. » · « Ton tableau n'a pas encore de colonne. Ajoute ta première production : un nom et une date. »
- « + Production » : « Nom de la production » · « Date » · « Type » · « Ajouter » · « Annuler » · « Donne un nom à la production. »
- Note finale : « La note de chaque élève, construite par la règle de ta pratique à partir des résultats du tableau. » · en-tête « Élève » · « Aucune note à montrer : ce groupe n'a pas encore d'élèves. »
- Sauvegarder : « Enregistrer dans un fichier » · « Ouvrir un fichier… » · « Ton fichier est à jour. » · « Ton fichier n'a pas tes derniers changements. »
- Vue étendue, Cadre › Calendrier sans dates (`js/calendrier-vue.js`) : « Le calendrier se construit à partir des dates de ton trimestre, et ce trimestre n'en a pas encore. Tu peux les donner dans Cadre › Trimestre. »
- Vue étendue, Suivi › Groupe sans horaire (`js/tableau-bord-apercu.js`) : « Assiduité non calculée : ce groupe n'a pas d'horaire. Tu peux le donner dans Cadre › Trimestre › Horaire. »

Repris sans changement de textes déjà validés : les mots du tableau (dont « Exporter la synthèse (CSV) », « Réglages de la pratique », « Note provisoire »), et les libellés de la règle des standards (« N meilleures productions », « N dernières productions », « Toutes les productions »).

### Ce que je n'ai pas pu vérifier

- **WebKit, Safari, l'iPad** : rien. Tout a tourné sous Chromium seulement.
- **La suite Playwright entière** (environ 360 bancs) : non lancée. Seuls le banc de la vue simple et celui du tableau ont tourné.
- **Les données réelles de Grégoire** : aucune n'a été ouverte. Le cas « utilisateur existant » est éprouvé sur des données fictives semées.
- **Sous 780 px de large** (téléphone) : la barre de la vue simple passe sur une seconde rangée ; écrit, non capturé ni éprouvé.
- **Le toucher** : les essais cliquent à la souris et tapent au clavier.
- **Un très gros corpus** : au démarrage, la vue étendue est posée d'abord dès qu'un trimestre existe, pour éviter un clignotement ; non mesuré sur un vrai corpus.

### La preuve

- **Vitest** : suite entière, 11 000 essais verts sur 11 000 (10 963 à la base du lot). Banc du lot : `tests/unit/vue-simple.test.js`, 33 essais — la règle de la vue par défaut (vide, démonstration, codex importé, choix), la navigation de la vue étendue identique (sections, ordre, sous-sections, barre, liste des écrans étroits, menu ; empreinte des deux fichiers protégés égale à celle de `b6d5926`), la liste collée, ce qui naît en coulisse, la règle.
- **Playwright Chromium** : `tests/integration/vue-simple.spec.js`, 13 essais verts sur 13 ; `tableau-de-notation-1.spec.js`, 19 sur 19 (non-régression).
  - le parcours 1 à 9 en entier, par l'interface, sur des données fictives ;
  - la bascule aller-retour : même compte de clés et même empreinte, sur une application vide et sur une classe avec résultats ;
  - sur des données de novice, 25 états d'écran lus (texte, infobulles, libellés lus par un lecteur d'écran) : aucun mot de la liste, « codex » dans la seule phrase, aucun chemin « › » vers la vue étendue ;
  - la légende du point et la phrase sur les critères : absentes sans grille, présentes avec une grille ;
  - aucun parcours proposé ; le menu ne porte que « Vue étendue » ;
  - après le parcours, les 38 écrans de la vue étendue s'ouvrent sans erreur en console et aucun ne reste muet ;
  - double clic, modèle repris, retour à la vue simple, rechargement, spécifications, utilisateur existant.
- **Break-tests** : 28 défenses retirées une à une dans une copie de travail à part ; les 28 essais ont rougi ; code restauré. Deux essais étaient verts à tort au premier passage (les messages du tableau, le bandeau d'étape) : ils ont été durcis, puis ont rougi.
- **Relecture par un agent neuf** : faite sur le diff, sans mes conclusions. Aucun défaut de sécurité ; la bascule n'écrit rien (confirmé). Ses constats et leur disposition : tableau ci-dessous.
- **Captures** : 80 images dans `plans de travail/captures-2026-11-10-vue-simple/` — 20 écrans à 1180 et 820 px, en clair et en sombre. Noms fictifs.
- **Sécurité** : toute valeur passe par `echapperHtml` ; aucun handler inline ; aucun `console.log`.
- **Une conséquence mesurée en chemin, à connaître** : une application vide s'ouvre maintenant en vue simple, et presque tous les bancs Playwright existants partent d'une application vide. Le banc du tableau a rougi en entier. Remède retenu : sous un navigateur piloté par un banc, la vue par défaut reste l'étendue ; le banc de la vue simple éteint ce drapeau pour éprouver la vraie règle. **À confirmer sur le Mac par la suite WebKit entière avant toute fusion.**

### Ce qui n'est pas dans cette version

- Renommer ou retirer une production, retirer un élève : ces gestes restent ceux de la vue étendue.
- Arrêter les notes (question 1).
- Changer de trimestre depuis la vue simple.

### Les constats, et ce qu'ils deviennent

De la mesure (§ 11 et 12) et de la relecture neuve. Aucun n'est inscrit au BACKLOG : la règle du 24 août demande un symptôme vécu ; ceux qui le méritent sont proposés à Cowork.

| Constat | Disposition |
|---|---|
| Calendrier vide sans explication ; assiduité muette sans horaire ; bandeau qui affirme un horaire | **Corrigé** dans le lot |
| La pratique née en vue simple était invisible dans Conception › Pratiques (elle gardait l'auteur « Demo Labo Codex » du modèle) | **Corrigé** |
| Double clic : deux cours, deux pratiques, deux colonnes | **Corrigé** (un geste à la fois) |
| « Enregistrer la règle » écrasait un minimum d'évaluations réglé à part | **Corrigé** |
| « Changer de modèle » laissait une pratique orpheline à chaque aller-retour | **Corrigé** (elle est reprise) |
| Rang d'une production neuve faux dans un cours qui a déjà des productions | **Corrigé** |
| Un geste commun (« Trimestres », « Quitter la démo ») ouvrait la vue étendue sans barre pour en sortir | **Corrigé** (retour à l'écran simple) |
| Clignotement possible au démarrage sur un gros corpus | **Corrigé**, non mesuré sur un vrai corpus |
| Messages faux à l'écriture (« 0 élève ajouté » sur un trimestre clos, « tes données n'ont pas changé ») | **Corrigé** |
| Régressions possibles en vue étendue : service et mode « cours, tous groupes » pour le bandeau et l'assiduité ; ancien champ de date du calendrier | **Corrigé** |
| Le mot « codex » dans le geste d'enregistrement et dans le rappel | **Remonte à Grégoire** (question 6) |
| Un utilisateur sans élèves arrive en vue simple | **Remonte à Grégoire** (question 8) |
| Un groupe sans horaire hérite des séances du dernier groupe activé (`js/horaire.js:179`) : un groupe né en vue simple, dans un trimestre où un autre groupe a un horaire, en reçoit un qui n'est pas le sien | **Préexistant, non corrigé.** Proposé à Cowork : il touche l'assiduité d'élèves réels |
| Assigner une pratique écrit même dans un trimestre clos (`PratiqueManager.changerPratiqueActive`) | **Préexistant, non corrigé.** Proposé à Cowork |
| Les trois modèles prêts portent l'auteur « Demo Labo Codex » ; installés par la vue étendue, ils seraient peut-être masqués de la même façon | **Non vérifié.** À mesurer par Cowork |
| Un cours orphelin reste si la création du groupe échoue après celle du cours | **Refusé** pour cette version : cas d'un stockage plein, message corrigé |
| « 1234567 De La Fontaine Jean » (séparé par des espaces) : le nom lu est « De » | **Refusé** : la virgule ou la tabulation lèvent l'ambiguïté ; à dire dans l'aide si le cas se vit |
| La classe compte les élèves exclus, le tableau non | **Laissé** : sans effet sur la note |

---

## ÉTAPE 1 — LA MESURE (lecture seule, 9 nov. 2026)

Méthode : lecture du code par quatre agents en parallèle et par moi (`js/config.js`, `js/navigation.js`, `js/tableau-notation.js`, l'en-tête d'`index.html`). **Rien n'a été exécuté dans un navigateur à cette étape** : la colonne « section par section » plus bas est une lecture de code, à confirmer par le banc Playwright du lot. Base mesurée : Vitest 10 963 verts sur 10 963 à `b6d5926`, version 1.239.0.

### 1. La navigation, et la façon la plus étroite de masquer

- Les sections et sous-sections sont déclarées dans `configurationsOnglets` (`js/config.js:32`). Les boutons de la barre principale sont du HTML statique (`index.html:3708-3718`), doublés d'une liste pour les écrans étroits (`#entete-sections-liste`, `index.html:3806`). `afficherSection(nom)` (`js/navigation.js:68`) montre `#section-<nom>` et masque les autres ; une section absente de `configurationsOnglets` s'affiche sans sous-navigation.
- **Constat : la vue simple peut se faire SANS toucher à `js/config.js` ni à `js/navigation.js`.** Une section neuve `#section-simple` dans `index.html`, une seconde barre de cinq entrées à côté de la barre principale, et une classe sur `<body>` qui masque l'une ou l'autre. `afficherSection('simple')` fonctionne tel quel.
- **Décision (technique, la mienne) : je n'use pas de l'autorisation sur les deux fichiers protégés.** Le masquage vit dans le CSS et dans un module neuf. Le banc « navigation de la vue étendue identique avant et après » reste dû et sera livré (il compare entrées, ordre et sous-sections à l'état de `b6d5926`).

### 2. Ce que le code sait d'une application vide

- Aucune fonction générale. Trois approximations existent : `aproposReplie()` (`js/accueil.js:84`, « un trimestre autre que démo existe »), `utilisateurADesDonnees()` (`js/modal-backup-reminder.js:38`, compte les évaluations), `etapesDuCadre()` (`js/trimestre-v2.js:512`).
- Le mode démo se reconnaît : `estEnModeDemo()` (`js/modes.js:1633`), trimestre d'id `demo`, clés `demo_*`.
- **À écrire** : une fonction pure « vide » = aucun élève dans la liste (`<trimestre>_groupeEtudiants`) d'aucun trimestre hors démo.
- Les élèves sont une liste plate par trimestre, pas rangés dans un objet « groupe ». **Supposition** : « aucun groupe avec au moins un élève » se lit « aucun élève inscrit, dans aucun trimestre ».

### 3. Où garder le choix de la vue

- Le thème clair/sombre vit dans `preferencesUtilisateur` et **voyage avec le codex** : ce n'est pas le bon endroit.
- À l'export, seules les clés `_codex_*` sont exclues (`js/codex.js:476`) ; à l'ouverture d'un codex, les clés qui commencent par `_` ne sont pas écrites (`js/codex.js:440`).
- **Décision** : le choix de la vue s'écrit directement dans `localStorage`, hors de `db.js`, sous une clé à lui. Il n'entre donc ni dans le codex ni dans l'empreinte des données. Seul un choix EXPLICITE est écrit (la bascule, ou avoir bâti sa classe en vue simple) ; sans choix, la règle « vide → simple, sinon étendue » est recalculée à chaque démarrage.

### 4. Coller une liste, créer trimestre, cours, groupe

| Besoin | Ce qui existe | Réutilisé ? |
|---|---|---|
| Créer un trimestre sans formulaire | `creerTrimestre(session, annee)` puis `changerTrimestreActif(id)` (`js/trimestres.js:509, 547`) | Oui |
| Créer un cours | `CoursEntite.creer(donnees)` (`js/entites/cours-entite.js:82`) | Oui |
| Inscrire des élèves | `db.modifier(cle('groupeEtudiants'), …)` | Oui |
| Créer un groupe-cours | **Aucune fonction** : le seul chemin passe par le formulaire du Cadre, qui exige horaire et enseignant. `creerMonService()` (`js/rencontres.js:310`) fait déjà toute la chaîne en coulisse, sans horaire, mais pour un « service » d'orthopédagogie | Le motif, pas la fonction |
| Lire une liste collée | `analyserListeEtudiantsCollee` exige quatre colonnes (format Omnivox, avec le groupe) ; `analyserListeEleves` (rencontres) accepte trois colonnes mais **invente un DA provisoire**, ce que la règle « aucun DA inventé » interdit ailleurs | Non : un lecteur neuf, DA de 7 chiffres, rien d'inventé |

- Le trimestre né en coulisse : un identifiant tiré de la date du jour (A, H ou E + année), **sans dates de début ni de fin, sans horaire, sans congé**. `genererCalendrierComplet()` écrit alors un calendrier vide, sans planter (`js/trimestre.js:55`).
- Le groupe-cours : `horaireId: null`, pratique vide, comme celui d'un service.
- Le cours : il lui faut un nom. **Supposition** : un champ facultatif « Nom du cours » sur l'écran Classe ; laissé vide, le cours s'appelle « Mon cours » (texte PROPOSÉ). C'est le seul mot inventé du trimestre né en coulisse, et il se lit dans la colonne « Cours » du CSV.

### 5. Choisir un modèle et la règle

- Trois modèles prêts existent pour ces deux familles (`js/pratiques-bibliotheque.js:30`) : « N meilleures évaluations » et « N plus récentes » (standards), « Modèle simple » (spécifications : deux types, Projet et Examen ; deux paliers, 90 et 70).
- L'installation existante (`ajouterPratiqueALaSelection`, `js/pratiques-gestion.js:756`) passe par des fenêtres de la vue étendue ; l'assignation au groupe est `PratiqueManager.changerPratiqueActive(id)` (`js/pratiques/pratique-manager.js:64`).
- **La règle, en standards** : `portfolio.methodeSelection` (meilleures, plus récentes, toutes) et `portfolio.nombreARetenir`. **En spécifications** : les paliers (une note pour un nombre de productions acceptables par type).
- Un modèle par standards a besoin d'une échelle : l'échelle de départ du trimestre (`ECHELLE_IDME_DEPART`, cinq niveaux) est semée par `assurerEchelleIdmeDeDepart()` (`js/echelles.js:386`).
- **Ce qui remonte à Grégoire** : les valeurs de départ des modèles sont celles qui existent déjà (7 meilleures, 5 plus récentes, paliers 90 et 70). Je n'en invente aucune ; l'enseignant les change à l'écran Pratique.

### 6. « + Production » : la production la plus légère

- Clé `cle('productions')`. Le formulaire exige titre, type, et une pondération sauf en standards.
- Le tableau et le calcul acceptent, en standards : `{ id, titre, type: 'autre', coursId, dateEcheance }`. Aucun lien à un standard n'est requis ; ni grille, ni échelle (celle de la pratique sert).
- **En spécifications, une production ne devient une colonne que si son type est un des types de la pratique.** « Un nom et une date, rien d'autre » ne suffit donc pas quand la pratique a plus d'un type. **Supposition** : « + Production » ajoute alors un troisième champ, le type, et seulement dans ce cas.

### 7. « Arrête les notes »

- Aucun geste n'arrête les notes d'un trimestre. Ce qui s'en approche : la case « Notes finalisées » des réglages d'une pratique (`configuration.notesFinales`). Elle change des libellés (« Note finale » au lieu de « Note provisoire », statut `final` au CSV) **et, en standards, compte zéro pour une production obligatoire non remise**. Elle ne verrouille rien.
- **Cela touche le sens d'une note : je ne l'offre pas en vue simple.** La carte 4 sera livrée avec la note et l'export seulement. Question pour Grégoire au rapport final.
- L'export existe : `exporterSyntheseResultatsCSV()` (`js/export-resultats-finaux.js:190`), colonnes DA, Nom, Prénom, Groupe, Cours, Trimestre, Pratique, Note finale, Statut, Non comptées.

### 8. Le sélecteur de l'en-tête

- **L'en-tête ne porte pas de sélecteur de trimestre.** La bande pâle porte un sélecteur de **groupe-cours** (`#selectGroupeCoursHeader`, `index.html:3827`), avec les mots « groupe-cours » et « Cours (tous groupes) ».
- **Décision** : en vue simple, la bande pâle est masquée. Résultats et Note finale portent leur propre sélecteur de groupe, affiché seulement s'il y a plus d'un groupe. **Supposition** : il liste les groupes du trimestre actif ; changer de trimestre reste un geste de la vue étendue.

### 9. « Sauvegarder »

- Le bouton « Codex » (`#btn-codex`, `index.html:3723`) ouvre un **menu déroulant** de douze entrées (`#codex-menu`). Son en-tête (`#codex-menu-statut-haut`) est réécrit à chaque ouverture par `_actualiserMenu()` (`js/codex.js:3206`) : c'est là que la phrase peut s'afficher.
- Presque chaque entrée porte le mot « codex », et d'autres portent « Archiver », « Fusionner », « codex data ». **Décision** : en vue simple, le menu montre la phrase, puis deux gestes seulement, « Enregistrer dans un fichier » et « Ouvrir un fichier… » (textes PROPOSÉS), branchés sur les mêmes actions qu'aujourd'hui. Le point d'état ne change pas.
- **Chemin détourné qui reste** : le geste d'enregistrement lui-même (aperçu « Mettre à jour le codex », barre « Génération du codex », confirmation « Codex mis à jour ») dit « codex ». Il vient après la phrase qui introduit le mot. Je ne réécris pas ces fenêtres : disposition au rapport final.

### 10. Les parcours d'assistance

- Aucun parcours ne démarre seul (`js/assistance.js:13`). Ils se proposent par l'entrée « Assistance » du menu, par l'accueil étendu, et par des flèches et bulles automatiques (`js/accompagnement.js:765`).
- En vue simple : le menu ne porte que « Vue étendue », l'accueil étendu n'est pas affiché, et les flèches sont coupées par une garde sur la vue dans `estAccompagnementActif()`.

### 11. Le passage vers la vue étendue, section par section

Lecture de code, devant un trimestre né en coulisse (un cours, un groupe, des élèves, une pratique, des productions, des résultats ; ni dates, ni horaire, ni grille).

| Section | Verdict | Ce qui manque |
|---|---|---|
| Accueil | tient | |
| Cadre › Trimestre | tient | |
| Cadre › Calendrier | **vide sans explication** | se rabat sur août 2025 et montre des mois vides (`js/calendrier-vue.js:478`) |
| Conception | tient | états vides existants |
| Évaluation › Liste et tableau | tient | |
| Évaluation, ouvrir une copie | message existant | « Grille introuvable » (`js/evaluation-chargement.js:1325`) |
| Évaluation, bandeau d'étape | **affirme à tort** que l'horaire est configuré (`js/transitions.js:65`) | |
| Suivi › Groupe | **vide sans explication** pour l'assiduité (`js/tableau-bord-apercu.js:1794`) | |
| Suivi › Présences | **bloqué sans dire pourquoi** : « hors du calendrier scolaire » pour toute date (`js/saisie-presences.js:718`) | |
| Dépistage (profil) | tient | message explicite sans grille |

Aucun accès qui lèverait une erreur n'a été trouvé à la lecture ; le banc le vérifiera en console.

### 12. Les chemins détournés vers un mot interdit

1. Le menu du bouton de l'en-tête (traité, § 9) et le geste d'enregistrement (reste, § 9).
2. Les textes fixes du tableau : la légende du point, la phrase sur les critères (arrêté par Grégoire), mais aussi **trois messages d'état qui nomment des écrans de la vue étendue** (« Conception › Pratiques », « Cadre › Trimestre », « Conception › Productions ») et le lien « Réglages de la pratique » qui y mène. En vue simple, ils seront remplacés par des textes propres (PROPOSÉS) ; ceux de la vue étendue, validés mot pour mot, ne bougent pas.
3. Une case évaluée avec une grille ouvre la copie dans l'éditeur de la vue étendue. En vue simple, elle se lit et ne s'ouvre pas.
4. Les infobulles au survol (`data-tooltip`) et les flèches automatiques : coupées en vue simple.
5. Le bandeau de version et son bouton « Voir les nouveautés » (le journal des versions nomme tout) : le bouton est masqué en vue simple.
6. Le rappel « Mets ton codex à jour » (1,5 s après le démarrage, dès qu'il existe des résultats) : il dit « codex ». **Je le laisse** : le couper retirerait une protection contre la perte de données. Disposition au rapport final.
7. La cause « Seule l'évaluation terminale a une note… les artefacts du portfolio… » (`js/pratiques/pratique-registre.js:933`) : elle ne peut paraître que s'il existe une production terminale, donc jamais chez un novice de la vue simple.
8. Le bandeau « Mode démonstration » : la démo ne s'ouvre que depuis la vue étendue.

### Ce que la mesure contredit ou nuance dans la consigne

- « Le sélecteur de trimestre de l'en-tête » n'existe pas (§ 8).
- « Arrête les notes » n'a pas de geste (§ 7) : la carte 4 promet plus que ce qui est livré. Le texte de Cowork est gardé tel quel, marqué PROPOSÉ, et signalé.
- « Un nom et une date, rien d'autre » ne tient pas en spécifications à plusieurs types (§ 6).
- Rien ne contredit une décision arrêtée par Grégoire : je continue.
