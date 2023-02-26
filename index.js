const unirest = require("unirest");
const cheerio = require("cheerio");
const axios = require("axios");
const { Console } = require('console')
const fs = require('fs');
const { Socket } = require("dgram");

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

getShoppingData();