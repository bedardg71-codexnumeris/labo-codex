/* ===============================================================
   REGISTRE LONGITUDINAL (#915, 17 sept. 2026)
   ===============================================================
   Suivre un·e élève d'un trimestre à l'autre. Grégoire inscrit au registre les élèves
   qu'il veut suivre dans la durée ; chaque inscription fige une copie DATÉE de leur
   dossier d'évaluation (sans blobs), et accueille les notes obtenues ensuite dans les
   cours qui suivent. Cadrage : plans de travail/CADRAGE-2026-09-17-soir-registre-
   longitudinal.md (v2), relu et corrigé le même soir.

   RANGEMENT — `registreLongitudinal`, clé GLOBALE (inscrite à CLES_GLOBALES dans
   trimestres.js) : un élève traverse les trimestres, sa fiche ne peut pas vivre dans
   l'un d'eux. Forme :
     { format: 'registre-longitudinal', version: 1,
       eleves: { [da]: { da, nom, prenom, inscritLe, dossiers: [...], resultatsUlterieurs: [...] } },
       modeles: { grilles: { ['<trimestre>:<grilleId>']: copie }, echelles: { ... } } }
   Format DISTINCT de `codex-data` v1 (js/codex-data.js), qui est par groupe-cours archivé
   et lu depuis la Réserve ; celui-ci est par élève et lu depuis les trimestres vivants.
   Seul écrivain : ce fichier, par `db.set` (le seuil IndexedDB est automatique dans db.js).
   Sans semis : un registre absent ou illisible se LIT comme vide, il ne s'écrit pas.

   PÉRENNITÉ (mesurée au cadrage) : la clé figure dans l'export complet (db.keys()),
   survit à supprimerTrimestre, n'est PAS dans la Réserve (par trimestre). L'écran le dit.

   LA CAPTURE (lot 2) EST EN LECTURE SEULE SUR LES TRIMESTRES. Elle lit par
   `cleSource(nomCle, trimestreId)` (trimestres.js) — jamais en changeant le trimestre
   actif — et n'écrit que `registreLongitudinal`. Les indices sont LUS au stockage tels
   qu'ils y sont, jamais recalculés : `calculerEtStockerIndicesCP` ÉCRIT, et écrire dans un
   trimestre (archivé ou non) est exactement ce que ce module s'interdit. Un indice absent
   donne `null`, et l'écran le dira. Le mode archive de l'app garde les données du
   trimestre ; le registre n'en fait pas partie : la capture ne demande aucune permission.

   CE QU'UN DOSSIER EMPORTE (un par trimestre-cours où Grégoire a eu l'élève) : les
   évaluations de ce DA, les grilles et échelles qu'elles référencent (COPIE intégrale
   rangée UNE fois par trimestre dans `modeles`, plus une empreinte dans le dossier pour
   détecter la dérive future — MESURÉ le 18 sept. sur le pack démo : la copie par dossier
   pesait 15,5 Ko sur 58, répétée pour chaque élève), les présences de ce DA, les
   interventions où ce DA figure (notes individuelles réduites à ce DA), ses instantanés
   hebdomadaires et d'intervention, ses indices tels que stockés (C/P, assiduité, paliers
   RàI), sa sélection de portfolio. Il LAISSE les blobs (copies, PDF, annotations).

   LES RÉSULTATS ULTÉRIEURS (lot 3, 18 sept. 2026) — la note finale d'un·e ancien·ne élève dans
   un cours qui suit, transmise par la Direction des études et saisie À LA MAIN. Ils vivent
   sous l'élève (`resultatsUlterieurs: [{ cours, trimestre, note }]`), `cours` et `trimestre`
   en TEXTE LIBRE (ce cours-là a été donné par quelqu'un d'autre). Ce module ABSORBE
   l'ancien resultats-ulterieurs.js (#913) et son bloc du Cadre, retirés au même lot.

   LE STOCK DE #913 — `<trim>_resultatsUlterieurs` = { [da]: [...] }, écrit par le bloc du Cadre
   du 17 au 18 sept. Il est LU, JAMAIS RÉÉCRIT NI EFFACÉ (écrire dans les données de quelqu'un
   remonte à Grégoire). Tant qu'un·e inscrit·e ne porte pas `reprise913`, l'écran montre
   l'union (ses résultats + ce stock, sans doublon) ; la COPIE dans le registre se fait au
   premier GESTE qui écrit pour cet·te élève (inscrire, refaire la copie, ajouter, retirer),
   jamais à l'ouverture de l'écran — qui ne fait que lire. Après la reprise, le registre fait
   foi pour ce DA : un résultat retiré ne revient pas par l'ancienne clé (l'export de recherche
   lit le même drapeau, trimestres.js). Limite connue et assumée : retirer l'élève du registre
   puis le réinscrire reprend de nouveau le stock du Cadre, puisqu'il n'a pas bougé.

   LE DOSSIER DÉPLIÉ (lot 4, 18 sept. 2026) — sous chaque inscrit·e, un <details> « Voir le dossier » : par trimestre-cours,
   les indices TELS QUE RANGÉS à la copie (mesuré : C et P sont sur 0-100, A sur 0-1, `noteConstructible` vit sur `actuel`),
   puis les évaluations en ordre chronologique — une TUILE chacune, en flux côte à côte (la règle `.badges-centres` du
   profil), critères et rétroaction dépliés DANS la tuile — avec le libellé du niveau lu dans l'échelle COPIÉE au
   registre (`modeles`) — donc tel qu'il était à la copie, même si l'échelle du trimestre a bougé depuis. AUCUNE analyse,
   aucun calcul neuf, aucun graphique (cadrage § 5.3) : arrondir un pourcentage pour l'écrire n'est pas un calcul d'indice.
   Les interventions et les instantanés hebdomadaires sont dans la copie mais pas encore à l'écran (rendu minimal du § 5.3).

   ÉCRAN — Labo › Suivi longitudinal (config.js, navigation.js, index.html). Rendu bâti par
   le DOM (textContent) : les mots viennent de MOTS, les noms d'élèves du stock. Les champs
   de saisie portent `.rl-champ` : l'exception NOMMÉE de la garde CSS du mode archive
   (index.html) — le registre n'est la donnée d'aucun trimestre.
   =============================================================== */

(function () {
    'use strict';

    const NOM_CLE = 'registreLongitudinal';
    const FORMAT = 'registre-longitudinal';
    const VERSION = 1;
    const NOM_CLE_913 = 'resultatsUlterieurs'; // l'ancienne clé namespacée de #913 : LUE par lireDe, jamais écrite
    const LONGUEUR_MAX_TEXTE = 40;
    const MAX_RESULTATS_RECHERCHE = 30;
    const CLES_BLOBS = ['fichiersTravaux', 'annotationsTravaux', 'corbeilleFichiers', 'archivesBundles'];

    // Les mots de l'écran, en UN seul endroit. Supposition nommée : proposés par Claude Code,
    // lus par l'enseignant·e seulement — aucun élève ne les voit. La phrase de pérennité est
    // celle du cadrage v2 § 3.
    const MOTS_RESULTATS = ['résultat ultérieur', 'résultats ultérieurs'];

    /** « 1 séance », « 32 séances » : un seul accord pour tout l'écran (0 ou 1 → singulier). */
    function accorder(n, formes) {
        return n + ' ' + (Math.abs(Number(n)) >= 2 ? formes[1] : formes[0]);
    }

    const MOTS = Object.freeze({
        sousTitre: 'Les élèves que tu suis d\'un trimestre à l\'autre : une copie figée de leur dossier, et les notes qu\'ils obtiennent ensuite.',
        perennite: 'Le registre voyage dans ton codex ; pas dans l\'archive d\'un groupe-cours.',
        rechercheTitre: 'Inscrire un·e élève',
        rechercheAide: 'Cherche par nom, dans tous les trimestres de l\'application.',
        recherchePlaceholder: 'Nom ou prénom…',
        aucunResultat: 'Aucun·e élève ne porte ce nom.',
        tropDeResultats: 'Précise le nom : seuls les 30 premiers sont affichés.',
        aucunTrimestre: 'Aucun trimestre dans l\'application.',
        inscrire: 'Inscrire au registre',
        // #917 (retour de Grégoire, 18 sept. 2026) : « Re-capturer » ne disait ni ce que fait le geste ni ce qu'il
        // laisse intact. Le dialogue nomme l'élève, la copie remplacée, et ce qui ne bouge pas. Mots validés par Grégoire.
        recapturer: 'Refaire la copie',
        confirmerRecapture: (nomComplet, dateCopie) => 'Refaire la copie du dossier de ' + nomComplet + ' ? '
            + (dateCopie ? 'La copie du ' + dateCopie : 'La copie précédente')
            + ' sera remplacée par l\'état d\'aujourd\'hui, et l\'ancienne ne pourra pas être retrouvée. '
            + 'Tes trimestres ne sont pas modifiés ; la date d\'inscription et les résultats ultérieurs sont conservés.',
        captureFaite: 'Copie du',
        aucunInscrit: 'Aucun·e élève inscrit·e au registre.',
        inscritLe: 'Inscrit·e le',
        indiceAbsent: 'non calculé au moment de la copie',
        refusInconnu: 'Cet·te élève n\'est dans aucun trimestre.',
        // Formes [singulier, pluriel], accordées par accorder() — 0 ou 1 : singulier.
        evaluations: ['évaluation', 'évaluations'],
        seances: ['séance', 'séances'],
        grilles: ['grille', 'grilles'],
        dossiers: ['dossier', 'dossiers'],
        resultats: MOTS_RESULTATS,
        // La saisie : les mots du bloc #913, relus et confirmés par Grégoire le 17 sept. 2026.
        saisieTitre: 'Résultats ultérieurs',
        saisieAide: 'Les notes que ces élèves ont obtenues dans les cours qui ont suivi.',
        saisieSansInscrit: 'Inscris d\'abord un·e élève : ses résultats se rangent sous son nom.',
        eleve: 'Élève',
        cours: 'Cours',
        exempleCours: '601-102-MQ',
        trimestre: 'Trimestre',
        exempleTrimestre: 'H2026',
        note: 'Note finale',
        ajouter: 'Ajouter',
        retirer: 'Retirer',
        refusNote: 'La note doit être un nombre entre 0 et 100.',
        refusTexte: 'Indique le cours et le trimestre.',
        refusEleve: 'Choisis un·e élève inscrit·e au registre.',
        inscritsTitre: 'Élèves inscrit·es',
        // Le dossier déplié (lot 4). Mots relus par Grégoire avec Cowork le 18 sept. 2026 ; un seul corrigé (1.146.1).
        voirDossier: 'Voir le dossier',
        indicesTitre: 'Indices au moment de la copie',
        assiduite: 'Assiduité',
        completion: 'Complétion',
        performance: 'Performance',
        periodes: ['période', 'périodes'],
        noteNonConstructible: 'note impossible à calculer au moment de la copie',
        evaluationsTitre: 'Évaluations',
        aucuneEvaluation: 'Aucune évaluation dans cette copie.',
        productionSansNom: 'Production sans nom',
        noteFinale: 'Note',
        remplacee: 'remplacée par une reprise',
        retroaction: 'Rétroaction',
        statut: 'statut',
        programme: 'programme',
        // Le stock de #913. Mots relus et corrigés par Grégoire avec Cowork le 18 sept. 2026 (1.146.1).
        duCadre: 'saisi dans le Cadre',
        enAttenteTitre: 'Ces élèves ont des résultats saisis dans le Cadre, avant que le registre existe :',
        enAttenteAide: 'Inscris-les pour retrouver leurs résultats sous leur nom. D\'ici là, rien n\'est perdu : ils restent dans leur trimestre et dans l\'export de recherche.',
        // Décision 3.1 (Grégoire, 18 sept. 2026) : retirer du registre « pour corriger une erreur » — un geste de
        // réparation : il confirme, et il DIT ce qu'il emporte.
        retirerDuRegistre: 'Retirer du registre',
        // Mode anonymisation (bogue signalé par Grégoire le 28 sept. 2026) : le nom d'élève que l'écran peut dire.
        pseudonyme: (rang) => 'Élève R' + rang,
        // Texte de Grégoire (1.146.1). L'accord « Son résultat… sera effacé » / « Ses N résultats… seront effacés » porte sur
        // toute la phrase : accorder() ne suffit pas ici, d'où les deux formes écrites.
        confirmerRetrait: (nomComplet, texteDossiers, dateCopie, resultats, nbDuCadre) => 'Retirer ' + nomComplet + ' du registre ? '
            + 'Sa copie' + (dateCopie ? ' du ' + dateCopie : '') + ' (' + texteDossiers + ') sera effacée et ne pourra pas être retrouvée. '
            + (resultats.length === 1
                ? 'Son résultat ultérieur sera effacé aussi : ' + resultats.join(' ; ') + '. '
                : resultats.length
                    ? 'Ses ' + resultats.length + ' résultats ultérieurs seront effacés aussi : ' + resultats.join(' ; ') + '. '
                    : 'Aucun résultat ultérieur n\'a été saisi pour cet·te élève. ')
            + (nbDuCadre ? 'Ce qui avait été saisi dans le Cadre reste rangé dans son trimestre. ' : '')
            + 'Tes trimestres ne sont pas modifiés.'
    });

    // Mémoire de SÉANCE, jamais écrite : l'élève choisi dans la recherche.
    let daChoisi = '';
    let dernierResume = null;
    // Mémoire de SÉANCE de la ligne de saisie, jamais écrite : trente notes du même cours au même
    // trimestre ne retapent que la note ; l'élève passe au suivant.
    let daSaisie = '';
    let dernierCours = '';
    let dernierTrimestre = '';

    /* ---------- Lecture du registre ---------- */

    function registreVide() {
        return { format: FORMAT, version: VERSION, eleves: {}, modeles: { grilles: {}, echelles: {} } };
    }

    /** Lit le registre tel qu'il est rangé ; une valeur absente, étrangère ou d'un autre format se lit comme vide, sans rien écrire. */
    function lireRegistre() {
        const brut = db.getSync(NOM_CLE, null);
        if (!brut || typeof brut !== 'object' || brut.format !== FORMAT
            || !brut.eleves || typeof brut.eleves !== 'object' || Array.isArray(brut.eleves)) {
            return registreVide();
        }
        if (!brut.modeles || typeof brut.modeles !== 'object') brut.modeles = { grilles: {}, echelles: {} };
        if (!brut.modeles.grilles || typeof brut.modeles.grilles !== 'object') brut.modeles.grilles = {};
        if (!brut.modeles.echelles || typeof brut.modeles.echelles !== 'object') brut.modeles.echelles = {};
        return brut;
    }

    /** Les élèves inscrits, triés par nom puis prénom — en anonymisation, par pseudonyme : l'ordre alphabétique trahirait les noms. */
    function elevesInscrits() {
        const eleves = lireRegistre().eleves;
        const liste = Object.keys(eleves)
            .map((da) => eleves[da])
            .filter((e) => e && typeof e === 'object');
        const pseudos = pseudonymes();
        if (pseudos) return liste.sort((a, b) => nomAffiche(a, pseudos).localeCompare(nomAffiche(b, pseudos), 'fr', { numeric: true }));
        return liste.sort((a, b) => String(a.nom || '').localeCompare(String(b.nom || ''), 'fr')
                || String(a.prenom || '').localeCompare(String(b.prenom || ''), 'fr'));
    }

    /* ---------- Lecture des trimestres — LECTURE SEULE, par cleSource ---------- */

    function lireDe(trimestreId, nomCle, defaut) {
        const valeur = db.getSync(cleSource(nomCle, trimestreId), null);
        return valeur === null || valeur === undefined ? defaut : valeur;
    }

    /** Tous les trimestres répertoriés, SAUF la démo (élèves fictifs), du plus récent au plus ancien. */
    function trimestresRepertories() {
        const tous = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : db.getSync('trimestres', []);
        return (Array.isArray(tous) ? tous : [])
            .filter((t) => t && t.id && t.id !== 'demo')
            .sort((a, b) => (Number(b.annee) || 0) - (Number(a.annee) || 0)
                || String(b.session || '').localeCompare(String(a.session || '')));
    }

    function coursParId() {
        const cours = db.getSync('cours', []);
        const index = {};
        (Array.isArray(cours) ? cours : []).forEach((c) => { if (c && c.id) index[c.id] = c; });
        return index;
    }

    function codeDuCours(cours) {
        return cours ? String(cours.codeCours || cours.sigle || cours.id || '') : '';
    }

    /**
     * Les élèves de TOUS les trimestres, une entrée par DA : { da, nom, prenom, presences: [{ trimestreId, trimestreNom, coursId, coursCode, groupe }] }.
     * Un DA du collège présent dans deux trimestres donne UNE entrée à deux présences ; un DA fabriqué (#914) n'est
     * partagé par personne et donne la sienne.
     */
    function elevesDeTousLesTrimestres() {
        const cours = coursParId();
        const parDa = new Map();
        trimestresRepertories().forEach((t) => {
            const etudiants = lireDe(t.id, 'groupeEtudiants', []);
            (Array.isArray(etudiants) ? etudiants : []).forEach((e) => {
                if (!e || !e.da) return;
                const da = String(e.da);
                if (!parDa.has(da)) parDa.set(da, { da, nom: String(e.nom || ''), prenom: String(e.prenom || ''), presences: [] });
                const entree = parDa.get(da);
                const coursId = e.coursId || '';
                if (entree.presences.some((p) => p.trimestreId === t.id && p.coursId === coursId)) return;
                entree.presences.push({ trimestreId: t.id, trimestreNom: String(t.nom || t.id), coursId, coursCode: codeDuCours(cours[coursId]), groupe: String(e.groupe || '') });
            });
        });
        return Array.from(parDa.values())
            .sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenom.localeCompare(b.prenom, 'fr'));
    }

    /* ---------- Mode anonymisation : le nom que l'écran peut dire ---------- */

    function anonymisation() {
        return typeof window.estModeAnonymisation === 'function' && window.estModeAnonymisation();
    }

    /**
     * Le pseudonyme d'un·e élève dans le registre : « Élève R<rang> ». Le registre traverse les trimestres, alors
     * que `anonymiserNom` ne connaît que le trimestre actif (un DA d'H2026 y devient « Étudiant Inconnu », le même
     * pour tous). Le rang suit l'ordre des DA (tous les trimestres ET le registre, qui garde un·e élève dont le
     * trimestre n'est plus là) : aucune écriture, rien de dérivé du nom, stable d'un écran à l'autre. Le « R » le
     * sépare des « Élève 12 » du trimestre actif, qui désignent quelqu'un d'autre.
     * Une Map calculée UNE fois par rendu (elle lit tous les trimestres) ; hors anonymisation, null.
     */
    function pseudonymes() {
        if (!anonymisation()) return null;
        const das = new Set(elevesDeTousLesTrimestres().map((e) => e.da));
        Object.keys(lireRegistre().eleves).forEach((da) => das.add(String(da)));
        const ordre = Array.from(das).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
        return new Map(ordre.map((da, i) => [da, MOTS.pseudonyme(i + 1)]));
    }

    function nomAffiche(eleve, pseudos) {
        if (pseudos) return pseudos.get(String(eleve && eleve.da)) || MOTS.pseudonyme('?');
        return String((eleve && eleve.nom) || '') + ', ' + String((eleve && eleve.prenom) || '');
    }

    /** La rétroaction copiée nomme l'élève : en anonymisation, son prénom et son nom deviennent son pseudonyme. */
    function texteAffiche(texte, eleve, pseudos) {
        let sortie = String(texte || '');
        if (!pseudos || !eleve || typeof _remplacerPrenomEntier !== 'function') return sortie;
        const pseudo = nomAffiche(eleve, pseudos);
        [eleve.prenom, eleve.nom].filter(Boolean).map(String).sort((a, b) => b.length - a.length)
            .forEach((mot) => { sortie = _remplacerPrenomEntier(sortie, mot, pseudo, '', 'giu'); });
        return sortie;
    }

    function normaliser(texte) {
        return String(texte == null ? '' : texte).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }

    /** Recherche par nom ou prénom, insensible à la casse et aux accents ; vide → tout le monde. */
    function rechercherEleves(texte) {
        const motif = normaliser(texte);
        return elevesDeTousLesTrimestres()
            .filter((e) => !motif || normaliser(e.nom + ' ' + e.prenom).includes(motif) || normaliser(e.prenom + ' ' + e.nom).includes(motif));
    }

    /* ---------- Résultats ultérieurs : le stock de #913 (LU), la vue, la reprise ---------- */

    function troisChamps(r) {
        return { cours: String(r.cours == null ? '' : r.cours), trimestre: String(r.trimestre == null ? '' : r.trimestre), note: r.note };
    }

    function cleResultat(r) {
        return r.cours + '\u0000' + r.trimestre + '\u0000' + r.note;
    }

    /** Ce que le bloc du Cadre (#913) a rangé pour ce DA, tous trimestres répertoriés confondus, sans doublon. LECTURE SEULE. */
    function stock913(da) {
        const vus = new Set();
        const trouves = [];
        trimestresRepertories().forEach((t) => {
            const tous = lireDe(t.id, NOM_CLE_913, {});
            const liste = tous && typeof tous === 'object' && !Array.isArray(tous) ? tous[String(da)] : null;
            (Array.isArray(liste) ? liste : []).forEach((r) => {
                if (!r || typeof r !== 'object') return;
                const propre = troisChamps(r);
                if (vus.has(cleResultat(propre))) return;
                vus.add(cleResultat(propre));
                trouves.push(propre);
            });
        });
        return trouves;
    }

    /** Les résultats d'un·e inscrit·e TELS QUE L'ÉCRAN LES MONTRE : les siens, plus le stock du Cadre tant qu'il n'a pas été repris. */
    function resultatsDe(eleve) {
        const propres = eleve && Array.isArray(eleve.resultatsUlterieurs) ? eleve.resultatsUlterieurs : [];
        if (!eleve || eleve.reprise913) return propres;
        const vus = new Set(propres.map((r) => cleResultat(troisChamps(r))));
        // `origine: 'cadre'` est posé sur des objets NEUFS (stock913 rend des copies à trois champs, jamais le stock lui-même),
        // et il est RANGÉ POUR DE BON quand reprendreStock913 matérialise cette vue : c'est voulu. C'est la provenance du
        // résultat (ancienne saisie du Cadre, ou ligne neuve), utile au geste « corriger une erreur » ; l'écran la dit avant
        // comme après la reprise. La sentinelle du lot 3 l'exige au stock, DATA-OWNERSHIP la documente, et l'export de
        // recherche ne la sort pas (trois champs recopiés, essai dédié). Remarque de la relecture croisée de Cowork, 18 sept.
        const duCadre = stock913(eleve.da)
            .filter((r) => !vus.has(cleResultat(r)))
            .map((r) => Object.assign(r, { origine: 'cadre' }));
        return propres.concat(duCadre);
    }

    /** La reprise : la vue devient le stock du registre, et le drapeau dit que le registre fait foi. Idempotente ; n'écrit rien elle-même. */
    function reprendreStock913(eleve) {
        if (eleve.reprise913) return;
        eleve.resultatsUlterieurs = resultatsDe(eleve);
        eleve.reprise913 = true;
    }

    /** Les élèves NON inscrit·es dont le Cadre porte des résultats : l'écran les nomme, pour que rien ne dorme sans être vu. */
    function enAttenteDuCadre() {
        const inscrits = lireRegistre().eleves;
        return elevesDeTousLesTrimestres()
            .filter((e) => !inscrits[e.da])
            .map((e) => ({ da: e.da, nom: e.nom, prenom: e.prenom, nb: stock913(e.da).length }))
            .filter((e) => e.nb > 0);
    }

    /** Rend un nombre de 0 à 100 arrondi à une décimale, ou null. La virgule décimale est admise. */
    function lireNote(saisie) {
        const texte = String(saisie == null ? '' : saisie).trim().replace(',', '.');
        // Le motif n'admet ni signe ni exposant : la borne basse (0) est tenue ici, la haute dessous.
        if (!/^\d+(\.\d+)?$/.test(texte)) return null;
        const n = Math.round(Number(texte) * 10) / 10;
        if (n > 100) return null;
        return n;
    }

    function nettoyerTexte(saisie) {
        return String(saisie == null ? '' : saisie).trim().slice(0, LONGUEUR_MAX_TEXTE);
    }

    function formaterNote(note) {
        return String(note).replace('.', ',');
    }

    function libelleResultat(r) {
        return r.cours + ' · ' + r.trimestre + ' · ' + formaterNote(r.note);
    }

    /** Ajoute un résultat sous un·e inscrit·e. Seule écriture : `registreLongitudinal`. Aucune permission d'archive : ce n'est la donnée d'aucun trimestre. */
    async function ajouterResultat(da, saisie) {
        da = String(da || '');
        const registre = lireRegistre();
        const eleve = da ? registre.eleves[da] : null;
        if (!eleve) return { ok: false, refus: MOTS.refusEleve };
        const cours = nettoyerTexte(saisie && saisie.cours);
        const trimestre = nettoyerTexte(saisie && saisie.trimestre);
        if (!cours || !trimestre) return { ok: false, refus: MOTS.refusTexte };
        const note = lireNote(saisie && saisie.note);
        if (note === null) return { ok: false, refus: MOTS.refusNote };
        reprendreStock913(eleve);
        eleve.resultatsUlterieurs = eleve.resultatsUlterieurs.concat([{ cours, trimestre, note }]);
        await db.set(NOM_CLE, registre); // security-ok: texte saisi par l'enseignant·e dans son propre champ, borné à 40 caractères, rendu par textContent
        if (window.signalerEcritureUsager) window.signalerEcritureUsager(NOM_CLE);   // lot F : geste hors témoin (registre)
        return { ok: true };
    }

    /** Retire le résultat de rang `index` DANS LA VUE (celle que l'écran montre) : la reprise d'abord, le retrait ensuite. */
    async function retirerResultat(da, index) {
        da = String(da || '');
        const registre = lireRegistre();
        const eleve = da ? registre.eleves[da] : null;
        if (!eleve) return { ok: false, refus: '' };
        if (!(index >= 0 && index < resultatsDe(eleve).length)) return { ok: false, refus: '' };
        reprendreStock913(eleve);
        eleve.resultatsUlterieurs = eleve.resultatsUlterieurs.filter((r, i) => i !== index);
        await db.set(NOM_CLE, registre); // security-ok: même objet, une entrée en moins
        if (window.signalerEcritureUsager) window.signalerEcritureUsager(NOM_CLE);   // lot F : geste hors témoin (registre)
        return { ok: true };
    }

    /* ---------- Retirer du registre (décision 3.1) ---------- */

    /** Les modèles (grilles, échelles) sont partagés entre élèves d'un même trimestre : ne restent que ceux qu'un dossier référence encore. */
    function purgerModeles(registre) {
        const gardes = { grilles: new Set(), echelles: new Set() };
        Object.keys(registre.eleves).forEach((da) => {
            const dossiers = registre.eleves[da] && Array.isArray(registre.eleves[da].dossiers) ? registre.eleves[da].dossiers : [];
            dossiers.forEach((d) => {
                (d.grillesIds || []).forEach((id) => gardes.grilles.add(d.trimestre + ':' + id));
                (d.echellesIds || []).forEach((id) => gardes.echelles.add(d.trimestre + ':' + id));
            });
        });
        ['grilles', 'echelles'].forEach((sorte) => {
            Object.keys(registre.modeles[sorte]).forEach((k) => { if (!gardes[sorte].has(k)) delete registre.modeles[sorte][k]; });
        });
    }

    /** Efface l'élève du registre : ses dossiers, ses résultats ultérieurs, les modèles devenus orphelins. Les trimestres ne sont pas touchés. */
    async function retirerDuRegistre(da) {
        da = String(da || '');
        const registre = lireRegistre();
        if (!da || !registre.eleves[da]) return { ok: false, refus: '' };
        delete registre.eleves[da];
        purgerModeles(registre);
        await db.set(NOM_CLE, registre); // security-ok: le même registre, un·e élève en moins
        if (window.signalerEcritureUsager) window.signalerEcritureUsager(NOM_CLE);   // lot F : geste hors témoin (registre)
        return { ok: true };
    }

    /* ---------- La capture (LECTURE SEULE sur les trimestres) ---------- */

    function copie(x) {
        return x === undefined ? null : JSON.parse(JSON.stringify(x));
    }

    function empreinteGrille(g) {
        const criteres = Array.isArray(g.criteres) ? g.criteres : [];
        return { id: g.id, nom: String(g.nom || ''), nbCriteres: criteres.length, criteres: criteres.map((c) => ({ id: c.id, nom: String(c.nom || '') })) };
    }

    function empreinteEchelle(ec) {
        const niveaux = Array.isArray(ec.niveaux) ? ec.niveaux : [];
        return { id: ec.id, nom: String(ec.nom || ''), niveaux: niveaux.map((n) => String(n && n.nom != null ? n.nom : n)) };
    }

    /** Un dossier : la copie figée de ce que le trimestre `t` sait de ce DA dans le cours `coursId`. Ne lit que par cleSource. */
    function capturerDossier(da, t, coursId, maintenant) {
        const cours = coursParId()[coursId] || null;
        const etudiants = lireDe(t.id, 'groupeEtudiants', []);
        const fiche = (Array.isArray(etudiants) ? etudiants : []).find((e) => e && String(e.da) === da && (e.coursId || '') === (coursId || '')) || {};

        const evaluations = (lireDe(t.id, 'evaluationsSauvegardees', []) || []).filter((ev) => ev && String(ev.etudiantDA) === da && (!coursId || !ev.coursId || ev.coursId === coursId));
        const grillesIds = new Set(evaluations.map((ev) => ev.grilleId).filter(Boolean));
        const echellesIds = new Set(evaluations.map((ev) => ev.echelleId).filter(Boolean));
        const grilles = (lireDe(t.id, 'grillesTemplates', []) || []).filter((g) => g && grillesIds.has(g.id));
        const echelles = (lireDe(t.id, 'echellesTemplates', []) || []).filter((ec) => ec && echellesIds.has(ec.id));

        const presences = (lireDe(t.id, 'presences', []) || []).filter((p) => p && String(p.da) === da && (!coursId || !p.coursId || p.coursId === coursId));

        const interventions = (lireDe(t.id, 'interventions', []) || [])
            .filter((i) => i && Array.isArray(i.etudiants) && i.etudiants.map(String).includes(da))
            .map((i) => {
                const c = copie(i);
                // Les notes individuelles des AUTRES élèves ne voyagent pas avec ce dossier.
                c.notesIndividuelles = i.notesIndividuelles && i.notesIndividuelles[da] !== undefined ? { [da]: i.notesIndividuelles[da] } : {};
                return c;
            });

        const snapshotsCours = coursId ? db.getSync(cleSource('snapshots', t.id) + '_' + coursId, null) : null;
        const hebdomadaires = (snapshotsCours && Array.isArray(snapshotsCours.hebdomadaires) ? snapshotsCours.hebdomadaires : [])
            .map((s) => {
                const entree = Array.isArray(s.etudiants) ? s.etudiants.find((e) => e && String(e.da) === da) : null;
                return entree ? Object.assign({ id: s.id, dateSeance: s.dateSeance, numSemaine: s.numSemaine != null ? s.numSemaine : s.numeroSemaine }, copie(entree)) : null;
            })
            .filter(Boolean);
        const snapshotsInterventions = (snapshotsCours && Array.isArray(snapshotsCours.interventions) ? snapshotsCours.interventions : [])
            .filter((s) => s && ((s.avant && s.avant[da]) || (s.apres && s.apres[da])))
            .map((s) => ({ id: s.id, date: s.date, type: s.type, titre: s.titre, avant: s.avant ? copie(s.avant[da]) : null, apres: s.apres ? copie(s.apres[da]) : null }));

        const indicesCP = lireDe(t.id, 'indicesCP', {}) || {};
        const indicesA = lireDe(t.id, 'indicesAssiduite', {}) || {};
        const patterns = lireDe(t.id, 'indicesPatternsRaI', {}) || {};
        const portfolios = lireDe(t.id, 'portfoliosEleves', {}) || {};

        return {
            capteLe: maintenant,
            trimestre: t.id,
            trimestreNom: String(t.nom || t.id),
            coursId: coursId || '',
            coursCode: codeDuCours(cours),
            coursNom: cours ? String(cours.nomCours || cours.titre || '') : '',
            groupe: String(fiche.groupe || ''),
            statut: fiche.statut === undefined ? null : fiche.statut,       // copié TEL QUEL (inactif, décrochage, abandon…)
            programme: String(fiche.programme || ''),
            empreinte: { grilles: grilles.map(empreinteGrille), echelles: echelles.map(empreinteEchelle) },
            grilles: copie(grilles),
            echelles: copie(echelles),
            evaluations: copie(evaluations),
            presences: copie(presences),
            interventions,
            snapshots: { hebdomadaires, interventions: snapshotsInterventions },
            // LUS au stockage, jamais recalculés ; null = absent à la capture (l'écran le dit).
            indices: {
                cp: copie(indicesCP[da]),
                assiduite: copie(indicesA.sommatif ? indicesA.sommatif[da] : undefined),
                patternsRaI: copie(patterns[da])
            },
            portfolio: copie(portfolios[da])
        };
    }

    function resumerDossiers(dossiers) {
        const grilles = new Set();
        let nbEvaluations = 0, nbSeances = 0;
        dossiers.forEach((d) => {
            nbEvaluations += d.evaluations.length;
            nbSeances += d.presences.length;
            d.empreinte.grilles.forEach((g) => grilles.add(g.nom || g.id));
        });
        return { nbDossiers: dossiers.length, nbEvaluations, nbSeances, grilles: Array.from(grilles), poidsOctets: JSON.stringify(dossiers).length };
    }

    /**
     * « Inscrire » / « Re-capturer » : capture, en un seul geste, tous les trimestres-cours où ce DA figure.
     * Re-capturer remplace le dossier du même trimestre + cours et garde les autres ; `inscritLe` ne bouge pas.
     * Seule écriture de ce module : `registreLongitudinal`, par db.set.
     */
    async function inscrire(da) {
        da = String(da || '');
        const eleve = elevesDeTousLesTrimestres().find((e) => e.da === da);
        if (!eleve) return { ok: false, refus: MOTS.refusInconnu };
        const maintenant = new Date(Date.now()).toISOString();
        const trimestres = trimestresRepertories();
        const dossiersNeufs = eleve.presences.map((p) => capturerDossier(da, trimestres.find((t) => t.id === p.trimestreId), p.coursId, maintenant));

        const registre = lireRegistre();
        // Les grilles et échelles sont rangées UNE fois par trimestre (modeles), le dossier garde leurs ids et son empreinte.
        let poidsModeles = 0;
        dossiersNeufs.forEach((d) => {
            d.grilles.forEach((g) => { registre.modeles.grilles[d.trimestre + ':' + g.id] = g; poidsModeles += JSON.stringify(g).length; });
            d.echelles.forEach((ec) => { registre.modeles.echelles[d.trimestre + ':' + ec.id] = ec; poidsModeles += JSON.stringify(ec).length; });
            d.grillesIds = d.grilles.map((g) => g.id);
            d.echellesIds = d.echelles.map((ec) => ec.id);
            delete d.grilles;
            delete d.echelles;
        });
        const existant = registre.eleves[da];
        const dossiersGardes = (existant && Array.isArray(existant.dossiers) ? existant.dossiers : [])
            .filter((d) => !dossiersNeufs.some((n) => n.trimestre === d.trimestre && n.coursId === d.coursId));
        registre.eleves[da] = {
            da,
            nom: eleve.nom,
            prenom: eleve.prenom,
            inscritLe: existant && existant.inscritLe ? existant.inscritLe : maintenant.slice(0, 10),
            dossiers: dossiersGardes.concat(dossiersNeufs),
            resultatsUlterieurs: existant && Array.isArray(existant.resultatsUlterieurs) ? existant.resultatsUlterieurs : []
        };
        if (existant && existant.reprise913) registre.eleves[da].reprise913 = true;
        // Lot 3 : ce que le Cadre (#913) avait rangé pour ce DA est recopié ici, une fois ; l'ancienne clé ne bouge pas.
        reprendreStock913(registre.eleves[da]);
        await db.set(NOM_CLE, registre); // security-ok: copie de données déjà rangées par l'app, aucune source externe ; rendu par textContent
        if (window.signalerEcritureUsager) window.signalerEcritureUsager(NOM_CLE);   // lot F : geste hors témoin (registre)
        const resume = resumerDossiers(dossiersNeufs);
        resume.poidsModelesOctets = poidsModeles;
        return { ok: true, resume, recapture: !!existant };
    }

    /** Mesure (pas une estimation) : le poids structuré et le poids des blobs d'un trimestre, en caractères JSON, pour le rapport du lot 2. */
    function mesurerPoidsTrimestre(trimestreId) {
        const prefixe = trimestreId + '_';
        let structure = 0, blobs = 0;
        const cles = typeof localStorage !== 'undefined' ? Object.keys(localStorage) : [];
        if (db.memoryCache && typeof db.memoryCache.keys === 'function') Array.from(db.memoryCache.keys()).forEach((k) => { if (!cles.includes(k)) cles.push(k); });
        cles.filter((k) => k.startsWith(prefixe)).forEach((k) => {
            const valeur = db.getSync(k, null);
            const taille = valeur === null ? 0 : JSON.stringify(valeur).length;
            if (CLES_BLOBS.some((b) => k.startsWith(prefixe + b))) blobs += taille; else structure += taille;
        });
        return { trimestreId, structure, blobs };
    }

    /* ---------- Rendu (bâti par le DOM : aucun innerHTML) ---------- */

    function poser(parent, balise, classe, texte) {
        const el = document.createElement(balise);
        if (classe) el.className = classe;
        if (texte) el.textContent = texte;
        parent.appendChild(el);
        return el;
    }

    function formaterDate(iso) {
        const texte = String(iso || '');
        return texte.length >= 10 ? texte.slice(0, 10) : texte;
    }

    function libellePresence(p) {
        return p.trimestreNom + (p.coursCode ? ' (' + p.coursCode + (p.groupe ? ', gr. ' + p.groupe : '') + ')' : '');
    }

    function formaterResume(resume) {
        const parts = [accorder(resume.nbEvaluations, MOTS.evaluations), accorder(resume.nbSeances, MOTS.seances)];
        if (resume.grilles.length) parts.push(accorder(resume.grilles.length, MOTS.grilles) + ' : ' + resume.grilles.join(', '));
        parts.push(accorder(resume.nbDossiers, MOTS.dossiers) + ', ' + Math.round(resume.poidsOctets / 1024) + ' Ko');
        return parts.join(' · ');
    }

    function rendreRecherche(zone) {
        zone.textContent = '';
        poser(zone, 'h3', 'rl-titre', MOTS.rechercheTitre);
        poser(zone, 'p', 'texte-aide', MOTS.rechercheAide);
        if (!trimestresRepertories().length) {
            poser(zone, 'p', 'etat-vide-liste', MOTS.aucunTrimestre);
            return;
        }
        // type="search" : le seul type d'input que la garde CSS du mode archive laisse ouvert — et ce champ ne touche aucun trimestre.
        const champ = poser(zone, 'input', 'controle-form rl-recherche');
        champ.type = 'search';
        champ.id = 'rl-recherche';
        champ.setAttribute('placeholder', MOTS.recherchePlaceholder);
        champ.setAttribute('autocomplete', 'off');
        champ.setAttribute('data-on-input', 'rechercherEleveLongitudinal');
        poser(zone, 'ul', 'rl-resultats').id = 'rl-resultats';
        poser(zone, 'div', 'rl-choix').id = 'rl-choix';
        rendreResultats('');
        rendreChoix();
    }

    function rendreResultats(texte) {
        const liste = document.getElementById('rl-resultats');
        if (!liste) return;
        liste.textContent = '';
        const motif = normaliser(texte);
        if (!motif) return; // rien tapé : rien listé (200 noms n'ont pas à s'afficher d'un coup)
        const trouves = rechercherEleves(motif);
        const pseudos = pseudonymes();
        if (!trouves.length) {
            poser(liste, 'li', 'rl-vide', MOTS.aucunResultat);
            return;
        }
        trouves.slice(0, MAX_RESULTATS_RECHERCHE).forEach((e) => {
            const li = poser(liste, 'li', 'rl-resultat');
            const bouton = poser(li, 'button', 'rl-resultat-bouton');
            bouton.type = 'button';
            bouton.setAttribute('data-action', 'choisirEleveLongitudinal');
            bouton.dataset.da = e.da;
            poser(bouton, 'span', 'rl-nom', nomAffiche(e, pseudos));
            poser(bouton, 'span', 'rl-meta', e.presences.map(libellePresence).join(' · '));
        });
        if (trouves.length > MAX_RESULTATS_RECHERCHE) poser(liste, 'li', 'rl-vide', MOTS.tropDeResultats);
    }

    function rendreChoix() {
        const zone = document.getElementById('rl-choix');
        if (!zone) return;
        zone.textContent = '';
        if (!daChoisi) return;
        const eleve = elevesDeTousLesTrimestres().find((e) => e.da === daChoisi);
        if (!eleve) return;
        const inscrit = lireRegistre().eleves[daChoisi];
        const dejaInscrit = !!inscrit;
        const nomComplet = nomAffiche(eleve, pseudonymes());
        poser(zone, 'p', 'rl-nom', nomComplet);
        poser(zone, 'p', 'rl-meta', eleve.presences.map(libellePresence).join(' · '));
        // #917 : une fois l'élève inscrit·e, refaire la copie est le geste RARE — il quitte le style principal.
        // La cible de 44 px vient du design system (.btn sous pointer: coarse), pas d'une classe d'ici.
        const bouton = poser(zone, 'button', dejaInscrit ? 'btn btn-secondaire' : 'btn btn-principal', dejaInscrit ? MOTS.recapturer : MOTS.inscrire);
        bouton.type = 'button';
        bouton.id = 'rl-inscrire';
        bouton.setAttribute('data-action', 'inscrireEleveLongitudinal');
        bouton.dataset.da = daChoisi;
        if (dejaInscrit) {
            const derniereCopie = (Array.isArray(inscrit.dossiers) ? inscrit.dossiers : []).map((d) => d.capteLe || '').sort().pop();
            // Posé par setAttribute, lu par confirm() dans le dispatcher : du texte, jamais du HTML.
            bouton.setAttribute('data-confirm', MOTS.confirmerRecapture(nomComplet, formaterDate(derniereCopie)));
        }
        if (dernierResume && dernierResume.da === daChoisi) {
            poser(zone, 'p', 'rl-resume', formaterResume(dernierResume.resume) + ' — ' + MOTS.captureFaite + ' ' + formaterDate(dernierResume.quand));
        }
    }

    /* ---------- Le dossier déplié (lot 4) : LIT le registre, n'écrit rien, ne calcule aucun indice ---------- */

    /** « D — En Développement » : le libellé vient de l'échelle COPIÉE au registre ; un code sans libellé reste un code. */
    function libelleNiveau(code, echelle) {
        if (code === undefined || code === null || code === '') return '';
        const niveaux = echelle && Array.isArray(echelle.niveaux) ? echelle.niveaux : [];
        const niveau = niveaux.find((nv) => nv && String(nv.code) === String(code));
        return niveau && niveau.nom ? code + ' — ' + niveau.nom : String(code);
    }

    function pourcent(valeur) {
        return Math.round(Number(valeur)) + ' %';
    }

    /** Les indices tels que rangés : A sur 0-1 (indicesAssiduite.sommatif), C et P sur 0-100 (indicesCP.actuel). */
    function lignesIndices(indices) {
        const lignes = [];
        const a = indices && indices.assiduite;
        if (a === null || a === undefined) lignes.push(MOTS.assiduite + ' : ' + MOTS.indiceAbsent);
        else {
            // #743 (lot D, 19 sept. 2026) : l'entrée est copiée TELLE QUE RANGÉE ; sans période offerte elle est
            // INCONNUE — y compris le stock d'avant ce lot (`indice: 1, nombreSeances: 0`), qui se lisait 100 %.
            const indiceA = typeof window.lireIndiceAssiduite === 'function'
                ? window.lireIndiceAssiduite(a)
                : (typeof a === 'object' ? a.indice : a);
            if (indiceA === null || indiceA === undefined) {
                lignes.push(MOTS.assiduite + ' : ' + MOTS.indiceAbsent);
            } else {
                const detail = typeof a === 'object' && a.periodesOffertes ? ' (' + a.periodesPresentes + ' sur ' + accorder(a.periodesOffertes, MOTS.periodes) + ')' : '';
                lignes.push(MOTS.assiduite + ' : ' + pourcent(Number(indiceA) * 100) + detail);
            }
        }
        const actuel = indices && indices.cp && indices.cp.actuel ? indices.cp.actuel : null;
        if (!actuel) {
            lignes.push(MOTS.completion + ' : ' + MOTS.indiceAbsent);
            lignes.push(MOTS.performance + ' : ' + MOTS.indiceAbsent);
            return lignes;
        }
        lignes.push(MOTS.completion + ' : ' + pourcent(actuel.C || 0));
        const constructible = actuel.noteConstructible !== false && !(actuel.details && actuel.details.noteConstructible === false);
        lignes.push(MOTS.performance + ' : ' + (constructible ? pourcent(actuel.P || 0) : MOTS.noteNonConstructible));
        return lignes;
    }

    /**
     * Une évaluation = une TUILE (retour de Grégoire à la porte des lots 3-4, 18 sept. 2026 : le dossier « prend beaucoup
     * d'espace vertical » ; il demande des blocs côte à côte, comme les badges d'« Engagement ACP » du profil). Le flux est
     * celui de `.badges-centres` (styles.css), réutilisé tel quel. La tuile EST le <details> : son en-tête — production,
     * date, note et niveau — sert de <summary>, donc AUCUN mot neuf ; critères et rétroaction se déplient DEDANS. Une
     * évaluation qui n'a ni critère ni rétroaction est une tuile simple : un triangle qui n'ouvrirait sur rien mentirait.
     */
    function rendreEvaluation(liste, ev, echelles, eleve, pseudos) {
        const echelle = echelles[ev.echelleId] || null;
        const criteres = (Array.isArray(ev.criteres) ? ev.criteres : []).filter(Boolean);
        const depliable = criteres.length > 0 || !!ev.retroactionFinale;
        const tuile = poser(liste, depliable ? 'details' : 'div', 'rl-tuile');
        const entete = poser(tuile, depliable ? 'summary' : 'div', 'rl-tuile-entete' + (depliable ? ' rl-cible' : ''));
        poser(entete, 'span', 'rl-nom', String(ev.productionNom || MOTS.productionSansNom));
        if (ev.dateEvaluation) poser(entete, 'span', 'rl-meta', formaterDate(ev.dateEvaluation));
        const note = [];
        if (ev.noteFinale !== undefined && ev.noteFinale !== null && ev.noteFinale !== '') note.push(MOTS.noteFinale + ' : ' + formaterNote(ev.noteFinale));
        // #941 lot S1 (décision A) — une copie en points : ni niveau général, ni niveau par critère.
        const enPoints = typeof evaluationEnPoints === 'function' && evaluationEnPoints(ev);
        if (ev.niveauFinal && !enPoints) note.push(libelleNiveau(ev.niveauFinal, echelle));
        if (note.length) poser(entete, 'span', 'rl-tuile-note', note.join(' · '));
        const contexte = [];
        if (ev.grilleNom) contexte.push(String(ev.grilleNom));
        if (ev.remplaceeParId) contexte.push(MOTS.remplacee);
        if (contexte.length) poser(entete, 'span', 'rl-meta', contexte.join(' · '));
        if (!depliable) return;
        if (criteres.length) {
            const ul = poser(tuile, 'ul', 'rl-criteres');
            criteres.forEach((c) => {
                const niveau = (typeof c.points === 'number')
                    ? `${c.points} / ${c.ponderation}`
                    : libelleNiveau(c.niveauSelectionne !== undefined ? c.niveauSelectionne : c.niveau, echelle);
                poser(ul, 'li', '', String(c.critereNom || c.nom || c.critereId || c.id || '') + (niveau ? ' : ' + niveau : ''));
            });
        }
        if (ev.retroactionFinale) {
            poser(tuile, 'p', 'rl-sous-titre', MOTS.retroaction);
            poser(tuile, 'p', 'rl-retroaction-texte', texteAffiche(ev.retroactionFinale, eleve, pseudos));
        }
    }

    /** Le dossier d'un·e inscrit·e, replié par défaut. Rend, n'écrit rien. */
    function rendreDossier(li, eleve, modeles, pseudos) {
        const dossiers = Array.isArray(eleve.dossiers) ? eleve.dossiers : [];
        if (!dossiers.length) return;
        const details = poser(li, 'details', 'rl-dossier');
        poser(details, 'summary', 'rl-cible', MOTS.voirDossier);
        dossiers.forEach((d) => {
            const bloc = poser(details, 'section', 'rl-dossier-bloc');
            poser(bloc, 'h4', 'rl-titre', libellePresence({ trimestreNom: d.trimestreNom || d.trimestre, coursCode: d.coursCode, groupe: d.groupe }));
            const meta = [MOTS.captureFaite + ' ' + formaterDate(d.capteLe)];
            if (d.statut) meta.push(MOTS.statut + ' : ' + d.statut);
            if (d.programme) meta.push(MOTS.programme + ' : ' + d.programme);
            poser(bloc, 'p', 'rl-meta', meta.join(' · '));
            poser(bloc, 'h5', 'rl-sous-titre', MOTS.indicesTitre);
            const ulIndices = poser(bloc, 'ul', 'rl-indices');
            lignesIndices(d.indices).forEach((ligne) => poser(ulIndices, 'li', '', ligne));
            const evaluations = (Array.isArray(d.evaluations) ? d.evaluations.slice() : [])
                .sort((x, y) => String(x.dateEvaluation || '9999').localeCompare(String(y.dateEvaluation || '9999')));
            poser(bloc, 'h5', 'rl-sous-titre', MOTS.evaluationsTitre + ' (' + evaluations.length + ')');
            if (!evaluations.length) { poser(bloc, 'p', 'rl-meta', MOTS.aucuneEvaluation); return; } // pas .etat-vide-liste : centré, 200 px de haut par bloc vide (mesuré)
            const echelles = {};
            (d.echellesIds || []).forEach((id) => { echelles[id] = modeles.echelles[d.trimestre + ':' + id] || null; });
            // Le flux des badges du profil (`.badges-centres` : flex, wrap, gap 10 px), aligné à gauche et en haut par `.rl-tuiles` :
            // l'ordre du DOM reste l'ordre chronologique, lu de gauche à droite puis de haut en bas.
            const liste = poser(bloc, 'div', 'badges-centres rl-tuiles');
            evaluations.forEach((ev) => rendreEvaluation(liste, ev, echelles, eleve, pseudos));
        });
    }

    function champSaisie(formulaire, libelle, balise, nom) {
        const etiquette = poser(formulaire, 'label', '', libelle);
        const champ = poser(etiquette, balise, 'controle-form rl-champ');
        champ.name = nom;
        if (balise === 'input') {
            champ.type = 'text';
            champ.setAttribute('autocomplete', 'off');
        }
        return champ;
    }

    /** La ligne de saisie UNIQUE : [ Élève ▾ ] [ Cours ] [ Trimestre ] [ Note ] [ Ajouter ]. Rend, n'écrit rien. */
    function rendreSaisie(zone, refus) {
        zone.textContent = '';
        poser(zone, 'h3', 'rl-titre', MOTS.saisieTitre);
        poser(zone, 'p', 'texte-aide', MOTS.saisieAide);
        const inscrits = elevesInscrits();
        if (!inscrits.length) {
            poser(zone, 'p', 'etat-vide-liste', MOTS.saisieSansInscrit);
            return;
        }
        if (!inscrits.some((e) => String(e.da) === daSaisie)) daSaisie = String(inscrits[0].da);
        const pseudos = pseudonymes();
        const formulaire = poser(zone, 'form', 'rl-saisie');
        formulaire.setAttribute('novalidate', '');
        const selecteur = champSaisie(formulaire, MOTS.eleve, 'select', 'eleve');
        selecteur.setAttribute('data-on-change', 'choisirEleveSaisieLongitudinal');
        inscrits.forEach((e) => {
            const option = poser(selecteur, 'option', '', nomAffiche(e, pseudos));
            option.value = String(e.da);
            if (String(e.da) === daSaisie) option.selected = true;
        });
        const cours = champSaisie(formulaire, MOTS.cours, 'input', 'cours');
        cours.setAttribute('maxlength', String(LONGUEUR_MAX_TEXTE));
        cours.setAttribute('placeholder', MOTS.exempleCours);
        cours.value = dernierCours;
        const trimestre = champSaisie(formulaire, MOTS.trimestre, 'input', 'trimestre');
        trimestre.setAttribute('maxlength', String(LONGUEUR_MAX_TEXTE));
        trimestre.setAttribute('placeholder', MOTS.exempleTrimestre);
        trimestre.value = dernierTrimestre;
        const note = champSaisie(formulaire, MOTS.note, 'input', 'note');
        note.setAttribute('inputmode', 'decimal');
        note.setAttribute('maxlength', '5');
        // Ni .btn-ajouter ni .btn-supprimer sur cet écran : la garde du mode archive les ferme, et le registre n'est pas un trimestre.
        const bouton = poser(formulaire, 'button', 'btn btn-confirmer btn-sm rl-cible', MOTS.ajouter);
        bouton.type = 'submit';
        bouton.setAttribute('data-action', 'ajouterResultatLongitudinal');
        bouton.setAttribute('data-prevent', '');
        const zoneRefus = poser(zone, 'p', 'rl-refus', refus || '');
        zoneRefus.setAttribute('role', 'alert');
    }

    function rendreEnAttente(zone) {
        const enAttente = enAttenteDuCadre();
        if (!enAttente.length) return;
        const pseudos = pseudonymes();
        const bloc = poser(zone, 'div', 'rl-en-attente');
        poser(bloc, 'p', 'rl-meta', MOTS.enAttenteTitre);
        const liste = poser(bloc, 'ul', 'rl-resultats');
        enAttente.forEach((e) => {
            const li = poser(liste, 'li', 'rl-resultat');
            const bouton = poser(li, 'button', 'rl-resultat-bouton');
            bouton.type = 'button';
            bouton.setAttribute('data-action', 'choisirEleveLongitudinal');
            bouton.dataset.da = e.da;
            poser(bouton, 'span', 'rl-nom', nomAffiche(e, pseudos));
            poser(bouton, 'span', 'rl-meta', accorder(e.nb, MOTS.resultats));
        });
        poser(bloc, 'p', 'texte-aide', MOTS.enAttenteAide);
    }

    function rendreInscrits(zone) {
        zone.textContent = '';
        poser(zone, 'h3', 'rl-titre', MOTS.inscritsTitre);
        const inscrits = elevesInscrits();
        if (!inscrits.length) {
            poser(zone, 'p', 'etat-vide-liste', MOTS.aucunInscrit);
            rendreEnAttente(zone);
            return;
        }
        const liste = poser(zone, 'ul', 'rl-eleves');
        const modeles = lireRegistre().modeles;
        const pseudos = pseudonymes();
        inscrits.forEach((e) => {
            const da = String(e.da || '');
            const nomComplet = nomAffiche(e, pseudos);
            const li = poser(liste, 'li', 'rl-eleve');
            li.dataset.da = da;
            const entete = poser(li, 'div', 'rl-eleve-entete');
            poser(entete, 'span', 'rl-nom', nomComplet);
            const dossiers = Array.isArray(e.dossiers) ? e.dossiers : [];
            const origines = dossiers.map((d) => d.trimestreNom || d.trimestre).filter(Boolean);
            const derniere = dossiers.map((d) => d.capteLe || '').sort().pop();
            const meta = [origines.join(' · '), derniere ? MOTS.captureFaite + ' ' + formaterDate(derniere) : MOTS.inscritLe + ' ' + formaterDate(e.inscritLe)].filter(Boolean).join(' — ');
            poser(entete, 'span', 'rl-meta', meta);

            const resultats = resultatsDe(e);
            // Geste RARE de réparation, répété à chaque rangée : .btn-neutre (gris du design system) — mesuré le 18 sept. à 768 px,
            // .btn-annuler (orange) et .btn-secondaire (bleu plein) dominaient la liste.
            const retrait = poser(entete, 'button', 'btn btn-neutre btn-sm rl-cible', MOTS.retirerDuRegistre);
            retrait.type = 'button';
            retrait.setAttribute('data-action', 'retirerEleveLongitudinal');
            retrait.dataset.da = da;
            // Posé par setAttribute, lu par confirm() dans `retirerEleveLongitudinal` : du texte, jamais du HTML. Il DIT
            // ce qu'il emporte. #1007 (2a-2) : plus `data-confirm` (le dispatcher, synchrone, la posait AVANT le codex proposé).
            retrait.setAttribute('data-question', MOTS.confirmerRetrait(nomComplet, accorder(dossiers.length, MOTS.dossiers), formaterDate(derniere),
                resultats.map(libelleResultat), resultats.filter((r) => r.origine === 'cadre').length));

            rendreDossier(li, e, modeles, pseudos);
            if (!resultats.length) return;
            const sousListe = poser(li, 'ul', 'rl-resultats-ulterieurs');
            resultats.forEach((r, i) => {
                const ligne = poser(sousListe, 'li', 'rl-resultat-ulterieur');
                poser(ligne, 'span', '', libelleResultat(r) + (r.origine === 'cadre' ? ' — ' + MOTS.duCadre : ''));
                const bouton = poser(ligne, 'button', 'btn btn-annuler btn-sm rl-cible', MOTS.retirer);
                bouton.type = 'button';
                bouton.setAttribute('data-action', 'retirerResultatLongitudinal');
                bouton.dataset.da = da;
                bouton.dataset.index = String(i);
            });
        });
        rendreEnAttente(zone);
    }

    function afficherRegistreLongitudinal() {
        const conteneur = document.getElementById('registre-longitudinal-conteneur');
        if (!conteneur) return;
        conteneur.textContent = '';
        poser(conteneur, 'p', 'text-muted', MOTS.sousTitre);
        poser(conteneur, 'p', 'texte-aide', MOTS.perennite);
        const recherche = poser(conteneur, 'section', 'rl-zone-recherche');
        recherche.id = 'rl-zone-recherche';
        rendreRecherche(recherche);
        // La saisie AVANT la liste : la liste grandit (et le lot 4 y déplie les dossiers), la ligne de saisie ne doit pas s'éloigner.
        const saisie = poser(conteneur, 'section', 'rl-zone-saisie');
        saisie.id = 'rl-zone-saisie';
        rendreSaisie(saisie);
        const inscrits = poser(conteneur, 'section', 'rl-zone-inscrits');
        inscrits.id = 'rl-zone-inscrits';
        rendreInscrits(inscrits);
    }

    /** Après un geste qui change le registre : la saisie (son sélecteur d'élèves) et la liste, sans toucher à la recherche en cours. */
    function rafraichirSaisieEtInscrits(refus) {
        const saisie = document.getElementById('rl-zone-saisie');
        if (saisie) rendreSaisie(saisie, refus);
        const inscrits = document.getElementById('rl-zone-inscrits');
        if (inscrits) rendreInscrits(inscrits);
    }

    /** Hook d'affichage du sous-onglet (navigation.js). Lit, rend, n'écrit rien. */
    function initialiserRegistreLongitudinal() {
        afficherRegistreLongitudinal();
    }

    /* ---------- Gestes (dispatchers data-on-input / data-action de main.js : fn(el)) ---------- */

    function rechercherEleveLongitudinal(el) {
        rendreResultats(el && el.value !== undefined ? el.value : '');
    }

    function choisirEleveLongitudinal(el) {
        daChoisi = el && el.dataset ? String(el.dataset.da || '') : '';
        rendreChoix();
    }

    async function inscrireEleveLongitudinal(el) {
        const da = el && el.dataset ? String(el.dataset.da || '') : '';
        const issue = await inscrire(da);
        if (issue.ok) dernierResume = { da, resume: issue.resume, quand: new Date(Date.now()).toISOString() };
        rendreChoix();
        rafraichirSaisieEtInscrits();
        return issue;
    }

    function choisirEleveSaisieLongitudinal(el) {
        daSaisie = el && el.value !== undefined ? String(el.value) : '';
    }

    async function ajouterResultatLongitudinal(el) {
        const formulaire = el && el.closest ? el.closest('form') : null;
        if (!formulaire) return;
        const da = String(formulaire.elements.eleve.value || '');
        const saisie = { cours: formulaire.elements.cours.value, trimestre: formulaire.elements.trimestre.value, note: formulaire.elements.note.value };
        // Ce qui est tapé survit à un refus : seule la note repart vide après un ajout réussi.
        daSaisie = da;
        dernierCours = nettoyerTexte(saisie.cours);
        dernierTrimestre = nettoyerTexte(saisie.trimestre);
        const issue = await ajouterResultat(da, saisie);
        if (issue.ok) {
            // La saisie suivante : la note de l'élève d'après (le cours et le trimestre sont déjà là).
            const das = elevesInscrits().map((e) => String(e.da));
            daSaisie = das[das.indexOf(da) + 1] || da;
        }
        rafraichirSaisieEtInscrits(issue.ok ? '' : issue.refus);
        const champNote = document.querySelector('#rl-zone-saisie input[name="note"]');
        if (champNote) {
            if (!issue.ok) champNote.value = saisie.note;
            champNote.focus();
        }
        return issue;
    }

    async function retirerResultatLongitudinal(el) {
        const da = el && el.dataset ? String(el.dataset.da || '') : '';
        const issue = await retirerResultat(da, Number(el.dataset.index));
        if (issue.ok) rafraichirSaisieEtInscrits();
        return issue;
    }

    /**
     * « Retirer du registre ». #1007 (2a-2) : la question (les mots du bouton, `data-question`)
     * est posée ICI, après le codex proposé ; elle l'était avant, par le dispatcher. Le
     * registre est relu au moment d'écrire (`retirerDuRegistre`).
     */
    async function retirerEleveLongitudinal(el) {
        const da = el && el.dataset ? String(el.dataset.da || '') : '';
        if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('registreLongitudinal'))) return { ok: false, refus: '' };
        if (el && el.dataset && el.dataset.question && !confirm(el.dataset.question)) return { ok: false, refus: '' };
        const issue = await retirerDuRegistre(da);
        if (!issue.ok) return issue;
        if (dernierResume && dernierResume.da === da) dernierResume = null;
        rendreChoix();
        rafraichirSaisieEtInscrits();
        return issue;
    }

    window.MOTS_REGISTRE_LONGITUDINAL = MOTS;
    window.initialiserRegistreLongitudinal = initialiserRegistreLongitudinal;
    window.afficherRegistreLongitudinal = afficherRegistreLongitudinal;
    window.rechercherEleveLongitudinal = rechercherEleveLongitudinal;
    window.choisirEleveLongitudinal = choisirEleveLongitudinal;
    window.inscrireEleveLongitudinal = inscrireEleveLongitudinal;
    window.choisirEleveSaisieLongitudinal = choisirEleveSaisieLongitudinal;
    window.ajouterResultatLongitudinal = ajouterResultatLongitudinal;
    window.retirerResultatLongitudinal = retirerResultatLongitudinal;
    window.retirerEleveLongitudinal = retirerEleveLongitudinal;
    // Pour les bancs : tout sans passer par le DOM. (L'export de recherche, lui, lit la CLÉ — trimestres.js.)
    window.registreLongitudinal = {
        NOM_CLE, FORMAT, VERSION,
        lire: lireRegistre, inscrits: elevesInscrits,
        trimestres: trimestresRepertories, eleves: elevesDeTousLesTrimestres, rechercher: rechercherEleves,
        capturerDossier, inscrire, mesurerPoidsTrimestre,
        lignesIndices, libelleNiveau, resultatsDe, pseudonymes, nomAffiche, stock913, enAttenteDuCadre, ajouterResultat, retirerResultat, retirerDuRegistre, lireNote, accorder
    };
})();
