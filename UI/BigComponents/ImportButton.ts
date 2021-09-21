import BaseUIElement from "../BaseUIElement";
import {SubtleButton} from "../Base/SubtleButton";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";
import Translations from "../i18n/Translations";
import State from "../../State";
import Constants from "../../Models/Constants";
import Toggle from "../Input/Toggle";
import CreateNewNodeAction from "../../Logic/Osm/Actions/CreateNewNodeAction";
import {Tag} from "../../Logic/Tags/Tag";

export default class ImportButton extends Toggle {
    constructor(imageUrl: string | BaseUIElement, message: string | BaseUIElement,
                originalTags: UIEventSource<any>,
                newTags: UIEventSource<Tag[]>, lat: number, lon: number) {
        const t = Translations.t.general.add;
        const isImported = originalTags.map(tags => tags._imported === "yes")
        const appliedTags = new Toggle(
            new VariableUiElement(
                newTags.map(tgs => {
                    const parts = []
                    for (const tag of tgs) {
                        parts.push(tag.key + "=" + tag.value)
                    }
                    const txt = parts.join(" & ")
                    return t.presetInfo.Subs({tags: txt}).SetClass("subtle")
                })), undefined,
            State.state.osmConnection.userDetails.map(ud => ud.csCount >= Constants.userJourney.tagsVisibleAt)
        )
        const button = new SubtleButton(imageUrl, message)


        button.onClick(() => {
            if (isImported.data) {
                return
            }
            originalTags.data["_imported"] = "yes"
            originalTags.ping() // will set isImported as per its definition
            const newElementAction = new CreateNewNodeAction(newTags.data, lat, lon)
            State.state.changes.applyAction(newElementAction)
            State.state.selectedElement.setData(State.state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            ))
            console.log("Did set selected element to", State.state.allElements.ContainingFeatures.get(
                newElementAction.newElementId
            ))


        })

        const withLoadingCheck = new Toggle(
            t.stillLoading,
            new Combine([button, appliedTags]).SetClass("flex flex-col"),
            State.state.featurePipeline.runningQuery
        )
        super(t.hasBeenImported, withLoadingCheck, isImported)
    }
}