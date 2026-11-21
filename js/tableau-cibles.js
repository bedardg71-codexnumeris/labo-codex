/**
 * LE TABLEAU DES CIBLES — la pratique « Par standards », lot 2 (21 nov. 2026)
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (lot 2, section du 21 nov. 2026).
 * Fiche : plans de travail/CONCEPTION-2026-11-20-pratique-par-standards.md (N1 à N7, E2, E3).
 *
 * Évaluation › Tableau de notation, pour un groupe-cours dont la pratique est « Par standards » : les étudiant·es en
 * rangées, les CIBLES en colonnes (au lieu des productions). `tableau-notation.js` reconnaît la famille (code CIB), bâtit
 * la liste des étudiant·es et des productions du groupe, et délègue le dessin ici.
 *
 * UNE CASE montre le DERNIER niveau inscrit (la plus récente des inscriptions non annulées) et, en petit, combien
 * d'inscriptions elle porte. Ce n'est pas le niveau retenu (lot 3) : la case n'a ni le remplissage ni le contour du
 * tableau des productions, qui disent « compte » et « ne compte pas » ; elle a une surface neutre et un point de la
 * couleur du niveau, et la légende dit « pas le niveau retenu ».
 *
 * TOUCHER UNE CASE ouvre l'inscription : la cible et son énoncé ; ses critères, chacun « respecté », « non respecté » ou
 * laissé non renseigné ; le niveau, choisi par l'enseignant·e parmi ceux de l'échelle (le « sans donnée » compris) ; la
 * rétroaction (la note brève, N5) ; d'où vient le niveau (une production, ou rien : N3) ; la date. Sous le formulaire,
 * l'historique de la case, et « Annuler cette inscription » (N7) : l'inscription reste, barrée, datée de l'annulation.
 * L'APPLICATION NE CALCULE RIEN À PARTIR DES COCHES (choix de Grégoire, 21 nov. 2026, 8 h 38).
 *
 * UNE INSCRIPTION SANS NIVEAU (complément du 21 nov., 9 h 17 ; à l'écran, une « remarque », mot PROPOSÉ) : la tuile
 * « Aucun niveau » (cochée d'office dans la fenêtre d'une case : aucun niveau n'est proposé) et un texte. Le bouton dit ce
 * qu'il va inscrire (« Inscrire le niveau » ou « Inscrire la remarque »). Une remarque ne change pas le dernier niveau
 * d'une case ; une case qui n'a QUE des remarques montre ✎ et leur nombre, sans survol (au toucher, une bulle est
 * invisible).
 *
 * « INSCRIRE POUR UNE PRODUCTION » (N2, N4) : une production, un·e étudiant·e, et les cibles que la production renseigne ;
 * chacune part sur « Rien ce jour-là » : seules celles qui reçoivent un niveau s'inscrivent.
 *
 * Écriture : `InscriptionsCibles` (js/pratiques/inscriptions-cibles.js), seul écrivain de la clé. Tout texte de
 * l'enseignant·e (étiquettes, énoncés, critères, noms, rétroactions, raisons) passe par `echapperHtml` ; aucun handler
 * inline : les gestes passent par l'attribut `data-tc` et une écoute posée sur l'hôte ou la fenêtre.
 * Mots de l'écran : PROPOSÉS (plans de travail/TEXTES-2026-11-21-par-standards-lot-2.md).
 */
(function () {
    'use strict';

    const MOTS = Object.freeze({
        titre: 'Tableau de notation',
        intro: 'Touche une case pour inscrire le niveau qu’un·e étudiant·e a démontré pour une cible d’apprentissage. Chaque inscription est gardée et datée.',
        parProduction: 'Inscrire pour une production',
        eleve: 'Étudiant·e',
        terminale: 'terminale',
        legende: 'Une case montre le dernier niveau inscrit, pas le niveau retenu ; le petit nombre dit combien d’inscriptions elle porte.',
        // Complément 9 h 17 : une inscription sans niveau (« remarque », mot PROPOSÉ).
        legendeRemarques: '✎ : des remarques, aucun niveau encore.',
        aucunNiveau: 'Aucun niveau',
        remarqueSeulement: 'une remarque seulement',
        inscrireRemarque: 'Inscrire la remarque',
        remarque: 'Remarque, sans niveau',
        annonceRemarque: (nom, cible) => `${nom}, ${cible} : remarque inscrite.`,
        aide: 'Au clavier : les flèches pour se déplacer, Entrée pour ouvrir une case.',
        aucune: 'aucune inscription',
        echelleTitre: (nom) => (nom ? `Échelle « ${nom} » :` : 'Échelle :'),
        sansEchelle: 'L’échelle de cette pratique est introuvable dans ce trimestre : aucun niveau ne peut être inscrit. Rouvre la pratique dans l’assistant pour la choisir.',
        aucuneCible: 'Cette pratique n’a aucune cible. Rouvre-la dans l’assistant pour dire les cibles du cours.',
        // La fenêtre d'inscription
        inscrireTitre: 'Inscrire un niveau',
        criteres: 'Critères',
        criteresAide: 'Facultatif. Touche « Respecté » ou « Non respecté » ; touche encore pour laisser le critère non renseigné. Le niveau reste ton choix.',
        sansCritere: 'Cette cible n’a pas de critère.',
        essentiel: 'critère essentiel',
        respecte: 'Respecté',
        nonRespecte: 'Non respecté',
        niveau: 'Niveau',
        sansDonnee: 'sans donnée',
        rienCeJour: 'Rien ce jour-là',
        retroaction: 'Rétroaction',
        retroactionAide: 'Ce qui est acquis, ce qui reste à travailler.',
        origine: 'D’où vient ce niveau ?',
        origineAucune: '— Aucune production —',
        origineAide: 'Sans production : une observation, un entretien.',
        date: 'Date',
        inscrire: 'Inscrire le niveau',
        fermer: 'Fermer',
        historique: 'Historique de cette cible',
        historiqueVide: 'Aucune inscription pour l’instant.',
        sansProduction: 'Sans production',
        productionIntrouvable: 'production introuvable',
        niveauAbsent: 'niveau absent de l’échelle',
        annuler: 'Annuler cette inscription',
        annulee: (date, raison) => `Annulée le ${date}${raison ? ' : ' + raison : '.'}`,
        annulerTitre: 'Annuler cette inscription',
        annulerMessage: 'L’inscription restera visible, barrée, avec la date d’aujourd’hui. Rien ne s’efface.\n\nRaison (facultatif) :',
        annulerConfirmer: 'Annuler l’inscription',
        annulerGarder: 'Garder l’inscription',
        // Le geste par production
        productionTitre: 'Inscrire pour une production',
        productionIntro: 'Remplis seulement les cibles que l’étudiant·e a reprises dans cette production ; les autres ne reçoivent rien.',
        choisirEleve: '— Choisir un·e étudiant·e —',
        choisirProduction: '— Choisir une production —',
        production: 'Production',
        ciblesDeLaProduction: 'Les cibles de cette production',
        aucuneProductionAuGroupe: 'Aucune production n’est assignée à ce groupe-cours.',
        inscrireLesNiveaux: 'Inscrire',   // complément 9 h 17 : une cible peut recevoir une remarque sans niveau
        // Ce que dit la zone lue par le lecteur d'écran
        annonceInscrit: (nom, cible, niveau) => `${nom}, ${cible} : ${niveau} inscrit.`,
        annonceInscrits: (nom, n) => `${nom} : ${n} ${n > 1 ? 'inscriptions' : 'inscription'}.`,
        annonceAnnulee: 'Inscription annulée.'
    });

    const I = () => window.InscriptionsCibles;
    const esc = (t) => echapperHtml(t == null ? '' : String(t));
    let _focusApres = null;          // { da, cibleId } : la case qui reprend le focus après un rendu
    let _ouverte = null;             // la fenêtre ouverte : { overlay, mode, da, cibleId, retour }

    /* ============================== LE CONTEXTE ============================== */

    function _echelleDe(id) {
        if (!id) return null;
        const resolue = (typeof obtenirEchelleResolue === 'function') ? obtenirEchelleResolue(id) : null;
        if (resolue && Array.isArray(resolue.niveaux)) return resolue;
        const liste = (typeof db !== 'undefined') ? (db.getSync(cle('echellesTemplates'), []) || []) : [];
        return liste.find(e => e && e.id === id) || null;
    }

    /**
     * Ce que le tableau des cibles lit, à partir du contexte de `tableau-notation.js` (étudiant·es et productions du
     * groupe-cours actif, pratique désignée). Lecture seule.
     */
    function completerContexte(base) {
        const ctx = Object.assign({}, base);
        const conf = (ctx.donnees && ctx.donnees.configuration) || {};
        ctx.configuration = conf;
        const ensemble = window.EnsemblesCibles ? window.EnsemblesCibles.lireParId(conf.ensembleCiblesId) : null;
        ctx.ensemble = ensemble;
        ctx.cibles = ensemble ? window.EnsemblesCibles.normaliserCibles(ensemble.cibles) : [];
        ctx.echelle = _echelleDe(conf.echelleId);
        ctx.niveaux = ((ctx.echelle && ctx.echelle.niveaux) || []).filter(n => n && n.code != null && String(n.code) !== '');
        ctx.codeSansDonnee = conf.niveauSansDonnee == null ? null : String(conf.niveauSansDonnee);
        ctx.inscriptions = I().lireToutes();
        if (!ensemble) ctx.vide = window.EnsemblesCibles.MOTIFS.INTROUVABLE;
        else if (ctx.cibles.length === 0) ctx.vide = MOTS.aucuneCible;
        else if (ctx.niveaux.length === 0) ctx.vide = MOTS.sansEchelle;
        else if (!ctx.etudiants || ctx.etudiants.length === 0) ctx.vide = window.TableauNotation.MOTS.aucunEleve;
        return ctx;
    }

    function _niveauDuCode(ctx, code) {
        return ctx.niveaux.find(n => String(n.code) === String(code)) || null;
    }

    function _nomEleve(e) { return `${(e && e.prenom) || ''} ${(e && e.nom) || ''}`.trim(); }

    function _couleur(niveau) {
        return window.TableauNotation.couleurSure(niveau ? niveau.couleur : null);
    }

    /** « 21 novembre 2026 » pour une date 'AAAA-MM-JJ'. */
    function dateLisible(iso) {
        if (!iso) return '';
        const d = new Date(String(iso).length === 10 ? iso + 'T12:00:00' : iso);
        return isNaN(d) ? String(iso) : d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    /* ============================== LE TABLEAU ============================== */

    /** Le bandeau : la pratique et ses réglages ; le geste « inscrire pour une production » quand le tableau peut l'offrir. */
    function _bandeauHTML(ctx, avecGestes) {
        const badge = typeof genererBadgePratiqueHTML === 'function' ? genererBadgePratiqueHTML('cibles') : '';
        const reglages = window.TableauNotation.MOTS.reglages;
        const gestes = avecGestes ? `<div class="tn-gestes"><button type="button" class="btn btn-principal" data-tc="par-production">${esc(MOTS.parProduction)}</button></div>` : '';
        return `<div class="tn-bandeau">
            <div class="tn-pratique">${badge}<span class="tn-pratique-nom">${esc(ctx.pratiqueNom)}</span>
                <a href="#" class="tn-reglages" data-prevent data-action="ouvrirReglagesPratique" data-param="${esc(ctx.pratiqueId)}">${esc(reglages)}</a></div>
            ${gestes}
        </div>`;
    }

    function _echelleHTML(ctx) {
        const niveaux = ctx.niveaux.map(n => {
            const marque = String(n.code) === ctx.codeSansDonnee ? ` <span class="tc-repere-marque">(${esc(MOTS.sansDonnee)})</span>` : '';
            return `<span class="tn-niveau" style="--tn-couleur: ${esc(_couleur(n))}"><span class="tn-niveau-code">${esc(n.code)}</span> ${esc(n.nom || '')}${marque}</span>`;
        }).join('');
        return `<div class="tn-repere"><span class="tn-repere-titre">${esc(MOTS.echelleTitre(ctx.echelle && ctx.echelle.nom))}</span>${niveaux}</div>`;
    }

    /** La phrase de la note absente : celle que la pratique déclare (profil, rapport, export), une fois, au-dessus du tableau. */
    function _noteAbsenteHTML(ctx) {
        const p = typeof window.obtenirPratiqueParId === 'function' ? window.obtenirPratiqueParId(ctx.pratiqueId) : null;
        const phrase = (p && typeof p.expliquerNoteNonConstructible === 'function') ? p.expliquerNoteNonConstructible(null) : '';
        return phrase ? `<p class="tn-avis tc-note-absente">${esc(phrase)}</p>` : '';
    }

    function _enteteHTML(ctx) {
        const cols = ctx.cibles.map(c => `<th scope="col" class="tn-col-production tc-col-cible">`
            + `<span class="tn-production-titre">${esc(c.etiquette)}</span>`
            + (c.terminale ? `<span class="tn-production-date">${esc(MOTS.terminale)}</span>` : '')
            + `</th>`).join('');
        return `<thead><tr><th scope="col" class="tn-col-eleve">${esc(MOTS.eleve)}</th>${cols}</tr></thead>`;
    }

    /** Le libellé lu d'une case, et son infobulle. Les remarques (aucun niveau) sont dites à part. */
    function _ditLaCase(nom, cible, etat, niveau) {
        const annulees = etat.annulees ? `, ${etat.annulees} ${etat.annulees > 1 ? 'annulées' : 'annulée'}` : '';
        const r = etat.remarques || 0;
        const remarques = `${r} ${r > 1 ? 'remarques' : 'remarque'}`;
        if (!etat.derniere) return r ? `${nom}, ${cible.etiquette} : aucun niveau inscrit, ${remarques}${annulees}` : `${nom}, ${cible.etiquette} : ${MOTS.aucune}`;
        const nomNiveau = niveau ? (niveau.nom || niveau.code) : `${etat.derniere.niveau} (${MOTS.niveauAbsent})`;
        const n = etat.actives;
        return `${nom}, ${cible.etiquette} : dernier niveau inscrit ${nomNiveau}, ${n} ${n > 1 ? 'inscriptions' : 'inscription'}`
            + `${r ? ', dont ' + remarques : ''}${annulees}`;
    }

    function _caseHTML(ctx, etudiant, cible, premiere) {
        const etat = I().etatDeLaCase(ctx.inscriptions, etudiant.da, ctx.ensemble.id, cible.id);
        const niveau = etat.derniere ? _niveauDuCode(ctx, etat.derniere.niveau) : null;
        const dit = _ditLaCase(_nomEleve(etudiant), cible, etat, niveau);
        const attrs = `data-tc="case" data-da="${esc(etudiant.da)}" data-cible="${esc(cible.id)}" tabindex="${premiere ? '0' : '-1'}" aria-label="${esc(dit)}" title="${esc(dit)}"`;
        if (!etat.derniere && etat.remarques) {
            // Seulement des remarques : une marque visible sans survol (✎) et leur nombre ; aucun niveau, aucune couleur.
            return `<td class="tn-cellule"><button type="button" class="tc-case tc-case--remarques" ${attrs}>`
                + `<span class="tc-case-remarque" aria-hidden="true">✎</span><span class="tc-case-compte" aria-hidden="true">${esc(String(etat.remarques))}</span></button></td>`;
        }
        if (!etat.derniere) {
            return `<td class="tn-cellule"><button type="button" class="tc-case tc-case--vide" ${attrs}><span aria-hidden="true">+</span></button></td>`;
        }
        const style = ` style="--tn-couleur: ${esc(_couleur(niveau))}"`;
        return `<td class="tn-cellule"><button type="button" class="tc-case"${style} ${attrs}>`
            + `<span class="tc-case-point" aria-hidden="true"></span><span class="tc-case-niveau" aria-hidden="true">${esc(etat.derniere.niveau)}</span>`
            + `<span class="tc-case-compte" aria-hidden="true">${esc(String(etat.actives))}</span></button></td>`;
    }

    function _rangeeHTML(ctx, etudiant, i) {
        const cases = ctx.cibles.map((c, j) => _caseHTML(ctx, etudiant, c, i === 0 && j === 0)).join('');
        return `<tr><th scope="row" class="tn-eleve">${esc(_nomEleve(etudiant))}</th>${cases}</tr>`;
    }

    /**
     * Le HTML du tableau des cibles (contexte de `completerContexte`). Le titre garde la classe `tn-titre` : l'ouverture
     * de la sous-section y pose le focus.
     */
    function construireHTML(base) {
        const ctx = completerContexte(base);
        const tete = `<h3 class="tn-titre" tabindex="-1">${esc(MOTS.titre)}</h3><p class="tn-intro">${esc(MOTS.intro)}</p>`;
        if (ctx.vide) return `${tete}${_bandeauHTML(ctx, false)}<p class="tn-etat-vide">${esc(ctx.vide)}</p>`;
        const rangees = ctx.etudiants.map((e, i) => _rangeeHTML(ctx, e, i)).join('');
        return `${tete}${_bandeauHTML(ctx, true)}${_echelleHTML(ctx)}${_noteAbsenteHTML(ctx)}
            <div class="tn-cadre"><div class="tn-defilement"><table class="tn-tableau tc-tableau">${_enteteHTML(ctx)}<tbody>${rangees}</tbody></table></div></div>
            <div class="tn-legende"><span class="tn-legende-item tc-legende">${esc(MOTS.legende)}</span>${rangees.indexOf('tc-case--remarques') !== -1 ? `<span class="tn-legende-item tc-legende">${esc(MOTS.legendeRemarques)}</span>` : ''}<span class="tn-legende-aide">${esc(MOTS.aide)}</span></div>
            <p class="tn-annonce u-lecteur-ecran tc-annonce" aria-live="polite"></p>`;
    }

    /* ============================== APRÈS LE RENDU : LES ÉCOUTES, LE FOCUS ============================== */

    let _contexteCourant = null;

    /** Appelé par `tableau-notation.js` après chaque rendu du tableau des cibles. */
    function apresRendu(hote, base) {
        _contexteCourant = base;
        if (!hote._tcEcoutes) {
            hote._tcEcoutes = true;
            hote.addEventListener('click', _surClicTableau);
            hote.addEventListener('keydown', _surToucheTableau);
        }
        if (_focusApres) {
            const f = _focusApres;
            _focusApres = null;
            const bouton = hote.querySelector(`.tc-case[data-da="${CSS.escape(f.da)}"][data-cible="${CSS.escape(f.cibleId)}"]`);
            if (bouton) _donnerLeFocus(hote, bouton);
        }
    }

    function _donnerLeFocus(hote, bouton) {
        hote.querySelectorAll('.tc-case[tabindex="0"]').forEach(b => { if (b !== bouton) b.setAttribute('tabindex', '-1'); });
        bouton.setAttribute('tabindex', '0');
        bouton.focus({ preventScroll: false });
    }

    function _surClicTableau(e) {
        if (!_contexteCourant || _contexteCourant.etat !== 'cibles') return;
        const geste = e.target.closest('[data-tc]');
        if (!geste) return;
        if (geste.dataset.tc === 'case') ouvrirInscription(geste.dataset.da, geste.dataset.cible, geste);
        else if (geste.dataset.tc === 'par-production') ouvrirParProduction(geste);
    }

    const FLECHES = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };

    function _surToucheTableau(e) {
        const bouton = e.target.closest('.tc-case');
        if (!bouton || !FLECHES[e.key] || e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        const d = FLECHES[e.key];
        const cellule = bouton.closest('td');
        const rangee = cellule.parentElement;
        const col = Array.prototype.indexOf.call(rangee.children, cellule);
        const rangees = Array.from(rangee.parentElement.children);
        const cible = rangees[rangees.indexOf(rangee) + d[0]];
        const td = (cible || rangee).children[col + d[1]];
        const suivant = td && (cible || !d[0]) ? td.querySelector('.tc-case') : null;
        if (suivant) _donnerLeFocus(e.currentTarget, suivant);
    }

    function _rerendre(focus) {
        _focusApres = focus || null;
        if (window.TableauNotation && typeof window.TableauNotation.rafraichirSiAffiche === 'function') window.TableauNotation.rafraichirSiAffiche();
    }

    function _annoncer(texte) {
        const zone = document.querySelector('.tc-annonce');
        if (zone) zone.textContent = texte;
    }

    /* ============================== LA FENÊTRE ============================== */

    function _fermer() {
        if (!_ouverte) return;
        const { overlay, retour } = _ouverte;
        document.removeEventListener('keydown', _surToucheFenetre, true);
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        _ouverte = null;
        if (retour && document.contains(retour)) retour.focus();
    }

    function _surToucheFenetre(e) {
        if (e.key !== 'Escape' || !_ouverte) return;
        // Une question posée par-dessus (uiDialogues) se ferme d'abord : elle écoute la même touche.
        if (document.getElementById('overlay-ui-dialogue')) return;
        e.preventDefault();
        _fermer();
    }

    /** Pose une fenêtre (modale du design system) ; `html` est déjà échappé. */
    function _ouvrirFenetre(html, etat) {
        _fermer();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay actif tc-overlay';
        overlay.setAttribute('role', 'presentation');
        // security-ok : tout texte de l'enseignant·e et des données est échappé par `esc` (echapperHtml) dans les gabarits.
        overlay.innerHTML = `<div class="modal-contenu tc-fenetre" role="dialog" aria-modal="true" aria-labelledby="tc-fenetre-titre">${html}</div>`;
        overlay.addEventListener('click', _surClicFenetre);
        overlay.addEventListener('change', _surChangementFenetre);
        overlay.addEventListener('submit', (e) => e.preventDefault());   // Entrée dans un champ n'envoie rien : le bouton écrit
        document.body.appendChild(overlay);
        document.addEventListener('keydown', _surToucheFenetre, true);
        _ouverte = Object.assign({ overlay }, etat);
        const premier = overlay.querySelector('[data-tc-premier]') || overlay.querySelector('button, input, select, textarea');
        if (premier) premier.focus();
        return overlay;
    }

    function _alerte(overlay, motifs) {
        const zone = overlay.querySelector('.tc-alerte');
        if (!zone) return;
        zone.textContent = (motifs || []).join(' ');
        zone.classList.toggle('u-hide', !(motifs && motifs.length));
    }

    /* ----- Les morceaux communs : les critères, le niveau, la rétroaction ----- */

    function _criteresHTML(cible, prefixe) {
        if (!cible.criteres || cible.criteres.length === 0) return `<p class="tc-aide">${esc(MOTS.sansCritere)}</p>`;
        const lignes = cible.criteres.map(k => `
            <li class="tc-critere" data-critere="${esc(k.id)}">
                <span class="tc-critere-texte">${esc(k.texte)}${k.essentiel ? ` <span class="cibles-fiche-essentiel">${esc(MOTS.essentiel)}</span>` : ''}</span>
                <span class="tc-critere-choix" role="group" aria-label="${esc(k.texte)}">
                    <button type="button" class="tc-coche tc-coche--oui" aria-pressed="false" data-tc="coche" data-valeur="oui">${esc(MOTS.respecte)}</button>
                    <button type="button" class="tc-coche tc-coche--non" aria-pressed="false" data-tc="coche" data-valeur="non">${esc(MOTS.nonRespecte)}</button>
                </span>
            </li>`).join('');
        return `<p class="tc-aide" id="${esc(prefixe)}-criteres-aide">${esc(MOTS.criteresAide)}</p>
            <ul class="tc-criteres" aria-describedby="${esc(prefixe)}-criteres-aide">${lignes}</ul>`;
    }

    /**
     * Les tuiles du niveau. `parProduction` : « Rien ce jour-là » d'abord, coché d'office (N4). Puis « Aucun niveau » (une
     * remarque ; complément 9 h 17), cochée d'office dans la fenêtre d'une case : aucun niveau n'est proposé. Puis chaque
     * niveau de l'échelle, le « sans donnée » compris (E3) : « Aucun niveau » n'est pas lui.
     */
    function _niveauxHTML(ctx, prefixe, parProduction) {
        const nom = `${prefixe}-niveau`;
        const tuile = (marqueur, nomTuile, aide, coche, classe) => `<label class="tc-niveau ${classe}"><input type="radio" name="${esc(nom)}" value="" ${marqueur}${coche ? ' checked' : ''}>`
            + `<span class="tc-niveau-texte"><span class="tc-niveau-nom">${esc(nomTuile)}</span>${aide ? `<span class="tc-niveau-marque">${esc(aide)}</span>` : ''}</span></label>`;
        const rien = (parProduction ? tuile('data-rien', MOTS.rienCeJour, '', true, 'tc-niveau--rien') : '')
            + tuile('data-sans-niveau', MOTS.aucunNiveau, MOTS.remarqueSeulement, !parProduction, 'tc-niveau--rien tc-niveau--sans');
        const tuiles = ctx.niveaux.map(n => {
            const marque = String(n.code) === ctx.codeSansDonnee ? `<span class="tc-niveau-marque">${esc(MOTS.sansDonnee)}</span>` : '';
            return `<label class="tc-niveau" style="--tn-couleur: ${esc(_couleur(n))}"><input type="radio" name="${esc(nom)}" value="${esc(n.code)}">`
                + `<span class="tc-niveau-code">${esc(n.code)}</span><span class="tc-niveau-texte"><span class="tc-niveau-nom">${esc(n.nom || '')}</span>${marque}</span></label>`;
        }).join('');
        return `<div class="tc-niveaux" role="radiogroup" aria-labelledby="${esc(prefixe)}-niveau-titre">${rien}${tuiles}</div>`;
    }

    function _retroactionHTML(prefixe) {
        const id = `${prefixe}-retroaction`;
        return `<label class="tc-champ" for="${esc(id)}"><span class="tc-champ-nom">${esc(MOTS.retroaction)}</span>
            <textarea id="${esc(id)}" class="controle-form tc-retroaction" rows="3" maxlength="${I().LONGUEUR_NOTE_BREVE}" placeholder="${esc(MOTS.retroactionAide)}"></textarea></label>`;
    }

    function _origineHTML(ctx, id) {
        const options = (ctx.productions || []).map(p => `<option value="${esc(p.id)}">${esc(p.titre || p.nom || p.id)}</option>`).join('');
        return `<label class="tc-champ" for="${esc(id)}"><span class="tc-champ-nom">${esc(MOTS.origine)}</span>
            <select id="${esc(id)}" class="controle-form tc-origine"><option value="">${esc(MOTS.origineAucune)}</option>${options}</select>
            <span class="tc-aide">${esc(MOTS.origineAide)}</span></label>`;
    }

    function _dateHTML(id) {
        return `<label class="tc-champ tc-champ--date" for="${esc(id)}"><span class="tc-champ-nom">${esc(MOTS.date)}</span>
            <input type="date" id="${esc(id)}" class="controle-form tc-date" value="${esc(I().dateDuJour())}" required></label>`;
    }

    /** Les réponses aux critères d'un bloc : { [critereId]: true | false } ; un critère sans réponse n'y est pas. */
    function _lireCoches(bloc) {
        const reponses = {};
        bloc.querySelectorAll('.tc-critere').forEach(li => {
            const presse = li.querySelector('.tc-coche[aria-pressed="true"]');
            if (presse) reponses[li.dataset.critere] = presse.dataset.valeur === 'oui';
        });
        return reponses;
    }

    /** `{ rien, niveau }` : `rien` pour « Rien ce jour-là » ; `niveau` est un code, ou null (« Aucun niveau »). */
    function _lireNiveau(bloc, prefixe) {
        const coche = bloc.querySelector(`input[name="${CSS.escape(prefixe + '-niveau')}"]:checked`);
        return { rien: !!coche && coche.hasAttribute('data-rien'), niveau: I().lireNiveau(coche ? coche.value : null) };
    }

    /* ----- L'inscription d'une case ----- */

    function _ligneCritereHistorique(k) {
        const r = I().lireRespecte(k.respecte);
        const signe = r === true ? '✓' : (r === false ? '✗' : '–');
        const etat = r === true ? MOTS.respecte.toLowerCase() : (r === false ? MOTS.nonRespecte.toLowerCase() : 'non renseigné');
        return `<li class="tc-entree-critere tc-entree-critere--${r === true ? 'oui' : (r === false ? 'non' : 'vide')}">`
            + `<span class="tc-entree-signe" aria-hidden="true">${signe}</span><span class="u-lecteur-ecran">${esc(etat)} : </span>${esc(k.texte)}`
            + `${k.essentiel ? ` <span class="cibles-fiche-essentiel">${esc(MOTS.essentiel)}</span>` : ''}</li>`;
    }

    function _titreProduction(id) {
        if (!id) return MOTS.sansProduction;
        const toutes = (typeof obtenirDonneesSelonMode === 'function') ? (obtenirDonneesSelonMode('productions') || []) : [];
        const p = toutes.find(x => x && x.id === id);
        return p ? `${MOTS.production} : ${p.titre || p.nom || id}` : `${MOTS.production} : ${MOTS.productionIntrouvable}`;
    }

    function historiqueHTML(ctx, da, cibleId) {
        const h = I().historiqueDeLaCase(ctx.inscriptions, da, ctx.ensemble.id, cibleId);
        if (h.length === 0) return `<p class="tc-aide">${esc(MOTS.historiqueVide)}</p>`;
        const entrees = h.map(({ inscription: i, annulation: a }) => {
            const sansNiveau = I().estSansNiveau(i);
            const niveau = sansNiveau ? null : _niveauDuCode(ctx, i.niveau);
            const nomNiveau = sansNiveau ? MOTS.remarque : (niveau ? `${i.niveau} · ${niveau.nom || ''}` : `${i.niveau} (${MOTS.niveauAbsent})`);
            const criteres = (i.criteres || []).length ? `<ul class="tc-entree-criteres">${i.criteres.map(_ligneCritereHistorique).join('')}</ul>` : '';
            const fin = a
                ? `<p class="tc-entree-annulation">${esc(MOTS.annulee(dateLisible(a.date), a.raison))}</p>`
                : `<button type="button" class="btn btn-neutre btn-mini tc-entree-annuler" data-tc="annuler" data-id="${esc(i.id)}">${esc(MOTS.annuler)}</button>`;
            return `<li class="tc-entree${a ? ' tc-entree--annulee' : ''}">
                <div class="tc-entree-corps">
                    <div class="tc-entree-tete"><span class="tc-entree-date">${esc(dateLisible(i.date))}</span>
                        <span class="tc-entree-niveau${sansNiveau ? ' tc-entree-niveau--remarque' : ''}" style="--tn-couleur: ${esc(_couleur(niveau))}">${esc(nomNiveau)}</span>
                        <span class="tc-entree-origine">${esc(_titreProduction(i.productionId))}</span></div>
                    ${i.noteBreve ? `<p class="tc-entree-note">${esc(i.noteBreve)}</p>` : ''}
                    ${criteres}
                </div>${fin}</li>`;
        }).join('');
        return `<ol class="tc-historique-liste">${entrees}</ol>`;
    }

    /**
     * Ouvre l'inscription d'une case : la cible, ses critères, le niveau, la rétroaction, l'origine, la date ; puis
     * l'historique de la case.
     */
    function ouvrirInscription(da, cibleId, retour) {
        const ctx = completerContexte(_contexteCourant || {});
        const cible = ctx.cibles.find(c => c.id === cibleId);
        const etudiant = (ctx.etudiants || []).find(e => String(e.da) === String(da));
        if (!cible || !etudiant || ctx.vide) return null;
        const p = 'tc-un';
        const html = `
            <button type="button" class="modal-fermer" data-tc="fermer" aria-label="${esc(MOTS.fermer)}"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
            <h3 class="modal-titre" id="tc-fenetre-titre">${esc(MOTS.inscrireTitre)}</h3>
            <p class="tc-qui">${esc(_nomEleve(etudiant))}</p>
            <div class="tc-cible">
                <p class="tc-cible-etiquette">${esc(cible.etiquette)}${cible.terminale ? ` <span class="cibles-fiche-terminale">Cible terminale</span>` : ''}</p>
                ${cible.enonce ? `<p class="tc-cible-enonce">${esc(cible.enonce)}</p>` : ''}
            </div>
            <form class="tc-formulaire" data-tc-bloc data-prefixe="${p}" novalidate>
                <section class="tc-section"><h4 class="tc-section-titre">${esc(MOTS.criteres)}</h4>${_criteresHTML(cible, p)}</section>
                <section class="tc-section"><h4 class="tc-section-titre" id="${p}-niveau-titre">${esc(MOTS.niveau)}</h4>${_niveauxHTML(ctx, p, false)}</section>
                <section class="tc-section">${_retroactionHTML(p)}</section>
                <section class="tc-section tc-section--ligne">${_origineHTML(ctx, p + '-origine')}${_dateHTML(p + '-date')}</section>
                <p class="tc-alerte u-hide" role="alert"></p>
                <div class="modal-actions"><button type="button" class="btn btn-neutre" data-tc="fermer">${esc(MOTS.fermer)}</button>
                    <button type="button" class="btn btn-principal" data-tc="inscrire">${esc(MOTS.inscrireRemarque)}</button></div>
            </form>
            <section class="tc-historique"><h4 class="tc-section-titre">${esc(MOTS.historique)}</h4><div class="tc-historique-hote">${historiqueHTML(ctx, da, cibleId)}</div></section>`;
        return _ouvrirFenetre(html, { mode: 'case', da: String(da), cibleId, retour, ctx });
    }

    async function _inscrireCase(overlay) {
        const { ctx, da, cibleId } = _ouverte;
        const bloc = overlay.querySelector('[data-tc-bloc]');
        const p = bloc.dataset.prefixe;
        const cible = ctx.cibles.find(c => c.id === cibleId);
        const saisie = {
            da, ensembleId: ctx.ensemble.id, cibleId,
            niveau: _lireNiveau(bloc, p).niveau,
            echelleId: ctx.echelle ? (ctx.echelle.id || null) : null,
            date: bloc.querySelector('.tc-date').value,
            productionId: bloc.querySelector('.tc-origine').value || null,
            noteBreve: bloc.querySelector('.tc-retroaction').value,
            criteres: I().etatDesCriteres(cible, _lireCoches(bloc))
        };
        const motifs = I().motifsRefus(saisie, ctx.echelle);
        _alerte(overlay, motifs);
        if (motifs.length) return false;
        const r = await I().inscrire([saisie], { geste: 'Inscrire un niveau' });
        if (!r.ok) return false;
        const niveau = _niveauDuCode(ctx, saisie.niveau);
        const etudiant = ctx.etudiants.find(e => String(e.da) === String(da));
        _fermer();
        _rerendre({ da, cibleId });
        _annoncer(r.entrees[0].niveau === null ? MOTS.annonceRemarque(_nomEleve(etudiant), cible.etiquette)
            : MOTS.annonceInscrit(_nomEleve(etudiant), cible.etiquette, niveau ? (niveau.nom || niveau.code) : saisie.niveau));
        return true;
    }

    async function _annulerInscription(overlay, id) {
        const raison = (window.uiDialogues && typeof window.uiDialogues.demanderSaisie === 'function')
            ? await window.uiDialogues.demanderSaisie({ titre: MOTS.annulerTitre, message: MOTS.annulerMessage, preformate: true,
                multiligne: true, texteConfirmer: MOTS.annulerConfirmer, texteAnnuler: MOTS.annulerGarder, variante: 'danger' })
            : null;
        if (raison === null) return false;
        const r = await I().annuler(id, raison, { geste: 'Annuler une inscription' });
        if (!r.ok) {
            if (r.motif) _alerte(overlay, [r.motif]);
            return false;
        }
        // L'historique se redessine dans la fenêtre ouverte ; le tableau derrière aussi.
        if (_ouverte && _ouverte.overlay === overlay) {
            const ctx = completerContexte(_contexteCourant || {});
            _ouverte.ctx = ctx;
            const hote = overlay.querySelector('.tc-historique-hote');
            // security-ok : historiqueHTML échappe tout texte (esc)
            if (hote) hote.innerHTML = historiqueHTML(ctx, _ouverte.da, _ouverte.cibleId);
            const titre = overlay.querySelector('.tc-historique .tc-section-titre');
            if (titre) { titre.setAttribute('tabindex', '-1'); titre.focus(); }
        }
        _focusApres = _ouverte ? { da: _ouverte.da, cibleId: _ouverte.cibleId } : null;
        if (window.TableauNotation) window.TableauNotation.rafraichirSiAffiche();
        _annoncer(MOTS.annonceAnnulee);
        return true;
    }

    /* ----- Le geste « inscrire pour une production » ----- */

    function _blocCibleProductionHTML(ctx, cible) {
        const p = 'tc-pr-' + cible.id.replace(/[^A-Za-z0-9_-]/g, '');
        return `<fieldset class="tc-bloc-cible" data-tc-bloc data-prefixe="${esc(p)}" data-cible="${esc(cible.id)}">
            <legend class="tc-cible-etiquette">${esc(cible.etiquette)}${cible.terminale ? ` <span class="cibles-fiche-terminale">Cible terminale</span>` : ''}</legend>
            ${cible.enonce ? `<p class="tc-cible-enonce">${esc(cible.enonce)}</p>` : ''}
            <h5 class="u-lecteur-ecran" id="${esc(p)}-niveau-titre">${esc(MOTS.niveau)} : ${esc(cible.etiquette)}</h5>
            ${_niveauxHTML(ctx, p, true)}
            <div class="tc-bloc-details u-hide">
                <div class="tc-section"><span class="tc-champ-nom">${esc(MOTS.criteres)}</span>${_criteresHTML(cible, p)}</div>
                <div class="tc-section">${_retroactionHTML(p)}</div>
            </div>
        </fieldset>`;
    }

    function _ciblesDeLaProductionHTML(ctx, productionId) {
        const production = (ctx.productions || []).find(x => x.id === productionId) || null;
        if (!production) return '';
        const offertes = I().ciblesOffertes(production, ctx.cibles);
        return `<h4 class="tc-section-titre">${esc(MOTS.ciblesDeLaProduction)}</h4>${offertes.map(c => _blocCibleProductionHTML(ctx, c)).join('')}`;
    }

    /** Ouvre le geste « inscrire pour une production » : l'étudiant·e, la production, la date, puis les cibles offertes. */
    function ouvrirParProduction(retour) {
        const ctx = completerContexte(_contexteCourant || {});
        if (ctx.vide) return null;
        const eleves = ctx.etudiants.map(e => `<option value="${esc(e.da)}">${esc(_nomEleve(e))}</option>`).join('');
        const prods = (ctx.productions || []).map(p => `<option value="${esc(p.id)}">${esc(p.titre || p.nom || p.id)}</option>`).join('');
        const aucune = (ctx.productions || []).length === 0 ? `<p class="tc-aide">${esc(MOTS.aucuneProductionAuGroupe)}</p>` : '';
        const html = `
            <button type="button" class="modal-fermer" data-tc="fermer" aria-label="${esc(MOTS.fermer)}"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
            <h3 class="modal-titre" id="tc-fenetre-titre">${esc(MOTS.productionTitre)}</h3>
            <p class="tc-aide">${esc(MOTS.productionIntro)}</p>
            <form class="tc-formulaire" novalidate>
                <section class="tc-section tc-section--ligne">
                    <label class="tc-champ" for="tc-pr-eleve"><span class="tc-champ-nom">${esc(MOTS.eleve)}</span>
                        <select id="tc-pr-eleve" class="controle-form tc-pr-eleve" data-tc-premier><option value="">${esc(MOTS.choisirEleve)}</option>${eleves}</select></label>
                    <label class="tc-champ" for="tc-pr-production"><span class="tc-champ-nom">${esc(MOTS.production)}</span>
                        <select id="tc-pr-production" class="controle-form tc-pr-production"><option value="">${esc(MOTS.choisirProduction)}</option>${prods}</select></label>
                    ${_dateHTML('tc-pr-date')}
                </section>
                ${aucune}
                <div class="tc-pr-cibles"></div>
                <p class="tc-alerte u-hide" role="alert"></p>
                <div class="modal-actions"><button type="button" class="btn btn-neutre" data-tc="fermer">${esc(MOTS.fermer)}</button>
                    <button type="button" class="btn btn-principal" data-tc="inscrire-production">${esc(MOTS.inscrireLesNiveaux)}</button></div>
            </form>`;
        return _ouvrirFenetre(html, { mode: 'production', retour, ctx });
    }

    async function _inscrireProduction(overlay) {
        const { ctx } = _ouverte;
        const da = overlay.querySelector('.tc-pr-eleve').value;
        const productionId = overlay.querySelector('.tc-pr-production').value;
        const date = overlay.querySelector('#tc-pr-date').value;
        const motifsTete = [];
        if (!da) motifsTete.push(I().MOTIFS.SANS_ELEVE);
        if (!productionId) motifsTete.push(I().MOTIFS.SANS_PRODUCTION);
        if (!I().dateValide(date)) motifsTete.push(I().MOTIFS.DATE);
        if (motifsTete.length) { _alerte(overlay, motifsTete); return false; }
        const remplies = Array.from(overlay.querySelectorAll('.tc-pr-cibles [data-tc-bloc]')).map(bloc => {
            const lu = _lireNiveau(bloc, bloc.dataset.prefixe);
            if (lu.rien) return null;   // « Rien ce jour-là » : la cible ne reçoit rien (N4)
            const cible = ctx.cibles.find(c => c.id === bloc.dataset.cible);
            return { cible, saisie: { da, ensembleId: ctx.ensemble.id, cibleId: cible.id, niveau: lu.niveau, echelleId: ctx.echelle ? (ctx.echelle.id || null) : null,
                date, productionId, noteBreve: bloc.querySelector('.tc-retroaction').value, criteres: I().etatDesCriteres(cible, _lireCoches(bloc)) } };
        }).filter(Boolean);
        if (remplies.length === 0) { _alerte(overlay, [I().MOTIFS.AUCUNE_CIBLE_REMPLIE]); return false; }
        // Le refus nomme sa cible (une remarque vide, par exemple) : lisible sans bulle.
        const enMinuscule = (m) => m.charAt(0).toLowerCase() + m.slice(1);
        const motifs = remplies.map(x => I().motifsRefus(x.saisie, ctx.echelle).map(m => `« ${x.cible.etiquette} » : ${enMinuscule(m)}`)).find(m => m.length) || [];
        const saisies = remplies.map(x => x.saisie);
        _alerte(overlay, motifs);
        if (motifs.length) return false;
        const r = await I().inscrire(saisies, { geste: 'Inscrire pour une production' });
        if (!r.ok) return false;
        const etudiant = ctx.etudiants.find(e => String(e.da) === String(da));
        _fermer();
        _rerendre({ da, cibleId: saisies[0].cibleId });
        _annoncer(MOTS.annonceInscrits(_nomEleve(etudiant), saisies.length));
        return true;
    }

    /* ----- Les écoutes de la fenêtre ----- */

    function _basculerCoche(bouton) {
        const presse = bouton.getAttribute('aria-pressed') === 'true';
        bouton.closest('.tc-critere-choix').querySelectorAll('.tc-coche').forEach(b => b.setAttribute('aria-pressed', 'false'));
        if (!presse) bouton.setAttribute('aria-pressed', 'true');
    }

    function _surClicFenetre(e) {
        const overlay = e.currentTarget;
        if (e.target === overlay) { _fermer(); return; }
        const geste = e.target.closest('[data-tc]');
        if (!geste) return;
        const g = geste.dataset.tc;
        if (g === 'fermer') _fermer();
        else if (g === 'coche') _basculerCoche(geste);
        else if (g === 'inscrire') _inscrireCase(overlay);
        else if (g === 'annuler') _annulerInscription(overlay, geste.dataset.id);
        else if (g === 'inscrire-production') _inscrireProduction(overlay);
    }

    function _surChangementFenetre(e) {
        const overlay = e.currentTarget;
        if (e.target.classList.contains('tc-pr-production') && _ouverte) {
            const hote = overlay.querySelector('.tc-pr-cibles');
            // security-ok : _ciblesDeLaProductionHTML échappe tout texte (esc)
            hote.innerHTML = _ciblesDeLaProductionHTML(_ouverte.ctx, e.target.value);
            _alerte(overlay, []);
            return;
        }
        if (e.target.type !== 'radio') return;
        // Une cible du geste par production : ses critères et sa rétroaction paraissent dès qu'elle reçoit quelque chose.
        const bloc = e.target.closest('.tc-bloc-cible');
        const details = bloc && bloc.querySelector('.tc-bloc-details');
        if (details) details.classList.toggle('u-hide', e.target.hasAttribute('data-rien'));
        // La fenêtre d'une case : le bouton dit ce qu'il va inscrire.
        const bouton = !bloc && overlay.querySelector('[data-tc="inscrire"]');
        if (bouton) bouton.textContent = e.target.hasAttribute('data-sans-niveau') ? MOTS.inscrireRemarque : MOTS.inscrire;
    }

    window.TableauCibles = {
        MOTS,
        completerContexte,
        construireHTML,
        apresRendu,
        historiqueHTML,
        ouvrirInscription,
        ouvrirParProduction,
        dateLisible,
        fermer: _fermer
    };
})();
