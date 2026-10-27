import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — #1152, lot 2a de la refonte de l'Aide (27 oct. 2026) : Commencer et Cadre disent l'écran
// d'aujourd'hui, en moins de mots.
// Audit : plans de travail/audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md ; remesure du 27 oct.
// (REMESURE-2026-10-27.md) ; consigne CONSIGNE-LOT-2026-10-27-aide-lot-2a-commencer-cadre.md (§2, §4).
//
// Ce que le banc confronte, calculé des deux côtés :
//   · les quatre listes de l'entrée « La bibliothèque » ⟷ la popup 'bibliotheque-fonctionnement', texte validé
//     par Grégoire le 25 oct. (16 h 53), LUE DANS LE MODULE (js/accompagnement-contenu-popup.js exécuté), pas
//     recopiée ici ;
//   · le texte visible de Commencer et du Cadre ⟷ les mots de l'ancien écran ou du jargon (barre latérale,
//     dropdown, Workflow, modal) ;
//   · les entrées des deux parties ⟷ la décision (§2 de la consigne), dans l'ordre ; les quatre absorbées absentes.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

const DEB = html.indexOf('<section id="section-aide"');
const FIN = html.indexOf('fin section-aide');
if (DEB === -1 || FIN === -1) throw new Error('bornes de la section Aide introuvables');
const AIDE = html.slice(DEB, FIN).replace(/<!--[\s\S]*?-->/g, '');

const decoder = (s) => s.replace(/&nbsp;/g, ' ').replace(/&eacute;/g, 'é').replace(/&rsquo;/g, '’').replace(/&amp;/g, '&');
const texte = (s) => decoder(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

function blocDiv(source, debut) {
    const re = /<div\b|<\/div>/g;
    re.lastIndex = debut;
    let profondeur = 0;
    let m;
    while ((m = re.exec(source))) {
        profondeur += m[0] === '</div>' ? -1 : 1;
        if (profondeur === 0) return source.slice(debut, re.lastIndex);
    }
    throw new Error('div non fermé');
}
function blocParId(id) {
    const i = AIDE.indexOf(`id="${id}"`);
    if (i === -1) return null;
    return blocDiv(AIDE, AIDE.lastIndexOf('<div', i));
}
const entreesDe = (bloc) => [...bloc.matchAll(/id="accordeon-aide-([a-z0-9-]+)"/g)].map((m) => m[1]);

// Côté module : le module des popups exécuté, ses entrées captées à `ajouterEntrees`.
function entreesPopup() {
    let captees = null;
    const window = { accompagnement: { ajouterEntrees: (e) => { captees = e; } } };
    vm.runInNewContext(readFileSync(path.join(racine, 'js/accompagnement-contenu-popup.js'), 'utf8'), { window, console });
    if (!captees) throw new Error('accompagnement-contenu-popup.js n\'a rien passé à ajouterEntrees');
    return captees;
}

const COMMENCER = ['presentation', 'prise-en-main', 'demo', 'modes', 'bibliotheque', 'chaines-etapes', 'preferences'];
const CADRE = ['etapes-config', 'cours', 'horaire', 'etudiants', 'presences-calendrier', 'archivage'];
const ABSORBEES = ['modes-formation', 'trimestre', 'groupe-cours', 'groupe'];

describe('#1152 lot 2a · Commencer et Cadre', () => {
    const commencer = blocParId('aide-commencer');
    const cadre = blocParId('aide-cadre');

    it('les deux parties se découpent', () => {
        expect(commencer).toBeTruthy();
        expect(cadre).toBeTruthy();
        expect(texte(commencer).length).toBeGreaterThan(2000);
        expect(texte(cadre).length).toBeGreaterThan(2000);
    });

    it('Commencer et le Cadre ont les entrées de la décision (§2), dans cet ordre', () => {
        expect(entreesDe(commencer)).toEqual(COMMENCER);
        expect(entreesDe(cadre)).toEqual(CADRE);
    });

    it('les quatre entrées absorbées n\'existent plus nulle part dans la page', () => {
        expect(ABSORBEES.filter((id) => html.includes(`id="accordeon-aide-${id}"`))).toEqual([]);
    });

    it('aucune entrée de Commencer ni du Cadre ne parle de l\'ancien écran ni en jargon', () => {
        const interdits = /sidebar|barre latérale|colonne de gauche|dropdown|workflow|\bmodal(e|es|s)?\b/i;
        const fautives = [...COMMENCER, ...CADRE]
            .map((id) => [id, texte(blocParId(`accordeon-aide-${id}`) || '')])
            .filter(([, t]) => interdits.test(t))
            .map(([id, t]) => `${id} : ${t.match(interdits)[0]}`);
        expect(fautives).toEqual([]);
    });
});

describe('#1152 lot 2a · « La bibliothèque » dit le texte validé de la popup, mot pour mot', () => {
    it('les quatre listes de l\'entrée égalent celles de \'bibliotheque-fonctionnement\'', () => {
        const fiche = entreesPopup()['bibliotheque-fonctionnement'].popup;   // `ajouterEntrees` reçoit { cle: { popup } }
        expect(fiche.titre).toBe('Comment fonctionne la bibliothèque');
        const attendu = fiche.sections.filter((s) => s.type === 'liste').map((s) => ({ titre: s.titre, items: s.items }));
        expect(attendu).toHaveLength(4);

        const listes = blocParId('aide-bibliotheque-listes');
        expect(listes).toBeTruthy();
        expect(blocParId('accordeon-aide-bibliotheque')).toContain(listes);
        const lu = [...listes.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>\s*<ul>([\s\S]*?)<\/ul>/g)].map((m) => ({
            titre: texte(m[1]),
            items: [...m[2].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((li) => texte(li[1])),
        }));
        expect(lu).toEqual(attendu);
    });
});

// Retouche du 27 oct. (VERDICT-RELECTURE-2026-10-27-aide-lot-2a.md, § 1 ; réponses de Grégoire au § 2) : chaque
// entrée reprend le mot de l'écran, lu dans son fichier source, et lâche la phrase qui le débordait.
describe('#1152 lot 2a, retouche · les entrées disent le mot de l\'écran', () => {
    const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');
    const entree = (id) => texte(blocParId(`accordeon-aide-${id}`) || '');

    it('presentation : le refus d\'un fichier non signé est borné au geste qui vérifie la signature', () => {
        const libelle = 'Importer le partage d\'une ou d\'un collègue';
        expect(lire('js', 'grilles.js')).toContain(libelle.replace(/'/g, '\\\''));
        expect(entree('presentation')).toContain(`« ${libelle} » refuse un fichier non signé`);
        expect(entree('presentation')).not.toContain('l\'application refuse d\'importer');
    });

    it('prise-en-main : « Assistance » ne règle pas la visite guidée ; « Étapes de configuration » est une entrée de l\'Aide', () => {
        const t = entree('prise-en-main');
        const assistance = tranche(t, 'Assistance', 'Pour configurer');
        expect(assistance).toContain('les info-bulles, l\'aide à l\'écran et les flèches');
        expect(assistance).not.toMatch(/visite guidée/i);
        expect(t).toContain('l\'entrée « Étapes de configuration », dans la partie Cadre de cette Aide');
    });

    it('bibliotheque : la phrase des gestes manquants (#1160 à #1167) suit les listes', () => {
        const listes = blocParId('aide-bibliotheque-listes');
        const apres = texte(tranche(blocParId('accordeon-aide-bibliotheque'), listes).substring(listes.length));
        expect(apres.startsWith('Pour l\'instant, les cartouches et les pratiques ne se gardent pas encore dans ta bibliothèque, une carte d\'alignement ne se retire pas de ce trimestre, et seuls les grilles, les échelles, les productions et les pratiques ont des dossiers.')).toBe(true);
    });

    it('chaines-etapes : c\'est la case décochée qui masque (elle est cochée par défaut)', () => {
        expect(html).toMatch(/id="v2-pref-chaines-etapes" checked/);
        expect(entree('chaines-etapes')).toContain('Décocher « Afficher les chaînes d\'étapes »');
        expect(entree('chaines-etapes')).toContain('les étapes qui rendent cet outil prêt à servir');
    });

    it('preferences : la carte Sécurité est nommée par son libellé', () => {
        const libelle = texte(html.match(/id="pref-fsapi-persistance"[^>]*>\s*<strong[^>]*>([\s\S]*?)<\/strong>/)[1]);
        expect(libelle).toBe('Mémoriser le dossier Travaux et les Archives entre les sessions');
        expect(entree('preferences')).toContain(`« ${libelle} »`);
    });

    it('etapes-config : plus de résumés redits ; la question #1038 vient avant d\'enregistrer', () => {
        const t = entree('etapes-config');
        expect(t).not.toMatch(/résumés|n\/5 configurés/);
        expect(t).toContain('avant d\'enregistrer le groupe-cours');
    });

    it('cours : la nature dit les mots du menu, lus dans js/mots-nature.js', () => {
        const mots = [...lire('js', 'mots-nature.js').matchAll(/^\s*nature: '([^']+)'/gm)].map((m) => m[1]);
        expect(mots).toEqual(['Enseignement', 'Orthopédagogie']);
        const t = entree('cours');
        for (const mot of mots) expect(t).toContain(`« ${mot} »`);
        expect(t).not.toContain('cours ou service');
        expect(t).toContain('les autres champs sont facultatifs');
    });

    it('presences-calendrier : le clic vaut pour le « jour de cours régulier » de la légende', () => {
        const legende = lire('js', 'calendrier-vue.js').match(/<strong>(Jour de cours [^<]+)<\/strong>/)[1];
        expect(legende).toBe('Jour de cours régulier');
        expect(entree('presences-calendrier')).toContain(`Un clic sur un ${legende.toLowerCase()} ouvre`);
    });

    it('archivage : ni la première phrase ni « Quand clore ? » ne disent qu\'on commence un nouveau trimestre après', () => {
        expect(entree('archivage')).not.toMatch(/commencer un nouveau/);
    });
});
