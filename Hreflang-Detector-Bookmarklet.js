(function () {
    let links = document.querySelectorAll('link[rel="alternate"][hreflang]'),
        urls = Array.from(links).map(link => ({
            url: link.getAttribute("href"),
            hreflang: link.getAttribute("hreflang")
        }));

    if (urls.length > 0) {
        let totalUrls = urls.length,
            indexableStatus = '',
            multipleHreflangs = [],
            missingDefaultHreflang = '',
            selfDeclaration = '',
            invalidHreflangs = [],
            invalidCountryCodes = [],
            canonical = document.querySelector('link[rel="canonical"]');
        
        if (canonical) {
            let canonicalHref = canonical.getAttribute('href'),
                currentUrl = window.location.href,
                currentUrlWithoutSlash = currentUrl.endsWith('/') ? currentUrl.slice(0, -1) : currentUrl,
                canonicalHrefWithoutSlash = canonicalHref.endsWith('/') ? canonicalHref.slice(0, -1) : canonicalHref;

            if (canonicalHref === currentUrl || canonicalHrefWithoutSlash === currentUrlWithoutSlash)
                indexableStatus = 'Self-referencing';
            else
                indexableStatus = 'Canonicalized';
        } else {
            indexableStatus = 'No canonical found';
        }

        let hreflangMap = new Map();
        urls.forEach(item => {
            let hreflang = item.hreflang;
            if (hreflangMap.has(hreflang))
                multipleHreflangs.push({
                    url: item.url,
                    hreflang: hreflang
                });
            else
                hreflangMap.set(hreflang, true);

            if (item.url === window.location.href)
                selfDeclaration = 'Found';
        });

        urls.forEach(item => {
            let currentUrl = window.location.href,
                currentUrlWithoutSlash = currentUrl.endsWith('/') ? currentUrl.slice(0, -1) : currentUrl,
                itemUrlWithoutSlash = item.url.endsWith('/') ? item.url.slice(0, -1) : item.url;

            if (item.url === currentUrl || itemUrlWithoutSlash === currentUrlWithoutSlash)
                selfDeclaration = 'Found';

            if (item.hreflang.toLowerCase() !== 'x-default' && !isValidHreflang(item.hreflang))
                invalidHreflangs.push(item);

            if (item.hreflang.includes('-') && !['x-default'].includes(item.hreflang.toLowerCase())) {
                let countryCode = item.hreflang.split('-')[1];
                if (countryCode && !isValidCountryCode(countryCode))
                    invalidCountryCodes.push(item);
            }
        });

        if (selfDeclaration === '') selfDeclaration = 'Missing';

        let hasDefaultHreflang = Array.from(links).some(link => {
            let hreflang = link.getAttribute('hreflang');
            return hreflang === 'x-default';
        });

        missingDefaultHreflang = hasDefaultHreflang ? '<span style="background-color: lightgreen; color: black;">Found</span>' : '<span style="background-color: red; color: white;">Missing</span>';

        let tableContent = `<h2>Total Number of hreflang URLs: ${totalUrls}</h2>`;
        tableContent += `<h3>Existing URL: ${window.location.href}</h3>`;
        let htmlLang = document.querySelector('html').getAttribute('lang') || 'Not Found';
        tableContent += `<h3>HTML lang: ${htmlLang}</h3>`;
        tableContent += `<h3>Canonical Status: <span style="background-color: ${(indexableStatus === 'Self-referencing') ? 'lightgreen' : 'red'}; color: ${(indexableStatus === 'Self-referencing') ? 'black' : 'white'};">${indexableStatus}</span></h3>`;
        tableContent += `<h3>Self Declaration: <span style="background-color: ${(selfDeclaration === 'Found') ? 'lightgreen' : 'red'}; color: ${(selfDeclaration === 'Found') ? 'black' : 'white'};">${selfDeclaration}</span></h3>`;

        if (invalidHreflangs.length > 0) {
            tableContent += `<h3>Invalid Hreflang ISO 639-1 Language Codes:</h3><table border="1"><tr><th>URL</th><th>hreflang</th></tr>`;
            invalidHreflangs.forEach(item => {
                tableContent += `<tr><td>${item.url}</td><td>${item.hreflang}</td></tr>`;
            });
            tableContent += `</table>`;
        } else {
            tableContent += `<h3>Language Codes: <span style="background-color: lightgreen;">Valid</span></h3>`;
        }

        if (invalidCountryCodes.length > 0) {
            tableContent += `<h3>Invalid Country Codes:</h3><table border="1"><tr><th>URL</th><th>hreflang</th></tr>`;
            invalidCountryCodes.forEach(item => {
                tableContent += `<tr><td>${item.url}</td><td>${item.hreflang}</td></tr>`;
            });
            tableContent += `</table>`;
        } else {
            tableContent += `<h3>Country codes: <span style="background-color: lightgreen;">Valid</span></h3>`;
        }

        if (multipleHreflangs.length > 0) {
            tableContent += `<h3>Multiple Hreflang Entries:</h3><table border="1"><tr><th>URL</th><th>hreflang</th></tr>`;
            multipleHreflangs.forEach(item => {
                tableContent += `<tr><td>${item.url}</td><td>${item.hreflang}</td></tr>`;
            });
            tableContent += `</table>`;
        }

        tableContent += `<h3>X-default reference: ${missingDefaultHreflang}</h3>`;
        tableContent += `<h3>Hreflang URLs:</h3><table border="1"><tr><th>URL</th><th>hreflang</th></tr>`;
        urls.forEach(item => {
            tableContent += `<tr><td>${item.url}</td><td>${item.hreflang}</td></tr>`;
        });
        tableContent += `</table>`;

        let newTab = window.open();
        newTab.document.body.innerHTML = tableContent;

        let csvContent = 'URL,hreflang\n';
        urls.forEach(item => {
            csvContent += `${item.url},${item.hreflang}\n`;
        });

        let downloadButton = document.createElement('a');
        downloadButton.textContent = 'Download CSV';
        downloadButton.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
        downloadButton.setAttribute('download', 'hreflang_urls.csv');
        newTab.document.body.appendChild(downloadButton);

        let attribution = document.createElement('div');
        attribution.style.fontSize = '11px';
        attribution.style.marginTop = '24px';
        let attributionText = document.createElement('span');
        attributionText.textContent = 'Created by Ziggy Shtrosberg @ ';
        let shtrosLink = document.createElement('a');
        shtrosLink.textContent = 'shtros.com';
        shtrosLink.href = 'https://www.shtros.com/';
        shtrosLink.style.color = 'inherit';
        shtrosLink.style.textDecoration = 'underline';
        let caringText = document.createTextNode(' (because sharing is caring) ❤️');
        attribution.appendChild(attributionText);
        attribution.appendChild(shtrosLink);
        attribution.appendChild(caringText);
        let body = newTab.document.querySelector('body');
        body.appendChild(attribution);
    } else {
        alert("No hreflang URLs found.");
    }

    function isValidHreflang(e) {
        let t = ["aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu", "hans", "hant"];
        return t.includes(e.split('-')[0].toLowerCase());
    }

    function isValidCountryCode(e) {
        let t = ["AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "BN", "BG", "BF", "BI", "KH", "CM", "CA", "CV", "KY", "CF", "TD", "CL", "CN", "CX", "CC", "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MO", "MK", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SZ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU", "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW", "HANS", "HANT"];
        return t.includes(e.toUpperCase());
    }
})();