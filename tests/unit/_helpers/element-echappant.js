/**
 * L'élément minimal que `document.createElement` doit rendre dans un sandbox.
 *
 * ⚠⚠ POURQUOI CE HELPER EXISTE. `escapeHtml` (export-pdf.js) et `echapperHtml`
 * (config.js) échappent en posant le texte dans `textContent` puis en relisant
 * `innerHTML` — c'est le navigateur qui fait le travail. Un faux élément où ces
 * deux champs sont INDÉPENDANTS renvoie une chaîne vide : le document entier se
 * construit sans un mot, et aucune assertion ne bronche tant qu'on ne cherche
 * pas un texte précis. Le piège s'est présenté trois fois le 25 août, dans
 * trois harnais différents.
 *
 * ⚠ `appendChild` GARDE ses enfants. Un `appendChild` qui ne garde rien rend le
 * harnais aveugle à tout ce que le code construit en DOM — les feuilles de
 * l'aperçu PDF, par exemple, existeraient sans qu'on puisse lire ce qu'elles
 * montrent.
 */
export function elementEchappant(tag = 'div') {
    let texte = '';
    const el = {
        tagName: tag, className: '', type: '', value: '', checked: false, disabled: false,
        style: { cssText: '' }, enfants: [], parentElement: null,
        _attributs: {},

        set textContent(v) { texte = v == null ? '' : String(v); },
        get textContent() { return texte; },
        set innerHTML(v) { texte = v == null ? '' : String(v); },
        get innerHTML() {
            return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },

        classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
        setAttribute(n, v) { el._attributs[n] = String(v); },
        getAttribute(n) { return n in el._attributs ? el._attributs[n] : null; },
        addEventListener(evt, fn) { (el._ecouteurs[evt] ||= []).push(fn); },
        declencher(evt) { (el._ecouteurs[evt] || []).forEach(fn => fn()); },
        _ecouteurs: {},

        appendChild(n) { n.parentElement = el; el.enfants.push(n); return n; },
        insertBefore(n, ref) {
            n.parentElement = el;
            const i = el.enfants.indexOf(ref);
            el.enfants.splice(i < 0 ? el.enfants.length : i, 0, n);
            return n;
        },
        remove() {
            if (!el.parentElement) return;
            const i = el.parentElement.enfants.indexOf(el);
            if (i >= 0) el.parentElement.enfants.splice(i, 1);
        },
        querySelector(sel) {
            const cls = String(sel).replace('.', '');
            return el.enfants.find(n => n.className === cls) || null;
        },
        querySelectorAll: () => []
    };
    return el;
}

/** Tout le HTML qu'un élément et sa descendance ont reçu, à plat. */
export function htmlDeToutLArbre(racine) {
    const morceaux = [];
    const visiter = (n) => {
        if (!n) return;
        if (typeof n.innerHTML === 'string') morceaux.push(n.innerHTML);
        (n.enfants || []).forEach(visiter);
    };
    visiter(racine);
    return morceaux.join('');
}
