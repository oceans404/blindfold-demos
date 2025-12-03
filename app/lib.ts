export enum KeyType {
  ClusterKey = 'cluster',
  SecretKey = 'secret',
}

interface CombinationResult {
  nodes: number[];
  result: string;
  isValid: boolean;
}

export const encryptThresholdData = async (
    dataToEncrypt: string | number | bigint,
    nodeCount: number,
    threshold: number,
    keyType: KeyType,
    seed?: string,
) => {

    const payload: any = {
        secret: dataToEncrypt,
        cluster_size: nodeCount,
        threshold,
        key_type: keyType,
    };
    if (keyType === KeyType.SecretKey) payload.key_seed = seed;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BLINDFOLD_API_ENDPOINT}/api/blindfold_encrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({} as any));
    
    if (!res.ok) {
        throw new Error(json?.error || json?.message || res.statusText);
    }

    return (json as any).shares;
}

export const decryptThresholdData = async (
    encryptedData: string | string[],
    nodeCount: number,
    threshold: number,
    keyType: KeyType,
    seed?: string,
) => {
    const combinations = getCombinations(nodeCount, threshold);
    const results: CombinationResult[] = [];
    const successCount: number[] = Array(nodeCount).fill(0);
    const failCount: number[] = Array(nodeCount).fill(0);

    for (const combo of combinations) {
        const comboShares = combo.map(idx => encryptedData[idx]);
        
        let result = "";
        let isValid = false;
        
        try {
            const payload: any = {
                shares: comboShares,
                cluster_size: nodeCount,
                threshold,
                key_type: keyType,
            };
            if (keyType === 'secret') payload.key_seed = seed;

            const res = await fetch(`${process.env.NEXT_PUBLIC_BLINDFOLD_API_ENDPOINT}/api/blindfold_decrypt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await res.json().catch(() => ({} as any));

            if (!res.ok) {
                throw new Error(json?.error || json?.message || res.statusText);
            }
            result = (json as any).decrypted;
            isValid = true;
        } catch {
            result = '[ERROR]';
            isValid = false;
        }
        
        results.push({ nodes: combo, result, isValid });
        
        for (const nodeIdx of combo) {
            if (isValid) {
                successCount[nodeIdx]++;
            } else {
                failCount[nodeIdx]++;
            }
        }
    }

    const malicious: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
        const total = successCount[i] + failCount[i];
        if (total > 0 && successCount[i] === 0 && failCount[i] > 0) {
            malicious.push(i);
        }
    }

    const validResult = results.find(r => r.isValid);

    return {
        malicious,
        validResult,
    }
    
}

  const getCombinations = (n: number, k: number): number[][] => {
    const result: number[][] = [];
    const combine = (start: number, combo: number[]): void => {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      for (let i = start; i < n; i++) {
        combo.push(i);
        combine(i + 1, combo);
        combo.pop();
      }
    };
    combine(0, []);
    return result;
  };