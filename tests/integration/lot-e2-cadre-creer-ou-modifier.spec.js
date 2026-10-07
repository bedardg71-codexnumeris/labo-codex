import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LOT E2 DE L'ENREGISTREMENT — CRÉER OU MODIFIER, ZONE CADRE ET ÉTUDIANT·ES (D3, 28 sept. 2026)
//
// Décision de Grégoire (D3) : « Créer quelque chose de neuf : un bouton qui nomme le geste. Tant
// qu'on n'a pas cliqué, rien n'existe ; quitter avant avertit. Modifier ce qui existe : tout
// s'enregistre tout seul, champ par champ. « Annuler » devient « Fermer ». »
//
// Ce banc joue le vrai index.html depuis la démonstration et lit la BASE, pas l'écran :
//   (a) le nom du trimestre, une date, un champ du profil, un champ d'une fiche d'étudiant·e
//       s'écrivent sans bouton, et le témoin dit « Enregistré » ;
//   (b) l'identification : la session seule n'écrit rien ; un trimestre qui a des données refuse
//       le changement par le témoin ; une paire prise aussi ; AUCUNE clé déplacée ;
//   (c) un nouveau cours, horaire, groupe-cours n'existe pas avant son bouton ; « Fermer » pose
//       la question ; « Rester » ne perd rien ; « Quitter sans créer » n'écrit rien ;
//   (d) un échec d'écriture sur un champ du Cadre : « Non enregistré – ‹geste› : … », sans succès ;
//   (e) le message de réussite d'une création ne précède plus l'écriture ;
//   + la ligne de séance régénérée ne garde pas les valeurs de la précédente (WebKit, relecture
//     d'étape de Cowork, point 5) ; + le placement des boutons à 360, 768, 1024 et 1180 px.
//
// Noms fictifs seulement. Stockage propre à chaque essai (contexte Playwright neuf).
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirCadre(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
    await page.evaluate(() => {
        window.__toasts = [];
        new MutationObserver((ms) => ms.forEach(m => m.addedNodes.forEach(n => {
            if (n.nodeType === 1 && n.classList.contains('notification-avec-icone')) window.__toasts.push(n.innerText.replace(/\s+/g, ' ').trim());
        }))).observe(document.body, { childList: true });
        naviguerVers('calendrier', 'trimestre');
    });
    await pause(page, 900);
}

async function changer(page, selecteur, valeur) {
    const n = await page.evaluate(({ selecteur, valeur }) => {
        const el = document.querySelector(selecteur); if (!el) return 0;
        el.value = valeur;
        el.dispatchEvent(new Event('change', { bubbles: true })); return 1;
    }, { selecteur, valeur });
    expect(n, 'champ introuvable : ' + selecteur).toBe(1);
    await pause(page, 600);
}

const temoinSucces = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes');
    return !!el && el.classList.contains('visible');
});
const temoinEchec = (page) => page.evaluate(() => {
    const el = document.querySelector('#temoin-enregistrement .temoin-enregistrement-echec');
    return el && el.classList.contains('visible') ? el.querySelector('.temoin-enregistrement-echec-texte').textContent : '';
});
const fermerTemoin = (page) => page.evaluate(() => {
    window.temoinEnregistrement?.fermer();
    document.querySelector('#temoin-enregistrement .temoin-enregistrement-succes')?.classList.remove('visible');
});
const questionOuverte = (page) => page.evaluate(() => document.getElementById('ui-dialogue-titre')?.textContent || '');
async function repondre(page, texte) {
    const n = await page.evaluate((texte) => {
        const b = [...document.querySelectorAll('#overlay-ui-dialogue button')].find(x => x.textContent.trim() === texte);
        if (!b) return 0; b.click(); return 1;
    }, texte);
    expect(n, 'bouton de la question introuvable : ' + texte).toBe(1);
    await pause(page, 500);
}
const visible = (page, s) => page.evaluate((s) => { const el = document.querySelector(s); return !!el && !el.classList.contains('u-hide'); }, s);
const clesDuTrimestre = (page, id) => page.evaluate((id) => {
    const cles = new Set();
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(id + '_')) cles.add(k); }
    if (db.memoryCache) for (const k of db.memoryCache.keys()) if (k && k.startsWith(id + '_')) cles.add(k);
    return [...cles].sort();
}, id);

test('(a) trimestre, date, profil, fiche d\'étudiant·e : s\'écrivent sans bouton, le témoin le dit', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCadre(page);
    const actif = await page.evaluate(() => (db.getSync('trimestres', []) || []).find(t => t.actif));
    expect(actif, 'la démonstration a un trimestre actif').toBeTruthy();
    await page.evaluate(() => window.initialiserModuleTrimestre());
    await pause(page, 600);
    expect(await visible(page, '#v2-btnCreerTrimestre'), 'trimestre existant : pas de « Créer le trimestre »').toBe(false);

    await changer(page, '#v2-nomTrimestre', 'Trimestre fictif banc E2');
    expect(await temoinSucces(page)).toBe(true);
    expect(await page.evaluate(() => (db.getSync('trimestres', []) || []).find(t => t.actif).nom)).toBe('Trimestre fictif banc E2');

    await fermerTemoin(page);
    await changer(page, '#v2-remiseNotes', '2026-12-30');
    expect(await temoinSucces(page)).toBe(true);
    expect(await page.evaluate(() => db.getSync(cle('cadreCalendrier'), {}).remiseNotes)).toBe('2026-12-30');

    // Profil : le premier de la liste.
    const ensId = await page.evaluate(() => (db.getSync('enseignants', []) || []).filter(e => !e.isDemo || true)[0]?.id);
    if (ensId) {
        await page.evaluate(async (id) => { const s = document.getElementById('v2-selectEnseignant'); s.value = id; await window.chargerEnseignantSelectionneV2(); }, ensId);
        await pause(page, 400);
        // Le profil de démonstration n'a ni courriel ni institution (obligatoires) : un champ modifié
        // seul serait refusé, et le témoin le dirait. On complète d'abord ses deux champs à l'écran.
        await page.evaluate(() => {
            document.getElementById('v2-ens-courriel').value = 'fictif@exemple.qc.ca';
            document.getElementById('v2-ens-institution').value = 'Cégep fictif';
        });
        await fermerTemoin(page);
        await changer(page, '#v2-ens-departement', 'Département fictif E2');
        expect(await temoinSucces(page)).toBe(true);
        expect(await page.evaluate((id) => (db.getSync('enseignants', []) || []).find(e => e.id === id).departement, ensId)).toBe('Département fictif E2');
    }

    // Fiche d'étudiant·e : la première de la liste, par le geste de la rangée.
    const da = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || [])[0]?.da);
    await page.evaluate(async (da) => { await window.editerEtudiantV2(da); }, da);
    await pause(page, 400);
    expect(await visible(page, '#v2-btnSoumettreEtudiant'), 'fiche existante : pas de bouton d\'enregistrement').toBe(false);
    expect(await page.evaluate(() => document.getElementById('v2-btnAnnulerEdition').textContent.trim())).toBe('Fermer');
    await fermerTemoin(page);
    await changer(page, '#v2-etudiantProgramme', '500.A1');
    await pause(page, 400);
    expect(await temoinSucces(page)).toBe(true);
    expect(await page.evaluate((da) => (db.getSync(cle('groupeEtudiants'), []) || []).find(e => e.da === da).programme, da)).toBe('500.A1');
    expect(await page.evaluate(() => window.__toasts.filter(t => /modifi/.test(t)))).toEqual([]);
});

test('(b) identification : la session seule n\'écrit rien ; un trimestre qui a des données refuse ; une paire prise refuse ; aucune clé déplacée', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCadre(page);
    await page.evaluate(() => window.initialiserModuleTrimestre());
    await pause(page, 600);
    const actif = await page.evaluate(() => (db.getSync('trimestres', []) || []).find(t => t.actif));
    const registreAvant = await page.evaluate(() => JSON.stringify(db.getSync('trimestres', [])));
    const clesAvant = await clesDuTrimestre(page, actif.id);
    expect(clesAvant.length, 'le trimestre de démonstration porte des données').toBeGreaterThan(0);

    // État intermédiaire : l'année vidée, puis la session changée — rien d'écrit, rien de dit.
    await changer(page, '#v2-anneeTrimestre', '');
    await changer(page, '#v2-sessionTrimestre', actif.session === 'H' ? 'automne' : 'hiver');
    expect(await temoinEchec(page)).toBe('');
    expect(await page.evaluate(() => JSON.stringify(db.getSync('trimestres', [])))).toBe(registreAvant);

    // La paire complétée : le trimestre a des données → « Changement bloqué », par le témoin.
    // La démonstration : id « demo », session « D » (hors menu), année en texte (« 2025 »).
    await changer(page, '#v2-anneeTrimestre', String(Number(actif.annee) + 1));
    expect(await temoinEchec(page)).toMatch(/^Non enregistré – Identification du trimestre : ce trimestre \(« .+ »\) contient des données/);
    expect(await page.evaluate(() => JSON.stringify(db.getSync('trimestres', [])))).toBe(registreAvant);
    expect(await page.evaluate(() => window.__toasts)).toEqual([]);
    const sessionMap = { H: 'hiver', A: 'automne', E: 'ete' };
    expect(await page.evaluate(() => document.getElementById('v2-sessionTrimestre').value), 'les champs reviennent au stock').toBe(sessionMap[actif.session] || '');
    expect(await clesDuTrimestre(page, actif.id), 'aucune clé déplacée').toEqual(clesAvant);

    // Une paire prise par un autre trimestre du registre.
    await fermerTemoin(page);
    await page.evaluate(() => { const r = db.getSync('trimestres', []); r.push({ id: 'e2099', nom: 'Été fictif 2099', session: 'E', annee: 2099, actif: false }); db.setSync('trimestres', r); });
    // La session posée SANS écriture (seule, elle formerait déjà une paire valide, refusée pour
    // données) ; la paire se forme au changement de l'année.
    await page.evaluate(() => { document.getElementById('v2-sessionTrimestre').value = 'ete'; });
    await changer(page, '#v2-anneeTrimestre', '2099');
    expect(await temoinEchec(page)).toMatch(/^Non enregistré – Identification du trimestre : le trimestre « e2099 » existe déjà dans le registre/);
    expect(await page.evaluate((id) => (db.getSync('trimestres', []) || []).find(t => t.actif).id, actif.id)).toBe(actif.id);
    expect(await clesDuTrimestre(page, actif.id)).toEqual(clesAvant);
});

test('(c) cours, horaire, groupe-cours neufs : rien avant le bouton ; « Fermer » pose la question ; Rester / Quitter sans créer', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCadre(page);
    const compte = (k) => page.evaluate((k) => (db.getSync(k === 'cours' ? 'cours' : cle(k), []) || []).length, k);

    // Cours
    const coursAvant = await compte('cours');
    await page.evaluate(async () => { await window.nouveauCoursV2(); });
    await pause(page, 400);
    expect(await visible(page, '#v2-btnCreerCours')).toBe(true);
    expect(await page.evaluate(() => document.getElementById('v2-btnCreerCours').textContent.trim())).toBe('Créer le cours');
    await changer(page, '#v2-codeCours', '999-E2F-MQ');
    await changer(page, '#v2-nomCours', 'Cours fictif banc E2');
    expect(await compte('cours'), 'rien en base avant le clic').toBe(coursAvant);
    await page.evaluate(() => { window.fermerFicheCoursV2(); });
    await pause(page, 500);
    expect(await questionOuverte(page)).toBe('Ce cours n\'est pas encore créé.');
    await repondre(page, 'Rester');
    expect(await page.evaluate(() => document.getElementById('v2-codeCours').value)).toBe('999-E2F-MQ');
    await page.evaluate(() => { window.fermerFicheCoursV2(); });
    await pause(page, 500);
    await repondre(page, 'Quitter sans créer');
    expect(await compte('cours'), 'quitter sans créer n\'écrit rien').toBe(coursAvant);

    // Horaire
    const horairesAvant = await compte('horaires');
    await page.evaluate(async () => { await window.nouveauHoraireV2(); });
    await pause(page, 400);
    expect(await visible(page, '#v2-btnCreerHoraire')).toBe(true);
    await changer(page, '#v2-hor-nom', 'Horaire fictif banc E2');
    expect(await compte('horaires')).toBe(horairesAvant);
    await page.evaluate(() => { window.fermerFicheHoraireV2(); });
    await pause(page, 500);
    expect(await questionOuverte(page)).toBe('Cet horaire n\'est pas encore créé.');
    await repondre(page, 'Quitter sans créer');
    expect(await compte('horaires')).toBe(horairesAvant);

    // Groupe-cours
    const gcAvant = await compte('groupesCours');
    await page.evaluate(async () => { await window.nouveauGroupeCoursV2(); });
    await pause(page, 400);
    expect(await visible(page, '#v2-btnCreerGroupeCours')).toBe(true);
    const coursId = await page.evaluate(() => [...document.getElementById('v2-gc-cours').options].map(o => o.value).find(v => v));
    await changer(page, '#v2-gc-cours', coursId);
    expect(await compte('groupesCours')).toBe(gcAvant);
    await page.evaluate(() => { window.fermerFicheGroupeCoursV2(); });
    await pause(page, 500);
    expect(await questionOuverte(page)).toBe('Ce groupe-cours n\'est pas encore créé.');
    await repondre(page, 'Quitter sans créer');
    expect(await compte('groupesCours')).toBe(gcAvant);
});

test('(c bis) étudiant·e : ouvrir une autre fiche pendant un ajout pose la question ; « Quitter sans ajouter » n\'écrit rien', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCadre(page);
    const avant = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).length);
    await page.evaluate(() => { document.getElementById('v2-etudiantDA').value = '2999001'; document.getElementById('v2-etudiantNom').value = 'Fictif'; });
    const da = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || [])[0].da);
    await page.evaluate((da) => { window.editerEtudiantV2(da); }, da);
    await pause(page, 500);
    expect(await questionOuverte(page)).toBe('Cet·te étudiant·e n\'est pas encore ajouté·e.');
    await repondre(page, 'Rester');
    expect(await page.evaluate(() => document.getElementById('v2-etudiantDA').value)).toBe('2999001');
    await page.evaluate((da) => { window.editerEtudiantV2(da); }, da);
    await pause(page, 500);
    await repondre(page, 'Quitter sans ajouter');
    expect(await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).length)).toBe(avant);
    expect(await page.evaluate(() => document.getElementById('v2-etudiantDA').value)).toBe(da);
});

test('(c ter) étudiant·e : le DA d\'une fiche existante ne se modifie pas, au clavier comme par le formulaire (décision de Grégoire, 28 sept.)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCadre(page);
    const da = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || [])[0].da);
    await page.evaluate((da) => { window.editerEtudiantV2(da); }, da);
    await pause(page, 500);
    expect(await page.evaluate(() => document.getElementById('v2-etudiantDA').readOnly)).toBe(true);
    await expect(page.locator('#v2-etudiantDAAide')).toBeVisible();
    await expect(page.locator('#v2-etudiantDAAide')).toHaveText('Le DA ne se modifie pas ici : il relie les évaluations et les présences de l\'étudiant·e.');
    // Au clavier : le champ ne bouge pas.
    await page.focus('#v2-etudiantDA');
    await page.keyboard.press('End');
    await page.keyboard.type('99');   // (pas de retour arrière : sur un champ en lecture seule, WebKit le lit comme « page précédente »)
    expect(await page.evaluate(() => document.getElementById('v2-etudiantDA').value)).toBe(da);
    // Par le formulaire (valeur forcée), puis un autre champ enregistré : la base garde le DA.
    await page.evaluate(async () => {
        document.getElementById('v2-etudiantDA').value = '2999777';
        document.getElementById('v2-etudiantProgramme').value = 'E2.DA';
        await window.sauvegarderChampEtudiantV2();
    });
    const fiche = await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).find(e => e.programme === 'E2.DA') || null);
    expect(fiche && fiche.da).toBe(da);
    expect(await page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).some(e => e.da === '2999777'))).toBe(false);
    // « Fermer » : l'ajout retrouve un champ DA modifiable, sans la phrase.
    await page.evaluate(() => window.fermerFicheEtudiantV2());
    expect(await page.evaluate(() => document.getElementById('v2-etudiantDA').readOnly)).toBe(false);
    await expect(page.locator('#v2-etudiantDAAide')).toBeHidden();
});

test('(d) un échec d\'écriture sur un champ du Cadre : « Non enregistré – ‹geste› : … », aucun succès', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCadre(page);
    await page.evaluate(() => window.initialiserModuleTrimestre());
    await pause(page, 600);
    await page.evaluate(() => {
        window.__toasts = [];
        window.__setSync = db.setSync;
        db.setSync = function (k, v) { if (String(k).endsWith('_cadreCalendrier')) throw new Error('panne simulée par le banc E2'); return window.__setSync.call(this, k, v); };
    });
    await changer(page, '#v2-remiseNotes', '2026-12-29');
    expect(await temoinEchec(page)).toBe('Non enregistré – Modifier le cadre du trimestre : le navigateur a refusé l\'écriture.');
    expect(await temoinSucces(page)).toBe(false);
    expect(await page.evaluate(() => window.__toasts)).toEqual([]);
    await page.evaluate(() => { db.setSync = window.__setSync; });
});

test('(e) la création d\'un horaire : le message ne part qu\'après l\'écriture — un échec n\'en fait aucun', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCadre(page);
    const groupe = await page.evaluate(async () => {
        await window.nouveauHoraireV2();
        const opt = [...document.getElementById('v2-hor-groupeAssocie').options].map(o => o.value).find(v => v);
        document.getElementById('v2-hor-groupeAssocie').value = opt;
        document.getElementById('v2-hor-nom').value = 'Horaire fictif E2 (e)';
        for (let i = 0; document.getElementById(`v2-hor-seance-${i}-jour`); i++) document.getElementById(`v2-hor-seance-${i}-periodes`).value = '2';
        return opt;
    });
    expect(groupe, 'la démonstration a un groupe').toBeTruthy();
    const avant = await page.evaluate(() => (db.getSync(cle('horaires'), []) || []).length);
    await page.evaluate(() => {
        window.__toasts = [];
        window.__setSync = db.setSync;
        db.setSync = function (k, v) { if (String(k).endsWith('_horaires')) throw new Error('panne simulée par le banc E2'); return window.__setSync.call(this, k, v); };
        window.sauvegarderHoraireV2();
    });
    await pause(page, 500);
    expect(await page.evaluate(() => window.__toasts)).toEqual([]);
    expect(await temoinEchec(page)).toBe('Non enregistré – Créer l\'horaire : le navigateur a refusé l\'écriture.');
    expect(await page.evaluate(() => (db.getSync(cle('horaires'), []) || []).length)).toBe(avant);
    expect(await visible(page, '#v2-btnCreerHoraire'), 'la fiche reste en création').toBe(true);
    await page.evaluate(() => { db.setSync = window.__setSync; });
});

test('relecture 5 · une ligne de séance régénérée ne garde pas les valeurs de la précédente (WebKit)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCadre(page);
    const r = await page.evaluate(async () => {
        const lire = () => {
            const l = [];
            for (let i = 0; document.getElementById(`v2-hor-seance-${i}-jour`); i++) {
                l.push({ debut: document.getElementById(`v2-hor-seance-${i}-debut`).value, fin: document.getElementById(`v2-hor-seance-${i}-fin`).value,
                    periodes: document.getElementById(`v2-hor-seance-${i}-periodes`).value, local: document.getElementById(`v2-hor-seance-${i}-local`).value });
            }
            return l;
        };
        const h = (db.getSync(cle('horaires'), []) || [])[0];
        window.changerHoraireSelectionneV2(h.id);
        // Des valeurs posées par le code (comme l'édition les pose), puis la régénération.
        document.getElementById('v2-hor-seance-0-debut').value = '13:15';
        document.getElementById('v2-hor-seance-0-periodes').value = '3';
        document.getElementById('v2-hor-seance-0-local').value = 'Z-999';
        window.mettreAJourSeancesHoraireV2();
        return lire();
    });
    expect(r[0]).toEqual({ debut: '08:00', fin: '10:00', periodes: '', local: '' });
});

test('placement : « Fermer » et « Créer le cours » à 360, 768, 1024 et 1180 px, dans l\'écran et hors du témoin', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCadre(page);
    const mesurer = () => page.evaluate(() => {
        const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { g: b.left, d: b.right, h: b.top, b: b.bottom, l: b.width }; };
        return {
            fermer: r(document.querySelector('[data-action="fermerFicheCoursV2"]')),
            creer: r(document.getElementById('v2-btnCreerCours')),
            temoin: r(document.querySelector('#temoin-enregistrement .visible')),
            largeur: document.documentElement.clientWidth
        };
    });
    const chevauche = (a, b) => !!(a && b && a.g < b.d && b.g < a.d && a.h < b.b && b.h < a.b);
    for (const largeur of [360, 768, 1024, 1180]) {
        await page.setViewportSize({ width: largeur, height: 900 });
        await page.evaluate(async () => { await window.nouveauCoursV2(); document.getElementById('v2-btnCreerCours').scrollIntoView({ block: 'center' }); });
        await pause(page, 500);
        // Le témoin visible (une écriture ailleurs), pour mesurer le chevauchement.
        await page.evaluate(() => window.temoinEnregistrement.enregistre('banc'));
        const m = await mesurer();
        expect(m.fermer && m.fermer.l > 0, `${largeur} px : « Fermer » visible`).toBe(true);
        expect(m.creer && m.creer.l > 0, `${largeur} px : « Créer le cours » visible`).toBe(true);
        for (const [nom, b] of [['Fermer', m.fermer], ['Créer le cours', m.creer]]) {
            expect(b.g >= 0 && b.d <= m.largeur, `${largeur} px : « ${nom} » dans l'écran`).toBe(true);
            expect(chevauche(b, m.temoin), `${largeur} px : « ${nom} » sous le témoin`).toBe(false);
        }
        await page.evaluate(() => { window.temoinEnregistrement.fermer(); });
    }
});

// #975 suite (décisions de Grégoire, 7 oct. 2026) — « + Nouveau trimestre », puis « Annuler » :
// rien d'écrit, la fiche du trimestre actif revient, les deux boutons disparaissent. Le vrai
// bouton de la bibliothèque, le vrai bouton « Annuler », sur la page de démonstration.
test('#975 suite · « + Nouveau trimestre » puis « Annuler » : rien d\'écrit, la fiche du trimestre actif revient', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCadre(page);
    await page.evaluate(() => window.initialiserModuleTrimestre());
    await pause(page, 600);
    const avant = await page.evaluate(() => ({
        trimestres: JSON.stringify(db.getSync('trimestres', [])),
        cadre: JSON.stringify(db.getSync(cle('cadreCalendrier'), null)),
        actif: db.getSync('trimestreActif', null),
        nom: document.getElementById('v2-nomTrimestre').value,
        debut: document.getElementById('v2-debutTrimestre').value
    }));
    expect(avant.debut, 'la démonstration a un cadre').not.toBe('');
    expect(await visible(page, '#v2-btnAnnulerCreationTrimestre'), 'hors création : pas d\'« Annuler »').toBe(false);

    await page.evaluate(() => document.querySelector('[data-action="ouvrirCreationTrimestreV2"]').click());
    await pause(page, 400);
    expect(await visible(page, '#v2-btnCreerTrimestre')).toBe(true);
    expect(await visible(page, '#v2-btnAnnulerCreationTrimestre'), 'un trimestre actif : « Annuler » paraît').toBe(true);
    expect(await page.evaluate(() => document.getElementById('v2-btnAnnulerCreationTrimestre').textContent.trim())).toBe('Annuler');
    await page.evaluate(() => {
        document.getElementById('v2-nomTrimestre').value = 'Trimestre fictif annulé';
        document.getElementById('v2-sessionTrimestre').value = 'hiver';
        document.getElementById('v2-anneeTrimestre').value = '2031';
    });

    await page.evaluate(() => document.getElementById('v2-btnAnnulerCreationTrimestre').click());
    await pause(page, 600);
    const apres = await page.evaluate(() => ({
        trimestres: JSON.stringify(db.getSync('trimestres', [])),
        cadre: JSON.stringify(db.getSync(cle('cadreCalendrier'), null)),
        actif: db.getSync('trimestreActif', null),
        nom: document.getElementById('v2-nomTrimestre').value,
        debut: document.getElementById('v2-debutTrimestre').value
    }));
    expect(apres).toEqual(avant);
    expect(await visible(page, '#v2-btnCreerTrimestre')).toBe(false);
    expect(await visible(page, '#v2-btnAnnulerCreationTrimestre')).toBe(false);
    expect(await questionOuverte(page), 'aucune question de sortie').toBe('');
    expect(await page.evaluate(() => window.__toasts)).toEqual([]);
});
