/**
 * Regular expression utilities
 */

/**
 * Tests a string against multiple regular expressions.
 * @param str Test string
 * @param stopOnFirst Set to true to stop testing after the first match has been found.
 * @param regexps One or more regular expressions.
 */
export function matchRegExps(str: string, stopOnFirst: boolean = false, ...regexps: RegExp[]) {
    if (!stopOnFirst) {
        return regexps.map((re) => str.match(re));
    } else {
        let match: RegExpMatchArray;
        return regexps.map((re, i) => {
            if (match) {
                return null;
            } else {
                return str.match(re);
            }
        });
    }
}
