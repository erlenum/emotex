
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
        },{perms: "email, user_birthday, user_location, user_hometown, user_likes, user_friends, user_link"})
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

    /* make the API call */
    $("#feed").click(()=>{
        /* make the API call */
        FB.api(
            '/me/feed',
            'GET',
            function (response) {
                //in Console werden meine Posts ausgegeben
                console.log(response);
                });
            }
        );
    });


function showMe(){
    FB.api("/me?fields=id,name,birthday,link,email,hometown",function(user){
        if(user!=null){
            currentUser = user
            var html ="<div id='pic'><img src='https://graph.facebook.com/" + user.id + "/picture/'></div>";
            html += "<div id='info'>"+user.name + "<br/>";
            html += "<a href='"+user.link+"'>"+user.link+"</a><br/>";
            html += "email: "  + user.email + " | birthday: " + user.birthday + "</div>";
            let hometown = user.hometown;
            if (hometown != null && hometown.name != null){
                html += "Hometown: " + hometown.name + "</div>";
            } else {
                html += "</div>";
            }

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