import Combine from "../Base/Combine";
import Attribution from "./Attribution";
import Img from "../Base/Img";
import ImageAttributionSource from "../../Logic/ImageProviders/ImageAttributionSource";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import Loading from "../Base/Loading";


export class AttributedImage extends Combine {

    constructor(urlSource: string, imgSource: ImageAttributionSource) {
        const preparedUrl = imgSource.PrepareUrl(urlSource)
        let img: BaseUIElement;
        let attr: BaseUIElement
        if (typeof preparedUrl === "string") {
            img = new Img(urlSource);
            attr = new Attribution(imgSource.GetAttributionFor(urlSource), imgSource.SourceIcon())
        } else {
            img = new VariableUiElement(preparedUrl.map(url => {
                if(url === undefined){
                    return new Loading()
                }
                return new Img(url, false, {fallbackImage: './assets/svg/blocked.svg'});
            }))
            attr = new VariableUiElement(preparedUrl.map(_ => new Attribution(imgSource.GetAttributionFor(urlSource), imgSource.SourceIcon())))
        }


        super([img, attr]);
        this.SetClass('block relative h-full');
    }


}