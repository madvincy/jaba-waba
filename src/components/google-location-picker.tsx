"use client";

import { useEffect, useRef, useState } from "react";

type MapLocation = {
  address: string;
  lat: number;
  lng: number;
};

const DEFAULT_CENTER = { lat: -1.3348, lng: 36.7419 };
const DEFAULT_ZOOM = 13;

function loadGoogleMaps(apiKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google Maps can only be loaded in the browser."));
      return;
    }

    const win = window as any;
    if (win.google?.maps) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

export type GoogleLocation = MapLocation;

type GoogleLocationPickerProps = {
  apiKey: string;
  value: GoogleLocation | null;
  onChange: (location: GoogleLocation) => void;
};

export function GoogleLocationPicker({ apiKey, value, onChange }: GoogleLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const searchInput = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("Search or click the map to set delivery location.");
  const [error, setError] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    let map: any;
    let marker: any;
    let autocomplete: any;
    let geocoder: any;
    let listenerClick: any;

    async function initialize() {
      try {
        setError(null);
        if (!apiKey) {
          setError("Google Maps API key is required. Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
          return;
        }
        await loadGoogleMaps(apiKey);
        const win = window as any;
        const google = win.google;
        if (!searchInput.current || !mapContainer.current) {
          setError("Map container failed to initialize.");
          return;
        }

        const center = value ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER;
        map = new google.maps.Map(mapContainer.current, {
          center,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        marker = new google.maps.Marker({
          map,
          position: center,
          draggable: false,
        });

        geocoder = new google.maps.Geocoder();

        autocomplete = new google.maps.places.Autocomplete(searchInput.current, {
          fields: ["formatted_address", "geometry"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location || !place.formatted_address) {
            setStatus("Please select a valid suggestion from the list.");
            return;
          }
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address;
          marker.setPosition({ lat, lng });
          map.panTo({ lat, lng });
          if (searchInput.current) {
            searchInput.current.value = address;
          }
          setStatus("Location selected from search.");
          onChange({ address, lat, lng });
        });

        listenerClick = map.addListener("click", (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          geocoder.geocode({ location: { lat, lng } }, (results: any, statusText: string) => {
            if (statusText !== "OK" || !results || !results[0]) {
              setStatus("Clicked location selected, but address lookup failed.");
              return;
            }
            const address = results[0].formatted_address;
            marker.setPosition({ lat, lng });
            map.panTo({ lat, lng });
            setStatus("Location selected from map.");
            if (searchInput.current) searchInput.current.value = address;
            onChange({ address, lat, lng });
          });
        });

        setMapInitialized(true);
      } catch (err) {
        setError((err as Error).message || "Google Maps failed to load.");
      }
    }

    initialize();

    return () => {
      if (listenerClick && listenerClick.remove) listenerClick.remove();
    };
  }, [apiKey, onChange, value]);

  useEffect(() => {
    if (value && mapContainer.current) {
      const win = window as any;
      const google = win.google;
      if (google?.maps && mapContainer.current) {
        const map = new google.maps.Map(mapContainer.current, {
          center: { lat: value.lat, lng: value.lng },
          zoom: DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        new google.maps.Marker({ map, position: { lat: value.lat, lng: value.lng } });
      }
    }
  }, [value]);

  useEffect(() => {
    if (!mapInitialized) return;
    const timeout = window.setTimeout(() => {
      const errContainer = document.querySelector(".gm-err-container");
      if (errContainer) {
        setError(
          "Google Maps failed to load. Billing may not be enabled for this API key."
        );
      }
    }, 1500);
    return () => window.clearTimeout(timeout);
  }, [mapInitialized]);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="location-search" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Search address or click on the map
        </label>
        <input
          id="location-search"
          ref={searchInput}
          type="text"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          placeholder="Enter delivery address"
        />
      </div>
      <div className="h-72 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
        <div ref={mapContainer} className="h-full w-full" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
        {error ? <p className="text-destructive">{error}</p> : <p>{status}</p>}
      </div>
    </div>
  );
}
