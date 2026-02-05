import { useState, useRef, useCallback } from 'react';

// 历史数据管理 Hook
const MAX_HISTORY_POINTS = 60; // 保留60秒的数据

export function useHistoryData() {
  const [history, setHistory] = useState({
    cpu: [],
    gpu: [],
    memory: [],
    network: [],
    load: [],
    diskIO: []
  });
  const initialLoad = useRef(false);

  const addDataPoint = useCallback((type, data) => {
    setHistory(prev => {
      const typeHistory = [...prev[type]];
      typeHistory.push({
        timestamp: data.timestamp,
        ...data
      });

      // 保留最近的数据点
      if (typeHistory.length > MAX_HISTORY_POINTS) {
        typeHistory.shift();
      }

      return {
        ...prev,
        [type]: typeHistory
      };
    });
  }, []);

  const addCpuData = useCallback((data) => {
    addDataPoint('cpu', {
      timestamp: Date.now(),
      usage: data.usage,
      temp: data.temp
    });
  }, [addDataPoint]);

  const addGpuData = useCallback((data) => {
    addDataPoint('gpu', {
      timestamp: Date.now(),
      usage: data.controllers?.[0]?.usage || 0,
      memoryUsed: data.controllers?.[0]?.memoryUsed || 0
    });
  }, [addDataPoint]);

  const addMemoryData = useCallback((data) => {
    addDataPoint('memory', {
      timestamp: Date.now(),
      usagePercent: data.usagePercent,
      used: data.used,
      cached: data.cached
    });
  }, [addDataPoint]);

  const addNetworkData = useCallback((data) => {
    addDataPoint('network', {
      timestamp: Date.now(),
      rx_sec: data.rx_sec,
      tx_sec: data.tx_sec
    });
  }, [addDataPoint]);

  const addLoadData = useCallback((data) => {
    addDataPoint('load', {
      timestamp: Date.now(),
      '1min': data['1min'],
      '5min': data['5min'],
      '15min': data['15min']
    });
  }, [addDataPoint]);

  const addDiskIOData = useCallback((data) => {
    addDataPoint('diskIO', {
      timestamp: Date.now(),
      readSec: data.io?.readSec || 0,
      writeSec: data.io?.writeSec || 0
    });
  }, [addDataPoint]);

  return {
    history,
    addCpuData,
    addGpuData,
    addMemoryData,
    addNetworkData,
    addLoadData,
    addDiskIOData,
    initialLoad
  };
}
