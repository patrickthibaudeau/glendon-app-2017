/* 
 * Version: 2017051600
 */

$(document).ready(function () {
    $('#lang').val(getLanguage());
    var thisLang = $('#lang').val();
    startApp(0);
    //Create database object
    var DB = openDatabase("config", "0.1", "this apps configuration", ((1024 * 1024) * 5));

    DB.transaction(function (t) {
        t.executeSql("CREATE TABLE IF NOT EXISTS config (id INTEGER PRIMARY KEY ASC, name VARCHAR(255), value TEXT)");
    });

    //Add language
    DB.transaction(function (t) {

        t.executeSql('SELECT * FROM config WHERE name="lang"', [], function (t, results) {

            var len = results.rows.length;
            if (len == 0) {
                t.executeSql('INSERT INTO config (name,value) VALUES (?,?)', ['lang', thisLang]);
                t.executeSql('SELECT * FROM config WHERE name="lang"', [], function (t, results) {}, null);
            }

        }, null);

    });

    $('#langue-toggle').click(function () {
        var lang = $('#lang').val();
        if (lang == 'fr') {
            $('#lang').val('en');
            //Update config
            DB.transaction(function (t) {
                t.executeSql('INSERT INTO config (name,value) VALUES (?,?)', ['lang', 'en']);
            }, null);
        } else {
            $('#lang').val('fr');
            //Update config
            DB.transaction(function (t) {
                t.executeSql('INSERT INTO config (name,value) VALUES (?,?)', ['lang', 'fr']);
            }, null);
        }
        startApp(0);
    });
});

function startApp(ignore,offLine) {
    $('#spinnerHome').addClass('fa-spin');
    var pageName = getPageName();
    getStrings(); //Provides strings for the app

    if (offLine == 1) {
        getCurrentDate();
        navPills();
        getTimeTableLink();
        if (pageName == 'subcategories') {
            subCategories(offLine);
        }
        if (pageName == 'pagelist') {
            pageList(offLine);
        }
        if (pageName == 'details') {
            detailsPage(offLine);
        }
        if (pageName == 'events') {
            eventsPage(offLine);
        }
        if (pageName == 'favorites') {
            getMyFavorites(offLine);
        }
    } else {
        getSite(ignore,offLine);
        getTimeTableLink();
        if (pageName == 'GlendonApp') {
            getCurrentDate(offLine);
            initSlider();
            getWeather(offLine);
            getAnnouncements(offLine);
            navPills(offLine);
            route124East(offLine);
            route124West(offLine);
            route11South(offLine);
            route11North(offLine);
            getGlendonShuttle(offLine);
            getKeeleShuttle(offLine);

            //Refresh every minute
            setInterval(function () {
                route124East(offLine);
                route124West(offLine);
                route11South(offLine);
                route11North(offLine);
                getGlendonShuttle(offLine);
                getKeeleShuttle(offLine);
            }, 60000);
            //Refresh every 5 seconds
            setInterval(function () {
                getAnnouncementsRefresh(offLine);
            }, 5000);
            //Refresh weather every hour
            setInterval(function () {
                getWeather(offLine);
            }, 3600000);
            //Refresh date every hour
            setInterval(function () {
                getCurrentDate(offLine);
            }, 3600000);


            setInterval(function () {
                $('#spinnerHome').removeClass('fa-spin');
            }, 2000);

        }
        if (pageName == 'subcategories') {
            subCategories();
        }
        if (pageName == 'pagelist') {
            pageList();
        }
        if (pageName == 'details') {
            detailsPage();
        }
        if (pageName == 'events') {
            eventsPage();
        }
        if (pageName == 'favorites') {
            getMyFavorites();
        }
        if (pageName == 'Contact') {
            getCurrentDate();
            getWeather();
        }

    }
}

//SLIDER ANIMATION ------------------------------------------

function initSlider() {

    var ul = $(".slider ul");
    var slide_count = ul.children().length;
    var slide_width_pc = 100.0 / slide_count;
    var slide_index = 0;
    var first_slide = ul.find("li:first-child");
    var last_slide = ul.find("li:last-child");
    // Clone the last slide and add as first li element
    last_slide.clone().prependTo(ul);
    // Clone the first slide and add as last li element
    first_slide.clone().appendTo(ul);
    ul.find("li").each(function (indx) {
        var left_percent = (slide_width_pc * indx) + "%";
        $(this).css({
            "left": left_percent
        });
        $(this).css({
            width: (100 / slide_count) + "%"
        });
    });
    ul.css("margin-left", "-100%");
    // Listen for click of prev button
    $(".slider .prev").click(function () {
        slide(slide_index - 1);
    });
    // Listen for click of next button
    $(".slider .next").click(function () {
        slide(slide_index + 1);
    });

    function slide(new_slide_index) {

        var margin_left_pc = (new_slide_index * (-100) - 100) + "%";
        ul.animate({
            "margin-left": margin_left_pc
        }, 400, function () {

            // If new slide is before first slide...
            if (new_slide_index < 0) {
                ul.css("margin-left", ((slide_count) * (-100)) + "%");
                new_slide_index = slide_count - 1;
            }
            // If new slide is after last slide...
            else if (new_slide_index >= slide_count) {
                ul.css("margin-left", "-100%");
                new_slide_index = 0;
            }

            slide_index = new_slide_index;
        });
    }

}

//NAV PILLS BLUE---------------------------------------------
function navPills(offLine) {
    var lang = getLanguage();
    var l = new Language(lang);
    var html = '';
    if (offLine == 0) {
        html += '<li class="active"><a data-toggle="tab" href="#shuttleTab"><i class="fa fa-bus" aria-hidden="true"></i>' + l.getString('shuttle') + '</a></li>';
        html += '<li><a data-toggle="tab" href="#ttcTab"><i class="fa fa-subway" aria-hidden="true"></i>TTC</a></li>';
        html += '<a href="javascript:void(0);" onClick="startApp(\'1\')"><i id="spinnerHome" class="fa fa-refresh fa-spin refresh-icon" aria-hidden="true"></i></a>';
    } else {
        if (lang == 'fr') {
            html = '<li class="active"><a href="javascript:void(0);"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><span id="currentlyOffLine">Hors ligne</span></a></li>';
        } else {
            html = '<li class="active"><a href="javascript:void(0);"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><span id="currentlyOffLine">Currently offline</span></a></li>';
        }
    }

    $('.blue-title').html(html);
}

//ONLINE STATUS---------------------------------------------
function isOnline() {
    if (navigator.onLine) {
        return true;
    } else {
        return false;
    }
}

//LANGUAGE----------------------------------------------------
function Language(lang) {
    var __construct = function () {
        if (eval('typeof ' + lang) == 'undefined') {
            lang = "en";
        }
        return;
    }

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
    var lang = null;
    //Create database object
    var DB = openDatabase("config", "0.1", "this apps configuration", ((1024 * 1024) * 5));
    DB.transaction(function (t) {
        t.executeSql('SELECT * FROM config WHERE name="lang"', [], function (t, results) {
            lang = results.rows[0].value;
        }, null);
    });

    if (lang == null) {
        DB.transaction(function (t) {
            t.executeSql('INSERT INTO config (name,value) VALUES (?,?)', ['lang', 'fr']);
        });
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
    $('#mon').html(l.getString('mon'));
    $('#tue').html(l.getString('tue'));
    $('#wed').html(l.getString('wed'));
    $('#thu').html(l.getString('thu'));
    $('#fri').html(l.getString('fri'));
    $('#fall').html(l.getString('fall'));
    $('#winter').html(l.getString('winter'));
    $('#summer').html(l.getString('summer'));
    $('#userName').html(l.getString('userName'));
    $('#password').html(l.getString('password'));
    $('#login').html(l.getString('login'));
    $('#uid').attr('placeholder', l.getString('userName'));
    $('#pwd').attr('placeholder', l.getString('password'));
    $('#loginInstructions').html(l.getString('loginInstructions'));
    $('#directory').html(l.getString('directory'));
    $('#lastName').html(l.getString('lastName'));
    $('#firstName').html(l.getString('firstName'));
    $('#emailText').html(l.getString('email'));
    $('#serviceprovided').html(l.getString('title'));
    $('#extension').html(l.getString('extension'));
    $('#ln').attr('placeholder', l.getString('lastName'));
    $('#fn').attr('placeholder', l.getString('firstName'));
    $('#email').attr('placeholder', l.getString('email'));
    $('#dep').attr('placeholder', l.getString('department'));
    $('#directoryHeader').html(l.getString('directory'));
    $('#addToCalendar').html(l.getString('addToCalendar'));
    $('#lifeThreatening').html(l.getString('lifeThreatening'));
    $('#urgentCampusMatters').html(l.getString('urgentCampusMatters'));
    $('#ysGeneral').html(l.getString('ysGeneral'));
    $('#ysTTY').html(l.getString('ysTTY'));
    $('#ysUrgent').html(l.getString('ysUrgent'));
    $('#goSAFE').html(l.getString('goSAFE'));
    $('#good2Talk').html(l.getString('good2Talk'));
    $('#lostFound').html(l.getString('lostFound'));
    $('#SASSL').html(l.getString('SASSL'));
}

//TIMETABLE LINKS----------------------------------
//This function is used to determine which page will
//be loaded according to the month
function getTimeTableLink() {
    var now = new Date();

    switch (now.getMonth()) {
    case 0:
    case 1:
    case 2:
    case 3:
        $("#timeTable").attr('href', 'winter.html');
        break;
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
        $("#timeTable").attr('href', 'summer.html');
        break;
    case 9:
    case 10:
    case 11:
        $("#timeTable").attr('href', 'fall.html');
        break;
    }

}

//TTC ---------------------------------------------
function route124East(offLine) {
    if (offLine == 0) {
        $.ajax({
            type: 'GET',
            url: 'http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&stopId=1220&r=124',
            crossDomain: true,
            dataType: 'json',
            success: function (route) {
                if ($('#lang').val() == 'en') {
                    $('.route124Title').html(route.predictions.routeTitle);
                    $('#route124East .title').html(route.predictions.direction.title);
                    $('#route124East .stopTitle').html(route.predictions.stopTitle);
                    var minute0 = route.predictions.direction.prediction[0].minutes;
                    var minuteText = minute0;
                    if (minute0 === 0) {
                        minuteText = 'Arriving ';
                    }
                } else {
                    $('.route124Title').html(route.predictions.routeTitle);
                    $('#route124East .title').html('Est - 124 Sunnybrook vers l\'hôpital de Sunnybrook');
                    $('#route124East .stopTitle').html('Lawrence ave est à Bayview Ave');
                    var minute0 = route.predictions.direction.prediction[0].minutes;
                    var minuteText = minute0;
                    if (minute0 === 0) {
                        minuteText = 'Arrivé ';
                    }
                }
                $('#route124East .minutes0').html(minuteText);
                $('#route124East .minutes1').html(route.predictions.direction.prediction[1].minutes);
                if (route.predictions.direction.prediction[2].minutes != undefined) {
                    $('#route124East .minutes2').html(route.predictions.direction.prediction[2].minutes);
                }
            }
        });
    }
}

function route124West(offLine) {
    if (offLine == 0) {
        $.ajax({
            url: 'http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&stopId=1726&r=124',
            crossDomain: true,
            dataType: 'json',
            success: function (route) {
                if ($('#lang').val() == 'en') {
                    $('.to').html('To:');
                    $('.stop').html('Stop:');
                    $('.route124Title').html(route.predictions.routeTitle);
                    $('#route124West .title').html(route.predictions.direction.title);
                    $('#route124West .stopTitle').html(route.predictions.stopTitle);
                    var minute0 = route.predictions.direction.prediction[0].minutes;
                    var minuteText = minute0;
                    if (minute0 === 0) {
                        minuteText = 'Arriving ';
                    }
                } else {
                    $('.to').html('Vers:');
                    $('.stop').html('Arrêt:');
                    $('.route124Title').html(route.predictions.routeTitle);
                    $('#route124West .title').html('Ouest - 124 Sunnybrook vers la gare de Lawrence');
                    $('#route124West .stopTitle').html('Bayview ave à Lawrence ave est (Campus Glendon York U)');
                    var minute0 = route.predictions.direction.prediction[0].minutes;
                    var minuteText = minute0;
                    if (minute0 == 0) {
                        minuteText = 'Arrivé ';
                    }
                }
                $('#route124West .minutes0').html(minuteText);
                $('#route124West .minutes1').html(route.predictions.direction.prediction[1].minutes);
                if (route.predictions.direction.prediction[2].minutes != undefined) {
                    $('#route124West .minutes2').html(route.predictions.direction.prediction[2].minutes);
                }
            }
        });
    }
}

function route11South(offLine) {
    if (offLine == 0) {
        $.ajax({
            url: 'http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&stopId=11330&r=11',
            crossDomain: true,
            dataType: 'json',
            success: function (route) {
                if ($('#lang').val() == 'en') {
                    $('.route11Title').html(route.predictions.routeTitle);
                    $('#route11South .title').html(route.predictions.direction.title);
                    $('#route11South .stopTitle').html(route.predictions.stopTitle);
                    var minute0 = route.predictions.direction.prediction[0].minutes;
                    var minuteText = minute0;
                    if (minute0 == 0) {
                        minuteText = 'Arriving ';
                    }
                } else {
                    $('.route11Title').html(route.predictions.routeTitle);
                    $('#route11South .title').html('Sud - 11 Bayview vers Davisville Station via Sunnybrook');
                    $('#route11South .stopTitle').html('Bayview ave à Lawrence ave est (Campus Glendon York U)');
                    var minute0 = route.predictions.direction.prediction[0].minutes;
                    var minuteText = minute0;
                    if (minute0 == 0) {
                        minuteText = 'Arrivé ';
                    }
                }
                $('#route11South .minutes0').html(minuteText);
                $('#route11South .minutes1').html(route.predictions.direction.prediction[1].minutes);
                if (route.predictions.direction.prediction[2].minutes != undefined) {
                    $('#route11South .minutes2').html(route.predictions.direction.prediction[2].minutes);
                }
            }
        });
    }
}

function route11North(offLine) {
    if (offLine == 0) {
        $.ajax({
            url: 'http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&stopId=1726&r=11',
            crossDomain: true,
            dataType: 'json',
            success: function (route) {
                if ($('#lang').val() == 'en') {
                    $('.route11Title').html(route.predictions.routeTitle);
                    $('#route11North .title').html(route.predictions.direction.title);
                    $('#route11North .stopTitle').html(route.predictions.stopTitle);
                    var minute0 = route.predictions.direction.prediction[0].minutes;
                    var minuteText = minute0;
                    if (minute0 == 0) {
                        minuteText = 'Arriving ';
                    }
                } else {
                    $('.route11Title').html(route.predictions.routeTitle);
                    $('#route11North .title').html('Nord - 11 Bayview vers Steeles via Sunnybrook');
                    $('#route11North .stopTitle').html('Bayview ave à Lawrence ave est (Campus Glendon York U)');
                    var minute0 = route.predictions.direction.prediction[0].minutes;
                    var minuteText = minute0;
                    if (minute0 == 0) {
                        minuteText = 'Arriving ';
                    }
                }
                $('#route11North .minutes0').html(minuteText);
                $('#route11North .minutes1').html(route.predictions.direction.prediction[1].minutes);
                if (route.predictions.direction.prediction[2].minutes != undefined) {
                    $('#route11North .minutes2').html(route.predictions.direction.prediction[2].minutes);
                }
            }
        });
    }
}
//GLENDON SHUTTLE SERVICE-----------------------------------
function getGlendonShuttle(offLine) {
    var lang = getLanguage();
    var l = new Language(lang);
    if (offLine == 0) {
        var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_webapp_shuttle&campus=glendon&moodlewsrestformat=json';
        $.ajax({
            url: url,
            crossDomain: true,
            dataType: 'json',
            success: function (shuttle) {

                var html = '';
                if ($('#lang').val() == 'en') {
                    if (shuttle.length == 1 && shuttle[0]['campus'] == 0) {
                        html = '<div class="alert alert-warning" >No shuttle available at this time.</div>';
                    } else {
                        for (i = 0; i < shuttle.length; i++) {
                            if (shuttle[i].remaininghour != "") {
                                var timeRemaining = shuttle[i].remaininghour + ' hour(s) ' + shuttle[i].remainingminutes + ' minute(s)';
                            } else {
                                if (shuttle[i].remainingminutes != 0) {
                                    var timeRemaining = shuttle[i].remainingminutes + ' minute(s)';
                                } else {
                                    var timeRemaining = 'Leaving';
                                }
                            }
                            html += '<li>';
                            html += '	<div id="bus-time">';
                            html += timeRemaining;

                            var departureMinutes = shuttle[i].departureminute;

                            html += '		<br/><span class="bus-time-span">' + shuttle[i].departurehour + ':' + departureMinutes + '</span>';
                            html += '	</div>';
                            html += '	<div id="direction">';
                            html += '		<span id="destination-indicator">Glendon York Hall<br/>' + l.getString('towards') + ' Keele Vari Hall</span>';
                            html += '	</div>';
                            html += '</li>';

                            if (i == 3) {
                                break;
                            }
                        }
                    }

                } else {
                    if (shuttle.length == 1 && shuttle[0]['campus'] == 0) {
                        html = '<div class="alert alert-warning">Pas de navette disponible pour le moment.</div>';
                    } else {
                        for (i = 0; i < shuttle.length; i++) {
                            if (shuttle[i].remaininghour != "") {
                                var timeRemaining = shuttle[i].remaininghour + ' h ' + shuttle[i].remainingminutes + ' min';
                            } else {
                                if (shuttle[i].remainingminutes != 0) {
                                    var timeRemaining = shuttle[i].remainingminutes + ' min';
                                } else {
                                    var timeRemaining = 'Départ';
                                }
                            }
                            html += '<li>';
                            html += '	<div id="bus-time">';
                            html += timeRemaining;
                            html += '		<br/><span class="bus-time-span">' + shuttle[i].departurehour + ' h ' + shuttle[i].departureminute + '</span>';
                            html += '	</div>';
                            html += '	<div id="direction">';
                            html += '		<span id="destination-indicator">Glendon York Hall<br/>' + l.getString('towards') + ' Keele Vari Hall</span>';
                            html += '	</div>';
                            html += '</li>';

                            if (i == 3) {
                                break;
                            }
                        }
                    }
                }
                $('.to-keele').html(html);
            }
        });
    }
}

//KEELE SHUTTLE SERVICE-----------------------------------
function getKeeleShuttle(offLine) {
    var lang = getLanguage();
    var l = new Language(lang);
    if (offLine == 0) {
        var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_webapp_shuttle&campus=keele&moodlewsrestformat=json';
        $.ajax({
            url: url,
            crossDomain: true,
            dataType: 'json',
            success: function (shuttle) {

                var html = '';
                if ($('#lang').val() == 'en') {
                    if (shuttle.length == 1 && shuttle[0]['campus'] == 0) {
                        html = '<div class="alert alert-warning" >No shuttle available at this time.</div>';
                    } else {
                        for (i = 0; i < shuttle.length; i++) {
                            if (shuttle[i].remaininghour != "") {
                                var timeRemaining = shuttle[i].remaininghour + ' hour(s) ' + shuttle[i].remainingminutes + ' minute(s)';
                            } else {
                                if (shuttle[i].remainingminutes != 0) {
                                    var timeRemaining = shuttle[i].remainingminutes + ' min';
                                } else {
                                    var timeRemaining = 'Leaving';
                                }
                            }
                            html += '<li>';
                            html += '	<div id="bus-time">';
                            html += timeRemaining;
                            html += '		<br/><span class="bus-time-span">' + shuttle[i].departurehour + ':' + shuttle[i].departureminute + '</span>';
                            html += '	</div>';
                            html += '	<div id="direction">';
                            html += '		<span id="destination-indicator">Keele Vari Hall<br/>' + l.getString('towards') + ' Glendon York Hall</span>';
                            html += '	</div>';
                            html += '</li>';

                            if (i == 3) {
                                break;
                            }
                        }
                    }

                } else {
                    if (shuttle.length == 1 && shuttle[0]['campus'] == 0) {
                        html = '<div class="alert alert-warning">Pas de navette disponible pour le moment.</div>';
                    } else {
                        for (i = 0; i < shuttle.length; i++) {
                            if (shuttle[i].remaininghour != "") {
                                var timeRemaining = shuttle[i].remaininghour + ' h ' + shuttle[i].remainingminutes + ' min';
                            } else {
                                if (shuttle[i].remainingminutes != 0) {
                                    var timeRemaining = shuttle[i].remainingminutes + ' min';
                                } else {
                                    var timeRemaining = 'Départ';
                                }
                            }
                            html += '<li>';
                            html += '	<div id="bus-time">';
                            html += timeRemaining;
                            html += '		<br/><span class="bus-time-span">' + shuttle[i].departurehour + ' h ' + shuttle[i].departureminute + '</span>';
                            html += '	</div>';
                            html += '	<div id="direction">';
                            html += '		<span id="destination-indicator">Keele Vari Hall<br/>' + l.getString('towards') + ' Glendon York Halll</span>';
                            html += '	</div>';
                            html += '</li>';

                            if (i == 3) {
                                break;
                            }
                        }
                    }
                }
                $('.to-glendon').html(html);
            }
        });
    }
}
//WEATHER --------------------------------------------------

function getWeather(offLine) {

    if (offLine == 0) {
        var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_webapp_weather&retrieve=1&moodlewsrestformat=json';
        $.ajax({
            url: url,
            crossDomain: true,
            dataType: 'json',
            success: function (weather) {

                if ($('#lang').val() == 'en') {
                    $('#temperature').html(weather[0].temperature_en);
                    $('#condition').html(weather[0].condition_en);
                } else {
                    $('#temperature').html(weather[0].temperature_fr);
                    $('#condition').html(weather[0].condition_fr);
                }
                $('.meteo-icon').addClass(weather[0].icon);
            }
        });
    }

}

//CURRENT DATE-------------------------------------------------
function getCurrentDate() {
    var now = new Date();
    var monthEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var monthFr = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayFr = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    var day = ("0" + now.getDate()).slice(-2);
    var year = now.getFullYear();
    var dayName = '';
    var currentDate = '';
    if ($('#lang').val() == 'en') {
        dayName = dayEn[now.getDay()];
        currentDate = monthEn[now.getMonth()] + day + ', ' + year;
    } else {
        dayName = dayFr[now.getDay()];
        currentDate = day + ' ' + monthFr[now.getMonth()] + ', ' + year;
    }
    $('#dayName').html(dayName);
    $('#currentDate').html(currentDate);
}

function getDateInfo(date) {
    var now = new Date(date);
    var monthEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var monthFr = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    var dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayFr = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    var day = ("0" + now.getDate()).slice(-2);
    var year = now.getFullYear();
    var dayNameEn = dayEn[now.getDay()];
    var currentDateEn = monthEn[now.getMonth()] + day + ', ' + year;
    var dayNameFr = dayFr[now.getDay()];
    var currentDateFr = day + ' ' + monthFr[now.getMonth()] + ', ' + year;
    var timeFr = now.getHours() + 'h' + now.getMinutes();
    var timeEn = now.getHours() + ':' + now.getMinutes();

    var dateTime = {
        day: day,
        year: year,
        dayNameEn: dayNameEn,
        currentDateEn: currentDateEn,
        dayNameFr: dayNameFr,
        currentDateFr: currentDateFr,
        timeFr: timeFr,
        timeEn: timeEn,
    }

    return dateTime;

}

//ANNOUNCEMENTS--------------------------------------------
function getAnnouncements(offLine) {
    if (offLine == 0) {
        var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_webapp_announcements&retrieve=1&moodlewsrestformat=json';
        $.ajax({
            url: url,
            crossDomain: true,
            dataType: 'json',
            success: function (a) {
                var now = new Date();
                var currentDate = now.getYear() + now.getMonth() + now.getDay();
                if (a.length > 0 && (a[0].liFr != '' || a[0].liEn != '')) {
                    var html = '<div class="announcements">' + "\r";
                    html += '<!--' + currentDate + '-->';
                    html += '   <div class="slider">' + "\r";
                    html += '       <ul>' + "\r";
                    for (i = 0; i < a.length; i++) {
                        if ($('#lang').val() == 'en') {
                            html += a[i].liEn;
                        } else {
                            html += a[i].liFr;
                        }
                    }

                    html += '       </ul>' + "\r";
                    html += '       <button class="prev"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>' + "\r";
                    html += '       <button class="next"><i class="fa fa-chevron-right" aria-hidden="true"></i></button>' + "\r";
                    html += '   </div>' + "\r"; // Slider
                    html += '</div>' + "\r"; // Announcements
                    /**
                     * Convert html to Base64 and store.
                     * Verify stored code with new code.
                     * If not the same refresh annoucments.
                     * Otherwise, skip 
                     */
                    var code = html;
                    window.localStorage.setItem('announcementCode', code);
                    $('#announcementsContent').html(html);
                    var ulWidth = (a.length * 100);
                    $('.slider ul').css('width', ulWidth + '%');
                    var liWidth = (100 / a.length);
                    $('.slider li').css('width', liWidth + '%');
                    initSlider();
                }
            }
        });
    }
}

/**
 * This function is nearly identicle to the getAnnoucements
 * The difference is that it checks to see if localstorage code has changed
 * If it has, it refreshes the announcements. Else, it skips.
 * @returns {undefined}
 */
function getAnnouncementsRefresh(offLine) {
    if (offLine == 0) {
        var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_webapp_announcements&retrieve=1&moodlewsrestformat=json';
        $.ajax({
            url: url,
            crossDomain: true,
            dataType: 'json',
            success: function (a) {
                var now = new Date();
                var currentDate = now.getYear() + now.getMonth() + now.getDay();
                if (a.length > 0 && (a[0].liFr != '' || a[0].liEn != '')) {
                    var html = '<div class="announcements">' + "\r";
                    html += '<!--' + currentDate + '-->';
                    html += '   <div class="slider">' + "\r";
                    html += '       <ul>' + "\r";
                    for (i = 0; i < a.length; i++) {
                        if ($('#lang').val() == 'en') {
                            html += a[i].liEn;
                        } else {
                            html += a[i].liFr;
                        }
                    }

                    html += '       </ul>' + "\r";
                    html += '       <button class="prev"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>' + "\r";
                    html += '       <button class="next"><i class="fa fa-chevron-right" aria-hidden="true"></i></button>' + "\r";
                    html += '   </div>' + "\r"; // Slider
                    html += '</div>' + "\r"; // Announcements

                    /**
                     * Convert html to Base64 and store.
                     * Verify stored code with new code.
                     * If not the same refresh annoucments.
                     * Otherwise, skip 
                     */
                    var code = html;
                    if (window.localStorage.getItem('announcementCode') != code) {
                        window.localStorage.setItem('announcementCode', code);
                        $('#announcementsContent').html(html);
                        var ulWidth = (a.length * 100);
                        $('.slider ul').css('width', ulWidth + '%');
                        var liWidth = (100 / a.length);
                        $('.slider li').css('width', liWidth + '%');
                        initSlider();
                    }
                } else {
                    $('.announcements').remove();
                }
            }
        });
    }
}



//FAVORITES-----------------------------------------------

function getMyFavorites() {
    //       window.localStorage.removeItem('favorites');
    var lang = getLanguage();
    var l = new Language(lang);
    var storage = window.localStorage.getItem('favorites');
    if ((storage !== "") && (storage !== null)) {
        var favorites = JSON.parse(storage);
        var html = '<ul>';
        if (favorites != null) {
            for (i = 0; i < favorites.length; i++) {
                html += '<li class="menu-section">';
                html += '<i class="fa fa-angle-right sub-menu-arrow" aria-hidden="true"></i>';
                //                html += '<i class="fa fa-trash pull-left sub-menu-trash" onClick="deleteFavorite(' + favorites[i]['id'] + ')" aria-hidden="true"></i>';
                html += '<a href="' + favorites[i].url + '">' + favorites[i].name + '</a>';
                html += '</li>';
            }
        }
        html += '</ul>';
        $('#favorites').html(html);
    }
    if (lang == 'en') {
        $('#myFavorites').html(l.getString('myFavorites'));
    } else {
        $('#myFavorites').html(l.getString('myFavorites'));
    }

}

function addToFavorites() {
    var lang = getLanguage();
    var l = new Language(lang);
    var id = $('#id').val();
    var name = $('#name').val();
    var url = $('#url').val();
    //Check to see if there is a data=id
    var dataId = $('#favoriteIcon').attr('data-id');

    //first get the object from storage
    var favorites = window.localStorage.getItem('favorites');

    if ((favorites == "") || (favorites == null)) {
        obj = [{
            'id': parseInt(id),
            'name': name,
            'url': url
        }];
    } else {
        var obj = JSON.parse(favorites);
        obj.push({
            id: parseInt(id),
            name: name,
            url: url
        });
    }
    var str = JSON.stringify(obj);
    //Store favorites
    window.localStorage.setItem('favorites', str);

    if (dataId == -1) {
        $('#favoriteIcon').attr('style', "color:#E31836");

        if (lang == 'en') {
            $.notify({
                message: "Favorite added"
            }, {
                element: 'body',
                position: null,
                type: 'success',
                delay: 1000,
            });
        } else {
            $.notify({
                message: "Favoris ajouté"
            }, {
                element: 'body',
                position: null,
                type: 'success',
                delay: 1000,
            });
        }
        $('#favoriteIcon').attr('data-id', id);
    } else {
        deleteFavorite(dataId);
        $('#favoriteIcon').attr('data-id', -1);
    }
}

function deleteFavorite(id) {
    //Convert into integer
    id = parseInt(id);
    //first get the object from storage
    var favorites = window.localStorage.getItem('favorites');
    var obj = JSON.parse(favorites);
    var i = 0;

    items = $.grep(obj, function (obj) {
        return obj.id !== id;
    });

    var str = JSON.stringify(items);
    //    //Store favorites
    localStorage.setItem('favorites', str);
    $('#favoriteIcon').attr('style', "color:rgba(15, 44, 91, 0.3)");
    return getMyFavorites();

}

//SITE AND PAGES-------------------------------------------------------
function getSite(ignoreVersion,offLine) {

    //Create site version. This will prevent the site from being pulled constantly reducing data transfers.
    //The site data will only be updated once per day unless ignoreVersion is set
    var now = new Date();
    var version = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
    var siteVersion = window.localStorage.getItem('siteVersion');

    //Only update if online
    if (offLine == 0) {
        //Only update if version is ignored OR on a new day
        if (ignoreVersion == 1 || siteVersion == null || siteVersion != version) {

            var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_webapp_site&retrieve=1&moodlewsrestformat=json';
            $.ajax({
                url: url,
                crossDomain: true,
                dataType: 'json',
                success: function (site) {
                    var siteCode = window.localStorage.getItem('siteCode');
                    if (siteCode == null) {
                        var data = site[0]['site'];
                        window.localStorage.setItem('siteCode', data);
                    } else {
                        if (siteCode != site[0]['site']) {
                            siteCode = site[0]['site'];
                            var data = siteCode;
                            window.localStorage.setItem('siteCode', data);

                        }
                    }

                    var json = JSON.parse(data);

                    siteVersion = window.localStorage.setItem('siteVersion', version);
                    siteVersion = version;
                }
            });
        }
    }
}

function subCategories() {
    var id = $('#cId').val();
    if (id == '') {
        id = getUrlVars()["id"];
        $('#cId').val(id);
    }
    var siteCode = window.localStorage.getItem('siteCode');
    var json = JSON.parse(siteCode);
    var sc = json['categories'][id]['subcategories']; //Sub-Categories


    var html = '<ul>';
    for (i = 0; i < sc.count; i++) {
        if ($('#lang').val() == 'en') {
            html += '<li class="menu-section">';
            html += '    <i class="fa fa-angle-right sub-menu-arrow" aria-hidden="true"></i>';
            html += '    <a href="pagelist.html?cid=' + id + '&scid=' + i + '">' + sc[i].nameEn + '</a>';
            html += '</li>';
        } else {
            html += '<li class="menu-section">';
            html += '    <i class="fa fa-angle-right sub-menu-arrow" aria-hidden="true"></i>';
            html += '    <a href="pagelist.html?cid=' + id + '&scid=' + i + '">' + sc[i].nameFr + '</a>';
            html += '</li>';
        }
    }
    html += '</ul>';
    $('#subCategories').html(html);
}

//After clicking from a student or community list item, you then get
//a list of all pages
function pageList() {
    var cId = $('#cId').val();
    var scId = $('#scId').val();
    if (cId == '') {
        cId = getUrlVars()["cid"];
        $('#cId').val(cId);
    }
    if (scId == '') {
        scId = getUrlVars()["scid"];
        $('#scId').val(scId);
    }
    var siteCode = window.localStorage.getItem('siteCode');
    var json = JSON.parse(siteCode);
    var list = json['categories'][cId]['subcategories'][scId]['listing'];
    var redirect = false;
    var html = '<ul>';

    var favorites = JSON.parse(window.localStorage.getItem('favorites'));

    for (i = 0; i < list.count; i++) {
        //Get external urls;
        if (list[i].externalUrlEn != '' || list[i].externalUrlFr != '') {
            var redirectEn = list[i].externalUrlEn;
            var redirectFr = list[i].externalUrlFr;

            if (redirectFr == '') {
                redirectFr = redirectEn;
            }

            if (redirectEn == '') {
                redirectEn = redirectFr;
            }
            redirect = false;
        }
        //This is to change the color of the heart for favorites
        var style = '';
        if (favorites !== null) {
            var result = $.grep(favorites, function (e) {
                return e.id == list[i].id;
            });

            if (result.length == 1) {
                style = 'style="color:#E31836"';
            } else {
                style = '';
            }
        }
        if ($('#lang').val() == 'en') {
            html += '<li class="menu-section-listing">';
            //            html += '    <i class="fa fa-heart sub-menu-heart" ' + style + ' aria-hidden="true" onclick="addToFavorites(' + list[i].id + ')"></i>';
            if (redirect == true) {
                html += '    <a href="' + redirectEn + '" target="_blank">' + list[i].nameEn + '</a>';
            } else {
                html += '    <a href="details.html?cid=' + cId + '&scid=' + scId + '&listid=' + i + '&pid=' + list[i].id + '">' + list[i].nameEn + '</a>';
            }
            html += '</li>';
        } else {
            html += '<li class="menu-section-listing">';
            //            html += '    <i class="fa fa-heart sub-menu-heart" ' + style + ' aria-hidden="true" onclick="addToFavorites(' + list[i].id + ')"></i>';
            if (redirect == true) {
                html += '    <a href="' + redirectEn + '" target="_blank">' + list[i].nameEn + '</a>';
            } else {
                html += '    <a href="details.html?cid=' + cId + '&scid=' + scId + '&listid=' + i + '&pid=' + list[i].id + '">' + list[i].nameFr + '</a>';
            }
            html += '</li>';
        }
    }
    html += '</ul>';
    $('#pageList').html(html);

    $('.site-wrap').swipe({
        allowPageScroll: "vertical",
        //Generic swipe handler for all directions
        swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
            if (direction == 'right') {
                window.location = 'subcategories.html?id=' + cId;
            }
        }
    });
    //Update back link
    $('#return-back-link').attr('href', 'subcategories.html?id=' + cId);

}

function detailsPage(offLine) {
    var lang = $('#lang').val();
    var l = new Language(lang);
    var cId = $('#cId').val();
    var scId = $('#scId').val();
    var listId = $('#listId').val();
    var pId = $('#pId').val();
    if (cId == '') {
        cId = getUrlVars()["cid"];
        $('#cId').val(cId);
    }
    if (scId == '') {
        scId = getUrlVars()["scid"];
        $('#scId').val(scId);
    }
    if (listId == '') {
        listId = getUrlVars()["listid"];
        $('#listId').val(listId);
    }
    if (pId == '') {
        pId = getUrlVars()["pid"];
        $('#pId').val(pId);
    }

    //Use todays date to view events
    var now = new Date();
    var today = now.getFullYear() + '' + now.getMonth() + '' + now.getDate();
    var todayDay = now.getDay();
    var eventExists = Array();
    //This is to change the color of the heart for favorites
    var favorites = JSON.parse(window.localStorage.getItem('favorites'));
    var style = '';
    if (favorites !== null) {
        var result = $.grep(favorites, function (e) {
            return e.id == pId;
        });
        if (result.length == 1) {
            $('#favoriteIcon').attr('style', "color:#E31836");
            $('#favoriteIcon').attr('data-id', pId);
            $('#favoriteIcon').attr('onclick', "addToFavorites(" + pId + ")");
        } else {
            style = '';
            $('#favoriteIcon').attr('onclick', "addToFavorites(" + pId + ")");
            $('#favoriteIcon').attr('style', "color:#E4E4E4");
            $('#favoriteIcon').attr('data-id', -1);
        }
    } else {
        $('#favoriteIcon').attr('onclick', "addToFavorites(" + pId + ")");
        $('#favoriteIcon').attr('style', "color:#E4E4E4");
        $('#favoriteIcon').attr('data-id', -1);
    }

    var siteCode = window.localStorage.getItem('siteCode');
    var json = JSON.parse(siteCode);
    var details = json['categories'][cId]['subcategories'][scId]['listing'][listId];
    var events = json['categories'][cId]['subcategories'][scId]['listing'][listId]['events'];


    var event = '<ul class="default_list">';

    //Add favorites data info
    $('#url').val('details.html?cid=' + cId + '&scid=' + scId + '&listid=' + listId + '&pid=' + pId);
    $('#id').val(pId);

    $('#search').attr('placeholder', l.getString('refineList'));

    if ($('#lang').val() == 'en') {
        $('.location-name').html(details.nameEn);
        $('#description').html(details.descriptionEn);
        if (offline == 1 || details.imageEn == "") {
            $('#location-image').attr('src', 'img/transparent.png');
            $('#location-image').attr('style', 'width: 0px; height:0px;');

        } else {
            $('#location-image').attr('src', details.imageEn);
        }
        $('#location-email').html(details.email);

        if (details.externalUrlEn != '') {
            $('#externalUrl').html('<a href="' + details.externalUrlEn + '"><i class="fa fa-globe  contact-info-icon" aria-hidden="true"></i></a>');
        }

        for (e = 0; e < events['count']; e++) {
            //Get event date for comparison
            var eventDate = new Date(events[e].startDateTime);
            var thisEvent = eventDate.getFullYear() + '' + eventDate.getMonth() + '' + eventDate.getDate();
            var thisEventDay = eventDate.getDay();

            var eventDate = getDateInfo(events[e].startTimeEn);
            switch (events.type) {
            case 1:
                $('#eventsTitle').html(l.getString('eventTitle'));
                if (thisEvent >= today) {
                    event += '    <li class="location-event-listing">';
                    event += '    <a href="events.html?cid=' + cId + '&scid=' + scId + '&listid=' + listId + '&pid=' + pId + '&eid=' + e + '"><i class="fa fa-angle-right event-arrow" aria-hidden="true"></i>';
                    event += '    <span>' + events[e].nameEn + '</span><br/>Where: ' + events[e].locationEn + '<br/>';
                    event += '    When: ' + eventDate.currentDateEn + ' | @ ' + eventDate.timeEn + '</a>';
                    event += '    </li>';
                }
                break;
            case 2:
                $('#eventsTitle').html(l.getString('eventTitle'));
                if (thisEvent == today) {
                    event += '    <li class="location-event-listing">';
                    event += '    <a href="events.html?cid=' + cId + '&scid=' + scId + '&listid=' + listId + '&pid=' + pId + '&eid=' + e + '"><i class="fa fa-angle-right event-arrow" aria-hidden="true"></i>';
                    event += '    <span>' + events[e].nameEn + '</span><br/>Where: ' + events[e].locationEn + '<br/>';
                    event += '    When: ' + eventDate.currentDateEn + ' | @ ' + eventDate.timeEn + '</a>';
                    event += '    </li>';
                    eventExists[e] = thisEventDay + '-' + events[e].nameEn;
                }

                break;
            case 3:
                $('#eventsTitle').html(l.getString('dailySpecials'));

                var operationHours = JSON.parse(events[e].operationHours);
                var openingHour = '';
                var closingHour = '';


                var days = JSON.parse(events[e].days);
                var day = now.getDay();
                //get operation hours for today
                for (i = 0; i < operationHours.length; i++) {
                    if (operationHours[i].day == day) {
                        openingHour = operationHours[i].openingHour;
                        closingHour = operationHours[i].closingHour;
                    }
                }
                var hour = now.getHours();
                var minutes = now.getMinutes();
                //Check if store is open
                var storeHours = '<h1 class="hours-operation-title">Store hours</h1>';
                //                storeHours += '<h1 class="operation-schedule">' + openHour + ' à ' + closingHour + '<span class="open-icon">OPEN</span></h1>'
                storeHours += '<h1 class="operation-schedule">' + openingHour + ' to ' + closingHour + '</h1>';
                $('#storeHours').html(storeHours);
                if ($.inArray(day, days)) {
                    event += '    <li class = "food-menu-item"> ';
                    if (offline == 1 || events[e].imageEn != "") {
                        event += '    <img style="float: left; margin: 0px 15px 15px 0px;" src="' + events[e].imageEn + '" class="img-responsive" height="42" width="42">';
                    }
                    event += '    <span>$' + events[e].price + ' // ' + events[e].nameEn + '</span><br style="clear:both" />' + events[e].descriptionEn;
                    event += '    </li>';

                }
                break;
            }
        }
        event += '</ul>';
        $('#name').val(details.nameEn);
        console.log(eventExists);
    } else {
        $('.location-name').html(details.nameFr);
        $('#description').html(details.descriptionFr);
        if (offline == 1 || details.imageFr == "") {
            $('#location-image').attr('src', 'img/transparent.png');
            $('#location-image').attr('style', 'width: 0px; height:0px;');
        } else {
            $('#location-image').attr('src', details.imageFr);
        }
        $('#location-email').html(details.email);

        if (details.externalUrlFr != '') {
            $('#externalUrl').html('<a href="' + details.externalUrlFr + '"><i class="fa fa-globe  contact-info-icon" aria-hidden="true"></i></a>');
        }
        for (e = 0; e < events['count']; e++) {
            //Get event date for comparison
            var eventDate = new Date(events[e].startDateTime);
            var thisEvent = eventDate.getFullYear() + '' + eventDate.getMonth() + '' + eventDate.getDate();
            var thisEventDay = eventDate.getDay();
            var eventDate = getDateInfo(events[e].startTimeEn);

            switch (events.type) {
            case 1:
                $('#eventsTitle').html(l.getString('eventTitle'));
                if (thisEvent >= today) {
                    event += '    <li class="location-event-listing">';
                    event += '    <a href="events.html?cid=' + cId + '&scid=' + scId + '&listid=' + listId + '&pid=' + pId + '&eid=' + e + '"><i class="fa fa-angle-right event-arrow" aria-hidden="true"></i>';
                    event += '    <span>' + events[e].nameFr + '</span><br/>Ou: ' + events[e].locationFr + '<br/>';
                    event += '    Quand: ' + eventDate.currentDateFr + ' | @ ' + eventDate.timeFr + '</a>';
                    event += '    </li>';
                }
                break;
            case 2:
                $('#eventsTitle').html(l.getString('eventTitle'));
                if (thisEvent == today) {
                    event += '    <li class="location-event-listing">';
                    event += '    <a href="events.html?cid=' + cId + '&scid=' + scId + '&listid=' + listId + '&pid=' + pId + '&eid=' + e + '"><i class="fa fa-angle-right event-arrow" aria-hidden="true"></i>';
                    event += '    <span>' + events[e].nameFr + '</span><br/>Ou: ' + events[e].locationFr + '<br/>';
                    event += '    Quand: ' + eventDate.currentDateFr + ' | @ ' + eventDate.timeFr + '</a>';
                    event += '    </li>';
                }
                break;
            case 3:
                $('#eventsTitle').html(l.getString('dailySpecials'));

                var operationHours = JSON.parse(events[e].operationHours);
                var openingHour = '';
                var closingHour = '';

                var days = JSON.parse(events[e].days);
                var day = now.getDay();
                //get operation hours for today
                for (i = 0; i < operationHours.length; i++) {
                    if (operationHours[i].day == day) {
                        openingHour = operationHours[i].openingHour;
                        closingHour = operationHours[i].closingHour;
                    }
                }
                var hour = now.getHours();
                var minutes = now.getMinutes();
                //Check if store is open
                var storeHours = '<h1 class="hours-operation-title">Heures d\'ouvertures</h1>';
                //                storeHours += '<h1 class="operation-schedule">' + openHour + ' à ' + closingHour + '<span class="open-icon">OPEN</span></h1>'
                storeHours += '<h1 class="operation-schedule">' + openingHour + ' à ' + closingHour + '</h1>';
                $('#storeHours').html(storeHours);
                if ($.inArray(day, days)) {
                    event += '    <li class = "food-menu-item"> ';
                    if (offline == 1 || events[e].imageFr != "") {
                        event += '    <img style="float: left; margin: 0px 15px 15px 0px;" src="' + events[e].imageFr + '" class="img-responsive" height="42" width="42">';
                    }
                    event += '    <span>' + events[e].price + '$ // ' + events[e].nameFr + '</span><br style="clear:both" />' + events[e].descriptionFr;
                    event += '    </li>';

                }
                break;
            }
        }
        event += '</ul>';
        $('#name').val(details.nameFr);

    }

    $('#eventsList').html(event);

    if (details.instagram != '') {
        $('#instagram').html('<a href="' + details.instagram + '"><i class="fa fa-instagram  contact-info-icon" aria-hidden="true"></i></a>')
    }
    if (details.facebook != '') {
        $('#facebook').html('<a href="' + details.facebook + '"><i class="fa fa-facebook-square  contact-info-icon" aria-hidden="true"></i></a>')
    }
    if (details.twitter != '') {
        $('#twitter').html('<a href="' + details.twitter + '"><i class="fa fa-twitter-square  contact-info-icon" aria-hidden="true"></i></a>')
    }

    //Swipe action
    $('.site-wrap').swipe({
        allowPageScroll: "vertical",
        //Generic swipe handler for all directions
        swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
            if (direction == 'right') {
                window.location = 'pagelist.html?cid=' + cId + '&scid=' + scId;
            }

        }
    });
    $('#return-back-link').attr('href', 'pagelist.html?cid=' + cId + '&scid=' + scId);
    $('#search').hideseek();
}

function eventsPage(offLine) {
    var lang = getLanguage();
    var l = new Language(lang);
    var cId = $('#cId').val();
    var scId = $('#scId').val();
    var listId = $('#listId').val();
    var pId = $('#pId').val();
    var eId = $('#eId').val();
    if (cId == '') {
        cId = getUrlVars()["cid"];
        $('#cId').val(cId);
    }
    if (scId == '') {
        scId = getUrlVars()["scid"];
        $('#scId').val(scId);
    }
    if (listId == '') {
        listId = getUrlVars()["listid"];
        $('#listId').val(listId);
    }
    if (pId == '') {
        pId = getUrlVars()["pid"];
        $('#pId').val(pId);
    }
    if (eId == '') {
        eId = getUrlVars()["eid"];
        $('#eId').val(eId);
    }
    var siteCode = localStorage.getItem('siteCode');
    var json = JSON.parse(siteCode);
    var details = json['categories'][cId]['subcategories'][scId]['listing'][listId]['events'][eId];
    var event = '';

    $('#where').html(l.getString('where'));
    $('#when').html(l.getString('when'));
    $('#description').html(l.getString('description'));

    var eventDate = getDateInfo(details.startTimeEn);
    if (lang == 'en') {
        $('#eventTitle').html(details.nameEn);
        $('.event-description').html(details.descriptionEn);
        if (offline == 1 || details.imageEn == "") {
            $('#location-image').attr('src', 'img/transparent.png');
            $('#location-image').attr('style', 'width: 0px; height:0px;');

        } else {
            $('#location-image').attr('src', details.imageEn);
        }

        $('.location-name').html(details.locationEn);
        $('#location-email').html(details.email);
        $('.event-date-time').html(eventDate.currentDateEn + ' | @ ' + eventDate.timeEn);
        //Add to calendar
        $('.add-to-calendar').click(function () {
            var startDate = new Date(details.startDateTime); // beware: month 0 = january, 11 = december 
            var endDate = new Date(details.endDateTime);
            var title = details.nameEn;
            var eventLocation = details.locationEn;
            var notes = details.descriptionEn;
            var success = function (message) {
                alert("Success: " + JSON.stringify(message));
            };
            var error = function (message) {
                alert("Error: " + message);
            };
            window.plugins.calendar.createEventInteractively(title, eventLocation, notes, startDate, endDate, success, error);
        });
    } else {
        $('#eventTitle').html(details.nameFr);
        $('.event-description').html(details.descriptionFr);
        if (offline == 1 || details.imageFr == "") {
            $('#location-image').attr('src', 'img/transparent.png');
            $('#location-image').attr('style', 'width: 0px; height:0px;');

        } else {
            $('#location-image').attr('src', details.imageFr);
        }
        $('.location-name').html(details.locationFr);
        $('#location-email').html(details.email);
        $('.event-date-time').html(eventDate.currentDateFr + ' | @ ' + eventDate.timeFr);
        //Add to calendar
        $('.add-to-calendar').click(function () {
            var startDate = new Date(details.startDateTime); // beware: month 0 = january, 11 = december 
            var endDate = new Date(details.endDateTime);
            var title = details.nameEn;
            var eventLocation = details.locationEn;
            var notes = details.descriptionEn;
            var success = function (message) {
                alert("Success: " + JSON.stringify(message));
            };
            var error = function (message) {
                alert("Error: " + message);
            };
            window.plugins.calendar.createEventInteractively(title, eventLocation, notes, startDate, endDate, success, error);
        });

    }

    $('#eventsList').html(event);


    if (details.instagram != '') {
        $('#instagram').html('<a href="' + details.instagram + '"><i class="fa fa-instagram  contact-info-icon" aria-hidden="true"></i></a>')
    }
    if (details.facebook != '') {
        $('#facebook').html('<a href="' + details.facebook + '"><i class="fa fa-facebook-square  contact-info-icon" aria-hidden="true"></i></a>')
    }
    if (details.twitter != '') {
        $('#twitter').html('<a href="' + details.twitter + '"><i class="fa fa-twitter-square  contact-info-icon" aria-hidden="true"></i></a>')
    }
    //Swipe action
    $('.site-wrap').swipe({
        allowPageScroll: "vertical",
        //Generic swipe handler for all directions
        swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
            if (direction == 'right') {
                window.location = 'details.html?cid=' + cId + '&scid=' + scId + '&listid=' + listId + '&pid=' + pId;
            }


        }
    });
    var favorites = 'data-cId="' + cId + '" data-scId="' + scId + '" data-listId="' + listId + '" data-pId="' + pId + '"';
    $('#favorites').html('<a href="#" id="addToFavorites" onClick="addToFavorites()" ' + favorites + '><i class="fa fa-heart contact-info-icon" aria-hidden="true"></i></a>')
    $('#return-back-link').attr('href', 'details.html?cid=' + cId + '&scid=' + scId + '&listid=' + listId + '&pid=' + pId);
}
//OTHER----------------------------------------------------------------
//Taken from https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
//This i=function is required to verify if announcments have changed.
function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

//Taken from https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

//Taken from http://papermashup.com/read-url-get-variables-withjavascript/
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

//Return the current page name
function getPageName() {
    var name = document.title;
    return name;
}