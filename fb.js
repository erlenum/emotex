// Javascript Datei, welche es ermöglicht, FB Feeds aus dem eigenen Account auszulesen und über
// Microsoft Azure (Cognitive Services) werden die Sprache, Stimmung und Schlüsswörter ermittelt!


$(document).ready(function () {
    console.log("jQuery loaded"); // Sicherstellung das alles geladen wird

    // Clickhandler für den Facebook LogIn
    $("#login").click(()=>{

        // in FB einloggen
        FB.login((response)=>{

            if(response.authResponse){

                // alle Buttons werden eingeblendet
                $("button").attr("disabled",false);
                $("button").attr("style","background-color: #3dbb95; border-color: #3dbb95; color: white;");

                // Nach Login wir der Login Button wieder ausgeblendet
                $("#login").attr("disabled",true);
                $("#login").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");

                showMe(); // Funktion zur User Anzeige
            }
        },{scope: "email, user_birthday, user_location, user_hometown, user_likes, user_friends, user_link, user_posts"})
    });

    // Clickhandler für den Facebook LogOut
    $("#logout").click(()=>{

        // von FB ausloggen
        FB.logout(function (response) {

            // alle Buttons werden ausgeblendet
            $("button").attr("disabled",true);
            $("button").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");

            // nur Login Button wird eingeblendet
            $("#login").attr("disabled",false);
            $("#login").attr("style","background-color: #3dbb95; border-color: #3dbb95; color: white;");

            // löschen von ev. angezeigten User, Feed und Analyse Infos
            $("#user").empty().hide();
            $("#feed").empty().hide();
            $("#analyseLang").empty().hide();
            $("#analyseSenti").empty().hide();
            $("#analyseKey").empty().hide();

        })
    });

    // Clickhandler zum Feed auslesen
    $("#feed1").click(()=> {

        showMessage(); // Funktion für die Feed Auslesung wird aufgerufen

        // Wenn der Feed geklickt wurde, werden die Analyse Button sichtbar/klickbar
        $("#analyse1").attr("disabled",false);
        $("#analyse1").attr("style", "background-color: #3dbb95; border-color: #3dbb95; color: white;");
        $("#analyse2").attr("disabled",false);
        $("#analyse2").attr("style", "background-color: #3dbb95; border-color: #3dbb95; color: white;");
        $("#analyse3").attr("disabled",false);
        $("#analyse3").attr("style", "background-color: #3dbb95; border-color: #3dbb95; color: white;");
    });

    // Clickhandler zur Sprach-Analyse der Feeds
    $("#analyse1").click(()=> {
        $("#analyseLang").show(); // Sprach Ergebnisse werden angezeigt
    });

    // Clickhandler zur Stimmungs-Analyse der Feeds
    $("#analyse2").click(()=> {
        $("#analyseSenti").show(); // Stimmungs Ergebnisse werden angezeigt
    });

    // Clickhandler zur Schlüsselwort-Analyse der Feeds
    $("#analyse3").click(()=> {
        $("#analyseKey").show(); // Schlüsselwörter Ergebnisse werden angezeigt
    });

});

// Funktion für die Feed Auslesung
function showMessage() {

    // Feed u. Analysen werden zuerst geleert (falls schon Daten vorhanden sind)
    $("#feed").empty().hide();
    $("#analyseLang").empty().hide();
    $("#analyseSenti").empty().hide();
    $("#analyseKey").empty().hide();

    // von FB Daten holen, auf die letzten 3 Feeds des Accounts beschränkt
    FB.api("/me?fields=feed.limit(3)", (list) => {

        let id = 0; // Initialisierung eines id Schlüssels, damit die Feeds richtig initialisiert werden können
        for (let message of list.feed.data){ // durchläuft die Feed Liste
            id++;
            let ISOn = ""; // Variable für den ISO Code der Spracherkennung
            let link = "<p style='font-weight: bold;'><span style='color: #3dbb95;'>"+ id + ". Feed: </span>" + message.message + "</p>"; // Feed Anzeige
            let messageToServer = message.message; // Feed für den Server

            $("#feed").append(link); // Feeds werden an das feed div der index Datei angehängt

            let objL= { // Erstellung eines JSON Objekts, welches an den localen Server gesendet wird
                analyse: "language", // Analyseform Sprache
                language: ISOn, // Sprachcode
                id: id, // Initialisierung
                text: messageToServer // Feed Text
            }

            // Daten werden an den Server gesendet
            $.ajax({
                type:'POST',
                url: "http://localhost:8081", // lokaler Server
                dataType: 'json',
                contentType: "application/json",
                data: JSON.stringify(objL),
                success: function(answer){ // Antwort des Servers kommt zurück

                    // Die Sprache wird in eine Variable gespeichert, um diese ausgeben zu können
                    let language = JSON.stringify(answer.documents[0].detectedLanguages[0].name);
                    let languageOutput = JSON.parse(language);

                    // Die ID bzw. Initialisierung wird ebenso gespeichert
                    let idNumber = JSON.stringify(answer.documents[0].id);
                    let idNumberOutput = JSON.parse(idNumber);

                    // Ausgabe der Analyse-Ergebnisse
                    let output = "<p>Die Sprache des <span style='color: #3dbb95; font-weight: bold;'>" + idNumberOutput + ". Feeds</span> ist: <span style='font-weight: bold;'>"+ languageOutput + "</span></p>";
                    $("#analyseLang").append(output);

                    // der ermittelte ISO Code wird gespeichert und beim nächsten Post an den Server ebenfalls gesendet; so ist eine Stimmungsanalyse möglich
                    let ISO = JSON.stringify(answer.documents[0].detectedLanguages[0].iso6391Name);
                    let ISOOutput = JSON.parse(ISO);
                    ISOn = ISOOutput;

                    let objS= { // Erstellung eines JSON Objekts mit den neuen Sprachwerten
                        analyse: "sentiment", // Analyseform Stimmung
                        language: ISOn, // ermittelter Sprachcode
                        id: idNumberOutput,
                        text: messageToServer //Feed Text der an den Server geschickt wird
                    }

                    // neue Daten werden an den Server gesendet
                    $.ajax({
                        type:'POST',
                        url: "http://localhost:8081", // lokaler Server
                        dataType: 'json',
                        contentType: "application/json",
                        data: JSON.stringify(objS),
                        success: function(answer){ // Antwort des Servers kommt zurück

                            // Der Wert der Stimmung (zw. 0 - 1) wird in eine Variable gespeichert, um diese ausgeben zu können
                            let sentiment = JSON.stringify(answer.documents[0].score);
                            let sentimentOutput = JSON.parse(sentiment);

                            // Die ID bzw. Initialisierung wird ebenso gespeichert
                            let idNumber = JSON.stringify(answer.documents[0].id);
                            let idNumberOutput = JSON.parse(idNumber);

                            // Der Wert wird in Prozent mit 2 Nachkommastellen umgewandelt
                            let num = sentimentOutput * 100;
                            let percent = num.toFixed(2);

                            // Drei verschiedene Emoticons zeigen die Stimmugswerte an
                            let emoji = "";
                            if (percent > 65) {
                                emoji = "&#128516;"; // gut
                            } else if(percent < 45) {
                                emoji = "&#128546;"; // nicht gut
                            } else {
                                emoji = "&#128524;"; // okay
                            }

                            // Ausgabe der Analyse-Ergebnisse
                            let output = "<span>Die Stimmung des <span style='color: #3dbb95; font-weight: bold;'>" + idNumberOutput + ". Feeds</span> ist: <span style='font-size: 14px;'>" + emoji + "</span><span style='font-weight: bold;'>(" + percent + " %)</span>" + "</p>";
                            $("#analyseSenti").append(output);

                        }
                    })

                    let objK= { // Erstellung eines JSON Objekts für die Schlüsselwortanalyse
                        analyse: "keyPhase", // Analyseform Schlüsselwort
                        language: ISOn,
                        id: idNumberOutput,
                        text: messageToServer //Feed Text der an den Server geschickt wird
                    }

                    // neue Daten werden an den Server gesendet
                    $.ajax({
                        type:'POST',
                        url: "http://localhost:8081", // lokaler Server
                        dataType: 'json',
                        contentType: "application/json",
                        data: JSON.stringify(objK),
                        success: function(answer){ //Antwort des Servers kommt zurück

                            // Die ermittelten Schlüsselwörter werden in eine Variable gespeichert, um diese ausgeben zu können
                            let key = JSON.stringify(answer.documents[0].keyPhrases);
                            let keyOutput = JSON.parse(key);

                            // Die ID bzw. Initialisierung wird ebenso gespeichert
                            let idNumber = JSON.stringify(answer.documents[0].id);
                            let idNumberOutput = JSON.parse(idNumber);

                            // Ausgabe der Analyse-Ergebnisse
                            let output = "<p> Die Schlüsselwörter des <span style='color: #3dbb95; font-weight: bold;'>" + idNumberOutput + ". Feeds</span> sind: <span style='font-weight: bold;'>"+ keyOutput + "</span></p>";
                            $("#analyseKey").append(output);
                        }
                    })
                }
            })
        }
    });
    $("#feed").show(); // Feed wird angezeigt
}

// Funktion wird nach dem erfolgreichen Login aufgerufen und Zeit den User (Bild, Mail und Geburtstag
function showMe(){
    FB.api("/me?fields=id,name,birthday,link,email,hometown,feed",function(user){

        if(user!=null){
            currentUser = user;

            // User daten werden ausgegeben
            var html ="<div id='pic'><img src='https://graph.facebook.com/" + user.id + "/picture/'></div>";
            html += "<div id='info'>"+user.name + "<br/>";
            html += "email: "  + user.email + " | birthday: " + user.birthday + "</div>";

            // leeren der Daten und Anzeige
            $("#user").empty();
            $("#user").html(html);
            $("#user").show();

            // Analyse Button sind ausgraut und werden erst sichtbar, nachdem der Feed ausgelesen wurde (Klick auf Feed Button)
            $("#analyse1").attr("disabled",true);
            $("#analyse1").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");
            $("#analyse2").attr("disabled",true);
            $("#analyse2").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");
            $("#analyse3").attr("disabled",true);
            $("#analyse3").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");
        }
    });
}

// Funktion welchen den Login Status vergleicht
function checkLoginStatus() {
    FB.getLoginStatus((response)=>{
        if(response.authResponse){

            // alle Buttons werden angezeigt
            $("button").attr("disabled",false);

            // Login Button wird ausgeblendet/ausgegraut
            $("#login").attr("disabled",true);
            $("#login").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");
            showMe();
        }
    });
}
