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
 * UNE CASE montre le NIVEAU RETENU (lot 3, 21 nov. 2026 : le meilleur niveau parmi les inscriptions non annulées qui
 * portent un niveau ; il ne redescend pas, seule une annulation le fait baisser ; `NoteCibles`, js/pratiques/note-cibles.js)
 * et, en petit, combien d'inscriptions elle porte. Une cible sans donnée (aucune inscription, ou seulement des remarques)
 * porte le NOM du niveau « sans donnée » de l'échelle, jamais un vide ni un zéro. Ordre des niveaux illisible : rien n'est
 * retenu, et le motif se lit au-dessus du tableau. Surface neutre et point de la couleur du niveau, comme au lot 2.
 * Si le dernier niveau inscrit est plus bas que le retenu, l'historique de la case le dit, en clair (sans bulle).
 *
 * LA NOTE (lot 4) : une colonne au bout de chaque rangée. La note (arrondie comme l'indice P, `arrondirIndiceSurCent`) ;
 * pendant la session, tant qu'une cible est sans donnée, « En attente » et les cibles nommées, sans bulle ; « Non
 * calculable » et son motif ; « plafonnée » quand le double seuil a joué.
 *
 * TOUCHER UNE CASE ouvre l'inscription : la cible et son énoncé ; ses critères, chacun « respecté », « non respecté » ou
 * laissé non renseigné ; le niveau, choisi par l'enseignant·e parmi ceux de l'échelle (le « sans donnée » compris) ; la
 * rétroaction (la note brève, N5) ; d'où vient le niveau (une production, ou rien : N3) ; la date. Sous le formulaire,
 * l'historique de la case, et « Annuler cette inscription » (N7) : l'inscription reste, barrée, datée de l'annulation.
 * L'APPLICATION NE CALCULE RIEN À PARTIR DES COCHES (choix de Grégoire, 21 nov. 2026, 8 h 38).
 *
 * UNE INSCRIPTION SANS NIVEAU (complément du 21 nov., 9 h 17 ; à l'écran, une « remarque », mot PROPOSÉ) : la tuile
 * « Aucun niveau » (cochée d'office dans la fenêtre d'une case : aucun niveau n'est proposé) et un texte. Le bouton dit ce
 * qu'il va inscrire (« Inscrire le niveau » ou « Inscrire la remarque »). Une remarque n'entre jamais au niveau retenu ;
 * une case qui n'a QUE des remarques montre ✎, leur nombre et le nom du niveau « sans donnée », sans survol (au toucher,
 * une bulle est invisible).
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
        // Lot 3 : la case montre le niveau retenu (mots PROPOSÉS, TEXTES-2026-11-21-par-standards-lots-3-4.md).
        legende: 'Une case montre le niveau retenu : le meilleur niveau inscrit, qui ne redescend pas. Le petit nombre dit combien d’inscriptions elle porte.',
        legendeSansDonnee: (nom) => `« ${nom} » : aucun niveau inscrit pour cette cible (sans donnée).`,
        // Complément 9 h 17 : une inscription sans niveau (« remarque », mot PROPOSÉ).
        legendeRemarques: '✎ : des remarques, aucun niveau encore.',
        // Lot 4 : la colonne de la note.
        colNote: 'Note',
        legendeNote: 'Note : la moyenne pondérée des niveaux retenus. Tant qu’une cible est sans donnée, pas de note : les cibles en attente sont nommées.',
        legendeNoteFinale: 'Note : la moyenne pondérée des niveaux retenus. Notes finalisées : une cible sans donnée compte pour 0\u00a0%.',
        noteEnAttente: 'En attente',
        noteAttenteDe: (etiquettes) => etiquettes.join(', '),
        noteNonCalculable: 'Non calculable',
        notePlafonnee: 'plafonnée',
        ditNote: (nom, note) => `${nom} : note ${note}`,
        ditNoteAttente: (nom, etiquettes) => `${nom} : pas encore de note, en attente de ${etiquettes.join(', ')}`,
        ditNoteNonCalculable: (nom, motif) => `${nom} : note non calculable. ${motif}`,
        // L'historique d'une case : le niveau retenu, en clair.
        retenuTitre: 'Niveau retenu',
        retenuDepuis: (date) => `inscrit le ${date}.`,
        retenuSansDonnee: (nom) => `Sans donnée : « ${nom} ». Aucun niveau n’est inscrit pour cette cible.`,
        retenuSansDonneeInscrit: 'Ce niveau dit « sans donnée » : pendant la session, la cible est en attente ; à l’arrêt des notes, elle compte pour 0\u00a0%.',
        dernierPlusBas: (nom, date) => `Le dernier niveau inscrit, ${nom} (le ${date}), est plus bas : le niveau retenu ne redescend pas.`,
        retenuIllisible: 'Aucun niveau n’est retenu :',
        marqueRetenu: 'niveau retenu',
        caseIllisible: 'ordre des niveaux illisible',
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
        annonceAnnulee: 'Inscription annulée.',
        // VUE SIMPLE (21 nov. 2026, « Par standards » à l'essai) : mots PROPOSÉS (TEXTES-2026-11-21-par-standards-vue-simple.md).
        simple: Object.freeze({
            introuvable: 'Les cibles de cette pratique sont introuvables dans ce trimestre. Elles se règlent en vue étendue.',
            aucuneCible: 'Ta pratique n’a pas encore de cible. Écris tes cibles : une par ligne.',
            aucuneCibleLien: 'Écrire mes cibles',
            sansEchelle: 'L’échelle de cette pratique est introuvable dans ce trimestre : elle se règle en vue étendue.',
            choisisNiveau: 'Choisis un niveau : touche une tuile.',
            date: 'L’inscription prend la date d’aujourd’hui.',
            derniere: 'Dernière inscription',
            toutHistorique: 'Toutes les inscriptions de cette cible se lisent en vue étendue.',
            annulee: 'Inscription annulée. Rien ne s’efface : elle reste, barrée, dans l’historique de la vue étendue.'
        })
    });

    const N = () => window.NoteCibles;

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
        _completerPourLaNote(ctx, conf);
        // Vue simple (21 nov. 2026) : la présentation de `vue-simple.js` ; ses états vides disent où aller (jamais « l'assistant »).
        ctx.simple = !!ctx.presentation;
        ctx.videEtat = _etatVide(ctx);
        ctx.vide = ctx.videEtat ? _motDuVide(ctx) : undefined;
        return ctx;
    }

    /** Pourquoi le tableau est vide : 'introuvable', 'aucune-cible', 'sans-echelle', 'aucun-eleve', ou null. */
    function _etatVide(ctx) {
        if (!ctx.ensemble) return 'introuvable';
        if (ctx.cibles.length === 0) return 'aucune-cible';
        if (ctx.niveaux.length === 0) return 'sans-echelle';
        if (!ctx.etudiants || ctx.etudiants.length === 0) return 'aucun-eleve';
        return null;
    }

    /** Le mot d'un tableau vide : celui de la vue simple (qui dit où aller), sinon celui de la vue étendue. */
    function _motDuVide(ctx) {
        const S = MOTS.simple;
        if (ctx.videEtat === 'aucun-eleve') return ((ctx.presentation && ctx.presentation.mots) || {}).aucunEleve || window.TableauNotation.MOTS.aucunEleve;
        if (ctx.videEtat === 'introuvable') return ctx.simple ? S.introuvable : window.EnsemblesCibles.MOTIFS.INTROUVABLE;
        if (ctx.videEtat === 'aucune-cible') return ctx.simple ? S.aucuneCible : MOTS.aucuneCible;
        return ctx.simple ? S.sansEchelle : MOTS.sansEchelle;
    }

    /** Lots 3 et 4 : l'ordre de l'échelle (une fois pour la classe), le niveau « sans donnée », les réglages de la note. */
    function _completerPourLaNote(ctx, conf) {
        ctx.ordre = N().ordreDeLEchelle(ctx.echelle);
        const sansDonnee = N().codeNorme(ctx.codeSansDonnee);
        ctx.niveauSansDonnee = sansDonnee === '' ? null : (ctx.niveaux.find(n => N().codeNorme(n.code) === sansDonnee) || null);
        ctx.nomSansDonnee = N().nomSansDonnee({ niveauSansDonnee: ctx.niveauSansDonnee });
        ctx.notesFinales = conf.notesFinales === true;
        ctx.doubleSeuil = N().lireDoubleSeuil(conf);
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
        // Vue simple : « Régler » mène à l'écran Pratique de la vue simple (ses cibles) ; ni « Inscrire pour une production »,
        // ni rien qui ne vive qu'en vue étendue ; l'export des notes, comme au tableau des productions de la vue simple.
        const p = ctx.presentation;
        const reglages = (p && p.reglages) || { action: 'ouvrirReglagesPratique', param: ctx.pratiqueId, libelle: window.TableauNotation.MOTS.reglages };
        const gestesSimples = `<div class="tn-gestes"><button type="button" class="btn btn-secondaire" data-action="exporterSyntheseResultatsCSV">${esc(window.TableauNotation.MOTS.exporter)}</button></div>`;   // le mot du tableau de la vue simple, tel quel
        const gestes = !avecGestes ? '' : (ctx.simple ? gestesSimples
            : `<div class="tn-gestes"><button type="button" class="btn btn-principal" data-tc="par-production">${esc(MOTS.parProduction)}</button></div>`);
        return `<div class="tn-bandeau">
            <div class="tn-pratique">${badge}<span class="tn-pratique-nom">${esc(ctx.pratiqueNom)}</span>
                <a href="#" class="tn-reglages" data-prevent data-action="${esc(reglages.action)}" data-param="${esc(reglages.param)}">${esc(reglages.libelle || window.TableauNotation.MOTS.reglages)}</a></div>
            ${gestes}
        </div>`;
    }

    /** Vue simple : le geste qui débloque un état vide (écrire ses cibles ; coller sa liste). */
    function _gesteVideHTML(ctx) {
        if (!ctx.simple) return '';
        const g = ctx.videEtat === 'aucune-cible' ? { action: 'VueSimple.regler', param: 'cibles', libelle: MOTS.simple.aucuneCibleLien }
            : (ctx.videEtat === 'aucun-eleve' ? ((ctx.presentation.gestes || {})['aucun-eleve'] || null) : null);
        return g ? `<p class="tn-etat-geste"><button type="button" class="btn btn-principal" data-action="${esc(g.action)}"${g.param ? ` data-param="${esc(g.param)}"` : ''}>${esc(g.libelle)}</button></p>` : '';
    }

    function _echelleHTML(ctx) {
        const niveaux = ctx.niveaux.map(n => {
            const marque = String(n.code) === ctx.codeSansDonnee ? ` <span class="tc-repere-marque">(${esc(MOTS.sansDonnee)})</span>` : '';
            return `<span class="tn-niveau" style="--tn-couleur: ${esc(_couleur(n))}"><span class="tn-niveau-code">${esc(n.code)}</span> ${esc(n.nom || '')}${marque}</span>`;
        }).join('');
        return `<div class="tn-repere"><span class="tn-repere-titre">${esc(MOTS.echelleTitre(ctx.echelle && ctx.echelle.nom))}</span>${niveaux}</div>`;
    }

    /** Ordre des niveaux illisible (lot 3) : le motif, une fois, au-dessus du tableau. Rien n'est retenu. */
    function _ordreIllisibleHTML(ctx) {
        return (ctx.ordre && !ctx.ordre.ok) ? `<p class="tn-avis tc-ordre-illisible" role="status">${esc(ctx.ordre.motif)}</p>` : '';
    }

    /**
     * Le niveau retenu de chaque cible, et la note, pour un·e étudiant·e : `NoteCibles` sur le contexte déjà lu (une
     * lecture des inscriptions pour la classe). Même calcul que `calculerPerformance` de la pratique.
     */
    function eleveDuContexte(ctx, da) {
        const retenue = N().retenirParCible({ liste: ctx.inscriptions, da, ensembleId: ctx.ensemble.id, cibles: ctx.cibles,
            echelle: ctx.echelle, codeSansDonnee: ctx.codeSansDonnee });
        const note = N().calculerNote({ retenue, notesFinales: ctx.notesFinales, doubleSeuil: ctx.doubleSeuil });
        return { retenue, note, parCible: new Map(retenue.lignes.map(l => [l.cible.id, l])) };
    }

    /** La note telle que l'indice P l'arrondit (portfolio.js, `arrondirIndiceSurCent`) : la même partout. */
    function noteArrondie(note) {
        if (typeof note !== 'number' || !Number.isFinite(note)) return null;
        return (typeof window.arrondirIndiceSurCent === 'function') ? window.arrondirIndiceSurCent(note / 100) : Math.round(note);
    }

    function _enteteHTML(ctx) {
        const cols = ctx.cibles.map(c => `<th scope="col" class="tn-col-production tc-col-cible">`
            + `<span class="tn-production-titre">${esc(c.etiquette)}</span>`
            + (c.terminale ? `<span class="tn-production-date">${esc(MOTS.terminale)}</span>` : '')
            + `</th>`).join('');
        return `<thead><tr><th scope="col" class="tn-col-eleve">${esc(MOTS.eleve)}</th>${cols}<th scope="col" class="tn-col-note tc-col-note">${esc(MOTS.colNote)}</th></tr></thead>`;
    }

    /** Le libellé lu d'une case, et son infobulle (le même texte : rien ne s'y lit qui ne se voie aussi). */
    function _ditLaCase(nom, cible, ligne, ctx) {
        const annulees = ligne.annulees ? `, ${ligne.annulees} ${ligne.annulees > 1 ? 'annulées' : 'annulée'}` : '';
        const r = ligne.remarques || 0;
        const remarques = `${r} ${r > 1 ? 'remarques' : 'remarque'}`;
        const n = ligne.actives;
        const compte = !n ? MOTS.aucune : (r === n ? remarques : `${n} ${n > 1 ? 'inscriptions' : 'inscription'}${r ? ', dont ' + remarques : ''}`);
        if (!ctx.ordre.ok) return `${nom}, ${cible.etiquette} : ${MOTS.caseIllisible}, ${compte}${annulees}`;
        if (!ligne.retenu) return `${nom}, ${cible.etiquette} : ${MOTS.sansDonnee} (${ctx.nomSansDonnee}), ${compte}${annulees}`;
        const nomNiveau = ligne.niveau ? (ligne.niveau.nom || ligne.niveau.code) : ligne.retenu.niveau;
        return `${nom}, ${cible.etiquette} : niveau retenu ${nomNiveau}, ${compte}${annulees}`;
    }

    function _caseHTML(ctx, etudiant, cible, premiere, eleve) {
        const ligne = eleve.parCible.get(cible.id);
        const dit = _ditLaCase(_nomEleve(etudiant), cible, ligne, ctx);
        const attrs = `data-tc="case" data-da="${esc(etudiant.da)}" data-cible="${esc(cible.id)}" tabindex="${premiere ? '0' : '-1'}" aria-label="${esc(dit)}" title="${esc(dit)}"`;
        const compte = ligne.actives ? `<span class="tc-case-compte" aria-hidden="true">${esc(String(ligne.actives))}</span>` : '';
        if (!ctx.ordre.ok) {
            // Ordre illisible : rien n'est retenu (le motif est au-dessus du tableau) ; la case garde son compte.
            return `<td class="tn-cellule"><button type="button" class="tc-case tc-case--vide" ${attrs}><span aria-hidden="true">?</span>${compte}</button></td>`;
        }
        if (!ligne.retenu) {
            // Sans donnée : le NOM du niveau « sans donnée » de l'échelle (jamais un vide ni un zéro) ; ✎ s'il y a des remarques.
            const remarque = ligne.remarques ? `<span class="tc-case-remarque" aria-hidden="true">✎</span>` : '';
            return `<td class="tn-cellule"><button type="button" class="tc-case tc-case--vide${ligne.remarques ? ' tc-case--remarques' : ''}" ${attrs}>`
                + `${remarque}<span class="tc-case-sans-donnee" aria-hidden="true">${esc(ctx.nomSansDonnee)}</span>${compte}</button></td>`;
        }
        const style = ` style="--tn-couleur: ${esc(_couleur(ligne.niveau))}"`;
        return `<td class="tn-cellule"><button type="button" class="tc-case"${style} ${attrs}>`
            + `<span class="tc-case-point" aria-hidden="true"></span><span class="tc-case-niveau" aria-hidden="true">${esc(ligne.retenu.niveau)}</span>`
            + `${compte}</button></td>`;
    }

    /** La case de la note, au bout de la rangée (lot 4). Tout se lit sans bulle. */
    function _caseNoteHTML(ctx, etudiant, eleve) {
        const nom = _nomEleve(etudiant);
        const n = eleve.note;
        if (n.etat === N().ETATS.NOTE) {
            const valeur = (typeof window.formaterPourcentage === 'function') ? window.formaterPourcentage(noteArrondie(n.note)) : String(noteArrondie(n.note));
            const plafond = (n.plafonnement && n.plafonnement.applique) ? `<span class="tc-note-detail">${esc(MOTS.notePlafonnee)}</span>` : '';
            return `<td class="tn-cellule tn-note tc-cellule-note" aria-label="${esc(MOTS.ditNote(nom, valeur))}"><span class="tc-note-valeur">${esc(valeur)}</span>${plafond}</td>`;
        }
        if (n.etat === N().ETATS.ATTENTE) {
            const etiquettes = n.enAttente.map(c => c.etiquette);
            return `<td class="tn-cellule tn-note tc-cellule-note tc-cellule-note--attente" aria-label="${esc(MOTS.ditNoteAttente(nom, etiquettes))}">`
                + `<span class="tc-note-etat">${esc(MOTS.noteEnAttente)}</span><span class="tc-note-detail">${esc(MOTS.noteAttenteDe(etiquettes))}</span></td>`;
        }
        return `<td class="tn-cellule tn-note tc-cellule-note tc-cellule-note--attente" aria-label="${esc(MOTS.ditNoteNonCalculable(nom, n.motif || ''))}">`
            + `<span class="tc-note-etat">${esc(MOTS.noteNonCalculable)}</span>${ctx.ordre.ok ? `<span class="tc-note-detail">${esc(n.motif || '')}</span>` : ''}</td>`;
    }

    function _rangeeHTML(ctx, etudiant, i) {
        const eleve = eleveDuContexte(ctx, etudiant.da);
        const cases = ctx.cibles.map((c, j) => _caseHTML(ctx, etudiant, c, i === 0 && j === 0, eleve)).join('');
        return `<tr><th scope="row" class="tn-eleve">${esc(_nomEleve(etudiant))}</th>${cases}${_caseNoteHTML(ctx, etudiant, eleve)}</tr>`;
    }

    /**
     * Le HTML du tableau des cibles (contexte de `completerContexte`). Le titre garde la classe `tn-titre` : l'ouverture
     * de la sous-section y pose le focus.
     */
    function construireHTML(base) {
        const ctx = completerContexte(base);
        const tete = `<h3 class="tn-titre" tabindex="-1">${esc(MOTS.titre)}</h3><p class="tn-intro">${esc(MOTS.intro)}</p>`;
        if (ctx.vide) return `${tete}${_bandeauHTML(ctx, false)}<p class="tn-etat-vide">${esc(ctx.vide)}</p>${_gesteVideHTML(ctx)}`;
        const rangees = ctx.etudiants.map((e, i) => _rangeeHTML(ctx, e, i)).join('');
        const legendes = [MOTS.legende, MOTS.legendeSansDonnee(ctx.nomSansDonnee)]
            .concat(rangees.indexOf('tc-case--remarques') !== -1 ? [MOTS.legendeRemarques] : [])
            .concat([ctx.notesFinales ? MOTS.legendeNoteFinale : MOTS.legendeNote]);
        return `${tete}${_bandeauHTML(ctx, true)}${_echelleHTML(ctx)}${_ordreIllisibleHTML(ctx)}
            <div class="tn-cadre"><div class="tn-defilement"><table class="tn-tableau tc-tableau">${_enteteHTML(ctx)}<tbody>${rangees}</tbody></table></div></div>
            <div class="tn-legende">${legendes.map(l => `<span class="tn-legende-item tc-legende">${esc(l)}</span>`).join('')}<span class="tn-legende-aide">${esc(MOTS.aide)}</span></div>
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
        if (geste.dataset.tc === 'case') (_contexteCourant.presentation ? ouvrirInscriptionSimple : ouvrirInscription)(geste.dataset.da, geste.dataset.cible, geste);
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
        // Vue simple (21 nov. 2026) : `tc-overlay--simple`, des cibles tactiles de 46 px (css/tableau-cibles.css).
        overlay.className = 'modal-overlay actif tc-overlay' + (etat && etat.mode === 'simple' ? ' tc-overlay--simple' : '');
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
    function _niveauxHTML(ctx, prefixe, parProduction, sansRemarque) {
        const nom = `${prefixe}-niveau`;
        const tuile = (marqueur, nomTuile, aide, coche, classe) => `<label class="tc-niveau ${classe}"><input type="radio" name="${esc(nom)}" value="" ${marqueur}${coche ? ' checked' : ''}>`
            + `<span class="tc-niveau-texte"><span class="tc-niveau-nom">${esc(nomTuile)}</span>${aide ? `<span class="tc-niveau-marque">${esc(aide)}</span>` : ''}</span></label>`;
        // Vue simple (`sansRemarque`) : les niveaux seulement ; la remarque sans niveau vit en vue étendue.
        const rien = (parProduction ? tuile('data-rien', MOTS.rienCeJour, '', true, 'tc-niveau--rien') : '')
            + (sansRemarque ? '' : tuile('data-sans-niveau', MOTS.aucunNiveau, MOTS.remarqueSeulement, !parProduction, 'tc-niveau--rien tc-niveau--sans'));
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

    function _nomEtCode(niveau, code) {
        return niveau ? `${niveau.code} · ${niveau.nom || ''}`.trim() : String(code);
    }

    /**
     * Le niveau retenu d'une case, en clair (lot 3) : le niveau et la date où il a été inscrit ; ou « sans donnée » et le
     * nom de ce niveau ; et, si le dernier niveau inscrit est plus bas, la phrase qui le dit — lisible sans bulle.
     * @param {Object} ctx
     * @param {Object} ligne - une ligne de `NoteCibles.retenirParCible`
     */
    function retenuHTML(ctx, ligne, options) {
        const details = !!(options && options.details);
        if (!ctx.ordre || !ctx.ordre.ok) {
            return `<div class="tc-retenu tc-retenu--illisible"><p class="tc-retenu-ligne"><strong>${esc(MOTS.retenuIllisible)}</strong> ${esc(ctx.ordre ? ctx.ordre.motif : '')}</p></div>`;
        }
        if (!ligne.retenu) {
            return `<div class="tc-retenu tc-retenu--sans-donnee"><p class="tc-retenu-ligne"><strong>${esc(MOTS.retenuTitre)} :</strong> ${esc(MOTS.retenuSansDonnee(ctx.nomSansDonnee))}</p></div>`;
        }
        const nom = _nomEtCode(ligne.niveau, ligne.retenu.niveau);
        const style = ` style="--tn-couleur: ${esc(_couleur(ligne.niveau))}"`;
        const sansDonnee = ligne.sansDonneeInscrit ? `<p class="tc-retenu-ligne tc-aide">${esc(MOTS.retenuSansDonneeInscrit)}</p>` : '';
        const plusBas = ligne.dernierPlusBas
            ? `<p class="tc-retenu-ligne tc-retenu-plus-bas">${esc(MOTS.dernierPlusBas(_nomEtCode(ligne.dernierNiveau, ligne.dernier.niveau), dateLisible(ligne.dernier.date)))}</p>` : '';
        // Au profil (`details`) : son origine et sa rétroaction, celles de l'inscription retenue.
        const plus = details ? `<p class="tc-retenu-ligne">${esc(_titreProduction(ligne.retenu.productionId))}</p>`
            + (ligne.retenu.noteBreve ? `<p class="tc-retenu-ligne"><strong>${esc(MOTS.retroaction)} :</strong> ${esc(ligne.retenu.noteBreve)}</p>` : '') : '';
        return `<div class="tc-retenu"${style}><p class="tc-retenu-ligne"><strong>${esc(MOTS.retenuTitre)} :</strong> `
            + `<span class="tc-retenu-niveau">${esc(nom)}</span>, ${esc(MOTS.retenuDepuis(dateLisible(ligne.retenu.date)))}</p>${plus}${sansDonnee}${plusBas}</div>`;
    }

    function _nomDuNiveauInscrit(i, sansNiveau, niveau) {
        if (sansNiveau) return MOTS.remarque;
        return niveau ? `${i.niveau} · ${niveau.nom || ''}` : `${i.niveau} (${MOTS.niveauAbsent})`;
    }

    /** Le bas d'une inscription : annulée, sa date et sa raison ; sinon « Annuler cette inscription » (sauf en lecture seule). */
    function _finDeLEntree(i, a, lectureSeule) {
        if (a) return `<p class="tc-entree-annulation">${esc(MOTS.annulee(dateLisible(a.date), a.raison))}</p>`;
        return lectureSeule ? '' : `<button type="button" class="btn btn-neutre btn-mini tc-entree-annuler" data-tc="annuler" data-id="${esc(i.id)}">${esc(MOTS.annuler)}</button>`;
    }

    /** Une inscription de l'historique (datée, son niveau ou « Remarque », son origine, sa rétroaction, ses critères) ;
     *  annulée : barrée, avec sa date et sa raison ; sinon « Annuler cette inscription », sauf en lecture seule.
     *  `options.simple` (vue simple, 21 nov. 2026) : pas de « Sans production ». Les critères s'y lisent depuis le 22 nov.
     *  (ils se cochent aussi en vue simple). */
    function _entreeHTML(ctx, i, a, options) {
        const o = options || {};
        const sansNiveau = I().estSansNiveau(i);
        const niveau = sansNiveau ? null : _niveauDuCode(ctx, i.niveau);
        const nomNiveau = _nomDuNiveauInscrit(i, sansNiveau, niveau);
        const criteres = (i.criteres || []).length ? `<ul class="tc-entree-criteres">${i.criteres.map(_ligneCritereHistorique).join('')}</ul>` : '';
        const origine = (o.simple && !i.productionId) ? '' : `
                    <span class="tc-entree-origine">${esc(_titreProduction(i.productionId))}</span>`;
        const fin = _finDeLEntree(i, a, !!o.lectureSeule);
        const marque = (o.retenu && i.id === o.retenu) ? ` <span class="tc-entree-retenu">${esc(MOTS.marqueRetenu)}</span>` : '';
        return `<li class="tc-entree${a ? ' tc-entree--annulee' : ''}">
            <div class="tc-entree-corps">
                <div class="tc-entree-tete"><span class="tc-entree-date">${esc(dateLisible(i.date))}</span>
                    <span class="tc-entree-niveau${sansNiveau ? ' tc-entree-niveau--remarque' : ''}" style="--tn-couleur: ${esc(_couleur(niveau))}">${esc(nomNiveau)}</span>${marque}${origine}</div>
                ${i.noteBreve ? `<p class="tc-entree-note">${esc(i.noteBreve)}</p>` : ''}
                ${criteres}
            </div>${fin}</li>`;
    }

    /**
     * L'historique d'une case : chaque inscription, la plus récente d'abord, remarques et annulées comprises (barrées).
     * Celle qui porte le niveau retenu est marquée. `options.lectureSeule` (le profil) : aucun bouton d'annulation.
     */
    function historiqueHTML(ctx, da, cibleId, options) {
        const lectureSeule = !!(options && options.lectureSeule);
        const h = I().historiqueDeLaCase(ctx.inscriptions, da, ctx.ensemble.id, cibleId);
        if (h.length === 0) return `<p class="tc-aide">${esc(MOTS.historiqueVide)}</p>`;
        const retenu = (options && options.retenuId) || null;
        const entrees = h.map(({ inscription: i, annulation: a }) => _entreeHTML(ctx, i, a, { lectureSeule, retenu })).join('');
        return `<ol class="tc-historique-liste">${entrees}</ol>`;
    }

    /** Le niveau retenu en clair, puis l'historique de la case (la fenêtre d'une case). */
    function _historiqueAvecRetenuHTML(ctx, da, cibleId) {
        const ligne = eleveDuContexte(ctx, da).parCible.get(cibleId);
        return retenuHTML(ctx, ligne) + historiqueHTML(ctx, da, cibleId, { retenuId: ligne && ligne.retenu ? ligne.retenu.id : null });
    }

    /**
     * Ouvre l'inscription d'une case : la cible, ses critères, le niveau, la rétroaction, l'origine, la date ; puis
     * le niveau retenu et l'historique de la case.
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
            <section class="tc-historique"><h4 class="tc-section-titre">${esc(MOTS.historique)}</h4><div class="tc-historique-hote">${_historiqueAvecRetenuHTML(ctx, da, cibleId)}</div></section>`;
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

    /* ----- VUE SIMPLE (21 nov. 2026, « Par standards » à l'essai) : la fenêtre allégée d'une case -----
       Les critères de la cible, s'il y en a (22 nov. 2026, décision de Grégoire, 9 h 14 : elle remplace, pour les critères,
       celle du 21 nov. à 14 h 20), cochés comme en vue étendue (mêmes morceaux, mêmes mots) ; rien n'est calculé à partir
       des coches. Les niveaux en tuiles (sans « Aucun niveau »), la rétroaction facultative, la date d'aujourd'hui, aucune
       production. Puis le niveau retenu en clair et la DERNIÈRE inscription, qu'on peut annuler : le niveau retenu étant le
       meilleur, un niveau trop haut touché par erreur ne se corrige pas en en inscrivant un plus bas (sans ce geste, la vue
       simple serait une impasse). L'annulation reste, barrée, visible en vue étendue. Même écrivain, même forme (§ 0). */

    /** La dernière inscription non annulée d'une case (une remarque de la vue étendue comprise), ou null. */
    function _derniereInscription(ctx, da, cibleId) {
        const h = I().historiqueDeLaCase(ctx.inscriptions, da, ctx.ensemble.id, cibleId);
        const x = h.find(y => !y.annulation);
        return x ? x.inscription : null;
    }

    /** Le niveau retenu, puis la dernière inscription et son « Annuler », puis où lire le reste. */
    function _derniereHTML(ctx, da, cibleId) {
        const ligne = eleveDuContexte(ctx, da).parCible.get(cibleId);
        const derniere = _derniereInscription(ctx, da, cibleId);
        const entree = derniere ? `<ol class="tc-historique-liste">${_entreeHTML(ctx, derniere, null, { simple: true, retenu: ligne && ligne.retenu ? ligne.retenu.id : null })}</ol>`
            : `<p class="tc-aide">${esc(MOTS.historiqueVide)}</p>`;
        return retenuHTML(ctx, ligne) + entree + `<p class="tc-aide">${esc(MOTS.simple.toutHistorique)}</p>`;
    }

    /** Ouvre la fenêtre allégée d'une case (vue simple). */
    function ouvrirInscriptionSimple(da, cibleId, retour) {
        const ctx = completerContexte(_contexteCourant || {});
        const cible = ctx.cibles.find(c => c.id === cibleId);
        const etudiant = (ctx.etudiants || []).find(e => String(e.da) === String(da));
        if (!cible || !etudiant || ctx.vide) return null;
        const p = 'tc-vs';
        const html = `
            <button type="button" class="modal-fermer" data-tc="fermer" aria-label="${esc(MOTS.fermer)}"><img src="icons/icon-close-window.svg" alt="" class="modal-close-icon"></button>
            <h3 class="modal-titre" id="tc-fenetre-titre">${esc(MOTS.inscrireTitre)}</h3>
            <p class="tc-qui">${esc(_nomEleve(etudiant))}</p>
            <div class="tc-cible">
                <p class="tc-cible-etiquette">${esc(cible.etiquette)}</p>
                ${cible.enonce ? `<p class="tc-cible-enonce">${esc(cible.enonce)}</p>` : ''}
            </div>
            <form class="tc-formulaire" data-tc-bloc data-prefixe="${p}" novalidate>
                ${(cible.criteres || []).length ? `<section class="tc-section"><h4 class="tc-section-titre">${esc(MOTS.criteres)}</h4>${_criteresHTML(cible, p)}</section>` : ''}
                <section class="tc-section"><h4 class="tc-section-titre" id="${p}-niveau-titre">${esc(MOTS.niveau)}</h4>${_niveauxHTML(ctx, p, false, true)}</section>
                <section class="tc-section">${_retroactionHTML(p)}<p class="tc-aide">${esc(MOTS.simple.date)}</p></section>
                <p class="tc-alerte u-hide" role="alert"></p>
                <div class="modal-actions"><button type="button" class="btn btn-neutre" data-tc="fermer">${esc(MOTS.fermer)}</button>
                    <button type="button" class="btn btn-principal" data-tc="inscrire-simple">${esc(MOTS.inscrire)}</button></div>
            </form>
            <section class="tc-historique"><h4 class="tc-section-titre">${esc(MOTS.simple.derniere)}</h4><div class="tc-derniere-hote">${_derniereHTML(ctx, da, cibleId)}</div></section>`;
        return _ouvrirFenetre(html, { mode: 'simple', da: String(da), cibleId, retour, ctx });
    }

    async function _inscrireSimple(overlay) {
        const { ctx, da, cibleId } = _ouverte;
        const bloc = overlay.querySelector('[data-tc-bloc]');
        const cible = ctx.cibles.find(c => c.id === cibleId);
        const niveau = _lireNiveau(bloc, bloc.dataset.prefixe).niveau;
        if (niveau === null) { _alerte(overlay, [MOTS.simple.choisisNiveau]); return false; }
        const saisie = {
            da, ensembleId: ctx.ensemble.id, cibleId, niveau,
            echelleId: ctx.echelle ? (ctx.echelle.id || null) : null,
            date: I().dateDuJour(), productionId: null,
            noteBreve: bloc.querySelector('.tc-retroaction').value,
            criteres: I().etatDesCriteres(cible, _lireCoches(bloc))   // la forme du § 0 ; un critère sans coche : non renseigné
        };
        const motifs = I().motifsRefus(saisie, ctx.echelle);
        _alerte(overlay, motifs);
        if (motifs.length) return false;
        const r = await I().inscrire([saisie], { geste: 'Inscrire un niveau' });
        if (!r.ok) return false;
        const n = _niveauDuCode(ctx, niveau);
        const etudiant = ctx.etudiants.find(e => String(e.da) === String(da));
        _fermer();
        _rerendre({ da, cibleId });
        _annoncer(MOTS.annonceInscrit(_nomEleve(etudiant), cible.etiquette, n ? (n.nom || n.code) : niveau));
        return true;
    }

    /**
     * Vue simple, écran « Note finale » : la note de chaque étudiant·e, par le moteur des cibles (aucun calcul recopié),
     * arrondie comme l'indice P ; « En attente » et les cibles nommées ; ou le motif d'une note non calculable.
     * @returns {{etat: 'cibles', videEtat: ?string, finales: boolean, lignes: Array<{da, nom, prenom, note: ?number, detail: string}>}}
     */
    function notesDuGroupe(base) {
        const ctx = completerContexte(base);
        if (ctx.vide) return { etat: 'cibles', videEtat: ctx.videEtat, finales: ctx.notesFinales, lignes: [] };
        const E = N().ETATS;
        const lignes = ctx.etudiants.map(e => {
            const n = eleveDuContexte(ctx, e.da).note;
            const ligne = { da: e.da, nom: e.nom || '', prenom: e.prenom || '', note: null, detail: '' };
            if (n.etat === E.NOTE) Object.assign(ligne, { note: noteArrondie(n.note), detail: (n.plafonnement && n.plafonnement.applique) ? MOTS.notePlafonnee : '' });
            else if (n.etat === E.ATTENTE) ligne.detail = `${MOTS.noteEnAttente} : ${MOTS.noteAttenteDe(n.enAttente.map(c => c.etiquette))}`;
            else ligne.detail = n.motif || MOTS.noteNonCalculable;
            return ligne;
        });
        return { etat: 'cibles', videEtat: null, finales: ctx.notesFinales, lignes };
    }

    /** Après une annulation : l'historique (vue étendue) ou la dernière inscription et la phrase « rien ne s'efface » (vue simple). */
    function _redessinerApresAnnulation(overlay) {
        const ctx = completerContexte(_contexteCourant || {});
        _ouverte.ctx = ctx;
        const simple = _ouverte.mode === 'simple';
        const hote = overlay.querySelector(simple ? '.tc-derniere-hote' : '.tc-historique-hote');
        // security-ok : _historiqueAvecRetenuHTML et _derniereHTML échappent tout texte (esc)
        if (hote) hote.innerHTML = simple
            ? `<p class="tc-aide tc-annulee-simple" role="status">${esc(MOTS.simple.annulee)}</p>` + _derniereHTML(ctx, _ouverte.da, _ouverte.cibleId)
            : _historiqueAvecRetenuHTML(ctx, _ouverte.da, _ouverte.cibleId);
        const titre = overlay.querySelector('.tc-historique .tc-section-titre');
        if (titre) { titre.setAttribute('tabindex', '-1'); titre.focus(); }
    }

    async function _annulerInscription(overlay, id) {
        const raison = (window.uiDialogues && typeof window.uiDialogues.demanderSaisie === 'function')
            ? await window.uiDialogues.demanderSaisie({ titre: MOTS.annulerTitre, message: MOTS.annulerMessage, preformate: true,
                multiligne: true, texteConfirmer: MOTS.annulerConfirmer, texteAnnuler: MOTS.annulerGarder, variante: 'danger',
                classe: (_ouverte && _ouverte.mode === 'simple') ? 'ui-dialogue--tactile' : '' })
            : null;
        if (raison === null) return false;
        const r = await I().annuler(id, raison, { geste: 'Annuler une inscription' });
        if (!r.ok) {
            if (r.motif) _alerte(overlay, [r.motif]);
            return false;
        }
        // L'historique se redessine dans la fenêtre ouverte ; le tableau derrière aussi.
        if (_ouverte && _ouverte.overlay === overlay) _redessinerApresAnnulation(overlay);
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
        else if (g === 'inscrire-simple') _inscrireSimple(overlay);
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
        retenuHTML,
        eleveDuContexte,
        noteArrondie,
        ouvrirInscription,
        ouvrirInscriptionSimple,   // vue simple (21 nov. 2026)
        notesDuGroupe,             // vue simple, écran « Note finale »
        ouvrirParProduction,
        dateLisible,
        fermer: _fermer
    };
})();
