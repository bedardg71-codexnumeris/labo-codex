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
        // PROPOSÉ par Cowork (9 nov. 2026)
        sousTitreAccueil: 'Quatre étapes, de ta liste d’élèves à ta note finale.',
        cartes: [
            { ecran: 'classe', titre: 'Ta classe', texte: 'Colle ta liste d’élèves : DA, nom, prénom.', lien: 'Coller ma liste' },
            { ecran: 'pratique', titre: 'Ta pratique', texte: 'Choisis un modèle, par standards ou par spécifications, et la règle qui construit la note.', lien: 'Choisir un modèle' },
            { ecran: 'resultats', titre: 'Tes résultats', texte: 'Inscris un niveau, ou acceptable / non acceptable, dans un tableau : tes élèves en lignes, tes productions en colonnes.', lien: 'Ouvrir le tableau' },
            { ecran: 'note', titre: 'Ta note finale', texte: 'Arrête les notes du trimestre et exporte-les en CSV, prêtes pour ton relevé.', lien: 'Voir les notes' }
        ],
        // PROPOSÉ par Claude Code (9 nov. 2026)
        nav: { accueil: 'Accueil', classe: 'Classe', pratique: 'Pratique', resultats: 'Résultats', note: 'Note finale' },
        // — Classe
        classeTitre: 'Ta classe',
        classeIntro: 'Colle ta liste d’élèves, une ligne par élève : DA, nom, prénom.',
        classeExemple: '1234567, Tremblay, Alice',
        classeNomCours: 'Nom du cours (facultatif)',
        classeNomCoursDefaut: 'Mon cours',
        classeListe: 'Ta liste',
        classeCreer: 'Créer ma classe',
        classeAjouterTitre: 'Ajouter des élèves',
        classeAjouter: 'Ajouter à ma classe',
        classeColonnes: ['DA', 'Nom', 'Prénom'],
        classeCompte: (n) => `${n} élève${n > 1 ? 's' : ''}`,
        classeAucunLu: 'Aucun élève lu. Une ligne par élève : DA, nom, prénom.',
        classeRefusees: (n) => `${n} ligne${n > 1 ? 's' : ''} non lue${n > 1 ? 's' : ''} :`,
        classeCreee: (n) => `Classe créée : ${n} élève${n > 1 ? 's' : ''}.`,
        classeAjoutes: (n, deja) => `${n} élève${n > 1 ? 's' : ''} ajouté${n > 1 ? 's' : ''}` + (deja ? `, ${deja} déjà inscrit${deja > 1 ? 's' : ''} ce trimestre` : '') + '.',
        classeSuite: 'Choisir ma pratique',
        classeEnDemo: 'La démonstration est ouverte. Quitte-la pour créer ta classe.',
        classeEchec: 'La classe n’a pas pu être créée.',
        // — le groupe
        groupe: 'Groupe',
        groupeChoisir: 'Choisis un groupe',
        groupeAutrePratique: 'autre pratique',
        groupeMotAutres: 'Un groupe dont la pratique n’est ni par standards ni par spécifications se suit en vue étendue.',
        sansClasse: 'Commence par ta classe : colle ta liste d’élèves.',
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
        regleNombre: 'Nombre de productions retenues',
        regleEnregistrer: 'Enregistrer la règle',
        regleEnregistree: 'Règle enregistrée.',
        regleAutre: 'La règle de cette pratique se change en vue étendue.',
        paliersNote: 'Note',
        paliersAide: 'Pour chaque note, le nombre de productions acceptables qu’il faut, par type.',
        pratiqueChanger: 'Changer de modèle',
        pratiqueAutre: 'La pratique de ce groupe n’est ni par standards ni par spécifications : elle se règle en vue étendue.',
        pratiqueSuite: 'Ouvrir le tableau',
        pratiqueEchec: 'La pratique n’a pas pu être enregistrée.',
        reglePartagee: (n) => `Cette règle vaut pour les ${n} groupes qui ont cette pratique.`,
        niveaux: 'Niveaux :',
        // — Résultats (le tableau garde ses mots validés ; ceux-ci remplacent les messages qui nomment la vue étendue)
        tableau: {
            aucunePratique: 'Ce groupe n’a pas encore de pratique. Choisis un modèle : le tableau suivra sa règle.',
            autreFamille: 'Le tableau sert aux pratiques par standards et par spécifications. La pratique de ce groupe se suit en vue étendue.',
            aucunEleve: 'Ce groupe n’a pas encore d’élèves. Colle ta liste pour remplir le tableau.',
            aucuneProduction: 'Ton tableau n’a pas encore de colonne. Ajoute ta première production : un nom et une date.'
        },
        plusProduction: '+ Production',
        productionNom: 'Nom de la production',
        productionDate: 'Date',
        productionType: 'Type',
        productionAjouter: 'Ajouter',
        productionAnnuler: 'Annuler',
        productionSansNom: 'Donne un nom à la production.',
        // — Note finale
        noteTitre: 'Ta note finale',
        noteIntro: 'La note de chaque élève, construite par la règle de ta pratique à partir des résultats du tableau.',
        noteColonnes: ['Élève', 'Note'],
        noteSansEleve: 'Aucune note à montrer : ce groupe n’a pas encore d’élèves.',
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
        return D().applicationVide(trimestres, (id) => db.getSync(id + '_groupeEtudiants', []) || []);
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
        return D().vueAuDemarrage({ choix: _lireChoix(), vide: _vide(), demoOuverte: _demoOuverte(), pilote });
    }

    /** Au chargement de la page, puis quand les données sont lisibles (la liste des élèves peut vivre hors du cache synchrone). */
    function demarrer() {
        // Avant que les données soient lisibles, la liste des élèves peut manquer (elle vit parfois hors du cache synchrone) :
        // sans choix, dès qu'un trimestre existe, on pose la vue étendue et on tranche quand les données sont là — jamais
        // l'inverse, qui ferait clignoter la vue simple chez qui a un gros corpus (relecture neuve, 9 nov. 2026).
        const aUnTrimestre = (db.getSync('trimestres', []) || []).some((t) => t && t.id && t.id !== 'demo' && t.isDemo !== true);
        _poser((!_lireChoix() && aUnTrimestre && _vide()) ? D().VUES.ETENDUE : _vueCalculee(), true);
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
        try {
            const groupe = actif || await _naitreGroupe(nomCours);
            const r = await _inscrire(lecture.fiches, groupe);
            if (!r.ecrit) throw new Error('élèves non inscrits');
            if (!actif) await _activerGroupeNe(groupe);
            _ecrireChoix(D().VUES.SIMPLE);   // bâtir sa classe ici vaut un choix : la vue simple reste au prochain démarrage
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

    /** L'échelle qu'un modèle par standards reçoit : l'échelle de départ du trimestre, sinon la première qui porte des niveaux. */
    function _echelleDeDepart() {
        const echelles = (db.getSync(cle('echellesTemplates'), []) || []).filter((e) => e && Array.isArray(e.niveaux) && e.niveaux.length);
        return echelles.find((e) => e.id === 'ECHELLE_IDME_DEPART') || echelles[0] || null;
    }

    function _echelleDeLaPratique(pratique) {
        const id = pratique && pratique.configuration && pratique.configuration.echelleId;
        const echelle = (id && typeof obtenirEchelleResolue === 'function') ? obtenirEchelleResolue(id) : null;
        return echelle || _echelleDeDepart();
    }

    /** Les mots de la règle des standards : ceux de l'assistant et de la fiche (registre, validés le 29 oct. 2026). */
    function _motsRegleStd() {
        const m = (typeof MOTS_POOL_STD !== 'undefined' && MOTS_POOL_STD.productions) || {};
        return { meilleurs: m.modeMeilleurs || 'N meilleures productions', recents: m.modeDerniers || 'N dernières productions', tous: m.modeTous || 'Toutes les productions' };
    }

    function _regleStdHTML(pratique) {
        const regle = D().regleStd(pratique);
        if (regle.methode === 'autre') {
            const phrase = window.TableauNotation ? window.TableauNotation.phraseRegleStd(pratique.configuration, false) : '';
            return `<p class="vs-intro">${esc(phrase)}</p><p class="vs-note">${esc(MOTS.regleAutre)}</p>`;
        }
        const mots = _motsRegleStd();
        const choix = D().REGLES_STD.map((m) => `<label class="vs-choix"><input type="radio" name="vs-regle" value="${esc(m)}"${regle.methode === m ? ' checked' : ''}> ${esc(mots[m])}</label>`).join('');
        const echelle = _echelleDeLaPratique(pratique);
        const niveaux = echelle ? (echelle.niveaux || []).map((n) => `<span class="vs-niveau"><strong>${esc(n.code)}</strong> ${esc(n.nom || '')} ${esc(String(n.valeurCalcul != null ? n.valeurCalcul : (n.valeur != null ? n.valeur : '')))}</span>`).join('') : '';
        return `<fieldset class="vs-regle"><legend class="u-lecteur-ecran">${esc(MOTS.pratiqueRegle)}</legend>${choix}</fieldset>
            <div class="groupe-form vs-nombre"><label for="vs-regle-nombre">${esc(MOTS.regleNombre)}</label>
                <input type="number" id="vs-regle-nombre" class="controle-form" min="1" max="99" value="${esc(String(regle.nombre || 1))}"></div>
            ${niveaux ? `<p class="vs-niveaux"><span class="vs-niveaux-titre">${esc(MOTS.niveaux)}</span> ${niveaux}</p>` : ''}`;
    }

    function _regleSpeHTML(pratique) {
        const c = pratique.configuration || {};
        const types = c.typesTravaux || [];
        const tetes = types.map((t) => `<th scope="col">${esc(t.nom || t.id)}</th>`).join('');
        const rangees = (c.forfaits || []).map((f) => {
            const cases = types.map((t) => `<td><input type="number" class="controle-form vs-palier-nombre" min="0" max="99" data-palier="${esc(f.id)}" data-type="${esc(t.id)}" value="${esc(String((f.travaux || {})[t.id] || 0))}" aria-label="${esc((f.lettre || '') + ', ' + (t.nom || t.id))}"></td>`).join('');
            return `<tr><th scope="row">${esc(f.lettre || '')}</th>
                <td><input type="number" class="controle-form vs-palier-note" min="0" max="100" data-palier="${esc(f.id)}" value="${esc(String(f.note))}" aria-label="${esc((f.lettre || '') + ', ' + MOTS.paliersNote)}"></td>${cases}</tr>`;
        }).join('');
        return `<p class="vs-note">${esc(MOTS.paliersAide)}</p>
            <div class="vs-cadre-table"><table class="vs-table vs-paliers"><thead><tr><th scope="col"></th><th scope="col">${esc(MOTS.paliersNote)}</th>${tetes}</tr></thead><tbody>${rangees}</tbody></table></div>`;
    }

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

    /** La pratique du groupe : son modèle, sa règle (réglable ici, ou seulement lue), et les gestes. */
    function _pratiqueChoisieHTML(groupe, famille, retourHTML) {
        const pratique = _pratiqueDuGroupe(groupe);
        const std = famille === D().FAMILLES.STD;
        const nomFamille = (MOTS.modeles.find((m) => m.famille === famille) || {}).titre || '';
        const noms = [nomFamille, pratique.nom].filter((x, i, t) => x && t.indexOf(x) === i).join(' · ');
        // Une pratique importée sous l'ancienne forme (`.config`) se lit, elle ne se règle pas ici.
        const lisible = !!pratique.configuration;
        const regle = !lisible ? `<p class="vs-note">${esc(MOTS.regleAutre)}</p>` : (std ? _regleStdHTML(pratique) : _regleSpeHTML(pratique));
        const modifiable = lisible && !(std && D().regleStd(pratique).methode === 'autre');
        return `<p class="vs-intro"><span class="vs-libelle">${esc(MOTS.pratiqueModele)}</span> ${esc(noms)}</p>
            <div class="vs-bloc"><h3 class="vs-sous-titre">${esc(MOTS.pratiqueRegle)}</h3>${regle}${modifiable ? _reglePartageeHTML(pratique) : ''}
                <div id="vs-pratique-retour">${retourHTML || ''}</div>
                <p class="vs-gestes">${modifiable ? `<button type="button" class="btn btn-principal" data-action="VueSimple.enregistrerRegle">${esc(MOTS.regleEnregistrer)}</button>` : ''}
                    <button type="button" class="btn btn-secondaire" data-action="VueSimple.aller" data-param="resultats">${esc(MOTS.pratiqueSuite)}</button>${_changerModeleHTML(groupe)}</p></div>`;
    }

    /** La règle est celle de la PRATIQUE : si d'autres groupes l'ont aussi, l'écran le dit avant qu'on l'enregistre. */
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

    /** Une pratique déjà installée de ce modèle, qu'aucun groupe n'emploie (laissée par « Changer de modèle ») : on la reprend. */
    function _pratiqueLibreDuModele(idModele) {
        const prises = new Set(_groupes().map((g) => g.pratiqueId).filter(Boolean));
        return _pratiques().find((p) => p.inspireDe && p.inspireDe.sourceId === idModele && p.dansBibliotheque !== false && !prises.has(p.id)) || null;
    }

    /** Installe un modèle existant dans le trimestre et l'assigne au groupe actif (les chemins de la vue étendue). */
    async function choisirModele(idModele) {
        const groupe = _groupeActif();
        const modele = _modele(idModele);
        if (!groupe || !modele || _famille(groupe) !== null) return;
        try {
            if (modele.type === D().FAMILLES.STD && typeof window.assurerEchelleIdmeDeDepart === 'function') await window.assurerEchelleIdmeDeDepart();
            const echelle = _echelleDeDepart();
            const libre = _pratiqueLibreDuModele(idModele);
            if (libre) { await window.PratiqueManager.changerPratiqueActive(libre.id); _rendrePratique(); return; }
            const titre = (MOTS.modeles.find((m) => m.modele === idModele) || {}).titre;
            const pratique = D().pratiqueDepuisModele(modele, {
                nom: titre, id: window.genererIdUnique('PRAT_'), echelleId: echelle ? echelle.id : null, maintenant: new Date().toISOString()
            });
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
        try {
            await window.PratiqueManager.changerPratiqueActive(null);
        } catch (e) { console.error('[Vue simple] modèle non changé :', e); }
        _rendrePratique();
    }

    function _lireRegle(pratique, famille) {
        if (famille === D().FAMILLES.STD) {
            const coche = document.querySelector('input[name="vs-regle"]:checked');
            return D().poserRegleStd(pratique, { methode: coche ? coche.value : null, nombre: (document.getElementById('vs-regle-nombre') || {}).value });
        }
        const paliers = {};
        document.querySelectorAll('.vs-palier-note').forEach((el) => { (paliers[el.dataset.palier] = paliers[el.dataset.palier] || { id: el.dataset.palier, travaux: {} }).note = el.value; });
        document.querySelectorAll('.vs-palier-nombre').forEach((el) => { (paliers[el.dataset.palier] = paliers[el.dataset.palier] || { id: el.dataset.palier, travaux: {} }).travaux[el.dataset.type] = el.value; });
        return D().poserPaliersSpe(pratique, Object.keys(paliers).map((k) => paliers[k]));
    }

    async function enregistrerRegle() {
        const groupe = _groupeActif();
        const pratique = _pratiqueDuGroupe(groupe);
        const famille = _famille(groupe);
        if (!pratique || !pratique.configuration || (famille !== D().FAMILLES.STD && famille !== D().FAMILLES.SPE)) return;
        const nouvelle = _lireRegle(pratique, famille);
        const ecrit = await window.modifierEtAnnoncer(cle('pratiquesConfigurables'),
            (lues) => (lues || []).map((p) => (p && p.id === nouvelle.id) ? nouvelle : p), [], { geste: MOTS.regleEnregistrer });
        if (ecrit) _apresEcriturePratique();
        _rendrePratique(ecrit ? `<p class="vs-succes" role="status">${esc(MOTS.regleEnregistree)}</p>` : `<p class="vs-erreur" role="alert">${esc(MOTS.pratiqueEchec)}</p>`);
    }

    /* ============================== RÉSULTATS ============================== */

    function _typesSpe(groupe) {
        const p = _pratiqueDuGroupe(groupe);
        return (_famille(groupe) === D().FAMILLES.SPE && p && p.configuration && p.configuration.typesTravaux) || [];
    }

    function _formulaireProductionHTML(groupe) {
        if (!_formulaireProduction) return '';
        const types = _typesSpe(groupe);
        // En spécifications, une production n'est une colonne que si elle a un type de la pratique : avec plus d'un type, il se choisit.
        const type = types.length > 1 ? `<div class="groupe-form"><label for="vs-production-type">${esc(MOTS.productionType)}</label>
                <select id="vs-production-type" class="controle-form">${types.map((t) => `<option value="${esc(t.id)}">${esc(t.nom || t.id)}</option>`).join('')}</select></div>` : '';
        return `<div class="vs-bloc vs-production" id="vs-production-formulaire">
            <div class="vs-production-champs">
                <div class="groupe-form vs-production-nom"><label for="vs-production-nom">${esc(MOTS.productionNom)}</label>
                    <input type="text" id="vs-production-nom" class="controle-form" maxlength="120" autocomplete="off"></div>
                <div class="groupe-form"><label for="vs-production-date">${esc(MOTS.productionDate)}</label>
                    <input type="date" id="vs-production-date" class="controle-form"></div>${type}
            </div>
            <div id="vs-production-retour"></div>
            <p class="vs-gestes"><button type="button" class="btn btn-principal" data-action="VueSimple.ajouterProduction">${esc(MOTS.productionAjouter)}</button>
                <button type="button" class="btn btn-secondaire" data-action="VueSimple.fermerProduction">${esc(MOTS.productionAnnuler)}</button></p></div>`;
    }

    function _presentationDuTableau(hote) {
        return {
            hote,
            mots: MOTS.tableau,
            aUneGrille: _aUneGrille,
            reglages: { action: 'VueSimple.aller', param: 'pratique' },
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
        _formulaireProduction = true;
        const hote = document.getElementById('vs-production-hote');
        if (!hote) { _rendreResultats(); return; }
        _ecrire(hote, _formulaireProductionHTML(_groupeActif()));
        const nom = document.getElementById('vs-production-nom');
        if (nom) nom.focus();
    }

    function fermerProduction() {
        _formulaireProduction = false;
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
        changerModele: _unALaFois(changerModele), enregistrerRegle: _unALaFois(enregistrerRegle),
        ouvrirProduction, fermerProduction, ajouterProduction: _unALaFois(ajouterProduction),
        enteteDuMenuSauvegarder
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _initialiser);
    else _initialiser();
})();
