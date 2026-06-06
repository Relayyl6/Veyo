import { useState, useEffect, useCallback } from "react";

// --- fetchAPI ---
export const fetchAPI = async (url: string, options?: RequestInit) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            // FIX 1: Added the 'throw' keyword
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
};

// --- useFetch ---
export const useFetch = <T>(url: string, options?: RequestInit) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stringify the options. 
    // This guarantees the dependency array only changes if the actual values change, 
    // preventing infinite React render loops.
    const memoizedOptions = options ? JSON.stringify(options) : null;

    const fetchData = useCallback(async (abortSignal?: AbortSignal) => {
        setLoading(true);
        setError(null);

        try {
            // Parse options back to an object and attach the abort signal
            const fetchOptions: RequestInit = memoizedOptions ? JSON.parse(memoizedOptions) : {};
            if (abortSignal) {
                fetchOptions.signal = abortSignal;
            }

            const result = await fetchAPI(url, fetchOptions);
            
            // FIX 3: Safety check. If your API always wraps responses in { data: ... }, 
            // this safely extracts it. Otherwise, it returns the raw result.
            setData(result?.data !== undefined ? result.data : result);
        } catch (err: any) {
            // FIX 4: If the request was intentionally aborted, don't show an error
            if (err.name === 'AbortError') {
                return;
            }
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [url, memoizedOptions]);

    useEffect(() => {
        // AbortController stops old requests if the URL changes 
        // or the component unmounts before the fetch completes.
        const controller = new AbortController();
        
        fetchData(controller.signal);

        return () => {
            controller.abort(); // Cleanup
        };
    }, [fetchData]);

    // Expose refetch so you can manually trigger updates (like pulling-to-refresh)
    return { data, loading, error, refetch: () => fetchData() };
};