/**
 * VUE SIMPLE — les fonctions pures (lot « Vue simple », consigne de Cowork du 9 nov. 2026)
 *
 * Rapport et mesure : `plans de travail/RAPPORT-2026-11-09-vue-simple.md`.
 * La vue simple réduit l'application à une fonction : passer de résultats non sommatifs à une note chiffrée finale.
 * Elle MASQUE, elle ne retire rien : les données sont celles de la vue étendue, aux mêmes clés.
 *
 * Ici : rien ne lit le DOM ni `db` ; tout se teste sous Vitest (tests/unit/vue-simple.test.js).
 * L'écran : `vue-simple.js`.
 */
(function () {
    'use strict';

    const VUES = Object.freeze({ SIMPLE: 'simple', ETENDUE: 'etendue' });

    /** Le choix de la vue reste sur l'appareil : écrit dans `localStorage`, HORS de `db` — il n'entre ni dans le codex
     *  ni dans l'empreinte des données (mesuré : l'export n'écarte que `_codex_*`, js/codex.js, `genererCodex`). */
    const CLE_CHOIX = 'laboCodex.vue';

    /** Les cinq écrans de la vue simple, dans l'ordre de la navigation (décidé par Cowork). */
    const ECRANS = Object.freeze(['accueil', 'classe', 'pratique', 'resultats', 'note']);

    /* ============================== LA VUE AU DÉMARRAGE ============================== */

    function _estDemo(trimestre) {
        return !trimestre || trimestre.id === 'demo' || trimestre.isDemo === true;
    }

    /**
     * L'application est-elle vide sur cet appareil ? Vide : aucun élève inscrit, dans aucun trimestre. La démonstration
     * ne compte pas ; un codex ouvert ou importé compte (ses trimestres sont là).
     * SUPPOSÉ : les élèves sont une liste plate par trimestre (`<id>_groupeEtudiants`), pas rangés dans un objet « groupe » ;
     * « aucun groupe avec au moins un élève » se lit donc « aucun élève inscrit ».
     * @param {Array} trimestres - la liste `trimestres`
     * @param {function(string): Array} lireEleves - rend la liste des élèves d'un trimestre, par son id
     */
    function applicationVide(trimestres, lireEleves) {
        return !(trimestres || []).some((t) => {
            if (_estDemo(t) || !t.id) return false;
            const eleves = lireEleves(t.id);
            return Array.isArray(eleves) && eleves.some((e) => e && e.da);
        });
    }

    /**
     * La vue au démarrage. Un choix explicite prime (la bascule du menu ; avoir bâti sa classe en vue simple). Sans choix :
     * simple quand l'application est vide, étendue dès qu'elle porte des données.
     * La démonstration ouverte donne la vue étendue : elle ne s'ouvre que de là, et ses données ne sont pas « ta classe »
     * (ajout de Claude Code à la décision de Cowork, signalé au rapport).
     */
    function vueAuDemarrage({ choix, vide, demoOuverte }) {
        if (choix === VUES.SIMPLE || choix === VUES.ETENDUE) return choix;
        if (demoOuverte) return VUES.ETENDUE;
        return vide ? VUES.SIMPLE : VUES.ETENDUE;
    }

    /* ============================== LA LISTE COLLÉE ============================== */

    const DA_RE = /^\d{7}$/;
    const RAISONS = Object.freeze({
        // PROPOSÉ (textes neufs, à valider par Grégoire) — rapport, liste des textes.
        da: 'le DA doit compter 7 chiffres',
        incomplet: 'il manque le nom ou le prénom',
        double: 'ce DA est déjà dans la liste collée'
    });

    function _decouper(ligne) {
        const parSeparateur = ligne.split(/[\t;,]/).map((s) => s.trim()).filter((s) => s !== '');
        if (parSeparateur.length >= 3) return parSeparateur;
        // « 1234567 Tremblay Alice » : le DA, le nom (un mot), le reste est le prénom.
        const mots = ligne.trim().split(/\s+/);
        if (parSeparateur.length <= 1 && mots.length >= 3) return [mots[0], mots[1], mots.slice(2).join(' ')];
        return parSeparateur.length ? parSeparateur : mots;
    }

    function _estEntete(cellules) {
        return !/\d/.test(cellules[0] || '') && cellules.some((c) => /^(da|matricule|nom|pr[ée]nom)$/i.test(c));
    }

    /**
     * Lit une liste collée : une ligne par élève, « DA, nom, prénom » (tabulation, point-virgule, virgule ou espaces). Une
     * liste à quatre colonnes dont la deuxième est un numéro de groupe (copie d'Omnivox) est lue aussi : le groupe est écarté.
     * Rien n'est inventé : une ligne sans DA de 7 chiffres est refusée et nommée.
     * @returns {{fiches: Array<{da,nom,prenom}>, refusees: Array<{ligne: string, raison: string}>}}
     */
    function analyserListeCollee(texte) {
        const fiches = [];
        const refusees = [];
        const vus = new Set();
        String(texte || '').split(/\r?\n/).forEach((brute, i) => {
            const ligne = brute.trim();
            if (!ligne) return;
            let c = _decouper(ligne);
            if (i === 0 && _estEntete(c)) return;
            if (c.length >= 4 && /^\d{1,6}$/.test(c[1]) && !DA_RE.test(c[1])) c = [c[0], c[2], c[3]];
            const da = (c[0] || '').replace(/\s/g, '');
            if (!DA_RE.test(da)) { refusees.push({ ligne, raison: RAISONS.da }); return; }
            if (!c[1] || !c[2]) { refusees.push({ ligne, raison: RAISONS.incomplet }); return; }
            if (vus.has(da)) { refusees.push({ ligne, raison: RAISONS.double }); return; }
            vus.add(da);
            fiches.push({ da, nom: c[1], prenom: c[2] });
        });
        return { fiches, refusees };
    }

    /* ============================== CE QUI NAÎT EN COULISSE ============================== */

    /** Le trimestre d'une date : janvier à mai, hiver ; juin et juillet, été ; août à décembre, automne (règle de rencontres.js). */
    function trimestreDeLaDate(date) {
        const mois = date.getMonth() + 1;
        const session = mois <= 5 ? 'H' : (mois <= 7 ? 'E' : 'A');
        return { session, annee: String(date.getFullYear()), id: session.toLowerCase() + date.getFullYear() };
    }

    /** Le groupe de la classe née en vue simple. */
    const GROUPE_SIMPLE = '1';

    /** La fiche d'un élève, à la forme de `groupeEtudiants` (les champs que l'enseignant·e n'a pas donnés restent vides). */
    function ficheEleve(fiche, coursId) {
        return { da: fiche.da, nom: fiche.nom, prenom: fiche.prenom, groupe: GROUPE_SIMPLE, programme: '', sa: '', coursId };
    }

    /** Le groupe-cours né en coulisse : sans horaire (comme celui d'un service), sans pratique encore. */
    function groupeCoursLeger({ id, trimestre, cours, enseignantId, maintenant }) {
        const nomCours = cours.nomCours || cours.codeCours || '';
        return {
            id, nom: `${trimestre.nom || trimestre.id} - ${nomCours} - ${GROUPE_SIMPLE}`,
            trimestreId: trimestre.id, coursId: cours.id, groupeNum: GROUPE_SIMPLE,
            horaireId: null, enseignantId, pratiqueId: null, dateCreation: maintenant, actif: false
        };
    }

    /**
     * La production la plus légère que le tableau, le calcul de la note et les listes acceptent (mesuré, rapport § 6) :
     * un nom et une date. En standards, le type « autre » entre dans la note ; en spécifications, le type est un de ceux
     * de la pratique (sans quoi la production ne serait pas une colonne).
     */
    function productionLegere({ id, titre, date, coursId, type, maintenant }) {
        return {
            id, titre: String(titre || '').trim(), type: type || 'autre', description: '',
            dateEcheance: date || '', coursId, dansBibliotheque: true,
            dateCreation: maintenant, dateModification: maintenant
        };
    }

    /* ============================== LA PRATIQUE ============================== */

    const FAMILLES = Object.freeze({ STD: 'standards', SPE: 'specifications' });

    /** Les règles des standards offertes en vue simple : celles des deux modèles existants, et « toutes ». */
    const REGLES_STD = Object.freeze(['meilleurs', 'recents', 'tous']);

    function _copie(objet) { return JSON.parse(JSON.stringify(objet)); }

    /**
     * La pratique installée depuis un modèle existant (`MODELES_PRATIQUES_PREDEFINIS`) : ses valeurs de départ sont celles
     * du modèle, rien n'est inventé. Elle reçoit un identifiant neuf et la forme d'une pratique du trimestre.
     */
    function pratiqueDepuisModele(modele, { id, nom, echelleId, maintenant }) {
        const p = _copie(modele);
        const famille = p.type;
        // Le nom du modèle dit sa règle de départ (« N meilleures évaluations ») ; la règle se change ici, le nom dit donc la famille.
        if (nom) p.nom = nom;
        p.inspireDe = { sourceId: modele.id, nom: modele.nom };
        p.id = id;
        delete p.estGabarit;
        p.dansBibliotheque = true;
        p.dateAjout = maintenant;
        p.configuration = Object.assign({ type: famille }, p.configuration || {});
        if (famille === FAMILLES.STD) {
            p.configuration.echelleId = echelleId || null;
            p.configuration.notesFinales = false;
            p.configuration.portfolio = Object.assign({ actif: true, utiliser: true }, p.configuration.portfolio || {});
        }
        return p;
    }

    /** La règle des standards, lue dans une pratique. `derniers` est l'ancien nom de `recents`. */
    function regleStd(pratique) {
        const pf = ((pratique || {}).configuration || {}).portfolio || {};
        const methode = pf.methodeSelection === 'derniers' ? 'recents' : (pf.methodeSelection || 'meilleurs');
        return { methode: REGLES_STD.indexOf(methode) >= 0 ? methode : 'autre', nombre: Number(pf.nombreARetenir) || 0 };
    }

    /** Pose la règle des standards (la méthode et le nombre retenu), sans toucher au reste de la pratique. */
    function poserRegleStd(pratique, { methode, nombre }) {
        const p = _copie(pratique);
        const pf = p.configuration.portfolio = Object.assign({ actif: true, utiliser: true }, p.configuration.portfolio || {});
        if (REGLES_STD.indexOf(methode) >= 0) pf.methodeSelection = methode;
        const n = Math.max(1, Math.min(99, parseInt(nombre, 10) || pf.nombreARetenir || 1));
        pf.nombreARetenir = n;
        pf.minimumCompletion = n;   // comme les deux modèles (7 et 7, 5 et 5)
        return p;
    }

    /** Pose les paliers des spécifications : pour chacun, la note et le nombre de productions acceptables par type. */
    function poserPaliersSpe(pratique, paliers) {
        const p = _copie(pratique);
        const forfaits = p.configuration.forfaits || [];
        (paliers || []).forEach((palier) => {
            const f = forfaits.find((x) => String(x.id) === String(palier.id));
            if (!f) return;
            const note = parseInt(palier.note, 10);
            if (note >= 0 && note <= 100) f.note = note;
            Object.keys(palier.travaux || {}).forEach((typeId) => {
                const n = parseInt(palier.travaux[typeId], 10);
                if (n >= 0 && n <= 99) { f.travaux = f.travaux || {}; f.travaux[typeId] = n; }
            });
        });
        return p;
    }

    /* ============================== LA RÈGLE « NE NOMME RIEN QUI N'EXISTE PAS » ============================== */

    /** Le matériel que l'application sème d'elle-même dans un trimestre (import-export.js, `IDS_MATERIEL_SEME`). */
    const IDS_GRILLES_SEMEES = Object.freeze(['GRILLE_GENERIQUE']);

    /**
     * Une grille existe-t-elle dans les données de l'utilisateur ? La règle lit les données, pas qui les a créées.
     * SUPPOSÉ : la grille de départ que l'application sème d'elle-même n'est pas « une grille de l'utilisateur » ; sans
     * quoi un novice, qui n'en a jamais vu, lirait le mot « critères ».
     */
    function aUneGrille(grilles) {
        return (grilles || []).some((g) => g && g.id && g.dansBibliotheque !== false && IDS_GRILLES_SEMEES.indexOf(g.id) < 0);
    }

    /** Une case du tableau est-elle évaluée avec une grille ? (une copie qui n'est pas un résultat sans grille, pour une colonne du tableau) */
    function aUneCaseAvecGrille(evaluations, productionIds, das) {
        const p = new Set(productionIds || []);
        const d = new Set(das || []);
        return (evaluations || []).some((e) => e && e.sansGrille !== true && !e.remplaceeParId && p.has(e.productionId) && d.has(e.etudiantDA));
    }

    window.VueSimpleDonnees = {
        VUES, CLE_CHOIX, ECRANS, FAMILLES, REGLES_STD, GROUPE_SIMPLE, RAISONS,
        applicationVide, vueAuDemarrage,
        analyserListeCollee, trimestreDeLaDate, ficheEleve, groupeCoursLeger, productionLegere,
        pratiqueDepuisModele, regleStd, poserRegleStd, poserPaliersSpe,
        aUneGrille, aUneCaseAvecGrille
    };
})();
