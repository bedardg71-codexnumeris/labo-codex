# Rapport : deux liens vers la carte d'alignement, la mesure (session C de la nuit)

> Claude Code, nuit du 8 au 9 nov. 2026, session cloud. Consigne : `CONSIGNE-LOT-2026-11-08-deux-liens-vers-la-carte.md`, premier temps seulement (mesure et proposition, **aucun code**). Branche `mesure/deux-liens-vers-la-carte`, partie de `origin/main` `98c04bfc`. Mesure faite sur ce commit, pas sur `cafc89ff2` (introuvable dans ce clone) : le constat de Cowork est donc remesuré, pas recopié.

## En tête

### Ce qui est fait

- Les deux constats de Cowork sont vérifiés dans le code : ils tiennent, avec quatre nuances qui changent la proposition (§ 1 et § 3).
- Une proposition pour chaque lien : ce qui fait foi, le geste qui crée le lien, ce que voit l'enseignant·e, les cas multiples, ce qui voyage, le stock (§ 2 et § 4).
- Un relevé du stock en lecture seule, prêt à lancer sur le Mac, éprouvé ici sur données fictives (§ 5).
- Une relecture adverse par un agent neuf : quatre erreurs trouvées, corrigées dans cette version (§ 9).
- Les deux entrées « À inscrire au BACKLOG » (§ 6). Pas dans `BACKLOG.md` : la règle 3 du fichier de la nuit l'interdit, alors que la consigne disait « Inscris ». La règle de la nuit l'emporte.

### Ce qui attend Grégoire (une question par ligne, ma recommandation après la flèche)

1. **Le sens du premier lien (didactique).** L'objectif d'une production et un objectif de leçon peuvent-ils être *le même texte*, ou la leçon *sert-elle* l'objectif de la production ? L'application les définit à deux grains : l'objectif de production est « transférable et sans terme : on ne coche pas un objectif atteint » (info-bulle `cn-prod-objectif`), l'objectif de leçon dit « ce que l'étudiant saura faire à la fin » et une évaluation le « vérifie » (guide de la carte). ⮕ Même texte, mais seulement par un geste explicite, quand l'enseignant·e juge que c'est le même. C'est ce que dit déjà l'étape 4 du cinquième parcours (« si c'est celui que vise cette leçon »).
2. **Ce qui fait foi pour l'objectif.** ⮕ La production. Elle existe sans carte, ce que lisent les étudiant·es vient d'elle, et elle voyage seule.
3. **Le geste du premier lien.** ⮕ Dans la zone 🎯 de la leçon, une commande « Reprendre l'objectif d'une production » (libellé proposé) qui ajoute une ligne liée. Dans l'Inspecteur d'une évaluation reliée à cette production, rien n'est coché d'office.
4. **Le plan de cours exporté, que lisent les étudiant·es.** Une ligne liée y imprime le texte courant de la production. ⮕ Oui : c'est le but du lien, et ça n'arrive que si l'enseignant·e a relié.
5. **Ce qui fait foi pour la compétence.** ⮕ La fiche du cours. Elle est globale (la même d'un trimestre à l'autre), alors que la carte est recopiée à chaque trimestre.
6. **Un cours qui vise plusieurs compétences.** La fiche n'en porte qu'une. ⮕ La garder telle quelle : la première compétence est liée, une deuxième reste un bloc libre comme aujourd'hui. Faire de la fiche une liste est un chantier à part, à n'ouvrir que si tu le vis.
7. **Les éléments de compétence (didactique).** ⮕ Les montrer dans l'Inspecteur du bloc, en lecture seule. Ne pas en faire des blocs : un élément du devis n'est pas une idée maîtresse.
8. **Le stock (tes données).** Rien n'est relié d'office. Un bloc Compétence existant propose « Relier à la fiche du cours » (libellé proposé), en montrant les deux textes s'ils diffèrent. Pareil pour un objectif de leçon identique à l'objectif d'une production déjà choisie dans une évaluation. Le titre que tu as écrit n'est jamais effacé. ⮕ Oui.
9. **Les mots.** Tous les libellés de ce rapport sont **proposés** : aucun n'est posé, aucun n'est validé (liste au § 7).

### Ce que je n'ai pas pu vérifier

- **Le stock réel** : combien de cartes, de blocs Compétence, d'objectifs déjà en double chez Grégoire. À mesurer sur le Mac avec le relevé du § 5 (lecture seule, une ligne dans la console).
- **WebKit, les captures** : aucune ici. Aucun code n'a été écrit, donc aucun spec n'a été lancé. Les captures avant/après à 1180 px reviennent à l'étape 2.
- **Le document « Parcours d'assistance : cinquième parcours »** : il vit chez Cowork. J'ai lu à la place la consigne `CONSIGNE-LOT-2026-11-08-parcours-5-monter-ton-cours.md`, qui en recopie les étapes 1 et 4.
- **La survie du lien à la rentrée** : une production reprise d'un trimestre à l'autre reçoit un nouvel identifiant mais garde `idOriginal`. Je n'ai pas vérifié que `idOriginal` désigne bien la production du trimestre précédent : c'est ce qui dirait si un lien peut se recoudre à la reprise.

---

## 1. L'objectif : la mesure

### Le constat de Cowork, point par point

| Constat | Verdict | Où |
|---|---|---|
| Bloc ancré « Objectif d'apprentissage », clé `objectif`, un champ, recommandé, invite « À la fin de cette activité… » | Tient | `js/productions.js:568-577` |
| Imprimé sur la feuille de consignes | Tient | `js/export-pdf.js:2019-2020` (titre renommable par `titresBlocs.objectif`) |
| « Objectif : … » en tête de la synthèse | À nuancer : deux endroits | La rétroaction écrit « Objectif : … » si la case est cochée (`js/evaluation-retroaction.js:134-135`) ; la synthèse l'affiche sous l'étiquette « OBJECTIF » (`js/synthese-retroaction-data.js:336`, `js/synthese-retroaction-rendu.js:293`) |
| Les objectifs de leçon : `metadata.objectifs`, chacun `{id, texte}` | Tient | `js/planification-carte.js:119-124` (porte de lecture unique `objectifsDeLecon`) |
| `objectifsServis` limités à la leçon ; l'évaluation coche ce qu'elle vérifie (#964) | Tient, avec une nuance | Les blocs ordinaires sont filtrés à leur leçon (`:190-197`) ; l'évaluation coche aussi les objectifs des leçons placées **avant** elle (`:238-243`, `:258-271`) |
| `metadata.productionId` sur le bloc Évaluation, sélecteur « Production » | Tient | Lecture `:3472-3477`, écriture `:3722-3729` ; seul type à le porter (`:1497`) |
| Aucune lecture de l'objectif d'une production dans la carte ni l'export | Tient | La projection `chargerProductions` ne garde ni `objectif` ni `tache` (`:8365`) ; aucun `.objectif` de production dans `planification-export.js` |

### Ce que j'ajoute

1. **Deux grains distincts dans l'application elle-même.** Info-bulle de la production : « Transférable et sans terme : la capacité qui servira à l'artefact suivant, au cours suivant, ailleurs. On ne coche pas un objectif atteint » (`js/accompagnement-contenu-hover.js:242-243`, protégée par `tests/unit/nuance-tache-objectif.test.js`). Guide de la carte : « c'est lui qui dit ce que l'étudiant saura faire à la fin » (`js/planification-carte.js:1961`), et une leçon en porte « souvent plusieurs ». D'où la question 1.
2. **Un troisième lecteur de l'objectif de production, par égalité de texte.** La suggestion holistique de la dénotation apparie les productions aux cibles de la pratique par `p.objectifId === obj.id || p.objectif === obj.nom` (`js/pratiques/pratique-pan-standards.js:1129`, appelée par `js/pratiques/denotation-saisie-ui.js:79-80`). Une solution qui réécrirait le texte d'une production changerait cet appariement. La production qui fait foi n'y touche pas. Autres lecteurs, tous intacts pour la même raison : un second appariement par égalité (`js/portfolio.js:692`), l'aperçu de la bibliothèque (`js/productions-bibliotheque-ui.js:94`), le modèle de cartouche (`js/cartouches.js:3397`), le test « a des consignes » du PDF (`js/export-pdf.js:1826`).
3. **L'objectif voyage avec la production.** Partage : `js/partage-schemas.js:600` ; import sélectif : `js/import-export.js:1314` (listes blanches). Un nouveau champ sur la production serait écarté en silence par ces deux listes : la proposition n'en ajoute aucun.
4. **Le pont `productionId` survit à la rentrée selon le chemin.** Reprise par la bibliothèque : nouvel identifiant (`js/productions-bibliotheque-ui.js:382-387`, `idOriginal` gardé). Reprise par l'import sélectif : l'identifiant d'origine est gardé, sauf conflit (`js/import-export.js:3618-3626`). La reprise d'une carte efface tout `productionId` qui ne désigne pas une production du trimestre d'arrivée (`js/planification-donnees.js:519-529`) : le pont tient dans le second cas, pas dans le premier. Une carte importée d'un·e collègue garde des `productionId` morts (aucun contrôle dans `importerDepuisBibliotheque`) ; le modèle de relecture par IA les écrit « Production : introuvable dans ce trimestre » (`js/planification-export.js:2023`, `:2154-2155`), ce qui est exact.
5. **L'écriture des objectifs de leçon jette tout champ inconnu.** `appliquerObjectifs` reconstruit la liste en `{id, texte}` (`js/planification-carte.js:416`). Un champ de lien sur un objectif mourrait à la première frappe dans la leçon : c'est le premier point à coder et à tester à l'étape 2. Le second : la reprise d'une carte ne contrôle que `metadata.productionId` (`js/planification-donnees.js:523-527`), jamais `metadata.objectifs[].productionId` ; elle devra traiter le lien d'objectif de la même façon. La duplication d'un conteneur, elle, recopie l'objectif entier et garde le lien (`js/planification-carte.js:4093-4100`).
6. **Le troisième texte signalé par l'audit (#367) est périmé.** `objectifPersonnalise` des notes de séance est migré une fois vers `metadata.objectifs` puis purgé (`js/planification-carte.js:536-559`) : ce n'est pas une copie vivante.

## 2. L'objectif : la proposition

- **Ce qui fait foi** : la production (question 2). La leçon *reprend* son texte par un lien ; elle ne le copie pas.
- **Le sens et le geste** : de la leçon vers la production. Dans la zone 🎯, une commande « Reprendre l'objectif d'une production » ouvre la liste des productions du cours dont l'objectif est rempli ; en choisir une ajoute une ligne liée. Le lien se pose côté leçon parce que, dans le cinquième parcours, l'objectif s'écrit à l'étape 4 et la production ne se choisit dans l'évaluation qu'à l'étape 6. Un lien posé depuis l'évaluation arriverait après l'objectif.
- **Le modèle** : la ligne liée reste un objectif ordinaire, `{id, texte, productionId}`. Son `id` porte déjà tous les liens de la carte (servis, vérifiés, pastilles). `texte` garde le dernier texte connu : c'est le repli quand la production n'est pas là. Aucun champ ajouté à la production.
- **Dans la carte** : la ligne affiche le texte courant de la production, marquée comme liée, et n'est pas modifiable sur place. La toucher offre « Modifier dans la production » ou « Délier » (libellés proposés). Délier en fait un objectif ordinaire avec le texte du moment.
- **Dans la production** : sous « Objectif d'apprentissage », une mention en lecture seule, « Repris dans la carte : leçon « … », semaine N » (proposé), calculée comme le fait déjà `positionCarteDeLaProduction` (`js/planification-carte.js:8398`). Modifier le texte ici le change dans la carte à la prochaine ouverture.
- **Ce que lisent les étudiant·es** : la feuille de consignes, la rétroaction et la synthèse lisent toujours `production.objectif` : **rien ne change pour elles et eux**. Le plan de cours exporté lit les objectifs de leçon par `objectifsDeLecon` (`js/planification-export.js:149`, `:471`, `:1916`) : une ligne liée y imprimera le texte de la production (question 4).
- **Cas multiples** :
  - un objectif de production qui contient plusieurs buts est lié **en entier**, comme une seule ligne. Le découper ligne par ligne ferait glisser les liens dès qu'on modifie le texte (c'est le défaut que `appliquerObjectifs` combat déjà pour la leçon). Qui veut des objectifs plus fins les écrit dans la leçon, sans lien ;
  - une production peut être reprise par plusieurs leçons, et une leçon peut reprendre plusieurs productions : une ligne par lien.
- **Ce qui voyage** :
  - production partagée, importée, reprise : inchangée ;
  - carte gardée en bibliothèque ou envoyée à un·e collègue : la ligne garde son `texte`. Sans la production, elle s'affiche comme un objectif ordinaire. Rien ne se vide ;
  - carte reprise au trimestre suivant : le lien doit suivre la règle du pont existant (effacé si la production n'est pas là, gardé si l'import sélectif a conservé son identifiant), le texte reste. Cette règle est à étendre au lien d'objectif (§ 1, point 5). Recoudre par `idOriginal` serait possible, mais je ne l'ai pas vérifié et je ne le propose pas dans ce lot.
- **Le stock** : rien n'est relié d'office (question 8). Quand une évaluation désigne une production dont l'objectif est identique à un objectif de sa leçon, l'Inspecteur de l'évaluation propose « Relier » (proposé) ; s'ils diffèrent, rien n'est proposé, puisque l'enseignant·e peut viser deux choses. Le relevé du § 5 dit combien de cas existent.
- **Le cinquième parcours, étape 4** (je ne la pose pas) : « Ta production porte déjà un objectif d'apprentissage : si c'est celui que vise cette leçon, reprends-le ici. » deviendrait, par exemple : « Ta production porte déjà un objectif d'apprentissage : si c'est celui que vise cette leçon, touche « Reprendre l'objectif d'une production » et choisis-la. La ligne suivra toujours le texte de ta production. » La condition d'avance (« la leçon a un objectif écrit ») tient : une ligne liée a un texte.

## 3. La compétence : la mesure

| Constat | Verdict | Où |
|---|---|---|
| Fiche : `numeroCompetence`, `competence`, `elementsCompetence` (un élément par ligne) | Tient | `index.html:6290`, `:6294`, `:6461` ; `js/trimestre-v2-cours.js:681-684`, `:1140-1142` ; entité `js/entites/cours-entite.js:99-101` |
| Lus par l'aperçu du cours et le modèle de relecture par IA | Tient | `js/cours.js:303` ; `js/planification-export.js:1904-1907`, `:2213-2219`. Aussi recopiés dans le miroir `infoCours` (`js/entites/groupe-cours.js:205-207`), que rien ne relit pour la compétence ; `js/migrations.js:598-600` est une migration ponctuelle de l'ancien format, pas un lecteur |
| Le bloc Compétence n'a qu'un titre et une description libres | Tient | `js/planification-carte.js:3121-3134` (création), `:3236-3237` (Inspecteur) |
| La carte est rattachée à un cours par `coursId` dans l'entrée d'index | Tient | `js/planification-donnees.js:55-64`, porte d'écriture `:80-95`, résolution contre la collection vivante `:104-116` |
| La fiche n'en porte qu'une | Tient | Un champ texte d'une ligne |

### Ce que j'ajoute

1. **Le double existe aussi dans le modèle de relecture par IA.** Il écrit « ## Le cours » avec la compétence de la fiche, puis « ## Compétences et idées maîtresses de la carte » avec le titre des blocs (`js/planification-export.js:2206-2228`) : deux textes qui peuvent se contredire, envoyés à l'IA.
2. **Le plan de cours exporté n'imprime pas la compétence** (`construirePlan`, `:536-610`, ne parcourt que séquences et leçons). Le deuxième lien ne change donc **rien de ce que lisent les étudiant·es**.
3. **La fiche est globale, la carte ne l'est pas.** `cours` n'est jamais préfixée ; une carte reprise garde son `coursId` si le cours existe (`js/planification-donnees.js:533-544`). Une carte importée de la bibliothèque prend le cours **actif** de l'importateur, jamais celui de l'auteur (`:356-359`).
4. **Un service n'a pas de compétence** : passer une fiche en service l'efface, après confirmation (`js/trimestre-v2-cours.js:1095-1103`, `:1243-1247`). Un bloc lié à une telle fiche retombe sur son propre titre.
5. **Le titre du bloc est lu directement** à de nombreux endroits (68 lignes `.titre` dans `planification-carte.js` et `planification-export.js`, nœuds et productions confondus). Afficher la fiche à la place du titre demande soit une porte de lecture, soit un titre rafraîchi à l'ouverture de la carte. C'est un choix technique que je trancherai à l'étape 2 ; la seule contrainte qui te concerne : le titre que tu as écrit n'est jamais effacé.
6. **Le guide de la carte** dit « Double-clique dessus pour écrire l'énoncé de compétence » (`js/planification-carte.js:1922`). Le lien change aussi cette phrase ; elle est déjà inscrite au backlog par la consigne du cinquième parcours.

## 4. La compétence : la proposition

- **Ce qui fait foi** : la fiche du cours (question 5). On n'écrit la compétence qu'à un endroit : Cadre › Trimestre.
- **Le sens et le geste** : de la carte vers la fiche, par le `coursId` qui existe déjà. Un bloc Compétence créé dans une carte rattachée à un cours dont la fiche porte une compétence **naît lié**. Si la fiche est vide, ou la carte non rattachée, le bloc naît libre, comme aujourd'hui. Un bloc libre propose « Relier à la fiche du cours » dès que c'est possible. Le modèle : `metadata.lieFicheCours: true` sur le bloc ; son `titre` reste en place comme repli.
- **Dans la carte** : le bloc affiche le numéro et l'énoncé de la fiche. Son Inspecteur montre les éléments en lecture seule et « Modifier dans la fiche du cours » / « Délier » (libellés proposés). Délier recopie l'énoncé courant dans le titre. Un clone du bloc doit suivre le même lien : à vérifier à l'étape 2 (`propagerModification`, `js/planification-carte.js:4009`).
- **La permutation Compétence ↔ Idée maîtresse** (`definirTypeNoeud`, `js/planification-carte.js:1604-1617`) change le type et garde toute la metadata : un drapeau de lien survivrait sur une idée maîtresse. À l'étape 2, la porte de permutation retire le lien (avec recopie de l'énoncé dans le titre, comme « Délier »), et tout lecteur teste aussi `type === 'competence'`.
- **Dans la fiche** : rien de nouveau à l'écran. Modifier l'énoncé change le bloc à la prochaine ouverture de la carte.
- **Le modèle de relecture par IA** : un bloc lié ne répète plus l'énoncé de la fiche ; il renvoie à « Le cours ». Les deux textes ne peuvent plus se contredire.
- **Cas multiples** : une seule compétence liée par carte ; une deuxième reste un bloc libre (question 6).
- **Ce qui voyage** :
  - fiche : globale, elle suit tous les trimestres ; elle n'est pas dans les schémas de partage ;
  - carte reprise : le `coursId` suit, le lien tient ;
  - carte partagée à un·e collègue : le lien se lit contre **son** cours actif. Si sa fiche porte une compétence, son bloc l'affiche ; sinon il affiche le titre de l'auteur. C'est le seul cas où un texte change sans geste ; il touche une carte qui n'est pas encore la sienne, et c'est cohérent avec la règle actuelle du rattachement à l'import.
- **Le stock** : aucun bloc existant n'est relié d'office (question 8). Si le titre du bloc et la fiche diffèrent, l'Inspecteur montre les deux avant « Relier ». Exemple réel de la démo : bloc « Analyser un texte littéraire » (`js/demo-namespace.js:65`) contre l'exemple de la fiche « Analyser des textes littéraires » (`index.html:6294`).
- **Le cinquième parcours, étape 1** (je ne la pose pas) : « touche « Compétence » dans la palette « Nœuds », puis écris son énoncé, tel que le devis ministériel décrit la compétence et ses éléments » deviendrait, par exemple : « touche « Compétence » dans la palette « Nœuds » : le bloc reprend la compétence de la fiche de ton cours (Cadre › Trimestre). Si ta fiche ne la porte pas encore, écris-y son énoncé et ses éléments, tels que le devis ministériel les décrit. » La condition d'avance (« un bloc Compétence a un énoncé ») doit alors compter l'énoncé de la fiche pour un bloc lié.

## 5. Le relevé du stock, à lancer sur le Mac

Lecture seule : la fonction ne reçoit qu'une fonction de lecture et la liste des clés, elle n'écrit rien. Elle ne sort que des comptes et des identifiants de cartes et de blocs, aucun texte ni aucun nom. Dans la console de l'app :

```js
function releverStockDeuxLiens(lire, cles) {
    const norm = (t) => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
    const NOM = 'planification_mindmap';
    const sortie = { trimestres: {}, cours: null };

    // --- Partie 2 : les fiches de cours (collection globale `cours`) ---
    const cours = Array.isArray(lire('cours')) ? lire('cours') : [];
    const fiches = cours.filter(c => c && c.nature !== 'service');
    const coursParId = {};
    cours.forEach(c => { if (c && c.id) coursParId[c.id] = c; });
    sortie.cours = {
        fiches: fiches.length,
        services: cours.filter(c => c && c.nature === 'service').length,
        avecCompetence: fiches.filter(c => norm(c.competence)).length,
        avecNumero: fiches.filter(c => norm(c.numeroCompetence)).length,
        avecElements: fiches.filter(c => norm(c.elementsCompetence)).length
    };

    cles.filter(k => k === NOM || k.endsWith('_' + NOM)).forEach(k => {
        const prefixe = k === NOM ? '(clé nue)' : k.slice(0, -(NOM.length + 1));
        const donnees = lire(k);
        if (!donnees || !donnees.cartes) return;
        // Même repli que idsProductionsVivantes (planification-donnees.js:481).
        const propre = k === NOM ? null : lire(prefixe + '_productions');
        const prods = propre || lire('productions');
        const productions = Array.isArray(prods) ? prods : [];
        const prodParId = {};
        productions.forEach(p => { if (p && p.id) prodParId[p.id] = p; });
        const textesProd = new Set(productions.map(p => norm(p && p.objectif)).filter(Boolean));

        const r = {
            productionsDeLaCleNue: !propre && Array.isArray(prods),
            productions: productions.length,
            prodAvecObjectif: productions.filter(p => p && norm(p.objectif)).length,
            prodObjectifMultiligne: productions.filter(p => p && /\n/.test(String(p.objectif || '').trim())).length,
            cartes: 0, lecons: 0, objectifsLecon: 0,
            objectifsLeconEgauxAUnObjectifDeProduction: 0,
            evaluations: 0, evalAvecProduction: 0, evalProductionVivante: 0, evalProductionAvecObjectif: 0,
            evalObjectifProdEgalAUnObjectifVerifie: 0, evalObjectifProdEgalAUnObjectifDeLaCarte: 0,
            evalObjectifProdSansEgal: 0,
            blocsCompetence: 0, cartesRattachees: 0, cartesRattachementOrphelin: 0, cartesRattacheesAUnService: 0,
            competenceIdentiqueAFiche: 0, competenceDifferenteDeFiche: 0,
            competenceFicheVide: 0, competenceCarteNonRattachee: 0, competenceCarteDUnService: 0,
            detail: []
        };
        const index = (donnees.index && Array.isArray(donnees.index.cartes)) ? donnees.index.cartes : [];
        Object.keys(donnees.cartes).forEach(carteId => {
            const carte = donnees.cartes[carteId] || {};
            const noeuds = Array.isArray(carte.noeuds) ? carte.noeuds : [];
            r.cartes++;
            const entree = index.find(e => e && e.id === carteId) || {};
            const fiche = entree.coursId ? coursParId[entree.coursId] : null;
            if (entree.coursId) {
                r.cartesRattachees++;
                if (!fiche) r.cartesRattachementOrphelin++;
                else if (fiche.nature === 'service') r.cartesRattacheesAUnService++;
            }

            const objParId = {};
            const textesCarte = new Set();
            noeuds.forEach(n => {
                if (!n || n.type !== 'lecon') return;
                r.lecons++;
                const objs = (n.metadata && Array.isArray(n.metadata.objectifs)) ? n.metadata.objectifs : [];
                objs.forEach(o => {
                    if (!o || typeof o.texte !== 'string') return;
                    r.objectifsLecon++;
                    if (o.id) objParId[o.id] = norm(o.texte);
                    textesCarte.add(norm(o.texte));
                    if (textesProd.has(norm(o.texte))) r.objectifsLeconEgauxAUnObjectifDeProduction++;
                });
            });
            noeuds.forEach(n => {
                if (!n) return;
                if (n.type === 'evaluation') {
                    r.evaluations++;
                    const pid = n.metadata && n.metadata.productionId;
                    if (!pid) return;
                    r.evalAvecProduction++;
                    const p = prodParId[pid];
                    if (!p) return;
                    r.evalProductionVivante++;
                    const t = norm(p.objectif);
                    if (!t) return;
                    r.evalProductionAvecObjectif++;
                    const verifies = (n.metadata && Array.isArray(n.metadata.objectifsServis) ? n.metadata.objectifsServis : [])
                        .map(id => objParId[id]).filter(Boolean);
                    if (verifies.indexOf(t) !== -1) r.evalObjectifProdEgalAUnObjectifVerifie++;
                    else if (textesCarte.has(t)) r.evalObjectifProdEgalAUnObjectifDeLaCarte++;
                    else r.evalObjectifProdSansEgal++;
                }
                if (n.type === 'competence') {
                    r.blocsCompetence++;
                    let etat;
                    if (!entree.coursId || !fiche) etat = 'competenceCarteNonRattachee';
                    else if (fiche.nature === 'service') etat = 'competenceCarteDUnService';
                    else if (!norm(fiche.competence)) etat = 'competenceFicheVide';
                    else if (norm(fiche.competence).toLowerCase() === norm(n.titre).toLowerCase()) etat = 'competenceIdentiqueAFiche';
                    else etat = 'competenceDifferenteDeFiche';
                    r[etat]++;
                    r.detail.push({ carteId, noeudId: n.id, etat, clone: !!n.cloneSourceId });
                }
            });
        });
        sortie.trimestres[prefixe] = r;
    });
    return sortie;
}
console.log(JSON.stringify(releverStockDeuxLiens(k => db.getSync(k), db.keysSync()), null, 1));
```

**Vérifié comment** : exécuté sous Node contre la copie de secours de test (`tests/fixtures/copies-de-secours-1.172.0/copie-de-secours.json` : 1 carte démo, 1 bloc Compétence non rattaché, 11 productions avec objectif, 0 objectif de leçon), puis contre le jeu fictif de l'annexe, qui passe par chaque branche : 27 assertions vertes, dont « le relevé n'écrit rien » (les données sont identiques avant et après). Break-test : trois mutants (comparaison aux objectifs vérifiés neutralisée, services retirés de l'index des cours, repli sur la clé nue retiré), trois rouges. Corrigé après la relecture : une carte rattachée à un service n'est plus comptée comme orpheline, et un trimestre sans clé préfixée lit la clé nue `productions`, comme `idsProductionsVivantes` (`js/planification-donnees.js:481`). Non lancé dans un navigateur : `db.keysSync()` et `db.getSync()` sont pris tels que `js/db.js:1121` et le reste du code les emploient.

**Ce que les chiffres décideront** : si `competenceDifferenteDeFiche` et `evalObjectifProdEgalAUnObjectifDeLaCarte` sont à zéro chez Grégoire, la proposition « Relier » sur le stock n'a presque rien à faire et peut rester minimale.

## 6. À inscrire au BACKLOG

Deux entrées, demandées par la consigne. La session du Mac les inscrira à la fusion, sous le prochain numéro.

1. **Relier l'objectif d'une production et l'objectif de leçon de la carte d'alignement.** Décision de Grégoire du 8 nov., 10 h 35 : « les deux éléments devraient être reliés ». Un lien, pas une copie. Mesure et proposition : `plans de travail/RAPPORT-2026-11-09-deux-liens-vers-la-carte.md`, § 1 et 2. Code après son accord. Le cinquième parcours (étape 4) en dépend.
2. **Relier la compétence de la fiche du cours et le bloc Compétence de la carte d'alignement.** Décision de Grégoire du 8 nov., 10 h 43 : « de la même façon ». Mesure et proposition : même rapport, § 3 et 4. Code après son accord. Le cinquième parcours (étape 1) en dépend.

## 7. Les mots proposés (aucun posé, aucun validé)

- Zone 🎯 de la leçon : « Reprendre l'objectif d'une production ».
- Ligne liée : « Modifier dans la production », « Délier ».
- Fiche de production : « Repris dans la carte : leçon « … », semaine N ».
- Inspecteur d'une évaluation (stock) : « Relier ».
- Bloc Compétence : « Modifier dans la fiche du cours », « Délier », « Relier à la fiche du cours ».
- Les deux phrases du cinquième parcours, aux § 2 et 4.

## 8. Trouvailles, et ce qu'elles deviennent

- **Une carte importée de la bibliothèque garde des `productionId` morts** (`importerDepuisBibliotheque` n'applique pas le contrôle de vivacité de la reprise, `js/planification-donnees.js:519-529`). Conséquence observable, corrigée après relecture : le modèle de relecture par IA écrit « Production : introuvable dans ce trimestre » (`js/planification-export.js:2154-2155`), ce qui est exact ; les autres lecteurs rendent null. Aucun symptôme vécu connu : **inscrire et continuer** seulement si Grégoire le vit. Rien porté au backlog.
- **La reprise d'une carte perd ses liens évaluation → production** quand la production a été reprise par la bibliothèque (nouvel identifiant, `idOriginal` jamais consulté) ; par l'import sélectif, le lien tient. C'est réel, mais aucun symptôme vécu par Grégoire n'est connu : **inscrire et continuer** seulement s'il le vit. Je le signale ici sans le porter au backlog (règle du 24 août).
- **Le run de push GitHub de la 1.237.2 est rouge à l'étape du verdict** (relevé de l'audit de début de session : 28 rouges dont 22 connus, quatre nouveaux). Hors mandat : signalé, non touché.

## 9. Relecture par un agent neuf

La règle 9 de la nuit la demande aux sessions qui codent ; celle-ci ne code pas. Une relecture adverse des affirmations factuelles a quand même été confiée à un agent neuf, sur `bd33c9ca`. **Verdict, en une ligne : les citations tiennent, mais une prémisse était fausse (« productionId morts sans conséquence »), deux chemins qui cassent la proposition n'étaient pas nommés (reprise des liens d'objectif, permutation Compétence ↔ Idée maîtresse), et le relevé rangeait les cartes rattachées à un service parmi les orphelines.** Les quatre points sont corrigés dans cette version (§ 1.4, § 1.5, § 4, § 5, § 8), ainsi que trois mineurs (lecteurs de la fiche, compte des `.titre`, lecteurs de l'objectif de production).

## Annexe : la vérification du relevé

Le relevé (§ 5) enregistré sous `releve-stock.js` avec `module.exports = { releverStockDeuxLiens };` à la fin, puis `node verif-releve.js ./releve-stock.js` :

```js
// Vérification du relevé : un jeu fictif qui passe par chaque branche.
const assert = require('assert');
const { releverStockDeuxLiens } = require(process.argv[2]);
const d = {
  cours: [{ id: 'c1', competence: 'Analyser des textes', numeroCompetence: '4EF0', elementsCompetence: 'a\nb' },
          { id: 'c2', competence: '' }, { id: 's', nature: 'service' }],
  productions: [{ id: 'PN', objectif: 'Nue' }],
  h2026_productions: [{ id: 'P1', objectif: 'Lire  finement' }, { id: 'P2', objectif: 'Écrire' },
                      { id: 'P3', objectif: 'Rien\nDeux' }, { id: 'P4', objectif: '' }],
  h2026_planification_mindmap: { index: { cartes: [{ id: 'k1', coursId: 'c1' }, { id: 'k2', coursId: 'c2' },
      { id: 'k3', coursId: 'mort' }, { id: 'k4' }, { id: 'k5', coursId: 's' }] }, cartes: {
    k1: { noeuds: [
      { id: 'L1', type: 'lecon', metadata: { objectifs: [{ id: 'o1', texte: 'Lire finement' }, { id: 'o2', texte: 'Écrire' }] } },
      { id: 'E1', type: 'evaluation', metadata: { productionId: 'P1', objectifsServis: ['o1'] } },
      { id: 'E2', type: 'evaluation', metadata: { productionId: 'P2', objectifsServis: ['o1'] } },
      { id: 'E3', type: 'evaluation', metadata: { productionId: 'P3' } },
      { id: 'E4', type: 'evaluation', metadata: { productionId: 'PX' } },
      { id: 'E5', type: 'evaluation', metadata: { productionId: 'P4' } },
      { id: 'C1', type: 'competence', titre: 'analyser des  textes' },
      { id: 'C2', type: 'competence', titre: 'Autre chose', cloneSourceId: 'C1' }] },
    k2: { noeuds: [{ id: 'C3', type: 'competence', titre: 'X' }] },
    k3: { noeuds: [{ id: 'C4', type: 'competence', titre: 'X' }] },
    k4: { noeuds: [{ id: 'C5', type: 'competence', titre: 'X' }] },
    k5: { noeuds: [{ id: 'C6', type: 'competence', titre: 'X' }] } } },
  a2025_planification_mindmap: { index: { cartes: [] }, cartes: { k9: { noeuds: [
      { id: 'E9', type: 'evaluation', metadata: { productionId: 'PN' } }] } } },
  planification_mindmap: { index: { cartes: [] }, cartes: { k0: { noeuds: [] } } }
};
const gele = JSON.stringify(d);
const r = releverStockDeuxLiens(k => (d[k] === undefined ? null : d[k]), Object.keys(d));
assert.strictEqual(JSON.stringify(d), gele, 'le relevé n’écrit rien');
assert.deepStrictEqual(r.cours, { fiches: 2, services: 1, avecCompetence: 1, avecNumero: 1, avecElements: 1 });
const t = r.trimestres.h2026;
const attendu = { productionsDeLaCleNue: false, prodAvecObjectif: 3, prodObjectifMultiligne: 1, objectifsLecon: 2,
  objectifsLeconEgauxAUnObjectifDeProduction: 2, evaluations: 5, evalAvecProduction: 5, evalProductionVivante: 4,
  evalProductionAvecObjectif: 3, evalObjectifProdEgalAUnObjectifVerifie: 1, evalObjectifProdEgalAUnObjectifDeLaCarte: 1,
  evalObjectifProdSansEgal: 1, blocsCompetence: 6, cartesRattachees: 4, cartesRattachementOrphelin: 1,
  cartesRattacheesAUnService: 1, competenceIdentiqueAFiche: 1, competenceDifferenteDeFiche: 1,
  competenceFicheVide: 1, competenceCarteNonRattachee: 2, competenceCarteDUnService: 1 };
Object.keys(attendu).forEach(c => assert.strictEqual(t[c], attendu[c], c));
assert.strictEqual(r.trimestres.a2025.productionsDeLaCleNue, true);
assert.strictEqual(r.trimestres.a2025.evalProductionVivante, 1);
assert.ok(r.trimestres['(clé nue)'], 'la clé nue est relevée');
console.log('OK : ' + (Object.keys(attendu).length + 6) + ' assertions');
```
