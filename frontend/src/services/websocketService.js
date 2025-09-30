// const ws = useRef(null);
//
// useEffect(() => {
//     ws.current = new WebSocket(`${WS_BASE_PATH}/ws`);
//
//     ws.current.onopen = () => {
//         console.log('WebSocket connected for movies');
//     };
//
//     ws.current.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         if (data.type === 'MOVIE') {
//             setLazyState(prev => ({...prev}));
//         }
//     };
//
//     ws.current.onerror = (error) => {
//         console.error('WebSocket error:', error);
//     };
//
//     ws.current.onclose = () => {
//         console.log('WebSocket disconnected for movies');
//     };
//
//     return () => {
//         if (ws.current) {
//             ws.current.close();
//         }
//     };
// }, []);
