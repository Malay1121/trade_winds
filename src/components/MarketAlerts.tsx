import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, PriceAlert, NewsItem, TradeOpportunity } from '../types/game';
import { getActiveAlerts, createPriceAlert, removePriceAlert } from '../utils/gameLogic';
import { goods } from '../data/goods';
import { towns } from '../data/towns';
import { 
  Bell, 
  X, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Newspaper, 
  Target,
  Clock,
  DollarSign,
  MapPin,
  Zap
} from 'lucide-react';

interface MarketAlertsProps {
  gameState: GameState;
  onClose: () => void;
  onUpdateGameState: (newState: GameState) => void;
}

export const MarketAlerts: React.FC<MarketAlertsProps> = ({ 
  gameState, 
  onClose, 
  onUpdateGameState 
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'news' | 'opportunities'>('alerts');
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlertGood, setNewAlertGood] = useState('');
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [newAlertType, setNewAlertType] = useState<'above' | 'below'>('above');

  const { alerts, opportunities, news } = getActiveAlerts(gameState);

  const handleCreateAlert = () => {
    if (newAlertGood && newAlertPrice) {
      const price = parseFloat(newAlertPrice);
      if (price > 0) {
        const newState = { ...gameState };
        createPriceAlert(newState, newAlertGood, price, newAlertType);
        onUpdateGameState(newState);
        
        setShowCreateAlert(false);
        setNewAlertGood('');
        setNewAlertPrice('');
        setNewAlertType('above');
      }
    }
  };

  const handleRemoveAlert = (alertId: string) => {
    const newState = { ...gameState };
    removePriceAlert(newState, alertId);
    onUpdateGameState(newState);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getNewsIcon = (type: string) => {
    switch (type) {
      case 'weather': return <Zap className="w-5 h-5" />;
      case 'event': return <AlertTriangle className="w-5 h-5" />;
      case 'price_change': return <TrendingUp className="w-5 h-5" />;
      case 'opportunity': return <Target className="w-5 h-5" />;
      default: return <Newspaper className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="text-amber-600 w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 font-serif">Market Intelligence</h2>
                <p className="text-gray-600">Stay informed about market conditions and opportunities</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-4 bg-white/60 p-1 rounded-lg">
            {[
              { id: 'alerts', label: 'Price Alerts', count: alerts.length },
              { id: 'news', label: 'Market News', count: news.length },
              { id: 'opportunities', label: 'Trade Opportunities', count: opportunities.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/40'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'alerts' && (
              <motion.div
                key="alerts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Create Alert Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Active Price Alerts</h3>
                  <button
                    onClick={() => setShowCreateAlert(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Alert
                  </button>
                </div>

                {/* Create Alert Form */}
                {showCreateAlert && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4"
                  >
                    <h4 className="font-medium text-gray-800">Create New Price Alert</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Good</label>
                        <select
                          value={newAlertGood}
                          onChange={(e) => setNewAlertGood(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <option value="">Select a good...</option>
                          {goods.map(good => (
                            <option key={good.id} value={good.id}>{good.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Price</label>
                        <input
                          type="number"
                          value={newAlertPrice}
                          onChange={(e) => setNewAlertPrice(e.target.value)}
                          placeholder="Enter price..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alert When</label>
                        <select
                          value={newAlertType}
                          onChange={(e) => setNewAlertType(e.target.value as 'above' | 'below')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <option value="above">Price goes above</option>
                          <option value="below">Price goes below</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowCreateAlert(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateAlert}
                        disabled={!newAlertGood || !newAlertPrice}
                        className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Create Alert
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Alert List */}
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No active price alerts</p>
                      <p className="text-sm mt-2">Create alerts to be notified when prices reach your targets</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        layout
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {alert.alertType === 'above' ? (
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-800">{alert.goodName}</h4>
                              <p className="text-sm text-gray-600">
                                Alert when price goes {alert.alertType} {alert.targetPrice} gold
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Turn {alert.createdTurn}
                            </span>
                            <button
                              onClick={() => handleRemoveAlert(alert.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'news' && (
              <motion.div
                key="news"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-800">Market News & Updates</h3>
                
                <div className="space-y-3">
                  {news.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Newspaper className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent market news</p>
                      <p className="text-sm mt-2">News and updates will appear here as events unfold</p>
                    </div>
                  ) : (
                    news.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className={`border rounded-lg p-4 ${getSeverityColor(item.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getNewsIcon(item.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{item.title}</h4>
                              <div className="flex items-center gap-2 text-xs">
                                <Clock className="w-3 h-3" />
                                <span>Turn {item.turn}</span>
                                {item.townId && (
                                  <>
                                    <MapPin className="w-3 h-3 ml-2" />
                                    <span>{towns.find(t => t.id === item.townId)?.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-sm mb-2">{item.content}</p>
                            <p className="text-xs font-medium">{item.impact}</p>
                            {item.goodIds && item.goodIds.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.goodIds.map(goodId => {
                                  const good = goods.find(g => g.id === goodId);
                                  return good ? (
                                    <span key={goodId} className="text-xs bg-white/60 px-2 py-1 rounded">
                                      {good.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'opportunities' && (
              <motion.div
                key="opportunities"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-800">Trade Opportunities</h3>
                
                <div className="space-y-3">
                  {opportunities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No current trade opportunities</p>
                      <p className="text-sm mt-2">Profitable trading opportunities will be identified automatically</p>
                    </div>
                  ) : (
                    opportunities.map((opportunity) => (
                      <motion.div
                        key={opportunity.id}
                        layout
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getUrgencyColor(opportunity.urgency)}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-800">{opportunity.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getUrgencyColor(opportunity.urgency)}`}>
                            {opportunity.urgency} Priority
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Buy Price:</span>
                            <div className="font-medium flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {opportunity.sourcePrice}g
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Sell Price:</span>
                            <div className="font-medium flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {opportunity.targetPrice}g
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Profit:</span>
                            <div className="font-medium text-green-600 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              +{opportunity.potentialProfit}g
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Margin:</span>
                            <div className="font-medium">
                              {(opportunity.profitMargin * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-2">{opportunity.description}</p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Valid until turn {opportunity.validUntil}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MarketAlerts;
