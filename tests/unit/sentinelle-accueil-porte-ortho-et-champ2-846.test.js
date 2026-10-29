import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — LA PORTE DE L'ORTHOPÉDAGOGIE SUR L'ACCUEIL, ET LE CHAMP 2 QUI NE SE CONTREDIT PLUS
// (consigne du 12 septembre 2026, 10 h 25 ; #846 et la carte de l'accueil).
//
// Grégoire (12 sept., 7 h 35) : « Je veux que l'orthopédagogue sente qu'elle entre par la porte
// principale. » Aucun comportement, aucune donnée, aucune règle ne change : des mots, et une carte.
//
// VERROUILLÉ ICI :
//   A. #846 — le champ 2 du groupe-cours nomme ce qu'on CHOISIT, pas le contexte : il dit
//      « Cours ou service » sur un service comme sur un cours, son option vide aussi, et son menu
//      offre les deux natures dans les deux contextes ; `appliquerMotsNatureCadre` ne le touche plus ;
//      les deux clés retirées du point unique ne reviennent pas.
//   B1. la carte est sur l'accueil, SOUS le bandeau et AU-DESSUS du label « Tâches » — et les huit
//      cartes de tâches sont toujours là (le verrou : rien n'est remplacé) ;
//   B2. son lien prend le chemin de la sous-navigation (Suivi › Rencontres), pas un second ;
//   B3. les mots de la carte et du bandeau viennent du RENDU, et un seul endroit les écrit ;
//   B4. la carte est blanche comme les autres : même fond, même trait, même rayon, même ombre en
//      mode clair ; ni bord gauche épais, ni couleur propre (la sarcelle signe la démo).
//   B5. (28 oct. 2026) la carte devient UN encadré de trois portes d'entrée — « Tu enseignes ? »,
//      la porte de l'orthopédagogie (au milieu, inchangée), « Tu es conseiller·ère pédagogique ? » ;
//      trois colonnes séparées par des filets, empilées sous 760 px ; « Commencer → » de la
//      première mène à l'étape Trimestre du Cadre, « Explorer → » passe par la case « Données démo ».
//
// BREAK-TESTS VÉRIFIÉS le 12 septembre 2026 — journal en fin de fichier.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));
const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);
const ech = (s) => String(s == null ? '' : s);
const sansCommentaires = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

function elementDom(id) {
    const el = { id, _html: '', textContent: '', value: '', style: {}, dataset: {}, options: [], _attrs: {},
        get innerHTML() { return this._html; },
        set innerHTML(v) { this._html = v; this.options = [...String(v).matchAll(/<option value="([^"]*)"[^>]*>([^<]*)<\/option>/g)].map(m => ({ value: m[1], textContent: m[2] })); },
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; },
        setAttribute(k, v) { this._attrs[k] = v; }, getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; },
        hasAttribute(k) { return k in this._attrs; }, closest() { return null; }, focus() {} };
    return el;
}
function fauxDocument(elements, marques) {
    return { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null,
        querySelectorAll: (sel) => (sel === '[data-mot-nature]' ? (marques || []) : []),
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), readyState: 'complete' };
}
function dbBanc(store) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : d), setSync: (k, v) => { store[k] = clone(v); },
        get: async (k) => (k in store ? clone(store[k]) : null), set: async (k, v) => { store[k] = clone(v); },
        modifier: async (k, f, d) => { store[k] = clone(f(k in store ? clone(store[k]) : d)); },
    };
}
const notifs = { succes() {}, erreur() {}, info() {}, warning() {} };

const CHAMP2 = 'Cours ou service';
const CHAMP2_VIDE = '— Choisir un cours ou un service —';

// ─────────────────────────────────────────────────────────────────────────────
describe('A · #846 — le champ 2 du groupe-cours dit le même mot sur un service comme sur un cours', () => {
    const COURS = [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Écriture' }, { id: 'S1', nature: 'service', nomCours: 'Aide' }];

    it('le menu repeuplé (populerDropdownsAssemblageV2) : même option vide, et les deux natures, dans les deux contextes', () => {
        const etat = { service: true };
        const elements = {};
        const store = { trimestres: [], trimestreActif: '', cours: COURS, enseignants: [] };
        const win = chargerScript('js/trimestre-v2.js', { document: fauxDocument(elements), db: dbBanc(store), cle, echapperHtml: ech, echapperAttribut: ech,
            contexteActifEstService: () => !!etat.service });
        const attendu = [CHAMP2_VIDE, '601-101-MQ - Écriture', 'Aide'];
        win.populerDropdownsAssemblageV2();
        expect(elements['v2-gc-cours'].options.map(o => o.textContent), 'sur un service').toEqual(attendu);
        etat.service = false;
        win.populerDropdownsAssemblageV2();
        expect(elements['v2-gc-cours'].options.map(o => o.textContent), 'sur un cours').toEqual(attendu);
    });

    it('appliquerMotsNatureCadre ne touche plus l\'option vide du champ 2 (elle ne nomme pas le contexte)', () => {
        const etat = { service: true };
        const elements = {};
        const vide = Object.assign(elementDom('vide'), { value: '', textContent: CHAMP2_VIDE });
        elements['v2-gc-cours'] = Object.assign(elementDom('v2-gc-cours'), { options: [vide] });
        const win = chargerScript('js/trimestre-v2-orchestre.js', { document: fauxDocument(elements, []), db: dbBanc({}), cle, echapperHtml: ech,
            notifications: notifs, contexteActifEstService: () => !!etat.service }, { addEventListener() {} });
        win.appliquerMotsNatureCadre();
        expect(vide.textContent, 'sur un service').toBe(CHAMP2_VIDE);
        etat.service = false;
        win.appliquerMotsNatureCadre();
        expect(vide.textContent, 'sur un cours').toBe(CHAMP2_VIDE);
    });

    it('index.html : le libellé du champ 2, son option vide et l\'élément de la liste disent « Cours ou service », sans marque data-mot-nature', () => {
        const html = lire('index.html');
        expect(html).toContain('<label>2. ' + CHAMP2 + ' <span class="champ-requis">*</span></label>');
        expect(html).toMatch(new RegExp('<select id="v2-gc-cours"[^>]*>\\s*<option value="">' + CHAMP2_VIDE + '</option>'));
        expect(html).toContain('<li><strong>' + CHAMP2 + '</strong></li>');
        expect(html).not.toContain('data-mot-nature="objetGroupeCours"');
        expect(html).not.toContain('Cours à enseigner');
    });

    it('les deux clés retirées ne reviennent pas au point unique, et aucun module ne les lit', () => {
        const w = chargerScript('js/mots-nature.js', {}, { addEventListener() {} });
        for (const nature of ['cours', 'service']) {
            expect(w.MOTS_NATURE[nature], nature).not.toHaveProperty('objetGroupeCours');
            expect(w.MOTS_NATURE[nature], nature).not.toHaveProperty('choisirObjetGC');
        }
        const fautifs = readdirSync(path.join(RACINE, 'js')).filter(f => f.endsWith('.js'))
            .filter(f => /objetGroupeCours|choisirObjetGC/.test(sansCommentaires(lire('js/' + f))));
        expect(fautifs).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 19 oct. 2026 : « Importer des productions » devient « Importer des copies » (les productions sont les consignes).
const TACHES = ['Adopter ta pratique', 'Planifier ton cours', 'Saisir les présences', 'Importer des copies',
    'Annoter et évaluer', 'Observer le groupe', 'Consulter un profil', 'Différencier les interventions'];
// 19 oct. 2026 : les descriptions des huit tâches, dans l'ordre des titres (relecture de Grégoire avec Cowork).
const DESCRIPTIONS_TACHES = [
    'Construction de la note du cours, sommative ou alternative.',
    'Alignement constructif des objectifs, leçons et évaluations.',
    'Absences, retards et notes de séance.',
    'Fichiers PDF ou images des travaux d’étudiant·es.',
    'Annotation, niveaux ou note par critère, rétroaction automatisée.',
    'Assiduité, complétion, performance et dépistage des difficultés d’apprentissage.',
    'Engagement, travaux, progression et accompagnement.',
    'Niveaux de besoin, rencontres et bilans.'
];

// Les mots arrêtés par Grégoire, dans l'ordre où l'accueil les rend.
// 27 sept. 2026 — « Par où commencer ? » en trois étapes et la ligne de l'orthopédagogue gardée
// (texte de Cowork accepté par Grégoire le 26 sept., consigne « accueil et tutoriels »).
// 14 oct. 2026 — texte réécrit par Grégoire (consigne « le nouveau texte À propos ») : la barre
// repliable s'intitule « À propos » (TITRE_BANDEAU, épinglé à part : « À propos » s'écrit aussi
// ailleurs dans js/, Réglages › À propos), le corps s'ouvre sur « Bienvenue dans Labo Codex ! »,
// et le paragraphe d'accès perd son amorce « Ton courriel, une fois par mois. ».
// 28 oct. 2026 — texte remplacé en entier par Grégoire (verdict « Tout remplacer ») : « Par où
// commencer ? » et la ligne de l'orthopédagogue quittent le bandeau, les trois portes les portent.
const TITRE_BANDEAU = 'À propos';
const MOTS_BANDEAU = [
    'Bienvenue dans Labo Codex !',
    'Labo Codex est un outil de soutien à l’enseignement et au suivi des apprentissages.',
    'C’est une application qui te propose de numériser ton travail et de rendre visibles et interprétables les micro-données que tu crées et recueilles dans ton environnement. Elle te permet ainsi de mieux voir les conditions de ton écosystème-classe et de mieux planifier tes interventions.',
    'Une de ses particularités est qu’il n’y a aucune intelligence artificielle dans l’application. Ton jugement professionnel est souverain et l’outil ne fait que l’éclairer. Labo Codex n’impose aucune pratique, est entièrement configurable et aucune décision n’est prise à ta place. L’application n’offre pas la possibilité de scroller très longtemps et elle ne provoque pas de grandes bouffées de dopamine. Par contre, elle permet de réfléchir à ta pratique et de te libérer un peu de ta charge mentale.',
    'Tu peux faire les mêmes gestes que d’habitude – planifier, concevoir, évaluer et suivre la progression de tes étudiant·es – mais dans un seul outil numérique intégré. Labo Codex t’offre un espace autonome, indépendant, confidentiel, gratuit, ouvert, portable et sobre en carbone ! L’objectif est d’inventer et d’organiser avec cette ressource un commun éducatif, pérenne et ouvert, en marge des grosses plateformes.',
    'Tu entres ton adresse de courriel, tu reçois un code de sécurité et c’est tout ! Une fois entré·e, tu restes connecté·e un mois sans avoir à renouveler ton accès. Tes données restent 100 % sur ton appareil. Il n’y a pas de commerce, pas de frais, pas d’abonnement, pas de publicité. Le seul échange souhaité est ton feedback et tes rapports de bugs (si tu en rencontres).',
    'Certains concepts sont nouveaux ?',
    'Trois guides t’expliquent le concept des micro-données, la taxonomie SOLO et le modèle RàI qui servent au dépistage des difficultés et à la planification des interventions. L’aide et les guides sont accessibles en tout temps.',
    'Tu as besoin de support humain ?',
    'L’Association québécoise de pédagogie collégiale (AQPC) héberge une Communauté de pratique (CoP) Labo Codex. C’est le lieu tout désigné pour obtenir du soutien et échanger entre pairs. Des enseignant·es comme toi y explorent d’autres pratiques pédagogiques et co-construisent des ressources libres.',
];
// 28 oct. 2026 : les trois portes, dans l'ordre (mots donnés par Grégoire). « Commencer → » est écrit
// deux fois (deux portes) : il est vérifié dans l'ordre du rendu, pas par l'unicité de B3.
const MOTS_PORTES = [
    'Tu enseignes ?', 'Crée ton trimestre, ton cours et ton groupe, puis apporte ta grille d’évaluation.', 'Commencer →',
    'Tu es orthopédagogue ?', 'Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre.', 'Commencer →',
    'Tu es conseiller·ère pédagogique ?', 'Explore un cours fictif déjà configuré, séparé de tes vraies données.', 'Explorer →'];
const MOTS_UNIQUES_PORTES = MOTS_PORTES.filter(m => m !== 'Commencer →');

function rendreAccueil(options) {
    const opts = options || {};
    const elements = {};
    const appels = [];
    const doc = fauxDocument(elements);
    const win = chargerScript('js/accueil.js', {
        document: doc, obtenirPreference: () => false, definirPreference() {}, estEnModeDemo: () => !!opts.demo,
        afficherSection: (s) => appels.push(['section', s]), afficherSousSection: (s) => appels.push(['sous-section', s]),
        activerModeDemo: () => appels.push(['activerModeDemo']), desactiverModeDemo: () => appels.push(['desactiverModeDemo']),
        setTimeout: (f) => f(),
    }, {
        addEventListener() {},
        // Lus sur `window` par accueil.js : l'export de trimestre-v2.js et la garde de l'import (T7).
        ouvrirAccordeonDeLEtape: (e) => appels.push(['etape', e]),
        importEmpecheLaBascule: opts.importEmpeche ? () => true : undefined,
    });
    win.afficherAccueil();
    return { html: elements['accueil-contenu'].innerHTML, win, appels, doc };
}

describe('B1 · la carte est au-dessus des tâches, et les huit tâches sont toujours là', () => {
    it('ordre : le bandeau, puis la carte, puis le label « Tâches », puis la grille des tâches', () => {
        const { html } = rendreAccueil();
        const iBandeau = html.indexOf('id="banniere-bienvenue"');
        const iCarte = html.indexOf('class="accueil-portes"');
        const iTaches = html.indexOf('<div class="accueil-section-label">Tâches</div>');
        const iGrille = html.indexOf('class="accueil-grille-actions"');
        expect(iBandeau).toBeGreaterThanOrEqual(0);
        expect(iCarte, 'la carte est rendue').toBeGreaterThan(iBandeau);
        expect(iTaches, 'au-dessus du label « Tâches »').toBeGreaterThan(iCarte);
        expect(iGrille).toBeGreaterThan(iTaches);
        expect(html.match(/class="accueil-portes"/g), 'un seul encadré').toHaveLength(1);
        expect(html).not.toContain('accueil-porte-ortho');
    });

    it('les huit cartes de tâches, dans leur ordre, et la carte n\'en est pas une', () => {
        const { html } = rendreAccueil();
        const titres = [...html.matchAll(/<div class="accueil-action-titre">([^<]*)<\/div>/g)].map(m => m[1]);
        expect(titres).toEqual(TACHES);
        expect(html.match(/class="accueil-action"/g)).toHaveLength(8);
        const carte = tranche(html, 'class="accueil-portes"', '<div class="accueil-section-label">Tâches</div>');
        expect(carte).not.toContain('accueil-action');
    });

    it('les descriptions des cartes, arrêtées par Grégoire le 19 oct. 2026 : des groupes nominaux, sans deux-points', () => {
        const { html } = rendreAccueil();
        const lus = (classe) => [...html.matchAll(new RegExp('<div class="' + classe + '">([^<]*)</div>', 'g'))].map(m => m[1]);
        expect(lus('accueil-action-desc')).toEqual(DESCRIPTIONS_TACHES);
        // « Nouveautés » porte la version, pas une description : seule celle du codex est arrêtée.
        expect(lus('accueil-utilitaire-desc')[0]).toBe('Données et copies numériques, réunies dans un seul fichier.');
        expect(lus('accueil-aide-desc')).toEqual(['Info-bulles, aide à l’écran et visite guidée.', 'Cours fictif complet, indépendant de tes données.']);
        // La règle de forme du 19 oct. qu'une machine peut vérifier : aucun deux-points.
        DESCRIPTIONS_TACHES.concat(lus('accueil-aide-desc'), lus('accueil-utilitaire-desc')[0]).forEach((d) => expect(d, d).not.toContain(':'));
    });
});

describe('B2 · le lien de la carte prend le chemin de la sous-navigation', () => {
    it('« Commencer → » mène à Suivi › Rencontres par naviguerAccueilCarte, la route de la sous-navigation', () => {
        const { html, win, appels } = rendreAccueil();
        const m = html.match(/<button type="button" class="accueil-porte-lien" data-action="([^"]+)" data-param="([^"]+)">Commencer →<\/button>/);
        expect(m, 'le lien est un bouton natif (clavier, Entrée/Espace)').not.toBeNull();
        expect(m[1]).toBe('naviguerAccueilCarte');
        expect(m[2]).toBe('suivi|suivi-rencontres');
        win.naviguerAccueilCarte(m[2]);
        expect(appels).toEqual([['section', 'suivi'], ['sous-section', 'suivi-rencontres']]);
        // La même sous-section que la sous-navigation : la table de navigation.js et l'entrée de config.js.
        expect(lire('js/navigation.js')).toMatch(/'suivi-rencontres': 'nav-suivi-rencontres'/);
        expect(lire('js/config.js')).toMatch(/\{ id: 'rencontres', label: 'Rencontres' \}/);
        expect(html.match(/suivi-rencontres/g), 'un seul chemin vers les rencontres depuis l\'accueil').toHaveLength(1);
    });
});

describe('B3 · les mots viennent du rendu, et un seul endroit les écrit', () => {
    it('le rendu porte les mots arrêtés, dans l\'ordre, et plus les deux anciens paragraphes', () => {
        const { html } = rendreAccueil();
        let curseur = -1;
        for (const mot of MOTS_BANDEAU) {
            const i = html.indexOf(mot);
            expect(i, mot).toBeGreaterThan(curseur);
            curseur = i;
        }
        const iCarte = html.indexOf('class="accueil-portes"');
        curseur = iCarte;
        for (const mot of MOTS_PORTES) {
            // Cherché À PARTIR de la carte : les portes suivent le bandeau.
            const i = html.indexOf(mot, curseur + 1);
            expect(i, mot).toBeGreaterThan(curseur);
            curseur = i;
        }
        expect(html).not.toContain('Certains concepts sont nouveaux pour toi');
        expect(html).not.toContain('L’identification est requise');
    });

    it('la barre repliable s\'intitule « À propos », et l\'ancien texte du 27 sept. est parti (14 oct. 2026)', () => {
        const { html } = rendreAccueil();
        const titres = [...html.matchAll(/<span class="banniere-bienvenue-titre">([^<]*)<\/span>/g)].map(m => m[1]);
        expect(titres).toEqual([TITRE_BANDEAU]);
        expect(html).not.toContain('Ton courriel, une fois par mois.');
        expect(html).not.toContain('tu n’y repenses plus');
        expect(html).not.toContain('Les mêmes gestes que sur papier');
        expect(html).not.toContain('Apprends geste par geste.');
        expect(html).not.toContain('l’application s’en sert partout');
    });

    it('le bandeau n\'a plus ni étapes ni ligne de l\'orthopédagogue : les portes les portent (28 oct. 2026) ; aucun « — » dans le bandeau', () => {
        const { html } = rendreAccueil();
        const bandeau = tranche(html, 'id="banniere-bienvenue"', 'class="accueil-portes"');
        expect(bandeau).not.toMatch(/<ol[\s>]/);
        expect(bandeau).not.toContain('Par où commencer ?');
        expect(bandeau).not.toContain('Tu es orthopédagogue ?');
        expect(html).not.toContain('Décris ton service dans Suivi › Rencontres');
        expect(html).not.toContain('Une belle occasion de développement professionnel');
        expect(bandeau).not.toContain('—');
        expect(bandeau).not.toContain('<br>');
    });

    it('le troisième bouton ouvre les tutoriels du blogue dans un nouvel onglet, sûrement, et le dit aux lecteurs d\'écran', () => {
        const { html } = rendreAccueil();
        const actions = tranche(html, 'class="banniere-bienvenue-actions"');
        const lien = actions.match(/<a [^>]*>[\s\S]*?<\/a>/);
        expect(lien, 'un lien après les deux boutons').not.toBeNull();
        expect(actions.indexOf(lien[0])).toBeGreaterThan(actions.indexOf('Voir les guides p'));
        expect(lien[0]).toContain('href="https://codexnumeris.org/tutoriels"');
        expect(lien[0]).toContain('target="_blank"');
        expect(lien[0]).toMatch(/rel="[^"]*\bnoopener\b[^"]*"/);
        expect(lien[0]).toContain('class="btn btn-secondaire"');
        expect(lien[0]).toContain('Voir les tutoriels <span aria-hidden="true">↗</span>');
        expect(lien[0]).toMatch(/<span class="u-lecteur-ecran">[^<]*nouvel onglet[^<]*<\/span>/);
    });

    it('chaque mot n\'est écrit qu\'une fois, dans js/accueil.js — ni ailleurs dans js/, ni dans index.html', () => {
        const sources = readdirSync(path.join(RACINE, 'js')).filter(f => f.endsWith('.js')).map(f => ['js/' + f, sansCommentaires(lire('js/' + f))]);
        sources.push(['index.html', lire('index.html')]);
        for (const mot of [...MOTS_UNIQUES_PORTES, ...MOTS_BANDEAU]) {
            const lieux = sources.flatMap(([f, code]) => Array(code.split(mot).length - 1).fill(f));
            expect(lieux, mot).toEqual(['js/accueil.js']);
        }
    });
});

describe('B4 · la carte est blanche comme les autres cartes de l\'accueil', () => {
    const regle = (css, sel) => {
        const m = css.match(new RegExp('\\n\\s*' + sel.replace(/\./g, '\\.') + '\\s*\\{([^}]*)\\}'));
        return m ? Object.fromEntries(m[1].split(';').map(d => d.split(':').map(x => x && x.trim())).filter(([k, v]) => k && v)) : null;
    };
    it('index.html : même fond, même trait fin, même rayon que .accueil-action ; ni bord gauche, ni ombre ni couleur propres', () => {
        const html = lire('index.html');
        const carte = regle(html, '.accueil-portes');
        const action = regle(html, '.accueil-action');
        expect(carte).not.toBeNull();
        for (const p of ['background', 'border', 'border-radius']) expect(carte[p], p).toBe(action[p]);
        const declarations = Object.keys(carte).join(' ');
        expect(declarations).not.toMatch(/border-left|box-shadow|color/);
        expect(html).not.toMatch(/\.accueil-porte[\w-]*\s*\{[^}]*(sarcelle|--acc-)/);
    });
    it('styles.css : en mode clair, la carte est dans la MÊME règle que les cartes de tâches (fond blanc, même ombre)', () => {
        const css = lire('styles.css');
        const m = css.match(/((?:\.mode-clair \.[\w-]+,\s*)+\.mode-clair \.[\w-]+)\s*\{\s*background: #ffffff;\s*border-color: rgba\(3, 46, 92, 0\.08\);\s*box-shadow: var\(--shadow-normal\);\s*\}/);
        expect(m, 'la règle des cartes accueil V3 en mode clair').not.toBeNull();
        expect(m[1]).toContain('.mode-clair .accueil-action');
        expect(m[1]).toContain('.mode-clair .accueil-portes');
    });
});

describe('B5 · trois portes d\'entrée dans un seul encadré (28 oct. 2026)', () => {
    const portes = (html) => tranche(html, 'class="accueil-portes"', '<div class="accueil-section-label">Tâches</div>')
        .split('<div class="accueil-porte">').slice(1);
    const regle = (css, sel) => {
        const m = css.match(new RegExp('\\n\\s*' + sel.replace(/[.+]/g, '\\$&') + '\\s*\\{([^}]*)\\}'));
        return m ? m[1] : null;
    };

    it('trois colonnes, chacune : une question en titre, une phrase, un bouton natif', () => {
        const { html } = rendreAccueil();
        const p = portes(html);
        expect(p).toHaveLength(3);
        const titres = p.map(c => c.match(/<div class="accueil-porte-titre">([^<]*)<\/div>/)[1]);
        expect(titres).toEqual(['Tu enseignes ?', 'Tu es orthopédagogue ?', 'Tu es conseiller·ère pédagogique ?']);
        p.forEach((c) => {
            expect(c).toMatch(/<div class="accueil-porte-desc">[^<]+<\/div>/);
            expect(c).toMatch(/<button type="button" class="accueil-porte-lien" data-action="[^"]+"[^>]*>[^<]+<\/button>/);
        });
    });

    it('« Tu enseignes ? » : Cadre › Trimestre, puis l\'étape Trimestre de la barre de convergence', () => {
        const { html, win, appels } = rendreAccueil();
        expect(portes(html)[0]).toContain('data-action="commencerParLeTrimestre">Commencer →</button>');
        win.commencerParLeTrimestre();
        expect(appels).toEqual([['section', 'calendrier'], ['sous-section', 'calendrier-trimestre'], ['etape', 'trimestre']]);
        // La même étape qu'un clic dans la barre : la table de trimestre-v2.js, exportée pour l'accueil.
        const t = lire('js/trimestre-v2.js');
        expect(t).toMatch(/'trimestre': 'accordeon-gestion-trimestres'/);
        expect(t).toContain('window.ouvrirAccordeonDeLEtape = ouvrirAccordeonDeLEtape;');
    });

    it('« Explorer → » passe par la case « Données démo » : cochée, puis son gestionnaire', () => {
        const { html, win, appels, doc } = rendreAccueil();
        expect(portes(html)[2]).toContain('data-action="explorerDonneesDemo">Explorer →</button>');
        const cb = doc.getElementById('checkbox-demo-accueil');
        cb.checked = false;
        win.explorerDonneesDemo();
        expect(cb.checked, 'la case suit').toBe(true);
        expect(appels).toEqual([['activerModeDemo']]);
    });

    it('« Explorer → » garde la case comme elle quand un import empêche la bascule', () => {
        const { win, appels, doc } = rendreAccueil({ importEmpeche: true });
        const cb = doc.getElementById('checkbox-demo-accueil');
        cb.checked = false;
        win.explorerDonneesDemo();
        expect(cb.checked).toBe(false);
        expect(appels).toEqual([]);
    });

    it('« Explorer → » ne réactive rien quand la démo est déjà active', () => {
        const { win, appels, doc } = rendreAccueil({ demo: true });
        const cb = doc.getElementById('checkbox-demo-accueil');
        cb.checked = true;
        win.explorerDonneesDemo();
        expect(cb.checked).toBe(true);
        expect(appels).toEqual([]);
    });

    it('index.html : trois colonnes égales, filets verticaux du trait de la carte, horizontaux sous 760 px ; focus visible', () => {
        const html = lire('index.html');
        expect(regle(html, '.accueil-portes')).toMatch(/grid-template-columns: repeat\(3, 1fr\)/);
        const trait = regle(html, '.accueil-portes').match(/border: 1px solid ([^;]+);/)[1];
        expect(regle(html, '.accueil-porte + .accueil-porte')).toContain('border-left: 1px solid ' + trait);
        expect(regle(html, '.accueil-porte'), 'pas de boîte autour d\'une colonne').not.toMatch(/border|background|box-shadow/);
        const media = html.match(/@media \(max-width: 760px\) \{\s*\.accueil-portes \{\s*grid-template-columns: 1fr;\s*\}\s*\.accueil-porte \+ \.accueil-porte \{([^}]*)\}/);
        expect(media, 'empilées sous 760 px').not.toBeNull();
        expect(media[1]).toContain('border-left: none');
        expect(media[1]).toContain('border-top: 1px solid ' + trait);
        expect(regle(html, '.accueil-porte-lien:focus-visible')).toContain('outline: 2px solid');
    });

    it('styles.css : en mode clair, les filets prennent le trait de la carte', () => {
        const css = lire('styles.css');
        expect(regle(css, '.mode-clair .accueil-porte + .accueil-porte')).toContain('border-color: rgba(3, 46, 92, 0.08)');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS (12 septembre 2026) — chaque mutation posée, lancée, remise (empreinte sha256 identique).
//   A1 index.html — le libellé du champ 2 re-marqué data-mot-nature="objetGroupeCours"                      → 1 rouge
//      ⚠ au premier passage du script de mutations, AUCUN rouge lu ; rejoué seul : 1 rouge. Le défaut était la
//      lecture de la sortie de Vitest par le script (premier lancement), pas la sentinelle. Noté pour ne pas le taire.
//   A2 trimestre-v2.js — l'option vide relue au point unique (motsNatureContexteActif().choisirObjet)          → 1 rouge
//   A3 trimestre-v2-orchestre.js — 'v2-gc-cours' remis dans OPTIONS_VIDES                                     → 1 rouge
//   A4 mots-nature.js — `choisirObjetGC` remis dans la table                                                  → 1 rouge
//   B1 accueil.js — une carte de tâche perd sa classe (sept tâches)                                           → 1 rouge
//   B2 accueil.js — la carte déplacée SOUS le label « Tâches »                                                 → 1 rouge
//   B3 accueil.js — « Commencer → » mène à suivi-interventions                                                → 1 rouge
//   B4 rencontres.js — « Tu es orthopédagogue ? » recopié dans un autre module                                → 1 rouge
//   B5 index.html — un bord gauche épais ajouté à la carte                                                    → 1 rouge
//   B6 styles.css — la carte retirée de la règle « mode clair » des cartes de l'accueil                        → 1 rouge
//   B7 accueil.js — « Ton courriel, une fois par mois ! »                                                     → 2 rouges
//
// BREAK-TESTS DU 14 octobre 2026 (texte « À propos ») — copie de référence, mutation, restauration (empreinte identique).
//   C1 accueil.js — « Apprends pas à pas. » redevient « Apprends geste par geste. »                          → 3 rouges
//   C2 accueil.js — la barre redevient « Bienvenue dans Labo Codex ! »                                         → 2 rouges
//   C3 accueil.js — l'amorce « Ton courriel, une fois par mois. » remise devant le paragraphe d'accès          → 1 rouge
//
// BREAK-TESTS DU 28 octobre 2026 (trois portes d'entrée) — copie de référence, mutation, restauration (empreinte identique).
//   D1 accueil.js — explorerDonneesDemo sans la garde « démo déjà active »                                   → 1 rouge
//   D2 accueil.js — « Tu enseignes ? » ouvre l'étape Cours au lieu de Trimestre                               → 1 rouge
//   D3 index.html — les colonnes s'empilent sous 768 px au lieu de 760 px                                      → 1 rouge
//   D4 accueil.js — « Explorer → » appelle activerModeDemo en contournant la case et sa garde                  → 2 rouges
//
// BREAK-TESTS DU 28 octobre 2026, soir (nouveau texte « À propos ») — copie de référence, mutation, restauration (empreinte identique).
//   E1 accueil.js — « sobre en carbone ! » devient « sobre en carbone. »                                     → 2 rouges
//   E2 accueil.js — « Par où commencer ? » et une <ol> remis dans le bandeau                                  → 1 rouge
//   E1 reproduit le 29 oct. 2026 (5 h 57), avant commit : 2 rouges, empreinte sha256 identique après restauration.
