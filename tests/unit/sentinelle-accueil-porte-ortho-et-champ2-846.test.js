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
//      trois colonnes séparées par des filets ; « Commencer » de la première mène à l'étape Trimestre.
//   7 nov. 2026, « L'accueil épuré » : les portes rentrent dans « À propos », sous « Par où
//      commencer ? », sans boîte à elles (jamais de carte dans une carte), avec de vrais boutons ;
//      empilées sous 820 px ; « Explorer » appelle activerModeDemo (la case « Données démo » est retirée).
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
// 7 nov. 2026 : la neuvième, « Organiser tes rencontres » (consigne « L'accueil épuré »).
const TACHES = ['Adopter ta pratique', 'Planifier ton cours', 'Saisir les présences', 'Importer des copies',
    'Annoter et évaluer', 'Observer le groupe', 'Consulter un profil', 'Différencier les interventions',
    'Organiser tes rencontres'];
// 19 oct. 2026 : les descriptions des huit tâches, dans l'ordre des titres (relecture de Grégoire avec Cowork).
const DESCRIPTIONS_TACHES = [
    'Construction de la note du cours, sommative ou alternative.',
    'Alignement constructif des objectifs, leçons et évaluations.',
    'Absences, retards et notes de séance.',
    'Fichiers PDF ou images des travaux d’étudiant·es.',
    'Annotation, niveaux ou note par critère, rétroaction automatisée.',
    'Assiduité, complétion, performance et dépistage des difficultés d’apprentissage.',
    'Engagement, travaux, progression et accompagnement.',
    'Niveaux de besoin, rencontres et bilans.',
    'Service d’orthopédagogie : suivi en petit groupe ou en individuel.'
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
// 7 nov. 2026 — « L'accueil épuré » (consigne de Grégoire) : « Bienvenue dans Labo Codex ! » et la phrase
// « Labo Codex est un outil… » partent ; la devise ouvre le corps ; « C’est une application » devient
// « Labo Codex est une application » ; chaque paragraphe sous son intertitre ; les portes, sous
// « Par où commencer ? », rentrent DANS « À propos ».
const TITRE_BANDEAU = 'À propos';
// 15 nov. 2026 : les quatre blocs et les deux paragraphes du bas remplacés (mots arrêtés avec Grégoire, relayés par
// Cowork) ; l'insécable (\u00a0) devant « : », « ? » et « ! ». « Tutoriels » part : deux liens.
// 16 nov. 2026 : texte révisé par Grégoire (approuvé à 5 h 53), remplacé en entier ; « Un espace autonome » devient
// « Un outil indépendant » ; l'insécable aussi à l'intérieur des guillemets ; un lien « Joindre la communauté ».
const MOTS_BANDEAU = [
    'Suivre l’apprentissage. Soutenir l’enseignement.',
    'Ce que fait l’application',
    'Préparer ton cours, saisir les présences, évaluer les travaux, gérer les notes\u00a0: ces gestes professionnels te sont familiers. Labo Codex les réunit dans un seul outil et en garde une mémoire que tu peux consulter quand tu veux. Semaine après semaine, elle t’offre un recul sur ta classe\u00a0: tu vois non seulement comment ton groupe évolue et répond à ce que tu proposes, mais aussi où en est précisément chaque étudiant·e. Accompagner chacun·e avec bienveillance est exigeant\u00a0: l’outil t’aide à y parvenir sans y laisser ta peau.',
    'Le jugement humain',
    'Il n’y a aucune intelligence artificielle dans l’application et aucune décision n’est prise à ta place. L’outil éclaire ton jugement professionnel, il ne le remplace pas. Il n’impose aucune pratique\u00a0: tu le règles selon la tienne. Et si tu pratiques une notation alternative, il convertit tes résultats en note chiffrée finale, sans tableur.',
    'Un outil indépendant',
    'Labo Codex fonctionne sur ton ordinateur, ta tablette et même ton téléphone. Pour passer de l’un à l’autre, tu enregistres ton codex, un fichier que tu transportes sur une clé USB ou dans ton nuage personnel. Conçu pour rester indépendant des géants du numérique, Labo Codex te laisse libre de tes choix sans t’isoler\u00a0: tes notes finales s’exportent vers le système de gestion scolaire de ton collège.',
    'Un accès gratuit et sécuritaire',
    'Labo Codex est en bêta publique depuis le 3 juin 2026\u00a0: ton expérience influence sa construction. Pour entrer, tu donnes ton adresse de courriel et tu reçois un code. C’est la seule information que tu transmets. Tout le reste demeure dans le navigateur de ton appareil, protégé comme le reste de ton ordinateur par ton mot de passe de session et tes sauvegardes habituelles. Il n’y a ni frais, ni abonnement, ni publicité.',
    'Besoin d’un coup de main\u00a0?',
    'L’aide est accessible dans l’application, sous «\u00a0Assistance\u00a0». Des parcours assistés t’y montrent les gestes un à un. Les guides pédagogiques sont là si tu veux aller plus loin.',
    'Envie d’en parler avec des collègues\u00a0?',
    'L’Association québécoise de pédagogie collégiale (AQPC) héberge une communauté de pratique Labo Codex. Enseignant·es et conseiller·ères pédagogiques y réfléchissent ensemble à leur pratique et construisent du matériel pédagogique et disciplinaire à partager.',
];
// Ce que la carte ne dit plus (consigne du 15 nov. 2026).
const MOTS_PARTIS_DU_BANDEAU = ['micro-données', 'SOLO', 'RàI', 'CoP', 'Modélisation', 'Pratique guidée', 'Tutoriels', 'codexnumeris.org/tutoriels',
    // 16 nov. 2026 : ce que le texte révisé ne dit plus.
    'Un espace autonome', 'bouffées de dopamine', 'sobre en carbone', 'ressources libres', 'en préparation', 'Son code est ouvert'];
// 28 oct. 2026 : les trois portes, dans l'ordre (mots donnés par Grégoire). 7 nov. 2026 : de vrais
// boutons, « Commencer », « Commencer », « Explorer », et la nouvelle phrase de la porte du conseiller.
// « Commencer » est écrit deux fois : vérifié dans l'ordre du rendu, pas par l'unicité de B3.
const MOTS_PORTES = [
    'Par où commencer ?',
    'Tu enseignes ?', 'Crée ton trimestre, ton cours et ton groupe, puis apporte ta grille d’évaluation.', '>Commencer<',
    'Tu es orthopédagogue ?', 'Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre.', '>Commencer<',
    'Tu es conseiller·ère pédagogique ?', 'Explore un cours de démonstration déjà configuré, aux données fictives mais réalistes.', '>Explorer<'];
const MOTS_UNIQUES_PORTES = MOTS_PORTES.filter(m => !m.startsWith('>') && m !== 'Par où commencer ?');

function rendreAccueil(options) {
    const opts = options || {};
    const elements = {};
    const appels = [];
    const doc = fauxDocument(elements);
    const win = chargerScript('js/accueil.js', {
        document: doc, obtenirPreference: () => ('preference' in opts ? opts.preference : false), definirPreference() {}, estEnModeDemo: () => !!opts.demo,
        afficherSection: (s) => appels.push(['section', s]), afficherSousSection: (s) => appels.push(['sous-section', s]),
        activerModeDemo: () => appels.push(['activerModeDemo']), desactiverModeDemo: () => appels.push(['desactiverModeDemo']),
        setTimeout: (f) => f(),
    }, {
        addEventListener() {},
        // Lus sur `window` par accueil.js : le panneau « Assistance » (la porte « Tu enseignes ? »
        // lance le parcours « Mettre ta classe en place ») et la garde de l'import (T7).
        Assistance: { parcours: () => [{ id: 'decouvrir', lancer: () => appels.push(['parcours', 'decouvrir']) },
            { id: 'classe', lancer: () => appels.push(['parcours', 'classe']) }] },
        importEmpecheLaBascule: opts.importEmpeche ? () => true : undefined,
        obtenirTrimestres: () => opts.trimestres || [],
    });
    win.afficherAccueil();
    return { html: elements['accueil-contenu'].innerHTML, win, appels, doc };
}

describe('B1 · les portes sont dans « À propos », au-dessus des tâches, et les tâches sont toutes là', () => {
    it('ordre : « À propos », puis « Par où commencer ? » et les portes DEDANS, puis le label « Tâches », puis la grille', () => {
        const { html } = rendreAccueil();
        const bandeau = tranche(html, 'id="banniere-bienvenue"', '<div class="accueil-section-label">Tâches</div>');
        const iLabel = bandeau.indexOf('<div class="accueil-section-label">Par où commencer ?</div>');
        const iCarte = bandeau.indexOf('class="accueil-portes"');
        expect(iLabel, 'le label est dans « À propos »').toBeGreaterThanOrEqual(0);
        expect(iCarte, 'les portes le suivent, dans « À propos »').toBeGreaterThan(iLabel);
        expect(html.indexOf('class="accueil-grille-actions"')).toBeGreaterThan(html.indexOf('<div class="accueil-section-label">Tâches</div>'));
        expect(html.match(/class="accueil-portes"/g), 'un seul encadré').toHaveLength(1);
        expect(html).not.toContain('accueil-porte-ortho');
    });

    it('les neuf cartes de tâches, dans leur ordre ; les portes n\'en sont pas', () => {
        const { html } = rendreAccueil();
        const titres = [...html.matchAll(/<div class="accueil-action-titre">([^<]*)<\/div>/g)].map(m => m[1]);
        expect(titres).toEqual(TACHES);
        expect(html.match(/class="accueil-action"/g)).toHaveLength(9);
        const carte = tranche(html, 'class="accueil-portes"', '<div class="accueil-section-label">Tâches</div>');
        expect(carte).not.toContain('accueil-action');
    });

    it('les descriptions des cartes (19 oct. et 7 nov. 2026) ; plus de cartes « Utilitaires » ni « Aide »', () => {
        const { html } = rendreAccueil();
        const lus = (classe) => [...html.matchAll(new RegExp('<div class="' + classe + '">([^<]*)</div>', 'g'))].map(m => m[1]);
        expect(lus('accueil-action-desc')).toEqual(DESCRIPTIONS_TACHES);
        // La règle de forme du 19 oct. (aucun deux-points) vaut pour les huit premières ; la neuvième, donnée
        // mot pour mot par Grégoire le 7 nov., en porte un.
        DESCRIPTIONS_TACHES.slice(0, 8).forEach((d) => expect(d, d).not.toContain(':'));
        expect(html).not.toMatch(/accueil-utilitaire|accueil-aide-|accueil-grille-bas|type="checkbox"/);
    });
});

describe('B2 · la porte de l\'orthopédagogie prend le chemin de la sous-navigation', () => {
    it('« Commencer » mène à Suivi › Rencontres par naviguerAccueilCarte, la route de la sous-navigation', () => {
        const { html, win, appels } = rendreAccueil();
        const porte = tranche(html, 'Tu es orthopédagogue ?', 'Tu es conseiller');
        const m = porte.match(/<button type="button" class="btn btn-principal accueil-porte-bouton" data-action="([^"]+)" data-param="([^"]+)">Commencer<\/button>/);
        expect(m, 'un bouton natif (clavier, Entrée/Espace)').not.toBeNull();
        expect(m[1]).toBe('naviguerAccueilCarte');
        expect(m[2]).toBe('suivi|suivi-rencontres');
        win.naviguerAccueilCarte(m[2]);
        expect(appels).toEqual([['section', 'suivi'], ['sous-section', 'suivi-rencontres']]);
        expect(lire('js/navigation.js')).toMatch(/'suivi-rencontres': 'nav-suivi-rencontres'/);
        expect(lire('js/config.js')).toMatch(/\{ id: 'rencontres', label: 'Rencontres' \}/);
        // Deux chemins vers les rencontres depuis l'accueil, et deux seulement : la porte et la neuvième tâche (7 nov.).
        expect(html.match(/suivi\|suivi-rencontres/g)).toHaveLength(2);
    });
});

describe('B3 · les mots viennent du rendu, et un seul endroit les écrit', () => {
    it('le rendu porte les mots arrêtés, dans l\'ordre, et plus les anciens', () => {
        const { html } = rendreAccueil();
        let curseur = -1;
        for (const mot of [...MOTS_BANDEAU, ...MOTS_PORTES]) {
            const i = html.indexOf(mot, curseur + 1);
            expect(i, mot).toBeGreaterThan(curseur);
            curseur = i;
        }
        expect(html).not.toContain('Bienvenue dans Labo Codex');
        expect(html).not.toContain('Labo Codex est un outil de soutien');
        expect(html).not.toContain('C’est une application');
        expect(html).not.toContain('Certains concepts sont nouveaux pour toi');
        expect(html).not.toContain('L’identification est requise');
        // 15 nov. 2026 : les anciens blocs, et les mots que la carte ne porte plus.
        expect(html).not.toContain('Ton jugement d’abord');
        expect(html).not.toContain('Un commun éducatif');
        expect(html).not.toContain('Tes données chez toi');
        expect(html).not.toContain('Certains concepts sont nouveaux');
        expect(html).not.toContain('support humain');
        const bandeau = tranche(html, 'id="banniere-bienvenue"', 'class="accueil-portes"');
        for (const mot of MOTS_PARTIS_DU_BANDEAU) expect(bandeau, mot).not.toContain(mot);
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

    it('« À propos » sans étapes, sans « — » ni <br> ; la ligne de l\'orthopédagogue reste dans sa porte', () => {
        const { html } = rendreAccueil();
        const bandeau = tranche(html, 'id="banniere-bienvenue"', 'class="accueil-portes"');
        expect(bandeau).not.toMatch(/<ol[\s>]/);
        expect(bandeau).not.toContain('Tu es orthopédagogue ?');
        expect(html).not.toContain('Décris ton service dans Suivi › Rencontres');
        expect(html).not.toContain('Une belle occasion de développement professionnel');
        expect(bandeau).not.toContain('—');
        expect(bandeau).not.toContain('<br>');
    });

    it('deux liens texte à gauche, mêmes actions ; « Tutoriels » est parti (15 nov. 2026) ; « Joindre la communauté » à droite (16 nov.)', () => {
        const { html } = rendreAccueil();
        const bas = tranche(html, 'class="apropos-deux', 'class="accueil-portes"');
        const liens = [...bas.matchAll(/<(button|a) [^>]*class="apropos-lien"[^>]*>[\s\S]*?<\/\1>/g)].map(m => m[0]);
        expect(liens).toHaveLength(3);
        // Lot « Les deux parcours » (8 nov. 2026) : « Visite guidée » devient « Assistance » et ouvre le panneau.
        expect(liens[0]).toMatch(/data-action="ouvrirPanneauAssistance">Assistance</);
        expect(liens[1]).toMatch(/data-action="naviguerAccueilCarte" data-param="labo\|labo-accompagnement">Guides pédagogiques</);
        // 16 nov. 2026 : le lien de la communauté, après le paragraphe de droite, ouvert comme les liens externes
        // de l'application (nouvel onglet, noopener noreferrer), et hors de la boîte dorée.
        expect(liens[2]).toMatch(/^<a class="apropos-lien" href="https:\/\/www\.aqpc\.qc\.ca\/fr\/cop-labocodex" target="_blank" rel="noopener noreferrer">Joindre la communauté</);
        expect(bas.indexOf(liens[2])).toBeGreaterThan(bas.indexOf('à partager.'));
        expect(tranche(bas, 'class="banniere-bienvenue-acces"', '</div>')).not.toContain('apropos-lien');
        expect(html).not.toContain('btn btn-secondaire');
    });

    it('chaque mot n\'est écrit qu\'une fois, dans js/accueil.js — ni ailleurs dans js/, ni dans index.html', () => {
        const sources = readdirSync(path.join(RACINE, 'js')).filter(f => f.endsWith('.js')).map(f => ['js/' + f, sansCommentaires(lire('js/' + f))]);
        sources.push(['index.html', lire('index.html')]);
        // Les intertitres sont courts : ils pourraient se dire ailleurs ; on n'en exige pas l'unicité.
        for (const mot of [...MOTS_UNIQUES_PORTES, ...MOTS_BANDEAU].filter((m) => m.length > 30)) {
            const lieux = sources.flatMap(([f, code]) => Array(code.split(mot).length - 1).fill(f));
            expect(lieux, mot).toEqual(['js/accueil.js']);
        }
    });
});

describe('B4 · jamais de carte dans une carte : « À propos » est la carte, les portes n\'ont pas de boîte', () => {
    const regle = (css, sel) => {
        const m = css.match(new RegExp('\\n\\s*' + sel.replace(/[.+]/g, '\\$&') + '\\s*\\{([^}]*)\\}'));
        return m ? m[1] : null;
    };
    it('index.html : ni fond, ni trait, ni ombre sur l\'encadré des portes ni sur une porte ; la sarcelle reste à la démo', () => {
        const html = lire('index.html');
        for (const sel of ['.accueil-portes', '.accueil-porte']) {
            const r = regle(html, sel);
            expect(r, sel).not.toBeNull();
            expect(r, sel).not.toMatch(/background|(^|\s)border:|box-shadow/);
        }
        expect(html).not.toMatch(/\.accueil-porte[\w-]*\s*\{[^}]*(sarcelle|--acc-)/);
        expect(rendreAccueil().html).toMatch(/class="banniere-bienvenue carte /);
    });
});

describe('B5 · trois portes d\'entrée (28 oct. 2026), de vrais boutons (7 nov. 2026)', () => {
    const portes = (html) => tranche(html, 'class="accueil-portes"', '<div class="accueil-section-label">Tâches</div>')
        .split('<div class="accueil-porte">').slice(1);
    const regle = (css, sel) => {
        const m = css.match(new RegExp('\\n\\s*' + sel.replace(/[.+]/g, '\\$&') + '\\s*\\{([^}]*)\\}'));
        return m ? m[1] : null;
    };

    it('trois colonnes, chacune : une question en titre, une phrase, un vrai bouton', () => {
        const { html } = rendreAccueil();
        const p = portes(html);
        expect(p).toHaveLength(3);
        const titres = p.map(c => c.match(/<div class="accueil-porte-titre">([^<]*)<\/div>/)[1]);
        expect(titres).toEqual(['Tu enseignes ?', 'Tu es orthopédagogue ?', 'Tu es conseiller·ère pédagogique ?']);
        const boutons = p.map((c) => c.match(/<button type="button" class="btn btn-principal accueil-porte-bouton" data-action="[^"]+"[^>]*>([^<]+)<\/button>/)[1]);
        expect(boutons).toEqual(['Commencer', 'Commencer', 'Explorer']);
        p.forEach((c) => expect(c).toMatch(/<div class="accueil-porte-desc">[^<]+<\/div>/));
    });

    // Lot « Les deux parcours », partie 2 (9 nov. 2026) : la porte lance le deuxième parcours, qui
    // ouvre lui-même Cadre › Trimestre et ses blocs (avant : l'accordéon Trimestre, par la barre).
    it('« Tu enseignes ? » : le parcours « Mettre ta classe en place », et lui seul', () => {
        const { html, win, appels } = rendreAccueil();
        expect(portes(html)[0]).toContain('data-action="commencerParLeTrimestre">Commencer</button>');
        win.commencerParLeTrimestre();
        expect(appels).toEqual([['parcours', 'classe']]);
        expect(lire('js/trimestre-v2.js')).toMatch(/'trimestre': 'accordeon-gestion-trimestres'/);
        expect(lire('js/parcours-classe.js')).toContain('e.accordeon');
    });

    it('« Explorer » appelle activerModeDemo (qui porte la garde de l\'import, T7) ; rien quand la démo est déjà active', () => {
        const { html, win, appels } = rendreAccueil();
        expect(portes(html)[2]).toContain('data-action="explorerDonneesDemo">Explorer</button>');
        win.explorerDonneesDemo();
        expect(appels).toEqual([['activerModeDemo']]);
        const deja = rendreAccueil({ demo: true });
        deja.win.explorerDonneesDemo();
        expect(deja.appels).toEqual([]);
    });

    it('index.html : trois colonnes égales, filets verticaux, horizontaux sous 820 px', () => {
        const html = lire('index.html');
        expect(regle(html, '.accueil-portes')).toMatch(/grid-template-columns: repeat\(3, 1fr\)/);
        expect(regle(html, '.accueil-porte + .accueil-porte')).toContain('border-left: 1px solid var(--bordure-claire)');
        const media = html.match(/@media \(max-width: 819px\) \{\s*\.accueil-portes \{\s*grid-template-columns: 1fr;\s*\}[\s\S]*?\.accueil-porte \+ \.accueil-porte \{([^}]*)\}/);
        expect(media, 'empilées sous 820 px').not.toBeNull();
        expect(media[1]).toContain('border-left: none');
        expect(media[1]).toContain('border-top: 1px solid var(--bordure-claire)');
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
//
// BREAK-TESTS DU 7 novembre 2026 (« L'accueil épuré ») — copie de référence, mutation, restauration.
//   F1 accueil.js — « Labo Codex est une application » redevient « C’est une application »                  → 2 rouges
//   F2 accueil.js — « Explorer » n'appelle plus activerModeDemo                                              → 3 rouges (avec T7)
//   Empreinte sha256 de accueil.js identique après restauration (41c2eb5d18ab).

describe('« À propos » repliée par défaut une fois qu\'on a un trimestre (Grégoire, 27 nov. 2026)', () => {
    const repliee = (opts) => /id="banniere-bienvenue"/.test(rendreAccueil(opts).html)
        && /banniere-bienvenue carte est-replie/.test(rendreAccueil(opts).html);
    const AVEC = [{ id: 'a2026' }];
    it('avec un trimestre et sans choix enregistré : repliée', () => {
        expect(repliee({ trimestres: AVEC, preference: undefined })).toBe(true);
    });
    it('avec un trimestre, ouverte par la personne (false enregistré) : elle reste ouverte', () => {
        expect(repliee({ trimestres: AVEC, preference: false })).toBe(false);
    });
    it('avec un trimestre, repliée par la personne : repliée', () => {
        expect(repliee({ trimestres: AVEC, preference: true })).toBe(true);
    });
    it('sans trimestre (le nouveau venu), ou avec la démo seule : ouverte, quel que soit le choix', () => {
        expect(repliee({ trimestres: [], preference: true })).toBe(false);
        expect(repliee({ trimestres: [{ id: 'demo' }], preference: undefined })).toBe(false);
    });
});
