/**
 * MESURE — CE QUE L'ÉLÈVE LIT DANS SON PDF (6 septembre 2026) — banc d'exécution
 *
 * Rapport : Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-2026-09-06.md. Consigne du jour
 * du 6 septembre (Temps 1) : la carte AVANT le cadrage de la « synthèse des rétroactions dans
 * le PDF ». Ce fichier ne juge pas et ne corrige rien.
 *
 * Patron des trois audits du 5 septembre : les modules RÉELS de js/ sont chargés dans un bac
 * à sable (faux `window`, faux `document`) et leurs fonctions publiques sont appelées telles
 * quelles. Ce qui est réel ici : `synthese-retroaction-data.js`, `synthese-retroaction-rendu.js`
 * (la page de synthèse du PDF remis), `evaluation-calcul.js` + `evaluation-retroaction.js` (le
 * texte copié vers Léa : générale, spécifique, bilan), `travaux-export-pdf.js` (le compte des
 * annotations), `profil-etudiant-calculs.js` (les lecteurs d'échelle), `evaluation-enonces.js`,
 * `evaluation-formules.js`, `codes-annotation.js` (les registres). Ce qui est une doublure,
 * nommé : la palette de tampons (trois tampons réels, textes par défaut recopiés de
 * `travaux-outils.js`), le moteur de notation (`calculerDetailsNoteFinale` : deux artefacts
 * retenus), la configuration des jetons.
 *
 * Trois copies de banc, une par type de grille : HOLISTIQUE (trois critères au menu),
 * ANALYTIQUE (deux critères en points), ALGORITHMIQUE (un holistique + un algorithmique avec
 * ses codes — la forme réelle d'une grille de français). Même élève, même production, même
 * annotation (quatre tampons, cinq erreurs), un artefact antérieur pour la ligne « Progrès ».
 *
 * Deux marqueurs rendent les SOURCES lisibles dans le texte produit : « VIVANT » = le texte
 * tel qu'il est AUJOURD'HUI dans la cartouche ; « GELÉ » = le texte enregistré dans
 * `evaluation.criteres[].retroaction` au moment de la sauvegarde. Un même critère porte les
 * deux, différents exprès : le document qui imprime l'un ou l'autre le dit.
 *
 * Le `textContent` du faux DOM imite celui d'un navigateur : le texte des nœuds, SANS
 * séparateur entre deux éléments — c'est ce que `copierToutRetroaction` copie.
 *
 * ↻ 6 sept. 2026, plus tard dans la matinée : les deux constats mesurés ici (C1 « %% », C2 le bilan
 * de l'écran pris pour sa propre précédente) ont été CORRIGÉS le jour même (#757, #758) ; les
 * `expect` des deux premiers `it` portent les valeurs d'après, les sentinelles dédiées portent le
 * rouge-avant / vert-après.
 *
 *   cd tests && npx vitest run unit/mesure-ce-que-l-eleve-lit-2026-09-06.test.js
 */
import { describe, it, expect, afterAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerTravauxOutilsReel } from './_helpers/travaux-outils-reel.js';

const MESURES = {};
afterAll(() => { console.log('MESURE-PDF-ELEVE ' + JSON.stringify(MESURES, null, 1)); });

const clone = (x) => JSON.parse(JSON.stringify(x));
const cle = (k) => 'test_' + k;
const echapperHtml = (t) => String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
function valeurNumeriqueDuNiveau(n) {
    if (!n) return null;
    const p = Number(n.valeurCalcul);
    return (n.valeurCalcul != null && n.valeurCalcul !== '' && !isNaN(p)) ? p : null;
}

/* ------------------------------------------------------------------ faux DOM */

function decoder(s) {
    return String(s)
        .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'").replace(/&rarr;/g, '→').replace(/&times;/g, '×').replace(/&divide;/g, '÷')
        .replace(/&#x25BC;/g, '▼').replace(/&amp;/g, '&');
}
/** Comme `Node.textContent` : le texte des nœuds, aucun séparateur ajouté. */
function textContentDe(html) { return decoder(String(html).replace(/<[^>]*>/g, '')); }
/** Pour LIRE un bloc : un espace après chaque fermeture de bloc, blancs réduits. */
function texteLisible(html) {
    return decoder(String(html)
        .replace(/<\/(div|p|h[1-6]|li|section|header|footer|ul|span|b)>/gi, '$& ')
        .replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

function classList(initial) {
    const s = new Set(initial || []);
    return {
        add(c) { s.add(c); }, remove(c) { s.delete(c); }, contains(c) { return s.has(c); },
        toggle(c, force) { if (force === undefined) force = !s.has(c); if (force) s.add(c); else s.delete(c); return force; }
    };
}
function elementDom(init) {
    const el = Object.assign({
        value: '', checked: false, style: {}, classList: classList(),
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, replaceChildren() {}, remove() {}, setAttribute() {}, addEventListener() {},
        dispatchEvent() { return true; }
    }, init || {});
    let html = (init && init.innerHTML) || '';
    let texte = (init && init.textContent) || '';
    Object.defineProperty(el, 'innerHTML', { get() { return html; }, set(v) { html = String(v); texte = textContentDe(html); } });
    Object.defineProperty(el, 'textContent', { get() { return texte; }, set(v) { texte = String(v); html = echapperHtml(texte); } });
    return el;
}
function fauxDocument(elements) {
    return {
        getElementById: (id) => elements[id] || null,
        querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
}

/** Les enfants de niveau 1 du conteneur de la page de synthèse, dans l'ordre. */
function blocsDeNiveau1(html) {
    const debut = html.indexOf('>') + 1;
    const fin = html.lastIndexOf('</div>');
    const corps = html.slice(debut, fin);
    const blocs = [];
    let prof = 0; let cur = ''; let last = 0; let m;
    const re = /<\/?([a-zA-Z0-9]+)[^>]*?(\/?)>/g;
    while ((m = re.exec(corps))) {
        const tag = m[0]; const nom = m[1].toLowerCase();
        const ferm = tag.startsWith('</');
        const auto = m[2] === '/' || ['img', 'br', 'hr', 'input'].includes(nom);
        cur += corps.slice(last, m.index) + tag; last = re.lastIndex;
        if (!ferm && !auto) prof++; else if (ferm) prof--;
        if (prof === 0 && cur.trim()) { blocs.push(cur); cur = ''; }
    }
    return blocs.map(b => ({ balise: ((/^\s*<([a-z0-9]+)/i.exec(b) || [])[1] || '?').toLowerCase(), html: b, texte: texteLisible(b) }));
}
/** Le rôle d'un bloc de niveau 1, par le marqueur qui l'identifie sans ambiguïté. */
function roleDuBloc(b) {
    const t = b.texte;
    if (b.balise === 'header') return 'en-tête (élève, cours, artefact, grille, barre du trimestre)';
    if (t.startsWith('Vue recalculée')) return 'marqueur « vue recalculée »';
    if (/^OBJECTIF /.test(t)) return 'ruban objectif / tâche / contexte';
    if (t.startsWith('Rétroaction par critère')) return 'rétroaction par critère';
    // Le bandeau commence par la LETTRE du niveau (« D Niveau général · … ») ; la porte #674 par la phrase.
    if (t.includes('Niveau général') || t.includes('Cette copie n’a pas de niveau général')) return 'niveau général';
    if (t.startsWith('Commentaires ciblés') || /erreurs? annot|2 catégories les plus fréquentes/.test(t)) return 'tampons + erreurs annotées';
    if (b.balise === 'footer') return 'bilan';
    if (t.includes('CC BY-NC-SA')) return 'pied (enseignant · cours · licence)';
    return '? ' + t.slice(0, 40);
}
/** Les rangées du bilan (colonne gauche = titre), dans l'ordre. */
function rangeesDuBilan(htmlFooter) {
    const morceaux = htmlFooter.split(/<div style="display: grid; grid-template-columns: 110px 1fr/).slice(1);
    return morceaux.map(m => {
        const t = texteLisible('<div' + m);
        return t;
    });
}

/* ------------------------------------------------------------------ données de banc */

const DA = '2000001';
const ETUDIANTS = [{ da: DA, prenom: 'Alice', nom: 'Assidu', groupe: '01', coursId: 'GC1', statut: 'actif' }];
const FICHIER = { id: 'F1', etudiantDA: DA, productionId: 'P2', nomFichier: 'ASSIDU_2000001_Analyse2.pdf', typeMIME: 'application/pdf' };

const ECHELLE = { id: 'E0', nom: 'IDME banc', seuilSuffisance: 'D', seuilMaitrise: 'M', niveaux: [
    { code: '0', nom: 'Non recevable', min: 0, max: 0, valeurCalcul: 0, couleur: '#999999' },
    { code: 'I', nom: 'Insuffisant', min: 1, max: 54, valeurCalcul: 40, couleur: '#aa0000' },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80, couleur: '#00aa00' },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#0000aa' }
] };

const PRODUCTIONS = [
    { id: 'P1', numero: 1, titre: 'Analyse 1', type: 'travail', activiteApprentissage: 'ACTIVITÉ-P1 : lire un récit bref', objectif: 'OBJECTIF-P1', tache: 'TÂCHE-P1', ponderation: 20, dateEcheance: '2026-09-15', coursId: 'GC1' },
    { id: 'P2', numero: 2, titre: 'Analyse 2', type: 'travail', activiteApprentissage: 'ACTIVITÉ-P2 : analyser un poème', objectif: 'OBJECTIF-P2 : relier les procédés au sens', tache: 'TÂCHE-P2 : rédige une analyse de 400 mots', ponderation: 20, dateEcheance: '2026-10-01', coursId: 'GC1' },
    { id: 'P3', numero: 3, titre: 'Dissertation', type: 'travail', activiteApprentissage: 'ACTIVITÉ-P3 : dissertation critique', objectif: 'OBJECTIF-P3', tache: 'TÂCHE-P3', ponderation: 30, dateEcheance: '2026-11-15', coursId: 'GC1' }
];

// Trois tampons RÉELS du catalogue, lus par le VRAI lecteur (#760, 24 sept. 2026) :
// `travaux-outils.js` chargé sur des réglages vides (catalogue et textes par défaut).
const travauxOutils = chargerTravauxOutilsReel().travauxOutils;
const CONFIG_JETONS = { actif: true, delai: { nombre: 2 }, reprise: { nombre: 2 }, repriseCiblee: { actif: false, nombre: 0 } };

function annotation(erreurs) {
    return { pages: { '1': {
        stickers: [{ autocollantId: 'obs-hoc' }, { autocollantId: 'obs-hoc' }, { autocollantId: 'action-liaison' }, { autocollantId: 'comp-relationnel' }],
        shapes: erreurs.map(type => ({ type }))
    } } };
}

const COPIES = {
    HOLISTIQUE: {
        grille: { id: 'G_H', nom: 'Grille holistique banc', criteres: [
            { id: 'h1', nom: 'Structure', ponderation: 30, type: 'holistique', description: 'La structure du texte' },
            { id: 'h2', nom: 'Rigueur', ponderation: 30, type: 'holistique', description: 'La rigueur de la démonstration' },
            { id: 'h3', nom: 'Nuance', ponderation: 40, type: 'holistique', description: 'La nuance du propos' }
        ] },
        cartouche: { id: 'CT_H', nom: 'Cartouche H', grilleId: 'G_H', contexte: 'CONTEXTE-CARTOUCHE-H : ce que la cartouche dit du contexte.', commentaires: {
            h1_I: 'VIVANT h1_I', h1_D: 'VIVANT h1_D : ta structure se met en place.', h1_M: 'VIVANT h1_M',
            h2_I: 'VIVANT h2_I : la rigueur manque encore.', h2_D: 'VIVANT h2_D', h2_M: 'VIVANT h2_M',
            h3_D: 'VIVANT h3_D', h3_M: 'VIVANT h3_M : ta nuance est maîtrisée.', h3_E: 'VIVANT h3_E'
        } },
        evaluation: { id: 'EV_H', etudiantDA: DA, etudiantNom: 'Alice Assidu', groupe: '01', productionId: 'P2', productionNom: 'Analyse 2',
            grilleId: 'G_H', grilleNom: 'Grille holistique banc', echelleId: 'E0', cartoucheId: 'CT_H', dateEvaluation: '2026-10-02T12:00:00.000Z',
            criteres: [
                { critereId: 'h1', critereNom: 'Structure', niveauSelectionne: 'D', retroaction: 'GELÉ h1_D : enregistré avec la copie.', ponderation: 30 },
                { critereId: 'h2', critereNom: 'Rigueur', niveauSelectionne: 'I', retroaction: 'GELÉ h2_I : enregistré avec la copie.', ponderation: 30 },
                { critereId: 'h3', critereNom: 'Nuance', niveauSelectionne: 'M', retroaction: 'GELÉ h3_M : enregistré avec la copie.', ponderation: 40 }
            ],
            noteFinale: 63.5, niveauFinal: 'D',
            retroactionFinale: 'TEXTE-LIBRE : ce que l’enseignant a écrit dans la zone de rétroaction.' },
        historique: { id: 'EV_H0', etudiantDA: DA, productionId: 'P1', productionNom: 'Analyse 1', grilleId: 'G_H', echelleId: 'E0', cartoucheId: 'CT_H',
            dateEvaluation: '2026-09-16T12:00:00.000Z', jetonDelaiApplique: true,
            criteres: [
                { critereId: 'h1', critereNom: 'Structure', niveauSelectionne: 'I', ponderation: 30 },
                { critereId: 'h2', critereNom: 'Rigueur', niveauSelectionne: 'I', ponderation: 30 },
                { critereId: 'h3', critereNom: 'Nuance', niveauSelectionne: 'D', ponderation: 40 }
            ], noteFinale: 50, niveauFinal: 'I' },
        ec: { etudiantDA: DA, productionId: 'P2', grilleId: 'G_H', echelleId: 'E0', cartoucheId: 'CT_H', idModification: 'EV_H',
            criteres: { h1: 'D', h2: 'I', h3: 'M' }, donneesAlgorithmiques: {}, pointsAnalytiques: {} },
        annotation: annotation(['errfr_1', 'errfr_1', 'errfr_1', 'errfr_4', 'errfr_9'])
    },
    ANALYTIQUE: {
        grille: { id: 'G_A', nom: 'Grille analytique banc', criteres: [
            { id: 'a1', nom: 'Contenu', ponderation: 70, type: 'analytique', description: 'Le fond' },
            { id: 'a2', nom: 'Langue', ponderation: 30, type: 'analytique', description: 'La forme' }
        ] },
        cartouche: { id: 'CT_A', nom: 'Cartouche A', grilleId: 'G_A', contexte: 'CONTEXTE-CARTOUCHE-A', commentaires: {
            a1_D: 'VIVANT a1_D', a1_M: 'VIVANT a1_M : ton contenu est solide.', a2_I: 'VIVANT a2_I : la langue nuit à la lecture.', a2_D: 'VIVANT a2_D'
        } },
        evaluation: { id: 'EV_A', etudiantDA: DA, etudiantNom: 'Alice Assidu', groupe: '01', productionId: 'P2', productionNom: 'Analyse 2',
            grilleId: 'G_A', grilleNom: 'Grille analytique banc', echelleId: 'E0', cartoucheId: 'CT_A', dateEvaluation: '2026-10-02T12:00:00.000Z',
            criteres: [
                { critereId: 'a1', critereNom: 'Contenu', niveauSelectionne: 'M', points: 56, retroaction: 'GELÉ a1_M : enregistré avec la copie.', ponderation: 70 },
                { critereId: 'a2', critereNom: 'Langue', niveauSelectionne: 'I', points: 15, retroaction: 'GELÉ a2_I : enregistré avec la copie.', ponderation: 30 }
            ],
            noteFinale: 71, niveauFinal: 'D',
            retroactionFinale: 'TEXTE-LIBRE : ce que l’enseignant a écrit dans la zone de rétroaction.' },
        historique: { id: 'EV_A0', etudiantDA: DA, productionId: 'P1', productionNom: 'Analyse 1', grilleId: 'G_A', echelleId: 'E0', cartoucheId: 'CT_A',
            dateEvaluation: '2026-09-16T12:00:00.000Z', jetonDelaiApplique: true,
            criteres: [
                { critereId: 'a1', critereNom: 'Contenu', niveauSelectionne: 'D', points: 45, ponderation: 70 },
                { critereId: 'a2', critereNom: 'Langue', niveauSelectionne: 'I', points: 12, ponderation: 30 }
            ], noteFinale: 57, niveauFinal: 'D' },
        ec: { etudiantDA: DA, productionId: 'P2', grilleId: 'G_A', echelleId: 'E0', cartoucheId: 'CT_A', idModification: 'EV_A',
            criteres: { a1: 'M', a2: 'I' }, donneesAlgorithmiques: {}, pointsAnalytiques: { a1: 56, a2: 15 } },
        annotation: annotation(['errfr_1', 'errfr_1', 'errfr_1', 'errfr_4', 'errfr_9'])
    },
    ALGORITHMIQUE: {
        grille: { id: 'G_G', nom: 'Grille de français banc', criteres: [
            { id: 'g1', nom: 'Contenu', ponderation: 80, type: 'holistique', description: 'Le fond' },
            { id: 'g2', nom: 'Langue', ponderation: 20, type: 'algorithmique', description: 'La qualité de la langue', codesDepuisSousCriteres: true, sousCriteres: [
                { code: '1', nom: 'Syntaxe', ponderation: 1, retroaction: 'CODE-1 : revois la construction de tes phrases.', couleur: '#c62828' },
                { code: '2', nom: 'Accords', ponderation: 1, retroaction: 'CODE-2 : vérifie les accords.', couleur: '#1565c0' }
            ] }
        ] },
        cartouche: { id: 'CT_G', nom: 'Cartouche G', grilleId: 'G_G', contexte: 'CONTEXTE-CARTOUCHE-G', commentaires: {
            g1_D: 'VIVANT g1_D', g1_M: 'VIVANT g1_M : ton contenu est solide.', g2_D: 'VIVANT g2_D : cartouche du critère algorithmique.', g2_I: 'VIVANT g2_I'
        } },
        evaluation: { id: 'EV_G', etudiantDA: DA, etudiantNom: 'Alice Assidu', groupe: '01', productionId: 'P2', productionNom: 'Analyse 2',
            grilleId: 'G_G', grilleNom: 'Grille de français banc', echelleId: 'E0', cartoucheId: 'CT_G', dateEvaluation: '2026-10-02T12:00:00.000Z',
            criteres: [
                { critereId: 'g1', critereNom: 'Contenu', niveauSelectionne: 'M', retroaction: 'GELÉ g1_M : enregistré avec la copie.', ponderation: 80 },
                { critereId: 'g2', critereNom: 'Langue', niveauSelectionne: 'D', retroaction: 'ALGO-GELÉ : Ta rédaction contient 12 erreurs pour 600 mots.', ponderation: 20 }
            ],
            donneesAlgorithmiques: { g2: { erreurs: 12, mots: 600, noteCalculee: 12, pourcentage: 60, retroaction: 'ALGO-GELÉ : Ta rédaction contient 12 erreurs pour 600 mots.' } },
            noteFinale: 76, niveauFinal: 'M',
            retroactionFinale: 'TEXTE-LIBRE : ce que l’enseignant a écrit dans la zone de rétroaction.' },
        historique: { id: 'EV_G0', etudiantDA: DA, productionId: 'P1', productionNom: 'Analyse 1', grilleId: 'G_G', echelleId: 'E0', cartoucheId: 'CT_G',
            dateEvaluation: '2026-09-16T12:00:00.000Z', jetonDelaiApplique: true,
            criteres: [
                { critereId: 'g1', critereNom: 'Contenu', niveauSelectionne: 'D', ponderation: 80 },
                { critereId: 'g2', critereNom: 'Langue', niveauSelectionne: 'I', ponderation: 20 }
            ], donneesAlgorithmiques: { g2: { erreurs: 30, mots: 500, noteCalculee: 4, pourcentage: 20 } }, noteFinale: 56, niveauFinal: 'D' },
        ec: { etudiantDA: DA, productionId: 'P2', grilleId: 'G_G', echelleId: 'E0', cartoucheId: 'CT_G', idModification: 'EV_G',
            criteres: { g1: 'M', g2: 'D' }, pointsAnalytiques: {},
            donneesAlgorithmiques: { g2: { erreurs: 12, mots: 600, noteCalculee: 12, pourcentage: 60, retroaction: 'ALGO-GELÉ : Ta rédaction contient 12 erreurs pour 600 mots.' } } },
        annotation: annotation(['errfr_1', 'errfr_1', 'errfr_1', 'errfr_2'])
    }
};

function baseDe(c) {
    const b = {
        test_grillesTemplates: [c.grille], test_echellesTemplates: [ECHELLE], test_pratiquesConfigurables: [],
        test_evaluationsSauvegardees: [c.evaluation, c.historique], test_productions: PRODUCTIONS,
        test_groupeEtudiants: ETUDIANTS, test_groupesCours: [],
        infoCours: { codeCours: '601-101-MQ', nomCours: 'Écriture et littérature', prenomEnseignant: 'Prof', nomEnseignant: 'Banc', session: 'A', annee: '2026' }
    };
    b['test_cartouches_' + c.grille.id] = [c.cartouche];
    return b;
}
const dbDe = (base) => ({ getSync: (k, d) => (k in base ? clone(base[k]) : (d !== undefined ? d : null)), setSync() {}, get: async () => null, set: async () => {} });

/* ------------------------------------------------------------------ bacs à sable */

function chargerCalculs() {
    return chargerScript('js/profil-etudiant-calculs.js', {
        db: { getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? clone([ECHELLE]) : (d !== undefined ? d : null)), get: async () => null, set: async () => {}, setSync() {} },
        cle, obtenirDonneesSelonMode: () => [], obtenirPreference: () => null, obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null, obtenirTypePratiqueActive: () => 'standards'
    });
}
function chargerRegistres(base) {
    const w = chargerScript('js/evaluation-enonces.js');
    chargerScript('js/evaluation-formules.js', {}, w);
    chargerScript('js/codes-annotation.js', { db: dbDe(base), cle, obtenirDonneesSelonMode: (k) => clone(base['test_' + k] || []) }, w);
    return w;
}
function chargerExportPdf() {
    return chargerScript('js/travaux-export-pdf.js', { document: fauxDocument({}) }).travauxExportPDF;
}

/** L'écran d'évaluation (calcul + rétroaction) : le texte copié vers Léa. */
function monterEcran(c, base, calculs, reg, exportPdf) {
    const ecran = {
        noteProduction1: elementDom(), niveauProduction1: elementDom(), criteresCopier: elementDom(),
        porteeNote1: elementDom({ classList: classList(['u-hide']) }),
        selectEtudiantEval: elementDom({ value: DA }), selectProduction1: elementDom({ value: 'P2' }),
        selectGrille1: elementDom({ value: c.grille.id }), selectEchelle1: elementDom({ value: 'E0' }),
        selectCartoucheEval: elementDom({ value: c.cartouche.id }),
        retroactionFinale1: elementDom({ value: '' }), 'compteur-mots-retro': elementDom(),
        afficherDescription1: elementDom({ checked: true }), afficherObjectif1: elementDom({ checked: true }),
        afficherTache1: elementDom({ checked: true }), afficherAdresse1: elementDom({ checked: true }), afficherContexte1: elementDom({ checked: true }),
        vueRetroGenerale: elementDom(), vueRetroSpecifique: elementDom(), vueRetroBilan: elementDom(),
        contenuRetroSpecifique: elementDom(), contenuRetroBilan: elementDom()
    };
    c.grille.criteres.forEach(cr => {
        ecran['eval_' + cr.id] = elementDom({ value: '' });
        // ↻ #960 — le gabarit pose son amorce dans le div (`renderCriteres`) : un div VIDE est un
        // commentaire enregistré vide (D6), qui ne prend plus la cartouche.
        ecran['comm_' + cr.id] = elementDom({ textContent: 'Sélectionne un niveau' });
        ecran['eval_pts_' + cr.id] = elementDom({ max: String(cr.ponderation) });
        ecran['eval_mots_' + cr.id] = elementDom({ value: '600' });
    });
    const document = fauxDocument(ecran);
    const ec = clone(c.ec);
    const copie = { texte: null };
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: ec, majBadgesApresEvaluation() {},
        enoncesAlgo: reg.enoncesAlgo, codesAnnotation: reg.codesAnnotation, formulesAlgo: reg.formulesAlgo };
    const globaux = {
        document, evaluationEnCours: ec, db: dbDe(base), cle, valeurNumeriqueDuNiveau, echapperHtml,
        genererIdUnique: (p) => p + 'NEUF',
        obtenirDonneesSelonMode: (k) => clone(base['test_' + k] || []),
        sauvegarderDonneesSelonMode: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle, zoneDuNiveau: calculs.zoneDuNiveau,
        echellesComparables: calculs.echellesComparables, obtenirEchelleResolue: calculs.obtenirEchelleResolue,
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle,
        obtenirPreference: () => null, obtenirCoursActifId: () => null,
        afficherNotificationSucces() {}, afficherNotificationErreur() {}, afficherNotificationCopiee() {},
        afficherSection() {}, afficherSousSection() {}, estModeeLectureSeule: () => false,
        obtenirConfigJetons: () => clone(CONFIG_JETONS), verifierDisponibiliteJeton: () => true, compterJetonsUtilises: () => 0,
        copierEnFormatTSV() {}, setTimeout: () => 0, clearTimeout() {}, alert() {},
        pluriel: (n, s, p) => (n > 1 ? p : s),
        navigator: { clipboard: { writeText: (t) => { copie.texte = t; return Promise.resolve(); } } },
        travauxVisionneuse: { getFichierActuel: () => FICHIER },
        travauxStockage: { obtenirAnnotationFichier: () => clone(c.annotation), obtenirFichierParId: () => FICHIER },
        travauxOutils, travauxExportPDF: exportPdf,
        calculerNote: (...a) => win.calculerNote(...a),
        genererRetroaction: (...a) => win.genererRetroaction(...a)
    };
    // #939 — la règle du commentaire d'un critère (`commentaireDuCritere`), le vrai module.
    chargerScript('js/synthese-retroaction-data.js', globaux, win);
    chargerScript('js/evaluation-calcul.js', globaux, win);
    chargerScript('js/evaluation-retroaction.js', globaux, win);
    return { win, ecran, ec, copie };
}

/** La page de synthèse du PDF remis (data + rendu). */
function monterPdf(c, base, calculs, reg, exportPdf, portee) {
    const retenus = [c.evaluation, c.historique].map(e => ({ productionId: e.productionId, niveau: e.niveauFinal, note: e.noteFinale }));
    const moyenne = retenus.reduce((s, r) => s + r.note, 0) / retenus.length;
    const win = { enoncesAlgo: reg.enoncesAlgo, codesAnnotation: reg.codesAnnotation };
    const globaux = {
        db: dbDe(base), cle, obtenirDonneesSelonMode: (k) => clone(base['test_' + k] || []),
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'Automne 2026', session: 'A', annee: '2026' }),
        obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => clone(c.annotation) },
        travauxOutils, travauxExportPDF: exportPdf, obtenirPreference: () => null,
        obtenirEchelleResolue: calculs.obtenirEchelleResolue, niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle, echellesComparables: calculs.echellesComparables,
        zoneDuNiveau: calculs.zoneDuNiveau,
        porteeDepuisEvaluation: portee.porteeDepuisEvaluation, texteCriteresHorsNote: portee.texteCriteresHorsNote,
        valeurNumeriqueDuNiveau,
        // Doublure du moteur de notation : deux artefacts retenus, la moyenne des deux.
        calculerDetailsNoteFinale: () => ({ portfolio: { artefactsRetenus: retenus, moyenne, nombreEvalues: 2, methodeSelection: 'meilleures' } }),
        obtenirConfigPratiqueActive: () => ({ configuration: { notesFinales: false } }),
        obtenirConfigJetons: () => clone(CONFIG_JETONS),
        anonymiserTexteRetroaction: (t) => t, echapperHtml,
        document: fauxDocument({})
    };
    chargerScript('js/synthese-retroaction-data.js', globaux, win);
    chargerScript('js/synthese-retroaction-rendu.js', globaux, win);
    return win;
}

/* ------------------------------------------------------------------ la mesure */

function mesurer(nom) {
    const c = COPIES[nom];
    const base = baseDe(c);
    const calculs = chargerCalculs();
    const reg = chargerRegistres(base);
    const exportPdf = chargerExportPdf();

    // 1. L'écran : la note se calcule, la rétroaction se génère, puis « Copier tout ».
    const { win, ecran, copie } = monterEcran(c, base, calculs, reg, exportPdf);
    win.calculerNote();
    win.genererRetroaction(1);
    const generale = ecran.retroactionFinale1.value;
    win.copierToutRetroaction();
    const specifique = ecran.contenuRetroSpecifique.textContent;
    const bilanEcran = ecran.contenuRetroBilan.textContent;

    // 2. Le PDF : le shape Feedback puis la page HTML rasterisée.
    const pdf = monterPdf(c, base, calculs, reg, exportPdf, { porteeDepuisEvaluation: win.porteeDepuisEvaluation, texteCriteresHorsNote: win.texteCriteresHorsNote });
    const feedback = pdf.syntheseRetroactionData.construireFeedback(clone(c.evaluation), FICHIER, clone(c.annotation));
    const html = pdf.syntheseRetroactionRendu.rendreSyntheseHTML(feedback);
    const blocs = blocsDeNiveau1(html);
    const footer = blocs.find(b => b.balise === 'footer');

    const m = {
        ecran: { noteAffichee: ecran.noteProduction1.textContent, niveauAffiche: ecran.niveauProduction1.textContent },
        lea: { generale, specifique, bilan: bilanEcran, tout: copie.texte },
        pdf: {
            squelette: blocs.map(roleDuBloc),
            blocs: blocs.map(b => ({ role: roleDuBloc(b), texte: b.texte })),
            rangeesBilan: footer ? rangeesDuBilan(footer.html) : [],
            portee: feedback.portee ? { incomplete: feedback.portee.incomplete, texte: feedback.portee.texte } : null
        }
    };
    // 3. Ce qui se répète : le même texte, compté dans la page du PDF et dans le texte copié.
    const texteHtml = texteLisible(html);
    const compter = (s, marqueur) => s.split(marqueur).length - 1;
    m.repetitions = {};
    ['OBJECTIF-P2', 'TÂCHE-P2', 'CONTEXTE-CARTOUCHE', "L'idée directrice n'est pas adéquatement identifiée.", 'Construction syntaxique / accord du verbe', 'Ta force', 'Progrès :', 'Tu as progressé', '%']
        .forEach(mq => { m.repetitions[mq] = { pdf: compter(texteHtml, mq), lea: compter(copie.texte || '', mq) }; });
    MESURES[nom] = m;
    return { m, feedback, html, blocs };
}

/**
 * L'écran AVANT le premier enregistrement (ni auto-save ni « Enregistrer ») : la copie n'est pas
 * encore dans `evaluationsSauvegardees`. C'est l'état des premières secondes d'une évaluation ;
 * après, l'auto-save (1,5 s) l'y met, et c'est l'état mesuré par `mesurer`.
 */
function mesurerEcranFrais(nom) {
    const c = COPIES[nom];
    const base = baseDe(c);
    base.test_evaluationsSauvegardees = [c.historique];
    const cFrais = Object.assign({}, c, { ec: Object.assign({}, c.ec, { idModification: undefined }) });
    const calculs = chargerCalculs();
    const reg = chargerRegistres(base);
    const { win, ecran, copie } = monterEcran(cFrais, base, calculs, reg, chargerExportPdf());
    win.calculerNote();
    win.genererRetroaction(1);
    win.copierToutRetroaction();
    const m = { lea: { generale: ecran.retroactionFinale1.value, bilan: ecran.contenuRetroBilan.textContent, tout: copie.texte } };
    MESURES[nom + '_AVANT_ENREGISTREMENT'] = m;
    return { m };
}

describe('mesure · ce que l\'élève lit dans son PDF et dans le texte copié vers Léa (6 sept. 2026)', () => {
    const H = mesurer('HOLISTIQUE');
    const A = mesurer('ANALYTIQUE');
    const G = mesurer('ALGORITHMIQUE');
    const HF = mesurerEcranFrais('HOLISTIQUE');

    // ── CONSTATS À PART : des textes que l'élève lisait et qui étaient FAUX (en tête du rapport) ──
    // ⮕ Corrigés le jour même, décision de Grégoire (6 sept. 2026, matin) : C1 = #757, C2 = #758,
    // sentinelles `sentinelle-757-…` et `sentinelle-758-…` (rouges avant, vertes après, break-testées).
    // Les `expect` ci-dessous portent les valeurs d'APRÈS ; l'état d'avant est décrit dans le rapport.

    it('CONSTAT 1 (corrigé, #757) · le texte Léa dit « Note finale : 63.5 % » — l\'unité une seule fois, pour les trois types', () => {
        // `noteProduction1` porte « 63.5 % » (evaluation-calcul.js l. 1404) ; `_rendreNoteFinale`
        // (evaluation-retroaction.js) le recopie sans y ajouter un second « % » (avant : « 63.5 %% »).
        expect(H.m.ecran.noteAffichee).toBe('63,5\u00A0%');
        expect(H.m.lea.generale).toContain('Note finale : 63,5\u00A0%  |  Niveau : D');
        expect(A.m.lea.generale).toContain('Note finale : 71\u00A0%  |  Niveau : D');
        expect(G.m.lea.generale).toContain('Note finale : 76\u00A0%  |  Niveau : M');
        [H, A, G].forEach(x => expect(x.m.lea.generale).not.toContain('%%'));
    });

    it('CONSTAT 2 (corrigé, #758) · copie enregistrée ou non, le bilan de l\'écran lit l\'historique comme le PDF : la copie n\'est pas sa propre précédente', () => {
        // Avant : `_chargerHistoriqueBilan` n'excluait pas l'évaluation en cours → « depuis 3 productions »
        // avec un seul artefact antérieur, et aucune ligne de progrès dès l'auto-save. Après : la copie
        // que le résolveur #576 retrouve en base est exclue, même prédicat que `lireHistorique` du PDF.
        const attendu = (bilan) => {
            expect(bilan).not.toContain('depuis 3 productions');
            expect(bilan).toContain('Progrès : I → D depuis Analyse 1');
            expect(bilan).toContain('Tu as progressé en Nuance.');
        };
        attendu(H.m.lea.bilan);                   // après enregistrement (l'état normal dès l'auto-save)
        attendu(HF.m.lea.bilan);                  // avant enregistrement
        attendu(H.m.pdf.rangeesBilan.join(' '));  // le PDF, inchangé
    });

    // ── LA CARTE ──────────────────────────────────────────────────────────────

    it('les trois types de grille donnent le MÊME squelette de page de synthèse (sept blocs, même ordre)', () => {
        expect(H.m.pdf.squelette).toEqual(A.m.pdf.squelette);
        expect(H.m.pdf.squelette).toEqual(G.m.pdf.squelette);
        expect(H.m.pdf.squelette).toEqual([
            'en-tête (élève, cours, artefact, grille, barre du trimestre)',
            'ruban objectif / tâche / contexte',
            'rétroaction par critère',
            'niveau général',
            'tampons + erreurs annotées',
            'bilan',
            'pied (enseignant · cours · licence)'
        ]);
    });

    it('le commentaire par critère du PDF est le texte GELÉ à l\'enregistrement ; celui du texte Léa est le texte VIVANT de la cartouche', () => {
        const critH = H.blocs.find(b => roleDuBloc(b) === 'rétroaction par critère').texte;
        expect(critH).toContain('GELÉ h1_D');
        expect(critH).not.toContain('VIVANT h1_D');
        expect(H.m.lea.generale).toContain('VIVANT h1_D');
        expect(H.m.lea.generale).not.toContain('GELÉ h1_D');
    });

    it('le texte libre de l\'enseignant (retroactionFinale) n\'est nulle part dans la page de synthèse', () => {
        [H, A, G].forEach(x => expect(x.html).not.toContain('TEXTE-LIBRE'));
    });

    it('analytique : « 56 / 70 » et « 15 / 30 » dans le PDF, dans le texte Léa et dans les deux bilans — jamais le nom du niveau déduit', () => {
        const crit = A.blocs.find(b => roleDuBloc(b) === 'rétroaction par critère').texte;
        expect(crit).toContain('56 / 70');
        expect(crit).toContain('15 / 30');
        expect(crit).not.toMatch(/Maîtrisé|Insuffisant/);
        expect(A.m.lea.generale).toContain('Critère 1 (Contenu) — 56 / 70');
        expect(A.m.lea.generale).toContain('Critère 2 (Langue) — 15 / 30');
        expect(A.m.pdf.rangeesBilan.join(' ')).toContain('15 / 30');
        expect(A.m.lea.bilan).toContain('15 / 30');
    });

    it('algorithmique : la ligne de calcul « 12 erreurs sur 600 mots » et les codes de la GRILLE (pas les dix codes de repli)', () => {
        const crit = G.blocs.find(b => roleDuBloc(b) === 'rétroaction par critère').texte;
        expect(crit).toContain('12 erreurs sur 600 mots');
        const err = G.blocs.find(b => roleDuBloc(b) === 'tampons + erreurs annotées').texte;
        expect(err).toContain('Syntaxe');
        expect(err).toContain('CODE-1');
        const errH = H.blocs.find(b => roleDuBloc(b) === 'tampons + erreurs annotées').texte;
        expect(errH).toContain('Construction syntaxique');   // repli : les dix codes d'hier
    });

    it('CONSTAT 3 (corrigé, #759) · le texte copié garde ses phrases séparées : un saut de ligne entre deux blocs, comme à l\'écran', () => {
        // Le bilan de l'écran est assemblé sans blanc entre ses balises : son textContent colle
        // toujours la fin d'une phrase au début de la suivante. Le presse-papier, lui, ne le reçoit plus.
        expect(H.m.lea.bilan).toContain('viens me voir.Selon toi');
        expect(H.m.lea.tout).not.toContain('viens me voir.Selon toi');
        expect(H.m.lea.tout).toContain('viens me voir.\nSelon toi');
        expect(H.m.lea.tout).not.toContain('Insuffisant)Acquis');
        expect(H.m.lea.tout).toContain('=== RÉTROACTION GÉNÉRALE ===');
        expect(H.m.lea.tout).toContain('=== RÉTROACTION SPÉCIFIQUE ===');
        expect(H.m.lea.tout).toContain('=== BILAN ===');
    });

    it('CONSTAT 4 (corrigé, #760) · le bloc « --- Observations --- » du texte Léa liste les tampons du catalogue courant, comme la spécifique', () => {
        [H, A, G].forEach(x => {
            expect(x.m.lea.generale).toContain('--- Observations ---\n\nAction\nLiaison (×1) :');
            expect(x.m.lea.generale).toContain('Observations\nId. directrice (×2) :\nL\'idée directrice n\'est pas adéquatement identifiée.');
            expect(x.m.lea.generale).toContain('--- Langue ---');
            // Le PDF de synthèse lit le même lecteur : mêmes catégories, dans l'ordre des réglages.
            const pdf = x.blocs.find(bl => roleDuBloc(bl) === 'tampons + erreurs annotées').texte;
            const rangs = ['Liaison', 'Relationnel', 'Id. directrice'].map(n => pdf.indexOf(n));
            expect(rangs.every(r => r !== -1)).toBe(true);
            expect(rangs).toEqual([...rangs].sort((u, v) => u - v));
        });
    });
});
