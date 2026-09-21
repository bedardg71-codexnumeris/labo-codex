import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// SENTINELLE #762 (volet bouton) — « APPLIQUER AU COURS ACTIF » ASSIGNE LA PRATIQUE AU GROUPE-COURS.
//
// Rapport de Grégoire, 6 septembre 2026, 7 h 48 : sa PAN-STD « est bien configurée et activée »,
// et pourtant `groupesCours[].pratiqueId` vaut `null` (console), le champ 6 du groupe-cours est
// vide, aucun badge « Active ». Le bouton « Appliquer au cours actif » (Conception › Pratiques,
// infobulle : « Définit cette pratique comme configuration active du cours. Conditionne tous les
// calculs de notes et d'indices ») appelle `appliquerPratiqueAuCours` → `appliquerConfigurationPratique`,
// qui n'écrit que les modalités (portfolio, variante) et porte ce commentaire depuis #328
// (e3179c41, 11 juin 2026) : « appliquer une config ne change pas la pratique active du
// groupe-cours, seule l'activation par la SSOT le fait ». Or l'activation par la SSOT n'avait plus
// de bouton : les cartes « Activer » vivaient dans `#listePratiques`, retiré de la page le
// 9 décembre 2025. Succès affiché, rien d'assigné, l'application calcule en « sommative » et le
// profil dit « introuvable ».
//
// ⮕ Le bouton fait ce qu'il dit : après les modalités, `PratiqueManager.changerPratiqueActive`
// écrit la source de vérité (`groupesCours[].pratiqueId`), la barre latérale de Conception ›
// Pratiques marque « Active », et la notification dit ce qui calcule maintenant.
// Modules RÉELS : pratiques-gestion.js, pratique-manager.js, pratique-registre.js et
// pratique-configurable.js — la vraie classe, pas une doublure : c'est elle qui, dans la page,
// levait après l'écriture (`chargerPratiqueActive` instanciait `pratiqueData.config`, absent d'une
// pratique écrite par l'assistant, qui range tout sous `configuration`), et « Appliquer » sortait
// sur une alerte sans rendre la barre — trouvé par la porte WebKit, le sandbox à doublure restant
// vert. Doublures nommées : `appliquerConfigurationPratique` (rend vrai — les modalités ne sont
// pas l'objet), `BibliothequeUI` (deux filtres identité), `obtenirPratiqueActiveGroupeCours`
// (miroir de la règle de modes.js : le `pratiqueId` du groupe-cours actif, sinon « sommative »).

const GC_ID = 'GC_1786388814118_2_3068cb8e2a5b';
const PAN_STD = { id: 'pratique_1787056354696_6_21166f8ca720', nom: 'PAN-SDT-Litt A26', type: 'standards', dansBibliotheque: true,
    configuration: { echelleId: 'ECH_1', varianteCalcul: 'n-meilleurs', portfolio: { nombreARetenir: 4 } } };
const MODELE_SOM = { id: 'pratique_1788364991518_1_f79a585f3c32', nom: 'Modèle sommatif', type: 'sommative', dansBibliotheque: true, configuration: {} };

function monter({ avecGroupeCours = true } = {}) {
    const store = {
        test_groupesCours: avecGroupeCours ? [{ id: GC_ID, groupeNum: '00007', coursId: 'h2026-601-101-MQ-00001', pratiqueId: null }] : [],
        test_pratiquesConfigurables: [PAN_STD, MODELE_SOM],
        // L'échelle que la PAN-STD référence (`construireConfigComplete` la résout par id).
        echellesTemplates: [{ id: 'ECH_1', nom: 'IDME', niveaux: [{ code: 'I', nom: 'I', min: 0, max: 64, valeurCalcul: 40 }, { code: 'M', nom: 'M', min: 65, max: 100, valeurCalcul: 80 }] }]
    };
    if (avecGroupeCours) store.groupeCoursActif = { id: GC_ID };
    const ecritures = [];
    const notifs = [];
    const alertes = [];
    const sidebar = { innerHTML: '' };
    const db = {
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); ecritures.push(k); },
        get: async () => null, set: async () => {}
    };
    // Miroir de la règle de modes.js (`lirePointeurPratiqueGroupeCours`) : la SSOT, AUCUN repli (lot N1b,
    // 21 sept. 2026 — avant : « sommative »). La barre latérale lit l'id que rend LA désignation du VRAI registre.
    const pratiqueActive = () => {
        const g = store.groupeCoursActif; const gcs = store.test_groupesCours || [];
        const gc = g ? gcs.find(x => x.id === g.id) : null;
        return gc ? (gc.pratiqueId || null) : null;
    };
    // Le registre lit `window.lirePointeurPratiqueGroupeCours` (pas le nom nu) : le miroir est posé
    // sur les deux, comme dans la page. Sans lui sur `window`, `chargerPratiqueActive` sort avant
    // d'instancier quoi que ce soit — et le banc resterait vert pour la mauvaise raison.
    const win = { addEventListener() {}, removeEventListener() {}, lirePointeurPratiqueGroupeCours: pratiqueActive };
    const globaux = {
        db, cle: (k) => 'test_' + k,
        document: { getElementById: (id) => (id === 'sidebarListePratiques' ? sidebar : null), querySelector: () => null, querySelectorAll: () => [],
            addEventListener() {}, removeEventListener() {}, createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {} }),
            body: { appendChild() {}, classList: { add() {}, remove() {} } } },
        notifications: { succes: (t, m) => notifs.push({ type: 'succes', t, m }), erreur: (t, m) => notifs.push({ type: 'erreur', t, m }), info() {}, warning() {} },
        alert: (m) => alertes.push(m), confirm: () => true,
        echapperHtml: (s) => String(s == null ? '' : s),
        appliquerConfigurationPratique: async () => true,
        lirePointeurPratiqueGroupeCours: pratiqueActive,
        // Le nom nu que lit pratiques-gestion.js, renvoyé au VRAI registre chargé plus bas (résolu à l'appel).
        obtenirIdPratiqueActive: () => win.obtenirIdPratiqueActive(),
        normaliserIdPratique: (t) => t,
        BibliothequeUI: { filtrerParMaquette: (l) => l, filtrerParModeDemo: (l) => l, ajouterOptgroupDemo() {}, forgerInspireDe: () => ({}) },
        obtenirCodePratique: () => 'STD', obtenirCouleurPratique: () => '', obtenirLabelFamillePratique: () => 'PAN'
    };
    chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
    globaux.PratiqueConfigurable = win.PratiqueConfigurable;
    chargerScript('js/pratiques/pratique-registre.js', globaux, win);
    chargerScript('js/pratiques/pratique-manager.js', globaux, win);
    globaux.PratiqueManager = win.PratiqueManager;
    chargerScript('js/pratiques-gestion.js', globaux, win);
    return { win, store, ecritures, notifs, alertes, sidebar };
}

describe('#762 · « Appliquer au cours actif » assigne la pratique au groupe-cours actif', () => {

    it('les données de Grégoire : après le bouton, groupesCours[0].pratiqueId = la PAN-STD, et le succès le dit', async () => {
        const { win, store, notifs, alertes } = monter();
        expect(store.test_groupesCours[0].pratiqueId).toBeNull();
        await win.appliquerPratiqueAuCours(PAN_STD.id);
        expect(store.test_groupesCours[0].pratiqueId, 'avant : restait null (seules les modalités étaient écrites)').toBe(PAN_STD.id);
        expect(store.groupeCoursActif.pratiqueId).toBe(PAN_STD.id);
        expect(alertes).toEqual([]);
        expect(notifs.filter(n => n.type === 'succes')).toHaveLength(1);
        expect(notifs[0].t + ' ' + (notifs[0].m || '')).toMatch(/cours actif/);
    });

    it('la barre latérale de Conception › Pratiques marque « Active » sur la pratique assignée, et sur elle seule', async () => {
        const { win, sidebar } = monter();
        await win.afficherListePratiquesMateriel();
        expect(sidebar.innerHTML, 'avant tout : aucune pratique assignée, aucun badge').not.toContain('>Active<');
        await win.appliquerPratiqueAuCours(PAN_STD.id);
        const items = sidebar.innerHTML.split('<div class="sidebar-item"').slice(1);
        const actives = items.filter(i => i.includes('>Active<'));
        expect(actives).toHaveLength(1);
        expect(actives[0]).toContain(PAN_STD.id);
        // La couleur d'un ÉTAT, pas d'une caractéristique (demande de Grégoire, 6 sept.) : la
        // classe est posée, ET la feuille de style la définit (règle 8.1 : un banc vert peut
        // couvrir un écran cassé — une classe jamais définie ne se voit qu'au grep).
        expect(actives[0]).toMatch(/class="sidebar-item-badge badge-pratique-active"/);
        const css = readFileSync(path.join(RACINE, 'styles.css'), 'utf8');
        expect(css).toMatch(/\.sidebar-item-badge\.badge-pratique-active\s*\{/);
    });

    it('sans groupe-cours actif : rien n\'est assigné et l\'enseignant l\'apprend (pas un succès)', async () => {
        const { win, alertes, notifs } = monter({ avecGroupeCours: false });
        await win.appliquerPratiqueAuCours(PAN_STD.id);
        expect(alertes.length + notifs.filter(n => n.type === 'erreur').length).toBeGreaterThanOrEqual(1);
        expect(notifs.filter(n => n.type === 'succes')).toHaveLength(0);
    });
});
