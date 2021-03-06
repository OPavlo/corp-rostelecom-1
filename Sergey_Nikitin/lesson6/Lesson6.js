//код взят большей частью из предыдущего задания и адаптирован под текущее.
//6.1 задание это предыдущее со * 
//реализовано 6.2:  добавлен функционал просмотра картинок. Реагирует на нажатие на плашку продукта, но не кнопку "добавить" или название. 

'use strict';

const basketDom = document.querySelector(".basket");
const catalogDom = document.querySelector(".catalog");
const modalDom = document.querySelector(".modal");
const modalImageDom = document.querySelector(".modalImage");
const options = {
    productCss: "product",
    buttonCss: "myButton",
}

class product {
    constructor(_title, _price, _priceType, imageArray) {
        this.title = _title;
        this.price = _price;
        this.priceType = _priceType;
        this.images = imageArray;
    }
}
class backetUnit {
    constructor(_prod, _count) {
        this.product = _prod;
        this.count = _count;
    }

}
class backet {

    constructor() {
        this.shopBin = [];
    }
    add(_backetUnit) {
        for (let i = 0; i < this.shopBin.length; i++) {
            if (this.shopBin[i].product.title === _backetUnit.product.title) {
                this.shopBin[i].count += _backetUnit.count;
                return true;
            }

        }
        this.shopBin.push(_backetUnit);
    }
    countBasketPrice() {
        let res = 0
        for (let i = 0; i < this.shopBin.length; i++) {
            res += (parseInt(this.shopBin[i].product.price) * parseInt(this.shopBin[i].count));

        }
        return res;
    }
    countBasketProd() {
        return this.shopBin.length;
    }
    countBasket() {
        let res = 0
        for (let i = 0; i < this.shopBin.length; i++) {
            res += (parseInt(this.shopBin[i].count));

        }
        return res;
    }
}

function createProductBox(prod, index) {
    const res = document.createElement("div");
    res.classList.add(options.productCss);

    const titleprod = document.createElement("p");
    titleprod.textContent = prod.title + '(' + prod.price + ' ' + prod.priceType + ')';
    const buttonadd = document.createElement("div");
    buttonadd.classList.add(options.buttonCss);
    buttonadd.textContent = "Добавить";
    buttonadd.setAttribute("productIndex", index + "");
    buttonadd.setAttribute("onClick", "addToBasket(this);");//так привык добавлять. пример addEventListener ниже
    res.appendChild(titleprod);
    res.appendChild(buttonadd);
    res.setAttribute("productIndex", index + "");
    return res;

}
function addToBasket(button) {
    let indx = parseInt(button.getAttribute("productIndex"));
    if (backetCurrent === null && backetCurrent === undefined) {
        backetCurrent = new backet();
    }
    backetCurrent.add(new backetUnit(catalog[indx], 1));
    ShowBasket();
}
function clearBasket() {
    backetCurrent.shopBin = [];
    console.log("Корзина очищена");
    ShowBasket();
}
function ShowBasket() {
    basketDom.innerHTML = "";
    const titlebasket = document.createElement("h3");
    titlebasket.textContent = "Корзина";
    basketDom.appendChild(titlebasket);
    if (backetCurrent.shopBin.length === 0) {
        const texrbasket = document.createElement("p");
        texrbasket.textContent = "В корзине ничего нет!";
        basketDom.appendChild(texrbasket);
    }
    else {

        const texrbasket = document.createElement("p");
        texrbasket.textContent = "В корзине " + backetCurrent.countBasketProd() + " позиций и " + backetCurrent.countBasket() + " товаров на сумму = " + backetCurrent.countBasketPrice() + " рублей.";
        basketDom.appendChild(texrbasket);
        const buttonclear = document.createElement("div");
        buttonclear.classList.add(options.buttonCss);
        buttonclear.textContent = "Очистить";
        buttonclear.addEventListener("click", clearBasket);
        // buttonclear.setAttribute("onClick", "clearBasket();");
        basketDom.appendChild(buttonclear);
    }
}

function showImages(event) { //открывает(показывает) собсвенно модальное окно и присваивает переменные

    console.log(event);
    console.log(event.target.classList);
    if (event.target.className === "product") {
        modalDom.classList.add("show");
        let indx = parseInt(event.target.getAttribute("productIndex"));
        imagesList = catalog[indx].images;
        imageindex = 0;
        updateModalImage();
    }

}
function updateModalImage() {//обновление картинки
    modalImageDom.src = imagesList[imageindex % imagesList.length];//остаток от деления облегчает жизнь
    console.log(imagesList);

}
function imgNavClick(event) {// обработчик кнопок навигации картинок
    if (event.target.className === "myButton" && event.target.getAttribute("actionType") != null) {
        if (event.target.getAttribute("actionType") === "close") {
            modalDom.classList.remove("show");
            modalImageDom.src = "";

        }
        else {

            imageindex += parseInt(event.target.getAttribute("actionType"));
            updateModalImage();
        }


    }

}
var imagesList = [];//массив ссылок на картинки
var imageindex = 0;//текущий индекс карттинки
const backetCurrent = new backet();
const catalog = [];
catalog.push(new product("Материнка", 10000, "RUB", ["https://c.dns-shop.ru/thumb/st4/fit/wm/2000/1500/e8e62f2222ffe347d9ce30796353056d/d509697dfe589ce93fda0568a8a315d9cfd2ab974a0d836bfb20b03c7f467e84.jpg",
    "https://c.dns-shop.ru/thumb/st4/fit/wm/1500/2000/6cafc2f5fc0b6abb9db1bee1c50b6b9f/a45c3c459e8dd1cb95ddd88ad5ff9c2def12a9b13f291c86d69343d6d9026bdf.jpg",
    "https://c.dns-shop.ru/thumb/st4/fit/wm/2000/1500/fc1daad3c0bf7d348a015b37bb931e6e/16490de7f7aec812c8f2d4713e65ca1ac6aa1bebee6da413a958714529f9e7e6.jpg"]));
catalog.push(new product("Проц", 33000, "RUB", ["https://c.dns-shop.ru/thumb/st1/fit/wm/2000/2000/9f30b4a468208829372200cbdbb2fc37/d368e393397cec2b52d1307e42739ea91d8e1a8f2bab4b6d77cdadc271466e68.jpg",
    "https://c.dns-shop.ru/thumb/st1/fit/wm/2000/2000/f3daca72d8bfb0355ffc23a2e6190c56/97d3ae8735d9119cbe74e87d122dcb37ee1f15a93913dec1d82bec9ecc72c527.jpg"]));
catalog.push(new product("Плашка оперативы", 5000, "RUB", ["https://c.dns-shop.ru/thumb/st4/fit/wm/2000/2000/7547db98948edce7ab8e7795c4076ddb/7f7e164bbf8e0219d022ae2decda46a626fe3b633951335c053bf9fee2c63ed5.jpg", "https://c.dns-shop.ru/thumb/st4/fit/wm/2000/2000/b54f3255be570dd3ec9c1cf0057b0eae/8f2e0ad0bbd45e1f71402eed0628b141fcf91cc3c51c055e1474f5c82b0af869.jpg", "https://c.dns-shop.ru/thumb/st1/fit/wm/2000/1999/c20499b171853eba540c23e02b2ccf4b/d8c1d9a00f5caef337c9358e9bb43cf2c9fefae80fa52e6496ee460e5ab0de0c.jpg"]));
catalog.push(new product("Видяха", 40000, "RUB", ["https://c.dns-shop.ru/thumb/st4/fit/wm/2000/2000/1e21ef296f64293fc5ae41ce695deb8a/391fe37703183b4d9a26a134a71319a6f4e9ecb166f0a0c861856edbd84f2885.jpg", "https://c.dns-shop.ru/thumb/st4/fit/wm/2000/2000/823f0643c102d9b8f990c8a61aec0bbb/64ab18744876bbf549182e04a313bce116283d123ef9e2f43c7877af3292cbbf.jpg", "https://c.dns-shop.ru/thumb/st4/fit/wm/2000/2000/a0f74b085accb9c1266cfb0ad99efde3/d0f08e540c41499613a2700eb9c68bd229839f834d05809c4e8820888e028495.jpg"]));
catalog.push(new product("Блок питалова", 10000, "RUB", ["https://c.dns-shop.ru/thumb/st1/fit/wm/1999/2000/06998a560fea9ba91e6d6dae1e253c1e/27f67a845c96a0cb523826b91a836fad031402a872518a01b4c84f50d3fff9b4.jpg", "https://c.dns-shop.ru/thumb/st1/fit/wm/2000/2000/3fa0d91f83d08a002442175097ec7cb8/86f9195b11411bb74382f9d4d3441968e6a1d520c2f6c7911b9f74979ea2af3a.jpg", "https://c.dns-shop.ru/thumb/st1/fit/wm/2000/2000/4484f489cd745fd7ded2a65b58ec75eb/f87d84f7f26cb623988416603c04c85b7cac10a8472de76434c9107a281644ea.jpg"]));
catalog.push(new product("Корпус", 4000, "RUB", ["https://c.dns-shop.ru/thumb/st4/fit/wm/2000/2000/d78f4503b7f4d0219df2924479a7902d/d35f027309ea198339e49fed8acb806fb0fa9dbb608912758ed00a236ba16e2c.jpg", "https://c.dns-shop.ru/thumb/st1/fit/wm/2000/2000/f50fd294efc806ef64c14f8317475729/f79be0f24c62bb7f3a5df3814731e5907b394a80efe50af882c32fd2fb5ff4ac.jpg", "https://c.dns-shop.ru/thumb/st1/fit/wm/2000/2000/546e4b9f2ca91b34b4dc2fe27a1b1cf2/47a13a27b55e60b3a5432776199f17a4551735f948ab1d034b6ba13891dd625a.jpg"]));
catalog.push(new product("Кулер", 1500, "RUB", ["https://c.dns-shop.ru/thumb/st1/fit/wm/594/701/7a965802da624353f77d3c8bd1fb50d1/52078f4d628f603a9df12da37df0d64342f41f5b06229517ee42238d5aa75f6b.jpg", "https://c.dns-shop.ru/thumb/st4/fit/wm/1000/750/133437e9400a6f3ca6a61fa90d2fa344/6f1557464455cdd4a242dbf6fc8cbd8cd4f64ca6ccbdac376aae4f9c67df4925.jpg", "https://c.dns-shop.ru/thumb/st4/fit/wm/1000/750/e7743a2ba5a1849089ede9da710ed393/6a4e2de34aef1899d99425c17d4833ec43962270eb629e649872b1729643c168.jpg"]));
backetCurrent.add(new backetUnit(catalog[0], 1));
backetCurrent.add(new backetUnit(catalog[1], 1));
backetCurrent.add(new backetUnit(catalog[2], 2));
backetCurrent.add(new backetUnit(catalog[3], 1));
backetCurrent.add(new backetUnit(catalog[4], 1));
backetCurrent.add(new backetUnit(catalog[5], 1));
backetCurrent.add(new backetUnit(catalog[6], 1));
console.log("Корзина:", backetCurrent);
console.log("Цена компа=", backetCurrent.countBasketPrice());


window.onload = function () {
    catalogDom.innerHTML = "";
    const titleCatalog = document.createElement("h3");
    titleCatalog.textContent = "Католог товаров";
    catalogDom.appendChild(titleCatalog);
    catalogDom.onclick = showImages;
    for (let i = 0; i < catalog.length; i++) {
        catalogDom.appendChild(createProductBox(catalog[i], i));
    }
    ShowBasket();
}
