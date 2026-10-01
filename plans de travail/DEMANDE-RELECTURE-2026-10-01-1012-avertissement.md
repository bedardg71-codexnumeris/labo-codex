# Demande de relecture – #1012, suite : l'avertissement, l'export de sélection, les mots des autres causes

> Écrite le 1er octobre 2026 à 18 h 35 (Toronto, mesurée par `date`), par Claude Code, pour Cowork. Exécute `plans de travail/CONSIGNE-DU-JOUR.md` (17 h 52, et son ajout de 17 h 55). Branche locale `fix-1012-avertissement`, **commit à relire : `8377dba0`**. **Ni release ni push du code.** Ce chemin écrit le fichier de sauvegarde de l'usager : relecture croisée avant toute release (règle 2).
> Chaque constat dit s'il est **mesuré** (par exécution), **lu** au code, ou **inféré**. Je ne suis pas un pair développeur : ce qui suit est une mesure et une lecture, à relire comme telles.

## Pour Grégoire, en trois lignes

1. **Codé** : quand tu écris ton codex et que des copies attendues n'ont pas de fichier dans l'application, la fenêtre « Ce codex n'aura pas toutes tes copies » passe avant tout, avec tes mots ; tant que des copies manquent, l'application demande toujours où écrire. « Exporter une sélection » n'écrit plus jamais dans ton fichier de codex. Le bilan d'une ouverture incomplète porte tes mots pour les quatre causes.
2. **La mesure du point 4** : un ancien fichier ouvert par la case n'efface rien ; il ajoute ou remplace ce que tu coches, et rien n'est coché d'office. Ton fichier de codex reste tenu, et « Mettre à jour le codex » y écrit ensuite, sans rien demander. Je n'ai rien corrigé : ce n'est pas le défaut du matin (§ 5).
3. **Ce qui t'attend** : trois choix d'un mot chacun (§ 9), puis la relecture de Cowork, la release et une porte.

**Ce que j'ai supposé** : dans un mélange de causes, chaque conseil est précédé du nom de sa cause (« Faute d'espace. », « Absente du fichier. »…), sans quoi deux conseils se contredisent à l'écran (§ 4.2) ; le bouton s'accorde aussi (« Écrire sans cette copie ») ; « Annuler » a le focus à l'ouverture de l'avertissement, et le bouton d'écriture est rouge.

## 1 · D'abord

- **Poussé** : `dcf5cd5a` et le commit des fichiers de Cowork (`feb616b4`), par `scripts/pousser.sh`, à 17 h 54 : `d48dfe71..feb616b4` sur `main` ; Vitest vert au hook ; aucun code observable, donc pas de verdict au navigateur.
- **Non fait** : la suppression des trois branches chez `origin`. Le garde de permissions de Claude Code l'a refusée (« Git Destructive ») ; je n'ai pas réessayé. Elles sont supprimées en local depuis 17 h 04. Pour le faire toi-même : `git push origin --delete fix-1009-charge-lot-non-assigne fix-1011-codex-ouvert-sans-espace fix-1012-fichier-d-origine-et-bilan`.

## 2 · L'avertissement

**2.1 – Le signal, au mot près.** **Lu et mesuré** : `genererCodex` parcourt chaque entrée des listes de copies et tente de lire son fichier, comme avant. Il compte maintenant deux nombres.

- **Attendue** : une entrée de la liste des copies dont le statut déclaré n'est pas « exporte ». C'est M.
- **Manquante** : une copie attendue dont le fichier ne se lit pas dans l'application (absent, ou lecture en erreur). C'est N.

Le statut ne décide de rien d'autre. Ce que deviennent les cas trouvés chez Grégoire :

| Cas | Compte dans M | Compte dans N | Dans le codex écrit |
|---|---|---|---|
| « manquant » qui a son fichier (1 chez lui) | oui | non | oui, son fichier part |
| « exporte » qui a son fichier (103 chez lui) | non | non | oui, son fichier part, comme avant |
| « exporte » sans fichier | non | non | non, et c'est voulu |
| « present » ou « facsimile » sans fichier | oui | **oui** | non : c'est ce que la fenêtre annonce |

Chez lui aujourd'hui : N = 0, donc aucune fenêtre. **Mesuré** au banc (3) : les trois premières rangées ensemble ne déclenchent rien ; la quatrième affiche « 1 copie sur 2 ».

**2.2 – Où passe la fenêtre.** Dans la génération, juste après le compte et **avant l'aperçu** « voici ce qui part », donc avant la compression et avant toute écriture, tout partage et tout téléchargement. Un seul site appelle la génération (`_mettreAJourLeCodex`) : « Mettre à jour le codex », « Enregistrer sous… », le rappel de sauvegarde et la suppression d'un trimestre y passent tous. Une sentinelle Vitest refuse un second appelant qui ne passerait pas la confirmation.

**2.3 – Les mots**, posés tels quels, et l'accord :

| | Plusieurs | Une seule |
|---|---|---|
| Titre | « Ce codex n'aura pas toutes tes copies » | le même |
| Texte | « 2 copies sur 3 ne sont pas dans l'application. Le codex que tu vas écrire ne les contiendra pas. » | « 1 copie sur 3 n'est pas dans l'application. Le codex que tu vas écrire ne la contiendra pas. » |
| Puis | « Si un autre fichier de codex les contient encore, ne le remplace pas : donne un autre nom à celui-ci. » | « Si un autre fichier de codex la contient encore… » |
| Boutons | « Annuler » · « Écrire sans ces copies » | « Annuler » · « Écrire sans cette copie » |

**2.4 – « Annuler ».** Rien n'est préparé ni écrit ; aucune destination n'est demandée ; ni « Codex mis à jour », ni « Codex non mis à jour » ; l'état du codex ne bouge pas. La tentative gardée pour le rapport de bug dit « avertissement des copies manquantes refusé par l'usager ».

**2.5 – Deux choix de présentation, à corriger d'un mot.** La fenêtre s'ouvre avec le focus sur « Annuler » : une touche Entrée donnée par réflexe n'écrit rien. La modale ne sait le faire que dans sa variante « danger », qui colore le bouton d'action en rouge. L'écriture n'est pas une destruction ; le rouge peut se discuter.

## 3 · Tant que des copies manquent, l'application demande où écrire

**Mesuré** au banc (1) et (2). Quand N > 0 : la fenêtre de destination s'ouvre toujours, même si un fichier est tenu ; le fichier tenu n'est pas réécrit, et il **reste tenu** ; la destination choisie n'est pas adoptée, la mise à jour suivante redemande. « Réessayer », après un échec d'écriture, suit la même règle. Les copies revenues, la mise à jour écrit de nouveau dans le fichier tenu, sans fenêtre.

**Limite assumée** : dans Chrome, si un fichier est tenu et qu'une copie manque, le menu dit encore « Dans le même fichier » ; c'est la fenêtre qui annonce le contraire, puis la destination est demandée. Le menu ne peut pas le savoir sans relire toutes les copies à son ouverture.

**Décision prise seul** : après une écriture « sans ces copies », le codex est dit « à jour » et le message « Codex mis à jour » s'affiche, comme pour toute écriture réussie. Le fichier écrit porte bien toutes les données de l'espace ; ce sont des copies qui n'y sont pas, et la fenêtre vient de le dire.

## 4 · Le bilan d'une ouverture incomplète : les mots des autres causes

**4.1 – Posés** dans `construireBilanImport`, dans le cadre du manque d'espace, à la place des phrases de #334. Le titre « Recharger la page » ne sert plus qu'à l'ouverture complète ; « rouvre le même ZIP » a disparu. Accords tranchés : « 1 copie sur 3 n'est pas dans ce fichier de codex », « Elle manquait déjà… ne la ramènera pas. Cherche-la… » ; « 1 copie sur 3 n'a pas été reprise : son contenu n'est ni une image ni un PDF » ; « Pour retrouver cette copie ».

**4.2 – Le mélange : un ajout de ma part.** La consigne assemble le conseil de chaque cause présente. Mis bout à bout, « rouvre le même codex » (espace, erreur) et « Rouvrir le même codex ne les ramènera pas » (format) se suivent, et « ces copies » ne dit plus lesquelles. J'ai fait précéder chaque conseil du nom de sa cause, repris de la première phrase. **Mesuré** à l'écran, trois causes sur trois copies :

> 3 copies sur 3 n'ont pas pu revenir : 1 faute d'espace, 1 absente du fichier, 1 dans un format non reconnu. Tes données, elles, sont complètes, et ton fichier de codex n'a pas changé.
>
> Faute d'espace. Pour retrouver cette copie : si tu es en navigation privée, rouvre l'application dans une fenêtre normale. Sinon, libère de l'espace sur le disque de l'appareil (vide la corbeille, retire de gros fichiers), puis rouvre le même codex.
>
> Absente du fichier. Elle manquait déjà quand ce codex a été écrit : le rouvrir ne la ramènera pas. Cherche-la dans un codex plus ancien ou dans une archive.
>
> Dans un format non reconnu. Rouvrir le même codex ne la ramènera pas.
>
> Recharger la page pour appliquer les données ?

La fenêtre tient à l'écran à 1280 × 800 et à 820 × 1180, ses deux boutons visibles sans défilement (mesuré au banc). Retirer les quatre noms tient en une ligne.

**4.3 – « Le détail y sera » : non posé.** **Mesuré par le geste** : après une ouverture où une copie échoue par une erreur, « Signaler un bug ou donner ton avis » porte la section « AVERTISSEMENTS DU CODEX » avec le message de l'erreur, tant que la page n'est pas rechargée. Après « Recharger », le bouton principal de la fenêtre du bilan, la section n'y est plus : ces avertissements ne vivent qu'en mémoire. Le conseil posé s'arrête donc à « utilise « Signaler un bug ou donner ton avis ». »

## 5 · « Exporter une sélection »

**Reproduit par le geste, avant de corriger** (WebKit, banc (5) sur le code de `main`) : le codex A tenu, l'export d'une sélection a écrit dans `codex-A.zip` un fichier « (sélection) », sans demander de destination.

**Corrigé** selon la règle du verdict : l'export passe `forcerDialogue` et `sansAdoption`. Il demande toujours où écrire, n'écrit jamais dans le fichier tenu, et sa destination n'est jamais adoptée. Dans Safari et sur l'iPad, rien ne change : il n'y a ni fichier tenu ni adoption.

**Une sélection dont des copies manquent** (**mesuré par le geste**, non corrigé) : le fichier porte 1 copie sur 3 et l'écran dit « Export sélectif terminé ». Son résumé ne compte pas les copies. C'est un défaut, de la même famille ; inscrit sous #1012. Les mots de l'avertissement disent « ce codex » : je ne les ai pas posés.

## 6 · L'ancien fichier ouvert par la case (mesure seulement)

**Mesuré par le geste**, deux fois (les fixtures de 1.172.0, `.json` et `.zip`). Départ : le codex A ouvert en entier par le menu, donc tenu.

| | `.json` | `.zip` avec copies |
|---|---|---|
| Cases cochées à l'ouverture de la fenêtre | aucune | aucune |
| Tout coché : clés ajoutées | 10 | 10 |
| Clés remplacées | 3 (groupe, groupe de la démo, infos du cours) | 4 (les mêmes, et **la liste des copies**) |
| Clés intactes | 46 | 45 |
| Clés effacées | 0 | 0 |
| Fichier tenu ensuite | A | A |
| « Mettre à jour le codex » | écrit dans A, « Dans le même fichier », 3 copies | écrit dans A, « Dans le même fichier », **1 copie** |

**Ce que cela dit.** L'espace n'est pas remplacé : il est amendé, case par case, par un geste qui a ses propres cases. L'application tient le bon fichier, celui de cet espace. Ce n'est donc pas le défaut du matin (un fichier tenu dont les données ne sont pas celles de l'espace), et « oublier le fichier tenu quand l'espace est remplacé » ne s'applique pas tel quel : je me suis arrêté à la mesure, comme la consigne le prévoit.

**Ce qu'elle montre en plus.** Avec le `.zip`, la liste des copies de l'espace est **remplacée** par celle du fichier. Les trois copies de A n'ont plus d'entrée ; leurs fichiers restent au magasin, sans rien qui les désigne. Le codex réécrit dans A porte 1 copie au lieu de 3, sans fenêtre : l'avertissement compte les entrées de la liste, et ces copies n'en ont plus. C'est le chemin frère de #1011 (`executerImportSelectif`), inscrit sous #1012.

## 7 · La preuve

**Les essais.**

| Banc | Ce qu'il tient |
|---|---|
| `tests/integration/codex-1012-avertissement.spec.js` (neuf, 6 essais) | (1) après une ouverture incomplète : la fenêtre avant l'aperçu, « Annuler » n'écrit rien, l'écriture va au fichier choisi, la destination n'est pas adoptée ; (2) un fichier tenu puis une copie perdue : jamais en place, « Réessayer » compris, « Enregistrer sous… » compris ; témoin sans copie manquante, aucune fenêtre ; (3) le signal compté, pas lu dans les statuts ; (4) sans fenêtre de destination : la fenêtre passe avant le partage et avant le téléchargement ; (5) la sélection ; (6) les mots des causes par le geste, et la fenêtre du mélange à deux tailles d'écran |
| `tests/integration/codex-1012-fichier-d-origine.spec.js` (harnais mis à jour) | son espace gardait la liste des copies sans leurs fichiers : la mise à jour y passait désormais par l'avertissement. Les copies vivent maintenant dans un magasin en mémoire. Les essais (2) et (3) traversent l'avertissement ; comme la destination est alors toujours demandée, ils jugent « aucun fichier tenu » par le menu (aucun sous-texte) et par l'état du codex |
| `tests/unit/codex.test.js` (17 essais) | les mots des quatre causes, du mélange et de l'avertissement, tenus en entier, au pluriel et au singulier ; les phrases de #334 absentes de tous les bilans ; un seul appelant de la génération ; l'export de sélection |

**Les mutations**, une à la fois, restauration par copie, empreinte identique après chacune.

| État muté | Rouge sur |
|---|---|
| M1 – une copie « exporte » compte comme attendue | (3), une fenêtre s'ouvre à tort |
| M2 – le signal lu dans les statuts | (3), une fenêtre s'ouvre à tort |
| M3 – la fenêtre jamais affichée | (1) |
| M4 – « Annuler » écrit quand même | (1), la destination est demandée |
| M5 – réécriture en place malgré les copies manquantes | (2), le fichier tenu est réécrit |
| M6 – la destination choisie est adoptée | (1) |
| M7 – « Réessayer » réécrit en place | (2) |
| M8 – « Réessayer » adopte la destination | (2), au retour des copies |
| M9, M10 – `sansAdoption` ignoré par l'écriture | (5), puis (1) |
| M11 – la sélection s'écrit dans le fichier tenu | (5) ; c'est le code d'avant |
| M12 – la destination de la sélection est adoptée | (5) |
| M13 – le message dit « même fichier » pour un autre fichier | (2) |
| M14 – le focus n'est plus sur « Annuler » | (1) |
| M15 – l'aperçu passe avant la fenêtre | (1) |
| M16 – le refus de l'avertissement se dit « aperçu refusé » | (1) |
| M17 – sans fenêtre, le partage part sans rien dire | (4) |
| M18 – les conseils du mélange perdent leur nom | (6) |
| R1, R2 – deux gardes du lot précédent retirées | fichier d'origine (2), puis (3) |
| V1 à V7 – les mots et les deux sentinelles | Vitest |

Vingt-sept états mutés, vingt-sept rouges, chacun lu sur son assertion.

**Le contrôle final.** Après les mutations, fichier restauré à l'empreinte de référence : Playwright sans reprise, cinq bancs (`codex-1012-avertissement`, `codex-1012-fichier-d-origine`, `codex-1011-ouvert-sans-espace`, `lot-i-bis-anciens-fichiers-s-ouvrent`, `import-cartouche-renommee-654`), 24 essais verts. Avant la mise à jour du harnais, les huit autres bancs qui passent par la mise à jour du codex (lots F, G, I, I bis, J0 bis) : verts, sans reprise. **Sur `8377dba0`** : Vitest complet, 669 fichiers, 7 893 essais verts, aucune erreur hors essai. `index.html` : le jeton anti-cache de `js/codex.js` (`20261001i`), exigé par le hook de commit.

**Audit statique des 178 lignes ajoutées à `js/`** : aucun `innerHTML`, aucun gestionnaire en ligne, aucun `eval`, aucun `console.log`, aucune écriture au stockage. Les écrivains du fichier tenu sont cinq (oubli à la première écriture d'une ouverture, fermeture du codex, poignée invalide, adoption après le choix d'une destination, adoption après une ouverture complète) ; seule l'adoption après le choix d'une destination change, et les deux sites qui écrivent un fichier (`_mettreAJourLeCodex`, `actionExporterSelection`) sont les seuls du dépôt.

## 8 · Source ou stock

**Source seulement.** Rien n'est écrit dans les données de l'usager : le lot compte, affiche, et change où un fichier est écrit. Le stock n'est pas concerné : une copie déjà sans fichier chez quelqu'un sera comptée à sa prochaine mise à jour, et la fenêtre le lui dira. Le codex déjà écrit sans ses copies, lui, ne se répare pas d'ici ; son ouverture dit maintenant « ne sont pas dans ce fichier de codex ».

## 9 · Ce qui attend un mot

1. **Les noms de cause devant les conseils d'un mélange** (§ 4.2) : les garder, ou les retirer.
2. **« Le détail y sera »** (§ 4.3) : laisser le conseil sans ces mots, ou garder les avertissements du codex au rechargement (stockage de session, comme la dernière tentative) et les poser.
3. **Le bouton rouge de l'avertissement** (§ 2.5) : le garder, ou un bouton ordinaire avec le focus sur « Annuler ».

Pour Cowork, deux règles à trancher, inscrites sous #1012 : l'ancien fichier par la case (§ 6) ; la sélection dont des copies manquent (§ 5).

## 10 · Ce qui reste inféré

- **Chrome** : WebKit n'a ni `showOpenFilePicker` ni `showSaveFilePicker`. Le banc pose une fausse poignée qui consigne ce qu'on lui écrit, et une fausse fenêtre de destination. Que la vraie fenêtre de Chrome s'ouvre après l'avertissement, et qu'elle propose bien un autre nom que le fichier tenu, n'est pas exécuté.
- **Le partage de l'iPad** : un faux `navigator.share`. Le clic sur « Écrire sans ces copies » est un toucher ; l'aperçu et la préparation le suivent, et la fenêtre « Ton codex est prêt » redemande un toucher s'il a expiré, comme avant. Sur un vrai iPad avec un codex d'un gigaoctet, l'enchaînement des trois fenêtres n'est pas vécu.
- **Le compte sur un vrai espace** : la mesure de 17 h 03 a compté chez Grégoire avec une sonde, pas avec ce code. Le code suit la même règle ; l'égalité des deux comptes est une inférence jusqu'à la porte.

## 11 · Ce qui n'est pas fait

- La suite Playwright complète (elle se prend au verdict, avant un push).
- La release, le changelog, la porte terrain.
- L'ancien fichier par la case et la sélection aux copies manquantes : mesurés, inscrits, non corrigés.

## 12 · Proposition pour les Nouvelles (à accepter par Grégoire)

> **Ton codex te prévient quand des copies lui manquent.** Si des copies ne sont pas dans l'application au moment d'écrire ton codex, une fenêtre le dit avant d'écrire, et l'application te demande où ranger le fichier plutôt que de remplacer l'ancien. « Exporter une sélection » n'écrit plus jamais dans ton fichier de codex. Et le bilan d'un codex ouvert incomplet dit, pour chaque cause, si le rouvrir peut ramener les copies.
