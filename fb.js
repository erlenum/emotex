
$(document).ready(function () {
    console.log("jQuery loaded");

    $("#login").click(()=>{
        console.log("Login geklickt");
        FB.login((response)=>{
            console.log(response);
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

    //.data["0"].message

    });

//function um message anzuzeigen
function showMessage() {
    //Feed leeren
    $("#feed").empty().hide();
    //von FB Freunde Daten holen
    FB.api("/me?fields=feed.limit(3)", (list) => {
        console.log(list);

        for (let message of list.feed.data){
            let link = "<p>"+ message.message + "</p>";
            let messageToServer = message.message;
            console.log(messageToServer);
            $("#feed").append(link);

            //$.get("http://localhost:8081",function(result){
            //    console.log(result);
            //})
            let obj= {
                text: messageToServer //seine Version war mit "Hier steht ein Text"
            }

            $.ajax({
                type:'POST',
                url: "http://localhost:8081",
                dataType: 'json',
                contentType: "application/json",
                data: JSON.stringify(obj),
                success: function(answer){
                    console.log("Feed wurde erfolgreich uebertragen!");
                    console.log(answer);
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