/* ===============================
   MODULE: TRAVAUX - ARCHIVAGE
   Generation ZIP/PDF, export portfolio

   DEPENDANCES:
   - libs/jszip.min.js (JSZip)
   - travaux-stockage.js
   - travaux-annotation.js (pour aplatir annotations)
   - trimestres.js (cle())
   =============================== */

(function() {
    'use strict';

    /* ===============================
       GENERATION ZIP
       =============================== */

    /**
     * #572 — Assainit un segment de chemin destiné à un ZIP.
     *
     * Les noms de dossiers étaient construits directement depuis le nom et le
     * prénom de l'élève. Un « / » dans un nom (Anne-Marie Roy/Tremblay après un
     * import Léa mal formé, un nom composé saisi à la main) créait une
     * ARBORESCENCE dans l'archive au lieu d'un dossier : les copies de l'élève
     * se retrouvaient éparpillées, et deux élèves pouvaient fusionner dans le
     * même chemin.
     *
     * On remplace tout séparateur ou caractère interdit, on refuse les segments
     * « . » et « .. » (remontée d'arborescence), et on garde les accents : c'est
     * un nom de dossier lu par un humain, pas un identifiant.
     *
     * @param {string} segment - nom brut
     * @returns {string} segment sûr, jamais vide
     */
    function _assainirSegmentChemin(segment) {
        const nettoye = String(segment == null ? '' : segment)
            .replace(/[/\\:*?"<>|]/g, '-')   // séparateurs et interdits Windows
            .replace(/[\x00-\x1F\x7F]/g, '') // caractères de contrôle
            .replace(/^\.+$/, '')            // « . » et « .. » entiers
            .replace(/^\.+/, '')             // point de tête (fichier caché)
            .trim();
        return nettoye || 'sans-nom';
    }

    /**
     * #572 — Construit le nom de la version annotée d'un fichier.
     *
     * L'ancien calcul faisait `nomFichier.replace('.' + ext, '_annote.' + ext)`
     * où `ext` venait de `split('.').pop()`. Sur un fichier SANS extension,
     * `pop()` rend le nom entier, le `replace` ne trouve rien, et le nom annoté
     * est IDENTIQUE à l'original : dans le ZIP, la version annotée écrasait
     * silencieusement la copie d'origine de l'élève.
     *
     * @param {string} nomFichier - nom d'origine
     * @returns {string} nom de la version annotée, toujours distinct
     */
    function _nomVersionAnnotee(nomFichier) {
        const nom = String(nomFichier == null ? '' : nomFichier);
        const pos = nom.lastIndexOf('.');
        // Pas de point, ou point en tête (fichier caché sans extension) :
        // suffixer à la fin plutôt que de tenter un remplacement qui échoue.
        if (pos <= 0) return nom + '_annote';
        return nom.slice(0, pos) + '_annote' + nom.slice(pos);
    }

    /**
     * #948 — L'anonymisation doit se rendre jusqu'aux noms dans l'archive.
     *
     * Avant : en mode anonymisation, `obtenirDonneesSelonMode` rendait bien
     * « Élève 32 » pour le dossier, mais le chemin ajoutait le DA réel, et chaque
     * copie gardait son nom d'origine — le nom Léa de l'élève
     * (`Nom_DA_Artefact_1_Remis_le_….pdf`). Le ZIP sortait de la machine avec
     * les noms et les DA qu'il prétendait masquer.
     *
     * Hors anonymisation, rien ne change.
     */
    function _estAnonymise() {
        return typeof window.estModeAnonymisation === 'function' && window.estModeAnonymisation() === true;
    }

    /**
     * #948 — Le libellé d'un·e élève dans l'archive (dossier, nom du ZIP, bilan).
     * En anonymisation : le nom anonyme SEUL, jamais le DA (le réglage
     * « afficher le DA réel » vaut pour l'écran, pas pour ce qui quitte la machine).
     *
     * @param {Object|undefined} etudiant - fiche lue par `obtenirDonneesSelonMode`
     * @param {string} da - DA réel
     * @param {boolean} avecDA - ajouter le DA hors anonymisation
     * @returns {string} segment assaini
     */
    function _libelleEleve(etudiant, da, avecDA) {
        if (_estAnonymise()) {
            const nomAnonyme = etudiant ? [etudiant.prenom, etudiant.nom].filter(Boolean).join(' ') : '';
            return _assainirSegmentChemin(nomAnonyme || 'Élève non associé');
        }
        if (!etudiant) return _assainirSegmentChemin(da || 'non-associe');
        return _assainirSegmentChemin(`${etudiant.nom}_${etudiant.prenom}` + (avecDA ? `_${da}` : ''));
    }

    /**
     * #948 — Le nom d'une copie dans l'archive. En anonymisation, rien du nom
     * d'origine ne passe, sauf l'extension : `Élève 32_Artefact 1_1.pdf`. Le rang
     * départage les copies d'un même dossier (original et reprise).
     * Ce n'est PAS un doublon à unifier avec `anonymiserNomFichier` (modes.js) :
     * celle-là nomme une copie à l'écran, sans rang ; ici, sans rang, deux
     * copies d'un même dossier s'écraseraient dans le ZIP.
     *
     * @param {Object} fichier - métadonnées du fichier
     * @param {string} libelle - `_libelleEleve(...)`
     * @param {string} titreProduction - titre assaini, ou ''
     * @param {Object} rangs - compteur par dossier, partagé par l'appelant
     * @param {string} dossier - chemin du dossier dans l'archive
     * @returns {string}
     */
    function _nomCopieDansArchive(fichier, libelle, titreProduction, rangs, dossier) {
        if (!_estAnonymise()) return fichier.nomFichier;
        const nom = String(fichier.nomFichier == null ? '' : fichier.nomFichier);
        const pos = nom.lastIndexOf('.');
        const suffixe = pos > 0 ? nom.slice(pos + 1).replace(/[^A-Za-z0-9]/g, '') : '';
        const extension = suffixe ? '.' + suffixe : '';
        rangs[dossier] = (rangs[dossier] || 0) + 1;
        return [libelle, titreProduction, String(rangs[dossier])].filter(Boolean).join('_') + extension;
    }

    /**
     * #948 — Les évaluations jointes à l'archive. En anonymisation, le DA réel
     * est retiré : `etudiantDA` devient le libellé anonyme, les champs
     * `etudiantDAReel` / `etudiantDAffichage` posés par `anonymiserDonnees` sont
     * ôtés. Les textes libres passent par `anonymiserTexteRetroaction`, le même
     * outil que l'écran et le PDF : la rétroaction générée commence par
     * « Bonjour ‹prénom› » et elle est stockée avec le prénom réel.
     * Limite : cet outil remplace les PRÉNOMS, pas les noms de famille.
     */
    function _evaluationsPourArchive(evaluations, etudiants) {
        if (!_estAnonymise()) return evaluations;
        return evaluations.map(e => {
            const copie = Object.assign({}, e);
            const texte = (t) => (typeof t === 'string' && typeof anonymiserTexteRetroaction === 'function')
                ? anonymiserTexteRetroaction(t, e.etudiantDA)
                : t;
            copie.retroactionFinale = texte(e.retroactionFinale);
            copie.notesIntegrite = texte(e.notesIntegrite);
            if (typeof e.motPourEtudiant === 'string') copie.motPourEtudiant = texte(e.motPourEtudiant);   // un mot pour ton étudiant·e
            if (Array.isArray(e.criteres)) {
                copie.criteres = e.criteres.map(c => Object.assign({}, c, { retroaction: texte(c && c.retroaction) }));
            }
            delete copie.etudiantDAReel;
            delete copie.etudiantDAffichage;
            copie.etudiantDA = _libelleEleve(etudiants.find(x => x.da === e.etudiantDA), e.etudiantDA, false);
            return copie;
        });
    }

    /**
     * #891 — Met UN fichier dans une archive : l'original, puis sa version
     * annotée s'il en a une et si on la demande.
     *
     * Un blob absent lève « Blob introuvable » (le mot de l'export PDF,
     * `travaux-export-pdf.js`) au lieu d'être sauté en silence : l'appelant
     * l'attrape, le nomme dans son bilan (#565) et passe au fichier suivant.
     * C'est la seule fonction qui écrit un fichier de copie dans un ZIP — les
     * trois exports de l'écran « Exporter les travaux » et celui du profil
     * passent ici, donc un fichier illisible y est traité de la même façon.
     *
     * @param {Object} conteneur - `JSZip` ou un `zip.folder(...)`
     * @param {Object} fichier - métadonnées du fichier
     * @param {{original: string, annote: (string|null)}} chemins - chemins dans
     *   l'archive ; `annote` à `null` pour ne pas joindre la version annotée
     */
    async function _ajouterFichierAuZip(conteneur, fichier, chemins) {
        const blob = await travauxStockage.recupererBlob(fichier.id);
        if (!blob) {
            // #1028 : le bilan dit « aux archives », jamais « introuvable », pour une copie qui l'est.
            if (window.ReserveCopies && window.ReserveCopies.estAuxArchives(fichier.id)) throw new Error(window.ReserveCopies.MOTS.copie.raison);
            throw new Error('Blob introuvable');
        }
        conteneur.file(chemins.original, blob);

        if (chemins.annote) {
            const annote = await genererFichierAnnote(fichier);
            if (annote) conteneur.file(chemins.annote, annote);
        }
    }

    /**
     * Genere un ZIP contenant les travaux d'un etudiant
     *
     * #891 : un fichier illisible ne fait plus perdre l'archive entière (même
     * modèle que #565 sur l'ancien export du trimestre). `exportes` liste les ids des
     * fichiers RÉELLEMENT mis dans l'archive : l'appelant ne marque que ceux-là.
     *
     * @param {string} da - DA de l'etudiant
     * @param {Object} options - Options d'export
     * @returns {Promise<{blob: Blob, echecs: string[], nbFichiers: number, exportes: string[]}>}
     */
    async function exporterParEtudiant(da, options = {}) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip non disponible');
        }

        const zip = new JSZip();
        const fichiers = travauxStockage.obtenirFichiersEtudiant(da);
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const etudiant = etudiants.find(e => e.da === da);

        const nomDossier = etudiant || _estAnonymise()
            ? _libelleEleve(etudiant, da, true)
            : _assainirSegmentChemin(`etudiant_${da}`);
        const productions = obtenirDonneesSelonMode('productions');
        const rangs = {};

        const dossier = zip.folder(nomDossier);
        const echecs = [];
        const exportes = [];

        for (const fichier of fichiers) {
            const production = productions.find(p => p.id === fichier.productionId);
            const titre = production ? _assainirSegmentChemin(production.titre || production.nom || '') : '';
            const nomCopie = _nomCopieDansArchive(fichier, nomDossier, titre, rangs, '');
            try {
                await _ajouterFichierAuZip(dossier, fichier, {
                    original: `originaux/${nomCopie}`,
                    annote: options.inclureAnnotes ? `annotes/${_nomVersionAnnotee(nomCopie)}` : null
                });
                exportes.push(fichier.id);
            } catch (e) {
                console.error('[Travaux-Archivage] Export étudiant — échec sur ' + nomCopie + ' :', e);
                echecs.push(`${nomDossier} / ${nomCopie} — ${e && e.message ? e.message : e}`);
            }
        }

        // Ajouter les evaluations si demande
        if (options.inclureEvaluations) {
            const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
            const evalsEtudiant = evaluations.filter(e => e.etudiantDA === da);

            if (evalsEtudiant.length > 0) {
                const evalJson = JSON.stringify(_evaluationsPourArchive(evalsEtudiant, etudiants), null, 2);
                dossier.file('evaluations.json', evalJson);
            }
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        return { blob, echecs, nbFichiers: fichiers.length, exportes };
    }

    /**
     * #895 — LE moteur de la carte « Exporter des travaux ».
     *
     * Il y avait deux cartes et deux moteurs pour un même geste : `exporterTravaux`
     * (`élève/fichier`, sans compression) et celui de « Trimestre complet »
     * (`élève/production/fichier`, `_resume.json`, DEFLATE, progression). Une seule carte reste (décision de Grégoire, 17 sept. 2026) ;
     * ce moteur porte les deux arborescences en option, le résumé et la
     * compression. Aucun filtre = tout le groupe : ce n'est plus un refus.
     *
     * Un fichier illisible est sauté et NOMMÉ, dans `echecs` et dans
     * `_resume.json` (#565, #891). `exportes` liste les ids des fichiers
     * RÉELLEMENT mis dans l'archive : l'appelant ne marque que ceux-là.
     *
     * @param {Object} [options]
     * @param {string|null} [options.da] - DA d'un·e élève (null = tous)
     * @param {string|null} [options.productionId] - production (null = toutes)
     * @param {'etudiant-production'|'etudiant'} [options.forme] - arborescence
     * @param {boolean} [options.compression] - DEFLATE (true) ou stockage brut
     * @param {Function} [options.doitArreter] - #949 : lu avant chaque fichier
     *   et après la compression ; vrai = abandon, sans archive
     * @param {Function} [onProgression] - (traites, total)
     * @returns {Promise<{blob: (Blob|null), echecs: string[], nbFichiers: number, exportes: string[], arrete: boolean}>}
     *   `blob` est null quand aucun fichier ne correspond aux filtres, ou quand
     *   l'export a été arrêté (`arrete` vrai, `exportes` vide).
     */
    async function exporterTravaux(options = {}, onProgression) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip non disponible');
        }

        const da = options.da || null;
        const productionId = options.productionId || null;
        const parProduction = options.forme !== 'etudiant';
        const doitArreter = typeof options.doitArreter === 'function' ? options.doitArreter : () => false;
        const compression = options.compression !== false;

        let fichiers = travauxStockage.obtenirFichiersGroupeActif();
        if (da) fichiers = fichiers.filter(f => f.etudiantDA === da);
        if (productionId) fichiers = fichiers.filter(f => f.productionId === productionId);

        if (fichiers.length === 0) {
            return { blob: null, echecs: [], nbFichiers: 0, exportes: [], arrete: false };
        }

        // #949 — un export arrêté ne rend rien : ni archive, ni fichier marqué « exporté ».
        const arret = () => ({ blob: null, echecs: [], nbFichiers: fichiers.length, exportes: [], arrete: true });

        const zip = new JSZip();
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const productions = obtenirDonneesSelonMode('productions');
        const echecs = [];
        const exportes = [];
        const rangs = {};
        let traites = 0;

        for (const fichier of fichiers) {
            if (doitArreter()) return arret();
            // Identité résolue AVANT le try : le bilan doit pouvoir nommer
            // l'élève concerné, pas seulement compter.
            const etudiant = etudiants.find(e => e.da === fichier.etudiantDA);
            const nomEtudiant = _libelleEleve(etudiant, fichier.etudiantDA, true);

            // #891 — même assainissement que les noms d'élèves (#572) : les
            // accents restent (« Écrit 1 » ne devient plus « _crit_1 »).
            const production = productions.find(p => p.id === fichier.productionId);
            const titre = production ? _assainirSegmentChemin(production.titre || production.nom || '') : '';

            let dossier = nomEtudiant;
            if (parProduction) dossier += '/' + (titre || 'sans-production');
            const nomCopie = _nomCopieDansArchive(fichier, nomEtudiant, titre, rangs, dossier);

            try {
                // Toujours inclure les annotations aplaties
                await _ajouterFichierAuZip(zip, fichier, {
                    original: `${dossier}/${nomCopie}`,
                    annote: `${dossier}/${_nomVersionAnnotee(nomCopie)}`
                });
                exportes.push(fichier.id);
            } catch (e) {
                console.error('[Travaux-Archivage] Export — échec sur ' + nomCopie + ' :', e);
                echecs.push(`${nomEtudiant} / ${nomCopie} — ${e && e.message ? e.message : e}`);
            }

            traites++;
            if (onProgression) onProgression(traites, fichiers.length);
        }

        // Toujours inclure les evaluations
        let evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
        if (da) evaluations = evaluations.filter(e => e.etudiantDA === da);
        if (productionId) evaluations = evaluations.filter(e => e.productionId === productionId);
        if (evaluations.length > 0) {
            zip.file('_evaluations.json', JSON.stringify(_evaluationsPourArchive(evaluations, etudiants), null, 2));
        }

        const trimestreActif = obtenirTrimestreActif();
        const resume = {
            export: trimestreActif ? trimestreActif.nom.replace(/\s/g, '_') : 'semestre',
            date: new Date().toISOString(),
            nbFichiers: fichiers.length,
            nbEtudiants: new Set(fichiers.map(f => f.etudiantDA).filter(Boolean)).size,
            nbProductions: new Set(fichiers.map(f => f.productionId).filter(Boolean)).size,
            // #565 — les échecs sont inscrits DANS l'archive : le bilan à
            // l'écran se referme, le fichier reste.
            nbEchecs: echecs.length,
            echecs: echecs
        };
        zip.file('_resume.json', JSON.stringify(resume, null, 2));

        const blob = await zip.generateAsync(compression
            ? { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } }
            : { type: 'blob' });
        // La compression ne s'interrompt pas : un arrêt demandé pendant qu'elle
        // tourne est honoré ici, en jetant l'archive.
        if (doitArreter()) return arret();
        return { blob, echecs, nbFichiers: fichiers.length, exportes, arrete: false };
    }

    /**
     * #566 — LA SÉLECTION DE L'EXPORT LÉA, EN UN SEUL ENDROIT.
     *
     * Le compteur de l'écran (« N évaluation(s) pour N étudiant(s) ») refaisait
     * les étapes 1-2 à sa manière et ne résolvait jamais l'étape 3 : les
     * évaluations SANS fichier, ignorées en silence par l'export, étaient
     * comptées comme des PDF à venir. Deux copies d'une même règle divergent —
     * celle-ci est la seule, et l'export comme le compteur la lisent.
     *
     * Étapes : (1) évaluations actives de la production, dans le groupe-cours
     * actif, filtrées reprises/élève ; (2) une par élève, la reprise l'emportant
     * sur l'originale ; (3) résolution vers le fichier (stricte, #145).
     *
     * #1245 (8 nov. 2026, décision de Grégoire : « que ce soit par Léa ou sur papier, nous avons besoin de produire
     * une rétroaction en format PDF ») — une remise HYBRIDE : dans un même groupe, des copies numérisées et des copies
     * remises sur papier. Les élèves retenus sont ceux du groupe-cours actif (avant : seulement ceux qui avaient au
     * moins une copie importée — un élève évalué uniquement sur papier n'était ni exporté ni compté) ; les élèves
     * supprimés restent écartés (#1013). Une évaluation sans copie donne la synthèse seule.
     *
     * Lot du 9 nov. 2026 (décision de Grégoire, 10 h 00) — L'EXPORT POUR LÉA N'ENVOIE QUE LES ÉVALUATIONS
     * VERROUILLÉES, avec ou sans copie. AVANT : une évaluation non verrouillée partait dans le ZIP (mesuré : son PDF
     * dans le ZIP, le compteur muet sur le verrou). Le choix d'une évaluation par élève se fait d'abord, le verrou
     * ensuite : une reprise non verrouillée (réévaluation en cours) laisse l'élève de côté, son originale ne part pas
     * à sa place. Les laissées de côté sont rendues pour que le compteur le dise.
     *
     * @returns {{ evaluations: Array, fichiers: Array, sansFichier: Array, aLaCorbeille: Array, nonVerrouillees: Array }}
     *   `evaluations` = une par élève, verrouillée ; `fichiers` = les copies importées, qui donneront le PDF annoté
     *   avec sa synthèse ; `sansFichier` = les évaluations sans copie résolue, qui donneront la synthèse seule ;
     *   `aLaCorbeille` = celles de `sansFichier` dont la copie est à la corbeille (#1247, comptées à part) ;
     *   `nonVerrouillees` = celles laissées de côté.
     */
    /** #1245 — les élèves du groupe-cours actif et ceux de ses copies, élèves supprimés écartés (#1013). */
    function _dasDuGroupeActif(fichiers) {
        const supprimes = typeof window.dasElevesSupprimes === 'function' ? window.dasElevesSupprimes() : null;
        const elevesDuGroupe = (typeof obtenirEtudiantsCoursActif === 'function' ? obtenirEtudiantsCoursActif() : []) || [];
        return new Set(fichiers.map(f => f.etudiantDA)
            .concat(elevesDuGroupe.map(e => e.da))
            .filter(Boolean).map(String)
            .filter(da => !supprimes || !supprimes.has(da)));
    }

    function _estReprise(e) {
        return !!(e.repriseDeId || e.jetonRepriseCibleeApplique);
    }

    /**
     * Relecture du 9 nov. 2026 — deux évaluations actives d'un même élève, aucune reprise (un doublon à notes
     * divergentes, que la réconciliation #360 laisse) : la verrouillée l'emporte sur la non verrouillée, quel que
     * soit leur ordre en base. Sans cela, l'élève était laissé de côté quand la non verrouillée venait d'abord.
     */
    function _verrouilleeDevantUnDoublon(existant, e) {
        return !_estReprise(existant) && existant.verrouillee !== true && e.verrouillee === true;
    }

    /**
     * #1247 (décision de Grégoire, 27 nov. 2026, 15 h 19) — la copie de cette évaluation est-elle à la corbeille ? Même
     * résolution que `trouverFichierPourEvaluation` (travaux-resolution.js) : par l'évaluation (ou celle qu'elle reprend),
     * sinon par l'élève et la production. Seule la corbeille garde une trace : une copie supprimée pour de bon n'en
     * laisse aucune, et son évaluation reste comptée « sur papier » (limite assumée, rien n'est ajouté aux évaluations).
     */
    function _copieALaCorbeille(evaluation, corbeille) {
        return corbeille.some((f) => (f.evaluationId && (f.evaluationId === evaluation.id || f.evaluationId === evaluation.repriseDeId))
            || (f.etudiantDA === evaluation.etudiantDA && f.productionId === evaluation.productionId));
    }

    /** #1247 — la corbeille du groupe-cours actif, celle que l'écran montre ; vide si le stockage ne la donne pas. */
    function _corbeilleDuGroupe() {
        return (typeof travauxStockage.obtenirCorbeille === 'function' && travauxStockage.obtenirCorbeille()) || [];
    }

    function selectionnerEvaluationsLea(productionId, da, reprisesSeulement) {
        // #1013 (règle de Grégoire, 4 oct. 2026) : l'export pour Léa ENVOIE, il écarte l'élève
        // supprimé — ni son PDF, ni sa place au compteur de l'écran.
        const fichiers = travauxStockage.obtenirFichiersAffiches() || [];
        const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];

        // Partir des ÉVALUATIONS actives (non remplacées) plutôt que des fichiers,
        // pour que la reprise (et son fichier) parte au lieu de l'originale ;
        // restreindre aux DAs du groupe-cours actif (29 mars 2026) : ses élèves (#1245), et ceux de ses copies.
        const dasGroupeActif = _dasDuGroupeActif(fichiers);

        // Tableau de notation, lot 1 (9 nov. 2026) : un résultat saisi au tableau, sans grille, n'est pas une rétroaction à
        // remettre (ni critères, ni commentaire). Verrouillé pour compter dans la note, il ne part pas pour Léa, et le
        // compteur ne le dit pas « laissé de côté » : il n'a jamais été à envoyer. Sauf si une copie importée l'accompagne
        // (relecture neuve) : la copie annotée reste à remettre, comme avant ce lot.
        const rienARemettre = (e) => e.sansGrille === true
            && !(typeof travauxResolution !== 'undefined' && typeof travauxResolution.trouverFichierPourEvaluation === 'function'
                && travauxResolution.trouverFichierPourEvaluation(e));
        let evalsActives = evaluations.filter(e =>
            e.productionId === productionId && !e.remplaceeParId && dasGroupeActif.has(String(e.etudiantDA))
            && !rienARemettre(e)
        );
        if (reprisesSeulement) {
            evalsActives = evalsActives.filter(e => e.repriseDeId || e.jetonRepriseCibleeApplique);
        }
        if (da) {
            evalsActives = evalsActives.filter(e => e.etudiantDA === da);
        }

        const evalParEtudiant = new Map();
        for (const e of evalsActives) {
            const existant = evalParEtudiant.get(e.etudiantDA);
            if (!existant || _estReprise(e) || _verrouilleeDevantUnDoublon(existant, e)) {
                evalParEtudiant.set(e.etudiantDA, e);
            }
        }

        const retenues = [];
        const fichiersAvecEval = [];
        const sansFichier = [];
        const aLaCorbeille = [];   // #1247 : celles de `sansFichier` dont la copie est à la corbeille
        const corbeille = _corbeilleDuGroupe();
        const nonVerrouillees = [];
        const evaluationDuFichier = new Map();   // relecture du 9 nov. : le PDF porte CETTE évaluation, pas une autre du couple
        for (const evaluation of evalParEtudiant.values()) {
            if (evaluation.verrouillee !== true) { nonVerrouillees.push(evaluation); continue; }
            retenues.push(evaluation);
            const fichier = (typeof travauxResolution !== 'undefined' && typeof travauxResolution.trouverFichierPourEvaluation === 'function')
                ? travauxResolution.trouverFichierPourEvaluation(evaluation)
                : null;
            if (fichier) { fichiersAvecEval.push(fichier); evaluationDuFichier.set(fichier.id, evaluation); }
            else {
                sansFichier.push(evaluation);
                if (_copieALaCorbeille(evaluation, corbeille)) aLaCorbeille.push(evaluation);
            }
        }
        return { evaluations: retenues, fichiers: fichiersAvecEval, sansFichier: sansFichier, aLaCorbeille: aLaCorbeille,
            nonVerrouillees: nonVerrouillees, evaluationDuFichier: evaluationDuFichier };
    }

    // Lot du 9 nov. 2026 : le texte validé par Grégoire quand rien n'est verrouillé (dit seul, rien n'a échoué).
    const TEXTE_LEA_RIEN_DE_VERROUILLE = 'Aucune évaluation verrouillée\u00a0: rien à envoyer. Verrouille les évaluations à remettre, puis relance l\u2019export.';

    /**
     * Genere des PDFs annotes+synthese pour televersement Lea
     * Seuls les fichiers ayant une evaluation completee sont inclus
     * @param {string} productionId - ID de la production
     * @param {string|null} da - DA d'un etudiant specifique (null = tous)
     * @param {boolean} reprisesSeulement - N'exporter que les reprises
     * @param {Function} onProgression - Callback(traites, total)
     * @returns {Promise<{blobs: Array<{blob: Blob, nom: string}>, nomProd: string,
     *   echecs: string[], sansSynthese: string[]}>} Les PDFs generes. #565 :
     *   `echecs` nomme les étudiants dont le PDF n'a PAS pu être produit (le lot
     *   continue), `sansSynthese` ceux dont le PDF part sans sa page de
     *   rétroaction — livrable, mais incomplet, et c'est ce qui partait en
     *   silence sur Léa auparavant.
     */
    async function exporterPourLea(productionId, da, reprisesSeulement, onProgression) {
        const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
        const productions = obtenirDonneesSelonMode('productions');
        const production = productions.find(p => p.id === productionId);
        const nomProd = (production?.titre || production?.nom || 'production')
            .replace(/[^a-zA-ZÀ-ÿ0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        // #566 — la même sélection que le compteur de l'écran.
        const selection = selectionnerEvaluationsLea(productionId, da, reprisesSeulement);
        const fichiersAvecEval = selection.fichiers;
        const surPapier = selection.sansFichier;   // #1245 : la synthèse seule

        if (fichiersAvecEval.length === 0 && surPapier.length === 0) {
            // Lot du 9 nov. 2026 : des évaluations existent, aucune n'est verrouillée — texte validé par Grégoire,
            // affiché seul (sans « L'export Léa a échoué : »), car rien n'a échoué.
            if (selection.nonVerrouillees.length > 0) {
                const rien = new Error(TEXTE_LEA_RIEN_DE_VERROUILLE);
                rien.texteEntier = true;
                throw rien;
            }
            throw new Error('Aucune évaluation trouvée pour ces critères.');
        }

        let traites = 0;
        const total = fichiersAvecEval.length + surPapier.length;
        const blobs = [];
        // #565 — un étudiant en échec ne doit plus emporter le lot entier.
        const echecs = [];
        const sansSynthese = [];

        // Identité et nom de fichier d'un élève : les mêmes pour une copie importée et pour une copie sur papier.
        const identite = (daEleve) => {
            const etudiant = etudiants.find(e => e.da === daEleve);
            const nom = (etudiant?.nom || 'Inconnu').replace(/[^a-zA-ZÀ-ÿ-]/g, '');
            const daEtud = etudiant?.da || daEleve || '0000000';
            // #950 — en anonymisation, ni nom ni DA : le nom anonyme seul (« Élève 32 »), comme
            // l'export des travaux (#948). Avant : `Inconnu_<DA réel>_…` (le nom anonyme est vide).
            const anonyme = _estAnonymise();
            const libelle = anonyme
                ? _libelleEleve(etudiant, daEtud, false)
                : `${etudiant?.prenom ? etudiant.prenom + ' ' : ''}${etudiant?.nom || 'étudiant inconnu'} (${daEtud})`;
            const nomFichier = anonyme
                ? `${libelle}_${nomProd}_Evalue.pdf`
                : `${nom}_${daEtud}_${nomProd}_Evalue.pdf`;
            return { daEtud, libelle, nomFichier };
        };

        for (const fichier of fichiersAvecEval) {
            // Identité résolue AVANT le try : en cas d'échec, le bilan doit
            // pouvoir nommer l'étudiant concerné, pas seulement compter.
            const { daEtud, libelle, nomFichier } = identite(fichier.etudiantDA);

            try {
                // Relecture du 9 nov. — l'évaluation CHOISIE (verrouillée) va au générateur : il retenait sinon la plus
                // récente du couple élève-production, et un doublon non verrouillé partait à sa place.
                const choisie = selection.evaluationDuFichier ? selection.evaluationDuFichier.get(fichier.id) : undefined;
                const { doc, synthese } = await travauxExportPDF.genererDocPDF(fichier.id, productionId, choisie);
                const pdfBlob = doc.output('blob');
                blobs.push({ blob: pdfBlob, nom: nomFichier });

                // La copie part quand même : elle est valide, il lui manque la
                // page de rétroaction. C'est précisément ce qui partait en
                // silence sur Léa avant #565.
                if (synthese && !synthese.ajoutee) {
                    sansSynthese.push(`${libelle} — ${synthese.raison}`);
                }
            } catch (e) {
                console.error('[Travaux-Archivage] Export Léa — échec pour ' + daEtud + ' :', e);
                echecs.push(`${libelle} — ${e && e.message ? e.message : e}`);
            }

            traites++;
            if (onProgression) onProgression(traites, total);
        }

        // #1245 — les copies évaluées sur papier : la synthèse seule, même nom, même ZIP. Sans sa page, il n'y a rien
        // à envoyer : c'est un échec, nommé au bilan.
        for (const evaluation of surPapier) {
            const { daEtud, libelle, nomFichier } = identite(evaluation.etudiantDA);
            try {
                const { doc, synthese } = await travauxExportPDF.genererDocSyntheseSeule(evaluation.etudiantDA, productionId, evaluation);
                if (!doc) {
                    echecs.push(`${libelle} — sur papier : ${(synthese && synthese.raison) || 'la synthèse n\'a pas pu être produite'}`);
                } else {
                    blobs.push({ blob: doc.output('blob'), nom: nomFichier });
                }
            } catch (e) {
                console.error('[Travaux-Archivage] Export Léa — échec (sur papier) pour ' + daEtud + ' :', e);
                echecs.push(`${libelle} — ${e && e.message ? e.message : e}`);
            }

            traites++;
            if (onProgression) onProgression(traites, total);
        }

        return { blobs, nomProd, echecs, sansSynthese };
    }

    /* ===============================
       FICHIER ANNOTE (Aplatir annotations)
       =============================== */

    /**
     * Genere une version annotee d'un fichier
     * Pour les images: dessine les annotations sur l'image
     * Pour les PDF: genere une image annotee par page
     * @param {Object} fichier - Metadonnees du fichier
     * @returns {Promise<Blob|null>} Le fichier annote ou null
     */
    async function genererFichierAnnote(fichier) {
        const annotation = travauxStockage.obtenirAnnotationFichier(fichier.id);
        if (!annotation || Object.keys(annotation.pages || {}).length === 0) {
            return null;
        }

        const blob = await travauxStockage.recupererBlob(fichier.id);
        if (!blob) return null;

        if (fichier.typeMIME.startsWith('image/')) {
            return await aplatirAnnotationsImage(blob, annotation);
        }

        // PDF : utiliser le moteur d'export PDF partage
        if (fichier.typeMIME === 'application/pdf') {
            return await travauxExportPDF.rendrePDFAvecAnnotations(blob, annotation, {
                format: 'pdf', scale: 1.5, quality: 0.85
            });
        }

        return null;
    }

    /**
     * PROPOSÉ (25 nov. 2026, mots que lit l'enseignant·e, à valider par Grégoire) : la raison que le bilan d'un export
     * donne pour une copie en image dont la version annotée n'a pas pu être produite. Le bilan l'écrit après le nom de
     * la copie : « … 1 en échec : • Nom / copie.jpg — <raison> ».
     */
    const RAISON_SANS_VERSION_ANNOTEE = 'sa version annotée n’a pas pu être produite (l’original est dans l’archive)';

    /**
     * Aplatit les annotations sur une image
     *
     * Correctif du 25 nov. 2026 (retour d'essai de Grégoire, iPad) : le dessin des annotations est asynchrone (il
     * attend les images des tampons) et il était appelé sans être attendu ; le JPEG se faisait avant lui, et la
     * version annotée sortait identique à l'original : ni code, ni trait, ni tampon. Il est attendu.
     * Et un échec n'est plus muet ni bloquant : une image illisible, un dessin qui lève, un canevas qui ne rend rien
     * rejettent la promesse (avant, l'image illisible rendait `null`, que l'appelant sautait en silence ; une
     * exception dans le dessin laissait la promesse sans réponse). `_ajouterFichierAuZip` laisse passer le rejet :
     * l'appelant nomme la copie dans son bilan (#565, #891), son original déjà dans l'archive.
     *
     * @param {Blob} imageBlob - L'image originale
     * @param {Object} annotation - Les annotations
     * @returns {Promise<Blob>} L'image avec annotations ; rejetée avec RAISON_SANS_VERSION_ANNOTEE en cas d'échec
     */
    async function aplatirAnnotationsImage(imageBlob, annotation) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(imageBlob);
            const echouer = (cause) => {
                console.warn('[Travaux-Archivage] Version annotée impossible :', cause);
                reject(new Error(RAISON_SANS_VERSION_ANNOTEE));
            };

            img.onload = async () => {
                URL.revokeObjectURL(url);
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');

                    // Dessiner l'image originale
                    ctx.drawImage(img, 0, 0);

                    // Dessiner les annotations de la page 0, et ATTENDRE le dessin avant le JPEG
                    const donnees = annotation.pages[0];
                    if (donnees) {
                        await dessinerAnnotationsSurCanvas(ctx, donnees, img.width, img.height);
                    }

                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else echouer('le canevas n’a rendu aucune image');
                    }, 'image/jpeg', 0.9);
                } catch (e) {
                    echouer(e);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                echouer('image illisible');
            };

            img.src = url;
        });
    }

    /**
     * Dessine des annotations sur un canvas
     * Delegue a la fonction partagee de travaux-export-pdf.js
     * (inclut le rendu des stickers). Asynchrone : rend la promesse du dessin, que l'appelant attend.
     */
    function dessinerAnnotationsSurCanvas(ctx, donnees, w, h) {
        return travauxExportPDF.dessinerAnnotationsSurCtx(ctx, w, h, donnees, 1);
    }

    /* ===============================
       TELECHARGER
       =============================== */

    /**
     * Telecharge un blob comme fichier
     * @param {Blob} blob - Le blob a telecharger
     * @param {string} nomFichier - Le nom du fichier
     */
    function telechargerBlob(blob, nomFichier) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Lance l'export par etudiant et telecharge
     * @param {string} da - DA de l'etudiant
     * @param {Object} options - Options
     */
    async function lancerExportEtudiant(da, options = {}) {
        const _hasProg = typeof window.afficherProgression === 'function';
        if (_hasProg) {
            window.afficherProgression('Export des travaux');
            window.majProgression(20, 'Compression du ZIP…');
        }
        try {
            const { blob, echecs, nbFichiers, exportes } = await exporterParEtudiant(da, options);
            const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
            const etudiant = etudiants.find(e => e.da === da);
            // #572 — assaini aussi ici : ce nom devient celui du FICHIER
            // téléchargé, où un « / » casse l'enregistrement.
            const nom = _libelleEleve(etudiant, da, false);
            // L'archive part MÊME si des fichiers ont échoué (#565, #891).
            telechargerBlob(blob, `travaux_${nom}.zip`);

            // #891 — marquer « exporté » SEULEMENT ce qui est réellement dans
            // l'archive : un fichier sauté n'a pas été exporté, et ce statut
            // fait taire la détection de blob manquant à l'import d'un codex.
            exportes.forEach(id => travauxStockage.marquerExporte(id));
            _afficherBilanExport(exportes.length, nbFichiers, echecs);
        } catch (e) {
            console.error('[Travaux-Archivage] Erreur export etudiant:', e);
            alert('L\'export a échoué : ' + e.message);
        } finally {
            if (_hasProg) window.masquerProgression();
        }
    }

    /**
     * #895 — Le bouton « Télécharger » de la carte « Exporter des travaux ».
     *
     * Aucun filtre = tout le groupe (ce que faisait « Trimestre complet », retiré).
     * Un filtre sans fichier ne télécharge rien et le dit dans la ligne de
     * progression de la carte, sans `alert`.
     *
     * @param {Object} [options] - `{ da, productionId, forme, compression }`,
     *   voir `exporterTravaux`
     */
    async function lancerExport(options = {}) {
        const da = options.da || null;
        const productionId = options.productionId || null;
        // #949 — un seul export à la fois : « Télécharger » est caché pendant
        // l'export, et un second appel ne lance rien.
        if (_exportEnCours) return;
        const exportCourant = { arrete: false };
        _exportEnCours = exportCourant;
        _basculerBoutonsExport(true);
        try {
            _reinitialiserBarreProgression('travaux-barre-progression', 'travaux-texte-progression');

            const { blob, echecs, nbFichiers, exportes, arrete } = await exporterTravaux(
                Object.assign({}, options, { doitArreter: () => exportCourant.arrete }),
                (traites, total) => {
                    const pourcent = Math.round((traites / total) * 100);
                    const barre = document.getElementById('travaux-barre-progression');
                    if (barre) barre.style.width = pourcent + '%';
                    const texte = document.getElementById('travaux-texte-progression');
                    if (texte) texte.textContent = `${traites}/${total} fichiers traités…`;
                });

            if (arrete) {
                _reinitialiserBarreProgression('travaux-barre-progression', 'travaux-texte-progression');
                const texte = document.getElementById('travaux-texte-progression');
                if (texte) texte.textContent = 'Export arrêté. Aucun fichier téléchargé.';
                return;
            }

            if (!blob) {
                const texte = document.getElementById('travaux-texte-progression');
                if (texte) texte.textContent = 'Aucun fichier trouvé pour ces critères.';
                return;
            }

            // Nom du fichier selon le filtre. #891 — assaini comme dans
            // `lancerExportEtudiant` (#572) : ce nom devient celui du FICHIER
            // téléchargé, où un « / » casse l'enregistrement ; les accents restent.
            let nomZip = 'travaux';
            if (da) {
                const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
                const etudiant = etudiants.find(e => e.da === da);
                nomZip += '_' + _libelleEleve(etudiant, da, false);
            }
            if (productionId) {
                const productions = obtenirDonneesSelonMode('productions');
                const prod = productions.find(p => p.id === productionId);
                nomZip += '_' + _assainirSegmentChemin(prod?.titre || prod?.nom || productionId);
            }
            if (!da && !productionId) {
                // L'archive de tout le groupe : datée, comme l'était « Trimestre complet ».
                const trimestreActif = obtenirTrimestreActif();
                nomZip += '_' + (trimestreActif ? trimestreActif.id : 'semestre')
                    + '_' + new Date().toISOString().split('T')[0];
            }
            // L'archive part MÊME si des fichiers ont échoué (#565, #891).
            telechargerBlob(blob, nomZip + '.zip');

            // #891 — marquer « exporté » SEULEMENT ce qui est réellement dans
            // l'archive : un fichier sauté n'a pas été exporté, et ce statut
            // fait taire la détection de blob manquant à l'import d'un codex.
            // #895 — vaut pour toute forme d'export : l'ancien « Trimestre
            // complet » ne marquait rien.
            exportes.forEach(id => travauxStockage.marquerExporte(id));
            _afficherBilanExport(exportes.length, nbFichiers, echecs);
        } catch (e) {
            console.error('[Travaux-Archivage] Erreur export:', e);
            alert('L\'export a échoué : ' + e.message);
        } finally {
            _exportEnCours = null;
            _basculerBoutonsExport(false);
        }
    }

    /**
     * #949 — L'export en cours de la carte « Exporter des travaux », ou null.
     * Demande de Grégoire (25 sept. 2026) : pouvoir annuler un export lancé par
     * erreur (« j'ai simplement oublié d'anonymiser l'export »). Sa décision :
     * à l'arrêt, rien n'est téléchargé.
     */
    let _exportEnCours = null;

    /**
     * #949 — « Arrêter l'export ». Le fichier en cours de traitement se termine
     * (une copie annotée ne s'interrompt pas au milieu) ; l'export s'arrête
     * avant le suivant, ou jette l'archive si la compression tournait.
     */
    function arreterExport() {
        if (!_exportEnCours || _exportEnCours.arrete) return;
        _exportEnCours.arrete = true;
        const texte = document.getElementById('travaux-texte-progression');
        if (texte) texte.textContent = 'Arrêt en cours…';
        const bouton = document.getElementById('travaux-archivage-arreter');
        if (bouton) bouton.disabled = true;
    }

    /** #949 — Pendant un export : « Arrêter l'export » à la place de « Télécharger ». */
    function _basculerBoutonsExport(enCours) {
        const telecharger = document.getElementById('travaux-archivage-telecharger');
        if (telecharger) telecharger.style.display = enCours ? 'none' : '';
        const arreter = document.getElementById('travaux-archivage-arreter');
        if (arreter) {
            arreter.style.display = enCours ? '' : 'none';
            arreter.disabled = false;
        }
    }

    /**
     * #572 — Remet une barre de progression à zéro AVANT un export.
     *
     * Les barres n'étaient jamais réinitialisées : elles restaient à 100 % après
     * un export. Le suivant démarrait donc sur une barre pleine et un compteur
     * périmé, et paraissait instantané jusqu'au premier rappel de progression —
     * trompeur sur un lot long, où l'on ne sait plus si quelque chose avance.
     *
     * @param {string} idBarre - id de l'élément de barre
     * @param {string} idTexte - id du compteur textuel
     */
    function _reinitialiserBarreProgression(idBarre, idTexte) {
        const barre = document.getElementById(idBarre);
        if (barre) barre.style.width = '0%';
        const texte = document.getElementById(idTexte);
        if (texte) texte.textContent = '';
    }

    /**
     * #565 — Compose le bilan de fin d'export et l'affiche s'il y a quelque
     * chose à dire. Silencieux quand tout s'est bien passé : on ne dérange pas
     * pour confirmer l'ordinaire.
     *
     * @param {number} reussis - Nombre d'éléments effectivement produits
     * @param {number} total - Nombre d'éléments attendus
     * @param {string[]} echecs - Libellés des éléments perdus
     * @param {string[]} [sansSynthese] - Libellés des copies livrées sans leur
     *   page de rétroaction (elles comptent parmi les réussis)
     */
    function _afficherBilanExport(reussis, total, echecs, sansSynthese) {
        const lignes = [];

        if (echecs && echecs.length > 0) {
            lignes.push(`${reussis} exporté(s) sur ${total}, ${echecs.length} en échec :`);
            echecs.forEach(function(t) { lignes.push('  • ' + t); });
        }

        if (sansSynthese && sansSynthese.length > 0) {
            if (lignes.length > 0) lignes.push('');
            lignes.push(`${sansSynthese.length} copie(s) livrée(s) SANS leur page de rétroaction :`);
            sansSynthese.forEach(function(t) { lignes.push('  • ' + t); });
            lignes.push('');
            lignes.push('Ces PDF sont exportés et lisibles, mais il leur manque la page de synthèse. À vérifier avant de les téléverser sur Léa.');
        }

        if (lignes.length === 0) return;
        alert(lignes.join('\n'));
    }

    /**
     * Lance l'export Lea pour une production et telecharge
     * 1 fichier → PDF direct, 2+ fichiers → ZIP
     * @param {string} productionId - ID de la production
     * @param {string|null} da - DA d'un etudiant specifique (null = tous)
     */
    // PROPOSÉ (11 nov. 2026, à valider par Grégoire) : ce que lit l'enseignant·e avant le premier PDF, puis au ZIP.
    const TEXTES_LEA = {
        preparation: 'Préparation des PDF : ça peut prendre un moment.',
        // PROPOSÉ (20 nov. 2026) : le titre de l'onglet ouvert pour le PDF d'un·e étudiant·e, le temps qu'il se prépare.
        onglet: 'Rétroaction en PDF',
        zip: 'Réunion des PDF dans un ZIP…'
    };

    /**
     * UN SEUL PDF S'OUVRE DANS UN NOUVEL ONGLET (décision de Grégoire, 20 nov. 2026 ; vécu sur l'iPad : le PDF d'un·e
     * étudiant·e prenait la place de l'application dans son onglet, qui n'était plus disponible, et le parcours
     * semblait ne pas aboutir). Sous WebKit, un onglet ouvert HORS du geste est bloqué, et le PDF se prépare en
     * plusieurs temps : l'onglet est donc ouvert VIDE, tout de suite, dans le geste (`ouvrirOngletDuPdf`, appelé avant
     * toute attente), puis il reçoit le PDF quand il est prêt (`montrerDansLOnglet`). S'il n'y a finalement pas
     * exactement un PDF (rien de verrouillé, un échec, plusieurs fichiers), l'onglet se referme. Si le navigateur
     * refuse l'onglet (les fenêtres surgissantes bloquées), le PDF est téléchargé comme avant : rien n'est perdu.
     * Fiche 7 (27 nov. 2026) : l'onglet s'ouvre quand la sélection annonce UN SEUL PDF, un·e étudiant·e choisi·e ou
     * « — Tous — » avec une seule évaluation prête ; plusieurs PDF donnent un ZIP, téléchargé.
     */
    /**
     * FICHE 7 DU LOT « ÉVALUATION » (décision de Grégoire, 22 nov. 2026, 14 h 21 ; textes acceptés) — LA PAGE D'ATTENTE
     * DE L'ONGLET. Vécu sur l'iPad le 22 nov. : l'onglet passait devant, page nue à `about:blank` avec la seule phrase de
     * la préparation, et il a cru « sortir de l'application ». Elle est maintenant habillée aux couleurs de l'application
     * et dit, à l'enseignant·e, ce qui se passe et comment revenir.
     * ⚠ AUCUN SCRIPT DANS L'ONGLET (CSP `script-src 'self'`) : l'application l'habille d'ici, par le DOM (l'onglet vide
     * est de la même origine), avec les couleurs qu'elle affiche à cet instant, lues sur son `body` (thème sombre ou
     * clair, `mode-clair`). Le nom passe en texte (`textContent`), jamais en HTML.
     */
    const TEXTE_ONGLET_ATTENTE = (nom) => [
        `Labo Codex prépare la rétroaction de ${nom}.`,
        'Le PDF s\'affichera ici. Pour revenir à l\'application, ferme cet onglet.'
    ];

    /**
     * [Prénom Nom] de la page d'attente : ce que l'écran affiche pour cette personne. `obtenirDonneesSelonMode` rend les
     * noms anonymes en anonymisation (« Élève 32 », sans nom de famille), les noms réels sinon. Vide si l'élève est
     * introuvable : l'onglet dit alors la phrase de la préparation.
     */
    function _nomPourLOnglet(da) {
        const etudiant = da ? (obtenirDonneesSelonMode('groupeEtudiants') || []).find((e) => e && e.da === da) : null;
        return etudiant ? [etudiant.prenom, etudiant.nom].filter(Boolean).join(' ') : '';
    }

    /** Les couleurs que l'application affiche à cet instant (ses variables, sur son `body`), avec celles du thème sombre en repli. */
    function _couleursDeLApplication() {
        let cs = null;
        try { cs = window.getComputedStyle(document.body); } catch (e) { cs = null; }
        const lire = (variable, repli) => String((cs && cs.getPropertyValue(variable)) || '').trim() || repli;
        return {
            page: lire('--surface-page', '#0c1a22'), carte: lire('--surface-carte', '#1a3040'),
            texte: lire('--texte-principal', '#d0e0e4'), discret: lire('--texte-muted', '#80a0b0'),
            accent: lire('--accent-primaire', '#6aacb8'), bordure: lire('--bordure-moyenne', 'rgba(106, 172, 184, 0.35)'),
            police: (cs && cs.fontFamily) || 'system-ui, -apple-system, sans-serif'
        };
    }

    function _habillerOnglet(onglet, nom) {
        const d = onglet.document;
        const c = _couleursDeLApplication();
        d.title = TEXTES_LEA.onglet;
        d.documentElement.setAttribute('lang', 'fr');
        const largeur = d.createElement('meta');   // l'iPad : la largeur de l'appareil, pas une page de bureau réduite
        largeur.setAttribute('name', 'viewport');
        largeur.setAttribute('content', 'width=device-width, initial-scale=1');
        d.head.appendChild(largeur);
        d.body.style.cssText = `margin:0;min-height:100vh;box-sizing:border-box;padding:24px;display:flex;align-items:center;`
            + `justify-content:center;background:${c.page};color:${c.texte};font-family:${c.police};font-size:16px;line-height:1.6;`;
        const carte = d.createElement('main');
        carte.style.cssText = `max-width:32rem;padding:28px 32px;border-radius:12px;background:${c.carte};`
            + `border:1px solid ${c.bordure};border-left:4px solid ${c.accent};`;
        (nom ? TEXTE_ONGLET_ATTENTE(nom) : [TEXTES_LEA.preparation]).forEach((texte, i) => {
            const p = d.createElement('p');
            p.textContent = texte;
            p.style.cssText = i === 0 ? 'margin:0 0 12px;font-size:1.25rem;font-weight:600;' : `margin:0;color:${c.discret};`;
            carte.appendChild(p);
        });
        d.body.replaceChildren(carte);
    }

    /**
     * L'onglet du PDF d'une rétroaction, ouvert DANS LE GESTE (avant toute attente) et habillé. Lu par « Exporter pour
     * Léa » et, par `travauxArchivage.ongletDuPdf`, par « Dossier PDF » et « Exporter le PDF » (travaux-export-pdf.js).
     * @param {string} [da] - l'élève dont la rétroaction se prépare
     * @returns {Window|null} null si le navigateur refuse l'onglet : l'appelant télécharge le PDF
     */
    function ouvrirOngletDuPdf(da) {
        let onglet = null;
        try { onglet = window.open('', '_blank'); } catch (e) { onglet = null; }
        if (!onglet) return null;
        try { _habillerOnglet(onglet, _nomPourLOnglet(da)); } catch (e) { /* l'onglet reste vide, le PDF y viendra */ }
        return onglet;
    }

    /** Fiche 7 — le nombre de PDF qu'une sélection de « Exporter pour Léa » donnera : un par copie, un par synthèse seule. */
    function _nombreDePdfLea(selection) {
        return selection.fichiers.length + selection.sansFichier.length;
    }

    /** Fiche 7 — l'élève du seul PDF d'une sélection, pour nommer la page d'attente. */
    function _daDuSeulPdfLea(selection) {
        return ((selection.fichiers[0] || selection.sansFichier[0]) || {}).etudiantDA;
    }

    /** Le PDF, dans l'onglet ouvert pour lui. @returns {boolean} false si l'onglet n'est plus là (fermé entre-temps) */
    function montrerDansLOnglet(onglet, blob, nomFichier) {
        if (!onglet || onglet.closed) return false;
        try {
            // Un `File` porte le nom du PDF (le DA et le nom de l'étudiant·e), là où le navigateur le reprend.
            const fichier = typeof File === 'function' ? new File([blob], nomFichier, { type: 'application/pdf' }) : blob;
            const url = URL.createObjectURL(fichier);
            onglet.location.href = url;
            // L'adresse reste valide le temps que l'onglet charge le PDF, puis elle est rendue.
            setTimeout(function() { URL.revokeObjectURL(url); }, 60000);
            return true;
        } catch (e) {
            return false;
        }
    }

    function fermerOnglet(onglet) {
        try { if (onglet && !onglet.closed) onglet.close(); } catch (e) { /* déjà fermé */ }
    }

    async function lancerExportLea(productionId, da, reprisesSeulement) {
        if (!productionId) {
            alert('Sélectionne une production.');
            return;
        }
        // Dans le geste, avant toute attente : l'onglet du PDF, quand UN SEUL est annoncé (voir plus haut). Fiche 7
        // (27 nov. 2026) : la décision du 20 nov. vaut pour tout export d'un seul PDF, « — Tous — » compris quand une
        // seule évaluation est prête ; la même sélection que le compteur et que l'export, lue tout de suite.
        const annonce = selectionnerEvaluationsLea(productionId, da, reprisesSeulement);
        const onglet = _nombreDePdfLea(annonce) === 1 ? ouvrirOngletDuPdf(_daDuSeulPdfLea(annonce)) : null;

        try {
            const date = new Date().toISOString().split('T')[0];

            _reinitialiserBarreProgression('travaux-barre-progression-lea', 'travaux-texte-progression-lea');
            // Le premier signe, tout de suite (11 nov. 2026, capture 21) : la phrase et le départ de la barre, peints
            // avant que la préparation du premier PDF ne retienne la page (une image, puis la suite).
            const texteLea = document.getElementById('travaux-texte-progression-lea');
            if (texteLea) texteLea.textContent = TEXTES_LEA.preparation;
            const barreLea = document.getElementById('travaux-barre-progression-lea');
            if (barreLea) barreLea.style.width = '3%';
            await new Promise(function(fin) { requestAnimationFrame(function() { setTimeout(fin, 0); }); });

            const { blobs, nomProd, echecs, sansSynthese } = await exporterPourLea(productionId, da, reprisesSeulement, (traites, total) => {
                const pourcent = Math.round((traites / total) * 100);
                const barre = document.getElementById('travaux-barre-progression-lea');
                if (barre) barre.style.width = pourcent + '%';
                const texte = document.getElementById('travaux-texte-progression-lea');
                if (texte) texte.textContent = `${traites}/${total} fichiers traités…`;
            });

            // #565 — tout a échoué : ne pas télécharger un ZIP vide en laissant
            // croire que l'export a réussi.
            if (blobs.length === 0) {
                fermerOnglet(onglet);
                _afficherBilanExport(0, echecs.length, echecs, sansSynthese);
                if (echecs.length === 0) alert('Aucun PDF n\'a pu être produit.');
                return;
            }

            if (blobs.length === 1) {
                // Un seul fichier → le PDF, dans son onglet (un·e étudiant·e choisi·e) ; sinon téléchargé.
                if (!montrerDansLOnglet(onglet, blobs[0].blob, blobs[0].nom)) telechargerBlob(blobs[0].blob, blobs[0].nom);
            } else {
                fermerOnglet(onglet);
                // Plusieurs fichiers → ZIP
                if (typeof JSZip === 'undefined') throw new Error('JSZip non disponible');
                const zip = new JSZip();
                for (const { blob, nom } of blobs) {
                    zip.file(nom, blob);
                }
                const texteZip = document.getElementById('travaux-texte-progression-lea');
                if (texteZip) texteZip.textContent = TEXTES_LEA.zip;
                const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
                telechargerBlob(zipBlob, `Lea_${nomProd}_${date}.zip`);
            }
            // Le quatrième parcours d'assistance (« Recevoir les productions, rendre tes rétroactions », 9 nov. 2026)
            // avance quand l'export est TÉLÉCHARGÉ, pas quand la barre est pleine : elle l'est aussi quand tout échoue.
            window.dispatchEvent(new CustomEvent('travaux-export-lea-telecharge', { detail: { fichiers: blobs.length } }));

            // Bilan APRÈS le téléchargement : les copies valides sont parties,
            // et l'enseignant sait ce qui manque avant de téléverser sur Léa.
            _afficherBilanExport(blobs.length, blobs.length + echecs.length, echecs, sansSynthese);
        } catch (e) {
            fermerOnglet(onglet);
            if (e && e.texteEntier) { alert(e.message); return; }   // rien de verrouillé : pas une erreur
            console.error('[Travaux-Archivage] Erreur export Lea:', e);
            alert('L\'export Léa a échoué : ' + e.message);
        }
    }

    /* ===============================
       EXPORTS GLOBAUX
       =============================== */

    window.travauxArchivage = {
        exporterParEtudiant: exporterParEtudiant,
        exporterTravaux: exporterTravaux,
        exporterPourLea: exporterPourLea,
        lancerExport: lancerExport,
        arreterExport: arreterExport,
        lancerExportEtudiant: lancerExportEtudiant,
        lancerExportLea: lancerExportLea,
        selectionnerEvaluationsLea: selectionnerEvaluationsLea,   // #566 — lue par le compteur de l'écran
        // Fiche 7 (27 nov. 2026) : l'onglet d'un seul PDF de rétroaction, le même pour « Dossier PDF » et « Exporter le PDF ».
        ongletDuPdf: { ouvrir: ouvrirOngletDuPdf, montrer: montrerDansLOnglet, fermer: fermerOnglet },
        telechargerBlob: telechargerBlob,
        // #572 — exposés pour la sentinelle : deux fonctions pures dont les cas
        // limites (nom contenant « / », fichier sans extension) ne sont pas
        // atteignables par les fonctions d'export sans monter tout JSZip.
        _assainirSegmentChemin: _assainirSegmentChemin,
        _nomVersionAnnotee: _nomVersionAnnotee
    };

})();
