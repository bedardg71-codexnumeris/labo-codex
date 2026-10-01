# Consigne du jour – un codex ouvert sans assez d'espace finit par « Erreur » : inscrire, mesurer, corriger dans un lot à part

> Écrite le 1er octobre 2026 à 8 h 51 (Toronto) par Cowork, à la demande de Grégoire. Remplace la consigne de 7 h 33 (exécutée, 1.173.0 en ligne), archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-10-01-lot-I-bis-verification.md`.
> **Condition de départ** : le correctif que tu prépares pour 1.173.1 est terminé, ou rangé. Cette consigne ne passe pas devant lui et ne s'y mêle pas : un lot à part, sur sa branche.

## Le constat, à la porte du lot I bis (rangées 2.3 et 2.4)

Grégoire, le 1er octobre à 8 h 47, Chrome 154 sur le Mac, fenêtre de navigation privée, 1.173.0 (build 1001-0306) : Réglages › Données › « Ouvrir un Codex… », son vrai codex. Rapport de bug `BUG_"grégoire"_2026-10-01_08-48-22.txt`, gravité « gênant » ; il l'a enregistré, demande-lui où si tu veux le ranger sous `Retours des testeurs/`.

**Mesuré dans son rapport** :
- La pile passe par `Codex.ouvrirFichier` → `_ouvrirLeFichierChoisi` → `chargerCodex` (`js/codex.js?v=20261001b`, lignes 2918, 2924, 759) : la case confie bien le fichier au codex, sans l'alerte d'avant. **Le geste que jugeait la rangée 2.3 a donc eu lieu** (cochée en échec, puis corrigée par sa réponse : voir l'étape 1).
- À 8 h 47 min 30 s : au moins vingt « 📂 Codex : blob ignoré pour FT_… (quota) », chacun précédé de « [DB] Transaction storeBlob avortée » (le rapport ne garde que vingt lignes).
- Puis « [DB] Transaction IndexedDB avortée clé "a2026_fichiersTravaux" », puis « 📂 Erreur ouverture codex ».
- À l'écran (capture) : un bandeau rouge « Erreur », le sélecteur dit « -- Sélectionne un trimestre -- ». Ni « Recharger la page », ni « Espace insuffisant pour ouvrir ce codex ». **La rangée 2.4 est en échec** : aucune des deux fins attendues.
- État au moment du rapport : `trimestreActif: a2026`, 27 étudiants, 647 clés en localStorage. Les données sont donc écrites, sans rechargement proposé.

**Lu au code par Cowork sur `main`, pas reproduit** :
- Les copies refusées sont comptées sans arrêter l'ouverture (boucle des blobs, `blobsEchecs`). Ensuite, l'étape qui marque ces copies « manquantes » réécrit les clés des copies par `await db.set(clesFTImport[k], …)`, sans garde. Hypothèse : c'est cette écriture qui a été avortée, faute d'espace elle aussi ; l'exception remonte à `_ouvrirLeFichierChoisi`, qui affiche `notifications.erreur('Erreur', e.message)`. Le bilan honnête de #334 (« Import incomplet : N fichiers sur M… ») et la proposition de recharger ne sont jamais atteints.
- Le lot I bis n'a pas écrit ce chemin : il y mène la case. Le menu Codex doit avoir le même défaut. À confirmer.
- Le message du pré-vol (`msgPrevol`) parle de « Safari » et de « Stockage iPad » : faux dans Chrome sur un Mac. Pas vu par Grégoire, puisque le pré-vol n'a pas refusé.

**Pas établi** : pourquoi le pré-vol n'a pas refusé d'emblée (les valeurs d'`estimate()` dans une fenêtre privée de Chrome, le poids décompressé du codex, le verdict rendu : « ok » ou « inconnu »).

## Ce que tu fais, dans cet ordre

1. **Inscris le retour** au registre des retours testeurs et sa fiche au backlog, après avoir vérifié les deux registres. Le constat ci-dessus, avec sa part mesurée et sa part lue. Mets à jour `plans de travail/PORTES-TERRAIN-2026-09-30-lot-I-bis.md` d'après le relevé de Grégoire du 1er octobre à 8 h 51 min 49 s (reçu par Cowork après l'écriture de cette consigne) : **9 passées, 2 échecs, 0 non traitée**. Passées : 0.1, 0.2, 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.5, sur le Mac dans Chrome et sur l'iPad dans Safari ; aucun champ de constat rempli. En échec : 2.3 et 2.4. ⚠ Pour 2.3, sa coche et sa trace ne disent pas la même chose : il l'a cochée en échec, mais la pile de son rapport montre que la case a confié le fichier au codex, sans l'ancienne alerte. **Tranché par Grégoire le 1er octobre à 8 h 53** : au choix du fichier, il a vu « une ouverture qui démarre puis finit en « Erreur » », pas l'ancienne alerte. L'attendu de 2.3 a donc eu lieu ; sa coche portait sur la fin. Écris : 2.3 passée (cochée en échec, corrigée par sa réponse), 2.4 en échec. Un seul échec réel : dix rangées sur onze.
2. **Reproduis au banc avant de corriger**, sur le code de `main` : une ouverture de codex où le stockage des copies est refusé pour manque d'espace, puis où la réécriture de la liste des copies l'est aussi. Dis si mon hypothèse tient (quelle écriture est avortée, quel message arrive à l'écran), par le menu Codex et par la case. Si elle ne tient pas, arrête-toi et dis ce que tu vois.
3. **Mesure ce qui reste de l'espace après l'échec** : quelles clés sont écrites, lesquelles manquent, le codex est-il « actif », que montre l'application si on recharge à la main. C'est ce que vivrait quelqu'un dans sa fenêtre normale, sur un appareil presque plein.
4. **Corrige, sur une branche, sans release** : quand des copies sont refusées, l'ouverture va jusqu'à son bilan, « Import incomplet… », et propose de recharger, même si le marquage « manquante » ne peut pas s'écrire. Rien ne doit se terminer par un « Erreur » nu. Sentinelle au banc, mutations rouges.
5. **Le pré-vol** : dis pourquoi il n'a pas refusé si tu peux l'établir au banc ; sinon écris « pas établi » et ce qu'il faudrait relever chez Grégoire. Ne change pas ses seuils dans ce lot.
6. **Les mots** : tout texte neuf ou modifié que l'usager lit (un nouveau message, `msgPrevol` sans « Safari » ni « iPad » quand ce n'est ni l'un ni l'autre) remonte à Grégoire avant d'être posé. Propose le texte dans ta demande de relecture ; ne le tranche pas.
7. **Arrête-toi à la demande de relecture** : `plans de travail/DEMANDE-RELECTURE-2026-10-01-<sujet>.md`. Ce chemin écrit les données de l'usager : relecture croisée de Cowork avant la release (règle 2 du protocole). Pas de version, pas de push du code.

## Ce que tu rends

À Grégoire, trois lignes : le numéro de la fiche ; si l'hypothèse tient, et ce qui reste dans l'espace après l'échec ; ce qui attend sa décision (les mots). `RELAIS.md` à jour. Le chantier du codex reste « en ligne, porte incomplète » tant que cette fiche est ouverte : la rangée 2.4 est en échec.

## Ajout de 9 h 50 – deux décisions de Grégoire, à poser sous leurs fiches (étape 1, avec le reste)

Rendues dans la conversation avec Cowork le 1er octobre vers 9 h 50, après la mise en ligne de 1.173.1. Ses mots, tels quels. Tu les écris sous les fiches ; tu ne codes rien de ces deux fiches dans ce lot.

**Sous #1007** (un codex à part avant de supprimer un trimestre) : « Il faudrait toujours proposer à l'utilisateur de faire un Codex avant de supprimer quoi que ce soit, parce que c'est irréversible. »
- Ce que ça tranche : oui, l'application offre de faire un codex avant une suppression.
- Ce que ça élargit : « quoi que ce soit », pas seulement un trimestre. La fiche devient un principe, et il lui faut un **inventaire mesuré des gestes qui suppriment pour de bon** (trimestre, groupe, étudiant·e, production, évaluation, copie, archive, et ce que tu trouveras) : pour chacun, ce qui est effacé, ce que dit l'écran aujourd'hui, et si un codex le rendrait. L'inventaire est un lot de mesure à part, pas dans celui-ci.
- **Tranché par Grégoire à 9 h 51** (proposition de Cowork, sa réponse : « oui ») : l'application **exige** un codex à jour pour supprimer un trimestre ou un groupe ; elle le **propose** pour le reste (une évaluation, une copie, et les gestes du même ordre), où un refus à chaque geste deviendrait pénible. L'inventaire dira, geste par geste, de quel côté chacun tombe ; les cas qui ne sont ni l'un ni l'autre lui reviennent.
- Reste ouvert, à lui poser avec l'inventaire : si ce codex est le codex habituel mis à jour, ou un fichier à part sous un autre nom (la proposition d'origine de la fiche, née de ce que Chrome réécrit le même fichier).

**Sous #1010** (aucun signal quand des copies arrivent sur une production non transmise) : « Il faudrait signaler à l'utilisateur que la consigne ne semble pas avoir été transmise si la case n'est pas cochée et qu'il commence à évaluer. »
- Ce que ça tranche : oui, un signal ; son moment est le début de l'évaluation, pas l'import des copies ; son ton est un constat (« ne semble pas »), pas un blocage.
- Les mots du signal lui reviennent. Proposition de Cowork, à lui faire valider quand le lot s'ouvrira, pas avant : « Les consignes de cette production ne sont pas marquées comme transmises. », avec un bouton « Marquer comme transmises » et un « Plus tard ».
- À mesurer à l'ouverture du lot : où commence une évaluation (les entrées possibles), et si le signal doit revenir à chaque copie ou une fois par production.
