# Demande de relecture – La note en pourcentage à la norme française (consigne du jour, après-midi)

> Claude Code, 21 octobre 2026, après-midi. Consigne : `CONSIGNE-DU-JOUR.md` (Cowork, 11 h 08) ; décision de Grégoire du 11 h 07. Un commit sur `main`, non poussé, sans numéro de version ni verdict complet.

## Ce qui a changé

**La fonction.** `formaterNotePourcentage` rend « 89,2 % », « 67 % », « 0 % » : une virgule, puis le caractère U+00A0 avant le signe, jamais l'entité. Elle garde une décimale au plus et retire le zéro final. Une deuxième fonction s'ajoute dans le même module, `formaterNoteNombre` : elle rend le même nombre sans le signe, pour les termes d'une somme de notes (« (90 + 85 + 78 + 70) / 4 = 80,8 % »).

**Ma ligne de partage, ce qu'est une note** (le critère de la consigne, rendu opérant) :
- **une note** : ce qu'un élève obtient (une copie, une production, une note provisoire ou finale, une reprise, un palier atteint) et les moyennes de ces notes ;
- **pas une note** : les indices (A, C, P, y compris « Indice P = … »), les taux, les pondérations, les critères diagnostiques (SRPNF, RLO), les valeurs de configuration (la « note retenue » d'un niveau d'échelle) et les axes des graphiques.

Tout ce qui n'est pas une note va à l'item #1137.

**À l'écran, les appels ajoutés** (comptés au diff, en plus des douze du matin) :

| Fichier | Appels |
|---|---|
| `profil-etudiant-sections-affichage.js` | 21 : la note du profil, le détail des productions, les calculs de moyenne, la note finale et son plafonnement, la note de session ; l'exception de la sentinelle B disparaît |
| `evaluation-calcul.js` | 1 : la note de l'écran d'évaluation |
| `liste-evaluations.js` | 2 : la moyenne de la Liste, et la colonne Note % |
| `evaluation-jetons.js` | 3 : les notes de la reprise et de l'originale dans les confirmations ; elles s'affichaient brutes, avec jusqu'à quatorze décimales |
| `impact-jetons.js` | 2 : la note avant et après une reprise |
| `pratique-pan-specifications.js` | 3 : la note d'un palier |

**Dans le PDF de l'élève** (`synthese-retroaction-rendu.js`) :
- toutes les notes passent par la fonction : la note de la copie, le niveau et la note de chaque production, le calcul de la moyenne, la phrase finale, le grand chiffre ;
- tous les autres nombres décimaux prennent la virgule, avec l'espace insécable devant « % » et « pts » : les points d'un critère analytique (« 22,5 / 30 »), le poids d'un critère, les pondérations des badges et de la portée incomplète, la ligne algorithmique (« 68,8 % ») et les contributions en points (« 44,5 pts + 28,4 pts = 72,9 % ») ;
- aucun mot ne change.

**Une aide neuve dans la Liste.** `arrondirNoteAffichee` part, et `_noteChiffreeAffichee` la remplace. Elle délègue à la fonction, et une valeur non numérique reste telle quelle (banc #562). Elle sort aussi du rendu de la ligne, dont la complexité était plafonnée par sa sentinelle.

**Une ligne morte retirée.** `logMoyenne` (`liste-evaluations.js`) était calculée et jamais lue.

## Ce qui ne change pas (point 5, remesuré)

Rien de ce qu'un logiciel relit ne change : CSV, xlsx, JSON, codex, archives, champs de saisie et valeurs stockées. Le `grep` ne trouve aucun `parseFloat` ni `parseInt` sur un `textContent` dans `js/`.

La seule relecture d'une note affichée est dans `evaluation-retroaction.js` : elle recopie `#noteProduction1` tel quel dans le texte collé dans Léa (« Note finale : 23 % | Niveau : I »). Ce texte est lu par l'élève, pas par un logiciel ; il prend donc la norme française, et c'est voulu.

Les specs WebKit qui citent « 57.5% » ne le font que dans des commentaires.

## Ce qui change à l'écran, au-delà de la virgule

- La note de l'écran d'évaluation perd son zéro final : « 80.0 % » devient « 80 % », par la convention de la fonction. C'est aussi ce que reçoit le texte collé dans Léa.
- Le profil affichait « 89.0% » à une décimale fixe. Il suit maintenant la même convention : « 89 % ».
- La note globale du profil (« … % (sur N artefacts) ») gardait l'entier. Elle passe par la fonction après `Math.round`, donc reste entière, comme avant.

## Ce que je vous demande de regarder

- **La phrase de la note finale du profil, à l'écran.** Elle se lit maintenant « 44.5 pts + 28.4 pts = 72,9 % ». La consigne garde les points de l'écran hors du lot, et le point 3, qui interdit de mêler deux normes dans une phrase, ne vise que le PDF. J'ai suivi la lettre. Cette phrase est la seule de l'écran à mêler deux normes ; elle est nommée dans #1137.
- **La ligne de partage ci-dessus.** C'est surtout le cas de l'« Indice P », une moyenne de notes appelée indice, que j'ai laissé avec les indices.

## Bancs

**Sentinelle** (`sentinelle-note-pourcentage-affichage.test.js`), 6 essais :
- le cas A passe à la norme française, et vérifie le caractère U+00A0 ;
- le cas B s'étend aux arrondis faits à la main sur une note ou une moyenne (`note…toFixed(n)`, `moyenne…toFixed(n)`, `Math.round(… * 10) / 10`, suivis de « % » ou de « ␣% »), sans exception ;
- les motifs sont éprouvés sur les formes d'hier, et sur ce qui n'est pas une note.

**Break-test** : la ligne 449 d'origine remise rougit B. Code restauré, vérifié par `cmp`.

**Les harnais.** `completerNoteParDefaut` (`tests/unit/_helpers/charger-script.js`) fournit le vrai module à tout harnais qui ne le donne pas, sur le modèle de `motsNature` : c'est l'ordre de chargement d'`index.html`. Il est appelé par `chargerScript`, par `bac-suivi.js` et par les deux copies locales de `chargerAvecInterne` (bancs 714 et audit des pratiques). Les ajouts faits à la main ce matin dans les bancs 562, 776 et 745 sont retirés, parce qu'ils sont redondants.

**Les attentes réécrites** : 16 bancs, environ 60 attentes. Chaque note y passe à « 84,7 % », sans zéro final ; chaque nombre du PDF prend la virgule et l'insécable. Le banc 714 ramène tout blanc à une espace avant de comparer : son attente garde donc une espace ordinaire, et c'est dit dans un commentaire.

**Ensemble** : Vitest complet vert, 795 fichiers, 9 366 essais. Les résultats WebKit sont à la section suivante.

## Vérifications WebKit

**Le PDF de l'élève, dans un vrai WebKit.** Le test porte sur une copie en points dont la note vaut 89,23679060665361.
- Le PDF affiche « Note de la copie : 89,2 % ».
- Le caractère avant « % » est U+00A0 (code 160), et le document ne contient aucun « Â ».
- J'ai rétréci la boîte de 400 px à 100 px : « 89,2 » et « % » restent toujours sur la même ligne.
- Le PDF passe par `html2canvas`, une rastérisation du DOM, et non par une police jsPDF : c'est pourquoi l'encodage ne peut pas produire de « Â ».

La spec de cette vérification était jetable, et je l'ai retirée. Sa capture est dans `captures-2026-10-21-note-norme-francaise/pdf-eleve-note-de-la-copie.png` : on y voit aussi « 22,5 / 30 ».

**Les specs qui lisent une note.** J'en ai lancé 90, soit 360 essais : 340 verts au premier passage. Les 20 rouges se répartissent ainsi :
- **14 attentes écrites à l'ancienne forme**, corrigées dans les specs (point 5), vertes au second passage :
  - les notes passent à « 84 % », « 69,5 % » ;
  - les specs qui ramènent tout blanc à une espace (`carte`, `txt`, `nettoyer`) gardent l'espace ordinaire, et un commentaire le dit ;
  - la spec 912 lit le PDF par `innerHTML`, que le navigateur sérialise en `&nbsp;` : son attente le dit aussi.
- **6 essais de `texte-troue-reperes-enonces` : hors de mon lot.** J'ai mesuré dans un worktree que la spec est verte à `c4b4b41f` (1.212.0) et à `2dca7240`, et **rouge à `6992bec4`** (#1134/#1131, ce matin). Elle compte trois zones de phrases en création et en trouve quatre. Ma lecture, probable mais non vérifiée : la spec est périmée depuis que #1131 donne des sous-critères à une grille en création. Je l'ai inscrite au BACKLOG sous **#1138** : **elle rendra le verdict de ce soir rouge** si personne ne la tranche avant.

Le jeu complet de ces specs n'a pas été relancé après les corrections ; seules les specs corrigées l'ont été.

**Les jetons anti-cache** des huit modules modifiés reçoivent une lettre neuve datée 1020. La sentinelle anti-cache est verte.

## Trouvailles

- **#1138** : la spec du texte troué, ci-dessus. Elle bloque le verdict ; c'est à trancher par Cowork.
- **#1137** : les pourcentages qui ne sont pas des notes, et les points à l'écran, inscrits en un seul item comme le demandait la consigne.
- **Un commentaire périmé** dans `evaluation-retroaction.js` (l. 272) dit encore « 0.0 % ». C'est sans conséquence : je le laisse et je l'oublie.

## Item « Nouvelles » proposé (non écrit ; fondu avec celui du lot 2 du matin)

« Les notes s'écrivent à la française, partout où elles s'affichent et dans le PDF de l'élève : “89,2 %”, une décimale au plus (plus de “89.23679060665361%”). »

## Le geste à vérifier à l'écran

Ouvre le PDF d'une copie déjà évaluée : la note s'y lit avec une virgule et une espace avant le signe, « 89,2 % », comme dans le profil de l'élève.
