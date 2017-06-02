$(document).ready(function () {
    $('#btnSubmit').click(function () {
        searchAtlas();
    });
});

function searchAtlas() {
    var lang = window.localStorage.getItem('lang');
    var ln = $('#ln').val();
    var fn = $('#fn').val();
    var email = $('#email').val();
    var ext = $('#ext').val();
    var title = $('#title').val();
    var dep = $('#dep').val();

    var queryString = '&ln=' + ln + '&fn=' + fn + '&email=' + email + '&ext=' + ext + '&title=' + title + '&dep=' + dep;
    var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_atlas_user' + queryString + '&moodlewsrestformat=json';
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
                var title = '';
                if (typeof items[i].serviceprovided.department !== 'undefined') {
                    title = items[i].serviceprovided.department;
                } else {
                    title = items[i].serviceprovided[0].department + '<br>' + items[i].serviceprovided[1].department;
                }
                html += '   <tr>';
                html += '       <td>';
                html += '           ' + items[i].givenName + ' ' + items[i].sn + '<br>' + title + '<br>' + items[i].mail + '<br>' + items[i].telephoneNumber;
                html += '       </td>';
                html += '   </tr>';
            }
            html += '   </tbody>';
            html += '</table>';

            $('#atlasTable').html(html);
        }
    });
}