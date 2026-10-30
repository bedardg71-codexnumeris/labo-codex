/* ===============================
   MODULE ATELIER-ALGO — La présentation du critère algorithmique
   Date : 24 octobre 2026 (#1150, lot 4 ; consigne
   `plans de travail/CONSIGNE-LOT-2026-10-24-critere-algorithmique-presentation.md`, maquette validée
   `plans de travail/MAQUETTE-2026-10-24-critere-algorithmique.html`)

   Vocation
     Sous les champs d'en-tête d'un critère « Algorithmique », un atelier en trois colonnes : la palette
     des blocs (étape 2b, rendue par grilles.js), les ÉTAPES du critère, et la simulation de ce que
     l'étudiant·e lirait. En tête, la chaîne des cinq étapes (`ChaineEtapes`). Une seule étape ouverte.
     ↻ LOT 3a DE LA TABLE DE CAS (26 oct. 2026, consigne
     `plans de travail/CONSIGNE-LOT-2026-10-26-critere-algorithmique-table-de-cas-3a.md`, ébauche validée
     `plans de travail/EBAUCHE-2026-10-26-table-de-cas.html`) : Ce que tu relèves et comptes → Codes utilisés →
     Note calculée → Cas d'interprétation → Ce que l'étudiant·e lit. L'étape des paliers (son id reste
     `paliers`) porte la table des paliers et « Ce que l'application choisit sans toi » ; la simulation lit
     aussi le bilan (« principalement », le défi, tout maîtrisé) et le signalement, chaque condition au
     conditionnel ; « Égalité » et « Voir ce que l'étudiant·e lirait à ce palier » règlent la copie fictive.

   LA PRÉSENTATION CHANGE, RIEN DE CE QUI EST CALCULÉ NI ENREGISTRÉ
     Le contenu des étapes est celui des blocs de grilles.js, déplacé. La copie fictive se calcule par
     `miroirAlgo.essayer` (le calcul de l'évaluation) ; les phrases sont celles qu'il rend, découpées
     par leur source pour « Montrer d'où vient chaque phrase » — le découpage se vérifie : leur
     assemblage redonne la phrase entière, sinon la phrase reste d'un seul morceau.

   CE QUI VIT EN MÉMOIRE, JAMAIS DANS LA GRILLE
     L'étape ouverte, la copie fictive réglée (par critère : `etats`), la bascule des sources et le
     tiroir réduit (pour la page). Le gabarit se redessine à chaque modification enregistrée : il relit
     ces états, la section ouverte et la copie réglée ne sautent pas. Rien ne voyage à l'export.

   Sécurité : tout ce qui vient de la grille est échappé dans le rendu en chaîne (`esc`) ou posé par
   `textContent` (règle 1) ; les écouteurs sont délégués, aucun gestionnaire en ligne (règle 2).
   Dépendances (lues à l'appel, sur `window` ou par `require`) : enoncesAlgo, formulesAlgo,
   projectionAlgo, miroirAlgo, codesAnnotation, paletteAlgo ; dans la page : ChaineEtapes,
   composeurBadges, et `deciblerPaletteAlgo` (grilles.js).
   =============================== */

(function() {
'use strict';

function _reg(nom, fichier) {
    if (typeof window !== 'undefined' && window[nom]) return window[nom];
    if (typeof require === 'function') {
        try { return require(fichier); } catch (err) { return null; }
    }
    return null;
}
function _E() { return _reg('enoncesAlgo', './evaluation-enonces.js'); }
function _F() { return _reg('formulesAlgo', './evaluation-formules.js'); }
function _P() { return _reg('projectionAlgo', './evaluation-projection.js'); }
function _M() { return _reg('miroirAlgo', './miroir-algo.js'); }
function _C() { return _reg('codesAnnotation', './codes-annotation.js'); }
function _Pal() { return _reg('paletteAlgo', './palette-algo.js'); }
function _T() { return _reg('tablesCasAlgo', './tables-cas-algo.js'); }

/* Les mots de l'atelier : ceux de la maquette validée (24 oct.), sauf ceux que la maquette n'avait pas
   à dire (un critère d'avant sans noms, les codes qui vont au premier critère algorithmique).
   ↻ Lot 3a de la table de cas (26 oct. 2026) : ceux de l'ÉBAUCHE validée par Grégoire le 26 oct. (12 h 56 ;
   paliers à 13 h 23, `plans de travail/EBAUCHE-2026-10-26-table-de-cas.html`), au caractère près. Le temps
   des verbes (Grégoire, 26 oct.) : le présent pour ce que le critère fait, le conditionnel pour ce que la
   simulation montre, jamais le futur. « étudiant·e » remplace « élève » dans tout l'atelier. `grilles.js`
   lit `TEXTES.cas` et `TEXTES.choix` pour la table des paliers. */
var TEXTES = {
    chaine: 'Les étapes du critère algorithmique',
    sansValeur: 'sans valeur',   // étape 4c : un calcul pour les phrases sans valeur sur la copie fictive
    calculsPhrases: function(n) { return ' · ' + n + ' ' + (n >= 2 ? 'calculs' : 'calcul') + ' pour tes phrases'; },
    etapes: {
        compte: 'Ce que tu relèves et comptes',
        codes: 'Codes utilisés',
        note: 'Note calculée',
        paliers: 'Cas d’interprétation',
        eleve: 'Ce que l’étudiant·e lit'
    },
    buts: {
        compte: 'Ce que tu relèves sur la copie, et ce à quoi tu rapportes ce compte (des mots, des calculs, des mesures…). Ces noms s’écrivent dans les phrases destinées à l’étudiant·e.',
        codes: 'Tes codes sont les sous-critères de ce critère : tu les configures ici (numéro, nom, pondération, observation). Dans Annoter, la palette les affiche pour que tu les poses sur la copie, sans les modifier. Chaque code posé compte selon sa pondération.',
        note: 'Comment ce que tu identifies et comptes construit la note, en fonction de la pondération du critère. Chaque code posé compte pour la pondération de son sous-critère : c’est le compte pondéré.',   // étape 4a (ébauche)
        paliers: [
            'Les paliers situent la copie par rapport à la limite que tu fixes, d’après le compte que l’application fait pour toi.',
            'Selon la valeur établie sur sa copie, l’étudiant·e reçoit un commentaire précis qui s’adresse à son cas. Ci-dessous, chaque table choisit un seul cas pour l’étudiant·e. La simulation te montre de quel cas il s’agirait.'
        ],
        eleve: 'Les phrases que l’application écrit à ta place sur chaque copie. Ce que dit chaque cas s’écrit dans l’étape « Cas d’interprétation ».'
    },
    resumes: {
        avecLimite: 'Paliers selon la limite fixée',
        incomplete: 'Paliers selon la limite fixée : écris sa longueur et sa tolérance',
        sansLimite: 'Aucune limite, aucun palier'
    },
    // Les aides des zones de l'étape « Ce que l'étudiant·e lit » et de « Aucune annotation » (ébauche).
    aides: {
        decompte: 'Sous le critère, et repris dans le PDF de l’étudiant·e. Toujours.',
        priorite: 'En tête de son bilan, quand la note de ce critère tombe à 0 alors que la copie porte au moins un code.',
        concentre: 'Dans son bilan, quand tous les critères de la grille sont acquis et que la copie porte au moins un code. L’application écrit après lui le compte entre parenthèses, puis le point.',
        aucune: 'S’affiche pour toi seul·e, quand la copie ne porte ni tampon ni code.'
    },
    modele: 'Revenir au modèle',
    modelePhrases: 'Modèle des phrases',
    // La table des paliers (`grilles.js`, `rendreBlocProjectionAlgo`).
    cas: {
        titre: 'Paliers',
        selon: 'Selon',
        repere: 'La part de la limite atteinte par la copie',
        reprendre: 'Reprendre une de tes collections…',
        reprendreLecteur: 'Reprendre une collection',
        retirer: 'Retirer la limite',
        fixer: 'Fixer une limite',
        sansLimite: 'Aucune limite fixée : l’étudiant·e ne lit aucun palier. C’est l’état d’un critère neuf. Une limite fait paraître les paliers, du « rien de compté » à « au-delà du dernier seuil ».',
        intro: function(n) {
            return 'L’étudiant·e lit le cas de sa copie sous le critère, après le décompte. Un verdict sans bloc est précédé de la moyenne, sauf au premier cas : « Tu fais en moyenne 1 '
                + n.erreurs.singulier + ' à chaque N ' + n.mots.pluriel + '. » Un bloc sans valeur disparaît.';
        },
        longueur: function(n) { return 'Longueur de référence (' + n.mots.pluriel + ')'; },
        tolerance: function(n) { return 'Tolérance sur cette longueur (' + n.erreurs.pluriel + ')'; },
        service: 'Nom du service d’aide',
        signalement: 'Ce que le signalement t’affiche',
        signalementAide: 'À côté du palier RàI de l’étudiant·e, jamais sur sa copie.',
        lien: 'Lien d’inscription au service (facultatif)',
        exemples: { longueur: 'ex. : 12', tolerance: 'ex. : 4', service: 'Aucun', signalement: 'Vide : aucun signalement', lien: 'Aucun' },
        limite: function(seuil) { return 'Limite : ' + seuil + '.'; },
        incomplete: 'Écris la longueur de référence et la tolérance : les paliers s’appliquent dès que les deux dépassent 0.',
        independance: 'La limite est indépendante de la formule de la note : la note suit la formule, le palier situe la copie par rapport à la limite.',
        colonnes: ['Quand', 'Nom court', 'L’étudiant·e lit'],
        rienCompte: 'Rien de compté',
        auDela: 'Au-delà du dernier seuil',
        plusDe: function(t, l) { return 'plus de ' + t + ' pour ' + l; },
        jusqua: 'Jusqu’à',
        pctLimite: '% de la limite',
        soit: function(e1, k, m) { return 'soit au plus 1 ' + e1 + ' à chaque ' + k + ' ' + m; },
        seuilLecteur: 'Seuil du palier, en pourcentage de la limite',
        seuilRefuse: 'Le seuil est un pourcentage de la limite, au-dessus de 0.',
        nomCourt: 'Nom court',
        nomCourtLecteur: 'Nom court du palier',
        verdict: 'Verdict',
        recommandation: 'Recommandation',
        public: 'L’étudiant·e le lit',
        ajouterReco: '+ Ajouter une recommandation',
        aideReco: {
            apposition: 'Sans nom de service, la phrase s’arrête avant le deux-points.',
            service: 'Jointe seulement si un service d’aide est nommé.',
            toujours: 'Toujours jointe à ce palier.'
        },
        signal: 'Ce palier lève un signalement',
        signalPrecision: '(pour toi, à côté du palier RàI de l’étudiant·e ; rien n’est écrit sur sa copie)',
        signalNiveau: 'Niveau RàI que ce palier fixe',
        signalNiveauAucun: 'Aucun : le signalement reste à côté',
        signalNiveau2: 'Niveau 2 – Préventif',
        signalNiveau3: 'Niveau 3 – Intensif',
        signalNiveauAide: 'Jusqu’à ce que la note du cours s’affiche. Ensuite, la note et la trajectoire décident, et le signalement reste affiché.',
        ici: 'cas de la copie fictive',
        voir: 'Voir ce que l’étudiant·e lirait à ce palier',
        retirerPalier: 'Retirer ce palier',
        ajouterPalier: '+ Ajouter un palier',
        collections: 'Mes collections',
        supprimerCollection: 'Supprimer la collection',
        collectionsAide: 'Reprendre une collection copie ses paliers et sa limite dans ce critère. La corriger ou la supprimer ensuite ne change pas cette grille, ni ce qu’un·e étudiant·e a déjà reçu.',
        collectionCopiee: function(nom) { return 'Collection « ' + nom + ' » copiée dans ce critère. La corriger ensuite ne change pas ce critère.'; },
        collectionEnregistree: 'Tu la reprends par « Reprendre une de tes collections… », dans l’en-tête des paliers de tes grilles.'
    },
    // « Ce que l'application choisit sans toi » (l'encadré sous la table).
    choix: {
        titre: 'Ce que l’application choisit sans toi',
        intro: 'Leurs conditions sont celles de l’application ; leurs textes se modifient là où le lien te mène.',
        modifier: 'Modifier son texte',
        frequent: 'Le code le plus fréquent',
        frequentTexte: function(neuf) {
            return 'Quand la copie porte au moins un code, l’étudiant·e lit le nom du plus fréquent dans son bilan, à la ligne « principalement ». À égalité : '
                + (neuf ? 'le premier de ta liste des codes (ta règle du 25 octobre, pour un critère neuf).' : 'le premier posé, comme aujourd’hui (critère existant).')
                // Lot 3b : la phrase retirée au lot 3a revient avec le geste qu'elle désigne.
                + ' Pour lui écrire un texte par code, ajoute une table selon « Le code le plus fréquent ».';
        },
        priorite: 'Défi prioritaire',
        prioriteTexte: 'Quand la note de ce critère tombe à 0 alors que la copie porte au moins un code : en tête de son bilan.',
        concentre: 'Quand tout est maîtrisé',
        concentreTexte: 'Quand tous les critères de la grille sont acquis et que la copie porte au moins un code : dans son bilan.',
        aucune: 'Aucune annotation',
        aucuneTexte: 'Quand la copie ne porte ni tampon ni code : toi seul·e le lis.'
    },
    apercu: {
        titre: 'Simulation de ce que l’étudiant·e lirait',
        but: 'En fonction de ce que tu as établi dans les tables, observe si le cas d’interprétation te convient.',
        reduire: 'Réduire',
        toutVoir: 'Tout voir',
        copie: 'Copie fictive',
        references: 'Copies de référence',
        moins: 'Une de moins',
        plus: 'Une de plus',
        compte: 'Nombre compté',
        longueur: 'Longueur',
        pour: 'pour',
        curseur: 'Glisser pour changer le compte',
        note: 'Note',
        aucuneNote: 'aucune',
        palier: 'Palier',
        pdf: 'Sous le critère, dans son PDF',
        bilan: 'Dans son bilan',
        siCode: 'Si la copie portait au moins un code, dans « Points récurrents » :',
        siEffondre: 'Si la note de ce critère tombait à 0, en tête :',
        siAcquis: 'Si tous ses critères étaient acquis :',
        toi: 'Pour toi seul·e',
        siAucunCode: 'Si la copie ne portait aucun code :',
        siSignalement: 'Si son palier levait un signalement, à côté du palier RàI :',
        etats: { oui: 's’afficherait', non: 'ne s’afficherait pas', depend: 'dépendrait des autres critères' },
        tousMaitrises: 'Tous les critères sont maîtrisés.',
        sources: 'Montrer d’où vient chaque phrase',
        astuce: 'Clique une phrase : la zone qui l’écrit s’ouvre.',
        aucunePhrase: 'Aucune phrase.',
        rien: 'Rien ne s’afficherait.',
        sansSignalement: 'Rien : aucun texte de signalement n’est écrit dans la limite.',
        engendre: function(bloc) { return 'Ajoutée par l’application. Elle disparaît dès que le verdict porte un bloc : « ' + bloc + ' » remet ce nombre où tu veux.'; },
        codesPoses: 'Codes posés : ',
        plusFrequent: 'Le plus fréquent : ',
        code: function(numero, nom) { return 'code ' + numero + ', ' + nom; },
        egalite: function(autres, liste) { return ' (à égalité avec ' + autres + ' : ' + (liste ? 'le premier de ta liste' : 'le premier posé') + ')'; },
        regle: function(nom, occ, eten) { return 'Copie réglée sur le palier « ' + nom + ' » : ' + occ + ' pour ' + eten + '.'; },
        regleImpossible: 'Aucune copie n’atteindrait ce palier avec cette limite.',
        regleSansLimite: 'Écris d’abord la longueur de référence et la tolérance.',
        regleEgalite: function(a, b) { return 'Copie réglée : les codes ' + a + ' et ' + b + ', deux fois chacun, le ' + a + ' posé le premier.'; },
        // Lot 3b : « Voir ce que l'étudiant·e lirait dans ce cas » (l'ébauche, `regleSurCas`).
        regleCas: function(occ, eten) { return 'Copie réglée : ' + occ + (eten ? ' pour ' + eten : '') + '.'; },
        regleCode: function(code) { return 'Copie réglée : trois fois le code ' + code + '.'; },
        regleAucunCode: 'Copie réglée : aucun code.',
        regleCasImpossible: 'Aucune copie fictive n’atteindrait ce cas.'
    },
    // Lot 3b (26 oct. 2026) — les tables de l'enseignant·e (`grilles.js`, `rendreTablesCasAlgo`) : les mots de
    // l'ébauche (`tableEnseignant`), au caractère près. Ceux des valeurs et des cas : `tablesCasAlgo.TEXTES`.
    tables: {
        titre: 'Table de cas',
        selon: 'Selon',
        aucuneLimite: ' (aucune limite)',
        retirer: 'Retirer cette table',
        intro: 'L’étudiant·e lit le cas de sa copie sous le critère, après les paliers. Une table neuve naît vide : un cas laissé vide n’ajoute rien à ce que lit l’étudiant·e.',
        colonnes: ['Quand', 'L’étudiant·e lit'],
        jusqua: 'Jusqu’à',
        borneLecteur: 'Borne du cas',
        borneRefusee: 'La borne est un nombre, 0 ou plus.',
        retirerCas: 'Retirer ce cas',
        ajouterCas: '+ Ajouter un cas',
        sansValeur: 'Sans valeur',
        code: function(n) { return 'Code ' + n; },
        aucunCode: 'Aucun code',
        texteCas: 'Texte de ce cas',
        public: 'L’étudiant·e le lit',
        vide: 'Vide : ce cas n’ajoute rien.',
        ici: 'cas de la copie fictive',
        voir: 'Voir ce que l’étudiant·e lirait dans ce cas',
        egaliteNeuf: 'À égalité, le premier de ta liste des codes.',
        egaliteExistant: 'À égalité, le premier posé, comme aujourd’hui pour ce critère.',
        ajouterTable: '+ Ajouter une table de cas',
        // La règle du 20 sept. : aucun effacement sans le voir. Dans la carte, jamais `confirm()`.
        confirmerRetrait: 'Retirer cette table et ses textes ?',
        retirerConfirme: 'Retirer',
        confirmerSelon: function(valeur) { return 'Passer à « ' + valeur + ' » remplace les cas de cette table et efface leurs textes ?'; },
        changerConfirme: 'Changer',
        annuler: 'Annuler',
        // Le résumé de l'étape (« une table selon le compte des unités manquantes »).
        resume: function(libelleSelon) { return 'une table selon ' + libelleSelon.toLowerCase(); }
    },
    copies: { aucune: 'Aucune', quelques: 'Quelques', beaucoup: 'Beaucoup', ponderee: 'Pondérée', egalite: 'Égalité' },
    sources: {
        decompte: 'Décompte',
        prefixe: 'Ajoutée par l’application',
        verdict: function(libelle) { return libelle ? 'Verdict · ' + libelle : 'Verdict'; },
        aide: 'Recommandation',
        recurrent: 'Le code le plus fréquent',
        priorite: 'Défi prioritaire',
        concentre: 'Quand tout est maîtrisé',
        aucune: 'Aucune annotation',
        signalement: 'Signalement',
        table: function(libelle) { return 'Table · ' + libelle; }   // lot 3b
    }
};

/** L'ordre des étapes : celui de la chaîne. */
var ORDRE = ['compte', 'codes', 'note', 'paliers', 'eleve'];

function _pluriel(n, singulier, pluriel) { return n + ' ' + (n > 1 ? pluriel : singulier); }
function _fmt(n) {
    if (typeof window !== 'undefined' && typeof window.formaterNombre === 'function') return window.formaterNombre(n);
    return String(n);
}

/* ---------------------------------------------------------------------
   Fonctions pures — éprouvées en Vitest
   --------------------------------------------------------------------- */

/* Une fonction par étape : son état (réglée), son info (sous le nœud de la chaîne), son résumé (l'en-tête fermé). */

/** Ce que tu comptes — la règle de l'invitation des noms (`nomsManquants`) : un critère d'avant, qui lit
 *  « erreur » et « mot », est réglé ; un critère neuf l'est quand ses quatre formes sont écrites. */
function _etapeCompte(c) {
    var n = _E().noms(c);
    var manquent = _E().nomsManquants(c).length > 0;
    return { id: 'compte', reglee: !manquent,
        info: manquent ? 'à nommer' : n.erreurs.pluriel + ' / ' + n.mots.pluriel,
        resume: manquent ? 'Nomme ce que tu comptes et ce à quoi tu le rapportes'
            : '« ' + n.erreurs.pluriel + ' » par rapport aux « ' + n.mots.pluriel + ' »' };
}

/** Codes — non activés (la palette générale d'Annoter), ou au moins un code posable ; les codes ne vont
 *  qu'au premier critère algorithmique de la grille (#1132) : le suivant tape son nombre. */
function _etapeCodes(c, criteres) {
    var E = _E(), C = _C();
    var algos = E.criteresAlgorithmiques ? E.criteresAlgorithmiques({ criteres: criteres || [c] }) : [c];
    if (algos.length > 1 && algos[0] !== c) {
        return { id: 'codes', reglee: true, info: 'nombre tapé',
            resume: 'Les codes vont au premier critère algorithmique : ici, le nombre se tape' };
    }
    var actif = C ? C.donneSesCodes(c) : c.codesDepuisSousCriteres === true;
    if (!actif) return { id: 'codes', reglee: true, info: 'palette générale', resume: 'La palette générale d\'Annoter' };
    var nb = C.apercuCodes(c).length;
    return { id: 'codes', reglee: nb > 0, info: _pluriel(nb, 'code', 'codes'),
        resume: nb === 0 ? 'Aucun sous-critère ne sert encore de code'
            : (nb > 1 ? nb + ' sous-critères servent de codes' : '1 sous-critère sert de code') };
}

/** Note — une pondération et chaque paramètre de la formule au-dessus de 0. ⚠ Mesuré (25 oct.) : on lit ce que
 *  le calcul applique (`normaliser`). Deux formules sur trois bornent leur paramètre à 1 (pénalité normalisée,
 *  ratio visé : un 0 devient 1) ; la pénalité fixe admet 0 point par erreur (`min: 0`), que l'étape signale
 *  « à régler » — la pleine note à toute copie, rien n'est refusé ni écrit. La pondération, elle, peut manquer. */
function _etapeNote(c) {
    var f = _F().normaliser(c);
    var pond = Number(c.ponderation);
    var pondOk = isFinite(pond) && pond > 0;
    var paramsOk = (f.modele.parametres || []).every(function(p) { var v = Number(f.params[p.cle]); return isFinite(v) && v > 0; });
    // Étape 4a (ébauche) : l'info, le nom court du calcul (« pénalité fixe ») ; le résumé, son nom (« Pénalité fixe, sur 20 »).
    // Étape 4b : un calcul composé, son nom entre guillemets (« « Mon taux », sur 20 ») ; introuvable, l'étape est à régler.
    var nom = f.modele.compose ? f.modele.court : f.modele.nom;
    // Étape 4c (`resumeEtape` de l'ébauche) : « · 2 calculs pour tes phrases » quand il y en a.
    var np = _F().calculsPourLesPhrases(c).length;
    return { id: 'note', reglee: pondOk && paramsOk && !f.introuvable, info: f.modele.court,
        resume: nom + (pondOk ? ', sur ' + _fmt(pond) : ', sans pondération') + (np ? TEXTES.calculsPhrases(np) : '') };
}

/** Cas d'interprétation (lot 3a) — sans limite, réglée ; une limite fixée l'est quand sa longueur et sa
 *  tolérance dépassent 0 (un critère neuf part de champs vides). L'info compte les tables : les paliers en
 *  sont une, quand la limite est fixée. ↻ Lot 3b : les tables de l'enseignant·e s'y ajoutent, et le résumé
 *  les nomme (« une table selon le compte des unités manquantes »). */
function _etapePaliers(c) {
    var P = _P(), R = TEXTES.resumes, T = _T();
    var tables = T ? T.lire(c) : [];
    var fixee = P.limiteFixee(c);
    var complete = fixee && P.limiteComplete(c);
    var k = (fixee ? 1 : 0) + tables.length;
    var resume = [!fixee ? R.sansLimite : (complete ? R.avecLimite : R.incomplete)]
        .concat(tables.map(function(t) { return TEXTES.tables.resume(T.libelleSelon(t.selon, c)); })).join(' · ');
    return { id: 'paliers', reglee: !fixee || complete, info: (fixee && !complete) ? 'à régler' : _pluriel(k, 'table', 'tables'), resume: resume };
}

/** Ce que l'élève lit (le point d'arrivée) — au moins un des trois textes non vide. */
function _etapeEleve(c) {
    var en = _E().normaliser(c).enonces;
    var n = ['decompte', 'priorite', 'concentre'].filter(function(k) { return String(en[k] || '').trim(); }).length;
    return { id: 'eleve', arrivee: true, reglee: n > 0, info: _pluriel(n, 'texte', 'textes'),
        resume: 'Décompte et bilan : ' + _pluriel(n, 'texte', 'textes') };
}

/**
 * Les cinq étapes d'un critère, avec leur état. `criteres` : la liste de la grille (les codes ne vont
 * qu'au premier critère algorithmique, #1132).
 * @returns {Array<{id, libelle, info, resume, reglee, arrivee}>}
 */
function etapes(critere, criteres) {
    var c = critere || {};
    return [_etapeCompte(c), _etapeCodes(c, criteres), _etapeNote(c), _etapePaliers(c), _etapeEleve(c)].map(function(e) {
        e.libelle = TEXTES.etapes[e.id];
        e.arrivee = !!e.arrivee;
        return e;
    });
}

/** L'étape qui porte une zone d'écriture (son `dataset`) : un palier, « Aucune annotation », ou un énoncé. */
function etapeDeZone(zone) {
    var d = zone || {};
    if (d.palierIndex !== undefined || d.tableCas !== undefined) return 'paliers';
    if (d.enonceCle === 'aucune') return 'codes';
    if (d.enonceCle !== undefined) return 'eleve';
    return null;
}

/** Les étapes dont une zone accepte un bloc (le crayon de la chaîne), dans l'ordre de la chaîne. */
function etapesDuJeton(critere, jeton) {
    var E = _E(), Pal = _Pal();
    if (!Pal) return [];
    var zones = E.listerCles().map(function(c) { return { enonceCle: c.cle }; });
    if (Pal.aDesPaliers(critere)) zones.push({ palierIndex: '0', champ: 'texte' });
    if (_T() && _T().aDesTables(critere)) zones.push({ tableCas: '', cas: '' });   // lot 3b
    var ids = {};
    zones.forEach(function(z) {
        if (Pal.reperesDeZone(critere, z).some(function(r) { return r.jeton === jeton; })) ids[etapeDeZone(z)] = true;
    });
    return ORDRE.filter(function(id) { return ids[id]; });
}

/** Les copies de référence du miroir, nommées : « Aucune », « Quelques », « Beaucoup » (et « Pondérée »). */
function copiesDeReference(critere) {
    return _M().copies(critere).map(function(c) {
        return Object.assign({}, c, { libelle: TEXTES.copies[c.cle] || c.cle });
    });
}

/** La copie fictive de départ : « Quelques » du miroir ; sans pondération, aucune erreur sur l'étendue. */
function copieDeDepart(critere) {
    var refs = _M().copies(critere);
    var choisie = refs.filter(function(c) { return c.cle === 'quelques'; })[0]
        || refs.filter(function(c) { return c.cle === 'beaucoup'; })[0] || refs[0];
    if (choisie) return Object.assign({}, choisie, { codes: (choisie.codes || []).slice() });
    return { cle: null, erreurs: 0, erreursFormule: 0, mots: _M().etendue(critere), codes: [] };
}

/**
 * La copie réglée à la main : un nouveau compte la rend ordinaire (le compte EST ce que la formule
 * reçoit, sans codes) ; une nouvelle longueur garde le reste. Rien sous 0.
 */
function copieAvec(copie, changement) {
    var c = Object.assign({ erreurs: 0, erreursFormule: 0, mots: null, codes: [] }, copie || {});
    var x = changement || {};
    if (x.erreurs !== undefined) {
        var e = Math.max(0, Math.round(Number(x.erreurs) || 0));
        c = Object.assign({}, c, { cle: null, erreurs: e, erreursFormule: e, codes: [] });
        delete c.poses;   // l'ordre des codes posés ne tient plus : le compte est tapé
    }
    if (x.mots !== undefined) {
        var brut = x.mots;
        var m = (brut === '' || brut === null || !isFinite(Number(brut))) ? null : Math.max(0, Number(brut));
        c = Object.assign({}, c, { mots: m });
    }
    return c;
}

/**
 * Le code le plus fréquent d'une copie fictive (lot 3a) — seulement si elle dit l'ORDRE de ses codes
 * (`poses` : « Égalité », « Pondérée »). La règle de l'évaluation (`codesAnnotation.lePlusFrequent`) : à
 * égalité, le premier de la liste pour un critère neuf, le premier posé pour un critère existant.
 * @returns {{code, egaux: Array, liste: boolean}|null} des entrées de `apercuCodes`
 */
function dominantDeLaCopie(critere, copie) {
    var C = _C(), P = _P();
    var poses = (copie && Array.isArray(copie.poses)) ? copie.poses : [];
    if (!C || !poses.length) return null;
    var codes = C.apercuCodes(critere);
    var liste = P.estNeuf(critere) ? codes.map(function(c) { return c.id; }) : null;
    var r = C.lePlusFrequent(poses, liste);
    if (!r) return null;
    var entree = function(id) { return codes.filter(function(c) { return c.id === id; })[0] || { id: id, code: id, nom: id }; };
    return { code: entree(r.code), egaux: r.egaux.filter(function(id) { return id !== r.code; }).map(entree), liste: !!liste };
}

/**
 * Ce que l'étudiant·e lirait pour une copie, rangé par destination. Les phrases sortent de
 * `miroirAlgo.essayer` et de `enoncesAlgo.enonce` (comme l'évaluation : `{}` pour le bilan) ; les phrases
 * du bilan ont la forme que l'évaluation leur donne (`_rendreAlgoA0Bilan`, `_rendreTousMaitrisesBilan`,
 * `construireFrancaisResume`). `etats` : ce que chaque condition dirait sur cette copie.
 * @returns {{essai, palier, pdf, priorite, concentre, aucune, recurrent, dominant, signalement, etats}}
 */
function lecture(critere, copie) {
    var E = _E(), P = _P();
    var essai = _M().essayer(critere, copie);
    var pdf = [];
    if (essai.decompte) pdf.push({ source: 'decompte', etape: 'eleve', zone: { enonceCle: 'decompte' }, texte: essai.decompte });

    var proj = P.calculer(critere, { erreurs: copie.erreurs, mots: copie.mots || 0, calculs: _M().jetonsDesCalculs(critere, copie) });   // étape 4c
    var palier = (proj.applicable && proj.palier) ? (proj.palier.libelle || proj.palier.cle || '') : '';
    if (essai.projection) {
        var morceaux = _morceauxDeLaProjection(proj, essai.projection);
        morceaux.forEach(function(m) { pdf.push(m); });
    }
    // Lot 3b : le texte du cas atteint de chaque table, après la projection, avec sa source (« Table · jusqu’à 2 »).
    var tables = essai.tables || { morceaux: [], atteints: {} };
    tables.morceaux.forEach(function(m) {
        pdf.push({ source: 'table', etape: 'paliers', zone: { tableCas: m.tableId, cas: m.cle }, libelle: m.libelle, texte: m.texte });
    });
    return Object.assign({
        essai: essai,
        palier: palier,
        indicePalier: (proj.applicable && proj.palier) ? (proj.paliers || []).indexOf(proj.palier) : -1,
        casAtteints: tables.atteints,
        pdf: pdf
    }, _lectureDuBilan(critere, copie, essai, proj));
}

/** Le bilan et « Pour toi seul·e » d'une copie (voir `lecture`). */
function _lectureDuBilan(critere, copie, essai, proj) {
    var E = _E();
    var n = Number(copie.erreurs) || 0, m = copie.mots || 0;
    var N = E.noms(critere);
    var dominant = dominantDeLaCopie(critere, copie);
    var nom = E.libelleCritere(critere);
    var principal = dominant ? ' (principalement : ' + dominant.code.nom + ')' : '';
    var signal = !!(proj.applicable && proj.palier && proj.palier.leveSignalement === true);
    var libelleSignal = (proj.params && typeof proj.params.libelleSignalement === 'string') ? proj.params.libelleSignalement.trim() : '';
    var etat = function(oui) { return oui ? 'oui' : 'non'; };
    return {
        priorite: E.enonce(critere, 'priorite', {}),
        // Ce qui suit la phrase du défi dans le bilan (`_rendreAlgoA0Bilan`).
        prioriteSuite: ' (' + nom + ' : ' + n + ' ' + E.accorder(n, N.erreurs) + ' sur ' + m + ' ' + E.accorder(m, N.mots) + ', Incomplet)',
        concentre: E.enonce(critere, 'concentre', {}),
        // Ce qui l'entoure (`_rendreTousMaitrisesBilan`) : sans point final, il est suivi du compte.
        concentreSuite: ' (' + E.nombreEtNom(n, critere) + ').',
        aucune: E.enonce(critere, 'aucune', {}),
        recurrent: n > 0 ? nom + ' : ' + E.nombreEtNom(n, critere) + principal : '',
        dominant: dominant,
        signalement: libelleSignal,
        etats: {
            recurrent: etat(n > 0),
            priorite: etat(essai.applicable && essai.pourcentage <= 0 && n > 0),
            concentre: n > 0 ? 'depend' : 'non',
            aucune: etat(n === 0),
            signalement: etat(signal && !!libelleSignal)
        }
    };
}

function _nbVide(x) { return (x === null || x === undefined || x === '') ? '' : _fmt(x); }

/** Les trois blocs écrits dans la limite (service, tolérance, longueur) ; vides sans limite. */
function _valeursDeLaLimite(critere) {
    var p = _P().normaliser(critere);
    if (!p.modele.projette) return { '{service}': '', '{seuil}': '', '{longueur}': '' };
    return {
        '{service}': String(p.params.nomServiceAide || '').trim(),
        '{seuil}': _nbVide(p.params.erreursTolerees),
        '{longueur}': _nbVide(p.params.motsReference)
    };
}

/**
 * Ce que chaque bloc de la palette vaudrait sur cette copie (« Après la flèche ») — les valeurs que les
 * deux registres donnent à leurs jetons : celles du décompte (`enonce`) et celles de la projection
 * (`calculer().jetons`). Un bloc sans valeur rend '' (« vide »).
 */
function valeursDesBlocs(critere, copie) {
    var E = _E(), P = _P(), N = E.noms(critere);
    var n = Number(copie.erreurs) || 0, m = copie.mots;
    var proj = P.calculer(critere, { erreurs: n, mots: m || 0 });
    var nom = E.libelleCritere(critere);
    var v = Object.assign({
        '{critere}': nom === E.LIBELLE_SANS_CRITERE ? E.CRITERE_SANS_NOM : nom,
        '{nomErreurs}': E.accorder(n, N.erreurs),
        '{nomMots}': E.accorder(m || 0, N.mots),
        '{erreurs}': _nbVide(n),
        '{mots}': _nbVide(m),
        '{points}': E.mentionPonderee(copie.erreurs, copie.erreursFormule).trim()
    }, _valeursDeLaLimite(critere));
    var j = (proj.applicable && proj.jetons) ? proj.jetons : {};
    // Lot 3b : sans limite, une table de cas remplit encore la moyenne (`tablesCasAlgo`) — la même valeur, arrondie.
    v['{moyenne}'] = j.moyenne || ((n > 0 && m > 0) ? String(Math.round(m / n)) : '');
    v['{projection}'] = j.projection || '';
    v['{palier}'] = j.palier || '';
    // Étape 4c : un bloc par calcul pour les phrases, sa valeur sur la copie fictive.
    var calculs = _M().jetonsDesCalculs(critere, copie);
    Object.keys(calculs).forEach(function(id) { v['{' + id + '}'] = calculs[id]; });
    return v;
}

/**
 * « Voir ce que l'étudiant·e lirait à ce palier » (décision 10 du verdict du 24 oct.) — une copie qui
 * atteint le palier `indice`, par le calcul de l'évaluation : le compte monte de 0 sur l'étendue de la
 * copie fictive (sinon la longueur de référence) ; si aucun compte entier n'y suffit, l'étendue s'allonge
 * (comme l'ébauche, `regleSurPalier`). Rend `{copie, raison}` : `raison` = 'limite' (limite incomplète),
 * 'impossible', ou ''.
 */
function copiePourPalier(critere, copieActuelle, indice) {
    var P = _P();
    if (!P.limiteComplete(critere) || !P.limiteFixee(critere)) return { copie: null, raison: 'limite' };
    var p = P.normaliser(critere);
    var m0 = Number(copieActuelle && copieActuelle.mots) > 0 ? Number(copieActuelle.mots) : Number(p.params.motsReference);
    var facteurs = [1, 2, 3, 4, 5, 8, 10, 20, 50];
    for (var a = 0; a < facteurs.length; a++) {
        var m = m0 * facteurs[a];
        var plafond = Math.min(2000, Math.max(200, Math.ceil(m)));
        for (var n = 0; n <= plafond; n++) {
            var r = P.calculer(critere, { erreurs: n, mots: m });
            if (r.applicable && (r.paliers || []).indexOf(r.palier) === indice) {
                return { copie: { cle: null, erreurs: n, erreursFormule: n, mots: m, codes: [] }, raison: '' };
            }
        }
    }
    return { copie: null, raison: 'impossible' };
}

/**
 * « Voir ce que l'étudiant·e lirait dans ce cas » (lot 3b, l'ébauche `regleSurCas`) — une copie qui atteint le
 * cas `cle` de la table `tableId`, par le calcul de l'évaluation (`tablesCasAlgo.valeurs`, `casChoisi`) : un
 * code, trois fois posé ; « Aucun code », aucun ; sinon le compte monte de 0 sur l'étendue de la copie fictive,
 * puis, à compte égal, l'étendue de 0. Rend `{copie, raison, code?}` : `raison` = 'impossible', ou ''.
 */
function copiePourCas(critere, copieActuelle, tableId, cleDuCas) {
    var T = _T();
    var table = T ? T.lire(critere).filter(function(t) { return t.id === tableId; })[0] : null;
    if (!table) return { copie: null, raison: 'impossible' };
    var actuelle = copieActuelle || {};
    var m0 = (actuelle.mots === null || actuelle.mots === undefined) ? null : Number(actuelle.mots);
    var cleTexte = String(cleDuCas);
    if (cleTexte.indexOf('code:') === 0) return _copieDuCode(critere, cleTexte.slice(5), m0);
    if (cleTexte === 'aucun') return { raison: '', code: null, copie: { cle: null, erreurs: 0, erreursFormule: 0, mots: m0, codes: [] } };
    var essai = function(n, m) {
        var copie = { cle: null, erreurs: n, erreursFormule: n, mots: m, codes: [] };
        return T.casChoisi(table, T.valeurs(critere, copie)) === cleTexte ? copie : null;
    };
    var n, trouvee;
    for (n = 0; n <= 400; n++) { trouvee = essai(n, m0); if (trouvee) return { copie: trouvee, raison: '' }; }
    var n0 = Math.max(0, Math.round(Number(actuelle.erreurs) || 0));
    for (var m = 0; m <= 5000; m++) { trouvee = essai(n0, m); if (trouvee) return { copie: trouvee, raison: '' }; }
    return { copie: null, raison: 'impossible' };
}

/** Une copie qui porte trois fois le code `numero` (sa somme pondérée, l'ordre de ses poses). */
function _copieDuCode(critere, numero, mots) {
    var T = _T(), C = _C();
    var grille = { criteres: [critere] };
    var k = T.codesDuCritere(critere).filter(function(c) { return c.code === numero; })[0];
    var id = k ? k.id : C.PREFIXE + numero;
    var compteurs = {};
    compteurs[id] = 3;
    var poids = Number(C.code(grille, id).poids);
    return { raison: '', code: numero, copie: { cle: null, erreurs: 3, erreursFormule: C.sommePonderee(grille, compteurs), mots: mots,
        codes: [{ code: numero, nom: k ? k.nom : 'Code ' + numero, poids: isFinite(poids) ? poids : 1, nombre: 3 }], poses: [id, id, id] } };
}

/**
 * La phrase de projection, découpée : le préfixe engendré, le verdict, la recommandation. Le verdict
 * est le texte du palier rempli par le module (`remplir`, ce que `_texteDuPalier` fait) ; si les
 * morceaux ne redonnent pas la phrase entière, elle reste un seul morceau, rattaché au verdict.
 */
function _morceauxDeLaProjection(proj, phrase) {
    var indice = String((proj.paliers || []).indexOf(proj.palier));
    var libelle = proj.palier ? (proj.palier.libelle || proj.palier.cle || '') : '';
    var entiere = [{ source: 'verdict', etape: 'paliers', zone: { palierIndex: indice, champ: 'texte' }, palier: libelle, texte: phrase }];
    var x = _decouperProjection(proj, phrase);
    if (!x) return entiere;
    var d = [];
    if (x.prefixe) d.push({ source: 'prefixe', engendre: true, texte: x.prefixe });
    if (x.verdict) d.push({ source: 'verdict', etape: 'paliers', zone: { palierIndex: indice, champ: 'texte' }, palier: libelle, texte: x.verdict });
    if (x.aide) d.push({ source: 'aide', etape: 'paliers', zone: { palierIndex: indice, champ: 'texteAide' }, texte: x.aide });
    return (d.map(function(m) { return m.texte; }).join(' ') === phrase) ? d : entiere;
}

/** Les trois parties de la phrase ({prefixe, verdict, aide}), ou null si la phrase ne commence pas par son verdict. */
function _decouperProjection(proj, phrase) {
    var prefixe = (proj.prefixe && phrase.indexOf(proj.prefixe) === 0) ? proj.prefixe : '';
    var corps = prefixe ? phrase.slice(prefixe.length).trim() : phrase;
    var verdict = _P().remplir(proj.palier ? (proj.palier.texte || '') : '', proj.jetons || {});
    if (corps === verdict) return { prefixe: prefixe, verdict: verdict, aide: '' };
    if (!verdict) return { prefixe: prefixe, verdict: '', aide: corps };
    if (corps.indexOf(verdict + ' ') === 0) return { prefixe: prefixe, verdict: verdict, aide: corps.slice(verdict.length + 1) };
    return null;
}

/** La clé d'une zone, telle que la porte un morceau cliquable : `enonce:<cle>`, `palier:<i>:<champ>`, `table:<id>:<cas>`. */
function cleDeZone(zone) {
    var d = zone || {};
    if (d.palierIndex !== undefined) return 'palier:' + d.palierIndex + ':' + (d.champ || 'texte');
    if (d.tableCas !== undefined) return 'table:' + d.tableCas + ':' + d.cas;   // lot 3b (`cas` peut porter « code:3 »)
    return 'enonce:' + d.enonceCle;
}

/** Une zone répond-elle à cette clé (`cleDeZone`) ? */
function _zoneVisee(z, cleZone) {
    var s = String(cleZone || '');
    var p = s.split(':');
    if (p[0] === 'enonce') return z.dataset.enonceCle === p[1];
    if (p[0] === 'palier') return z.dataset.palierIndex === p[1] && z.dataset.champ === p[2];
    if (p[0] === 'table') return z.dataset.tableCas === p[1] && z.dataset.cas === s.slice(('table:' + p[1] + ':').length);
    return false;
}

/* ---------------------------------------------------------------------
   Le rendu en chaîne (grilles.js l'insère dans la rangée du critère)
   --------------------------------------------------------------------- */

var etats = {};
var page = { sources: true, reduit: null };

function _cle(ctx, critere) {
    var cible = (ctx && ctx.mode === 'grille') ? ctx.grilleId : 'temp';
    return cible + ':' + ((critere && critere.id) || ('critere-' + (ctx ? ctx.index : 0)));
}
function _etat(ctx, critere) {
    var k = _cle(ctx, critere);
    if (!etats[k]) etats[k] = { ouverte: 'eleve', copie: null, flash: '' };
    return etats[k];
}

function _esc(t) {
    var s = String(t == null ? '' : t);
    if (typeof window !== 'undefined' && typeof window.echapperHtml === 'function') return window.echapperHtml(s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Une lecture conditionnelle de la simulation : la condition, son état (rempli au montage), la phrase. */
function _condition(si, quoi) {
    return '<div class="apercu-algo-condition"><p class="apercu-algo-si"><span>' + _esc(si) + '</span>'
        + '<span class="apercu-algo-etat" data-etat-lecture="' + quoi + '"></span></p>'
        + '<p class="apercu-algo-texte" data-lecture="' + quoi + '"></p></div>';
}

/**
 * L'atelier d'un critère : la chaîne (dessinée au montage), la palette, les cinq étapes, l'aperçu
 * (rempli au montage). `contenus` : le HTML de la palette et de chaque étape, rendu par grilles.js.
 */
function rendre(critere, ctx, contenus) {
    var k = contenus || {};
    var etat = _etat(ctx, critere);
    var i = _esc(ctx.index);
    var liste = etapes(critere, ctx.criteres);
    var sections = liste.map(function(e) {
        var ouverte = etat.ouverte === e.id;
        var idCorps = 'atelier-algo-' + i + '-' + e.id;
        var but = TEXTES.buts[e.id];
        return '\n                    <section class="atelier-algo-etape' + (e.reglee ? ' atelier-algo-etape--reglee' : '') + '" data-etape="' + e.id + '"' + (ouverte ? ' data-ouverte' : '') + '>'
            + '\n                        <h3 class="atelier-algo-etape-titre"><button type="button" class="atelier-algo-etape-tete" data-action="atelierAlgo.basculerEtape" aria-expanded="' + ouverte + '" aria-controls="' + idCorps + '">'
            + '<span class="atelier-algo-etape-noeud" aria-hidden="true">✓</span>'
            + '<span class="atelier-algo-etape-titres"><span class="atelier-algo-etape-nom">' + _esc(e.libelle) + '</span><span class="atelier-algo-etape-resume" data-resume>' + _esc(e.resume) + '</span></span>'
            + '<span class="u-lecteur-ecran" data-etat>' + (e.reglee ? ', réglée' : ', à régler') + '</span>'
            + '<span class="atelier-algo-etape-chevron" aria-hidden="true">▾</span></button></h3>'
            + '\n                        <div class="atelier-algo-etape-corps" id="' + idCorps + '"' + (ouverte ? '' : ' hidden') + '>'
            + [].concat(but || []).map(function(t) { return '\n                            <p class="atelier-algo-etape-but">' + _esc(t) + '</p>'; }).join('')
            + (k[e.id] || '')
            + '\n                        </div>\n                    </section>';
    }).join('');
    var A = TEXTES.apercu;
    var id = function(x) { return 'apercu-algo-' + i + '-' + x; };
    var apercu = '\n                <aside class="apercu-algo" data-apercu-algo="' + i + '" aria-label="' + _esc(A.titre) + '"'
        + (page.sources ? '' : ' data-sans-sources') + (_reduit() ? ' data-reduit' : '') + '>'
        + '\n                    <div class="apercu-algo-tete"><h3 class="apercu-algo-titre">' + _esc(A.titre) + '</h3>'
        + '<button type="button" class="btn btn-secondaire btn-tres-compact apercu-algo-reduire" data-apercu-geste="reduire" aria-expanded="' + !_reduit() + '">' + _esc(_reduit() ? A.toutVoir : A.reduire) + '</button></div>'
        + '\n                    <p class="apercu-algo-but">' + _esc(A.but) + '</p>'
        + '\n                    <div class="apercu-algo-copie apercu-algo-detail">'
        + '<span class="apercu-algo-copie-titre">' + _esc(A.copie) + '</span>'
        + '<span class="apercu-algo-references-nom" aria-hidden="true">' + _esc(A.references) + '</span>'
        + '<div class="apercu-algo-references" role="group" aria-label="' + _esc(A.references) + '"></div>'
        + '<div class="apercu-algo-ligne">'
        + '<button type="button" class="apercu-algo-pas" data-apercu-geste="moins" aria-label="' + _esc(A.moins) + '">−</button>'
        + '<label class="u-lecteur-ecran" for="' + id('erreurs') + '">' + _esc(A.compte) + '</label>'
        + '<input type="number" class="controle-form apercu-algo-nombre" id="' + id('erreurs') + '" min="0" step="1" data-apercu-champ="erreurs">'
        + '<button type="button" class="apercu-algo-pas" data-apercu-geste="plus" aria-label="' + _esc(A.plus) + '">+</button>'
        + '<span data-apercu-nom="erreurs"></span><span>' + _esc(A.pour) + '</span>'
        + '<label class="u-lecteur-ecran" for="' + id('mots') + '">' + _esc(A.longueur) + '</label>'
        + '<input type="number" class="controle-form apercu-algo-nombre" id="' + id('mots') + '" min="0" step="10" data-apercu-champ="mots">'
        + '<span data-apercu-nom="mots"></span></div>'
        + '<label class="u-lecteur-ecran" for="' + id('curseur') + '">' + _esc(A.curseur) + '</label>'
        + '<input type="range" class="apercu-algo-curseur" id="' + id('curseur') + '" min="0" step="1" data-apercu-champ="curseur">'
        + '<small class="apercu-algo-codes"></small><small class="apercu-algo-dominant"></small><small class="apercu-algo-etendue"></small></div>'
        + '\n                    <p class="apercu-algo-flash" aria-live="polite"></p>'
        + '\n                    <div class="apercu-algo-resultats"></div><small class="apercu-algo-raison"></small>'
        + '\n                    <div class="apercu-algo-lecture"><h4>' + _esc(A.pdf) + '</h4><p class="apercu-algo-texte" data-lecture="pdf"></p></div>'
        + '\n                    <div class="apercu-algo-lecture apercu-algo-detail"><h4>' + _esc(A.bilan) + '</h4>'
        + _condition(A.siCode, 'recurrent') + _condition(A.siEffondre, 'priorite') + _condition(A.siAcquis, 'concentre') + '</div>'
        + '\n                    <div class="apercu-algo-lecture apercu-algo-detail"><h4>' + _esc(A.toi) + '</h4>'
        + _condition(A.siAucunCode, 'aucune') + _condition(A.siSignalement, 'signalement') + '</div>'
        + '\n                    <label class="apercu-algo-bascule apercu-algo-detail"><input type="checkbox" data-apercu-champ="sources"' + (page.sources ? ' checked' : '') + '> ' + _esc(A.sources) + '</label>'
        + '\n                    <p class="apercu-algo-astuce apercu-algo-detail">' + _esc(A.astuce) + '</p>'
        + '\n                </aside>';
    return '\n            <div class="gabarit-algo" data-atelier-algo="' + i + '" data-critere-id="' + _esc((critere && critere.id) || '') + '">'
        + '\n                <nav class="atelier-algo-chaine" aria-label="' + _esc(TEXTES.chaine) + '"></nav>'
        + '\n                <div class="gabarit-algo-plan">'
        + '\n                <div class="gabarit-algo-centre"><div class="gabarit-algo-atelier">' + (k.palette || '')
        + '\n                    <div class="gabarit-algo-corps">' + sections + '\n                    </div>'
        + '\n                </div></div>' + apercu
        + '\n                </div>\n            </div>';
}

/* ---------------------------------------------------------------------
   Le montage et les gestes (la page)
   --------------------------------------------------------------------- */

var TIROIR = '(max-width: 759px)';
function _sousTiroir() {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(TIROIR).matches;
}
/** Le tiroir réduit : réduit au départ sous 760 px, puis ce que le geste a choisi. */
function _reduit() {
    if (page.reduit === null) return _sousTiroir();
    return page.reduit;
}

function _ateliers(racine) {
    var r = racine || (typeof document !== 'undefined' ? document : null);
    return r ? Array.prototype.slice.call(r.querySelectorAll('.gabarit-algo[data-atelier-algo]')) : [];
}
function _atelierDe(index) {
    return _ateliers().filter(function(a) { return a.dataset.atelierAlgo === String(index); })[0] || null;
}
function _etatDe(atelier) { return _etat(atelier._ctx, atelier._critere); }
function _copieDe(atelier) {
    var etat = _etatDe(atelier);
    return etat.copie || copieDeDepart(atelier._critere);
}

/** Les zones d'écriture d'un atelier, et l'élément qu'on voit de chacune (la vue à badges, sinon le champ). */
function _zones(atelier) {
    return Array.prototype.slice.call(atelier.querySelectorAll('textarea[data-enonce-cle], textarea[data-palier-index], textarea[data-table-cas]'));
}
function _visible(zone) {
    var C = (typeof window !== 'undefined') ? window.composeurBadges : null;
    return (C && typeof C.vueDe === 'function' && C.vueDe(zone)) || zone;
}
function _cachee(el) { return !el || !!el.closest('.atelier-algo-etape-corps[hidden]'); }

/**
 * Après chaque rendu du gabarit (`afficherCriteresTemp`, `afficherCriteresGrille`) : la chaîne et
 * l'aperçu de chaque atelier du conteneur. `criteres` : la liste dont les index des ateliers sont les rangs.
 */
function monter(container, criteres, ctx) {
    _ateliers(container).forEach(function(atelier) {
        var index = parseInt(atelier.dataset.atelierAlgo, 10);
        var critere = (criteres || [])[index];
        if (!critere) return;
        atelier._critere = critere;
        atelier._ctx = Object.assign({}, ctx, { index: index, criteres: criteres });
        _dessinerChaine(atelier);
        _remplirApercu(atelier);
    });
    _observerTiroirs();
}

/** Un critère changé sans redessin (la pondération, un bloc posé) : la chaîne, les en-têtes, l'aperçu. */
function suivre(index, critere) {
    var atelier = _atelierDe(index);
    if (!atelier || !critere) return;
    atelier._critere = critere;
    var liste = etapes(critere, atelier._ctx && atelier._ctx.criteres);
    liste.forEach(function(e) {
        var s = atelier.querySelector('.atelier-algo-etape[data-etape="' + e.id + '"]');
        if (!s) return;
        s.classList.toggle('atelier-algo-etape--reglee', e.reglee);
        s.querySelector('[data-resume]').textContent = e.resume;
        s.querySelector('[data-etat]').textContent = e.reglee ? ', réglée' : ', à régler';
    });
    _dessinerChaine(atelier);
    _remplirApercu(atelier);
}

function _dessinerChaine(atelier) {
    var nav = atelier.querySelector('.atelier-algo-chaine');
    if (!nav || typeof window.ChaineEtapes === 'undefined') return;
    var ouverte = _etatDe(atelier).ouverte;
    var liste = etapes(atelier._critere, atelier._ctx && atelier._ctx.criteres).map(function(e) {
        return { id: e.id, libelle: e.libelle, info: e.info, reglee: e.reglee, arrivee: e.arrivee, ouverte: e.id === ouverte };
    });
    window.ChaineEtapes.dessiner(nav, liste, {
        libelle: TEXTES.chaine, crayons: true,
        surClic: function(id) { ouvrir(atelier, id, true); }
    });
}

/** Ouvre une étape (les autres se ferment) ; `null` les ferme toutes. `defiler` : y descendre. */
function ouvrir(atelier, id, defiler) {
    if (!atelier) return;
    _etatDe(atelier).ouverte = id || null;
    atelier.querySelectorAll('.atelier-algo-etape').forEach(function(s) {
        var o = s.dataset.etape === id;
        if (o) s.setAttribute('data-ouverte', ''); else s.removeAttribute('data-ouverte');
        var tete = s.querySelector('.atelier-algo-etape-tete');
        if (tete) tete.setAttribute('aria-expanded', String(o));
        var corps = s.querySelector('.atelier-algo-etape-corps');
        if (corps) corps.hidden = !o;
    });
    // La palette ne vise pas une zone qu'on ne voit plus (elle a pu la suivre dans l'étape fermée).
    var palette = atelier.querySelector('.palette-algo');
    if (palette && palette._zoneCible && _cachee(_visible(palette._zoneCible)) && typeof window.deciblerPaletteAlgo === 'function') {
        window.deciblerPaletteAlgo(palette);
    }
    _dessinerChaine(atelier);
    if (defiler && id) {
        var s = atelier.querySelector('.atelier-algo-etape[data-etape="' + id + '"]');
        if (s && typeof s.getBoundingClientRect === 'function') {
            var haut = s.getBoundingClientRect().top;
            if (haut < 0 || haut > window.innerHeight * 0.5) s.scrollIntoView({ behavior: _sansMouvement() ? 'auto' : 'smooth', block: 'start' });
        }
    }
}

/** L'en-tête d'une étape (`data-action`) : ouvre, ou ferme l'étape ouverte. */
function basculerEtape(el) {
    var s = el && el.closest ? el.closest('.atelier-algo-etape') : null;
    var atelier = s ? s.closest('.gabarit-algo') : null;
    if (!atelier) return;
    ouvrir(atelier, s.hasAttribute('data-ouverte') ? null : s.dataset.etape, false);
}

function _sansMouvement() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Un bloc survolé ou parcouru : les zones visibles qui l'acceptent s'allument, le crayon marque ses étapes. */
function montrer(atelier, jeton, oui) {
    if (!atelier) return;
    var Pal = window.paletteAlgo;
    _zones(atelier).forEach(function(z) {
        var v = _visible(z);
        var offert = !!(oui && Pal && !_cachee(v) && Pal.reperesDeZone(atelier._critere, z.dataset).some(function(r) { return r.jeton === jeton; }));
        v.classList.toggle('atelier-algo-peut', offert);
    });
    var nav = atelier.querySelector('.atelier-algo-chaine');
    if (nav && window.ChaineEtapes && typeof window.ChaineEtapes.marquer === 'function') {
        window.ChaineEtapes.marquer(nav, oui ? etapesDuJeton(atelier._critere, jeton) : []);
    }
}

/** Un morceau de phrase touché : son étape s'ouvre, sa zone vient sous les yeux, le curseur au bout. */
function allerA(atelier, cleZone) {
    var zone = null;
    _zones(atelier).forEach(function(z) { if (!zone && _zoneVisee(z, cleZone)) zone = z; });
    if (!zone) return;
    ouvrir(atelier, etapeDeZone(zone.dataset), false);
    var v = _visible(zone);
    if (typeof v.scrollIntoView === 'function') v.scrollIntoView({ behavior: _sansMouvement() ? 'auto' : 'smooth', block: 'center' });
    try { v.focus({ preventScroll: true }); } catch (err) { /* rien : la zone est montrée */ }
    _curseurAuBout(v);
    v.classList.remove('atelier-algo-allume');
    void v.offsetWidth;
    v.classList.add('atelier-algo-allume');
}

function _curseurAuBout(el) {
    if (el.tagName === 'TEXTAREA') {
        try { el.setSelectionRange(el.value.length, el.value.length); } catch (err) { /* moteur sans sélection */ }
        return;
    }
    var sel = window.getSelection ? window.getSelection() : null;
    if (!sel || typeof document.createRange !== 'function') return;
    var r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
}

/* ---------- L'aperçu ---------- */

function _el(tag, classe, texte) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texte !== undefined) e.textContent = texte;
    return e;
}

/** La note de la copie fictive, comme le miroir la disait : « 15/20 (75 %) » (js/note-pourcentage.js, #1137). */
function _texteNote(essai, critere) {
    return window.formaterNoteNombre(essai.points) + '/' + window.formaterNoteNombre(Number(critere.ponderation))
        + ' (' + window.formaterNotePourcentage(essai.pourcentage) + ')';
}

function _remplirApercu(atelier) {
    var ap = atelier.querySelector('.apercu-algo');
    var critere = atelier._critere;
    if (!ap || !critere || !_M()) return;
    var copie = _copieDe(atelier);
    var lec = lecture(critere, copie);
    _remplirCopie(ap, critere, copie, lec);
    _remplirResultats(ap, critere, lec);
    _remplirPhrases(ap, lec, critere);
    var flash = ap.querySelector('.apercu-algo-flash');
    if (flash) flash.textContent = _etatDe(atelier).flash || '';
    _marquerPaliers(atelier, lec.indicePalier);
    _marquerCas(atelier, lec.casAtteints || {});
    _remplirValeursDesBlocs(atelier, critere, copie);
    _remplirCalculDeLaNote(atelier, critere, copie);
}

/** Étape 4b — les données de la copie fictive d'un atelier, comme `calculer` les reçoit ; null sans pondération. */
function donneesDeLaCopie(atelier) {
    var critere = atelier && atelier._critere, pond = Number(critere && critere.ponderation);
    if (!critere || !(isFinite(pond) && pond > 0)) return null;
    var copie = _copieDe(atelier);
    return { ponderation: pond, erreurs: copie.erreursFormule, compte: copie.erreurs, mots: copie.mots || 0 };
}

/** Étape 4a — « Sur la copie fictive : … » sous le calcul choisi : la ligne du registre, au conditionnel. */
function _remplirCalculDeLaNote(atelier, critere, copie) {
    // Étape 4b : la même copie, dans le composeur (le brouillon en cours).
    if (typeof window !== 'undefined' && window.composeurCalcul) window.composeurCalcul.remplirLigne(atelier);
    // Étape 4c : la valeur de chaque calcul pour les phrases sur la copie fictive (« sans valeur » quand il n'en a pas).
    var valeurs = _M().jetonsDesCalculs(critere, copie);
    atelier.querySelectorAll('[data-calcul-phrases-valeur]').forEach(function(v) {
        v.textContent = valeurs[v.dataset.calculPhrasesValeur] || TEXTES.sansValeur;
    });
    var x = atelier.querySelector('[data-calcul-copie-texte]');
    if (!x) return;
    var pond = Number(critere.ponderation);
    x.textContent = (isFinite(pond) && pond > 0)
        ? _F().ligneResultat(critere, { ponderation: pond, erreurs: copie.erreursFormule, compte: copie.erreurs, mots: copie.mots || 0 }, 'conditionnel')
        : _M().libelles(critere).sansPonderation;
}

/** Lot 3b — dans chaque table, la rangée du cas que la copie fictive atteint : marquée, son repère montré. */
function _marquerCas(atelier, atteints) {
    atelier.querySelectorAll('[data-cas-rangee]').forEach(function(r) {
        var v = String(r.dataset.casRangee);
        var tid = v.slice(0, v.indexOf(':'));
        var oui = atteints[tid] !== undefined && atteints[tid] !== null && (tid + ':' + atteints[tid]) === v;
        if (oui) r.setAttribute('data-atteint', ''); else r.removeAttribute('data-atteint');
        var ici = r.querySelector('[data-cas-ici]');
        if (ici) ici.hidden = !oui;
    });
}

/** La rangée du palier que la copie fictive atteint : marquée (`data-atteint`), son repère montré. */
function _marquerPaliers(atelier, indice) {
    atelier.querySelectorAll('[data-palier-rangee]').forEach(function(r) {
        var oui = r.dataset.palierRangee === String(indice);
        if (oui) r.setAttribute('data-atteint', ''); else r.removeAttribute('data-atteint');
        var ici = r.querySelector('[data-palier-ici]');
        if (ici) ici.hidden = !oui;
    });
}

/** « Après la flèche » : la valeur de chaque bloc de la palette sur la copie fictive. */
function _remplirValeursDesBlocs(atelier, critere, copie) {
    var v = valeursDesBlocs(critere, copie);
    atelier.querySelectorAll('.palette-algo-bloc[data-jeton]').forEach(function(b) {
        var x = b.querySelector('.palette-algo-bloc-valeur');
        if (!x) return;
        var val = v[b.dataset.jeton];
        x.textContent = val ? val : 'vide';
        x.classList.toggle('palette-algo-bloc-valeur--vide', !val);
    });
}

/** La copie fictive : les copies de référence, les deux nombres, le curseur, les codes posés, l'étendue. */
function _remplirCopie(ap, critere, copie, lec) {
    var A = TEXTES.apercu, E = _E(), M = _M();
    var L = M.libelles(critere), N = E.noms(critere);
    var refs = copiesDeReference(critere);
    var boite = ap.querySelector('.apercu-algo-references');
    boite.textContent = '';
    refs.forEach(function(r) {
        var b = _el('button', 'apercu-algo-reference', r.libelle);
        b.type = 'button';
        b.dataset.apercuGeste = 'reference';
        b.dataset.copie = r.cle;
        b.setAttribute('aria-pressed', String(copie.cle === r.cle));
        boite.appendChild(b);
    });
    var beaucoup = refs.filter(function(r) { return r.cle === 'beaucoup'; })[0];
    ap.querySelector('[data-apercu-champ="curseur"]').max = String(Math.max(60, beaucoup ? beaucoup.erreurs * 2 : 0, copie.erreurs));
    var sansEtendue = copie.mots === null || copie.mots === undefined;
    _poserChamp(ap, 'erreurs', String(copie.erreurs));
    _poserChamp(ap, 'mots', sansEtendue ? '' : String(copie.mots));
    _poserChamp(ap, 'curseur', String(copie.erreurs));
    ap.querySelector('[data-apercu-nom="erreurs"]').textContent = E.accorder(copie.erreurs, N.erreurs);
    ap.querySelector('[data-apercu-nom="mots"]').textContent = E.accorder(copie.mots || 0, N.mots);
    var codes = (copie.codes || []).map(function(x) { return L.code(x.nombre, x.nom, x.poids); }).join(', ');
    var mention = (copie.erreursFormule !== copie.erreurs) ? E.mentionPonderee(copie.erreurs, copie.erreursFormule).trim() : '';
    ap.querySelector('.apercu-algo-codes').textContent = codes ? A.codesPoses + codes + (mention ? ' ' + mention : '') : '';
    // « Le plus fréquent : code N, nom » (et l'égalité, quand il y en a une) — lot 3a.
    var dom = ap.querySelector('.apercu-algo-dominant');
    dom.textContent = '';
    var d = lec && lec.dominant;
    if (d) {
        dom.appendChild(document.createTextNode(A.plusFrequent));
        dom.appendChild(_el('strong', '', A.code(d.code.code, d.code.nom)));
        if (d.egaux.length) dom.appendChild(document.createTextNode(A.egalite(d.egaux.map(function(x) { return 'code ' + x.code; }).join(', '), d.liste)));
    }
    ap.querySelector('.apercu-algo-etendue').textContent = sansEtendue ? L.sansEtendue
        : (M.sourceEtendue(critere).origine === 'facteur' ? L.etendueDuFacteur : '');
}

/** Un champ de la copie, sauf celui qu'on est en train de taper (le curseur y resterait au mauvais endroit). */
function _poserChamp(ap, champ, valeur) {
    var x = ap.querySelector('[data-apercu-champ="' + champ + '"]');
    if (x && x !== document.activeElement) x.value = valeur;
}

/** La note (et le plancher), le palier atteint ; sans note, la phrase du miroir qui dit pourquoi. */
function _remplirResultats(ap, critere, lec) {
    var A = TEXTES.apercu, L = _M().libelles(critere);
    var res = ap.querySelector('.apercu-algo-resultats');
    res.textContent = '';
    var pilule = _el('span', 'apercu-algo-resultat');
    pilule.append(_el('span', 'apercu-algo-resultat-nom', A.note), ' ', lec.essai.applicable ? _texteNote(lec.essai, critere) : A.aucuneNote);
    if (lec.essai.plancher) pilule.append(' ', _el('span', 'apercu-algo-resultat-nom', L.plancher));
    res.appendChild(pilule);
    if (lec.palier) {
        var p = _el('span', 'apercu-algo-resultat apercu-algo-resultat--palier');
        p.append(_el('span', 'apercu-algo-resultat-nom', A.palier), ' ', lec.palier);
        res.appendChild(p);
    }
    var pond = Number(critere.ponderation);
    // Étape 4a : sans note, la ligne du registre dit quelle donnée l'évaluation attendrait (« le compte des calculs »).
    var copie = lec.essai.copie || {};
    ap.querySelector('.apercu-algo-raison').textContent = lec.essai.applicable ? ''
        : ((isFinite(pond) && pond > 0)
            ? _F().ligneResultat(critere, { ponderation: pond, erreurs: copie.erreursFormule, compte: copie.erreurs, mots: copie.mots || 0 }, 'conditionnel')
            : L.sansPonderation);
}

/** Les phrases, rangées par destination : le PDF (par morceaux), le bilan, « Pour toi seul·e » ; chaque
 *  condition dit, au conditionnel, si elle s'afficherait sur cette copie. */
function _remplirPhrases(ap, lec, critere) {
    var A = TEXTES.apercu, S = TEXTES.sources;
    var Pal = _Pal();
    var moyenne = Pal ? Pal.blocs(critere).filter(function(x) { return x.jeton === '{moyenne}'; })[0] : null;
    var titreEngendre = A.engendre(moyenne ? moyenne.nom : '');
    var pdf = ap.querySelector('[data-lecture="pdf"]');
    pdf.textContent = '';
    if (!lec.pdf.length) pdf.appendChild(_el('span', 'apercu-algo-rien', A.aucunePhrase));
    lec.pdf.forEach(function(m, n) {
        if (n) pdf.appendChild(document.createTextNode(' '));
        var nom = m.source === 'verdict' ? S.verdict(m.palier) : (m.source === 'table' ? S.table(m.libelle) : S[m.source]);
        pdf.appendChild(_segment(m.engendre ? null : cleDeZone(m.zone), nom, m.texte, m.engendre ? titreEngendre : ''));
    });
    var boite = function(quoi) {
        var b = ap.querySelector('[data-lecture="' + quoi + '"]');
        b.textContent = '';
        var etat = lec.etats[quoi];
        b.classList.toggle('apercu-algo-texte--eteint', etat !== 'oui');
        var e = ap.querySelector('[data-etat-lecture="' + quoi + '"]');
        if (e) { e.textContent = A.etats[etat]; e.dataset.etat = etat; }
        return b;
    };
    var rien = function(b, texte) { b.appendChild(_el('span', 'apercu-algo-rien', texte || A.rien)); };

    var b = boite('recurrent');
    if (lec.recurrent) b.appendChild(_segment(null, S.recurrent, lec.recurrent)); else rien(b);

    b = boite('priorite');
    if (lec.priorite) {
        var fort = _segment('enonce:priorite', S.priorite, lec.priorite);
        fort.classList.add('apercu-algo-segment--fort');
        b.appendChild(fort);
        b.appendChild(document.createTextNode(lec.prioriteSuite));
    } else rien(b);

    b = boite('concentre');
    b.appendChild(document.createTextNode(A.tousMaitrises));
    if (lec.concentre) { b.appendChild(document.createTextNode(' ')); b.appendChild(_segment('enonce:concentre', S.concentre, lec.concentre)); }
    b.appendChild(document.createTextNode(lec.concentreSuite));

    b = boite('aucune');
    if (lec.aucune) b.appendChild(_segment('enonce:aucune', S.aucune, lec.aucune)); else rien(b);

    b = boite('signalement');
    if (lec.signalement) b.appendChild(_segment(null, S.signalement, lec.signalement)); else rien(b, A.sansSignalement);
}

/** Un morceau de phrase : un bouton qui mène à sa zone, ou (engendré par l'app) un simple texte. */
function _segment(cleZone, source, texte, titre) {
    var s;
    if (cleZone) {
        s = _el('button', 'apercu-algo-segment');
        s.type = 'button';
        s.dataset.versZone = cleZone;
    } else {
        // Engendrée par l'application (le préfixe, `titre` dit d'où), ou écrite ailleurs que dans une zone.
        s = _el('span', 'apercu-algo-segment apercu-algo-segment--engendre');
        if (titre) s.title = titre;
    }
    s.appendChild(_el('span', 'apercu-algo-source', source));
    s.appendChild(document.createTextNode(texte));
    return s;
}

/** Sous 760 px, la simulation devient un tiroir collé en bas : celui du premier atelier à l'écran. */
var _observateur = null;
var _aLEcran = new Set();
function _observerTiroirs() {
    if (typeof IntersectionObserver !== 'function') return;
    if (!_observateur) {
        _observateur = new IntersectionObserver(function(entrees) {
            entrees.forEach(function(e) { if (e.isIntersecting) _aLEcran.add(e.target); else _aLEcran.delete(e.target); });
            _poserTiroir();
        });
    }
    _observateur.disconnect();
    _aLEcran.clear();
    document.querySelectorAll('.gabarit-algo-plan').forEach(function(p) { _observateur.observe(p); });
}
function _poserTiroir() {
    var premier = null;
    document.querySelectorAll('.gabarit-algo-plan').forEach(function(p) {
        if (!premier && _aLEcran.has(p)) premier = p;
        if (p !== premier) p.removeAttribute('data-tiroir');
    });
    if (premier) premier.setAttribute('data-tiroir', '');
}

function _changerCopie(atelier, changement) {
    var etat = _etatDe(atelier);
    etat.copie = copieAvec(_copieDe(atelier), changement);
    etat.flash = '';
    _remplirApercu(atelier);
}

/** « Voir ce que l'étudiant·e lirait à ce palier » : la copie fictive réglée sur lui ; la simulation dit ce qu'elle a réglé. */
function voirPalier(atelier, indice) {
    if (!atelier) return;
    var A = TEXTES.apercu, E = _E(), critere = atelier._critere;
    var etat = _etatDe(atelier);
    var r = copiePourPalier(critere, _copieDe(atelier), indice);
    if (r.copie) {
        var N = E.noms(critere);
        var pal = _P().normaliser(critere).paliers[indice] || {};
        etat.copie = r.copie;
        etat.flash = A.regle(pal.libelle || pal.cle || '', _fmt(r.copie.erreurs) + ' ' + E.accorder(r.copie.erreurs, N.erreurs),
            _fmt(r.copie.mots) + ' ' + E.accorder(r.copie.mots, N.mots));
    } else {
        etat.flash = r.raison === 'limite' ? A.regleSansLimite : A.regleImpossible;
    }
    _remplirApercu(atelier);
    var ap = atelier.querySelector('.apercu-algo');
    if (ap && _sousTiroir() && _reduit()) {
        page.reduit = false;
        ap.removeAttribute('data-reduit');
    }
}

/** « Voir ce que l'étudiant·e lirait dans ce cas » (lot 3b) : la copie fictive réglée sur lui ; la simulation dit ce qu'elle a réglé. */
function voirCas(atelier, tableId, cleDuCas) {
    if (!atelier) return;
    var A = TEXTES.apercu, E = _E(), critere = atelier._critere;
    var etat = _etatDe(atelier);
    var r = copiePourCas(critere, _copieDe(atelier), tableId, cleDuCas);
    if (r.copie) {
        var N = E.noms(critere);
        etat.copie = r.copie;
        if (r.code !== undefined) etat.flash = r.code === null ? A.regleAucunCode : A.regleCode(r.code);
        else etat.flash = A.regleCas(_fmt(r.copie.erreurs) + ' ' + E.accorder(r.copie.erreurs, N.erreurs),
            // Une copie sans étendue (le champ vide) ne dit pas « pour 0 calcul ».
            (r.copie.mots === null || r.copie.mots === undefined) ? '' : _fmt(r.copie.mots) + ' ' + E.accorder(r.copie.mots, N.mots));
    } else {
        etat.flash = A.regleCasImpossible;
    }
    _remplirApercu(atelier);
    var ap = atelier.querySelector('.apercu-algo');
    if (ap && _sousTiroir() && _reduit()) {
        page.reduit = false;
        ap.removeAttribute('data-reduit');
    }
}

/** « + Ajouter une recommandation » : la zone repliée d'un palier paraît, le curseur y va. Rien n'est écrit. */
function ouvrirRecommandation(el) {
    var groupe = el && el.closest ? el.closest('.table-cas-textes') : null;
    if (!groupe) return;
    var zone = groupe.querySelector('[data-recommandation]');
    if (!zone) return;
    zone.hidden = false;
    el.hidden = true;
    var t = zone.querySelector('textarea');
    var v = t ? _visible(t) : null;
    if (v) { try { v.focus(); } catch (err) { /* rien : la zone est montrée */ } }
}

function _brancher() {
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;
    var atelierDe = function(el) { return el && el.closest ? el.closest('.gabarit-algo[data-atelier-algo]') : null; };

    document.addEventListener('click', function(e) {
        var t = e.target;
        if (!t || typeof t.closest !== 'function') return;
        var seg = t.closest('[data-vers-zone]');
        if (seg) { allerA(atelierDe(seg), seg.dataset.versZone); return; }
        var geste = t.closest('[data-apercu-geste]');
        if (!geste) return;
        var atelier = atelierDe(geste);
        var g = geste.dataset.apercuGeste;
        if (g === 'reduire') {
            page.reduit = !_reduit();
            document.querySelectorAll('.apercu-algo').forEach(function(ap) {
                if (page.reduit) ap.setAttribute('data-reduit', ''); else ap.removeAttribute('data-reduit');
                var b = ap.querySelector('[data-apercu-geste="reduire"]');
                if (b) { b.textContent = page.reduit ? TEXTES.apercu.toutVoir : TEXTES.apercu.reduire; b.setAttribute('aria-expanded', String(!page.reduit)); }
            });
            return;
        }
        if (!atelier) return;
        var copie = _copieDe(atelier);
        if (g === 'moins') _changerCopie(atelier, { erreurs: copie.erreurs - 1 });
        else if (g === 'plus') _changerCopie(atelier, { erreurs: copie.erreurs + 1 });
        else if (g === 'palier') voirPalier(atelier, parseInt(geste.dataset.palier, 10));
        else if (g === 'cas') voirCas(atelier, geste.dataset.table, geste.dataset.cas);
        else if (g === 'reference') {
            var r = copiesDeReference(atelier._critere).filter(function(x) { return x.cle === geste.dataset.copie; })[0];
            if (r) {
                var et = _etatDe(atelier);
                et.copie = r;
                et.flash = (r.cle === 'egalite' && r.codes.length > 1) ? TEXTES.apercu.regleEgalite(r.codes[0].code, r.codes[1].code) : '';
                _remplirApercu(atelier);
            }
        }
    });

    document.addEventListener('input', function(e) {
        var x = e.target;
        if (!x || !x.dataset || !x.dataset.apercuChamp || x.dataset.apercuChamp === 'sources') return;
        var atelier = atelierDe(x);
        if (!atelier) return;
        if (x.dataset.apercuChamp === 'mots') _changerCopie(atelier, { mots: x.value });
        else if (x.value !== '') _changerCopie(atelier, { erreurs: x.value });
    });

    document.addEventListener('change', function(e) {
        var x = e.target;
        if (!x || !x.dataset || x.dataset.apercuChamp !== 'sources') return;
        page.sources = !!x.checked;
        document.querySelectorAll('.apercu-algo').forEach(function(ap) {
            if (page.sources) ap.removeAttribute('data-sans-sources'); else ap.setAttribute('data-sans-sources', '');
            var c = ap.querySelector('[data-apercu-champ="sources"]');
            if (c) c.checked = page.sources;
        });
    });

    // Survoler une phrase allume sa zone ; survoler (ou parcourir) un bloc allume les zones qui l'acceptent.
    var survol = function(e, oui) {
        var t = e.target;
        if (!t || typeof t.closest !== 'function') return;
        var seg = t.closest('.apercu-algo-segment[data-vers-zone]');
        if (seg) {
            if (!oui && e.relatedTarget && seg.contains(e.relatedTarget)) return;
            var a = atelierDe(seg);
            if (a) _zones(a).forEach(function(z) {
                if (_zoneVisee(z, seg.dataset.versZone)) _visible(z).classList.toggle('atelier-algo-montree', oui);
            });
            return;
        }
        var bloc = t.closest('.palette-algo-bloc');
        if (!bloc) return;
        if (!oui && e.relatedTarget && bloc.contains(e.relatedTarget)) return;
        montrer(atelierDe(bloc), bloc.dataset.jeton, oui);
    };
    document.addEventListener('pointerover', function(e) { survol(e, true); });
    document.addEventListener('pointerout', function(e) { survol(e, false); });
    document.addEventListener('focusin', function(e) { if (e.target && e.target.classList && e.target.classList.contains('palette-algo-bloc')) survol(e, true); });
    document.addEventListener('focusout', function(e) { if (e.target && e.target.classList && e.target.classList.contains('palette-algo-bloc')) survol(e, false); });
    // Un bloc posé (le clic) : l'allumage du survol s'éteint, la zone garde le curseur.
    document.addEventListener('animationend', function(e) {
        if (e.target && e.target.classList) e.target.classList.remove('atelier-algo-allume');
    });
}

var api = {
    TEXTES: TEXTES,
    ORDRE: ORDRE,
    etapes: etapes,
    etapeDeZone: etapeDeZone,
    etapesDuJeton: etapesDuJeton,
    copiesDeReference: copiesDeReference,
    copieDeDepart: copieDeDepart,
    copieAvec: copieAvec,
    lecture: lecture,
    cleDeZone: cleDeZone,
    rendre: rendre,
    monter: monter,
    suivre: suivre,
    ouvrir: ouvrir,
    basculerEtape: basculerEtape,
    montrer: montrer,
    allerA: allerA,
    dominantDeLaCopie: dominantDeLaCopie,
    valeursDesBlocs: valeursDesBlocs,
    copiePourPalier: copiePourPalier,
    voirPalier: voirPalier,
    copiePourCas: copiePourCas,
    voirCas: voirCas,
    ouvrirRecommandation: ouvrirRecommandation,
    donneesDeLaCopie: donneesDeLaCopie
};

if (typeof window !== 'undefined') {
    window.atelierAlgo = api;
    _brancher();
}
if (typeof module !== 'undefined' && module.exports) module.exports = api;

})();
