const unirest = require("unirest");
const cheerio = require("cheerio");
const axios = require("axios");
const { Console } = require('console')
const fs = require('fs');
const { Socket } = require("dgram");
const { get } = require("http");

const logger = new Console({
stdout: fs.createWriteStream("log.txt")
})

const getShoppingData = async() => {

    const produto = "1660 super"

    try {
        return unirest
            .get(`https://www.google.com/search?q=${produto}&tbm=shop&gl=br&hl=pt`)
            .headers({
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36",
            })
            .then(async(response) => {
                let $ = cheerio.load(response.body);

                let ads = [];

                for (const el of $(".sh-np__click-target")) {
                    let linkRedirecionado
                    try {
                        linkRedirecionado = await unirest.get("https://www.google.com" + $(el).attr("href"))
                        linkRedirecionado = linkRedirecionado.request.uri.href
                    } catch (error) {
                        console.log("Erro");
                        logger.log(error);
                    }

                    let preco = $(el).find(".hn9kf").find(".T14wmb").text();
                    const indice = preco.indexOf("R$", preco.indexOf("R$") + 1);
                    if (indice !== -1) {
                        preco = preco.substring(0, indice);
                        
                    }

                    ads.push({
                        title: $(el).find(".sh-np__product-title").text(),
                        link: linkRedirecionado,
                        source: $(el).find(".sh-np__seller-container").text(),
                        price: preco,
                    })
                }

                for (let i = 0; i < ads.length; i++) {
                    Object.keys(ads[i]).forEach(key => ads[i][key] === "" ? delete ads[i][key] : {});
                }

                console.log(ads)
            })
    }
    catch (e) {
        console.log(e)
    }
}
// getShoppingData();

async function funcaoShoppingData(produto){

    try {
        let response = await unirest
            .get(`https://www.google.com/search?q=${produto}&tbm=shop&site=br&lr=lang_pt+-site:mercadolivre.com.br+-site:aliexpress.com+-site:ebay.com`)
            .headers({
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36 OPR/81.0.4196.73"
            })
        console.log(response.request.uri.href);
        let $ = cheerio.load(response.body);

        let ads = [];

        for (const el of $(".sh-np__click-target")) {
            let linkRedirecionado
            let indice
            try {
                linkRedirecionado = await unirest.get("https://www.google.com" + $(el).attr("href"))
                linkRedirecionado = linkRedirecionado.request.uri.href
                indice = linkRedirecionado.indexOf('?gclid')
                if (indice !== -1) {
                    linkRedirecionado= linkRedirecionado.substring(0,indice)
                }
                // indice = linkRedirecionado.indexOf('?')
                // if (indice === -1) {
                //     linkRedirecionado = linkRedirecionado + "?p=29905"
                // }
                // else {
                //     linkRedirecionado = linkRedirecionado + "&p=29905"
                // }
            } catch (error) {
                console.log("Erro");
                logger.log(error);
            }

            let preco = $(el).find(".hn9kf").find(".T14wmb").text();
            indice = preco.indexOf("R$", preco.indexOf("R$") + 1);
            if (indice !== -1) {
                preco = preco.substring(0, indice);
            }

            let img = $(el).find(".SirUVb.sh-img__image img").attr('src');

            ads.push({
                title: $(el).find(".sh-np__product-title").text(),
                link: linkRedirecionado,
                source: $(el).find(".sh-np__seller-container").text(),
                price: preco,
                image: img
            })
        }

        for (let i = 0; i < ads.length; i++) {
            Object.keys(ads[i]).forEach(key => ads[i][key] === "" ? delete ads[i][key] : {});
        }

        return ads
    }
    catch (e) {
        console.log("Erro");
        logger.log(e)
    }
}

const main = async() => {
    let resposta = await funcaoShoppingData("1tb HDD")
    logger.log(resposta)
}

main()