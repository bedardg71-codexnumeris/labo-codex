/**
 * LES NIVEAUX INSCRITS — la pratique « Par standards », lot 2 (21 nov. 2026)
 *
 * Plan : plans de travail/PLAN-2026-11-20-moteur-par-objectifs.md (§ 3 et lot 2, section du 21 nov. 2026).
 * Fiche des règles : plans de travail/CONCEPTION-2026-11-20-pratique-par-standards.md (N1 à N7, E2, E3).
 *
 * PROPRIÉTAIRE de la clé `inscriptionsCibles` (par trimestre : `cle('inscriptionsCibles')`). Seuls écrivains : `inscrire`
 * et `annuler`, appelés par le tableau des cibles (js/tableau-cibles.js). Tout autre module la LIT par les fonctions
 * pures ci-dessous.
 *
 * UNE LISTE OÙ L'ON AJOUTE. On n'y réécrit rien, on n'en retire rien (N6 : chaque inscription est gardée et datée ; limite
 * de Grégoire du 20 sept. 2026 : aucune suppression définitive). Une annulation (N7) est une ENTRÉE DE PLUS, qui désigne
 * l'inscription annulée : l'inscription elle-même ne change jamais. Deux appareils qui ont inscrit chacun de leur côté se
 * réunissent sans conflit à la fusion d'un codex (`codex.js`, listes à `id` : l'union des entrées).
 *
 * FORME (deux sortes d'entrées, distinguées par `type`) :
 *   inscription : { id, type: 'inscription', da, ensembleId, cibleId,
 *                   niveau,                  // le CODE du niveau dans l'échelle de la pratique (le « sans donnée » compris, E3),
 *                                            // ou null : AUCUN niveau posé (complément du 21 nov., 9 h 17 ; voir plus bas)
 *                   echelleId,               // l'échelle du niveau ; null quand il n'y a pas de niveau
 *                   date,                    // 'AAAA-MM-JJ' : la date de la trace (d'office aujourd'hui, modifiable)
 *                   horodatage,              // ISO : le moment où l'inscription a été écrite
 *                   productionId,            // l'id d'une production, ou null (observation, entretien : N3)
 *                   origine,                 // 'production', 'observation' ou 'conversation' (22 nov. 2026 ; voir plus bas)
 *                   noteBreve,               // texte libre de l'enseignant·e (la rétroaction, N5) ; '' si rien
 *                   criteres: [ { id, texte, essentiel, respecte } ],
 *                   tampons: [ { id, nom, categorieId, categorieNom, critere, emoji } ] }   // 24 nov. 2026 ; voir plus bas
 *   annulation  : { id, type: 'annulation', inscriptionId, da, ensembleId, cibleId, date, horodatage, raison }
 *
 * UNE INSCRIPTION SANS NIVEAU (choix de Grégoire, 21 nov. 2026, 9 h 17 ; à l'écran, une « remarque », mot PROPOSÉ) :
 * `niveau: null`, `echelleId: null`, et un texte (`noteBreve`). C'est une note datée sur une cible pour un·e étudiant·e.
 * Origine : « cas A, courriel du 21 nov. 2026 : quand il triangule, il prend des notes qualitatives à différents moments et
 * ne pose un niveau que lorsqu'il juge avoir assez de traces ; c'est sa stratégie pour 7 de ses 10 cibles à l'automne
 * 2026 ». `null` n'est AUCUN code de l'échelle, pas même celui du niveau « sans donnée » (qui vaut 0 %) : une cible qui
 * n'a que des remarques reste sans donnée pour le niveau retenu (lot 3) et pour la note (lot 4). Une inscription porte
 * au moins un niveau, un texte ou un critère renseigné (élargi le 22 nov. 2026) ; vide des trois, elle est refusée
 * (`motifsRefus`). Ses critères se cochent de même.
 *
 * L'ÉTAT DES CRITÈRES (choix de Grégoire, 21 nov. 2026, 8 h 38). Chaque critère de la cible, tel qu'il était écrit au
 * moment du jugement (id, texte, « essentiel »), avec `respecte` :
 *   true  : renseigné, respecté ;
 *   false : renseigné, non respecté ;
 *   null  : non renseigné. C'est l'état d'office : une inscription sans aucune coche est complète, et « rien de coché »
 *           ne veut pas dire « aucun critère respecté ».
 * Le texte est gardé avec l'inscription : réécrire ou retirer un critère dans l'assistant ne change pas ce qu'une
 * inscription passée dit avoir jugé. Une cible sans critère donne `criteres: []`.
 * ⚠ L'APPLICATION NE CALCULE RIEN À PARTIR DES COCHES : ni niveau proposé, ni niveau refusé, ni alerte de cohérence
 * (fiche, N1 ; avertissement des sources sur le calcul, fiche § 6). Aucune fonction de ce module ne les lit pour décider.
 *
 * L'ORIGINE D'UNE INSCRIPTION (décision de Grégoire, 22 nov. 2026, l'écran d'observation) : trois valeurs.
 *   production   : elle désigne une production (`productionId`) ;
 *   observation  : vue en classe, sans copie (pendant une pratique guidée) ;
 *   conversation : un échange hors séance (au bureau, par message).
 * Les inscriptions écrites avant le 22 nov. n'ont pas ce champ, et ne sont PAS réécrites : `lireOrigine` les lit
 * « production » si elles désignent une production, « observation » sinon. Une inscription qui désigne une production est
 * toujours « production » (la forme rangée l'impose). Le champ voyage avec l'entrée : la fusion de deux codex réunit par
 * `id`, et une entrée n'étant jamais réécrite, le champ ne crée aucun conflit.
 *
 * LA RÈGLE D'ACCEPTATION (élargie le 22 nov. 2026, l'écran d'observation) : une inscription porte un niveau, un texte, OU
 * au moins un critère renseigné (respecté ou non respecté). Une observation d'une seule touche est donc valide. Vide des
 * trois, elle est refusée (`motifsRefus`). Les coches restent sans calcul : elles rendent l'inscription non vide, rien de plus.
 *
 * LES TAMPONS D'OBSERVATION (décisions de Grégoire, 24 nov. 2026 ; « Tampons d'observation », lot 2). Un tampon consigne
 * un geste acquis que l'on voit l'étudiant·e faire. Il ne consigne jamais un manque, ne pose pas de niveau et NE COCHE
 * AUCUN CRITÈRE : `criteres[].respecte` ne dépend jamais de `tampons`. Chaque tampon est COPIÉ au moment du geste
 * (identifiant, nom, identifiant et nom de sa catégorie, critère déclaré, emoji s'il en a un) : renommer ou supprimer le
 * tampon ne change pas ce qu'une inscription passée dit. JAMAIS l'image : elle pèse jusqu'à 2 650 caractères et une séance
 * en inscrit des dizaines ; à l'affichage elle se cherche par l'identifiant sur le poste, et le nom suffit sans elle.
 * Les inscriptions d'avant n'ont pas ce champ et ne sont pas réécrites : `lireTampons` les lit sans tampon.
 * Un tampon suffit à rendre l'inscription non vide (`motifsRefus`). Une trace sans niveau ne pose pas de niveau : au
 * tableau sa case montre ✎. Elle ne s'appelle « Remarque » que si elle porte un TEXTE (`estUneRemarque` ; Grégoire,
 * 24 nov. 2026, 18 h 57) : faite de coches, de tampons ou des deux, elle se lit par sa date, son origine et son contenu.
 * LE RAPPROCHEMENT d'un critère déclaré (`rapprocherTampons`) se fait À L'AFFICHAGE seulement, contre les textes des
 * critères copiés dans la MÊME inscription : texte rogné, sans égard à la casse ; le premier qui correspond. Rien n'est
 * écrit à ce sujet dans l'inscription. Sans critère déclaré, ou si aucun ne correspond : sous la cible, sans plus.
 *
 * CE QUE CE MODULE NE FAIT PAS : il ne retient aucun niveau et ne calcule aucune note (lots 3 et 4 : `NoteCibles`,
 * js/pratiques/note-cibles.js, qui lit cette liste par les fonctions pures ci-dessous). Il ne lit ni n'écrit
 * `evaluationsSauvegardees`.
 */
(function () {
    'use strict';

    const CLE = 'inscriptionsCibles';
    const INSCRIPTION = 'inscription';
    const ANNULATION = 'annulation';
    const LONGUEUR_NOTE_BREVE = 600;   // une note BRÈVE : la zone de saisie s'arrête là (choix technique)
    const LONGUEUR_RAISON = 300;
    // Les tampons d'une inscription (24 nov. 2026). Bornes techniques : celles des réglages des tampons (un nom et un nom
    // de catégorie de 100 caractères, un critère de 200), et un plafond de tampons par inscription.
    const LONGUEUR_NOM_TAMPON = 100;
    const LONGUEUR_CRITERE_TAMPON = 200;
    const LONGUEUR_EMOJI_TAMPON = 16;
    const MAX_TAMPONS = 40;

    /* ------------------------------------------------------------------ Les refus, en mots (propositions) */
    // Mots PROPOSÉS (plans de travail/TEXTES-2026-11-21-par-standards-lot-2.md) : Grégoire les relit sur l'aperçu.
    const MOTIFS = Object.freeze({
        // Complément du 21 nov., 9 h 17 : le niveau est facultatif, mais pas l'inscription vide.
        // Élargi le 22 nov. 2026 : un critère renseigné suffit aussi (l'écran d'observation).
        VIDE: 'Choisis un niveau, renseigne un critère ou écris une rétroaction : une inscription vide ne s\'inscrit pas.',
        OBSERVATION_VIDE: 'Renseigne un critère ou écris ce que tu as vu : une observation vide ne s\'inscrit pas.',
        // 24 nov. 2026, mot PROPOSÉ (TEXTES-2026-11-24-tampons-observation-lot-2.md) : dit seulement quand l'écran offre des tampons.
        OBSERVATION_VIDE_TAMPONS: 'Touche un tampon, renseigne un critère ou écris ce que tu as vu : une observation vide ne s\'inscrit pas.',
        NIVEAU_HORS_ECHELLE: 'Ce niveau n\'est pas dans l\'échelle de la pratique : choisis-en un dans la liste.',
        DATE: 'La date n\'est pas valide : choisis une date dans le calendrier.',
        SANS_ELEVE: 'Choisis l\'étudiant·e.',
        SANS_PRODUCTION: 'Choisis la production.',
        AUCUNE_CIBLE_REMPLIE: 'Choisis un niveau pour au moins une cible, ou ferme sans rien inscrire.',
        INTROUVABLE: 'Cette inscription est introuvable dans ce trimestre : rien n\'a été annulé.',
        DEJA_ANNULEE: 'Cette inscription est déjà annulée.'
    });

    /* ------------------------------------------------------------------ Les dates */

    function deux(n) { return String(n).padStart(2, '0'); }

    /** La date du jour, à l'heure de l'appareil : 'AAAA-MM-JJ'. */
    function dateDuJour(maintenant) {
        const d = maintenant instanceof Date ? maintenant : new Date();
        return d.getFullYear() + '-' + deux(d.getMonth() + 1) + '-' + deux(d.getDate());
    }

    /** Vrai pour une date 'AAAA-MM-JJ' qui existe au calendrier. */
    function dateValide(texte) {
        if (typeof texte !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texte)) return false;
        const [a, m, j] = texte.split('-').map(Number);
        const d = new Date(a, m - 1, j);
        return d.getFullYear() === a && d.getMonth() === m - 1 && d.getDate() === j;
    }

    /* ------------------------------------------------------------------ L'état des critères (fonctions pures) */

    /** `respecte` lu : true, false, ou null (non renseigné). Toute autre valeur est « non renseigné ». */
    function lireRespecte(v) {
        return v === true ? true : (v === false ? false : null);
    }

    /**
     * L'état des critères d'une cible au moment du jugement : chaque critère de la cible, dans son ordre, avec sa réponse.
     * Un critère sans réponse est non renseigné (`null`). Une réponse pour un critère que la cible n'a plus est ignorée.
     * @param {Object} cible - forme rangée (`EnsemblesCibles.normaliserCible`)
     * @param {Object<string, boolean>} reponses - { [critereId]: true | false } ; absent = non renseigné
     * @returns {Array<{id, texte, essentiel, respecte}>}
     */
    function etatDesCriteres(cible, reponses) {
        const r = reponses || {};
        const criteres = (cible && Array.isArray(cible.criteres)) ? cible.criteres : [];
        return criteres.filter(k => k && k.id).map(k => ({
            id: String(k.id),
            texte: String(k.texte == null ? '' : k.texte),
            essentiel: k.essentiel === true,
            respecte: Object.prototype.hasOwnProperty.call(r, k.id) ? lireRespecte(r[k.id]) : null
        }));
    }

    /** Compte des trois états, pour l'historique : { respectes, nonRespectes, nonRenseignes }. */
    function compterCriteres(criteres) {
        const liste = Array.isArray(criteres) ? criteres : [];
        return {
            respectes: liste.filter(k => k && k.respecte === true).length,
            nonRespectes: liste.filter(k => k && k.respecte === false).length,
            nonRenseignes: liste.filter(k => !k || lireRespecte(k.respecte) === null).length
        };
    }

    /* ------------------------------------------------------------------ Le niveau absent */

    /** Le niveau lu : un code (chaîne non vide), ou null quand aucun niveau n'est posé. */
    function lireNiveau(v) {
        return (v === undefined || v === null || String(v) === '') ? null : String(v);
    }

    /** Vrai pour une inscription qui ne porte AUCUN niveau (une remarque). Jamais vrai pour le niveau « sans donnée ». */
    function estSansNiveau(e) {
        return !!e && lireNiveau(e.niveau) === null;
    }

    /* ------------------------------------------------------------------ L'origine (22 nov. 2026) */

    const ORIGINES = Object.freeze({ PRODUCTION: 'production', OBSERVATION: 'observation', CONVERSATION: 'conversation' });
    const LISTE_ORIGINES = Object.freeze([ORIGINES.PRODUCTION, ORIGINES.OBSERVATION, ORIGINES.CONVERSATION]);

    /**
     * L'origine d'une inscription. Enregistrée : telle quelle. Absente (inscription d'avant le 22 nov.) ou inconnue :
     * « production » si l'inscription désigne une production, « observation » sinon. Rien n'est réécrit.
     */
    function lireOrigine(e) {
        if (!e) return ORIGINES.OBSERVATION;
        if (LISTE_ORIGINES.indexOf(e.origine) !== -1) return e.origine;
        return e.productionId ? ORIGINES.PRODUCTION : ORIGINES.OBSERVATION;
    }

    /** L'origine à ranger : une production désignée l'impose ; sinon « conversation » si demandée, « observation » d'office. */
    function origineARanger(origine, productionId) {
        if (productionId) return ORIGINES.PRODUCTION;
        return origine === ORIGINES.CONVERSATION ? ORIGINES.CONVERSATION : ORIGINES.OBSERVATION;
    }

    /** Vrai quand au moins un critère est renseigné (respecté ou non respecté). */
    function aUnCritereRenseigne(criteres) {
        return (Array.isArray(criteres) ? criteres : []).some(k => k && lireRespecte(k.respecte) !== null);
    }

    /* ------------------------------------------------------------------ Les tampons (24 nov. 2026, fonctions pures) */

    function texteBorne(v, max) {
        return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max).trim();
    }

    /**
     * Les tampons d'une inscription dans leur forme rangée : la COPIE de chacun au moment du geste. Sans identifiant, un
     * tampon n'entre pas ; le même identifiant n'entre qu'une fois ; jamais d'image ni d'autre champ.
     * @param {Array<{id, nom, categorieId, categorieNom, critere, emoji}>} liste
     */
    function construireTampons(liste) {
        const vus = new Set();
        const rendus = [];
        (Array.isArray(liste) ? liste : []).forEach(t => {
            const id = (t && t.id != null) ? String(t.id) : '';
            if (!id || vus.has(id) || rendus.length >= MAX_TAMPONS) return;
            vus.add(id);
            rendus.push({
                id: id,
                nom: texteBorne(t.nom, LONGUEUR_NOM_TAMPON),
                categorieId: t.categorieId == null ? '' : String(t.categorieId),
                categorieNom: texteBorne(t.categorieNom, LONGUEUR_NOM_TAMPON),
                critere: texteBorne(t.critere, LONGUEUR_CRITERE_TAMPON),
                emoji: texteBorne(t.emoji, LONGUEUR_EMOJI_TAMPON)
            });
        });
        return rendus;
    }

    /** Les tampons d'une inscription, lus : une inscription d'avant le 24 nov. n'en a pas (`[]`). Rien n'est réécrit. */
    function lireTampons(e) {
        return (e && Array.isArray(e.tampons)) ? e.tampons.filter(t => t && t.id) : [];
    }

    /** Vrai quand au moins un tampon est posé. */
    function aUnTampon(tampons) {
        return (Array.isArray(tampons) ? tampons : []).some(t => t && t.id);
    }

    /**
     * Vrai pour une REMARQUE : une trace sans niveau qui porte un TEXTE (règle de Grégoire, 24 nov. 2026, 18 h 57 : le mot
     * « remarque » désigne un texte que l'enseignant·e a écrit). Une trace sans niveau faite de coches, de tampons ou des
     * deux n'en est pas une : à l'historique et au profil elle se lit par sa date, son origine et son contenu, sans étiquette.
     */
    function estUneRemarque(e) {
        return estSansNiveau(e) && texteLibre(e && e.noteBreve, LONGUEUR_NOTE_BREVE) !== '';
    }

    /** Le texte d'un critère pour le comparer : rogné, espaces resserrées, sans égard à la casse. */
    function critereCompare(texte) {
        return String(texte == null ? '' : texte).replace(/\s+/g, ' ').trim().toLocaleLowerCase('fr');
    }

    /**
     * OÙ SE MONTRE CHAQUE TAMPON (à l'affichage seulement ; rien n'est écrit) : à côté du PREMIER critère de `criteres`
     * dont le texte correspond à son critère déclaré, sinon sous la cible. Ne lit ni n'écrit aucune coche.
     * @param {Array} tampons - forme rangée
     * @param {Array<{id, texte}>} criteres - ceux de l'inscription (ou de la cible, sur l'écran « Observer »)
     * @returns {{ parCritere: Object<string, Array>, sousLaCible: Array }}
     */
    function rapprocherTampons(tampons, criteres) {
        const liste = (Array.isArray(criteres) ? criteres : []).filter(k => k && k.id);
        const rendu = { parCritere: {}, sousLaCible: [] };
        (Array.isArray(tampons) ? tampons : []).filter(t => t && t.id).forEach(t => {
            const cherche = critereCompare(t.critere);
            const trouve = cherche ? liste.find(k => critereCompare(k.texte) === cherche) : null;
            if (!trouve) { rendu.sousLaCible.push(t); return; }
            (rendu.parCritere[trouve.id] || (rendu.parCritere[trouve.id] = [])).push(t);
        });
        return rendu;
    }

    /* ------------------------------------------------------------------ Construire (fonctions pures) */

    function texteLibre(v, max) {
        return String(v == null ? '' : v).trim().slice(0, max);
    }

    /**
     * Une inscription dans sa forme rangée.
     * @param {{id, da, ensembleId, cibleId, niveau, echelleId, date, horodatage, productionId, origine, noteBreve, criteres, tampons}} s
     */
    function construireInscription(s) {
        const q = s || {};
        const niveau = lireNiveau(q.niveau);
        const productionId = q.productionId ? String(q.productionId) : null;
        return {
            id: String(q.id || ''),
            type: INSCRIPTION,
            da: String(q.da == null ? '' : q.da),
            ensembleId: String(q.ensembleId || ''),
            cibleId: String(q.cibleId || ''),
            niveau: niveau,                                                    // null : aucun niveau posé
            echelleId: (niveau !== null && q.echelleId) ? String(q.echelleId) : null,
            date: String(q.date || ''),
            horodatage: String(q.horodatage || new Date().toISOString()),
            productionId: productionId,
            origine: origineARanger(q.origine, productionId),
            noteBreve: texteLibre(q.noteBreve, LONGUEUR_NOTE_BREVE),
            criteres: (Array.isArray(q.criteres) ? q.criteres : []).filter(k => k && k.id).map(k => ({
                id: String(k.id),
                texte: String(k.texte == null ? '' : k.texte),
                essentiel: k.essentiel === true,
                respecte: lireRespecte(k.respecte)
            })),
            tampons: construireTampons(q.tampons)   // 24 nov. 2026 : la copie de chaque tampon ; ne touche aucune coche
        };
    }

    /**
     * L'annulation d'une inscription : une entrée de plus, qui la désigne. Elle porte le DA, l'ensemble et la cible de
     * l'inscription (la Réserve et la correction d'un DA les lisent comme pour une inscription).
     */
    function construireAnnulation(s) {
        const q = s || {};
        const visee = q.inscription || {};
        return {
            id: String(q.id || ''),
            type: ANNULATION,
            inscriptionId: String(visee.id || ''),
            da: String(visee.da == null ? '' : visee.da),
            ensembleId: String(visee.ensembleId || ''),
            cibleId: String(visee.cibleId || ''),
            date: String(q.date || ''),
            horodatage: String(q.horodatage || new Date().toISOString()),
            raison: texteLibre(q.raison, LONGUEUR_RAISON)
        };
    }

    /* ------------------------------------------------------------------ Refuser (fonction pure) */

    /** Les codes que l'échelle offre à l'inscription : tout niveau qui a un code (le « sans donnée » compris, E3). */
    function codesDeLEchelle(echelle) {
        const niveaux = (echelle && Array.isArray(echelle.niveaux)) ? echelle.niveaux : [];
        return niveaux.filter(n => n && n.code !== undefined && n.code !== null && String(n.code) !== '').map(n => String(n.code));
    }

    /**
     * Les refus d'une inscription, dans l'ordre de l'écran. Vide : elle peut s'écrire. Les coches n'y entrent pas : elles
     * sont facultatives, et l'application ne juge pas le niveau à partir d'elles. Le niveau est facultatif (complément du
     * 21 nov., 9 h 17), mais une inscription porte au moins un niveau, un texte, un critère renseigné (22 nov. 2026) ou un
     * tampon (24 nov. 2026).
     * @param {{da, cibleId, niveau, noteBreve, date, criteres, tampons}} saisie
     * @param {Object} echelle - l'échelle de la pratique
     * @returns {string[]}
     */
    function motifsRefus(saisie, echelle) {
        const q = saisie || {};
        const motifs = [];
        if (!q.da) motifs.push(MOTIFS.SANS_ELEVE);
        const niveau = lireNiveau(q.niveau);
        if (niveau === null && texteLibre(q.noteBreve, LONGUEUR_NOTE_BREVE) === '' && !aUnCritereRenseigne(q.criteres) && !aUnTampon(q.tampons)) motifs.push(MOTIFS.VIDE);
        else if (niveau !== null && codesDeLEchelle(echelle).indexOf(niveau) === -1) motifs.push(MOTIFS.NIVEAU_HORS_ECHELLE);
        if (!dateValide(q.date)) motifs.push(MOTIFS.DATE);
        return motifs;
    }

    /* ------------------------------------------------------------------ Lire (fonctions pures sur une liste) */

    function estInscription(e) { return !!e && e.type === INSCRIPTION && !!e.id; }
    function estAnnulation(e) { return !!e && e.type === ANNULATION && !!e.inscriptionId; }

    /** La première annulation de chaque inscription : Map(inscriptionId → annulation). */
    function annulationsParInscription(liste) {
        const parId = new Map();
        (Array.isArray(liste) ? liste : []).forEach(e => {
            if (estAnnulation(e) && !parId.has(e.inscriptionId)) parId.set(e.inscriptionId, e);
        });
        return parId;
    }

    /** La plus récente d'abord : la date de la trace, puis le moment de l'écriture (l'ordre de l'historique). */
    function plusRecenteDAbord(a, b) {
        return String(b.date || '').localeCompare(String(a.date || ''))
            || String(b.horodatage || '').localeCompare(String(a.horodatage || ''));
    }

    function duneCase(e, da, ensembleId, cibleId) {
        return String(e.da) === String(da) && e.cibleId === cibleId && (!ensembleId || e.ensembleId === ensembleId);
    }

    /**
     * Toutes les inscriptions d'une case (un·e étudiant·e, une cible), la plus récente d'abord, chacune avec son
     * annulation (ou null). Les annulées restent dans la liste.
     * @returns {Array<{inscription:Object, annulation:Object|null}>}
     */
    function historiqueDeLaCase(liste, da, ensembleId, cibleId) {
        const annulations = annulationsParInscription(liste);
        return (Array.isArray(liste) ? liste : [])
            .filter(e => estInscription(e) && duneCase(e, da, ensembleId, cibleId))
            .slice().sort(plusRecenteDAbord)
            .map(i => ({ inscription: i, annulation: annulations.get(i.id) || null }));
    }

    // `etatDeLaCase` (le DERNIER niveau inscrit d'une case, lot 2) est retirée au lot 3 (21 nov. 2026) : la case montre
    // désormais le niveau retenu, lu par `NoteCibles.retenirDansLHistorique` (js/pratiques/note-cibles.js).

    /**
     * LES ÉTUDIANT·ES VU·ES À UNE DATE POUR UNE CIBLE (l'écran d'observation, 22 nov. 2026) : les DA qui portent, à cette
     * date, une inscription non annulée d'origine « observation » ou « conversation ». Une production ne compte pas : ce
     * repère dit qui a été regardé·e en classe ou entendu·e, rien d'autre. Ne lit aucun niveau.
     * @returns {Set<string>}
     */
    function vusALaDate(liste, ensembleId, cibleId, date) {
        const annulations = annulationsParInscription(liste);
        const vus = new Set();
        (Array.isArray(liste) ? liste : []).forEach(e => {
            if (!estInscription(e) || annulations.has(e.id) || e.cibleId !== cibleId || e.date !== date) return;
            if (ensembleId && e.ensembleId !== ensembleId) return;
            if (lireOrigine(e) === ORIGINES.PRODUCTION) return;
            vus.add(String(e.da));
        });
        return vus;
    }

    /**
     * CE QUI EST DÉJÀ INSCRIT À UNE DATE POUR UNE CASE (24 nov. 2026, retouche du lot 2 des tampons d'observation ;
     * Grégoire, 18 h 55 : revenu sur un·e élève déjà noté·e, l'écran vide laissait croire que rien n'était enregistré).
     * Les inscriptions NON ANNULÉES de cet·te étudiant·e, pour cette cible de cet ensemble, à cette date, toutes origines
     * comprises ; et les noms de leurs tampons, une fois chacun, dans l'ordre où ils ont été inscrits. Ne lit aucun
     * niveau, n'écrit rien.
     * @returns {{inscriptions: number, tampons: Array<string>}}
     */
    function dejaInscritALaDate(liste, da, ensembleId, cibleId, date) {
        const annulations = annulationsParInscription(liste);
        const duJour = (Array.isArray(liste) ? liste : [])
            .map((e, rang) => ({ e, rang }))
            .filter(({ e }) => estInscription(e) && !annulations.has(e.id) && e.date === date && duneCase(e, da, ensembleId, cibleId))
            .sort((a, b) => String(a.e.horodatage || '').localeCompare(String(b.e.horodatage || '')) || a.rang - b.rang);
        const noms = [];
        duJour.forEach(({ e }) => lireTampons(e).forEach(t => {
            const nom = String(t.nom || t.id);
            if (noms.indexOf(nom) === -1) noms.push(nom);
        }));
        return { inscriptions: duJour.length, tampons: noms };
    }

    /**
     * Les inscriptions non annulées de chaque cible d'un ensemble : { [cibleId]: { inscriptions, niveaux, remarques, eleves } }.
     * Pour la question de l'assistant avant de retirer une cible.
     */
    function compterParCible(liste, ensembleId) {
        const annulations = annulationsParInscription(liste);
        const comptes = {};
        (Array.isArray(liste) ? liste : []).forEach(e => {
            if (!estInscription(e) || annulations.has(e.id) || (ensembleId && e.ensembleId !== ensembleId)) return;
            const c = comptes[e.cibleId] || (comptes[e.cibleId] = { inscriptions: 0, niveaux: 0, remarques: 0, eleves: 0, das: new Set() });
            c.inscriptions++;
            if (estSansNiveau(e)) c.remarques++; else c.niveaux++;
            c.das.add(String(e.da));
            c.eleves = c.das.size;
        });
        Object.keys(comptes).forEach(k => { delete comptes[k].das; });
        return comptes;
    }

    /**
     * Les cibles enregistrées qui ne sont plus dans la nouvelle liste ET qui portent au moins une inscription non annulée :
     * `[{ cible, inscriptions, niveaux, remarques, eleves }]`. Lecture seule. Pour la question de l'assistant avant d'écrire (patron de #717).
     * @param {Array} liste - les entrées de `inscriptionsCibles`
     * @param {string} ensembleId
     * @param {Array} anciennes - les cibles rangées
     * @param {Array} nouvelles - les cibles à écrire
     */
    function ciblesRetireesInscrites(liste, ensembleId, anciennes, nouvelles) {
        const gardees = new Set((Array.isArray(nouvelles) ? nouvelles : []).map(c => c && String(c.id)));
        const comptes = compterParCible(liste, ensembleId);
        return (Array.isArray(anciennes) ? anciennes : [])
            .filter(c => c && c.id && !gardees.has(String(c.id)) && comptes[c.id])
            .map(c => ({ cible: c, inscriptions: comptes[c.id].inscriptions, niveaux: comptes[c.id].niveaux,
                remarques: comptes[c.id].remarques, eleves: comptes[c.id].eleves }));
    }

    /**
     * LA QUESTION AVANT DE RETIRER DES CIBLES QUI PORTENT DES INSCRIPTIONS (lot 2, l'assistant ; partagée le 21 nov. 2026
     * avec la vue simple, qui pose « la même question que l'assistant »). Les inscriptions ne sont pas effacées : la cible
     * cesse d'être montrée au tableau. Mots PROPOSÉS au lot 2 (W1 à W4), inchangés.
     * @param {Array} retraits - `ciblesRetireesInscrites`
     * @returns {{titre: string, message: string, texteConfirmer: string}|null} null : rien à demander
     */
    function questionRetraitCibles(retraits) {
        const liste = Array.isArray(retraits) ? retraits : [];
        if (liste.length === 0) return null;
        const plusieurs = liste.length > 1;
        // Complément du 21 nov., 9 h 17 : une inscription peut être sans niveau ; elles sont dites à part. Mots de
        // Grégoire (24 nov. 2026, 18 h 58) : « 2 traces sans niveau pour 1 étudiant·e ».
        const compte = (n, un, des) => `${n} ${n > 1 ? des : un}`;
        const lignes = liste.map(x => `« ${x.cible.etiquette || x.cible.id} » : `
            + [x.niveaux ? compte(x.niveaux, 'niveau inscrit', 'niveaux inscrits') : '', x.remarques ? compte(x.remarques, 'trace sans niveau', 'traces sans niveau') : '']
                .filter(Boolean).join(' et ')
            + ` pour ${compte(x.eleves, 'étudiant·e', 'étudiant·es')}`);
        const message = (plusieurs ? 'Tu retires des cibles qui portent des inscriptions.' : 'Tu retires une cible qui porte des inscriptions.')
            + '\n\n' + lignes.join('\n')
            + '\n\n' + (plusieurs ? 'Leurs inscriptions restent enregistrées, mais ces cibles ne seront plus montrées au tableau.'
                : 'Ses inscriptions restent enregistrées, mais cette cible ne sera plus montrée au tableau.')
            + '\n\nRetirer quand même ?';
        return { titre: plusieurs ? 'Retirer des cibles' : 'Retirer une cible', message, texteConfirmer: 'Retirer quand même' };
    }

    /**
     * Les cibles qu'un geste « inscrire pour une production » offre : celles que la production déclare
     * (`production.ciblesRenseignees`, facultatif), dans l'ordre de l'ensemble ; sans liste, ou si aucune des cibles
     * déclarées n'est encore dans l'ensemble, toutes les cibles.
     * @param {Object} production
     * @param {Array} cibles - celles de l'ensemble, dans leur ordre
     * @returns {Array}
     */
    function ciblesOffertes(production, cibles) {
        const toutes = Array.isArray(cibles) ? cibles : [];
        const declarees = (production && Array.isArray(production.ciblesRenseignees)) ? production.ciblesRenseignees.map(String) : [];
        if (declarees.length === 0) return toutes.slice();
        const offertes = toutes.filter(c => c && declarees.indexOf(String(c.id)) !== -1);
        return offertes.length ? offertes : toutes.slice();
    }

    /* ------------------------------------------------------------------ Les tampons posés sur une production (25 nov. 2026, fonctions pures)
       « Tampons d'observation », lot 3. UNE SEULE SOURCE : poser un tampon sur une production n'écrit AUCUNE inscription.
       Ces fonctions LISENT les annotations des productions d'un·e étudiant·e et en tirent des traces ; rien n'est écrit.
       Un tampon retiré ou déplacé de la production disparaît donc de lui-même, sans trace fantôme.
       Est « d'observation » un tampon que `lireTampon(id)` reconnaît AU MOMENT DE LA LECTURE (sa catégorie est cochée) :
       le tampon posé ne garde que son identifiant. Au moment d'inscrire, la trace est COPIÉE (forme du lot 2) et ne bouge plus. */

    /** L'instant où un tampon a été posé, en millisecondes, lu de son identifiant (`STK_<instant>`, écrit à la pose et
     *  gardé quand on le déplace) ; null si l'identifiant n'en porte pas. */
    function instantDeLaPose(tamponPose) {
        const m = /^STK_(\d{12,14})(?:_|$)/.exec(String(tamponPose && tamponPose.id || ''));
        const n = m ? Number(m[1]) : NaN;
        return Number.isFinite(n) ? n : null;
    }

    /** L'instant d'une date ISO, ou null. */
    function instantDuTexte(texte) {
        const n = texte ? Date.parse(String(texte)) : NaN;
        return Number.isFinite(n) ? n : null;
    }

    /**
     * LES TRACES LUES SUR LES PRODUCTIONS d'un·e étudiant·e : par production, puis par jour de pose, les tampons
     * d'observation posés (chacun une fois par jour, dans l'ordre de pose, dans sa forme de copie).
     * LA DATE d'une trace : le jour, à l'heure de l'appareil, de l'instant de la pose ; à défaut (identifiant sans
     * instant), la dernière modification de l'annotation, puis l'import du fichier.
     * @param {Array} fichiers - `fichiersTravaux` (un fichier : `{ id, etudiantDA, productionId }`)
     * @param {Array} annotations - `annotationsTravaux` (une annotation : `{ fichierId, pages: { [rang]: { stickers } } }`)
     * @param {string} da
     * @param {function(string): ?Object} lireTampon - l'identifiant d'un tampon → sa copie s'il est d'observation, sinon null
     * @returns {Array<{productionId: string, jours: Array<{date: string, horodatage: string, tampons: Array}>}>}
     *   les productions par trace la plus récente d'abord ; les jours, le plus récent d'abord
     */
    /** Les tampons d'observation posés sur les pages d'UNE annotation : `[{ instant, tampon }]`. */
    function posesDeLAnnotation(annotation, copieDe, repli) {
        const pages = (annotation && annotation.pages && typeof annotation.pages === 'object') ? annotation.pages : {};
        const poses = [];
        Object.keys(pages).forEach(rang => {
            const page = pages[rang];
            (page && Array.isArray(page.stickers) ? page.stickers : []).forEach(pose => {
                const id = pose && pose.autocollantId != null ? String(pose.autocollantId) : '';
                const tampon = id ? copieDe(id) : null;
                if (tampon) poses.push({ instant: instantDeLaPose(pose) || repli, tampon: tampon });
            });
        });
        return poses;
    }

    /** Des poses rangées par jour (à l'heure de l'appareil), le plus récent d'abord ; chaque tampon une fois par jour. */
    function joursDesPoses(poses) {
        const jours = new Map();
        poses.forEach(p => {
            const date = dateDuJour(new Date(p.instant));
            const jour = jours.get(date) || { date: date, instant: p.instant, poses: [] };
            jours.set(date, jour);
            jour.instant = Math.max(jour.instant, p.instant);
            jour.poses.push(p);
        });
        return Array.from(jours.values()).map(j => ({
            date: j.date,
            horodatage: new Date(j.instant).toISOString(),
            tampons: construireTampons(j.poses.slice().sort((x, y) => x.instant - y.instant).map(x => x.tampon))
        })).sort(plusRecenteDAbord);
    }

    function tracesDesProductions(fichiers, annotations, da, lireTampon) {
        const lire = typeof lireTampon === 'function' ? lireTampon : () => null;
        const parFichier = new Map();
        (Array.isArray(annotations) ? annotations : []).forEach(a => { if (a && a.fichierId && !parFichier.has(a.fichierId)) parFichier.set(a.fichierId, a); });
        const connus = new Map();   // identifiant du tampon → sa copie, ou null : lu une fois
        const copieDe = (id) => { if (!connus.has(id)) connus.set(id, lire(id) || null); return connus.get(id); };
        const parProduction = new Map();
        (Array.isArray(fichiers) ? fichiers : []).filter(f => f && f.productionId && String(f.etudiantDA) === String(da)).forEach(f => {
            const a = parFichier.get(f.id);
            const poses = posesDeLAnnotation(a, copieDe, instantDuTexte(a && a.dateModification) || instantDuTexte(f.dateImport) || 0);
            if (poses.length) parProduction.set(f.productionId, (parProduction.get(f.productionId) || []).concat(poses));
        });
        const rendu = [];
        parProduction.forEach((poses, productionId) => rendu.push({ productionId: String(productionId), jours: joursDesPoses(poses) }));
        return rendu.sort((x, y) => plusRecenteDAbord(x.jours[0], y.jours[0]));
    }

    /** Les tampons d'observation d'UNE production, tous jours confondus, chacun une fois, dans l'ordre de pose : ce que
     *  « Inscrire pour une production » montre et copie. */
    function tamponsDeLaProduction(traces, productionId) {
        const t = (Array.isArray(traces) ? traces : []).find(x => x && x.productionId === String(productionId));
        if (!t) return [];
        return construireTampons(t.jours.slice().reverse().reduce((tous, j) => tous.concat(j.tampons), []));
    }

    /**
     * LA cible qu'une production vise, quand elle en vise UNE SEULE : elle déclare exactement une cible
     * (`production.ciblesRenseignees`) et cette cible est dans l'ensemble. Zéro, plusieurs, ou une cible qui n'est plus
     * dans l'ensemble : null (la trace reste sous la production).
     */
    function cibleUnique(production, cibles) {
        const declarees = (production && Array.isArray(production.ciblesRenseignees)) ? production.ciblesRenseignees.map(String) : [];
        if (declarees.length !== 1) return null;
        const c = (Array.isArray(cibles) ? cibles : []).find(x => x && String(x.id) === declarees[0]);
        return c ? String(c.id) : null;
    }

    /** Vrai quand une inscription non annulée existe pour cette personne, cette cible et cette production. */
    function estInscritePourLaProduction(liste, da, ensembleId, cibleId, productionId) {
        const annulations = annulationsParInscription(liste);
        return (Array.isArray(liste) ? liste : []).some(e => estInscription(e) && duneCase(e, da, ensembleId, cibleId)
            && e.productionId === String(productionId) && !annulations.has(e.id));
    }

    /**
     * LES TRACES LUES EN DIRECT SOUS UNE CIBLE : celles des productions qui visent cette seule cible, tant qu'aucune
     * inscription non annulée n'existe pour la production et la cible (dès qu'il y en a une, c'est elle qu'on lit : la
     * lecture en direct ne s'y ajoute pas une seconde fois). Chaque trace a la forme d'une inscription sans niveau,
     * sans texte et sans coche, d'origine « production », marquée `enDirect` ; elle n'a pas d'identifiant : elle n'existe
     * dans aucun stock.
     * @param {Array} traces - `tracesDesProductions`
     * @param {Array} productions - celles du groupe
     * @param {{ liste: Array, da: string, ensembleId: string, cible: Object, cibles: Array }} o
     */
    function tracesEnDirectSousLaCible(traces, productions, o) {
        const q = o || {};
        const cible = q.cible || {};
        const rendu = [];
        (Array.isArray(traces) ? traces : []).forEach(t => {
            const production = (Array.isArray(productions) ? productions : []).find(p => p && String(p.id) === t.productionId);
            if (!production || cibleUnique(production, q.cibles) !== String(cible.id)) return;
            if (estInscritePourLaProduction(q.liste, q.da, q.ensembleId, cible.id, t.productionId)) return;
            t.jours.forEach(j => rendu.push({
                id: '', type: INSCRIPTION, enDirect: true, da: String(q.da), ensembleId: String(q.ensembleId || ''), cibleId: String(cible.id),
                niveau: null, echelleId: null, date: j.date, horodatage: j.horodatage, productionId: t.productionId,
                origine: ORIGINES.PRODUCTION, noteBreve: '', criteres: etatDesCriteres(cible, {}), tampons: j.tampons
            }));
        });
        return rendu.sort(plusRecenteDAbord);
    }

    /* ------------------------------------------------------------------ Ajouter (fonction pure) */

    /**
     * La liste avec les entrées neuves AU BOUT. Rien d'autre ne change : aucune entrée n'est retirée, déplacée ni
     * réécrite. C'est la seule façon dont ce module transforme la liste.
     */
    function ajouter(liste, entrees) {
        const avant = Array.isArray(liste) ? liste : [];
        return avant.concat(Array.isArray(entrees) ? entrees : [entrees]);
    }

    /* ------------------------------------------------------------------ Lire, écrire (le stockage) */

    function lireToutes() {
        const liste = (typeof db !== 'undefined' && typeof cle === 'function') ? db.getSync(cle(CLE), []) : [];
        return Array.isArray(liste) ? liste : [];
    }

    function nouvelId() {
        return (typeof window.genererIdUnique === 'function') ? window.genererIdUnique('INSC_')
            : 'INSC_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    /**
     * Écrit en ajoutant au bout de ce qui est lu DANS la file d'écriture (`modifierEtAnnoncer`, modes.js : un trimestre
     * clos refuse, le témoin parle d'un échec). `entrees` : les entrées à ajouter, ou une fonction qui les rend une fois
     * le contrôle passé (l'annulation se construit avec l'inscription LUE dans la file, pas avec une copie d'avant).
     * `controle(liste)` : un motif de refus, ou null.
     */
    async function _ajouterAuStock(entrees, geste, controle) {
        let refus = null;
        const ecrite = await modifierEtAnnoncer(cle(CLE), (lues) => {
            const liste = Array.isArray(lues) ? lues : [];
            refus = controle ? controle(liste) : null;
            if (refus) return undefined;
            return ajouter(liste, typeof entrees === 'function' ? entrees() : entrees);
        }, [], { geste: geste }).catch(() => undefined);   // non discret : « Enregistré », et le codex le sait
        if (refus) return { ok: false, motif: refus };
        return { ok: ecrite !== undefined };
    }

    /**
     * Inscrit un ou plusieurs niveaux (un geste « inscrire pour une production » en écrit plusieurs, qui partagent la
     * production, la date et l'horodatage). Chaque saisie a déjà passé `motifsRefus`.
     * @param {Array<Object>} saisies - { da, ensembleId, cibleId, niveau, echelleId, date, productionId, noteBreve, criteres }
     * @param {{geste?:string}} [options]
     * @returns {Promise<{ok:boolean, entrees?:Array}>}
     */
    async function inscrire(saisies, options) {
        const liste = (Array.isArray(saisies) ? saisies : [saisies]).filter(Boolean);
        if (liste.length === 0) return { ok: false };
        const horodatage = new Date().toISOString();
        const entrees = liste.map(s => construireInscription(Object.assign({}, s, { id: nouvelId(), horodatage })));
        const r = await _ajouterAuStock(entrees, (options && options.geste) || 'Inscrire un niveau');
        return r.ok ? { ok: true, entrees } : r;
    }

    /**
     * Annule une inscription : ajoute une entrée d'annulation (datée d'aujourd'hui, raison facultative). L'inscription
     * reste telle quelle. Refus, sans rien écrire : inscription introuvable, ou déjà annulée.
     * @returns {Promise<{ok:boolean, motif?:string, entree?:Object}>}
     */
    async function annuler(inscriptionId, raison, options) {
        const maintenant = new Date();
        let entree = null;
        const r = await _ajouterAuStock(() => entree, (options && options.geste) || 'Annuler une inscription', (lues) => {
            const visee = lues.find(e => estInscription(e) && e.id === inscriptionId);
            if (!visee) return MOTIFS.INTROUVABLE;
            if (annulationsParInscription(lues).has(inscriptionId)) return MOTIFS.DEJA_ANNULEE;
            entree = construireAnnulation({ id: nouvelId(), inscription: visee, date: dateDuJour(maintenant),
                horodatage: maintenant.toISOString(), raison: raison });
            return null;
        });
        return r.ok ? { ok: true, entree } : r;
    }

    window.InscriptionsCibles = {
        CLE: CLE,
        INSCRIPTION: INSCRIPTION,
        ANNULATION: ANNULATION,
        LONGUEUR_NOTE_BREVE: LONGUEUR_NOTE_BREVE,
        LONGUEUR_RAISON: LONGUEUR_RAISON,
        MOTIFS: MOTIFS,
        ORIGINES: ORIGINES,
        lireOrigine: lireOrigine,
        aUnCritereRenseigne: aUnCritereRenseigne,
        // 24 nov. 2026 : les tampons d'observation
        construireTampons: construireTampons,
        lireTampons: lireTampons,
        aUnTampon: aUnTampon,
        estUneRemarque: estUneRemarque,
        rapprocherTampons: rapprocherTampons,
        vusALaDate: vusALaDate,
        dejaInscritALaDate: dejaInscritALaDate,   // 24 nov. 2026 : la ligne « Déjà inscrit aujourd'hui » de l'écran d'observation
        dateDuJour: dateDuJour,
        dateValide: dateValide,
        lireRespecte: lireRespecte,
        lireNiveau: lireNiveau,
        estSansNiveau: estSansNiveau,
        etatDesCriteres: etatDesCriteres,
        compterCriteres: compterCriteres,
        construireInscription: construireInscription,
        construireAnnulation: construireAnnulation,
        codesDeLEchelle: codesDeLEchelle,
        motifsRefus: motifsRefus,
        annulationsParInscription: annulationsParInscription,
        historiqueDeLaCase: historiqueDeLaCase,
        compterParCible: compterParCible,
        ciblesRetireesInscrites: ciblesRetireesInscrites,
        questionRetraitCibles: questionRetraitCibles,
        ciblesOffertes: ciblesOffertes,
        // 25 nov. 2026, lot 3 : les tampons d'observation posés sur une production, LUS (rien n'est écrit)
        instantDeLaPose: instantDeLaPose,
        tracesDesProductions: tracesDesProductions,
        tamponsDeLaProduction: tamponsDeLaProduction,
        cibleUnique: cibleUnique,
        estInscritePourLaProduction: estInscritePourLaProduction,
        tracesEnDirectSousLaCible: tracesEnDirectSousLaCible,
        plusRecenteDAbord: plusRecenteDAbord,
        ajouter: ajouter,
        lireToutes: lireToutes,
        inscrire: inscrire,
        annuler: annuler
    };
})();
