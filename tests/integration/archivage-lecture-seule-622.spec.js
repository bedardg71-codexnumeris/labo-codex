import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle #622 / S4 — L'ARCHIVAGE, ÉPROUVÉ DANS WEBKIT CONTRE LE VRAI index.html.
//
// POURQUOI CETTE SPEC EXISTE PLUTÔT QU'UNE PORTE TERRAIN. Le plan Conception
// demandait à Grégoire un « test manuel sur trimestre jetable » (T4.3). La règle 1
// du skill `portes-terrain` l'interdit : **une porte n'existe que si AUCUNE machine
// ne peut répondre**, et le défaut par défaut est d'écrire le test même s'il coûte
// plus cher à la session. Une vérification automatisée coûte une heure UNE FOIS ; la
// même en porte coûte dix minutes à Grégoire À CHAQUE CYCLE, prélevées sur sa
// préparation de cours. Ici une machine peut répondre — et elle répond mieux, parce
// qu'elle relit le contenu du fichier exporté, ce qu'un test manuel ne fait pas.
//
// CE QU'ELLE AJOUTE À LA SENTINELLE VITEST. Vitest tourne dans node, contre un faux
// `db` injecté : il prouve la LOGIQUE. Ici on charge le vrai `index.html`, le vrai
// `db.js`, le vrai chemin `archiverTrimestre` → `creerSnapshotRessources` →
// `exporterTrimestreArchive`, et on lit le fichier RÉELLEMENT téléchargé.
//
// ⚠ CE QU'ELLE NE TOUCHE PAS. Le trimestre `e2099` est jetable et semé par la spec.
// Playwright ouvre son PROPRE navigateur, avec son propre profil : le Safari de
// Grégoire, qui sert la même origine `file://`, n'est jamais atteint. Le moratoire
// à trois gestes porte sur SES données, pas sur celles-ci.
//
// LE DÉFAUT QU'ELLE VERROUILLE. Archiver écrasait les trois collections de TRAVAIL
// avec le sous-ensemble « utilisé », après les avoir lues via `cle()` — qui route par
// le trimestre ACTIF, jamais celui qu'on archive. Mesuré sur les données réelles
// (#630) : dix pratiques détruites, et aucune copie de secours nulle part.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
// ⚠ Une entrée `/clé ABSENTE des registres/i` a été retirée d'ici le 31 août 2026.
// Elle était INERTE depuis son écriture, et pas seulement périmée : son émetteur
// unique (`js/trimestres.js:374`) est un `console.warn`, or le collecteur
// ci-dessous ne pousse que `msg.type() === 'error'`. Le motif n'a donc jamais été
// confronté à quoi que ce soit. Recopiée sur trois specs sans être re-dérivée une
// seule fois, elle annonçait une source de bruit surveillée par rien — et serait
// devenue porteuse en silence le jour où quelqu'un aurait élargi le collecteur
// aux `warning`, masquant alors un vrai signal que personne n'aurait voulu masquer.
// ⮕ Une garde peut naître morte. Avant d'ajouter un motif ici, vérifie qu'il peut
// atteindre le collecteur : le TYPE du message décide, pas son texte.

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.accept());
    return erreurs;
}

// Le décor mesuré chez Grégoire, réduit : un trimestre ACTIF dont les pratiques
// n'ont AUCUN identifiant en commun avec le trimestre à archiver. C'est
// l'intersection vide qui transformait un filtre en destruction.
const SETUP = () => {
    db.setSync('trimestres', [
        { id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true,  archive: false },
        { id: 'e2099', nom: 'Été 2099',     annee: 2099, session: 'E', actif: false, archive: false }
    ]);
    db.setSync('trimestreActif', 'a2026');
    db.setSync('cours', [{ id: 'CJ', codeCours: '999-999-XX', nom: 'Cours jetable', trimestreId: 'e2099' }]);

    // Le trimestre À ARCHIVER : deux de chaque, une seule de chaque référencée.
    db.setSync('e2099_productions', [{ id: 'PJ', grilleId: 'GJ1', echelleId: 'EJ1', pratiqueId: 'PRJ1' }]);
    db.setSync('e2099_grillesTemplates',       [{ id: 'GJ1', nom: 'Utilisée' }, { id: 'GJ2', nom: 'Jamais notée' }]);
    db.setSync('e2099_echellesTemplates',      [{ id: 'EJ1', nom: 'Utilisée' }, { id: 'EJ2', nom: 'Jamais notée' }]);
    db.setSync('e2099_pratiquesConfigurables', [{ id: 'PRJ1', nom: 'Utilisée' }, { id: 'PRJ2', nom: 'Jamais notée' }]);
    db.setSync('e2099_presences', [{ coursId: 'CJ', seance: '1a' }]);
    db.setSync('e2099_snapshots', { hebdomadaires: [{ id: 'SNAP-E2099' }], interventions: [] });

    // Le trimestre ACTIF : rien en commun.
    db.setSync('a2026_pratiquesConfigurables', [{ id: 'PRX', nom: 'Pratique du trimestre actif' }]);
    db.setSync('a2026_presences', [{ coursId: 'CA', seance: '9z' }]);
    db.setSync('a2026_snapshots', { hebdomadaires: [{ id: 'SNAP-A2026' }], interventions: [] });
};

async function ouvrirEtArchiver(page) {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    const resultat = await page.evaluate(async ({ setupSrc }) => {
        (new Function('db', setupSrc))(window.db);
        const r = window.archiverTrimestre('e2099');
        await new Promise(res => setTimeout(res, 300));
        const cleSnap = r.snapshotRessources && r.snapshotRessources.cleSnapshot;
        return {
            succes: r.success,
            archive: (window.db.getSync('trimestres', []).find(t => t.id === 'e2099') || {}).archive,
            grilles:   window.db.getSync('e2099_grillesTemplates', []).map(g => g.id).sort(),
            echelles:  window.db.getSync('e2099_echellesTemplates', []).map(e => e.id).sort(),
            pratiques: window.db.getSync('e2099_pratiquesConfigurables', []).map(p => p.id).sort(),
            pratiquesActif: window.db.getSync('a2026_pratiquesConfigurables', []).map(p => p.id),
            snapshot: cleSnap ? window.db.getSync(cleSnap, null) : null
        };
    }, { setupSrc: `(${SETUP.toString()})()` });

    return { erreurs, resultat };
}

test('#622 · archiver un trimestre ne retire AUCUN de ses modeles (WebKit, vrai index.html)', async ({ page }) => {
    const { erreurs, resultat } = await ouvrirEtArchiver(page);

    expect(resultat.succes, 'archiverTrimestre doit reussir').toBe(true);
    expect(resultat.archive, 'le trimestre doit passer archive').toBe(true);

    // Le coeur du correctif : les deux modeles survivent, pas seulement celui qui a servi.
    expect(resultat.grilles).toEqual(['GJ1', 'GJ2']);
    expect(resultat.echelles).toEqual(['EJ1', 'EJ2']);
    // Avant le correctif : [] — c'est le cas des dix pratiques d'Hiver 2026.
    expect(resultat.pratiques).toEqual(['PRJ1', 'PRJ2']);

    // Et rien n'est pris au trimestre actif au passage.
    expect(resultat.pratiquesActif).toEqual(['PRX']);

    expect(erreurs, `erreurs console inattendues : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#622 · le snapshot enregistre les collections COMPLETES et les cartouches, pas un compte', async ({ page }) => {
    const { resultat } = await ouvrirEtArchiver(page);

    expect(resultat.snapshot, 'le snapshot doit exister').not.toBeNull();
    expect(resultat.snapshot.grilles.map(g => g.id).sort()).toEqual(['GJ1', 'GJ2']);
    expect(resultat.snapshot.echelles.map(e => e.id).sort()).toEqual(['EJ1', 'EJ2']);
    expect(resultat.snapshot.pratiques.map(p => p.id).sort()).toEqual(['PRJ1', 'PRJ2']);
    expect(typeof resultat.snapshot.cartouches, 'un nombre ne restaure rien').not.toBe('number');
    // « Quels modeles ont servi » survit comme metadonnee, sans jamais servir a ecrire.
    expect(resultat.snapshot.utilises.grilleIds).toEqual(['GJ1']);
});

test('#622 · le fichier exporte porte les donnees du trimestre EXPORTE, pas celles de l\'actif', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600);

    // On clot, puis on exporte par « Exporter les donnees » de la bibliotheque, et on
    // LIT le fichier. C'est ce qu'un test manuel ne fait pas — il verrait un fichier
    // arriver, pas ce qu'il contient. Or c'est le contenu qui etait faux (B2).
    // #1002 (4 oct. 2026) : la cloture ne telecharge plus ce fichier ; seul le bouton
    // de la bibliotheque l'exporte encore (#1006).
    const attenteTelechargement = page.waitForEvent('download', { timeout: 15000 });
    await page.evaluate(async ({ setupSrc }) => {
        (new Function('db', setupSrc))(window.db);
        window.archiverTrimestre('e2099');
        window.exporterTrimestreArchive('e2099');
        await new Promise(res => setTimeout(res, 300));
    }, { setupSrc: `(${SETUP.toString()})()` });

    const telechargement = await attenteTelechargement;
    const flux = await telechargement.createReadStream();
    const morceaux = [];
    for await (const m of flux) morceaux.push(m);
    const contenu = JSON.parse(Buffer.concat(morceaux).toString('utf8'));

    expect(contenu.meta.trimestreId).toBe('e2099');

    // B2 : ces deux champs etaient ecrases par une lecture du trimestre ACTIF.
    // Les presences etaient VIDEES, et les captures venaient d'un AUTRE trimestre —
    // dans le fichier meme que la modale de suppression presente comme un filet.
    expect(contenu.donnees.presences).toEqual([{ coursId: 'CJ', seance: '1a' }]);
    expect(contenu.donnees.snapshots.hebdomadaires.map(s => s.id)).toEqual(['SNAP-E2099']);

    // Les deux champs alias ont disparu : ils dupliquaient sous un faux nom.
    expect('etudiants' in contenu.donnees).toBe(false);
    expect('evaluations' in contenu.donnees).toBe(false);

    expect(erreurs, `erreurs console inattendues : ${erreurs.join(' | ')}`).toEqual([]);
});
