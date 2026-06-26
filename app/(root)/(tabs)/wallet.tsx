import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Map, Camera } from "@maplibre/maplibre-react-native";
import type { CameraRef } from "@maplibre/maplibre-react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type InteractionConfig = {
  dragPan: boolean;
  touchZoom: boolean;
  doubleTapZoom: boolean;
  doubleTapHoldZoom: boolean;
  touchRotate: boolean;
  touchPitch: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

const DEFAULT_INTERACTIONS: InteractionConfig = {
  dragPan: true,
  touchZoom: true,
  doubleTapZoom: true,
  doubleTapHoldZoom: false,
  touchRotate: true,
  touchPitch: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const cameraRef = useRef<CameraRef>(null);
  const [interactions, setInteractions] = useState<InteractionConfig>(DEFAULT_INTERACTIONS);
  const [showControls, setShowControls] = useState(false);

  // Toggle a single interaction on/off
  const toggle = (key: keyof InteractionConfig) => {
    setInteractions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetView = () => {
    // setStop lives on CameraRef, not MapRef.
    // The Camera component owns all camera movement methods.
    cameraRef.current?.setStop({
      center: [0, 20],
      zoom: 2,
      bearing: 0,
      pitch: 0,
      duration: 800,
      easing: "ease",
    });
  };

  return (
    <View style={styles.container}>
      {/* ── Map ── */}
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE}
        // ── Interaction props (v11 API) ──────────────────────────────────
        dragPan={interactions.dragPan}
        touchZoom={interactions.touchZoom}
        doubleTapZoom={interactions.doubleTapZoom}
        doubleTapHoldZoom={interactions.doubleTapHoldZoom}
        touchRotate={interactions.touchRotate}
        touchPitch={interactions.touchPitch}
        // ── Ornaments (v11 API) ──────────────────────────────────────────
        // Boolean props enable/disable; position accepts { top/bottom, left/right }
        attribution={true}
        attributionPosition={{ bottom: 8, right: 8 }}
        logo={false}
        compass={true}
        compassPosition={{ top: 16, right: 16 }}
      >
        {/* ── Camera ── */}
        {/*
          In v11 Camera props were renamed to match MapLibre GL JS:
            centerCoordinate → center
            zoomLevel        → zoom
            heading          → bearing
            animationDuration→ duration
            animationMode    → easing  ("flyTo" → "fly", "easeTo" → "ease", etc.)
            defaultSettings  → initialViewState
        */}
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [0, 20],     // [longitude, latitude]
            zoom: 2,
            bearing: 0,
            pitch: 0,
          }}
        />
      </Map>

      {/* ── HUD: Reset button ── */}
      <TouchableOpacity style={styles.resetBtn} onPress={resetView} activeOpacity={0.8}>
        <Text style={styles.resetLabel}>⌂ Reset View</Text>
      </TouchableOpacity>

      {/* ── HUD: Controls toggle ── */}
      <TouchableOpacity
        style={styles.controlsToggle}
        onPress={() => setShowControls((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.resetLabel}>{showControls ? "✕ Hide" : "⚙ Controls"}</Text>
      </TouchableOpacity>

      {/* ── Interaction Controls Panel ── */}
      {showControls && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Interaction Toggles</Text>
          {(Object.keys(interactions) as (keyof InteractionConfig)[]).map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.row}
              onPress={() => toggle(key)}
              activeOpacity={0.7}
            >
              <View style={[styles.pill, interactions[key] ? styles.pillOn : styles.pillOff]}>
                <Text style={styles.pillText}>{interactions[key] ? "ON" : "OFF"}</Text>
              </View>
              <Text style={styles.rowLabel}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  map: {
    flex: 1,
  },
  resetBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(15,15,15,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  controlsToggle: {
    position: "absolute",
    top: 60,
    left: 16,
    backgroundColor: "rgba(15,15,15,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  resetLabel: {
    color: "#f0f0f0",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  panel: {
    position: "absolute",
    top: 108,
    left: 16,
    backgroundColor: "rgba(10,10,10,0.92)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 14,
    minWidth: 220,
  },
  panelTitle: {
    color: "#888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  pill: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    minWidth: 38,
    alignItems: "center",
  },
  pillOn: {
    backgroundColor: "#22c55e22",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  pillOff: {
    backgroundColor: "#ef444422",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  pillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#f0f0f0",
    letterSpacing: 0.5,
  },
  rowLabel: {
    color: "#d0d0d0",
    fontSize: 13,
    fontFamily: "monospace",
  },
});