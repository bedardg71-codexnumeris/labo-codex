/**
 * LE NIVEAU RETENU ET LA NOTE — la pratique « Par standards », lots 3 et 4 (21 nov. 2026)
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (§ 4, § 5, lots 3 et 4 ; décisions du mandat en tête).
 * Fiche des règles : plans de travail/CONCEPTION-2026-11-20-pratique-par-standards.md (T2, T3, F1 à F4, F7).
 *
 * LECTURE SEULE. Ce module ne lit que trois clés, par leurs propriétaires : l'ensemble de cibles (`EnsemblesCibles`),
 * l'échelle de la pratique, les inscriptions (`InscriptionsCibles.lireToutes`). Il n'écrit RIEN, et il ne lit jamais
 * `evaluationsSauvegardees` ni `indicesCP` : une évaluation saisie par habitude ne change pas cette note (plan, § 6,
 * point 3). Les coches des critères ne sont lues par aucun calcul (choix de Grégoire, 21 nov. 2026, 8 h 38).
 *
 * LE NIVEAU RETENU D'UNE CIBLE (geste 3) :
 *   1. Le meilleur niveau parmi les inscriptions NON ANNULÉES qui PORTENT un niveau. Il ne redescend jamais : un niveau
 *      plus bas inscrit plus tard ne le change pas. (R, p. 103 ; T2, T3 ; confirmé par le cas A, courriel du 21 nov.)
 *   2. Seule une annulation peut le faire baisser (une trace invalidée). (Choix de Grégoire : rien ne s'efface.)
 *   3. Une inscription sans niveau (une remarque, `niveau: null`) n'y entre jamais. Une cible qui n'a que des remarques,
 *      ou rien, est « sans donnée » : elle porte le NOM du niveau « sans donnée » de l'échelle, jamais un vide ni un zéro.
 *   6. L'ordre des niveaux vient de `ordonnerNiveauxParPlage` (profil-etudiant-calculs.js), seule source. Ordre
 *      illisible : rien n'est retenu, et le motif se dit en clair. Un code absent de l'échelle n'est pas lu.
 *   Entre deux inscriptions du même meilleur niveau, celle qui est retenue (sa date, son origine, sa rétroaction) est la
 *   PREMIÈRE à l'avoir démontré : la date de la trace, puis le moment de l'écriture. (Supposé, dit au rapport.)
 *
 * LA NOTE (geste 4) :
 *   7. La moyenne pondérée des valeurs ponctuelles (`valeurNumeriqueDuNiveau`, echelles.js : `valeurCalcul`, jamais le
 *      milieu de la plage) des niveaux retenus, au poids de chaque cible. (R, p. 103 ; F1, F2.)
 *   8. Le double seuil : un réglage de la pratique, ÉTEINT au départ (choix de Grégoire, 21 nov. 2026, 12 h 20 ; cas A,
 *      courriel du 21 nov.). Allumé : la note est plafonnée (55 % d'office) si la moyenne des cibles TERMINALES est
 *      INFÉRIEURE au seuil (60 % d'office) ; « inférieure » est strict, 60 % pile n'est pas plafonné (supposé par Cowork,
 *      à confirmer). La moyenne des terminales est pondérée par leurs poids (supposé ici, à confirmer). Sans cible
 *      terminale, il ne s'allume pas.
 *   9. Pendant la session, aucune note chiffrée tant qu'une cible est sans donnée : la liste des cibles en attente, à la
 *      place. (Choix de Grégoire, 20 nov. 2026, sans source ; le cas A ne le confirme ni ne l'infirme : F7.)
 *  10. À l'arrêt des notes (« Notes finalisées » cochée dans la fiche de la pratique : `configuration.notesFinales`),
 *      une cible sans donnée compte pour 0 %. (R, p. 103 ; F3 ; confirmé par le cas A, courriel du 21 nov.)
 *  11. Une cible dont le niveau retenu EST le niveau « sans donnée » (inscrit explicitement) se traite comme une cible
 *      sans inscription : en attente pendant la session, 0 % à l'arrêt. (Tranché par Cowork, supposé.)
 *  12. Une valeur ponctuelle manquante : « non calculable », avec son motif, jamais un chiffre.
 *  15. Une reprise n'est jamais plafonnée : le niveau inscrit depuis une reprise est un niveau comme un autre.
 *
 * Mots de l'écran : PROPOSÉS (plans de travail/TEXTES-2026-11-21-par-standards-lots-3-4.md).
 */
(function () {
    'use strict';

    const ETATS = Object.freeze({ NOTE: 'note', ATTENTE: 'attente', NON_CALCULABLE: 'non-calculable' });
    const DOUBLE_SEUIL_DEFAUT = Object.freeze({ actif: false, seuil: 60, plafond: 55 });

    /* ------------------------------------------------------------------ Les motifs, en mots (propositions) */
    const MOTIFS = Object.freeze({
        ECHELLE_INTROUVABLE: 'L’échelle de cette pratique est introuvable dans ce trimestre : aucun niveau ne peut être retenu. Rouvre la pratique dans l’assistant pour la choisir.',
        ECHELLE_VIDE: 'L’échelle de cette pratique n’a aucun niveau : aucun niveau ne peut être retenu.',
        ORDRE_SANS_BORNE: (noms) => `L’ordre des niveaux est illisible : ${noms} n’${noms.indexOf(' et ') !== -1 ? 'ont' : 'a'} pas de borne « Min ». `
            + 'Aucun niveau n’est retenu tant que l’échelle ne dit pas l’ordre de ses niveaux (Conception → Échelles de performance).',
        ORDRE_EGALITE: (a, b) => `L’ordre des niveaux est illisible : « ${a} » et « ${b} » ont la même plage. `
            + 'Aucun niveau n’est retenu tant que l’échelle ne dit pas lequel est le plus haut (Conception → Échelles de performance).',
        ORDRE_CODE_DOUBLE: (code) => `L’ordre des niveaux est illisible : deux niveaux portent le code « ${code} ». `
            + 'Aucun niveau n’est retenu tant que chaque niveau n’a pas son propre code (Conception → Échelles de performance).',
        ORDRE_SANS_OUTIL: 'L’ordre des niveaux ne peut pas être lu : aucun niveau n’est retenu.',
        AUCUNE_CIBLE: 'Cette pratique n’a aucune cible. Rouvre-la dans l’assistant pour dire les cibles du cours.',
        POIDS: (cible) => `Note non calculable : la cible « ${cible} » n’a pas de poids plus grand que zéro. Rouvre la pratique dans l’assistant pour lui en donner un.`,
        VALEUR_MANQUANTE: (niveau, cible) => `Note non calculable : le niveau « ${niveau} », retenu pour la cible « ${cible} », n’a pas de valeur ponctuelle. `
            + 'Donne-lui une valeur dans Conception → Échelles de performance.',
        ATTENTE: (etiquettes) => `Pas encore de note : ${etiquettes.length > 1 ? 'les cibles' : 'la cible'} ${etiquettes.map(e => '« ' + e + ' »').join(', ')} `
            + `${etiquettes.length > 1 ? 'sont' : 'est'} sans donnée. La note se calcule quand chaque cible a un niveau retenu, ou à l’arrêt des notes.`
    });

    /* ------------------------------------------------------------------ Outils */

    function codeNorme(code) {
        return (code === undefined || code === null) ? '' : String(code).trim().toUpperCase();
    }

    function _ordonner(niveaux) {
        if (typeof ordonnerNiveauxParPlage === 'function') return ordonnerNiveauxParPlage(niveaux);   // eslint-disable-line no-undef
        if (typeof window !== 'undefined' && typeof window.ordonnerNiveauxParPlage === 'function') return window.ordonnerNiveauxParPlage(niveaux);
        return null;
    }

    function _valeurPonctuelle(niveau) {
        const f = (typeof valeurNumeriqueDuNiveau === 'function') ? valeurNumeriqueDuNiveau   // eslint-disable-line no-undef
            : ((typeof window !== 'undefined' && typeof window.valeurNumeriqueDuNiveau === 'function') ? window.valeurNumeriqueDuNiveau : null);
        if (!f || !niveau) return null;
        // La valeur PONCTUELLE seule, par la seule source (#527 : jamais le milieu de la plage).
        const v = f(niveau);
        return (typeof v === 'number' && Number.isFinite(v)) ? v : null;
    }

    function _lirePoids(p) {
        if (typeof p === 'number') return p;
        if (p === null || p === undefined) return NaN;
        const t = String(p).trim().replace(',', '.');
        return t === '' ? NaN : Number(t);
    }

    function _nomDuNiveau(n) {
        return n ? String(n.nom || n.code || '') : '';
    }

    /* ------------------------------------------------------------------ L'ordre de l'échelle (règle 6) */

    /**
     * L'ordre des niveaux d'une échelle, par `ordonnerNiveauxParPlage` (seule source). Illisible : un niveau codé sans
     * borne « Min » (l'ordre l'écarte), deux niveaux de même plage (rien ne départage), deux niveaux de même code.
     * @param {Object} echelle
     * @returns {{ok:true, parCode:Map<string,{rang:number, niveau:Object}>, rangMax:number} | {ok:false, motif:string}}
     */
    /** Le motif d'un code porté par deux niveaux, ou null. */
    function _motifCodeDouble(codes) {
        const vus = new Set();
        const double = codes.find(n => { const c = codeNorme(n.code); const deja = vus.has(c); vus.add(c); return deja; });
        return double ? MOTIFS.ORDRE_CODE_DOUBLE(String(double.code).trim()) : null;
    }

    /** Le motif des niveaux que l'ordre écarte (sans borne « Min »), ou null. */
    function _motifSansBorne(codes, ordre) {
        if (ordre.length >= codes.length) return null;
        const ranges = new Set(ordre.map(o => o.code));
        const ecartes = codes.filter(n => !ranges.has(codeNorme(n.code))).map(n => `« ${_nomDuNiveau(n)} »`);
        return MOTIFS.ORDRE_SANS_BORNE(ecartes.length > 1 ? ecartes.slice(0, -1).join(', ') + ' et ' + ecartes[ecartes.length - 1] : ecartes[0]);
    }

    /** Le motif de deux niveaux de même plage (rien ne les départage), ou null. */
    function _motifEgalite(ordre) {
        const borneHaute = (o) => (Number.isFinite(o.max) ? o.max : Infinity);
        const i = ordre.findIndex((b, k) => k > 0 && ordre[k - 1].min === b.min && borneHaute(ordre[k - 1]) === borneHaute(b));
        return i > 0 ? MOTIFS.ORDRE_EGALITE(ordre[i - 1].nom || ordre[i - 1].code, ordre[i].nom || ordre[i].code) : null;
    }

    function ordreDeLEchelle(echelle) {
        if (!echelle || !Array.isArray(echelle.niveaux)) return { ok: false, motif: MOTIFS.ECHELLE_INTROUVABLE };
        const codes = echelle.niveaux.filter(n => n && codeNorme(n.code) !== '');
        if (codes.length === 0) return { ok: false, motif: MOTIFS.ECHELLE_VIDE };
        const double = _motifCodeDouble(codes);
        if (double) return { ok: false, motif: double };
        const ordre = _ordonner(codes);
        if (!Array.isArray(ordre)) return { ok: false, motif: MOTIFS.ORDRE_SANS_OUTIL };
        const illisible = _motifSansBorne(codes, ordre) || _motifEgalite(ordre);
        if (illisible) return { ok: false, motif: illisible };
        const parCode = new Map();
        ordre.forEach(o => {
            const niveau = codes.find(n => codeNorme(n.code) === o.code);
            parCode.set(o.code, { rang: o.rang, niveau });
        });
        return { ok: true, parCode, rangMax: ordre.length };
    }

    /* ------------------------------------------------------------------ Le niveau retenu (règles 1, 2, 3, 6) */

    function _plusAncienneDAbord(a, b) {
        return String(a.date || '').localeCompare(String(b.date || ''))
            || String(a.horodatage || '').localeCompare(String(b.horodatage || ''));
    }

    /**
     * Le niveau retenu d'UNE case, à partir de son historique (`InscriptionsCibles.historiqueDeLaCase`).
     * @param {Array<{inscription, annulation}>} historique
     * @param {Object} ordre - le résultat de `ordreDeLEchelle`
     * @returns {{retenu:Object|null, niveau:Object|null, rang:number|null, dernier:Object|null, dernierNiveau:Object|null,
     *            dernierPlusBas:boolean, actives:number, remarques:number, annulees:number, horsEchelle:number}}
     */
    function retenirDansLHistorique(historique, ordre) {
        const h = Array.isArray(historique) ? historique : [];
        const actives = h.filter(x => x && x.inscription && !x.annulation).map(x => x.inscription);
        const IC = (typeof window !== 'undefined') ? window.InscriptionsCibles : null;
        const lireNiveau = (v) => (IC ? IC.lireNiveau(v) : ((v === undefined || v === null || String(v) === '') ? null : String(v)));
        const avecNiveau = actives.filter(i => lireNiveau(i.niveau) !== null);
        const base = { retenu: null, niveau: null, rang: null, dernier: null, dernierNiveau: null, dernierPlusBas: false,
            actives: actives.length, remarques: actives.length - avecNiveau.length, annulees: h.length - actives.length, horsEchelle: 0 };
        if (!ordre || !ordre.ok) return base;
        // Règle 6 : un code absent de l'échelle n'est pas lu.
        const lues = avecNiveau.map(i => ({ i, o: ordre.parCode.get(codeNorme(i.niveau)) })).filter(x => !!x.o);
        base.horsEchelle = avecNiveau.length - lues.length;
        if (lues.length === 0) return base;
        // Règle 1 : le meilleur ; entre deux du même niveau, la première qui l'a démontré.
        const rangMax = Math.max.apply(null, lues.map(x => x.o.rang));
        const meilleur = lues.filter(x => x.o.rang === rangMax).sort((a, b) => _plusAncienneDAbord(a.i, b.i))[0];
        // Le dernier niveau inscrit (lu), pour dire à l'historique qu'il est plus bas que le retenu.
        const dernier = lues.slice().sort((a, b) => _plusAncienneDAbord(b.i, a.i))[0];
        return Object.assign(base, { retenu: meilleur.i, niveau: meilleur.o.niveau, rang: rangMax,
            dernier: dernier.i, dernierNiveau: dernier.o.niveau, dernierPlusBas: dernier.o.rang < rangMax });
    }

    /**
     * Le niveau retenu de chaque cible pour un·e étudiant·e. Pure.
     * @param {{liste:Array, da:string, ensembleId:string, cibles:Array, echelle:Object, codeSansDonnee:string}} p
     * @returns {{ordre:Object, lignes:Array<Object>}} une ligne par cible, dans l'ordre de l'ensemble :
     *   { cible, historique, retenu, niveau, rang, dernier, dernierNiveau, dernierPlusBas, actives, remarques, annulees,
     *     horsEchelle, sansDonnee, sansDonneeInscrit }
     */
    function retenirParCible(p) {
        const q = p || {};
        const IC = window.InscriptionsCibles;
        const ordre = ordreDeLEchelle(q.echelle);
        const sansDonneeCode = codeNorme(q.codeSansDonnee);
        const lignes = (Array.isArray(q.cibles) ? q.cibles : []).map(cible => {
            const historique = IC.historiqueDeLaCase(q.liste, q.da, q.ensembleId, cible.id);
            const r = retenirDansLHistorique(historique, ordre);
            const sansDonneeInscrit = !!r.retenu && sansDonneeCode !== '' && codeNorme(r.retenu.niveau) === sansDonneeCode;
            return Object.assign({ cible, historique }, r, { sansDonnee: !r.retenu || sansDonneeInscrit, sansDonneeInscrit });
        });
        return { ordre, lignes };
    }

    /* ------------------------------------------------------------------ Le double seuil (règle 8) */

    function _borne(v, defaut) {
        const n = (typeof v === 'number') ? v : Number(String(v == null ? '' : v).trim().replace(',', '.'));
        return (String(v == null ? '' : v).trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 100) ? n : defaut;
    }

    /** Le réglage du double seuil d'une configuration : éteint d'office, 60 et 55 d'office. */
    function lireDoubleSeuil(configuration) {
        const d = (configuration && configuration.doubleSeuil) || {};
        return { actif: d.actif === true, seuil: _borne(d.seuil, DOUBLE_SEUIL_DEFAUT.seuil), plafond: _borne(d.plafond, DOUBLE_SEUIL_DEFAUT.plafond) };
    }

    /** Vrai si au moins une cible est terminale : sans elle, le double seuil ne peut pas s'allumer. */
    function aDesCiblesTerminales(cibles) {
        return (Array.isArray(cibles) ? cibles : []).some(c => c && c.terminale === true);
    }

    /* ------------------------------------------------------------------ La note (règles 7 à 12) */

    function _moyennePonderee(lignes) {
        const poids = lignes.reduce((s, l) => s + l.poids, 0);
        return poids > 0 ? lignes.reduce((s, l) => s + l.valeur * l.poids, 0) / poids : null;
    }

    /**
     * La note d'un·e étudiant·e à partir des niveaux retenus. Pure.
     * @param {{retenue:{ordre, lignes}, notesFinales:boolean, doubleSeuil:{actif, seuil, plafond}}} p
     * @returns {{etat:string, note:number|null, moyenne:number|null, motif:string|null, enAttente:Array, lignes:Array,
     *            terminales:{moyenne:number|null, nombre:number}, doubleSeuil:Object, plafonnement:Object|null, notesFinales:boolean}}
     *   `lignes` : { cible, niveau, valeur, poids, part, compte: 'retenu' | 'zero-arret' | 'attente' }
     */
    function calculerNote(p) {
        const q = p || {};
        const retenue = q.retenue || { ordre: { ok: false, motif: MOTIFS.ECHELLE_INTROUVABLE }, lignes: [] };
        const notesFinales = q.notesFinales === true;
        const ds = Object.assign({}, DOUBLE_SEUIL_DEFAUT, q.doubleSeuil || {});
        const resultat = { etat: ETATS.NON_CALCULABLE, note: null, moyenne: null, motif: null, enAttente: [], lignes: [],
            terminales: { moyenne: null, nombre: 0 }, doubleSeuil: ds, plafonnement: null, notesFinales };
        if (!retenue.ordre || !retenue.ordre.ok) { resultat.motif = (retenue.ordre && retenue.ordre.motif) || MOTIFS.ECHELLE_INTROUVABLE; return resultat; }
        if (retenue.lignes.length === 0) { resultat.motif = MOTIFS.AUCUNE_CIBLE; return resultat; }
        const lu = _lignesDeLaNote(retenue.lignes, notesFinales);
        resultat.lignes = lu.lignes;
        resultat.enAttente = lu.enAttente;
        if (lu.motifPoids) { resultat.lignes = []; resultat.motif = lu.motifPoids; return resultat; }
        // Règle 12 : une valeur ponctuelle manquante l'emporte sur l'attente — la note ne pourrait pas se faire non plus.
        const manquante = resultat.lignes.find(l => l.compte === 'retenu' && l.valeur === null);
        if (manquante) { resultat.motif = MOTIFS.VALEUR_MANQUANTE(_nomDuNiveau(manquante.niveau), manquante.cible.etiquette); return resultat; }
        if (resultat.enAttente.length) {
            resultat.etat = ETATS.ATTENTE;
            resultat.motif = MOTIFS.ATTENTE(resultat.enAttente.map(c => c.etiquette));
            return resultat;
        }
        resultat.moyenne = _moyennePonderee(resultat.lignes);
        const terminales = resultat.lignes.filter(l => l.cible.terminale === true);
        resultat.terminales = { moyenne: terminales.length ? _moyennePonderee(terminales) : null, nombre: terminales.length };
        resultat.plafonnement = _secondSeuil(ds, resultat.moyenne, resultat.terminales);
        resultat.etat = ETATS.NOTE;
        resultat.note = (resultat.plafonnement && resultat.plafonnement.sousLeSeuil) ? Math.min(resultat.moyenne, ds.plafond) : resultat.moyenne;
        return resultat;
    }

    /**
     * Les lignes de la note : chaque cible, sa valeur ponctuelle et son poids. Règles 9, 10, 11 : une cible sans donnée est
     * en attente pendant la session, 0 % à l'arrêt des notes. Un poids qui n'est pas plus grand que zéro rend son motif.
     * @returns {{lignes:Array, enAttente:Array, motifPoids:string|null}}
     */
    function _lignesDeLaNote(lignesRetenues, notesFinales) {
        const lignes = [], enAttente = [];
        for (const l of lignesRetenues) {
            const poids = _lirePoids(l.cible.poids);
            if (!(poids > 0)) return { lignes, enAttente, motifPoids: MOTIFS.POIDS(l.cible.etiquette) };
            const base = { cible: l.cible, niveau: l.niveau, poids };
            if (!l.sansDonnee) lignes.push(Object.assign(base, { valeur: _valeurPonctuelle(l.niveau), compte: 'retenu' }));
            else if (notesFinales) lignes.push(Object.assign(base, { valeur: 0, compte: 'zero-arret' }));
            else { lignes.push(Object.assign(base, { valeur: null, compte: 'attente' })); enAttente.push(l.cible); }
        }
        const total = lignes.reduce((s, l) => s + l.poids, 0);
        lignes.forEach(l => { l.part = total > 0 ? l.poids / total * 100 : null; });
        return { lignes, enAttente, motifPoids: null };
    }

    /** Règle 8 : le second seuil, allumé ET au moins une terminale ; « inférieure » est strict. Sinon null. */
    function _secondSeuil(ds, moyenne, terminales) {
        if (!ds.actif || terminales.nombre === 0) return null;
        const sous = terminales.moyenne < ds.seuil;
        return { seuil: ds.seuil, plafond: ds.plafond, moyenneTerminales: terminales.moyenne, sousLeSeuil: sous, applique: sous && moyenne > ds.plafond };
    }

    /* ------------------------------------------------------------------ Lire le stockage (la pratique d'un·e étudiant·e) */

    function _echelleDe(id) {
        if (!id) return null;
        const resolue = (typeof obtenirEchelleResolue === 'function') ? obtenirEchelleResolue(id) : null;   // eslint-disable-line no-undef
        if (resolue && Array.isArray(resolue.niveaux)) return resolue;
        const liste = (typeof db !== 'undefined' && typeof cle === 'function') ? (db.getSync(cle('echellesTemplates'), []) || []) : [];   // eslint-disable-line no-undef
        return (Array.isArray(liste) ? liste : []).find(e => e && e.id === id) || null;
    }

    /**
     * Tout ce que la pratique dit d'un·e étudiant·e : les cibles, l'échelle, le niveau retenu de chaque cible, la note.
     * Lecture seule. `liste` : les inscriptions déjà lues (un rendu qui boucle sur la classe les lit une fois).
     * @param {Object} configuration - `pratique.configuration` ({ type: 'cibles', ensembleCiblesId, echelleId, niveauSansDonnee, notesFinales, doubleSeuil })
     * @param {string} da
     * @param {Array} [liste]
     */
    function lireEleve(configuration, da, liste) {
        const conf = configuration || {};
        const EC = window.EnsemblesCibles;
        const ensemble = EC ? EC.lireParId(conf.ensembleCiblesId) : null;
        const cibles = ensemble ? EC.normaliserCibles(ensemble.cibles) : [];
        const echelle = _echelleDe(conf.echelleId);
        const codeSansDonnee = conf.niveauSansDonnee == null ? '' : String(conf.niveauSansDonnee);
        const niveauSansDonnee = (echelle && Array.isArray(echelle.niveaux))
            ? (echelle.niveaux.find(n => n && codeSansDonnee !== '' && codeNorme(n.code) === codeNorme(codeSansDonnee)) || null) : null;
        const doubleSeuil = lireDoubleSeuil(conf);
        const notesFinales = conf.notesFinales === true;
        const base = { ensemble, cibles, echelle, codeSansDonnee, niveauSansDonnee, doubleSeuil, notesFinales };
        if (!ensemble) {
            const motif = EC ? EC.MOTIFS.INTROUVABLE : MOTIFS.AUCUNE_CIBLE;
            return Object.assign(base, { retenue: { ordre: { ok: false, motif }, lignes: [] },
                note: { etat: ETATS.NON_CALCULABLE, note: null, motif, enAttente: [], lignes: [], plafonnement: null, notesFinales, doubleSeuil } });
        }
        const inscriptions = Array.isArray(liste) ? liste : (window.InscriptionsCibles ? window.InscriptionsCibles.lireToutes() : []);
        const retenue = retenirParCible({ liste: inscriptions, da, ensembleId: ensemble.id, cibles, echelle, codeSansDonnee });
        const note = calculerNote({ retenue, notesFinales, doubleSeuil });
        return Object.assign(base, { retenue, note });
    }

    /** Le nom à montrer pour une cible sans donnée : celui du niveau « sans donnée » de l'échelle (règle 3). */
    function nomSansDonnee(eleve) {
        return (eleve && eleve.niveauSansDonnee) ? _nomDuNiveau(eleve.niveauSansDonnee) : 'sans donnée';
    }

    window.NoteCibles = {
        ETATS,
        MOTIFS,
        DOUBLE_SEUIL_DEFAUT,
        codeNorme,
        ordreDeLEchelle,
        retenirDansLHistorique,
        retenirParCible,
        lireDoubleSeuil,
        aDesCiblesTerminales,
        calculerNote,
        lireEleve,
        nomSansDonnee
    };
})();
