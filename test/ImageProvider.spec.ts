import T from "./TestHelper";
import AllImageProviders from "../Logic/ImageProviders/AllImageProviders";
import {UIEventSource} from "../Logic/UIEventSource";

export default class ImageProviderSpec extends T {
    
    constructor() {
        super("ImageProvider", [
            ["Search images", () => {
            
                let i = 0
                function expects(url, tags, providerName = undefined) {
                    tags.id = "test/"+i
                    i++
                    AllImageProviders.LoadImagesFor(new UIEventSource(tags)).addCallbackD(images => {
                        console.log("ImageProvider test", tags.id, "for", tags)
                        const img = images[0]
                        if(img === undefined){
                            throw "No image found"
                        }
                        T.equals(url, img.url, tags.id)
                        if(providerName){
                            T.equals(img.provider.constructor.name, providerName)
                        }
                        console.log("OK")
                    })
                }

                const muntpoort_expected = "https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABr%C3%BCgge-Muntpoort_6-29510-58192.jpg?width=500&height=400"
                expects(
                    muntpoort_expected,
                    { "wikimedia_commons":"File:Brügge-Muntpoort_6-29510-58192.jpg"
                    } , "WikimediaImageProvider")



                expects(muntpoort_expected,
                    { "wikimedia_commons":"https://upload.wikimedia.org/wikipedia/commons/c/cd/Br%C3%BCgge-Muntpoort_6-29510-58192.jpg"
                    } , "WikimediaImageProvider")
                
                expects(muntpoort_expected , {
                    "image":"https://upload.wikimedia.org/wikipedia/commons/c/cd/Br%C3%BCgge-Muntpoort_6-29510-58192.jpg"
                } , "WikimediaImageProvider")


                expects("https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABelgium-5955_-_Simon_Stevin_(13746657193).jpg?width=500&height=400" , {
                    "image":"File:Belgium-5955_-_Simon_Stevin_(13746657193).jpg"
                } , "WikimediaImageProvider")

                expects("https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABelgium-5955_-_Simon_Stevin_(13746657193).jpg?width=500&height=400" , {
                "wikimedia_commons":"File:Belgium-5955_-_Simon_Stevin_(13746657193).jpg"
                } , "WikimediaImageProvider")


               
                
                expects("https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABrugge_Leeuwstraat_zonder_nummer_Leeuwbrug_-_119334_-_onroerenderfgoed.jpg?width=500&height=400",{
                    image:"File:Brugge_Leeuwstraat_zonder_nummer_Leeuwbrug_-_119334_-_onroerenderfgoed.jpg"
                }, "WikimediaImageProvider")

                expects("https://commons.wikimedia.org/wiki/Special:FilePath/File%3APapageno_Jef_Claerhout.jpg?width=500&height=400",{
                    "wikimedia_commons":	"File:Papageno_Jef_Claerhout.jpg"
                }, "WikimediaImageProvider")
               
            
            }]
            
            
        ]);
    }
    
}