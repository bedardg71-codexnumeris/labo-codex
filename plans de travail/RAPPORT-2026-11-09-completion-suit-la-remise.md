Codé, puis étendu aux quatre familles le 9 nov. (décision de Grégoire, 9 h 27 à 9 h 30) ; les trois questions sont tranchées

# Rapport : lot « La complétion suit la remise » (session D, nuit du 8 au 9 nov. 2026)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-completion-suit-la-remise.md` (sur `main`). Plan de la nuit :
`plans de travail/NUIT-2026-11-08-TRAVAIL-DANS-LE-CLOUD.md`, section « Session D ». Branche `lot/completion-suit-la-remise`,
partie de `origin/main` = `98c04bf` (1.237.2 en ligne). Non fusionnée, non publiée, rien au changelog. Écrit par Claude Code,
session dans le nuage : ni WebKit ni les données de Grégoire ici.

## En tête

### Ce qui est fait (en gestes d'utilisateur)

**Mis à jour le 9 nov., après tes décisions (section 11).** La règle vaut maintenant dans les quatre familles.

- Dans **les quatre familles** (sommative, standards, spécifications, dénotation), une copie que tu importes compte
  comme remise dès qu'elle est reçue (la nuit : en sommative seulement ; le 9 nov. : partout). Pendant une correction,
  les étudiant·es que tu n'as pas encore corrigé·es ne perdent plus de complétion. Mesuré dans l'application (Chromium) :
  douze élèves, douze copies importées, une seule évaluée. Avant : 1/1 pour l'évaluée, 0/1 pour les onze autres.
  Après : 1/1 pour les douze.
- Ton évaluation corrige la remise : une copie importée que tu enregistres « Non reçu », ou marquée plagiat ou IA non
  autorisée, n'est pas remise (qu'elle soit écartée ou mise à 0).
- Une copie papier, sans fichier, ne compte qu'une fois évaluée, comme avant.
- Les captures du Suivi suivent la même règle, dans les quatre familles, pour les captures à venir.
- Une seule exception, qui ne change pas de sens : une ancienne pratique « spécifications » absente de ta bibliothèque
  compte les travaux **acceptables**, pas les remises ; une copie reçue n'y est pas encore jugée (section 11.2).
- La démo ne bouge pas : Loyal Suricate reste à 80 % (8/10), et ses deux productions non remises restent
  « Artefact 3 » et « Artefact 4 ».

### Les questions, tranchées le 9 nov. (9 h 27 à 9 h 30, en Cowork)

- Question 1 : **étendue aux quatre familles** (Grégoire a lui-même constaté le défaut). Fait : section 11.
- Question 2 : **la phrase de l'étape 7 (et de l'étape 3) est corrigée par Grégoire** : « La complétion, elle, suit la
  remise : dès ta première évaluation, chaque production importée pour ce travail compte comme remise ; sans fichier,
  c'est ton évaluation qui confirme la remise. » Elle se pose dans le lot du troisième parcours.
- Question 3 : **laisser ainsi** (décision de Cowork) : une reprise sur une copie non recevable compte comme remise une
  fois évaluée.

Plus rien n'attend Grégoire dans ce lot. Les trois questions de la nuit, telles qu'elles étaient posées :

1. **Étendre la règle aux autres familles ?** Dans une pratique de ta bibliothèque, le calcul de C est le même code
   pour les quatre familles : le défaut que Cowork a mesuré (onze à 0 % après une première copie évaluée) existe donc
   aussi en standards, en spécifications et en dénotation. *Recommandation : étendre.* La règle porte sur la remise,
   pas sur la note ; le code est prêt (une ligne, `FAMILLES_OU_LA_RECEPTION_VAUT_REMISE`, et ses essais). Si ta propre
   pratique d'A2026 est une pratique par standards, rien ne change pour toi tant que la règle n'est pas étendue.
2. **La phrase validée de l'étape 7 du troisième parcours tient-elle ?** Elle dit : « une production importée compte
   comme remise à son échéance ». Dans le code, la bande C du Suivi › Groupe lit le C du jour (`indicesCP`,
   `js/tableau-bord-apercu.js:404`) : une production importée y compte dès qu'une première production de ce travail
   est évaluée dans le groupe, **pas à son échéance**. Seules les captures du Suivi (le graphique) comptent à
   l'échéance. Au moment de l'étape 7, ta première évaluation est faite : l'écran montre bien la production importée
   comme remise, mais pour une autre raison que celle que dit la phrase. Je ne la retouche pas (règle 6). *Proposition,
   à corriger :* « La complétion, elle, suit la remise : dès ta première évaluation d'une production, chaque production
   importée pour ce travail compte comme remise ; sans fichier, c'est ton évaluation qui confirme la remise. » L'étape 3
   dit aussi « À son échéance, ce que tes étudiant·es ont remis compte dans leur complétion » : même remarque. La
   session H porte ces textes ; je le signale ici parce que la règle vient de ce lot.
3. **Une reprise accordée sur une copie non recevable** (détail en section 10). *Recommandation : laisser ainsi.*

### Ce que je n'ai pas pu vérifier

- **WebKit** : absent du nuage. Essais Playwright sous Chromium seulement (sections 3 et 11).
- **Ton groupe d'A2026** : tes données sont sur le Mac. Un relevé en lecture seule est prêt (section 5).
- La suite Playwright entière : seules les 13 specs qui touchent la complétion ont tourné.

## 1. La mesure, avant tout code

### 1.1 Le constat de Cowork tient

Lu dans `98c04bf` :
- `evaluationCompteCommeRemise` (`js/pratiques/pratique-registre.js:1185`) passe par `evaluationEntreDansLaNote` (`:991`) :
  une copie n'est une remise que si elle a une note, est verrouillée, n'est ni « Incomplet » (qui, lui, compte comme
  remise), ni de portée nulle, ni non recevable, ni « Non reçu ».
- Le dénominateur de la sommative (`calculerDetailsCompletion`, `js/pratiques/pratique-sommative.js:292`, filtre à `:307`)
  réunit les productions non facultatives dont **au moins une copie du groupe** entre dans la note. La première copie
  évaluée et verrouillée y fait entrer sa production pour tout le monde.
- Effet : sur un groupe neuf de douze, après une première copie évaluée, les onze autres sont à 0/1, donc 0 %. Je
  le reproduis dans l'essai du lot (section 3), sans navigateur.

### 1.2 Ce qu'est une copie importée dans le code : un fichier, pas une évaluation

C'est le fait qui décide de la forme du correctif. Une copie importée est une fiche de la liste `fichiersTravaux`
(`js/travaux-stockage.js:337`, `ajouterFichierTravail`), rangée par élève (`etudiantDA`) et par production
(`productionId`). L'import ne crée **aucune** évaluation. Aucun calcul de complétion ne lit cette liste aujourd'hui :
ils ne lisent que `evaluationsSauvegardees`. Une copie mise à la corbeille sort de la liste (`deplacerEnCorbeilleLot`,
`:1061`) : elle n'y est plus.

### 1.3 Le dénominateur peut rester tel qu'il est

Il faut distinguer deux classes, parce qu'une pratique ne calcule pas toujours C au même endroit :
- une pratique **de ta bibliothèque** (créée par « Partir d'un modèle », par l'assistant, importée d'un collègue) est
  calculée par `PratiqueConfigurable` (`obtenirPratiqueParId`, `pratique-registre.js:631-636`), quelle que soit sa famille ;
- une pratique absente de la bibliothèque retombe sur l'instance codée en dur de sa famille (`PratiqueSommative`,
  `PratiquePANStandards`, `PratiquePanSpecifications`).

En sommative, les deux chemins ont le même dénominateur : la sommative codée en dur (`pratique-sommative.js:307`) et la
configurable (`pratique-configurable.js:630`, qui écarte en plus les productions diagnostiques). Une production y entre
à la première copie évaluée et verrouillée du groupe, et pas avant. C'est ce que Grégoire dit déjà réglé.

Avec la règle décidée, ce dénominateur reste juste sans y toucher :
- avant toute évaluation, la production n'y est pas : une copie importée ne rapporte rien, et personne ne perd rien ;
- dès la première copie évaluée, chaque copie importée de cette production compte comme remise ; seul·e un·e étudiant·e
  sans fichier et sans évaluation compte comme non remis·e, ce qui est la règle (« sans import, c'est l'évaluation seule
  qui confirme la remise ») ;
- le numérateur ne parcourt que les productions du dénominateur : une remise ne peut pas dépasser le total.

Je ne change donc pas le dénominateur.

### 1.4 Les autres familles : la même règle de remise, pas le même dénominateur

Ce qui compte comme remise est **la même règle** (`evaluationCompteCommeRemise`) dans :
- la sommative codée en dur (`pratique-sommative.js:332`) ;
- les standards codés en dur (`pratique-pan-standards.js:332`) ;
- **toute pratique de ta bibliothèque**, toutes familles confondues : sommative, standards, spécifications, dénotation
  (`pratique-configurable.js:652`). C'est le point à retenir : dans la configurable, le calcul de C est le même code pour
  les quatre familles. Le défaut constaté par Cowork (onze à 0 % après une première copie évaluée) y existe donc aussi
  en standards, en spécifications et en dénotation ;
- les deux calculs de C des captures du Suivi (`js/snapshots.js:268`, C de chaque étudiant·e ; `:774`, C du groupe),
  qui ne regardent pas la famille.

Deux exceptions :
- les standards codés en dur ont un autre dénominateur : les travaux **assignés avec une échéance**
  (`pratique-pan-standards.js:308`), qu'une copie soit évaluée ou non ;
- les spécifications codées en dur ne comptent pas des remises : C y est la part des travaux **acceptables** du palier le
  plus haut (`pratique-pan-specifications.js:397`). Une copie importée n'y a pas de sens avant d'être jugée.

Conséquence pour le code : la décision est appliquée **en sommative seulement**, comme la consigne le demande. Dans la
configurable, une condition sur la famille (`obtenirCode() === 'SOM'`) garde les trois autres familles telles qu'elles
sont. Rien n'oblige à étendre la règle pour que la sommative soit juste : les familles ne se mélangent dans aucun calcul
de C. Étendre ou non reste ta décision (question en tête du rapport final).

### 1.5 C n'entre dans aucune note

Cherché partout où C ou la complétion est lue :
- la note du cours (P) se calcule à part : `calculerNoteDuCours` (`js/portfolio.js:460`), à côté de C (`:457`), sans le lire ;
  `calculerDetailsNoteFinale` (`js/profil-etudiant-actions.js:452`) ne le lit pas non plus ;
- le « minimum de complétion » du portfolio (`minimumCompletion`) ne lit pas C : il compte les copies qui **entrent dans la
  note**. Il sert de seuil d'affichage de P (`js/etudiants.js:957`, `js/tableau-bord-apercu.js:1822`) et, en standards,
  de déficit pour le plafonnement de conformité (`profil-etudiant-actions.js:561`, `nombreEvalues` = copies qui entrent
  dans la note). Une copie importée et non évaluée n'y entre pas, avant comme après ;
- le type « completion » d'une évaluation d'un modèle prédéfini (`pratiques-predefines.js:655`) est un type de
  production, pas l'indice C.

C sert au dépistage (risque, niveau de RàI, carte Complétion du profil, rapport), pas à une note. Les notes d'A2025 et
d'H2026 ne sont pas touchées.

### 1.6 Le stock

Les captures du Suivi déjà enregistrées gardent l'ancienne valeur de C. Rien n'est recalculé d'office. « Recalculer
les captures » (Réglages) les recalculerait avec la nouvelle règle. Les indices du jour (`indicesCP`) se recalculent
au prochain calcul, comme toujours.

### 1.7 La démo

Le pack démo (`js/pack-demo-10.js`) ne contient **aucune** copie importée (aucune entrée `fichiersTravaux`), et sa pratique
est « standards ». Ses chiffres ne peuvent pas bouger. Mesuré dans Chromium, avant (`98c04bf`) et après (`7b2f87ac`) : les dix élèves
identiques, à la virgule près. Pratique résolue : `demo-std-litt` (STD, une configurable), aucune fiche
`fichiersTravaux`. Loyal Suricate : C = 80, 8/10, non remises « Artefact 3 » et « Artefact 4 ». « Découvrir » parle des
mêmes deux productions.

### 1.8 Ton groupe d'A2026

À mesurer sur le Mac, en lecture seule. Ce qui décide : le nombre de copies importées qui ne sont pas encore évaluées.
Depuis le 9 nov., la famille ne décide plus (les quatre suivent la règle), sauf une ancienne pratique « spécifications »
absente de ta bibliothèque (section 11.2).

## 2. La décision de coder

Les trois conditions du plan de la nuit tiennent :
- **le dénominateur peut rester tel qu'il est** (1.3) ;
- **la règle n'a pas à s'étendre aux autres familles pour être juste en sommative** (1.4) : aucun calcul de C ne mêle
  deux familles ; une condition sur la famille suffit ;
- **la complétion n'entre dans aucune note** (1.5).

D'où « Codé » en première ligne : la session H peut faire le troisième parcours sur cette branche.

## 3. Ce qui est fait

Commit `7b2f87ac`, branche `lot/completion-suit-la-remise`.

**Une règle, à un seul endroit** (`js/pratiques/pratique-registre.js`, après `evaluationCompteCommeRemise`) :
- `receptionVautRemise(pratique)` : vrai en sommative seulement (`FAMILLES_OU_LA_RECEPTION_VAUT_REMISE = ['SOM']`) ;
- `lireCopiesRecues(fichiers)` : une clé « élève | production » par fiche de `fichiersTravaux` rattachée à une production ;
  une fiche orpheline ne compte pas ; une fiche à la corbeille n'est plus dans la liste ;
- `evaluationCorrigeLaReception(e)` : une évaluation **enregistrée** (verrouillée), pas une originale remplacée, non
  remise ou non recevable. Le statut suffit : ce que la copie vaut dans la note n'y entre pas (écartée ou mise à 0) ;
- `productionRemiseParEleve(da, production, évaluations, copiesRecues)` : une copie qui compte comme remise (la règle
  d'avant, inchangée), **ou** une copie reçue que rien ne corrige.

**Les quatre calculs qui la lisent** :
- la sommative codée en dur (`pratique-sommative.js`, `calculerDetailsCompletion`, et un lecteur `_lireFichiersRecus`) ;
- la configurable (`pratique-configurable.js`), qui ne lit les copies reçues que si sa famille est la sommative ;
- les captures du Suivi (`snapshots.js`) : le C de chaque élève (la pratique active est maintenant résolue avant C, et
  sert aussi à P comme avant) et le C du groupe (`_ajouterRemisesParReception`, une fonction à part pour que
  `capturerSnapshotSeance` reste sous le cliquet de complexité).

Les standards codés en dur et les spécifications codées en dur ne sont pas touchés.

**Hypothèses que j'ai prises seul (à corriger en dix secondes si elles sont fausses)** :
- un **brouillon** marqué plagiat ne corrige pas la réception : « un brouillon ne compte nulle part » (ta décision du
  16 sept.). La copie redevient non remise quand tu verrouilles ;
- une copie importée compte **sans date** : elle compte dès que sa production est au dénominateur, comme une évaluation
  aujourd'hui ; dans les captures, dès l'échéance (le C historique compte déjà ainsi les remises en retard).

**Les jetons anti-cache** des quatre scripts sont posés dans `index.html` (exigés par le crochet du commit). Les autres
sessions de la nuit en poseront aussi : conflits attendus à la fusion, sans enjeu (prendre le jeton le plus récent).

### Les essais

- **Neuf** : `tests/unit/sentinelle-completion-suit-la-remise-2026-11-08.test.js`, 17 essais. Le cas de la consigne
  (une production, trois copies importées, une seule évaluée et verrouillée : les deux autres remises ; une copie papier
  ni importée ni évaluée : pas remise), dans la sommative codée en dur et dans la configurable sommative ; le
  dénominateur inchangé ; la correction par l'évaluation ; une configurable par standards inchangée ; les deux C des
  captures. **Rouge avant le correctif** (3 essais : Bruno à 0/1 au lieu de 1/1). Six break-tests, chacun rouge,
  listés en tête du fichier.
- **Trois sentinelles de texte** suivent le passage par la règle par production, sans perdre leur intention (le calcul
  lit la règle unique du registre, qui lit toujours `evaluationCompteCommeRemise`) :
  `audit-onglet-suivi-2026-09-05` (B4), `sentinelle-audit-aide-15-oct-ce-que-fait-l-application`,
  `sentinelle-lot-A-737-741-718-738-les-memes-copies-partout` (D3). Les valeurs mesurées de B4 ne bougent pas.
- **Une spec Playwright** change d'attente : `statut-incomplet-travail-en-cours.spec.js`, « 1/2 » devient « 2/2 » avant de
  cocher « Incomplet » (la copie importée d'Alpha, sommative, compte dès sa réception). C'est la règle décidée.
- **Vitest** (depuis `tests/`) : 893 fichiers, 10 842 essais, tous verts.
- **Playwright, Chromium** : les 13 specs qui touchent la complétion (`assiduite-lot-D-date-arrivee-et-inconnu`,
  `audit-pratiques-notation-parcours-2026-09-16`, `construction-de-la-note-correctifs-28-oct`, `copie-non-recevable-note-28-oct`,
  `golden-master-procedural-L2-0`, `lot-n4-spe-note-absente-cause`, `profil-745-eleve-exclu`, `profil-871-completion-fraction`,
  `profil-922-completion-sommative`, `registre-longitudinal-915`, `standards-sans-portfolio-lot-2`,
  `statut-incomplet-travail-en-cours`, `suivi-830-barre-a-sans-periodes`) : 32 verts sur 33 après l'attente ajustée. Le rouge restant, `registre-longitudinal-915` R5 (une tuile décalée à 768 px),
  **est rouge aussi sur `main` sans ce lot**, sous Chromium : un écart de mise en page entre navigateurs, sans rapport.
  À juger sous WebKit au Mac.

## 4. La démo, avant et après

Voir 1.7 : identique. Aucun chiffre de « Découvrir » ne change.

## 5. Ton groupe d'A2026, en lecture seule (à faire sur le Mac)

Ce qui décide : la famille de la pratique appliquée au groupe, et les copies importées pas encore évaluées. Pour le
mesurer sans rien écrire, dans la console de l'application, groupe d'A2026 ouvert, sur la branche de ce lot (des DA,
aucun nom) :

```js
(() => {
  const p = resoudrePratiqueActive().pratique, evs = obtenirDonneesSelonMode('evaluationsSauvegardees');
  return { famille: p.obtenirCode(), lignes: obtenirDonneesSelonMode('groupeEtudiants').map(e => {
    const d = obtenirDetailsCompletion(e.da);
    if (!d || !d.productions) return [e.da, null];
    const avant = d.productions.filter(x => evs.some(v => v.etudiantDA === e.da && v.productionId === x.id
      && evaluationCompteCommeRemise(v, evs))).length;
    return [e.da, avant + '/' + d.total, d.remis + '/' + d.total];
  }).filter(l => l[1] && l[1] !== l[2]) };
})()
```

Il rend la famille, puis seulement les élèves dont la fraction change (avant, après). Depuis le 9 nov., il vaut pour les
quatre familles ; une liste vide veut dire qu'aucune copie importée n'attend d'évaluation.

## 6. Le stock

Source seulement : rien n'est écrit dans tes données. Le C du jour se recalcule au prochain calcul. Les captures déjà
enregistrées gardent l'ancienne valeur de C ; « Recalculer les captures » les recalculerait avec la nouvelle règle (y
compris dans un trimestre archivé qu'on rouvrirait : C n'est pas une note, mais je le dis).

## 7. Limites connues

- **Une reprise accordée sur une copie non recevable** : tant que la reprise n'est pas évaluée, l'originale verrouillée
  « plagiat » reste active et corrige la réception, même si l'élève a déjà remis sa reprise par import. L'élève reste
  non remis jusqu'à la réévaluation, comme avant ce lot. Cas rare ; je recommande de le laisser ainsi.
- Les spécifications **codées en dur** ne comptent pas des remises mais des travaux acceptables : la règle n'y aurait
  pas de sens. Seules les spécifications d'une pratique de ta bibliothèque passent par le calcul commun.

## 8. À inscrire au BACKLOG

Rien de neuf trouvé dans le code du lot. Une trouvaille relayée, **non vérifiée par moi** : l'audit de début de session
rapporte que la vérification GitHub de la release 1.237.2 (run `42534632439`, commit `54a87bca`) est rouge à l'étape
Playwright, quatre specs neuves rouges sous WebKit Linux (`aide-cp-suit-la-case-1086`,
`annotation-formes-fermees-polygone`, `palette-evaluation-compacte`, `tampons-masques-bibliotheque-1216`), alors que le
Mac disait 1 420/1 420. Issue proposée : inscrire et continuer.

## 9. Relecture par un agent neuf

Un sous-agent qui n'avait vu ni mon raisonnement ni ce rapport a reçu la consigne et le diff `7b2f87ac`. Verdict, en une
ligne : **« Bon avec réserves »** (le diff fait ce que Grégoire a décrit ; quatre réserves). Il a fait quatre break-tests
lui-même ; trois rougissaient l'essai, le quatrième (la garde du remplacement) non.

Ce que chaque réserve est devenue :
- **La garde du remplacement sans essai** : c'était mon code, donc fini maintenant. Un essai neuf (un doublon réconcilié
  « plagiat » ne corrige pas la réception) ; son break-test rougit (commit suivant `603e24ca`).
- **La condition `corbeille` testait un état qu'aucun code n'écrit** : retirée (la corbeille retire la fiche de la
  liste) ; l'essai de la fiche orpheline garde un témoin.
- **Le C mis en cache n'est pas recalculé à l'import** : vérifié, sans conséquence à l'ouverture d'un écran. Le profil
  recalcule A, C et P avant de s'afficher (`profil-etudiant-sections-affichage.js:2462`), le tableau de bord aussi
  (`tableau-bord-apercu.js:1388`, par la chaîne de l'assiduité), la liste à chaque rendu (`indices.js:350`). Un écran
  déjà ouvert ne se redessine pas tout seul après un import, comme pour tout autre changement. Aucune suite.
- **L'essai Playwright du statut « Incomplet » ne prouve plus que ce statut compte comme remise** (2/2 avant comme après,
  parce que la copie du banc est importée). Vrai. Les essais Vitest le prouvent encore, sans fichier
  (`tests/unit/statut-incomplet-travail-en-cours.test.js`, « les trois familles qui comptent des productions »). Je ne
  refais pas le banc Playwright cette nuit : il passe par l'ouverture d'un fichier importé.
- **Le cas de la reprise accordée sur une copie non recevable** : l'agent le range parmi les questions de pédagogie.
  Je l'ajoute aux questions (section 10).

Deux remarques de plus, sans suite de code :
- **Une copie en retard** : une évaluation enregistrée « Non reçu » à l'échéance continue de corriger une copie importée
  plus tard, jusqu'à ce que tu évalues cette copie (la date d'import n'est pas comparée à celle de l'évaluation). Ton
  dernier geste fait foi ; je recommande de laisser ainsi.
- **Le coût** : en sommative, « Recalculer les captures » relit la liste des copies importées pour chaque élève et chaque
  séance. Mesuré par l'agent : environ 0,5 ms par lecture (300 fiches) sous Node, soit environ une demi-seconde pour 900
  appels. Non mesuré sur l'iPad. Le C du jour, lui, lit en mémoire pour tout le groupe. Rien hors de la sommative.

## 10. Une question de plus pour Grégoire

3. **Une reprise accordée sur une copie non recevable, remise par import** : l'élève reste « non remis » jusqu'à ce que
   tu évalues sa reprise, parce que l'originale « plagiat » reste active d'ici là. C'était déjà le cas avant ce lot.
   *Recommandation : laisser ainsi* (cas rare ; la reprise évaluée remplace l'originale et l'élève redevient remis).

## 11. L'extension aux quatre familles (9 nov. 2026)

Décisions de Grégoire du 9 nov. (9 h 27 à 9 h 30, en Cowork), relayées à une session dans le nuage (ni WebKit ni tes
données) : `FAMILLES_OU_LA_RECEPTION_VAUT_REMISE` couvre la sommative, les standards, les spécifications et la
dénotation, dans la pratique configurable et dans les captures du Suivi. Pour les instances codées en dur : mesurer ce
que l'extension y changerait, le dire, et ne pas changer leur sens sans le dire.

### 11.1 Ce qui change (en gestes)

- **Une pratique de ta bibliothèque, quelle que soit sa famille** (tout ce qui naît de « Partir d'un modèle », de
  l'assistant ou d'un partage) : dès ta première évaluation d'une production, chaque copie importée pour cette
  production compte comme remise ; « Non reçu », plagiat ou IA la corrigent ; sans fichier, ton évaluation confirme.
  C'est exactement la règle de la sommative, dans les trois autres familles.
- **Les captures du Suivi** (le graphique) : la même règle, dans les quatre familles, pour les captures à venir.
- **Sans pratique appliquée au groupe**, les captures gardent la règle d'avant (hypothèse prise seul : la règle se lit
  dans la famille de la pratique ; sans pratique, il n'y en a pas). Sans effet sur le troisième parcours : la pratique y
  est appliquée à l'étape 6, avant que l'étape 7 montre la bande.

Code : `pratique-registre.js` (la liste des familles), `pratique-pan-standards.js` (11.2), les commentaires de
`pratique-configurable.js` et de `snapshots.js` (rien d'autre n'y change : ils lisaient déjà la liste), quatre jetons
anti-cache dans `index.html`.

### 11.2 Les instances codées en dur, mesurées

Elles ne servent que lorsqu'une pratique n'est pas dans ta bibliothèque : une ancienne configuration dont l'identifiant
(`pan-standards`, `pan-specifications`, `sommative`) ne trouve aucune fiche (`obtenirPratiqueParId`,
`pratique-registre.js`). Tout ce que tu crées aujourd'hui est une configurable. La sommative codée en dur suivait déjà
la règle depuis la nuit.

- **Les standards codés en dur** (`pratique-pan-standards.js`, `calculerDetailsCompletion`). Leur dénominateur est
  autre : les travaux **assignés avec une échéance**, évalués ou non, et quelle que soit l'échéance (passée ou à venir).
  Mesuré par les essais : avant l'extension, Bruno et Chloé (copies importées, pas encore évaluées) étaient à 0/1 ; après,
  1/1 ; Dario (papier, pas évalué) reste à 0/1 ; marqué plagiat, Bruno retombe à 0/1. **Ce que ça change de plus
  qu'ailleurs** : le travail étant au dénominateur avant toute évaluation, la copie importée y compte dès sa réception,
  sans attendre une première évaluation du groupe. **Le sens de C ne change pas** (des remises sur des travaux
  assignés) ; seul ce qui compte comme remise suit ta règle. **Étendu**, pour que ce qui compte comme une remise soit le
  même dans une pratique par standards, qu'elle soit dans ta bibliothèque ou non (ce qui forme le dénominateur, lui,
  reste différent, comme avant : avant toute évaluation d'un travail, la configurable ne calcule rien, les standards
  codés en dur comptent déjà).
- **Les spécifications codées en dur** (`pratique-pan-specifications.js`). Leur C n'est pas une part de remises : c'est
  la part des travaux **acceptables** du palier le plus haut, comptés sur les évaluations de l'élève. Une copie importée
  n'y est ni acceptable ni non acceptable tant qu'elle n'est pas jugée : y étendre la règle changerait le sens de C
  (d'« acceptables » à « remis »). **Non étendu** ; un essai le garde (Bruno, un travail non acceptable et deux copies
  importées, reste à 0/2 ; renforcé après la relecture, 11.6). Les
  captures du Suivi, elles, comptent des remises dans toutes les familles (déjà avant ce lot) : avec une telle pratique,
  le graphique suit ta règle, et la carte Complétion du profil continue de compter des travaux acceptables.

### 11.3 Les essais

- La sentinelle du lot (`tests/unit/sentinelle-completion-suit-la-remise-2026-11-08.test.js`) passe de 17 à **35
  essais** : le cas de la consigne dans la sommative codée en dur et dans la configurable de **chacune des quatre
  familles** (Bruno et Chloé importés remis, Dario sur papier non remis, le témoin sans fichiers, le dénominateur, la
  correction par l'évaluation) ; les standards codés en dur (trois essais) ; les spécifications codées en dur, inchangées
  (un essai) ; les deux C des captures dans les trois autres familles et sans pratique.
- **Rouges avant le correctif des standards codés en dur** : 2 (Bruno à 0/1 au lieu de 1/1, avec et sans évaluation).
- **Break-tests**, chacun rouge puis rétabli : chacun des trois codes retiré de la liste, un à la fois (STD : 6 rouges ;
  SPE : 4 ; DEN : 4) ; les standards codés en dur sans les copies reçues (2) ; la garde « sans pratique » retirée (3).
- Deux sentinelles de texte suivent le site des standards (il passe par la règle par production) :
  `sentinelle-audit-aide-15-oct-ce-que-fait-l-application`, `sentinelle-lot-A-737-741-718-738-les-memes-copies-partout`
  (D3). Leur intention ne change pas : le calcul lit toujours `evaluationCompteCommeRemise` par la règle du registre.
- **Vitest** (depuis `tests/`) : 893 fichiers, 10 860 essais. **Correction après la relecture** : à `54223bb3`, un
  rouge, la sentinelle anti-cache (j'avais posé des jetons du 9 nov. ; le build de la branche est du 8, et
  `release.mjs` est exclu cette nuit). Réparé par `dd4fe697` (jetons du 8, lettres jamais servies), vu rouge par le
  crochet de push avant : **10 860 sur 10 860** à `dd4fe697`, push accepté par le crochet.
- **Playwright, Chromium**, les 13 specs qui touchent la complétion (liste en section 3) : **32 verts sur 33**. Le rouge,
  `registre-longitudinal-915` R5 (une tuile à 768 px), est le même que la nuit, rouge aussi sur `main` : sans rapport.
- **La démo ne bouge pas** : son pack ne contient aucune copie importée (`fichiersTravaux` absent de
  `js/pack-demo-10.js`), et sa pratique (`demo-std-litt`, standards, configurable) compte comme avant. Loyal Suricate
  reste à 80 % (8/10). Inférence tirée du code et de la mesure de la nuit, pas remesurée dans le navigateur.

### 11.4 Le stock

Comme en section 6 : la source seulement. Rien n'est écrit dans tes données. Le C du jour se recalcule au prochain
calcul, dans les quatre familles ; les captures déjà enregistrées gardent leur C jusqu'à « Recalculer les captures ».

### 11.5 Le coût

« Recalculer les captures » relit la liste des copies importées pour chaque élève et chaque séance : depuis le 9 nov.,
dans les quatre familles (la nuit : en sommative seulement), donc aussi pour une pratique par standards. La mesure de la
nuit (section 9 : environ 0,5 ms par lecture de 300 fiches sous Node, une demi-seconde pour 900 appels) vaut donc
maintenant pour toutes les familles. **Non mesuré sur l'iPad** : à mesurer sur le Mac, avec ton groupe, au prochain
« Recalculer les captures ». Le C du jour, lui, lit la liste une fois par élève.

### 11.6 Relecture par un agent neuf

Un sous-agent qui n'avait vu ni mon raisonnement ni ce rapport a reçu la décision et le diff `358052c..54223bb3`.
Verdict, en une ligne : **« Bon avec réserves »** (le diff applique la décision ; aucun site de C oublié : six calculs
relevés, dont les spécifications codées en dur, exclues exprès ; les deux C de `liste-evaluations.js` ne sont lus par
personne). Il a fait quatre break-tests : trois rouges, comme annoncé ; le quatrième vert (réserve 2).

Ce que chaque réserve est devenue (toutes portaient sur mon propre lot : finies, pas inscrites) :
1. **« 10 860 tous verts » faux à `54223bb3`** (la sentinelle anti-cache) : vrai ; réparé par `dd4fe697`, la phrase de
   11.3 est corrigée.
2. **L'essai des spécifications codées en dur ne gardait que par le texte** (sans évaluation, le calcul rendait null
   avant toute lecture) : vrai. L'essai prend maintenant un travail non acceptable et deux copies importées (0/2), avec
   son témoin (1/2) ; le break-test de l'agent (les copies comptées comme acceptables sous un nom de clé déguisé) le
   rougit.
3. **Deux commentaires disaient autre chose que le code** : celui du registre (« PAS les spécifications codées en dur »,
   alors que les captures leur appliquent la règle) et `snapshots.js` (« en sommative ») : réécrits.
4. **Le coût de « Recalculer les captures » n'était plus revu** : 11.5.
5. **Le motif de 11.2 en disait trop** (« dise la même chose ») : réécrit ; le dénominateur reste différent.

Hors lot, vu par l'agent, issue 3 (commenter et oublier, sans effet observable) : `fichiersTravaux` n'est pas une clé
que le Comparateur simule ; sur un corpus fictif, il lirait les vraies copies importées, mais ses DA fictifs ne
correspondent jamais à un vrai.
