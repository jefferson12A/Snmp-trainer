/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SNMPDevice {
  ip: string;
  name: string;
  type: 'router' | 'server' | 'switch' | 'printer';
  sysDescr: string;
  sysObjectID: string;
  sysContact: string;
  sysName: string;
  sysLocation: string;
  sysServices: number;
  interfaces: {
    id: number;
    descr: string;
    type: string;
    status: 'up' | 'down';
    speed: string;
  }[];
  ipForwarding: number;
  ipInReceives: number;
}

export interface MIBNode {
  oid: string;
  name: string;
  description: string;
  syntax: string;
  access: 'Read-Only' | 'Read-Write' | 'No-Access';
  children?: string[]; // IDs of children
  parent?: string;
}

export interface SNMPCommand {
  id: string;
  name: string;
  description: string;
  suggestedOid: string;
  oidDescription: string;
  helpText: string;
}

export interface LabProgress {
  id: string;
  title: string;
  objective: string;
  instructions: string;
  hint: string;
  targetDeviceIp: string;
  requiredCommand: string;
  requiredOid: string;
  requiredCommunity?: string;
  requiredValue?: string;
  requiredVersion?: string;
  completed: boolean;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'info' | 'input' | 'output' | 'error' | 'success';
  text: string;
}
