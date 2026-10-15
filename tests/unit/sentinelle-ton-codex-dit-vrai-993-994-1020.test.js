import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { monterFichierSortant } from './_helpers/monter-fichier-sortant.js';
import { chargerScript } from './_helpers/charger-script.js';

// Lot « Ton codex dit vrai » (15 oct. 2026). Décisions de Grégoire :
// plans de travail/DECISIONS-2026-10-15-ton-codex-dit-vrai.md.
//   #993 — une seule façon de dire une taille : base 1000, sauf sous Windows (1024).
//   #994 — l'échec d'écriture du codex ne devine plus la cause : l'espace n'est nommé que si
//          le navigateur signale lui-même un manque d'espace (`QuotaExceededError`).
//   #1020 — la fenêtre du codex à part dit ce que fera sa réouverture.
// Chaque essai neuf a son break-test : la mutation est appliquée à la SOURCE, et l'essai
// montre que l'assertion de l'essai jumeau aurait vu la différence.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const consoleSandbox = { log() {}, warn() {}, info() {}, debug() {}, error() {} };

const UA_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const UA_WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const UA_LINUX = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

/* ---------- #993 : la fonction ---------- */

function monterTaille(navigator, muter) {
    const brut = readFileSync(path.join(racine, 'js/taille-fichier.js'), 'utf8');
    const code = muter ? muter(brut) : brut;
    if (muter && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans js/taille-fichier.js.');
    const win = { navigator };
    new Function('window', '"use strict";\n' + code)(win);
    return win.TailleFichier;
}

const OCTETS = 254700000;
// Les précisions que les écrans emploient (voir la demande de relecture pour la liste des écrans).
const PRECISIONS = [
    ['défaut (Ko 1, Mo 1, Go 2 : codex, archives, aperçu d\'export, copies)', undefined, '254,7 Mo', '242,9 Mo'],
    ['« environ » (fichier qui sort : codex, archive)', { environ: true }, 'environ 255 Mo', 'environ 243 Mo'],
    ['une décimale (copies, messages d\'import)', { decimales: 1 }, '254,7 Mo', '242,9 Mo'],
    ['entiers (limites, paquet de partage)', { decimales: 0 }, '255 Mo', '243 Mo'],
    ['Ko 0, Mo 1, Go 2 (codex data, doublons)', { decimales: { Ko: 0, Mo: 1, Go: 2 } }, '254,7 Mo', '242,9 Mo']
];

describe('#993 · une seule façon de dire une taille', () => {
    it('254 700 000 octets, à chaque précision : base 1000 hors Windows, 1024 sous Windows', () => {
        const mac = monterTaille({ userAgent: UA_MAC });
        const windows = monterTaille({ userAgent: UA_WINDOWS });
        for (const [nom, options, horsWindows, sousWindows] of PRECISIONS) {
            expect([nom, mac.dire(OCTETS, options)]).toEqual([nom, horsWindows]);
            expect([nom, windows.dire(OCTETS, options)]).toEqual([nom, sousWindows]);
        }
    });

    it('la détection : userAgentData d\'abord, sinon l\'agent ; l\'iPad (« Macintosh ») et Linux comptent en 1000', () => {
        expect(monterTaille({ userAgent: UA_MAC }).base()).toBe(1000);
        expect(monterTaille({ userAgent: UA_LINUX }).base()).toBe(1000);
        expect(monterTaille({ userAgent: UA_WINDOWS }).base()).toBe(1024);
        expect(monterTaille({ userAgent: UA_LINUX, userAgentData: { platform: 'Windows' } }).base()).toBe(1024);
        expect(monterTaille({ userAgent: UA_WINDOWS, userAgentData: { platform: 'macOS' } }).base()).toBe(1000);
        expect(monterTaille({ userAgent: UA_MAC, userAgentData: { platform: '' } }).base()).toBe(1000);
        expect(monterTaille(undefined).base()).toBe(1000);
    });

    it('les limites, dites en entiers : le même nombre sous Windows ; ailleurs, la valeur en base 1000', () => {
        const mac = monterTaille({ userAgent: UA_MAC });
        const windows = monterTaille({ userAgent: UA_WINDOWS });
        const limites = [
            [2 * 1024 ** 3, '2 Go', '2 Go'],        // ZIP décompressé (import-export.js)
            [1024 ** 3, '1 Go', '1 Go'],            // ZIP importé ; entrée d'archive (reserve-verifier.js)
            [0xFFFFFFFF, '4 Go', '4 Go'],           // format ZIP (fichier-sortant.js)
            [100 * 1024 ** 2, '105 Mo', '100 Mo'],  // codex data
            [50 * 1024 ** 2, '52 Mo', '50 Mo'],     // JSON importé
            [10 * 1024 ** 2, '10 Mo', '10 Mo'],     // paquet de partage
            [5 * 1024 ** 2, '5 Mo', '5 Mo']         // fichier de tampons
        ];
        for (const [octets, horsWindows, sousWindows] of limites) {
            expect([octets, mac.dire(octets, { decimales: 0 })]).toEqual([octets, horsWindows]);
            expect([octets, windows.dire(octets, { decimales: 0 })]).toEqual([octets, sousWindows]);
        }
    });

    it('sous la base, en octets ; jamais « 1000 Ko » : l\'arrondi passe à l\'unité suivante', () => {
        const mac = monterTaille({ userAgent: UA_MAC });
        expect(mac.dire(512)).toBe('512 o');
        expect(mac.dire(0)).toBe('0 o');
        expect(mac.dire(999999, { decimales: 0 })).toBe('1 Mo');
        expect(mac.dire(1.08e9)).toBe('1,08 Go');
    });

    it('break-test : une base figée à 1000 rend le nombre du Mac sous Windows (rouge attendu)', () => {
        const fige = monterTaille({ userAgent: UA_WINDOWS }, (s) => s.replace(
            "return /windows/i.test(String(nav.userAgent || '')) ? 1024 : 1000;", 'return 1000;'));
        expect(fige.dire(OCTETS, { environ: true })).toBe('environ 255 Mo');
    });

    it('break-test : une base figée à 1024 rend le nombre de Windows sur le Mac (rouge attendu)', () => {
        const fige = monterTaille({ userAgent: UA_MAC }, (s) => s.replace(
            "return /windows/i.test(String(nav.userAgent || '')) ? 1024 : 1000;", 'return 1024;'));
        expect(fige.dire(OCTETS, { environ: true })).toBe('environ 243 Mo');
    });

    it('break-test : sans le passage à l\'unité suivante, « 1000 Ko » (rouge attendu)', () => {
        const fige = monterTaille({ userAgent: UA_MAC }, (s) => s.replace(
            'while (i < UNITES.length - 1 && Number(valeur.toFixed(dec[UNITES[i]])) >= b) {',
            'while (i < UNITES.length - 1 && valeur >= b) {'));
        expect(fige.dire(999999, { decimales: 0 })).toBe('1000 Ko');
    });

    it('un message d\'écran suit la règle : le ZIP trop gros, sur un Mac et sous Windows', () => {
        const zip = { files: { 'gros.bin': { dir: false, _data: { uncompressedSize: 4 * 1024 ** 3 } } } };
        const surMac = chargerScript('js/import-export.js', {}, { navigator: { userAgent: UA_MAC } });
        const sousWindows = chargerScript('js/import-export.js', {}, { navigator: { userAgent: UA_WINDOWS } });
        expect(surMac.validerZipSecurite(zip).erreur).toBe('ZIP trop volumineux une fois décompressé (4,3 Go). Limite : 2 Go.');
        expect(sousWindows.validerZipSecurite(zip).erreur).toBe('ZIP trop volumineux une fois décompressé (4,0 Go). Limite : 2 Go.');
    });

    // Verrou : aucun écran ne recalcule une taille à sa façon. Les sites laissés, avec leur motif,
    // sont dans la demande de relecture du 15 oct. 2026.
    it('aucune division par 1024 ailleurs que dans les sites laissés', () => {
        const LAISSES = {
            'db.js': 'des caractères, pas des octets (« K car. »)',
            'import-export.js': 'tailleKo : estimation en caractères × 2 des données d\'un import, pas un fichier',
            'registre-longitudinal.js': 'poidsOctets : longueur d\'un JSON (des caractères)',
            'trimestres.js': 'tailleMo : outil de console (listerTrimestresOrphelins), aucun écran'
        };
        const motif = /\/\s*1024\b|\b1048576\b|Math\.log\(1024\)|\/\s*\(1024\s*\*/;
        const trouves = [];
        for (const f of readdirSync(path.join(racine, 'js'))) {
            if (!f.endsWith('.js')) continue;
            const lignes = readFileSync(path.join(racine, 'js', f), 'utf8').split('\n');
            lignes.forEach((l, i) => {
                if (/^\s*(\/\/|\*|\/\*)/.test(l)) return;
                if (motif.test(l) && !LAISSES[f]) trouves.push(f + ':' + (i + 1));
            });
        }
        expect(trouves).toEqual([]);
        expect(readFileSync(path.join(racine, 'js/fichier-sortant.js'), 'utf8')).not.toMatch(/tailleEnviron/);
    });
});

/* ---------- #994 et #1020 : la vraie écriture du codex ---------- */

function creerDb(initial = {}) {
    const map = new Map(Object.entries(structuredClone(initial)));
    return {
        ready: true,
        init: async () => {},
        get: async (k, def = null) => (map.has(k) ? map.get(k) : def),
        set: async (k, v) => { map.set(k, v); },
        remove: async (k) => { map.delete(k); },
        keys: async () => [...map.keys()],
        listBlobIds: async () => [],
        getSync: (k, def = null) => (map.has(k) ? map.get(k) : def),
        setSync: (k, v) => { map.set(k, v); },
        syncToLocalStorageCache: async () => {},
        flush: async () => {}
    };
}

/**
 * Monte le vrai codex.js. La fenêtre de choix (FSAPI) accepte, puis l'écriture du fichier est
 * refusée par `erreurEcriture` (un nom de DOMException). Les fenêtres sont journalisées ;
 * « Réessayer » n'est jamais choisi (demanderAction rend null : la fenêtre est fermée).
 */
function monterCodex({ erreurEcriture, muter }) {
    const journal = { confirmations: [], fenetres: [], temoin: [] };
    const win = {
        addEventListener() {}, removeEventListener() {},
        afficherProgression() {}, majProgression() {}, masquerProgression() {},
        trimestreActif: 'h2026',
        navigator: { userAgent: UA_MAC },
        temoinEnregistrement: {
            nonEnregistre: (raison) => { journal.temoin.push(raison); },
            fermerSi() {}
        },
        showSaveFilePicker: async () => ({
            createWritable: async () => ({
                write: async () => { throw new DOMException('refus simulé', erreurEcriture); },
                close: async () => {},
                abort: async () => {}
            })
        })
    };
    const doc = {
        readyState: 'loading',
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
        createElement: () => ({
            setAttribute() {}, appendChild() {}, addEventListener() {}, style: {},
            classList: { add() {}, remove() {}, contains() { return false; } }
        }),
        body: { addEventListener() {}, appendChild() {} },
        documentElement: { addEventListener() {} }
    };
    const stockage = () => ({
        _d: {},
        getItem(k) { return this._d[k] ?? null; },
        setItem(k, v) { this._d[k] = String(v); },
        removeItem(k) { delete this._d[k]; },
        clear() { this._d = {}; }
    });
    monterFichierSortant(win, { document: doc });
    const brut = readFileSync(path.join(racine, 'js/codex.js'), 'utf8');
    const code = muter ? muter(brut) : brut;
    if (muter && code === brut) throw new Error('Témoin inerte : la mutation n\'a rien remplacé dans js/codex.js.');
    const uiDialogues = {
        confirmerAction: async (o) => { journal.confirmations.push({ titre: o.titre, message: o.message }); return true; },
        demanderAction: async (o) => { journal.fenetres.push({ titre: o.titre, message: o.message, actions: (o.actions || []).map((a) => a.texte) }); return null; },
        demanderSaisie: async () => null,
        informer: async () => {}
    };
    new Function(
        'window', 'document', 'console', 'localStorage', 'sessionStorage', 'db',
        'travauxStockage', 'JSZip', 'FileReader', 'requestAnimationFrame',
        'uiDialogues', 'validerZipSecurite', 'setTimeout', 'navigator', 'notifications',
        '"use strict";\n' + code
    )(win, doc, consoleSandbox, stockage(), stockage(),
        creerDb({ h2026_productions: [{ id: 'P1', titre: 'Production fictive' }] }),
        { recupererBlob: async () => null, stockerBlob: async () => {} }, JSZip, undefined,
        (cb) => setTimeout(cb, 0), uiDialogues, undefined, setTimeout,
        { userAgent: UA_MAC, userActivation: { isActive: true } },
        { succes() {}, erreur() {}, info() {} });
    return { Codex: win.Codex, journal };
}

const TAILLE = /^Le fichier \(environ \d+ (o|Ko)\)/;
const ESPACE = 'Ton appareil manque d\'espace : libères-en, puis réessaie.';
const SIGNALER = 'Si ça se répète, utilise « Signaler un bug » : le détail y sera.';

function sansTaille(message) {
    expect(message).toMatch(TAILLE);
    return message.replace(TAILLE, 'Le fichier (<taille>)');
}

async function mettreAJour(erreurEcriture, muter) {
    const { Codex, journal } = monterCodex({ erreurEcriture, muter });
    await Codex.actionEnregistrerSous();
    return journal;
}

async function codexAPart(erreurEcriture, muter) {
    const { Codex, journal } = monterCodex({ erreurEcriture, muter });
    const ecrit = await Codex.ecrireAPartAvantSuppression('Le trimestre Hiver 2032 sera supprimé.');
    return { ecrit, journal };
}

describe('#994 · la mise à jour du codex : la cause n\'est pas devinée', () => {
    it('un refus sans manque d\'espace : le message neutre, les deux boutons ; le témoin ne change pas', async () => {
        const journal = await mettreAJour('NotAllowedError');
        expect(journal.fenetres).toHaveLength(1);
        const f = journal.fenetres[0];
        expect(f.titre).toBe('Codex non mis à jour');
        expect(sansTaille(f.message)).toBe('Le fichier (<taille>) n\'a pas été enregistré. Tes données restent dans l\'application. ' + SIGNALER);
        expect(f.actions).toEqual(['Télécharger à la place', 'Réessayer']);
        expect(journal.temoin).toHaveLength(1);
        expect(journal.temoin[0]).toMatch(/^le fichier \(environ \d+ (o|Ko)\) n'a pas été enregistré\. Tes données restent dans l'application\.$/);
    });

    it('QuotaExceededError : la phrase d\'espace s\'ajoute, sans « si »', async () => {
        const journal = await mettreAJour('QuotaExceededError');
        const f = journal.fenetres[0];
        expect(f.titre).toBe('Codex non mis à jour');
        expect(sansTaille(f.message)).toBe('Le fichier (<taille>) n\'a pas été enregistré. ' + ESPACE + ' Tes données restent dans l\'application. ' + SIGNALER);
        expect(f.actions).toEqual(['Télécharger à la place', 'Réessayer']);
        expect(journal.temoin[0]).toMatch(/^le fichier \(environ \d+ (o|Ko)\) n'a pas été enregistré\. Tes données restent dans l'application\.$/);
    });

    it('break-test : un manque d\'espace supposé d\'office se voit sur un refus ordinaire (rouge attendu)', async () => {
        const journal = await mettreAJour('NotAllowedError', (s) => s.replace(
            "var manqueEspace = !!(sauvegarde.erreur && sauvegarde.erreur.name === 'QuotaExceededError');",
            'var manqueEspace = true;'));
        expect(journal.fenetres[0].message).toContain(ESPACE);
    });

    it('break-test : un manque d\'espace jamais lu ne se dit pas (rouge attendu)', async () => {
        const journal = await mettreAJour('QuotaExceededError', (s) => s.replace(
            "var manqueEspace = !!(sauvegarde.erreur && sauvegarde.erreur.name === 'QuotaExceededError');",
            'var manqueEspace = false;'));
        expect(journal.fenetres[0].message).not.toContain(ESPACE);
    });
});

describe('#994 · le codex à part : même règle, « rien n\'a été supprimé »', () => {
    it('un refus sans manque d\'espace : le message neutre ; rien n\'est écrit', async () => {
        const { ecrit, journal } = await codexAPart('NotAllowedError');
        expect(ecrit).toBe(false);
        const f = journal.fenetres[0];
        expect(f.titre).toBe('Codex à part non écrit');
        expect(sansTaille(f.message)).toBe('Le fichier (<taille>) n\'a pas été enregistré : rien n\'a été supprimé. ' + SIGNALER);
        expect(f.actions).toEqual(['Télécharger à la place', 'Réessayer']);
    });

    it('QuotaExceededError : la phrase d\'espace s\'ajoute', async () => {
        const { ecrit, journal } = await codexAPart('QuotaExceededError');
        expect(ecrit).toBe(false);
        expect(sansTaille(journal.fenetres[0].message)).toBe('Le fichier (<taille>) n\'a pas été enregistré : rien n\'a été supprimé. ' + ESPACE + ' ' + SIGNALER);
    });

    it('break-test : sans la lecture de l\'erreur, le manque d\'espace se tait (rouge attendu)', async () => {
        const { journal } = await codexAPart('QuotaExceededError', (s) => s.replace(
            'var echec = reglage.echec(taille, manqueEspace);', 'var echec = reglage.echec(taille, false);'));
        expect(journal.fenetres[0].message).not.toContain(ESPACE);
    });
});

describe('#1020 · la fenêtre du codex à part dit ce que fera sa réouverture', () => {
    const SUITE = 'L\'application va d\'abord écrire un codex à part, sous un autre nom. Tes prochaines mises à jour n\'y toucheront pas. ' +
        'Le rouvrir ramènerait ce que tu supprimes, mais remettrait aussi le reste de tes données dans leur état d\'aujourd\'hui : ' +
        'des changements faits entre-temps pourraient être perdus.';

    it('la première phrase, propre au geste, puis la phrase décidée le 15 oct. 2026 (9 h 23)', async () => {
        const { journal } = await codexAPart('NotAllowedError');
        expect(journal.confirmations[0]).toEqual({
            titre: 'Avant de supprimer, un codex à part',
            message: 'Le trimestre Hiver 2032 sera supprimé.\n' + SUITE
        });
    });

    it('break-test : l\'ancienne promesse (« revenir en arrière ») se voit (rouge attendu)', async () => {
        const { journal } = await codexAPart('NotAllowedError', (s) => s.replace(
            "'Tes prochaines mises à jour n\\'y toucheront pas. ' +",
            "'Tes prochaines mises à jour n\\'y toucheront pas : il te permettra de revenir en arrière.' + '' +"));
        expect(journal.confirmations[0].message).not.toBe('Le trimestre Hiver 2032 sera supprimé.\n' + SUITE);
    });
});
