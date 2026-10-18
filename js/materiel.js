/**
 * materiel.js — Conception › « Apporter mon matériel » : l'accueil, l'ASSISTANT, la création
 * et la confirmation.
 *
 * Consignes : lot 1 (`CONSIGNE-LOT-2026-10-16-…-1.md`, l'accueil et la lecture), lot 2
 * (`CONSIGNE-LOT-2026-10-17-…-2.md`, l'assistant et la création). La lecture vit dans
 * `materiel-lecture.js`, la logique de l'assistant dans `materiel-assistant.js` (fonctions
 * pures). Ce module-ci rend la page, garde l'état de l'assistant en mémoire, et ÉCRIT : trois
 * objets neufs, seulement au clic « Créer ma grille ».
 *
 * Au lot 2, l'aperçu seul du lot 1 est retiré : un collage ouvre l'assistant, dont l'aperçu
 * reste visible sous chaque question.
 *
 * Sécurité (règle 1 du projet) : le HTML collé n'entre JAMAIS dans le DOM de la page ; tout
 * texte rendu ici passe par `echapperHtml()`, valeurs des champs comprises. Actions par
 * `data-action`, saisies par `data-on-input` (dispatcher de main.js) : aucun handler inline.
 *
 * Saisie : un champ modifié met le modèle à jour SANS redessiner le formulaire (le focus et
 * le curseur restent où ils sont) ; seules les zones qui en dépendent se redessinent (total,
 * avertissements, aperçu, « Ce qui sera créé »). Un geste qui change la forme (ajouter,
 * classer, inverser, changer d'étape) redessine tout et replace le focus.
 *
 * Les textes affichés sont ceux du prototype validé le 16 oct. 2026, PROVISOIRES : Grégoire
 * relit les mots au lot 3. Ceux qui n'y sont pas (la note retenue, les refus de création)
 * sont de Claude Code et le disent dans un commentaire.
 *
 * Lot 3a (`CONSIGNE-LOT-2026-10-17-…-3a-roles.md`) : l'étape « Ce que contient ton tableau »,
 * un menu de rôle au début de chaque rangée et en tête de chaque colonne ; changer un menu
 * relit la grille. Les codes de niveau se corrigent. Textes de Claude Code, PROVISOIRES (3b).
 *
 * Étape 5 du plan « prêt pour lundi » (`CONSIGNE-LOT-2026-10-17-…-5-points.md`) : une grille
 * EN POINTS (aucune colonne de niveau) a son aperçu, son étape « Points », sa Vérification
 * (Critère | Description | Points, total « sur N ») et sa confirmation (la grille seule).
 * Textes de Claude Code, PROVISOIRES (étape 7).
 *
 * La dissection, lot 1 (`CONSIGNE-LOT-2026-10-18-dissection-1-etiqueter.md`) : un collage, le texte
 * de la zone et l'exemple ouvrent la DISSECTION (`materiel-dissection.js`) ; « Taper ma grille à la
 * main » mène vers Grilles de critères. L'assistant en sept étapes est DÉBRANCHÉ, pas supprimé :
 * plus aucun geste ne l'ouvre (`charger`, `ouvrirAssistant` restent), son retrait est inscrit pour
 * après lundi. La dissection, lot 2a : sa création aboutit ici (`montrerCreee`, la confirmation).
 */
(function () {
    'use strict';

    var etat = { ecran: 'accueil', modele: null, etapes: [], etape: 0, montrerManquants: false, resume: null, erreurCreation: '', enCours: false };

    var LIBELLES_ETAT = {
        complete: 'complété par l’application',
        propose: 'proposé : à vérifier',
        remplir: 'à remplir'
    };

    function A() { return window.materielAssistant; }
    function e(v) { return echapperHtml(v); }
    function texte(p) { return String(p && p.valeur != null ? p.valeur : '').trim(); }
    function pluriel(n, un, plusieurs) { return n + ' ' + (n > 1 ? plusieurs : un); }

    /**
     * Une valeur du modèle, marquée de son état. « repris » et « saisi » sont sans marque ;
     * les autres portent un cadre (la légende) ET leur nom en toutes lettres pour les lecteurs
     * d'écran — la couleur seule ne dit rien.
     */
    function valeur(p, txt) {
        var et = (p && p.etat) || 'repris';
        var cls = 'materiel-valeur' + (LIBELLES_ETAT[et] ? ' materiel-etat-' + et : '');
        var sr = LIBELLES_ETAT[et] ? '<span class="u-lecteur-ecran"> (' + e(LIBELLES_ETAT[et]) + ')</span>' : '';
        return '<span class="' + cls + '">' + e(txt) + sr + '</span>';
    }

    function mention(et, txt) {
        return '<span class="materiel-mention materiel-mention-' + e(et) + '">' + e(txt) + '</span>';
    }

    /** La classe d'état d'un champ de saisie (cadre « à remplir » ou « complété »). */
    function classeChamp(p) {
        var et = (p && p.etat) || 'repris';
        return 'controle-form materiel-champ' + (LIBELLES_ETAT[et] ? ' materiel-etat-' + et : '');
    }

    function champ(id, chemin, p, attrs) {
        return '<input type="text" id="' + e(id) + '" class="' + classeChamp(p) + '" value="' + e(p ? p.valeur : '') + '"' +
            ' data-on-input="materiel.saisir" data-param="' + e(chemin) + '"' + (attrs || '') + '>';
    }

    function nomsGrillesDuTrimestre() {
        try {
            if (typeof db === 'undefined' || typeof cle !== 'function') return [];
            return (db.getSync(cle('grillesTemplates'), []) || []).map(function (g) { return g && g.nom; }).filter(Boolean);
        } catch (err) { return []; }
    }

    function calculs(m) { return A().calculs(m, { nomsGrilles: nomsGrillesDuTrimestre() }); }

    // ------------------------------------------------------------------
    // L'aperçu (sous chaque question), la partie concernée encadrée
    // ------------------------------------------------------------------

    /** Le code d'un niveau, tel que l'aperçu le montre. */
    function libelleCode(n) {
        var c = texte(n.code);
        if (!c) return 'code à remplir';
        return 'code ' + c + (n.code.etat === 'complete' ? ' · complété' : '');
    }

    /** Les sous-critères et la description d'un critère (lot 3a), en lecture. */
    function detailsCritereHtml(c) {
        var sous = c.sousCriteres || [];
        var h = '';
        if (texte(c.description)) h += '<span class="materiel-description">' + e(texte(c.description)) + '</span>';
        if (sous.length) {
            h += '<span class="materiel-sous-titre">' + e(pluriel(sous.length, 'sous-critère', 'sous-critères')) + '</span>' +
                '<ul class="materiel-sous-criteres">' + sous.map(function (t) { return '<li>' + e(t) + '</li>'; }).join('') + '</ul>';
        }
        return h;
    }

    function enteteNiveau(n, surligne) {
        var plageOk = texte(n.min) && texte(n.max);
        var plage = plageOk
            ? valeur(n.min, texte(n.min).replace('.', ',') + ' à ' + texte(n.max).replace('.', ',') + ' %')
            : valeur({ etat: 'remplir' }, 'plage à remplir');
        return '<th scope="col" class="materiel-col-niveau' + (surligne ? ' materiel-surligne' : '') + '">' +
            '<span class="materiel-niveau-titre">' + valeur(n.titre, texte(n.titre) || 'Niveau sans nom') + '</span>' +
            '<span class="materiel-niveau-details">' + plage +
            ' <span class="materiel-code">' + e(libelleCode(n)) + '</span></span></th>';
    }

    function mentionPonderation(m, c) {
        if (c.ponderation.etat !== 'complete') return '';
        return mention('complete', m.pondRamenee ? 'complété : ramené à 100 %' : 'complété : parts égales');
    }

    function casesHtml(c) {
        return c.cases.map(function (d) {
            return '<td>' + (texte(d) ? '<span class="materiel-case">' + e(texte(d)) + '</span>'
                : '<span class="materiel-case-vide">(case vide)</span>') + '</td>';
        }).join('');
    }

    function rangeeCritere(m, c, surlignePond) {
        var pond = texte(c.ponderation)
            ? valeur(c.ponderation, texte(c.ponderation).replace('.', ',') + ' %')
            : valeur({ etat: 'remplir' }, 'à remplir');
        var cases = casesHtml(c);
        return '<tr><th scope="row" class="materiel-col-critere">' + valeur(c.nom, texte(c.nom) || 'Critère sans nom') + detailsCritereHtml(c) + '</th>' +
            '<td class="materiel-col-pond' + (surlignePond ? ' materiel-surligne' : '') + '">' + pond + mentionPonderation(m, c) + '</td>' +
            cases + '</tr>';
    }

    function legendeHtml(titre, complete) {
        return '<div class="materiel-legende" role="note">' + (titre ? '<strong>' + e(titre) + '</strong>' : '') +
            '<span><span class="materiel-pastille" aria-hidden="true"></span>Repris de ton document</span>' +
            '<span><span class="materiel-pastille materiel-etat-complete" aria-hidden="true"></span>' + e(complete) + '</span>' +
            '<span><span class="materiel-pastille materiel-etat-remplir" aria-hidden="true"></span>À remplir</span></div>';
    }

    /**
     * L'aperçu de la grille (fonction pure). `surligne` : 'valeurs' encadre les niveaux,
     * 'pond' la colonne des pondérations. Le tableau défile dans son cadre (iPad).
     * @param {Object} m
     * @param {string} [surligne]
     */
    function apercuHtml(m, surligne) {
        if (m.enPoints) return apercuPointsHtml(m, surligne === 'points');   // sans l'assistant : l'aperçu reste une fonction pure du modèle
        return '<div class="materiel-apercu-entete"><h3 id="materiel-titre-apercu">Aperçu de ta grille</h3>' +
            legendeHtml('', 'Complété par l’application') + '</div>' +
            '<div class="materiel-apercu-cadre" role="region" aria-label="Aperçu de ta grille" tabindex="0">' +
            '<table class="materiel-apercu"><caption class="u-lecteur-ecran">' +
            e(pluriel(m.criteres.length, 'critère', 'critères') + ', ' + pluriel(m.niveaux.length, 'niveau', 'niveaux')) +
            '</caption><thead><tr><th scope="col" class="materiel-col-critere">Critère</th>' +
            '<th scope="col" class="materiel-col-pond' + (surligne === 'pond' ? ' materiel-surligne' : '') + '">Pondération</th>' +
            m.niveaux.map(function (n) { return enteteNiveau(n, surligne === 'valeurs'); }).join('') +
            '</tr></thead><tbody>' + m.criteres.map(function (c) { return rangeeCritere(m, c, surligne === 'pond'); }).join('') +
            '</tbody></table></div>';
    }

    /** Étape 5 : « sur 4 », ou « à remplir ». */
    function points(c) {
        return texte(c.ponderation) ? valeur(c.ponderation, 'sur ' + texte(c.ponderation).replace('.', ',')) : valeur({ etat: 'remplir' }, 'à remplir');
    }

    /**
     * Étape 5 : l'aperçu d'une grille en points, Critère | Points ; `surligne` encadre les points.
     * Étape 5b (point 4) : des niveaux écrits avec leurs points suivent, par leur seul nom.
     */
    function apercuPointsHtml(m, surligne) {
        return '<div class="materiel-apercu-entete"><h3 id="materiel-titre-apercu">Aperçu de ta grille</h3>' +
            legendeHtml('', 'Complété par l’application') + '</div>' +
            '<div class="materiel-apercu-cadre" role="region" aria-label="Aperçu de ta grille" tabindex="0">' +
            '<table class="materiel-apercu"><caption class="u-lecteur-ecran">' +
            e(pluriel(m.criteres.length, 'critère', 'critères') + ', en points' + (m.niveaux.length ? ', ' + pluriel(m.niveaux.length, 'niveau', 'niveaux') : '')) +
            '</caption><thead><tr><th scope="col" class="materiel-col-critere">Critère</th>' +
            '<th scope="col" class="materiel-col-pond' + (surligne ? ' materiel-surligne' : '') + '">Points</th>' +
            m.niveaux.map(function (n) {
                return '<th scope="col" class="materiel-col-niveau"><span class="materiel-niveau-titre">' + valeur(n.titre, texte(n.titre) || 'Niveau sans nom') + '</span></th>';
            }).join('') +
            '</tr></thead><tbody>' + m.criteres.map(function (c) {
                return '<tr><th scope="row" class="materiel-col-critere">' + valeur(c.nom, texte(c.nom) || 'Critère sans nom') + detailsCritereHtml(c) + '</th>' +
                    '<td class="materiel-col-pond' + (surligne ? ' materiel-surligne' : '') + '">' + points(c) + '</td>' + casesHtml(c) + '</tr>';
            }).join('') + '</tbody></table></div>';
    }

    // ------------------------------------------------------------------
    // Les zones dérivées (redessinées à chaque saisie)
    // ------------------------------------------------------------------

    function avert(txt) { return txt ? '<p class="materiel-avert" role="status">' + e(txt) + '</p>' : ''; }

    function blocPonderation(c) {
        var h = '<p class="materiel-total">Pondération totale : ' + e(String(c.total).replace('.', ',')) + ' %</p>';
        if (c.avertPond) {
            h += '<div class="materiel-avert materiel-avert-action" role="status"><span>' +
                e('La pondération totalise ' + String(c.total).replace('.', ',') + ' % : il pourrait être utile de l’ajuster à 100 %.') + '</span>' +
                (c.peutRamener ? '<button type="button" class="btn btn-secondaire" data-action="materiel.ramenerA100">Ramener à 100 %</button>' : '') +
                '</div>';
        }
        return h;
    }

    function blocAClasserRestant(c) {
        if (!c.enAttente) return '';
        var phrase = c.enAttente === 1 ? 'Il reste un passage de ton document à classer ou à écarter.'
            : 'Il reste ' + c.enAttente + ' passages de ton document à classer ou à écarter.';
        return '<div class="materiel-restant"><span>' + e(phrase) + '</span>' +
            '<button type="button" class="btn btn-secondaire" data-action="materiel.allerClasser">Y aller</button></div>';
    }

    /** Étape 5 : le total d'une grille en points, libre (ni avertissement ni « Ramener à 100 % »). */
    function blocPoints(c) {
        return '<p class="materiel-total">Total : sur ' + e(String(c.total).replace('.', ',')) + '</p>';
    }

    /** Ce que la zone `#materiel-derives` montre, selon l'étape. */
    function derivesHtml(m, id) {
        var c = calculs(m);
        if (id === 'points') return blocPoints(c);
        if (id === 'final' && A().estEnPoints(m)) return blocPoints(c) + blocAClasserRestant(c);
        if (id === 'pond') return blocPonderation(c);
        if (id === 'valeurs') return avert(c.avertPlages) + avert(c.avertNotes);
        if (id !== 'final') return '';
        return blocPonderation(c) + avert(c.avertPlages) + avert(c.avertNotes) + blocAClasserRestant(c);
    }

    function aDesTextes(m) {
        return m.criteres.some(function (c) { return c.cases.some(function (d) { return texte(d); }); });
    }

    function creeListeHtml(m) {
        if (A().estEnPoints(m)) {
            var tot = calculs(m).total;
            // Étape 5b : avec des niveaux, ce qui est attendu à chacun. Texte PROVISOIRE (étape 7).
            return '<h3>Ce qui sera créé</h3><ul><li>' +
                e('Une grille en points « ' + (texte(m.nom) || 'sans nom') + ' » (' + pluriel(m.criteres.length, 'critère', 'critères') + '), sur ' + String(tot).replace('.', ',') +
                    (aDesTextes(m) ? ', avec ce qui est attendu à chaque niveau.' : '.')) +
                '</li></ul><p class="text-muted">' + e('Aucune échelle n’est créée : la note se calcule par les points seuls. Tu retrouveras ta grille dans Grilles de critères, où tout reste modifiable.') + '</p>';
        }
        var retro = A().estRetro(m);
        var nomG = texte(m.nom) || 'sans nom';
        var nC = m.criteres.length, nN = m.niveaux.length;
        var titres = m.niveaux.map(function (n) { return texte(n.titre) || '?'; }).join(' · ');
        var lignes = [
            'Une grille de critères « ' + nomG + ' » : ' + pluriel(nC, 'critère', 'critères') + (!retro && aDesTextes(m) ? ', avec leurs descripteurs.' : '.'),
            'Une échelle de performance : ' + pluriel(nN, 'niveau', 'niveaux') + ' (' + titres + '), réutilisable pour d’autres grilles.'
        ];
        if (retro && aDesTextes(m)) lignes.push('Une cartouche de rétroaction : un commentaire par critère et par niveau, que tes étudiant·es liront après l’évaluation.');
        var note = retro && aDesTextes(m)
            ? 'Tu les retrouveras ensuite dans Grilles de critères, Échelles de performance et Cartouches de rétroaction, où tout reste modifiable.'
            : 'Tu les retrouveras ensuite dans Grilles de critères et dans Échelles de performance, où tout reste modifiable.';
        return '<h3>Ce qui sera créé</h3><ul>' + lignes.map(function (l) { return '<li>' + e(l) + '</li>'; }).join('') +
            '</ul><p class="text-muted">' + e(note) + '</p>';
    }

    function manquantsHtml(m) {
        var c = calculs(m);
        if (!etat.montrerManquants || !c.manquants.length) return '';
        return '<div class="alerte alerte-erreur materiel-manquants" role="alert"><strong>Avant de créer, il reste :</strong><ul>' +
            c.manquants.map(function (t) { return '<li>' + e(t) + '</li>'; }).join('') + '</ul></div>';
    }

    // ------------------------------------------------------------------
    // Les étapes
    // ------------------------------------------------------------------

    var MOTS_APP = {
        axes: 'Chaque ligne de ton tableau est un critère. Ensemble, tes critères forment ce que l’application appelle une grille de critères : tu la retrouveras dans « Grilles de critères ».',
        natureRetro: 'Ces textes, l’application les range dans une cartouche de rétroaction : un commentaire par critère et par niveau. Tu la retrouveras dans « Cartouches de rétroaction ».',
        natureDescr: 'Ces textes, l’application les appelle des descripteurs : chacun reste attaché à son critère et à son niveau, dans ta grille de critères.',
        // Adapté le 17 oct. (Claude Code) : la note retenue se saisit désormais ici (décision de
        // Grégoire) ; le prototype renvoyait sa saisie à « Échelles de performance ».
        valeurs: 'Ces niveaux, leurs plages et leurs notes retenues, l’application les appelle une échelle de performance. Tu la retrouveras dans « Échelles de performance ».',
        pond: 'Le poids de chaque critère, l’application l’appelle la pondération. Il fait partie de ta grille de critères.',
        // points, roles, rolesPoints (grille en points sans niveaux), rolesPointsNiveaux : validés
        // par Grégoire le 17 oct. (15 h 00).
        points: 'Les points de chaque critère font partie de ta grille de critères : à l’évaluation, tu noteras chaque critère sur ce nombre, et la note de la copie se calculera à partir des points seuls.',
        roles: 'L’application construira ta grille de critères et son échelle de performance à partir de ce que tu décris ici : les niveaux, les critères, leurs descripteurs et leurs sous-critères. Rien n’est encore créé.',
        rolesPoints: 'L’application construira ta grille de critères, notée en points, à partir de ce que tu indiques ici : les critères, leurs points, leurs descriptions et leurs sous-critères. Rien n’est encore créé.',
        rolesPointsNiveaux: 'L’application construira ta grille de critères, notée en points, à partir de ce que tu établis ici : les critères, leurs points, ce qui est attendu à chaque niveau, leurs descriptions et leurs sous-critères. Elle ne créera pas d’échelle : la note se calculera à partir des points. Rien n’est encore créé.'
    };

    // Lot 3a, Claude Code (17 oct.) : PROVISOIRE, relu en 3b. Remplace le bandeau du lot 1 (retiré au lot 2 avec l'aperçu seul).
    var MOT_FUSION = 'Ton tableau contient des cases fusionnées. L’étape « Ce que contient ton tableau » montre ce que l’application en a lu : tu pourras y corriger sa lecture.';

    function motApp(m, id) {
        var t = id === 'nature' ? (A().estRetro(m) ? MOTS_APP.natureRetro : MOTS_APP.natureDescr)
            : id === 'roles' && A().estEnPoints(m) ? (m.niveaux.length ? MOTS_APP.rolesPointsNiveaux : MOTS_APP.rolesPoints)
            : MOTS_APP[id];
        if (!t) return '';
        return '<div class="materiel-mot-app"><strong>Dans l’application</strong><span>' + e(t) + '</span></div>';
    }

    function titreEtape(t) { return '<h2 id="materiel-titre-etape" tabindex="-1">' + e(t) + '</h2>'; }

    function choix(action, param, presse, titre, aide) {
        return '<button type="button" class="materiel-choix" aria-pressed="' + (presse ? 'true' : 'false') + '"' +
            ' data-action="' + action + '" data-param="' + e(param) + '">' +
            '<span class="materiel-choix-titre">' + e(titre) + '</span><span class="materiel-choix-aide">' + e(aide) + '</span></button>';
    }

    function etapeAxes(m) {
        return titreEtape('Dans ton document, les critères sont-ils en lignes ou en colonnes ?') +
            (m.fusionnees ? '<p class="alerte alerte-attention materiel-bandeau" role="status">' + e(MOT_FUSION) + '</p>' : '') +
            '<p>Regarde l’aperçu ci-dessous : chaque ligne devrait être un critère, chaque colonne un niveau.</p>' +
            '<div class="materiel-choix-groupe" role="group" aria-label="Sens du tableau">' +
            choix('materiel.choisirSens', 0, !m.critEnColonnes, 'En lignes', 'Un critère par ligne, un niveau par colonne.') +
            choix('materiel.choisirSens', 1, !!m.critEnColonnes, 'En colonnes', 'Un critère par colonne, un niveau par ligne : l’application permute le tableau.') +
            '</div>' + mention('propose', 'Proposé d’après la lecture de ton tableau : à vérifier. Si tu changes ce choix, la pondération et la valeur des niveaux seront à revoir.');
    }

    // ------------------------------------------------------------------
    // Lot 3a : « Ce que contient ton tableau » — un rôle par rangée, un rôle par colonne
    // ------------------------------------------------------------------

    function menuRole(sorte, i, choisi, libelle) {
        var court = sorte === 'rangees' ? 'r' : 'c';
        var id = 'materiel-role-' + court + '-' + i;
        var liste = sorte === 'rangees' ? window.materielLecture.ROLES_RANGEES : window.materielLecture.ROLES_COLONNES;
        return '<label class="u-lecteur-ecran" for="' + id + '">' + e(libelle) + '</label>' +
            '<select id="' + id + '" class="controle-form materiel-role" data-on-change="materiel.choisirRole" data-param="' + court + '.' + i + '">' +
            liste.map(function (o) {
                return '<option value="' + e(o.id) + '"' + (o.id === choisi ? ' selected' : '') + '>' + e(o.libelle) + '</option>';
            }).join('') + '</select>';
    }

    /** Une case du tableau lu ; une case fusionnée est marquée, ses suites le disent. */
    function caseLue(c, ignoree) {
        var cls = 'materiel-role-case' + (c.fusion ? ' materiel-case-fusion' : '') + (ignoree ? ' materiel-role-ignore' : '');
        if (c.suite) {
            return '<td class="' + cls + '"><span class="materiel-case-vide">' +
                e(c.suite === 'v' ? '(suite de la case fusionnée au-dessus)' : '(suite de la case fusionnée à gauche)') + '</span></td>';
        }
        return '<td class="' + cls + '">' + (c.t ? '<span class="materiel-case">' + e(c.t) + '</span>' : '<span class="materiel-case-vide">(case vide)</span>') +
            (c.fusion ? '<span class="materiel-mention materiel-mention-propose">case fusionnée</span>' : '') + '</td>';
    }

    function etapeRoles(m) {
        var R = m.roles.rangees, K = m.roles.colonnes, t = m.tableau;
        var suite = R.indexOf('suite') >= 0
            ? '<fieldset class="materiel-suite-nom"><legend>Dans une « Suite du critère », la case de la colonne « Noms des critères » devient :</legend>' +
              '<div class="materiel-choix-groupe">' + window.materielLecture.CHOIX_SUITE.map(function (o) {
                  return pilule('materiel.choisirSuiteNom', o.id, o.id === m.roles.suiteNom, o.libelle);
              }).join('') + '</div></fieldset>'
            : '';
        return titreEtape('Vérifie ce que l’application a lu dans ton tableau') +
            '<p>Voici ton tableau, tel que l’application l’a lu. Le menu au début de chaque rangée, et celui en tête de chaque colonne, disent ce qu’elle en a compris. Si elle s’est trompée, change le menu : l’aperçu plus bas se met à jour aussitôt.</p>' +
            (m.roles.propose ? mention('propose', 'Proposé par l’application : à vérifier') : '') +
            '<div class="materiel-apercu-cadre" role="region" aria-label="Ton tableau, tel que l’application l’a lu" tabindex="0">' +
            '<table class="materiel-apercu materiel-roles"><caption class="u-lecteur-ecran">' +
            e(pluriel(t.length, 'rangée', 'rangées') + ', ' + pluriel(K.length, 'colonne', 'colonnes')) + '</caption>' +
            '<thead><tr><th scope="col" class="materiel-roles-coin">Rangées</th>' + K.map(function (r, j) {
                return '<th scope="col">' + menuRole('colonnes', j, r, 'Rôle de la colonne ' + (j + 1)) + '</th>';
            }).join('') + '</tr></thead><tbody>' + t.map(function (row, i) {
                return '<tr><th scope="row"' + (R[i] === 'ignorer' ? ' class="materiel-role-ignore"' : '') + '>' + menuRole('rangees', i, R[i], 'Rôle de la rangée ' + (i + 1)) + '</th>' +
                    row.map(function (c, j) { return caseLue(c, R[i] === 'ignorer' || K[j] === 'ignorer'); }).join('') + '</tr>';
            }).join('') + '</tbody></table></div>' + suite;
    }

    function premiereCase(m) {
        var t = '';
        m.criteres.some(function (c) { return c.cases.some(function (d) { t = texte(d); return !!t; }); });
        return t.length > 160 ? t.slice(0, 157) + '…' : t;
    }

    function etapeNature(m) {
        var retro = A().estRetro(m), ex = premiereCase(m);
        return titreEtape('Les cases de ton tableau décrivent-elles les niveaux, ou s’adressent-elles à l’étudiant·e ?') +
            (ex ? '<p>Une case de ton tableau : <em>« ' + e(ex) + ' »</em></p>' : '') +
            '<div class="materiel-choix-groupe" role="group" aria-label="Nature des cases">' +
            choix('materiel.choisirNature', 'descripteurs', !retro, 'Elles décrivent les niveaux', 'Des descripteurs : à quoi ressemble chaque niveau, avant la tâche. Ils iront dans ta grille.') +
            choix('materiel.choisirNature', 'retroactions', retro, 'Elles s’adressent à l’étudiant·e', 'Des rétroactions : ce que l’étudiant·e lira après l’évaluation. Elles iront dans tes commentaires par critère et par niveau.') +
            '</div>' + (m.nature && m.nature.etat === 'propose' ? mention('propose', 'Proposé d’après le texte des cases : à vérifier.') : '');
    }

    /** Lot 3a : le code d'un niveau se corrige (repris du document, ou complété par l'application). */
    function champCode(n, j, pre) {
        return '<label for="' + pre + '-code-' + j + '">Code</label>' +
            champ(pre + '-code-' + j, 'niveau.' + j + '.code', n.code, ' maxlength="' + A().MAX_CODE + '" autocapitalize="characters" spellcheck="false"');
    }

    /** Les quatre champs d'un niveau ; `pre` distingue les deux écrans (identifiants uniques). */
    function champsNiveau(n, j, pre) {
        var plageOk = texte(n.min) && texte(n.max);
        return '<div class="materiel-champs-ligne">' +
            '<label for="' + pre + '-min-' + j + '">De (%)</label>' + champ(pre + '-min-' + j, 'niveau.' + j + '.min', n.min, ' inputmode="decimal" placeholder="ex. 85"') +
            '<label for="' + pre + '-max-' + j + '">À (%)</label>' + champ(pre + '-max-' + j, 'niveau.' + j + '.max', n.max, ' inputmode="decimal" placeholder="ex. 100"') +
            '<label for="' + pre + '-note-' + j + '">Note retenue (%)</label>' + champ(pre + '-note-' + j, 'niveau.' + j + '.note', n.note, ' inputmode="decimal"') +
            '</div><span id="' + pre + '-plage-' + j + '" class="materiel-mention materiel-mention-remplir' + (plageOk ? ' u-hide' : '') + '">plage à remplir</span>';
    }

    function etapeValeurs(m) {
        return titreEtape('Quelle plage de notes correspond à chaque niveau ?') +
            // Validé par Grégoire le 17 oct. (15 h 00).
            '<p>Pour chaque niveau, indique de quelle note à quelle note il s’étend, en pourcentage, et la note que l’application retiendra pour une copie classée à ce niveau.</p>' +
            '<div class="materiel-cartes-niveaux">' + m.niveaux.map(function (n, j) {
                return '<div class="materiel-carte-niveau"><label for="materiel-q-titre-' + j + '">Niveau</label>' +
                    champ('materiel-q-titre-' + j, 'niveau.' + j + '.titre', n.titre) +
                    champCode(n, j, 'materiel-q') + champsNiveau(n, j, 'materiel-q') + '</div>';
            }).join('') + '</div>';
    }

    function etapePond(m) {
        var parts = m.criteres.some(function (c) { return c.ponderation.etat === 'complete'; }) && !m.pondRamenee;
        return titreEtape('Combien pèse chaque critère ?') +
            '<p>' + e(parts ? 'Ton tableau ne donnait pas de pondération : l’application a proposé des parts égales. Ajuste-les au besoin.'
                : 'Indique le poids de chaque critère, en pourcentage de la note.') + '</p>' +
            '<div class="materiel-cartes-niveaux">' + m.criteres.map(function (c, i) {
                return '<div class="materiel-carte-niveau"><label for="materiel-q-pond-' + i + '">' + e(texte(c.nom) || 'Critère sans nom') + '</label>' +
                    champ('materiel-q-pond-' + i, 'critere.' + i + '.ponderation', c.ponderation, ' inputmode="numeric" placeholder="ex. 30"') +
                    mentionPonderation(m, c) + '</div>';
            }).join('') + '</div>';
    }

    /** Étape 5 : les points de chaque critère, « sur N », un entier de 0 à 100 (5b : « / 0 » accepté). Textes PROVISOIRES (étape 7). */
    function etapePoints(m) {
        return titreEtape('Sur combien de points chaque critère est-il noté ?') +
            '<p>' + e('Ton tableau ne donnait pas les points de chaque critère. Indique-les : un nombre entier de 0 à 100 par critère. Le total est libre.') + '</p>' +
            '<div class="materiel-cartes-niveaux">' + m.criteres.map(function (c, i) {
                return '<div class="materiel-carte-niveau"><span class="materiel-points-nom">' + e(texte(c.nom) || 'Critère sans nom') + '</span>' +
                    '<label for="materiel-q-points-' + i + '"><span class="u-lecteur-ecran">' + e('Points de « ' + (texte(c.nom) || 'critère sans nom') + ' », ') + '</span>sur</label>' +
                    champ('materiel-q-points-' + i, 'critere.' + i + '.ponderation', c.ponderation, ' inputmode="numeric" placeholder="ex. 4"') + '</div>';
            }).join('') + '</div>';
    }

    function etiquettePassage(a) {
        if (a.statut === 'place') return 'Ajouté comme critère';
        if (a.statut === 'ecarte') return 'Écarté : ne sera pas repris dans la grille';
        return a.raison;
    }

    function etapeClasser(m) {
        return titreEtape('Que faire de ces passages ?') +
            '<p>Ils viennent de ton document, mais ne trouvent pas leur place dans le tableau. Rien n’est retiré sans toi : range-les ou écarte-les.</p>' +
            '<ul class="materiel-a-classer">' + m.aClasser.map(function (a) {
                var boutons = a.statut === 'attente'
                    ? '<button type="button" class="btn btn-secondaire" data-action="materiel.placer" data-param="' + a.id + '">Ajouter comme critère</button>' +
                      '<button type="button" class="btn btn-secondaire" data-action="materiel.ecarter" data-param="' + a.id + '">Écarter</button>'
                    : '<button type="button" class="materiel-btn-lien" data-action="materiel.annuler" data-param="' + a.id + '">Annuler</button>';
                return '<li><div><span class="materiel-a-classer-texte">' + e(a.texte) + '</span>' +
                    '<span class="materiel-a-classer-raison">' + e(etiquettePassage(a)) + '</span></div>' +
                    '<div class="materiel-actions">' + boutons + '</div></li>';
            }).join('') + '</ul>';
    }

    var ETAPES = { axes: etapeAxes, roles: etapeRoles, nature: etapeNature, valeurs: etapeValeurs, pond: etapePond, points: etapePoints, classer: etapeClasser };

    function boutonPrecedent() {
        return '<button type="button" class="materiel-btn-lien" data-action="materiel.precedent">' +
            (etat.etape === 0 ? '← Recommencer' : '← Précédent') + '</button>';
    }

    function progressionHtml() {
        var k = etat.etape;
        return '<div class="materiel-progression"><span class="materiel-etape-texte">Étape ' + (k + 1) + ' sur ' + etat.etapes.length + '</span>' +
            '<nav aria-label="Étapes de l’assistant" class="materiel-etapes-nav">' + etat.etapes.map(function (id, q) {
                var cls = 'materiel-etape-btn' + (q === k ? ' actif' : (q < k ? ' fait' : ''));
                return '<button type="button" class="' + cls + '"' + (q === k ? ' aria-current="step"' : '') +
                    ' data-action="materiel.allerEtape" data-param="' + q + '">' + (q + 1) + '. ' + e(A().NOMS_ETAPES[id]) + '</button>';
            }).join('') + '</nav></div>';
    }

    function questionHtml(m, id) {
        var surligne = id === 'valeurs' || id === 'pond' || id === 'points' ? id : '';
        return '<div class="materiel-question">' + ETAPES[id](m) +
            '<div id="materiel-derives" class="materiel-derives">' + derivesHtml(m, id) + '</div>' +
            motApp(m, id) +
            '<div class="materiel-nav">' + boutonPrecedent() +
            '<button type="button" class="btn btn-principal" data-action="materiel.suivant">Suivant →</button></div></div>' +
            '<section id="materiel-apercu-zone" class="materiel-apercu-bloc" aria-labelledby="materiel-titre-apercu">' + apercuHtml(m, surligne) + '</section>';
    }

    // ------------------------------------------------------------------
    // La vérification
    // ------------------------------------------------------------------

    function pilule(action, param, presse, txt) {
        return '<button type="button" class="materiel-pilule" aria-pressed="' + (presse ? 'true' : 'false') + '" data-action="' + action + '" data-param="' + e(param) + '">' + e(txt) + '</button>';
    }

    function rappelsHtml(m) {
        var retro = A().estRetro(m);
        return '<div class="materiel-rappels">' +
            (m.source !== 'main' ? '<div class="materiel-rappel" role="group" aria-labelledby="materiel-rappel-axes"><span id="materiel-rappel-axes">Critères :</span>' +
                pilule('materiel.choisirSens', 0, !m.critEnColonnes, 'en lignes') + pilule('materiel.choisirSens', 1, !!m.critEnColonnes, 'en colonnes') + '</div>' : '') +
            (A().estEnPoints(m) ? '' : '<div class="materiel-rappel" role="group" aria-labelledby="materiel-rappel-nature"><span id="materiel-rappel-nature">Les cases :</span>' +
            pilule('materiel.choisirNature', 'descripteurs', !retro, 'décrivent les niveaux') + pilule('materiel.choisirNature', 'retroactions', retro, 's’adressent à l’étudiant·e') + '</div>') + '</div>';
    }

    function enteteVerifNiveau(n, j) {
        return '<th scope="col" class="materiel-col-niveau">' +
            '<label for="materiel-v-titre-' + j + '">Niveau</label>' + champ('materiel-v-titre-' + j, 'niveau.' + j + '.titre', n.titre) +
            champCode(n, j, 'materiel-v') + champsNiveau(n, j, 'materiel-v') + '</th>';
    }

    function rangeeVerif(m, c, i) {
        var retro = A().estRetro(m);
        return '<tr><th scope="row" class="materiel-col-critere">' +
            '<label class="u-lecteur-ecran" for="materiel-v-nom-' + i + '">Nom du critère</label>' +
            champ('materiel-v-nom-' + i, 'critere.' + i + '.nom', c.nom, ' placeholder="Nom du critère"') +
            (c.nom.etat === 'remplir' ? mention('remplir', 'à remplir') : '') + detailsCritereHtml(c) + '</th>' +
            '<td class="materiel-col-pond"><label class="u-lecteur-ecran" for="materiel-v-pond-' + i + '">Pondération du critère</label>' +
            champ('materiel-v-pond-' + i, 'critere.' + i + '.ponderation', c.ponderation, ' inputmode="numeric" placeholder="ex. 30"') +
            mentionPonderation(m, c) + '</td>' +
            c.cases.map(function (d, j) {
                var niv = m.niveaux[j] ? texte(m.niveaux[j].titre) : '';
                var lab = (retro ? 'Rétroaction : ' : 'Descripteur : ') + (texte(c.nom) || 'critère') + ', niveau ' + niv;
                return '<td><textarea class="controle-form materiel-champ" rows="4" aria-label="' + e(lab) + '"' +
                    ' placeholder="' + (retro ? 'Rétroaction à l’étudiant·e (facultatif)' : 'Descripteur (facultatif)') + '"' +
                    ' data-on-input="materiel.saisir" data-param="case.' + i + '.' + j + '">' + e(texte(d)) + '</textarea></td>';
            }).join('') + '</tr>';
    }

    function nomGrilleHtml(m) {
        var men = m.nom.etat === 'remplir' ? mention('remplir', 'à remplir')
            : (m.nom.etat === 'repris' ? mention('propose', 'repris de la ligne au-dessus du tableau : à vérifier') : '');
        return '<div class="materiel-nom-grille"><label for="materiel-nom-grille">Nom de la grille</label>' +
            champ('materiel-nom-grille', 'nom', m.nom, ' maxlength="200"') +
            '<span class="text-muted">Il apparaîtra sur le document que reçoivent tes étudiant·es.</span>' + men + '</div>';
    }

    /** Étape 5 : une rangée de la Vérification d'une grille en points — nom, description, points ; 5b : ses descripteurs. */
    function rangeeVerifPoints(m, c, i) {
        var sous = c.sousCriteres || [];
        return '<tr><th scope="row" class="materiel-col-critere">' +
            '<label class="u-lecteur-ecran" for="materiel-v-nom-' + i + '">Nom du critère</label>' +
            champ('materiel-v-nom-' + i, 'critere.' + i + '.nom', c.nom, ' placeholder="Nom du critère"') +
            (c.nom.etat === 'remplir' ? mention('remplir', 'à remplir') : '') +
            (sous.length ? detailsCritereHtml({ sousCriteres: sous }) : '') + '</th>' +
            '<td><textarea class="controle-form materiel-champ" rows="3" aria-label="' + e('Description : ' + (texte(c.nom) || 'critère')) + '"' +
            ' placeholder="Description (facultatif)" data-on-input="materiel.saisir" data-param="critere.' + i + '.description">' + e(texte(c.description)) + '</textarea></td>' +
            '<td class="materiel-col-pond"><label for="materiel-v-pond-' + i + '"><span class="u-lecteur-ecran">Points du critère, </span>sur</label>' +
            champ('materiel-v-pond-' + i, 'critere.' + i + '.ponderation', c.ponderation, ' inputmode="numeric" placeholder="ex. 4"') + '</td>' +
            c.cases.map(function (d, j) {
                var lab = 'Descripteur : ' + (texte(c.nom) || 'critère') + ', niveau ' + (m.niveaux[j] ? texte(m.niveaux[j].titre) : '');
                return '<td><textarea class="controle-form materiel-champ" rows="4" aria-label="' + e(lab) + '" placeholder="Descripteur (facultatif)"' +
                    ' data-on-input="materiel.saisir" data-param="case.' + i + '.' + j + '">' + e(texte(d)) + '</textarea></td>';
            }).join('') + '</tr>';
    }

    /** Étape 5b : l'en-tête d'un niveau d'une grille en points — son nom seul (ni plage, ni note, ni code). */
    function enteteVerifNiveauPoints(n, j) {
        return '<th scope="col" class="materiel-col-niveau"><label for="materiel-v-titre-' + j + '">Niveau</label>' +
            champ('materiel-v-titre-' + j, 'niveau.' + j + '.titre', n.titre) + (n.titre.etat === 'remplir' ? mention('remplir', 'à remplir') : '') + '</th>';
    }

    function verificationPointsHtml(m) {
        return '<div class="materiel-verif-entete">' + titreEtape('Vérifie ta grille, puis crée-la') +
            '<p>Tout reste modifiable ici. Rien n’est encore créé.</p></div>' +
            nomGrilleHtml(m) + rappelsHtml(m) + legendeHtml('Comment lire le tableau :', 'Complété par l’application : à vérifier') +
            '<div class="materiel-apercu-cadre" role="region" aria-label="Ta grille" tabindex="0"><table class="materiel-apercu materiel-verif materiel-verif-points">' +
            '<thead><tr><th scope="col" class="materiel-col-critere">Critère</th><th scope="col">Description</th><th scope="col" class="materiel-col-pond">Points</th>' +
            m.niveaux.map(enteteVerifNiveauPoints).join('') +
            '</tr></thead><tbody>' + m.criteres.map(function (c, i) { return rangeeVerifPoints(m, c, i); }).join('') + '</tbody></table></div>' +
            '<div class="materiel-actions"><button type="button" class="btn btn-secondaire" data-action="materiel.ajouterCritere">Ajouter un critère</button></div>' +
            '<div id="materiel-derives" class="materiel-derives">' + derivesHtml(m, 'final') + '</div>' +
            '<div class="materiel-creation"><div id="materiel-cree" class="materiel-cree-liste">' + creeListeHtml(m) + '</div>' +
            '<div class="materiel-creation-actions"><button type="button" class="btn btn-principal" data-action="materiel.creer">Créer ma grille</button>' +
            boutonPrecedent() + '<div id="materiel-manquants">' + manquantsHtml(m) + '</div>' +
            (etat.erreurCreation ? '<p class="alerte alerte-erreur" role="alert">' + e(etat.erreurCreation) + '</p>' : '') + '</div></div>';
    }

    function verificationHtml(m) {
        if (A().estEnPoints(m)) return verificationPointsHtml(m);
        var plein = m.niveaux.length >= A().MAX_NIVEAUX;
        return '<div class="materiel-verif-entete">' + titreEtape('Vérifie ta grille, puis crée-la') +
            '<p>Tout reste modifiable ici. Rien n’est encore créé.</p></div>' +
            nomGrilleHtml(m) + rappelsHtml(m) + legendeHtml('Comment lire le tableau :', 'Complété par l’application : à vérifier') +
            '<div class="materiel-apercu-cadre" role="region" aria-label="Ta grille" tabindex="0"><table class="materiel-apercu materiel-verif">' +
            '<thead><tr><th scope="col" class="materiel-col-critere">Critère</th><th scope="col" class="materiel-col-pond">Pondération (%)</th>' +
            m.niveaux.map(enteteVerifNiveau).join('') + '</tr></thead><tbody>' +
            m.criteres.map(function (c, i) { return rangeeVerif(m, c, i); }).join('') + '</tbody></table></div>' +
            '<div class="materiel-actions"><button type="button" class="btn btn-secondaire" data-action="materiel.ajouterCritere">Ajouter un critère</button>' +
            '<button type="button" class="btn btn-secondaire" data-action="materiel.ajouterNiveau"' + (plein ? ' disabled aria-describedby="materiel-max-niveaux"' : '') + '>Ajouter un niveau</button>' +
            (plein ? '<span id="materiel-max-niveaux" class="text-muted">' + A().MAX_NIVEAUX + ' niveaux au plus.</span>' : '') + '</div>' +
            '<div id="materiel-derives" class="materiel-derives">' + derivesHtml(m, 'final') + '</div>' +
            '<div class="materiel-creation"><div id="materiel-cree" class="materiel-cree-liste">' + creeListeHtml(m) + '</div>' +
            '<div class="materiel-creation-actions"><button type="button" class="btn btn-principal" data-action="materiel.creer">Créer ma grille</button>' +
            boutonPrecedent() + '<div id="materiel-manquants">' + manquantsHtml(m) + '</div>' +
            (etat.erreurCreation ? '<p class="alerte alerte-erreur" role="alert">' + e(etat.erreurCreation) + '</p>' : '') + '</div></div>';
    }

    /**
     * L'assistant entier (fonction pure de l'état passé). Exposée pour les bancs, qui
     * vérifient les étapes et que tout texte venu du document en sort échappé.
     * @param {{modele: Object, etapes: string[], etape: number, montrerManquants?: boolean}} s
     */
    function assistantHtml(s) {
        var garde = etat;
        etat = Object.assign({}, garde, s);   // les fonctions de rendu lisent `etat`
        try {
            var m = etat.modele, id = etat.etapes[etat.etape];
            return '<div class="materiel-assistant">' + progressionHtml() +
                (m.source === 'exemple' ? '<p class="alerte alerte-information materiel-bandeau">Exemple fictif, pour essayer. Tes vraies grilles se collent à l’écran d’accueil de l’onglet.</p>' : '') +
                (id === 'final' ? verificationHtml(m) : questionHtml(m, id)) + '</div>';
        } finally {
            etat = garde;
        }
    }

    // ------------------------------------------------------------------
    // La confirmation
    // ------------------------------------------------------------------

    function confirmationHtml(r) {
        if (r.enPoints) return confirmationPointsHtml(r);
        var phrase = r.retro
            ? 'Elle est rangée dans tes grilles, avec ' + pluriel(r.nbC, 'critère', 'critères') + ' ; tes rétroactions sont prêtes à servir quand tu évalueras. Rien d’autre n’a changé dans l’application.'
            : 'Elle est rangée dans tes grilles, avec ' + pluriel(r.nbC, 'critère', 'critères') + (r.descr ? ' et leurs descripteurs' : '') + '. Rien d’autre n’a changé dans l’application.';
        var carteGrille = pluriel(r.nbC, 'critère', 'critères') + (r.descr ? ', avec leurs descripteurs.' : '.');
        return '<section class="materiel-confirmation" aria-labelledby="materiel-titre-cree">' +
            '<div class="materiel-confirmation-titre"><svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="21"></circle><path d="M14 25l7 7 13-15"></path></svg>' +
            '<h2 id="materiel-titre-cree" tabindex="-1">Ta grille « ' + e(r.nom) + ' » est créée</h2></div>' +
            '<p>' + e(phrase) + '</p><div class="materiel-cartes-cree">' +
            carteCree('Ta grille', carteGrille, 'grille-criteres', 'La voir dans Grilles de critères') +
            carteCree('Ses niveaux', r.niveaux.join(' · '), 'echelle-performance', 'Les voir dans Échelles de performance') +
            (r.retro ? carteCree('Tes rétroactions', 'Un commentaire par critère et par niveau, que tes étudiant·es liront après l’évaluation.', 'retroactions', 'Les voir dans Cartouches de rétroaction') : '') +
            '</div>' + plusLoinHtml(r) + '<div class="materiel-suite"><span>Pour t’en servir, associe-la à une production, puis évalue une première copie avec elle.</span>' +
            '<button type="button" class="btn btn-principal" data-action="materiel.voir" data-param="productions">Aller aux productions</button></div>' +
            '<button type="button" class="materiel-btn-lien" data-action="materiel.recommencer">Apporter autre chose</button></section>';
    }

    /**
     * Étape 6 : « Aller plus loin avec ta grille », sous les cartes. Textes validés par Grégoire
     * (17 oct., 12 h 07), mot pour mot. Une grille à niveaux dont les cases étaient des rétroactions
     * (une cartouche vient d'être créée) n'a que la phrase commune : son paragraphe proposerait ce
     * qui est déjà fait (supposition de Cowork).
     * Le lien ouvre l'aide existante par sa clé du catalogue (`afficherAideContextuelle`) : le
     * déclencheur `.primo-aide[data-target]` de Grilles de critères est caché hors du mode aide, et
     * cherche un élément `#grille-type-critere-detail` que rien ne crée.
     */
    var PLUS_LOIN = {
        titre: 'Aller plus loin avec ta grille',
        enPoints: 'Ta grille note chaque critère en points. Labo Codex pourrait t’aider à suivre la progression de tes étudiant·es à partir d’elle, par exemple en décrivant, pour un critère, ce qu’on attend à chaque niveau.',
        aNiveaux: 'Ta grille décrit ce qu’on attend à chaque niveau. Labo Codex pourrait t’aider à suivre la progression de tes étudiant·es à partir d’elle, par exemple en associant une rétroaction à chaque niveau.',
        commune: 'Un critère peut s’évaluer de trois façons : holistique (par niveaux), analytique (par points) ou algorithmique (par un calcul).',
        lien: 'Les trois façons d’évaluer un critère',
        aide: 'grille-type-critere-detail'
    };

    function plusLoinHtml(r) {
        // Étape 5b : une grille en points qui décrit déjà ses niveaux a, elle aussi, la phrase commune seule.
        var propre = r.enPoints ? (r.descr ? '' : PLUS_LOIN.enPoints) : (r.retro ? '' : PLUS_LOIN.aNiveaux);
        return '<aside class="materiel-plus-loin" aria-labelledby="materiel-titre-plus-loin">' +
            '<h3 id="materiel-titre-plus-loin">' + e(PLUS_LOIN.titre) + '</h3>' +
            (propre ? '<p>' + e(propre) + '</p>' : '') + '<p>' + e(PLUS_LOIN.commune) + '</p>' +
            '<button type="button" class="materiel-btn-lien" data-action="afficherAideContextuelle" data-param="' + e(PLUS_LOIN.aide) + '">' + e(PLUS_LOIN.lien) + '</button></aside>';
    }

    /**
     * Étape 5 : la carte « Grille » seule ; « Pour t'en servir… » inchangé. Textes PROVISOIRES (étape 7).
     * La dissection, lot 2a : venue d'elle, la confirmation garde « Coller une autre grille » (même geste).
     */
    function confirmationPointsHtml(r) {
        var retour = r.depuisDissection ? 'Coller une autre grille' : 'Apporter autre chose';
        return '<section class="materiel-confirmation" aria-labelledby="materiel-titre-cree">' +
            '<div class="materiel-confirmation-titre"><svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="21"></circle><path d="M14 25l7 7 13-15"></path></svg>' +
            '<h2 id="materiel-titre-cree" tabindex="-1">Ta grille « ' + e(r.nom) + ' » est créée</h2></div>' +
            '<p>' + e('Elle est rangée dans tes grilles, avec ' + pluriel(r.nbC, 'critère', 'critères') + ' notés en points. Rien d’autre n’a changé dans l’application.') + '</p>' +
            '<div class="materiel-cartes-cree">' +
            carteCree('Ta grille', pluriel(r.nbC, 'critère', 'critères') + ', sur ' + String(r.totalPoints).replace('.', ',') + '.', 'grille-criteres', 'La voir dans Grilles de critères') +
            '</div>' + plusLoinHtml(r) + '<div class="materiel-suite"><span>Pour t’en servir, associe-la à une production, puis évalue une première copie avec elle.</span>' +
            '<button type="button" class="btn btn-principal" data-action="materiel.voir" data-param="productions">Aller aux productions</button></div>' +
            '<button type="button" class="materiel-btn-lien" data-action="materiel.recommencer">' + e(retour) + '</button></section>';
    }

    function carteCree(titre, txt, sousSection, bouton) {
        return '<div class="materiel-carte-cree"><strong>' + e(titre) + '</strong><span>' + e(txt) + '</span>' +
            '<button type="button" class="btn btn-secondaire" data-action="materiel.voir" data-param="' + e(sousSection) + '">' + e(bouton) + '</button></div>';
    }

    // ------------------------------------------------------------------
    // La page
    // ------------------------------------------------------------------

    function el(id) { return document.getElementById(id); }

    function montrerErreur(msg) {
        var p = el('materiel-erreur');
        if (!p) return;
        p.textContent = msg || '';
        p.classList.toggle('u-hide', !msg);
    }

    function focaliser(selecteur) {
        var cible = selecteur && document.querySelector(selecteur);
        if (cible) cible.focus();   // règle SPA : le focus suit le changement de vue
    }

    function rendre(focus) {
        var zone = el('materiel-lecture'), accueil = el('materiel-accueil');
        if (!zone || !accueil) return;
        if (etat.ecran === 'accueil') {
            zone.innerHTML = '';
            zone.classList.add('u-hide');
            accueil.classList.remove('u-hide');
            return;
        }
        zone.innerHTML = etat.ecran === 'cree' ? confirmationHtml(etat.resume) : assistantHtml(etat);   // security-ok: tout texte passe par echapperHtml
        accueil.classList.add('u-hide');
        zone.classList.remove('u-hide');
        focaliser(focus || (etat.ecran === 'cree' ? '#materiel-titre-cree' : '#materiel-titre-etape'));
    }

    function remplacer(id, html) { var z = el(id); if (z) z.innerHTML = html; }   // security-ok: html échappé par ses producteurs

    /** Après une saisie : seules les zones qui en dépendent se redessinent. */
    function rafraichirDerives() {
        var m = etat.modele, id = etat.etapes[etat.etape];
        remplacer('materiel-derives', derivesHtml(m, id));
        if (id === 'final') {
            remplacer('materiel-cree', creeListeHtml(m));
            remplacer('materiel-manquants', manquantsHtml(m));
        } else {
            remplacer('materiel-apercu-zone', apercuHtml(m, id === 'valeurs' || id === 'pond' || id === 'points' ? id : ''));
        }
        // Un code complété suit le titre de son niveau ; un code repris ou saisi ne bouge pas (lot 3a).
        m.niveaux.forEach(function (n, j) {
            if (n.code.etat !== 'complete') return;
            ['materiel-q-code-', 'materiel-v-code-'].forEach(function (pre) {
                var c = el(pre + j);
                if (c && c !== document.activeElement) c.value = n.code.valeur;
            });
        });
    }

    function ouvrirAssistant(m) {
        var modele = A().preparer(m);
        etat = Object.assign(etat, { ecran: 'assistant', modele: modele, etapes: A().etapesPour(modele), etape: 0, montrerManquants: false, erreurCreation: '' });
        rendre();
    }

    function charger(lu, source) {
        var r = window.materielLecture.charger(lu, source);
        if (r.erreur) { montrerErreur(r.erreur); return false; }
        montrerErreur('');
        ouvrirAssistant(r.modele);
        return true;
    }

    // Texte de Claude Code, PROVISOIRE (étape 3 du plan de la dissection).
    var MESSAGE_RIEN_A_LIRE = 'Rien de lisible dans ce que tu as collé. Copie le tableau de ta grille dans Word ou Pages, ou le texte d’un PDF, puis colle-le ici.';

    /** Un document disséqué ouvre la dissection ; rien de lisible, un message. */
    function ouvrirDissection(doc) {
        if (!doc) { montrerErreur(MESSAGE_RIEN_A_LIRE); return false; }
        montrerErreur('');
        return window.materielDissection.ouvrir(doc);
    }

    function surCollage(ev) {
        var cd = ev.clipboardData;
        if (!cd) return;
        var doc = window.materielDissectionLecture.docDepuisPressePapiers({ html: cd.getData('text/html'), texte: cd.getData('text/plain') });
        if (doc) ev.preventDefault();
        ouvrirDissection(doc);
    }

    /** Un geste qui change la forme du modèle : l'état est remplacé, la page redessinée. */
    function changer(m, focus) {
        etat.modele = m;
        rendre(focus);
    }

    /** Une relecture (sens du tableau, rôle) : la liste des étapes se recalcule, l'étape courante gardée. */
    function relu(m, focus) {
        if (m === etat.modele) return;
        var r = A().recalculerEtapes(m, etat.etapes, etat.etape);
        etat.etapes = r.etapes;
        etat.etape = r.etape;
        changer(m, focus);
    }

    /**
     * Une saisie : « nom », « niveau.<j>.<titre|code|min|max|note> », « critere.<i>.<nom|ponderation|description> »,
     * « case.<i>.<j> ». Le modèle est mis à jour en place, le champ change de cadre.
     */
    /** La mention « plage à remplir » d'un niveau suit sa saisie, sur les deux écrans. */
    function montrerPlageARemplir(n, j) {
        var plageOk = !!(texte(n.min) && texte(n.max));
        ['materiel-q', 'materiel-v'].forEach(function (pre) {
            var men = el(pre + '-plage-' + j);
            if (men) men.classList.toggle('u-hide', plageOk);
        });
    }

    var CIBLES = {
        nom: function (m) { return m.nom; },
        niveau: function (m, p) { return m.niveaux[+p[1]] && m.niveaux[+p[1]][p[2]]; },
        critere: function (m, p) { return m.criteres[+p[1]] && m.criteres[+p[1]][p[2]]; },
        'case': function (m, p) { return m.criteres[+p[1]] && m.criteres[+p[1]].cases[+p[2]]; }
    };

    /** Une case, une description (étape 5) : facultatives, vides sans être « à remplir ». */
    function etatDeSaisie(p, v) {
        var facultatif = p[0] === 'case' || (p[0] === 'critere' && p[2] === 'description');
        return facultatif ? (String(v).trim() ? 'saisi' : 'vide') : A().etatSaisi(v);
    }

    function saisir(chemin, champEl) {
        var m = etat.modele;
        if (!m || !champEl) return;
        var v = champEl.value, p = String(chemin).split('.');
        var cible = CIBLES[p[0]] ? CIBLES[p[0]](m, p) : null;
        if (!cible) return;
        cible.valeur = v;
        cible.etat = etatDeSaisie(p, v);
        if (p[0] === 'critere' && p[2] === 'ponderation') m.pondRamenee = false;
        if (p[0] === 'niveau' && p[2] === 'titre') m.niveaux = window.materielLecture.coder(m.niveaux);
        if (p[0] === 'niveau' && (p[2] === 'min' || p[2] === 'max')) montrerPlageARemplir(m.niveaux[+p[1]], +p[1]);
        if (champEl.tagName === 'INPUT') champEl.className = classeChamp(cible);
        rafraichirDerives();
    }

    function etapeVers(k) {
        etat.etape = Math.max(0, Math.min(etat.etapes.length - 1, k));
        etat.montrerManquants = false;
        rendre();
    }

    function sousSection(id) {
        if (typeof window.afficherSousSection === 'function') window.afficherSousSection('conception-' + id);
    }

    /**
     * « Créer ma grille » : trop tôt, la liste des manques ; sinon les trois écritures
     * (`materielCreation`), puis la confirmation. Un second clic pendant l'écriture est sans effet.
     */
    async function creer() {
        if (etat.enCours || !etat.modele) return;
        if (calculs(etat.modele).manquants.length) {
            etat.montrerManquants = true;
            remplacer('materiel-manquants', manquantsHtml(etat.modele));
            return;
        }
        etat.enCours = true;
        etat.erreurCreation = '';
        var r;
        try { r = await window.materielCreation.creer(etat.modele); } finally { etat.enCours = false; }
        if (r.erreur) {
            etat.erreurCreation = r.erreur;
            rendre('[data-action="materiel.creer"]');
            return;
        }
        etat.ecran = 'cree';
        etat.resume = r.resume;
        rendre();
    }

    var materiel = {
        reconnaitreTexte: function () {
            var zone = el('materiel-zone-collage');
            ouvrirDissection(window.materielDissectionLecture.docDepuisPressePapiers({ texte: zone ? zone.value : '' }));
        },
        essayerExemple: function () {
            ouvrirDissection(window.materielDissectionLecture.exempleDoc());
        },
        /** Vers l'éditeur de Grilles de critères : la façon de créer qui reste (« nous allons garder les deux »). */
        taperMain: function () {
            montrerErreur('');
            sousSection('grille-criteres');
        },
        recommencer: function () {
            etat = { ecran: 'accueil', modele: null, etapes: [], etape: 0, montrerManquants: false, resume: null, erreurCreation: '', enCours: false };
            if (window.materielDissection) window.materielDissection.fermer();
            rendre();
            var collage = el('materiel-zone-collage');
            if (collage) { collage.value = ''; collage.focus(); }
            montrerErreur('');
        },
        allerEtape: function (k) { etapeVers(Number(k)); },
        suivant: function () { etapeVers(etat.etape + 1); },
        precedent: function () { if (etat.etape === 0) materiel.recommencer(); else etapeVers(etat.etape - 1); },
        allerClasser: function () { var q = etat.etapes.indexOf('classer'); if (q >= 0) etapeVers(q); },
        choisirSens: function (enColonnes) { relu(A().choisirSens(etat.modele, Number(enColonnes) === 1)); },
        /** « r.<i> » ou « c.<j> », et le menu changé. */
        choisirRole: function (param, menu) {
            var p = String(param).split('.'), i = Number(p[1]);
            if (!menu || (p[0] !== 'r' && p[0] !== 'c')) return;
            relu(A().choisirRole(etat.modele, p[0] === 'r' ? 'rangees' : 'colonnes', i, menu.value), '#materiel-role-' + p[0] + '-' + i);
        },
        choisirSuiteNom: function (v) {
            relu(A().choisirSuiteNom(etat.modele, String(v)), '[data-action="materiel.choisirSuiteNom"][aria-pressed="true"]');
        },
        choisirNature: function (v) { changer(A().choisirNature(etat.modele, v), '[data-action="materiel.choisirNature"][aria-pressed="true"]'); },
        ramenerA100: function () { changer(A().ramenerA100(etat.modele)); },
        placer: function (id) { changer(A().placer(etat.modele, Number(id)), '[data-action="materiel.annuler"][data-param="' + Number(id) + '"]'); },
        ecarter: function (id) { changer(A().ecarter(etat.modele, Number(id)), '[data-action="materiel.annuler"][data-param="' + Number(id) + '"]'); },
        annuler: function (id) { changer(A().annuler(etat.modele, Number(id)), '[data-action="materiel.placer"][data-param="' + Number(id) + '"]'); },
        ajouterCritere: function () { changer(A().ajouterCritere(etat.modele), '#materiel-v-nom-' + etat.modele.criteres.length); },
        ajouterNiveau: function () { changer(A().ajouterNiveau(etat.modele), '#materiel-v-titre-' + etat.modele.niveaux.length); },
        saisir: saisir,
        creer: creer,
        /** La dissection, lot 2a : sa grille est créée ; la dissection se ferme, la confirmation s'affiche. */
        montrerCreee: function (resume) {
            if (window.materielDissection) window.materielDissection.fermer();
            etat = Object.assign(etat, { ecran: 'cree', modele: null, resume: Object.assign({}, resume, { depuisDissection: true }), erreurCreation: '', enCours: false });
            rendre();
        },
        /**
         * La sous-section, puis (lot 3b1) l'objet créé ouvert et sélectionné, par le chemin de la
         * bibliothèque de chaque outil (`ouvrir…DepuisListe`, qui garde une création en cours).
         */
        voir: async function (id) {
            id = String(id);
            sousSection(id);
            var ids = etat.ecran === 'cree' && etat.resume && etat.resume.ids;
            if (!ids) return;
            if (id === 'grille-criteres' && typeof window.ouvrirGrilleDepuisListe === 'function') await window.ouvrirGrilleDepuisListe(ids.grille);
            else if (id === 'echelle-performance' && typeof window.ouvrirEchelleDepuisListe === 'function') await window.ouvrirEchelleDepuisListe(ids.echelle);
            else if (id === 'retroactions' && ids.cartouche && typeof window.ouvrirCartoucheDepuisListe === 'function') await window.ouvrirCartoucheDepuisListe(ids.cartouche, ids.grille);
        },
        /** L'état de l'assistant (lecture) — pour les bancs. */
        etatCourant: function () { return etat; },
        modeleCourant: function () { return etat.modele; },
        apercuHtml: apercuHtml,
        assistantHtml: assistantHtml,
        confirmationHtml: confirmationHtml
    };

    function initialiser() {
        var zone = el('materiel-zone-collage');
        if (zone && !zone.dataset.materielBranche) {
            zone.addEventListener('paste', surCollage);
            zone.dataset.materielBranche = '1';
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiser);
    else initialiser();

    window.materiel = materiel;
})();
