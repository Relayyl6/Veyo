const { withAndroidManifest } = require('@expo/config-plugins');

const withOptionalARCore = (config) => {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults;
    let mainApplication = androidManifest.manifest.application[0];

    // Initialize meta-data array safely if missing
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    // Strip out third-party hard-coded dependencies to prevent duplicates
    mainApplication['meta-data'] = mainApplication['meta-data'].filter(
      (meta) => meta.$['android:name'] !== 'com.google.ar.core'
    );

    // Inject the fallback flag setting ARCore to optional status
    mainApplication['meta-data'].push({
      $: {
        'android:name': 'com.google.ar.core',
        'android:value': 'optional', 
      },
    });

    // Initialize hardware use-feature parameters safely
    if (!androidManifest.manifest['uses-feature']) {
      androidManifest.manifest['uses-feature'] = [];
    }

    androidManifest.manifest['uses-feature'] = androidManifest.manifest['uses-feature'].filter(
      (feat) => feat.$['android:name'] !== 'android.hardware.camera.ar'
    );

    // Bypass requirement constraints during Google OS package validation runs
    androidManifest.manifest['uses-feature'].push({
      $: {
        'android:name': 'android.hardware.camera.ar',
        'android:required': 'false', 
      },
    });

    return config;
  });
};

// Expose the module using commonJS standards
module.exports = withOptionalARCore;