import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { TRANSLATIONS } from '@/Utils/translations';

const MAP_TILES = {
    street: {
        label: '🗺️ Street',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
    satellite: {
        label: '🛰️ Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri, Maxar, Earthstar Geographics',
    },
    terrain: {
        label: '⛰️ Terrain',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenTopoMap contributors',
    },
    dark: {
        label: '🌑 Dark',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© CARTO',
    },
};

export default function MapIndex() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [lang, setLang] = useState('en');
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const tileLayerRef = useRef(null);
    const clusterGroupRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const leafletRef = useRef(null);
    const routingControlRef = useRef(null);

    const [layers, setLayers] = useState([]);
    const [checkedLayers, setCheckedLayers] = useState(user?.map_preferences?.checked_layers || {});
    const [mapReady, setMapReady] = useState(false);
    const [activeBasemap, setActiveBasemap] = useState(user?.map_preferences?.basemap || 'street');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [geoPoints, setGeoPoints] = useState([]);
    const [activeTab, setActiveTab] = useState('layers'); // layers, points, spatial, navigation
    const [navStart, setNavStart] = useState(null);
    const [navEnd, setNavEnd] = useState(null);
    const [routeInstructions, setRouteInstructions] = useState([]);
    const [routeSummary, setRouteSummary] = useState(null);

    const [navStartText, setNavStartText] = useState('');
    const [navEndText, setNavEndText] = useState('');
    const [navStartSuggestions, setNavStartSuggestions] = useState([]);
    const [navEndSuggestions, setNavEndSuggestions] = useState([]);
    const navStartTimeoutRef = useRef(null);
    const navEndTimeoutRef = useRef(null);
    const [isTracking, setIsTracking] = useState(false);
    const trackingWatcherRef = useRef(null);
    const currentLocationMarkerRef = useRef(null);

    const [selectedPoint, setSelectedPoint] = useState(null);
    const [selectedPointDetails, setSelectedPointDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [drawToolsActive, setDrawToolsActive] = useState(false);
    const [showQrCode, setShowQrCode] = useState(false);

    // Initialize map and GIS overlays
    useEffect(() => {
        if (mapInstanceRef.current) return;

        import('leaflet').then((L) => {
            const leaflet = L.default || L;
            leafletRef.current = leaflet;
            window.L = leaflet; // Set global instance for Leaflet plugins
            window.Leaflet = leaflet;

            // Fix icons
            delete leaflet.Icon.Default.prototype._getIconUrl;
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            // Now dynamically load the plugins
            Promise.all([
                import('leaflet.markercluster'),
                import('leaflet-draw'),
                import('leaflet-routing-machine')
            ]).then(() => {
                if (!mapRef.current) return;

                const map = leaflet.map(mapRef.current, { zoomControl: true }).setView([20.5937, 78.9629], 5);
                mapInstanceRef.current = map;

            // Default tile layer
            const initialBasemap = user?.map_preferences?.basemap || 'street';
            const tile = leaflet.tileLayer(MAP_TILES[initialBasemap]?.url || MAP_TILES.street.url, {
                attribution: MAP_TILES[initialBasemap]?.attribution || MAP_TILES.street.attribution,
                maxZoom: 19,
            }).addTo(map);
            tileLayerRef.current = tile;

            // Marker cluster group
            clusterGroupRef.current = leaflet.markerClusterGroup({
                showCoverageOnHover: false,
                spiderfyOnMaxZoom: true,
                maxClusterRadius: 40,
            }).addTo(map);

            // Drawn items layer group for Spatial Analysis
            const drawnItems = new leaflet.FeatureGroup();
            map.addLayer(drawnItems);
            drawnItemsRef.current = drawnItems;

            // Add Leaflet Draw controls
            const drawControl = new leaflet.Control.Draw({
                edit: {
                    featureGroup: drawnItems
                },
                draw: {
                    polygon: {
                        allowIntersection: false,
                        showArea: true,
                        drawError: { color: '#e11d48', message: '<strong>Error:</strong> Intersections not allowed!' },
                        shapeOptions: { color: '#6366f1', fillOpacity: 0.2 }
                    },
                    polyline: { shapeOptions: { color: '#f59e0b', weight: 4 } },
                    rectangle: { shapeOptions: { color: '#10b981', fillOpacity: 0.1 } },
                    circle: { shapeOptions: { color: '#ec4899', fillOpacity: 0.15 } },
                    marker: true,
                    circlemarker: false
                }
            });
            map.addControl(drawControl);
            setDrawToolsActive(true);

            // Draw event listeners for custom measurements
            map.on(leaflet.Draw.Event.CREATED, (e) => {
                const layer = e.layer;
                drawnItems.addLayer(layer);

                let popupContent = '<div class="p-2 min-w-56 text-stone-800 dark:text-gray-100 font-sans">';
                popupContent += '<h4 class="font-bold text-sm text-earth-dark dark:text-earth-warm mb-1.5 flex items-center gap-1">📐 Spatial Analysis</h4>';

                if (e.layerType === 'polygon' || e.layerType === 'rectangle') {
                    const latlngs = layer.getLatLngs()[0];
                    const area = leaflet.GeometryUtil.geodesicArea(latlngs);
                    popupContent += `<p class="text-xs mb-1"><strong>Surface Area:</strong></p>`;
                    popupContent += `<div class="bg-[#FCFAF8] dark:bg-gray-850 p-2 rounded border border-gray-100 dark:border-[#4A423C] font-mono text-xs mb-2">`;
                    popupContent += `• ${(area).toFixed(1)} m²<br/>• ${(area / 10000).toFixed(3)} hectares<br/>• ${(area * 0.000247105).toFixed(3)} acres`;
                    popupContent += `</div>`;
                } else if (e.layerType === 'polyline') {
                    const latlngs = layer.getLatLngs();
                    let distance = 0;
                    for (let i = 0; i < latlngs.length - 1; i++) {
                        distance += latlngs[i].distanceTo(latlngs[i + 1]);
                    }
                    popupContent += `<p class="text-xs mb-1"><strong>Linear Distance:</strong></p>`;
                    popupContent += `<div class="bg-[#FCFAF8] dark:bg-gray-850 p-2 rounded border border-gray-100 dark:border-[#4A423C] font-mono text-xs mb-2">`;
                    popupContent += `• ${(distance).toFixed(1)} meters<br/>• ${(distance / 1000).toFixed(3)} kilometers`;
                    popupContent += `</div>`;
                } else if (e.layerType === 'circle') {
                    const radius = layer.getRadius();
                    const area = Math.PI * Math.pow(radius, 2);
                    popupContent += `<p class="text-xs mb-1"><strong>Radial Boundaries:</strong></p>`;
                    popupContent += `<div class="bg-[#FCFAF8] dark:bg-gray-850 p-2 rounded border border-gray-100 dark:border-[#4A423C] font-mono text-xs mb-2">`;
                    popupContent += `• Radius: ${(radius).toFixed(1)} m<br/>• Area: ${(area).toFixed(1)} m²<br/>• Area: ${(area / 10000).toFixed(3)} ha`;
                    popupContent += `</div>`;
                } else {
                    popupContent += `<p class="text-xs mb-2">Waypoint marker placed successfully.</p>`;
                }

                popupContent += '<p class="text-[10px] text-stone-500 mb-2">Shape remains saved on map canvas overlay.</p>';
                popupContent += '</div>';

                layer.bindPopup(popupContent).openPopup();
            });

            setTimeout(() => { map.invalidateSize(); }, 300);
            setMapReady(true);

            // Fetch active layers
            fetch('/api/layers', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data)) {
                    setLayers(data);
                    const initialChecked = {};
                    data.forEach(l => {
                        initialChecked[l._id || l.id] = true;
                    });
                    setCheckedLayers(initialChecked);
                }
            })
            .catch(() => {});

            // Fetch approved GeoPoints
            fetch('/api/points', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const points = data?.features || (Array.isArray(data) ? data : []);
                setGeoPoints(points);
            })
            .catch(() => {});
            });
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // A-to-B Navigation Routing Engine
    useEffect(() => {
        const L = leafletRef.current;
        const map = mapInstanceRef.current;
        if (!L || !map || !navStart || !navEnd) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        const control = L.Routing.control({
            waypoints: [
                L.latLng(navStart.lat, navStart.lng),
                L.latLng(navEnd.lat, navEnd.lng)
            ],
            routeWhileDragging: true,
            show: false,
            createMarker: function() { return null; },
            lineOptions: {
                styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }]
            }
        }).addTo(map);

        control.on('routesfound', function(e) {
            const routes = e.routes;
            if(routes && routes[0]) {
                const summary = routes[0].summary;
                setRouteSummary({
                    distance: (summary.totalDistance / 1000).toFixed(2) + ' km',
                    time: Math.round(summary.totalTime / 60) + ' min'
                });
                setRouteInstructions(routes[0].instructions);
            }
        });

        routingControlRef.current = control;

        return () => {
            if (routingControlRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeControl(routingControlRef.current);
            }
        };
    }, [navStart, navEnd]);

    // Map Click handler for setting Nav points
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const handleMapClick = (e) => {
            if (activeTab === 'navigation') {
                if (!navStart) {
                    setNavStart(e.latlng);
                } else if (!navEnd) {
                    setNavEnd(e.latlng);
                }
            }
        };

        map.on('click', handleMapClick);
        return () => map.off('click', handleMapClick);
    }, [activeTab, navStart, navEnd, mapReady]);

    // Periodic synchronization / real-time updates of approved GeoPoints (Phase 10)
    useEffect(() => {
        const interval = setInterval(() => {
            fetch('/api/points', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const points = data?.features || (Array.isArray(data) ? data : []);
                setGeoPoints(prevPoints => {
                    if (JSON.stringify(prevPoints) !== JSON.stringify(points)) {
                        return points;
                    }
                    return prevPoints;
                });
            })
            .catch(() => {});
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Re-draw markers when filters or layers checked state change
    useEffect(() => {
        const L = leafletRef.current;
        const map = mapInstanceRef.current;
        const clusterGroup = clusterGroupRef.current;

        if (!L || !map || !clusterGroup) return;

        clusterGroup.clearLayers();

        geoPoints.forEach(point => {
            const props = point.properties;
            const geom = point.geometry;

            // Only draw if associated layer is checked/visible
            if (props && geom?.coordinates && checkedLayers[props.layer_id] !== false) {
                const [lng, lat] = geom.coordinates;
                const layerColor = props.layer_color || '#3b82f6';
                const opacity = props.layer_opacity !== undefined ? props.layer_opacity : 0.8;

                // Create a premium custom colored marker using CSS
                const markerHtml = `
                    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
                        <span style="
                            position: absolute;
                            width: 10px;
                            height: 10px;
                            border-radius: 50%;
                            background-color: ${layerColor};
                            box-shadow: 0 0 10px ${layerColor}, 0 0 20px ${layerColor};
                            animation: pulse 2s infinite;
                        "></span>
                        <div style="
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            background-color: ${layerColor}1a;
                            border: 2px solid ${layerColor};
                            box-shadow: 0 2px 5px rgba(0,0,0,0.25);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 11px;
                        ">
                            📍
                        </div>
                    </div>
                `;

                const customIcon = L.divIcon({
                    html: markerHtml,
                    className: 'custom-gis-marker',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                });

                const marker = L.marker([lat, lng], { icon: customIcon });

                marker.bindPopup(`
                    <div class="p-3 min-w-64 text-stone-800 dark:text-gray-100 font-sans">
                        <div class="flex items-center gap-1.5 mb-1">
                            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${layerColor}"></span>
                            <strong class="text-sm font-bold text-stone-800 dark:text-white">${props.name || 'GeoPoint'}</strong>
                        </div>
                        <p class="text-xs text-stone-500 dark:text-[#D1CBC5] mt-1 leading-relaxed mb-2">${props.description || 'No description provided.'}</p>
                        <div class="border-t border-gray-100 dark:border-[#4A423C] pt-2 flex flex-col gap-1 text-[11px] font-mono text-stone-500">
                            <span>📍 Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</span>
                            <span>🏷️ Layer: ${layers.find(l => (l._id || l.id) === props.layer_id)?.name || 'Default'}</span>
                        </div>
                    </div>
                `);

                marker.on('click', () => {
                    focusPoint(point);
                });

                clusterGroup.addLayer(marker);
            }
        });
    }, [geoPoints, checkedLayers, layers]);

    // Handle layer checkbox toggle
    const handleLayerToggle = (layerId) => {
        setCheckedLayers(prev => {
            const updated = {
                ...prev,
                [layerId]: !prev[layerId]
            };

            // Save preference in background
            fetch(route('map.preferences'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: JSON.stringify({ checked_layers: updated })
            });

            return updated;
        });
    };

    // Change basemap
    const switchBasemap = (key) => {
        setActiveBasemap(key);
        const L = leafletRef.current;
        const map = mapInstanceRef.current;
        if (!L || !map) return;
        if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
        const tile = L.tileLayer(MAP_TILES[key].url, {
            attribution: MAP_TILES[key].attribution,
            maxZoom: 19,
        }).addTo(map);
        tileLayerRef.current = tile;

        // Save preference in background
        fetch(route('map.preferences'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            },
            body: JSON.stringify({ basemap: key })
        });
    };

    // Geolocation current location
    const goToMyLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported by this browser.');
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            const map = mapInstanceRef.current;
            const L = leafletRef.current;
            if (!map || !L) return;

            map.setView([coords.latitude, coords.longitude], 14);

            const userIconHtml = `
                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">
                    <div style="position: absolute; width: 100%; height: 100%; background: #4f46e5; opacity: 0.3; border-radius: 50%; animation: ping 1.5s infinite;"></div>
                    <div style="background: #4f46e5; width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 8px rgba(79,70,229,0.8)"></div>
                </div>
            `;

            L.marker([coords.latitude, coords.longitude], {
                icon: L.divIcon({ html: userIconHtml, className: 'user-loc-icon', iconSize: [20, 20], iconAnchor: [10, 10] })
            }).addTo(map).bindPopup('📍 You are here').openPopup();
        });
    };

    // Geocoding Nominatim Search
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
            const data = await res.json();
            setSearchResults(data);
        } catch (e) {
            setSearchResults([]);
        }
        setSearching(false);
    };

    const flyToResult = (result) => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.setView([parseFloat(result.lat), parseFloat(result.lon)], 13);
        setSearchResults([]);
        setSearchQuery(result.display_name.split(',')[0]);
    };

    const fetchNavSuggestions = async (query, isStart) => {
        if (!query || !query.trim() || query === 'Current Location (GPS)') {
            if (isStart) setNavStartSuggestions([]); else setNavEndSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
            const data = await res.json();
            if (isStart) setNavStartSuggestions(data); else setNavEndSuggestions(data);
        } catch (e) {
            if (isStart) setNavStartSuggestions([]); else setNavEndSuggestions([]);
        }
    };

    const onNavStartChange = (e) => {
        const val = e.target.value;
        setNavStartText(val);
        if (navStartTimeoutRef.current) clearTimeout(navStartTimeoutRef.current);
        navStartTimeoutRef.current = setTimeout(() => fetchNavSuggestions(val, true), 400);
    };

    const onNavEndChange = (e) => {
        const val = e.target.value;
        setNavEndText(val);
        if (navEndTimeoutRef.current) clearTimeout(navEndTimeoutRef.current);
        navEndTimeoutRef.current = setTimeout(() => fetchNavSuggestions(val, false), 400);
    };

    const handleSelectNavSuggestion = (item, isStart) => {
        const coords = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
        const name = item.display_name.split(',')[0];
        if (isStart) {
            setNavStart(coords);
            setNavStartText(name);
            setNavStartSuggestions([]);
        } else {
            setNavEnd(coords);
            setNavEndText(name);
            setNavEndSuggestions([]);
        }
    };

    const toggleNavTracking = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported by this browser.');
        
        if (isTracking) {
            navigator.geolocation.clearWatch(trackingWatcherRef.current);
            setIsTracking(false);
            if(currentLocationMarkerRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(currentLocationMarkerRef.current);
                currentLocationMarkerRef.current = null;
            }
        } else {
            setIsTracking(true);
            setNavStartText('Current Location (GPS)');
            trackingWatcherRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setNavStart({ lat: latitude, lng: longitude });
                    
                    const map = mapInstanceRef.current;
                    const L = leafletRef.current;
                    if(map && L) {
                        if(!currentLocationMarkerRef.current) {
                            currentLocationMarkerRef.current = L.marker([latitude, longitude], {
                                icon: L.divIcon({ className: 'user-loc-icon', html: '<div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;"><div style="position: absolute; width: 100%; height: 100%; background: #3b82f6; opacity: 0.4; border-radius: 50%; animation: ping 2s infinite;"></div><div style="background: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.8)"></div></div>' })
                            }).addTo(map);
                            map.setView([latitude, longitude], 15);
                        } else {
                            currentLocationMarkerRef.current.setLatLng([latitude, longitude]);
                        }
                    }
                },
                (err) => { console.error(err); setIsTracking(false); },
                { enableHighAccuracy: true, maximumAge: 10000 }
            );
        }
    };

    const focusPoint = async (point) => {
        const map = mapInstanceRef.current;
        if (!map || !point.geometry?.coordinates) return;
        const [lng, lat] = point.geometry.coordinates;
        map.setView([lat, lng], 14);
        setSelectedPoint(point);

        const pointId = point.properties.id;
        setLoadingDetails(true);
        setSelectedPointDetails(null);
        setLoadingWeather(true);
        setWeatherData(null);
        setShowQrCode(false);

        // Fetch waypoint details from local DB
        try {
            const res = await fetch(`/api/points/${pointId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedPointDetails(data);
            }
        } catch (e) {
            console.error("Error loading point details", e);
        } finally {
            setLoadingDetails(false);
        }

        // Fetch real-time weather from Open-Meteo API
        try {
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
            if (weatherRes.ok) {
                const wData = await weatherRes.json();
                setWeatherData(wData.current_weather);
            }
        } catch (we) {
            console.error("Error loading weather conditions", we);
        } finally {
            setLoadingWeather(false);
        }
    };

    useEffect(() => {
        if (geoPoints.length === 0) return;
        const urlParams = new URLSearchParams(window.location.search);
        const pointId = urlParams.get('point');
        if (pointId) {
            const matchedPoint = geoPoints.find(p => p.properties?.id === pointId);
            if (matchedPoint) {
                setTimeout(() => {
                    focusPoint(matchedPoint);
                }, 800);
            }
        }
    }, [geoPoints]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-xl text-stone-800 dark:text-[#E8E4DF] leading-tight flex items-center gap-2">
                        🗺️ {t.title}
                    </h2>
                    <div className="flex items-center gap-3">
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            className="bg-stone-900 border border-stone-800 text-white rounded-lg text-xs font-bold px-2.5 py-1.5 focus:ring-1 focus:ring-earth-dark focus:outline-none transition cursor-pointer"
                        >
                            <option value="en">🇺🇸 English</option>
                            <option value="hi">🇮🇳 हिंदी</option>
                            <option value="pa">🇮🇳 ਪੰਜਾਬੀ</option>
                        </select>
                        {mapReady && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                {t.gis_active}
                            </span>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Interactive GIS Map" />

            {/* Embedded pulse CSS helper */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.9); opacity: 1; }
                    50% { transform: scale(1.4); opacity: 0.4; }
                    100% { transform: scale(0.9); opacity: 1; }
                }
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                .leaflet-bar button {
                    background-color: white !important;
                    color: #4b5563 !important;
                    border-bottom: 1px solid #e5e7eb !important;
                }
                .leaflet-bar button:hover {
                    background-color: #f3f4f6 !important;
                    color: #111827 !important;
                }
            `}</style>

            <div className="py-4 px-4 sm:px-6 lg:px-8">
                {/* Geocoding & Base Maps Toolbar */}
                <div className="mb-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                    {/* Basemap switcher */}
                    <div className="lg:col-span-6 flex flex-wrap gap-1 p-1 bg-[#FCFAF8] dark:bg-[#2B2623]/80 rounded-xl border border-stone-200/50 dark:border-[#4A423C]/50 w-fit">
                        {Object.entries(MAP_TILES).map(([key, tile]) => (
                            <button
                                key={key}
                                onClick={() => switchBasemap(key)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${activeBasemap === key
                                    ? 'bg-earth-dark text-white shadow-md'
                                    : 'text-stone-500 dark:text-[#D1CBC5] hover:bg-white dark:hover:bg-stone-800'
                                }`}
                            >
                                {key === 'street' ? '🗺️ Street' : key === 'satellite' ? t.satellite : key === 'terrain' ? t.terrain : t.dark}
                            </button>
                        ))}
                    </div>

                    {/* Geocoding Nominatim Search Input */}
                    <div className="lg:col-span-6 flex gap-2 relative justify-end">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder={t.search_placeholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full border border-stone-200 dark:border-[#4A423C] dark:bg-[#2B2623]/60 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-earth-dark focus:outline-none transition-all"
                            />
                            <span className="absolute left-3.5 top-3.5 text-stone-500">🔍</span>
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={searching}
                            className="bg-earth-dark hover:bg-earth-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                        >
                            {searching ? '...' : t.search}
                        </button>
                        <button
                            onClick={goToMyLocation}
                            title="Locate Current Geoposition"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20"
                        >
                            🎯 {t.locate}
                        </button>

                        {/* Dropdown Auto-suggestions */}
                        {searchResults.length > 0 && (
                            <div className="absolute top-12 right-0 z-50 w-full max-w-md bg-white dark:bg-[#2B2623] border border-gray-100 dark:border-[#4A423C] rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
                                {searchResults.map((r, i) => (
                                    <button
                                        key={i}
                                        onClick={() => flyToResult(r)}
                                        className="block w-full text-left px-4 py-3 hover:bg-[#FCFAF8] dark:hover:bg-stone-800/50 border-b border-gray-100 dark:border-[#4A423C]/50 last:border-0 transition"
                                    >
                                        <span className="font-bold text-stone-800 dark:text-gray-100 text-xs">{r.display_name.split(',')[0]}</span>
                                        <br />
                                        <span className="text-[10px] text-stone-500 dark:text-[#A89F98] truncate block mt-0.5">{r.display_name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Grid System */}
                <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-stone-200 dark:border-[#4A423C] overflow-hidden shadow-2xl bg-white dark:bg-[#2B2623]">
                    
                    {/* Left GIS Sidebar */}
                    <div className="lg:col-span-3 flex flex-col border-r border-stone-200 dark:border-[#4A423C] h-[650px] bg-stone-900 text-gray-100">
                        {/* Tab Switchers */}
                        <div className="grid grid-cols-4 border-b border-stone-800">
                            {['layers', 'points', 'spatial', 'navigation'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-3 text-[10px] uppercase font-bold tracking-wider border-b-2 transition ${activeTab === tab
                                        ? 'border-earth-dark text-white bg-stone-900/40'
                                        : 'border-transparent text-stone-500 hover:text-gray-200'
                                    }`}
                                >
                                    {tab === 'layers' && t.tab_layers}
                                    {tab === 'points' && t.tab_geopoints}
                                    {tab === 'spatial' && t.tab_measure}
                                    {tab === 'navigation' && 'Navigate'}
                                </button>
                            ))}
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            
                            {/* TAB 1: LAYERS CONFIG */}
                            {activeTab === 'layers' && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Map Overlays</h3>
                                        {layers.length > 0 ? (
                                            <div className="space-y-2">
                                                {layers.map((layer) => {
                                                    const layerId = layer._id || layer.id;
                                                    const color = layer.style?.color || '#3b82f6';
                                                    const isChecked = checkedLayers[layerId] !== false;
                                                    return (
                                                        <label
                                                            key={layerId}
                                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${isChecked 
                                                                ? 'bg-stone-900/50 border-stone-800 text-white' 
                                                                : 'bg-transparent border-stone-800/50 text-stone-500 hover:border-stone-800'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handleLayerToggle(layerId)}
                                                                    className="rounded text-earth-dark focus:ring-0 cursor-pointer w-4 h-4"
                                                                />
                                                                <span className="text-xs font-semibold">{layer.name}</span>
                                                            </div>
                                                            <span
                                                                className="w-3.5 h-3.5 rounded border border-white/20 shadow-sm"
                                                                style={{ backgroundColor: color }}
                                                            ></span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-stone-500">No active layers configured in system.</p>
                                        )}
                                    </div>

                                    {/* GIS legend */}
                                    <div className="pt-4 border-t border-stone-800 space-y-2.5">
                                        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Legend</h3>
                                        <div className="flex items-center gap-2.5 text-xs text-gray-300">
                                            <span className="w-2.5 h-2.5 rounded-full bg-earth-dark shadow-[0_0_8px_#6366f1]"></span>
                                            <span>Soil Parameters</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs text-gray-300">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
                                            <span>Irrigation Pump</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs text-gray-300">
                                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#8b5cf6]"></span>
                                            <span>Satellite Zones</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: GEOPOINTS LIST */}
                            {activeTab === 'points' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Seeded GeoPoints</h3>
                                    {geoPoints.length > 0 ? (
                                        <div className="space-y-2">
                                            {geoPoints.map((point) => {
                                                const props = point.properties;
                                                const geom = point.geometry;
                                                const isSelected = selectedPoint?.properties?.id === props?.id;
                                                const color = props.layer_color || '#3b82f6';
                                                return (
                                                    <button
                                                        key={props.id}
                                                        onClick={() => focusPoint(point)}
                                                        className={`w-full text-left p-3 rounded-xl border transition ${isSelected
                                                            ? 'bg-earth-dark/20 border-earth-dark text-white'
                                                            : 'bg-transparent border-stone-800 hover:border-stone-800 text-gray-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                                                            <strong className="text-xs font-bold block truncate">{props.name}</strong>
                                                        </div>
                                                        <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed mb-1.5">{props.description}</p>
                                                        <span className="text-[9px] font-mono text-stone-500">📍 {geom?.coordinates?.[1].toFixed(5)}, {geom?.coordinates?.[0].toFixed(5)}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-stone-500">No geo-points found.</p>
                                    )}
                                </div>
                            )}

                            {/* TAB 3: SPATIAL ANALYSIS INFO */}
                            {activeTab === 'spatial' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Drawing Tools</h3>
                                    
                                    <div className="bg-stone-900/40 border border-stone-800/50 p-4 rounded-xl space-y-3">
                                        <h4 className="text-xs font-bold text-earth-warm">📏 {t.measuring_title}</h4>
                                        <p className="text-[11px] text-gray-300 leading-relaxed">
                                            {t.measuring_desc}
                                        </p>
                                        <ul className="text-[11px] text-stone-500 space-y-1.5 list-disc pl-4">
                                            <li><strong>{t.polygon}</strong>: {t.polygon_desc}</li>
                                            <li><strong>{t.polyline}</strong>: {t.polyline_desc}</li>
                                            <li><strong>{t.circle}</strong>: {t.circle_desc}</li>
                                        </ul>
                                    </div>

                                    {drawToolsActive && (
                                        <div className="bg-earth-dark/10 border border-earth-dark/20 p-3 rounded-xl flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-earth-dark animate-ping"></span>
                                            <span className="text-xs text-indigo-200 font-bold">{t.canvas_ready}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 4: NAVIGATION */}
                            {activeTab === 'navigation' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Turn-by-turn Navigation</h3>
                                    
                                    <div className="bg-stone-900/40 border border-stone-800/50 p-4 rounded-xl space-y-3">
                                        
                                        <div className="space-y-2 relative">
                                            <div className="flex items-start gap-2 relative z-50">
                                                <span className="w-3 h-3 mt-2.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_8px_#22c55e]"></span>
                                                <div className="relative w-full">
                                                    <input 
                                                        type="text" 
                                                        value={navStartText}
                                                        onChange={onNavStartChange}
                                                        placeholder="Search Start Location..." 
                                                        className="w-full bg-[#2B2623] border border-stone-700 rounded-lg text-xs px-3 py-2 text-white focus:border-earth-warm focus:ring-0"
                                                    />
                                                    {navStartSuggestions.length > 0 && (
                                                        <div className="absolute top-full left-0 w-full mt-1 bg-[#2B2623] border border-stone-700 rounded-lg shadow-xl overflow-y-auto max-h-48 custom-scrollbar">
                                                            {navStartSuggestions.map((s, idx) => (
                                                                <button key={idx} onClick={() => handleSelectNavSuggestion(s, true)} className="w-full text-left px-3 py-2 text-[10px] text-gray-300 hover:bg-earth-dark/40 border-b border-stone-800 last:border-0 truncate">
                                                                    {s.display_name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="w-0.5 h-6 bg-stone-700 ml-1.5 absolute top-7 left-0 z-0"></div>
                                            
                                            <div className="flex items-start gap-2 relative z-40">
                                                <span className="w-3 h-3 mt-2.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_#ef4444] relative z-10"></span>
                                                <div className="relative w-full">
                                                    <input 
                                                        type="text" 
                                                        value={navEndText}
                                                        onChange={onNavEndChange}
                                                        placeholder="Search Destination..." 
                                                        className="w-full bg-[#2B2623] border border-stone-700 rounded-lg text-xs px-3 py-2 text-white focus:border-earth-warm focus:ring-0"
                                                    />
                                                    {navEndSuggestions.length > 0 && (
                                                        <div className="absolute top-full left-0 w-full mt-1 bg-[#2B2623] border border-stone-700 rounded-lg shadow-xl overflow-y-auto max-h-48 custom-scrollbar">
                                                            {navEndSuggestions.map((s, idx) => (
                                                                <button key={idx} onClick={() => handleSelectNavSuggestion(s, false)} className="w-full text-left px-3 py-2 text-[10px] text-gray-300 hover:bg-earth-dark/40 border-b border-stone-800 last:border-0 truncate">
                                                                    {s.display_name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-3 pt-2 border-t border-stone-800">
                                            <button 
                                                onClick={toggleNavTracking}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition shadow-md flex items-center justify-center gap-1.5 ${isTracking ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600/30'}`}
                                            >
                                                {isTracking ? '⏹️ Stop Tracking' : '📍 Use My GPS'}
                                            </button>
                                            <button 
                                                onClick={() => { 
                                                    setNavStart(null); 
                                                    setNavEnd(null); 
                                                    setNavStartText('');
                                                    setNavEndText('');
                                                    setRouteSummary(null); 
                                                    setRouteInstructions([]); 
                                                    if(isTracking) toggleNavTracking();
                                                    if (routingControlRef.current && mapInstanceRef.current) {
                                                        mapInstanceRef.current.removeControl(routingControlRef.current); 
                                                        routingControlRef.current=null;
                                                    } 
                                                }}
                                                className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-[10px] font-bold text-gray-300 transition shadow-md"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>

                                    {routeSummary && (
                                        <div className="bg-earth-dark/20 border border-earth-dark/30 p-3 rounded-xl">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-white">Estimated Travel</span>
                                                <span className="text-xs font-bold text-earth-warm">{routeSummary.time}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-300">Total Distance: {routeSummary.distance}</span>
                                        </div>
                                    )}

                                    {routeInstructions.length > 0 && (
                                        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                                            {routeInstructions.map((inst, idx) => (
                                                <div key={idx} className="bg-[#2B2623] p-2 rounded text-[10px] text-gray-300 flex items-start gap-2 border border-stone-800">
                                                    <span className="mt-0.5 opacity-50 min-w-[30px] font-mono">{(inst.distance).toFixed(0)}m</span>
                                                    <span>{inst.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected GeoPoint Details Panel */}
                        {selectedPoint && (
                            <div className="p-4 border-t border-stone-800 bg-stone-950/40 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[9px] text-earth-warm font-bold uppercase tracking-wider">{t.selected_waypoint}</span>
                                        <h4 className="text-xs font-bold text-white leading-tight mt-0.5">{selectedPoint.properties.name}</h4>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setSelectedPoint(null);
                                            setSelectedPointDetails(null);
                                        }}
                                        className="text-stone-500 hover:text-white font-bold text-[10px] px-1 py-0.5 rounded bg-stone-900"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <p className="text-[11px] text-gray-350 leading-relaxed line-clamp-3">
                                    {selectedPoint.properties.description || t.observations}
                                </p>

                                {/* Media Attachments Panel */}
                                {loadingDetails ? (
                                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                        <span className="w-2.5 h-2.5 border-2 border-earth-dark border-t-transparent rounded-full animate-spin"></span>
                                        <span>{t.loading_attachments}</span>
                                    </div>
                                ) : selectedPointDetails?.media?.length > 0 ? (
                                    <div className="space-y-1">
                                        <span className="text-[8px] text-stone-500 font-bold uppercase tracking-wider block">{t.field_photos} ({selectedPointDetails.media.length})</span>
                                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                                            {selectedPointDetails.media.map((img, idx) => (
                                                <img 
                                                    key={idx} 
                                                    src={img} 
                                                    className="w-10 h-10 object-cover rounded-lg border border-stone-800 hover:scale-105 transition cursor-pointer" 
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Weather Conditions Overlay (Phase 10 - Advanced) */}
                                {loadingWeather ? (
                                    <div className="flex items-center gap-2 text-[10px] text-stone-500 py-1 bg-stone-900/20 px-2 rounded-lg">
                                        <span className="w-2.5 h-2.5 border border-earth-dark border-t-transparent rounded-full animate-spin"></span>
                                        <span>{t.syncing}</span>
                                    </div>
                                ) : weatherData ? (
                                    <div className="bg-stone-900/40 border border-stone-800/50 p-2 rounded-xl flex items-center justify-between text-[10px] text-gray-300 gap-2">
                                        <div className="space-y-0.5 min-w-0 flex-1">
                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block truncate">Weather</span>
                                            <span className="font-extrabold text-white text-xs block">{weatherData.temperature}°C</span>
                                            <span className="text-stone-500 block text-[9px] truncate">
                                                {weatherData.weathercode === 0 && "Sunny ☀️"}
                                                {[1, 2, 3].includes(weatherData.weathercode) && "Cloudy ⛅"}
                                                {[45, 48].includes(weatherData.weathercode) && "Foggy 🌫️"}
                                                {[51, 53, 55].includes(weatherData.weathercode) && "Drizzle 🌦️"}
                                                {[61, 63, 65].includes(weatherData.weathercode) && "Rainy 🌧️"}
                                                {[71, 73, 75].includes(weatherData.weathercode) && "Snowy ❄️"}
                                                {[80, 81, 82].includes(weatherData.weathercode) && "Showers ⛈️"}
                                                {[95, 96, 99].includes(weatherData.weathercode) && "Storm 🌩️"}
                                                {![0,1,2,3,45,48,51,53,55,61,63,65,71,73,75,80,81,82,95,96,99].includes(weatherData.weathercode) && "Overcast ☁️"}
                                            </span>
                                        </div>
                                        <div className="text-right space-y-0.5 min-w-0 flex-1">
                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block truncate">{t.wind_speed}</span>
                                            <span className="font-extrabold text-white font-mono block">{weatherData.windspeed} km/h</span>
                                            <span className="text-stone-500 block text-[9px] truncate">Dir: {weatherData.winddirection}°</span>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const id = selectedPoint.properties.id;
                                            router.post(route('bookmarks.toggle', id), {}, {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    // Soft-reload without layout refresh
                                                    router.reload({ only: ['auth'] });
                                                }
                                            });
                                        }}
                                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold tracking-wider uppercase transition flex items-center justify-center gap-1 shadow ${
                                            user?.saved_locations?.includes(selectedPoint.properties.id)
                                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                                : 'bg-stone-900 hover:bg-slate-700 text-gray-200'
                                        }`}
                                    >
                                        ⭐ {user?.saved_locations?.includes(selectedPoint.properties.id) ? t.bookmarked : t.bookmark}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const [lng, lat] = selectedPoint.geometry.coordinates;
                                            const map = mapInstanceRef.current;
                                            if (map) map.setView([lat, lng], 17);
                                        }}
                                        className="px-2.5 py-1.5 bg-earth-dark hover:bg-earth-dark text-white rounded-lg text-[9px] font-bold transition flex items-center justify-center"
                                    >
                                        🔍 {t.zoom}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowQrCode(!showQrCode)}
                                        className={`px-2 py-1.5 rounded-lg text-[9px] font-bold transition flex items-center justify-center gap-1 ${
                                            showQrCode ? 'bg-emerald-600 text-white' : 'bg-stone-900 hover:bg-slate-700 text-gray-300'
                                        }`}
                                    >
                                        📱 {t.qr_tag}
                                    </button>
                                </div>

                                {showQrCode && (
                                    <div className="bg-stone-900 border border-stone-800/80 p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                                        <span className="text-[8px] text-stone-500 font-bold uppercase tracking-wider block">{t.scan_title}</span>
                                        <div className="bg-white p-1.5 rounded-lg">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/map?point=${selectedPoint.properties.id}`)}`}
                                                alt="Waypoint QR Code"
                                                className="w-24 h-24"
                                            />
                                        </div>
                                        <p className="text-[8px] text-stone-500 font-mono select-all truncate max-w-full">
                                            {`${window.location.origin}/map?point=${selectedPoint.properties.id}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status footer */}
                        <div className="p-4 border-t border-stone-800 bg-stone-950/50 flex justify-between items-center text-[10px] text-stone-500">
                            <span>📡 Total: {geoPoints.length} points</span>
                            <span className={mapReady ? 'text-green-500 font-semibold' : 'text-amber-500'}>
                                {mapReady ? '● Connected' : '⏳ Synchronizing'}
                            </span>
                        </div>
                    </div>

                    {/* Right Interactive Leaflet Canvas */}
                    <div className="lg:col-span-9 relative h-[650px]">
                        <div ref={mapRef} className="w-full h-full z-0" />
                    </div>
                </div>

                {/* Footer notes */}
                <p className="mt-3 text-[11px] font-semibold text-stone-500 dark:text-[#A89F98] flex items-center justify-between">
                    <span>💡 Tip: Click on custom shapes to trigger automated spatial metric popups.</span>
                    <span>Centered: Ludhiana, India</span>
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
