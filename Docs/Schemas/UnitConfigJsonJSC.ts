export default {
  "type": "object",
  "properties": {
    "appliesToKey": {
      "description": "Every key from this list will be normalized",
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "eraseInvalidValues": {
      "description": "If set, invalid values will be erased in the MC application (but not in OSM of course!)\nBe careful with setting this",
      "type": "boolean"
    },
    "applicableUnits": {
      "description": "The possible denominations",
      "type": "array",
      "items": {
        "$ref": "#/definitions/ApplicableUnitJson"
      }
    }
  },
  "required": [
    "applicableUnits",
    "appliesToKey"
  ],
  "definitions": {
    "TagConfigJson": {
      "description": "The main representation of Tags.\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation",
      "anyOf": [
        {
          "$ref": "#/definitions/AndTagConfigJson"
        },
        {
          "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation",
          "type": "object",
          "properties": {
            "or": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/TagConfigJson"
              }
            }
          },
          "required": [
            "or"
          ]
        },
        {
          "type": "string"
        }
      ]
    },
    "AndTagConfigJson": {
      "description": "Chain many tags, to match, a single of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation",
      "type": "object",
      "properties": {
        "and": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/TagConfigJson"
          }
        }
      },
      "required": [
        "and"
      ]
    },
    "OrTagConfigJson": {
      "description": "Chain many tags, to match, all of these should be true\nSee https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation",
      "type": "object",
      "properties": {
        "or": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/TagConfigJson"
          }
        }
      },
      "required": [
        "or"
      ]
    },
    "ApplicableUnitJson": {
      "type": "object",
      "properties": {
        "canonicalDenomination": {
          "description": "The canonical value which will be added to the value in OSM.\ne.g. \"m\" for meters\nIf the user inputs '42', the canonical value will be added and it'll become '42m'.\n\nImportant: often, _no_ canonical values are expected, e.g. in the case of 'maxspeed' where 'km/h' is the default.\nIn this case, an empty string should be used",
          "type": "string"
        },
        "canonicalDenominationSingular": {
          "description": "The canonical denomination in the case that the unit is precisely '1'",
          "type": "string"
        },
        "alternativeDenomination": {
          "description": "A list of alternative values which can occur in the OSM database - used for parsing.",
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "human": {
          "description": "The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g.\n{\n    \"en\": \"meter\",\n    \"fr\": \"metre\"\n}"
        },
        "humanSingular": {
          "description": "The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g.\n{\n    \"en\": \"minute\",\n    \"nl\": \"minuut\"x²\n}"
        },
        "prefix": {
          "description": "If set, then the canonical value will be prefixed instead, e.g. for '€'\nNote that if all values use 'prefix', the dropdown might move to before the text field",
          "type": "boolean"
        },
        "default": {
          "description": "The default interpretation - only one can be set.\nIf none is set, the first unit will be considered the default interpretation of a value without a unit",
          "type": "boolean"
        }
      },
      "required": [
        "canonicalDenomination"
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}