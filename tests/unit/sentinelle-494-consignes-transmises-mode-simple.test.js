import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #494 (25 août 2026) — « CONSIGNES TRANSMISES » EXISTE AUSSI QUAND
// IL N'Y A QU'UN GROUPE.
//
// Le fil : le mode multi-groupe porte cette case depuis Beta 98.3. Le mode
// simple, jamais — `obtenirEcheanceEffective` y répondait `assignee: true` EN
// DUR. C'était défendable : tant que poser la date demandait un geste, une date
// saisie VALAIT la transmission des consignes.
//
// ⚠ CE QUI A CHANGÉ LE MÊME JOUR. #493 a fait arriver la date toute seule depuis
// la carte d'alignement. L'équivalence a sauté : une production simplement
// PLANIFIÉE devenait TRANSMISE — elle entrait au calendrier, dans les indices C
// et P, dans les snapshots, et perdait son badge « à planifier » sans qu'aucune
// consigne ne soit partie. L'automatisme a rendu nécessaire la donnée que la
// supposition remplaçait. C'est U4 qui tient cette porte fermée.
//
// ▣ UN SEUL MODÈLE D'ASSIGNATION : la case écrit `echeancesParGroupe` avec son
// unique entrée, exactement comme le mode multi. Un champ parallèle aurait
// donné deux endroits où le badge et le calendrier peuvent se contredire.
//
// Ce que cette sentinelle tient :
//   U1 — la case est là quand il y a un groupe, absente quand il n'y en a pas.
//   U2 — LE POINT DÉCISIF : ce que la case dit à l'écran est ce qui s'enregistre.
//   U3 — rétro-compat : une production d'avant ce jour n'est pas déclassée.
//   U4 — une date préparée n'est PAS une échéance due.
//   U5 — le champ date suit la case, comme en multi-groupe.

/* ------------------------------------------------------------------ mini-DOM */

function element(tag = 'div', id = '') {
    const attributs = {};
    const el = {
        tagName: tag, id, className: '', textContent: '', type: '', value: '',
        checked: false, disabled: false, style: { cssText: '' },
        enfants: [], parentElement: null,
        appendChild(n) { n.parentElement = el; el.enfants.push(n); return n; },
        insertBefore(n, ref) {
            n.parentElement = el;
            const i = el.enfants.indexOf(ref);
            el.enfants.splice(i < 0 ? el.enfants.length : i, 0, n);
            return n;
        },
        remove() {
            if (!el.parentElement) return;
            const i = el.parentElement.enfants.indexOf(el);
            if (i >= 0) el.parentElement.enfants.splice(i, 1);
        },
        querySelector(sel) {
            const cls = sel.replace('.', '');
            return el.enfants.find(n => n.className === cls) || null;
        },
        setAttribute(n, v) { attributs[n] = String(v); },
        getAttribute(n) { return n in attributs ? attributs[n] : null; },
        addEventListener(evt, fn) { (el._ecouteurs[evt] ||= []).push(fn); },
        declencher(evt) { (el._ecouteurs[evt] || []).forEach(fn => fn()); },
        _ecouteurs: {}
    };
    return el;
}

// L'écran tel que le formulaire le présente : un champ date dans son groupe.
function ecranModeSimple() {
    const parent = element('div');
    const input = element('input', 'productionDateEcheance');
    parent.appendChild(input);
    return { parent, input };
}

function charger(elementsParId = {}) {
    const store = {};
    const win = chargerScript('js/productions.js', {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t),
        obtenirCoursActifId: () => 'COURS_A',
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        alert: () => {},
        document: {
            createElement: (tag) => element(tag),
            getElementById: (id) => elementsParId[id] || null,
            querySelector: () => null, querySelectorAll: () => [], addEventListener() {}
        }
    });
    win.cle = (k) => `a2026_${k}`;
    return win;
}

// La case posée sur un écran, prête à être interrogée.
function poser(win, ecran, production, gcId) {
    win.poserCaseAssignationSimple(ecran.input, production, gcId);
    return ecran.parent.querySelector('.echeance-simple-assignee');
}
const laCase = (zone) => zone && zone.enfants.find(n => n.type === 'checkbox');

/* ------------------------------------------------------- U1 — elle est là */

describe('#494 · U1 — la case existe en mode simple', () => {
    it('U1.a Avec un groupe-cours, la case est posée et porte son identité', () => {
        const win = charger();
        const ecran = ecranModeSimple();
        const zone = poser(win, ecran, null, 'GC_A');
        expect(zone, 'la case doit exister').toBeTruthy();
        expect(laCase(zone).getAttribute('data-gc-id')).toBe('GC_A');
    });

    it('U1.b Sans groupe-cours, aucune case : il n\'y a rien à assigner', () => {
        const win = charger();
        const ecran = ecranModeSimple();
        expect(poser(win, ecran, null, null)).toBeNull();
    });

    it('U1.c Rouvrir la fiche ne pose pas une deuxième case', () => {
        const win = charger();
        const ecran = ecranModeSimple();
        poser(win, ecran, null, 'GC_A');
        poser(win, ecran, null, 'GC_A');
        const zones = ecran.parent.enfants.filter(n => n.className === 'echeance-simple-assignee');
        expect(zones).toHaveLength(1);
    });
});

/* ------------------------------------ U2 — LE POINT DÉCISIF : écran = données */

describe('#494 · U2 — ce que la case dit est ce qui s\'enregistre', () => {
    function formulaire(coche, date) {
        const win = charger();
        const ecran = ecranModeSimple();
        const zone = poser(win, ecran, null, 'GC_A');
        const c = laCase(zone);
        c.checked = coche;
        ecran.input.value = date;
        // Le conteneur multi est masqué : c'est bien le chemin « mode simple ».
        const conteneurMasque = element('div', 'containerEcheancesGroupes');
        conteneurMasque.classList = { contains: (x) => x === 'u-hide' };
        const win2 = charger({
            containerEcheancesGroupes: conteneurMasque,
            productionEcheanceAssignee: c,
            productionDateEcheance: ecran.input
        });
        return win2.lireEcheancesParGroupeDepuisFormulaire();
    }

    it('U2.a Cochée avec une date ⇒ assignée, avec sa date', () => {
        expect(formulaire(true, '2026-09-15')).toEqual({
            GC_A: { assignee: true, date: '2026-09-15' }
        });
    });

    it('U2.b LE CAS QUI PORTE LE SENS : décochée ⇒ non assignée, date conservée', () => {
        // La date préparée ne se perd pas — elle n'est simplement pas due.
        expect(formulaire(false, '2026-09-15')).toEqual({
            GC_A: { assignee: false, date: '2026-09-15' }
        });
    });

    it('U2.c Le modèle écrit est celui du multi-groupe, pas un champ parallèle', () => {
        const lu = formulaire(true, '2026-09-15');
        const entree = lu.GC_A;
        expect(Object.keys(entree).sort()).toEqual(['assignee', 'date']);
    });
});

/* ----------------------------------------------------- U3 — la rétro-compat */

describe('#494 · U3 — une production d\'avant ce jour n\'est pas déclassée', () => {
    it('U3.a Legacy avec une date ⇒ cochée (c\'est la sémantique de sa saisie)', () => {
        const win = charger();
        const zone = poser(win, ecranModeSimple(), { dateEcheance: '2026-02-16' }, 'GC_A');
        expect(laCase(zone).checked).toBe(true);
    });

    it('U3.b Legacy sans date ⇒ décochée', () => {
        const win = charger();
        const zone = poser(win, ecranModeSimple(), { dateEcheance: null }, 'GC_A');
        expect(laCase(zone).checked).toBe(false);
    });

    it('U3.c Une entrée par groupe existante commande', () => {
        const win = charger();
        const prod = {
            dateEcheance: '2026-02-16',
            echeancesParGroupe: { GC_A: { assignee: false, date: '2026-02-16' } }
        };
        expect(laCase(poser(win, ecranModeSimple(), prod, 'GC_A')).checked).toBe(false);
    });

    it('U3.d Entrée muette ⇒ assignée, comme partout ailleurs', () => {
        const win = charger();
        const prod = { echeancesParGroupe: { GC_A: { date: '2026-02-16' } } };
        expect(laCase(poser(win, ecranModeSimple(), prod, 'GC_A')).checked).toBe(true);
    });
});

/* ------------------------- U4 — LA PORTE QUE #493 AVAIT OUVERTE, REFERMÉE */

describe('#494 · U4 — une date préparée n\'est pas une échéance due', () => {
    const PREPAREE = {
        id: 'PROD_A1', titre: 'Artefact 1',
        dateEcheance: '2026-09-15',   // posée par la carte, pas par une transmission
        echeancesParGroupe: { GC_A: { assignee: false, date: '2026-09-15' } }
    };

    it('U4.a Elle garde son badge « à planifier »', () => {
        const win = charger();
        expect(win.aucuneEcheanceAssignee(PREPAREE)).toBe(true);
    });

    it('U4.b Le résolveur dont dépendent calendrier, C, P et snapshots la refuse', () => {
        const win = charger();
        const { date, assignee } = win.obtenirEcheanceEffective(PREPAREE, 'GC_A');
        expect(assignee).toBe(false);
        expect(date).toBe('2026-09-15');   // préparée, donc connue — mais pas due.
    });

    it('U4.c Une fois transmise, elle devient due', () => {
        const win = charger();
        const transmise = {
            ...PREPAREE,
            echeancesParGroupe: { GC_A: { assignee: true, date: '2026-09-15' } }
        };
        expect(win.aucuneEcheanceAssignee(transmise)).toBe(false);
        expect(win.obtenirEcheanceEffective(transmise, 'GC_A').assignee).toBe(true);
    });
});

/* --------------------------------------------------- U5 — le champ suit la case */

describe('#494 · U5 — le champ date suit la case', () => {
    it('U5.a Décochée à l\'ouverture ⇒ champ inactif', () => {
        const win = charger();
        const ecran = ecranModeSimple();
        poser(win, ecran, null, 'GC_A');
        expect(ecran.input.disabled).toBe(true);
    });

    it('U5.b Cocher réactive le champ, décocher le referme', () => {
        const win = charger();
        const ecran = ecranModeSimple();
        const c = laCase(poser(win, ecran, null, 'GC_A'));

        c.checked = true;  c.declencher('change');
        expect(ecran.input.disabled).toBe(false);

        c.checked = false; c.declencher('change');
        expect(ecran.input.disabled).toBe(true);
    });
});
