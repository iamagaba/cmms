import {useEffect, useState} from 'react';
import {networkService, NetworkStatus} from '@/services/networkService';

export const useNetwork = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    networkService.getStatus()
  );

  useEffect(() => {
    const unsubscribe = networkService.addListener(setNetworkStatus);
    return unsubscribe;
  }, []);

  return {
    ...networkStatus,
    isOnline: networkService.isOnline(),
    isOffline: networkService.isOffline(),
    networkType: networkService.getNetworkTypeDescription(),
    connectionQuality: networkService.getConnectionQuality(),
    isSuitableForLargeOperations: networkService.isSuitableForLargeOperations(),
    testConnectivity: networkService.testConnectivity,
    waitForConnection: networkService.waitForConnection,
  };
};