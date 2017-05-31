//LANGUAGE----------------------------------------------------
function Language(lang) {
    var __construct = function () {
        if (eval('typeof ' + lang) == 'undefined') {
            lang = "en";
        }
        return;
    }()

    this.getString = function (str, defaultStr) {
        var retStr = eval('eval(lang).' + str);
        if (typeof retStr != 'undefined') {
            return retStr;
        } else {
            if (typeof defaultStr != 'undefined') {
                return defaultStr;
            } else {
                return eval('en.' + str);
            }
        }
    }
}

function getLanguage() {
    var lang = window.localStorage.getItem('lang');
    if (lang == null) {
        window.localStorage.setItem('lang', 'fr');
        lang = 'fr';
    }

    return lang;
}

function getStrings() {
    var lang = $('#lang').val();
    var l = new Language(lang);
    $('#home').html(l.getString('home'));
    $('#about').html(l.getString('about'));
    $('#contact').html(l.getString('contact'));
    $('#myTimeTable').html(l.getString('myTimeTable'));
    $('#abbreviatedLang').html(l.getString('abbreviatedLang'));
    $('#shuttle').html(l.getString('shuttle'));
    $('#currentlyOffLine').html(l.getString('currentlyOffLine'));
}