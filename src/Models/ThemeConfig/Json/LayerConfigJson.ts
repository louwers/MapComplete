import { TagConfigJson } from "./TagConfigJson"
import { TagRenderingConfigJson } from "./TagRenderingConfigJson"
import FilterConfigJson from "./FilterConfigJson"
import { DeleteConfigJson } from "./DeleteConfigJson"
import UnitConfigJson from "./UnitConfigJson"
import MoveConfigJson from "./MoveConfigJson"
import PointRenderingConfigJson from "./PointRenderingConfigJson"
import LineRenderingConfigJson from "./LineRenderingConfigJson"
import { QuestionableTagRenderingConfigJson } from "./QuestionableTagRenderingConfigJson"
import RewritableConfigJson from "./RewritableConfigJson"

/**
 * Configuration for a single layer
 */
export interface LayerConfigJson {
    /**
     * The id of this layer.
     * This should be a simple, lowercase, human readable string that is used to identify the layer.
     */
    id: string

    /**
     * The name of this layer
     * Used in the layer control panel and the 'Personal theme'.
     *
     * If not given, will be hidden (and thus not toggable) in the layer control
     */
    name?: string | Record<string, string>

    /**
     * A description for this layer.
     * Shown in the layer selections and in the personel theme
     */
    description?: string | Record<string, string>

    /**
     * This determines where the data for the layer is fetched: from OSM or from an external geojson dataset.
     *
     * If no 'geojson' is defined, data will be fetched from overpass and the OSM-API.
     *
     * Every source _must_ define which tags _must_ be present in order to be picked up.
     *
     * Note: a source must always be defined. 'special' is only allowed if this is a builtin-layer
     */
    source:
        | "special"
        | "special:library"
        | (
              | {
                    /**
                     * Every source must set which tags have to be present in order to load the given layer.
                     */
                    osmTags: TagConfigJson
                    /**
                     * The maximum amount of seconds that a tile is allowed to linger in the cache
                     */
                    maxCacheAge?: number
                }
              | {
                    /**
                     * The actual source of the data to load, if loaded via geojson.
                     *
                     * # A single geojson-file
                     * source: {geoJson: "https://my.source.net/some-geo-data.geojson"}
                     *  fetches a geojson from a third party source
                     *
                     * # A tiled geojson source
                     * source: {geoJson: "https://my.source.net/some-tile-geojson-{layer}-{z}-{x}-{y}.geojson", geoJsonZoomLevel: 14}
                     *  to use a tiled geojson source. The web server must offer multiple geojsons. {z}, {x} and {y} are substituted by the location; {layer} is substituted with the id of the loaded layer
                     *
                     * Some API's use a BBOX instead of a tile, this can be used by specifying {y_min}, {y_max}, {x_min} and {x_max}
                     */
                    geoJson: string
                    /**
                     * To load a tiled geojson layer, set the zoomlevel of the tiles
                     */
                    geoJsonZoomLevel?: number
                    /**
                     * Indicates that the upstream geojson data is OSM-derived.
                     * Useful for e.g. merging or for scripts generating this cache
                     */
                    isOsmCache?: boolean
                    /**
                     * Some API's use a mercator-projection (EPSG:900913) instead of WGS84. Set the flag `mercatorCrs: true`  in the source for this
                     */
                    mercatorCrs?: boolean
                    /**
                     * Some API's have an id-field, but give it a different name.
                     * Setting this key will rename this field into 'id'
                     */
                    idKey?: string
                }
          )

    /**
     *
     * A list of extra tags to calculate, specified as "keyToAssignTo=javascript-expression".
     * There are a few extra functions available. Refer to <a>Docs/CalculatedTags.md</a> for more information
     * The functions will be run in order, e.g.
     * [
     *  "_max_overlap_m2=Math.max(...feat.overlapsWith("someOtherLayer").map(o => o.overlap))
     *  "_max_overlap_ratio=Number(feat._max_overlap_m2)/feat.area
     * ]
     *
     * The specified tags are evaluated lazily. E.g. if a calculated tag is only used in the popup (e.g. the number of nearby features),
     * the expensive calculation will only be performed then for that feature. This avoids clogging up the contributors PC when all features are loaded.
     *
     * If a tag has to be evaluated strictly, use ':=' instead:
     *
     * [
     * "_some_key:=some_javascript_expression"
     * ]
     *
     */
    calculatedTags?: string[]

    /**
     * If set, this layer will not query overpass; but it'll still match the tags above which are by chance returned by other layers.
     * Works well together with 'passAllFeatures', to add decoration
     */
    doNotDownload?: boolean

    /**
     * If set, only features matching this extra tag will be shown.
     * This is useful to hide certain features from view.
     *
     * The default value is 'yes'
     */
    isShown?: TagConfigJson

    /**
     * Advanced option - might be set by the theme compiler
     *
     * If true, this data will _always_ be loaded, even if the theme is disabled
     */
    forceLoad?: false | boolean

    /**
     * The minimum needed zoomlevel required before loading the data
     * Default: 0
     */
    minzoom?: number

    /**
     * Indicates if this layer is shown by default;
     * can be used to hide a layer from start, or to load the layer but only to show it where appropriate (e.g. for snapping to it)
     */
    shownByDefault?: true | boolean

    /**
     * The zoom level at which point the data is hidden again
     * Default: 100 (thus: always visible
     */
    minzoomVisible?: number

    /**
     * The title shown in a popup for elements of this layer.
     */
    title?: string | TagRenderingConfigJson

    /**
     * Small icons shown next to the title.
     * If not specified, the OsmLink and wikipedia links will be used by default.
     * Use an empty array to hide them.
     * Note that "defaults" will insert all the default titleIcons (which are added automatically)
     *
     * Type: icon[]
     */
    titleIcons?: (string | TagRenderingConfigJson)[] | ["defaults"]

    /**
     * Visualisation of the items on the map
     */
    mapRendering:
        | null
        | (
              | PointRenderingConfigJson
              | LineRenderingConfigJson
              | RewritableConfigJson<
                    | LineRenderingConfigJson
                    | PointRenderingConfigJson
                    | LineRenderingConfigJson[]
                    | PointRenderingConfigJson[]
                >
          )[]

    /**
     * If set, this layer will pass all the features it receives onto the next layer.
     * This is ideal for decoration, e.g. directionss on cameras
     */
    passAllFeatures?: boolean

    /**
     * Presets for this layer.
     * A preset shows up when clicking the map on a without data (or when right-clicking/long-pressing);
     * it will prompt the user to add a new point.
     *
     * The most important aspect are the tags, which define which tags the new point will have;
     * The title is shown in the dialog, along with the first sentence of the description.
     *
     * Upon confirmation, the full description is shown beneath the buttons - perfect to add pictures and examples.
     *
     * Note: the icon of the preset is determined automatically based on the tags and the icon above. Don't worry about that!
     * NB: if no presets are defined, the popup to add new points doesn't show up at all
     */
    presets?: {
        /**
         * The title - shown on the 'add-new'-button.
         *
         * This should include the article of the noun, e.g. 'a hydrant', 'a bicycle pump'.
         * This text will be inserted into `Add {category} here`, becoming `Add a hydrant here`.
         *
         * Do _not_ indicate 'new': 'add a new shop here' is incorrect, as the shop might have existed forever, it could just be unmapped!
         */
        title: string | Record<string, string>
        /**
         * The tags to add. It determines the icon too
         */
        tags: string[]
        /**
         * The _first sentence_ of the description is shown on the button of the `add` menu.
         * The full description is shown in the confirmation dialog.
         *
         * (The first sentence is until the first '.'-character in the description)
         */
        description?: string | Record<string, string>

        /**
         * Example images, which show real-life pictures of what such a feature might look like
         *
         * Type: image
         */
        exampleImages?: string[]

        /**
         * If specified, these layers will be shown to and the new point will be snapped towards it
         */
        snapToLayer?: string | string[]
        /**
         * If specified, a new point will only be snapped if it is within this range.
         * Distance in meter
         *
         * Default: 10
         */
        maxSnapDistance?: number
    }[]

    /**
     * All the tag renderings.
     * A tag rendering is a block that either shows the known value or asks a question.
     *
     * Refer to the class `TagRenderingConfigJson` to see the possibilities.
     *
     * Note that we can also use a string here - where the string refers to a tag rendering defined in `assets/questions/questions.json`,
     * where a few very general questions are defined e.g. website, phone number, ...
     * Furthermore, _all_ the questions of another layer can be reused with `otherlayer.*`
     * If you need only a single of the tagRenderings, use `otherlayer.tagrenderingId`
     * If one or more questions have a 'group' or 'label' set, select all the entries with the corresponding group or label with `otherlayer.*group`
     * Remark: if a tagRendering is 'lent' from another layer, the 'source'-tags are copied and added as condition.
     * If they are not wanted, remove them with an override
     *
     * A special value is 'questions', which indicates the location of the questions box. If not specified, it'll be appended to the bottom of the featureInfobox.
     *
     * At last, one can define a group of renderings where parts of all strings will be replaced by multiple other strings.
     * This is mainly create questions for a 'left' and a 'right' side of the road.
     * These will be grouped and questions will be asked together
     */
    tagRenderings?: (
        | string
        | {
              id?: string
              builtin: string | string[]
              override: Partial<QuestionableTagRenderingConfigJson>
          }
        | QuestionableTagRenderingConfigJson
        | (RewritableConfigJson<
              (
                  | string
                  | { builtin: string; override: Partial<QuestionableTagRenderingConfigJson> }
                  | QuestionableTagRenderingConfigJson
              )[]
          > & { id: string })
    )[]

    /**
     * All the extra questions for filtering.
     * If a string is given, mapComplete will search in 'filters.json' for the appropriate filter or will try to parse it as `layername.filterid` and us that one
     */
    filter?: (FilterConfigJson | string)[] | { sameAs: string }

    /**
     * This block defines under what circumstances the delete dialog is shown for objects of this layer.
     * If set, a dialog is shown to the user to (soft) delete the point.
     * The dialog is built to be user friendly and to prevent mistakes.
     * If deletion is not possible, the dialog will hide itself and show the reason of non-deletability instead.
     *
     * To configure, the following values are possible:
     *
     * - false: never ever show the delete button
     * - true: show the default delete button
     * - undefined: use the mapcomplete default to show deletion or not. Currently, this is the same as 'false' but this will change in the future
     * - or: a hash with options (see below)
     *
     *  The delete dialog
     *  =================
     *
     *
     *
     #### Hard deletion if enough experience

     A feature can only be deleted from OpenStreetMap by mapcomplete if:

     - It is a node
     - No ways or relations use the node
     - The logged-in user has enough experience OR the user is the only one to have edited the point previously
     - The logged-in user has no unread messages (or has a ton of experience)
     - The user did not select one of the 'non-delete-options' (see below)

     In all other cases, a 'soft deletion' is used.

     #### Soft deletion

     A 'soft deletion' is when the point isn't deleted from OSM but retagged so that it'll won't how up in the mapcomplete theme anymore.
     This makes it look like it was deleted, without doing damage. A fixme will be added to the point.

     Note that a soft deletion is _only_ possible if these tags are provided by the theme creator, as they'll be different for every theme

     #### No-delete options

     In some cases, the contributor might want to delete something for the wrong reason (e.g. someone who wants to have a path removed "because the path is on their private property").
     However, the path exists in reality and should thus be on OSM - otherwise the next contributor will pass by and notice "hey, there is a path missing here! Let me redraw it in OSM!)

     The correct approach is to retag the feature in such a way that it is semantically correct *and* that it doesn't show up on the theme anymore.
     A no-delete option is offered as 'reason to delete it', but secretly retags.

     */
    deletion?: boolean | DeleteConfigJson

    /**
     * Indicates if a point can be moved and configures the modalities.
     *
     * A feature can be moved by MapComplete if:
     *
     * - It is a point
     * - The point is _not_ part of a way or a a relation.
     *
     * Off by default. Can be enabled by setting this flag or by configuring.
     */
    allowMove?: boolean | MoveConfigJson

    /**
     * If set, a 'split this way' button is shown on objects rendered as LineStrings, e.g. highways.
     *
     * If the way is part of a relation, MapComplete will attempt to update this relation as well
     */
    allowSplit?: boolean

    /**
     * @see UnitConfigJson
     */
    units?: UnitConfigJson[]

    /**
     * If set, synchronizes whether or not this layer is enabled.
     *
     * no: Do not sync at all, always revert to default
     * local: keep selection on local storage
     * theme-only: sync via OSM, but this layer will only be toggled in this theme
     * global: all layers with this ID will be synced accross all themes
     */
    syncSelection?: "no" | "local" | "theme-only" | "global"

    /**
     * Used for comments and/or to disable some checks
     *
     * no-question-hint-check: disables a check in MiscTagRenderingChecks which complains about 'div', 'span' or 'class=subtle'-HTML elements in the tagRendering
     */
    "#"?: string | "no-question-hint-check"

    /**
     * If set, open the selectedElementView in a floatOver instead of on the right
     */
    popupInFloatover?: boolean

    /**
     * _Set automatically by MapComplete, please ignore_
     */
    fullNodeDatabase?: boolean
}