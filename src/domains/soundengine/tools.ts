import { z } from "zod/v4";
import { createWaapiStubTool } from "../../lib/toolFactory.js";
import type { ToolDefinition } from "../../registry/types.js";

/**
 * 运行时音频引擎工具（ak.soundengine.*）。
 * 这些工具直接操作游戏引擎中的音频对象、事件和 RTPC 值，
 * 均为高风险操作且需要 WAAPI 连接。
 */
/** GUID 字符串、唯一名称字符串或 Short ID 整数（soundEngineObjectArg）。 */
const seObj = z.union([z.string(), z.number().int()]);
const seObjJson = { oneOf: [{ type: "string" }, { type: "integer" }] };
/** 游戏对象 ID（uint64 number）。 */
const gameObj = z.number();
/** 三维向量 { x, y, z }。 */
const vec3 = z.object({ x: z.number(), y: z.number(), z: z.number() });
const vec3Json = { type: "object", properties: { x: { type: "number" }, y: { type: "number" }, z: { type: "number" } }, required: ["x", "y", "z"] };
/** 3D 空间变换（orientationFront, orientationTop, position 各为 vec3）。 */
const transform3D = z.object({ orientationFront: vec3, orientationTop: vec3, position: vec3 });
const transform3DJson = {
  type: "object",
  properties: { orientationFront: vec3Json, orientationTop: vec3Json, position: vec3Json },
  required: ["orientationFront", "orientationTop", "position"]
};

export function getSoundengineTools(): ToolDefinition[] {
  return [
    createWaapiStubTool({
      name: "ak.soundengine.postEvent",
      title: "Post Event",
      description: "Post a sound event to the runtime sound engine.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "events"],
      examples: [{ title: "Post an event", input: { event: "Play_Footstep", gameObject: 1001 } }],
      inputSchema: { event: seObj, gameObject: gameObj, playingId: z.number().int().optional() },
      inputSchemaJson: {
        type: "object",
        properties: { event: seObjJson, gameObject: { type: "number" }, playingId: { type: "integer" }, options: {} },
        required: ["event", "gameObject"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.executeActionOnEvent",
      title: "Execute Action on Event",
      description: "Execute an action on all nodes referenced in a Play-type event. actionType: 0=Stop,1=Pause,2=Resume,3=Break,4=ReleaseEnvelope. fadeCurve: 0-9.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "events"],
      examples: [{ title: "Stop from event with fade", input: { event: "Play_Music", actionType: 0, gameObject: 64, transitionDuration: 500, fadeCurve: 4 } }],
      inputSchema: {
        event: seObj,
        actionType: z.number().int().min(0).max(4),
        gameObject: gameObj,
        transitionDuration: z.number().int(),
        fadeCurve: z.number().int().min(0).max(9)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          event: seObjJson, actionType: { type: "integer", minimum: 0, maximum: 4 },
          gameObject: { type: "number" }, transitionDuration: { type: "integer" },
          fadeCurve: { type: "integer", minimum: 0, maximum: 9 }, options: {}
        },
        required: ["event", "actionType", "gameObject", "transitionDuration", "fadeCurve"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.getState",
      title: "Get State",
      description: "Get the current state of a State Group.",
      domain: "soundengine",
      risk: "low",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "states"],
      examples: [{ title: "Query music state group", input: { stateGroup: "Music_State" } }],
      inputSchema: { stateGroup: z.string() },
      inputSchemaJson: {
        type: "object",
        properties: { stateGroup: { type: "string" }, options: {} },
        required: ["stateGroup"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.getSwitch",
      title: "Get Switch",
      description: "Get the current state of a Switch Group on a game object.",
      domain: "soundengine",
      risk: "low",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "switches"],
      examples: [{ title: "Query surface switch", input: { switchGroup: "Surface_Type", gameObject: 1001 } }],
      inputSchema: { switchGroup: z.string(), gameObject: gameObj.optional() },
      inputSchemaJson: {
        type: "object",
        properties: { switchGroup: { type: "string" }, gameObject: { type: "number" }, options: {} },
        required: ["switchGroup"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.loadBank",
      title: "Load SoundBank",
      description: "Load a SoundBank into the runtime sound engine.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "banks"],
      examples: [{ title: "Load Init bank", input: { soundBank: "Init" } }],
      inputSchema: { soundBank: seObj },
      inputSchemaJson: {
        type: "object",
        properties: { soundBank: seObjJson, options: {} },
        required: ["soundBank"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.postMsgMonitor",
      title: "Post Monitor Message",
      description: "Post a message to the Profiler Capture Log for debugging.",
      domain: "soundengine",
      risk: "low",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "profiler"],
      examples: [{ title: "Log a checkpoint", input: { message: "Level loaded" } }],
      inputSchema: { message: z.string() },
      inputSchemaJson: {
        type: "object",
        properties: { message: { type: "string" }, options: {} },
        required: ["message"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.postTrigger",
      title: "Post Trigger",
      description: "Post a trigger to the sound engine to fire stinger events.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "triggers"],
      examples: [{ title: "Post a stinger", input: { trigger: "Music_Stinger", gameObject: 1001 } }],
      inputSchema: { trigger: seObj, gameObject: gameObj.optional() },
      inputSchemaJson: {
        type: "object",
        properties: { trigger: seObjJson, gameObject: { type: "number" }, options: {} },
        required: ["trigger"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.registerGameObj",
      title: "Register Game Object",
      description: "Register a game object in the runtime sound engine.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "game-object"],
      examples: [{ title: "Register player object", input: { gameObject: "Player", gameObjectId: 1001 } }],
      inputSchema: { gameObject: z.string().min(1), gameObjectId: z.number().int() },
      inputSchemaJson: {
        type: "object",
        properties: { gameObject: { type: "string", minLength: 1 }, gameObjectId: { type: "integer" }, options: {} },
        required: ["gameObject", "gameObjectId"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.resetRTPCValue",
      title: "Reset RTPC Value",
      description: "Reset an RTPC to its default value for a game object or globally.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "rtpc"],
      examples: [{ title: "Reset RTPC for player", input: { rtpc: "Player_Speed", gameObject: 1001 } }],
      inputSchema: { rtpc: seObj, gameObject: gameObj.optional() },
      inputSchemaJson: {
        type: "object",
        properties: { rtpc: seObjJson, gameObject: { type: "number" }, options: {} },
        required: ["rtpc"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.seekOnEvent",
      title: "Seek on Event",
      description: "Seek to position (ms) or percent (0-1) on all sounds started by an active event. playingId 0 targets all.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "events"],
      examples: [{ title: "Seek to 5 seconds", input: { event: "Play_Music", gameObject: 64, position: 5000, seekToNearestMarker: false, playingId: 0 } }],
      inputSchema: {
        event: seObj,
        gameObject: gameObj,
        position: z.number().int().optional(),
        percent: z.number().min(0).max(1).optional(),
        seekToNearestMarker: z.boolean(),
        playingId: z.number().int().min(0)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          event: seObjJson, gameObject: { type: "number" },
          position: { type: "integer" }, percent: { type: "number", minimum: 0, maximum: 1 },
          seekToNearestMarker: { type: "boolean" }, playingId: { type: "integer", minimum: 0 }, options: {}
        },
        required: ["event", "gameObject", "seekToNearestMarker", "playingId"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setDefaultListeners",
      title: "Set Default Listeners",
      description: "Set the default listeners for game objects without an explicit listener assignment.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "listeners"],
      examples: [{ title: "Set one default listener", input: { listeners: [0] } }],
      inputSchema: { listeners: z.array(gameObj) },
      inputSchemaJson: {
        type: "object",
        properties: { listeners: { type: "array", items: { type: "number" } }, options: {} },
        required: ["listeners"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setGameObjectAuxSendValues",
      title: "Set Aux Send Values",
      description: "Set auxiliary send values for a game object (max 4 entries).",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "aux"],
      examples: [{ title: "Set reverb send", input: { gameObject: 1001, auxSendValues: [{ listener: 0, auxBus: "ReverbBus", controlValue: 0.5 }] } }],
      inputSchema: {
        gameObject: gameObj,
        auxSendValues: z.array(z.object({ listener: gameObj, auxBus: seObj, controlValue: z.number().min(0).max(1) })).max(4)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          gameObject: { type: "number" },
          auxSendValues: { type: "array", maxItems: 4, items: { type: "object", properties: { listener: { type: "number" }, auxBus: seObjJson, controlValue: { type: "number", minimum: 0, maximum: 1 } }, required: ["listener", "auxBus", "controlValue"] } },
          options: {}
        },
        required: ["gameObject", "auxSendValues"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setGameObjectOutputBusVolume",
      title: "Set Output Bus Volume",
      description: "Set the output bus volume between an emitter and a listener game object.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "volume"],
      examples: [{ title: "Reduce emitter volume", input: { emitter: 1001, listener: 0, controlValue: 0.8 } }],
      inputSchema: { emitter: gameObj, listener: gameObj, controlValue: z.number() },
      inputSchemaJson: {
        type: "object",
        properties: { emitter: { type: "number" }, listener: { type: "number" }, controlValue: { type: "number" }, options: {} },
        required: ["emitter", "listener", "controlValue"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setListeners",
      title: "Set Listeners",
      description: "Assign listeners to a specific emitter game object.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "listeners"],
      examples: [{ title: "Assign listener to emitter", input: { emitter: 1001, listeners: [0] } }],
      inputSchema: { emitter: gameObj, listeners: z.array(gameObj) },
      inputSchemaJson: {
        type: "object",
        properties: { emitter: { type: "number" }, listeners: { type: "array", items: { type: "number" } }, options: {} },
        required: ["emitter", "listeners"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setListenerSpatialization",
      title: "Set Listener Spatialization",
      description: "Enable/disable spatialization for a listener and optionally set per-speaker volume offsets (dB).",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "listeners", "spatialization"],
      examples: [{ title: "Enable spatialization", input: { listener: 0, spatialized: true, channelConfig: 3, volumeOffsets: [0, 0] } }],
      inputSchema: {
        listener: gameObj,
        spatialized: z.boolean(),
        channelConfig: z.number().int().min(0),
        volumeOffsets: z.array(z.number())
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          listener: { type: "number" }, spatialized: { type: "boolean" },
          channelConfig: { type: "integer", minimum: 0 }, volumeOffsets: { type: "array", items: { type: "number" } }, options: {}
        },
        required: ["listener", "spatialized", "channelConfig", "volumeOffsets"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setMultiplePositions",
      title: "Set Multiple Positions",
      description: "Assign multiple 3D positions to a game object. multiPositionType: 0=MultiDirections,1=MultiSources,2=SingleSource.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "position", "spatialization"],
      examples: [{ title: "Set two source positions", input: { gameObject: 1001, positions: [{ position: { orientationFront: { x: 0, y: 0, z: -1 }, orientationTop: { x: 0, y: 1, z: 0 }, position: { x: 1, y: 0, z: 0 } } }], multiPositionType: 1 } }],
      inputSchema: {
        gameObject: gameObj,
        positions: z.array(z.object({ position: transform3D })),
        multiPositionType: z.number().int().min(0).max(2)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          gameObject: { type: "number" },
          positions: { type: "array", items: { type: "object", properties: { position: transform3DJson }, required: ["position"] } },
          multiPositionType: { type: "integer", minimum: 0, maximum: 2 }, options: {}
        },
        required: ["gameObject", "positions", "multiPositionType"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setObjectObstructionAndOcclusion",
      title: "Set Obstruction and Occlusion",
      description: "Set obstruction (0-1) and occlusion (0-1) levels between an emitter and a listener.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "occlusion"],
      examples: [{ title: "Half-occluded object", input: { emitter: 1001, listener: 0, obstructionLevel: 0.3, occlusionLevel: 0.5 } }],
      inputSchema: {
        emitter: gameObj, listener: gameObj,
        obstructionLevel: z.number().min(0).max(1), occlusionLevel: z.number().min(0).max(1)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          emitter: { type: "number" }, listener: { type: "number" },
          obstructionLevel: { type: "number", minimum: 0, maximum: 1 },
          occlusionLevel: { type: "number", minimum: 0, maximum: 1 }, options: {}
        },
        required: ["emitter", "listener", "obstructionLevel", "occlusionLevel"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setPosition",
      title: "Set Position",
      description: "Set the 3D world-space position of a game object.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "position"],
      examples: [{ title: "Place at origin", input: { gameObject: 1001, position: { orientationFront: { x: 0, y: 0, z: -1 }, orientationTop: { x: 0, y: 1, z: 0 }, position: { x: 0, y: 0, z: 0 } } } }],
      inputSchema: { gameObject: gameObj, position: transform3D },
      inputSchemaJson: {
        type: "object",
        properties: { gameObject: { type: "number" }, position: transform3DJson, options: {} },
        required: ["gameObject", "position"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setRTPCValue",
      title: "Set RTPC Value",
      description: "Set a runtime RTPC value for a game object or globally.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "rtpc"],
      examples: [{ title: "Set speed RTPC", input: { rtpc: "Player_Speed", value: 12.5, gameObject: 1001 } }],
      inputSchema: { rtpc: seObj, value: z.number(), gameObject: gameObj.optional() },
      inputSchemaJson: {
        type: "object",
        properties: { rtpc: seObjJson, value: { type: "number" }, gameObject: { type: "number" }, options: {} },
        required: ["rtpc", "value"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setScalingFactor",
      title: "Set Scaling Factor",
      description: "Scale the attenuation radius of a game object (1.0=100%, 2.0=200%).",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "attenuation"],
      examples: [{ title: "Double attenuation radius", input: { gameObject: 1001, attenuationScalingFactor: 2.0 } }],
      inputSchema: { gameObject: gameObj, attenuationScalingFactor: z.number().positive() },
      inputSchemaJson: {
        type: "object",
        properties: { gameObject: { type: "number" }, attenuationScalingFactor: { type: "number", exclusiveMinimum: 0 }, options: {} },
        required: ["gameObject", "attenuationScalingFactor"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setState",
      title: "Set State",
      description: "Set the active state in a State Group.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "states"],
      examples: [{ title: "Switch music to combat", input: { stateGroup: "Music_State", state: "Combat" } }],
      inputSchema: { stateGroup: seObj, state: seObj },
      inputSchemaJson: {
        type: "object",
        properties: { stateGroup: seObjJson, state: seObjJson, options: {} },
        required: ["stateGroup", "state"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.setSwitch",
      title: "Set Switch",
      description: "Set a Switch state on a game object.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "switches"],
      examples: [{ title: "Set surface to grass", input: { switchGroup: "Surface_Type", switchState: "Grass", gameObject: 1001 } }],
      inputSchema: { switchGroup: seObj, switchState: seObj, gameObject: gameObj.optional() },
      inputSchemaJson: {
        type: "object",
        properties: { switchGroup: seObjJson, switchState: seObjJson, gameObject: { type: "number" }, options: {} },
        required: ["switchGroup", "switchState"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.stopAll",
      title: "Stop All",
      description: "Stop all sounds on a game object.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "events"],
      examples: [{ title: "Stop all on player", input: { gameObject: 1001 } }],
      inputSchema: { gameObject: gameObj },
      inputSchemaJson: {
        type: "object",
        properties: { gameObject: { type: "number" }, options: {} },
        required: ["gameObject"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.stopPlayingID",
      title: "Stop Playing ID",
      description: "Stop a specific playing ID with an optional fade. fadeCurve: 0-9 AkCurveInterpolation.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "events"],
      examples: [{ title: "Fade out a playing event", input: { playingId: 12345, transitionDuration: 1000, fadeCurve: 4 } }],
      inputSchema: {
        playingId: z.number().int().min(0),
        transitionDuration: z.number().int(),
        fadeCurve: z.number().int().min(0).max(9)
      },
      inputSchemaJson: {
        type: "object",
        properties: {
          playingId: { type: "integer", minimum: 0 }, transitionDuration: { type: "integer" },
          fadeCurve: { type: "integer", minimum: 0, maximum: 9 }, options: {}
        },
        required: ["playingId", "transitionDuration", "fadeCurve"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.unloadBank",
      title: "Unload SoundBank",
      description: "Unload a SoundBank from the runtime sound engine.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "banks"],
      examples: [{ title: "Unload level bank", input: { soundBank: "Level01" } }],
      inputSchema: { soundBank: seObj },
      inputSchemaJson: {
        type: "object",
        properties: { soundBank: seObjJson, options: {} },
        required: ["soundBank"],
        additionalProperties: false
      }
    }),
    createWaapiStubTool({
      name: "ak.soundengine.unregisterGameObj",
      title: "Unregister Game Object",
      description: "Unregister a game object from the runtime sound engine.",
      domain: "soundengine",
      risk: "high",
      permissions: ["waapi:runtime"],
      tags: ["waapi", "runtime", "game-object"],
      examples: [{ title: "Unregister on death", input: { gameObject: 1001 } }],
      inputSchema: { gameObject: gameObj },
      inputSchemaJson: {
        type: "object",
        properties: { gameObject: { type: "number" }, options: {} },
        required: ["gameObject"],
        additionalProperties: false
      }
    })
  ];
}