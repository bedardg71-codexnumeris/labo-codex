/**
 * Sentinelle #1008 — garde-éveil et garde mémoire du verdict Playwright.
 *
 * Remplace la sentinelle #987 (le `caffeinate -i` du 29 sept.), dont elle
 * reprend la garde de structure : caffeinate lancé avant la suite, attaché à
 * CE processus.
 *
 * Vécu la nuit du 1er oct. 2026 : lancé écran éteint, en éveil sombre, le
 * verdict de 1.173.0 a subi deux « Maintenance Sleep » malgré `caffeinate -i`,
 * l'échange a monté à 14,6 Go et le Mac a fini redémarré par le bouton.
 *
 * Les sorties figées ci-dessous sont celles MESURÉES sur le Mac le 4 oct. 2026
 * (7 h 09 – 7 h 12), raccourcies ; le journal reprend les lignes du 1er oct.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    lireEchangeMo, lirePression, lireCapacites, lireAlimentation,
    lireAssertionsSysteme, lireAssertionsDuProcessus, jugerEveil,
    jugerMemoire, jugerLancementMemoire, memoireAuPlusHaut, lireVeillesDuJournal
} from '../../scripts/garde-eveil.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const VERIF = readFileSync(path.join(racine, 'scripts', 'verifier-playwright.mjs'), 'utf8');

const ASSERTIONS_BATTERIE = `2026-10-04 07:09:16 -0400
Assertion status system-wide:
   BackgroundTask                 0
   UserIsActive                   1
   PreventUserIdleDisplaySleep    1
   PreventSystemSleep             0
   PreventUserIdleSystemSleep     1
   NetworkClientActive            0
Listed by owning process:
   pid 560(powerd): [0x00026d0a00019cf1] 00:13:50 PreventUserIdleSystemSleep named: "Powerd - Prevent sleep while display is on"
   pid 62676(caffeinate): [0x0002704600019d62] 00:00:02 PreventUserIdleSystemSleep named: "caffeinate command-line tool"
	Details: caffeinate asserting for 20 secs
   pid 62676(caffeinate): [0x0002704600059d63] 00:00:02 PreventUserIdleDisplaySleep named: "caffeinate command-line tool"
   pid 62676(caffeinate): [0x0002704600079d64] 00:00:02 PreventSystemSleep named: "caffeinate command-line tool"
No kernel assertions.`;
const SECTEUR = ASSERTIONS_BATTERIE.replace('PreventSystemSleep             0', 'PreventSystemSleep             1');
const EVEIL_COMPLET = 'Current System Capabilities are: CPU Graphics Audio Network \nCurrent Power State: 4\n';
const EVEIL_SOMBRE = 'Current System Capabilities are: CPU Network \nCurrent Power State: 4\n';

const JOURNAL = `2026-10-01 02:45:02 -0400 Sleep               	Entering Sleep state due to 'Maintenance Sleep':TCPKeepAlive=active Using AC (Charge:80%) 671 secs
2026-10-01 03:09:13 -0400 Assertions          	Summary- [System: PrevIdle] Using AC(Charge: 80)
2026-10-01 04:08:40 -0400 Sleep               	Entering Sleep state due to 'Maintenance Sleep':TCPKeepAlive=active Using AC (Charge:80%) 489 secs
2026-10-01 04:16:49 -0400 DarkWake            	DarkWake from Deep Idle [CDNP] : due to smc.sysState.Wake(0x70070000) wifibt SMC.OutboxNotEmpty/ Using AC (Charge:80%) 1 se
2026-10-01 04:17:34 -0400 Sleep               	Entering Sleep state due to 'Maintenance Sleep':TCPKeepAlive=active Using AC (Charge:80%) 1459 secs
`;

describe('#1008 · A — lire la machine (sorties figées du 4 oct.)', () => {
    it('A.a l’échange, virgule décimale comprise, et en Go', () => {
        expect(lireEchangeMo('vm.swapusage: total = 7168,00M  used = 5524,38M  free = 1643,62M  (encrypted)')).toBeCloseTo(5524.38);
        expect(lireEchangeMo('total = 15,40G  used = 14,60G  free = 0,80G')).toBeCloseTo(14.6 * 1024);
        expect(lireEchangeMo('illisible')).toBeNull();
    });

    it('A.b la pression, et l’illisible rend null', () => {
        expect(lirePression('kern.memorystatus_vm_pressure_level: 1')).toBe(1);
        expect(lirePression('4\n')).toBe(4);
        expect(lirePression('')).toBeNull();
    });

    it('A.c l’alimentation et les capacités', () => {
        expect(lireAlimentation("Now drawing from 'Battery Power'")).toBe('batterie');
        expect(lireAlimentation("Now drawing from 'AC Power'")).toBe('secteur');
        expect(lireCapacites(EVEIL_COMPLET)).toEqual(['CPU', 'Graphics', 'Audio', 'Network']);
    });

    it('A.d les assertions : le total système, et celles de NOTRE caffeinate seulement', () => {
        expect(lireAssertionsSysteme(ASSERTIONS_BATTERIE)).toMatchObject({ PreventSystemSleep: 0, PreventUserIdleSystemSleep: 1 });
        expect([...lireAssertionsDuProcessus(ASSERTIONS_BATTERIE, 62676)].sort())
            .toEqual(['PreventSystemSleep', 'PreventUserIdleDisplaySleep', 'PreventUserIdleSystemSleep']);
        // powerd tient PreventUserIdleSystemSleep : ce n'est pas le nôtre.
        expect(lireAssertionsDuProcessus(ASSERTIONS_BATTERIE, 1).size).toBe(0);
    });
});

describe('#1008 · B — juger l’éveil au lancement', () => {
    const base = (sortie, etat, alimentation) => jugerEveil({
        capacites: lireCapacites(etat),
        assertionsProcessus: lireAssertionsDuProcessus(sortie, 62676),
        assertionsSysteme: lireAssertionsSysteme(sortie),
        alimentation
    });

    it('B.a sur batterie, -s inopérant (mesuré) : on lance, en le disant', () => {
        expect(base(ASSERTIONS_BATTERIE, EVEIL_COMPLET, 'batterie')).toMatchObject({ ok: true, systemeRetenu: false });
    });

    it('B.b LE CAS DE LA NUIT DU 1er : éveil sombre ⮕ on ne lance pas', () => {
        const juge = base(SECTEUR, EVEIL_SOMBRE, 'secteur');
        expect(juge.ok).toBe(false);
        expect(juge.raison).toMatch(/éveil complet/);
    });

    it('B.c une assertion manquante ⮕ on ne lance pas, et on la nomme', () => {
        const sansEcran = SECTEUR.replace(/^.*62676.*PreventUserIdleDisplaySleep.*$/m, '');
        const juge = base(sansEcran, EVEIL_COMPLET, 'secteur');
        expect(juge).toMatchObject({ ok: false });
        expect(juge.raison).toMatch(/PreventUserIdleDisplaySleep/);
    });

    it('B.d sur secteur, un PreventSystemSleep système à 0 ⮕ on ne lance pas', () => {
        expect(base(ASSERTIONS_BATTERIE, EVEIL_COMPLET, 'secteur').ok).toBe(false);
        expect(base(SECTEUR, EVEIL_COMPLET, 'secteur')).toMatchObject({ ok: true, systemeRetenu: true });
    });
});

describe('#1008 · C — la garde mémoire', () => {
    const seuils = { echangeSeuilMo: 12 * 1024, pressionSeuil: 4 };
    const r = (echangeMo, pression = 1) => ({ echangeMo, pression });

    it('C.a deux relevés de suite au-delà ⮕ arrêt, la raison dit la valeur', () => {
        const juge = jugerMemoire([r(5000), r(13000), r(14950)], seuils);
        expect(juge.arreter).toBe(true);
        expect(juge.raison).toMatch(/14\.6 Go/);
    });

    it('C.b un pic isolé ne suffit pas', () => {
        expect(jugerMemoire([r(13000), r(5000)], seuils).arreter).toBe(false);
        expect(jugerMemoire([r(13000)], seuils).arreter).toBe(false);
    });

    it('C.c la pression critique tenue suffit, même échange bas', () => {
        expect(jugerMemoire([r(3000, 4), r(3000, 4)], seuils).arreter).toBe(true);
        expect(jugerMemoire([r(3000, 2), r(3000, 2)], seuils).arreter).toBe(false);
    });

    it('C.d l’illisible ne déclenche pas d’arrêt', () => {
        expect(jugerMemoire([r(null, null), r(null, null)], seuils).arreter).toBe(false);
    });

    it('C.e au lancement : au-delà du seuil, on ne lance pas', () => {
        expect(jugerLancementMemoire(r(11 * 1024), 10 * 1024).ok).toBe(false);
        expect(jugerLancementMemoire(r(5524), 10 * 1024).ok).toBe(true);
    });

    it('C.f le plus haut de la suite', () => {
        expect(memoireAuPlusHaut([r(5000, 1), r(9000, 2), r(null, null), r(7000, 1)])).toEqual({ echangeMo: 9000, pression: 2 });
    });
});

describe('#1008 · D — les veilles, lues au journal', () => {
    // Le verdict de la nuit du 1er partait à 3 h 09 min 13 s.
    const debut = Date.parse('2026-10-01T03:09:13-04:00');
    const fin = Date.parse('2026-10-01T06:32:00-04:00');

    it('D.a les deux « Maintenance Sleep » de la nuit, et rien d’avant le lancement', () => {
        const veilles = lireVeillesDuJournal(JOURNAL, debut, fin);
        expect(veilles.map((v) => v.dureeS)).toEqual([489, 1459]);
        expect(veilles.every((v) => v.motif === 'Maintenance Sleep')).toBe(true);
        expect(veilles[0].instant).toBe('2026-10-01T08:08:40.000Z');
    });

    it('D.b aucune veille dans la fenêtre ⮕ liste vide', () => {
        expect(lireVeillesDuJournal(JOURNAL, Date.parse('2026-10-01T05:00:00-04:00'), fin)).toEqual([]);
    });
});

describe('#1008 · E — la structure de verifier-playwright.mjs', () => {
    const reveil = VERIF.indexOf("spawnSync('caffeinate', ['-u'");
    const tenue = VERIF.search(/spawn\('caffeinate', \['-d', '-i', '-s', '-w', String\(process\.pid\)\]/);
    const suite = VERIF.indexOf("spawn('npx', ['playwright', 'test'");

    it('E.a -u, puis -d -i -s -w pid, avant la suite', () => {
        expect(reveil).toBeGreaterThan(-1);
        expect(tenue).toBeGreaterThan(reveil);
        expect(suite).toBeGreaterThan(tenue);
    });

    it('E.b le jugement d’éveil et celui de la mémoire au lancement refusent avant la suite', () => {
        const avant = VERIF.slice(tenue, suite);
        expect(avant).toMatch(/if \(!eveil\.ok\) nonJuge\('éveil'/);
        expect(avant).toMatch(/if \(!lancement\.ok\) nonJuge\('mémoire'/);
    });

    it('E.c la suite part asynchrone, dans son propre groupe (plus de spawnSync)', () => {
        expect(VERIF).not.toMatch(/spawnSync\('npx', \['playwright', 'test'/);
        const appel = VERIF.slice(suite, VERIF.indexOf('});', suite));
        expect(appel).toMatch(/detached: true/);
    });

    it('E.d la surveillance juge la mémoire et arrête le groupe entier', () => {
        expect(VERIF).toMatch(/jugerMemoire\(releves,[\s\S]{0,500}arreterLaSuite\(\)/);
        expect(VERIF).toMatch(/process\.kill\(-suite\.pid/);
    });

    it('E.e les veilles sont lues au journal et portées au verdict', () => {
        expect(VERIF).toMatch(/garde\.veilles = lireVeillesDuJournal\(lire\('pmset', \['-g', 'log'\]\)/);
        expect(VERIF).toMatch(/deposerVerdict\(0, echecs, instables, garde\)/);
    });
});
