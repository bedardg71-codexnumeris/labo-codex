# Consigne – la dissection, étape 3 : les mots de Grégoire

> Écrite par Cowork le dimanche 18 octobre 2026 à 09 h 57 (Toronto, mesuré par `date`). Plan : `PLAN-2026-10-18-la-dissection-pour-lundi.md`, étape 3. Grégoire a tranché les 50 textes provisoires de l'onglet sur sa page « Tes mots pour la dissection », à 9 h 56. **Tout texte non nommé ci-dessous est validé tel quel** : marque-le « validé G. 18 oct. » dans son commentaire, sans le changer.

## Les textes qui changent (exactement ces mots, apostrophes et guillemets typographiques)

Cowork a corrigé trois coquilles mécaniques dans les versions de Grégoire (« ensuit » → « ensuite », une apostrophe droite, les espaces insécables dans « Grilles de critères ») ; et, selon sa remarque (« pour l'instant, je garderais ton terme “morceau” »), « composante » redevient « morceau » en A1 et N1.

- **A1**, introduction de l'accueil : « Ton matériel existe déjà ? Tes grilles d’évaluation sont sans doute dans Word ou dans Pages : colle-les ici. Tu verras ta grille telle que tu l’as écrite, et c’est toi qui montres à l’application ce que chaque morceau signifie. »
- **A2**, étape 1 de l'accueil : « Ouvre ta grille dans son fichier d’origine (Word, Pages ou un autre traitement de texte), sélectionne le tableau entier – pas seulement le texte de ses cases (ou ses cellules), mais bien le tableau –, puis copie-le. Le texte copié d’un PDF est accepté aussi, mais il arrive sans ses cases : le fichier d’origine donne un meilleur résultat. »
- **A4**, étape 3 de l'accueil : titre « Étiquette, puis crée » ; texte « Avec la palette, tu identifies tes sections, tes critères, tes points ; l’application te montre ensuite la grille telle qu’elle la comprend. Clique sur « Créer ma grille » afin de la ranger dans « Grilles de critères ». »
- **A5**, texte d'exemple de la zone de collage : « Clique ici, puis colle (⌘ V) le tableau copié dans Word ou Pages, ou le texte d’un PDF. »
- **A6**, bouton sous la zone : « Étiqueter le texte ci-dessus ».
- **A7**, bandeau « En construction » : « Cet outil est en développement : certaines grilles pourraient mal s’y afficher. D’autres étapes viendront, dont les rétroactions. » (l'icône 🚧 reste).
- **D3**, troisième consigne de la dissection : « En bas, lis la grille que l’application en tirerait, puis crée-la. »
- **L3**, logique lue d'une grille en points : « L’application y lirait une grille en points : les points de chaque critère s’additionnent jusqu’à un total de ‹N›. Aucun niveau n’y est nommé (et l’application n’en inventerait pas). »
- **C6**, confirmation, carte « Ta grille », grille en points : « ‹N› critères, sur ‹T› points. »
- **E1**, l'exemple fictif : ses quatre critères commencent par « L’étudiant·e » au lieu de « L’élève » (« L’étudiant·e résume l’œuvre avec justesse », etc.). Ajuste les bancs qui citent ces textes (Cowork en compte 16 mentions dans les bancs de la dissection) ; aucune attente affaiblie.

**Gardé tel quel, par décision** : G1, le titre « Ce qui est attendu à chaque niveau » dans Grilles de critères ; C4, « Critère ‹N› » pour un critère sans nom.

## L'entrée des Nouvelles (N1)

Dans `js/changelog-data.js`, une entrée pour la prochaine version mineure (`1.204`, `couleur: 'vert'`), règles du skill `release-et-changelog`, titre et lignes exactement :

- Titre : « Apporter mon matériel »
1. « Tu colles ta grille, tu la vois telle que tu l’as écrite, et c’est toi qui poses une étiquette sur chaque morceau : critère, sous-critère, descripteur, points, niveau. L’application ne devine plus : elle lit tes étiquettes. »
2. « À chaque geste, elle montre la grille qu’elle en tirerait : ses critères, ses réponses, ses points ou ses niveaux, et les morceaux qui n’ont pas trouvé leur place. »
3. « Le bouton « Créer ma grille » la range dans « Grilles de critères ». Une grille en points garde ses réponses et leurs points, dans tes mots. »
4. « Une grille en niveaux te demande la plage et la note retenue de chaque niveau ; l’application n’en propose aucune. »
5. « Une grille qui a des points et des niveaux se note en points par défaut ; tu peux choisir les niveaux. »
6. « Dans « Grilles de critères », une grille en points s’affiche maintenant en points, et non plus en pourcentage. »
7. « Sur l’iPad, la palette reste à côté de ta grille, et tout se fait au doigt. »

L'entrée de la 1.203 reste telle quelle (historique). Pas de numéro de version écrit ailleurs : la release est l'étape 4.

## Ce qu'il ne faut pas

- Changer un texte non nommé ici, ou un texte de la palette.
- Le numéro de version, le verdict, le push : étape 4.

## Livrer

Un commit ; Vitest complet vert ; les specs `materiel-*` vertes dans WebKit ; `git grep` des anciens textes (A2 « Copié depuis un PDF », A6 « Reconnaître le texte ci-dessus », A7 « reconnaître toutes les grilles », E1 « L’élève » dans `js/` et les bancs) rend zéro ; un rapport court `plans de travail/RAPPORT-2026-10-18-dissection-3-mots.md`. Puis arrête-toi.
