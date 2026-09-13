/**
 * SENTINELLE #849 / #850 — LE BANDEAU DE VERSION DIT LA VERSION DU CODE CHARGÉ,
 * ET SE TAIT UNE FOIS FERMÉ.
 *
 * #849 — rapport de Grégoire, 13 sept. 2026, 7 h 16 : bandeau « 1.135.0 (Build
 * 0911-2145) », carte « Nouveautés » « 1.139.0 (Build 0912-1259) ». Au
 * chargement, init-inline.js écrasait la version du code chargé par la réponse
 * de version.json — périmée ce matin-là.
 * #850 — `monitorage-build-vu` valait `"0807-1529"`, guillemets compris : db.js
 * réhydrate localStorage depuis IDB en JSON, init-inline.js lisait et écrivait
 * brut. Bandeau à chaque ouverture ; l'écriture de la fermeture était écrasée
 * au démarrage suivant.
 *
 * Harnais : init-inline.js exécuté dans un vm (window = global), DOM réduit au
 * bandeau et à l'entête, `db` simulé par une Map (le stock IDB) dont
 * localStorage porte la copie JSON — l'état qu'on trouve après la réhydratation.
 *
 * Break-tests attendus :
 *  - relire la version depuis version.json au chargement → essai 1 rouge ;
 *  - remettre `data.build !== BUILD_ID` dans le polling → essai 1 rouge ;
 *  - relire localStorage brut dans signalerBuildChargeSiNouveau → essai 3 rouge ;
 *  - écrire localStorage brut dans fermerBandeauMiseAJour → essai 4 rouge.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = readFileSync(path.join(RACINE, 'js', 'init-inline.js'), 'utf8');

function element() {
    const classes = new Set();
    return {
        textContent: '',
        hidden: false,
        classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c) },
        querySelector: () => null,
        addEventListener: () => {}
    };
}

function monter({ version, idb = {}, reponseServeur = null }) {
    const ids = ['bandeau-mise-a-jour', 'bandeau-mise-a-jour-build', 'bandeau-mise-a-jour-texte',
        'bandeau-mise-a-jour-date', 'version-entete', 'build-numero'];
    const dom = Object.fromEntries(ids.map((id) => [id, element()]));
    const stock = new Map(Object.entries(idb));
    const ls = new Map([...stock].map(([k, v]) => [k, JSON.stringify(v)]));
    const ctx = {
        console, Date, JSON, Math, String, Number, Promise, Object, Array, Set, Map,
        localStorage: {
            getItem: (k) => (ls.has(k) ? ls.get(k) : null),
            setItem: (k, v) => { ls.set(k, String(v)); },
            removeItem: (k) => { ls.delete(k); }
        },
        sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, key: () => null, length: 0 },
        location: { protocol: 'https:' },
        document: {
            getElementById: (id) => dom[id] || null,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            body: { prepend() {} }
        },
        setInterval: () => 0,
        setTimeout: () => 0,
        fetch: async () => ({ ok: true, json: async () => reponseServeur }),
        __VERSION__: version,
        db: {
            getSync: (k, d = null) => (stock.has(k) ? stock.get(k) : d),
            setSync: (k, v) => { stock.set(k, v); ls.set(k, JSON.stringify(v)); }
        }
    };
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(SOURCE, ctx);
    return { ctx, dom, stock, ls, run: (code) => vm.runInContext(code, ctx) };
}

const bandeauVisible = (h) => h.dom['bandeau-mise-a-jour'].classList.contains('visible');

describe('#849 · la version affichée est celle du code chargé', () => {
    it('une réponse périmée de version.json n\'écrase ni la version, ni le bandeau', async () => {
        const h = monter({
            version: { beta: '9.9.0', build: '0101-0900' },
            idb: { 'monitorage-build-vu': '0101-0800' },
            reponseServeur: { beta: '9.8.0', build: '0101-0800' }
        });
        await h.run('etablirVersionChargee()');
        await h.run('verifierMiseAJourDistante()');
        expect(h.ctx.VERSION_MAJEURE).toBe('9.9.0');
        expect(h.ctx.BUILD_ID).toBe('0101-0900');
        expect(h.dom['build-numero'].textContent).toBe('(Build 0101-0900)');
        expect(h.dom['bandeau-mise-a-jour-build'].textContent).toBe('BÊTA PUBLIQUE 9.9.0 (BUILD 0101-0900)');
        expect(h.dom['bandeau-mise-a-jour-texte'].textContent).toContain('Nouvelle version chargée');
    });

    it('une version plus récente sur le serveur s\'annonce, sans changer la version chargée', async () => {
        const h = monter({
            version: { beta: '9.9.0', build: '0101-0900' },
            idb: { 'monitorage-build-vu': '0101-0900' },
            reponseServeur: { beta: '9.10.0', build: '0102-0000' }
        });
        await h.run('etablirVersionChargee()');
        expect(bandeauVisible(h)).toBe(false);
        await h.run('verifierMiseAJourDistante()');
        expect(bandeauVisible(h)).toBe(true);
        expect(h.dom['bandeau-mise-a-jour-build'].textContent).toBe('BÊTA PUBLIQUE 9.10.0 (BUILD 0102-0000)');
        expect(h.dom['bandeau-mise-a-jour-texte'].textContent).toContain('déployée');
        expect(h.ctx.VERSION_MAJEURE).toBe('9.9.0');
    });
});

describe('#850 · le repère « vu » se lit et s\'écrit là où db le garde', () => {
    it('un repère stocké par db (copie JSON dans localStorage) tait le bandeau et la pastille', async () => {
        const h = monter({
            version: { beta: '9.9.0', build: '0101-0900' },
            idb: { 'monitorage-build-vu': '0101-0900', 'monitorage-version-vue': '9.9.0' }
        });
        // Le harnais reproduit bien la forme mesurée chez Grégoire.
        expect(h.ls.get('monitorage-build-vu')).toBe('"0101-0900"');
        await h.run('etablirVersionChargee()');
        expect(bandeauVisible(h)).toBe(false);
        expect(h.run('verifierNouveautes().aDesNouveautes')).toBe(false);
    });

    it('fermer le bandeau écrit le repère là où le démarrage suivant le relit', async () => {
        const h = monter({
            version: { beta: '9.9.0', build: '0101-0900' },
            idb: { 'monitorage-build-vu': '0807-1529' }
        });
        await h.run('etablirVersionChargee()');
        expect(bandeauVisible(h)).toBe(true);
        h.run('fermerBandeauMiseAJour()');
        expect(h.stock.get('monitorage-build-vu')).toBe('0101-0900');

        const suivant = monter({
            version: { beta: '9.9.0', build: '0101-0900' },
            idb: Object.fromEntries(h.stock)
        });
        await suivant.run('etablirVersionChargee()');
        expect(bandeauVisible(suivant)).toBe(false);
    });
});
