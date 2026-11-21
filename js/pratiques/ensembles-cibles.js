/**
 * LES CIBLES DU COURS — la pratique « Par standards », lot 1 (21 nov. 2026)
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (section du 20 nov., 21 h 25, et lot 1).
 * Fiche des règles : plans de travail/CONCEPTION-2026-11-20-pratique-par-standards.md (C1 à C8, E1 à E6).
 *
 * PROPRIÉTAIRE de la clé `ensemblesCibles` (par trimestre : `cle('ensemblesCibles')`). Seul écrivain : `enregistrer`,
 * appelé par l'assistant de pratique (wizard-pratique-v2.js) à la création ou à la modification d'une pratique
 * par standards. La fiche de la pratique (pratiques-gestion.js) la LIT seulement.
 *
 * FORME (rangée par trimestre, rattachée au cours — C7, C8) :
 *   { id, coursId, cibles: [ { id, etiquette, enonce, criteres: [ { id, texte, essentiel } ], poids, terminale } ],
 *     dateCreation, dateModification }
 * Chaque cible et chaque critère ont une identité PERMANENTE, donnée à leur création par l'éditeur
 * (`EditeurCibles`) : renommer, déplacer ou réécrire ne la change pas (même règle que #717 pour la dénotation).
 *
 * LA PRATIQUE désigne son ensemble, son échelle et le niveau « sans donnée » :
 *   configuration: { type: 'cibles', ensembleCiblesId, echelleId, niveauSansDonnee }   // niveauSansDonnee : un CODE
 *
 * CE QUE CE MODULE NE FAIT PAS : il ne calcule aucune note (lot 4) et ne lit aucune inscription (lot 2).
 * Il ne lit ni n'écrit `evaluationsSauvegardees`.
 */
(function () {
    'use strict';

    const CLE = 'ensemblesCibles';

    /* ------------------------------------------------------------------ Les refus, en mots (propositions) */
    // Mots PROPOSÉS (plans de travail/TEXTES-2026-11-20-par-standards-lot-1.md) : Grégoire les relit sur l'aperçu.
    const MOTIF_AUCUNE_CIBLE = 'Ajoute au moins une cible : une pratique par standards note des cibles d\'apprentissage.';
    const MOTIF_AUCUNE_ECHELLE = 'Choisis l\'échelle des niveaux : sans elle, aucun niveau ne pourra être inscrit.';
    const MOTIF_ECHELLE_SANS_ZERO = 'Cette échelle n\'a aucun niveau qui vaut 0\u00a0% : le niveau « sans donnée » vaut 0\u00a0%. Choisis une autre échelle, ou ajoute-lui ce niveau dans Conception → Échelles de performance.';
    const MOTIF_SANS_DONNEE = 'Désigne le niveau qui veut dire « sans donnée » : une cible le porte tant qu\'aucun niveau n\'y est inscrit.';
    const MOTIF_SANS_ETIQUETTE = 'Une cible n\'a pas d\'étiquette : donne-lui une étiquette courte, ou retire-la.';
    function motifPoids(cible) {
        const nom = cible.etiquette || 'sans étiquette';
        if (!Number.isFinite(cible.poids)) return `Donne un poids à la cible « ${nom} » : chaque cible a besoin d'un poids plus grand que zéro.`;
        return `Le poids de la cible « ${nom} » doit être plus grand que zéro (il vaut ${window.formaterNombre(cible.poids)}).`;
    }

    /* ------------------------------------------------------------------ Normaliser (fonctions pures) */

    /** Un poids saisi : un nombre, ou NaN quand le champ est vide ou illisible (jamais un 1 inventé). */
    function lirePoids(valeur) {
        if (valeur === null || valeur === undefined) return NaN;
        const texte = String(valeur).trim().replace(',', '.');
        if (texte === '') return NaN;
        const n = Number(texte);
        return Number.isFinite(n) ? n : NaN;
    }

    /**
     * Une cible dans sa forme rangée. Une ligne de critère vide n'est pas un critère ; l'identité reçue est gardée
     * telle quelle.
     */
    function normaliserCible(c) {
        const cible = c || {};
        return {
            id: String(cible.id || ''),
            etiquette: String(cible.etiquette == null ? '' : cible.etiquette).trim(),
            enonce: String(cible.enonce == null ? '' : cible.enonce).trim(),
            criteres: (Array.isArray(cible.criteres) ? cible.criteres : [])
                .filter(k => k && k.id && String(k.texte == null ? '' : k.texte).trim())
                .map(k => ({ id: String(k.id), texte: String(k.texte).trim(), essentiel: k.essentiel === true })),
            poids: typeof cible.poids === 'number' ? cible.poids : lirePoids(cible.poids),
            terminale: cible.terminale === true
        };
    }

    /** Les cibles qui comptent : une ligne sans identité ni étiquette n'est pas une cible. */
    function normaliserCibles(cibles) {
        return (Array.isArray(cibles) ? cibles : []).map(normaliserCible).filter(c => c.id && c.etiquette);
    }

    /**
     * La valeur ponctuelle d'un niveau, sans repli sur la plage (#527) : `valeurCalcul` seule. `null` si absente.
     * Le zéro est une valeur (#525).
     */
    function valeurDuNiveau(niveau) {
        if (!niveau || niveau.valeurCalcul === null || niveau.valeurCalcul === undefined || niveau.valeurCalcul === '') return null;
        const n = Number(niveau.valeurCalcul);
        return Number.isFinite(n) ? n : null;
    }

    /**
     * Les niveaux d'une échelle qui peuvent dire « sans donnée » : ceux qui valent 0 % (décision de Grégoire,
     * 20 nov. 2026 : ce niveau vaut 0 % ; E2, F3 de la fiche). Lecture seule.
     */
    function niveauxSansDonneePossibles(echelle) {
        const niveaux = (echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : [];
        return niveaux.filter(n => n && n.code !== undefined && n.code !== null && String(n.code) !== '' && valeurDuNiveau(n) === 0);
    }

    /* ------------------------------------------------------------------ Refuser (fonctions pures) */

    /**
     * Les refus de l'étape des cibles : aucune cible ; une cible commencée sans étiquette (son énoncé ou ses critères
     * se perdraient sans un mot) ; un poids nul, négatif ou absent.
     */
    function motifsRefusCibles(cibles) {
        const brutes = (Array.isArray(cibles) ? cibles : []).map(normaliserCible).filter(c => c.id);
        const sansEtiquette = brutes.filter(c => !c.etiquette && (c.enonce || c.criteres.length > 0));
        const liste = brutes.filter(c => c.etiquette);
        if (liste.length === 0 && sansEtiquette.length === 0) return [MOTIF_AUCUNE_CIBLE];
        return sansEtiquette.map(() => MOTIF_SANS_ETIQUETTE).slice(0, 1)
            .concat(liste.filter(c => !(c.poids > 0)).map(motifPoids));
    }

    /** Les refus de l'étape de l'échelle : aucune échelle ; aucun niveau à 0 % ; aucun niveau « sans donnée » désigné. */
    function motifsRefusEchelle(echelle, codeSansDonnee) {
        if (!echelle || !Array.isArray(echelle.niveaux)) return [MOTIF_AUCUNE_ECHELLE];
        const possibles = niveauxSansDonneePossibles(echelle);
        if (possibles.length === 0) return [MOTIF_ECHELLE_SANS_ZERO];
        if (!possibles.some(n => String(n.code) === String(codeSansDonnee == null ? '' : codeSansDonnee))) return [MOTIF_SANS_DONNEE];
        return [];
    }

    /**
     * Tous les refus d'une pratique par standards, dans l'ordre de l'assistant. Vide : elle peut s'enregistrer.
     * @param {{cibles:Array, echelle:Object|null, niveauSansDonnee:string|null}} p
     * @returns {string[]}
     */
    function motifsRefus(p) {
        const q = p || {};
        return motifsRefusCibles(q.cibles).concat(motifsRefusEchelle(q.echelle, q.niveauSansDonnee));
    }

    /* ------------------------------------------------------------------ Les poids : leur total, la part de chacun */

    /** Le total des poids, ou `null` si un poids manque ou n'est pas plus grand que zéro. */
    function totalDesPoids(cibles) {
        const liste = (Array.isArray(cibles) ? cibles : []).map(c => lirePoids(c && c.poids));
        if (liste.length === 0 || liste.some(p => !(p > 0))) return null;
        return liste.reduce((s, p) => s + p, 0);
    }

    /** La part d'un poids dans le total, en pour cent (une décimale), ou `null`. */
    function partDuTotal(poids, total) {
        const p = lirePoids(poids);
        if (!(p > 0) || !(total > 0)) return null;
        return Math.round((p / total) * 1000) / 10;
    }

    // Les nombres à la française : le module unique (js/note-pourcentage.js, #1137), jamais une virgule posée ici.
    function formaterNombre(n) {
        return window.formaterNombre(n);
    }
    function formaterPart(part) {
        return part === null ? '—' : window.formaterPourcentage(part);
    }

    /* ------------------------------------------------------------------ L'échelle de départ (E1, E2, E4) */

    /**
     * Une échelle de départ à cinq niveaux, aux valeurs du rapport (0, 25, 50, 75, 100 % : R, p. 103 ; PROJET).
     * Les NOMS sont ceux du système de chimie décrit par les sources (R, tableau 5.6, p. 102 ; CJN), PROPOSÉS à
     * Grégoire. Les PLAGES (note chiffrée → code, obligatoires depuis #526) ne servent pas à cette pratique, qui
     * inscrit un niveau sans passer par une note : bornes à mi-chemin entre deux valeurs (supposition nommée au
     * rapport du lot). Rien n'est écrit ici : l'assistant la range avec la pratique, et seulement si elle la retient.
     * @param {string} id
     * @returns {Object}
     */
    function echelleDeDepart(id) {
        return {
            id: id,
            nom: 'Échelle de départ – Par standards',
            description: 'Cinq niveaux, de 0 à 4, qui valent 0, 25, 50, 75 et 100\u00a0%. Le niveau 0 dit « sans donnée ». '
                + 'Les noms et les valeurs sont un point de départ : modifie-les dans Conception → Échelles de performance.',
            niveaux: [
                { code: '0', nom: 'Données insuffisantes', description: 'Pas encore de trace valable : cible pas encore évaluée, ou travail très incomplet.',
                    min: 0, max: 12.49, valeurCalcul: 0, couleur: 'var(--gris-moyen)' },
                { code: '1', nom: 'En apprentissage', description: 'Aucun critère n\'est encore respecté.',
                    min: 12.5, max: 37.49, valeurCalcul: 25, couleur: 'var(--niveau-attention-critique)' },
                { code: '2', nom: 'Ça y est presque', description: 'Au moins un critère est respecté, mais pas tous les critères essentiels.',
                    min: 37.5, max: 62.49, valeurCalcul: 50, couleur: 'var(--niveau-attention-modere)' },
                { code: '3', nom: 'Acquis', description: 'Tous les critères essentiels sont respectés.',
                    min: 62.5, max: 87.49, valeurCalcul: 75, couleur: 'var(--niveau-attention-minimal)' },
                { code: '4', nom: 'Avancé', description: 'Tous les critères sont respectés.',
                    min: 87.5, max: 100, valeurCalcul: 100, couleur: 'var(--niveau-attention-nul)' }
            ],
            verrouille: false,
            dansBibliotheque: true,
            dateCreation: new Date().toISOString()
        };
    }
    /** Le code du niveau « sans donnée » de l'échelle de départ. */
    const CODE_SANS_DONNEE_DEPART = '0';

    /* ------------------------------------------------------------------ Lire, écrire */

    function lireTous() {
        const liste = (typeof db !== 'undefined' && typeof cle === 'function') ? db.getSync(cle(CLE), []) : [];
        return Array.isArray(liste) ? liste : [];
    }

    function lireParId(id) {
        if (!id) return null;
        return lireTous().find(e => e && e.id === id) || null;
    }

    /**
     * Range un ensemble (ajout, ou remplacement de celui qui a le même id). La date de création d'un ensemble déjà
     * rangé est gardée. Aucun autre ensemble n'est touché.
     * @param {{id:string, coursId:(string|null), cibles:Array}} ensemble
     * @param {{geste?:string}} [options]
     * @returns {Promise<boolean>} vrai si l'écriture a eu lieu
     */
    async function enregistrer(ensemble, options) {
        if (!ensemble || !ensemble.id) return false;
        const maintenant = new Date().toISOString();
        const propre = {
            id: String(ensemble.id),
            coursId: ensemble.coursId ? String(ensemble.coursId) : null,
            cibles: normaliserCibles(ensemble.cibles)
        };
        const geste = (options && options.geste) || 'Enregistrer les cibles';
        const mutateur = (lues) => {
            const liste = Array.isArray(lues) ? lues.slice() : [];
            const i = liste.findIndex(e => e && e.id === propre.id);
            const avant = i >= 0 ? liste[i] : null;
            const ecrit = Object.assign({}, propre, {
                dateCreation: (avant && avant.dateCreation) || maintenant,
                dateModification: maintenant
            });
            if (i >= 0) liste[i] = ecrit; else liste.push(ecrit);
            return liste;
        };
        // `modifierEtAnnoncer` (modes.js) : l'écriture dans la file par clé, et le témoin qui parle en cas d'échec.
        const ecrite = await modifierEtAnnoncer(cle(CLE), mutateur, [], { geste: geste, discret: true })
            .catch(() => undefined);
        return ecrite !== undefined;
    }

    /* ------------------------------------------------------------------ La fiche (lecture seule) */

    function esc(texte) {
        return (typeof window.echapperHtml === 'function') ? window.echapperHtml(texte) : String(texte == null ? '' : texte)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /** Le libellé d'un cours de la bibliothèque (`cours`, clé globale), ou '' s'il est introuvable. */
    function libelleDuCours(coursId) {
        if (!coursId || typeof db === 'undefined') return '';
        const c = (db.getSync('cours', []) || []).find(x => x && x.id === coursId);
        if (!c) return '';
        const code = c.codeCours || c.sigle || c.code || '';
        const nom = c.nomCours || c.nom || c.titre || '';
        return code ? `${code}${nom ? ' - ' + nom : ''}` : nom;
    }

    /** Une cible dans la fiche : son étiquette, son poids et sa part, « terminale », son énoncé, ses critères. */
    function ligneFicheHtml(c, total) {
        const criteres = (c.criteres || []).map(k => `<li>${esc(k.texte)}${k.essentiel ? ' <span class="cibles-fiche-essentiel">critère essentiel</span>' : ''}</li>`).join('');
        const part = formaterPart(partDuTotal(c.poids, total));
        return `
                <li class="cibles-fiche-cible">
                    <div class="cibles-fiche-entete">
                        <span class="cibles-fiche-etiquette">${esc(c.etiquette)}</span>
                        <span class="cibles-fiche-poids">Poids ${esc(formaterNombre(lirePoids(c.poids) || 0))} · ${part}</span>
                        ${c.terminale ? '<span class="cibles-fiche-terminale">Cible terminale</span>' : ''}
                    </div>
                    ${c.enonce ? `<p class="cibles-fiche-enonce">${esc(c.enonce)}</p>` : ''}
                    ${criteres ? `<ul class="cibles-fiche-criteres">${criteres}</ul>` : '<p class="cibles-fiche-sans-critere">Aucun critère.</p>'}
                </li>`;
    }

    /** L'échelle que la pratique désigne, et son niveau « sans donnée », lus dans le trimestre (ou null). */
    function echelleEtNiveauDe(conf) {
        const echelles = (typeof db !== 'undefined' && typeof cle === 'function') ? (db.getSync(cle('echellesTemplates'), []) || []) : [];
        const echelle = echelles.find(e => e && e.id === conf.echelleId) || null;
        const niveaux = (echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : [];
        return { echelle: echelle, niveau: niveaux.find(n => n && String(n.code) === String(conf.niveauSansDonnee)) || null };
    }

    /** La ligne du haut de la fiche : le cours, l'échelle, le niveau « sans donnée ». */
    function metaFicheHtml(ensemble, conf) {
        const lus = echelleEtNiveauDe(conf);
        const cours = libelleDuCours(ensemble.coursId) || 'aucun';
        const echelle = lus.echelle ? (lus.echelle.nom || 'Sans nom') : 'introuvable';
        const niveau = lus.niveau ? (lus.niveau.nom || lus.niveau.code) : 'non désigné';
        return `<span><strong>Cours :</strong> ${esc(cours)}</span>`
            + `<span><strong>Échelle :</strong> ${esc(echelle)}</span>`
            + `<span><strong>Niveau « sans donnée » :</strong> ${esc(niveau)}</span>`;
    }

    /**
     * Le HTML de la fiche d'une pratique par standards : le cours, l'échelle, le niveau « sans donnée », puis les
     * cibles avec leur énoncé, leurs critères, leur poids et leur part du total. Tout texte de l'enseignant·e est
     * échappé.
     * @param {Object} configuration - `pratique.configuration`
     * @returns {string}
     */
    function rendreFiche(configuration) {
        const conf = configuration || {};
        const ensemble = lireParId(conf.ensembleCiblesId);
        if (!ensemble) {
            return '<p class="cibles-fiche-absent">Les cibles de cette pratique sont introuvables dans ce trimestre. '
                + 'Rouvre la pratique dans l\'assistant pour les dire.</p>';
        }
        const cibles = Array.isArray(ensemble.cibles) ? ensemble.cibles : [];
        const total = totalDesPoids(cibles);
        const lignes = cibles.map(c => ligneFicheHtml(c, total)).join('');
        const totalTexte = total === null ? '—' : formaterNombre(total);
        return `
            <div class="cibles-fiche">
                <p class="cibles-fiche-meta">${metaFicheHtml(ensemble, conf)}</p>
                <ol class="cibles-fiche-liste">${lignes}</ol>
                <p class="cibles-fiche-total">Total des poids : ${esc(totalTexte)}. Chaque cible compte pour sa part du total.</p>
            </div>`;
    }

    window.EnsemblesCibles = {
        CLE: CLE,
        CODE_SANS_DONNEE_DEPART: CODE_SANS_DONNEE_DEPART,
        MOTIFS: { AUCUNE_CIBLE: MOTIF_AUCUNE_CIBLE, SANS_ETIQUETTE: MOTIF_SANS_ETIQUETTE, AUCUNE_ECHELLE: MOTIF_AUCUNE_ECHELLE,
            ECHELLE_SANS_ZERO: MOTIF_ECHELLE_SANS_ZERO, SANS_DONNEE: MOTIF_SANS_DONNEE },
        lirePoids: lirePoids,
        normaliserCible: normaliserCible,
        normaliserCibles: normaliserCibles,
        niveauxSansDonneePossibles: niveauxSansDonneePossibles,
        motifsRefusCibles: motifsRefusCibles,
        motifsRefusEchelle: motifsRefusEchelle,
        motifsRefus: motifsRefus,
        totalDesPoids: totalDesPoids,
        partDuTotal: partDuTotal,
        formaterPart: formaterPart,
        formaterNombre: formaterNombre,
        echelleDeDepart: echelleDeDepart,
        lireTous: lireTous,
        lireParId: lireParId,
        enregistrer: enregistrer,
        libelleDuCours: libelleDuCours,
        rendreFiche: rendreFiche
    };
})();
