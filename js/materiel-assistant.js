/**
 * materiel-assistant.js — « Apporter mon matériel », lot 2 : la LOGIQUE de l'assistant et de
 * la création, en fonctions pures.
 *
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-2.md`.
 * Référence de comportement : le prototype validé (`PROTOTYPE-2026-10-16-…dc.html`), ses
 * fonctions `etapesPour` et `calculs`.
 *
 * Module de FONCTIONS PURES : aucun stockage, aucun DOM. Le modèle est celui que produit
 * `materielLecture` (chaque valeur est une paire `{ valeur, etat }`) ; les opérations qui le
 * changent de forme rendent une COPIE. `materiel.js` branche la page et fait les écritures.
 *
 * ⚠ Écart à la consigne, décidé par Grégoire le 17 oct. 2026 : la consigne supposait qu'un
 * niveau sans `valeurCalcul` prend le milieu de sa plage à l'évaluation. Mesuré : faux depuis
 * #527 (`valeurNumeriqueDuNiveau` rend null, le critère sort du total, la note reste vide).
 * L'assistant DEMANDE donc la note retenue de chaque niveau, vide au départ, rien de proposé.
 */
(function () {
    'use strict';

    var A = {};

    /** Bornes des schémas de partage (`partage-schemas.js`) : ce qui ne voyagerait pas ne se crée pas. */
    A.MAX_NIVEAUX = 20;      // #1091 : `maxCles` des descripteurs
    A.MAX_CRITERES = 50;
    A.MAX_NOM = 200;
    A.MAX_CASE = 5000;

    A.NOMS_ETAPES = {
        axes: 'Sens du tableau', nature: 'Nature des cases', valeurs: 'Plages de notes',
        pond: 'Pondération', classer: 'À classer', final: 'Vérification'
    };

    /**
     * Couleurs des niveaux, du plus haut au plus bas : celles de l'éditeur d'échelles
     * (`echelles.js`, quatre niveaux par défaut, puis sa palette de rotation). En hexadécimal :
     * l'aperçu d'une échelle y colle un canal alpha (`couleur + '20'`).
     */
    A.COULEURS = ['#27ae60', '#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];

    function paire(valeur, etat) { return { valeur: valeur, etat: etat }; }
    function copie(m) { return JSON.parse(JSON.stringify(m)); }
    function texte(p) { return String(p && p.valeur != null ? p.valeur : '').trim(); }

    /** « 12,5 », « 85 % » → 12.5, 85 ; tout le reste → NaN (jamais un zéro inventé). */
    A.nombre = function (v) {
        var s = String(v == null ? '' : v).replace(/\s|%/g, '').replace(',', '.');
        return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
    };

    A.etatSaisi = function (v) { return String(v == null ? '' : v).trim() ? 'saisi' : 'remplir'; };

    /** Ajoute au modèle ce que la lecture ne produit pas : la note retenue de chaque niveau. */
    A.preparer = function (m) {
        var n = copie(m);
        n.niveaux.forEach(function (niv) { if (!niv.note) niv.note = paire('', 'remplir'); });
        return n;
    };

    // ------------------------------------------------------------------
    // 1. LES ÉTAPES
    // ------------------------------------------------------------------

    function aDuTexte(m) {
        return m.criteres.some(function (c) { return c.cases.some(function (d) { return texte(d); }); });
    }

    function niveauARegler(n) {
        return n.min.etat !== 'repris' || n.max.etat !== 'repris' || !texte(n.note);
    }

    /** Les étapes, sautées si déjà réglées (prototype, `etapesPour`). */
    A.etapesPour = function (m) {
        if (m.source === 'main') return ['final'];
        var e = ['axes'];
        if (aDuTexte(m)) e.push('nature');
        if (m.niveaux.some(niveauARegler)) e.push('valeurs');
        if (m.criteres.some(function (c) { return c.ponderation.etat !== 'repris'; })) e.push('pond');
        if (m.aClasser.length) e.push('classer');
        e.push('final');
        return e;
    };

    /** Après une inversion : la liste se recalcule, l'étape courante est gardée si elle existe encore. */
    A.recalculerEtapes = function (m, anciennes, index) {
        var etapes = A.etapesPour(m);
        var k = etapes.indexOf(anciennes[index]);
        return { etapes: etapes, etape: k >= 0 ? k : 0 };
    };

    // ------------------------------------------------------------------
    // 2. LES VÉRIFICATIONS (rien de bloquant n'est silencieux)
    // ------------------------------------------------------------------

    function compte(n, un, plusieurs) { return n === 1 ? un : plusieurs.replace('#', n); }

    function plageValide(n) {
        var lo = A.nombre(n.min.valeur), hi = A.nombre(n.max.valeur);
        return !isNaN(lo) && !isNaN(hi) && lo <= hi;
    }

    function manquantsNiveaux(m, out) {
        var sansTitre = m.niveaux.filter(function (n) { return !texte(n.titre); }).length;
        if (sansTitre) out.push(compte(sansTitre, 'le nom d’un niveau', 'le nom de # niveaux'));
        var sansPlage = m.niveaux.filter(function (n) { return !plageValide(n); }).length;
        if (sansPlage) out.push(compte(sansPlage, 'la plage de notes d’un niveau', 'la plage de notes de # niveaux'));
        var sansNote = m.niveaux.filter(function (n) { return isNaN(A.nombre(n.note && n.note.valeur)); }).length;
        if (sansNote) out.push(compte(sansNote, 'la note retenue d’un niveau', 'la note retenue de # niveaux'));
        if (m.niveaux.length > A.MAX_NIVEAUX) {
            out.push('au plus ' + A.MAX_NIVEAUX + ' niveaux (ta grille en a ' + m.niveaux.length + ')');
        }
    }

    function manquantsCriteres(m, out) {
        var sansNom = m.criteres.filter(function (c) { return !texte(c.nom); }).length;
        if (sansNom) out.push(compte(sansNom, 'le nom d’un critère', 'le nom de # critères'));
        var ponds = m.criteres.map(function (c) { return A.nombre(c.ponderation.valeur); });
        var sansPond = ponds.filter(isNaN).length;
        if (sansPond) out.push(compte(sansPond, 'la pondération d’un critère', 'la pondération de # critères'));
        // L'application lit la pondération en entier (`parseInt`, grilles.js) : 12,5 deviendrait 12 en silence.
        var nonEntieres = ponds.filter(function (p) { return !isNaN(p) && (!Number.isInteger(p) || p < 0 || p > 100); }).length;
        if (nonEntieres) out.push(compte(nonEntieres, 'une pondération en nombre entier de 0 à 100 pour un critère', 'une pondération en nombre entier de 0 à 100 pour # critères'));
        if (m.criteres.length > A.MAX_CRITERES) out.push('au plus ' + A.MAX_CRITERES + ' critères (ta grille en a ' + m.criteres.length + ')');
        var longs = m.criteres.some(function (c) { return texte(c.nom).length > A.MAX_NOM; });
        if (longs) out.push('des noms de critères plus courts (' + A.MAX_NOM + ' caractères au plus)');
        var casesLongues = m.criteres.some(function (c) { return c.cases.some(function (d) { return texte(d).length > A.MAX_CASE; }); });
        if (casesLongues) out.push('des cases plus courtes (5 000 caractères au plus)');
    }

    /**
     * Ce qui manque avant de créer, le total, et les avertissements (au conditionnel, non bloquants).
     * @param {Object} m
     * @param {{nomsGrilles?: string[]}} [contexte] - les noms des grilles déjà dans le trimestre
     */
    A.calculs = function (m, contexte) {
        var manquants = [];
        var nom = texte(m.nom);
        var noms = ((contexte && contexte.nomsGrilles) || []).map(function (s) { return String(s).trim().toLowerCase(); });
        if (!nom) manquants.push('le nom de la grille');
        else if (nom.length > A.MAX_NOM) manquants.push('un nom de grille plus court (' + A.MAX_NOM + ' caractères au plus)');
        else if (noms.indexOf(nom.toLowerCase()) >= 0) manquants.push('un autre nom de grille : « ' + nom + ' » existe déjà dans ce trimestre');
        manquantsNiveaux(m, manquants);
        manquantsCriteres(m, manquants);
        var enAttente = m.aClasser.filter(function (a) { return a.statut === 'attente'; }).length;
        if (enAttente) manquants.push(compte(enAttente, 'un passage à classer ou à écarter', '# passages à classer ou à écarter'));

        var ponds = m.criteres.map(function (c) { return A.nombre(c.ponderation.valeur); });
        var total = Math.round(ponds.filter(function (p) { return !isNaN(p); }).reduce(function (s, p) { return s + p; }, 0) * 10) / 10;
        var toutesPonds = m.criteres.length > 0 && !ponds.some(isNaN);
        var avertPond = toutesPonds && total !== 100;
        return {
            manquants: manquants, total: total, enAttente: enAttente,
            avertPond: avertPond, peutRamener: avertPond && total > 0,
            avertPlages: avertissementPlages(m), avertNotes: avertissementNotes(m)
        };
    };

    function fmt(x) { return String(x).replace('.', ','); }

    /** Textes du prototype : chevauchement, ou trou de plus d'un point entre deux plages. */
    function avertissementPlages(m) {
        var plages = m.niveaux.filter(plageValide).map(function (n) {
            return { t: texte(n.titre) || 'sans nom', lo: A.nombre(n.min.valeur), hi: A.nombre(n.max.valeur) };
        }).sort(function (a, b) { return a.lo - b.lo; });
        for (var q = 1; q < plages.length; q++) {
            var a = plages[q - 1], b = plages[q];
            if (b.lo <= a.hi) return 'Les plages « ' + a.t + ' » et « ' + b.t + ' » se chevauchent (' + fmt(a.hi) + ' et ' + fmt(b.lo) + ' %) : une même note tomberait dans deux niveaux. Il pourrait être utile de les ajuster.';
            if (b.lo - a.hi > 1) return 'Il y a un trou entre « ' + a.t + ' » (jusqu’à ' + fmt(a.hi) + ' %) et « ' + b.t + ' » (dès ' + fmt(b.lo) + ' %) : certaines notes ne tomberaient dans aucun niveau. Il pourrait être utile de les ajuster.';
        }
        return '';
    }

    /** Texte provisoire (Claude Code, 17 oct.) : une note retenue hors de la plage de son niveau. */
    function avertissementNotes(m) {
        var hors = m.niveaux.filter(function (n) {
            var v = A.nombre(n.note && n.note.valeur);
            return plageValide(n) && !isNaN(v) && (v < A.nombre(n.min.valeur) || v > A.nombre(n.max.valeur));
        })[0];
        if (!hors) return '';
        return 'La note retenue de « ' + (texte(hors.titre) || 'sans nom') + ' » (' + fmt(A.nombre(hors.note.valeur)) + ' %) est hors de sa plage : il pourrait être utile de la vérifier.';
    }

    // ------------------------------------------------------------------
    // 3. CE QUI CHANGE LA FORME DU MODÈLE (rend une copie)
    // ------------------------------------------------------------------

    /**
     * « Ramener à 100 % » : conversion proportionnelle en entiers qui totalisent 100, par la
     * méthode des plus grands restes (à égalité, l'ordre du tableau). Rien ne se convertit sans
     * ce geste. Sans effet si une pondération manque ou si le total est nul.
     */
    A.ramenerA100 = function (m) {
        var ponds = m.criteres.map(function (c) { return A.nombre(c.ponderation.valeur); });
        var total = ponds.reduce(function (s, p) { return s + p; }, 0);
        if (!ponds.length || ponds.some(isNaN) || !(total > 0)) return m;
        var bruts = ponds.map(function (p) { return p * 100 / total; });
        var entiers = bruts.map(Math.floor);
        var reste = 100 - entiers.reduce(function (s, p) { return s + p; }, 0);
        bruts.map(function (b, i) { return { i: i, r: b - entiers[i] }; })
            .sort(function (a, b) { return b.r - a.r || a.i - b.i; })
            .slice(0, reste)
            .forEach(function (x) { entiers[x.i] += 1; });
        var n = copie(m);
        n.criteres.forEach(function (c, i) { c.ponderation = paire(String(entiers[i]), 'complete'); });
        n.pondRamenee = true;
        return n;
    };

    function critereVide(m, nom, deClasser) {
        var c = {
            nom: nom ? paire(nom, 'saisi') : paire('', 'remplir'),
            ponderation: paire('', 'remplir'),
            cases: m.niveaux.map(function () { return paire('', 'vide'); })
        };
        if (deClasser != null) c.deClasser = deClasser;
        return c;
    }

    A.ajouterCritere = function (m) {
        var n = copie(m);
        n.criteres.push(critereVide(n));
        return n;
    };

    /** #1091 : au plus 20 niveaux, bornés à la saisie (les descripteurs n'en voyagent pas plus). */
    A.ajouterNiveau = function (m) {
        if (m.niveaux.length >= A.MAX_NIVEAUX) return m;
        var n = copie(m);
        n.niveaux.push({ titre: paire('', 'remplir'), min: paire('', 'remplir'), max: paire('', 'remplir'), note: paire('', 'remplir') });
        n.niveaux = window.materielLecture.coder(n.niveaux);
        n.criteres.forEach(function (c) { c.cases.push(paire('', 'vide')); });
        return n;
    };

    function passage(n, id) { return n.aClasser.filter(function (a) { return a.id === id; })[0]; }

    /** « Ajouter comme critère » : le passage devient un critère, marqué pour pouvoir l'annuler. */
    A.placer = function (m, id) {
        var n = copie(m), a = passage(n, id);
        if (!a || a.statut !== 'attente') return m;
        a.statut = 'place';
        n.criteres.push(critereVide(n, a.texte.slice(0, 120), id));
        return n;
    };

    A.ecarter = function (m, id) {
        var n = copie(m), a = passage(n, id);
        if (!a || a.statut !== 'attente') return m;
        a.statut = 'ecarte';
        return n;
    };

    /** « Annuler » : le passage revient en attente ; le critère qu'il avait fait naître repart. */
    A.annuler = function (m, id) {
        var n = copie(m), a = passage(n, id);
        if (!a) return m;
        if (a.statut === 'place') n.criteres = n.criteres.filter(function (c) { return c.deClasser !== id; });
        a.statut = 'attente';
        return n;
    };

    A.choisirNature = function (m, valeur) {
        var n = copie(m);
        n.nature = paire(valeur === 'retroactions' ? 'retroactions' : 'descripteurs', 'choisi');
        return n;
    };

    /** Le sens du tableau : une inversion (des rangées LUES, `materielLecture.inverser`) si le choix change. */
    A.choisirSens = function (m, enColonnes) {
        if (!!m.critEnColonnes === !!enColonnes || !m.lecture) return m;
        return A.preparer(window.materielLecture.inverser(m));
    };

    A.estRetro = function (m) { return !!(m.nature && m.nature.valeur === 'retroactions'); };

    // ------------------------------------------------------------------
    // 4. CONSTRUIRE : du modèle aux trois objets NEUFS
    // ------------------------------------------------------------------

    /** Un nom libre parmi `existants` : « X », sinon « X (2) », « X (3) »… */
    A.nomLibre = function (nom, existants) {
        var pris = (existants || []).map(function (s) { return String(s).trim().toLowerCase(); });
        if (pris.indexOf(nom.toLowerCase()) < 0) return nom;
        for (var k = 2; ; k++) {
            var essai = nom + ' (' + k + ')';
            if (pris.indexOf(essai.toLowerCase()) < 0) return essai;
        }
    };

    function couleurs(niveaux) {
        var rang = niveaux.map(function (n, i) { return { i: i, lo: n.min }; })
            .sort(function (a, b) { return b.lo - a.lo || a.i - b.i; });
        var out = [];
        rang.forEach(function (x, r) { out[x.i] = A.COULEURS[r % A.COULEURS.length]; });
        return out;
    }

    function construireEchelle(m, ctx, nomGrille) {
        var bornes = m.niveaux.map(function (n) { return { min: A.nombre(n.min.valeur), max: A.nombre(n.max.valeur) }; });
        var contigues = window.materielLecture.plagesContigues(bornes);
        var teintes = couleurs(bornes);
        return Object.assign(base(ctx, 'ECH_', A.nomLibre('Échelle – ' + nomGrille, ctx.nomsEchelles)), {
            description: '',
            // Aucun champ de plus que ceux de l'éditeur d'échelles ; `valeurCalcul` est la note
            // retenue SAISIE (décision du 17 oct.), jamais déduite de la plage.
            niveaux: m.niveaux.map(function (n, i) {
                return {
                    code: n.code.valeur, nom: texte(n.titre), description: '',
                    min: contigues[i].min, max: contigues[i].max,
                    valeurCalcul: A.nombre(n.note.valeur), couleur: teintes[i]
                };
            })
        });
    }

    function base(ctx, prefixe, nom) {
        var o = {
            id: ctx.id(prefixe), nom: nom, verrouille: false, isDemo: false, dansBibliotheque: true,
            dateCreation: ctx.maintenant, dateModification: ctx.maintenant
        };
        if (ctx.auteur) o.auteur = ctx.auteur;
        if (ctx.metadataCc) o.metadata_cc = JSON.parse(JSON.stringify(ctx.metadataCc));
        return o;
    }

    function textesParNiveau(m, c) {
        var par = {};
        c.cases.forEach(function (d, j) { if (texte(d)) par[m.niveaux[j].code.valeur] = texte(d); });
        return par;
    }

    function construireGrille(m, ctx, nomGrille, echelleId) {
        var retro = A.estRetro(m);
        return Object.assign(base(ctx, 'GRILLE_', nomGrille), {
            criteres: m.criteres.map(function (c) {
                var cr = { id: ctx.id('CR_'), nom: texte(c.nom), ponderation: A.nombre(c.ponderation.valeur), type: 'holistique' };
                var par = textesParNiveau(m, c);
                // Les descripteurs vivent dans la grille (décision 2 du cadrage), liés à l'échelle créée avec eux.
                if (!retro && Object.keys(par).length) cr.descripteurs = { echelleId: echelleId, parNiveau: par };
                return cr;
            })
        });
    }

    /** La cartouche, seulement pour des rétroactions, et seulement s'il y a au moins un texte. */
    function construireCartouche(m, ctx, nomGrille, grille, echelleId) {
        if (!A.estRetro(m)) return null;
        var commentaires = {};
        m.criteres.forEach(function (c, i) {
            var par = textesParNiveau(m, c);
            Object.keys(par).forEach(function (code) { commentaires[grille.criteres[i].id + '_' + code] = par[code]; });
        });
        if (!Object.keys(commentaires).length) return null;
        var o = Object.assign(base(ctx, 'CART_', 'Rétroactions – ' + nomGrille), {
            grilleId: grille.id, echelleId: echelleId, contexte: '', description: '',
            criteres: grille.criteres.map(function (c) { return { id: c.id, nom: c.nom }; }),
            niveaux: m.niveaux.map(function (n) { return { code: n.code.valeur, nom: texte(n.titre) }; }),
            commentaires: commentaires
        });
        delete o.isDemo;   // la forme des cartouches créées à la main (cartouches.js) n'en a pas
        return o;
    }

    /**
     * Les trois objets NEUFS, dans l'ordre d'écriture : échelle, grille, cartouche (ou null).
     * @param {Object} m - un modèle complet (`calculs(m).manquants` vide)
     * @param {{id: function(string): string, maintenant: string, auteur?: string,
     *          metadataCc?: Object, nomsEchelles?: string[]}} ctx
     */
    A.construire = function (m, ctx) {
        var nomGrille = texte(m.nom);
        var echelle = construireEchelle(m, ctx, nomGrille);
        var grille = construireGrille(m, ctx, nomGrille, echelle.id);
        return { echelle: echelle, grille: grille, cartouche: construireCartouche(m, ctx, nomGrille, grille, echelle.id) };
    };

    window.materielAssistant = A;
})();
