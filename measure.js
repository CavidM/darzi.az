"use strict";

class Measure {

    constructor(selected_model) {
        let obj = JSON.parse(selected_model);
            obj = selected_model;
        var self = this;

        this.measure_form = localStorage.getItem("measure_form") ? JSON.parse(localStorage.getItem("measure_form")) : {};

        if(obj.indexOf("sleeve") > -1)
            this.measure_type = "sleeve";
        else if(obj.indexOf("top") > -1)
            this.measure_type = "top";
        else if(obj.indexOf("skirt") > -1)
            this.measure_type = "skirt";

        console.log(this.measure_type);


      /*  for (let i in obj) {
            console.log(i);
            if(i == "sleeve") {
                this.measure_type = "sleeve";
                break;
            }
            else if(i == "top") {
                this.measure_type = "top";
                break;
            }
            else
                this.measure_type = "skirt";
        }*/

        console.warn(this.measure_type);

       /// if(this.measure_type == "all") {
            var items = [];
            $.getJSON("/template/js/measure.json", function (data) {
                for (var i in data) {

                    if(!data[i][self.measure_type])
                        continue;

                    items.push('<li class="m-list-item" data-title="'+data[i].title+'" data-description="'+data[i].description+'" data-name="'+data[i].nodeName+'">'+
                                    '<label for="'+data[i].nodeName+'" class="m-label"><i class="fa fa-scissors scissors-icon" aria-hidden="true"></i> '+data[i].title+'</label>'+
                                    '<div class="input-group">'+
                                        '<input required name="'+data[i].nodeName+'" id="'+data[i].nodeName+'" class="measure-input" value="'+(self.measure_form[data[i].nodeName] || '')+'" onkeypress="return event.charCode >= 48 && event.charCode <= 57" type="text" maxlength="4">'+
                                        '<small class="m-type">sm</small>'+
                                    '</div>'+
                                '</li>');
                }

                document.body.querySelector(".m-form-list").innerHTML = items.join("");

                /**
                 * Set form event handlers
                 */
                $(".measure-input").on("focus", function () {
                    self.current_input = this.parentElement.parentElement;

                    $(".m-list-item").removeClass("active");
                    $(self.current_input).addClass("active");

                    measure.getMeausureInfo(self.current_input);
                });

                $('.measure-input').keydown(function(e) {
                    /**
                     * 1. Down
                     * 2. Up
                     */
                    if (e.keyCode==40) {
                        $(self.current_input).next().find(".measure-input").focus();
                    }
                    else if (e.keyCode==38) {
                        $(self.current_input).prev().find(".measure-input").focus();
                    }
                });

                $('.measure-input').on('input', function() {
                    self.measure_form[this.id] = this.value;
                    localStorage.setItem("measure_form", JSON.stringify(self.measure_form));
                    console.dir(this);
                });
            });
        //}
    }

    static hideSizeTable() {
        $("#measure-table").fadeOut();
    }

    static showSizeTable() {
        $("#measure-table").fadeIn();
    }

    getMeausureInfo(elem) {

        let desc_block = document.body.querySelector(".m-description"),
            data = elem.dataset;

        $(desc_block).find(".info-img").attr("src", "/template/images/measure/"+data.name+".jpg");
        $(desc_block).find(".info-title").html(data.title);
        $(desc_block).find(".info-p").html(data.description);

        desc_block.style.display = "block";
    }
}

var measure = new Measure(localStorage.getItem("total_price"));


/**
 * Event handlers
 */


$(document).ready(function () {

    $("#measure-table").click(function() {
        Measure.hideSizeTable();
    });

    $(".table-img img").click(function(e) {
        e.stopPropagation();
        return false;
    });

    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            Measure.hideSizeTable();
        }
    });

    $("#toggle_s_table").click(function () {
        Measure.showSizeTable();
    });

    $(".m-r-btn").on("click", function () {
        $("#measure-form input").val("");
        measure.measure_form = {};
        localStorage.setItem("measure_form", "");
        // document.getElementById("measure-form").reset();

    });

});