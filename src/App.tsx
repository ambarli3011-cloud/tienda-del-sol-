/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CommerceProvider } from './context/CommerceContext';
import { HeaderNav } from './components/HeaderNav';
import { DualSplitView } from './components/DualView/DualSplitView';
import { OnlineStoreView } from './components/OnlineStore/OnlineStoreView';
import { PosView } from './components/Pos/PosView';
import { InventoryOrdersView } from './components/Inventory/InventoryOrdersView';
import { AppViewMode } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppViewMode>('dual');

  return (
    <CommerceProvider>
      <div className="min-h-screen bg-stone-950 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
        
        {/* Navigation Bar with Mode Switcher */}
        <HeaderNav
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view)}
        />

        {/* Dynamic Workspace Container */}
        <div className="flex-1 flex flex-col">
          {currentView === 'dual' && (
            <DualSplitView
              onSelectView={(mode) => setCurrentView(mode)}
            />
          )}

          {currentView === 'online' && (
            <OnlineStoreView />
          )}

          {currentView === 'pos' && (
            <PosView />
          )}

          {currentView === 'inventory' && (
            <InventoryOrdersView />
          )}
        </div>

      </div>
    </CommerceProvider>
  );
}
