
import React, { useEffect, useRef, useState } from 'react';
import { Ambulance, DispatchJob } from '../types';
import { Loader2, Map as MapIcon, AlertTriangle, Navigation, MapPin, Radar, User } from 'lucide-react';

declare var google: any;

interface GoogleMapFleetProps {
    ambulances: Ambulance[];
    jobs: DispatchJob[];
    center: { lat: number; lng: number };
    zoom: number;
}

// Midnight Commander Map Style
const DARK_MAP_STYLE = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

// Custom SVG Path for a navigation arrow (sharp triangle)
const NAV_ARROW_PATH = "M 0,-15 L 8,5 L 0,2 L -8,5 Z";

export const GoogleMapFleet: React.FC<GoogleMapFleetProps> = ({ ambulances, jobs, center, zoom }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<{ [key: string]: any }>({});
    const infoWindowRef = useRef<any>(null); // Single InfoWindow instance
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    // --- Fallback Logic ---
    const getRelativePosition = (loc: {lat: number, lng: number}) => {
        const scale = 3000; 
        const x = (loc.lng - center.lng) * scale + 50;
        const y = -(loc.lat - center.lat) * scale + 50;
        return { x, y };
    };

    useEffect(() => {
        // Global handler for Google Maps auth failure (invalid key, etc.)
        (window as any).gm_authFailure = () => {
            console.warn("Google Maps Authentication Failure detected. Switching to Vector Mode.");
            setStatus('error');
        };
        return () => { (window as any).gm_authFailure = undefined; };
    }, []);

    // Load Google Maps Script
    useEffect(() => {
        const apiKey = process.env.API_KEY; 
        
        // 1. Check if API is already loaded
        if ((window as any).google && (window as any).google.maps) {
            setStatus('loaded');
            return;
        }

        // 2. Validate Key presence and format (basic check)
        if (!apiKey || apiKey.length < 10) {
            console.warn("Google Maps API Key missing or invalid. Defaulting to Vector Simulation.");
            setStatus('error');
            return;
        }

        // 3. Avoid duplicate script injection
        if (document.getElementById('google-maps-script')) return;

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMapFleet`;
        script.async = true;
        script.defer = true;
        
        // Network error handling for script load
        script.onerror = () => {
            console.error("Failed to load Google Maps script.");
            setStatus('error');
        };
        
        (window as any).initMapFleet = () => setStatus('loaded');
        document.head.appendChild(script);

        // Safety timeout in case callback never fires
        const timeoutId = setTimeout(() => {
            if (status === 'loading') {
                console.warn("Map load timeout. Switching to fallback.");
                setStatus('error');
            }
        }, 8000);
        return () => clearTimeout(timeoutId);
    }, []);

    // Initialize Map
    useEffect(() => {
        if (status === 'loaded' && mapRef.current && !mapInstanceRef.current) {
            try {
                mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                    center,
                    zoom,
                    styles: DARK_MAP_STYLE,
                    disableDefaultUI: true,
                    zoomControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    backgroundColor: '#0f172a',
                });
                
                // Initialize shared InfoWindow
                infoWindowRef.current = new google.maps.InfoWindow({
                    disableAutoPan: true,
                    pixelOffset: new google.maps.Size(0, -10)
                });

            } catch (e) {
                console.error("Map Init Error", e);
                setStatus('error');
            }
        }
    }, [status, center, zoom]);

    // Update Map Center
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo(center);
        }
    }, [center]);

    // Update Markers
    useEffect(() => {
        if (!mapInstanceRef.current || status !== 'loaded') return;

        // --- AMBULANCES ---
        ambulances.forEach(amb => {
            const position = amb.location;
            const iconColor = amb.status === 'Available' ? '#10b981' : amb.status === 'Dispatched' ? '#ef4444' : '#f59e0b';
            
            const iconSvg = {
                path: NAV_ARROW_PATH,
                scale: 1.5,
                fillColor: iconColor,
                fillOpacity: 1,
                strokeWeight: 1.5,
                strokeColor: '#ffffff',
                rotation: amb.heading
            };

            // Content for hover
            const contentString = `
                <div style="padding: 8px; color: #1e293b; font-family: sans-serif;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${amb.plateNumber}</div>
                    <div style="font-size: 12px; color: #64748b;">
                        Speed: <b>${Math.round(amb.speed)} km/h</b><br/>
                        Fuel: <b>${Math.round(amb.fuelLevel)}%</b><br/>
                        Status: <span style="color: ${iconColor}">${amb.status}</span>
                    </div>
                </div>
            `;

            if (markersRef.current[amb.id]) {
                // Update existing
                markersRef.current[amb.id].setPosition(position);
                markersRef.current[amb.id].setIcon(iconSvg);
                
                // Clear old listeners to avoid stacking
                google.maps.event.clearListeners(markersRef.current[amb.id], 'mouseover');
                google.maps.event.clearListeners(markersRef.current[amb.id], 'mouseout');

                markersRef.current[amb.id].addListener("mouseover", () => {
                    infoWindowRef.current.setContent(contentString);
                    infoWindowRef.current.open(mapInstanceRef.current, markersRef.current[amb.id]);
                });
                markersRef.current[amb.id].addListener("mouseout", () => {
                    infoWindowRef.current.close();
                });

            } else {
                // Create new
                const marker = new google.maps.Marker({
                    position,
                    map: mapInstanceRef.current,
                    icon: iconSvg,
                    title: amb.plateNumber
                });

                marker.addListener("mouseover", () => {
                    infoWindowRef.current.setContent(contentString);
                    infoWindowRef.current.open(mapInstanceRef.current, marker);
                });
                marker.addListener("mouseout", () => {
                    infoWindowRef.current.close();
                });

                markersRef.current[amb.id] = marker;
            }
        });

        // --- JOBS ---
        jobs.filter(j => j.status !== 'Completed').forEach(job => {
            const position = job.patientLocation;
             if (markersRef.current[job.id]) {
                markersRef.current[job.id].setPosition(position);
            } else {
                 const marker = new google.maps.Marker({
                    position,
                    map: mapInstanceRef.current,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#3b82f6',
                        fillOpacity: 0.4,
                        strokeColor: '#3b82f6',
                        strokeWeight: 2,
                    },
                });
                
                // Pulse Animation via intervals (simplified)
                let scale = 8;
                let growing = true;
                // Note: Interval management inside useEffect for markers is tricky. 
                // For production, requestAnimationFrame on a global loop is better.
                // Keeping simplistic here for demo.
                const pulseId = setInterval(() => {
                    if (growing) scale += 0.5; else scale -= 0.5;
                    if (scale > 12) growing = false;
                    if (scale < 8) growing = true;
                    const icon = marker.getIcon();
                    if (icon) {
                        icon.scale = scale;
                        marker.setIcon(icon);
                    }
                }, 100);
                
                // Store interval ID on marker object to clear later if needed (not implemented in this simplified cleanup)
                (marker as any)._pulseId = pulseId; 

                markersRef.current[job.id] = marker;
            }
        });

    }, [ambulances, jobs, status]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(markersRef.current).forEach((marker: any) => {
                if (marker._pulseId) clearInterval(marker._pulseId);
                marker.setMap(null);
            });
        };
    }, []);

    // --- Render Fallback Vector Map ---
    if (status === 'error') {
        return (
            <div className="w-full h-full bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" 
                     style={{ 
                         backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', 
                         backgroundSize: '40px 40px' 
                     }}>
                </div>
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[600px] h-[600px] border border-slate-800/50 rounded-full animate-pulse"></div>
                    <div className="w-[400px] h-[400px] border border-slate-800/50 rounded-full absolute"></div>
                </div>

                {ambulances.map(amb => {
                    const pos = getRelativePosition(amb.location);
                    // Basic boundary check to keep markers somewhat within view
                    if (pos.x < -20 || pos.x > 120 || pos.y < -20 || pos.y > 120) return null;

                    return (
                        <div 
                            key={amb.id}
                            className="absolute transition-all duration-1000 ease-linear flex flex-col items-center z-20"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="transition-transform duration-1000" style={{ transform: `rotate(${amb.heading}deg)` }}>
                                <Navigation className={`w-6 h-6 drop-shadow-lg ${amb.status === 'Available' ? 'text-emerald-500 fill-emerald-500' : amb.status === 'Dispatched' ? 'text-red-500 fill-red-500' : 'text-amber-500 fill-amber-500'}`} />
                            </div>
                            <span className="text-[9px] font-mono text-slate-300 bg-slate-900/90 px-1.5 py-0.5 rounded mt-1 border border-slate-700/50 whitespace-nowrap">
                                {amb.plateNumber.slice(-4)}
                            </span>
                        </div>
                    );
                })}

                <div className="absolute bottom-6 left-6 pointer-events-none">
                    <div className="bg-slate-900/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-3 shadow-lg">
                        <div className="relative">
                            <Radar className="w-5 h-5 text-emerald-500 animate-spin-slow" />
                            <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full"></div>
                        </div>
                        <div>
                            <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider leading-none mb-0.5">Vector Simulation</p>
                            <p className="text-[9px] text-slate-500 font-mono">Satellite link offline.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <div ref={mapRef} className="w-full h-full bg-slate-900" />;
};
