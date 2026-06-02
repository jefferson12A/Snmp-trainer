/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SNMPDevice, MIBNode, SNMPCommand, LabProgress } from './types';

// Static Devices in the simulated network subnet 192.168.1.0/24
export const INITIAL_DEVICES: SNMPDevice[] = [
  {
    ip: '192.168.1.1',
    name: 'router-edge-sp',
    type: 'router',
    sysDescr: 'Linux router-edge-sp 5.15.0-x86_64 #1 SMP Mon Oct 23 10:14:15 UTC 2026',
    sysObjectID: '.1.3.6.1.4.1.9.1.1',
    sysContact: 'suporte@empresa.com',
    sysName: 'router-edge-sp',
    sysLocation: 'Datacenter Sao Paulo - Rack A4',
    sysServices: 78,
    interfaces: [
      { id: 1, descr: 'lo', type: 'softwareLoopback', status: 'up', speed: '10 Mbps' },
      { id: 2, descr: 'eth0 - Link WAN (Fibra)', type: 'ethernetCsmacd', status: 'up', speed: '1 Gbps' },
      { id: 3, descr: 'eth1 - LAN Gateway', type: 'ethernetCsmacd', status: 'up', speed: '1 Gbps' },
      { id: 4, descr: 'tun0 - IPSec VPN Filial', type: 'tunnel', status: 'down', speed: '100 Mbps' }
    ],
    ipForwarding: 1, // forwarding
    ipInReceives: 412952 // total received IP counter
  },
  {
    ip: '192.168.1.10',
    name: 'srv-web-production',
    type: 'server',
    sysDescr: 'Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-87-generic x86_64)',
    sysObjectID: '.1.3.6.1.4.1.8072.3.2.10',
    sysContact: 'admin-web@empresa.com',
    sysName: 'srv-web-production',
    sysLocation: 'Nuvem Privada - Cluster K8s Local',
    sysServices: 72,
    interfaces: [
      { id: 1, descr: 'lo', type: 'softwareLoopback', status: 'up', speed: '10 Mbps' },
      { id: 2, descr: 'eth0', type: 'ethernetCsmacd', status: 'up', speed: '10 Gbps' }
    ],
    ipForwarding: 2, // not forwarding
    ipInReceives: 18451800
  },
  {
    ip: '192.168.1.50',
    name: 'sw-core-floor2',
    type: 'switch',
    sysDescr: 'Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE4',
    sysObjectID: '.1.3.6.1.4.1.9.1.516',
    sysContact: 'infra@empresa.com',
    sysName: 'sw-core-floor2',
    sysLocation: 'Armario de Rede - Bloco B Piso 2',
    sysServices: 3,
    interfaces: [
      { id: 1, descr: 'GigabitEthernet0/1 (Trunk)', type: 'ethernetCsmacd', status: 'up', speed: '1 Gbps' },
      { id: 2, descr: 'GigabitEthernet0/2 (Server Stack)', type: 'ethernetCsmacd', status: 'up', speed: '1 Gbps' },
      { id: 3, descr: 'GigabitEthernet0/3 (Admin PC)', type: 'ethernetCsmacd', status: 'up', speed: '1 Gbps' },
      { id: 4, descr: 'GigabitEthernet0/4 (Access Point)', type: 'ethernetCsmacd', status: 'down', speed: '1 Gbps' }
    ],
    ipForwarding: 2,
    ipInReceives: 9540301
  },
  {
    ip: '192.168.1.100',
    name: 'prt-color-marketing',
    type: 'printer',
    sysDescr: 'HP LaserJet Pro MFP M428fdw - Firmware v20251102',
    sysObjectID: '.1.3.6.1.4.1.11.2.3.9',
    sysContact: 'suporte-ti@empresa.com',
    sysName: 'prt-color-marketing',
    sysLocation: 'Sala do Marketing - Terreo',
    sysServices: 76,
    interfaces: [
      { id: 1, descr: 'eth0', type: 'ethernetCsmacd', status: 'up', speed: '100 Mbps' },
      { id: 2, descr: 'wlan0', type: 'ieee80211', status: 'down', speed: '54 Mbps' }
    ],
    ipForwarding: 2,
    ipInReceives: 4321
  }
];

// SNMP Commands
export const SNMP_COMMANDS: SNMPCommand[] = [
  {
    id: 'snmpget',
    name: 'snmpget',
    description: 'Consulta o valor de uma MIB específica. Exige o OID exato da instância.',
    suggestedOid: '.1.3.6.1.2.1.1.1.0',
    oidDescription: 'sysDescr (Descrição do sistema)',
    helpText: 'Usado para recuperar uma única instância de informação de um dispositivo. Exemplo: recuperar o nome ou localização de um roteador.'
  },
  {
    id: 'snmpwalk',
    name: 'snmpwalk',
    description: 'Executa uma série de comandos GETNEXT para percorrer toda uma sub-árvore da MIB.',
    suggestedOid: '.1.3.6.1.2.1.1',
    oidDescription: 'system (Grupo de sistema)',
    helpText: 'Percorre a árvore MIB e extrai recursively todas as instâncias abaixo da raiz indicada.'
  },
  {
    id: 'snmpset',
    name: 'snmpset',
    description: 'Permite alterar o valor de um objeto MIB no agente, caso ele tenha permissão de escrita.',
    suggestedOid: '.1.3.6.1.2.1.1.4.0',
    oidDescription: 'sysContact (Contato administrativo)',
    helpText: 'Modifica o valor de OIDs de escrita (Read-Write). Exige community com permissão de escrita (ex: private).'
  },
  {
    id: 'snmptrap',
    name: 'snmptrap',
    description: 'O Agente envia uma notificação não solicitada ao Manager sobre eventos críticos.',
    suggestedOid: '.1.3.6.1.6.3.1.1.5.3',
    oidDescription: 'linkDown (Falha de link físico)',
    helpText: 'Notificação assíncrona gerada espontaneamente do dispositivo para registrar incidentes graves.'
  },
  {
    id: 'snmpbulkget',
    name: 'snmpbulkget',
    description: 'Versão otimizada do SNMPv2c/v3 para buscar grandes volumes de dados de uma só vez.',
    suggestedOid: '.1.3.6.1.2.1.2.2.1.2',
    oidDescription: 'ifDescr (Nomes de interfaces de rede)',
    helpText: 'Minimiza mensagens de rede solicitando blocos inteiros em vez de múltiplos pacotes GET.'
  }
];

// Complete MIB Hierarchy Database for UI Interactive Browsing
export const MIB_NODES: Record<string, MIBNode> = {
  'root': { oid: '.', name: 'root', description: 'Nó principal do espaço de nomes', syntax: 'Nó Estrutural', access: 'No-Access', children: ['1'] },
  '1': { oid: '.1', name: 'iso', description: 'International Organization for Standardization', syntax: 'Nó Estrutural', access: 'No-Access', parent: 'root', children: ['1.3'] },
  '1.3': { oid: '.1.3', name: 'org', description: 'Subárvore de organizações parceiras', syntax: 'Nó Estrutural', access: 'No-Access', parent: '1', children: ['1.3.6'] },
  '1.3.6': { oid: '.1.3.6', name: 'dod', description: 'Department of Defense (EUA)', syntax: 'Nó Estrutural', access: 'No-Access', parent: '1.3', children: ['1.3.6.1'] },
  '1.3.6.1': { oid: '.1.3.6.1', name: 'internet', description: 'Subárvore designada para protocolos de rede internet', syntax: 'Nó Estrutural', access: 'No-Access', parent: '1.3.6', children: ['1.3.6.1.2', '1.3.6.1.4'] },
  '1.3.6.1.4': { oid: '.1.3.6.1.4', name: 'private', description: 'Nó para extensões privadas e empresariais', syntax: 'Nó Estrutural', access: 'No-Access', parent: '1.3.6.1', children: ['1.3.6.1.4.1'] },
  '1.3.6.1.4.1': { oid: '.1.3.6.1.4.1', name: 'enterprise', description: 'Identificação de fabricantes de rede (e.g., Cisco, HP, Net-SNMP)', syntax: 'Nó Estrutural', access: 'No-Access', parent: '1.3.6.1.4' },
  '1.3.6.1.2': { oid: '.1.3.6.1.2', name: 'mgmt', description: 'Subárvore de Gerenciamento da Internet padrão', syntax: 'Nó Estrutural', access: 'No-Access', parent: '1.3.6.1', children: ['1.3.6.1.2.1'] },
  '1.3.6.1.2.1': { oid: '.1.3.6.1.2.1', name: 'mib-2', description: 'Definições padrão de MIB da IETF (Management Information Base v2)', syntax: 'Nó Estrutural', access: 'No-Access', parent: '1.3.6.1.2', children: ['1.3.6.1.2.1.1', '1.3.6.1.2.1.2', '1.3.6.1.2.1.4'] },
  
  // system group (.1.3.6.1.2.1.1)
  '1.3.6.1.2.1.1': { oid: '.1.3.6.1.2.1.1', name: 'system', description: 'Grupo de informações de identificação do sistema e uptime', syntax: 'Nó Estrutural', access: 'No-Access', parent: '1.3.6.1.2.1', children: ['1.3.6.1.2.1.1.1.0', '1.3.6.1.2.1.1.2.0', '1.3.6.1.2.1.1.3.0', '1.3.6.1.2.1.1.4.0', '1.3.6.1.2.1.1.5.0', '1.3.6.1.2.1.1.6.0', '1.3.6.1.2.1.1.7.0'] },
  '1.3.6.1.2.1.1.1.0': { oid: '.1.3.6.1.2.1.1.1.0', name: 'sysDescr.0', description: 'Descrição textual completa do sistema operacional, hardware e compilação.', syntax: 'DisplayString (OCTET STRING)', access: 'Read-Only', parent: '1.3.6.1.2.1.1' },
  '1.3.6.1.2.1.1.2.0': { oid: '.1.3.6.1.2.1.1.2.0', name: 'sysObjectID.0', description: 'Identificador único do fabricante que define a MIB privada deste dispositivo específico.', syntax: 'OBJECT IDENTIFIER', access: 'Read-Only', parent: '1.3.6.1.2.1.1' },
  '1.3.6.1.2.1.1.3.0': { oid: '.1.3.6.1.2.1.1.3.0', name: 'sysUpTime.0', description: 'Tempo decorrido desde a última inicialização do serviço snmpd ou sistema em centésimos de segundo.', syntax: 'TimeTicks (32-bit)', access: 'Read-Only', parent: '1.3.6.1.2.1.1' },
  '1.3.6.1.2.1.1.4.0': { oid: '.1.3.6.1.2.1.1.4.0', name: 'sysContact.0', description: 'Informações de contato (e-mail, telefone) do administrador responsável por este nó.', syntax: 'DisplayString (OCTET STRING)', access: 'Read-Write', parent: '1.3.6.1.2.1.1' },
  '1.3.6.1.2.1.1.5.0': { oid: '.1.3.6.1.2.1.1.5.0', name: 'sysName.0', description: 'Nome de host configurado no sistema para este dispositivo gerenciado.', syntax: 'DisplayString (OCTET STRING)', access: 'Read-Write', parent: '1.3.6.1.2.1.1' },
  '1.3.6.1.2.1.1.6.0': { oid: '.1.3.6.1.2.1.1.6.0', name: 'sysLocation.0', description: 'Descrição da localização física do hardware dentro da infraestrutura física da rede.', syntax: 'DisplayString (OCTET STRING)', access: 'Read-Write', parent: '1.3.6.1.2.1.1' },
  '1.3.6.1.2.1.1.7.0': { oid: '.1.3.6.1.2.1.1.7.0', name: 'sysServices.0', description: 'Um valor que indica em quais camadas de rede (OSI 1-7) este dispositivo provê serviços primários.', syntax: 'INTEGER (0..127)', access: 'Read-Only', parent: '1.3.6.1.2.1.1' },

  // interfaces group (.1.3.6.1.2.1.2)
  '1.3.6.1.2.1.2': { oid: '.1.3.6.1.2.1.2', name: 'interfaces', description: 'Métricas e estado das placas de rede físicas e lógicas deste dispositivo.', syntax: 'Nó Estrutural', access: 'No-Access', parent: '1.3.6.1.2.1', children: ['1.3.6.1.2.1.2.1.0', '1.3.6.1.2.1.2.2.0'] },
  '1.3.6.1.2.1.2.1.0': { oid: '.1.3.6.1.2.1.2.1.0', name: 'ifNumber.0', description: 'Número total de interfaces de rede presentes neste dispositivo (sejam físicas ou virtuais).', syntax: 'INTEGER', access: 'Read-Only', parent: '1.3.6.1.2.1.2' },
  '1.3.6.1.2.1.2.2.0': { oid: '.1.3.6.1.2.1.2.2.0', name: 'ifTable', description: 'Tabela SNMP contendo dados adicionais de conexões, estados up/down, bytes trafegados e velocidades.', syntax: 'Table Structure', access: 'Read-Only', parent: '1.3.6.1.2.1.2', children: ['1.3.6.1.2.1.2.2.1.1.1', '1.3.6.1.2.1.2.2.1.2.1', '1.3.6.1.2.1.2.2.1.5.1', '1.3.6.1.2.1.2.2.1.8.1'] },
  '1.3.6.1.2.1.2.2.1.1.1': { oid: '.1.3.6.1.2.1.2.2.1.1.1', name: 'ifIndex.1', description: 'O índice numérico único identificando a primeira interface física do dispositivo.', syntax: 'INTEGER', access: 'Read-Only', parent: '1.3.6.1.2.1.2.2.0' },
  '1.3.6.1.2.1.2.2.1.2.1': { oid: '.1.3.6.1.2.1.2.2.1.2.1', name: 'ifDescr.1', description: 'A descrição nominal da primeira interface física, ex: GigabitEthernet0/0.', syntax: 'DisplayString (OCTET STRING)', access: 'Read-Only', parent: '1.3.6.1.2.1.2.2.0' },
  '1.3.6.1.2.1.2.2.1.5.1': { oid: '.1.3.6.1.2.1.2.2.1.5.1', name: 'ifSpeed.1', description: 'A velocidade de banda de tráfego nominal suportada pela primeira interface em bits/s.', syntax: 'Gauge32', access: 'Read-Only', parent: '1.3.6.1.2.1.2.2.0' },
  '1.3.6.1.2.1.2.2.1.8.1': { oid: '.1.3.6.1.2.1.2.2.1.8.1', name: 'ifOperStatus.1', description: 'O estado ativo mecânico operacional atual da interface: 1 para up e 2 para down.', syntax: 'INTEGER { up(1), down(2) }', access: 'Read-Only', parent: '1.3.6.1.2.1.2.2.0' },

  // ip group (.1.3.6.1.2.1.4)
  '1.3.6.1.2.1.4': { oid: '.1.3.6.1.2.1.4', name: 'ip', description: 'Roteamento e estatística do protocolo IP neste dispositivo gerenciado.', syntax: 'Nó Estrutural', access: 'No-Access', parent: '1.3.6.1.2.1', children: ['1.3.6.1.2.1.4.1.0', '1.3.6.1.2.1.4.3.0'] },
  '1.3.6.1.2.1.4.1.0': { oid: '.1.3.6.1.2.1.4.1.0', name: 'ipForwarding.0', description: 'Configurado como 1 se o nó atua encaminhando pacotes IP (Roteador), ou 2 se é apenas host de destino final.', syntax: 'INTEGER { forwarding(1), notForwarding(2) }', access: 'Read-Write', parent: '1.3.6.1.2.1.4' },
  '1.3.6.1.2.1.4.3.0': { oid: '.1.3.6.1.2.1.4.3.0', name: 'ipInReceives.0', description: 'Número total de datagramas IP recebidos das interfaces de rede, incluindo os recebidos com erro.', syntax: 'Counter32', access: 'Read-Only', parent: '1.3.6.1.2.1.4' }
};

// Labs for Academy Mode (Guided Tutorial)
export const TUTORIAL_LABS: LabProgress[] = [
  {
    id: 'lab1',
    title: 'Missao 1: Identificar o Sistema',
    objective: 'Consultar o SO do Roteador',
    instructions: 'Acesse o Simulador, selecione o comando "snmpget", selecione o agente "192.168.1.1 - router-edge-sp" e digite ou clique no OID sugerido ".1.3.6.1.2.1.1.1.0" (sysDescr) para identificar o sistema operacional.',
    hint: 'Verifique se usa a community string "public" com a versão SNMP v2c. Clique no botão "Executar Comando".',
    targetDeviceIp: '192.168.1.1',
    requiredCommand: 'snmpget',
    requiredOid: '.1.3.6.1.2.1.1.1.0',
    requiredCommunity: 'public',
    completed: false
  },
  {
    id: 'lab2',
    title: 'Missao 2: Descobrir o Tempo Ativo (Uptime)',
    objective: 'Coletar o Uptime do Switch Principal',
    instructions: 'Os switches críticos devem ter alta disponibilidade. Selecione o comando "snmpget", o agente "192.168.1.50 - sw-core-floor2" e faça uma busca do OID ".1.3.6.1.2.1.1.3.0" para verificar por quantos dias ele está ligado.',
    hint: 'O OID ".1.3.6.1.2.1.1.3.0" corresponde ao sysUpTime. Mantenha a community string em "public".',
    targetDeviceIp: '192.168.1.50',
    requiredCommand: 'snmpget',
    requiredOid: '.1.3.6.1.2.1.1.3.0',
    requiredCommunity: 'public',
    completed: false
  },
  {
    id: 'lab3',
    title: 'Missao 3: Alterar Contato de Emergência',
    objective: 'Editar o sysContact do Roteador Core',
    instructions: 'Para alterar as informações do administrador no roteador sp, use o comando de escrita "snmpset". O OID correto é ".1.3.6.1.2.1.1.4.0". Para gravar dados, você DEVE alterar a community para "private" e preencher o campo com o valor "admin@suaempresa.com".',
    hint: 'Na sua requisição de snmpset, lembre-se de preencher a community "private" (permissão de escrita) e "admin@suaempresa.com" no campo valor.',
    targetDeviceIp: '192.168.1.1',
    requiredCommand: 'snmpset',
    requiredOid: '.1.3.6.1.2.1.1.4.0',
    requiredCommunity: 'private',
    requiredValue: 'admin@suaempresa.com',
    completed: false
  },
  {
    id: 'lab4',
    title: 'Missao 4: Seguranca SNMP v3 com Criptografia',
    objective: 'Ler sysLocation usando criptografia forte',
    instructions: 'Para testar segurança avançada, mude a versão do SNMP do simulador para "v3". Configure o usuário com o nome "academy_admin", nível de segurança para "authPriv" (com Autenticação de SHA e Criptografia AES) e consulte a localização (".1.3.6.1.2.1.1.6.0") do Servidor Web.',
    hint: 'No painel SNMP v3, configure Usuário="academy_admin", selecione "authPriv", preencha a senha SHA e criptografia AES e busque a localização (.1.3.6.1.2.1.1.6.0).',
    targetDeviceIp: '192.168.1.10',
    requiredCommand: 'snmpget',
    requiredOid: '.1.3.6.1.2.1.1.6.0',
    requiredVersion: 'v3',
    completed: false
  }
];
