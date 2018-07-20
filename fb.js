
$(document).ready(function () {
    console.log("jQuery loaded");

    //login
    $("#login").click(()=>{

        FB.login((response)=>{

            if(response.authResponse){
                //alle Buttons einblenden
                $("button").attr("disabled",false);
                $("button").attr("style","background-color: #3dbb95; border-color: #3dbb95; color: white;");

                //Login Button wieder ausblenden
                $("#login").attr("disabled",true);
                $("#login").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");

                showMe();
            }
        },{scope: "email, user_birthday, user_location, user_hometown, user_likes, user_friends, user_link, user_posts"})
    });

    //logout
    $("#logout").click(()=>{

        //von FB ausloggen
        FB.logout(function (response) {
            $("button").attr("disabled",true);
            $("button").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");

            $("#login").attr("disabled",false);
            $("#login").attr("style","background-color: #3dbb95; border-color: #3dbb95; color: white;");

            //löschen von ev. angezeigten User Infos
            $("#user").empty().hide();
            $("#feed").empty().hide();
            $("#analyseLang").empty().hide();
            $("#analyseSenti").empty().hide();
            $("#analyseKey").empty().hide();

        })
    });

    //Feed aus Seite auslesen
    $("#feed1").click(()=> {
        showMessage();

        $("#analyse1").attr("disabled",false);
        $("#analyse1").attr("style", "background-color: #3dbb95; border-color: #3dbb95; color: white;");
        $("#analyse2").attr("disabled",false);
        $("#analyse2").attr("style", "background-color: #3dbb95; border-color: #3dbb95; color: white;");
        $("#analyse3").attr("disabled",false);
        $("#analyse3").attr("style", "background-color: #3dbb95; border-color: #3dbb95; color: white;");
    });

    //Analyse der Feeds
    $("#analyse1").click(()=> {
        $("#analyseLang").show();
    });

    //Analyse der Feeds
    $("#analyse2").click(()=> {
        $("#analyseSenti").show();
    });

    //Analyse der Feeds
    $("#analyse3").click(()=> {
        $("#analyseKey").show();
    });

});

//function um message anzuzeigen
function showMessage() {

    //Feed u. Analysen leeren
    $("#feed").empty().hide();
    $("#analyseLang").empty().hide();
    $("#analyseSenti").empty().hide();
    $("#analyseKey").empty().hide();

    //von FB Daten holen
    FB.api("/me?fields=feed.limit(3)", (list) => {

        let id = 0;
        for (let message of list.feed.data){
            id++;
            let ISOn = "";
            let link = "<p style='font-weight: bold;'><span style='color: #3dbb95;'>"+ id + ". Feed: </span>" + message.message + "</p>";
            let messageToServer = message.message;

            $("#feed").append(link);

            let objL= {
                analyse: "language",
                language: ISOn,
                id: id,
                text: messageToServer //Feed Text der an den Server geschickt wird
            }

            $.ajax({
                type:'POST',
                url: "http://localhost:8081",
                dataType: 'json',
                contentType: "application/json",
                data: JSON.stringify(objL),
                success: function(answer){


                    let language = JSON.stringify(answer.documents[0].detectedLanguages[0].name);
                    let languageOutput = JSON.parse(language);
                    let idNumber = JSON.stringify(answer.documents[0].id);
                    let idNumberOutput = JSON.parse(idNumber);

                    let output = "<p>Die Sprache des <span style='color: #3dbb95; font-weight: bold;'>" + idNumberOutput + ". Feeds</span> ist: <span style='font-weight: bold;'>"+ languageOutput + "</span></p>";
                    $("#analyseLang").append(output);

                    let ISO = JSON.stringify(answer.documents[0].detectedLanguages[0].iso6391Name);
                    let ISOOutput = JSON.parse(ISO);
                    ISOn = ISOOutput;

                    let objS= {
                        analyse: "sentiment",
                        language: ISOn,
                        id: idNumberOutput,
                        text: messageToServer //Feed Text der an den Server geschickt wird
                    }

                    $.ajax({
                        type:'POST',
                        url: "http://localhost:8081",
                        dataType: 'json',
                        contentType: "application/json",
                        data: JSON.stringify(objS),
                        success: function(answer){

                            let sentiment = JSON.stringify(answer.documents[0].score);
                            let sentimentOutput = JSON.parse(sentiment);
                            let idNumber = JSON.stringify(answer.documents[0].id);
                            let idNumberOutput = JSON.parse(idNumber);

                            let num = sentimentOutput * 100;
                            let percent = num.toFixed(2);

                            let emoji = "";
                            if (percent > 65) {
                                emoji = "&#128516;";
                            } else if(percent < 45) {
                                emoji = "&#128546;";
                            } else {
                                emoji = "&#128524;";
                            }

                            let output = "<span>Die Stimmung des <span style='color: #3dbb95; font-weight: bold;'>" + idNumberOutput + ". Feeds</span> ist: <span style='font-size: 14px;'>" + emoji + "</span><span style='font-weight: bold;'>(" + percent + " %)</span>" + "</p>";
                            $("#analyseSenti").append(output);

                        }
                    })

                    let objK= {
                        analyse: "keyPhase",
                        language: ISOn,
                        id: idNumberOutput,
                        text: messageToServer //Feed Text der an den Server geschickt wird
                    }

                    $.ajax({
                        type:'POST',
                        url: "http://localhost:8081",
                        dataType: 'json',
                        contentType: "application/json",
                        data: JSON.stringify(objK),
                        success: function(answer){

                            let key = JSON.stringify(answer.documents[0].keyPhrases);
                            let keyOutput = JSON.parse(key);
                            let idNumber = JSON.stringify(answer.documents[0].id);
                            let idNumberOutput = JSON.parse(idNumber);

                            let output = "<p> Die Schlüsselwörter des <span style='color: #3dbb95; font-weight: bold;'>" + idNumberOutput + ". Feeds</span> sind: <span style='font-weight: bold;'>"+ keyOutput + "</span></p>";
                            $("#analyseKey").append(output);

                        }
                    })
                }
            })
        }
    });
    $("#feed").show();
}

function showMe(){
    FB.api("/me?fields=id,name,birthday,link,email,hometown,feed",function(user){
        if(user!=null){
            currentUser = user;
            var html ="<div id='pic'><img src='https://graph.facebook.com/" + user.id + "/picture/'></div>";
            html += "<div id='info'>"+user.name + "<br/>";
            html += "email: "  + user.email + " | birthday: " + user.birthday + "</div>";

            $("#user").empty();
            $("#user").html(html);
            $("#user").show();

            $("#analyse1").attr("disabled",true);
            $("#analyse1").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");
            $("#analyse2").attr("disabled",true);
            $("#analyse2").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");
            $("#analyse3").attr("disabled",true);
            $("#analyse3").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");
        }
    });
}

function checkLoginStatus() {
    FB.getLoginStatus((response)=>{
        if(response.authResponse){
            //alle Buttons einblenden
            $("button").attr("disabled",false);
            //Login Button wieder ausblenden
            $("#login").attr("disabled",true);
            $("#login").attr("style", "background-color: #eeeeee; border-color: #eeeeee; color: grey;");
            showMe();
        }
    });
}
