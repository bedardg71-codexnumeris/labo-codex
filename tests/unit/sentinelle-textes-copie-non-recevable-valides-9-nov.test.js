/**
 * #1176 — LES TEXTES DE « ÉCARTER UNE COPIE PLAGIÉE, OU LUI METTRE 0 », VALIDÉS PAR GRÉGOIRE MOT POUR MOT
 * (9 nov. 2026, 10 h 08 à 10 h 13, en Cowork ; relayés par la consigne de la session cloud du 9 nov.).
 *
 * Posés la nuit du 8 au 9 nov. comme PROPOSÉS ; Grégoire les a validés tels quels, sauf trois retouches à lui :
 *   1. la ligne sur la copie, en standards, au pool (portfolio ou productions retenues), quand le mode de sélection de la
 *      pratique est « N meilleures » : « lui mettre 0 » dit que ce 0 ne compte que s'il te manque des productions ; les
 *      autres modes (tous, derniers, hybride) gardent le texte commun ;
 *   2. l'assistant, « Lui mettre 0 » en standards ;
 *   3. l'Aide, la puce « Lui mettre 0 » ; et (question 6) la carte « Travail NON REMIS » et l'aide de « Notes finalisées ».
 * Cette sentinelle EXIGE chacun de ces textes, là où l'utilisateur les lit : la ligne de la copie au rendu réel
 * (evaluation-sauvegarde.js sur le bloc de index.html), l'assistant par ses options, les réglages, l'avis et l'Aide dans
 * index.html. Les insécables ne sont pas des mots : elles sont ramenées à l'espace avant comparaison.
 * Et plus aucune marque « PROPOSÉS, EN ATTENTE DE GRÉGOIRE » sur ces textes.
 *
 * BREAK-TESTS (9 nov. 2026, une mutation à la fois, fichier restauré) : voir le rapport
 * `plans de travail/RAPPORT-2026-11-09-copie-non-recevable-choix.md`, § « La sentinelle des textes validés ».
 *
 *   cd tests && npx vitest run unit/sentinelle-textes-copie-non-recevable-valides-9-nov.test.js
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const HTML = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
/** Les mots, sans la typographie : insécables ramenées à l'espace, blancs resserrés, apostrophe droite. */
const net = (s) => String(s).replace(/[  ]/g, ' ').replace(/\s+/g, ' ').replace(/’/g, '\'').trim();
const texteHtml = (fragment) => net(new JSDOM('<!doctype html><body>' + fragment + '</body>').window.document.body.textContent);

/* ─────────────────────────────────────────────── La ligne sur la copie, au rendu réel */

const registre = chargerScript('js/pratiques/pratique-registre.js', {}, {});

/** Le menu « Intégrité académique » et le bloc du choix, tels qu'index.html les porte, et le vrai module. */
function ligneDeLaCopie({ famille, regle = null, productions = [], productionId = null, configuration = null }) {
    const bloc = tranche(HTML, '<select id="statutIntegrite"', '<div id="divNotesIntegrite"');
    const dom = new JSDOM('<!doctype html><body>' + bloc + '<select id="selectProduction1"><option value="' + (productionId || '') + '" selected></option></select></body>');
    const document = dom.window.document;
    const win = chargerScript('js/evaluation-sauvegarde.js', {
        document, evaluationEnCours: { statutIntegrite: 'recevable' },
        libelleCopieNonRecevable: registre.libelleCopieNonRecevable,
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? productions : []),
        db: { getSync: (k, d) => d, setSync() {} }, cle: (k) => k,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} }
    });
    Object.assign(win, {
        SORTS_COPIE_NON_RECEVABLE: registre.SORTS_COPIE_NON_RECEVABLE,
        identifierProductionTerminale: registre.identifierProductionTerminale,
        poolStdFaitDArtefacts: registre.poolStdFaitDArtefacts,
        obtenirTypePratiqueActive: () => famille,
        sortCopieNonRecevableDeLaPratiqueActive: () => regle,
        obtenirConfigPratiqueActive: () => configuration,
        obtenirConfigCategories: () => (configuration && configuration.categories && configuration.categories.actif ? configuration.categories : null)
    });
    document.getElementById('statutIntegrite').value = 'plagiat';
    win.afficherChoixCopieNonRecevable();
    const t = (id) => net(document.getElementById(id).textContent);
    return {
        visible: !document.getElementById('divSortNonRecevable').classList.contains('u-hide'),
        titre: t('titreSortNonRecevable'), ecarter: t('libelleSortNonRecevableEcarter'), zero: t('libelleSortNonRecevableZero'),
        aide: t('aideSortNonRecevable')
    };
}

const ARTEFACTS = [{ id: 'A1', type: 'artefact-portfolio' }, { id: 'A2', type: 'artefact-portfolio' }, { id: 'T1', type: 'terminale' }];
const SANS_ARTEFACT = [{ id: 'R1', type: 'travail' }, { id: 'R2', type: 'travail' }, { id: 'T1', type: 'terminale' }];
const portfolio = (methodeSelection, extra) => Object.assign({ portfolio: Object.assign({ actif: true, nombreARetenir: 4 }, methodeSelection ? { methodeSelection } : {}) }, extra || {});
const HYBRIDE = portfolio('meilleurs', { categories: { actif: true } });

// Le tableau du rapport, validé tel quel (les mots de Grégoire sur la variante « N meilleures » en plus).
const N_MEILLEURES = ' ; en « N meilleures », ce 0 ne compte que s\'il te manque des productions';
const LIGNE = {
    sommative: ['l\'écarter, comme une copie non remise : elle n\'entre pas dans la moyenne', 'lui mettre 0 : elle compte pour 0 dans la moyenne'],
    specifications: ['l\'écarter, comme un travail non remis', 'lui mettre 0 : elle compte comme un travail non satisfaisant'],
    portfolio: ['l\'écarter, comme une copie non remise : elle manque au portfolio', 'lui mettre 0 : elle entre au portfolio avec 0'],
    productions: ['l\'écarter, comme une copie non remise : elle manque aux productions retenues', 'lui mettre 0 : elle entre aux productions retenues avec 0'],
    obligatoire: ['l\'écarter, comme une obligatoire non remise : elle vaut 0 une fois les notes finales cochées', 'lui mettre 0 : elle compte pour 0 tout de suite'],
    terminale: ['l\'écarter, comme une terminale non remise : la note reste provisoire, puis la terminale vaut 0 une fois les notes finales cochées', 'lui mettre 0 : la terminale vaut 0 tout de suite'],
    generique: ['l\'écarter, comme une copie non remise', 'lui mettre 0']
};

describe('La ligne sur la copie — le tableau validé, et la variante « N meilleures » de Grégoire', () => {
    it('le titre et la règle de la pratique, mot pour mot', () => {
        const vu = ligneDeLaCopie({ famille: 'sommative', regle: 'zero' });
        expect(vu.visible).toBe(true);
        expect(vu.titre).toBe('Dans la note du cours :');
        expect(vu.aide).toBe('Règle de ta pratique : lui mettre 0. Ton choix ne vaut que pour cette copie.');
        expect(ligneDeLaCopie({ famille: 'standards', regle: 'ecarter', productions: ARTEFACTS, productionId: 'A1', configuration: portfolio('tous') }).aide)
            .toBe('Règle de ta pratique : l\'écarter. Ton choix ne vaut que pour cette copie.');
    });

    it('sommative, spécifications, sans pratique', () => {
        const som = ligneDeLaCopie({ famille: 'sommative', regle: 'zero' });
        expect([som.ecarter, som.zero]).toEqual(LIGNE.sommative);
        const spe = ligneDeLaCopie({ famille: 'specifications', regle: 'zero' });
        expect([spe.ecarter, spe.zero]).toEqual(LIGNE.specifications);
        const aucune = ligneDeLaCopie({ famille: null, regle: null });
        expect([aucune.ecarter, aucune.zero, aucune.aide]).toEqual([...LIGNE.generique, 'Ton choix ne vaut que pour cette copie.']);
    });

    it('standards, portfolio : « N meilleures » prend la variante ; tous, derniers, hybride gardent le texte commun', () => {
        const vu = (configuration) => {
            const v = ligneDeLaCopie({ famille: 'standards', regle: 'ecarter', productions: ARTEFACTS, productionId: 'A1', configuration });
            return [v.ecarter, v.zero];
        };
        expect(vu(portfolio('meilleurs'))).toEqual([LIGNE.portfolio[0], LIGNE.portfolio[1] + N_MEILLEURES]);
        expect(vu(portfolio(null)), 'sans mode écrit, le calcul lit « meilleurs »').toEqual([LIGNE.portfolio[0], LIGNE.portfolio[1] + N_MEILLEURES]);
        expect(vu(portfolio('tous'))).toEqual(LIGNE.portfolio);
        expect(vu(portfolio('derniers'))).toEqual(LIGNE.portfolio);
        expect(vu(HYBRIDE), 'l\'hybride stocke « meilleurs » mais reste un autre mode').toEqual(LIGNE.portfolio);
        expect(vu(portfolio('meilleurs', { portfolio: { actif: true, methodeSelection: 'meilleurs', hybride: true } }))).toEqual(LIGNE.portfolio);
        expect(vu(null), 'sans configuration de portfolio : le texte commun').toEqual(LIGNE.portfolio);
    });

    it('standards sans « Artefact » : l\'équivalent « aux productions retenues »', () => {
        const vu = (configuration) => {
            const v = ligneDeLaCopie({ famille: 'standards', regle: 'ecarter', productions: SANS_ARTEFACT, productionId: 'R1', configuration });
            return [v.ecarter, v.zero];
        };
        expect(vu(portfolio('meilleurs'))).toEqual([LIGNE.productions[0], LIGNE.productions[1] + N_MEILLEURES]);
        expect(vu(portfolio('tous'))).toEqual(LIGNE.productions);
    });

    it('standards, obligatoire (hybride) et terminale : le texte du tableau, quel que soit le mode', () => {
        const obl = ligneDeLaCopie({ famille: 'standards', regle: 'ecarter', productionId: 'A1', configuration: HYBRIDE,
            productions: [{ id: 'A1', type: 'artefact-portfolio', categorie: 'obligatoire' }, { id: 'T1', type: 'terminale' }] });
        expect([obl.ecarter, obl.zero]).toEqual(LIGNE.obligatoire);
        const term = ligneDeLaCopie({ famille: 'standards', regle: 'ecarter', productions: ARTEFACTS, productionId: 'T1', configuration: portfolio('meilleurs') });
        expect([term.ecarter, term.zero]).toEqual(LIGNE.terminale);
    });

    it('la source porte les insécables de la typographie (deux-points, point-virgule, guillemets)', () => {
        const s = lire('js/evaluation-sauvegarde.js');
        expect(s).toContain('\'lui mettre 0\\u00a0: elle entre au portfolio avec 0\\u00a0; en «\\u00a0N meilleures\\u00a0», ce 0 ne compte que s\\\'il te manque des productions\'');
    });
});

/* ─────────────────────────────────────────────── L'assistant */

const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} };
const winAssistant = chargerScript('js/pratiques/modalites-evaluation.js', { db, cle: (k) => k, notifications: { erreur() {}, succes() {} }, echapperHtml: (s) => String(s == null ? '' : s) });
chargerScript('js/wizard-pratique-v2.js', { db, cle: (k) => k, notifications: { erreur() {}, succes() {} }, echapperHtml: (s) => String(s == null ? '' : s),
    normaliserIdPratique: (t) => t, genererIdUnique: () => 'id' }, winAssistant);

describe('L\'assistant — les textes validés ; « Lui mettre 0 » en standards est celui de Grégoire', () => {
    const etape = winAssistant.ETAPES_WIZARD['copie-non-recevable'];
    const options = (famille) => etape.getChampsDynamiques({ typePratique: famille })[0].options.map(o => [o.label, net(o.description)]);

    it('le titre, la question, l\'encadré', () => {
        expect(etape.titre).toBe('Une copie non recevable');
        expect(net(etape.description)).toBe('Quand tu marques une copie non recevable (plagiat, IA non autorisée), que devient-elle dans la note ?');
        expect(net(etape.getChampsDynamiques({ typePratique: 'sommative' })[1].texte)).toBe('C\'est ta règle. Quand tu marqueras une copie non recevable, '
            + 'elle apparaîtra déjà cochée, et tu pourras la changer pour cette copie-là. La règle elle-même se change dans les réglages de ta pratique.');
    });

    it('les deux réponses, famille par famille', () => {
        expect(options('sommative')).toEqual([['L\'écarter', 'Elle n\'entre pas dans la moyenne, comme une copie non remise.'], ['Lui mettre 0', 'Elle compte pour 0 dans la moyenne.']]);
        expect(options('specifications')).toEqual([['L\'écarter', 'Elle compte comme un travail non remis.'], ['Lui mettre 0', 'Elle compte comme un travail non satisfaisant.']]);
        expect(options('standards')).toEqual([
            ['L\'écarter', 'Elle manque au portfolio, comme une copie non remise. Une terminale écartée laisse la note provisoire, puis vaut 0 une fois les notes finales cochées.'],
            ['Lui mettre 0', 'Elle entre au portfolio avec 0 ; en « N meilleures », ce 0 ne compte que s\'il te manque des productions. Une terminale vaut 0.']]);
    });
});

/* ─────────────────────────────────────────────── Les réglages, l'avis, l'Aide */

describe('Les réglages de la pratique, l\'avis du formulaire et l\'Aide — mot pour mot', () => {
    it('les réglages : la ligne, ses deux choix, son aide ; et l\'aide de « Notes finalisées » (question 6)', () => {
        const reglages = tranche(HTML, '<div class="groupe-form u-mt-15" id="mat-sort-non-recevable"', '<input type="checkbox" id="mat-notes-finales"');
        const t = texteHtml(reglages);
        expect(t).toContain('Une copie non recevable (plagiat, IA non autorisée), dans la note L\'écarter, comme une copie non remise Lui mettre 0 '
            + 'Ta règle. Quand tu marques une copie non recevable, elle apparaît déjà cochée ; tu peux la changer pour cette copie-là.');
        const notesFinales = texteHtml(tranche(HTML, '<input type="checkbox" id="mat-notes-finales"', '</p>'));
        expect(notesFinales).toMatch(/À activer en fin de session, quand les notes sont arrêtées\. En standards, une terminale non remise ou écartée vaut alors 0\.$/);
    });

    it('l\'avis « Travail non recevable » : la phrase sur la note est retirée (validé), le reste mot pour mot', () => {
        const s = lire('js/evaluation-sauvegarde.js');
        const avis = tranche(s, 'const AVIS_COPIE_NON_RECEVABLE = Object.freeze({', '});');
        expect(avis).not.toContain('Dans la note du cours, elle vaut');
        expect(avis).toContain('Ton évaluation est gardée, mais la copie montre «\\u00a0Non recevable\\u00a0» au lieu de sa note et de ses niveaux, \'');
        expect(avis).toContain('\'jusque sur le PDF de l\\\'étudiant·e. Dans la complétion, elle compte \'');
        expect(avis).toContain('\'comme non remise. Retirer le statut fait tout revenir.\'');
    });

    it('l\'Aide, « Travail NON RECEVABLE » : le paragraphe validé, la puce « Lui mettre 0 » de Grégoire', () => {
        const carte = texteHtml(tranche(HTML, '<h4 class="u-mb-10 u-texte-bleu">Travail NON RECEVABLE (Plagiat ou IA)</h4>', '<p>La moyenne de la Liste'));
        expect(carte).toContain('Une copie non recevable compte comme non remise dans la complétion (C) ; elle reste dans le total attendu. Dans la note, '
            + 'c\'est toi qui choisis son sort. Ta pratique de notation porte ta règle ; quand tu marques une copie non recevable, ta règle apparaît déjà '
            + 'cochée sous le menu, et tu peux la changer pour cette copie-là. '
            + '« L\'écarter » : elle est traitée comme une copie non remise. En sommative, elle n\'entre pas dans la moyenne ; en spécifications, elle '
            + 'compte comme un travail non remis ; en standards, elle manque au portfolio, avec ce que ta pratique fait d\'une copie manquante. Une '
            + 'terminale écartée laisse la note provisoire, puis vaut 0 une fois les notes finales cochées, comme une terminale non remise ; en mode '
            + 'hybride, une obligatoire écartée aussi. '
            + '« Lui mettre 0 » : 0 en sommative, un travail non satisfaisant en spécifications, 0 en standards, au portfolio comme à la terminale ; '
            + 'en « N meilleures », ce 0 ne compte que s\'il manque des productions. '
            + 'En dénotation, ta note est ton jugement : la copie n\'y entre pas par calcul. '
            + 'Une pratique créée avant ce choix, tant que tu ne choisis pas sa règle, lit : 0 en sommative, un travail non satisfaisant en '
            + 'spécifications, « L\'écarter » en standards. Tu changes sa règle dans Conception → Pratiques. Une reprise remplace la copie non '
            + 'recevable, quel que soit son sort.');
    });

    it('l\'Aide, « Travail NON REMIS » : l\'exemple de Grégoire (question 6), l\'ancien retiré', () => {
        const carte = texteHtml(tranche(HTML, '<h4 class="u-mb-10 u-texte-bleu">Travail NON REMIS</h4>', '</div>'));
        expect(carte).toContain('La note dépend de ta pratique ; par exemple, en sommative, il n\'y entre pas. '
            + 'En standards, une fois les notes finales cochées, une terminale non remise vaut 0 ; en mode hybride, une obligatoire non remise aussi.');
        expect(carte).not.toContain('en standards hybride, une fois les notes finales cochées, une obligatoire non remise vaut 0');
    });
});

describe('Plus aucune marque « proposé, en attente » sur ces textes', () => {
    it('evaluation-sauvegarde.js, wizard-pratique-v2.js, index.html', () => {
        const attente = /PROPOS[ÉE]S?,? EN ATTENTE DE GR[ÉE]GOIRE|PROPOS[ÉE]S?, en attente de Grégoire/i;
        for (const f of ['js/evaluation-sauvegarde.js', 'js/wizard-pratique-v2.js']) expect(lire(f), f).not.toMatch(attente);
        const aide = tranche(HTML, '<h4 class="u-mb-10 u-texte-bleu">Travail NON RECEVABLE (Plagiat ou IA)</h4>', '<p>La moyenne de la Liste');
        expect(aide).not.toMatch(attente);
        expect(tranche(HTML, '<div class="groupe-form u-mt-15" id="mat-sort-non-recevable"', '<input type="checkbox" id="mat-notes-finales"')).not.toMatch(attente);
        expect(HTML).not.toContain('(TEXTES_SORT_COPIE_NON_RECEVABLE) : PROPOSÉS');
        expect(HTML).not.toContain('Les mots : PROPOSÉS, en attente de Grégoire');
    });
});
