const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withOptionalARCore(config) {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults;
    
    // 1. Force inject the XML tools namespace required for structural removals
    if (!androidManifest.manifest.$['xmlns:tools']) {
      androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // 2. Locate or create the <application> block
    let mainApplication = androidManifest.manifest.application[0];
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    // Completely wipe out standard com.google.ar.core meta-data tags if present
    mainApplication['meta-data'] = mainApplication['meta-data'].filter(
      (meta) => meta.$['android:name'] !== 'com.google.ar.core'
    );

    // 3. NUCLEAR REMOVAL: Add a uses-feature element that forcibly removes the AR camera flag
    if (!androidManifest.manifest['uses-feature']) {
      androidManifest.manifest['uses-feature'] = [];
    }

    // Remove any regular definitions
    androidManifest.manifest['uses-feature'] = androidManifest.manifest['uses-feature'].filter(
      (feat) => feat.$['android:name'] !== 'android.hardware.camera.ar'
    );

    // Append the removal command block
    androidManifest.manifest['uses-feature'].push({
      $: {
        'android:name': 'android.hardware.camera.ar',
        'tools:node': 'remove' // <-- This tells Android Studio to strictly delete the requirement from the final build
      }
    });

    return config;
  });
};