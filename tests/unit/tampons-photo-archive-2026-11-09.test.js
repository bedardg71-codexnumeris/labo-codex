/**
 * LES TAMPONS D'UNE ARCHIVE — ce que l'espace lit de la photo (9 nov. 2026, décision de Grégoire, 13 h 33)
 *
 * Lot « Production plutôt que copie », ajout. Un trimestre rapporté d'une archive garde, sous
 * `<trimestre>_photoTampons`, les clés des tampons telles qu'au moment d'archiver. `travaux-outils.js`
 * s'en sert pour un tampon que l'ESPACE N'A PAS ; l'espace l'emporte pour ceux qu'il a ; rien n'est
 * écrit. La photo vient d'un fichier (l'archive) : une image n'en passe que si c'est une data URI
 * d'image (règle de sécurité : tout import est borné).
 *
 * ⮕ CHEMINS RÉELS : `js/travaux-outils.js` chargé dans le bac à sable, sa vraie API publique.
 *
 * BREAK-TESTS (9 nov. 2026, par mutation du fichier, puis restauré) :
 *   B1 `imageDeTamponAcceptable` qui rend toujours `true` → 2 rouges (« refuse ce qui n'est pas une
 *      image », « une photo dont l'image n'en est pas une ») ;
 *   B2 la phrase de la photo retirée de `observationsDesTampons` → 1 rouge (« la phrase… viennent de la photo ») ;
 *   B3 la photo lue même pour un tampon que l'espace a (`_dansLEspace` et `catalogue[id]` retirés) →
 *      1 rouge (« l'espace l'emporte »).
 *
 * ⚠ Aucune donnée réelle.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const PHOTO = {
    tamponsPersonnalises: [{ id: 'TP_archive', nom: 'Tampon fictif de l\'archive', categorie: 'catArchive' }],
    personnalisationObservations: { TP_archive: { imageBase64: 'data:image/png;base64,AAAA' }, 'obs-confusion': { nom: 'Nom de l\'archive' } },
    retroactionsObservations: { TP_archive: 'Phrase fictive de l\'archive.', 'obs-confusion': 'Phrase de l\'archive pour un tampon livré.' },
    categoriesPerso: [{ id: 'catArchive', nom: 'Catégorie fictive de l\'archive' }]
};

function monter({ espace = {}, photo = PHOTO } = {}) {
    const store = Object.assign({ h2032_photoTampons: photo }, JSON.parse(JSON.stringify(espace)));
    const ecritures = [];
    const db = {
        ready: false,
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { ecritures.push(k); store[k] = v; }
    };
    class ImageStub { constructor() { this.src = ''; this.complete = false; } addEventListener() {} removeEventListener() {} }
    const document = {
        getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => ({ innerHTML: '', style: {}, classList: { add() {}, remove() {} }, addEventListener() {}, remove() {} }),
        body: { appendChild() {} }, addEventListener() {}
    };
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/codes-annotation.js', { db }, win);
    chargerScript('js/travaux-outils.js', { db, Image: ImageStub, document, cle: (k) => 'h2032_' + k,
        echapperHtml: (s) => String(s), travauxAnnotation: { getAnnotationCourante: () => null } }, win);
    return { T: win.travauxOutils, ecritures, store };
}

const tamponDe = (resultat, id) => resultat.flatMap((c) => c.tampons.map((t) => Object.assign({ categorie: c.nom }, t))).find((t) => t.id === id);

describe('Photo des tampons · ce que l\'espace lit', () => {
    it('la phrase, le nom et la catégorie d\'un tampon absent de l\'espace viennent de la photo', () => {
        const { T, ecritures } = monter();
        const t = tamponDe(T.observationsDesTampons({ TP_archive: 2 }), 'TP_archive');
        expect(t).toMatchObject({ nom: 'Tampon fictif de l\'archive', texte: 'Phrase fictive de l\'archive.', nombre: 2,
            categorie: 'Catégorie fictive de l\'archive' });
        expect(ecritures).toEqual([]);
    });

    it('l\'espace l\'emporte pour un tampon qu\'il a : un tampon livré garde son nom et sa phrase de l\'espace', () => {
        const { T } = monter({ espace: { retroactionsObservations: { 'obs-confusion': 'Phrase de l\'espace.' } } });
        const t = tamponDe(T.observationsDesTampons({ 'obs-confusion': 1 }), 'obs-confusion');
        expect(t.texte).toBe('Phrase de l\'espace.');
        expect(t.nom).not.toBe('Nom de l\'archive');
    });

    it('l\'image d\'un tampon absent se charge depuis la photo ; sa définition aussi, sans entrer dans le catalogue', () => {
        const { T } = monter();
        const img = T.getImageAutocollant('TP_archive');
        expect(img && img.src).toBe('data:image/png;base64,AAAA');
        expect(T.getAutocollant('TP_archive')).toMatchObject({ id: 'TP_archive', nom: 'Tampon fictif de l\'archive', custom: true });
        expect(T.AUTOCOLLANTS.some((a) => a.id === 'TP_archive')).toBe(false);
    });

    it('sans photo, rien ne change : le tampon absent reste nommé par son identifiant, sans image', () => {
        const { T } = monter({ photo: null });
        expect(T.getImageAutocollant('TP_archive')).toBeNull();
        expect(tamponDe(T.observationsDesTampons({ TP_archive: 1 }), 'TP_archive')).toMatchObject({ nom: 'TP_archive', texte: '' });
    });
});

describe('Photo des tampons · une image venue d\'une archive est bornée (règle de sécurité)', () => {
    it('accepte une data URI d\'image', () => {
        const { T } = monter();
        for (const src of ['data:image/png;base64,AAAA', 'data:image/jpeg;base64,AAAA', 'data:image/svg+xml;base64,AAAA']) {
            expect(T.imageDeTamponAcceptable(src), src).toBe(true);
        }
    });
    it('refuse ce qui n\'est pas une image', () => {
        const { T } = monter();
        for (const src of ['javascript:alert(1)', 'data:text/html;base64,AAAA', 'https://exemple.test/x.png', 'data:image/png,<svg>', 42, null, undefined]) {
            expect(T.imageDeTamponAcceptable(src), String(src)).toBe(false);
        }
        expect(T.imageDeTamponAcceptable('data:image/png;base64,' + 'A'.repeat(10000001))).toBe(false);
    });
    it('une photo dont l\'image n\'en est pas une ne charge rien', () => {
        const { T } = monter({ photo: { tamponsPersonnalises: PHOTO.tamponsPersonnalises,
            personnalisationObservations: { TP_archive: { imageBase64: 'javascript:alert(1)' } } } });
        expect(T.getImageAutocollant('TP_archive')).toBeNull();
    });
});
