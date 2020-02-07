"use strict";

function Constructor() {

    this.type = (localStorage.getItem("elements_type")) ? (localStorage.getItem("elements_type")) : "top";
    this.position = (localStorage.getItem("position")) ? localStorage.getItem("position") : "front";
    this.count = 0;
    this.svg = (localStorage.getItem("svgObj")) ? JSON.parse(localStorage.getItem("svgObj")) : {};
    this.currency = "azn"
    this.total_price = (localStorage.getItem("total_price")) ? JSON.parse(localStorage.getItem("total_price")) : {};
    this.default_cloth_price = 900;

    this.landing = (localStorage.hasOwnProperty("landing")) ? localStorage.getItem("landing") : 1;      // Hundurluk
    this.lightning = (localStorage.hasOwnProperty("lightning")) ? localStorage.getItem("lightning") : 1;        // Zamok
    this.pockets = (localStorage.hasOwnProperty("pockets")) ? localStorage.getItem("pockets") : 1;      // Cib

    this.lining = (localStorage.hasOwnProperty("lining")) ? JSON.parse(localStorage.getItem("lining")) : false;     //Astar
    this.loops = (localStorage.hasOwnProperty("loops")) ? JSON.parse(localStorage.getItem("loops")) : false;        //Kemer ucun halqa

    this.childElems = ["back", "sleeve", "collar"];     // Top-dan asili olan modeller

    this.deg = 0;

    this.page_type = $("#page_type").val();
}

//Remove multiple items from LocalStorage
Constructor.prototype.rmLs = function () {
    for (var i = 0; i < arguments.length; i++) {
        localStorage.removeItem(arguments[i]);
    }
}

//Set multiple items to LocalStorage
Constructor.prototype.setLs = function () {
    for(var i = 0; i < arguments.length; i++) {
        localStorage.setItem(arguments[i][0], arguments[i][1]);
    }
}

//Data without escaping (double quotes)
Constructor.prototype.renderSvg = function (svg) {
    return svg.replace(/"/g, "'");
}

//update position (in storage & object)
Constructor.prototype.updatePosition = function (position) {
    this.position = position;
    localStorage.setItem("position", position);
}

//Create clothe items list & append to dom
Constructor.prototype.createProductList = function () {

console.log("create items");
    var active, price;

    $.getJSON("/template/js/constructor.json", function (data) {

        var items = [];

        $.each( data[""+constructor.type+""], function( key, val ) {

            var data_interface;

            if(constructor.type == "top")
                data_interface = "data-has_back='"+val.has_back+"' data-has_sleeve='"+val.has_sleeve+"' data-has_collar='"+val.has_collar+"' data-price='"+val.price+"'";
            else
                data_interface = "data-price='"+val.price+"'";

            active = (localStorage.getItem(constructor.type+".id") == key) ? "class='active'" : "";

            items.push( "<li id="+key+" "+active+">" +
                            "<img "+data_interface+"  data-id='" + key + "' data-size='"+val.size+"'" +
                                "src='/template/images/"+constructor.type+"/"+val[""+constructor.position+""]+"'>" +
                            "<div class='items-price'>" +
                                "<span class='price-block'>" +
                                    "<span class='item-price'> "+ (parseInt(val["price"]) + parseInt(constructor.default_cloth_price) * val.size) +" </span> "+constructor.currency+"" +
                                "</span>" +
                            "</div>"+
                        "</li>" );
        });

        $("#products").empty();

        $( "<ul/>", {
            "class": "products",
            "data-type": constructor.type,
            html: items.join( "" )
        })
        .appendTo( "#products").ready(function () {

            $(".products li img").click(function (elem) {

                $(".products li").not($(this.parentElement)).removeClass("active");

                $(this.parentElement).toggleClass("active");

                if(constructor.createModel(elem))
                    constructor.generateSvg();
            });

            //Scroll to current active item
            if(localStorage.hasOwnProperty(constructor.type + ".id")) {

                document.getElementById(localStorage.getItem(constructor.type + ".id")).scrollIntoView(false);
            }

        });
    });

}

//Add or remove new model, create svg object and set it to local storage
Constructor.prototype.createModel = function (elem) {
console.log("create model");
    if(this.type != "top" && this.type != "skirt") {
        if(!localStorage.hasOwnProperty("top.id") ||(localStorage.getItem("top.has_"+this.type) != true)) {

            alert(this.type + " modelini seçmək üçün yuxarı geyimlərdən " + this.type + " geyimini dəstəkləyən modeli seçin");

            return true;
        }
    }

    var data_id = elem.target.dataset.id,
        data_has_back = elem.target.dataset.has_back,
        data_has_sleeve = elem.target.dataset.has_sleeve,
        data_has_collar = elem.target.dataset.has_collar,
        price = elem.target.dataset.price,
        size = elem.target.dataset.size,
        type = this.type;

    $.ajax({
        url : "/template/images/"+type+"/svg/"+data_id+"_"+constructor.position+".svg",
        type : "get",
        async : false,
        success : function(data) {

            var svg = data.documentElement.outerHTML;

            if(localStorage.getItem(type) == svg) {
                constructor.rmLs(type, type+".id", type+".price", type+".size");

                delete constructor.svg[type];
                delete constructor.total_price[type];

                if(type == "top") {
                    constructor.rmLs(type+".has_back", type+".has_sleeve", type+".has_collar");
                }
            }
            else {
                if(type == "top") {
                    constructor.setLs(
                        [type+".has_back", data_has_back],
                        [type+".has_sleeve", data_has_sleeve],
                        [type+".has_collar", data_has_collar]
                    );
                }

                console.log(price+" - "+constructor.default_cloth_price+" - "+size);
                constructor.total_price[type] = parseInt(price) + parseInt(constructor.default_cloth_price) * size ;
                constructor.svg[type] = constructor.renderSvg(svg);

                constructor.setLs(
                    [type, svg],
                    [type+".id", data_id],
                    [type+".price", price],
                    [type+".size", size]
                );
            }

        }
    });


    if(this.type == "top") {
        this.updateRelations();
        this.updateNavigation();
    }

    this.setTotalPrice();

    localStorage.setItem("total_price", JSON.stringify(constructor.total_price));

    if((type == "back" || type == "top") && localStorage.hasOwnProperty("top.id") && (constructor.position == "back")) {
        if(localStorage.hasOwnProperty("back.id"))
            constructor.svg["top"] = "";
        else
            constructor.svg["top"] = constructor.renderSvg(localStorage.getItem("top"));
    }
    else if((type == "back") && localStorage.hasOwnProperty("top.id") && (constructor.position == "front")) {
        constructor.svg["top"] = "";
        localStorage.setItem("svgObj", JSON.stringify(constructor.svg));

        this.updatePosition("back");
        this.rotateModel();

        return false;
    }

    localStorage.setItem("svgObj", JSON.stringify(constructor.svg));

    return true;
}

//Remove child constructs if it parent doesnt support
Constructor.prototype.updateRelations = function () {

    for (var i in this.childElems) {
        if(!localStorage.hasOwnProperty("top.id") || (localStorage.getItem("top.has_"+this.childElems[i]) != true && localStorage.hasOwnProperty(this.childElems[i]))) {
            constructor.rmLs(this.childElems[i], this.childElems[i]+".id", this.childElems[i]+".price");

            delete constructor.svg[this.childElems[i]];
            delete constructor.total_price[this.childElems[i]];
        }
    }
}

//Toogle navigation for relations
Constructor.prototype.updateNavigation = function () {

    var elem = document.getElementById("navigation");

    for(var i = 0; i < elem.childElementCount; i++) {

        if(localStorage.hasOwnProperty("top.has_"+elem.children[i].id)) {

            (localStorage.getItem("top.has_"+elem.children[i].id) != true) ? $(elem.children[i]).fadeOut() : $(elem.children[i]).fadeIn();
        }
    }
}

//Update model preview image and items list for position(front, back)
Constructor.prototype.fixTemplate = function () {
console.log("fix template");
    $("#template_img")[0].attributes[1].value = "/template/images/tpl_"+constructor.position+".jpg";

    if(constructor.type != "back") {
        $(".products li").each(function () {
            $(this).find("img").attr("src", "/template/images/" + constructor.type + "/" + this.id + "_" + constructor.position + ".jpg");
        });
    }
}

//Parse svg Object & append to html
Constructor.prototype.generateSvg = function() {
console.log("generate");
    var items = []

    items.push('<svg x="0px" y="0px" width="242px" height="541px" viewBox="0 0 242 541" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events">');

    items.push('<image id="template_img" xlink:href="/template/images/tpl_'+constructor.position+'.jpg" x="0" y="0" height="541px" width="242px"></image>');

    //var obj = JSON.parse(localStorage.getItem("svgObj"));

    for(var i in this.svg) {
        items.push(this.svg[i]);
    }

    return $("#preview").html(items.join(""));
}

//Check if model has top and back at the same time
Constructor.prototype.fixBackTop = function (type) {
    if((type == "back") && localStorage.hasOwnProperty("top.id") && (constructor.position == "front")) {
        constructor.svg[type] = "";
        return true;
    }
    else if((type == "top") && localStorage.hasOwnProperty("back.id") && (constructor.position == "back")) {
        constructor.svg[type] = "";
        return true;
    }

    return false;
}

//Create new svg Object for position (front, back)
Constructor.prototype.rotateModel = function () {
console.log("rotate");
        $.each(localStorage, function (i, val) {

            //regexp for search model.id
            var re = /\w.id/;

            //check if 
            if(re.test(i)) {

                //get model name
                var type = i.match(/[a-z]*/i)[0];

                $.ajax({
                    url : "/template/images/" + type + "/svg/" + localStorage[i] + "_" + constructor.position + ".svg",
                    type : "get",
                    async : false,
                    success : function(data) {

                        var svg = data.documentElement.outerHTML;

                        constructor.setLs(["" + type + "", svg], [i, localStorage[i]]);

                        constructor.svg[type] = constructor.renderSvg(svg);
                    }
                });

                if(constructor.fixBackTop(type))
                    return true;
            }
        });

    localStorage.setItem("svgObj", JSON.stringify(this.svg));

    constructor.generateSvg();
    constructor.fixTemplate();

}

Constructor.prototype.setTotalPrice = function () {
    var total = 0;

    for (var i in this.total_price) {

        total += parseInt(this.total_price[i]) || 0;
    }

    total += (this.lining) ? 1000 : 0;

    document.body.querySelector('.current-price .price').innerHTML = total;
}

Constructor.prototype.setOtherElements = function (elem) {
    document.getElementById("landing_"+this.landing).checked = true;
    document.getElementById("lightning_"+this.lightning).checked = true;
    document.getElementById("pockets_"+this.pockets).checked = true;

    document.getElementById("lining").checked = this.lining;
    document.getElementById("loops").checked = this.loops;
}

Constructor.prototype.init = function () {
    this.createProductList();

    this.setTotalPrice();

    document.getElementById(constructor.type).className += "active";

    if(localStorage.length > 2)
        this.generateSvg();

    this.setOtherElements();

    this.updateNavigation();
}

Constructor.prototype.reloadConstructor = function () {
    localStorage.clear();

    this.svg = {};
    this.type = "top";
    this.position = "front";
    this.total_price = {};
    this.landing = 1;
    this.lightning = 1;
    this.pockets = 1;

    this.lining = 0;
    this.loops = 0;

    this.deg = 0;

    $("#navigation button").removeClass("active");

    this.init();

    this.generateSvg();
}

Constructor.prototype.createLinks = function () {}

// Create constructor object
var constructor = new Constructor();

/* Events & Events handlers */

$(document).ready(function () {

    if(constructor.page_type == "constructor")
        constructor.init();
});

$("#delete").click(function () {

    constructor.reloadConstructor();
});

$("#other_elements input[type='radio']").change(function (elem) {
    localStorage.setItem(elem.target.name, elem.target.value);
});

$("#other_elements input[type='checkbox']").change(function (elem) {
    console.dir(elem);
    localStorage.setItem(elem.target.name, elem.target.checked);

    constructor.lining = JSON.parse(localStorage.getItem("lining"));

    constructor.setTotalPrice();
});

$("#rotate").click(function (elem) {

    constructor.deg -= 180;

    this.style.transform = "rotate("+constructor.deg+"deg)";

    if(constructor.position == "front") {
        constructor.updatePosition("back");
    }
    else {
        constructor.updatePosition("front");
    }

    if(localStorage.length <= 2)
        constructor.fixTemplate();
    else
        constructor.rotateModel();
});

$("#navigation button").click(function (elem) {

    document.body.querySelector(".products").dataset.type = elem.target.id;

    constructor.type = elem.target.id;
    localStorage.setItem("elements_type", constructor.type);

    constructor.createProductList();

    $("#navigation button").not($(this)).removeClass("active");

    $(this).toggleClass("active");

});

$("#get_close").click(function () {
    if(!localStorage.hasOwnProperty("top") || !localStorage.hasOwnProperty("skirt"))
    {
        alert("top ve ya skirt modelleri secilmeyib");
        return false;
    }

    window.location.href=  "get-cloth";

});