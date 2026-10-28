# Demande de relecture – La retouche de « Une copie non recevable vaut ce que la règle dit » (#1175, 28 octobre 2026)

> Écrite par Claude Code le mercredi 28 octobre 2026, sur `main`. Verdict : `VERDICT-RELECTURE-2026-10-28-copie-non-recevable-note.md` (Cowork, 6 h 44 ; décisions de Grégoire de 6 h 46 et 6 h 49). Code : `045bccb2`. Pas de release, pas de verdict Playwright complet, pas de push.

## En bref

- **Le libellé vit dans le registre**, à côté de la règle : `LIBELLES_COPIE_NON_RECEVABLE` et `libelleCopieNonRecevable` (`js/pratiques/pratique-registre.js:949, 958`). Ce sont les libellés du menu, à la casse de l'écran : « Non recevable (Plagiat) » et « Non recevable (IA non autorisée) ». Le formulaire, le PDF et l'aperçu de révision les lisent tous là.
- **Le PDF** construit une *vue* de la copie, sans note ni niveaux. Il ne l'écrit jamais. La rétroaction écrite reste, et retirer le statut fait tout revenir.
- **Le formulaire** pose une classe sur le panneau, comme le statut incomplet. La note et le niveau restent écrits dans leurs `span` : ils sont seulement masqués. La raison : la sauvegarde relit `niveauProduction1`, et y écrire le libellé l'aurait enregistré comme `niveauFinal`.
- **L'avis de l'écran et la ligne de l'Aide** sont repris mot pour mot. #1176 reçoit les six sites du dépistage, plus un septième mesuré en chemin (§ 4).

## 1. L'affichage (décision 1)

| Où | Avant | Après | Preuve au code |
|---|---|---|---|
| Formulaire, encadré de la note | « 87,5 % », « M », couleur du niveau | « Non recevable (Plagiat) ». La note, le niveau, la portée et la ligne de la note remise sont masqués, et l'encadré n'a pas de couleur. | `evaluation-sauvegarde.js:593` (`afficherCopieNonRecevable`), `:638` ; `index.html:8559` ; `styles.css:26441` ; `evaluation-calcul.js` (`_niveauColorable`) |
| PDF, bandeau « Niveau général » | « M · Maîtrisé » | « Non recevable (Plagiat) », dans la forme neutre du bloc d'une copie en points | `synthese-retroaction-data.js:653` ; `synthese-retroaction-rendu.js:480` |
| PDF, rangée de chaque critère | les cases I D M E, avec la case atteinte | aucune case, aucun point, aucune tranche, aucun calcul algorithmique. **Le commentaire reste**, ainsi que le nom et le poids du critère. | `synthese-retroaction-data.js:152` ; `synthese-retroaction-rendu.js:328, 379` |
| PDF, barre du trimestre | la case de la copie porte « M » | son numéro, sans niveau, et cela vaut aussi sur le PDF d'une **autre** copie de l'élève | `synthese-retroaction-data.js:362` |
| PDF, bilan de la copie | force, critères à travailler, progrès, tous lus sur E et M | rien n'est nommé : le bilan est lu sur la vue sans niveaux | `synthese-retroaction-data.js:119` |
| PDF, hybride, obligatoire non recevable | « Dissertation (M, 87,5 %) » | « Dissertation (Non recevable (Plagiat)) », sans note. Le calcul du rendu la compte comme une obligatoire non remise : 0 en notes finales, hors du calcul avant, ce que dit la règle. | `synthese-retroaction-data.js:1486` |
| Aperçu de révision avant export (enseignant·e) | « Note : 87,5 % », « Niveau : M » | « Note : Non recevable (Plagiat) », c'est-à-dire ce que dira le PDF. Les lignes des critères gardent l'évaluation. | `travaux-export-pdf.js` (`_lignesNoteApercu`) |

Deux points sur ce qui change et ne change pas :

- **Sommative, rangée « Note provisoire » du bilan.** La copie y figure avec la valeur de la règle, « Dissertation fictive (0 %) ». C'est la note du cours, que le verdict a acceptée, et non la note de la copie : je n'y ai rien changé.
- **Source et stock.** Le changement se lit au rendu, sur le statut. Les copies déjà marquées suivent sans qu'on écrive quoi que ce soit, et aucun PDF déjà remis n'est touché.

## 2. L'avis et l'Aide (décisions 2 et 3)

- **L'avis** (`evaluation-sauvegarde.js:576`, `AVIS_COPIE_NON_RECEVABLE`) est repris mot pour mot. La forme ne change pas : le titre en gras, un saut de ligne, puis le paragraphe ; la phrase du jeton n'apparaît que pour le plagiat. Les insécables sont posées dans les guillemets et devant le deux-points, comme dans la ligne voisine de l'Aide. L'avis est maintenant **réécrit à chaque changement de statut**. Avant, il n'était créé qu'une fois : en passant de « Plagiat » à « IA », la phrase du jeton restait.
- **La ligne de l'Aide** (`index.html:10726`) est reprise mot pour mot. Les quatre lignes par famille et le « 7/9 » ne bougent pas : les sentinelles de l'audit du 15 oct. et du lot 2c sont vertes.

## 3. Les tests

- **Nouvelle sentinelle** `tests/unit/sentinelle-copie-non-recevable-affichage-28-oct.test.js`, 13 essais :
  - le PDF réel (modules de données et de rendu), en « Plagiat » et en « IA » : ni 87,5, ni case de niveau, ni nom de niveau ; les deux commentaires restent ;
  - la forme du feedback, dont un bilan sans niveaux, avec un témoin recevable ;
  - **retirer le statut** rend le bandeau M et les cases E et M ;
  - aucune écriture au rendu : `db` est espionné et la copie comparée à l'identique ;
  - le PDF d'une autre copie, et le cas hybride, chacun avec son témoin ;
  - le registre et les libellés du menu ;
  - le formulaire réel (panneau tiré de `index.html`, module réel, jsdom) : classe, libellé, avis mot pour mot, passage de « Plagiat » à « IA », retour à recevable, et « Soupçon à vérifier » qui n'est pas non recevable ;
  - le CSS, l'aperçu de révision et la ligne de l'Aide.
- **Break-test : 17 mutations, 17 rouges**, arbre restauré et contrôlé par sha256. Au premier passage, la mutation « bilan lu sur la copie entière » survivait : le banc n'avait pas d'échelle avec repères, donc ni force ni critère à travailler ne s'y lisaient. J'ai ajouté les repères et un témoin recevable, puis rejoué : tout est rouge.
- **Spec WebKit du lot** (`copie-non-recevable-note-28-oct.spec.js`, ↻), étendue :
  - sur le formulaire, la note et le niveau sont invisibles et le libellé visible ;
  - le texte du PDF rendu contient le libellé, sans 87,5 ni « Niveau général · » ;
  - la base reste identique.
  - Break-test : deux mutations (la règle CSS, le libellé du PDF), deux rouges, fichiers restaurés.
- **Sentinelles des autres lots, ajustées pour suivre ce lot** :
  - l'ancienne ligne de l'Aide dans la sentinelle de #1175 (↻) ;
  - la forme de la légende dans la sentinelle du lot 3 (↻) ;
  - la complexité : `calculerNote` passait à 31. La garde de couleur est extraite dans `_niveauColorable`, ce qui la ramène sous 31. `afficherRevisionExport` passait de 34 à 36 : ses lignes de note sont extraites dans `_lignesNoteApercu`, elle passe sous 31 et sort de la liste figée ;
  - les jetons anti-cache de sept fichiers, au jour du build (`20261027…`), tous différents de la release.
- **Vitest** depuis `tests/` : **839 fichiers, 10 038 essais, verts**.
- **Playwright ciblé** (WebKit) : la spec du lot, les deux de #959, le lot C (verrouiller), #1173 et #912 (synthèse sans copie), soit **46 verts et 1 ignoré**. **La suite complète n'a pas tourné** : il n'y a pas de verdict sur HEAD.

## 4. Trouvailles

- **Inscrit à #1176**, à la demande du verdict, avec les six sites du dépistage : un septième site de même nature. Le bilan d'une copie **postérieure** (PDF et écran, `historiqueAnterieur`) lit encore les niveaux d'une copie non recevable antérieure, dans « Points récurrents » et « Progrès : M → E ». Ce qu'une copie non recevable dit des besoins de l'élève est la question de #1176 : je n'y ai pas touché.
- **La Liste des évaluations montre le niveau** d'une copie non recevable : la colonne du niveau dit « M », à côté de la pastille, du « 0 » et de la note « -- » (mesuré dans WebKit, journal de la spec). Le verdict dit que la Liste « le fait déjà » ; c'est vrai pour la note, pas pour le niveau. Aucun symptôme vécu, donc **non inscrit** (règle du 24 août). À Cowork d'en disposer.

## Pour Grégoire

1. **Une supposition, à corriger en dix secondes si elle est fausse.** Sur le formulaire, **les menus des critères gardent E et M, visibles** : c'est ton évaluation, gardée, et tu peux encore la modifier. Seuls l'encadré de la note et son niveau cèdent leur place au libellé. Sur le PDF, en revanche, aucun niveau ne paraît. Si tu voulais aussi masquer les menus sur l'écran, il suffit de deux lignes de CSS, sur le modèle du statut incomplet.
