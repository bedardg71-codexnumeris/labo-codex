/**
 * LES CIBLES DU COURS — la pratique « Par standards », lot 1 (21 nov. 2026)
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (section du 20 nov., 21 h 25, et lot 1).
 * Fiche des règles : plans de travail/CONCEPTION-2026-11-20-pratique-par-standards.md (C1 à C8, E1 à E6).
 *
 * PROPRIÉTAIRE de la clé `ensemblesCibles` (par trimestre : `cle('ensemblesCibles')`). Seul écrivain : `enregistrer`,
 * appelé par l'assistant de pratique (wizard-pratique-v2.js) à la création ou à la modification d'une pratique
 * par standards, par la vue simple, et par `deposer` (plus bas) quand une pratique arrive dans un trimestre avec ses
 * cibles (lot pratique-std-voyage). La fiche de la pratique (pratiques-gestion.js) la LIT seulement.
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
    // Texte F10 du lot 1 (accepté) : la fiche le dit, et le tableau des cibles (lot 2) le reprend tel quel.
    const MOTIF_INTROUVABLE = 'Les cibles de cette pratique sont introuvables dans ce trimestre. Rouvre la pratique dans l\'assistant pour les dire.';
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

    /**
     * Les cibles de la pratique du groupe-cours actif, si elle est « Par standards » ; sinon null. Lecture seule. Lu par le
     * formulaire des productions (lot 2 : les cibles qu'une production renseigne).
     * @returns {Array|null}
     */
    function ciblesDeLaPratiqueActive() {
        const d = (typeof window.designerPratiqueActive === 'function') ? window.designerPratiqueActive() : null;
        const conf = d && d.etat === 'ok' && d.donnees ? (d.donnees.configuration || {}) : null;
        if (!conf || conf.type !== 'cibles') return null;
        const ensemble = lireParId(conf.ensembleCiblesId);
        return ensemble ? normaliserCibles(ensemble.cibles) : null;
    }

    /* ------------------------------------------------------------------ Le voyage (lot pratique-std-voyage, 21 nov. 2026) */
    /*
     * Une pratique « Par standards » NOMME son ensemble de cibles, qui vit à part, par trimestre : sortie de son trimestre
     * sans lui, elle arrive en disant « cibles introuvables » (mesuré le 21 nov. 2026 sur un banc : import d'un trimestre
     * à l'autre). Pour voyager (bibliothèque, autre trimestre, fichier), elle EMPORTE une copie de ses définitions dans
     * `configuration.ciblesEmportees = { cibles, coursId, echelle }`, et les DÉPOSE à l'arrivée dans un trimestre :
     *   - l'ensemble est recréé sous une identité NEUVE (deux pratiques ne partagent jamais un ensemble ; aucun ensemble
     *     déjà présent n'est réécrit) ; les cibles et les critères gardent leur identité permanente ;
     *   - l'échelle est recréée sous son identité si le trimestre ne l'a pas ; s'il l'a, elle sert telle quelle ;
     *   - le cours reste nommé s'il existe encore dans la bibliothèque des cours, sinon aucun ;
     *   - le bagage est retiré : dans un trimestre, la seule source des cibles est `ensemblesCibles`.
     * CE QUI NE VOYAGE JAMAIS : les inscriptions, les annulations, rien qui touche un·e étudiant·e. Ce bloc ne lit ni
     * n'écrit la clé des niveaux inscrits (sentinelle-pratique-std-voyage ; ce fichier ne la nomme pas : lot 1). Les autres familles de pratiques passent inchangées :
     * `emporter` rend l'objet reçu, `deposer` ne fait rien.
     */
    const CHAMP_EMPORTE = 'ciblesEmportees';

    function estParCibles(pratique) {
        return !!(pratique && pratique.configuration && pratique.configuration.type === 'cibles');
    }

    /** Une échelle telle qu'elle voyage : ses niveaux et ses mots, sans ses états locaux (verrou, dates, provenance). */
    function echelleQuiVoyage(echelle) {
        if (!echelle || !echelle.id || !Array.isArray(echelle.niveaux)) return null;
        const copie = JSON.parse(JSON.stringify(echelle));
        ['verrouille', 'dansBibliotheque', 'idOriginal', 'dateImport', 'dateAjoutBiblio', 'dateAjout', 'estDemo', 'isDemo',
            'inspireDeTrimestre', 'auteurOriginal'].forEach(k => { delete copie[k]; });
        return copie;
    }

    /**
     * La pratique avec ses définitions : une COPIE profonde qui porte `configuration.ciblesEmportees`. Lecture seule : ni
     * la pratique reçue ni son trimestre ne sont touchés. Une pratique d'une autre famille, ou dont l'ensemble est
     * introuvable, est rendue telle quelle (le même objet).
     * @param {Object} pratique
     * @param {string} [trimestreSourceId] - le trimestre où lire l'ensemble et l'échelle ; absent : le trimestre actif
     * @returns {Object}
     */
    function emporter(pratique, trimestreSourceId) {
        if (!estParCibles(pratique) || typeof db === 'undefined') return pratique;
        const cleDe = (nom) => (trimestreSourceId && typeof cleSource === 'function') ? cleSource(nom, trimestreSourceId) : cle(nom);
        const conf = pratique.configuration;
        const ensembles = db.getSync(cleDe(CLE), []);
        const ensemble = (Array.isArray(ensembles) ? ensembles : []).find(e => e && e.id === conf.ensembleCiblesId) || null;
        // Déjà en voyage (un exemplaire de la bibliothèque, un fichier reçu) : son bagage est le bon.
        if (!ensemble) return pratique;
        const echelles = db.getSync(cleDe('echellesTemplates'), []);
        const echelle = (Array.isArray(echelles) ? echelles : []).find(e => e && e.id === conf.echelleId) || null;
        const copie = JSON.parse(JSON.stringify(pratique));
        copie.configuration[CHAMP_EMPORTE] = {
            cibles: normaliserCibles(ensemble.cibles),
            coursId: ensemble.coursId ? String(ensemble.coursId) : null,
            echelle: echelleQuiVoyage(echelle)
        };
        return copie;
    }

    /** La pratique porte-t-elle des définitions à déposer ? */
    function aEmporte(pratique) {
        const b = estParCibles(pratique) ? pratique.configuration[CHAMP_EMPORTE] : null;
        return !!(b && typeof b === 'object' && Array.isArray(b.cibles));
    }

    /** L'échelle reçue, par la liste blanche des imports quand elle est chargée (un fichier d'une ou d'un collègue). */
    function echelleADeposer(echelle) {
        const brute = echelleQuiVoyage(echelle);
        if (!brute) return null;
        const propre = (typeof window.assainirImportJson === 'function') ? window.assainirImportJson(brute, 'echelle') : brute;
        if (!propre || !propre.id || !Array.isArray(propre.niveaux)) return null;
        return Object.assign({}, propre, { dansBibliotheque: true, verrouille: false, dateCreation: propre.dateCreation || new Date().toISOString() });
    }

    /**
     * Dépose dans le trimestre ACTIF ce que la pratique emporte, AVANT qu'elle y soit écrite (une pratique n'est jamais
     * écrite en désignant un ensemble qui n'existe pas). Rend une COPIE de la pratique, prête à écrire : elle nomme
     * l'ensemble recréé et ne porte plus de bagage. Sans bagage : la pratique reçue, telle quelle. Échec d'écriture :
     * `null` (le témoin l'a dit), et la pratique ne doit pas être écrite.
     * @param {Object} pratique
     * @param {{geste?:string}} [options]
     * @returns {Promise<Object|null>}
     */
    async function deposer(pratique, options) {
        if (!aEmporte(pratique)) return pratique;
        const geste = (options && options.geste) || 'Utiliser dans ce trimestre';
        const copie = JSON.parse(JSON.stringify(pratique));
        const bagage = copie.configuration[CHAMP_EMPORTE];
        delete copie.configuration[CHAMP_EMPORTE];

        const echelle = echelleADeposer(bagage.echelle);
        // Déjà dans le trimestre : elle sert telle quelle, rien n'y est écrit.
        const dejaLa = (liste) => (Array.isArray(liste) ? liste : []).some(e => e && e.id === copie.configuration.echelleId);
        if (echelle && echelle.id === copie.configuration.echelleId && !dejaLa(db.getSync(cle('echellesTemplates'), []))) {
            const ecrite = await modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
                const liste = Array.isArray(lues) ? lues : [];
                return dejaLa(liste) ? liste : liste.concat([echelle]);
            }, [], { geste: geste, discret: true }).catch(() => undefined);
            if (!ecrite) return null;
        }

        const coursConnu = bagage.coursId && (db.getSync('cours', []) || []).some(c => c && c.id === bagage.coursId);
        const ensembleId = genererIdUnique('ENSC_');
        const ecrit = await enregistrer({ id: ensembleId, coursId: coursConnu ? bagage.coursId : null, cibles: bagage.cibles }, { geste: geste });
        if (!ecrit) return null;
        copie.configuration.ensembleCiblesId = ensembleId;
        return copie;
    }

    /** Les étiquettes des cibles qu'une pratique emporte (l'aperçu de la bibliothèque), ou []. */
    function etiquettesEmportees(pratique) {
        return aEmporte(pratique) ? normaliserCibles(pratique.configuration[CHAMP_EMPORTE].cibles).map(c => c.etiquette) : [];
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
            return `<p class="cibles-fiche-absent">${esc(MOTIF_INTROUVABLE)}</p>`;
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

    /* « À L'ESSAI » (21 nov. 2026 ; décision de Grégoire, 14 h 17) — UNE SEULE CONSTANTE allume et éteint la mention aux
       trois endroits où la pratique « Par standards » se choisit ou se présente : la carte du modèle en vue simple
       (js/vue-simple.js), les cartes de l'assistant de création (js/wizard-pratique-v2.js), l'en-tête de sa fiche
       (js/pratiques-gestion.js). Elle passe à `false` quand les testeurs auront confirmé la pratique ; rien d'autre à toucher.
       Les trois endroits lisent `window.EnsemblesCibles.A_L_ESSAI` au moment de dessiner (sentinelle
       tests/unit/sentinelle-par-standards-a-l-essai.test.js, banc tests/integration/par-standards-a-l-essai.spec.js). */
    const A_L_ESSAI = true;
    const MOT_A_L_ESSAI = 'À l’essai';

    /** La mention est-elle allumée ? Lue sur l'objet publié, à chaque dessin. */
    function estALEssai() {
        return window.EnsemblesCibles.A_L_ESSAI === true;
    }

    /** La mention en étiquette (vue étendue), lisible sans survol ; '' quand la constante est éteinte. */
    function etiquetteEssaiHTML() {
        return estALEssai() ? `<span class="etiquette-essai">${esc(MOT_A_L_ESSAI)}</span>` : '';
    }

    window.EnsemblesCibles = {
        CLE: CLE,
        A_L_ESSAI: A_L_ESSAI,
        MOT_A_L_ESSAI: MOT_A_L_ESSAI,
        estALEssai: estALEssai,
        etiquetteEssaiHTML: etiquetteEssaiHTML,
        CODE_SANS_DONNEE_DEPART: CODE_SANS_DONNEE_DEPART,
        MOTIFS: { AUCUNE_CIBLE: MOTIF_AUCUNE_CIBLE, SANS_ETIQUETTE: MOTIF_SANS_ETIQUETTE, AUCUNE_ECHELLE: MOTIF_AUCUNE_ECHELLE,
            ECHELLE_SANS_ZERO: MOTIF_ECHELLE_SANS_ZERO, SANS_DONNEE: MOTIF_SANS_DONNEE, INTROUVABLE: MOTIF_INTROUVABLE },
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
        ciblesDeLaPratiqueActive: ciblesDeLaPratiqueActive,
        enregistrer: enregistrer,
        CHAMP_EMPORTE: CHAMP_EMPORTE,
        emporter: emporter,
        aEmporte: aEmporte,
        deposer: deposer,
        etiquettesEmportees: etiquettesEmportees,
        libelleDuCours: libelleDuCours,
        rendreFiche: rendreFiche
    };
})();
