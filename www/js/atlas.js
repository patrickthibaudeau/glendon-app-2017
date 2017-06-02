$(document).ready(function () {
    $('#btnSubmit').click(function () {
        searchAtlas();
    });
    atlasCheckOnlineStatus();
});

function atlasCheckOnlineStatus() {
    var offLine = window.localStorage.getItem('offLine');
    var lang = window.localStorage.getItem('lang');

    if (offLine == 1) {
        $('#atlasForm').hide();
        $('#atlasOffline').addClass('alert');
        $('#atlasOffline').addClass('alert-danger');
        if (lang == 'en') {
            $('#atlasOffline').html('Currently offline');
        } else {
            $('#atlasOffline').html('Hors ligne');
        }
    } else {
        $('#atlasForm').show();
        $('#atlasOffline').removeClass('alert');
        $('#atlasOffline').removeClass('alert-danger');
        $('#atlasOffline').html('');
    }
}

function searchAtlas() {
    $('#btnSubmit').append('&nbsp;<i id="searchSpinner" class="fa fa-spinner fa-spin"></i>');
    var lang = window.localStorage.getItem('lang');
    var ln = $('#ln').val();
    var fn = $('#fn').val();
    var email = $('#email').val();
    var ext = $('#ext').val();
    var title = $('#title').val();
    var dep = $('#dep').val();

    var queryString = '&ln=' + ln + '&fn=' + fn + '&email=' + email + '&ext=' + ext + '&title=' + title + '&dep=' + dep;
    var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_atlas_search' + queryString + '&moodlewsrestformat=json';
    $.ajax({
        url: url,
        crossDomain: true,
        dataType: 'json',
        success: function (results) {
            var atlasResults = JSON.parse(b64DecodeUnicode(results[0]['atlas']));

            var items = atlasResults['results'];
            var html = '';
            console.log(items);
            if (lang == 'en') {
                html = '<h2>Results</h2>';
            } else {
                html = '<h2>Résultats</h2>';
            }
            html += '<table class="table table-striped">';
            html += '<thead>';
            html += '   <tr>';
            html += '       <th>';
            html += '           ';
            html += '       </th>';
            html += '   </tr>';
            html += '</thead>';
            html += '   <tbody>';
            for (i = 0; i < items.length; i++) {
                var department = '';
                var title = '';
                //Sometimes serviceprovided is not available
                if (typeof items[i].serviceprovided !== 'undefined') {
                    if (typeof items[i].serviceprovided.department !== 'undefined') {
                        department = items[i].serviceprovided.department;
                    } else {
                        department = items[i].serviceprovided[0].department + '<br>' + items[i].serviceprovided[1].department;
                    }
                    if (typeof items[i].serviceprovided.service !== 'undefined') {
                        if (typeof items[i].serviceprovided.service.description !== 'undefined') {
                            title = items[i].serviceprovided.service.description + '<br>';
                        }
                    }
                }
                if (typeof items[i].preferredemailaddress !== 'undefined') {
                    var email = items[i].preferredemailaddress;
                } else {
                    var email = items[i].mail;
                }



                html += '   <tr>';
                html += '       <td>';
                html += '           <a href="javascript:void(0);" onclick="getPerson(' + items[i].seqpersonid + ')" >' + items[i].givenName + ' ' + items[i].sn + '</a><br>' + title + department + '<br>' + email + '<br>' + items[i].telephoneNumber;
                html += '       </td>';
                html += '   </tr>';
            }
            html += '   </tbody>';
            html += '</table>';

            $('#atlasData').html(html);
            $('#searchSpinner').remove();
        }
    });
}

function getPerson(seqPersonId) {
    console.log(seqPersonId);
    var lang = window.localStorage.getItem('lang');
    var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_atlas_user&seqpersonid=' + seqPersonId + '&moodlewsrestformat=json';
    $.ajax({
        url: url,
        crossDomain: true,
        dataType: 'json',
        success: function (results) {
            var atlasResults = JSON.parse(b64DecodeUnicode(results[0]['atlas']));

            var items = atlasResults['results'];
            var html = '';
            console.log(items);
            if (lang == 'en') {
                html = '<h2>Person view</h2>';
            } else {
                html = '<h2>Personne</h2>';
            }
            html += '<table class="table table-striped">';
            html += '<thead>';
            html += '   <tr>';
            html += '       <th>';
            html += '           ';
            html += '       </th>';
            html += '   </tr>';
            html += '</thead>';
            html += '   <tbody>';
            for (i = 0; i < items.length; i++) {
                var title = '';
                //Sometimes serviceprovided is not available
                if (typeof items[i].serviceprovided !== 'undefined') {
                    if (typeof items[i].serviceprovided.department !== 'undefined') {
                        department = items[i].serviceprovided.department;
                    } else {
                        department = items[i].serviceprovided[0].department + '<br>' + items[i].serviceprovided[1].department;
                    }
                    if (typeof items[i].serviceprovided.service !== 'undefined') {
                        if (typeof items[i].serviceprovided.service.description !== 'undefined') {
                            title = items[i].serviceprovided.service.description + '<br>';
                        }
                    }
                }
                if (typeof items[i].preferredemailaddress !== 'undefined') {
                    var email = '<a href="mail:' + items[i].preferredemailaddress + '">' + items[i].preferredemailaddress + '</a>';
                } else {
                    var email = '<a href="mail:' + items[i].mail + '">' + items[i].mail + '</a>';
                }
                html += '   <tr>';
                html += '       <td>';
                html += '           <h4>' + items[i].givenName + ' ' + items[i].sn + '</h4>' + title + department + '<br>' + email + '<br>' + items[i].telephoneNumber;
                html += '       </td>';
                html += '   </tr>';
            }
            html += '   </tbody>';
            html += '</table>';

            $('#atlasData').html(html);
            $('#searchSpinner').remove();
        }
    });
}