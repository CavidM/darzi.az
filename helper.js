class Helper {
    constructor() {

    }
    //Remove multiple items from LocalStorage
    rmLs() {
        for (var i = 0; i < arguments.length; i++) {
            localStorage.removeItem(arguments[i]);
        }
    }

    extraOptions() {
        return {
            "landing": {
                "landing": "hündürlük",
                "1": "standart",
                "2": "alçaq"
            },
            "lightning": {
                "lightning": "Zamok",
                "1": "Qarşıdan",
                "2": "Yandan",
                "3": "Arxadan"
            },
            "lining": {
                "lining": "Astar",
                true: "var",
                false: "yox"
            },
            "loops": {
                "loops": " Kəmər üçün halqa",
                true: "var",
                false: "yox"
            },
            "pockets": {
                "pockets": "Cib",
                "1": "Cibsiz",
                "2": "Qarşıdan",
                "3": "Arxasında gizli"
            }
        }
    }

    measureLabels() {
        console.log("---");
        console.dir(this.measure);
        return {
            "girth_neck": "Обхват шеи",
            "girth_chest": "Обхват груди",
            "girth_waist": "Обхват талии",
            "girth_thighs": "Обхват бедер",
            "height_chest": "Высота груди",
            "length_forehand_to_waist": "Длина переда до талии",
            "length_back": "Длина спины",
            "width_back": "Ширина спины",
            "length_shoulder": "Длина плеча",
            "length_sleeve": "Длина рукава",
            "girth_biceps": "Обхват бицепса",
            "length_product": "Длина изделия"
        }
    }

    formLabels() {
        return {
            "username": "Ad, Soyad",
            "phone": "Telefon",
            "email" : "Email"
        }
    }

    modelLabels() {
        return {
            "top": "yuxarı",
            "skirt": "yubka",
            "back": "kürək",
            "sleeve": "qollar",
            "collar": "yaxalıq",
        }
    }

//Set multiple items to LocalStorage
    /**
     * @param {Array} key=>value
     */
    setLs() {
        return
        for(var i = 0; i < arguments.length; i++) {
            localStorage.setItem(arguments[i][0], arguments[i][1]);
        }
    }

    setClothType() {
        this. cloth_type = (this.cloth_type == "single") ? "multiple" : "single";
        localStorage.setItem('cloth_type', this.cloth_type);
    }

//Data without escaping (double quotes)
    renderSvg(svg) {
        return svg.replace(/"/g, "'");
    }

//update position (in storage & object)
    updatePosition(position) {
        this.position = position;
        localStorage.setItem("position", position);
    }

}