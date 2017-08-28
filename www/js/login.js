$(document).ready(function () {
    $('#btnLogin').click(function () {
        login();
    });
});

function login() {
    var lang = window.localStorage.getItem('lang');
    var l = new Language(lang);
    var uid = $('#uid').val();
    var pwd = $('#pwd').val();
    var salt = 'Dowef764874rhkadfb7y';
    pwd = pwd + salt;
    pwd = b64EncodeUnicode(pwd);
    var url = config.webServiceUrl + 'wstoken=' + config.webServiceToken + '&wsfunction=local_webapp_authenticate&uid=' + uid + '&pwd=' + pwd + '&moodlewsrestformat=json';
    $.ajax({
        url: url,
        crossDomain: true,
        dataType: 'json',
        success: function (results) {
            if (results[0]['code'] == 1) {
                window.localStorage.setItem('uid', uid);
                window.location = getLink();
            } else {
                alert(l.getString('noCredentials'));

            }
        }
    });
}

function getLink() {
    var now = new Date();
    console.log(now);
    var link = '';
    switch (now.getMonth()) {
    case 0:
    case 1:
    case 2:
    case 3:
        link = 'winter.html?ignore=1';
        break;
    case 4:
    case 5:
    case 6:
      link  = 'summer.html?ignore=1';
        break;
    case 7:
    case 8: 
    case 9:
    case 10:
    case 11:
        link = 'fall.html?ignore=1';
        break;
    }

    return link;

}