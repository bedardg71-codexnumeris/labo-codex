import { describe, it, expect } from 'vitest';
import { chargerCodex } from './_helpers/charger-codex.js';
import { chargerScript } from './_helpers/charger-script.js';

/**
 * #1186 (29 oct. 2026) — la fenêtre de fusion en deux colonnes.
 *
 * Ce banc juge les fonctions pures : le défaut de #1182 dans `_direCeQuiEntre` (une liste nommée
 * sans `id` qui n'existe que dans l'autre codex faisait casser le résumé) ; la lecture unique de
 * l'appareil (appareil.js) sur des chaînes d'agent réelles. Noms fictifs.
 */

const T = 'a2031';
const CHRONO = T + '_chronoEvaluations';
const Codex = chargerCodex().Codex;

const durees = (n) => Array.from({ length: n }, (_, i) => ({ date: '2031-09-0' + (1 + (i % 9)) + 'T10:0' + i + ':00Z', duree: 60 + i }));

describe('#1186 · § 1 — une liste nommée sans id, seulement dans l\'autre codex', () => {
    it('la fin de la fusion la compte en durées d\'évaluation, sans casser', () => {
        const ici = {};
        const labas = { [CHRONO]: durees(3) };
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.importees, 'témoin : la liste vient entière de l\'autre codex').toEqual([CHRONO]);
        const fin = Codex._direLaFinDeLaFusion('Codex fictif', analyse, labas, {}, { importes: 0, erreurs: [] }, false);
        expect(fin).toContain('3 durées d\'évaluation');
    });
});

// Des chaînes d'agent réelles (relevées des navigateurs, versions de 2026).
const UA = {
    macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
    macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Safari/605.1.15',
    ipadSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Safari/605.1.15',
    iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1',
    iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/156.0.7390.70 Mobile/15E148 Safari/604.1',
    windowsChrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
    windowsEdge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36 Edg/156.0.3485.54',
    androidChrome: 'Mozilla/5.0 (Linux; Android 16; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36',
    chromebook: 'Mozilla/5.0 (X11; CrOS x86_64 16267.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36',
    linuxFirefox: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0'
};
const Appareil = chargerScript('js/appareil.js').Appareil;
const lu = (ua, points = 0) => {
    const i = Appareil.lire(ua, points);
    return Appareil.libelle(i) + ' · ' + (i.navigateur + ' ' + i.version).trim() + ' · ' + (i.systeme + ' ' + i.versionSysteme).trim();
};

describe('#1186 · la lecture unique de l\'appareil', () => {
    it('chaque appareil et chaque navigateur, sur des chaînes réelles', () => {
        expect(lu(UA.macChrome)).toBe('Mac, Chrome · Chrome 156 · macOS 10.15.7');
        expect(lu(UA.macSafari)).toBe('Mac, Safari · Safari 27.2 · macOS 10.15.7');
        expect(lu(UA.ipadSafari, 5), 'l\'iPad se dit « Macintosh » : l\'écran tactile le trahit').toBe('iPad, Safari · Safari 27.2 · iPadOS');
        expect(lu(UA.iphoneSafari, 5)).toBe('iPhone, Safari · Safari 27.2 · iOS');
        expect(lu(UA.iphoneChrome, 5), 'Chrome d\'iOS (CriOS)').toBe('iPhone, Chrome · Chrome 156 · iOS');
        expect(lu(UA.windowsChrome)).toBe('PC Windows, Chrome · Chrome 156 · Windows');
        expect(lu(UA.windowsEdge), 'Edge avant Chrome').toBe('PC Windows, Edge · Edge 156 · Windows');
        expect(lu(UA.androidChrome, 5), 'Android n\'est pas Linux').toBe('Android, Chrome · Chrome 156 · Android 16');
        expect(lu(UA.chromebook)).toBe('Chromebook, Chrome · Chrome 156 · ChromeOS');
        expect(lu(UA.linuxFirefox)).toBe('PC Linux, Firefox · Firefox 146 · Linux');
    });

    it('le manifeste garde sa forme : « Mac — Chrome », « Chrome 156 / macOS »', () => {
        expect(Appareil.pourLeManifeste(Appareil.lire(UA.windowsEdge, 0))).toEqual({ appareil: 'PC Windows — Edge', navigateur: 'Edge 156 / Windows' });
        expect(Appareil.pourLeManifeste(Appareil.lire(UA.ipadSafari, 5))).toEqual({ appareil: 'iPad — Safari', navigateur: 'Safari 27.2 / iPadOS' });
    });

    it('un codex ancien « Mac — Chrome » écrit sous Windows se lit par son navigateur', () => {
        expect(Appareil.libelleDuManifeste({ appareil: 'Mac — Chrome', navigateur: 'Chrome 146 / Windows' })).toBe('PC Windows, Chrome');
        expect(Appareil.libelleDuManifeste({ appareil: 'iPad — Safari', navigateur: 'Safari 17 / iPadOS' })).toBe('iPad, Safari');
        expect(Appareil.libelleDuManifeste({ appareil: 'Mac — Safari' }), 'sans navigateur : l\'appareil').toBe('Mac, Safari');
        expect(Appareil.libelleDuManifeste({ navigateur: 'Inconnu / Inconnu' }), 'rien ne se lit').toBe('');
        expect(Appareil.libelleDuManifeste(null)).toBe('');
    });
});

describe('#1186 · ce que montre une rangée', () => {
    it('une clé-objet dont une entrée change : l\'entrée devient le titre, « N autres identiques »', () => {
        const ici = { preferencesRythme: { heuresJour: 6, dateObjectif: '2026-10-30', marge: 1.25 } };
        const labas = { preferencesRythme: { heuresJour: 6, dateObjectif: '2026-10-02', marge: 1.25 } };
        const analyse = Codex._analyserFusion(ici, labas);
        expect(analyse.conflits, 'témoin : un conflit de clé entière').toEqual([{ cle: 'preferencesRythme' }]);
        const r = Codex._decrireLeConflit(analyse.conflits[0], ici, labas);
        expect(r).toEqual({
            cle: 'preferencesRythme', titre: 'Date objectif (remise)', qui: 'Le rythme de travail',
            ici: { texte: '30 octobre 2026', detail: '2 autres identiques' },
            autre: { texte: '2 octobre 2026', detail: '2 autres identiques' },
            recente: null
        });
    });

    it('plusieurs entrées changent : la première nommée, « absente » quand elle manque d\'un côté', () => {
        const ici = { retroactionsObservations: { 'comp-uni': 'Texte fictif un.', 'comp-multi': 'Texte fictif deux.', 'act-a': 'Pareil.' } };
        const labas = { retroactionsObservations: { 'act-a': 'Pareil.' } };
        const r = Codex._decrireLeConflit({ cle: 'retroactionsObservations' }, ici, labas);
        expect(r.titre).toBe('Les textes de tes tampons');
        expect(r.qui).toBe('Annotation › Tampons');
        expect(r.ici).toEqual({ texte: 'comp-uni : « Texte fictif un. »', detail: '1 autre différence · 1 autre identique' });
        expect(r.autre.texte).toBe('comp-uni : absente');
    });

    it('un tampon personnalisé au même nom, à l\'image changée : « Diffère par : image »', () => {
        const ici = { personnalisationObservations: { 'custom-1': { nom: 'Fictif', imageBase64: 'AAA' } } };
        const labas = { personnalisationObservations: { 'custom-1': { nom: 'Fictif', imageBase64: 'BBB' } } };
        const r = Codex._decrireLeConflit({ cle: 'personnalisationObservations' }, ici, labas);
        expect(r.titre).toBe('Tampon « Fictif »');
        expect(r.ici).toEqual({ texte: '« Fictif »', detail: 'Diffère par : image' });
    });

    it('une clé inconnue garde son nom technique, sans erreur', () => {
        const r = Codex._decrireLeConflit({ cle: 'a2031_cleInventee' }, { a2031_cleInventee: { x: 1 } }, { a2031_cleInventee: { x: 2 } });
        expect(r.titre).toBe('x');
        expect(r.qui).toBe('« cleInventee »');
    });

    it('une évaluation : « La plus récente » quand les deux dates diffèrent ; sa note si elle diffère', () => {
        const ev = (date, note) => ({ id: 'EV_1', etudiantNom: 'Alix Fictif', productionNom: 'Dissertation inventée', noteFinale: note, dateModification: date });
        const ici = { a2031_evaluationsSauvegardees: [ev('2031-09-01T10:00:00Z', 70)] };
        const labas = { a2031_evaluationsSauvegardees: [ev('2031-09-03T10:00:00Z', 74)] };
        const r = Codex._decrireLeConflit({ cle: 'a2031_evaluationsSauvegardees', id: 'EV_1' }, ici, labas);
        expect(r.titre).toBe('Évaluation d\'« Dissertation inventée »');
        expect(r.qui).toBe('Alix Fictif');
        expect(r.recente).toBe('externe');
        expect(r.ici.detail).toBe('Note : 70');
        const memeDate = Codex._decrireLeConflit({ cle: 'a2031_evaluationsSauvegardees', id: 'EV_1' },
            ici, { a2031_evaluationsSauvegardees: [ev('2031-09-01T10:00:00Z', 74)] });
        expect(memeDate.recente, 'dates égales : rien n\'est dit plus récent').toBeNull();
    });

    it('nommer ce qui arrive en entier, au lieu de « N autres données »', () => {
        const labas = { a2031_brouillonDissection: { doc: 'fictif' }, a2031_inventee: { a: 1 }, interventions: [] };
        const analyse = Codex._analyserFusion({}, labas);
        const fin = Codex._direLaFinDeLaFusion('Codex fictif', analyse, labas, {}, { importes: 0, erreurs: [] }, false);
        expect(fin).toContain('De l\'autre codex : le brouillon de dissection et « inventee ».');
        expect(fin, 'une liste vide n\'apporte rien').not.toContain('interventions');
        expect(fin).not.toContain('autres données');
    });
});
