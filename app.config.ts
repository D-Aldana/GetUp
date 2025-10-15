import { ConfigPlugin, withAndroidManifest } from '@expo/config-plugins';
import { ConfigContext, ExpoConfig } from 'expo/config';

const withAlarmPermissions: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    const permissions = [
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.WAKE_LOCK',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'android.permission.POST_NOTIFICATIONS',
    ];

    for (const perm of permissions) {
      if (!manifest.manifest['uses-permission']?.some((p) => p.$['android:name'] === perm)) {
        manifest.manifest['uses-permission'] = [
          ...(manifest.manifest['uses-permission'] || []),
          { $: { 'android:name': perm } },
        ];
      }
    }

    const app = manifest.manifest.application?.[0];
    if (!app) return config;

    const receivers = [
      {
        $: {
          'android:name': 'com.expoalarmmodule.receivers.AlarmReceiver',
          'android:enabled': 'true',
          'android:exported': 'true',
        },
      },
      {
        $: {
          'android:name': 'com.expoalarmmodule.receivers.BootReceiver',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
            ],
          },
        ],
      },
      {
        $: {
          'android:name': 'com.expoalarmmodule.receivers.NotificationActionReceiver',
          'android:enabled': 'true',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'DISMISS_ACTION' } },
              { $: { 'android:name': 'SNOOZE_ACTION' } },
            ],
          },
        ],
      },
    ];

    app.receiver = [...(app.receiver || []), ...receivers];

    app.service = [
      ...(app.service || []),
      {
        $: {
          'android:name': 'com.expoalarmmodule.AlarmService',
          'android:foregroundServiceType': 'mediaPlayback',
        },
      },
    ];

    return config;
  });
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'GetUp',
  slug: 'getup',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'getup',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'com.daldana.getup',
    supportsTablet: true,
  },

  android: {
    package: 'com.daldana.getup',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  extra: {
    eas: {
      projectId: 'c58db23b-b7a3-44d0-a096-7f5c70b52841',
    },
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    'expo-alarm-module',
    withAlarmPermissions,
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});