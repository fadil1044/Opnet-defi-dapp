import { useState, useEffect, useCallback } from ‘react’;

// OP_NET OP_WALLET injects itself as window.opnet
// This is the REAL integration following docs.opnet.org

const OPNET_PROVIDER_KEY = ‘opnet’;
const OP_NET_RPC = ‘https://api.opnet.org’;

export const NETWORKS = {
MAINNET: ‘bitcoin’,
TESTNET: ‘testnet’,
REGTEST: ‘regtest’,
};

export function useOPWallet() {
const [provider, setProvider] = useState(null);
const [address, setAddress] = useState(null);
const [publicKey, setPublicKey] = useState(null);
const [balance, setBalance] = useState(null);
const [network, setNetwork] = useState(null);
const [isConnecting, setIsConnecting] = useState(false);
const [isConnected, setIsConnected] = useState(false);
const [error, setError] = useState(null);
const [walletInstalled, setWalletInstalled] = useState(false);

// Detect OP_WALLET on mount and on window ready
useEffect(() => {
const checkWallet = () => {
if (typeof window !== ‘undefined’ && window[OPNET_PROVIDER_KEY]) {
setProvider(window[OPNET_PROVIDER_KEY]);
setWalletInstalled(true);
return true;
}
return false;
};

```
if (!checkWallet()) {
  // OP_WALLET may inject asynchronously - wait for it
  const timeout = setTimeout(() => {
    checkWallet();
  }, 1000);
  return () => clearTimeout(timeout);
}
```

}, []);

// Listen for wallet events
useEffect(() => {
if (!provider) return;

```
const handleAccountChange = (accounts) => {
  if (accounts && accounts.length > 0) {
    setAddress(accounts[0]);
  } else {
    disconnect();
  }
};

const handleNetworkChange = (newNetwork) => {
  setNetwork(newNetwork);
};

const handleDisconnect = () => {
  disconnect();
};

try {
  provider.on?.('accountsChanged', handleAccountChange);
  provider.on?.('networkChanged', handleNetworkChange);
  provider.on?.('disconnect', handleDisconnect);
} catch (e) {
  console.warn('OP_WALLET event listeners not available:', e);
}

return () => {
  try {
    provider.removeListener?.('accountsChanged', handleAccountChange);
    provider.removeListener?.('networkChanged', handleNetworkChange);
    provider.removeListener?.('disconnect', handleDisconnect);
  } catch (e) {}
};
```

}, [provider]);

const connect = useCallback(async () => {
setError(null);

```
if (!provider) {
  setError('OP_WALLET not installed. Please install it from Chrome Web Store.');
  return false;
}

setIsConnecting(true);

try {
  // Request account access — this triggers the OP_WALLET popup for user permission
  let accounts;
  
  // Try standard requestAccounts first
  if (provider.requestAccounts) {
    accounts = await provider.requestAccounts();
  } else if (provider.connect) {
    const result = await provider.connect();
    accounts = result?.address ? [result.address] : result;
  } else if (provider.getAccounts) {
    accounts = await provider.getAccounts();
  }

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned from OP_WALLET');
  }

  const userAddress = typeof accounts[0] === 'string' ? accounts[0] : accounts[0]?.address;
  setAddress(userAddress);
  setIsConnected(true);

  // Get public key
  try {
    if (provider.getPublicKey) {
      const pubKey = await provider.getPublicKey();
      setPublicKey(pubKey);
    }
  } catch (e) {
    console.warn('Could not get public key:', e);
  }

  // Get network
  try {
    if (provider.getNetwork) {
      const net = await provider.getNetwork();
      setNetwork(net);
    }
  } catch (e) {
    console.warn('Could not get network:', e);
  }

  // Fetch balance via OP_NET RPC
  await fetchBalance(userAddress);

  return true;
} catch (err) {
  console.error('OP_WALLET connection error:', err);
  if (err.code === 4001) {
    setError('Connection rejected by user.');
  } else {
    setError(err.message || 'Failed to connect to OP_WALLET');
  }
  return false;
} finally {
  setIsConnecting(false);
}
```

}, [provider]);

const disconnect = useCallback(() => {
setAddress(null);
setPublicKey(null);
setBalance(null);
setNetwork(null);
setIsConnected(false);
setError(null);

```
try {
  provider?.disconnect?.();
} catch (e) {}
```

}, [provider]);

const fetchBalance = useCallback(async (addr) => {
const targetAddress = addr || address;
if (!targetAddress) return;

```
try {
  const response = await fetch(`${OP_NET_RPC}/api/v1/address/balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: targetAddress }),
  });

  if (response.ok) {
    const data = await response.json();
    setBalance(data?.balance ?? data?.result ?? null);
  }
} catch (e) {
  // Silent fail — RPC might be unreachable in dev
  console.warn('Balance fetch failed:', e);
}
```

}, [address]);

// Sign a message (triggers OP_WALLET popup for permission)
const signMessage = useCallback(async (message) => {
if (!provider || !isConnected) throw new Error(‘Wallet not connected’);

```
try {
  if (provider.signMessage) {
    return await provider.signMessage(message);
  }
  throw new Error('signMessage not supported by this wallet version');
} catch (err) {
  if (err.code === 4001) throw new Error('User rejected signature');
  throw err;
}
```

}, [provider, isConnected]);

// Send a transaction via OP_NET (triggers OP_WALLET popup)
const sendTransaction = useCallback(async (txData) => {
if (!provider || !isConnected) throw new Error(‘Wallet not connected’);

```
try {
  if (provider.sendBitcoin) {
    return await provider.sendBitcoin(txData.to, txData.amount);
  }
  if (provider.sendTransaction) {
    return await provider.sendTransaction(txData);
  }
  if (provider.signAndBroadcastTransaction) {
    return await provider.signAndBroadcastTransaction(txData);
  }
  throw new Error('No send method available on this wallet');
} catch (err) {
  if (err.code === 4001) throw new Error('Transaction rejected by user');
  throw err;
}
```

}, [provider, isConnected]);

// Call an OP_NET smart contract (read — no signing needed)
const callContract = useCallback(async (contractAddress, method, params = []) => {
try {
const response = await fetch(`${OP_NET_RPC}/api/v1/contract/call`, {
method: ‘POST’,
headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify({
contractAddress,
method,
params,
from: address,
}),
});
return await response.json();
} catch (err) {
throw new Error(`Contract call failed: ${err.message}`);
}
}, [address]);

// Execute a contract function (write — triggers wallet popup)
const executeContract = useCallback(async (contractAddress, method, params = [], value = 0) => {
if (!provider || !isConnected) throw new Error(‘Wallet not connected’);

```
try {
  // Build transaction data for OP_NET contract interaction
  const txData = {
    to: contractAddress,
    data: JSON.stringify({ method, params }),
    value,
  };

  if (provider.executeContract) {
    return await provider.executeContract(contractAddress, method, params, value);
  }

  return await sendTransaction(txData);
} catch (err) {
  if (err.code === 4001) throw new Error('Transaction rejected by user');
  throw err;
}
```

}, [provider, isConnected, sendTransaction]);

return {
provider,
address,
publicKey,
balance,
network,
isConnecting,
isConnected,
error,
walletInstalled,
connect,
disconnect,
signMessage,
sendTransaction,
callContract,
executeContract,
fetchBalance,
};
}
