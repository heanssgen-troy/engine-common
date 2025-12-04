import {create, type MessageInitShape} from "@bufbuild/protobuf"
import type {GenMessage} from "@bufbuild/protobuf/codegenv2";
import {event_name, Subject} from "./event_pb";
import {getOption} from "@bufbuild/protobuf";
import {type EngineMessage, EngineMessageSchema} from "./engine_pb";

import {
	EngineEventMapping,
	type EngineEventTypes,
	type EngineMessageTypes,
	type EngineRequestProtoMessageTypes
} from "@/types/event.types";
import {Identifiable} from "../types/identifier";

export interface EngineEvent {
    type: EngineEventTypes;
    data: EngineMessage
}

export type RequestTarget = {
	id: string;
	subject: Subject
}

export type RequestOptions = {
	targets: RequestTarget[]
}

export function createRequest<S extends EngineRequestProtoMessageTypes, C extends GenMessage<S>> (schema: GenMessage<S>, payload: MessageInitShape<C>, targets: RequestTarget[]) {
	return createEvent(schema, payload, null, {
		targets
	})
}

export function createEvent<S extends EngineMessageTypes, C extends GenMessage<S>>(schema: GenMessage<S>, payload: MessageInitShape<C>, source?: Identifiable, options?: RequestOptions): EngineEvent {
	const m = create(schema, payload);
	const name = getOption(schema, event_name);

	let type: string = schema.typeName;

	if (name) {
		type = name;
	}

	if (!name)
		throw new Error(`Invalid payload name ${name}. Have you specified option(event_name) in your protobuf?`)

	const mapping = EngineEventMapping[name as keyof EngineEventTypes];
	const namespace = mapping.namespace;

	const submessage = {}
	submessage[namespace] = {
		case: mapping.name,
		value: m
	}

	if (options && options.targets && namespace === 'request') {
		submessage['targets'] = options.targets;
	}

	const evt = create(EngineMessageSchema, {
		desc: {
			id: source?.id ?? ''
		},
		payload: {
			case: namespace,
			value: create(mapping.parent, submessage)
		}
	})

	return {
		data: evt,
		type: type as EngineEventTypes
	}
}
