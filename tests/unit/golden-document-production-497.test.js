import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Golden master #497 (25 août 2026) — LE DOCUMENT DE CONSIGNES NE BOUGE PAS
// D'UN OCTET PENDANT QU'ON RÉORGANISE SA FABRICATION.
//
// Le fil : `genererApercuCombine` (HTML) et `genererPDFCombine` (jsPDF)
// construisent DEUX FOIS le même document, chacun avec sa mise en page. C'est
// pour ça que l'aperçu et le PDF ne se ressemblent pas, et c'est ce que
// l'étape 2 du plan vient corriger — en extrayant un MODÈLE unique dont les
// deux rendeurs se servent.
//
// ⚠ Un refactoring d'extraction est censé être un NO-OP. Ce golden est ce qui
// le prouve : si la sortie change d'un caractère pendant l'extraction, c'est
// que le refactoring a modifié le document, et il faut savoir POURQUOI avant
// de continuer. Une fois l'étape 2 close, il devient le témoin des étapes 3 et
// 4, qui elles changeront le document DÉLIBÉRÉMENT — et il faudra alors le
// refiger, en le disant.
//
// Régénérer : GOLDEN_DOC=1 npx vitest run unit/golden-document-production-497

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOSSIER = path.resolve(__dirname, '..', 'fixtures', 'golden-document-production');
const REGENERER = process.env.GOLDEN_DOC === '1';

/* ------------------------------------------------------------------ harnais */

function elementEchappant() {
    let texte = '';
    return {
        set textContent(v) { texte = v == null ? '' : String(v); },
        get textContent() { return texte; },
        set innerHTML(v) { texte = v == null ? '' : String(v); },
        get innerHTML() {
            return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },
        style: {}, classList: { add() {}, remove() {}, contains: () => false },
        setAttribute() {}, appendChild() {}, addEventListener() {}
    };
}

// Une production réelle de Grégoire, réduite mais fidèle de forme : un détail
// de tâche long (c'est lui qui écrase les colonnes), une grille à trois
// critères, une échelle IDME, une cartouche avec contexte et commentaires.
const GRILLE = {
    id: 'GR_1', nom: 'Grille-4 A26',
    criteres: [
        { nom: 'Structure', description: 'Organisation des traces', ponderation: 25 },
        { nom: 'Rigueur', description: 'Application des stratégies', ponderation: 25 },
        { nom: 'Plausibilité', description: 'Cohérence de l\'hypothèse', ponderation: 50 }
    ]
};
const ECHELLE = {
    id: 'ECH_1', nom: '0-IDME',
    config: { seuilReussite: 60 },
    niveaux: [
        { code: 'E', nom: 'Expert', description: 'Maîtrise assurée', min: 90, max: 100 },
        { code: 'M', nom: 'Maîtrise', description: 'Maîtrise établie', min: 70, max: 89 },
        { code: 'D', nom: 'Développement', description: 'En progression', min: 60, max: 69 },
        { code: 'I', nom: 'Initial', description: 'Amorce', min: 0, max: 59 }
    ]
};
const CARTOUCHE = {
    id: 'CART_1', nom: 'Stratégies de lecture',
    contexte: 'Cet exercice nous offre la possibilité de voir comment tu adoptes les postures descriptive et analytique devant un texte littéraire.',
    commentaires: {
        'Structure_E': 'Tes stratégies sont parfaitement identifiées et ton système d\'annotation est sophistiqué.',
        'Structure_M': 'Tes stratégies sont identifiées et ton système d\'annotation est fonctionnel.',
        'Rigueur_E': 'Tes stratégies sont appliquées de manière approfondie et systématique.'
    }
};
const PRODUCTION = {
    id: 'PROD_A1', titre: 'Artefact 1',
    activiteApprentissage: 'Appliquer des stratégies de lecture variées (Madawigouche)',
    objectif: 'Développer ta capacité à choisir les stratégies de lecture qu\'appelle un texte donné, plutôt que de les appliquer au hasard.',
    tache: 'Annoter le chapitre « Madawigouche » de Rivières-aux-Cartouches en y appliquant au moins trois stratégies de lecture, puis formuler une première hypothèse d\'objectif de communication.',
    detailTache: 'Une stratégie de lecture te fait regarder le texte sous un angle précis. En en appliquant plusieurs, tu vois des choses qu\'une simple lecture ne montre pas.\n\n1. Lis et annote l\'extrait. Applique au moins trois stratégies de lecture différentes, choisies parmi les quinze du Manuel. Laisse des traces visibles directement sur le texte imprimé.\n\n2. Identifie chaque stratégie utilisée. Écris le nom de la stratégie en haut de la page. Utilise un système de couleurs et de symboles constant.',
    dateEcheance: '2026-09-15'
};

const INFOS_COURS = { sigle: '601-101-MQ', titre: 'Écriture et littérature', sigleTitre: '601-101-MQ Écriture et littérature' };

function charger() {
    // ⚠ `trimestres` n'est PAS namespacée : `obtenirNomTrimestre` la lit nue.
    // La fixture disait `a2026_trimestres` — le trimestre sortait vide, et le
    // golden figeait un document amputé de sa troisième ligne d'en-tête.
    const store = { 'trimestres': [{ id: 'a2026', nom: 'Automne 2026', actif: true }] };
    return chargerScript('js/export-pdf.js', {
        db: {
            get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t),
        toggleDisplay: () => {},
        alert: () => {},
        document: {
            getElementById: () => null, querySelector: () => null,
            querySelectorAll: () => [], addEventListener() {},
            createElement: () => elementEchappant()
        }
    });
}

// Les combinaisons qui comptent : les trois crans du plan, portrait et paysage.
const CAS = [
    { nom: 'consignes-seules', cartouche: null, options: {
        production: PRODUCTION, inclureNomProduction: true, inclureObjectif: true,
        inclureDescription: true, inclureDetailTache: true, inclureDescCriteres: false,
        orientation: 'portrait', infosCours: INFOS_COURS } },
    { nom: 'consignes-et-evaluation', cartouche: null, options: {
        production: PRODUCTION, inclureNomProduction: true, inclureObjectif: true,
        inclureDescription: true, inclureDetailTache: true, inclureDescCriteres: true,
        orientation: 'portrait', infosCours: INFOS_COURS } },
    { nom: 'document-complet', cartouche: CARTOUCHE, options: {
        production: PRODUCTION, inclureNomProduction: true, inclureObjectif: true,
        inclureDescription: true, inclureDetailTache: true, inclureDescCriteres: true,
        orientation: 'paysage', infosCours: INFOS_COURS } },
    { nom: 'grille-seule', cartouche: null, options: {
        production: null, orientation: 'portrait', infosCours: INFOS_COURS } },
    // #497 étape 4 — la disposition du Manuel : bandeaux et deux colonnes.
    { nom: 'deux-colonnes-consignes', cartouche: null, options: {
        production: PRODUCTION, inclureNomProduction: true, inclureObjectif: true,
        inclureDescription: true, inclureDetailTache: true,
        disposition: 'deux-colonnes', cran: 'consignes',
        orientation: 'portrait', infosCours: INFOS_COURS } },
    { nom: 'deux-colonnes-complet', cartouche: CARTOUCHE, options: {
        production: PRODUCTION, inclureNomProduction: true, inclureObjectif: true,
        inclureDescription: true, inclureDetailTache: true, inclureDescCriteres: true,
        disposition: 'deux-colonnes',
        orientation: 'portrait', infosCours: INFOS_COURS } }
];

describe('Golden master #497 · le document de consignes ne bouge pas d\'un octet', () => {
    const win = charger();

    for (const cas of CAS) {
        it(`${cas.nom} — identique à la référence`, () => {
            const rendu = win.genererApercuCombine(GRILLE, ECHELLE, cas.cartouche, cas.options);
            const fichier = path.join(DOSSIER, `${cas.nom}.html`);

            if (REGENERER || !existsSync(fichier)) {
                writeFileSync(fichier, rendu, 'utf8');
                expect(existsSync(fichier), 'référence créée — relancer sans GOLDEN_DOC').toBe(true);
                return;
            }
            expect(rendu).toBe(readFileSync(fichier, 'utf8'));
        });
    }

    it('la disposition deux colonnes porte bien ses bandeaux', () => {
        const rendu = win.genererApercuCombine(GRILLE, ECHELLE, null, CAS[4].options);
        expect(rendu, 'un bandeau par bloc').toContain('text-transform: uppercase');
        expect(rendu, 'et deux colonnes').toContain('display: flex');
        // Le titre du bandeau perd son deux-points : « TÂCHE », pas « TÂCHE : ».
        expect(rendu).toContain('>Objectif d\'apprentissage<');
    });

    it('la référence dit vraiment quelque chose (un golden vide ne garde rien)', () => {
        const rendu = win.genererApercuCombine(GRILLE, ECHELLE, CARTOUCHE, CAS[2].options);
        expect(rendu.length).toBeGreaterThan(1500);
        expect(rendu).toContain('Artefact 1');
        expect(rendu).toContain('Plausibilité');
        expect(rendu).toContain('Maîtrise');
    });
});
