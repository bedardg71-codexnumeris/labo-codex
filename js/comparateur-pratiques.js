/* ============================================================
   COMPARATEUR DE PRATIQUES — sous-section pérenne du Labo (lot C4)
   ------------------------------------------------------------
   Vue d'aide au choix d'une pratique de notation. Montre, sur des
   profils-types contrastés, la maîtrise en regard de chaque note —
   pour sortir du paradigme du cumul (la note = reflet de la maîtrise
   en fin de parcours, pas un score additionné).

   Spec : plans de travail/SPEC_comparateur_pratiques.md (§3.1 matrice,
          §1 bis finalité, §3.4 garde démo, §7 séquencement C4)
   Conception : NOTE-CONCEPTION-C1/C2-comparateur.md (design validé
                avec Grégoire les 6-7 juin 2026)

   FORME (lot C4) : vraie SOUS-SECTION du Labo (Labo › « Comparateur de
   pratiques »), pas un overlay. La visibilité est gérée par la
   navigation (afficherSousSection ajoute/retire .active) ; ce module
   construit le contenu via l'initialiseur 'labo-comparateur' du
   dispatcher INITIALISATEURS_SOUS_SECTION de navigation.js. Aucun
   bouton Fermer / Échap / clic-extérieur : on quitte par la sous-nav.

   API publique :
   - initialiserComparateurPratiques()  ← appelée par navigation.js
   - _comparateurGenererCSV()           ← exposée pour les tests (C3)

   Conteneur : #labo-comparateur (index.html), rempli dynamiquement à
   chaque affichage de la sous-section (entrée fraîche = retour matrice).

   Sécurité : le banc est LECTURE SEULE. Source 'fictif' (#326 R4) = profils-types
   GÉNÉRÉS depuis l'échelle (R2) injectés en mémoire dans simulerIndices (aucune
   écriture, aucune bascule de contexte) ; source 'reel' = lecture du groupe actif.
   Les NOMS de pratiques de l'utilisateur (arbre, colonnes) → TOUJOURS échappés par
   _esc (echapperHtml). Les actions de l'arbre (dériver/adopter/jeter) délèguent aux
   fonctions d'écriture de la couche pratiques — aucun chemin de persistance parallèle.
   ============================================================ */

(function() {

    /* ── État interne ─────────────────────────────────────── */
    // Candidates simulées sélectionnées (1-2 ids), réinitialisées à chaque
    // entrée dans la sous-section. null = pas encore initialisé → défauts
    // calculés au rendu (C1-d).
    // #326 R4b : colonnes PAIRES — 2-3 pratiques/maquettes au choix, sans colonne
    // « référence » privilégiée (le banc compare des pratiques entre elles).
    var _colonnesSel = null;

    // Vue courante du panneau : 'matrice' (comparaison) ou 'fiche' (profil) — C2-d.
    var _vue = 'matrice';
    var _daFiche = null;

    // #326 R5 : profils-types DEMO figés, MICROCOPY_E1, PHRASES_CONTEXTE et la garde
    // « mode démo » (PROFILS, estEnDemo, construireInvitation, activerDemoEtOuvrir)
    // RETIRÉS — le banc s'appuie désormais sur les profils fictifs GÉNÉRÉS (R2/R4a)
    // et la source réelle (R4b). Le contexte de chaque profil vient du générateur.

    // Avertissement sous la matrice ET sous le récit de la fiche : le comparateur
    // est expérimental ; invite à signaler les anomalies pour contribuer à son
    // amélioration. (Le recentrage anti-palmarès reste porté par le paragraphe de
    // finalité en tête : « un écart entre des points n’est ni un bonus ni une erreur ».)
    var LIGNE_GARDE = 'Le comparateur est un outil expérimental et peut présenter des erreurs. Partage tes observations et participe à son amélioration en utilisant l’icône « Signaler un bug », en haut à droite de l’en-tête.';

    // Note « outil en développement » (demande Grégoire, 17 juin) — placée EN TÊTE du
    // banc, distincte de la garde « expérimental » de bas de page. Cadre la lecture
    // d'un 0 : selon les paramètres d'une pratique (surtout PAN-Standards : structure
    // portfolio/pondération/artefacts) et leur compatibilité avec les résultats réels
    // qui alimentent la simulation, la note peut ne PAS être constructible — le banc
    // affiche alors 0. Ce n'est pas nécessairement une erreur : c'est un état attendu
    // d'un outil encore en construction.
    var NOTE_DEV_TITRE = 'Outil en développement';
    var NOTE_DEV_TEXTE = 'Le comparateur est en construction. Pour certaines pratiques — surtout PAN-Standards — une note peut s’afficher à 0 : le plus souvent, cela veut dire que la note ne peut pas être construite à partir des paramètres choisis et des résultats réels disponibles, pas qu’il y a forcément une erreur. Lis les résultats avec prudence.';

    /* ── Source de données du banc (#326 R4) ───────────────────
       'fictif' (défaut) = profils-types GÉNÉRÉS depuis l'échelle de l'utilisateur
       (R2) + injectés dans le moteur en lecture seule (Étape 2). Plus besoin du
       mode démo : la décision « quelle pratique adopter ? » se prend AVANT que les
       élèves produisent. ('reel' = un vrai groupe → R4b, à venir.) Corpus mis en
       cache par entrée dans la sous-section (réinitialisé par rendreComparateur). */
    var _sourceDonnees = 'fictif';
    var _corpusCache = null;

    // Échelle qui pilote les profils fictifs : celle de la pratique de référence si
    // elle en a une, sinon la 1ʳᵉ échelle disponible. null si aucune échelle.
    function _echelleActiveComparateur() {
        var echelles = (typeof db !== 'undefined') ? (db.getSync(cle('echellesTemplates'), []) || []) : [];
        if (!echelles.length) return null;
        var cfg = _resoudreConfig(_refId());
        var echId = cfg && cfg.echelle && (cfg.echelle.echelle_id || cfg.echelle.id);
        if (echId) {
            for (var i = 0; i < echelles.length; i++) { if (echelles[i].id === echId) return echelles[i]; }
        }
        return echelles[0];
    }

    // Corpus fictif courant (généré une fois, mis en cache). null hors mode fictif
    // ou si le générateur/l'échelle manquent.
    function _corpusActif() {
        if (_sourceDonnees !== 'fictif') return null;
        if (_corpusCache) return _corpusCache;
        if (typeof ProfilsTypesGenerateur === 'undefined' || !ProfilsTypesGenerateur.genererCorpus) return null;
        var ech = _echelleActiveComparateur();
        if (!ech) return null;
        var c = ProfilsTypesGenerateur.genererCorpus(ech);
        if (!c || !c.profils.length) return null;
        _corpusCache = { evaluations: c.evaluations, productions: c.productions, profils: c.profils, echelle: ech };
        return _corpusCache;
    }

    // Jeu à injecter dans simulerIndices (clés du moteur), ou null (→ stockage réel).
    function _corpusInjection() {
        var c = _corpusActif();
        return c ? { evaluationsSauvegardees: c.evaluations, productions: c.productions } : null;
    }

    // Profils affichés : réels (source 'reel'), sinon générés (fictif), sinon démo (repli).
    function _profilsActifs() {
        if (_sourceDonnees === 'reel') return _profilsReels();
        var c = _corpusActif();
        if (c && c.profils.length) {
            return c.profils.map(function(p) { return { da: p.da, label: p.label, contexte: p.contexte }; });
        }
        return [];
    }

    /* ════════════════════════════════════════════════════════
       MOTEUR (consommation seule — aucune écriture)
       ════════════════════════════════════════════════════════ */

    // Productions / évaluations selon le mode (démo ou réel) + échelles globales.
    function _donnees() {
        var echelles = (typeof db !== 'undefined') ? (db.getSync(cle('echellesTemplates'), []) || []) : [];
        // #326 R4 : en source fictive, le banc lit le corpus généré (R2), pas le
        // stockage. (Les notes passent par simulerIndices+injection ; ici c'est la
        // colonne « Niveau atteint » et la fiche qui lisent productions/évaluations.)
        var corpus = _corpusActif();
        if (corpus) {
            return { productions: corpus.productions, evaluations: corpus.evaluations, echelles: echelles };
        }
        var lire = (typeof obtenirDonneesSelonMode === 'function')
            ? obtenirDonneesSelonMode
            : function() { return []; };
        // #1055 : la colonne « Niveau atteint » et la fiche ne lisent pas le travail diagnostique
        // (les notes, elles, passent par les familles, qui l'écartent déjà).
        var productions = lire('productions') || [];
        return {
            productions: productions,
            evaluations: window.ProductionDiagnostique.filtrerEvaluations(lire('evaluationsSauvegardees') || [], productions),
            echelles: echelles
        };
    }

    function _echelle(echelleId, echelles) {
        if (!echelleId) return null;
        for (var i = 0; i < echelles.length; i++) {
            if (echelles[i].id === echelleId) return echelles[i];
        }
        return null;
    }

    // Rang d'un niveau = son index dans l'échelle triée (jamais une valeur IDME
    // codée en dur — l'outil est pluraliste, §3 de la note).
    function _rang(echelle, code) {
        if (!echelle || !echelle.niveaux) return -1;
        for (var i = 0; i < echelle.niveaux.length; i++) {
            if (echelle.niveaux[i].code === code) return i;
        }
        return -1;
    }

    // Évaluations recevables d'un profil portant un niveau, triées par date.
    function _evalsProfil(da, evaluations) {
        return evaluations.filter(function(e) {
            if (e.etudiantDA !== da) return false;
            if (e.remplaceeParId) return false;
            if (e.niveauFinal === null || e.niveauFinal === undefined || e.niveauFinal === '') return false;
            if (window.evaluationNonRecevable(e)) return false;   // le prédicat du registre (28 oct. 2026)
            return true;
        }).sort(function(a, b) {
            return new Date(a.dateEvaluation) - new Date(b.dateEvaluation);
        });
    }

    // Seuils de tendance (proposition §12.3, à valider en terrain).
    function _tendance(delta) {
        if (delta >= 2)  return { fleche: '↗↗', mot: 'forte progression' };
        if (delta === 1) return { fleche: '↗',  mot: 'progression' };
        if (delta <= -1) return { fleche: '↘',  mot: 'recul' };
        return { fleche: '→', mot: 'stable' };
    }

    // Colonne « Niveau atteint » : niveau de fin de parcours (production
    // terminale, sinon dernière éval datée — §4 + repli §12.2), traduit via
    // l'ÉCHELLE de la grille (libellé + description SOLO au survol), + tendance.
    function _niveauAtteint(da, d) {
        var evals = _evalsProfil(da, d.evaluations);
        if (!evals.length) return null;

        var terminale = null;
        for (var i = 0; i < d.productions.length; i++) {
            if (d.productions[i].type === 'terminale') { terminale = d.productions[i]; break; }
        }
        var evalFin = null;
        if (terminale) {
            var fins = evals.filter(function(e) { return e.productionId === terminale.id; });
            evalFin = fins.length ? fins[fins.length - 1] : null;
        }
        if (!evalFin) evalFin = evals[evals.length - 1];   // repli : dernière éval datée

        var echelle = _echelle(evalFin.echelleId, d.echelles);
        var niveau = null;
        if (echelle && echelle.niveaux) {
            for (var j = 0; j < echelle.niveaux.length; j++) {
                if (echelle.niveaux[j].code === evalFin.niveauFinal) { niveau = echelle.niveaux[j]; break; }
            }
        }
        var delta = _rang(echelle, evalFin.niveauFinal) - _rang(echelle, evals[0].niveauFinal);
        return {
            label: niveau ? niveau.nom : evalFin.niveauFinal,
            description: (niveau && niveau.description) ? niveau.description : '',
            tendance: _tendance(delta)
        };
    }

    // Code court de famille (SOM/STD/SPE) — strict d'abord (familles codées),
    // sinon via l'instance (pratiques configurables : dérive de configuration.type).
    function _codePratique(id) {
        if (typeof obtenirRepresentationPratiqueStricte === 'function') {
            var r = obtenirRepresentationPratiqueStricte(id);
            if (r && r.code) return r.code;
        }
        var inst = (typeof obtenirPratiqueParId === 'function') ? obtenirPratiqueParId(id) : null;
        return (inst && typeof inst.obtenirCode === 'function') ? inst.obtenirCode() : null;
    }

    // D-4 : une pratique de dénotation (DEN) n'est PAS simulable — sa note finale
    // est un jugement posé, pas un calcul sur les données (SPEC §7, SKILL §8 DEN-E).
    function _estDEN(id) { return _codePratique(id) === 'DEN'; }

    // Badge construit depuis le CODE réel (genererBadgePratiqueHTML retombe sur STD
    // par défaut pour un id configurable non mappé — à ne pas réutiliser ici).
    function _badge(id) {
        var code = _codePratique(id);
        if (!code) return '';
        var c = code.toLowerCase();
        return '<span class="badge-type-pratique badge-type-' + c + '">' + code + '</span>';
    }

    function _configsPratiques() {
        var ns = (typeof cle === 'function') ? db.getSync(cle('pratiquesConfigurables'), null) : null;
        return ns || [];
    }

    function _nomPratique(id) {
        var cfg = _configsPratiques().filter(function(p) { return p.id === id; })[0];
        if (cfg && cfg.nom) return cfg.nom;
        var inst = (typeof obtenirPratiqueParId === 'function') ? obtenirPratiqueParId(id) : null;
        if (inst && inst.nom) return inst.nom;
        if (typeof obtenirRepresentationPratique === 'function') {
            var r = obtenirRepresentationPratique(id);
            if (r && r.famille) return r.famille;
        }
        return id;
    }

    // Pratique active du groupe-cours — sert de 1ʳᵉ colonne par défaut (#326 R4b :
    // colonnes paires, plus de notion de « référence privilégiée »).
    // Lot N1b (21 sept. 2026) : l'id que rend LA désignation, ou null. Sans pratique assignée, aucune
    // colonne n'est « l'active » : `_initColonnes` remplit ses deux colonnes par les comparables.
    function _refId() {
        return (typeof obtenirIdPratiqueActive === 'function') ? obtenirIdPratiqueActive() : null;
    }

    // Pratiques COMPARABLES offertes aux sélecteurs (#326 R4b) : familles codées
    // (SOM/STD/SPE) + pratiques configurables de la bibliothèque, MAQUETTES INCLUSES
    // (on compare aussi des essais). Gabarits prédéfinis EXCLUS (non exécutables,
    // skill §3/§10). Plus d'exclusion d'une « référence » : modèle paires.
    function _pratiquesComparables() {
        var vues = {};
        var liste = [];
        function ajouter(id) {
            if (!id || vues[id]) return;
            var code = _codePratique(id);
            if (!code) return;
            vues[id] = true;
            liste.push({ id: id, nom: _nomPratique(id), code: code });
        }
        ['sommative', 'standards', 'specifications'].forEach(ajouter);
        _configsPratiques().forEach(function(p) { ajouter(p.id); });
        return liste;
    }

    // Défauts des colonnes : la pratique active + une 2ᵉ distincte (SOM si l'active
    // n'est pas SOM, sinon la 1ʳᵉ autre comparable). 2 colonnes par défaut (max 3).
    function _initColonnes() {
        if (_colonnesSel) return;
        var sel = [];
        var actif = _refId();
        if (actif && _codePratique(actif)) sel.push(actif);
        var dispo = _pratiquesComparables();
        var deux = (actif !== 'sommative') ? 'sommative'
            : (dispo.filter(function(p) { return p.id !== actif; })[0] || {}).id;
        if (deux && deux !== actif && _codePratique(deux)) sel.push(deux);
        // Repli : au moins 2 colonnes si possible.
        if (sel.length < 2) {
            dispo.forEach(function(p) { if (sel.length < 2 && sel.indexOf(p.id) === -1) sel.push(p.id); });
        }
        _colonnesSel = sel.slice(0, 3);
    }

    function _colonnes() {
        _initColonnes();
        return _colonnesSel.filter(Boolean).map(function(id) { return { id: id }; });
    }

    // Type canonique (pour ConstructionAttributs) à partir du code de famille — sert
    // aux familles codées (SOM/STD/SPE) qui n'ont pas d'enveloppe configurable.
    var _CODE_VERS_TYPE = { SOM: 'sommative', STD: 'standards', SPE: 'specifications', DEN: 'denotation' };
    function _configPourExtraction(id) {
        var cfg = _resoudreConfig(id);
        if (cfg) return cfg;
        return { type: _CODE_VERS_TYPE[_codePratique(id)] || null };
    }

    // Profils réels (source 'reel') : étudiant·es du groupe actif, lecture seule.
    function _profilsReels() {
        var etu = (typeof obtenirDonneesSelonMode === 'function')
            ? (obtenirDonneesSelonMode('groupeEtudiants') || []) : [];
        // #1075, point 1 : `da` reste la clé des calculs ; ce qui s'affiche et s'exporte est
        // `daAffichage` (masqué en anonymisation, sauf réglage contraire). En anonymisation, `nom`
        // est vide et `prenom` porte « Élève N » : le libellé ne retombe plus sur le vrai DA.
        return etu.filter(function(e) { return e && e.da; }).slice(0, 12)
            .map(function(e) {
                var daAffichage = (typeof obtenirDAAffichage === 'function') ? obtenirDAAffichage(e) : e.da;
                return { da: e.da, daAffichage: daAffichage, label: e.nom || e.prenom || daAffichage, contexte: '' };
            });
    }

    // Note finale simulée (0-100), lecture seule. null si non calculable.
    // #326 R4 : en source fictive, on injecte le corpus généré (sinon stockage réel).
    // Retourne le résultat de simulation complet { P, noteConstructible, ... }
    // ou null si la pratique est introuvable / invalide. #326 (sous-item) :
    // les consommateurs distinguent un « 0 » légitime (noteConstructible) d'une
    // note non constructible (P forcé à 0 faute de calcul possible).
    function _note(da, pratiqueId) {
        if (typeof simulerIndices !== 'function') return null;
        return simulerIndices(da, pratiqueId, _corpusInjection()) || null;
    }

    function _esc(s) {
        return (typeof echapperHtml === 'function') ? echapperHtml(String(s)) : String(s);
    }

    /* ── Extraction des attributs de construction par colonne (R3 → R4b) ─ */
    // Pour chaque colonne : { axe → {libelle, valeur} } via ConstructionAttributs.
    function _extraitsColonnes(cols) {
        return cols.map(function(c) {
            var parAxe = {};
            if (typeof ConstructionAttributs !== 'undefined' && ConstructionAttributs.extraire) {
                ConstructionAttributs.extraire(_configPourExtraction(c.id)).attributs
                    .forEach(function(a) { parAxe[a.axe] = a; });
            }
            return parAxe;
        });
    }
    // Union ORDONNÉE des axes, GROUPÉE PAR PARAMÈTRE (9 sept. 2026).
    //
    // Avant : `AXES_ANCRES` donnait trois axes de tête, puis les autres dans
    // l'ordre de première apparition. Maintenant l'ossature est celle des SIX
    // PARAMÈTRES (`ConstructionAttributs.PARAMETRES`), et chaque axe se range
    // sous le sien via son champ `parametre`.
    //
    // ⚠ L'ancien filtre `.filter(libelles[a])` supprimait un axe annoncé mais
    // jamais produit. Il n'a plus lieu d'être ici : les six paramètres sont
    // toujours produits par `extraire()`. Un paramètre qui ne porterait aucun
    // axe est néanmoins ÉCARTÉ du rendu — un en-tête seul, sans ligne dessous,
    // ne dirait rien à personne.
    // Le libellé d'un axe est pris de la 1ʳᵉ colonne qui le porte.
    function _groupesConstruction(extraits) {
        var params = (typeof ConstructionAttributs !== 'undefined' && ConstructionAttributs.PARAMETRES)
            ? ConstructionAttributs.PARAMETRES.slice() : [];
        var parParam = {}, ordre = [];
        params.forEach(function(p) { parParam[p.cle] = []; ordre.push(p); });
        var libelles = {};
        extraits.forEach(function(parAxe) {
            Object.keys(parAxe).forEach(function(axe) {
                var a = parAxe[axe];
                var cle = a.parametre || 'autres';
                if (!parParam[cle]) { parParam[cle] = []; ordre.push({ cle: cle, libelle: 'Autres' }); }
                if (parParam[cle].indexOf(axe) === -1) parParam[cle].push(axe);
                if (!libelles[axe]) libelles[axe] = a.libelle;
            });
        });
        return ordre.map(function(p) {
            return {
                cle: p.cle, libelle: p.libelle,
                axes: parParam[p.cle].map(function(a) { return { axe: a, libelle: libelles[a] }; })
            };
        }).filter(function(g) { return g.axes.length > 0; });
    }

    /* ── Rendu du banc : construction (R3) + résultats (R2/réel) ─────── */
    function _rendreMatrice() {
        var d = _donnees();
        var cols = _colonnes();
        var dispo = _pratiquesComparables();
        var extraits = _extraitsColonnes(cols);
        var groupes = _groupesConstruction(extraits);
        var nbCol = cols.length;

        var h = '<table class="comparateur-matrice-table">';
        // En-tête : un sélecteur de pratique par colonne + lien « Éditer » (#319).
        h += '<thead><tr><th scope="col" class="comparateur-col-profil"></th>';
        cols.forEach(function(c, slot) {
            h += '<th scope="col" class="comparateur-col-pratique">' + _enteteColonne(slot, c.id, dispo) + '</th>';
        });
        h += '</tr></thead><tbody>';

        // SECTION 1 — Construction de la note (lignes R3, alignées par axe).
        h += '<tr class="comparateur-section-tete"><th colspan="' + (nbCol + 1) + '" scope="colgroup">Construction de la note</th></tr>';
        // Un en-tête par paramètre, puis ses axes. TROIS niveaux dans ce tableau —
        // section (« Construction de la note ») > paramètre > ligne — donc trois
        // traitements visuels : `.comparateur-parametre-tete` est le niveau du
        // milieu (#808, 9 sept. 2026).
        groupes.forEach(function(groupe) {
            h += '<tr class="comparateur-parametre-tete"><th colspan="' + (nbCol + 1) + '" scope="colgroup">'
                + _esc(groupe.libelle) + '</th></tr>';
            groupe.axes.forEach(function(ax) {
                h += '<tr class="comparateur-ligne-constr"><th scope="row" class="comparateur-col-profil">' + _esc(ax.libelle) + '</th>';
                extraits.forEach(function(parAxe) {
                    var a = parAxe[ax.axe];
                    var v = a ? a.valeur : 's.o.';
                    h += '<td class="comparateur-cellule-constr' + (a ? '' : ' comparateur-vide') + '">' + _esc(v) + '</td>';
                });
                h += '</tr>';
            });
        });

        // SECTION 2 — Résultat sur les profils-types (note par colonne). Le niveau
        // atteint est porté par le libellé du profil (colonnes uniformes).
        h += '<tr class="comparateur-section-tete"><th colspan="' + (nbCol + 1) + '" scope="colgroup">Résultat — profils-types</th></tr>';
        _profilsActifs().forEach(function(prof) {
            var na = _niveauAtteint(prof.da, d);
            var niveauHtml = '';
            if (na) {
                var aria = na.label + (na.description ? ', ' + na.description : '') + ', ' + na.tendance.mot;
                var titre = na.description ? _esc(na.label + ' · ' + na.description) : _esc(na.label);
                niveauHtml = ' <span class="comparateur-profil-niveau" title="' + titre + '" aria-label="' + _esc(aria) + '">'
                    + _esc(na.label) + ' <span class="comparateur-tendance" aria-hidden="true">' + na.tendance.fleche + '</span></span>';
            }
            h += '<tr class="comparateur-ligne-profil" data-profil-da="' + _esc(prof.da) + '"'
                + ' role="button" tabindex="0" aria-label="' + _esc('Ouvrir la fiche : ' + prof.label) + '">';
            h += '<th scope="row" class="comparateur-col-profil">' + _esc(prof.label) + niveauHtml + '</th>';
            cols.forEach(function(c) {
                if (_estDEN(c.id)) {
                    h += '<td class="comparateur-cellule comparateur-cellule--den" title="En dénotation, la note finale est un jugement posé par l’enseignant, gardé par l’atteinte des cibles — pas un calcul sur les données. Elle n’est donc pas simulable ici.">jugement</td>';
                    return;
                }
                var r = _note(prof.da, c.id);
                if (r === null) {
                    h += '<td class="comparateur-cellule comparateur-vide" title="Note non calculable pour cette pratique" aria-label="Note non calculable pour cette pratique">—</td>';
                    return;
                }
                if (!r.noteConstructible) {
                    // #326 (sous-item) : pas un « 0 » trompeur — le moteur n'a pas pu
                    // bâtir la note avec ces paramètres et ces résultats.
                    var titreNC = 'Note non constructible avec ces paramètres — ce n’est pas un zéro.';
                    h += '<td class="comparateur-cellule comparateur-vide comparateur-nonconstr" title="' + titreNC + '" aria-label="' + titreNC + '">— <span class="comparateur-nonconstr-mot">non constructible</span></td>';
                    return;
                }
                h += '<td class="comparateur-cellule"><span class="comparateur-note">' + r.P + '</span></td>';
            });
            h += '</tr>';
        });

        h += '</tbody></table>';
        return h;
    }

    /* ── Ouverture ────────────────────────────────────────── */
    // Conteneur de la sous-section (toggle .active géré par la navigation).
    function _conteneur() {
        return document.getElementById('labo-comparateur');
    }

    /* ════════════════════════════════════════════════════════
       ARBRE D'EXPLORATION (#326 D-2) — variantes d'essai
       ------------------------------------------------------------
       Affiche la filiation (souche → variantes d'essai) des pratiques
       configurables RÉELLES de l'utilisateur, avec les actions dériver /
       promouvoir / jeter. LECTURE pour l'affichage ; les actions délèguent
       aux fonctions d'écriture de la couche pratiques (pas de chemin
       parallèle). Noms utilisateur → TOUJOURS échappés par _esc.
       ════════════════════════════════════════════════════════ */

    var _BASE_CANEVAS = ['standards', 'specifications', 'sommative'];

    function _lirePratiquesConfigurablesReelles() {
        if (typeof db === 'undefined') return [];
        var k = (typeof cle === 'function') ? cle('pratiquesConfigurables') : 'pratiquesConfigurables';
        return (db.getSync(k, null) || []);
    }

    function _sousArbreContientMaquette(noeud) {
        if (noeud.pratique && noeud.pratique.estMaquette === true) return true;
        return (noeud.enfants || []).some(_sousArbreContientMaquette);
    }

    function _badgeFamille(p) {
        if (typeof genererBadgePratiqueHTML === 'function') {
            try { return genererBadgePratiqueHTML(p.id) || ''; } catch (e) { return ''; }
        }
        return '';
    }

    // Boutons d'un nœud. GARDE-FOU « max 1 dérivé » (R1) : seule une pratique
    // ABOUTIE (souche) est dérivable ; une maquette ne se dérive pas (profondeur
    // d'arbre = 1, évite les « doublons de doublons » #326 §1.2). La maquette offre
    // en retour comparer (D-4) / adopter / jeter.
    function _actionsNoeud(p) {
        var id = _esc(p.id);
        var estMaquette = (p.estMaquette === true);
        var b = '<div class="exploration-noeud-actions">';
        if (!estMaquette) {
            b += '<button type="button" class="btn btn-tres-compact btn-secondaire" data-expl-action="deriver" data-id="' + id + '">Dériver une maquette</button>';
        } else {
            b += '<button type="button" class="btn btn-tres-compact btn-secondaire" data-expl-action="comparer" data-id="' + id + '">Comparer</button>';
            b += '<button type="button" class="btn btn-tres-compact btn-principal" data-expl-action="adopter" data-id="' + id + '">Adopter</button>';
            b += '<button type="button" class="btn btn-tres-compact btn-supprimer" data-expl-action="jeter" data-id="' + id + '">Jeter</button>';
        }
        b += '</div>';
        return b;
    }

    function _rendreNoeud(noeud) {
        var p = noeud.pratique;
        var estMaquette = (p.estMaquette === true);
        var h = '<li class="exploration-noeud' + (estMaquette ? ' exploration-noeud--essai' : ' exploration-noeud--souche') + '">';
        h += '<div class="exploration-noeud-tete">';
        h += '<span class="exploration-noeud-nom">' + _esc(p.nom || 'Sans titre') + '</span> ';
        h += _badgeFamille(p);
        if (estMaquette) h += ' <span class="exploration-tag-essai">maquette</span>';
        // D-5 péremption douce : badge discret si la maquette dort depuis longtemps.
        // SIGNAL seulement (jamais de suppression) — SPEC §9. Date = filiation.
        if (estMaquette && typeof ExplorationPratiques !== 'undefined'
            && ExplorationPratiques.maquetteDormante && ExplorationPratiques.maquetteDormante(p)) {
            h += ' <span class="exploration-tag-dormant" title="Maquette inactive depuis plus de 30 jours — à adopter ou jeter ?">dormant</span>';
        }
        h += _actionsNoeud(p);
        h += '</div>';
        if (noeud.enfants && noeud.enfants.length) {
            h += '<ul class="exploration-arbre-liste">' + noeud.enfants.map(_rendreNoeud).join('') + '</ul>';
        }
        h += '</li>';
        return h;
    }

    // Quand aucune maquette n'existe encore : proposer de dériver depuis une pratique aboutie.
    function _listeDerivables(configurables) {
        var abouties = configurables.filter(function (p) { return p.estMaquette !== true; });
        if (abouties.length === 0) return '';
        var h = '<p class="exploration-derivables-titre">Dériver depuis une de tes pratiques :</p>';
        h += '<ul class="exploration-arbre-liste">';
        h += abouties.map(function (p) {
            return '<li class="exploration-noeud exploration-noeud--souche"><div class="exploration-noeud-tete">'
                + '<span class="exploration-noeud-nom">' + _esc(p.nom || 'Sans titre') + '</span> ' + _badgeFamille(p)
                + '<div class="exploration-noeud-actions"><button type="button" class="btn btn-tres-compact btn-secondaire" data-expl-action="deriver" data-id="' + _esc(p.id) + '">Dériver une maquette</button></div>'
                + '</div></li>';
        }).join('');
        h += '</ul>';
        return h;
    }

    function _construireArbre(host) {
        var pratiques = _lirePratiquesConfigurablesReelles();
        var configurables = pratiques.filter(function (p) { return p && p.id && _BASE_CANEVAS.indexOf(p.id) === -1; });
        var foret = (typeof construireArbrePratiques === 'function') ? construireArbrePratiques(configurables) : [];
        var arbres = foret.filter(_sousArbreContientMaquette);

        var h = '<section class="exploration-arbre carte" role="region" aria-labelledby="exploration-arbre-titre">'
            + '<h3 id="exploration-arbre-titre" class="exploration-arbre-titre" tabindex="-1">Maquettes</h3>'
            + '<p class="exploration-arbre-intro">Décline une pratique en maquettes pour comparer ce que chaque réglage change. '
            + 'Les maquettes vivent ici : elles n’apparaissent ni dans la sélection de la pratique active ni dans tes pratiques abouties tant que tu ne les as pas adoptées.</p>';

        if (arbres.length === 0) {
            h += '<p class="exploration-arbre-vide">Aucune maquette pour l’instant.</p>';
            h += _listeDerivables(configurables);
        } else {
            h += '<ul class="exploration-arbre-liste exploration-arbre-racine">' + arbres.map(_rendreNoeud).join('') + '</ul>';
        }
        h += '</section>';
        host.innerHTML = h;
        _attacherActionsArbre(host);
    }

    function _rafraichirArbre() {
        var host = document.getElementById('exploration-arbre-hote');
        if (host) _construireArbre(host);
    }

    function _attacherActionsArbre(host) {
        // FIX bug « Pratique introuvable » (#326 R1) : le listener est DÉLÉGUÉ sur le
        // host (qui survit aux `innerHTML` de `_rafraichirArbre`). Sans garde, chaque
        // rafraîchissement (après dérivation/adoption) RÉ-AJOUTAIT un listener sur le
        // même élément → un seul clic « Jeter » exécutait le handler N+1 fois ; la 1ʳᵉ
        // suppression réussissait, les suivantes levaient « Pratique introuvable : <id> »
        // (id déjà supprimé). Garde idempotente : un seul listener par host.
        if (host._explActionsAttachees) return;
        host._explActionsAttachees = true;
        host.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('[data-expl-action]') : null;
            if (!btn) return;
            var action = btn.getAttribute('data-expl-action');
            var id = btn.getAttribute('data-id');
            if (!id) return;
            if (action === 'deriver' && typeof deriverMaquette === 'function') {
                Promise.resolve(deriverMaquette(id)).then(_rafraichirArbre);
            } else if (action === 'adopter' && typeof adopterMaquette === 'function') {
                Promise.resolve(adopterMaquette(id)).then(_rafraichirArbre);
            } else if (action === 'jeter') {
                _jeterMaquette(id);
            } else if (action === 'comparer') {
                _comparerDepuisArbre(id);
            }
        });
    }

    // D-4 : « Comparer » depuis l'arbre → injecte la variante dans la 1ʳᵉ colonne de
    // simulation de la matrice (sur les profils-types démo). La matrice étant
    // démo-gated, hors démo on invite à l'activer. Lecture seule, aucune écriture.
    // ⚠️ Pont réel↔démo : la variante doit être résoluble dans le contexte courant ;
    // sinon la cellule affiche « — » (graceful). À confirmer au terrain.
    // #326 R4b : « Comparer » depuis l'arbre injecte la maquette comme COLONNE du banc
    // (profils fictifs générés + injection — plus de garde mode démo). La maquette est
    // une pratique configurable → résoluble par simulerIndices sur le corpus.
    function _comparerDepuisArbre(id) {
        _initColonnes();
        if (!_colonnesSel.length) _colonnesSel = [id];
        else if (_colonnesSel.length === 1) _colonnesSel.push(id);
        else _colonnesSel[1] = id;
        var panel = _conteneur();
        var comp = panel && panel.querySelector('#exploration-comparaison');
        if (!comp) return;
        if (comp.querySelector('#comparateur-matrice')) _rerendreMatrice(comp);
        else construireVue(comp);   // si l'invitation était affichée, bascule sur le banc
    }

    async function _jeterMaquette(id) {
        // #1007 : le codex proposé s'il n'est pas à jour, avant la question habituelle.
        if (typeof Codex !== 'undefined' && !(await Codex.proposerAvantSuppression('maquette'))) return;
        var ok = (typeof uiDialogues !== 'undefined' && uiDialogues.confirmerAction)
            ? await uiDialogues.confirmerAction({
                titre: 'Jeter la maquette',
                message: 'Supprimer définitivement cette maquette ? Cette action est irréversible.',
                texteConfirmer: 'Jeter', variante: 'danger'
            })
            : true;
        if (!ok) return;
        try {
            if (typeof PratiqueManager !== 'undefined' && PratiqueManager.supprimerPratique) {
                await PratiqueManager.supprimerPratique(id);
            }
            if (typeof notifications !== 'undefined' && notifications.succes) notifications.succes('Maquette supprimée');
        } catch (e) {
            if (typeof notifications !== 'undefined' && notifications.erreur) notifications.erreur('Erreur', e.message);
        }
        _rafraichirArbre();
    }

    // Rend (ou re-rend) le contenu de la sous-section. Appelée par la
    // navigation à chaque affichage de Labo › Comparateur, et après
    // activation de la démo. Entrée fraîche = on repart de la matrice.
    function rendreComparateur() {
        var hote = _conteneur();
        if (!hote) {
            console.error('[comparateur-pratiques] Conteneur #labo-comparateur introuvable');
            return;
        }

        _vue = 'matrice';
        _daFiche = null;
        _colonnesSel = null;    // défauts recalculés à chaque entrée
        _sourceDonnees = 'fictif';
        _corpusCache = null;    // corpus régénéré (échelle active courante)

        // #326 D-2 : l'Exploration a deux régions — l'ARBRE des variantes d'essai
        // (pratiques réelles, toujours visible) puis la COMPARAISON (matrice démo).
        hote.innerHTML = '<div id="exploration-arbre-hote"></div><div id="exploration-comparaison"></div>';
        _construireArbre(document.getElementById('exploration-arbre-hote'));
        var comp = document.getElementById('exploration-comparaison');

        // #326 R4 : la matrice s'appuie sur des PROFILS FICTIFS GÉNÉRÉS depuis
        // l'échelle (R2) + injection lecture seule — plus de garde « mode démo »
        // (retirée en R5). Repli : sans échelle, pas de profils-types → on invite à
        // en créer une.
        if (_corpusActif()) {
            construireVue(comp);
        } else {
            construireInvitationEchelle(comp);
        }

        // Accessibilité SPA : déplacer le focus vers le titre de l'Exploration.
        var titre = hote.querySelector('.exploration-arbre-titre');
        if (titre) titre.focus();
    }

    /* ── En-tête commun (titre + bouton fermer) ───────────── */
    function entete(titre) {
        return '<div class="comparateur-header">' +
                    '<div>' +
                        '<h2 class="comparateur-titre" id="comparateur-titre-texte" tabindex="-1">' + titre +
                            // Bloc 1 des textes relus (15 oct. 2026, #364 T3) : l'aide du Comparateur.
                            ' <button class="btn-aide-contextuelle" data-aide="comparateur-pratiques" aria-label="Aide : le Comparateur de pratiques" title="Aide : le Comparateur de pratiques"><span class="icone-info-aide taille-bouton" aria-hidden="true"></span></button>' +
                        '</h2>' +
                    '</div>' +
                '</div>';
    }

    /* ── État vide (#326 R4) : aucune échelle → pas de profils-types ── */
    function construireInvitationEchelle(panel) {
        panel.innerHTML =
            '<div class="comparateur-contenu carte" role="region" aria-labelledby="comparateur-titre-texte">' +
                entete('Comparateur de pratiques') +
                '<div class="comparateur-corps">' +
                    '<p>Le comparateur s’appuie sur des <strong>profils-types fictifs</strong> générés ' +
                    'depuis ton <strong>échelle de performance</strong> — pour comparer ce que chaque ' +
                    'pratique ferait de la même trajectoire d’apprentissage, avant d’en adopter une.</p>' +
                    '<p>Crée d’abord une échelle dans <strong>Conception → Échelles</strong>, puis reviens ici.</p>' +
                '</div>' +
            '</div>';
    }

    /* ── Sélecteurs des candidates simulées (C1-d) ─────────── */
    // Le <select> vit DANS l'en-tête de sa colonne de simulation (jamais de
    // modale — anti-pattern projet). Il remplace le titre statique : le bandeau
    // « Comparer avec » répétait le nom déjà porté par la colonne. Changer une
    // candidate recalcule la matrice.
    function _optionsSelect(selId, dispo) {
        return dispo.map(function(p) {
            var sel = (p.id === selId) ? ' selected' : '';
            return '<option value="' + _esc(p.id) + '"' + sel + '>'
                + _esc(p.code + ' · ' + p.nom) + '</option>';
        }).join('');
    }

    function _selectColonne(slot, selId, dispo) {
        return '<select class="comparateur-select" data-slot="' + slot + '"'
            + ' aria-label="Pratique de cette colonne">'
            + _optionsSelect(selId, dispo) + '</select>';
    }

    // En-tête d'une colonne (#326 R4b) : badge + sélecteur de pratique + lien
    // « Éditer » vers le formulaire existant (#319, editerPratique) — seulement pour
    // les pratiques configurables (les familles codées de base ne s'éditent pas ici).
    function _enteteColonne(slot, id, dispo) {
        var h = '<div class="comparateur-col-tete">' + _badge(id) + _selectColonne(slot, id, dispo) + '</div>';
        if (_enveloppe(id)) {
            h += '<button type="button" class="comparateur-editer-lien" data-editer-id="' + _esc(id) + '">Éditer la pratique</button>';
        }
        return h;
    }

    // Re-rend uniquement le tableau (les sélecteurs y vivent désormais ; l'hôte
    // #comparateur-matrice persiste, donc l'écouteur délégué survit au re-rendu).
    /* ── Diff « avant matrice » (D-4) ─────────────────────── */
    // Enveloppe stockée d'une pratique configurable (pour lire inspireDe).
    function _enveloppe(id) {
        var liste = _configsPratiques();
        for (var i = 0; i < liste.length; i++) { if (liste[i] && liste[i].id === id) return liste[i]; }
        return null;
    }
    // Config exécutable RÉSOLUE (les vraies pratiques rangent sous `.configuration`,
    // pas `.config` — cf. fix 16 juin) ; null si non configurable (famille codée).
    function _resoudreConfig(id) {
        var env = _enveloppe(id);
        if (!env) return null;
        return (typeof construireConfigComplete === 'function')
            ? construireConfigComplete(env)
            : (env.config || env.configuration || env);
    }
    // Pour chaque colonne de simulation partageant une SOUCHE avec la référence :
    // les phrases « ce que ce réglage change ». Lecture seule, pur côté moteur.
    function _diffColonnes(cols) {
        if (!cols || cols.length < 2 || typeof ExplorationPratiques === 'undefined'
            || !ExplorationPratiques.partagentSouche) return [];
        var refEnv = _enveloppe(cols[0].id);
        if (!refEnv) return [];
        var out = [];
        for (var i = 1; i < cols.length; i++) {
            var cEnv = _enveloppe(cols[i].id);
            if (!cEnv || !ExplorationPratiques.partagentSouche(refEnv, cEnv)) continue;
            var ca = _resoudreConfig(cols[0].id), cb = _resoudreConfig(cols[i].id);
            if (!ca || !cb) continue;
            var phrases = ExplorationPratiques.phrasesEffetEntreConfigs(ca, cb)
                .filter(function (e) { return e.chemin !== 'id' && e.chemin !== 'nom'; });
            if (phrases.length) out.push({ refId: cols[0].id, colId: cols[i].id, phrases: phrases });
        }
        return out;
    }
    // Le diff s'affiche AVANT la matrice (« ce qui change » d'abord, l'écart de
    // note discret ensuite — continuité E1-E3, anti palmarès de générosité).
    function _rendreDiff(cols) {
        var diffs = _diffColonnes(cols);
        if (!diffs.length) return '';
        var h = '<div class="comparateur-diff carte" role="region" aria-label="Ce que ces réglages changent">';
        h += '<h3 class="comparateur-diff-titre">Ce que ces réglages changent</h3>';
        h += '<p class="comparateur-diff-intro">Avant de regarder l’écart de notes : voici ce que chaque réglage modifie dans ce que la note mesure.</p>';
        diffs.forEach(function (d) {
            h += '<div class="comparateur-diff-paire">'
                + '<div class="comparateur-diff-paire-titre">' + _esc(_nomPratique(d.refId)) + ' → ' + _esc(_nomPratique(d.colId)) + '</div>'
                + '<ul class="comparateur-diff-liste">';
            d.phrases.forEach(function (e) { h += '<li>' + _esc(e.effet) + '</li>'; });
            h += '</ul></div>';
        });
        h += '</div>';
        return h;
    }

    function _rerendreMatrice(panel) {
        var hote = panel.querySelector('#comparateur-matrice');
        if (hote) hote.innerHTML = _rendreMatrice();
        // Le diff suit l'état des colonnes (D-4) : re-rendu au même moment.
        var diffHote = panel.querySelector('#comparateur-diff');
        if (diffHote) diffHote.innerHTML = _rendreDiff(_colonnes());
    }

    // Délégation sur l'hôte persistant #comparateur-matrice : un seul attachement
    // suffit, les <select> recréés à chaque re-rendu restent câblés (même pattern
    // que _attacherNavigationLignes). Le change d'un <select> remonte par bulle.
    function _attacherSelecteurs(panel) {
        var hote = panel.querySelector('#comparateur-matrice');
        if (!hote) return;
        hote.addEventListener('change', function(e) {
            var t = e.target;
            if (!t || !t.classList || !t.classList.contains('comparateur-select')) return;
            var slot = parseInt(t.getAttribute('data-slot'), 10);
            if (!isNaN(slot)) {
                _colonnesSel[slot] = t.value;   // état UI seulement, aucune écriture en base
                _rerendreMatrice(panel);
            }
        });
        // Lien « Éditer la pratique » (#326 R4b → formulaire #319). Délégué sur l'hôte.
        hote.addEventListener('click', function(e) {
            var b = e.target.closest ? e.target.closest('[data-editer-id]') : null;
            if (!b) return;
            e.stopPropagation();   // ne pas déclencher l'ouverture de la fiche (ligne profil)
            var id = b.getAttribute('data-editer-id');
            if (id && typeof editerPratique === 'function') editerPratique(id);
        });
    }

    /* ── Navigation matrice → fiche (C2-d.1) ───────────────── */
    // Délégation sur l'hôte #comparateur-matrice : il PERSISTE à travers les
    // re-rendus du tableau (_rerendreMatrice ne change que son innerHTML), donc
    // un seul attachement suffit (pas de fuite d'écouteurs).
    function _attacherNavigationLignes(panel) {
        var hote = panel.querySelector('#comparateur-matrice');
        if (!hote) return;
        hote.addEventListener('click', function(e) {
            var tr = e.target.closest ? e.target.closest('[data-profil-da]') : null;
            if (tr) _ouvrirFiche(panel, tr.getAttribute('data-profil-da'));
        });
        hote.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
            var tr = e.target.closest ? e.target.closest('[data-profil-da]') : null;
            if (tr) { e.preventDefault(); _ouvrirFiche(panel, tr.getAttribute('data-profil-da')); }
        });
    }

    function _ouvrirFiche(panel, da) {
        if (!da) return;
        _vue = 'fiche';
        _daFiche = da;
        construireFiche(panel, da);
        // Accessibilité SPA : focus au titre de la nouvelle vue.
        var titre = panel.querySelector('.comparateur-titre');
        if (titre) titre.focus();
    }

    function _retourMatrice(panel) {
        _vue = 'matrice';
        _daFiche = null;
        construireVue(panel);   // _candidatsSel préservé → état des sélecteurs conservé
        var titre = panel.querySelector('.comparateur-titre');
        if (titre) titre.focus();
    }

    /* ── Bloc « Maîtrise en fin de parcours » (E2bis, C2-d.2) ─ */
    // Niveau d'échelle correspondant à un code (jamais I/D/M/E en dur — pluralisme).
    function _libelleNiveau(echelle, code) {
        if (echelle && echelle.niveaux) {
            for (var i = 0; i < echelle.niveaux.length; i++) {
                if (echelle.niveaux[i].code === code) return echelle.niveaux[i];
            }
        }
        return null;
    }

    // Trajectoire des niveaux datés (libellés d'échelle) + démonstration finale.
    function _blocMaitrise(da, d) {
        var titre = '<h4 class="comparateur-fiche-titre">Maîtrise en fin de parcours</h4>';
        var evals = _evalsProfil(da, d.evaluations);
        if (!evals.length) {
            return '<section class="comparateur-fiche-bloc">' + titre
                + '<p class="comparateur-vide">Aucune évaluation datée pour ce profil.</p></section>';
        }

        var etapes = evals.map(function(e) {
            var ech = _echelle(e.echelleId, d.echelles);
            var niv = _libelleNiveau(ech, e.niveauFinal);
            var lib = niv ? niv.nom : e.niveauFinal;
            var desc = (niv && niv.description) ? niv.description : '';
            var t = desc ? _esc(lib + ' · ' + desc) : _esc(lib);
            return '<span class="comparateur-traj-etape" title="' + t + '">' + _esc(lib) + '</span>';
        }).join('<span class="comparateur-traj-fleche" aria-hidden="true">→</span>');

        var finale = '';
        var na = _niveauAtteint(da, d);
        if (na) {
            var aria = na.label + (na.description ? ', ' + na.description : '') + ', ' + na.tendance.mot;
            var t2 = na.description ? _esc(na.label + ' · ' + na.description) : _esc(na.label);
            finale = '<p class="comparateur-fiche-finale">'
                + '<span class="comparateur-fiche-finale-libelle">Démonstration finale :</span> '
                + '<span class="comparateur-fiche-finale-niveau" title="' + t2 + '" aria-label="' + _esc(aria) + '">'
                + _esc(na.label)
                + ' <span class="comparateur-tendance" aria-hidden="true">' + na.tendance.fleche + '</span>'
                + '</span></p>';
        }

        return '<section class="comparateur-fiche-bloc">' + titre
            + '<div class="comparateur-traj">' + etapes + '</div>' + finale + '</section>';
    }

    /* ── Bloc « Ce que chaque pratique retient » (récit E2, C2-d.3) ─ */
    // Échelle de référence du profil pour traduire les niveaux (codes bruts) du
    // récit en libellés. Même logique que _niveauAtteint (terminale, sinon dernière
    // éval datée). Les profils démo ont une échelle homogène ; repli = code brut.
    function _echelleProfil(da, d) {
        var evals = _evalsProfil(da, d.evaluations);
        if (!evals.length) return null;
        var terminale = null;
        for (var i = 0; i < d.productions.length; i++) {
            if (d.productions[i].type === 'terminale') { terminale = d.productions[i]; break; }
        }
        var evalFin = null;
        if (terminale) {
            var fins = evals.filter(function(e) { return e.productionId === terminale.id; });
            evalFin = fins.length ? fins[fins.length - 1] : null;
        }
        if (!evalFin) evalFin = evals[evals.length - 1];
        return _echelle(evalFin.echelleId, d.echelles);
    }

    // Une carte par pratique (référence d'abord) consommant le contrat §4 via
    // simulerIndices().recit (aiguillage unifié C2-d.0 — pas de ré-aiguillage ici).
    function _carteRecit(da, c, ech) {
        var recit = null;
        if (typeof simulerIndices === 'function') {
            var r = simulerIndices(da, c.id, _corpusInjection());
            recit = r ? r.recit : null;
        }
        var enTete = '<div class="comparateur-recit-entete">'
            + _badge(c.id) + ' <span class="comparateur-col-nom">' + _esc(_nomPratique(c.id)) + '</span>'
            + '</div>';
        var classe = 'comparateur-recit-carte';

        if (!recit || !recit.resultats || !recit.resultats.length) {
            return '<div class="' + classe + '">' + enTete
                + '<p class="comparateur-vide">Récit indisponible pour cette pratique.</p></div>';
        }

        var lignes = recit.resultats.map(function(res) {
            var niveauHtml = '';
            if (res.niveau) {
                var niv = _libelleNiveau(ech, res.niveau);
                var lib = niv ? niv.nom : res.niveau;
                var t = (niv && niv.description) ? _esc(lib + ' · ' + niv.description) : _esc(lib);
                niveauHtml = '<span class="comparateur-recit-niveau" title="' + t + '">' + _esc(lib) + '</span>';
            }
            var noteHtml = (res.note !== null && res.note !== undefined)
                ? '<span class="comparateur-recit-note">' + _esc(res.note) + '</span>' : '';
            return '<li class="comparateur-recit-ligne comparateur-recit--' + _esc(res.sort) + '">'
                + '<span class="comparateur-recit-label">' + _esc(res.label) + '</span>'
                + niveauHtml + noteHtml
                + '<span class="comparateur-recit-detail">' + _esc(res.detail) + '</span>'
                + '</li>';
        }).join('');

        var synth = recit.synthese || {};
        var noteFin = (synth.noteFinale !== null && synth.noteFinale !== undefined)
            ? Math.round(synth.noteFinale) : null;
        var synthHtml = '<div class="comparateur-recit-synthese">'
            + (synth.formuleTexte ? '<span class="comparateur-recit-formule">' + _esc(synth.formuleTexte) + '</span>' : '')
            + (noteFin !== null ? '<span class="comparateur-recit-notefinale">' + noteFin + '</span>' : '')
            + '</div>';
        var plaf = synth.plafonnement
            ? '<p class="comparateur-recit-plafond">Note plafonnée (conformité).</p>' : '';

        return '<div class="' + classe + '">' + enTete
            + '<ul class="comparateur-recit-liste">' + lignes + '</ul>'
            + synthHtml + plaf + '</div>';
    }

    function _blocRecit(da, d) {
        var titre = '<h4 class="comparateur-fiche-titre">Ce que chaque pratique retient</h4>';
        var ech = _echelleProfil(da, d);
        var cartes = _colonnes().map(function(c) { return _carteRecit(da, c, ech); }).join('');
        return '<section class="comparateur-fiche-bloc">' + titre
            + '<div class="comparateur-recit-cartes">' + cartes + '</div>'
            + '<p class="comparateur-garde">' + _esc(LIGNE_GARDE) + '</p>'
            + '</section>';
    }

    /* ── Fiche de profil (en-tête + maîtrise + récit E2) ────── */
    function construireFiche(panel, da) {
        var d = _donnees();
        var prof = null;
        var profils = _profilsActifs();
        for (var i = 0; i < profils.length; i++) {
            if (profils[i].da === da) { prof = profils[i]; break; }
        }
        var label = prof ? prof.label : da;
        // Contexte du profil (généré R2, ou vide en source réelle).
        var phrase = (prof && prof.contexte) || '';

        panel.innerHTML =
            '<div class="comparateur-contenu carte" role="region" aria-labelledby="comparateur-titre-texte">' +
                '<div class="comparateur-header">' +
                    '<div>' +
                        '<button class="comparateur-retour" type="button">‹ Retour à la comparaison</button>' +
                        '<h2 class="comparateur-titre" id="comparateur-titre-texte" tabindex="-1">' +
                            _esc(label) + ' <span class="comparateur-fiche-da">· ' + _esc(da) + '</span>' +
                        '</h2>' +
                        (phrase ? '<p class="comparateur-fiche-contexte">' + _esc(phrase) + '</p>' : '') +
                    '</div>' +
                '</div>' +
                '<div class="comparateur-corps">' +
                    _blocMaitrise(da, d) +
                    _blocRecit(da, d) +
                '</div>' +
            '</div>';

        var r = panel.querySelector('.comparateur-retour');
        if (r) r.addEventListener('click', function() { _retourMatrice(panel); });
    }

    /* ── Vue comparateur (matrice + sélecteurs) ─────────────── */
    function construireVue(panel) {
        panel.innerHTML =
            '<div class="comparateur-contenu carte" role="region" aria-labelledby="comparateur-titre-texte">' +
                entete('Comparateur de pratiques') +
                '<div class="comparateur-corps">' +
                    '<p class="comparateur-finalite">Des pratiques différentes mesurent des choses ' +
                    'différentes. Un écart entre des points n’est ni un bonus ni une erreur. Le ' +
                    'comparateur montre la <strong>maîtrise atteinte en regard de chaque note</strong>.</p>' +
                    '<div class="comparateur-note-dev" role="note">' +
                        '<strong>' + _esc(NOTE_DEV_TITRE) + '</strong> ' + _esc(NOTE_DEV_TEXTE) +
                    '</div>' +
                    _rendreSource() +
                    '<div class="comparateur-diff-hote" id="comparateur-diff">' +
                        _rendreDiff(_colonnes()) +
                    '</div>' +
                    '<div class="comparateur-matrice" id="comparateur-matrice" data-etat="matrice">' +
                        _rendreMatrice() +
                    '</div>' +
                    '<p class="comparateur-garde">' + _esc(LIGNE_GARDE) + '</p>' +
                    '<div class="comparateur-actions">' +
                        '<button type="button" class="comparateur-exporter">Exporter en CSV</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        _attacherSelecteurs(panel);
        _attacherNavigationLignes(panel);
        _attacherExport(panel);
        _attacherSource(panel);
    }

    // Sélecteur de source (#326 R4b) : profils fictifs générés (défaut) OU groupe réel.
    function _rendreSource() {
        var c = _corpusActif();
        var nomEch = (c && c.echelle && (c.echelle.nom || c.echelle.echelle_nom)) || '—';
        var optF = '<option value="fictif"' + (_sourceDonnees === 'fictif' ? ' selected' : '') + '>Profils fictifs (depuis ton échelle)</option>';
        var optR = '<option value="reel"' + (_sourceDonnees === 'reel' ? ' selected' : '') + '>Mon groupe actif (données réelles)</option>';
        var desc = (_sourceDonnees === 'reel')
            ? 'Données réelles du groupe actif — mêmes étudiant·es pour toutes les colonnes, seules les règles de la pratique changent.'
            : 'Profils fictifs générés depuis ton échelle « ' + _esc(nomEch) + ' » — mêmes parcours pour toutes les colonnes, seules les règles changent.';
        return '<div class="comparateur-source-ctrl">'
            + '<label class="comparateur-source-label">Source des données : '
            + '<select class="comparateur-source-select" aria-label="Source des données du banc">' + optF + optR + '</select></label>'
            + '<p class="comparateur-source text-muted">' + desc + '</p></div>';
    }

    function _attacherSource(panel) {
        var sel = panel.querySelector('.comparateur-source-select');
        if (!sel) return;
        sel.addEventListener('change', function(e) {
            _sourceDonnees = (e.target.value === 'reel') ? 'reel' : 'fictif';
            _corpusCache = null;            // régénéré au besoin (fictif)
            construireVue(panel);           // re-rend toute la vue (source + matrice)
            var titre = panel.querySelector('.comparateur-titre');
            if (titre) titre.focus();
        });
    }

    /* ── Export CSV (C3) — trace de la comparaison ──────────── */
    // Échappement RFC 4180 + neutralisation d'injection de formule (Excel/Sheets) :
    // une cellule qui commence par = + - @ est préfixée d'une apostrophe.
    function _csvCell(v) {
        var s = (v === null || v === undefined) ? '' : String(v);
        if (/^[=+\-@]/.test(s)) s = "'" + s;
        if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
        return s;
    }

    // Génère le CSV de la comparaison : une ligne par profil-type, une colonne de
    // note par pratique comparée (réf d'abord). Lecture seule. BOM UTF-8 pour Excel.
    function _genererCSV() {
        var d = _donnees();
        var cols = _colonnes();
        var entetes = ['Profil', 'DA', 'Niveau atteint', 'Tendance'];
        cols.forEach(function(c) {
            entetes.push(_nomPratique(c.id) + ' (' + (_codePratique(c.id) || '') + ')');
        });
        var lignes = [entetes.map(_csvCell).join(',')];
        _profilsActifs().forEach(function(prof) {
            var na = _niveauAtteint(prof.da, d);
            var row = [prof.label, prof.daAffichage || prof.da, na ? na.label : '', na ? na.tendance.mot : ''];
            cols.forEach(function(c) {
                var r = _note(prof.da, c.id);
                // #326 (sous-item) : « non constructible » explicite dans le CSV,
                // distinct d'une cellule vide (pratique introuvable) et d'un vrai 0.
                row.push(r === null ? '' : (r.noteConstructible ? r.P : 'non constructible'));
            });
            lignes.push(row.map(_csvCell).join(','));
        });
        var BOM = String.fromCharCode(0xFEFF);   // BOM UTF-8 explicite (ouverture Excel/accents)
        return BOM + lignes.join('\r\n') + '\r\n';
    }

    function exporterCSV() {
        var csv = _genererCSV();
        var nom = (typeof genererNomFichierExport === 'function')
            ? genererNomFichierExport('comparateur-pratiques', { extension: '.csv', precisionDate: 'minute' })
            : 'comparateur-pratiques.csv';
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', nom);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        if (typeof notifications !== 'undefined' && notifications.succes) {
            notifications.succes('Export réussi', 'Comparaison exportée en CSV');
        }
    }

    function _attacherExport(panel) {
        var b = panel.querySelector('.comparateur-exporter');
        if (b) b.addEventListener('click', exporterCSV);
    }

    /* ── API publique ─────────────────────────────────────── */
    // Appelée par le dispatcher INITIALISATEURS_SOUS_SECTION de navigation.js
    // ('labo-comparateur') à chaque affichage de la sous-section.
    window.initialiserComparateurPratiques = rendreComparateur;
    // Exposée pour les tests de régression (contenu CSV déterministe).
    window._comparateurGenererCSV = _genererCSV;
    // Idem pour le groupement des lignes de construction sous les six paramètres
    // (9 sept. 2026) : c'est une fonction PURE — elle ne lit que les extraits
    // qu'on lui passe — et la seule du fichier qui décide de l'ossature du
    // tableau. La sentinelle du banc est statique par conception (rendu DOM non
    // exerçable en sandbox) ; cet export lui donne un point de mesure réel.
    window._comparateurGroupesConstruction = _groupesConstruction;

})();
