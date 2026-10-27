import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Utensils,
  BookOpen,
  Home as HomeIcon,
  Activity,
  Navigation,
  Clock,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resolveCollegeLocation } from '../../lib/geocode';
import { offsetToCoordinates } from '../../lib/geo';
import { PLACES } from '../../data/places';
import StarRating from '../../components/StarRating';
import './CampusMap.css';

// Category color mappings
const CATEGORY_COLORS = {
  food: 'var(--accent)',
  study: 'var(--primary)',
  stay: 'var(--like)',
  fitness: 'var(--success)',
};

// Create custom L.divIcon for College Pin
function createCollegeIcon() {
  return L.divIcon({
    className: 'custom-college-pin-wrapper',
    html: `
      <div class="college-pin-pulse" aria-hidden="true"></div>
      <div class="college-pin-center" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

// Create custom L.divIcon for Place Pins
function createPlaceIcon(category, isSelected) {
  const color = CATEGORY_COLORS[category] || 'var(--primary)';
  const glyphMap = {
    food: '🍜',
    study: '📚',
    stay: '🏠',
    fitness: '⚡',
  };
  const glyph = glyphMap[category] || '📍';

  return L.divIcon({
    className: `custom-place-pin-wrapper ${isSelected ? 'selected' : ''}`,
    html: `
      <div class="place-pin-marker" style="background-color: ${color};" aria-hidden="true">
        <span class="place-pin-glyph">${glyph}</span>
      </div>
    `,
    iconSize: isSelected ? [38, 38] : [30, 30],
    iconAnchor: isSelected ? [19, 19] : [15, 15],
    popupAnchor: [0, -16],
  });
}

// Subcomponent to handle programmatic map actions
function MapController({ center, selectedCoords, triggerRecenter, reducedMotion }) {
  const map = useMap();

  useEffect(() => {
    if (selectedCoords) {
      if (reducedMotion) {
        map.setView([selectedCoords.lat, selectedCoords.lng], 16, { animate: false });
      } else {
        map.panTo([selectedCoords.lat, selectedCoords.lng], { animate: true, duration: 0.8 });
      }
    }
  }, [selectedCoords, map, reducedMotion]);

  useEffect(() => {
    if (triggerRecenter && center) {
      if (reducedMotion) {
        map.setView([center.lat, center.lng], 16, { animate: false });
      } else {
        map.flyTo([center.lat, center.lng], 16, { duration: 1 });
      }
    }
  }, [triggerRecenter, center, map, reducedMotion]);

  return null;
}

export default function CampusMap() {
  const { user } = useAuth();
  const collegeName = user?.college || 'IIT Bombay';

  // Resolved College Location
  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [isResolving, setIsResolving] = useState(true);

  // Filter & Selection State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'walk'
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [recenterCounter, setRecenterCounter] = useState(0);

  // Map Tile Error Handling
  const [tileErrorCount, setTileErrorCount] = useState(0);
  const [tileLayerKey, setTileLayerKey] = useState(0);

  const mapContainerRef = useRef(null);
  const cardRefs = useRef({});

  // Reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  // Resolve College Coordinates on mount or when college changes
  useEffect(() => {
    let isMounted = true;
    setIsResolving(true);
    setSelectedPlaceId(null);
    setRecenterCounter(0);
    setTileErrorCount(0);

    resolveCollegeLocation(collegeName).then((result) => {
      if (isMounted) {
        setResolvedLocation(result);
        setIsResolving(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [collegeName]);

  // Transform places with real lat/lng based on resolved college coordinates
  const calculatedPlaces = useMemo(() => {
    if (!resolvedLocation) return [];
    return PLACES.map((place) => {
      const coords = offsetToCoordinates(
        resolvedLocation.lat,
        resolvedLocation.lng,
        place.offset
      );
      return {
        ...place,
        lat: coords.lat,
        lng: coords.lng,
      };
    });
  }, [resolvedLocation]);

  // Filtered & Sorted Places
  const visiblePlaces = useMemo(() => {
    return calculatedPlaces
      .filter((p) => {
        if (selectedCategory === 'all') return true;
        return p.category === selectedCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'walk') return a.walkMinutes - b.walkMinutes;
        return 0;
      });
  }, [calculatedPlaces, selectedCategory, sortBy]);

  // Selected Place object
  const selectedPlace = useMemo(() => {
    return calculatedPlaces.find((p) => p.id === selectedPlaceId) || null;
  }, [calculatedPlaces, selectedPlaceId]);

  // Handle marker selection and scroll matching card into view
  const handleSelectPlace = useCallback((placeId) => {
    setSelectedPlaceId((prev) => (prev === placeId ? null : placeId));

    if (cardRefs.current[placeId]) {
      cardRefs.current[placeId].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, []);

  // Invalidate map size on window/container resize
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      // Map instance invalidation triggered through event
      window.dispatchEvent(new Event('resize'));
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [resolvedLocation]);

  const tileUrl =
    import.meta.env.VITE_MAP_TILE_URL ||
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution =
    import.meta.env.VITE_MAP_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="campus-map-page">
      {/* 1. MAP VIEWPORT AREA */}
      <div className="map-view-column" ref={mapContainerRef}>
        {isResolving ? (
          <div className="map-loading-skeleton">
            <div className="map-skeleton-spinner" />
            <p>Locating {collegeName} campus...</p>
          </div>
        ) : (
          <div className="map-container-relative">
            {/* Fallback Notice if college was not found and defaulted */}
            {resolvedLocation?.isFallback && (
              <div className="college-fallback-banner" role="status">
                <AlertTriangle size={15} />
                <span>
                  Couldn&apos;t find your college on the map, so we&apos;re
                  showing a sample campus.
                </span>
              </div>
            )}

            {/* Tile Error Warning & Retry Button */}
            {tileErrorCount >= 4 && (
              <div className="tile-error-banner" role="alert">
                <span>Map tiles couldn&apos;t load. Check your connection.</span>
                <button
                  type="button"
                  className="tile-retry-btn"
                  onClick={() => {
                    setTileErrorCount(0);
                    setTileLayerKey((k) => k + 1);
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <MapContainer
              key={`${resolvedLocation.lat},${resolvedLocation.lng}`}
              center={[resolvedLocation.lat, resolvedLocation.lng]}
              zoom={16}
              scrollWheelZoom={true}
              zoomControl={false}
              className="leaflet-map-element"
            >
              <ZoomControl position="topright" />

              <TileLayer
                key={tileLayerKey}
                url={tileUrl}
                attribution={tileAttribution}
                maxZoom={19}
                eventHandlers={{
                  tileerror: () => {
                    setTileErrorCount((prev) => prev + 1);
                  },
                }}
              />

              <MapController
                center={resolvedLocation}
                selectedCoords={
                  selectedPlace
                    ? { lat: selectedPlace.lat, lng: selectedPlace.lng }
                    : null
                }
                triggerRecenter={recenterCounter}
                reducedMotion={prefersReducedMotion}
              />

              {/* College Center Pin */}
              <Marker
                position={[resolvedLocation.lat, resolvedLocation.lng]}
                icon={createCollegeIcon()}
                title={`Your College · ${collegeName}`}
                keyboard={true}
              >
                <Tooltip
                  permanent={true}
                  direction="top"
                  offset={[0, -20]}
                  className="college-tooltip"
                >
                  Your college · {collegeName}
                </Tooltip>
              </Marker>

              {/* Place Pins */}
              {visiblePlaces.map((place) => {
                const isSelected = place.id === selectedPlaceId;
                return (
                  <Marker
                    key={place.id}
                    position={[place.lat, place.lng]}
                    icon={createPlaceIcon(place.category, isSelected)}
                    title={place.name}
                    zIndexOffset={isSelected ? 1000 : 0}
                    keyboard={true}
                    eventHandlers={{
                      click: () => handleSelectPlace(place.id),
                      keydown: (e) => {
                        if (e.originalEvent.key === 'Enter') {
                          handleSelectPlace(place.id);
                        }
                      },
                    }}
                  >
                    {isSelected && (
                      <Popup
                        offset={[0, -14]}
                        closeButton={false}
                        autoPan={false}
                      >
                        <div className="map-pin-popup">
                          <h4 className="popup-place-name">{place.name}</h4>
                          <div className="popup-meta-row">
                            <span
                              className="popup-cat-badge"
                              style={{
                                color: CATEGORY_COLORS[place.category],
                              }}
                            >
                              {place.category}
                            </span>
                            <span className="popup-walk">
                              <Clock size={11} /> {place.walkMinutes} min walk
                            </span>
                          </div>
                          <StarRating
                            rating={place.rating}
                            count={place.reviewCount}
                            size="compact"
                          />
                        </div>
                      </Popup>
                    )}
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Recenter Button styled like zoom buttons */}
            <button
              type="button"
              className="map-recenter-control"
              onClick={() => {
                setSelectedPlaceId(null);
                setRecenterCounter((c) => c + 1);
              }}
              title="Recenter map to college campus"
              aria-label="Recenter map to college campus"
            >
              <Navigation size={18} />
            </button>
          </div>
        )}
      </div>

      {/* 2. SIDE COLUMN / BOTTOM SHEET OF PLACES */}
      <aside className="places-sidebar" aria-label="Campus spots directory">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Campus ke aaspaas</h2>
          <p className="sidebar-caption">Rated by students of {collegeName}</p>

          {/* Category Filter Pills */}
          <div className="category-filter-bar" role="tablist">
            <button
              type="button"
              className={`cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`cat-pill ${selectedCategory === 'food' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('food')}
            >
              <Utensils size={13} />
              <span>Food</span>
            </button>
            <button
              type="button"
              className={`cat-pill ${selectedCategory === 'study' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('study')}
            >
              <BookOpen size={13} />
              <span>Study</span>
            </button>
            <button
              type="button"
              className={`cat-pill ${selectedCategory === 'stay' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('stay')}
            >
              <HomeIcon size={13} />
              <span>Stay</span>
            </button>
            <button
              type="button"
              className={`cat-pill ${selectedCategory === 'fitness' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('fitness')}
            >
              <Activity size={13} />
              <span>Fitness</span>
            </button>
          </div>

          {/* Sort Row */}
          <div className="sidebar-sort-row">
            <span className="places-count-label">
              {visiblePlaces.length} spot{visiblePlaces.length === 1 ? '' : 's'}
            </span>
            <div className="sort-toggle-wrap">
              <button
                type="button"
                className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                Top rated
              </button>
              <button
                type="button"
                className={`sort-btn ${sortBy === 'walk' ? 'active' : ''}`}
                onClick={() => setSortBy('walk')}
              >
                Nearest walk
              </button>
            </div>
          </div>
        </div>

        {/* Places List */}
        <div className="places-list">
          {visiblePlaces.map((place) => {
            const isSelected = place.id === selectedPlaceId;
            const categoryColor = CATEGORY_COLORS[place.category];

            return (
              <div
                key={place.id}
                ref={(el) => (cardRefs.current[place.id] = el)}
                className={`place-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectPlace(place.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectPlace(place.id);
                  }
                }}
                aria-expanded={isSelected}
              >
                {/* Header: Dot + Name + Walk time */}
                <div className="place-card-top">
                  <div className="place-name-cluster">
                    <span
                      className="category-dot"
                      style={{ backgroundColor: categoryColor }}
                      aria-hidden="true"
                    />
                    <h3 className="place-name">{place.name}</h3>
                  </div>
                  <div className="place-walk-time">
                    <Clock size={12} />
                    <span>{place.walkMinutes} min walk</span>
                  </div>
                </div>

                <p className="place-desc">{place.description}</p>

                {/* Rating & Tag Chips */}
                <div className="place-meta-row">
                  <StarRating
                    rating={place.rating}
                    count={place.reviewCount}
                    countLabel="students"
                    size="compact"
                  />
                  <div className="place-tags">
                    {place.tags.map((t) => (
                      <span key={t} className="place-tag-pill">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expanded Student Reviews */}
                {isSelected && (
                  <div className="place-expanded-reviews">
                    <div className="expanded-divider" />
                    <div className="expanded-header">
                      <span>Student reviews</span>
                      <ChevronUp size={16} />
                    </div>
                    <div className="place-reviews-feed">
                      {place.reviews.map((rev, idx) => (
                        <div key={idx} className="place-review-bubble">
                          <div className="review-bubble-top">
                            <span className="reviewer-tag">
                              {rev.reviewer} ({rev.year})
                            </span>
                            <StarRating
                              rating={rev.rating}
                              showNumber={false}
                              size="compact"
                            />
                          </div>
                          <p className="review-bubble-text">&ldquo;{rev.text}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isSelected && (
                  <div className="expand-hint">
                    <span>Click to view reviews &amp; highlight on map</span>
                    <ChevronDown size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
