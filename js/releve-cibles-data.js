/**
 * LE RELEVÉ PAR CIBLE QUE L'ÉTUDIANT·E REÇOIT, EN « PAR STANDARDS » — lot 5, première version (21 nov. 2026)
 *
 * Conception : plans de travail/CONCEPTION-2026-11-21-releve-par-cible.md (chaque choix, sa recommandation, son origine).
 * Textes : plans de travail/TEXTES-2026-11-21-releve-par-cible.md (PROPOSÉS, aucun arrêté).
 *
 * Module PUR : il assemble, pour un·e étudiant·e, ce que la section « Cibles » du profil sait déjà (`TableauCibles`,
 * `NoteCibles`, `InscriptionsCibles`, `EnsemblesCibles`) dans un objet « relevé » que le rendu met en page. AUCUN CALCUL
 * ici : le niveau retenu et la note sont ceux de `TableauCibles.eleveDuContexte`, le même calcul que le tableau et le
 * profil. AUCUNE ÉCRITURE : ce module ne connaît ni `db.set`, ni `inscrire`, ni `annuler`.
 *
 * LES CHOIX DE DIDACTIQUE SONT DES DONNÉES (`CHOIX`), pas du code : chacun se renverse en changeant une valeur ici, sans
 * toucher au rendu ni à l'export. Deux d'entre eux (le mot, les remarques) se changent aussi dans la fenêtre d'aperçu, le
 * temps d'un relevé, sans rien enregistrer.
 *
 * API : window.ReleveCiblesData = { CHOIX, lireChoix, contexte, construire }
 */
(function () {
    'use strict';

    /**
     * Les recommandations appliquées (CONCEPTION, § 3). Chaque clé est une question posée à Grégoire.
     *   mot           'objectif' | 'cible'                 Q1  le mot que lit l'étudiant·e
     *   remarques     true | false                         Q2  les inscriptions sans niveau
     *   noteEnSession 'attente-nommee' | 'rien'            Q3  la note du cours tant qu'une cible est sans donnée
     *   historique    'tout' | 'retenu'                    Q4  toutes les inscriptions, ou le niveau retenu seul
     *   coches        'renseignees' | 'toutes' | 'aucune'  Q5  les critères cochés d'une inscription
     *   annulees      false | true                         Q6  les inscriptions annulées
     *   origine       true | false                         Q7  la production d'où vient l'inscription
     *   poids         true | false                         Q8  le poids de chaque cible
     *   calcul        true | false                         Q8  le détail du calcul, quand la note existe
     *   criteres      true | false                         Q9  les critères de chaque cible, essentiels marqués
     *   echelle       true | false                         Q10 l'échelle et le sens de chaque niveau
     *   date          true | false                         Q12 la date du relevé
     */
    const CHOIX = Object.freeze({
        mot: 'objectif',
        remarques: true,
        noteEnSession: 'attente-nommee',
        historique: 'tout',
        coches: 'renseignees',
        annulees: false,
        origine: true,
        poids: true,
        calcul: true,
        criteres: true,
        echelle: true,
        date: true
    });

    const VALEURS = Object.freeze({
        mot: ['objectif', 'cible'], noteEnSession: ['attente-nommee', 'rien'], historique: ['tout', 'retenu'],
        coches: ['renseignees', 'toutes', 'aucune']
    });

    /** Les choix d'un relevé : ceux d'office, corrigés par ce que la fenêtre d'aperçu demande. Une valeur inconnue est ignorée. */
    function lireChoix(demande) {
        const d = demande || {};
        const choix = {};
        Object.keys(CHOIX).forEach(k => {
            const v = d[k];
            if (VALEURS[k]) choix[k] = VALEURS[k].indexOf(v) >= 0 ? v : CHOIX[k];
            else choix[k] = (v === true || v === false) ? v : CHOIX[k];
        });
        return choix;
    }

    const IC = () => window.InscriptionsCibles;
    const NC = () => window.NoteCibles;

    /** La pratique du groupe-cours actif, si elle est « Par standards » ; sinon null. Même porte que `ProfilCibles`. */
    function _designation() {
        const d = (typeof window.designerPratiqueActive === 'function') ? window.designerPratiqueActive() : null;
        const conf = d && d.etat === 'ok' && d.donnees ? (d.donnees.configuration || {}) : null;
        return (conf && conf.type === 'cibles') ? d : null;
    }

    /**
     * Le contexte de lecture pour un groupe : une seule lecture des inscriptions pour toute la classe.
     * @param {Array} etudiants - les fiches lues par l'appelant (anonymisées ou non : il ne les relit pas)
     * @returns {Object|null} null hors « Par standards »
     */
    function contexte(etudiants) {
        const designation = _designation();
        if (!designation || !window.TableauCibles || !window.NoteCibles || !window.InscriptionsCibles) return null;
        return window.TableauCibles.completerContexte({ etat: 'cibles', donnees: designation.donnees, pratiqueId: designation.id,
            pratiqueNom: designation.donnees.nom || '', etudiants: Array.isArray(etudiants) ? etudiants : [] });
    }

    /** Une couleur pour le papier : un hexadécimal, ou rien (le rendu prend son gris). Le niveau se lit par son nom, jamais par sa couleur. */
    function _couleurPapier(niveau) {
        const c = String((niveau && niveau.couleur) || '').trim();
        return /^#[0-9a-f]{3,8}$/i.test(c) ? c : null;
    }

    function _niveauLu(niveau) {
        if (!niveau) return null;
        return { code: String(niveau.code), nom: String(niveau.nom || ''), couleur: _couleurPapier(niveau) };
    }

    function _titreProduction(id) {
        if (!id) return null;
        const toutes = (typeof obtenirDonneesSelonMode === 'function') ? (obtenirDonneesSelonMode('productions') || []) : [];
        const p = toutes.find(x => x && x.id === id);
        return p ? String(p.titre || p.nom || '') || null : null;
    }

    function _coches(inscription, choix) {
        if (choix.coches === 'aucune') return [];
        return (Array.isArray(inscription.criteres) ? inscription.criteres : [])
            .map(k => ({ texte: String((k && k.texte) || ''), essentiel: !!(k && k.essentiel), respecte: IC().lireRespecte(k && k.respecte) }))
            .filter(k => k.texte && (choix.coches === 'toutes' || k.respecte !== null));
    }

    /** Une inscription telle que l'étudiant·e la lit. */
    function _entree(ctx, x, retenuId, choix) {
        const i = x.inscription;
        const sansNiveau = IC().estSansNiveau(i);
        const niveau = sansNiveau ? null : (ctx.niveaux.find(n => String(n.code) === String(i.niveau)) || null);
        return {
            date: i.date || '',
            type: sansNiveau ? 'remarque' : 'niveau',
            niveau: sansNiveau ? null : (_niveauLu(niveau) || { code: String(i.niveau), nom: '', couleur: null }),
            retenu: !!retenuId && i.id === retenuId,
            annulee: x.annulation ? { date: x.annulation.date || '', raison: String(x.annulation.raison || '') } : null,
            origine: choix.origine ? _titreProduction(i.productionId) : null,
            texte: String(i.noteBreve || ''),
            criteres: _coches(i, choix)
        };
    }

    /** Les inscriptions d'une cible que le relevé montre, la plus récente d'abord (l'ordre de `historiqueDeLaCase`). */
    function _entrees(ctx, ligne, choix) {
        const retenuId = ligne.retenu ? ligne.retenu.id : null;
        return (ligne.historique || [])
            .filter(x => x && x.inscription)
            .filter(x => choix.annulees || !x.annulation)
            .filter(x => choix.remarques || !IC().estSansNiveau(x.inscription))
            .filter(x => choix.historique === 'tout' || x.inscription.id === retenuId || IC().estSansNiveau(x.inscription))
            .map(x => _entree(ctx, x, retenuId, choix));
    }

    function _cible(ctx, ligne, part, choix) {
        const c = ligne.cible;
        const illisible = !ctx.ordre || !ctx.ordre.ok;
        return {
            etiquette: c.etiquette,
            enonce: c.enonce || '',
            terminale: c.terminale === true,
            poids: choix.poids ? c.poids : null,
            part: choix.poids ? part : null,
            criteres: choix.criteres ? (c.criteres || []).map(k => ({ texte: k.texte, essentiel: k.essentiel === true })) : [],
            etat: illisible ? 'illisible' : (ligne.sansDonnee ? 'sans-donnee' : 'niveau'),
            niveau: (!illisible && !ligne.sansDonnee) ? _niveauLu(ligne.niveau) : null,
            date: (!illisible && ligne.retenu && !ligne.sansDonnee) ? (ligne.retenu.date || '') : '',
            entrees: _entrees(ctx, ligne, choix)
        };
    }

    /**
     * La note du cours telle que le relevé la dit. `etat` :
     *   'note'            une note chiffrée (pendant la session ou finale) ;
     *   'attente'         aucune note chiffrée : des cibles sont sans donnée (elles sont nommées, ou tues selon `noteEnSession`) ;
     *   'differee'        la préférence « note différée » de l'enseignant·e est allumée : la note n'est pas remise ;
     *   'non-calculable'  l'échelle ou un poids empêche le calcul : le motif reste chez l'enseignant·e, le relevé dit seulement
     *                     qu'il n'y a pas de note.
     */
    function _note(eleve, choix) {
        const n = eleve.note;
        const E = NC().ETATS;
        const lignes = (n.lignes || []).map(l => ({ etiquette: l.cible.etiquette, terminale: l.cible.terminale === true,
            niveau: _niveauLu(l.niveau), valeur: l.valeur, poids: l.poids, part: l.part, compte: l.compte }));
        const base = { etat: 'non-calculable', finale: n.notesFinales === true, valeur: null, moyenne: null, enAttente: [], lignes: [], seuil: null };
        if (typeof window.noteDiffereeActive === 'function' && window.noteDiffereeActive()) return Object.assign(base, { etat: 'differee' });
        if (n.etat === E.ATTENTE) {
            return Object.assign(base, { etat: 'attente', enAttente: choix.noteEnSession === 'attente-nommee' ? n.enAttente.map(c => c.etiquette) : [] });
        }
        if (n.etat !== E.NOTE) return base;
        const p = n.plafonnement;
        const seuil = (n.doubleSeuil && n.doubleSeuil.actif && p)
            ? { seuil: p.seuil, plafond: p.plafond, moyenneTerminales: p.moyenneTerminales, sousLeSeuil: !!p.sousLeSeuil, applique: !!p.applique } : null;
        return Object.assign(base, { etat: 'note', valeur: n.note, moyenne: n.moyenne, lignes: choix.calcul ? lignes : [], seuil });
    }

    function _echelle(ctx) {
        const sansDonnee = NC().codeNorme(ctx.codeSansDonnee);
        // Du plus haut au plus bas, par le rang de `NoteCibles.ordreDeLEchelle` (seule source d'ordre) ; ordre illisible : tel qu'écrit.
        const rang = (n) => { const o = ctx.ordre && ctx.ordre.ok ? ctx.ordre.parCode.get(NC().codeNorme(n.code)) : null; return o ? o.rang : 0; };
        const ordonnes = (ctx.ordre && ctx.ordre.ok) ? ctx.niveaux.slice().sort((a, b) => rang(b) - rang(a)) : ctx.niveaux;
        return {
            nom: String((ctx.echelle && ctx.echelle.nom) || ''),
            niveaux: ordonnes.map(n => Object.assign(_niveauLu(n), {
                description: String(n.description || ''),
                sansDonnee: sansDonnee !== '' && NC().codeNorme(n.code) === sansDonnee
            }))
        };
    }

    /**
     * Le relevé d'un·e étudiant·e.
     * @param {Object} ctx - `contexte(etudiants)`
     * @param {Object} etudiant - sa fiche ({ da, prenom, nom, groupe })
     * @param {Object} [demande] - les choix de la fenêtre d'aperçu
     * @param {Object} [entete] - { cours, enseignant, date } : ce que l'appelant sait de l'en-tête ; `date` en 'AAAA-MM-JJ'
     * @returns {{ok:boolean, motif:string|null, choix:Object, ...}}
     */
    function construire(ctx, etudiant, demande, entete) {
        const choix = lireChoix(demande);
        const e = etudiant || {};
        const base = _identite(ctx, e, entete || {}, choix);
        if (!ctx || !ctx.ensemble) return Object.assign(base, { motif: 'introuvable' });
        if (!ctx.cibles.length) return Object.assign(base, { motif: 'aucune-cible' });
        const eleve = window.TableauCibles.eleveDuContexte(ctx, e.da);
        const part = _partParCible(ctx.cibles);
        return Object.assign(base, {
            ok: true,
            nomSansDonnee: ctx.nomSansDonnee,
            note: _note(eleve, choix),
            cibles: eleve.retenue.lignes.map(l => _cible(ctx, l, part(l.cible), choix)),
            echelle: choix.echelle ? _echelle(ctx) : null
        });
    }

    /** L'en-tête du relevé : qui, quel cours, quelle date. */
    function _identite(ctx, e, t, choix) {
        const texte = (v) => String(v || '');
        return { ok: false, motif: null, choix, mot: choix.mot,
            etudiant: { nom: `${texte(e.prenom)} ${texte(e.nom)}`.trim(), da: texte(e.da), groupe: texte(e.groupe) },
            cours: texte(t.cours), enseignant: texte(t.enseignant), pratique: texte(ctx && ctx.pratiqueNom),
            date: choix.date ? texte(t.date) : '' };
    }

    /** La part de chaque cible dans la note, en pourcentage du total des poids (affichage : la note, elle, vient de `NoteCibles`). */
    function _partParCible(cibles) {
        const pese = (c) => (typeof c.poids === 'number' && c.poids > 0 ? c.poids : 0);
        const total = cibles.reduce((s, c) => s + pese(c), 0);
        return (c) => ((total > 0 && pese(c) > 0) ? pese(c) / total * 100 : null);
    }

    window.ReleveCiblesData = { CHOIX, lireChoix, contexte, construire };
})();
