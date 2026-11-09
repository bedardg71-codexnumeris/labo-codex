/**
 * TABLEAU DE NOTATION — l'écran (lot 1, 9 nov. 2026)
 *
 * Plan : `plans de travail/PLAN-2026-11-09-tableau-de-notation.md` ; ébauches `EBAUCHE-2026-11-09-tableau-*.dc.html`.
 * Une seconde vue des MÊMES évaluations, dans Évaluation › Liste (décidé par Cowork : aucune entrée de navigation
 * neuve). Élèves en lignes, productions en colonnes, la note en bout de ligne. On y saisit, au toucher ou au
 * clavier, ce que la pratique demande : un niveau (standards), acceptable ou non (spécifications). Une copie évaluée
 * avec une grille s'y lit et s'ouvre au toucher ; elle ne s'y modifie pas.
 *
 * LA NOTE vient de `simulerIndices` (la source de l'export des résultats) ; « retenue » vient du détail de la note des
 * standards (`details.portfolio.artefactsRetenus`, la terminale) ; les comptes par type et le jugement d'une copie avec
 * grille, de l'instance des spécifications configurée comme la pratique (deux de ses méthodes internes,
 * `_compterTravauxAcceptables` et `_estTravailAcceptable`, lues sans écrire). Aucune règle de note n'est recopiée ici.
 *
 * MOTS DE L'ÉCRAN : VALIDÉS par Grégoire, mot pour mot (9 nov. 2026, 15 h 38 à 15 h 40), réunis dans `MOTS` ; le banc les
 * exige (tests/unit/tableau-notation-1.test.js, bloc F). L'infobulle `valeurChangee` l'a été à 16 h 20, avec son ajout.
 * Données et écriture pure : `tableau-notation-donnees.js`.
 */
(function () {
    'use strict';

    const MOTS = Object.freeze({
        titre: 'Tableau de notation',
        intro: 'Saisis le résultat de chaque production, qu’elle ait été évaluée ici ou ailleurs. La note de chaque étudiant·e se construit dans la dernière colonne, selon les réglages de ta pratique.',
        avis: 'Un résultat saisi ici compte dans la note, mais il n’a pas de critères : il ne donne ni forces, ni défis, ni rétroaction par critère.',
        annuler: 'Annuler',
        // Validée par Grégoire, mot pour mot (9 nov. 2026, 16 h 20) — l'échelle a changé depuis la saisie ; l'infobulle et le lecteur d'écran disent la même phrase.
        valeurChangee: (valeur) => `L’échelle a changé depuis la saisie : ce résultat compte encore pour ${valeur}. Ressaisis le niveau pour prendre la valeur d’aujourd’hui.`,
        exporter: 'Exporter la synthèse (CSV)',   // le bouton de Suivi › Groupe, repris tel quel (consigne)
        reglages: 'Réglages de la pratique',      // le lien du profil (pratiques-gestion.js, `ouvrirReglagesPratique`), repris tel quel
        eleve: 'Étudiant·e',
        noteProvisoire: 'Note provisoire',
        noteFinale: 'Note finale',
        enAttente: 'en attente de résultats',
        // Validée par Grégoire, mot pour mot (9 nov. 2026, 16 h 18) : au tableau, à la place des deux phrases du calcul partagé.
        aucuneEvaluee: 'Aucune production n’est encore évaluée.',
        nonCalculable: 'non calculable',
        aSaisir: 'à saisir',
        avecGrille: 'évaluée avec une grille ; toucher pour l’ouvrir',
        aucunePratique: 'Ce groupe-cours n’a pas de pratique de notation. Choisis-en une dans Conception › Pratiques : le tableau suivra ses réglages.',
        autreFamille: 'Le tableau de notation sert aux pratiques par standards et par spécifications. Pour la pratique de ce groupe-cours, la Liste reste la vue de tes évaluations.',
        aucunEleve: 'Aucun·e étudiant·e dans ce groupe-cours. Ajoute ta liste dans Cadre › Trimestre pour remplir le tableau.',
        aucuneProduction: 'Aucune production n’entre dans la note de ta pratique. Crée tes productions dans Conception › Productions.',
        sansEchelle: 'Ni tes productions ni ta pratique n’ont d’échelle dont les niveaux portent une valeur : aucun niveau ne peut être saisi.',
        legendeStd: ['Plein : compte dans la note', 'Contour : évaluée, non retenue', 'Pointillé : à saisir', 'Point : évaluée avec une grille'],
        legendeSpe: ['✓ Acceptable', '✗ Non acceptable', 'Pointillé : à saisir', 'Point : évaluée avec une grille'],
        aideStd: 'Touche une case pour changer le niveau. Au clavier : la lettre du niveau, Retour arrière pour vider, les flèches pour se déplacer.',
        aideSpe: 'Touche une case pour changer le résultat. Au clavier : A ou N, Retour arrière pour vider, les flèches pour se déplacer.',
        // Le raccourci du poste (Cowork, 9 nov. 2026, 16 h 21) : ⌘Z sur Mac et iPad, Ctrl+Z ailleurs ; le reste de la phrase validée ne bouge pas.
        annulerAuClavier: (raccourci) => `${raccourci} annule le dernier geste.`,
        palierEchec: 'palier d’échec'
    });

    let _affiche = false;
    /* LA VUE SIMPLE (lot « Vue simple », 9 nov. 2026) : le même tableau, monté dans un autre hôte, avec une présentation
       qui ne nomme rien qui n'existe pas dans les données de l'utilisateur (règle arrêtée par Grégoire). La présentation
       est donnée par `vue-simple.js` (`afficherDans`) ; sans elle, rien ne change : les mots validés restent ceux de `MOTS`. */
    let _presentation = null;
    let _ecoutesCommunes = false;
    let _dernierGeste = null;   // « Annuler » : le dernier geste écrit par le tableau, dans ce trimestre
    let _minuteurIndices = null;
    const DELAI_INDICES_MS = 1200;

    const D = () => window.TableauNotationDonnees;
    const esc = (t) => echapperHtml(t == null ? '' : String(t));

    /* ============================== LE CONTEXTE ============================== */

    function _productionsTriees(liste) {
        const rang = (p) => [Number(p.numero) || 0, String(p.dateEcheance || ''), String(p.titre || '')];
        return liste.slice().sort((a, b) => {
            const x = rang(a), y = rang(b);
            return (x[0] - y[0]) || x[1].localeCompare(y[1]) || x[2].localeCompare(y[2], 'fr');
        });
    }

    /** Assignée au groupe-cours actif (une production propre à un autre groupe n'y est pas). */
    function _assignee(production, gcId) {
        if (typeof obtenirEcheanceEffective !== 'function') return true;
        return obtenirEcheanceEffective(production, gcId).assignee;
    }

    function _productionsStd(productions, config) {
        const terminale = window.identifierProductionTerminale(productions);
        const terminalId = terminale ? terminale.id : null;
        const pool = window.obtenirArtefactsIdsPoolStd(productions, terminalId, config);
        return { liste: productions.filter(p => pool.includes(p.id) || p.id === terminalId), terminalId };
    }

    function _productionsSpe(productions, types) {
        return productions.filter(p => types.some(t => window.productionEstDuType(p, t)));
    }

    function _instanceSpe(config) {
        const norme = window.normaliserConfigurationSpecifications(config);
        if (!Array.isArray(norme.typesTravaux) || !Array.isArray(norme.tableBundles)) return null;
        const inst = new window.PratiquePanSpecifications();
        inst.configurerPratique(config);   // traduit lui-même `forfaits` → `tableBundles` (#708)
        return inst;
    }

    function _etudiants() {
        const tous = (typeof obtenirEtudiantsCoursActif === 'function') ? obtenirEtudiantsCoursActif() : [];
        const exclu = (e) => typeof window.estEtudiantExclu === 'function' && window.estEtudiantExclu(e);
        return tous.filter(e => e && e.da && !exclu(e))
            .sort((a, b) => String(a.nom || '').localeCompare(String(b.nom || ''), 'fr') || String(a.prenom || '').localeCompare(String(b.prenom || ''), 'fr'));
    }

    function _contexteDeBase() {
        const designation = (typeof designerPratiqueActive === 'function') ? designerPratiqueActive() : { etat: 'aucune' };
        if (designation.etat !== 'ok') return { etat: 'aucune-pratique' };
        const pratique = window.obtenirPratiqueParId(designation.id);
        const famille = pratique && typeof pratique.obtenirCode === 'function' ? pratique.obtenirCode() : null;
        if (D().FAMILLES_DU_TABLEAU.indexOf(famille) < 0) return { etat: 'autre-famille' };
        const donnees = designation.donnees || {};
        return {
            etat: 'ok', famille, pratiqueId: designation.id, pratiqueNom: donnees.nom || '',
            config: (typeof obtenirConfigPratiqueActive === 'function' ? obtenirConfigPratiqueActive() : null) || {},
            echelle: famille === 'STD' ? (_utilisable(window.construireConfigComplete(donnees).echelle) || _echelleParId(ID_ECHELLE_DE_DEPART)) : null
        };
    }

    /* L'ÉCHELLE RETENUE (consigne du lot, 9 nov. 2026) : celle de la production si elle en a une, sinon celle de la
       pratique, sinon l'échelle de départ du trimestre (`ECHELLE_IDME_DEPART`, celle de l'utilisateur : aucun niveau
       n'est écrit ici). Une échelle sans niveau saisissable ne retient rien : on passe à la suivante. */
    const ID_ECHELLE_DE_DEPART = 'ECHELLE_IDME_DEPART';

    /** La même forme pour les deux gisements (`echellesTemplates` : id, nom ; la pratique : echelle_id, echelle_nom). */
    function _utilisable(echelle) {
        if (!echelle || D().niveauxSaisissables(echelle).length === 0) return null;
        return { id: echelle.id || echelle.echelle_id || null, echelle_nom: echelle.nom || echelle.echelle_nom || '', niveaux: echelle.niveaux };
    }

    function _echelleParId(id) {
        return (id && typeof obtenirEchelleResolue === 'function') ? _utilisable(obtenirEchelleResolue(id)) : null;
    }

    function _echelleDe(ctx, productionId) {
        if (ctx.famille !== 'STD') return null;
        if (!ctx.echelles) ctx.echelles = new Map();
        if (!ctx.echelles.has(productionId)) {
            const production = ctx.productions.find(p => p.id === productionId);
            ctx.echelles.set(productionId, _echelleParId(production && production.echelleId) || ctx.echelle);
        }
        return ctx.echelles.get(productionId);
    }

    function _cycleDe(ctx, productionId) {
        return D().cycleDeLaFamille(ctx.famille, _echelleDe(ctx, productionId));
    }

    function _completerProductions(ctx) {
        const gcId = (db.getSync('groupeCoursActif', null) || {}).id || null;
        const brutes = (obtenirDonneesSelonMode('productions') || []).filter(p => p && _assignee(p, gcId));
        const productions = window.ProductionDiagnostique ? window.ProductionDiagnostique.filtrerProductions(brutes) : brutes;
        if (ctx.famille === 'STD') {
            const r = _productionsStd(productions, ctx.config);
            ctx.productions = _productionsTriees(r.liste);
            ctx.terminalId = r.terminalId;
            return;
        }
        ctx.speInstance = _instanceSpe(ctx.config);
        ctx.types = ctx.speInstance ? ctx.speInstance.config.typesTravaux : [];
        ctx.bundles = ctx.speInstance ? ctx.speInstance.config.tableBundles : [];
        ctx.productions = _productionsTriees(_productionsSpe(productions, ctx.types));
    }

    function construireContexte() {
        const ctx = _contexteDeBase();
        if (ctx.etat !== 'ok') return ctx;
        _completerProductions(ctx);
        ctx.etudiants = _etudiants();
        ctx.evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
        ctx.echelles = new Map();
        if (ctx.famille === 'STD' && ctx.productions.length && !ctx.productions.some(p => _cycleDe(ctx, p.id).length > 1)) ctx.etat = 'sans-echelle';
        else if (!ctx.etudiants.length) ctx.etat = 'aucun-eleve';
        else if (!ctx.productions.length) ctx.etat = 'aucune-production';
        return ctx;
    }

    /* ============================== UNE RANGÉE ============================== */

    /** Les productions qui comptent pour cet élève, et sa note : la source de l'export (`simulerIndices`). */
    function _resultatEleve(da, ctx) {
        const r = (typeof simulerIndices === 'function') ? simulerIndices(da, ctx.pratiqueId) : null;
        const constructible = !!(r && r.noteConstructible);
        const res = { note: constructible ? Math.round(r.P) : null, cause: _causeAuTableau(r ? r.causeNonConstructible : null), comptent: new Set(), detail: '' };
        const ids = new Set(ctx.productions.map(p => p.id));
        res.aDesCopies = ctx.evaluations.some(e => e && e.etudiantDA === da && ids.has(e.productionId));
        if (ctx.famille === 'STD') _completerStd(res, r && r.details, ctx);
        else _completerSpe(res, da, ctx);
        return res;
    }

    /**
     * La cause d'une note absente, telle que le tableau la dit. En standards, quand aucune production n'est évaluée, le
     * calcul partagé dit « Aucun artefact du portfolio n'est encore évalué. » ou « Aucune production retenue pour la note
     * n'est encore évaluée. » (`causeNoteStdSansProductionNotee`, registre ; le profil, le rapport et l'export la lisent).
     * AU TABLEAU SEULEMENT, la phrase validée par Grégoire le 9 nov. 2026 la remplace ; les autres écrans ne changent pas.
     */
    function _causeAuTableau(cause) {
        const dire = window.causeNoteStdSansProductionNotee;
        if (!cause || typeof dire !== 'function') return cause;
        return (cause === dire(true, false) || cause === dire(false, false)) ? MOTS.aucuneEvaluee : cause;
    }

    function _completerStd(res, details, ctx) {
        if (!details) return;
        const pf = details.portfolio || {};
        (pf.artefactsRetenus || []).forEach(a => res.comptent.add(a.productionId));
        if (details.terminal && details.terminal.present && details.terminal.note != null && ctx.terminalId) res.comptent.add(ctx.terminalId);
        const n = res.comptent.size;
        if (n) res.detail = `${n} ${n > 1 ? 'productions retenues' : 'production retenue'}`;
    }

    function _completerSpe(res, da, ctx) {
        const valides = ctx.evaluations.filter(e => e.etudiantDA === da && window.evaluationCompteEnSpecifications(e));
        valides.forEach(e => res.comptent.add(e.productionId));
        // Les comptes par type : la méthode du moteur (lecture seule, mêmes copies que sa note).
        res.comptes = (ctx.speInstance && valides.length) ? ctx.speInstance._compterTravauxAcceptables(da, valides) : {};
        const palier = (res.note === null) ? null : ctx.bundles.find(b => b.noteFixe === res.note);
        res.detail = palier ? (palier.label || palier.description || (palier.requis ? '' : MOTS.palierEchec)) : '';
    }

    /* ============================== UNE CASE ============================== */

    /** Une couleur d'échelle n'entre dans un attribut `style` que si elle en est une (données importées). */
    function couleurSure(couleur) {
        const c = String(couleur || '').trim();
        return /^(#[0-9a-f]{3,8}|var\(--[a-z0-9-]+\)|rgba?\(\s*[0-9.,\s%]+\))$/i.test(c) ? c : 'var(--accent-primaire)';
    }

    /** Le niveau d'un code : dans l'échelle de la colonne, sinon dans celle que la copie porte (saisie sous une autre échelle). */
    function _niveauDe(valeur, ctx, productionId, echelleIdCopie) {
        const dans = (echelle) => D().niveauxSaisissables(echelle).find(n => n.code === valeur);
        return dans(_echelleDe(ctx, productionId)) || (echelleIdCopie ? dans(_echelleParId(echelleIdCopie)) : undefined);
    }

    function _couleurDeLaValeur(valeur, ctx, productionId, echelleIdCopie) {
        if (ctx.famille === 'SPE') return valeur === D().ACCEPTABLE ? 'var(--niveau-attention-minimal)' : 'var(--niveau-attention-critique)';
        const niveau = _niveauDe(valeur, ctx, productionId, echelleIdCopie);
        return couleurSure(niveau ? niveau.couleur : null);
    }

    function _motDeLaValeur(valeur, ctx, productionId, echelleIdCopie) {
        if (valeur === '') return MOTS.aSaisir;
        const jugement = window.LIBELLES_JUGEMENT_SANS_GRILLE;   // les mots de la Liste (registre)
        if (ctx.famille === 'SPE') return valeur === D().ACCEPTABLE ? jugement.acceptable : jugement.nonAcceptable;
        const niveau = _niveauDe(valeur, ctx, productionId, echelleIdCopie);
        return niveau ? niveau.nom : valeur;
    }

    function _libelleDeLaValeur(valeur, ctx) {
        if (valeur === '') return '+';
        if (ctx.famille === 'SPE') return valeur === D().ACCEPTABLE ? '✓' : '✗';
        return valeur;
    }

    /**
     * L'état d'une case. En spécifications, une copie sans jugement binaire (évaluée avec une grille, ou saisie en niveau
     * sous une pratique devenue « spécifications ») se lit par le jugement du moteur quand elle compte ; sinon (brouillon),
     * elle montre son niveau, en contour (relecture neuve, 9 nov. 2026).
     */
    function _etatCase(etudiant, production, ctx, resultat) {
        const ev = D().copieDeLaCase(ctx.evaluations, etudiant.da, production.id);
        const compte = resultat.comptent.has(production.id) && !!ev;
        const etat = D().etatDeLaCase(ev, ctx.famille, compte);
        etat.echelleId = ev ? (ev.echelleId || null) : null;
        // Une copie non recevable (plagiat, IA non autorisée) : ses niveaux ne se lisent nulle part (décision de Grégoire,
        // 28 oct. 2026). La case dit « -- », comme la Liste, et son libellé (registre) ; elle s'ouvre, elle ne se modifie pas.
        const nonRecevable = ev && typeof window.libelleCopieNonRecevable === 'function' ? window.libelleCopieNonRecevable(ev) : null;
        if (nonRecevable) return Object.assign(etat, { valeur: '', forme: 'contour', nonRecevable });
        etat.valeurChangee = _valeurChangee(ev, ctx);
        if (ctx.famille !== 'SPE' || !ev || window.resultatAcceptableSansGrille(ev) !== null || !compte) return etat;
        const type = ctx.types.find(t => window.productionEstDuType(production, t));
        const ok = !!(type && ctx.speInstance && ctx.speInstance._estTravailAcceptable(ev, type));
        etat.valeur = ok ? D().ACCEPTABLE : D().NON_ACCEPTABLE;
        etat.forme = 'plein';
        return etat;
    }

    /**
     * L'échelle a changé depuis la saisie (Cowork, 9 nov. 2026 : un signe sur la case, sans rien réécrire) : le niveau
     * d'un résultat sans grille ne vaut plus, dans SON échelle, la note écrite à la saisie. La note du cours lit toujours
     * la valeur écrite ; la réécrire reste le geste de l'enseignant·e (il ressaisit le niveau).
     * @returns {number|null} la valeur écrite, quand elle n'est plus celle du niveau ; null sinon
     */
    function _valeurChangee(ev, ctx) {
        if (ctx.famille !== 'STD' || !ev || ev.sansGrille !== true || typeof ev.noteFinale !== 'number') return null;
        const niveau = D().niveauxSaisissables(_echelleParId(ev.echelleId)).find(n => n.code === ev.niveauFinal);
        return (niveau && niveau.valeur !== ev.noteFinale) ? ev.noteFinale : null;
    }

    /** La phrase du signe « échelle modifiée » (infobulle et libellé lu), ou '' quand la valeur écrite est celle du niveau. */
    function _phraseValeurChangee(etat) {
        return (etat.valeurChangee === null || etat.valeurChangee === undefined) ? '' : MOTS.valeurChangee(etat.valeurChangee);
    }

    function _classesDeLaCase(etat, changee) {
        return ['tn-case', 'tn-case--' + etat.forme]
            .concat(etat.modifiable ? [] : ['tn-case--grille'])
            .concat(changee ? ['tn-case--valeur-changee'] : []);
    }

    function _caseHTML(etudiant, production, ctx, resultat) {
        const etat = _etatCase(etudiant, production, ctx, resultat);
        const nom = `${etudiant.prenom || ''} ${etudiant.nom || ''}`.trim();
        const mot = etat.nonRecevable || _motDeLaValeur(etat.valeur, ctx, production.id, etat.echelleId);
        const changee = _phraseValeurChangee(etat);
        const aria = `${nom}, ${production.titre || ''} : ${mot}` + (etat.modifiable ? '' : `, ${_presentation ? MOTS.avecGrille.split(' ;')[0] : MOTS.avecGrille}`) + (changee ? `. ${changee}` : '');
        const classes = _classesDeLaCase(etat, changee);
        const bulle = changee ? ` title="${esc(changee)}"` : '';
        const style = etat.valeur ? ` style="--tn-couleur: ${esc(_couleurDeLaValeur(etat.valeur, ctx, production.id, etat.echelleId))}"` : '';
        const ouvrir = etat.modifiable ? '' : ` data-evaluation="${esc(etat.evaluationId)}"`;
        // Un seul arrêt de Tab pour tout le tableau (la première case) ; les flèches font le reste.
        const tab = (etudiant === ctx.etudiants[0] && production === ctx.productions[0]) ? '0' : '-1';
        return `<td class="tn-cellule"><button type="button" class="${classes.join(' ')}"${style} tabindex="${tab}" data-da="${esc(etudiant.da)}" data-production="${esc(production.id)}"${ouvrir}${bulle} aria-label="${esc(aria)}">${esc(etat.nonRecevable ? '--' : _libelleDeLaValeur(etat.valeur, ctx))}</button></td>`;
    }

    function _noteHTML(resultat) {
        // Sans note : sa cause, comme ailleurs (`simulerIndices.causeNonConstructible`, la phrase du profil et de l'export),
        // écrite dans la case : une bulle seule ne se lit pas sur l'iPad.
        const detail = resultat.note === null
            ? (resultat.cause || (resultat.aDesCopies ? MOTS.nonCalculable : MOTS.enAttente))
            : resultat.detail;
        const note = resultat.note === null ? '–' : String(resultat.note);
        return `<td class="tn-note"><span class="tn-note-valeur">${esc(note)}</span><span class="tn-note-detail">${esc(detail)}</span></td>`;
    }

    function _comptesSpeHTML(resultat, ctx) {
        return ctx.types.map(t => {
            const total = ctx.productions.filter(p => window.productionEstDuType(p, t)).length;
            return `<td class="tn-compte">${(resultat.comptes || {})[t.id] || 0} / ${total}</td>`;
        }).join('');
    }

    function _rangeeHTML(etudiant, ctx) {
        const resultat = _resultatEleve(etudiant.da, ctx);
        const nom = `${etudiant.prenom || ''} ${etudiant.nom || ''}`.trim();
        const cases = ctx.productions.map(p => _caseHTML(etudiant, p, ctx, resultat)).join('');
        const comptes = ctx.famille === 'SPE' ? _comptesSpeHTML(resultat, ctx) : '';
        return `<tr><th scope="row" class="tn-eleve">${esc(nom)}</th>${cases}${comptes}${_noteHTML(resultat)}</tr>`;
    }

    /* ============================== L'EN-TÊTE ============================== */

    function _dateCourte(production) {
        const gcId = (db.getSync('groupeCoursActif', null) || {}).id || null;
        const date = (typeof obtenirEcheanceEffective === 'function') ? obtenirEcheanceEffective(production, gcId).date : production.dateEcheance;
        if (!date) return '';
        const d = new Date(String(date).length === 10 ? date + 'T12:00:00' : date);
        return isNaN(d) ? '' : d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
    }

    function _enteteColonnesHTML(ctx) {
        const autreEchelle = (p) => {
            const e = _echelleDe(ctx, p.id);
            return (e && ctx.echelle && e.id !== ctx.echelle.id) ? `<span class="tn-production-date">${esc(e.echelle_nom)}</span>` : '';
        };
        const prods = ctx.productions.map(p =>
            `<th scope="col" class="tn-col-production"><span class="tn-production-titre">${esc(p.titre || p.nom || '')}</span><span class="tn-production-date">${esc(_dateCourte(p))}</span>${autreEchelle(p)}</th>`).join('');
        const types = ctx.famille === 'SPE' ? ctx.types.map(t => `<th scope="col" class="tn-col-compte">${esc(t.nom || t.id)}</th>`).join('') : '';
        const note = ctx.config && ctx.config.notesFinales === true ? MOTS.noteFinale : MOTS.noteProvisoire;
        return `<thead><tr><th scope="col" class="tn-col-eleve">${esc(MOTS.eleve)}</th>${prods}${types}<th scope="col" class="tn-col-note">${esc(note)}</th></tr></thead>`;
    }

    /** La règle des standards, dite avec les libellés du calcul (mots validés par Grégoire, 9 nov. 2026). */
    function phraseRegleStd(config, avecTerminale) {
        const pf = (config && config.portfolio) || {};
        const n = Number(pf.nombreARetenir) || 0;
        const methode = (config && config.categories && config.categories.actif) ? 'hybride' : (pf.methodeSelection || 'meilleurs');
        const phrases = {
            meilleurs: `les ${n} meilleures productions`,
            recents: `les ${n} productions les plus récentes`,
            derniers: `les ${n} productions les plus récentes`,
            'recents-meilleurs': `${n} productions, récentes parmi les meilleures`,
            tous: 'toutes les productions évaluées',
            hybride: 'les catégories de ta pratique'
        };
        const base = phrases[methode] || phrases.meilleurs;
        return `La note retient ${base}${avecTerminale ? ', et la terminale' : ''}.`;
    }

    function _echelleHTML(ctx) {
        const niveaux = D().niveauxSaisissables(ctx.echelle).map(n =>
            `<span class="tn-niveau" style="--tn-couleur: ${esc(couleurSure(n.couleur))}" title="${esc(n.nom)}"><span class="tn-niveau-code">${esc(n.code)}</span> ${esc(String(n.valeur))}</span>`).join('');
        const nom = ctx.echelle && ctx.echelle.echelle_nom ? `Échelle « ${esc(ctx.echelle.echelle_nom)} » :` : 'Échelle :';
        return `<div class="tn-repere"><span class="tn-repere-titre">${nom}</span>${niveaux}</div>`;
    }

    function _forfaitsHTML(ctx) {
        const nomType = (id) => { const t = ctx.types.find(x => x.id === id); return t ? (t.nom || id) : id; };
        const paliers = ctx.bundles.slice().sort((a, b) => b.noteFixe - a.noteFixe).map(b => {
            const requis = b.requis ? Object.entries(b.requis).map(([id, n]) => `${nomType(id)} : ${n}`).join(', ') : MOTS.palierEchec;
            const titre = [b.label || b.description, b.noteFixe].filter(x => x !== undefined && x !== null && x !== '').join(' · ');
            return `<span class="tn-forfait"><span class="tn-forfait-titre">${esc(titre)}</span><span class="tn-forfait-requis">${esc(requis)}</span></span>`;
        }).join('');
        return `<div class="tn-repere">${paliers}</div>`;
    }

    function _bandeauHTML(ctx) {
        // Le badge de la FAMILLE : l'id d'une pratique configurable ne dit pas sa famille au registre des représentations.
        const badge = typeof genererBadgePratiqueHTML === 'function' ? genererBadgePratiqueHTML(ctx.famille === 'SPE' ? 'specifications' : 'standards') : '';
        const regle = ctx.famille === 'STD'
            ? phraseRegleStd(ctx.config, !!ctx.terminalId)
            : ctx.types.map(t => `${t.nom || t.id} (${ctx.productions.filter(p => window.productionEstDuType(p, t)).length})`).join(' · ');
        // Vue simple : « Réglages de la pratique » mène à l'écran Pratique, et « + Production » ajoute une colonne.
        const p = _presentation;
        const reglages = (p && p.reglages) || { action: 'ouvrirReglagesPratique', param: ctx.pratiqueId };
        const g = p && p.gestes && p.gestes['aucune-production'];
        const ajout = g ? `<button type="button" class="btn btn-principal" data-action="${esc(g.action)}">${esc(g.libelle)}</button>` : '';
        return `<div class="tn-bandeau">
            <div class="tn-pratique">${badge}<span class="tn-pratique-nom">${esc(ctx.pratiqueNom)}</span><span class="tn-regle">${esc(regle)}</span>
                <a href="#" class="tn-reglages" data-prevent data-action="${esc(reglages.action)}" data-param="${esc(reglages.param)}">${esc(MOTS.reglages)}</a></div>
            <div class="tn-gestes">${ajout}<button type="button" class="btn btn-secondaire" id="tn-annuler" data-action="TableauNotation.annuler"${_gesteAnnulable() ? '' : ' disabled'}>${esc(MOTS.annuler)}</button>
            <button type="button" class="btn btn-secondaire" data-action="exporterSyntheseResultatsCSV">${esc(MOTS.exporter)}</button></div>
        </div>
        ${ctx.famille === 'STD' ? _echelleHTML(ctx) : _forfaitsHTML(ctx)}`;
    }

    /** Le raccourci que la légende affiche : celui du poste. Le code, lui, accepte ⌘Z et Ctrl+Z partout. */
    function raccourciAnnuler() {
        const nav = (typeof navigator !== 'undefined' && navigator) || {};
        const poste = String(nav.platform || '') + ' ' + String(nav.userAgent || '');
        return /Mac|iPhone|iPad|iPod/i.test(poste) ? '⌘Z' : 'Ctrl+Z';
    }

    /** Une case du tableau montre-t-elle une copie évaluée avec une grille ? (la même règle que la case : `modifiable`) */
    function _aUneCaseAvecGrille(ctx) {
        return ctx.etudiants.some(e => ctx.productions.some(p => {
            const ev = D().copieDeLaCase(ctx.evaluations, e.da, p.id);
            return !!ev && !D().etatDeLaCase(ev, ctx.famille, false).modifiable;
        }));
    }

    function _legendeHTML(ctx) {
        // En vue simple, « Point : évaluée avec une grille » ne paraît que s'il existe une telle case (arrêté par Grégoire).
        const sansPoint = !!_presentation && !_aUneCaseAvecGrille(ctx);
        const mots = (ctx.famille === 'SPE' ? MOTS.legendeSpe : MOTS.legendeStd).filter((t, i, tous) => !(sansPoint && i === tous.length - 1));
        const items = mots.map(t => `<span class="tn-legende-item">${esc(t)}</span>`).join('');
        return `<div class="tn-legende">${items}<span class="tn-legende-aide">${esc((ctx.famille === 'SPE' ? MOTS.aideSpe : MOTS.aideStd) + ' ' + MOTS.annulerAuClavier(raccourciAnnuler()))}</span></div>`;
    }

    /* ============================== LE RENDU ============================== */

    const MESSAGES_ETAT = { 'aucune-pratique': 'aucunePratique', 'autre-famille': 'autreFamille', 'aucun-eleve': 'aucunEleve', 'aucune-production': 'aucuneProduction', 'sans-echelle': 'sansEchelle' };

    /** L'état sans tableau. En vue simple : les mots de la vue simple, et le geste qui débloque (« + Production »…). */
    function _etatVideHTML(ctx) {
        const p = _presentation;
        const cleMot = MESSAGES_ETAT[ctx.etat];
        const mot = (p && p.mots && p.mots[cleMot]) || MOTS[cleMot] || '';
        const geste = p && p.gestes && p.gestes[ctx.etat];
        const bouton = geste ? `<p class="tn-etat-geste"><button type="button" class="btn btn-principal" data-action="${esc(geste.action)}"${geste.param ? ` data-param="${esc(geste.param)}"` : ''}>${esc(geste.libelle)}</button></p>` : '';
        return `<p class="tn-etat-vide">${esc(mot)}</p>${bouton}`;
    }

    /** La phrase sur les critères : en vue simple, seulement si l'utilisateur a une grille (arrêté par Grégoire, 9 nov. 2026). */
    function _avisHTML() {
        if (_presentation && _presentation.aUneGrille && !_presentation.aUneGrille()) return '';
        return `<p class="tn-avis">${esc(MOTS.avis)}</p>`;
    }

    function construireHTML(ctx) {
        const tete = `<h3 class="tn-titre" tabindex="-1">${esc(MOTS.titre)}</h3><p class="tn-intro">${esc(MOTS.intro)}</p>`;
        if (ctx.etat !== 'ok') return `${tete}${_etatVideHTML(ctx)}`;
        const rangees = ctx.etudiants.map(e => _rangeeHTML(e, ctx)).join('');
        return `${tete}${_bandeauHTML(ctx)}${_avisHTML()}
            <div class="tn-cadre"><div class="tn-defilement"><table class="tn-tableau">${_enteteColonnesHTML(ctx)}<tbody>${rangees}</tbody></table></div></div>
            ${_legendeHTML(ctx)}
            <p class="tn-annonce u-lecteur-ecran" aria-live="polite"></p>`;
    }

    function _hote() { return (_presentation && _presentation.hote) || document.getElementById('tableau-notation-hote'); }

    /** La case qui a le focus, s'il est dans le tableau : un rendu venu d'ailleurs (la Liste rechargée) le lui rend. */
    function _focusActuel(hote) {
        const actif = document.activeElement;
        if (!actif || !hote.contains(actif) || !actif.classList.contains('tn-case')) return null;
        return { da: actif.dataset.da, production: actif.dataset.production };
    }

    function rendre(focus) {
        const hote = _hote();
        if (!hote) return;
        const aRendre = focus || _focusActuel(hote);
        // Le défilement survit au rendu : une saisie dans une colonne de droite ne ramène pas le tableau à gauche.
        const avant = hote.querySelector('.tn-defilement');
        const defilement = avant ? avant.scrollLeft : 0;
        hote.innerHTML = construireHTML(construireContexte());
        _poserEcoutes(hote);
        const zone = hote.querySelector('.tn-defilement');
        if (zone) {
            zone.scrollLeft = defilement;
            zone.addEventListener('scroll', _marquerDebordement, { passive: true });
        }
        _marquerDebordement();
        if (aRendre) _reprendreFocus(hote, aRendre);
    }

    function _reprendreFocus(hote, focus) {
        const cible = hote.querySelector(`.tn-case[data-da="${CSS.escape(focus.da)}"][data-production="${CSS.escape(focus.production)}"]`);
        if (cible) _donnerLeFocus(cible);
    }

    /** La case qui reçoit le focus devient le seul arrêt de Tab (tabindex itinérant). */
    function _donnerLeFocus(bouton) {
        const hote = _hote();
        if (hote) hote.querySelectorAll('.tn-case[tabindex="0"]').forEach(b => { if (b !== bouton) b.setAttribute('tabindex', '-1'); });
        bouton.setAttribute('tabindex', '0');
        bouton.focus({ preventScroll: true });
        _amenerDansLaVue(bouton);
    }

    /* ============================== LE DÉBORDEMENT (9 nov. 2026, 16 h 18) ==============================
       Quand les colonnes débordent, on doit le comprendre au premier regard : un BORD ESTOMPÉ contre la colonne fixée
       (les noms à gauche, la note à droite), du côté où il reste des colonnes ; il disparaît au bout du défilement.
       Les deux colonnes fixées recouvrent ce qui défile : la bande visible est ce qui reste entre elles. */

    function _bandeVisible(zone) {
        const largeur = (sel) => { const n = zone.querySelector(sel); return n ? n.getBoundingClientRect().width : 0; };
        return { gauche: largeur('.tn-col-eleve'), droite: largeur('.tn-col-note') };
    }

    function _marquerDebordement() {
        const hote = _hote();
        const cadre = hote && hote.querySelector('.tn-cadre');
        const zone = cadre && cadre.querySelector('.tn-defilement');
        if (!zone) return;
        const bande = _bandeVisible(zone);
        const reste = zone.scrollWidth - zone.clientWidth - zone.scrollLeft;
        cadre.style.setProperty('--tn-fixe-gauche', bande.gauche + 'px');
        cadre.style.setProperty('--tn-fixe-droite', bande.droite + 'px');
        cadre.classList.toggle('tn-cadre--reste-a-gauche', zone.scrollLeft > 1);
        cadre.classList.toggle('tn-cadre--reste-a-droite', reste > 1);
    }

    /** La case active entière dans la bande visible (les flèches du clavier font défiler le tableau avec elles). */
    function _amenerDansLaVue(bouton) {
        const zone = bouton.closest('.tn-defilement');
        const cellule = bouton.closest('td');
        if (!zone || !cellule) return;
        const bande = _bandeVisible(zone);
        const z = zone.getBoundingClientRect();
        const c = cellule.getBoundingClientRect();
        const debut = z.left + bande.gauche;
        const fin = z.right - bande.droite;
        if (c.left < debut) zone.scrollLeft -= (debut - c.left);
        else if (c.right > fin) zone.scrollLeft += (c.right - fin);
        _marquerDebordement();
    }

    /* ============================== LA SAISIE ============================== */

    function _contexteEcriture(da, productionId, ctx) {
        const etudiant = ctx.etudiants.find(e => e.da === da);
        const production = ctx.productions.find(p => p.id === productionId);
        if (!etudiant || !production) return null;
        return {
            etudiant, production,
            coursId: typeof obtenirCoursActifId === 'function' ? obtenirCoursActifId() : null,
            groupeCoursId: (db.getSync('groupeCoursActif', null) || {}).id || null,
            id: window.genererIdUnique('EVAL_'),
            maintenant: new Date()
        };
    }

    /**
     * Écrit la valeur d'une case. Lit le stock BRUT (comme la sauvegarde d'Évaluer : la lecture selon le mode filtre
     * par cours, et réécrire un tableau filtré effacerait les autres), écrit par le témoin commun.
     * @returns {string} l'action ('cree', 'modifie', 'retire', 'inchange', 'refuse', 'echec')
     */
    function ecrireCase(da, productionId, valeur) {
        const ctx = construireContexte();
        if (ctx.etat !== 'ok') return 'refuse';
        const contexte = _contexteEcriture(da, productionId, ctx);
        if (!contexte) return 'refuse';
        const stock = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const avant = D().copieDeLaCase(stock, da, productionId);
        const r = D().appliquerSaisie(stock, { famille: ctx.famille, valeur, echelle: _echelleDe(ctx, productionId), contexte });
        if (r.action === 'inchange' || r.action === 'refuse') return r.action;
        if (sauvegarderDonneesSelonMode('evaluationsSauvegardees', r.evaluations, { geste: 'Tableau de notation' }) !== true) return 'echec';
        // Le dernier geste, pour « Annuler » : la copie d'avant (une copie, pas l'objet du stock) et ce que le geste a laissé.
        _dernierGeste = { cleStock: cle('evaluationsSauvegardees'), da, productionId,
            avant: avant ? JSON.parse(JSON.stringify(avant)) : null, apresId: r.action === 'retire' ? null : r.evaluation.id };
        window._moyennesQualifies = null;
        window._moyennesToutes = null;
        _planifierIndices();
        return r.action;
    }

    /* ============================== ANNULER ============================== */

    function _gesteAnnulable() {
        return !!_dernierGeste && _dernierGeste.cleStock === cle('evaluationsSauvegardees');
    }

    /**
     * « Annuler » et ⌘Z (Ctrl+Z hors Mac) : défait le dernier geste fait au tableau, quel qu'il soit (niveau changé, case
     * vidée). Un seul niveau : le geste défait ne se refait pas. Rien ne s'écrit si la case a changé depuis.
     * @returns {string} 'defait', 'refuse', 'echec' ou 'rien'
     */
    function annuler() {
        if (!_gesteAnnulable()) { _dernierGeste = null; return 'rien'; }
        const geste = _dernierGeste;
        const stock = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const r = D().defaireSaisie(stock, geste);
        _dernierGeste = null;
        if (r.action === 'defait') {
            if (sauvegarderDonneesSelonMode('evaluationsSauvegardees', r.evaluations, { geste: 'Tableau de notation' }) !== true) return 'echec';
            window._moyennesQualifies = null;
            window._moyennesToutes = null;
            _planifierIndices();
        }
        if (_affiche) {
            rendre({ da: geste.da, production: geste.productionId });
            _annoncerNote(geste.da);
        }
        return r.action;
    }

    /** ⌘Z ou Ctrl+Z, quand le tableau est à l'écran et qu'on n'écrit pas dans un champ (son propre « annuler » passe d'abord). */
    function _surRaccourciAnnuler(e) {
        if (!_affiche || !(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey || String(e.key).toLowerCase() !== 'z') return;
        const hote = _hote();
        if (!hote || hote.offsetParent === null) return;
        const cible = e.target;
        if (cible && (cible.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(cible.tagName || ''))) return;
        if (!_gesteAnnulable()) return;
        e.preventDefault();
        annuler();
    }

    function _planifierIndices() {
        clearTimeout(_minuteurIndices);
        _minuteurIndices = setTimeout(() => {
            if (typeof calculerEtStockerIndicesCP === 'function') calculerEtStockerIndicesCP();
        }, DELAI_INDICES_MS);
    }

    function _valeurActuelle(bouton, ctx) {
        const ev = D().copieDeLaCase(ctx.evaluations, bouton.dataset.da, bouton.dataset.production);
        return ev ? D().etatDeLaCase(ev, ctx.famille, false).valeur : '';
    }

    function _appliquer(bouton, valeurOuSuivante) {
        const ctx = construireContexte();
        if (ctx.etat !== 'ok') return;
        const valeur = (valeurOuSuivante === null) ? D().valeurSuivante(_cycleDe(ctx, bouton.dataset.production), _valeurActuelle(bouton, ctx)) : valeurOuSuivante;
        const focus = { da: bouton.dataset.da, production: bouton.dataset.production };
        ecrireCase(focus.da, focus.production, valeur);
        rendre(focus);
        _annoncerNote(focus.da);
    }

    /** Le lecteur d'écran entend la note qui change (zone `aria-live`). */
    function _annoncerNote(da) {
        const hote = _hote();
        const zone = hote && hote.querySelector('.tn-annonce');
        const case_ = hote && hote.querySelector(`.tn-case[data-da="${CSS.escape(da)}"]`);
        const rangee = case_ && case_.closest('tr');
        if (!zone || !rangee) return;
        const nom = rangee.querySelector('.tn-eleve').textContent;
        zone.textContent = `${nom} : ${rangee.querySelector('.tn-note-valeur').textContent} ${rangee.querySelector('.tn-note-detail').textContent}`.trim();
    }

    function _surClic(e) {
        const bouton = e.target.closest('.tn-case');
        if (!bouton) return;
        if (bouton.dataset.evaluation) {
            if (_presentation) return;   // vue simple : la copie se lit, elle s'ouvre en vue étendue
            if (typeof window.consulterEvaluationDepuisListe === 'function') window.consulterEvaluationDepuisListe(bouton.dataset.evaluation);
            return;
        }
        _appliquer(bouton, null);
    }

    const FLECHES = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };

    function _deplacer(bouton, delta) {
        const cellule = bouton.closest('td');
        const rangee = cellule.parentElement;
        const col = Array.prototype.indexOf.call(rangee.children, cellule);
        const rangees = Array.from(rangee.parentElement.children);
        const cible = rangees[rangees.indexOf(rangee) + delta[0]];
        const td = cible ? cible.children[col + delta[1]] : rangee.children[col + delta[1]];
        const suivant = (cible || !delta[0]) && td ? td.querySelector('.tn-case') : null;
        if (suivant) _donnerLeFocus(suivant);
    }

    function _surTouche(e) {
        const bouton = e.target.closest('.tn-case');
        if (!bouton || e.metaKey || e.ctrlKey || e.altKey) return;
        if (FLECHES[e.key]) { e.preventDefault(); _deplacer(bouton, FLECHES[e.key]); return; }
        if (bouton.dataset.evaluation) return;
        const ctx = construireContexte();
        if (ctx.etat !== 'ok') return;
        const valeur = D().valeurParTouche(_cycleDe(ctx, bouton.dataset.production), e.key);
        if (valeur === null) return;
        e.preventDefault();
        _appliquer(bouton, valeur);
    }

    function _poserEcoutes(hote) {
        if (hote._tnEcoutes) return;   // l'hôte reste, son contenu se réécrit : une seule paire d'écoutes
        hote._tnEcoutes = true;
        hote.addEventListener('click', _surClic);
        hote.addEventListener('keydown', _surTouche);
        if (_ecoutesCommunes) return;   // deux hôtes (la Liste, la vue simple), une seule paire d'écoutes communes
        _ecoutesCommunes = true;
        document.addEventListener('keydown', _surRaccourciAnnuler);
        window.addEventListener('resize', _marquerDebordement);
    }

    /* ============================== LA BASCULE ============================== */

    function _poserBascule(tableau) {
        const carte = document.getElementById('carte-liste-evaluations');
        if (carte) carte.classList.toggle('vue-tableau-notation', tableau);
        const hote = _hote();
        if (hote) hote.classList.toggle('u-hide', !tableau);
        [['tn-vue-liste', !tableau], ['tn-vue-tableau', tableau]].forEach(([id, actif]) => {
            const b = document.getElementById(id);
            if (!b) return;
            b.classList.toggle('actif', actif);
            b.setAttribute('aria-pressed', actif ? 'true' : 'false');
        });
    }

    /** Vue simple : le tableau monté dans l'hôte donné, avec sa présentation. La Liste de la vue étendue n'est pas touchée. */
    function afficherDans(presentation) {
        _presentation = presentation;
        _affiche = true;
        _dernierGeste = null;
        rendre(null);
    }

    /** Vue simple quittée (autre écran, ou retour à la vue étendue) : l'hôte est vidé, le tableau de la Liste reprend sa place. */
    function quitterPresentation() {
        if (!_presentation) return;
        if (_presentation.hote) _presentation.hote.innerHTML = '';
        _presentation = null;
        _affiche = false;
        _dernierGeste = null;
        _poserBascule(false);
    }

    /**
     * Les notes du groupe actif, une par élève : la note du tableau (`simulerIndices`, la source de l'export) et ce que
     * dit sa dernière colonne. Pour l'écran « Note finale » de la vue simple : aucune règle n'est recopiée.
     * @returns {{etat: string, finales: boolean, lignes: Array<{da, nom, prenom, note: (number|null), detail: string}>}}
     */
    function notesDuGroupe() {
        const ctx = construireContexte();
        if (ctx.etat !== 'ok' && ctx.etat !== 'aucune-production') return { etat: ctx.etat, finales: false, lignes: [] };
        const lignes = ctx.etudiants.map(e => {
            const r = _resultatEleve(e.da, ctx);
            const detail = r.note === null ? (r.cause || (r.aDesCopies ? MOTS.nonCalculable : MOTS.enAttente)) : r.detail;
            return { da: e.da, nom: e.nom || '', prenom: e.prenom || '', note: r.note, detail };
        });
        return { etat: ctx.etat, finales: !!(ctx.config && ctx.config.notesFinales === true), lignes, famille: ctx.famille, pratiqueNom: ctx.pratiqueNom, types: ctx.types || [] };
    }

    function afficher() {
        if (typeof afficherSousSection === 'function' && typeof sousSectionActive !== 'undefined' && sousSectionActive !== 'evaluations-liste') {
            afficherSousSection('evaluations-liste');
        }
        _affiche = true;
        _poserBascule(true);
        rendre(null);
        const titre = _hote() && _hote().querySelector('.tn-titre');
        if (titre) titre.focus();
    }

    function afficherListe() {
        _affiche = false;
        _poserBascule(false);
        if (typeof initialiserListeEvaluations === 'function') initialiserListeEvaluations();
    }

    /** Appelé quand la Liste se recharge (groupe-cours changé, évaluation enregistrée ailleurs). */
    function rafraichirSiAffiche() {
        if (_affiche) rendre(null);
    }

    window.TableauNotation = {
        afficher,              // la bascule, « Consulter » et « Modifier » de la Liste
        afficherListe,         // la bascule
        annuler,               // le bouton « Annuler » ; ⌘Z passe par la même fonction
        rafraichirSiAffiche,   // initialiserListeEvaluations
        afficherDans,          // vue simple : le tableau dans l'écran « Résultats »
        quitterPresentation,   // vue simple quittée
        notesDuGroupe,         // vue simple : l'écran « Note finale »
        MOTS,                  // vue simple : les mots validés, repris tels quels (gelés)
        construireHTML,        // exposés pour le banc (tests/unit/tableau-notation-1.test.js)
        phraseRegleStd,
        couleurSure
    };
})();
