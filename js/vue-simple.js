/**
 * VUE SIMPLE — l'écran (lot « Vue simple », consigne de Cowork du 9 nov. 2026)
 *
 * Rapport : `plans de travail/RAPPORT-2026-11-09-vue-simple.md`. Fonctions pures : `vue-simple-donnees.js`.
 *
 * Deux vues, « Vue simple » et « Vue étendue » (arrêté par Grégoire). La vue simple réduit l'application à une fonction :
 * passer de résultats non sommatifs à une note chiffrée. Elle MASQUE, elle ne retire rien : classe, pratique, productions
 * et résultats s'écrivent aux clés de la vue étendue, par ses chemins (`creerTrimestre`, `CoursEntite.creer`,
 * `modifierEtAnnoncer`, `PratiqueManager.changerPratiqueActive`, le tableau de notation). Basculer n'écrit rien dans les
 * données : le choix de la vue vit dans `localStorage`, hors de `db`.
 *
 * LA RÈGLE (arrêtée par Grégoire) : la vue simple ne nomme rien qui n'existe pas dans les données de l'utilisateur.
 *
 * `js/config.js` et `js/navigation.js` (zones protégées) NE SONT PAS TOUCHÉS : cinq sections neuves dans index.html
 * (`#section-simple-*`), une seconde barre de navigation, une classe sur `<body>`. `afficherSection` les affiche telles quelles.
 *
 * MOTS : ceux marqués « ARRÊTÉ » sont de Grégoire, mot pour mot. Tous les autres sont PROPOSÉS (Cowork ou Claude Code) et
 * attendent sa validation ; ils sont listés au rapport, un par ligne.
 */
(function () {
    'use strict';

    const D = () => window.VueSimpleDonnees;
    const esc = (t) => echapperHtml(t == null ? '' : String(t));

    const MOTS = Object.freeze({
        // ARRÊTÉ par Grégoire, mot pour mot (9 nov. 2026)
        titreAccueil: 'Ta notation alternative',
        boutonSauvegarder: 'Sauvegarder',
        phraseSauvegarder: 'Tes données restent dans ce navigateur. Enregistre-les dans un fichier, ton codex, pour ne pas les perdre et pour les rouvrir ailleurs.',
        vueSimple: 'Vue simple',
        vueEtendue: 'Vue étendue',
        // ARRÊTÉ par Grégoire (9 nov. 2026, 19 h 35) : « étudiant·e », « étudiant·es » partout en vue simple, jamais « élève » ;
        // le texte de la carte 4, mot pour mot.
        sousTitreAccueil: 'Quatre étapes, de ta liste d’étudiant·es à ta note finale.',
        cartes: [
            { ecran: 'classe', titre: 'Ta classe', texte: 'Colle ta liste d’étudiant·es : DA, nom, prénom.', lien: 'Coller ma liste' },
            { ecran: 'pratique', titre: 'Ta pratique', texte: 'Choisis un modèle, par standards ou par spécifications, et la règle qui construit la note.', lien: 'Choisir un modèle' },
            { ecran: 'resultats', titre: 'Tes résultats', texte: 'Inscris un niveau, ou acceptable / non acceptable, dans un tableau : tes étudiant·es en lignes, tes productions en colonnes.', lien: 'Ouvrir le tableau' },
            { ecran: 'note', titre: 'Ta note finale', texte: 'Vois la note de chaque étudiant·e et exporte-les en CSV, prêtes pour ton relevé.', lien: 'Voir les notes' }
        ],
        // PROPOSÉ par Claude Code (9 nov. 2026) ; « élève » remplacé par « étudiant·e » sur décision de Grégoire
        nav: { accueil: 'Accueil', classe: 'Classe', pratique: 'Pratique', resultats: 'Résultats', note: 'Note finale' },
        // — Classe
        classeTitre: 'Ta classe',
        classeIntro: 'Colle ta liste d’étudiant·es, une ligne par étudiant·e : DA, nom, prénom.',
        classeExemple: '1234567, Tremblay, Alice',
        classeNomCours: 'Nom du cours (facultatif)',
        classeNomCoursDefaut: 'Mon cours',
        classeListe: 'Ta liste',
        classeCreer: 'Créer ma classe',
        classeAjouterTitre: 'Ajouter des étudiant·es',
        classeAjouter: 'Ajouter à ma classe',
        classeColonnes: ['DA', 'Nom', 'Prénom'],
        classeCompte: (n) => `${n} étudiant·e${n > 1 ? 's' : ''}`,
        // VALIDÉES par Grégoire, mot pour mot (9 nov. 2026, 20 h 49) : deux tournures, à la place des accords empilés.
        classeAucunLu: 'Aucune ligne lue. Une ligne par étudiant·e : DA, nom, prénom.',
        classeRefusees: (n) => `${n} ligne${n > 1 ? 's' : ''} non lue${n > 1 ? 's' : ''} :`,
        classeCreee: (n) => `Classe créée : ${n} étudiant·e${n > 1 ? 's' : ''}.`,
        classeAjoutes: (n, deja) => `${n} étudiant·e${n > 1 ? 's' : ''} de plus dans ta classe.` + (deja ? ` ${deja} y ${deja > 1 ? 'étaient' : 'était'} déjà.` : ''),
        classeSuite: 'Choisir ma pratique',
        classeEnDemo: 'La démonstration est ouverte. Quitte-la pour créer ta classe.',
        classeEchec: 'La classe n’a pas pu être créée.',
        // — le groupe
        groupe: 'Groupe',
        groupeChoisir: 'Choisis un groupe',
        groupeAutrePratique: 'autre pratique',
        groupeMotAutres: 'Un groupe dont la pratique n’est ni par standards ni par spécifications se suit en vue étendue.',
        sansClasse: 'Commence par ta classe : colle ta liste d’étudiant·es.',
        sansClasseLien: 'Coller ma liste',
        // — Pratique
        pratiqueTitre: 'Ta pratique',
        pratiqueIntro: 'Choisis un modèle. Tu régleras ensuite la règle qui construit la note.',
        modeles: [
            { famille: 'standards', modele: 'STD-n-meilleurs', titre: 'Par standards', texte: 'Chaque production reçoit un niveau. La note se construit à partir des niveaux que la règle retient.', lien: 'Choisir les standards' },
            { famille: 'specifications', modele: 'SPE-simple', titre: 'Par spécifications', texte: 'Chaque production est acceptable ou non acceptable. La note dépend du nombre de productions acceptables.', lien: 'Choisir les spécifications' }
        ],
        pratiqueModele: 'Modèle',
        pratiqueRegle: 'La règle qui construit la note',
        // LE GESTE (règle validée par Grégoire, 9 nov. 2026, 19 h 44) : tout ce qui entre dans la note a une valeur de départ
        // et se règle, à un geste, près de la valeur ; rien ne se règle avant d'avoir une note. Mot proposé par Cowork.
        regler: 'Régler',
        reglerEnregistrer: 'Enregistrer',
        reglerAnnuler: 'Annuler',
        regleNombre: 'Nombre de productions retenues',
        regleEnregistree: 'Règle enregistrée.',
        regleAutre: 'La règle de cette pratique se change en vue étendue.',
        // — les niveaux (standards)
        niveauxTitre: 'Tes niveaux',
        // VALIDÉE par Grégoire, mot pour mot (9 nov. 2026, 20 h 55) : plus de « sur 100 », un niveau peut valoir davantage.
        niveauxAide: 'Chaque niveau a une lettre, un nom et une valeur. La note se construit avec ces valeurs.',
        niveauColonnes: ['Lettre', 'Nom', 'Valeur'],
        niveauAjouter: '+ Niveau',
        niveauRetirer: 'Retirer',
        niveauMonter: 'Monter',
        niveauDescendre: 'Descendre',
        niveauxEnregistres: 'Niveaux enregistrés.',
        niveauxAucun: 'Cette pratique n’a pas encore de niveaux.',
        // — les types et les paliers (spécifications)
        typesTitre: 'Tes types de productions',
        typesAide: 'Chaque production de ton tableau est d’un type. Les paliers comptent les productions acceptables de chaque type.',
        typeNom: 'Nom du type',
        typeAjouter: '+ Type',
        typeRetirer: 'Retirer',
        typesEnregistres: 'Types enregistrés.',
        paliersTitre: 'Tes paliers',
        paliersNom: 'Palier',
        paliersNote: 'Note',
        paliersAide: 'Pour chaque palier, sa note et le nombre de productions acceptables qu’il faut, par type. Un palier sans exigence est le plancher.',
        palierAjouter: '+ Palier',
        palierRetirer: 'Retirer',
        paliersEnregistres: 'Paliers enregistrés.',
        palierSansExigence: 'aucune exigence',
        refus: {
            minimumNiveaux: () => 'Il faut au moins deux niveaux.',
            niveauUtilise: (r) => `Le niveau « ${r.nom} » est inscrit dans ${r.n} résultat${r.n > 1 ? 's' : ''} du tableau : il ne se retire pas. Aucun résultat n’a été effacé.`,
            lettreUtilisee: (r) => `La lettre « ${r.nom} » est inscrite dans ${r.n} résultat${r.n > 1 ? 's' : ''} du tableau : elle ne se change pas. Aucun résultat n’a été effacé.`,
            niveauIncomplet: () => 'Chaque niveau a une lettre et un nom.',
            valeurNiveau: () => 'Chaque niveau a une valeur : un nombre, zéro ou plus.',
            lettreEnDouble: () => 'Deux niveaux portent la même lettre.',
            minimumTypes: () => 'Il faut au moins un type.',
            typeUtilise: (r) => `${r.n} production${r.n > 1 ? 's' : ''} de ton tableau ${r.n > 1 ? 'sont' : 'est'} du type « ${r.nom} » : il ne se retire pas. Aucune production n’a été touchée.`,
            typeSansNom: () => 'Chaque type a un nom.',
            typeEnDouble: () => 'Deux types portent le même nom.',
            minimumPaliers: () => 'Il faut au moins un palier.',
            palierSansNom: () => 'Chaque palier a un nom.',
            notePalier: () => 'Chaque palier a une note, de 0 à 100.',
            deuxPlanchers: () => 'Un seul palier peut n’avoir aucune exigence : c’est le plancher.',
            plancherTropHaut: (r) => `« ${r.nom} » n’a aucune exigence : c’est le plancher, sa note doit être la plus basse.`,
            typeRattache: (r) => `Le nom « ${r.nom} » rattacherait ou détacherait des productions de ton tableau : choisis-en un autre.`
        },
        pratiqueChanger: 'Changer de modèle',
        pratiqueAutre: 'La pratique de ce groupe n’est ni par standards ni par spécifications : elle se règle en vue étendue.',
        pratiqueSuite: 'Ouvrir le tableau',
        pratiqueEchec: 'La pratique n’a pas pu être enregistrée.',
        reglePartagee: (n) => `Ce réglage vaut pour les ${n} groupes qui ont cette pratique.`,
        // — Résultats (le tableau garde ses mots validés ; ceux-ci remplacent les messages qui nomment la vue étendue)
        tableau: {
            aucunePratique: 'Ce groupe n’a pas encore de pratique. Choisis un modèle : le tableau suivra sa règle.',
            autreFamille: 'Le tableau sert aux pratiques par standards et par spécifications. La pratique de ce groupe se suit en vue étendue.',
            aucunEleve: 'Ce groupe n’a pas encore d’étudiant·es. Colle ta liste pour remplir le tableau.',
            aucuneProduction: 'Ton tableau n’a pas encore de colonne. Ajoute ta première production : un nom et une date.'
        },
        plusProduction: '+ Production',
        productionNom: 'Nom de la production',
        productionDate: 'Date',
        productionType: 'Type',
        productionAjouter: 'Ajouter',
        productionAnnuler: 'Annuler',
        productionSansNom: 'Donne un nom à la production.',
        // — une colonne du tableau (PROPOSÉ, 10 nov. 2026)
        colonneRegler: (titre) => `Régler la colonne « ${titre} »`,
        colonneCompte: 'Compte dans la note',
        colonneHors: 'ne compte pas',
        colonneEnregistrer: 'Enregistrer',
        colonneRetirer: 'Retirer la colonne',
        colonneCombien: (n, m) => ` ${n} production${n > 1 ? 's' : ''} sur ${m} compte${n > 1 ? 'nt' : ''}.`,
        colonnePleine: (r) => `Cette colonne porte ${[r.evaluations ? `${r.evaluations} résultat${r.evaluations > 1 ? 's' : ''}` : '', r.copies ? `${r.copies} fichier${r.copies > 1 ? 's' : ''}` : ''].filter(Boolean).join(' et ')} : elle ne se retire pas. Rien n’a été effacé.`,
        colonneMarquerHors: 'La marquer « ne compte pas »',
        // — la mise à jour des valeurs (question PROPOSÉE par Cowork, 9 nov. 2026, 20 h 49)
        majQuestion: (n) => `${n} résultat${n > 1 ? 's ont été saisis' : ' a été saisi'} avec les anciennes valeurs. ${n > 1 ? 'Les' : 'Le'} mettre à jour ?`,
        majGroupes: (g) => `Ils sont dans les ${g} groupes qui ont cette pratique.`,
        majOui: 'Mettre à jour',
        majNon: 'Garder les anciennes valeurs',
        majFaite: (n) => `${n} résultat${n > 1 ? 's' : ''} mis à jour. « Annuler », au tableau, ${n > 1 ? 'les' : 'le'} remet comme avant.`,
        // — Note finale
        noteTitre: 'Ta note finale',
        noteIntro: 'La note de chaque étudiant·e, construite par la règle de ta pratique à partir des résultats du tableau.',
        noteColonnes: ['Étudiant·e', 'Note'],
        noteSansEleve: 'Aucune note à montrer : ce groupe n’a pas encore d’étudiant·es.',
        // — Sauvegarder
        sauvegarderEnregistrer: 'Enregistrer dans un fichier',
        sauvegarderOuvrir: 'Ouvrir un fichier…',
        sauvegardeAJour: 'Ton fichier est à jour.',
        sauvegardePasAJour: 'Ton fichier n’a pas tes derniers changements.',
        // — le menu
        sousVueEtendue: 'Toutes les fonctions',   // PROPOSÉ par Cowork
        sousVueSimple: 'Ta notation seulement'    // PROPOSÉ par Cowork
    });

    /**
     * Le seul point d'écriture de HTML de ce module. Chaque chaîne reçue est bâtie par les fonctions `…HTML` et les rendus
     * ci-dessous, où TOUTE valeur interpolée passe par `esc` (= `echapperHtml`, config.js) : noms d'élèves, de cours, de
     * productions, de pratiques, lignes collées. Aucun handler inline : des `data-action` (dispatcher de main.js).
     */
    function _ecrire(noeud, html) {
        if (noeud) noeud.innerHTML = html;
    }

    let _vue = null;
    let _enCours = false;   // un geste d'écriture à la fois : un double clic ne crée pas deux cours, deux pratiques, deux colonnes

    /** Enveloppe un geste d'écriture : ignoré tant que le précédent n'a pas fini. */
    function _unALaFois(geste) {
        return async function () {
            if (_enCours) return;
            _enCours = true;
            try { await geste.apply(null, arguments); } finally { _enCours = false; }
        };
    }
    let _ecran = 'accueil';
    let _formulaireProduction = false;
    let _colonne = null;       // la colonne (production) que le formulaire règle ; null : « + Production »
    let _miseAJour = null;     // la question posée après un réglage de niveaux : { lot, groupes }

    /* ============================== LA VUE ============================== */

    function _lireChoix() {
        try { return window.localStorage.getItem(D().CLE_CHOIX); } catch (e) { return null; }
    }

    /** Le choix de la vue : `localStorage`, hors de `db` (il reste sur l'appareil et n'entre pas dans les données). */
    function _ecrireChoix(vue) {
        try { window.localStorage.setItem(D().CLE_CHOIX, vue); } catch (e) { console.warn('[Vue simple] choix non mémorisé :', e); }
    }

    function _vide() {
        const trimestres = db.getSync('trimestres', []) || [];
        return D().applicationVide(trimestres);
    }

    function _demoOuverte() {
        return typeof estEnModeDemo === 'function' && estEnModeDemo();
    }

    function vueCourante() { return _vue || D().VUES.ETENDUE; }
    function estSimple() { return _vue === D().VUES.SIMPLE; }

    /** Pose la vue : la classe du `<body>`, le bouton de l'en-tête, puis l'accueil de la vue. N'écrit rien. */
    function _poser(vue, naviguer) {
        _vue = vue;
        const simple = estSimple();
        document.body.classList.toggle('vue-simple', simple);
        const bouton = document.getElementById('btn-codex');
        const libelle = bouton && bouton.querySelector('.codex-label-btn');
        if (libelle) libelle.textContent = simple ? MOTS.boutonSauvegarder : 'Codex';
        if (bouton) bouton.setAttribute('aria-label', simple ? MOTS.boutonSauvegarder : 'Codex — ouvrir le menu');
        if (!simple && window.TableauNotation) window.TableauNotation.quitterPresentation();
        if (!naviguer) return;
        if (simple) aller('accueil');
        else if (typeof afficherSection === 'function') afficherSection('accueil');
    }

    /** La bascule du menu : un choix explicite, mémorisé sur l'appareil. Aucune donnée n'est écrite. */
    function basculer(vue) {
        const cible = vue === D().VUES.SIMPLE ? D().VUES.SIMPLE : D().VUES.ETENDUE;
        _ecrireChoix(cible);
        _poser(cible, true);
    }

    function _vueCalculee() {
        const pilote = typeof navigator !== 'undefined' && navigator.webdriver === true;   // un banc Playwright (voir `vueAuDemarrage`)
        // La marque du fichier ouvert (la vue d'où il a été enregistré) : une donnée du fichier, lue seulement, jamais écrite ici.
        const marque = db.getSync(D().CLE_MARQUE, null);
        return D().vueAuDemarrage({ choix: _lireChoix(), vide: _vide(), demoOuverte: _demoOuverte(), pilote, marque });
    }

    /** Au chargement de la page, puis quand les données sont lisibles (la marque d'un fichier peut vivre hors du cache synchrone). */
    function demarrer() {
        _poser(_vueCalculee(), true);
        if (typeof window.auDbPret === 'function') {
            window.auDbPret(() => {
                const vue = _vueCalculee();
                if (vue !== _vue) _poser(vue, true);
                else if (estSimple()) aller(_ecran);
            });
        }
    }

    /* ============================== LE CONTEXTE (lecture seule) ============================== */

    function _trimestreActif() {
        const t = (db.getSync('trimestres', []) || []).find((x) => x && x.actif);
        return t || null;
    }

    function _groupes() {
        if (!_trimestreActif()) return [];
        return (db.getSync(cle('groupesCours'), []) || []).filter((g) => g && g.id);
    }

    function _groupeActif() {
        const actif = db.getSync('groupeCoursActif', null);
        if (!actif || !actif.id) return null;
        return _groupes().find((g) => g.id === actif.id) || null;
    }

    function _cours(id) {
        return (db.getSync('cours', []) || []).find((c) => c && c.id === id) || null;
    }

    function _pratiques() {
        return (db.getSync(cle('pratiquesConfigurables'), []) || []).filter((p) => p && p.id);
    }

    function _pratiqueDuGroupe(groupe) {
        if (!groupe || !groupe.pratiqueId) return null;
        return _pratiques().find((p) => p.id === groupe.pratiqueId) || null;
    }

    /** 'standards', 'specifications', 'autre' (une pratique d'une autre famille, ou introuvable), ou null (aucune pratique). */
    function _famille(groupe) {
        if (!groupe || !groupe.pratiqueId) return null;
        const p = _pratiqueDuGroupe(groupe);
        const type = p ? String((p.configuration && p.configuration.type) || p.type || (p.config && p.config.type) || '') : '';
        if (/standard/i.test(type)) return D().FAMILLES.STD;
        if (/sp[ée]cification/i.test(type)) return D().FAMILLES.SPE;
        return 'autre';
    }

    function _nomGroupe(groupe) {
        const cours = _cours(groupe.coursId);
        const nomCours = cours ? (cours.nomCours || cours.codeCours || '') : '';
        return [nomCours, `${MOTS.groupe.toLowerCase()} ${groupe.groupeNum || ''}`.trim()].filter(Boolean).join(' · ');
    }

    function _eleves() {
        const tous = (typeof obtenirEtudiantsCoursActif === 'function') ? (obtenirEtudiantsCoursActif() || []) : [];
        return tous.filter((e) => e && e.da)
            .sort((a, b) => String(a.nom || '').localeCompare(String(b.nom || ''), 'fr') || String(a.prenom || '').localeCompare(String(b.prenom || ''), 'fr'));
    }

    function _productionsDuCours(coursId) {
        // Une production d'avant le rattachement au cours n'a pas de `coursId` : le tableau la montre, elle compte donc ici aussi.
        return (db.getSync(cle('productions'), []) || []).filter((p) => p && (!p.coursId || p.coursId === coursId));
    }

    function _aUneGrille() {
        return D().aUneGrille(db.getSync(cle('grillesTemplates'), []) || []);
    }

    /* ============================== LA NAVIGATION ============================== */

    function _conteneur(ecran) { return document.getElementById('simple-' + ecran + '-contenu'); }

    const RENDUS = { accueil: _rendreAccueil, classe: _rendreClasse, pratique: _rendrePratique, resultats: _rendreResultats, note: _rendreNote };

    /** Affiche un écran de la vue simple (les cinq entrées de la barre, et les liens des cartes). */
    function aller(ecran) {
        if (D().ECRANS.indexOf(ecran) < 0) ecran = 'accueil';
        if (_ecran === 'resultats' && ecran !== 'resultats' && window.TableauNotation) window.TableauNotation.quitterPresentation();
        _ecran = ecran;
        _formulaireProduction = false;
        _colonne = null;
        _miseAJour = null;
        _fermerReglage();
        if (typeof afficherSection === 'function') afficherSection('simple-' + ecran);
        RENDUS[ecran]();
        window.scrollTo(0, 0);
    }

    function _rafraichir() { if (estSimple()) RENDUS[_ecran](); }

    /** Le sélecteur de groupe : seulement s'il y a plus d'un groupe, ou aucun d'actif (décidé par Cowork). */
    function _selecteurGroupeHTML() {
        const groupes = _groupes();
        const actif = _groupeActif();
        if (groupes.length < 2 && actif) return '';
        if (!groupes.length) return '';
        const options = groupes.map((g) => {
            const autre = _famille(g) === 'autre';
            const nom = _nomGroupe(g) + (autre ? ` (${MOTS.groupeAutrePratique})` : '');
            return `<option value="${esc(g.id)}"${actif && actif.id === g.id ? ' selected' : ''}>${esc(nom)}</option>`;
        }).join('');
        const vide = actif ? '' : `<option value="" selected>${esc(MOTS.groupeChoisir)}</option>`;
        const mot = groupes.some((g) => _famille(g) === 'autre') ? `<p class="vs-note">${esc(MOTS.groupeMotAutres)}</p>` : '';
        const id = 'vs-select-groupe-' + _ecran;   // un sélecteur par écran : les autres sections restent dans le document
        return `<div class="vs-groupe"><label for="${esc(id)}">${esc(MOTS.groupe)}</label>
            <select id="${esc(id)}" class="controle-form vs-select" data-on-change="VueSimple.changerGroupe">${vide}${options}</select></div>${mot}`;
    }

    async function changerGroupe(el) {
        const id = el && el.value;
        if (!id || typeof changerGroupeCoursActifV2 !== 'function') return;
        _fermerReglage();   // le réglage ouvert est celui de la pratique de l'AUTRE groupe : il ne suit pas
        await changerGroupeCoursActifV2(id);
        _rafraichir();
    }

    function _sansClasseHTML() {
        return `<p class="vs-etat">${esc(MOTS.sansClasse)}</p>
            <p><button type="button" class="btn btn-principal" data-action="VueSimple.aller" data-param="classe">${esc(MOTS.sansClasseLien)}</button></p>`;
    }

    /* ============================== ACCUEIL ============================== */

    function _etatDesCartes() {
        const groupe = _groupeActif();
        if (!groupe) return {};
        const n = _eleves().length;
        const pratique = _pratiqueDuGroupe(groupe);
        const famille = _famille(groupe);
        const nomFamille = (MOTS.modeles.find((m) => m.famille === famille) || {}).titre;
        return {
            classe: n ? MOTS.classeCompte(n) : '',
            pratique: pratique ? (nomFamille || pratique.nom || '') : ''
        };
    }

    function _rendreAccueil() {
        const hote = _conteneur('accueil');
        if (!hote) return;
        const etats = _etatDesCartes();
        const cartes = MOTS.cartes.map((c, i) => `<li class="vs-etape">
                <span class="vs-etape-rang" aria-hidden="true">${i + 1}</span>
                <h3 class="vs-etape-titre">${esc(c.titre)}</h3>
                <p class="vs-etape-texte">${esc(c.texte)}</p>
                ${etats[c.ecran] ? `<p class="vs-etape-etat">${esc(etats[c.ecran])}</p>` : ''}
                <button type="button" class="btn btn-principal vs-etape-lien" data-action="VueSimple.aller" data-param="${esc(c.ecran)}">${esc(c.lien)}</button>
            </li>`).join('');
        _ecrire(hote, `<h2 class="vs-titre">${esc(MOTS.titreAccueil)}</h2>
            <p class="vs-intro">${esc(MOTS.sousTitreAccueil)}</p>
            <ol class="vs-etapes">${cartes}</ol>`);
    }

    /* ============================== CLASSE ============================== */

    function _refuseesHTML(refusees) {
        if (!refusees.length) return '';
        const lignes = refusees.map((r) => `<li><span class="vs-ligne-refusee">${esc(r.ligne)}</span> : ${esc(r.raison)}</li>`).join('');
        return `<div class="vs-refusees" role="status"><p>${esc(MOTS.classeRefusees(refusees.length))}</p><ul>${lignes}</ul></div>`;
    }

    function _champListeHTML(creation) {
        const nomCours = creation ? `<div class="groupe-form"><label for="vs-nom-cours">${esc(MOTS.classeNomCours)}</label>
                <input type="text" id="vs-nom-cours" class="controle-form" maxlength="80" autocomplete="off"></div>` : '';
        return `${nomCours}<div class="groupe-form"><label for="vs-liste">${esc(MOTS.classeListe)}</label>
                <textarea id="vs-liste" class="controle-form vs-liste" rows="${creation ? 10 : 5}" placeholder="${esc(MOTS.classeExemple)}" spellcheck="false"></textarea></div>
            <div id="vs-classe-retour"></div>
            <p><button type="button" class="btn btn-principal" data-action="VueSimple.creerClasse">${esc(creation ? MOTS.classeCreer : MOTS.classeAjouter)}</button></p>`;
    }

    function _rendreClasse(retourHTML) {
        const hote = _conteneur('classe');
        if (!hote) return;
        const groupe = _groupeActif();
        const eleves = groupe ? _eleves() : [];
        const tete = `<h2 class="vs-titre">${esc(MOTS.classeTitre)}</h2>`;
        if (!groupe && _groupes().length) {
            _ecrire(hote, `${tete}${_selecteurGroupeHTML()}`);
            return;
        }
        if (!groupe) {
            _ecrire(hote, `${tete}<p class="vs-intro">${esc(MOTS.classeIntro)}</p><div class="vs-bloc">${_champListeHTML(true)}</div>`);
            return;
        }
        const rangees = eleves.map((e) => `<tr><td>${esc(e.da)}</td><td>${esc(e.nom)}</td><td>${esc(e.prenom)}</td></tr>`).join('');
        const colonnes = MOTS.classeColonnes.map((c) => `<th scope="col">${esc(c)}</th>`).join('');
        const suite = _famille(groupe) === null
            ? `<p><button type="button" class="btn btn-principal" data-action="VueSimple.aller" data-param="pratique">${esc(MOTS.classeSuite)}</button></p>` : '';
        _ecrire(hote, `${tete}${_selecteurGroupeHTML()}
            <p class="vs-intro">${esc(_nomGroupe(groupe))} · ${esc(MOTS.classeCompte(eleves.length))}</p>
            ${retourHTML || ''}${suite}
            <div class="vs-cadre-table"><table class="vs-table"><thead><tr>${colonnes}</tr></thead><tbody>${rangees}</tbody></table></div>
            <details class="vs-bloc vs-ajout"><summary>${esc(MOTS.classeAjouterTitre)}</summary>${_champListeHTML(false)}</details>`);
    }

    /** Le trimestre actif, ou celui de la date du jour, créé en coulisse SANS dates, sans horaire et sans congé. */
    function _assurerTrimestre() {
        const actif = _trimestreActif();
        if (actif) return actif;
        const t = D().trimestreDeLaDate(new Date());
        const existant = (db.getSync('trimestres', []) || []).find((x) => x && x.id === t.id);
        if (!existant && typeof creerTrimestre === 'function') creerTrimestre(t.session, t.annee, true);
        if (typeof changerTrimestreActif === 'function') changerTrimestreActif(t.id);
        return _trimestreActif();
    }

    async function _creerGroupe(trimestre, nomCours) {
        const cours = await CoursEntite.creer({ nature: 'cours', nomCours: nomCours || MOTS.classeNomCoursDefaut });
        if (!cours) return null;
        const enseignants = db.getSync('enseignants', []) || [];
        const gc = D().groupeCoursLeger({
            id: window.genererIdUnique('GC_'), trimestre, cours,
            enseignantId: (enseignants[0] && enseignants[0].id) || 'profil', maintenant: new Date().toISOString()
        });
        const ecrit = await window.modifierEtAnnoncer(cle('groupesCours'), (lus) => (lus || []).concat([gc]), [], { geste: MOTS.classeCreer });
        return ecrit ? gc : null;
    }

    async function _inscrire(fiches, groupe) {
        let ajoutes = 0, deja = 0, lu = false;
        await window.modifierEtAnnoncer(cle('groupeEtudiants'), (lus) => {
            lu = true;   // une écriture refusée (trimestre clos) n'appelle pas ce mutateur : ce n'est pas « 0 élève ajouté »
            const etudiants = (lus || []).slice();
            const presents = new Set(etudiants.map((e) => e && String(e.da)));
            ajoutes = 0; deja = 0;
            fiches.forEach((f) => {
                if (presents.has(f.da)) { deja++; return; }
                presents.add(f.da);
                etudiants.push(Object.assign(D().ficheEleve(f, groupe.coursId), { groupe: groupe.groupeNum || D().GROUPE_SIMPLE }));
                ajoutes++;
            });
            return ajoutes ? etudiants : undefined;
        }, [], { geste: MOTS.classeCreer });
        return { ajoutes, deja, ecrit: lu };
    }

    /** Ce que la liste collée ne permet pas de faire : le message à montrer, ou null. */
    function _refusDeLaListe(lecture) {
        if (!lecture.fiches.length) return `<p class="vs-erreur" role="alert">${esc(MOTS.classeAucunLu)}</p>${_refuseesHTML(lecture.refusees)}`;
        if (_demoOuverte()) return `<p class="vs-erreur" role="alert">${esc(MOTS.classeEnDemo)}</p>`;
        return null;
    }

    /** Le groupe né en coulisse : trimestre, cours, groupe ; il devient le groupe actif, avec l'échelle de départ du trimestre. */
    async function _naitreGroupe(nomCours) {
        const trimestre = _assurerTrimestre();
        const groupe = trimestre ? await _creerGroupe(trimestre, nomCours) : null;
        if (!groupe) throw new Error('groupe non créé');
        return groupe;
    }

    async function _activerGroupeNe(groupe) {
        if (typeof changerGroupeCoursActifV2 === 'function') await changerGroupeCoursActifV2(groupe.id);
        // L'échelle de départ du trimestre (celle que sème la vue étendue) : les standards en ont besoin.
        if (typeof window.assurerEchelleIdmeDeDepart === 'function') await window.assurerEchelleIdmeDeDepart();
        if (typeof peuplerDropdownGroupeCoursActif !== 'function') return;
        try { await peuplerDropdownGroupeCoursActif(); } catch (e) { console.warn('[Vue simple] en-tête non rafraîchi :', e); }
    }

    /** « Créer ma classe » et « Ajouter à ma classe » : la liste collée devient des élèves ; trimestre, cours et groupe naissent en coulisse. */
    async function creerClasse() {
        const zone = document.getElementById('vs-liste');
        const retour = document.getElementById('vs-classe-retour');
        const dire = (html) => { if (retour) _ecrire(retour, html); };
        const lecture = D().analyserListeCollee(zone ? zone.value : '');
        const refus = _refusDeLaListe(lecture);
        if (refus) { dire(refus); if (zone) zone.focus(); return; }
        const nomCours = ((document.getElementById('vs-nom-cours') || {}).value || '').trim();
        const actif = _groupeActif();
        // Bâtir sa classe ici vaut un choix, posé AVANT que le trimestre naisse : dès qu'un trimestre existe, l'application
        // n'est plus « vide », et sans ce choix le prochain démarrage donnerait la vue étendue.
        _ecrireChoix(D().VUES.SIMPLE);
        try {
            const groupe = actif || await _naitreGroupe(nomCours);
            const r = await _inscrire(lecture.fiches, groupe);
            if (!r.ecrit) throw new Error('élèves non inscrits');
            if (!actif) await _activerGroupeNe(groupe);
            const mot = actif ? MOTS.classeAjoutes(r.ajoutes, r.deja) : MOTS.classeCreee(r.ajoutes);
            _rendreClasse(`<p class="vs-succes" role="status">${esc(mot)}</p>${_refuseesHTML(lecture.refusees)}`);
        } catch (e) {
            console.error('[Vue simple] classe non créée :', e);
            dire(`<p class="vs-erreur" role="alert">${esc(MOTS.classeEchec)}</p>`);
        }
    }

    /* ============================== PRATIQUE ============================== */

    function _modele(id) {
        return (typeof MODELES_PRATIQUES_PREDEFINIS !== 'undefined' && MODELES_PRATIQUES_PREDEFINIS[id]) || null;
    }

    /** L'échelle de départ proposée : celle que l'application sème dans le trimestre, sinon la première qui porte des niveaux. */
    function _echelleDeDepart() {
        const echelles = (db.getSync(cle('echellesTemplates'), []) || []).filter((e) => e && Array.isArray(e.niveaux) && e.niveaux.length);
        return echelles.find((e) => e.id === 'ECHELLE_IDME_DEPART') || echelles[0] || null;
    }

    /**
     * L'échelle que la pratique lit, résolue COMME LE CALCUL la résout (`construireConfigComplete`, registre) : une échelle
     * embarquée dans la pratique passe avant tout ; sinon celle que désigne `configuration.echelleId`, par son identifiant
     * ou par son identifiant d'origine (une échelle importée d'un autre trimestre).
     * @returns {{echelle: ?Object, reglable: boolean}} `reglable` : faux pour une échelle embarquée ou introuvable — la
     *          régler ici écrirait à côté de ce que le calcul lit ; elle se règle en vue étendue.
     */
    function _echelleLue(pratique) {
        const embarquee = pratique && (pratique.echelle || (pratique.config && pratique.config.echelle));
        if (embarquee && !embarquee.introuvable) return { echelle: { niveaux: embarquee.niveaux || [] }, reglable: false };
        const id = pratique && pratique.configuration && pratique.configuration.echelleId;
        if (!id) return { echelle: null, reglable: true };   // aucune échelle encore : le départ proposé, copié au premier réglage
        const echelle = (typeof resoudreModeleParId === 'function') ? resoudreModeleParId('echelle', id)
            : ((db.getSync(cle('echellesTemplates'), []) || []).find((e) => e && (e.id === id || e.idOriginal === id)) || null);
        return { echelle, reglable: !!echelle };
    }

    function _echelleDeLaPratique(pratique) { return _echelleLue(pratique).echelle; }

    /** L'échelle est-elle lue par une AUTRE pratique du trimestre, ou par une production ? (elle n'est alors pas à cette pratique seule) */
    function _echelleLueAilleurs(echelle, pratique) {
        if (!echelle) return false;
        const autres = _pratiques().some((p) => p.id !== pratique.id && p.configuration && p.configuration.echelleId === echelle.id);
        return autres || (db.getSync(cle('productions'), []) || []).some((p) => p && p.echelleId === echelle.id);
    }

    /** Les mots de la règle des standards : ceux de l'assistant et de la fiche (registre, validés le 29 oct. 2026). */
    function _motsRegleStd() {
        const m = (typeof MOTS_POOL_STD !== 'undefined' && MOTS_POOL_STD.productions) || {};
        return { meilleurs: m.modeMeilleurs || 'N meilleures productions', recents: m.modeDerniers || 'N dernières productions', tous: m.modeTous || 'Toutes les productions' };
    }

    /* ---------- LE RÉGLAGE : un brouillon, ouvert par « Régler », écrit par « Enregistrer » ---------- */

    let _reglage = null;     // 'regle' | 'niveaux' | 'types' | 'paliers' : le seul réglage ouvert, ou null
    let _brouillon = null;   // ce que le réglage ouvert montre ; rien n'est écrit avant « Enregistrer »

    function _fermerReglage() { _reglage = null; _brouillon = null; }

    /** Le nombre de résultats du trimestre qui portent cette lettre dans cette échelle (les copies remplacées ne comptent pas). */
    function _compterResultats(echelle) {
        const evaluations = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        // Les résultats saisis AVANT la copie d'une échelle portent encore l'identifiant de l'échelle d'origine (`copieDe`).
        const ids = echelle ? [echelle.id, echelle.copieDe].filter(Boolean) : [];
        return (lettre) => evaluations.filter((e) => e && !e.remplaceeParId && ids.indexOf(e.echelleId) >= 0 && String(e.niveauFinal) === String(lettre)).length;
    }

    /** Le nombre de productions de ce type, dans les cours des groupes qui ont cette pratique. */
    function _compterProductions(pratique) {
        const cours = new Set(_groupes().filter((g) => g.pratiqueId === pratique.id).map((g) => g.coursId));
        const productions = (db.getSync(cle('productions'), []) || []).filter((p) => p && (!p.coursId || cours.has(p.coursId)));
        // Le type ENREGISTRÉ, pas celui du brouillon : un nom changé dans le champ ne fait pas disparaître ses productions du compte.
        const enregistres = (pratique.configuration.typesTravaux || []);
        return (type) => {
            const t = enregistres.find((x) => String(x.id) === String(type.id)) || type;
            return productions.filter((p) => window.productionEstDuType(p, t)).length;
        };
    }

    /** Pour chaque type, les productions qui s'y rattachent (par l'identifiant, ou par le NOM : `productionEstDuType`). */
    function _rattachements(pratique, types) {
        const cours = new Set(_groupes().filter((g) => g.pratiqueId === pratique.id).map((g) => g.coursId));
        const productions = (db.getSync(cle('productions'), []) || []).filter((p) => p && (!p.coursId || cours.has(p.coursId)));
        const carte = {};
        types.forEach((t) => { carte[String(t.id)] = productions.filter((p) => window.productionEstDuType(p, t)).map((p) => p.id).sort().join(','); });
        return carte;
    }

    /**
     * Un nom de type rattache aussi des productions (celles de la vue étendue, dont le type porte ce nom). Renommer ne doit
     * ni en détacher ni en attacher : la note changerait sans qu'on l'ait dit. @returns {?Object} le refus, ou null
     */
    function _refusDesNomsDeTypes(pratique, b) {
        const avant = _rattachements(pratique, pratique.configuration.typesTravaux || []);
        const apres = _rattachements(pratique, b.types.map((t) => ({ id: t.id, nom: String(t.nom).trim() })));
        const touche = b.types.find((t) => (avant[String(t.id)] || '') !== (apres[String(t.id)] || ''));
        return touche ? { refus: 'typeRattache', nom: String(touche.nom).trim() } : null;
    }

    function _boutonRegler(quoi) {
        return `<button type="button" class="btn btn-secondaire vs-regler" data-action="VueSimple.regler" data-param="${esc(quoi)}">${esc(MOTS.regler)}</button>`;
    }

    function _gestesDuReglageHTML() {
        return `<div id="vs-reglage-retour"></div>
            <p class="vs-gestes"><button type="button" class="btn btn-principal" data-action="VueSimple.enregistrerReglage">${esc(MOTS.reglerEnregistrer)}</button>
                <button type="button" class="btn btn-secondaire" data-action="VueSimple.annulerReglage">${esc(MOTS.reglerAnnuler)}</button></p>`;
    }

    /** Un bloc de la pratique : son titre, sa valeur lue et « Régler » à côté ; ou, ouvert, son réglage. */
    function _blocHTML(quoi, titre, lectureHTML, reglageHTML, reglable) {
        const ouvert = _reglage === quoi;
        const tete = `<div class="vs-bloc-tete"><h3 class="vs-sous-titre">${esc(titre)}</h3>${(!ouvert && reglable) ? _boutonRegler(quoi) : ''}</div>`;
        return `<div class="vs-bloc" id="vs-bloc-${esc(quoi)}">${tete}${ouvert ? reglageHTML() + _gestesDuReglageHTML() : lectureHTML}</div>`;
    }

    /* ---------- la règle des standards ---------- */

    function _regleLueHTML(pratique) {
        const phrase = window.TableauNotation ? window.TableauNotation.phraseRegleStd(pratique.configuration, false) : '';
        const autre = D().regleStd(pratique).methode === 'autre' ? `<p class="vs-note">${esc(MOTS.regleAutre)}</p>` : '';
        const groupe = _groupeActif();
        const colonnes = groupe ? _productionsDuCours(groupe.coursId).filter((x) => x.type !== 'portfolio' && x.type !== 'terminale') : [];
        return `<p class="vs-valeur">${esc(phrase + (groupe ? _combienComptent(groupe, colonnes) : ''))}</p>${autre}`;
    }

    function _regleReglageHTML() {
        const mots = _motsRegleStd();
        const choix = D().REGLES_STD.map((m) => `<label class="vs-choix"><input type="radio" name="vs-regle" value="${esc(m)}"${_brouillon.methode === m ? ' checked' : ''}> ${esc(mots[m])}</label>`).join('');
        return `<fieldset class="vs-regle"><legend class="u-lecteur-ecran">${esc(MOTS.pratiqueRegle)}</legend>${choix}</fieldset>
            <div class="groupe-form vs-nombre"><label for="vs-regle-nombre">${esc(MOTS.regleNombre)}</label>
                <input type="number" id="vs-regle-nombre" class="controle-form" min="1" max="99" value="${esc(String(_brouillon.nombre || 1))}"></div>`;
    }

    /* ---------- les niveaux ---------- */

    function _niveauxLusHTML(echelle) {
        const niveaux = (echelle && echelle.niveaux) || [];
        if (!niveaux.length) return `<p class="vs-note">${esc(MOTS.niveauxAucun)}</p>`;
        const puces = niveaux.map((n) => `<span class="vs-niveau"><strong>${esc(n.code)}</strong> ${esc(n.nom || '')} <span class="vs-niveau-valeur">${esc(String(n.valeurCalcul != null ? n.valeurCalcul : ''))}</span></span>`).join('');
        return `<p class="vs-niveaux">${puces}</p>`;
    }

    function _niveauxReglageHTML() {
        const dernier = _brouillon.niveaux.length - 1;
        const rangees = _brouillon.niveaux.map((n, i) => `<tr class="vs-niveau-rangee">
                <td><input type="text" class="controle-form vs-n-code" maxlength="3" value="${esc(n.code)}" aria-label="${esc(MOTS.niveauColonnes[0] + ' ' + (i + 1))}"></td>
                <td><input type="text" class="controle-form vs-n-nom" maxlength="40" value="${esc(n.nom)}" aria-label="${esc(MOTS.niveauColonnes[1] + ' ' + (i + 1))}"></td>
                <td><input type="number" class="controle-form vs-n-valeur" min="0" step="any" value="${esc(String(n.valeur))}" aria-label="${esc(MOTS.niveauColonnes[2] + ' ' + (i + 1))}"></td>
                <td class="vs-rangee-gestes">
                    <button type="button" class="btn btn-secondaire vs-petit" data-action="VueSimple.niveauGeste" data-param="monter" data-param2="${i}"${i === 0 ? ' disabled' : ''} aria-label="${esc(MOTS.niveauMonter + ' ' + (n.nom || n.code))}">↑</button>
                    <button type="button" class="btn btn-secondaire vs-petit" data-action="VueSimple.niveauGeste" data-param="descendre" data-param2="${i}"${i === dernier ? ' disabled' : ''} aria-label="${esc(MOTS.niveauDescendre + ' ' + (n.nom || n.code))}">↓</button>
                    <button type="button" class="btn btn-secondaire vs-petit" data-action="VueSimple.niveauGeste" data-param="retirer" data-param2="${i}">${esc(MOTS.niveauRetirer)}</button></td></tr>`).join('');
        const tetes = MOTS.niveauColonnes.map((c) => `<th scope="col">${esc(c)}</th>`).join('');
        return `<p class="vs-note">${esc(MOTS.niveauxAide)}</p>
            <div class="vs-cadre-table"><table class="vs-table vs-reglage"><thead><tr>${tetes}<th scope="col"></th></tr></thead><tbody>${rangees}</tbody></table></div>
            <p class="vs-gestes"><button type="button" class="btn btn-secondaire" data-action="VueSimple.niveauGeste" data-param="ajouter">${esc(MOTS.niveauAjouter)}</button></p>`;
    }

    /* ---------- les types et les paliers ---------- */

    function _typesLusHTML(pratique) {
        const types = (pratique.configuration.typesTravaux || []).map((t) => `<span class="vs-niveau"><strong>${esc(t.nom || t.id)}</strong></span>`).join('');
        return `<p class="vs-niveaux">${types}</p>`;
    }

    function _typesReglageHTML() {
        const rangees = _brouillon.types.map((t, i) => `<tr><td><input type="text" class="controle-form vs-type-nom" maxlength="40" value="${esc(t.nom)}" aria-label="${esc(MOTS.typeNom + ' ' + (i + 1))}"></td>
                <td class="vs-rangee-gestes"><button type="button" class="btn btn-secondaire vs-petit" data-action="VueSimple.typeGeste" data-param="retirer" data-param2="${i}">${esc(MOTS.typeRetirer)}</button></td></tr>`).join('');
        return `<p class="vs-note">${esc(MOTS.typesAide)}</p>
            <div class="vs-cadre-table"><table class="vs-table vs-reglage"><thead><tr><th scope="col">${esc(MOTS.typeNom)}</th><th scope="col"></th></tr></thead><tbody>${rangees}</tbody></table></div>
            <p class="vs-gestes"><button type="button" class="btn btn-secondaire" data-action="VueSimple.typeGeste" data-param="ajouter">${esc(MOTS.typeAjouter)}</button></p>`;
    }

    function _paliersLusHTML(pratique) {
        const c = pratique.configuration || {};
        const nomType = (id) => { const t = (c.typesTravaux || []).find((x) => String(x.id) === String(id)); return t ? (t.nom || id) : id; };
        const lignes = (c.forfaits || []).slice().sort((a, b) => b.note - a.note).map((f) => {
            const exigences = Object.keys(f.travaux || {}).filter((id) => f.travaux[id] > 0).map((id) => `${nomType(id)} : ${f.travaux[id]}`).join(', ');
            return `<li><strong>${esc(f.lettre || '')}</strong> <span class="vs-niveau-valeur">${esc(String(f.note))}</span> · ${esc(exigences || MOTS.palierSansExigence)}</li>`;
        }).join('');
        return `<ul class="vs-paliers-lus">${lignes}</ul>`;
    }

    function _paliersReglageHTML() {
        const types = _brouillon.types;
        const tetes = types.map((t) => `<th scope="col">${esc(t.nom || t.id)}</th>`).join('');
        const rangees = _brouillon.paliers.map((f, i) => {
            const cases = types.map((t) => `<td><input type="number" class="controle-form vs-palier-nombre" min="0" max="99" data-type="${esc(t.id)}" value="${esc(String((f.travaux || {})[t.id] || 0))}" aria-label="${esc((f.lettre || '') + ', ' + (t.nom || t.id))}"></td>`).join('');
            return `<tr class="vs-palier-rangee"><td><input type="text" class="controle-form vs-palier-nom" maxlength="40" value="${esc(f.lettre)}" aria-label="${esc(MOTS.paliersNom + ' ' + (i + 1))}"></td>
                <td><input type="number" class="controle-form vs-palier-note" min="0" max="100" step="any" value="${esc(String(f.note))}" aria-label="${esc((f.lettre || '') + ', ' + MOTS.paliersNote)}"></td>${cases}
                <td class="vs-rangee-gestes"><button type="button" class="btn btn-secondaire vs-petit" data-action="VueSimple.palierGeste" data-param="retirer" data-param2="${i}">${esc(MOTS.palierRetirer)}</button></td></tr>`;
        }).join('');
        return `<p class="vs-note">${esc(MOTS.paliersAide)}</p>
            <div class="vs-cadre-table"><table class="vs-table vs-reglage vs-paliers"><thead><tr><th scope="col">${esc(MOTS.paliersNom)}</th><th scope="col">${esc(MOTS.paliersNote)}</th>${tetes}<th scope="col"></th></tr></thead><tbody>${rangees}</tbody></table></div>
            <p class="vs-gestes"><button type="button" class="btn btn-secondaire" data-action="VueSimple.palierGeste" data-param="ajouter">${esc(MOTS.palierAjouter)}</button></p>`;
    }

    /* ---------- l'écran ---------- */

    function _choixModeleHTML() {
        const cartes = MOTS.modeles.map((m) => `<li class="vs-etape">
                <h3 class="vs-etape-titre">${esc(m.titre)}</h3>
                <p class="vs-etape-texte">${esc(m.texte)}</p>
                <button type="button" class="btn btn-principal vs-etape-lien" data-action="VueSimple.choisirModele" data-param="${esc(m.modele)}">${esc(m.lien)}</button>
            </li>`).join('');
        return `<p class="vs-intro">${esc(MOTS.pratiqueIntro)}</p><ul class="vs-etapes vs-etapes--deux">${cartes}</ul>`;
    }

    function _rendrePratique(retourHTML) {
        const hote = _conteneur('pratique');
        if (!hote) return;
        const tete = `<h2 class="vs-titre">${esc(MOTS.pratiqueTitre)}</h2>${_selecteurGroupeHTML()}`;
        const groupe = _groupeActif();
        if (!groupe) { _ecrire(hote, tete + (_groupes().length ? '' : _sansClasseHTML())); return; }
        const famille = _famille(groupe);
        if (famille === null) { _ecrire(hote, `${tete}${retourHTML || ''}${_choixModeleHTML()}`); return; }
        if (famille === 'autre') { _ecrire(hote, `${tete}<p class="vs-etat">${esc(MOTS.pratiqueAutre)}</p>`); return; }
        _ecrire(hote, tete + _pratiqueChoisieHTML(groupe, famille, retourHTML));
    }

    /** Ce qui se règle ICI : faux quand le réglage écrirait à côté de ce que le calcul lit (formes de la vue étendue). */
    function _reglable(pratique, quoi) {
        if (!pratique || !pratique.configuration) return false;
        if (quoi === 'regle') return D().regleStd(pratique).methode !== 'autre';
        if (quoi === 'niveaux') return _echelleLue(pratique).reglable;
        // Types et paliers : le calcul lit `tableBundles` avant `forfaits` ; une pratique sous cette forme se règle en vue étendue.
        return Array.isArray(pratique.configuration.forfaits) && !Array.isArray(pratique.configuration.tableBundles);
    }

    function _nonReglableHTML(pratique, quoi) {
        return _reglable(pratique, quoi) ? '' : `<p class="vs-note">${esc(MOTS.regleAutre)}</p>`;
    }

    function _blocsStdHTML(pratique) {
        const echelle = _echelleDeLaPratique(pratique) || _echelleDeDepart();
        return _blocHTML('regle', MOTS.pratiqueRegle, _regleLueHTML(pratique), _regleReglageHTML, _reglable(pratique, 'regle'))
            + _blocHTML('niveaux', MOTS.niveauxTitre, _niveauxLusHTML(echelle) + _nonReglableHTML(pratique, 'niveaux'), _niveauxReglageHTML, _reglable(pratique, 'niveaux'));
    }

    function _blocsSpeHTML(pratique) {
        return _blocHTML('paliers', MOTS.paliersTitre, _paliersLusHTML(pratique) + _nonReglableHTML(pratique, 'paliers'), _paliersReglageHTML, _reglable(pratique, 'paliers'))
            + _blocHTML('types', MOTS.typesTitre, _typesLusHTML(pratique), _typesReglageHTML, _reglable(pratique, 'types'));
    }

    /** La pratique du groupe : son modèle, puis chaque valeur qui entre dans la note, lue, avec « Régler » à côté. */
    function _pratiqueChoisieHTML(groupe, famille, retourHTML) {
        const pratique = _pratiqueDuGroupe(groupe);
        const std = famille === D().FAMILLES.STD;
        const nomFamille = (MOTS.modeles.find((m) => m.famille === famille) || {}).titre || '';
        const noms = [nomFamille, pratique.nom].filter((x, i, t) => x && t.indexOf(x) === i).join(' · ');
        // Une pratique importée sous l'ancienne forme (`.config`) se lit en vue étendue, elle ne se règle pas ici.
        const reglable = !!pratique.configuration;
        const blocs = !reglable ? `<p class="vs-note">${esc(MOTS.regleAutre)}</p>` : (std ? _blocsStdHTML(pratique) : _blocsSpeHTML(pratique));
        return `<p class="vs-intro"><span class="vs-libelle">${esc(MOTS.pratiqueModele)}</span> ${esc(noms)}</p>
            <div id="vs-pratique-retour">${retourHTML || ''}${_questionMiseAJourHTML()}</div>${reglable ? _reglePartageeHTML(pratique) : ''}${blocs}
            <p class="vs-gestes"><button type="button" class="btn btn-principal" data-action="VueSimple.aller" data-param="resultats">${esc(MOTS.pratiqueSuite)}</button>${_changerModeleHTML(groupe)}</p>`;
    }

    /** Un réglage est celui de la PRATIQUE : si d'autres groupes l'ont aussi, l'écran le dit avant qu'on l'enregistre. */
    function _reglePartageeHTML(pratique) {
        const n = _groupes().filter((g) => g.pratiqueId === pratique.id).length;
        return n > 1 ? `<p class="vs-note">${esc(MOTS.reglePartagee(n))}</p>` : '';
    }

    /** « Changer de modèle » : offert tant que le groupe n'a aucune production. */
    function _changerModeleHTML(groupe) {
        if (_productionsDuCours(groupe.coursId).length) return '';
        return `<button type="button" class="btn btn-secondaire" data-action="VueSimple.changerModele">${esc(MOTS.pratiqueChanger)}</button>`;
    }

    function _apresEcriturePratique() {
        if (window.invaliderCachePratique) window.invaliderCachePratique();
        if (typeof window.calculerEtStockerIndicesCP === 'function') window.calculerEtStockerIndicesCP();
    }

    /* ---------- les gestes du réglage ---------- */

    /** « Régler », depuis l'écran Pratique ou depuis le tableau : ouvre CE réglage, sur l'écran Pratique. */
    function regler(quoi) {
        const groupe = _groupeActif();
        const pratique = _pratiqueDuGroupe(groupe);
        if (['regle', 'niveaux', 'types', 'paliers'].indexOf(quoi) < 0 || !_reglable(pratique, quoi)) { aller('pratique'); return; }
        if (_ecran !== 'pratique') aller('pratique');
        _reglage = quoi;
        _brouillon = D().brouillonDeLaPratique(pratique, _echelleDeLaPratique(pratique) || _echelleDeDepart());
        _rendrePratique();
        const bloc = document.getElementById('vs-bloc-' + quoi);
        const champ = bloc && bloc.querySelector('input');
        if (champ) champ.focus();
        if (bloc && typeof bloc.scrollIntoView === 'function') bloc.scrollIntoView({ block: 'nearest' });
    }

    function annulerReglage() { _fermerReglage(); _rendrePratique(); }

    /** Ce que les champs du réglage ouvert disent, reporté dans le brouillon (avant un geste, avant d'enregistrer). */
    function _lireLeReglage() {
        const b = _brouillon;
        const valeurs = (selecteur) => Array.from(document.querySelectorAll('#vs-bloc-' + _reglage + ' ' + selecteur)).map((el) => el.value);
        if (_reglage === 'regle') {
            const coche = document.querySelector('input[name="vs-regle"]:checked');
            return Object.assign({}, b, { methode: coche ? coche.value : b.methode, nombre: (document.getElementById('vs-regle-nombre') || {}).value });
        }
        if (_reglage === 'niveaux') {
            const codes = valeurs('.vs-n-code'), noms = valeurs('.vs-n-nom'), vals = valeurs('.vs-n-valeur');
            return Object.assign({}, b, { niveaux: b.niveaux.map((n, i) => Object.assign({}, n, { code: codes[i], nom: noms[i], valeur: vals[i] })) });
        }
        if (_reglage === 'types') {
            const noms = valeurs('.vs-type-nom');
            return Object.assign({}, b, { types: b.types.map((t, i) => Object.assign({}, t, { nom: noms[i] })) });
        }
        const rangees = Array.from(document.querySelectorAll('#vs-bloc-paliers .vs-palier-rangee'));
        return Object.assign({}, b, { paliers: b.paliers.map((p, i) => {
            const travaux = {};
            rangees[i].querySelectorAll('.vs-palier-nombre').forEach((el) => { travaux[el.dataset.type] = el.value; });
            return Object.assign({}, p, { lettre: rangees[i].querySelector('.vs-palier-nom').value, note: rangees[i].querySelector('.vs-palier-note').value, travaux });
        }) });
    }

    function _direRefus(refus) {
        const dire = MOTS.refus[refus.refus];
        _ecrire(document.getElementById('vs-reglage-retour'), `<p class="vs-erreur" role="alert">${esc(dire ? dire(refus) : '')}</p>`);
    }

    /** Applique un geste au brouillon : il rend un brouillon neuf, ou un refus que l'écran dit (rien n'est effacé, rien n'est écrit). */
    function _geste(resultat) {
        if (resultat && resultat.refus) { _direRefus(resultat); return; }
        _brouillon = resultat;
        _rendrePratique();
    }

    function niveauGeste(quoi, index) {
        if (_reglage !== 'niveaux') return;
        const b = _lireLeReglage();
        const pratique = _pratiqueDuGroupe(_groupeActif());
        _brouillon = b;
        if (quoi === 'ajouter') _geste(D().gestes.niveauAjouter(b));
        else if (quoi === 'monter') _geste(D().gestes.niveauDeplacer(b, index, -1));
        else if (quoi === 'descendre') _geste(D().gestes.niveauDeplacer(b, index, 1));
        else if (quoi === 'retirer') _geste(D().gestes.niveauRetirer(b, index, _compterResultats(_echelleDeLaPratique(pratique))));
    }

    function typeGeste(quoi, index) {
        if (_reglage !== 'types') return;
        const b = _lireLeReglage();
        _brouillon = b;
        if (quoi === 'ajouter') _geste(D().gestes.typeAjouter(b));
        else if (quoi === 'retirer') _geste(D().gestes.typeRetirer(b, index, _compterProductions(_pratiqueDuGroupe(_groupeActif()))));
    }

    function palierGeste(quoi, index) {
        if (_reglage !== 'paliers') return;
        const b = _lireLeReglage();
        _brouillon = b;
        if (quoi === 'ajouter') _geste(D().gestes.palierAjouter(b));
        else if (quoi === 'retirer') _geste(D().gestes.palierRetirer(b, index));
    }

    async function _ecrirePratique(nouvelle, geste) {
        return window.modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => (lues || []).map((p) => (p && p.id === nouvelle.id) ? nouvelle : p), [], { geste });
    }

    /**
     * Les niveaux réglés. L'échelle APPARTIENT à la pratique : née avec elle, elle est réécrite ; sinon (pratique de la vue
     * étendue qui lit une échelle du trimestre), elle est COPIÉE et la pratique lit la copie — l'échelle du trimestre, que
     * d'autres pratiques, des productions ou des grilles peuvent lire, n'est jamais modifiée.
     * Les résultats déjà saisis ne sont pas touchés : ils gardent la valeur écrite à la saisie (règle du tableau).
     */
    async function _enregistrerNiveaux(pratique, b) {
        const echelle = _echelleDeLaPratique(pratique);
        const refus = D().refusDesNiveaux(b, _compterResultats(echelle));
        if (refus) return { refus };
        if (!D().niveauxChanges(echelle, b.niveaux)) return { ecrit: true };
        // Sans échelle encore, le départ proposé sert de base : ses couleurs suivent les niveaux gardés.
        const base = echelle || _echelleDeDepart();
        const r = D().echelleReglee(base, pratique, b.niveaux, { idNeuf: window.genererIdUnique('ECH_'), maintenant: new Date().toISOString(),
            lueAilleurs: !echelle || _echelleLueAilleurs(echelle, pratique) });
        const ecrit = await window.modifierEtAnnoncer(cle('echellesTemplates'), (lues) => {
            const liste = (lues || []).filter((e) => e && e.id !== r.echelle.id);
            return liste.concat([r.echelle]);
        }, [], { geste: MOTS.niveauxTitre });
        if (!ecrit) return { ecrit: false };
        if (r.copiee) {
            const nouvelle = JSON.parse(JSON.stringify(pratique));
            nouvelle.configuration.echelleId = r.echelle.id;
            if (!(await _ecrirePratique(nouvelle, MOTS.niveauxTitre))) return { ecrit: false };
        }
        return { ecrit: true, lot: _lotAMettreAJour(pratique, r.echelle) };
    }

    /** Les résultats saisis au tableau avec une ancienne valeur, dans TOUS les groupes qui ont cette pratique. */
    function _lotAMettreAJour(pratique, echelle) {
        const groupes = _groupes().filter((g) => g.pratiqueId === pratique.id);
        return D().resultatsAMettreAJour(db.getSync(cle('evaluationsSauvegardees'), []) || [], {
            idsEchelle: [echelle.id, echelle.copieDe].filter(Boolean), niveaux: echelle.niveaux,
            groupes: groupes.map((g) => g.id), cours: groupes.map((g) => g.coursId)
        });
    }

    function _questionMiseAJourHTML() {
        if (!_miseAJour) return '';
        const plusieurs = _miseAJour.groupes > 1 ? ` ${MOTS.majGroupes(_miseAJour.groupes)}` : '';
        return `<div class="vs-question" role="alertdialog" aria-labelledby="vs-question-texte">
            <p id="vs-question-texte">${esc(MOTS.majQuestion(_miseAJour.lot.length) + plusieurs)}</p>
            <p class="vs-gestes"><button type="button" class="btn btn-principal" data-action="VueSimple.mettreAJour">${esc(MOTS.majOui)}</button>
                <button type="button" class="btn btn-secondaire" data-action="VueSimple.garderValeurs">${esc(MOTS.majNon)}</button></p></div>`;
    }

    /**
     * « Mettre à jour » : chaque résultat du lot prend la valeur d'aujourd'hui de son niveau. Rien d'autre n'est écrit : le
     * niveau inscrit reste, aucun résultat n'est créé ni effacé, aucune copie évaluée avec une grille n'est touchée. Le lot
     * devient le dernier geste du tableau : « Annuler » le défait en entier.
     */
    async function mettreAJour() {
        if (!_miseAJour) return;
        const lot = _miseAJour.lot;
        const stock = db.getSync(cle('evaluationsSauvegardees'), []) || [];
        const ecrit = sauvegarderDonneesSelonMode('evaluationsSauvegardees', D().appliquerMiseAJour(stock, lot), { geste: MOTS.majOui }) === true;
        _miseAJour = null;
        if (ecrit) {
            if (window.TableauNotation) window.TableauNotation.noterGesteLot(lot);
            window._moyennesQualifies = null;
            window._moyennesToutes = null;
            _apresEcriturePratique();
        }
        _rendrePratique(ecrit ? `<p class="vs-succes" role="status">${esc(MOTS.majFaite(lot.length))}</p>` : `<p class="vs-erreur" role="alert">${esc(MOTS.pratiqueEchec)}</p>`);
    }

    /** « Garder les anciennes valeurs » : l'état d'aujourd'hui (le signe « ≠ » sur ces cases, ressaisir pour prendre la valeur). */
    function garderValeurs() { _miseAJour = null; _rendrePratique(); }

    async function _enregistrerLeReglage(pratique, b) {
        if (_reglage === 'niveaux') return Object.assign({ mot: MOTS.niveauxEnregistres }, await _enregistrerNiveaux(pratique, b));
        if (_reglage === 'regle') {
            return { mot: MOTS.regleEnregistree, ecrit: !!(await _ecrirePratique(D().poserRegleStd(pratique, { methode: b.methode, nombre: b.nombre }), MOTS.pratiqueRegle)) };
        }
        const refus = D().refusDesSpecifications(b) || _refusDesNomsDeTypes(pratique, b);
        if (refus) return { refus };
        const mot = _reglage === 'types' ? MOTS.typesEnregistres : MOTS.paliersEnregistres;
        return { mot, ecrit: !!(await _ecrirePratique(D().poserSpecifications(pratique, b), mot)) };
    }

    /** « Enregistrer » du réglage ouvert : ce réglage-là s'écrit, les autres valeurs de la pratique ne bougent pas. */
    async function enregistrerReglage() {
        const pratique = _pratiqueDuGroupe(_groupeActif());
        if (!pratique || !_reglage || !_brouillon) return;
        // Le brouillon est celui d'UNE pratique : il ne s'écrit jamais dans une autre (groupe changé, modèle changé).
        if (_brouillon.pratiqueId !== pratique.id || !_reglable(pratique, _reglage)) { _fermerReglage(); _rendrePratique(); return; }
        _brouillon = _lireLeReglage();
        const r = await _enregistrerLeReglage(pratique, _brouillon);
        if (r.refus) { _direRefus(r.refus); return; }
        if (r.ecrit) { _apresEcriturePratique(); _fermerReglage(); }
        _miseAJour = (r.ecrit && r.lot && r.lot.length) ? { lot: r.lot, groupes: _groupes().filter((g) => g.pratiqueId === pratique.id).length } : null;
        _rendrePratique(r.ecrit ? `<p class="vs-succes" role="status">${esc(r.mot)}</p>` : `<p class="vs-erreur" role="alert">${esc(MOTS.pratiqueEchec)}</p>`);
    }

    /* ---------- le modèle ---------- */

    /** Une pratique déjà installée de ce modèle, qu'aucun groupe n'emploie (laissée par « Changer de modèle ») : on la reprend. */
    function _pratiqueLibreDuModele(idModele) {
        const prises = new Set(_groupes().map((g) => g.pratiqueId).filter(Boolean));
        return _pratiques().find((p) => p.inspireDe && p.inspireDe.sourceId === idModele && p.dansBibliotheque !== false && !prises.has(p.id)) || null;
    }

    /**
     * L'échelle qui naît avec une pratique par standards : une copie de l'échelle de départ, à elle (« Mes niveaux »). Ses
     * niveaux sont un départ proposé, que l'enseignant·e règle ; aucune autre pratique ne la lit.
     */
    async function _naitreEchelle(pratique) {
        if (typeof window.assurerEchelleIdmeDeDepart === 'function') await window.assurerEchelleIdmeDeDepart();
        const depart = _echelleDeDepart();
        if (!depart) return null;
        const niveaux = D().brouillonDeLaPratique(pratique, depart).niveaux;
        const r = D().echelleReglee(depart, pratique, niveaux, { idNeuf: window.genererIdUnique('ECH_'), maintenant: new Date().toISOString() });
        const ecrit = await window.modifierEtAnnoncer(cle('echellesTemplates'), (lues) => (lues || []).concat([r.echelle]), [], { geste: MOTS.pratiqueTitre });
        return ecrit ? r.echelle : null;
    }

    /** Installe un modèle existant dans le trimestre et l'assigne au groupe actif (les chemins de la vue étendue). */
    async function choisirModele(idModele) {
        const groupe = _groupeActif();
        const modele = _modele(idModele);
        if (!groupe || !modele || _famille(groupe) !== null) return;
        _fermerReglage();
        try {
            const libre = _pratiqueLibreDuModele(idModele);
            if (libre) { await window.PratiqueManager.changerPratiqueActive(libre.id); _rendrePratique(); return; }
            const titre = (MOTS.modeles.find((m) => m.modele === idModele) || {}).titre;
            const pratique = D().pratiqueDepuisModele(modele, { nom: titre, id: window.genererIdUnique('PRAT_'), echelleId: null, maintenant: new Date().toISOString() });
            if (modele.type === D().FAMILLES.STD) {
                const echelle = await _naitreEchelle(pratique);
                pratique.configuration.echelleId = echelle ? echelle.id : null;
            }
            const ecrit = await window.modifierEtAnnoncer(cle('pratiquesConfigurables'), (lues) => (lues || []).concat([pratique]), [], { geste: MOTS.pratiqueTitre });
            if (!ecrit) throw new Error('pratique non écrite');
            await window.PratiqueManager.changerPratiqueActive(pratique.id);
            _rendrePratique();
        } catch (e) {
            console.error('[Vue simple] pratique non installée :', e);
            _rendrePratique(`<p class="vs-erreur" role="alert">${esc(MOTS.pratiqueEchec)}</p>`);
        }
    }

    /** « Changer de modèle » (offert tant que le groupe n'a aucune production) : le groupe redevient sans pratique ; la pratique reste au trimestre. */
    async function changerModele() {
        const groupe = _groupeActif();
        if (!groupe || _productionsDuCours(groupe.coursId).length) return;
        _fermerReglage();
        try {
            await window.PratiqueManager.changerPratiqueActive(null);
        } catch (e) { console.error('[Vue simple] modèle non changé :', e); }
        _rendrePratique();
    }

    /* ============================== RÉSULTATS ============================== */

    function _typesSpe(groupe) {
        const p = _pratiqueDuGroupe(groupe);
        return (_famille(groupe) === D().FAMILLES.SPE && p && p.configuration && p.configuration.typesTravaux) || [];
    }

    /** La marque « compte dans la note » : offerte quand le calcul la lit (standards, sans catégories, sans productions de type artefact). */
    function _marqueOfferte(groupe) {
        const p = _pratiqueDuGroupe(groupe);
        if (_famille(groupe) !== D().FAMILLES.STD || !p || !p.configuration) return false;
        if (p.configuration.categories && p.configuration.categories.actif) return false;
        return !_productionsDuCours(groupe.coursId).some((x) => x.type === 'artefact-portfolio');
    }

    function _exclues(groupe) {
        const p = _pratiqueDuGroupe(groupe);
        return new Set((p && p.configuration && Array.isArray(p.configuration.productionsExclues)) ? p.configuration.productionsExclues : []);
    }

    /** « N productions sur M comptent. » : dit seulement quand une colonne ne compte pas. `colonnes` : les productions du tableau. */
    function _combienComptent(groupe, colonnes) {
        if (!_marqueOfferte(groupe)) return '';
        const exclues = _exclues(groupe);
        const hors = colonnes.filter((c) => exclues.has(c.id)).length;
        return hors ? MOTS.colonneCombien(colonnes.length - hors, colonnes.length) : '';
    }

    function _champTypeHTML(types, choisi) {
        // En spécifications, une production n'est une colonne que si elle a un type de la pratique : avec plus d'un type, il se choisit.
        if (types.length < 2) return '';
        const options = types.map((t) => `<option value="${esc(t.id)}"${String(t.id) === String(choisi) ? ' selected' : ''}>${esc(t.nom || t.id)}</option>`).join('');
        return `<div class="groupe-form"><label for="vs-production-type">${esc(MOTS.productionType)}</label>
                <select id="vs-production-type" class="controle-form">${options}</select></div>`;
    }

    /** Le formulaire du tableau : « + Production » (une colonne neuve), ou le réglage d'UNE colonne (`_colonne`). */
    function _formulaireProductionHTML(groupe) {
        if (!_formulaireProduction) return '';
        const p = _colonne ? _productionsDuCours(groupe.coursId).find((x) => x.id === _colonne) : null;
        if (_colonne && !p) return '';
        const types = _typesSpe(groupe);
        const type = _champTypeHTML(types, p ? (types.find((t) => window.productionEstDuType(p, t)) || {}).id : null);
        const compte = (p && _marqueOfferte(groupe)) ? `<label class="vs-choix vs-colonne-compte"><input type="checkbox" id="vs-colonne-compte"${_exclues(groupe).has(p.id) ? '' : ' checked'}> ${esc(MOTS.colonneCompte)}</label>` : '';
        const gestes = p
            ? `<button type="button" class="btn btn-principal" data-action="VueSimple.enregistrerColonne">${esc(MOTS.colonneEnregistrer)}</button>
                <button type="button" class="btn btn-secondaire" data-action="VueSimple.fermerProduction">${esc(MOTS.productionAnnuler)}</button>
                <button type="button" class="btn btn-secondaire" data-action="VueSimple.retirerColonne">${esc(MOTS.colonneRetirer)}</button>`
            : `<button type="button" class="btn btn-principal" data-action="VueSimple.ajouterProduction">${esc(MOTS.productionAjouter)}</button>
                <button type="button" class="btn btn-secondaire" data-action="VueSimple.fermerProduction">${esc(MOTS.productionAnnuler)}</button>`;
        return `<div class="vs-bloc vs-production" id="vs-production-formulaire">
            <div class="vs-production-champs">
                <div class="groupe-form vs-production-nom"><label for="vs-production-nom">${esc(MOTS.productionNom)}</label>
                    <input type="text" id="vs-production-nom" class="controle-form" maxlength="120" autocomplete="off" value="${esc(p ? (p.titre || '') : '')}"></div>
                <div class="groupe-form"><label for="vs-production-date">${esc(MOTS.productionDate)}</label>
                    <input type="date" id="vs-production-date" class="controle-form" value="${esc(p ? String(p.dateEcheance || '').slice(0, 10) : '')}"></div>${type}
            </div>${compte}
            <div id="vs-production-retour"></div>
            <p class="vs-gestes">${gestes}</p></div>`;
    }

    function _presentationDuTableau(hote) {
        return {
            hote,
            mots: MOTS.tableau,
            aUneGrille: _aUneGrille,
            // Chaque valeur du tableau qui entre dans la note est à un geste de son réglage : la phrase de la règle, les niveaux
            // (standards), les types et les paliers (spécifications).
            reglages: { action: 'VueSimple.regler', param: _famille(_groupeActif()) === D().FAMILLES.SPE ? 'types' : 'regle', libelle: MOTS.regler },
            reglerRepere: { action: 'VueSimple.regler', param: _famille(_groupeActif()) === D().FAMILLES.SPE ? 'paliers' : 'niveaux', libelle: MOTS.regler },
            // Chaque colonne se règle depuis son titre ; une colonne qui ne compte pas reste au tableau et le dit ; la phrase
            // de la règle dit combien comptent.
            colonne: { action: 'VueSimple.ouvrirColonne', libelle: MOTS.colonneRegler, motHors: MOTS.colonneHors },
            colonnesQuiNeComptentPas: _marqueOfferte(_groupeActif()),
            complementDeLaRegle: (ctx) => _combienComptent(_groupeActif(), (ctx.productions || []).filter((x) => x.id !== ctx.terminalId)),
            gestes: {
                'aucune-pratique': { libelle: MOTS.cartes[1].lien, action: 'VueSimple.aller', param: 'pratique' },
                'aucun-eleve': { libelle: MOTS.cartes[0].lien, action: 'VueSimple.aller', param: 'classe' },
                'aucune-production': { libelle: MOTS.plusProduction, action: 'VueSimple.ouvrirProduction' }
            }
        };
    }

    function _rendreResultats() {
        const hote = _conteneur('resultats');
        if (!hote) return;
        const groupe = _groupeActif();
        if (!groupe) {
            if (window.TableauNotation) window.TableauNotation.quitterPresentation();
            _ecrire(hote, `<h2 class="vs-titre">${esc(MOTS.cartes[2].titre)}</h2>${_selecteurGroupeHTML()}${_groupes().length ? '' : _sansClasseHTML()}`);
            return;
        }
        _ecrire(hote, `${_selecteurGroupeHTML()}<div id="vs-production-hote">${_formulaireProductionHTML(groupe)}</div><div id="vs-tableau-hote" class="tableau-notation"></div>`);
        if (window.TableauNotation) window.TableauNotation.afficherDans(_presentationDuTableau(document.getElementById('vs-tableau-hote')));
        if (_formulaireProduction) { const nom = document.getElementById('vs-production-nom'); if (nom) nom.focus(); }
    }

    function ouvrirProduction() {
        _colonne = null;
        _ouvrirFormulaire();
    }

    /** Le titre d'une colonne, au tableau : ouvre le réglage de CETTE colonne (nom, date, type, « compte dans la note », retrait). */
    function ouvrirColonne(productionId) {
        _colonne = String(productionId);
        _ouvrirFormulaire();
    }

    function _ouvrirFormulaire() {
        _formulaireProduction = true;
        const hote = document.getElementById('vs-production-hote');
        if (!hote) { _rendreResultats(); return; }
        _ecrire(hote, _formulaireProductionHTML(_groupeActif()));
        const nom = document.getElementById('vs-production-nom');
        if (nom) nom.focus();
    }

    function fermerProduction() {
        _formulaireProduction = false;
        _colonne = null;
        const hote = document.getElementById('vs-production-hote');
        if (hote) _ecrire(hote, '');
    }

    /**
     * Le type de la production née de « + Production ». En spécifications : le type choisi (ou le seul type). En standards :
     * « autre », sauf si le cours a déjà des artefacts de portfolio — seuls les artefacts entrent alors dans la note
     * (`obtenirArtefactsIdsPoolStd`), et une production d'un autre type ne serait pas une colonne.
     */
    function _typeDeLaProduction(groupe, existantes) {
        const types = _typesSpe(groupe);
        if (types.length) {
            const choisi = (document.getElementById('vs-production-type') || {}).value;
            const t = types.find((x) => String(x.id) === String(choisi)) || types[0];
            return t.id;
        }
        return existantes.some((p) => p.type === 'artefact-portfolio') ? 'artefact-portfolio' : 'autre';
    }

    /** « + Production » : un nom et une date ; elle devient une colonne du tableau. */
    async function ajouterProduction() {
        const groupe = _groupeActif();
        const champ = document.getElementById('vs-production-nom');
        const titre = ((champ || {}).value || '').trim();
        const retour = document.getElementById('vs-production-retour');
        if (!groupe) return;
        if (!titre) {
            if (retour) _ecrire(retour, `<p class="vs-erreur" role="alert">${esc(MOTS.productionSansNom)}</p>`);
            if (champ) champ.focus();
            return;
        }
        const existantes = _productionsDuCours(groupe.coursId);
        const production = D().productionLegere({
            id: window.genererIdUnique('PROD_'), titre, date: (document.getElementById('vs-production-date') || {}).value || '',
            coursId: groupe.coursId, type: _typeDeLaProduction(groupe, existantes), maintenant: new Date().toISOString()
        });
        // Le rang : « les plus récentes » se lit sur le numéro de la production (`creerComparateurRecenceStd`) ; la colonne
        // neuve prend le suivant, donc l'ordre des colonnes est celui de leur création.
        production.numero = existantes.reduce((max, p) => Math.max(max, D().rangDeProduction(p)), 0) + 1;
        const ecrit = await window.modifierEtAnnoncer(cle('productions'), (lues) => (lues || []).concat([production]), [], { geste: MOTS.plusProduction });
        if (!ecrit) return;
        _formulaireProduction = false;
        _rendreResultats();   // la colonne neuve paraît ; le témoin commun dit « Enregistré »
    }

    function _direAuFormulaire(html) { _ecrire(document.getElementById('vs-production-retour'), html); }

    /** La colonne qu'on règle, son groupe et sa pratique ; null si elle n'est plus là. */
    function _colonneOuverte() {
        const groupe = _groupeActif();
        const production = groupe && _colonne ? _productionsDuCours(groupe.coursId).find((x) => x.id === _colonne) : null;
        return production ? { groupe, production, pratique: _pratiqueDuGroupe(groupe) } : null;
    }

    async function _ecrireCompte(c, compte) {
        const nouvelle = D().poserCompte(c.pratique, c.production.id, compte);
        if (JSON.stringify(nouvelle) === JSON.stringify(c.pratique)) return true;
        const ecrit = await _ecrirePratique(nouvelle, MOTS.colonneCompte);
        if (ecrit) _apresEcriturePratique();
        return !!ecrit;
    }

    /** « Enregistrer » d'une colonne : son nom, sa date, son type, et si elle compte dans la note. Ses résultats ne sont pas touchés. */
    async function enregistrerColonne() {
        const c = _colonneOuverte();
        if (!c) { fermerProduction(); return; }
        const titre = ((document.getElementById('vs-production-nom') || {}).value || '').trim();
        if (!titre) { _direAuFormulaire(`<p class="vs-erreur" role="alert">${esc(MOTS.productionSansNom)}</p>`); return; }
        const champType = document.getElementById('vs-production-type');
        const types = _typesSpe(c.groupe);
        const type = champType ? (types.find((t) => String(t.id) === String(champType.value)) || {}).id : undefined;
        const modifiee = D().colonneModifiee(c.production, { titre, date: (document.getElementById('vs-production-date') || {}).value || '', type, maintenant: new Date().toISOString() });
        const ecrit = await window.modifierEtAnnoncer(cle('productions'), (lues) => (lues || []).map((p) => (p && p.id === modifiee.id) ? modifiee : p), [], { geste: MOTS.colonneEnregistrer });
        if (!ecrit) return;
        const marque = document.getElementById('vs-colonne-compte');
        if (marque && _marqueOfferte(c.groupe) && !(await _ecrireCompte(c, marque.checked))) return;
        fermerProduction();
        _rendreResultats();
    }

    /**
     * « Retirer la colonne » : SEULEMENT si elle est vide — aucun résultat, aucune évaluation, aucun fichier, dans aucun
     * groupe (`compterEmploisProduction`, la garde de la vue étendue). Rien n'est jamais effacé qui porte une donnée (limite
     * de Grégoire du 20 sept. 2026) : pleine, la colonne reste, et l'écran propose de la marquer « ne compte pas ».
     */
    async function retirerColonne() {
        const c = _colonneOuverte();
        if (!c) { fermerProduction(); return; }
        const emplois = window.compterEmploisProduction(c.production.id);
        if (emplois.total > 0) {
            const proposer = (_marqueOfferte(c.groupe) && !_exclues(c.groupe).has(c.production.id))
                ? `<p class="vs-gestes"><button type="button" class="btn btn-secondaire" data-action="VueSimple.colonneNeComptePas">${esc(MOTS.colonneMarquerHors)}</button></p>` : '';
            _direAuFormulaire(`<p class="vs-erreur" role="alert">${esc(MOTS.colonnePleine(emplois))}</p>${proposer}`);
            return;
        }
        const id = c.production.id;
        const ecrit = await window.modifierEtAnnoncer(cle('productions'), (lues) => {
            // La garde se relit À L'INSTANT DE L'ÉCRITURE : un résultat saisi entre le clic et ici garde sa colonne.
            if (window.compterEmploisProduction(id).total > 0) return undefined;
            return (lues || []).filter((p) => !p || p.id !== id);
        }, [], { geste: MOTS.colonneRetirer });
        if (!ecrit) return;
        if (c.pratique && c.pratique.configuration && _exclues(c.groupe).has(id)) await _ecrireCompte(c, true);   // l'exclusion d'une colonne partie ne reste pas
        fermerProduction();
        _rendreResultats();
    }

    /** Proposé au refus d'un retrait : la colonne pleine reste, et ne compte plus dans la note. */
    async function colonneNeComptePas() {
        const c = _colonneOuverte();
        if (!c || !_marqueOfferte(c.groupe)) return;
        if (!(await _ecrireCompte(c, false))) return;
        fermerProduction();
        _rendreResultats();
    }

    /* ============================== NOTE FINALE ============================== */

    function _rendreNote() {
        const hote = _conteneur('note');
        if (!hote) return;
        const tete = `<h2 class="vs-titre">${esc(MOTS.noteTitre)}</h2>${_selecteurGroupeHTML()}`;
        const groupe = _groupeActif();
        if (!groupe) { _ecrire(hote, tete + (_groupes().length ? '' : _sansClasseHTML())); return; }
        const r = window.TableauNotation ? window.TableauNotation.notesDuGroupe() : { etat: 'aucune-pratique', lignes: [] };
        const T = window.TableauNotation ? window.TableauNotation.MOTS : {};
        if (r.etat !== 'ok' && r.etat !== 'aucune-production') {
            const cleMot = { 'aucune-pratique': 'aucunePratique', 'autre-famille': 'autreFamille', 'aucun-eleve': 'aucunEleve', 'sans-echelle': 'sansEchelle' }[r.etat];
            const mot = cleMot === 'aucunEleve' ? MOTS.noteSansEleve : (MOTS.tableau[cleMot] || T[cleMot] || '');
            const geste = r.etat === 'aucune-pratique' ? `<p><button type="button" class="btn btn-principal" data-action="VueSimple.aller" data-param="pratique">${esc(MOTS.cartes[1].lien)}</button></p>`
                : (r.etat === 'aucun-eleve' ? `<p><button type="button" class="btn btn-principal" data-action="VueSimple.aller" data-param="classe">${esc(MOTS.cartes[0].lien)}</button></p>` : '');
            _ecrire(hote, `${tete}<p class="vs-etat">${esc(mot)}</p>${geste}`);
            return;
        }
        const enteteNote = r.finales ? T.noteFinale : T.noteProvisoire;
        const rangees = r.lignes.map((l) => `<tr><th scope="row">${esc(`${l.prenom} ${l.nom}`.trim())}</th>
            <td class="vs-note-valeur">${esc(l.note === null ? '–' : String(l.note))}</td><td class="vs-note-detail">${esc(l.detail)}</td></tr>`).join('');
        _ecrire(hote, `${tete}<p class="vs-intro">${esc(MOTS.noteIntro)}</p>
            <p class="vs-gestes"><button type="button" class="btn btn-principal" data-action="exporterSyntheseResultatsCSV">${esc(T.exporter)}</button>
                <button type="button" class="btn btn-secondaire" data-action="VueSimple.aller" data-param="resultats">${esc(MOTS.cartes[2].lien)}</button></p>
            <div class="vs-cadre-table"><table class="vs-table vs-notes"><thead><tr><th scope="col">${esc(MOTS.noteColonnes[0])}</th><th scope="col">${esc(enteteNote)}</th><th scope="col"><span class="u-lecteur-ecran">Détail</span></th></tr></thead>
                <tbody>${rangees}</tbody></table></div>`);
    }

    /* ============================== SAUVEGARDER ============================== */

    /**
     * L'en-tête du menu « Sauvegarder » (vue simple). Appelé par `Codex` à chaque ouverture du menu (`_actualiserMenu`).
     * @param {{actif: boolean, modifie: boolean}} etat - l'état du codex
     * @returns {string|null} le HTML de l'en-tête, ou null en vue étendue (le menu « Codex » reste tel quel)
     */
    function enteteDuMenuSauvegarder(etat) {
        if (!estSimple()) return null;
        const ligne = etat && etat.actif
            ? `<div class="codex-statut-etat"><span class="codex-statut-pastille ${etat.modifie ? 'codex-statut-pastille--orange' : 'codex-statut-pastille--vert'}">◉</span> ${esc(etat.modifie ? MOTS.sauvegardePasAJour : MOTS.sauvegardeAJour)}</div>` : '';
        return `<p class="vs-phrase-sauvegarder">${esc(MOTS.phraseSauvegarder)}</p>${ligne}`;
    }

    /* ============================== LE DÉMARRAGE ============================== */

    function _poserLesMots() {
        document.querySelectorAll('[data-vs-mot]').forEach((n) => {
            const mot = n.getAttribute('data-vs-mot').split('.').reduce((o, k) => (o ? o[k] : undefined), MOTS);
            if (typeof mot === 'string') n.textContent = mot;
        });
    }

    /**
     * Un geste commun (« Trimestres » du bandeau d'un trimestre clos, « Quitter la démo ») affiche une section de la vue
     * étendue : en vue simple, sa barre est masquée et l'on ne pourrait plus en sortir. On revient à l'écran simple courant.
     */
    function _surSectionEtendue() {
        if (estSimple()) aller(_ecran);
    }

    function _initialiser() {
        _poserLesMots();
        window.addEventListener('sectionAffichee', _surSectionEtendue);
        // La barre de la vue simple : `main.js` y a déjà câblé `afficherSection` (boutons de `.navigation-principale`) ; le rendu suit.
        document.querySelectorAll('.navigation-vue-simple button[data-onglet]').forEach((b) => {
            b.addEventListener('click', () => aller(b.getAttribute('data-onglet').replace('simple-', '')));
        });
        demarrer();
    }

    window.VueSimple = {
        MOTS, estSimple, vueCourante, basculer, demarrer, aller,
        changerGroupe, creerClasse: _unALaFois(creerClasse), choisirModele: _unALaFois(choisirModele),
        changerModele: _unALaFois(changerModele), enregistrerReglage: _unALaFois(enregistrerReglage),
        regler, annulerReglage, niveauGeste, typeGeste, palierGeste,
        ouvrirProduction, fermerProduction, ajouterProduction: _unALaFois(ajouterProduction),
        ouvrirColonne, enregistrerColonne: _unALaFois(enregistrerColonne), retirerColonne: _unALaFois(retirerColonne), colonneNeComptePas: _unALaFois(colonneNeComptePas),
        mettreAJour: _unALaFois(mettreAJour), garderValeurs,
        enteteDuMenuSauvegarder
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _initialiser);
    else _initialiser();
})();
