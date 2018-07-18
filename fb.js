
$(document).ready(function () {
    console.log("jQuery loaded");

    $("#login").click(()=>{

        FB.login((response)=>{

            if(response.authResponse){
                //alle Buttons einblenden
                $("button").attr("disabled",false);
                //Login Button wieder ausblenden
                $("#login").attr("disabled",true);
                showMe ();
            }
        },{perms: "email, user_birthday, user_location, user_hometown, user_likes, user_friends, user_link, user_feed"})
    });

    //logout
    $("#logout").click(()=>{

        //von FB ausloggen
        FB.logout(function (response) {
            $("button").attr("disabled",true);
            $("#login").attr("disabled",false);

            //löschen von ev. angezeigten User Infos
            $("#user").empty().hide();
        })
    });

    //friends
    $("#showfriends").click(()=>{
        showFriends();
    });

    //Feed aus Seite auslesen
    $("#feed1").click(()=> {
        showMessage();
    });

    //Analyse der Feeds
    $("#analyse1").click(()=> {
        $("#analyse").show();
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
    $("#analyse").empty().hide();
    $("#analyseSenti").empty().hide();
    $("#analyseKey").empty().hide();

    //von FB Daten holen
    FB.api("/me?fields=feed.limit(3)", (list) => {

        let id = 0;
        for (let message of list.feed.data){
            let ISOn = "";
            let link = "<p>"+ message.message + "</p>";
            let messageToServer = message.message;

            $("#feed").append(link);
            id++;

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
                    
                    let output = "<p> Die Sprache des " + idNumberOutput + ". Feeds ist: "+ languageOutput + "</p>";
                    $("#analyse").append(output);

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

                            let output = "<p> ID: " + idNumberOutput + " Sentiment: "+ sentimentOutput + "</p>";
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

                            let output = "<p> ID: " + idNumberOutput + " Key Phrases: "+ keyOutput + "</p>";
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
            //showLocation(hometown);
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
            showMe ();
        }
    });
}

function showFriends(){
    //Freundeliste leeren
    $("#friends").empty().hide();
    //von FB Freunde holen
    FB.api("me/friends", (list)=>{
        console.log(list);

        for (let friend of list.data){
            let link = '<a id="'+ friend.id + '" href="">'+friend.name + "</a>";
            $("#friends").append(link);
        }

        $("#friends a").click( ()=>{
            let id = $(this).attr("id");
            console.log(id);
            FB.api("/"+id, (friends)=>{
                console.log(friends);
            });
        });

    });

    $("#friends").show();
}