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

    /** La marque que porte le FICHIER : la vue d'où il a été enregistré. Écrite dans le fichier à l'enregistrement
     *  (`genererCodex`), jamais à la bascule ; lue au démarrage quand l'appareil n'a fait aucun choix. */
    const CLE_MARQUE = 'vueDuFichier';

    /** Les cinq écrans de la vue simple, dans l'ordre de la navigation (décidé par Cowork). */
    const ECRANS = Object.freeze(['accueil', 'classe', 'pratique', 'resultats', 'note']);

    /* ============================== LA VUE AU DÉMARRAGE ============================== */

    function _estDemo(trimestre) {
        return !trimestre || trimestre.id === 'demo' || trimestre.isDemo === true;
    }

    /**
     * L'application est-elle vide sur cet appareil ? Vide : aucun trimestre hors démonstration (décision de Cowork du
     * 9 nov. 2026, 19 h 40, sur la recommandation du rapport : qui a bâti un trimestre en vue étendue, même sans
     * étudiant·es, a des données). La démonstration ne compte pas ; un codex ouvert ou importé compte (ses trimestres sont là).
     * @param {Array} trimestres - la liste `trimestres`
     */
    function applicationVide(trimestres) {
        return !(trimestres || []).some((t) => !_estDemo(t) && !!t.id);
    }

    /**
     * La vue au démarrage. Un choix explicite prime (la bascule du menu ; avoir bâti sa classe en vue simple). Sans choix :
     * simple quand l'application est vide, étendue dès qu'elle porte des données.
     * La démonstration ouverte donne la vue étendue : elle ne s'ouvre que de là, et ses données ne sont pas « ta classe »
     * (ajout de Claude Code à la décision de Cowork, signalé au rapport).
     */
    function vueAuDemarrage({ choix, vide, demoOuverte, pilote, marque }) {
        if (choix === VUES.SIMPLE || choix === VUES.ETENDUE) return choix;
        // PILOTÉ PAR UN BANC (`navigator.webdriver`) : la vue étendue. Les quelque 340 bancs Playwright du projet ouvrent une
        // application vide et y naviguent dans la vue étendue ; sans ceci, ils s'ouvriraient tous en vue simple, barre
        // principale masquée (mesuré le 9 nov. 2026 : le banc du tableau, 19 essais, rougissait en entier). Le banc de la
        // vue simple éteint ce drapeau pour éprouver la vraie règle. Aucun utilisateur n'a ce drapeau.
        if (pilote) return VUES.ETENDUE;
        if (demoOuverte) return VUES.ETENDUE;
        // LA VUE VOYAGE AVEC LE FICHIER (décision de Cowork, 9 nov. 2026, 19 h 40) : un fichier enregistré depuis la vue
        // simple porte une marque ; ouvert sur un appareil qui n'a fait aucun choix, il s'ouvre en vue simple.
        if (marque === VUES.SIMPLE) return VUES.SIMPLE;
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

    /**
     * Le rang d'une production, tel que « les plus récentes » le lit (`creerComparateurRecenceStd`, registre) : son numéro,
     * sinon les chiffres qui terminent son identifiant. Une production neuve prend le rang suivant du cours.
     */
    function rangDeProduction(production) {
        const fin = String((production || {}).id || '').match(/(\d+)$/);
        return Number((production || {}).numero) || (fin ? parseInt(fin[1], 10) : 0) || 0;
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
        p.description = '';   // celle du modèle décrit sa règle de départ (« Garde les 7 meilleures… »), que l'enseignant·e change
        p.inspireDe = { sourceId: modele.id, nom: modele.nom };
        p.id = id;
        delete p.estGabarit;
        // « Demo Labo Codex » est l'auteur du MODÈLE : gardé sur la copie, il la ferait passer pour un item de démonstration,
        // que Conception › Pratiques masque hors démo (`BibliothequeUI.estItemDemo`) — la pratique de l'utilisateur y serait invisible.
        delete p.auteur;
        p.dansBibliotheque = true;
        p.dateAjout = maintenant;
        p.configuration = Object.assign({ type: famille }, p.configuration || {});
        if (famille === FAMILLES.STD) {
            p.configuration.echelleId = echelleId || null;
            p.configuration.notesFinales = false;
            p.configuration.portfolio = Object.assign({ actif: true, utiliser: true }, p.configuration.portfolio || {});
            // Décision de Grégoire (9 nov. 2026, 19 h 35) : en vue simple, la règle arrive sur « Toutes les productions »,
            // pas sur les « 7 meilleures » du modèle. Le nombre du modèle reste, pour qui choisit ensuite « N meilleures ».
            p.configuration.portfolio.methodeSelection = 'tous';
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
        // Le minimum d'évaluations (lu par le Suivi) suit le nombre retenu SEULEMENT s'il le suivait déjà, comme dans les deux
        // modèles (7 et 7, 5 et 5). Un minimum réglé à part en vue étendue n'est pas touché (relecture neuve, 9 nov. 2026).
        if (pf.minimumCompletion === undefined || pf.minimumCompletion === pf.nombreARetenir) pf.minimumCompletion = n;
        pf.nombreARetenir = n;
        return p;
    }

    /* ============================== LA PRATIQUE SE RÈGLE (principe de Grégoire, 9 nov. 2026, 19 h 39) ==============================
       « Ma pratique ne doit pas être codée en dur. […] Dans Excel, un utilisateur peut mettre les valeurs qu'il veut. »
       La vue simple convertit la notation DE L'UTILISATEUR en note : ses niveaux (nom, lettre, valeur, ordre), ses types,
       ses paliers. Le BROUILLON est ce que l'écran « Pratique » montre et modifie ; rien n'est écrit avant « Enregistrer ». */

    function _valeurDuNiveau(n) {
        const v = (n && n.valeurCalcul != null && n.valeurCalcul !== '') ? Number(n.valeurCalcul) : NaN;
        return isNaN(v) ? '' : v;
    }

    /** Le brouillon d'une pratique : sa règle, et ses niveaux (standards) ou ses types et paliers (spécifications). */
    function brouillonDeLaPratique(pratique, echelle) {
        const c = (pratique && pratique.configuration) || {};
        const regle = regleStd(pratique);
        return {
            pratiqueId: pratique ? pratique.id : null,
            methode: regle.methode, nombre: regle.nombre || 1,
            // `origine` : la lettre que le niveau porte dans l'échelle enregistrée (null pour un niveau ajouté ici).
            niveaux: ((echelle && echelle.niveaux) || []).map((n) => ({ origine: String(n.code), code: String(n.code), nom: n.nom || '', valeur: _valeurDuNiveau(n) })),
            types: (c.typesTravaux || []).map((t) => ({ id: t.id, nom: t.nom || '' })),
            paliers: (c.forfaits || []).map((f) => ({ id: f.id, lettre: f.lettre || '', note: f.note, travaux: Object.assign({}, f.travaux || {}) })),
            // Les identifiants déjà portés : un type ou un palier ajouté après un retrait ne reprend JAMAIS l'identifiant du
            // retiré (il hériterait de ses champs que l'écran ne montre pas, et de ses productions).
            idsTypes: (c.typesTravaux || []).map((t) => t.id),
            idsPaliers: (c.forfaits || []).map((f) => f.id)
        };
    }

    function _deplacer(liste, index, pas) {
        const cible = index + pas;
        if (index < 0 || index >= liste.length || cible < 0 || cible >= liste.length) return liste;
        const copie = liste.slice();
        copie.splice(cible, 0, copie.splice(index, 1)[0]);
        return copie;
    }

    function _idSuivant(ids) {
        return (ids || []).reduce((max, id) => Math.max(max, parseInt(id, 10) || 0), 0) + 1;
    }

    const MIN_NIVEAUX = 2;
    const MIN_TYPES = 1;
    const MIN_PALIERS = 1;

    /** Les gestes du brouillon. Chacun rend un brouillon neuf (l'ancien n'est pas muté), ou `{ refus }` avec sa raison. */
    const gestes = {
        niveauAjouter: (b) => Object.assign({}, b, { niveaux: b.niveaux.concat([{ origine: null, code: '', nom: '', valeur: '' }]) }),
        niveauDeplacer: (b, index, pas) => Object.assign({}, b, { niveaux: _deplacer(b.niveaux, index, pas) }),
        /** @param {function(string): number} compterResultats - le nombre de résultats du tableau qui portent cette lettre */
        niveauRetirer: (b, index, compterResultats) => {
            const niveau = b.niveaux[index];
            if (!niveau) return b;
            if (b.niveaux.length <= MIN_NIVEAUX) return { refus: 'minimumNiveaux' };
            const n = niveau.origine ? compterResultats(niveau.origine) : 0;
            if (n > 0) return { refus: 'niveauUtilise', n, nom: niveau.nom || niveau.code };
            return Object.assign({}, b, { niveaux: b.niveaux.filter((_, i) => i !== index) });
        },
        typeAjouter: (b) => { const id = _idSuivant(b.idsTypes); return Object.assign({}, b, { types: b.types.concat([{ id, nom: '', neuf: true }]), idsTypes: (b.idsTypes || []).concat([id]) }); },
        /** @param {function(Object): number} compterProductions - le nombre de productions de ce type */
        typeRetirer: (b, index, compterProductions) => {
            const type = b.types[index];
            if (!type) return b;
            if (b.types.length <= MIN_TYPES) return { refus: 'minimumTypes' };
            const n = type.neuf ? 0 : compterProductions(type);
            if (n > 0) return { refus: 'typeUtilise', n, nom: type.nom };
            const paliers = b.paliers.map((p) => { const t = Object.assign({}, p.travaux); delete t[type.id]; return Object.assign({}, p, { travaux: t }); });
            return Object.assign({}, b, { types: b.types.filter((_, i) => i !== index), paliers });
        },
        palierAjouter: (b) => { const id = _idSuivant(b.idsPaliers); return Object.assign({}, b, { paliers: b.paliers.concat([{ id, lettre: '', note: '', travaux: {} }]), idsPaliers: (b.idsPaliers || []).concat([id]) }); },
        palierRetirer: (b, index) => {
            if (!b.paliers[index]) return b;
            if (b.paliers.length <= MIN_PALIERS) return { refus: 'minimumPaliers' };
            return Object.assign({}, b, { paliers: b.paliers.filter((_, i) => i !== index) });
        }
    };

    function _nombreEntre(v, min, max) {
        if (v === '' || v === null || v === undefined) return null;
        const n = Number(String(v).replace(',', '.'));
        return (isNaN(n) || n < min || n > max) ? null : n;
    }

    function _doublon(valeurs) {
        const vus = new Set();
        return valeurs.some((v) => { const k = String(v).trim().toLowerCase(); if (vus.has(k)) return true; vus.add(k); return false; });
    }

    /**
     * Ce qui empêche d'enregistrer les niveaux, ou null. Une lettre déjà inscrite dans des résultats ne se change pas :
     * les résultats la portent, ils ne seraient plus lus.
     * @param {function(string): number} compterResultats
     */
    function refusDesNiveaux(b, compterResultats) {
        const n = b.niveaux;
        if (n.length < MIN_NIVEAUX) return { refus: 'minimumNiveaux' };
        if (n.some((x) => !String(x.code).trim() || !String(x.nom).trim())) return { refus: 'niveauIncomplet' };
        if (n.some((x) => valeurDeNiveau(x.valeur) === null)) return { refus: 'valeurNiveau' };
        if (_doublon(n.map((x) => x.code))) return { refus: 'lettreEnDouble' };
        const change = n.find((x) => x.origine && String(x.code).trim() !== x.origine && compterResultats(x.origine) > 0);
        if (change) return { refus: 'lettreUtilisee', n: compterResultats(change.origine), nom: change.origine };
        return null;
    }

    /** La note d'un palier : un nombre, zéro ou plus, SANS PLAFOND — la règle des niveaux (décision de Cowork, 9 nov. 2026, 21 h 43). */
    function notePalier(v) { return _nombreEntre(v, 0, Infinity); }

    /** Ce qui empêche d'enregistrer les types et les paliers, ou null. */
    function refusDesSpecifications(b) {
        if (b.types.length < MIN_TYPES) return { refus: 'minimumTypes' };
        if (b.types.some((t) => !String(t.nom).trim())) return { refus: 'typeSansNom' };
        if (_doublon(b.types.map((t) => t.nom))) return { refus: 'typeEnDouble' };
        if (b.paliers.length < MIN_PALIERS) return { refus: 'minimumPaliers' };
        if (b.paliers.some((p) => !String(p.lettre).trim())) return { refus: 'palierSansNom' };
        if (b.paliers.some((p) => notePalier(p.note) === null)) return { refus: 'notePalier' };
        // Un palier sans exigence est le PLANCHER : le calcul le donne à qui n'atteint rien d'autre. Deux planchers, ou un
        // plancher qui n'est pas la note la plus basse, donneraient la note haute à qui n'a rien d'acceptable.
        const ids = b.types.map((t) => String(t.id));
        const sansExigence = (p) => !ids.some((id) => _nombreEntre((p.travaux || {})[id], 0, 99) > 0);
        const planchers = b.paliers.filter(sansExigence);
        if (planchers.length > 1) return { refus: 'deuxPlanchers' };
        const notes = b.paliers.map((p) => notePalier(p.note));
        if (planchers.length === 1 && notePalier(planchers[0].note) > Math.min.apply(null, notes)) return { refus: 'plancherTropHaut', nom: String(planchers[0].lettre).trim() };
        return null;
    }

    /** La valeur d'un niveau : un nombre, zéro ou plus, SANS PLAFOND (décision de Grégoire, 9 nov. 2026, 20 h 55 : un niveau peut valoir plus de 100). */
    function valeurDeNiveau(v) { return _nombreEntre(v, 0, Infinity); }

    /**
     * Les niveaux d'une échelle, tels que le brouillon les règle : la lettre, le nom, la valeur, l'ordre.
     * LES SEUILS NE BOUGENT PAS (décision de Grégoire, 9 nov. 2026, 20 h 49). La valeur dit ce que le niveau pèse dans la
     * note ; le seuil (`min`, `max`) dit à partir de quel pourcentage une copie évaluée avec une grille le reçoit : ce sont
     * deux idées. Un niveau gardé conserve donc ses seuils, sa couleur et sa description, quelle que soit sa valeur.
     * Un niveau AJOUTÉ ici n'a pas de seuils : la conversion d'un pourcentage en niveau (`niveauDuPourcentage`,
     * evaluation-calcul.js) écarte un niveau sans seuils — il se saisit au tableau, et ne sert à une évaluation avec grille
     * que le jour où ses seuils sont donnés en vue étendue. Il n'a pas non plus de couleur à lui (couleur neutre au tableau).
     */
    function niveauxRegles(anciens, brouillon) {
        const parLettre = new Map((anciens || []).map((n) => [String(n.code), n]));
        return brouillon.map((x) => Object.assign({}, (x.origine && parLettre.get(x.origine)) || {},
            { code: String(x.code).trim(), nom: String(x.nom).trim(), valeurCalcul: valeurDeNiveau(x.valeur) }));
    }

    /* ---------- le geste de mise à jour (voulu par Grégoire, 9 nov. 2026, 20 h 49) ----------
       Comme dans un tableur, changer une valeur doit pouvoir faire suivre les notes. Le geste ne touche QUE les résultats
       saisis au tableau (sans grille) des groupes qui ont cette pratique ; il n'écrit que la valeur (`noteFinale`) : le niveau
       inscrit reste, aucun résultat n'est créé ni effacé, aucune copie évaluée avec une grille n'est touchée. */

    /**
     * Les résultats saisis avec une ancienne valeur.
     * @param {Array} evaluations - le stock du trimestre
     * @param {{idsEchelle: string[], niveaux: Array, groupes: string[], cours: string[], colonnesAEchellePropre: string[]}} c -
     *        l'échelle de la pratique (et celles dont elle est la copie), ses niveaux d'aujourd'hui, les groupes qui ont
     *        cette pratique et leurs cours, et les productions qui ont LEUR échelle (leurs résultats ne suivent pas celle de
     *        la pratique, même si elles portent le même identifiant d'origine)
     * @returns {Array<{id: string, niveau: string, avant: number, apres: number}>}
     */
    function resultatsAMettreAJour(evaluations, c) {
        const valeurs = new Map((c.niveaux || []).map((n) => [String(n.code), Number(n.valeurCalcul)]));
        const duGroupe = (e) => (e.groupeCoursId ? c.groupes.indexOf(e.groupeCoursId) >= 0 : c.cours.indexOf(e.coursId) >= 0);
        const propres = c.colonnesAEchellePropre || [];
        return (evaluations || []).filter((e) => e && e.sansGrille === true && !e.remplaceeParId && typeof e.noteFinale === 'number'
            && c.idsEchelle.indexOf(e.echelleId) >= 0 && propres.indexOf(e.productionId) < 0 && duGroupe(e)
            && valeurs.has(String(e.niveauFinal)) && valeurs.get(String(e.niveauFinal)) !== e.noteFinale)
            .map((e) => ({ id: e.id, niveau: String(e.niveauFinal), avant: e.noteFinale, apres: valeurs.get(String(e.niveauFinal)) }));
    }

    /** Écrit la valeur d'aujourd'hui dans ces résultats, et rien d'autre. Un résultat qui a changé depuis le compte (sa valeur, ou son niveau) n'est pas touché. */
    function appliquerMiseAJour(evaluations, lot) {
        const parId = new Map((lot || []).map((x) => [x.id, x]));
        return (evaluations || []).map((e) => {
            const x = e && parId.get(e.id);
            return (x && e.sansGrille === true && e.noteFinale === x.avant && String(e.niveauFinal) === x.niveau) ? Object.assign({}, e, { noteFinale: x.apres }) : e;
        });
    }

    /* ---------- les colonnes du tableau ---------- */

    /** Une colonne renommée, redatée, retypée : ces trois champs et la date de modification ; le reste de la production ne bouge pas. */
    function colonneModifiee(production, { titre, date, type, maintenant }) {
        const p = Object.assign({}, production, { titre: String(titre || '').trim(), dateModification: maintenant });
        if (date !== undefined) p.dateEcheance = date || '';   // `undefined` : la date ne se règle pas ici (échéances par groupe)
        if (type !== undefined && type !== null && type !== '') p.type = type;   // `undefined` : le type n'a pas été changé
        return p;
    }

    /** La marque « compte dans la note » : le champ de la vue étendue (`configuration.productionsExclues`, une liste d'exclusions). */
    function poserCompte(pratique, productionId, compte) {
        const p = _copie(pratique);
        const exclues = new Set(Array.isArray(p.configuration.productionsExclues) ? p.configuration.productionsExclues : []);
        if (compte) exclues.delete(productionId); else exclues.add(productionId);
        if (exclues.size) p.configuration.productionsExclues = Array.from(exclues); else delete p.configuration.productionsExclues;
        return p;
    }

    /** Le nom de l'échelle née avec une pratique de la vue simple. PROPOSÉ (ni « IDME », ni « de départ »). */
    const NOM_ECHELLE = 'Mes niveaux';

    /**
     * L'échelle de la pratique, réglée. Elle APPARTIENT à la pratique (`pratiqueId`) : née avec elle en vue simple, ou
     * copiée ici à la première modification quand la pratique lisait une échelle du trimestre (que d'autres pratiques,
     * des productions ou des grilles peuvent lire aussi : elle n'est jamais modifiée).
     * @returns {{echelle: Object, copiee: boolean}}
     */
    function echelleReglee(echelle, pratique, niveauxDuBrouillon, { idNeuf, maintenant, lueAilleurs, naissance }) {
        // À ELLE SEULE : née avec cette pratique ET lue par personne d'autre (`lueAilleurs` : une autre pratique — une
        // copie faite en vue étendue garde le même identifiant d'échelle —, ou une production). Sinon, on copie.
        const propre = !!echelle && echelle.pratiqueId === pratique.id && !lueAilleurs;
        // `origines` : les échelles d'où celle-ci a été COPIÉE AU RÉGLAGE, de la plus ancienne à la plus récente. Les résultats
        // de la pratique saisis avant la copie portent encore leur identifiant : c'est par elles que le tableau pose le signe
        // « ≠ », que le retrait d'un niveau utilisé reste refusé et que « Mettre à jour » les retrouve. À la NAISSANCE d'une
        // pratique, aucune origine : aucun résultat ne peut la précéder, et l'échelle de départ est celle d'autres colonnes.
        const origines = (naissance || !echelle) ? [] : (Array.isArray(echelle.origines) ? echelle.origines : []).concat([echelle.id]);
        const base = propre ? _copie(echelle) : { id: idNeuf, nom: NOM_ECHELLE, pratiqueId: pratique.id, origines, dansBibliotheque: true, verrouille: false, dateCreation: maintenant };
        base.niveaux = niveauxRegles(echelle ? echelle.niveaux : [], niveauxDuBrouillon);
        base.dateModification = maintenant;
        return { echelle: base, copiee: !propre };
    }

    /** L'échelle a-t-elle changé ? (une règle changée sans toucher aux niveaux ne copie ni n'écrit aucune échelle) */
    function niveauxChanges(echelle, niveauxDuBrouillon) {
        const avant = ((echelle && echelle.niveaux) || []).map((n) => [String(n.code), n.nom || '', _valeurDuNiveau(n)]);
        const apres = niveauxDuBrouillon.map((x) => [String(x.code).trim(), String(x.nom).trim(), valeurDeNiveau(x.valeur)]);
        return JSON.stringify(avant) !== JSON.stringify(apres);
    }

    /** Pose les types et les paliers du brouillon. Un palier sans aucune exigence est le palier plancher (lecture du calcul). */
    function poserSpecifications(pratique, brouillon) {
        const p = _copie(pratique);
        const avant = new Map((p.configuration.typesTravaux || []).map((t) => [String(t.id), t]));
        p.configuration.typesTravaux = brouillon.types.map((t) => Object.assign({}, avant.get(String(t.id)) || {}, { id: t.id, nom: String(t.nom).trim() }));
        const ids = new Set(brouillon.types.map((t) => String(t.id)));
        const forfaits = new Map((p.configuration.forfaits || []).map((f) => [String(f.id), f]));
        p.configuration.forfaits = brouillon.paliers.map((x) => {
            const travaux = {};
            Object.keys(x.travaux || {}).forEach((id) => { const n = _nombreEntre(x.travaux[id], 0, 99); if (ids.has(String(id)) && n) travaux[id] = Math.round(n); });
            return Object.assign({}, forfaits.get(String(x.id)) || {}, { id: x.id, lettre: String(x.lettre).trim(), note: notePalier(x.note), travaux });
        }).sort((a, b) => b.note - a.note);
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

    window.VueSimpleDonnees = {
        VUES, CLE_CHOIX, CLE_MARQUE, ECRANS, FAMILLES, REGLES_STD, GROUPE_SIMPLE, RAISONS,
        applicationVide, vueAuDemarrage,
        analyserListeCollee, trimestreDeLaDate, ficheEleve, groupeCoursLeger, productionLegere,
        pratiqueDepuisModele, regleStd, poserRegleStd,
        brouillonDeLaPratique, gestes, refusDesNiveaux, refusDesSpecifications, niveauxRegles, echelleReglee, niveauxChanges, poserSpecifications, NOM_ECHELLE,
        resultatsAMettreAJour, appliquerMiseAJour, colonneModifiee, poserCompte,
        aUneGrille, rangDeProduction
    };
})();
