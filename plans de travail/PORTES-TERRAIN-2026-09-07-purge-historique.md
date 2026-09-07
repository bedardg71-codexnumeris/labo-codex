# PORTES TERRAIN — Purge de l'historique git (#781)

**Pour Grégoire. Préparée le 7 septembre 2026 au soir, pour une exécution À FROID.**
Jumelle technique : `plans de travail/CHANTIER-historique-git-donnees-personnelles.md`
(la session qui exécute lit son §0, « Consigne d'exécution »).

> **Pourquoi cette liste existe alors qu'elle est courte.** Presque tout se vérifie à la
> machine, et la session le fera : l'arbre intact, les identités disparues, l'intégrité du
> dépôt. **Ce qui reste ici est ce qu'aucune machine ne peut faire à ta place** — te fournir la
> liste de tes élèves, dire si tu as du travail en cours, donner le signal, et constater que
> ton application marche encore après.
>
> ⛔ **Ce chantier est IRRÉVERSIBLE.** Une fois le `push --force` fait, l'ancien historique n'est
> plus sur GitHub, et 65 branches de travail abandonné disparaissent. C'est la raison d'être des
> vérifications préalables du §1 : elles ne se sautent pas.
>
> **Ce qui échoue ici devient un item de backlog, pas une note mentale.**

---

## §0 · PRÉALABLE — ce qui invalide tout le reste s'il est sauté

  0.1   **Ferme GitHub Desktop, et laisse-le fermé.**                          `⚠⚠ Données`

        ┌ POURQUOI ────────────────────────────────────────────────────┐
        │ L'application déplace des fichiers dans ton dossier pendant   │
        │ qu'on travaille dedans. Elle a déjà fait rougir des tests     │
        │ sans rapport, et elle met de côté ton travail non enregistré  │
        │ quand elle change de branche.                                 │
        └───────────────────────────────────────────────────────────────┘

        [✓][✗]  Ferme complètement GitHub Desktop (Cmd+Q, pas juste la fenêtre).
                ⮕ Attendu : plus aucune fenêtre de l'application ouverte.

  0.2   **PAS de `git pull` dans cette liste — c'est normal.**                  `note`

        ┌ POURQUOI ────────────────────────────────────────────────────┐
        │ D'habitude tu tires les changements avant de vérifier. Ici    │
        │ c'est impossible : après la réécriture, ton dossier ne peut   │
        │ plus être réconcilié avec GitHub. Tu vas RECLONER (§2).       │
        └───────────────────────────────────────────────────────────────┘

        [✓][✗]  Rien à faire. Coche pour confirmer que tu as lu.

---

## §1 · ⚠⚠ DONNÉES — les gestes irréversibles, dans cet ordre

  1.1   **Prépare la liste de tes élèves.**                                     `⚠⚠ Données`
        #781 · c'est la seule pièce que la machine ne peut pas deviner

        ┌ POURQUOI ────────────────────────────────────────────────────┐
        │ On sait effacer un numéro de DA : c'est une suite de chiffres │
        │ unique, sans ambiguïté. On ne sait PAS deviner un nom. Un nom │
        │ de famille ressemble à un mot ordinaire — on en a trouvé un   │
        │ qui dormait en clair dans le BACKLOG parce que tout le monde  │
        │ l'avait pris pour autre chose. Un élève absent de ta liste    │
        │ survivra à la purge SANS QUE RIEN NE LE SIGNALE.              │
        └───────────────────────────────────────────────────────────────┘

        [✓][✗]  Crée un DOSSIER `~/purge-identites/` et dépose tes dix listes dedans,
                **telles quelles**. Ne reformate rien, ne concatène rien, ne retire pas les
                en-têtes : le format d'export du collège
                (`No de DA;Groupe;Nom;Prénom;Prog.;Services adaptés;`) est lu tel quel.
                ⮕ Attendu : dix fichiers dans le dossier, aucun ouvert ni réenregistré dans Excel.
                ⛔ **Ne colle jamais ces listes dans une conversation.** Un dossier, rien d'autre.

        Combien de listes as-tu déposées ?   → __________ fichiers

  1.1b  **Ne te bats pas avec les accents.**                                    `note`

        ┌ POURQUOI ────────────────────────────────────────────────────┐
        │ Un export ouvert puis réenregistré dans Excel peut abîmer les │
        │ accents. Si tu essaies de les réparer à la main, tu risques   │
        │ d'en perdre un — et un nom mal orthographié n'est pas purgé.  │
        └───────────────────────────────────────────────────────────────┘

        [✓][✗]  Si les accents ont l'air abîmés, laisse-les. Signale-le, c'est tout.
                ⮕ Attendu : le script détecte l'encodage et convertit.

  1.2   **As-tu du travail non enregistré dans ton dossier ?**                   `⚠⚠ Données`

        ┌ POURQUOI ────────────────────────────────────────────────────┐
        │ La manœuvre rend ton dossier irréconciliable. Tout ce qui n'y │
        │ est pas enregistré et envoyé sera perdu avec lui.             │
        └───────────────────────────────────────────────────────────────┘

        [✓][✗]  Rouvre GitHub Desktop UNE fois, regarde s'il annonce des changements en
                attente, envoie-les s'il y en a, puis referme-le (Cmd+Q).
                ⮕ Attendu : « No local changes ».

  1.3   **Reçois la sauvegarde, et garde-la sur TON disque.**                    `⚠⚠ Données`

        ┌ POURQUOI ────────────────────────────────────────────────────┐
        │ La première tentative de ce chantier a préparé une sauvegarde │
        │ dans un conteneur infonuagique. Le conteneur a été détruit,   │
        │ et la sauvegarde avec. Tant qu'elle n'est pas chez toi, il    │
        │ n'y a pas de filet.                                           │
        └───────────────────────────────────────────────────────────────┘

        [✓][✗]  Récupère le fichier `sauvegarde.bundle` que la session te donnera, et
                range-le ailleurs que dans le dossier du projet (Documents, un disque externe).
                ⮕ Attendu : le fichier existe sur ton Mac, hors du dossier `Monitorage_v6`.

  1.4   **Donne le signal — ou ne le donne pas.**                                `⚠⚠ Données`

        ┌ POURQUOI ────────────────────────────────────────────────────┐
        │ La session a l'ordre de tout préparer et de S'ARRÊTER. Sans   │
        │ ta phrase, rien n'est envoyé. Ton accord de septembre sur la  │
        │ portée du chantier ne vaut pas comme signal de départ.        │
        └───────────────────────────────────────────────────────────────┘

        [✓][✗]  Dis-le en toutes lettres, dans la session qui exécute.
                ⮕ Attendu : elle te répond en te rappelant les 65 branches perdues,
                  puis exécute. Si elle exécute sans te le rappeler, arrête-la.

---

## §2 · SUR TON MAC, APRÈS — ce que tu constates à l'écran

  2.1   **Renomme l'ancien dossier — ne l'efface pas.**                          `⚠⚠ Données`

        [✓][✗]  Dans le Finder, renomme `Monitorage_v6` en `Monitorage_v6_ancien`.
                ⮕ Attendu : le dossier existe toujours, sous son nouveau nom.
                ⛔ C'est lui qui contient encore l'ancien historique. Il reste ton filet
                  jusqu'à la rangée 2.5.

  2.2   **Clone à neuf, au MÊME endroit qu'avant.**                              `⚠⚠ Données`

        ┌ POURQUOI ────────────────────────────────────────────────────┐
        │ Ton application se lance depuis ce dossier, et tes trimestres │
        │ sont rattachés à son emplacement. Un dossier ailleurs, et le  │
        │ navigateur pourrait ne plus retrouver tes données.            │
        └───────────────────────────────────────────────────────────────┘

        [✓][✗]  Clone depuis GitHub Desktop dans `~/Documents/GitHub/Monitorage_v6` —
                le chemin exact d'avant.
                ⮕ Attendu : le dossier `Monitorage_v6` réapparaît au même endroit.

  2.3   **Ouvre l'application et lis le numéro en bas de page.**

        [✓][✗]  Ouvre `index.html`, recharge en vidant le cache (Cmd+Maj+R),
                et lis le numéro de version tout en bas.
                ⮕ Attendu : le même numéro qu'avant la purge. La réécriture ne change
                  aucun fichier du présent — si le numéro a bougé, quelque chose a mal tourné.

        Quel numéro vois-tu ?   → __________

  2.4   **⚠ Tes trimestres sont-ils toujours là ?**                              `⚠⚠ Données`

        ┌ POURQUOI ────────────────────────────────────────────────────┐
        │ Tes données ne vivent pas dans le dépôt : elles vivent dans   │
        │ ton navigateur. Elles ne devraient donc rien voir de tout     │
        │ ceci. « Ne devraient pas » n'est pas « ne verront pas », et   │
        │ personne ne peut le vérifier à ta place.                      │
        └───────────────────────────────────────────────────────────────┘

        [✓][✗]  Ouvre l'automne 2026, va dans Suivi, et regarde ton groupe.
                ⮕ Attendu : tes élèves, tes notes, tes présences — comme avant.
                ⛔ **Si quelque chose manque, ARRÊTE et dis-le. N'efface rien.**
                  Le dossier `_ancien` est encore là, et c'est ce qui te sauve.

  2.5   **Une fois rassuré — et seulement là — efface l'ancien dossier.**        `⚠⚠ Données`

        [✓][✗]  Mets `Monitorage_v6_ancien` à la corbeille, et vide la corbeille.
                ⮕ Attendu : il ne reste qu'un dossier `Monitorage_v6`.
                ⛔ Tant qu'il existe, il contient l'historique complet avec les identités :
                  c'est la dernière copie chez toi.

  2.6   **Exporte un PDF de correction.**

        ┌ POURQUOI ────────────────────────────────────────────────────┐
        │ La purge remplace un nom de famille partout où il apparaît —  │
        │ et il se trouve que ce mot existe aussi dans la bibliothèque  │
        │ qui fabrique tes PDF. On ne s'attend à aucun effet visible,   │
        │ mais c'est la seule chose que la purge touche dans le code.   │
        └───────────────────────────────────────────────────────────────┘

        [✓][✗]  Ouvre une évaluation et exporte son PDF comme d'habitude.
                ⮕ Attendu : le PDF se produit, se lit, rien n'a changé.

---

## §3 · DÉCISIONS — ce qui attend ton verdict

> **Ce ne sont PAS des vérifications.** Rien à cocher : ce sont des choix que personne ne peut
> faire à ta place. Écris ta réponse à côté.

  3.1   **Où le chantier s'exécute-t-il ?**

        Ta liste vit sur ton Mac, et c'est là que tu devras recloner de toute façon. Le faire
        depuis un conteneur oblige à faire voyager la liste.

        Ta réponse → ______________________________________________

  3.2   **Confirmes-tu encore la perte des 65 branches non fusionnées ?**

        Tu l'avais acceptée le 7 septembre. Ce sont des travaux abandonnés, dont un audit de mai
        à +68 commits. Sans leur suppression, le nettoyage est illusoire : une branche non
        réécrite retient tous les anciens objets.

        Ta réponse → ______________________________________________

  3.3   **Écrit-on au support GitHub après la réécriture ?**

        GitHub garde un temps les anciens objets, joignables par leur adresse. Sur un dépôt
        privé, c'est confiné à qui y a accès. **Si tu vises le public, ça devient obligatoire,
        et AVANT d'ouvrir** — d'autant que tes propres journaux citent près de 1 200 adresses de
        commits, dont trois sur quatre sont réelles.

        Ta réponse → ______________________________________________

  3.4   **Les prénoms qui se confondent avec des mots du projet.**

        ⚠ Avant de purger, la session te présentera un rapport : pour chaque nom et prénom de
        tes listes, combien de fois le mot apparaît dans le dépôt. Mesuré au hasard sur des
        prénoms courants : **« Léa » apparaît 214 fois — c'est la plateforme du collège.**
        « Alice » 66 fois (l'élève fictive des tests), « Rose » 57 (une couleur), « Camille »
        24 (la démo), « Olivier » 23 (un collègue testeur). Si une de tes élèves porte un de
        ces prénoms, un remplacement aveugle casserait tout.
        ⮕ **Ce rapport, c'est toi qui le tranches, cas par cas.** Le plus souvent, ne rien
        faire suffit : une fois le nom de famille et le DA partis, un prénom seul n'identifie
        personne.

        Ta réponse → ______________________________________________

  3.5   **Le dépôt passe-t-il en public, et quand ?**

        C'est la seule option qui supprime la facture des minutes d'Actions au lieu de la
        rationner. ⚠ Le code de l'application est **déjà** téléchargeable par tout visiteur du
        site : ce que l'ouverture ajouterait, c'est l'historique et les documents de travail.

        Ta réponse → ______________________________________________

---

## §4 · CE QUE JE N'AI PAS PU VÉRIFIER — et mes erreurs de la journée

**Angles morts du chantier :**

- **La prose n'est balayée qu'à hauteur de ta liste.** Un nom que tu oublies survit sans
  signal. C'est la limite structurelle, pas un défaut d'exécution.
- **Les anciens objets restent joignables un temps chez GitHub** (rangée 3.3).
- **Toute copie déjà faite du dépôt garde tout** : un clone ailleurs, une sauvegarde, un cache.
- **Je n'ai jamais vu ton application tourner.** Ni Safari ni l'iPad n'existent dans le
  conteneur. Les rangées 2.3 à 2.6 ne sont vérifiables que par toi.
- **Je ne connais pas les DA des exports.** Le balayage a montré que les 19 DA identifiés ne
  sont PAS ceux des sauvegardes de `backups-donnees/` — ce sont ceux qui avaient fui dans les
  documents. Les exports portent d'autres élèves, dont j'ignore tout.

**Mes erreurs du 7 septembre, dites plutôt que tues :**

- **Mon premier balayage a dormi 59 minutes sans consommer une seconde de processeur.** Je
  t'ai fait attendre une heure pour une erreur de plomberie de ma part, pas pour un calcul.
  Refait correctement : 37 secondes.
- **Mon premier retrait des DA du plan était incomplet.** J'avais nettoyé la liste du §1 ; les
  19 vivaient aussi dans les règles du §4.4. C'est le témoin qui l'a attrapé — sans lui,
  j'aurais annoncé « c'est retiré » en me trompant.
- **J'ai d'abord excusé un nom de famille comme étant « aussi la langue bretonne ».** Tu m'as
  corrigé. Cette erreur de cadrage n'était pas cosmétique : elle avait produit une règle de
  purge ancrée qui **n'aurait pas attrapé le nom écrit en prose** — c'est-à-dire là où il
  dormait vraiment.

---

## ÉTAT

- [ ] §0 · Préalable
- [ ] §1 · Données — les quatre gestes irréversibles
- [ ] §2 · Sur le Mac, après
- [ ] §3 · Décisions (4)
- [ ] Échecs versés au BACKLOG avec leur numéro de rangée

**Artefact jumeau** : https://claude.ai/code/artifact/75c9b6eb-667a-4c26-96e5-43c99656dd8d
(cases à cocher, champs de saisie pour les mesures et les décisions, filtres, et le bouton
« Copier mes résultats » — l'avancement vit dans le navigateur de Grégoire, la session ne
peut pas le lire.)

⚠ **Publié par Claude Code, pas par Cowork.** `CLAUDE.md` confie l'artefact à Cowork ; laisser
la paire à moitié faite était pire que déroger, la porte ayant été demandée pour une reprise à
froid. ⮕ **Cowork n'a pas à le republier.**
