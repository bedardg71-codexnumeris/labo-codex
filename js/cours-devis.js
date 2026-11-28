/**
 * cours-devis.js — Cadre › « Cours et services » : créer un cours à partir d'un devis rangé.
 *
 * Lot « Créer un cours à partir d'un devis rangé » (28 nov. 2026, demande de Grégoire, 8 h 06 à 8 h 16). Ses mots sur le
 * partage des rôles : le nom et le code du cours relèvent de l'institution, c'est l'utilisateur qui les remplit ; la
 * structure du contenu, les standards, les éléments de compétence relèvent du ministère.
 *
 * Dans le formulaire d'un cours EN CRÉATION, l'enseignant·e choisit un devis rangé (ou « Aucun »). L'application propose
 * alors, champ par champ, ce que ce devis porte ; chaque proposition se confirme une à une, ou reçoit « Autre ».
 *
 * LES RÈGLES (tranchées par la conversation du Projet, 28 nov., 10 h 05) :
 *   - RIEN N'EST ACCEPTÉ D'OFFICE : une proposition non confirmée n'est pas dans le champ, et ne s'écrit pas ;
 *   - « AUTRE » N'ÉCRIT RIEN : il laisse le champ tel qu'il est et y porte le curseur ;
 *   - les valeurs sont COPIÉES dans le formulaire ; le cours ne retient que le CODE du devis (`devisCode`) ;
 *   - ce fichier ne fait que LIRE la réserve de devis (par `materielDevis.reserveCourante`, qui rend celle de la
 *     démonstration quand on y est) : il n'écrit ni la réserve, ni le cours. L'écrivain du cours reste
 *     `sauvegarderCoursV2` (js/trimestre-v2-cours.js), qui lit le formulaire comme avant ;
 *   - la discipline n'est jamais rapprochée : le texte du devis sert de repère à côté du menu ;
 *   - les critères de performance et le contexte de réalisation restent dans le devis.
 *
 * Sécurité (règle 1 du projet) : tout texte d'un devis passe par `echapperHtml()` ; les champs se posent par `.value`.
 * Actions par `data-action` (dispatcher de main.js), saisies par des écouteurs délégués.
 *
 * LES MOTS : des mots de travail (Claude Code, 28 nov.), tous dans `T`, à relire par Grégoire :
 * plans de travail/TEXTES-2026-11-28-devis-ministeriel.md (numéros 51 et suivants).
 *
 * CHARGÉ APRÈS devis-lecture.js et materiel-devis.js, AVANT trimestre-v2-cours.js.
 */
(function () {
    'use strict';

    var T = {
        etiquette: 'Devis ministériel',
        aucun: 'Aucun (tout remplir à la main)',
        aide: 'Choisis un devis rangé : l’application proposera ses valeurs, que tu confirmeras une à une.',
        aucunRange: 'Aucun devis ministériel n’est rangé. Si tu en numérises un dans Conception › Mon matériel, l’application proposera ici ses valeurs.',
        titre: 'Ce que le devis propose',
        consigne: 'Rien n’est écrit dans le cours tant que tu n’as pas confirmé. « Autre » te laisse le champ pour reformuler ou écrire ta propre valeur.',
        champs: { numero: 'N° de la compétence', enonce: 'Compétence', ponderation: 'Pondération', heures: 'Heures d’enseignement' },
        confirmer: 'Confirmer',
        autre: 'Autre',
        etats: { attente: 'À confirmer', confirme: 'Confirmé', autre: 'Autre : à écrire dans le champ' },
        repereTitre: 'Repères du devis',
        repereDiscipline: 'Discipline, d’après le devis :',
        repereDisciplineSuite: 'Choisis la discipline dans le menu.',
        repereHeures: 'Heures ou périodes, d’après le devis :',
        reperePonderation: 'Pondération, d’après le devis :',
        elements: 'Éléments de compétence',
        garder: 'Garder',
        reformuler: 'Reformuler',
        retirer: 'Retirer',
        etatsElement: { attente: 'À confirmer', garde: 'Gardé', reformule: 'Reformulé', retire: 'Retiré' },
        ajouter: 'Ajouter un élément',
        ajoute: 'Ajouté',
        elementNeuf: 'Nouvel élément',
        sansReponse: function (n) {
            return n === 1 ? '1 proposition est restée sans réponse : elle ne sera pas écrite dans le cours.'
                : n + ' propositions sont restées sans réponse : elles ne seront pas écrites dans le cours.';
        },
        toutRepondu: 'Toutes les propositions ont reçu une réponse.',
        lien: function (code) { return 'Voir le devis ' + code + ' dans « Apporter mon matériel »'; },
        lienIntro: function (code) { return 'Ce cours a été créé à partir du devis ' + code + '.'; },
        lienAbsent: function (code) { return 'Ce cours a été créé à partir du devis ' + code + ', qui n’est pas rangé sur cet appareil.'; }
    };

    var CHAMPS = { numero: 'v2-numeroCompetence', enonce: 'v2-competence', ponderation: 'v2-ponderation', heures: 'v2-heuresEnseignement' };
    var C = {};

    // ------------------------------------------------------------------
    // 1. FONCTIONS PURES
    // ------------------------------------------------------------------

    /**
     * Ce qu'un devis rangé propose à la fiche d'un cours.
     *   - `ponderations` : chaque « n-n-n » que porte le texte du devis (« 2-2-3 ou 1-3-3 » en donne deux) ;
     *   - `heures` : un nombre SEULEMENT si le devis en donne un sans ambiguïté (le texte n'est qu'un nombre) ;
     *   - `reperes` : les textes du devis montrés à côté des champs, jamais écrits (discipline toujours ; heures et
     *     pondération quand rien ne peut se proposer).
     */
    C.propositions = function (devis) {
        var d = devis || {}, a = d.activites || {};
        var texte = function (v) { return typeof v === 'string' ? v.trim() : ''; };
        var ponderations = (texte(a.ponderation).match(/\d+\s*-\s*\d+\s*-\s*\d+/g) || []).map(function (p) { return p.replace(/\s/g, ''); })
            .filter(function (p, i, tous) { return tous.indexOf(p) === i; });
        var heures = /^\d{1,3}$/.test(texte(a.heures)) ? texte(a.heures) : '';
        return {
            code: texte(d.code),
            numero: texte(d.code),
            enonce: texte(d.enonce),
            ponderations: ponderations,
            heures: heures,
            elements: (Array.isArray(d.elements) ? d.elements : []).map(function (el) { return texte(el && el.texte); }).filter(Boolean),
            reperes: {
                discipline: texte(a.discipline),
                heures: heures ? '' : texte(a.heures),
                ponderation: ponderations.length ? '' : texte(a.ponderation)
            }
        };
    };

    /** L'état d'un choix tout neuf : rien n'est confirmé. */
    C.etatNeuf = function (p) {
        var reponses = {};
        if (p.numero) reponses.numero = { etat: 'attente' };
        if (p.enonce) reponses.enonce = { etat: 'attente' };
        if (p.ponderations.length) reponses.ponderation = { etat: 'attente' };
        if (p.heures) reponses.heures = { etat: 'attente' };
        return { code: p.code, reponses: reponses, elements: p.elements.map(function (t) { return { texte: t, etat: 'attente', valeur: t }; }), ajoutes: [], dernierTexteElements: '' };
    };

    /** Les éléments que le cours recevra : gardés et reformulés dans l'ordre du devis, puis les ajoutés ; un par ligne. */
    C.composerElements = function (etat) {
        var gardes = etat.elements.filter(function (el) { return el.etat === 'garde' || el.etat === 'reformule'; })
            .map(function (el) { return el.etat === 'garde' ? el.texte : el.valeur; });
        return gardes.concat(etat.ajoutes.map(function (a) { return a.valeur; }))
            .map(function (t) { return String(t || '').replace(/\s+/g, ' ').trim(); }).filter(Boolean).join('\n');
    };

    /** Combien de propositions n'ont pas reçu de réponse (elles ne s'écriront pas). */
    C.sansReponse = function (etat) {
        return Object.keys(etat.reponses).filter(function (k) { return etat.reponses[k].etat === 'attente'; }).length +
            etat.elements.filter(function (el) { return el.etat === 'attente'; }).length;
    };

    /** Le cours vient-il de ce devis ? Oui dès qu'une proposition a été confirmée, ou un élément gardé ou reformulé. */
    C.aPuise = function (etat) {
        return Object.keys(etat.reponses).some(function (k) { return etat.reponses[k].etat === 'confirme'; }) ||
            etat.elements.some(function (el) { return el.etat === 'garde' || el.etat === 'reformule'; });
    };

    // ------------------------------------------------------------------
    // 2. L'ÉCRAN
    // ------------------------------------------------------------------

    var etat = null;        // le choix en cours (null : « Aucun », ou pas en création)
    var reserve = [];
    var enCreation = false;

    function e(v) { return echapperHtml(v == null ? '' : v); }
    function el(id) { return document.getElementById(id); }
    function champ(nom) { return el(CHAMPS[nom]); }
    function devisChoisi() { return etat ? reserve.find(function (d) { return d.code === etat.code; }) || null : null; }
    function estService() { var n = el('v2-natureCours'); return !!n && n.value === 'service'; }
    function lireReserve() {
        return window.materielDevis && typeof window.materielDevis.reserveCourante === 'function' ? window.materielDevis.reserveCourante() : [];
    }

    function boutons(nom, valeur, i) {
        var r = etat.reponses[nom], confirme = r.etat === 'confirme' && r.valeur === valeur;
        return '<span class="cours-devis-etat' + (confirme ? ' est-confirme' : '') + '">' + e(confirme ? T.etats.confirme : r.etat === 'autre' ? T.etats.autre : T.etats.attente) + '</span>' +
            '<button type="button" class="btn btn-secondaire btn-compact" data-action="coursDevis.confirmer" data-param="' + nom + '" data-param2="' + i + '"' + (confirme ? ' aria-pressed="true"' : '') + '>' + e(T.confirmer) + '</button>';
    }

    function propositionHtml(nom, valeurs) {
        if (!etat.reponses[nom]) return '';
        var r = etat.reponses[nom];
        return '<div class="cours-devis-ligne" data-champ="' + nom + '"><span class="cours-devis-nom">' + e(T.champs[nom]) + '</span>' +
            '<div class="cours-devis-valeurs">' + valeurs.map(function (v, i) {
                return '<div class="cours-devis-valeur"><span class="cours-devis-texte">' + e(v) + '</span>' + boutons(nom, v, i) + '</div>';
            }).join('') +
            '<div class="cours-devis-valeur"><button type="button" class="btn btn-secondaire btn-compact" data-action="coursDevis.autre" data-param="' + nom + '"' + (r.etat === 'autre' ? ' aria-pressed="true"' : '') + '>' + e(T.autre) + '</button></div>' +
            '</div></div>';
    }

    function elementHtml(x, i) {
        var bouton = function (geste, mot) {
            var actif = (geste === 'garder' && x.etat === 'garde') || (geste === 'reformuler' && x.etat === 'reformule') || (geste === 'retirer' && x.etat === 'retire');
            return '<button type="button" class="btn btn-secondaire btn-compact" data-action="coursDevis.element" data-param="' + i + '" data-param2="' + geste + '"' + (actif ? ' aria-pressed="true"' : '') + '>' + e(mot) + '</button>';
        };
        return '<li class="cours-devis-element' + (x.etat === 'retire' ? ' est-retire' : '') + '">' +
            '<span class="cours-devis-texte">' + e(x.texte) + '</span>' +
            (x.etat === 'reformule' ? '<input type="text" class="controle-form cours-devis-reformule" data-cours-devis-element="' + i + '" aria-label="' + e(T.reformuler + ' : ' + x.texte) + '">' : '') +
            '<div class="cours-devis-gestes"><span class="cours-devis-etat' + (x.etat === 'garde' || x.etat === 'reformule' ? ' est-confirme' : '') + '">' + e(T.etatsElement[x.etat]) + '</span>' +
            bouton('garder', T.garder) + bouton('reformuler', T.reformuler) + bouton('retirer', T.retirer) + '</div></li>';
    }

    function reperesHtml(p) {
        var lignes = [];
        if (p.reperes.discipline) lignes.push('<li><span class="cours-devis-nom">' + e(T.repereDiscipline) + '</span> <strong>' + e(p.reperes.discipline) + '</strong> ' + e(T.repereDisciplineSuite) + '</li>');
        if (p.reperes.ponderation) lignes.push('<li><span class="cours-devis-nom">' + e(T.reperePonderation) + '</span> <strong>' + e(p.reperes.ponderation) + '</strong></li>');
        if (p.reperes.heures) lignes.push('<li><span class="cours-devis-nom">' + e(T.repereHeures) + '</span> <strong>' + e(p.reperes.heures) + '</strong></li>');
        return lignes.length ? '<div class="cours-devis-reperes"><h5>' + e(T.repereTitre) + '</h5><ul>' + lignes.join('') + '</ul></div>' : '';
    }

    function propositionsHtml() {
        var d = devisChoisi();
        if (!etat || !d) return '';
        var p = C.propositions(d), n = C.sansReponse(etat);
        var elements = !etat.elements.length && !etat.ajoutes.length ? '' :
            '<ul class="cours-devis-elements">' + etat.elements.map(elementHtml).join('') +
            etat.ajoutes.map(function (a, i) {
                return '<li class="cours-devis-element"><input type="text" class="controle-form cours-devis-reformule" data-cours-devis-ajoute="' + i + '" aria-label="' + e(T.elementNeuf) + '" placeholder="' + e(T.elementNeuf) + '">' +
                    '<div class="cours-devis-gestes"><span class="cours-devis-etat est-confirme">' + e(T.ajoute) + '</span>' +
                    '<button type="button" class="btn btn-secondaire btn-compact" data-action="coursDevis.retirerAjoute" data-param="' + i + '">' + e(T.retirer) + '</button></div></li>';
            }).join('') + '</ul>';
        return '<div class="cours-devis-propositions"><h5 id="v2-devisTitre" tabindex="-1">' + e(T.titre) + '</h5>' +
            '<p class="cours-devis-consigne">' + e(T.consigne) + '</p>' +
            propositionHtml('numero', [p.numero]) + propositionHtml('enonce', [p.enonce]) +
            propositionHtml('ponderation', p.ponderations) + propositionHtml('heures', [p.heures]) + reperesHtml(p) +
            '<div class="cours-devis-ligne"><span class="cours-devis-nom">' + e(T.elements) + '</span><div class="cours-devis-valeurs">' + elements +
            '<button type="button" class="btn btn-secondaire btn-compact" data-action="coursDevis.ajouterElement">' + e(T.ajouter) + '</button></div></div>' +
            '<p id="v2-devisBilan" class="cours-devis-bilan' + (n ? ' est-incomplet' : '') + '" role="status" aria-live="polite">' + e(n ? T.sansReponse(n) : T.toutRepondu) + '</p></div>';
    }

    /** Le lien d'une fiche existante vers le devis dont elle vient ; il dit quand ce devis n'est plus rangé ici. */
    function lienHtml(code) {
        var range = reserve.some(function (d) { return d.code === code; });
        if (!range) return '<p class="cours-devis-lien">' + e(T.lienAbsent(code)) + '</p>';
        return '<p class="cours-devis-lien">' + e(T.lienIntro(code)) + ' <button type="button" class="materiel-btn-lien" data-action="coursDevis.voirDevis" data-param-code="' + e(code) + '">' + e(T.lien(code)) + '</button></p>';
    }

    function blocHtml(codeLie) {
        if (!enCreation) return codeLie ? lienHtml(codeLie) : '';
        if (!reserve.length) return '<p class="cours-devis-aucun">' + e(T.aucunRange) + '</p>';
        return '<div class="groupe-form"><label for="v2-devisCours">' + e(T.etiquette) + '</label>' +
            '<select id="v2-devisCours" class="controle-form"><option value="">' + e(T.aucun) + '</option>' +
            reserve.map(function (d) {
                return '<option value="' + e(d.code) + '"' + (etat && etat.code === d.code ? ' selected' : '') + '>' + e(d.code + ' – ' + d.enonce) + '</option>';
            }).join('') + '</select><span class="u-texte-075 u-texte-gris">' + e(T.aide) + '</span></div>' + propositionsHtml();
    }

    function rendre(codeLie, focus) {
        var bloc = el('v2-devisBloc');
        if (!bloc) return;
        brancher(bloc);
        var html = estService() ? '' : blocHtml(codeLie);
        bloc.innerHTML = html;   // security-ok: tout texte passe par echapperHtml
        bloc.classList.toggle('u-hide', !html);
        if (etat) {
            etat.elements.forEach(function (x, i) { var c = bloc.querySelector('[data-cours-devis-element="' + i + '"]'); if (c) c.value = x.valeur; });
            etat.ajoutes.forEach(function (a, i) { var c = bloc.querySelector('[data-cours-devis-ajoute="' + i + '"]'); if (c) c.value = a.valeur; });
        }
        var cible = focus ? bloc.querySelector(focus) : null;
        if (cible) cible.focus();
    }

    /** Pose une valeur dans un champ de la fiche et prévient ses écouteurs (la pondération propose les heures). */
    function poser(nom, valeur) {
        var c = champ(nom);
        if (!c) return;
        c.value = valeur;
        c.dispatchEvent(new Event('input', { bubbles: true }));
        if (nom === 'ponderation' && typeof window.proposerHeuresEnseignementDepuisPonderation === 'function') window.proposerHeuresEnseignementDepuisPonderation();
    }

    /** Écrit dans le champ des éléments ce que les gestes composent ; rien quand aucun geste n'a encore gardé d'élément. */
    function poserElements() {
        var zone = el('v2-elementsCompetence');
        if (!zone || !etat) return;
        var texte = C.composerElements(etat);
        // Ne remplace que ce que l'application y a elle-même écrit : une saisie de l'enseignant·e n'est jamais effacée.
        if (zone.value.trim() && zone.value.trim() !== etat.dernierTexteElements) return;
        zone.value = texte;
        etat.dernierTexteElements = texte;
    }

    /** Changer de devis : ce que les confirmations du devis précédent ont posé repart ; ce qui a été tapé reste. */
    function retirerCeQuiVientDuDevis() {
        if (!etat) return;
        Object.keys(etat.reponses).forEach(function (nom) {
            var r = etat.reponses[nom], c = champ(nom);
            if (r.etat === 'confirme' && c && String(c.value).trim() === String(r.valeur)) c.value = '';
        });
        var zone = el('v2-elementsCompetence');
        if (zone && etat.dernierTexteElements && zone.value.trim() === etat.dernierTexteElements) zone.value = '';
    }

    function choisir(code) {
        retirerCeQuiVientDuDevis();
        var d = reserve.find(function (x) { return x.code === code; });
        etat = d ? C.etatNeuf(C.propositions(d)) : null;
        rendre('', etat ? '#v2-devisTitre' : '#v2-devisCours');
    }

    function brancher(bloc) {
        if (bloc.dataset.coursDevisBranche) return;
        bloc.dataset.coursDevisBranche = '1';
        bloc.addEventListener('change', function (ev) {
            if (ev.target && ev.target.id === 'v2-devisCours') choisir(ev.target.value);
        });
        bloc.addEventListener('input', function (ev) {
            var t = ev.target;
            if (!etat || !t || !t.dataset) return;
            if (t.dataset.coursDevisElement !== undefined) etat.elements[Number(t.dataset.coursDevisElement)].valeur = t.value;
            else if (t.dataset.coursDevisAjoute !== undefined) etat.ajoutes[Number(t.dataset.coursDevisAjoute)].valeur = t.value;
            else return;
            poserElements();
        });
    }

    var coursDevis = {
        /** Le formulaire d'un cours neuf s'ouvre : la liste des devis rangés, « Aucun » choisi. */
        preparerCreation: function () {
            enCreation = true;
            etat = null;
            reserve = lireReserve();
            rendre('');
        },
        /** Une fiche existante s'ouvre : pas de propositions (le mode modification est hors du lot), seulement le lien. */
        montrerFiche: function (cours) {
            enCreation = false;
            etat = null;
            reserve = lireReserve();
            rendre(cours && typeof cours.devisCode === 'string' ? cours.devisCode : '');
        },
        /** La nature a changé (un service n'a pas de devis) : le bloc suit, sans rien perdre du choix en cours. */
        suivreNature: function () {
            var bloc = el('v2-devisBloc');
            if (!bloc || !enCreation) return;
            if (estService()) { bloc.classList.add('u-hide'); return; }
            rendre('');
        },
        /** Geste 4 : confirmer une proposition. C'est le SEUL geste qui pose une valeur du devis dans un champ. */
        confirmer: function (nom, i) {
            var d = devisChoisi();
            if (!etat || !d || !etat.reponses[nom]) return;
            var p = C.propositions(d);
            var valeur = nom === 'ponderation' ? p.ponderations[Number(i) || 0] : p[nom];
            if (!valeur) return;
            etat.reponses[nom] = { etat: 'confirme', valeur: valeur };
            poser(nom, valeur);
            rendre('', '[data-champ="' + nom + '"] [aria-pressed="true"]');
        },
        /** « Autre » : n'écrit RIEN. Le champ garde ce qu'il porte (vide, ou la valeur confirmée à reformuler) et reçoit le curseur. */
        autre: function (nom) {
            if (!etat || !etat.reponses[nom]) return;
            etat.reponses[nom] = { etat: 'autre' };
            rendre('');
            var c = champ(nom);
            if (c) c.focus();
        },
        /** Geste 5 : garder, reformuler ou retirer un élément du devis. */
        element: function (i, geste) {
            var x = etat && etat.elements[Number(i)];
            if (!x) return;
            x.etat = geste === 'garder' ? 'garde' : geste === 'reformuler' ? 'reformule' : 'retire';
            poserElements();
            rendre('', geste === 'reformuler' ? '[data-cours-devis-element="' + Number(i) + '"]' : '.cours-devis-element:nth-child(' + (Number(i) + 1) + ') [aria-pressed="true"]');
        },
        ajouterElement: function () {
            if (!etat) return;
            etat.ajoutes.push({ valeur: '' });
            rendre('', '[data-cours-devis-ajoute="' + (etat.ajoutes.length - 1) + '"]');
        },
        retirerAjoute: function (i) {
            if (!etat || !etat.ajoutes[Number(i)]) return;
            etat.ajoutes.splice(Number(i), 1);
            poserElements();
            rendre('');
        },
        /**
         * Le code du devis que le cours en création retiendra (`devisCode`), ou '' : « Aucun », un service, une fiche
         * existante, ou un devis choisi dont rien n'a été confirmé (le cours n'en vient pas).
         */
        codeRetenu: function () {
            return enCreation && etat && !estService() && C.aPuise(etat) ? etat.code : '';
        },
        /** Depuis la fiche d'un cours : ouvrir son devis dans « Apporter mon matériel » (`data-param-code`). */
        voirDevis: function (bouton) {
            var code = bouton && bouton.dataset ? bouton.dataset.paramCode : String(bouton);
            if (window.materielDevis && typeof window.materielDevis.rouvrirParCode === 'function') window.materielDevis.rouvrirParCode(code);
        },
        textes: T
    };

    Object.keys(C).forEach(function (k) { coursDevis[k] = C[k]; });
    window.coursDevis = coursDevis;
})();
