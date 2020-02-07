"use strict";

function Cloth() {
    this.cloth_type = (localStorage.hasOwnProperty("cloth_type")) ? localStorage.getItem("cloth_type") : "single";

    this.type = (localStorage.getItem("elements_type")) ? (localStorage.getItem("elements_type")) : "top";
    this.position = (localStorage.getItem("position")) ? localStorage.getItem("position") : "front";

    this.svg = (localStorage.getItem("svgClothObj")) ? JSON.parse(localStorage.getItem("svgClothObj")) : JSON.parse(localStorage.getItem("svgObj"));
    this.currency = "azn"

    /**
     * Used calculate total price and fetch cloth models for selected models
     * @type {{}}
     */
    this.total_price = JSON.parse(localStorage.getItem("cloth_total_price")) || JSON.parse(localStorage.getItem("total_price"));
    this.cloth_total_price = JSON.parse(localStorage.getItem("cloth_total_price")) || JSON.parse(localStorage.getItem("total_price"));

    this.landing = (localStorage.hasOwnProperty("landing")) ? localStorage.getItem("landing") : 1;      // Hundurluk
    this.lightning = (localStorage.hasOwnProperty("lightning")) ? localStorage.getItem("lightning") : 1;        // Zamok
    this.pockets = (localStorage.hasOwnProperty("pockets")) ? localStorage.getItem("pockets") : 1;      // Cib

    this.lining = (localStorage.hasOwnProperty("lining")) ? JSON.parse(localStorage.getItem("lining")) : false;     //Astar
    this.loops = (localStorage.hasOwnProperty("loops")) ? JSON.parse(localStorage.getItem("loops")) : false;        //Kemer ucun halqa

    this.deg = 0;

    this.page_type = $("#page_type").val();
    this.default_cloth_path = "http://darzi.az/uploads/cloth/11479711567.jpg";

    //this.current_active_cloth = localStorage.getItem("current_active_cloth") || document.body.querySelector(".cloth-items .item-block img").id;
    this.current_cloth_path = localStorage.getItem("current_cloth_path") || this.default_cloth_path;
    this.cloth_count = localStorage.hasOwnProperty("cloth_count") ? localStorage.getItem("cloth_count") : "one";

    this.initPrice = function() {
        console.warn(this.total_price);
        if(this.cloth_count == "one") {

            var price = 0;

            for( var i in this.total_price ) {
                console.log(this.total_price[i]);
                price += this.total_price[i];
            }

            return price;
        }

        localStorage.setItem("current_cloth_price", this.current_cloth_price);
        console.warn(this.current_cloth_price);
    }

    this.current_cloth_price = parseInt(localStorage.getItem("current_cloth_price")) || this.initPrice();

    this.current_cloth_type = (this.cloth_count == "multiple") ? (localStorage.getItem("current_cloth_type") || Object.keys(this.total_price)[0]) : "*";

    this.cloth_label = {
        "one": "Bütün modellər üçün bir parça növü",
        "multiple" : "Parçaları kombinə etmək"
    }

    // Set cloth filter attr's
    this.filter_color = localStorage.getItem("filter_color") || "*";
    this.filter_material = localStorage.getItem("filter_material") || "*";
    this.filter_price = localStorage.getItem("filter_price") || "*";    // Price category

    this.image_path = "/uploads/cloth/";
    this.image_media_path = "/uploads/cloth/media/";

    this.data_filter_lbl = {
        "filter-color": "filter_color",
        "filter-price": "filter_price",
        "filter-material": "filter_material"
    }

    //label for selected cloth
    this.cloth_model_label = {
        "top" : "top",
        "skirt": "yubka",
        "back": "kürək",
        "sleeve": "qollar",
        "collar": "yaxalıq"
    }

    this.current_cloth = localStorage.getItem("current_cloth") || 0;

    this.transition = 200;
}

//Remove multiple items from LocalStorage
Cloth.prototype.rmLs = function () {
    for (var i = 0; i < arguments.length; i++) {
        localStorage.removeItem(arguments[i]);
    }
}

//Set multiple items to LocalStorage
/**
 * @param {Array} key=>value
 */
Cloth.prototype.setLs = function () {
    for(var i = 0; i < arguments.length; i++) {
        localStorage.setItem(arguments[i][0], arguments[i][1]);
    }
}

Cloth.prototype.setClothType = function () {
    this. cloth_type = (this.cloth_type == "single") ? "multiple" : "single";
    localStorage.setItem('cloth_type', this.cloth_type);
}

//Data without escaping (double quotes)
Cloth.prototype.renderSvg = function (svg) {
    return svg.replace(/"/g, "'");
}

//update position (in storage & object)
Cloth.prototype.updatePosition = function (position) {
    this.position = position;
    localStorage.setItem("position", position);
}

//Check if model has top and back at the same time
Cloth.prototype.fixBackTop = function (type) {
    if((type == "back") && localStorage.hasOwnProperty("top.id") && (cloth.position == "front")) {
        cloth.svg[type] = "";
        return true;
    }
    else if((type == "top") && localStorage.hasOwnProperty("back.id") && (cloth.position == "back")) {
        cloth.svg[type] = "";
        return true;
    }

    return false;
}

Cloth.prototype.setTotalPrice = function () {
    var total = 0;
//console.error(price);

    if(this.cloth_count == "one") {
        total = this.current_cloth_price;
    }
    else {
        for (var i in this.cloth_total_price) {

            total += parseInt(this.cloth_total_price[i]);
        }
        console.info(total);
    }

    total += (this.lining) ? 1000 : 0;

    localStorage.setItem("last_price", total);

    document.body.querySelector('.current-price .price').innerHTML = total;
}

Cloth.prototype.fixTemplate = function () {
    console.log("fix template");
    $("#template_img")[0].attributes[1].value = "/template/images/tpl_"+cloth.position+".jpg";

    if(cloth.type != "back") {
        $(".products li").each(function () {
            $(this).find("img").attr("src", "/template/images/" + cloth.type + "/" + this.id + "_" + cloth.position + ".jpg");
        });
    }
}

Cloth.prototype.chechModelCount = function () {
    if(Object.keys(this.total_price).length != Object.keys(this.total_price)) {
        for (var i in this.total_price) {

        }
    }
}

Cloth.prototype.rotateModel = function () {
    console.log("rotate");
    $.each(localStorage, function (i, val) {

        //regexp for search model.id
        var re = /\w.id/;

        //check if
        if(re.test(i)) {

            //get model name
            var type = i.match(/[a-z]*/i)[0];

            $.ajax({
                url : "/template/images/" + type + "/svg/" + localStorage[i] + "_" + cloth.position + ".svg",
                type : "get",
                async : false,
                success : function(data) {

                    var svg = data.documentElement.outerHTML;

                    cloth.setLs(["" + type + "", svg], [i, localStorage[i]]);

                    cloth.svg[type] = cloth.renderSvg(svg);
                }
            });

            if(cloth.fixBackTop(type))
                return true;
        }
    });

    localStorage.setItem("svgObj", JSON.stringify(this.svg));

    cloth.generateSvg();
    cloth.fixTemplate();
}

Cloth.prototype.generateSvg = function() {
    console.log("generate");
    var items = []

    items.push('<svg x="0px" y="0px" width="242px" height="541px" viewBox="0 0 242 541" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events">');

    items.push('<image id="template_img" xlink:href="/template/images/tpl_'+cloth.position+'.jpg" x="0" y="0" height="541px" width="242px"></image>');

    //var obj = JSON.parse(localStorage.getItem("svgObj"));

    items.push("<defs>");

    if(this.cloth_count == "one") {
        for(var i in this.svg) {
            console.log(this.current_cloth_path);
            items.push('<pattern id="'+i+'" patternUnits="userSpaceOnUse" width="100" height="100">' +
                '<image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="'+this.current_cloth_path+'" x="0" y="0" width="100" height="100"></image>' +
                '</pattern>');
        }
    }
    else if(this.cloth_count == "multiple") {
        for (var i in this.svg) {

            console.log(localStorage[''+i+'.current_cloth_path']);

            items.push('<pattern id="' + i + '" patternUnits="userSpaceOnUse" width="100" height="100">' +
                '<image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="'+localStorage[''+i+'.current_cloth_path']+'" x="0" y="0" width="100" height="100"></image>' +
                '</pattern>');
        }
    }
    items.push("</defs>");

    for(var i in this.svg) {
        var x  = (this.svg[i]).replace(/#D3CECB/gi, 'url(http://darzi.az/az/3-constructor/get-cloth#'+i+')');

        items.push(x);
    }

    return $("#preview").html(items.join(""));
}

Cloth.prototype.optimizeClothCount = function () {

    var self = this;

    document.querySelector(".on-off").style.opacity = 0;

    setTimeout(function () {
        document.querySelector(".on-off").innerHTML = cloth.cloth_label[cloth.cloth_count];
        document.querySelector(".on-off").style.opacity = 1;

    }, self.transition);

    if(cloth.cloth_count == "multiple") {

        document.querySelector(".selected-clothes").style.opacity = 1;

        setTimeout(function () {
            document.querySelector(".selected-clothes").style.display = "block";

        }, self.transition);

        myonoffswitch.checked = true;
    }
    else {
        document.querySelector(".selected-clothes").style.opacity = 0;

        setTimeout(function () {
            document.querySelector(".selected-clothes").style.display = "none";
        }, self.transition);

        myonoffswitch.checked = false;
    }
}

Cloth.prototype.selectedCloth = function () {

    var selected_items = "",
        cloth_path = "",
        active;
console.warn(this.total_price);
    for(var i in this.total_price) {

        active = (this.type == i) ? "active" : "";
        cloth_path = localStorage[i + ".current_cloth_path"] || this.default_cloth_path;

        selected_items += '<div class="item '+active+'">'+
                            '<small>'+this.cloth_model_label[i]+'</small>'+
    '<img data-id="'+i+'" src="'+cloth_path+'">'+
                        '</div>';
    }

    document.body.querySelector(".selected-clothes").innerHTML = selected_items;

}

Cloth.prototype.setClothFilter = function () {

    for(var k in this.data_filter_lbl) {

        console.log(document.getElementById(k).value+" - "+this[this.data_filter_lbl[k]]);

        document.getElementById(k).value = this[this.data_filter_lbl[k]];   //localStorage.getItem("cloth_{filter}")
    }
}

Cloth.prototype.optimizeItemsByFilter = function () {

    $.each($(".cloth-items .item"), function () {

        var filter_count = 0;
        var style = "block";
        var elem = this;

        for(var i in cloth.data_filter_lbl) {

            var current_filter = cloth[cloth.data_filter_lbl[i]];

            if(current_filter == "*") {
                filter_count++;

                if(filter_count == 3)
                    this.style.display = "block";

                continue;
            }

            if(this.querySelector(".item-block img").getAttribute("data-"+i) != current_filter) {
                style = "none";
                continue;
            }
        }

        this.style.opacity = (style == "none") ? 0: 1;

        setTimeout(function () {
            elem.style.display = style;
        }, 100);

    });
}

/**
 * Get cloth description - Images, title, description
 * @param elemId
 */
Cloth.prototype.setClothInfo = function (elemId) {

    $.ajax({
        url: "get-cloth",
        type: "POST",
        async: false,
        dataType: "json",
        data: {id: elemId},

        success: function (data) {
            if (data) {

                var slider_thumb = "";

                for (var i in data) {
                    if (i == 0) {
                        document.querySelector("img.active-slide").src = cloth.image_path + "media/" + data[i].file;
                        document.querySelector(".cloth-info .cloth-title").innerHTML = data[i].name;
                        document.querySelector(".cloth-info p").innerHTML = data[i].description;
                    }

                    slider_thumb += "<img data-big-img='"+cloth.image_media_path + data[i].file +"' src='" + cloth.image_media_path + data[i].thumb + "'>";
                }

                document.querySelector(".slider-thumbs").innerHTML = slider_thumb;

                document.querySelector(".cloth-info-block").style.opacity = 1;
            }
        }

    }).fail(function (data) {
        //console.dir(data.responseText);
    });
}

Cloth.prototype.setClothPrice = function () {
console.log("set cloth price");

    var self = this,
        common_price = 0;

    $(".cloth-items .item-block").removeClass("active");

    if(!cloth.current_cloth)
        cloth.current_cloth = document.body.querySelector(".cloth-items .item-block img").id;

    if(this.cloth_count == "one") {

        $.each($(".cloth-items .item-block img"), function () {

            for (var i in self.total_price) {

                console.log(localStorage.getItem(i+".price")+" + "+this.dataset.fullPrice +" * "+ localStorage.getItem(i+".size"))
                common_price += parseInt(localStorage.getItem(i+".price")) + parseInt(this.dataset.fullPrice * localStorage.getItem(i+".size"));
            }

            if(cloth.current_cloth == this.parentElement.dataset.id)
                $(this.parentElement).addClass("active");

            this.nextElementSibling.innerHTML = common_price;

            common_price = 0;
        });
    }
    else if(this.cloth_count == "multiple") {
        $.each($(".cloth-items .item-block img"), function () {

            console.log(localStorage.getItem(cloth.current_cloth_type+".price")+" + "+this.dataset.fullPrice +" * "+ localStorage.getItem(cloth.type+".size"));

            common_price += parseInt(localStorage.getItem(cloth.type+".price")) + parseInt(this.dataset.fullPrice * localStorage.getItem(cloth.type+".size"));

            //if(cloth.current_cloth == this.parentElement.dataset.id)
                //$(this.parentElement).addClass("active");

            this.nextElementSibling.innerHTML = common_price;

            common_price = 0;
        });

        $(".item-block").removeClass("active");
        $("[data-id="+localStorage[""+cloth.type+".current_cloth"]+"]").addClass("active");
    }
}



Cloth.prototype.setCloth = function (elem) {
    console.log("set cloth");

    document.querySelector(".cloth-info-block").style.opacity = 0;

    var current_cloth_price = parseInt(elem.nextElementSibling.innerHTML);

    if(this.cloth_count == "one") {
        cloth.setLs(
            ["current_cloth", elem.id],
            ['current_cloth_path', elem.src],
            ['current_cloth_price', current_cloth_price],
            ['current_cloth_title', elem.dataset.clothTitle]
        );

        cloth.current_cloth_path = elem.src;
        cloth.current_cloth = elem.id;
        cloth.current_cloth_price = current_cloth_price;
    }
    else if(this.cloth_count == "multiple") {

        cloth[this.type + ".current_cloth"] = elem.id;
        cloth[this.type + ".current_cloth_path"] = elem.src;
        cloth[this.type + ".current_cloth_price"] = current_cloth_price;
        this.cloth_total_price[""+this.type+""] = current_cloth_price;

        cloth.setLs(

            [this.type + ".current_cloth", elem.id],
            [this.type + ".current_cloth_path", elem.src],
            [this.type + ".current_cloth_price", current_cloth_price],
            ["cloth_total_price", JSON.stringify(this.cloth_total_price)]
        );

        var selected_item = document.querySelector("[data-id="+this.type+"]");

        selected_item.src = cloth[this.type + ".current_cloth_path"];
        selected_item.dataset.typeId = elem.id;
    }

    setTimeout(function () {

        cloth.setClothInfo(elem.id);

    }, 0);

    cloth.generateSvg();

    $(".cloth-items .item-block").not($(elem.nextElementSibling)).removeClass("active");

    $(elem.parentElement).addClass("active");
}

/**
 * Set multiple cloth (id, path) if these doesn't exist
 */
Cloth.prototype.checkClothCount = function () {
    for(var i in cloth.total_price) {
        this.setLs(
            [""+i+".current_cloth_path", this.current_cloth_path],
            [""+i+".current_cloth", this.current_cloth]
        );
    }
}

Cloth.prototype.init = function () {

    this.selectedCloth();
    this.setClothFilter();
    this.setTotalPrice();
    this.generateSvg();
    this.optimizeItemsByFilter();
    this.setClothInfo(this.current_cloth || document.body.querySelector(".cloth-items .item-block img").id);
    this.setClothPrice();
}

var cloth = new Cloth();

$(document).ready(function () {
    cloth.init();

    cloth.optimizeClothCount();

    $(".slider-thumbs").on("click", "img", function () {

        var self = this;

        //document.querySelector("img.active-slide").style.opacity = 0.3;

            console.log(self.dataset.bigImg);
            document.body.querySelector("img.active-slide").src = self.dataset.bigImg;
            //document.querySelector("img.active-slide").style.opacity = 1;

    });

    $(".selected-clothes img").on("click", function () {
        if(cloth.cloth_count == "multiple") {
            cloth.setLs(["elements_type", this.dataset.id]);
            cloth.type = this.dataset.id;
            cloth.setClothPrice();
            cloth.type = localStorage.getItem("elements_type");

            if(cloth.type == "back" && cloth.position == "front") {
                cloth.updatePosition("back");

                cloth.fixTemplate();

                cloth.rotateModel();
            }
        }
        else
            alert("Bu secim yalniz bir nov model ucun mumkundur");

        $(".selected-clothes .item").removeClass("active");

        $(this.parentElement).addClass("active");

    });

    /**
     * set cloth options
     */
    if(localStorage.getItem("cloth_count") == null) {
        cloth.setCloth(document.body.querySelector(".cloth-items .item-block.active img"));
    }
});

$("#rotate").click(function (elem) {

    cloth.deg -= 180;

    this.style.transform = "rotate("+cloth.deg+"deg)";

    if(cloth.position == "front") {
        cloth.updatePosition("back");
    }
    else {
        cloth.updatePosition("front");
    }

    cloth.fixTemplate();

    cloth.rotateModel();
});

$(".onoffswitch-checkbox").change(function () {

    cloth.cloth_count = (cloth.cloth_count == "one") ? "multiple" : "one";

    cloth.current_cloth_type = Object.keys(cloth.total_price)[0];

    cloth.optimizeClothCount();

    localStorage["cloth_count"] = cloth.cloth_count;

    cloth.setClothPrice();

    if(!localStorage[''+cloth.type+'.current_cloth_path']) {

        console.info("birinci defee");
        cloth.checkClothCount();
    }

    cloth.generateSvg();

    cloth.setTotalPrice();
});

$("select.cloth-property").change(function () {

    cloth.setLs([cloth.data_filter_lbl[this.id], this.value]);
    cloth[cloth.data_filter_lbl[this.id]] = this.value;

    cloth.optimizeItemsByFilter();
});

$(".cloth-items .item-block img").on("click", function () {

    var elem = this;

    cloth.setCloth(elem);

    cloth.setTotalPrice();
});

$("#get_close").on("click", function () {
    window.location.href = "measure";
});