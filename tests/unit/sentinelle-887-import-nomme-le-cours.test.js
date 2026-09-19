/**
 * SENTINELLE #887 — L'IMPORT D'ÉLÈVES NOMME LE COURS DE RATTACHEMENT ; #923 ; LE DA À L'IMPORT.
 *
 * #887 (retour de Mathieu, #872 mécanisme A) : `confirmerImportV2` posait `coursId` depuis le cours actif sans le
 * dire. Forme tranchée par Grégoire le 17 sept. 2026 : la zone NOMME le cours et laisse en changer sur place. Le
 * menu vise CET import seulement : `infoCours` n'est jamais écrit.
 * #923 : l'aperçu posait les colonnes collées dans un innerHTML sans `echapperHtml` (règle de sécurité n° 1).
 * DA à l'import (décision de Grégoire, 19 sept. 2026) : même règle qu'au formulaire (#914) — sept chiffres, espaces
 * retirés ; sinon la ligne n'entre pas, l'aperçu la marque, le bouton compte les autres, le message final la nomme.
 *
 * Mesure : les fonctions RÉELLES du module (`previsualiserDonneesV2`, `confirmerImportV2`,
 * `rafraichirRattachementEtudiantsV2`) sur un faux document. Le geste dans la vraie page est au banc WebKit
 * `tests/integration/import-nomme-le-cours-887.spec.js`.
 *
 * Break-tests attendus (chacun rouge) : cible forcée au cours actif ; le menu écrit `infoCours` ; un `echapperHtml`
 * de l'aperçu retiré ; la garde des sept chiffres retirée de `_jugerLignesImportV2`.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase } from './_helpers/bac-suivi.js';

const MODULE = [{ chemin: 'js/trimestre-v2-etudiants.js', internes: ['donneesImportEnAttenteV2'] }];
const COURS = [
    { id: 'GC1', codeCours: '601-101', nomCours: 'Écriture et littérature' },
    { id: 'GC2', codeCours: '601-102', nomCours: 'Littérature et imaginaire' },
    { id: 'DEMO-X', codeCours: '000-DEM', nomCours: 'Cours de démonstration', isDemo: true },
];
// Le chemin du bouton « Prévisualiser » : le champ rempli, puis la fonction du bouton.
const apercu = (b, collage) => { b.document.getElementById('v2-donneesCollees').value = collage; b.win.previsualiserDonneesV2(); };
const storeDeuxCours = () => Object.assign(storeBase(), {
    cours: JSON.parse(JSON.stringify(COURS)),
    infoCours: { id: 'GC1', codeCours: '601-101', nomCours: 'Écriture et littérature', groupe: '01', _groupeCoursId: 'GC1' },
});
const COLLAGE = [
    '3000001\t00002\tValide\tVictor\t200.B0',
    '300 0002\t00002\tEspaces\tÉlise\t200.B0',
    '\t00002\tSansda\tSacha\t200.B0',
    'ABC-99\t00002\tInvalide\tInès\t200.B0',
    '123456\t00002\tCourt\tCarl\t200.B0',
    '2000004\t00002\tDejala\tDario\t200.B0',          // déjà dans le stock (GC2)
    '3000001\t00002\tDoublon\tDenis\t200.B0',         // répété dans le collage
].join('\n');

describe('#887 · la zone d\'import nomme le cours et laisse en changer', () => {
    it('à l\'aperçu : le menu offre les cours de la bibliothèque, cours actif choisi et marqué, sans les cours de démonstration', () => {
        const b = monter(storeDeuxCours(), { modules: MODULE });
        apercu(b, COLLAGE);
        const menu = b.elements['v2-importCoursCible'];
        expect(menu.value).toBe('GC1');
        expect(menu.innerHTML).toContain('<option value="GC1">601-101 Écriture et littérature (cours actif)</option>');
        expect(menu.innerHTML).toContain('<option value="GC2">601-102 Littérature et imaginaire</option>');
        expect(menu.innerHTML).not.toContain('DEMO-X');
        expect(menu.innerHTML).not.toContain('Aucun cours');
        expect(b.elements['v2-importRattachement'].classList.contains('u-hide')).toBe(false);
        expect(b.elements['v2-importSansCours'].classList.contains('u-hide')).toBe(true);
    });

    it('le cours choisi AU MENU est écrit sur les fiches ; le cours actif n\'est jamais écrit', async () => {
        const store = storeDeuxCours();
        const b = monter(store, { modules: MODULE });
        apercu(b, COLLAGE);
        b.elements['v2-importCoursCible'].value = 'GC2';
        const actifAvant = JSON.stringify(store.infoCours);
        await b.win.confirmerImportV2();
        const neuves = store.test_groupeEtudiants.filter(e => ['3000001', '3000002'].includes(e.da));
        expect(neuves.map(e => e.coursId)).toEqual(['GC2', 'GC2']);
        expect(JSON.stringify(store.infoCours)).toBe(actifAvant);
        expect(b.journal.filter(j => j.k === 'infoCours' || j.k === '-infoCours')).toEqual([]);
        expect(b.notifs[0].t).toContain('2 étudiant·es ajouté·es à 601-102 Littérature et imaginaire');
    });

    it('menu laissé tel quel : les fiches portent le cours actif', async () => {
        const store = storeDeuxCours();
        const b = monter(store, { modules: MODULE });
        apercu(b, COLLAGE);
        await b.win.confirmerImportV2();
        expect(store.test_groupeEtudiants.find(e => e.da === '3000001').coursId).toBe('GC1');
    });

    it('une valeur de menu qui ne nomme aucun cours offert retombe sur le cours actif', async () => {
        const store = storeDeuxCours();
        const b = monter(store, { modules: MODULE });
        apercu(b, COLLAGE);
        b.elements['v2-importCoursCible'].value = 'COURS-INCONNU';
        await b.win.confirmerImportV2();
        expect(store.test_groupeEtudiants.find(e => e.da === '3000001').coursId).toBe('GC1');
    });

    it('le cours actif absent de la bibliothèque (miroir, #916) est offert quand même, en tête', () => {
        const store = storeDeuxCours();
        store.cours = store.cours.filter(c => c.id !== 'GC1');
        const b = monter(store, { modules: MODULE });
        apercu(b, COLLAGE);
        expect(b.elements['v2-importCoursCible'].innerHTML.indexOf('value="GC1"')).toBeGreaterThan(-1);
        expect(b.elements['v2-importCoursCible'].innerHTML.indexOf('value="GC1"')).toBeLessThan(b.elements['v2-importCoursCible'].innerHTML.indexOf('value="GC2"'));
    });

    it('aucun cours : la zone le dit, l\'import reste possible, coursId vide', async () => {
        const store = storeDeuxCours();
        store.cours = []; store.infoCours = null;
        const b = monter(store, { modules: MODULE });
        apercu(b, COLLAGE);
        expect(b.elements['v2-importRattachement'].classList.contains('u-hide')).toBe(true);
        expect(b.elements['v2-importSansCours'].classList.contains('u-hide')).toBe(false);
        await b.win.confirmerImportV2();
        const fiche = store.test_groupeEtudiants.find(e => e.da === '3000001');
        expect(fiche.coursId).toBe('');
        expect(b.notifs[0].t).toMatch(/^2 étudiant·es ajouté·es, 2 déjà/);   // aucun « à <cours> » : il n'y en a pas
    });

    it('le nom du cours est échappé dans le menu', () => {
        const store = storeDeuxCours();
        store.cours[1].nomCours = '<b>gras</b>';
        const b = monter(store, { modules: MODULE });
        apercu(b, COLLAGE);
        expect(b.elements['v2-importCoursCible'].innerHTML).toContain('601-102 &lt;b&gt;gras&lt;/b&gt;');
        expect(b.elements['v2-importCoursCible'].innerHTML).not.toContain('<b>');
    });

    it('le formulaire d\'ajout nomme le cours actif ; sans cours actif, il le dit', () => {
        const store = storeDeuxCours();
        const b = monter(store, { modules: MODULE });
        b.win.rafraichirRattachementEtudiantsV2();
        expect(b.elements['v2-ajoutRattachement'].textContent).toBe('Sera rattaché·e à : 601-101 Écriture et littérature');
        store.infoCours = null;
        b.win.rafraichirRattachementEtudiantsV2();
        expect(b.elements['v2-ajoutRattachement'].textContent).toBe('Aucun cours actif : l\'étudiant·e ne sera rattaché·e à aucun cours.');
    });
});

describe('#923 · l\'aperçu échappe ce qu\'on y colle', () => {
    it('les six colonnes collées entrent en texte, jamais en balises', () => {
        const b = monter(storeDeuxCours(), { modules: MODULE });
        const x = (n) => `<img/src=x/onerror=a${n}>`;   // sans espace : le DA collé perd les siens avant d'être jugé
        // DA de sept chiffres impossible avec une balise : la colonne DA est éprouvée sur une ligne écartée.
        apercu(b, [`${x(0)}\t${x(1)}\t${x(2)}\t${x(3)}\t${x(4)}`, `3000009\t00002\t${x(5)}\tP\tprog`].join('\n'));
        const html = b.elements['v2-previewTable'].innerHTML;
        expect(html).not.toContain('<img');
        for (const n of [0, 2, 3, 4, 5]) expect(html).toContain(`&lt;img/src=x/onerror=a${n}&gt;`);
        // le groupe passe par normaliserNumeroGroupe : quelle que soit sa forme, aucun chevron brut n'en sort
        expect(html.replace(/<\/?(table|thead|tbody|tr|th|td|strong)[^>]*>/g, '')).not.toMatch(/[<>]/);
    });
});

describe('DA à l\'import · sept chiffres, sinon la ligne n\'entre pas et elle est nommée', () => {
    it('l\'aperçu marque chaque ligne, le bouton compte celles qui entreront, la note dit la règle', () => {
        const b = monter(storeDeuxCours(), { modules: MODULE });
        apercu(b, COLLAGE);
        const html = b.elements['v2-previewTable'].innerHTML;
        const rangees = html.split('<tr').slice(2).map(r => ({ ecartee: r.includes('class="ligne-import-ecartee"'), motif: (r.match(/<strong>([^<]*)<\/strong>/) || [, ''])[1] }));
        expect(rangees.map(r => r.motif)).toEqual(['', '', 'DA manquant', 'DA invalide', 'DA invalide', 'Déjà inscrit·e ce trimestre', 'Déjà inscrit·e ce trimestre']);
        expect(rangees.map(r => r.ecartee)).toEqual([false, false, true, true, true, true, true]);
        expect(html).toContain('<td>3000002</td>');                        // espaces retirés
        expect(b.elements['v2-btnConfirmerImport'].textContent).toBe('Importer 2 étudiant·es');
        expect(b.elements['v2-btnConfirmerImport'].disabled).toBe(false);
        expect(b.elements['v2-importLignesEcartees'].textContent).toBe('5 lignes ne seront pas importées. Le DA est celui du collège : sept chiffres, rien d\'autre.');
        expect(b.elements['v2-importLignesEcartees'].classList.contains('u-hide')).toBe(false);
    });

    it('à la confirmation : seules les lignes conformes entrent, aucune fiche au DA vide, les écartées sont nommées', async () => {
        const store = storeDeuxCours();
        const b = monter(store, { modules: MODULE });
        apercu(b, COLLAGE);
        await b.win.confirmerImportV2();
        expect(store.test_groupeEtudiants.map(e => e.da)).toEqual(['2000001', '2000002', '2000003', '2000004', '3000001', '3000002']);
        expect(store.test_groupeEtudiants.filter(e => !e.da).length).toBe(0);
        expect(store.test_groupeEtudiants.find(e => e.da === '2000004').nom).toBe('Dautre');   // la fiche existante ne bouge pas
        expect(store.test_groupeEtudiants.find(e => e.da === '3000001').nom).toBe('Valide');   // le doublon interne n'écrase pas
        expect(Object.keys(store.test_groupeEtudiants.find(e => e.da === '3000001')).sort()).toEqual(['coursId', 'da', 'groupe', 'nom', 'prenom', 'programme', 'sa']);
        expect(b.notifs.length).toBe(1);
        expect(b.notifs[0].type).toBe('warning');
        expect(b.notifs[0].t).toBe('2 étudiant·es ajouté·es à 601-101 Écriture et littérature, 2 déjà présent·es (ignoré·es) — 6 au total dans le groupe');
        expect(b.notifs[0].m).toBe('3 lignes écartées : Sansda Sacha (DA manquant), Invalide Inès (DA invalide), Court Carl (DA invalide).');
    });

    it('aucune ligne conforme : bouton inactif à l\'aperçu ; la confirmation n\'écrit rien et le dit en erreur', async () => {
        const store = storeDeuxCours();
        const b = monter(store, { modules: MODULE });
        apercu(b, '\t00002\tSansda\tSacha\t200.B0\nDEMO001\t00002\tDemo\tDana\t200.B0');
        expect(b.elements['v2-btnConfirmerImport'].textContent).toBe('Aucune ligne à importer');
        expect(b.elements['v2-btnConfirmerImport'].disabled).toBe(true);
        const avant = JSON.stringify(store.test_groupeEtudiants);
        const nbEcritures = b.journal.length;
        await b.win.confirmerImportV2();
        expect(JSON.stringify(store.test_groupeEtudiants)).toBe(avant);
        expect(b.journal.filter(j => j.k === 'test_groupeEtudiants').length).toBe(0);
        expect(b.journal.length).toBe(nbEcritures);
        expect(b.notifs[0].type).toBe('erreur');
        expect(b.notifs[0].t).toBe('Aucun·e étudiant·e importé·e');
        expect(b.notifs[0].m).toContain('Sansda Sacha (DA manquant)');
        expect(b.notifs[0].m).toContain('Demo Dana (DA invalide)');
    });

    it('au-delà de huit lignes écartées, le message nomme les huit premières et compte les autres', async () => {
        const store = storeDeuxCours();
        const b = monter(store, { modules: MODULE });
        const lignes = ['3000001\t00002\tValide\tVictor\t200.B0'];
        for (let i = 1; i <= 10; i++) lignes.push(`X${i}\t00002\tNom${i}\tP\t200.B0`);
        apercu(b, lignes.join('\n'));
        await b.win.confirmerImportV2();
        expect(b.notifs[0].m).toContain('10 lignes écartées : Nom1 P (DA invalide)');
        expect(b.notifs[0].m).toContain('Nom8 P (DA invalide), et 2 autres.');
        expect(b.notifs[0].m).not.toContain('Nom9');
    });

    it('tout est conforme : succès, pas de détail, note cachée', async () => {
        const store = storeDeuxCours();
        const b = monter(store, { modules: MODULE });
        apercu(b, '3000001\t00002\tValide\tVictor\t200.B0');
        expect(b.elements['v2-importLignesEcartees'].classList.contains('u-hide')).toBe(true);
        expect(b.elements['v2-btnConfirmerImport'].textContent).toBe('Importer 1 étudiant·e');
        await b.win.confirmerImportV2();
        expect(b.notifs[0].type).toBe('succes');
        expect(b.notifs[0].m).toBeUndefined();
    });
});
