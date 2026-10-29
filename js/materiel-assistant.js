/**
 * materiel-assistant.js — « Apporter mon matériel », lot 2 : la LOGIQUE de la création, en fonctions
 * pures — ce qui manque avant de créer (`calculs`), et les objets neufs (`construire`).
 *
 * Consigne : `plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-2.md`.
 * Référence de comportement : le prototype validé (`PROTOTYPE-2026-10-16-…dc.html`), sa fonction `calculs`.
 *
 * Module de FONCTIONS PURES : aucun stockage, aucun DOM. Le modèle (chaque valeur est une paire
 * `{ valeur, etat }`) vient de la dissection (`materielDissectionLecture.modele`) ; `materielCreation`
 * fait les écritures.
 *
 * ⚰ 19 oct. 2026 (`CONSIGNE-LOT-2026-10-19-retrait-ancien-assistant.md`) : l'assistant en sept étapes est
 * retiré, et avec lui ce qu'il était seul à appeler ici — ses étapes (`preparer`, `etapesPour`,
 * `recalculerEtapes`) et les gestes qui changeaient la forme du modèle (« Ramener à 100 % », ajouter un
 * critère ou un niveau, placer, écarter, annuler un passage, choisir la nature, le sens, un rôle). Le nom
 * du fichier reste : la dissection et la création l'appellent `materielAssistant`.
 *
 * ⚠ Écart à la consigne, décidé par Grégoire le 17 oct. 2026 : la consigne supposait qu'un
 * niveau sans `valeurCalcul` prend le milieu de sa plage à l'évaluation. Mesuré : faux depuis
 * #527 (`valeurNumeriqueDuNiveau` rend null, le critère sort du total, la note reste vide).
 * La note retenue de chaque niveau est donc DEMANDÉE (`calculs`), vide au départ, rien de proposé.
 *
 * Étape 5 du plan « prêt pour lundi » (`CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5-points.md`) :
 * une grille EN POINTS (`m.enPoints`, aucune colonne de niveau) se crée SEULE :
 * critères analytiques, le maximum de chacun est sa pondération ; ni échelle ni cartouche (#941 :
 * une grille entièrement en points se note sans échelle).
 */
(function () {
    'use strict';

    var A = {};

    /** Bornes des schémas de partage (`partage-schemas.js`) : ce qui ne voyagerait pas ne se crée pas. */
    A.MAX_NIVEAUX = 20;      // #1091 : `maxCles` des descripteurs
    A.MAX_CRITERES = 50;
    A.MAX_NOM = 200;
    A.MAX_CASE = 5000;
    A.MAX_SOUS_CRITERES = 30;   // `sousCriteres`, max 30, noms de 200 caractères au plus
    A.MAX_DESCRIPTION = 2000;
    A.MAX_CODE = 4;

    A.NOMS_ETAPES = {
        axes: 'Sens du tableau', roles: 'Ce que contient ton tableau', nature: 'Nature des cases', valeurs: 'Plages de notes',
        pond: 'Pondération', points: 'Points', classer: 'À classer', final: 'Vérification'
    };

    /** Étape 5 : les points d'un critère, un entier de 0 à 100 (borne du partage, `partage-schemas.js`).
     *  Étape 5b : « / 0 » accepté (`_pourcentageDesPoints` écarte une pondération 0 sans erreur). */
    A.MIN_POINTS = 0;
    A.MAX_POINTS = 100;

    A.estEnPoints = function (m) { return !!(m && m.enPoints); };

    /**
     * Couleurs des niveaux, du plus haut au plus bas : celles de l'éditeur d'échelles
     * (`echelles.js`, quatre niveaux par défaut, puis sa palette de rotation). En hexadécimal :
     * l'aperçu d'une échelle y colle un canal alpha (`couleur + '20'`).
     */
    A.COULEURS = ['#27ae60', '#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];

    function texte(p) { return String(p && p.valeur != null ? p.valeur : '').trim(); }

    /** « 12,5 », « 85 % » → 12.5, 85 ; tout le reste → NaN (jamais un zéro inventé). */
    A.nombre = function (v) {
        var s = String(v == null ? '' : v).replace(/\s|%/g, '').replace(',', '.');
        return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
    };

    A.etatSaisi = function (v) { return String(v == null ? '' : v).trim() ? 'saisi' : 'remplir'; };

    // ------------------------------------------------------------------
    // 1. LES VÉRIFICATIONS (rien de bloquant n'est silencieux)
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
        manquantsCodes(m, out);
        if (m.niveaux.length > A.MAX_NIVEAUX) {
            out.push('au plus ' + A.MAX_NIVEAUX + ' niveaux (ta grille en a ' + m.niveaux.length + ')');
        }
    }

    /**
     * Lot 3a : les codes se corrigent. Requis, 1 à 4 caractères, sans souligné (la cartouche
     * les colle à l'identifiant du critère par un `_`), uniques sans tenir compte de la casse.
     * Textes PROVISOIRES (Claude Code, 17 oct.), relus en 3b.
     */
    function manquantsCodes(m, out) {
        var codes = m.niveaux.map(function (n) { return texte(n.code); });
        var sans = codes.filter(function (c) { return !c; }).length;
        if (sans) out.push(compte(sans, 'le code d’un niveau', 'le code de # niveaux'));
        var invalides = codes.filter(function (c) { return c && (c.length > A.MAX_CODE || c.indexOf('_') >= 0); }).length;
        if (invalides) out.push(compte(invalides, 'un code de 1 à 4 caractères, sans « _ », pour un niveau', 'un code de 1 à 4 caractères, sans « _ », pour # niveaux'));
        var vus = {}, doubles = [];
        codes.forEach(function (c) {
            if (!c) return;
            var k = c.toUpperCase();
            if (vus[k] === 1) doubles.push(c);
            vus[k] = (vus[k] || 0) + 1;
        });
        if (doubles.length) {
            var liste = doubles.map(function (c) { return '« ' + c + ' »'; }).join(', ');
            out.push(doubles.length === 1 && vus[doubles[0].toUpperCase()] === 2
                ? 'un code différent pour chaque niveau (deux niveaux ont le même code : ' + liste + ')'
                : 'un code différent pour chaque niveau (des niveaux ont le même code : ' + liste + ')');
        }
    }

    function manquantsCriteres(m, out) {
        var sansNom = m.criteres.filter(function (c) { return !texte(c.nom); }).length;
        if (sansNom) out.push(compte(sansNom, 'le nom d’un critère', 'le nom de # critères'));
        var ponds = m.criteres.map(function (c) { return A.nombre(c.ponderation.valeur); });
        var sansPond = ponds.filter(isNaN).length;
        if (A.estEnPoints(m)) manquantsPoints(m, ponds, sansPond, out);
        else {
            if (sansPond) out.push(compte(sansPond, 'la pondération d’un critère', 'la pondération de # critères'));
            // L'application lit la pondération en entier (`parseInt`, grilles.js) : 12,5 deviendrait 12 en silence.
            var nonEntieres = ponds.filter(function (p) { return !isNaN(p) && (!Number.isInteger(p) || p < 0 || p > 100); }).length;
            if (nonEntieres) out.push(compte(nonEntieres, 'une pondération en nombre entier de 0 à 100 pour un critère', 'une pondération en nombre entier de 0 à 100 pour # critères'));
        }
        if (m.criteres.length > A.MAX_CRITERES) out.push('au plus ' + A.MAX_CRITERES + ' critères (ta grille en a ' + m.criteres.length + ')');
        var longs = m.criteres.some(function (c) { return texte(c.nom).length > A.MAX_NOM; });
        if (longs) out.push('des noms de critères plus courts (' + A.MAX_NOM + ' caractères au plus)');
        var casesLongues = m.criteres.some(function (c) { return c.cases.some(function (d) { return texte(d).length > A.MAX_CASE; }); });
        if (casesLongues) out.push('des cases plus courtes (5 000 caractères au plus)');
        var tropSous = m.criteres.some(function (c) { return (c.sousCriteres || []).length > A.MAX_SOUS_CRITERES; });
        if (tropSous) out.push('au plus ' + A.MAX_SOUS_CRITERES + ' sous-critères par critère');
        var sousLongs = m.criteres.some(function (c) { return (c.sousCriteres || []).some(function (t) { return t.length > A.MAX_NOM; }); });
        if (sousLongs) out.push('des sous-critères plus courts (' + A.MAX_NOM + ' caractères au plus)');
        var descLongue = m.criteres.some(function (c) { return texte(c.description).length > A.MAX_DESCRIPTION; });
        if (descLongue) out.push('des descriptions de critère plus courtes (2 000 caractères au plus)');
    }

    /**
     * Étape 5 : les points d'une grille en points. Il ne manque quelque chose que s'il n'y a ni
     * niveau ni points ; un point non entier, négatif ou au-delà de 100 bloque (comme au lot 2).
     * Textes PROVISOIRES (Claude Code, 17 oct.), relus à l'étape 7.
     */
    function manquantsPoints(m, ponds, sans, out) {
        if (sans && sans === m.criteres.length) out.push('les points de chaque critère, ou des colonnes de niveaux, à l’étape « Ce que contient ton tableau »');
        else if (sans) out.push(compte(sans, 'les points d’un critère', 'les points de # critères'));
        var hors = ponds.filter(function (p) { return !isNaN(p) && (!Number.isInteger(p) || p < A.MIN_POINTS || p > A.MAX_POINTS); }).length;
        if (hors) out.push(compte(hors, 'des points en nombre entier de 0 à 100 pour un critère', 'des points en nombre entier de 0 à 100 pour # critères'));
    }

    /**
     * Étape 5b (point 4) : les niveaux d'une grille en points ne gardent que leur NOM, qui range les
     * descripteurs (`construireGrilleEnPoints`) : requis, unique (sans tenir compte de la casse), sans
     * « _ » en tête (clé refusée au partage). Ni plage, ni note retenue, ni code. Textes PROVISOIRES (étape 7).
     */
    function manquantsNiveauxPoints(m, out) {
        var titres = m.niveaux.map(function (n) { return texte(n.titre); });
        var sans = titres.filter(function (t) { return !t; }).length;
        if (sans) out.push(compte(sans, 'le nom d’un niveau', 'le nom de # niveaux'));
        var vus = {}, doubles = 0;
        titres.forEach(function (t) {
            if (!t) return;
            var k = t.toLowerCase();
            if (vus[k]) doubles++;
            vus[k] = true;
        });
        if (doubles) out.push('un nom différent pour chaque niveau');
        if (titres.some(function (t) { return t.charAt(0) === '_'; })) out.push('un nom de niveau qui ne commence pas par « _ »');
        if (m.niveaux.length > A.MAX_NIVEAUX) out.push('au plus ' + A.MAX_NIVEAUX + ' niveaux (ta grille en a ' + m.niveaux.length + ')');
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
        (m.manquesLecture || []).forEach(function (t) { manquants.push(t); });
        if (A.estEnPoints(m)) manquantsNiveauxPoints(m, manquants);   // aucun niveau (étape 5), ou leurs noms seuls (5b)
        else manquantsNiveaux(m, manquants);
        manquantsCriteres(m, manquants);
        var enAttente = m.aClasser.filter(function (a) { return a.statut === 'attente'; }).length;
        if (enAttente) manquants.push(compte(enAttente, 'un passage à classer ou à écarter', '# passages à classer ou à écarter'));

        var ponds = m.criteres.map(function (c) { return A.nombre(c.ponderation.valeur); });
        var total = Math.round(ponds.filter(function (p) { return !isNaN(p); }).reduce(function (s, p) { return s + p; }, 0) * 10) / 10;
        var toutesPonds = m.criteres.length > 0 && !ponds.some(isNaN);
        // Étape 5 : le total des points est libre (une grille sur 64 est juste) : ni avertissement ni « Ramener à 100 % ».
        var avertPond = !A.estEnPoints(m) && toutesPonds && total !== 100;
        return {
            manquants: manquants, total: total, enAttente: enAttente,
            avertPond: avertPond, peutRamener: avertPond && total > 0,
            avertPlages: avertissementPlages(m), avertNotes: avertissementNotes(m)
        };
    };

    /** Textes du prototype : chevauchement, ou trou de plus d'un point entre deux plages. */
    function avertissementPlages(m) {
        var plages = m.niveaux.filter(plageValide).map(function (n) {
            return { t: texte(n.titre) || 'sans nom', lo: A.nombre(n.min.valeur), hi: A.nombre(n.max.valeur) };
        }).sort(function (a, b) { return a.lo - b.lo; });
        for (var q = 1; q < plages.length; q++) {
            var a = plages[q - 1], b = plages[q];
            if (b.lo <= a.hi) return 'Les plages « ' + a.t + ' » et « ' + b.t + ' » se chevauchent (' + formaterNombre(a.hi) + ' et ' + formaterPourcentage(b.lo) + ') : une même note tomberait dans deux niveaux. Il pourrait être utile de les ajuster.';
            if (b.lo - a.hi > 1) return 'Il y a un trou entre « ' + a.t + ' » (jusqu’à ' + formaterPourcentage(a.hi) + ') et « ' + b.t + ' » (dès ' + formaterPourcentage(b.lo) + ') : certaines notes ne tomberaient dans aucun niveau. Il pourrait être utile de les ajuster.';
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
        return 'La note retenue de « ' + (texte(hors.titre) || 'sans nom') + ' » (' + formaterPourcentage(A.nombre(hors.note.valeur)) + ') est hors de sa plage : il pourrait être utile de la vérifier.';
    }

    // ------------------------------------------------------------------
    // 2. CONSTRUIRE : du modèle aux trois objets NEUFS
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
                    code: texte(n.code), nom: texte(n.titre), description: '',
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
        c.cases.forEach(function (d, j) { if (texte(d)) par[texte(m.niveaux[j].code)] = texte(d); });
        return par;
    }

    /**
     * La dissection : la description de la grille (`m.description`), quand il y en a une, va dans la
     * grille, comme celle de l'éditeur — en points (lot 2a) comme en niveaux (lot 2b). Les modèles de
     * l'assistant n'en ont pas : ce qu'il produit pour eux ne change pas.
     */
    function construireGrille(m, ctx, nomGrille, echelleId) {
        var g = Object.assign(base(ctx, 'GRILLE_', nomGrille), {
            criteres: m.criteres.map(function (c) {
                // Lot 3a : la forme d'un critère créé à la main (`grilles.js`, « Créer l'objet
                // critère »), avec ses défauts ; le type reste holistique (lot 2).
                // La dissection, lot 9 : une pondération absente s'écrit `null`, la même valeur en IndexedDB et
                // en localStorage (NaN y devenait `null` d'un côté, restait NaN de l'autre). L'assistant ne crée
                // jamais sans pondération : pour lui, rien ne change.
                var pond = A.nombre(c.ponderation.valeur);
                var cr = {
                    id: ctx.id('CR_'), nom: texte(c.nom), description: texte(c.description),
                    ponderation: isNaN(pond) ? null : pond, type: 'holistique', formule: '',
                    // #1117 (19 oct. 2026, Grégoire, 22 h 02) : « aucun » DANS TOUS LES CAS — la
                    // dissection ne choisit pas la complexité SOLO à la place de l'enseignant.
                    // Le critère compte dans la note, le dépistage le saute, comme à la main.
                    niveauSOLO: 'aucun', verrouille: false
                };
                // La dissection, lot 9b : la marque « à compléter », que lit la garde de la note (`calculerPortee`).
                if (isNaN(pond)) cr.ponderationACompleter = true;
                // La forme de l'éditeur (`grilles.js`, `ajouterSousCritere`), dans l'ordre des lignes.
                // Absent si aucun, comme un critère de l'éditeur sans sous-critère.
                var sous = (c.sousCriteres || []).filter(Boolean);
                if (sous.length) {
                    cr.sousCriteres = sous.map(function (nom, k) {
                        return { id: ctx.id('SC_'), code: String(k), nom: nom, ponderation: 1.0, retroaction: '' };
                    });
                }
                var par = textesParNiveau(m, c);
                // Les descripteurs vivent dans la grille (décision 2 du cadrage), liés à l'échelle créée avec eux.
                if (Object.keys(par).length) cr.descripteurs = { echelleId: echelleId, parNiveau: par };
                return cr;
            })
        });
        if (texte(m.description)) g.description = texte(m.description);
        return g;
    }

    /**
     * Étape 5 : la grille en points. `type: 'analytique'` sur la grille et sur chaque critère, dont
     * la pondération est le maximum de points (`evaluation-calcul.js`, « le maximum EST la
     * pondération ») ; le reste de la forme, celle de l'éditeur (lot 3a).
     * #1125 (22 oct. 2026, geste 2 du barème) : des niveaux nommés deviennent les tranches du BARÈME
     * (`js/bareme.js`) : une par niveau qui porte un texte ou des points, le NOM du niveau pour nom, ses
     * points (`pointsParCase` de la dissection) en nombres, `null` sans points (« à compléter »), son
     * texte sans la ligne des points. Remplace l'ancien `parNiveau` rangé sous le nom du niveau, dont
     * les points restaient dans le texte. La nature des cases ne joue pas : il n'y a pas de cartouche
     * sans échelle.
     * La dissection, lot 2a : un critère qui porte ses réponses sans niveaux (`parCle`, une clé par
     * réponse, `materielDissectionLecture.modele`) les range telles quelles : la clé porte les points,
     * et `bareme.lireCle` les lit (pas de barème écrit ici : aucun symptôme, #1125).
     */
    function construireGrilleEnPoints(m, ctx, nomGrille) {
        var g = construireGrille(m, ctx, nomGrille, null);
        g.type = 'analytique';
        g.criteres.forEach(function (c, i) {
            c.type = 'analytique';
            delete c.descripteurs;
            var mc = m.criteres[i];
            if (mc.parCle) {
                var par = {};
                mc.parCle.forEach(function (x) { if (String(x.texte).trim()) par[x.cle] = String(x.texte).trim(); });
                if (Object.keys(par).length) c.descripteurs = { parNiveau: par };
                return;
            }
            var tranches = [];
            mc.cases.forEach(function (d, j) {
                var pts = (mc.pointsParCase && mc.pointsParCase[j]) || null;
                if (!m.niveaux[j] || (!texte(d) && !pts)) return;
                tranches.push({ id: ctx.id('TR_'), nom: texte(m.niveaux[j].titre),
                    pointsMin: pts ? pts[0] : null, pointsMax: pts ? pts[1] : null, texte: texte(d) });
            });
            if (tranches.length) c.bareme = tranches;
        });
        return g;
    }

    /**
     * Les objets NEUFS, dans l'ordre d'écriture : échelle, grille. Une grille en points : la grille seule
     * (échelle null). #1152, lot 5 (29 oct. 2026) : la branche des rétroactions de l'ancien assistant
     * (`estRetro`, `construireCartouche`) est retirée — l'étiquetage ne pose jamais que `'descripteurs'`.
     * @param {Object} m - un modèle complet (`calculs(m).manquants` vide)
     * @param {{id: function(string): string, maintenant: string, auteur?: string,
     *          metadataCc?: Object, nomsEchelles?: string[]}} ctx
     */
    A.construire = function (m, ctx) {
        var nomGrille = texte(m.nom);
        if (A.estEnPoints(m)) return { echelle: null, grille: construireGrilleEnPoints(m, ctx, nomGrille) };
        var echelle = construireEchelle(m, ctx, nomGrille);
        return { echelle: echelle, grille: construireGrille(m, ctx, nomGrille, echelle.id) };
    };

    window.materielAssistant = A;
})();
