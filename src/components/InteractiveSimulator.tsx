/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal, Play, Trash2, Server, HelpCircle, Copy, Check,
  Cpu, Key, Shield, Radio, ArrowRight, CornerDownRight, Settings2, Info, AlertTriangle, CheckCircle2, ShieldAlert,
  ShieldCheck, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { SNMP_COMMANDS } from '../data';
import { TerminalLog, SNMPDevice } from '../types';

interface InteractiveSimulatorProps {
  selectedCommandId: string;
  onSelectCommand: (cmdId: string) => void;
  selectedOid: string;
  onOidChange: (oid: string) => void;
  devices: SNMPDevice[];
  onUpdateDeviceContact: (ip: string, contact: string) => void;
  onUpdateDeviceLocation: (ip: string, location: string) => void;
  onUpdateDeviceName: (ip: string, hostName: string) => void;
  onNotifyLabComplete?: (ip: string, cmd: string, oid: string, community: string, value?: string, version?: string) => void;
}

export default function InteractiveSimulator({
  selectedCommandId,
  onSelectCommand,
  selectedOid,
  onOidChange,
  devices,
  onUpdateDeviceContact,
  onUpdateDeviceLocation,
  onUpdateDeviceName,
  onNotifyLabComplete
}: InteractiveSimulatorProps) {
  
  // States
  const [selectedIp, setSelectedIp] = useState<string>('192.168.1.1');
  const [community, setCommunity] = useState<string>('public');
  const [manualCommand, setManualCommand] = useState<string>('');
  const [snmpVersion, setSnmpVersion] = useState<'v1' | 'v2c' | 'v3'>('v2c');
  const [writeValue, setWriteValue] = useState<string>('');
  
  // SNMP v3 USM security parameters
  const [v3User, setV3User] = useState<string>('academy_admin');
  const [v3Level, setV3Level] = useState<'noAuthNoPriv' | 'authNoPriv' | 'authPriv'>('authNoPriv');
  const [v3AuthProto, setV3AuthProto] = useState<'MD5' | 'SHA'>('SHA');
  const [v3AuthPass, setV3AuthPass] = useState<string>('AuthPass123');
  const [v3PrivProto, setV3PrivProto] = useState<'DES' | 'AES'>('AES');
  const [v3PrivPass, setV3PrivPass] = useState<string>('PrivPass456');

  // Simulation state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [packetState, setPacketState] = useState<'idle' | 'sending' | 'processing' | 'receiving' | 'done' | 'error'>('idle');
  
  // Didactic explanation and Inspector values
  const [selectedOidMeta, setSelectedOidMeta] = useState<{
    meaning: string;
    description: string;
    importance: string;
    importanceColor: string;
  }>({
    meaning: "sysDescr (Descrição do Hardware/SO)",
    description: "Identifica o fabricante, o modelo do equipamento, o kernel do sistema operacional e a data de compilação da build de firmware.",
    importance: "Fundamental para inventários automatizados (discovery) e identificação rápida de patches de segurança desatualizados da máquina.",
    importanceColor: "border-blue-500 bg-blue-50/40 text-blue-900"
  });

  const [explanationText, setExplanationText] = useState<string>(
    'Configure os parâmetros de simulação ao lado e clique em "Executar Comando". O painel analisará o tráfego em tempo real mostrando a transição de pacotes UDP.'
  );

  const [snifferLog, setSnifferLog] = useState<{
    protocol: string;
    secLevel: string;
    rawPayload: string;
    isEncrypted: boolean;
    communityString?: string;
  } | null>(null);

  // Terminal Logs
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      text: '// Console pronto. Aguardando comandos ou triggers de eventos de rede...'
    }
  ]);

  const terminalScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to terminal bottom on clean events (without scrolling the main page/viewport)
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTo({
        top: terminalScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs]);

  const scrollToLayoutElement = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Current states
  const currentDevice = devices.find(d => d.ip === selectedIp) || devices[0];
  const currentCommand = SNMP_COMMANDS.find(c => c.id === selectedCommandId) || SNMP_COMMANDS[0];

  // Update dynamic OID metadata on input change
  useEffect(() => {
    const cleanOid = selectedOid.trim();
    const norm = cleanOid.startsWith('.') ? cleanOid : '.' + cleanOid;
    let meaning = "OID Customizado / Variável Específica";
    let description = "Variável cadastrada nas MIBs estendidas da empresa responsável pelo monitoramento de recursos internos.";
    let importance = "Permite acessar métricas de hardware altamente específicas do fabricante selecionado.";
    let importanceColor = "border-amber-500 bg-amber-50/40 text-amber-900";

    if (norm === '.1.3.6.1.2.1.1.1.0' || cleanOid === 'sysDescr.0' || cleanOid === 'sysDescr') {
      meaning = "sysDescr.0 (Descrição Física do Sistema)";
      description = "Identifica de forma amigável o nome comercial do hardware, sistema operacional e versão do kernel Unix/Cisco IOS que o agente está executando.";
      importance = "Crítico para descoberta automática de ativos (Auto-discovery) no Zabbix/Nagios e auditorias de conformidade de firmware.";
      importanceColor = "border-blue-500 bg-blue-50/40 text-blue-900";
    } else if (norm === '.1.3.6.1.2.1.1.2.0' || cleanOid === 'sysObjectID.0' || cleanOid === 'sysObjectID') {
      meaning = "sysObjectID.0 (Identificador do Fabricante)";
      description = "OID identificador único corporativo na ramificação enterprise privada sob o nó do IANA.";
      importance = "Informa à ferramenta de monitoramento qual MIB privada de fabricante consultar para colher informações detalhadas.";
      importanceColor = "border-indigo-500 bg-indigo-50/40 text-indigo-900";
    } else if (norm === '.1.3.6.1.2.1.1.3.0' || cleanOid === 'sysUpTime.0' || cleanOid === 'sysUpTime') {
      meaning = "sysUpTime.0 (Tempo Ativo do Sistema)";
      description = "Contador numérico de tempo (em centésimos de segundo) indicando o intervalo desde que o host lógico ou daemon snmpd de rede foi inicializado.";
      importance = "Alta relevância para detectar reinicializações inesperadas (reboots) provocadas por falhas elétricas, picos de temperatura ou readequações físicas.";
      importanceColor = "border-indigo-500 bg-indigo-50/40 text-indigo-900";
    } else if (norm === '.1.3.6.1.2.1.1.4.0' || cleanOid === 'sysContact.0' || cleanOid === 'sysContact') {
      meaning = "sysContact.0 (E-mail de Contato de Emergência)";
      description = "Informações textuais brutas sobre o nome ou e-mail corporativo do administrador responsável pelo suporte físico deste rack.";
      importance = "Usado por equipes globais de NOC (Network Operations Center) para acionar o contato correto no caso de falhas físicas locais.";
      importanceColor = "border-emerald-500 bg-emerald-50/40 text-emerald-900";
    } else if (norm === '.1.3.6.1.2.1.1.5.0' || cleanOid === 'sysName.0' || cleanOid === 'sysName') {
      meaning = "sysName.0 (Nome Lógico do Host - Hostname)";
      description = "O hostname único definido nas configurações de DHCP ou roteamento interno do dispositivo de rede.";
      importance = "Identifica univocamente a máquina no dashboard central NMS, evitando conflitos de logs quando IPs mudam dinamicamente.";
      importanceColor = "border-purple-500 bg-purple-50/40 text-purple-900";
    } else if (norm === '.1.3.6.1.2.1.1.6.0' || cleanOid === 'sysLocation.0' || cleanOid === 'sysLocation') {
      meaning = "sysLocation.0 (Localização Física do Hardware)";
      description = "String declarativa descrevendo a posição exata, andar, fileira ou rack técnico onde o equipamento de hardware reside.";
      importance = "Indispensável na triagem de problemas locais para que os técnicos saibam fisicamente em qual armário de rede atuar.";
      importanceColor = "border-pink-500 bg-pink-50/40 text-pink-900";
    } else if (norm === '.1.3.6.1.2.1.1.7.0' || cleanOid === 'sysServices.0' || cleanOid === 'sysServices') {
      meaning = "sysServices.0 (Camadas de Serviço OSI)";
      description = "Inteiro representando a somatória binária de camadas do modelo OSI em que o hardware opera ativamente.";
      importance = "Ajuda ferramentas centrais de redes a classificar se o dispositivo é um Switch L2 (valor 3), Roteador L3 (valor 78) ou Servidor L7 (valor 72).";
      importanceColor = "border-violet-500 bg-violet-50/45 text-violet-900";
    } else if (norm === '.1.3.6.1.2.1.2.1.0' || cleanOid === 'ifNumber.0' || cleanOid === 'ifNumber') {
      meaning = "ifNumber.0 (Contador de Interfaces de Rede)";
      description = "Métrica de leitura retornando o número total de conexões físicas e lógicas que este dispositivo gerencia de forma ativa.";
      importance = "Permite mapear a densidade de portas do switch/router antes de desenhar as conexões lógicas de backbone.";
      importanceColor = "border-sky-500 bg-sky-50/40 text-sky-900";
    } else if (norm === '.1.3.6.1.2.1.2.2.1.1.1' || cleanOid === 'ifIndex.1') {
      meaning = "ifIndex.1 (Índice da Interface 1)";
      description = "Índice numérico identificando univocamente a primeira interface na tabela de interfaces ifTable.";
      importance = "Serve de chave de busca primária para associar parâmetros de conexões ethernet.";
      importanceColor = "border-emerald-500 bg-emerald-50/40 text-emerald-900";
    } else if (norm === '.1.3.6.1.2.1.2.2.1.2.1' || cleanOid === 'ifDescr.1') {
      meaning = "ifDescr.1 (Descrição da Interface 1)";
      description = "Nome de exibição física ou lógica da primeira interface de rede, por exemplo GigabitEthernet0/0.";
      importance = "Informa o rótulo claro usado nos comandos operacionais locais da interface.";
      importanceColor = "border-amber-500 bg-amber-50/40 text-amber-900";
    } else if (norm === '.1.3.6.1.2.1.2.2.1.5.1' || cleanOid === 'ifSpeed.1') {
      meaning = "ifSpeed.1 (Velocidade da Interface 1)";
      description = "A velocidade máxima de escoamento de rede nominal suportada correspondendo a 1.000.000.000 bits/s (1 Gbps).";
      importance = "Chave para calcular taxas de vazão percentual e saturação de canais físicos de backbone contratados.";
      importanceColor = "border-blue-500 bg-blue-50/40 text-blue-900";
    } else if (norm === '.1.3.6.1.2.1.2.2.1.8.1' || cleanOid === 'ifOperStatus.1') {
      meaning = "ifOperStatus.1 (Estado Operacional da Interface 1)";
      description = "O estado mecânico ativo atual da interface de conexões. O valor 1 sinaliza up e 2 sinaliza down.";
      importance = "Dispara triggers de altíssima criticidade caso mude para down no monitor NOC.";
      importanceColor = "border-emerald-500 bg-emerald-50/40 text-emerald-900";
    } else if (norm === '.1.3.6.1.2.1.2.2.0' || norm.startsWith('.1.3.6.1.2.1.2.2') || cleanOid === 'ifTable') {
      meaning = "ifTable (Tabela Estruturada de Interfaces de Rede)";
      description = "Mapeado sob o grupo interfaces, contém indexes com nomes (ifDescr), velocidade física (ifSpeed) e estado atual (ifOperStatus) de cada porta.";
      importance = "A tabela mais consultada do monitoramento! Monitora estados Up/Down de conexões físicas e velocidade de banda instantânea.";
      importanceColor = "border-teal-500 bg-teal-50/40 text-teal-900";
    } else if (norm === '.1.3.6.1.2.1.4.1.0' || cleanOid === 'ipForwarding.0') {
      meaning = "ipForwarding.0 (Estado de Encaminhamento IP)";
      description = "Atributo chave indicando se o dispositivo opera como um Roteador redundante repassando pacotes IP (forwarding=1) ou apenas Host final (notForwarding=2).";
      importance = "Auxilia na auditoria de segurança para validar se servidores internos estão indevidamente roteando pacotes não autorizados.";
      importanceColor = "border-cyan-500 bg-cyan-50/40 text-cyan-900";
    } else if (cleanOid === '.1.3.6.1.2.1.4.3.0' || cleanOid === 'ipInReceives.0') {
      meaning = "ipInReceives.0 (Contador Acumulado IP Recebidos)";
      description = "Contador de 32 bits incremental registrando o volume de datagramas IP entregues pelas placas de rede locais.";
      importance = "Vital para detecção de anomalias de trafego ou ataques de negação de serviço (DoS/DDoS).";
      importanceColor = "border-teal-500 bg-teal-50/40 text-teal-900";
    } else if (cleanOid.includes('ssCpu') || cleanOid.includes('2021')) {
      meaning = "ssCpu (Uso e Carga Dinâmica da CPU)";
      description = "OIDS associados às MIBs privadas corporativas UNIX de monitoramento (UCD-SNMP-MIB). Ex: ssCpuIdle indica folga livre do processador.";
      importance = "Usado em triggers de alarmes preventivos para evitar gargalos em bancos de dados e indisponibilidade de aplicações críticas.";
      importanceColor = "border-rose-500 bg-rose-50/40 text-rose-900";
    } else if (cleanOid.includes('cisco')) {
      meaning = "Cisco Private OID (Memória/Hardware)";
      description = "Atributo estendido pertencente à ramificação corporativa privada da Cisco (.1.3.6.1.4.1.9).";
      importance = "Mapeia uso de memória interna de arrays de switches modulares estruturais no rack.";
      importanceColor = "border-indigo-500 bg-indigo-50/40 text-indigo-900";
    }

    setSelectedOidMeta({ meaning, description, importance, importanceColor });
  }, [selectedOid]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearLogs = () => {
    setLogs([
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        text: 'Terminal limpo. Console local pronto para novas conexões.'
      }
    ]);
    setPacketState('idle');
    setSnifferLog(null);
  };

  // Traps manual triggers (Interactive alarm generator)
  const handleTriggerSimulatedTrap = (trapType: 'cpu' | 'link' | 'temp') => {
    if (isRunning) return;
    setIsRunning(true);
    setPacketState('sending');

    let trapOid = '';
    let trapLabel = '';
    let variableBindings = '';
    let descriptionText = '';
    let snifferText = '';

    const timestamp = new Date().toLocaleTimeString();

    if (trapType === 'cpu') {
      trapOid = '.1.3.6.1.4.1.2021.11.101.0';
      trapLabel = 'CPU_WARNING_ALERT';
      variableBindings = `
  - Enterprise OID: .1.3.6.1.4.1.2021 (UCD-SNMP-MIB)
  - Specific Trap ID: 101 (CPU Threshold Exceeded)
  - Variaveis mapeadas:
    UCD-SNMP-MIB::ssCpuUser.0 = 98 (percentual)
    UCD-SNMP-MIB::ssCpuIdle.0 = 2 (percentual)
    SNMPv2-MIB::sysName.0 = "${currentDevice.sysName}"`;
      descriptionText = `ALERTA DE TRAP: O dispositivo ${currentDevice.sysName} detectou picos severos de uso de CPU (98% em uso operacional). Um pacote SNMP Trap UDP foi enviado instantaneamente com prioridade crítica para o NMS.`;
      snifferText = snmpVersion === 'v3' 
        ? `SNMPv3 SECURE TRAP: Autenticado e Criptografado por USM.\nDados ilegíveis de rede para atacantes externos.`
        : `SNMP ALERTA EXTRA: Transmitido em TEXTO PURO via UDP na porta 162. Community string correspondente detectada: "${community}".`;

    } else if (trapType === 'link') {
      trapOid = '.1.3.6.1.6.3.1.1.5.3';
      trapLabel = 'LINK_STATUS_DOWN';
      variableBindings = `
  - Enterprise OID: .1.3.6.1.6.3.1.1.5 (SnmpTraps)
  - Specific Trap ID: 3 (Link Physical Failure)
  - Variaveis mapeadas:
    IF-MIB::ifIndex.4 = 4
    IF-MIB::ifDescr.4 = "eth1 - Gigabit Link de Backbone"
    IF-MIB::ifOperStatus.4 = down(2)
    SNMPv2-MIB::sysName.0 = "${currentDevice.sysName}"`;
      descriptionText = `ALERTA DE TRAP: Queda mecânica/sinal da interface eth1 detectado no dispositivo ${currentDevice.sysName}. O dispositivo iniciou preventivamente o roteamento de emergência.`;
      snifferText = snmpVersion === 'v3'
        ? `SNMPv3 SECURE TRAP: Pacote de aviso criptografado enviado com AES para porta 162 do NMS.`
        : `SNMP UNSECURE TRAP: Evento em formato texto-claro de Link DOWN capturado nas escutas locais.`;

    } else {
      trapOid = '.1.3.6.1.4.1.9.9.13.1.3.1.3';
      trapLabel = 'ENVIRONMENT_TEMPERATURE_HIGH';
      variableBindings = `
  - Enterprise OID: .1.3.6.1.4.1.9 (Cisco System Private)
  - Specific Trap ID: 15 (Chassis Overheat)
  - Variaveis mapeadas:
    CISCO-ENVMON-MIB::ciscoEnvMonTemperatureStatusValue = 75 (Graus Celsius)
    CISCO-ENVMON-MIB::ciscoEnvMonTemperatureState = critical(3)
    SNMPv2-MIB::sysName.0 = "${currentDevice.sysName}"`;
      descriptionText = `ALERTA DE TRAP: Sensor interno relatou temperatura de 75°C no chassi de ${currentDevice.sysName}. Verifique a ventilação física do Rack de suporte!`;
      snifferText = snmpVersion === 'v3'
        ? `SNMPv3 TRAP: Encriptação forte aplicada ao aviso de sobreaquecimento.`
        : `SNMP TRAP: Community String em texto plano interceptada no aviso de sobreaquecimento.`;
    }

    setExplanationText(descriptionText);

    // Dynamic sniffer output simulation
    setSnifferLog({
      protocol: `SNMP Trap (${snmpVersion})`,
      secLevel: snmpVersion === 'v3' ? `${v3Level}` : 'Community String Clássica',
      rawPayload: snmpVersion === 'v3' 
        ? `${v3Level === 'authPriv' ? 'ENCRYPTED_DATA [AES-128: 4bf6e9b218cdcf25...]' : 'PLAINTEXT_PAYLOAD [Verified message, no encryption Auth-SHA1]'}`
        : `PLAINTEXT_PAYLOAD [Community: ${community} | Event: ${trapLabel}]`,
      isEncrypted: snmpVersion === 'v3' && v3Level === 'authPriv',
      communityString: snmpVersion !== 'v3' ? community : undefined
    });

    // Packet animation sequences
    setTimeout(() => {
      setPacketState('processing');
      setTimeout(() => {
        setPacketState('receiving');
        setTimeout(() => {
          setLogs(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              timestamp,
              type: 'error', // highlight Trap trigger explicitly
              text: `[TRAP ASSÍNCRONO RECEBIDO POR UDP/162] da origem ${selectedIp}\nEvento: ${trapLabel}\nOID ID: ${trapOid}\n${variableBindings}`
            }
          ]);
          setPacketState('done');
          setIsRunning(false);
        }, 700);
      }, 700);
    }, 600);
  };

  // Run Standard SNMP Commands (GET, WALK, SET, BULK) via Parametrizable Runner
  const executeSNMPCall = (
    cmdId: string,
    targetIp: string,
    version: 'v1' | 'v2c' | 'v3',
    comm: string,
    user3: string,
    level3: 'noAuthNoPriv' | 'authNoPriv' | 'authPriv',
    authProto3: 'MD5' | 'SHA',
    authPass3: string,
    privProto3: 'DES' | 'AES',
    privPass3: string,
    oid: string,
    writeVal: string,
    overrideCommandLine?: string
  ) => {
    setIsRunning(true);
    setPacketState('sending');
    setExplanationText(`NMS enviando pacote UDP (${cmdId.toUpperCase()}): O Gerente solicitou o OID ${oid} ao agente na porta UDP 161.`);

    const timestamp = new Date().toLocaleTimeString();
    
    // Sniffer analysis updates immediately
    setSnifferLog({
      protocol: `SNMP ${cmdId.toUpperCase()} (${version})`,
      secLevel: version === 'v3' ? `${level3}` : 'Community String Clássica',
      rawPayload: version === 'v3'
        ? `${level3 === 'authPriv' ? 'ENCRYPTED_DATA [AES-256: 9b2d8e41cfda2583...]' : 'AUTHENTICATED_ONLY [HMAC-SHA1-96]'}`
        : `PLAINTEXT_PAYLOAD [cleartext community: "${comm}" | OID requested: ${oid}]`,
      isEncrypted: version === 'v3' && level3 === 'authPriv',
      communityString: version !== 'v3' ? comm : undefined
    });

    // Construct command log line
    let cliCommand = overrideCommandLine || '';
    if (!cliCommand) {
      if (version === 'v3') {
        const secLevelOption = level3 === 'noAuthNoPriv' ? 'noAuthNoPriv' : level3 === 'authNoPriv' ? 'authNoPriv' : 'authPriv';
        cliCommand = `${cmdId} -v3 -u ${user3} -l ${secLevelOption} `;
        if (level3 !== 'noAuthNoPriv') {
          cliCommand += `-a ${authProto3} -A "${authPass3.substring(0,4)}***" `;
        }
        if (level3 === 'authPriv') {
          cliCommand += `-x ${privProto3} -X "${privPass3.substring(0,4)}***" `;
        }
        cliCommand += `${targetIp} ${oid}`;
        if (cmdId === 'snmpset') {
          cliCommand += ` s "${writeVal || 'newValue'}"`;
        }
      } else {
        cliCommand = `${cmdId} -${version} -c ${comm} ${targetIp} ${oid}`;
        if (cmdId === 'snmpset') {
          cliCommand += ` s "${writeVal || ''}"`;
        }
      }
    }

    setLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp,
        type: 'input',
        text: cliCommand
      }
    ]);

    // Packet state movements
    setTimeout(() => {
      setPacketState('processing');
      setExplanationText(`O Agente em ${targetIp} recebeu o pacote UDP em sua porta 161, validou as credenciais e está localizando a memória correspondente.`);

      setTimeout(() => {
        setPacketState('receiving');
        setExplanationText('Gerando Resposta: O Agente decodificou a informação local e está despachando uma mensagem de retorno contendo os valores de volta ao Gerente.');

        setTimeout(() => {
          let hasSucceeded = true;
          let outputText = '';
          let errorExplanation = '';

          const deviceOfCommand = devices.find(d => d.ip === targetIp) || devices[0];

          // Validate Security Credentials
          if (version !== 'v3') {
            if (comm !== 'public' && comm !== 'private') {
              hasSucceeded = false;
              outputText = `Timeout: No Response from ${targetIp}.\n// (Causa raiz do erro: SNMP packet descartado silenciosamente por community string errada).`;
              errorExplanation = 'TIMEOUT (Sem Resposta): O Agente SNMP descartou preventivamente a requisição porque a Community String enviada não corresponde aos registros de seu arquivo "snmpd.conf".';
            } else if (cmdId === 'snmpset' && comm !== 'private') {
              hasSucceeded = false;
              outputText = `Error in packet\nReason: noAccess (The community string "${comm}" does not have write access for OIDs with write permission).`;
              errorExplanation = 'NEGADO (noAccess): A community string "public" tradicionalmente só concede permissão de leitura (Read-Only). Para alterar o estado de variáveis (Set), altere a community string para "private".';
            }
          } else {
            // SNMPv3 Auth Check
            if (user3 !== 'academy_admin') {
              hasSucceeded = false;
              outputText = `Error: USM: Unknown securityName.\n// (Usuário de segurança "${user3}" não cadastrado no daemon local).`;
              errorExplanation = 'ERRO DE USUÁRIO: O SNMPv3 USM necessita que o usuário solicitado esteja declarado sob o escopo local do dispositivo de destino.';
            } else if (level3 !== 'noAuthNoPriv' && !authPass3) {
              hasSucceeded = false;
              outputText = `Error: USM: Authentication protocol failure.\n// (Senha ou algoritmo HMAC incorretos para o nível de autenticação selecionado).`;
              errorExplanation = 'ERRO DE AUTENTICAÇÃO: A assinatura criptográfica gerada SHA/MD5 falhou por incorreções na senha.';
            } else if (level3 === 'authPriv' && (!privPass3 || privPass3.length < 6)) {
              hasSucceeded = false;
              outputText = `Error: USM: Decryption protocol failure.\n// (Criptografia AES/DES falhou por chave muito curta ou algoritmo divergente)`;
              errorExplanation = 'ERRO DE PRIVACIDADE: O pacote criptografado não pôde ser decifrado pelo agente central. Verifique a senha da chave AES.';
            }
          }

          // Process OIDs Responses on Auth valid
          if (hasSucceeded) {
            const cleanOid = oid.trim();
            const normalizedOid = cleanOid.startsWith('.') ? cleanOid : '.' + cleanOid;

            // Match dynamic indices on sub-interfaces in table ifIndex.X, ifDescr.X, ifSpeed.X, ifOperStatus.X
            const ifIndexMatch = normalizedOid.match(/^\.1\.3\.6\.1\.2\.1\.2\.2\.1\.1\.(\d+)$/) || cleanOid.match(/^ifIndex\.(\d+)$/);
            const ifDescrMatch = normalizedOid.match(/^\.1\.3\.6\.1\.2\.1\.2\.2\.1\.2\.(\d+)$/) || cleanOid.match(/^ifDescr\.(\d+)$/);
            const ifSpeedMatch = normalizedOid.match(/^\.1\.3\.6\.1\.2\.1\.2\.2\.1\.5\.(\d+)$/) || cleanOid.match(/^ifSpeed\.(\d+)$/);
            const ifOperStatusMatch = normalizedOid.match(/^\.1\.3\.6\.1\.2\.1\.2\.2\.1\.8\.(\d+)$/) || cleanOid.match(/^ifOperStatus\.(\d+)$/);

            if (cmdId === 'snmptrap') {
              outputText = `Registered alert: Trap successfully received at Event Receiver Logger!\n` +
                           `Enterprise OID: .1.3.6.1.6.3.1.1.5.3 (Physical Link Alarm)\n` +
                           `Variable value bindings: IF-MIB::ifOperStatus.4 = down(2) (${deviceOfCommand.sysName})`;
              setExplanationText('Notificação Enviada: O simulador disparou um alerta para o servidor NMS. Traps são úteis para monitoramento passivo emergencial.');
            } else {
              // Standard get/walk/set
              if (normalizedOid === '.1.3.6.1.2.1.1.1.0' || cleanOid === 'sysDescr.0' || cleanOid === 'sysDescr') {
                outputText = `SNMPv2-MIB::sysDescr.0 = STRING: "${deviceOfCommand.sysDescr}"`;
                setExplanationText(`Sucesso (Get-Response recebido): Retornou a assinatura de SO do Agente correspondendo ao IP ${targetIp}.`);
              } 
              else if (normalizedOid === '.1.3.6.1.2.1.1.2.0' || cleanOid === 'sysObjectID.0' || cleanOid === 'sysObjectID') {
                outputText = `SNMPv2-MIB::sysObjectID.0 = OID: ${deviceOfCommand.sysObjectID}`;
                setExplanationText(`Sucesso (Get-Response recebido): Retornou o Enterprise OID do fabricante do equipamento.`);
              } 
              else if (normalizedOid === '.1.3.6.1.2.1.1.3.0' || cleanOid === 'sysUpTime.0' || cleanOid === 'sysUpTime') {
                const uptimeVal = 1234500;
                outputText = `DISMAN-EVENT-MIB::sysUpTimeInstance = Timeticks: ${uptimeVal} (1234500) (3:25:45.00)`;
                setExplanationText(`Sucesso (Get-Response recebido): Valor colhido correspondendo ao uptime absoluto de loop-clock.`);
              } 
              else if (normalizedOid === '.1.3.6.1.2.1.1.4.0' || cleanOid === 'sysContact.0' || cleanOid === 'sysContact') {
                if (cmdId === 'snmpset') {
                  if (!writeVal.trim()) {
                    hasSucceeded = false;
                    outputText = `Error in packet\nReason: wrongValue (Cannot write empty DisplayStrings)`;
                    errorExplanation = 'VALOR INCORRETO: Para comandos do tipo snmpset, preencha o valor de destino a ser escrito sob a variável.';
                  } else {
                    onUpdateDeviceContact(targetIp, writeVal);
                    outputText = `SNMPv2-MIB::sysContact.0 = STRING: "${writeVal}"\n[OK - ESTADO GRAVADO NA MEMÓRIA DO AGENTE (SUCESSO)]`;
                    setExplanationText(`Sucesso set (Escrita): Contato de emergência administrativamente atualizado na memória local do agente para "${writeVal}".`);
                  }
                } else {
                  outputText = `SNMPv2-MIB::sysContact.0 = STRING: "${deviceOfCommand.sysContact}"`;
                  setExplanationText('Sucesso Get-Request: Retornou o e-mail cadastrado para suporte e emergência.');
                }
              } 
              else if (normalizedOid === '.1.3.6.1.2.1.1.5.0' || cleanOid === 'sysName.0' || cleanOid === 'sysName') {
                if (cmdId === 'snmpset') {
                  if (!writeVal.trim()) {
                    hasSucceeded = false;
                    outputText = `Error in packet\nReason: wrongValue (Value too short)`;
                    errorExplanation = 'VALOR DE ESCRITA INVÁLIDO: O host_name lógico do sistema operacional exige no mínimo caracteres válidos.';
                  } else {
                    onUpdateDeviceName(targetIp, writeVal);
                    outputText = `SNMPv2-MIB::sysName.0 = STRING: "${writeVal}"\n[OK - HOSTNAME ATUALIZADO (SUCESSO)]`;
                    setExplanationText(`Sucesso set (Escrita): O hostname lógico foi modificado com sucesso para "${writeVal}".`);
                  }
                } else {
                  outputText = `SNMPv2-MIB::sysName.0 = STRING: "${deviceOfCommand.sysName}"`;
                  setExplanationText('Sucesso Get-Request: Hostname lido do roteador central de rede.');
                }
              } 
              else if (normalizedOid === '.1.3.6.1.2.1.1.6.0' || cleanOid === 'sysLocation.0' || cleanOid === 'sysLocation') {
                if (cmdId === 'snmpset') {
                  if (!writeVal.trim()) {
                    hasSucceeded = false;
                    outputText = `Error in packet\nReason: wrongValue`;
                    errorExplanation = 'VALOR DE ESCRITA INVÁLIDO: A localização física não pode ser vazia.';
                  } else {
                    onUpdateDeviceLocation(targetIp, writeVal);
                    outputText = `SNMPv2-MIB::sysLocation.0 = STRING: "${writeVal}"\n[OK - LOCALIZAÇÃO DA MÁQUINA SALVA]`;
                    setExplanationText(`Sucesso set (Escrita): O endereço de rack da máquina física agora é "${writeVal}".`);
                  }
                } else {
                  outputText = `SNMPv2-MIB::sysLocation.0 = STRING: "${deviceOfCommand.sysLocation}"`;
                  setExplanationText('Sucesso Get-Request: Retorna o posicionamento do hardware dentro do setor corporativo.');
                }
              }
              else if (normalizedOid === '.1.3.6.1.2.1.1.7.0' || cleanOid === 'sysServices.0' || cleanOid === 'sysServices') {
                if (cmdId === 'snmpset') {
                  hasSucceeded = false;
                  outputText = `Error in packet\nReason: notWritable (This OID is strictly static and Read-Only according to RFC standard)`;
                  errorExplanation = 'ERRO DE ESCRITA (notWritable): Algumas métricas da árvore mib-2 são estritamente constantes de fabricação e não podem ser sobrescritas por rede.';
                } else {
                  outputText = `SNMPv2-MIB::sysServices.0 = INTEGER: ${deviceOfCommand.sysServices}`;
                  setExplanationText('Sucesso Get-Request: Camadas de serviço de roteamento/transporte IP ativas.');
                }
              }
              // 8. ifNumber: .1.3.6.1.2.1.2.1.0 (INTEGER)
              else if (normalizedOid === '.1.3.6.1.2.1.2.1.0' || cleanOid === 'ifNumber.0' || cleanOid === 'ifNumber') {
                outputText = `IF-MIB::ifNumber.0 = INTEGER: ${deviceOfCommand.interfaces.length || 4}`;
                setExplanationText('Sucesso Get-Request: Interfaces físicas e de túnel do dispositivo.');
              }
              // 9. ifIndex.<id>: .1.3.6.1.2.1.2.2.1.1.<id> (INTEGER)
              else if (ifIndexMatch) {
                const idx = parseInt(ifIndexMatch[1], 10);
                outputText = `IF-MIB::ifIndex.${idx} = INTEGER: ${idx}`;
                setExplanationText(`Sucesso Get-Request: Retornou o índice da interface solicitado (${idx}).`);
              }
              // 10. ifDescr.<id>: .1.3.6.1.2.1.2.2.1.2.<id> (STRING)
              else if (ifDescrMatch) {
                const idx = parseInt(ifDescrMatch[1], 10);
                const iface = deviceOfCommand.interfaces[idx - 1];
                const descrVal = iface ? iface.descr : (idx === 1 ? 'GigabitEthernet0/0' : `interface-${idx}`);
                outputText = `IF-MIB::ifDescr.${idx} = STRING: "${descrVal}"`;
                setExplanationText(`Sucesso Get-Request: Retornou a descrição da interface solicitado (${idx}).`);
              }
              // 11. ifSpeed.<id>: .1.3.6.1.2.1.2.2.1.5.<id> (Gauge32)
              else if (ifSpeedMatch) {
                const idx = parseInt(ifSpeedMatch[1], 10);
                const iface = deviceOfCommand.interfaces[idx - 1];
                let speedBits = 1000000000; // default 1 Gbps
                if (iface) {
                  if (iface.speed.includes('10 Gbps')) speedBits = 10000000000;
                  else if (iface.speed.includes('1 Gbps')) speedBits = 1000000000;
                  else if (iface.speed.includes('100 Mbps')) speedBits = 100000000;
                  else if (iface.speed.includes('10 Mbps')) speedBits = 10000000;
                }
                outputText = `IF-MIB::ifSpeed.${idx} = Gauge32: ${speedBits}`;
                setExplanationText(`Sucesso Get-Request: Retornou a velocidade nominal da interface ${idx} (em bits/s).`);
              }
              // 12. ifOperStatus.<id>: .1.3.6.1.2.1.2.2.1.8.<id> (INTEGER)
              else if (ifOperStatusMatch) {
                const idx = parseInt(ifOperStatusMatch[1], 10);
                const iface = deviceOfCommand.interfaces[idx - 1];
                const statusInt = iface && iface.status === 'down' ? 2 : 1; // 1 = up, 2 = down
                outputText = `IF-MIB::ifOperStatus.${idx} = INTEGER: ${statusInt} (${statusInt === 1 ? 'up' : 'down'})`;
                setExplanationText(`Sucesso Get-Request: Retornou o estado operacional atual da interface ${idx}.`);
              }
              // Linux Specifics UCD CPU load
              else if (cleanOid === '.1.3.6.1.4.1.2021.11.11.0' || cleanOid.includes('Idle') || cleanOid.includes('Cpu')) {
                if (targetIp === '192.168.1.10') { // Linux Ubuntu Web Server
                  outputText = `UCD-SNMP-MIB::ssCpuIdle.0 = INTEGER: 92% (CPU operacional livre)\n` +
                               `UCD-SNMP-MIB::ssCpuUser.0 = INTEGER: 8% (Uso de usuário)`;
                  setExplanationText('Sucesso Get-Request (Linux UCD MIB): Retornou os índices reais de carga de CPU do processador.');
                } else if (targetIp === '192.168.1.1') { // Core Router
                  outputText = `UCD-SNMP-MIB::ssCpuIdle.0 = INTEGER: 85%\n` +
                               `UCD-SNMP-MIB::ssCpuUser.0 = INTEGER: 12%`;
                  setExplanationText('Sucesso Get-Request (Device-Specific): Estatísticas de uso do processador embarcado.');
                } else {
                  outputText = `CiscoEnvMon::ciscoCpuIdle = INTEGER: 96%`;
                  setExplanationText('Sucesso Get-Request: Cisco Switch informou carga de CPU ociosa de 96%.');
                }
              }
              // Linux web server memory size hrMemorySize.0
              else if (cleanOid === '.1.3.6.1.2.1.25.2.2.0' || cleanOid.includes('hrMemorySize')) {
                if (targetIp === '192.168.1.10') {
                  outputText = `HOST-RESOURCES-MIB::hrMemorySize.0 = INTEGER: 33554432 KB (32 GB RAM total)`;
                  setExplanationText('Sucesso Get-Request: O Ubuntu Linux retornou a memória física mapeada no cluster pelo kernel.');
                } else {
                  outputText = `HOST-RESOURCES-MIB::hrMemorySize.0 = INTEGER: 1048576 KB (1 GB RAM total)`;
                  setExplanationText('Sucesso Get-Request: Memória de hardware padrão do chassi.');
                }
              }
              // Cisco Free Memory Pool
              else if (cleanOid.includes('ciscoMemoryPoolFree') || cleanOid === '.1.3.6.1.4.1.9.9.48.1.1.1.5.1') {
                if (targetIp === '192.168.1.50') {
                  outputText = `CISCO-MEMORY-POOL-MIB::ciscoMemoryPoolFree.1 = Gauge32: 45281920 Bytes free (Core Floor Switch Pool)`;
                  setExplanationText('Sucesso Get-Request: Retornado pool livre na chapa controladora do switch Cisco.');
                } else {
                  hasSucceeded = false;
                  outputText = `Error: OID not found on agent. Reason: noSuchInstance (The Cisco Memory Pool OID is only supported in Cisco physical agents).`;
                  errorExplanation = 'ERRO noSuchInstance: Este OID é de escopo reservado da Cisco, ou seja, agentes Linux ou HP o descartam por incompatibilidade.';
                }
              }
              // Interfaces
              else if (cleanOid === '.1.3.6.1.2.1.2.1.0' || cleanOid === 'ifNumber.0') {
                outputText = `IF-MIB::ifNumber.0 = INTEGER: ${deviceOfCommand.interfaces.length}`;
                setExplanationText('Sucesso Get-Request: Interfaces físicas e de túnel do dispositivo.');
              }
              else if (cleanOid === '.1.3.6.1.2.1.2.2.0' || cleanOid.startsWith('.1.3.6.1.2.1.2.2') || cleanOid === 'ifTable') {
                if (cmdId === 'snmpwalk' || cmdId === 'snmpbulkget') {
                  outputText = deviceOfCommand.interfaces.map(i => 
                    `IF-MIB::ifIndex.${i.id} = INTEGER: ${i.id}\n` +
                    `IF-MIB::ifDescr.${i.id} = STRING: "${i.descr}"\n` +
                    `IF-MIB::ifType.${i.id} = INTEGER: ${i.type}(6)\n` +
                    `IF-MIB::ifSpeed.${i.id} = Gauge32: ${i.speed}\n` +
                    `IF-MIB::ifOperStatus.${i.id} = INTEGER: ${i.status === 'up' ? 'up(1)' : 'down(2)'}`
                  ).join('\n');
                  setExplanationText(`Sucesso SNMPWalk (Bulk-Response): Mapeou todos os index de placas físicas up/down e velocidades organizadas na ifTable.`);
                } else {
                  hasSucceeded = false;
                  outputText = `Error in packet\nReason: noSuchInstance (Select "snmpwalk" to read entire table collections or specify direct row interface ids)`;
                  errorExplanation = 'ERRO DE SELEÇÃO: Tabelas SNMP no padrão ifTable necessitam de varreduras sequenciais (snmpwalk) para consolidar múltiplas linhas.';
                }
              }
              // IP Forwarding standard
              else if (cleanOid === '.1.3.6.1.2.1.4.1.0' || cleanOid === 'ipForwarding.0') {
                if (cmdId === 'snmpset') {
                  hasSucceeded = false;
                  outputText = `Error in packet\nReason: notWritable (Firewall local do dispositivo bloqueia gravação remota na flag ipForwarding)`;
                  errorExplanation = 'BLOQUEADO: A alteração remota da flag de roteamento ipForwarding foi barrada pelas regras internas de segurança do agente.';
                } else {
                  outputText = `IP-MIB::ipForwarding.0 = INTEGER: forwarding(${deviceOfCommand.ipForwarding})`;
                  setExplanationText('Sucesso Get-Request: Indica se a máquina atua roteando pacotes físicos de rede local.');
                }
              }
              else if (cleanOid === '.1.3.6.1.2.1.4.3.0' || cleanOid === 'ipInReceives.0') {
                outputText = `IP-MIB::ipInReceives.0 = Counter32: ${deviceOfCommand.ipInReceives}`;
                setExplanationText('Sucesso Get-Request: Contador total acumulado de recepção IP de rede ethernet.');
              }
              // Group System root walk
              else if (cleanOid.startsWith('.1.3.6.1.2.1.1') || cleanOid === 'sys' || cleanOid === 'system') {
                if (cmdId === 'snmpwalk') {
                  outputText = `SNMPv2-MIB::sysDescr.0 = STRING: "${deviceOfCommand.sysDescr}"\n` +
                               `SNMPv2-MIB::sysObjectID.0 = OID: ${deviceOfCommand.sysObjectID}\n` +
                               `SNMPv2-MIB::sysUpTimeInstance = Timeticks: 1234500 (3:25:45.00)\n` +
                               `SNMPv2-MIB::sysContact.0 = STRING: "${deviceOfCommand.sysContact}"\n` +
                               `SNMPv2-MIB::sysName.0 = STRING: "${deviceOfCommand.sysName}"\n` +
                               `SNMPv2-MIB::sysLocation.0 = STRING: "${deviceOfCommand.sysLocation}"\n` +
                               `SNMPv2-MIB::sysServices.0 = INTEGER: ${deviceOfCommand.sysServices}`;
                  setExplanationText('Sucesso walk recursivo: O comando enviou repetidos GETNEXT obtendo a árvore .1.3.6.1.2.1.1 inteira.');
                } else {
                  hasSucceeded = false;
                  outputText = `Error: OID "${oid}" matches structural node. Use "snmpwalk" instead of "snmpget" to explore structural nodes.`;
                  errorExplanation = 'ERRO CONCEITUAL: Comandos do tipo "get" exigem precisão absoluta no OID de folha terminando em .0. Tente mudar para "snmpwalk".';
                }
              }
              // Fallback
              else {
                hasSucceeded = false;
                outputText = `Error: OID "${oid}" not matching any MIB instance. Reason: noSuchName`;
                errorExplanation = 'ERRO noSuchName: O OID digitado não foi encontrado sob as bibliotecas de MIBs habilitadas nesse Agente específico. Verifique a grafia dos algarismos.';
              }
            }
          }

          // Output logs injection
          setLogs(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              timestamp,
              type: hasSucceeded ? 'output' : 'error',
              text: outputText
            }
          ]);

          setPacketState(hasSucceeded ? 'done' : 'error');
          if (!hasSucceeded) {
            setExplanationText(errorExplanation);
          }

          // Callback to trigger Academy Labs success checking
          if (hasSucceeded && onNotifyLabComplete) {
            onNotifyLabComplete(
              targetIp,
              cmdId,
              oid,
              comm,
              writeVal,
              version
            );
          }

          setIsRunning(false);
        }, 800);
      }, 800);
    }, 700);
  };

  const handleRunCommand = () => {
    if (isRunning) return;

    if (!selectedOid.trim()) {
      setLogs(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          text: `Erro: OID não pode estar vazio para consultas tradicionais.`
        }
      ]);
      setPacketState('error');
      setExplanationText('Erro de Parâmetro: Digite ou escolha um OID na árvore para inicializar a simulação.');
      return;
    }

    // Scroll smoothly to the UNIX terminal console
    setTimeout(() => {
      scrollToLayoutElement('unix-terminal-console');
    }, 50);

    executeSNMPCall(
      selectedCommandId,
      selectedIp,
      snmpVersion,
      community,
      v3User,
      v3Level,
      v3AuthProto,
      v3AuthPass,
      v3PrivProto,
      v3PrivPass,
      selectedOid,
      writeValue
    );
  };

  const handleManualCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRunning) return;
    const inputCmd = manualCommand.trim();
    if (!inputCmd) return;

    setManualCommand('');

    const lowerInput = inputCmd.toLowerCase();

    // help / ?
    if (lowerInput === 'help' || lowerInput === '?') {
      setLogs(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'input',
          text: inputCmd
        },
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          text: `=== AJUDA DE COMANDOS SNMP SUPORTADOS ===\n` +
                `Você tem liberdade para digitar comandos SNMP clássicos de console UNIX!\n\n` +
                `Lista de Comandos Disponíveis:\n` +
                `- snmpget     : Consulta uma variável SNMP específica (folha)\n` +
                `- snmpwalk    : Percorre e renderiza sequencialmente uma árvore ou tabela MIB\n` +
                `- snmpset     : Altera o valor de uma variável SNMP gravável no Agente\n` +
                `- snmpbulkget : Consulta em massa múltiplas linhas de logs estruturados\n` +
                `- ping        : Envia pacotes ICMP para avaliar conectividade do IP\n` +
                `- clear       : Limpa todo o histórico de logs do terminal de simulação\n\n` +
                `Exemplos em SNMP v1 / v2c:\n` +
                `  snmpget -v 2c -c public 192.168.1.1 sysDescr.0\n` +
                `  snmpwalk -v 2c -c public 192.168.1.10 system\n` +
                `  snmpset -v 2c -c private 192.168.1.1 sysContact.0 s "suporte@corp.com"\n\n` +
                `Exemplo em SNMPv3 USM (Seguro):\n` +
                `  snmpget -v 3 -u academy_admin -l authPriv -a SHA -A AuthPass123 -x AES -X PrivPass456 192.168.1.50 sysName.0\n`
        }
      ]);
      return;
    }

    // clear / cls
    if (lowerInput === 'clear' || lowerInput === 'cls' || lowerInput === 'reset') {
      handleClearLogs();
      return;
    }

    // ping
    if (lowerInput.startsWith('ping')) {
      const parts = inputCmd.split(/\s+/);
      const targetIp = parts[1] || '192.168.1.1';

      setLogs(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'input',
          text: inputCmd
        }
      ]);

      setIsRunning(true);
      setPacketState('sending');
      setExplanationText(`Disparando sinal de ping (ICMP Echo Request) para o host ${targetIp}...`);

      setTimeout(() => {
        setPacketState('processing');
        setTimeout(() => {
          setPacketState('receiving');
          setTimeout(() => {
            const deviceMatch = devices.find(d => d.ip === targetIp);
            const name = deviceMatch ? deviceMatch.name : targetIp;
            const pingSucceeded = devices.some(d => d.ip === targetIp) || targetIp === '192.168.1.250';

            if (pingSucceeded) {
              setLogs(prev => [
                ...prev,
                {
                  id: Math.random().toString(),
                  timestamp: new Date().toLocaleTimeString(),
                  type: 'output',
                  text: `PING ${targetIp} (${targetIp}) 56(84) bytes of data.\n` +
                        `64 bytes from ${targetIp}: icmp_seq=1 ttl=64 time=1.18 ms\n` +
                        `64 bytes from ${targetIp}: icmp_seq=2 ttl=64 time=1.05 ms\n` +
                        `64 bytes from ${targetIp}: icmp_seq=3 ttl=64 time=1.21 ms\n` +
                        `--- ${targetIp} ping statistics ---\n` +
                        `3 packets transmitted, 3 received, 0% packet loss, time 2002ms\n` +
                        `rtt min/avg/max/mdev = 1.052/1.147/1.214/0.076 ms`
                }
              ]);
              setExplanationText(`Sucesso de conectividade: O host ${name} (${targetIp}) está ativo na sub-rede e respondendo perfeitamente.`);
              setPacketState('done');
            } else {
              setLogs(prev => [
                ...prev,
                {
                  id: Math.random().toString(),
                  timestamp: new Date().toLocaleTimeString(),
                  type: 'error',
                  text: `PING ${targetIp} (${targetIp}) 56(84) bytes of data.\n` +
                        `Request timeout for icmp_seq 1\n` +
                        `Request timeout for icmp_seq 2\n` +
                        `--- ${targetIp} ping statistics ---\n` +
                        `2 packets transmitted, 0 received, 100% packet loss`
                }
              ]);
              setExplanationText(`Inalcançável: O ping falhou. Verifique se o endereço IP corresponde a um dos agentes ativos da topologia.`);
              setPacketState('error');
            }
            setIsRunning(false);
          }, 600);
        }, 500);
      }, 400);
      return;
    }

    // Parse SNMP Commands Tokenizer with group strings bounds
    const matchesTokens = inputCmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const tokensCmd = matchesTokens.map(t => t.replace(/^"|"$/g, ''));

    const primaryCmd = tokensCmd[0].toLowerCase();
    if (!['snmpget', 'snmpwalk', 'snmpset', 'snmpbulkget', 'snmptrap'].includes(primaryCmd)) {
      setLogs(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'input',
          text: inputCmd
        },
        {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          text: `bash: ${tokensCmd[0]}: comando SNMP não reconhecido. Digite 'help' para listar instruções suportadas pelo laboratório.`
        }
      ]);
      return;
    }

    // Defaults for parser fallback
    let parsedVersion: 'v1' | 'v2c' | 'v3' = snmpVersion;
    let parsedCommunity = community;
    let parsedIp = selectedIp;
    let parsedOid = selectedOid;
    let parsedWriteVal = writeValue;

    let parsedV3User = v3User;
    let parsedV3Level: 'noAuthNoPriv' | 'authNoPriv' | 'authPriv' = v3Level;
    let parsedV3AuthProto = v3AuthProto;
    let parsedV3AuthPass = v3AuthPass;
    let parsedV3PrivProto = v3PrivProto;
    let parsedV3PrivPass = v3PrivPass;

    const nonFlagArgs: string[] = [];

    for (let i = 1; i < tokensCmd.length; i++) {
      const t = tokensCmd[i];
      if (t.startsWith('-')) {
        if (t === '-v' || t === '--version') {
          const val = tokensCmd[++i];
          if (val === '1') parsedVersion = 'v1';
          else if (val === '2c' || val === '2') parsedVersion = 'v2c';
          else if (val === '3') parsedVersion = 'v3';
        } else if (t === '-c' || t === '--community') {
          parsedCommunity = tokensCmd[++i];
        } else if (t === '-u' || t === '--user') {
          parsedV3User = tokensCmd[++i];
        } else if (t === '-l' || t === '--secLevel') {
          const val = tokensCmd[++i];
          if (['noAuthNoPriv', 'authNoPriv', 'authPriv'].includes(val)) {
            parsedV3Level = val as any;
          }
        } else if (t === '-a') {
          const val = tokensCmd[++i];
          if (['MD5', 'SHA'].includes(val.toUpperCase())) {
            parsedV3AuthProto = val.toUpperCase() as any;
          }
        } else if (t === '-A') {
          parsedV3AuthPass = tokensCmd[++i];
        } else if (t === '-x' || t === '-y') {
          const val = tokensCmd[++i];
          if (['DES', 'AES'].includes(val.toUpperCase())) {
            parsedV3PrivProto = val.toUpperCase() as any;
          }
        } else if (t === '-X' || t === '-Y') {
          parsedV3PrivPass = tokensCmd[++i];
        }
      } else {
        nonFlagArgs.push(t);
      }
    }

    let ipFoundIndex = -1;
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    for (let idx = 0; idx < nonFlagArgs.length; idx++) {
      if (ipRegex.test(nonFlagArgs[idx])) {
        parsedIp = nonFlagArgs[idx];
        ipFoundIndex = idx;
        break;
      }
    }

    if (ipFoundIndex === -1 && nonFlagArgs.length > 0) {
      if (nonFlagArgs.length >= 2) {
        parsedIp = nonFlagArgs[0];
        ipFoundIndex = 0;
      }
    }

    if (ipFoundIndex !== -1) {
      if (nonFlagArgs[ipFoundIndex + 1]) {
        parsedOid = nonFlagArgs[ipFoundIndex + 1];
      }
      
      if (primaryCmd === 'snmpset' && nonFlagArgs[ipFoundIndex + 2]) {
        const typeToken = nonFlagArgs[ipFoundIndex + 2];
        const valToken = nonFlagArgs[ipFoundIndex + 3];
        if (valToken !== undefined) {
          parsedWriteVal = valToken;
        } else {
          parsedWriteVal = typeToken;
        }
      }
    } else if (nonFlagArgs.length > 0) {
      parsedOid = nonFlagArgs[0];
    }

    // Synchronize Form UI inputs instantly
    onSelectCommand(primaryCmd);
    onOidChange(parsedOid);
    if (devices.some(d => d.ip === parsedIp)) {
      setSelectedIp(parsedIp);
    }
    setSnmpVersion(parsedVersion);
    setCommunity(parsedCommunity);
    setWriteValue(parsedWriteVal);

    setV3User(parsedV3User);
    setV3Level(parsedV3Level);
    setV3AuthProto(parsedV3AuthProto);
    setV3AuthPass(parsedV3AuthPass);
    setV3PrivProto(parsedV3PrivProto);
    setV3PrivPass(parsedV3PrivPass);

    executeSNMPCall(
      primaryCmd,
      parsedIp,
      parsedVersion,
      parsedCommunity,
      parsedV3User,
      parsedV3Level,
      parsedV3AuthProto,
      parsedV3AuthPass,
      parsedV3PrivProto,
      parsedV3PrivPass,
      parsedOid,
      parsedWriteVal,
      inputCmd
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Simulation Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-xl font-black text-slate-950 flex items-center gap-2 tracking-tight">
              <Terminal className="h-5 w-5 text-blue-700" />
              Simulador Ativo de Protocolo SNMP
            </h2>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
            Simulação didática cliente-provedor isolada. Modifique dados físicos nos Agentes, configure credenciais criptográficas de nível SNMPv3 e observe a mudança na console de monitoramento.
          </p>
        </div>

        {/* Sniffer Active Badge indicator */}
        <div className="flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-100 rounded-xl px-3.5 py-2 font-mono text-xs scale-95 shrink-0 self-start md:self-auto">
          <Radio className="h-4 w-4 text-blue-600 animate-pulse" />
          <span>NMS Sniffer: 192.168.1.250:162</span>
        </div>
      </div>

      {/* Main Grid Content: Control center vs Terminal & Inspector (stacked to full screen width) */}
      <div className="flex flex-col gap-6 w-full">
        
        {/* Left Control Column (Inputs & Trigger controls) - Takes full width */}
        <div id="snmp-param-panel" className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              <Settings2 className="h-4 w-4 text-blue-700" /> Painel de Parâmetros
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Portas UDP 161/162</span>
          </div>

          {/* Quick operation selectors */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 tracking-wide block">Instrução SNMP (Operação)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SNMP_COMMANDS.map(cmd => (
                <button
                  key={cmd.id}
                  id={`btn-cmd-${cmd.id}`}
                  onClick={() => {
                    onSelectCommand(cmd.id);
                    onOidChange(cmd.suggestedOid);
                  }}
                  className={`px-2.5 py-2 text-xs font-mono font-bold rounded-xl text-center border transition-all ${
                    selectedCommandId === cmd.id
                      ? 'bg-blue-700 text-white border-blue-700 shadow-sm shadow-blue-200'
                      : 'hover:bg-slate-50 text-slate-600 border-slate-200 bg-white'
                  }`}
                >
                  {cmd.name}
                </button>
              ))}
            </div>
          </div>

          {/* Target Active Host Agent profiles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 tracking-wide block">Agente IP (Dispositivo Físico)</label>
              <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded-full font-sans">
                {currentDevice.type.toUpperCase()} PROFILE
              </span>
            </div>
            
            <div className="relative">
              <select
                id="select-snmp-agent"
                value={selectedIp}
                onChange={(e) => setSelectedIp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none"
              >
                {devices.map(dev => (
                  <option key={dev.ip} value={dev.ip}>
                    {dev.ip} - {dev.name} ({dev.type === 'switch' ? 'Cisco IOS' : dev.type === 'server' ? 'Ubuntu Server' : 'Linux Core'})
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400">
                <Server className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Versions selection tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 tracking-wide block">Protocolo de Comunicação</label>
              <span className="text-[10px] text-slate-400 font-semibold font-sans">v3 adiciona segurança USM</span>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['v1', 'v2c', 'v3'] as const).map(v => (
                <button
                  key={v}
                  id={`btn-version-${v}`}
                  onClick={() => setSnmpVersion(v)}
                  className={`flex-1 text-center py-1.5 rounded-lg text-xs font-black transition-all ${
                    snmpVersion === v
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Sec parameters conditional rendering */}
          <AnimatePresence mode="wait">
            {snmpVersion !== 'v3' ? (
              <motion.div
                key="v1c"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2.5 bg-slate-50/50 border border-slate-200/80 p-3.5 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1 font-sans">
                    <Key className="h-3.5 w-3.5 text-slate-400" /> Community String
                  </span>
                  <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1.5 py-0.2 rounded font-sans uppercase tracking-widest">
                    Fraca / Texto Plano
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCommunity('public')}
                    className={`px-3 py-2 border rounded-xl text-xs font-mono font-bold transition-all ${
                      community === 'public'
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-slate-200 hover:bg-white text-slate-500 bg-white'
                    }`}
                  >
                    public (Read-Only)
                  </button>
                  <button
                    onClick={() => setCommunity('private')}
                    className={`px-3 py-2 border rounded-xl text-xs font-mono font-bold transition-all ${
                      community === 'private'
                        ? 'border-emerald-400 bg-emerald-50/65 text-emerald-800'
                        : 'border-slate-200 hover:bg-white text-slate-500 bg-white'
                    }`}
                  >
                    private (Read-Write)
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold block font-sans">Nome customizado de community:</span>
                  <input
                    id="input-community-string"
                    type="text"
                    placeholder="Escreva a community string..."
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-705 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="v3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-sky-50/25 border border-sky-100 p-4 rounded-xl space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-widest flex items-center gap-1 font-sans">
                    <Shield className="h-4 w-4 text-blue-700" /> Segurança SNMPv3 (USM)
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded font-sans uppercase tracking-widest">
                    Seguro / Encriptado
                  </span>
                </div>

                <div className="grid gap-2 grid-cols-2">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Usuário (Security Name)</label>
                    <input
                      id="v3-user"
                      type="text"
                      value={v3User}
                      onChange={(e) => setV3User(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-700 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Nível Segurança</label>
                    <select
                      id="v3-level"
                      value={v3Level}
                      onChange={(e) => setV3Level(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="noAuthNoPriv">noAuthNoPriv</option>
                      <option value="authNoPriv">authNoPriv</option>
                      <option value="authPriv">authPriv</option>
                    </select>
                  </div>
                </div>

                {/* Authentication configs details */}
                {v3Level !== 'noAuthNoPriv' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-2 grid-cols-2 bg-white/60 p-2.5 rounded-lg border border-slate-200/60"
                  >
                    <div>
                      <label className="text-[9px] uppercase font-extrabold text-slate-400 block mb-0.5">Protocolo Auth</label>
                      <select
                        value={v3AuthProto}
                        onChange={(e) => setV3AuthProto(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono font-medium focus:outline-none"
                      >
                        <option value="SHA">SHA-1</option>
                        <option value="MD5">MD5</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-extrabold text-slate-400 block mb-0.5">Senha Autenticação</label>
                      <input
                        type="password"
                        value={v3AuthPass}
                        onChange={(e) => setV3AuthPass(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-800 focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Cryptography Privacy AES/DES */}
                {v3Level === 'authPriv' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-2 grid-cols-2 bg-white/60 p-2.5 rounded-lg border border-slate-200/60"
                  >
                    <div>
                      <label className="text-[9px] uppercase font-extrabold text-slate-400 block mb-0.5">Cripto (Privacy)</label>
                      <select
                        value={v3PrivProto}
                        onChange={(e) => setV3PrivProto(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono font-medium focus:outline-none"
                      >
                        <option value="AES">AES-128</option>
                        <option value="DES">DES</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-extrabold text-slate-400 block mb-0.5">Senha de Hash Privacy</label>
                      <input
                        type="password"
                        value={v3PrivPass}
                        onChange={(e) => setV3PrivPass(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-800 focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* OID Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 tracking-wide block">Object Identifier (OID)</label>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold font-sans">MIB Branch</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="input-oid"
                type="text"
                value={selectedOid}
                onChange={(e) => onOidChange(e.target.value)}
                placeholder="Exemplo: .1.3.6.1.2.1.1.1.0"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-blue-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
              />
              <button
                id="btn-copy-input-oid"
                onClick={() => handleCopy(selectedOid)}
                className="shrink-0 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 bg-white shadow-sm flex items-center justify-center.5"
                title="Copiar OID"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              Sugestão corrente: <span className="font-bold text-slate-500">{currentCommand.oidDescription}</span>
            </span>

            {/* Device-specific recommendations buttons */}
            <div className="pt-1.5 flex flex-wrap gap-1.5">
              <button
                onClick={() => onOidChange('.1.3.6.1.2.1.1.1.0')}
                className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl text-slate-600 font-semibold"
              >
                sysDescr (.1)
              </button>
              <button
                onClick={() => onOidChange('.1.3.6.1.2.1.1.3.0')}
                className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl text-slate-600 font-semibold"
              >
                sysUpTime (.3)
              </button>
              <button
                onClick={() => onOidChange('.1.3.6.1.2.1.1.5.0')}
                className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl text-slate-600 font-semibold"
              >
                sysName (.5)
              </button>
              {selectedIp === '192.168.1.10' && (
                <button
                  onClick={() => onOidChange('.1.3.6.1.4.1.2021.11.11.0')}
                  className="text-[10px] font-mono bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl text-rose-800 font-semibold border border-rose-100/50"
                >
                  ssCpuIdle (Linux Only)
                </button>
              )}
              {selectedIp === '192.168.1.50' && (
                <button
                  onClick={() => onOidChange('.1.3.6.1.4.1.9.9.48.1.1.1.5.1')}
                  className="text-[10px] font-mono bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl text-indigo-800 font-semibold border border-indigo-100/50"
                >
                  ciscoMemFree (Cisco Switch)
                </button>
              )}
            </div>
          </div>

          {/* Conditional rewrite set interface parameters */}
          {selectedCommandId === 'snmpset' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5 bg-blue-50/20 p-3.5 rounded-xl border border-blue-100/60"
            >
              <label className="text-xs font-bold text-blue-900 uppercase block">Valor de Escrita (new Value)</label>
              <input
                id="input-set-value"
                type="text"
                placeholder="Exemplo email contato, rack id..."
                value={writeValue}
                onChange={(e) => setWriteValue(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 font-bold text-slate-800"
              />
              <span className="text-[9px] text-slate-400 block leading-tight font-sans">
                Lembrete acadêmico: alteração exige community write ("private") habilitada acima.
              </span>
            </motion.div>
          )}

          {/* Execute Button */}
          <button
            id="btn-execute-simulation"
            disabled={isRunning}
            onClick={handleRunCommand}
            className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase text-white flex items-center justify-center gap-2 transform transition-all duration-200 ${
              isRunning
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-blue-700 hover:bg-blue-800 active:scale-[0.98] shadow-md shadow-blue-200'
            }`}
          >
            <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Carregando MIB...' : 'Executar Comando'}
          </button>

          {/* SIMULADOR DE TRAPS INTERATIVO */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-xs font-black text-rose-950 uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
              Simulador de Eventos Críticos (Disparar Traps)
            </span>
            <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans">
              O modelo SNMP Trap permite que o Agente envie espontaneamente alertas para o NMS na porta 162. Clique nos gatilhos abaixo para interceptar emergências lógicas:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleTriggerSimulatedTrap('cpu')}
                className="px-2.5 py-2 hover:bg-rose-50 text-rose-900 border border-rose-200 rounded-xl bg-white text-[11px] font-bold transition flex items-center justify-center gap-1"
                title="Simular CPU > 95%"
              >
                <Cpu className="h-3 w-3 shrink-0" />
                Erro CPU
              </button>
              
              <button
                onClick={() => handleTriggerSimulatedTrap('link')}
                className="px-2.5 py-2 hover:bg-amber-50 text-amber-900 border border-amber-200 rounded-xl bg-white text-[11px] font-bold transition flex items-center justify-center gap-1"
                title="Simular Link Físico Down"
              >
                <Layers className="h-3 w-3 shrink-0" />
                Falha Link (eth1)
              </button>
              
              <button
                onClick={() => handleTriggerSimulatedTrap('temp')}
                className="px-2.5 py-2 hover:bg-orange-50 text-orange-900 border border-orange-200 rounded-xl bg-white text-[11px] font-bold transition flex items-center justify-center gap-1"
                title="Sensor de Calor Crítico"
              >
                <AlertCircle className="h-3 w-3 shrink-0" />
                Alta Temp
              </button>
            </div>
          </div>

        </div>

        {/* Outputs, Terminal & Inspector Column */}
        <div className="w-full flex flex-col gap-6">
          
          {/* UNIX-style Terminal CLI CONSOLE */}
          <div id="unix-terminal-console" className="bg-[#090D1A] rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex flex-col h-[360px]">
            
            {/* Header Title bar */}
            <div className="bg-[#121829] px-4 py-3 flex items-center justify-between border-b border-slate-900 select-none">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#a8b2d1] uppercase flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-blue-500" />
                UNIX CONSOLE (NMS Terminal)
              </span>

              <button
                id="btn-clear-terminal"
                onClick={handleClearLogs}
                className="text-slate-500 hover:text-white transition-colors bg-[#1d243a] p-1.5 rounded-lg border border-slate-700"
                title="Limpar Histórico"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Console log outputs */}
            <div className="p-4 font-mono text-xs text-slate-200 bg-[#0a0f20] flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Scrollable area for logs */}
              <div ref={terminalScrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1 mb-2">
                {logs.map((log) => {
                  if (log.type === 'input') {
                    return (
                      <div key={log.id} className="space-y-0.5" id={`log-${log.id}`}>
                        <div className="flex items-start gap-1">
                          <span className="text-blue-400 font-extrabold select-none">nms@academy:~$</span>
                          <span className="text-slate-100 font-bold select-all break-all">{log.text}</span>
                        </div>
                      </div>
                    );
                  } else if (log.type === 'output') {
                    // highlighting mutated properties green
                    return (
                      <div key={log.id} id={`log-${log.id}`} className="p-3 bg-emerald-950/25 border border-emerald-900/40 text-emerald-300 rounded-xl leading-relaxed select-text whitespace-pre-wrap font-medium shadow-sm">
                        {log.text}
                      </div>
                    );
                  } else if (log.type === 'error') {
                    return (
                      <div key={log.id} id={`log-${log.id}`} className="p-3.5 bg-[#541c1c] border border-red-900/50 text-red-350 rounded-xl select-text whitespace-pre-wrap">
                        {log.text}
                      </div>
                    );
                  } else {
                    return (
                      <div key={log.id} id={`log-${log.id}`} className="text-slate-500 text-[10px] select-none italic font-normal leading-tight">
                        {log.text}
                      </div>
                    );
                  }
                })}
                {isRunning && (
                  <div className="flex items-center gap-1.5 text-blue-400 text-xs animate-pulse font-bold">
                    <span>► Aguardando resposta UDP Agente...</span>
                  </div>
                )}
              </div>

              {/* Interative Command Box Line */}
              <form onSubmit={handleManualCommandSubmit} className="flex items-center gap-2 border-t border-slate-900/60 pt-3 shrink-0">
                <span className="text-blue-400 font-extrabold select-none shrink-0">nms@academy:~$</span>
                <input
                  id="input-terminal-command"
                  type="text"
                  value={manualCommand}
                  onChange={(e) => setManualCommand(e.target.value)}
                  placeholder="Escreva um comando SNMP (ex: help)..."
                  className="flex-1 bg-transparent text-slate-150 font-mono text-xs focus:outline-none border-none p-0 focus:ring-0 placeholder:text-slate-700 focus:placeholder:opacity-20"
                  disabled={isRunning}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={isRunning || !manualCommand.trim()}
                  className="px-2.5 py-1 text-[10px] bg-blue-600 hover:bg-blue-700 text-white rounded font-mono font-bold transition-all disabled:opacity-25 disabled:bg-slate-900 shrink-0 border border-blue-500/30"
                >
                  ENTER
                </button>
              </form>
            </div>
          </div>

          {/* Packet and UDP flow view */}
          <div id="udp-transit-visualizer" className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-3.5 overflow-hidden">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
              <Radio className={`h-4 w-4 ${isRunning ? 'text-blue-500 animate-bounce' : 'text-slate-400'}`} />
              Visualização Dinâmica de Trânsito UDP
            </span>

            <div className="relative bg-slate-50 h-28 rounded-xl border border-slate-200/60 flex items-center justify-between px-3 sm:px-6 overflow-hidden select-none">
              
              {/* Center dashed path line */}
              <div className="absolute left-[24%] right-[24%] sm:left-[20%] sm:right-[20%] top-[45%] h-0.5 border-t-2 border-dashed border-slate-200 pointer-events-none" />

              {/* Station NMS (Manager) */}
              <div className="flex flex-col items-center z-10 shrink-0">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
                  <Terminal className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-600 mt-1">NMS (Manager)</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 bg-slate-200/50 px-1 sm:px-1.5 py-0.5 rounded mt-0.5">192.168.1.250</span>
              </div>

              {/* Flights packets */}
              <AnimatePresence>
                {packetState === 'sending' && (
                  <motion.div
                    initial={{ left: '18%', opacity: 0 }}
                    animate={{ left: '68%', opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'linear' }}
                    className="absolute top-[32%] p-1 sm:p-1.5 rounded-lg bg-blue-700 text-white shadow-md z-20 flex flex-col items-center leading-none scale-75 sm:scale-90"
                  >
                    <span className="text-[7.5px] sm:text-[9px] font-mono uppercase tracking-widest font-black px-1">
                      <span className="hidden sm:inline">UDP_REQUEST</span>
                      <span className="sm:hidden">REQ</span>
                    </span>
                    <CornerDownRight className="h-3 w-3 mt-0.5 animate-pulse" />
                  </motion.div>
                )}

                {packetState === 'receiving' && (
                  <motion.div
                    initial={{ left: '68%', opacity: 0 }}
                    animate={{ left: '20%', opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'linear' }}
                    className="absolute top-[32%] p-1 sm:p-1.5 rounded-lg bg-emerald-600 text-white shadow-md z-20 flex flex-col items-center leading-none scale-75 sm:scale-90"
                  >
                    <span className="text-[7.5px] sm:text-[9px] font-mono uppercase tracking-widest font-black px-1">
                      <span className="hidden sm:inline">UDP_RESPONSE</span>
                      <span className="sm:hidden">RESP</span>
                    </span>
                    <CornerDownRight className="h-3 w-3 mt-0.5 rotate-180 animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Process indicator in intermediate */}
              {packetState === 'processing' && (
                <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 flex h-8 items-center bg-indigo-600 text-white text-[8px] sm:text-[9px] font-mono tracking-widest font-bold px-2.5 sm:px-3.5 rounded-full shadow-lg z-20 animate-pulse border border-indigo-500 whitespace-nowrap">
                  <span className="hidden sm:inline">AGENT_PROCESSING...</span>
                  <span className="sm:hidden">PROCESSING...</span>
                </div>
              )}

              {/* Physical Agent Target node IP */}
              <div className="flex flex-col items-center z-10 shrink-0">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                  packetState === 'done'
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800 scale-105 shadow-md shadow-emerald-50'
                    : packetState === 'error'
                    ? 'bg-rose-100 border-rose-400 text-rose-800 animate-shake scale-105'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <Cpu className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-600 mt-1 max-w-[70px] truncate sm:max-w-none text-center">{currentDevice.name}</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 bg-slate-200/50 px-1 sm:px-1.5 py-0.5 rounded mt-0.5">{selectedIp}</span>
              </div>

            </div>
          </div>

          {/* OID Didactics & Inspector Sidecar Panel */}
          <div className="bg-blue-50/45 border border-blue-150/80 rounded-2xl p-5 shadow-none space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
              <span className="text-xs font-black text-blue-950 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                <Info className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                Explicações Didáticas & Inspector de OID
              </span>
              <span className="text-[10px] text-blue-800 font-mono font-bold select-all">{selectedOid}</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400 font-sans">Significado Estrutural:</span>
                <p className="text-xs font-black text-slate-900 leading-snug mt-0.5 select-text font-sans">
                  {selectedOidMeta.meaning}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400 font-sans">O que a variável faz:</span>
                <p className="text-xs text-slate-650 leading-relaxed mt-0.5 select-text font-sans">
                  {selectedOidMeta.description}
                </p>
              </div>

              <div className={`p-3 border-l-4 rounded-r-xl select-text font-sans ${selectedOidMeta.importanceColor}`}>
                <span className="text-[10px] uppercase font-extrabold text-slate-500 block leading-none mb-1">Importância Operacional da MIB:</span>
                <p className="text-xs font-medium leading-relaxed">
                  {selectedOidMeta.importance}
                </p>
              </div>

              {/* Dynamic instruction feedback of operations */}
              <div className="bg-white border border-blue-100 p-3 rounded-lg flex gap-2 w-full shadow-sm text-xs leading-relaxed select-text mt-2 font-sans">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-slate-600">
                  <span className="font-bold text-slate-800">Resultado dos Bastidores: </span>
                  {explanationText}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
