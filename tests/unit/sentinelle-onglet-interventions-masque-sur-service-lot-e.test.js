import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — SUR UN SERVICE, L'ONGLET « INTERVENTIONS » NE S'AFFICHE PAS (consigne du 12 septembre 2026, lot E,
// révision de 11 h ; zone protégée js/navigation.js ouverte par Grégoire à 10 h 58).
//
// « Rencontres » et « Interventions » sont le même module, la même liste : sur un service, l'orthopédagogue verrait deux
// onglets pour une seule chose, dont l'un lui parle de niveaux RàI. Rien n'est fusionné (jugé après le mois d'usage).
//
// Le banc charge les VRAIS js/config.js et js/navigation.js dans un contexte vm (leurs `let` de tête — sectionActive,
// sousSectionActive — y sont partagés comme dans la page), avec un DOM minimal : la barre se relit depuis son HTML.
//
// VERROUILLÉ ICI :
//   1. service → six boutons dans Suivi, sans « Interventions » ; cours → sept, dans l'ordre de 1.137.0 ;
//   2. `configurationsOnglets['suivi']` INCHANGÉ après un rendu sur un service (le filtre agit sur une copie) ;
//   3. `suivi-interventions` reste un identifiant reconnu, même sur un service (lien direct, état restauré) ;
//   4. ⚠ ce que la mesure a corrigé de la consigne : une bascule de contexte ne repasse PAS par afficherSection — la
//      barre ne se reconstruisait pas. `rafraichirSousNavigationSelonContexte` (appelé par mettreAJourContexteEntete)
//      la refait SANS déplacer personne ; seul l'onglet qui disparaît cède la place à « Rencontres » ;
//   5. contexte.js appelle ce rafraîchissement ; hors de Suivi, il ne touche à rien ;
//   6. #345 : le comparateur reste masquable par son drapeau (le filtre a été factorisé, pas perdu).
//
// BREAK-TESTS VÉRIFIÉS le 12 septembre 2026 — journal en fin de fichier.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const ORDRE_1_137_0 = ['Suivi du groupe', 'Liste des étudiant·es', 'Saisie des présences', 'Profils individuels', 'Interventions', 'Rencontres', 'Animation'];

function classes(init) { const s = new Set(init || []); return { add: (c) => s.add(c), remove: (c) => s.delete(c), contains: (c) => s.has(c) }; }
function bouton(id, actif, label) {
    const b = { id, label, _ecouteurs: [], classList: classes(actif ? ['actif'] : []),
        getAttribute: (k) => (k === 'data-sous-onglet' ? id : null), addEventListener(t, f) { this._ecouteurs.push(f); }, click() { this._ecouteurs.forEach(f => f.call(this)); } };
    return b;
}

function monter({ service = false, config = lire('js/config.js') } = {}) {
    const etat = { service };
    const erreurs = [];
    const appels = { rencontres: 0, liste: 0 };
    const sousNav = { _html: '', boutons: [], className: '', style: {},
        get innerHTML() { return this._html; },
        set innerHTML(v) { this._html = v; this.boutons = [...String(v).matchAll(/<button data-sous-onglet="([^"]+)"( class="actif")?[^>]*>([^<]*)<\/button>/g)].map(m => bouton(m[1], !!m[2], m[3])); },
        querySelectorAll(sel) { return sel === 'button' ? this.boutons : []; } };
    const noeuds = {};
    const document = {
        getElementById(id) { if (id === 'sous-navigation') return sousNav; return noeuds[id] || (noeuds[id] = { id, classList: classes() }); },
        querySelectorAll(sel) { if (sel === '.sous-navigation button') return sousNav.boutons; if (sel === '.sous-section') return Object.values(noeuds); return []; },
        querySelector() { return null; }
    };
    const ctx = vm.createContext({
        document, CustomEvent: class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } },
        console: { log() {}, warn() {}, error: (...a) => erreurs.push(a.map(String).join(' ')) },
        setTimeout: (f) => { f(); return 0; }, clearTimeout() {},
        contexteActifEstService: () => etat.service,
        afficherRencontres: () => { appels.rencontres++; }, rechargerListeEtudiants: () => { appels.liste++; }
    });
    ctx.window = ctx; ctx.dispatchEvent = () => true;
    vm.runInContext(config, ctx);
    vm.runInContext(lire('js/navigation.js'), ctx);
    const lireCtx = (expr) => vm.runInContext(expr, ctx);
    return {
        etat, erreurs, appels, sousNav, ctx, lire: lireCtx,
        labels: () => sousNav.boutons.map(b => b.label),
        actifs: () => sousNav.boutons.filter(b => b.classList.contains('actif')).map(b => b.id),
        cliquer: (id) => sousNav.boutons.find(b => b.id === id).click()
    };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('1 · la barre de Suivi : six onglets sur un service, sept sur un cours', () => {
    it('service : six, sans « Interventions », dans l\'ordre ; le premier est actif', () => {
        const b = monter({ service: true });
        b.ctx.afficherSection('suivi');
        expect(b.labels()).toEqual(ORDRE_1_137_0.filter(l => l !== 'Interventions'));
        expect(b.actifs()).toEqual(['suivi-groupe']);
    });
    it('cours : sept, dans l\'ordre de 1.137.0', () => {
        const b = monter({ service: false });
        b.ctx.afficherSection('suivi');
        expect(b.labels()).toEqual(ORDRE_1_137_0);
        expect(b.actifs()).toEqual(['suivi-groupe']);
    });
    it('les autres sections ne bougent pas, service ou non', () => {
        for (const service of [true, false]) {
            const b = monter({ service });
            b.ctx.afficherSection('evaluations');
            expect(b.labels()).toEqual(b.lire('configurationsOnglets.evaluations.map(i => i.label)'));
        }
    });
});

describe('2 · le filtre agit sur une copie', () => {
    it('configurationsOnglets[\'suivi\'] est identique après un rendu sur un service, et rafraîchi', () => {
        const b = monter({ service: true });
        const avant = b.lire('JSON.stringify(configurationsOnglets.suivi)');
        b.ctx.afficherSection('suivi');
        b.ctx.rafraichirSousNavigationSelonContexte();
        expect(b.lire('JSON.stringify(configurationsOnglets.suivi)')).toBe(avant);
        expect(JSON.parse(avant).map(i => i.label)).toEqual(ORDRE_1_137_0);
    });
});

describe('3 · « suivi-interventions » reste un identifiant reconnu sur un service', () => {
    it('afficherSousSection et naviguerVers l\'acceptent, sans erreur — un lien direct mène là où il menait', () => {
        const b = monter({ service: true });
        b.ctx.afficherSection('suivi');
        b.ctx.afficherSousSection('suivi-interventions');
        expect(b.erreurs.filter(e => /ID inconnu|inconnue/.test(e))).toEqual([]);
        expect(b.lire('sousSectionActive')).toBe('suivi-interventions');
        expect(b.ctx.naviguerVers('suivi', 'interventions')).toBe(true);
    });
});

describe('4 · la bascule de contexte : la barre suit, sans déplacer personne', () => {
    it('sur « Interventions » (cours) puis bascule vers un service : six onglets, et l\'on arrive sur « Rencontres »', () => {
        const b = monter({ service: false });
        b.ctx.afficherSection('suivi');
        b.cliquer('suivi-interventions');
        expect(b.lire('sousSectionActive')).toBe('suivi-interventions');
        b.etat.service = true;
        b.ctx.rafraichirSousNavigationSelonContexte();
        expect(b.labels()).not.toContain('Interventions');
        expect(b.lire('sousSectionActive'), 'un écran qui existe, jamais un conteneur vide').toBe('suivi-rencontres');
        expect(b.actifs()).toEqual(['suivi-rencontres']);
        expect(b.appels.rencontres, 'l\'écran des rencontres est bien construit').toBeGreaterThan(0);
    });
    it('sur « Liste » : la bascule change la barre, pas l\'onglet — ni re-navigation, ni rechargement de la liste', () => {
        const b = monter({ service: false });
        b.ctx.afficherSection('suivi');
        b.cliquer('suivi-liste');
        const chargementsListe = b.appels.liste;
        b.etat.service = true;
        b.ctx.rafraichirSousNavigationSelonContexte();
        expect(b.labels()).toHaveLength(6);
        expect(b.lire('sousSectionActive')).toBe('suivi-liste');
        expect(b.actifs()).toEqual(['suivi-liste']);
        expect(b.appels.liste, 'aucune re-navigation').toBe(chargementsListe);
        b.etat.service = false;
        b.ctx.rafraichirSousNavigationSelonContexte();
        expect(b.labels()).toEqual(ORDRE_1_137_0);
        expect(b.actifs()).toEqual(['suivi-liste']);
    });
    it('les boutons reposés répondent au clic', () => {
        const b = monter({ service: false });
        b.ctx.afficherSection('suivi');
        b.etat.service = true;
        b.ctx.rafraichirSousNavigationSelonContexte();
        b.cliquer('suivi-rencontres');
        expect(b.lire('sousSectionActive')).toBe('suivi-rencontres');
        expect(b.actifs()).toEqual(['suivi-rencontres']);
    });
});

describe('5 · qui appelle le rafraîchissement, et quand il ne fait rien', () => {
    it('hors de Suivi, il ne touche pas à la barre', () => {
        const b = monter({ service: true });
        b.ctx.afficherSection('evaluations');
        const html = b.sousNav.innerHTML;
        b.etat.service = false;
        b.ctx.rafraichirSousNavigationSelonContexte();
        expect(b.sousNav.innerHTML).toBe(html);
    });
    it('mettreAJourContexteEntete (contexte.js) l\'appelle — le chemin commun des bascules, avant son retour anticipé', () => {
        let appels = 0;
        const win = chargerScript('js/contexte.js', { document: { getElementById: () => null }, appliquerMotsNatureCadre() {},
            rafraichirSousNavigationSelonContexte: () => { appels++; }, db: { getSync: (k, d) => d }, cle: (k) => k, notifications: { succes() {} } }, { addEventListener() {} });
        win.mettreAJourContexteEntete();
        expect(appels).toBe(1);
    });
});

describe('6 · #345 : le comparateur reste masquable (filtre factorisé, pas perdu)', () => {
    it('COMPARATEUR_VISIBLE à false retire « comparateur » de la barre du Labo, sans muter la configuration', () => {
        const config = lire('js/config.js');
        expect(config).toContain('const COMPARATEUR_VISIBLE = true;');
        const b = monter({ config: config.replace('const COMPARATEUR_VISIBLE = true;', 'const COMPARATEUR_VISIBLE = false;') });
        b.ctx.afficherSection('labo');
        expect(b.sousNav.boutons.map(x => x.id)).not.toContain('labo-comparateur');
        expect(b.lire('configurationsOnglets.labo.some(i => i.id === "comparateur")')).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS (12 septembre 2026) — chaque mutation posée, lancée, remise (empreinte sha256 identique).
//   E1 navigation.js — le filtre du service neutralisé (Interventions toujours affiché)          → 3 rouges
//   E2 navigation.js — le filtre MUTE configurationsOnglets (splice) au lieu d'une copie          → 3 rouges
//   E3 navigation.js — le registre des identifiants bâti sur la copie filtrée                     → 1 rouge
//   E4 contexte.js   — l'appel du rafraîchissement retiré de mettreAJourContexteEntete            → 1 rouge
//   E5 navigation.js — le rafraîchissement re-navigue toujours (déplace l'utilisateur)            → 1 rouge
//   E6 navigation.js — l'onglet disparu cède la place au PREMIER, pas à « Rencontres »            → 1 rouge
//   E7 navigation.js — la garde « hors de Suivi, ne touche à rien » levée                          → 1 rouge
//   E8 navigation.js — le filtre du comparateur (#345) perdu à la factorisation                    → 1 rouge
