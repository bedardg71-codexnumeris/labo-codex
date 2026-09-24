/**
 * #760 (24 sept. 2026) — Ce que l'élève lit de ses tampons : UN seul lecteur,
 * `travauxOutils.observationsDesTampons`, sur les RÉGLAGES ACTUELS de l'utilisateur.
 *
 * Décisions de Grégoire (24 sept., matin) :
 *  1. le bloc « Observations » de la rétroaction générale montre les mêmes tampons que
 *     la spécifique : mêmes tampons, même ordre, mêmes titres de catégorie, nombre et texte ;
 *  2. « les observations doivent reposer sur les paramètres actualisés de l'utilisateur ».
 * Décidé par Cowork (technique) : un ancien tampon posé n'est jamais tu ; les jetons
 * n'y paraissent pas ; clé de texte ABSENTE → défaut, clé PRÉSENTE (même vide) → choix.
 *
 * Le module est le VRAI `travaux-outils.js`, chargé sur un `db` en mémoire.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerTravauxOutilsReel } from './_helpers/travaux-outils-reel.js';

const DEFAUT_HOC = "L'idée directrice n'est pas adéquatement identifiée.";
const DEFAUT_SOUPCON = "Il y a un soupçon d'utilisation non permise de l'intelligence artificielle.";

function lire(reglages, comptes) {
    return chargerTravauxOutilsReel(reglages).travauxOutils.observationsDesTampons(comptes);
}
const tampon = (cats, id) => cats.reduce((acc, c) => acc.concat(c.tampons), []).find(t => t.id === id);

describe('#760 · observationsDesTampons — le seul lecteur des tampons d\'une copie', () => {
    it('un tampon du catalogue courant est compté, avec son nom, son texte par défaut et sa catégorie', () => {
        const cats = lire({}, { 'obs-hoc': 2, 'obs-soupcon': 1 });
        expect(cats).toEqual([{ id: 'observations', nom: 'Observations', tampons: [
            { id: 'obs-hoc', nom: 'Id. directrice', texte: DEFAUT_HOC, nombre: 2 },
            { id: 'obs-soupcon', nom: 'Soupçon IA', texte: DEFAUT_SOUPCON, nombre: 1 }
        ] }]);
    });

    it('un tampon personnel, dans une catégorie personnelle, porte le nom et le texte de l\'utilisateur', () => {
        const cats = lire({
            tamponsPersonnalises: [{ id: 'custom-1', nom: 'Belle image', categorie: 'cat-perso' }],
            categoriesPerso: [{ id: 'cat-perso', nom: 'Style' }],
            retroactionsObservations: { 'custom-1': 'Ton image est frappante.' }
        }, { 'custom-1': 3 });
        expect(cats).toEqual([{ id: 'cat-perso', nom: 'Style', tampons: [
            { id: 'custom-1', nom: 'Belle image', texte: 'Ton image est frappante.', nombre: 3 }
        ] }]);
    });

    it('le nom personnalisé d\'un tampon du catalogue et le nom personnalisé d\'une catégorie l\'emportent', () => {
        const cats = lire({
            personnalisationObservations: { 'obs-hoc': { nom: 'Thèse' } },
            nomsCategoriesTampons: { observations: 'Remarques' }
        }, { 'obs-hoc': 1 });
        expect(cats[0].nom).toBe('Remarques');
        expect(cats[0].tampons[0].nom).toBe('Thèse');
    });

    it('texte réglé → le texte de l\'utilisateur ; texte jamais réglé (clé absente) → le texte par défaut', () => {
        // Objet enregistré AVANT l'ajout de « Soupçon IA » : il n'a pas sa clé.
        const cats = lire({ retroactionsObservations: { 'obs-hoc': 'Ta thèse manque.' } }, { 'obs-hoc': 1, 'obs-soupcon': 1 });
        expect(tampon(cats, 'obs-hoc').texte).toBe('Ta thèse manque.');
        expect(tampon(cats, 'obs-soupcon').texte).toBe(DEFAUT_SOUPCON);
    });

    it('texte réglé VIDE → rien d\'inventé, et le tampon reste listé', () => {
        const cats = lire({ retroactionsObservations: { 'obs-hoc': '' } }, { 'obs-hoc': 1 });
        expect(tampon(cats, 'obs-hoc')).toEqual({ id: 'obs-hoc', nom: 'Id. directrice', texte: '', nombre: 1 });
    });

    it('un ancien tampon sur une vieille copie n\'est jamais tu (catégorie hors réglages, après les autres)', () => {
        const cats = lire({ retroactionsObservations: { 'bon-lien': 'Bon lien logique.' } }, { 'bon-lien': 1, 'obs-hoc': 1 });
        expect(cats.map(c => c.id)).toEqual(['observations', 'diagnostic']);
        expect(cats[1]).toEqual({ id: 'diagnostic', nom: 'Diagnostic', tampons: [
            { id: 'bon-lien', nom: 'Bon lien', texte: 'Bon lien logique.', nombre: 1 }
        ] });
    });

    it('un tampon personnel supprimé depuis reste listé, sous « Autres tampons »', () => {
        const cats = lire({ personnalisationObservations: { 'custom-9': { nom: 'Ancien perso' } } }, { 'custom-9': 1 });
        expect(cats).toEqual([{ id: 'autres', nom: 'Autres tampons', tampons: [
            { id: 'custom-9', nom: 'Ancien perso', texte: '', nombre: 1 }
        ] }]);
    });

    it('les jetons ne sont pas des observations : absents', () => {
        expect(lire({}, { 'jeton-delai': 1, 'jeton-reprise': 2, 'jeton-reprise-ciblee': 1 })).toEqual([]);
        expect(lire({}, { 'jeton-delai': 1, 'obs-hoc': 1 }).map(c => c.id)).toEqual(['observations']);
    });

    it('l\'ordre des catégories et l\'ordre des tampons dans une catégorie suivent les réglages', () => {
        const comptes = { 'action-liaison': 1, 'obs-hoc': 1, 'obs-soupcon': 1, 'comp-uni': 1 };
        const parDefaut = lire({}, comptes);
        expect(parDefaut.map(c => c.id)).toEqual(['action', 'comprehension', 'observations']);
        expect(parDefaut[2].tampons.map(t => t.id)).toEqual(['obs-hoc', 'obs-soupcon']);   // ordre du catalogue

        const regle = lire({
            ordreCategories: ['observations', 'action', 'comprehension'],
            ordreAutocollants_observations: ['obs-soupcon', 'obs-hoc']
        }, comptes);
        expect(regle.map(c => c.id)).toEqual(['observations', 'action', 'comprehension']);
        expect(regle[0].tampons.map(t => t.id)).toEqual(['obs-soupcon', 'obs-hoc']);
    });

    it('un réglage changé est lu au prochain appel (pas de copie figée au chargement)', () => {
        const { travauxOutils, db } = chargerTravauxOutilsReel({});
        expect(travauxOutils.observationsDesTampons({ 'obs-hoc': 1 })[0].tampons[0].nom).toBe('Id. directrice');
        db.setSync('personnalisationObservations', { 'obs-hoc': { nom: 'Thèse' } });
        db.setSync('tamponsPersonnalises', [{ id: 'custom-2', nom: 'Neuf', categorie: 'observations' }]);
        const cats = travauxOutils.observationsDesTampons({ 'obs-hoc': 1, 'custom-2': 1 });
        expect(cats[0].tampons.map(t => t.nom)).toEqual(['Thèse', 'Neuf']);
    });
});

/* ------------------------------------------------------------------------ */
/* La spécifique : même lecteur, nom et texte échappés (règle 1)             */
/* ------------------------------------------------------------------------ */

function echapperHtmlFidele(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function elementDom() {
    return { innerHTML: '', textContent: '', value: '', classList: { contains: () => false, add() {}, remove() {} } };
}

const copie = { texte: null };

function specifique(reglages, stickers) {
    copie.texte = null;
    // La spécifique n'est pas exportée : on passe par « Copier » de la vue spécifique, qui la régénère.
    const cachee = Object.assign(elementDom(), { classList: { contains: (c) => c === 'u-hide' } });
    const ecran = { contenuRetroSpecifique: elementDom(), vueRetroGenerale: cachee, vueRetroSpecifique: elementDom() };
    const document = { getElementById: (id) => ecran[id] || null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {} };
    const reg = chargerScript('js/evaluation-enonces.js');
    chargerScript('js/codes-annotation.js', { db: { getSync: (k, d) => (d !== undefined ? d : null) }, cle: (k) => 'test_' + k, obtenirDonneesSelonMode: () => [] }, reg);
    const win = { addEventListener() {}, removeEventListener() {}, evaluationEnCours: null,
        enoncesAlgo: reg.enoncesAlgo, codesAnnotation: reg.codesAnnotation };
    chargerScript('js/evaluation-retroaction.js', {
        document, evaluationEnCours: null, echapperHtml: echapperHtmlFidele,
        db: { getSync: (k, d) => (d !== undefined ? d : null) }, cle: (k) => 'test_' + k, obtenirDonneesSelonMode: () => [],
        travauxVisionneuse: { getFichierActuel: () => ({ id: 'F1' }) },
        travauxStockage: { obtenirAnnotationFichier: () => ({ pages: { '1': { stickers, shapes: [] } } }) },
        travauxOutils: chargerTravauxOutilsReel(reglages).travauxOutils,
        navigator: { clipboard: { writeText: (t) => { copie.texte = t; return Promise.resolve(); } } },
        notifications: { succes() {} }, alert() {}
    }, win);
    win.copierRetroaction(1);
    return ecran.contenuRetroSpecifique.innerHTML;
}

describe('#760 · la spécifique lit le même lecteur et échappe ce que l\'utilisateur a écrit', () => {
    it('nom de tampon, nom de catégorie et texte personnels sont échappés dans innerHTML', () => {
        const html = specifique({
            tamponsPersonnalises: [{ id: 'custom-x', nom: '<img src=x onerror=alert(1)>', categorie: 'cat-x' }],
            categoriesPerso: [{ id: 'cat-x', nom: '<b>Style</b>' }],
            retroactionsObservations: { 'custom-x': 'Tu écris « <script> ».' }
        }, [{ autocollantId: 'custom-x' }]);
        expect(html).not.toContain('<img');
        expect(html).not.toContain('<b>');
        expect(html).not.toContain('<script>');
        expect(html).toContain('<h5>&lt;b&gt;Style&lt;/b&gt;</h5>');
        expect(html).toContain('<strong>&lt;img src=x onerror=alert(1)&gt;</strong> (1) — Tu écris « &lt;script&gt; ».');
    });

    it('un texte réglé vide n\'écrit pas de tiret orphelin', () => {
        const html = specifique({ retroactionsObservations: { 'obs-hoc': '' } }, [{ autocollantId: 'obs-hoc' }]);
        expect(html).toContain('<p><strong>Id. directrice</strong> (1)</p>');
    });

    it('#759 · « Copier » rend le texte séparé comme à l\'écran, entités décodées, aucun mot changé', () => {
        specifique({
            tamponsPersonnalises: [{ id: 'custom-y', nom: 'Tom & Jerry', categorie: 'observations' }],
            retroactionsObservations: { 'custom-y': 'Si x < y, dis-le « clairement ».', 'action-liaison': 'Tu relies.' }
        }, [{ autocollantId: 'action-liaison' }, { autocollantId: 'custom-y' }]);
        expect(copie.texte).toBe('Action\nLiaison (1) — Tu relies.\n\nObservations\nTom & Jerry (1) — Si x < y, dis-le « clairement ».');
    });
});
