/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Folder, FileCode, Check, Send, ChevronRight, Hash, ShieldAlert } from 'lucide-react';
import { MIB_NODES } from '../data';
import { MIBNode } from '../types';

interface MIBTreePanelProps {
  onLoadOid: (oid: string, commandType?: string) => void;
}

export default function MIBTreePanel({ onLoadOid }: MIBTreePanelProps) {
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>('1.3.6.1.2.1.1.1.0'); // defaults to sysDescr
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'root': true,
    '1': true,
    '1.3': true,
    '1.3.6': true,
    '1.3.6.1': true,
    '1.3.6.1.2': true,
    '1.3.6.1.2.1': true,
    '1.3.6.1.2.1.1': true,
    '1.3.6.1.2.1.2': false,
    '1.3.6.1.2.1.4': false,
  });

  const [copied, setCopied] = useState<boolean>(false);

  const toggleExpand = (key: string) => {
    setExpandedNodes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedNode = MIB_NODES[selectedNodeKey];

  // Helper to render tree nodes recursively
  const renderTree = (nodeKey: string, depth: number = 0) => {
    const node = MIB_NODES[nodeKey];
    if (!node) return null;

    const isLeaf = !node.children || node.children.length === 0;
    const isExpanded = expandedNodes[nodeKey];
    const isSelected = selectedNodeKey === nodeKey;

    return (
      <div key={nodeKey} className="select-none">
        {/* Row element */}
        <div
          onClick={() => {
            if (!isLeaf) {
              toggleExpand(nodeKey);
            }
            setSelectedNodeKey(nodeKey);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
            isSelected
              ? 'bg-blue-50 text-blue-900 border-l-2 border-blue-600 font-medium'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {/* Arrow / Bullet */}
          {!isLeaf ? (
            <ChevronRight
              className={`h-4 w-4 shrink-0 transition-transform text-slate-400 ${
                isExpanded ? 'rotate-90 text-blue-600' : ''
              }`}
            />
          ) : (
            <div className="w-4 h-4 shrink-0" />
          )}

          {/* Icon */}
          {!isLeaf ? (
            <Folder className={`h-4 w-4 shrink-0 ${isExpanded ? 'text-blue-500 fill-blue-50' : 'text-slate-400'}`} />
          ) : (
            <FileCode className={`h-4 w-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
          )}

          {/* Node Identifier */}
          <span className="font-mono text-xs text-slate-500 truncate">{nodeKey.split('.').pop()}</span>
          
          <span className="font-sans text-xs truncate font-medium">
            {node.name}
          </span>
        </div>

        {/* Children render */}
        {!isLeaf && isExpanded && (
          <div className="relative mt-1">
            {/* Thread guide lines */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[1px] bg-slate-200"
              style={{ left: `${depth * 16 + 20}px` }}
            />
            {node.children!.map(childKey => renderTree(childKey, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600" />
          Navegador da Árvore MIB e OIDs
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Explore a taxonomia universal de Object Identifiers (OIDs). Clique em qualquer nó para inspecionar, copiar ou carregar direto no terminal simulado.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* Left Tree Navigator */}
        <div className="md:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm max-h-[540px] overflow-y-auto">
          <div className="border-b border-indigo-50/80 pb-3 mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" /> Estrutura Hierárquica
            </span>
            <span className="text-[10px] font-mono bg-slate-50 border px-1.5 py-0.5 rounded text-slate-400">
              ISO / IETF STD
            </span>
          </div>

          <div className="space-y-1">
            {renderTree('root')}
          </div>
        </div>

        {/* Right Node Inspector */}
        <div className="md:col-span-7 space-y-4">
          {selectedNode ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-5">
              <div className="absolute top-0 right-0 p-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedNode.access === 'Read-Only'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : selectedNode.access === 'Read-Write'
                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {selectedNode.access}
                </span>
              </div>

              {/* Title & OID String */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-medium">
                  Nó do Atributo MIB
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedNode.name}</h3>
                
                <div className="mt-3 flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <code className="text-xs font-mono text-blue-700 font-bold select-all break-all pr-2">
                    {selectedNode.oid}
                  </code>
                  <button
                    id="btn-copy-oid"
                    onClick={() => handleCopy(selectedNode.oid)}
                    className="shrink-0 p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-500 hover:text-blue-600 transition-colors bg-white shadow-sm"
                    title="Copiar OID"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Layers className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição Funcional</h4>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-dotted border-slate-200">
                  {selectedNode.description}
                </p>
              </div>

              {/* Specifications Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-slate-100 bg-slate-50/20 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Sintaxe ASN.1</span>
                  <span className="text-xs font-mono font-medium text-slate-800 break-all">{selectedNode.syntax}</span>
                </div>
                
                <div className="border border-slate-100 bg-slate-50/20 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Permissão de Acesso</span>
                  <span className="text-xs font-mono font-medium text-slate-800">{selectedNode.access}</span>
                </div>
              </div>

              {/* Actions */}
              {selectedNode.access !== 'No-Access' ? (
                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    id="btn-load-simulator-get"
                    onClick={() => onLoadOid(selectedNode.oid, 'snmpget')}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Carregar no snmpget
                  </button>

                  {selectedNode.access === 'Read-Write' && (
                    <button
                      id="btn-load-simulator-set"
                      onClick={() => onLoadOid(selectedNode.oid, 'snmpset')}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                    >
                      Editar com snmpset
                    </button>
                  )}
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-amber-600 bg-amber-50/40 p-3 rounded-xl">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  Nós de categoria "Nó Estrutural" não podem ser consultados diretamente; são apenas divisórias na árvore. Selecione um nó folha.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-400">
              Selecione um nó na árvore ao lado para inspecionar os detalhes dele.
            </div>
          )}

          {/* Quick Guide */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs space-y-2 text-slate-700">
            <h5 className="font-bold text-blue-900 flex items-center gap-1">
              Como funciona o OID?
            </h5>
            <p className="leading-relaxed">
              O OID é expresso por termos numéricos separados por pontos. Por exemplo: <code>.1.3.6.1.2.1.1.1.0</code> <br />
              Este caminho é lido da raiz para as folhas: <code>/iso(1)/org(3)/dod(6)/internet(1)/mgmt(2)/mib-2(1)/system(1)/sysDescr(1)/instância_única(0)</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
