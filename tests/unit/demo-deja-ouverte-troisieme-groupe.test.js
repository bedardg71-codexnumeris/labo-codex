/**
 * LA DÉMO DÉJÀ OUVERTE REÇOIT LE TROISIÈME GROUPE (publication des parcours, 23 nov. 2026, point 4 de la consigne)
 *
 * Décision de Cowork, règle de Grégoire (jamais d'effacement irréversible) : la version du pack reste 21.3. Une démo
 * installée avant le troisième groupe garde tout ce qu'on y a fait, et reçoit le SEUL bloc `groupeParStandards` quand il
 * lui manque (`verserGroupeParStandardsSiAbsent`, js/demo-namespace.js, appelé par `initialiserDemoNamespace`).
 *
 *   A. une démo d'avant (le pack sans le troisième groupe), avec un deuxième groupe monté et des retouches : chaque item
 *      déjà là reste identique, aucune clé ne part, rien ne s'écrit hors de `demo_*` ; le troisième groupe arrive entier
 *      (son cours, son horaire, son groupe-cours, ses dix personnes, ses deux productions, sa pratique, son échelle, ses
 *      cibles, ses inscriptions de départ), marqué `isDemo`, sans l'histoire de Marmotte Pétillante ; un second
 *      chargement n'écrit plus rien ;
 *   B. la démo ouverte au chargement : son cours rejoint aussi `cours`, sans remplacer un cours de même id ;
 *   C. le troisième groupe déjà là (même amputé d'une personne par la démo) : rien ne s'écrit ; une démo jamais installée :
 *      rien non plus (`peuplerNamespace` la versera entière, plus loin dans `initialiserDemoNamespace`).
 *
 * Modules RÉELS : demo-namespace.js, pack-demo-10.js.
 *
 * BREAK-TESTS (23 nov. 2026), chacun rouge puis remis à l'identique :
 *   BT1. l'appel retiré d'`initialiserDemoNamespace` → A (le troisième groupe n'arrive pas) et B rouges.
 *   BT2. `ajouterSansRemplacer` écrit `items` à la place de la liste (la clé réécrite) → A (les items d'avant) rouge.
 *   BT3. la garde « GC_DEMO_STD déjà là » retirée → C (la personne retirée revient) rouge.
 *   BT4. la branche `demo-actif` retirée → B rouge.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const PACK = chargerScript('js/pack-demo-10.js').PACK_DEMARRAGE;

/** Le pack tel qu'il était avant le troisième groupe : ni bloc, ni son cours dans `listeCours`. */
function packDAvant() {
    const p = clone(PACK);
    const coursStd = p.groupeParStandards.groupeCours.coursId;
    delete p.groupeParStandards;
    p.listeCours = p.listeCours.filter(c => c.id !== coursStd);
    return p;
}

function magasin(initial, versionInstallee) {
    const store = clone(initial || {});
    const ecrites = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { ecrites.push(k); store[k] = clone(v); },
        removeSync: (k) => { throw new Error('aucune clé retirée attendue : ' + k); },
        keys: async () => Object.keys(store)
    };
    const localStorage = { getItem: (k) => (k === 'demo-version-installee' ? versionInstallee : null), setItem: () => {} };
    return { store, ecrites, db, localStorage };
}

/** Une démo installée par le pack d'avant, puis vécue : un deuxième groupe monté, une retouche d'un item du pack. */
async function demoDAvantVecue() {
    const m = magasin({}, null);
    const win = chargerScript('js/demo-namespace.js', { db: m.db, PACK_DEMARRAGE: packDAvant(), localStorage: m.localStorage });
    await win.reinstallerDemoDuPack();
    const s = m.store;
    s.demo_groupesCours.push({ id: 'GC_MONTE', coursId: 'COURS_MONTE', groupeNum: '00002', horaireId: 'HOR_MONTE', pratiqueId: 'demo-std-litt' });
    s.demo_horaires.push({ id: 'HOR_MONTE', nom: 'Mar-AM / Ven-AM' });
    s.demo_listeCours.push({ id: 'COURS_MONTE', sigle: '601-999-DM', isDemo: true, creeEnDemonstration: true });
    for (let i = 1; i <= 10; i++) s.demo_groupeEtudiants.push({ id: 9900000 + i, da: '99000' + String(i).padStart(2, '0'), groupe: '00002', coursId: 'COURS_MONTE' });
    s.demo_productions.push({ id: 'PROD_MONTEE', titre: 'Une production de la personne', coursId: 'COURS_MONTE' });
    s.demo_grillesTemplates.push({ id: 'GRILLE_MONTEE', nom: 'Sa grille' });
    s.demo_evaluationsSauvegardees.push({ id: 'EVAL_MONTEE', productionId: 'PROD_MONTEE', da: '9900001' });
    s.demo_groupeEtudiants[0].nom = 'Retouché dans la démo';
    s.hors_demo = { garde: true };
    return s;
}

async function chargerLaDemo(storeInitial, { actif = false } = {}) {
    const init = clone(storeInitial);
    if (actif) init['demo-actif'] = 'true';
    const m = magasin(init, PACK._metadata.version);
    const win = chargerScript('js/demo-namespace.js', { db: m.db, PACK_DEMARRAGE: PACK, localStorage: m.localStorage });
    await win.initialiserDemoNamespace();
    return m;
}

describe('A · une démo d\'avant, vécue : tout reste, le troisième groupe arrive', () => {
    it('chaque item déjà là est identique, à sa place ; aucune clé ne part ; rien hors de demo_*', async () => {
        const avant = await demoDAvantVecue();
        const m = await chargerLaDemo(avant);
        expect(Object.keys(m.store).filter(k => !(k in avant)).every(k => k.indexOf('demo_') === 0)).toBe(true);
        for (const k of Object.keys(avant)) {
            expect(k in m.store, k).toBe(true);
            if (Array.isArray(avant[k])) expect(m.store[k].slice(0, avant[k].length), k).toEqual(avant[k]);
            else expect(m.store[k], k).toEqual(avant[k]);
        }
        expect(m.ecrites.filter(k => k.indexOf('demo_') !== 0)).toEqual([]);
        expect(m.store.hors_demo).toEqual({ garde: true });
    });

    it('le troisième groupe entier, marqué isDemo ; l\'histoire de Marmotte Pétillante n\'y est pas', async () => {
        const m = await chargerLaDemo(await demoDAvantVecue());
        const s = m.store, ajoutes = (k, filtre) => s[k].filter(filtre);
        expect(s.demo_groupesCours.map(g => g.id)).toEqual(['GC_DEMO', 'GC_MONTE', 'GC_DEMO_STD']);
        expect(s.demo_horaires.map(h => h.id)).toEqual(['HOR_DEMO', 'HOR_MONTE', 'HOR_DEMO_STD']);
        expect(s.demo_listeCours.map(c => c.id)).toEqual(['demo-cours', 'COURS_MONTE', 'demo-cours-std']);
        const dix = ajoutes('demo_groupeEtudiants', e => e.coursId === 'demo-cours-std');
        expect(dix.map(e => e.da)).toEqual(PACK.groupeParStandards.groupeEtudiants.map(e => e.da));
        expect(ajoutes('demo_productions', p => p.coursId === 'demo-cours-std').map(p => p.id)).toEqual(['PROD_DEMO_STD_DEUXRIVES', 'PROD_DEMO_STD_MARINE']);
        expect(s.demo_pratiquesConfigurables.map(p => p.id)).toContain('demo-cib-litt');
        expect(s.demo_echellesTemplates.map(e => e.id)).toContain('ECH_DEMO_STD');
        expect(s.demo_ensemblesCibles.map(e => e.id)).toEqual(['ENSC_DEMO_STD']);
        expect(s.demo_inscriptionsCibles).toHaveLength(PACK.groupeParStandards.inscriptions.length);
        const verses = [...s.demo_groupesCours.slice(-1), ...s.demo_horaires.slice(-1), ...s.demo_listeCours.slice(-1), ...dix, ...s.demo_inscriptionsCibles];
        expect(verses.every(x => x.isDemo === true)).toBe(true);
        expect(JSON.stringify(s)).not.toContain('Relève bien les procédés');
    });

    it('idempotent : un second chargement n\'écrit plus rien', async () => {
        const premier = await chargerLaDemo(await demoDAvantVecue());
        const second = await chargerLaDemo(premier.store);
        expect(second.ecrites).toEqual([]);
        expect(second.store).toEqual(premier.store);
    });
});

describe('B · la démo ouverte au chargement : le cours rejoint aussi `cours`, comme à l\'entrée', () => {
    it('`cours` reçoit le cours du troisième groupe (isDemo) ; `listeCours`, clé d\'héritage, n\'est pas touchée', async () => {
        const avant = await demoDAvantVecue();
        avant.cours = [{ id: 'demo-cours', isDemo: true }];
        const m = await chargerLaDemo(avant, { actif: true });
        expect(m.store.cours.map(c => [c.id, c.isDemo])).toEqual([['demo-cours', true], ['demo-cours-std', true]]);
        expect(m.store.cours[0]).toEqual(avant.cours[0]);
        expect('listeCours' in m.store).toBe(false);
    });

    it('un cours de même id, déjà dans `cours`, n\'est pas remplacé', async () => {
        const avant = await demoDAvantVecue();
        avant.cours = [{ id: 'demo-cours', isDemo: true }, { id: 'demo-cours-std', titre: 'Un cours de la personne' }];
        const m = await chargerLaDemo(avant, { actif: true });
        expect(m.store.cours).toEqual(avant.cours);
    });

    it('la démo fermée : les globaux ne sont pas touchés', async () => {
        const avant = await demoDAvantVecue();
        avant.cours = [{ id: 'c-reel' }];
        const m = await chargerLaDemo(avant);
        expect(m.store.cours).toEqual([{ id: 'c-reel' }]);
        expect('listeCours' in m.store).toBe(false);
    });
});

describe('C · rien à verser', () => {
    it('le troisième groupe déjà là, même amputé d\'une personne dans la démo : rien ne s\'écrit', async () => {
        const m0 = magasin({}, null);
        const win = chargerScript('js/demo-namespace.js', { db: m0.db, PACK_DEMARRAGE: PACK, localStorage: m0.localStorage });
        await win.reinstallerDemoDuPack();
        m0.store.demo_groupeEtudiants = m0.store.demo_groupeEtudiants.filter(e => e.da !== '9700010');
        const m = await chargerLaDemo(m0.store);
        expect(m.ecrites).toEqual([]);
        expect(m.store.demo_groupeEtudiants.some(e => e.da === '9700010'), 'la personne retirée ne revient pas').toBe(false);
    });

    it('une démo jamais installée : la fonction ne verse rien (peuplerNamespace s\'en charge)', async () => {
        const m = magasin({}, null);
        const win = chargerScript('js/demo-namespace.js', { db: m.db, PACK_DEMARRAGE: PACK, localStorage: m.localStorage });
        const r = await win.verserGroupeParStandardsSiAbsent();
        expect(r).toBe(false);
        expect(m.ecrites).toEqual([]);
    });
});
