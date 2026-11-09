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
 * standards (`details.portfolio.artefactsRetenus`, la terminale) ; les forfaits, de l'instance des spécifications
 * configurée comme la pratique. Le tableau ne calcule rien lui-même.
 *
 * ⚠ MOTS DE L'ÉCRAN : tous PROPOSÉS (point ouvert du plan), à faire valider par Grégoire. Ils sont réunis dans `MOTS`.
 * Données et écriture pure : `tableau-notation-donnees.js`.
 */
(function () {
    'use strict';

    const MOTS = Object.freeze({
        titre: 'Tableau de notation',
        intro: 'Saisis le résultat de chaque production, qu’elle ait été évaluée ici ou ailleurs. La note de chaque étudiant·e se construit dans la dernière colonne, selon les réglages de ta pratique.',
        avis: 'Un résultat saisi ici n’a pas de critères : ni forces, ni défis, ni rétroaction par critère. Le suivi qui lit la note continue de fonctionner.',
        exporter: 'Exporter en CSV',
        eleve: 'Étudiant·e',
        noteProvisoire: 'Note provisoire',
        noteFinale: 'Note',
        enAttente: 'en attente de résultats',
        nonCalculable: 'non calculable',
        acceptable: 'Acceptable',
        nonAcceptable: 'Non acceptable',
        aSaisir: 'à saisir',
        avecGrille: 'évaluée avec une grille ; toucher pour l’ouvrir',
        aucunePratique: 'Ce groupe-cours n’a pas de pratique de notation. Choisis-en une dans Réglages › Pratique de notation : le tableau suivra ses réglages.',
        autreFamille: 'Le tableau de notation sert les pratiques par standards et par spécifications. La pratique de ce groupe-cours se note autrement : la liste reste la vue de ses évaluations.',
        aucunEleve: 'Aucun·e étudiant·e dans ce groupe-cours. Ajoute ta liste dans Réglages › Groupe pour remplir le tableau.',
        aucuneProduction: 'Aucune production n’entre dans la note de ta pratique. Crée tes productions dans Conception › Productions.',
        sansEchelle: 'Ta pratique n’a pas d’échelle dont les niveaux portent une valeur : aucun niveau ne peut être saisi.',
        legendeStd: ['Plein : compte dans la note', 'Contour : évaluée, non retenue', 'Pointillé : à saisir', 'Point : évaluée avec une grille'],
        legendeSpe: ['✓ Acceptable', '✗ Non acceptable', 'Pointillé : à saisir', 'Point : évaluée avec une grille'],
        aideStd: 'Touche une case pour changer le niveau. Au clavier : la lettre du niveau, Retour arrière pour vider, les flèches pour se déplacer.',
        aideSpe: 'Touche une case pour changer le résultat. Au clavier : A ou N, Retour arrière pour vider, les flèches pour se déplacer.',
        palierEchec: 'palier d’échec'
    });

    let _affiche = false;
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
            echelle: famille === 'STD' ? (window.construireConfigComplete(donnees).echelle || null) : null
        };
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
        ctx.cycle = D().cycleDeLaFamille(ctx.famille, ctx.echelle);
        if (ctx.cycle.length < 2) ctx.etat = 'sans-echelle';
        else if (!ctx.etudiants.length) ctx.etat = 'aucun-eleve';
        else if (!ctx.productions.length) ctx.etat = 'aucune-production';
        return ctx;
    }

    /* ============================== UNE RANGÉE ============================== */

    /** Les productions qui comptent pour cet élève, et sa note : la source de l'export (`simulerIndices`). */
    function _resultatEleve(da, ctx) {
        const r = (typeof simulerIndices === 'function') ? simulerIndices(da, ctx.pratiqueId) : null;
        const constructible = !!(r && r.noteConstructible);
        const res = { note: constructible ? Math.round(r.P) : null, cause: r ? r.causeNonConstructible : null, comptent: new Set(), detail: '' };
        const ids = new Set(ctx.productions.map(p => p.id));
        res.aDesCopies = ctx.evaluations.some(e => e && e.etudiantDA === da && ids.has(e.productionId));
        if (ctx.famille === 'STD') _completerStd(res, r && r.details, ctx);
        else _completerSpe(res, da, ctx);
        return res;
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

    function _couleurDeLaValeur(valeur, ctx) {
        if (ctx.famille === 'SPE') return valeur === D().ACCEPTABLE ? 'var(--niveau-attention-minimal)' : 'var(--niveau-attention-critique)';
        const niveau = D().niveauxSaisissables(ctx.echelle).find(n => n.code === valeur);
        return couleurSure(niveau ? niveau.couleur : null);
    }

    function _motDeLaValeur(valeur, ctx) {
        if (valeur === '') return MOTS.aSaisir;
        if (ctx.famille === 'SPE') return valeur === D().ACCEPTABLE ? MOTS.acceptable : MOTS.nonAcceptable;
        const niveau = D().niveauxSaisissables(ctx.echelle).find(n => n.code === valeur);
        return niveau ? niveau.nom : valeur;
    }

    function _libelleDeLaValeur(valeur, ctx) {
        if (valeur === '') return '+';
        if (ctx.famille === 'SPE') return valeur === D().ACCEPTABLE ? '✓' : '✗';
        return valeur;
    }

    /** L'état d'une case ; en spécifications, une copie AVEC grille se lit par le jugement du moteur. */
    function _etatCase(etudiant, production, ctx, resultat) {
        const ev = D().copieDeLaCase(ctx.evaluations, etudiant.da, production.id);
        const etat = D().etatDeLaCase(ev, ctx.famille, resultat.comptent.has(production.id) && !!ev);
        if (ctx.famille === 'SPE' && ev && !etat.modifiable) {
            const type = ctx.types.find(t => window.productionEstDuType(production, t));
            const ok = !!(type && ctx.speInstance && ctx.speInstance._estTravailAcceptable(ev, type));
            etat.valeur = ok ? D().ACCEPTABLE : D().NON_ACCEPTABLE;
        }
        return etat;
    }

    function _caseHTML(etudiant, production, ctx, resultat) {
        const etat = _etatCase(etudiant, production, ctx, resultat);
        const nom = `${etudiant.prenom || ''} ${etudiant.nom || ''}`.trim();
        const aria = `${nom}, ${production.titre || ''} : ${_motDeLaValeur(etat.valeur, ctx)}` + (etat.modifiable ? '' : `, ${MOTS.avecGrille}`);
        const classes = ['tn-case', 'tn-case--' + etat.forme].concat(etat.modifiable ? [] : ['tn-case--grille']);
        const style = etat.valeur ? ` style="--tn-couleur: ${esc(_couleurDeLaValeur(etat.valeur, ctx))}"` : '';
        const ouvrir = etat.modifiable ? '' : ` data-evaluation="${esc(etat.evaluationId)}"`;
        return `<td class="tn-cellule"><button type="button" class="${classes.join(' ')}"${style} data-da="${esc(etudiant.da)}" data-production="${esc(production.id)}"${ouvrir} aria-label="${esc(aria)}">${esc(_libelleDeLaValeur(etat.valeur, ctx))}</button></td>`;
    }

    function _noteHTML(resultat, ctx) {
        const detail = resultat.note === null
            ? (resultat.aDesCopies ? MOTS.nonCalculable : MOTS.enAttente)
            : resultat.detail;
        const titre = resultat.cause ? ` title="${esc(resultat.cause)}"` : '';
        const note = resultat.note === null ? '–' : String(resultat.note);
        return `<td class="tn-note"${titre}><span class="tn-note-valeur">${esc(note)}</span><span class="tn-note-detail">${esc(detail)}</span></td>`;
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
        return `<tr><th scope="row" class="tn-eleve">${esc(nom)}</th>${cases}${comptes}${_noteHTML(resultat, ctx)}</tr>`;
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
        const prods = ctx.productions.map(p =>
            `<th scope="col" class="tn-col-production"><span class="tn-production-titre">${esc(p.titre || p.nom || '')}</span><span class="tn-production-date">${esc(_dateCourte(p))}</span></th>`).join('');
        const types = ctx.famille === 'SPE' ? ctx.types.map(t => `<th scope="col" class="tn-col-compte">${esc(t.nom || t.id)}</th>`).join('') : '';
        const note = ctx.config && ctx.config.notesFinales === true ? MOTS.noteFinale : MOTS.noteProvisoire;
        return `<thead><tr><th scope="col" class="tn-col-eleve">${esc(MOTS.eleve)}</th>${prods}${types}<th scope="col" class="tn-col-note">${esc(note)}</th></tr></thead>`;
    }

    /** La règle des standards, dite avec les libellés du calcul. PROPOSÉE. */
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
        return `La note retient ${base}${avecTerminale ? ', puis la terminale' : ''}.`;
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
        return `<div class="tn-bandeau">
            <div class="tn-pratique">${badge}<span class="tn-pratique-nom">${esc(ctx.pratiqueNom)}</span><span class="tn-regle">${esc(regle)}</span></div>
            <button type="button" class="btn btn-secondaire" data-action="exporterSyntheseResultatsCSV">${esc(MOTS.exporter)}</button>
        </div>
        ${ctx.famille === 'STD' ? _echelleHTML(ctx) : _forfaitsHTML(ctx)}`;
    }

    function _legendeHTML(ctx) {
        const items = (ctx.famille === 'SPE' ? MOTS.legendeSpe : MOTS.legendeStd).map(t => `<span class="tn-legende-item">${esc(t)}</span>`).join('');
        return `<div class="tn-legende">${items}<span class="tn-legende-aide">${esc(ctx.famille === 'SPE' ? MOTS.aideSpe : MOTS.aideStd)}</span></div>`;
    }

    /* ============================== LE RENDU ============================== */

    const MESSAGES_ETAT = { 'aucune-pratique': 'aucunePratique', 'autre-famille': 'autreFamille', 'aucun-eleve': 'aucunEleve', 'aucune-production': 'aucuneProduction', 'sans-echelle': 'sansEchelle' };

    function construireHTML(ctx) {
        const tete = `<h3 class="tn-titre" tabindex="-1">${esc(MOTS.titre)}</h3><p class="tn-intro">${esc(MOTS.intro)}</p>`;
        if (ctx.etat !== 'ok') return `${tete}<p class="tn-etat-vide">${esc(MOTS[MESSAGES_ETAT[ctx.etat]] || '')}</p>`;
        const rangees = ctx.etudiants.map(e => _rangeeHTML(e, ctx)).join('');
        return `${tete}${_bandeauHTML(ctx)}<p class="tn-avis">${esc(MOTS.avis)}</p>
            <div class="tn-defilement"><table class="tn-tableau">${_enteteColonnesHTML(ctx)}<tbody>${rangees}</tbody></table></div>
            ${_legendeHTML(ctx)}`;
    }

    function _hote() { return document.getElementById('tableau-notation-hote'); }

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
        hote.innerHTML = construireHTML(construireContexte());
        _poserEcoutes(hote);
        if (aRendre) _reprendreFocus(hote, aRendre);
    }

    function _reprendreFocus(hote, focus) {
        const cible = hote.querySelector(`.tn-case[data-da="${CSS.escape(focus.da)}"][data-production="${CSS.escape(focus.production)}"]`);
        if (cible) cible.focus();
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
        const r = D().appliquerSaisie(stock, { famille: ctx.famille, valeur, echelle: ctx.echelle, contexte });
        if (r.action === 'inchange' || r.action === 'refuse') return r.action;
        if (sauvegarderDonneesSelonMode('evaluationsSauvegardees', r.evaluations, { geste: 'Tableau de notation' }) !== true) return 'echec';
        window._moyennesQualifies = null;
        window._moyennesToutes = null;
        _planifierIndices();
        return r.action;
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
        const valeur = (valeurOuSuivante === null) ? D().valeurSuivante(ctx.cycle, _valeurActuelle(bouton, ctx)) : valeurOuSuivante;
        const focus = { da: bouton.dataset.da, production: bouton.dataset.production };
        ecrireCase(focus.da, focus.production, valeur);
        rendre(focus);
    }

    function _surClic(e) {
        const bouton = e.target.closest('.tn-case');
        if (!bouton) return;
        if (bouton.dataset.evaluation) {
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
        if (suivant) suivant.focus();
    }

    function _surTouche(e) {
        const bouton = e.target.closest('.tn-case');
        if (!bouton || e.metaKey || e.ctrlKey || e.altKey) return;
        if (FLECHES[e.key]) { e.preventDefault(); _deplacer(bouton, FLECHES[e.key]); return; }
        if (bouton.dataset.evaluation) return;
        const ctx = construireContexte();
        if (ctx.etat !== 'ok') return;
        const valeur = D().valeurParTouche(ctx.cycle, e.key);
        if (valeur === null) return;
        e.preventDefault();
        _appliquer(bouton, valeur);
    }

    function _poserEcoutes(hote) {
        if (hote._tnEcoutes) return;   // l'hôte reste, son contenu se réécrit : une seule paire d'écoutes
        hote._tnEcoutes = true;
        hote.addEventListener('click', _surClic);
        hote.addEventListener('keydown', _surTouche);
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
        MOTS,
        afficher,
        afficherListe,
        rafraichirSiAffiche,
        estAffiche: () => _affiche,
        construireContexte,
        construireHTML,
        ecrireCase,
        phraseRegleStd,
        couleurSure
    };
})();
