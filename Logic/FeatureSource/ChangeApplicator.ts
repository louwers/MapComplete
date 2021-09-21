import FeatureSource, {IndexedFeatureSource} from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import {Changes} from "../Osm/Changes";
import {ChangeDescription} from "../Osm/Actions/ChangeDescription";
import {Utils} from "../../Utils";
import {OsmNode, OsmRelation, OsmWay} from "../Osm/OsmObject";

/**
 * A feature source containing exclusively new elements
 */
export class NewGeometryChangeApplicatorFeatureSource implements FeatureSource{
    
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name: string = "newFeatures";
    constructor(changes: Changes) {
        const seenChanges = new Set<ChangeDescription>();
        changes.pendingChanges.addCallbackAndRunD(changes => {
            for (const change of changes) {
                if(seenChanges.has(change)){
                    continue
                }
                seenChanges.add(change)
                
                if(change.id < 0){
                    // This is a new object!
                }
                
            }
        })
    }

}

/**
 * Applies changes from 'Changes' onto a featureSource
 */
export default class ChangeApplicator implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name: string;
    private readonly source: IndexedFeatureSource;
    private readonly changes: Changes;
    private readonly mode?: {
        generateNewGeometries: boolean
    };

    constructor(source: IndexedFeatureSource, changes: Changes, mode?: {
        generateNewGeometries: boolean
    }) {
        this.source = source;
        this.changes = changes;
        this.mode = mode;

        this.name = "ChangesApplied(" + source.name + ")"
        this.features = source.features
        const seenChanges = new Set<ChangeDescription>();
        const self = this;
        let runningUpdate = false;
        source.features.addCallbackAndRunD(features => {
            if (runningUpdate) {
                return; // No need to ping again
            }
            self.ApplyChanges()
            seenChanges.clear()
        })

        changes.pendingChanges.addCallbackAndRunD(changes => {
            runningUpdate = true;
            changes = changes.filter(ch => !seenChanges.has(ch))
            changes.forEach(c => seenChanges.add(c))
            self.ApplyChanges()
            source.features.ping()
            runningUpdate = false;
        })
    }


    /**
     * Returns true if the geometry is changed and the source should be pinged
     */
    private ApplyChanges(): boolean {
        const cs = this.changes.pendingChanges.data
        const features = this.source.features.data
        const loadedIds = this.source.containedIds
        if (cs.length === 0 || features === undefined) {
            return;
        }

        console.log("Applying changes ", this.name, cs)
        let geometryChanged = false;
        const changesPerId: Map<string, ChangeDescription[]> = new Map<string, ChangeDescription[]>()
        for (const c of cs) {
            const id = c.type + "/" + c.id
            if (!loadedIds.has(id)) {
                continue
            }
            if (!changesPerId.has(id)) {
                changesPerId.set(id, [])
            }
            changesPerId.get(id).push(c)
        }
        if (changesPerId.size === 0) {
            // The current feature source set doesn't contain any changed feature, so we can safely skip
            return;
        }

        const now = new Date()

        function add(feature) {
            feature.id = feature.properties.id
            features.push({
                feature: feature,
                freshness: now
            })
            console.log("Added a new feature: ", feature)
            geometryChanged = true;
        }

        // First, create the new features - they have a negative ID
        // We don't set the properties yet though
        if (this.mode?.generateNewGeometries) {
            changesPerId.forEach(cs => {
                cs
                    .forEach(change => {
                        if (change.id >= 0) {
                            return; // Nothing to do here, already created
                        }

                        if (change.changes === undefined) {
                            // An update to the object - not the actual created
                            return;
                        }

                        try {

                            switch (change.type) {
                                case "node":
                                    const n = new OsmNode(change.id)
                                    n.lat = change.changes["lat"]
                                    n.lon = change.changes["lon"]
                                    const geojson = n.asGeoJson()
                                    add(geojson)
                                    break;
                                case "way":
                                    const w = new OsmWay(change.id)
                                    w.nodes = change.changes["nodes"]
                                    add(w.asGeoJson())
                                    break;
                                case "relation":
                                    const r = new OsmRelation(change.id)
                                    r.members = change.changes["members"]
                                    add(r.asGeoJson())
                                    break;
                            }

                        } catch (e) {
                            console.error(e)
                        }
                    })
            })
        }

        for (const feature of features) {
            const f = feature.feature;
            const id = f.properties.id;
            if (!changesPerId.has(id)) {
                continue;
            }


            const changed = {}
            // Copy all the properties
            Utils.Merge(f, changed)
            // play the changes onto the copied object

            for (const change of changesPerId.get(id)) {
                for (const kv of change.tags ?? []) {
                    // Apply tag changes and ping the consumers
                    f.properties[kv.k] = kv.v;
                }

                // Apply other changes to the object
                if (change.changes !== undefined) {
                    geometryChanged = true;
                    switch (change.type) {
                        case "node":
                            // @ts-ignore
                            const coor: { lat, lon } = change.changes;
                            f.geometry.coordinates = [coor.lon, coor.lat]
                            break;
                        case "way":
                            f.geometry.coordinates = change.changes["locations"]
                            break;
                        case "relation":
                            console.error("Changes to relations are not yet supported")
                            break;
                    }
                }
            }
        }
        return geometryChanged
    }
}