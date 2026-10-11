import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1025 (lot 5, consigne de Cowork du 11 oct. 2026) — « OUVRIR UNE ARCHIVE… » NE CHARGE PLUS
// L'ARCHIVE ENTIÈRE.
//
// Mesuré avant le lot (WebKit 26.4, archive fictive de 394 copies, 1,15 Go) : `JSZip.loadAsync`
// lisait tout le fichier, pic de la page à 1 306 Mo. Le geste lit désormais le répertoire central,
// puis ses seuls textes, un à un, par tranches (`ReserveVerifier`, comme « Vérifier ») : pic égal au
// repos. Mesure : `plans de travail/MESURE-2026-10-11-lot5-memoire.md`.
//
// LES RÈGLES JUGÉES ICI :
//   1. Le geste n'appelle plus `JSZip.loadAsync` (la marque de la lecture entière).
//   2. Il rend le même contenu qu'une lecture entière par JSZip : dossier, meta, données.
//   3. L'archive entre dans la liste, par chacune des trois voies d'avant (manifeste racine, patch
//      du dossier, meta.json seul), et l'écran de réimport s'ouvre comme avant.
//   4. Les mots d'erreur sont ceux d'avant : un fichier qui n'est pas un ZIP ; un nom suspect est
//      refusé par le même message de validerZipSecurite (seul le nom cité diffère, voir l'essai).
//
// Noms fictifs. Les archives sont fabriquées dans la page par JSZip (copies rangées).

const DOSSIER = 'h2031-C1-00001-banc1025';

async function demarrer(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
}

/**
 * Fabrique une archive, l'ouvre par le vrai `onFichierChoisi`, et rend ce que le geste a produit.
 * `variante` : 'patch' | 'racine' | 'meta' | 'pasUnZip' | 'suspect' | 'enorme'.
 */
async function ouvrirUneArchive(page, variante) {
    return page.evaluate(async ({ variante, DOSSIER }) => {
        const base = 'trimestres/' + DOSSIER + '/';
        const meta = {
            uuid: 'uuid-banc-1025', trimestre: 'h2031', cours: 'C1', groupe: '00001', statut: 'verse',
            date_archive: '2031-05-30T12:00:00.000Z', contenu: { donnees: true, nombre_etudiants: 1, nombre_fichiers_travaux: 2 }
        };
        const donnees = {
            h2031_groupeEtudiants: [{ da: '9001025', nom: 'Fictif', prenom: 'Alix', groupe: '00001' }],
            grillesTemplates: [{ id: 'GRILLE_banc_1025', nom: 'Grille fictive du banc', criteres: [] }]
        };
        const zip = new JSZip();
        zip.file(base + 'meta.json', JSON.stringify(meta));
        zip.file(base + 'donnees.json', JSON.stringify(donnees));
        if (variante === 'patch') zip.file(base + 'manifeste-archives-patch.json', JSON.stringify({ patch: Object.assign({}, meta, { notes: 'du patch' }) }));
        if (variante === 'racine') zip.file('manifeste-archives.json', JSON.stringify({ archives: { [DOSSIER]: Object.assign({}, meta, { notes: 'de la racine' }) } }));
        if (variante === 'suspect') zip.file('../hors.json', '{}');
        for (let i = 0; i < 2; i++) {
            zip.file(base + 'travaux/FT_banc_1025_' + i + '.pdf', new TextEncoder().encode('%PDF-1.4\n' + 'x'.repeat(2000 + i)), { compression: 'STORE' });
        }
        const octets = variante === 'pasUnZip'
            ? new TextEncoder().encode('ceci n\'est pas une archive')
            : await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
        if (variante === 'enorme') {
            // Une copie qui se DÉCLARE de 3 Go au répertoire central (le champ « taille réelle »).
            const v = new DataView(octets.buffer);
            for (let p = octets.length - 22; p >= 0; p--) {
                if (v.getUint32(p, true) !== 0x02014b50) continue;
                const n = v.getUint16(p + 28, true);
                if (new TextDecoder().decode(octets.subarray(p + 46, p + 46 + n)).endsWith('FT_banc_1025_0.pdf')) { v.setUint32(p + 24, 3 * 1024 * 1024 * 1024, true); break; }
            }
        }
        const fichier = new File([octets], 'archive-1025.zip');

        // Ce qu'une lecture entière par JSZip rend (la référence d'avant #1025).
        let reference = null;
        if (['patch', 'racine', 'meta'].includes(variante)) {
            const entier = await JSZip.loadAsync(octets);
            reference = {
                dossier: DOSSIER,
                meta: JSON.parse(await entier.file(base + 'meta.json').async('text')),
                donnees: JSON.parse(await entier.file(base + 'donnees.json').async('text'))
            };
        }

        const appels = { loadAsync: 0 };
        const loadAsyncDOrigine = JSZip.loadAsync;
        JSZip.loadAsync = function() { appels.loadAsync++; return loadAsyncDOrigine.apply(this, arguments); };
        const erreurs = [];
        const erreurDOrigine = notifications.erreur;
        notifications.erreur = function(titre, message) { erreurs.push([titre, message]); };
        try {
            await window.ReserveOuvrir.actionOuvrir();
            await window.ReserveOuvrir.onFichierChoisi({ files: [fichier] });
        } finally {
            JSZip.loadAsync = loadAsyncDOrigine;
            notifications.erreur = erreurDOrigine;
        }
        const etape = document.getElementById('reserve-ouvrir-etape-selection');
        const entree = (Reserve.lireManifesteLocal().archives || {})[DOSSIER] || null;
        let lu = null;
        if (reference) {
            const p = await window.ReserveOuvrir.chargerDepuisFichier(fichier);
            lu = { dossier: p.dossier, meta: p.meta, donnees: p.donnees };
        }
        window.ReserveOuvrir.fermerDialogue();
        return {
            appels, erreurs, reference, lu,
            selection: !!etape && etape.style.display !== 'none',
            items: [...document.querySelectorAll('#modalOuvrirVersement label.reserve-ouvrir-item')].map((l) => l.dataset.type),
            notes: entree ? entree.notes : null
        };
    }, { variante, DOSSIER });
}

test.describe('#1025 — « Ouvrir une archive… » lit l\'archive par tranches', () => {
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(15000);
        await demarrer(page);
    });

    test('sans lecture entière : même contenu qu\'avant, écran de réimport ouvert, archive inscrite par son patch', async ({ page }) => {
        const r = await ouvrirUneArchive(page, 'patch');
        expect(r.erreurs).toEqual([]);
        expect(r.appels.loadAsync, 'l\'archive n\'est plus chargée entière par JSZip').toBe(0);
        expect(r.lu, 'le même contenu qu\'une lecture entière').toEqual(r.reference);
        expect(r.selection, 'l\'écran de réimport s\'ouvre, comme avant').toBe(true);
        expect(r.items, 'la grille de l\'archive y est proposée').toContain('grilles');
        expect(r.notes, 'l\'archive entre dans la liste par le patch de son dossier').toBe('du patch');
    });

    test('l\'archive entre dans la liste par le manifeste racine', async ({ page }) => {
        const r = await ouvrirUneArchive(page, 'racine');
        expect(r.erreurs).toEqual([]);
        expect(r.appels.loadAsync).toBe(0);
        expect(r.notes).toBe('de la racine');
    });

    test('l\'archive entre dans la liste par son seul meta.json', async ({ page }) => {
        const r = await ouvrirUneArchive(page, 'meta');
        expect(r.erreurs).toEqual([]);
        expect(r.appels.loadAsync).toBe(0);
        expect(r.lu).toEqual(r.reference);
        expect(r.notes).toBe('Hydraté depuis l\'ouverture du ZIP.');
    });

    test('les mots d\'erreur sont ceux d\'avant', async ({ page }) => {
        const pasUnZip = await ouvrirUneArchive(page, 'pasUnZip');
        expect(pasUnZip.erreurs).toEqual([['Lecture impossible', 'Le fichier choisi n\'est pas un ZIP valide.']]);
        const suspect = await ouvrirUneArchive(page, 'suspect');
        // Avant #1025, JSZip réécrivait le dossier `../` en `/` : le refus disait « (chemin absolu) : / ».
        // Le répertoire est désormais lu tel quel : « (path traversal) : ../ ». Même refus, même début.
        expect(suspect.erreurs).toEqual([['Lecture impossible', 'Validation sécurité : Entrée ZIP suspecte (path traversal) : ../']]);
        expect(suspect.notes, 'rien n\'est inscrit').toBeNull();
    });

    // Mesuré le 11 oct. 2026 sur le code d'avant : cette archive FORGÉE (le répertoire central dit
    // 3 Go, l'en-tête local dit 2 Ko) passait, JSZip ne lisant pas la taille du répertoire. Le
    // répertoire est désormais la source : la borne de validerZipSecurite (règle 3) la refuse.
    test('une archive qui se dit plus lourde que 2 Go est refusée par la borne de validerZipSecurite', async ({ page }) => {
        const r = await ouvrirUneArchive(page, 'enorme');
        expect(r.erreurs).toEqual([['Lecture impossible', 'Validation sécurité : ZIP trop volumineux une fois décompressé (3.0 Go). Limite : 2 Go.']]);
        expect(r.notes, 'rien n\'est inscrit').toBeNull();
    });
});
