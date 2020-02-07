"use strict";

class Checkout extends Helper{

    constructor() {
        super();

        this.cloth_count = localStorage.getItem("cloth_count") || "one";

        this.default_cloth_path = "http://darzi.az/uploads/cloth/11479711567.jpg";
        this.current_cloth_path = localStorage.getItem("current_cloth_path") || this.default_cloth_path;
        this.svg = (localStorage.getItem("svgClothObj")) ? JSON.parse(localStorage.getItem("svgClothObj")) : JSON.parse(localStorage.getItem("svgObj"));
        this.model_position = localStorage.getItem("position") || "front";
        this.total_price = JSON.parse(localStorage.getItem("total_price"));
        this.measure = JSON.parse(localStorage.getItem("measure_form"));
        this.last_price = localStorage.getItem("last_price");
        this.cloth = {};
        this.measure = JSON.parse(localStorage.getItem("measure_form"));
        this.checkout_status = localStorage.getItem("checkout_status") || false;


        this.checkout_status = false; // for debug


        this.helper = {
            setLs: super.setLs,
            renderSvg: super.renderSvg,
            formLabels: super.formLabels(),
            modelLabels: super.modelLabels()
        }

        console.dir(this.helper.formLabels);

        this.extra_options = {
            landing: localStorage.getItem("landing") || 1,
            lightning: localStorage.getItem("lightning") || 1,
            pockets: localStorage.getItem("pockets") || 1,
            loops: localStorage.getItem("loops") || false,
            lining: localStorage.getItem("lining") || false,
        }

        if(this.model_position == "front") {
            this.generateSvg("#front_model", "front");
            this.model_position = "back";
            this.rotateModel();
            this.generateSvg("#back_model", "back");
        }
        else {
            this.generateSvg("#back_model", "back");
            this.model_position = "front";
            this.rotateModel();
            this.generateSvg("#front_model", "front");
        }

        this.measureLabel = super.measureLabels();

        if(this.checkout_status) {

        }
        else {

            $(".checkout-btn-block")
                .html(
                    '<button type="button" id="btn_checkout" class="btn btn-default btn-block btn-checkout">Təsdiq et</button>'+
                    '<button type="button" id="checkout_submit" class="btn btn-default btn-block btn-checkout btn-checkout-submit">Təsdiq et</button>'
                ).fadeIn();
        }

        this.loadOptions();
    }

    static get checkoutStatus() {
        return localStorage.getItem("checkout_status") || false;
    }

    loadOptions() {
        var items = [],
            options = super.extraOptions();


        let promise = new Promise((resolve, reject) => {

            /**
             * render model price
             */
            $("#preview_price").html(this.last_price);

            /**
             * render extra options
             */
            for(var i in this.extra_options) {
                items.push("<li><label>"+options[i][i]+":</label><b>"+options[i][this.extra_options[i]]+"</b></li>");
            }
            $(".extra-options .desc-options").html(items.join(""));

            items = [];

            /**
             * render selected clothes
             */
            if(this.cloth_count == "one") {
                items.push('<li class="one"><img src="'+localStorage.getItem("current_cloth_path")+'"><span>'+localStorage.getItem("current_cloth_title")+'</span></li>');
                $(".clothes .desc-options").html(items.join(""));

                // let cloth_id = localStorage.getItem("current_cloth");
                this.cloth.id = localStorage.getItem("current_cloth");
            }
            else {
                for (var i in this.total_price) {
                    items.push('<li><img src="'+localStorage[""+i+".current_cloth_path"]+'"><span>'+this.helper.modelLabels[i]+'</span></li>');
                    this.cloth[i] = localStorage[""+i+".current_cloth"];
                }
                $(".clothes .desc-options").html(items.join(""));

            }

            items = [];
            /**
             * render measure
             */
            for (var i in this.measure) {
                items.push('<li><label>'+this.measureLabel[i]+':</label><b>'+this.measure[i]+' <small>sm</small></b></li>');
            }
            $(".measure .desc-options").html(items.join(""));

            resolve();

        });

        promise
            .then(
                result => {
                    setTimeout(function () {
                        console.warn(document.querySelector(".constructor-preview").clientHeight);
                        $(".checkout").css("min-height", parseInt($(".constructor-preview").innerHeight())+2+"px");
                    }, 500);
                }
            );
    }

    generateSvg(where, position) {
        var items = [];

        items.push('<svg x="0px" y="0px" width="242px" height="541px" viewBox="0 0 242 541" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events">');

        items.push('<image id="template_img" xlink:href="/template/images/tpl_'+position+'.jpg" x="0" y="0" height="541px" width="242px"></image>');

        //var obj = JSON.parse(localStorage.getItem("svgObj"));

        items.push("<defs>");

        if(this.cloth_count == "one") {
            for(var i in this.svg) {

                items.push('<pattern id="'+i+'" patternUnits="userSpaceOnUse" width="100" height="100">' +
                    '<image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="'+this.current_cloth_path+'" x="0" y="0" width="100" height="100"></image>' +
                    '</pattern>');
            }
        }
        else if(this.cloth_count == "multiple") {
            for (var i in this.svg) {

                items.push('<pattern id="' + i + '" patternUnits="userSpaceOnUse" width="100" height="100">' +
                    '<image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="'+localStorage[''+i+'.current_cloth_path']+'" x="0" y="0" width="100" height="100"></image>' +
                    '</pattern>');
            }
        }
        items.push("</defs>");

        for(var i in this.svg) {
            var x  = (this.svg[i]).replace(/#D3CECB/gi, 'url(http://darzi.az/az/3-constructor/measure/checkout#'+i+')');

            items.push(x);
        }

        return $(where).html(items.join(""));
    }

    rotateModel () {

        var self = this;

        $.each(localStorage, function (i, val) {

            //regexp for search model.id
            var re = /\w.id/;

            //check if
            if(re.test(i)) {

                //get model name
                var type = i.match(/[a-z]*/i)[0];

                $.ajax({
                    url : "/template/images/" + type + "/svg/" + localStorage[i] + "_" + self.model_position + ".svg",
                    type : "get",
                    async : false,
                    success : function(data) {

                        var svg = data.documentElement.outerHTML;

                        self.helper.setLs(["" + type + "", svg], [i, localStorage[i]]);

                        self.svg[type] = self.helper.renderSvg(svg);
                    }
                });

                if(self.fixBackTop(type))
                    return true;
            }
        });

        // localStorage.setItem("svgObj", JSON.stringify(this.svg));


    }

    fixBackTop (type) {
        if((type == "back") && localStorage.hasOwnProperty("top.id") && (this.model_position == "front")) {
            this.svg[type] = "";
            return true;
        }
        else if((type == "top") && localStorage.hasOwnProperty("back.id") && (this.model_position == "back")) {
            this.svg[type] = "";
            return true;
        }

        return false;
    }

    transformCheckForm() {
        $(".constructor-preview").fadeToggle();
        $(".checkout-form").fadeToggle();
        $("#btn_checkout").fadeToggle("fast");
        $(".btn-checkout-submit").fadeToggle("fast");
        $(".checkout-form input:first-child").focus();
    }

    checkoutFormValidation() {

        var form = $("#checkout_form").serializeArray(),
            form_fields = document.getElementById("checkout_form"),
            self = this,
            valid = true;

        $(".form-validation").html("");

        for (var i = 0; i < form_fields.childElementCount - 1; i++) {

            if(form_fields[i].value == "") {

                valid = false;

                $(".form-validation").append('<p class="alert" data-invalid="'+form_fields[i].name+'">'+self.helper.formLabels[form_fields[i].name]+' boş ola bilməz ' +
                    '<i class="fa fa-exclamation-circle" aria-hidden="true"></i></p>');

                $(form_fields[i]).addClass("invalid");

                continue;
            }

            if(form_fields[i].name == "email") {

                var email = form_fields[i],
                    e_val = email.value,
                    atpos = e_val.indexOf("@"),
                    dotpos = e_val.lastIndexOf(".");

                if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= e_val.length) {

                    valid = false;
                    $(".form-validation").append('<p class="alert" data-invalid="'+form_fields[i].name+'">'+self.helper.formLabels[form_fields[i].name]+' düzgün deyil' +
                        '<i class="fa fa-exclamation-circle" aria-hidden="true"></i></p>');

                    $(form_fields[i]).addClass("invalid");
                }
            }
        }

        if(!valid) {
            $(".form-validation").fadeIn();

            document.forms["checkout"][""+$(".form-validation p").first().data("invalid")+""].focus();

            setTimeout(function () {
                $(".form-validation").fadeOut("slow");
                $("#checkout_form input").removeClass("invalid");
            }, 3000);

            return false;
        }
        else {
            let fields = document.forms["checkout"];

            this.checkoutSubmit(
                fields.username.value,
                fields.phone.value,
                fields.email.value,
                fields.comment.value,
                this.svg,
                this.cloth,
                this.measure,
                this.extra_options,
                "dress"
            )
        }
    }

    checkoutSubmit(name, phone, mail, comment, model, cloth, measure, extra_options, model_type) {

        var self = this;

        $.ajax({
            method: "POST",
            url: "",
            data: {
                checkout: true,
                name: name,
                phone: phone,
                mail: mail,
                comment: comment,
                model: model,
                cloth: cloth,
                measure: measure,
                extra_options: extra_options,
                model_type: model_type
            }
        })
        .done(function( msg ) {
            console.debug( msg );

            // $("body").append(msg);

            localStorage.setItem("checkout_status", true);

            $(".checkout").fadeOut(function () {

                self.renderCheckoutSuccess();

            });

        });
    }

    renderCheckoutSuccess() {

        $(".checkout")
            .html(
                '<div class="checkout-success">'+
                    '<div class="success-notification">'+
                        '<h1 class="notification">Sifarişiniz təsdiq olundu.</h1>'+
                        '<h3 class="notification">Qısa müddətdə sizinlə əlaqə saxlanilacaqdır</h3>'+
                    '</div>'+
                    '<div class="checkout-success-back"></div>'+
                '</div>'
            ).fadeIn();

        $(".checkout-btn-block").fadeOut().remove();
    }
}


window.onload = function () {


    var checkout = new Checkout();

    $("#btn_checkout, .return-link").on("click", function () {
        checkout.transformCheckForm();
    });

    $('#checkout_form input').on('keydown', function (e) {
        if (e.which == 13 || e.keyCode == 13) {
            checkout.checkoutFormValidation();
        }
    });

    $("#checkout_submit").on("click", function () {
        checkout.checkoutFormValidation();
    });


}